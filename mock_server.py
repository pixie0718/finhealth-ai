#!/usr/bin/env python
"""Mock backend for testing frontend"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse

class MockHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        # Parse body
        if 'form-data' in self.headers.get('Content-Type', ''):
            params = urllib.parse.parse_qs(body.decode())
            data = {k: v[0] for k, v in params.items()}
        else:
            data = json.loads(body.decode()) if body else {}

        response = {}

        if self.path == '/api/auth/register':
            response = {
                "message": "User registered successfully",
                "user_id": 123,
                "email": data.get('email', 'test@example.com'),
                "token": "mock_token_xyz"
            }
        elif self.path == '/api/auth/login':
            response = {
                "message": "Login successful",
                "user_id": 123,
                "token": "mock_token_xyz"
            }
        elif self.path == '/api/auth/me':
            response = {
                "user_id": 123,
                "email": "test@example.com",
                "full_name": "Test User"
            }
        else:
            response = {"message": "Endpoint not found", "path": self.path}

        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())

    def log_message(self, format, *args):
        print(f"[{self.client_address[0]}] {format % args}")

if __name__ == "__main__":
    server = HTTPServer(('0.0.0.0', 8000), MockHandler)
    print("[MOCK] Backend running on http://localhost:8000")
    print("(This is NOT the real backend - for testing only)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped")
