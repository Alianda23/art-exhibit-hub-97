
import json
import uuid
import datetime
from database import get_db_connection
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import os

# M-Pesa API simulation functions
def handle_stk_push_request(data):
    """Simulate M-Pesa STK push request"""
    try:
        # Extract data
        amount = data.get('amount')
        phone = data.get('phone')
        type = data.get('type')  # 'artwork' or 'exhibition'
        item_id = data.get('itemId')
        user_id = data.get('userId')
        
        if not all([amount, phone, type, item_id, user_id]):
            return {"error": "Missing required fields"}
        
        # Generate a checkout request ID
        checkout_request_id = str(uuid.uuid4())
        
        # In a real system, this would make an API call to M-Pesa
        # For our simulation, we'll just store the pending transaction
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        try:
            # Store transaction details
            query = """
            INSERT INTO mpesa_transactions
            (checkout_request_id, phone, amount, type, item_id, user_id, status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (
                checkout_request_id,
                phone,
                amount,
                type,
                item_id,
                user_id,
                'pending',
                datetime.datetime.now()
            ))
            connection.commit()
            
            return {
                "success": True,
                "checkoutRequestId": checkout_request_id,
                "message": "STK push request sent successfully"
            }
        except Exception as e:
            print(f"Error handling STK push: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    except Exception as e:
        print(f"Error in STK push: {e}")
        return {"error": str(e)}

def handle_mpesa_callback(data):
    """Simulate M-Pesa callback"""
    try:
        # Extract data
        checkout_request_id = data.get('checkoutRequestId')
        payment_status = data.get('status')  # 'success' or 'failed'
        
        if not all([checkout_request_id, payment_status]):
            return {"error": "Missing required fields"}
        
        # Get the transaction details
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        try:
            # Update transaction status
            query = """
            UPDATE mpesa_transactions
            SET status = %s, updated_at = %s
            WHERE checkout_request_id = %s
            """
            cursor.execute(query, (
                payment_status,
                datetime.datetime.now(),
                checkout_request_id
            ))
            
            # If payment is successful, create order or booking
            if payment_status == 'success':
                # Get transaction details
                query = """
                SELECT type, item_id, user_id, amount, phone
                FROM mpesa_transactions
                WHERE checkout_request_id = %s
                """
                cursor.execute(query, (checkout_request_id,))
                result = cursor.fetchone()
                
                if result:
                    type = result[0]
                    item_id = result[1]
                    user_id = result[2]
                    amount = result[3]
                    phone = result[4]
                    
                    # Get user details
                    query = """
                    SELECT name, email
                    FROM users
                    WHERE id = %s
                    """
                    cursor.execute(query, (user_id,))
                    user_result = cursor.fetchone()
                    
                    if user_result:
                        user_name = user_result[0]
                        user_email = user_result[1]
                        
                        if type == 'artwork':
                            # Create artwork order
                            query = """
                            INSERT INTO artwork_orders
                            (user_id, artwork_id, name, email, phone, delivery_address, 
                             payment_method, payment_status, mpesa_transaction_id, total_amount)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            """
                            
                            # Get additional order details from pending_order table
                            delivery_address_query = """
                            SELECT delivery_address
                            FROM pending_orders
                            WHERE user_id = %s AND type = 'artwork' AND item_id = %s
                            ORDER BY created_at DESC
                            LIMIT 1
                            """
                            cursor.execute(delivery_address_query, (user_id, item_id))
                            pending_result = cursor.fetchone()
                            delivery_address = pending_result[0] if pending_result else "Not provided"
                            
                            cursor.execute(query, (
                                user_id,
                                item_id,
                                user_name,
                                user_email,
                                phone,
                                delivery_address,
                                'mpesa',
                                'completed',
                                checkout_request_id,
                                amount
                            ))
                            
                            # Update artwork status to sold
                            query = """
                            UPDATE artworks
                            SET status = 'sold'
                            WHERE id = %s
                            """
                            cursor.execute(query, (item_id,))
                        
                        elif type == 'exhibition':
                            # Create exhibition booking
                            query = """
                            INSERT INTO exhibition_bookings
                            (user_id, exhibition_id, name, email, phone, slots, 
                             payment_method, payment_status, mpesa_transaction_id, total_amount)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            """
                            
                            # Get slot count from pending_order table
                            slots_query = """
                            SELECT slots
                            FROM pending_orders
                            WHERE user_id = %s AND type = 'exhibition' AND item_id = %s
                            ORDER BY created_at DESC
                            LIMIT 1
                            """
                            cursor.execute(slots_query, (user_id, item_id))
                            pending_result = cursor.fetchone()
                            slots = pending_result[0] if pending_result else 1
                            
                            cursor.execute(query, (
                                user_id,
                                item_id,
                                user_name,
                                user_email,
                                phone,
                                slots,
                                'mpesa',
                                'completed',
                                checkout_request_id,
                                amount
                            ))
                            
                            # Update exhibition available slots
                            query = """
                            UPDATE exhibitions
                            SET available_slots = available_slots - %s
                            WHERE id = %s
                            """
                            cursor.execute(query, (slots, item_id))
                            
                            # Get booking ID for ticket generation
                            booking_id_query = """
                            SELECT id FROM exhibition_bookings
                            WHERE mpesa_transaction_id = %s
                            """
                            cursor.execute(booking_id_query, (checkout_request_id,))
                            booking_result = cursor.fetchone()
                            
                            if booking_result:
                                booking_id = booking_result[0]
                                
                                # Get exhibition details
                                exhibition_query = """
                                SELECT title, location, start_date, end_date
                                FROM exhibitions
                                WHERE id = %s
                                """
                                cursor.execute(exhibition_query, (item_id,))
                                exhibition_result = cursor.fetchone()
                                
                                if exhibition_result:
                                    exhibition_title = exhibition_result[0]
                                    exhibition_location = exhibition_result[1]
                                    exhibition_start_date = exhibition_result[2]
                                    exhibition_end_date = exhibition_result[3]
                                    
                                    # Generate ticket URL
                                    ticket_id = f"TKT-{booking_id}-{uuid.uuid4().hex[:8]}"
                                    ticket_url = f"/tickets/{ticket_id}.pdf"
                                    
                                    # Update booking with ticket ID
                                    query = """
                                    UPDATE exhibition_bookings
                                    SET ticket_id = %s
                                    WHERE id = %s
                                    """
                                    cursor.execute(query, (ticket_id, booking_id))
                                    
                                    # Send email with ticket
                                    send_ticket_email(
                                        user_email,
                                        user_name,
                                        exhibition_title,
                                        exhibition_location,
                                        exhibition_start_date,
                                        exhibition_end_date,
                                        slots,
                                        ticket_id,
                                        booking_id
                                    )
            
            connection.commit()
            
            return {
                "success": True,
                "message": "Callback processed successfully"
            }
        except Exception as e:
            print(f"Error handling callback: {e}")
            return {"error": str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    except Exception as e:
        print(f"Error in callback: {e}")
        return {"error": str(e)}

def check_transaction_status(checkout_request_id):
    """Check the status of a transaction"""
    try:
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        query = """
        SELECT status
        FROM mpesa_transactions
        WHERE checkout_request_id = %s
        """
        cursor.execute(query, (checkout_request_id,))
        result = cursor.fetchone()
        
        if not result:
            return {"error": "Transaction not found"}
        
        status = result[0]
        
        # For simulation purposes, we'll randomly complete pending transactions
        if status == 'pending':
            import random
            if random.random() > 0.3:  # 70% chance of success
                # Update to success
                update_query = """
                UPDATE mpesa_transactions
                SET status = 'success', updated_at = %s
                WHERE checkout_request_id = %s
                """
                cursor.execute(update_query, (datetime.datetime.now(), checkout_request_id))
                connection.commit()
                
                # Process the successful payment (create order/booking)
                handle_mpesa_callback({"checkoutRequestId": checkout_request_id, "status": "success"})
                
                status = 'success'
        
        return {
            "status": status,
            "checkoutRequestId": checkout_request_id
        }
    except Exception as e:
        print(f"Error checking transaction status: {e}")
        return {"error": str(e)}
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def generate_exhibition_ticket(booking_id):
    """Generate a ticket for an exhibition booking"""
    try:
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        # Get booking details
        query = """
        SELECT eb.id, eb.name, eb.email, eb.phone, eb.slots, eb.ticket_id,
               e.title, e.location, e.start_date, e.end_date
        FROM exhibition_bookings eb
        JOIN exhibitions e ON eb.exhibition_id = e.id
        WHERE eb.id = %s
        """
        cursor.execute(query, (booking_id,))
        result = cursor.fetchone()
        
        if not result:
            return {"error": "Booking not found"}
        
        booking = {
            "id": result[0],
            "name": result[1],
            "email": result[2],
            "phone": result[3],
            "slots": result[4],
            "ticketId": result[5],
            "exhibitionTitle": result[6],
            "location": result[7],
            "startDate": result[8].isoformat(),
            "endDate": result[9].isoformat()
        }
        
        # Generate a ticket URL (in a real system, this would generate a PDF)
        if not booking["ticketId"]:
            ticket_id = f"TKT-{booking['id']}-{uuid.uuid4().hex[:8]}"
            
            # Update booking with ticket ID
            query = """
            UPDATE exhibition_bookings
            SET ticket_id = %s
            WHERE id = %s
            """
            cursor.execute(query, (ticket_id, booking_id))
            connection.commit()
            
            booking["ticketId"] = ticket_id
        
        # Generate ticket URL
        ticket_url = f"/tickets/{booking['ticketId']}.pdf"
        
        return {
            "booking": booking,
            "ticketUrl": ticket_url
        }
    except Exception as e:
        print(f"Error generating ticket: {e}")
        return {"error": str(e)}
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def send_ticket_email(email, name, exhibition_title, location, start_date, end_date, slots, ticket_id, booking_id):
    """Send an email with the ticket attached"""
    try:
        # For simulation purposes, we'll just log the email
        print(f"Sending ticket email to {email}")
        
        # In a real implementation, you would:
        # 1. Generate a PDF ticket
        # 2. Set up an SMTP connection
        # 3. Create and send the email with the PDF attached
        
        # Email content
        subject = f"Your Ticket for {exhibition_title}"
        body = f"""
        Hello {name},
        
        Thank you for booking tickets for {exhibition_title}!
        
        Booking Details:
        - Exhibition: {exhibition_title}
        - Location: {location}
        - Date: {start_date.strftime('%B %d, %Y')} to {end_date.strftime('%B %d, %Y')}
        - Number of Tickets: {slots}
        - Booking Reference: {booking_id}
        - Ticket ID: {ticket_id}
        
        Your ticket is attached to this email. Please print it or show it on your mobile device when you arrive at the exhibition.
        
        We look forward to seeing you!
        
        Best regards,
        The AfriArt Team
        """
        
        # For demonstration, we'll just log that the email would be sent
        print("Email content:")
        print(f"Subject: {subject}")
        print(f"Body: {body}")
        print(f"Ticket would be attached as PDF for: {ticket_id}")
        
        # In a real application with a mail server configured, you would:
        # msg = MIMEMultipart()
        # msg['From'] = 'your-email@example.com'
        # msg['To'] = email
        # msg['Subject'] = subject
        # msg.attach(MIMEText(body, 'plain'))
        # 
        # # Attach the PDF ticket
        # with open(f"tickets/{ticket_id}.pdf", "rb") as f:
        #     attachment = MIMEApplication(f.read(), _subtype="pdf")
        #     attachment.add_header('Content-Disposition', 'attachment', filename=f"{ticket_id}.pdf")
        #     msg.attach(attachment)
        # 
        # # Send the email
        # server = smtplib.SMTP('smtp.example.com', 587)
        # server.starttls()
        # server.login('your-email@example.com', 'your-password')
        # server.send_message(msg)
        # server.quit()
        
        return True
    except Exception as e:
        print(f"Error sending ticket email: {e}")
        return False

def get_all_booking_tickets():
    """Get all booking tickets for admin"""
    try:
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        # Get all bookings with ticket IDs
        query = """
        SELECT eb.id, eb.name, eb.email, eb.phone, eb.slots, eb.ticket_id, eb.booking_date,
               e.title, e.location, e.start_date, e.end_date
        FROM exhibition_bookings eb
        JOIN exhibitions e ON eb.exhibition_id = e.id
        WHERE eb.payment_status = 'completed'
        ORDER BY eb.booking_date DESC
        """
        cursor.execute(query)
        results = cursor.fetchall()
        
        bookings = []
        for result in results:
            booking = {
                "id": result[0],
                "name": result[1],
                "email": result[2],
                "phone": result[3],
                "slots": result[4],
                "ticketId": result[5],
                "bookingDate": result[6].isoformat() if result[6] else None,
                "exhibitionTitle": result[7],
                "location": result[8],
                "startDate": result[9].isoformat() if result[9] else None,
                "endDate": result[10].isoformat() if result[10] else None,
                "ticketUrl": f"/tickets/{result[5]}.pdf" if result[5] else None
            }
            
            bookings.append(booking)
        
        return {"bookings": bookings}
    except Exception as e:
        print(f"Error getting booking tickets: {e}")
        return {"error": str(e)}
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def get_user_booking_tickets(user_id):
    """Get booking tickets for a specific user"""
    try:
        connection = get_db_connection()
        if connection is None:
            return {"error": "Database connection failed"}
        
        cursor = connection.cursor()
        
        # Get user's bookings with ticket IDs
        query = """
        SELECT eb.id, eb.name, eb.email, eb.phone, eb.slots, eb.ticket_id, eb.booking_date,
               e.title, e.location, e.start_date, e.end_date
        FROM exhibition_bookings eb
        JOIN exhibitions e ON eb.exhibition_id = e.id
        WHERE eb.user_id = %s AND eb.payment_status = 'completed'
        ORDER BY eb.booking_date DESC
        """
        cursor.execute(query, (user_id,))
        results = cursor.fetchall()
        
        bookings = []
        for result in results:
            booking = {
                "id": result[0],
                "name": result[1],
                "email": result[2],
                "phone": result[3],
                "slots": result[4],
                "ticketId": result[5],
                "bookingDate": result[6].isoformat() if result[6] else None,
                "exhibitionTitle": result[7],
                "location": result[8],
                "startDate": result[9].isoformat() if result[9] else None,
                "endDate": result[10].isoformat() if result[10] else None,
                "ticketUrl": f"/tickets/{result[5]}.pdf" if result[5] else None
            }
            
            bookings.append(booking)
        
        return {"bookings": bookings}
    except Exception as e:
        print(f"Error getting user booking tickets: {e}")
        return {"error": str(e)}
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
