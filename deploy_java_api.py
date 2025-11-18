#!/usr/bin/env python3
"""
BlockCraft Java Mod Deployment API
Compiles and deploys Java/Fabric mods
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import subprocess
import shutil
import base64
import hashlib
import socket
from io import BytesIO
from PIL import Image
from texture_generator import TextureGenerator
from resource_pack_generator import ResourcePackGenerator
from recipe_generator import RecipeGenerator

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Paths
TEMPLATE_PATH = '/home/jordan/blockcraft-mod-template'
BUILD_PATH = '/tmp/blockcraft-build'
MINECRAFT_MODS_PATH = '/home/jordan/minecraft-fabric-1.21.1-cobblemon/mods'
MINECRAFT_DIR = '/home/jordan/minecraft-fabric-1.21.1-cobblemon'
RESOURCEPACKS_HTTP_DIR = os.path.join(MINECRAFT_DIR, 'resourcepacks')
SERVER_PROPERTIES_PATH = os.path.join(MINECRAFT_DIR, 'server.properties')

def calculate_sha1(file_path):
    """Calculate SHA1 hash of a file"""
    sha1 = hashlib.sha1()
    with open(file_path, 'rb') as f:
        while chunk := f.read(8192):
            sha1.update(chunk)
    return sha1.hexdigest()

def get_local_ip():
    """Get the local IP address"""
    try:
        # Create a socket to determine local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "10.248.110.111"  # Fallback to known IP

def update_server_properties(resource_pack_url, sha1_hash):
    """Update server.properties with resource pack configuration"""
    if not os.path.exists(SERVER_PROPERTIES_PATH):
        print(f"⚠️ Server properties not found at {SERVER_PROPERTIES_PATH}")
        return False

    # Read current properties
    with open(SERVER_PROPERTIES_PATH, 'r') as f:
        lines = f.readlines()

    # Update resource pack settings
    new_lines = []
    updated_url = False
    updated_sha1 = False
    updated_require = False

    for line in lines:
        if line.startswith('resource-pack='):
            new_lines.append(f'resource-pack={resource_pack_url}\n')
            updated_url = True
        elif line.startswith('resource-pack-sha1='):
            new_lines.append(f'resource-pack-sha1={sha1_hash}\n')
            updated_sha1 = True
        elif line.startswith('require-resource-pack='):
            new_lines.append('require-resource-pack=false\n')  # Don't force it
            updated_require = True
        else:
            new_lines.append(line)

    # Add missing properties
    if not updated_url:
        new_lines.append(f'resource-pack={resource_pack_url}\n')
    if not updated_sha1:
        new_lines.append(f'resource-pack-sha1={sha1_hash}\n')
    if not updated_require:
        new_lines.append('require-resource-pack=false\n')

    # Write back
    with open(SERVER_PROPERTIES_PATH, 'w') as f:
        f.writelines(new_lines)

    print(f"✅ Updated server.properties with resource pack URL: {resource_pack_url}")
    return True

@app.route('/api/deploy', methods=['POST', 'OPTIONS'])
def deploy_java_mod():
    """
    Receives Java code from the web editor, compiles it, and deploys it
    """
    # Handle CORS preflight request
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.json

        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        # Get project ID for unique naming
        project_id = data.get('projectId', 'default')
        project_name = data.get('projectName', 'BlockCraft')
        safe_project_id = project_id.replace('project_', '').replace('_', '')

        # Create unique mod ID (must be lowercase, no spaces)
        # Use "blockcraft" as the namespace for items/mobs so it matches what the Blockly generator uses
        mod_id = f"blockcraft_{safe_project_id}".lower()
        item_namespace = "blockcraft"  # Consistent namespace for all items/mobs across projects

        # Create unique package name (must be lowercase, valid Java identifier)
        package_name = f"com.blockcraft.mod{safe_project_id}".lower()

        # Clean and prepare build directory
        if os.path.exists(BUILD_PATH):
            shutil.rmtree(BUILD_PATH)
        shutil.copytree(TEMPLATE_PATH, BUILD_PATH)

        # Create unique package directory
        package_path = os.path.join(BUILD_PATH, 'src/main/java', package_name.replace('.', '/'))
        os.makedirs(package_path, exist_ok=True)

        # Read template
        template_path = os.path.join(BUILD_PATH, 'src/main/java/com/blockcraft/BlockCraftMod.java.template')
        with open(template_path, 'r') as f:
            template = f.read()

        # Replace package name and placeholders with generated code
        # Generate custom item declarations and registration
        custom_items = data.get('customItems', [])
        item_declarations = ''
        item_registration = ''

        for item in custom_items:
            item_id = item['id']
            item_var = f"ITEM_{item_id.upper()}"
            rarity = item.get('rarity', 'COMMON')
            max_stack = item.get('maxStack', 64)

            # Item declaration (static field)
            item_declarations += f"    public static final Item {item_var} = new Item(new Item.Settings().maxCount({max_stack}).rarity(Rarity.{rarity}));\n"

            # Item registration (use item_namespace for consistency across all projects)
            item_registration += f"        Registry.register(Registries.ITEM, Identifier.of(\"{item_namespace}\", \"{item_id}\"), {item_var});\n"

        # Generate custom mob declarations and registration
        custom_mobs = data.get('customMobs', [])
        mob_declarations = ''
        mob_registration = ''
        mob_attribute_registration = ''

        for mob in custom_mobs:
            mob_id = mob['id']
            mob_var = f"{mob_id.upper()}_ENTITY"
            mob_class = f"{mob_id.capitalize()}Entity"
            health = float(mob.get('health', 20))
            speed = float(mob.get('speed', 0.35))
            behavior = mob.get('behavior', 'PASSIVE')

            # Entity type declaration (with inline registration)
            mob_declarations += f"    public static final EntityType<{mob_class}> {mob_var} = Registry.register(Registries.ENTITY_TYPE, Identifier.of(\"{item_namespace}\", \"{mob_id}\"), EntityType.Builder.create({mob_class}::new, SpawnGroup.CREATURE).dimensions({mob.get('size', 1.0)}f, {mob.get('size', 1.0)}f).build());\n"

            # Attribute registration (registration happens inline above, so no separate mob_registration needed)
            mob_attribute_registration += f"        FabricDefaultAttributeRegistry.register({mob_var}, {mob_class}.createMobAttributes());\n"

        # Generate command registration code
        commands = data.get('commands', [])
        command_registration = ''

        for cmd in commands:
            cmd_name = cmd.get('name', '')
            cmd_code = cmd.get('code', '')

            if cmd_name and cmd_code:
                command_registration += f"""        CommandRegistrationCallback.EVENT.register((dispatcher, registryAccess, environment) -> {{
            dispatcher.register(CommandManager.literal("{cmd_name}")
                .executes(context -> {{
                    var source = context.getSource();
{cmd_code}                    return 1;
                }})
            );
        }});
