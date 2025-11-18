# Multi-Platform Support Plan

## Overview

Transform BlocklyCraft from a Fabric-only mod generator into a multi-platform code generation tool supporting:
- **Fabric** (Java Edition - Mods)
- **Bukkit/Spigot/Paper** (Java Edition - Plugins)
- **Bedrock Edition** (Behavior Packs)

This will dramatically increase BlocklyCraft's reach and usefulness across the Minecraft ecosystem.

---

## Goals

1. **Platform Selection**: Allow users to choose target platform when creating projects
2. **Platform-Aware Blocks**: Show only blocks compatible with selected platform
3. **Multi-Generator Architecture**: Route compilation to appropriate code generator
4. **Platform Badges**: Display platform compatibility in project list
5. **Version Tracking**: Store Minecraft version (for future filtering)

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

## Architecture Changes

### 1. Database Schema

#### **Projects Table Update**
```sql
ALTER TABLE projects ADD COLUMN platform TEXT NOT NULL;
ALTER TABLE projects ADD COLUMN edition TEXT NOT NULL;
ALTER TABLE projects ADD COLUMN minecraft_version TEXT NOT NULL;
```

**Fields:**
- `platform`: 'fabric' | 'bukkit' | 'bedrock'
- `edition`: 'java' | 'bedrock'
- `minecraft_version`: '1.21.1', '1.20.4', etc.

#### **TypeScript Interface**
```typescript
export interface DbProject {
  id?: number;
  name: string;
  workspace_xml: string;
  platform: 'fabric' | 'bukkit' | 'bedrock';
  edition: 'java' | 'bedrock';
  minecraft_version: string;
  created_at: number;
  updated_at: number;
}
```

---

### 2. Code Generator Architecture

#### **Current Structure**
```
generators/
  └── java.js    (Fabric only)
```

#### **New Structure**
```
generators/
  ├── fabric.js     (Fabric API - Java Edition)
  ├── bukkit.js     (Bukkit/Spigot/Paper API - Java Edition)
  ├── bedrock.js    (Behavior Packs - Bedrock Edition)
  └── common.js     (Shared utilities)
```

#### **Generator Interface**
Each generator exports:
```javascript
export function generateCode(workspace, modData) {
  return {
    commands: [...],
    events: [...],
    customItems: [...],
    customMobs: [...],
    fileStructure: { ... },  // Platform-specific
    buildConfig: { ... }      // gradle, plugin.yml, etc.
  }
}
```

---

### 3. Block Compatibility System

#### **Block Metadata**
Each block definition gets platform compatibility:

```typescript
interface BlockDefinition {
  type: string;
  name: string;
  platforms: ('fabric' | 'bukkit' | 'bedrock')[];
  minVersion?: string;
  maxVersion?: string;
  category: string;
}
```

#### **Example Compatibility**

| Block Type | Fabric | Bukkit | Bedrock | Notes |
|-----------|--------|--------|---------|-------|
| Commands | ✅ | ✅ | ✅ | Universal |
| Events | ✅ | ✅ | ✅ | Different APIs |
| Custom Items | ✅ | ⚠️ | ✅ | Bukkit limited |
| Custom Mobs | ✅ | ⚠️ | ✅ | Bukkit limited |
| Block Displays | ✅ | ✅ | ❌ | Java only (1.19.4+) |
| AI Models | ✅ | ✅ | ❌ | Uses block displays |

---

### 4. UI Changes

#### **A. Project Creation Modal**

Add platform selection:
```
┌────────────────────────────────┐
│  Create New Project            │
│                                │
│  Name: [____________]          │
│                                │
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
│  [Cancel]  [Create Project]    │
└────────────────────────────────┘
```

**Note:** Platform selection can also be added to the existing SettingsModal (where API keys are stored) as a global default. Projects would still have their own platform setting that overrides the default.

#### **B. Project List Badges**

