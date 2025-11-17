// Sensing blocks - Detect player state and environment

// Sensing: Is sneaking
Blockly.Blocks['sensing_is_sneaking'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('👁️ is sneaking?');
        this.setOutput(true, 'Boolean');
        this.setColour('#4ECDC4');
        this.setTooltip('Returns true if player is sneaking');
    }
};

// Sensing: Is in water
Blockly.Blocks['sensing_is_in_water'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('💧 is in water?');
        this.setOutput(true, 'Boolean');
        this.setColour('#4ECDC4');
        this.setTooltip('Returns true if player is submerged in water');
    }
};

// Sensing: Is on fire
Blockly.Blocks['sensing_is_on_fire'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🔥 is on fire?');
        this.setOutput(true, 'Boolean');
        this.setColour('#4ECDC4');
        this.setTooltip('Returns true if player is burning');
    }
};

// Sensing: Is on ground
Blockly.Blocks['sensing_is_on_ground'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('⬇️ is on ground?');
        this.setOutput(true, 'Boolean');
        this.setColour('#4ECDC4');
        this.setTooltip('Returns true if player is standing on a block');
    }
};

// Sensing: Is sprinting
Blockly.Blocks['sensing_is_sprinting'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🏃 is sprinting?');
        this.setOutput(true, 'Boolean');
        this.setColour('#4ECDC4');
        this.setTooltip('Returns true if player is sprinting');
    }
};

// Sensing: Is flying
Blockly.Blocks['sensing_is_flying'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🕊️ is flying?');
        this.setOutput(true, 'Boolean');
        this.setColour('#4ECDC4');
        this.setTooltip('Returns true if player is in creative flight mode');
    }
};

// Sensing: Get health
Blockly.Blocks['sensing_get_health'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('❤️ health');
        this.setOutput(true, 'Number');
        this.setColour('#4ECDC4');
        this.setTooltip('Returns player\'s current health (0-20)');
    }
};

// Sensing: Get hunger
Blockly.Blocks['sensing_get_hunger'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🍖 hunger');
        this.setOutput(true, 'Number');
        this.setColour('#4ECDC4');
        this.setTooltip('Returns player\'s hunger level (0-20)');
    }
};

// Sensing: Get gamemode
Blockly.Blocks['sensing_get_gamemode'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🎮 gamemode');
        this.setOutput(true, 'String');
        this.setColour('#4ECDC4');
        this.setTooltip('Returns player\'s current gamemode');
    }
};

// Sensing: Is holding item
Blockly.Blocks['sensing_is_holding'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('✋ is holding')
            .appendField(new Blockly.FieldDropdown([
                ['Diamond Sword', 'minecraft:diamond_sword'],
                ['Stick', 'minecraft:stick'],
                ['Dirt', 'minecraft:dirt'],
                ['Stone', 'minecraft:stone'],
                ['Oak Log', 'minecraft:oak_log'],
                ['Any Item', 'any']
            ]), 'ITEM')
            .appendField('?');
        this.setOutput(true, 'Boolean');
        this.setColour('#4ECDC4');
        this.setTooltip('Returns true if player is holding the specified item');
    }
};

// Sensing: Block at position
Blockly.Blocks['sensing_block_at'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🧱 block at')
            .appendField(new Blockly.FieldDropdown([
                ['Feet', 'feet'],
                ['Head', 'head'],
                ['Below', 'below'],
                ['Above', 'above'],
                ['North', 'north'],
                ['South', 'south'],
                ['East', 'east'],
                ['West', 'west']
            ]), 'POSITION');
        this.setOutput(true, 'String');
        this.setColour('#4ECDC4');
        this.setTooltip('Returns the block type at a position relative to player');
    }
};

// Sensing: Nearby entity count
Blockly.Blocks['sensing_nearby_entities'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🔍 count nearby')
            .appendField(new Blockly.FieldDropdown([
                ['All Entities', 'all'],
                ['Players', 'player'],
                ['Animals', 'animal'],
                ['Monsters', 'monster'],
                ['Items', 'item']
            ]), 'TYPE')
            .appendField('within')
            .appendField(new Blockly.FieldNumber(10, 1, 100), 'RANGE')
            .appendField('blocks');
        this.setOutput(true, 'Number');
        this.setColour('#4ECDC4');
        this.setTooltip('Counts nearby entities of a specific type');
    }
};

// Sensing: Time of day
Blockly.Blocks['sensing_time_of_day'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🕐 time of day');
        this.setOutput(true, 'Number');
        this.setColour('#4ECDC4');
        this.setTooltip('Returns the current time of day (0-24000)');
    }
};

// Sensing: Is day/night
Blockly.Blocks['sensing_is_day'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('☀️ is')
            .appendField(new Blockly.FieldDropdown([
                ['Day', 'day'],
                ['Night', 'night']
            ]), 'TIME')
            .appendField('?');
        this.setOutput(true, 'Boolean');
        this.setColour('#4ECDC4');
        this.setTooltip('Returns true if it\'s day or night');
    }
};

// Sensing: Is raining
Blockly.Blocks['sensing_is_raining'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🌧️ is raining?');
        this.setOutput(true, 'Boolean');
        this.setColour('#4ECDC4');
        this.setTooltip('Returns true if it\'s raining');
    }
};

// Sensing: Player name
Blockly.Blocks['sensing_player_name'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('👤 player name');
        this.setOutput(true, 'String');
        this.setColour('#4ECDC4');
        this.setTooltip('Returns the player\'s username');
    }
};