"""

        # Generate event registration code
        events = data.get('events', [])
        event_registration = ''

        for evt in events:
            evt_type = evt.get('type', '')
            evt_code = evt.get('code', '')

            if evt_type == 'block_break' and evt_code:
                event_registration += f"""        PlayerBlockBreakEvents.AFTER.register((world, player, pos, state, blockEntity) -> {{
{evt_code}        }});
"""
            elif evt_type == 'right_click' and evt_code:
                event_registration += f"""        UseItemCallback.EVENT.register((player, world, hand) -> {{
{evt_code}            return TypedActionResult.pass(player.getStackInHand(hand));
        }});
"""

        # Combine command and event registration
        generated_code = command_registration + event_registration

        java_code = template.replace('package com.blockcraft;', f'package {package_name};')
        java_code = java_code.replace('// GENERATED_CUSTOM_ITEMS', item_declarations)
        java_code = java_code.replace('// GENERATED_ITEM_REGISTRATION', item_registration)
        java_code = java_code.replace('// GENERATED_CUSTOM_MOBS', mob_declarations)
        java_code = java_code.replace('// GENERATED_MOB_REGISTRATION', '')  # Empty since registration happens inline
        java_code = java_code.replace('// GENERATED_MOB_ATTRIBUTES', mob_attribute_registration)
        java_code = java_code.replace('// GENERATED_HELPER_METHODS', data.get('helperMethods', ''))
        java_code = java_code.replace('// GENERATED_COMMANDS', generated_code)

        # Write final Java file to unique package
        java_file_path = os.path.join(package_path, 'BlockCraftMod.java')
        with open(java_file_path, 'w') as f:
            f.write(java_code)

        # Update fabric.mod.json with unique mod ID, name, and entrypoint
        fabric_mod_json_path = os.path.join(BUILD_PATH, 'src/main/resources/fabric.mod.json')
        with open(fabric_mod_json_path, 'r') as f:
            fabric_mod_json = json.load(f)

        fabric_mod_json['id'] = mod_id
        fabric_mod_json['name'] = project_name
        fabric_mod_json['entrypoints']['main'] = [f'{package_name}.BlockCraftMod']

        with open(fabric_mod_json_path, 'w') as f:
            json.dump(fabric_mod_json, f, indent=2)

        # Generate AI textures and resource pack if custom items exist
        custom_items = data.get('customItems', [])
        resource_pack_path = None

        if custom_items and len(custom_items) > 0:
            ai_settings = data.get('aiSettings', {})
            api_key = ai_settings.get('apiKey', '')
            ai_model = ai_settings.get('model', 'gpt-image-1-mini')

            print(f"🎨 Processing textures for {len(custom_items)} custom items...")

            # Initialize generators (only needed for AI textures)
            texture_gen = None
            if api_key:
                texture_gen = TextureGenerator(api_key, ai_model)

            pack_gen = ResourcePackGenerator(f'{project_name}_textures', BUILD_PATH)
            pack_gen.create_pack_structure()

            # Generate or load textures and add them to the mod's resources
            for item in custom_items:
                    texture_source = item.get('textureSource', 'ai')
                    texture_desc = item.get('textureDescription', '')
                    uploaded_texture_data = item.get('uploadedTexture', None)
                    item_id = item.get('id', '')

                    texture = None

                    # Handle uploaded textures
                    if texture_source == 'upload' and uploaded_texture_data:
                        print(f"  Using uploaded texture for: {item['name']}")
                        try:
                            # uploaded_texture_data is base64 data URI: "data:image/png;base64,..."
                            if uploaded_texture_data.startswith('data:image'):
                                base64_data = uploaded_texture_data.split(',')[1]
                                image_data = base64.b64decode(base64_data)
                                texture = Image.open(BytesIO(image_data))
                                # Resize to 16x16 if needed
                                if texture.size != (16, 16):
                                    texture = texture.resize((16, 16), Image.NEAREST)
                                if texture.mode != 'RGBA':
                                    texture = texture.convert('RGBA')
                                print(f"  ✅ Loaded uploaded texture for {item['name']}")
                        except Exception as e:
                            print(f"  ⚠️ Failed to load uploaded texture: {str(e)}")
                            texture = None

                    # Handle AI-generated textures
                    elif texture_source == 'ai' and texture_desc and item_id:
                        if texture_gen:
                            print(f"  Generating AI texture: {item['name']} - '{texture_desc}'")
                            texture = texture_gen.generate_texture(texture_desc, item_id)
                        else:
                            print(f"  ⚠️ Cannot generate AI texture for {item['name']}: No API key provided")

                    # Add texture to mod resources (not external resource pack)
                    if texture and item_id:
                        # Create mod resource directories
                        mod_assets_dir = os.path.join(BUILD_PATH, 'src/main/resources/assets', item_namespace)
                        os.makedirs(os.path.join(mod_assets_dir, 'textures/item'), exist_ok=True)
                        os.makedirs(os.path.join(mod_assets_dir, 'models/item'), exist_ok=True)

                        # Save texture
                        texture_path = os.path.join(mod_assets_dir, 'textures/item', f'{item_id}.png')
                        texture.save(texture_path, 'PNG')
                        print(f"  ✓ Added texture to mod: {item_id}.png")

                        # Create item model
                        model = {
                            "parent": "item/generated",
                            "textures": {
                                "layer0": f"{item_namespace}:item/{item_id}"
                            }
                        }
                        model_path = os.path.join(mod_assets_dir, 'models/item', f'{item_id}.json')
                        with open(model_path, 'w') as f:
                            json.dump(model, f, indent=2)
                        print(f"  ✓ Added model to mod: {item_id}.json")
                    else:
                        print(f"  ⚠️ No texture for {item['name']}, will use fallback")

            # Still create resource pack zip for backwards compatibility (but textures are now in mod)
            resource_pack_path = pack_gen.create_pack_zip(BUILD_PATH)
            pack_gen.cleanup()

        # Generate crafting recipes for custom items
        if custom_items and len(custom_items) > 0:
            print(f"📜 Generating crafting recipes for {len(custom_items)} custom items...")
            recipe_gen = RecipeGenerator(BUILD_PATH, mod_id)
            recipe_gen.create_recipe_directory()

            for item in custom_items:
                recipe = item.get('recipe', [])
                if recipe and len(recipe) == 9:
                    recipe_gen.generate_shaped_recipe(item['id'], recipe)

        # Generate entity classes and renderers for custom mobs
        if custom_mobs and len(custom_mobs) > 0:
            print(f"🦖 Generating entity classes for {len(custom_mobs)} custom mobs...")

            for mob in custom_mobs:
                mob_id = mob['id']
                mob_class = f"{mob_id.capitalize()}Entity"
                mob_renderer = f"{mob_id.capitalize()}Renderer"
                health = float(mob.get('health', 20))
                speed = float(mob.get('speed', 0.35))
                size = float(mob.get('size', 1.0))
                behavior = mob.get('behavior', 'PASSIVE')
                uploaded_texture_data = mob.get('uploadedTexture', None)

                # Generate entity class
                entity_class_code = f"""package {package_name};

