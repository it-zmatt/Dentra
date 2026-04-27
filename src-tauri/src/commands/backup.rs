use tauri::Manager;

#[tauri::command]
pub async fn export_backup(app: tauri::AppHandle, dest_folder: String) -> Result<String, String> {
    use std::io::Write;
    use zip::write::SimpleFileOptions;
    use chrono::Local;

    let app_data = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_data.join("data.db");
    let photos_dir = app_data.join("photos");

    let date_str = Local::now().format("%Y-%m-%d").to_string();
    let zip_name = format!("dental_backup_{}.zip", date_str);
    let zip_path = std::path::Path::new(&dest_folder).join(&zip_name);

    let file = std::fs::File::create(&zip_path).map_err(|e| e.to_string())?;
    let mut zip = zip::ZipWriter::new(file);
    let options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);

    // Add data.db
    if db_path.exists() {
        zip.start_file("data.db", options).map_err(|e| e.to_string())?;
        let db_bytes = std::fs::read(&db_path).map_err(|e| e.to_string())?;
        zip.write_all(&db_bytes).map_err(|e| e.to_string())?;
    }

    // Add photos directory recursively
    if photos_dir.exists() {
        add_dir_to_zip(&mut zip, &photos_dir, &photos_dir, options)?;
    }

    zip.finish().map_err(|e| e.to_string())?;

    Ok(zip_path.to_string_lossy().to_string())
}

fn add_dir_to_zip(
    zip: &mut zip::ZipWriter<std::fs::File>,
    base: &std::path::Path,
    dir: &std::path::Path,
    options: zip::write::SimpleFileOptions,
) -> Result<(), String> {
    use std::io::Write;

    for entry in std::fs::read_dir(dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        let rel = path.strip_prefix(base).map_err(|e| e.to_string())?;
        let zip_path = format!("photos/{}", rel.to_string_lossy().replace('\\', "/"));

        if path.is_dir() {
            add_dir_to_zip(zip, base, &path, options)?;
        } else {
            zip.start_file(&zip_path, options).map_err(|e| e.to_string())?;
            let bytes = std::fs::read(&path).map_err(|e| e.to_string())?;
            zip.write_all(&bytes).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn import_backup(app: tauri::AppHandle, zip_path: String) -> Result<(), String> {
    use std::io::Read;

    let app_data = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let photos_dir = app_data.join("photos");

    let file = std::fs::File::open(&zip_path).map_err(|e| e.to_string())?;
    let mut archive = zip::ZipArchive::new(file).map_err(|e| e.to_string())?;

    for i in 0..archive.len() {
        let mut entry = archive.by_index(i).map_err(|e| e.to_string())?;
        let name = entry.name().to_string();

        let dest = if name == "data.db" {
            app_data.join("data.db")
        } else if let Some(rel) = name.strip_prefix("photos/") {
            photos_dir.join(rel)
        } else {
            continue;
        };

        if let Some(parent) = dest.parent() {
            std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }

        let mut out = std::fs::File::create(&dest).map_err(|e| e.to_string())?;
        let mut buf = Vec::new();
        entry.read_to_end(&mut buf).map_err(|e| e.to_string())?;
        std::io::Write::write_all(&mut out, &buf).map_err(|e| e.to_string())?;
    }

    Ok(())
}
