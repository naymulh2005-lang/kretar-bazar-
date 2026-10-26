import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { TRANSLATIONS } from '../data/translations';
import { MasterLogo } from './MasterLogo';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Sparkles, 
  ShieldCheck, 
  Globe, 
  Menu, 
  X, 
  SlidersHorizontal,
  Flame,
  Clock,
  ChevronDown
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    lang, 
    setLang, 
    cart, 
    wishlistIds, 
    filters, 
    setFilters, 
    setIsCartOpen, 
    setIsAuthOpen, 
    setIsAdminOpen, 
    setIsAiAdvisorOpen,
    user,
    products,
    setActiveDetailProduct,
    categories,
    activeHeaderConfig
  } = useShop();

  const t = TRANSLATIONS[lang];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const promoMsg = lang === 'bn' ? activeHeaderConfig.promoAnnouncementBn : activeHeaderConfig.promoAnnouncementEn;
  const welcomeMsg = lang === 'bn' ? activeHeaderConfig.welcomeMessageBn : activeHeaderConfig.welcomeMessageEn;
  const headerTitle = lang === 'bn' ? activeHeaderConfig.titleBn : activeHeaderConfig.titleEn;

  // Scroll listener to shrink header on scroll
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Live search suggestions
  const searchSuggestions = filters.searchQuery.trim().length > 1 
    ? products.filter(p => 
        p.isPublished && (
          p.nameBn.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          p.nameEn.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(filters.searchQuery.toLowerCase())
        )
      ).slice(0, 5)
    : [];

  return (
    <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/50 shadow-xs transition-all duration-300 ${
      isScrolled ? 'shadow-md bg-white/98' : ''
    }`}>
      {/* Dynamic Top Announcement & Welcome Bar */}
      {promoMsg && (
        <div className="bg-slate-900 text-amber-200 text-[11px] font-bold py-1 px-3 border-b border-amber-500/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <span className="bg-rose-600 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded-md shrink-0">LIVE</span>
              <span className="truncate">{promoMsg}</span>
            </div>
            
            <div className="hidden sm:flex items-center gap-3 shrink-0 text-[10px] text-slate-300">
              {welcomeMsg && <span className="truncate text-amber-100">{welcomeMsg}</span>}
              {activeHeaderConfig.hotlinePhone && (
                <a href={`tel:${activeHeaderConfig.hotlinePhone}`} className="hover:text-amber-300 flex items-center gap-1 font-mono">
                  📞 {activeHeaderConfig.hotlinePhone}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Header Bar */}

      <div className={`max-w-7xl mx-auto px-3 sm:px-4 transition-all duration-300 ${
        isScrolled ? 'py-1.5 sm:py-2' : 'py-2 sm:py-2.5'
      }`}>
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Master Logo */}
          <a href="#" className="flex items-center shrink-0">
            <MasterLogo size={isScrolled ? 'sm' : 'md'} variant="full" />
          </a>

          {/* Search Bar - Desktop & Tablet prioritized */}
          <div className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl relative">
            <div className="relative w-full">
              <input
                type="text"
                value={filters.searchQuery}
                onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-9 py-1.5 sm:py-2 bg-slate-100/80 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Instant Search Suggestions Dropdown */}
            {isSearchFocused && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-fade-in">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                  {lang === 'bn' ? 'দ্রুত পরামর্শ' : 'Suggested Products'}
                </div>
                {searchSuggestions.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveDetailProduct(item);
                      setIsSearchFocused(false);
                    }}
                    className="w-full text-left p-2 hover:bg-amber-50/60 rounded-xl flex items-center gap-3 transition cursor-pointer"
                  >
                    <img 
                      src={(Array.isArray(item.images) && item.images.find(img => typeof img === 'string' && img.trim().length > 0)) || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80'} 
                      alt="" 
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {lang === 'bn' ? item.nameBn : item.nameEn}
                      </p>
                      <p className="text-[11px] text-blue-900 font-black">
                        ৳{item.discountPrice || item.price} <span className="text-slate-400 font-normal">({item.ageTextBn})</span>
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Mobile Small Search Icon Button */}
            <button
              onClick={() => setIsMobileSearchOpen(prev => !prev)}
              className={`md:hidden p-2 rounded-xl transition cursor-pointer border ${
                isMobileSearchOpen 
                  ? 'bg-amber-100 text-blue-950 border-amber-300' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title={lang === 'bn' ? 'অনুসন্ধান করুন' : 'Search'}
              aria-label="Search"
            >
              {isMobileSearchOpen ? (
                <X className="w-4 h-4 text-slate-700" />
              ) : (
                <Search className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition cursor-pointer border border-slate-200"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-blue-900" />
              <span>{lang === 'bn' ? 'EN' : 'বা'}</span>
            </button>

            {/* AI Advisor Assistant (Desktop only - mobile uses bottom nav) */}
            <button
              onClick={() => setIsAiAdvisorOpen(true)}
              className="hidden md:flex items-center gap-1 bg-gradient-to-r from-blue-900 to-indigo-950 hover:from-blue-950 hover:to-indigo-900 text-amber-300 px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer border border-amber-400/30"
              title="AI Baby Shopping Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden lg:inline text-[11px]">{t.aiAssistantTitle}</span>
            </button>

            {/* Wishlist Button (Desktop only - mobile uses bottom nav / account) */}
            <button
              onClick={() => {
                setFilters(prev => ({ ...prev, selectedCategory: 'all' }));
                setIsAuthOpen(true);
              }}
              className="hidden md:block relative p-2 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
              title={t.wishlist}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Cart Button (Desktop only - mobile uses bottom nav) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="hidden md:flex relative items-center gap-1.5 bg-gradient-to-r from-blue-800 to-indigo-900 hover:from-blue-900 hover:to-indigo-950 text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer border border-amber-400/30"
            >
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">{t.cartTitle}</span>
              <span className="bg-amber-400 text-blue-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                {totalCartCount}
              </span>
            </button>

            {/* User Account (Desktop only - mobile uses bottom nav) */}
            <button
              onClick={() => setIsAuthOpen(true)}
              className="hidden md:flex p-2 text-slate-700 hover:text-blue-900 hover:bg-amber-50 rounded-xl transition cursor-pointer items-center gap-1"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-900" />
              {user && (
                <span className="hidden xl:inline text-xs font-bold text-slate-800 max-w-[80px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              title="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar - Toggled by the top search icon */}
        {isMobileSearchOpen && (
          <div className="mt-2 md:hidden animate-fade-in">
            <div className="relative w-full">
              <input
                type="text"
                autoFocus
                value={filters.searchQuery}
                onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder={t.searchPlaceholder}
                className="w-full pl-8 pr-8 py-2 bg-slate-100 border border-amber-300 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-blue-600 shadow-sm"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile search suggestions dropdown */}
            {searchSuggestions.length > 0 && (
              <div className="mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  {lang === 'bn' ? 'পরামর্শ' : 'Suggestions'}
                </div>
                {searchSuggestions.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveDetailProduct(item);
                      setIsMobileSearchOpen(false);
                    }}
                    className="w-full text-left p-2 hover:bg-amber-50/60 rounded-xl flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <img 
                      src={(Array.isArray(item.images) && item.images.find(img => typeof img === 'string' && img.trim().length > 0)) || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80'} 
                      alt="" 
                      className="w-8 h-8 object-cover rounded-lg border border-slate-200" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {lang === 'bn' ? item.nameBn : item.nameEn}
                      </p>
                      <p className="text-[10px] text-blue-900 font-black">
                        ৳{item.discountPrice || item.price}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Navigation Ribbon - Auto-collapses smoothly when scrolled */}
      <nav className={`hidden md:block bg-slate-900 text-amber-100 border-t border-amber-500/20 transition-all duration-300 ${
        isScrolled ? 'py-0.5 text-[11px]' : 'py-1 text-xs'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between font-medium">
          <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            
            <button
              onClick={() => setFilters(prev => ({ ...prev, selectedCategory: 'all' }))}
              className={`px-3 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                filters.selectedCategory === 'all'
                  ? 'bg-amber-500 text-blue-950 font-black shadow-xs'
                  : 'hover:bg-white/10 text-slate-200 hover:text-amber-300'
              }`}
            >
              {t.allCategories}
            </button>

            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilters(prev => ({ ...prev, selectedCategory: cat.id }))}
                className={`px-3 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                  filters.selectedCategory === cat.id
                    ? 'bg-amber-500 text-blue-950 font-black shadow-xs'
                    : 'hover:bg-white/10 text-slate-200 hover:text-amber-300'
                }`}
              >
                {lang === 'bn' ? cat.nameBn : cat.nameEn}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0 py-1 border-l border-slate-800 pl-3">
            <button
              onClick={() => setFilters(prev => ({ ...prev, onSaleOnly: true }))}
              className="flex items-center gap-1 text-amber-400 font-extrabold hover:underline cursor-pointer text-xs"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{t.navFlashSale}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-3 animate-fade-in shadow-xl">
          <div className="border-b pb-1.5 font-bold text-xs text-slate-500 uppercase tracking-wider">
            {t.navCategories}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                setFilters(prev => ({ ...prev, selectedCategory: 'all' }));
                setIsMobileMenuOpen(false);
              }}
              className="p-2 text-left rounded-lg bg-slate-100 font-bold text-slate-800"
            >
              {t.allCategories}
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setFilters(prev => ({ ...prev, selectedCategory: cat.id }));
                  setIsMobileMenuOpen(false);
                }}
                className="p-2 text-left rounded-lg hover:bg-amber-50 text-slate-700 font-semibold"
              >
                {lang === 'bn' ? cat.nameBn : cat.nameEn}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
