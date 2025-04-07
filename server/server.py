
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from urllib.parse import parse_qs, urlparse
import cgi
import os
import sys
import hashlib
import datetime

# Import our modules
from db_setup import get_db_connection, dict_from_row, initialize_database
from middleware import auth_required, admin_required, generate_token, verify_token, extract_auth_token
from mpesa import handle_stk_push_request, handle_mpesa_callback, check_transaction_status

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
            response = self.get_all_artworks()
            self._set_response()
            self.wfile.write(json.dumps(response).encode())
        
        # Get a specific artwork
        elif path.startswith('/artworks/') and len(path.split('/')) == 3:
            artwork_id = path.split('/')[2]
            response = self.get_artwork(artwork_id)
            self._set_response()
            self.wfile.write(json.dumps(response).encode())
        
        # Get all exhibitions
        elif path == '/exhibitions':
            response = self.get_all_exhibitions()
            self._set_response()
            self.wfile.write(json.dumps(response).encode())
        
        # Get a specific exhibition
        elif path.startswith('/exhibitions/') and len(path.split('/')) == 3:
            exhibition_id = path.split('/')[2]
            response = self.get_exhibition(exhibition_id)
            self._set_response()
            self.wfile.write(json.dumps(response).encode())
        
        # Get all contact messages (admin only)
        elif path == '/messages':
            token = extract_auth_token(self)
            if not token:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": "Authentication required"}).encode())
                return
            
            payload = verify_token(token)
            if isinstance(payload, dict) and "error" in payload:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": payload["error"]}).encode())
                return
            
            if not payload.get("is_admin", False):
                self._set_response(403)
                self.wfile.write(json.dumps({"error": "Unauthorized access"}).encode())
                return
            
            response = self.get_all_messages()
            self._set_response()
            self.wfile.write(json.dumps(response).encode())
        
        # Get user orders
        elif path.startswith('/orders/user/') and len(path.split('/')) == 4:
            user_id = path.split('/')[3]
            token = extract_auth_token(self)
            if not token:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": "Authentication required"}).encode())
                return
            
            payload = verify_token(token)
            if isinstance(payload, dict) and "error" in payload:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": payload["error"]}).encode())
                return
            
            # Check if user is requesting their own orders or is admin
            if str(payload.get("sub")) != user_id and not payload.get("is_admin", False):
                self._set_response(403)
                self.wfile.write(json.dumps({"error": "Unauthorized access"}).encode())
                return
            
            response = self.get_user_orders(user_id)
            self._set_response()
            self.wfile.write(json.dumps(response).encode())
        
        # Check M-Pesa transaction status
        elif path.startswith('/mpesa/status/') and len(path.split('/')) == 4:
            checkout_request_id = path.split('/')[3]
            response = check_transaction_status(checkout_request_id)
            
            self._set_response()
            self.wfile.write(json.dumps(response).encode())
        
        # Get user tickets
        elif path.startswith('/tickets/user/') and len(path.split('/')) == 4:
            user_id = path.split('/')[3]
            token = extract_auth_token(self)
            if not token:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": "Authentication required"}).encode())
                return
            
            payload = verify_token(token)
            if isinstance(payload, dict) and "error" in payload:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": payload["error"]}).encode())
                return
            
            # Check if user is requesting their own tickets or is admin
            if str(payload.get("sub")) != user_id and not payload.get("is_admin", False):
                self._set_response(403)
                self.wfile.write(json.dumps({"error": "Unauthorized access"}).encode())
                return
            
            response = self.get_user_tickets(user_id)
            self._set_response()
            self.wfile.write(json.dumps(response).encode())
        
        # Generate exhibition ticket
        elif path.startswith('/tickets/generate/') and len(path.split('/')) == 4:
            booking_id = path.split('/')[3]
            token = extract_auth_token(self)
            if not token:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": "Authentication required"}).encode())
                return
            
            payload = verify_token(token)
            if isinstance(payload, dict) and "error" in payload:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": payload["error"]}).encode())
                return
            
            response = self.generate_ticket(booking_id, payload.get("sub"))
            self._set_response()
            self.wfile.write(json.dumps(response).encode())
        
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
            
            response = self.register_user(name, email, password, phone)
            
            if "error" in response:
                self._set_response(400)
            else:
                self._set_response()
            
            self.wfile.write(json.dumps(response).encode())
        
        # User login
        elif self.path == '/login':
            email = data.get('email')
            password = data.get('password')
            
            if not all([email, password]):
                self._set_response(400)
                self.wfile.write(json.dumps({"error": "Missing required fields"}).encode())
                return
            
            response = self.login_user(email, password)
            
            if "error" in response:
                self._set_response(401)
            else:
                self._set_response()
            
            self.wfile.write(json.dumps(response).encode())
        
        # Admin login
        elif self.path == '/admin-login':
            email = data.get('email')
            password = data.get('password')
            
            if not all([email, password]):
                self._set_response(400)
                self.wfile.write(json.dumps({"error": "Missing required fields"}).encode())
                return
            
            response = self.login_admin(email, password)
            
            if "error" in response:
                self._set_response(401)
            else:
                self._set_response()
            
            self.wfile.write(json.dumps(response).encode())
        
        # Create a new artwork (admin only)
        elif self.path == '/artworks':
            token = extract_auth_token(self)
            if not token:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": "Authentication required"}).encode())
                return
            
            payload = verify_token(token)
            if isinstance(payload, dict) and "error" in payload:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": payload["error"]}).encode())
                return
            
            if not payload.get("is_admin", False):
                self._set_response(403)
                self.wfile.write(json.dumps({"error": "Unauthorized access"}).encode())
                return
            
            response = self.create_artwork(data)
            
            if "error" in response:
                self._set_response(400)
            else:
                self._set_response(201)
            
            self.wfile.write(json.dumps(response).encode())
        
        # Create a new exhibition (admin only)
        elif self.path == '/exhibitions':
            token = extract_auth_token(self)
            if not token:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": "Authentication required"}).encode())
                return
            
            payload = verify_token(token)
            if isinstance(payload, dict) and "error" in payload:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": payload["error"]}).encode())
                return
            
            if not payload.get("is_admin", False):
                self._set_response(403)
                self.wfile.write(json.dumps({"error": "Unauthorized access"}).encode())
                return
            
            response = self.create_exhibition(data)
            
            if "error" in response:
                self._set_response(400)
            else:
                self._set_response(201)
            
            self.wfile.write(json.dumps(response).encode())
        
        # Create a new contact message
        elif self.path == '/contact':
            name = data.get('name')
            email = data.get('email')
            phone = data.get('phone')
            message = data.get('message')
            
            if not all([name, email, message]):
                self._set_response(400)
                self.wfile.write(json.dumps({"error": "Missing required fields"}).encode())
                return
            
            response = self.create_contact_message(name, email, phone, message)
            
            if "error" in response:
                self._set_response(400)
            else:
                self._set_response(201)
            
            self.wfile.write(json.dumps(response).encode())
        
        # Create a new artwork order
        elif self.path == '/orders/artwork':
            token = extract_auth_token(self)
            if not token:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": "Authentication required"}).encode())
                return
            
            payload = verify_token(token)
            if isinstance(payload, dict) and "error" in payload:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": payload["error"]}).encode())
                return
            
            user_id = payload.get("sub")
            response = self.create_artwork_order(user_id, data)
            
            if "error" in response:
                self._set_response(400)
            else:
                self._set_response(201)
            
            self.wfile.write(json.dumps(response).encode())
        
        # Create a new exhibition booking
        elif self.path == '/orders/exhibition':
            token = extract_auth_token(self)
            if not token:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": "Authentication required"}).encode())
                return
            
            payload = verify_token(token)
            if isinstance(payload, dict) and "error" in payload:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": payload["error"]}).encode())
                return
            
            user_id = payload.get("sub")
            response = self.create_exhibition_booking(user_id, data)
            
            if "error" in response:
                self._set_response(400)
            else:
                self._set_response(201)
            
            self.wfile.write(json.dumps(response).encode())
        
        # M-Pesa STK Push
        elif self.path == '/mpesa/stk-push':
            response = handle_stk_push_request(data)
            
            if "error" in response:
                self._set_response(400)
            else:
                self._set_response(200)
            
            self.wfile.write(json.dumps(response).encode())
        
        # M-Pesa Callback
        elif self.path == '/mpesa/callback':
            response = handle_mpesa_callback(data)
            
            self._set_response(200)
            self.wfile.write(json.dumps(response).encode())
        
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
        
        # Update an artwork (admin only)
        if self.path.startswith('/artworks/') and len(self.path.split('/')) == 3:
            artwork_id = self.path.split('/')[2]
            token = extract_auth_token(self)
            if not token:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": "Authentication required"}).encode())
                return
            
            payload = verify_token(token)
            if isinstance(payload, dict) and "error" in payload:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": payload["error"]}).encode())
                return
            
            if not payload.get("is_admin", False):
                self._set_response(403)
                self.wfile.write(json.dumps({"error": "Unauthorized access"}).encode())
                return
            
            response = self.update_artwork(artwork_id, data)
            
            if "error" in response:
                if response["error"] == "Artwork not found":
                    self._set_response(404)
                else:
                    self._set_response(400)
            else:
                self._set_response()
            
            self.wfile.write(json.dumps(response).encode())
        
        # Update an exhibition (admin only)
        elif self.path.startswith('/exhibitions/') and len(self.path.split('/')) == 3:
            exhibition_id = self.path.split('/')[2]
            token = extract_auth_token(self)
            if not token:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": "Authentication required"}).encode())
                return
            
            payload = verify_token(token)
            if isinstance(payload, dict) and "error" in payload:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": payload["error"]}).encode())
                return
            
            if not payload.get("is_admin", False):
                self._set_response(403)
                self.wfile.write(json.dumps({"error": "Unauthorized access"}).encode())
                return
            
            response = self.update_exhibition(exhibition_id, data)
            
            if "error" in response:
                if response["error"] == "Exhibition not found":
                    self._set_response(404)
                else:
                    self._set_response(400)
            else:
                self._set_response()
            
            self.wfile.write(json.dumps(response).encode())
        
        # Update a message status (admin only)
        elif self.path.startswith('/messages/') and len(self.path.split('/')) == 3:
            message_id = self.path.split('/')[2]
            token = extract_auth_token(self)
            if not token:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": "Authentication required"}).encode())
                return
            
            payload = verify_token(token)
            if isinstance(payload, dict) and "error" in payload:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": payload["error"]}).encode())
                return
            
            if not payload.get("is_admin", False):
                self._set_response(403)
                self.wfile.write(json.dumps({"error": "Unauthorized access"}).encode())
                return
            
            response = self.update_message_status(message_id, data.get('status'))
            
            if "error" in response:
                if response["error"] == "Message not found":
                    self._set_response(404)
                else:
                    self._set_response(400)
            else:
                self._set_response()
            
            self.wfile.write(json.dumps(response).encode())
        
        # Handle 404 Not Found
        else:
            self._set_response(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())
    
    def do_DELETE(self):
        # Delete an artwork (admin only)
        if self.path.startswith('/artworks/') and len(self.path.split('/')) == 3:
            artwork_id = self.path.split('/')[2]
            token = extract_auth_token(self)
            if not token:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": "Authentication required"}).encode())
                return
            
            payload = verify_token(token)
            if isinstance(payload, dict) and "error" in payload:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": payload["error"]}).encode())
                return
            
            if not payload.get("is_admin", False):
                self._set_response(403)
                self.wfile.write(json.dumps({"error": "Unauthorized access"}).encode())
                return
            
            response = self.delete_artwork(artwork_id)
            
            if "error" in response:
                if response["error"] == "Artwork not found":
                    self._set_response(404)
                else:
                    self._set_response(400)
            else:
                self._set_response()
            
            self.wfile.write(json.dumps(response).encode())
        
        # Delete an exhibition (admin only)
        elif self.path.startswith('/exhibitions/') and len(self.path.split('/')) == 3:
            exhibition_id = self.path.split('/')[2]
            token = extract_auth_token(self)
            if not token:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": "Authentication required"}).encode())
                return
            
            payload = verify_token(token)
            if isinstance(payload, dict) and "error" in payload:
                self._set_response(401)
                self.wfile.write(json.dumps({"error": payload["error"]}).encode())
                return
            
            if not payload.get("is_admin", False):
                self._set_response(403)
                self.wfile.write(json.dumps({"error": "Unauthorized access"}).encode())
                return
            
            response = self.delete_exhibition(exhibition_id)
            
            if "error" in response:
                if response["error"] == "Exhibition not found":
                    self._set_response(404)
                else:
                    self._set_response(400)
            else:
                self._set_response()
            
            self.wfile.write(json.dumps(response).encode())
        
        # Handle 404 Not Found
        else:
            self._set_response(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())
    
    # Authentication and user management methods
    def hash_password(self, password):
        """Hash a password using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def register_user(self, name, email, password, phone):
        """Register a new user"""
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        hashed_password = self.hash_password(password)
        
        try:
            # Check if email already exists
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return {"error": "Email already registered"}
            
            # Insert the new user
            query = """
            INSERT INTO users (name, email, password, phone)
            VALUES (%s, %s, %s, %s)
            """
            cursor.execute(query, (name, email, hashed_password, phone))
            connection.commit()
            
            # Get the new user ID
            user_id = cursor.lastrowid
            
            # Generate token for the new user
            token = generate_token(user_id, name, False)
            
            return {
                "token": token,
                "user_id": user_id,
                "name": name
            }
        except Exception as e:
            print(f"Error registering user: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    def login_user(self, email, password):
        """Login a user"""
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        hashed_password = self.hash_password(password)
        
        try:
            # Check user credentials
            query = "SELECT id, name FROM users WHERE email = %s AND password = %s"
            cursor.execute(query, (email, hashed_password))
            user = cursor.fetchone()
            
            if not user:
                return {"error": "Invalid credentials"}
            
            # Generate token for the user
            user_id, name = user
            token = generate_token(user_id, name, False)
            
            return {
                "token": token,
                "user_id": user_id,
                "name": name
            }
        except Exception as e:
            print(f"Error logging in user: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    def login_admin(self, email, password):
        """Login an admin"""
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        hashed_password = self.hash_password(password)
        
        try:
            # Check admin credentials
            query = "SELECT id, name FROM admins WHERE email = %s AND password = %s"
            cursor.execute(query, (email, hashed_password))
            admin = cursor.fetchone()
            
            if not admin:
                return {"error": "Invalid admin credentials"}
            
            # Generate token for the admin
            admin_id, name = admin
            token = generate_token(admin_id, name, True)
            
            print(f"Admin login successful: {name}, admin_id: {admin_id}, token: {token[:20]}...")
            
            return {
                "token": token,
                "admin_id": admin_id,
                "name": name
            }
        except Exception as e:
            print(f"Error logging in admin: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    # Artwork management methods
    def get_all_artworks(self):
        """Get all artworks"""
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        try:
            query = """
            SELECT id, title, artist, description, price, image_url, dimensions, medium, year, status
            FROM artworks
            ORDER BY created_at DESC
            """
            cursor.execute(query)
            rows = cursor.fetchall()
            
            artworks = []
            for row in rows:
                artwork = dict_from_row(row, cursor)
                
                # Convert id to string to match frontend expectations
                artwork['id'] = str(artwork['id'])
                
                # Convert image_url to camelCase
                artwork['imageUrl'] = artwork.pop('image_url')
                
                artworks.append(artwork)
            
            return {"artworks": artworks}
        except Exception as e:
            print(f"Error getting artworks: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    def get_artwork(self, artwork_id):
        """Get a specific artwork"""
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        try:
            query = """
            SELECT id, title, artist, description, price, image_url, dimensions, medium, year, status
            FROM artworks
            WHERE id = %s
            """
            cursor.execute(query, (artwork_id,))
            row = cursor.fetchone()
            
            if not row:
                return {"error": "Artwork not found"}
            
            artwork = dict_from_row(row, cursor)
            
            # Convert id to string to match frontend expectations
            artwork['id'] = str(artwork['id'])
            
            # Convert image_url to camelCase
            artwork['imageUrl'] = artwork.pop('image_url')
            
            return artwork
        except Exception as e:
            print(f"Error getting artwork: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    def create_artwork(self, artwork_data):
        """Create a new artwork"""
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        try:
            query = """
            INSERT INTO artworks (title, artist, description, price, image_url, dimensions, medium, year, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (
                artwork_data.get("title"),
                artwork_data.get("artist"),
                artwork_data.get("description"),
                artwork_data.get("price"),
                artwork_data.get("imageUrl"),  # Note camelCase to snake_case
                artwork_data.get("dimensions"),
                artwork_data.get("medium"),
                artwork_data.get("year"),
                artwork_data.get("status", "available")
            ))
            connection.commit()
            
            # Return the newly created artwork
            new_artwork_id = cursor.lastrowid
            return self.get_artwork(new_artwork_id)
        except Exception as e:
            print(f"Error creating artwork: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    def update_artwork(self, artwork_id, artwork_data):
        """Update an existing artwork"""
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        try:
            query = """
            UPDATE artworks
            SET title = %s, artist = %s, description = %s, price = %s, image_url = %s,
                dimensions = %s, medium = %s, year = %s, status = %s
            WHERE id = %s
            """
            cursor.execute(query, (
                artwork_data.get("title"),
                artwork_data.get("artist"),
                artwork_data.get("description"),
                artwork_data.get("price"),
                artwork_data.get("imageUrl"),  # Note camelCase to snake_case
                artwork_data.get("dimensions"),
                artwork_data.get("medium"),
                artwork_data.get("year"),
                artwork_data.get("status"),
                artwork_id
            ))
            connection.commit()
            
            # Check if artwork was found and updated
            if cursor.rowcount == 0:
                return {"error": "Artwork not found"}
            
            # Return the updated artwork
            return self.get_artwork(artwork_id)
        except Exception as e:
            print(f"Error updating artwork: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    def delete_artwork(self, artwork_id):
        """Delete an artwork"""
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        try:
            # Check if artwork exists
            cursor.execute("SELECT id FROM artworks WHERE id = %s", (artwork_id,))
            if not cursor.fetchone():
                return {"error": "Artwork not found"}
            
            # Delete the artwork
            query = "DELETE FROM artworks WHERE id = %s"
            cursor.execute(query, (artwork_id,))
            connection.commit()
            
            return {"success": True, "message": "Artwork deleted successfully"}
        except Exception as e:
            print(f"Error deleting artwork: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    # Exhibition management methods
    def get_all_exhibitions(self):
        """Get all exhibitions"""
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        try:
            query = """
            SELECT id, title, description, location, start_date, end_date,
                   ticket_price, image_url, total_slots, available_slots, status
            FROM exhibitions
            ORDER BY start_date ASC
            """
            cursor.execute(query)
            rows = cursor.fetchall()
            
            exhibitions = []
            for row in rows:
                exhibition = dict_from_row(row, cursor)
                
                # Convert id to string to match frontend expectations
                exhibition['id'] = str(exhibition['id'])
                
                # Convert dates to string format
                exhibition['startDate'] = exhibition.pop('start_date').isoformat()
                exhibition['endDate'] = exhibition.pop('end_date').isoformat()
                
                # Convert to camelCase
                exhibition['ticketPrice'] = exhibition.pop('ticket_price')
                exhibition['imageUrl'] = exhibition.pop('image_url')
                exhibition['totalSlots'] = exhibition.pop('total_slots')
                exhibition['availableSlots'] = exhibition.pop('available_slots')
                
                exhibitions.append(exhibition)
            
            return {"exhibitions": exhibitions}
        except Exception as e:
            print(f"Error getting exhibitions: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    def get_exhibition(self, exhibition_id):
        """Get a specific exhibition"""
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        try:
            query = """
            SELECT id, title, description, location, start_date, end_date,
                   ticket_price, image_url, total_slots, available_slots, status
            FROM exhibitions
            WHERE id = %s
            """
            cursor.execute(query, (exhibition_id,))
            row = cursor.fetchone()
            
            if not row:
                return {"error": "Exhibition not found"}
            
            exhibition = dict_from_row(row, cursor)
            
            # Convert id to string to match frontend expectations
            exhibition['id'] = str(exhibition['id'])
            
            # Convert dates to string format
            exhibition['startDate'] = exhibition.pop('start_date').isoformat()
            exhibition['endDate'] = exhibition.pop('end_date').isoformat()
            
            # Convert to camelCase
            exhibition['ticketPrice'] = exhibition.pop('ticket_price')
            exhibition['imageUrl'] = exhibition.pop('image_url')
            exhibition['totalSlots'] = exhibition.pop('total_slots')
            exhibition['availableSlots'] = exhibition.pop('available_slots')
            
            return exhibition
        except Exception as e:
            print(f"Error getting exhibition: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    def create_exhibition(self, exhibition_data):
        """Create a new exhibition"""
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        try:
            query = """
            INSERT INTO exhibitions (title, description, location, start_date, end_date,
                                  ticket_price, image_url, total_slots, available_slots, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            # If availableSlots not provided, use totalSlots
            available_slots = exhibition_data.get("availableSlots", exhibition_data.get("totalSlots"))
            
            cursor.execute(query, (
                exhibition_data.get("title"),
                exhibition_data.get("description"),
                exhibition_data.get("location"),
                exhibition_data.get("startDate"),
                exhibition_data.get("endDate"),
                exhibition_data.get("ticketPrice"),
                exhibition_data.get("imageUrl"),
                exhibition_data.get("totalSlots"),
                available_slots,
                exhibition_data.get("status")
            ))
            connection.commit()
            
            # Return the newly created exhibition
            new_exhibition_id = cursor.lastrowid
            return self.get_exhibition(new_exhibition_id)
        except Exception as e:
            print(f"Error creating exhibition: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    def update_exhibition(self, exhibition_id, exhibition_data):
        """Update an existing exhibition"""
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        try:
            query = """
            UPDATE exhibitions
            SET title = %s, description = %s, location = %s, start_date = %s, end_date = %s,
                ticket_price = %s, image_url = %s, total_slots = %s, available_slots = %s, status = %s
            WHERE id = %s
            """
            cursor.execute(query, (
                exhibition_data.get("title"),
                exhibition_data.get("description"),
                exhibition_data.get("location"),
                exhibition_data.get("startDate"),
                exhibition_data.get("endDate"),
                exhibition_data.get("ticketPrice"),
                exhibition_data.get("imageUrl"),
                exhibition_data.get("totalSlots"),
                exhibition_data.get("availableSlots"),
                exhibition_data.get("status"),
                exhibition_id
            ))
            connection.commit()
            
            # Check if exhibition was found and updated
            if cursor.rowcount == 0:
                return {"error": "Exhibition not found"}
            
            # Return the updated exhibition
            return self.get_exhibition(exhibition_id)
        except Exception as e:
            print(f"Error updating exhibition: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    def delete_exhibition(self, exhibition_id):
        """Delete an exhibition"""
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        try:
            # Check if exhibition exists
            cursor.execute("SELECT id FROM exhibitions WHERE id = %s", (exhibition_id,))
            if not cursor.fetchone():
                return {"error": "Exhibition not found"}
            
            # Delete the exhibition
            query = "DELETE FROM exhibitions WHERE id = %s"
            cursor.execute(query, (exhibition_id,))
            connection.commit()
            
            return {"success": True, "message": "Exhibition deleted successfully"}
        except Exception as e:
            print(f"Error deleting exhibition: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    # Contact message methods
    def create_contact_message(self, name, email, phone, message):
        """Create a new contact message"""
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        try:
            query = """
            INSERT INTO contact_messages (name, email, phone, message)
            VALUES (%s, %s, %s, %s)
            """
            cursor.execute(query, (name, email, phone, message))
            connection.commit()
            
            message_id = cursor.lastrowid
            
            return {
                "success": True,
                "message": "Message sent successfully",
                "message_id": message_id
            }
        except Exception as e:
            print(f"Error creating contact message: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    def get_all_messages(self):
        """Get all contact messages"""
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        try:
            query = """
            SELECT * FROM contact_messages
            ORDER BY date DESC
            """
            cursor.execute(query)
            rows = cursor.fetchall()
            
            messages = []
            for row in rows:
                message = dict_from_row(row, cursor)
                message['id'] = str(message['id'])
                messages.append(message)
            
            return {"messages": messages}
        except Exception as e:
            print(f"Error getting contact messages: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    def update_message_status(self, message_id, status):
        """Update the status of a message"""
        if status not in ['new', 'read', 'replied']:
            return {"error": "Invalid status"}
        
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        try:
            query = """
            UPDATE contact_messages
            SET status = %s
            WHERE id = %s
            """
            cursor.execute(query, (status, message_id))
            connection.commit()
            
            if cursor.rowcount == 0:
                return {"error": "Message not found"}
            
            return {"success": True}
        except Exception as e:
            print(f"Error updating message status: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    # Order methods
    def create_artwork_order(self, user_id, order_data):
        """Create a new artwork order"""
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        try:
            # Check if artwork exists and is available
            artwork_id = order_data.get("artwork_id")
            cursor.execute("SELECT status FROM artworks WHERE id = %s", (artwork_id,))
            row = cursor.fetchone()
            
            if not row:
                return {"error": "Artwork not found"}
            
            if row[0] != 'available':
                return {"error": "Artwork is not available"}
            
            # Create the order
            query = """
            INSERT INTO artwork_orders (user_id, artwork_id, name, email, phone, 
                                     delivery_address, payment_method, total_amount)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (
                user_id,
                artwork_id,
                order_data.get("name"),
                order_data.get("email"),
                order_data.get("phone"),
                order_data.get("delivery_address"),
                order_data.get("payment_method", "mpesa"),
                order_data.get("total_amount")
            ))
            connection.commit()
            
            order_id = cursor.lastrowid
            
            return {
                "success": True,
                "order_id": order_id,
                "message": "Order created successfully"
            }
        except Exception as e:
            print(f"Error creating artwork order: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    def create_exhibition_booking(self, user_id, booking_data):
        """Create a new exhibition booking"""
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        try:
            # Check if exhibition exists and has available slots
            exhibition_id = booking_data.get("exhibition_id")
            slots = booking_data.get("slots", 1)
            
            cursor.execute("SELECT available_slots FROM exhibitions WHERE id = %s", (exhibition_id,))
            row = cursor.fetchone()
            
            if not row:
                return {"error": "Exhibition not found"}
            
            available_slots = row[0]
            if available_slots < slots:
                return {"error": f"Not enough available slots. Only {available_slots} remaining."}
            
            # Create the booking
            query = """
            INSERT INTO exhibition_bookings (user_id, exhibition_id, name, email, phone, 
                                         slots, payment_method, total_amount)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (
                user_id,
                exhibition_id,
                booking_data.get("name"),
                booking_data.get("email"),
                booking_data.get("phone"),
                slots,
                booking_data.get("payment_method", "mpesa"),
                booking_data.get("total_amount")
            ))
            connection.commit()
            
            booking_id = cursor.lastrowid
            
            # Reserve the slots (temporarily)
            # Final update will happen after payment confirmation
            query = """
            UPDATE exhibitions
            SET available_slots = available_slots - %s
            WHERE id = %s
            """
            cursor.execute(query, (slots, exhibition_id))
            connection.commit()
            
            return {
                "success": True,
                "booking_id": booking_id,
                "message": "Booking created successfully"
            }
        except Exception as e:
            print(f"Error creating exhibition booking: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    def get_user_orders(self, user_id):
        """Get all orders for a user"""
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        try:
            # Get artwork orders
            artwork_query = """
            SELECT o.id as order_id, o.order_date, o.total_amount, o.payment_status,
                  a.id as artwork_id, a.title, a.artist, a.image_url,
                  'artwork' as order_type
            FROM artwork_orders o
            JOIN artworks a ON o.artwork_id = a.id
            WHERE o.user_id = %s
            ORDER BY o.order_date DESC
            """
            cursor.execute(artwork_query, (user_id,))
            artwork_rows = cursor.fetchall()
            
            # Get exhibition bookings
            exhibition_query = """
            SELECT b.id as booking_id, b.booking_date, b.total_amount, b.payment_status, b.slots,
                  e.id as exhibition_id, e.title, e.location, e.start_date, e.end_date, e.image_url,
                  'exhibition' as order_type
            FROM exhibition_bookings b
            JOIN exhibitions e ON b.exhibition_id = e.id
            WHERE b.user_id = %s
            ORDER BY b.booking_date DESC
            """
            cursor.execute(exhibition_query, (user_id,))
            exhibition_rows = cursor.fetchall()
            
            # Format the results
            orders = []
            
            for row in artwork_rows:
                order = dict_from_row(row, cursor)
                order['order_id'] = str(order['order_id'])
                order['artwork_id'] = str(order['artwork_id'])
                order['imageUrl'] = order.pop('image_url')
                order['date'] = order.pop('order_date').isoformat()
                orders.append(order)
            
            for row in exhibition_rows:
                booking = dict_from_row(row, cursor)
                booking['booking_id'] = str(booking['booking_id'])
                booking['exhibition_id'] = str(booking['exhibition_id'])
                booking['imageUrl'] = booking.pop('image_url')
                booking['date'] = booking.pop('booking_date').isoformat()
                booking['startDate'] = booking.pop('start_date').isoformat()
                booking['endDate'] = booking.pop('end_date').isoformat()
                orders.append(booking)
            
            # Sort by date (newest first)
            orders.sort(key=lambda x: x['date'], reverse=True)
            
            return {"orders": orders}
        except Exception as e:
            print(f"Error getting user orders: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    # Ticket methods
    def generate_ticket(self, booking_id, user_id):
        """Generate a ticket for an exhibition booking"""
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        try:
            # Check if booking exists and belongs to the user
            query = """
            SELECT b.id, b.payment_status, b.slots, 
                  e.title, e.location, e.start_date, e.end_date
            FROM exhibition_bookings b
            JOIN exhibitions e ON b.exhibition_id = e.id
            WHERE b.id = %s AND b.user_id = %s
            """
            cursor.execute(query, (booking_id, user_id))
            row = cursor.fetchone()
            
            if not row:
                return {"error": "Booking not found or not authorized"}
            
            booking_id, payment_status, slots, title, location, start_date, end_date = row
            
            if payment_status != 'completed':
                return {"error": "Payment not completed for this booking"}
            
            # Generate ticket data
            ticket_id = f"TKT-{booking_id}-{datetime.datetime.now().strftime('%Y%m%d')}"
            ticket_data = {
                "ticket_id": ticket_id,
                "booking_id": booking_id,
                "title": title,
                "location": location,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "slots": slots,
                "issued_date": datetime.datetime.now().isoformat()
            }
            
            return {
                "success": True,
                "ticket": ticket_data
            }
        except Exception as e:
            print(f"Error generating ticket: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    def get_user_tickets(self, user_id):
        """Get all tickets for a user"""
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        try:
            query = """
            SELECT b.id as booking_id, b.slots, b.payment_status,
                  e.id as exhibition_id, e.title, e.location, e.start_date, e.end_date, e.image_url
            FROM exhibition_bookings b
            JOIN exhibitions e ON b.exhibition_id = e.id
            WHERE b.user_id = %s AND b.payment_status = 'completed'
            ORDER BY e.start_date ASC
            """
            cursor.execute(query, (user_id,))
            rows = cursor.fetchall()
            
            tickets = []
            for row in rows:
                booking = dict_from_row(row, cursor)
                
                # Generate ticket data
                ticket_id = f"TKT-{booking['booking_id']}-{datetime.datetime.now().strftime('%Y%m%d')}"
                
                ticket = {
                    "ticket_id": ticket_id,
                    "booking_id": str(booking['booking_id']),
                    "exhibition_id": str(booking['exhibition_id']),
                    "title": booking['title'],
                    "location": booking['location'],
                    "startDate": booking['start_date'].isoformat(),
                    "endDate": booking['end_date'].isoformat(),
                    "slots": booking['slots'],
                    "imageUrl": booking['image_url'],
                    "issued_date": datetime.datetime.now().isoformat()
                }
                tickets.append(ticket)
            
            return {"tickets": tickets}
        except Exception as e:
            print(f"Error getting user tickets: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()

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
