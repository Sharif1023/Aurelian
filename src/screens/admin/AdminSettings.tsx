import { AdminLayout } from './AdminDashboard';
import { Settings, Bell, Shield, Globe, CreditCard, User, Save, Layout, Plus, Trash2, Upload, Image as ImageIcon, Check, Key as KeyIcon, Lock as LockIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { useProducts } from '../../context/ProductContext';

export default function AdminSettings() {
  const { products, homeSettings, updateHomeSettings, updateProduct, storeSettings, updateStoreSettings, categories } = useProducts();
  const [activeTab, setActiveTab] = useState('Home Page');
  const [localSettings, setLocalSettings] = useState(homeSettings);

  useEffect(() => {
    setLocalSettings(homeSettings);
  }, [homeSettings]);

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    storeName: 'Aurelian Luxe',
    storeEmail: 'atelier@aurelian.com',
    storeDescription: 'A global destination for curated luxury and timeless elegance.',
    currency: 'BDT (৳)',
    weightUnit: 'Kilograms (kg)'
  });

  const heroInputRef = useRef<HTMLInputElement>(null);
  const socialInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const tabs = [
    { icon: Layout, label: 'Home Page' },
    { icon: User, label: 'Brand Settings' },
    { icon: Layout, label: 'Categories' },
    { icon: Settings, label: 'General' },
    { icon: Bell, label: 'Notifications' },
    { icon: Shield, label: 'Security' },
    { icon: Globe, label: 'Localization' },
    { icon: CreditCard, label: 'Payments' },
    { icon: User, label: 'Account' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveHome = () => {
    updateHomeSettings(localSettings);
    alert('Home page settings saved successfully!');
  };

  const handleSaveBrand = () => {
    updateStoreSettings({ brandSettings: storeSettings.brandSettings });
    alert('Brand settings saved successfully!');
  };

  const handleSaveGeneral = () => {
    alert('General settings saved successfully!');
    // In a real app, we'd update a global store or backend here
  };

  const addSocialImage = () => {
    setLocalSettings(prev => ({
      ...prev,
      socialGallery: [...prev.socialGallery, '']
    }));
  };

  const updateSocialImage = (index: number, url: string) => {
    const newGallery = [...localSettings.socialGallery];
    newGallery[index] = url;
    setLocalSettings(prev => ({ ...prev, socialGallery: newGallery }));
  };

  const removeSocialImage = (index: number) => {
    setLocalSettings(prev => ({
      ...prev,
      socialGallery: prev.socialGallery.filter((_, i) => i !== index)
    }));
  };

  const toggleBestSeller = (id: string) => {
    setLocalSettings(prev => {
      const isSelected = prev.bestSellerIds.includes(id);
      if (isSelected) {
        return { ...prev, bestSellerIds: prev.bestSellerIds.filter(bid => bid !== id) };
      } else {
        return { ...prev, bestSellerIds: [...prev.bestSellerIds, id] };
      }
    });
  };

  const handleProductImageUpload = (productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e, (base64) => {
      updateProduct(productId, { image: base64 });
      alert('Product image updated successfully!');
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl md:text-3xl font-headline font-extrabold tracking-tight">System Settings</h1>
          <p className="text-sm text-on-surface-variant">Configure your atelier's global preferences and security.</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Settings Navigation */}
          <aside className="w-full lg:w-64 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.label;
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className={cn(
                    "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group",
                    isActive ? "bg-primary text-white shadow-md" : "bg-white text-on-surface-variant hover:bg-surface-low"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-on-surface-variant/60 group-hover:text-primary")} />
                  <span className="text-xs font-bold uppercase tracking-widest">{tab.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Settings Content */}
          <div className="flex-grow bg-white rounded-3xl shadow-sm border border-outline-variant/10 p-8">
            <div className="max-w-4xl space-y-10">
              {activeTab === 'Home Page' && (
                <div className="space-y-10">
                  {/* Hero Section Settings */}
                  <section className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant">Hero Section</h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Hero Image</label>
                        <div className="flex gap-4 items-center">
                          <div className="w-24 h-16 rounded-xl overflow-hidden bg-surface-low flex-shrink-0 border border-outline-variant/10">
                            {localSettings.heroImage ? (
                              <img src={localSettings.heroImage} className="w-full h-full object-cover" alt="Hero Preview" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-on-surface-variant/20">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow flex gap-2">
                            <input 
                              className="flex-grow bg-surface-low border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-primary" 
                              placeholder="Image URL"
                              value={localSettings.heroImage}
                              onChange={(e) => setLocalSettings({ ...localSettings, heroImage: e.target.value })}
                            />
                            <input 
                              type="file" 
                              className="hidden" 
                              ref={heroInputRef} 
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, (base64) => setLocalSettings({ ...localSettings, heroImage: base64 }))}
                            />
                            <button 
                              onClick={() => heroInputRef.current?.click()}
                              className="px-4 bg-surface-low hover:bg-surface-lowest rounded-xl flex items-center justify-center transition-colors border border-outline-variant/10"
                              title="Upload Image"
                            >
                              <Upload className="w-4 h-4 text-on-surface-variant" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Hero Badge (e.g. Autumn / Winter 2024)</label>
                        <input 
                          className="w-full bg-surface-low border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-primary" 
                          value={localSettings.heroBadge}
                          onChange={(e) => setLocalSettings({ ...localSettings, heroBadge: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Hero Title (Use \n for line break)</label>
                        <input 
                          className="w-full bg-surface-low border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-primary" 
                          value={localSettings.heroTitle}
                          onChange={(e) => setLocalSettings({ ...localSettings, heroTitle: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Hero Subtitle</label>
                        <textarea 
                          className="w-full bg-surface-low border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-primary h-24 resize-none" 
                          value={localSettings.heroSubtitle}
                          onChange={(e) => setLocalSettings({ ...localSettings, heroSubtitle: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Hero Video URL (Watch Film)</label>
                        <input 
                          className="w-full bg-surface-low border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-primary" 
                          placeholder="YouTube Video URL"
                          value={localSettings.heroVideoUrl}
                          onChange={(e) => setLocalSettings({ ...localSettings, heroVideoUrl: e.target.value })}
                        />
                      </div>
                    </div>
                  </section>

                  {/* Best Sellers Selection */}
                  <section className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant">Best Sellers</h3>
                    <p className="text-xs text-on-surface-variant/60">Select products to feature and manage their images (URL or Upload).</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {products.map(product => (
                        <div key={product.id} className="flex gap-4 bg-surface-low/30 p-4 rounded-2xl border border-outline-variant/10 group">
                          <button
                            onClick={() => toggleBestSeller(product.id)}
                            className={cn(
                              "relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0",
                              localSettings.bestSellerIds.includes(product.id) ? "border-primary" : "border-transparent opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
                            )}
                          >
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            {localSettings.bestSellerIds.includes(product.id) && (
                              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                <div className="bg-primary text-white p-1 rounded-full">
                                  <Check className="w-3 h-3" />
                                </div>
                              </div>
                            )}
                          </button>
                          
                          <div className="flex-grow space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest truncate">{product.name}</p>
                            <div className="flex gap-2">
                              <input 
                                className="flex-grow bg-white border-none rounded-lg py-2 px-3 text-[10px] outline-none focus:ring-1 focus:ring-primary" 
                                placeholder="Image URL"
                                value={product.image}
                                onChange={(e) => updateProduct(product.id, { image: e.target.value })}
                              />
                              <input 
                                type="file" 
                                id={`upload-${product.id}`}
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleProductImageUpload(product.id, e)}
                              />
                              <label 
                                htmlFor={`upload-${product.id}`}
                                className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm cursor-pointer hover:bg-surface-low transition-colors border border-outline-variant/10"
                                title="Upload Image"
                              >
                                <Upload className="w-3 h-3 text-primary" />
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Curated Edits Settings */}
                  <section className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant">Curated Edits (Home Page)</h3>
                      <button 
                        onClick={() => {
                          const newItems = [...(localSettings.curatedEdits?.items || []), {
                            id: Math.random().toString(36).substr(2, 9),
                            title: 'New Edit',
                            subtitle: 'New Subtitle',
                            image: '',
                            link: '/collection'
                          }];
                          setLocalSettings({
                            ...localSettings,
                            curatedEdits: { ...(localSettings.curatedEdits || { title: 'Curated Edits', items: [] }), items: newItems }
                          });
                        }}
                        className="flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest"
                      >
                        <Plus className="w-4 h-4" /> Add Edit
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Section Title</label>
                        <input 
                          className="w-full bg-surface-low border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-primary" 
                          value={localSettings.curatedEdits?.title || ''}
                          onChange={(e) => setLocalSettings({
                            ...localSettings,
                            curatedEdits: { ...(localSettings.curatedEdits || { title: '', items: [] }), title: e.target.value }
                          })}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                        {localSettings.curatedEdits?.items?.map((item, index) => (
                          <div key={item.id} className="bg-surface-low/30 p-6 rounded-2xl border border-outline-variant/10 space-y-4">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">Edit #{index + 1}</span>
                              <button 
                                onClick={() => {
                                  const newItems = (localSettings.curatedEdits?.items || []).filter((_, i) => i !== index);
                                  setLocalSettings({
                                    ...localSettings,
                                    curatedEdits: { ...(localSettings.curatedEdits || { title: '', items: [] }), items: newItems }
                                  });
                                }}
                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Title</label>
                                <input 
                                  className="w-full bg-white border border-outline-variant/10 rounded-xl py-2 px-3 text-sm outline-none focus:ring-1 focus:ring-primary" 
                                  value={item.title}
                                  onChange={(e) => {
                                    const newItems = [...(localSettings.curatedEdits?.items || [])];
                                    newItems[index] = { ...item, title: e.target.value };
                                    setLocalSettings({
                                      ...localSettings,
                                      curatedEdits: { ...(localSettings.curatedEdits || { title: '', items: [] }), items: newItems }
                                    });
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Subtitle</label>
                                <input 
                                  className="w-full bg-white border border-outline-variant/10 rounded-xl py-2 px-3 text-sm outline-none focus:ring-1 focus:ring-primary" 
                                  value={item.subtitle}
                                  onChange={(e) => {
                                    const newItems = [...(localSettings.curatedEdits?.items || [])];
                                    newItems[index] = { ...item, subtitle: e.target.value };
                                    setLocalSettings({
                                      ...localSettings,
                                      curatedEdits: { ...(localSettings.curatedEdits || { title: '', items: [] }), items: newItems }
                                    });
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Link (e.g. /collection?category=Shirt)</label>
                                <input 
                                  className="w-full bg-white border border-outline-variant/10 rounded-xl py-2 px-3 text-sm outline-none focus:ring-1 focus:ring-primary" 
                                  value={item.link}
                                  onChange={(e) => {
                                    const newItems = [...localSettings.curatedEdits.items];
                                    newItems[index].link = e.target.value;
                                    setLocalSettings({
                                      ...localSettings,
                                      curatedEdits: { ...localSettings.curatedEdits, items: newItems }
                                    });
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Image URL</label>
                                <div className="flex gap-2">
                                  <input 
                                    className="flex-grow bg-white border border-outline-variant/10 rounded-xl py-2 px-3 text-sm outline-none focus:ring-1 focus:ring-primary" 
                                    value={item.image}
                                    onChange={(e) => {
                                      const newItems = [...localSettings.curatedEdits.items];
                                      newItems[index].image = e.target.value;
                                      setLocalSettings({
                                        ...localSettings,
                                        curatedEdits: { ...localSettings.curatedEdits, items: newItems }
                                      });
                                    }}
                                  />
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    id={`curated-upload-${index}`}
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, (base64) => {
                                      const newItems = [...localSettings.curatedEdits.items];
                                      newItems[index].image = base64;
                                      setLocalSettings({
                                        ...localSettings,
                                        curatedEdits: { ...localSettings.curatedEdits, items: newItems }
                                      });
                                    })}
                                  />
                                  <label 
                                    htmlFor={`curated-upload-${index}`}
                                    className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm cursor-pointer hover:bg-surface-low transition-colors border border-outline-variant/10"
                                  >
                                    <Upload className="w-4 h-4 text-primary" />
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Featured Collection Settings */}
                  <section className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant">Featured Collection (e.g., New/Eid Collection)</h3>
                      <button 
                        onClick={() => setLocalSettings({
                          ...localSettings,
                          featuredCollection: { ...localSettings.featuredCollection, show: !localSettings.featuredCollection.show }
                        })}
                        className={cn(
                          "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                          localSettings.featuredCollection.show ? "bg-green-100 text-green-600" : "bg-surface-low text-on-surface-variant/40"
                        )}
                      >
                        {localSettings.featuredCollection.show ? "Visible" : "Hidden"}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Section Title</label>
                        <input 
                          className="w-full bg-surface-low border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-primary" 
                          value={localSettings.featuredCollection.title}
                          onChange={(e) => setLocalSettings({
                            ...localSettings,
                            featuredCollection: { ...localSettings.featuredCollection, title: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Section Subtitle</label>
                        <input 
                          className="w-full bg-surface-low border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-primary" 
                          value={localSettings.featuredCollection.subtitle}
                          onChange={(e) => setLocalSettings({
                            ...localSettings,
                            featuredCollection: { ...localSettings.featuredCollection, subtitle: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 block">Select Products for Featured Collection</label>
                      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                        {products.map(product => (
                          <button
                            key={product.id}
                            onClick={() => {
                              const productIds = localSettings.featuredCollection.productIds;
                              const newProductIds = productIds.includes(product.id)
                                ? productIds.filter(id => id !== product.id)
                                : [...productIds, product.id];
                              setLocalSettings({
                                ...localSettings,
                                featuredCollection: { ...localSettings.featuredCollection, productIds: newProductIds }
                              });
                            }}
                            className={cn(
                              "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                              localSettings.featuredCollection.productIds.includes(product.id) ? "border-primary" : "border-transparent opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
                            )}
                          >
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            {localSettings.featuredCollection.productIds.includes(product.id) && (
                              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                <Check className="w-4 h-4 text-primary" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Social Gallery Settings */}
                  <section className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant">Social Gallery (As Seen On You)</h3>
                      <button 
                        onClick={addSocialImage}
                        className="flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest"
                      >
                        <Plus className="w-4 h-4" /> Add Image
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {localSettings.socialGallery.map((url, index) => (
                        <div key={index} className="flex gap-4 items-start">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-low flex-shrink-0 border border-outline-variant/10">
                            {url ? (
                              <img src={url} className="w-full h-full object-cover" alt={`Social ${index}`} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-on-surface-variant/20">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow flex gap-2">
                            <input 
                              className="flex-grow bg-surface-low border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-primary" 
                              placeholder="Image URL"
                              value={url}
                              onChange={(e) => updateSocialImage(index, e.target.value)}
                            />
                            <input 
                              type="file" 
                              className="hidden" 
                              id={`social-upload-${index}`}
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, (base64) => updateSocialImage(index, base64))}
                            />
                            <label 
                              htmlFor={`social-upload-${index}`}
                              className="px-4 bg-surface-low hover:bg-surface-lowest rounded-xl flex items-center justify-center transition-colors border border-outline-variant/10 cursor-pointer"
                              title="Upload Image"
                            >
                              <Upload className="w-4 h-4 text-on-surface-variant" />
                            </label>
                          </div>
                          <button 
                            onClick={() => removeSocialImage(index)}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="pt-6 border-t border-outline-variant/10 flex justify-end">
                    <button 
                      onClick={handleSaveHome}
                      className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      Save Home Page Settings
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'Brand Settings' && (
                <div className="space-y-10">
                  <section className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant">Brand Identity</h3>
                    <p className="text-xs text-on-surface-variant/60">Customize your brand name, font, and signature color.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface-low/30 p-8 rounded-[2rem] border border-outline-variant/10">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">Brand Name</label>
                          <input 
                            className="w-full bg-white border border-outline-variant/10 rounded-xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all" 
                            value={storeSettings.brandSettings?.name || ''}
                            onChange={(e) => updateStoreSettings({ 
                              brandSettings: { ...storeSettings.brandSettings, name: e.target.value } 
                            })}
                            placeholder="e.g. AURELIAN"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">Brand Font</label>
                          <select 
                            className="w-full bg-white border border-outline-variant/10 rounded-xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
                            value={storeSettings.brandSettings?.fontFamily || 'font-display'}
                            onChange={(e) => updateStoreSettings({ 
                              brandSettings: { ...storeSettings.brandSettings, fontFamily: e.target.value as any } 
                            })}
                          >
                            <option value="font-display">Playfair Display (Elegant Serif)</option>
                            <option value="font-headline">Manrope (Modern Sans)</option>
                            <option value="font-sans">Inter (Clean Sans)</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">Brand Color</label>
                          <div className="flex gap-4">
                            <input 
                              type="color"
                              className="w-14 h-14 rounded-xl border-none cursor-pointer overflow-hidden p-0 bg-transparent"
                              value={storeSettings.brandSettings?.color || '#000000'}
                              onChange={(e) => updateStoreSettings({ 
                                brandSettings: { ...storeSettings.brandSettings, color: e.target.value } 
                              })}
                            />
                            <input 
                              type="text"
                              className="flex-grow bg-white border border-outline-variant/10 rounded-xl py-4 px-6 text-sm font-mono outline-none focus:ring-2 focus:ring-primary transition-all uppercase"
                              value={storeSettings.brandSettings?.color || '#000000'}
                              onChange={(e) => updateStoreSettings({ 
                                brandSettings: { ...storeSettings.brandSettings, color: e.target.value } 
                              })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center bg-white rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 mb-6">Live Preview</p>
                        <div className="text-center space-y-4">
                          <h2 
                            className={cn(
                              "text-4xl tracking-[0.3em] uppercase transition-all duration-500",
                              storeSettings.brandSettings?.fontFamily
                            )}
                            style={{ color: storeSettings.brandSettings?.color }}
                          >
                            {storeSettings.brandSettings?.name || 'AURELIAN'}
                          </h2>
                          <div className="h-px w-12 bg-outline-variant/20 mx-auto" />
                          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface-variant/60">Luxe Atelier</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="pt-6 border-t border-outline-variant/10 flex justify-end">
                    <button 
                      onClick={handleSaveBrand}
                      className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      Save Brand Settings
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'Categories' && (
                <div className="space-y-10">
                  <section className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant">Category Menu Subtitles</h3>
                    <p className="text-xs text-on-surface-variant/60">Customize the subtitles displayed under each category in the navigation menu.</p>
                    
                    <div className="space-y-6">
                      {categories.map(category => (
                        <div key={category} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-surface-low/30 p-6 rounded-2xl border border-outline-variant/10">
                          <div className="md:col-span-1">
                            <p className="text-xs font-bold uppercase tracking-widest">{category}</p>
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Menu Subtitle</label>
                            <input 
                              className="w-full bg-white border border-outline-variant/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-primary" 
                              value={storeSettings.categorySubtitles?.[category] || ''}
                              onChange={(e) => {
                                const newSubtitles = { ...storeSettings.categorySubtitles, [category]: e.target.value };
                                updateStoreSettings({ categorySubtitles: newSubtitles });
                              }}
                              placeholder="e.g. Premium cotton & linen"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="pt-6 border-t border-outline-variant/10 flex justify-end">
                    <button 
                      onClick={() => alert('Category settings saved successfully!')}
                      className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      Save Category Settings
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'General' && (
                <div className="space-y-10">
                  <section className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant">Store Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Store Name</label>
                        <input 
                          className="w-full bg-surface-low border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-primary" 
                          value={generalSettings.storeName}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, storeName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Store Email</label>
                        <input 
                          className="w-full bg-surface-low border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-primary" 
                          value={generalSettings.storeEmail}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, storeEmail: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Store Description</label>
                        <textarea 
                          className="w-full bg-surface-low border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-primary h-24 resize-none" 
                          value={generalSettings.storeDescription}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, storeDescription: e.target.value })}
                        />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant">Currency & Units</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Currency</label>
                        <select 
                          className="w-full bg-surface-low border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-primary appearance-none"
                          value={generalSettings.currency}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                        >
                          <option>USD ($)</option>
                          <option>EUR (€)</option>
                          <option>GBP (£)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Weight Unit</label>
                        <select 
                          className="w-full bg-surface-low border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-primary appearance-none"
                          value={generalSettings.weightUnit}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, weightUnit: e.target.value })}
                        >
                          <option>Kilograms (kg)</option>
                          <option>Pounds (lb)</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant">Social Media Links</h3>
                      <button 
                        onClick={() => {
                          const newLinks = [...storeSettings.socialLinks, { platform: 'New Platform', url: '' }];
                          updateStoreSettings({ socialLinks: newLinks });
                        }}
                        className="flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest"
                      >
                        <Plus className="w-4 h-4" /> Add Social Link
                      </button>
                    </div>
                    <div className="space-y-4">
                      {storeSettings.socialLinks.map((link, index) => (
                        <div key={index} className="flex gap-4 items-center">
                          <div className="w-1/3 space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/40 ml-1">Platform</label>
                            <input 
                              className="w-full bg-surface-low border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-primary" 
                              value={link.platform}
                              onChange={(e) => {
                                const newLinks = [...storeSettings.socialLinks];
                                newLinks[index].platform = e.target.value;
                                updateStoreSettings({ socialLinks: newLinks });
                              }}
                              placeholder="e.g. Instagram"
                            />
                          </div>
                          <div className="flex-grow space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/40 ml-1">URL</label>
                            <input 
                              className="w-full bg-surface-low border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-primary" 
                              value={link.url}
                              onChange={(e) => {
                                const newLinks = [...storeSettings.socialLinks];
                                newLinks[index].url = e.target.value;
                                updateStoreSettings({ socialLinks: newLinks });
                              }}
                              placeholder="https://..."
                            />
                          </div>
                          <button 
                            onClick={() => {
                              const newLinks = storeSettings.socialLinks.filter((_, i) => i !== index);
                              updateStoreSettings({ socialLinks: newLinks });
                            }}
                            className="mt-5 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="pt-6 border-t border-outline-variant/10 flex justify-end">
                    <button 
                      onClick={handleSaveGeneral}
                      className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      Save General Settings
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'Security' && (
                <div className="space-y-10">
                  <section className="space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center">
                        <Globe className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant">Admin URL Configuration</h3>
                        <p className="text-xs text-on-surface-variant/60">Change the URL path used to access the admin dashboard.</p>
                      </div>
                    </div>

                    <div className="bg-surface-low/30 p-8 rounded-[2rem] border border-outline-variant/10 space-y-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">Admin Path (e.g., 'admin', 'portal', 'manage')</label>
                        <div className="flex gap-4">
                          <div className="relative flex-grow group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm font-bold">/</span>
                            <input 
                              id="admin-path"
                              type="text"
                              className="w-full bg-white border border-outline-variant/10 rounded-xl py-4 pl-8 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all" 
                              defaultValue={localStorage.getItem('admin_path') || 'admin'}
                              placeholder="admin"
                            />
                          </div>
                          <button 
                            onClick={() => {
                              const newPath = (document.getElementById('admin-path') as HTMLInputElement).value.trim().toLowerCase();
                              if (!newPath || newPath.includes('/') || newPath.includes(' ')) {
                                alert('Invalid path. Use a single word without spaces or slashes.');
                                return;
                              }
                              localStorage.setItem('admin_path', newPath);
                              alert(`Admin path updated to /${newPath}. The page will now reload.`);
                              window.location.href = `/${newPath}/settings`;
                            }}
                            className="px-8 bg-black text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-[1.02] transition-all active:scale-95 whitespace-nowrap"
                          >
                            Update Path
                          </button>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-white">i</span>
                        </div>
                        <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
                          Changing the admin path makes your dashboard harder to find by unauthorized users. 
                          After updating, you must use the new URL (e.g., yoursite.com/your-new-path) to access the admin area.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant">Admin Access Security</h3>
                        <p className="text-xs text-on-surface-variant/60">Manage the password required to access the admin dashboard.</p>
                      </div>
                    </div>

                    <div className="bg-surface-low/30 p-8 rounded-[2rem] border border-outline-variant/10 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">Current Admin Password</label>
                          <div className="relative group">
                            <KeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40 group-focus-within:text-black transition-colors" />
                            <input 
                              type="password"
                              className="w-full bg-white border border-outline-variant/10 rounded-xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-black/5 transition-all" 
                              placeholder="••••••••"
                              onChange={(e) => {
                                const stored = localStorage.getItem('admin_password') || 'admin';
                                if (e.target.value === stored) {
                                  // Can show a checkmark or something
                                }
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">New Admin Password</label>
                          <div className="relative group">
                            <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40 group-focus-within:text-black transition-colors" />
                            <input 
                              id="new-password"
                              type="password"
                              className="w-full bg-white border border-outline-variant/10 rounded-xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-black/5 transition-all" 
                              placeholder="Enter new password"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                        <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-white">!</span>
                        </div>
                        <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                          Changing the admin password will affect all future login attempts from this browser. 
                          Make sure to remember your new password as there is no automated recovery in this preview environment.
                        </p>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button 
                          onClick={() => {
                            const newPass = (document.getElementById('new-password') as HTMLInputElement).value;
                            if (newPass.length < 4) {
                              alert('Password must be at least 4 characters long');
                              return;
                            }
                            localStorage.setItem('admin_password', newPass);
                            alert('Admin password updated successfully!');
                            (document.getElementById('new-password') as HTMLInputElement).value = '';
                          }}
                          className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-[1.02] transition-all active:scale-95"
                        >
                          <Save className="w-4 h-4" />
                          Update Password
                        </button>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6 opacity-50 pointer-events-none">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant">Session Management</h3>
                    <div className="bg-surface-low/30 p-6 rounded-2xl border border-outline-variant/10 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-on-surface">Auto-Logout</p>
                        <p className="text-[10px] text-on-surface-variant/60">Automatically log out after 30 minutes of inactivity.</p>
                      </div>
                      <div className="w-12 h-6 bg-primary/20 rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-primary rounded-full"></div>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'Payments' && (
                <div className="space-y-10">
                  <section className="space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant">Mobile Payment Settings</h3>
                        <p className="text-xs text-on-surface-variant/60">Configure the numbers where customers should send payments.</p>
                      </div>
                    </div>

                    <div className="bg-surface-low/30 p-8 rounded-[2rem] border border-outline-variant/10 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">bKash Number</label>
                          <input 
                            type="text"
                            className="w-full bg-white border border-outline-variant/10 rounded-xl py-4 px-4 text-sm outline-none focus:ring-2 focus:ring-black/5 transition-all" 
                            value={storeSettings.paymentSettings.bkashNumber}
                            onChange={(e) => updateStoreSettings({ 
                              paymentSettings: { ...storeSettings.paymentSettings, bkashNumber: e.target.value } 
                            })}
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">Nagad Number</label>
                          <input 
                            type="text"
                            className="w-full bg-white border border-outline-variant/10 rounded-xl py-4 px-4 text-sm outline-none focus:ring-2 focus:ring-black/5 transition-all" 
                            value={storeSettings.paymentSettings.nagadNumber}
                            onChange={(e) => updateStoreSettings({ 
                              paymentSettings: { ...storeSettings.paymentSettings, nagadNumber: e.target.value } 
                            })}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button 
                          onClick={() => alert('Payment settings updated successfully!')}
                          className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-[1.02] transition-all active:scale-95"
                        >
                          <Save className="w-4 h-4" />
                          Save Payment Settings
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* Placeholder for other tabs */}
              {!['Home Page', 'General', 'Security', 'Payments'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-surface-low rounded-full flex items-center justify-center text-primary/40">
                    {tabs.find(t => t.label === activeTab)?.icon && (
                      <div className="w-8 h-8">
                        {(() => {
                          const Icon = tabs.find(t => t.label === activeTab)!.icon;
                          return <Icon className="w-full h-full" />;
                        })()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-headline font-bold">{activeTab} Settings</h3>
                    <p className="text-sm text-on-surface-variant max-w-xs mx-auto">Configure your {activeTab.toLowerCase()} preferences and policies.</p>
                  </div>
                  <button 
                    onClick={() => alert(`${activeTab} settings saved!`)}
                    className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    Save {activeTab} Settings
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
