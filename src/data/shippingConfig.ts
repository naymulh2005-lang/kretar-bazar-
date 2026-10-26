export interface ShippingCountry {
  code: string;
  nameBn: string;
  nameEn: string;
  flag: string;
  dialCode: string;
  phonePlaceholder: string;
  phoneMinLength: number;
  isInternational: boolean;
  shippingFee: number;
  deliveryTimeBn: string;
  deliveryTimeEn: string;
}

export const SUPPORTED_COUNTRIES: ShippingCountry[] = [
  {
    code: 'BD',
    nameBn: 'বাংলাদেশ (Bangladesh)',
    nameEn: 'Bangladesh',
    flag: '🇧🇩',
    dialCode: '+880',
    phonePlaceholder: '01711000000',
    phoneMinLength: 10,
    isInternational: false,
    shippingFee: 60, // Default inside dhaka
    deliveryTimeBn: '২-৩ কার্যদিবস',
    deliveryTimeEn: '2-3 Business Days'
  },
  {
    code: 'IN',
    nameBn: 'ভারত (India)',
    nameEn: 'India',
    flag: '🇮🇳',
    dialCode: '+91',
    phonePlaceholder: '9876543210',
    phoneMinLength: 10,
    isInternational: true,
    shippingFee: 950,
    deliveryTimeBn: '৫-৭ কার্যদিবস',
    deliveryTimeEn: '5-7 Business Days'
  },
  {
    code: 'AE',
    nameBn: 'সংযুক্ত আরব আমিরাত (UAE)',
    nameEn: 'United Arab Emirates',
    flag: '🇦🇪',
    dialCode: '+971',
    phonePlaceholder: '501234567',
    phoneMinLength: 9,
    isInternational: true,
    shippingFee: 2200,
    deliveryTimeBn: '৫-৮ কার্যদিবস',
    deliveryTimeEn: '5-8 Business Days'
  },
  {
    code: 'SA',
    nameBn: 'সৌদি আরব (Saudi Arabia)',
    nameEn: 'Saudi Arabia',
    flag: '🇸🇦',
    dialCode: '+966',
    phonePlaceholder: '501234567',
    phoneMinLength: 9,
    isInternational: true,
    shippingFee: 2400,
    deliveryTimeBn: '৬-৯ কার্যদিবস',
    deliveryTimeEn: '6-9 Business Days'
  },
  {
    code: 'GB',
    nameBn: 'যুক্তরাজ্য (United Kingdom)',
    nameEn: 'United Kingdom',
    flag: '🇬🇧',
    dialCode: '+44',
    phonePlaceholder: '7123456789',
    phoneMinLength: 10,
    isInternational: true,
    shippingFee: 2600,
    deliveryTimeBn: '৭-১০ কার্যদিবস',
    deliveryTimeEn: '7-10 Business Days'
  },
  {
    code: 'US',
    nameBn: 'যুক্তরাষ্ট্র (USA)',
    nameEn: 'United States',
    flag: '🇺🇸',
    dialCode: '+1',
    phonePlaceholder: '2025550123',
    phoneMinLength: 10,
    isInternational: true,
    shippingFee: 2800,
    deliveryTimeBn: '৭-১২ কার্যদিবস',
    deliveryTimeEn: '7-12 Business Days'
  },
  {
    code: 'CA',
    nameBn: 'কানাডা (Canada)',
    nameEn: 'Canada',
    flag: '🇨🇦',
    dialCode: '+1',
    phonePlaceholder: '4165550123',
    phoneMinLength: 10,
    isInternational: true,
    shippingFee: 2900,
    deliveryTimeBn: '৮-১২ কার্যদিবস',
    deliveryTimeEn: '8-12 Business Days'
  },
  {
    code: 'MY',
    nameBn: 'মালয়েশিয়া (Malaysia)',
    nameEn: 'Malaysia',
    flag: '🇲🇾',
    dialCode: '+60',
    phonePlaceholder: '123456789',
    phoneMinLength: 9,
    isInternational: true,
    shippingFee: 1800,
    deliveryTimeBn: '৫-৮ কার্যদিবস',
    deliveryTimeEn: '5-8 Business Days'
  },
  {
    code: 'AU',
    nameBn: 'অস্ট্রেলিয়া (Australia)',
    nameEn: 'Australia',
    flag: '🇦🇺',
    dialCode: '+61',
    phonePlaceholder: '412345678',
    phoneMinLength: 9,
    isInternational: true,
    shippingFee: 3000,
    deliveryTimeBn: '৮-১৩ কার্যদিবস',
    deliveryTimeEn: '8-13 Business Days'
  }
];

export const BANGLADESH_SHIPPING_ZONES = [
  { id: 'inside-dhaka', nameBn: 'ঢাকা সিটির ভিতরে', nameEn: 'Inside Dhaka', fee: 60, timeBn: '২৪-৪৮ ঘণ্টা', timeEn: '24-48 Hours' },
  { id: 'outside-dhaka', nameBn: 'ঢাকা সিটির বাইরে (সারা দেশ)', nameEn: 'Outside Dhaka (All BD)', fee: 120, timeBn: '২-৩ দিন', timeEn: '2-3 Days' },
  { id: 'express-dhaka', nameBn: 'ঢাকা এক্সপ্রেস (একই দিনে ডেলিভারি)', nameEn: 'Dhaka Express (Same Day)', fee: 150, timeBn: '১২-২৪ ঘণ্টা', timeEn: '12-24 Hours' }
] as const;
