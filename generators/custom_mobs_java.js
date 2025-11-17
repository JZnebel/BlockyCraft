// Generate Java code for custom mobs (billboard/sprite entities)

function generateCustomMobsCode(workspace) {
    const topBlocks = workspace.getTopBlocks(true);
    const customMobs = [];

    // Find all custom mob definitions
    for (const block of topBlocks) {
        if (block.type === 'custom_mob_define') {
            const mobName = block.getFieldValue('MOB_NAME');
            const health = block.getFieldValue('HEALTH');
            const size = block.getFieldValue('SIZE');
            const speed = block.getFieldValue('SPEED');
            const behavior = block.getFieldValue('BEHAVIOR');
            const uploadedTexture = block.uploadedTextureData || null;

            const mobId = mobName.toLowerCase().replace(/[^a-z0-9]/g, '_');

            customMobs.push({
                name: mobName,
                id: mobId,
                health: health,
                size: size,
                speed: speed,
                behavior: behavior,
                uploadedTexture: uploadedTexture
            });
        }
    }

    return { customMobs };
}
