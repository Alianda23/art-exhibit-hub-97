
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Artwork Orders table
CREATE TABLE IF NOT EXISTS artwork_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    artwork_id INT NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    delivery_address TEXT,
    payment_method ENUM('mpesa', 'card', 'bank') DEFAULT 'mpesa',
    payment_status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (artwork_id) REFERENCES artworks(id)
);

-- Exhibition Bookings table
CREATE TABLE IF NOT EXISTS exhibition_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exhibition_id INT NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    ticket_code VARCHAR(50),
    slots INT NOT NULL DEFAULT 1,
    payment_method ENUM('mpesa', 'card', 'bank') DEFAULT 'mpesa',
    payment_status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    status ENUM('active', 'used', 'cancelled') DEFAULT 'active',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id)
);

-- Legacy tables (kept for backward compatibility)
CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exhibition_id INT NOT NULL,
    ticket_code VARCHAR(50) NOT NULL UNIQUE,
    slots INT NOT NULL,
    status ENUM('active', 'used', 'cancelled') NOT NULL DEFAULT 'active',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id)
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('artwork', 'exhibition') NOT NULL,
    reference_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
