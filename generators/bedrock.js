/**
 * Bedrock Add-on Code Generator for BlockCraft
 * Generates JavaScript scripts and .mcfunction files for Minecraft Bedrock Edition
 *
 * Uses @minecraft/server API for scripting
 * Version: 1.8.0+
 */

/**
 * Generate Bedrock add-on code from Blockly workspace
 * @param {Object} workspace - Blockly workspace
 * @returns {Object} - Generated code structure
 */
function generateBedrockCode(workspace) {
    const topBlocks = workspace.getTopBlocks(true);
    const commands = [];
    const events = [];
    const entities = [];
    const items = [];

    // Process each top-level event block
    for (const block of topBlocks) {
        if (block.type === 'event_command') {
            const commandName = block.getFieldValue('COMMAND').toLowerCase();
            const actions = generateActionsBedrock(block.getInput('ACTIONS'), 'command');
            commands.push({
                name: commandName,
                code: actions.javascript,
                mcfunction: actions.mcfunction
            });
        }
        else if (block.type === 'event_right_click') {
            const actions = generateActionsBedrock(block.getInput('ACTIONS'), 'right_click');
            events.push({
                type: 'right_click',
                code: actions.javascript
            });
        }
        else if (block.type === 'event_break_block') {
            const actions = generateActionsBedrock(block.getInput('ACTIONS'), 'block_break');
            events.push({
                type: 'block_break',
                code: actions.javascript
            });
        }
    }

    return {
        commands: commands,
        events: events,
        entities: entities,
        items: items
    };
}

/**
 * Generate action code (recursively processes nested blocks)
 */
function generateActionsBedrock(input, context) {
    let javascriptCode = '';
    let mcfunctionCode = '';
    let currentBlock = input ? input.connection.targetBlock() : null;

    while (currentBlock) {
        const blockCode = generateBlockBedrock(currentBlock, context);
        javascriptCode += blockCode.javascript;
        mcfunctionCode += blockCode.mcfunction;
        currentBlock = currentBlock.getNextBlock();
    }

    return {
        javascript: javascriptCode,
        mcfunction: mcfunctionCode
    };
}

/**
 * Generate code for a single block
 */
