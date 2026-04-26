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
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function stringifyJsonValue(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function toNullableNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? null : numberValue;
}

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? fallback : numberValue;
}

function toBoolean(value) {
  if (value === true || value === 1 || value === "1" || value === "true") {
    return true;
  }

  if (value === false || value === 0 || value === "0" || value === "false") {
    return false;
  }

  return Boolean(value);
}

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function normalizeProductBody(body) {
  const rawSizeChart = hasOwn(body, "size_chart_json")
    ? body.size_chart_json
    : body.sizeChart;

  return {
    id: body.id || generateId(),

    product_code:
      body.product_code ||
      body.productCode ||
      `MEN-${Date.now().toString().slice(-6)}`,

    name: body.name || "Untitled Product",
    price: toNumber(body.price, 0),

    original_price: toNullableNumber(
      hasOwn(body, "original_price") ? body.original_price : body.originalPrice
    ),

    discount: toNullableNumber(body.discount),
    category: body.category || "Uncategorized",
    sub_category: body.sub_category || body.subCategory || null,
    image: body.image || "",
    description: body.description || "",
    product_details: body.product_details || body.productDetails || "",
    rating: toNumber(body.rating, 5),
    reviews: toNumber(body.reviews, 0),
    stock: toNumber(body.stock, 0),
    status: body.status || "Active",

    size_chart_json: stringifyJsonValue(rawSizeChart),

    sizes: Array.isArray(body.sizes) ? body.sizes : [],
    colors: Array.isArray(body.colors) ? body.colors : [],

    images: Array.isArray(body.images)
      ? body.images
      : Array.isArray(body.extraImages)
        ? body.extraImages
        : []
  };
}

function normalizeCouponBody(body) {
  return {
    id: body.id || generateId(),
    code: String(body.code || "").trim().toUpperCase(),
    discount_percent: toNumber(body.discount_percent ?? body.discountPercent, 0),
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

    subtotal: toNumber(body.subtotal, 0),
    discount_amount: toNumber(body.discount_amount ?? body.discountAmount, 0),
    coupon_code: body.coupon_code || body.couponCode || null,
    total: toNumber(body.total, 0),

    shipping_area: body.shipping_area || body.shippingArea || "",
    shipping_cost: toNumber(body.shipping_cost ?? body.shippingCost, 0),

    payment_method: body.payment_method || body.paymentMethod || "COD",
    transaction_id: body.transaction_id || body.transactionId || null,
    payment_status: body.payment_status || body.paymentStatus || "Unpaid",

    status: body.status || "Pending",
    notes: body.notes || null,

    items: Array.isArray(body.items) ? body.items : []
  };
}

function formatSizeRow(row) {
  return {
    size: row.size,
    isAvailable: toBoolean(row.is_available),
    is_available: toBoolean(row.is_available),
    quantity: toNumber(row.quantity, 0)
  };
}

function formatColorRow(row) {
  return {
    name: row.name,
    hex: row.hex_code,
    hexCode: row.hex_code,
    hex_code: row.hex_code
  };
}

function formatProductRow(row, extras = {}) {
  const sizeChart = parseJsonValue(row.size_chart_json);

  return {
    ...row,

    // Frontend-friendly camelCase fields
    productCode: row.product_code,

    originalPrice:
      row.original_price === null || row.original_price === undefined
        ? undefined
        : Number(row.original_price),

    subCategory: row.sub_category || undefined,
    productDetails: row.product_details || "",
    sizeChart: sizeChart || undefined,
    extraImages: extras.extraImages || [],

    // Keep snake_case too, so old code still works
    product_code: row.product_code,
    original_price: row.original_price,
    sub_category: row.sub_category,
    product_details: row.product_details,
    size_chart_json: sizeChart,

    price: Number(row.price || 0),

    discount:
      row.discount === null || row.discount === undefined
        ? undefined
        : Number(row.discount),

    rating: Number(row.rating || 0),
    reviews: Number(row.reviews || 0),
    stock: Number(row.stock || 0),

    sizes: extras.sizes || [],
    colors: extras.colors || [],
    images: extras.extraImages || []
  };
}

async function getProductExtras(connectionOrPool, productIds) {
  const ids = productIds.filter(Boolean);

  if (ids.length === 0) {
    return {
      sizesMap: {},
      colorsMap: {},
      imagesMap: {}
    };
  }

  const [allSizes] = await connectionOrPool.query(
    `
    SELECT product_id, size, is_available, quantity
    FROM product_sizes
    WHERE product_id IN (?)
    ORDER BY id ASC
    `,
    [ids]
  );

  const [allColors] = await connectionOrPool.query(
    `
    SELECT product_id, name, hex_code
    FROM product_colors
    WHERE product_id IN (?)
    ORDER BY id ASC
    `,
    [ids]
  );

  const [allImages] = await connectionOrPool.query(
    `
    SELECT product_id, image_url
    FROM product_images
    WHERE product_id IN (?)
    ORDER BY id ASC
    `,
    [ids]
  );

  const sizesMap = {};
  const colorsMap = {};
  const imagesMap = {};

  allSizes.forEach((row) => {
    if (!sizesMap[row.product_id]) sizesMap[row.product_id] = [];
    sizesMap[row.product_id].push(formatSizeRow(row));
  });

  allColors.forEach((row) => {
    if (!colorsMap[row.product_id]) colorsMap[row.product_id] = [];
    colorsMap[row.product_id].push(formatColorRow(row));
  });

  allImages.forEach((row) => {
    if (!imagesMap[row.product_id]) imagesMap[row.product_id] = [];
    imagesMap[row.product_id].push(row.image_url);
  });

  return {
    sizesMap,
    colorsMap,
    imagesMap
  };
}

