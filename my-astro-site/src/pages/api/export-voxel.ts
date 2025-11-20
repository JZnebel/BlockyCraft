import type { APIRoute } from 'astro';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { blocks, format, name } = await request.json();

    if (!blocks || !Array.isArray(blocks)) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid blocks data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validFormats = ['nbt', 'litematic', 'schem', 'vox'];
    if (!validFormats.includes(format)) {
      return new Response(
        JSON.stringify({ error: `Invalid format. Must be one of: ${validFormats.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Write blocks data to temp JSON file
    const tempDir = '/tmp';
    const jsonPath = path.join(tempDir, `blocks_${Date.now()}.json`);
    const outputPath = path.join(tempDir, `model_${Date.now()}.${format}`);

    await writeFile(jsonPath, JSON.stringify(blocks));

    // Run Python export script
    const scriptPath = '/home/jordan/blockcraft/my-astro-site/voxel_exporter.py';
    const modelName = name || 'VoxelModel';

    let command: string;
    switch (format) {
      case 'nbt':
        command = `python3 -c "
import sys
sys.path.append('/home/jordan/blockcraft/my-astro-site')
from voxel_exporter import export_to_nbt
import json

with open('${jsonPath}', 'r') as f:
    blocks = json.load(f)

data = export_to_nbt(blocks)

with open('${outputPath}', 'wb') as f:
    f.write(data)
"`;
        break;

      case 'litematic':
        command = `python3 -c "
import sys
sys.path.append('/home/jordan/blockcraft/my-astro-site')
from voxel_exporter import export_to_litematic
import json

with open('${jsonPath}', 'r') as f:
    blocks = json.load(f)

data = export_to_litematic(blocks, name='${modelName}')

with open('${outputPath}', 'wb') as f:
    f.write(data)
"`;
        break;

      case 'schem':
        command = `python3 -c "
import sys
sys.path.append('/home/jordan/blockcraft/my-astro-site')
from voxel_exporter import export_to_schematic
import json

with open('${jsonPath}', 'r') as f:
    blocks = json.load(f)

data = export_to_schematic(blocks)

with open('${outputPath}', 'wb') as f:
    f.write(data)
"`;
        break;

      case 'vox':
        command = `python3 -c "
import sys
sys.path.append('/home/jordan/blockcraft/my-astro-site')
from voxel_exporter import export_to_vox
import json

with open('${jsonPath}', 'r') as f:
    blocks = json.load(f)

data = export_to_vox(blocks)

with open('${outputPath}', 'wb') as f:
    f.write(data)
"`;
        break;
    }

    const { stderr } = await execAsync(command);

    if (stderr && !stderr.includes('DeprecationWarning')) {
      console.error('Python stderr:', stderr);
    }

    // Read the generated file
    const fs = await import('fs/promises');
    const fileData = await fs.readFile(outputPath);

    // Clean up temp files
    try {
      await unlink(jsonPath);
      await unlink(outputPath);
    } catch (e) {
      // Ignore cleanup errors
    }

    // Determine content type
    let contentType: string;
    let extension: string;

    switch (format) {
      case 'nbt':
        contentType = 'application/octet-stream';
        extension = 'nbt';
        break;
      case 'litematic':
        contentType = 'application/octet-stream';
        extension = 'litematic';
        break;
      case 'schem':
        contentType = 'application/octet-stream';
        extension = 'schem';
        break;
      case 'vox':
        contentType = 'application/octet-stream';
        extension = 'vox';
        break;
      default:
        contentType = 'application/octet-stream';
        extension = format;
    }

    // Return the file as download
    return new Response(fileData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${modelName}.${extension}"`,
        'Content-Length': fileData.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to export model' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
