// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;

use commands::greet;
use commands::db_commands::*;
use commands::openai::*;
use commands::openai_codegen::*;
use commands::server_commands::{ServerManager, start_server, stop_server, get_server_status, get_all_server_status, check_server_health};
use commands::{
    save_project, load_project, compile_mod, build_mod,
    list_deployed_mods, undeploy_mod, open_folder, restart_minecraft_client
};
use db::Database;
use std::sync::Mutex;
use tauri::Manager;

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

            // Initialize server manager (no auto-start, launcher will control servers)
            let server_manager = ServerManager::new();
            app.manage(server_manager);

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
            // Server management commands
            start_server,
            stop_server,
            get_server_status,
            get_all_server_status,
            check_server_health,
            // Utility commands
            open_folder,
            restart_minecraft_client,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
