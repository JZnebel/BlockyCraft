# BlockCraft - Claude AI Context

## Project Overview

BlockCraft is a visual programming tool for creating Minecraft Java Edition mods using a block-based interface (Blockly). Users can create custom items, mobs, commands, and behaviors without writing code, then test them instantly in a bundled Minecraft server.

**Current Status:** MVP/Proof of Concept ✅
**Next Phase:** Migrating to production-ready Tauri desktop application

---

## Architecture Migration Plan

### Current State (MVP)
- **Frontend:** Single `index.html` (794 lines) + vanilla JS
- **Backend:** Python Flask (3 files)
- **Database:** Browser localStorage
- **Deployment:** Manual setup (requires Python, Minecraft server, Gradle, Java)

### Target State (Tauri App)
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Rust (Tauri commands)
- **Database:** SQLite (embedded)
- **Deployment:** Native installers (.exe, .dmg, .deb) with bundled Fabric server

**See full details in:** `ARCHITECTURE_PLAN.md`

---

## Key Technologies

### Frontend Stack
- **Blockly** - Visual block-based programming interface
- **React 18** - Component-based UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **@tauri-apps/api** - Frontend bindings for Tauri

### Backend Stack
- **Tauri 2.0** - Rust-based desktop app framework
- **SQLite** - Embedded database for projects and textures
- **Gradle 8.8** - Java build tool (bundled)
- **Fabric API** - Minecraft modding framework
- **OpenAI GPT Image 1** - AI texture generation

### Minecraft Integration
- **Minecraft Java Edition 1.21.1**
- **Fabric Loader 0.16.9**
- **Fabric API 0.100.0**
- **Java 21** - Required runtime

---

## Project Structure (Target)

```
blockcraft/
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs              # Tauri entry point
│   │   ├── commands/            # API commands callable from frontend
│   │   │   ├── project.rs       # Project CRUD
│   │   │   ├── compiler.rs      # Mod compilation with Gradle
│   │   │   ├── server.rs        # Minecraft server management
│   │   │   ├── installer.rs     # Fabric client auto-installer
│   │   │   └── texture.rs       # AI texture generation
│   │   ├── database/            # SQLite layer
│   │   │   ├── models.rs        # Data models
│   │   │   └── schema.sql       # Database schema
│   │   └── utils/
│   │       ├── minecraft.rs     # .minecraft folder detection
│   │       └── paths.rs         # Cross-platform paths
│   ├── resources/               # Files bundled in installer
│   │   ├── server/
│   │   │   ├── fabric-server-launcher.jar
│   │   │   ├── minecraft-server-1.21.1.jar
│   │   │   └── fabric-api.jar
│   │   ├── gradle/
│   │   │   └── gradle-8.8-all.zip
│   │   └── templates/           # Java code templates
│   │       ├── BlockCraftMod.java.template
│   │       └── build.gradle.template
│   ├── Cargo.toml
│   └── tauri.conf.json          # Tauri configuration
│
├── src/                         # React frontend
│   ├── components/
│   │   ├── BlocklyEditor/       # Visual block editor
│   │   ├── ProjectManager/      # Project list/create/load
│   │   ├── TextureGenerator/    # Upload/AI texture gen
│   │   ├── ServerMonitor/       # Server status/logs
│   │   └── Layout/              # App layout components
│   ├── blocks/                  # Blockly block definitions
│   │   ├── custom_items.ts
│   │   ├── custom_mobs.ts
│   │   ├── events.ts
│   │   └── actions.ts
│   ├── generators/              # Blockly → Java code generators
│   │   ├── java.ts
│   │   ├── custom_items_java.ts
│   │   └── custom_mobs_java.ts
│   ├── hooks/                   # React hooks
│   │   ├── useProjects.ts       # Project state management
│   │   ├── useServer.ts         # Server control
│   │   └── useTextures.ts       # Texture handling
│   ├── lib/
│   │   ├── tauri.ts             # Tauri command wrappers
│   │   └── blockly.ts           # Blockly utilities
│   ├── types/                   # TypeScript type definitions
│   ├── App.tsx                  # Main app component
│   └── main.tsx                 # React entry point
│
├── public/
│   └── blockly/                 # Blockly library files
│
├── .claude/
│   └── claude.md                # This file
│
├── ARCHITECTURE_PLAN.md         # Detailed migration plan
├── GPT_IMAGE_API.md             # OpenAI API documentation
├── README.md                    # User-facing documentation
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── .gitignore
```

