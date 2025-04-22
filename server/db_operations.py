
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
        # Get artwork orders with artwork title
        query = """
        SELECT ao.id, ao.user_id, u.name as user_name, ao.artwork_id, 
               a.title as item_title, a.image_url as artwork_image_url,
               ao.order_date, ao.total_amount, ao.payment_status
        FROM artwork_orders ao
        JOIN users u ON ao.user_id = u.id
        JOIN artworks a ON ao.artwork_id = a.id
        ORDER BY ao.order_date DESC
        """
        cursor.execute(query)
        
        artwork_orders = []
        for row in cursor.fetchall():
            order = {}
            order['id'] = row[0]
            order['user_id'] = row[1]
            order['user_name'] = row[2]
            order['reference_id'] = row[3]
            order['item_title'] = row[4]
            order['image_url'] = row[5]
            order['date'] = row[6]
            order['amount'] = row[7]
            order['status'] = row[8]
            order['type'] = 'artwork'
            artwork_orders.append(order)
            
        return {"orders": artwork_orders}
    except Exception as e:
        print(f"Error getting orders: {e}")
        return {"error": str(e)}
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def get_order_details(order_id, order_type):
    """Get details for a specific order"""
    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}
    
    cursor = connection.cursor()
    
    try:
        if order_type == 'artwork':
            # Get artwork order details
            query = """
            SELECT ao.id, ao.user_id, u.name as user_name, u.email as user_email, 
                   u.phone as user_phone, ao.artwork_id, a.title as artwork_title, 
                   a.artist, a.image_url as artwork_image, a.price, a.dimensions,
                   a.medium, a.year, ao.order_date, ao.total_amount, 
                   ao.payment_status, ao.delivery_address
            FROM artwork_orders ao
            JOIN users u ON ao.user_id = u.id
            JOIN artworks a ON ao.artwork_id = a.id
            WHERE ao.id = %s
            """
            cursor.execute(query, (order_id,))
            row = cursor.fetchone()
            
            if not row:
                return {"error": "Order not found"}
            
            order = {
                "id": row[0],
                "user_id": row[1],
                "user_name": row[2],
                "user_email": row[3],
                "user_phone": row[4],
                "artwork_id": row[5],
                "artwork_title": row[6],
                "artist": row[7],
                "artwork_image": row[8],
                "price": row[9],
                "dimensions": row[10],
                "medium": row[11],
                "year": row[12],
                "order_date": row[13],
                "total_amount": row[14],
                "payment_status": row[15],
                "delivery_address": row[16],
                "type": "artwork"
            }
            
            return {"order": order}
        
        else:
            return {"error": "Invalid order type"}
    except Exception as e:
        print(f"Error getting order details: {e}")
        return {"error": str(e)}
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def get_all_tickets():
    """Get all tickets from database"""
    # ... keep existing code
    
def get_user_orders(user_id):
    """Get all orders and bookings for a specific user"""
    # ... keep existing code
