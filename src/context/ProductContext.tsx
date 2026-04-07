import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, Order, Coupon, PRODUCTS } from '../types';

export interface SocialLink {
  platform: string;
  url: string;
}

export interface StoreSettings {
  shippingChittagong: number;
  shippingOutsideChittagong: number;
  coupons: Coupon[];
  paymentSettings: {
    bkashNumber: string;
    nagadNumber: string;
  };
  socialLinks: SocialLink[];
  categorySubtitles: { [category: string]: string };
  brandSettings: {
    name: string;
    fontFamily: 'font-display' | 'font-headline' | 'font-sans';
    color: string;
  };
  contactSettings: {
    email?: string;
    address?: string;
    contactPhone?: string;
    shippingReturns?: string;
    specifications?: string;
  };
}

export interface HomeSettings {
  heroImage: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroVideoUrl: string;
  bestSellerIds: string[];
  socialGallery: string[];
  featuredCollection: {
    title: string;
    subtitle: string;
    productIds: string[];
    show: boolean;
  };
  curatedEdits: {
    title: string;
    items: {
      id: string;
      title: string;
      subtitle: string;
      image: string;
      link: string;
    }[];
  };
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  categories: string[];
  homeSettings: HomeSettings;
  updateHomeSettings: (settings: Partial<HomeSettings>) => void;
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  deleteCoupon: (id: string) => void;
  orders: Order[];
  createOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt'>) => Order;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  deleteOrder: (id: string) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('storeSettings');
    const defaults: StoreSettings = {
      shippingChittagong: 60,
      shippingOutsideChittagong: 120,
      coupons: [
        { id: '1', code: 'WELCOME10', discountPercent: 10, isActive: true },
        { id: '2', code: 'AURELIAN20', discountPercent: 20, isActive: true }
      ],
      paymentSettings: {
        bkashNumber: '01700000000',
        nagadNumber: '01800000000'
      },
      socialLinks: [
        { platform: 'Facebook', url: 'https://facebook.com' },
        { platform: 'Instagram', url: 'https://instagram.com' }
      ],
      categorySubtitles: {
        'Combo': 'Exclusive 2-in-1 & 3-in-1 deals',
        'Shirt': 'Premium cotton & linen',
        'T-Shirt': 'Essential everyday basics',
        'Pant': 'Tailored chinos & trousers',
        'Shoes': 'Handcrafted leather footwear',
        'Accessories': 'The finishing touches'
      },
      brandSettings: {
        name: 'AURELIAN',
        fontFamily: 'font-display',
        color: '#000000'
      },
      contactSettings: {
        email: 'contact@aurelian.com',
        address: '123 Luxury Lane, Architectural District, Chittagong, Bangladesh',
        contactPhone: '+880 1700-000000',
        shippingReturns: 'Free shipping on orders over ৳100. Easy 30-day returns.',
        specifications: 'Material: 100% Cotton/Leather. Care: Machine wash cold / Professional leather clean.'
      }
    };

