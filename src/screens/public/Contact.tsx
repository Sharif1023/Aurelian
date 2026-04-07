import { Mail, Phone, MapPin, Instagram, Twitter, Facebook, Globe, MessageSquare, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { useProducts } from '../../context/ProductContext';
import { cn } from '@/src/lib/utils';

export default function Contact() {
  const { storeSettings } = useProducts();

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      value: storeSettings.contactSettings?.email || 'contact@aurelian.com',
      description: 'Our support team usually responds within 24 hours.',
      link: `mailto:${storeSettings.contactSettings?.email || 'contact@aurelian.com'}`
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp',
      value: storeSettings.contactSettings?.contactPhone || '+880 1700-000000',
      description: 'Instant support for your luxury inquiries.',
      link: `https://wa.me/${(storeSettings.contactSettings?.contactPhone || '').replace(/[^0-9]/g, '')}`
    },
    {
      icon: Phone,
      title: 'Call Us',
      value: storeSettings.contactSettings?.contactPhone || '+880 1700-000000',
      description: 'Available Mon-Fri, 9am - 6pm.',
      link: `tel:${storeSettings.contactSettings?.contactPhone || ''}`
    }
  ];

  return (
    <main className="pt-32 pb-32 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40 mb-4"
        >
          Get In Touch
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-headline text-5xl sm:text-7xl font-black tracking-tighter uppercase mb-6"
        >
          Contact Us
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-on-surface-variant/70 text-lg max-w-2xl mx-auto font-medium leading-relaxed"
        >
          Whether you have a question about our collections, bespoke services, or an existing order, our dedicated team is here to assist you with the utmost care.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
        {contactMethods.map((method, i) => (
          <motion.a
            key={method.title}
            href={method.link}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="group bg-surface-low p-10 rounded-[40px] border border-outline-variant/10 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
          >
            <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <method.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight mb-2">{method.title}</h3>
            <p className="text-primary font-headline font-bold text-lg mb-4">{method.value}</p>
            <p className="text-on-surface-variant/60 text-sm leading-relaxed">{method.description}</p>
          </motion.a>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-12"
        >
          <div>
            <h2 className="text-3xl font-headline font-black uppercase tracking-tight mb-6">Our Social Presence</h2>
            <p className="text-on-surface-variant/70 text-lg font-medium leading-relaxed mb-8">
              Follow our journey and stay updated with our latest architectural silhouettes and editorial releases.
            </p>
            <div className="flex flex-wrap gap-4">
              {storeSettings.socialLinks.map((social, i) => {
                const Icon = social.platform.toLowerCase() === 'instagram' ? Instagram :
                             social.platform.toLowerCase() === 'twitter' ? Twitter :
                             social.platform.toLowerCase() === 'facebook' ? Facebook : Globe;
                return (
                  <a 
                    key={i} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-surface-low px-8 py-4 rounded-full border border-outline-variant/10 hover:bg-primary hover:text-white transition-all duration-500 group"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">{social.platform}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="bg-primary text-white p-10 rounded-[40px] space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold uppercase tracking-tight">Visit Our Atelier</h4>
            </div>
            <p className="text-white/70 leading-relaxed">
              {storeSettings.contactSettings?.address || '123 Luxury Lane, Architectural District, Chittagong, Bangladesh'}
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-surface-low p-10 sm:p-16 rounded-[60px] border border-outline-variant/10"
        >
          <h2 className="text-3xl font-headline font-black uppercase tracking-tight mb-8">Send a Message</h2>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Full Name</label>
                <input className="w-full bg-white border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-primary transition-all" placeholder="Enter your name" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Email Address</label>
                <input className="w-full bg-white border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-primary transition-all" placeholder="Enter your email" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Subject</label>
              <input className="w-full bg-white border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-primary transition-all" placeholder="How can we help?" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Message</label>
              <textarea rows={4} className="w-full bg-white border-none rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-primary transition-all resize-none" placeholder="Tell us more about your inquiry..." />
            </div>
            <button className="w-full bg-primary text-white py-5 rounded-full font-bold uppercase tracking-[0.2em] shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
              Send Inquiry
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
