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

AVAILABLE LIBRARY FUNCTIONS (ALL RETURN LISTS OF BLOCK DICTIONARIES):
```python
# Create circular layer at height y - returns list of dicts
blocks = create_circle_layer(y, radius, scale, color, block_material="concrete")

# Create hollow sphere - returns list of dicts
blocks = create_sphere(radius, scale, color, block_material="concrete")

# Create hollow cylinder - returns list of dicts
blocks = create_cylinder(height, radius, scale, color, block_material="concrete", center_y=0.0)

# Create tapered shape with varying radius - returns list of dicts
blocks = create_tapered_shape(profile, scale, color_map, block_material="concrete")
# profile: [{"y": height, "radius": radius}, ...]
# color_map: [{"y_range": [max_y, min_y], "color": "color_name"}, ...]

# Create hollow box - returns list of dicts
blocks = create_box(width, height, depth, scale, color, block_material="concrete", center=(0,0,0))

# Add glow to blocks (modifies list IN PLACE, returns None)
add_glow(blocks, brightness_sky=15, brightness_block=15)

# Each dict has: {"block": "minecraft:...", "x": 0.0, "y": 0.0, "z": 0.0, "scale": [0.2, 0.2, 0.2]}
```

AVAILABLE COLORS:
white, orange, magenta, light_blue, yellow, lime, pink, gray, light_gray, cyan, purple, blue, brown, green, red, black

AVAILABLE MATERIALS:
- With colors: concrete, terracotta, wool, stained_glass
- Without colors: stone, bricks, iron_block, gold_block, planks
IMPORTANT: Only use "concrete", "terracotta", "wool", or "stained_glass" when you need colored blocks!

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
        "small" => "Use scale 0.22-0.28, aim for 60-100 surface blocks",
        "medium" => "Use scale 0.18-0.22, aim for 100-200 surface blocks",
        "large" => "Use scale 0.15-0.18, aim for 200-400 surface blocks",
        _ => "Use scale 0.18-0.22, aim for 100-200 surface blocks",
    };

    let user_prompt = format!(
        "Generate a {} {} of: {}

Think about:
1. What is the overall 3D shape?
2. Which primitives can I combine?
3. What colors/materials match this object?
4. Should parts glow?

Output only the generate() function code.",
        size, size_guidance, prompt
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

    let code = &openai_response.choices[0].message.content;
    println!("[OpenAI CodeGen] Received code:\n{}", code);

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
    let entities: Vec<BlockDisplayEntity> = serde_json::from_str(&stdout)
        .map_err(|e| format!("Failed to parse generated blocks JSON: {}. Output: {}", e, &stdout[..stdout.len().min(200)]))?;

    if entities.is_empty() {
        return Err("AI generated empty model".to_string());
    }

    println!("[OpenAI CodeGen] Successfully generated {} blocks", entities.len());

    Ok(entities)
}
