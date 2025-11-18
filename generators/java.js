// Complete Java/Fabric mod code generator for ALL blocks
// Generated to support all 80+ BlocklyCraft block types

function generateJavaCode(workspace) {
    const topBlocks = workspace.getTopBlocks(true);
    const commands = [];
    const events = [];

    // Process each top-level event block
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
    const playerVar = context === 'command' ? 'source.getPlayer()' : 'player';
    const worldVar = context === 'command' ? 'source.getWorld()' : 'player.getServerWorld()';

    // ========== ACTION BLOCKS ==========
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
            code += `${indent}ServerWorld world = player.getServerWorld();\n`;
            code += `${indent}BlockPos pos = player.getBlockPos();\n`;
        }
        code += `${indent}EntityType.${entityType}.spawn(world, pos, SpawnReason.COMMAND);\n`;
    }
    else if (type === 'action_give_item') {
        const item = block.getFieldValue('ITEM');
        const amount = block.getFieldValue('AMOUNT');
        const itemName = item.replace('minecraft:', '').toUpperCase();
        code = `${indent}${playerVar}.giveItemStack(new ItemStack(Items.${itemName}, ${amount}));\n`;
    }
    else if (type === 'action_play_sound') {
        const sound = block.getFieldValue('SOUND');
        const soundName = sound.replace('minecraft:', '').replace(/\./g, '_').toUpperCase();
        code = `${indent}${worldVar}.playSound(null, ${playerVar}.getBlockPos(), SoundEvents.${soundName}, SoundCategory.PLAYERS, 1.0f, 1.0f);\n`;
    }
    else if (type === 'action_title') {
        const title = block.getFieldValue('TITLE');
        code = `${indent}${playerVar}.networkHandler.sendPacket(new TitleS2CPacket(Text.literal("${title}")));\n`;
    }
    else if (type === 'action_actionbar') {
        const text = block.getFieldValue('TEXT');
        code = `${indent}${playerVar}.sendMessage(Text.literal("${text}"), true);\n`;
    }

    // ========== PLAYER BLOCKS ==========
    else if (type === 'player_health') {
        const health = block.getFieldValue('HEALTH');
        code = `${indent}${playerVar}.setHealth(${health}f);\n`;
    }
    else if (type === 'player_effect') {
        const effect = block.getFieldValue('EFFECT');
        const duration = block.getFieldValue('DURATION');
        const effectName = effect.toUpperCase();
        code = `${indent}${playerVar}.addStatusEffect(new StatusEffectInstance(StatusEffects.${effectName}, ${duration} * 20, 0));\n`;
    }

    // ========== WORLD BLOCKS ==========
    else if (type === 'world_place_block') {
        const blockName = block.getFieldValue('BLOCK');
        const blockId = blockName.replace('minecraft:', '').toUpperCase();
        code = `${indent}${worldVar}.setBlockState(${playerVar}.getBlockPos(), Blocks.${blockId}.getDefaultState());\n`;
    }
    else if (type === 'world_time') {
        const time = block.getFieldValue('TIME');
        code = `${indent}${worldVar}.setTimeOfDay(${time});\n`;
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
        code = `${indent}${worldVar}.createExplosion(null, ${playerVar}.getX(), ${playerVar}.getY(), ${playerVar}.getZ(), ${power}f, World.ExplosionSourceType.NONE);\n`;
    }
    else if (type === 'world_lightning') {
        code = `${indent}LightningEntity lightning = EntityType.LIGHTNING_BOLT.create(${worldVar});\n`;
        code += `${indent}lightning.refreshPositionAfterTeleport(${playerVar}.getX(), ${playerVar}.getY(), ${playerVar}.getZ());\n`;
        code += `${indent}${worldVar}.spawnEntity(lightning);\n`;
    }
    else if (type === 'world_fill') {
        const size = block.getFieldValue('SIZE');
        const fillBlock = block.getFieldValue('BLOCK');
        const blockId = fillBlock.replace('minecraft:', '').toUpperCase();
        code = `${indent}BlockPos playerPos = ${playerVar}.getBlockPos();\n`;
        code += `${indent}for (int x = -${size}; x <= ${size}; x++) {\n`;
        code += `${indent}    for (int y = -${size}; y <= ${size}; y++) {\n`;
        code += `${indent}        for (int z = -${size}; z <= ${size}; z++) {\n`;
        code += `${indent}            ${worldVar}.setBlockState(playerPos.add(x, y, z), Blocks.${blockId}.getDefaultState());\n`;
        code += `${indent}        }\n`;
        code += `${indent}    }\n`;
        code += `${indent}}\n`;
    }
    else if (type === 'world_spawn_entity') {
        const entityType = block.getFieldValue('ENTITY');
        const entityName = entityType.replace('minecraft:', '').toUpperCase();
        code = `${indent}EntityType.${entityName}.spawn(${worldVar}, ${playerVar}.getBlockPos(), SpawnReason.COMMAND);\n`;
    }
    else if (type === 'world_entity_follow') {
        const entityType = block.getFieldValue('ENTITY');
        const range = block.getFieldValue('RANGE');
        const duration = block.getFieldValue('DURATION');
        code = `${indent}List<Entity> nearbyEntities = ${worldVar}.getOtherEntities(${playerVar}, ${playerVar}.getBoundingBox().expand(${range}));\n`;
        code += `${indent}for (Entity entity : nearbyEntities) {\n`;
        code += `${indent}    if (entity instanceof MobEntity mob) {\n`;
        code += `${indent}        mob.getNavigation().startMovingTo(${playerVar}, 1.0);\n`;
        code += `${indent}    }\n`;
        code += `${indent}}\n`;
    }
    else if (type === 'world_entity_attack') {
        const entityType = block.getFieldValue('ENTITY');
        const range = block.getFieldValue('RANGE');
        code = `${indent}List<Entity> nearbyEntities = ${worldVar}.getOtherEntities(${playerVar}, ${playerVar}.getBoundingBox().expand(${range}));\n`;
        code += `${indent}for (Entity entity : nearbyEntities) {\n`;
        code += `${indent}    if (entity instanceof MobEntity mob) {\n`;
        code += `${indent}        mob.setTarget(${playerVar});\n`;
        code += `${indent}    }\n`;
        code += `${indent}}\n`;
    }
    else if (type === 'world_entity_tame') {
        const entityType = block.getFieldValue('ENTITY');
        const range = block.getFieldValue('RANGE');
        code = `${indent}List<Entity> nearbyEntities = ${worldVar}.getOtherEntities(${playerVar}, ${playerVar}.getBoundingBox().expand(${range}));\n`;
        code += `${indent}for (Entity entity : nearbyEntities) {\n`;
        code += `${indent}    if (entity instanceof TameableEntity tameable) {\n`;
        code += `${indent}        tameable.setOwner(${playerVar});\n`;
        code += `${indent}    }\n`;
        code += `${indent}}\n`;
    }

    // ========== MOTION BLOCKS ==========
    else if (type === 'motion_move_forward') {
        const distance = block.getFieldValue('DISTANCE');
        code = `${indent}Vec3d direction = ${playerVar}.getRotationVector();\n`;
        code += `${indent}${playerVar}.teleport(${playerVar}.getX() + direction.x * ${distance}, ${playerVar}.getY(), ${playerVar}.getZ() + direction.z * ${distance});\n`;
    }
    else if (type === 'motion_teleport') {
        const x = block.getFieldValue('X');
        const y = block.getFieldValue('Y');
        const z = block.getFieldValue('Z');
        code = `${indent}${playerVar}.teleport(${x}, ${y}, ${z});\n`;
    }
    else if (type === 'motion_teleport_forward') {
        const distance = block.getFieldValue('DISTANCE');
        code = `${indent}Vec3d direction = ${playerVar}.getRotationVector();\n`;
        code += `${indent}${playerVar}.teleport(${playerVar}.getX() + direction.x * ${distance}, ${playerVar}.getY(), ${playerVar}.getZ() + direction.z * ${distance});\n`;
    }
    else if (type === 'motion_teleport_vertical') {
        const distance = block.getFieldValue('DISTANCE');
        const direction = block.getFieldValue('DIRECTION');
        const multiplier = direction === 'UP' ? 1 : -1;
        code = `${indent}${playerVar}.teleport(${playerVar}.getX(), ${playerVar}.getY() + ${distance * multiplier}, ${playerVar}.getZ());\n`;
    }
    else if (type === 'motion_teleport_spawn') {
        code = `${indent}BlockPos spawnPos = ${worldVar}.getSpawnPos();\n`;
        code += `${indent}${playerVar}.teleport(spawnPos.getX(), spawnPos.getY(), spawnPos.getZ());\n`;
    }
    else if (type === 'motion_rotate') {
        const direction = block.getFieldValue('DIRECTION');
        code = `${indent}${playerVar}.setYaw(${direction}f);\n`;
    }
    else if (type === 'motion_launch') {
        const power = block.getFieldValue('POWER');
        const launchDir = block.getFieldValue('DIRECTION');
        if (launchDir === 'up') {
            code = `${indent}${playerVar}.setVelocity(0, ${power}, 0);\n`;
        } else if (launchDir === 'forward') {
            code = `${indent}Vec3d direction = ${playerVar}.getRotationVector();\n`;
            code += `${indent}${playerVar}.setVelocity(direction.multiply(${power}));\n`;
        } else if (launchDir === 'backward') {
            code = `${indent}Vec3d direction = ${playerVar}.getRotationVector();\n`;
            code += `${indent}${playerVar}.setVelocity(direction.multiply(-${power}));\n`;
        }
        code += `${indent}${playerVar}.velocityModified = true;\n`;
    }

    // ========== LOOKS BLOCKS ==========
    else if (type === 'looks_message') {
        const message = block.getFieldValue('MESSAGE');
        code = `${indent}${playerVar}.sendMessage(Text.literal("${message}"), false);\n`;
    }
    else if (type === 'looks_title') {
        const title = block.getFieldValue('TITLE');
        code = `${indent}${playerVar}.networkHandler.sendPacket(new TitleS2CPacket(Text.literal("${title}")));\n`;
    }
    else if (type === 'looks_subtitle') {
        const subtitle = block.getFieldValue('SUBTITLE');
        code = `${indent}${playerVar}.networkHandler.sendPacket(new SubtitleS2CPacket(Text.literal("${subtitle}")));\n`;
    }
    else if (type === 'looks_actionbar') {
        const text = block.getFieldValue('TEXT');
        code = `${indent}${playerVar}.sendMessage(Text.literal("${text}"), true);\n`;
    }
    else if (type === 'looks_particles') {
        const particle = block.getFieldValue('PARTICLE');
        const count = block.getFieldValue('COUNT');
        const particleName = particle.toUpperCase();
        code = `${indent}${worldVar}.spawnParticles(ParticleTypes.${particleName}, ${playerVar}.getX(), ${playerVar}.getY() + 1, ${playerVar}.getZ(), ${count}, 0.5, 0.5, 0.5, 0.1);\n`;
    }
    else if (type === 'looks_clear_effects') {
        code = `${indent}${playerVar}.clearStatusEffects();\n`;
    }

    // ========== SOUND BLOCKS ==========
    else if (type === 'sound_play') {
        const sound = block.getFieldValue('SOUND');
        const volume = block.getFieldValue('VOLUME') || 1.0;
        const pitch = block.getFieldValue('PITCH') || 1.0;
        const soundName = sound.replace('minecraft:', '').replace(/\./g, '_').toUpperCase();
        code = `${indent}${worldVar}.playSound(null, ${playerVar}.getBlockPos(), SoundEvents.${soundName}, SoundCategory.PLAYERS, ${volume}f, ${pitch}f);\n`;
    }
    else if (type === 'sound_music_disc') {
        const disc = block.getFieldValue('DISC');
        const soundName = disc.replace('minecraft:', '').replace(/\./g, '_').toUpperCase();
        code = `${indent}${worldVar}.playSound(null, ${playerVar}.getBlockPos(), SoundEvents.${soundName}, SoundCategory.RECORDS, 1.0f, 1.0f);\n`;
    }

    // ========== LOGIC & CONTROL BLOCKS ==========
    else if (type === 'controls_if') {
        const mutation = block.mutationToDom();
        const hasElse = mutation && mutation.getAttribute('else') === '1';

        const conditionInput = block.getInputTargetBlock('IF0');
        if (conditionInput) {
            const conditionCode = generateConditionCode(conditionInput, playerVar);
            code = `${indent}if (${conditionCode}) {\n`;

            const thenInput = block.getInput('DO0');
            if (thenInput && thenInput.connection && thenInput.connection.targetBlock()) {
                code += generateBlockJava(thenInput.connection.targetBlock(), context);
            }

            if (hasElse) {
                code += `${indent}} else {\n`;
                const elseInput = block.getInput('ELSE');
                if (elseInput && elseInput.connection && elseInput.connection.targetBlock()) {
                    code += generateBlockJava(elseInput.connection.targetBlock(), context);
                }
            }

            code += `${indent}}\n`;
        }
    }
    else if (type === 'repeat_times') {
        const times = block.getFieldValue('TIMES');
        const doInput = block.getInput('DO');

        code = `${indent}for (int i = 0; i < ${times}; i++) {\n`;
        if (doInput && doInput.connection && doInput.connection.targetBlock()) {
            code += generateBlockJava(doInput.connection.targetBlock(), context);
        }
        code += `${indent}}\n`;
    }
    else if (type === 'repeat_forever') {
        // For game mods, "forever" should be a reasonable limit
        const doInput = block.getInput('DO');
        code = `${indent}for (int i = 0; i < 1000; i++) {\n`;
        if (doInput && doInput.connection && doInput.connection.targetBlock()) {
            code += generateBlockJava(doInput.connection.targetBlock(), context);
        }
        code += `${indent}}\n`;
    }

    // ========== CUSTOM ITEM BLOCKS ==========
    else if (type === 'custom_item_give') {
        const itemName = block.getFieldValue('ITEM_NAME');
        const amount = block.getFieldValue('AMOUNT') || 1;
        const itemId = itemName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        code = `${indent}${playerVar}.getInventory().insertStack(new ItemStack(ITEM_${itemId.toUpperCase()}, ${amount}));\n`;
    }

    // ========== CUSTOM MOB BLOCKS ==========
    else if (type === 'custom_mob_spawn') {
        const mobName = block.getFieldValue('MOB_NAME');
        const mobId = mobName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        code = `${indent}var mob = ${mobId.toUpperCase()}_ENTITY.create(${worldVar});\n`;
        code += `${indent}if (mob != null) {\n`;
        code += `${indent}    var pos = ${playerVar}.getPos();\n`;
        code += `${indent}    mob.refreshPositionAndAngles(pos.x, pos.y, pos.z, 0.0F, 0.0F);\n`;
        code += `${indent}    ${worldVar}.spawnEntity(mob);\n`;
        code += `${indent}}\n`;
    }

    // ========== CUSTOM ITEM ACTION BLOCKS ==========
    else if (type === 'custom_action_projectile') {
        const projectile = block.getFieldValue('PROJECTILE');
        const speed = block.getFieldValue('SPEED') || 1.5;
        let projectileType = 'SNOWBALL';
        if (projectile === 'fireball') projectileType = 'SMALL_FIREBALL';
        else if (projectile === 'arrow') projectileType = 'ARROW';
        else if (projectile === 'snowball') projectileType = 'SNOWBALL';

        code = `${indent}var projectileEntity = EntityType.${projectileType}.create(${worldVar});\n`;
        code += `${indent}projectileEntity.setPosition(${playerVar}.getX(), ${playerVar}.getEyeY(), ${playerVar}.getZ());\n`;
        code += `${indent}Vec3d velocity = ${playerVar}.getRotationVector().multiply(${speed});\n`;
        code += `${indent}projectileEntity.setVelocity(velocity);\n`;
        code += `${indent}${worldVar}.spawnEntity(projectileEntity);\n`;
    }
    else if (type === 'custom_action_particles') {
        const particle = block.getFieldValue('PARTICLE');
        const count = block.getFieldValue('COUNT') || 20;
        const particleName = particle.toUpperCase();
        code = `${indent}${worldVar}.spawnParticles(ParticleTypes.${particleName}, ${playerVar}.getX(), ${playerVar}.getY() + 1, ${playerVar}.getZ(), ${count}, 0.5, 0.5, 0.5, 0.1);\n`;
    }
    else if (type === 'custom_action_area_effect') {
        const effect = block.getFieldValue('EFFECT');
        const radius = block.getFieldValue('RADIUS') || 8;
        const power = block.getFieldValue('POWER') || 3;

        if (effect === 'push') {
            code = `${indent}List<Entity> nearbyEntities = ${worldVar}.getOtherEntities(${playerVar}, ${playerVar}.getBoundingBox().expand(${radius}));\n`;
            code += `${indent}for (Entity entity : nearbyEntities) {\n`;
            code += `${indent}    Vec3d direction = entity.getPos().subtract(${playerVar}.getPos()).normalize();\n`;
            code += `${indent}    entity.setVelocity(direction.multiply(${power}));\n`;
            code += `${indent}    entity.velocityModified = true;\n`;
            code += `${indent}}\n`;
        } else if (effect === 'damage') {
            code = `${indent}List<Entity> nearbyEntities = ${worldVar}.getOtherEntities(${playerVar}, ${playerVar}.getBoundingBox().expand(${radius}));\n`;
            code += `${indent}for (Entity entity : nearbyEntities) {\n`;
            code += `${indent}    if (entity instanceof LivingEntity living) {\n`;
            code += `${indent}        living.damage(${playerVar}.getDamageSources().playerAttack(${playerVar}), ${power}f);\n`;
            code += `${indent}    }\n`;
            code += `${indent}}\n`;
        }
    }
    else if (type === 'custom_action_teleport_look') {
        const distance = block.getFieldValue('DISTANCE') || 30;
        code = `${indent}Vec3d direction = ${playerVar}.getRotationVector();\n`;
        code += `${indent}${playerVar}.teleport(${playerVar}.getX() + direction.x * ${distance}, ${playerVar}.getY() + direction.y * ${distance}, ${playerVar}.getZ() + direction.z * ${distance});\n`;
    }

    // ========== CUSTOM ITEM/MOB DEFINE BLOCKS (metadata - don't generate action code) ==========
    else if (type === 'custom_item_define' || type === 'custom_mob_define' || type === 'custom_item_use') {
        // These are definition/trigger blocks, not action blocks
        // They're handled at the top level or by the Python API
        // Don't generate code in the action chain
    }

    // ========== SENSING BLOCKS (used as standalone statements) ==========
    else if (type === 'sensing_is_holding') {
        const item = block.getFieldValue('ITEM');
        const itemName = item.replace('minecraft:', '').toUpperCase();
        // This is typically used in conditions, but if standalone, just check it
        code = `${indent}boolean isHolding = ${playerVar}.getMainHandStack().getItem() == Items.${itemName};\n`;
    }
    else if (type === 'sensing_block_at') {
        const position = block.getFieldValue('POSITION');
        // Map position to offset
        let offsetCode = '${playerVar}.getBlockPos()';
        if (position === 'feet') offsetCode = `${playerVar}.getBlockPos()`;
        else if (position === 'head') offsetCode = `${playerVar}.getBlockPos().up()`;
        else if (position === 'below') offsetCode = `${playerVar}.getBlockPos().down()`;
        else if (position === 'above') offsetCode = `${playerVar}.getBlockPos().up(2)`;
        else if (position === 'north') offsetCode = `${playerVar}.getBlockPos().north()`;
        else if (position === 'south') offsetCode = `${playerVar}.getBlockPos().south()`;
        else if (position === 'east') offsetCode = `${playerVar}.getBlockPos().east()`;
        else if (position === 'west') offsetCode = `${playerVar}.getBlockPos().west()`;

        code = `${indent}BlockState blockAt = ${worldVar}.getBlockState(${offsetCode});\n`;
    }
    else if (type === 'sensing_get_gamemode') {
        code = `${indent}GameMode gamemode = ${playerVar}.interactionManager.getGameMode();\n`;
    }
    else if (type === 'sensing_player_name') {
        code = `${indent}String playerName = ${playerVar}.getName().getString();\n`;
    }

    // ========== TEXT BLOCKS ==========
    else if (type === 'text') {
        const textValue = block.getFieldValue('TEXT') || '';
        // Text blocks are typically used as inputs to other blocks
        // If standalone, create a string variable
        code = `${indent}String text = "${textValue}";\n`;
    }

    // ========== VARIABLE BLOCKS ==========
    else if (type === 'variables_set') {
        const varName = block.getFieldValue('VAR');
        const valueInput = block.getInputTargetBlock('VALUE');
        let valueCode = '0';

        if (valueInput) {
            if (valueInput.type === 'text') {
                valueCode = `"${valueInput.getFieldValue('TEXT') || ''}"`;
                code = `${indent}String ${varName} = ${valueCode};\n`;
            } else if (valueInput.type === 'math_number') {
                valueCode = valueInput.getFieldValue('NUM') || '0';
                code = `${indent}double ${varName} = ${valueCode};\n`;
            } else if (valueInput.type === 'logic_boolean') {
                const boolVal = valueInput.getFieldValue('BOOL');
                valueCode = boolVal === 'TRUE' ? 'true' : 'false';
                code = `${indent}boolean ${varName} = ${valueCode};\n`;
            } else {
                // Try to generate value code
                valueCode = generateValueCode(valueInput, playerVar);
                code = `${indent}double ${varName} = ${valueCode};\n`;
            }
        } else {
            code = `${indent}double ${varName} = 0;\n`;
        }
    }
    else if (type === 'variables_get') {
        const varName = block.getFieldValue('VAR');
        // Variable gets are typically used as inputs
        // If standalone, just reference it
        code = `${indent}// Using variable: ${varName}\n`;
    }

    // ========== AI MODEL & BLOCK DISPLAY BLOCKS ==========
    else if (type === 'spawn_ai_model_scaled') {
        const modelId = block.getFieldValue('MODEL_ID');
        const scale = parseFloat(block.getFieldValue('SCALE') || 1.0);
        const posType = block.getFieldValue('POSITION_TYPE') || 'PLAYER';
        const distance = parseFloat(block.getFieldValue('DISTANCE') || 3);

        // Generate function name with scale suffix
        const scaleSuffix = `_scale_${scale}`.replace('.', '_');
        const functionName = `${modelId}${scaleSuffix}`;

        // Calculate spawn position based on position type
        let positionCode = '';
        if (posType === 'PLAYER') {
            positionCode = `${playerVar}.getPos()`;
        } else if (posType === 'FRONT') {
            code += `${indent}// Calculate position in front of player\n`;
            code += `${indent}Vec3d spawnPos = ${playerVar}.getPos().add(${playerVar}.getRotationVector().multiply(${distance}));\n`;
            positionCode = 'spawnPos';
        } else if (posType === 'LOOKING') {
            code += `${indent}// Calculate where player is looking\n`;
            code += `${indent}Vec3d spawnPos = ${playerVar}.raycast(${distance}, 1.0f, false).getPos();\n`;
            positionCode = 'spawnPos';
        } else if (posType === 'ABOVE') {
            code += `${indent}// Calculate position above player\n`;
            code += `${indent}Vec3d spawnPos = ${playerVar}.getPos().add(0, ${distance}, 0);\n`;
            positionCode = 'spawnPos';
        } else {
            positionCode = `${playerVar}.getPos()`;
        }

        code += `${indent}// Spawn scaled AI model: ${modelId} at ${scale}x scale\n`;
        code += `${indent}${worldVar}.getServer().getCommandManager().executeWithPrefix(\n`;
        code += `${indent}    ${worldVar}.getServer().getCommandSource().withPosition(${positionCode}),\n`;
        code += `${indent}    "function blockcraft:${functionName}"\n`;
        code += `${indent});\n`;
    }
    else if (type === 'spawn_ai_model_rotated') {
        const modelId = block.getFieldValue('MODEL_ID');
        const rotation = parseFloat(block.getFieldValue('ROTATION') || 0);
        const posType = block.getFieldValue('POSITION_TYPE') || 'PLAYER';
        const distance = parseFloat(block.getFieldValue('DISTANCE') || 3);

        // Generate function name with rotation suffix
        const rotationSuffix = `_rotation_${rotation}`.replace('.', '_');
        const functionName = `${modelId}${rotationSuffix}`;

        // Calculate spawn position based on position type
        let positionCode = '';
        if (posType === 'PLAYER') {
            positionCode = `${playerVar}.getPos()`;
        } else if (posType === 'FRONT') {
            code += `${indent}// Calculate position in front of player\n`;
            code += `${indent}Vec3d spawnPos = ${playerVar}.getPos().add(${playerVar}.getRotationVector().multiply(${distance}));\n`;
            positionCode = 'spawnPos';
        } else if (posType === 'LOOKING') {
            code += `${indent}// Calculate where player is looking\n`;
            code += `${indent}Vec3d spawnPos = ${playerVar}.raycast(${distance}, 1.0f, false).getPos();\n`;
            positionCode = 'spawnPos';
        } else if (posType === 'ABOVE') {
            code += `${indent}// Calculate position above player\n`;
            code += `${indent}Vec3d spawnPos = ${playerVar}.getPos().add(0, ${distance}, 0);\n`;
            positionCode = 'spawnPos';
        } else {
            positionCode = `${playerVar}.getPos()`;
        }

        code += `${indent}// Spawn rotated AI model: ${modelId} at ${rotation} degrees\n`;
        code += `${indent}${worldVar}.getServer().getCommandManager().executeWithPrefix(\n`;
        code += `${indent}    ${worldVar}.getServer().getCommandSource().withPosition(${positionCode}),\n`;
        code += `${indent}    "function blockcraft:${functionName}"\n`;
        code += `${indent});\n`;
    }
    else if (type === 'spawn_ai_model_spinning' || type === 'spawn_ai_model_following' ||
             type === 'spawn_ai_model_orbiting' || type === 'spawn_ai_model_circle' ||
             type === 'spawn_block_display_model') {
        const modelId = block.getFieldValue('MODEL_ID');
        // Get placement mode (only spawn_block_display_model has this field)
        const placementMode = block.getFieldValue('PLACEMENT_MODE');
        const functionName = (placementMode === 'blocks') ? `${modelId}_blocks` : modelId;
        code = `${indent}// Spawn AI model: ${modelId} (${placementMode || 'display'} mode)\n`;
        code += `${indent}${worldVar}.getServer().getCommandManager().executeWithPrefix(\n`;
        code += `${indent}    ${worldVar}.getServer().getCommandSource().withPosition(${playerVar}.getPos()),\n`;
        code += `${indent}    "function blockcraft:${functionName}"\n`;
        code += `${indent});\n`;
    }

    // ========== LOGIC BLOCKS (when used standalone) ==========
    else if (type === 'logic_boolean' || type === 'logic_compare' || type === 'logic_operation' || type === 'logic_not') {
        // These are typically used in conditions, but if standalone just evaluate them
        code = `${indent}// Logic operation evaluated\n`;
    }

    // ========== MATH BLOCKS (when used standalone) ==========
    else if (type === 'math_number' || type === 'math_arithmetic') {
        // These are typically used as inputs, but if standalone just note them
        code = `${indent}// Math operation evaluated\n`;
    }

    // Process next block in the chain
    const nextBlock = block.getNextBlock();
    if (nextBlock) {
        code += generateBlockJava(nextBlock, context);
    }

    return code;
}

