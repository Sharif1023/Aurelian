-- =========================================================
-- SHARUU Hosting Ready Database Import
-- For cPanel / Hostinger / shared hosting phpMyAdmin
--
-- IMPORTANT:
-- 1) Hosting panel theke database create koro.
-- 2) phpMyAdmin open kore oi database select koro.
-- 3) Tarpor ei SQL import/paste koro.
-- 4) Ei file existing app tables drop kore abar create korbe.
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS product_colors;
DROP TABLE IF EXISTS product_sizes;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS products;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- 1. Products Table
-- =========================================================

CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    discount DECIMAL(5, 2),
    category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100),
    image LONGTEXT NOT NULL,
    description TEXT,
    product_details TEXT,
    rating DECIMAL(2, 1) DEFAULT 5.0,
    reviews INT DEFAULT 0,
    stock INT DEFAULT 0,
    status ENUM('Active', 'Draft', 'Archived') DEFAULT 'Active',
    size_chart_json JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =========================================================
-- 2. Product Sizes Table
-- =========================================================

CREATE TABLE product_sizes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    size VARCHAR(20) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_product_size (product_id, size),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =========================================================
-- 3. Product Colors Table
-- =========================================================

CREATE TABLE product_colors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    hex_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_product_color (product_id, name),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =========================================================
-- 4. Product Extra Images Table
-- =========================================================

CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    image_url LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =========================================================
-- 5. Orders Table
-- =========================================================

CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,

    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    zip VARCHAR(20),

    subtotal DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    coupon_code VARCHAR(50),
    total DECIMAL(10, 2) NOT NULL,

    shipping_area VARCHAR(100),
    shipping_cost DECIMAL(10, 2) DEFAULT 0,

    payment_method ENUM('COD', 'Card', 'bKash', 'Nagad', 'Upay') NOT NULL,
    transaction_id VARCHAR(255),
    payment_status ENUM(
        'Unpaid',
        'Pending Verification',
        'Paid',
        'Failed',
        'Refunded'
    ) DEFAULT 'Unpaid',

    status ENUM(
        'Pending',
        'Processing',
        'Shipped',
        'Delivered',
        'Cancelled'
    ) DEFAULT 'Pending',

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =========================================================
-- 6. Order Items Table
-- =========================================================

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50),
    product_id VARCHAR(50),
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    size VARCHAR(20),
    color VARCHAR(50),
    image_url LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =========================================================
-- 7. Coupons Table
-- =========================================================

CREATE TABLE coupons (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =========================================================
-- 8. Settings Table
-- =========================================================

CREATE TABLE settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =========================================================
-- 9. Admin Users Table
-- Password must be bcrypt hashed from backend.
-- Do not store plain password in production.
-- =========================================================

CREATE TABLE admin_users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('SuperAdmin', 'Manager') DEFAULT 'SuperAdmin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =========================================================
-- Indexes
-- =========================================================

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at);

CREATE INDEX idx_product_sizes_product_id ON product_sizes(product_id);
CREATE INDEX idx_product_colors_product_id ON product_colors(product_id);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_coupons_code ON coupons(code);

-- =========================================================
-- Demo Products
-- =========================================================

