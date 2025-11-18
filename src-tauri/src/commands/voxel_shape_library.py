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
