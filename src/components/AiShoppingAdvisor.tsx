import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { TRANSLATIONS } from '../data/translations';
import { MasterLogo } from './MasterLogo';
import { Sparkles, X, Send, Bot, User, ArrowRight } from 'lucide-react';

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
  recommendedCategoryId?: string;
}

export const AiShoppingAdvisor: React.FC = () => {
  const { 
    lang, 
    isAiAdvisorOpen, 
    setIsAiAdvisorOpen, 
    products, 
    setFilters, 
    setActiveDetailProduct 
  } = useShop();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: lang === 'bn' 
        ? 'আসসালামু আলাইকুম! আমি ক্রেতার বাজার AI সহকারী। আপনার বাচ্চার বয়স বা ওজন কত? যেমন: "আমার বাচ্চার বয়স ৮ মাস" অথবা "২ বছরের বাচ্চার খেলনা চাই"' 
        : 'Hello! I am your Kretar Bazar AI Advisor. Tell me your baby age or weight (e.g. "8 month old clothes" or "toys for 2 year old")!'
    }
  ]);

  if (!isAiAdvisorOpen) return null;

  const t = TRANSLATIONS[lang];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputQuery('');

    // AI logic response simulation based on query keywords
    setTimeout(() => {
      const q = userText.toLowerCase();
      let reply = '';
      let ageFilter: any = null;

      if (q.includes('৬') || q.includes('8') || q.includes('8 মাস') || q.includes('মাস') || q.includes('month') || q.includes('6-12')) {
        reply = lang === 'bn' 
          ? '৬-১২ মাস বয়সী সোনামণিদের জন্য আমাদের ১০০% অর্গানিক সুতির রোম্পার সেট এবং সফট গ্রিপ ওয়াকিং শু সেরা! রোম্পারগুলিতে কটন মেটেরিয়াল ব্যবহার করা হয়েছে যাতে বাচ্চার ঘাড়ে বা কোমর ঘাম না জমে।'
          : 'For 6-12 month babies, our 100% Organic Cotton Romper Sets and First Walker Shoes are highly recommended!';
        ageFilter = '6-12m';
      } else if (q.includes('১') || q.includes('২') || q.includes('1') || q.includes('2') || q.includes('বছর') || q.includes('year')) {
        reply = lang === 'bn' 
          ? '১-২ বছর বয়সী বাচ্চাদের বুদ্ধিমত্তা বাড়াতে মন্টেসরি কাঠের কালার ব্লকিং বোর্ড এবং ফ্লোরাল সুতির ড্রেস দারুণ পছন্দ হবে।'
          : 'For 1-2 year olds, Montessori Wooden Sorting Board and Cotton Outfits are perfect for brain development!';
        ageFilter = '1-2y';
      } else if (q.includes('খেলনা') || q.includes('toy') || q.includes('পাজল')) {
        reply = lang === 'bn'
          ? 'বাচ্চাদের জন্য আমরা বিপিএ ফ্রী, স্মুথ কোণা যুক্ত এবং নিরাপত্তা এন৭১ সার্টিফাইড খেলনা নির্বাচন করি।'
          : 'All our toys are EN71 safety certified, BPA free, and non-toxic.';
      } else {
        reply = lang === 'bn' 
          ? 'ধন্যবাদ প্রশ্নের জন্য! আমাদের সকল পণ্য ৬ মাস থেকে ১০ বছর বয়সী শিশুদের জন্য নিরাপদ। আপনি নিচে বয়স ফিল্টার সিলেক্ট করে পছন্দমতো কেনাকাটা করতে পারেন।'
          : 'Thank you! You can filter products by age groups 6m to 10 years directly from our homepage.';
      }

      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);

      if (ageFilter) {
        setFilters(prev => ({ ...prev, selectedAgeGroups: [ageFilter] }));
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative border border-slate-100 max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-amber-300 border-b border-amber-500/30 flex items-center justify-between">
          <MasterLogo size="md" variant="full" />

          <button
            onClick={() => setIsAiAdvisorOpen(false as any)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
          {messages.map((m, idx) => (
            <div 
              key={idx}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                m.sender === 'ai' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-white'
              }`}>
                {m.sender === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                m.sender === 'ai' 
                  ? 'bg-white text-slate-800 border border-slate-200/80 shadow-xs' 
                  : 'bg-pink-600 text-white font-medium shadow-xs'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Query Suggestions */}
        <div className="p-2.5 bg-slate-100 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px] scrollbar-none">
          <button
            onClick={() => setInputQuery('৮ মাসের বাচ্চার পোশাক')}
            className="bg-white border border-slate-300 hover:border-pink-500 px-2.5 py-1 rounded-xl whitespace-nowrap text-slate-700 font-semibold cursor-pointer"
          >
            👶 ৮ মাসের জামা
          </button>
          <button
            onClick={() => setInputQuery('২ বছরের লার্নিং খেলনা')}
            className="bg-white border border-slate-300 hover:border-pink-500 px-2.5 py-1 rounded-xl whitespace-nowrap text-slate-700 font-semibold cursor-pointer"
          >
            🧩 ২ বছরের খেলনা
          </button>
          <button
            onClick={() => setInputQuery('শীতের হুডেড জ্যাকেট')}
            className="bg-white border border-slate-300 hover:border-pink-500 px-2.5 py-1 rounded-xl whitespace-nowrap text-slate-700 font-semibold cursor-pointer"
          >
            ❄️ শীতের জ্যাকেট
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            placeholder={lang === 'bn' ? 'বাচ্চার বয়স বা প্রশ্ন লিখুন...' : 'Type baby age or query...'}
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs flex-1 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
