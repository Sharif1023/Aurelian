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

## 🗄️ Database & API (Local Hosting)

This project already includes a full backend in `backend/server.js` and uses MySQL for persistence.

### 1. Create and import the database
- Create a MySQL database (for example: `sharuuco_test`).
- Import `database_schema.sql` into that database using phpMyAdmin or MySQL CLI.

### 2. Configure backend environment
- Copy `backend/.env.example` to `backend/.env`.
- Set database credentials (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
- Set a strong `JWT_SECRET`.

### 3. Configure frontend environment
- Copy `.env.example` to `.env`.
- For local development, keep:
  - `VITE_API_URL=/api`
  - `VITE_API_PROXY_TARGET=http://localhost:5000`

### 4. Start backend and frontend
- Backend:
  ```bash
  cd backend
  npm install
  npm start
  ```
- Frontend (new terminal):
  ```bash
  npm install
  npm run dev
  ```

### 5. Verify connection
- Backend health check: `http://localhost:5000/api/health`
- Through frontend proxy: `http://localhost:3000/api/health`

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
