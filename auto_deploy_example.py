#!/usr/bin/env python3
"""
Automatically deploy a BlockCraft example and check if it compiles
"""
import sys
import json
import requests
import time
import re

def get_example_workspace(example_name):
    """Extract workspace XML from projects.js"""
    with open('/home/jordan/blockcraft/projects.js', 'r') as f:
        content = f.read()

    # Find the example
    pattern = rf'name:\s*"{re.escape(example_name)}"[^}}]*workspace:\s*`([^`]+)`'
    match = re.search(pattern, content, re.DOTALL)

    if match:
        return match.group(1)
    return None

def deploy_example(example_name):
    """Deploy an example by loading its workspace and deploying"""
    print(f"🚀 Deploying: {example_name}")

    # Get the workspace XML
    workspace = get_example_workspace(example_name)
    if not workspace:
        print(f"❌ Could not find example: {example_name}")
        return False

    print(f"✅ Found workspace XML ({len(workspace)} chars)")

    # Deploy via the API
    url = 'http://localhost:5000/deploy-java'

    payload = {
        'projectId': 'test_' + example_name.lower().replace(' ', '_').replace(':', ''),
        'projectName': example_name,
        'workspace': workspace,
        'customItems': []  # Will be extracted from workspace
    }

    try:
        response = requests.post(url, json=payload, timeout=120)

        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print(f"✅ DEPLOYED SUCCESSFULLY!")
                print(f"📝 Message: {result.get('message', 'No message')}")
                return True
            else:
                print(f"❌ DEPLOYMENT FAILED:")
                print(f"   Error: {result.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ HTTP Error {response.status_code}")
            print(f"   {response.text[:500]}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == '__main__':
    example = sys.argv[1] if len(sys.argv) > 1 else "⚡ Example: Lightning Staff"

    print("=" * 60)
    success = deploy_example(example)
    print("=" * 60)

    sys.exit(0 if success else 1)
