import { AdminLayout } from './AdminDashboard';
import { Ticket, Plus, Trash2, Save, Truck } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function AdminMarketing() {
  const { storeSettings, updateStoreSettings, addCoupon, deleteCoupon } = useProducts();
  const [newCoupon, setNewCoupon] = useState({ code: '', discountPercent: '' });
  const [shippingChittagong, setShippingChittagong] = useState(storeSettings.shippingChittagong.toString());
  const [shippingOutside, setShippingOutside] = useState(storeSettings.shippingOutsideChittagong.toString());

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discountPercent) return;
    
    addCoupon({
      code: newCoupon.code.toUpperCase(),
      discountPercent: parseInt(newCoupon.discountPercent),
      isActive: true
    });
    setNewCoupon({ code: '', discountPercent: '' });
  };

  const handleUpdateShipping = () => {
    updateStoreSettings({ 
      shippingChittagong: parseFloat(shippingChittagong) || 0,
      shippingOutsideChittagong: parseFloat(shippingOutside) || 0
    });
    alert('Shipping costs updated successfully!');
  };

  return (
    <AdminLayout>
      <header className="mb-12">
        <h2 className="text-3xl font-headline font-extrabold tracking-tight">Marketing & Store Settings</h2>
        <p className="text-on-surface-variant">Manage coupons, discounts, and shipping rates.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Settings */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-headline font-bold">Shipping Configuration</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Inside Chittagong (৳)</label>
              <input
                type="number"
                value={shippingChittagong}
                onChange={(e) => setShippingChittagong(e.target.value)}
                className="w-full bg-surface-low border-none rounded-xl px-6 py-4 outline-none focus:ring-1 focus:ring-primary"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Outside Chittagong (৳)</label>
              <input
                type="number"
                value={shippingOutside}
                onChange={(e) => setShippingOutside(e.target.value)}
                className="w-full bg-surface-low border-none rounded-xl px-6 py-4 outline-none focus:ring-1 focus:ring-primary"
                placeholder="0.00"
              />
            </div>
            <button 
              onClick={handleUpdateShipping}
              className="w-full bg-primary text-white px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            >
              <Save className="w-4 h-4" />
              Save Shipping Rates
            </button>
            <p className="text-[10px] text-on-surface-variant/60 italic mt-2">
              These rates will be selectable by customers during checkout.
            </p>
          </div>
        </section>

        {/* Coupon Management */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-headline font-bold">Coupon Codes</h3>
          </div>

          <form onSubmit={handleAddCoupon} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="sm:col-span-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">Code</label>
              <input
                required
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                className="w-full bg-surface-low border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-primary text-xs"
                placeholder="SAVE20"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">Off (%)</label>
              <input
                required
                type="number"
                min="1"
                max="100"
                value={newCoupon.discountPercent}
                onChange={(e) => setNewCoupon({ ...newCoupon, discountPercent: e.target.value })}
                className="w-full bg-surface-low border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-primary text-xs"
                placeholder="20"
              />
            </div>
            <div className="flex items-end">
              <button 
                type="submit"
                className="w-full bg-primary text-white px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </form>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Active Coupons</h4>
            {storeSettings.coupons.length === 0 ? (
              <p className="text-xs text-on-surface-variant/40 italic py-4">No active coupons found.</p>
            ) : (
              <div className="divide-y divide-outline-variant/5">
                {storeSettings.coupons.map((coupon) => (
                  <div key={coupon.id} className="py-4 flex justify-between items-center group">
                    <div>
                      <span className="text-sm font-bold tracking-tighter bg-surface-low px-3 py-1 rounded-lg mr-3">
                        {coupon.code}
                      </span>
                      <span className="text-xs text-green-600 font-bold">{coupon.discountPercent}% OFF</span>
                    </div>
                    <button 
                      onClick={() => deleteCoupon(coupon.id)}
                      className="p-2 text-on-surface-variant/40 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
