import os
import json
import http.server
import socketserver
import urllib.parse
import mimetypes
from http import HTTPStatus
from datetime import datetime
from urllib.parse import parse_qs, urlparse
from decimal import Decimal

# Import modules
from auth import register_user, login_user, login_admin
from artwork import get_all_artworks, get_artwork, create_artwork, update_artwork, delete_artwork
from exhibition import get_all_exhibitions, get_exhibition, create_exhibition, update_exhibition, delete_exhibition
from contact import create_contact_message, get_messages, update_message, json_dumps
from db_setup import initialize_database
from middleware import auth_required, admin_required, extract_auth_token, verify_token

# Import module for file upload handling
import tempfile
import shutil

# Define the port
PORT = 8000

# Ensure the static/uploads directory exists
def ensure_uploads_directory():
    uploads_dir = os.path.join(os.path.dirname(__file__), "static", "uploads")
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
        print(f"Created directory: {uploads_dir}")

# Call this function to ensure directory exists
ensure_uploads_directory()

# Create a default exhibition image if it doesn't exist
def create_default_exhibition_image():
    default_image_path = os.path.join(os.path.dirname(__file__), "static", "uploads", "default_exhibition.jpg")
    if not os.path.exists(default_image_path):
        try:
            # Create a simple colored rectangle as the default image
            # This would be better with PIL, but let's use a placeholder approach
            from shutil import copyfile
            
            # Copy a placeholder from public if it exists
            source_placeholder = os.path.join(os.path.dirname(__file__), "..", "public", "placeholder.svg")
            if os.path.exists(source_placeholder):
                copyfile(source_placeholder, default_image_path)
                print(f"Created default exhibition image from placeholder")
            else:
                # Create an empty file as fallback
                with open(default_image_path, "w") as f:
                    f.write("Default Exhibition Image Placeholder")
                print(f"Created empty default exhibition image")
        except Exception as e:
            print(f"Failed to create default exhibition image: {e}")

# Call this function to ensure the default exhibition image exists
create_default_exhibition_image()

# Custom JSON encoder to handle Decimal types
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

