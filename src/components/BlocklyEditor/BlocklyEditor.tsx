import { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { registerCustomItemBlocks } from '@/blocks/custom_items';
import { registerCustomMobBlocks } from '@/blocks/custom_mobs';
import { registerBasicBlocks } from '@/blocks/basic_blocks';
import { registerMinecraftBlocks } from '@/blocks/minecraft_blocks';
import { registerEventActionBlocks } from '@/blocks/events_actions';
import { registerBlockDisplayBlocks } from '@/blocks/block_display';
import { registerAIModelAdvancedBlocks } from '@/blocks/ai_model_advanced';
import './BlocklyEditor.css';

interface BlocklyEditorProps {
  onWorkspaceChange?: (workspace: Blockly.WorkspaceSvg) => void;
  platform?: 'fabric' | 'bukkit' | 'bedrock';
}

export default function BlocklyEditor({ onWorkspaceChange, platform = 'fabric' }: BlocklyEditorProps) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    console.log('[BlocklyEditor] useEffect running');
    console.log('[BlocklyEditor] blocklyDiv exists:', !!blocklyDiv.current);

    if (!blocklyDiv.current) {
      console.error('[BlocklyEditor] No blocklyDiv ref!');
      return;
    }

    // Register all block types
    console.log('[BlocklyEditor] Registering blocks...');
    registerEventActionBlocks();
    registerMinecraftBlocks();
    registerCustomItemBlocks();
    registerCustomMobBlocks();
    registerBasicBlocks();
    registerBlockDisplayBlocks();
    registerAIModelAdvancedBlocks();
    console.log('[BlocklyEditor] Blocks registered');

    // Initialize Blockly workspace with Zelos renderer (Scratch 3.0 style)
    console.log('[BlocklyEditor] Injecting Blockly with platform:', platform);
    workspace.current = Blockly.inject(blocklyDiv.current, {
      toolbox: getToolbox(platform),
      renderer: 'zelos',  // Use Zelos renderer for bigger, rounded blocks
      grid: {
        spacing: 20,
        length: 3,
        colour: '#ccc',
        snap: true
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.9,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
      },
      trashcan: true,
      move: {
        scrollbars: {
          horizontal: true,
          vertical: true
        },
        drag: true,
        wheel: true
      }
    });

    console.log('[BlocklyEditor] Blockly injected successfully');
    console.log('[BlocklyEditor] Workspace:', workspace.current);

    // Listen for changes
    workspace.current.addChangeListener(() => {
      if (workspace.current && onWorkspaceChange) {
        onWorkspaceChange(workspace.current);
      }
    });

    // Notify parent of workspace
    if (onWorkspaceChange && workspace.current) {
      console.log('[BlocklyEditor] Calling onWorkspaceChange with workspace');
      onWorkspaceChange(workspace.current);
    }

    // Cleanup on unmount
    return () => {
      console.log('[BlocklyEditor] Cleaning up workspace');
      if (workspace.current) {
        workspace.current.dispose();
      }
    };
  }, [onWorkspaceChange, platform]);

  return (
    <div className="blockly-editor-container">
      <div ref={blocklyDiv} className="blockly-div" />
    </div>
  );
}

