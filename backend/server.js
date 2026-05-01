const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

const app = express();

// =========================
// CONFIG
// =========================

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "CHANGE_THIS_SECRET_IN_ENV";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "sharuuco_test";
const DB_PORT = Number(process.env.DB_PORT || 3306);

if (JWT_SECRET === "CHANGE_THIS_SECRET_IN_ENV") {
  console.warn("WARNING: JWT_SECRET is not set in .env. Set a strong secret before production.");
}

const allowedOrigins = (process.env.CORS_ORIGINS ||
  "https://sharuu.com,https://www.sharuu.com,http://localhost:3000,http://localhost:5173")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server, Postman, mobile apps, and same-origin requests with no Origin header.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-setup-key"],
    credentials: true
  })
);

// Increased limit for uploaded/base64 product images.
app.use(express.json({ limit: process.env.JSON_LIMIT || "100mb" }));
app.use(express.urlencoded({ extended: true, limit: process.env.JSON_LIMIT || "100mb" }));

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  decimalNumbers: true
});

async function verifyDatabaseConnection() {
  try {
    await pool.query("SELECT 1");
    console.log(`Connected to MySQL database '${DB_NAME}' on ${DB_HOST}:${DB_PORT}`);
  } catch (error) {
    console.error("Unable to connect to MySQL:", error.message);
    process.exit(1);
  }
}

// =========================
// CONSTANTS
// =========================

const PRODUCT_STATUSES = ["Active", "Draft", "Archived"];
const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const PAYMENT_METHODS = ["COD", "Card", "bKash", "Nagad", "Upay"];
const PAYMENT_STATUSES = ["Unpaid", "Pending Verification", "Paid", "Failed", "Refunded"];
const ADMIN_ROLES = ["SuperAdmin", "Manager"];

// =========================
// HELPERS
// =========================

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

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

function generateId(prefix = "") {
  const id = crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, "").slice(0, 24)
    : crypto.randomBytes(12).toString("hex");

  return prefix ? `${prefix}_${id}` : id;
}

function money(value) {
  const numberValue = Number(value || 0);
  return Math.round((numberValue + Number.EPSILON) * 100) / 100;
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
  if (value === true || value === 1 || value === "1" || value === "true") return true;
  if (value === false || value === 0 || value === "0" || value === "false") return false;
  return Boolean(value);
}

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj || {}, key);
}

function uniqueCleanArray(items) {
  if (!Array.isArray(items)) return [];

  return Array.from(
    new Set(
      items
        .map(item => (typeof item === "string" ? item.trim() : item))
        .filter(Boolean)
    )
  );
}

function getBodyValue(body, existing, bodyKeys, existingKey, fallback = null) {
  for (const key of bodyKeys) {
    if (hasOwn(body, key)) return body[key];
  }

  if (existing && existing[existingKey] !== undefined) {
    return existing[existingKey];
  }

  return fallback;
}

function normalizeEnum(value, allowedValues, fallback) {
  if (!value) return fallback;

  const exact = allowedValues.find(item => item === value);
  if (exact) return exact;

  const lower = String(value).toLowerCase();
  const caseInsensitive = allowedValues.find(item => item.toLowerCase() === lower);

  return caseInsensitive || fallback;
}

function normalizePaymentMethod(value) {
  const raw = String(value || "COD").trim().toLowerCase();

  if (raw === "bkash" || raw === "b-kash" || raw === "b_kash") return "bKash";
  if (raw === "nagad") return "Nagad";
  if (raw === "upay") return "Upay";
  if (raw === "card" || raw === "sslcommerz" || raw === "online") return "Card";
  return "COD";
}

function sanitizeAdmin(admin) {
  if (!admin) return null;

  return {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
    isActive: toBoolean(admin.is_active),
    is_active: toBoolean(admin.is_active),
    lastLoginAt: admin.last_login_at,
    last_login_at: admin.last_login_at,
    created_at: admin.created_at,
    updated_at: admin.updated_at
  };
}

