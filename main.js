// Initialize Blockly workspace
let workspace;
let lastDeployment = null; // Stores info about the last deployment for downloading

function initBlockly() {
    const toolbox = {
        kind: 'categoryToolbox',
        contents: [
            {
                kind: 'category',
                name: '⚡ Events',
                colour: '#FFBF00',
                contents: [
                    { kind: 'block', type: 'event_command' },
                    { kind: 'block', type: 'event_right_click' },
                    { kind: 'block', type: 'event_break_block' }
                ]
            },
            {
                kind: 'category',
                name: '🏃 Motion',
                colour: '#4A90E2',
                contents: [
                    { kind: 'block', type: 'motion_move_forward' },
                    { kind: 'block', type: 'motion_teleport' },
                    { kind: 'block', type: 'motion_rotate' },
                    { kind: 'block', type: 'motion_launch' },
                    { kind: 'block', type: 'motion_set_x' },
                    { kind: 'block', type: 'motion_change_x' },
                    { kind: 'block', type: 'motion_get_position' }
                ]
            },
            {
                kind: 'category',
                name: '👁️ Looks',
                colour: '#9966FF',
                contents: [
                    { kind: 'block', type: 'looks_message' },
                    { kind: 'block', type: 'looks_title' },
                    { kind: 'block', type: 'looks_subtitle' },
                    { kind: 'block', type: 'looks_actionbar' },
                    { kind: 'block', type: 'looks_particles' },
                    { kind: 'block', type: 'looks_effect' },
                    { kind: 'block', type: 'looks_clear_effects' },
                    { kind: 'block', type: 'looks_display_name' },
                    { kind: 'block', type: 'looks_gamemode' }
                ]
            },
            {
                kind: 'category',
                name: '🔊 Sound',
                colour: '#CF63CF',
                contents: [
                    { kind: 'block', type: 'sound_play' },
                    { kind: 'block', type: 'sound_music_disc' },
                    { kind: 'block', type: 'sound_stop_all' },
                    { kind: 'block', type: 'sound_ambient' },
                    { kind: 'block', type: 'sound_ui' },
                    { kind: 'block', type: 'sound_custom' }
                ]
            },
            {
                kind: 'category',
                name: '🧠 Control',
                colour: '#FFAB19',
                contents: [
                    { kind: 'block', type: 'logic_if' },
                    { kind: 'block', type: 'logic_if_else' },
                    { kind: 'block', type: 'logic_wait' },
                    { kind: 'block', type: 'loop_repeat' }
                ]
            },
            {
                kind: 'category',
                name: '👁️ Sensing',
                colour: '#4ECDC4',
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
                    { kind: 'block', type: 'sensing_player_name' }
                ]
            },
            {
                kind: 'category',
                name: '🔢 Operators',
                colour: '#40BF4A',
                contents: [
                    { kind: 'block', type: 'operators_number' },
                    { kind: 'block', type: 'operators_text' },
                    { kind: 'block', type: 'operators_boolean' },
                    { kind: 'block', type: 'operators_math' },
                    { kind: 'block', type: 'operators_random' },
                    { kind: 'block', type: 'operators_compare' },
                    { kind: 'block', type: 'operators_and_or' },
                    { kind: 'block', type: 'operators_not' },
                    { kind: 'block', type: 'operators_join' },
                    { kind: 'block', type: 'operators_contains' },
                    { kind: 'block', type: 'operators_length' },
                    { kind: 'block', type: 'operators_round' },
                    { kind: 'block', type: 'operators_mathop' },
                    { kind: 'block', type: 'data_random' }
                ]
            },
            {
                kind: 'category',
                name: '📊 Variables',
                colour: '#FF8C1A',
                contents: [
                    { kind: 'block', type: 'variables_set' },
                    { kind: 'block', type: 'variables_change' },
                    { kind: 'block', type: 'variables_get' },
                    { kind: 'block', type: 'variables_show' },
                    { kind: 'block', type: 'variables_hide' },
                    { kind: 'block', type: 'variables_create_objective' },
                    { kind: 'block', type: 'variables_if' },
                    { kind: 'label', text: 'Lists:' },
                    { kind: 'block', type: 'variables_list_create' },
                    { kind: 'block', type: 'variables_list_add' },
                    { kind: 'block', type: 'variables_list_get' },
                    { kind: 'block', type: 'variables_list_length' },
                    { kind: 'block', type: 'variables_list_contains' }
                ]
            },
            {
                kind: 'category',
                name: '🌍 World',
                colour: '#10B981',
                contents: [
                    { kind: 'block', type: 'world_place_block' },
                    { kind: 'block', type: 'world_time' },
                    { kind: 'block', type: 'world_weather' },
                    { kind: 'block', type: 'world_explosion' },
                    { kind: 'label', text: 'Entities:' },
                    { kind: 'block', type: 'world_spawn_entity' },
                    { kind: 'block', type: 'world_entity_follow' },
                    { kind: 'block', type: 'world_entity_attack' },
                    { kind: 'block', type: 'world_entity_tame' }
                ]
            },
            {
                kind: 'category',
                name: '🎨 Custom Items',
                colour: '#E91E63',
                contents: [
                    { kind: 'label', text: 'Create Items:' },
                    { kind: 'block', type: 'custom_item_define' },
                    { kind: 'label', text: 'Item Events:' },
                    { kind: 'block', type: 'custom_item_use' },
                    { kind: 'label', text: 'Give Items:' },
                    { kind: 'block', type: 'custom_item_give' },
                    { kind: 'label', text: 'Item Actions:' },
                    { kind: 'block', type: 'custom_action_projectile' },
                    { kind: 'block', type: 'custom_action_particles' },
                    { kind: 'block', type: 'custom_action_area_effect' },
                    { kind: 'block', type: 'custom_action_teleport_look' }
                ]
            },
            {
                kind: 'category',
                name: '🦖 Custom Mobs',
                colour: '#4CAF50',
                contents: [
                    { kind: 'label', text: 'Create Mobs:' },
                    { kind: 'block', type: 'custom_mob_define' },
                    { kind: 'label', text: 'Spawn Mobs:' },
                    { kind: 'block', type: 'custom_mob_spawn' }
                ]
            },
            {
                kind: 'category',
                name: '🧱 Custom Blocks',
                colour: '#9C27B0',
                contents: [
                    { kind: 'label', text: 'Coming soon!' }
                ]
            }
        ]
    };

    workspace = Blockly.inject('blocklyDiv', {
        toolbox: toolbox,
        scrollbars: true,
        trashcan: true,
        renderer: 'zelos', // Use zelos renderer for better visual appearance
        zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 2,
            minScale: 0.5,
            scaleSpeed: 1.1
        },
        grid: {
            spacing: 25,
            length: 3,
            colour: '#ccc',
            snap: true
        },
        move: {
            scrollbars: {
                horizontal: true,
                vertical: true
            },
            drag: true,
            wheel: true
        }
    });

    // Update code preview on any change
    workspace.addChangeListener(updateCodePreview);

    // Style toolbox categories to look like blocks
    styleToolboxCategories();

    // Initialize project system
    initProjects();
    setupAutoSave();
}

