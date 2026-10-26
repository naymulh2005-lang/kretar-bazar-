import React from 'react';
import { useShop } from '../context/ShopContext';
import { TRANSLATIONS } from '../data/translations';
import { AgeGroup } from '../types';
import { Baby, Sparkles, Filter } from 'lucide-react';

export const AgeGroupBar: React.FC = () => {
  const { lang, filters, setFilters } = useShop();
  const t = TRANSLATIONS[lang];

  const ageGroups: { id: AgeGroup; labelBn: string; labelEn: string; icon: string; bg: string }[] = [
    { id: '6-12m', labelBn: '৬-১২ মাস', labelEn: '6-12 Months', icon: '👶', bg: 'hover:border-pink-300 hover:bg-pink-50' },
    { id: '1-2y', labelBn: '১-২ বছর', labelEn: '1-2 Years', icon: '🧒', bg: 'hover:border-indigo-300 hover:bg-indigo-50' },
    { id: '2-4y', labelBn: '২-৪ বছর', labelEn: '2-4 Years', icon: '👧', bg: 'hover:border-purple-300 hover:bg-purple-50' },
    { id: '4-6y', labelBn: '৪-৬ বছর', labelEn: '4-6 Years', icon: '🎒', bg: 'hover:border-amber-300 hover:bg-amber-50' },
    { id: '6-10y', labelBn: '৬-১০ বছর', labelEn: '6-10 Years', icon: '👦', bg: 'hover:border-emerald-300 hover:bg-emerald-50' }
  ];

  const toggleAgeGroup = (group: AgeGroup) => {
    setFilters(prev => {
      const exists = prev.selectedAgeGroups.includes(group);
      const updated = exists 
        ? prev.selectedAgeGroups.filter(g => g !== group)
        : [...prev.selectedAgeGroups, group];
      return { ...prev, selectedAgeGroups: updated };
    });
  };

  const isSelected = (group: AgeGroup) => filters.selectedAgeGroups.includes(group);

  return (
    <div className="py-6 bg-slate-50/50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Baby className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                {t.ageGroupTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'bn' ? 'সঠিক বয়সের পণ্য নির্বাচন করুন' : 'Find perfect products for your child age'}
              </p>
            </div>
          </div>

          {filters.selectedAgeGroups.length > 0 && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, selectedAgeGroups: [] }))}
              className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
            >
              {t.resetFilters}
            </button>
          )}
        </div>

        {/* Age Group Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ageGroups.map(group => {
            const active = isSelected(group.id);
            return (
              <button
                key={group.id}
                onClick={() => toggleAgeGroup(group.id)}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 cursor-pointer text-left ${
                  active
                    ? 'border-pink-500 bg-pink-500 text-white shadow-md shadow-pink-200 font-bold scale-102'
                    : `border-slate-200 bg-white text-slate-700 ${group.bg}`
                }`}
              >
                <span className="text-2xl shrink-0">{group.icon}</span>
                <div className="min-w-0">
                  <p className={`text-xs ${active ? 'text-white' : 'text-slate-800 font-bold'}`}>
                    {lang === 'bn' ? group.labelBn : group.labelEn}
                  </p>
                  <p className={`text-[10px] ${active ? 'text-pink-100' : 'text-slate-400'}`}>
                    {lang === 'bn' ? 'উপযুক্ত পণ্য' : 'Target Products'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
