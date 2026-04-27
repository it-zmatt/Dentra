use serde::{Deserialize, Serialize};
use sqlx::Row;
use tauri::State;
use crate::db::DbPool;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Doctor {
    pub id: String,
    pub title: String,
    pub archived: bool,
    pub duty_days: Vec<String>,
    pub email: String,
    pub lock_to_user_ids: Vec<String>,
}

#[tauri::command]
pub async fn get_doctors(db: State<'_, DbPool>) -> Result<Vec<Doctor>, String> {
    let rows = sqlx::query(
        "SELECT data FROM records WHERE store = 'doctors' ORDER BY created_at DESC"
    )
    .fetch_all(&db.0)
    .await
    .map_err(|e| e.to_string())?;

    rows
        .iter()
        .map(|r| {
            let data: String = r.try_get("data").map_err(|e| e.to_string())?;
            serde_json::from_str::<Doctor>(&data).map_err(|e| e.to_string())
        })
        .collect()
}

#[tauri::command]
pub async fn save_doctor(db: State<'_, DbPool>, doctor: Doctor) -> Result<(), String> {
    let data = serde_json::to_string(&doctor).map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().timestamp_millis();

    sqlx::query(
        "INSERT OR REPLACE INTO records (id, store, data, created_at, updated_at)
         VALUES (?, 'doctors', ?, COALESCE((SELECT created_at FROM records WHERE id = ?), ?), ?)"
    )
    .bind(&doctor.id)
    .bind(data)
    .bind(&doctor.id)
    .bind(now)
    .bind(now)
    .execute(&db.0)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn delete_doctor(db: State<'_, DbPool>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM records WHERE id = ? AND store = 'doctors'")
        .bind(id)
        .execute(&db.0)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
