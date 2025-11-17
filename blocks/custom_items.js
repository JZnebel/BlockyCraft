// Helper function to create recipe dropdown fields dynamically
function createRecipeDropdown(fieldName) {
    return new Blockly.FieldDropdown(MINECRAFT_ITEMS, null);
}

// Custom Items: Define custom items
Blockly.Blocks['custom_item_define'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🎨 Create Custom Item:')
            .appendField(new Blockly.FieldTextInput('Magic Wand', this.validateItemName), 'ITEM_NAME');
        this.appendDummyInput()
            .appendField('Texture source:')
            .appendField(new Blockly.FieldDropdown([
                ['🤖 AI Generate', 'ai'],
                ['📁 Upload File', 'upload']
            ], this.onTextureSourceChange.bind(this)), 'TEXTURE_SOURCE');
        this.appendDummyInput('AI_TEXTURE_INPUT')
            .appendField('🤖 AI Description:')
            .appendField(new Blockly.FieldTextInput('glowing purple wand with stars'), 'TEXTURE_DESCRIPTION');
        this.appendDummyInput('UPLOAD_BUTTON_INPUT')
            .appendField('📁 Upload PNG:')
            .appendField(new Blockly.FieldLabelSerializable('(click to upload)'), 'UPLOAD_STATUS')
            .setVisible(false);
        this.appendDummyInput()
            .appendField('Fallback texture')
            .appendField(new Blockly.FieldDropdown([
                ['🪵 Stick', 'minecraft:stick'],
                ['💎 Diamond', 'minecraft:diamond'],
                ['🥇 Gold Ingot', 'minecraft:gold_ingot'],
                ['⚙️ Iron Ingot', 'minecraft:iron_ingot'],
                ['🪨 Stone', 'minecraft:stone'],
                ['🪶 Feather', 'minecraft:feather'],
                ['🔮 Ender Pearl', 'minecraft:ender_pearl'],
                ['🌟 Nether Star', 'minecraft:nether_star'],
                ['⚔️ Diamond Sword', 'minecraft:diamond_sword'],
                ['🏹 Bow', 'minecraft:bow'],
                ['🛡️ Shield', 'minecraft:shield']
            ]), 'BASE_ITEM');
        this.appendDummyInput()
            .appendField('Color/Rarity')
            .appendField(new Blockly.FieldDropdown([
                ['⚪ White/Common', 'COMMON'],
                ['🟢 Green/Uncommon', 'UNCOMMON'],
                ['🔵 Blue/Rare', 'RARE'],
                ['🟣 Purple/Epic', 'EPIC']
            ]), 'RARITY');
        this.appendDummyInput()
            .appendField('Stack up to')
            .appendField(new Blockly.FieldNumber(1, 1, 64), 'MAX_STACK');
        this.appendDummyInput()
            .appendField('📦 Crafting Recipe (3x3 grid, optional)');
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
        this.setTooltip('Creates a custom item with AI-generated or uploaded texture and optional crafting recipe');
        this.setHelpUrl('');

        // Store uploaded texture data
        this.uploadedTextureData = null;

        // Setup click handler after a short delay to ensure DOM is ready
        setTimeout(() => this.addUploadClickHandler(), 100);
    },
    saveExtraState: function() {
        // Save the uploaded texture data
        return {
            uploadedTexture: this.uploadedTextureData
        };
    },
    loadExtraState: function(state) {
        // Restore the uploaded texture data
        this.uploadedTextureData = state.uploadedTexture || null;
        if (this.uploadedTextureData) {
            this.setFieldValue('✅ Texture loaded', 'UPLOAD_STATUS');
        }
        // Re-add click handler after loading
        setTimeout(() => this.addUploadClickHandler(), 100);
    },
    validateItemName: function(newValue) {
        // Only allow letters, numbers, spaces
        newValue = newValue.replace(/[^a-zA-Z0-9 ]/g, '');
        // Limit length
        if (newValue.length > 30) {
            newValue = newValue.substring(0, 30);
        }
        return newValue || 'Custom Item';
    },
    onTextureSourceChange: function(newValue) {
        const aiInput = this.getInput('AI_TEXTURE_INPUT');
        const uploadInput = this.getInput('UPLOAD_BUTTON_INPUT');

        if (newValue === 'ai') {
            aiInput.setVisible(true);
            uploadInput.setVisible(false);
        } else {
            aiInput.setVisible(false);
            uploadInput.setVisible(true);
        }
    },
    addUploadClickHandler: function() {
        // Find the upload status field and make it clickable
        const uploadField = this.getField('UPLOAD_STATUS');
        if (uploadField && uploadField.fieldGroup_) {
            uploadField.fieldGroup_.style.cursor = 'pointer';
            // Remove old handler if it exists
            uploadField.fieldGroup_.onclick = null;
            uploadField.fieldGroup_.onclick = (e) => {
                e.stopPropagation();
                this.openFileUpload();
            };
        } else {
            // Try again after a short delay if not ready
            setTimeout(() => this.addUploadClickHandler(), 100);
        }
    },
    openFileUpload: function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/png';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.uploadedTextureData = event.target.result;
                    this.setFieldValue('✅ ' + file.name, 'UPLOAD_STATUS');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }
};

