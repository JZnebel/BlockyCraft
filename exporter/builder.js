// Helper function to get child blocks code
function getChildBlocksCode(block, inputName) {
    const input = block.getInput(inputName);
    if (!input || !input.connection || !input.connection.targetBlock()) {
        return '';
    }

    return generateBlockCode(input.connection.targetBlock());
}

// Helper to generate code for a single block
function generateBlockCode(block) {
    if (!block) return '';

    const type = block.type;
    let code = '';

    // Action blocks
    if (type === 'action_message') {
        const message = block.getFieldValue('MESSAGE');
        code = `tellraw @s {"text":"${message}","color":"yellow"}`;
    }
    else if (type === 'action_spawn_mob') {
        const mob = block.getFieldValue('MOB');
        code = `summon ${mob} ~ ~ ~`;
    }
    else if (type === 'action_give_item') {
        const item = block.getFieldValue('ITEM');
        const amount = block.getFieldValue('AMOUNT');
        code = `give @s ${item} ${amount}`;
    }
    else if (type === 'action_play_sound') {
        const sound = block.getFieldValue('SOUND');
        code = `playsound ${sound} player @s ~ ~ ~ 1.0 1.0`;
    }

    // Process next block in the stack
    const nextBlock = block.getNextBlock();
    if (nextBlock) {
        code += '\n' + generateBlockCode(nextBlock);
    }

    return code;
}

// Build datapack from workspace
function buildDatapack(workspace) {
    const topBlocks = workspace.getTopBlocks(true);

    console.log('Top blocks found:', topBlocks.length);

    if (topBlocks.length === 0) {
        console.log('No blocks in workspace');
        return null;
    }

    // Generate all function files using our custom generator
    const functions = {};
    const commands = [];

    // Process each top-level block (each command event)
    for (const block of topBlocks) {
        console.log('Processing block type:', block.type);
        if (block.type === 'event_command') {
            const commandName = block.getFieldValue('COMMAND').toLowerCase().replace(/[^a-z0-9_]/g, '_');
            const actions = getChildBlocksCode(block, 'ACTIONS');

            console.log('Command:', commandName, 'Actions:', actions);

            // Create function file for this command
            functions[`${commandName}.mcfunction`] = actions || '# No actions';
            commands.push(commandName);
        }
    }

    // Check if we have any commands
    if (commands.length === 0) {
        console.log('No event_command blocks found');
        return null;
    }

    console.log('Built datapack with commands:', commands);

    // Create tick.mcfunction to detect trigger usage and auto-enable triggers
    let tickCode = '# Auto-enable triggers for all players\n';
    for (const cmd of commands) {
        tickCode += `scoreboard players enable @a ${cmd}\n`;
    }
    tickCode += '\n# Auto-detect trigger commands\n';
    for (const cmd of commands) {
        tickCode += `execute as @a[scores={${cmd}=1..}] run function blockcraft:${cmd}\n`;
        tickCode += `execute as @a[scores={${cmd}=1..}] run scoreboard players set @s ${cmd} 0\n`;
    }
    functions['tick.mcfunction'] = tickCode;

    // Create load.mcfunction to set up scoreboards
    let loadCode = '# Initialize scoreboards for commands\n';
    for (const cmd of commands) {
        loadCode += `scoreboard objectives add ${cmd} trigger\n`;
    }
    functions['load.mcfunction'] = loadCode;

    // Create pack.mcmeta
    const packMeta = {
        pack: {
            pack_format: 48, // Minecraft 1.21.1
            description: 'Created with BlockCraft!'
        },
        data: {
            minecraft: {
                tags: {
                    functions: {
                        tick: {
                            values: ["blockcraft:tick"]
                        },
                        load: {
                            values: ["blockcraft:load"]
                        }
                    }
                }
            }
        }
    };

    return {
        functions: functions,
        packMeta: packMeta,
        commands: commands
    };
}

// Deploy datapack directly to Minecraft server
async function downloadDatapack(datapack) {
    try {
        // Send to deployment API
        const response = await fetch('http://localhost:5000/deploy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datapack)
        });

        const result = await response.json();

        if (result.success) {
            return result.message;
        } else {
            throw new Error(result.error || 'Deployment failed');
        }
    } catch (error) {
        // If API is not running, provide manual instructions
        if (error.message.includes('Failed to fetch')) {
            const content = `BlockCraft Datapack - Manual Installation
====================

⚠️  Auto-deploy is not available. Please install manually:

1. Find your Minecraft world folder:
   /home/jordan/minecraft-fabric-1.21.1-cobblemon/world/datapacks/

2. Create a folder called "blockcraft_mod"

3. Inside that folder, create these files:

pack.mcmeta:
${JSON.stringify(datapack.packMeta, null, 2)}

data/blockcraft/functions/main.mcfunction:
${datapack.functions['main.mcfunction']}

4. In Minecraft, type: /reload
5. Your mod is now active!

💡 Tip: To enable auto-deploy, run the deployment API:
   cd /home/jordan/blockcraft
   python3 deploy_api.py
`;

            // Download as text file
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'blockcraft_mod_instructions.txt';
            a.click();
            URL.revokeObjectURL(url);

            return '⚠️ Auto-deploy not available!\n\nDownloaded manual installation instructions.\n\nTo enable one-click deploy:\n1. Open a new terminal\n2. Run: python3 deploy_api.py';
        } else {
            throw error;
        }
    }
}
