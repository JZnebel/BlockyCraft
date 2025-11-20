# Multi-Platform Support Plan

## 🎯 Current Status: Phase 1-4 Complete ✅

**Frontend**: 100% complete - full multi-platform support functional
**Backend**: In progress - deployment API needs platform-specific implementations

See [MULTI_PLATFORM_STATUS.md](./MULTI_PLATFORM_STATUS.md) for detailed implementation documentation.

---

## Overview

Transform BlocklyCraft from a Fabric-only mod generator into a multi-platform code generation tool supporting:
- **Fabric** (Java Edition - Mods) ✅
- **Bukkit/Spigot/Paper** (Java Edition - Plugins) ✅ (frontend only)
- **Bedrock Edition** (Behavior Packs) 🔜 (future)

This will dramatically increase BlocklyCraft's reach and usefulness across the Minecraft ecosystem.

---

## Goals

1. **Platform Selection**: ✅ Global platform settings in SettingsModal (not per-project)
2. **Platform-Aware Blocks**: ✅ Toolbox filtered by BLOCK_COMPATIBILITY map
3. **Multi-Generator Architecture**: ✅ Generator routing with switch statement (fabric/bukkit/bedrock)
4. **Example Filtering**: ✅ Examples filtered by platform compatibility
5. **Version Tracking**: ✅ Minecraft version stored in settings (1.21.1)

---

## Market Analysis

### Target Server Types (by popularity):

1. **Paper/Spigot (70-80%)** - Most public servers
   - Bukkit API plugins
   - Vanilla clients can connect
   - Best performance optimization

2. **Fabric (10-15%)** - Growing modding platform
   - Current BlocklyCraft target
   - Technical/modding communities

3. **Bedrock (Mobile/Console)** - Different player base
   - Mobile, Xbox, PlayStation, Switch
   - Behavior packs (JSON + JavaScript)

---

## Architecture Changes ✅

### 1. Database Schema - COMPLETED

**Implementation Note**: Platform settings are stored **globally** in the settings table, not per-project. This is because:
- Toolbox must be filtered before any project is loaded
- Users typically work on one platform at a time
- Simpler UX - set once in Settings, applies to all projects

#### **Settings Table** (Global Platform Settings)
```sql
-- Uses existing settings table with key-value pairs
INSERT INTO settings (key, value) VALUES ('platform', 'fabric');
INSERT INTO settings (key, value) VALUES ('edition', 'java');
INSERT INTO settings (key, value) VALUES ('minecraft_version', '1.21.1');
```

**Settings Keys:**
- `platform`: 'fabric' | 'bukkit' | 'bedrock'
- `edition`: 'java' | 'bedrock'
- `minecraft_version`: '1.21.1'

#### **TypeScript Interface**
```typescript
// Projects table unchanged - no platform columns needed
export interface DbProject {
  id?: number;
  name: string;
  workspace_xml: string;
  created_at: number;
  updated_at: number;
}

// Platform loaded from settings on app startup
const platform = await dbGetSetting('platform');
const edition = await dbGetSetting('edition');
const minecraftVersion = await dbGetSetting('minecraft_version');
```

---

### 2. Code Generator Architecture - COMPLETED

#### **Current Structure** ✅
```
generators/
  ├── java.js       (Fabric API - 340 lines) ✅
  ├── bukkit.js     (Bukkit/Spigot/Paper API - 340 lines) ✅
  └── bedrock.js    (Future - Behavior Packs)
```

#### **Generator Routing** ✅
Implemented in `src/utils/blockly-generator.ts`:
```typescript
export async function generateModData(
  workspace: Blockly.WorkspaceSvg,
  platform: 'fabric' | 'bukkit' | 'bedrock' = 'fabric'
): Promise<ModData> {
  // Route to correct generator
  switch (platform) {
    case 'fabric':
      codeData = generateJavaCode(workspace);  // generators/java.js
      break;
    case 'bukkit':
      codeData = generateBukkitCode(workspace);  // generators/bukkit.js
      break;
    case 'bedrock':
      throw new Error('Bedrock platform is not yet supported');
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
  return modData;
}
```

#### **Generator Interface**
Each generator exports:
```javascript
export function generateCode(workspace) {
  return {
    commands: [...],  // Array of command definitions with code
    events: [...],    // Array of event handlers with code
  }
}
```

---

### 3. Block Compatibility System - COMPLETED

#### **BLOCK_COMPATIBILITY Map** ✅
Implemented in `src/components/BlocklyEditor/BlocklyEditor.tsx` and `src/utils/startup-examples.ts`:

