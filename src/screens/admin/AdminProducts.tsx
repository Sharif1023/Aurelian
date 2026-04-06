import { AdminLayout } from './AdminDashboard';
import { Search, Filter, Plus, Edit3, Trash2, MoreVertical, X, Upload, Check } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import React, { useState } from 'react';
import { Product } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct, categories } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const itemsPerPage = 10;
  
  const [formData, setFormData] = useState({
    name: '',
    productCode: '',
    price: '',
    originalPrice: '',
    discount: '',
    category: 'Apparel',
    subCategory: '',
    image: 'https://picsum.photos/seed/fashion/800/1200',
    description: '',
    productDetails: '',
    stock: '0',
    status: 'Active' as Product['status'],
    sizes: [] as { size: string; isAvailable: boolean; quantity: number }[],
    sizeChart: {
      title: '',
      columns: ['Size', 'Chest', 'Length', 'Sleeve', 'Collar'],
      rows: [] as Record<string, string>[]
    }
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.productCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getDefaultSizesForCategory = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('shirt') || cat.includes('apparel') || cat.includes('t-shirt')) {
      return [
        { size: 'M', isAvailable: true, quantity: 0 },
        { size: 'L', isAvailable: true, quantity: 0 },
        { size: 'XL', isAvailable: true, quantity: 0 },
        { size: 'XXL', isAvailable: true, quantity: 0 },
      ];
    }
    if (cat.includes('shoe') || cat.includes('footwear')) {
      return [
        { size: '39', isAvailable: true, quantity: 0 },
        { size: '40', isAvailable: true, quantity: 0 },
        { size: '41', isAvailable: true, quantity: 0 },
        { size: '42', isAvailable: true, quantity: 0 },
        { size: '43', isAvailable: true, quantity: 0 },
        { size: '44', isAvailable: true, quantity: 0 },
      ];
    }
    if (cat.includes('accessories')) {
      return [{ size: 'One Size', isAvailable: true, quantity: 0 }];
    }
    return [
      { size: 'S', isAvailable: true, quantity: 0 },
      { size: 'M', isAvailable: true, quantity: 0 },
      { size: 'L', isAvailable: true, quantity: 0 },
      { size: 'XL', isAvailable: true, quantity: 0 },
    ];
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        productCode: product.productCode,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || '',
        discount: product.discount?.toString() || '',
        category: product.category,
        subCategory: product.subCategory || '',
        image: product.image,
        description: product.description,
        productDetails: product.productDetails || '',
        stock: product.stock.toString(),
        status: product.status,
        sizes: product.sizes || [],
        sizeChart: product.sizeChart || {
          title: '',
          columns: ['Size', 'Chest', 'Length', 'Sleeve', 'Collar'],
          rows: []
        },
      });
    } else {
      setEditingProduct(null);
      const defaultCategory = 'Apparel';
      setFormData({
        name: '',
        productCode: '',
        price: '',
        originalPrice: '',
        discount: '',
        category: defaultCategory,
        subCategory: '',
        image: 'https://picsum.photos/seed/fashion/800/1200',
        description: '',
        productDetails: '',
        stock: '0',
        status: 'Active',
        sizes: getDefaultSizesForCategory(defaultCategory),
        sizeChart: {
          title: '',
          columns: ['Size', 'Chest', 'Length', 'Sleeve', 'Collar'],
          rows: []
        },
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      productCode: formData.productCode || `ARL-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      discount: formData.discount ? parseFloat(formData.discount) : undefined,
      category: formData.category,
      subCategory: formData.subCategory || undefined,
      image: formData.image,
      description: formData.description,
      productDetails: formData.productDetails || undefined,
      stock: parseInt(formData.stock),
      status: formData.status,
      sizes: formData.sizes,
      sizeChart: formData.sizeChart.rows.length > 0 ? formData.sizeChart : undefined,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }
    setIsModalOpen(false);
  };

  const toggleSizeAvailability = (index: number) => {
    const newSizes = [...formData.sizes];
    newSizes[index].isAvailable = !newSizes[index].isAvailable;
    if (!newSizes[index].isAvailable) {
      newSizes[index].quantity = 0;
    }
    setFormData({ ...formData, sizes: newSizes });
  };

  const updateSizeQuantity = (index: number, quantity: string) => {
    const newSizes = [...formData.sizes];
    const q = parseInt(quantity) || 0;
    newSizes[index].quantity = q;
    newSizes[index].isAvailable = q > 0;
    setFormData({ ...formData, sizes: newSizes });
  };

  const addSize = () => {
    const size = prompt('Enter size (e.g. XXL, 42, etc.):');
    if (size) {
      setFormData({
        ...formData,
        sizes: [...formData.sizes, { size, isAvailable: true, quantity: 0 }]
      });
    }
  };

  const removeSize = (index: number) => {
    const newSizes = formData.sizes.filter((_, i) => i !== index);
    setFormData({ ...formData, sizes: newSizes });
  };

  const addSizeChartRow = () => {
    const newRow: Record<string, string> = {};
    formData.sizeChart.columns.forEach(col => {
      newRow[col] = '';
    });
    setFormData({
      ...formData,
      sizeChart: {
        ...formData.sizeChart,
        rows: [...formData.sizeChart.rows, newRow]
      }
    });
  };

  const updateSizeChartRow = (rowIndex: number, column: string, value: string) => {
    const newRows = [...formData.sizeChart.rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [column]: value };
    setFormData({
      ...formData,
      sizeChart: {
        ...formData.sizeChart,
        rows: newRows
      }
    });
  };

  const removeSizeChartRow = (rowIndex: number) => {
    const newRows = formData.sizeChart.rows.filter((_, i) => i !== rowIndex);
    setFormData({
      ...formData,
      sizeChart: {
        ...formData.sizeChart,
        rows: newRows
      }
    });
  };

  const addSizeChartColumn = () => {
    const colName = prompt('Enter column name:');
    if (colName && !formData.sizeChart.columns.includes(colName)) {
      const newColumns = [...formData.sizeChart.columns, colName];
      const newRows = formData.sizeChart.rows.map(row => ({ ...row, [colName]: '' }));
      setFormData({
        ...formData,
        sizeChart: {
          ...formData.sizeChart,
          columns: newColumns,
          rows: newRows
        }
      });
    }
  };

  const removeSizeChartColumn = (colName: string) => {
    if (window.confirm(`Remove column "${colName}"?`)) {
      const newColumns = formData.sizeChart.columns.filter(c => c !== colName);
      const newRows = formData.sizeChart.rows.map(row => {
        const { [colName]: _, ...rest } = row;
        return rest;
      });
      setFormData({
        ...formData,
        sizeChart: {
          ...formData.sizeChart,
          columns: newColumns,
          rows: newRows
        }
      });
    }
  };

  const handleDuplicate = (product: Product) => {
    const { id, ...rest } = product;
    addProduct({
      ...rest,
      name: `${product.name} (Copy)`,
      productCode: `${product.productCode}-COPY`,
    });
    setOpenMenuId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
      setOpenMenuId(null);
    }
  };

  return (
    <AdminLayout>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
        <div>
          <h2 className="text-3xl font-headline font-extrabold tracking-tight">Products</h2>
          <p className="text-on-surface-variant">Manage your atelier inventory and archives.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md flex items-center justify-center gap-2 hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-outline-variant/20 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-1 focus:ring-primary shadow-sm"
            placeholder="Search products..."
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
          {['All', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "whitespace-nowrap px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm border",
                selectedCategory === cat 
                  ? "bg-primary text-white border-primary" 
                  : "bg-white border-outline-variant/20 text-on-surface-variant hover:bg-surface-low"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table / Mobile View */}
      <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/10 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-low border-b border-outline-variant/10">
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Product</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Category</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Price</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Stock</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-surface-low/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-surface-low rounded-lg overflow-hidden flex-shrink-0">
                        <img className="w-full h-full object-cover" src={product.image} alt={product.name} referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide">{product.name}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Code: {product.productCode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-surface-low rounded-full w-fit">
                        {product.category}
                      </span>
                      {product.subCategory && (
                        <span className="text-[9px] font-medium uppercase tracking-tighter text-on-surface-variant/60 ml-1">
                          ↳ {product.subCategory}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 font-headline font-bold text-sm">৳{product.price.toFixed(2)}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", product.stock > 10 ? "bg-green-500" : "bg-red-500")} />
                      <span className="text-xs font-medium">{product.stock} in stock</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      product.status === 'Active' ? "text-green-600" : "text-amber-600"
                    )}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 relative">
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="p-2 hover:bg-white rounded-lg transition-colors text-on-surface-variant hover:text-primary hidden md:block"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-white rounded-lg transition-colors text-on-surface-variant hover:text-red-600 hidden md:block"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                        className="p-2 hover:bg-white rounded-lg transition-colors text-on-surface-variant"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      <AnimatePresence>
                        {openMenuId === product.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 10 }}
                              className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-outline-variant/10 z-20 overflow-hidden"
                            >
                              <button 
                                onClick={() => handleOpenModal(product)}
                                className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-low transition-colors flex items-center gap-3"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit Product
                              </button>
                              <button 
                                onClick={() => handleDuplicate(product)}
                                className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-low transition-colors flex items-center gap-3"
                              >
                                <Plus className="w-3.5 h-3.5" /> Duplicate
                              </button>
                              <button 
                                onClick={() => handleDelete(product.id)}
                                className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete Product
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="lg:hidden divide-y divide-outline-variant/5">
          {paginatedProducts.map((product) => (
            <div key={product.id} className="p-6 flex gap-4">
              <div className="w-20 h-28 bg-surface-low rounded-xl overflow-hidden flex-shrink-0">
                <img className="w-full h-full object-cover" src={product.image} alt={product.name} referrerPolicy="no-referrer" />
              </div>
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold uppercase tracking-wide">{product.name}</p>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="p-2 text-on-surface-variant hover:text-primary"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 text-on-surface-variant hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
                    {product.category} {product.subCategory ? `• ${product.subCategory}` : ''} • {product.productCode}
                  </p>
                  <p className="font-headline font-bold mt-2">৳{product.price.toFixed(2)}</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    product.status === 'Active' ? "text-green-600" : "text-amber-600"
                  )}>
                    {product.status}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{product.stock} in stock</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-8 py-6 bg-surface-low/30 flex justify-between items-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Page {currentPage} of {totalPages || 1}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-outline-variant/20 rounded-lg text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-surface-low transition-colors"
            >
              Prev
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 bg-white border border-outline-variant/20 rounded-lg text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-surface-low transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 md:p-8 border-b border-outline-variant/10 flex justify-between items-center">
                <h3 className="text-xl md:text-2xl font-headline font-extrabold tracking-tight">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface-low rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Product Name</label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-surface-low border-none rounded-xl px-6 py-4 outline-none focus:ring-1 focus:ring-primary"
                      placeholder="e.g. Silk Evening Gown"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Product Code</label>
                    <input
                      required
                      value={formData.productCode}
                      onChange={(e) => setFormData({...formData, productCode: e.target.value})}
                      className="w-full bg-surface-low border-none rounded-xl px-6 py-4 outline-none focus:ring-1 focus:ring-primary"
                      placeholder="e.g. ARL-W001"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Original Price (৳)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.originalPrice}
                      onChange={(e) => {
                        const orig = parseFloat(e.target.value) || 0;
                        const disc = parseFloat(formData.discount) || 0;
                        const final = disc > 0 ? orig * (1 - disc / 100) : orig;
                        setFormData({
                          ...formData, 
                          originalPrice: e.target.value,
                          price: disc > 0 ? final.toFixed(2) : formData.price
                        });
                      }}
                      className="w-full bg-surface-low border-none rounded-xl px-6 py-4 outline-none focus:ring-1 focus:ring-primary"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Discount (%)</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.discount}
                      onChange={(e) => {
                        const disc = parseFloat(e.target.value) || 0;
                        const orig = parseFloat(formData.originalPrice) || parseFloat(formData.price) || 0;
                        const final = orig * (1 - disc / 100);
                        setFormData({
                          ...formData, 
                          discount: e.target.value,
                          price: final.toFixed(2),
                          originalPrice: formData.originalPrice || formData.price
                        });
                      }}
                      className="w-full bg-surface-low border-none rounded-xl px-6 py-4 outline-none focus:ring-1 focus:ring-primary"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Final Price (৳)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full bg-surface-low border-none rounded-xl px-6 py-4 outline-none focus:ring-1 focus:ring-primary font-bold text-primary"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Category</label>
                    <div className="relative">
                      <input
                        required
                        list="category-list"
                        value={formData.category}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          setFormData({
                            ...formData, 
                            category: newCat,
                            sizes: editingProduct ? formData.sizes : getDefaultSizesForCategory(newCat)
                          });
                        }}
                        className="w-full bg-surface-low border-none rounded-xl px-6 py-4 outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Select or type category"
                      />
                      <datalist id="category-list">
                        {['Apparel', 'Accessories', 'Footwear', 'Jewelry', ...categories].map(cat => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Subcategory (Optional)</label>
                    <input
                      value={formData.subCategory}
                      onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                      className="w-full bg-surface-low border-none rounded-xl px-6 py-4 outline-none focus:ring-1 focus:ring-primary"
                      placeholder="e.g. Formal, Casual, Winter"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Stock</label>
                    <input
                      required
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      className="w-full bg-surface-low border-none rounded-xl px-6 py-4 outline-none focus:ring-1 focus:ring-primary"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full bg-surface-low border-none rounded-xl px-6 py-4 outline-none focus:ring-1 focus:ring-primary appearance-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Image URL or Upload</label>
                    <div className="relative">
                      <input
                        required
                        value={formData.image}
                        onChange={(e) => setFormData({...formData, image: e.target.value})}
                        className="w-full bg-surface-low border-none rounded-xl px-6 py-4 outline-none focus:ring-1 focus:ring-primary pr-12"
                        placeholder="https://..."
                      />
                      <button 
                        type="button"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white rounded-lg transition-colors text-on-surface-variant/40 hover:text-primary"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <input 
                        id="image-upload"
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, image: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Size Availability</label>
                    <button 
                      type="button"
                      onClick={addSize}
                      className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                    >
                      + Add Size
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formData.sizes.map((s, index) => (
                      <div key={index} className="relative group bg-surface-low p-4 rounded-2xl border border-outline-variant/10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold uppercase tracking-widest">{s.size}</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => toggleSizeAvailability(index)}
                              className={cn(
                                "p-1.5 rounded-lg transition-all",
                                s.isAvailable ? "bg-primary text-white" : "bg-on-surface-variant/10 text-on-surface-variant"
                              )}
                            >
                              {s.isAvailable ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSize(index)}
                              className="p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Qty:</label>
                          <input
                            type="number"
                            min="0"
                            value={s.quantity}
                            onChange={(e) => updateSizeQuantity(index, e.target.value)}
                            className="w-full bg-white border border-outline-variant/20 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {formData.sizes.length === 0 && (
                    <p className="text-[10px] text-on-surface-variant/60 italic">No sizes defined for this product.</p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Size Chart (Measurement Table)</label>
                    <div className="flex gap-4">
                      <button 
                        type="button"
                        onClick={addSizeChartColumn}
                        className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                      >
                        + Add Column
                      </button>
                      <button 
                        type="button"
                        onClick={addSizeChartRow}
                        className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                      >
                        + Add Row
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Chart Title (e.g. Panjabi Size Chart)</label>
                    <input 
                      value={formData.sizeChart.title}
                      onChange={(e) => setFormData({
                        ...formData,
                        sizeChart: { ...formData.sizeChart, title: e.target.value }
                      })}
                      className="w-full bg-surface-low border-none rounded-xl px-6 py-3 outline-none focus:ring-1 focus:ring-primary text-xs"
                      placeholder="e.g. Panjabi Size Chart"
                    />
                  </div>

                  <div className="overflow-x-auto border border-outline-variant/10 rounded-2xl">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="bg-surface-low">
                          {formData.sizeChart.columns.map((col, i) => (
                            <th key={i} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant relative group">
                              <div className="flex items-center justify-between">
                                {col}
                                <button 
                                  type="button"
                                  onClick={() => removeSizeChartColumn(col)}
                                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </th>
                          ))}
                          <th className="px-4 py-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/5">
                        {formData.sizeChart.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {formData.sizeChart.columns.map((col, colIndex) => (
                              <td key={colIndex} className="px-2 py-2">
                                <input 
                                  value={row[col] || ''}
                                  onChange={(e) => updateSizeChartRow(rowIndex, col, e.target.value)}
                                  className="w-full bg-transparent border-none px-2 py-1 text-xs outline-none focus:bg-surface-low rounded"
                                  placeholder="..."
                                />
                              </td>
                            ))}
                            <td className="px-2 py-2 text-right">
                              <button 
                                type="button"
                                onClick={() => removeSizeChartRow(rowIndex)}
                                className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {formData.sizeChart.rows.length === 0 && (
                      <div className="p-8 text-center text-[10px] text-on-surface-variant/60 italic">
                        No measurement data added yet. Click "+ Add Row" to start.
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Short Description</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-surface-low border-none rounded-xl px-6 py-4 outline-none focus:ring-1 focus:ring-primary resize-none"
                    placeholder="Brief summary of the product..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Product Details (Materials, Care, etc.)</label>
                  <textarea
                    rows={6}
                    value={formData.productDetails}
                    onChange={(e) => setFormData({...formData, productDetails: e.target.value})}
                    className="w-full bg-surface-low border-none rounded-xl px-6 py-4 outline-none focus:ring-1 focus:ring-primary resize-none"
                    placeholder="List the technical details, materials, and care instructions..."
                  />
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 rounded-xl border border-outline-variant/30 text-[10px] font-bold uppercase tracking-widest hover:bg-surface-low transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg hover:shadow-xl transition-all active:scale-95"
                  >
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
