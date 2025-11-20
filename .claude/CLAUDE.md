# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BlocklyCraft is a **hybrid Tauri + Python desktop application** for creating Minecraft Java Edition mods using visual programming (Blockly). Users create custom items, mobs, commands, AI-generated 3D models, and behaviors through drag-and-drop blocks—no coding required.

**Current Status:** Production-ready desktop app with multi-platform support in progress
**Version:** 1.0.0
**Tech Stack:** Tauri 2.0 (Rust) + React 18 + TypeScript + Python Flask API
**Minecraft:** Fabric 1.21.1 with custom auto-update loader mod

## Architecture

### Hybrid Backend System

BlocklyCraft uses a **unique dual-backend architecture**:

1. **Tauri Backend (Rust)** - `src-tauri/`
   - Database operations (SQLite)
   - OpenAI API integration (texture + model generation)
   - File system operations
   - Settings management
   - Automatically starts Python API on app launch

2. **Python Flask API** - `deploy_java_api.py` (port 8585)
   - Mod compilation (Gradle)
   - Java code generation from Blockly blocks
   - Resource pack generation
   - Mod deployment to Minecraft server
   - Auto-started by Tauri in development mode

### Frontend Stack

- **React 18 + TypeScript** - Component framework
- **Vite** - Build tool (port 1420)
- **Blockly** - Visual programming library (Zelos renderer = Scratch-style)
- **TailwindCSS** - Styling
- **Zustand** - State management

### Database Schema (SQLite)

Located at: `~/.local/share/com.blocklycraft.app/blockcraft.db` (Linux)

```sql
-- Projects with multi-platform support
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    workspace_xml TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'fabric',  -- 'fabric' | 'bukkit' | 'bedrock'
    edition TEXT NOT NULL DEFAULT 'java',     -- 'java' | 'bedrock'
    minecraft_version TEXT NOT NULL DEFAULT '1.21.1',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Media library (textures, models)
CREATE TABLE media (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    file_name TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL
);

-- AI-generated 3D models
CREATE TABLE ai_models (
    id INTEGER PRIMARY KEY,
    model_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    prompt TEXT NOT NULL,
    blocks_json TEXT NOT NULL,
    generated_by TEXT NOT NULL,
    generated_code TEXT,
    block_count INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
);

-- App settings (API keys, etc.)
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);
```

## Development Commands

### Starting Development

**Recommended (auto-starts everything):**
```bash
npm start              # Linux/Mac: Vite dev server + Python API
npm run start:tauri    # Tauri app + auto-starts Python API
npm run start:windows  # Windows: both servers
```

**Manual start:**
```bash
npm run dev            # Vite dev server only (port 1420)
npm run tauri:dev      # Tauri app (auto-starts Python API)
python3 deploy_java_api.py  # Python API only (port 8585)
```

### Building

```bash
npm run build          # Build frontend only
npm run tauri:build    # Build desktop app installers
```

### Testing

No automated tests currently. Manual testing workflow:
1. Create project with blocks
2. Click "Compile" (validates code generation)
3. Click "Deploy Mod" (builds JAR + deploys to server)
4. Test in Minecraft

## Project Structure

**IMPORTANT:** Generators are JavaScript files in `/generators`, NOT TypeScript in `/src/generators`!

```
blockcraft/
├── src/                           # React frontend
│   ├── components/
│   │   ├── BlocklyEditor/         # Main workspace component
│   │   ├── ExamplesPanel/         # Project browser + examples
│   │   ├── AIModelsPanel/         # AI model library
│   │   ├── MediaLibrary/          # Texture/model upload
│   │   ├── Header/                # Top navigation
│   │   ├── SettingsModal/         # API keys, platform settings
│   │   └── Modal/                 # Reusable modal dialogs
│   ├── blocks/                    # Blockly block definitions (TypeScript)
│   │   ├── basic_blocks.ts        # Logic, loops, math
│   │   ├── events_actions.ts      # Minecraft events (commands, right-click, etc.)
│   │   ├── custom_items.ts        # Custom item blocks
│   │   ├── custom_mobs.ts         # Custom mob blocks
│   │   ├── ai_model_advanced.ts   # AI model spawning blocks
│   │   └── block_display.ts       # Block display entity blocks
│   ├── utils/
│   │   ├── blockly-generator.ts   # Routes to /generators/java.js
│   │   ├── database.ts            # Tauri DB command wrappers
│   │   └── startup-examples.ts    # 20+ example projects
│   ├── App.tsx                    # Main app component
│   └── main.tsx                   # React entry point
│
├── src-tauri/                     # Rust backend
│   ├── src/
│   │   ├── main.rs                # Tauri entry + auto-starts Python API
│   │   ├── db.rs                  # SQLite schema + migrations
│   │   └── commands/
│   │       ├── mod.rs             # Mod compilation commands
│   │       ├── db_commands.rs     # Database CRUD
│   │       ├── openai.rs          # Texture generation (GPT Image 1)
│   │       └── openai_codegen.rs  # 3D model generation (Codegen)
│   ├── Cargo.toml                 # Rust dependencies
│   └── tauri.conf.json            # Tauri app configuration
│
├── generators/                    # ⚠️ JAVASCRIPT (not TypeScript!)
│   ├── java.js                    # Main Fabric code generator (34KB)
│   ├── custom_items_java.js       # Custom item codegen
│   ├── custom_mobs_java.js        # Custom mob codegen
│   └── datapack.js                # Datapack generation (unused)
│
├── blocklycraft-loader/           # Fabric mod with auto-update
│   ├── src/main/java/
│   │   └── com/blockcraft/loader/
│   │       ├── BlocklyCraftLoader.java  # Fabric mod entrypoint
│   │       └── ModDownloader.java       # HTTP mod fetcher
│   └── build.gradle               # Gradle 8.8 config
│
├── http-installer/                # Client installer scripts
│   ├── install-blocklycraft.sh    # Linux/Mac installer
│   ├── install-blocklycraft.bat   # Windows installer
│   └── install-blocklycraft.command  # Mac double-click
│
├── deploy_java_api.py             # Flask API (port 8585)
├── texture_generator.py           # Texture helpers
├── resource_pack_generator.py     # Resource pack builder
├── recipe_generator.py            # Crafting recipes
├── mod-template/                  # Fabric mod template
├── public/
│   ├── categories/                # Category icons
│   └── minecraft-textures/        # 2000+ vanilla textures
├── package.json                   # npm scripts
├── vite.config.ts                 # Vite config (port 1420)
├── tsconfig.json                  # TypeScript config
├── tailwind.config.js             # Tailwind config
└── MULTI_PLATFORM_PLAN.md         # Multi-platform roadmap

```

