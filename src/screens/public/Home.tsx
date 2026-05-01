import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import {
  ShoppingCart,
  Star,
  ArrowRight,
  Play,
  Heart,
  Check,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function Home() {
  const { products, homeSettings, wishlist, toggleWishlist } = useProducts();
  const { addToCart } = useCart();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const featuredProducts = products.filter((p) =>
    homeSettings.featuredCollection.productIds.includes(p.id)
  );

  const bestSellers = products.filter((p) =>
    homeSettings.bestSellerIds.includes(p.id)
  );

  const handleAddToCart = (product: any) => {
    const availableSize = product?.sizes?.find((size: any) =>
      typeof size === 'object' ? size.isAvailable !== false : true
    );

    const defaultSize =
      typeof availableSize === 'string'
        ? availableSize
        : availableSize?.size || product?.sizes?.[0]?.size || product?.sizes?.[0] || '';

    const defaultColor =
      product?.colors?.[0]?.name ||
      product?.colors?.[0]?.color ||
      product?.colors?.[0] ||
      'Default';

    setAddingProductId(product.id);

    addToCart(product, 1, defaultSize, defaultColor);

    setTimeout(() => {
      setAddingProductId((prev) => (prev === product.id ? null : prev));
    }, 1500);
  };

  useEffect(() => {
    if (!homeSettings.featuredCollection.show || featuredProducts.length === 0) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [featuredProducts.length, homeSettings.featuredCollection.show]);

  useEffect(() => {
    if (currentIndex >= featuredProducts.length && featuredProducts.length > 0) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, featuredProducts.length]);

  const itemsToShow =
    typeof window !== 'undefined' && window.innerWidth < 768 ? 2 : 3;

  const displayProducts = [
    ...featuredProducts,
    ...featuredProducts.slice(0, itemsToShow),
  ];

  return (
    <div className="bg-[#fdfdfb]">
      {/* Hero Section - Editorial Style */}
      <section className="relative h-screen w-full overflow-hidden flex items-center pt-16">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img
            className="w-full h-full object-cover"
            src={homeSettings.heroImage}
            alt="Hero"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-block text-white/70 text-[10px] font-bold uppercase tracking-[0.4em] mb-6"
            >
              {homeSettings.heroBadge}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="font-headline text-6xl md:text-8xl font-black text-white tracking-tight leading-[0.9] mb-8"
            >
              {homeSettings.heroTitle.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i === 0 && <br />}
                </React.Fragment>
              ))}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-white/80 text-lg md:text-xl max-w-lg mb-12 font-light leading-relaxed"
            >
              {homeSettings.heroSubtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex flex-wrap gap-6"
            >
              <Link
                to="/collection"
                className="group bg-white text-black px-10 py-5 rounded-full font-headline font-bold text-xs tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-500 flex items-center gap-3 shadow-2xl shadow-black/20"
              >
                EXPLORE COLLECTION
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href={homeSettings.heroVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 text-white group"
              >
                <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Watch Film
                </span>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Categories - Circular Editorial */}
      <section className="py-12 md:py-16 bg-surface-low/30">
        <div className="max-w-7xl mx-auto px-6 text-center mb-8 md:mb-12">
          <h2 className="font-headline text-4xl font-black mb-4">
            {homeSettings.curatedEdits?.title}
          </h2>
          <p className="text-on-surface-variant font-light">
            Explore our seasonal highlights and essential silhouettes.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-6 md:gap-12">
          {homeSettings.curatedEdits?.items?.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="w-[calc(33.333%-16px)] md:w-[180px]"
            >
              <Link to={cat.link} className="flex flex-col items-center group">
                <div className="relative w-full aspect-square rounded-full overflow-hidden mb-4 md:mb-6 ring-1 ring-outline-variant/10 group-hover:ring-primary transition-all duration-700">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    src={cat.image}
                    alt={cat.title}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                </div>

                <span className="font-headline font-bold tracking-[0.2em] text-[8px] md:text-[10px] uppercase group-hover:text-primary transition-colors text-center">
                  {cat.title}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Collection - New/Eid Collection */}
      {homeSettings.featuredCollection.show && (
        <section className="py-12 md:py-16 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 mb-8 md:mb-12">
            <span className="text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">
              {homeSettings.featuredCollection.subtitle}
            </span>

            <h2 className="font-headline text-5xl font-black tracking-tight uppercase">
              {homeSettings.featuredCollection.title}
            </h2>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 md:px-6">
            <div className="overflow-hidden">
              <motion.div
                className="flex gap-4 md:gap-8"
                animate={{
                  x: `-${currentIndex * (100 / itemsToShow)}%`,
                }}
                transition={
                  isTransitioning
                    ? { duration: 0.8, ease: 'easeInOut' }
                    : { duration: 0 }
                }
              >
                {displayProducts.map((product, i) => (
                  <div
                    key={`${product.id}-${i}`}
                    className="min-w-[calc(50%-8px)] md:min-w-[calc(33.333%-21.333px)] group"
                  >
                    <Link to={`/product/${product.id}`} className="block">
                      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-surface-low mb-4 shadow-sm">
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          src={product.image}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                        />

                        <div className="absolute top-4 left-4">
                          <span className="bg-white/90 backdrop-blur-md px-3 py-1 text-[8px] font-bold tracking-widest uppercase rounded-full shadow-sm">
                            New
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                          {product.category}
                        </p>
                        <h3 className="text-sm font-bold uppercase tracking-tight line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="font-headline font-bold text-primary">
                          ৳{product.price.toFixed(2)}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers - Magazine Style */}
      <section className="py-12 md:py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-8 md:mb-12 flex justify-between items-end">
          <div>
            <span className="text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">
              The Essentials
            </span>
            <h2 className="font-headline text-5xl font-black tracking-tight">
              BEST SELLERS
            </h2>
          </div>

          <Link
            to="/collection"
            className="group flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase"
          >
            View All{' '}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:flex md:overflow-x-auto no-scrollbar gap-4 md:gap-10 px-4 md:px-6 max-w-7xl mx-auto pb-10">
          {bestSellers.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              viewport={{ once: true, margin: '-50px' }}
              whileHover={{ y: -12, transition: { duration: 0.3 } }}
              whileTap={{ scale: 0.98 }}
              className="md:min-w-[400px]"
            >
              <Link to={`/product/${product.id}`} className="group block">
                <div className="relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden bg-surface-low mb-4 md:mb-6 shadow-xl shadow-black/5">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                  />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className={cn(
                      'absolute top-3 right-3 md:top-4 md:right-4 w-9 h-9 md:w-10 md:h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 z-20',
                      wishlist.includes(product.id)
                        ? 'text-red-500'
                        : 'text-primary md:opacity-0 md:group-hover:opacity-100'
                    )}
                  >
                    <Heart
                      className={cn(
                        'w-4 h-4 md:w-5 md:h-5',
                        wishlist.includes(product.id) && 'fill-current'
                      )}
                    />
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 md:bottom-6 md:left-6 md:right-6 flex justify-between items-end translate-y-0 md:translate-y-12 md:group-hover:translate-y-0 transition-transform duration-500 z-10">
                    <div className="bg-white/90 backdrop-blur-xl p-2.5 md:p-4 rounded-xl md:rounded-2xl border border-white/20 flex-grow mr-2 md:mr-4 min-w-0">
                      <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 mb-0.5 md:mb-1 line-clamp-1">
                        {product.category}
                      </p>
                      <p className="text-[11px] md:text-sm font-bold uppercase tracking-tight line-clamp-1">
                        {product.name}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={addingProductId === product.id}
                      className={cn(
                        'bg-primary text-white p-2.5 md:p-4 rounded-xl md:rounded-2xl shadow-xl shadow-primary/20 hover:scale-110 transition-transform shrink-0 flex items-center justify-center',
                        addingProductId === product.id &&
                          'bg-green-600 hover:scale-100 cursor-not-allowed'
                      )}
                    >
                      {addingProductId === product.id ? (
                        <Check className="w-4 h-4 md:w-5 md:h-5" />
                      ) : (
                        <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center px-1 md:px-2">
                  <div className="flex text-secondary gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-2 h-2 md:w-3 md:h-3 fill-current"
                      />
                    ))}
                  </div>

                  <p className="font-headline font-bold text-sm md:text-xl">
                    ৳{Number(product.price).toFixed(2)}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social Proof - Grid */}
      {/* Social Proof - Exclusive Editorial Gallery */}
<section className="py-16 md:py-24 bg-[#fdfdfb] overflow-hidden">
  <div className="max-w-7xl mx-auto px-6 mb-10 md:mb-16">
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
      <div>
        <span className="text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">
          Social Gallery
        </span>

        <h2 className="font-headline text-4xl md:text-6xl font-black tracking-tight uppercase leading-none">
          As Seen <br className="hidden md:block" />
          On You.
        </h2>
      </div>

      <p className="text-on-surface-variant font-light max-w-md text-sm md:text-base leading-relaxed">
        Real moments, real style. Tag{' '}
        <span className="font-bold text-primary">@Sharuu</span> to be featured
        in our seasonal lookbook.
      </p>
    </div>
  </div>

  <div className="max-w-[1600px] mx-auto px-4 md:px-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[220px] md:auto-rows-[320px]">
      {homeSettings.socialGallery.map((src, i) => {
        const isFeature = i === 0;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: i * 0.08,
              duration: 0.7,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
            viewport={{ once: true, margin: '-80px' }}
            whileHover={{ y: -8 }}
            className={cn(
              'group relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-surface-low shadow-xl shadow-black/5',
              isFeature && 'col-span-2 row-span-2'
            )}
          >
            <img
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              src={src}
              alt={`Social gallery ${i + 1}`}
              referrerPolicy="no-referrer"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

            

            <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <div className="bg-white/90 backdrop-blur-xl border border-white/30 rounded-2xl p-4 shadow-xl">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary mb-1">
                  Community Style
                </p>

                <p className="font-headline font-black text-sm md:text-lg uppercase tracking-tight text-black">
                  Shop The Look
                </p>
              </div>
            </div>

            {isFeature && (
              <div className="absolute left-5 bottom-5 md:left-8 md:bottom-8 max-w-xs group-hover:opacity-0 transition-opacity duration-500">
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.35em] mb-3">
                  Featured Look
                </p>

                <h3 className="font-headline text-white text-3xl md:text-5xl font-black uppercase leading-none">
                  Styled By You
                </h3>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  </div>
</section>
    </div>
  );
}