import net.minecraft.entity.EntityType;
import net.minecraft.entity.ai.goal.*;
import net.minecraft.entity.attribute.DefaultAttributeContainer;
import net.minecraft.entity.attribute.EntityAttributes;
import net.minecraft.entity.mob.PathAwareEntity;
import net.minecraft.entity.player.PlayerEntity;
import net.minecraft.world.World;

public class {mob_class} extends PathAwareEntity {{
    public {mob_class}(EntityType<? extends PathAwareEntity> entityType, World world) {{
        super(entityType, world);
        this.setPersistent();
    }}

    public static DefaultAttributeContainer.Builder createMobAttributes() {{
        return PathAwareEntity.createMobAttributes()
            .add(EntityAttributes.GENERIC_MAX_HEALTH, {health})
            .add(EntityAttributes.GENERIC_MOVEMENT_SPEED, {speed})
            .add(EntityAttributes.GENERIC_FOLLOW_RANGE, 35.0)
            .add(EntityAttributes.GENERIC_ATTACK_DAMAGE, 3.0);
    }}

    @Override
    protected void initGoals() {{
        this.goalSelector.add(0, new SwimGoal(this));
        {"this.goalSelector.add(1, new MeleeAttackGoal(this, " + str(float(speed) * 1.2) + ", false));" if behavior == "HOSTILE" else ""}
        this.goalSelector.add(2, new EscapeDangerGoal(this, 1.25));
        this.goalSelector.add(3, new WanderAroundFarGoal(this, {speed}));
        this.goalSelector.add(4, new LookAtEntityGoal(this, PlayerEntity.class, 8.0F));
        this.goalSelector.add(5, new LookAroundGoal(this));

        {"this.targetSelector.add(1, new RevengeGoal(this));" if behavior == "NEUTRAL" else ""}
        {"this.targetSelector.add(1, new ActiveTargetGoal(this, PlayerEntity.class, true));" if behavior == "HOSTILE" else ""}
    }}
}}
"""

                # Write entity class
                entity_class_path = os.path.join(package_path, f'{mob_class}.java')
                with open(entity_class_path, 'w') as f:
                    f.write(entity_class_code)
                print(f"  ✓ Generated entity class: {mob_class}.java")

                # Save mob texture
                mob_texture = None
                if uploaded_texture_data:
                    try:
                        # Decode base64 texture
                        if ',' in uploaded_texture_data:
                            uploaded_texture_data = uploaded_texture_data.split(',')[1]

                        texture_bytes = base64.b64decode(uploaded_texture_data)
                        mob_texture = Image.open(BytesIO(texture_bytes))

                        # Resize to reasonable size for Minecraft (64x64 is common for entity textures)
                        if mob_texture.size != (64, 64):
                            mob_texture = mob_texture.resize((64, 64), Image.LANCZOS)

                        # Ensure RGBA mode
                        if mob_texture.mode != 'RGBA':
                            mob_texture = mob_texture.convert('RGBA')

                        print(f"  ✓ Loaded uploaded texture for {mob['name']} (resized to 64x64)")
                    except Exception as e:
                        print(f"  ⚠️ Failed to load uploaded texture: {str(e)}")
                        mob_texture = None

                # Create fallback texture if no upload
                if mob_texture is None:
                    # Create a simple colored square as fallback
                    mob_texture = Image.new('RGBA', (64, 64), (100, 200, 100, 255))
                    print(f"  ℹ️  Using fallback green texture for {mob['name']}")

                # Save texture to mod resources
                mod_assets_dir = os.path.join(BUILD_PATH, 'src/main/resources/assets', item_namespace)
                os.makedirs(os.path.join(mod_assets_dir, 'textures/entity'), exist_ok=True)

                texture_path = os.path.join(mod_assets_dir, 'textures/entity', f'{mob_id}.png')
                mob_texture.save(texture_path, 'PNG')
                print(f"  ✓ Saved mob texture: {mob_id}.png ({mob_texture.size[0]}x{mob_texture.size[1]})")

            # Generate client-side renderer class and registration
            renderer_registration = ''
            for mob in custom_mobs:
                mob_id = mob['id']
                mob_class = f"{mob_id.capitalize()}Entity"
                mob_renderer = f"{mob_id.capitalize()}Renderer"

                # Generate billboard renderer class
                renderer_code = f"""package {package_name};

