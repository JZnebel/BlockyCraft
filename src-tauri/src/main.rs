// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;

use commands::greet;
use commands::db_commands::*;
use commands::openai::*;
use commands::openai_codegen::*;
use commands::{
    save_project, load_project, compile_mod, build_mod,
    list_deployed_mods, undeploy_mod, open_folder, restart_minecraft_client
};
use db::Database;
use std::sync::Mutex;
use std::process::{Command, Child};
use tauri::{Manager, AppHandle};

fn kill_process_on_port(port: u16) {
    #[cfg(target_os = "linux")]
    {
        // Try to find and kill any process using the port
        let output = Command::new("sh")
            .arg("-c")
            .arg(format!("lsof -ti:{}", port))
            .output();

        if let Ok(output) = output {
            if output.status.success() {
                let pid = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if !pid.is_empty() {
                    println!("🔪 Killing existing process on port {}: PID {}", port, pid);
                    let _ = Command::new("kill")
                        .arg(&pid)
                        .output();
                    std::thread::sleep(std::time::Duration::from_millis(500));
                }
            }
        }
    }
}

fn start_python_api(_app_handle: &AppHandle) -> Option<Child> {
    #[cfg(debug_assertions)]
    {
        // Kill any existing process on port 8585
        kill_process_on_port(8585);

        // In development, start Python API from project root
        // Tauri runs from src-tauri, so go up one level to find deploy_java_api.py
        let mut project_root = std::env::current_dir().ok()?;

        // If we're in src-tauri, go up one level
        if project_root.ends_with("src-tauri") {
            project_root = project_root.parent()?.to_path_buf();
        }

        let python_script = project_root.join("deploy_java_api.py");

        if !python_script.exists() {
            eprintln!("❌ deploy_java_api.py not found at {:?}", python_script);
            eprintln!("   Current dir: {:?}", std::env::current_dir().ok());
            return None;
        }

        println!("🚀 Starting Python API server from {:?}", python_script);

        match Command::new("python3")
            .arg(&python_script)
            .current_dir(&project_root)
            .spawn()
        {
            Ok(child) => {
                println!("✅ Python API server started (PID: {})", child.id());
                Some(child)
            }
            Err(e) => {
                eprintln!("❌ Failed to start Python API: {}", e);
                None
            }
        }
    }

    #[cfg(not(debug_assertions))]
    {
        // In production, Python API should be bundled or run separately
        // For now, attempt to start from app resources
        None
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // Initialize database
            let app_data_dir = app.path().app_data_dir()
                .expect("failed to get app data dir");

            std::fs::create_dir_all(&app_data_dir).expect("failed to create app data dir");
            let db_path = app_data_dir.join("blockcraft.db");

            let database = Database::new(db_path).expect("failed to initialize database");
            app.manage(Mutex::new(database));

            // Start Python API server
            if let Some(child) = start_python_api(app.app_handle()) {
                // Store the process handle - it will be killed when app exits
                app.manage(Mutex::new(Some(child)));
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            // Database commands
            db_save_project,
            db_get_projects,
            db_delete_project,
            db_save_media,
            db_get_media,
            db_delete_media,
            db_save_setting,
            db_get_setting,
            db_get_all_settings,
            db_save_ai_model,
            db_get_ai_models,
            db_get_ai_model_blocks,
            db_delete_ai_model,
            // OpenAI commands
            generate_block_display_model,
            generate_item_texture,
            // OpenAI Codegen commands
            generate_block_display_model_codegen,
            edit_block_display_model,
            // Project file commands
            save_project,
            load_project,
            // Mod compilation commands
            compile_mod,
            build_mod,
            // Deployment commands
            list_deployed_mods,
            undeploy_mod,
            // Utility commands
            open_folder,
            restart_minecraft_client,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
