// Sound blocks - Play sounds and music

// Sound: Play sound
Blockly.Blocks['sound_play'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🔊 Play sound')
            .appendField(new Blockly.FieldDropdown([
                ['🎵 Note - Pling', 'block.note_block.pling'],
                ['🎸 Note - Guitar', 'block.note_block.guitar'],
                ['🎹 Note - Piano', 'block.note_block.harp'],
                ['🥁 Note - Bass Drum', 'block.note_block.basedrum'],
                ['📢 Note - Bell', 'block.note_block.bell'],
                ['⚔️ Sword Swing', 'entity.player.attack.sweep'],
                ['💥 Explosion', 'entity.generic.explode'],
                ['🔥 Fire', 'block.fire.ambient'],
                ['🪣 Water Splash', 'entity.generic.splash'],
                ['⚡ Lightning', 'entity.lightning_bolt.thunder'],
                ['✨ Level Up', 'entity.player.levelup'],
                ['🎆 Firework Launch', 'entity.firework_rocket.launch'],
                ['🎇 Firework Blast', 'entity.firework_rocket.blast'],
                ['🔔 Villager Yes', 'entity.villager.yes'],
                ['❌ Villager No', 'entity.villager.no'],
                ['🐴 Horse Neigh', 'entity.horse.ambient'],
                ['🐺 Wolf Bark', 'entity.wolf.ambient'],
                ['🐱 Cat Meow', 'entity.cat.ambient'],
                ['🐔 Chicken', 'entity.chicken.ambient'],
                ['🐄 Cow Moo', 'entity.cow.ambient'],
                ['🐷 Pig Oink', 'entity.pig.ambient'],
                ['🐑 Sheep Baa', 'entity.sheep.ambient'],
                ['🧟 Zombie', 'entity.zombie.ambient'],
                ['💀 Skeleton', 'entity.skeleton.ambient'],
                ['🧨 Creeper Hiss', 'entity.creeper.primed'],
                ['🕷️ Spider', 'entity.spider.ambient'],
                ['🏹 Arrow Shoot', 'entity.arrow.shoot'],
                ['💎 Experience Orb', 'entity.experience_orb.pickup'],
                ['📦 Chest Open', 'block.chest.open'],
                ['🚪 Door Open', 'block.wooden_door.open'],
                ['🔨 Anvil Use', 'block.anvil.use'],
                ['⛏️ Stone Break', 'block.stone.break'],
                ['🌳 Wood Break', 'block.wood.break'],
                ['🌱 Grass Step', 'block.grass.step']
            ]), 'SOUND')
            .appendField('volume')
            .appendField(new Blockly.FieldNumber(1.0, 0.0, 2.0, 0.1), 'VOLUME')
            .appendField('pitch')
            .appendField(new Blockly.FieldNumber(1.0, 0.5, 2.0, 0.1), 'PITCH');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#CF63CF');
        this.setTooltip('Plays a sound effect at the player\'s location');
    }
};

// Sound: Play music disc
Blockly.Blocks['sound_music_disc'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🎵 Play music disc')
            .appendField(new Blockly.FieldDropdown([
                ['13', 'music_disc.13'],
                ['Cat', 'music_disc.cat'],
                ['Blocks', 'music_disc.blocks'],
                ['Chirp', 'music_disc.chirp'],
                ['Far', 'music_disc.far'],
                ['Mall', 'music_disc.mall'],
                ['Mellohi', 'music_disc.mellohi'],
                ['Stal', 'music_disc.stal'],
                ['Strad', 'music_disc.strad'],
                ['Ward', 'music_disc.ward'],
                ['Wait', 'music_disc.wait'],
                ['Pigstep', 'music_disc.pigstep'],
                ['Otherside', 'music_disc.otherside']
            ]), 'DISC');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#CF63CF');
        this.setTooltip('Plays a Minecraft music disc');
    }
};

// Sound: Stop all sounds
Blockly.Blocks['sound_stop_all'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🔇 Stop all sounds');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#CF63CF');
        this.setTooltip('Stops all currently playing sounds');
    }
};

// Sound: Play ambient sound
Blockly.Blocks['sound_ambient'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🌍 Play ambient')
            .appendField(new Blockly.FieldDropdown([
                ['Cave Sounds', 'ambient.cave'],
                ['Nether Portal', 'block.portal.ambient'],
                ['Underwater', 'ambient.underwater.loop'],
                ['Rain', 'weather.rain'],
                ['Thunder', 'entity.lightning_bolt.thunder'],
                ['Ocean', 'ambient.underwater.loop.additions'],
                ['Wind', 'item.elytra.flying']
            ]), 'AMBIENT')
            .appendField('volume')
            .appendField(new Blockly.FieldNumber(1.0, 0.0, 2.0, 0.1), 'VOLUME');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#CF63CF');
        this.setTooltip('Plays an ambient background sound');
    }
};

// Sound: Play UI sound
Blockly.Blocks['sound_ui'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🖱️ Play UI sound')
            .appendField(new Blockly.FieldDropdown([
                ['Click', 'ui.button.click'],
                ['Toast', 'ui.toast.in'],
                ['Achievement', 'entity.player.levelup'],
                ['Error', 'block.note_block.bass']
            ]), 'UI_SOUND');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#CF63CF');
        this.setTooltip('Plays a UI feedback sound');
    }
};

// Sound: Play custom sound
Blockly.Blocks['sound_custom'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('🎼 Play custom sound')
            .appendField(new Blockly.FieldTextInput('minecraft:entity.player.attack.strong'), 'SOUND')
            .appendField('volume')
            .appendField(new Blockly.FieldNumber(1.0, 0.0, 2.0, 0.1), 'VOLUME')
            .appendField('pitch')
            .appendField(new Blockly.FieldNumber(1.0, 0.5, 2.0, 0.1), 'PITCH');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#CF63CF');
        this.setTooltip('Plays any Minecraft sound by ID');
    }
};