INSERT INTO products (
    id,
    product_code,
    name,
    price,
    original_price,
    discount,
    category,
    sub_category,
    image,
    description,
    product_details,
    rating,
    reviews,
    stock,
    status,
    size_chart_json
) VALUES
(
    '1',
    'MEN-S001',
    'Oxford Cotton Shirt',
    85.00,
    NULL,
    NULL,
    'Shirt',
    'Formal',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1976&auto=format&fit=crop',
    'A timeless classic. Crafted from premium cotton.',
    'Premium oxford cotton shirt with tailored fit, button-down collar, and refined finishing.',
    5.0,
    124,
    42,
    'Active',
    '{
      "title": "Shirt Size Chart",
      "columns": ["Size", "Chest", "Length", "Sleeve", "Collar"],
      "rows": [
        {"Size": "S", "Chest": "38", "Length": "28", "Sleeve": "24", "Collar": "15"},
        {"Size": "M", "Chest": "40", "Length": "29", "Sleeve": "24.5", "Collar": "15.5"},
        {"Size": "L", "Chest": "42", "Length": "30", "Sleeve": "25", "Collar": "16"},
        {"Size": "XL", "Chest": "44", "Length": "31", "Sleeve": "25.5", "Collar": "16.5"}
      ]
    }'
),
(
    '2',
    'MEN-T002',
    'Premium Essential Tee',
    35.00,
    NULL,
    NULL,
    'T-Shirt',
    NULL,
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop',
    'Tailored fit and ultra-soft fabric.',
    'Everyday premium tee crafted for comfort, breathability, and clean structure.',
    4.5,
    89,
    15,
    'Active',
    '{
      "title": "T-Shirt Size Chart",
      "columns": ["Size", "Chest", "Length", "Shoulder"],
      "rows": [
        {"Size": "S", "Chest": "36", "Length": "27", "Shoulder": "16"},
        {"Size": "M", "Chest": "38", "Length": "28", "Shoulder": "17"},
        {"Size": "L", "Chest": "40", "Length": "29", "Shoulder": "18"}
      ]
    }'
),
(
    '3',
    'MEN-P003',
    'Slim Fit Chinos',
    95.00,
    NULL,
    NULL,
    'Pant',
    NULL,
    'https://images.unsplash.com/photo-1624371414361-e6e8ea04c112?q=80&w=1974&auto=format&fit=crop',
    'Versatile and comfortable stretch twill.',
    'Slim fit chinos designed for refined casual and smart everyday styling.',
    5.0,
    56,
    28,
    'Active',
    '{
      "title": "Pant Size Chart",
      "columns": ["Size", "Waist", "Length", "Hip"],
      "rows": [
        {"Size": "30", "Waist": "30", "Length": "40", "Hip": "38"},
        {"Size": "32", "Waist": "32", "Length": "41", "Hip": "40"},
        {"Size": "34", "Waist": "34", "Length": "42", "Hip": "42"},
        {"Size": "36", "Waist": "36", "Length": "43", "Hip": "44"}
      ]
    }'
),
(
    '4',
    'MEN-SH004',
    'Classic Leather Derby',
    185.00,
    NULL,
    NULL,
    'Shoes',
    NULL,
    'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=2069&auto=format&fit=crop',
    'Elegant full-grain leather craftsmanship.',
    'Classic derby shoes made with refined leather finishing and durable sole construction.',
    5.0,
    42,
    8,
    'Active',
    '{
      "title": "Shoe Size Chart",
      "columns": ["Size", "UK", "EU", "Foot Length"],
      "rows": [
        {"Size": "40", "UK": "6", "EU": "40", "Foot Length": "25.5 cm"},
        {"Size": "41", "UK": "7", "EU": "41", "Foot Length": "26 cm"},
        {"Size": "42", "UK": "8", "EU": "42", "Foot Length": "26.5 cm"},
        {"Size": "43", "UK": "9", "EU": "43", "Foot Length": "27.5 cm"}
      ]
    }'
),
(
    '5',
    'MEN-A005',
    'Minimalist Leather Belt',
    45.00,
    NULL,
    NULL,
    'Accessories',
    NULL,
    'https://images.unsplash.com/photo-1624222247344-550fbadcd973?q=80&w=2070&auto=format&fit=crop',
    'Genuine vegetable-tanned leather.',
    'Minimal belt with timeless buckle, premium leather, and versatile styling.',
    4.0,
    210,
    12,
    'Active',
    '{
      "title": "Belt Size Chart",
      "columns": ["Size", "Waist Fit", "Total Length"],
      "rows": [
        {"Size": "One Size", "Waist Fit": "30-38", "Total Length": "110 cm"}
      ]
    }'
);

-- =========================================================
-- Demo Product Sizes
-- =========================================================

INSERT INTO product_sizes (product_id, size, is_available, quantity) VALUES
('1', 'S', 1, 10),
('1', 'M', 1, 15),
('1', 'L', 1, 10),
('1', 'XL', 1, 7),