function createToken(admin) {
  return jwt.sign(
    {
      id: admin.id,
      username: admin.username,
      role: admin.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
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
    productCode: row.product_code,
    originalPrice:
      row.original_price === null || row.original_price === undefined
        ? undefined
        : Number(row.original_price),
    subCategory: row.sub_category || undefined,
    productDetails: row.product_details || "",
    sizeChart: sizeChart || undefined,
    extraImages: extras.extraImages || [],

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

function formatOrderItemRow(row) {
  return {
    ...row,
    productId: row.product_id,
    productName: row.product_name,
    imageUrl: row.image_url,
    product_id: row.product_id,
    product_name: row.product_name,
    image_url: row.image_url,
    price: Number(row.price || 0),
    quantity: Number(row.quantity || 0)
  };
}

function formatOrderRow(row, items = []) {
  return {
    ...row,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    discountAmount: Number(row.discount_amount || 0),
    couponCode: row.coupon_code,
    shippingArea: row.shipping_area,
    shippingCost: Number(row.shipping_cost || 0),
    paymentMethod: row.payment_method,
    transactionId: row.transaction_id,
    paymentStatus: row.payment_status,

    order_number: row.order_number,
    customer_name: row.customer_name,
    discount_amount: Number(row.discount_amount || 0),
    coupon_code: row.coupon_code,
    shipping_area: row.shipping_area,
    shipping_cost: Number(row.shipping_cost || 0),
    payment_method: row.payment_method,
    transaction_id: row.transaction_id,
    payment_status: row.payment_status,

    subtotal: Number(row.subtotal || 0),
    total: Number(row.total || 0),
    items
  };
}

function normalizeProductBody(body, existing = null) {
  const rawSizeChart = hasOwn(body, "size_chart_json")
    ? body.size_chart_json
    : hasOwn(body, "sizeChart")
      ? body.sizeChart
      : existing
        ? existing.size_chart_json
        : null;

  const rawImages = hasOwn(body, "images")
    ? body.images
    : hasOwn(body, "extraImages")
      ? body.extraImages
      : undefined;

  const rawColors = hasOwn(body, "colors") ? body.colors : undefined;
  const rawSizes = hasOwn(body, "sizes") ? body.sizes : undefined;

  return {
    id: body.id || existing?.id || generateId("prd"),

    product_code:
      body.product_code ||
      body.productCode ||
      existing?.product_code ||
      `SHR-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`,

    name: getBodyValue(body, existing, ["name"], "name", "Untitled Product"),
    price: money(getBodyValue(body, existing, ["price"], "price", 0)),

    original_price: toNullableNumber(
      getBodyValue(body, existing, ["original_price", "originalPrice"], "original_price", null)
    ),

    discount: toNullableNumber(getBodyValue(body, existing, ["discount"], "discount", null)),

    category: getBodyValue(body, existing, ["category"], "category", "Uncategorized"),

    sub_category: getBodyValue(
      body,
      existing,
      ["sub_category", "subCategory"],
      "sub_category",
      null
    ),

    image: getBodyValue(body, existing, ["image"], "image", ""),

    description: getBodyValue(body, existing, ["description"], "description", ""),

    product_details: getBodyValue(
      body,
      existing,
      ["product_details", "productDetails"],
      "product_details",
      ""
    ),

    rating: toNumber(getBodyValue(body, existing, ["rating"], "rating", 5), 5),
    reviews: toNumber(getBodyValue(body, existing, ["reviews"], "reviews", 0), 0),
    stock: toNumber(getBodyValue(body, existing, ["stock"], "stock", 0), 0),
    status: normalizeEnum(getBodyValue(body, existing, ["status"], "status", "Active"), PRODUCT_STATUSES, "Active"),
    size_chart_json: stringifyJsonValue(rawSizeChart),

    sizes: Array.isArray(rawSizes) ? rawSizes : undefined,
    colors: Array.isArray(rawColors) ? rawColors : undefined,
    images: Array.isArray(rawImages) ? uniqueCleanArray(rawImages) : undefined
  };
}

function normalizeCouponBody(body, existing = null) {
  const percent = toNumber(body.discount_percent ?? body.discountPercent ?? existing?.discount_percent, 0);

  return {
    id: body.id || existing?.id || generateId("cpn"),
    code: String(body.code || existing?.code || "").trim().toUpperCase(),
    discount_percent: Math.min(Math.max(percent, 0), 100),
    is_active: body.is_active ?? body.isActive ?? existing?.is_active ?? true
  };
}

function normalizeOrderBody(body) {
  return {
    id: body.id || generateId("ord"),
    order_number: body.order_number || body.orderNumber || null,

    customer_name: body.customer_name || body.customerName || body.name || "Guest Customer",
    email: body.email || "guest@example.com",
    phone: body.phone || "",
    address: body.address || "",
    city: body.city || "",
    zip: body.zip || "",

    coupon_code: body.coupon_code || body.couponCode || null,
    shipping_area: body.shipping_area || body.shippingArea || body.city || "",
    payment_method: normalizePaymentMethod(body.payment_method || body.paymentMethod),
    transaction_id: body.transaction_id || body.transactionId || null,
    notes: body.notes || null,

    items: Array.isArray(body.items) ? body.items : []
  };
}

function sendDbError(res, error, fallbackMessage) {
  console.error(fallbackMessage, error);

  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      success: false,
      message: "Duplicate value found",
      error: error.message
    });
  }

  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({
      success: false,
      message: "Referenced data not found",
      error: error.message
    });
  }

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
    error: error.message
  });
}

// =========================
// AUTH MIDDLEWARE
// =========================

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required"
      });
    }

    const payload = jwt.verify(token, JWT_SECRET);

    const [admins] = await pool.query(
      "SELECT * FROM admin_users WHERE id = ? AND is_active = TRUE LIMIT 1",
      [payload.id]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid or disabled admin account"
      });
    }

    req.admin = admins[0];
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
}

function requireSuperAdmin(req, res, next) {
  if (!req.admin || req.admin.role !== "SuperAdmin") {
    return res.status(403).json({
      success: false,
      message: "SuperAdmin access required"
    });
  }

  return next();
}

// =========================
// DB HELPERS
// =========================

async function getSettingValue(connectionOrPool, key) {
  const [settings] = await connectionOrPool.query(
    "SELECT setting_value FROM settings WHERE setting_key = ?",
    [key]
  );

  if (settings.length === 0) return null;
  return parseJsonValue(settings[0].setting_value);
}

async function getOrderPrefix(connectionOrPool) {
  const storeSettings = await getSettingValue(connectionOrPool, "store_settings");
  return storeSettings?.generalSettings?.orderPrefix || "SHR";
}

async function generateOrderNumber(connectionOrPool) {
  const prefix = await getOrderPrefix(connectionOrPool);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const number = `${prefix}-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const [existing] = await connectionOrPool.query(
      "SELECT id FROM orders WHERE order_number = ? LIMIT 1",
      [number]
    );

    if (existing.length === 0) return number;
  }

  return `${prefix}-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
}

