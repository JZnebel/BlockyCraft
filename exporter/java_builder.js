// Build Java/Fabric mod from workspace

function buildJavaMod(workspace) {
    const result = generateJavaCode(workspace);
    const customItemsResult = generateCustomItemsCode(workspace);
    const customMobsResult = generateCustomMobsCode(workspace);

    if (!result && !customItemsResult && !customMobsResult) {
        return null;
    }

    if ((result.commands.length === 0 && result.events.length === 0) &&
        (customItemsResult.customItems.length === 0 && customItemsResult.customItemUses.length === 0) &&
        (customMobsResult.customMobs.length === 0)) {
        return null;
    }

    const { commands, events } = result;
    const { customItems, customItemUses } = customItemsResult;
    const { customMobs } = customMobsResult;
    let customItemsDeclarations = '';
    let javaCode = '';

    // Generate custom item static field declarations (goes at class level)
    for (const item of customItems) {
        customItemsDeclarations += `
    public static final Item ITEM_${item.id.toUpperCase()} = Registry.register(
        Registries.ITEM,
        Identifier.of("blockcraft", "${item.id}"),
        new Item(new Item.Settings()
            .maxCount(${item.maxStack})
            .rarity(Rarity.${item.rarity}))
    );
`;
    }

    // Generate custom item use handlers (goes inside onInitialize)
    for (const itemUse of customItemUses) {
        javaCode += `
        UseItemCallback.EVENT.register((player, world, hand) -> {
            ItemStack stack = player.getStackInHand(hand);
            if (stack.isOf(ITEM_${itemUse.id.toUpperCase()})) {
${itemUse.code}
                return TypedActionResult.success(stack);
            }
            return TypedActionResult.pass(stack);
        });
`;
    }

    // Generate command registration code
    for (const cmd of commands) {
        javaCode += `
        CommandRegistrationCallback.EVENT.register((dispatcher, registryAccess, environment) -> {
            dispatcher.register(CommandManager.literal("${cmd.name}")
                .executes(context -> {
                    var source = context.getSource();
${cmd.code}
                    return 1;
                }));
        });
`;
    }

    // Generate event registration code
    for (const event of events) {
        if (event.type === 'break_block') {
            const blockType = event.blockType.replace('minecraft:', '').toUpperCase();
            javaCode += `
        PlayerBlockBreakEvents.AFTER.register((world, player, pos, state, blockEntity) -> {
            if (state.getBlock() == Blocks.${blockType}) {
${event.code}
            }
        });
`;
        } else if (event.type === 'right_click') {
            const itemName = event.item.replace('minecraft:', '').toUpperCase();
            javaCode += `
        UseItemCallback.EVENT.register((player, world, hand) -> {
            ItemStack stack = player.getStackInHand(hand);
            if (stack.isOf(Items.${itemName})) {
${event.code}
                return TypedActionResult.success(stack);
            }
            return TypedActionResult.pass(stack);
        });
`;
        }
    }

    return {
        commands: commands,
        events: events,
        customItems: customItems,
        customItemUses: customItemUses,
        customMobs: customMobs,
        customItemsDeclarations: customItemsDeclarations,
        javaCode: javaCode
    };
}

// Deploy Java mod to server
async function downloadJavaMod(javaMod) {
    try {
        // Get AI settings from localStorage
        const apiKey = localStorage.getItem('openai_api_key') || '';
        const aiModel = localStorage.getItem('ai_model') || 'gpt-image-1-mini';

        // Add project info and AI settings to the deployment data
        const deployData = {
            ...javaMod,
            projectId: currentProject ? currentProject.id : 'default',
            projectName: currentProject ? currentProject.name : 'BlockCraft',
            aiSettings: {
                apiKey: apiKey,
                model: aiModel
            }
        };

        // Send to deployment API
        const response = await fetch('http://localhost:5000/deploy-java', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(deployData)
        });

        const result = await response.json();

        if (result.success) {
            return result.message;
        } else {
            throw new Error(result.error || 'Deployment failed');
        }
    } catch (error) {
        if (error.message.includes('Failed to fetch')) {
            return '⚠️ Auto-deploy not available! Make sure the deployment API is running.';
        } else {
            throw error;
        }
    }
}
