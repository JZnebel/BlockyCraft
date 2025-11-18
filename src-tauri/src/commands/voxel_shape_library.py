"""
Voxel Shape Library - Scientific building blocks for voxel models
Used by AI to generate high-quality voxel structures
"""

import math

def calculate_blocks_for_circumference(radius, block_scale):
    """Calculate how many blocks fit around a circle without overlap"""
    circumference = 2 * math.pi * radius
    num_blocks = int(circumference / block_scale)
    return max(8, num_blocks if num_blocks % 2 == 0 else num_blocks + 1)

def create_circle_layer(y, radius, scale, color, block_material="concrete"):
    """
    Create one circular horizontal layer of blocks

    Args:
        y: Height of this layer
        radius: Radius of the circle
        scale: Scale of each block
        color: Minecraft color (white, red, orange, etc.)
        block_material: Material type (concrete, terracotta, wool, etc.)

    Returns:
        List of block dictionaries
    """
    if radius <= 0:
        return []

    num_blocks = calculate_blocks_for_circumference(radius, scale)
    blocks = []

    for i in range(num_blocks):
        angle = (2 * math.pi * i) / num_blocks
        x = radius * math.cos(angle)
        z = radius * math.sin(angle)

        blocks.append({
            "block": f"minecraft:{color}_{block_material}" if block_material else f"minecraft:{color}",
            "x": round(x, 3),
            "y": round(y, 3),
            "z": round(z, 3),
            "scale": [scale, scale, scale]
        })

    return blocks

def create_sphere(radius, scale, color, block_material="concrete"):
    """
    Create a hollow spherical shell

    Args:
        radius: Sphere radius
        scale: Block scale
        color: Minecraft color
        block_material: Material type

    Returns:
        List of blocks forming sphere surface
    """
    blocks = []
    vertical_spacing = scale * 0.9
    num_layers = int((2 * radius) / vertical_spacing)

    for i in range(num_layers + 1):
        y = radius - (i * vertical_spacing)

        if abs(y) >= radius:
            # At pole, just center block
            blocks.append({
                "block": f"minecraft:{color}_{block_material}" if block_material else f"minecraft:{color}",
                "x": 0.0,
                "y": round(y, 3),
                "z": 0.0,
                "scale": [scale, scale, scale]
            })
        else:
            # Calculate horizontal radius at this height
            horizontal_radius = math.sqrt(radius**2 - y**2)
            blocks.extend(create_circle_layer(y, horizontal_radius, scale, color, block_material))

    return blocks

def create_cylinder(height, radius, scale, color, block_material="concrete", center_y=0.0):
    """
    Create a cylindrical shell

    Args:
        height: Total height of cylinder
        radius: Cylinder radius
        scale: Block scale
        color: Minecraft color
        block_material: Material type
        center_y: Y position of cylinder center

    Returns:
        List of blocks forming cylinder surface
    """
    blocks = []
    vertical_spacing = scale * 0.9
    num_layers = int(height / vertical_spacing)

    start_y = center_y - (height / 2)

    for i in range(num_layers + 1):
        y = start_y + (i * vertical_spacing)
        blocks.extend(create_circle_layer(y, radius, scale, color, block_material))

    return blocks

def create_tapered_shape(profile, scale, color_map, block_material="concrete"):
    """
    Create a shape with varying radius at different heights

    Args:
        profile: List of {"y": height, "radius": radius} points
        scale: Block scale
        color_map: List of {"y_range": [min, max], "color": "color_name"}
        block_material: Material type

    Returns:
        List of blocks forming tapered shape
    """
    blocks = []

    # Sort profile by y
    profile_sorted = sorted(profile, key=lambda p: p["y"], reverse=True)

    # Generate layers between profile points
    vertical_spacing = scale * 0.9

    for i in range(len(profile_sorted) - 1):
        p1 = profile_sorted[i]
        p2 = profile_sorted[i + 1]

        y_start = p1["y"]
        y_end = p2["y"]
        r_start = p1["radius"]
        r_end = p2["radius"]

        num_steps = max(2, int(abs(y_start - y_end) / vertical_spacing))

        for step in range(num_steps + 1):
            t = step / num_steps
            y = y_start + t * (y_end - y_start)
            radius = r_start + t * (r_end - r_start)

            # Find color for this y
            color = "white"  # default
            for color_spec in color_map:
                y_min, y_max = color_spec["y_range"]
                if y_min >= y >= y_max:
                    color = color_spec["color"]
                    break

            blocks.extend(create_circle_layer(y, radius, scale, color, block_material))

    return blocks

