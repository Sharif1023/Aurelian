import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Star, Check, Heart } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function Collection() {
  const { products, wishlist, toggleWishlist } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';
  
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  const displayCategory = hoveredCategory || activeCategory;

  useEffect(() => {
    setActiveCategory(categoryParam);
    setActiveSubCategory('All');
  }, [categoryParam]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setActiveSubCategory('All');
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return ['All', ...cats];
  }, [products]);

  const subCategories = useMemo(() => {
    if (!hoveredCategory || hoveredCategory === 'All') return [];
    const subs = Array.from(new Set(
      products
        .filter(p => p.category === hoveredCategory && p.subCategory)
        .map(p => p.subCategory as string)
    ));
    return subs;
  }, [hoveredCategory, products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchesSubCategory = activeSubCategory === 'All' || product.subCategory === activeSubCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSubCategory && matchesSearch;
    });
  }, [activeCategory, activeSubCategory, searchQuery, products]);

  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
    addToCart(product, 1);
  };

  return (
    <main className="pt-24 pb-32 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Search & Editorial Header */}
      <section className="mb-12 relative" onMouseLeave={() => setHoveredCategory(null)}>
        <nav className="flex gap-3 overflow-x-auto no-scrollbar pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 mb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              onMouseEnter={() => setHoveredCategory(cat)}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all border ${
                activeCategory === cat 
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                  : 'bg-surface-low text-on-surface border-outline-variant/10 hover:bg-surface-lowest'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>

        <AnimatePresence>
          {hoveredCategory && subCategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[calc(100%-1.5rem)] left-0 min-w-[200px] bg-white/95 backdrop-blur-xl z-50 py-6 px-6 border border-outline-variant/10 shadow-2xl rounded-2xl"
            >
              <div className="flex flex-col items-start gap-2">
                  {subCategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => {
                        setActiveCategory(hoveredCategory);
                        setActiveSubCategory(sub);
                        searchParams.set('category', hoveredCategory);
                        setSearchParams(searchParams);
                        setHoveredCategory(null);
                      }}
                      className={cn(
                        "px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all border",
                        activeSubCategory === sub && activeCategory === hoveredCategory
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-surface-low text-on-surface-variant border-outline-variant/5 hover:border-primary/30 hover:bg-white"
                      )}
                    >
                      {sub}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setActiveCategory(hoveredCategory);
                      setActiveSubCategory('All');
                      searchParams.set('category', hoveredCategory);
                      setSearchParams(searchParams);
                      setHoveredCategory(null);
                    }}
                    className={cn(
                      "px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all border mt-2",
                      activeSubCategory === 'All' && activeCategory === hoveredCategory
                        ? "bg-primary text-white border-primary shadow-md"
                        : "bg-primary/5 text-primary border-primary/10 hover:bg-primary/10"
                    )}
                  >
                    View All {hoveredCategory}
                  </button>
                </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative group mt-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 w-5 h-5" />
          <input
            className="w-full bg-surface-low border-none rounded-xl py-4 pl-12 pr-4 focus:ring-1 focus:ring-outline-variant/20 transition-all placeholder:text-on-surface-variant/40 outline-none"
            placeholder="Search our archives..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Filter & Sort Bar */}
      <section className="flex items-center justify-between mb-8 gap-4 sticky top-16 bg-surface/90 backdrop-blur-md z-40 py-4">
        <button className="flex items-center gap-2 bg-surface-lowest px-6 py-2.5 rounded-full shadow-sm hover:shadow-md transition-shadow active:scale-95">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium uppercase tracking-wider">Filter</span>
        </button>
        <div className="flex items-center gap-2 bg-surface-lowest px-6 py-2.5 rounded-full shadow-sm">
          <span className="text-sm font-medium uppercase tracking-wider text-on-surface-variant/60">Sort:</span>
          <select className="bg-transparent border-none p-0 text-sm font-semibold focus:ring-0 cursor-pointer outline-none">
            <option>Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest</option>
          </select>
        </div>
      </section>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product, i) => (
            <motion.article
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              className="group relative"
            >
              <Link to={`/product/${product.id}`}>
                <div className="aspect-[4/5] overflow-hidden rounded-xl bg-surface-low mb-4 relative">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                  />
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className={cn(
                      "absolute top-4 left-4 p-2 rounded-full transition-all shadow-lg active:scale-90 z-10",
                      wishlist.includes(product.id)
                        ? "bg-white text-red-500 opacity-100" 
                        : "bg-surface-lowest/80 backdrop-blur-md text-primary opacity-0 group-hover:opacity-100"
                    )}
                  >
                    <Heart className={cn("w-5 h-5", wishlist.includes(product.id) && "fill-current")} />
                  </button>
                  <button 
                    onClick={(e) => handleQuickAdd(e, product)}
                    className={cn(
                      "absolute top-4 right-4 p-2 rounded-full transition-all shadow-lg active:scale-90 z-10",
                      addedToCart === product.id 
                        ? "bg-green-500 text-white opacity-100" 
                        : "bg-surface-lowest/80 backdrop-blur-md text-primary opacity-0 group-hover:opacity-100"
                    )}
                  >
                    {addedToCart === product.id ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-medium">
                    {product.category}
                  </p>
                  <h3 className="text-base font-medium text-on-surface">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-headline text-lg font-bold text-primary">৳{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-on-surface-variant/40 line-through">৳{product.originalPrice}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 text-secondary">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn("w-3 h-3", i < Math.floor(product.rating) ? "fill-current" : "text-on-surface-variant/20")}
                      />
                    ))}
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-32 text-center">
          <p className="text-on-surface-variant font-light italic">No pieces found matching your criteria.</p>
          <button 
            onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
            className="mt-4 text-primary font-bold uppercase tracking-widest text-xs underline underline-offset-4"
          >
            Clear all filters
          </button>
        </div>
      )}
    </main>
  );
}
