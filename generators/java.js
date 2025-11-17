// Generate Java/Fabric mod code from blocks

function generateJavaCode(workspace) {
    const topBlocks = workspace.getTopBlocks(true);
    const commands = [];
    const events = [];

    // Process each event block
    for (const block of topBlocks) {
        if (block.type === 'event_command') {
            const commandName = block.getFieldValue('COMMAND').toLowerCase().replace(/[^a-z0-9_]/g, '');
            const actions = generateActionsJava(block.getInput('ACTIONS'), 'command');

            commands.push({
                name: commandName,
                code: actions
            });
        }
        else if (block.type === 'event_break_block') {
            const blockType = block.getFieldValue('BLOCK');
            const actions = generateActionsJava(block.getInput('ACTIONS'), 'break');

            events.push({
                type: 'break_block',
                blockType: blockType,
                code: actions
            });
        }
        else if (block.type === 'event_right_click') {
            const item = block.getFieldValue('ITEM');
            const actions = generateActionsJava(block.getInput('ACTIONS'), 'rightclick');

            events.push({
                type: 'right_click',
                item: item,
                code: actions
            });
        }
    }

    return { commands, events };
}

function generateActionsJava(input, context) {
    if (!input || !input.connection || !input.connection.targetBlock()) {
        return '';
    }

    const block = input.connection.targetBlock();
    return generateBlockJava(block, context);
}

