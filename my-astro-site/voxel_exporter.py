"""
Export voxel models to various formats:
- Minecraft Structure (.nbt)
- Litematica (.litematic)
- WorldEdit Schematic (.schem)
- MagicaVoxel (.vox)
"""

import json
import struct
import gzip
from io import BytesIO
from typing import List, Dict, Tuple

def export_to_nbt(blocks: List[Dict], filename: str = "model.nbt") -> bytes:
    """
    Export to Minecraft Structure NBT format
    Uses simplified NBT structure for structure blocks
    """
    try:
        import nbtlib
        from nbtlib.tag import Compound, List as NBTList, Int, String, IntArray, Byte
    except ImportError:
        raise ImportError("nbtlib is required. Install with: pip install nbtlib")

    # Calculate bounds
    if not blocks:
        raise ValueError("No blocks to export")

    xs = [b['x'] for b in blocks]
    ys = [b['y'] for b in blocks]
    zs = [b['z'] for b in blocks]

    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    min_z, max_z = min(zs), max(zs)

    size_x = int(max_x - min_x + 1)
    size_y = int(max_y - min_y + 1)
    size_z = int(max_z - min_z + 1)

    # Create palette and block list
    palette = {}
    palette_list = NBTList[Compound]()
    block_list = NBTList[Compound]()

    for block in blocks:
        block_name = block['block']

        # Add to palette if new
        if block_name not in palette:
            palette[block_name] = len(palette)
            palette_list.append(Compound({
                'Name': String(block_name)
            }))

        # Calculate position relative to minimum
        x = int(round(block['x'] - min_x))
        y = int(round(block['y'] - min_y))
        z = int(round(block['z'] - min_z))

        block_list.append(Compound({
            'pos': NBTList[Int]([Int(x), Int(y), Int(z)]),
            'state': Int(palette[block_name])
        }))

    # Create structure
    structure = Compound({
        'DataVersion': Int(3465),  # Minecraft 1.21.1
        'size': NBTList[Int]([Int(size_x), Int(size_y), Int(size_z)]),
        'palette': palette_list,
        'blocks': block_list,
        'entities': NBTList[Compound]()
    })

    # Write to bytes
    file_obj = BytesIO()
    nbtlib.File(structure, gzipped=True).save(file_obj)
    return file_obj.getvalue()


def export_to_litematic(blocks: List[Dict], filename: str = "model.litematic", name: str = "VoxelModel", author: str = "BlockCraft") -> bytes:
    """
    Export to Litematica format (.litematic)
    """
    try:
        import nbtlib
        from nbtlib.tag import Compound, List as NBTList, Int, String, Long, ByteArray, Byte
    except ImportError:
        raise ImportError("nbtlib is required. Install with: pip install nbtlib")

    # Calculate bounds
    if not blocks:
        raise ValueError("No blocks to export")

    xs = [b['x'] for b in blocks]
    ys = [b['y'] for b in blocks]
    zs = [b['z'] for b in blocks]

    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    min_z, max_z = min(zs), max(zs)

    size_x = int(max_x - min_x + 1)
    size_y = int(max_y - min_y + 1)
    size_z = int(max_z - min_z + 1)

    # Create palette
    palette = {}
    palette_list = NBTList[Compound]()

    # Air is always index 0
    palette['minecraft:air'] = 0
    palette_list.append(Compound({'Name': String('minecraft:air')}))

    # Initialize block state array (all air initially)
    volume = size_x * size_y * size_z
    block_states = [0] * volume

    for block in blocks:
        block_name = block['block']

        # Add to palette if new
        if block_name not in palette:
            palette[block_name] = len(palette)
            palette_list.append(Compound({'Name': String(block_name)}))

        # Calculate position
        x = int(round(block['x'] - min_x))
        y = int(round(block['y'] - min_y))
        z = int(round(block['z'] - min_z))

        # Litematica uses Y-Z-X ordering
        index = (y * size_z * size_x) + (z * size_x) + x
        block_states[index] = palette[block_name]

    # Pack block states into long array (Litematica format)
    bits_per_block = max(2, (len(palette) - 1).bit_length())
    longs = pack_block_states(block_states, bits_per_block)

    # Create region
    region = Compound({
        'BlockStatePalette': palette_list,
        'BlockStates': ByteArray(longs),  # Actually should be LongArray but nbtlib uses ByteArray
        'Position': Compound({
            'x': Int(0),
            'y': Int(0),
            'z': Int(0)
        }),
        'Size': Compound({
            'x': Int(size_x),
            'y': Int(size_y),
            'z': Int(size_z)
        }),
        'TileEntities': NBTList[Compound](),
        'Entities': NBTList[Compound](),
        'PendingBlockTicks': NBTList[Compound](),
        'PendingFluidTicks': NBTList[Compound]()
    })

    # Create litematic structure
    litematic = Compound({
        'Version': Int(6),
        'MinecraftDataVersion': Int(3465),
        'Metadata': Compound({
            'Name': String(name),
            'Author': String(author),
            'Description': String('Generated by BlockCraft AI'),
            'EnclosingSize': Compound({
                'x': Int(size_x),
                'y': Int(size_y),
                'z': Int(size_z)
            }),
            'RegionCount': Int(1),
            'TimeCreated': Long(0),
            'TimeModified': Long(0),
            'TotalBlocks': Int(len(blocks)),
            'TotalVolume': Int(volume)
        }),
        'Regions': Compound({
            'VoxelModel': region
        })
    })

    # Write to gzipped bytes
    file_obj = BytesIO()
    nbtlib.File(litematic, gzipped=True).save(file_obj)
    return file_obj.getvalue()


