// Project management system for BlockCraft

let currentProject = null;

// Example projects to help kids learn
const EXAMPLE_PROJECTS = [
    {
        name: "🎮 Example: Hello Command",
        description: "A simple /hello command that sends a message",
        workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_command" x="20" y="20"><field name="COMMAND">hello</field><statement name="ACTIONS"><block type="action_message"><field name="MESSAGE">Hello from BlockCraft!</field></block></statement></block></xml>`
    },
    {
        name: "🐷 Example: Pig Rain",
        description: "Type /pigrain to spawn 20 pigs!",
        workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_command" x="20" y="20"><field name="COMMAND">pigrain</field><statement name="ACTIONS"><block type="action_title"><field name="TITLE">PIG RAIN!</field><next><block type="loop_repeat"><field name="TIMES">20</field><statement name="DO"><block type="action_spawn_mob"><field name="MOB">minecraft:pig</field></block></statement></block></next></block></statement></block></xml>`
    },
    {
        name: "⚡ Example: Magic Stick",
        description: "Right-click a stick to teleport up and get speed!",
        workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_right_click" x="20" y="20"><field name="ITEM">minecraft:carrot_on_a_stick</field><statement name="ACTIONS"><block type="action_title"><field name="TITLE">MAGIC!</field><next><block type="player_teleport"><field name="X">0</field><field name="Y">150</field><field name="Z">0</field><next><block type="player_effect"><field name="EFFECT">SPEED</field><field name="DURATION">30</field></block></next></block></next></block></statement></block></xml>`
    },
    {
        name: "💎 Example: Lucky Dirt",
        description: "Break dirt while sneaking for a 50% chance of diamonds!",
        workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_break_block" x="20" y="20"><field name="BLOCK">minecraft:dirt</field><statement name="ACTIONS"><block type="logic_if"><field name="CONDITION">predicate=sneaking</field><statement name="THEN"><block type="data_random"><field name="CHANCE">50</field><statement name="ACTIONS"><block type="action_message"><field name="MESSAGE">You got lucky!</field><next><block type="action_give_item"><field name="AMOUNT">5</field><field name="ITEM">minecraft:diamond</field></block></next></block></statement></block></statement></block></statement></block></xml>`
    },
    {
        name: "🌈 Example: Party Mode",
        description: "Advanced: /party changes time, weather, and spawns mobs!",
        workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_command" x="20" y="20"><field name="COMMAND">party</field><statement name="ACTIONS"><block type="action_title"><field name="TITLE">PARTY TIME!</field><next><block type="world_time"><field name="TIME">6000</field><next><block type="world_weather"><field name="WEATHER">clear</field><next><block type="loop_repeat"><field name="TIMES">10</field><statement name="DO"><block type="data_random"><field name="CHANCE">50</field><statement name="ACTIONS"><block type="action_spawn_mob"><field name="MOB">minecraft:pig</field></block></statement><next><block type="logic_wait"><field name="SECONDS">1</field></block></next></block></statement></block></next></block></next></block></next></block></statement></block></xml>`
    },
    {
        name: "🔥 Example: If/Else Demo",
        description: "Shows if/else logic - different effects in water vs on land",
        workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_command" x="20" y="20"><field name="COMMAND">check</field><statement name="ACTIONS"><block type="logic_if_else"><field name="CONDITION">water</field><statement name="THEN"><block type="action_message"><field name="MESSAGE">You're in water! Here's speed!</field><next><block type="player_effect"><field name="EFFECT">SPEED</field><field name="DURATION">10</field></block></next></block></statement><statement name="ELSE"><block type="action_message"><field name="MESSAGE">You're on land! Here's jump boost!</field><next><block type="player_effect"><field name="EFFECT">JUMP_BOOST</field><field name="DURATION">10</field></block></next></block></statement></block></statement></block></xml>`
    },
    {
        name: "🪄 Example: Magic Wand (Custom Item)",
        description: "Create a custom magic wand that shoots fireballs!",
        workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="custom_item_define" x="20" y="20"><field name="ITEM_NAME">Magic Wand</field><field name="BASE_ITEM">minecraft:stick</field><field name="RARITY">EPIC</field><field name="MAX_STACK">1</field></block><block type="custom_item_use" x="20" y="100"><field name="ITEM_NAME">Magic Wand</field><statement name="ACTIONS"><block type="custom_action_projectile"><field name="PROJECTILE">fireball</field><field name="SPEED">1.5</field><next><block type="custom_action_particles"><field name="PARTICLE">flame</field><field name="COUNT">20</field></block></next></block></statement></block><block type="event_command" x="20" y="200"><field name="COMMAND">getwand</field><statement name="ACTIONS"><block type="custom_item_give"><field name="ITEM_NAME">Magic Wand</field><field name="AMOUNT">1</field></block></statement></block></xml>`
    },
    {
        name: "⚡ Example: Lightning Staff",
        description: "Epic staff that shoots fast projectiles with electric effects!",
        workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="custom_item_define" data-texture="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACb0lEQVR4nDWTT4vWZRSGr/s8zzuOYAyS1Mw4iWMQBYrRRyiKsYK+Q5vSxbRp0ypatwr6S9+hjWWS0SLauTAStGgcNNRy00CO1vg+59wtfsz2nLO47sN16/jjp12VtBYY0SSyCgNCGGghxhj03ikb9nc2PSQk4YJyYQwKIkREsLHyLk8dWae7c+TQCu//9Np0b0gX3RZIhIIxBq0FPRoATrN2eJ17O7fY/XcXrwZgApFKZtHoWUVIpE0ECBg5APH281/w5dVz5Bi0WWfp0Ae8tLLJD399DNFwmYgwJdNnQW8dJKoKXCzMivxvj5uXlyjP+fruhzz7xEksiEqMCSFawJgnlQbDH5cXIILPrmyihQ4718GNg1qkLS7QI5AC24QELqEyFvz+zV1oHdJkJZXF+pmjSMGLK2fZvf8Pe4/mjFFIQa8pB9WFbJ4+8yS3Lm3T+zESePO5jzh4YBG3hig++fksLYTUKCc9WpBVVBbRAiI4sbEGmHOnP6dJXP/zKuXBY1pGLuwCRNsnwBDREEaIrOStk5/y/dZXbD34DstsXbjD8ZeXaa0hiZFJzGb7P4AWDSOMeWPtPX68eZ7f7l8EwfaF28TSKtu/3EMuJDFrDVkEBL0HRSLMxvIm13au8OuDi7QelIv1V1bh7zs888IyjsmZzEIhegiqmPyO4PbDG9x4eAmpU6MoIAJOvH4UEWhyFPUAF5E1yBoY8+rKO1zb/ZYqQw6qBi0C3HCakQNXUZnUMFVGxw6fcmsNVxFd1DCKBlUUZmHW2Xu0x6wfoKpQTPihNvWi944CkKCmMoycTzNgZCI1Rg7mOadyqjKaCP4Hu1BP9LkadxYAAAAASUVORK5CYII=" x="20" y="20"><data>{"uploadedTexture": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACe0lEQVR4nDWTz4sWZBSFn3Pf9/sczRBJamacxDGIAsPoTyiKsaL+hzali2nTplW0bhXYL/oXok1lktEi2rkwErRoHDTUctNAjlPj9957WnzM9pzNcy/P0fFHTlGVtBYY0SSyCgNCGGghxhj03ikb9jqbHhKScEG5MAYFESIiWFt6x48fWaW7c+Tg0s57P73ykCRsSBfdFkiEgjEGrQU9GgBOs3J4lbtbN9n+dxsvxwEwgUglk2j0rCIk0iYCBIwcgHjr2c/8+ZWzyjFok86hg+/7haV1//DXORENl4kIUzJ9EvTWQaKqwMV0UuR/u9y4dMjlGV/f+eC1px49iQVRiTEhRAsYs6TSYPjj0tRE8MnldWnaYesauLFfC9O2MKVHIAW2CQlcQmUs+P2bO6Z1SJOVVBarp49KCp5fOvPF9r1/2H0wY4xCCnrN76C6kM0Tpx/TzYub7v0YCbzx9Ifev28Bt4YoPvr5jFoIqVFOerQgq6gsogVEcGJtRWDOnvrUTeLan1coDx7W4kwu7AJE2yPAENEQRois5M2TH/v7jS/ZuP+dLLNx/raPv7g4ba0hiZFJTCZ7P4AWDSOMeX3lXf944yt+u3dBCDbP33IcWmbzl7s7ciGJSWvIIiDoPSgSYdYW13116zK/3r+g1oNysfrSsvj7Nk8+t3jAMXcms1CIHoIq5n5HcGvnOtd3Lkrq1CgKiIATrx6VCDR3FPUAF5E1yBoY8/LS2766/a2qDDmoGrQIcMNpRg5cRWVSw1QZHTv8DK01XEV0UcMoGlRRmOmks/tgl0nfR1WhmOOHGmCi944CkKDmYxg5m2fAyERqjBzMckblfMpoTvA/8DNiAC1ztwAAAAAASUVORK5CYII="}</data><field name="ITEM_NAME">Lightning Staff</field><field name="BASE_ITEM">minecraft:stick</field><field name="RARITY">EPIC</field><field name="MAX_STACK">1</field><field name="TEXTURE_SOURCE">upload</field></block><block type="custom_item_use" x="20" y="100"><field name="ITEM_NAME">Lightning Staff</field><statement name="ACTIONS"><block type="custom_action_projectile"><field name="PROJECTILE">snowball</field><field name="SPEED">3</field><next><block type="custom_action_particles"><field name="PARTICLE">portal</field><field name="COUNT">30</field><next><block type="action_play_sound"><field name="SOUND">entity.lightning_bolt.thunder</field></block></next></block></next></block></statement></block><block type="event_command" x="20" y="260"><field name="COMMAND">getstaff</field><statement name="ACTIONS"><block type="custom_item_give"><field name="ITEM_NAME">Lightning Staff</field><field name="AMOUNT">1</field></block></statement></block></xml>`
    },
    {
        name: "🌊 Example: Tsunami Pearl",
        description: "Teleport pearl that pushes away nearby mobs!",
        workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="custom_item_define" x="20" y="20"><field name="ITEM_NAME">Tsunami Pearl</field><field name="BASE_ITEM">minecraft:ender_pearl</field><field name="RARITY">RARE</field><field name="MAX_STACK">16</field></block><block type="custom_item_use" x="20" y="100"><field name="ITEM_NAME">Tsunami Pearl</field><statement name="ACTIONS"><block type="custom_action_teleport_look"><field name="DISTANCE">30</field><next><block type="custom_action_area_effect"><field name="EFFECT">push</field><field name="RADIUS">8</field><field name="POWER">3</field><next><block type="custom_action_particles"><field name="PARTICLE">drip_water</field><field name="COUNT">50</field></block></next></block></next></block></statement></block><block type="event_command" x="20" y="240"><field name="COMMAND">getpearl</field><statement name="ACTIONS"><block type="custom_item_give"><field name="ITEM_NAME">Tsunami Pearl</field><field name="AMOUNT">3</field></block></statement></block></xml>`
    },
    {
        name: "💝 Example: Healing Crystal",
        description: "Diamond that heals nearby players and creates heart particles!",
        workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="custom_item_define" x="20" y="20"><field name="ITEM_NAME">Healing Crystal</field><field name="BASE_ITEM">minecraft:diamond</field><field name="RARITY">RARE</field><field name="MAX_STACK">8</field></block><block type="custom_item_use" x="20" y="100"><field name="ITEM_NAME">Healing Crystal</field><statement name="ACTIONS"><block type="custom_action_area_effect"><field name="EFFECT">heal</field><field name="RADIUS">10</field><field name="POWER">5</field><next><block type="custom_action_particles"><field name="PARTICLE">heart</field><field name="COUNT">40</field><next><block type="action_play_sound"><field name="SOUND">entity.player.levelup</field></block></next></block></next></block></statement></block><block type="event_command" x="20" y="220"><field name="COMMAND">getcrystal</field><statement name="ACTIONS"><block type="custom_item_give"><field name="ITEM_NAME">Healing Crystal</field><field name="AMOUNT">2</field></block></statement></block></xml>`
    },
    {
        name: "🏹 Example: Ice Bow",
        description: "Custom bow that shoots arrows and freezes enemies!",
        workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="custom_item_define" x="20" y="20"><field name="ITEM_NAME">Ice Bow</field><field name="BASE_ITEM">minecraft:stick</field><field name="RARITY">EPIC</field><field name="MAX_STACK">1</field></block><block type="custom_item_use" x="20" y="100"><field name="ITEM_NAME">Ice Bow</field><statement name="ACTIONS"><block type="custom_action_projectile"><field name="PROJECTILE">arrow</field><field name="SPEED">3</field><next><block type="custom_action_area_effect"><field name="EFFECT">freeze</field><field name="RADIUS">5</field><field name="POWER">5</field><next><block type="custom_action_particles"><field name="PARTICLE">smoke</field><field name="COUNT">25</field></block></next></block></next></block></statement></block><block type="event_command" x="20" y="240"><field name="COMMAND">geticebow</field><statement name="ACTIONS"><block type="custom_item_give"><field name="ITEM_NAME">Ice Bow</field><field name="AMOUNT">1</field></block></statement></block></xml>`
    },
    {
        name: "🔥 Example: Flame Sword",
        description: "Advanced: Sword that damages + ignites nearby mobs with effects!",
        workspace: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="custom_item_define" x="20" y="20"><field name="ITEM_NAME">Flame Sword</field><field name="BASE_ITEM">minecraft:gold_ingot</field><field name="RARITY">EPIC</field><field name="MAX_STACK">1</field></block><block type="custom_item_use" x="20" y="100"><field name="ITEM_NAME">Flame Sword</field><statement name="ACTIONS"><block type="custom_action_area_effect"><field name="EFFECT">damage</field><field name="RADIUS">6</field><field name="POWER">4</field><next><block type="custom_action_area_effect"><field name="EFFECT">ignite</field><field name="RADIUS">6</field><field name="POWER">5</field><next><block type="custom_action_particles"><field name="PARTICLE">flame</field><field name="COUNT">50</field><next><block type="player_effect"><field name="EFFECT">STRENGTH</field><field name="DURATION">5</field></block></next></block></next></block></next></block></statement></block><block type="event_command" x="20" y="280"><field name="COMMAND">getflamesword</field><statement name="ACTIONS"><block type="custom_item_give"><field name="ITEM_NAME">Flame Sword</field><field name="AMOUNT">1</field></block></statement></block></xml>`
    }
];

