
from database import get_db_connection, dict_from_row
from auth import verify_token

def get_all_artworks():
    """Get all artworks from the database"""
    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}
    
    cursor = connection.cursor()
    
    try:
        query = """
        SELECT id, title, artist, description, price, image_url, 
               dimensions, medium, year, status
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
            artworks.append(artwork)
        
        return {"artworks": artworks}
    except Exception as e:
        print(f"Error getting artworks: {e}")
        return {"error": str(e)}
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def get_artwork(artwork_id):
    """Get a specific artwork by ID"""
    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}
    
    cursor = connection.cursor()
    
    try:
        query = """
        SELECT id, title, artist, description, price, image_url, 
               dimensions, medium, year, status
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
        
        return artwork
    except Exception as e:
        print(f"Error getting artwork: {e}")
        return {"error": str(e)}
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def create_artwork(auth_header, artwork_data):
    """Create a new artwork (admin only)"""
    if not auth_header:
        return {"error": "Authentication required"}
    
    # Extract token from header
    token = auth_header.split(" ")[1] if len(auth_header.split(" ")) > 1 else None
    if not token:
        return {"error": "Invalid authentication token"}
    
    # Verify token and check if user is admin
    payload = verify_token(token)
    if "error" in payload or not payload.get("is_admin", False):
        return {"error": "Unauthorized access"}
    
    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}
    
    cursor = connection.cursor()
    
    try:
        query = """
        INSERT INTO artworks (title, artist, description, price, image_url,
                           dimensions, medium, year, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            artwork_data.get("title"),
            artwork_data.get("artist"),
            artwork_data.get("description"),
            artwork_data.get("price"),
            artwork_data.get("imageUrl"),
            artwork_data.get("dimensions"),
            artwork_data.get("medium"),
            artwork_data.get("year"),
            artwork_data.get("status", "available")
        ))
        connection.commit()
        
        # Return the newly created artwork
        new_artwork_id = cursor.lastrowid
        return get_artwork(new_artwork_id)
    except Exception as e:
        print(f"Error creating artwork: {e}")
        return {"error": str(e)}
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def update_artwork(auth_header, artwork_id, artwork_data):
    """Update an existing artwork (admin only)"""
    if not auth_header:
        return {"error": "Authentication required"}
    
    # Extract token from header
    token = auth_header.split(" ")[1] if len(auth_header.split(" ")) > 1 else None
    if not token:
        return {"error": "Invalid authentication token"}
    
    # Verify token and check if user is admin
    payload = verify_token(token)
    if "error" in payload or not payload.get("is_admin", False):
        return {"error": "Unauthorized access"}
    
    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}
    
    cursor = connection.cursor()
    
    try:
        query = """
        UPDATE artworks
        SET title = %s, artist = %s, description = %s, price = %s,
            image_url = %s, dimensions = %s, medium = %s, year = %s, status = %s
        WHERE id = %s
        """
        cursor.execute(query, (
            artwork_data.get("title"),
            artwork_data.get("artist"),
            artwork_data.get("description"),
            artwork_data.get("price"),
            artwork_data.get("imageUrl"),
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
        return get_artwork(artwork_id)
    except Exception as e:
        print(f"Error updating artwork: {e}")
        return {"error": str(e)}
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def delete_artwork(auth_header, artwork_id):
    """Delete an artwork (admin only)"""
    if not auth_header:
        return {"error": "Authentication required"}
    
    # Extract token from header
    token = auth_header.split(" ")[1] if len(auth_header.split(" ")) > 1 else None
    if not token:
        return {"error": "Invalid authentication token"}
    
    # Verify token and check if user is admin
    payload = verify_token(token)
    if "error" in payload or not payload.get("is_admin", False):
        return {"error": "Unauthorized access"}
    
    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}
    
    cursor = connection.cursor()
    
    try:
        query = "DELETE FROM artworks WHERE id = %s"
        cursor.execute(query, (artwork_id,))
        connection.commit()
        
        # Check if artwork was found and deleted
        if cursor.rowcount == 0:
            return {"error": "Artwork not found"}
        
        return {"success": True, "message": "Artwork deleted successfully"}
    except Exception as e:
        print(f"Error deleting artwork: {e}")
        return {"error": str(e)}
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
