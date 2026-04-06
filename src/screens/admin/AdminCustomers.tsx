import { AdminLayout } from './AdminDashboard';
import { Search, Filter, MoreVertical, Mail, Phone, MapPin } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useState } from 'react';

const CUSTOMERS = [
  { id: 'CUS-001', name: 'Elena Rossi', email: 'elena@example.com', phone: '+39 333 1234567', orders: 12, spent: '৳4,200.00', status: 'Active' },
  { id: 'CUS-002', name: 'Marcus Vane', email: 'marcus@example.com', phone: '+44 20 7123 4567', orders: 8, spent: '৳2,850.00', status: 'Active' },
  { id: 'CUS-003', name: 'Sofia K.', email: 'sofia@example.com', phone: '+33 1 23 45 67 89', orders: 5, spent: '৳1,185.00', status: 'Inactive' },
  { id: 'CUS-004', name: 'Julian M.', email: 'julian@example.com', phone: '+49 30 123456', orders: 3, spent: '৳940.00', status: 'Active' },
  { id: 'CUS-005', name: 'Isabella L.', email: 'isabella@example.com', phone: '+34 91 123 45 67', orders: 15, spent: '৳6,890.00', status: 'Active' },
];

export default function AdminCustomers() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = CUSTOMERS.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl md:text-3xl font-headline font-extrabold tracking-tight">Customer Management</h1>
          <p className="text-sm text-on-surface-variant">Manage your global clientele and their preferences.</p>
        </header>

        <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-low border-none rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-primary"
                placeholder="Search by name or email..."
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-outline-variant/20 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-surface-low transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
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
                    <td className="px-8 py-6 text-xs">{customer.orders} orders</td>
                    <td className="px-8 py-6 font-headline font-bold text-sm">{customer.spent}</td>
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
