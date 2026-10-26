import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { TRANSLATIONS } from '../data/translations';
import { ProductCard } from './ProductCard';
import { MasterLogo } from './MasterLogo';
import { 
  X, 
  User, 
  Package, 
  Heart, 
  Bell, 
  MapPin, 
  LogOut, 
  Baby, 
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  Edit2,
  Save,
  KeyRound,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';

export const UserAccountModal: React.FC = () => {
  const { 
    lang, 
    isAuthOpen, 
    setIsAuthOpen, 
    user, 
    registerUser,
    loginWithEmail,
    loginWithGoogle,
    logoutUser, 
    updateUserProfile,
    orders, 
    wishlistIds, 
    products, 
    notifications, 
    markNotificationRead 
  } = useShop();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'notifications'>('profile');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Auth Form State
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editChildName, setEditChildName] = useState(user?.childName || '');
  const [editChildAgeGroup, setEditChildAgeGroup] = useState(user?.childAgeGroup || '1-2y');
  const [editChildBirthday, setEditChildBirthday] = useState(user?.childBirthday || '');
  const [editAddress, setEditAddress] = useState(user?.addresses?.[0]?.address || 'ধানমন্ডি, ঢাকা');

  if (!isAuthOpen) return null;

  const t = TRANSLATIONS[lang];

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) return;
    setIsSubmitting(true);
    try {
      if (authMode === 'register') {
        await registerUser(emailInput, passwordInput, nameInput || 'ক্রেতা ইউজার', phoneInput || '01800000000');
      } else {
        await loginWithEmail(emailInput, passwordInput);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    await updateUserProfile({
      name: editName || user.name,
      phone: editPhone || user.phone,
      childName: editChildName,
      childAgeGroup: editChildAgeGroup,
      childBirthday: editChildBirthday,
      addresses: [
        {
          id: user.addresses?.[0]?.id || 'a1',
          label: 'হোম অ্যাড্রেস',
          address: editAddress || 'ঢাকা, বাংলাদেশ',
          city: 'ঢাকা সিটি',
          phone: editPhone || user.phone || '01800000000',
          isDefault: true
        }
      ]
    });
    setIsEditingProfile(false);
  };

  const wishlistedProducts = (products || []).filter(p => p && p.id && (wishlistIds || []).includes(p.id));
  
  // Filter user's specific orders if available
  const userOrders = user 
    ? orders.filter(o => o.userId === user.id || (user.email && o.customerEmail === user.email) || (user.phone && o.customerPhone === user.phone))
    : [];
  
  // Show strictly this user's orders (never leak storewide orders to unauthorized users)
  const displayOrders = userOrders;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto overflow-hidden shadow-2xl relative border border-slate-100 max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 text-amber-200 border-b border-amber-500/30 flex items-center justify-between">
          <MasterLogo size="md" variant="full" />

          <button
            onClick={() => setIsAuthOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!user ? (
          /* Login / Signup Form */
          <div className="p-6 space-y-5 my-auto text-xs">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-800">
                {authMode === 'login' 
                  ? (lang === 'bn' ? 'ক্রেতার বাজারে লগইন করুন' : 'Login to Kretar Bazar')
                  : (lang === 'bn' ? 'নতুন স্থায়ী অ্যাকাউন্ট তৈরি করুন' : 'Create New Permanent Account')}
              </h3>
              <p className="text-slate-500 text-xs">
                {lang === 'bn' 
                  ? 'ফায়ারবেস অথেনটিকেশন ও পার্মানেন্ট ক্লাউড ডেটা সিঙ্ক' 
                  : 'Firebase Authentication & Permanent Cloud Data Sync'}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-1.5 font-bold rounded-lg transition text-xs ${
                  authMode === 'login' ? 'bg-white text-pink-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'bn' ? 'লগইন' : 'Login'}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-1.5 font-bold rounded-lg transition text-xs ${
                  authMode === 'register' ? 'bg-white text-pink-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'bn' ? 'নতুন একাউন্ট (Register)' : 'Register'}
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3 max-w-md mx-auto">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {lang === 'bn' ? 'আপনার পূর্ণ নাম *' : 'Your Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ মোঃ তানভীর আহমেদ"
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {lang === 'bn' ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="017XXXXXXXX"
                      value={phoneInput}
                      onChange={e => setPhoneInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'bn' ? 'ইমেইল অ্যাড্রেস *' : 'Email Address *'}
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'bn' ? 'পাসওয়ার্ড * (কমপক্ষে ৬ অক্ষর)' : 'Password * (Min 6 chars)'}
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-extrabold py-3 rounded-2xl text-xs shadow-lg shadow-pink-200 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>
                  {isSubmitting 
                    ? (lang === 'bn' ? 'প্রক্রিয়াধীন...' : 'Processing...') 
                    : (authMode === 'login' ? (lang === 'bn' ? 'লগইন করুন' : 'Sign In') : (lang === 'bn' ? 'রেজিস্ট্রেশন সম্পন্ন করুন' : 'Complete Registration'))}
                </span>
              </button>
            </form>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <span className="relative bg-white px-3 text-[11px] text-slate-400 font-bold">
                {lang === 'bn' ? 'অথবা' : 'OR'}
              </span>
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full max-w-md mx-auto border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span className="w-4 h-4 font-black text-blue-600">G</span>
              <span>{lang === 'bn' ? 'Google একাউন্ট দিয়ে ১-ক্লিকে প্রবেশ করুন' : 'Continue with Google Account'}</span>
            </button>
          </div>
        ) : (
          /* User Dashboard Portal */
          <div className="flex-1 flex flex-col overflow-hidden text-xs">
            
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-50 px-4 pt-2 border-b border-slate-200 overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-2 font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'profile' ? 'bg-white text-pink-600 border-t-2 border-pink-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>প্যারেটিং প্রোফাইল</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-2 font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'orders' ? 'bg-white text-pink-600 border-t-2 border-pink-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>অর্ডার হিস্ট্রি ({displayOrders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className={`px-3 py-2 font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'wishlist' ? 'bg-white text-pink-600 border-t-2 border-pink-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>উইশলিস্ট ({wishlistIds.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-3 py-2 font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'notifications' ? 'bg-white text-pink-600 border-t-2 border-pink-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>নোটিফিকেশন ({notifications.filter(n => !n.isRead).length})</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* Profile */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  
                  {/* User Identity Banner */}
                  <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-amber-300">{user.name}</h4>
                      <p className="text-slate-300 text-[11px] flex items-center gap-2 mt-0.5">
                        <Mail className="w-3 h-3" /> {user.email || 'Email not linked'}
                        <Phone className="w-3 h-3 ml-2" /> {user.phone || 'Phone not set'}
                      </p>
                      <p className="text-slate-400 text-[10px] font-mono mt-1">
                        ইউজার আইডি (UID): <span className="text-emerald-400">{user.id}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(!isEditingProfile);
                        setEditName(user.name);
                        setEditPhone(user.phone);
                        setEditChildName(user.childName || '');
                        setEditChildAgeGroup(user.childAgeGroup || '1-2y');
                        setEditChildBirthday(user.childBirthday || '');
                        setEditAddress(user.addresses?.[0]?.address || 'ধানমন্ডি, ঢাকা');
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{isEditingProfile ? 'বাতিল' : 'এডিট'}</span>
                    </button>
                  </div>

                  {isEditingProfile ? (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 animate-fade-in">
                      <h5 className="font-bold text-slate-800 text-xs">প্রোফাইল ও বাচ্চার তথ্য পরিবর্তন করুন</h5>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">আপনার নাম</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">মোবাইল নম্বর</label>
                          <input
                            type="text"
                            value={editPhone}
                            onChange={e => setEditPhone(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">বাচ্চার নাম</label>
                          <input
                            type="text"
                            value={editChildName}
                            onChange={e => setEditChildName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">বয়স গ্রুপ</label>
                          <select
                            value={editChildAgeGroup}
                            onChange={e => setEditChildAgeGroup(e.target.value as any)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs"
                          >
                            <option value="0-6m">০-৬ মাস (0-6m)</option>
                            <option value="6-12m">৬-১২ মাস (6-12m)</option>
                            <option value="1-2y">১-২ বছর (1-2y)</option>
                            <option value="2-4y">২-৪ বছর (2-4y)</option>
                            <option value="4-7y">৪-৭ বছর (4-7y)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">ডেলিভারি ঠিকানা</label>
                        <textarea
                          rows={2}
                          value={editAddress}
                          onChange={e => setEditAddress(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>ফায়ারবেসে সংরক্ষণ করুন</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Parent & Child Card */}
                      <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-2xl border border-pink-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-extrabold text-slate-800 text-sm">
                            <Baby className="w-5 h-5 text-pink-600" />
                            <span>সোনামণির তথ্য (Baby Info)</span>
                          </div>
                          <span className="bg-pink-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                            {user.childAgeGroup || '1-2y'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-slate-400 block">বাচ্চার নাম:</span>
                            <span className="font-bold text-slate-800">{user.childName || 'আরিশা রহমান'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">জন্মদিন:</span>
                            <span className="font-bold text-slate-800">{user.childBirthday || '2025-02-14'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Saved Address */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-800 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-pink-600" />
                          <span>সংরক্ষিত ডেলিভারি ঠিকানা</span>
                        </h4>
                        {user.addresses?.map(addr => (
                          <div key={addr.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="font-bold text-slate-800">{addr.label}</p>
                            <p className="text-slate-600">{addr.address}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <button
                    onClick={logoutUser}
                    className="flex items-center gap-2 text-rose-600 font-bold hover:underline pt-4 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>একাউন্ট থেকে লগআউট করুন</span>
                  </button>
                </div>
              )}

              {/* Orders History */}
              {activeTab === 'orders' && (
                <div className="space-y-3">
                  {displayOrders.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <Package className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-slate-500 font-bold">এখনো কোনো অর্ডার করা হয়নি</p>
                    </div>
                  ) : (
                    displayOrders.map(order => {
                      const getStatusBadge = (status: string) => {
                        switch (status) {
                          case 'delivered':
                            return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                          case 'shipped':
                            return 'bg-blue-100 text-blue-800 border-blue-200';
                          case 'processing':
                            return 'bg-purple-100 text-purple-800 border-purple-200';
                          case 'cancelled':
                            return 'bg-rose-100 text-rose-800 border-rose-200';
                          default:
                            return 'bg-amber-100 text-amber-800 border-amber-200';
                        }
                      };

                      return (
                        <div key={order.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5 shadow-xs">
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span className="font-mono text-pink-600">{order.id}</span>
                            <span className="text-slate-900 font-extrabold text-sm">৳{order.total}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">তারিখ: {order.date}</span>
                            <span className={`uppercase font-extrabold px-2.5 py-0.5 rounded-full border text-[10px] ${getStatusBadge(order.status)}`}>
                              {order.status}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 space-y-1">
                            <p className="font-bold text-slate-700">অর্ডারকৃত পণ্যসমূহ:</p>
                            {order.items.map((item, idx) => {
                              const itemPrice = item.product?.discountPrice || item.product?.price || 0;
                              const itemName = item.product?.nameBn || 'পণ্য';
                              return (
                                <div key={idx} className="flex justify-between text-slate-600">
                                  <span>• {itemName} ({item.selectedSize}) x {item.quantity}</span>
                                  <span className="font-bold">৳{itemPrice * item.quantity}</span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                            <span>ট্র্যাকিং নং: <span className="font-mono font-bold text-slate-600">{order.trackingNumber}</span></span>
                            <span>পেমেন্ট: <span className="uppercase font-bold text-slate-700">{order.paymentMethod}</span></span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Wishlist */}
              {activeTab === 'wishlist' && (
                <div>
                  {wishlistedProducts.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">উইশলিস্টে কোনো পণ্য নেই</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {wishlistedProducts.map(p => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 rounded-2xl border transition cursor-pointer ${
                        n.isRead ? 'bg-slate-50 border-slate-100' : 'bg-pink-50 border-pink-200'
                      }`}
                    >
                      <h5 className="font-bold text-slate-800 text-xs">
                        {lang === 'bn' ? n.titleBn : n.titleEn}
                      </h5>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {lang === 'bn' ? n.messageBn : n.messageEn}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