```typescript
const BLOCK_COMPATIBILITY: Record<string, Array<'fabric' | 'bukkit' | 'bedrock'>> = {
  // Events - Both platforms
  'event_command': ['fabric', 'bukkit'],
  'event_right_click': ['fabric', 'bukkit'],
  'event_break_block': ['fabric', 'bukkit'],

  // Custom Items/Mobs - Fabric only
  'custom_item_define': ['fabric'],
  'custom_mob_define': ['fabric'],

  // Block Display Models - Fabric only
  'spawn_block_display_model': ['fabric'],
  'spawn_ai_model_rotated': ['fabric'],
  'spawn_ai_model_scaled': ['fabric'],

  // All other blocks: actions, logic, math, text - Both platforms
  // ...
};
```

#### **Implemented Compatibility**

| Block Type | Fabric | Bukkit | Bedrock | Implementation |
|-----------|--------|--------|---------|----------------|
| Commands | ✅ | ✅ | 🔜 | Both generators |
| Events | ✅ | ✅ | 🔜 | Both generators |
| Player Actions | ✅ | ✅ | 🔜 | Both generators |
| World Actions | ✅ | ✅ | 🔜 | Both generators |
| Custom Items | ✅ | ❌ | 🔜 | Fabric only |
| Custom Mobs | ✅ | ❌ | 🔜 | Fabric only |
| Block Display Models | ✅ | ❌ | ❌ | Fabric only |
| AI Models | ✅ | ❌ | ❌ | Uses block displays |
| Logic/Math/Text | ✅ | ✅ | 🔜 | Both generators |

---

### 4. UI Changes - COMPLETED

#### **A. SettingsModal - Platform Settings** ✅

Implemented in `src/components/SettingsModal/SettingsModal.tsx`:
```
┌────────────────────────────────┐
│  Settings                      │
│                                │
│  API Keys (for AI Models)      │
│  OpenAI: [____________]        │
│  Anthropic: [____________]     │
│                                │
│  Platform Settings             │
│  Edition:                      │
│    ◉ Java Edition              │
│    ○ Bedrock Edition           │
│                                │
│  Platform:                     │
│    ◉ Fabric (Mods)             │
│    ○ Bukkit/Paper (Plugins)    │
│    ○ Bedrock (Add-ons)         │
│                                │
│  Version: [1.21.1 ▼]           │
│                                │
│  [Cancel]  [Save Settings]     │
└────────────────────────────────┘
```

**Global Settings Approach**: Platform stored globally, not per-project. When platform changes, the toolbox and examples filter immediately.

#### **B. Toolbox Filtering** ✅

Implemented in `src/components/BlocklyEditor/BlocklyEditor.tsx`:
- `filterBlocks()` function removes incompatible blocks from toolbox
- Workspace reinitializes when platform prop changes
- Fabric mode: All blocks visible ✅
- Bukkit mode: No Custom Items/Mobs, no Block Display Models ❌
- Bedrock mode: Not yet implemented 🔜

#### **C. Example Filtering** ✅

Implemented in `src/components/ExamplesPanel/ExamplesPanel.tsx`:
- `isExampleCompatible()` parses workspace XML to check block compatibility
- Examples using incompatible blocks are hidden
- useMemo ensures reactive filtering when platform changes

---

## Implementation Phases

### **Phase 1: Foundation** ✅ COMPLETED
- [x] Update database schema (settings table for global platform)
- [x] Update TypeScript interfaces
- [x] Update Rust backend commands
- [x] Test database changes

### **Phase 2: UI Updates** ✅ COMPLETED
- [x] Add platform selection to SettingsModal
- [x] Load platform settings on app startup
- [x] Platform state management in App.tsx
- [x] Pass platform to BlocklyEditor and ExamplesPanel
- [x] Test UI flows

### **Phase 3: Bukkit Generator** ✅ COMPLETED
- [x] Create generators/bukkit.js (340 lines)
- [x] Implement command generation (Bukkit API)
- [x] Implement event generation (Bukkit API)
- [x] Implement all action blocks (message, spawn, give, etc.)
- [x] Update compilation flow routing (switch statement)
- [x] Test Bukkit code generation

### **Phase 4: Block Compatibility** ✅ COMPLETED
- [x] Add BLOCK_COMPATIBILITY map to BlocklyEditor
- [x] Implement toolbox filtering (filterBlocks function)
- [x] Implement example filtering (isExampleCompatible function)
- [x] Test block filtering (Fabric vs Bukkit)
- [x] Document compatibility matrix