// Initialize project system
function initProjects() {
    // Ensure examples are always loaded
    ensureExamplesLoaded();

    // Get user projects (non-examples)
    const userProjects = getAllProjects().filter(p => !p.id.startsWith('example_'));

    if (userProjects.length === 0) {
        // If no user projects, load the first example
        loadProject('example_0');
    } else {
        // Load the most recently modified user project
        const mostRecent = userProjects.sort((a, b) => b.lastModified - a.lastModified)[0];
        loadProject(mostRecent.id);
    }

    updateProjectsList();
    updateExamplesList();
}

// Ensure example projects are loaded (even if user has projects)
function ensureExamplesLoaded() {
    const allProjects = getAllProjects();
    const existingExamples = allProjects.filter(p => p.id.startsWith('example_'));

    // Check which examples are missing
    const now = Date.now();
    const missingExamples = [];

    EXAMPLE_PROJECTS.forEach((example, index) => {
        const exampleId = 'example_' + index;
        const exists = existingExamples.some(p => p.id === exampleId);

        if (!exists) {
            missingExamples.push({
                id: exampleId,
                name: example.name,
                created: now - (index * 1000),
                lastModified: now - (index * 1000),
                workspace: example.workspace
            });
        }
    });

    // Add any missing examples
    if (missingExamples.length > 0) {
        saveAllProjects([...allProjects, ...missingExamples]);
    }
}

