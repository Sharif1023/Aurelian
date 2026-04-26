const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
    cors({
        origin: ["http://localhost:3000", "http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    })
);

app.use(express.json({ limit: "10mb" }));

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "aurelian_luxe",
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

function parseJsonValue(value) {
    if (!value) return null;
    if (typeof value === "object") return value;

    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

function generateId() {
    return Math.random().toString(36).slice(2, 11);
}

function normalizeProductBody(body) {
    return {
        id: body.id || generateId(),
        product_code:
            body.product_code ||
            body.productCode ||
            `MEN-${Date.now().toString().slice(-6)}`,
        name: body.name || "Untitled Product",
        price: Number(body.price || 0),
        original_price:
            body.original_price !== undefined
                ? body.original_price
                : body.originalPrice || null,
        discount: body.discount || null,
        category: body.category || "Uncategorized",
        sub_category: body.sub_category || body.subCategory || null,
        image: body.image || "",
        description: body.description || "",
        product_details: body.product_details || body.productDetails || "",
        rating: body.rating || 5,
        reviews: body.reviews || 0,
        stock: body.stock || 0,
        status: body.status || "Active",
        size_chart_json:
            body.size_chart_json || body.sizeChart
                ? JSON.stringify(body.size_chart_json || body.sizeChart)
                : null,
        sizes: body.sizes || [],
        colors: body.colors || [],
        images: body.images || body.extraImages || []
    };
}

function normalizeCouponBody(body) {
    return {
        id: body.id || generateId(),
        code: String(body.code || "").trim().toUpperCase(),
        discount_percent: Number(
            body.discount_percent ?? body.discountPercent ?? 0
        ),
        is_active: body.is_active ?? body.isActive ?? true
    };
}

function normalizeOrderBody(body) {
    return {
        id: body.id || generateId(),
        order_number:
            body.order_number ||
            body.orderNumber ||
            `ARL-${Math.floor(10000 + Math.random() * 90000)}`,
        customer_name:
            body.customer_name ||
            body.customerName ||
            body.name ||
            "Guest Customer",
        email: body.email || "guest@example.com",
        phone: body.phone || "",
        address: body.address || "",
        city: body.city || "",
        zip: body.zip || "",
        total: Number(body.total || 0),
        shipping_area: body.shipping_area || body.shippingArea || "",
        shipping_cost: Number(body.shipping_cost ?? body.shippingCost ?? 0),
        payment_method: body.payment_method || body.paymentMethod || "COD",
        transaction_id: body.transaction_id || body.transactionId || null,
        status: body.status || "Pending",
        items: body.items || []
    };
}

// Health check
app.get("/api/health", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS ok");
        res.json({
            success: true,
            message: "Backend connected to MySQL",
            db: rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message
        });
    }
});

// =========================
// PRODUCTS
// =========================

app.get("/api/products", async (req, res) => {
    try {
        const [products] = await pool.query(`
      SELECT *
      FROM products
      ORDER BY id DESC
    `);

        res.json(products);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch products",
            error: error.message
        });
    }
});

app.get("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [products] = await pool.query(
            "SELECT * FROM products WHERE id = ?",
            [id]
        );

        if (products.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        const [sizes] = await pool.query(
            "SELECT size, is_available, quantity FROM product_sizes WHERE product_id = ?",
            [id]
        );

        const [colors] = await pool.query(
            "SELECT name, hex_code FROM product_colors WHERE product_id = ?",
            [id]
        );

        const [images] = await pool.query(
            "SELECT image_url FROM product_images WHERE product_id = ?",
            [id]
        );

        res.json({
            ...products[0],
            size_chart_json: parseJsonValue(products[0].size_chart_json),
            sizes,
            colors,
            images: images.map((img) => img.image_url)
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch product",
            error: error.message
        });
    }
});

