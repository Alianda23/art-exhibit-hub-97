
from database import get_db_connection, dict_from_row
from auth import verify_token

def get_all_exhibitions():
    """Get all exhibitions from the database"""
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
            
            # Convert ticket_price to camelCase
            exhibition['ticketPrice'] = exhibition.pop('ticket_price')
            
            # Convert image_url to camelCase
            exhibition['imageUrl'] = exhibition.pop('image_url')
            
            # Convert total_slots and available_slots to camelCase
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

def get_exhibition(exhibition_id):
    """Get a specific exhibition by ID"""
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
        
        # Convert ticket_price to camelCase
        exhibition['ticketPrice'] = exhibition.pop('ticket_price')
        
        # Convert image_url to camelCase
        exhibition['imageUrl'] = exhibition.pop('image_url')
        
        # Convert total_slots and available_slots to camelCase
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

def create_exhibition(auth_header, exhibition_data):
    """Create a new exhibition (admin only)"""
    # Debug input
    print(f"Create exhibition called with auth_header: {auth_header}")
    print(f"Exhibition data: {exhibition_data}")
    
    if not auth_header:
        print("Error: No authentication header provided")
        return {"error": "Authentication required"}
    
    # Extract token from header
    token = None
    if auth_header.startswith('Bearer '):
        token = auth_header[7:]
    else:
        token = auth_header.split(" ")[1] if len(auth_header.split(" ")) > 1 else None
        
    if not token:
        print("Error: Invalid authentication token format")
        return {"error": "Invalid authentication token"}
    
    # Debug token verification
    print(f"Verifying token for create_exhibition: {token}")
    
    # Verify token and check if user is admin
    payload = verify_token(token)
    print(f"Token verification result: {payload}")
    
    if isinstance(payload, dict) and "error" in payload:
        print(f"Token verification error: {payload['error']}")
        return payload
    
    # Check if user is admin
    if not payload.get("is_admin", False):
        print(f"Admin check failed. Payload: {payload}")
        return {"error": "Unauthorized access: Not an admin"}
    
    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}
    
    cursor = connection.cursor()
    
    try:
        print(f"Inserting exhibition data: {exhibition_data}")
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
        return get_exhibition(new_exhibition_id)
    except Exception as e:
        print(f"Error creating exhibition: {e}")
        return {"error": str(e)}
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def update_exhibition(auth_header, exhibition_id, exhibition_data):
    """Update an existing exhibition (admin only)"""
    # Debug input
    print(f"Update exhibition called with auth_header: {auth_header}")
    print(f"Exhibition ID: {exhibition_id}")
    print(f"Exhibition data: {exhibition_data}")
    
    if not auth_header:
        print("Error: No authentication header provided")
        return {"error": "Authentication required"}
    
    # Extract token from header
    token = None
    if auth_header.startswith('Bearer '):
        token = auth_header[7:]
    else:
        token = auth_header.split(" ")[1] if len(auth_header.split(" ")) > 1 else None
        
    if not token:
        print("Error: Invalid authentication token format")
        return {"error": "Invalid authentication token"}
    
    # Debug token verification
    print(f"Verifying token for update_exhibition: {token}")
    
    # Verify token and check if user is admin
    payload = verify_token(token)
    print(f"Token verification result: {payload}")
    
    if isinstance(payload, dict) and "error" in payload:
        print(f"Token verification error: {payload['error']}")
        return payload
    
    # Check if user is admin
    if not payload.get("is_admin", False):
        print(f"Admin check failed. Payload: {payload}")
        return {"error": "Unauthorized access: Not an admin"}
    
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
        return get_exhibition(exhibition_id)
    except Exception as e:
        print(f"Error updating exhibition: {e}")
        return {"error": str(e)}
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def delete_exhibition(auth_header, exhibition_id):
    """Delete an exhibition (admin only)"""
    # Debug input
    print(f"Delete exhibition called with auth_header: {auth_header}")
    print(f"Exhibition ID: {exhibition_id}")
    
    if not auth_header:
        print("Error: No authentication header provided")
        return {"error": "Authentication required"}
    
    # Extract token from header
    token = None
    if auth_header.startswith('Bearer '):
        token = auth_header[7:]
    else:
        token = auth_header.split(" ")[1] if len(auth_header.split(" ")) > 1 else None
        
    if not token:
        print("Error: Invalid authentication token format")
        return {"error": "Invalid authentication token"}
    
    # Debug token verification
    print(f"Verifying token for delete_exhibition: {token}")
    
    # Verify token and check if user is admin
    payload = verify_token(token)
    print(f"Token verification result: {payload}")
    
    if isinstance(payload, dict) and "error" in payload:
        print(f"Token verification error: {payload['error']}")
        return payload
    
    # Check if user is admin
    if not payload.get("is_admin", False):
        print(f"Admin check failed. Payload: {payload}")
        return {"error": "Unauthorized access: Not an admin"}
    
    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}
    
    cursor = connection.cursor()
    
    try:
        query = "DELETE FROM exhibitions WHERE id = %s"
        cursor.execute(query, (exhibition_id,))
        connection.commit()
        
        # Check if exhibition was found and deleted
        if cursor.rowcount == 0:
            return {"error": "Exhibition not found"}
        
        return {"success": True, "message": "Exhibition deleted successfully"}
    except Exception as e:
        print(f"Error deleting exhibition: {e}")
        return {"error": str(e)}
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
