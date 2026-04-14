use serde::{Deserialize, Serialize};
use tauri::State;
use crate::db::DbPool;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Appointment {
    pub id: String,
    pub archived: bool,
    pub operators_ids: Vec<String>,
    pub patient_id: Option<String>,
    pub pre_op_notes: String,
    pub post_op_notes: String,
    pub prescriptions: Vec<String>,
    pub price: f64,
    pub paid: f64,
    pub payment_method: String,
    pub imgs: Vec<String>,
    pub date: i64,
    pub is_done: bool,
}

#[tauri::command]
pub async fn get_appointments(db: State<'_, DbPool>) -> Result<Vec<Appointment>, String> {
    let rows = sqlx::query!(
        "SELECT data FROM records WHERE store = 'appointments' ORDER BY created_at DESC"
    )
    .fetch_all(&db.0)
    .await
    .map_err(|e| e.to_string())?;

    rows.iter()
        .map(|r| serde_json::from_str::<Appointment>(&r.data).map_err(|e| e.to_string()))
        .collect()
}

#[tauri::command]
pub async fn save_appointment(
    db: State<'_, DbPool>,
    appointment: Appointment,
) -> Result<(), String> {
    let data = serde_json::to_string(&appointment).map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().timestamp_millis();

    sqlx::query!(
        "INSERT OR REPLACE INTO records (id, store, data, created_at, updated_at)
         VALUES (?, 'appointments', ?, COALESCE((SELECT created_at FROM records WHERE id = ?), ?), ?)",
        appointment.id,
        data,
        appointment.id,
        now,
        now
    )
    .execute(&db.0)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn delete_appointment(db: State<'_, DbPool>, id: String) -> Result<(), String> {
    sqlx::query!("DELETE FROM records WHERE id = ? AND store = 'appointments'", id)
        .execute(&db.0)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn save_appointment_photo(
    app: tauri::AppHandle,
    appointment_id: String,
    source_path: String,
) -> Result<String, String> {
    use tauri_plugin_fs::FsExt;
    use std::path::Path;

    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    let dest_dir = app_data.join("photos").join(&appointment_id);
    std::fs::create_dir_all(&dest_dir).map_err(|e| e.to_string())?;

    let source = Path::new(&source_path);
    let file_name = source
        .file_name()
        .ok_or("Invalid source path")?
        .to_string_lossy()
        .to_string();

    let dest = dest_dir.join(&file_name);
    std::fs::copy(source, &dest).map_err(|e| e.to_string())?;

    // Return relative path
    Ok(format!("{}/{}", appointment_id, file_name))
}

#[tauri::command]
pub async fn delete_appointment_photo(
    app: tauri::AppHandle,
    relative_path: String,
) -> Result<(), String> {
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    let full_path = app_data.join("photos").join(&relative_path);
    if full_path.exists() {
        std::fs::remove_file(full_path).map_err(|e| e.to_string())?;
    }
    Ok(())
}
