use serde::{Deserialize, Serialize};
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
}

fn hash_password(password: &str) -> String {
    use sha2::{Sha256, Digest};
    let mut hasher = Sha256::new();
    hasher.update(password.as_bytes());
    format!("{:x}", hasher.finalize())
}

#[tauri::command]
pub async fn get_users(db: State<'_, DbPool>) -> Result<Vec<User>, String> {
    let rows = sqlx::query!(
        "SELECT id, email, is_admin, name, created_at FROM users ORDER BY created_at ASC"
    )
    .fetch_all(&db.0)
    .await
    .map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|r| User {
        id: r.id,
        email: r.email,
        is_admin: r.is_admin != 0,
        name: r.name.unwrap_or_default(),
        created_at: r.created_at.unwrap_or(0),
    }).collect())
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

    sqlx::query!(
        "INSERT INTO users (id, email, password_hash, is_admin, name, created_at)
         VALUES (?, ?, ?, ?, ?, ?)",
        id,
        email,
        password_hash,
        is_admin_int,
        name,
        now
    )
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
    sqlx::query!("UPDATE users SET password_hash = ? WHERE id = ?", hash, user_id)
        .execute(&db.0)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn delete_user(db: State<'_, DbPool>, id: String) -> Result<(), String> {
    sqlx::query!("DELETE FROM users WHERE id = ?", id)
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
    let row = sqlx::query!(
        "SELECT id, email, is_admin, name, created_at FROM users
         WHERE email = ? AND password_hash = ?",
        email,
        hash
    )
    .fetch_optional(&db.0)
    .await
    .map_err(|e| e.to_string())?
    .ok_or_else(|| "Invalid credentials".to_string())?;

    Ok(User {
        id: row.id,
        email: row.email,
        is_admin: row.is_admin != 0,
        name: row.name.unwrap_or_default(),
        created_at: row.created_at.unwrap_or(0),
    })
}