async function getProductExtras(connectionOrPool, productIds) {
  const ids = productIds.filter(Boolean);

  if (ids.length === 0) {
    return { sizesMap: {}, colorsMap: {}, imagesMap: {} };
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

  allSizes.forEach(row => {
    if (!sizesMap[row.product_id]) sizesMap[row.product_id] = [];
    sizesMap[row.product_id].push(formatSizeRow(row));
  });

  allColors.forEach(row => {
    if (!colorsMap[row.product_id]) colorsMap[row.product_id] = [];
    colorsMap[row.product_id].push(formatColorRow(row));
  });

  allImages.forEach(row => {
    if (!imagesMap[row.product_id]) imagesMap[row.product_id] = [];
    imagesMap[row.product_id].push(row.image_url);
  });

  return { sizesMap, colorsMap, imagesMap };
}

async function fetchProductById(connectionOrPool, id) {
  const [products] = await connectionOrPool.query("SELECT * FROM products WHERE id = ?", [id]);
  if (products.length === 0) return null;

  const { sizesMap, colorsMap, imagesMap } = await getProductExtras(connectionOrPool, [id]);

  return formatProductRow(products[0], {
    sizes: sizesMap[id] || [],
    colors: colorsMap[id] || [],
    extraImages: imagesMap[id] || []
  });
}

async function replaceProductSizes(connection, productId, sizes) {
  await connection.query("DELETE FROM product_sizes WHERE product_id = ?", [productId]);
  if (!Array.isArray(sizes)) return;

  for (const item of sizes) {
    const size = typeof item === "string" ? item : item.size || item.name;
    if (!size) continue;

    const quantity = typeof item === "object" ? toNumber(item.quantity, 0) : 0;
    const isAvailable =
      typeof item === "object"
        ? item.is_available ?? item.isAvailable ?? quantity > 0
        : true;

    await connection.query(
      `
      INSERT INTO product_sizes (product_id, size, is_available, quantity)
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
  await connection.query("DELETE FROM product_colors WHERE product_id = ?", [productId]);
  if (!Array.isArray(colors)) return;

  for (const item of colors) {
    const name = typeof item === "string" ? item : item.name || "Default";
    const hexCode =
      typeof item === "object"
        ? item.hex_code || item.hexCode || item.hex || "#000000"
        : "#000000";

    await connection.query(
      `
      INSERT INTO product_colors (product_id, name, hex_code)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE hex_code = VALUES(hex_code)
      `,
      [productId, name, hexCode]
    );
  }
}

async function replaceProductImages(connection, productId, images) {
  await connection.query("DELETE FROM product_images WHERE product_id = ?", [productId]);

  const cleanImages = uniqueCleanArray(images);

  for (const imageUrl of cleanImages) {
    await connection.query(
      "INSERT INTO product_images (product_id, image_url) VALUES (?, ?)",
      [productId, imageUrl]
    );
  }
}

async function getOrderWithItems(connectionOrPool, id) {
  const [orders] = await connectionOrPool.query("SELECT * FROM orders WHERE id = ?", [id]);
  if (orders.length === 0) return null;

  const [items] = await connectionOrPool.query(
    "SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC",
    [id]
  );

  return formatOrderRow(orders[0], items.map(formatOrderItemRow));
}

async function attachItemsToOrders(connectionOrPool, orders) {
  if (orders.length === 0) return [];

  const orderIds = orders.map(order => order.id);
  const [items] = await connectionOrPool.query(
    "SELECT * FROM order_items WHERE order_id IN (?) ORDER BY id ASC",
    [orderIds]
  );

  const itemMap = {};
  items.forEach(item => {
    if (!itemMap[item.order_id]) itemMap[item.order_id] = [];
    itemMap[item.order_id].push(formatOrderItemRow(item));
  });

  return orders.map(order => formatOrderRow(order, itemMap[order.id] || []));
}

async function getShippingCost(connectionOrPool, shippingArea, city) {
  const storeSettings = await getSettingValue(connectionOrPool, "store_settings");

  const insideCost = Number(storeSettings?.shippingChittagong ?? 60);
  const outsideCost = Number(storeSettings?.shippingOutsideChittagong ?? 120);

  const area = String(shippingArea || city || "").toLowerCase();
  const isInsideChittagong =
    area.includes("chittagong") ||
    area.includes("ctg") ||
    area.includes("চট্টগ্রাম") ||
    area.includes("inside");

  return money(isInsideChittagong ? insideCost : outsideCost);
}

async function calculateOrderFromDb(connection, incomingOrder) {
  if (!incomingOrder.items || incomingOrder.items.length === 0) {
    const error = new Error("Order must include at least one item");
    error.statusCode = 400;
    throw error;
  }

  const calculatedItems = [];
  let subtotal = 0;

  for (const rawItem of incomingOrder.items) {
    const productId = rawItem.product_id || rawItem.productId || rawItem.id;
    const quantity = Math.max(1, toNumber(rawItem.quantity, 1));
    const size = rawItem.size || null;
    const color = rawItem.color || null;

    if (!productId) {
      const error = new Error("Every order item must include product_id/productId/id");
      error.statusCode = 400;
      throw error;
    }

    const [products] = await connection.query(
      "SELECT * FROM products WHERE id = ? AND status = 'Active' LIMIT 1 FOR UPDATE",
      [productId]
    );

    if (products.length === 0) {
      const error = new Error(`Product not found or inactive: ${productId}`);
      error.statusCode = 400;
      throw error;
    }

    const product = products[0];

    if (size) {
      const [sizes] = await connection.query(
        "SELECT * FROM product_sizes WHERE product_id = ? AND size = ? LIMIT 1 FOR UPDATE",
        [productId, size]
      );

      if (sizes.length === 0) {
        const error = new Error(`Size ${size} not found for product ${product.name}`);
        error.statusCode = 400;
        throw error;
      }

      if (!toBoolean(sizes[0].is_available) || Number(sizes[0].quantity || 0) < quantity) {
        const error = new Error(`Not enough stock for ${product.name} size ${size}`);
        error.statusCode = 400;
        throw error;
      }
    } else if (Number(product.stock || 0) < quantity) {
      const error = new Error(`Not enough stock for ${product.name}`);
      error.statusCode = 400;
      throw error;
    }

    const price = money(product.price);
    subtotal = money(subtotal + price * quantity);

    calculatedItems.push({
      product_id: product.id,
      product_name: product.name,
      price,
      quantity,
      size,
      color,
      image_url: rawItem.image_url || rawItem.imageUrl || rawItem.image || product.image || null
    });
  }

  let discountPercent = 0;
  let couponCode = incomingOrder.coupon_code
    ? String(incomingOrder.coupon_code).trim().toUpperCase()
    : null;

  if (couponCode) {
    const [coupons] = await connection.query(
      "SELECT * FROM coupons WHERE code = ? AND is_active = TRUE LIMIT 1",
      [couponCode]
    );

    if (coupons.length === 0) {
      const error = new Error("Invalid or inactive coupon code");
      error.statusCode = 400;
      throw error;
    }

    discountPercent = Number(coupons[0].discount_percent || 0);
  }

  const discountAmount = money((subtotal * discountPercent) / 100);
  const shippingCost = await getShippingCost(connection, incomingOrder.shipping_area, incomingOrder.city);
  const total = money(Math.max(subtotal - discountAmount, 0) + shippingCost);

  const paymentStatus =
    incomingOrder.payment_method === "COD"
      ? "Unpaid"
      : incomingOrder.transaction_id
        ? "Pending Verification"
        : "Unpaid";

  return {
    ...incomingOrder,
    order_number: incomingOrder.order_number || await generateOrderNumber(connection),
    subtotal,
    discount_amount: discountAmount,
    coupon_code: couponCode,
    shipping_cost: shippingCost,
    total,
    payment_status: paymentStatus,
    status: "Pending",
    items: calculatedItems
  };
}

async function reduceStockForOrderItems(connection, items) {
  for (const item of items) {
    if (item.size) {
      const [sizeResult] = await connection.query(
        `
        UPDATE product_sizes
        SET
          quantity = quantity - ?,
          is_available = CASE WHEN quantity - ? > 0 THEN TRUE ELSE FALSE END
        WHERE product_id = ? AND size = ? AND quantity >= ?
        `,
        [item.quantity, item.quantity, item.product_id, item.size, item.quantity]
      );

      if (sizeResult.affectedRows === 0) {
        const error = new Error(`Stock update failed for product ${item.product_id}, size ${item.size}`);
        error.statusCode = 400;
        throw error;
      }
    }

    const [productResult] = await connection.query(
      `
      UPDATE products
      SET stock = GREATEST(stock - ?, 0)
      WHERE id = ?
      `,
      [item.quantity, item.product_id]
    );

    if (productResult.affectedRows === 0) {
      const error = new Error(`Product stock update failed for ${item.product_id}`);
      error.statusCode = 400;
      throw error;
    }
  }
}

async function restoreStockForOrderItems(connection, items) {
  for (const item of items) {
    if (item.size) {
      await connection.query(
        `
        UPDATE product_sizes
        SET
          quantity = quantity + ?,
          is_available = TRUE
        WHERE product_id = ? AND size = ?
        `,
        [item.quantity, item.product_id, item.size]
      );
    }

    await connection.query(
      "UPDATE products SET stock = stock + ? WHERE id = ?",
      [item.quantity, item.product_id]
    );
  }
}

async function getRawOrderItems(connection, orderId) {
  const [items] = await connection.query(
    "SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC",
    [orderId]
  );

  return items;
}

// =========================
// HEALTH CHECK
// =========================

app.get("/api/health", asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT 1 AS ok");

  res.json({
    success: true,
    message: "Backend connected to MySQL",
    db: rows[0]
  });
}));

// =========================
// ADMIN AUTH
// =========================

app.post("/api/admin/setup", asyncHandler(async (req, res) => {
  const setupKey = process.env.ADMIN_SETUP_KEY;

  if (!setupKey || req.headers["x-setup-key"] !== setupKey) {
    return res.status(403).json({
      success: false,
      message: "ADMIN_SETUP_KEY required. Set ADMIN_SETUP_KEY in .env and send it as x-setup-key header."
    });
  }

  const username = String(req.body.username || "admin").trim();
  const email = String(req.body.email || "").trim() || null;
  const password = String(req.body.password || "");

  if (!password || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Admin password must be at least 8 characters"
    });
  }

  const [admins] = await pool.query("SELECT * FROM admin_users ORDER BY created_at ASC");
  const hasRealAdmin = admins.some(admin =>
    admin.password_hash && !admin.password_hash.includes("replace_this_with_real_bcrypt_hash")
  );

  if (hasRealAdmin) {
    return res.status(409).json({
      success: false,
      message: "Admin setup is already completed"
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = admins[0]?.id || generateId("adm");

  await pool.query(
    `
    INSERT INTO admin_users (id, username, email, password_hash, role, is_active)
    VALUES (?, ?, ?, ?, 'SuperAdmin', TRUE)
    ON DUPLICATE KEY UPDATE
      username = VALUES(username),
      email = VALUES(email),
      password_hash = VALUES(password_hash),
      role = 'SuperAdmin',
      is_active = TRUE
    `,
    [id, username, email, passwordHash]
  );

  const [savedAdmins] = await pool.query("SELECT * FROM admin_users WHERE id = ? LIMIT 1", [id]);
  const admin = savedAdmins[0];
  const token = createToken(admin);

  res.status(201).json({
    success: true,
    message: "Admin setup completed",
    token,
    admin: sanitizeAdmin(admin)
  });
}));

app.post("/api/admin/login", asyncHandler(async (req, res) => {
  const usernameOrEmail = String(req.body.username || req.body.email || "").trim();
  const password = String(req.body.password || "");

  if (!usernameOrEmail || !password) {
    return res.status(400).json({
      success: false,
      message: "Username/email and password are required"
    });
  }

  const [admins] = await pool.query(
    `
    SELECT *
    FROM admin_users
    WHERE (username = ? OR email = ?) AND is_active = TRUE
    LIMIT 1
    `,
    [usernameOrEmail, usernameOrEmail]
  );

  if (admins.length === 0) {
    return res.status(401).json({
      success: false,
      message: "Invalid login credentials"
    });
  }

  const admin = admins[0];

  let passwordMatches = false;
  try {
    passwordMatches = await bcrypt.compare(password, admin.password_hash);
  } catch {
    passwordMatches = false;
  }

  if (!passwordMatches) {
    return res.status(401).json({
      success: false,
      message: "Invalid login credentials"
    });
  }

  await pool.query("UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?", [admin.id]);

  const token = createToken(admin);

  res.json({
    success: true,
    token,
    admin: sanitizeAdmin({ ...admin, last_login_at: new Date() })
  });
}));

app.get("/api/admin/me", requireAuth, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    admin: sanitizeAdmin(req.admin)
  });
}));

app.put("/api/admin/password", requireAuth, asyncHandler(async (req, res) => {
  const currentPassword = String(req.body.currentPassword || req.body.current_password || "");
  const newPassword = String(req.body.newPassword || req.body.new_password || "");

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password of at least 8 characters are required"
    });
  }

  let passwordMatches = false;
  try {
    passwordMatches = await bcrypt.compare(currentPassword, req.admin.password_hash);
  } catch {
    passwordMatches = false;
  }

  if (!passwordMatches) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect"
    });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await pool.query("UPDATE admin_users SET password_hash = ? WHERE id = ?", [passwordHash, req.admin.id]);

  res.json({
    success: true,
    message: "Password updated successfully"
  });
}));

app.get("/api/admin/users", requireAuth, requireSuperAdmin, asyncHandler(async (req, res) => {
  const [admins] = await pool.query("SELECT * FROM admin_users ORDER BY created_at DESC");
  res.json(admins.map(sanitizeAdmin));
}));

app.post("/api/admin/users", requireAuth, requireSuperAdmin, asyncHandler(async (req, res) => {
  const username = String(req.body.username || "").trim();
  const email = String(req.body.email || "").trim() || null;
  const password = String(req.body.password || "");
  const role = normalizeEnum(req.body.role, ADMIN_ROLES, "Manager");

  if (!username || !password || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Username and password of at least 8 characters are required"
    });
  }

  const id = req.body.id || generateId("adm");
  const passwordHash = await bcrypt.hash(password, 10);

  await pool.query(
    `
    INSERT INTO admin_users (id, username, email, password_hash, role, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [id, username, email, passwordHash, role, toBoolean(req.body.is_active ?? req.body.isActive ?? true)]
  );

  const [admins] = await pool.query("SELECT * FROM admin_users WHERE id = ? LIMIT 1", [id]);
  res.status(201).json(sanitizeAdmin(admins[0]));
}));

app.put("/api/admin/users/:id", requireAuth, requireSuperAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [admins] = await pool.query("SELECT * FROM admin_users WHERE id = ? LIMIT 1", [id]);
  if (admins.length === 0) {
    return res.status(404).json({ success: false, message: "Admin user not found" });
  }

  const existing = admins[0];
  const username = req.body.username ?? existing.username;
  const email = req.body.email ?? existing.email;
  const role = normalizeEnum(req.body.role ?? existing.role, ADMIN_ROLES, existing.role);
  const isActive = req.body.is_active ?? req.body.isActive ?? existing.is_active;

  await pool.query(
    `
    UPDATE admin_users
    SET username = ?, email = ?, role = ?, is_active = ?
    WHERE id = ?
    `,
    [username, email, role, toBoolean(isActive), id]
  );

  const [savedAdmins] = await pool.query("SELECT * FROM admin_users WHERE id = ? LIMIT 1", [id]);
  res.json(sanitizeAdmin(savedAdmins[0]));
}));

