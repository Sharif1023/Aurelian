# Aurelian Luxe - Premium Men's Fashion E-commerce

Aurelian Luxe is a high-end, production-ready e-commerce platform designed for curated men's luxury fashion. Built with a focus on elegance, performance, and ease of management, it provides a seamless shopping experience for customers and a powerful administrative interface for store owners.

## ✨ Key Features

### 🛍️ Customer Experience
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices.
- **Dynamic Catalog**: Browse products by categories (Shirts, Pants, Shoes, Accessories, etc.).
- **Wishlist**: Save favorite items to a persistent wishlist (stored locally).
- **Shopping Cart**: Intuitive cart management with real-time updates.
- **Streamlined Checkout**: Simplified checkout process with integrated local payment methods (bKash, Nagad).
- **Order Tracking**: Customers receive order numbers for tracking their purchases.
- **Promotions**: Support for discount coupons (e.g., WELCOME10, AURELIAN20).
- **Back to Top**: Smooth scroll button for easy navigation on long pages.

### 🛠️ Administrative Control
- **Brand Identity**: Change brand name, font (Playfair, Manrope, Inter), and signature color directly from the dashboard.
- **Dynamic Admin URL**: Enhance security by changing the admin dashboard path (e.g., `/portal` instead of `/admin`).
- **Secure Access**: Password-protected admin area with configurable credentials.
- **Product Management**: Add, update, or delete products with support for image uploads and size charts.
- **Order Management**: View and update order statuses (Pending, Processing, Shipped, Delivered, Cancelled).
- **Coupon Management**: Create and manage discount codes.
- **Home Page Customization**:
  - Update Hero section (Image, Badge, Title, Subtitle, Video URL).
  - Select and feature Best Sellers.
  - Manage Featured Collections (e.g., New Arrivals, Eid Collection).
  - Curate a Social Gallery ("As Seen On You").
- **Store Settings**:
  - Configure shipping rates for different regions.
  - Manage bKash and Nagad numbers for payments.
  - Dynamically add and manage social media links.

## 🗄️ Database Integration (XAMPP / MySQL)

This project currently uses `localStorage` for data persistence. To connect it to a real database using **XAMPP**, follow these steps:

### 1. Setup XAMPP
- Open **XAMPP Control Panel**.
- Start **Apache** and **MySQL**.
- Click the **Admin** button next to MySQL to open **phpMyAdmin**.

### 2. Import Database Schema
- In phpMyAdmin, create a new database named `aurelian_luxe`.
- Click on the **Import** tab.
- Choose the `database_schema.sql` file provided in the root of this project.
- Click **Go** to create all tables and insert demo data.

### 3. Connect Frontend to Backend
React cannot connect directly to MySQL for security reasons. You need a simple **Node.js/Express** backend.

#### Step A: Create a `server.js` file in your root folder:
```javascript
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Default XAMPP password is empty
  database: 'aurelian_luxe'
});

// Example API to get products
app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.listen(5000, () => console.log('Server running on port 5000'));
```

#### Step B: Update `src/context/ProductContext.tsx`
Replace the `localStorage` logic with `fetch` calls to your new API:
```typescript
// Inside ProductProvider useEffect
useEffect(() => {
  fetch('http://localhost:5000/api/products')
    .then(res => res.json())
    .then(data => setProducts(data));
}, []);
```

## 🚀 Tech Stack

- **Frontend**: [React 18+](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Navigation**: [React Router](https://reactrouter.com/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

## 💻 Local Development (VS Code)

To run this project locally on your computer using VS Code, follow these steps:

### 1. Prerequisites
- **Node.js**: Download and install it from [nodejs.org](https://nodejs.org/). (Choose the "LTS" version).
- **VS Code**: Download and install it from [code.visualstudio.com](https://code.visualstudio.com/).

### 2. Open the Project
- Extract the downloaded ZIP file.
- Open VS Code.
- Go to **File > Open Folder...** and select the project folder.

### 3. Install Dependencies
- Open the terminal in VS Code (**Terminal > New Terminal** or press `Ctrl + ` `).
- Type the following command and press Enter:
  ```bash
  npm install
  ```
  *This will download all the necessary libraries into a `node_modules` folder.*

### 4. Set Up Environment Variables (Optional)
- Rename `.env.example` to `.env`.
- If you have a Gemini API Key, add it to the `GEMINI_API_KEY` field.

### 5. Start the Development Server
- In the same terminal, type:
  ```bash
  npm run dev
  ```
- You will see a link like `http://localhost:3000`. **Ctrl + Click** the link to open the app in your browser.

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## 🔐 Admin Access

By default, the admin panel is accessible at:
- **URL**: `http://localhost:3000/admin`
- **Password**: `admin`

*Note: Both the path and password can be changed in the **Admin Settings > Security** tab.*

## 📄 License

This project is licensed under the MIT License.
