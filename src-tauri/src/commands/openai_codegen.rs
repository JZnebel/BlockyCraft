use serde::{Deserialize, Serialize};
use std::process::Command;
use std::fs;
use super::openai::BlockDisplayEntity;

#[derive(Debug, Serialize, Deserialize)]
struct OpenAIRequest {
    model: String,
    messages: Vec<Message>,
    temperature: f32,
}

#[derive(Debug, Serialize, Deserialize)]
struct Message {
    role: String,
    content: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct OpenAIResponse {
    choices: Vec<Choice>,
    usage: Option<Usage>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Usage {
    prompt_tokens: u32,
    completion_tokens: u32,
    total_tokens: u32,
}

#[derive(Debug, Serialize, Deserialize)]
struct Choice {
    message: MessageContent,
}

#[derive(Debug, Serialize, Deserialize)]
struct MessageContent {
    content: String,
}

#[tauri::command]
pub async fn generate_block_display_model_codegen(
    api_key: String,
    prompt: String,
    size: String,
) -> Result<Vec<BlockDisplayEntity>, String> {
    // System prompt for code generation
    let system_prompt = r#"You are a Python code generator for 3D voxel models in Minecraft.

AVAILABLE LIBRARY FUNCTIONS WITH EXACT BLOCK COUNT FORMULAS:

1. create_circle_layer(y, radius, scale, color, block_material="concrete")
   Formula: max(8, int(2 * π * radius / scale))
   Example: radius=3, scale=0.3 → max(8, int(18.85/0.3)) = 62 blocks

2. create_sphere(radius, scale, color, block_material="concrete")
   Formula: num_layers = int(2*radius / (scale*0.9))
            total ≈ num_layers * avg_circle_blocks
   Example: radius=2, scale=0.25 → ~14 layers * ~35 blocks/layer = ~490 blocks

3. create_cylinder(height, radius, scale, color, block_material="concrete", center_y=0.0)
   Formula: num_layers = int(height / (scale*0.9))
            blocks_per_layer = max(8, int(2*π*radius / scale))
            total = num_layers * blocks_per_layer
   Example: height=5, radius=1.5, scale=0.3 → int(5/0.27) * int(9.42/0.3) = 18*31 = 558 blocks

4. create_box(width, height, depth, scale, color, block_material="concrete", center=(0,0,0))
   Formula: num_x = max(2, int(width/scale))
            num_y = max(2, int(height/scale))
            num_z = max(2, int(depth/scale))
            total ≈ 2*(num_x*num_y + num_y*num_z + num_x*num_z) - edges
   Example: width=6, height=8, depth=6, scale=0.3 → 20*26 + 26*20 + 20*20 ≈ 1500 blocks

5. create_tapered_shape(profile, scale, color_map, block_material="concrete")
   Formula: Complex - estimate ~500-2000 blocks depending on profile complexity

6. add_glow(blocks, brightness_sky=15, brightness_block=15)
   Returns: None (modifies in place, adds 0 blocks)

CRITICAL: CALCULATE BEFORE CODING!
Before writing any code, manually calculate:
  Total blocks = sum of all create_* calls using formulas above
If total > limit, reduce components or increase scale!

CRITICAL - VOXEL MODEL SCALE (NOT MINECRAFT BUILDING SCALE!):

These are SMALL decorative models, NOT full-size Minecraft buildings!

CORRECT PHYSICAL DIMENSIONS:
- Simple objects: 1-3 units total size (radius=1.5, height=2, width=2)
- Medium objects: 3-6 units total size (radius=3, height=5, width=4)
- Complex objects: 6-12 units total size (radius=6, height=10, width=8)

BLOCK COUNT LIMITS (MANDATORY - TOTAL ACROSS ALL COMPONENTS):
- Simple → MAX 2000 blocks TOTAL (keep it to 1-3 simple shapes)
- Medium → MAX 5000 blocks TOTAL (4-8 shapes maximum)
- Detailed → MAX 10000 blocks TOTAL (8-15 shapes maximum)

CRITICAL: Each function call adds blocks! A castle with 4 walls + 4 towers + keep + details = TOO MANY COMPONENTS!

COMPOSITIONAL COMPLEXITY:
- Simple → 1-3 shapes (e.g., sphere + cylinder base)
- Medium → 4-8 shapes (e.g., box body + 4 corner cylinders)
- Detailed → 8-15 shapes (e.g., main structure + some detail elements)

BLOCK SCALE MATCHING:
- Simple → scale 0.35-0.5, dimensions 2-4 units → 100-2000 blocks total
- Medium → scale 0.25-0.35, dimensions 4-8 units → 500-5000 blocks total
- Detailed → scale 0.20-0.28, dimensions 6-12 units → 1000-10000 blocks total

EXAMPLES - CORRECT:
✅ Simple lantern: create_sphere(radius=1.5, scale=0.4) → ~80 blocks
✅ Medium castle: create_box(width=6, height=8, depth=6, scale=0.3) + 4 corner cylinders(height=10, radius=1.5, scale=0.3) → ~600 blocks
✅ Detailed dragon: tapered body (length=8) + head (radius=2) + wings, scale=0.2 → ~2000 blocks

EXAMPLES - WRONG:
❌ create_box(width=24, height=18, depth=24, scale=0.18) → 190,000 blocks! TOO MASSIVE!
❌ Don't think in Minecraft building scale (20-50 blocks wide)
❌ Don't use tiny scale (<0.18) with large dimensions (>12 units)

Remember: Users can scale the model in-game. Make compact, efficient models!

BLOCK TYPES - You have TWO ways to specify blocks:

1. COLORED BLOCKS (color_material format):
   Colors: white, orange, magenta, light_blue, yellow, lime, pink, gray,
           light_gray, cyan, purple, blue, brown, green, red, black
   Materials: concrete, terracotta, wool, stained_glass, glazed_terracotta
   Example: "red_concrete", "blue_wool", "green_stained_glass"

2. DIRECT BLOCK IDS (use any valid Minecraft block!):
   Wood: oak_planks, spruce_planks, birch_planks, jungle_planks, acacia_planks, dark_oak_planks
   Stone: stone, cobblestone, stone_bricks, smooth_stone, andesite, diorite, granite
   Metals: iron_block, gold_block, diamond_block, emerald_block, netherite_block, copper_block
   Glass: glass, tinted_glass
   Natural: grass_block, dirt, sand, gravel, clay
   Other: obsidian, quartz_block, prismarine, sea_lantern, glowstone, redstone_block

   To use direct IDs, just pass the block name as the color parameter:
   create_sphere(5, 0.2, "oak_planks", "")  # Empty string for material

YOUR TASK:
1. Analyze the requested object's 3D shape
2. Decompose it into primitives (spheres, cylinders, tapered shapes, boxes)
3. Write Python code using the library functions
4. Return ONLY the generate function, nothing else

OUTPUT FORMAT:
```python
def generate():
    blocks = []

    # CORRECT: Just extend the blocks list
    blocks.extend(create_sphere(1.0, 0.2, "red"))
    blocks.extend(create_cylinder(2.0, 0.5, 0.2, "blue"))

    # CORRECT: Store in variable then extend
    body = create_box(2, 3, 2, 0.2, "white", "concrete")
    blocks.extend(body)

    # CORRECT: Modify Y positions if needed (blocks are dicts)
    roof = create_tapered_shape([{"y": 0, "radius": 1}], 0.2, [{"y_range": [1, 0], "color": "brown"}])
    for block in roof:
        block["y"] += 5.0  # Shift up
    blocks.extend(roof)

    # Add glow (modifies in place)
    add_glow(blocks, brightness_sky=15, brightness_block=15)

    return blocks
```

WRONG - DO NOT DO THIS:
```python
# ❌ WRONG: Don't try to unpack as tuples
for (x, y, z, block_name) in roof:  # ERROR!
    ...
```

IMPORTANT:
- Output ONLY the generate() function code
- No imports, no explanations, no markdown
- Just the function definition
- Use appropriate scales (0.15-0.25 for smooth models)
- Build hollow structures (surface only, not filled)
"#;

    let size_guidance = match size.as_str() {
        "small" => "Simple - use larger blocks, minimal detail, keep block count low for fast performance",
        "medium" => "Moderate - balanced detail, good mix of block sizes for recognizable features",
        "large" => "Detailed - use smaller blocks where needed for fine details, intricate features",
        _ => "Moderate - balanced detail, good mix of block sizes for recognizable features",
    };

    let user_prompt = format!(
        "Create a 3D voxel model of: {}

Complexity: {}

Build a hollow structure (surface only) that looks good in Minecraft.
You control both the block scale AND the number of blocks - choose what makes sense for this level of complexity.
The model can be any physical size - users will scale it themselves in-game if needed.

Output only the generate() function code.",
        prompt, size_guidance
    );

    // Call OpenAI API
    let client = reqwest::Client::new();
    let request_body = OpenAIRequest {
        model: "gpt-5.1-2025-11-13".to_string(),
        messages: vec![
            Message {
                role: "system".to_string(),
                content: system_prompt.to_string(),
            },
            Message {
                role: "user".to_string(),
                content: user_prompt,
            },
        ],
        temperature: 0.7,
    };

    println!("[OpenAI CodeGen] Sending request for: {}", prompt);

    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| {
            eprintln!("[OpenAI CodeGen] Request error: {:?}", e);
            format!("Failed to call OpenAI API: {}", e)
        })?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("OpenAI API error ({}): {}", status, error_text));
    }

    let openai_response: OpenAIResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse OpenAI response: {}", e))?;

    if openai_response.choices.is_empty() {
        return Err("No response from OpenAI".to_string());
    }

    // Log token usage and costs
    if let Some(usage) = &openai_response.usage {
        // GPT-4o pricing (as of Jan 2025): $2.50 per 1M input, $10.00 per 1M output
        let input_cost = (usage.prompt_tokens as f64 / 1_000_000.0) * 2.50;
        let output_cost = (usage.completion_tokens as f64 / 1_000_000.0) * 10.00;
        let total_cost = input_cost + output_cost;

        println!("╔══════════════════════════════════════════════════════════╗");
        println!("║              OpenAI API Usage Statistics                ║");
        println!("╠══════════════════════════════════════════════════════════╣");
        println!("║  Prompt tokens:     {:>8} (${:.4})                ║", usage.prompt_tokens, input_cost);
        println!("║  Completion tokens: {:>8} (${:.4})                ║", usage.completion_tokens, output_cost);
        println!("║  Total tokens:      {:>8} (${:.4})                ║", usage.total_tokens, total_cost);
        println!("╚══════════════════════════════════════════════════════════╝");
    }

    let code = &openai_response.choices[0].message.content;
    println!("[OpenAI CodeGen] Received code ({} chars)", code.len());

    // Review step: Ask AI to estimate block count from its own code
    let review_prompt = format!(
        r#"Review this Python code and estimate the TOTAL number of blocks it will generate.

Code:
```python
{}
```

Rules:
- Count blocks from ALL create_* function calls
- Remember: create_box(), create_cylinder(), create_sphere() each generate MANY blocks
- The number of blocks depends on dimensions and scale

Respond with ONLY a number (your estimate of total blocks)."#,
        code
    );

    let review_request = OpenAIRequest {
        model: "gpt-5.1-2025-11-13".to_string(),
        messages: vec![
            Message {
                role: "user".to_string(),
                content: review_prompt,
            },
        ],
        temperature: 0.3,
    };

    println!("[OpenAI CodeGen] Requesting block count estimate...");

    let review_response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&review_request)
        .send()
        .await
        .map_err(|e| format!("Failed to call review API: {}", e))?;

    if review_response.status().is_success() {
        if let Ok(review_result) = review_response.json::<OpenAIResponse>().await {
            if let Some(estimate_str) = review_result.choices.get(0).map(|c| c.message.content.trim()) {
                if let Ok(estimated_blocks) = estimate_str.parse::<usize>() {
                    println!("[OpenAI CodeGen] AI estimates {} blocks", estimated_blocks);
                    // Note: Not rejecting based on estimate, allowing all generations through
                }
            }
        }
    }

    // Extract code from markdown if needed
    let clean_code = if code.contains("```python") {
        code.split("```python")
            .nth(1)
            .and_then(|s| s.split("```").next())
            .unwrap_or(code)
    } else if code.contains("```") {
        code.split("```")
            .nth(1)
            .and_then(|s| s.split("```").next())
            .unwrap_or(code)
    } else {
        code
    };

    // Write voxel library to temp file
    let voxel_lib = include_str!("voxel_shape_library.py");
    let temp_lib_path = "/tmp/voxel_shape_library.py";
    fs::write(temp_lib_path, voxel_lib)
        .map_err(|e| format!("Failed to write voxel library: {}", e))?;

    // Write generated code to temp file
    let full_code = format!(
        r#"#!/usr/bin/env python3
import sys
sys.path.insert(0, '/tmp')
from voxel_shape_library import *
import json

{}

# Execute and output JSON
result = generate()
print(json.dumps(result))
"#,
        clean_code
    );

    let temp_code_path = "/tmp/generated_voxel_code.py";
    fs::write(temp_code_path, &full_code)
        .map_err(|e| format!("Failed to write generated code: {}", e))?;

    println!("[OpenAI CodeGen] Executing generated Python code...");

    // Execute Python code
    let output = Command::new("python3")
        .arg(temp_code_path)
        .output()
        .map_err(|e| format!("Failed to execute Python code: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Python execution failed: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    println!("[OpenAI CodeGen] Python output: {}", &stdout[..stdout.len().min(500)]);

    // Parse JSON output
    let mut entities: Vec<BlockDisplayEntity> = serde_json::from_str(&stdout)
        .map_err(|e| format!("Failed to parse generated blocks JSON: {}. Output: {}", e, &stdout[..stdout.len().min(200)]))?;

    if entities.is_empty() {
        return Err("AI generated empty model".to_string());
    }

    println!("[OpenAI CodeGen] Generated {} blocks (before deduplication)", entities.len());

    // Deduplicate blocks at exact same position (fixes z-fighting/flickering)
    use std::collections::HashSet;
    let mut seen_positions = HashSet::new();
    let original_count = entities.len();

    entities.retain(|entity| {
        // Round to 3 decimal places to catch near-duplicates
        let x = (entity.x * 1000.0).round() as i32;
        let y = (entity.y * 1000.0).round() as i32;
        let z = (entity.z * 1000.0).round() as i32;
        let pos = (x, y, z);

        if seen_positions.contains(&pos) {
            false // Remove duplicate
        } else {
            seen_positions.insert(pos);
            true // Keep first occurrence
        }
    });

    let removed_count = original_count - entities.len();
    if removed_count > 0 {
        println!("[OpenAI CodeGen] Removed {} overlapping blocks", removed_count);
    }

    println!("[OpenAI CodeGen] Successfully generated {} blocks", entities.len());

    Ok(entities)
}
