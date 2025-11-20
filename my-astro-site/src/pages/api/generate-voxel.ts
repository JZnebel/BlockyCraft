import type { APIRoute } from 'astro';
import { spawn } from 'child_process';
import { writeFile } from 'fs/promises';
import path from 'path';
import { VOXEL_SYSTEM_PROMPT } from '../../config/voxel-system-prompt';

// Make this route server-rendered (not static)
export const prerender = false;

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = 3; // 3 requests per IP
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    // Reset or create new record
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Check if rate limiting is enabled
  const rateLimitEnabled = import.meta.env.ENABLE_RATE_LIMIT !== 'false';

  let remaining = 999; // Default for disabled rate limiting

  if (rateLimitEnabled) {
    // Check rate limit
    const rateLimitCheck = checkRateLimit(clientAddress);
    remaining = rateLimitCheck.remaining;

    if (!rateLimitCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded. Please try again in 1 hour or use the free prompt option.',
          rateLimitRemaining: 0,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }
  }

  try {
    const { prompt, size = 'medium' } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid prompt' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate prompt length
    if (prompt.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Prompt too long (max 200 characters)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Map size to quality guidance (outcome-focused, not prescriptive)
    const sizeGuidance: Record<string, string> = {
      small: 'Simple - Instantly recognizable, clean silhouette, minimal detail',
      medium: 'Medium - Clear features, good proportions, some detail work',
      large: 'Detailed - Smooth surfaces, intricate features, multiple materials',
      ultra: 'Ultra-Detailed - Masterpiece quality, maximum fidelity, photorealistic details',
      custom: '', // No guidance - AI decides everything
    };

    const guidance = sizeGuidance[size] || sizeGuidance.medium;

    // Get API key from environment variable
    const apiKey = import.meta.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({
          error: 'API not configured. Please use the free prompt option.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build user message based on complexity level
    let userMessage: string;

    if (size === 'custom') {
      // No constraints - let AI decide everything
      userMessage = `Create a 3D voxel model of: ${prompt}

You have complete creative freedom. Choose the best:
- Block scale (any size you think works)
- Number of blocks (as many as needed to make it look good)
- Level of detail (whatever makes sense for this object)
- Physical dimensions (any size)

Build a hollow structure (surface only) that looks amazing in Minecraft.
Output only the generate() function code.`;
    } else {
      // Standard complexity levels with guidance
      userMessage = `Create a 3D voxel model of: ${prompt}

Complexity: ${guidance}

Build a hollow structure (surface only) that looks good in Minecraft.
You control both the block scale AND the number of blocks - choose what makes sense for this level of complexity.
The model can be any physical size - users will scale it themselves in-game if needed.

Output only the generate() function code.`;
    }

    // Call OpenAI API with same settings as real app
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.1-2025-11-13',
        messages: [
          {
            role: 'system',
            content: VOXEL_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const code = data.choices[0].message.content;

    console.log('[CodeGen] Received code, length:', code.length);

    // Extract AI's calculated block count from code comments
    let estimatedBlocks: number | null = null;
    const totalMatch = code.match(/TOTAL EXPECTED:?\s*[~]?(\d+[,\d]*)\s*blocks?/i);
    if (totalMatch) {
      const numStr = totalMatch[1].replace(/,/g, '');
      estimatedBlocks = parseInt(numStr, 10);
      console.log(`[CodeGen] AI calculated ${estimatedBlocks} blocks (from comment)`);
    }

    // Extract code from markdown if needed
    let cleanCode = code;
    if (code.includes('```python')) {
      const match = code.match(/```python\n([\s\S]*?)\n```/);
      cleanCode = match ? match[1] : code;
    } else if (code.includes('```')) {
      const match = code.match(/```\n([\s\S]*?)\n```/);
      cleanCode = match ? match[1] : code;
    }

    console.log('[CodeGen] Returning code to client for Pyodide execution...');

    // Return the Python code to the client for browser-side execution
    // This eliminates server CPU usage and scales infinitely!
    return new Response(
      JSON.stringify({
        success: true,
        code: cleanCode,
        estimatedBlocks: estimatedBlocks,
        rateLimitRemaining: remaining,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': remaining.toString(),
        },
      }
    );
  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Generation failed. Please try the free prompt option.',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
