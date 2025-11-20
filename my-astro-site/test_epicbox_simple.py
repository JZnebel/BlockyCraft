#!/usr/bin/env python3
import epicbox

epicbox.configure(
    profiles=[
        epicbox.Profile('python', 'python:3.11-alpine')
    ]
)

files = [{'name': 'main.py', 'content': b'print("Hello from sandbox!")'}]
limits = {'cputime': 1, 'memory': 64}

try:
    result = epicbox.run('python', 'python3 main.py', files=files, limits=limits)
    print("Result:", result)
except Exception as e:
    print("Error:", e)
    import traceback
    traceback.print_exc()
