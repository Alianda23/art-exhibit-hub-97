
from database import save_contact_message, get_all_contact_messages, update_message_status
import json
import jwt
import os

# Get the secret key from environment or use a default (in production, always use environment variables)
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'afriart_default_secret_key')

def is_admin(auth_header):
    """Verify if the request is from an admin"""
    if not auth_header or not auth_header.startswith('Bearer '):
        return False
    
    token = auth_header.split(' ')[1]
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return 'admin_id' in payload
    except jwt.PyJWTError:
        return False

def create_contact_message(data):
    """Create a new contact message"""
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone', '')
    message = data.get('message')
    
    # Support for chat messages
    source = data.get('source', 'contact_form')  # New field to track where messages come from
    
    # Validate required fields
    if not name or not email or not message:
        return {"error": "Missing required fields"}
    
    # Save the message
    result = save_contact_message(name, email, phone, message, source)
    
    return result

def get_messages(auth_header):
    """Get all contact messages (admin only)"""
    if not is_admin(auth_header):
        return {"error": "Unauthorized access"}
    
    result = get_all_contact_messages()
    
    return result

def update_message(auth_header, message_id, data):
    """Update the status of a message (admin only)"""
    if not is_admin(auth_header):
        return {"error": "Unauthorized access"}
    
    status = data.get('status')
    if not status or status not in ['new', 'read', 'replied']:
        return {"error": "Invalid status value"}
    
    result = update_message_status(message_id, status)
    
    return result

# WhatsApp message handling would need additional server-side code
# This would typically involve setting up a webhook to receive messages from WhatsApp API
# and then responding to them programmatically
def handle_whatsapp_message(data):
    """Handle incoming WhatsApp message"""
    # This function would be called by a webhook receiver for WhatsApp
    # For now, it's a placeholder for future implementation
    return {"success": True, "message": "WhatsApp message received"}
