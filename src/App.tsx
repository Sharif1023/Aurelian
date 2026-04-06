/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar, Footer, MobileNav } from './components/Navigation';
import { BackToTop } from './components/BackToTop';
import Home from './screens/public/Home';
import Collection from './screens/public/Collection';
import ProductDetail from './screens/public/ProductDetail';
import Cart from './screens/public/Cart';
import Checkout from './screens/public/Checkout';
import Wishlist from './screens/public/Wishlist';
import SignIn from './screens/public/SignIn';
import TrackOrder from './screens/public/TrackOrder';
import AdminDashboard from './screens/admin/AdminDashboard';
import AdminProducts from './screens/admin/AdminProducts';
import AdminOrders from './screens/admin/AdminOrders';
import AdminCustomers from './screens/admin/AdminCustomers';
import AdminMarketing from './screens/admin/AdminMarketing';
import AdminSettings from './screens/admin/AdminSettings';
import AdminGuard from './components/AdminGuard';
import { useEffect } from 'react';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

import { Toaster } from 'react-hot-toast';

function AppContent() {
  const location = useLocation();
  const adminPath = localStorage.getItem('admin_path') || 'admin';
  const isAdmin = location.pathname.startsWith(`/${adminPath}`);
  const isAuth = location.pathname === '/signin';

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" />
      <ScrollToTop />
      <BackToTop />
      {!isAdmin && !isAuth && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/track-order" element={<TrackOrder />} />
          
          {/* Admin Routes with Guard */}
          <Route path={`/${adminPath}/*`} element={
            <AdminGuard>
              <Routes>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="marketing" element={<AdminMarketing />} />
                <Route path="settings" element={<AdminSettings />} />
              </Routes>
            </AdminGuard>
          } />
        </Routes>
      </main>
      {!isAdmin && !isAuth && <Footer />}
      {!isAdmin && !isAuth && <MobileNav />}
    </div>
  );
}

export default function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </ProductProvider>
  );
}

