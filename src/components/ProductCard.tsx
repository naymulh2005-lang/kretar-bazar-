import React from 'react';
import { useShop } from '../context/ShopContext';
import { TRANSLATIONS } from '../data/translations';
import { Product } from '../types';
import { Heart, ShoppingBag, Play, Share2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const toBnNum = (num: number, isBn: boolean) => {
  const safeNum = typeof num === 'number' && !isNaN(num) ? num : 0;
  if (!isBn) return safeNum.toString();
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return safeNum.toString().split('').map(d => bnDigits[parseInt(d)] || d).join('');
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const { 
    lang, 
    addToCart, 
    toggleWishlist, 
    isWishlisted, 
    setActiveDetailProduct,
    setActiveVideoProduct,
    setActiveShareProduct
  } = useShop();

  if (!product || !product.id) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS['bn'];
  const wishlisted = typeof isWishlisted === 'function' ? isWishlisted(product.id) : false;

  const originalPrice = typeof product.price === 'number' && !isNaN(product.price) ? product.price : 0;
  const discountPrice = typeof product.discountPrice === 'number' && !isNaN(product.discountPrice) && product.discountPrice > 0 
    ? product.discountPrice 
    : undefined;
  const discountPercent = (discountPrice && originalPrice > 0) 
    ? Math.max(0, Math.round(((originalPrice - discountPrice) / originalPrice) * 100)) 
    : 0;

  const serialStr = index !== undefined ? toBnNum(index + 1, lang === 'bn') : null;

  const rawImage = Array.isArray(product.images)
    ? product.images.find(img => typeof img === 'string' && img.trim().length > 0)
    : null;
  const primaryImage = (rawImage && rawImage.trim()) || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80';

  const productName = (lang === 'bn' ? (product.nameBn || product.nameEn) : (product.nameEn || product.nameBn)) || 'Baby Product';
  const stockCount = typeof product.stock === 'number' && !isNaN(product.stock) ? product.stock : 10;
  const effectivePrice = discountPrice || originalPrice;

  return (
    <div 
      className="group relative bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-xl hover:border-pink-300/80 transition-all duration-300 flex flex-col justify-between"
      id={`product-card-${product.id}`}
    >
      
      {/* Product Image Container (~85-90% visual height) */}
      <div 
        className="relative aspect-square w-full overflow-hidden bg-slate-50 cursor-pointer"
        onClick={() => setActiveDetailProduct(product)}
      >
        <img 
          src={primaryImage} 
          alt={productName}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Top Badges (Discount / Serial / Badges) */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
          {discountPercent > 0 && (
            <span className="bg-rose-600/95 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded-md shadow-xs backdrop-blur-xs">
              -{discountPercent}%
            </span>
          )}
          {serialStr && (
            <span className="bg-slate-900/80 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-md shadow-xs backdrop-blur-xs">
              #{serialStr}
            </span>
          )}
        </div>

        {/* Top Right Quick Actions (Wishlist & Share) */}
        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition shadow-xs cursor-pointer active:scale-90 ${
              wishlisted 
                ? 'bg-rose-500 text-white' 
                : 'bg-white/85 hover:bg-white text-slate-600 hover:text-rose-500 backdrop-blur-xs'
            }`}
            title={t.wishlist}
            aria-label="Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${wishlisted ? 'fill-white' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveShareProduct(product);
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/85 hover:bg-white text-slate-600 hover:text-pink-600 flex items-center justify-center transition shadow-xs cursor-pointer backdrop-blur-xs active:scale-90"
            title={t.share}
            aria-label="Share"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Video Preview Badge if Available */}
        {product.videoUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveVideoProduct(product);
            }}
            className="absolute bottom-2 left-2 bg-slate-900/85 hover:bg-pink-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 backdrop-blur-md shadow-xs transition cursor-pointer z-10 active:scale-95"
          >
            <Play className="w-2.5 h-2.5 fill-white" />
            <span className="hidden xs:inline">{t.watchVideo}</span>
          </button>
        )}
      </div>

      {/* Slim & Minimal Bottom Info & Action Bar */}
      <div className="p-2 sm:p-2.5 flex flex-col gap-1.5 bg-white">
        
        {/* Single-line Product Name with ellipsis */}
        <h3 
          onClick={() => setActiveDetailProduct(product)}
          title={productName}
          className="text-[11px] sm:text-xs font-bold text-slate-800 truncate hover:text-pink-600 transition cursor-pointer leading-tight"
        >
          {productName}
        </h3>

        {/* Price & Compact "Order Now" Button in One Row */}
        <div className="flex items-center justify-between gap-1 pt-0.5">
          
          {/* Price Block */}
          <div className="min-w-0 flex items-baseline gap-1">
            <span className="text-xs sm:text-sm font-black text-blue-950 shrink-0">
              ৳{toBnNum(effectivePrice, lang === 'bn')}
            </span>
            {discountPrice && (
              <span className="text-[10px] text-slate-400 line-through truncate hidden xs:inline">
                ৳{toBnNum(originalPrice, lang === 'bn')}
              </span>
            )}
          </div>

          {/* Compact Touch-Friendly "Order Now" Button */}
          <button
            disabled={stockCount <= 0}
            onClick={() => addToCart(product)}
            className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-[10px] sm:text-xs font-black flex items-center gap-1 transition cursor-pointer shadow-xs active:scale-95 shrink-0 touch-manipulation ${
              stockCount > 0
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-blue-950 hover:from-amber-500 hover:to-amber-600 shadow-amber-400/20 border border-amber-300'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
            title="Order Now"
          >
            <ShoppingBag className="w-3 h-3 text-blue-950" />
            <span className="whitespace-nowrap">
              {lang === 'bn' ? 'অর্ডার' : 'Order Now'}
            </span>
          </button>

        </div>

      </div>

    </div>
  );
};