('2', 'S', 1, 5),
('2', 'M', 1, 5),
('2', 'L', 1, 5),

('3', '30', 1, 7),
('3', '32', 1, 7),
('3', '34', 1, 7),
('3', '36', 1, 7),

('4', '40', 1, 2),
('4', '41', 1, 2),
('4', '42', 1, 2),
('4', '43', 1, 2),

('5', 'One Size', 1, 12);

-- =========================================================
-- Demo Product Colors
-- =========================================================

INSERT INTO product_colors (product_id, name, hex_code) VALUES
('1', 'White', '#FFFFFF'),
('1', 'Light Blue', '#ADD8E6'),
('1', 'Navy', '#000080'),

('2', 'Black', '#000000'),
('2', 'White', '#FFFFFF'),

('3', 'Beige', '#F5F5DC'),
('3', 'Olive', '#808000'),

('4', 'Brown', '#8B4513'),
('4', 'Black', '#000000'),

('5', 'Tan', '#D2B48C'),
('5', 'Black', '#000000');

-- =========================================================
-- Demo Product Extra Images
-- =========================================================

INSERT INTO product_images (product_id, image_url) VALUES
('1', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1974&auto=format&fit=crop'),
('1', 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?q=80&w=1974&auto=format&fit=crop'),

('2', 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1974&auto=format&fit=crop'),
('3', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1974&auto=format&fit=crop'),

('4', 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?q=80&w=1974&auto=format&fit=crop'),
('5', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1974&auto=format&fit=crop');

-- =========================================================
-- Demo Coupons
-- =========================================================

INSERT INTO coupons (id, code, discount_percent, is_active) VALUES
('1', 'WELCOME10', 10, 1),
('2', 'SHARUU20', 20, 1);

-- =========================================================
-- Complete Store Settings
-- =========================================================

INSERT INTO settings (setting_key, setting_value) VALUES
(
  'store_settings',
  '{
    "shippingChittagong": 60,
    "shippingOutsideChittagong": 120,

    "generalSettings": {
      "storeName": "Sharuu",
      "storeEmail": "support@sharuu.com",
      "storeDescription": "A destination for curated fashion and timeless elegance.",
      "currency": "BDT (৳)",
      "currencyCode": "BDT",
      "currencySymbol": "৳",
      "weightUnit": "Kilograms (kg)",
      "orderPrefix": "SHR",
      "timezone": "Asia/Dhaka"
    },

    "paymentSettings": {
      "bkashNumber": "01700000000",
      "nagadNumber": "01800000000",
      "upayNumber": "",
      "codEnabled": true,
      "bkashEnabled": true,
      "nagadEnabled": true,
      "upayEnabled": false,
      "cardEnabled": false,
      "manualPaymentInstructions": "Please send payment to the selected number and enter your transaction ID during checkout."
    },

    "socialLinks": [
      {
        "platform": "Instagram",
        "url": "https://instagram.com/sharuu"
      },
      {
        "platform": "Facebook",
        "url": "https://facebook.com/sharuu"
      }
    ],

    "categorySubtitles": {
      "Combo": "Exclusive 2-in-1 & 3-in-1 deals",
      "Shirt": "Premium cotton & linen",
      "T-Shirt": "Essential everyday basics",
      "Pant": "Tailored chinos & trousers",
      "Shoes": "Handcrafted leather footwear",
      "Accessories": "The finishing touches"
    },

    "brandSettings": {
      "name": "SHARUU",
      "fontFamily": "font-display",
      "color": "#000000",
      "tagline": "Fashion Atelier"
    },

    "contactSettings": {
      "email": "contact@sharuu.com",
      "address": "Chittagong, Bangladesh",
      "contactPhone": "+880 1700-000000",
      "shippingReturns": "Free shipping on orders over ৳100. Easy 30-day returns.",
      "specifications": "Material: 100% Cotton/Leather. Care: Machine wash cold / Professional leather clean."
    },

    "notificationSettings": {
      "adminEmailNotifications": true,
      "customerOrderConfirmation": true,
      "lowStockAlerts": true,
      "newsletterEnabled": false,
      "notificationEmail": "support@sharuu.com"
    },

    "localizationSettings": {
      "country": "Bangladesh",
      "city": "Chittagong",
      "language": "English",
      "timezone": "Asia/Dhaka",
      "dateFormat": "MMMM DD, YYYY",
      "currency": "BDT"
    },

    "securitySettings": {
      "adminPath": "admin",
      "autoLogoutEnabled": true,
      "autoLogoutMinutes": 30,
      "minimumPasswordLength": 4,
      "requireStrongPassword": false
    },

    "accountSettings": {
      "ownerName": "Sharuu Admin",
      "ownerEmail": "support@sharuu.com",
      "role": "Super Admin"
    }
  }'
);

-- =========================================================
-- Complete Home Settings
-- =========================================================

INSERT INTO settings (setting_key, setting_value) VALUES
(
  'home_settings',
  '{
    "heroImage": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
    "heroBadge": "New Collection",
    "heroTitle": "The Art of Modern Elegance",
    "heroSubtitle": "Discover our curated collection of pieces designed for the contemporary individual.",
    "heroVideoUrl": "https://player.vimeo.com/external/459389137.sd.mp4?s=8946331db3c989d0f11b92277409696516056064&profile_id=164&oauth2_token_id=57447761",

    "bestSellerIds": ["1", "2", "3", "4"],

    "socialGallery": [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1920&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1920&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1920&auto=format&fit=crop"
    ],

    "featuredCollection": {
      "title": "The Silk Road",
      "subtitle": "Hand-woven elegance from the heart of the orient.",
      "productIds": ["1", "3", "4"],
      "show": true
    },

    "curatedEdits": {
      "title": "Curated Edits",
      "items": [
        {
          "id": "1",
          "title": "The Minimalist",
          "subtitle": "Clean lines & neutral tones",
          "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop",
          "link": "/collection?category=Shirt"
        },
        {
          "id": "2",
          "title": "Urban Explorer",
          "subtitle": "Durable fabrics for the city",
          "image": "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1920&auto=format&fit=crop",
          "link": "/collection?category=Pant"
        },
        {
          "id": "3",
          "title": "Evening Gala",
          "subtitle": "Sophisticated night wear",
          "image": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1920&auto=format&fit=crop",
          "link": "/collection?category=Combo"
        }
      ]
    }
  }'
);

-- =========================================================
-- Demo Admin User
-- This password_hash is a placeholder.
-- In real backend, create bcrypt hash using Node.js bcrypt.
-- Do not use plain text password in database.
-- =========================================================

INSERT INTO admin_users (
    id,
    username,
    email,
    password_hash,
    role,
    is_active
) VALUES
(
    '1',
    'admin',
    'support@sharuu.com',
    '$2b$10$replace_this_with_real_bcrypt_hash_from_backend',
    'SuperAdmin',
    1
);

-- =========================================================
-- Final Check Queries
-- =========================================================

SELECT 'Database setup completed successfully.' AS message;

SELECT COUNT(*) AS total_products FROM products;
SELECT COUNT(*) AS total_product_sizes FROM product_sizes;
SELECT COUNT(*) AS total_product_colors FROM product_colors;
SELECT COUNT(*) AS total_product_images FROM product_images;
SELECT COUNT(*) AS total_coupons FROM coupons;
SELECT COUNT(*) AS total_settings FROM settings;
SELECT COUNT(*) AS total_admin_users FROM admin_users;

SELECT
    id,
    name,
    JSON_UNQUOTE(JSON_EXTRACT(size_chart_json, '$.title')) AS size_chart_title
FROM products;



--==========================================================
-- then

-- Add show_size_section column to products table if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS show_size_section BOOLEAN DEFAULT TRUE;

-- Update existing products to have show_size_section = TRUE if the column was just added
UPDATE products 
SET show_size_section = TRUE 
WHERE show_size_section IS NULL;


-- main schema te add kora ache.