// Load example projects
function loadExampleProjects() {
    const projects = [];
    const now = Date.now();

    EXAMPLE_PROJECTS.forEach((example, index) => {
        projects.push({
            id: 'example_' + index,
            name: example.name,
            created: now - (index * 1000), // Stagger creation times
            lastModified: now - (index * 1000),
            workspace: example.workspace
        });
    });

    saveAllProjects(projects);

    // Load the first example
    loadProject('example_0');
}

// Get all projects from localStorage
function getAllProjects() {
    const projectsData = localStorage.getItem('blockcraft_projects');
    return projectsData ? JSON.parse(projectsData) : [];
}

// Save all projects to localStorage
function saveAllProjects(projects) {
    localStorage.setItem('blockcraft_projects', JSON.stringify(projects));
}

// Create a new project
function createNewProject() {
    const projects = getAllProjects();

    // Ask for project name
    const name = prompt('Enter a name for your new mod:', `My Mod ${projects.length + 1}`);
    if (!name) return;

    const newProject = {
        id: 'project_' + Date.now(),
        name: name,
        created: Date.now(),
        lastModified: Date.now(),
        workspace: null // Will be populated when saved
    };

    projects.push(newProject);
    saveAllProjects(projects);

    // Clear workspace and load new project
    workspace.clear();
    currentProject = newProject;
    updateProjectsList();
}