// Platform compatibility for blocks
const BLOCK_COMPATIBILITY: Record<string, Array<'fabric' | 'bukkit' | 'bedrock'>> = {
  // Events - All platforms
  'event_command': ['fabric', 'bukkit', 'bedrock'],
  'event_right_click': ['fabric', 'bukkit', 'bedrock'],
  'event_break_block': ['fabric', 'bukkit', 'bedrock'],

  // Actions - All platforms except Fabric-only features
  'action_message': ['fabric', 'bukkit', 'bedrock'],
  'action_spawn_mob': ['fabric', 'bukkit', 'bedrock'],
  'action_give_item': ['fabric', 'bukkit', 'bedrock'],
  'action_play_sound': ['fabric', 'bukkit', 'bedrock'],
  'action_title': ['fabric', 'bukkit', 'bedrock'],
  'action_actionbar': ['fabric', 'bukkit', 'bedrock'],

  // Block Display Models - Fabric only (advanced entity API)
  'spawn_block_display_model': ['fabric'],
  'spawn_ai_model_rotated': ['fabric'],
  'spawn_ai_model_scaled': ['fabric'],

  // Player blocks - All platforms
  'player_health': ['fabric', 'bukkit', 'bedrock'],
  'player_effect': ['fabric', 'bukkit', 'bedrock'],

  // World blocks - All platforms
  'world_place_block': ['fabric', 'bukkit', 'bedrock'],
  'world_time': ['fabric', 'bukkit', 'bedrock'],
  'world_weather': ['fabric', 'bukkit', 'bedrock'],
  'world_explosion': ['fabric', 'bukkit', 'bedrock'],
  'world_lightning': ['fabric', 'bukkit', 'bedrock'],
  'world_fill': ['fabric', 'bukkit', 'bedrock'],
  'world_spawn_entity': ['fabric', 'bukkit', 'bedrock'],
  'world_entity_follow': ['fabric', 'bukkit', 'bedrock'],
  'world_entity_attack': ['fabric', 'bukkit', 'bedrock'],
  'world_entity_tame': ['fabric', 'bukkit', 'bedrock'],

  // Motion blocks - All platforms
  'motion_move_forward': ['fabric', 'bukkit', 'bedrock'],
  'motion_teleport': ['fabric', 'bukkit', 'bedrock'],
  'motion_teleport_forward': ['fabric', 'bukkit', 'bedrock'],
  'motion_teleport_vertical': ['fabric', 'bukkit', 'bedrock'],
  'motion_teleport_spawn': ['fabric', 'bukkit', 'bedrock'],
  'motion_rotate': ['fabric', 'bukkit', 'bedrock'],
  'motion_launch': ['fabric', 'bukkit', 'bedrock'],

  // Sensing blocks - All platforms
  'sensing_is_sneaking': ['fabric', 'bukkit', 'bedrock'],
  'sensing_is_in_water': ['fabric', 'bukkit', 'bedrock'],
  'sensing_is_on_fire': ['fabric', 'bukkit', 'bedrock'],
  'sensing_is_on_ground': ['fabric', 'bukkit', 'bedrock'],
  'sensing_is_sprinting': ['fabric', 'bukkit', 'bedrock'],
  'sensing_is_flying': ['fabric', 'bukkit', 'bedrock'],
  'sensing_get_health': ['fabric', 'bukkit', 'bedrock'],
  'sensing_get_hunger': ['fabric', 'bukkit', 'bedrock'],
  'sensing_get_gamemode': ['fabric', 'bukkit', 'bedrock'],
  'sensing_is_holding': ['fabric', 'bukkit', 'bedrock'],
  'sensing_block_at': ['fabric', 'bukkit', 'bedrock'],
  'sensing_nearby_entities': ['fabric', 'bukkit', 'bedrock'],
  'sensing_time_of_day': ['fabric', 'bukkit', 'bedrock'],
  'sensing_is_day': ['fabric', 'bukkit', 'bedrock'],
  'sensing_is_raining': ['fabric', 'bukkit', 'bedrock'],
  'sensing_player_name': ['fabric', 'bukkit', 'bedrock'],

  // Looks blocks - All platforms
  'looks_message': ['fabric', 'bukkit', 'bedrock'],
  'looks_title': ['fabric', 'bukkit', 'bedrock'],
  'looks_subtitle': ['fabric', 'bukkit', 'bedrock'],
  'looks_actionbar': ['fabric', 'bukkit', 'bedrock'],
  'looks_particles': ['fabric', 'bukkit', 'bedrock'],
  'looks_clear_effects': ['fabric', 'bukkit', 'bedrock'],

  // Sound blocks - All platforms
  'sound_play': ['fabric', 'bukkit', 'bedrock'],
  'sound_music_disc': ['fabric', 'bukkit', 'bedrock'],

  // Logic/Control - All platforms
  'controls_if': ['fabric', 'bukkit', 'bedrock'],
  'logic_compare': ['fabric', 'bukkit', 'bedrock'],
  'logic_operation': ['fabric', 'bukkit', 'bedrock'],
  'logic_not': ['fabric', 'bukkit', 'bedrock'],
  'logic_boolean': ['fabric', 'bukkit', 'bedrock'],
  'repeat_times': ['fabric', 'bukkit', 'bedrock'],
  'repeat_forever': ['fabric', 'bukkit', 'bedrock'],

  // Math - All platforms
  'math_number': ['fabric', 'bukkit', 'bedrock'],
  'math_arithmetic': ['fabric', 'bukkit', 'bedrock'],

  // Text - All platforms
  'text': ['fabric', 'bukkit', 'bedrock'],

  // Custom Items/Mobs - Fabric only (requires Fabric API)
  'custom_item_define': ['fabric'],
  'custom_mob_define': ['fabric'],
};

