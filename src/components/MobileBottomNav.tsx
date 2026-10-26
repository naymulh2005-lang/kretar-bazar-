import React from 'react';
import { useShop } from '../context/ShopContext';
import { TRANSLATIONS } from '../data/translations';
import { Home, Grid, Sparkles, ShoppingBag, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    lang,
    cart,
    filters,
    setFilters,
    resetFilters,
    setIsCartOpen,
    setIsAuthOpen,
    setIsAiAdvisorOpen,
    user
  } = useShop();

  const t = TRANSLATIONS[lang];
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleHomeClick = () => {
    resetFilters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoriesClick = () => {
    const el = document.getElementById('categories-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setFilters(prev => ({ ...prev, selectedCategory: 'all' }));
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 md:hidden pb-safe shadow-lg">
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
        
        {/* Home */}
        <button
          onClick={handleHomeClick}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer ${
            filters.selectedCategory === 'all' && !filters.searchQuery
              ? 'text-blue-900 font-extrabold'
              : 'text-slate-500 hover:text-blue-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">
            {lang === 'bn' ? 'হোম' : 'Home'}
          </span>
        </button>

        {/* Categories */}
        <button
          onClick={handleCategoriesClick}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer ${
            filters.selectedCategory !== 'all'
              ? 'text-blue-900 font-extrabold'
              : 'text-slate-500 hover:text-blue-800'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">
            {lang === 'bn' ? 'ক্যাটাগরি' : 'Categories'}
          </span>
        </button>

        {/* AI Advisor - Center Spotlight */}
        <button
          onClick={() => setIsAiAdvisorOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 -mt-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-900 via-indigo-900 to-blue-950 text-white flex items-center justify-center shadow-md shadow-blue-300 group-hover:scale-110 transition border-2 border-amber-400">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <span className="text-[10px] font-black text-blue-950 mt-0.5">
            {lang === 'bn' ? 'এআই সহকারী' : 'AI Help'}
          </span>
        </button>

        {/* Cart */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-blue-900 transition cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-400 text-blue-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {totalCartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">
            {lang === 'bn' ? 'কার্ট' : 'Cart'}
          </span>
        </button>

        {/* User Account */}
        <button
          onClick={() => setIsAuthOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-pink-500 transition cursor-pointer"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[55px]">
            {user ? user.name.split(' ')[0] : (lang === 'bn' ? 'একাউন্ট' : 'Account')}
          </span>
        </button>

      </div>
    </div>
  );
};