app.delete("/api/admin/users/:id", requireAuth, requireSuperAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === req.admin.id) {
    return res.status(400).json({
      success: false,
      message: "You cannot delete your own admin account"
    });
  }

  await pool.query("DELETE FROM admin_users WHERE id = ?", [id]);
  res.json({ success: true, message: "Admin user deleted" });
}));

// =========================
// PRODUCTS
// =========================

app.get("/api/products", asyncHandler(async (req, res) => {
  const where = [];
  const params = [];

  if (req.query.status) {
    where.push("status = ?");
    params.push(normalizeEnum(req.query.status, PRODUCT_STATUSES, "Active"));
  }

  if (req.query.category) {
    where.push("category = ?");
    params.push(req.query.category);
  }

  if (req.query.sub_category || req.query.subCategory) {
    where.push("sub_category = ?");
    params.push(req.query.sub_category || req.query.subCategory);
  }

  if (req.query.search) {
    where.push("(name LIKE ? OR product_code LIKE ? OR category LIKE ?)");
    const like = `%${req.query.search}%`;
    params.push(like, like, like);
  }

  const sql = `
    SELECT *
    FROM products
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY created_at DESC, id DESC
  `;

  const [products] = await pool.query(sql, params);
  const productIds = products.map(product => product.id);
  const { sizesMap, colorsMap, imagesMap } = await getProductExtras(pool, productIds);

  const formattedProducts = products.map(product =>
    formatProductRow(product, {
      sizes: sizesMap[product.id] || [],
      colors: colorsMap[product.id] || [],
      extraImages: imagesMap[product.id] || []
    })
  );

  res.json(formattedProducts);
}));

