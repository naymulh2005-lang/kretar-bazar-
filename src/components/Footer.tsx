import React from 'react';
import { useShop } from '../context/ShopContext';
import { TRANSLATIONS } from '../data/translations';
import { MasterLogo } from './MasterLogo';
import { 
  Heart, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  CreditCard,
  Facebook,
  Instagram,
  Youtube
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { lang, categories, setFilters, setIsAdminOpen } = useShop();
  const t = TRANSLATIONS[lang];

  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-8 border-t border-amber-500/30">
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        
        {/* Brand Story Highlight */}
        <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl border border-amber-500/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-black text-amber-300">
              {t.brandStoryTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
              {t.brandStorySubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="bg-amber-500 text-blue-950 font-black text-xs px-4 py-2 rounded-2xl shadow-lg border border-amber-300">
              {lang === 'bn' ? '১০,০০০+ খুশি অভিভাবক' : '10,000+ Happy Parents'}
            </span>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
          
          {/* Col 1: About */}
          <div className="space-y-3">
            <MasterLogo size="lg" variant="full" />
            <p className="text-slate-400 leading-relaxed pt-2">
              {lang === 'bn' 
                ? '৬ মাস থেকে ১০ বছর বয়সী শিশুদের নিরাপদ, আরামদায়ক ও বৈচিত্র্যময় পণ্যের নির্ভরযোগ্য বিশ্বস্ত অনলাইন বাজার।' 
                : 'Your trusted online store for safe, comfy, and premium products for children ages 6m to 10y.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-8 h-8 rounded-xl bg-blue-900/60 border border-amber-500/30 text-amber-300 hover:text-white hover:bg-amber-500 hover:text-blue-950 flex items-center justify-center transition">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-xl bg-blue-900/60 border border-amber-500/30 text-amber-300 hover:text-white hover:bg-amber-500 hover:text-blue-950 flex items-center justify-center transition">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-xl bg-blue-900/60 border border-amber-500/30 text-amber-300 hover:text-white hover:bg-amber-500 hover:text-blue-950 flex items-center justify-center transition">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-amber-400 text-sm uppercase tracking-wider">{t.navCategories}</h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              {categories.slice(0, 5).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, selectedCategory: cat.id }))}
                    className="hover:text-amber-300 transition cursor-pointer"
                  >
                    {lang === 'bn' ? cat.nameBn : cat.nameEn}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Customer Care & Quick Access */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-amber-400 text-sm uppercase tracking-wider">কাস্টমার সার্ভিস ও এক্সেস</h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li><a href="#" className="hover:text-amber-300 transition">অর্ডার ট্র্যাকিং</a></li>
              <li><a href="#" className="hover:text-amber-300 transition">রিটার্ন ও রিফান্ড নীতি</a></li>
              <li><a href="#" className="hover:text-amber-300 transition">ডেলিভারি চার্জ ও সময়সীমা</a></li>
              <li>
                <button 
                  onClick={() => setIsAdminOpen(true)}
                  className="text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.adminTitle}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Info */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-amber-400 text-sm uppercase tracking-wider">{t.footerContact}</h4>
            <div className="space-y-2.5 text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{t.footerAddress}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t.footerPhone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t.footerEmail}</span>
              </p>
            </div>
          </div>

        </div>

        {/* Payment Gateways & Copyright Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{t.copyRight}</p>

          {/* Payment Method Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-slate-900 border border-slate-800 text-amber-200 font-bold text-[10px] px-2.5 py-1 rounded-md">bKash</span>
            <span className="bg-slate-900 border border-slate-800 text-amber-200 font-bold text-[10px] px-2.5 py-1 rounded-md">Nagad</span>
            <span className="bg-slate-900 border border-slate-800 text-amber-200 font-bold text-[10px] px-2.5 py-1 rounded-md">Rocket</span>
            <span className="bg-slate-900 border border-slate-800 text-amber-200 font-bold text-[10px] px-2.5 py-1 rounded-md">VISA</span>
            <span className="bg-slate-900 border border-slate-800 text-amber-200 font-bold text-[10px] px-2.5 py-1 rounded-md">Mastercard</span>
            <span className="bg-slate-900 border border-slate-800 text-amber-200 font-bold text-[10px] px-2.5 py-1 rounded-md">COD</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