def pack_block_states(states: List[int], bits_per_block: int) -> bytes:
    """Pack block states into long array format"""
    longs = []
    current_long = 0
    bits_in_long = 0

    for state in states:
        current_long |= (state << bits_in_long)
        bits_in_long += bits_per_block

        if bits_in_long >= 64:
            longs.append(current_long & ((1 << 64) - 1))
            overflow = bits_in_long - 64
            current_long = state >> (bits_per_block - overflow)
            bits_in_long = overflow

    if bits_in_long > 0:
        longs.append(current_long)

    # Convert to bytes (little endian longs)
    return b''.join(struct.pack('<Q', long) for long in longs)


def export_to_schematic(blocks: List[Dict], filename: str = "model.schem") -> bytes:
    """
    Export to WorldEdit Schematic format (.schem)
    """
    try:
        import nbtlib
        from nbtlib.tag import Compound, Int, Short, String, ByteArray
    except ImportError:
        raise ImportError("nbtlib is required. Install with: pip install nbtlib")

    # Calculate bounds
    if not blocks:
        raise ValueError("No blocks to export")

    xs = [b['x'] for b in blocks]
    ys = [b['y'] for b in blocks]
    zs = [b['z'] for b in blocks]

    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    min_z, max_z = min(zs), max(zs)

    width = int(max_x - min_x + 1)
    height = int(max_y - min_y + 1)
    length = int(max_z - min_z + 1)

    # Create palette
    palette = {}
    palette_compound = Compound()

    # Air is always 0
    palette['minecraft:air'] = 0
    palette_compound['minecraft:air'] = Int(0)

    # Initialize block data (all air)
    volume = width * height * length
    block_data = [0] * volume

    for block in blocks:
        block_name = block['block']

        # Add to palette if new
        if block_name not in palette:
            idx = len(palette)
            palette[block_name] = idx
            palette_compound[block_name] = Int(idx)

        # Calculate position (WorldEdit uses X-Z-Y ordering)
        x = int(round(block['x'] - min_x))
        y = int(round(block['y'] - min_y))
        z = int(round(block['z'] - min_z))

        index = (y * length * width) + (z * width) + x
        block_data[index] = palette[block_name]

    # Pack into varint byte array
    block_data_bytes = pack_varint_array(block_data)

    # Create schematic structure
    schematic = Compound({
        'Version': Int(2),
        'DataVersion': Int(3465),
        'Width': Short(width),
        'Height': Short(height),
        'Length': Short(length),
        'Metadata': Compound({
            'Name': String('VoxelModel'),
            'Author': String('BlockCraft')
        }),
        'Palette': palette_compound,
        'BlockData': ByteArray(block_data_bytes)
    })

    # Write to gzipped bytes
    file_obj = BytesIO()
    nbtlib.File(schematic, gzipped=True).save(file_obj)
    return file_obj.getvalue()


def pack_varint_array(data: List[int]) -> bytes:
    """Pack integers into varint format"""
    result = []
    for value in data:
        while value >= 128:
            result.append((value & 0x7F) | 0x80)
            value >>= 7
        result.append(value & 0x7F)
    return bytes(result)


