# GPT Image 1 API Guide

## Overview
GPT Image 1 is OpenAI's latest multimodal image generation model that supports transparent backgrounds - perfect for Minecraft textures!

## Key Features
- **Transparent backgrounds**: Set `background: "transparent"`
- **Base64 response**: Returns images directly as base64-encoded data (no URL downloads needed)
- **Better quality**: Natively multimodal model with better understanding
- **Two models available**:
  - `gpt-image-1`: Higher quality ($0.011/image)
  - `gpt-image-1-mini`: Faster & cheaper ($0.005/image) - RECOMMENDED for pixel art

## API Endpoint
```
POST https://api.openai.com/v1/images/generations
```

## Request Format

### Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_API_KEY"
}
```

### Body (for GPT Image 1 Mini with transparent background)
```json
{
  "model": "gpt-image-1-mini",
  "prompt": "A 16x16 pixel art minecraft style diamond sword icon on transparent background",
  "background": "transparent",
  "size": "1024x1024",
  "output_format": "png",
  "quality": "low",
  "n": 1
}
```

## Response Format
```json
{
  "created": 1763194456,
  "background": "transparent",
  "output_format": "png",
  "size": "1024x1024",
  "quality": "low",
  "data": [
    {
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
    }
  ]
}
```

## Key Parameters

### Required
- `model`: `"gpt-image-1"` or `"gpt-image-1-mini"`
- `prompt`: Text description of desired image

### Recommended for Minecraft Textures
- `background`: `"transparent"` - Creates transparent background (IMPORTANT!)
- `output_format`: `"png"` - Supports transparency (default)
- `quality`: `"low"` - Cheapest option, fine for pixel art
- `size`: `"1024x1024"` - Square format, will be resized to 16x16

### Optional
- `n`: Number of images (1-10, default: 1)
- `output_compression`: 0-100 (default: 100)

## Differences from DALL-E

| Feature | DALL-E 2/3 | GPT Image 1 |
|---------|-----------|-------------|
| Transparent backgrounds | ❌ No | ✅ Yes |
| Response format | URL (expires in 60min) | Base64 JSON |
| Background parameter | Not supported | `transparent`, `opaque`, `auto` |
| Quality options | `standard`, `hd` | `low`, `medium`, `high` |
| Cost (mini) | N/A | $0.005/image |

## Example cURL Command
```bash
curl https://api.openai.com/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-proj-YOUR_KEY_HERE" \
  -d '{
    "model": "gpt-image-1-mini",
    "prompt": "A 16x16 pixel art minecraft style diamond sword icon on transparent background",
    "background": "transparent",
    "size": "1024x1024",
    "output_format": "png",
    "quality": "low"
  }'
```

## Python Example
```python
import requests
import base64
from PIL import Image
from io import BytesIO

api_key = "sk-proj-YOUR_KEY_HERE"

response = requests.post(
    "https://api.openai.com/v1/images/generations",
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    },
    json={
        "model": "gpt-image-1-mini",
        "prompt": "A 16x16 pixel art minecraft diamond sword on transparent background",
        "background": "transparent",
        "size": "1024x1024",
        "output_format": "png",
        "quality": "low"
    }
)

# Get base64 image data
image_data = response.json()['data'][0]['b64_json']

# Decode and save
image_bytes = base64.b64decode(image_data)
image = Image.open(BytesIO(image_bytes))

# Resize to 16x16 for Minecraft
texture = image.resize((16, 16), Image.NEAREST)
texture.save('diamond_sword.png', 'PNG')
```

## Important Notes

1. **No URL downloads**: GPT Image 1 returns base64 data directly, not URLs
2. **Transparent backgrounds**: Only works with `png` or `webp` output formats
3. **Quality for pixel art**: Use `"quality": "low"` - it's cheaper and works fine for simple pixel art
4. **Size**: Generate at 1024x1024 then resize down to 16x16 to preserve quality
5. **Prompt engineering**: Always include "transparent background" in your prompt

## BlockCraft Implementation Checklist

- [ ] Update `texture_generator.py` to use `gpt-image-1-mini`
- [ ] Add `background: "transparent"` parameter
- [ ] Change response handling from URL download to base64 decode
- [ ] Update settings UI to show new model options
- [ ] Test with actual Minecraft item textures