def create_box(width, height, depth, scale, color, block_material="concrete", center=(0, 0, 0)):
    """
    Create a hollow box

    Args:
        width: X dimension
        height: Y dimension
        depth: Z dimension
        scale: Block scale
        color: Minecraft color
        block_material: Material type
        center: (x, y, z) center position

    Returns:
        List of blocks forming box surface
    """
    blocks = []
    cx, cy, cz = center

    # Calculate how many blocks on each edge
    num_x = max(2, int(width / scale))
    num_y = max(2, int(height / scale))
    num_z = max(2, int(depth / scale))

    # Front and back faces (z = ±depth/2)
    for ix in range(num_x):
        for iy in range(num_y):
            x = cx - width/2 + (ix * width / num_x)
            y = cy - height/2 + (iy * height / num_y)

            for z in [cz - depth/2, cz + depth/2]:
                blocks.append({
                    "block": f"minecraft:{color}_{block_material}" if block_material else f"minecraft:{color}",
                    "x": round(x, 3),
                    "y": round(y, 3),
                    "z": round(z, 3),
                    "scale": [scale, scale, scale]
                })

    # Left and right faces (x = ±width/2)
    for iz in range(1, num_z - 1):  # Skip corners already added
        for iy in range(num_y):
            z = cz - depth/2 + (iz * depth / num_z)
            y = cy - height/2 + (iy * height / num_y)

            for x in [cx - width/2, cx + width/2]:
                blocks.append({
                    "block": f"minecraft:{color}_{block_material}" if block_material else f"minecraft:{color}",
                    "x": round(x, 3),
                    "y": round(y, 3),
                    "z": round(z, 3),
                    "scale": [scale, scale, scale]
                })

    # Top and bottom faces (y = ±height/2)
    for ix in range(1, num_x - 1):  # Skip edges already added
        for iz in range(1, num_z - 1):
            x = cx - width/2 + (ix * width / num_x)
            z = cz - depth/2 + (iz * depth / num_z)

            for y in [cy - height/2, cy + height/2]:
                blocks.append({
                    "block": f"minecraft:{color}_{block_material}" if block_material else f"minecraft:{color}",
                    "x": round(x, 3),
                    "y": round(y, 3),
                    "z": round(z, 3),
                    "scale": [scale, scale, scale]
                })

    return blocks

def create_cone(height, base_radius, scale, color, block_material="concrete", center_y=0.0):
    """
    Create a cone shape (tapered from base to point)

    Args:
        height: Total height of cone
        base_radius: Radius at the base
        scale: Block scale
        color: Minecraft color
        block_material: Material type
        center_y: Y position of cone base

    Returns:
        List of blocks forming cone surface
    """
    profile = [
        {"y": center_y + height, "radius": 0.01},  # Tip (tiny radius to avoid empty)
        {"y": center_y, "radius": base_radius}      # Base
    ]
    color_map = [{"y_range": [center_y + height, center_y], "color": color}]
    return create_tapered_shape(profile, scale, color_map, block_material)

