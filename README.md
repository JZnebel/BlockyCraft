# BlockCraft 🎮

**Make Minecraft Mods with Blocks - No Coding Required!**

A Scratch-like visual programming platform for creating Minecraft datapacks, designed for kids ages 7-10.

## 🚀 Quick Start

1. **Start the BlockCraft Editor:**
   ```bash
   cd /home/jordan/blockcraft
   python3 serve.py
   ```

2. **Open in your browser:**
   - Go to: http://localhost:8080

3. **Start creating!**
   - Drag blocks from the left
   - Connect them together
   - See your code on the right
   - Click "Deploy to Minecraft!"

## 📚 Tutorials

### Quest 1: Magic Message
**Goal:** Make a /hello command that says "Hello!"

**Steps:**
1. Drag the purple "when command" block
2. Change the command to `/hello`
3. Drag the green "display message" block underneath
4. Connect them together
5. Export and test!

### Quest 2: Lightning Wand
**Goal:** Right-click a stick to summon lightning

**Steps:**
1. Drag "when player right-clicks [Stick]"
2. Drag "spawn [Lightning ⚡] at player"
3. Connect them
4. Export and get a stick in Minecraft
5. Right-click and watch the lightning!

### Quest 3: Lucky Blocks
**Goal:** Breaking dirt gives random items

**Steps:**
1. Drag "when player breaks [Dirt]"
2. Drag "give player [Diamond]"
3. Connect them
4. Export and break some dirt!

## 🎯 Available Blocks

### ⚡ Events (Purple)
- When player types command
- When player right-clicks [item]
- When player breaks [block]

### 🎬 Actions (Green)
- Display message
- Spawn mob at player
- Give player items
- Play sound

### 🧠 Logic (Orange)
- If player is [condition]
- Wait [X] seconds

### 🎲 Data (Red)
- Random number 1 to [X]

## 📦 Installing Your Mod

After clicking "Deploy to Minecraft!", you'll get a text file with instructions.

**Manual Installation:**
1. Find your Minecraft world folder
2. Go to `world/datapacks/`
3. Create a folder called `my_mod`
4. Create the file structure from the instructions
5. In Minecraft, type: `/reload`
6. Your mod is active!

## 🛠️ Development

BlockCraft is built with:
- **Google Blockly** - Visual programming library
- **Vanilla JavaScript** - No frameworks needed
- **Python HTTP Server** - Simple local serving

### Project Structure
```
blockcraft/
├── index.html          # Main editor page
├── main.js             # Blockly initialization
├── blocks/             # Custom block definitions
│   ├── events.js
│   ├── actions.js
│   └── logic.js
├── generators/         # Code generators
│   └── datapack.js     # Blockly → mcfunction
├── exporter/           # Datapack builder
│   └── builder.js
└── serve.py            # Local web server
```

## 🎓 For Parents & Teachers

BlockCraft teaches:
- **Sequencing**: Blocks run in order
- **Events**: Trigger actions based on conditions
- **Logic**: If/then statements
- **Variables**: Coming soon!
- **Debugging**: See what your code does

Kids learn programming concepts while creating something they can immediately play with in Minecraft!

## 🔜 Coming Soon

- [ ] More block types (teleport, particles, etc.)
- [ ] Save/load projects
- [ ] Share mods with friends
- [ ] Auto-deploy to local server
- [ ] Visual tutorials
- [ ] Achievement system

## 📝 Notes

- BlockCraft generates **datapacks** for Minecraft Java Edition 1.21.1
- Works with vanilla Minecraft - no mods required!
- Safe for kids - can't crash the game or computer
- All blocks generate valid Minecraft commands

## 🐛 Troubleshooting

**"Nothing happens when I export!"**
- Make sure you have at least one event block (purple)
- Check that blocks are connected properly

**"My mod doesn't work in Minecraft!"**
- Did you run `/reload` after installing?
- Check the file structure matches the instructions
- Make sure you're in the right world folder

**"The website won't load!"**
- Is the Python server running?
- Try: http://localhost:8080
- Check no other program is using port 8080

## 💡 Tips

- Start with simple mods (Quest 1)
- Test each mod before adding more blocks
- Read the tooltips when you hover over blocks
- Save your work by exporting frequently
- Have fun and experiment!

---

Made with ❤️ for kids who love Minecraft and want to learn coding!
