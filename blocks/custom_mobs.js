// Custom Mobs: Define custom billboard/sprite entities
Blockly.Blocks['custom_mob_define'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🦖 Create Custom Mob:')
            .appendField(new Blockly.FieldTextInput('Dinosaur', this.validateMobName), 'MOB_NAME');
        this.appendDummyInput()
            .appendField('📁 Upload PNG Texture:')
            .appendField(new Blockly.FieldLabelSerializable('(click to upload)'), 'UPLOAD_STATUS');
        this.appendDummyInput()
            .appendField('Health')
            .appendField(new Blockly.FieldNumber(20, 1, 100), 'HEALTH');
        this.appendDummyInput()
            .appendField('Size (blocks)')
            .appendField(new Blockly.FieldNumber(1, 0.5, 5, 0.25), 'SIZE');
        this.appendDummyInput()
            .appendField('Movement speed')
            .appendField(new Blockly.FieldDropdown([
                ['🐌 Very Slow', '0.15'],
                ['🚶 Slow', '0.25'],
                ['🏃 Normal', '0.35'],
                ['⚡ Fast', '0.5'],
                ['🚀 Very Fast', '0.7']
            ]), 'SPEED');
        this.appendDummyInput()
            .appendField('Behavior')
            .appendField(new Blockly.FieldDropdown([
                ['😊 Passive (like pig)', 'PASSIVE'],
                ['😐 Neutral (like wolf)', 'NEUTRAL'],
                ['😡 Hostile (like zombie)', 'HOSTILE']
            ]), 'BEHAVIOR');
        this.setColour('#4CAF50');
        this.setStyle('custom_mob_blocks');
        this.setTooltip('Create a custom mob using a 2D sprite texture');
        this.setHelpUrl('');

        // Store uploaded texture data
        this.uploadedTextureData = null;

        // Setup click handler after a short delay to ensure DOM is ready
        setTimeout(() => this.addUploadClickHandler(), 100);
    },

    validateMobName: function(name) {
        // Remove special characters, keep only letters, numbers, and spaces
        return name.replace(/[^a-zA-Z0-9 ]/g, '');
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
                    this.setFieldValue('✅ Texture loaded', 'UPLOAD_STATUS');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
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
    }
};

// Custom Mobs: Spawn a custom mob
Blockly.Blocks['custom_mob_spawn'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🦖 Spawn')
            .appendField(new Blockly.FieldTextInput('Dinosaur'), 'MOB_NAME')
            .appendField('near player');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4CAF50');
        this.setStyle('custom_mob_blocks');
        this.setTooltip('Spawn a custom mob near the player');
        this.setHelpUrl('');
    }
};
