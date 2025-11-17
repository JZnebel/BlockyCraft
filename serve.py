#!/usr/bin/env python3
"""
BlockCraft Local Server
Serves the BlockCraft editor on localhost:8080
"""

import http.server
import socketserver
import os

PORT = 3457
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

if __name__ == '__main__':
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🎮 BlockCraft is running!")
        print(f"📱 Open your browser and go to: http://localhost:{PORT}")
        print(f"")
        print(f"Press Ctrl+C to stop the server")
        print(f"=" * 50)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 BlockCraft server stopped!")
