import mysql.connector
from mysql.connector import Error
import json

# Database connection configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',  # Update with your MySQL username
    'password': '',  # Update with your MySQL password
    'database': 'artgallery'
}

def get_db_connection():
    """Create and return a database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
    return None

def initialize_database():
    """Create database tables if they don't exist"""
    connection = get_db_connection()
    if connection is None:
        print("Failed to connect to database")
        return False
    
    cursor = connection.cursor()
    
    # Create users table
    users_table = """
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    # Create admins table
    admins_table = """
    CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    # Create artworks table
    artworks_table = """
    CREATE TABLE IF NOT EXISTS artworks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url VARCHAR(255),
        dimensions VARCHAR(100),
        medium VARCHAR(100),
        year INT,
        status ENUM('available', 'sold') NOT NULL DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    # Create exhibitions table
    exhibitions_table = """
    CREATE TABLE IF NOT EXISTS exhibitions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        ticket_price DECIMAL(10, 2) NOT NULL,
        image_url VARCHAR(255),
        total_slots INT NOT NULL,
        available_slots INT NOT NULL,
        status ENUM('upcoming', 'ongoing', 'past') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    # Create artwork orders table
    artwork_orders_table = """
    CREATE TABLE IF NOT EXISTS artwork_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        artwork_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        delivery_address TEXT NOT NULL,
        payment_method ENUM('mpesa') NOT NULL,
        payment_status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
        mpesa_transaction_id VARCHAR(50),
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_amount DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
    );
    """
    
    # Create exhibition bookings table
    exhibition_bookings_table = """
    CREATE TABLE IF NOT EXISTS exhibition_bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        exhibition_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        slots INT NOT NULL,
        payment_method ENUM('mpesa') NOT NULL,
        payment_status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
        mpesa_transaction_id VARCHAR(50),
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_amount DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE CASCADE
    );
    """
    
    # Create contact messages table
    contact_messages_table = """
    CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        message TEXT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('new', 'read', 'replied') NOT NULL DEFAULT 'new'
    );
    """
    
    try:
        cursor.execute(users_table)
        cursor.execute(admins_table)
        cursor.execute(artworks_table)
        cursor.execute(exhibitions_table)
        cursor.execute(artwork_orders_table)
        cursor.execute(exhibition_bookings_table)
        cursor.execute(contact_messages_table)
        connection.commit()
        print("Database initialized successfully")
        return True
    except Error as e:
        print(f"Error initializing database: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def dict_from_row(row, cursor):
    """Convert a database row to a dictionary"""
    return {cursor.column_names[i]: value for i, value in enumerate(row)}

# Contact message functions
def save_contact_message(name, email, phone, message, source='contact_form'):
    """Save a new contact message"""
    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}
    
    try:
        cursor = connection.cursor()
        
        # Check if contact_messages table has source column
        cursor.execute("SHOW COLUMNS FROM contact_messages LIKE 'source'")
        source_exists = cursor.fetchone()
        
        if not source_exists:
            # Add source column if it doesn't exist
            cursor.execute("ALTER TABLE contact_messages ADD COLUMN source VARCHAR(50) DEFAULT 'contact_form'")
        
        # Insert the message into the database
        query = """
        INSERT INTO contact_messages (name, email, phone, message, source)
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (name, email, phone, message, source))
        connection.commit()
        
        return {"success": True, "message_id": cursor.lastrowid}
    
    except Error as e:
        print(f"Error saving contact message: {e}")
        return {"error": str(e)}
    
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def get_all_contact_messages():
    """Get all contact messages"""
    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}
    
    try:
        cursor = connection.cursor()
        
        # Get all messages ordered by date (newest first)
        query = """
        SELECT * FROM contact_messages
        ORDER BY date DESC
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        
        messages = []
        for row in rows:
            messages.append(dict_from_row(row, cursor))
        
        return {"messages": messages}
    
    except Error as e:
        print(f"Error getting contact messages: {e}")
        return {"error": str(e)}
    
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def update_message_status(message_id, status):
    """Update the status of a message"""
    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}
    
    try:
        cursor = connection.cursor()
        
        # Update the message status
        query = """
        UPDATE contact_messages
        SET status = %s
        WHERE id = %s
        """
        cursor.execute(query, (status, message_id))
        connection.commit()
        
        if cursor.rowcount == 0:
            return {"error": "Message not found"}
        
        return {"success": True}
    
    except Error as e:
        print(f"Error updating message status: {e}")
        return {"error": str(e)}
    
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
