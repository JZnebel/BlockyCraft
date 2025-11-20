def generate():
    """
    Simple House Template - Learn by modifying this!

    TIP: Click "📚 API Docs" to see all available shape functions!
    TIP: Visit /docs for complete kid-friendly tutorials!

    Try changing:
    - Block types (stone_bricks, oak_planks, glass, etc.)
    - Loop ranges to make it bigger or smaller
    - Add more windows, doors, or decorations!
    """
    blocks = []
    components = []

    # COMPONENT 1: Ground/Foundation
    ground_blocks = []
    for x in range(-5, 6):  # 11 blocks wide
        for z in range(-5, 6):  # 11 blocks deep
            ground_blocks.append({
                "block": "minecraft:grass_block",
                "x": x * 0.3,
                "y": 0,
                "z": z * 0.3,
                "scale": [0.3, 0.3, 0.3],
                "brightness": {"sky": 15, "block": 0}
            })

    blocks.extend(ground_blocks)  # Add to main blocks list!
    components.append({
        "id": "ground",
        "type": "box",
        "blocks": ground_blocks,
        "description": "Grass foundation"
    })

    # COMPONENT 2: House Walls
    wall_blocks = []

    # Front and back walls
    # TIP: We "cut out" holes for door and windows by skipping those positions!
    for x in range(-3, 4):
        for y in range(1, 4):  # 3 blocks tall
            # Front wall - skip door (x=0, y=1,2) and windows (x=-2,2, y=2)
            is_door = (x == 0 and y in [1, 2])
            is_window = ((x == -2 or x == 2) and y == 2)

            if not (is_door or is_window):
                wall_blocks.append({
                    "block": "minecraft:oak_planks",
                    "x": x * 0.3,
                    "y": y * 0.3,
                    "z": -3 * 0.3,
                    "scale": [0.3, 0.3, 0.3],
                    "brightness": {"sky": 15, "block": 0}
                })

            # Back wall (no holes)
            wall_blocks.append({
                "block": "minecraft:oak_planks",
                "x": x * 0.3,
                "y": y * 0.3,
                "z": 3 * 0.3,
                "scale": [0.3, 0.3, 0.3],
                "brightness": {"sky": 15, "block": 0}
            })

    # Left and right walls
    for z in range(-2, 3):  # Skip corners (already done)
        for y in range(1, 4):
            # Left wall
            wall_blocks.append({
                "block": "minecraft:oak_planks",
                "x": -3 * 0.3,
                "y": y * 0.3,
                "z": z * 0.3,
                "scale": [0.3, 0.3, 0.3],
                "brightness": {"sky": 15, "block": 0}
            })
            # Right wall
            wall_blocks.append({
                "block": "minecraft:oak_planks",
                "x": 3 * 0.3,
                "y": y * 0.3,
                "z": z * 0.3,
                "scale": [0.3, 0.3, 0.3],
                "brightness": {"sky": 15, "block": 0}
            })

    blocks.extend(wall_blocks)  # Add to main blocks list!
    components.append({
        "id": "walls",
        "type": "box",
        "blocks": wall_blocks,
        "description": "House walls"
    })

    # COMPONENT 3: Left Window (glass)
    left_window_blocks = []
    left_window_blocks.append({
        "block": "minecraft:light_blue_stained_glass",
        "x": -2 * 0.3,
        "y": 2 * 0.3,
        "z": -3 * 0.3,
        "scale": [0.3, 0.3, 0.3],
        "brightness": {"sky": 15, "block": 0}
    })

    blocks.extend(left_window_blocks)  # Add to main blocks list!
    components.append({
        "id": "left_window",
        "type": "box",
        "blocks": left_window_blocks,
        "description": "Left glass window"
    })

    # COMPONENT 4: Right Window (glass)
    right_window_blocks = []
    right_window_blocks.append({
        "block": "minecraft:light_blue_stained_glass",
        "x": 2 * 0.3,
        "y": 2 * 0.3,
        "z": -3 * 0.3,
        "scale": [0.3, 0.3, 0.3],
        "brightness": {"sky": 15, "block": 0}
    })

    blocks.extend(right_window_blocks)  # Add to main blocks list!
    components.append({
        "id": "right_window",
        "type": "box",
        "blocks": right_window_blocks,
        "description": "Right glass window"
    })

    # COMPONENT 5: Door
    door_blocks = []
    # Door at x=0, y=1,2 (matches holes we cut in wall)
    for y in range(1, 3):  # 2 blocks tall
        door_blocks.append({
            "block": "minecraft:oak_door",
            "x": 0,
            "y": y * 0.3,
            "z": -3 * 0.3,
            "scale": [0.3, 0.3, 0.3],
            "brightness": {"sky": 15, "block": 0}
        })

    blocks.extend(door_blocks)  # Add to main blocks list!
    components.append({
        "id": "door",
        "type": "box",
        "blocks": door_blocks,
        "description": "Front door"
    })

    # COMPONENT 6: Roof
    roof_blocks = []

    # Simple triangular roof
    roof_layers = [
        {"z_range": range(-4, 5), "y": 4},   # Bottom layer
        {"z_range": range(-3, 4), "y": 5},   # Middle layer
        {"z_range": range(-2, 3), "y": 6},   # Upper layer
        {"z_range": range(-1, 2), "y": 7},   # Peak layer
    ]

    for layer in roof_layers:
        for z in layer["z_range"]:
            for x in range(-3, 4):
                roof_blocks.append({
                    "block": "minecraft:brick",
                    "x": x * 0.3,
                    "y": layer["y"] * 0.3,
                    "z": z * 0.3,
                    "scale": [0.3, 0.3, 0.3],
                    "brightness": {"sky": 15, "block": 0}
                })

    blocks.extend(roof_blocks)  # Add to main blocks list!
    components.append({
        "id": "roof",
        "type": "box",
        "blocks": roof_blocks,
        "description": "Brick roof"
    })

    return {
        "blocks": blocks,
        "components": components
    }
