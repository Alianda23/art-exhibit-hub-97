
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
        if order_type == 'artwork':
            # Store artwork orders in artwork_orders table
            query = """
            INSERT INTO artwork_orders (user_id, artwork_id, total_amount, payment_status)
            VALUES (%s, %s, %s, %s)
            """
            cursor.execute(query, (user_id, reference_id, amount, 'pending'))
            connection.commit()
            
            order_id = cursor.lastrowid
            return {"success": True, "order_id": order_id}
        
        elif order_type == 'exhibition':
            # Store exhibition orders in exhibition_bookings table
            query = """
            INSERT INTO exhibition_bookings (user_id, exhibition_id, total_amount, payment_status)
            VALUES (%s, %s, %s, %s)
            """
            cursor.execute(query, (user_id, reference_id, amount, 'pending'))
            connection.commit()
            
            order_id = cursor.lastrowid
            return {"success": True, "order_id": order_id}
        
        else:
            return {"error": "Invalid order type"}
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
        # Check if exhibition_bookings table exists before inserting
        cursor.execute("SHOW TABLES LIKE 'exhibition_bookings'")
        if not cursor.fetchone():
            print("Exhibition_bookings table doesn't exist")
            return {"error": "Exhibition bookings table doesn't exist"}
        
        ticket_code = generate_ticket_code()
        
        # Store tickets in exhibition_bookings table
        query = """
        INSERT INTO exhibition_bookings (user_id, exhibition_id, ticket_code, slots, status)
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (user_id, exhibition_id, ticket_code, slots, 'active'))
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
        # Check if artwork_orders table exists before querying
        cursor.execute("SHOW TABLES LIKE 'artwork_orders'")
        if not cursor.fetchone():
            print("Artwork_orders table doesn't exist")
            return {"orders": []}
        
        query = """
        SELECT ao.*, u.name as user_name, a.title as item_title
        FROM artwork_orders ao
        JOIN users u ON ao.user_id = u.id
        JOIN artworks a ON ao.artwork_id = a.id
        ORDER BY ao.order_date DESC
        """
        cursor.execute(query)
        artwork_orders = [dict(zip([col[0] for col in cursor.description], row)) for row in cursor.fetchall()]
        
        for order in artwork_orders:
            order['type'] = 'artwork'
            order['reference_id'] = order['artwork_id']
            
        return {"orders": artwork_orders}
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
        # Check if exhibition_bookings table exists before querying
        cursor.execute("SHOW TABLES LIKE 'exhibition_bookings'")
        if not cursor.fetchone():
            print("Exhibition_bookings table doesn't exist")
            return {"tickets": []}
        
        query = """
        SELECT eb.*, u.name as user_name, e.title as exhibition_title, e.image_url as exhibition_image_url
        FROM exhibition_bookings eb
        JOIN users u ON eb.user_id = u.id
        JOIN exhibitions e ON eb.exhibition_id = e.id
        ORDER BY eb.booking_date DESC
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
