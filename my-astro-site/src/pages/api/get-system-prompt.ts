import type { APIRoute } from 'astro';
import { VOXEL_SYSTEM_PROMPT } from '../../config/voxel-system-prompt';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  // Get complexity from query params
  const complexity = url.searchParams.get('complexity') || 'medium';

  // Map complexity to guidance (same as generate-voxel.ts)
  const sizeGuidance: Record<string, string> = {
    small: 'Simple - Instantly recognizable, clean silhouette, minimal detail',
    medium: 'Medium - Clear features, good proportions, some detail work',
    large: 'Detailed - Smooth surfaces, intricate features, multiple materials',
    ultra: 'Ultra-Detailed - Masterpiece quality, maximum fidelity, photorealistic details',
    custom: '', // No guidance - AI decides everything
  };

  const guidance = sizeGuidance[complexity] || sizeGuidance.medium;

  // Build user message template based on complexity
  let userMessageTemplate: string;

  if (complexity === 'custom') {
    userMessageTemplate = `Create a 3D voxel model of: {PROMPT}

You have complete creative freedom. Choose the best:
- Block scale (any size you think works)
- Number of blocks (as many as needed to make it look good)
- Level of detail (whatever makes sense for this object)
- Physical dimensions (any size)

Build a hollow structure (surface only) that looks amazing in Minecraft.
Output only the generate() function code.`;
  } else {
    userMessageTemplate = `Create a 3D voxel model of: {PROMPT}

Complexity: ${guidance}

Build a hollow structure (surface only) that looks good in Minecraft.
You control both the block scale AND the number of blocks - choose what makes sense for this level of complexity.
The model can be any physical size - users will scale it themselves in-game if needed.

Output only the generate() function code.`;
  }

  // Return full prompt with placeholder
  const fullPrompt = `${VOXEL_SYSTEM_PROMPT}\n\n${userMessageTemplate}`;

  return new Response(
    JSON.stringify({ systemPrompt: fullPrompt }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
