# BlocklyCraft 🎮

**Visual Minecraft Mod Creator - Powered by AI**

A Scratch 3.0-style visual programming platform for creating Minecraft Fabric mods with AI-generated 3D models. No coding required!

![BlocklyCraft](public/logo.png)

## ✨ Features

### 🎨 Visual Programming
- **Scratch-style Interface** - Drag and drop blocks with Zelos renderer
- **Custom Items & Mobs** - Create unique weapons, tools, and creatures
- **AI Model Generation** - Generate 3D block display models with OpenAI
- **Live Preview** - See your creations instantly

### 🤖 AI-Powered
- **Block Display Models** - AI generates custom 3D models from text descriptions
- **Item Textures** - AI-generated textures for custom items
- **Scientific CodeGen** - Advanced model generation for complex designs

### 💾 Data Management
- **SQLite Database** - Save projects, settings, and AI models locally
- **Project Library** - Load from 20+ example projects
- **Auto-Save** - Never lose your work

### 🚀 Deployment
- **One-Click Deploy** - Compile and deploy to Minecraft server
- **Auto-Update Loader** - Clients automatically download your mods
- **HTTP Installer** - Easy installation for players

## 🎯 Quick Start

### 🚀 One-Click Startup (Recommended)

**Linux/Mac:**
```bash
npm install          # First time only
npm start            # Starts web UI + Python API
# OR for Tauri desktop app:
npm start:tauri      # Starts Tauri app (auto-starts Python API)
```

**Windows:**
```bash
npm install          # First time only
npm run start:windows  # Starts web UI + Python API
```

The startup scripts automatically:
- ✓ Start Python API server (port 8585)
- ✓ Start Vite dev server (port 1420) OR Tauri app
- ✓ Check for port conflicts
- ✓ Clean shutdown with Ctrl+C

### Desktop App (Alternative)

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Development Mode:**
   ```bash
   npm run tauri dev
   # Python API starts automatically!
   ```

3. **Build Desktop App:**
   ```bash
   npm run tauri build
   ```

### Web Version (Manual)

If you prefer to start services manually:

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Start Python API:**
   ```bash
   python3 deploy_java_api.py
   ```

3. **Open Browser:**
   - Navigate to `http://localhost:1420`

## 📦 Installation

### Prerequisites
- **Node.js** 18+ and npm
- **Rust** (for Tauri desktop app)
- **Python** 3.8+ (for API server)
- **Java 21** (for mod compilation)
- **Minecraft** Java Edition 1.21.1 with Fabric Loader

### Setup

```bash
# Clone repository
git clone https://github.com/JZnebel/BlockyCraft.git
cd BlockyCraft

# Install Node dependencies
npm install

# Setup Tauri (if building desktop app)
cd src-tauri
cargo build
cd ..
```

### API Keys (Optional)

For AI model generation, add your OpenAI API keys in Settings:
- **Model Generation API Key** - For block display models
- **Image Generation API Key** - For item textures

## 🎮 Creating Your First Mod

### Example: Flame Sword

1. **Define Custom Item:**
   - Drag "Define Custom Item" block
   - Set name to "Flame Sword"
   - Choose base item (Gold Ingot)
   - Set rarity to EPIC

2. **Add Item Behavior:**
   - Drag "When Custom Item Used" block
   - Add "Area Effect: Damage" (radius 6, power 4)
   - Add "Area Effect: Ignite" (radius 6, power 5)
   - Add "Particles: Flame" (count 50)
   - Add "Player Effect: Strength" (duration 5 seconds)

3. **Create Get Command:**
   - Drag "When Command" block
   - Set command to `/getflamesword`
   - Add "Give Custom Item" block
   - Select "Flame Sword"

4. **Deploy:**
   - Click "Compile" to validate
   - Click "Deploy Mod" to deploy to server
   - In Minecraft: `/getflamesword`
   - Right-click to use!

## 🏗️ Architecture

### Frontend
- **React** 18 + TypeScript
- **Blockly** - Google's visual programming library
- **Zelos Renderer** - Scratch 3.0-style blocks
- **Tauri** - Desktop app framework (Rust)

### Backend
- **Python Flask API** - Mod compilation and deployment
- **SQLite** - Local database for projects and AI models
- **Gradle** - Java/Fabric mod building

### Minecraft Integration
- **Fabric Mod Loader** 1.21.1
- **BlocklyCraft Loader** - Auto-update client mod
- **HTTP Distribution** - Mod delivery system

