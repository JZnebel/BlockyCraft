// Action: Display message
Blockly.Blocks['action_message'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('💬 Display message')
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
            .appendField('🐷 Spawn')
            .appendField(new Blockly.FieldDropdown([
                ['🐷 Pig', 'minecraft:pig'],
                ['🐮 Cow', 'minecraft:cow'],
                ['🐔 Chicken', 'minecraft:chicken'],
                ['🐑 Sheep', 'minecraft:sheep'],
                ['⚡ Lightning', 'minecraft:lightning_bolt'],
                ['💣 Creeper', 'minecraft:creeper'],
                ['🧟 Zombie', 'minecraft:zombie'],
                ['🕷️ Spider', 'minecraft:spider'],
                ['💀 Skeleton', 'minecraft:skeleton'],
                ['🐴 Horse', 'minecraft:horse'],
                ['🐺 Wolf', 'minecraft:wolf'],
                ['🐱 Cat', 'minecraft:cat']
            ]), 'MOB')
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
            .appendField('🎁 Give player')
            .appendField(new Blockly.FieldNumber(1, 1, 64), 'AMOUNT')
            .appendField(new Blockly.FieldDropdown([
                ['💎 Diamond', 'minecraft:diamond'],
                ['🥇 Gold Ingot', 'minecraft:gold_ingot'],
                ['⚙️ Iron Ingot', 'minecraft:iron_ingot'],
                ['💚 Emerald', 'minecraft:emerald'],
                ['🍪 Cookie', 'minecraft:cookie'],
                ['🎂 Cake', 'minecraft:cake'],
                ['🍎 Apple', 'minecraft:apple'],
                ['🥖 Bread', 'minecraft:bread'],
                ['⚔️ Diamond Sword', 'minecraft:diamond_sword'],
                ['🛡️ Shield', 'minecraft:shield']
            ]), 'ITEM');
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
            .appendField('🔊 Play sound')
            .appendField(new Blockly.FieldDropdown([
                ['Thunder ⚡', 'entity.lightning_bolt.thunder'],
                ['Ding! 🔔', 'block.note_block.bell'],
                ['Explosion 💥', 'entity.generic.explode'],
                ['Level Up ✨', 'entity.player.levelup'],
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
            .appendField('📺 Show BIG title')
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
            .appendField('📊 Show action bar')
            .appendField(new Blockly.FieldTextInput('Watch out!'), 'TEXT');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4CAF50');
        this.setTooltip('Shows text above the hotbar');
        this.setHelpUrl('');
    }
};
