
from database import save_contact_message, get_all_contact_messages, update_message_status
import json
import jwt
import os
from decimal import Decimal

# Get the secret key from environment or use a default (in production, always use environment variables)
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'afriart_default_secret_key')

# Custom JSON encoder to handle Decimal types
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def json_dumps(obj):
    """Convert object to JSON string, handling Decimal types"""
    return json.dumps(obj, cls=DecimalEncoder)

def is_admin(auth_header):
    """Verify if the request is from an admin"""
    if not auth_header or not auth_header.startswith('Bearer '):
        print("Invalid auth header format or missing")
        return False
    
    token = auth_header.split(' ')[1]
    
    try:
        print(f"Decoding token: {token[:20]}... (truncated)")
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        is_admin_user = payload.get('is_admin', False)
        print(f"Is admin from token payload: {is_admin_user}")
        return is_admin_user
    except jwt.PyJWTError as e:
        print(f"JWT decode error: {str(e)}")
        return False

def create_contact_message(data):
    """Create a new contact message"""
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone', '')
    message = data.get('message')
    
    # Support for chat messages
    source = data.get('source', 'contact_form')  # Track where messages come from
    
    # Validate required fields
    if not name or not email or not message:
        return {"error": "Missing required fields"}
    
    # Print data for debugging
    print(f"Saving contact message: {name}, {email}, {message}, source: {source}")
    
    # Save the message
    result = save_contact_message(name, email, phone, message, source)
    
    # Print result for debugging
    print(f"Save result: {result}")
    
    # Convert any Decimal values to float
    if isinstance(result, dict):
        return json.loads(json_dumps(result))
    return result

def get_messages(auth_header):
    """Get all contact messages (admin only)"""
    print(f"Checking admin status with auth header: {auth_header[:20]}... (truncated)")
    admin_status = is_admin(auth_header)
    print(f"Admin status: {admin_status}")
    
    if not admin_status:
        print("Unauthorized: Not an admin user")
        return {"error": "Unauthorized access"}
    
    print("Admin authorized, fetching all contact messages")
    result = get_all_contact_messages()
    
    # Print result for debugging
    print(f"Fetch messages result: {result}")
    
    # Use custom JSON encoder for Decimal values and convert all Decimal to float
    if isinstance(result, dict) and 'messages' in result:
        return json.loads(json_dumps(result))
    return result

def update_message(auth_header, message_id, data):
    """Update the status of a message (admin only)"""
    if not is_admin(auth_header):
        return {"error": "Unauthorized access"}
    
    status = data.get('status')
    if not status or status not in ['new', 'read', 'replied']:
        return {"error": "Invalid status value"}
    
    result = update_message_status(message_id, status)
    
    # Convert any Decimal values to float
    if isinstance(result, dict):
        return json.loads(json_dumps(result))
    return result

# WhatsApp message handling would need additional server-side code
# This would typically involve setting up a webhook to receive messages from WhatsApp API
# and then responding to them programmatically
def handle_whatsapp_message(data):
    """Handle incoming WhatsApp message"""
    # This function would be called by a webhook receiver for WhatsApp
    # For now, it's a placeholder for future implementation
    return {"success": True, "message": "WhatsApp message received"}