def create_pyramid(base_width, height, scale, color, block_material="concrete", center=(0, 0, 0)):
    """
    Create a pyramid with square base

    Args:
        base_width: Width of square base
        height: Height of pyramid
        scale: Block scale
        color: Minecraft color
        block_material: Material type
        center: (x, y, z) center position of base

    Returns:
        List of blocks forming pyramid surface
    """
    blocks = []
    cx, cy, cz = center
    vertical_spacing = scale * 0.9
    num_layers = int(height / vertical_spacing)

    for i in range(num_layers + 1):
        t = i / num_layers  # 0 at base, 1 at tip
        y = cy + (i * vertical_spacing)
        current_width = base_width * (1 - t)

        if current_width < scale:
            # Tip - single block
            blocks.append({
                "block": f"minecraft:{color}_{block_material}" if block_material else f"minecraft:{color}",
                "x": cx,
                "y": round(y, 3),
                "z": cz,
                "scale": [scale, scale, scale]
            })
        else:
            # Create square layer
            num_blocks = max(2, int(current_width / scale))
            half_width = current_width / 2

            # Four edges of the square
            for j in range(num_blocks):
                offset = -half_width + (j * current_width / num_blocks)

                # Front and back edges
                blocks.append({"block": f"minecraft:{color}_{block_material}" if block_material else f"minecraft:{color}",
                              "x": round(cx + offset, 3), "y": round(y, 3), "z": round(cz - half_width, 3),
                              "scale": [scale, scale, scale]})
                blocks.append({"block": f"minecraft:{color}_{block_material}" if block_material else f"minecraft:{color}",
                              "x": round(cx + offset, 3), "y": round(y, 3), "z": round(cz + half_width, 3),
                              "scale": [scale, scale, scale]})

                # Left and right edges (skip corners)
                if j > 0 and j < num_blocks - 1:
                    blocks.append({"block": f"minecraft:{color}_{block_material}" if block_material else f"minecraft:{color}",
                                  "x": round(cx - half_width, 3), "y": round(y, 3), "z": round(cz + offset, 3),
                                  "scale": [scale, scale, scale]})
                    blocks.append({"block": f"minecraft:{color}_{block_material}" if block_material else f"minecraft:{color}",
                                  "x": round(cx + half_width, 3), "y": round(y, 3), "z": round(cz + offset, 3),
                                  "scale": [scale, scale, scale]})

    return blocks

def create_torus(major_radius, minor_radius, scale, color, block_material="concrete", center_y=0.0):
    """
    Create a torus (donut) shape

    Args:
        major_radius: Radius from center to tube center
        minor_radius: Radius of the tube
        scale: Block scale
        color: Minecraft color
        block_material: Material type
        center_y: Y position of torus center

    Returns:
        List of blocks forming torus surface
    """
    blocks = []

    # Number of segments around the major circle
    major_segments = max(16, int(2 * math.pi * major_radius / scale))
    # Number of segments around the minor circle
    minor_segments = max(8, int(2 * math.pi * minor_radius / scale))

    for i in range(major_segments):
        major_angle = (2 * math.pi * i) / major_segments

        # Center of tube at this major angle
        tube_center_x = major_radius * math.cos(major_angle)
        tube_center_z = major_radius * math.sin(major_angle)

        for j in range(minor_segments):
            minor_angle = (2 * math.pi * j) / minor_segments

            # Offset from tube center
            offset_x = minor_radius * math.cos(minor_angle) * math.cos(major_angle)
            offset_y = minor_radius * math.sin(minor_angle)
            offset_z = minor_radius * math.cos(minor_angle) * math.sin(major_angle)

            blocks.append({
                "block": f"minecraft:{color}_{block_material}" if block_material else f"minecraft:{color}",
                "x": round(tube_center_x + offset_x, 3),
                "y": round(center_y + offset_y, 3),
                "z": round(tube_center_z + offset_z, 3),
                "scale": [scale, scale, scale]
            })

    return blocks

def create_plane(width, depth, scale, color, block_material="concrete", center=(0, 0, 0)):
    """
    Create a flat rectangular plane

    Args:
        width: X dimension
        depth: Z dimension
        scale: Block scale
        color: Minecraft color
        block_material: Material type
        center: (x, y, z) center position

    Returns:
        List of blocks forming plane surface
    """
    blocks = []
    cx, cy, cz = center

    num_x = max(2, int(width / scale))
    num_z = max(2, int(depth / scale))

    for ix in range(num_x):
        for iz in range(num_z):
            x = cx - width/2 + (ix * width / num_x)
            z = cz - depth/2 + (iz * depth / num_z)

            blocks.append({
                "block": f"minecraft:{color}_{block_material}" if block_material else f"minecraft:{color}",
                "x": round(x, 3),
                "y": round(cy, 3),
                "z": round(z, 3),
                "scale": [scale, scale, scale]
            })

    return blocks

