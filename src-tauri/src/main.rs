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
use tauri::Manager;

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
