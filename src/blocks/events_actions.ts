import * as Blockly from 'blockly';
import { FieldImageDropdown } from './field_image_dropdown';
import { ALL_ITEMS, ALL_BLOCKS, ALL_ENTITIES } from './minecraft_options';

/**
 * Event and Action blocks for Minecraft automation
 * Combined events (triggers) and actions (responses)
 */

export function registerEventActionBlocks(): void {
  // ======================
  // EVENT BLOCKS (Triggers)
  // ======================

  // Event: When player runs command
  Blockly.Blocks['event_command'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('When player types /')
        .appendField(new Blockly.FieldTextInput('hello', this.validateCommand), 'COMMAND');
      this.appendStatementInput('ACTIONS')
        .setCheck(null)
        .appendField('do:');
      this.setColour('#9C27B0');
      this.setTooltip('Runs when a player types this command');
      this.setHelpUrl('');
    },
    validateCommand: function(newValue: string): string {
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
        .appendField('When player right-clicks')
        .appendField(FieldImageDropdown.createItemDropdown(ALL_ITEMS), 'ITEM');
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
        .appendField('When player breaks')
        .appendField(FieldImageDropdown.createBlockDropdown(ALL_BLOCKS), 'BLOCK');
      this.appendStatementInput('ACTIONS')
        .setCheck(null)
        .appendField('do:');
      this.setColour('#9C27B0');
      this.setTooltip('Runs when player breaks this type of block');
      this.setHelpUrl('');
    }
  };

  // ======================
  // ACTION BLOCKS (Responses)
  // ======================

  // Action: Display message
  Blockly.Blocks['action_message'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Display message')
        .appendField(new Blockly.FieldTextInput('Hello!'), 'MESSAGE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4CAF50');
      this.setTooltip('Shows a message in chat');
      this.setHelpUrl('');
    }
  };

  // Action: Spawn mob
  Blockly.Blocks['action_spawn_mob'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Spawn')
        .appendField(FieldImageDropdown.createMobDropdown(ALL_ENTITIES), 'MOB')
        .appendField('at player');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4CAF50');
      this.setTooltip('Spawns a mob at the player location');
      this.setHelpUrl('');
    }
  };

  // Action: Give item
  Blockly.Blocks['action_give_item'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Give player')
        .appendField(new Blockly.FieldNumber(1, 1, 64), 'AMOUNT')
        .appendField(FieldImageDropdown.createItemDropdown(ALL_ITEMS), 'ITEM');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4CAF50');
      this.setTooltip('Gives items to the player');
      this.setHelpUrl('');
    }
  };

  // Action: Play sound
  Blockly.Blocks['action_play_sound'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Play sound')
        .appendField(new Blockly.FieldDropdown([
          ['Thunder', 'entity.lightning_bolt.thunder'],
          ['Ding!', 'block.note_block.bell'],
          ['Explosion', 'entity.generic.explode'],
          ['Level Up', 'entity.player.levelup'],
          ['Ender Dragon', 'entity.ender_dragon.growl']
        ]), 'SOUND');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4CAF50');
      this.setTooltip('Plays a sound effect');
      this.setHelpUrl('');
    }
  };

  // Action: Show title
  Blockly.Blocks['action_title'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Show BIG title')
        .appendField(new Blockly.FieldTextInput('Hello!'), 'TITLE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4CAF50');
      this.setTooltip('Shows a big title on player\'s screen');
      this.setHelpUrl('');
    }
  };

  // Action: Show action bar
  Blockly.Blocks['action_actionbar'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Show action bar')
        .appendField(new Blockly.FieldTextInput('Watch out!'), 'TEXT');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4CAF50');
      this.setTooltip('Shows text above the hotbar');
      this.setHelpUrl('');
    }
  };
}
