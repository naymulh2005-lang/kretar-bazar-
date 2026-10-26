import React from 'react';
import { useShop } from '../context/ShopContext';
import { TRANSLATIONS } from '../data/translations';
import { MasterLogo } from './MasterLogo';
import { 
  CheckCircle2, 
  X, 
  Printer, 
  Truck, 
  PackageCheck, 
  Clock, 
  ShoppingBag,
  MapPin,
  Phone
} from 'lucide-react';

export const OrderConfirmationModal: React.FC = () => {
  const { 
    lang, 
    activeOrderConfirmation, 
    setActiveOrderConfirmation 
  } = useShop();

  if (!activeOrderConfirmation) return null;

  const t = TRANSLATIONS[lang];
  const order = activeOrderConfirmation;

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('Invoice print not supported:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full my-auto overflow-hidden shadow-2xl relative border border-slate-100 max-h-[94vh] flex flex-col">
        
        {/* Success Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-amber-300 p-6 text-center space-y-2 relative border-b border-amber-500/30">
          <button
            onClick={() => setActiveOrderConfirmation(null)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-1">
            <MasterLogo size="md" variant="full" />
          </div>

          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
            {t.orderSuccessTitle}
          </h2>
          <p className="text-xs text-amber-200">
            {lang === 'bn' ? `অর্ডার নম্বর: #${order.id} | ট্র্যাকিং আইডি: ${order.trackingNumber}` : `Order #${order.id} | Tracking: ${order.trackingNumber}`}
          </p>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700">
          
          {/* Tracking Timeline */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-pink-600" />
              <span>{lang === 'bn' ? 'অর্ডার ট্র্যাকিং স্ট্যাটাস' : 'Order Tracking Timeline'}</span>
            </h4>

            <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
              <div className="space-y-1">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto font-bold">1</div>
                <span className="font-bold text-slate-800">Order Placed</span>
              </div>
              <div className="space-y-1">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto font-bold">2</div>
                <span className="font-bold text-slate-800">Confirmed</span>
              </div>
              <div className="space-y-1">
                <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center mx-auto font-bold">3</div>
                <span className="font-semibold text-slate-600">Processing</span>
              </div>
              <div className="space-y-1">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center mx-auto">4</div>
                <span className="text-slate-400">Delivered</span>
              </div>
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/60 p-3.5 rounded-2xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-pink-600" />
                <span>{lang === 'bn' ? 'ডেলিভারি ঠিকানা:' : 'Shipping Address:'}</span>
              </p>
              <p className="text-slate-600 font-medium">{order.customerName}</p>
              <p className="text-slate-500">{order.shippingAddress}</p>
              {order.country && (
                <p className="text-[10px] font-bold text-amber-800 mt-0.5">
                  🌍 {order.countryName || order.country} {order.postalCode ? `(${order.postalCode})` : ''}
                </p>
              )}
            </div>

            <div>
              <p className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-pink-600" />
                <span>{lang === 'bn' ? 'যোগাযোগ ও পেমেন্ট:' : 'Contact & Payment:'}</span>
              </p>
              <p className="text-slate-600">{order.customerPhone}</p>
              <p className="text-slate-500 font-bold uppercase text-[10px] bg-slate-200 px-2 py-0.5 rounded-md inline-block mt-1">
                {order.paymentMethod} ({order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'})
              </p>
            </div>
          </div>

          {/* Order Items List */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-800 text-xs">{lang === 'bn' ? 'অর্ডারকৃত পণ্যসমূহ:' : 'Ordered Items:'}</h4>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white">
              {((order.itemDetails && order.itemDetails.length > 0 ? order.itemDetails : order.items) || []).map((item: any, idx: number) => {
                const title = lang === 'bn' ? (item.nameBn || item.product?.nameBn || item.nameEn || 'Baby Product') : (item.nameEn || item.product?.nameEn || item.nameBn || 'Baby Product');
                const rawImg = item.image || item.product?.images?.[0];
                const img = (typeof rawImg === 'string' && rawImg.trim().length > 0) 
                  ? rawImg.trim() 
                  : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=200&q=80';
                const size = item.selectedSize;
                const qty = item.quantity;
                const price = item.totalPrice || ((item.product?.discountPrice || item.product?.price || item.unitPrice || 0) * qty);
                return (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={img} alt="" className="w-10 h-10 object-cover rounded-xl shrink-0 border border-slate-100" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{title}</p>
                        <p className="text-[10px] text-slate-400">Size: {size} | Qty: {qty}</p>
                      </div>
                    </div>
                    <span className="font-bold text-pink-600 shrink-0">
                      ৳{price}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-bold">৳{order.subtotal}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount:</span>
                <span>-৳{order.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee:</span>
              <span className="font-bold">৳{order.shippingCost}</span>
            </div>
            <div className="flex justify-between font-black text-slate-900 text-sm pt-2 border-t border-slate-200">
              <span>Grand Total:</span>
              <span className="text-pink-600">৳{order.total}</span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2.5 rounded-2xl font-bold text-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'bn' ? 'রসিদ প্রিন্ট করুন' : 'Print Invoice'}</span>
          </button>

          <button
            onClick={() => setActiveOrderConfirmation(null)}
            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 px-4 rounded-2xl text-xs shadow-md transition cursor-pointer text-center"
          >
            {lang === 'bn' ? 'আরও কেনাকাটা করুন' : 'Continue Shopping'}
          </button>
        </div>

      </div>
    </div>
  );
};
