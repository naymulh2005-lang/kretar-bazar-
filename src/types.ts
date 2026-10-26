export type AgeGroup = '6-12m' | '1-2y' | '2-4y' | '4-6y' | '6-10y';

export type CategoryId = 
  | 'baby-clothes'
  | 'shoes'
  | 'toys'
  | 'feeding'
  | 'baby-care'
  | 'learning'
  | 'accessories'
  | 'seasonal';

export interface Category {
  id: CategoryId;
  nameBn: string;
  nameEn: string;
  icon: string;
  image: string;
  itemCount: number;
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
}

export interface ProductReview {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
}

export interface Product {
  id: string;
  sku: string;
  nameBn: string;
  nameEn: string;
  categoryId: CategoryId;
  brand: string;
  price: number;
  discountPrice?: number;
  stock: number;
  isPublished: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isFlashSale?: boolean;
  ageGroup: AgeGroup;
  ageTextBn: string;
  ageTextEn: string;
  sizes: string[];
  colors: { nameBn: string; nameEn: string; hex: string }[];
  descriptionBn: string;
  descriptionEn: string;
  specifications: { keyBn: string; keyEn: string; valueBn: string; valueEn: string }[];
  images: string[];
  videoUrl?: string; // e.g. HTML5 MP4 or Video link
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
  faqs: { questionBn: string; questionEn: string; answerBn: string; answerEn: string }[];
  salesCount: number;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: { nameBn: string; nameEn: string; hex: string };
  quantity: number;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderValue: number;
  descriptionBn: string;
  descriptionEn: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItemDetail {
  productId: string;
  nameBn: string;
  nameEn: string;
  selectedSize: string;
  selectedColor: { nameBn: string; nameEn: string; hex: string };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image: string;
}

export interface Order {
  id: string;
  userId?: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  city: 'inside-dhaka' | 'outside-dhaka' | 'express-dhaka' | string;
  country?: string;
  countryName?: string;
  postalCode?: string;
  items: CartItem[];
  itemDetails?: OrderItemDetail[];
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card';
  paymentStatus: 'unpaid' | 'paid';
  transactionId?: string;
  status: OrderStatus;
  trackingNumber: string;
  customerNote?: string;
  district?: string;
  area?: string;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  avatar?: string;
  addresses: { id: string; label: string; address: string; city: string; phone: string; isDefault?: boolean }[];
  childName?: string;
  childAgeGroup?: AgeGroup;
  childBirthday?: string;
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  titleBn: string;
  titleEn: string;
  messageBn: string;
  messageEn: string;
  date: string;
  isRead: boolean;
  type: 'promo' | 'order' | 'system';
}

export interface FilterState {
  searchQuery: string;
  selectedCategory: CategoryId | 'all';
  selectedAgeGroups: AgeGroup[];
  selectedBrands: string[];
  priceRange: [number, number];
  inStockOnly: boolean;
  onSaleOnly: boolean;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
}

export type MediaCategory = 'product_photoshoot' | 'video_review' | 'new_collection' | 'brand_showcase' | 'customer_moments';

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  titleBn: string;
  titleEn: string;
  captionBn?: string;
  captionEn?: string;
  category: MediaCategory;
  isFeatured?: boolean;
  linkedProductId?: string;
  createdAt: string;
  viewsCount?: number;
  likesCount?: number;
}

export interface HeaderConfig {
  id: string;
  titleBn: string;
  titleEn: string;
  welcomeMessageBn: string;
  welcomeMessageEn: string;
  promoAnnouncementBn: string;
  promoAnnouncementEn: string;
  hotlinePhone: string;
  bannerImage: string;
  buttonTextBn: string;
  buttonTextEn: string;
  buttonLink: string;
  isActive: boolean;
  bgColorHex?: string;
  textColorHex?: string;
}

export interface HeroSlide {
  id: string;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  couponCode?: string;
  image: string;
  buttonTextBn: string;
  buttonTextEn: string;
  buttonLink: string;
  isActive: boolean;
  bgGradient?: string;
}

export interface AdminNotificationSettings {
  adminEmail: string;
  adminPhone: string;
  whatsappNumber: string;
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
}

export interface StoreBranding {
  logoUrl?: string;
  heroBannerUrl?: string;
  headerBannerUrl?: string;
  updatedAt?: string;
}