```
┌─────────────────────────────────────┐
│  My Sword Mod                       │
│  [Fabric] [Java] [v1.21+]          │
│  Last edited: 2 days ago            │
├─────────────────────────────────────┤
│  Command Pack                       │
│  [Bukkit] [Java] [v1.16-1.21]      │
│  Last edited: 1 week ago            │
├─────────────────────────────────────┤
│  Mobile Add-on                      │
│  [Bedrock] [Any]                    │
│  Last edited: 3 days ago            │
└─────────────────────────────────────┘
```

#### **C. Toolbox Filtering**

When project is open, only show compatible blocks:
- Fabric project: All blocks ✅
- Bukkit project: No block displays ❌
- Bedrock project: No AI models ❌

---

## Implementation Phases

### **Phase 1: Foundation** (Week 1)
- [ ] Update database schema (projects table)
- [ ] Update TypeScript interfaces
- [ ] Add migration for existing projects (default to 'fabric')
- [ ] Update Rust backend commands
- [ ] Test database changes

### **Phase 2: UI Updates** (Week 1-2)
- [ ] Add platform selection to project creation
- [ ] Add platform badges to project list
- [ ] Update project metadata display
- [ ] Add platform icons/styling
- [ ] Test UI flows

### **Phase 3: Bukkit Generator** (Week 2-3)
- [ ] Create generators/bukkit.js
- [ ] Implement command generation (Bukkit API)
- [ ] Implement event generation (Bukkit API)
- [ ] Create plugin.yml template
- [ ] Update compilation flow routing
- [ ] Test Bukkit plugin generation

### **Phase 4: Block Compatibility** (Week 3-4)
- [ ] Add platform metadata to all blocks
- [ ] Implement toolbox filtering
- [ ] Add compatibility warnings
- [ ] Update example projects with platforms
- [ ] Test block filtering

### **Phase 5: Bedrock Generator** (Week 4-6)
- [ ] Create generators/bedrock.js
- [ ] Design behavior pack structure
- [ ] Implement command generation (JSON)
- [ ] Implement event generation (JSON)
- [ ] Create manifest.json template
- [ ] Test behavior pack generation

### **Phase 6: Polish & Testing** (Week 6-7)
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
- [x] Users can select platform when creating project
- [x] Platform displayed on project list
- [x] Fabric generator works (existing functionality)
- [x] Bukkit generator produces working plugins
- [x] Projects save/load with platform metadata

### **Should Have:**
- [ ] Block compatibility filtering
- [ ] Bedrock generator produces working behavior packs
- [ ] Platform-specific examples

### **Nice to Have:**
- [ ] Version-based block filtering
- [ ] Platform conversion tool (Fabric → Bukkit)
- [ ] Multi-platform export (one project → multiple outputs)

---

## File Structure Changes

### **Frontend TypeScript:**
```
src/
  ├── utils/
  │   ├── database.ts          (UPDATE: DbProject interface)
  │   ├── blockly-generator.ts (UPDATE: route to generators)
  │   └── platform-utils.ts    (NEW: platform helpers)
  ├── components/
  │   ├── ExamplesPanel/
  │   │   └── ExamplesPanel.tsx (UPDATE: platform badges)
  │   └── PlatformSelector/
  │       └── PlatformSelector.tsx (NEW: platform picker)
```

### **Backend Rust:**
```
src-tauri/src/
  ├── commands/
  │   └── database.rs          (UPDATE: schema migration)
```

### **Generators:**
```
generators/
  ├── common.js               (NEW: shared utilities)
  ├── fabric.js               (RENAME from java.js)
  ├── bukkit.js               (NEW)
  └── bedrock.js              (NEW)
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

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1 | 3-5 days | Database schema updated |
| Phase 2 | 3-5 days | UI with platform selection |
| Phase 3 | 7-10 days | Working Bukkit generator |
| Phase 4 | 5-7 days | Block filtering implemented |
| Phase 5 | 14-21 days | Bedrock generator (optional) |
| Phase 6 | 5-7 days | Testing & polish |

**Total: 6-8 weeks** (without Bedrock)
**Total: 8-11 weeks** (with Bedrock)

---

## Notes

- Start with Bukkit support (biggest user base)
- Bedrock is optional for v1.0
- Version filtering can be added later
- Focus on making the architecture extensible
