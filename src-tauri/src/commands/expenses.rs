use serde::{Deserialize, Serialize};
use sqlx::Row;
use tauri::State;
use crate::db::DbPool;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Expense {
    pub id: String,
    pub title: String,
    pub archived: bool,
    pub note: String,
    pub amount: f64,
    pub paid: bool,
    pub date: i64,
    pub issuer: String,
    pub phone_number: String,
    pub items: Vec<String>,
    pub tags: Vec<String>,
    pub operators_ids: Vec<String>,
}

#[tauri::command]
pub async fn get_expenses(db: State<'_, DbPool>) -> Result<Vec<Expense>, String> {
    let rows = sqlx::query(
        "SELECT data FROM records WHERE store = 'expenses' ORDER BY created_at DESC"
    )
    .fetch_all(&db.0)
    .await
    .map_err(|e| e.to_string())?;

    rows
        .iter()
        .map(|r| {
            let data: String = r.try_get("data").map_err(|e| e.to_string())?;
            serde_json::from_str::<Expense>(&data).map_err(|e| e.to_string())
        })
        .collect()
}

#[tauri::command]
pub async fn save_expense(db: State<'_, DbPool>, expense: Expense) -> Result<(), String> {
    let data = serde_json::to_string(&expense).map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().timestamp_millis();

    sqlx::query(
        "INSERT OR REPLACE INTO records (id, store, data, created_at, updated_at)
         VALUES (?, 'expenses', ?, COALESCE((SELECT created_at FROM records WHERE id = ?), ?), ?)"
    )
    .bind(&expense.id)
    .bind(data)
    .bind(&expense.id)
    .bind(now)
    .bind(now)
    .execute(&db.0)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn delete_expense(db: State<'_, DbPool>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM records WHERE id = ? AND store = 'expenses'")
        .bind(id)
        .execute(&db.0)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
