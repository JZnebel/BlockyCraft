# BlockCraft Tauri Migration Plan - Approach A

## 🎯 Goal: One-Click Cross-Platform Desktop App

Transform BlockCraft from a local web MVP into a production-ready desktop application that bundles everything needed for creating and testing Minecraft mods.

---

## 📊 Current State (MVP)

**Tech Stack:**
- Frontend: Single `index.html` (794 lines) + vanilla JS (~3,000 lines)
- Backend: Python Flask (3 files)
- Database: Browser localStorage
- Deployment: Manual setup (Python, Minecraft server, Gradle, Java)

**Pain Points:**
- ❌ Not distributable (requires Python, manual setup)
- ❌ Monolithic code structure
- ❌ Hardcoded file paths
- ❌ No proper database
- ❌ Server management is manual
- ❌ Users must manually install Fabric client-side

---

## 🚀 Target State (Approach A)

**Tech Stack:**
- **Desktop Framework:** Tauri 2.0 (Rust backend)
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** TailwindCSS
- **Database:** SQLite (embedded)
- **Bundled:** Fabric server + Gradle + Java runtime
- **Deployment:** Native installers (.exe, .dmg, .deb)

**User Experience:**
1. Download single installer (10-20 MB)
2. Install BlockCraft app (one-click)
3. Launch app → Visual mod editor opens
4. Create mod with blocks
5. Click "Test Mod" button:
   - ✅ Server starts automatically (bundled)
   - ✅ Mod compiles and deploys
   - ✅ Fabric + mod auto-install to user's `.minecraft`
   - ✅ Shows "Ready! Launch Minecraft" notification
6. User launches Minecraft → Selects Fabric profile → Connects to localhost
7. Test mod in-game

---

## 🏗️ Architecture Overview

```
BlockCraft Desktop App (Tauri)
┌─────────────────────────────────────────────────┐
│  Frontend Layer (React + TypeScript)            │
│  ┌───────────────────────────────────────────┐  │
│  │  - Blockly Editor                         │  │
│  │  - Project Manager                        │  │
│  │  - Texture Generator (AI)                 │  │
│  │  - Settings Panel                         │  │
│  │  - Server Status Monitor                  │  │
│  └───────────────────────────────────────────┘  │
│                      ↕                           │
│  Backend Layer (Rust via Tauri Commands)        │
│  ┌───────────────────────────────────────────┐  │
│  │  - Project Management (SQLite)            │  │
│  │  - Mod Compiler (Gradle wrapper)          │  │
│  │  - Server Manager (Fabric server)         │  │
│  │  - Client Installer (Fabric + mods)       │  │
│  │  - File System Access                     │  │
│  └───────────────────────────────────────────┘  │
│                      ↕                           │
│  Bundled Resources                               │
│  ┌───────────────────────────────────────────┐  │
│  │  - fabric-server-launcher.jar             │  │
│  │  - fabric-api-0.100.0.jar                 │  │
│  │  - gradle-wrapper/ (Gradle 8.8)           │  │
│  │  - minecraft-server-1.21.1.jar            │  │
│  │  - Java 21 runtime (optional)             │  │
│  │  - Mod templates/                         │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      ↓
          User's .minecraft/ folder
          ┌──────────────────────────┐
          │  Auto-installed:         │
          │  - Fabric Loader         │
          │  - Fabric API mod        │
          │  - User's compiled mod   │
          └──────────────────────────┘
```

---

## 📁 New Project Structure

