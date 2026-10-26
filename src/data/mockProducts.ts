import { Product } from '../types';

import babyNestCoralImg from '../assets/images/baby_nest_coral_1787244504220.jpg';
import babyNestPinkPrnImg from '../assets/images/baby_nest_pink_prn_1787244514644.jpg';
import babyNestOrgPrnImg from '../assets/images/baby_nest_org_prn_1787244526429.jpg';
import babyNestFloralImg from '../assets/images/baby_nest_floral_1787244537546.jpg';

import babyBagPinkImg from '../assets/images/baby_bag_pink_1787244555675.jpg';
import babyBagCoralImg from '../assets/images/baby_bag_coral_1787244569926.jpg';
import babyBagMintImg from '../assets/images/baby_bag_mint_1787244581899.jpg';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p-baby-nest-mosquito-bed',
    sku: 'KB-BED-701',
    nameBn: 'বেবি নেস্ট বেড ও পোর্টেবল মসকিটো নেট সেট (৪ কালার ভ্যারিয়েন্ট)',
    nameEn: 'Baby Nest Lounger Bed with Arched Mosquito Net & Bolsters',
    categoryId: 'baby-care',
    brand: 'Mothercare',
    price: 1850,
    discountPrice: 1450,
    stock: 35,
    isPublished: true,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isFlashSale: true,
    ageGroup: '6-12m',
    ageTextBn: '০ মাস - ১২ মাস',
    ageTextEn: '0 - 12 Months',
    sizes: ['Standard (0-12M)'],
    colors: [
      { nameBn: 'পিচ কোরাল', nameEn: 'Coral Peach', hex: '#FF7F50' },
      { nameBn: 'সফট পিঙ্ক প্রিন্ট', nameEn: 'Soft Pink Print', hex: '#F48FB1' },
      { nameBn: 'কোরাল অরেঞ্জ প্রিন্ট', nameEn: 'Coral Orange Print', hex: '#FF8A65' },
      { nameBn: 'বেবি পিঙ্ক ফ্লোরাল', nameEn: 'Baby Pink Floral', hex: '#F8BBD0' }
    ],
    descriptionBn: 'নবজাতক ও ছোট্ট শিশুর আরামদায়ক নিরাপদ ঘুমের জন্য সম্পূর্ণ প্রিমিয়াম সেট। সাথে রয়েছে ফোল্ডেবল মস্কিটো নেট (মশারি), ২টি নরম সাইড সাপোর্ট বোলস্টার (পাশ বালিশ) এবং শিশুর মাথার সঠিক শেপ বজায় রাখার জন্য কিউট পিলো। আল্ট্রা-সফট ভেলভেট কটন ফ্যাব্রিকে তৈরি, সহজে বহনযোগ্য ও ওয়াশেবল। মশার কামড় ও ধুলাবালি থেকে সুরক্ষিত রাখে।',
    descriptionEn: 'Premium ergonomic baby nest lounger bed equipped with a protective arched mosquito net, two cozy bolster pillows, and a head shaping cushion. Made of ultra-soft breathable organic cotton fabric, lightweight, portable, and washable.',
    specifications: [
      { keyBn: 'প্যাকেজে অন্তর্ভুক্ত', keyEn: 'Package Includes', valueBn: '১টি নেস্ট বেড, ১টি মসকিটো নেট, ২টি পাশ বালিশ, ১টি মাথার বালিশ', valueEn: '1 Nest Bed, 1 Mosquito Net, 2 Bolster Pillows, 1 Head Pillow' },
      { keyBn: 'উপাদান', keyEn: 'Material', valueBn: '১০০% বিশুদ্ধ অর্গানিক কম্বড কটন ও হাইজেনিক সফট ফাইবার', valueEn: '100% Organic Combed Cotton & Hygienic Fiber Filling' },
      { keyBn: 'বয়স উপযোগীতা', keyEn: 'Age Range', valueBn: '০ থেকে ১২ মাস পর্যন্ত', valueEn: '0 to 12 Months' },
      { keyBn: 'সুরক্ষা বৈশিষ্ট্য', keyEn: 'Safety Features', valueBn: 'অ্যান্টি-মস্কিটো প্রটেকশন ও রোল-ওভার গার্ড', valueEn: 'Anti-Mosquito Net & Roll-Over Guard' },
      { keyBn: 'ওয়াশ কেয়ার', keyEn: 'Wash Care', valueBn: 'হ্যান্ড ওয়াশ অথবা মেশিনে মাইল্ড ওয়াশ উপযোগী', valueEn: 'Hand or Machine Wash Safe' }
    ],
    images: [
      babyNestCoralImg,
      babyNestPinkPrnImg,
      babyNestOrgPrnImg,
      babyNestFloralImg
    ],
    videoUrl: 'https://www.youtube.com/watch?v=EngW7tLk6R8',
    rating: 4.95,
    reviewCount: 42,
    salesCount: 168,
    reviews: [
      {
        id: 'r_bed_1',
        userName: 'ফারহানা ইয়াসমিন',
        rating: 5,
        date: '2026-08-15',
        comment: 'পণ্যটি অসম্ভব সুন্দর ও নরম! মশারি থাকার কারণে রাতে কোনো চিন্তা করতে হয় না। কালারটি ছবির থেকেও বাস্তবে সুন্দর।',
        verifiedPurchase: true
      },
      {
        id: 'r_bed_2',
        userName: 'আরিফুল ইসলাম',
        rating: 5,
        date: '2026-08-10',
        comment: 'অসাধারণ কোয়ালিটি। ঢাকার বাইরে ৩ দিনে পেয়েছি। ডেলিভারি ও প্যাকেজিং খুব ভালো ছিল।',
        verifiedPurchase: true
      }
    ],
    faqs: [
      {
        questionBn: 'মশারি কি আলাদা করে খুলে ফেলা যায়?',
        questionEn: 'Can the mosquito net be detached?',
        answerBn: 'হ্যাঁ, জিপার বা ফ্লেক্সিবল ফ্রেম থাকায় মশারি খুব সহজে ওঠানো-নামানো ও প্রয়োজনমতো সেট করা যায়।',
        answerEn: 'Yes, the foldable net arch can be easily opened or folded.'
      },
      {
        questionBn: 'এটি কি ট্রাভেলের সময় সাথে নেওয়া যাবে?',
        questionEn: 'Is it easy to carry while travelling?',
        answerBn: 'একদমই, এটি ওজনে খুবই হালকা এবং যেকোনো ব্যাগে সহজে ফোল্ড করে নেওয়া যায়।',
        answerEn: 'Yes, it is extremely lightweight and portable for trips.'
      }
    ]
  },
  {
    id: 'p-baby-hooded-carry-nest-bag',
    sku: 'KB-BAG-802',
    nameBn: 'বেবি হুডেড স্লিপিং ব্যাগ ও ক্যারি নেস্ট পড (৩ কালার ভ্যারিয়েন্ট)',
    nameEn: 'Baby Hooded Sleeping Bag & Newborn Carry Nest Wrap',
    categoryId: 'baby-care',
    brand: 'Chicco',
    price: 1450,
    discountPrice: 1150,
    stock: 28,
    isPublished: true,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isFlashSale: true,
    ageGroup: '6-12m',
    ageTextBn: '০ মাস - ৯ মাস',
    ageTextEn: '0 - 9 Months',
    sizes: ['Standard (0-9M)'],
    colors: [
      { nameBn: 'বেবি পিঙ্ক', nameEn: 'Baby Pink', hex: '#F48FB1' },
      { nameBn: 'কোরাল পিঙ্ক', nameEn: 'Coral Pink', hex: '#FF7043' },
      { nameBn: 'মিন্ট গ্রিন ক্লাউড', nameEn: 'Mint Green Cloud', hex: '#80CBC4' }
    ],
    descriptionBn: 'শীতাতপ নিয়ন্ত্রিত (AC) রুম, আউটডোর ভ্রমণ বা শীতের মৌসুমে শিশুকে সুরক্ষিত, উষ্ণ ও আরামদায়ক রাখতে সেরা বেবি স্লিপিং ব্যাগ। এতে রয়েছে জিপার সিস্টেম যার ফলে শিশুকে খুব সহজে ভেতরে রাখা বা বের করা যায়। নরম হুড শিশুর মাথা ও কানকে বাতাস থেকে রক্ষা করে এবং কোলে বা গাড়িতে বহনের জন্য আদর্শ।',
    descriptionEn: 'Cozy, ultra-warm newborn carry nest sleeping pod featuring an ergonomic hood and full dual-zipper closure for effortless swaddling and on-the-go travel.',
    specifications: [
      { keyBn: 'ডিজাইন টাইপ', keyEn: 'Design', valueBn: 'হুডেড জিপার ক্যারি স্লিপিং ব্যাগ', valueEn: 'Hooded Zipper Carry Sleeping Bag' },
      { keyBn: 'উপাদান', keyEn: 'Material', valueBn: 'সফট ফ্লিস ও শ্বাসপ্রশ্বাসযোগ্য কটন লাইনিং', valueEn: 'Soft Fleece & Breathable Cotton Lining' },
      { keyBn: 'সাইজ ও মাপ', keyEn: 'Size', valueBn: '৭০ সেমি x ৪০ সেমি (০-৯ মাস)', valueEn: '70cm x 40cm (0-9 Months)' },
      { keyBn: 'ব্যবহারের সুবিধা', keyEn: 'Usage', valueBn: 'কোলে বহন, ট্রাভেল ও ঘরের ভেতর গভীর ঘুমের জন্য', valueEn: 'Carrying, Travel & Sound Nursery Sleep' }
    ],
    images: [
      babyBagPinkImg,
      babyBagCoralImg,
      babyBagMintImg
    ],
    videoUrl: 'https://www.youtube.com/watch?v=kYI6kL8t2p4',
    rating: 4.9,
    reviewCount: 31,
    salesCount: 124,
    reviews: [
      {
        id: 'r_bag_1',
        userName: 'নুসরাত জাহান',
        rating: 5,
        date: '2026-08-16',
        comment: 'ডাক্তারের কাছে যাওয়ার সময় বা গাড়িতে বাবুকে নিয়ে বের হওয়ার জন্য এটা বেস্ট! জিপার থাকার কারণে কাজ খুব সহজ হয়ে গেছে।',
        verifiedPurchase: true
      }
    ],
    faqs: [
      {
        questionBn: 'বাবু কি ভেতরে সহজে শ্বাস নিতে পারবে?',
        questionEn: 'Is the fabric breathable for infants?',
        answerBn: 'হ্যাঁ, ভেতরের অংশটি ১০০% প্রিমিয়াম সুতি ও বাতাস চলাচল উপযোগী ফাইবার দিয়ে তৈরি।',
        answerEn: 'Yes, the inner lining uses 100% breathable organic cotton.'
      }
    ]
  },
  {
    id: 'p1',
    sku: 'KB-CLT-101',
    nameBn: '১০০% সফট কটন বেবি রোম্পার সেট (২ প্যাক)',
    nameEn: '100% Organic Soft Cotton Baby Romper Set (2 Pack)',
    categoryId: 'baby-clothes',
    brand: "Carter's",
    price: 950,
    discountPrice: 750,
    stock: 24,
    isPublished: true,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isFlashSale: true,
    ageGroup: '6-12m',
    ageTextBn: '৬ মাস - ১২ মাস',
    ageTextEn: '6 Months - 12 Months',
    sizes: ['6m', '9m', '12m'],
    colors: [
      { nameBn: 'আকাশি নীল', nameEn: 'Sky Blue', hex: '#87CEEB' },
      { nameBn: 'সফট পিঙ্ক', nameEn: 'Soft Pink', hex: '#FFB6C1' },
      { nameBn: 'পেস্ট হোয়াইট', nameEn: 'Pastel White', hex: '#F5F5F5' }
    ],
    descriptionBn: 'শিশুর সংবেদনশীল ত্বকের জন্য অত্যন্ত আরামদায়ক ও শ্বাসপ্রশ্বাসযোগ্য ১০০% বিশুদ্ধ অর্গানিক সুতির রোম্পার। ডায়াপার পরিবর্তন করা সহজ কারণ নিচে নিখুঁত স্ন্যাপ বাটন রয়েছে। ক্ষতিকারক কেমিক্যাল বা ডাই মুক্ত।',
    descriptionEn: 'Ultra-soft, breathable 100% organic cotton rompers specially designed for sensitive baby skin. Features convenient bottom snaps for quick diaper changes. Free from harmful dyes.',
    specifications: [
      { keyBn: 'উপাদান', keyEn: 'Material', valueBn: '১০০% পপি কম্বড কটন', valueEn: '100% Combed Cotton' },
      { keyBn: 'ধোয়ার নিয়ম', keyEn: 'Washing', valueBn: 'হালকা গরম জলে ওয়াশ যোগ্য', valueEn: 'Machine Wash Warm' },
      { keyBn: 'অরিজিন', keyEn: 'Origin', valueBn: 'ভিয়েতনামে প্রস্তুত', valueEn: 'Made in Vietnam' },
      { keyBn: 'প্যাকেজিং', keyEn: 'Package', valueBn: '২ পিস রোম্পার বান্ডেল', valueEn: '2 Pieces Set' }
    ],
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    rating: 4.9,
    reviewCount: 38,
    salesCount: 142,
    reviews: [
      {
        id: 'r1',
        userName: 'রাহেলা সুলতানা',
        rating: 5,
        date: '2026-08-02',
        comment: 'কাপড়টা সত্যি অনেক সফট। আমার ৮ মাসের মেয়ের গায়ে খুব সুন্দর মানিয়েছে। ডেলিভারিও দ্রুত পেয়েছি।',
        verifiedPurchase: true
      },
      {
        id: 'r2',
        userName: 'তানভীর আহমেদ',
        rating: 5,
        date: '2026-07-28',
        comment: 'Very nice quality product! Colour was exactly as shown in picture.',
        verifiedPurchase: true
      }
    ],
    faqs: [
      {
        questionBn: 'কাপড়টি কি গরমের দিনে পরানোর উপযোগী?',
        questionEn: 'Is this fabric suitable for hot summer days?',
        answerBn: 'হ্যাঁ, এটি ১০০% সুতি ও নিশ্বাসযোগ্য হওয়ায় গরমকালে বাচ্চা প্রচণ্ড স্বস্তি পাবে।',
        answerEn: 'Yes, 100% breathable cotton keeps baby cool and sweat-free.'
      },
      {
        questionBn: 'ধোয়ার পর কি রঙ উঠে যাবে বা সাইজ ছোট হবে?',
        questionEn: 'Will color fade or shrink after washing?',
        answerBn: 'না, এটি প্রি-শ্রাঙ্ক প্রিমিয়াম ফেব্রিক, রঙ বা সাইজে কোনো পরিবর্তন হয় না।',
        answerEn: 'No, it is made of pre-shrunk premium colorfast fabric.'
      }
    ]
  },
  {
    id: 'p2',
    sku: 'KB-TOY-205',
    nameBn: 'মন্টেসরি কাঠের শেপ ও কালার লার্নিং বোর্ড',
    nameEn: 'Montessori Wooden Shape & Color Sorting Educational Toy',
    categoryId: 'toys',
    brand: 'Fisher-Price',
    price: 1200,
    discountPrice: 890,
    stock: 18,
    isPublished: true,
    isFeatured: true,
    isNewArrival: true,
    isFlashSale: true,
    ageGroup: '1-2y',
    ageTextBn: '১ বছর - ২ বছর',
    ageTextEn: '1 Year - 2 Years',
    sizes: ['Standard'],
    colors: [
      { nameBn: 'মাল্টিকালার', nameEn: 'Multicolor', hex: '#FF5722' }
    ],
    descriptionBn: 'বাচ্চাদের হাতের সূক্ষ্ম মোটর স্কিল, চোখের সামঞ্জস্য ও রঙের পরিচিতি বাড়াতে চমৎকার মন্টেসরি লার্নিং বোর্ড। বিষাক্ততাহীন অর্গানিক কাঠের তৈরি এবং গোলাকার সেফ কোণা যুক্ত।',
    descriptionEn: 'Premium non-toxic wooden sorting board designed to boost fine motor skills, hand-eye coordination, and color recognition. Smooth round safety edges.',
    specifications: [
      { keyBn: 'উপাদান', keyEn: 'Material', valueBn: '১০০% ন্যাচারাল পাইন কাঠ', valueEn: 'Natural Pine Wood' },
      { keyBn: 'পেইন্ট টাইপ', keyEn: 'Paint Type', valueBn: 'ইকো-ফ্রেন্ডলি ওয়াটার বেজড পেইন্ট', valueEn: 'Eco Water-based Paint' },
      { keyBn: 'সার্টিফাইড সেফটি', keyEn: 'Safety', valueBn: 'EN71 সেফটি স্ট্যান্ডার্ড পাশকৃত', valueEn: 'EN71 Safety Certified' }
    ],
    images: [
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    rating: 4.8,
    reviewCount: 45,
    salesCount: 210,
    reviews: [
      {
        id: 'r3',
        userName: 'ফারিহা পারভীন',
        rating: 5,
        date: '2026-08-05',
        comment: 'আমার ১.৫ বছরের ছেলে সারাদিন এটা নিয়ে খেলে! খুব ভালো ফিনিশিং। কাঠের কোণাগুলি ধারালো নয়।',
        verifiedPurchase: true
      }
    ],
    faqs: [
      {
        questionBn: 'বাচ্চা কি ছোট টুকরো গিলে ফেলার ঝুঁকি আছে?',
        questionEn: 'Is there any choke hazard with small pieces?',
        answerBn: 'না, প্রতিটি ব্লক নিরাপদ বড় মাপের তৈরি যা বাচ্চা মুখে নিলেও গিলে ফেলা অসম্ভব।',
        answerEn: 'No, all pieces are large sized according to international anti-choke standards.'
      }
    ]
  },
  {
    id: 'p3',
    sku: 'KB-SHO-302',
    nameBn: 'নন-স্লিপ গ্রিপ কিউট বেবি ওয়াকিং শু',
    nameEn: 'Non-Slip Soft Sole Soft Baby First Walker Shoes',
    categoryId: 'shoes',
    brand: 'Babyhug',
    price: 850,
    discountPrice: 650,
    stock: 30,
    isPublished: true,
    isFeatured: true,
    isBestSeller: true,
    ageGroup: '6-12m',
    ageTextBn: '৬ মাস - ১৮ মাস',
    ageTextEn: '6 Months - 18 Months',
    sizes: ['11 cm', '12 cm', '13 cm'],
    colors: [
      { nameBn: 'ন্যাচারাল বেইজ', nameEn: 'Natural Beige', hex: '#F5F5DC' },
      { nameBn: 'চারকোল গ্রে', nameEn: 'Charcoal Grey', hex: '#36454F' }
    ],
    descriptionBn: 'বাচ্চার প্রথম হাঁটা শেখার জন্য আল্ট্রা-সফট ও ফ্লেক্সিবল সোলের এন্টি-স্লিপ ক্যাজুয়াল শু। পায়ে ফোসকা পড়া রোধ করতে নরম ভেতরের প্যাডিং দেওয়া আছে।',
    descriptionEn: 'Soft-soled anti-slip first walker shoes with breathable mesh and flexible rubber grips. Cushioned inner sole prevents blisters.',
    specifications: [
      { keyBn: 'সোল উপাদান', keyEn: 'Sole Material', valueBn: 'নমনীয় অ্যান্টি-স্লিপ রাবার', valueEn: 'Flexible Anti-Slip Rubber' },
      { keyBn: 'ওজন', keyEn: 'Weight', valueBn: 'মাত্র ৯৫ গ্রাম (অত্যন্ত হালকা)', valueEn: '95g Lightweight' }
    ],
    images: [
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    rating: 4.7,
    reviewCount: 29,
    salesCount: 98,
    reviews: [
      {
        id: 'r4',
        userName: 'শরিফুল ইসলাম',
        rating: 5,
        date: '2026-08-01',
        comment: 'পায়ের গ্রিপ চমৎকার, মেঝেতে পিছলে যায় না। ধন্যবাদ ক্রেতার বাজার।',
        verifiedPurchase: true
      }
    ],
    faqs: [
      {
        questionBn: 'বাচ্চার পায়ের মাপ কীভাবে বের করব?',
        questionEn: 'How do I measure my baby’s foot length?',
        answerBn: 'বাচ্চার পায়ের পাতা স্কেল দিয়ে মেপে সেমি অনুযায়ী সাইজ নির্বাচন করুন। সন্দেহ থাকলে ১ সেমি বড় সাইজ নিন।',
        answerEn: 'Measure foot from heel to longest toe in cm and pick matching size.'
      }
    ]
  },
  {
    id: 'p4',
    sku: 'KB-FED-401',
    nameBn: 'বিপিএ ফ্রি সিলিকন ফিডিং সেট ও ওয়াটার বোতল',
    nameEn: 'BPA-Free Food Grade Silicone Feeding Set & Bib',
    categoryId: 'feeding',
    brand: 'Chicco',
    price: 1450,
    discountPrice: 1150,
    stock: 15,
    isPublished: true,
    isFeatured: true,
    isFlashSale: true,
    ageGroup: '6-12m',
    ageTextBn: '৬ মাস - ৩ বছর',
    ageTextEn: '6 Months - 3 Years',
    sizes: ['Standard'],
    colors: [
      { nameBn: 'মিন্ট গ্রিন', nameEn: 'Mint Green', hex: '#98FF98' },
      { nameBn: 'সফট পপি ওরেঞ্জ', nameEn: 'Soft Peach', hex: '#FFDAB9' }
    ],
    descriptionBn: 'ফুড গ্রেড ১০০% সেফ সিলিকন বাটি, চামচ, সাকশন প্লেট এবং ওয়াটারপ্রুফ বিবের পূর্ণাঙ্গ মিলটাইম সেট। বাটিটি টেবিলে শক্তভাবে লেগে থাকে যাতে খাবার পড়ে নষ্ট না হয়।',
    descriptionEn: '100% Food grade silicone bowl with strong suction base, soft spoon, and waterproof pocket bib. Microwavable and dishwasher safe.',
    specifications: [
      { keyBn: 'সেফটি গ্রেড', keyEn: 'Safety Grade', valueBn: 'BPA Free, FDA Certified', valueEn: 'BPA Free, FDA Certified' },
      { keyBn: 'তাপমাত্রা সহনশীলতা', keyEn: 'Temp Resistance', valueBn: '-40°C থেকে 220°C', valueEn: '-40°C to 220°C' }
    ],
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584832501066-e8224e7561ce?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    rating: 4.9,
    reviewCount: 52,
    salesCount: 180,
    reviews: [
      {
        id: 'r5',
        userName: 'নাসরিন আক্তার',
        rating: 5,
        date: '2026-07-30',
        comment: 'সাকশন ক্ষমতা সত্যিই অনেক ভালো। বাচ্চা সহজে বাটিটা উল্টাতে পারে না।',
        verifiedPurchase: true
      }
    ],
    faqs: []
  },
  {
    id: 'p5',
    sku: 'KB-CAR-508',
    nameBn: 'জেন্টল বেবি স্কিন কেয়ার লোশন ও বডি ওয়াশ সেট',
    nameEn: 'Gentle Organic Baby Lotion & Head-to-Toe Body Wash',
    categoryId: 'baby-care',
    brand: 'Chicco',
    price: 1800,
    discountPrice: 1450,
    stock: 40,
    isPublished: true,
    isFeatured: false,
    isBestSeller: true,
    ageGroup: '6-12m',
    ageTextBn: '০ মাস - ৫ বছর',
    ageTextEn: '0 Months - 5 Years',
    sizes: ['300 ml'],
    colors: [
      { nameBn: 'হোয়াইট কটন', nameEn: 'White Cotton', hex: '#FFFFFF' }
    ],
    descriptionBn: 'প্যারাবেন, সালফেট ও অ্যালকোহল মুক্ত প্রাকৃতিক ক্যামোমাইল ও অ্যালমন্ড অয়েল সমৃদ্ধ অত্যন্ত কোমল বেবি বডি ওয়াশ ও লোশন। চিকিৎসকদের দ্বারা পরীক্ষিত।',
    descriptionEn: 'Paraben-free, tear-free organic baby wash and lotion infused with Chamomile and Sweet Almond oil. Dermatologist tested.',
    specifications: [
      { keyBn: 'ভলিউম', keyEn: 'Volume', valueBn: '৩০০ মি.লি. লোশন + ৩০০ মি.লি. ওয়াশ', valueEn: '300ml Lotion + 300ml Wash' },
      { keyBn: 'ফর্মুলা', keyEn: 'Formula', valueBn: 'টিয়ার-ফ্রি টিয়ারলেস ফর্মুলা', valueEn: 'Tear-Free Hypoallergenic' }
    ],
    images: [
      'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    rating: 4.9,
    reviewCount: 64,
    salesCount: 320,
    reviews: [],
    faqs: []
  },
  {
    id: 'p6',
    sku: 'KB-CLT-602',
    nameBn: 'গার্লস প্রিমিয়াম কটন ফ্লোরাল ড্রেস (২-৪ বছর)',
    nameEn: 'Girls Premium Cotton Floral Dress Set with Hairband',
    categoryId: 'baby-clothes',
    brand: 'Mothercare',
    price: 1350,
    discountPrice: 1050,
    stock: 14,
    isPublished: true,
    isFeatured: true,
    isNewArrival: true,
    ageGroup: '2-4y',
    ageTextBn: '২ বছর - ৪ বছর',
    ageTextEn: '2 Years - 4 Years',
    sizes: ['2T', '3T', '4T'],
    colors: [
      { nameBn: 'রোজ পিঙ্ক', nameEn: 'Rose Pink', hex: '#FF69B4' },
      { nameBn: 'সানফ্লাওয়ার ইয়েলো', nameEn: 'Sunflower Yellow', hex: '#FFD700' }
    ],
    descriptionBn: 'আকর্ষণীয় ফ্লোরাল প্রিন্ট ও ম্যাচিং হেয়ারব্যান্ড সহ প্রিমিয়াম সুতির ফ্রক ড্রেস। যেকোনো উৎসব ও পারিবারিক অনুষ্ঠানে আপনার সোনামণিকে দেবে রাজকীয় সাজ।',
    descriptionEn: 'Charming floral print soft cotton frock dress paired with a matching hairband. Perfect for birthday parties and family events.',
    specifications: [
      { keyBn: 'উপাদান', keyEn: 'Material', valueBn: '১০০% সফট টুইল কটন', valueEn: '100% Soft Twill Cotton' },
      { keyBn: 'সেট বিবরণ', keyEn: 'Package', valueBn: '১টি ফ্রক + ১টি ম্যাচিং হেডব্যান্ড', valueEn: '1 Frock + 1 Matching Headband' }
    ],
    images: [
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    rating: 5.0,
    reviewCount: 19,
    salesCount: 88,
    reviews: [],
    faqs: []
  },
  {
    id: 'p7',
    sku: 'KB-LRN-703',
    nameBn: 'স্মার্ট টকিং সাউন্ড বুক ও এনিমেল লার্নিং প্যাড',
    nameEn: 'Interactive Smart Talking Audio Book & ABC Learning Pad',
    categoryId: 'learning',
    brand: 'Little Stars',
    price: 1150,
    discountPrice: 850,
    stock: 22,
    isPublished: true,
    isFeatured: true,
    isFlashSale: true,
    ageGroup: '2-4y',
    ageTextBn: '২ বছর - ৫ বছর',
    ageTextEn: '2 Years - 5 Years',
    sizes: ['Standard'],
    colors: [
      { nameBn: 'রয়্যাল ব্লু', nameEn: 'Royal Blue', hex: '#4169E1' }
    ],
    descriptionBn: 'বাংলা ও ইংরেজি বর্ণমালা, ছড়া, পশুর ডাক এবং গণিত শেখার জন্য টাচ সেনসিটিভ রিচেকর্ড সাউন্ড বুক। প্রতিটি পাতায় স্পর্শ করলেই মিষ্টি কণ্ঠে উচ্চারণ শোনায়।',
    descriptionEn: 'Interactive touch audio book with Bengali & English alphabets, nursery rhymes, animal sounds, and numbers. Volume control & rechargeable.',
    specifications: [
      { keyBn: 'ভাষা', keyEn: 'Language', valueBn: 'দ্বভাষিক (বাংলা ও ইংরেজি)', valueEn: 'Bilingual (Bangla & English)' },
      { keyBn: 'ব্যাটারি', keyEn: 'Battery', valueBn: 'ইউএসবি রিচার্জেবল লিথিয়াম ব্যাটারি', valueEn: 'USB Rechargeable Battery' }
    ],
    images: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    rating: 4.8,
    reviewCount: 31,
    salesCount: 115,
    reviews: [],
    faqs: []
  },
  {
    id: 'p8',
    sku: 'KB-ACC-801',
    nameBn: '৪-ইন-১ এরগোনোমিক কজি বেবি ক্যাঙ্গারু কেরিয়ার ব্যাগ',
    nameEn: '4-in-1 Ergonomic Multi-Position Baby Carrier Sling Bag',
    categoryId: 'accessories',
    brand: 'Kretar Bazar Special',
    price: 2450,
    discountPrice: 1890,
    stock: 12,
    isPublished: true,
    isFeatured: true,
    isBestSeller: true,
    ageGroup: '6-12m',
    ageTextBn: '৬ মাস - ৩ বছর',
    ageTextEn: '6 Months - 3 Years',
    sizes: ['Free Size'],
    colors: [
      { nameBn: 'ডেনিম ব্লু', nameEn: 'Denim Blue', hex: '#1560BD' },
      { nameBn: 'গ্রে ম্যাট', nameEn: 'Grey Matte', hex: '#808080' }
    ],
    descriptionBn: 'মা ও বাবার পিঠের ব্যথা মুক্ত করতে হিপসিট সহ অত্যন্ত আরামদায়ক ক্যাঙ্গারু ব্যাগ। ২০ কেজি পর্যন্ত ওজন সহ্য করতে সক্ষম। শ্বাসপ্রশ্বাসযোগ্য ৩ডি মেস ফেব্রিক।',
    descriptionEn: 'Ergonomic 4-in-1 baby carrier with padded hip seat and lumbar support. Breathable 3D mesh fabric supporting up to 20 kg.',
    specifications: [
      { keyBn: 'ওজন ক্ষমতা', keyEn: 'Weight Limit', valueBn: '২০ কেজি পর্যন্ত', valueEn: 'Up to 20 kg' },
      { keyBn: 'সেফটি লক', keyEn: 'Safety Lock', valueBn: 'ডাবল বাকল সেফটি ক্লিপ', valueEn: 'Double Buckle Lock' }
    ],
    images: [
      'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutback2015.mp4',
    rating: 4.9,
    reviewCount: 78,
    salesCount: 260,
    reviews: [],
    faqs: []
  },
  {
    id: 'p9',
    sku: 'KB-CLT-904',
    nameBn: 'বয়েজ প্রিমিয়াম ক্যাজুয়াল শার্ট ও ট্র্যাক প্যান্ট সেট (৪-৬ বছর)',
    nameEn: 'Boys Stylish Cotton Casual Shirt & Jogger Pants Outfit',
    categoryId: 'baby-clothes',
    brand: "Carter's",
    price: 1650,
    discountPrice: 1290,
    stock: 16,
    isPublished: true,
    isFeatured: false,
    isNewArrival: true,
    ageGroup: '4-6y',
    ageTextBn: '৪ বছর - ৬ বছর',
    ageTextEn: '4 Years - 6 Years',
    sizes: ['4Y', '5Y', '6Y'],
    colors: [
      { nameBn: 'অলিভ গ্রিন', nameEn: 'Olive Green', hex: '#808000' },
      { nameBn: 'নেভি ব্লু', nameEn: 'Navy Blue', hex: '#000080' }
    ],
    descriptionBn: 'স্টাইলিশ প্রিমিয়াম ডেনিম টাইপ শার্ট ও সফট জগার প্যান্ট। ৪ থেকে ৬ বছর বয়সি ছেলেদের জন্য অত্যন্ত রুচিশীল ও ক্যাজুয়াল আউটফিট।',
    descriptionEn: 'Trendy cotton casual shirt matched with elastic waist jogger trousers. Breathable, durable, and stylish for school or outing.',
    specifications: [
      { keyBn: 'উপাদান', keyEn: 'Material', valueBn: '৯৫% সফট কটন + ৫% ইলাস্টেন', valueEn: '95% Cotton + 5% Elastane' }
    ],
    images: [
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    rating: 4.7,
    reviewCount: 16,
    salesCount: 64,
    reviews: [],
    faqs: []
  },
  {
    id: 'p10',
    sku: 'KB-WIN-1002',
    nameBn: 'কিডস ওয়ার্ম হুডেড উইন্ডপ্রুফ সোয়েটশার্ট জ্যাকেট (৬-১০ বছর)',
    nameEn: 'Kids Warm Fleece Hooded Winter Jacket (Ages 6-10 Years)',
    categoryId: 'seasonal',
    brand: 'Kretar Bazar Special',
    price: 2100,
    discountPrice: 1650,
    stock: 20,
    isPublished: true,
    isFeatured: true,
    isNewArrival: true,
    isFlashSale: true,
    ageGroup: '6-10y',
    ageTextBn: '৬ বছর - ১০ বছর',
    ageTextEn: '6 Years - 10 Years',
    sizes: ['6-8Y', '8-10Y'],
    colors: [
      { nameBn: 'মেরুন রেড', nameEn: 'Maroon Red', hex: '#800000' },
      { nameBn: 'বোল্ড ব্ল্যাক', nameEn: 'Bold Black', hex: '#000000' }
    ],
    descriptionBn: 'শীতকালে বাচ্চাকে ঠাণ্ডা থেকে সম্পূর্ণ সুরক্ষিত রাখতে ভেতরের ওয়ার্ম ফ্লিস লাইনিং সহ জিপার হুডেড জ্যাকেট। বাইরের দিকটি ওয়াটারপ্রুফ ফিনিশ।',
    descriptionEn: 'Heavy duty cozy winter hooded coat with inner fleece insulation. Keeps kids warm and stylish in cold weather.',
    specifications: [
      { keyBn: 'লাইনিং', keyEn: 'Lining', valueBn: 'থার্মাল সফট ফ্লিস লাইনার', valueEn: 'Thermal Soft Fleece' },
      { keyBn: 'হুড টাইপ', keyEn: 'Hood Type', valueBn: 'ডিটাচেবল সফট হুড', valueEn: 'Detachable Hood' }
    ],
    images: [
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    rating: 4.9,
    reviewCount: 33,
    salesCount: 150,
    reviews: [],
    faqs: []
  }
];
