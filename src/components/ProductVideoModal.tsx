import React, { useRef, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { TRANSLATIONS } from '../data/translations';
import { getYouTubeEmbedUrl, isYouTubeUrl } from '../utils/youtube';
import { X, ShoppingBag, Eye, Film } from 'lucide-react';

export const ProductVideoModal: React.FC = () => {
  const { 
    lang, 
    activeVideoProduct, 
    setActiveVideoProduct, 
    addToCart, 
    setActiveDetailProduct 
  } = useShop();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  if (!activeVideoProduct || !activeVideoProduct.videoUrl || !activeVideoProduct.videoUrl.trim()) return null;

  const t = TRANSLATIONS[lang];
  const videoUrl = activeVideoProduct.videoUrl.trim();
  const isYouTube = isYouTubeUrl(videoUrl);
  const youtubeEmbedUrl = isYouTube ? getYouTubeEmbedUrl(videoUrl, true) : null;
  const productName = lang === 'bn' ? (activeVideoProduct.nameBn || '') : (activeVideoProduct.nameEn || '');
  const rawImage = Array.isArray(activeVideoProduct.images) ? activeVideoProduct.images.find(img => typeof img === 'string' && img.trim().length > 0) : null;
  const primaryImage = rawImage || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80';

  const handleClose = () => {
    setActiveVideoProduct(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in"
      onClick={handleClose}
    >
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-3xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-3.5 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img 
              src={primaryImage} 
              alt={productName} 
              className="w-10 h-10 object-cover rounded-xl shrink-0 border border-slate-700 bg-slate-800" 
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-600/90 text-white">
                  <Film className="w-2.5 h-2.5" />
                  <span>{isYouTube ? 'YouTube HD' : 'Video'}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">SKU: {activeVideoProduct.sku}</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                {productName}
              </h3>
              <p className="text-[11px] text-pink-400 font-extrabold">
                ৳{activeVideoProduct.discountPrice || activeVideoProduct.price}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0 ml-2"
            title="Close"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Frame */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[260px] sm:min-h-[380px] w-full">
          {isYouTube && youtubeEmbedUrl ? (
            <div className="relative w-full aspect-video bg-black">
              <iframe
                src={youtubeEmbedUrl}
                title={productName}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          ) : videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain max-h-[60vh]"
            />
          ) : null}
        </div>

        {/* Bottom Actions */}
        <div className="p-3.5 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              setActiveDetailProduct(activeVideoProduct);
              setActiveVideoProduct(null);
            }}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>{t.quickView}</span>
          </button>

          <button
            onClick={() => {
              addToCart(activeVideoProduct);
              setActiveVideoProduct(null);
            }}
            className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white px-6 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t.addToCart}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
