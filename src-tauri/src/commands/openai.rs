use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct BlockDisplayEntity {
    pub block: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub properties: Option<HashMap<String, String>>,
    pub x: f64,
    pub y: f64,
    pub z: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub scale: Option<[f64; 3]>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rotation: Option<[f64; 3]>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub brightness: Option<Brightness>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Brightness {
    pub sky: i32,
    pub block: i32,
}

#[derive(Debug, Serialize, Deserialize)]
struct OpenAIRequest {
    model: String,
    messages: Vec<Message>,
    temperature: f32,
    response_format: ResponseFormat,
}

#[derive(Debug, Serialize, Deserialize)]
struct Message {
    role: String,
    content: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ResponseFormat {
    #[serde(rename = "type")]
    format_type: String,
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
pub async fn generate_block_display_model(
    api_key: String,
    prompt: String,
    size: String,
) -> Result<Vec<BlockDisplayEntity>, String> {
    // Construct the system prompt
    let system_prompt = r#"You are a 3D voxel model generator. Your goal: create recognizable objects using small cubic blocks positioned in 3D space.

CORE PRINCIPLES:
1. Build only the OUTER SURFACE (hollow shell) - interior blocks are invisible and wasteful
2. Use SMALL scales (0.15-0.3) and MANY blocks for smooth, detailed appearance
3. Position blocks in true 3D space using all three axes (x, y, z)
4. Approximate curves by placing blocks at many angles (every 20-45° around circles)
5. For any shape, think: "What does the surface look like from the outside?"

OUTPUT FORMAT:
- JSON array of objects only, no explanation or markdown
- Each object: {"block": "minecraft:color_concrete", "x": 0.5, "y": 1.0, "z": -0.3, "scale": [0.2, 0.2, 0.2]}
- Optional: "properties" object, "brightness" object with sky/block (0-15)
- Coordinates relative to 0,0,0 center, use decimals for precision

AVAILABLE BLOCKS:
concrete (white/orange/magenta/light_blue/yellow/lime/pink/gray/light_gray/cyan/purple/blue/brown/green/red/black),
terracotta (same colors), wool (same colors), glass, stained_glass (same colors), planks (oak/spruce/birch/jungle/acacia/dark_oak),
stone, bricks, iron_block, gold_block, diamond_block, emerald_block, lantern, glowstone, sea_lantern

SPATIAL REASONING APPROACH:
1. Analyze the object's actual 3D shape (is it round? cylindrical? boxy? organic?)
2. Determine how the surface curves or changes at different heights
3. For each height layer, calculate the appropriate radius/width/depth
4. Place blocks around the perimeter of each layer at varied angles
5. Use smaller scales where more detail is needed

MATHEMATICAL HELPERS:
- Circle at height y with radius r: place blocks at (r×cos(θ), y, r×sin(θ)) for θ = 0°, 30°, 60°, 90°, etc.
- Sphere surface: x² + y² + z² ≈ r² (vary all three coordinates, not just horizontal)
- Cylinder: constant radius at different y-heights
- Tapered shapes: radius changes gradually with height

Remember: Think like a 3D artist. What does this object actually look like? How can I approximate its surface with small blocks?"#;

    let size_guidance = match size.as_str() {
        "small" => "50-80 surface blocks with 0.25-0.35 scale",
        "medium" => "80-120 surface blocks with 0.2-0.3 scale",
        "large" => "120-200 surface blocks with 0.15-0.25 scale",
        _ => "80+ surface blocks with detailed outer shell",
    };

    let user_prompt = format!(
        "Object to create: {}
Target size: {} ({})

REASONING PROCESS:
1. What is this object's real-world 3D shape?
2. How does its surface curve/taper/bulge at different heights?
3. What radius/width should each horizontal layer have?
4. How many blocks per layer to make it look smooth?
5. What colors/materials match the object?
6. Are there special details (handle, pattern, glow)?

OUTPUT: JSON array only",
        prompt, size, size_guidance
    );

    // Make request to OpenAI API
    let client = reqwest::Client::new();

    let request_body = OpenAIRequest {
        model: "gpt-5.1-2025-11-13".to_string(),  // OpenAI's flagship model for coding/agentic tasks
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
        response_format: ResponseFormat {
            format_type: "json_object".to_string(),
        },
    };

    // Log the request
    println!("[OpenAI] Sending request:");
    println!("[OpenAI] Model: {}", request_body.model);
    println!("[OpenAI] System prompt: {}", request_body.messages[0].content);
    println!("[OpenAI] User prompt: {}", request_body.messages[1].content);

    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| {
            eprintln!("[OpenAI] Full error details: {:?}", e);
            format!("Failed to call OpenAI API: {} (check console for details)", e)
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

    let content = &openai_response.choices[0].message.content;

    // Log the response
    println!("[OpenAI] Received response:");
    println!("[OpenAI] Content: {}", content);

    // Try to parse the JSON content
    // Sometimes the API returns it wrapped, sometimes not
    let entities: Vec<BlockDisplayEntity> = if content.trim().starts_with('[') {
        // Direct array
        println!("[OpenAI] Parsing as direct array");
        serde_json::from_str(content)
            .map_err(|e| format!("Failed to parse block display entities: {}. Content: {}", e, content))?
    } else {
        // Try to extract array from JSON object
        let json_value: serde_json::Value = serde_json::from_str(content)
            .map_err(|e| format!("Failed to parse JSON: {}. Content: {}", e, content))?;

        println!("[OpenAI] JSON is an object, checking for array fields...");

        // Look for an array field (try common field names)
        if let Some(arr) = json_value.get("blocks")
            .or_else(|| json_value.get("entities"))
            .or_else(|| json_value.get("model")) {
            println!("[OpenAI] Found array field, parsing...");
            serde_json::from_value(arr.clone())
                .map_err(|e| format!("Failed to parse blocks array: {}", e))?
        } else if json_value.get("block").is_some() {
            // Single block object - wrap it in an array
            println!("[OpenAI] Single block object detected, wrapping in array");
            vec![serde_json::from_value(json_value)
                .map_err(|e| format!("Failed to parse single block: {}", e))?]
        } else {
            return Err(format!("Could not find blocks array in response: {}", content));
        }
    };

    if entities.is_empty() {
        return Err("AI returned empty model".to_string());
    }

    Ok(entities)
}

#[tauri::command]
pub async fn generate_item_texture(
    _api_key: String,
    _description: String,
) -> Result<String, String> {
    // This will use GPT Image 1 to generate custom item textures
    // For now, return a placeholder - we'll implement this next
    Err("Not implemented yet - use upload for now".to_string())
}
