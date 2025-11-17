use rusqlite::{Connection, Result};
use std::path::PathBuf;

pub struct Database {
    conn: Connection,
}

impl Database {
    /// Initialize the database at the given path
    pub fn new(db_path: PathBuf) -> Result<Self> {
        let conn = Connection::open(db_path)?;

        // Enable foreign keys
        conn.execute("PRAGMA foreign_keys = ON", [])?;

        let db = Database { conn };
        db.initialize_schema()?;
        Ok(db)
    }

    /// Create all tables if they don't exist
    fn initialize_schema(&self) -> Result<()> {
        // Projects table
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                workspace_xml TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )",
            [],
        )?;

        // Media files table
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS media (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                file_name TEXT NOT NULL UNIQUE,
                created_at INTEGER NOT NULL
            )",
            [],
        )?;

        // Deployments table
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS deployments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                project_name TEXT NOT NULL,
                deployed_at INTEGER NOT NULL,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            )",
            [],
        )?;

        // Settings table (key-value store)
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at INTEGER NOT NULL
            )",
            [],
        )?;

        // AI Models table
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS ai_models (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model_id TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                prompt TEXT NOT NULL,
                blocks_json TEXT NOT NULL,
                generated_by TEXT NOT NULL,
                created_at INTEGER NOT NULL
            )",
            [],
        )?;

        Ok(())
    }

    pub fn get_connection(&self) -> &Connection {
        &self.conn
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn test_database_initialization() {
        let temp_path = PathBuf::from("/tmp/blockcraft_test.db");

        // Clean up if exists
        let _ = fs::remove_file(&temp_path);

        let db = Database::new(temp_path.clone()).expect("Failed to create database");

        // Verify tables exist by querying sqlite_master
        let tables: Vec<String> = db.conn
            .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
            .unwrap()
            .query_map([], |row| row.get(0))
            .unwrap()
            .collect::<Result<Vec<String>>>()
            .unwrap();

        assert!(tables.contains(&"projects".to_string()));
        assert!(tables.contains(&"media".to_string()));
        assert!(tables.contains(&"deployments".to_string()));
        assert!(tables.contains(&"settings".to_string()));

        // Clean up
        fs::remove_file(&temp_path).ok();
    }
}