### **Phase 5: Backend Deployment** 🚧 IN PROGRESS
**Next Steps:**
- [ ] Copy deploy_java_api.py → deploy_bukkit_api.py
- [ ] Copy deploy_java_api.py → deploy_bedrock_api.py (future)
- [ ] Modify Bukkit version for plugin.yml and Bukkit dependencies
- [ ] Create main router to detect platform and route to appropriate API
- [ ] Test Bukkit plugin compilation and deployment
- [ ] Deploy compiled plugins to appropriate server directory

**Reasoning**: Separate files per platform are cleaner and more maintainable than complex conditionals in one file. Each platform has very different build requirements.

### **Phase 6: Bedrock Generator** 🔜 FUTURE
- [ ] Create generators/bedrock.js
- [ ] Design behavior pack structure
- [ ] Implement command generation (JSON)
- [ ] Implement event generation (JSON)
- [ ] Create manifest.json template
- [ ] Test behavior pack generation

### **Phase 7: Polish & Testing** 🔜 FUTURE
- [ ] Cross-platform testing
- [ ] Documentation updates
- [ ] Example projects for each platform
- [ ] Performance optimization
- [ ] User feedback iteration

---

## Technical Challenges

### 1. **API Differences**

#### Fabric vs Bukkit Command Example:
```java
// Fabric
CommandRegistrationCallback.register((dispatcher, access, env) -> {
    dispatcher.register(literal("test")
        .executes(ctx -> {
            ctx.getSource().sendFeedback(
                Text.literal("Hello!"), false
            );
            return 1;
        }));
});

// Bukkit
public class TestCommand implements CommandExecutor {
    public boolean onCommand(CommandSender sender, Command cmd,
                           String label, String[] args) {
        sender.sendMessage("Hello!");
        return true;
    }
}
```

### 2. **Bedrock JSON Structure**

Completely different from Java:
```json
{
  "format_version": "1.20.0",
  "minecraft:entity": {
    "description": {
      "identifier": "custom:mob",
      "is_spawnable": true
    },
    "components": {
      "minecraft:health": { "value": 20 }
    }
  }
}
```

### 3. **Build Systems**

Different build configurations:
- **Fabric**: Gradle + fabric.mod.json
- **Bukkit**: Maven/Gradle + plugin.yml
- **Bedrock**: manifest.json (no build)

---

## Code Generation Comparison

### **Command Block Example**

#### Input (Blockly):
```
when command "test" run:
  send message "Hello!" to player
```

#### Output (Fabric):
```java
CommandRegistrationCallback.register((dispatcher, access, env) -> {
    dispatcher.register(literal("test")
        .executes(ctx -> {
            ctx.getSource().sendFeedback(Text.literal("Hello!"), false);
            return 1;
        }));
});
```

#### Output (Bukkit):
```java
public class TestCommand implements CommandExecutor {
    @Override
    public boolean onCommand(CommandSender sender, Command command,
                           String label, String[] args) {
        sender.sendMessage("Hello!");
        return true;
    }
}
// + plugin.yml registration
```

#### Output (Bedrock):
```json
{
  "name": "test",
  "description": "Test command",
  "permission": "operator",
  "aliases": []
}
// + JavaScript handler file
```

---

## Success Criteria

### **Must Have:**
- [x] Users can select platform in Settings ✅
- [x] Platform persisted globally in settings table ✅
- [x] Fabric generator works (existing functionality) ✅
- [x] Bukkit generator produces working code ✅
- [x] Platform-aware toolbox filtering ✅
- [x] Platform-aware example filtering ✅

### **Should Have:**
- [x] Block compatibility filtering ✅
- [ ] Bukkit backend deployment (compile and deploy plugins) 🚧
- [ ] Bedrock generator produces working behavior packs 🔜

### **Nice to Have:**
- [ ] Version-based block filtering
- [ ] Platform conversion tool (Fabric → Bukkit)
- [ ] Multi-platform export (one project → multiple outputs)

---

## File Structure Changes ✅

