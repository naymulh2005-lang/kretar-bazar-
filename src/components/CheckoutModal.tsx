import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { TRANSLATIONS } from '../data/translations';
import { MasterLogo } from './MasterLogo';
import { SUPPORTED_COUNTRIES, BANGLADESH_SHIPPING_ZONES } from '../data/shippingConfig';
import { 
  X, 
  MapPin, 
  CreditCard, 
  Truck, 
  Lock, 
  ArrowRight,
  Globe,
  AlertCircle,
  RefreshCw,
  User,
  ShieldCheck
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const { 
    lang, 
    cart, 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cartSubtotal, 
    appliedCoupon, 
    shippingCity,
    setShippingCity,
    user,
    createOrder
  } = useShop();

  // Country Selection
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('BD');
  const [bdZone, setBdZone] = useState<'inside-dhaka' | 'outside-dhaka' | 'express-dhaka'>(shippingCity);

  // Form Fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.addresses?.[0]?.address || '');
  const [district, setDistrict] = useState('');
  const [area, setArea] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'rocket' | 'card'>('cod');
  const [mobileNumber, setMobileNumber] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  const t = TRANSLATIONS[lang];
  const selectedCountry = SUPPORTED_COUNTRIES.find(c => c.code === selectedCountryCode) || SUPPORTED_COUNTRIES[0];
  const isInternational = selectedCountry.isInternational;

  // Compute Shipping Cost
  let calculatedShippingCost = 60;
  if (!isInternational) {
    calculatedShippingCost = bdZone === 'inside-dhaka' ? 60 : bdZone === 'outside-dhaka' ? 120 : 150;
  } else {
    calculatedShippingCost = selectedCountry.shippingFee;
  }

  // Compute Discount
  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount = appliedCoupon.discountType === 'percentage'
      ? Math.round((cartSubtotal * appliedCoupon.discountValue) / 100)
      : appliedCoupon.discountValue;
  }

  // Compute Total
  const computedTotal = Math.max(0, cartSubtotal + calculatedShippingCost - discountAmount);

  // Handle Country Change
  const handleCountryChange = (code: string) => {
    setSelectedCountryCode(code);
    setOrderError(null);
    const countryObj = SUPPORTED_COUNTRIES.find(c => c.code === code);
    if (countryObj && countryObj.isInternational && paymentMethod === 'cod') {
      setPaymentMethod('bkash');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return; // Prevent duplicate rapid clicks
    setOrderError(null);

    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      setOrderError(lang === 'bn' ? 'দয়া করে আপনার সম্পূর্ণ নাম প্রদান করুন।' : 'Please enter your full name.');
      return;
    }

    const cleanPhone = phone.trim().replace(/[\s\-\(\)]/g, '');
    if (!cleanPhone) {
      setOrderError(lang === 'bn' ? 'দয়া করে আপনার মোবাইল নম্বর প্রদান করুন।' : 'Please enter your mobile phone number.');
      return;
    }

    // Validate Bangladeshi phone number format (11 digits starting with 013-019, or +8801...)
    if (selectedCountryCode === 'BD') {
      const bdRegex = /^(?:\+?88)?01[3-9]\d{8}$/;
      if (!bdRegex.test(cleanPhone)) {
        setOrderError(
          lang === 'bn'
            ? 'দয়া করে একটি সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678 বা 018...)।'
            : 'Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678).'
        );
        return;
      }
    } else if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      setOrderError(lang === 'bn' ? 'দয়া করে একটি সঠিক ফোন নম্বর প্রদান করুন।' : 'Please enter a valid phone number.');
      return;
    }

    const cleanAddress = address.trim();
    if (!cleanAddress || cleanAddress.length < 5) {
      setOrderError(lang === 'bn' ? 'দয়া করে বিস্তারিত ডেলিভারি ঠিকানা (বাসা/রোড/এলাকা) প্রদান করুন।' : 'Please enter your detailed delivery address.');
      return;
    }

    if (!isInternational && !district.trim()) {
      setOrderError(lang === 'bn' ? 'ডেলিভারির জন্য আপনার জেলা / থানার নাম উল্লেখ করুন।' : 'Please enter your District / Thana.');
      return;
    }

    // Standard normalized phone number representation
    let formattedPhone = cleanPhone;
    if (selectedCountryCode === 'BD') {
      // Standardize as clean 11-digit 01XXXXXXXXX or international format
      formattedPhone = cleanPhone.startsWith('+88') 
        ? cleanPhone.replace('+88', '') 
        : cleanPhone.startsWith('88') 
          ? cleanPhone.replace(/^88/, '') 
          : cleanPhone;
    } else {
      formattedPhone = cleanPhone.startsWith('+') 
        ? cleanPhone 
        : `${selectedCountry.dialCode} ${cleanPhone.replace(/^0+/, '')}`;
    }

    setIsProcessing(true);

    try {
      await createOrder({
        customerName: cleanName,
        customerPhone: formattedPhone,
        customerEmail: email.trim() || undefined,
        shippingAddress: cleanAddress,
        city: isInternational ? selectedCountry.nameEn : bdZone,
        country: selectedCountry.code,
        countryName: selectedCountry.nameEn,
        postalCode: postalCode.trim() || undefined,
        customerNote: customerNote.trim() || undefined,
        district: district.trim() || undefined,
        area: area.trim() || undefined,
        items: cart,
        subtotal: cartSubtotal,
        shippingCost: calculatedShippingCost,
        discountAmount,
        total: computedTotal,
        paymentMethod: (isInternational && paymentMethod === 'cod') ? 'card' : paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'paid',
        transactionId: paymentMethod !== 'cod' ? 'TRX-' + Math.floor(1000000 + Math.random() * 9000000) : undefined
      });

      setIsCheckoutOpen(false);
    } catch (err: unknown) {
      console.error('Order creation error:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setOrderError(errMsg || (lang === 'bn' ? 'অর্ডার জমা দিতে সমস্যা হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।' : 'Failed to save order in cloud. Please retry.'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto overflow-hidden shadow-2xl relative border border-slate-100 max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 text-amber-200 border-b border-amber-500/30 flex items-center justify-between">
          <MasterLogo size="md" variant="full" />

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Error Message Box if submission fails */}
          {orderError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-extrabold text-xs">{lang === 'bn' ? 'অর্ডার প্রসেসিং ব্যর্থ হয়েছে' : 'Order Processing Notice'}</p>
                <p className="text-[11px] text-rose-700 mt-0.5">{orderError}</p>
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={isProcessing}
                  className="mt-2 inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>{lang === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry Now'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Section 1: Delivery Country & Destination */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 text-pink-600">
              <Globe className="w-4 h-4" />
              <span>{lang === 'bn' ? '১. ডেলিভারি দেশ ও গন্তব্য' : '1. Delivery Country & Location'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'bn' ? 'ডেলিভারি দেশ *' : 'Delivery Country *'}
                </label>
                <div className="relative">
                  <select
                    value={selectedCountryCode}
                    onChange={e => handleCountryChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-pink-500 cursor-pointer"
                  >
                    {SUPPORTED_COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {lang === 'bn' ? c.nameBn : c.nameEn} ({c.dialCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!isInternational ? (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'bn' ? 'শিপিং জোন *' : 'Shipping Zone *'}
                  </label>
                  <select
                    value={bdZone}
                    onChange={e => {
                      const zone = e.target.value as 'inside-dhaka' | 'outside-dhaka' | 'express-dhaka';
                      setBdZone(zone);
                      setShippingCity(zone);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-pink-500 cursor-pointer"
                  >
                    {BANGLADESH_SHIPPING_ZONES.map(z => (
                      <option key={z.id} value={z.id}>
                        {lang === 'bn' ? z.nameBn : z.nameEn} (৳{z.fee} - {lang === 'bn' ? z.timeBn : z.timeEn})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'bn' ? 'আন্তর্জাতিক কুরিয়ার ডেলিভারি' : 'International Express Courier'}
                  </label>
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2 text-xs text-amber-900 flex items-center justify-between">
                    <div>
                      <p className="font-extrabold">{lang === 'bn' ? selectedCountry.nameBn : selectedCountry.nameEn}</p>
                      <p className="text-[10px] text-amber-800">{lang === 'bn' ? selectedCountry.deliveryTimeBn : selectedCountry.deliveryTimeEn}</p>
                    </div>
                    <span className="font-black text-amber-950 bg-amber-200/80 px-2 py-1 rounded-lg">৳{selectedCountry.shippingFee}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Customer Information */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 text-pink-600">
              <User className="w-4 h-4" />
              <span>{lang === 'bn' ? '২. কাস্টমার তথ্য ও ঠিকানা' : '2. Customer Info & Address'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'bn' ? 'আপনার নাম *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'bn' ? 'মো. তানভীর রহমান' : 'John Doe'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'bn' ? 'ফোন নম্বর *' : 'Phone Number *'}
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-2.5 text-xs font-bold text-slate-700 shrink-0">
                    {selectedCountry.flag} {selectedCountry.dialCode}
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder={selectedCountry.phonePlaceholder}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'bn' ? 'ইমেইল (অপশনাল)' : 'Email Address (Optional)'}
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'bn' ? 'পোস্টাল / জিপ কোড (যদি থাকে)' : 'Postal / ZIP Code'}
                </label>
                <input
                  type="text"
                  placeholder={isInternational ? '10001 / EC1A 1BB' : '1205'}
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'bn' ? 'জেলা / থানা *' : 'District / Thana *'}
                </label>
                <input
                  type="text"
                  required={!isInternational}
                  placeholder={lang === 'bn' ? 'যেমন: ঢাকা, ধানমন্ডি / চট্টগ্রাম' : 'e.g. Dhaka, Dhanmondi'}
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'bn' ? 'এলাকা / ল্যান্ডমার্ক (ঐচ্ছিক)' : 'Area / Landmark (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'যেমন: শুক্রাবাদ মোড়ের কাছে' : 'e.g. Near City Park'}
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {lang === 'bn' ? 'সম্পূর্ণ ডেলিভারি ঠিকানা *' : 'Full Delivery Address *'}
              </label>
              <textarea
                required
                rows={2}
                placeholder={isInternational ? 'Street address, Apartment/Suite, City, State/Province, Country' : 'বাসা নং, রোড নং, এলাকা/থানা, জেলা'}
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {lang === 'bn' ? 'বিশেষ ডেলিভারি নির্দেশনা / নোট (ঐচ্ছিক)' : 'Special Delivery Instructions / Notes (Optional)'}
              </label>
              <input
                type="text"
                placeholder={lang === 'bn' ? 'যেমন: ডেলিভারির আগে কল দিন, বিকেলে ডেলিভারি দিন' : 'e.g. Call before delivery, deliver in afternoon'}
                value={customerNote}
                onChange={e => setCustomerNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Section 3: Payment Gateway Selection */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 text-pink-600">
              <CreditCard className="w-4 h-4" />
              <span>{lang === 'bn' ? '৩. পেমেন্ট মেথড পছন্দ করুন' : '3. Choose Payment Method'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Cash on Delivery */}
              <label 
                onClick={() => {
                  if (!isInternational) setPaymentMethod('cod');
                }}
                className={`p-3 rounded-2xl border transition ${
                  isInternational 
                    ? 'border-slate-200 bg-slate-100/60 opacity-50 cursor-not-allowed'
                    : paymentMethod === 'cod' 
                      ? 'border-pink-500 bg-pink-50/60 ring-2 ring-pink-200 cursor-pointer' 
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-800">ক্যাশ অন ডেলিভারি (COD)</p>
                    <p className="text-[10px] text-slate-500">
                      {isInternational 
                        ? (lang === 'bn' ? 'শুধুমাত্র বাংলাদেশে প্রযোজ্য' : 'Available in Bangladesh only') 
                        : 'পণ্য বুঝে পেয়ে মূল্য পরিশোধ করুন'}
                    </p>
                  </div>
                </div>
              </label>

              {/* bKash */}
              <label 
                onClick={() => setPaymentMethod('bkash')}
                className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition ${
                  paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50/60 ring-2 ring-pink-200' : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-pink-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  bKash
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-800">বিকাশ (bKash Wallet)</p>
                  <p className="text-[10px] text-slate-500">ইনস্ট্যান্ট বিকাশ পেমেন্ট গেটওয়ে</p>
                </div>
              </label>

              {/* Nagad */}
              <label 
                onClick={() => setPaymentMethod('nagad')}
                className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition ${
                  paymentMethod === 'nagad' ? 'border-pink-500 bg-pink-50/60 ring-2 ring-pink-200' : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  নগদ
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-800">নগদ (Nagad Wallet)</p>
                  <p className="text-[10px] text-slate-500">দ্রুত ও নিরাপদ ক্যাশলেস পেমেন্ট</p>
                </div>
              </label>

              {/* Card */}
              <label 
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition ${
                  paymentMethod === 'card' ? 'border-pink-500 bg-pink-50/60 ring-2 ring-pink-200' : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  VISA
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-800">ডেবিট / ক্রেডিট কার্ড</p>
                  <p className="text-[10px] text-slate-500">Visa, Mastercard, Amex, Global Cards</p>
                </div>
              </label>

            </div>

            {/* Payment Fields Simulation */}
            {paymentMethod !== 'cod' && (
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-3 mt-3 animate-slide-up">
                <div className="flex items-center gap-2 text-pink-400 font-bold text-xs">
                  <Lock className="w-4 h-4" />
                  <span>{paymentMethod.toUpperCase()} পেমেন্ট পোর্টাল সিমুলেশন</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      {paymentMethod === 'card' ? 'কার্ড নম্বর' : 'একাউন্ট মোবাইল নম্বর'}
                    </label>
                    <input
                      type="text"
                      placeholder={paymentMethod === 'card' ? '•••• •••• •••• 4242' : '01711XXXXXX'}
                      value={mobileNumber}
                      onChange={e => setMobileNumber(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      {paymentMethod === 'card' ? 'CVV / OTP' : 'পিন / OTP কোড'}
                    </label>
                    <input
                      type="password"
                      placeholder="••••"
                      maxLength={4}
                      value={pinCode}
                      onChange={e => setPinCode(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Summary */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex justify-between font-medium text-slate-600">
              <span>পণ্য সংখ্যা ({cart.reduce((s, i) => s + i.quantity, 0)}টি):</span>
              <span className="font-bold text-slate-800">৳{cartSubtotal}</span>
            </div>
            
            <div className="flex justify-between font-medium text-slate-600">
              <span>
                {lang === 'bn' ? 'ডেলিভারি চার্জ' : 'Shipping Fee'} 
                {isInternational ? ` (${selectedCountry.nameEn})` : ` (${bdZone === 'inside-dhaka' ? 'ঢাকা ভিতরে' : bdZone === 'outside-dhaka' ? 'ঢাকা বাইরে' : 'এক্সপ্রেস'})`}:
              </span>
              <span className="font-bold text-slate-800">৳{calculatedShippingCost}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between font-medium text-emerald-600">
                <span>{lang === 'bn' ? 'কুপন ছাড়:' : 'Discount:'}</span>
                <span className="font-bold">-৳{discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between font-black text-slate-900 text-sm pt-2 border-t border-slate-200">
              <span>সর্বমোট পরিশোধযোগ্য:</span>
              <span className="text-pink-600 text-base">৳{computedTotal}</span>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-slate-400 text-white font-black py-3.5 rounded-2xl text-sm shadow-xl shadow-pink-200 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>ক্লাউডে অর্ডার যাচাই ও সংরক্ষণ হচ্ছে...</span>
              </span>
            ) : (
              <>
                <span>{t.placeOrder} (৳{computedTotal})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