def export_to_vox(blocks: List[Dict], filename: str = "model.vox") -> bytes:
    """
    Export to MagicaVoxel VOX format
    """
    if not blocks:
        raise ValueError("No blocks to export")

    # Calculate bounds
    xs = [b['x'] for b in blocks]
    ys = [b['y'] for b in blocks]
    zs = [b['z'] for b in blocks]

    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    min_z, max_z = min(zs), max(zs)

    size_x = min(256, int(max_x - min_x + 1))
    size_y = min(256, int(max_y - min_y + 1))
    size_z = min(256, int(max_z - min_z + 1))

    # Create color palette from block colors
    color_palette = {}
    voxels = []

    for block in blocks:
        # Extract color from block
        color = extract_color_from_block(block.get('block', 'minecraft:stone'))

        if color not in color_palette:
            if len(color_palette) >= 255:
                continue  # VOX only supports 256 colors
            color_palette[color] = len(color_palette) + 1

        x = max(0, min(255, int(round(block['x'] - min_x))))
        y = max(0, min(255, int(round(block['y'] - min_y))))
        z = max(0, min(255, int(round(block['z'] - min_z))))

        color_idx = color_palette[color]
        voxels.append((x, y, z, color_idx))

    # Build VOX file
    output = BytesIO()

    # Write header
    output.write(b'VOX ')
    output.write(struct.pack('<I', 150))  # Version 150

    # Write MAIN chunk
    output.write(b'MAIN')
    output.write(struct.pack('<I', 0))  # Chunk content size (will calculate)

    # Calculate children size
    children_start = output.tell()

    # Write SIZE chunk
    output.write(b'SIZE')
    output.write(struct.pack('<I', 12))  # Chunk size
    output.write(struct.pack('<I', 0))   # Child chunks size
    output.write(struct.pack('<III', size_x, size_z, size_y))  # VOX uses XZY

    # Write XYZI chunk (voxels)
    output.write(b'XYZI')
    voxel_data = struct.pack('<I', len(voxels))
    for x, y, z, color_idx in voxels:
        voxel_data += struct.pack('<BBBB', x, z, y, color_idx)  # VOX uses XZY
    output.write(struct.pack('<I', len(voxel_data)))
    output.write(struct.pack('<I', 0))  # Child chunks
    output.write(voxel_data)

    # Write RGBA chunk (palette)
    output.write(b'RGBA')
    output.write(struct.pack('<I', 1024))  # Always 256 colors * 4 bytes
    output.write(struct.pack('<I', 0))  # Child chunks

    # Write palette (256 colors)
    palette_list = [0xFFFFFFFF] * 256
    for color, idx in color_palette.items():
        palette_list[idx - 1] = color

    for color in palette_list:
        output.write(struct.pack('<I', color))

    # Update MAIN chunk children size
    children_size = output.tell() - children_start
    output.seek(12)  # Position after MAIN header
    output.write(struct.pack('<I', children_size))

    return output.getvalue()


def extract_color_from_block(block_name: str) -> int:
    """Extract RGBA color from Minecraft block name"""
    # Import the color mapping from VoxelViewer
    from typing import Dict

    MINECRAFT_COLORS: Dict[str, str] = {
        'white': '#FFFFFF', 'orange': '#F9801D', 'magenta': '#C74EBD',
        'light_blue': '#3AB3DA', 'yellow': '#FED83D', 'lime': '#80C71F',
        'pink': '#F38BAA', 'gray': '#474F52', 'light_gray': '#9D9D97',
        'cyan': '#169C9C', 'purple': '#8932B8', 'blue': '#3C44AA',
        'brown': '#825432', 'green': '#5E7C16', 'red': '#B02E26',
        'black': '#1D1D21', 'oak_planks': '#9C7F4E', 'stone': '#7F7F7F',
        'default': '#888888'
    }

    # Try to extract color from block name
    block_name = block_name.replace('minecraft:', '')
    parts = block_name.split('_')

    for part in parts:
        if part in MINECRAFT_COLORS:
            hex_color = MINECRAFT_COLORS[part]
            return hex_to_rgba(hex_color)

    # Try full name
    if block_name in MINECRAFT_COLORS:
        hex_color = MINECRAFT_COLORS[block_name]
        return hex_to_rgba(hex_color)

    # Default gray
    return hex_to_rgba(MINECRAFT_COLORS['default'])


def hex_to_rgba(hex_color: str) -> int:
    """Convert hex color to RGBA integer"""
    hex_color = hex_color.lstrip('#')
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    a = 255
    return (r << 24) | (g << 16) | (b << 8) | a


if __name__ == "__main__":
    # Test with sample data
    sample_blocks = [
        {"block": "minecraft:red_concrete", "x": 0, "y": 0, "z": 0, "scale": [1, 1, 1]},
        {"block": "minecraft:blue_concrete", "x": 1, "y": 0, "z": 0, "scale": [1, 1, 1]},
        {"block": "minecraft:green_concrete", "x": 0, "y": 1, "z": 0, "scale": [1, 1, 1]},
    ]

    print("Testing exports...")

    try:
        nbt_data = export_to_nbt(sample_blocks)
        print(f"NBT: {len(nbt_data)} bytes")
    except Exception as e:
        print(f"NBT failed: {e}")

    try:
        litematic_data = export_to_litematic(sample_blocks)
        print(f"Litematic: {len(litematic_data)} bytes")
    except Exception as e:
        print(f"Litematic failed: {e}")

    try:
        schem_data = export_to_schematic(sample_blocks)
        print(f"Schematic: {len(schem_data)} bytes")
    except Exception as e:
        print(f"Schematic failed: {e}")

    try:
        vox_data = export_to_vox(sample_blocks)
        print(f"VOX: {len(vox_data)} bytes")
    except Exception as e:
        print(f"VOX failed: {e}")
