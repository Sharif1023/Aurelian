-- Aurelian Luxe Atelier Database Schema & Demo Data
-- Generated for full website integration

-- 1. Products Table
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    discount DECIMAL(5, 2),
    category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100),
    image TEXT NOT NULL,
    description TEXT,
    product_details TEXT,
    rating DECIMAL(2, 1) DEFAULT 5.0,
    reviews INT DEFAULT 0,
    stock INT DEFAULT 0,
    status ENUM('Active', 'Draft', 'Archived') DEFAULT 'Active',
    size_chart_json JSON -- Stores the measurement table structure
);

-- 2. Product Sizes Table
CREATE TABLE product_sizes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50),
    size VARCHAR(20) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    quantity INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 3. Product Colors Table
CREATE TABLE product_colors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50),
    name VARCHAR(50) NOT NULL,
    hex_code VARCHAR(10) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 4. Product Extra Images Table
CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50),
    image_url TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 5. Orders Table
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    zip VARCHAR(20),
    total DECIMAL(10, 2) NOT NULL,
    shipping_area VARCHAR(100),
    shipping_cost DECIMAL(10, 2),
    payment_method ENUM('COD', 'Card', 'bKash', 'Nagad', 'Upay') NOT NULL,
    transaction_id VARCHAR(255),
    status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Order Items Table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50),
    product_id VARCHAR(50),
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    size VARCHAR(20),
    color VARCHAR(50),
    image_url TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 7. Coupons Table
CREATE TABLE coupons (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 8. Settings Table (For Home & Store Configuration)
CREATE TABLE settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value JSON NOT NULL
);

-- ==========================================
-- DEMO DATA INSERTION
-- ==========================================

-- Insert Products
INSERT INTO products (id, product_code, name, price, category, sub_category, image, description, rating, reviews, stock, status) VALUES
('1', 'MEN-S001', 'Oxford Cotton Shirt', 85.00, 'Shirt', 'Formal', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1976&auto=format&fit=crop', 'A timeless classic. Crafted from premium cotton.', 5.0, 124, 42, 'Active'),
('2', 'MEN-T002', 'Premium Essential Tee', 35.00, 'T-Shirt', NULL, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop', 'Tailored fit and ultra-soft fabric.', 4.5, 89, 15, 'Active'),
('3', 'MEN-P003', 'Slim Fit Chinos', 95.00, 'Pant', NULL, 'https://images.unsplash.com/photo-1624371414361-e6e8ea04c112?q=80&w=1974&auto=format&fit=crop', 'Versatile and comfortable stretch twill.', 5.0, 56, 28, 'Active'),
('4', 'MEN-SH004', 'Classic Leather Derby', 185.00, 'Shoes', NULL, 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=2069&auto=format&fit=crop', 'Elegant full-grain leather craftsmanship.', 5.0, 42, 8, 'Active'),
('5', 'MEN-A005', 'Minimalist Leather Belt', 45.00, 'Accessories', NULL, 'https://images.unsplash.com/photo-1624222247344-550fbadcd973?q=80&w=2070&auto=format&fit=crop', 'Genuine vegetable-tanned leather.', 4.0, 210, 12, 'Active');

-- Insert Product Sizes
INSERT INTO product_sizes (product_id, size, is_available, quantity) VALUES
('1', 'S', 1, 10), ('1', 'M', 1, 15), ('1', 'L', 1, 10), ('1', 'XL', 1, 7),
('2', 'S', 1, 5), ('2', 'M', 1, 5), ('2', 'L', 1, 5),
('3', '30', 1, 7), ('3', '32', 1, 7), ('3', '34', 1, 7), ('3', '36', 1, 7),
('4', '40', 1, 2), ('4', '41', 1, 2), ('4', '42', 1, 2), ('4', '43', 1, 2),
('5', 'One Size', 1, 12);

-- Insert Product Colors
INSERT INTO product_colors (product_id, name, hex_code) VALUES
('1', 'White', '#FFFFFF'), ('1', 'Light Blue', '#ADD8E6'), ('1', 'Navy', '#000080'),
('2', 'Black', '#000000'), ('2', 'White', '#FFFFFF'),
('3', 'Beige', '#F5F5DC'), ('3', 'Olive', '#808000'),
('4', 'Brown', '#8B4513'), ('4', 'Black', '#000000'),
('5', 'Tan', '#D2B48C'), ('5', 'Black', '#000000');

-- Insert Coupons
INSERT INTO coupons (id, code, discount_percent, is_active) VALUES
('1', 'WELCOME10', 10, 1),
('2', 'AURELIAN20', 20, 1);

-- Insert Settings (Store & Home)
INSERT INTO settings (setting_key, setting_value) VALUES
('store_settings', '{
    "shippingChittagong": 60,
    "shippingOutsideChittagong": 120,
    "paymentSettings": {
        "bkashNumber": "01700000000",
        "nagadNumber": "01800000000"
    },
    "brandSettings": {
        "name": "AURELIAN",
        "fontFamily": "font-display",
        "color": "#000000"
    }
}'),
('home_settings', '{
    "heroTitle": "The Art of Modern Elegance",
    "heroSubtitle": "Discover our curated collection of artisanal pieces.",
    "heroBadge": "Autumn / Winter 2024",
    "curatedEdits": {
        "title": "Curated Edits",
        "items": [
            {"id": "1", "title": "The Minimalist", "subtitle": "Clean lines", "link": "/collection?category=Shirt"},
            {"id": "2", "title": "Urban Explorer", "subtitle": "Durable fabrics", "link": "/collection?category=Pant"}
        ]
    }
}');
