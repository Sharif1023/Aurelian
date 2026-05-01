import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback
} from 'react';
import { getAdminToken } from '../lib/api';
import { Product, Order, Coupon, Customer, PRODUCTS } from '../types';

const API_BASE_URL =
  ((import.meta as any).env?.VITE_API_URL as string) ||
  '/api';

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
  generalSettings: {
    storeName: string;
    storeEmail: string;
    storeDescription: string;
    currency: string;
    weightUnit: string;
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
  createOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt'>) => Promise<Order>;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  deleteOrder: (id: string) => void;
  customers: Customer[];

  wishlist: string[];
  toggleWishlist: (productId: string) => void;

  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const defaultStoreSettings: StoreSettings = {
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
    Combo: 'Exclusive 2-in-1 & 3-in-1 deals',
    Shirt: 'Premium cotton & linen',
    'T-Shirt': 'Essential everyday basics',
    Pant: 'Tailored chinos & trousers',
    Shoes: 'Handcrafted leather footwear',
    Accessories: 'The finishing touches'
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
    specifications:
      'Material: 100% Cotton/Leather. Care: Machine wash cold / Professional leather clean.'
  },
  generalSettings: {
    storeName: 'Aurelian Luxe',
    storeEmail: 'atelier@aurelian.com',
    storeDescription: 'A global destination for curated luxury and timeless elegance.',
    currency: 'BDT (৳)',
    weightUnit: 'Kilograms (kg)'
  }
};

const defaultHomeSettings: HomeSettings = {
  heroImage:
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
  heroBadge: 'Autumn / Winter 2024',
  heroTitle: 'The Art of Modern Elegance',
  heroSubtitle:
    'Discover our curated collection of artisanal pieces designed for the contemporary individual.',
  heroVideoUrl:
    'https://player.vimeo.com/external/459389137.sd.mp4?s=8946331db3c989d0f11b92277409696516056064&profile_id=164&oauth2_token_id=57447761',
  bestSellerIds: ['1', '2', '3', '4'],
  socialGallery: [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1920&auto=format&fit=crop'
  ],
  featuredCollection: {
    title: 'The Silk Road',
    subtitle: 'Hand-woven elegance from the heart of the orient.',
    productIds: ['1', '6', '3'],
    show: true
  },
  curatedEdits: {
    title: 'Curated Edits',
    items: [
      {
        id: '1',
        title: 'The Minimalist',
        subtitle: 'Clean lines & neutral tones',
        image:
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop',
        link: '/collection?category=Shirt'
      },
      {
        id: '2',
        title: 'Urban Explorer',
        subtitle: 'Durable fabrics for the city',
        image:
          'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1920&auto=format&fit=crop',
        link: '/collection?category=Pant'
      },
      {
        id: '3',
        title: 'Evening Gala',
        subtitle: 'Sophisticated night wear',
        image:
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1920&auto=format&fit=crop',
        link: '/collection?category=Combo'
      }
    ]
  }
};

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.auth && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let message = `API error: ${response.status}`;

    try {
      const errorData = await response.json();
      message = errorData.message || errorData.error || message;
    } catch {
      // Ignore JSON parse errors
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

const apiGet = <T,>(endpoint: string, auth = false) =>
  apiRequest<T>(endpoint, { auth });

const apiPost = <T,>(endpoint: string, data: unknown, auth = false) =>
  apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    auth
  });

const apiPut = <T,>(endpoint: string, data: unknown, auth = true) =>
  apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    auth
  });