import net.minecraft.client.render.VertexConsumerProvider;
import net.minecraft.client.render.entity.EntityRenderer;
import net.minecraft.client.render.entity.EntityRendererFactory;
import net.minecraft.client.util.math.MatrixStack;
import net.minecraft.util.Identifier;
import net.minecraft.util.math.RotationAxis;
import com.mojang.blaze3d.systems.RenderSystem;
import net.minecraft.client.render.*;
import org.joml.Matrix4f;

public class {mob_renderer} extends EntityRenderer<{mob_class}> {{
    private static final Identifier TEXTURE = Identifier.of("{item_namespace}", "textures/entity/{mob_id}.png");

    public {mob_renderer}(EntityRendererFactory.Context context) {{
        super(context);
    }}

    @Override
    public Identifier getTexture({mob_class} entity) {{
        return TEXTURE;
    }}

    @Override
    public void render({mob_class} entity, float yaw, float tickDelta, MatrixStack matrices, VertexConsumerProvider vertexConsumers, int light) {{
        matrices.push();

        // Make sprite face the player (billboard effect)
        matrices.multiply(this.dispatcher.getRotation());
        matrices.multiply(RotationAxis.POSITIVE_Y.rotationDegrees(180.0f));

        // Scale based on entity size
        float scale = {mob.get('size', 1.0)}f;
        matrices.scale(scale, scale, scale);

        // Render as flat quad with texture (counter-clockwise winding)
        Matrix4f matrix = matrices.peek().getPositionMatrix();
        VertexConsumer buffer = vertexConsumers.getBuffer(RenderLayer.getEntityCutoutNoCull(getTexture(entity)));

        // Bottom-left
        vertex(buffer, matrix, -0.5f, 0.0f, 0.0f, 0.0f, 1.0f, light);
        // Top-left
        vertex(buffer, matrix, -0.5f, 1.0f, 0.0f, 0.0f, 0.0f, light);
        // Top-right
        vertex(buffer, matrix, 0.5f, 1.0f, 0.0f, 1.0f, 0.0f, light);
        // Bottom-right
        vertex(buffer, matrix, 0.5f, 0.0f, 0.0f, 1.0f, 1.0f, light);

        matrices.pop();
        super.render(entity, yaw, tickDelta, matrices, vertexConsumers, light);
    }}