// Save current workspace to current project
function saveCurrentProject() {
    if (!currentProject) return;

    const projects = getAllProjects();
    const projectIndex = projects.findIndex(p => p.id === currentProject.id);

    if (projectIndex !== -1) {
        // Save workspace state using JSON serialization (supports saveExtraState for custom data like textures)
        const state = Blockly.serialization.workspaces.save(workspace);
        const stateJson = JSON.stringify(state);

        projects[projectIndex].workspace = stateJson;
        projects[projectIndex].lastModified = Date.now();

        saveAllProjects(projects);
        currentProject = projects[projectIndex];
    }
}

// Load a project
function loadProject(projectId) {
    const projects = getAllProjects();
    const project = projects.find(p => p.id === projectId);

    if (!project) return;

    // Clear current workspace
    workspace.clear();

    // Load workspace if it exists
    if (project.workspace) {
        try {
            // Try JSON serialization first (new format with texture data support)
            const state = JSON.parse(project.workspace);
            Blockly.serialization.workspaces.load(state, workspace);
        } catch (e) {
            // Fall back to XML for old projects
            try {
                const xml = Blockly.utils.xml.textToDom(project.workspace);
                Blockly.Xml.domToWorkspace(xml, workspace);
            } catch (xmlError) {
                console.error('Error loading workspace:', xmlError);
            }
        }
    }

    currentProject = project;
    updateProjectsList();
    updateExamplesList();
}