const apiDelete = <T,>(endpoint: string, auth = true) =>
  apiRequest<T>(endpoint, {
    method: 'DELETE',
    auth
  });

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function generateOrderNumber() {
  return `ARL-${Math.floor(10000 + Math.random() * 90000)}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong';
}

function mapDbProductToProduct(row: any): Product {
  return {
    id: String(row.id),
    productCode: row.product_code ?? row.productCode,
    product_code: row.product_code ?? row.productCode,
    name: row.name ?? '',
    price: Number(row.price ?? 0),
    originalPrice:
      row.original_price !== undefined && row.original_price !== null
        ? Number(row.original_price)
        : row.originalPrice,
    original_price:
      row.original_price !== undefined && row.original_price !== null
        ? Number(row.original_price)
        : row.originalPrice,
    discount:
      row.discount !== undefined && row.discount !== null
        ? Number(row.discount)
        : undefined,
    category: row.category ?? '',
    subCategory: row.sub_category ?? row.subCategory,
    sub_category: row.sub_category ?? row.subCategory,
    image: row.image ?? '',
    images: row.images ?? row.extraImages ?? [],
    description: row.description ?? '',
    productDetails: row.product_details ?? row.productDetails ?? '',
    product_details: row.product_details ?? row.productDetails ?? '',
    rating: Number(row.rating ?? 5),
    reviews: Number(row.reviews ?? 0),
    stock: Number(row.stock ?? 0),
    status: row.status ?? 'Active',
    sizes: row.sizes ?? [],
    colors: row.colors ?? [],
    sizeChart: row.size_chart_json ?? row.sizeChart,
    size_chart_json: row.size_chart_json ?? row.sizeChart,
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    created_at: row.created_at ?? row.createdAt
  } as Product;
}

function mapDbCouponToCoupon(row: any): Coupon {
  return {
    id: String(row.id),
    code: row.code,
    discountPercent: Number(row.discount_percent ?? row.discountPercent ?? 0),
    discount_percent: Number(row.discount_percent ?? row.discountPercent ?? 0),
    isActive: Boolean(row.is_active ?? row.isActive),
    is_active: Boolean(row.is_active ?? row.isActive)
  } as Coupon;
}

function mapDbOrderToOrder(row: any): Order {
  const mappedItems = Array.isArray(row.items)
    ? row.items.map((item: any) => ({
        productId: String(item.product_id ?? item.productId ?? item.id ?? ''),
        name: item.product_name ?? item.productName ?? item.name ?? '',
        price: Number(item.price ?? 0),
        quantity: Number(item.quantity ?? 0),
        size: item.size ?? undefined,
        color: item.color ?? undefined,
        image: item.image_url ?? item.imageUrl ?? item.image ?? ''
      }))
    : [];

  return {
    id: String(row.id),
    orderNumber: row.order_number ?? row.orderNumber,
    order_number: row.order_number ?? row.orderNumber,
    customerName: row.customer_name ?? row.customerName,
    customer_name: row.customer_name ?? row.customerName,
    email: row.email,
    phone: row.phone,
    address: row.address,
    city: row.city,
    zip: row.zip,
    total: Number(row.total ?? 0),
    shippingArea: row.shipping_area ?? row.shippingArea,
    shipping_area: row.shipping_area ?? row.shippingArea,
    shippingCost:
      row.shipping_cost !== undefined && row.shipping_cost !== null
        ? Number(row.shipping_cost)
        : row.shippingCost,
    shipping_cost:
      row.shipping_cost !== undefined && row.shipping_cost !== null
        ? Number(row.shipping_cost)
        : row.shippingCost,
    paymentMethod: row.payment_method ?? row.paymentMethod,
    payment_method: row.payment_method ?? row.paymentMethod,
    transactionId: row.transaction_id ?? row.transactionId,
    transaction_id: row.transaction_id ?? row.transactionId,
    status: row.status ?? 'Pending',
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    created_at: row.created_at ?? row.createdAt,
    items: mappedItems
  } as Order;
}

function toDbProductPayload(product: Partial<Product> & Record<string, any>) {
  return {
    ...product,
    product_code: product.product_code ?? product.productCode,
    original_price: product.original_price ?? product.originalPrice,
    sub_category: product.sub_category ?? product.subCategory,
    product_details: product.product_details ?? product.productDetails,
    size_chart_json: product.size_chart_json ?? product.sizeChart
  };
}

function toDbCouponPayload(coupon: Partial<Coupon> & Record<string, any>) {
  return {
    ...coupon,
    discount_percent: coupon.discount_percent ?? coupon.discountPercent,
    is_active: coupon.is_active ?? coupon.isActive
  };
}

function toDbOrderPayload(order: Partial<Order> & Record<string, any>) {
  return {
    ...order,
    order_number: order.order_number ?? order.orderNumber,
    customer_name: order.customer_name ?? order.customerName,
    shipping_area: order.shipping_area ?? order.shippingArea,
    shipping_cost: order.shipping_cost ?? order.shippingCost,
    payment_method: order.payment_method ?? order.paymentMethod,
    transaction_id: order.transaction_id ?? order.transactionId
  };
}

function mergeStoreSettings(
  apiSettings?: Partial<StoreSettings>,
  coupons?: Coupon[]
): StoreSettings {
  return {
    ...defaultStoreSettings,
    ...(apiSettings || {}),
    coupons: coupons || apiSettings?.coupons || defaultStoreSettings.coupons,
    paymentSettings: {
      ...defaultStoreSettings.paymentSettings,
      ...(apiSettings?.paymentSettings || {})
    },
    brandSettings: {
      ...defaultStoreSettings.brandSettings,
      ...(apiSettings?.brandSettings || {})
    },
    contactSettings: {
      ...defaultStoreSettings.contactSettings,
      ...(apiSettings?.contactSettings || {})
    },
    socialLinks: apiSettings?.socialLinks || defaultStoreSettings.socialLinks,
    categorySubtitles: {
      ...defaultStoreSettings.categorySubtitles,
      ...(apiSettings?.categorySubtitles || {})
    },
    generalSettings: {
      ...defaultStoreSettings.generalSettings,
      ...(apiSettings?.generalSettings || {})
    }
  };
}

function mergeHomeSettings(apiSettings?: Partial<HomeSettings>): HomeSettings {
  return {
    ...defaultHomeSettings,
    ...(apiSettings || {}),
    featuredCollection: {
      ...defaultHomeSettings.featuredCollection,
      ...(apiSettings?.featuredCollection || {})
    },
    curatedEdits: {
      ...defaultHomeSettings.curatedEdits,
      ...(apiSettings?.curatedEdits || {}),
      items:
        apiSettings?.curatedEdits?.items ||
        defaultHomeSettings.curatedEdits.items
    }
  };
}

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [storeSettings, setStoreSettings] =
    useState<StoreSettings>(defaultStoreSettings);
  const [homeSettings, setHomeSettings] =
    useState<HomeSettings>(defaultHomeSettings);

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const authOrders = Boolean(getAdminToken());
      const authCoupons = Boolean(getAdminToken());
      const [productsResult, ordersResult, customersResult, storeSettingsResult, homeSettingsResult, couponsResult] =
        await Promise.allSettled([
          apiGet<any[]>('/products'),
          authOrders ? apiGet<any[]>('/orders', true) : Promise.resolve([]),
          authOrders ? apiGet<Customer[]>('/customers', true) : Promise.resolve([]),
          apiGet<Partial<StoreSettings>>('/settings/store_settings'),
          apiGet<Partial<HomeSettings>>('/settings/home_settings'),
          authCoupons ? apiGet<any[]>('/coupons', true) : Promise.resolve([])
        ]);

      if (productsResult.status === 'fulfilled') {
        setProducts(productsResult.value.map(mapDbProductToProduct));
      }

      if (ordersResult.status === 'fulfilled') {
        setOrders(ordersResult.value.map(mapDbOrderToOrder));
      }

      if (customersResult.status === 'fulfilled') {
        setCustomers(customersResult.value);
      }

      const apiCoupons =
        couponsResult.status === 'fulfilled'
          ? couponsResult.value.map(mapDbCouponToCoupon)
          : undefined;

      if (storeSettingsResult.status === 'fulfilled') {
        setStoreSettings(mergeStoreSettings(storeSettingsResult.value, apiCoupons));
      } else if (apiCoupons) {
        setStoreSettings(mergeStoreSettings(undefined, apiCoupons));
      }

      if (homeSettingsResult.status === 'fulfilled') {
        setHomeSettings(mergeHomeSettings(homeSettingsResult.value));
      }

      const failedResults = [
        productsResult,
        ordersResult,
        customersResult,
        storeSettingsResult,
        homeSettingsResult,
        couponsResult
      ].filter(result => result.status === 'rejected');

      if (failedResults.length > 0) {
        console.warn('Some API requests failed:', failedResults);
      }
    } catch (error) {
      const message = getErrorMessage(error);
      console.error('Failed to load data from database:', error);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const categories = Array.from(
    new Set(products.map(product => product.category).filter(Boolean))
  );

  const addProduct = (
    newProduct: Omit<Product, 'id' | 'rating' | 'reviews' | 'createdAt'>
  ) => {
    const product: Product = {
      ...(newProduct as Product),
      id: generateId(),
      rating: 5,
      reviews: 0,
      createdAt: new Date().toISOString()
    } as Product;

    setProducts(prev => [product, ...prev]);

    if (!storeSettings.categorySubtitles[(newProduct as Product).category]) {
      const updatedStoreSettings = {
        ...storeSettings,
        categorySubtitles: {
          ...storeSettings.categorySubtitles,
          [(newProduct as Product).category]: `Explore our latest ${(
            newProduct as Product
          ).category.toLowerCase()} collection`
        }
      };

      setStoreSettings(updatedStoreSettings);

      void apiPut('/settings/store_settings', updatedStoreSettings, true).catch(error => {
        console.error('Failed to update category subtitles:', error);
        setError(getErrorMessage(error));
      });
    }

    void apiPost<Product>('/products', toDbProductPayload(product), true)
      .then(savedProduct => {
        if (savedProduct) {
          setProducts(prev =>
            prev.map(item =>
              item.id === product.id ? mapDbProductToProduct(savedProduct) : item
            )
          );
        }
      })
      .catch(error => {
        console.error('Failed to add product:', error);
        setError(getErrorMessage(error));
        setProducts(prev => prev.filter(item => item.id !== product.id));
      });
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    const previousProducts = products;

    setProducts(prev =>
      prev.map(product =>
        product.id === id ? ({ ...product, ...updatedFields } as Product) : product
      )
    );

    void apiPut<Product>(`/products/${id}`, toDbProductPayload(updatedFields), true)
      .then(savedProduct => {
        if (savedProduct) {
          setProducts(prev =>
            prev.map(item =>
              item.id === id ? mapDbProductToProduct(savedProduct) : item
            )
          );
        }
      })
      .catch(error => {
        console.error('Failed to update product:', error);
        setError(getErrorMessage(error));
        setProducts(previousProducts);
      });
  };

  const deleteProduct = (id: string) => {
    const previousProducts = products;

    setProducts(prev => prev.filter(product => product.id !== id));

    void apiDelete(`/products/${id}`).catch(error => {
      console.error('Failed to delete product:', error);
      setError(getErrorMessage(error));
      setProducts(previousProducts);
    });
  };

  const updateHomeSettings = (updatedFields: Partial<HomeSettings>) => {
    const updatedSettings = mergeHomeSettings({
      ...homeSettings,
      ...updatedFields
    });

    setHomeSettings(updatedSettings);

    void apiPut('/settings/home_settings', updatedSettings, true).catch(error => {
      console.error('Failed to update home settings:', error);
      setError(getErrorMessage(error));
    });
  };

  const updateStoreSettings = (updatedFields: Partial<StoreSettings>) => {
    const previousSettings = storeSettings;
    const updatedSettings = mergeStoreSettings({
      ...storeSettings,
      ...updatedFields
    });

    setStoreSettings(updatedSettings);

    void apiPut('/settings/store_settings', updatedSettings, true).catch(error => {
      console.error('Failed to update store settings:', error);
      setError(getErrorMessage(error));
      setStoreSettings(previousSettings);
    });
  };

  const addCoupon = (newCoupon: Omit<Coupon, 'id'>) => {
    const coupon: Coupon = {
      ...(newCoupon as Coupon),
      id: generateId()
    } as Coupon;

    setStoreSettings(prev => ({
      ...prev,
      coupons: [coupon, ...prev.coupons]
    }));

    void apiPost<Coupon>('/coupons', toDbCouponPayload(coupon), true)
      .then(savedCoupon => {
        if (savedCoupon) {
          const normalizedCoupon = mapDbCouponToCoupon(savedCoupon);

          setStoreSettings(prev => ({
            ...prev,
            coupons: prev.coupons.map(item =>
              item.id === coupon.id ? normalizedCoupon : item
            )
          }));
        }
      })
      .catch(error => {
        console.error('Failed to add coupon:', error);
        setError(getErrorMessage(error));

        setStoreSettings(prev => ({
          ...prev,
          coupons: prev.coupons.filter(item => item.id !== coupon.id)
        }));
      });
  };

  const deleteCoupon = (id: string) => {
    const previousCoupons = storeSettings.coupons;

    setStoreSettings(prev => ({
      ...prev,
      coupons: prev.coupons.filter(coupon => coupon.id !== id)
    }));

    void apiDelete(`/coupons/${id}`, true).catch(error => {
      console.error('Failed to delete coupon:', error);
      setError(getErrorMessage(error));

      setStoreSettings(prev => ({
        ...prev,
        coupons: previousCoupons
      }));
    });
  };

  const createOrder = async (
    newOrder: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt'>
  ) => {
    if (!newOrder.items || newOrder.items.length === 0) {
      throw new Error('Cannot create order with an empty cart.');
    }

    const order: Order = {
      ...(newOrder as Order),
      id: generateId(),
      orderNumber: generateOrderNumber(),
      status: 'Pending',
      createdAt: new Date().toISOString()
    } as Order;

    setOrders(prev => [order, ...prev]);

    try {
      const savedOrder = await apiPost<Order>('/orders', toDbOrderPayload(order));
      if (savedOrder) {
        const normalizedOrder = mapDbOrderToOrder(savedOrder);

        setOrders(prev =>
          prev.map(item => (item.id === order.id ? normalizedOrder : item))
        );

        return normalizedOrder;
      }

      return order;
    } catch (error) {
      console.error('Failed to create order:', error);
      setError(getErrorMessage(error));
      setOrders(prev => prev.filter(item => item.id !== order.id));
      throw error;
    }
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    const previousOrders = orders;

    setOrders(prev =>
      prev.map(order => (order.id === id ? ({ ...order, status } as Order) : order))
    );

    void apiPut<Order>(`/orders/${id}/status`, { status })
      .then(savedOrder => {
        if (savedOrder) {
          setOrders(prev =>
            prev.map(item =>
              item.id === id ? mapDbOrderToOrder(savedOrder) : item
            )
          );
        }
      })
      .catch(error => {
        console.error('Failed to update order status:', error);
        setError(getErrorMessage(error));
        setOrders(previousOrders);
      });
  };

  const deleteOrder = (id: string) => {
    const previousOrders = orders;

    setOrders(prev => prev.filter(order => order.id !== id));

    void apiDelete(`/orders/${id}`).catch(error => {
      console.error('Failed to delete order:', error);
      setError(getErrorMessage(error));
      setOrders(previousOrders);
    });
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const isWishlisted = prev.includes(productId);

      return isWishlisted
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
    });
  };

  return (
    <ProductContext.Provider
      value={{
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
        customers,

        wishlist,
        toggleWishlist,

        loading,
        error,
        refreshData
      }}
    >
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