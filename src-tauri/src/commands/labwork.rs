use serde::{Deserialize, Serialize};
use tauri::State;
use crate::db::DbPool;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Labwork {
    pub id: String,
    pub title: String,
    pub archived: bool,
    pub operators_ids: Vec<String>,
    pub patient_id: Option<String>,
    pub note: String,
    pub paid: bool,
    pub price: f64,
    pub date: i64,
    pub lab: String,
    pub phone_number: String,
}

#[tauri::command]
pub async fn get_labworks(db: State<'_, DbPool>) -> Result<Vec<Labwork>, String> {
    let rows = sqlx::query!(
        "SELECT data FROM records WHERE store = 'labworks' ORDER BY created_at DESC"
    )
    .fetch_all(&db.0)
    .await
    .map_err(|e| e.to_string())?;

    rows.iter()
        .map(|r| serde_json::from_str::<Labwork>(&r.data).map_err(|e| e.to_string()))
        .collect()
}

#[tauri::command]
pub async fn save_labwork(db: State<'_, DbPool>, labwork: Labwork) -> Result<(), String> {
    let data = serde_json::to_string(&labwork).map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().timestamp_millis();

    sqlx::query!(
        "INSERT OR REPLACE INTO records (id, store, data, created_at, updated_at)
         VALUES (?, 'labworks', ?, COALESCE((SELECT created_at FROM records WHERE id = ?), ?), ?)",
        labwork.id,
        data,
        labwork.id,
        now,
        now
    )
    .execute(&db.0)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn delete_labwork(db: State<'_, DbPool>, id: String) -> Result<(), String> {
    sqlx::query!("DELETE FROM records WHERE id = ? AND store = 'labworks'", id)
        .execute(&db.0)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
