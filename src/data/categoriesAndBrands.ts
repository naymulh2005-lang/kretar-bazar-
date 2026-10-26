import { Category, Brand, Coupon } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'baby-clothes',
    nameBn: 'পোশাক ও পোশাক সেট',
    nameEn: 'Baby & Kids Clothing',
    icon: 'Shirt',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
    itemCount: 42
  },
  {
    id: 'shoes',
    nameBn: 'জুতো ও স্যান্ডেল',
    nameEn: 'Shoes & Footwear',
    icon: 'Footprints',
    image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80',
    itemCount: 28
  },
  {
    id: 'toys',
    nameBn: 'খেলনা ও গেমস',
    nameEn: 'Toys & Gaming',
    icon: 'Gamepad2',
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=80',
    itemCount: 56
  },
  {
    id: 'feeding',
    nameBn: 'ফিডিং ও খাবার সেট',
    nameEn: 'Feeding & Mealtime',
    icon: 'Milk',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
    itemCount: 34
  },
  {
    id: 'baby-care',
    nameBn: 'বাচ্চাদের যত্ন ও স্কিন কেয়ার',
    nameEn: 'Baby Care & Skincare',
    icon: 'HeartHandshake',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=600&q=80',
    itemCount: 29
  },
  {
    id: 'learning',
    nameBn: 'লার্নিং বই ও পাজল',
    nameEn: 'Learning Items & Books',
    icon: 'BookOpen',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
    itemCount: 22
  },
  {
    id: 'accessories',
    nameBn: 'এক্সেসরিজ ও ক্যাঙ্গারু ব্যাগ',
    nameEn: 'Accessories & Nursery',
    icon: 'ShoppingBag',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80',
    itemCount: 31
  },
  {
    id: 'seasonal',
    nameBn: 'শীতকালীন ও সিজনাল পোশাক',
    nameEn: 'Seasonal & Winter Collection',
    icon: 'Snowflake',
    image: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=600&q=80',
    itemCount: 19
  }
];

export const BRANDS: Brand[] = [
  { id: 'kreta-special', name: 'Kretar Bazar Special' },
  { id: 'babyhug', name: 'Babyhug' },
  { id: 'mothercare', name: 'Mothercare' },
  { id: 'carters', name: "Carter's" },
  { id: 'chicco', name: 'Chicco' },
  { id: 'fisher-price', name: 'Fisher-Price' },
  { id: 'pampers', name: 'Pampers' },
  { id: 'little-stars', name: 'Little Stars' }
];

export const VALID_COUPONS: Coupon[] = [
  {
    code: 'KRETA10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 500,
    descriptionBn: '১০% ছাড় পেতে কুপন কোড ব্যবহার করুন',
    descriptionEn: 'Get 10% discount on all orders above ৳500'
  },
  {
    code: 'KIDS200',
    discountType: 'flat',
    discountValue: 200,
    minOrderValue: 1500,
    descriptionBn: '১৫০০ টাকার কেনাকাটায় ২০০ টাকা ফ্লাট ছাড়',
    descriptionEn: 'Flat ৳200 discount on orders above ৳1,500'
  },
  {
    code: 'FREESHIP',
    discountType: 'flat',
    discountValue: 60,
    minOrderValue: 1000,
    descriptionBn: '১০০০+ কেনাকাটায় ঢাকা সিটিতে ফ্রি ডেলিভারি',
    descriptionEn: 'Free delivery in Dhaka city on ৳1000+ orders'
  }
];
