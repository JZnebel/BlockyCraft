#!/usr/bin/env python3
"""
BlockCraft Bukkit Plugin Deployment API
Compiles and deploys Bukkit/Spigot/Paper plugins

Note: Bukkit plugins do NOT support:
- Custom items (use existing Minecraft items)
- Custom mobs (use existing Minecraft entities)
- AI block display models (Fabric-only feature)

Bukkit plugins DO support:
- Commands
- Events (block break, right click, etc.)
- Player actions (messages, teleport, effects, etc.)
- World manipulation (setblock, spawn entities, give items)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import subprocess
import shutil
import hashlib

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Paths - TODO: Configure for your Bukkit/Paper server
TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), 'bukkit-plugin-template')
BUILD_PATH = '/tmp/bukkit-plugin-build'
BUKKIT_PLUGINS_PATH = '/home/jordan/minecraft-paper-1.21.1/plugins'  # TODO: Update this path

def calculate_sha1(file_path):
    """Calculate SHA1 hash of a file"""
    sha1 = hashlib.sha1()
    with open(file_path, 'rb') as f:
        while chunk := f.read(8192):
            sha1.update(chunk)
    return sha1.hexdigest()

@app.route('/api/deploy', methods=['POST', 'OPTIONS'])
def deploy_bukkit_plugin():
    """
    Receives Bukkit code from the web editor, compiles it, and deploys it
    """
    # Handle CORS preflight request
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.json

        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        # Get project info
        project_id = data.get('projectId', 'default')
        project_name = data.get('projectName', 'BlockCraftPlugin')
        safe_project_id = project_id.replace('project_', '').replace('_', '')

        # Verify no custom items/mobs (Bukkit doesn't support them)
        custom_items = data.get('customItems', [])
        custom_mobs = data.get('customMobs', [])

        if custom_items or custom_mobs:
            return jsonify({
                'success': False,
                'error': 'Bukkit plugins do not support custom items or custom mobs. Switch to Fabric in Settings if you need these features.'
            }), 400

        # Create unique package name
        package_name = f"com.blockcraft.plugin{safe_project_id}".lower()
        plugin_name = f"BlockCraft{safe_project_id.capitalize()}"

        # Clean and prepare build directory
        if os.path.exists(BUILD_PATH):
            shutil.rmtree(BUILD_PATH)

        # Check if template exists
        if not os.path.exists(TEMPLATE_PATH):
            return jsonify({
                'success': False,
                'error': f'Bukkit plugin template not found at: {TEMPLATE_PATH}\\n\\nPlease create a Bukkit plugin template first.'
            }), 500

        shutil.copytree(TEMPLATE_PATH, BUILD_PATH)

        # Create package directory
        package_path = os.path.join(BUILD_PATH, 'src/main/java', package_name.replace('.', '/'))
        os.makedirs(package_path, exist_ok=True)

        # Read template
        template_path = os.path.join(BUILD_PATH, 'src/main/java/com/blockcraft/BlockCraftPlugin.java.template')

        if not os.path.exists(template_path):
            return jsonify({
                'success': False,
                'error': f'Plugin template file not found: {template_path}'
            }), 500

        with open(template_path, 'r') as f:
            template = f.read()

        # Get generated code from frontend (already Bukkit-compatible from generators/bukkit.js)
        commands = data.get('commands', [])
        events = data.get('events', [])

        # Build command handler classes
        command_handlers = ''
        command_registration = ''

        for cmd in commands:
            cmd_name = cmd.get('name', '')
            cmd_code = cmd.get('code', '')

            if cmd_name and cmd_code:
                # Generate command handler class
                handler_class = f"{cmd_name.capitalize()}Command"
                command_handlers += f"""
    public static class {handler_class} implements CommandExecutor {{
        @Override
        public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {{
            if (!(sender instanceof Player)) {{
                sender.sendMessage("This command can only be used by players!");
                return true;
            }}
            Player player = (Player) sender;
{cmd_code}
            return true;
        }}
    }}