```
blockcraft/
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs              # Tauri app entry point
│   │   ├── commands/            # Tauri command handlers
│   │   │   ├── mod.rs
│   │   │   ├── project.rs       # Project CRUD operations
│   │   │   ├── compiler.rs      # Mod compilation
│   │   │   ├── server.rs        # Minecraft server management
│   │   │   ├── installer.rs     # Client-side Fabric installer
│   │   │   └── texture.rs       # AI texture generation
│   │   ├── database/            # SQLite database layer
│   │   │   ├── mod.rs
│   │   │   ├── models.rs        # Project, Block, Texture models
│   │   │   └── schema.sql       # Database schema
│   │   └── utils/
│   │       ├── mod.rs
│   │       ├── minecraft.rs     # Detect .minecraft folder
│   │       └── paths.rs         # Cross-platform paths
│   ├── resources/               # Files bundled into app
│   │   ├── server/
│   │   │   ├── fabric-server-launcher.jar
│   │   │   ├── minecraft-server-1.21.1.jar
│   │   │   └── fabric-api.jar
│   │   ├── gradle/
│   │   │   └── gradle-8.8-all.zip
│   │   └── templates/           # Java mod templates
│   │       ├── BlockCraftMod.java.template
│   │       ├── build.gradle.template
│   │       └── fabric.mod.json.template
│   ├── Cargo.toml               # Rust dependencies
│   ├── tauri.conf.json          # Tauri configuration
│   └── build.rs
│
├── src/                         # React frontend
│   ├── components/
│   │   ├── BlocklyEditor/
│   │   │   ├── BlocklyEditor.tsx
│   │   │   ├── Toolbox.tsx
│   │   │   └── WorkspaceConfig.ts
│   │   ├── ProjectManager/
│   │   │   ├── ProjectList.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   └── NewProjectModal.tsx
│   │   ├── TextureGenerator/
│   │   │   ├── TextureUpload.tsx
│   │   │   ├── AIGenerate.tsx
│   │   │   └── TexturePreview.tsx
│   │   ├── ServerMonitor/
│   │   │   ├── ServerStatus.tsx
│   │   │   ├── ServerLogs.tsx
│   │   │   └── ControlButtons.tsx
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   ├── blocks/                  # Blockly block definitions (migrated)
│   │   ├── custom_items.ts
│   │   ├── custom_mobs.ts
│   │   ├── events.ts
│   │   ├── actions.ts
│   │   └── index.ts
│   ├── generators/              # Code generators (migrated)
│   │   ├── java.ts
│   │   ├── custom_items_java.ts
│   │   └── custom_mobs_java.ts
│   ├── hooks/
│   │   ├── useProjects.ts       # Project management
│   │   ├── useServer.ts         # Server control
│   │   └── useTextures.ts       # Texture handling
│   ├── lib/
│   │   ├── tauri.ts             # Tauri command wrappers
│   │   └── blockly.ts           # Blockly utilities
│   ├── types/
│   │   ├── project.ts
│   │   ├── block.ts
│   │   └── server.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                # TailwindCSS
│
├── public/
│   └── blockly/                 # Blockly library files
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── .gitignore
├── README.md
└── ARCHITECTURE_PLAN.md         # This file
```

---

## 🔧 Key Components

### 1. Frontend (React + TypeScript + Vite)

**Why React?**
- Component reusability
- TypeScript for type safety
- Large ecosystem
- Better than vanilla JS for complex UIs

**Key Libraries:**
- `react-blockly` - React wrapper for Blockly
- `@tauri-apps/api` - Tauri frontend bindings
- `tailwindcss` - Utility-first CSS
- `zustand` - State management (lightweight)
- `react-query` - Server state management

**Migration from current code:**
```
index.html → src/App.tsx (main layout)
main.js → src/components/BlocklyEditor/BlocklyEditor.tsx
projects.js → src/hooks/useProjects.ts
blocks/*.js → src/blocks/*.ts (convert to TypeScript)
generators/*.js → src/generators/*.ts
```

---

### 2. Backend (Rust via Tauri)

**Tauri Commands** (Rust functions callable from frontend):

```rust
// Project Management
#[tauri::command]
async fn create_project(name: String, description: String) -> Result<Project, String>

#[tauri::command]
async fn load_project(id: i64) -> Result<Project, String>

#[tauri::command]
async fn save_project(project: Project) -> Result<(), String>

#[tauri::command]
async fn list_projects() -> Result<Vec<Project>, String>

// Mod Compilation
#[tauri::command]
async fn compile_mod(blocks_json: String) -> Result<CompilationResult, String>

// Server Management
#[tauri::command]
async fn start_server() -> Result<(), String>

#[tauri::command]
async fn stop_server() -> Result<(), String>

#[tauri::command]
async fn get_server_status() -> Result<ServerStatus, String>

// Fabric Client Installation
#[tauri::command]
async fn detect_minecraft_folder() -> Result<Option<String>, String>

#[tauri::command]
async fn install_fabric_client() -> Result<(), String>

#[tauri::command]
async fn install_mod_to_client(jar_path: String) -> Result<(), String>

// Texture Generation
#[tauri::command]
async fn generate_texture_ai(prompt: String, api_key: String) -> Result<String, String>
```

