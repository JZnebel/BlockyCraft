# Bukkit Plugin Template

This is the template used by BlockCraft to generate Bukkit/Spigot/Paper plugins.

## Structure

```
bukkit-plugin-template/
├── pom.xml                              # Maven build configuration
├── src/
│   └── main/
│       ├── java/
│       │   └── com/blockcraft/
│       │       └── BlockCraftPlugin.java.template  # Plugin main class template
│       └── resources/
│           └── (plugin.yml is auto-generated)
```

## How It Works

1. **BlockCraft frontend** generates Bukkit-compatible Java code using `generators/bukkit.js`
2. **deploy_bukkit_api.py** copies this template to `/tmp/bukkit-plugin-build`
3. The API replaces placeholders in `BlockCraftPlugin.java.template`:
   - `// GENERATED_COMMAND_HANDLERS` → Inner classes implementing `CommandExecutor`
   - `// GENERATED_COMMAND_REGISTRATION` → `getCommand().setExecutor()` calls
   - `// GENERATED_EVENT_LISTENERS` → Inner classes implementing `Listener`
   - `// GENERATED_EVENT_REGISTRATION` → `registerEvents()` calls
4. The API generates `plugin.yml` with command definitions
5. Maven builds the plugin: `mvn clean package`
6. The built JAR is deployed to the server's `plugins/` folder

## Placeholders

### GENERATED_COMMAND_HANDLERS
Replaced with command executor inner classes:
```java
public static class HelloCommand implements CommandExecutor {
    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage("This command can only be used by players!");
            return true;
        }
        Player player = (Player) sender;
        // Generated action code here
        return true;
    }
}
```

### GENERATED_COMMAND_REGISTRATION
Replaced with command registrations:
```java
getCommand("hello").setExecutor(new HelloCommand());
```

### GENERATED_EVENT_LISTENERS
Replaced with event listener inner classes:
```java
public static class BlockBreakListener implements Listener {
    @EventHandler
    public void onBlockBreak(BlockBreakEvent event) {
        Player player = event.getPlayer();
        Block block = event.getBlock();
        World world = player.getWorld();
        // Generated action code here
    }
}
```

### GENERATED_EVENT_REGISTRATION
Replaced with event registrations:
```java
getServer().getPluginManager().registerEvents(new BlockBreakListener(), this);
```

## Maven Configuration

- **Java Version**: 21
- **Spigot API**: 1.21.1-R0.1-SNAPSHOT (provided scope)
- **Build Tool**: Maven Shade Plugin (bundles into single JAR)
- **Output**: `target/blockcraft-plugin-1.0.0.jar`

## Bukkit Limitations

Unlike Fabric mods, Bukkit plugins do NOT support:
- ❌ Custom items (use existing Minecraft items only)
- ❌ Custom mobs (use existing Minecraft entities only)
- ❌ Custom textures/resource packs
- ❌ AI block display models (Fabric-only feature)

Bukkit plugins DO support:
- ✅ Commands
- ✅ Events (block break, right click, etc.)
- ✅ Player actions (messages, teleport, effects)
- ✅ World manipulation (setblock, spawn entities, give items)
- ✅ All logic/math/text blocks

## Testing the Template

To test if this template works:

```bash
cd /home/jordan/blockcraft/bukkit-plugin-template
mvn clean package
```

This should successfully build a minimal plugin JAR (though it won't do anything until code is generated).
