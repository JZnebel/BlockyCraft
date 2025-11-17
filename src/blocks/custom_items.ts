import * as Blockly from 'blockly';
import { MINECRAFT_ITEMS, RARITY_OPTIONS } from '@/data/minecraft_items';

// Type definitions for block extra state
interface CustomItemExtraState {
  uploadedTexture: string | null;
}

// Extended block interface for custom properties
interface CustomItemBlock extends Blockly.Block {
  uploadedTextureData: string | null;
  validateItemName(newValue: string): string;
  onTextureSourceChange(newValue: string): string | null;
  addUploadClickHandler(): void;
  openFileUpload(): void;
}

// Helper function to create recipe dropdown fields dynamically
function createRecipeDropdown(): Blockly.FieldDropdown {
  return new Blockly.FieldDropdown(MINECRAFT_ITEMS);
}

// Custom Items: Define custom items
export const customItemDefine = {
  init: function (this: CustomItemBlock) {
    this.appendDummyInput()
      .appendField('Create Custom Item:')
      .appendField(
        new Blockly.FieldTextInput('Magic Wand', this.validateItemName.bind(this)),
        'ITEM_NAME'
      );
    this.appendDummyInput()
      .appendField('Texture source:')
      .appendField(
        new Blockly.FieldDropdown(
          [
            ['AI Generate', 'ai'],
            ['Upload File', 'upload'],
          ],
          this.onTextureSourceChange.bind(this)
        ),
        'TEXTURE_SOURCE'
      );
    this.appendDummyInput('AI_TEXTURE_INPUT')
      .appendField('AI Description:')
      .appendField(
        new Blockly.FieldTextInput('glowing purple wand with stars'),
        'TEXTURE_DESCRIPTION'
      );
    this.appendDummyInput('UPLOAD_BUTTON_INPUT')
      .appendField('Upload PNG:')
      .appendField(
        new Blockly.FieldLabelSerializable('(click to upload)'),
        'UPLOAD_STATUS'
      )
      .setVisible(false);
    this.appendDummyInput()
      .appendField('Fallback texture')
      .appendField(
        new Blockly.FieldDropdown([
          ['Stick', 'minecraft:stick'],
          ['Diamond', 'minecraft:diamond'],
          ['Gold Ingot', 'minecraft:gold_ingot'],
          ['Iron Ingot', 'minecraft:iron_ingot'],
          ['Stone', 'minecraft:stone'],
          ['Feather', 'minecraft:feather'],
          ['Ender Pearl', 'minecraft:ender_pearl'],
          ['Nether Star', 'minecraft:nether_star'],
          ['Diamond Sword', 'minecraft:diamond_sword'],
          ['Bow', 'minecraft:bow'],
          ['Shield', 'minecraft:shield'],
        ]),
        'BASE_ITEM'
      );
    this.appendDummyInput()
      .appendField('Color/Rarity')
      .appendField(new Blockly.FieldDropdown(RARITY_OPTIONS), 'RARITY');
    this.appendDummyInput()
      .appendField('Stack up to')
      .appendField(new Blockly.FieldNumber(1, 1, 64), 'MAX_STACK');
    this.appendDummyInput().appendField('Crafting Recipe (3x3 grid, optional)');
    this.appendDummyInput()
      .appendField(createRecipeDropdown(), 'RECIPE_1')
      .appendField(createRecipeDropdown(), 'RECIPE_2')
      .appendField(createRecipeDropdown(), 'RECIPE_3');
    this.appendDummyInput()
      .appendField(createRecipeDropdown(), 'RECIPE_4')
      .appendField(createRecipeDropdown(), 'RECIPE_5')
      .appendField(createRecipeDropdown(), 'RECIPE_6');
    this.appendDummyInput()
      .appendField(createRecipeDropdown(), 'RECIPE_7')
      .appendField(createRecipeDropdown(), 'RECIPE_8')
      .appendField(createRecipeDropdown(), 'RECIPE_9');
    this.setColour('#E91E63');
    this.setTooltip(
      'Creates a custom item with AI-generated or uploaded texture and optional crafting recipe'
    );
    this.setHelpUrl('');

    // Store uploaded texture data
    this.uploadedTextureData = null;

    // Setup click handler after a short delay to ensure DOM is ready
    setTimeout(() => this.addUploadClickHandler(), 100);
  },

  saveExtraState: function (this: CustomItemBlock): CustomItemExtraState {
    // Save the uploaded texture data
    return {
      uploadedTexture: this.uploadedTextureData || null,
    };
  },

  loadExtraState: function (this: CustomItemBlock, state: CustomItemExtraState) {
    // Restore the uploaded texture data
    this.uploadedTextureData = state.uploadedTexture || null;
    if (this.uploadedTextureData) {
      this.setFieldValue('Texture loaded', 'UPLOAD_STATUS');
    }
    // Re-add click handler after loading
    setTimeout(() => this.addUploadClickHandler(), 100);
  },

  validateItemName: function (this: CustomItemBlock, newValue: string): string {
    // Only allow letters, numbers, spaces
    newValue = newValue.replace(/[^a-zA-Z0-9 ]/g, '');
    // Limit length
    if (newValue.length > 30) {
      newValue = newValue.substring(0, 30);
    }
    return newValue || 'Custom Item';
  },

  onTextureSourceChange: function (this: CustomItemBlock, newValue: string): string | null {
    const aiInput = this.getInput('AI_TEXTURE_INPUT');
    const uploadInput = this.getInput('UPLOAD_BUTTON_INPUT');

    if (newValue === 'ai') {
      aiInput?.setVisible(true);
      uploadInput?.setVisible(false);
    } else {
      aiInput?.setVisible(false);
      uploadInput?.setVisible(true);
    }
    return newValue;
  },

  addUploadClickHandler: function (this: CustomItemBlock) {
    // Find the upload status field and make it clickable
    const uploadField = this.getField('UPLOAD_STATUS') as any;
    if (uploadField && uploadField.fieldGroup_) {
      uploadField.fieldGroup_.style.cursor = 'pointer';
      // Remove old handler if it exists
      uploadField.fieldGroup_.onclick = null;
      uploadField.fieldGroup_.onclick = (e: Event) => {
        e.stopPropagation();
        this.openFileUpload();
      };
    } else {
      // Try again after a short delay if not ready
      setTimeout(() => this.addUploadClickHandler(), 100);
    }
  },

  openFileUpload: function (this: CustomItemBlock) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          this.uploadedTextureData = event.target?.result as string;
          this.setFieldValue(file.name, 'UPLOAD_STATUS');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  },
};