app.get("/api/products/code/:code", asyncHandler(async (req, res) => {
  const [products] = await pool.query("SELECT * FROM products WHERE product_code = ? LIMIT 1", [req.params.code]);

  if (products.length === 0) {
    return res.status(404).json({ message: "Product not found" });
  }

  const product = await fetchProductById(pool, products[0].id);
  res.json(product);
}));

app.get("/api/products/:id", asyncHandler(async (req, res) => {
  const product = await fetchProductById(pool, req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
}));

app.post("/api/products", requireAuth, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const product = normalizeProductBody(req.body);

    if (!product.name || !product.image || product.price < 0) {
      return res.status(400).json({
        success: false,
        message: "Product name, image, and valid price are required"
      });
    }

    await connection.beginTransaction();

    await connection.query(
      `
      INSERT INTO products (
        id, product_code, name, price, original_price, discount, category,
        sub_category, image, description, product_details, rating, reviews,
        stock, status, size_chart_json
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

    await replaceProductSizes(connection, product.id, product.sizes || []);
    await replaceProductColors(connection, product.id, product.colors || []);
    await replaceProductImages(connection, product.id, product.images || []);

    await connection.commit();

    const savedProduct = await fetchProductById(pool, product.id);
    res.status(201).json(savedProduct);
  } catch (error) {
    await connection.rollback();
    sendDbError(res, error, "Failed to create product");
  } finally {
    connection.release();
  }
}));

app.put("/api/products/:id", requireAuth, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    const [existingProducts] = await connection.query("SELECT * FROM products WHERE id = ?", [id]);

    if (existingProducts.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Product not found" });
    }

    const existingProduct = existingProducts[0];
    const product = normalizeProductBody({ ...req.body, id }, existingProduct);

    await connection.query(
      `
      UPDATE products
      SET
        product_code = ?, name = ?, price = ?, original_price = ?, discount = ?,
        category = ?, sub_category = ?, image = ?, description = ?,
        product_details = ?, rating = ?, reviews = ?, stock = ?, status = ?,
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
      await replaceProductSizes(connection, id, product.sizes || []);
    }

    if (hasOwn(req.body, "colors")) {
      await replaceProductColors(connection, id, product.colors || []);
    }

    if (hasOwn(req.body, "images") || hasOwn(req.body, "extraImages")) {
      await replaceProductImages(connection, id, product.images || []);
    }

    await connection.commit();

    const savedProduct = await fetchProductById(pool, id);
    res.json(savedProduct);
  } catch (error) {
    await connection.rollback();
    sendDbError(res, error, "Failed to update product");
  } finally {
    connection.release();
  }
}));