**Database Schema (SQLite):**
```sql
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    workspace_json TEXT NOT NULL,  -- Blockly workspace state
    created_at INTEGER NOT NULL,
    modified_at INTEGER NOT NULL
);

CREATE TABLE textures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    block_id TEXT NOT NULL,          -- Which block this texture belongs to
    image_data BLOB NOT NULL,        -- Base64 or binary PNG
    created_at INTEGER NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
```

---

### 3. Bundled Resources

**What gets included in the installer:**

```toml
# src-tauri/tauri.conf.json
{
  "bundle": {
    "resources": [
      "resources/server/fabric-server-launcher.jar",
      "resources/server/minecraft-server-1.21.1.jar",
      "resources/server/fabric-api.jar",
      "resources/gradle/gradle-8.8-all.zip",
      "resources/templates/*"
    ],
    "externalBin": [
      "java"  // Optional: bundle Java runtime
    ]
  }
}
```

**File sizes:**
- Tauri app: ~3-5 MB
- Fabric server: ~50 MB
- Minecraft server: ~50 MB
- Gradle: ~130 MB
- **Total installer: ~230 MB** (or ~10 MB if Java/Gradle are system dependencies)

**Optimization:** Ship a "lite" version that downloads Minecraft/Gradle on first run.

---

## 🔄 Build & Deployment Workflow

### User Clicks "Test Mod"

```
1. Frontend calls: await invoke('compile_mod', { blocks_json })
                              ↓
2. Rust backend:
   a. Parse Blockly JSON
   b. Generate Java source files using templates
   c. Write to temp build directory
   d. Run Gradle wrapper to compile mod
   e. Copy JAR to server/mods/ and .minecraft/mods/
                              ↓
3. Frontend calls: await invoke('start_server')
                              ↓
4. Rust backend:
   a. Check if server is already running
   b. Start Fabric server process (bundled JAR)
   c. Stream logs back to frontend
   d. Detect when "Done! Server started" appears
                              ↓
5. Frontend calls: await invoke('install_mod_to_client')
                              ↓
6. Rust backend:
   a. Detect user's .minecraft folder (OS-specific paths)
   b. Check if Fabric Loader is installed
   c. If not: Run Fabric installer JAR
   d. Copy mod JAR to .minecraft/mods/
   e. Copy Fabric API to .minecraft/mods/
                              ↓
7. Frontend shows notification:
   "✅ Mod ready! Launch Minecraft and connect to localhost"
```

---

## 📦 Distribution & Installation

### Build Commands

```bash
# Development
npm run tauri dev

# Production build (creates installers)
npm run tauri build
```

**Output:**
- Windows: `blockcraft-1.0.0-setup.exe` (~230 MB)
- macOS: `blockcraft-1.0.0.dmg` (~230 MB)
- Linux: `blockcraft-1.0.0.AppImage` or `.deb` (~230 MB)

### Installation Flow (User Side)

**Windows:**
1. Download `blockcraft-setup.exe`
2. Run installer → One-click install
3. Desktop shortcut created
4. Launch BlockCraft

**macOS:**
1. Download `blockcraft.dmg`
2. Drag to Applications folder
3. Launch from Applications

**Linux:**
1. Download `blockcraft.AppImage` or `.deb`
2. Make executable: `chmod +x blockcraft.AppImage`
3. Run: `./blockcraft.AppImage`

---

## 🎮 Fabric Client Auto-Installation

### Detection Algorithm

```rust
fn detect_minecraft_folder() -> Option<PathBuf> {
    let base = if cfg!(windows) {
        env::var("APPDATA").ok()?.into()
    } else if cfg!(target_os = "macos") {
        dirs::home_dir()?.join("Library/Application Support")
    } else {
        dirs::home_dir()?
    };

    let minecraft = base.join(".minecraft");
    if minecraft.exists() {
        Some(minecraft)
    } else {
        None
    }
}
```

### Fabric Installation Steps

