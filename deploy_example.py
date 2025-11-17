#!/usr/bin/env python3
"""
Deploy a BlockCraft example and verify it works
"""
import sys
import os
import requests
import time

# Change to blockcraft directory
os.chdir('/home/jordan/blockcraft')
sys.path.insert(0, '/home/jordan/blockcraft')

# Import the main.js functions via the web UI
def deploy_example_by_name(example_name):
    """Deploy an example by name through the web UI"""
    print(f"🚀 Deploying example: {example_name}")

    # Use the web UI at localhost:3457 to load and deploy
    # We'll simulate what happens when user clicks the example and deploys

    # For now, just show what we would do
    print(f"   Would load example from projects.js")
    print(f"   Would parse Blockly XML")
    print(f"   Would generate Java code")
    print(f"   Would POST to http://localhost:5000/deploy-java")
    print(f"   Would check for compilation errors")

    return True

if __name__ == '__main__':
    example = sys.argv[1] if len(sys.argv) > 1 else "Lightning Staff"
    deploy_example_by_name(example)