## Code Generation Flow

This is the **core workflow** of BlocklyCraft:

```
1. User drags Blockly blocks in React UI
        ↓
2. BlocklyEditor serializes to workspace XML
        ↓
3. blockly-generator.ts imports /generators/java.js
        ↓
4. java.js generates Java source code + Fabric mod structure
        ↓
5. Frontend calls Tauri command compile_mod() with generated code
        ↓
6. Tauri command calls Python API POST /api/deploy
        ↓
7. Python API:
   - Copies mod-template/ to /tmp/blockcraft-build/
   - Injects generated Java code
   - Runs Gradle build
   - Copies JAR to ~/minecraft-fabric-1.21.1-cobblemon/mods/
        ↓
8. Server detects new mod and hot-reloads (Fabric)
```

## Multi-Platform Support (In Progress)

See `MULTI_PLATFORM_PLAN.md` for full details.

**Goal:** Support Fabric, Bukkit/Paper, and Bedrock Edition from one codebase.

**Current Status:**
- ✅ Database schema updated (platform/edition/version columns)
- ⚠️ UI needs platform selection in project creation
- ⚠️ Need separate generators: `bukkit.js`, `bedrock.js`
- ⚠️ Block compatibility filtering not implemented

**Platform Field Values:**
- `platform`: 'fabric' | 'bukkit' | 'bedrock'
- `edition`: 'java' | 'bedrock'
- `minecraft_version`: '1.21.1', '1.20.4', etc.

## Adding New Features

### Adding a Blockly Block

1. **Define block in TypeScript** - `src/blocks/*.ts`
   ```typescript
   Blockly.Blocks['my_block'] = {
     init: function() {
       this.appendDummyInput()
         .appendField("My Block");
       this.setPreviousStatement(true, null);
       this.setNextStatement(true, null);
       this.setColour(230);
     }
   };
   ```

2. **Add code generator in JavaScript** - `generators/java.js`
   ```javascript
   Blockly.JavaScript['my_block'] = function(block) {
     return 'System.out.println("Hello from my block");';
   };
   ```

3. **Register in toolbox** - `src/components/BlocklyEditor/BlocklyEditor.tsx`

### Adding a Tauri Command

1. **Define in Rust** - `src-tauri/src/commands/*.rs`
   ```rust
   #[tauri::command]
   pub async fn my_command(param: String) -> Result<String, String> {
       Ok(format!("Received: {}", param))
   }
   ```

2. **Register in main.rs**
   ```rust
   .invoke_handler(tauri::generate_handler![
       my_command,
       // ... other commands
   ])
   ```

3. **Call from frontend**
   ```typescript
   import { invoke } from '@tauri-apps/api/core';
   const result = await invoke<string>('my_command', { param: 'test' });
   ```

### Updating Database Schema

1. **Add migration in `src-tauri/src/db.rs`**
   ```rust
   self.conn.execute(
       "ALTER TABLE projects ADD COLUMN new_field TEXT DEFAULT 'value'",
       [],
   ).ok(); // .ok() ignores error if column exists
   ```

2. **Update TypeScript interface in `src/utils/database.ts`**

## Key Files to Know

### Configuration
- `src-tauri/tauri.conf.json` - Tauri app config (window size, bundle settings)
- `vite.config.ts` - Dev server (port 1420), path aliases
- `package.json` - npm scripts (start, build, tauri commands)

