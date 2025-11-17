#!/usr/bin/env python3
"""
AI Texture Generator for BlockCraft
Generates Minecraft item textures using OpenAI models
"""

import requests
import base64
from PIL import Image
from io import BytesIO
import os

class TextureGenerator:
    def __init__(self, api_key, model='gpt-image-1-mini'):
        """
        Initialize texture generator

        Args:
            api_key: OpenAI API key
            model: AI model to use (dall-e-3, dall-e-2, gpt-image-1, gpt-image-1-mini)
        """
        self.api_key = api_key
        self.model = model
        # GPT Image models use the same endpoint as DALL-E
        self.api_url = "https://api.openai.com/v1/images/generations"

    def generate_texture(self, description, item_id):
        """
        Generate a Minecraft item texture from a description

        Args:
            description: Text description of the item texture
            item_id: Unique identifier for the item

        Returns:
            PIL Image object (16x16 pixels) or None if failed
        """
        try:
            # Create optimized prompt for pixel art
            pixel_art_prompt = f"A 16x16 pixel art Minecraft item texture of {description}. Flat, simple, iconic design with clear shapes and bright colors. Pixel art style, no gradients, sharp pixels, top-down view."

            # Prepare request based on model
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }

            # Different models have different parameters
            if self.model == "dall-e-3":
                payload = {
                    "model": "dall-e-3",
                    "prompt": pixel_art_prompt,
                    "n": 1,
                    "size": "1024x1024",
                    "quality": "standard"
                }
            elif self.model == "gpt-image-1":
                payload = {
                    "model": "gpt-image-1",
                    "prompt": pixel_art_prompt,
                    "n": 1,
                    "size": "1024x1024",
                    "quality": "low"  # Low quality for pixel art
                }
            elif self.model == "gpt-image-1-mini":
                payload = {
                    "model": "gpt-image-1-mini",
                    "prompt": pixel_art_prompt,
                    "n": 1,
                    "size": "1024x1024",
                    "quality": "low"  # Low quality is cheapest at $0.005/image
                }
            else:  # dall-e-2
                payload = {
                    "model": "dall-e-2",
                    "prompt": pixel_art_prompt,
                    "n": 1,
                    "size": "1024x1024"
                }

            print(f"🎨 Generating texture for '{description}' using {self.model}...")

            # Call OpenAI API
            response = requests.post(self.api_url, headers=headers, json=payload, timeout=60)

            if response.status_code != 200:
                print(f"❌ OpenAI API error: {response.status_code}")
                print(f"Response: {response.text}")
                return None

            result = response.json()

            # Get the image URL and download it
            image_url = result['data'][0]['url']
            image_response = requests.get(image_url, timeout=30)

            if image_response.status_code != 200:
                print(f"❌ Failed to download image from URL")
                return None

            # Load image from downloaded data
            image = Image.open(BytesIO(image_response.content))

            # Resize to 16x16 using NEAREST to preserve pixel art look
            texture = image.resize((16, 16), Image.NEAREST)

            # Convert to RGBA if not already
            if texture.mode != 'RGBA':
                texture = texture.convert('RGBA')

            print(f"✅ Texture generated successfully!")
            return texture

        except Exception as e:
            print(f"❌ Error generating texture: {str(e)}")
            return None

    def save_texture(self, texture, output_path):
        """
        Save texture as PNG

        Args:
            texture: PIL Image object
            output_path: Path to save the PNG file
        """
        try:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            texture.save(output_path, 'PNG')
            print(f"💾 Texture saved to: {output_path}")
            return True
        except Exception as e:
            print(f"❌ Error saving texture: {str(e)}")
            return False