## 📂 Project Structure

```
BlocklyCraft/
├── src/                          # React frontend
│   ├── components/               # UI components
│   │   ├── BlocklyEditor/       # Main workspace
│   │   ├── ExamplesPanel/       # Project browser
│   │   ├── AIModelsPanel/       # AI model generator
│   │   ├── Header/              # Top navigation
│   │   └── Modal/               # Modal dialogs
│   ├── blocks/                  # Blockly block definitions
│   │   ├── basic_blocks.ts      # Logic, loops, math
│   │   ├── events_actions.ts    # Minecraft events
│   │   ├── custom_items.ts      # Custom item blocks
│   │   └── ai_model_advanced.ts # AI model blocks
│   └── utils/                   # Utilities
│       ├── blockly-generator.ts # Code generation
│       ├── database.ts          # SQLite wrapper
│       └── startup-examples.ts  # Example projects
├── src-tauri/                   # Tauri desktop app
│   ├── src/                     # Rust backend
│   │   ├── commands/            # Tauri commands
│   │   │   ├── mod.rs          # Project operations
│   │   │   ├── db_commands.rs  # Database operations
│   │   │   ├── openai.rs       # AI integration
│   │   │   └── openai_codegen.rs
│   │   └── db.rs               # Database schema
│   └── tauri.conf.json         # Tauri configuration
├── blocklycraft-loader/         # Auto-update Fabric mod
│   ├── src/main/java/          # Java source
│   │   └── com/blockcraft/loader/
│   │       ├── BlocklyCraftLoader.java
│   │       └── ModDownloader.java
│   └── build.gradle            # Gradle config
├── http-installer/             # Client installer
│   ├── index.html             # Download page
│   ├── install-blocklycraft.bat    # Windows
│   ├── install-blocklycraft.command # Mac
│   └── install-blocklycraft.sh     # Linux
├── deploy_java_api.py         # Flask API server
└── public/                    # Static assets
    ├── categories/            # Category icons
    └── minecraft-textures/    # 2,000+ block textures

```

## 🔧 API Endpoints

### Deployment API (Port 8585)
- `POST /api/deploy` - Compile and deploy mod
- `GET /api/mods-manifest` - List deployed mods (for auto-updater)

### Parameters
```json
{
  "projectId": "my_project",
  "projectName": "My Mod",
  "commands": [...],
  "customItems": [...],
  "customMobs": [...],
  "aiModels": [...]
}
```

## 🎨 Block Categories

### Events (Purple)
- When Command - `/command`
- When Right Click - Item interaction
- When Break Block - Block breaking

### Actions (Green)
- Display Message - Chat messages
- Give Item - Item rewards
- Spawn Mob - Entity spawning
- Play Sound - Sound effects
- Particles - Visual effects

### Logic (Blue)
- If/Else - Conditional logic
- Repeat - Loops
- And/Or - Boolean operations

### Player (Light Blue)
- Player Health - Modify health
- Player Effect - Status effects
- Is Sneaking - Check conditions

### Motion (Dark Blue)
- Teleport Forward - Movement
- Launch - Knockback effects

### Custom Items (Orange)
- Define Custom Item - Create items
- Custom Item Used - Item behavior
- Give Custom Item - Item distribution

### AI Models (Pink)
- Spawn AI Model - Place 3D models
- Spawn Scaled - Size variation
- Spawn Rotated - Orientation
- Spawn Circle - Pattern placement

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- **Google Blockly** - Visual programming framework
- **Scratch** - UI/UX inspiration
- **Fabric** - Minecraft modding framework
- **Tauri** - Desktop app framework
- **OpenAI** - AI model generation

## 🐛 Troubleshooting

### Desktop App Won't Start
- Check Rust is installed: `rustc --version`
- Rebuild: `cd src-tauri && cargo clean && cargo build`

### Compilation Fails
- Ensure Java 21 is installed: `java -version`
- Check Python API is running on port 8585

### Mods Don't Load in Minecraft
- Install Fabric Loader 1.21.1
- Place mods in `.minecraft/mods/`
- Check Fabric API is installed

### AI Models Not Generating
- Verify OpenAI API keys in Settings
- Check API key has sufficient credits
- Ensure Python API has internet access

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/JZnebel/BlockyCraft/issues)
- **Discussions:** [GitHub Discussions](https://github.com/JZnebel/BlockyCraft/discussions)

---

Made with ❤️ for Minecraft modders and aspiring programmers!
