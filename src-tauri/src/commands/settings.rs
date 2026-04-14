use serde::{Deserialize, Serialize};
use tauri::State;
use crate::db::DbPool;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GlobalSettings {
    pub currency: String,
    pub clinic_name: String,
    pub clinic_phone: String,
    pub clinic_address: String,
    pub doctor_speciality: String,
    pub prescription_footer: String,
    pub start_day_of_wk: String,
    pub permissions: Vec<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalSettings {
    pub selected_locale: String,
    pub date_format: String,
    pub selected_theme: String,
    pub license_key: String,
    pub license_machine_id: String,
    pub license_valid: bool,
    pub install_date: String,
}

async fn get_setting(db: &sqlx::SqlitePool, table: &str, key: &str) -> Result<String, String> {
    let query = format!("SELECT value FROM {} WHERE key = ?", table);
    sqlx::query_scalar::<_, String>(&query)
        .bind(key)
        .fetch_optional(db)
        .await
        .map_err(|e| e.to_string())
        .map(|v| v.unwrap_or_default())
}

async fn set_setting(db: &sqlx::SqlitePool, table: &str, key: &str, value: &str) -> Result<(), String> {
    let query = format!("INSERT OR REPLACE INTO {} (key, value) VALUES (?, ?)", table);
    sqlx::query(&query)
        .bind(key)
        .bind(value)
        .execute(db)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_global_settings(db: State<'_, DbPool>) -> Result<GlobalSettings, String> {
    let pool = &db.0;
    Ok(GlobalSettings {
        currency: get_setting(pool, "settings", "currency").await?,
        clinic_name: get_setting(pool, "settings", "clinic_name").await?,
        clinic_phone: get_setting(pool, "settings", "clinic_phone").await?,
        clinic_address: get_setting(pool, "settings", "clinic_address").await?,
        doctor_speciality: get_setting(pool, "settings", "doctor_speciality").await?,
        prescription_footer: get_setting(pool, "settings", "prescription_footer").await?,
        start_day_of_wk: get_setting(pool, "settings", "start_day_of_wk").await?,
        permissions: serde_json::from_str(
            &get_setting(pool, "settings", "permissions").await?
        ).unwrap_or_else(|_| vec![false; 6]),
    })
}

#[tauri::command]
pub async fn save_global_settings(
    db: State<'_, DbPool>,
    settings: GlobalSettings,
) -> Result<(), String> {
    let pool = &db.0;
    set_setting(pool, "settings", "currency", &settings.currency).await?;
    set_setting(pool, "settings", "clinic_name", &settings.clinic_name).await?;
    set_setting(pool, "settings", "clinic_phone", &settings.clinic_phone).await?;
    set_setting(pool, "settings", "clinic_address", &settings.clinic_address).await?;
    set_setting(pool, "settings", "doctor_speciality", &settings.doctor_speciality).await?;
    set_setting(pool, "settings", "prescription_footer", &settings.prescription_footer).await?;
    set_setting(pool, "settings", "start_day_of_wk", &settings.start_day_of_wk).await?;
    let perms = serde_json::to_string(&settings.permissions).map_err(|e| e.to_string())?;
    set_setting(pool, "settings", "permissions", &perms).await?;
    Ok(())
}

#[tauri::command]
pub async fn get_local_settings(db: State<'_, DbPool>) -> Result<LocalSettings, String> {
    let pool = &db.0;
    let license_valid = get_setting(pool, "local_settings", "license_valid").await? == "true";
    Ok(LocalSettings {
        selected_locale: get_setting(pool, "local_settings", "selected_locale").await?,
        date_format: get_setting(pool, "local_settings", "date_format").await?,
        selected_theme: get_setting(pool, "local_settings", "selected_theme").await?,
        license_key: get_setting(pool, "local_settings", "license_key").await?,
        license_machine_id: get_setting(pool, "local_settings", "license_machine_id").await?,
        license_valid,
        install_date: get_setting(pool, "local_settings", "install_date").await?,
    })
}

#[tauri::command]
pub async fn save_local_settings(
    db: State<'_, DbPool>,
    settings: LocalSettings,
) -> Result<(), String> {
    let pool = &db.0;
    set_setting(pool, "local_settings", "selected_locale", &settings.selected_locale).await?;
    set_setting(pool, "local_settings", "date_format", &settings.date_format).await?;
    set_setting(pool, "local_settings", "selected_theme", &settings.selected_theme).await?;
    set_setting(pool, "local_settings", "license_key", &settings.license_key).await?;
    set_setting(pool, "local_settings", "license_machine_id", &settings.license_machine_id).await?;
    set_setting(pool, "local_settings", "license_valid", if settings.license_valid { "true" } else { "false" }).await?;
    set_setting(pool, "local_settings", "install_date", &settings.install_date).await?;
    Ok(())
}
