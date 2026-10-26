import React from 'react';
import { useShop } from '../context/ShopContext';
import { TRANSLATIONS } from '../data/translations';
import { FilterState, AgeGroup, CategoryId } from '../types';
import { SlidersHorizontal, RotateCcw, Check, Sparkles, X } from 'lucide-react';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ isOpen, onClose }) => {
  const { lang, filters, setFilters, resetFilters, categories, brands } = useShop();
  const t = TRANSLATIONS[lang];

  if (!isOpen) return null;

  const ageList: { id: AgeGroup; labelBn: string; labelEn: string }[] = [
    { id: '6-12m', labelBn: '৬-১২ মাস', labelEn: '6-12 Months' },
    { id: '1-2y', labelBn: '১-২ বছর', labelEn: '1-2 Years' },
    { id: '2-4y', labelBn: '২-৪ বছর', labelEn: '2-4 Years' },
    { id: '4-6y', labelBn: '৪-৬ বছর', labelEn: '4-6 Years' },
    { id: '6-10y', labelBn: '৬-১০ বছর', labelEn: '6-10 Years' }
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

  const toggleBrand = (brandName: string) => {
    setFilters(prev => {
      const exists = prev.selectedBrands.includes(brandName);
      const updated = exists
        ? prev.selectedBrands.filter(b => b !== brandName)
        : [...prev.selectedBrands, brandName];
      return { ...prev, selectedBrands: updated };
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="bg-white w-full max-w-sm h-full shadow-2xl p-5 flex flex-col justify-between overflow-y-auto">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-pink-600" />
              <h3 className="text-base font-extrabold text-slate-800">{t.filterBy}</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.resetFilters}</span>
              </button>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-6 py-4">
            
            {/* Sort Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700">{t.sortBy}</label>
              <select
                value={filters.sortBy}
                onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as FilterState['sortBy'] }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-pink-500"
              >
                <option value="featured">{t.sortFeatured}</option>
                <option value="price-low">{t.sortPriceLow}</option>
                <option value="price-high">{t.sortPriceHigh}</option>
                <option value="rating">{t.sortRating}</option>
                <option value="newest">{t.sortNewest}</option>
              </select>
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700">{t.navCategories}</label>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1 text-xs">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, selectedCategory: 'all' }))}
                  className={`w-full text-left p-2 rounded-xl transition cursor-pointer font-medium ${
                    filters.selectedCategory === 'all' ? 'bg-pink-50 text-pink-600 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {t.allCategories}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilters(prev => ({ ...prev, selectedCategory: cat.id }))}
                    className={`w-full text-left p-2 rounded-xl transition cursor-pointer font-medium ${
                      filters.selectedCategory === cat.id ? 'bg-pink-50 text-pink-600 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {lang === 'bn' ? cat.nameBn : cat.nameEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Group Multi-Select */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700">{t.ageGroupTitle}</label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {ageList.map(age => {
                  const active = filters.selectedAgeGroups.includes(age.id);
                  return (
                    <button
                      key={age.id}
                      onClick={() => toggleAgeGroup(age.id)}
                      className={`p-2 rounded-xl border text-left font-semibold transition cursor-pointer flex items-center justify-between ${
                        active ? 'bg-pink-500 text-white border-pink-500' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{lang === 'bn' ? age.labelBn : age.labelEn}</span>
                      {active && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-extrabold text-slate-700">
                <span>{t.priceRange}</span>
                <span className="text-pink-600">৳{filters.priceRange[0]} - ৳{filters.priceRange[1]}</span>
              </div>
              <input
                type="range"
                min={0}
                max={5000}
                step={100}
                value={filters.priceRange[1]}
                onChange={e => setFilters(prev => ({ ...prev, priceRange: [0, Number(e.target.value)] }))}
                className="w-full accent-pink-600 cursor-pointer"
              />
            </div>

            {/* Brand Checkboxes */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700">{t.brands}</label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
                {brands.map(b => {
                  const active = filters.selectedBrands.includes(b.name);
                  return (
                    <label key={b.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-slate-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleBrand(b.name)}
                        className="accent-pink-600 rounded cursor-pointer"
                      />
                      <span className="text-slate-700 font-medium">{b.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Toggles: In Stock & On Sale */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-slate-50">
                <span className="text-xs font-bold text-slate-700">{t.inStockOnly}</span>
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={e => setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))}
                  className="accent-pink-600 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-slate-50">
                <span className="text-xs font-bold text-slate-700">{t.onSaleOnly}</span>
                <input
                  type="checkbox"
                  checked={filters.onSaleOnly}
                  onChange={e => setFilters(prev => ({ ...prev, onSaleOnly: e.target.checked }))}
                  className="accent-pink-600 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>

          </div>
        </div>

        {/* Footer Apply Button */}
        <button
          onClick={onClose}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-2xl text-xs shadow-md transition cursor-pointer mt-4"
        >
          {lang === 'bn' ? 'ফলাফল প্রয়োগ করুন' : 'Apply Filters'}
        </button>

      </div>
    </div>
  );
};
