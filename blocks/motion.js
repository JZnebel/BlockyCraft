// Motion blocks - Player movement and positioning

// Motion: Move forward
Blockly.Blocks['motion_move_forward'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🏃 Move forward')
            .appendField(new Blockly.FieldNumber(5, 0.1, 100), 'DISTANCE')
            .appendField('blocks');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4A90E2');
        this.setTooltip('Moves the player forward in the direction they are facing');
    }
};

// Motion: Teleport to coordinates
Blockly.Blocks['motion_teleport'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('📍 Teleport to x:')
            .appendField(new Blockly.FieldNumber(0, -30000000, 30000000), 'X')
            .appendField('y:')
            .appendField(new Blockly.FieldNumber(64, -64, 320), 'Y')
            .appendField('z:')
            .appendField(new Blockly.FieldNumber(0, -30000000, 30000000), 'Z');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4A90E2');
        this.setTooltip('Teleports the player to specific coordinates');
    }
};

// Motion: Rotate player
Blockly.Blocks['motion_rotate'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🔄 Rotate')
            .appendField(new Blockly.FieldDropdown([
                ['↑ North', '180'],
                ['→ East', '-90'],
                ['↓ South', '0'],
                ['← West', '90']
            ]), 'DIRECTION');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4A90E2');
        this.setTooltip('Rotates the player to face a cardinal direction');
    }
};

// Motion: Launch player
Blockly.Blocks['motion_launch'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🚀 Launch player')
            .appendField('power:')
            .appendField(new Blockly.FieldNumber(2, 0.1, 10), 'POWER')
            .appendField(new Blockly.FieldDropdown([
                ['⬆️ Up', 'up'],
                ['➡️ Forward', 'forward'],
                ['⬅️ Backward', 'backward']
            ]), 'DIRECTION');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4A90E2');
        this.setTooltip('Launches the player in a direction with velocity');
    }
};

// Motion: Set position
Blockly.Blocks['motion_set_x'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('Set')
            .appendField(new Blockly.FieldDropdown([
                ['x', 'x'],
                ['y', 'y'],
                ['z', 'z']
            ]), 'AXIS')
            .appendField('to')
            .appendField(new Blockly.FieldNumber(0), 'VALUE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4A90E2');
        this.setTooltip('Sets one coordinate while keeping others the same');
    }
};

// Motion: Change position
Blockly.Blocks['motion_change_x'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('Change')
            .appendField(new Blockly.FieldDropdown([
                ['x', 'x'],
                ['y', 'y'],
                ['z', 'z']
            ]), 'AXIS')
            .appendField('by')
            .appendField(new Blockly.FieldNumber(10), 'VALUE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4A90E2');
        this.setTooltip('Changes one coordinate by adding a value');
    }
};

// Motion: Get position (reporter block)
Blockly.Blocks['motion_get_position'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                ['x position', 'x'],
                ['y position', 'y'],
                ['z position', 'z']
            ]), 'AXIS');
        this.setOutput(true, 'Number');
        this.setColour('#4A90E2');
        this.setTooltip('Returns the player\'s position on an axis');
    }
};
