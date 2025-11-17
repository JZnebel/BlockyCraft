use serde::{Deserialize, Serialize};
use tauri::State;
use std::sync::Mutex;
use crate::db::Database;
use rusqlite::OptionalExtension;

#[derive(Debug, Serialize, Deserialize)]
pub struct Project {
    pub id: Option<i64>,
    pub name: String,
    pub workspace_xml: String,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MediaFile {
    pub id: Option<i64>,
    pub name: String,
    pub file_name: String,
    pub created_at: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Setting {
    pub key: String,
    pub value: String,
}

// ===== PROJECT COMMANDS =====

#[tauri::command]
pub fn db_save_project(
    db: State<Mutex<Database>>,
    name: String,
    workspace_xml: String,
) -> Result<i64, String> {
    let db = db.lock().unwrap();
    let conn = db.get_connection();
    let now = chrono::Utc::now().timestamp();

    // Try to update first
    let updated = conn
        .execute(
            "UPDATE projects SET workspace_xml = ?1, updated_at = ?2 WHERE name = ?3",
            (& workspace_xml, now, &name),
        )
        .map_err(|e| e.to_string())?;

    if updated > 0 {
        // Get the ID of updated project
        let id: i64 = conn
            .query_row("SELECT id FROM projects WHERE name = ?1", [&name], |row| row.get(0))
            .map_err(|e| e.to_string())?;
        Ok(id)
    } else {
        // Insert new project
        conn.execute(
            "INSERT INTO projects (name, workspace_xml, created_at, updated_at) VALUES (?1, ?2, ?3, ?4)",
            (&name, &workspace_xml, now, now),
        )
        .map_err(|e| e.to_string())?;

        Ok(conn.last_insert_rowid())
    }
}

#[tauri::command]
pub fn db_get_projects(db: State<Mutex<Database>>) -> Result<Vec<Project>, String> {
    let db = db.lock().unwrap();
    let conn = db.get_connection();

    let mut stmt = conn
        .prepare("SELECT id, name, workspace_xml, created_at, updated_at FROM projects ORDER BY updated_at DESC")
        .map_err(|e| e.to_string())?;

    let projects = stmt
        .query_map([], |row| {
            Ok(Project {
                id: row.get(0)?,
                name: row.get(1)?,
                workspace_xml: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(projects)
}

#[tauri::command]
pub fn db_delete_project(db: State<Mutex<Database>>, project_id: i64) -> Result<(), String> {
    let db = db.lock().unwrap();
    let conn = db.get_connection();

    conn.execute("DELETE FROM projects WHERE id = ?1", [project_id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

// ===== MEDIA COMMANDS =====

#[tauri::command]
pub fn db_save_media(
    db: State<Mutex<Database>>,
    name: String,
    file_name: String,
) -> Result<i64, String> {
    let db = db.lock().unwrap();
    let conn = db.get_connection();
    let now = chrono::Utc::now().timestamp();

    conn.execute(
        "INSERT INTO media (name, file_name, created_at) VALUES (?1, ?2, ?3)",
        (&name, &file_name, now),
    )
    .map_err(|e| e.to_string())?;

    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub fn db_get_media(db: State<Mutex<Database>>) -> Result<Vec<MediaFile>, String> {
    let db = db.lock().unwrap();
    let conn = db.get_connection();

    let mut stmt = conn
        .prepare("SELECT id, name, file_name, created_at FROM media ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let media = stmt
        .query_map([], |row| {
            Ok(MediaFile {
                id: row.get(0)?,
                name: row.get(1)?,
                file_name: row.get(2)?,
                created_at: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(media)
}

#[tauri::command]
pub fn db_delete_media(db: State<Mutex<Database>>, media_id: i64) -> Result<(), String> {
    let db = db.lock().unwrap();
    let conn = db.get_connection();

    conn.execute("DELETE FROM media WHERE id = ?1", [media_id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

// ===== SETTINGS COMMANDS =====

#[tauri::command]
pub fn db_save_setting(
    db: State<Mutex<Database>>,
    key: String,
    value: String,
) -> Result<(), String> {
    let db = db.lock().unwrap();
    let conn = db.get_connection();
    let now = chrono::Utc::now().timestamp();

    conn.execute(
        "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?1, ?2, ?3)",
        (&key, &value, now),
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn db_get_setting(db: State<Mutex<Database>>, key: String) -> Result<Option<String>, String> {
    let db = db.lock().unwrap();
    let conn = db.get_connection();

    let result = conn
        .query_row("SELECT value FROM settings WHERE key = ?1", [&key], |row| {
            row.get(0)
        })
        .optional()
        .map_err(|e| e.to_string())?;

    Ok(result)
}

#[tauri::command]
pub fn db_get_all_settings(db: State<Mutex<Database>>) -> Result<Vec<Setting>, String> {
    let db = db.lock().unwrap();
    let conn = db.get_connection();

    let mut stmt = conn
        .prepare("SELECT key, value FROM settings")
        .map_err(|e| e.to_string())?;

    let settings = stmt
        .query_map([], |row| {
            Ok(Setting {
                key: row.get(0)?,
                value: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(settings)
}

// ===== AI MODEL COMMANDS =====

#[derive(Debug, Serialize, Deserialize)]
pub struct AiModel {
    pub id: Option<i64>,
    pub model_id: String,
    pub name: String,
    pub prompt: String,
    pub blocks_json: String,
    pub generated_by: String,
    pub created_at: i64,
}

#[tauri::command]
pub fn db_save_ai_model(
    db: State<Mutex<Database>>,
    model_id: String,
    name: String,
    prompt: String,
    blocks_json: String,
    generated_by: String,
) -> Result<i64, String> {
    let db = db.lock().unwrap();
    let conn = db.get_connection();
    let now = chrono::Utc::now().timestamp();

    // Try to insert, on conflict update
    conn.execute(
        "INSERT INTO ai_models (model_id, name, prompt, blocks_json, generated_by, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(model_id) DO UPDATE SET
            name = excluded.name,
            prompt = excluded.prompt,
            blocks_json = excluded.blocks_json,
            generated_by = excluded.generated_by",
        [&model_id, &name, &prompt, &blocks_json, &generated_by, &now.to_string()],
    )
    .map_err(|e| e.to_string())?;

    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub fn db_get_ai_models(
    db: State<Mutex<Database>>,
) -> Result<Vec<AiModel>, String> {
    let db = db.lock().unwrap();
    let conn = db.get_connection();

    let mut stmt = conn
        .prepare("SELECT id, model_id, name, prompt, blocks_json, generated_by, created_at FROM ai_models ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let models = stmt
        .query_map([], |row| {
            Ok(AiModel {
                id: Some(row.get(0)?),
                model_id: row.get(1)?,
                name: row.get(2)?,
                prompt: row.get(3)?,
                blocks_json: row.get(4)?,
                generated_by: row.get(5)?,
                created_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(models)
}

#[tauri::command]
pub fn db_delete_ai_model(
    db: State<Mutex<Database>>,
    id: i64,
) -> Result<(), String> {
    let db = db.lock().unwrap();
    let conn = db.get_connection();

    conn.execute("DELETE FROM ai_models WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