### State Management
- `src/App.tsx` - Main app state (workspace, current project)
- `src/components/BlocklyEditor/BlocklyEditor.tsx` - Blockly workspace initialization

### Python API Endpoints
- `POST /api/deploy` - Compile and deploy mod
  - Body: `{ projectId, projectName, commands, customItems, customMobs, aiModels }`
  - Returns: `{ success, jarPath, errors }`

### Hardcoded Paths (Linux-specific)
- Minecraft server: `/home/jordan/minecraft-fabric-1.21.1-cobblemon/`
- Build directory: `/tmp/blockcraft-build/`
- Mod template: `./mod-template/`

⚠️ **TODO:** Make paths configurable for cross-platform support

## Important Patterns

### Texture Handling

Textures are stored in the media library and referenced by filename:

```typescript
// Block saves media filename, not base64
block.setFieldValue('my_texture.png', 'MEDIA_TEXTURE');

// Frontend fetches from Tauri filesystem
const mediaPath = await invoke('get_media_path', { fileName: 'my_texture.png' });
```

### AI Model Generation

Two AI systems:
1. **GPT Image 1** (`openai.rs`) - Item textures (16x16 PNG)
2. **Codegen** (`openai_codegen.rs`) - 3D models (block display entities)

Both store API keys in settings table and generate code/models on-demand.

### Python API Auto-Start

Tauri automatically starts Python API in development:

```rust
// src-tauri/src/main.rs
fn start_python_api(_app_handle: &AppHandle) -> Option<Child> {
    // Kills existing process on port 8585
    kill_process_on_port(8585);

    // Starts python3 deploy_java_api.py
    Command::new("python3")
        .arg("deploy_java_api.py")
        .spawn()
}
```

## Common Development Tasks

### Changing Minecraft Version

1. Update `MULTI_PLATFORM_PLAN.md` version references
2. Update Fabric loader version in `blocklycraft-loader/build.gradle`
3. Update default in `src-tauri/src/db.rs`: `minecraft_version TEXT NOT NULL DEFAULT '1.21.1'`
4. Test compilation with new version

### Adding Example Project

1. Define project data in `src/utils/startup-examples.ts`
2. Use existing block types (events_actions, custom_items, etc.)
3. Test by loading example in Examples Panel

### Debugging Compilation Errors

1. Check browser console for frontend errors
2. Check Python API console output (Gradle errors)
3. Inspect `/tmp/blockcraft-build/` for generated Java code
4. Run Gradle manually: `cd /tmp/blockcraft-build && gradle build`

## Dependencies

### Required on User Machine
- **Java 21** - Minecraft + Gradle
- **Node.js 18+** - Frontend build
- **Python 3.8+** - Flask API
- **Rust** - Tauri compilation (dev only)

### npm Dependencies
- `react@18.3.1` + `react-dom`
- `@tauri-apps/api@2.2.0` + `@tauri-apps/cli@2.2.0`
- `blockly@11.1.1`
- `tailwindcss@3.4.17`
- `zustand@5.0.2`
- `three@0.181.1` (3D model preview)

### Cargo Dependencies
- `tauri@2.2` + plugins (dialog, fs, opener)
- `rusqlite@0.32`
- `reqwest@0.12`
- `serde@1.0` + `serde_json@1.0`
- `tokio@1` (async runtime)

### Python Dependencies
- `flask` + `flask-cors`
- `Pillow` (image processing)
- None required for basic operation (texture/recipe generators optional)

## Known Issues

### Platform-Specific
- **Linux only:** Hardcoded paths to `/home/jordan/minecraft-fabric-1.21.1-cobblemon/`
- **Windows:** Path separators need testing
- **macOS:** Untested

### Performance
- First Gradle build: ~30s (downloads Fabric dependencies)
- Subsequent builds: ~10-15s
- Large projects (50+ blocks): Blockly can lag

### Technical Debt
- Generators are still JavaScript (should migrate to TypeScript)
- No automated tests
- No error recovery if Gradle fails mid-build
- API keys stored in plaintext (should encrypt)

## Code Conventions

### File Naming
- React components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Rust files: `snake_case.rs`
- Generators: `kebab-case.js` (legacy)

### Block Naming
- Block type: `category_action` (e.g., `custom_item_define`)
- Generator function: Same as block type (e.g., `Blockly.JavaScript['custom_item_define']`)

### Database Timestamps
- All timestamps are Unix epoch in **seconds** (not milliseconds)
- Created/updated with: `Date.now() / 1000 | 0`

## Git Workflow

- **Main branch:** `main` (production-ready)
- **Commit style:** Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`)
- **Current work:** Multi-platform support (see `MULTI_PLATFORM_PLAN.md`)

## Resources

- [Blockly Developer Docs](https://developers.google.com/blockly)
- [Fabric Wiki](https://fabricmc.net/wiki/)
- [Tauri Docs](https://tauri.app/)
- [React 18 Docs](https://react.dev/)

---

**Last Updated:** 2025-11-18
**Status:** Production-ready with multi-platform support in development
