use std::process::{Command, Child};
use std::sync::Mutex;
use tauri::State;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerStatus {
    pub server_id: String,
    pub running: bool,
    pub port: u16,
    pub pid: Option<u32>,
}

pub struct ServerManager {
    processes: Mutex<HashMap<String, Child>>,
}

impl ServerManager {
    pub fn new() -> Self {
        Self {
            processes: Mutex::new(HashMap::new()),
        }
    }
}

fn kill_process_on_port(port: u16) -> Result<(), String> {
    #[cfg(target_os = "linux")]
    {
        let output = Command::new("sh")
            .arg("-c")
            .arg(format!("lsof -ti:{}", port))
            .output()
            .map_err(|e| format!("Failed to check port: {}", e))?;

        if output.status.success() {
            let pid = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !pid.is_empty() {
                println!("🔪 Killing existing process on port {}: PID {}", port, pid);
                Command::new("kill")
                    .arg(&pid)
                    .output()
                    .map_err(|e| format!("Failed to kill process: {}", e))?;
                std::thread::sleep(std::time::Duration::from_millis(500));
            }
        }
    }

    #[cfg(target_os = "windows")]
    {
        let output = Command::new("cmd")
            .args(&["/C", &format!("netstat -ano | findstr :{}", port)])
            .output()
            .map_err(|e| format!("Failed to check port: {}", e))?;

        if output.status.success() {
            let output_str = String::from_utf8_lossy(&output.stdout);
            if let Some(line) = output_str.lines().next() {
                if let Some(pid) = line.split_whitespace().last() {
                    println!("🔪 Killing existing process on port {}: PID {}", port, pid);
                    Command::new("taskkill")
                        .args(&["/F", "/PID", pid])
                        .output()
                        .map_err(|e| format!("Failed to kill process: {}", e))?;
                    std::thread::sleep(std::time::Duration::from_millis(500));
                }
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        let output = Command::new("lsof")
            .arg("-ti")
            .arg(format!(":{}", port))
            .output()
            .map_err(|e| format!("Failed to check port: {}", e))?;

        if output.status.success() {
            let pid = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !pid.is_empty() {
                println!("🔪 Killing existing process on port {}: PID {}", port, pid);
                Command::new("kill")
                    .arg(&pid)
                    .output()
                    .map_err(|e| format!("Failed to kill process: {}", e))?;
                std::thread::sleep(std::time::Duration::from_millis(500));
            }
        }
    }

    Ok(())
}

fn get_server_config(server_id: &str) -> Option<(&str, u16)> {
    match server_id {
        "fabric" => Some(("deploy_java_api.py", 8585)),
        "bukkit" => Some(("deploy_bukkit_api.py", 8586)),
        "bedrock" => Some(("deploy_bedrock_api.py", 8587)),
        _ => None,
    }
}

#[tauri::command]
pub fn start_server(
    server_id: String,
    server_manager: State<ServerManager>,
) -> Result<String, String> {
    let (script_name, port) = get_server_config(&server_id)
        .ok_or_else(|| format!("Unknown server: {}", server_id))?;

    // Check if already running
    let mut processes = server_manager.processes.lock().unwrap();
    if processes.contains_key(&server_id) {
        return Err(format!("Server {} is already running", server_id));
    }

    // Kill any existing process on the port
    kill_process_on_port(port)?;

    // Get project root (go up from src-tauri if needed)
    let mut project_root = std::env::current_dir()
        .map_err(|e| format!("Failed to get current directory: {}", e))?;

    if project_root.ends_with("src-tauri") {
        project_root = project_root.parent()
            .ok_or("Failed to get parent directory")?
            .to_path_buf();
    }

    let python_script = project_root.join(script_name);

    if !python_script.exists() {
        return Err(format!("{} not found at {:?}", script_name, python_script));
    }

    println!("🚀 Starting {} server from {:?}", server_id, python_script);

    let child = Command::new("python3")
        .arg(&python_script)
        .current_dir(&project_root)
        .spawn()
        .map_err(|e| format!("Failed to start {}: {}", server_id, e))?;

    let pid = child.id();
    println!("✅ {} server started (PID: {})", server_id, pid);

    processes.insert(server_id.clone(), child);

    Ok(format!("{} server started on port {}", server_id, port))
}

#[tauri::command]
pub fn stop_server(
    server_id: String,
    server_manager: State<ServerManager>,
) -> Result<String, String> {
    let mut processes = server_manager.processes.lock().unwrap();

    if let Some(mut child) = processes.remove(&server_id) {
        child.kill().map_err(|e| format!("Failed to kill process: {}", e))?;
        println!("🛑 {} server stopped", server_id);
        Ok(format!("{} server stopped", server_id))
    } else {
        Err(format!("Server {} is not running", server_id))
    }
}

#[tauri::command]
pub fn get_server_status(
    server_id: String,
    server_manager: State<ServerManager>,
) -> Result<ServerStatus, String> {
    let (_, port) = get_server_config(&server_id)
        .ok_or_else(|| format!("Unknown server: {}", server_id))?;

    let processes = server_manager.processes.lock().unwrap();

    if let Some(child) = processes.get(&server_id) {
        Ok(ServerStatus {
            server_id: server_id.clone(),
            running: true,
            port,
            pid: Some(child.id()),
        })
    } else {
        Ok(ServerStatus {
            server_id: server_id.clone(),
            running: false,
            port,
            pid: None,
        })
    }
}

#[tauri::command]
pub fn get_all_server_status(
    server_manager: State<ServerManager>,
) -> Result<Vec<ServerStatus>, String> {
    let servers = vec!["fabric", "bukkit", "bedrock"];
    let mut statuses = Vec::new();
    let processes = server_manager.processes.lock().unwrap();

    for server_id in servers {
        let (_, port) = get_server_config(server_id)
            .ok_or_else(|| format!("Unknown server: {}", server_id))?;

        let status = if let Some(child) = processes.get(server_id) {
            ServerStatus {
                server_id: server_id.to_string(),
                running: true,
                port,
                pid: Some(child.id()),
            }
        } else {
            ServerStatus {
                server_id: server_id.to_string(),
                running: false,
                port,
                pid: None,
            }
        };

        statuses.push(status);
    }

    Ok(statuses)
}

#[tauri::command]
pub fn check_server_health(server_id: String) -> Result<bool, String> {
    let (_, port) = get_server_config(&server_id)
        .ok_or_else(|| format!("Unknown server: {}", server_id))?;

    // Simple TCP connection check
    match std::net::TcpStream::connect(format!("127.0.0.1:{}", port)) {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}