// Delete a project
function deleteProject(projectId, event) {
    event.stopPropagation(); // Prevent loading the project when clicking delete

    // Don't allow deleting examples
    if (projectId.startsWith('example_')) {
        alert('Cannot delete example projects! You can create your own version by opening it and clicking "+ New".');
        return;
    }

    if (!confirm('Are you sure you want to delete this mod?')) return;

    const projects = getAllProjects();
    const filteredProjects = projects.filter(p => p.id !== projectId);
    saveAllProjects(filteredProjects);

    // If we deleted the current project, load another one
    if (currentProject && currentProject.id === projectId) {
        const userProjects = filteredProjects.filter(p => !p.id.startsWith('example_'));
        if (userProjects.length > 0) {
            loadProject(userProjects[0].id);
        } else {
            // Load first example if no user projects left
            loadProject('example_0');
        }
    }

    updateProjectsList();
    updateExamplesList();
}

// Rename a project
function renameProject(projectId, event) {
    event.stopPropagation(); // Prevent loading the project when clicking rename

    // Don't allow renaming examples
    if (projectId.startsWith('example_')) {
        alert('Cannot rename example projects! You can create your own version by opening it and clicking "+ New".');
        return;
    }

    const projects = getAllProjects();
    const project = projects.find(p => p.id === projectId);

    if (!project) return;

    const newName = prompt('Enter new name for this mod:', project.name);
    if (!newName) return;

    const projectIndex = projects.findIndex(p => p.id === projectId);
    projects[projectIndex].name = newName;
    projects[projectIndex].lastModified = Date.now();

    saveAllProjects(projects);

    if (currentProject && currentProject.id === projectId) {
        currentProject.name = newName;
    }

    updateProjectsList();
}

