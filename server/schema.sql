
-- Drop database if it exists (be careful with this in production!)
DROP DATABASE IF EXISTS afriart_db;

-- Create the database
CREATE DATABASE afriart_db;

-- Use the database
USE afriart_db;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admins table
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create artworks table
CREATE TABLE artworks (
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

-- Create exhibitions table
CREATE TABLE exhibitions (
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

-- Create artwork orders table
CREATE TABLE artwork_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    artwork_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    delivery_address TEXT NOT NULL,
    payment_method ENUM('mpesa') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
);

-- Create exhibition bookings table
CREATE TABLE exhibition_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exhibition_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    slots INT NOT NULL,
    payment_method ENUM('mpesa') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE CASCADE
);

-- Create contact messages table
CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('new', 'read', 'replied') NOT NULL DEFAULT 'new'
);

-- Insert some sample artworks 
INSERT INTO artworks (title, artist, description, price, image_url, dimensions, medium, year, status)
VALUES
('Maasai Market Sunset', 'James Mwangi', 'A vibrant depiction of a traditional Maasai market at sunset, capturing the rich colors and cultural essence of Kenya.', 45000, 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c', '80cm x 60cm', 'Oil on Canvas', 2022, 'available'),
('Nairobi Skyline', 'Faith Wanjiru', 'A modern interpretation of Nairobi\'s evolving skyline, showcasing the contrast between traditional and contemporary architecture.', 35000, 'https://images.unsplash.com/photo-1611348586804-61bf6c080437', '100cm x 40cm', 'Acrylic on Canvas', 2021, 'available');

-- Insert sample exhibitions
INSERT INTO exhibitions (title, description, location, start_date, end_date, ticket_price, image_url, total_slots, available_slots, status)
VALUES
('Contemporary Kenyan Visions', 'A showcase of emerging Kenyan artists exploring themes of identity, tradition, and modernization.', 'Nairobi National Museum', '2023-10-10', '2023-11-10', 1500, 'https://images.unsplash.com/photo-1594115584026-86d4df633163', 100, 75, 'upcoming'),
('Art of the Rift Valley', 'An exhibition celebrating the landscapes and cultures of Kenya\'s Great Rift Valley through various artistic mediums.', 'Karen Blixen Museum', '2023-09-15', '2023-10-15', 1200, 'https://images.unsplash.com/photo-1561214115-f2f134cc4912', 50, 20, 'ongoing');
