const DEVELOPER_SECRET: &str = "CHANGE_THIS_BEFORE_SHIPPING";

pub fn generate_id() -> String {
    use rand::Rng;
    const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let mut rng = rand::thread_rng();
    (0..15).map(|_| CHARS[rng.gen_range(0..CHARS.len())] as char).collect()
}

#[tauri::command]
pub async fn get_machine_id() -> Result<String, String> {
    use sha2::{Sha256, Digest};

    // On Windows, combine CPU info + hostname as a deterministic machine fingerprint.
    // For a real implementation, use WMI to get CPU ID and motherboard serial.
    // This placeholder uses hostname + OS info — replace with proper WMI calls before shipping.
    let hostname = hostname::get()
        .map(|h| h.to_string_lossy().to_string())
        .unwrap_or_else(|_| "unknown".to_string());

    let os_info = format!("{}-{}", std::env::consts::OS, std::env::consts::ARCH);
    let raw = format!("{}{}", hostname, os_info);

    let mut hasher = Sha256::new();
    hasher.update(raw.as_bytes());
    let hash = format!("{:x}", hasher.finalize());

    // Format as groups for display: XXXX-XXXX-XXXX-XXXX
    Ok(hash[..16].to_uppercase()
        .chars()
        .collect::<Vec<_>>()
        .chunks(4)
        .map(|c| c.iter().collect::<String>())
        .collect::<Vec<_>>()
        .join("-"))
}

#[tauri::command]
pub async fn validate_license_key(key: String) -> Result<bool, String> {
    use hmac::{Hmac, Mac};
    use sha2::Sha256;
    use base32::Alphabet;

    let machine_id = get_machine_id().await?;
    let machine_id_clean = machine_id.replace('-', "").to_lowercase();

    type HmacSha256 = Hmac<Sha256>;
    let mut mac = HmacSha256::new_from_slice(DEVELOPER_SECRET.as_bytes())
        .map_err(|e| e.to_string())?;
    mac.update(machine_id_clean.as_bytes());
    let result = mac.finalize().into_bytes();

    let encoded = base32::encode(Alphabet::RFC4648 { padding: false }, &result);
    let expected_raw = &encoded[..20].to_uppercase();
    let expected = expected_raw
        .chars()
        .collect::<Vec<_>>()
        .chunks(4)
        .map(|c| c.iter().collect::<String>())
        .collect::<Vec<_>>()
        .join("-");

    Ok(key.trim() == expected)
}
