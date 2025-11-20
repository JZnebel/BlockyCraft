// Bukkit/Spigot plugin code generator for BlocklyCraft
// Generates Java code using the Bukkit API instead of Fabric

function generateBukkitCode(workspace) {
    const topBlocks = workspace.getTopBlocks(true);
    const commands = [];
    const events = [];

    // Process each top-level event block
    for (const block of topBlocks) {
        if (block.type === 'event_command') {
            const commandName = block.getFieldValue('COMMAND').toLowerCase().replace(/[^a-z0-9_]/g, '');
            const actions = generateActionsBukkit(block.getInput('ACTIONS'), 'command');

            commands.push({
                name: commandName,
                code: actions
            });
        }
        else if (block.type === 'event_break_block') {
            const blockType = block.getFieldValue('BLOCK');
            const actions = generateActionsBukkit(block.getInput('ACTIONS'), 'break');

            events.push({
                type: 'break_block',
                blockType: blockType,
                code: actions
            });
        }
        else if (block.type === 'event_right_click') {
            const item = block.getFieldValue('ITEM');
            const actions = generateActionsBukkit(block.getInput('ACTIONS'), 'rightclick');

            events.push({
                type: 'right_click',
                item: item,
                code: actions
            });
        }
    }

    return { commands, events };
}

function generateActionsBukkit(input, context) {
    if (!input || !input.connection || !input.connection.targetBlock()) {
        return '';
    }

    const block = input.connection.targetBlock();
    return generateBlockBukkit(block, context);
}