function styleToolboxCategories() {
    // Wait a bit for Blockly to render the toolbox
    setTimeout(() => {
        const categories = document.querySelectorAll('.blocklyToolboxCategory');
        const colors = {
            '⚡ Events': '#FFBF00',
            '🏃 Motion': '#4A90E2',
            '👁️ Looks': '#9966FF',
            '🔊 Sound': '#CF63CF',
            '🧠 Control': '#FFAB19',
            '👁️ Sensing': '#4ECDC4',
            '🔢 Operators': '#40BF4A',
            '📊 Variables': '#FF8C1A',
            '🌍 World': '#10B981',
            '🎨 Custom Items': '#E91E63',
            '🧱 Custom Blocks': '#9C27B0',
            '🐉 Custom Mobs': '#FF5722'
        };

        categories.forEach(category => {
            const label = category.querySelector('.blocklyToolboxCategoryLabel');
            if (label) {
                const categoryName = label.textContent.trim();
                const color = colors[categoryName];
                if (color) {
                    category.style.setProperty('--category-color', color);
                    category.style.background = color;
                }
            }
        });
    }, 100);
}

function updateCodePreview() {
    // Code preview panel was removed from UI - this function is no longer needed
    // but kept for backwards compatibility
    return;
}

function showTutorial() {
    alert('🎓 Welcome to BlockCraft!\n\n' +
          '1. Drag blocks from the left\n' +
          '2. Connect them together\n' +
          '3. See your code on the right\n' +
          '4. Click "Deploy" to add it to Minecraft!\n' +
          '5. Type /reload in your server\n\n' +
          'Start with Quest 1: Make a /hello command!');
}

