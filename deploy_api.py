#!/usr/bin/env python3
"""
BlockCraft Deployment API
Handles one-click deployment to Minecraft server
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import subprocess

app = Flask(__name__)
CORS(app)  # Allow requests from the web editor

# Path to your Minecraft server's datapack folder
MINECRAFT_DATAPACK_PATH = '/home/jordan/minecraft-fabric-1.21.1-cobblemon/world/datapacks'

@app.route('/deploy', methods=['POST'])
def deploy_datapack():
    """
    Receives datapack data from the web editor and deploys it to the Minecraft server
    """
    try:
        data = request.json

        if not data or 'functions' not in data or 'packMeta' not in data:
            return jsonify({'success': False, 'error': 'Invalid datapack data'}), 400

        # Create datapack folder
        mod_name = 'blockcraft_mod'
        datapack_path = os.path.join(MINECRAFT_DATAPACK_PATH, mod_name)

        # Remove old version if it exists
        if os.path.exists(datapack_path):
            subprocess.run(['rm', '-rf', datapack_path])

        # Create directory structure
        os.makedirs(datapack_path, exist_ok=True)
        os.makedirs(os.path.join(datapack_path, 'data', 'blockcraft', 'functions'), exist_ok=True)
        os.makedirs(os.path.join(datapack_path, 'data', 'minecraft', 'tags', 'functions'), exist_ok=True)

        # Write pack.mcmeta (only the pack section, not the data tags)
        pack_meta_path = os.path.join(datapack_path, 'pack.mcmeta')
        with open(pack_meta_path, 'w') as f:
            json.dump({'pack': data['packMeta']['pack']}, f, indent=2)

        # Write function tag files for tick and load
        tick_tag = {
            "values": ["blockcraft:tick"]
        }
        load_tag = {
            "values": ["blockcraft:load"]
        }

        with open(os.path.join(datapack_path, 'data', 'minecraft', 'tags', 'functions', 'tick.json'), 'w') as f:
            json.dump(tick_tag, f, indent=2)

        with open(os.path.join(datapack_path, 'data', 'minecraft', 'tags', 'functions', 'load.json'), 'w') as f:
            json.dump(load_tag, f, indent=2)

        # Write function files
        for func_name, func_content in data['functions'].items():
            func_path = os.path.join(datapack_path, 'data', 'blockcraft', 'functions', func_name)
            with open(func_path, 'w') as f:
                f.write(func_content)

        # Send reload command to Minecraft server via mcrcon CLI tool
        reload_message = ''
        try:
            # Use mcrcon command-line tool instead of Python library (avoids threading issues)
            result = subprocess.run(
                ['/home/jordan/.local/bin/mcrcon', '-H', 'localhost', '-P', '25575', '-p', 'blockcraft123', 'reload'],
                capture_output=True,
                text=True,
                timeout=5
            )
            # Build command list message
            if 'commands' in data and data['commands']:
                cmd_list = '\n'.join([f'  /trigger {cmd}' for cmd in data['commands']])
                cmd_message = f'\n\n🎮 Your custom commands:\n{cmd_list}'
            else:
                cmd_message = ''

            if result.returncode == 0:
                reload_message = f'\n\n🔄 Server auto-reloaded! Your mod is now active!{cmd_message}'
            else:
                reload_message = f'\n\n⚠️ Type /reload in Minecraft to activate.{cmd_message}'
        except FileNotFoundError:
            if 'commands' in data and data['commands']:
                cmd_list = '\n'.join([f'  /trigger {cmd}' for cmd in data['commands']])
                reload_message = f'\n\n⚠️ Type /reload in Minecraft to activate.\n\n🎮 Your custom commands:\n{cmd_list}'
            else:
                reload_message = '\n\n⚠️ Type /reload in Minecraft to activate.'
        except Exception as e:
            if 'commands' in data and data['commands']:
                cmd_list = '\n'.join([f'  /trigger {cmd}' for cmd in data['commands']])
                reload_message = f'\n\n⚠️ Type /reload in Minecraft.\n\n🎮 Your custom commands:\n{cmd_list}'
            else:
                reload_message = '\n\n⚠️ Type /reload in Minecraft.'

        return jsonify({
            'success': True,
            'message': f'✅ Mod deployed to server!{reload_message}',
            'path': datapack_path
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Check if API is running"""
    return jsonify({'status': 'ok', 'minecraft_path': MINECRAFT_DATAPACK_PATH})

if __name__ == '__main__':
    print("🚀 BlockCraft Deployment API Starting...")
    print(f"📁 Minecraft datapack path: {MINECRAFT_DATAPACK_PATH}")
    print(f"🌐 API running on: http://localhost:5000")
    print(f"")
    print("Press Ctrl+C to stop")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=True)
