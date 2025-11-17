"""
Generate Minecraft crafting recipe JSON files
"""
import json
import os

class RecipeGenerator:
    def __init__(self, build_path, mod_id):
        self.build_path = build_path
        self.mod_id = mod_id
        self.recipes_dir = os.path.join(build_path, 'src/main/resources/data', mod_id, 'recipe')

    def create_recipe_directory(self):
        """Create the recipe directory if it doesn't exist"""
        os.makedirs(self.recipes_dir, exist_ok=True)

    def generate_shaped_recipe(self, item_id, recipe_grid, result_count=1):
        """
        Generate a shaped crafting recipe JSON file

        Args:
            item_id: The ID of the item to craft
            recipe_grid: List of 9 ingredients (3x3 grid, row by row)
            result_count: Number of items to craft
        """
        # Skip if all ingredients are air (no recipe)
        if all(ing == 'minecraft:air' for ing in recipe_grid):
            return None

        # Convert grid to pattern and key
        pattern = []
        key = {}
        char_map = {}
        current_char = ord('A')

        for i in range(0, 9, 3):
            row = recipe_grid[i:i+3]
            pattern_row = ''
            for ingredient in row:
                if ingredient == 'minecraft:air':
                    pattern_row += ' '
                else:
                    if ingredient not in char_map:
                        char_map[ingredient] = chr(current_char)
                        current_char += 1
                    pattern_row += char_map[ingredient]
            pattern.append(pattern_row)

        # Build key from char_map
        for ingredient, char in char_map.items():
            key[char] = {'item': ingredient}

        # Create recipe JSON
        recipe = {
            'type': 'minecraft:crafting_shaped',
            'pattern': pattern,
            'key': key,
            'result': {
                'id': f'{self.mod_id}:{item_id}',
                'count': result_count
            }
        }

        # Write recipe file
        recipe_file = os.path.join(self.recipes_dir, f'{item_id}.json')
        with open(recipe_file, 'w') as f:
            json.dump(recipe, f, indent=2)

        print(f"  ✅ Generated recipe for {item_id}")
        return recipe_file

    def cleanup(self):
        """Clean up temporary files"""
        pass