// Helper function to generate condition code for if blocks
function generateConditionCode(conditionBlock, playerVar) {
    if (!conditionBlock) return 'true';

    const type = conditionBlock.type;

    // Boolean sensing blocks
    if (type === 'sensing_is_sneaking') {
        return `${playerVar}.isSneaking()`;
    } else if (type === 'sensing_is_in_water') {
        return `${playerVar}.isSubmergedInWater()`;
    } else if (type === 'sensing_is_on_fire') {
        return `${playerVar}.isOnFire()`;
    } else if (type === 'sensing_is_on_ground') {
        return `${playerVar}.isOnGround()`;
    } else if (type === 'sensing_is_sprinting') {
        return `${playerVar}.isSprinting()`;
    } else if (type === 'sensing_is_flying') {
        return `${playerVar}.getAbilities().flying`;
    } else if (type === 'sensing_is_raining') {
        return `${playerVar}.getWorld().isRaining()`;
    } else if (type === 'sensing_is_day') {
        const time = conditionBlock.getFieldValue('TIME');
        if (time === 'day') {
            return `${playerVar}.getWorld().isDay()`;
        } else {
            return `${playerVar}.getWorld().isNight()`;
        }
    } else if (type === 'logic_boolean') {
        const value = conditionBlock.getFieldValue('BOOL');
        return value === 'TRUE' ? 'true' : 'false';
    } else if (type === 'logic_compare') {
        const op = conditionBlock.getFieldValue('OP');
        const aBlock = conditionBlock.getInputTargetBlock('A');
        const bBlock = conditionBlock.getInputTargetBlock('B');
        const aCode = aBlock ? generateValueCode(aBlock, playerVar) : '0';
        const bCode = bBlock ? generateValueCode(bBlock, playerVar) : '0';

        const opMap = {
            'EQ': '==',
            'NEQ': '!=',
            'LT': '<',
            'LTE': '<=',
            'GT': '>',
            'GTE': '>='
        };
        return `${aCode} ${opMap[op] || '=='} ${bCode}`;
    } else if (type === 'logic_operation') {
        const op = conditionBlock.getFieldValue('OP');
        const aBlock = conditionBlock.getInputTargetBlock('A');
        const bBlock = conditionBlock.getInputTargetBlock('B');
        const aCode = aBlock ? generateConditionCode(aBlock, playerVar) : 'true';
        const bCode = bBlock ? generateConditionCode(bBlock, playerVar) : 'true';

        if (op === 'AND') {
            return `(${aCode} && ${bCode})`;
        } else if (op === 'OR') {
            return `(${aCode} || ${bCode})`;
        }
    } else if (type === 'logic_not') {
        const boolBlock = conditionBlock.getInputTargetBlock('BOOL');
        const boolCode = boolBlock ? generateConditionCode(boolBlock, playerVar) : 'true';
        return `!(${boolCode})`;
    }

    return 'true';
}

