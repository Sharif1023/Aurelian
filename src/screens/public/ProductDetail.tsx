import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, Heart, Star, ChevronDown, Plus, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, wishlist, toggleWishlist, storeSettings } = useProducts();
  const { addToCart } = useCart();
  const product = products.find((p) => p.id === id) || products[0];
  
  const isLiked = wishlist.includes(product.id);
  
  const availableSizes = product.sizes || [
    { size: 'S', isAvailable: true, quantity: 0 },
    { size: 'M', isAvailable: true, quantity: 0 },
    { size: 'L', isAvailable: true, quantity: 0 },
    { size: 'XL', isAvailable: true, quantity: 0 },
  ];

  const availableColors = product.colors || [
    { name: 'Default', hex: '#000000' }
  ];

  const [selectedSize, setSelectedSize] = useState(availableSizes.find(s => s.isAvailable)?.size || 'M');
  const [mainImage, setMainImage] = useState(product.image);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', transformOrigin: '0% 0%' });

  const selectedSizeData = availableSizes.find(s => s.size === selectedSize);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      transformOrigin: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', transformOrigin: '0% 0%' });
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product, 1, selectedSize, 'Default');
    setTimeout(() => setIsAdding(false), 2000);
  };

  const handleBuyNow = () => {
    setIsBuying(true);
    addToCart(product, 1, selectedSize, 'Default');
    navigate('/checkout');
  };

  return (
    <main className="pt-24 pb-32 max-w-7xl mx-auto px-4 md:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        {/* Gallery */}
        <div className="lg:col-span-4 space-y-4 lg:max-w-sm mx-auto w-full">
          <div 
            className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-low cursor-zoom-in shadow-sm"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              className="w-full h-full object-cover transition-transform duration-200"
              style={{
                transform: zoomStyle.display === 'block' ? 'scale(2)' : 'scale(1)',
                transformOrigin: zoomStyle.transformOrigin
              }}
              src={mainImage}
              alt={product.name}
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-6 left-6 pointer-events-none">
              <span className="bg-white px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase text-primary shadow-sm rounded-full">
                New Arrival
              </span>
            </div>
          </div>
          
          {/* Thumbnails - Smaller and updates main image */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
            {[product.image, ...(product.extraImages || [])].map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainImage(img)}
                className={cn(
                  "w-12 h-16 md:w-14 md:h-18 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                  mainImage === img ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${idx}`} referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <section>
            <h1 className="text-3xl md:text-5xl font-headline font-extrabold tracking-tight leading-none text-primary mb-4">
              {product.name}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-headline font-semibold text-primary">৳{product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-sm text-on-surface-variant/60 line-through">৳{product.originalPrice.toFixed(2)}</span>
              )}
              {product.discount && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                  {product.discount}% OFF
                </span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 ml-auto">Code: {product.productCode}</span>
            </div>
            <div className="mt-6 text-on-surface-variant leading-relaxed max-w-md markdown-body whitespace-pre-wrap">
              <Markdown>{product.description}</Markdown>
            </div>
          </section>

          {/* Selectors */}
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-end mb-4">
                <label className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant block">Size</label>
                {selectedSizeData && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    {selectedSizeData.quantity} available
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {availableSizes.map((s) => (
                  <button
                    key={s.size}
                    disabled={!s.isAvailable}
                    onClick={() => setSelectedSize(s.size)}
                    className={cn(
                      "h-12 rounded-lg text-sm font-medium transition-all border relative overflow-hidden",
                      selectedSize === s.size
                        ? "border-primary bg-primary text-white font-bold"
                        : s.isAvailable 
                          ? "border-outline-variant hover:border-primary"
                          : "border-outline-variant/10 bg-surface-low text-on-surface-variant/30 cursor-not-allowed"
                    )}
                  >
                    {s.size}
                    {!s.isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-[1px] bg-on-surface-variant/20 rotate-45" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-4">
            <button 
              onClick={handleAddToCart}
              disabled={isAdding}
              className={cn(
                "w-full h-16 rounded-full font-headline font-bold text-sm uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-3",
                isAdding ? "bg-green-600 text-white" : "bg-primary text-white hover:opacity-90"
              )}
            >
              {isAdding ? "Added to Cart" : "Add to Cart"}
              {isAdding ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
            </button>
            <div className="flex gap-3">
              <button 
                onClick={handleBuyNow}
                disabled={isBuying}
                className={cn(
                  "flex-1 h-16 rounded-full font-headline font-bold text-sm uppercase tracking-[0.2em] shadow-md transition-all",
                  isBuying ? "bg-green-600 text-white" : "bg-secondary text-white hover:opacity-90"
                )}
              >
                {isBuying ? "Processing..." : "Buy Now"}
              </button>
              <button 
                onClick={() => toggleWishlist(product.id)}
                className={cn(
                  "w-16 h-16 border rounded-full flex items-center justify-center transition-colors",
                  isLiked ? "bg-red-50 border-red-200 text-red-500" : "border-outline-variant text-on-surface hover:bg-surface-low"
                )}
              >
                <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
              </button>
            </div>
          </div>

          {/* Accordion */}
          <div className="mt-8 border-t border-outline-variant/20">
            {[
              { title: 'Product Details', content: product.productDetails || 'Premium quality materials. Designed for comfort and durability. Ethical manufacturing process.' },
              ...(product.sizeChart ? [{ 
                title: product.sizeChart.title || 'Size Chart', 
                content: '',
                isSizeChart: true 
              }] : []),
              { title: 'Shipping & Returns', content: storeSettings.brandSettings.shippingReturns || 'Free shipping on orders over ৳100. Easy 30-day returns.' },
              { title: 'Specifications', content: storeSettings.brandSettings.specifications || 'Material: 100% Cotton/Leather. Care: Machine wash cold / Professional leather clean.' },
            ].map((item: any) => (
              <details key={item.title} className="group border-b border-outline-variant/20">
                <summary className="flex justify-between items-center py-5 cursor-pointer list-none">
                  <span className="text-xs font-bold uppercase tracking-widest">{item.title}</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="pb-6 text-sm text-on-surface-variant leading-relaxed markdown-body whitespace-pre-wrap">
                  {item.isSizeChart && product.sizeChart ? (
                    <div className="overflow-x-auto border border-outline-variant/10 rounded-xl mt-2">
                      <table className="w-full text-left border-collapse min-w-[400px]">
                        <thead>
                          <tr className="bg-surface-low">
                            {product.sizeChart.columns.map((col, i) => (
                              <th key={i} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/5">
                          {product.sizeChart.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-surface-low/30 transition-colors">
                              {product.sizeChart.columns.map((col, colIndex) => (
                                <td key={colIndex} className="px-4 py-3 text-xs font-medium text-on-surface border-r border-outline-variant/5 last:border-r-0">
                                  {row[col]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <Markdown>{item.content}</Markdown>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations - 2 columns on mobile */}
      <section className="mt-20 md:mt-32">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-12 text-center text-on-surface-variant">
          You May Also Like
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.filter(p => p.id !== product.id).slice(0, 4).map((p) => (
            <Link key={p.id} to={`/product/${p.id}`} className="group">
              <div className="aspect-[4/5] bg-surface-low rounded-xl overflow-hidden mb-4 relative">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={p.image}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                />
                <button className="absolute bottom-4 right-4 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 line-clamp-1">{p.name}</p>
              <p className="text-xs md:text-sm text-on-surface-variant">৳{p.price.toFixed(2)}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
