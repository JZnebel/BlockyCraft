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

def create_circle_layer(y, radius, scale, block_id):
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
            "block": f"minecraft:{block_id}",
            "x": round(x, 3),
            "y": round(y, 3),
            "z": round(z, 3),
            "scale": [scale, scale, scale]
        })

    return blocks

def create_square_layer(y, size, scale, block_id):
    """
    Create one square horizontal layer of blocks

    Args:
        y: Height of this layer
        size: Half-width of the square (radius equivalent)
        scale: Scale of each block
        block_id: Minecraft block ID

    Returns:
        List of block dictionaries forming a square perimeter
    """
    if size <= 0:
        return []

    blocks = []
    # Number of blocks per side
    blocks_per_side = max(2, int((2 * size) / scale))

    # Create blocks along each of the 4 sides
    for i in range(blocks_per_side):
        t = (i / blocks_per_side) * 2 - 1  # -1 to 1
        pos = t * size

        # Top side (z = size)
        blocks.append({
            "block": f"minecraft:{block_id}",
            "x": round(pos, 3),
            "y": round(y, 3),
            "z": round(size, 3),
            "scale": [scale, scale, scale]
        })

        # Bottom side (z = -size)
        blocks.append({
            "block": f"minecraft:{block_id}",
            "x": round(pos, 3),
            "y": round(y, 3),
            "z": round(-size, 3),
            "scale": [scale, scale, scale]
        })

        # Right side (x = size)
        blocks.append({
            "block": f"minecraft:{block_id}",
            "x": round(size, 3),
            "y": round(y, 3),
            "z": round(pos, 3),
            "scale": [scale, scale, scale]
        })

        # Left side (x = -size)
        blocks.append({
            "block": f"minecraft:{block_id}",
            "x": round(-size, 3),
            "y": round(y, 3),
            "z": round(pos, 3),
            "scale": [scale, scale, scale]
        })

    return blocks

def create_sphere(radius, scale, block_id, center_y=0.0):
    """
    Create a hollow spherical shell

    Args:
        radius: Sphere radius
        scale: Block scale
        color: Minecraft color
        block_material: Material type
        center_y: Y position of sphere BASE (bottom)

    Returns:
        List of blocks forming sphere surface
    """
    blocks = []
    vertical_spacing = scale * 0.9
    num_layers = int((2 * radius) / vertical_spacing)

    for i in range(num_layers + 1):
        # Y from 0 to 2*radius, starting at center_y (base)
        y_local = i * vertical_spacing
        y = center_y + y_local

        # Convert to sphere coordinate (-radius to +radius centered at sphere center)
        y_sphere = y_local - radius

        if abs(y_sphere) >= radius:
            # At pole, just center block
            blocks.append({
                "block": f"minecraft:{block_id}",
                "x": 0.0,
                "y": round(y, 3),
                "z": 0.0,
                "scale": [scale, scale, scale]
            })
        else:
            # Calculate horizontal radius at this height
            horizontal_radius = math.sqrt(radius**2 - y_sphere**2)
            blocks.extend(create_circle_layer(y, horizontal_radius, scale, block_id))

    return blocks

def create_cylinder(height, radius, scale, block_id, center_y=0.0, use_square=False):
    """
    Create a cylindrical shell (or square prism if use_square=True)

    Args:
        height: Total height of cylinder
        radius: Cylinder radius (or half-width if square)
        scale: Block scale
        block_id: Minecraft block ID
        center_y: Y position of cylinder BASE (bottom)
        use_square: If True, creates square cross-section instead of circular

    Returns:
        List of blocks forming cylinder surface
    """
    blocks = []
    vertical_spacing = scale * 0.9
    num_layers = int(height / vertical_spacing)

    start_y = center_y  # Start from base

    layer_func = create_square_layer if use_square else create_circle_layer

    for i in range(num_layers + 1):
        y = start_y + (i * vertical_spacing)
        blocks.extend(layer_func(y, radius, scale, block_id))

    return blocks

def create_tapered_shape(profile, scale, block_id, use_square=False):
    """
    Create a shape with varying radius at different heights

    Args:
        profile: List of {"y": height, "radius": radius} points
        scale: Block scale
        block_id: Block ID string (e.g., "orange_concrete")
        use_square: If True, creates square cross-section instead of circular

    Returns:
        List of blocks forming tapered shape
    """
    blocks = []

    # Sort profile by y
    profile_sorted = sorted(profile, key=lambda p: p["y"], reverse=True)

    # Generate layers between profile points
    vertical_spacing = scale * 0.9

    layer_func = create_square_layer if use_square else create_circle_layer

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

            blocks.extend(layer_func(y, radius, scale, block_id))

    return blocks