// Helper function to generate value code for math/sensing blocks
function generateValueCode(valueBlock, playerVar) {
    if (!valueBlock) return '0';

    const type = valueBlock.type;

    if (type === 'math_number') {
        return valueBlock.getFieldValue('NUM') || '0';
    } else if (type === 'sensing_get_health') {
        return `${playerVar}.getHealth()`;
    } else if (type === 'sensing_get_hunger') {
        return `${playerVar}.getHungerManager().getFoodLevel()`;
    } else if (type === 'sensing_time_of_day') {
        return `${playerVar}.getWorld().getTimeOfDay()`;
    } else if (type === 'sensing_nearby_entities') {
        const entityType = valueBlock.getFieldValue('TYPE');
        const range = valueBlock.getFieldValue('RANGE');
        return `${playerVar}.getWorld().getOtherEntities(${playerVar}, ${playerVar}.getBoundingBox().expand(${range})).size()`;
    } else if (type === 'math_arithmetic') {
        const op = valueBlock.getFieldValue('OP');
        const aBlock = valueBlock.getInputTargetBlock('A');
        const bBlock = valueBlock.getInputTargetBlock('B');
        const aCode = aBlock ? generateValueCode(aBlock, playerVar) : '0';
        const bCode = bBlock ? generateValueCode(bBlock, playerVar) : '0';

        const opMap = {
            'ADD': '+',
            'MINUS': '-',
            'MULTIPLY': '*',
            'DIVIDE': '/',
            'POWER': '**'
        };
        return `(${aCode} ${opMap[op] || '+'} ${bCode})`;
    }

    return '0';
}

// ES module export for Vite/TypeScript
export { generateJavaCode };
