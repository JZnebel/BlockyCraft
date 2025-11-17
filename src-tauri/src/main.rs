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

fn start_python_api(app_handle: &AppHandle) -> Option<Child> {
    #[cfg(debug_assertions)]
    {
        // In development, start Python API from project root
        let project_root = std::env::current_dir().ok()?;
        let python_script = project_root.join("deploy_java_api.py");

        if !python_script.exists() {
            eprintln!("Warning: deploy_java_api.py not found at {:?}", python_script);
            return None;
        }

        println!("Starting Python API server from {:?}", python_script);

        match Command::new("python3")
            .arg(&python_script)
            .current_dir(&project_root)
            .spawn()
        {
            Ok(child) => {
                println!("✓ Python API server started (PID: {})", child.id());
                Some(child)
            }
            Err(e) => {
                eprintln!("Failed to start Python API: {}", e);
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
        .setup(|app| {
            // Initialize database
            let app_data_dir = app.path().app_data_dir()
                .expect("failed to get app data dir");

            std::fs::create_dir_all(&app_data_dir).expect("failed to create app data dir");
            let db_path = app_data_dir.join("blockcraft.db");

            let database = Database::new(db_path).expect("failed to initialize database");
            app.manage(Mutex::new(database));

            // Start Python API server
            if let Some(mut child) = start_python_api(app.app_handle()) {
                // Store the process handle for cleanup
                let app_handle = app.app_handle().clone();

                // Register cleanup on app exit
                std::thread::spawn(move || {
                    // Wait for app to exit
                    loop {
                        std::thread::sleep(std::time::Duration::from_secs(1));
                        // The process will be killed when the app exits
                    }
                });

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
            db_delete_ai_model,
            // OpenAI commands
            generate_block_display_model,
            generate_item_texture,
            // OpenAI Codegen commands
            generate_block_display_model_codegen,
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
