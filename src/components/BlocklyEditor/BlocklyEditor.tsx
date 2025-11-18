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
}

export default function BlocklyEditor({ onWorkspaceChange }: BlocklyEditorProps) {
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
    console.log('[BlocklyEditor] Injecting Blockly...');
    workspace.current = Blockly.inject(blocklyDiv.current, {
      toolbox: getToolbox(),
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
  }, [onWorkspaceChange]);

  return (
    <div className="blockly-editor-container">
      <div ref={blocklyDiv} className="blockly-div" />
    </div>
  );
}

// Toolbox configuration with image-based categories
function getToolbox(): Blockly.utils.toolbox.ToolboxDefinition {
  return {
    kind: 'categoryToolbox',
    contents: [
      // @ts-ignore - cssConfig is supported but not in type definitions
            // @ts-expect-error - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
        cssConfig: {
          container: 'category-events',
          row: 'category-events-row'
        },
        colour: '#9966FF',
        contents: [
          { kind: 'block', type: 'event_command' },
          { kind: 'block', type: 'event_right_click' },
          { kind: 'block', type: 'event_break_block' },
        ]
      },
      // @ts-ignore - cssConfig is supported but not in type definitions
            // @ts-expect-error - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
        cssConfig: {
          container: 'category-actions',
          row: 'category-actions-row'
        },
        colour: '#40BF4A',
        contents: [
          { kind: 'block', type: 'action_message' },
          { kind: 'block', type: 'action_spawn_mob' },
          { kind: 'block', type: 'action_give_item' },
          { kind: 'block', type: 'action_play_sound' },
          { kind: 'block', type: 'action_title' },
          { kind: 'block', type: 'action_actionbar' },
          { kind: 'block', type: 'spawn_block_display_model' },
          { kind: 'block', type: 'spawn_ai_model_rotated' },
          { kind: 'block', type: 'spawn_ai_model_scaled' },
        ]
      },
            // @ts-expect-error - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
        cssConfig: {
          container: 'category-player',
          row: 'category-player-row'
        },
        colour: '#4C97FF',
        contents: [
          { kind: 'block', type: 'player_health' },
          { kind: 'block', type: 'player_effect' },
        ]
      },
            // @ts-expect-error - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
        cssConfig: {
          container: 'category-world',
          row: 'category-world-row'
        },
        colour: '#59C059',
        contents: [
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
        ]
      },
            // @ts-expect-error - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
        cssConfig: {
          container: 'category-motion',
          row: 'category-motion-row'
        },
        colour: '#4CBFE6',
        contents: [
          { kind: 'block', type: 'motion_move_forward' },
          { kind: 'block', type: 'motion_teleport' },
          { kind: 'block', type: 'motion_teleport_forward' },
          { kind: 'block', type: 'motion_teleport_vertical' },
          { kind: 'block', type: 'motion_teleport_spawn' },
          { kind: 'block', type: 'motion_rotate' },
          { kind: 'block', type: 'motion_launch' },
        ]
      },
            // @ts-expect-error - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
        cssConfig: {
          container: 'category-sensing',
          row: 'category-sensing-row'
        },
        colour: '#5CB1D6',
        contents: [
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
        ]
      },
            // @ts-expect-error - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
        cssConfig: {
          container: 'category-looks',
          row: 'category-looks-row'
        },
        colour: '#CF63CF',
        contents: [
          { kind: 'block', type: 'looks_message' },
          { kind: 'block', type: 'looks_title' },
          { kind: 'block', type: 'looks_subtitle' },
          { kind: 'block', type: 'looks_actionbar' },
          { kind: 'block', type: 'looks_particles' },
          { kind: 'block', type: 'looks_clear_effects' },
        ]
      },
            // @ts-expect-error - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
        cssConfig: {
          container: 'category-sound',
          row: 'category-sound-row'
        },
        colour: '#D65CD6',
        contents: [
          { kind: 'block', type: 'sound_play' },
          { kind: 'block', type: 'sound_music_disc' },
        ]
      },
      {
        kind: 'sep'
      },
            // @ts-expect-error - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
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
            // @ts-expect-error - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
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
            // @ts-expect-error - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
        cssConfig: {
          container: 'category-text',
          row: 'category-text-row'
        },
        colour: '#FF8C1A',
        contents: [
          { kind: 'block', type: 'text' },
        ]
      },
            // @ts-expect-error - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
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
            // @ts-expect-error - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
        cssConfig: {
          container: 'category-customitems',
          row: 'category-customitems-row'
        },
        colour: '#FF6680',
        contents: [
          { kind: 'block', type: 'custom_item_define' },
        ]
      },
            // @ts-expect-error - cssConfig is supported but not in type definitions
      {
        kind: 'category',
        name: '',
        cssConfig: {
          container: 'category-custommobs',
          row: 'category-custommobs-row'
        },
        colour: '#FF8C1A',
        contents: [
          { kind: 'block', type: 'custom_mob_define' },
        ]
      }
    ]
  };
}
