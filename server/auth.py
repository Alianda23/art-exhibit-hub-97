
import hashlib
import secrets
from database import get_db_connection
import jwt
import datetime

# Secret key for JWT token generation - replace with a secure random string
SECRET_KEY = "your_secret_key_replace_this_with_a_secure_random_string"

def hash_password(password):
    """Hash a password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def register_user(name, email, password, phone):
    """Register a new user"""
    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}
    
    cursor = connection.cursor()
    hashed_password = hash_password(password)
    
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

def login_user(email, password):
    """Login a user"""
    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}
    
    cursor = connection.cursor()
    hashed_password = hash_password(password)
    
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

def login_admin(email, password):
    """Login an admin"""
    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}
    
    cursor = connection.cursor()
    hashed_password = hash_password(password)
    
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

def generate_token(user_id, name, is_admin):
    """Generate a JWT token for authentication"""
    payload = {
        "sub": user_id,
        "name": name,
        "is_admin": is_admin,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

def verify_token(token):
    """Verify a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return {"error": "Token expired"}
    except jwt.InvalidTokenError:
        return {"error": "Invalid token"}

def create_admin(name, email, password):
    """Create a new admin (called from terminal/script)"""
    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}
    
    cursor = connection.cursor()
    hashed_password = hash_password(password)
    
    try:
        # Check if email already exists
        cursor.execute("SELECT id FROM admins WHERE email = %s", (email,))
        if cursor.fetchone():
            return {"error": "Admin email already exists"}
        
        # Insert the new admin
        query = """
        INSERT INTO admins (name, email, password)
        VALUES (%s, %s, %s)
        """
        cursor.execute(query, (name, email, hashed_password))
        connection.commit()
        
        return {
            "success": True,
            "admin_id": cursor.lastrowid,
            "name": name
        }
    except Exception as e:
        print(f"Error creating admin: {e}")
        return {"error": str(e)}
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
