pub mod openai;
pub mod openai_codegen;
pub mod db_commands;

use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs;
use std::process::Command as ProcessCommand;

/// Basic greeting command for testing
#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to BlocklyCraft.", name)
}

/// Save project data to a file
#[tauri::command]
pub async fn save_project(file_path: String, workspace_xml: String) -> Result<(), String> {
    fs::write(&file_path, workspace_xml)
        .map_err(|e| format!("Failed to save project: {}", e))?;

    Ok(())
}

/// Load project data from a file
#[tauri::command]
pub async fn load_project(file_path: String) -> Result<String, String> {
    let content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to load project: {}", e))?;

    Ok(content)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomItem {
    pub id: String,
    pub name: String,
    #[serde(rename = "textureSource")]
    pub texture_source: String,
    #[serde(rename = "textureDescription")]
    pub texture_description: Option<String>,
    #[serde(rename = "uploadedTexture")]
    pub uploaded_texture: Option<String>,
    #[serde(rename = "baseItem")]
    pub base_item: String,
    pub rarity: String,
    #[serde(rename = "maxStack")]
    pub max_stack: i32,
    pub recipe: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CustomMob {
    pub name: String,
    #[serde(rename = "uploadedTexture")]
    pub uploaded_texture: Option<String>,
    pub health: i32,
    pub size: f32,
    pub speed: String,
    pub behavior: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum Condition {
    SensingIsSneaking {},
    SensingIsInWater {},
    SensingIsOnFire {},
    SensingIsOnGround {},
    SensingIsSprinting {},
    SensingIsFlying {},
    SensingGetHealth {},
    SensingGetHunger {},
    LogicNot { condition: Option<Box<Condition>> },
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum Action {
    Title { title: String },
    SpawnMob { mob: String },
    Repeat { times: i32, actions: Vec<Action> },
    RepeatForever { actions: Vec<Action> },
    Wait { seconds: f64 },
    IfThen { condition: Option<Condition>, actions: Vec<Action> },
    Message { message: String },
    GiveItem { item: String, amount: i32 },
    PlaySound { sound: String },
    Actionbar { text: String },
    PlayerEffect { effect: String, duration: i32 },

    // Player actions
    PlayerHealth { health: i32 },

    // World actions
    WorldPlaceBlock { block: String },
    WorldTime { time: String },
    WorldWeather { weather: String },
    WorldExplosion { power: String },
    WorldLightning {},
    WorldFill { size: i32, block: String },
    WorldEntityFollow { entity: String, range: i32, duration: i32 },
    WorldEntityAttack { entity: String, range: i32 },
    WorldEntityTame { entity: String, range: i32 },

    // Motion actions
    MotionMoveForward { distance: f64 },
    MotionTeleport { x: f64, y: f64, z: f64 },
    MotionTeleportForward { distance: i32 },
    MotionTeleportVertical { distance: i32, direction: String },
    MotionTeleportSpawn {},
    MotionRotate { direction: String },
    MotionLaunch { power: f64, direction: String },
    MotionSetX { axis: String, value: f64 },
    MotionChangeX { axis: String, value: f64 },

    // Looks actions
    LooksSubtitle { subtitle: String },
    LooksParticles { particle: String, count: i32 },
    LooksClearEffects {},
    LooksDisplayName { name: String },
    LooksGamemode { gamemode: String },

    // Sound actions
    SoundMusicDisc { disc: String },
    SoundStopAll {},

    // Custom actions
    CustomActionProjectile { projectile: String, speed: f64 },
    CustomActionParticles { particle: String, count: i32 },
    CustomActionAreaEffect { #[serde(rename = "effectType")] effect_type: String, radius: i32, power: f64 },
    CustomActionTeleportLook { distance: i32 },

    // AI Model actions
    SpawnBlockDisplayModel { model_id: String },
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Command {
    pub command: String,
    pub actions: Vec<Action>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RightClickEvent {
    pub item: String,
    pub actions: Vec<Action>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockDisplayEntity {
    pub block: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub properties: Option<std::collections::HashMap<String, String>>,
    pub x: f64,
    pub y: f64,
    pub z: f64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub scale: Option<[f64; 3]>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub rotation: Option<[f64; 3]>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub brightness: Option<BlockBrightness>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockBrightness {
    pub sky: i32,
    pub block: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockDisplayModel {
    pub id: String,
    pub name: String,
    pub prompt: String,
    pub blocks: Vec<BlockDisplayEntity>,
    #[serde(rename = "generatedBy")]
    pub generated_by: String,
    #[serde(rename = "createdAt")]
    pub created_at: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ModData {
    #[serde(rename = "customItems")]
    pub custom_items: Vec<CustomItem>,
    #[serde(rename = "customMobs")]
    pub custom_mobs: Vec<CustomMob>,
    pub commands: Vec<Command>,
    #[serde(rename = "rightClickEvents")]
    pub right_click_events: Vec<RightClickEvent>,
    #[serde(rename = "blockDisplayModels")]
    pub block_display_models: Vec<BlockDisplayModel>,
}

/// Generate Java code for a condition
fn generate_condition_java(condition: &Option<Condition>) -> String {
    match condition {
        None => "true".to_string(),
        Some(cond) => match cond {
            Condition::SensingIsSneaking {} => "player.isSneaking()".to_string(),
            Condition::SensingIsInWater {} => "player.isSubmergedInWater()".to_string(),
            Condition::SensingIsOnFire {} => "player.isOnFire()".to_string(),
            Condition::SensingIsOnGround {} => "player.isOnGround()".to_string(),
            Condition::SensingIsSprinting {} => "player.isSprinting()".to_string(),
            Condition::SensingIsFlying {} => "player.getAbilities().flying".to_string(),
            Condition::SensingGetHealth {} => "player.getHealth() > 10.0f".to_string(),
            Condition::SensingGetHunger {} => "player.getHungerManager().getFoodLevel() > 10".to_string(),
            Condition::LogicNot { condition } => {
                let inner = match condition {
                    Some(boxed_cond) => generate_condition_java(&Some((**boxed_cond).clone())),
                    None => "true".to_string(),
                };
                format!("!({})", inner)
            }
        }
    }
}

/// Generate Java code for an action
fn generate_action_java(action: &Action, indent: usize, mod_data: &ModData) -> String {
    let indent_str = "    ".repeat(indent);

    match action {
        Action::Title { title } => {
            format!(
                "{}source.sendFeedback(() -> Text.literal(\"{}\"), false);",
                indent_str, title.replace("\"", "\\\"")
            )
        }
        Action::SpawnMob { mob } => {
            format!(
                "{}// Spawn mob: {}\n\
                 {}EntityType<?> entityType = Registries.ENTITY_TYPE.get(Identifier.tryParse(\"{}\"));\n\
                 {}if (entityType != null) {{\n\
                 {}    Entity entity = entityType.create(world);\n\
                 {}    if (entity != null) {{\n\
                 {}        entity.refreshPositionAndAngles(pos.getX(), pos.getY() + 10, pos.getZ(), 0, 0);\n\
                 {}        world.spawnEntity(entity);\n\
                 {}    }}\n\
                 {}}}",
                indent_str, mob,
                indent_str, mob,
                indent_str,
                indent_str,
                indent_str,
                indent_str,
                indent_str,
                indent_str,
                indent_str
            )
        }
        Action::Message { message } => {
            format!(
                "{}source.sendMessage(Text.literal(\"{}\"));",
                indent_str, message.replace("\"", "\\\"")
            )
        }
        Action::GiveItem { item, amount } => {
            format!(
                "{}// Give item: {} x{}\n\
                 {}if (source.getPlayer() != null) {{\n\
                 {}    ItemStack itemStack = new ItemStack(Registries.ITEM.get(Identifier.tryParse(\"{}\")), {});\n\
                 {}    source.getPlayer().giveItemStack(itemStack);\n\
                 {}}}",
                indent_str, item, amount,
                indent_str,
                indent_str, item, amount,
                indent_str,
                indent_str
            )
        }
        Action::PlaySound { sound } => {
            format!(
                "{}// Play sound: {}\n\
                 {}world.playSound(null, pos.x, pos.y, pos.z, \n\
                 {}    Registries.SOUND_EVENT.get(Identifier.tryParse(\"{}\")),\n\
                 {}    SoundCategory.PLAYERS, 1.0f, 1.0f);",
                indent_str, sound,
                indent_str,
                indent_str, sound,
                indent_str
            )
        }
        Action::Actionbar { text } => {
            format!(
                "{}// Show action bar: {}\n\
                 {}if (source.getPlayer() != null) {{\n\
                 {}    source.getPlayer().sendMessage(Text.literal(\"{}\"), true);\n\
                 {}}}",
                indent_str, text,
                indent_str,
                indent_str, text.replace("\"", "\\\""),
                indent_str
            )
        }
        Action::PlayerEffect { effect, duration } => {
            format!(
                "{}// Apply effect: {} for {} seconds\n\
                 {}var effectOptional = net.minecraft.registry.Registries.STATUS_EFFECT.getEntry(\n\
                 {}    net.minecraft.registry.RegistryKey.of(\n\
                 {}        net.minecraft.registry.RegistryKeys.STATUS_EFFECT,\n\
                 {}        net.minecraft.util.Identifier.of(\"minecraft\", \"{}\")));\n\
                 {}if (effectOptional.isPresent()) {{\n\
                 {}    player.addStatusEffect(new net.minecraft.entity.effect.StatusEffectInstance(\n\
                 {}        effectOptional.get(), {} * 20, 0));\n\
                 {}}}",
                indent_str, effect, duration,
                indent_str,
                indent_str,
                indent_str,
                indent_str, effect.to_lowercase(),
                indent_str,
                indent_str,
                indent_str, duration,
                indent_str
            )
        }

        // Player actions
        Action::PlayerHealth { health } => {
            format!(
                "{}player.setHealth({}.0f);",
                indent_str, health
            )
        }

        // World actions
        Action::WorldPlaceBlock { block } => {
            format!(
                "{}world.setBlockState(player.getBlockPos(), \n\
                 {}    Registries.BLOCK.get(Identifier.tryParse(\"{}\")).getDefaultState());",
                indent_str,
                indent_str, block
            )
        }
        Action::WorldTime { time } => {
            format!(
                "{}world.setTimeOfDay({});",
                indent_str, time
            )
        }
        Action::WorldWeather { weather } => {
            let weather_code = match weather.as_str() {
                "clear" => "world.setWeather(0, 0, false, false);",
                "rain" => "world.setWeather(0, 6000, true, false);",
                "thunder" => "world.setWeather(0, 6000, true, true);",
                _ => "world.setWeather(0, 0, false, false);"
            };
            format!("{}{}", indent_str, weather_code)
        }
        Action::WorldExplosion { power } => {
            format!(
                "{}world.createExplosion(null, pos.x, pos.y, pos.z, {}f, World.ExplosionSourceType.NONE);",
                indent_str, power
            )
        }
        Action::WorldEntityFollow { entity, range, duration } => {
            format!(
                "{}// Make {} follow player for {} seconds within {} blocks\n\
                 {}new Thread(() -> {{\n\
                 {}    for (int i = 0; i < {} * 20; i++) {{\n\
                 {}        try {{\n\
                 {}            Thread.sleep(50);\n\
                 {}            ((ServerWorld)world).getServer().execute(() -> {{\n\
                 {}                var followingEntities = world.getEntitiesByClass(net.minecraft.entity.mob.MobEntity.class, \n\
                 {}                    player.getBoundingBox().expand({}), e -> e.getType().toString().contains(\"{}\"));\n\
                 {}                followingEntities.forEach(e -> {{\n\
                 {}                    if (e.squaredDistanceTo(player) <= {} * {}) {{\n\
                 {}                        e.getNavigation().startMovingTo(player, 1.0);\n\
                 {}                    }}\n\
                 {}                }});\n\
                 {}            }});\n\
                 {}        }} catch (InterruptedException ex) {{ break; }}\n\
                 {}    }}\n\
                 {}}}).start();",
                indent_str, entity, duration, range,
                indent_str,
                indent_str, duration,
                indent_str,
                indent_str,
                indent_str,
                indent_str,
                indent_str, range, entity,
                indent_str,
                indent_str, range, range,
                indent_str,
                indent_str,
                indent_str,
                indent_str,
                indent_str,
                indent_str,
                indent_str
            )
        }
        Action::WorldEntityAttack { entity, range } => {
            format!(
                "{}// Make {} attack player within {} blocks\n\
                 {}world.getEntitiesByClass(net.minecraft.entity.mob.MobEntity.class, \n\
                 {}    player.getBoundingBox().expand({}), e -> e.getType().toString().contains(\"{}\"))\n\
                 {}    .forEach(e -> e.setTarget(player));",
                indent_str, entity, range,
                indent_str,
                indent_str, range, entity,
                indent_str
            )
        }
        Action::WorldEntityTame { entity, range } => {
            format!(
                "{}// Tame {} within {} blocks\n\
                 {}world.getEntitiesByClass(net.minecraft.entity.passive.TameableEntity.class, \n\
                 {}    player.getBoundingBox().expand({}), e -> e.getType().toString().contains(\"{}\"))\n\
                 {}    .forEach(e -> {{ e.setOwner(player); e.setTamed(true); }});",
                indent_str, entity, range,
                indent_str,
                indent_str, range, entity,
                indent_str
            )
        }

        // Motion actions
        Action::MotionMoveForward { distance } => {
            format!(
                "{}Vec3d forward = player.getRotationVector().multiply({});\n\
                 {}player.teleport(pos.x + forward.x, pos.y, pos.z + forward.z);",
                indent_str, distance,
                indent_str
            )
        }
        Action::MotionTeleport { x, y, z } => {
            format!(
                "{}player.teleport({}, {}, {});",
                indent_str, x, y, z
            )
        }
        Action::MotionTeleportForward { distance } => {
            format!(
                "{}// Teleport {} blocks forward\n\
                 {}Vec3d forward = player.getRotationVector().multiply({});\n\
                 {}player.teleport(pos.x + forward.x, pos.y, pos.z + forward.z);",
                indent_str, distance,
                indent_str, distance,
                indent_str
            )
        }
        Action::MotionTeleportVertical { distance, direction } => {
            let offset = match direction.as_str() {
                "UP" => format!("{}", distance),
                "DOWN" => format!("-{}", distance),
                _ => format!("{}", distance)
            };
            format!(
                "{}// Teleport {} blocks {}\n\
                 {}player.teleport(pos.x, pos.y + {}, pos.z);",
                indent_str, distance, direction.to_lowercase(),
                indent_str, offset
            )
        }
        Action::MotionTeleportSpawn {} => {
            format!(
                "{}// Teleport to world spawn\n\
                 {}var spawnPos = ((ServerWorld)world).getSpawnPos();\n\
                 {}player.teleport(spawnPos.getX(), spawnPos.getY(), spawnPos.getZ());",
                indent_str,
                indent_str,
                indent_str
            )
        }
        Action::MotionRotate { direction } => {
            format!(
                "{}player.setYaw({}f);",
                indent_str, direction
            )
        }
        Action::MotionLaunch { power, direction } => {
            let velocity = match direction.as_str() {
                "up" => format!("player.setVelocity(0, {}, 0);", power),
                "forward" => format!("Vec3d forward = player.getRotationVector().multiply({});\nplayer.setVelocity(forward);", power),
                "backward" => format!("Vec3d backward = player.getRotationVector().multiply(-{});\nplayer.setVelocity(backward);", power),
                _ => format!("player.setVelocity(0, {}, 0);", power)
            };
            format!("{}{}\n{}player.velocityModified = true;", indent_str, velocity, indent_str)
        }
        Action::MotionSetX { axis, value } => {
            let pos_update = match axis.as_str() {
                "x" => format!("player.teleport({}, pos.y, pos.z);", value),
                "y" => format!("player.teleport(pos.x, {}, pos.z);", value),
                "z" => format!("player.teleport(pos.x, pos.y, {});", value),
                _ => format!("player.teleport({}, pos.y, pos.z);", value)
            };
            format!("{}{}", indent_str, pos_update)
        }
        Action::MotionChangeX { axis, value } => {
            let pos_update = match axis.as_str() {
                "x" => format!("player.teleport(pos.x + {}, pos.y, pos.z);", value),
                "y" => format!("player.teleport(pos.x, pos.y + {}, pos.z);", value),
                "z" => format!("player.teleport(pos.x, pos.y, pos.z + {});", value),
                _ => format!("player.teleport(pos.x + {}, pos.y, pos.z);", value)
            };
            format!("{}{}", indent_str, pos_update)
        }

        // Looks actions
        Action::LooksSubtitle { subtitle } => {
            format!(
                "{}player.sendMessage(Text.literal(\"{}\"), false);",
                indent_str, subtitle.replace("\"", "\\\"")
            )
        }
        Action::LooksParticles { particle, count } => {
            format!(
                "{}// Spawn {} {} particles\n\
                 {}for (int i = 0; i < {}; i++) {{\n\
                 {}    ((ServerWorld)world).spawnParticles(net.minecraft.particle.ParticleTypes.{},\n\
                 {}        pos.x, pos.y + 1, pos.z, 1, 0.5, 0.5, 0.5, 0.1);\n\
                 {}}}",
                indent_str, count, particle,
                indent_str, count,
                indent_str, particle.to_uppercase(),
                indent_str,
                indent_str
            )
        }
        Action::LooksClearEffects {} => {
            format!(
                "{}player.clearStatusEffects();",
                indent_str
            )
        }
        Action::LooksDisplayName { name } => {
            format!(
                "{}player.setCustomName(Text.literal(\"{}\"));",
                indent_str, name.replace("\"", "\\\"")
            )
        }
        Action::LooksGamemode { gamemode } => {
            format!(
                "{}player.changeGameMode(GameMode.{});",
                indent_str, gamemode
            )
        }

        // Sound actions
        Action::SoundMusicDisc { disc } => {
            format!(
                "{}world.playSound(null, pos.x, pos.y, pos.z,\n\
                 {}    Registries.SOUND_EVENT.get(Identifier.tryParse(\"{}\")),\n\
                 {}    SoundCategory.RECORDS, 1.0f, 1.0f);",
                indent_str,
                indent_str, disc,
                indent_str
            )
        }
        Action::SoundStopAll {} => {
            format!(
                "{}// Stop all sounds for player\n\
                 {}player.networkHandler.sendPacket(new net.minecraft.network.packet.s2c.play.StopSoundS2CPacket(\n\
                 {}    null, null));",
                indent_str,
                indent_str,
                indent_str
            )
        }

        // Custom actions
        Action::CustomActionProjectile { projectile, speed } => {
            format!(
                "{}// Shoot {} projectile\n\
                 {}Vec3d direction = player.getRotationVector();\n\
                 {}Vec3d velocity = new Vec3d(direction.x * {}, direction.y * {}, direction.z * {});\n\
                 {}var projectileEntity = new net.minecraft.entity.projectile.FireballEntity(world, player, velocity, 1);\n\
                 {}projectileEntity.setPosition(pos.x, pos.y + 1.5, pos.z);\n\
                 {}world.spawnEntity(projectileEntity);",
                indent_str, projectile,
                indent_str,
                indent_str, speed, speed, speed,
                indent_str,
                indent_str,
                indent_str
            )
        }
        Action::CustomActionParticles { particle, count } => {
            format!(
                "{}// Spawn {} {} particles\n\
                 {}for (int i = 0; i < {}; i++) {{\n\
                 {}    ((ServerWorld)world).spawnParticles(net.minecraft.particle.ParticleTypes.{},\n\
                 {}        pos.x, pos.y + 1, pos.z, 1, 0.5, 0.5, 0.5, 0.1);\n\
                 {}}}",
                indent_str, count, particle,
                indent_str, count,
                indent_str, particle.to_uppercase(),
                indent_str,
                indent_str
            )
        }
        Action::CustomActionAreaEffect { effect_type, radius, power } => {
            let effect_code = match effect_type.as_str() {
                "push" => format!("Vec3d away = e.getPos().subtract(pos).normalize().multiply({});\\ne.setVelocity(away);\\ne.velocityModified = true;", power),
                "pull" => format!("Vec3d toward = pos.subtract(e.getPos()).normalize().multiply({});\\ne.setVelocity(toward);\\ne.velocityModified = true;", power),
                "damage" => format!("e.damage(world.getDamageSources().generic(), {}f);", power),
                "heal" => format!("if (e instanceof LivingEntity) ((LivingEntity)e).heal({}f);", power),
                "ignite" => "e.setOnFireFor(5);".to_string(),
                "freeze" => "e.setFrozenTicks(200);".to_string(),
                _ => format!("Vec3d away = e.getPos().subtract(pos).normalize().multiply({});\\ne.setVelocity(away);\\ne.velocityModified = true;", power)
            };
            format!(
                "{}// Area effect: {} (radius: {}, power: {})\n\
                 {}world.getOtherEntities(player, player.getBoundingBox().expand({}),\n\
                 {}    e -> e.squaredDistanceTo(player) <= {} * {})\n\
                 {}    .forEach(e -> {{ {} }});",
                indent_str, effect_type, radius, power,
                indent_str, radius,
                indent_str, radius, radius,
                indent_str, effect_code
            )
        }
        Action::CustomActionTeleportLook { distance } => {
            format!(
                "{}// Teleport to where player is looking\n\
                 {}var hitResult = player.raycast({}, 0, false);\n\
                 {}if (hitResult.getType() == net.minecraft.util.hit.HitResult.Type.BLOCK) {{\n\
                 {}    var blockHit = (net.minecraft.util.hit.BlockHitResult)hitResult;\n\
                 {}    player.teleport(blockHit.getBlockPos().getX(), \n\
                 {}        blockHit.getBlockPos().getY() + 1, \n\
                 {}        blockHit.getBlockPos().getZ());\n\
                 {}}}",
                indent_str,
                indent_str, distance,
                indent_str,
                indent_str,
                indent_str,
                indent_str,
                indent_str,
                indent_str
            )
        }

        Action::Repeat { times, actions } => {
            let mut code = format!("{}for (int i = 0; i < {}; i++) {{\n", indent_str, times);
            for nested_action in actions {
                code.push_str(&generate_action_java(nested_action, indent + 1, mod_data));
                code.push('\n');
            }
            code.push_str(&format!("{}}}", indent_str));
            code
        }

        Action::RepeatForever { actions } => {
            let mut code = format!("{}// WARNING: Repeat forever - use with caution!\n", indent_str);
            code.push_str(&format!("{}new java.util.Timer().scheduleAtFixedRate(new java.util.TimerTask() {{\n", indent_str));
            code.push_str(&format!("{}    @Override\n", indent_str));
            code.push_str(&format!("{}    public void run() {{\n", indent_str));
            for nested_action in actions {
                code.push_str(&generate_action_java(nested_action, indent + 2, mod_data));
                code.push('\n');
            }
            code.push_str(&format!("{}    }}\n", indent_str));
            code.push_str(&format!("{}}}, 0, 50);", indent_str));
            code
        }

        Action::Wait { seconds } => {
            format!(
                "{}// Wait {} seconds\n\
                 {}try {{\n\
                 {}    Thread.sleep((long) ({} * 1000));\n\
                 {}}} catch (InterruptedException e) {{\n\
                 {}    Thread.currentThread().interrupt();\n\
                 {}}}",
                indent_str, seconds,
                indent_str,
                indent_str, seconds,
                indent_str,
                indent_str,
                indent_str
            )
        }

        Action::IfThen { condition, actions } => {
            let condition_code = generate_condition_java(condition);
            let mut code = format!("{}if ({}) {{\n", indent_str, condition_code);
            for nested_action in actions {
                code.push_str(&generate_action_java(nested_action, indent + 1, mod_data));
                code.push('\n');
            }
            code.push_str(&format!("{}}}", indent_str));
            code
        }

        Action::WorldLightning {} => {
            format!(
                "{}// Strike lightning at player\n\
                 {}EntityType.LIGHTNING_BOLT.spawn((ServerWorld) world, pos, net.minecraft.entity.SpawnReason.TRIGGERED);",
                indent_str,
                indent_str
            )
        }

        Action::WorldFill { size, block } => {
            format!(
                "{}// Fill {} block radius with {}\n\
                 {}for (int dx = -{}; dx <= {}; dx++) {{\n\
                 {}    for (int dy = -{}; dy <= {}; dy++) {{\n\
                 {}        for (int dz = -{}; dz <= {}; dz++) {{\n\
                 {}            var fillPos = pos.add(dx, dy, dz);\n\
                 {}            world.setBlockState(fillPos, Registries.BLOCK.get(Identifier.tryParse(\"{}\")).getDefaultState());\n\
                 {}        }}\n\
                 {}    }}\n\
                 {}}}",
                indent_str, size, block,
                indent_str, size, size,
                indent_str, size, size,
                indent_str, size, size,
                indent_str,
                indent_str, block,
                indent_str,
                indent_str,
                indent_str
            )
        }
        Action::SpawnBlockDisplayModel { model_id } => {
            // Find the model in mod_data
            let model = mod_data.block_display_models.iter().find(|m| m.id == *model_id);

            match model {
                Some(model) => {
                    let mut code = format!("{}// Spawn AI model: {}\n", indent_str, model.name);
                    code.push_str(&format!("{}source.sendMessage(Text.literal(\"Spawning {} blocks for model: {}\"));\n",
                        indent_str, model.blocks.len(), model.name));

                    const BLOCKS_PER_METHOD: usize = 80;

                    if model.blocks.len() > BLOCKS_PER_METHOD {
                        // Use helper methods for large models
                        let num_parts = (model.blocks.len() + BLOCKS_PER_METHOD - 1) / BLOCKS_PER_METHOD;

                        for part_idx in 0..num_parts {
                            code.push_str(&format!("{}spawnModel_{}_part{}(source, pos);\n",
                                indent_str,
                                sanitize_id(&model.id),
                                part_idx + 1));
                        }

                        code.push_str(&format!("{}source.sendMessage(Text.literal(\"Successfully spawned {} blocks\"));\n",
                            indent_str, model.blocks.len()));
                    } else {
                        // Small model - use inline spawning
                        code.push_str(&format!("{}try {{\n", indent_str));

                        for entity in &model.blocks {
                            let block_state = if let Some(props) = &entity.properties {
                                let props_str: Vec<String> = props.iter()
                                    .map(|(k, v)| format!("{}={}", k, v))
                                    .collect();
                                if props_str.is_empty() {
                                    entity.block.clone()
                                } else {
                                    format!("{}[{}]", entity.block, props_str.join(","))
                                }
                            } else {
                                entity.block.clone()
                            };

                            let (sx, sy, sz) = if let Some(scale) = entity.scale {
                                (scale[0] as f32, scale[1] as f32, scale[2] as f32)
                            } else {
                                (1.0f32, 1.0f32, 1.0f32)
                            };

                            let block_name = if block_state.contains('[') {
                                &block_state[..block_state.find('[').unwrap()]
                            } else {
                                &block_state
                            };

                            // Build NBT string
                            let nbt = format!("{{transformation:{{left_rotation:[0f,0f,0f,1f],right_rotation:[0f,0f,0f,1f],translation:[0f,0f,0f],scale:[{}f,{}f,{}f]}},block_state:{{Name:\\\"{}\\\"}}}}",
                                sx, sy, sz, block_name);

                            code.push_str(&format!("{}    source.getServer().getCommandManager().executeWithPrefix(\n", indent_str));
                            code.push_str(&format!("{}        source.getServer().getCommandSource(),\n", indent_str));
                            code.push_str(&format!("{}        String.format(\"summon minecraft:block_display %.2f %.2f %.2f %s\",\n", indent_str));
                            code.push_str(&format!("{}            pos.x + {}, pos.y + {}, pos.z + {}, \"{}\")\n",
                                indent_str, entity.x, entity.y, entity.z, nbt));
                            code.push_str(&format!("{}    );\n", indent_str));
                        }

                        code.push_str(&format!("{}    source.sendMessage(Text.literal(\"Successfully spawned {} blocks\"));\n",
                            indent_str, model.blocks.len()));
                        code.push_str(&format!("{}}} catch (Exception e) {{\n", indent_str));
                        code.push_str(&format!("{}    source.sendMessage(Text.literal(\"Error spawning model: \" + e.getMessage()));\n", indent_str));
                        code.push_str(&format!("{}}}\n", indent_str));
                    }

                    code
                }
                None => {
                    format!(
                        "{}// ERROR: AI model not found: {}\n\
                         {}source.sendMessage(Text.literal(\"Model not found: {}\").formatted(Formatting.RED));",
                        indent_str, model_id,
                        indent_str, model_id
                    )
                }
            }
        }
    }
}

/// Generate helper methods for large AI models
fn generate_model_helper_methods(mod_data: &ModData) -> String {
    let mut helper_code = String::new();
    const BLOCKS_PER_METHOD: usize = 80;

    for model in &mod_data.block_display_models {
        if model.blocks.len() > BLOCKS_PER_METHOD {
            // Generate helper methods for this large model
            let chunks: Vec<_> = model.blocks.chunks(BLOCKS_PER_METHOD).collect();

            for (chunk_idx, chunk) in chunks.iter().enumerate() {
                helper_code.push_str(&format!(
                    "\n    private static void spawnModel_{}_part{}(net.minecraft.server.command.ServerCommandSource source, Vec3d pos) {{\n",
                    sanitize_id(&model.id),
                    chunk_idx + 1
                ));

                for entity in *chunk {
                    let block_state = if let Some(props) = &entity.properties {
                        let props_str: Vec<String> = props.iter()
                            .map(|(k, v)| format!("{}={}", k, v))
                            .collect();
                        if props_str.is_empty() {
                            entity.block.clone()
                        } else {
                            format!("{}[{}]", entity.block, props_str.join(","))
                        }
                    } else {
                        entity.block.clone()
                    };

                    let block_name = if block_state.contains('[') {
                        &block_state[..block_state.find('[').unwrap()]
                    } else {
                        &block_state
                    };

                    let (sx, sy, sz) = if let Some(scale) = entity.scale {
                        (scale[0] as f32, scale[1] as f32, scale[2] as f32)
                    } else {
                        (1.0f32, 1.0f32, 1.0f32)
                    };

                    // Build NBT string
                    let nbt = format!("{{transformation:{{left_rotation:[0f,0f,0f,1f],right_rotation:[0f,0f,0f,1f],translation:[0f,0f,0f],scale:[{}f,{}f,{}f]}},block_state:{{Name:\\\"{}\\\"}}}}",
                        sx, sy, sz, block_name);

                    helper_code.push_str(&format!("        source.getServer().getCommandManager().executeWithPrefix(\n"));
                    helper_code.push_str(&format!("            source.getServer().getCommandSource(),\n"));
                    helper_code.push_str(&format!("            String.format(\"summon minecraft:block_display %.2f %.2f %.2f %s\",\n"));
                    helper_code.push_str(&format!("                pos.x + {}, pos.y + {}, pos.z + {}, \"{}\")\n",
                        entity.x, entity.y, entity.z, nbt));
                    helper_code.push_str("        );\n");
                }

                helper_code.push_str("    }\n");
            }
        }
    }

    helper_code
}

/// Sanitize model ID for use in Java method names
fn sanitize_id(id: &str) -> String {
    id.chars()
        .map(|c| if c.is_alphanumeric() { c } else { '_' })
        .collect()
}

/// Generate Java code for all commands (without helper methods)
fn generate_commands_java(commands: &[Command], mod_data: &ModData) -> String {
    let mut java_code = String::new();

    for command in commands {
        let cmd_name = &command.command;

        java_code.push_str(&format!(
            "\n        CommandRegistrationCallback.EVENT.register((dispatcher, registryAccess, environment) -> {{\n\
            dispatcher.register(CommandManager.literal(\"{}\").executes(context -> {{\n\
                var source = context.getSource();\n\
                ServerWorld world = source.getWorld();\n\
                Vec3d pos = source.getPosition();\n\
                \n",
            cmd_name
        ));

        // Generate code for each action
        for action in &command.actions {
            java_code.push_str(&generate_action_java(action, 4, mod_data));
            java_code.push_str("\n                \n");
        }

        java_code.push_str(
            "                return 1;\n\
            }));\n\
            });\n"
        );
    }

    java_code
}

/// Generate Java code for right-click events
fn generate_right_click_events_java(events: &[RightClickEvent], mod_data: &ModData) -> String{
    let mut java_code = String::new();

    for event in events {
        let item_id = &event.item;

        java_code.push_str(&format!(
            "\n        UseItemCallback.EVENT.register((player, world, hand) -> {{\n\
            ItemStack stack = player.getStackInHand(hand);\n\
            if (stack.getItem() == Registries.ITEM.get(Identifier.tryParse(\"{}\"))) {{\n\
                if (!world.isClient) {{\n\
                    ServerWorld serverWorld = (ServerWorld) world;\n\
                    Vec3d pos = player.getPos();\n\
                    \n",
            item_id
        ));

        // Generate code for each action
        for action in &event.actions {
            java_code.push_str(&generate_action_java(action, 5, mod_data));
            java_code.push_str("\n                    \n");
        }

        java_code.push_str(
            "                }\n\
                return TypedActionResult.success(stack);\n\
            }\n\
            return TypedActionResult.pass(stack);\n\
        });\n"
        );
    }

    java_code
}

/// Compile mod from generated data
#[tauri::command]
pub async fn compile_mod(mod_data: ModData, project_name: String) -> Result<String, String> {
    let item_count = mod_data.custom_items.len();
    let mob_count = mod_data.custom_mobs.len();
    let command_count = mod_data.commands.len();
    let right_click_count = mod_data.right_click_events.len();

    // Generate Java code for commands and right-click events
    let mut java_code = String::new();
    java_code.push_str(&generate_commands_java(&mod_data.commands, &mod_data));
    java_code.push_str(&generate_right_click_events_java(&mod_data.right_click_events, &mod_data));

    // Generate helper methods for large models (class-level methods)
    let helper_methods = generate_model_helper_methods(&mod_data);

    println!("\n=== Generated Java Code ===");
    println!("{}", java_code);
    println!("\n=== Generated Helper Methods ===");
    println!("{}", helper_methods);

    // Generate project ID from project name (lowercase, replace spaces with underscores, remove special chars)
    let project_id = project_name
        .to_lowercase()
        .replace(" ", "_")
        .chars()
        .filter(|c| c.is_alphanumeric() || *c == '_')
        .collect::<String>();

    // Prepare data for Python API
    let api_data = json!({
        "javaCode": java_code,
        "helperMethods": helper_methods,
        "projectId": project_id,
        "projectName": project_name,
        "customItems": mod_data.custom_items,
        "customMobs": mod_data.custom_mobs,
        "blockDisplayModels": mod_data.block_display_models,
        "aiSettings": {}
    });

    // Write API data to temp file (avoids "Argument list too long" error with large base64 images)
    let api_data_str = serde_json::to_string_pretty(&api_data).unwrap();
    println!("\n=== Calling Python API with data ===");
    println!("{}", api_data_str);

    // Write to temporary file to avoid command-line argument length limits
    let temp_file = "/tmp/blockcraft_api_request.json";
    fs::write(temp_file, &api_data_str)
        .map_err(|e| format!("Failed to write temp file: {}", e))?;

    // Call Python API to compile and deploy using @file syntax
    let output = ProcessCommand::new("curl")
        .arg("-X")
        .arg("POST")
        .arg("http://localhost:5000/deploy-java")
        .arg("-H")
        .arg("Content-Type: application/json")
        .arg("-d")
        .arg(format!("@{}", temp_file))
        .output()
        .map_err(|e| format!("Failed to execute curl: {}", e))?;

    // Clean up temp file
    let _ = fs::remove_file(temp_file);

    let response = String::from_utf8_lossy(&output.stdout);
    let error = String::from_utf8_lossy(&output.stderr);

    println!("\n=== Python API Response ===");
    println!("stdout: {}", response);
    if !error.is_empty() {
        println!("stderr: {}", error);
    }

    if !output.status.success() {
        return Err(format!("Python API call failed:\n{}\n{}", response, error));
    }

    // Build success message
    let mut message = format!(
        "✅ Mod Compiled Successfully!\n\n{} custom items\n{} custom mobs\n{} commands\n{} right-click events\n",
        item_count, mob_count, command_count, right_click_count
    );

    if command_count > 0 {
        message.push_str("\nCommands:\n");
        for cmd in &mod_data.commands {
            message.push_str(&format!("  /{} - {} actions\n", cmd.command, cmd.actions.len()));
        }
    }

    if right_click_count > 0 {
        message.push_str("\nRight-Click Events:\n");
        for event in &mod_data.right_click_events {
            let item_name = event.item.split(':').last().unwrap_or(&event.item);
            message.push_str(&format!("  {} - {} actions\n", item_name, event.actions.len()));
        }
    }

    if item_count > 0 {
        message.push_str("\nItems:\n");
        for item in &mod_data.custom_items {
            message.push_str(&format!("  {}\n", item.name));
        }
    }

    if mob_count > 0 {
        message.push_str("\nMobs:\n");
        for mob in &mod_data.custom_mobs {
            message.push_str(&format!("  {}\n", mob.name));
        }
    }

    message.push_str("\n🎮 Mod deployed to Minecraft server!");
    message.push_str("\n💡 Restart your server to load the new mod.");

    Ok(message)
}

/// Build mod without deploying (just compile and save to Downloads)
#[tauri::command]
pub async fn build_mod(mod_data: ModData, project_name: String) -> Result<String, String> {
    let item_count = mod_data.custom_items.len();
    let mob_count = mod_data.custom_mobs.len();
    let command_count = mod_data.commands.len();
    let right_click_count = mod_data.right_click_events.len();

    // Generate Java code for commands and right-click events
    let mut java_code = String::new();
    java_code.push_str(&generate_commands_java(&mod_data.commands, &mod_data));
    java_code.push_str(&generate_right_click_events_java(&mod_data.right_click_events, &mod_data));

    // Generate helper methods for large models (class-level methods)
    let helper_methods = generate_model_helper_methods(&mod_data);

    println!("\n=== Generated Java Code ===");
    println!("{}", java_code);
    println!("\n=== Generated Helper Methods ===");
    println!("{}", helper_methods);

    // Generate project ID from project name
    let project_id = project_name
        .to_lowercase()
        .replace(" ", "_")
        .chars()
        .filter(|c| c.is_alphanumeric() || *c == '_')
        .collect::<String>();

    // Prepare data for Python API with deploy: false
    let api_data = json!({
        "javaCode": java_code,
        "helperMethods": helper_methods,
        "projectId": project_id,
        "projectName": project_name,
        "customItems": mod_data.custom_items,
        "customMobs": mod_data.custom_mobs,
        "blockDisplayModels": mod_data.block_display_models,
        "aiSettings": {},
        "deploy": false  // Don't deploy, just build
    });

    // Convert to JSON string
    let json_str = serde_json::to_string_pretty(&api_data)
        .map_err(|e| format!("JSON serialization failed: {}", e))?;

    // Write to temp file for curl
    let temp_file = "/tmp/blockcraft_build_data.json";
    fs::write(temp_file, json_str)
        .map_err(|e| format!("Failed to write temp file: {}", e))?;

    // Call Python API
    let output = ProcessCommand::new("curl")
        .arg("-X")
        .arg("POST")
        .arg("http://localhost:5000/deploy-java")
        .arg("-H")
        .arg("Content-Type: application/json")
        .arg("-d")
        .arg(format!("@{}", temp_file))
        .output()
        .map_err(|e| format!("Failed to execute curl: {}", e))?;

    // Clean up temp file
    let _ = fs::remove_file(temp_file);

    let response = String::from_utf8_lossy(&output.stdout);
    let error = String::from_utf8_lossy(&output.stderr);

    println!("\n=== Python API Response ===");
    println!("stdout: {}", response);
    if !error.is_empty() {
        println!("stderr: {}", error);
    }

    if !output.status.success() {
        return Err(format!("Python API call failed:\n{}\n{}", response, error));
    }

    // Build success message
    let mut message = format!(
        "✅ Mod Built Successfully!\n\n{} custom items\n{} custom mobs\n{} commands\n{} right-click events\n",
        item_count, mob_count, command_count, right_click_count
    );

    if command_count > 0 {
        message.push_str("\nCommands:\n");
        for cmd in &mod_data.commands {
            message.push_str(&format!("  /{} - {} actions\n", cmd.command, cmd.actions.len()));
        }
    }

    if right_click_count > 0 {
        message.push_str("\nRight-Click Events:\n");
        for event in &mod_data.right_click_events {
            let item_name = event.item.split(':').last().unwrap_or(&event.item);
            message.push_str(&format!("  {} - {} actions\n", item_name, event.actions.len()));
        }
    }

    if item_count > 0 {
        message.push_str("\nItems:\n");
        for item in &mod_data.custom_items {
            message.push_str(&format!("  {}\n", item.name));
        }
    }

    if mob_count > 0 {
        message.push_str("\nMobs:\n");
        for mob in &mod_data.custom_mobs {
            message.push_str(&format!("  {}\n", mob.name));
        }
    }

    let home_dir = std::env::var("HOME").unwrap_or_else(|_| "/home/jordan".to_string());
    message.push_str(&format!("\n📦 Mod JAR saved to: {}/Downloads/blockcraft-{}.jar", home_dir, project_id));
    message.push_str("\n💡 You can share this file or manually deploy it to a server!");

    Ok(message)
}

/// List all deployed BlockCraft mods
#[tauri::command]
pub async fn list_deployed_mods() -> Result<Vec<String>, String> {
    let mods_dir = std::path::Path::new(&std::env::var("HOME").unwrap_or_default())
        .join("minecraft-fabric-1.21.1-cobblemon/mods");

    let mut deployed_mods = Vec::new();

    if let Ok(entries) = fs::read_dir(&mods_dir) {
        for entry in entries.flatten() {
            let file_name = entry.file_name().to_string_lossy().to_string();
            // Look for blockcraft-*.jar files (not .disabled)
            if file_name.starts_with("blockcraft-") && file_name.ends_with(".jar") {
                // Extract project ID from filename: blockcraft-{projectId}.jar
                if let Some(project_id) = file_name
                    .strip_prefix("blockcraft-")
                    .and_then(|s| s.strip_suffix(".jar"))
                {
                    deployed_mods.push(project_id.to_string());
                }
            }
        }
    }

    Ok(deployed_mods)
}

/// Undeploy a mod by project ID
#[tauri::command]
pub async fn undeploy_mod(project_id: String) -> Result<String, String> {
    let mods_dir = std::path::Path::new(&std::env::var("HOME").unwrap_or_default())
        .join("minecraft-fabric-1.21.1-cobblemon/mods");

    let jar_file = mods_dir.join(format!("blockcraft-{}.jar", project_id));

    if !jar_file.exists() {
        return Err(format!("Mod {} is not deployed", project_id));
    }

    // Remove the jar file from server
    fs::remove_file(&jar_file)
        .map_err(|e| format!("Failed to remove mod from server: {}", e))?;

    // Also remove from client mods folder
    let home_dir = std::env::var("HOME").unwrap_or_else(|_| "/home/jordan".to_string());
    let client_jar_path = format!("{}/.minecraft/mods/blockcraft-{}.jar", home_dir, project_id);
    let client_result = fs::remove_file(&client_jar_path);

    let client_msg = match client_result {
        Ok(_) => "✅ Removed from client",
        Err(_) => "⚠️ Client mod not found (may already be removed)",
    };

    // Restart the server
    let restart_result = ProcessCommand::new("sudo")
        .arg("systemctl")
        .arg("restart")
        .arg("cobblemon-server")
        .output();

    let restart_msg = match restart_result {
        Ok(_) => "🔄 Server restarted! Mod unloaded.",
        Err(_) => "⚠️ Could not auto-restart server. Please restart manually: sudo systemctl restart cobblemon-server",
    };

    Ok(format!("✅ Successfully undeployed mod: {}\n{}\n{}", project_id, client_msg, restart_msg))
}

/// Open a folder in the system file manager
#[tauri::command]
pub async fn open_folder(path: String) -> Result<String, String> {
    use std::process::Command;

    let result = Command::new("xdg-open")
        .arg(&path)
        .spawn();

    match result {
        Ok(_) => Ok(format!("Opened folder: {}", path)),
        Err(e) => Err(format!("Failed to open folder: {}", e))
    }
}

/// Restart the Minecraft client
#[tauri::command]
pub async fn restart_minecraft_client() -> Result<String, String> {
    use std::process::Command;

    // Kill any running Minecraft processes
    let _ = Command::new("pkill")
        .arg("-f")
        .arg("minecraft")
        .output();

    // Wait a moment for processes to die
    std::thread::sleep(std::time::Duration::from_millis(1000));

    // Start Minecraft launcher
    let result = Command::new("sh")
        .arg("-c")
        .arg("cd ~/.minecraft && nohup java -jar minecraft-launcher.jar > /dev/null 2>&1 &")
        .spawn();

    match result {
        Ok(_) => Ok("Minecraft client is restarting...".to_string()),
        Err(e) => Err(format!("Failed to restart Minecraft: {}", e))
    }
}