// Custom Items: When player uses custom item
export const customItemUse = {
  init: function (this: Blockly.Block) {
    this.appendDummyInput()
      .appendField('When player right-clicks')
      .appendField(new Blockly.FieldTextInput('Magic Wand'), 'ITEM_NAME');
    this.appendStatementInput('ACTIONS')
      .setCheck(null)
      .appendField('do:');
    this.setColour('#E91E63');
    this.setTooltip('Runs when player right-clicks your custom item');
    this.setHelpUrl('');
  },
};

// Custom Items: Give custom item
export const customItemGive = {
  init: function (this: Blockly.Block) {
    this.appendDummyInput()
      .appendField('Give player custom item')
      .appendField(new Blockly.FieldTextInput('Magic Wand'), 'ITEM_NAME')
      .appendField('x')
      .appendField(new Blockly.FieldNumber(1, 1, 64), 'AMOUNT');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#E91E63');
    this.setTooltip('Gives the player your custom item');
    this.setHelpUrl('');
  },
};

// Custom Item Actions: Shoot projectile
export const customActionProjectile = {
  init: function (this: Blockly.Block) {
    this.appendDummyInput()
      .appendField('Shoot')
      .appendField(
        new Blockly.FieldDropdown([
          ['Fireball', 'fireball'],
          ['Snowball', 'snowball'],
          ['Arrow', 'arrow'],
          ['Potion', 'potion'],
          ['Trident', 'trident'],
          ['Wither Skull', 'wither_skull'],
        ]),
        'PROJECTILE'
      )
      .appendField('Speed')
      .appendField(new Blockly.FieldNumber(1.5, 0.1, 5, 0.1), 'SPEED');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#E91E63');
    this.setTooltip('Shoots a projectile in the direction player is looking');
    this.setHelpUrl('');
  },
};

// Custom Item Actions: Create particle effect
export const customActionParticles = {
  init: function (this: Blockly.Block) {
    this.appendDummyInput()
      .appendField('Spawn particles')
      .appendField(
        new Blockly.FieldDropdown([
          ['Magic', 'enchant'],
          ['Hearts', 'heart'],
          ['Flames', 'flame'],
          ['Smoke', 'smoke'],
          ['Stars', 'crit'],
          ['Water', 'drip_water'],
          ['Portal', 'portal'],
          ['Electric', 'electric_spark'],
        ]),
        'PARTICLE'
      )
      .appendField('Amount')
      .appendField(new Blockly.FieldNumber(20, 1, 100), 'COUNT');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#E91E63');
    this.setTooltip('Creates a particle effect at the player');
    this.setHelpUrl('');
  },
};

// Custom Item Actions: Area effect
export const customActionAreaEffect = {
  init: function (this: Blockly.Block) {
    this.appendDummyInput()
      .appendField('Area Effect')
      .appendField(
        new Blockly.FieldDropdown([
          ['Push Away', 'push'],
          ['Pull Closer', 'pull'],
          ['Damage', 'damage'],
          ['Heal', 'heal'],
          ['Ignite', 'ignite'],
          ['Freeze', 'freeze'],
        ]),
        'EFFECT'
      )
      .appendField('Radius')
      .appendField(new Blockly.FieldNumber(5, 1, 20), 'RADIUS')
      .appendField('Power')
      .appendField(new Blockly.FieldNumber(1, 1, 10), 'POWER');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#E91E63');
    this.setTooltip('Affects all entities in a radius around the player');
    this.setHelpUrl('');
  },
};

// Custom Item Actions: Teleport to target
export const customActionTeleportLook = {
  init: function (this: Blockly.Block) {
    this.appendDummyInput()
      .appendField("Teleport to where you're looking")
      .appendField('Max distance')
      .appendField(new Blockly.FieldNumber(20, 1, 100), 'DISTANCE');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#E91E63');
    this.setTooltip("Teleports player to the block they're looking at");
    this.setHelpUrl('');
  },
};

// Register all blocks
export function registerCustomItemBlocks(): void {
  Blockly.Blocks['custom_item_define'] = customItemDefine;
  Blockly.Blocks['custom_item_use'] = customItemUse;
  Blockly.Blocks['custom_item_give'] = customItemGive;
  Blockly.Blocks['custom_action_projectile'] = customActionProjectile;
  Blockly.Blocks['custom_action_particles'] = customActionParticles;
  Blockly.Blocks['custom_action_area_effect'] = customActionAreaEffect;
  Blockly.Blocks['custom_action_teleport_look'] = customActionTeleportLook;
}