async function fetchProductById(connectionOrPool, id) {
  const [products] = await connectionOrPool.query(
    "SELECT * FROM products WHERE id = ?",
    [id]
  );

  if (products.length === 0) return null;

  const { sizesMap, colorsMap, imagesMap } = await getProductExtras(
    connectionOrPool,
    [id]
  );

  return formatProductRow(products[0], {
    sizes: sizesMap[id] || [],
    colors: colorsMap[id] || [],
    extraImages: imagesMap[id] || []
  });
}

async function replaceProductSizes(connection, productId, sizes) {
  await connection.query("DELETE FROM product_sizes WHERE product_id = ?", [
    productId
  ]);

  if (!Array.isArray(sizes)) return;

  for (const item of sizes) {
    const size = typeof item === "string" ? item : item.size || item.name;

    if (!size) continue;

    const quantity =
      typeof item === "object" ? toNumber(item.quantity, 0) : 0;

    const isAvailable =
      typeof item === "object"
        ? item.is_available ?? item.isAvailable ?? quantity > 0
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
      ON DUPLICATE KEY UPDATE
        is_available = VALUES(is_available),
        quantity = VALUES(quantity)
      `,
      [productId, size, toBoolean(isAvailable), quantity]
    );
  }
}

async function replaceProductColors(connection, productId, colors) {
  await connection.query("DELETE FROM product_colors WHERE product_id = ?", [
    productId
  ]);

  if (!Array.isArray(colors)) return;

  for (const item of colors) {
    const name = typeof item === "string" ? item : item.name || "Default";

    const hexCode =
      typeof item === "object"
        ? item.hex_code || item.hexCode || item.hex || "#000000"
        : "#000000";

    await connection.query(
      `
      INSERT INTO product_colors (
        product_id,
        name,
        hex_code
      )
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        hex_code = VALUES(hex_code)
      `,
      [productId, name, hexCode]
    );
  }
}

async function replaceProductImages(connection, productId, images) {
  await connection.query("DELETE FROM product_images WHERE product_id = ?", [
    productId
  ]);

  if (!Array.isArray(images)) return;

  for (const imageUrl of images) {
    if (!imageUrl) continue;

    await connection.query(
      `
      INSERT INTO product_images (
        product_id,
        image_url
      )
      VALUES (?, ?)
      `,
      [productId, imageUrl]
    );
  }
}

// =========================
// HEALTH CHECK
// =========================

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
      ORDER BY created_at DESC, id DESC
    `);

    const productIds = products.map((product) => product.id);

    const { sizesMap, colorsMap, imagesMap } = await getProductExtras(
      pool,
      productIds
    );

    const formattedProducts = products.map((product) =>
      formatProductRow(product, {
        sizes: sizesMap[product.id] || [],
        colors: colorsMap[product.id] || [],
        extraImages: imagesMap[product.id] || []
      })
    );

    res.json(formattedProducts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message
    });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await fetchProductById(pool, req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(product);
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

    await replaceProductSizes(connection, product.id, product.sizes);
    await replaceProductColors(connection, product.id, product.colors);
    await replaceProductImages(connection, product.id, product.images);

    await connection.commit();

    const savedProduct = await fetchProductById(pool, product.id);

    res.status(201).json(savedProduct);
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
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const product = normalizeProductBody({ ...req.body, id });

    await connection.beginTransaction();

    const [existing] = await connection.query(
      "SELECT id FROM products WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        message: "Product not found"
      });
    }

    await connection.query(
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

    if (hasOwn(req.body, "sizes")) {
      await replaceProductSizes(connection, id, product.sizes);
    }

    if (hasOwn(req.body, "colors")) {
      await replaceProductColors(connection, id, product.colors);
    }

    if (hasOwn(req.body, "images") || hasOwn(req.body, "extraImages")) {
      await replaceProductImages(connection, id, product.images);
    }

    await connection.commit();

    const savedProduct = await fetchProductById(pool, id);

    res.json(savedProduct);
  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      message: "Failed to update product",
      error: error.message
    });
  } finally {
    connection.release();
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
      ORDER BY created_at DESC, id DESC
    `);

    res.json(
      coupons.map((coupon) => ({
        ...coupon,
        discountPercent: Number(coupon.discount_percent || 0),
        discount_percent: Number(coupon.discount_percent || 0),
        isActive: toBoolean(coupon.is_active),
        is_active: toBoolean(coupon.is_active)
      }))
    );
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
      return res.status(404).json({
        message: "Invalid coupon"
      });
    }

    const coupon = coupons[0];

    res.json({
      ...coupon,
      discountPercent: Number(coupon.discount_percent || 0),
      discount_percent: Number(coupon.discount_percent || 0),
      isActive: toBoolean(coupon.is_active),
      is_active: toBoolean(coupon.is_active)
    });
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
        toBoolean(coupon.is_active)
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
        subtotal,
        discount_amount,
        coupon_code,
        total,
        shipping_area,
        shipping_cost,
        payment_method,
        transaction_id,
        payment_status,
        status,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        order.subtotal,
        order.discount_amount,
        order.coupon_code,
        order.total,
        order.shipping_area,
        order.shipping_cost,
        order.payment_method,
        order.transaction_id,
        order.payment_status,
        order.status,
        order.notes
      ]
    );

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
          toNumber(item.price, 0),
          toNumber(item.quantity, 1),
          item.size || null,
          item.color || null,
          item.image_url || item.imageUrl || item.image || null
        ]
      );
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