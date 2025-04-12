
import os
import base64
import time
from datetime import datetime
import shutil

# Create the folder structure if it doesn't exist
def ensure_upload_folder_exists():
    """Create the upload folder if it doesn't exist"""
    upload_path = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
    if not os.path.exists(upload_path):
        os.makedirs(upload_path)
    return upload_path

# Function to save a base64 image to a file
def save_base64_image(base64_string, filename=None):
    """Save a base64-encoded image to the uploads folder"""
    try:
        # Ensure upload folder exists
        upload_path = ensure_upload_folder_exists()
        
        # Generate a filename if none is provided
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            filename = f"{timestamp}_image.jpg"
        
        # Handle data URI format
        if ',' in base64_string:
            header, base64_string = base64_string.split(',', 1)
        
        # Convert base64 to binary
        try:
            image_data = base64.b64decode(base64_string)
        except Exception as e:
            print(f"Error decoding base64: {e}")
            return f"/static/uploads/placeholder.jpg"
        
        # Save the image
        file_path = os.path.join(upload_path, filename)
        with open(file_path, 'wb') as f:
            f.write(image_data)
        
        # Return the URL to access the image
        return f"/static/uploads/{filename}"
    except Exception as e:
        print(f"Error saving base64 image: {e}")
        # Create a placeholder.jpg if it doesn't exist
        placeholder_path = os.path.join(upload_path, "placeholder.jpg")
        if not os.path.exists(placeholder_path):
            # Create a simple placeholder
            try:
                with open(placeholder_path, 'wb') as f:
                    f.write(b'')  # Empty file as a placeholder
            except:
                pass  # Silently fail if we can't create the placeholder
        return f"/static/uploads/placeholder.jpg"

# Function to handle uploaded image file
def save_uploaded_image(file_data, filename=None):
    """Save an uploaded image file to the uploads folder"""
    try:
        # Ensure upload folder exists
        upload_path = ensure_upload_folder_exists()
        
        # Generate a filename if none is provided
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            ext = os.path.splitext(file_data.filename)[1]
            filename = f"{timestamp}_image{ext}"
        
        # Save the image
        file_path = os.path.join(upload_path, filename)
        with open(file_path, 'wb') as f:
            f.write(file_data.read())
        
        # Return the URL to access the image
        return f"/static/uploads/{filename}"
    except Exception as e:
        print(f"Error saving uploaded image: {e}")
        return f"/static/uploads/placeholder.jpg"

# Function to get the full server-side path for an image
def get_image_path(image_url):
    """Get the full server-side path for an image URL"""
    if image_url and image_url.startswith('/static/uploads/'):
        filename = image_url.split('/')[-1]
        return os.path.join(ensure_upload_folder_exists(), filename)
    return None