function isBlockCompatible(blockType: string, platform: 'fabric' | 'bukkit' | 'bedrock'): boolean {
  const compatibility = BLOCK_COMPATIBILITY[blockType];
  // If not defined, assume compatible with all platforms
  if (!compatibility) return true;
  return compatibility.includes(platform);
}

function filterBlocks(blocks: any[], platform: 'fabric' | 'bukkit' | 'bedrock'): any[] {
  return blocks.filter(block => {
    if (block.kind === 'block') {
      return isBlockCompatible(block.type, platform);
    }
    return true; // Keep non-block items (labels, buttons, etc.)
  });
}

// Toolbox configuration with image-based categories
function getToolbox(platform: 'fabric' | 'bukkit' | 'bedrock' = 'fabric'): Blockly.utils.toolbox.ToolboxDefinition {
  const eventsBlocks = filterBlocks([
    { kind: 'block', type: 'event_command' },
    { kind: 'block', type: 'event_right_click' },
    { kind: 'block', type: 'event_break_block' },
  ], platform);

  const actionsBlocks = filterBlocks([
    { kind: 'block', type: 'action_message' },
    { kind: 'block', type: 'action_spawn_mob' },
    { kind: 'block', type: 'action_give_item' },
    { kind: 'block', type: 'action_play_sound' },
    { kind: 'block', type: 'action_title' },
    { kind: 'block', type: 'action_actionbar' },
    { kind: 'block', type: 'spawn_block_display_model' },
    { kind: 'block', type: 'spawn_ai_model_rotated' },
    { kind: 'block', type: 'spawn_ai_model_scaled' },
  ], platform);

  const playerBlocks = filterBlocks([
    { kind: 'block', type: 'player_health' },
    { kind: 'block', type: 'player_effect' },
  ], platform);

  const worldBlocks = filterBlocks([
    { kind: 'block', type: 'world_place_block' },
    { kind: 'block', type: 'world_time' },
    { kind: 'block', type: 'world_weather' },
    { kind: 'block', type: 'world_explosion' },
    { kind: 'block', type: 'world_lightning' },
    { kind: 'block', type: 'world_fill' },
    { kind: 'block', type: 'world_spawn_entity' },
    { kind: 'block', type: 'world_entity_follow' },
    { kind: 'block', type: 'world_entity_attack' },
    { kind: 'block', type: 'world_entity_tame' },
  ], platform);

  const motionBlocks = filterBlocks([
    { kind: 'block', type: 'motion_move_forward' },
    { kind: 'block', type: 'motion_teleport' },
    { kind: 'block', type: 'motion_teleport_forward' },
    { kind: 'block', type: 'motion_teleport_vertical' },
    { kind: 'block', type: 'motion_teleport_spawn' },
    { kind: 'block', type: 'motion_rotate' },
    { kind: 'block', type: 'motion_launch' },
  ], platform);

  const sensingBlocks = filterBlocks([
    { kind: 'block', type: 'sensing_is_sneaking' },
    { kind: 'block', type: 'sensing_is_in_water' },
    { kind: 'block', type: 'sensing_is_on_fire' },
    { kind: 'block', type: 'sensing_is_on_ground' },
    { kind: 'block', type: 'sensing_is_sprinting' },
    { kind: 'block', type: 'sensing_is_flying' },
    { kind: 'block', type: 'sensing_get_health' },
    { kind: 'block', type: 'sensing_get_hunger' },
    { kind: 'block', type: 'sensing_get_gamemode' },
    { kind: 'block', type: 'sensing_is_holding' },
    { kind: 'block', type: 'sensing_block_at' },
    { kind: 'block', type: 'sensing_nearby_entities' },
    { kind: 'block', type: 'sensing_time_of_day' },
    { kind: 'block', type: 'sensing_is_day' },
    { kind: 'block', type: 'sensing_is_raining' },
    { kind: 'block', type: 'sensing_player_name' },
  ], platform);

  const looksBlocks = filterBlocks([
    { kind: 'block', type: 'looks_message' },
    { kind: 'block', type: 'looks_title' },
    { kind: 'block', type: 'looks_subtitle' },
    { kind: 'block', type: 'looks_actionbar' },
    { kind: 'block', type: 'looks_particles' },
    { kind: 'block', type: 'looks_clear_effects' },
  ], platform);

  const soundBlocks = filterBlocks([
    { kind: 'block', type: 'sound_play' },
    { kind: 'block', type: 'sound_music_disc' },
  ], platform);

  const customItemsBlocks = filterBlocks([
    { kind: 'block', type: 'custom_item_define' },
  ], platform);

  const customMobsBlocks = filterBlocks([
    { kind: 'block', type: 'custom_mob_define' },
  ], platform);

  return {
    kind: 'categoryToolbox',
    contents: [
      // @ts-ignore - cssConfig is supported but not in type definitions
            // @ts-ignore - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
            // @ts-ignore - cssConfig works at runtime but not in types
        cssConfig: {
          container: 'category-events',
          row: 'category-events-row'
        },
        colour: '#9966FF',
        contents: eventsBlocks
      },
      // @ts-ignore - cssConfig is supported but not in type definitions
            // @ts-ignore - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
            // @ts-ignore - cssConfig works at runtime but not in types
        cssConfig: {
          container: 'category-actions',
          row: 'category-actions-row'
        },
        colour: '#40BF4A',
        contents: actionsBlocks
      },
            // @ts-ignore - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
            // @ts-ignore - cssConfig works at runtime but not in types
        cssConfig: {
          container: 'category-player',
          row: 'category-player-row'
        },
        colour: '#4C97FF',
        contents: playerBlocks
      },
            // @ts-ignore - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
            // @ts-ignore - cssConfig works at runtime but not in types
        cssConfig: {
          container: 'category-world',
          row: 'category-world-row'
        },
        colour: '#59C059',
        contents: worldBlocks
      },
            // @ts-ignore - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
            // @ts-ignore - cssConfig works at runtime but not in types
        cssConfig: {
          container: 'category-motion',
          row: 'category-motion-row'
        },
        colour: '#4CBFE6',
        contents: motionBlocks
      },
            // @ts-ignore - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
            // @ts-ignore - cssConfig works at runtime but not in types
        cssConfig: {
          container: 'category-sensing',
          row: 'category-sensing-row'
        },
        colour: '#5CB1D6',
        contents: sensingBlocks
      },
            // @ts-ignore - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
            // @ts-ignore - cssConfig works at runtime but not in types
        cssConfig: {
          container: 'category-looks',
          row: 'category-looks-row'
        },
        colour: '#CF63CF',
        contents: looksBlocks
      },
            // @ts-ignore - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
            // @ts-ignore - cssConfig works at runtime but not in types
        cssConfig: {
          container: 'category-sound',
          row: 'category-sound-row'
        },
        colour: '#D65CD6',
        contents: soundBlocks
      },
      {
        kind: 'sep'
      },
            // @ts-ignore - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
            // @ts-ignore - cssConfig works at runtime but not in types
        cssConfig: {
          container: 'category-logic',
          row: 'category-logic-row'
        },
        colour: '#5C81F4',
        contents: [
          { kind: 'block', type: 'controls_if' },
          { kind: 'block', type: 'logic_compare' },
          { kind: 'block', type: 'logic_operation' },
          { kind: 'block', type: 'logic_not' },
          { kind: 'block', type: 'logic_boolean' },
          { kind: 'block', type: 'repeat_times' },
          { kind: 'block', type: 'repeat_forever' },
        ]
      },
            // @ts-ignore - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
            // @ts-ignore - cssConfig works at runtime but not in types
        cssConfig: {
          container: 'category-math',
          row: 'category-math-row'
        },
        colour: '#59C059',
        contents: [
          { kind: 'block', type: 'math_number' },
          { kind: 'block', type: 'math_arithmetic' },
        ]
      },
            // @ts-ignore - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
            // @ts-ignore - cssConfig works at runtime but not in types
        cssConfig: {
          container: 'category-text',
          row: 'category-text-row'
        },
        colour: '#FF8C1A',
        contents: [
          { kind: 'block', type: 'text' },
        ]
      },
            // @ts-ignore - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
            // @ts-ignore - cssConfig works at runtime but not in types
        cssConfig: {
          container: 'category-variables',
          row: 'category-variables-row'
        },
        colour: '#FF8C1A',
        custom: 'VARIABLE',
      },
      {
        kind: 'sep'
      },
            // @ts-ignore - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
            // @ts-ignore - cssConfig works at runtime but not in types
        cssConfig: {
          container: 'category-customitems',
          row: 'category-customitems-row'
        },
        colour: '#FF6680',
        contents: customItemsBlocks
      },
            // @ts-ignore - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
            // @ts-ignore - cssConfig works at runtime but not in types
        cssConfig: {
          container: 'category-custommobs',
          row: 'category-custommobs-row'
        },
        colour: '#FF8C1A',
        contents: customMobsBlocks
      }
    ]
  };
}
