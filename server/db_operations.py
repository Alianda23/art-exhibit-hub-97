
from database import get_db_connection
from decimal import Decimal
import random
import string

def generate_ticket_code():
    """Generate a unique ticket code"""
    prefix = 'TKT'
    random_chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"{prefix}-{random_chars}"

def create_order(user_id, order_type, reference_id, amount):
    """Create a new order in the database"""
    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}
    
    cursor = connection.cursor()
    
    try:
        query = """
        INSERT INTO orders (user_id, type, reference_id, amount)
        VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query, (user_id, order_type, reference_id, amount))
        connection.commit()
        
        order_id = cursor.lastrowid
        return {"success": True, "order_id": order_id}
    except Exception as e:
        print(f"Error creating order: {e}")
        return {"error": str(e)}
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def create_ticket(user_id, exhibition_id, slots):
    """Create a new ticket in the database"""
    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}
    
    cursor = connection.cursor()
    
    try:
        ticket_code = generate_ticket_code()
        query = """
        INSERT INTO tickets (user_id, exhibition_id, ticket_code, slots)
        VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query, (user_id, exhibition_id, ticket_code, slots))
        connection.commit()
        
        ticket_id = cursor.lastrowid
        return {"success": True, "ticket_id": ticket_id, "ticket_code": ticket_code}
    except Exception as e:
        print(f"Error creating ticket: {e}")
        return {"error": str(e)}
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def get_all_orders():
    """Get all orders from database"""
    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}
    
    cursor = connection.cursor()
    
    try:
        query = """
        SELECT o.*, u.name as user_name,
               CASE 
                   WHEN o.type = 'artwork' THEN a.title
                   WHEN o.type = 'exhibition' THEN e.title
               END as item_title
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN artworks a ON o.type = 'artwork' AND o.reference_id = a.id
        LEFT JOIN exhibitions e ON o.type = 'exhibition' AND o.reference_id = e.id
        ORDER BY o.created_at DESC
        """
        cursor.execute(query)
        orders = [dict(zip([col[0] for col in cursor.description], row)) for row in cursor.fetchall()]
        return {"orders": orders}
    except Exception as e:
        print(f"Error getting orders: {e}")
        return {"error": str(e)}
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def get_all_tickets():
    """Get all tickets from database"""
    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}
    
    cursor = connection.cursor()
    
    try:
        query = """
        SELECT t.*, u.name as user_name, e.title as exhibition_title
        FROM tickets t
        JOIN users u ON t.user_id = u.id
        JOIN exhibitions e ON t.exhibition_id = e.id
        ORDER BY t.booking_date DESC
        """
        cursor.execute(query)
        tickets = [dict(zip([col[0] for col in cursor.description], row)) for row in cursor.fetchall()]
        return {"tickets": tickets}
    except Exception as e:
        print(f"Error getting tickets: {e}")
        return {"error": str(e)}
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