def create_box(width, height, depth, scale, block_id, center=(0, 0, 0)):
    """
    Create a hollow box

    Args:
        width: X dimension
        height: Y dimension
        depth: Z dimension
        scale: Block scale
        color: Minecraft color
        block_material: Material type
        center: (x, y, z) position - y is BASE (bottom), x/z are centered

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
            # Proper spacing: divide by (num-1) to reach both ends
            x = cx - width/2 + (ix * width / (num_x - 1)) if num_x > 1 else cx
            y = cy + (iy * height / (num_y - 1)) if num_y > 1 else cy

            for z in [cz - depth/2, cz + depth/2]:
                blocks.append({
                    "block": f"minecraft:{block_id}",
                    "x": round(x, 3),
                    "y": round(y, 3),
                    "z": round(z, 3),
                    "scale": [scale, scale, scale]
                })

    # Left and right faces (x = ±width/2)
    for iz in range(1, num_z - 1):  # Skip corners already added
        for iy in range(num_y):
            z = cz - depth/2 + (iz * depth / (num_z - 1)) if num_z > 1 else cz
            y = cy + (iy * height / (num_y - 1)) if num_y > 1 else cy

            for x in [cx - width/2, cx + width/2]:
                blocks.append({
                    "block": f"minecraft:{block_id}",
                    "x": round(x, 3),
                    "y": round(y, 3),
                    "z": round(z, 3),
                    "scale": [scale, scale, scale]
                })

    # Top and bottom faces
    for ix in range(1, num_x - 1):  # Skip edges already added
        for iz in range(1, num_z - 1):
            x = cx - width/2 + (ix * width / (num_x - 1)) if num_x > 1 else cx
            z = cz - depth/2 + (iz * depth / (num_z - 1)) if num_z > 1 else cz

            for y in [cy, cy + height]:  # Bottom and top
                blocks.append({
                    "block": f"minecraft:{block_id}",
                    "x": round(x, 3),
                    "y": round(y, 3),
                    "z": round(z, 3),
                    "scale": [scale, scale, scale]
                })

    return blocks

def create_cone(height, base_radius, scale, block_id, center_y=0.0, use_square=False):
    """
    Create a cone shape (tapered from base to point, or pyramid if use_square=True)

    Args:
        height: Total height of cone
        base_radius: Radius at the base (or half-width if square)
        scale: Block scale
        block_id: Minecraft block ID
        center_y: Y position of cone base
        use_square: If True, creates square cross-section (pyramid) instead of circular

    Returns:
        List of blocks forming cone surface
    """
    profile = [
        {"y": center_y + height, "radius": 0.01},  # Tip (tiny radius to avoid empty)
        {"y": center_y, "radius": base_radius}      # Base
    ]
    return create_tapered_shape(profile, scale, block_id, use_square)

def create_pyramid(base_width, height, scale, block_id, center=(0, 0, 0)):
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
                "block": f"minecraft:{block_id}",
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
                offset = -half_width + (j * current_width / (num_blocks - 1)) if num_blocks > 1 else 0

                # Front and back edges
                blocks.append({"block": f"minecraft:{block_id}",
                              "x": round(cx + offset, 3), "y": round(y, 3), "z": round(cz - half_width, 3),
                              "scale": [scale, scale, scale]})
                blocks.append({"block": f"minecraft:{block_id}",
                              "x": round(cx + offset, 3), "y": round(y, 3), "z": round(cz + half_width, 3),
                              "scale": [scale, scale, scale]})

                # Left and right edges (skip corners)
                if j > 0 and j < num_blocks - 1:
                    blocks.append({"block": f"minecraft:{block_id}",
                                  "x": round(cx - half_width, 3), "y": round(y, 3), "z": round(cz + offset, 3),
                                  "scale": [scale, scale, scale]})
                    blocks.append({"block": f"minecraft:{block_id}",
                                  "x": round(cx + half_width, 3), "y": round(y, 3), "z": round(cz + offset, 3),
                                  "scale": [scale, scale, scale]})

    return blocks

def create_torus(major_radius, minor_radius, scale, block_id, center_y=0.0):
    """
    Create a torus (donut) shape

    Args:
        major_radius: Radius from center to tube center
        minor_radius: Radius of the tube
        scale: Block scale
        color: Minecraft color
        block_material: Material type
        center_y: Y position of torus BASE (bottom)

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
                "block": f"minecraft:{block_id}",
                "x": round(tube_center_x + offset_x, 3),
                "y": round(center_y + minor_radius + offset_y, 3),  # offset from base
                "z": round(tube_center_z + offset_z, 3),
                "scale": [scale, scale, scale]
            })

    return blocks