app.delete("/api/products/:id", requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM products WHERE id = ?", [id]);

  res.json({
    success: true,
    message: "Product deleted"
  });
}));

// =========================
// COUPONS
// =========================

app.get("/api/coupons", requireAuth, asyncHandler(async (req, res) => {
  const [coupons] = await pool.query("SELECT * FROM coupons ORDER BY created_at DESC, id DESC");

  res.json(
    coupons.map(coupon => ({
      ...coupon,
      discountPercent: Number(coupon.discount_percent || 0),
      discount_percent: Number(coupon.discount_percent || 0),
      isActive: toBoolean(coupon.is_active),
      is_active: toBoolean(coupon.is_active)
    }))
  );
}));

app.get("/api/coupons/:code", asyncHandler(async (req, res) => {
  const code = String(req.params.code || "").trim().toUpperCase();

  const [coupons] = await pool.query(
    "SELECT * FROM coupons WHERE code = ? AND is_active = TRUE LIMIT 1",
    [code]
  );

  if (coupons.length === 0) {
    return res.status(404).json({ message: "Invalid coupon" });
  }

  const coupon = coupons[0];

  res.json({
    ...coupon,
    discountPercent: Number(coupon.discount_percent || 0),
    discount_percent: Number(coupon.discount_percent || 0),
    isActive: toBoolean(coupon.is_active),
    is_active: toBoolean(coupon.is_active)
  });
}));

app.post("/api/coupons", requireAuth, asyncHandler(async (req, res) => {
  const coupon = normalizeCouponBody(req.body);

  if (!coupon.code) {
    return res.status(400).json({ message: "Coupon code is required" });
  }

  await pool.query(
    "INSERT INTO coupons (id, code, discount_percent, is_active) VALUES (?, ?, ?, ?)",
    [coupon.id, coupon.code, coupon.discount_percent, toBoolean(coupon.is_active)]
  );

  const [savedCoupon] = await pool.query("SELECT * FROM coupons WHERE id = ?", [coupon.id]);
  res.status(201).json(savedCoupon[0]);
}));

app.put("/api/coupons/:id", requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existingCoupons] = await pool.query("SELECT * FROM coupons WHERE id = ? LIMIT 1", [id]);
  if (existingCoupons.length === 0) {
    return res.status(404).json({ message: "Coupon not found" });
  }

  const coupon = normalizeCouponBody(req.body, existingCoupons[0]);

  if (!coupon.code) {
    return res.status(400).json({ message: "Coupon code is required" });
  }

  await pool.query(
    `
    UPDATE coupons
    SET code = ?, discount_percent = ?, is_active = ?
    WHERE id = ?
    `,
    [coupon.code, coupon.discount_percent, toBoolean(coupon.is_active), id]
  );

  const [savedCoupon] = await pool.query("SELECT * FROM coupons WHERE id = ?", [id]);
  res.json(savedCoupon[0]);
}));