"""
                command_registration += f"        getCommand(\"{cmd_name}\").setExecutor(new {handler_class}());\n"

        # Build event listener classes
        event_listeners = ''
        event_registration = ''

        for evt in events:
            evt_type = evt.get('type', '')
            evt_code = evt.get('code', '')

            if evt_type == 'block_break' and evt_code:
                event_listeners += f"""
    public static class BlockBreakListener implements Listener {{
        @EventHandler
        public void onBlockBreak(BlockBreakEvent event) {{
            Player player = event.getPlayer();
            Block block = event.getBlock();
            World world = player.getWorld();
{evt_code}
        }}
    }}
"""
                event_registration += "        getServer().getPluginManager().registerEvents(new BlockBreakListener(), this);\n"

            elif evt_type == 'right_click' and evt_code:
                event_listeners += f"""
    public static class RightClickListener implements Listener {{
        @EventHandler
        public void onPlayerInteract(PlayerInteractEvent event) {{
            Player player = event.getPlayer();
            World world = player.getWorld();
{evt_code}
        }}
    }}
"""
                event_registration += "        getServer().getPluginManager().registerEvents(new RightClickListener(), this);\n"

        # Replace placeholders in template
        java_code = template.replace('package com.blockcraft;', f'package {package_name};')
        java_code = java_code.replace('// GENERATED_COMMAND_HANDLERS', command_handlers)
        java_code = java_code.replace('// GENERATED_COMMAND_REGISTRATION', command_registration)
        java_code = java_code.replace('// GENERATED_EVENT_LISTENERS', event_listeners)
        java_code = java_code.replace('// GENERATED_EVENT_REGISTRATION', event_registration)

        # Write Java file
        java_file_path = os.path.join(package_path, 'BlockCraftPlugin.java')
        with open(java_file_path, 'w') as f:
            f.write(java_code)

        # Generate plugin.yml
        plugin_yml_path = os.path.join(BUILD_PATH, 'src/main/resources/plugin.yml')
        os.makedirs(os.path.dirname(plugin_yml_path), exist_ok=True)

        plugin_yml = {
            'name': plugin_name,
            'version': '1.0.0',
            'main': f'{package_name}.BlockCraftPlugin',
            'api-version': '1.21',
            'description': f'BlockCraft plugin: {project_name}',
            'author': 'BlockCraft',
            'commands': {}
        }

        # Add commands to plugin.yml
        for cmd in commands:
            cmd_name = cmd.get('name', '')
            if cmd_name:
                plugin_yml['commands'][cmd_name] = {
                    'description': f'BlockCraft command: {cmd_name}',
                    'usage': f'/{cmd_name}'
                }

        with open(plugin_yml_path, 'w') as f:
            # Use yaml.dump if available, otherwise use json (similar structure)
            try:
                import yaml
                yaml.dump(plugin_yml, f, default_flow_style=False)
            except ImportError:
                # Fallback to manual YAML format
                f.write(f"name: {plugin_yml['name']}\\n")
                f.write(f"version: {plugin_yml['version']}\\n")
                f.write(f"main: {plugin_yml['main']}\\n")
                f.write(f"api-version: '{plugin_yml['api-version']}'\\n")
                f.write(f"description: {plugin_yml['description']}\\n")
                f.write(f"author: {plugin_yml['author']}\\n")
                if plugin_yml['commands']:
                    f.write("commands:\\n")
                    for cmd_name, cmd_info in plugin_yml['commands'].items():
                        f.write(f"  {cmd_name}:\\n")
                        f.write(f"    description: {cmd_info['description']}\\n")
                        f.write(f"    usage: {cmd_info['usage']}\\n")

        # Build with Maven or Gradle
        print("Building plugin with Maven...")

        # Check if using Maven (pom.xml) or Gradle (build.gradle)
        if os.path.exists(os.path.join(BUILD_PATH, 'pom.xml')):
            # Maven build
            result = subprocess.run(
                ['mvn', 'clean', 'package', '-DskipTests'],
                cwd=BUILD_PATH,
                capture_output=True,
                text=True,
                timeout=300
            )
        elif os.path.exists(os.path.join(BUILD_PATH, 'build.gradle')):
            # Gradle build
            gradle_cmd = os.path.join(BUILD_PATH, 'gradlew')
            if not os.path.exists(gradle_cmd):
                gradle_cmd = 'gradle'
            result = subprocess.run(
                [gradle_cmd, 'build', '--no-daemon'],
                cwd=BUILD_PATH,
                capture_output=True,
                text=True,
                timeout=300
            )
        else:
            return jsonify({
                'success': False,
                'error': 'No build file found (pom.xml or build.gradle) in template'
            }), 500

        if result.returncode != 0:
            return jsonify({
                'success': False,
                'error': f'Build failed:\\n{result.stderr}'
            }), 500

        # Find the built JAR
        jar_path = os.path.join(BUILD_PATH, 'target')  # Maven
        if not os.path.exists(jar_path):
            jar_path = os.path.join(BUILD_PATH, 'build/libs')  # Gradle

        if not os.path.exists(jar_path):
            return jsonify({'success': False, 'error': 'Build output directory not found'}), 500

        jars = [f for f in os.listdir(jar_path) if f.endswith('.jar') and 'sources' not in f and 'javadoc' not in f]

        if not jars:
            return jsonify({'success': False, 'error': 'No JAR file found after build'}), 500

        jar_file = os.path.join(jar_path, jars[0])
        unique_jar_name = f'blockcraft-{safe_project_id}.jar'

        # Deploy to plugins folder
        should_deploy = data.get('deploy', True)

        if should_deploy:
            # Remove old version
            for f in os.listdir(BUKKIT_PLUGINS_PATH):
                if f == unique_jar_name:
                    os.remove(os.path.join(BUKKIT_PLUGINS_PATH, f))

            # Copy new plugin
            target_jar = os.path.join(BUKKIT_PLUGINS_PATH, unique_jar_name)
            shutil.copy(jar_file, target_jar)

            print(f"📦 Plugin deployed: {target_jar}")
        else:
            # Just build - copy to Downloads
            home_dir = os.path.expanduser("~")
            downloads_dir = os.path.join(home_dir, "Downloads")
            os.makedirs(downloads_dir, exist_ok=True)
            target_jar = os.path.join(downloads_dir, unique_jar_name)
            shutil.copy(jar_file, target_jar)
            print(f"📦 Plugin built: {target_jar}")

        # Get command list
        cmd_names = [cmd['name'] for cmd in commands]
        if cmd_names:
            cmd_list = '\\n'.join([f'  /{name}' for name in cmd_names])
        else:
            cmd_list = '  (No commands - this plugin uses events only)'

        # Restart server (optional)
        restart_message = ''
        if should_deploy:
            try:
                # TODO: Update with your server restart command
                subprocess.run(['sudo', 'systemctl', 'restart', 'paper-server'], check=True)
                restart_message = '\\n\\n🔄 Server restarted! Plugin is now loaded!'
            except Exception as e:
                restart_message = f'\\n\\n⚠️ Could not auto-restart server. Please restart manually or use /reload'

        # Create success message
        if should_deploy:
            success_msg = f'✅ Bukkit plugin compiled and deployed!{restart_message}\\n\\n🎮 Your custom commands:\\n{cmd_list}\\n\\n📦 Plugin file: {target_jar}'
        else:
            success_msg = f'✅ Bukkit plugin built successfully!\\n\\n🎮 Your custom commands:\\n{cmd_list}\\n\\n📦 Plugin saved to: {target_jar}'

        return jsonify({
            'success': True,
            'message': success_msg,
            'jar_file': jars[0],
            'jar_path': target_jar,
            'project_name': project_name
        })

    except Exception as e:
        import traceback
        error_msg = f"{str(e)}\\n\\nTraceback:\\n{traceback.format_exc()}"
        print(f"ERROR: {error_msg}")
        return jsonify({'success': False, 'error': error_msg}), 500

@app.route('/health', methods=['GET'])
def health():
    """Check if API is running"""
    return jsonify({'status': 'ok', 'mode': 'bukkit'})

if __name__ == '__main__':
    print("🚀 BlockCraft Bukkit Deployment API Starting...")
    print(f"📁 Template path: {TEMPLATE_PATH}")
    print(f"📁 Bukkit plugins path: {BUKKIT_PLUGINS_PATH}")
    print(f"🌐 API running on: http://localhost:8586")
    print(f"")
    print("Note: Bukkit does NOT support custom items/mobs (use Fabric for that)")
    print("Press Ctrl+C to stop")
    print("=" * 60)
    app.run(host='0.0.0.0', port=8586, debug=True)
