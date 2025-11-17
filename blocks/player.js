// Player: Teleport
Blockly.Blocks['player_teleport'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('📍 Teleport player to X:')
            .appendField(new Blockly.FieldNumber(0, -30000000, 30000000), 'X')
            .appendField('Y:')
            .appendField(new Blockly.FieldNumber(100, -64, 320), 'Y')
            .appendField('Z:')
            .appendField(new Blockly.FieldNumber(0, -30000000, 30000000), 'Z');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3B82F6');
        this.setTooltip('Teleports the player to specific coordinates');
        this.setHelpUrl('');
    }
};

// Player: Give effect
Blockly.Blocks['player_effect'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('✨ Give player effect')
            .appendField(new Blockly.FieldDropdown([
                ['💨 Speed', 'SPEED'],
                ['🦘 Jump Boost', 'JUMP_BOOST'],
                ['💚 Regeneration', 'REGENERATION'],
                ['🌙 Night Vision', 'NIGHT_VISION'],
                ['👻 Invisibility', 'INVISIBILITY'],
                ['✨ Glowing', 'GLOWING'],
                ['🪶 Slow Falling', 'SLOW_FALLING'],
                ['🔥 Fire Resistance', 'FIRE_RESISTANCE'],
                ['💪 Strength', 'STRENGTH']
            ]), 'EFFECT')
            .appendField('for')
            .appendField(new Blockly.FieldNumber(10, 1, 600), 'DURATION')
            .appendField('seconds');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3B82F6');
        this.setTooltip('Gives the player a potion effect');
        this.setHelpUrl('');
    }
};

// Player: Set gamemode
Blockly.Blocks['player_gamemode'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🎮 Set player gamemode to')
            .appendField(new Blockly.FieldDropdown([
                ['Survival', 'SURVIVAL'],
                ['Creative', 'CREATIVE'],
                ['Adventure', 'ADVENTURE'],
                ['Spectator', 'SPECTATOR']
            ]), 'GAMEMODE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3B82F6');
        this.setTooltip('Changes the player\'s gamemode');
        this.setHelpUrl('');
    }
};

// Player: Set health
Blockly.Blocks['player_health'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('❤️ Set player health to')
            .appendField(new Blockly.FieldNumber(20, 1, 20), 'HEALTH')
            .appendField('hearts');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3B82F6');
        this.setTooltip('Sets the player\'s health (max 20)');
        this.setHelpUrl('');
    }
};