    private void vertex(VertexConsumer buffer, Matrix4f matrix, float x, float y, float z, float u, float v, int light) {{
        buffer.vertex(matrix, x, y, z)
            .color(255, 255, 255, 255)
            .texture(u, v)
            .overlay(OverlayTexture.DEFAULT_UV)
            .light(light)
            .normal(0, 1, 0);
    }}
}}
"""

                # Write renderer class
                renderer_class_path = os.path.join(package_path, f'{mob_renderer}.java')
                with open(renderer_class_path, 'w') as f:
                    f.write(renderer_code)
                print(f"  ✓ Generated renderer class: {mob_renderer}.java")

                # Add to renderer registration
                renderer_registration += f"        EntityRendererRegistry.register(BlockCraftMod.{mob_id.upper()}_ENTITY, {mob_renderer}::new);\n"

            # Generate client initializer
            client_template_path = os.path.join(BUILD_PATH, 'src/main/java/com/blockcraft/BlockCraftModClient.java.template')
            with open(client_template_path, 'r') as f:
                client_template = f.read()

            client_code = client_template.replace('package com.blockcraft;', f'package {package_name};')
            client_code = client_code.replace('// GENERATED_RENDERER_REGISTRATION', renderer_registration)

            client_file_path = os.path.join(package_path, 'BlockCraftModClient.java')
            with open(client_file_path, 'w') as f:
                f.write(client_code)
            print(f"  ✓ Generated client initializer")

            # Update fabric.mod.json to include client entrypoint
            fabric_mod_json_path = os.path.join(BUILD_PATH, 'src/main/resources/fabric.mod.json')
            with open(fabric_mod_json_path, 'r') as f:
                fabric_mod_json = json.load(f)

            if 'entrypoints' not in fabric_mod_json:
                fabric_mod_json['entrypoints'] = {}

            fabric_mod_json['entrypoints']['client'] = [f'{package_name}.BlockCraftModClient']

            with open(fabric_mod_json_path, 'w') as f:
                json.dump(fabric_mod_json, f, indent=2)

        # Generate language file for display names
        print("🌍 Generating language file for display names...")
        lang_dir = os.path.join(BUILD_PATH, 'src/main/resources/assets', item_namespace, 'lang')
        os.makedirs(lang_dir, exist_ok=True)

        lang_data = {}

        # Add item display names
        for item in custom_items:
            item_id = item['id']
            item_name = item['name']
            lang_data[f'item.{item_namespace}.{item_id}'] = item_name

        # Add entity display names
        for mob in custom_mobs:
            mob_id = mob['id']
            mob_name = mob['name']
            lang_data[f'entity.{item_namespace}.{mob_id}'] = mob_name

        # Write language file
        lang_file_path = os.path.join(lang_dir, 'en_us.json')
        with open(lang_file_path, 'w') as f:
            json.dump(lang_data, f, indent=2)
        print(f"  ✓ Generated language file with {len(lang_data)} translations")

        # Generate block_display model functions
        block_display_models = data.get('blockDisplayModels', [])
        model_variants = data.get('modelVariants', {})  # { "model_123": ["scale_2", "scale_10"] }
        model_errors = []  # Track errors for user feedback

        if block_display_models and len(block_display_models) > 0:
            print(f"🎨 Generating {len(block_display_models)} block display model functions...")

            # Create datapack directory structure
            datapack_dir = os.path.join(BUILD_PATH, 'src/main/resources/data', item_namespace, 'function')
            os.makedirs(datapack_dir, exist_ok=True)

            for model in block_display_models:
                model_id = model.get('model_id', 'unknown')
                model_name = model.get('name', 'AI Model')
                blocks_json = model.get('blocks_json', '[]')

                # Parse blocks from JSON string
                try:
                    blocks = json.loads(blocks_json) if isinstance(blocks_json, str) else blocks_json
                except json.JSONDecodeError:
                    error_msg = f"Failed to parse blocks_json for {model_name}"
                    print(f"  ⚠ {error_msg}")
                    model_errors.append(error_msg)
                    continue

                if not blocks:
                    error_msg = f"No blocks found for {model_name}"
                    print(f"  ⚠ {error_msg}")
                    model_errors.append(error_msg)
                    continue

                # Get variants for this model (e.g., ["scale_2", "scale_10"])
                variants = model_variants.get(model_id, [])

                # If no variants specified, generate base version
                if not variants:
                    variants = ['base']

                for variant in variants:
                    # Parse variant to get scale/rotation multiplier
                    scale_multiplier = 1.0
                    rotation_offset = 0.0
                    variant_suffix = ""

                    if variant != 'base':
                        parts = variant.split('_')
                        if len(parts) >= 2:
                            variant_type = parts[0]
                            variant_value = float(parts[1])
                            if variant_type == 'scale':
                                scale_multiplier = variant_value
                                # Format as int if whole number to match JavaScript
                                if variant_value == int(variant_value):
                                    variant_suffix = f"_scale_{int(variant_value)}"
                                else:
                                    variant_suffix = f"_scale_{variant_value}".replace('.', '_')
                            elif variant_type == 'rotation':
                                rotation_offset = variant_value
                                if variant_value == int(variant_value):
                                    variant_suffix = f"_rotation_{int(variant_value)}"
                                else:
                                    variant_suffix = f"_rotation_{variant_value}".replace('.', '_')

                    print(f"  Generating function for: {model_name} ({len(blocks)} blocks) - variant: {variant} (scale={scale_multiplier})")

                    # Create mcfunction file
                    function_lines = [
                        f"# {model_name} {variant}",
                        f"# Generated by BlockCraft AI",
                        f"# Prompt: {model.get('prompt', 'N/A')}",
                        "",
                    ]

                    for block_entity in blocks:
                        block_type = block_entity.get('block', 'minecraft:stone')
                        x = block_entity.get('x', 0) * scale_multiplier
                        y = block_entity.get('y', 0) * scale_multiplier
                        z = block_entity.get('z', 0) * scale_multiplier
                        properties = block_entity.get('properties', {})
                        brightness = block_entity.get('brightness', {})
                        scale = block_entity.get('scale', None)
                        rotation = block_entity.get('rotation', None)

                        # Add Y offset to match Three.js rendering (blocks pivot at center in Three.js, bottom in Minecraft)
                        if scale:
                            sy = scale[1]  # Get Y scale
                            y += (sy * scale_multiplier) / 2

                        # Build block_state NBT
                        props_nbt = ""
                        if properties:
                            props_list = [f'{k}:"{v}"' for k, v in properties.items()]
                            props_nbt = f",Properties:{{{','.join(props_list)}}}"

                        # Build transformation NBT - MUST include all components for Minecraft to apply it
                        # Default identity transformation
                        sx, sy, sz = (1.0, 1.0, 1.0)
                        if scale:
                            sx, sy, sz = scale
                            # Apply scale multiplier to each block's scale
                            sx *= scale_multiplier
                            sy *= scale_multiplier
                            sz *= scale_multiplier

                        # Rotation (quaternion format [x, y, z, w])
                        left_rot = "[0f,0f,0f,1f]"  # Identity quaternion (no rotation)
                        if rotation:
                            pitch, yaw, roll = rotation
                            # Convert degrees to quaternion (simplified - just use left_rotation for yaw)
                            import math
                            yaw_rad = math.radians(yaw + rotation_offset)
                            left_rot = f"[0f,{math.sin(yaw_rad/2)}f,0f,{math.cos(yaw_rad/2)}f]"

                        # Complete transformation with all required components
                        transform_nbt = (
                            f",transformation:{{"
                            f"translation:[0f,0f,0f],"
                            f"left_rotation:{left_rot},"
                            f"scale:[{sx}f,{sy}f,{sz}f],"
                            f"right_rotation:[0f,0f,0f,1f]"
                            f"}}"
                        )

                        # Build brightness NBT
                        brightness_nbt = ""
                        if brightness:
                            sky = brightness.get('sky', 15)
                            block_light = brightness.get('block', 0)
                            brightness_nbt = f",brightness:{{sky:{sky},block:{block_light}}}"

                        # Generate summon command
                        summon_cmd = (
                            f"summon minecraft:block_display ~{x} ~{y} ~{z} "
                            f"{{block_state:{{Name:\"{block_type}\"{props_nbt}}}"
                            f"{brightness_nbt}{transform_nbt}}}"
                        )

                        function_lines.append(summon_cmd)

                    # Write function file with variant suffix
                    function_filename = f'{model_id}{variant_suffix}.mcfunction'
                    function_file_path = os.path.join(datapack_dir, function_filename)
                    with open(function_file_path, 'w') as f:
                        f.write('\n'.join(function_lines))

                    print(f"  ✓ Generated function: {function_filename}")

            print(f"  ✓ All block display functions generated")

        # Build with Gradle
        print("Building mod with Gradle...")
        gradle_cmd = os.path.join(BUILD_PATH, 'gradle-8.8/bin/gradle')
        result = subprocess.run(
            [gradle_cmd, 'build', '--no-daemon'],
            cwd=BUILD_PATH,
            capture_output=True,
            text=True,
            timeout=300,
            env={**os.environ, 'JAVA_HOME': '/usr/lib/jvm/java-21-openjdk-amd64'}
        )

        if result.returncode != 0:
            return jsonify({
                'success': False,
                'error': f'Gradle build failed:\n{result.stderr}'
            }), 500

        # Find the built JAR
        jar_path = os.path.join(BUILD_PATH, 'build/libs')
        jars = [f for f in os.listdir(jar_path) if f.endswith('.jar') and 'sources' not in f]

        if not jars:
            return jsonify({'success': False, 'error': 'No JAR file found after build'}), 500

        jar_file = os.path.join(jar_path, jars[0])

        # Create unique JAR filename based on project ID
        unique_jar_name = f'blockcraft-{safe_project_id}.jar'

        # Check if we should deploy or just build
        should_deploy = data.get('deploy', True)  # Default to True for backwards compatibility

        # Check if there are custom textures (uploaded or AI-generated)
        # Only deploy to client if there are custom textures that need a resource pack
        has_custom_textures = False
        for item in custom_items:
            if item.get('textureData') or item.get('texture'):
                has_custom_textures = True
                break
        if not has_custom_textures:
            for mob in custom_mobs:
                if mob.get('textureData') or mob.get('texture'):
                    has_custom_textures = True
                    break

        # Initialize variables
        target_jar = None
        client_target_jar = None
        client_mods_path = '/home/jordan/.minecraft/mods'

        if should_deploy:
            # Remove old version of THIS specific project from mods folder
            for f in os.listdir(MINECRAFT_MODS_PATH):
                if f == unique_jar_name:
                    os.remove(os.path.join(MINECRAFT_MODS_PATH, f))

            # Copy new mod to mods folder with unique name
            target_jar = os.path.join(MINECRAFT_MODS_PATH, unique_jar_name)
            shutil.copy(jar_file, target_jar)

            # Also copy to client mods folder (only if custom textures exist)
            if has_custom_textures and os.path.exists(client_mods_path):
                # Remove old versions from client too
                for f in os.listdir(client_mods_path):
                    if f.startswith(f'blockcraft-{safe_project_id}') and f.endswith('.jar'):
                        os.remove(os.path.join(client_mods_path, f))

                # Copy new version to client
                client_target_jar = os.path.join(client_mods_path, unique_jar_name)
                shutil.copy(jar_file, client_target_jar)
                print(f"📦 Mod also deployed to client: {client_target_jar}")
        else:
            # Just build - copy to Downloads folder
            home_dir = os.path.expanduser("~")
            downloads_dir = os.path.join(home_dir, "Downloads")
            os.makedirs(downloads_dir, exist_ok=True)
            target_jar = os.path.join(downloads_dir, unique_jar_name)
            shutil.copy(jar_file, target_jar)
            print(f"📦 Mod built and saved to: {target_jar}")

        # Deploy resource pack and restart server only if deploying
        resource_pack_message = ''
        mod_download_message = ''
        restart_message = ''

        if should_deploy and resource_pack_path and os.path.exists(resource_pack_path):
            # Copy to HTTP server directory for client download
            pack_filename = f'blockcraft-{safe_project_id}.zip'
            http_pack_path = os.path.join(RESOURCEPACKS_HTTP_DIR, pack_filename)

            if os.path.exists(RESOURCEPACKS_HTTP_DIR):
                shutil.copy(resource_pack_path, http_pack_path)
                print(f"📦 Resource pack deployed to HTTP server: {http_pack_path}")

                # Calculate SHA1 hash
                sha1_hash = calculate_sha1(http_pack_path)
                print(f"🔐 Resource pack SHA1: {sha1_hash}")

                # Get server IP and create URL
                server_ip = get_local_ip()
                resource_pack_url = f'http://{server_ip}:8888/{pack_filename}'

                # Update server.properties
                if update_server_properties(resource_pack_url, sha1_hash):
                    resource_pack_message = f'\\n\\n📦 Resource pack auto-configured!\\n   Clients will auto-download custom textures when they connect.\\n   URL: {resource_pack_url}'
                else:
                    resource_pack_message = f'\\n\\n📦 Resource pack created but server.properties update failed'
            else:
                resource_pack_message = f'\\n\\n⚠️ Resource pack HTTP directory not found: {RESOURCEPACKS_HTTP_DIR}'

        # Make mod JAR available for HTTP download
        if should_deploy and jar_file and os.path.exists(jar_file):
            if os.path.exists(RESOURCEPACKS_HTTP_DIR):
                # Copy mod JAR to HTTP directory
                mod_http_path = os.path.join(RESOURCEPACKS_HTTP_DIR, unique_jar_name)
                shutil.copy(jar_file, mod_http_path)
                print(f"📦 Mod JAR available for HTTP download: {mod_http_path}")

                # Get server IP and create download URL
                server_ip = get_local_ip()
                mod_download_url = f'http://{server_ip}:8888/{unique_jar_name}'

                mod_download_message = f'\\n\\n🔗 Mod download link for other clients:\\n   {mod_download_url}\\n   (Download and place in .minecraft/mods/ folder)'

        # Get command list
        cmd_names = [cmd['name'] for cmd in data.get('commands', [])]
        if cmd_names:
            cmd_list = '\\n'.join([f'  /{name}' for name in cmd_names])
        else:
            cmd_list = '  (No commands - this mod uses events/custom items)'

        # Restart Minecraft server only if deploying
        if should_deploy:
            try:
                subprocess.run(['sudo', 'systemctl', 'restart', 'cobblemon-server'], check=True)
                restart_message = '\\n\\n🔄 Server restarted! Mod is now loaded!'
            except Exception as e:
                restart_message = f'\\n\\n⚠️ Could not auto-restart server. Please restart manually with: sudo systemctl restart cobblemon-server'

        # Create download message
        if should_deploy:
            download_msg = f'\\n\\n📦 Mod files saved to:\\n  - Server: {target_jar}\\n  - Client: {client_target_jar if client_target_jar else "N/A"}'
        else:
            download_msg = f'\\n\\n📦 Mod JAR saved to: {target_jar}'

        # Create success message
        if should_deploy:
            success_msg = f'✅ Mod compiled and deployed!{restart_message}\\n\\n🎮 Your custom commands:\\n{cmd_list}{resource_pack_message}{mod_download_message}{download_msg}'
        else:
            success_msg = f'✅ Mod built successfully!\\n\\n🎮 Your custom commands:\\n{cmd_list}{download_msg}'

        # Add model errors if any occurred
        if model_errors:
            error_list = '\\n'.join([f'  • {err}' for err in model_errors])
            success_msg += f'\\n\\n⚠️ WARNINGS:\\n{error_list}'

        return jsonify({
            'success': True if not model_errors else False,
            'error': f"Deployment had errors:\\n{'\\n'.join(model_errors)}" if model_errors else None,
            'message': success_msg,
            'jar_file': jars[0],
            'jar_path': target_jar,
            'mod_download_url': mod_download_url if 'mod_download_url' in locals() else None,
            'resource_pack_path': resource_pack_path if resource_pack_path and os.path.exists(resource_pack_path) else None,
            'project_id': safe_project_id,
            'has_custom_textures': has_custom_textures,
            'project_name': project_name,
            'warnings': model_errors if model_errors else None
        })

    except Exception as e:
        import traceback
        error_msg = f"{str(e)}\n\nTraceback:\n{traceback.format_exc()}"
        print(f"ERROR: {error_msg}")
        return jsonify({'success': False, 'error': error_msg}), 500

@app.route('/preview-texture', methods=['POST'])
def preview_texture():
    """
    Preview a single AI-generated texture
    """
    try:
        data = request.json

        description = data.get('description', '')
        item_id = data.get('itemId', 'preview')
        api_key = data.get('apiKey', '')
        ai_model = data.get('model', 'gpt-image-1-mini')

        if not description or not api_key:
            return jsonify({'success': False, 'error': 'Missing description or API key'}), 400

        print(f"🎨 Preview texture generation: {description}")

        # Generate texture
        texture_gen = TextureGenerator(api_key, ai_model)
        texture = texture_gen.generate_texture(description, item_id)

        if not texture:
            return jsonify({'success': False, 'error': 'AI generation failed'}), 500

        # Convert to base64
        buffer = BytesIO()
        texture.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()

        return jsonify({
            'success': True,
            'image': img_str
        })

    except Exception as e:
        import traceback
        error_msg = f"{str(e)}\n\nTraceback:\n{traceback.format_exc()}"
        print(f"ERROR: {error_msg}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/download-package', methods=['POST'])
def download_package():
    """
    Creates a downloadable ZIP package with mod JAR, resource pack, and instructions
    """
    try:
        from flask import send_file
        import zipfile
        import tempfile

        data = request.json
        jar_path = data.get('jar_path')
        resource_pack_path = data.get('resource_pack_path')
        project_name = data.get('project_name', 'BlockCraft Mod')

        if not jar_path or not os.path.exists(jar_path):
            return jsonify({'success': False, 'error': 'JAR file not found'}), 404

        # Create temporary ZIP file
        zip_path = tempfile.mktemp(suffix='.zip')

        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Add JAR file
            zipf.write(jar_path, os.path.basename(jar_path))

            # Add resource pack if it exists
            if resource_pack_path and os.path.exists(resource_pack_path):
                zipf.write(resource_pack_path, os.path.basename(resource_pack_path))

            # Create README
            readme_content = f"""# {project_name}

