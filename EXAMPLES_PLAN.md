# BlockCraft Examples Improvement Plan

## Current State
We have 11 examples, but they're mostly:
- Basic commands (4)
- Custom items (7)
- **Missing:** Sensing, If/Then logic, Math, Wait, Repeat Forever, New teleport blocks, World manipulation, Entity interactions

## UI Improvement
The Examples Panel should be reorganized into difficulty sections:
- **Beginner** - Single concepts, 1-3 blocks
- **Intermediate** - Loops & combinations, 4-8 blocks
- **Advanced** - Logic & sensing, conditional behavior
- **Expert** - Complex combinations, multiple systems working together

---

## New Examples to Add (8 total)

### BEGINNER TIER

#### 1. Super Jump
**Difficulty:** Beginner
**Teaches:** Effects + Motion
**Description:** Right-click carrot to get jump boost and launch upward
**Blocks used:**
- Event: Right-click item (carrot)
- Player: Give effect (jump boost, 10 seconds)
- Motion: Launch player (power 2, up)

---

### INTERMEDIATE TIER

#### 2. Health Alert
**Difficulty:** Intermediate
**Teaches:** First if/then logic, sensing
**Description:** Command that checks your health and responds
**Blocks used:**
- Event: Command (/healthcheck)
- If: Player health < 10
  - Then: Heal to 20 hearts + message "Healing you!"
  - Else: Message "You're healthy!"

#### 3. Underwater Helper
**Difficulty:** Intermediate
**Teaches:** Sensing + conditional effects
**Description:** Command that detects if you're in water and helps
**Blocks used:**
- Event: Command (/swim)
- If: Player is in water
  - Then: Give water breathing (30 sec) + speed (30 sec) + message "Swim faster!"
  - Else: Message "You're not in water!"

#### 4. Block Party
**Difficulty:** Intermediate
**Teaches:** Loops with world manipulation
**Description:** Create a circle of colored blocks around you
**Blocks used:**
- Event: Command (/blockparty)
- Repeat 8 times:
  - Place random block (diamond, gold, emerald, glass, glowstone)
  - Wait 0.5 seconds
  - Play sound (block place)

---

### ADVANCED TIER

#### 5. Sneaky Teleporter
**Difficulty:** Advanced
**Teaches:** Logic + new teleport blocks + particles
**Description:** Right-click to teleport forward only if sneaking
**Blocks used:**
- Event: Right-click item (ender pearl)
- If: Player is sneaking
  - Then: Teleport 20 blocks forward + particles (portal, 50) + sound (enderman teleport)
  - Else: Particles (smoke, 10) + message "You must be sneaking!"

#### 6. Auto Diamond Finder
**Difficulty:** Advanced
**Teaches:** Repeat forever + wait + sensing + world manipulation
**Description:** Continuously places diamonds at your feet every 5 seconds if on ground
**Blocks used:**
- Event: Command (/autodiamonds)
- Repeat forever:
  - Wait 5 seconds
  - If: Player is on ground
    - Then: Place diamond block at player + particles (happy villager, 20)

#### 7. Pet Army
**Difficulty:** Advanced
**Teaches:** Entity spawning + following + loops
**Description:** Spawn multiple pigs that follow you around
**Blocks used:**
- Event: Command (/petarmy)
- Message "Summoning your pet army!"
- Repeat 5 times:
  - Spawn pig
  - Wait 0.5 seconds
- Make pig follow player (range 10, duration 30 seconds)
- Give player speed effect (30 seconds)

---

### EXPERT TIER

#### 8. Dragon Summoner Staff (ULTIMATE)
**Difficulty:** Expert
**Teaches:** Everything combined - complex if/then, multiple conditions (AND), sensing, loops, timing, repeat forever, world manipulation, entity control
**Description:** An insanely powerful staff that requires you to be flying AND on fire to summon dragons and cause chaos

**Blocks used:**
- Event: Right-click item (blaze rod)
- If: Player is flying AND player is on fire
  - Then (main sequence):
    1. Title "DRAGON SUMMONER ACTIVATED!"
    2. Repeat 3 times:
       - Spawn ender dragon
       - Wait 1 second
    3. Make ender dragon follow player (range 20, duration 60 seconds)
    4. Repeat 5 times:
       - Strike lightning at player
       - Wait 1 second
    5. Give player effects:
       - Fire resistance (60 seconds)
       - Strength (60 seconds)
       - Speed (60 seconds)
       - Regeneration (60 seconds)
       - Night Vision (60 seconds)
    6. Fill 10 blocks around player with glowstone
    7. Create explosion at player (power 8)
    8. Play sound (thunder)
    9. Spawn particles (dragon breath, 100)
    10. Launch player (power 20, up)
    11. Repeat forever:
        - Wait 3 seconds
        - Strike lightning where player is looking
- Else:
  - Message "You must be on fire and flying to summon dragons!"
  - Set player on fire (5 seconds)
  - Particles (smoke, 30)

**What this demonstrates:**
- ✅ Complex if/then with AND conditions
- ✅ Sensing (flying, on fire)
- ✅ Entity spawning + following
- ✅ Nested loops with timing
- ✅ Repeat forever
- ✅ Multiple effects simultaneously
- ✅ World manipulation (fill, lightning, explosion)
- ✅ Motion (launch)
- ✅ Sound + particles
- ✅ Conditional branching (if/else)
- ✅ Sequential actions with delays

---

## Implementation Notes

### Code Changes Needed
1. Add new examples to `src/utils/startup-examples.ts`
2. Update `src/components/ExamplesPanel/ExamplesPanel.tsx` to group by difficulty
3. Add difficulty badges/colors to each example card
4. Create collapsible sections for each tier

### Backend Support Needed
Before implementing these examples, ensure backend supports:
- [x] If/Then blocks
- [x] Sensing blocks
- [x] Wait blocks
- [x] Repeat forever
- [ ] New teleport blocks (forward, vertical, spawn) - NEED TO ADD
- [x] World fill
- [x] Lightning
- [x] Entity follow
- [ ] AND/OR logic combinations - NEED TO ADD

### Example XML Generation
Each example needs properly formatted Blockly XML that will be generated programmatically using the Blockly workspace.