### **Frontend TypeScript:** (COMPLETED)
```
src/
  ├── utils/
  │   ├── database.ts          ✅ (Uses global settings, no per-project platform)
  │   ├── blockly-generator.ts ✅ (Generator routing with switch statement)
  │   └── startup-examples.ts  ✅ (isExampleCompatible function)
  ├── components/
  │   ├── BlocklyEditor/
  │   │   └── BlocklyEditor.tsx ✅ (BLOCK_COMPATIBILITY map, toolbox filtering)
  │   ├── ExamplesPanel/
  │   │   └── ExamplesPanel.tsx ✅ (Example filtering by platform)
  │   ├── SettingsModal/
  │   │   ├── SettingsModal.tsx ✅ (Platform settings UI)
  │   │   └── SettingsModal.css ✅ (Fixed dropdown styling)
  │   └── App.tsx              ✅ (Platform state, load on startup)
```

### **Backend Rust:** (COMPLETED)
```
src-tauri/src/
  ├── db.rs                    ✅ (Settings table for global platform)
  └── commands/
      └── db_commands.rs       ✅ (Database commands)
```

### **Generators:** (PARTIAL)
```
generators/
  ├── java.js                  ✅ (Fabric API - 340 lines)
  ├── bukkit.js                ✅ (Bukkit API - 340 lines)
  └── bedrock.js               🔜 (Future)
```

### **Python Deployment:** (IN PROGRESS)
```
Current:
  └── deploy_java_api.py       ✅ (Fabric only)

Planned:
  ├── deploy_java_api.py       (Fabric mods)
  ├── deploy_bukkit_api.py     🚧 (Bukkit plugins - to be created)
  └── deploy_bedrock_api.py    🔜 (Bedrock add-ons - future)
```

---

## Risk Mitigation

### **Risk: Generator Complexity**
- **Mitigation**: Phase approach - start with Bukkit (similar to Fabric)
- **Testing**: Unit tests for each generator

### **Risk: Block Compatibility Confusion**
- **Mitigation**: Clear UI indicators when blocks are filtered
- **Documentation**: Platform compatibility guide

---

## Future Enhancements

### **Version Support:**
- Filter blocks by Minecraft version
- Show "Added in 1.19" badges
- Version migration warnings

### **Platform Conversion:**
- Convert Fabric project → Bukkit
- Warn about incompatible features
- Suggest alternatives

### **Multi-Platform Export:**
- Generate both Fabric + Bukkit from one project
- Platform-specific settings per export

---

## Resources Needed

### **Documentation:**
- [ ] Fabric API docs
- [ ] Bukkit/Spigot API docs
- [ ] Bedrock Add-on docs
- [ ] Version compatibility matrix

### **Testing:**
- [ ] Fabric 1.21.1 server
- [ ] Paper 1.21.1 server
- [ ] Bedrock server (if implementing)

---

## Timeline

| Phase | Status | Deliverable |
|-------|--------|-------------|
| Phase 1: Foundation | ✅ COMPLETED | Database schema updated |
| Phase 2: UI Updates | ✅ COMPLETED | Global platform settings in SettingsModal |
| Phase 3: Bukkit Generator | ✅ COMPLETED | Working Bukkit code generator (340 lines) |
| Phase 4: Block Compatibility | ✅ COMPLETED | Toolbox and example filtering |
| Phase 5: Backend Deployment | 🚧 IN PROGRESS | Bukkit plugin compilation & deployment |
| Phase 6: Bedrock Generator | 🔜 FUTURE | Bedrock behavior pack generation |
| Phase 7: Testing & Polish | 🔜 FUTURE | Cross-platform testing |

**Frontend Multi-Platform Support: 100% Complete** ✅
**Backend Deployment Support: In Progress** 🚧

---

## Notes

- ✅ Bukkit code generation complete (biggest user base)
- 🚧 Bukkit deployment backend in progress
- 🔜 Bedrock is future work
- ✅ Architecture is extensible - global platform settings, separate generators per platform
- ✅ Global settings approach chosen over per-project to enable toolbox filtering before project load
- ✅ Separate deployment API files per platform for maintainability

## Key Architectural Decisions Made

1. **Global Platform Settings**: Stored in settings table, not per-project. This enables toolbox filtering before any project is loaded and simplifies UX.

2. **Two-Level Filtering**: Both toolbox blocks AND example projects are filtered by platform compatibility to prevent users from creating incompatible projects.

3. **Separate Deployment APIs**: Each platform will have its own deployment API file (deploy_java_api.py, deploy_bukkit_api.py, etc.) rather than complex conditionals in one file. This is cleaner and more maintainable.

4. **BLOCK_COMPATIBILITY Map**: Explicit mapping of which blocks work on which platforms, defined in both BlocklyEditor.tsx and startup-examples.ts for consistency.