async function exportToServer() {
    console.log('exportToServer called');
    console.log('Workspace:', workspace);

    // Build the Java mod
    const javaMod = buildJavaMod(workspace);
    console.log('Java mod result:', javaMod);

    if (!javaMod) {
        showError('❌ You need to add some blocks first! Start with an Event block (like "When command").');
        return;
    }

    try {
        // Show loading overlay
        showLoading('🔨 Compiling mod... This may take 30 seconds...');

        // Deploy to server
        const result = await downloadJavaMod(javaMod);
        showSuccess('✅ ' + (result.message || result));

        // Store deployment info and show download button
        if (result.jar_path) {
            lastDeployment = result;
            document.getElementById('downloadBtn').style.display = 'inline-block';
        }
    } catch (error) {
        showError('Deployment failed: ' + error.message);
    }
}

async function downloadModPackage() {
    if (!lastDeployment || !lastDeployment.jar_path) {
        showError('❌ No mod deployed yet! Deploy a mod first.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/download-package', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jar_path: lastDeployment.jar_path,
                resource_pack_path: lastDeployment.resource_pack_path,
                project_name: lastDeployment.project_name || 'BlockCraft Mod'
            })
        });

        if (!response.ok) {
            throw new Error('Download failed');
        }

        // Get the blob and download it
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(lastDeployment.project_name || 'BlockCraft_Mod').replace(/ /g, '_')}_package.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showSuccess('📦 Mod package downloaded! Share it with your friends!');
    } catch (error) {
        showError('❌ Download failed: ' + error.message);
    }
}

function showLoading(message) {
    const overlay = document.getElementById('loadingOverlay');
    const text = document.getElementById('loadingText');
    text.textContent = message;
    overlay.classList.add('active');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.remove('active');
}

function showSuccess(message) {
    console.log('✅ ' + message);
    hideLoading();

    const el = document.getElementById('successMessage');
    el.textContent = message;
    el.style.display = 'block';

    setTimeout(() => {
        el.style.display = 'none';
    }, 3000);
}

function showError(message) {
    console.error('❌ ' + message);
    hideLoading();

    const el = document.getElementById('errorMessage');
    el.textContent = message;
    el.style.display = 'block';

    setTimeout(() => {
        el.style.display = 'none';
    }, 5000);
}

// Toggle projects sidebar
function toggleProjectsSidebar() {
    const sidebar = document.getElementById('projectsSidebar');
    const expandBtn = document.getElementById('expandProjectsBtn');

    sidebar.classList.toggle('collapsed');

    // Show/hide floating expand button
    if (sidebar.classList.contains('collapsed')) {
        expandBtn.style.display = 'flex';
    } else {
        expandBtn.style.display = 'none';
    }

    // Resize Blockly workspace after animation
    setTimeout(() => {
        Blockly.svgResize(workspace);
    }, 300);
}

// Toggle side panel (code preview)
function toggleSidePanel() {
    const panel = document.getElementById('sidePanel');
    const expandBtn = document.getElementById('expandCodeBtn');

    panel.classList.toggle('collapsed');

    // Show/hide floating expand button
    if (panel.classList.contains('collapsed')) {
        expandBtn.style.display = 'flex';
    } else {
        expandBtn.style.display = 'none';
    }

    // Resize Blockly workspace after animation
    setTimeout(() => {
        Blockly.svgResize(workspace);
    }, 300);
}