---

## Current Features (MVP)

### Working Features ✅
1. **Custom Items**
   - Visual block for defining items
   - Texture upload (PNG, persists across sessions)
   - AI texture generation (GPT Image 1 integration ready)
   - Properties: name, max stack size, rarity, tooltip
   - Auto-generates Minecraft item registration code

2. **Custom Mobs**
   - Visual block for defining entities
   - Sprite texture upload (billboard rendering)
   - AI behaviors: Follow player, wander, melee attack, flee from player
   - Movement speed, health, attack damage configuration
   - Auto-generates entity registration and renderer code

3. **Custom Commands**
   - Slash command creation (`/command_name`)
   - Integration with custom items/mobs
   - Message output, item giving, mob spawning

4. **Project Management**
   - Create/load/save projects (localStorage → SQLite in new version)
   - JSON serialization with texture data persistence
   - Auto-save on changes

5. **Mod Compilation & Deployment**
   - Generates Fabric 1.21.1 mod structure
   - Java source code generation from blocks
   - Gradle build automation
   - Language file generation (en_us.json) for display names
   - Auto-deploy to server mods folder
   - Server restart after deployment

6. **Development Tools**
   - Loading overlay during compilation
   - Success/error notifications
   - Example projects

---

## Migration Roadmap

See `ARCHITECTURE_PLAN.md` for detailed timeline. Summary:

### Phase 1: Setup (Week 1)
- Install Tauri CLI and dependencies
- Create Tauri project scaffold
- Setup Vite + React + TypeScript
- Configure TailwindCSS

### Phase 2: Frontend Migration (Week 2-3)
- Convert HTML → React components
- Migrate Blockly blocks to TypeScript
- Migrate code generators to TypeScript
- Implement React state management
- Create project UI components

### Phase 3: Backend Implementation (Week 3-4)
- Setup SQLite database with schema
- Implement Tauri commands (project, compiler, server, installer)
- Bundle Fabric server and resources
- Implement Fabric client auto-installer

### Phase 4: Integration & Testing (Week 5)
- Connect frontend to Rust backend
- Test full workflow end-to-end
- Cross-platform testing (Windows, macOS, Linux)

### Phase 5: Polish & Distribution (Week 6)
- UI/UX improvements
- Error handling and logging
- Build production installers
- Documentation

### Phase 6: Advanced Features (Future)
- Update GPT Image 1 API (transparent backgrounds)
- Mod export/sharing
- Mod marketplace
- Multi-language support
- Auto-updates

---

## Important Patterns & Conventions

### File Naming
- React components: `PascalCase.tsx`
- Hooks: `use*.ts`
- Utilities: `camelCase.ts`
- Types: `PascalCase` interfaces/types
- Rust files: `snake_case.rs`

### Code Generation Pattern
```
Blockly Workspace (JSON)
    ↓
Frontend: Block definitions (TypeScript)
    ↓
Frontend: Code generators (TypeScript → Java source)
    ↓
Backend: Tauri command (Rust)
    ↓
Gradle: Compile Java source → JAR
    ↓
Deploy: Copy JAR to server/client mods folders
```

### Tauri Command Pattern
```typescript
// Frontend (React)
import { invoke } from '@tauri-apps/api/tauri';

const result = await invoke<CompilationResult>('compile_mod', {
  blocksJson: JSON.stringify(workspace)
});
```

```rust
// Backend (Rust)
#[tauri::command]
async fn compile_mod(blocks_json: String) -> Result<CompilationResult, String> {
    // Parse blocks
    // Generate Java code
    // Run Gradle
    // Return result
}
```

---

## Key Implementation Details

### 1. Texture Persistence
**Current (localStorage):**
- Blocks have `saveExtraState` / `loadExtraState` methods
- Textures stored as base64 in block state
- Project uses JSON serialization (not XML)

**New (SQLite):**
```sql
CREATE TABLE textures (
    id INTEGER PRIMARY KEY,
    project_id INTEGER,
    block_id TEXT,        -- Which block this belongs to
    image_data BLOB,      -- PNG binary or base64
    created_at INTEGER,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

### 2. Server Management
**Bundled Server Location:**
```
Tauri App Bundle:
  resources/server/fabric-server-launcher.jar
  resources/server/minecraft-server-1.21.1.jar
  resources/server/fabric-api.jar

Runtime Location (extracted on first run):
  ~/.blockcraft/server/