function generateBlockBukkit(block, context) {
    if (!block) return '';

    const type = block.type;
    let code = '';
    const indent = context === 'command' ? '                    ' : '            ';
    const playerVar = context === 'command' ? 'sender' : 'player';
    const worldVar = context === 'command' ? 'sender.getWorld()' : 'player.getWorld()';

    // ========== ACTION BLOCKS ==========
    if (type === 'action_message') {
        const message = block.getFieldValue('MESSAGE');
        code = `${indent}${playerVar}.sendMessage("${message}");\n`;
    }
    else if (type === 'action_spawn_mob') {
        const mob = block.getFieldValue('MOB');
        const entityType = mob.replace('minecraft:', '').toUpperCase();
        code = `${indent}World world = ${playerVar}.getWorld();\n`;
        code += `${indent}Location loc = ${playerVar}.getLocation();\n`;
        code += `${indent}world.spawnEntity(loc, EntityType.${entityType});\n`;
    }
    else if (type === 'action_give_item') {
        const item = block.getFieldValue('ITEM');
        const amount = block.getFieldValue('AMOUNT');
        const materialName = item.replace('minecraft:', '').toUpperCase();
        code = `${indent}ItemStack itemStack = new ItemStack(Material.${materialName}, ${amount});\n`;
        code += `${indent}${playerVar}.getInventory().addItem(itemStack);\n`;
    }
    else if (type === 'action_play_sound') {
        const sound = block.getFieldValue('SOUND');
        const soundName = sound.replace('minecraft:', '').replace(/\./g, '_').toUpperCase();
        code = `${indent}${playerVar}.playSound(${playerVar}.getLocation(), Sound.${soundName}, 1.0f, 1.0f);\n`;
    }
    else if (type === 'action_title') {
        const title = block.getFieldValue('TITLE');
        code = `${indent}${playerVar}.sendTitle("${title}", "", 10, 70, 20);\n`;
    }
    else if (type === 'action_actionbar') {
        const text = block.getFieldValue('TEXT');
        code = `${indent}${playerVar}.spigot().sendMessage(ChatMessageType.ACTION_BAR, new TextComponent("${text}"));\n`;
    }
    else if (type === 'action_subtitle') {
        const subtitle = block.getFieldValue('SUBTITLE');
        code = `${indent}${playerVar}.sendTitle("", "${subtitle}", 10, 70, 20);\n`;
    }
    else if (type === 'action_explosion') {
        const power = block.getFieldValue('POWER');
        code = `${indent}World world = ${playerVar}.getWorld();\n`;
        code += `${indent}Location loc = ${playerVar}.getLocation();\n`;
        code += `${indent}world.createExplosion(loc, ${power}f, false, false);\n`;
    }
    else if (type === 'action_lightning') {
        code = `${indent}World world = ${playerVar}.getWorld();\n`;
        code += `${indent}Location loc = ${playerVar}.getLocation();\n`;
        code += `${indent}world.strikeLightning(loc);\n`;
    }
    else if (type === 'action_teleport') {
        const x = block.getFieldValue('X');
        const y = block.getFieldValue('Y');
        const z = block.getFieldValue('Z');
        code = `${indent}Location targetLoc = new Location(${playerVar}.getWorld(), ${x}, ${y}, ${z});\n`;
        code += `${indent}${playerVar}.teleport(targetLoc);\n`;
    }
    else if (type === 'action_set_time') {
        const time = block.getFieldValue('TIME');
        code = `${indent}${playerVar}.getWorld().setTime(${time});\n`;
    }
    else if (type === 'action_set_weather') {
        const weather = block.getFieldValue('WEATHER');
        if (weather === 'clear') {
            code = `${indent}${playerVar}.getWorld().setStorm(false);\n`;
            code += `${indent}${playerVar}.getWorld().setThundering(false);\n`;
        } else if (weather === 'rain') {
            code = `${indent}${playerVar}.getWorld().setStorm(true);\n`;
            code += `${indent}${playerVar}.getWorld().setThundering(false);\n`;
        } else if (weather === 'thunder') {
            code = `${indent}${playerVar}.getWorld().setStorm(true);\n`;
            code += `${indent}${playerVar}.getWorld().setThundering(true);\n`;
        }
    }
    else if (type === 'action_set_gamemode') {
        const gamemode = block.getFieldValue('GAMEMODE').toUpperCase();
        code = `${indent}${playerVar}.setGameMode(GameMode.${gamemode});\n`;
    }
    else if (type === 'action_give_effect') {
        const effect = block.getFieldValue('EFFECT');
        const duration = block.getFieldValue('DURATION');
        const amplifier = block.getFieldValue('AMPLIFIER');
        const effectType = effect.replace('minecraft:', '').toUpperCase();
        code = `${indent}PotionEffect potionEffect = new PotionEffect(PotionEffectType.${effectType}, ${duration} * 20, ${amplifier});\n`;
        code += `${indent}${playerVar}.addPotionEffect(potionEffect);\n`;
    }
    else if (type === 'action_clear_effects') {
        code = `${indent}${playerVar}.getActivePotionEffects().forEach(effect -> ${playerVar}.removePotionEffect(effect.getType()));\n`;
    }
    else if (type === 'action_set_health') {
        const health = block.getFieldValue('HEALTH');
        code = `${indent}${playerVar}.setHealth(Math.min(${health}, ${playerVar}.getMaxHealth()));\n`;
    }
    else if (type === 'action_set_hunger') {
        const hunger = block.getFieldValue('HUNGER');
        code = `${indent}${playerVar}.setFoodLevel(${hunger});\n`;
    }
    else if (type === 'action_set_xp') {
        const xp = block.getFieldValue('XP');
        code = `${indent}${playerVar}.setLevel(${xp});\n`;
    }
    else if (type === 'action_damage') {
        const damage = block.getFieldValue('DAMAGE');
        code = `${indent}${playerVar}.damage(${damage});\n`;
    }
    else if (type === 'action_heal') {
        const heal = block.getFieldValue('HEAL');
        code = `${indent}double newHealth = Math.min(${playerVar}.getHealth() + ${heal}, ${playerVar}.getMaxHealth());\n`;
        code += `${indent}${playerVar}.setHealth(newHealth);\n`;
    }
    else if (type === 'action_set_fire') {
        const duration = block.getFieldValue('DURATION');
        code = `${indent}${playerVar}.setFireTicks(${duration} * 20);\n`;
    }
    else if (type === 'action_extinguish') {
        code = `${indent}${playerVar}.setFireTicks(0);\n`;
    }
    else if (type === 'action_launch') {
        const power = block.getFieldValue('POWER');
        code = `${indent}Vector velocity = ${playerVar}.getLocation().getDirection().multiply(${power});\n`;
        code += `${indent}${playerVar}.setVelocity(velocity);\n`;
    }
    else if (type === 'action_cancel_event') {
        if (context !== 'command') {
            code = `${indent}event.setCancelled(true);\n`;
        }
    }
    else if (type === 'action_broadcast') {
        const message = block.getFieldValue('MESSAGE');
        code = `${indent}Bukkit.broadcastMessage("${message}");\n`;
    }
    else if (type === 'action_kick_player') {
        const reason = block.getFieldValue('REASON');
        code = `${indent}${playerVar}.kickPlayer("${reason}");\n`;
    }
    else if (type === 'action_kill_player') {
        code = `${indent}${playerVar}.setHealth(0);\n`;
    }

    // ========== CONTROL FLOW BLOCKS ==========
    else if (type === 'control_wait') {
        const seconds = block.getFieldValue('SECONDS');
        code = `${indent}Bukkit.getScheduler().runTaskLater(plugin, () -> {\n`;
        const nextBlock = block.getNextBlock();
        if (nextBlock) {
            code += generateBlockBukkit(nextBlock, context);
        }
        code += `${indent}}, ${seconds} * 20L);\n`;
        return code; // Don't process next block since it's inside the delayed task
    }
    else if (type === 'control_if') {
        const condition = block.getFieldValue('CONDITION');
        code = `${indent}if (${condition}) {\n`;
        const doActions = generateActionsBukkit(block.getInput('DO'), context);
        code += doActions;
        code += `${indent}}\n`;
    }
    else if (type === 'control_repeat') {
        const times = block.getFieldValue('TIMES');
        code = `${indent}for (int i = 0; i < ${times}; i++) {\n`;
        const doActions = generateActionsBukkit(block.getInput('DO'), context);
        code += doActions;
        code += `${indent}}\n`;
    }

    // ========== MINECRAFT BLOCKS ==========
    else if (type === 'minecraft_set_block') {
        const blockType = block.getFieldValue('BLOCK');
        const x = block.getFieldValue('X');
        const y = block.getFieldValue('Y');
        const z = block.getFieldValue('Z');
        const materialName = blockType.replace('minecraft:', '').toUpperCase();
        code = `${indent}Location blockLoc = new Location(${playerVar}.getWorld(), ${x}, ${y}, ${z});\n`;
        code += `${indent}blockLoc.getBlock().setType(Material.${materialName});\n`;
    }
    else if (type === 'minecraft_fill_blocks') {
        const blockType = block.getFieldValue('BLOCK');
        const x1 = block.getFieldValue('X1');
        const y1 = block.getFieldValue('Y1');
        const z1 = block.getFieldValue('Z1');
        const x2 = block.getFieldValue('X2');
        const y2 = block.getFieldValue('Y2');
        const z2 = block.getFieldValue('Z2');
        const materialName = blockType.replace('minecraft:', '').toUpperCase();
        code = `${indent}World world = ${playerVar}.getWorld();\n`;
        code += `${indent}for (int x = Math.min(${x1}, ${x2}); x <= Math.max(${x1}, ${x2}); x++) {\n`;
        code += `${indent}    for (int y = Math.min(${y1}, ${y2}); y <= Math.max(${y1}, ${y2}); y++) {\n`;
        code += `${indent}        for (int z = Math.min(${z1}, ${z2}); z <= Math.max(${z1}, ${z2}); z++) {\n`;
        code += `${indent}            world.getBlockAt(x, y, z).setType(Material.${materialName});\n`;
        code += `${indent}        }\n`;
        code += `${indent}    }\n`;
        code += `${indent}}\n`;
    }
    else if (type === 'minecraft_get_block') {
        const x = block.getFieldValue('X');
        const y = block.getFieldValue('Y');
        const z = block.getFieldValue('Z');
        code = `${indent}Material blockType = ${playerVar}.getWorld().getBlockAt(${x}, ${y}, ${z}).getType();\n`;
    }

    // Process next block in the sequence
    const nextBlock = block.getNextBlock();
    if (nextBlock) {
        code += generateBlockBukkit(nextBlock, context);
    }

    return code;
}

// Export the main function
// ES module export for Vite/TypeScript
export { generateBukkitCode };