app.post("/api/products", async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const product = normalizeProductBody(req.body);

        await connection.beginTransaction();

        await connection.query(
            `
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
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
            [
                product.id,
                product.product_code,
                product.name,
                product.price,
                product.original_price,
                product.discount,
                product.category,
                product.sub_category,
                product.image,
                product.description,
                product.product_details,
                product.rating,
                product.reviews,
                product.stock,
                product.status,
                product.size_chart_json
            ]
        );

        if (Array.isArray(product.sizes)) {
            for (const item of product.sizes) {
                const size =
                    typeof item === "string" ? item : item.size || item.name || "Default";
                const quantity =
                    typeof item === "object" ? Number(item.quantity || 0) : 0;
                const isAvailable =
                    typeof item === "object"
                        ? item.is_available ?? item.isAvailable ?? true
                        : true;

                await connection.query(
                    `
          INSERT INTO product_sizes (
            product_id,
            size,
            is_available,
            quantity
          )
          VALUES (?, ?, ?, ?)
          `,
                    [product.id, size, Boolean(isAvailable), quantity]
                );
            }
        }

        if (Array.isArray(product.colors)) {
            for (const item of product.colors) {
                const name =
                    typeof item === "string" ? item : item.name || "Default";
                const hexCode =
                    typeof item === "object"
                        ? item.hex_code || item.hexCode || "#000000"
                        : "#000000";

                await connection.query(
                    `
          INSERT INTO product_colors (
            product_id,
            name,
            hex_code
          )
          VALUES (?, ?, ?)
          `,
                    [product.id, name, hexCode]
                );
            }
        }

        if (Array.isArray(product.images)) {
            for (const imageUrl of product.images) {
                if (!imageUrl) continue;

                await connection.query(
                    `
          INSERT INTO product_images (
            product_id,
            image_url
          )
          VALUES (?, ?)
          `,
                    [product.id, imageUrl]
                );
            }
        }

        await connection.commit();

        const [savedProduct] = await pool.query(
            "SELECT * FROM products WHERE id = ?",
            [product.id]
        );

        res.status(201).json(savedProduct[0]);
    } catch (error) {
        await connection.rollback();

        res.status(500).json({
            message: "Failed to create product",
            error: error.message
        });
    } finally {
        connection.release();
    }
});

app.put("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const product = normalizeProductBody({ ...req.body, id });

        await pool.query(
            `
      UPDATE products
      SET
        product_code = ?,
        name = ?,
        price = ?,
        original_price = ?,
        discount = ?,
        category = ?,
        sub_category = ?,
        image = ?,
        description = ?,
        product_details = ?,
        rating = ?,
        reviews = ?,
        stock = ?,
        status = ?,
        size_chart_json = ?
      WHERE id = ?
      `,
            [
                product.product_code,
                product.name,
                product.price,
                product.original_price,
                product.discount,
                product.category,
                product.sub_category,
                product.image,
                product.description,
                product.product_details,
                product.rating,
                product.reviews,
                product.stock,
                product.status,
                product.size_chart_json,
                id
            ]
        );

        const [savedProduct] = await pool.query(
            "SELECT * FROM products WHERE id = ?",
            [id]
        );

        res.json(savedProduct[0]);
    } catch (error) {
        res.status(500).json({
            message: "Failed to update product",
            error: error.message
        });
    }
});

app.delete("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query("DELETE FROM products WHERE id = ?", [id]);

        res.json({
            success: true,
            message: "Product deleted"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete product",
            error: error.message
        });
    }
});

// =========================
// COUPONS
// =========================

app.get("/api/coupons", async (req, res) => {
    try {
        const [coupons] = await pool.query(`
      SELECT *
      FROM coupons
      ORDER BY id DESC
    `);

        res.json(coupons);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch coupons",
            error: error.message
        });
    }
});

app.get("/api/coupons/:code", async (req, res) => {
    try {
        const { code } = req.params;

        const [coupons] = await pool.query(
            `
      SELECT *
      FROM coupons
      WHERE code = ? AND is_active = TRUE
      `,
            [code.toUpperCase()]
        );

        if (coupons.length === 0) {
            return res.status(404).json({ message: "Invalid coupon" });
        }

        res.json(coupons[0]);
    } catch (error) {
        res.status(500).json({
            message: "Failed to check coupon",
            error: error.message
        });
    }
});

app.post("/api/coupons", async (req, res) => {
    try {
        const coupon = normalizeCouponBody(req.body);

        if (!coupon.code) {
            return res.status(400).json({
                message: "Coupon code is required"
            });
        }

        await pool.query(
            `
      INSERT INTO coupons (
        id,
        code,
        discount_percent,
        is_active
      )
      VALUES (?, ?, ?, ?)
      `,
            [
                coupon.id,
                coupon.code,
                coupon.discount_percent,
                Boolean(coupon.is_active)
            ]
        );

        const [savedCoupon] = await pool.query(
            "SELECT * FROM coupons WHERE id = ?",
            [coupon.id]
        );

        res.status(201).json(savedCoupon[0]);
    } catch (error) {
        res.status(500).json({
            message: "Failed to create coupon",
            error: error.message
        });
    }
});

app.delete("/api/coupons/:id", async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query("DELETE FROM coupons WHERE id = ?", [id]);

        res.json({
            success: true,
            message: "Coupon deleted"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete coupon",
            error: error.message
        });
    }
});

// =========================
// SETTINGS
// =========================

app.get("/api/settings/:key", async (req, res) => {
    try {
        const { key } = req.params;

        const [settings] = await pool.query(
            "SELECT setting_value FROM settings WHERE setting_key = ?",
            [key]
        );

        if (settings.length === 0) {
            return res.status(404).json({
                message: "Settings not found"
            });
        }

        res.json(parseJsonValue(settings[0].setting_value));
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch settings",
            error: error.message
        });
    }
});

app.put("/api/settings/:key", async (req, res) => {
    try {
        const { key } = req.params;
        const value = JSON.stringify(req.body);

        await pool.query(
            `
      INSERT INTO settings (
        setting_key,
        setting_value
      )
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        setting_value = ?
      `,
            [key, value, value]
        );

        res.json(req.body);
    } catch (error) {
        res.status(500).json({
            message: "Failed to update settings",
            error: error.message
        });
    }
});

// =========================
// ORDERS
// =========================

app.get("/api/orders", async (req, res) => {
    try {
        const [orders] = await pool.query(`
      SELECT *
      FROM orders
      ORDER BY created_at DESC
    `);

        res.json(orders);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch orders",
            error: error.message
        });
    }
});

app.post("/api/orders", async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const order = normalizeOrderBody(req.body);

        await connection.beginTransaction();

        await connection.query(
            `
      INSERT INTO orders (
        id,
        order_number,
        customer_name,
        email,
        phone,
        address,
        city,
        zip,
        total,
        shipping_area,
        shipping_cost,
        payment_method,
        transaction_id,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
            [
                order.id,
                order.order_number,
                order.customer_name,
                order.email,
                order.phone,
                order.address,
                order.city,
                order.zip,
                order.total,
                order.shipping_area,
                order.shipping_cost,
                order.payment_method,
                order.transaction_id,
                order.status
            ]
        );

        if (Array.isArray(order.items)) {
            for (const item of order.items) {
                await connection.query(
                    `
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            price,
            quantity,
            size,
            color,
            image_url
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
                    [
                        order.id,
                        item.product_id || item.productId || item.id || null,
                        item.product_name || item.productName || item.name || "Product",
                        Number(item.price || 0),
                        Number(item.quantity || 1),
                        item.size || null,
                        item.color || null,
                        item.image_url || item.imageUrl || item.image || null
                    ]
                );
            }
        }

        await connection.commit();

        const [savedOrder] = await pool.query(
            "SELECT * FROM orders WHERE id = ?",
            [order.id]
        );

        res.status(201).json(savedOrder[0]);
    } catch (error) {
        await connection.rollback();

        res.status(500).json({
            message: "Failed to create order",
            error: error.message
        });
    } finally {
        connection.release();
    }
});

app.put("/api/orders/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await pool.query(
            `
      UPDATE orders
      SET status = ?
      WHERE id = ?
      `,
            [status, id]
        );

        const [savedOrder] = await pool.query(
            "SELECT * FROM orders WHERE id = ?",
            [id]
        );

        res.json(savedOrder[0]);
    } catch (error) {
        res.status(500).json({
            message: "Failed to update order status",
            error: error.message
        });
    }
});

app.delete("/api/orders/:id", async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query("DELETE FROM orders WHERE id = ?", [id]);

        res.json({
            success: true,
            message: "Order deleted"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete order",
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});