// Custom Items: When player uses custom item
Blockly.Blocks['custom_item_use'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('⚡ When player right-clicks')
            .appendField(new Blockly.FieldTextInput('Magic Wand'), 'ITEM_NAME');
        this.appendStatementInput('ACTIONS')
            .setCheck(null)
            .appendField('do:');
        this.setColour('#E91E63');
        this.setTooltip('Runs when player right-clicks your custom item');
        this.setHelpUrl('');
    }
};

// Custom Items: Give custom item
Blockly.Blocks['custom_item_give'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🎁 Give player custom item')
            .appendField(new Blockly.FieldTextInput('Magic Wand'), 'ITEM_NAME')
            .appendField('x')
            .appendField(new Blockly.FieldNumber(1, 1, 64), 'AMOUNT');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#E91E63');
        this.setTooltip('Gives the player your custom item');
        this.setHelpUrl('');
    }
};

// Custom Item Actions: Shoot projectile
Blockly.Blocks['custom_action_projectile'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🏹 Shoot')
            .appendField(new Blockly.FieldDropdown([
                ['🔥 Fireball', 'fireball'],
                ['❄️ Snowball', 'snowball'],
                ['🏹 Arrow', 'arrow'],
                ['🧪 Potion', 'potion'],
                ['🔱 Trident', 'trident'],
                ['⚡ Wither Skull', 'wither_skull']
            ]), 'PROJECTILE')
            .appendField('Speed')
            .appendField(new Blockly.FieldNumber(1.5, 0.1, 5, 0.1), 'SPEED');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#E91E63');
        this.setTooltip('Shoots a projectile in the direction player is looking');
        this.setHelpUrl('');
    }
};

// Custom Item Actions: Create particle effect
Blockly.Blocks['custom_action_particles'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('✨ Spawn particles')
            .appendField(new Blockly.FieldDropdown([
                ['✨ Magic', 'enchant'],
                ['❤️ Hearts', 'heart'],
                ['🔥 Flames', 'flame'],
                ['💨 Smoke', 'smoke'],
                ['⭐ Stars', 'crit'],
                ['💧 Water', 'drip_water'],
                ['🌈 Portal', 'portal'],
                ['⚡ Electric', 'electric_spark']
            ]), 'PARTICLE')
            .appendField('Amount')
            .appendField(new Blockly.FieldNumber(20, 1, 100), 'COUNT');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#E91E63');
        this.setTooltip('Creates a particle effect at the player');
        this.setHelpUrl('');
    }
};

// Custom Item Actions: Area effect
Blockly.Blocks['custom_action_area_effect'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('💫 Area Effect')
            .appendField(new Blockly.FieldDropdown([
                ['💨 Push Away', 'push'],
                ['🧲 Pull Closer', 'pull'],
                ['💥 Damage', 'damage'],
                ['💚 Heal', 'heal'],
                ['🔥 Ignite', 'ignite'],
                ['❄️ Freeze', 'freeze']
            ]), 'EFFECT')
            .appendField('Radius')
            .appendField(new Blockly.FieldNumber(5, 1, 20), 'RADIUS')
            .appendField('Power')
            .appendField(new Blockly.FieldNumber(1, 1, 10), 'POWER');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#E91E63');
        this.setTooltip('Affects all entities in a radius around the player');
        this.setHelpUrl('');
    }
};

// Custom Item Actions: Teleport to target
Blockly.Blocks['custom_action_teleport_look'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🎯 Teleport to where you\'re looking')
            .appendField('Max distance')
            .appendField(new Blockly.FieldNumber(20, 1, 100), 'DISTANCE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#E91E63');
        this.setTooltip('Teleports player to the block they\'re looking at');
        this.setHelpUrl('');
    }
};