app.delete("/api/coupons/:id", requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM coupons WHERE id = ?", [id]);

  res.json({
    success: true,
    message: "Coupon deleted"
  });
}));

// =========================
// SETTINGS
// =========================

app.get("/api/settings", requireAuth, asyncHandler(async (req, res) => {
  const [settings] = await pool.query("SELECT * FROM settings ORDER BY setting_key ASC");

  const output = {};
  settings.forEach(setting => {
    output[setting.setting_key] = parseJsonValue(setting.setting_value);
  });

  res.json(output);
}));

app.get("/api/settings/:key", asyncHandler(async (req, res) => {
  const { key } = req.params;
  const value = await getSettingValue(pool, key);

  if (value === null) {
    return res.status(404).json({ message: "Settings not found" });
  }

  res.json(value);
}));

app.put("/api/settings/:key", requireAuth, asyncHandler(async (req, res) => {
  const { key } = req.params;

  // Handle plain string values for simple settings like admin_path
  let value;
  if (typeof req.body === 'string') {
    value = JSON.stringify(req.body);
  } else if (typeof req.body === 'object' && req.body !== null) {
    value = JSON.stringify(req.body);
  } else {
    value = JSON.stringify(req.body || null);
  }

  await pool.query(
    `
    INSERT INTO settings (setting_key, setting_value)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    `,
    [key, value]
  );

  res.json(req.body);
}));

// =========================
// ORDERS
// =========================

app.get("/api/orders", requireAuth, asyncHandler(async (req, res) => {
  const where = [];
  const params = [];

  if (req.query.status) {
    where.push("status = ?");
    params.push(normalizeEnum(req.query.status, ORDER_STATUSES, "Pending"));
  }

  if (req.query.payment_status || req.query.paymentStatus) {
    where.push("payment_status = ?");
    params.push(normalizeEnum(req.query.payment_status || req.query.paymentStatus, PAYMENT_STATUSES, "Unpaid"));
  }

  if (req.query.search) {
    where.push("(order_number LIKE ? OR customer_name LIKE ? OR email LIKE ? OR phone LIKE ?)");
    const like = `%${req.query.search}%`;
    params.push(like, like, like, like);
  }

  const [orders] = await pool.query(
    `
    SELECT *
    FROM orders
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY created_at DESC
    `,
    params
  );

  const includeItems = String(req.query.includeItems || "true") !== "false";
  if (!includeItems) return res.json(orders.map(order => formatOrderRow(order, [])));

  const ordersWithItems = await attachItemsToOrders(pool, orders);
  res.json(ordersWithItems);
}));

