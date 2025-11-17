// Variables blocks - Scoreboard and data storage

// Variables: Set variable
Blockly.Blocks['variables_set'] = {
    init: function() {
        this.appendValueInput('VALUE')
            .appendField('📝 Set')
            .appendField(new Blockly.FieldTextInput('myVar'), 'VAR')
            .appendField('to');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF8C1A');
        this.setTooltip('Sets a scoreboard variable for the player');
    }
};

// Variables: Change variable
Blockly.Blocks['variables_change'] = {
    init: function() {
        this.appendValueInput('VALUE')
            .setCheck('Number')
            .appendField('➕ Change')
            .appendField(new Blockly.FieldTextInput('myVar'), 'VAR')
            .appendField('by');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF8C1A');
        this.setTooltip('Changes a scoreboard variable by adding a number');
    }
};

// Variables: Get variable
Blockly.Blocks['variables_get'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('📊')
            .appendField(new Blockly.FieldTextInput('myVar'), 'VAR');
        this.setOutput(true, 'Number');
        this.setColour('#FF8C1A');
        this.setTooltip('Gets the value of a scoreboard variable');
    }
};

// Variables: Show variable
Blockly.Blocks['variables_show'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('👁️ Show')
            .appendField(new Blockly.FieldTextInput('myVar'), 'VAR')
            .appendField('on')
            .appendField(new Blockly.FieldDropdown([
                ['Sidebar', 'sidebar'],
                ['Player List', 'list'],
                ['Below Name', 'belowName']
            ]), 'DISPLAY');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF8C1A');
        this.setTooltip('Displays a scoreboard variable on screen');
    }
};

// Variables: Hide variable
Blockly.Blocks['variables_hide'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🙈 Hide')
            .appendField(new Blockly.FieldTextInput('myVar'), 'VAR');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF8C1A');
        this.setTooltip('Hides a scoreboard variable display');
    }
};

// Variables: Create objective
Blockly.Blocks['variables_create_objective'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('📋 Create scoreboard')
            .appendField(new Blockly.FieldTextInput('myScore'), 'NAME')
            .appendField(new Blockly.FieldDropdown([
                ['Number', 'dummy'],
                ['Health', 'health'],
                ['Deaths', 'deathCount'],
                ['Kills', 'playerKillCount']
            ]), 'CRITERIA');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF8C1A');
        this.setTooltip('Creates a new scoreboard objective');
    }
};

// Variables: If variable
Blockly.Blocks['variables_if'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('If')
            .appendField(new Blockly.FieldTextInput('myVar'), 'VAR')
            .appendField(new Blockly.FieldDropdown([
                ['=', '=='],
                ['≠', '!='],
                ['<', '<'],
                ['>', '>'],
                ['≤', '<='],
                ['≥', '>=']
            ]), 'OP');
        this.appendValueInput('VALUE')
            .setCheck('Number');
        this.appendStatementInput('DO')
            .setCheck(null)
            .appendField('then');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF8C1A');
        this.setTooltip('Runs code if a variable meets a condition');
    }
};

// Variables: List create
Blockly.Blocks['variables_list_create'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('📝 Create list')
            .appendField(new Blockly.FieldTextInput('myList'), 'LIST');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF8C1A');
        this.setTooltip('Creates a new list using NBT data');
    }
};

// Variables: List add
Blockly.Blocks['variables_list_add'] = {
    init: function() {
        this.appendValueInput('VALUE')
            .appendField('➕ Add to list')
            .appendField(new Blockly.FieldTextInput('myList'), 'LIST')
            .appendField('value');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF8C1A');
        this.setTooltip('Adds a value to a list');
    }
};

// Variables: List get
Blockly.Blocks['variables_list_get'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('📋 Item')
            .appendField(new Blockly.FieldNumber(1, 1), 'INDEX')
            .appendField('of list')
            .appendField(new Blockly.FieldTextInput('myList'), 'LIST');
        this.setOutput(true, 'String');
        this.setColour('#FF8C1A');
        this.setTooltip('Gets an item from a list by index');
    }
};

// Variables: List length
Blockly.Blocks['variables_list_length'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('📏 Length of list')
            .appendField(new Blockly.FieldTextInput('myList'), 'LIST');
        this.setOutput(true, 'Number');
        this.setColour('#FF8C1A');
        this.setTooltip('Returns the length of a list');
    }
};

// Variables: List contains
Blockly.Blocks['variables_list_contains'] = {
    init: function() {
        this.appendValueInput('VALUE')
            .appendField('List')
            .appendField(new Blockly.FieldTextInput('myList'), 'LIST')
            .appendField('contains');
        this.setOutput(true, 'Boolean');
        this.setColour('#FF8C1A');
        this.setTooltip('Checks if a list contains a value');
    }
};
