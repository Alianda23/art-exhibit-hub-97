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
            # Generate a ticket code for the exhibition booking
            ticket_code = generate_ticket_code()
            
            # Store exhibition orders in exhibition_bookings table
            query = """
            INSERT INTO exhibition_bookings (user_id, exhibition_id, total_amount, payment_status, ticket_code, slots, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (user_id, reference_id, amount, 'pending', ticket_code, 1, 'active'))
            connection.commit()
            
            order_id = cursor.lastrowid
            return {"success": True, "order_id": order_id, "ticket_code": ticket_code}
        
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
        # Generate ticket code
        ticket_code = generate_ticket_code()
        
        # Store tickets in exhibition_bookings table with the ticket_code field
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
        # Get artwork orders
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
        # Get exhibition bookings
        query = """
        SELECT eb.id, eb.user_id, u.name as user_name, eb.exhibition_id, 
               e.title as exhibition_title, e.image_url as exhibition_image_url,
               eb.booking_date, eb.ticket_code, eb.slots, eb.status,
               eb.total_amount, eb.payment_status
        FROM exhibition_bookings eb
        JOIN users u ON eb.user_id = u.id
        JOIN exhibitions e ON eb.exhibition_id = e.id
        ORDER BY eb.booking_date DESC
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        
        tickets = []
        for row in cursor.fetchall():
            ticket = dict(zip([col[0] for col in cursor.description], row))
            tickets.append(ticket)
            
        return {"tickets": tickets}
    except Exception as e:
        print(f"Error getting tickets: {e}")
        return {"error": str(e)}
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def get_user_orders(user_id):
    """Get all orders and bookings for a specific user"""
    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}
    
    cursor = connection.cursor()
    
    try:
        # Get user's artwork orders
        artwork_query = """
        SELECT ao.id, ao.artwork_id, a.title as artworkTitle, a.artist, a.image_url,
               ao.order_date as date, a.price, 0 as deliveryFee, 
               ao.total_amount as totalAmount, 
               ao.payment_status as status, ao.delivery_address as deliveryAddress
        FROM artwork_orders ao
        JOIN artworks a ON ao.artwork_id = a.id
        WHERE ao.user_id = %s
        ORDER BY ao.order_date DESC
        """
        cursor.execute(artwork_query, (user_id,))
        orders = [dict(zip([col[0] for col in cursor.description], row)) for row in cursor.fetchall()]
        
        # Get user's exhibition bookings
        booking_query = """
        SELECT eb.id, eb.exhibition_id as exhibitionId, e.title as exhibitionTitle,
               eb.booking_date as date, e.location, eb.slots, eb.ticket_code,
               eb.total_amount as totalAmount, eb.status, e.image_url
        FROM exhibition_bookings eb
        JOIN exhibitions e ON eb.exhibition_id = e.id
        WHERE eb.user_id = %s
        ORDER BY eb.booking_date DESC
        """
        cursor.execute(booking_query, (user_id,))
        bookings = [dict(zip([col[0] for col in cursor.description], row)) for row in cursor.fetchall()]
        
        return {"orders": orders, "bookings": bookings}
    except Exception as e:
        print(f"Error getting user orders: {e}")
        return {"error": str(e)}
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
