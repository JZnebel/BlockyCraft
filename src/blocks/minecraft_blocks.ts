import * as Blockly from 'blockly';
import { FieldImageDropdown } from './field_image_dropdown';
import { ALL_ITEMS, ALL_BLOCKS, ALL_ENTITIES } from './minecraft_options';

/**
 * Minecraft gameplay blocks
 * Combines player, world, motion, sensing, looks, and sound blocks
 */

export function registerMinecraftBlocks(): void {
  // ======================
  // PLAYER BLOCKS (Keeping just health - others moved to appropriate categories)
  // ======================

  // Player: Set health
  Blockly.Blocks['player_health'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Set player health to')
        .appendField(new Blockly.FieldNumber(20, 1, 20), 'HEALTH')
        .appendField('hearts');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#3B82F6');
      this.setTooltip('Sets the player\'s health (max 20)');
      this.setHelpUrl('');
    }
  };

  // Player: Apply effect
  Blockly.Blocks['player_effect'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Give player')
        .appendField(new Blockly.FieldDropdown([
          ['Speed', 'speed'],
          ['Jump Boost', 'jump_boost'],
          ['Strength', 'strength'],
          ['Regeneration', 'regeneration'],
          ['Fire Resistance', 'fire_resistance'],
          ['Water Breathing', 'water_breathing'],
          ['Night Vision', 'night_vision'],
          ['Invisibility', 'invisibility'],
          ['Glowing', 'glowing'],
          ['Slow Falling', 'slow_falling']
        ]), 'EFFECT')
        .appendField('for')
        .appendField(new Blockly.FieldNumber(30, 1, 300), 'DURATION')
        .appendField('seconds');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#3B82F6');
      this.setTooltip('Gives the player a potion effect');
      this.setHelpUrl('');
    }
  };

  // ======================
  // WORLD BLOCKS
  // ======================

  // World: Place block
  Blockly.Blocks['world_place_block'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Place')
        .appendField(FieldImageDropdown.createBlockDropdown(ALL_BLOCKS), 'BLOCK')
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
        .appendField('Set time to')
        .appendField(new Blockly.FieldDropdown([
          ['Day', '1000'],
          ['Noon', '6000'],
          ['Sunset', '12000'],
          ['Night', '18000'],
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
        .appendField('Set weather to')
        .appendField(new Blockly.FieldDropdown([
          ['Clear', 'clear'],
          ['Rain', 'rain'],
          ['Thunder', 'thunder']
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
        .appendField('Create explosion at player')
        .appendField(new Blockly.FieldDropdown([
          ['Small', '1'],
          ['Medium', '3'],
          ['Large', '5'],
          ['Huge', '8']
        ]), 'POWER');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#10B981');
      this.setTooltip('Creates an explosion at the player\'s location');
      this.setHelpUrl('');
    }
  };

  // World: Strike lightning
  Blockly.Blocks['world_lightning'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Strike lightning at player');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#10B981');
      this.setTooltip('Strikes lightning at the player\'s location');
      this.setHelpUrl('');
    }
  };

  // World: Fill area with blocks
  Blockly.Blocks['world_fill'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Fill')
        .appendField(new Blockly.FieldNumber(5, 1, 20), 'SIZE')
        .appendField('blocks around player with')
        .appendField(FieldImageDropdown.createBlockDropdown(ALL_BLOCKS), 'BLOCK');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#10B981');
      this.setTooltip('Fills an area around the player with a block type');
      this.setHelpUrl('');
    }
  };

  // World: Spawn entity
  Blockly.Blocks['world_spawn_entity'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Spawn')
        .appendField(FieldImageDropdown.createMobDropdown(ALL_ENTITIES), 'ENTITY')
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
        .appendField('Make nearby')
        .appendField(FieldImageDropdown.createMobDropdown(ALL_ENTITIES), 'ENTITY')
        .appendField('follow player for')
        .appendField(new Blockly.FieldNumber(10, 1, 60), 'DURATION')
        .appendField('seconds (range')
        .appendField(new Blockly.FieldNumber(10, 1, 50), 'RANGE')
        .appendField('blocks)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#10B981');
      this.setTooltip('Makes nearby entities follow the player for a duration');
      this.setHelpUrl('');
    }
  };

  // World: Make entity attack
  Blockly.Blocks['world_entity_attack'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Make nearby')
        .appendField(FieldImageDropdown.createMobDropdown(ALL_ENTITIES), 'ENTITY')
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
        .appendField('Tame nearby')
        .appendField(FieldImageDropdown.createMobDropdown(ALL_ENTITIES), 'ENTITY')
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

  // ======================
  // MOTION BLOCKS
  // ======================

  // Motion: Move forward
  Blockly.Blocks['motion_move_forward'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Move forward')
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
        .appendField('Teleport to x:')
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

  // Motion: Teleport forward
  Blockly.Blocks['motion_teleport_forward'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Teleport')
        .appendField(new Blockly.FieldNumber(10, 1, 100), 'DISTANCE')
        .appendField('blocks forward');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4A90E2');
      this.setTooltip('Teleport forward in the direction you\'re facing');
    }
  };

  // Motion: Teleport up/down
  Blockly.Blocks['motion_teleport_vertical'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Teleport')
        .appendField(new Blockly.FieldNumber(10, 1, 100), 'DISTANCE')
        .appendField('blocks')
        .appendField(new Blockly.FieldDropdown([
          ['up', 'UP'],
          ['down', 'DOWN']
        ]), 'DIRECTION');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4A90E2');
      this.setTooltip('Teleport straight up or down');
    }
  };

  // Motion: Teleport to spawn
  Blockly.Blocks['motion_teleport_spawn'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Teleport to spawn');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4A90E2');
      this.setTooltip('Teleport back to the world spawn point');
    }
  };

  // Motion: Rotate player
  Blockly.Blocks['motion_rotate'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Rotate')
        .appendField(new Blockly.FieldDropdown([
          ['North', '180'],
          ['East', '-90'],
          ['South', '0'],
          ['West', '90']
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
        .appendField('Launch player')
        .appendField('power:')
        .appendField(new Blockly.FieldNumber(2, 0.1, 10), 'POWER')
        .appendField(new Blockly.FieldDropdown([
          ['Up', 'up'],
          ['Forward', 'forward'],
          ['Backward', 'backward']
        ]), 'DIRECTION');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4A90E2');
      this.setTooltip('Launches the player in a direction with velocity');
    }
  };

  // ======================
  // SENSING BLOCKS
  // ======================

  // Sensing: Is sneaking
  Blockly.Blocks['sensing_is_sneaking'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('is sneaking?');
      this.setOutput(true, 'Boolean');
      this.setColour('#4ECDC4');
      this.setTooltip('Returns true if player is sneaking');
    }
  };

  // Sensing: Is in water
  Blockly.Blocks['sensing_is_in_water'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('is in water?');
      this.setOutput(true, 'Boolean');
      this.setColour('#4ECDC4');
      this.setTooltip('Returns true if player is submerged in water');
    }
  };

  // Sensing: Is on fire
  Blockly.Blocks['sensing_is_on_fire'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('is on fire?');
      this.setOutput(true, 'Boolean');
      this.setColour('#4ECDC4');
      this.setTooltip('Returns true if player is burning');
    }
  };

  // Sensing: Is on ground
  Blockly.Blocks['sensing_is_on_ground'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('is on ground?');
      this.setOutput(true, 'Boolean');
      this.setColour('#4ECDC4');
      this.setTooltip('Returns true if player is standing on a block');
    }
  };

  // Sensing: Is sprinting
  Blockly.Blocks['sensing_is_sprinting'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('is sprinting?');
      this.setOutput(true, 'Boolean');
      this.setColour('#4ECDC4');
      this.setTooltip('Returns true if player is sprinting');
    }
  };

  // Sensing: Is flying
  Blockly.Blocks['sensing_is_flying'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('is flying?');
      this.setOutput(true, 'Boolean');
      this.setColour('#4ECDC4');
      this.setTooltip('Returns true if player is in creative flight mode');
    }
  };

  // Sensing: Get health
  Blockly.Blocks['sensing_get_health'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('health');
      this.setOutput(true, 'Number');
      this.setColour('#4ECDC4');
      this.setTooltip('Returns player\'s current health (0-20)');
    }
  };

  // Sensing: Get hunger
  Blockly.Blocks['sensing_get_hunger'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('hunger');
      this.setOutput(true, 'Number');
      this.setColour('#4ECDC4');
      this.setTooltip('Returns player\'s hunger level (0-20)');
    }
  };

  // Sensing: Get gamemode
  Blockly.Blocks['sensing_get_gamemode'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('gamemode');
      this.setOutput(true, 'String');
      this.setColour('#4ECDC4');
      this.setTooltip('Returns player\'s current gamemode');
    }
  };

  // Sensing: Is holding item
  Blockly.Blocks['sensing_is_holding'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('is holding')
        .appendField(FieldImageDropdown.createItemDropdown(ALL_ITEMS), 'ITEM')
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
        .appendField('block at')
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
        .appendField('count nearby')
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
        .appendField('time of day');
      this.setOutput(true, 'Number');
      this.setColour('#4ECDC4');
      this.setTooltip('Returns the current time of day (0-24000)');
    }
  };

  // Sensing: Is day/night
  Blockly.Blocks['sensing_is_day'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('is')
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
        .appendField('is raining?');
      this.setOutput(true, 'Boolean');
      this.setColour('#4ECDC4');
      this.setTooltip('Returns true if it\'s raining');
    }
  };

  // Sensing: Player name
  Blockly.Blocks['sensing_player_name'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('player name');
      this.setOutput(true, 'String');
      this.setColour('#4ECDC4');
      this.setTooltip('Returns the player\'s username');
    }
  };

  // ======================
  // LOOKS BLOCKS
  // ======================

  // Looks: Show message
  Blockly.Blocks['looks_message'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Say')
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
        .appendField('Show title')
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
        .appendField('Show subtitle')
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
        .appendField('Show action bar')
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
        .appendField('Spawn')
        .appendField(new Blockly.FieldDropdown([
          ['Hearts', 'heart'],
          ['Magic', 'enchant'],
          ['Happy Villager', 'happy_villager'],
          ['Explosion', 'explosion'],
          ['Flame', 'flame'],
          ['Cloud', 'cloud'],
          ['Sparkle', 'end_rod'],
          ['Water Drop', 'dripping_water'],
          ['Portal', 'portal'],
          ['Critical', 'crit'],
          ['Enchantment', 'enchanted_hit'],
          ['Firework', 'firework']
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

  // Looks: Clear effects
  Blockly.Blocks['looks_clear_effects'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Clear all effects');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#9966FF');
      this.setTooltip('Removes all potion effects from the player');
    }
  };

  // ======================
  // SOUND BLOCKS
  // ======================

  // Sound: Play sound
  Blockly.Blocks['sound_play'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Play sound')
        .appendField(new Blockly.FieldDropdown([
          ['Note - Pling', 'block.note_block.pling'],
          ['Note - Guitar', 'block.note_block.guitar'],
          ['Note - Piano', 'block.note_block.harp'],
          ['Note - Bass Drum', 'block.note_block.basedrum'],
          ['Note - Bell', 'block.note_block.bell'],
          ['Sword Swing', 'entity.player.attack.sweep'],
          ['Explosion', 'entity.generic.explode'],
          ['Fire', 'block.fire.ambient'],
          ['Water Splash', 'entity.generic.splash'],
          ['Lightning', 'entity.lightning_bolt.thunder'],
          ['Level Up', 'entity.player.levelup'],
          ['Firework Launch', 'entity.firework_rocket.launch'],
          ['Firework Blast', 'entity.firework_rocket.blast'],
          ['Villager Yes', 'entity.villager.yes'],
          ['Villager No', 'entity.villager.no'],
          ['Horse Neigh', 'entity.horse.ambient'],
          ['Wolf Bark', 'entity.wolf.ambient'],
          ['Cat Meow', 'entity.cat.ambient'],
          ['Chicken', 'entity.chicken.ambient'],
          ['Cow Moo', 'entity.cow.ambient'],
          ['Pig Oink', 'entity.pig.ambient'],
          ['Sheep Baa', 'entity.sheep.ambient'],
          ['Zombie', 'entity.zombie.ambient'],
          ['Skeleton', 'entity.skeleton.ambient'],
          ['Creeper Hiss', 'entity.creeper.primed'],
          ['Spider', 'entity.spider.ambient'],
          ['Arrow Shoot', 'entity.arrow.shoot'],
          ['Experience Orb', 'entity.experience_orb.pickup'],
          ['Chest Open', 'block.chest.open'],
          ['Door Open', 'block.wooden_door.open'],
          ['Anvil Use', 'block.anvil.use'],
          ['Stone Break', 'block.stone.break'],
          ['Wood Break', 'block.wood.break'],
          ['Grass Step', 'block.grass.step']
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
        .appendField('Play music disc')
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
}
