// Generate Java code for custom items

function generateCustomItemsCode(workspace) {
    const topBlocks = workspace.getTopBlocks(true);
    const customItems = [];
    const customItemUses = [];

    // Find all custom item definitions
    for (const block of topBlocks) {
        if (block.type === 'custom_item_define') {
            const itemName = block.getFieldValue('ITEM_NAME');
            const baseItem = block.getFieldValue('BASE_ITEM');
            const rarity = block.getFieldValue('RARITY');
            const maxStack = block.getFieldValue('MAX_STACK');
            const textureSource = block.getFieldValue('TEXTURE_SOURCE') || 'ai';
            const textureDescription = block.getFieldValue('TEXTURE_DESCRIPTION') || '';
            const uploadedTexture = block.uploadedTextureData || null;

            const itemId = itemName.toLowerCase().replace(/[^a-z0-9]/g, '_');

            // Get crafting recipe
            const recipe = [];
            for (let i = 1; i <= 9; i++) {
                const ingredient = block.getFieldValue(`RECIPE_${i}`) || 'minecraft:air';
                recipe.push(ingredient);
            }

            customItems.push({
                name: itemName,
                id: itemId,
                baseItem: baseItem,
                rarity: rarity,
                maxStack: maxStack,
                textureSource: textureSource,
                textureDescription: textureDescription,
                uploadedTexture: uploadedTexture,
                recipe: recipe
            });
        }
        else if (block.type === 'custom_item_use') {
            const itemName = block.getFieldValue('ITEM_NAME');
            const itemId = itemName.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const actions = generateCustomItemActionsJava(block.getInput('ACTIONS'));

            customItemUses.push({
                id: itemId,
                name: itemName,
                code: actions
            });
        }
    }

    return { customItems, customItemUses };
}

function generateCustomItemActionsJava(input) {
    if (!input || !input.connection || !input.connection.targetBlock()) {
        return '';
    }

    const block = input.connection.targetBlock();
    return generateCustomItemBlockJava(block);
}

