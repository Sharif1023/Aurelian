import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, TrendingUp, DollarSign, PackageCheck, AlertCircle, Menu, X, Plus, Ticket } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ReactNode, useState } from 'react';
import { useProducts } from '../../context/ProductContext';

export function AdminLayout({ children }: { children: ReactNode }) {
  const { products, orders, storeSettings } = useProducts();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const adminPath = localStorage.getItem('admin_path') || 'admin';

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: `/${adminPath}` },
    { icon: Package, label: 'Products', path: `/${adminPath}/products` },
    { icon: ShoppingCart, label: 'Orders', path: `/${adminPath}/orders` },
    { icon: Users, label: 'Customers', path: `/${adminPath}/customers` },
    { icon: Ticket, label: 'Marketing', path: `/${adminPath}/marketing` },
    { icon: Settings, label: 'Settings', path: `/${adminPath}/settings` },
  ];

  return (
    <div className="min-h-screen bg-[#f1f1ef] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-outline-variant/10 p-4 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <h1 className={cn(
            "font-black text-xl tracking-[0.3em] uppercase",
            storeSettings.brandSettings?.fontFamily || 'font-display'
          )}
          style={{ color: storeSettings.brandSettings?.color || 'inherit' }}
          >
            {storeSettings.brandSettings?.name || 'AURELIAN'}
          </h1>
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-surface-low rounded-xl transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-outline-variant/10 flex flex-col p-6 fixed h-full z-50 transition-transform duration-300 md:translate-x-0 w-64",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Link to="/" className="mb-12 hidden md:block">
          <h1 className={cn(
            "font-black text-2xl tracking-[0.3em] uppercase",
            storeSettings.brandSettings?.fontFamily || 'font-display'
          )}
          style={{ color: storeSettings.brandSettings?.color || 'inherit' }}
          >
            {storeSettings.brandSettings?.name || 'AURELIAN'}
          </h1>
          <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest mt-1">Admin Portal</p>
        </Link>
        <nav className="flex-grow space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                  isActive ? "bg-primary text-white shadow-md" : "text-on-surface-variant hover:bg-surface-low"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-on-surface-variant/60 group-hover:text-primary")} />
                <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <button 
          onClick={() => {
            sessionStorage.removeItem('admin_authenticated');
            navigate('/');
          }}
          className="flex items-center gap-4 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-red-50 hover:text-red-600 transition-all mt-auto"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow md:ml-64 p-4 md:p-10">
        {children}
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { products, orders } = useProducts();

  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const stockAlerts = products.filter(p => p.stock < 10).length;

  return (
    <AdminLayout>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
        <div>
          <h2 className="text-2xl md:text-3xl font-headline font-extrabold tracking-tight">Overview</h2>
          <p className="text-sm text-on-surface-variant">Welcome back, Atelier Manager.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button 
            onClick={() => {
              const data = products.map(p => ({ name: p.name, stock: p.stock, price: p.price }));
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'atelier-report.json';
              a.click();
            }}
            className="bg-white border border-outline-variant/30 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm hover:bg-surface-low transition-colors"
          >
            Export Report
          </button>
          <button 
            onClick={() => navigate(`/${localStorage.getItem('admin_path') || 'admin'}/products`)}
            className="bg-primary text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md flex items-center justify-center gap-2 hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" />
            New Product
          </button>
        </div>
      </header>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Revenue', value: `৳${totalRevenue.toFixed(2)}`, change: '+12.5%', icon: DollarSign, color: 'bg-green-50 text-green-600' },
          { label: 'Total Products', value: products.length.toString(), change: '+2', icon: Package, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Orders', value: orders.length.toString(), change: '+0.8%', icon: ShoppingCart, color: 'bg-purple-50 text-purple-600' },
          { label: 'Stock Alerts', value: stockAlerts.toString(), change: '-2', icon: AlertCircle, color: 'bg-red-50 text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-outline-variant/10">
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-3 rounded-2xl", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-green-600">{stat.change}</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">{stat.label}</p>
            <p className="text-xl md:text-2xl font-headline font-black">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-outline-variant/10">
          <h3 className="text-sm font-bold mb-8 uppercase tracking-widest">Sales Performance</h3>
          <div className="h-48 md:h-64 flex items-end justify-between gap-1 md:gap-2">
            {[40, 70, 45, 90, 65, 80, 100, 85, 60, 75, 55, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-surface-low rounded-t-lg relative group">
                <div
                  className="absolute bottom-0 left-0 w-full bg-primary/20 group-hover:bg-primary transition-all rounded-t-lg"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-outline-variant/10">
          <h3 className="text-sm font-bold mb-8 uppercase tracking-widest">Recent Orders</h3>
          <div className="space-y-6">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex justify-between items-center pb-4 border-b border-outline-variant/5 last:border-0 last:pb-0">
                <div>
                  <p className="text-xs font-bold">{order.orderNumber}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold">৳{order.total.toFixed(2)}</p>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-tighter",
                    order.status === 'Delivered' ? "text-green-600" : 
                    order.status === 'Pending' ? "text-amber-600" : "text-blue-600"
                  )}>{order.status}</span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-xs text-on-surface-variant text-center py-8">No orders yet.</p>
            )}
          </div>
          <button 
            onClick={() => navigate(`/${localStorage.getItem('admin_path') || 'admin'}/orders`)}
            className="w-full mt-8 py-4 border border-outline-variant/30 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-surface-low transition-colors"
          >
            View All Orders
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
