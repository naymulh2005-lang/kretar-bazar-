import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { TRANSLATIONS } from '../data/translations';
import { MasterLogo } from './MasterLogo';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Tag, 
  Truck, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    lang, 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateCartQuantity, 
    removeFromCart, 
    cartSubtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    shippingCity,
    setShippingCity,
    shippingCost,
    cartTotal,
    setIsCheckoutOpen
  } = useShop();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const t = TRANSLATIONS[lang];

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const res = applyCoupon(couponCode);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCode('');
    }
  };

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between">
        
        {/* Drawer Header */}
        <div className="p-4 bg-slate-950 text-amber-200 border-b border-amber-500/30 flex items-center justify-between">
          <MasterLogo size="md" variant="full" />

          <button
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-400 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-extrabold text-slate-700 text-sm">{t.cartEmpty}</p>
              <p className="text-xs text-slate-400">
                {lang === 'bn' ? 'পছন্দের পণ্য বেছে নিয়ে কার্টে যুক্ত করুন' : 'Browse items and add to your cart'}
              </p>
            </div>
          ) : (
            cart.map((item, idx) => {
              if (!item || !item.product) return null;
              const unitPrice = item.product.discountPrice || item.product.price || 0;
              const rawImg = Array.isArray(item.product.images) 
                ? item.product.images.find(img => typeof img === 'string' && img.trim().length > 0) 
                : null;
              const itemImage = (rawImg && rawImg.trim()) || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80';
              const itemName = (lang === 'bn' ? (item.product.nameBn || item.product.nameEn) : (item.product.nameEn || item.product.nameBn)) || 'Baby Product';

              return (
                <div 
                  key={`${item.product.id || idx}-${item.selectedSize || 'std'}-${idx}`}
                  className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 flex gap-3 items-center"
                >
                  <img 
                    src={itemImage} 
                    alt={itemName} 
                    className="w-16 h-16 object-cover rounded-xl shrink-0 border border-slate-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80';
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">
                      {itemName}
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 my-0.5">
                      <span>{item.selectedSize}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: item.selectedColor.hex }} />
                        <span>{lang === 'bn' ? item.selectedColor.nameBn : item.selectedColor.nameEn}</span>
                      </span>
                    </div>

                    <p className="text-xs font-black text-pink-600">
                      ৳{unitPrice} x {item.quantity} = ৳{unitPrice * item.quantity}
                    </p>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.selectedSize, -1)}
                        className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.selectedSize, 1)}
                        className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer: Coupons & Summary */}
        {cart.length > 0 && (
          <div className="p-4 bg-white border-t border-slate-100 space-y-3">
            
            {/* Coupon Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>{appliedCoupon.code}</span>
                    <span className="text-[10px] font-normal">({appliedCoupon.discountValue}% off)</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-rose-600 hover:underline font-bold text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t.couponCode}
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs flex-1 focus:outline-none focus:border-pink-500 uppercase font-mono"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    {t.applyCoupon}
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-rose-500 font-medium mt-1">{couponError}</p>}
            </div>

            {/* Delivery Location Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-pink-600" />
                <span>{t.shippingCost}</span>
              </label>
              <select
                value={shippingCity}
                onChange={e => setShippingCity(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-none focus:border-pink-500"
              >
                <option value="inside-dhaka">{t.insideDhaka}</option>
                <option value="outside-dhaka">{t.outsideDhaka}</option>
                <option value="express-dhaka">{t.expressDhaka}</option>
              </select>
            </div>

            {/* Summary Lines */}
            <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>{t.cartSubtotal}</span>
                <span className="font-bold">৳{cartSubtotal}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>{t.discount}</span>
                  <span>-৳{cartSubtotal - (cartTotal - shippingCost)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>{t.shippingCost}</span>
                <span className="font-bold">৳{shippingCost}</span>
              </div>

              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>{t.total}</span>
                <span className="text-pink-600 text-base">৳{cartTotal}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={handleProceedCheckout}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-extrabold py-3 rounded-2xl text-xs shadow-lg shadow-pink-200 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>{t.checkout}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
