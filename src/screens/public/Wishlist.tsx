import { Heart, ShoppingBag, Trash2, ChevronLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const { products, wishlist, toggleWishlist } = useProducts();
  const { addToCart } = useCart();

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  const handleAddToCart = (product: any) => {
    addToCart(
      product,
      1,
      product.sizes?.[0]?.size || 'M',
      product.colors?.[0]?.name || 'Default'
    );
    toast.success('Added to cart');
  };

  return (
    <main className="pt-24 pb-32 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex items-center gap-4 mb-12">
        <Link to="/" className="p-2 hover:bg-surface-low rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight">Your Wishlist</h1>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">
          {wishlistedProducts.length} Items
        </span>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-surface-low rounded-full flex items-center justify-center mb-6 text-on-surface-variant/20">
            <Heart className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold mb-2 uppercase tracking-tight">Your wishlist is empty</h2>
          <p className="text-on-surface-variant/60 text-sm max-w-xs mb-10">
            Save your favorite items to keep track of what you love.
          </p>
          <Link 
            to="/collection" 
            className="px-10 py-4 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:scale-105 transition-all active:scale-95 flex items-center gap-3"
          >
            Explore Collection
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
          <AnimatePresence mode="popLayout">
            {wishlistedProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group flex flex-col"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-surface-low mb-6">
                  <Link to={`/product/${product.id}`}>
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  </Link>
                  <button 
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all active:scale-90"
                  >
                    <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                  </button>
                </div>

                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-tight group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
                      {product.category}
                    </p>
                  </div>
                  <p className="font-headline font-bold">৳{product.price}</p>
                </div>

                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="flex-grow bg-black text-white py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black/90 transition-all active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <button 
                    onClick={() => toggleWishlist(product.id)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 transition-all active:scale-95"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </main>
  );
}