```

**Server Start Process:**
```rust
#[tauri::command]
async fn start_server() -> Result<(), String> {
    let server_dir = app_data_dir().join("server");

    // Copy bundled JARs if not already extracted
    ensure_server_files(&server_dir)?;

    // Start server process
    let mut child = Command::new("java")
        .arg("-Xmx2G")
        .arg("-Xms1G")
        .arg("-jar")
        .arg("fabric-server-launcher.jar")
        .arg("nogui")
        .current_dir(&server_dir)
        .stdout(Stdio::piped())
        .spawn()?;

    // Stream logs to frontend via events
    spawn_log_reader(child.stdout);

    Ok(())
}
```

### 3. Fabric Client Auto-Installation
**Detection:**
```rust
fn detect_minecraft_folder() -> Option<PathBuf> {
    #[cfg(windows)]
    let base = env::var("APPDATA").ok()?.into();

    #[cfg(target_os = "macos")]
    let base = dirs::home_dir()?.join("Library/Application Support");

    #[cfg(target_os = "linux")]
    let base = dirs::home_dir()?;

    let minecraft = base.join(".minecraft");
    minecraft.exists().then(|| minecraft)
}
```

**Installation:**
1. Check if Fabric already installed
2. If not: Download and run Fabric installer JAR
3. Create launcher profile "BlockCraft Fabric"
4. Copy Fabric API to `.minecraft/mods/`
5. Copy user's mod to `.minecraft/mods/`

### 4. AI Texture Generation (GPT Image 1)
**API Call:**
```typescript
const response = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-image-1-mini',
    prompt: `16x16 pixel art minecraft ${description} on transparent background`,
    background: 'transparent',  // KEY: Enables transparency
    size: '1024x1024',
    output_format: 'png',
    quality: 'low'  // Cheapest, fine for pixel art
  })
});

const data = await response.json();
const base64Image = data.data[0].b64_json;  // NOT a URL!

