import http.server
import socketserver
import json
import os
import re
from urllib.parse import urlparse, parse_qs
from http import cookies
from functools import wraps
from datetime import datetime
from decimal import Decimal

from middleware import generate_token, verify_token, auth_required, admin_required, extract_auth_token, json_dumps
from database import save_contact_message, get_all_contact_messages, update_message_status
from mpesa import handle_stk_push_request, check_transaction_status, handle_mpesa_callback
from users import create_user, authenticate_user, get_user_by_id, update_user, get_all_users, delete_user
from artworks import create_artwork, get_artwork_by_id, get_all_artworks, update_artwork, delete_artwork
from exhibitions import create_exhibition, get_exhibition_by_id, get_all_exhibitions, update_exhibition, delete_exhibition
from orders import (
    get_user_orders,
    get_user_tickets,
    create_order,
    create_ticket
)

PORT = int(os.environ.get('PORT', 8000))
CORS_ALLOW_ORIGIN = os.environ.get('CORS_ALLOW_ORIGIN', '*')

class RequestHandler(http.server.BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.user_info = None
        super().__init__(*args, **kwargs)

    def _set_response(self, status_code=200, content_type='application/json'):
        self.send_response(status_code)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', CORS_ALLOW_ORIGIN)
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def _send_json_response(self, data, status_code=200):
        self._set_response(status_code)
        json_data = json_dumps(data)
        self.wfile.write(json_data.encode('utf-8'))

    def _send_error_response(self, message, status_code=500):
        self._set_response(status_code)
        error_data = {'error': message}
        json_data = json_dumps(error_data)
        self.wfile.write(json_data.encode('utf-8'))

    def do_OPTIONS(self):
        self._set_response(204)
        self.wfile.write(b'')

    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            parsed_path = urlparse(self.path)
            path = parsed_path.path

            if path == '/register':
                response = create_user(data)
                self._send_json_response(response, 201 if "id" in response else 400)
            elif path == '/login':
                response = authenticate_user(data.get('email'), data.get('password'))
                if "token" in response:
                    self._send_json_response(response)
                else:
                    self._send_json_response(response, 401)
            elif path == '/contact':
                response = save_contact_message(
                    data.get('name'), data.get('email'), data.get('phone'), data.get('message')
                )
                self._send_json_response(response, 201 if "message_id" in response else 400)
            elif path == '/artworks':
                response = create_artwork(data)
                self._send_json_response(response, 201 if "id" in response else 400)
            elif path == '/exhibitions':
                response = create_exhibition(data)
                self._send_json_response(response, 201 if "id" in response else 400)
            elif path == '/mpesa/stk-push':
                response = handle_stk_push_request(data)
                self._send_json_response(response)
            elif path == '/mpesa/callback':
                response = handle_mpesa_callback(data)
                self._send_json_response(response)
            else:
                self._send_error_response('Not Found', 404)

        except json.JSONDecodeError:
            self._send_error_response('Invalid JSON format', 400)
        except Exception as e:
            self._send_error_response(str(e))

    @auth_required
    def do_PUT(self):
        try:
            content_length = int(self.headers['Content-Length'])
            put_data = self.rfile.read(content_length)
            data = json.loads(put_data.decode('utf-8'))
            parsed_path = urlparse(self.path)
            path = parsed_path.path

            if path == '/users':
                user_id = self.user_info.get("sub")
                response = update_user(user_id, data)
                self._send_json_response(response)
            elif path.startswith('/artworks/'):
                artwork_id = path.split('/')[-1]
                response = update_artwork(artwork_id, data)
                self._send_json_response(response)
            elif path.startswith('/exhibitions/'):
                exhibition_id = path.split('/')[-1]
                response = update_exhibition(exhibition_id, data)
                self._send_json_response(response)
            elif path.startswith('/messages/'):
                message_id = path.split('/')[-1]
                status = data.get('status')
                response = update_message_status(message_id, status)
                self._send_json_response(response)
            else:
                self._send_error_response('Not Found', 404)

        except json.JSONDecodeError:
            self._send_error_response('Invalid JSON format', 400)
        except Exception as e:
            self._send_error_response(str(e))

    @admin_required
    def do_DELETE(self):
        try:
            parsed_path = urlparse(self.path)
            path = parsed_path.path

            if path.startswith('/users/'):
                user_id = path.split('/')[-1]
                response = delete_user(user_id)
                self._send_json_response(response)
            elif path.startswith('/artworks/'):
                artwork_id = path.split('/')[-1]
                response = delete_artwork(artwork_id)
                self._send_json_response(response)
            elif path.startswith('/exhibitions/'):
                exhibition_id = path.split('/')[-1]
                response = delete_exhibition(exhibition_id)
                self._send_json_response(response)
            else:
                self._send_error_response('Not Found', 404)

        except Exception as e:
            self._send_error_response(str(e))

    def do_GET(self):
        try:
            # Extract path and query parameters
            parsed_path = urlparse(self.path)
            path = parsed_path.path
            
            # Get auth header for protected routes
            auth_header = self.headers.get('Authorization', '')
            
            if path == '/orders':
                # Get user orders (requires authentication)
                if not auth_header:
                    self._send_json_response({"error": "Authentication required"}, 401)
                    return
                
                payload = verify_token(extract_auth_token(auth_header))
                if "error" in payload:
                    self._send_json_response({"error": payload["error"]}, 401)
                    return
                
                orders = get_user_orders(payload["sub"])
                self._send_json_response({"orders": orders})
                return
                
            elif path == '/tickets':
                # Get user tickets (requires authentication)
                if not auth_header:
                    self._send_json_response({"error": "Authentication required"}, 401)
                    return
                
                payload = verify_token(extract_auth_token(auth_header))
                if "error" in payload:
                    self._send_json_response({"error": payload["error"]}, 401)
                    return
                
                tickets = get_user_tickets(payload["sub"])
                self._send_json_response({"tickets": tickets})
                return
                
            if path == '/users/me':
                if not auth_header:
                    self._send_json_response({"error": "Authentication required"}, 401)
                    return

                payload = verify_token(extract_auth_token(auth_header))
                if "error" in payload:
                    self._send_json_response({"error": payload["error"]}, 401)
                    return

                user_id = payload.get("sub")
                user = get_user_by_id(user_id)
                if user:
                     self._send_json_response({"user": user})
                else:
                    self._send_json_response({"error": "User not found"}, 404)
                return
            elif path == '/messages':
                messages = get_all_contact_messages()
                self._send_json_response(messages)
            elif path.startswith('/artworks/'):
                artwork_id = path.split('/')[-1]
                artwork = get_artwork_by_id(artwork_id)
                if artwork:
                    self._send_json_response({"artwork": artwork})
                else:
                    self._send_json_response({"error": "Artwork not found"}, 404)
            elif path == '/artworks':
                artworks = get_all_artworks()
                self._send_json_response({"artworks": artworks})
            elif path.startswith('/exhibitions/'):
                exhibition_id = path.split('/')[-1]
                exhibition = get_exhibition_by_id(exhibition_id)
                if exhibition:
                    self._send_json_response({"exhibition": exhibition})
                else:
                    self._send_json_response({"error": "Exhibition not found"}, 404)
            elif path == '/exhibitions':
                exhibitions = get_all_exhibitions()
                self._send_json_response({"exhibitions": exhibitions})
            elif path.startswith('/mpesa/status/'):
                checkout_request_id = path.split('/')[-1]
                response = check_transaction_status(checkout_request_id)
                self._send_json_response(response)
            else:
                self._send_error_response('Not Found', 404)

        except Exception as e:
            self._send_error_response(str(e))

with socketserver.TCPServer(("", PORT), RequestHandler) as httpd:
    print("Server started at port", PORT)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    print("Server stopped.")
