
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
            create_placeholder_image()
            return f"/static/uploads/placeholder.jpg"
        
        # Save the image
        file_path = os.path.join(upload_path, filename)
        with open(file_path, 'wb') as f:
            f.write(image_data)
        
        # Return the URL to access the image
        return f"/static/uploads/{filename}"
    except Exception as e:
        print(f"Error saving base64 image: {e}")
        create_placeholder_image()
        return f"/static/uploads/placeholder.jpg"

# Function to create a placeholder image if needed
def create_placeholder_image():
    """Create a placeholder image if it doesn't exist"""
    upload_path = ensure_upload_folder_exists()
    placeholder_path = os.path.join(upload_path, "placeholder.jpg")
    if not os.path.exists(placeholder_path):
        try:
            # Create an actual blank image file instead of empty file
            with open(placeholder_path, 'wb') as f:
                # Write minimal blank JPEG content
                f.write(b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xdb\x00C\x01\t\t\t\x0c\x0b\x0c\x18\r\r\x182!\x1c!22222222222222222222222222222222222222222222222222\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x03\x01"\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05\x04\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A\x06\x13Qa\x07"q\x142\x81\x91\xa1\x08#B\xb1\xc1\x15R\xd1\xf0$3br\x82\t\n\x16\x17\x18\x19\x1a%&\'()*456789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xc4\x00\x1f\x01\x00\x03\x01\x01\x01\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x11\x00\x02\x01\x02\x04\x04\x03\x04\x07\x05\x04\x04\x00\x01\x02w\x00\x01\x02\x03\x11\x04\x05!1\x06\x12AQ\x07aq\x13"2\x81\x08\x14B\x91\xa1\xb1\xc1\t#3R\xf0\x15br\xd1\n\x16$4\xe1%\xf1\x17\x18\x19\x1a&\'()*56789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00?\x00\xfe\xfe(\xa2\x8a\x00\xff\xd9')
        except Exception as e:
            print(f"Error creating placeholder image: {e}")

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
        create_placeholder_image()
        return f"/static/uploads/placeholder.jpg"

# Function to get the full server-side path for an image
def get_image_path(image_url):
    """Get the full server-side path for an image URL"""
    if image_url and image_url.startswith('/static/uploads/'):
        filename = image_url.split('/')[-1]
        return os.path.join(ensure_upload_folder_exists(), filename)
    return None
