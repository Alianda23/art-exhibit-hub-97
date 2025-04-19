
from db_setup import get_db_connection, dict_from_row
from mysql.connector import Error
import uuid

def create_order(user_id, order_type, item_id, amount, checkout_request_id=None, merchant_request_id=None):
    """Create a new order in the database"""
    connection = get_db_connection()
    if not connection:
        return None

    try:
        cursor = connection.cursor()
        
        query = """
        INSERT INTO orders (user_id, order_type, item_id, amount, checkout_request_id, merchant_request_id)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (user_id, order_type, item_id, amount, checkout_request_id, merchant_request_id))
        connection.commit()
        
        return cursor.lastrowid
    except Error as e:
        print(f"Error creating order: {e}")
        return None
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def generate_ticket_code():
    """Generate a unique ticket code"""
    return str(uuid.uuid4())[:8].upper()

def create_ticket(order_id, user_id, exhibition_id, slots):
    """Create a new ticket in the database"""
    connection = get_db_connection()
    if not connection:
        return None

    try:
        cursor = connection.cursor()
        
        ticket_code = generate_ticket_code()
        
        query = """
        INSERT INTO tickets (order_id, user_id, exhibition_id, ticket_code, slots)
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (order_id, user_id, exhibition_id, ticket_code, slots))
        connection.commit()
        
        return cursor.lastrowid
    except Error as e:
        print(f"Error creating ticket: {e}")
        return None
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def get_user_orders(user_id):
    """Get all orders for a specific user"""
    connection = get_db_connection()
    if not connection:
        return []

    try:
        cursor = connection.cursor()
        
        query = """
        SELECT o.*, 
               CASE 
                   WHEN o.order_type = 'artwork' THEN a.title 
                   ELSE e.title 
               END as item_title
        FROM orders o
        LEFT JOIN artworks a ON o.order_type = 'artwork' AND o.item_id = a.id
        LEFT JOIN exhibitions e ON o.order_type = 'exhibition' AND o.item_id = e.id
        WHERE o.user_id = %s
        ORDER BY o.created_at DESC
        """
        cursor.execute(query, (user_id,))
        
        orders = []
        for row in cursor.fetchall():
            order = dict_from_row(row, cursor)
            orders.append(order)
        
        return orders
    except Error as e:
        print(f"Error getting user orders: {e}")
        return []
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def get_user_tickets(user_id):
    """Get all tickets for a specific user"""
    connection = get_db_connection()
    if not connection:
        return []

    try:
        cursor = connection.cursor()
        
        query = """
        SELECT t.*, e.title as exhibition_title, e.imageUrl as exhibition_image
        FROM tickets t
        JOIN exhibitions e ON t.exhibition_id = e.id
        WHERE t.user_id = %s
        ORDER BY t.created_at DESC
        """
        cursor.execute(query, (user_id,))
        
        tickets = []
        for row in cursor.fetchall():
            ticket = dict_from_row(row, cursor)
            tickets.append(ticket)
        
        return tickets
    except Error as e:
        print(f"Error getting user tickets: {e}")
        return []
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