// Resize to 16x16 and save
const img = await loadImageFromBase64(base64Image);
const resized = resizeImage(img, 16, 16);
```

**See:** `GPT_IMAGE_API.md` for complete documentation

---

## Common Tasks

### Adding a New Blockly Block
1. Create block definition in `src/blocks/*.ts`
2. Add code generator in `src/generators/*_java.ts`
3. Register in Blockly toolbox configuration
4. Add corresponding Java template if needed

### Adding a Tauri Command
1. Define command in `src-tauri/src/commands/*.rs`
2. Add `#[tauri::command]` attribute
3. Register in `main.rs`: `.invoke_handler(tauri::generate_handler![...])`
4. Create TypeScript wrapper in `src/lib/tauri.ts`
5. Use in React component via `invoke()`

### Updating Database Schema
1. Modify `src-tauri/src/database/schema.sql`
2. Add migration logic in `src-tauri/src/database/migrations.rs`
3. Update models in `src-tauri/src/database/models.rs`
4. Bump schema version

### Building for Production
```bash
# Development
npm run tauri dev

# Production build
npm run tauri build

# Output:
# - Windows: target/release/bundle/nsis/blockcraft_1.0.0_x64-setup.exe
# - macOS: target/release/bundle/dmg/blockcraft_1.0.0_aarch64.dmg
# - Linux: target/release/bundle/appimage/blockcraft_1.0.0_amd64.AppImage
```

---

## Critical Dependencies

### Must Be Installed on User's Machine
- **Java 21** - Required to run Minecraft and Gradle
  - Future: Consider bundling Java runtime (adds ~200 MB)
- **Minecraft Java Edition** - Cannot be bundled (legal restrictions)

### Bundled in Tauri App
- Fabric server JAR
- Minecraft server JAR
- Fabric API mod
- Gradle wrapper
- Java code templates

### Frontend Dependencies (npm)
- `react` + `react-dom`
- `@tauri-apps/api` + `@tauri-apps/cli`
- `blockly`
- `tailwindcss`
- `zustand`
- `react-query`

### Backend Dependencies (Cargo)
- `tauri` (framework)
- `serde` + `serde_json` (serialization)
- `rusqlite` (SQLite bindings)
- `tokio` (async runtime)
- `reqwest` (HTTP client for OpenAI API)

---

## Known Issues & Limitations

### Current MVP Issues (Being Fixed in Migration)
1. ❌ Monolithic `index.html` - hard to maintain
2. ❌ Hardcoded file paths - breaks on different systems
3. ❌ localStorage as database - no querying, limited storage
4. ❌ Manual Fabric client setup - user must install themselves
5. ❌ No error recovery - if Gradle fails, unclear why
6. ❌ Texture generator uses old DALL-E API (no transparency)

### Platform-Specific Challenges
1. **Windows:** Path separators, antivirus false positives
2. **macOS:** Gatekeeper security, unsigned apps warning
3. **Linux:** Different distros, Java installation varies

### Performance Considerations
1. **Gradle first build:** ~30s (downloads dependencies)
2. **Subsequent builds:** ~10-15s
3. **Server startup:** ~10s
4. **App bundle size:** ~230 MB (with server) or ~10 MB (lite version)

---

## Testing Strategy

### Unit Tests
- Block definitions (TypeScript)
- Code generators (verify Java output)
- Tauri commands (Rust)

### Integration Tests
- Full compile workflow (blocks → Java → JAR)
- Server start/stop
- Fabric installation
- Database operations

### E2E Tests
1. Create new project
2. Add custom item block
3. Upload texture
4. Build mod
5. Start server
6. Verify mod loaded
7. Test in-game

### Cross-Platform Testing
- Test on: Windows 11, macOS Sonoma, Ubuntu 22.04
- Verify: Installation, compilation, server start, client install

---

## Security Considerations

1. **API Keys:** Encrypt OpenAI key in SQLite, never log
2. **File Access:** Tauri restricts to allowed directories only
3. **Network:** Only allow OpenAI API and localhost
4. **Code Execution:** Gradle runs in subprocess, sandboxed
5. **Updates:** Use Tauri signed updates (prevents MITM)
6. **Installers:** Code sign all production builds

---

## Resources & Documentation

### Official Documentation
- Tauri: https://tauri.app/
- React: https://react.dev/
- Blockly: https://developers.google.com/blockly
- Fabric: https://fabricmc.net/wiki/

### Internal Documentation
- `ARCHITECTURE_PLAN.md` - Full migration roadmap
- `GPT_IMAGE_API.md` - OpenAI texture generation guide
- `README.md` - User-facing documentation

### Example Code
- Current blocks: `blocks/custom_items.js`, `blocks/custom_mobs.js`
- Current generators: `generators/custom_items_java.js`
- Current Python API: `deploy_java_api.py`

---

## Development Workflow

### Starting Development (Current MVP)
```bash
cd /home/jordan/blockcraft
./start.sh  # Starts both Flask API and Minecraft server
# Open http://localhost:3457 in browser
```

### Starting Development (Future Tauri)
```bash
cd /home/jordan/blockcraft
npm install
npm run tauri dev
# Tauri window opens automatically
```

### Git Workflow
- Main branch: `master` (MVP snapshot committed)
- Development: Create `tauri-migration` branch
- Commit regularly with descriptive messages
- Use conventional commits: `feat:`, `fix:`, `refactor:`, etc.

---

## AI Assistant Guidelines

When helping with BlockCraft development:

1. **Understand the migration context** - We're moving FROM vanilla JS TO React + Tauri
2. **Preserve functionality** - Don't remove working features during migration
3. **Follow the plan** - Reference `ARCHITECTURE_PLAN.md` for structure
4. **TypeScript first** - All new code should be TypeScript
5. **Test cross-platform** - Consider Windows, macOS, Linux differences
6. **Security aware** - Never expose API keys, sanitize file paths
7. **Performance matters** - Keep builds fast, minimize bundle size
8. **Document changes** - Update this file when architecture changes

### Code Examples Should:
- Use TypeScript (not JavaScript)
- Use React hooks (not class components)
- Use Tauri commands (not direct Python calls)
- Handle errors properly (Result types in Rust, try/catch in TS)
- Include type definitions
- Be cross-platform compatible

### When Suggesting Changes:
- Explain WHY, not just HOW
- Reference the migration plan
- Consider backwards compatibility
- Provide migration path for existing data

---

## Questions? Start Here:

1. **"How do I..."** → Check this file first, then `ARCHITECTURE_PLAN.md`
2. **"Where is X implemented?"** → See Project Structure section above
3. **"Why did you choose Y?"** → See Key Decisions in `ARCHITECTURE_PLAN.md`
4. **"Can I change Z?"** → Yes, but document in this file and update plan

---

Last Updated: 2025-11-15
Migration Status: Planning Phase
Current Version: MVP (committed: `936ee74`)
Target Version: 1.0.0 (Tauri App)