app.get("/api/orders/:id", requireAuth, asyncHandler(async (req, res) => {
  const order = await getOrderWithItems(pool, req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json(order);
}));

app.post("/api/orders", asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const incomingOrder = normalizeOrderBody(req.body);

    if (!incomingOrder.phone || !incomingOrder.address) {
      return res.status(400).json({
        success: false,
        message: "Phone and address are required"
      });
    }

    await connection.beginTransaction();

    const order = await calculateOrderFromDb(connection, incomingOrder);

    await connection.query(
      `
      INSERT INTO orders (
        id, order_number, customer_name, email, phone, address, city, zip,
        subtotal, discount_amount, coupon_code, total, shipping_area,
        shipping_cost, payment_method, transaction_id, payment_status,
        status, notes
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
          order_id, product_id, product_name, price, quantity, size, color, image_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          order.id,
          item.product_id,
          item.product_name,
          item.price,
          item.quantity,
          item.size,
          item.color,
          item.image_url
        ]
      );
    }

    await reduceStockForOrderItems(connection, order.items);
    await connection.commit();

    const savedOrder = await getOrderWithItems(pool, order.id);
    res.status(201).json(savedOrder);
  } catch (error) {
    await connection.rollback();

    const statusCode = error.statusCode || 500;
    if (statusCode !== 500) {
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }

    sendDbError(res, error, "Failed to create order");
  } finally {
    connection.release();
  }
}));

app.put("/api/orders/:id/status", requireAuth, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const nextStatus = normalizeEnum(req.body.status, ORDER_STATUSES, null);

    if (!nextStatus) {
      return res.status(400).json({ message: "Valid status is required" });
    }

    await connection.beginTransaction();

    const [orders] = await connection.query("SELECT * FROM orders WHERE id = ? LIMIT 1 FOR UPDATE", [id]);
    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    const currentOrder = orders[0];
    const items = await getRawOrderItems(connection, id);

    if (currentOrder.status !== "Cancelled" && nextStatus === "Cancelled") {
      await restoreStockForOrderItems(connection, items);
    }

    if (currentOrder.status === "Cancelled" && nextStatus !== "Cancelled") {
      await reduceStockForOrderItems(connection, items);
    }

    await connection.query("UPDATE orders SET status = ? WHERE id = ?", [nextStatus, id]);
    await connection.commit();

    const savedOrder = await getOrderWithItems(pool, id);
    res.json(savedOrder);
  } catch (error) {
    await connection.rollback();
    sendDbError(res, error, "Failed to update order status");
  } finally {
    connection.release();
  }
}));

app.put("/api/orders/:id/payment-status", requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const paymentStatus = normalizeEnum(
    req.body.payment_status || req.body.paymentStatus,
    PAYMENT_STATUSES,
    null
  );

  if (!paymentStatus) {
    return res.status(400).json({ message: "Valid payment status is required" });
  }

  await pool.query(
    `
    UPDATE orders
    SET payment_status = ?, transaction_id = COALESCE(?, transaction_id)
    WHERE id = ?
    `,
    [paymentStatus, req.body.transaction_id || req.body.transactionId || null, id]
  );

  const savedOrder = await getOrderWithItems(pool, id);
  if (!savedOrder) return res.status(404).json({ message: "Order not found" });

  res.json(savedOrder);
}));

app.put("/api/orders/:id", requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [orders] = await pool.query("SELECT * FROM orders WHERE id = ? LIMIT 1", [id]);
  if (orders.length === 0) return res.status(404).json({ message: "Order not found" });

  const existing = orders[0];

  const paymentMethod = req.body.payment_method || req.body.paymentMethod
    ? normalizePaymentMethod(req.body.payment_method || req.body.paymentMethod)
    : existing.payment_method;

  const paymentStatus = req.body.payment_status || req.body.paymentStatus
    ? normalizeEnum(req.body.payment_status || req.body.paymentStatus, PAYMENT_STATUSES, existing.payment_status)
    : existing.payment_status;

  const status = req.body.status
    ? normalizeEnum(req.body.status, ORDER_STATUSES, existing.status)
    : existing.status;

  await pool.query(
    `
    UPDATE orders
    SET
      customer_name = ?, email = ?, phone = ?, address = ?, city = ?, zip = ?,
      payment_method = ?, transaction_id = ?, payment_status = ?, status = ?, notes = ?
    WHERE id = ?
    `,
    [
      req.body.customer_name || req.body.customerName || existing.customer_name,
      req.body.email || existing.email,
      req.body.phone || existing.phone,
      req.body.address || existing.address,
      req.body.city || existing.city,
      req.body.zip || existing.zip,
      paymentMethod,
      req.body.transaction_id || req.body.transactionId || existing.transaction_id,
      paymentStatus,
      status,
      hasOwn(req.body, "notes") ? req.body.notes : existing.notes,
      id
    ]
  );

  const savedOrder = await getOrderWithItems(pool, id);
  res.json(savedOrder);
}));

app.delete("/api/orders/:id", requireAuth, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const shouldRestoreStock = String(req.query.restoreStock || "false") === "true";

    await connection.beginTransaction();

    if (shouldRestoreStock) {
      const items = await getRawOrderItems(connection, id);
      await restoreStockForOrderItems(connection, items);
    }

    await connection.query("DELETE FROM orders WHERE id = ?", [id]);
    await connection.commit();

    res.json({
      success: true,
      message: "Order deleted"
    });
  } catch (error) {
    await connection.rollback();
    sendDbError(res, error, "Failed to delete order");
  } finally {
    connection.release();
  }
}));

// =========================
// ADMIN DASHBOARD
// =========================

app.get("/api/admin/dashboard", requireAuth, asyncHandler(async (req, res) => {
  const [[productStats]] = await pool.query("SELECT COUNT(*) AS totalProducts, COALESCE(SUM(stock), 0) AS totalStock FROM products");
  const [[orderStats]] = await pool.query("SELECT COUNT(*) AS totalOrders, COALESCE(SUM(total), 0) AS totalRevenue FROM orders");
  const [[pendingOrders]] = await pool.query("SELECT COUNT(*) AS pendingOrders FROM orders WHERE status = 'Pending'");
  const [[lowStock]] = await pool.query("SELECT COUNT(*) AS lowStockProducts FROM products WHERE stock <= 5");
  const [[couponStats]] = await pool.query("SELECT COUNT(*) AS totalCoupons FROM coupons");

  res.json({
    totalProducts: Number(productStats.totalProducts || 0),
    totalStock: Number(productStats.totalStock || 0),
    totalOrders: Number(orderStats.totalOrders || 0),
    totalRevenue: Number(orderStats.totalRevenue || 0),
    pendingOrders: Number(pendingOrders.pendingOrders || 0),
    lowStockProducts: Number(lowStock.lowStockProducts || 0),
    totalCoupons: Number(couponStats.totalCoupons || 0)
  });
}));

app.get("/api/customers", requireAuth, asyncHandler(async (req, res) => {
  const [customers] = await pool.query(
    `
    SELECT
      LOWER(email) AS email,
      phone,
      SUBSTRING_INDEX(
        GROUP_CONCAT(customer_name ORDER BY created_at DESC SEPARATOR '||'),
        '||',
        1
      ) AS customer_name,
      COUNT(*) AS total_orders,
      COALESCE(SUM(total), 0) AS total_spent,
      MAX(created_at) AS last_order_at
    FROM orders
    WHERE COALESCE(email, '') <> '' AND COALESCE(phone, '') <> ''
    GROUP BY LOWER(email), phone
    ORDER BY last_order_at DESC
    `
  );

  res.json(
    customers.map(customer => ({
      id: `${customer.email}::${customer.phone}`,
      name: customer.customer_name || "Guest Customer",
      email: customer.email,
      phone: customer.phone,
      totalOrders: Number(customer.total_orders || 0),
      totalSpent: Number(customer.total_spent || 0),
      lastOrderAt: customer.last_order_at,
      status: Number(customer.total_orders || 0) > 0 ? "Active" : "Inactive"
    }))
  );
}));

// =========================
// 404 + ERROR HANDLER
// =========================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error);

  if (error.message && error.message.startsWith("CORS blocked")) {
    return res.status(403).json({
      success: false,
      message: error.message
    });
  }

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error"
  });
});

verifyDatabaseConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(() => {
    process.exit(1);
  });