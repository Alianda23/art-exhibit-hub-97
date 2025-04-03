
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from urllib.parse import parse_qs, urlparse
import cgi
import os
import sys

# Add the current directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import our modules
from database import initialize_database
from auth import register_user, login_user, login_admin, create_admin
from artwork import get_all_artworks, get_artwork, create_artwork, update_artwork, delete_artwork
from exhibition import get_all_exhibitions, get_exhibition, create_exhibition, update_exhibition, delete_exhibition
from contact import create_contact_message, get_messages, update_message

# Set CORS headers for the server
def set_cors_headers(handler):
    handler.send_header('Access-Control-Allow-Origin', '*')
    handler.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    handler.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

class RequestHandler(BaseHTTPRequestHandler):
    def _set_response(self, status_code=200, content_type='application/json'):
        self.send_response(status_code)
        self.send_header('Content-type', content_type)
        set_cors_headers(self)
        self.end_headers()
    
    def do_OPTIONS(self):
        self._set_response(200)
    
    def do_GET(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        query_params = parse_qs(parsed_url.query)
        
        # Get all artworks
        if path == '/artworks':
            response = get_all_artworks()
            self._set_response()
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Get a specific artwork
        elif path.startswith('/artworks/') and len(path.split('/')) == 3:
            artwork_id = path.split('/')[2]
            response = get_artwork(artwork_id)
            self._set_response()
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Get all exhibitions
        elif path == '/exhibitions':
            response = get_all_exhibitions()
            self._set_response()
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Get a specific exhibition
        elif path.startswith('/exhibitions/') and len(path.split('/')) == 3:
            exhibition_id = path.split('/')[2]
            response = get_exhibition(exhibition_id)
            self._set_response()
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Get all contact messages (admin only)
        elif path == '/messages':
            auth_header = self.headers.get('Authorization', '')
            response = get_messages(auth_header)
            
            if "error" in response and response["error"] == "Unauthorized access":
                self._set_response(403)
            else:
                self._set_response()
            
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Handle 404 Not Found
        else:
            self._set_response(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())
    
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode())
        except json.JSONDecodeError:
            self._set_response(400)
            self.wfile.write(json.dumps({"error": "Invalid JSON"}).encode())
            return
        
        # User registration
        if self.path == '/register':
            name = data.get('name')
            email = data.get('email')
            password = data.get('password')
            phone = data.get('phone')
            
            if not all([name, email, password]):
                self._set_response(400)
                self.wfile.write(json.dumps({"error": "Missing required fields"}).encode())
                return
            
            response = register_user(name, email, password, phone)
            
            if "error" in response:
                self._set_response(400)
            else:
                self._set_response()
            
            self.wfile.write(json.dumps(response).encode())
            return
        
        # User login
        elif self.path == '/login':
            email = data.get('email')
            password = data.get('password')
            
            if not all([email, password]):
                self._set_response(400)
                self.wfile.write(json.dumps({"error": "Missing required fields"}).encode())
                return
            
            response = login_user(email, password)
            
            if "error" in response:
                self._set_response(401)
            else:
                self._set_response()
            
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Admin login
        elif self.path == '/admin-login':
            email = data.get('email')
            password = data.get('password')
            
            if not all([email, password]):
                self._set_response(400)
                self.wfile.write(json.dumps({"error": "Missing required fields"}).encode())
                return
            
            response = login_admin(email, password)
            
            if "error" in response:
                self._set_response(401)
            else:
                self._set_response()
            
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Create a new artwork
        elif self.path == '/artworks':
            auth_header = self.headers.get('Authorization', '')
            response = create_artwork(auth_header, data)
            
            if "error" in response:
                if response["error"] == "Unauthorized access":
                    self._set_response(403)
                else:
                    self._set_response(400)
            else:
                self._set_response(201)
            
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Create a new exhibition
        elif self.path == '/exhibitions':
            auth_header = self.headers.get('Authorization', '')
            response = create_exhibition(auth_header, data)
            
            if "error" in response:
                if response["error"] == "Unauthorized access":
                    self._set_response(403)
                else:
                    self._set_response(400)
            else:
                self._set_response(201)
            
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Create a new contact message
        elif self.path == '/contact':
            response = create_contact_message(data)
            
            if "error" in response:
                self._set_response(400)
            else:
                self._set_response(201)
            
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Handle 404 Not Found
        else:
            self._set_response(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())
    
    def do_PUT(self):
        content_length = int(self.headers['Content-Length'])
        put_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(put_data.decode())
        except json.JSONDecodeError:
            self._set_response(400)
            self.wfile.write(json.dumps({"error": "Invalid JSON"}).encode())
            return
        
        # Update an artwork
        if self.path.startswith('/artworks/') and len(self.path.split('/')) == 3:
            artwork_id = self.path.split('/')[2]
            auth_header = self.headers.get('Authorization', '')
            response = update_artwork(auth_header, artwork_id, data)
            
            if "error" in response:
                if response["error"] == "Unauthorized access":
                    self._set_response(403)
                elif response["error"] == "Artwork not found":
                    self._set_response(404)
                else:
                    self._set_response(400)
            else:
                self._set_response()
            
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Update an exhibition
        elif self.path.startswith('/exhibitions/') and len(self.path.split('/')) == 3:
            exhibition_id = self.path.split('/')[2]
            auth_header = self.headers.get('Authorization', '')
            response = update_exhibition(auth_header, exhibition_id, data)
            
            if "error" in response:
                if response["error"] == "Unauthorized access":
                    self._set_response(403)
                elif response["error"] == "Exhibition not found":
                    self._set_response(404)
                else:
                    self._set_response(400)
            else:
                self._set_response()
            
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Update a message status
        elif self.path.startswith('/messages/') and len(self.path.split('/')) == 3:
            message_id = self.path.split('/')[2]
            auth_header = self.headers.get('Authorization', '')
            response = update_message(auth_header, message_id, data)
            
            if "error" in response:
                if response["error"] == "Unauthorized access":
                    self._set_response(403)
                elif response["error"] == "Message not found":
                    self._set_response(404)
                else:
                    self._set_response(400)
            else:
                self._set_response()
            
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Handle 404 Not Found
        else:
            self._set_response(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())
    
    def do_DELETE(self):
        # Delete an artwork
        if self.path.startswith('/artworks/') and len(self.path.split('/')) == 3:
            artwork_id = self.path.split('/')[2]
            auth_header = self.headers.get('Authorization', '')
            response = delete_artwork(auth_header, artwork_id)
            
            if "error" in response:
                if response["error"] == "Unauthorized access":
                    self._set_response(403)
                elif response["error"] == "Artwork not found":
                    self._set_response(404)
                else:
                    self._set_response(400)
            else:
                self._set_response()
            
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Delete an exhibition
        elif self.path.startswith('/exhibitions/') and len(self.path.split('/')) == 3:
            exhibition_id = self.path.split('/')[2]
            auth_header = self.headers.get('Authorization', '')
            response = delete_exhibition(auth_header, exhibition_id)
            
            if "error" in response:
                if response["error"] == "Unauthorized access":
                    self._set_response(403)
                elif response["error"] == "Exhibition not found":
                    self._set_response(404)
                else:
                    self._set_response(400)
            else:
                self._set_response()
            
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Handle 404 Not Found
        else:
            self._set_response(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())

def run_server(server_class=HTTPServer, handler_class=RequestHandler, port=8000):
    # Initialize the database
    if not initialize_database():
        print("Failed to initialize database. Exiting...")
        return
    
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting server on port {port}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    print("Server stopped")

if __name__ == "__main__":
    run_server()
