import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Twitter,
  Facebook,
  Globe,
  MessageSquare,
  Send
} from 'lucide-react';
import { motion } from 'motion/react';
import { useProducts } from '../../context/ProductContext';

export default function Contact() {
  const { storeSettings } = useProducts();

  const fallbackEmail = 'contact@aurelian.com';
  const fallbackPhone = '+880 1316785389';

  const contactEmail = storeSettings.contactSettings?.email || fallbackEmail;
  const contactPhone = storeSettings.contactSettings?.contactPhone || fallbackPhone;
  const cleanPhone = contactPhone.replace(/[^0-9]/g, '');

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      value: contactEmail,
      description: 'Our support team usually responds within 24 hours.',
      link: `mailto:${contactEmail}`
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp',
      value: contactPhone,
      description: 'Instant support for your luxury inquiries.',
      link: `https://wa.me/${cleanPhone}`
    },
    {
      icon: Phone,
      title: 'Call Us',
      value: contactPhone,
      description: 'Available Mon-Fri, 9am - 6pm.',
      link: `tel:${contactPhone}`
    }
  ];

  return (
    <main className="pt-24 sm:pt-28 lg:pt-32 pb-28 sm:pb-32 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-16 lg:mb-20">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-primary/40 mb-3 sm:mb-4"
        >
          Get In Touch
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-headline text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter uppercase mb-4 sm:mb-6 leading-none"
        >
          Contact Us
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-on-surface-variant/70 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto font-medium leading-relaxed px-1"
        >
          Whether you have a question about our collections, bespoke services,
          or an existing order, our dedicated team is here to assist you with
          the utmost care.
        </motion.p>
      </div>

      {/* Contact Cards - Mobile 3 in one row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 lg:gap-8 mb-14 sm:mb-20 lg:mb-24">
        {contactMethods.map((method, i) => (
          <motion.a
            key={method.title}
            href={method.link}
            target={method.title === 'WhatsApp' ? '_blank' : undefined}
            rel={method.title === 'WhatsApp' ? 'noopener noreferrer' : undefined}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="group bg-surface-low p-3 sm:p-7 lg:p-10 rounded-2xl sm:rounded-3xl lg:rounded-[40px] border border-outline-variant/10 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 active:scale-[0.98] text-center sm:text-left min-w-0"
          >
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-primary text-white rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-7 lg:mb-8 mx-auto sm:mx-0 group-hover:scale-110 transition-transform duration-500">
              <method.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <h3 className="text-[10px] xs:text-xs sm:text-lg lg:text-xl font-bold uppercase tracking-tight mb-1 sm:mb-2 leading-tight">
              {method.title}
            </h3>

            <p className="text-primary font-headline font-bold text-[9px] xs:text-[10px] sm:text-base lg:text-lg mb-2 sm:mb-4 break-words leading-tight line-clamp-2">
              {method.value}
            </p>

            <p className="hidden sm:block text-on-surface-variant/60 text-xs sm:text-sm leading-relaxed">
              {method.description}
            </p>
          </motion.a>
        ))}
      </div>

      {/* Social + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-start lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-8 sm:space-y-10 lg:space-y-12"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-headline font-black uppercase tracking-tight mb-4 sm:mb-6">
              Our Social Presence
            </h2>

            <p className="text-on-surface-variant/70 text-sm sm:text-base lg:text-lg font-medium leading-relaxed mb-6 sm:mb-8">
              Follow our journey and stay updated with our latest architectural
              silhouettes and editorial releases.
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              {storeSettings.socialLinks.map((social, i) => {
                const platform = social.platform.toLowerCase();

                const Icon =
                  platform === 'instagram'
                    ? Instagram
                    : platform === 'twitter'
                      ? Twitter
                      : platform === 'facebook'
                        ? Facebook
                        : Globe;

                return (
                  <a
                    key={i}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 sm:gap-3 bg-surface-low px-5 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-full border border-outline-variant/10 hover:bg-primary hover:text-white transition-all duration-500 group active:scale-95 max-w-full"
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest truncate">
                      {social.platform}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="bg-primary text-white p-6 sm:p-8 lg:p-10 rounded-3xl lg:rounded-[40px] space-y-5 sm:space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              <h4 className="text-base sm:text-lg font-bold uppercase tracking-tight">
                Visit Our Atelier
              </h4>
            </div>

            <p className="text-white/70 leading-relaxed text-sm sm:text-base break-words">
              {storeSettings.contactSettings?.address ||
                '123 Luxury Lane, Architectural District, Chittagong, Bangladesh'}
            </p>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-surface-low p-5 sm:p-8 lg:p-12 xl:p-16 rounded-3xl sm:rounded-[40px] lg:rounded-[60px] border border-outline-variant/10"
        >
          <h2 className="text-2xl sm:text-3xl font-headline font-black uppercase tracking-tight mb-6 sm:mb-8">
            Send a Message
          </h2>

          <form className="space-y-5 sm:space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Full Name
                </label>
                <input
                  className="w-full bg-white border-none rounded-2xl px-5 sm:px-6 py-4 text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Enter your name"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full bg-white border-none rounded-2xl px-5 sm:px-6 py-4 text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Subject
              </label>
              <input
                className="w-full bg-white border-none rounded-2xl px-5 sm:px-6 py-4 text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                placeholder="How can we help?"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Message
              </label>
              <textarea
                rows={5}
                className="w-full bg-white border-none rounded-2xl px-5 sm:px-6 py-4 text-sm outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
                placeholder="Tell us more about your inquiry..."
              />
            </div>

            <button className="w-full bg-primary text-white py-4 sm:py-5 rounded-full font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-xs sm:text-sm shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
              Send Inquiry
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}