import * as Blockly from 'blockly';

/**
 * Register all advanced AI model blocks
 */
export function registerAIModelAdvancedBlocks(): void {
  // Blocks are registered automatically by Blockly when defined
  // This function is called to ensure the module is imported
}

// Spawn AI model with rotation and position control
Blockly.Blocks['spawn_ai_model_rotated'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Spawn AI model')
      .appendField(new Blockly.FieldTextInput('model_id'), 'MODEL_ID');
    this.appendDummyInput()
      .appendField('facing')
      .appendField(new Blockly.FieldDropdown([
        ['North (0°)', '0'],
        ['East (90°)', '90'],
        ['South (180°)', '180'],
        ['West (270°)', '270'],
        ['Custom angle', 'custom']
      ]), 'DIRECTION')
      .appendField(new Blockly.FieldNumber(0, -360, 360), 'YAW')
      .appendField('°');
    this.appendDummyInput()
      .appendField('at')
      .appendField(new Blockly.FieldDropdown([
        ['player position', 'PLAYER'],
        ['blocks in front', 'FRONT'],
        ['where looking', 'LOOKING'],
        ['blocks above', 'ABOVE'],
        ['custom offset', 'OFFSET']
      ]), 'POSITION_TYPE');
    this.appendDummyInput()
      .appendField(new Blockly.FieldNumber(3, 0, 50), 'DISTANCE')
      .appendField('blocks');
    this.setInputsInline(false);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('Spawn a model with rotation and position control');
    this.setHelpUrl('');
  }
};

// Spawn spinning AI model
Blockly.Blocks['spawn_ai_model_spinning'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Spawn AI model')
      .appendField(new Blockly.FieldTextInput('model_id'), 'MODEL_ID');
    this.appendDummyInput()
      .appendField('spinning for')
      .appendField(new Blockly.FieldNumber(10, 1, 60), 'DURATION')
      .appendField('seconds');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('Spawn an AI model that rotates continuously - works with any size model!');
    this.setHelpUrl('');
  }
};

// Spawn AI model following player
Blockly.Blocks['spawn_ai_model_following'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Spawn AI model')
      .appendField(new Blockly.FieldTextInput('model_id'), 'MODEL_ID');
    this.appendDummyInput()
      .appendField('following player for')
      .appendField(new Blockly.FieldNumber(10, 1, 60), 'DURATION')
      .appendField('seconds');
    this.appendDummyInput()
      .appendField('at distance')
      .appendField(new Blockly.FieldNumber(3, 1, 20), 'DISTANCE');
    this.setInputsInline(false);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('Spawn an AI model that follows the player');
    this.setHelpUrl('');
  }
};

// Spawn AI model scaled with position control
Blockly.Blocks['spawn_ai_model_scaled'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Spawn AI model')
      .appendField(new Blockly.FieldTextInput('model_id'), 'MODEL_ID');
    this.appendDummyInput()
      .appendField('scaled')
      .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), 'SCALE')
      .appendField('x size');
    this.appendDummyInput()
      .appendField('at')
      .appendField(new Blockly.FieldDropdown([
        ['player position', 'PLAYER'],
        ['blocks in front', 'FRONT'],
        ['where looking', 'LOOKING'],
        ['blocks above', 'ABOVE'],
        ['custom offset', 'OFFSET']
      ]), 'POSITION_TYPE');
    this.appendDummyInput()
      .appendField(new Blockly.FieldNumber(3, 0, 50), 'DISTANCE')
      .appendField('blocks');
    this.setInputsInline(false);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('Spawn an AI model with position and scale control');
    this.setHelpUrl('');
  }
};

// Spawn AI model orbiting player
Blockly.Blocks['spawn_ai_model_orbiting'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Spawn AI model')
      .appendField(new Blockly.FieldTextInput('model_id'), 'MODEL_ID');
    this.appendDummyInput()
      .appendField('orbiting player');
    this.appendDummyInput()
      .appendField('radius')
      .appendField(new Blockly.FieldNumber(3, 1, 10), 'RADIUS')
      .appendField('for')
      .appendField(new Blockly.FieldNumber(10, 1, 60), 'DURATION')
      .appendField('sec');
    this.setInputsInline(false);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('Spawn an AI model that orbits around the player');
    this.setHelpUrl('');
  }
};

// Spawn multiple models in circle
Blockly.Blocks['spawn_ai_model_circle'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Spawn')
      .appendField(new Blockly.FieldNumber(5, 3, 20), 'COUNT')
      .appendField('AI models');
    this.appendDummyInput()
      .appendField(new Blockly.FieldTextInput('model_id'), 'MODEL_ID');
    this.appendDummyInput()
      .appendField('in circle, radius')
      .appendField(new Blockly.FieldNumber(5, 1, 20), 'RADIUS');
    this.setInputsInline(false);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('Spawn multiple copies of a model in a circle around you');
    this.setHelpUrl('');
  }
};
