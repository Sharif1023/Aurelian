import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, Calendar, MapPin, Info, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProducts } from '../../context/ProductContext';
import { cn } from '@/src/lib/utils';
import Invoice from '../../components/Invoice';

export default function TrackOrder() {
  const { orders, storeSettings } = useProducts();
  const [orderNumber, setOrderNumber] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const order = orders.find(o => o.orderNumber.toUpperCase() === orderNumber.toUpperCase().trim());
    if (order) {
      setSearchedOrder(order);
    } else {
      setSearchedOrder(null);
      setError('Order not found. Please check your order number and try again.');
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Processing': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      case 'Cancelled': return 0;
      default: return 1;
    }
  };

  const getEstimatedDate = (createdAt: string, city: string) => {
    const date = new Date(createdAt);
    const daysToAdd = city.toLowerCase().includes('chittagong') ? 3 : 5;
    date.setDate(date.getDate() + daysToAdd);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const steps = [
    { label: 'Order Placed', icon: Clock, description: 'We have received your order' },
    { label: 'Processing', icon: Package, description: 'Your items are being prepared' },
    { label: 'Shipped', icon: Truck, description: 'Your order is on the way' },
    { label: 'Delivered', icon: CheckCircle, description: 'Order has been delivered' },
  ];

  const currentStep = searchedOrder ? getStatusStep(searchedOrder.status) : 0;

  return (
    <div className="min-h-screen bg-surface-lowest pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-headline font-black uppercase tracking-tight">Track Your Order</h1>
          <p className="text-on-surface-variant max-w-lg mx-auto">
            Enter your order number to check the current status of your luxury shipment.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/10">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40" />
              <input
                type="text"
                placeholder="Enter Order Number (e.g. ARL-12345)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full bg-surface-low border-none rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Track Order
            </button>
          </form>
          {error && <p className="text-red-500 text-xs mt-4 font-medium flex items-center gap-2"><Info className="w-4 h-4" /> {error}</p>}
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {searchedOrder && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Status Timeline */}
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-outline-variant/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">Tracking ID</p>
                    <h2 className="text-3xl sm:text-4xl font-headline font-black text-primary tracking-tighter uppercase">
                      {searchedOrder.orderNumber}
                    </h2>
                    <p className="text-xs text-on-surface-variant">Placed on {new Date(searchedOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button 
                      onClick={() => setShowInvoice(true)}
                      className="px-6 py-3 bg-surface-low hover:bg-surface-medium text-primary rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Invoice
                    </button>
                    <div className="px-6 py-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                        {searchedOrder.status}
                      </span>
                    </div>
                  </div>
                </div>

                {searchedOrder.status === 'Cancelled' ? (
                  <div className="flex flex-col items-center py-10 text-center space-y-4 bg-red-50 rounded-3xl border border-red-100">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                      <XCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-900">Order Cancelled</h3>
                      <p className="text-sm text-red-700 max-w-xs">This order has been cancelled. Please contact support for more information.</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-5 left-5 md:left-0 md:top-6 md:w-full h-[calc(100%-40px)] md:h-0.5 bg-surface-low z-0">
                      <div 
                        className="h-full bg-primary transition-all duration-1000" 
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                      />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 md:gap-4">
                      {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = index + 1 <= currentStep;
                        const isCurrent = index + 1 === currentStep;

                        return (
                          <div key={step.label} className="flex md:flex-col items-start md:items-center gap-4 md:text-center flex-1">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                              isCompleted ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-white border-2 border-surface-low text-on-surface-variant/30"
                            )}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                              <p className={cn(
                                "text-xs font-bold uppercase tracking-widest",
                                isCompleted ? "text-primary" : "text-on-surface-variant/40"
                              )}>
                                {step.label}
                              </p>
                              <p className="text-[10px] text-on-surface-variant/60 max-w-[120px] leading-tight">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/10 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-low rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-widest">Delivery Estimate</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-headline font-black text-primary">
                      {searchedOrder.status === 'Delivered' ? 'Delivered' : getEstimatedDate(searchedOrder.createdAt, searchedOrder.city)}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {searchedOrder.status === 'Delivered' 
                        ? 'Your order has been successfully delivered.' 
                        : 'Estimated arrival at your shipping address.'}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/10 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-low rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-widest">Shipping To</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold">{searchedOrder.customerName}</p>
                    <p className="text-xs text-on-surface-variant">{searchedOrder.address}</p>
                    <p className="text-xs text-on-surface-variant">{searchedOrder.city}, {searchedOrder.zip}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showInvoice && searchedOrder && (
            <Invoice 
              order={searchedOrder} 
              brandName={storeSettings.brandSettings.name} 
              onClose={() => setShowInvoice(false)} 
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function XCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
