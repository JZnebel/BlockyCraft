import * as Blockly from 'blockly';

// Block Display: Spawn AI-generated model
export const spawnBlockDisplayModel = {
  init: function (this: Blockly.Block) {
    this.appendDummyInput()
      .appendField('Spawn AI model at player')
      .appendField(new Blockly.FieldTextInput('model_id'), 'MODEL_ID');
    this.setPreviousStatement(true, 'Action');
    this.setNextStatement(true, 'Action');
    this.setColour('#9C27B0');
    this.setTooltip('Spawns an AI-generated block display model at the player location');
    this.setHelpUrl('');
  },
};

// Register all block display blocks
export function registerBlockDisplayBlocks(): void {
  Blockly.Blocks['spawn_block_display_model'] = spawnBlockDisplayModel;
}