// Update the projects list UI (only user projects, not examples)
function updateProjectsList() {
    const projectsList = document.getElementById('projectsList');
    const allProjects = getAllProjects();

    // Filter to only user projects (not examples)
    const userProjects = allProjects.filter(p => !p.id.startsWith('example_'));

    if (userProjects.length === 0) {
        projectsList.innerHTML = '<div class="empty-projects">No projects yet! Click "+ New" to start.</div>';
        return;
    }

    // Sort by last modified
    userProjects.sort((a, b) => b.lastModified - a.lastModified);

    projectsList.innerHTML = userProjects.map(project => {
        const isActive = currentProject && currentProject.id === project.id;
        const date = new Date(project.lastModified);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        return `
            <div class="project-item ${isActive ? 'active' : ''}" onclick="loadProject('${project.id}')">
                <div class="project-name">${project.name}</div>
                <div class="project-date">${dateStr}</div>
                <div class="project-actions">
                    <button class="project-action-btn project-rename-btn" onclick="renameProject('${project.id}', event)">✏️ Rename</button>
                    <button class="project-action-btn" onclick="deleteProject('${project.id}', event)">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Update the examples list UI
function updateExamplesList() {
    const examplesList = document.getElementById('examplesList');
    const allProjects = getAllProjects();

    // Filter to only examples
    const examples = allProjects.filter(p => p.id.startsWith('example_'));

    if (examples.length === 0) {
        examplesList.innerHTML = '<div class="empty-projects">No examples available.</div>';
        return;
    }

    // Sort by ID to maintain order
    examples.sort((a, b) => a.id.localeCompare(b.id));

    examplesList.innerHTML = examples.map(example => {
        const isActive = currentProject && currentProject.id === example.id;

        return `
            <div class="project-item ${isActive ? 'active' : ''}" onclick="loadProject('${example.id}')">
                <div class="project-name">${example.name}</div>
            </div>
        `;
    }).join('');
}

// Toggle section collapsed/expanded
function toggleSection(sectionName) {
    const section = document.getElementById(sectionName + 'Section');
    const toggle = document.getElementById(sectionName + 'Toggle');

    if (section.classList.contains('section-collapsed')) {
        section.classList.remove('section-collapsed');
        toggle.textContent = '▼';
    } else {
        section.classList.add('section-collapsed');
        toggle.textContent = '▶';
    }
}

// Auto-save on workspace change
function setupAutoSave() {
    workspace.addChangeListener(() => {
        // Debounce auto-save
        if (window.autoSaveTimeout) {
            clearTimeout(window.autoSaveTimeout);
        }
        window.autoSaveTimeout = setTimeout(() => {
            saveCurrentProject();
        }, 1000); // Save 1 second after last change
    });
}
