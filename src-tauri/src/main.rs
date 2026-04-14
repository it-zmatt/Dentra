// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;

use db::DbPool;
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use std::str::FromStr;

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            let app_data = app.path().app_data_dir().expect("Failed to get app data dir");
            std::fs::create_dir_all(&app_data).expect("Failed to create app data dir");

            let db_path = app_data.join("data.db");
            let db_url = format!("sqlite://{}?mode=rwc", db_path.to_string_lossy());

            let pool = tauri::async_runtime::block_on(async {
                let options = SqliteConnectOptions::from_str(&db_url)
                    .expect("Failed to parse DB URL")
                    .create_if_missing(true);

                let pool = SqlitePoolOptions::new()
                    .max_connections(5)
                    .connect_with(options)
                    .await
                    .expect("Failed to connect to database");

                sqlx::migrate!("./migrations")
                    .run(&pool)
                    .await
                    .expect("Failed to run migrations");

                pool
            });

            app.manage(DbPool(pool));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Patients
            commands::patients::get_patients,
            commands::patients::save_patient,
            commands::patients::delete_patient,
            // Appointments
            commands::appointments::get_appointments,
            commands::appointments::save_appointment,
            commands::appointments::delete_appointment,
            commands::appointments::save_appointment_photo,
            commands::appointments::delete_appointment_photo,
            // Doctors
            commands::doctors::get_doctors,
            commands::doctors::save_doctor,
            commands::doctors::delete_doctor,
            // Lab work
            commands::labwork::get_labworks,
            commands::labwork::save_labwork,
            commands::labwork::delete_labwork,
            // Expenses
            commands::expenses::get_expenses,
            commands::expenses::save_expense,
            commands::expenses::delete_expense,
            // Settings
            commands::settings::get_global_settings,
            commands::settings::save_global_settings,
            commands::settings::get_local_settings,
            commands::settings::save_local_settings,
            // Users
            commands::users::get_users,
            commands::users::create_user,
            commands::users::reset_user_password,
            commands::users::delete_user,
            commands::users::login,
            // Backup
            commands::backup::export_backup,
            commands::backup::import_backup,
            // License
            commands::license::get_machine_id,
            commands::license::validate_license_key,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
