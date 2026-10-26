import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { MediaCategory, MediaItem } from '../types';
import { Play, Image as ImageIcon, Film, Eye, Heart, Sparkles, Plus, ShieldCheck } from 'lucide-react';

export const MediaGallerySection: React.FC = () => {
  const { lang, mediaList, setActiveMediaModal, incrementMediaViews, setIsAdminOpen } = useShop();
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | 'all'>('all');

  const categories: { id: MediaCategory | 'all'; nameBn: string; nameEn: string }[] = [
    { id: 'all', nameBn: 'সকল কন্টেন্ট', nameEn: 'All Media' },
    { id: 'product_photoshoot', nameBn: '📸 ফটোশুট', nameEn: 'Photoshoots' },
    { id: 'video_review', nameBn: '🎬 ভিডিও রিভিউ', nameEn: 'Video Reviews' },
    { id: 'new_collection', nameBn: '✨ নতুন কালেকশন', nameEn: 'New Arrivals' },
    { id: 'customer_moments', nameBn: '❤️ হ্যাপি ক্লায়েন্ট', nameEn: 'Happy Moments' },
  ];

  const filteredList = mediaList.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const handleOpenMedia = (media: MediaItem) => {
    incrementMediaViews(media.id);
    setActiveMediaModal(media);
  };

  return (
    <section className="py-10 bg-gradient-to-b from-slate-900 via-slate-950 to-blue-950 text-white relative overflow-hidden border-y border-amber-500/20">
      
      {/* Background Decorative Blur */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 space-y-6 relative z-10">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-blue-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>HD LIVE GALLERY</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>লাইভ আপডেট</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {lang === 'bn' ? 'ক্রেতার বাজার মিডিয়া গ্যালারি ও ভিডিও' : 'Kretar Bazar Gallery & Video Reviews'}
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              {lang === 'bn' 
                ? 'আমাদের হাই-কোয়ালিটি ফটোশুট, কাস্টমারদের আনবক্সিং ভিডিও ও প্রডাক্ট লুকবুক সরাসরি দেখুন' 
                : 'Explore real product photoshoots, customer video reviews & unboxing moments in 4K HD'}
            </p>
          </div>

          {/* Admin Management Button */}
          <button
            onClick={() => setIsAdminOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-950 font-black px-3.5 py-2 rounded-2xl text-xs shadow-lg transition cursor-pointer self-start md:self-auto shrink-0 border border-amber-300/60"
          >
            <ShieldCheck className="w-4 h-4 text-blue-950" />
            <span>মিডিয়া আপলোড ও ম্যানেজ করুন</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl font-extrabold whitespace-nowrap transition cursor-pointer shadow-sm border ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-blue-950 border-amber-300 shadow-amber-400/20'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {lang === 'bn' ? cat.nameBn : cat.nameEn}
            </button>
          ))}
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredList.map(item => (
            <div
              key={item.id}
              onClick={() => handleOpenMedia(item)}
              className="group bg-slate-800/60 border border-slate-700/60 hover:border-amber-400/60 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 cursor-pointer flex flex-col relative"
            >
              {/* Media Thumbnail Container */}
              <div className="aspect-4/3 sm:aspect-square bg-slate-950 overflow-hidden relative">
                {(() => {
                  const mediaSrc = item.type === 'video' 
                    ? ((item.thumbnailUrl && item.thumbnailUrl.trim()) || (item.url && item.url.trim()))
                    : (item.url && item.url.trim());
                  const safeSrc = mediaSrc || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80';
                  return (
                    <img
                      src={safeSrc}
                      alt={item.titleBn || ''}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100"
                      loading="lazy"
                    />
                  );
                })()}

                {/* Video Play Overlay Icon */}
                {item.type === 'video' ? (
                  <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-amber-400 text-blue-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition duration-300 border-2 border-white">
                      <Play className="w-6 h-6 fill-blue-950 ml-0.5" />
                    </div>
                  </div>
                ) : (
                  <div className="absolute top-2.5 right-2.5 bg-slate-950/70 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 text-amber-300">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Video / Image Badge */}
                <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-400/30 text-[10px] font-black text-amber-300 flex items-center gap-1">
                  {item.type === 'video' ? <Film className="w-3 h-3 text-amber-400" /> : <ImageIcon className="w-3 h-3 text-amber-400" />}
                  <span>{item.type === 'video' ? 'ভিডিও' : 'ছবি'}</span>
                </div>

                {item.isFeatured && (
                  <div className="absolute top-2.5 left-2.5 bg-rose-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                    FEATURED
                  </div>
                )}
              </div>

              {/* Title & Stats */}
              <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                <h4 className="font-extrabold text-slate-100 text-xs line-clamp-2 group-hover:text-amber-300 transition">
                  {lang === 'bn' ? item.titleBn : item.titleEn}
                </h4>

                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pt-1 border-t border-slate-700/40">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-blue-400" />
                    <span>{item.viewsCount || 1}</span>
                  </span>

                  <span className="flex items-center gap-1 text-rose-400">
                    <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                    <span>{item.likesCount || 0}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
