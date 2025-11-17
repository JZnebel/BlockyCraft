// World: Place block
Blockly.Blocks['world_place_block'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🧱 Place')
            .appendField(new Blockly.FieldDropdown([
                ['💎 Diamond Block', 'minecraft:diamond_block'],
                ['🥇 Gold Block', 'minecraft:gold_block'],
                ['💚 Emerald Block', 'minecraft:emerald_block'],
                ['💣 TNT', 'minecraft:tnt'],
                ['🪟 Glass', 'minecraft:glass'],
                ['⬛ Obsidian', 'minecraft:obsidian'],
                ['✨ Glowstone', 'minecraft:glowstone'],
                ['🧊 Ice', 'minecraft:ice'],
                ['🌸 Flower', 'minecraft:poppy']
            ]), 'BLOCK')
            .appendField('at player');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#10B981');
        this.setTooltip('Places a block at the player\'s location');
        this.setHelpUrl('');
    }
};

// World: Set time
Blockly.Blocks['world_time'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🌞 Set time to')
            .appendField(new Blockly.FieldDropdown([
                ['Day ☀️', '1000'],
                ['Noon', '6000'],
                ['Sunset 🌅', '12000'],
                ['Night 🌙', '18000'],
                ['Midnight', '18000']
            ]), 'TIME');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#10B981');
        this.setTooltip('Changes the time of day');
        this.setHelpUrl('');
    }
};

// World: Set weather
Blockly.Blocks['world_weather'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('⛅ Set weather to')
            .appendField(new Blockly.FieldDropdown([
                ['Clear ☀️', 'clear'],
                ['Rain 🌧️', 'rain'],
                ['Thunder ⚡', 'thunder']
            ]), 'WEATHER');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#10B981');
        this.setTooltip('Changes the weather');
        this.setHelpUrl('');
    }
};

// World: Create explosion
Blockly.Blocks['world_explosion'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('💥 Create explosion at player')
            .appendField(new Blockly.FieldDropdown([
                ['💨 Small', '1'],
                ['💥 Medium', '3'],
                ['🔥 Large', '5'],
                ['💣 Huge', '8']
            ]), 'POWER');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#10B981');
        this.setTooltip('Creates an explosion at the player\'s location');
        this.setHelpUrl('');
    }
};

// World: Spawn entity
Blockly.Blocks['world_spawn_entity'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🐑 Spawn')
            .appendField(new Blockly.FieldDropdown([
                ['🐑 Sheep', 'sheep'],
                ['🐄 Cow', 'cow'],
                ['🐷 Pig', 'pig'],
                ['🐔 Chicken', 'chicken'],
                ['🐺 Wolf', 'wolf'],
                ['🐱 Cat', 'cat'],
                ['🐴 Horse', 'horse'],
                ['🦙 Llama', 'llama'],
                ['🐰 Rabbit', 'rabbit'],
                ['🐢 Turtle', 'turtle'],
                ['🐸 Frog', 'frog'],
                ['🐝 Bee', 'bee'],
                ['🧟 Zombie', 'zombie'],
                ['💀 Skeleton', 'skeleton'],
                ['🕷️ Spider', 'spider'],
                ['🧨 Creeper', 'creeper'],
                ['👻 Phantom', 'phantom'],
                ['🔥 Blaze', 'blaze']
            ]), 'ENTITY')
            .appendField('at player');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#10B981');
        this.setTooltip('Spawns an entity at the player\'s location');
        this.setHelpUrl('');
    }
};

// World: Make entity follow player
Blockly.Blocks['world_entity_follow'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('💚 Make nearby')
            .appendField(new Blockly.FieldDropdown([
                ['🐑 Sheep', 'sheep'],
                ['🐄 Cows', 'cow'],
                ['🐷 Pigs', 'pig'],
                ['🐔 Chickens', 'chicken'],
                ['🐺 Wolves', 'wolf'],
                ['🐱 Cats', 'cat'],
                ['🐴 Horses', 'horse'],
                ['All Animals', 'all_animals'],
                ['All Mobs', 'all_mobs']
            ]), 'ENTITY')
            .appendField('follow player')
            .appendField('(range')
            .appendField(new Blockly.FieldNumber(10, 1, 50), 'RANGE')
            .appendField('blocks)');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#10B981');
        this.setTooltip('Makes nearby entities follow the player');
        this.setHelpUrl('');
    }
};

// World: Make entity attack
Blockly.Blocks['world_entity_attack'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('⚔️ Make nearby')
            .appendField(new Blockly.FieldDropdown([
                ['🐺 Wolves', 'wolf'],
                ['🧟 Zombies', 'zombie'],
                ['💀 Skeletons', 'skeleton'],
                ['🕷️ Spiders', 'spider'],
                ['All Mobs', 'all_mobs']
            ]), 'ENTITY')
            .appendField('attack player')
            .appendField('(range')
            .appendField(new Blockly.FieldNumber(10, 1, 50), 'RANGE')
            .appendField('blocks)');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#10B981');
        this.setTooltip('Makes nearby entities target the player');
        this.setHelpUrl('');
    }
};

// World: Make entity tame
Blockly.Blocks['world_entity_tame'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('💝 Tame nearby')
            .appendField(new Blockly.FieldDropdown([
                ['🐺 Wolves', 'wolf'],
                ['🐱 Cats', 'cat'],
                ['🐴 Horses', 'horse'],
                ['🦙 Llamas', 'llama'],
                ['🦜 Parrots', 'parrot']
            ]), 'ENTITY')
            .appendField('(range')
            .appendField(new Blockly.FieldNumber(10, 1, 50), 'RANGE')
            .appendField('blocks)');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#10B981');
        this.setTooltip('Tames nearby tameable entities');
        this.setHelpUrl('');
    }
};
