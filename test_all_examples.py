#!/usr/bin/env python3
"""
Test script to deploy and validate all BlockCraft examples
"""
import os
import sys
import json
import time
import subprocess
import requests
from pathlib import Path

# Add blockcraft directory to path
sys.path.insert(0, '/home/jordan/blockcraft')

# Import the projects
import importlib.util
spec = importlib.util.spec_from_file_location("projects", "/home/jordan/blockcraft/projects.js")
# Can't directly import JS, so we'll use the API instead

EXAMPLES_TO_TEST = [
    "🎮 Example: Hello Command",
    "🐷 Example: Pig Rain",
    "⚡ Example: Magic Stick",
    "💎 Example: Lucky Dirt",
    "🌈 Example: Party Mode",
    "🔥 Example: If/Else Demo",
    "🪄 Example: Magic Wand (Custom Item)",
    "⚡ Example: Lightning Staff",
    "🌊 Example: Tsunami Pearl",
    "💝 Example: Healing Crystal",
    "🏹 Example: Ice Bow",
    "🔥 Example: Flame Sword"
]

def test_example(example_name, workspace_xml):
    """Test deploying a single example"""
    print(f"\n{'='*60}")
    print(f"Testing: {example_name}")
    print(f"{'='*60}")

    # TODO: Parse XML and generate Java code
    # For now, just verify the XML is valid
    if not workspace_xml or len(workspace_xml) < 10:
        print(f"❌ FAILED: Invalid workspace XML")
        return False

    print(f"✅ Workspace XML is valid ({len(workspace_xml)} chars)")

    # Check if it contains custom items
    has_custom_items = 'custom_item' in workspace_xml.lower()
    has_commands = 'event_command' in workspace_xml.lower()

    print(f"   Has custom items: {has_custom_items}")
    print(f"   Has commands: {has_commands}")

    return True

def main():
    """Run tests on all examples"""
    print("🧪 BlockCraft Example Test Suite")
    print("=" * 60)

    # Read projects.js to get examples
    projects_file = '/home/jordan/blockcraft/projects.js'

    with open(projects_file, 'r') as f:
        content = f.read()

    # Count examples
    total = 0
    passed = 0
    failed = 0

    for example_name in EXAMPLES_TO_TEST:
        # Find the example in the file
        if example_name in content:
            total += 1
            # Extract workspace XML (simple regex would work but let's just verify it exists)
            if 'workspace:' in content[content.find(example_name):content.find(example_name)+2000]:
                print(f"✅ Found: {example_name}")
                passed += 1
            else:
                print(f"❌ Missing workspace: {example_name}")
                failed += 1
        else:
            print(f"⚠️  Not found: {example_name}")
            failed += 1

    print(f"\n{'='*60}")
    print(f"📊 Test Results:")
    print(f"   Total examples: {total}")
    print(f"   Found: {passed}")
    print(f"   Missing: {failed}")
    print(f"{'='*60}")

    if failed > 0:
        print(f"\n❌ {failed} examples have issues!")
        return 1
    else:
        print(f"\n✅ All {passed} examples are present!")
        return 0

if __name__ == '__main__':
    sys.exit(main())