class RequestHandler(http.server.BaseHTTPRequestHandler):
    
    def _set_response(self, status_code=200, content_type='application/json'):
        self.send_response(status_code)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def do_OPTIONS(self):
        self._set_response()
    
    def serve_static_file(self, file_path):
        """Serve a static file based on its MIME type"""
        try:
            # Check if file exists
            if not os.path.exists(file_path):
                self.send_response(404)
                self.end_headers()
                return
                
            # Determine the content type
            content_type, _ = mimetypes.guess_type(file_path)
            if not content_type:
                content_type = 'application/octet-stream'
                
            # Get file size
            file_size = os.path.getsize(file_path)
            
            # Set headers
            self.send_response(200)
            self.send_header('Content-type', content_type)
            self.send_header('Content-Length', str(file_size))
            self.end_headers()
            
            # Read and send the file
            with open(file_path, 'rb') as f:
                self.wfile.write(f.read())
                
        except Exception as e:
            print(f"Error serving static file: {e}")
            self.send_response(500)
            self.end_headers()
    
    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        
        # Handle static files (images, CSS, JS, etc.)
        if path.startswith('/static/'):
            file_path = os.path.join(os.path.dirname(__file__), path[1:])
            # Debugging info
            print(f"Serving static file: {file_path}")
            self.serve_static_file(file_path)
            return
        
        # Handle API endpoints
        # Handle GET /artworks
        if path == '/artworks':
            response = get_all_artworks()
            self._set_response()
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Handle GET /artworks/{id}
        elif path.startswith('/artworks/') and len(path.split('/')) == 3:
            artwork_id = path.split('/')[2]
            response = get_artwork(artwork_id)
            self._set_response()
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Handle GET /exhibitions
        elif path == '/exhibitions':
            response = get_all_exhibitions()
            self._set_response()
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Handle GET /exhibitions/{id}
        elif path.startswith('/exhibitions/') and len(path.split('/')) == 3:
            exhibition_id = path.split('/')[2]
            response = get_exhibition(exhibition_id)
            self._set_response()
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Handle GET /messages (admin only)
        elif path == '/messages':
            token = extract_auth_token(self)
            if not token:
                self._set_response(401)
                self.wfile.write(json_dumps({"error": "Authentication required"}).encode())
                return
            
            payload = verify_token(token)
            if isinstance(payload, dict) and "error" in payload:
                self._set_response(401)
                self.wfile.write(json_dumps({"error": payload["error"]}).encode())
                return
            
            # Check if user is admin
            if not payload.get("is_admin", False):
                self._set_response(403)
                self.wfile.write(json_dumps({"error": "Unauthorized access: Admin privileges required"}).encode())
                return
            
            response = get_messages(self.headers.get('Authorization', ''))
            self._set_response()
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Default 404 response
        self._set_response(404)
        self.wfile.write(json_dumps({"error": "Resource not found"}).encode())
    
    def do_POST(self):
        # Get content length
        content_length = int(self.headers.get('Content-Length', 0))
        
        # Get content type
        content_type = self.headers.get('Content-Type', '')
        
        # Debug information
        print(f"POST to {self.path} with content type: {content_type}, length: {content_length}")
        
        # Parse POST data based on content type
        post_data = {}
        
        if content_length > 0:
            if "application/json" in content_type:
                # Handle JSON data
                post_data = json.loads(self.rfile.read(content_length).decode('utf-8'))
                print(f"Parsed JSON data: {post_data}")
            elif "multipart/form-data" in content_type:
                # For multipart form data (like file uploads), will be handled in specific endpoints
                print("Multipart form data detected, will handle in endpoint")
            else:
                # Handle plain form data (url-encoded)
                form_data = self.rfile.read(content_length).decode('utf-8')
                post_data = parse_qs(form_data)
                for key in post_data:
                    post_data[key] = post_data[key][0]
                print(f"Parsed form data: {post_data}")
        
        # Process based on path
        path = self.path
        
        # Register user
        if path == '/register':
            if not post_data:
                self._set_response(400)
                self.wfile.write(json_dumps({"error": "Missing registration data"}).encode())
                return
            
            print(f"Registration data: {post_data}")
            
            # Check required fields
            required_fields = ['name', 'email', 'password']
            missing_fields = [field for field in required_fields if field not in post_data]
            
            if missing_fields:
                self._set_response(400)
                self.wfile.write(json_dumps({"error": f"Missing required fields: {', '.join(missing_fields)}"}).encode())
                return
            
            # Register the user
            response = register_user(
                post_data['name'], 
                post_data['email'], 
                post_data['password'],
                post_data.get('phone', '')  # Optional field
            )
            
            if "error" in response:
                self._set_response(400)
            else:
                self._set_response(201)
            
            self.wfile.write(json_dumps(response).encode())
            return
        
        # User login
        elif path == '/login':
            if not post_data:
                self._set_response(400)
                self.wfile.write(json_dumps({"error": "Missing login data"}).encode())
                return
            
            # Check required fields
            if 'email' not in post_data or 'password' not in post_data:
                self._set_response(400)
                self.wfile.write(json_dumps({"error": "Email and password required"}).encode())
                return
            
            # Login the user
            response = login_user(post_data['email'], post_data['password'])
            
            if "error" in response:
                self._set_response(401)
                self.wfile.write(json_dumps(response).encode())
                return
            
            self._set_response(200)
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Admin login - Fixed the endpoint
        elif path == '/admin-login':
            if not post_data:
                self._set_response(400)
                self.wfile.write(json_dumps({"error": "Missing login data"}).encode())
                return
            
            # Check required fields
            if 'email' not in post_data or 'password' not in post_data:
                self._set_response(400)
                self.wfile.write(json_dumps({"error": "Email and password required"}).encode())
                return
            
            # Login as admin
            response = login_admin(post_data['email'], post_data['password'])
            
            if "error" in response:
                self._set_response(401)
                self.wfile.write(json_dumps(response).encode())
                return
            
            self._set_response(200)
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Create artwork (admin only)
        elif path == '/artworks':
            auth_header = self.headers.get('Authorization', '')
            response = create_artwork(auth_header, post_data)
            
            if "error" in response:
                error_message = response["error"]
                
                if "Authentication" in error_message or "authorized" in error_message:
                    self._set_response(401)
                elif "Admin" in error_message:
                    self._set_response(403)
                else:
                    self._set_response(400)
                    
                self.wfile.write(json_dumps({"error": error_message}).encode())
                return
            
            self._set_response(201)
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Create exhibition (admin only)
        elif path == '/exhibitions':
            auth_header = self.headers.get('Authorization', '')
            response = create_exhibition(auth_header, post_data)
            
            if "error" in response:
                error_message = response["error"]
                
                if "Authentication" in error_message or "authorized" in error_message:
                    self._set_response(401)
                elif "Admin" in error_message:
                    self._set_response(403)
                else:
                    self._set_response(400)
                    
                self.wfile.write(json_dumps({"error": error_message}).encode())
                return
            
            self._set_response(201)
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Create contact message
        elif path == '/contact':
            response = create_contact_message(post_data)
            
            if "error" in response:
                self._set_response(400)
            else:
                self._set_response(201)
            
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Update message status (admin only)
        elif path.startswith('/messages/'):
            message_id = path.split('/')[2]
            token = extract_auth_token(self)
            if not token:
                self._set_response(401)
                self.wfile.write(json_dumps({"error": "Authentication required"}).encode())
                return
            
            payload = verify_token(token)
            if isinstance(payload, dict) and "error" in payload:
                self._set_response(401)
                self.wfile.write(json_dumps({"error": payload["error"]}).encode())
                return
            
            # Check if user is admin
            if not payload.get("is_admin", False):
                self._set_response(403)
                self.wfile.write(json_dumps({"error": "Unauthorized access: Admin privileges required"}).encode())
                return
            
            response = update_message(self.headers.get('Authorization', ''), message_id, post_data)
            
            if "error" in response:
                self._set_response(400)
            else:
                self._set_response(200)
            
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Default 404 response
        self._set_response(404)
        self.wfile.write(json_dumps({"error": "Resource not found"}).encode())
    
    def do_PUT(self):
        # Get content length
        content_length = int(self.headers.get('Content-Length', 0))
        
        # Parse JSON data
        post_data = {}
        if content_length > 0:
            post_data = json.loads(self.rfile.read(content_length).decode('utf-8'))
        
        # Process based on path
        path = self.path
        
        # Update artwork (admin only)
        if path.startswith('/artworks/') and len(path.split('/')) == 3:
            artwork_id = path.split('/')[2]
            auth_header = self.headers.get('Authorization', '')
            
            response = update_artwork(auth_header, artwork_id, post_data)
            
            if "error" in response:
                error_message = response["error"]
                
                if "Authentication" in error_message or "authorized" in error_message:
                    self._set_response(401)
                elif "Admin" in error_message:
                    self._set_response(403)
                elif "not found" in error_message:
                    self._set_response(404)
                else:
                    self._set_response(400)
                    
                self.wfile.write(json_dumps({"error": error_message}).encode())
                return
            
            self._set_response(200)
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Update exhibition (admin only)
        elif path.startswith('/exhibitions/') and len(path.split('/')) == 3:
            exhibition_id = path.split('/')[2]
            auth_header = self.headers.get('Authorization', '')
            
            response = update_exhibition(auth_header, exhibition_id, post_data)
            
            if "error" in response:
                error_message = response["error"]
                
                if "Authentication" in error_message or "authorized" in error_message:
                    self._set_response(401)
                elif "Admin" in error_message:
                    self._set_response(403)
                elif "not found" in error_message:
                    self._set_response(404)
                else:
                    self._set_response(400)
                    
                self.wfile.write(json_dumps({"error": error_message}).encode())
                return
            
            self._set_response(200)
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Default 404 response
        self._set_response(404)
        self.wfile.write(json_dumps({"error": "Resource not found"}).encode())
    
    def do_DELETE(self):
        # Process based on path
        path = self.path
        
        # Delete artwork (admin only)
        if path.startswith('/artworks/') and len(path.split('/')) == 3:
            artwork_id = path.split('/')[2]
            auth_header = self.headers.get('Authorization', '')
            
            response = delete_artwork(auth_header, artwork_id)
            
            if "error" in response:
                error_message = response["error"]
                
                if "Authentication" in error_message or "authorized" in error_message:
                    self._set_response(401)
                elif "Admin" in error_message:
                    self._set_response(403)
                elif "not found" in error_message:
                    self._set_response(404)
                else:
                    self._set_response(400)
                    
                self.wfile.write(json_dumps({"error": error_message}).encode())
                return
            
            self._set_response(200)
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Delete exhibition (admin only)
        elif path.startswith('/exhibitions/') and len(path.split('/')) == 3:
            exhibition_id = path.split('/')[2]
            auth_header = self.headers.get('Authorization', '')
            
            response = delete_exhibition(auth_header, exhibition_id)
            
            if "error" in response:
                error_message = response["error"]
                
                if "Authentication" in error_message or "authorized" in error_message:
                    self._set_response(401)
                elif "Admin" in error_message:
                    self._set_response(403)
                elif "not found" in error_message:
                    self._set_response(404)
                else:
                    self._set_response(400)
                    
                self.wfile.write(json_dumps({"error": error_message}).encode())
                return
            
            self._set_response(200)
            self.wfile.write(json_dumps(response).encode())
            return
        
        # Default 404 response
        self._set_response(404)
        self.wfile.write(json_dumps({"error": "Resource not found"}).encode())

def main():
    """Start the server"""
    # Initialize the database
    print("Initializing database...")
    initialize_database()
    
    # Create uploads directory if it doesn't exist
    ensure_uploads_directory()
    
    # Create default exhibition image
    create_default_exhibition_image()
    
    # Create an HTTP server
    print(f"Starting server on port {PORT}...")
    httpd = socketserver.ThreadingTCPServer(("", PORT), RequestHandler)
    print(f"Server running on port {PORT}")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
    finally:
        httpd.server_close()
        print("Server closed")

if __name__ == "__main__":
    main()
