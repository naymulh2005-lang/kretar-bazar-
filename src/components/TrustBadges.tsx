import React from 'react';
import { useShop } from '../context/ShopContext';
import { TRANSLATIONS } from '../data/translations';
import { Award, Truck, ShieldCheck, RotateCcw } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const { lang } = useShop();
  const t = TRANSLATIONS[lang];

  return (
    <div className="py-6 bg-slate-50/80 border-y border-slate-100" id="trust-badges">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
          
          <div className="bg-white border border-slate-200/80 p-3 rounded-2xl flex items-center gap-3 shadow-2xs hover:shadow-xs transition">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
              <Award className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-800 truncate">{t.trust1Title}</h4>
              <p className="text-[11px] text-slate-500 truncate">{t.trust1Desc}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-3 rounded-2xl flex items-center gap-3 shadow-2xs hover:shadow-xs transition">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <Truck className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-800 truncate">{t.trust2Title}</h4>
              <p className="text-[11px] text-slate-500 truncate">{t.trust2Desc}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-3 rounded-2xl flex items-center gap-3 shadow-2xs hover:shadow-xs transition">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 border border-blue-100">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-800 truncate">{t.trust3Title}</h4>
              <p className="text-[11px] text-slate-500 truncate">{t.trust3Desc}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-3 rounded-2xl flex items-center gap-3 shadow-2xs hover:shadow-xs transition">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
              <RotateCcw className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-800 truncate">{t.trust4Title}</h4>
              <p className="text-[11px] text-slate-500 truncate">{t.trust4Desc}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
