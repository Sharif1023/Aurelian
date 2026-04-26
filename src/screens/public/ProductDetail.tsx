import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import {
  ShoppingBag,
  Heart,
  ChevronDown,
  Plus,
  Check
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/src/lib/utils';
import Markdown from 'react-markdown';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { products, wishlist, toggleWishlist, storeSettings } = useProducts();
  const { addToCart } = useCart();

  const product = products.find(p => p.id === id);

  const fallbackProduct = !product && products.length > 0 ? products[0] : null;
  const activeProduct = product || fallbackProduct;

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('Default');
  const [mainImage, setMainImage] = useState('');
  const [zoomStyle, setZoomStyle] = useState({
    display: 'none',
    transformOrigin: '0% 0%'
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const productAny = activeProduct as any;

  const galleryImages = useMemo(() => {
    if (!activeProduct) return [];

    const allImages = [
      activeProduct.image,
      ...(productAny?.extraImages || []),
      ...(productAny?.images || [])
    ];

    return Array.from(
      new Set(
        allImages
          .filter(Boolean)
          .map((img: string) => String(img).trim())
          .filter(Boolean)
      )
    );
  }, [
    activeProduct?.id,
    activeProduct?.image,
    productAny?.extraImages,
    productAny?.images
  ]);

  const availableSizes =
    activeProduct?.sizes && activeProduct.sizes.length > 0
      ? activeProduct.sizes
      : [
          { size: 'S', isAvailable: true, quantity: 0 },
          { size: 'M', isAvailable: true, quantity: 0 },
          { size: 'L', isAvailable: true, quantity: 0 },
          { size: 'XL', isAvailable: true, quantity: 0 }
        ];

  const availableColors =
    productAny?.colors && productAny.colors.length > 0
      ? productAny.colors
      : [{ name: 'Default', hex: '#000000' }];

  const selectedSizeData = availableSizes.find(s => s.size === selectedSize);

  const isLiked = activeProduct ? wishlist.includes(activeProduct.id) : false;

  useEffect(() => {
    if (!activeProduct) return;

    const firstAvailableSize =
      activeProduct.sizes?.find(s => s.isAvailable)?.size ||
      activeProduct.sizes?.[0]?.size ||
      'M';

    setSelectedSize(firstAvailableSize);

    const firstColor =
      productAny?.colors?.[0]?.name ||
      productAny?.colors?.[0]?.color ||
      'Default';

    setSelectedColor(firstColor);

    setMainImage(activeProduct.image || galleryImages[0] || '');
    setZoomStyle({ display: 'none', transformOrigin: '0% 0%' });
    setIsAdding(false);
    setIsBuying(false);
  }, [activeProduct?.id]);

  useEffect(() => {
    if (!mainImage && galleryImages.length > 0) {
      setMainImage(galleryImages[0]);
    }
  }, [galleryImages, mainImage]);

  if (!activeProduct) {
    return (
      <main className="pt-24 pb-32 max-w-7xl mx-auto px-4 md:px-6">
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
          <h1 className="text-2xl md:text-4xl font-headline font-extrabold tracking-tight text-primary mb-4">
            Product not found
          </h1>

          <p className="text-sm text-on-surface-variant mb-8">
            The product may still be loading or it does not exist.
          </p>

          <Link
            to="/collection"
            className="px-8 py-4 bg-primary text-white rounded-full text-xs font-bold uppercase tracking-widest"
          >
            Back to Collection
          </Link>
        </div>
      </main>
    );
  }

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
    setZoomStyle({
      display: 'none',
      transformOrigin: '0% 0%'
    });
  };

  const handleAddToCart = () => {
    if (!activeProduct) return;

    setIsAdding(true);
    addToCart(activeProduct, 1, selectedSize, selectedColor || 'Default');

    setTimeout(() => {
      setIsAdding(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    if (!activeProduct) return;

    setIsBuying(true);
    addToCart(activeProduct, 1, selectedSize, selectedColor || 'Default');
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
            {mainImage ? (
              <img
                className="w-full h-full object-cover transition-transform duration-200"
                style={{
                  transform:
                    zoomStyle.display === 'block' ? 'scale(2)' : 'scale(1)',
                  transformOrigin: zoomStyle.transformOrigin
                }}
                src={mainImage}
                alt={activeProduct.name}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-on-surface-variant/50">
                No Image
              </div>
            )}

            <div className="absolute top-6 left-6 pointer-events-none">
              <span className="bg-white px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase text-primary shadow-sm rounded-full">
                New Arrival
              </span>
            </div>
          </div>

          {/* Thumbnails only */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setMainImage(img)}
                  className={cn(
                    'w-12 h-16 md:w-14 md:h-18 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all',
                    mainImage === img
                      ? 'border-primary opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                >
                  <img
                    src={img}
                    className="w-full h-full object-cover"
                    alt={`${activeProduct.name} thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <section>
            <h1 className="text-3xl md:text-5xl font-headline font-extrabold tracking-tight leading-none text-primary mb-4">
              {activeProduct.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4">
              <span className="text-2xl font-headline font-semibold text-primary">
                ৳{activeProduct.price.toFixed(2)}
              </span>

              {activeProduct.originalPrice && (
                <span className="text-sm text-on-surface-variant/60 line-through">
                  ৳{activeProduct.originalPrice.toFixed(2)}
                </span>
              )}

              {activeProduct.discount && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                  {activeProduct.discount}% OFF
                </span>
              )}

              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 ml-auto">
                Code: {activeProduct.productCode}
              </span>
            </div>

            <div className="mt-6 text-on-surface-variant leading-relaxed max-w-md markdown-body whitespace-pre-wrap">
              <Markdown>{activeProduct.description}</Markdown>
            </div>
          </section>

          {/* Selectors */}
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-end mb-4">
                <label className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant block">
                  Size
                </label>

                {selectedSizeData && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    {selectedSizeData.quantity} available
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {availableSizes.map(s => (
                  <button
                    key={s.size}
                    type="button"
                    disabled={!s.isAvailable}
                    onClick={() => setSelectedSize(s.size)}
                    className={cn(
                      'h-12 rounded-lg text-sm font-medium transition-all border relative overflow-hidden',
                      selectedSize === s.size
                        ? 'border-primary bg-primary text-white font-bold'
                        : s.isAvailable
                          ? 'border-outline-variant hover:border-primary'
                          : 'border-outline-variant/10 bg-surface-low text-on-surface-variant/30 cursor-not-allowed'
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

            {availableColors.length > 1 && (
              <div>
                <div className="flex justify-between items-end mb-4">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant block">
                    Color
                  </label>

                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    {selectedColor}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {availableColors.map((color: any) => {
                    const colorName = color.name || color.color || 'Default';
                    const hex =
                      color.hex || color.hexCode || color.hex_code || '#000000';

                    return (
                      <button
                        key={colorName}
                        type="button"
                        onClick={() => setSelectedColor(colorName)}
                        className={cn(
                          'h-11 px-4 rounded-full border flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all',
                          selectedColor === colorName
                            ? 'border-primary bg-primary text-white'
                            : 'border-outline-variant hover:border-primary'
                        )}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-outline-variant/30"
                          style={{ backgroundColor: hex }}
                        />

                        {colorName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="space-y-4">
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={cn(
                'w-full h-16 rounded-full font-headline font-bold text-sm uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-3',
                isAdding
                  ? 'bg-green-600 text-white'
                  : 'bg-primary text-white hover:opacity-90'
              )}
            >
              {isAdding ? 'Added to Cart' : 'Add to Cart'}

              {isAdding ? (
                <Check className="w-5 h-5" />
              ) : (
                <ShoppingBag className="w-5 h-5" />
              )}
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleBuyNow}
                disabled={isBuying}
                className={cn(
                  'flex-1 h-16 rounded-full font-headline font-bold text-sm uppercase tracking-[0.2em] shadow-md transition-all',
                  isBuying
                    ? 'bg-green-600 text-white'
                    : 'bg-secondary text-white hover:opacity-90'
                )}
              >
                {isBuying ? 'Processing...' : 'Buy Now'}
              </button>

              <button
                onClick={() => toggleWishlist(activeProduct.id)}
                className={cn(
                  'w-16 h-16 border rounded-full flex items-center justify-center transition-colors',
                  isLiked
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'border-outline-variant text-on-surface hover:bg-surface-low'
                )}
              >
                <Heart className={cn('w-6 h-6', isLiked && 'fill-current')} />
              </button>
            </div>
          </div>

          {/* Accordion */}
          <div className="mt-8 border-t border-outline-variant/20">
            {[
              {
                title: 'Product Details',
                content:
                  activeProduct.productDetails ||
                  'Premium quality materials. Designed for comfort and durability. Ethical manufacturing process.'
              },
              ...(activeProduct.sizeChart
                ? [
                    {
                      title: activeProduct.sizeChart.title || 'Size Chart',
                      content: '',
                      isSizeChart: true
                    }
                  ]
                : []),
              {
                title: 'Shipping & Returns',
                content:
                  storeSettings?.contactSettings?.shippingReturns ||
                  'Free shipping on orders over ৳100. Easy 30-day returns.'
              },
              {
                title: 'Specifications',
                content:
                  storeSettings?.contactSettings?.specifications ||
                  'Material: 100% Cotton/Leather. Care: Machine wash cold / Professional leather clean.'
              }
            ].map((item: any) => (
              <details
                key={item.title}
                className="group border-b border-outline-variant/20"
              >
                <summary className="flex justify-between items-center py-5 cursor-pointer list-none">
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {item.title}
                  </span>

                  <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                </summary>

                <div className="pb-6 text-sm text-on-surface-variant leading-relaxed markdown-body whitespace-pre-wrap">
                  {item.isSizeChart && activeProduct.sizeChart ? (
                    <div className="overflow-x-auto border border-outline-variant/10 rounded-xl mt-2">
                      <table className="w-full text-left border-collapse min-w-[400px]">
                        <thead>
                          <tr className="bg-surface-low">
                            {(activeProduct.sizeChart?.columns || []).map(
                              (col, i) => (
                                <th
                                  key={i}
                                  className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10"
                                >
                                  {col}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-outline-variant/5">
                          {(activeProduct.sizeChart?.rows || []).map(
                            (row, rowIndex) => (
                              <tr
                                key={rowIndex}
                                className="hover:bg-surface-low/30 transition-colors"
                              >
                                {(activeProduct.sizeChart?.columns || []).map(
                                  (col, colIndex) => (
                                    <td
                                      key={colIndex}
                                      className="px-4 py-3 text-xs font-medium text-on-surface border-r border-outline-variant/5 last:border-r-0"
                                    >
                                      {row[col]}
                                    </td>
                                  )
                                )}
                              </tr>
                            )
                          )}
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

      {/* Recommendations */}
      <section className="mt-20 md:mt-32">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-12 text-center text-on-surface-variant">
          You May Also Like
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products
            .filter(p => p.id !== activeProduct.id)
            .slice(0, 4)
            .map(p => (
              <Link key={p.id} to={`/product/${p.id}`} className="group">
                <div className="aspect-[4/5] bg-surface-low rounded-xl overflow-hidden mb-4 relative">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={p.image}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                  />

                  <button
                    type="button"
                    className="absolute bottom-4 right-4 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 line-clamp-1">
                  {p.name}
                </p>

                <p className="text-xs md:text-sm text-on-surface-variant">
                  ৳{p.price.toFixed(2)}
                </p>
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}