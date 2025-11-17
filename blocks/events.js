// Event: When player runs command
Blockly.Blocks['event_command'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('⌨️ When player types /')
            .appendField(new Blockly.FieldTextInput('hello', this.validateCommand), 'COMMAND');
        this.appendStatementInput('ACTIONS')
            .setCheck(null)
            .appendField('do:');
        this.setColour('#9C27B0');
        this.setTooltip('Runs when a player types this command');
        this.setHelpUrl('');
    },
    validateCommand: function(newValue) {
        // Remove any slashes user might type
        newValue = newValue.replace(/\//g, '');
        // Remove spaces and special characters, only allow letters, numbers, underscore
        newValue = newValue.replace(/[^a-zA-Z0-9_]/g, '');
        // Make lowercase
        newValue = newValue.toLowerCase();
        // Default to 'hello' if empty
        return newValue || 'hello';
    }
};

// Event: When player right-clicks item
Blockly.Blocks['event_right_click'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🪄 When player right-clicks')
            .appendField(new Blockly.FieldDropdown([
                ['🥕 Carrot Stick', 'minecraft:carrot_on_a_stick'],
                ['🍄 Fungus Stick', 'minecraft:warped_fungus_on_a_stick'],
                ['🪵 Stick', 'minecraft:stick'],
                ['⚔️ Sword', 'minecraft:wooden_sword']
            ]), 'ITEM');
        this.appendStatementInput('ACTIONS')
            .setCheck(null)
            .appendField('do:');
        this.setColour('#9C27B0');
        this.setTooltip('Runs when player right-clicks with this item');
        this.setHelpUrl('');
    }
};

// Event: When player breaks block
Blockly.Blocks['event_break_block'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('⛏️ When player breaks')
            .appendField(new Blockly.FieldDropdown([
                ['🟫 Dirt', 'minecraft:dirt'],
                ['🪨 Stone', 'minecraft:stone'],
                ['🪵 Wood', 'minecraft:oak_log'],
                ['🌿 Grass', 'minecraft:grass_block'],
                ['⛏️ Diamond Ore', 'minecraft:diamond_ore'],
                ['🥇 Gold Ore', 'minecraft:gold_ore']
            ]), 'BLOCK');
        this.appendStatementInput('ACTIONS')
            .setCheck(null)
            .appendField('do:');
        this.setColour('#9C27B0');
        this.setTooltip('Runs when player breaks this type of block');
        this.setHelpUrl('');
    }
};