function generateCustomItemBlockJava(block) {
    if (!block) return '';

    const type = block.type;
    let code = '';
    const indent = '                ';

    if (type === 'custom_action_projectile') {
        const projectile = block.getFieldValue('PROJECTILE');
        const speed = block.getFieldValue('SPEED');

        const projectileMap = {
            'fireball': 'SmallFireballEntity',
            'snowball': 'SnowballEntity',
            'arrow': 'ArrowEntity',
            'potion': 'PotionEntity',
            'trident': 'TridentEntity',
            'wither_skull': 'WitherSkullEntity'
        };

        const entityClass = projectileMap[projectile] || 'SnowballEntity';

        code += `${indent}// Shoot ${projectile}\n`;
        code += `${indent}Vec3d lookVec = player.getRotationVec(1.0f).multiply(${speed});\n`;

        if (projectile === 'fireball') {
            code += `${indent}SmallFireballEntity fireball = new SmallFireballEntity(world, player, lookVec.x, lookVec.y, lookVec.z);\n`;
            code += `${indent}fireball.setPosition(player.getEyePos());\n`;
            code += `${indent}world.spawnEntity(fireball);\n`;
        } else if (projectile === 'snowball') {
            code += `${indent}SnowballEntity snowball = new SnowballEntity(world, player);\n`;
            code += `${indent}snowball.setVelocity(player, player.getPitch(), player.getYaw(), 0.0f, ${speed}f, 1.0f);\n`;
            code += `${indent}world.spawnEntity(snowball);\n`;
        } else if (projectile === 'arrow') {
            code += `${indent}ArrowEntity arrow = new ArrowEntity(world, player);\n`;
            code += `${indent}arrow.setVelocity(player, player.getPitch(), player.getYaw(), 0.0f, ${speed}f, 1.0f);\n`;
            code += `${indent}world.spawnEntity(arrow);\n`;
        } else if (projectile === 'wither_skull') {
            code += `${indent}WitherSkullEntity skull = new WitherSkullEntity(world, player, lookVec);\n`;
            code += `${indent}skull.setPosition(player.getEyePos());\n`;
            code += `${indent}world.spawnEntity(skull);\n`;
        }

        code += `${indent}world.playSound(null, player.getBlockPos(), SoundEvents.ENTITY_ARROW_SHOOT, SoundCategory.PLAYERS, 1.0f, 1.0f);\n`;
    }
    else if (type === 'custom_action_particles') {
        const particle = block.getFieldValue('PARTICLE');
        const count = block.getFieldValue('COUNT');

        const particleMap = {
            'enchant': 'ENCHANT',
            'heart': 'HEART',
            'flame': 'FLAME',
            'smoke': 'SMOKE',
            'crit': 'CRIT',
            'drip_water': 'DRIPPING_WATER',
            'portal': 'PORTAL',
            'electric_spark': 'ELECTRIC_SPARK'
        };

        const particleType = particleMap[particle] || 'ENCHANT';

        code += `${indent}// Spawn particles\n`;
        code += `${indent}if (world instanceof ServerWorld serverWorld) {\n`;
        code += `${indent}    serverWorld.spawnParticles(ParticleTypes.${particleType}, player.getX(), player.getY() + 1, player.getZ(), ${count}, 0.5, 0.5, 0.5, 0.1);\n`;
        code += `${indent}}\n`;
    }
    else if (type === 'custom_action_area_effect') {
        const effect = block.getFieldValue('EFFECT');
        const radius = block.getFieldValue('RADIUS');
        const power = block.getFieldValue('POWER');

        code += `${indent}// Area effect: ${effect}\n`;
        code += `${indent}List<Entity> nearbyEntities = world.getOtherEntities(player, player.getBoundingBox().expand(${radius}));\n`;
        code += `${indent}for (Entity entity : nearbyEntities) {\n`;

        if (effect === 'push') {
            code += `${indent}    Vec3d direction = entity.getPos().subtract(player.getPos()).normalize();\n`;
            code += `${indent}    entity.setVelocity(direction.multiply(${power}));\n`;
            code += `${indent}    entity.velocityModified = true;\n`;
        } else if (effect === 'pull') {
            code += `${indent}    Vec3d direction = player.getPos().subtract(entity.getPos()).normalize();\n`;
            code += `${indent}    entity.setVelocity(direction.multiply(${power}));\n`;
            code += `${indent}    entity.velocityModified = true;\n`;
        } else if (effect === 'damage') {
            code += `${indent}    if (entity instanceof LivingEntity) {\n`;
            code += `${indent}        entity.damage(world.getDamageSources().magic(), ${power}f);\n`;
            code += `${indent}    }\n`;
        } else if (effect === 'heal') {
            code += `${indent}    if (entity instanceof LivingEntity living) {\n`;
            code += `${indent}        living.heal(${power}f);\n`;
            code += `${indent}    }\n`;
        } else if (effect === 'ignite') {
            code += `${indent}    entity.setOnFireFor(${power});\n`;
        } else if (effect === 'freeze') {
            code += `${indent}    entity.setFrozenTicks(${power} * 20);\n`;
        }

        code += `${indent}}\n`;
    }
    else if (type === 'custom_action_teleport_look') {
        const distance = block.getFieldValue('DISTANCE');

        code += `${indent}// Teleport to where player is looking\n`;
        code += `${indent}HitResult hit = player.raycast(${distance}, 0.0f, false);\n`;
        code += `${indent}if (hit.getType() == HitResult.Type.BLOCK) {\n`;
        code += `${indent}    BlockHitResult blockHit = (BlockHitResult) hit;\n`;
        code += `${indent}    BlockPos targetPos = blockHit.getBlockPos().offset(blockHit.getSide());\n`;
        code += `${indent}    player.teleport(targetPos.getX() + 0.5, targetPos.getY(), targetPos.getZ() + 0.5);\n`;
        code += `${indent}    world.playSound(null, player.getBlockPos(), SoundEvents.ENTITY_ENDERMAN_TELEPORT, SoundCategory.PLAYERS, 1.0f, 1.0f);\n`;
        code += `${indent}}\n`;
    }
    // Also handle regular action blocks
    else if (type === 'action_message') {
        const message = block.getFieldValue('MESSAGE');
        code = `${indent}player.sendMessage(Text.literal("${message}"), false);\n`;
    }
    else if (type === 'action_title') {
        const title = block.getFieldValue('TITLE');
        code = `${indent}player.sendMessage(Text.literal("${title}"), true);\n`;
    }
    else if (type === 'player_effect') {
        const effect = block.getFieldValue('EFFECT');
        const duration = block.getFieldValue('DURATION');
        code = `${indent}player.addStatusEffect(new StatusEffectInstance(StatusEffects.${effect}, ${duration} * 20, 1));\n`;
    }
    else if (type === 'player_teleport') {
        const x = block.getFieldValue('X');
        const y = block.getFieldValue('Y');
        const z = block.getFieldValue('Z');
        code = `${indent}player.teleport(${x}, ${y}, ${z});\n`;
    }
    else if (type === 'custom_item_give') {
        const itemName = block.getFieldValue('ITEM_NAME');
        const amount = block.getFieldValue('AMOUNT');
        const itemId = itemName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        code = `${indent}player.getInventory().insertStack(new ItemStack(ITEM_${itemId.toUpperCase()}, ${amount}));\n`;
    }

    // Handle next block
    const nextBlock = block.getNextBlock();
    if (nextBlock) {
        code += generateCustomItemBlockJava(nextBlock);
    }

    return code;
}