```rust
async fn install_fabric_client(minecraft_dir: PathBuf) -> Result<()> {
    // 1. Check if Fabric is already installed
    let versions_dir = minecraft_dir.join("versions");
    let fabric_version = "fabric-loader-0.16.9-1.21.1";

    if !versions_dir.join(fabric_version).exists() {
        // 2. Download Fabric installer
        let installer_url = "https://maven.fabricmc.net/net/fabricmc/fabric-installer/1.0.1/fabric-installer-1.0.1.jar";
        let installer_path = "/tmp/fabric-installer.jar";
        download_file(installer_url, installer_path).await?;

        // 3. Run Fabric installer in headless mode
        Command::new("java")
            .arg("-jar")
            .arg(installer_path)
            .arg("client")
            .arg("-dir").arg(&minecraft_dir)
            .arg("-mcversion").arg("1.21.1")
            .arg("-loader").arg("0.16.9")
            .arg("-noprofile") // Don't create launcher profile (we'll do it)
            .output()?;
    }

    // 4. Create launcher profile
    let profiles_json = minecraft_dir.join("launcher_profiles.json");
    let mut profiles: Value = serde_json::from_str(&fs::read_to_string(&profiles_json)?)?;

    profiles["profiles"]["BlockCraft Fabric"] = json!({
        "name": "BlockCraft Fabric",
        "type": "custom",
        "created": chrono::Utc::now().to_rfc3339(),
        "lastVersionId": fabric_version,
        "icon": "data:image/png;base64,..." // BlockCraft logo
    });

    fs::write(profiles_json, serde_json::to_string_pretty(&profiles)?)?;

    // 5. Copy Fabric API mod
    let mods_dir = minecraft_dir.join("mods");
    fs::create_dir_all(&mods_dir)?;
    fs::copy(
        "resources/server/fabric-api.jar",
        mods_dir.join("fabric-api-0.100.0.jar")
    )?;

    Ok(())
}
```

**Result:**
- Fabric Loader installed to `.minecraft/versions/`
- Launcher profile created: "BlockCraft Fabric"
- Fabric API copied to `.minecraft/mods/`
- User just needs to select profile and click Play

---

## 🚀 Migration Roadmap

### Phase 1: Setup (Week 1)
- [x] Git repo initialized
- [ ] Install Tauri CLI: `cargo install tauri-cli`
- [ ] Create new Tauri project: `npm create tauri-app`
- [ ] Setup Vite + React + TypeScript
- [ ] Install dependencies (TailwindCSS, Blockly, etc.)
- [ ] Configure build system

### Phase 2: Frontend Migration (Week 2-3)
- [ ] Create React component structure
- [ ] Migrate `index.html` → React layout components
- [ ] Convert `blocks/*.js` → TypeScript modules
- [ ] Convert `generators/*.js` → TypeScript
- [ ] Integrate Blockly with React
- [ ] Setup state management (Zustand)
- [ ] Implement project UI (list, create, load)

### Phase 3: Backend Implementation (Week 3-4)
- [ ] Setup SQLite database with schema
- [ ] Implement Tauri commands for projects
- [ ] Implement mod compiler (call Gradle)
- [ ] Implement server manager (start/stop Fabric server)
- [ ] Implement Fabric client installer
- [ ] Bundle resources (server JARs, Gradle)

### Phase 4: Integration & Testing (Week 5)
- [ ] Connect frontend to backend commands
- [ ] Test full workflow: create → compile → test
- [ ] Test on Windows, macOS, Linux
- [ ] Fix platform-specific issues
- [ ] Add error handling and logging

### Phase 5: Polish & Distribution (Week 6)
- [ ] Add loading states and animations
- [ ] Improve error messages
- [ ] Create app icon and branding
- [ ] Build production installers
- [ ] Test installation on clean machines
- [ ] Write user documentation

### Phase 6: Advanced Features (Future)
- [ ] Update GPT Image 1 texture generator (transparent backgrounds)
- [ ] Add mod export/sharing
- [ ] Add mod marketplace
- [ ] Multi-language support
- [ ] Auto-updates (Tauri updater)

---

## 🔑 Key Decisions