function generateBlockJava(block, context) {
    if (!block) return '';

    const type = block.type;
    let code = '';
    const indent = context === 'command' ? '                    ' : '            ';

    if (type === 'action_message') {
        const message = block.getFieldValue('MESSAGE');
        if (context === 'command') {
            code = `${indent}source.sendFeedback(() -> Text.literal("${message}"), false);\n`;
        } else {
            code = `${indent}player.sendMessage(Text.literal("${message}"), false);\n`;
        }
    }
    else if (type === 'action_spawn_mob') {
        const mob = block.getFieldValue('MOB');
        const entityType = mob.replace('minecraft:', '').toUpperCase();
        if (context === 'command') {
            code = `${indent}ServerWorld world = source.getWorld();\n`;
            code += `${indent}BlockPos pos = BlockPos.ofFloored(source.getPosition());\n`;
        } else {
            code = `${indent}ServerWorld world = player.getServerWorld();\n`;
            code += `${indent}BlockPos pos = player.getBlockPos();\n`;
        }
        code += `${indent}EntityType.${entityType}.spawn(world, pos, SpawnReason.COMMAND);\n`;
    }
    else if (type === 'action_give_item') {
        const item = block.getFieldValue('ITEM');
        const amount = block.getFieldValue('AMOUNT');
        const itemName = item.replace('minecraft:', '').toUpperCase();
        if (context === 'command') {
            code = `${indent}source.getPlayer().giveItemStack(new ItemStack(Items.${itemName}, ${amount}));\n`;
        } else {
            code = `${indent}player.giveItemStack(new ItemStack(Items.${itemName}, ${amount}));\n`;
        }
    }
    else if (type === 'action_play_sound') {
        const sound = block.getFieldValue('SOUND');
        const soundName = sound.replace('minecraft:', '').replace('.', '_').toUpperCase();
        if (context === 'command') {
            code = `${indent}ServerWorld world = source.getWorld();\n`;
            code += `${indent}BlockPos pos = BlockPos.ofFloored(source.getPosition());\n`;
        } else {
            code = `${indent}ServerWorld world = player.getServerWorld();\n`;
            code += `${indent}BlockPos pos = player.getBlockPos();\n`;
        }
        code += `${indent}world.playSound(null, pos, SoundEvents.${soundName}, SoundCategory.PLAYERS, 1.0f, 1.0f);\n`;
    }
    else if (type === 'logic_if') {
        const condition = block.getFieldValue('CONDITION');
        const thenInput = block.getInput('THEN');

        // Determine the player variable based on context
        const playerVar = context === 'command' ? 'source.getPlayer()' : 'player';

        let conditionCode = '';
        if (condition.includes('sneaking')) {
            conditionCode = `${playerVar}.isSneaking()`;
        } else if (condition.includes('water')) {
            conditionCode = `${playerVar}.isSubmergedInWater()`;
        } else if (condition.includes('fire')) {
            conditionCode = `${playerVar}.isOnFire()`;
        }

        code = `${indent}if (${conditionCode}) {\n`;

        // Generate code for the THEN block
        if (thenInput && thenInput.connection && thenInput.connection.targetBlock()) {
            const thenBlock = thenInput.connection.targetBlock();
            code += generateBlockJava(thenBlock, context);
        }

        code += `${indent}}\n`;
    }
    else if (type === 'logic_wait') {
        const seconds = block.getFieldValue('SECONDS');
        const ticks = seconds * 20; // Convert seconds to ticks (20 ticks = 1 second)

        // Get the next block to execute after the delay
        const nextBlock = block.getNextBlock();
        if (nextBlock) {
            const delayedCode = generateBlockJava(nextBlock, context);

            if (context === 'command') {
                code = `${indent}source.getWorld().getServer().execute(() -> {\n`;
                code += `${indent}    try { Thread.sleep(${seconds * 1000}); } catch (Exception e) {}\n`;
                code += delayedCode;
                code += `${indent}});\n`;
            } else {
                code = `${indent}new Thread(() -> {\n`;
                code += `${indent}    try { Thread.sleep(${seconds * 1000}); } catch (Exception e) {}\n`;
                code += `${indent}    player.getServer().execute(() -> {\n`;
                code += delayedCode;
                code += `${indent}    });\n`;
                code += `${indent}}).start();\n`;
            }

            // Return early to prevent processing nextBlock again
            return code;
        }
    }
    else if (type === 'data_random') {
        const chance = block.getFieldValue('CHANCE');
        const actionsInput = block.getInput('ACTIONS');

        code = `${indent}if (Math.random() * 100 < ${chance}) {\n`;

        // Generate code for the actions block
        if (actionsInput && actionsInput.connection && actionsInput.connection.targetBlock()) {
            const actionsBlock = actionsInput.connection.targetBlock();
            code += generateBlockJava(actionsBlock, context);
        }

        code += `${indent}}\n`;
    }
    else if (type === 'loop_repeat') {
        const times = block.getFieldValue('TIMES');
        const doInput = block.getInput('DO');

        code = `${indent}for (int i = 0; i < ${times}; i++) {\n`;

        // Generate code for the DO block
        if (doInput && doInput.connection && doInput.connection.targetBlock()) {
            const doBlock = doInput.connection.targetBlock();
            code += generateBlockJava(doBlock, context);
        }

        code += `${indent}}\n`;
    }
    else if (type === 'logic_if_else') {
        const condition = block.getFieldValue('CONDITION');
        const thenInput = block.getInput('THEN');
        const elseInput = block.getInput('ELSE');

        const playerVar = context === 'command' ? 'source.getPlayer()' : 'player';

        let conditionCode = '';
        if (condition.includes('sneaking')) {
            conditionCode = `${playerVar}.isSneaking()`;
        } else if (condition.includes('water')) {
            conditionCode = `${playerVar}.isSubmergedInWater()`;
        } else if (condition.includes('fire')) {
            conditionCode = `${playerVar}.isOnFire()`;
        }

        code = `${indent}if (${conditionCode}) {\n`;

        if (thenInput && thenInput.connection && thenInput.connection.targetBlock()) {
            code += generateBlockJava(thenInput.connection.targetBlock(), context);
        }

        code += `${indent}} else {\n`;

        if (elseInput && elseInput.connection && elseInput.connection.targetBlock()) {
            code += generateBlockJava(elseInput.connection.targetBlock(), context);
        }

        code += `${indent}}\n`;
    }
    else if (type === 'action_title') {
        const title = block.getFieldValue('TITLE');
        const playerVar = context === 'command' ? 'source.getPlayer()' : 'player';
        code = `${indent}${playerVar}.networkHandler.sendPacket(new TitleS2CPacket(Text.literal("${title}")));\n`;
    }
    else if (type === 'action_actionbar') {
        const text = block.getFieldValue('TEXT');
        const playerVar = context === 'command' ? 'source.getPlayer()' : 'player';
        code = `${indent}${playerVar}.sendMessage(Text.literal("${text}"), true);\n`;
    }
    else if (type === 'player_teleport') {
        const x = block.getFieldValue('X');
        const y = block.getFieldValue('Y');
        const z = block.getFieldValue('Z');
        const playerVar = context === 'command' ? 'source.getPlayer()' : 'player';
        code = `${indent}${playerVar}.teleport(${x}, ${y}, ${z});\n`;
    }
    else if (type === 'player_effect') {
        const effect = block.getFieldValue('EFFECT');
        const duration = block.getFieldValue('DURATION');
        const playerVar = context === 'command' ? 'source.getPlayer()' : 'player';
        code = `${indent}${playerVar}.addStatusEffect(new StatusEffectInstance(StatusEffects.${effect}, ${duration} * 20, 0));\n`;
    }
    else if (type === 'player_gamemode') {
        const gamemode = block.getFieldValue('GAMEMODE');
        const playerVar = context === 'command' ? 'source.getPlayer()' : 'player';
        code = `${indent}${playerVar}.changeGameMode(GameMode.${gamemode});\n`;
    }
    else if (type === 'player_health') {
        const health = block.getFieldValue('HEALTH');
        const playerVar = context === 'command' ? 'source.getPlayer()' : 'player';
        code = `${indent}${playerVar}.setHealth(${health});\n`;
    }
    else if (type === 'world_place_block') {
        const blockName = block.getFieldValue('BLOCK');
        const blockId = blockName.replace('minecraft:', '').toUpperCase();
        if (context === 'command') {
            code = `${indent}ServerWorld world = source.getWorld();\n`;
            code += `${indent}BlockPos pos = BlockPos.ofFloored(source.getPosition());\n`;
        } else {
            code = `${indent}ServerWorld world = player.getServerWorld();\n`;
            code += `${indent}BlockPos pos = player.getBlockPos();\n`;
        }
        code += `${indent}world.setBlockState(pos, Blocks.${blockId}.getDefaultState());\n`;
    }
    else if (type === 'world_time') {
        const time = block.getFieldValue('TIME');
        if (context === 'command') {
            code = `${indent}source.getWorld().setTimeOfDay(${time});\n`;
        } else {
            code = `${indent}player.getServerWorld().setTimeOfDay(${time});\n`;
        }
    }
    else if (type === 'world_weather') {
        const weather = block.getFieldValue('WEATHER');
        const serverVar = context === 'command' ? 'source.getServer()' : 'player.getServer()';
        if (weather === 'clear') {
            code = `${indent}${serverVar}.getOverworld().setWeather(0, 0, false, false);\n`;
        } else if (weather === 'rain') {
            code = `${indent}${serverVar}.getOverworld().setWeather(0, 6000, true, false);\n`;
        } else if (weather === 'thunder') {
            code = `${indent}${serverVar}.getOverworld().setWeather(0, 6000, true, true);\n`;
        }
    }
    else if (type === 'world_explosion') {
        const power = block.getFieldValue('POWER');
        if (context === 'command') {
            code = `${indent}ServerWorld world = source.getWorld();\n`;
            code += `${indent}Vec3d pos = source.getPosition();\n`;
        } else {
            code = `${indent}ServerWorld world = player.getServerWorld();\n`;
            code += `${indent}Vec3d pos = player.getPos();\n`;
        }
        code += `${indent}world.createExplosion(null, pos.x, pos.y, pos.z, ${power}f, World.ExplosionSourceType.NONE);\n`;
    }
    else if (type === 'world_spawn_entity') {
        const entityType = block.getFieldValue('ENTITY');
        const playerVar = context === 'command' ? 'source.getPlayer()' : 'player';
        const worldVar = context === 'command' ? 'source.getWorld()' : 'player.getServerWorld()';
        const entityClass = entityType.charAt(0).toUpperCase() + entityType.slice(1) + 'Entity';

        code = `${indent}${entityClass} entity = new ${entityClass}(EntityType.${entityType.toUpperCase()}, ${worldVar});\n`;
        code += `${indent}entity.refreshPositionAndAngles(${playerVar}.getX(), ${playerVar}.getY(), ${playerVar}.getZ(), 0, 0);\n`;
        code += `${indent}${worldVar}.spawnEntity(entity);\n`;
    }
    else if (type === 'world_entity_follow') {
        const entityType = block.getFieldValue('ENTITY');
        const range = block.getFieldValue('RANGE');
        const playerVar = context === 'command' ? 'source.getPlayer()' : 'player';
        const worldVar = context === 'command' ? 'source.getWorld()' : 'player.getServerWorld()';

        code += `${indent}List<Entity> nearbyEntities = ${worldVar}.getOtherEntities(${playerVar}, ${playerVar}.getBoundingBox().expand(${range}));\n`;
        code += `${indent}for (Entity entity : nearbyEntities) {\n`;

        if (entityType === 'all_animals') {
            code += `${indent}    if (entity instanceof AnimalEntity animal) {\n`;
        } else if (entityType === 'all_mobs') {
            code += `${indent}    if (entity instanceof MobEntity mob) {\n`;
        } else {
            const entityClass = entityType.charAt(0).toUpperCase() + entityType.slice(1) + 'Entity';
            code += `${indent}    if (entity instanceof ${entityClass}) {\n`;
            code += `${indent}        MobEntity mob = (MobEntity) entity;\n`;
        }

        code += `${indent}        mob.getNavigation().startMovingTo(${playerVar}, 1.0);\n`;
        code += `${indent}    }\n`;
        code += `${indent}}\n`;
    }
    else if (type === 'world_entity_attack') {
        const entityType = block.getFieldValue('ENTITY');
        const range = block.getFieldValue('RANGE');
        const playerVar = context === 'command' ? 'source.getPlayer()' : 'player';
        const worldVar = context === 'command' ? 'source.getWorld()' : 'player.getServerWorld()';

        code += `${indent}List<Entity> nearbyEntities = ${worldVar}.getOtherEntities(${playerVar}, ${playerVar}.getBoundingBox().expand(${range}));\n`;
        code += `${indent}for (Entity entity : nearbyEntities) {\n`;

        if (entityType === 'all_mobs') {
            code += `${indent}    if (entity instanceof MobEntity mob) {\n`;
        } else {
            const entityClass = entityType.charAt(0).toUpperCase() + entityType.slice(1) + 'Entity';
            code += `${indent}    if (entity instanceof ${entityClass}) {\n`;
            code += `${indent}        MobEntity mob = (MobEntity) entity;\n`;
        }

        code += `${indent}        mob.setTarget(${playerVar});\n`;
        code += `${indent}    }\n`;
        code += `${indent}}\n`;
    }
    else if (type === 'world_entity_tame') {
        const entityType = block.getFieldValue('ENTITY');
        const range = block.getFieldValue('RANGE');
        const playerVar = context === 'command' ? 'source.getPlayer()' : 'player';
        const worldVar = context === 'command' ? 'source.getWorld()' : 'player.getServerWorld()';

        const entityClass = entityType.charAt(0).toUpperCase() + entityType.slice(1) + 'Entity';

        code += `${indent}List<Entity> nearbyEntities = ${worldVar}.getOtherEntities(${playerVar}, ${playerVar}.getBoundingBox().expand(${range}));\n`;
        code += `${indent}for (Entity entity : nearbyEntities) {\n`;
        code += `${indent}    if (entity instanceof ${entityClass} tameable) {\n`;
        code += `${indent}        if (tameable instanceof TameableEntity) {\n`;
        code += `${indent}            ((TameableEntity) tameable).setOwner(${playerVar});\n`;
        code += `${indent}        }\n`;
        code += `${indent}    }\n`;
        code += `${indent}}\n`;
    }
    else if (type === 'custom_item_give') {
        const itemName = block.getFieldValue('ITEM_NAME');
        const amount = block.getFieldValue('AMOUNT');
        const itemId = itemName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const playerVar = context === 'command' ? 'source.getPlayer()' : 'player';
        code = `${indent}${playerVar}.getInventory().insertStack(new ItemStack(ITEM_${itemId.toUpperCase()}, ${amount}));\n`;
    }
    else if (type === 'custom_mob_spawn') {
        const mobName = block.getFieldValue('MOB_NAME');
        const mobId = mobName.toLowerCase().replace(/[^a-z0-9]/g, '_');

        const playerVar = context === 'command' ? 'source.getPlayer()' : 'player';
        const worldVar = context === 'command' ? 'source.getWorld()' : 'world';

        code = `${indent}{\n`;
        code += `${indent}    var mob = ${mobId.toUpperCase()}_ENTITY.create(${worldVar});\n`;
        code += `${indent}    if (mob != null) {\n`;
        code += `${indent}        var pos = ${playerVar}.getPos();\n`;
        code += `${indent}        mob.refreshPositionAndAngles(pos.x, pos.y, pos.z, 0.0F, 0.0F);\n`;
        code += `${indent}        ${worldVar}.spawnEntity(mob);\n`;
        code += `${indent}    }\n`;
        code += `${indent}}\n`;
    }

    // Process next block in stack
    const nextBlock = block.getNextBlock();
    if (nextBlock) {
        code += generateBlockJava(nextBlock, context);
    }

    return code;
}
