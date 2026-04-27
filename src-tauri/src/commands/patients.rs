use serde::{Deserialize, Serialize};
use sqlx::Row;
use tauri::State;
use crate::db::DbPool;

#[derive(Debug, Serialize, Deserialize)]
pub struct Patient {
    pub id: String,
    pub title: String,
    pub archived: bool,
    pub birth: i64,
    pub gender: i64,
    pub phone: String,
    pub email: String,
    pub address: String,
    pub tags: Vec<String>,
    pub notes: String,
    pub teeth: serde_json::Value,
}

#[tauri::command]
pub async fn get_patients(db: State<'_, DbPool>) -> Result<Vec<Patient>, String> {
    let rows = sqlx::query(
        "SELECT data FROM records WHERE store = 'patients' ORDER BY created_at DESC"
    )
    .fetch_all(&db.0)
    .await
    .map_err(|e| e.to_string())?;

    rows
        .iter()
        .map(|r| {
            let data: String = r.try_get("data").map_err(|e| e.to_string())?;
            serde_json::from_str::<Patient>(&data).map_err(|e| e.to_string())
        })
        .collect()
}

#[tauri::command]
pub async fn save_patient(db: State<'_, DbPool>, patient: Patient) -> Result<(), String> {
    let data = serde_json::to_string(&patient).map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().timestamp_millis();

    sqlx::query(
        "INSERT OR REPLACE INTO records (id, store, data, created_at, updated_at)
         VALUES (?, 'patients', ?, COALESCE((SELECT created_at FROM records WHERE id = ?), ?), ?)"
    )
    .bind(&patient.id)
    .bind(data)
    .bind(&patient.id)
    .bind(now)
    .bind(now)
    .execute(&db.0)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn delete_patient(db: State<'_, DbPool>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM records WHERE id = ? AND store = 'patients'")
        .bind(id)
        .execute(&db.0)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
