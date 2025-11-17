#!/usr/bin/env python3
"""
Minecraft Resource Pack Generator for BlockCraft
Creates resource packs with custom item textures and models
"""

import os
import json
import shutil
import zipfile

class ResourcePackGenerator:
    def __init__(self, pack_name, build_path):
        """
        Initialize resource pack generator

        Args:
            pack_name: Name of the resource pack
            build_path: Path to build the resource pack
        """
        self.pack_name = pack_name
        self.build_path = build_path
        self.pack_path = os.path.join(build_path, 'resourcepack')

    def create_pack_structure(self):
        """Create the basic resource pack folder structure"""
        # Create directories
        os.makedirs(os.path.join(self.pack_path, 'assets', 'minecraft', 'textures', 'item'), exist_ok=True)
        os.makedirs(os.path.join(self.pack_path, 'assets', 'minecraft', 'models', 'item'), exist_ok=True)

        # Create pack.mcmeta
        pack_meta = {
            "pack": {
                "pack_format": 48,  # Minecraft 1.21.1 format
                "description": f"§6{self.pack_name}§r\\n§7Created with BlockCraft"
            }
        }

        with open(os.path.join(self.pack_path, 'pack.mcmeta'), 'w') as f:
            json.dump(pack_meta, f, indent=2)

        print(f"📦 Created resource pack structure at: {self.pack_path}")

    def add_custom_item_texture(self, item_id, texture_image, base_item='minecraft:stick'):
        """
        Add a custom item texture and model to the resource pack

        Args:
            item_id: ID of the custom item
            texture_image: PIL Image object of the texture
            base_item: Base Minecraft item to model after
        """
        # Save texture
        texture_path = os.path.join(self.pack_path, 'assets', 'minecraft', 'textures', 'item', f'{item_id}.png')
        texture_image.save(texture_path, 'PNG')
        print(f"  ✓ Added texture: {item_id}.png")

        # Create item model JSON
        model = {
            "parent": "item/generated",
            "textures": {
                "layer0": f"item/{item_id}"
            }
        }

        model_path = os.path.join(self.pack_path, 'assets', 'minecraft', 'models', 'item', f'{item_id}.json')
        with open(model_path, 'w') as f:
            json.dump(model, f, indent=2)

        print(f"  ✓ Added model: {item_id}.json")

    def create_pack_zip(self, output_path):
        """
        Create a zip file of the resource pack

        Args:
            output_path: Where to save the .zip file

        Returns:
            Path to the created zip file
        """
        zip_path = os.path.join(output_path, f'{self.pack_name}.zip')

        # Remove old zip if exists
        if os.path.exists(zip_path):
            os.remove(zip_path)

        # Create zip
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(self.pack_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    arc_name = os.path.relpath(file_path, self.pack_path)
                    zipf.write(file_path, arc_name)

        print(f"📦 Resource pack created: {zip_path}")
        return zip_path

    def cleanup(self):
        """Remove temporary resource pack folder"""
        if os.path.exists(self.pack_path):
            shutil.rmtree(self.pack_path)
