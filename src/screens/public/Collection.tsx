import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Filter, ShoppingCart, Star, Check, Heart } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function Collection() {
  const { products, wishlist, toggleWishlist } = useProducts();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get('category') || 'All';

  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Featured');
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const [dropdownLeft, setDropdownLeft] = useState(0);

  const navRef = useRef<HTMLDivElement | null>(null);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    setActiveCategory(categoryParam);
    setActiveSubCategory('All');
  }, [categoryParam]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setActiveSubCategory('All');

    const nextParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', cat);
    }
    setSearchParams(nextParams);
  };

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ['All', ...cats];
  }, [products]);

  const getSubCategoriesByCategory = (category: string) => {
    if (!category || category === 'All') return [];

    return Array.from(
      new Set(
        products
          .filter((p) => p.category === category && p.subCategory)
          .map((p) => p.subCategory as string)
      )
    );
  };

  const hoveredSubCategories = useMemo(() => {
    if (!hoveredCategory) return [];
    return getSubCategoriesByCategory(hoveredCategory);
  }, [hoveredCategory, products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesCategory =
        activeCategory === 'All' || product.category === activeCategory;

      const matchesSubCategory =
        activeSubCategory === 'All' || product.subCategory === activeSubCategory;

      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.subCategory || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSubCategory && matchesSearch;
    });

    if (sortBy === 'Price: Low to High') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Newest') {
      result = [...result].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return result;
  }, [activeCategory, activeSubCategory, searchQuery, sortBy, products]);

  const handleQuickAdd = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
    addToCart(product, 1);
  };

  const handleSubCategorySelect = (category: string, subCategory: string) => {
    setActiveCategory(category);
    setActiveSubCategory(subCategory);

    const nextParams = new URLSearchParams(searchParams);
    if (category === 'All') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', category);
    }
    setSearchParams(nextParams);

    setHoveredCategory(null);
  };

  const updateDropdownPosition = (cat: string) => {
    const navEl = navRef.current;
    const catEl = categoryRefs.current[cat];

    if (!navEl || !catEl) return;

    const navRect = navEl.getBoundingClientRect();
    const catRect = catEl.getBoundingClientRect();

    setDropdownLeft(catRect.left - navRect.left);
  };

  return (
    <main className="pt-24 pb-32 max-w-7xl mx-auto px-4 sm:px-6">
      <section
        className="mb-12"
        onMouseLeave={() => setHoveredCategory(null)}
      >
        <div ref={navRef} className="relative">
          {/* Category Nav */}
          <nav className="flex gap-2 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <div
                key={cat}
                ref={(el) => {
                  categoryRefs.current[cat] = el;
                }}
                className="shrink-0"
                onMouseEnter={() => {
                  setHoveredCategory(cat);
                  updateDropdownPosition(cat);
                }}
              >
                <button
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    "whitespace-nowrap px-4 sm:px-6 py-2 text-sm font-medium transition-colors",
                    activeCategory === cat
                      ? "text-[#c89b6d]"
                      : "text-black hover:text-[#c89b6d]"
                  )}
                >
                  {cat}
                </button>
              </div>
            ))}
          </nav>

          {/* Subcategory dropdown just below category nav */}
          <div className="relative h-[56px]">
            <AnimatePresence>
              {hoveredCategory && hoveredSubCategories.length > 0 && (
                <motion.div
                  key={hoveredCategory}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.18 }}
                  style={{ left: dropdownLeft }}
                  className="absolute top-0 z-50 min-w-[170px] max-w-[210px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md"
                >
                  {hoveredSubCategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => handleSubCategorySelect(hoveredCategory, sub)}
                      className="block w-full border-b border-gray-200 px-4 py-2 text-left text-sm text-black hover:bg-gray-50 last:border-b-0"
                    >
                      {sub}
                    </button>
                  ))}

                  <button
                    onClick={() => handleSubCategorySelect(hoveredCategory, 'All')}
                    className="block w-full px-4 py-2 text-left text-sm font-medium text-[#c89b6d] hover:bg-gray-50"
                  >
                    View All
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Search Box */}
        <div className="relative group mt-2">
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
          <span className="text-sm font-medium uppercase tracking-wider text-on-surface-variant/60">
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border-none p-0 text-sm font-semibold focus:ring-0 cursor-pointer outline-none"
          >
            <option value="Featured">Featured</option>
            <option value="Price: Low to High">Price: Low to High</option>
            <option value="Price: High to Low">Price: High to Low</option>
            <option value="Newest">Newest</option>
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
                    <Heart
                      className={cn(
                        "w-5 h-5",
                        wishlist.includes(product.id) && "fill-current"
                      )}
                    />
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
                    {addedToCart === product.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <ShoppingCart className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-medium">
                    {product.category}
                    {product.subCategory ? ` • ${product.subCategory}` : ''}
                  </p>

                  <h3 className="text-base font-medium text-on-surface">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-headline text-lg font-bold text-primary">
                      ৳{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-on-surface-variant/40 line-through">
                        ৳{product.originalPrice}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 text-secondary">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-3 h-3",
                          i < Math.floor(product.rating)
                            ? "fill-current"
                            : "text-on-surface-variant/20"
                        )}
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
          <p className="text-on-surface-variant font-light italic">
            No pieces found matching your criteria.
          </p>
          <button
            onClick={() => {
              setActiveCategory('All');
              setActiveSubCategory('All');
              setSearchQuery('');

              const nextParams = new URLSearchParams(searchParams);
              nextParams.delete('category');
              setSearchParams(nextParams);
            }}
            className="mt-4 text-primary font-bold uppercase tracking-widest text-xs underline underline-offset-4"
          >
            Clear all filters
          </button>
        </div>
      )}
    </main>
  );
}