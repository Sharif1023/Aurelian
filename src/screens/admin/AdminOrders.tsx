import { AdminLayout } from './AdminDashboard';
import { Search, Filter, Eye, Download, MoreHorizontal, Calendar, X, Check, Truck, XCircle, Clock, Trash2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useProducts } from '../../context/ProductContext';
import { Order } from '../../types';

export default function AdminOrders() {
  const { orders, updateOrderStatus, deleteOrder } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All Orders');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const itemsPerPage = 10;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-amber-600 bg-amber-50';
      case 'Processing': return 'text-blue-600 bg-blue-50';
      case 'Shipped': return 'text-purple-600 bg-purple-50';
      case 'Delivered': return 'text-green-600 bg-green-50';
      case 'Cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'All Orders' || order.status === activeTab;
    
    const orderDate = order.createdAt.split('T')[0];
    const matchesDate = (!dateRange.start || orderDate >= dateRange.start) &&
                       (!dateRange.end || orderDate <= dateRange.end);
    
    return matchesSearch && matchesTab && matchesDate;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer', 'Email', 'Phone', 'Total', 'Status', 'Payment Method'];
    const rows = filteredOrders.map(o => [
      o.orderNumber, 
      new Date(o.createdAt).toLocaleDateString(), 
      o.customerName, 
      o.email,
      o.phone,
      o.total.toFixed(2), 
      o.status,
      o.paymentMethod
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `atelier-orders-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const handleStatusUpdate = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
    setOpenMenuId(null);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      deleteOrder(orderId);
      setOpenMenuId(null);
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
    }
  };

  return (
    <AdminLayout>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
        <div>
          <h2 className="text-2xl md:text-3xl font-headline font-extrabold tracking-tight">Orders</h2>
          <p className="text-sm text-on-surface-variant">Track and manage your global atelier shipments.</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <button 
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none bg-white border border-outline-variant/30 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm flex items-center justify-center gap-2 hover:bg-surface-low transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </header>

      {/* Order Status Tabs */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar mb-8 pb-2">
        {['All Orders', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className={cn(
              "whitespace-nowrap px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm border",
              activeTab === tab 
                ? "bg-primary text-white border-primary" 
                : "bg-white border-outline-variant/10 text-on-surface-variant hover:bg-surface-low"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders Table / Mobile List */}
      <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/10">
        <div className="p-6 border-b border-outline-variant/10 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-surface-low border-none rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-primary"
              placeholder="Search by Order #, Customer, or Email..."
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white border border-outline-variant/20 rounded-xl px-4 py-2">
              <Calendar className="w-4 h-4 text-on-surface-variant" />
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="text-[10px] font-bold uppercase tracking-widest outline-none bg-transparent"
              />
              <span className="text-on-surface-variant text-[10px]">—</span>
              <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="text-[10px] font-bold uppercase tracking-widest outline-none bg-transparent"
              />
            </div>
            <button 
              onClick={() => setDateRange({ start: '', end: '' })}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-outline-variant/20 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-surface-low transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-low/50 border-b border-outline-variant/10">
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Order #</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Date</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Customer</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Items Detail</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Total</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {paginatedOrders.length > 0 ? paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-low/50 transition-colors group">
                  <td className="px-8 py-6 text-xs font-bold">{order.orderNumber}</td>
                  <td className="px-8 py-6 text-xs text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-8 py-6 text-xs font-medium">
                    <div>{order.customerName}</div>
                    <div className="text-[10px] text-on-surface-variant">{order.email}</div>
                  </td>
                  <td className="px-8 py-6 text-xs">
                    <div className="max-w-[200px]">
                      {order.items.map((item, i) => (
                        <div key={i} className="truncate text-[10px] text-on-surface-variant">
                          {item.quantity}x {item.name} ({item.size})
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6 font-headline font-bold text-sm">৳{order.total.toFixed(2)}</td>
                  <td className="px-8 py-6">
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full", getStatusColor(order.status))}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-white rounded-lg transition-colors text-on-surface-variant hover:text-primary"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === order.id ? null : order.id);
                          }}
                          className="p-2 hover:bg-surface-low rounded-lg transition-colors text-on-surface-variant"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <AnimatePresence>
                          {openMenuId === order.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-[60]" 
                                onClick={() => setOpenMenuId(null)}
                              />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-outline-variant/10 py-2 z-[70]"
                              >
                                <button 
                                  onClick={() => handleStatusUpdate(order.id, 'Processing')}
                                  className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-low hover:text-primary transition-colors flex items-center gap-3"
                                >
                                  <Clock className="w-3.5 h-3.5" /> Processing
                                </button>
                                <button 
                                  onClick={() => handleStatusUpdate(order.id, 'Shipped')}
                                  className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-low hover:text-primary transition-colors flex items-center gap-3"
                                >
                                  <Truck className="w-3.5 h-3.5" /> Ship Order
                                </button>
                                <button 
                                  onClick={() => handleStatusUpdate(order.id, 'Delivered')}
                                  className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-low hover:text-primary transition-colors flex items-center gap-3"
                                >
                                  <Check className="w-3.5 h-3.5" /> Deliver Order
                                </button>
                                <div className="my-1 border-t border-outline-variant/5" />
                                <button 
                                  onClick={() => handleStatusUpdate(order.id, 'Cancelled')}
                                  className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Cancel Order
                                </button>
                                {order.status === 'Delivered' && (
                                  <button 
                                    onClick={() => handleDeleteOrder(order.id)}
                                    className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete Order
                                  </button>
                                )}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-8 py-12 text-center text-on-surface-variant text-sm">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="lg:hidden divide-y divide-outline-variant/5">
          {paginatedOrders.length > 0 ? paginatedOrders.map((order) => (
            <div key={order.id} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold">{order.orderNumber}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={cn("text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full", getStatusColor(order.status))}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs font-medium">{order.customerName}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">{order.items.length} items</p>
                </div>
                <div className="text-right">
                  <p className="font-headline font-bold text-sm">৳{order.total.toFixed(2)}</p>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 bg-surface-low rounded-lg text-on-surface-variant"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === order.id ? null : order.id);
                        }}
                        className="p-2 bg-surface-low rounded-lg text-on-surface-variant"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <AnimatePresence>
                        {openMenuId === order.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-[60]" 
                              onClick={() => setOpenMenuId(null)}
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 10 }}
                              className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-2xl shadow-2xl border border-outline-variant/10 py-2 z-[70]"
                            >
                              <button 
                                onClick={() => handleStatusUpdate(order.id, 'Processing')}
                                className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-low transition-colors flex items-center gap-3"
                              >
                                <Clock className="w-3.5 h-3.5" /> Processing
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(order.id, 'Shipped')}
                                className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-low transition-colors flex items-center gap-3"
                              >
                                <Truck className="w-3.5 h-3.5" /> Shipped
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(order.id, 'Delivered')}
                                className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-low transition-colors flex items-center gap-3"
                              >
                                <Check className="w-3.5 h-3.5" /> Delivered
                              </button>
                              <div className="my-1 border-t border-outline-variant/5" />
                              <button 
                                onClick={() => handleStatusUpdate(order.id, 'Cancelled')}
                                className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Cancelled
                              </button>
                              {order.status === 'Delivered' && (
                                <button 
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete Order
                                </button>
                              )}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center text-on-surface-variant text-sm">No orders found.</div>
          )}
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

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-headline font-bold">Order Details</h3>
                    <p className="text-xs text-on-surface-variant font-mono mt-1">{selectedOrder.orderNumber}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-surface-low rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Customer</p>
                      <p className="text-sm font-medium">{selectedOrder.customerName}</p>
                      <p className="text-xs text-on-surface-variant">{selectedOrder.email}</p>
                      <p className="text-xs text-on-surface-variant">{selectedOrder.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Shipping Address</p>
                      <p className="text-sm font-medium">{selectedOrder.address}</p>
                      <p className="text-xs text-on-surface-variant">{selectedOrder.city}, {selectedOrder.zip}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Date</p>
                      <p className="text-sm font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Payment Method</p>
                      <p className="text-sm font-medium uppercase">{selectedOrder.paymentMethod}</p>
                      {selectedOrder.paymentDetails?.transactionId && (
                        <p className="text-[10px] font-mono text-primary">TXID: {selectedOrder.paymentDetails.transactionId}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</p>
                      <span className={cn("inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mt-1", getStatusColor(selectedOrder.status))}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Order Items</p>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-surface-low rounded-2xl">
                        <div className="w-12 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-grow">
                          <p className="text-xs font-bold">{item.name}</p>
                          <p className="text-[10px] text-on-surface-variant uppercase">Size: {item.size} / Color: {item.color}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold">৳{item.price.toFixed(2)} x {item.quantity}</p>
                          <p className="text-xs font-headline font-black">৳{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                      {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            handleStatusUpdate(selectedOrder.id, status as any);
                            setSelectedOrder({ ...selectedOrder, status: status as any });
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border",
                            selectedOrder.status === status
                              ? "bg-primary text-white border-primary"
                              : "bg-surface-low border-outline-variant/10 text-on-surface-variant hover:bg-outline-variant/10"
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4 w-full sm:w-auto">
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="flex-1 sm:flex-none px-6 py-3 bg-surface-low rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-outline-variant/10 transition-colors"
                    >
                      Close
                    </button>
                    <button className="flex-1 sm:flex-none px-6 py-3 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md hover:scale-105 transition-transform">
                      Print Invoice
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