def create_plane(width, depth, scale, block_id, center=(0, 0, 0)):
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
            x = cx - width/2 + (ix * width / (num_x - 1)) if num_x > 1 else cx
            z = cz - depth/2 + (iz * depth / (num_z - 1)) if num_z > 1 else cz

            blocks.append({
                "block": f"minecraft:{block_id}",
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

def create_text(text, scale, block_id, position=(0, 0, 0), char_spacing=1.0):
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
                    x = current_x + (4 - col_idx) * scale  # Flip horizontally (5 columns = 0-4)

                    blocks.append({
                        "block": f"minecraft:{block_id}",
                        "x": round(x, 3),
                        "y": round(y, 3),
                        "z": round(start_z, 3),
                        "scale": [scale, scale, scale]
                    })

        # Move to next character position (5 columns + spacing)
        current_x += (5 + char_spacing) * scale

    return blocks

def create_hemisphere(radius, scale, block_id, center_y=0.0):
    """
    Create a hollow hemisphere (half sphere, dome)

    Args:
        radius: Hemisphere radius
        scale: Block scale
        color: Minecraft color
        block_material: Material type
        center_y: Y position of hemisphere BASE (bottom)

    Returns:
        List of blocks forming hemisphere surface
    """
    blocks = []
    vertical_spacing = scale * 0.9
    num_layers = int(radius / vertical_spacing)

    for i in range(num_layers + 1):
        y = center_y + (i * vertical_spacing)

        # Height above base
        h = i * vertical_spacing
        if h >= radius:
            # Top - single block
            blocks.append({
                "block": f"minecraft:{block_id}",
                "x": 0.0,
                "y": round(y, 3),
                "z": 0.0,
                "scale": [scale, scale, scale]
            })
        else:
            # Calculate horizontal radius at this height
            horizontal_radius = math.sqrt(radius**2 - h**2)
            blocks.extend(create_circle_layer(y, horizontal_radius, scale, block_id))

    return blocks

def create_ellipsoid(radius_x, radius_y, radius_z, scale, block_id, center_y=0.0):
    """
    Create a hollow ellipsoid (stretched sphere)

    Args:
        radius_x: Radius in X direction
        radius_y: Radius in Y direction (height)
        radius_z: Radius in Z direction
        scale: Block scale
        color: Minecraft color
        block_material: Material type
        center_y: Y position of ellipsoid BASE (bottom)

    Returns:
        List of blocks forming ellipsoid surface
    """
    blocks = []
    vertical_spacing = scale * 0.9
    num_layers = int((2 * radius_y) / vertical_spacing)

    for i in range(num_layers + 1):
        # Y from 0 to 2*radius_y
        y_local = i * vertical_spacing
        y = center_y + y_local

        # Normalize to -1 to 1 range for ellipsoid formula
        t = (y_local / radius_y) - 1.0  # -1 at bottom, +1 at top

        if abs(t) >= 1.0:
            # Pole - single block
            blocks.append({
                "block": f"minecraft:{block_id}",
                "x": 0.0,
                "y": round(y, 3),
                "z": 0.0,
                "scale": [scale, scale, scale]
            })
        else:
            # Ellipse at this height: x²/rx² + z²/rz² = 1 - t²
            factor = math.sqrt(1 - t**2)
            horizontal_radius_x = radius_x * factor
            horizontal_radius_z = radius_z * factor

            # Create elliptical layer
            num_blocks = calculate_blocks_for_circumference(max(horizontal_radius_x, horizontal_radius_z), scale)

            for j in range(num_blocks):
                angle = (2 * math.pi * j) / num_blocks
                x = horizontal_radius_x * math.cos(angle)
                z = horizontal_radius_z * math.sin(angle)

                blocks.append({
                    "block": f"minecraft:{block_id}",
                    "x": round(x, 3),
                    "y": round(y, 3),
                    "z": round(z, 3),
                    "scale": [scale, scale, scale]
                })

    return blocks

def create_wedge(width, height, depth, scale, block_id, center=(0, 0, 0)):
    """
    Create a wedge/ramp shape (triangular prism)

    Args:
        width: X dimension (base width)
        height: Y dimension (vertical height)
        depth: Z dimension (depth of wedge)
        scale: Block scale
        color: Minecraft color
        block_material: Material type
        center: (x, y, z) position - y is BASE (bottom), x/z are centered

    Returns:
        List of blocks forming wedge surface
    """
    blocks = []
    cx, cy, cz = center

    num_y = max(2, int(height / scale))
    num_z = max(2, int(depth / scale))

    for iy in range(num_y):
        # Width decreases linearly with height
        t = iy / (num_y - 1) if num_y > 1 else 0  # 0 at base, 1 at top
        current_width = width * (1 - t)
        y = cy + (iy * height / (num_y - 1)) if num_y > 1 else cy

        if current_width < scale:
            # Top edge - single line of blocks
            for iz in range(num_z):
                z = cz - depth/2 + (iz * depth / (num_z - 1)) if num_z > 1 else cz
                blocks.append({
                    "block": f"minecraft:{block_id}",
                    "x": round(cx, 3),
                    "y": round(y, 3),
                    "z": round(z, 3),
                    "scale": [scale, scale, scale]
                })
        else:
            # Sloped sides
            num_x = max(2, int(current_width / scale))
            for iz in range(num_z):
                z = cz - depth/2 + (iz * depth / (num_z - 1)) if num_z > 1 else cz

                # Left and right edges
                for x in [cx - current_width/2, cx + current_width/2]:
                    blocks.append({
                        "block": f"minecraft:{block_id}",
                        "x": round(x, 3),
                        "y": round(y, 3),
                        "z": round(z, 3),
                        "scale": [scale, scale, scale]
                    })

            # Front and back faces
            for ix in range(1, num_x - 1):
                x = cx - current_width/2 + (ix * current_width / (num_x - 1)) if num_x > 1 else cx

                for z in [cz - depth/2, cz + depth/2]:
                    blocks.append({
                        "block": f"minecraft:{block_id}",
                        "x": round(x, 3),
                        "y": round(y, 3),
                        "z": round(z, 3),
                        "scale": [scale, scale, scale]
                    })

    return blocks

def create_arch(width, height, depth, thickness, scale, block_id, center=(0, 0, 0)):
    """
    Create an arch (rounded doorway/window)

    Args:
        width: Inner width of arch opening
        height: Inner height of arch
        depth: Depth/thickness of wall
        thickness: Wall thickness around arch
        scale: Block scale
        color: Minecraft color
        block_material: Material type
        center: (x, y, z) position - y is BASE (bottom), x/z are centered

    Returns:
        List of blocks forming arch
    """
    blocks = []
    cx, cy, cz = center

    # Arch is semicircular on top
    radius = width / 2
    num_z = max(2, int(depth / scale))

    # Build vertical sides
    side_height = height - radius
    if side_height > 0:
        num_y = max(2, int(side_height / scale))
        for iy in range(num_y):
            y = cy + (iy * side_height / (num_y - 1)) if num_y > 1 else cy

            for iz in range(num_z):
                z = cz - depth/2 + (iz * depth / (num_z - 1)) if num_z > 1 else cz

                # Left and right pillars
                for x in [cx - width/2 - thickness, cx + width/2 + thickness]:
                    num_thick = max(2, int(thickness / scale))
                    for it in range(num_thick):
                        offset_x = (it * thickness / (num_thick - 1)) if num_thick > 1 else 0
                        actual_x = x + offset_x if x < cx else x - offset_x
                        blocks.append({
                            "block": f"minecraft:{block_id}",
                            "x": round(actual_x, 3),
                            "y": round(y, 3),
                            "z": round(z, 3),
                            "scale": [scale, scale, scale]
                        })

    # Build semicircular top
    vertical_spacing = scale * 0.9
    num_layers = int(radius / vertical_spacing)

    for i in range(num_layers + 1):
        h = i * vertical_spacing
        y = cy + side_height + h

        if h >= radius:
            continue

        horizontal_radius = math.sqrt(radius**2 - h**2)

        # Only draw outer edge (thickness)
        num_blocks = calculate_blocks_for_circumference(horizontal_radius + thickness, scale)

        for j in range(num_blocks // 2 + 1):  # Only top half of circle
            angle = math.pi * j / (num_blocks // 2) if num_blocks > 0 else 0

            for iz in range(num_z):
                z = cz - depth/2 + (iz * depth / (num_z - 1)) if num_z > 1 else cz

                # Outer and inner radius
                for r in [horizontal_radius + thickness, horizontal_radius]:
                    x = cx + r * math.cos(angle)
                    blocks.append({
                        "block": f"minecraft:{block_id}",
                        "x": round(x, 3),
                        "y": round(y, 3),
                        "z": round(z, 3),
                        "scale": [scale, scale, scale]
                    })

    return blocks

def create_star(points, inner_radius, outer_radius, scale, block_id, center_y=0.0, height=1.0):
    """
    Create a 3D star shape (vertical extrusion for visibility from all angles)

    Args:
        points: Number of star points (e.g., 5 for pentagram)
        inner_radius: Radius of inner vertices
        outer_radius: Radius of outer points
        scale: Block scale
        color: Minecraft color
        block_material: Material type
        center_y: Y position of star BASE (bottom)
        height: Vertical height/thickness of star

    Returns:
        List of blocks forming 3D star
    """
    blocks = []

    # Create star by alternating between inner and outer radius
    num_vertices = points * 2
    vertical_spacing = scale * 0.9
    num_layers = max(1, int(height / vertical_spacing))

    # Create multiple layers to give it vertical thickness
    for layer in range(num_layers + 1):
        y = center_y + (layer * vertical_spacing)

        for i in range(num_vertices):
            # Alternate between outer (even) and inner (odd) radii
            radius = outer_radius if i % 2 == 0 else inner_radius
            angle = (2 * math.pi * i) / num_vertices

            x = radius * math.cos(angle)
            z = radius * math.sin(angle)

            blocks.append({
                "block": f"minecraft:{block_id}",
                "x": round(x, 3),
                "y": round(y, 3),
                "z": round(z, 3),
                "scale": [scale, scale, scale]
            })

            # Fill in lines between vertices
            next_i = (i + 1) % num_vertices
            next_radius = outer_radius if next_i % 2 == 0 else inner_radius
            next_angle = (2 * math.pi * next_i) / num_vertices

            # Linear interpolation between points
            num_steps = max(2, int(abs(x - next_radius * math.cos(next_angle)) / scale))
            for step in range(1, num_steps):
                t = step / num_steps
                interp_angle = angle + t * (next_angle - angle)
                interp_radius = radius + t * (next_radius - radius)

                interp_x = interp_radius * math.cos(interp_angle)
                interp_z = interp_radius * math.sin(interp_angle)

                blocks.append({
                    "block": f"minecraft:{block_id}",
                    "x": round(interp_x, 3),
                    "y": round(y, 3),
                    "z": round(interp_z, 3),
                    "scale": [scale, scale, scale]
                })

    return blocks

def create_ring(outer_radius, inner_radius, height, scale, block_id, center_y=0.0):
    """
    Create a ring/torus cross-section (flat platform with hole)

    Args:
        outer_radius: Outer radius of ring
        inner_radius: Inner radius (size of hole)
        height: Vertical height of ring
        scale: Block scale
        color: Minecraft color
        block_material: Material type
        center_y: Y position of ring BASE (bottom)

    Returns:
        List of blocks forming ring
    """
    blocks = []
    vertical_spacing = scale * 0.9
    num_layers = int(height / vertical_spacing)

    for i in range(num_layers + 1):
        y = center_y + (i * vertical_spacing)

        # Draw outer circle
        blocks.extend(create_circle_layer(y, outer_radius, scale, block_id))

        # Draw inner circle (creates hole)
        if inner_radius > 0:
            blocks.extend(create_circle_layer(y, inner_radius, scale, block_id))

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

def rotate_blocks_x(blocks, degrees):
    """
    Rotate blocks around X axis (pitch/tilt)
    Uses exact 90-degree rotations with integer coordinate swapping
    
    Args:
        blocks: List of block dictionaries to rotate (modified in place)
        degrees: Rotation angle (90, -90, 180, or -180)
    
    Returns:
        blocks (modified in place)
    
    Use for:
        - Tilting objects up/down
        - Rotating shells/domes to face forward/backward
        - Angling wings or fins
    """
    if degrees not in [90, -90, 180, -180]:
        print(f"Warning: rotate_blocks_x only supports 90-degree increments, got {degrees}")
        return blocks
    
    if not blocks:
        return blocks
    
    # Find bounding box to rotate around center
    min_y = min(block["y"] for block in blocks)
    max_y = max(block["y"] for block in blocks)
    min_z = min(block["z"] for block in blocks)
    max_z = max(block["z"] for block in blocks)
    
    for block in blocks:
        # Translate to origin (use min corner as pivot)
        y = block["y"] - min_y
        z = block["z"] - min_z
        
        # Apply rotation (coordinate swapping for exact 90-degree rotations)
        if degrees == 90:
            # Rotate 90° around X: Y→Z, Z→-Y
            new_y = (max_z - min_z) - z
            new_z = y
        elif degrees == -90:
            # Rotate -90° around X: Y→-Z, Z→Y
            new_y = z
            new_z = (max_y - min_y) - y
        elif degrees == 180 or degrees == -180:
            # Rotate 180° around X: Y→-Y, Z→-Z
            new_y = (max_y - min_y) - y
            new_z = (max_z - min_z) - z
        
        # Translate back
        block["y"] = new_y + min_y
        block["z"] = new_z + min_z
    
    return blocks

def rotate_blocks_y(blocks, degrees):
    """
    Rotate blocks around Y axis (yaw/turn)
    Uses exact 90-degree rotations with integer coordinate swapping
    
    Args:
        blocks: List of block dictionaries to rotate (modified in place)
        degrees: Rotation angle (90, -90, 180, or -180)
    
    Returns:
        blocks (modified in place)
    
    Use for:
        - Turning objects left/right
        - Changing facing direction
        - Rotating limbs around vertical axis
    """
    if degrees not in [90, -90, 180, -180]:
        print(f"Warning: rotate_blocks_y only supports 90-degree increments, got {degrees}")
        return blocks
    
    if not blocks:
        return blocks
    
    # Find bounding box
    min_x = min(block["x"] for block in blocks)
    max_x = max(block["x"] for block in blocks)
    min_z = min(block["z"] for block in blocks)
    max_z = max(block["z"] for block in blocks)
    
    for block in blocks:
        # Translate to origin
        x = block["x"] - min_x
        z = block["z"] - min_z
        
        # Apply rotation
        if degrees == 90:
            # Rotate 90° around Y: X→-Z, Z→X
            new_x = (max_z - min_z) - z
            new_z = x
        elif degrees == -90:
            # Rotate -90° around Y: X→Z, Z→-X
            new_x = z
            new_z = (max_x - min_x) - x
        elif degrees == 180 or degrees == -180:
            # Rotate 180° around Y: X→-X, Z→-Z
            new_x = (max_x - min_x) - x
            new_z = (max_z - min_z) - z
        
        # Translate back
        block["x"] = new_x + min_x
        block["z"] = new_z + min_z
    
    return blocks

def rotate_blocks_z(blocks, degrees):
    """
    Rotate blocks around Z axis (roll)
    Uses exact 90-degree rotations with integer coordinate swapping
    
    Args:
        blocks: List of block dictionaries to rotate (modified in place)
        degrees: Rotation angle (90, -90, 180, or -180)
    
    Returns:
        blocks (modified in place)
    
    Use for:
        - Rolling objects to the side
        - Tilting wings or surfaces
        - Rotating flat objects
    """
    if degrees not in [90, -90, 180, -180]:
        print(f"Warning: rotate_blocks_z only supports 90-degree increments, got {degrees}")
        return blocks
    
    if not blocks:
        return blocks
    
    # Find bounding box
    min_x = min(block["x"] for block in blocks)
    max_x = max(block["x"] for block in blocks)
    min_y = min(block["y"] for block in blocks)
    max_y = max(block["y"] for block in blocks)
    
    for block in blocks:
        # Translate to origin
        x = block["x"] - min_x
        y = block["y"] - min_y
        
        # Apply rotation
        if degrees == 90:
            # Rotate 90° around Z: X→Y, Y→-X
            new_x = (max_y - min_y) - y
            new_y = x
        elif degrees == -90:
            # Rotate -90° around Z: X→-Y, Y→X
            new_x = y
            new_y = (max_x - min_x) - x
        elif degrees == 180 or degrees == -180:
            # Rotate 180° around Z: X→-X, Y→-Y
            new_x = (max_x - min_x) - x
            new_y = (max_y - min_y) - y
        
        # Translate back
        block["x"] = new_x + min_x
        block["y"] = new_y + min_y
    
    return blocks
