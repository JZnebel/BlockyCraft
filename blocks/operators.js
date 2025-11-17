// Operators blocks - Math, comparison, and logic operations

// Operators: Add/subtract
Blockly.Blocks['operators_math'] = {
    init: function() {
        this.appendValueInput('A')
            .setCheck('Number');
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                ['+', '+'],
                ['-', '-'],
                ['×', '*'],
                ['÷', '/'],
                ['mod', '%']
            ]), 'OP');
        this.appendValueInput('B')
            .setCheck('Number');
        this.setInputsInline(true);
        this.setOutput(true, 'Number');
        this.setColour('#40BF4A');
        this.setTooltip('Performs a math operation on two numbers');
    }
};

// Operators: Random number
Blockly.Blocks['operators_random'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🎲 random from')
            .appendField(new Blockly.FieldNumber(1), 'FROM')
            .appendField('to')
            .appendField(new Blockly.FieldNumber(10), 'TO');
        this.setOutput(true, 'Number');
        this.setColour('#40BF4A');
        this.setTooltip('Returns a random number between two values');
    }
};

// Operators: Comparison
Blockly.Blocks['operators_compare'] = {
    init: function() {
        this.appendValueInput('A');
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                ['=', '=='],
                ['≠', '!='],
                ['<', '<'],
                ['>', '>'],
                ['≤', '<='],
                ['≥', '>=']
            ]), 'OP');
        this.appendValueInput('B');
        this.setInputsInline(true);
        this.setOutput(true, 'Boolean');
        this.setColour('#40BF4A');
        this.setTooltip('Compares two values');
    }
};

// Operators: And/Or
Blockly.Blocks['operators_and_or'] = {
    init: function() {
        this.appendValueInput('A')
            .setCheck('Boolean');
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                ['and', 'and'],
                ['or', 'or']
            ]), 'OP');
        this.appendValueInput('B')
            .setCheck('Boolean');
        this.setInputsInline(true);
        this.setOutput(true, 'Boolean');
        this.setColour('#40BF4A');
        this.setTooltip('Combines two boolean values');
    }
};

// Operators: Not
Blockly.Blocks['operators_not'] = {
    init: function() {
        this.appendValueInput('BOOL')
            .setCheck('Boolean')
            .appendField('not');
        this.setOutput(true, 'Boolean');
        this.setColour('#40BF4A');
        this.setTooltip('Inverts a boolean value');
    }
};

// Operators: Join text
Blockly.Blocks['operators_join'] = {
    init: function() {
        this.appendValueInput('A')
            .setCheck('String')
            .appendField('join');
        this.appendValueInput('B')
            .setCheck('String');
        this.setInputsInline(true);
        this.setOutput(true, 'String');
        this.setColour('#40BF4A');
        this.setTooltip('Joins two strings together');
    }
};

// Operators: String contains
Blockly.Blocks['operators_contains'] = {
    init: function() {
        this.appendValueInput('STRING')
            .setCheck('String');
        this.appendDummyInput()
            .appendField('contains');
        this.appendValueInput('SUBSTRING')
            .setCheck('String');
        this.setInputsInline(true);
        this.setOutput(true, 'Boolean');
        this.setColour('#40BF4A');
        this.setTooltip('Checks if a string contains another string');
    }
};

// Operators: Length of string
Blockly.Blocks['operators_length'] = {
    init: function() {
        this.appendValueInput('STRING')
            .setCheck('String')
            .appendField('length of');
        this.setOutput(true, 'Number');
        this.setColour('#40BF4A');
        this.setTooltip('Returns the length of a string');
    }
};

// Operators: Round
Blockly.Blocks['operators_round'] = {
    init: function() {
        this.appendValueInput('NUM')
            .setCheck('Number')
            .appendField('round');
        this.setOutput(true, 'Number');
        this.setColour('#40BF4A');
        this.setTooltip('Rounds a number to the nearest integer');
    }
};

// Operators: Math function
Blockly.Blocks['operators_mathop'] = {
    init: function() {
        this.appendValueInput('NUM')
            .setCheck('Number')
            .appendField(new Blockly.FieldDropdown([
                ['abs', 'abs'],
                ['floor', 'floor'],
                ['ceiling', 'ceil'],
                ['sqrt', 'sqrt'],
                ['sin', 'sin'],
                ['cos', 'cos'],
                ['tan', 'tan']
            ]), 'OP');
        this.setOutput(true, 'Number');
        this.setColour('#40BF4A');
        this.setTooltip('Performs a math function');
    }
};

// Operators: Number literal
Blockly.Blocks['operators_number'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(0), 'NUM');
        this.setOutput(true, 'Number');
        this.setColour('#40BF4A');
        this.setTooltip('A number value');
    }
};

// Operators: Text literal
Blockly.Blocks['operators_text'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldTextInput('hello'), 'TEXT');
        this.setOutput(true, 'String');
        this.setColour('#40BF4A');
        this.setTooltip('A text value');
    }
};

// Operators: Boolean literal
Blockly.Blocks['operators_boolean'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                ['true', 'true'],
                ['false', 'false']
            ]), 'BOOL');
        this.setOutput(true, 'Boolean');
        this.setColour('#40BF4A');
        this.setTooltip('A boolean value');
    }
};
