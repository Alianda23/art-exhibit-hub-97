
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
            return create_placeholder(upload_path)
        
        # Save the image
        file_path = os.path.join(upload_path, filename)
        with open(file_path, 'wb') as f:
            f.write(image_data)
        
        # Return the URL to access the image
        return f"/static/uploads/{filename}"
    except Exception as e:
        print(f"Error saving base64 image: {e}")
        return create_placeholder(upload_path)

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
        return create_placeholder(upload_path)

# Create a simple placeholder image if needed
def create_placeholder(upload_path):
    """Create a placeholder image if it doesn't exist"""
    placeholder_path = os.path.join(upload_path, "placeholder.jpg")
    
    # Only create if it doesn't exist
    if not os.path.exists(placeholder_path):
        try:
            # Create a very simple placeholder
            with open(placeholder_path, 'wb') as f:
                # This is a minimal valid JPEG file (blank white)
                f.write(bytes.fromhex('FFD8FFE000104A46494600010101006000600000FFDB004300080606070605080707070909080A0C140D0C0B0B0C1912130F141D1A1F1E1D1A1C1C20242E2720222C231C1C2837292C30313434341F27393D38323C2E333432FFDB0043010909090C0B0C180D0D1832211C213232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232FFC0001108000800010301220002110103110111FFC4001F0000010501010101010100000000000000000102030405060708090A0BFFC400B5100002010303020403050504040000017D01020300041105122131410613516107227114328191A1082342B1C11552D1F02433627282090A161718191A25262728292A3435363738393A434445464748494A535455565758595A636465666768696A737475767778797A838485868788898A92939495969798999AA2A3A4A5A6A7A8A9AAB2B3B4B5B6B7B8B9BAC2C3C4C5C6C7C8C9CAD2D3D4D5D6D7D8D9DAE1E2E3E4E5E6E7E8E9EAF1F2F3F4F5F6F7F8F9FAFFC4001F0100030101010101010101010000000000000102030405060708090A0BFFC400B51100020102040403040705040400010277000102031104052131061241510761711322328108144291A1B1C109233352F0156272D10A162434E125F11718191A262728292A35363738393A434445464748494A535455565758595A636465666768696A737475767778797A82838485868788898A92939495969798999AA2A3A4A5A6A7A8A9AAB2B3B4B5B6B7B8B9BAC2C3C4C5C6C7C8C9CAD2D3D4D5D6D7D8D9DAE2E3E4E5E6E7E8E9EAF2F3F4F5F6F7F8F9FAFFDA000C03010002110311003F00FFFFFF09FFDA000C03010002110311003F00FFFFFF09FFDA000C03010002110311003F00FFFFFF09FFDA000C03010002110311003F00FFFFFF09FFDA000C03010002110311003F00FFFFFF09FFDA000C03010002110311003F00FFFFFF09FFDA000C03010002110311003F00FFFFFF09FFDA000C03010002110311003F00FFFFFF09FFDA000C03010002110311003F00FFFFFF09FFDA000C03010002110311003F00FFFFFF09FFDA000C03010002110311003F00FFFFFF09FFDA000C03010002110311003F00FFFFFF09FFDA000C03010002110311003F00FFFFFF09FFDA000C03010002110311003F00FFFFFF09FFD9'))
        except Exception as e:
            print(f"Error creating placeholder: {e}")
    
    return f"/static/uploads/placeholder.jpg"

# Function to get the full server-side path for an image
def get_image_path(image_url):
    """Get the full server-side path for an image URL"""
    if image_url and image_url.startswith('/static/uploads/'):
        filename = image_url.split('/')[-1]
        return os.path.join(ensure_upload_folder_exists(), filename)
    return None
