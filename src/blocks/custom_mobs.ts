import * as Blockly from 'blockly';
import { createMediaDropdown } from './media_dropdown';

// Extended block interface for custom properties
interface CustomMobBlock extends Blockly.Block {
  validateMobName(name: string): string;
}

// Custom Mobs: Define custom billboard/sprite entities
export const customMobDefine = {
  init: function (this: CustomMobBlock) {
    this.appendDummyInput()
      .appendField('Create Custom Mob:')
      .appendField(
        new Blockly.FieldTextInput('Dinosaur', this.validateMobName.bind(this)),
        'MOB_NAME'
      );
    this.appendDummyInput()
      .appendField('Custom Texture:')
      .appendField(createMediaDropdown(), 'MEDIA_TEXTURE');
    this.appendDummyInput()
      .appendField('Health')
      .appendField(new Blockly.FieldNumber(20, 1, 100), 'HEALTH');
    this.appendDummyInput()
      .appendField('Size (blocks)')
      .appendField(new Blockly.FieldNumber(1, 0.5, 5, 0.25), 'SIZE');
    this.appendDummyInput()
      .appendField('Movement speed')
      .appendField(
        new Blockly.FieldDropdown([
          ['Very Slow', '0.15'],
          ['Slow', '0.25'],
          ['Normal', '0.35'],
          ['Fast', '0.5'],
          ['Very Fast', '0.7'],
        ]),
        'SPEED'
      );
    this.appendDummyInput()
      .appendField('Behavior')
      .appendField(
        new Blockly.FieldDropdown([
          ['Passive (like pig)', 'PASSIVE'],
          ['Neutral (like wolf)', 'NEUTRAL'],
          ['Hostile (like zombie)', 'HOSTILE'],
        ]),
        'BEHAVIOR'
      );
    this.setColour('#9C27B0');
    this.setTooltip('Create a custom mob using a 2D sprite texture from Media Library');
    this.setHelpUrl('');
  },

  validateMobName: function (this: CustomMobBlock, name: string): string {
    // Remove special characters, keep only letters, numbers, and spaces
    return name.replace(/[^a-zA-Z0-9 ]/g, '');
  },
};

// Custom Mobs: Spawn a custom mob
export const customMobSpawn = {
  init: function (this: Blockly.Block) {
    this.appendDummyInput()
      .appendField('Spawn')
      .appendField(new Blockly.FieldTextInput('Dinosaur'), 'MOB_NAME')
      .appendField('near player');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#9C27B0');
    this.setTooltip('Spawn a custom mob near the player');
    this.setHelpUrl('');
  },
};

// Register all blocks
export function registerCustomMobBlocks(): void {
  Blockly.Blocks['custom_mob_define'] = customMobDefine;
  Blockly.Blocks['custom_mob_spawn'] = customMobSpawn;
}
