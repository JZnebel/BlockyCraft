// Logic: If condition
Blockly.Blocks['logic_if'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🤔 If player is')
            .appendField(new Blockly.FieldDropdown([
                ['sneaking 🐱', 'predicate=sneaking'],
                ['in water 🌊', 'nbt={Inwater:1b}'],
                ['on fire 🔥', 'nbt={Fire:1s}']
            ]), 'CONDITION');
        this.appendStatementInput('THEN')
            .setCheck(null)
            .appendField('then:');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF9800');
        this.setTooltip('Only do something if condition is true');
        this.setHelpUrl('');
    }
};

// Logic: If/Else
Blockly.Blocks['logic_if_else'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🤔 If player is')
            .appendField(new Blockly.FieldDropdown([
                ['sneaking 🐱', 'sneaking'],
                ['in water 🌊', 'water'],
                ['on fire 🔥', 'fire']
            ]), 'CONDITION');
        this.appendStatementInput('THEN')
            .setCheck(null)
            .appendField('then:');
        this.appendStatementInput('ELSE')
            .setCheck(null)
            .appendField('else:');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF9800');
        this.setTooltip('Do one thing if true, another if false');
        this.setHelpUrl('');
    }
};

// Logic: Wait
Blockly.Blocks['logic_wait'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('⏰ Wait')
            .appendField(new Blockly.FieldNumber(1, 0, 60), 'SECONDS')
            .appendField('seconds');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF9800');
        this.setTooltip('Wait before doing the next action');
        this.setHelpUrl('');
    }
};

// Data: Random chance
Blockly.Blocks['data_random'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🎲 Random chance')
            .appendField(new Blockly.FieldNumber(50, 1, 100), 'CHANCE')
            .appendField('% do:');
        this.appendStatementInput('ACTIONS')
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#F44336');
        this.setTooltip('Has a random chance of doing the actions inside');
        this.setHelpUrl('');
    }
};

// Loop: Repeat X times
Blockly.Blocks['loop_repeat'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🔁 Repeat')
            .appendField(new Blockly.FieldNumber(10, 1, 100), 'TIMES')
            .appendField('times:');
        this.appendStatementInput('DO')
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF9800');
        this.setTooltip('Repeats the actions inside a specific number of times');
        this.setHelpUrl('');
    }
};
