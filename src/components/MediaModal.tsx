import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, Heart, Eye, Share2, ShoppingBag, ExternalLink, Sparkles, Film, Image as ImageIcon } from 'lucide-react';

export const MediaModal: React.FC = () => {
  const { 
    lang, 
    activeMediaModal, 
    setActiveMediaModal, 
    toggleLikeMedia, 
    products, 
    setActiveDetailProduct, 
    showToast 
  } = useShop();

  if (!activeMediaModal) return null;

  const linkedProduct = activeMediaModal.linkedProductId 
    ? products.find(p => p.id === activeMediaModal.linkedProductId)
    : null;

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.origin + '?media=' + activeMediaModal.id);
    showToast(lang === 'bn' ? 'মিডিয়া লিংক কপি করা হয়েছে!' : 'Media link copied!');
  };

  const handleShopProduct = () => {
    if (linkedProduct) {
      setActiveMediaModal(null);
      setActiveDetailProduct(linkedProduct);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh]">
        
        {/* Top Bar */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-blue-950 font-black flex items-center justify-center text-xs shadow-md">
              {activeMediaModal.type === 'video' ? <Film className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
            </span>
            <div>
              <h3 className="font-extrabold text-white text-xs sm:text-sm truncate max-w-xs sm:max-w-md">
                {lang === 'bn' ? activeMediaModal.titleBn : activeMediaModal.titleEn}
              </h3>
              <p className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>ক্রেতার বাজার HD মিডিয়া</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShare}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 transition cursor-pointer"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveMediaModal(null)}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-600 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Container */}
        <div className="flex-1 bg-black/90 flex items-center justify-center relative overflow-hidden min-h-[260px] sm:min-h-[380px]">
          {activeMediaModal.type === 'video' ? (
            activeMediaModal.url && activeMediaModal.url.trim() ? (
              <video
                src={activeMediaModal.url.trim()}
                controls
                autoPlay
                playsInline
                poster={(activeMediaModal.thumbnailUrl && activeMediaModal.thumbnailUrl.trim()) || undefined}
                className="w-full h-full max-h-[60vh] object-contain rounded-lg"
              />
            ) : null
          ) : (
            <img
              src={(activeMediaModal.url && activeMediaModal.url.trim()) || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80'}
              alt={activeMediaModal.titleBn || ''}
              className="w-full h-full max-h-[65vh] object-contain rounded-lg"
            />
          )}

          {/* Badge Overlay */}
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/30 text-[11px] font-extrabold text-amber-300">
            {activeMediaModal.type === 'video' ? '🎬 4K HD ভিডিও' : '📸 হাই-রেজুলিউশন ছবি'}
          </div>
        </div>

        {/* Bottom Details & Interaction Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-amber-200 text-sm sm:text-base">
                {lang === 'bn' ? activeMediaModal.titleBn : activeMediaModal.titleEn}
              </h4>
              {(activeMediaModal.captionBn || activeMediaModal.captionEn) && (
                <p className="text-xs text-slate-400">
                  {lang === 'bn' ? activeMediaModal.captionBn : activeMediaModal.captionEn}
                </p>
              )}
            </div>

            {/* Like & Views */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>{activeMediaModal.viewsCount || 1} দেখা হয়েছে</span>
              </span>

              <button
                onClick={() => toggleLikeMedia(activeMediaModal.id)}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>{activeMediaModal.likesCount || 0}</span>
              </button>
            </div>
          </div>

          {/* Linked Product Bar */}
          {linkedProduct && (
            <div className="p-3 bg-gradient-to-r from-blue-950 to-indigo-950 border border-amber-400/30 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img 
                  src={(Array.isArray(linkedProduct.images) && linkedProduct.images.find(img => typeof img === 'string' && img.trim().length > 0)) || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80'} 
                  alt="" 
                  className="w-10 h-10 object-cover rounded-xl border border-amber-400/40 shrink-0" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">ভিডিওর সাথে যুক্ত পণ্য</p>
                  <h5 className="font-bold text-white text-xs truncate">{linkedProduct.nameBn}</h5>
                </div>
              </div>

              <button
                onClick={handleShopProduct}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-950 font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md transition cursor-pointer shrink-0"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>৳{linkedProduct.discountPrice || linkedProduct.price} কিনুন</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