# Simple 5x7 bitmap font for text rendering
FONT_5X7 = {
    'A': [
        "  X  ",
        " X X ",
        "X   X",
        "XXXXX",
        "X   X",
        "X   X",
        "X   X"
    ],
    'B': [
        "XXXX ",
        "X   X",
        "X   X",
        "XXXX ",
        "X   X",
        "X   X",
        "XXXX "
    ],
    'C': [
        " XXX ",
        "X   X",
        "X    ",
        "X    ",
        "X    ",
        "X   X",
        " XXX "
    ],
    'D': [
        "XXXX ",
        "X   X",
        "X   X",
        "X   X",
        "X   X",
        "X   X",
        "XXXX "
    ],
    'E': [
        "XXXXX",
        "X    ",
        "X    ",
        "XXXX ",
        "X    ",
        "X    ",
        "XXXXX"
    ],
    'F': [
        "XXXXX",
        "X    ",
        "X    ",
        "XXXX ",
        "X    ",
        "X    ",
        "X    "
    ],
    'G': [
        " XXX ",
        "X   X",
        "X    ",
        "X  XX",
        "X   X",
        "X   X",
        " XXX "
    ],
    'H': [
        "X   X",
        "X   X",
        "X   X",
        "XXXXX",
        "X   X",
        "X   X",
        "X   X"
    ],
    'I': [
        "XXXXX",
        "  X  ",
        "  X  ",
        "  X  ",
        "  X  ",
        "  X  ",
        "XXXXX"
    ],
    'J': [
        "XXXXX",
        "    X",
        "    X",
        "    X",
        "    X",
        "X   X",
        " XXX "
    ],
    'K': [
        "X   X",
        "X  X ",
        "X X  ",
        "XX   ",
        "X X  ",
        "X  X ",
        "X   X"
    ],
    'L': [
        "X    ",
        "X    ",
        "X    ",
        "X    ",
        "X    ",
        "X    ",
        "XXXXX"
    ],
    'M': [
        "X   X",
        "XX XX",
        "X X X",
        "X   X",
        "X   X",
        "X   X",
        "X   X"
    ],
    'N': [
        "X   X",
        "XX  X",
        "X X X",
        "X  XX",
        "X   X",
        "X   X",
        "X   X"
    ],
    'O': [
        " XXX ",
        "X   X",
        "X   X",
        "X   X",
        "X   X",
        "X   X",
        " XXX "
    ],
    'P': [
        "XXXX ",
        "X   X",
        "X   X",
        "XXXX ",
        "X    ",
        "X    ",
        "X    "
    ],
    'Q': [
        " XXX ",
        "X   X",
        "X   X",
        "X   X",
        "X X X",
        "X  X ",
        " XX X"
    ],
    'R': [
        "XXXX ",
        "X   X",
        "X   X",
        "XXXX ",
        "X X  ",
        "X  X ",
        "X   X"
    ],
    'S': [
        " XXX ",
        "X   X",
        "X    ",
        " XXX ",
        "    X",
        "X   X",
        " XXX "
    ],
    'T': [
        "XXXXX",
        "  X  ",
        "  X  ",
        "  X  ",
        "  X  ",
        "  X  ",
        "  X  "
    ],
    'U': [
        "X   X",
        "X   X",
        "X   X",
        "X   X",
        "X   X",
        "X   X",
        " XXX "
    ],
    'V': [
        "X   X",
        "X   X",
        "X   X",
        "X   X",
        "X   X",
        " X X ",
        "  X  "
    ],
    'W': [
        "X   X",
        "X   X",
        "X   X",
        "X   X",
        "X X X",
        "XX XX",
        "X   X"
    ],
    'X': [
        "X   X",
        "X   X",
        " X X ",
        "  X  ",
        " X X ",
        "X   X",
        "X   X"
    ],
    'Y': [
        "X   X",
        "X   X",
        " X X ",
        "  X  ",
        "  X  ",
        "  X  ",
        "  X  "
    ],
    'Z': [
        "XXXXX",
        "    X",
        "   X ",
        "  X  ",
        " X   ",
        "X    ",
        "XXXXX"
    ],
    '0': [
        " XXX ",
        "X   X",
        "X  XX",
        "X X X",
        "XX  X",
        "X   X",
        " XXX "
    ],
    '1': [
        "  X  ",
        " XX  ",
        "  X  ",
        "  X  ",
        "  X  ",
        "  X  ",
        "XXXXX"
    ],
    '2': [
        " XXX ",
        "X   X",
        "    X",
        "   X ",
        "  X  ",
        " X   ",
        "XXXXX"
    ],
    '3': [
        " XXX ",
        "X   X",
        "    X",
        "  XX ",
        "    X",
        "X   X",
        " XXX "
    ],
    '4': [
        "   X ",
        "  XX ",
        " X X ",
        "X  X ",
        "XXXXX",
        "   X ",
        "   X "
    ],
    '5': [
        "XXXXX",
        "X    ",
        "XXXX ",
        "    X",
        "    X",
        "X   X",
        " XXX "
    ],
    '6': [
        "  XX ",
        " X   ",
        "X    ",
        "XXXX ",
        "X   X",
        "X   X",
        " XXX "
    ],
    '7': [
        "XXXXX",
        "    X",
        "   X ",
        "  X  ",
        " X   ",
        " X   ",
        " X   "
    ],
    '8': [
        " XXX ",
        "X   X",
        "X   X",
        " XXX ",
        "X   X",
        "X   X",
        " XXX "
    ],
    '9': [
        " XXX ",
        "X   X",
        "X   X",
        " XXXX",
        "    X",
        "   X ",
        " XX  "
    ],
    ' ': [
        "     ",
        "     ",
        "     ",
        "     ",
        "     ",
        "     ",
        "     "
    ],
    '!': [
        "  X  ",
        "  X  ",
        "  X  ",
        "  X  ",
        "  X  ",
        "     ",
        "  X  "
    ],
    '.': [
        "     ",
        "     ",
        "     ",
        "     ",
        "     ",
        "     ",
        "  X  "
    ],
    '-': [
        "     ",
        "     ",
        "     ",
        "XXXXX",
        "     ",
        "     ",
        "     "
    ],
    '_': [
        "     ",
        "     ",
        "     ",
        "     ",
        "     ",
        "     ",
        "XXXXX"
    ],
}

