export interface Product {
  id: string;
  productCode: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  subCategory?: string;
  image: string;
  description: string;
  productDetails?: string;
  rating: number;
  reviews: number;
  stock: number;
  status: 'Active' | 'Draft' | 'Archived';
  showSizeSection?: boolean;
  sizes?: { size: string; isAvailable: boolean; quantity: number }[];
  colors?: { name: string; hex: string }[];
  extraImages?: string[];
  createdAt: string;
  sizeChart?: {
    title: string;
    columns: string[];
    rows: Record<string, string>[];
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    image: string;
  }[];
  total: number;
  shippingArea?: string;
  shippingCost?: number;
  paymentMethod: 'COD' | 'Card' | 'bKash' | 'Nagad' | 'Upay';
  paymentDetails?: {
    transactionId?: string;
    cardNumber?: string;
    cardExpiry?: string;
    cardCVC?: string;
  };
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
  status: 'Active' | 'Inactive';
}

export const PRODUCTS: Product[] = [
  {
    id: '1',
    productCode: 'MEN-S001',
    name: 'Oxford Cotton Shirt',
    price: 85,
    category: 'Shirt',
    subCategory: 'Formal',
    image:
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1976&auto=format&fit=crop',
    description:
      'A timeless classic. This Oxford shirt is crafted from premium cotton for a crisp, clean look. **100% Organic Cotton** for all-day comfort.',
    rating: 5,
    reviews: 124,
    stock: 42,
    status: 'Active',
    showSizeSection: true,
    createdAt: '2024-01-01T00:00:00Z',
    sizes: [
      { size: 'S', isAvailable: true, quantity: 10 },
      { size: 'M', isAvailable: true, quantity: 15 },
      { size: 'L', isAvailable: true, quantity: 10 },
      { size: 'XL', isAvailable: true, quantity: 7 }
    ],
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Light Blue', hex: '#ADD8E6' },
      { name: 'Navy', hex: '#000080' }
    ],
    extraImages: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1976&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=1974&auto=format&fit=crop'
    ]
  },
  {
    id: '2',
    productCode: 'MEN-T002',
    name: 'Premium Essential Tee',
    price: 35,
    category: 'T-Shirt',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop',
    description:
      'The perfect foundation for any outfit. Our essential tee features a tailored fit and ultra-soft fabric. **Supima Cotton** for superior softness.',
    rating: 4.5,
    reviews: 89,
    stock: 15,
    status: 'Active',
    showSizeSection: true,
    createdAt: '2024-01-02T00:00:00Z',
    sizes: [
      { size: 'S', isAvailable: true, quantity: 5 },
      { size: 'M', isAvailable: true, quantity: 5 },
      { size: 'L', isAvailable: true, quantity: 5 }
    ],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Grey', hex: '#808080' }
    ],
    extraImages: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1974&auto=format&fit=crop'
    ]
  },
  {
    id: '3',
    productCode: 'MEN-P003',
    name: 'Slim Fit Chinos',
    price: 95,
    category: 'Pant',
    image:
      'https://images.unsplash.com/photo-1624371414361-e6e8ea04c112?q=80&w=1974&auto=format&fit=crop',
    description:
      'Versatile and comfortable. These slim-fit chinos are perfect for both casual and semi-formal occasions. **Stretch Twill** for ease of movement.',
    rating: 5,
    reviews: 56,
    stock: 28,
    status: 'Active',
    showSizeSection: true,
    createdAt: '2024-01-03T00:00:00Z',
    sizes: [
      { size: '30', isAvailable: true, quantity: 7 },
      { size: '32', isAvailable: true, quantity: 7 },
      { size: '34', isAvailable: true, quantity: 7 },
      { size: '36', isAvailable: true, quantity: 7 }
    ],
    colors: [
      { name: 'Beige', hex: '#F5F5DC' },
      { name: 'Olive', hex: '#808000' },
      { name: 'Navy', hex: '#000080' }
    ],
    extraImages: [
      'https://images.unsplash.com/photo-1624371414361-e6e8ea04c112?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1974&auto=format&fit=crop'
    ]
  },
  {
    id: '4',
    productCode: 'MEN-SH004',
    name: 'Classic Leather Derby',
    price: 185,
    category: 'Shoes',
    image:
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=2069&auto=format&fit=crop',
    description:
      'Elegant craftsmanship. These leather Derby shoes are handcrafted for a sophisticated finish. **Full-Grain Leather** with a durable sole.',
    rating: 5,
    reviews: 42,
    stock: 8,
    status: 'Active',
    showSizeSection: true,
    createdAt: '2024-01-04T00:00:00Z',
    sizes: [
      { size: '40', isAvailable: true, quantity: 2 },
      { size: '41', isAvailable: true, quantity: 2 },
      { size: '42', isAvailable: true, quantity: 2 },
      { size: '43', isAvailable: true, quantity: 2 }
    ],
    colors: [
      { name: 'Brown', hex: '#8B4513' },
      { name: 'Black', hex: '#000000' }
    ],
    extraImages: [
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=2069&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=2060&auto=format&fit=crop'
    ]
  },
  {
    id: '5',
    productCode: 'MEN-A005',
    name: 'Minimalist Leather Belt',
    price: 45,
    category: 'Accessories',
    image:
      'https://images.unsplash.com/photo-1624222247344-550fbadcd973?q=80&w=2070&auto=format&fit=crop',
    description:
      'The perfect finishing touch. A sleek, minimalist belt made from genuine leather. **Vegetable-Tanned Leather** for a natural patina.',
    rating: 4,
    reviews: 210,
    stock: 12,
    status: 'Active',
    showSizeSection: true,
    createdAt: '2024-01-05T00:00:00Z',
    sizes: [{ size: 'One Size', isAvailable: true, quantity: 12 }],
    colors: [
      { name: 'Tan', hex: '#D2B48C' },
      { name: 'Black', hex: '#000000' }
    ],
    extraImages: [
      'https://images.unsplash.com/photo-1624222247344-550fbadcd973?q=80&w=2070&auto=format&fit=crop'
    ]
  },
  {
    id: '6',
    productCode: 'MEN-S006',
    name: 'Linen Summer Shirt',
    price: 75,
    category: 'Shirt',
    subCategory: 'Casual',
    image:
      'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?q=80&w=1974&auto=format&fit=crop',
    description:
      'Stay cool and stylish. This linen shirt is lightweight and breathable, ideal for warm weather. **100% Pure Linen** for natural texture.',
    rating: 5,
    reviews: 78,
    stock: 24,
    status: 'Active',
    showSizeSection: true,
    createdAt: '2024-01-06T00:00:00Z',
    sizes: [
      { size: 'S', isAvailable: true, quantity: 6 },
      { size: 'M', isAvailable: true, quantity: 6 },
      { size: 'L', isAvailable: true, quantity: 6 },
      { size: 'XL', isAvailable: true, quantity: 6 }
    ],
    colors: [
      { name: 'Light Blue', hex: '#ADD8E6' },
      { name: 'White', hex: '#FFFFFF' }
    ],
    extraImages: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?q=80&w=1974&auto=format&fit=crop'
    ]
  },
  {
    id: '7',
    productCode: 'MEN-C007',
    name: 'Essential Combo Pack',
    price: 110,
    originalPrice: 135,
    category: 'Combo',
    subCategory: 'Value Pack',
    image:
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1974&auto=format&fit=crop',
    description:
      'The ultimate essential pack. Includes one Oxford Cotton Shirt and one Slim Fit Chino. **Save 20%** with this exclusive combo offer.',
    rating: 5,
    reviews: 45,
    stock: 20,
    status: 'Active',
    showSizeSection: true,
    createdAt: '2024-01-07T00:00:00Z',
    sizes: [
      { size: 'S', isAvailable: true, quantity: 5 },
      { size: 'M', isAvailable: true, quantity: 5 },
      { size: 'L', isAvailable: true, quantity: 5 },
      { size: 'XL', isAvailable: true, quantity: 5 }
    ],
    colors: [{ name: 'Multi', hex: '#000000' }],
    extraImages: [
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1974&auto=format&fit=crop'
    ]
  }
];