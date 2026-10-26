import React from 'react';
import { useShop } from '../context/ShopContext';
import { TRANSLATIONS } from '../data/translations';
import { X, Copy, Check, Share2, MessageCircle, Send } from 'lucide-react';

export const ShareModal: React.FC = () => {
  const { lang, activeShareProduct, setActiveShareProduct, showToast } = useShop();

  if (!activeShareProduct) return null;

  const t = TRANSLATIONS[lang];
  const shareUrl = window.location.href.split('?')[0] + `?product=${activeShareProduct.id}`;
  const shareTitle = lang === 'bn' ? activeShareProduct.nameBn : activeShareProduct.nameEn;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast(t.linkCopied, 'success');
    } catch (err) {
      console.warn('Copy link error:', err);
      showToast(t.linkCopied, 'success');
    }
  };

  const safeOpen = (url: string) => {
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.warn('Window open error:', e);
    }
  };

  const shareFacebook = () => {
    safeOpen(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
  };

  const shareWhatsApp = () => {
    safeOpen(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`);
  };

  const shareMessenger = () => {
    safeOpen(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(shareUrl)}`);
  };

  const shareTelegram = () => {
    safeOpen(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
        
        {/* Close Button */}
        <button
          onClick={() => setActiveShareProduct(null)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800">{t.share}</h3>
            <p className="text-xs text-slate-500 line-clamp-1">{shareTitle}</p>
          </div>
        </div>

        {/* Social Buttons Grid */}
        <div className="grid grid-cols-4 gap-3 my-6">
          <button
            onClick={shareFacebook}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              f
            </div>
            <span className="text-[11px] font-bold">Facebook</span>
          </button>

          <button
            onClick={shareWhatsApp}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <MessageCircle className="w-5 h-5 fill-white" />
            </div>
            <span className="text-[11px] font-bold">WhatsApp</span>
          </button>

          <button
            onClick={shareMessenger}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold">Messenger</span>
          </button>

          <button
            onClick={shareTelegram}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-sm">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold">Telegram</span>
          </button>
        </div>

        {/* Direct Link Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">{t.copyLink}</label>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent text-xs text-slate-700 flex-1 outline-none px-2 font-mono truncate"
            />
            <button
              onClick={handleCopyLink}
              className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 shrink-0 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{t.copyLink}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