// Settings functions
function showSettings() {
    const modal = document.getElementById('settingsModal');
    const apiKeyInput = document.getElementById('openaiApiKey');
    const modelSelect = document.getElementById('aiModel');

    // Load saved settings
    const savedApiKey = localStorage.getItem('openai_api_key') || '';
    const savedModel = localStorage.getItem('ai_model') || 'gpt-image-1-mini';

    apiKeyInput.value = savedApiKey;
    modelSelect.value = savedModel;

    modal.style.display = 'block';
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function saveSettings() {
    const apiKey = document.getElementById('openaiApiKey').value.trim();
    const model = document.getElementById('aiModel').value;

    // Save to localStorage
    if (apiKey) {
        localStorage.setItem('openai_api_key', apiKey);
    } else {
        localStorage.removeItem('openai_api_key');
    }
    localStorage.setItem('ai_model', model);

    // Show success message
    alert('✅ Settings saved! You can now use AI-generated textures for custom items.');
    closeSettings();
}

// Texture Preview functions
function previewTextures() {
    const modal = document.getElementById('texturePreviewModal');
    const content = document.getElementById('texturePreviewContent');

    // Check for API key
    const apiKey = localStorage.getItem('openai_api_key') || '';
    if (!apiKey) {
        alert('⚠️ Please add your OpenAI API key in Settings first!');
        showSettings();
        return;
    }

    // Scan workspace for custom items
    const javaMod = buildJavaMod(workspace);
    if (!javaMod || !javaMod.customItems || javaMod.customItems.length === 0) {
        alert('No custom items found! Add a "🎨 Create Custom Item" block first.');
        return;
    }

    // Display custom items
    let html = '<div style="padding: 20px;">';
    html += '<p>Found ' + javaMod.customItems.length + ' custom item(s). Click Generate to create AI textures:</p>';
    html += '<div id="itemsList" style="margin-top: 20px;">';

    javaMod.customItems.forEach((item, index) => {
        html += '<div class="texture-item" id="item-' + index + '" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">';
        html += '<h3>' + item.name + '</h3>';
        html += '<p><strong>Description:</strong> ' + (item.textureDescription || 'No description') + '</p>';
        html += '<p><strong>Fallback:</strong> ' + item.baseItem + '</p>';
        html += '<div id="preview-' + index + '" style="margin-top: 10px;"></div>';
        html += '</div>';
    });

    html += '</div></div>';
    content.innerHTML = html;

    // Store items for generation
    window.pendingItems = javaMod.customItems;

    // Enable generate button
    document.getElementById('generateBtn').disabled = false;

    modal.style.display = 'block';
}

function closeTexturePreview() {
    document.getElementById('texturePreviewModal').style.display = 'none';
}

async function generateAllTextures() {
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.disabled = true;
    generateBtn.textContent = '⏳ Generating...';

    const apiKey = localStorage.getItem('openai_api_key');
    const aiModel = localStorage.getItem('ai_model') || 'gpt-image-1-mini';

    for (let i = 0; i < window.pendingItems.length; i++) {
        const item = window.pendingItems[i];
        const previewDiv = document.getElementById('preview-' + i);

        if (!item.textureDescription) {
            previewDiv.innerHTML = '<p style="color: #666;">⚠️ No description - will use fallback texture</p>';
            continue;
        }

        previewDiv.innerHTML = '<p>⏳ Generating...</p>';

        try {
            const response = await fetch('http://localhost:5000/preview-texture', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    description: item.textureDescription,
                    itemId: item.id,
                    apiKey: apiKey,
                    model: aiModel
                })
            });

            const result = await response.json();

            if (result.success) {
                previewDiv.innerHTML = '<p style="color: green;">✅ Generated successfully!</p>' +
                    '<img src="data:image/png;base64,' + result.image + '" style="width: 64px; height: 64px; image-rendering: pixelated; border: 1px solid #ddd; margin-top: 10px;">';
            } else {
                previewDiv.innerHTML = '<p style="color: red;">❌ Failed: ' + result.error + '</p>';
            }
        } catch (error) {
            previewDiv.innerHTML = '<p style="color: red;">❌ Error: ' + error.message + '</p>';
        }
    }

    generateBtn.textContent = '✅ Done!';
    setTimeout(() => {
        generateBtn.textContent = '🎨 Generate All Textures';
        generateBtn.disabled = false;
    }, 2000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const settingsModal = document.getElementById('settingsModal');
    const textureModal = document.getElementById('texturePreviewModal');
    if (event.target == settingsModal) {
        closeSettings();
    }
    if (event.target == textureModal) {
        closeTexturePreview();
    }
}

// Initialize when page loads
window.addEventListener('load', initBlockly);