### Why Tauri over Electron?
- ✅ **10-20x smaller** installer size (10 MB vs 80-120 MB)
- ✅ **Faster startup** (<500ms vs 1-2s)
- ✅ **Lower memory** (50-100 MB vs 400+ MB)
- ✅ **More secure** (Rust sandboxing)
- ✅ **Native performance** (uses OS WebView)
- ❌ Requires learning Rust basics (but commands are simple)

### Why React over Vue/Svelte?
- ✅ Largest ecosystem and community
- ✅ TypeScript support is excellent
- ✅ More developers know React
- ✅ Better Blockly integrations available
- ❌ Slightly larger bundle than Svelte (not an issue for desktop)

### Why SQLite over other databases?
- ✅ Embedded (no external server)
- ✅ Zero configuration
- ✅ Cross-platform
- ✅ Fast for local data
- ✅ Easy to bundle with app

### Bundle Java or require system Java?
**Option A: Bundle Java runtime**
- ✅ Guaranteed to work
- ✅ No user setup needed
- ❌ +200 MB to installer size
- ❌ Need separate builds per platform

**Option B: Require system Java 21**
- ✅ Smaller installer
- ❌ Users must install Java
- ❌ More support burden

**Recommendation:** Start with Option B, add Option A as "portable version" later.

---

## 📊 Success Metrics

### Performance Targets
- App startup: < 500ms
- Mod compilation: < 30s
- Server startup: < 10s
- Installer size: < 250 MB (or < 20 MB lite version)
- Memory usage: < 200 MB idle

### User Experience Targets
- First-time setup: < 5 minutes (download + install)
- Create first mod: < 10 minutes
- Test mod in-game: < 3 clicks after creation

---

## 🔒 Security Considerations

1. **API Keys**: Store OpenAI API key encrypted in SQLite
2. **File Access**: Tauri restricts file system access by default
3. **Network**: Only allow connections to OpenAI API and localhost
4. **Code Execution**: Gradle runs in isolated subprocess
5. **Updates**: Use Tauri's signed update system

---

## 🐛 Known Challenges & Solutions

### Challenge 1: Cross-Platform Paths
**Problem:** `.minecraft` folder location differs per OS
**Solution:** Use Rust's `dirs` crate for standard paths

### Challenge 2: Java Runtime Dependency
**Problem:** Users may not have Java 21 installed
**Solution:**
- Detect Java on system
- If missing, show download instructions
- Later: Bundle Java runtime

### Challenge 3: Gradle Build Performance
**Problem:** First Gradle build downloads dependencies (~200 MB)
**Solution:**
- Cache Gradle wrapper in app data
- Pre-populate dependency cache in installer
- Use `--offline` mode when possible

### Challenge 4: Server Port Conflicts
**Problem:** Port 25565 might be in use
**Solution:**
- Check if port is available before starting
- Allow user to configure port in settings
- Auto-increment port if blocked

### Challenge 5: Antivirus False Positives
**Problem:** Antivirus might flag server JAR or Gradle
**Solution:**
- Code sign the installer
- Document how to whitelist BlockCraft
- Use official Fabric/Gradle downloads (not modified)

---

## 📚 Resources & Documentation

### Learning Tauri
- Official Docs: https://tauri.app/v1/guides/
- Tauri + React: https://tauri.app/v1/guides/getting-started/setup/vite
- Command System: https://tauri.app/v1/guides/features/command

### Fabric Development
- Fabric Wiki: https://fabricmc.net/wiki/
- Fabric API Javadocs: https://maven.fabricmc.net/docs/
- Minecraft Dev Docs: https://minecraft.fandom.com/wiki/Tutorials/Creating_a_resource_pack

### Build Tools
- Vite: https://vitejs.dev/
- React: https://react.dev/
- TailwindCSS: https://tailwindcss.com/
- TypeScript: https://www.typescriptlang.org/

---

## 🎯 Next Steps

1. **Approve this plan** - Review and confirm approach
2. **Setup development environment** - Install Rust, Node.js, etc.
3. **Create Tauri project scaffold** - Generate boilerplate
4. **Start Phase 1** - Begin migration

**Estimated Timeline:** 6 weeks for full migration
**Team Size:** 1-2 developers
**Risk Level:** Medium (new tech stack but well-documented)

---

**Questions? Concerns? Ready to start?**