function generateBlockBedrock(block, context) {
    const type = block.type;
    let javascript = '';
    let mcfunction = '';
    const indent = context === 'command' ? '            ' : '        ';
    const playerVar = context === 'command' ? 'player' : 'player';

    // Player Actions
    if (type === 'action_message') {
        const message = block.getFieldValue('MESSAGE');
        javascript = `${indent}${playerVar}.sendMessage("${message}");\n`;
        mcfunction = `say ${message}\n`;
    }
    else if (type === 'action_teleport') {
        const x = block.getFieldValue('X');
        const y = block.getFieldValue('Y');
        const z = block.getFieldValue('Z');
        javascript = `${indent}${playerVar}.teleport({x: ${x}, y: ${y}, z: ${z}});\n`;
        mcfunction = `tp @s ${x} ${y} ${z}\n`;
    }
    else if (type === 'action_set_gamemode') {
        const mode = block.getFieldValue('MODE');
        const modeMap = {
            'SURVIVAL': 's',
            'CREATIVE': 'c',
            'ADVENTURE': 'a',
            'SPECTATOR': 'spectator'
        };
        javascript = `${indent}${playerVar}.runCommandAsync("gamemode ${modeMap[mode]}");\n`;
        mcfunction = `gamemode ${modeMap[mode]} @s\n`;
    }
    else if (type === 'action_give_effect') {
        const effect = block.getFieldValue('EFFECT');
        const duration = block.getFieldValue('DURATION');
        const amplifier = block.getFieldValue('AMPLIFIER') || 0;
        const effectName = effect.replace('minecraft:', '');
        javascript = `${indent}${playerVar}.addEffect("${effect}", ${duration} * 20, {amplifier: ${amplifier}});\n`;
        mcfunction = `effect @s ${effectName} ${duration} ${amplifier}\n`;
    }
    else if (type === 'action_clear_effects') {
        javascript = `${indent}${playerVar}.runCommandAsync("effect @s clear");\n`;
        mcfunction = `effect @s clear\n`;
    }
    else if (type === 'action_heal') {
        const amount = block.getFieldValue('AMOUNT');
        javascript = `${indent}const currentHealth = ${playerVar}.getComponent("health");\n`;
        javascript += `${indent}currentHealth.setCurrentValue(Math.min(currentHealth.currentValue + ${amount}, currentHealth.value));\n`;
        mcfunction = `effect @s instant_health 1 ${Math.floor(amount / 4)}\n`;
    }
    else if (type === 'action_set_health') {
        const health = block.getFieldValue('HEALTH');
        javascript = `${indent}const healthComp = ${playerVar}.getComponent("health");\n`;
        javascript += `${indent}healthComp.setCurrentValue(${health});\n`;
        mcfunction = `# Set health to ${health} (use commands)\n`;
    }

    // World Actions
    else if (type === 'action_setblock') {
        const x = block.getFieldValue('X');
        const y = block.getFieldValue('Y');
        const z = block.getFieldValue('Z');
        const blockType = block.getFieldValue('BLOCK');
        javascript = `${indent}const dimension = ${playerVar}.dimension;\n`;
        javascript += `${indent}dimension.setBlockType({x: ${x}, y: ${y}, z: ${z}}, "${blockType}");\n`;
        mcfunction = `setblock ${x} ${y} ${z} ${blockType}\n`;
    }
    else if (type === 'action_fill') {
        const x1 = block.getFieldValue('X1');
        const y1 = block.getFieldValue('Y1');
        const z1 = block.getFieldValue('Z1');
        const x2 = block.getFieldValue('X2');
        const y2 = block.getFieldValue('Y2');
        const z2 = block.getFieldValue('Z2');
        const blockType = block.getFieldValue('BLOCK');
        javascript = `${indent}${playerVar}.runCommandAsync("fill ${x1} ${y1} ${z1} ${x2} ${y2} ${z2} ${blockType}");\n`;
        mcfunction = `fill ${x1} ${y1} ${z1} ${x2} ${y2} ${z2} ${blockType}\n`;
    }
    else if (type === 'action_spawn_mob') {
        const mob = block.getFieldValue('MOB');
        javascript = `${indent}const loc = ${playerVar}.location;\n`;
        javascript += `${indent}${playerVar}.dimension.spawnEntity("${mob}", loc);\n`;
        mcfunction = `summon ${mob} ~~1~\n`;
    }
    else if (type === 'action_explosion') {
        const power = block.getFieldValue('POWER') || 4;
        javascript = `${indent}const loc = ${playerVar}.location;\n`;
        javascript += `${indent}${playerVar}.dimension.createExplosion(loc, ${power});\n`;
        mcfunction = `summon tnt ~~~\n`;
    }
    else if (type === 'action_play_sound') {
        const sound = block.getFieldValue('SOUND');
        javascript = `${indent}${playerVar}.playSound("${sound}");\n`;
        mcfunction = `playsound ${sound} @s\n`;
    }
    else if (type === 'action_set_time') {
        const time = block.getFieldValue('TIME');
        javascript = `${indent}${playerVar}.runCommandAsync("time set ${time}");\n`;
        mcfunction = `time set ${time}\n`;
    }
    else if (type === 'action_set_weather') {
        const weather = block.getFieldValue('WEATHER');
        javascript = `${indent}${playerVar}.runCommandAsync("weather ${weather}");\n`;
        mcfunction = `weather ${weather}\n`;
    }

    // Item Actions
    else if (type === 'action_give_item') {
        const item = block.getFieldValue('ITEM');
        const amount = block.getFieldValue('AMOUNT') || 1;
        javascript = `${indent}${playerVar}.runCommandAsync("give @s ${item} ${amount}");\n`;
        mcfunction = `give @s ${item} ${amount}\n`;
    }
    else if (type === 'action_clear_inventory') {
        javascript = `${indent}${playerVar}.runCommandAsync("clear @s");\n`;
        mcfunction = `clear @s\n`;
    }

    // Title/Message Actions
    else if (type === 'action_title') {
        const title = block.getFieldValue('TITLE');
        javascript = `${indent}${playerVar}.onScreenDisplay.setTitle("${title}");\n`;
        mcfunction = `title @s title ${title}\n`;
    }
    else if (type === 'action_actionbar') {
        const text = block.getFieldValue('TEXT');
        javascript = `${indent}${playerVar}.onScreenDisplay.setActionBar("${text}");\n`;
        mcfunction = `title @s actionbar ${text}\n`;
    }

    // Control Flow
    else if (type === 'repeat_times') {
        const times = block.getFieldValue('TIMES');
        const repeatActions = generateActionsBedrock(block.getInput('DO'), context);
        javascript = `${indent}for (let i = 0; i < ${times}; i++) {\n`;
        javascript += repeatActions.javascript;
        javascript += `${indent}}\n`;
        mcfunction = `# Repeat ${times} times:\n${repeatActions.mcfunction}`;
    }
    else if (type === 'controls_if') {
        const condition = block.getFieldValue('CONDITION') || 'true';
        const ifActions = generateActionsBedrock(block.getInput('DO'), context);
        javascript = `${indent}if (${condition}) {\n`;
        javascript += ifActions.javascript;
        javascript += `${indent}}\n`;
        mcfunction = `# If ${condition}:\n${ifActions.mcfunction}`;
    }

    return {
        javascript: javascript,
        mcfunction: mcfunction
    };
}

// ES module export for Vite/TypeScript
export { generateBedrockCode };
