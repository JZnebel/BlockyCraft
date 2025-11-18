import * as Blockly from 'blockly';

// Example projects to help kids learn (NO EMOJIS - using descriptive names only)
export const EXAMPLE_PROJECTS = [
  // ========== BEGINNER TIER ==========
  {
    name: "Hello Command",
    description: "A simple /hello command that sends a message",
    difficulty: "beginner",
    workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_command" x="20" y="20"><field name="COMMAND">hello</field><statement name="ACTIONS"><block type="action_message"><field name="MESSAGE">Hello from BlocklyCraft!</field></block></statement></block></xml>`
  },
  {
    name: "Super Jump",
    description: "Right-click carrot to get jump boost and launch upward",
    difficulty: "beginner",
    workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_right_click" x="20" y="20"><field name="ITEM">minecraft:carrot</field><statement name="ACTIONS"><block type="player_effect"><field name="EFFECT">jump_boost</field><field name="DURATION">10</field><next><block type="motion_launch"><field name="POWER">2</field><field name="DIRECTION">UP</field></block></next></block></statement></block></xml>`
  },
  {
    name: "Pig Rain",
    description: "Type /pigrain to spawn 20 pigs!",
    difficulty: "beginner",
    workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_command" x="20" y="20"><field name="COMMAND">pigrain</field><statement name="ACTIONS"><block type="action_title"><field name="TITLE">PIG RAIN!</field><next><block type="controls_repeat"><field name="TIMES">20</field><statement name="DO"><block type="action_spawn_mob"><field name="MOB">minecraft:pig</field></block></statement></block></next></block></statement></block></xml>`
  },
  {
    name: "Lucky Dirt",
    description: "Break dirt while sneaking for a 50% chance of diamonds!",
    difficulty: "beginner",
    workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_break_block" x="20" y="20"><field name="BLOCK">minecraft:dirt</field><statement name="ACTIONS"><block type="action_message"><field name="MESSAGE">You got lucky!</field><next><block type="action_give_item"><field name="AMOUNT">5</field><field name="ITEM">minecraft:diamond</field></block></next></block></statement></block></xml>`
  },

  // ========== INTERMEDIATE TIER ==========
  {
    name: "Health Alert",
    description: "Command that checks your health and heals you if low",
    difficulty: "intermediate",
    workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_command" x="20" y="20"><field name="COMMAND">healthcheck</field><statement name="ACTIONS"><block type="controls_if"><mutation else="1"></mutation><value name="IF0"><block type="logic_compare"><field name="OP">LT</field><value name="A"><block type="sensing_get_health"></block></value><value name="B"><block type="math_number"><field name="NUM">10</field></block></value></block></value><statement name="DO0"><block type="player_health"><field name="HEALTH">20</field><next><block type="action_message"><field name="MESSAGE">Healing you!</field></block></next></block></statement><statement name="ELSE"><block type="action_message"><field name="MESSAGE">You're healthy!</field></block></statement></block></statement></block></xml>`
  },
  {
    name: "Underwater Helper",
    description: "Command that detects if you're in water and gives swim effects",
    difficulty: "intermediate",
    workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_command" x="20" y="20"><field name="COMMAND">swim</field><statement name="ACTIONS"><block type="controls_if"><mutation else="1"></mutation><value name="IF0"><block type="sensing_is_in_water"></block></value><statement name="DO0"><block type="player_effect"><field name="EFFECT">water_breathing</field><field name="DURATION">30</field><next><block type="player_effect"><field name="EFFECT">speed</field><field name="DURATION">30</field><next><block type="action_message"><field name="MESSAGE">Swim faster!</field></block></next></block></next></block></statement><statement name="ELSE"><block type="action_message"><field name="MESSAGE">You're not in water!</field></block></statement></block></statement></block></xml>`
  },
  {
    name: "Party Mode",
    description: "Command that changes time, weather, and displays effects",
    difficulty: "intermediate",
    workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_command" x="20" y="20"><field name="COMMAND">party</field><statement name="ACTIONS"><block type="action_title"><field name="TITLE">PARTY TIME!</field><next><block type="world_time"><field name="TIME">6000</field><next><block type="world_weather"><field name="WEATHER">clear</field></block></next></block></next></block></statement></block></xml>`
  },

  // ========== ADVANCED TIER ==========
  {
    name: "Sneaky Teleporter",
    description: "Right-click to teleport forward only if sneaking",
    difficulty: "advanced",
    workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_right_click" x="20" y="20"><field name="ITEM">minecraft:ender_pearl</field><statement name="ACTIONS"><block type="controls_if"><mutation else="1"></mutation><value name="IF0"><block type="sensing_is_sneaking"></block></value><statement name="DO0"><block type="motion_teleport_forward"><field name="DISTANCE">20</field><next><block type="looks_particles"><field name="PARTICLE">portal</field><field name="COUNT">50</field><next><block type="sound_play"><field name="SOUND">entity.enderman.teleport</field></block></next></block></next></block></statement><statement name="ELSE"><block type="looks_particles"><field name="PARTICLE">smoke</field><field name="COUNT">10</field><next><block type="action_message"><field name="MESSAGE">You must be sneaking!</field></block></next></block></statement></block></statement></block></xml>`
  },
  {
    name: "Pet Army",
    description: "Spawn multiple pigs that follow you around",
    difficulty: "advanced",
    workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_command" x="20" y="20"><field name="COMMAND">petarmy</field><statement name="ACTIONS"><block type="action_message"><field name="MESSAGE">Summoning your pet army!</field><next><block type="controls_repeat"><field name="TIMES">5</field><statement name="DO"><block type="world_spawn_entity"><field name="ENTITY">pig</field></block></statement><next><block type="world_entity_follow"><field name="ENTITY">pig</field><field name="RANGE">10</field><field name="DURATION">30</field><next><block type="player_effect"><field name="EFFECT">speed</field><field name="DURATION">30</field></block></next></block></next></block></next></block></statement></block></xml>`
  },
  {
    name: "Magic Wand (Custom Item)",
    description: "Create a custom magic wand that shoots fireballs!",
    difficulty: "advanced",
    workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="custom_item_define" x="20" y="20"><field name="ITEM_NAME">Magic Wand</field><field name="BASE_ITEM">minecraft:stick</field><field name="RARITY">EPIC</field><field name="MAX_STACK">1</field></block><block type="custom_item_use" x="20" y="150"><field name="ITEM_NAME">Magic Wand</field><statement name="ACTIONS"><block type="custom_action_projectile"><field name="PROJECTILE">fireball</field><field name="SPEED">1.5</field><next><block type="custom_action_particles"><field name="PARTICLE">flame</field><field name="COUNT">20</field></block></next></block></statement></block><block type="event_command" x="20" y="380"><field name="COMMAND">getwand</field><statement name="ACTIONS"><block type="custom_item_give"><field name="ITEM_NAME">Magic Wand</field><field name="AMOUNT">1</field></block></statement></block></xml>`
  },
  {
    name: "Lightning Staff",
    description: "Epic staff that shoots fast projectiles with electric effects!",
    difficulty: "advanced",
    workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="custom_item_define" x="20" y="20"><field name="ITEM_NAME">Lightning Staff</field><field name="BASE_ITEM">minecraft:stick</field><field name="RARITY">EPIC</field><field name="MAX_STACK">1</field><field name="TEXTURE_SOURCE">upload</field></block><block type="custom_item_use" x="20" y="160"><field name="ITEM_NAME">Lightning Staff</field><statement name="ACTIONS"><block type="custom_action_projectile"><field name="PROJECTILE">snowball</field><field name="SPEED">3</field><next><block type="custom_action_particles"><field name="PARTICLE">portal</field><field name="COUNT">30</field><next><block type="action_play_sound"><field name="SOUND">entity.lightning_bolt.thunder</field></block></next></block></next></block></statement></block><block type="event_command" x="20" y="450"><field name="COMMAND">getstaff</field><statement name="ACTIONS"><block type="custom_item_give"><field name="ITEM_NAME">Lightning Staff</field><field name="AMOUNT">1</field></block></statement></block></xml>`
  },
  {
    name: "Tsunami Pearl",
    description: "Teleport pearl that pushes away nearby mobs!",
    difficulty: "advanced",
    workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="custom_item_define" x="20" y="20"><field name="ITEM_NAME">Tsunami Pearl</field><field name="BASE_ITEM">minecraft:ender_pearl</field><field name="RARITY">RARE</field><field name="MAX_STACK">16</field></block><block type="custom_item_use" x="20" y="150"><field name="ITEM_NAME">Tsunami Pearl</field><statement name="ACTIONS"><block type="custom_action_teleport_look"><field name="DISTANCE">30</field><next><block type="custom_action_area_effect"><field name="EFFECT">push</field><field name="RADIUS">8</field><field name="POWER">3</field><next><block type="custom_action_particles"><field name="PARTICLE">drip_water</field><field name="COUNT">50</field></block></next></block></next></block></statement></block><block type="event_command" x="20" y="450"><field name="COMMAND">getpearl</field><statement name="ACTIONS"><block type="custom_item_give"><field name="ITEM_NAME">Tsunami Pearl</field><field name="AMOUNT">3</field></block></statement></block></xml>`
  },
  {
    name: "Healing Crystal",
    description: "Diamond that heals nearby players and creates heart particles!",
    difficulty: "advanced",
    workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="custom_item_define" x="20" y="20"><field name="ITEM_NAME">Healing Crystal</field><field name="BASE_ITEM">minecraft:diamond</field><field name="RARITY">RARE</field><field name="MAX_STACK">8</field></block><block type="custom_item_use" x="20" y="150"><field name="ITEM_NAME">Healing Crystal</field><statement name="ACTIONS"><block type="custom_action_area_effect"><field name="EFFECT">heal</field><field name="RADIUS">10</field><field name="POWER">5</field><next><block type="custom_action_particles"><field name="PARTICLE">heart</field><field name="COUNT">40</field><next><block type="action_play_sound"><field name="SOUND">entity.player.levelup</field></block></next></block></next></block></statement></block><block type="event_command" x="20" y="430"><field name="COMMAND">getcrystal</field><statement name="ACTIONS"><block type="custom_item_give"><field name="ITEM_NAME">Healing Crystal</field><field name="AMOUNT">2</field></block></statement></block></xml>`
  },
  {
    name: "Ice Bow",
    description: "Custom bow that shoots arrows and freezes enemies!",
    difficulty: "advanced",
    workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="custom_item_define" x="20" y="20"><field name="ITEM_NAME">Ice Bow</field><field name="BASE_ITEM">minecraft:stick</field><field name="RARITY">EPIC</field><field name="MAX_STACK">1</field></block><block type="custom_item_use" x="20" y="150"><field name="ITEM_NAME">Ice Bow</field><statement name="ACTIONS"><block type="custom_action_projectile"><field name="PROJECTILE">arrow</field><field name="SPEED">3</field><next><block type="custom_action_area_effect"><field name="EFFECT">freeze</field><field name="RADIUS">5</field><field name="POWER">5</field><next><block type="custom_action_particles"><field name="PARTICLE">smoke</field><field name="COUNT">25</field></block></next></block></next></block></statement></block><block type="event_command" x="20" y="460"><field name="COMMAND">geticebow</field><statement name="ACTIONS"><block type="custom_item_give"><field name="ITEM_NAME">Ice Bow</field><field name="AMOUNT">1</field></block></statement></block></xml>`
  },
  {
    name: "Flame Sword",
    description: "Sword that damages and ignites nearby mobs with effects!",
    difficulty: "advanced",
    workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="custom_item_define" x="20" y="20"><field name="ITEM_NAME">Flame Sword</field><field name="BASE_ITEM">minecraft:gold_ingot</field><field name="RARITY">EPIC</field><field name="MAX_STACK">1</field></block><block type="custom_item_use" x="20" y="200"><field name="ITEM_NAME">Flame Sword</field><statement name="ACTIONS"><block type="custom_action_area_effect"><field name="EFFECT">damage</field><field name="RADIUS">6</field><field name="POWER">4</field><next><block type="custom_action_area_effect"><field name="EFFECT">ignite</field><field name="RADIUS">6</field><field name="POWER">5</field><next><block type="custom_action_particles"><field name="PARTICLE">flame</field><field name="COUNT">50</field><next><block type="player_effect"><field name="EFFECT">strength</field><field name="DURATION">5</field></block></next></block></next></block></next></block></statement></block><block type="event_command" x="20" y="550"><field name="COMMAND">getflamesword</field><statement name="ACTIONS"><block type="custom_item_give"><field name="ITEM_NAME">Flame Sword</field><field name="AMOUNT">1</field></block></statement></block></xml>`
  },

  // ========== EXPERT TIER ==========
  {
    name: "Dragon Summoner Staff",
    description: "Ultimate staff requiring flight + fire to summon chaos!",
    difficulty: "expert",
    workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_right_click" x="20" y="20"><field name="ITEM">minecraft:blaze_rod</field><statement name="ACTIONS"><block type="controls_if"><mutation else="1"></mutation><value name="IF0"><block type="logic_operation"><field name="OP">AND</field><value name="A"><block type="sensing_is_flying"></block></value><value name="B"><block type="sensing_is_on_fire"></block></value></block></value><statement name="DO0"><block type="action_title"><field name="TITLE">DRAGON SUMMONER ACTIVATED!</field><next><block type="controls_repeat"><field name="TIMES">3</field><statement name="DO"><block type="world_spawn_entity"><field name="ENTITY">ender_dragon</field></block></statement></block><next><block type="world_entity_follow"><field name="ENTITY">ender_dragon</field><field name="RANGE">20</field><field name="DURATION">60</field><next><block type="player_effect"><field name="EFFECT">fire_resistance</field><field name="DURATION">60</field><next><block type="player_effect"><field name="EFFECT">strength</field><field name="DURATION">60</field><next><block type="player_effect"><field name="EFFECT">speed</field><field name="DURATION">60</field><next><block type="world_explosion"><field name="POWER">8</field><next><block type="sound_play"><field name="SOUND">entity.lightning_bolt.thunder</field><next><block type="looks_particles"><field name="PARTICLE">dragon_breath</field><field name="COUNT">100</field><next><block type="motion_launch"><field name="POWER">20</field><field name="DIRECTION">UP</field></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></statement><statement name="ELSE"><block type="action_message"><field name="MESSAGE">You must be on fire and flying to summon dragons!</field><next><block type="looks_particles"><field name="PARTICLE">smoke</field><field name="COUNT">30</field></block></next></block></statement></block></statement></block></xml>`
  },
  {
    name: "AI Lantern Garden",
    description: "Create decorative lanterns using AI-generated models!",
    difficulty: "intermediate",
    workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_command" x="20" y="20"><field name="COMMAND">lantern</field><statement name="ACTIONS"><block type="action_message"><field name="MESSAGE">First, generate a Japanese Lantern model in the AI Models tab!</field><next><block type="action_message"><field name="MESSAGE">Then replace 'your_model_id' with your actual model ID</field><next><block type="spawn_block_display_model"><field name="MODEL_ID">your_model_id</field><next><block type="looks_particles"><field name="PARTICLE">flame</field><field name="COUNT">20</field></block></next></block></next></block></next></block></statement></block></xml>`
  },
  {
    name: "AI Model Showcase",
    description: "Spawn multiple AI-generated decorations with particle effects!",
    difficulty: "advanced",
    workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_command" x="20" y="20"><field name="COMMAND">showcase</field><statement name="ACTIONS"><block type="action_title"><field name="TITLE">AI MODEL SHOWCASE!</field><next><block type="spawn_block_display_model"><field name="MODEL_ID">model_1</field><next><block type="looks_particles"><field name="PARTICLE">portal</field><field name="COUNT">50</field><next><block type="motion_teleport_forward"><field name="DISTANCE">5</field><next><block type="spawn_block_display_model"><field name="MODEL_ID">model_2</field><next><block type="looks_particles"><field name="PARTICLE">flame</field><field name="COUNT">50</field><next><block type="motion_teleport_forward"><field name="DISTANCE">5</field><next><block type="spawn_block_display_model"><field name="MODEL_ID">model_3</field><next><block type="looks_particles"><field name="PARTICLE">end_rod</field><field name="COUNT">50</field></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></statement></block></xml>`
  },
  {
    name: "Master Ball Ring",
    description: "Spawn 5 Master Balls in a circle!",
    difficulty: "intermediate",
    workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_command" x="20" y="20"><field name="COMMAND">ballring</field><statement name="ACTIONS"><block type="action_title"><field name="TITLE">MASTER BALL RING!</field><next><block type="spawn_ai_model_circle"><field name="MODEL_ID">model_1763397924039</field><field name="COUNT">5</field><field name="RADIUS">3</field><next><block type="looks_particles"><field name="PARTICLE">portal</field><field name="COUNT">50</field><next><block type="sound_play"><field name="SOUND">entity.experience_orb.pickup</field></block></next></block></next></block></next></block></statement></block></xml>`
  },
  {
    name: "Giant Pikachu",
    description: "Spawn a massive 2x sized Pikachu!",
    difficulty: "intermediate",
    workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_command" x="20" y="20"><field name="COMMAND">giantpika</field><statement name="ACTIONS"><block type="action_message"><field name="MESSAGE">Spawning GIANT Pikachu!</field><next><block type="spawn_ai_model_scaled"><field name="MODEL_ID">model_1763397675737</field><field name="SCALE">2</field><next><block type="looks_particles"><field name="PARTICLE">end_rod</field><field name="COUNT">100</field><next><block type="sound_play"><field name="SOUND">entity.lightning_bolt.thunder</field></block></next></block></next></block></next></block></statement></block></xml>`
  },
  {
    name: "Rotated Lantern",
    description: "Spawn a lantern facing East (90 degrees)!",
    difficulty: "intermediate",
    workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_command" x="20" y="20"><field name="COMMAND">eastlantern</field><statement name="ACTIONS"><block type="action_message"><field name="MESSAGE">Spawning East-facing Lantern!</field><next><block type="spawn_ai_model_rotated"><field name="MODEL_ID">model_1763358420993</field><field name="DIRECTION">90</field><field name="YAW">90</field><next><block type="looks_particles"><field name="PARTICLE">flame</field><field name="COUNT">50</field></block></next></block></next></block></statement></block></xml>`
  }
];

/**
 * Load the first example into the workspace for first-time users
 */
export function loadStartupExample(workspace: Blockly.WorkspaceSvg): void {
  const firstExample = EXAMPLE_PROJECTS[0];

  try {
    const xml = Blockly.utils.xml.textToDom(firstExample.workspace);
    Blockly.Xml.domToWorkspace(xml, workspace);
    console.log('Loaded startup example:', firstExample.name);
  } catch (error) {
    console.error('Error loading startup example:', error);
  }
}

/**
 * Check if this is the first time the user is opening the app
 */
export function isFirstTimeUser(): boolean {
  return !localStorage.getItem('blocklycraft_has_opened');
}

/**
 * Mark that the user has opened the app
 */
export function markAsOpened(): void {
  localStorage.setItem('blocklycraft_has_opened', 'true');
}
