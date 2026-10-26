import React from 'react';
import { useShop } from '../context/ShopContext';
import { TRANSLATIONS } from '../data/translations';
import { ArrowUpRight } from 'lucide-react';

export const CategoriesGrid: React.FC = () => {
  const { lang, categories, setFilters, filters } = useShop();
  const t = TRANSLATIONS[lang];

  return (
    <div id="categories-section" className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              {lang === 'bn' ? 'জনপ্রিয় ক্যাটাগরি' : 'Popular Categories'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {lang === 'bn' ? 'বাচ্চাদের সকল ধরণের প্রয়োজনীয় সামগ্রী' : 'Everything your little baby needs'}
            </p>
          </div>

          <button
            onClick={() => setFilters(prev => ({ ...prev, selectedCategory: 'all' }))}
            className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer"
          >
            <span>{lang === 'bn' ? 'সবগুলো দেখুন' : 'View All'}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(cat => {
            const isSelected = filters.selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilters(prev => ({ ...prev, selectedCategory: cat.id }))}
                className={`group relative rounded-2xl overflow-hidden border p-3.5 text-left transition-all duration-300 cursor-pointer flex items-center gap-3 ${
                  isSelected
                    ? 'border-pink-500 bg-pink-50/80 shadow-md ring-2 ring-pink-200'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-pink-200 hover:shadow-lg'
                }`}
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-xs">
                  <img 
                    src={(typeof cat.image === 'string' && cat.image.trim()) || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'} 
                    alt="" 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 group-hover:text-pink-600 transition truncate">
                    {lang === 'bn' ? cat.nameBn : cat.nameEn}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {cat.itemCount} {lang === 'bn' ? 'টি পণ্য' : 'items'}
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
