// Looks blocks - Visual effects and displays

// Looks: Show message
Blockly.Blocks['looks_message'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('💬 Say')
            .appendField(new Blockly.FieldTextInput('Hello!'), 'MESSAGE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9966FF');
        this.setTooltip('Sends a chat message to the player');
    }
};

// Looks: Show title
Blockly.Blocks['looks_title'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('📺 Show title')
            .appendField(new Blockly.FieldTextInput('Welcome!'), 'TITLE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9966FF');
        this.setTooltip('Shows a large title on screen');
    }
};

// Looks: Show subtitle
Blockly.Blocks['looks_subtitle'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('📝 Show subtitle')
            .appendField(new Blockly.FieldTextInput('Subtitle text'), 'SUBTITLE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9966FF');
        this.setTooltip('Shows a subtitle below the title');
    }
};

// Looks: Show action bar
Blockly.Blocks['looks_actionbar'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('📊 Show action bar')
            .appendField(new Blockly.FieldTextInput('Action text'), 'TEXT');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9966FF');
        this.setTooltip('Shows text above the hotbar');
    }
};

// Looks: Spawn particles
Blockly.Blocks['looks_particles'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('✨ Spawn')
            .appendField(new Blockly.FieldDropdown([
                ['❤️ Hearts', 'heart'],
                ['✨ Magic', 'enchant'],
                ['💚 Happy Villager', 'happy_villager'],
                ['💥 Explosion', 'explosion'],
                ['🔥 Flame', 'flame'],
                ['💨 Cloud', 'cloud'],
                ['🌟 Sparkle', 'end_rod'],
                ['💧 Water Drop', 'dripping_water'],
                ['🌈 Portal', 'portal'],
                ['⭐ Critical', 'crit'],
                ['💫 Enchantment', 'enchanted_hit'],
                ['🎆 Firework', 'firework']
            ]), 'PARTICLE')
            .appendField('particles')
            .appendField('count:')
            .appendField(new Blockly.FieldNumber(10, 1, 100), 'COUNT');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9966FF');
        this.setTooltip('Spawns particle effects at player location');
    }
};

// Looks: Player effect
Blockly.Blocks['looks_effect'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🌟 Apply effect')
            .appendField(new Blockly.FieldDropdown([
                ['Speed', 'SPEED'],
                ['Slowness', 'SLOWNESS'],
                ['Jump Boost', 'JUMP_BOOST'],
                ['Regeneration', 'REGENERATION'],
                ['Strength', 'STRENGTH'],
                ['Invisibility', 'INVISIBILITY'],
                ['Glowing', 'GLOWING'],
                ['Night Vision', 'NIGHT_VISION'],
                ['Fire Resistance', 'FIRE_RESISTANCE'],
                ['Water Breathing', 'WATER_BREATHING'],
                ['Levitation', 'LEVITATION'],
                ['Slow Falling', 'SLOW_FALLING']
            ]), 'EFFECT')
            .appendField('for')
            .appendField(new Blockly.FieldNumber(10, 1, 1000), 'DURATION')
            .appendField('seconds');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9966FF');
        this.setTooltip('Applies a potion effect to the player');
    }
};

// Looks: Clear effects
Blockly.Blocks['looks_clear_effects'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🧹 Clear all effects');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9966FF');
        this.setTooltip('Removes all potion effects from the player');
    }
};

// Looks: Set display name
Blockly.Blocks['looks_display_name'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🏷️ Set display name to')
            .appendField(new Blockly.FieldTextInput('[ADMIN] Player'), 'NAME');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9966FF');
        this.setTooltip('Changes the player\'s display name');
    }
};

// Looks: Set gamemode
Blockly.Blocks['looks_gamemode'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🎮 Set gamemode to')
            .appendField(new Blockly.FieldDropdown([
                ['Survival', 'SURVIVAL'],
                ['Creative', 'CREATIVE'],
                ['Adventure', 'ADVENTURE'],
                ['Spectator', 'SPECTATOR']
            ]), 'GAMEMODE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9966FF');
        this.setTooltip('Changes the player\'s gamemode');
    }
};

// Looks: Set skin layer
Blockly.Blocks['looks_skin_layer'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('👕 Set skin layer')
            .appendField(new Blockly.FieldDropdown([
                ['Show All', 'show_all'],
                ['Hide Cape', 'hide_cape'],
                ['Hide Jacket', 'hide_jacket'],
                ['Hide Hat', 'hide_hat']
            ]), 'LAYER');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9966FF');
        this.setTooltip('Controls which skin layers are visible');
    }
};
