import React from 'react';
import { useShop } from '../context/ShopContext';
import { TRANSLATIONS } from '../data/translations';
import { ShoppingBag, Sparkles, Award, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import bannerImg from '../assets/images/kb_baby_banner_1787231713712.jpg';

export const HeroBanner: React.FC = () => {
  const { lang, storeBranding } = useShop();

  const handleScrollToProducts = () => {
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentBannerImg = (storeBranding?.heroBannerUrl && storeBranding.heroBannerUrl.trim()) || bannerImg;

  return (
    <div className="relative overflow-hidden bg-slate-50/50 py-2 sm:py-3.5" id="hero-banner">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        
        {/* Main Panoramic Hero Banner Image */}
        <div 
          onClick={handleScrollToProducts}
          className="relative group cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-300/60 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-amber-50 via-white to-amber-50/80"
        >
          {/* Banner Graphic Image (responsive 16:9 on mobile / tablet / desktop) */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] md:aspect-[24/9] w-full overflow-hidden bg-slate-100">
            <img 
              src={currentBannerImg || bannerImg} 
              alt="KB ক্রেতার বাজার - Kids & Baby" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-500"
            />
            
            {/* Subtle Overlay gradient at bottom on mobile for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Quick Floating CTA Tag on hover/touch */}
          <div className="absolute bottom-2.5 right-3 sm:bottom-3 sm:right-4 hidden xs:flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-blue-950 px-3.5 py-1.5 rounded-full font-black text-[11px] sm:text-xs shadow-md border border-amber-300 transition transform group-hover:scale-105">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'পণ্য দেখুন ও অর্ডার করুন' : 'Browse & Order'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};


