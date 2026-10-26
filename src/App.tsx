import React, { useState } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { TRANSLATIONS } from './data/translations';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { TrustBadges } from './components/TrustBadges';
import { AgeGroupBar } from './components/AgeGroupBar';
import { FlashSaleSection } from './components/FlashSaleSection';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductVideoModal } from './components/ProductVideoModal';
import { ShareModal } from './components/ShareModal';
import { FilterSidebar } from './components/FilterSidebar';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { UserAccountModal } from './components/UserAccountModal';
import { AdminPanel } from './components/AdminPanel';
import { MediaGallerySection } from './components/MediaGallerySection';
import { MediaModal } from './components/MediaModal';
import { AiShoppingAdvisor } from './components/AiShoppingAdvisor';
import { ToastContainer } from './components/ToastContainer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { SlidersHorizontal, PackageSearch } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    lang, 
    filteredProducts, 
    filters, 
    setFilters, 
    resetFilters, 
    categories 
  } = useShop();

  const t = TRANSLATIONS[lang];
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const selectedCategoryObj = categories.find(c => c.id === filters.selectedCategory);
  const activeCategoryTitle = selectedCategoryObj
    ? (lang === 'bn' ? selectedCategoryObj.nameBn : selectedCategoryObj.nameEn)
    : t.allCategories;

  return (
    <div className="min-h-screen bg-slate-50/30 text-slate-800 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      
      {/* Toast Feedback Popup */}
      <ToastContainer />

      {/* Header Bar */}
      <Header />

      {/* Main Page Layout */}
      <main className="flex-1 pb-16 md:pb-0">
        
        {/* Top Hero Banner Slider */}
        <HeroBanner />

        {/* Featured Products Showcase Section - Immediately Below Hero Banner */}
        <div className="py-4 sm:py-6 bg-white border-b border-slate-100" id="products">
          <div className="max-w-7xl mx-auto px-2.5 sm:px-4 space-y-4">

            {/* Active Filters Chips */}
            {(filters.selectedCategory !== 'all' || filters.searchQuery || filters.selectedAgeGroups.length > 0 || filters.selectedBrands.length > 0) && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs bg-pink-50/50 p-2.5 rounded-xl border border-pink-100">
                <span className="font-bold text-slate-600 mr-1 text-[11px] sm:text-xs">{lang === 'bn' ? 'সক্রিয় ফিল্টার:' : 'Active Filters:'}</span>
                
                {filters.searchQuery && (
                  <span className="bg-white border border-pink-200 px-2 py-0.5 rounded-lg text-pink-700 font-semibold text-[11px]">
                    Search: "{filters.searchQuery}"
                  </span>
                )}

                {filters.selectedAgeGroups.map(ag => (
                  <span key={ag} className="bg-white border border-pink-200 px-2 py-0.5 rounded-lg text-pink-700 font-semibold text-[11px]">
                    Age: {ag}
                  </span>
                ))}

                <button
                  onClick={resetFilters}
                  className="text-xs font-extrabold text-rose-600 hover:underline ml-auto cursor-pointer"
                >
                  {t.resetFilters}
                </button>
              </div>
            )}

            {/* Responsive Products Grid (2 Mobile, 3-4 Tablet, 5-6 Desktop) */}
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-pink-100 text-pink-500 flex items-center justify-center mx-auto">
                  <PackageSearch className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-base">
                  {lang === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products found'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {lang === 'bn' ? 'আপনার ফিল্টার বা সার্চ কিওয়ার্ড পরিবর্তন করে দেখতে পারেন।' : 'Try resetting your filters or search keywords.'}
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-md transition cursor-pointer"
                >
                  {t.resetFilters}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5 md:gap-4">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Info Badges (Trust / Quality Ribbon) - Moved Below Products List */}
        <TrustBadges />

        {/* Supporting Age Group & Flash Sale Showcase - Below Product List */}
        {filters.selectedCategory === 'all' && !filters.searchQuery && filters.selectedAgeGroups.length === 0 && (
          <>
            <AgeGroupBar />
            <FlashSaleSection />
          </>
        )}

        {/* Live HD Media & Video Review Section */}
        <MediaGallerySection />

      </main>

      {/* Modals & Overlay Portals */}
      <ProductDetailModal />
      <ProductVideoModal />
      <MediaModal />
      <ShareModal />
      <FilterSidebar isOpen={isFilterDrawerOpen} onClose={() => setIsFilterDrawerOpen(false)} />
      <CartDrawer />
      <CheckoutModal />
      <OrderConfirmationModal />
      <UserAccountModal />
      <AdminPanel />
      <AiShoppingAdvisor />

      {/* Mobile Sticky Navigation */}
      <MobileBottomNav />

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <MainAppContent />
    </ShopProvider>
  );
}