    if (!saved) return defaults;
    const parsed = JSON.parse(saved);
    return {
      ...defaults,
      ...parsed,
      brandSettings: parsed.brandSettings || defaults.brandSettings,
      contactSettings: parsed.contactSettings || defaults.contactSettings
    };
  });

  const [homeSettings, setHomeSettings] = useState<HomeSettings>(() => {
    const saved = localStorage.getItem('homeSettings');
    const defaults = {
      heroImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
      heroBadge: "Autumn / Winter 2024",
      heroTitle: "The Art of Modern Elegance",
      heroSubtitle: "Discover our curated collection of artisanal pieces designed for the contemporary individual.",
      heroVideoUrl: "https://player.vimeo.com/external/459389137.sd.mp4?s=8946331db3c989d0f11b92277409696516056064&profile_id=164&oauth2_token_id=57447761",
      bestSellerIds: ['1', '2', '3', '4'],
      socialGallery: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1920&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1920&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1920&auto=format&fit=crop"
      ],
      featuredCollection: {
        title: "The Silk Road",
        subtitle: "Hand-woven elegance from the heart of the orient.",
        productIds: ['1', '6', '3'],
        show: true
      },
      curatedEdits: {
        title: "Curated Edits",
        items: [
          {
            id: '1',
            title: "The Minimalist",
            subtitle: "Clean lines & neutral tones",
            image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop",
            link: "/collection?category=Shirt"
          },
          {
            id: '2',
            title: "Urban Explorer",
            subtitle: "Durable fabrics for the city",
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1920&auto=format&fit=crop",
            link: "/collection?category=Pant"
          },
          {
            id: '3',
            title: "Evening Gala",
            subtitle: "Sophisticated night wear",
            image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1920&auto=format&fit=crop",
            link: "/collection?category=Combo"
          }
        ]
      }
    };
    if (!saved) return defaults;
    const parsed = JSON.parse(saved);
    return { 
      ...defaults, 
      ...parsed, 
      curatedEdits: parsed.curatedEdits || defaults.curatedEdits,
      brandSettings: parsed.brandSettings || {
        name: 'AURELIAN',
        fontFamily: 'font-display',
        color: '#000000'
      },
      contactSettings: parsed.contactSettings || {
        email: 'contact@aurelian.com',
        address: '123 Luxury Lane, Architectural District, Chittagong, Bangladesh',
        contactPhone: '+880 1700-000000',
        shippingReturns: 'Free shipping on orders over ৳100. Easy 30-day returns.',
        specifications: 'Material: 100% Cotton/Leather. Care: Machine wash cold / Professional leather clean.'
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('storeSettings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  useEffect(() => {
    localStorage.setItem('homeSettings', JSON.stringify(homeSettings));
  }, [homeSettings]);

  const categories = Array.from(new Set(products.map(p => p.category)));

  const addProduct = (newProduct: Omit<Product, 'id' | 'rating' | 'reviews' | 'createdAt'>) => {
    const product: Product = {
      ...newProduct,
      id: Math.random().toString(36).substr(2, 9),
      rating: 5,
      reviews: 0,
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [product, ...prev]);

    // Ensure new category has a subtitle
    if (!storeSettings.categorySubtitles[newProduct.category]) {
      setStoreSettings(prev => ({
        ...prev,
        categorySubtitles: {
          ...prev.categorySubtitles,
          [newProduct.category]: `Explore our latest ${newProduct.category.toLowerCase()} collection`
        }
      }));
    }
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateHomeSettings = (updatedFields: Partial<HomeSettings>) => {
    setHomeSettings(prev => ({ ...prev, ...updatedFields }));
  };

  const updateStoreSettings = (updatedFields: Partial<StoreSettings>) => {
    setStoreSettings(prev => ({ ...prev, ...updatedFields }));
  };

  const addCoupon = (newCoupon: Omit<Coupon, 'id'>) => {
    const coupon: Coupon = {
      ...newCoupon,
      id: Math.random().toString(36).substr(2, 9),
    };
    setStoreSettings(prev => ({
      ...prev,
      coupons: [coupon, ...prev.coupons]
    }));
  };

  const deleteCoupon = (id: string) => {
    setStoreSettings(prev => ({
      ...prev,
      coupons: prev.coupons.filter(c => c.id !== id)
    }));
  };

  const createOrder = (newOrder: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt'>) => {
    const order: Order = {
      ...newOrder,
      id: Math.random().toString(36).substr(2, 9),
      orderNumber: `ARL-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    setOrders(prev => [order, ...prev]);
    return order;
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const isWishlisted = prev.includes(productId);
      const newWishlist = isWishlisted 
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      return newWishlist;
    });
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      addProduct, 
      updateProduct, 
      deleteProduct, 
      categories,
      homeSettings,
      updateHomeSettings,
      storeSettings,
      updateStoreSettings,
      addCoupon,
      deleteCoupon,
      orders,
      createOrder,
      updateOrderStatus,
      deleteOrder,
      wishlist,
      toggleWishlist
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
