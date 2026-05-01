import { AdminLayout } from './AdminDashboard';
import { Search, Mail, Phone, MoreVertical } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useState } from 'react';
import { useProducts } from '../../context/ProductContext';

export default function AdminCustomers() {
  const { customers } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl md:text-3xl font-headline font-extrabold tracking-tight">Customer Management</h1>
          <p className="text-sm text-on-surface-variant">Manage your global clientele and their preferences.</p>
        </header>

        <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-low border-none rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-primary"
                placeholder="Search by name or email..."
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-low/50 border-b border-outline-variant/10">
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Customer</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Contact</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Orders</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Total Spent</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Status</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-10 text-center text-sm text-on-surface-variant">
                      No customers found yet. Customers are created automatically after checkout using email and phone.
                    </td>
                  </tr>
                )}
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-surface-low/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide">{customer.name}</p>
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">{customer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs">{customer.totalOrders} orders</td>
                    <td className="px-8 py-6 font-headline font-bold text-sm">৳{customer.totalSpent.toFixed(2)}</td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
                        customer.status === 'Active' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      )}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 hover:bg-white rounded-lg transition-colors text-on-surface-variant">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
