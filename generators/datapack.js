// Initialize the JavaScript generator
const javascriptGenerator = new Blockly.Generator('JavaScript');

// Datapack code generator - simplified version that doesn't use Blockly.JavaScript
function generateDatapackCode(workspace) {
    let code = '';
    const topBlocks = workspace.getTopBlocks(true);

    for (const block of topBlocks) {
        code += generateBlockCode(block) + '\n\n';
    }

    return code.trim();
}

function generateBlockCode(block) {
    if (!block) return '';

    const type = block.type;
    let code = '';

    // Event blocks
    if (type === 'event_command') {
        // This is handled by builder.js - just return empty here
        return '';
    }
    else if (type === 'event_right_click') {
        const item = block.getFieldValue('ITEM');
        const actions = getChildBlocksCode(block, 'ACTIONS');
        code = `# When right-click with item\n# Detected via scoreboard\n${actions}`;
    }
    else if (type === 'event_break_block') {
        const blockType = block.getFieldValue('BLOCK');
        const actions = getChildBlocksCode(block, 'ACTIONS');
        code = `# When break ${blockType}\n${actions}`;
    }
    // Action blocks
    else if (type === 'action_message') {
        const message = block.getFieldValue('MESSAGE');
        code = `tellraw @s {"text":"${message}","color":"yellow"}`;
    }
    else if (type === 'action_spawn_mob') {
        const mob = block.getFieldValue('MOB');
        code = `summon ${mob} ~ ~ ~`;
    }
    else if (type === 'action_give_item') {
        const item = block.getFieldValue('ITEM');
        const amount = block.getFieldValue('AMOUNT');
        code = `give @s ${item} ${amount}`;
    }
    else if (type === 'action_play_sound') {
        const sound = block.getFieldValue('SOUND');
        code = `playsound ${sound} player @s ~ ~ ~ 1.0 1.0`;
    }
    // Logic blocks
    else if (type === 'logic_if') {
        const condition = block.getFieldValue('CONDITION');
        const then = getChildBlocksCode(block, 'THEN');
        code = `execute if entity @s[${condition}] run function blockcraft:if_true\n# In if_true.mcfunction:\n${then}`;
    }
    else if (type === 'logic_wait') {
        const seconds = block.getFieldValue('SECONDS');
        code = `# Wait ${seconds} seconds (schedule command)`;
    }
    else if (type === 'data_random') {
        const max = block.getFieldValue('MAX');
        code = `# Random 1-${max}`;
    }

    // Process next block in the stack
    const nextBlock = block.getNextBlock();
    if (nextBlock) {
        code += '\n' + generateBlockCode(nextBlock);
    }

    return code;
}

function getChildBlocksCode(block, inputName) {
    const input = block.getInput(inputName);
    if (!input || !input.connection || !input.connection.targetBlock()) {
        return '';
    }

    return generateBlockCode(input.connection.targetBlock());
}

// Setup code generators for Blockly
Blockly.JavaScript = Blockly.JavaScript || {};

Blockly.JavaScript['event_command'] = function(block) {
    const command = block.getFieldValue('COMMAND');
    const actions = Blockly.JavaScript.statementToCode(block, 'ACTIONS');
    return `# Command: ${command}\n${actions}\n`;
};

Blockly.JavaScript['event_right_click'] = function(block) {
    const actions = Blockly.JavaScript.statementToCode(block, 'ACTIONS');
    return actions;
};

Blockly.JavaScript['event_break_block'] = function(block) {
    const actions = Blockly.JavaScript.statementToCode(block, 'ACTIONS');
    return actions;
};

Blockly.JavaScript['action_message'] = function(block) {
    const message = block.getFieldValue('MESSAGE');
    return `tellraw @s {"text":"${message}","color":"yellow"}\n`;
};

Blockly.JavaScript['action_spawn_mob'] = function(block) {
    const mob = block.getFieldValue('MOB');
    return `summon ${mob} ~ ~ ~\n`;
};

Blockly.JavaScript['action_give_item'] = function(block) {
    const item = block.getFieldValue('ITEM');
    const amount = block.getFieldValue('AMOUNT');
    return `give @s ${item} ${amount}\n`;
};

Blockly.JavaScript['action_play_sound'] = function(block) {
    const sound = block.getFieldValue('SOUND');
    return `playsound ${sound} player @s ~ ~ ~ 1.0 1.0\n`;
};

Blockly.JavaScript['logic_if'] = function(block) {
    const condition = block.getFieldValue('CONDITION');
    const then = Blockly.JavaScript.statementToCode(block, 'THEN');
    return `execute if entity @s[${condition}] run function my_mod:if_true\n`;
};

Blockly.JavaScript['logic_wait'] = function(block) {
    const seconds = block.getFieldValue('SECONDS');
    return `# Wait ${seconds} seconds (use schedule command)\n`;
};

Blockly.JavaScript['data_random'] = function(block) {
    const max = block.getFieldValue('MAX');
    return [`random_1_${max}`, Blockly.JavaScript.ORDER_NONE];
};