def create_text(text, scale, color, block_material="concrete", position=(0, 0, 0), char_spacing=1.0):
    """
    Create 3D text from string using bitmap font

    Args:
        text: String to render (uppercase letters, numbers, and basic punctuation)
        scale: Block scale
        color: Minecraft color
        block_material: Material type
        position: (x, y, z) starting position (bottom-left of first character)
        char_spacing: Extra spacing between characters (in block units)

    Returns:
        List of blocks forming text
    """
    blocks = []
    start_x, start_y, start_z = position
    current_x = start_x

    text = text.upper()  # Convert to uppercase

    for char in text:
        if char not in FONT_5X7:
            # Skip unknown characters
            continue

        bitmap = FONT_5X7[char]

        # Render this character
        for row_idx, row in enumerate(bitmap):
            y = start_y + (6 - row_idx) * scale  # Top to bottom (row 0 = top)

            for col_idx, pixel in enumerate(row):
                if pixel == 'X':
                    x = current_x + col_idx * scale

                    blocks.append({
                        "block": f"minecraft:{color}_{block_material}" if block_material else f"minecraft:{color}",
                        "x": round(x, 3),
                        "y": round(y, 3),
                        "z": round(start_z, 3),
                        "scale": [scale, scale, scale]
                    })

        # Move to next character position (5 columns + spacing)
        current_x += (5 + char_spacing) * scale

    return blocks

def add_glow(blocks, brightness_sky=15, brightness_block=15):
    """Add brightness property to all blocks"""
    for block in blocks:
        block["brightness"] = {"sky": brightness_sky, "block": brightness_block}
    return blocks

# Example usage
if __name__ == "__main__":
    # Test sphere
    sphere_blocks = create_sphere(radius=1.0, scale=0.2, color="red")
    print(f"Sphere: {len(sphere_blocks)} blocks")

    # Test cylinder
    cylinder_blocks = create_cylinder(height=2.0, radius=0.5, scale=0.2, color="blue")
    print(f"Cylinder: {len(cylinder_blocks)} blocks")

    # Test tapered shape (lantern-like)
    lantern_profile = [
        {"y": 1.2, "radius": 0.3},
        {"y": 0.8, "radius": 0.6},
        {"y": 0.4, "radius": 0.4},
        {"y": 0.0, "radius": 0.6},
        {"y": -0.4, "radius": 0.3}
    ]
    lantern_color_map = [
        {"y_range": [1.2, -0.4], "color": "orange"}
    ]
    lantern_blocks = create_tapered_shape(lantern_profile, scale=0.18, color_map=lantern_color_map)
    print(f"Lantern: {len(lantern_blocks)} blocks")