## Installation Instructions

### For Players:

1. Make sure you have Minecraft 1.21.1 with Fabric Loader installed
2. Copy the .jar file to your Minecraft mods folder:
   - Windows: %appdata%\\.minecraft\\mods
   - Mac: ~/Library/Application Support/minecraft/mods
   - Linux: ~/.minecraft/mods

3. If there's a resource pack (.zip file), install it:
   - Copy it to: resourcepacks folder in your .minecraft directory
   - OR launch Minecraft and go to Options > Resource Packs > Open Pack Folder
   - Move the .zip file there and enable it in-game

4. Restart Minecraft and join the server!

### For Server Owners:

1. Copy the .jar file to your server's mods folder
2. If there's a resource pack, copy it to world/datapacks folder for auto-enable
3. Restart the server

## Made with BlockCraft
Created with BlockCraft - a visual programming tool for Minecraft mods!
https://github.com/yourusername/blockcraft
"""

            zipf.writestr('README.txt', readme_content)

        # Send the file
        return send_file(
            zip_path,
            as_attachment=True,
            download_name=f'{project_name.replace(" ", "_")}_mod.zip',
            mimetype='application/zip'
        )

    except Exception as e:
        import traceback
        error_msg = f"{str(e)}\n\nTraceback:\n{traceback.format_exc()}"
        print(f"ERROR: {error_msg}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/mods-manifest', methods=['GET'])
def mods_manifest():
    """
    Returns a manifest of all deployed BlockCraft mods available for download
    Used by BlockCraft Loader client mod to auto-download mods
    """
    try:
        mods_list = []
        server_ip = get_local_ip()

        # Scan both server mods folder and HTTP directory for blockcraft mods
        locations = [
            MINECRAFT_MODS_PATH,
            RESOURCEPACKS_HTTP_DIR
        ]

        seen_mods = set()

        for location in locations:
            if not os.path.exists(location):
                continue

            for filename in os.listdir(location):
                if filename.startswith('blockcraft-') and filename.endswith('.jar'):
                    # Avoid duplicates
                    if filename in seen_mods:
                        continue
                    seen_mods.add(filename)

                    file_path = os.path.join(location, filename)
                    file_size = os.path.getsize(file_path)
                    file_modified = os.path.getmtime(file_path)

                    # Extract project name from filename: blockcraft-PROJECTNAME.jar
                    project_name = filename.replace('blockcraft-', '').replace('.jar', '')

                    # Calculate SHA1 hash for integrity check
                    sha1 = calculate_sha1(file_path)

                    mod_info = {
                        'filename': filename,
                        'project_name': project_name,
                        'download_url': f'http://{server_ip}:8888/{filename}',
                        'size': file_size,
                        'modified': file_modified,
                        'sha1': sha1
                    }

                    mods_list.append(mod_info)

        return jsonify({
            'success': True,
            'server_ip': server_ip,
            'mods_count': len(mods_list),
            'mods': mods_list
        })

    except Exception as e:
        import traceback
        error_msg = f"{str(e)}\n\nTraceback:\n{traceback.format_exc()}"
        print(f"ERROR in mods-manifest: {error_msg}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Check if API is running"""
    return jsonify({'status': 'ok', 'mode': 'java'})

if __name__ == '__main__':
    print("🚀 BlockCraft Java Deployment API Starting...")
    print(f"📁 Template path: {TEMPLATE_PATH}")
    print(f"📁 Minecraft mods path: {MINECRAFT_MODS_PATH}")
    print(f"🌐 API running on: http://localhost:8585")
    print(f"")
    print("Press Ctrl+C to stop")
    print("=" * 60)
    app.run(host='0.0.0.0', port=8585, debug=True)
