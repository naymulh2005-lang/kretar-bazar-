import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { TRANSLATIONS } from '../data/translations';
import { ProductCard } from './ProductCard';
import { 
  X, 
  Star, 
  ShoppingBag, 
  Zap, 
  Heart, 
  Share2, 
  Play, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  ChevronDown, 
  MessageSquare, 
  HelpCircle,
  Check,
  Plus,
  Minus
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { 
    lang, 
    activeDetailProduct, 
    setActiveDetailProduct, 
    addToCart, 
    toggleWishlist, 
    isWishlisted,
    setActiveVideoProduct,
    setActiveShareProduct,
    products,
    addReview,
    setIsCheckoutOpen
  } = useShop();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(activeDetailProduct?.sizes?.[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState(activeDetailProduct?.colors?.[0] || { nameBn: 'ডিফল্ট', nameEn: 'Default', hex: '#000000' });
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'faqs'>('desc');

  React.useEffect(() => {
    if (activeDetailProduct) {
      setSelectedImageIndex(0);
      setSelectedSize(activeDetailProduct.sizes?.[0] || 'Standard');
      setSelectedColor(activeDetailProduct.colors?.[0] || { nameBn: 'ডিফল্ট', nameEn: 'Default', hex: '#000000' });
      setQuantity(1);
    }
  }, [activeDetailProduct?.id]);

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');

  if (!activeDetailProduct) return null;

  const t = TRANSLATIONS[lang];
  const product = activeDetailProduct;
  const wishlisted = isWishlisted(product.id);

  const originalPrice = typeof product.price === 'number' && !isNaN(product.price) ? product.price : 0;
  const discountPrice = typeof product.discountPrice === 'number' && !isNaN(product.discountPrice) && product.discountPrice > 0 
    ? product.discountPrice 
    : undefined;
  const discountPercent = (discountPrice && originalPrice > 0) 
    ? Math.max(0, Math.round(((originalPrice - discountPrice) / originalPrice) * 100)) 
    : 0;

  const validImages = Array.isArray(product.images)
    ? product.images.filter(img => typeof img === 'string' && img.trim().length > 0)
    : [];
  const productImages = validImages.length > 0
    ? validImages
    : ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80'];

  const relatedProducts = (products || [])
    .filter(p => p && p.id && p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 4);

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setActiveDetailProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addReview(product.id, newRating, newComment, reviewerName);
    setNewComment('');
    setReviewerName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full my-auto overflow-hidden shadow-2xl relative border border-slate-100 max-h-[94vh] flex flex-col">
        
        {/* Sticky Header Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>{product.brand}</span>
            <span>•</span>
            <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-md font-bold">
              {product.ageTextBn}
            </span>
          </div>

          <button
            onClick={() => setActiveDetailProduct(null)}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center transition shadow-xs cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-8 flex-1">
          
          {/* Main Top Section: Gallery + Options */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* Left: Product Photos Gallery */}
            <div className="lg:col-span-6 space-y-3">
              {/* Main Display Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
                <img 
                  src={productImages[selectedImageIndex] || productImages[0] || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80'} 
                  alt="" 
                  decoding="async"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80';
                  }}
                />

                {discountPercent > 0 && (
                  <span className="absolute top-3 left-3 bg-rose-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-xl shadow-md">
                    -{discountPercent}% OFF
                  </span>
                )}

                {/* Video Play Trigger Badge */}
                {product.videoUrl && (
                  <button
                    onClick={() => setActiveVideoProduct(product)}
                    className="absolute bottom-3 left-3 bg-slate-900/90 hover:bg-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 backdrop-blur-md shadow-lg transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{t.watchVideo}</span>
                  </button>
                )}
              </div>

              {/* Gallery Thumbnails List */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                      selectedImageIndex === idx ? 'border-pink-500 ring-2 ring-pink-100' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80'} 
                      alt="" 
                      loading="lazy" 
                      decoding="async" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Product Details & Variant Selectors */}
            <div className="lg:col-span-6 space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                  <span>SKU: {product.sku}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`p-2 rounded-full border transition cursor-pointer ${
                        wishlisted ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
                    </button>
                    <button
                      onClick={() => setActiveShareProduct(product)}
                      className="p-2 rounded-full border bg-slate-50 border-slate-200 text-slate-600 hover:text-pink-600 transition cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-800 leading-snug">
                  {lang === 'bn' ? product.nameBn : product.nameEn}
                </h1>

                {/* Rating & Stock */}
                <div className="flex items-center gap-3 my-2 text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{product.rating}</span>
                    <span className="text-slate-400 font-normal">({product.reviewCount} {lang === 'bn' ? 'রিভিউ' : 'reviews'})</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg">
                    {lang === 'bn' ? 'স্টকে আছে' : 'In Stock'} ({product.stock} pcs)
                  </span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-2 bg-pink-50/50 p-3 rounded-2xl border border-pink-100 my-3">
                  <span className="text-2xl font-black text-pink-600">
                    ৳{discountPrice || originalPrice}
                  </span>
                  {discountPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      ৳{originalPrice}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md ml-auto">
                      {lang === 'bn' ? `৳${originalPrice - discountPrice} সঞ্চয়` : `Save ৳${originalPrice - discountPrice}`}
                    </span>
                  )}
                </div>

                {/* Size Selector */}
                {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                  <div className="space-y-1.5 my-3">
                    <label className="text-xs font-extrabold text-slate-700">
                      {lang === 'bn' ? 'সাইজ বেছে নিন:' : 'Select Size:'}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map(size => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            selectedSize === size
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selector */}
                {Array.isArray(product.colors) && product.colors.length > 0 && (
                  <div className="space-y-1.5 my-3">
                    <label className="text-xs font-extrabold text-slate-700">
                      {lang === 'bn' ? 'কালার পছন্দ করুন:' : 'Select Color:'}
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(product.colors || []).map((c, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedColor(c);
                            if (productImages[idx]) {
                              setSelectedImageIndex(idx);
                            }
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                            selectedColor.nameEn === c.nameEn
                              ? 'bg-pink-50 border-pink-500 text-pink-700 font-bold ring-1 ring-pink-500 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" 
                            style={{ backgroundColor: c.hex }} 
                          />
                          <span>{lang === 'bn' ? c.nameBn : c.nameEn}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="flex items-center gap-4 my-4">
                  <label className="text-xs font-extrabold text-slate-700">
                    {lang === 'bn' ? 'পরিমাণ:' : 'Quantity:'}
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-xs text-slate-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Main CTA Buttons */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => addToCart(product, selectedSize, selectedColor, quantity)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-2xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t.addToCart}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white py-3 px-4 rounded-2xl text-xs font-extrabold shadow-lg shadow-pink-200 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>{t.buyNow}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Navigation Tabs (Description, Specifications, Reviews, FAQs) */}
          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
              <button
                onClick={() => setActiveTab('desc')}
                className={`pb-2.5 px-4 text-xs font-extrabold transition cursor-pointer border-b-2 whitespace-nowrap ${
                  activeTab === 'desc'
                    ? 'border-pink-600 text-pink-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {lang === 'bn' ? 'বিবরণ ও বিবরণী' : 'Description'}
              </button>

              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-2.5 px-4 text-xs font-extrabold transition cursor-pointer border-b-2 whitespace-nowrap ${
                  activeTab === 'specs'
                    ? 'border-pink-600 text-pink-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.specifications}
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2.5 px-4 text-xs font-extrabold transition cursor-pointer border-b-2 whitespace-nowrap ${
                  activeTab === 'reviews'
                    ? 'border-pink-600 text-pink-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.reviews} ({product.reviewCount})
              </button>

              <button
                onClick={() => setActiveTab('faqs')}
                className={`pb-2.5 px-4 text-xs font-extrabold transition cursor-pointer border-b-2 whitespace-nowrap ${
                  activeTab === 'faqs'
                    ? 'border-pink-600 text-pink-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.faqs}
              </button>
            </div>

            {/* Tab Contents */}
            <div className="py-4 text-xs text-slate-600 leading-relaxed">
              {/* Description */}
              {activeTab === 'desc' && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">
                    {lang === 'bn' ? product.descriptionBn : product.descriptionEn}
                  </p>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="text-xs text-slate-600 font-medium">
                      {lang === 'bn' 
                        ? 'সকল পণ্য স্বাস্থ্যসম্মত উপাদানে তৈরি এবং শিশুদের ক্ষতিকারক কেমিক্যাল মুক্ত সেফটি সার্টিফাইড।' 
                        : 'Certified non-toxic, skin-safe, and baby-grade materials used.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Specifications */}
              {activeTab === 'specs' && (
                <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {product.specifications.map((s, idx) => (
                    <div key={idx} className="flex p-3 bg-slate-50/50">
                      <span className="w-1/3 font-bold text-slate-700">
                        {lang === 'bn' ? s.keyBn : s.keyEn}
                      </span>
                      <span className="w-2/3 text-slate-600">
                        {lang === 'bn' ? s.valueBn : s.valueEn}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Reviews */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Reviews List */}
                  <div className="space-y-3">
                    {product.reviews.map(r => (
                      <div key={r.id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-xs">{r.userName}</span>
                          <span className="text-[10px] text-slate-400">{r.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{r.comment}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Review Form */}
                  <form onSubmit={handleReviewSubmit} className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 space-y-3">
                    <h4 className="font-extrabold text-slate-800 text-xs">{t.writeReview}</h4>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder={lang === 'bn' ? 'আপনার নাম' : 'Your name'}
                        value={reviewerName}
                        onChange={e => setReviewerName(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-pink-500 flex-1"
                        required
                      />

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewRating(star)}
                            className="text-amber-400 cursor-pointer"
                          >
                            <Star className={`w-4 h-4 ${star <= newRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      placeholder={lang === 'bn' ? 'আপনার অভিজ্ঞতা সংক্ষেপে লিখুন...' : 'Write your experience...'}
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-pink-500"
                      required
                    />

                    <button
                      type="submit"
                      className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      {lang === 'bn' ? 'রিভিউ জমা দিন' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              )}

              {/* FAQs */}
              {activeTab === 'faqs' && (
                <div className="space-y-3">
                  {product.faqs.map((faq, idx) => (
                    <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-1">
                        <HelpCircle className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                        <span>{lang === 'bn' ? faq.questionBn : faq.questionEn}</span>
                      </h5>
                      <p className="text-xs text-slate-600 pl-5">
                        {lang === 'bn' ? faq.answerBn : faq.answerEn}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-800 mb-4">{t.relatedProducts}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
