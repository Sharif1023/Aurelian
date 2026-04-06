import { FileText, Download, Printer, X, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import jsPDF from "jspdf";
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';

// --- TypeScript types ---
interface OrderItem {
  name: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string | number;
  orderNumber: string | number;
  createdAt: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  shippingCost?: number;
  total: number;
  items: OrderItem[];
}

interface InvoiceProps {
  order: Order;
  brandName: string;
  onClose: () => void;
  autoDownload?: boolean;
}

export default function Invoice({ order, brandName, onClose, autoDownload = false }: InvoiceProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Print
  const handlePrint = () => window.print();

  // Download PDF
  const handleDownloadPDF = async () => {
    const element = invoiceRef.current;
    if (!element) {
      toast.error('Invoice content is not ready. Please try again.');
      return;
    }

    try {
      setIsGenerating(true);
      const loadingToast = !autoDownload ? toast.loading('Preparing PDF...') : null;

      // Wait for fonts
      if (document.fonts) await document.fonts.ready;

      // Wait for images to load
      const images = Array.from(element.getElementsByTagName('img'));
      await Promise.all(
        images.map((img) =>
          img.complete && img.naturalHeight !== 0
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                const timeout = setTimeout(resolve, 3000);
                img.onload = () => {
                  clearTimeout(timeout);
                  resolve();
                };
                img.onerror = () => {
                  clearTimeout(timeout);
                  resolve();
                };
              })
        )
      );

      // Extra small delay
      await new Promise((r) => setTimeout(r, 500));

      // Generate canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
      });

      if (!canvas || canvas.width === 0) throw new Error('Failed to capture invoice content');

      const imgData = canvas.toDataURL('image/jpeg', 0.9);

      // Generate PDF
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

      const fileName = `Invoice-${order.orderNumber}.pdf`;
      try {
        pdf.save(fileName);
      } catch {
        // Fallback
        const blob = pdf.output('blob');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      if (loadingToast) toast.success('Invoice downloaded!', { id: loadingToast });

      if (autoDownload) setTimeout(onClose, 1000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Try printing instead.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-download effect
  useEffect(() => {
    if (autoDownload) {
      const timer = setTimeout(handleDownloadPDF, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoDownload]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col"
      >
        {/* Toolbar */}
        <div className="p-4 border-b flex items-center justify-between bg-surface-low">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <span className="font-bold uppercase tracking-widest text-xs">Invoice Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={isGenerating}
              className="p-2 hover:bg-white rounded-full transition-colors text-on-surface-variant hover:text-primary"
              title="Print"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="p-2 hover:bg-white rounded-full transition-colors text-on-surface-variant hover:text-primary disabled:opacity-50"
              title="Download PDF"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            </button>
            <div className="w-px h-6 bg-outline-variant/20 mx-2" />
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="p-2 hover:bg-white rounded-full transition-colors text-on-surface-variant hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-12 bg-white">
          <div className="max-w-3xl mx-auto" ref={invoiceRef}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 pb-6 border-b border-[#f0f0f0]">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-headline font-black tracking-tighter uppercase">{brandName}</h1>
                <p className="text-[10px] text-[#444748] uppercase tracking-widest">Luxury Atelier & Boutique</p>
              </div>
              <div className="text-left sm:text-right space-y-1">
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight">Invoice</h2>
                <p className="text-xs font-mono text-[#444748]">#{order.orderNumber}</p>
                <p className="text-[10px] text-[#444748]">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Billing & Shipping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#444748]">Bill To</h3>
                <div className="space-y-0.5">
                  <p className="font-bold text-sm">{order.customerName}</p>
                  <p className="text-xs text-[#444748]">{order.email}</p>
                  <p className="text-xs text-[#444748]">{order.phone}</p>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#444748]">Ship To</h3>
                <div className="space-y-0.5">
                  <p className="text-xs text-[#444748]">{order.address}</p>
                  <p className="text-xs text-[#444748]">{order.city}, {order.zip}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="border-b border-[#e5e7eb]">
                    <th className="text-left py-3 text-[9px] font-bold uppercase tracking-widest text-[#444748]">Item Description</th>
                    <th className="text-center py-3 text-[9px] font-bold uppercase tracking-widest text-[#444748]">Qty</th>
                    <th className="text-right py-3 text-[9px] font-bold uppercase tracking-widest text-[#444748]">Price</th>
                    <th className="text-right py-3 text-[9px] font-bold uppercase tracking-widest text-[#444748]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f5f5]">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-4">
                        <p className="font-bold text-xs uppercase tracking-tight">{item.name}</p>
                        <p className="text-[9px] text-[#444748] uppercase mt-0.5">
                          Size: {item.size || 'N/A'} {item.color ? `/ Color: ${item.color}` : ''}
                        </p>
                      </td>
                      <td className="py-4 text-center text-xs">{item.quantity}</td>
                      <td className="py-4 text-right text-xs">৳{Number(item.price).toFixed(2)}</td>
                      <td className="py-4 text-right font-bold text-xs">৳{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex flex-col items-end space-y-2">
              <div className="w-full sm:w-56 space-y-1.5">
                <div className="flex justify-between text-xs text-[#444748]">
                  <span>Subtotal</span>
                  <span>৳{(order.total - (order.shippingCost || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#444748]">
                  <span>Shipping</span>
                  <span>৳{(order.shippingCost || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[#e5e7eb]">
                  <span className="font-bold uppercase tracking-widest text-[10px]">Grand Total</span>
                  <span className="text-lg font-headline font-black">৳{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-[#f0f0f0] text-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#444748] mb-1">Thank you for choosing {brandName}</p>
              <p className="text-[8px] text-[#8f9191]">This is a computer-generated document. No signature is required.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}