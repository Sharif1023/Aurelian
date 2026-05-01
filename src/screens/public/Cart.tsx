import { Trash2, Minus, Plus, Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart();
  const { storeSettings } = useProducts();
  const finalTotal = subtotal;

  return (
    <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-end mb-12">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight">Your Cart</h1>
        <Link to="/collection" className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 hover:underline underline-offset-4">
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-10">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => (
                <motion.div
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col md:flex-row gap-6 pb-10 border-b border-outline-variant/30"
                >
                  <div className="w-full md:w-32 aspect-[4/5] bg-surface-low overflow-hidden rounded-xl">
                    <img className="w-full h-full object-cover" src={item.image} alt={item.name} referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold uppercase tracking-wide">{item.name}</h3>
                        <p className="text-on-surface-variant text-sm mt-1">
                          {item.selectedColor || 'Default'} / {item.selectedSize || 'One Size'}
                        </p>
                      </div>
                      <p className="font-headline font-semibold text-lg">৳{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                      <div className="flex items-center bg-surface-low rounded-full px-4 py-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                          className="hover:opacity-50 transition-opacity p-1"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="mx-6 font-medium w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                          className="hover:opacity-50 transition-opacity p-1"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                        className="text-on-surface-variant hover:text-red-600 transition-colors p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-surface-low p-8 rounded-2xl sticky top-24">
              <h2 className="text-xl font-bold mb-8 tracking-tight">Order Summary</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span>৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Shipping</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest">Calculated at checkout</span>
                </div>
                <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                  <span className="text-lg font-bold">Total</span>
                  <span className="font-headline text-2xl font-black">৳{finalTotal.toFixed(2)}</span>
                </div>
              </div>
              {/* Primary CTA */}
              <Link
                to="/checkout"
                className="w-full bg-primary text-white py-5 rounded-full font-bold uppercase tracking-[0.2em] shadow-lg hover:shadow-xl transition-all active:scale-95 mb-6 text-center block"
              >
                Proceed to Checkout
              </Link>
              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-6 pt-4 grayscale opacity-40">
                {['Visa', 'Mastercard', 'PayPal', 'Apple Pay'].map((p) => (
                  <span key={p} className="text-[10px] font-bold uppercase tracking-widest">{p}</span>
                ))}
              </div>
              <div className="mt-4 text-center">
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant flex items-center justify-center gap-1 font-medium">
                  <Lock className="w-3 h-3" />
                  Secure encrypted checkout
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-32 text-center">
          <p className="text-on-surface-variant font-light italic mb-8">Your cart is currently empty.</p>
          <Link
            to="/collection"
            className="px-12 py-5 bg-primary text-white rounded-full font-bold uppercase tracking-[0.2em] shadow-lg hover:opacity-90 transition-opacity inline-block"
          >
            Explore Collection
          </Link>
        </div>
      )}
    </main>
  );
}
