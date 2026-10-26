import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { TRANSLATIONS } from '../data/translations';
import { ProductCard } from './ProductCard';
import { Flame, Clock } from 'lucide-react';

export const FlashSaleSection: React.FC = () => {
  const { lang, products } = useShop();
  const t = TRANSLATIONS[lang];

  const flashProducts = (products || [])
    .filter(p => p && p.id && p.isPublished && p.isFlashSale)
    .slice(0, 4);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (flashProducts.length === 0) return null;

  return (
    <div className="py-8 bg-gradient-to-b from-rose-50/60 via-pink-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Bar with Countdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white p-4 sm:p-5 rounded-2xl border border-rose-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-md shadow-rose-200">
              <Flame className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <span>{t.navFlashSale}</span>
                <span className="text-xs font-bold text-white bg-rose-500 px-2 py-0.5 rounded-full uppercase">
                  Live
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'bn' ? 'সীমিত সময়ের জন্য বিশেষ ছাড় অফার' : 'Limited time exclusive discounts'}
              </p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-md">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-slate-300 mr-1">
              {lang === 'bn' ? 'শেষ হতে বাকি:' : 'Ends in:'}
            </span>
            <div className="flex items-center gap-1 font-mono font-bold text-sm text-amber-300">
              <span className="bg-slate-800 px-2 py-0.5 rounded-md">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded-md">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded-md">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {flashProducts.map((product, idx) => {
            if (!product || !product.id) return null;
            const sales = typeof product.salesCount === 'number' ? product.salesCount : 0;
            const stock = typeof product.stock === 'number' ? product.stock : 10;
            const total = sales + stock;
            const progressPct = total > 0 ? Math.min(100, Math.round((sales / total) * 100)) : 0;

            return (
              <div key={product.id} className="flex flex-col">
                <ProductCard product={product} index={idx} />
                
                {/* Limited Stock Progress */}
                <div className="mt-2 bg-white p-2 rounded-xl border border-slate-100 text-[10px]">
                  <div className="flex justify-between text-slate-500 font-medium mb-1">
                    <span>{lang === 'bn' ? 'বুকিং হয়েছে' : 'Sold'} {sales}টি</span>
                    <span className="text-rose-600 font-bold">{lang === 'bn' ? 'স্টক আছে' : 'In stock'} {stock}টি</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
