use serde::{Deserialize, Serialize};
use sqlx::Row;
use tauri::State;
use crate::db::DbPool;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub id: String,
    pub email: String,
    pub is_admin: bool,
    pub name: String,
    pub created_at: i64,
    pub permissions: Vec<bool>,
}

fn default_permissions() -> Vec<bool> {
    vec![false; 6]
}

fn parse_permissions_json(raw: Option<String>) -> Vec<bool> {
    let Some(raw_json) = raw else {
        return default_permissions();
    };

    let parsed: Result<Vec<bool>, _> = serde_json::from_str(&raw_json);
    match parsed {
        Ok(perms) if perms.len() == 6 => perms,
        _ => default_permissions(),
    }
}

fn hash_password(password: &str) -> String {
    use sha2::{Sha256, Digest};
    let mut hasher = Sha256::new();
    hasher.update(password.as_bytes());
    format!("{:x}", hasher.finalize())
}

#[tauri::command]
pub async fn get_users(db: State<'_, DbPool>) -> Result<Vec<User>, String> {
    let rows = sqlx::query(
        "SELECT id, email, is_admin, name, created_at, permissions_json
         FROM users
         ORDER BY created_at ASC"
    )
    .fetch_all(&db.0)
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows
        .into_iter()
        .map(|r| {
            let id: String = r.try_get("id").map_err(|e| e.to_string())?;
            let email: String = r.try_get("email").map_err(|e| e.to_string())?;
            let is_admin: i64 = r.try_get("is_admin").map_err(|e| e.to_string())?;
            let name: Option<String> = r.try_get("name").map_err(|e| e.to_string())?;
            let created_at: Option<i64> = r.try_get("created_at").map_err(|e| e.to_string())?;
            let permissions_json: Option<String> = r.try_get("permissions_json").ok();
            Ok(User {
                id,
                email,
                is_admin: is_admin != 0,
                name: name.unwrap_or_default(),
                created_at: created_at.unwrap_or(0),
                permissions: parse_permissions_json(permissions_json),
            })
        })
        .collect::<Result<Vec<_>, String>>()?)
}

#[tauri::command]
pub async fn create_user(
    db: State<'_, DbPool>,
    email: String,
    password: String,
    name: String,
    is_admin: bool,
) -> Result<User, String> {
    let id = crate::commands::license::generate_id();
    let password_hash = hash_password(&password);
    let now = chrono::Utc::now().timestamp_millis();
    let is_admin_int = if is_admin { 1 } else { 0 };
    let permissions_json = serde_json::to_string(&default_permissions()).map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT INTO users (id, email, password_hash, is_admin, name, created_at, permissions_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&email)
    .bind(password_hash)
    .bind(is_admin_int)
    .bind(&name)
    .bind(now)
    .bind(permissions_json)
    .execute(&db.0)
    .await
    .map_err(|e| e.to_string())?;

    Ok(User { id, email, is_admin, name, created_at: now })
}

#[tauri::command]
pub async fn reset_user_password(
    db: State<'_, DbPool>,
    user_id: String,
    new_password: String,
) -> Result<(), String> {
    let hash = hash_password(&new_password);
    sqlx::query("UPDATE users SET password_hash = ? WHERE id = ?")
        .bind(hash)
        .bind(user_id)
        .execute(&db.0)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn delete_user(db: State<'_, DbPool>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM users WHERE id = ?")
        .bind(id)
        .execute(&db.0)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn login(
    db: State<'_, DbPool>,
    email: String,
    password: String,
) -> Result<User, String> {
    let hash = hash_password(&password);
    let row = sqlx::query(
        "SELECT id, email, is_admin, name, created_at, permissions_json FROM users
         WHERE email = ? AND password_hash = ?"
    )
    .bind(email)
    .bind(hash)
    .fetch_optional(&db.0)
    .await
    .map_err(|e| e.to_string())?
    .ok_or_else(|| "Invalid credentials".to_string())?;

    let id: String = row.try_get("id").map_err(|e| e.to_string())?;
    let email: String = row.try_get("email").map_err(|e| e.to_string())?;
    let is_admin: i64 = row.try_get("is_admin").map_err(|e| e.to_string())?;
    let name: Option<String> = row.try_get("name").map_err(|e| e.to_string())?;
    let created_at: Option<i64> = row.try_get("created_at").map_err(|e| e.to_string())?;
    let permissions_json: Option<String> = row.try_get("permissions_json").ok();

    Ok(User {
        id,
        email,
        is_admin: is_admin != 0,
        name: name.unwrap_or_default(),
        created_at: created_at.unwrap_or(0),
        permissions: parse_permissions_json(permissions_json),
    })
}
