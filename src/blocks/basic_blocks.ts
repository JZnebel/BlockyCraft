import * as Blockly from 'blockly';

// Logic blocks
export const logicBoolean = {
  init: function (this: Blockly.Block) {
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldDropdown([
          ['true', 'TRUE'],
          ['false', 'FALSE'],
        ]),
        'BOOL'
      );
    this.setOutput(true, 'Boolean');
    this.setColour('#5C81F4');
    this.setTooltip('Returns true or false');
    this.setHelpUrl('');
  },
};

export const logicCompare = {
  init: function (this: Blockly.Block) {
    this.appendValueInput('A').setCheck(null);
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ['=', 'EQ'],
        ['≠', 'NEQ'],
        ['<', 'LT'],
        ['≤', 'LTE'],
        ['>', 'GT'],
        ['≥', 'GTE'],
      ]),
      'OP'
    );
    this.appendValueInput('B').setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, 'Boolean');
    this.setColour('#5C81F4');
    this.setTooltip('Compare two values');
    this.setHelpUrl('');
  },
};

export const logicOperation = {
  init: function (this: Blockly.Block) {
    this.appendValueInput('A').setCheck('Boolean');
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ['and', 'AND'],
        ['or', 'OR'],
      ]),
      'OP'
    );
    this.appendValueInput('B').setCheck('Boolean');
    this.setInputsInline(true);
    this.setOutput(true, 'Boolean');
    this.setColour('#5C81F4');
    this.setTooltip('Combine two boolean values');
    this.setHelpUrl('');
  },
};

export const logicNot = {
  init: function (this: Blockly.Block) {
    this.appendValueInput('BOOL')
      .setCheck('Boolean')
      .appendField('not');
    this.setOutput(true, 'Boolean');
    this.setColour('#5C81F4');
    this.setTooltip('Returns the opposite of the input');
    this.setHelpUrl('');
  },
};

export const controlsIf = {
  init: function (this: Blockly.Block) {
    this.appendValueInput('IF0')
      .setCheck('Boolean')
      .appendField('if');
    this.appendStatementInput('DO0').appendField('then');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#5C81F4');
    this.setTooltip('If a value is true, then do some statements');
    this.setHelpUrl('');
  },
};

// Loop blocks
export const repeatTimes = {
  init: function (this: Blockly.Block) {
    this.appendValueInput('TIMES')
      .setCheck('Number')
      .appendField('repeat');
    this.appendDummyInput()
      .appendField('times');
    this.appendStatementInput('DO')
      .appendField('do');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#5C81F4');
    this.setTooltip('Repeat actions a specific number of times');
  },
};

export const repeatForever = {
  init: function (this: Blockly.Block) {
    this.appendDummyInput()
      .appendField('repeat forever');
    this.appendStatementInput('DO')
      .appendField('do');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#5C81F4');
    this.setTooltip('Repeat actions forever');
  },
};

// Math blocks
export const mathNumber = {
  init: function (this: Blockly.Block) {
    this.appendDummyInput().appendField(
      new Blockly.FieldNumber(0),
      'NUM'
    );
    this.setOutput(true, 'Number');
    this.setColour('#59C059');
    this.setTooltip('A number');
    this.setHelpUrl('');
  },
};

export const mathArithmetic = {
  init: function (this: Blockly.Block) {
    this.appendValueInput('A').setCheck('Number');
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ['+', 'ADD'],
        ['-', 'MINUS'],
        ['×', 'MULTIPLY'],
        ['÷', 'DIVIDE'],
      ]),
      'OP'
    );
    this.appendValueInput('B').setCheck('Number');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour('#59C059');
    this.setTooltip('Math operations');
    this.setHelpUrl('');
  },
};

// Text blocks
export const textBlock = {
  init: function (this: Blockly.Block) {
    this.appendDummyInput().appendField(
      new Blockly.FieldTextInput(''),
      'TEXT'
    );
    this.setOutput(true, 'String');
    this.setColour('#FF8C1A');
    this.setTooltip('A text value');
    this.setHelpUrl('');
  },
};

// Variable blocks - using Blockly's built-in variable system
export const variablesGet = {
  init: function (this: Blockly.Block) {
    this.appendDummyInput().appendField(
      new Blockly.FieldVariable('variable'),
      'VAR'
    );
    this.setOutput(true, null);
    this.setColour('#FF8C1A');
    this.setTooltip('Get the value of a variable');
    this.setHelpUrl('');
  },
};

export const variablesSet = {
  init: function (this: Blockly.Block) {
    this.appendValueInput('VALUE')
      .setCheck(null)
      .appendField('set')
      .appendField(new Blockly.FieldVariable('variable'), 'VAR')
      .appendField('to');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#FF8C1A');
    this.setTooltip('Set a variable to a value');
    this.setHelpUrl('');
  },
};

// Register all blocks
export function registerBasicBlocks(): void {
  // Logic blocks
  Blockly.Blocks['logic_boolean'] = logicBoolean;
  Blockly.Blocks['logic_compare'] = logicCompare;
  Blockly.Blocks['logic_operation'] = logicOperation;
  Blockly.Blocks['logic_not'] = logicNot;
  Blockly.Blocks['controls_if'] = controlsIf;

  // Loop blocks
  Blockly.Blocks['repeat_times'] = repeatTimes;
  Blockly.Blocks['repeat_forever'] = repeatForever;

  // Math blocks
  Blockly.Blocks['math_number'] = mathNumber;
  Blockly.Blocks['math_arithmetic'] = mathArithmetic;

  // Text blocks
  Blockly.Blocks['text'] = textBlock;

  // Variable blocks
  Blockly.Blocks['variables_get'] = variablesGet;
  Blockly.Blocks['variables_set'] = variablesSet;
}
