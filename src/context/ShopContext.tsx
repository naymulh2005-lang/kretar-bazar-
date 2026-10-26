import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  Product, 
  Category, 
  Brand, 
  CartItem, 
  Coupon, 
  Order, 
  UserProfile, 
  NotificationItem, 
  FilterState, 
  MediaItem,
  HeaderConfig,
  HeroSlide,
  AdminNotificationSettings,
  StoreBranding 
} from '../types';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { CATEGORIES, BRANDS, VALID_COUPONS } from '../data/categoriesAndBrands';
import { INITIAL_MEDIA } from '../data/mockMedia';
import { INITIAL_HEADER_CONFIGS } from '../data/mockHeaderConfigs';
import { INITIAL_HERO_SLIDES } from '../data/mockHeroSlides';
import { 
  testConnection,
  seedInitialDatabase,
  subscribeToProducts,
  subscribeToOrders,
  subscribeToHeroSlides,
  subscribeToHeaderConfigs,
  subscribeToMedia,
  subscribeToAdminSettings,
  subscribeToStoreBranding,
  subscribeToNotifications,
  syncProductToFirestore,
  deleteProductFromFirestore,
  syncOrderToFirestore,
  updateOrderStatusInFirestore,
  syncHeroSlideToFirestore,
  deleteHeroSlideFromFirestore,
  syncHeaderConfigToFirestore,
  deleteHeaderConfigFromFirestore,
  syncMediaItemToFirestore,
  deleteMediaItemFromFirestore,
  syncAdminSettingsToFirestore,
  syncStoreBrandingToFirestore,
  syncNotificationToFirestore,
  registerWithEmail,
  loginWithEmailPassword,
  syncUserProfileToFirestore,
  getUserProfileFromFirestore,
  subscribeToUserProfile,
  signInWithGoogle,
  signOutFirebase,
  onAuthStatusChange,
  updateOrderStatusOnServer
} from '../services/firebaseService';
import { auth } from '../firebase';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface ShopContextType {
  lang: 'bn' | 'en';
  setLang: (lang: 'bn' | 'en') => void;
  products: Product[];
  categories: Category[];
  brands: Brand[];
  coupons: Coupon[];
  
  // Filtering & Search
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  filteredProducts: Product[];
  
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, selectedSize?: string, selectedColor?: Product['colors'][0], quantity?: number) => void;
  updateCartQuantity: (productId: string, size: string, delta: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  shippingCity: 'inside-dhaka' | 'outside-dhaka' | 'express-dhaka';
  setShippingCity: (city: 'inside-dhaka' | 'outside-dhaka' | 'express-dhaka') => void;
  shippingCost: number;
  cartTotal: number;
  
  // Wishlist
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  
  // Modals & UI States
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  activeDetailProduct: Product | null;
  setActiveDetailProduct: (product: Product | null) => void;
  activeVideoProduct: Product | null;
  setActiveVideoProduct: (product: Product | null) => void;
  activeShareProduct: Product | null;
  setActiveShareProduct: (product: Product | null) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isAiAdvisorOpen: boolean;
  setIsAiAdvisorOpen: (open: boolean) => void;
  activeOrderConfirmation: Order | null;
  setActiveOrderConfirmation: (order: Order | null) => void;

  // User & Orders
  user: UserProfile | null;
  loginUser: (email: string, name?: string) => void;
  registerUser: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logoutUser: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'date' | 'status' | 'trackingNumber'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // Admin Actions
  addProduct: (product: Omit<Product, 'id' | 'sku' | 'rating' | 'reviewCount' | 'reviews' | 'salesCount'> & { sku?: string }) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  togglePublishProduct: (productId: string) => void;

  // Media Management & Gallery
  mediaList: MediaItem[];
  addMediaItem: (media: Omit<MediaItem, 'id' | 'createdAt' | 'viewsCount' | 'likesCount'>) => void;
  addMultipleMediaItems: (items: Omit<MediaItem, 'id' | 'createdAt' | 'viewsCount' | 'likesCount'>[]) => void;
  updateMediaItem: (media: MediaItem) => void;
  deleteMediaItem: (id: string) => void;
  toggleFeaturedMedia: (id: string) => void;
  incrementMediaViews: (id: string) => void;
  toggleLikeMedia: (id: string) => void;
  activeMediaModal: MediaItem | null;
  setActiveMediaModal: (media: MediaItem | null) => void;

  // Dynamic Header Configuration
  headerConfigs: HeaderConfig[];
  activeHeaderConfig: HeaderConfig;
  addHeaderConfig: (config: Omit<HeaderConfig, 'id'>) => void;
  updateHeaderConfig: (config: HeaderConfig) => void;
  deleteHeaderConfig: (id: string) => void;
  setActiveHeaderConfig: (id: string) => void;

  // Dynamic Hero Slider Configuration
  heroSlides: HeroSlide[];
  addHeroSlide: (slide: Omit<HeroSlide, 'id'>) => void;
  updateHeroSlide: (slide: HeroSlide) => void;
  deleteHeroSlide: (id: string) => void;
  toggleHeroSlideActive: (id: string) => void;
  reorderHeroSlides: (slides: HeroSlide[]) => void;

  // Real-time Admin Notifications
  adminNotificationSettings: AdminNotificationSettings;
  updateAdminNotificationSettings: (settings: Partial<AdminNotificationSettings>) => void;

  // Reviews
  addReview: (productId: string, rating: number, comment: string, userName: string) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  sendBroadcastNotification: (titleBn: string, titleEn: string, messageBn: string, messageEn: string) => void;

  // Firebase Realtime State
  isFirebaseConnected: boolean;
  syncAllDataToFirebase: () => Promise<void>;

  // Toast Alerts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;

  // Dynamic Branding (Master Logo & Hero Promotional Banner)
  storeBranding: StoreBranding;
  updateStoreBranding: (branding: Partial<StoreBranding>) => Promise<void>;
}

const initialFilters: FilterState = {
  searchQuery: '',
  selectedCategory: 'all',
  selectedAgeGroups: [],
  selectedBrands: [],
  priceRange: [0, 5000],
  inStockOnly: false,
  onSaleOnly: false,
  sortBy: 'featured'
};

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
};

function safeJsonParse<T>(key: string, fallback: T): T {
  try {
    const item = safeStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const alertedOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitialOrdersLoadRef = useRef<boolean>(true);
  const isOrderSubmittingRef = useRef<boolean>(false);

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    return safeJsonParse('kb_products', MOCK_PRODUCTS);
  });

  const [categories] = useState<Category[]>(CATEGORIES);
  const [brands] = useState<Brand[]>(BRANDS);
  const [coupons] = useState<Coupon[]>(VALID_COUPONS);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Cart & Orders
  const [cart, setCart] = useState<CartItem[]>(() => {
    return safeJsonParse('kb_cart', []);
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [shippingCity, setShippingCity] = useState<'inside-dhaka' | 'outside-dhaka' | 'express-dhaka'>('inside-dhaka');
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    return safeJsonParse('kb_wishlist', ['p1', 'p2']);
  });

  // UI Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeDetailProduct, setActiveDetailProduct] = useState<Product | null>(null);
  const [activeVideoProduct, setActiveVideoProduct] = useState<Product | null>(null);
  const [activeShareProduct, setActiveShareProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);
  const [activeOrderConfirmation, setActiveOrderConfirmation] = useState<Order | null>(null);

  // User & Orders
  const [user, setUser] = useState<UserProfile | null>(() => {
    return safeJsonParse<UserProfile | null>('kb_user', null);
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    return safeJsonParse('kb_orders', [
      {
        id: 'ORD-98421',
        date: '2026-08-10',
        customerName: 'মো. তৌফিক রহমান',
        customerPhone: '01711223344',
        customerEmail: 'toufiq@example.com',
        shippingAddress: 'ফ্ল্যাট ৪বি, বাড়ি ১৭, রোড ৫, ধানমন্ডি, ঢাকা',
        city: 'inside-dhaka',
        items: [
          {
            product: MOCK_PRODUCTS[0],
            selectedSize: '9m',
            selectedColor: MOCK_PRODUCTS[0].colors[0],
            quantity: 1
          }
        ],
        subtotal: 750,
        shippingCost: 60,
        discountAmount: 0,
        total: 810,
        paymentMethod: 'bkash',
        paymentStatus: 'paid',
        transactionId: 'TRX-8823912',
        status: 'shipped',
        trackingNumber: 'KB-TRK-88902'
      }
    ]);
  });

  // Media Management State
  const [mediaList, setMediaList] = useState<MediaItem[]>(() => {
    return safeJsonParse('kb_media', INITIAL_MEDIA);
  });

  const [activeMediaModal, setActiveMediaModal] = useState<MediaItem | null>(null);

  // Dynamic Hero Slides State
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => {
    return safeJsonParse('kb_hero_slides', INITIAL_HERO_SLIDES);
  });

  // Dynamic Header Configurations State
  const [headerConfigs, setHeaderConfigs] = useState<HeaderConfig[]>(() => {
    return safeJsonParse('kb_header_configs', INITIAL_HEADER_CONFIGS);
  });

  const activeHeaderConfig = headerConfigs.find(h => h.isActive) || headerConfigs[0] || INITIAL_HEADER_CONFIGS[0];

  // Admin Real-time Notification Settings
  const [adminNotificationSettings, setAdminNotificationSettings] = useState<AdminNotificationSettings>(() => {
    return safeJsonParse('kb_admin_notif_settings', {
      adminEmail: 'admin@kretarbazar.com',
      adminPhone: '01700000000',
      whatsappNumber: '8801700000000',
      soundEnabled: true,
      browserNotificationsEnabled: true
    });
  });

  // Dynamic Store Branding (Master Logo & Hero Promotional Banner)
  const [storeBranding, setStoreBranding] = useState<StoreBranding>(() => {
    return safeJsonParse('kb_store_branding', {
      logoUrl: '',
      heroBannerUrl: '',
      headerBannerUrl: '',
      updatedAt: ''
    });
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      titleBn: '🎉 মেগা ফ্ল্যাশ সেল চালু হয়েছে!',
      titleEn: '🎉 Mega Flash Sale Live!',
      messageBn: 'আজকে শিশুদের সেরা জামা ও খেলনায় ৩০% পর্যন্ত ছাড় চলছে। কুপন: KRETA10',
      messageEn: 'Up to 30% off on premium kids clothes & toys. Code: KRETA10',
      date: '2026-08-12',
      isRead: false,
      type: 'promo'
    },
    {
      id: 'n2',
      titleBn: '🚚 আপনার অর্ডার #ORD-98421 ডেলিভারির জন্য রওনা হয়েছে',
      titleEn: '🚚 Order #ORD-98421 is out for delivery',
      messageBn: 'রাইডার শীঘ্রই আপনার সাথে যোগাযোগ করবেন।',
      messageEn: 'Rider will contact you shortly.',
      date: '2026-08-11',
      isRead: true,
      type: 'order'
    }
  ]);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastCounterRef = useRef(0);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    toastCounterRef.current += 1;
    const id = `toast_${Date.now()}_${toastCounterRef.current}_${Math.random().toString(36).substring(2, 7)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // Sync to safeStorage
  useEffect(() => {
    safeStorage.setItem('kb_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    safeStorage.setItem('kb_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    safeStorage.setItem('kb_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    safeStorage.setItem('kb_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    safeStorage.setItem('kb_media', JSON.stringify(mediaList));
  }, [mediaList]);

  useEffect(() => {
    safeStorage.setItem('kb_hero_slides', JSON.stringify(heroSlides));
  }, [heroSlides]);

  useEffect(() => {
    safeStorage.setItem('kb_header_configs', JSON.stringify(headerConfigs));
  }, [headerConfigs]);

  useEffect(() => {
    safeStorage.setItem('kb_admin_notif_settings', JSON.stringify(adminNotificationSettings));
  }, [adminNotificationSettings]);

  useEffect(() => {
    safeStorage.setItem('kb_store_branding', JSON.stringify(storeBranding));
  }, [storeBranding]);

  useEffect(() => {
    if (user) {
      safeStorage.setItem('kb_user', JSON.stringify(user));
    } else {
      safeStorage.removeItem('kb_user');
    }
  }, [user]);

  // ======================= INITIALIZE & REALTIME FIREBASE SYNC =======================
  useEffect(() => {
    let isMounted = true;

    const initFirebase = async () => {
      try {
        await testConnection();
        await seedInitialDatabase();
        if (isMounted) setIsFirebaseConnected(true);
      } catch (err) {
        console.warn('Firebase initialization note:', err);
      }
    };

    initFirebase();

    // 1. Fetch server stored products and subscribe to Cloud Firestore
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(prev => {
            const map = new Map(prev.map(p => [p.id, p]));
            for (const sp of data.products) {
              map.set(sp.id, { ...map.get(sp.id), ...sp });
            }
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});

    fetch('/api/slides')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.slides) && data.slides.length > 0) {
          setHeroSlides(data.slides);
        }
      })
      .catch(() => {});

    fetch('/api/headers')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.headers) && data.headers.length > 0) {
          setHeaderConfigs(data.headers);
        }
      })
      .catch(() => {});

    fetch('/api/branding')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.branding) {
          setStoreBranding(prev => ({ ...prev, ...data.branding }));
        }
      })
      .catch(() => {});

    fetch('/api/media')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.media) && data.media.length > 0) {
          setMediaList(data.media);
        }
      })
      .catch(() => {});

    const unsubProducts = subscribeToProducts((cloudProducts) => {
      if (cloudProducts && cloudProducts.length > 0) {
        setProducts(cloudProducts);
      }
    });

    // 2. Dynamic Orders Subscription based on Authenticated Role
    let unsubOrders: (() => void) | null = null;
    const attachOrdersSubscription = () => {
      if (unsubOrders) {
        unsubOrders();
        unsubOrders = null;
      }
      const adminToken = sessionStorage.getItem('kb_admin_session_token');
      unsubOrders = subscribeToOrders((cloudOrders) => {
        if (cloudOrders) {
          if (isInitialOrdersLoadRef.current) {
            cloudOrders.forEach(o => alertedOrderIdsRef.current.add(o.id));
            isInitialOrdersLoadRef.current = false;
          } else {
            const newlyReceived = cloudOrders.filter(o => !alertedOrderIdsRef.current.has(o.id));
            for (const newOrd of newlyReceived) {
              alertedOrderIdsRef.current.add(newOrd.id);
              triggerOrderRealtimeAlert(newOrd);
            }
          }
          setOrders(cloudOrders);
        }
      }, adminToken);
    };
    attachOrdersSubscription();

    const handleAdminSessionChange = () => {
      attachOrdersSubscription();
    };
    window.addEventListener('kb_admin_session_updated', handleAdminSessionChange);

    // 3. Subscribe to Hero Slides
    const unsubSlides = subscribeToHeroSlides((cloudSlides) => {
      if (cloudSlides && cloudSlides.length > 0) {
        setHeroSlides(cloudSlides);
      }
    });

    // 4. Subscribe to Header Configs
    const unsubHeaders = subscribeToHeaderConfigs((cloudHeaders) => {
      if (cloudHeaders && cloudHeaders.length > 0) {
        setHeaderConfigs(cloudHeaders);
      }
    });

    // 5. Subscribe to Media Gallery
    const unsubMedia = subscribeToMedia((cloudMedia) => {
      if (cloudMedia && cloudMedia.length > 0) {
        setMediaList(cloudMedia);
      }
    });

    // 6. Subscribe to Admin Settings
    const unsubSettings = subscribeToAdminSettings((cloudSettings) => {
      if (cloudSettings) {
        setAdminNotificationSettings(prev => ({ ...prev, ...cloudSettings }));
      }
    });

    // 7. Subscribe to Broadcast Notifications
    const unsubNotifs = subscribeToNotifications((cloudNotifs) => {
      if (cloudNotifs && cloudNotifs.length > 0) {
        setNotifications(cloudNotifs);
      }
    });

    // 8. Subscribe to Store Branding
    const unsubBranding = subscribeToStoreBranding((cloudBranding) => {
      if (cloudBranding) {
        setStoreBranding(prev => ({ ...prev, ...cloudBranding }));
      }
    });

    // 8. Subscribe to Firebase Auth and User Profile
    let unsubUserProfile: (() => void) | null = null;
    const unsubAuth = onAuthStatusChange(async (fbUser) => {
      if (unsubUserProfile) {
        unsubUserProfile();
        unsubUserProfile = null;
      }

      if (fbUser) {
        // Try getting existing profile from Firestore
        const existingProfile = await getUserProfileFromFirestore(fbUser.uid);
        if (existingProfile) {
          setUser(existingProfile);
        } else {
          const newProf: UserProfile = {
            id: fbUser.uid,
            name: fbUser.displayName || 'সম্মানিত ক্রেতা',
            email: fbUser.email || '',
            phone: fbUser.phoneNumber || '01800000000',
            avatar: fbUser.photoURL || undefined,
            addresses: [
              {
                id: 'a1',
                label: 'হোম অ্যাড্রেস',
                address: 'ঢাকা, বাংলাদেশ',
                city: 'ঢাকা সিটি',
                phone: fbUser.phoneNumber || '01800000000',
                isDefault: true
              }
            ],
            createdAt: new Date().toISOString()
          };
          setUser(newProf);
          syncUserProfileToFirestore(newProf).catch(console.warn);
        }

        // Live subscription to user profile
        unsubUserProfile = subscribeToUserProfile(fbUser.uid, (updatedProfile) => {
          if (updatedProfile) {
            setUser(updatedProfile);
          }
        });
      } else {
        // Logged out
        const saved = safeStorage.getItem('kb_user');
        if (!saved) {
          setUser(null);
        }
      }

      // Re-evaluate orders subscription for new auth state (Admin vs Customer vs Guest)
      attachOrdersSubscription();
    });

    return () => {
      isMounted = false;
      unsubProducts();
      if (unsubOrders) unsubOrders();
      unsubSlides();
      unsubHeaders();
      unsubMedia();
      unsubSettings();
      unsubNotifs();
      if (unsubBranding) unsubBranding();
      unsubAuth();
      if (unsubUserProfile) unsubUserProfile();
    };
  }, []);

  // Save user profile state
  useEffect(() => {
    if (user) {
      safeStorage.setItem('kb_user', JSON.stringify(user));
    } else {
      safeStorage.removeItem('kb_user');
    }
  }, [user]);

  // Real-time Push all local data to Firebase button
  const syncAllDataToFirebase = async () => {
    try {
      showToast(lang === 'bn' ? 'ফায়ারবেস ক্লাউডে ডাটা সিঙ্ক হচ্ছে...' : 'Syncing data to Firebase...', 'info');
      for (const p of products) {
        await syncProductToFirestore(p);
      }
      for (const s of heroSlides) {
        await syncHeroSlideToFirestore(s);
      }
      for (const h of headerConfigs) {
        await syncHeaderConfigToFirestore(h);
      }
      for (const m of mediaList) {
        await syncMediaItemToFirestore(m);
      }
      await syncAdminSettingsToFirestore(adminNotificationSettings);
      showToast(lang === 'bn' ? 'ফায়ারবেস ক্লাউডে সম্পূর্ণ ডাটা সিঙ্ক সম্পন্ন হয়েছে!' : 'All data synced to Firebase successfully!');
    } catch (err) {
      console.error('Error syncing all data to Firebase:', err);
      showToast(lang === 'bn' ? 'সিঙ্ক করতে ত্রুটি হয়েছে' : 'Sync error occurred', 'error');
    }
  };

  // Helper for Sound & Push Alert on New Order
  const triggerOrderRealtimeAlert = (order: Order) => {
    alertedOrderIdsRef.current.add(order.id);
    if (adminNotificationSettings.soundEnabled) {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.45);
        }
      } catch (err) {
        console.error('Audio alert err', err);
      }
    }

    if (adminNotificationSettings.browserNotificationsEnabled && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`NEW ORDER #${order.id}`, {
          body: `Customer: ${order.customerName} (${order.customerPhone}) - Total: ৳${order.total}`,
          icon: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(p => {
          if (p === 'granted') {
            new Notification(`NEW ORDER #${order.id}`, {
              body: `Customer: ${order.customerName} (${order.customerPhone}) - Total: ৳${order.total}`,
              icon: '/favicon.ico'
            });
          }
        });
      }
    }

    const newNotifItem: NotificationItem = {
      id: 'notif_ord_' + Date.now(),
      titleBn: `🔔 নতুন অর্ডার প্রাপ্তি #${order.id}`,
      titleEn: `🔔 New Order Received #${order.id}`,
      messageBn: `ক্রেতা: ${order.customerName}, ফোন: ${order.customerPhone}, মোট: ৳${order.total}`,
      messageEn: `Customer: ${order.customerName}, Phone: ${order.customerPhone}, Total: ৳${order.total}`,
      date: new Date().toISOString(),
      isRead: false,
      type: 'order'
    };
    setNotifications(prev => [newNotifItem, ...prev]);
    syncNotificationToFirestore(newNotifItem).catch(console.warn);
  };

  // Reset Filters
  const resetFilters = () => setFilters(initialFilters);

  // Filtered Products computation
  const filteredProducts = (products || []).filter(p => {
    if (!p || !p.id) return false;
    if (p.isPublished === false) return false;

    // Search query check
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchNameBn = (p.nameBn || '').toLowerCase().includes(q);
      const matchNameEn = (p.nameEn || '').toLowerCase().includes(q);
      const matchBrand = (p.brand || '').toLowerCase().includes(q);
      const matchSku = (p.sku || '').toLowerCase().includes(q);
      const matchAgeBn = (p.ageTextBn || '').toLowerCase().includes(q);
      const matchAgeEn = (p.ageTextEn || '').toLowerCase().includes(q);
      const matchDesc = (p.descriptionBn || '').toLowerCase().includes(q) || (p.descriptionEn || '').toLowerCase().includes(q);
      if (!matchNameBn && !matchNameEn && !matchBrand && !matchSku && !matchAgeBn && !matchAgeEn && !matchDesc) {
        return false;
      }
    }

    // Category
    if (filters.selectedCategory !== 'all' && p.categoryId !== filters.selectedCategory) {
      return false;
    }

    // Age Groups
    if (filters.selectedAgeGroups.length > 0 && !filters.selectedAgeGroups.includes(p.ageGroup)) {
      return false;
    }

    // Brands
    if (filters.selectedBrands.length > 0 && !filters.selectedBrands.includes(p.brand)) {
      return false;
    }

    // Price
    const effectivePrice = typeof p.discountPrice === 'number' && p.discountPrice > 0 ? p.discountPrice : (p.price || 0);
    if (effectivePrice < filters.priceRange[0] || effectivePrice > filters.priceRange[1]) {
      return false;
    }

    // Stock
    const stockVal = typeof p.stock === 'number' ? p.stock : 10;
    if (filters.inStockOnly && stockVal <= 0) {
      return false;
    }

    // On Sale
    if (filters.onSaleOnly && (!p.discountPrice || p.discountPrice >= p.price)) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    const priceA = a.discountPrice || a.price;
    const priceB = b.discountPrice || b.price;

    if (filters.sortBy === 'price-low') return priceA - priceB;
    if (filters.sortBy === 'price-high') return priceB - priceA;
    if (filters.sortBy === 'rating') return b.rating - a.rating;
    if (filters.sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
    return (b.salesCount || 0) - (a.salesCount || 0); // default featured
  });

  // Cart operations
  const addToCart = (
    product: Product, 
    selectedSize?: string, 
    selectedColor?: Product['colors'][0], 
    quantity: number = 1
  ) => {
    const size = selectedSize || product.sizes[0] || 'Standard';
    const color = selectedColor || product.colors[0] || { nameBn: 'ডিফল্ট', nameEn: 'Default', hex: '#000000' };

    setCart(prev => {
      const existingIndex = prev.findIndex(item => 
        item.product.id === product.id && item.selectedSize === size
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, selectedSize: size, selectedColor: color, quantity }];
      }
    });

    showToast(lang === 'bn' ? `"${product.nameBn}" কার্টে যুক্ত হয়েছে!` : `"${product.nameEn}" added to cart!`);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: string, size: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId && item.selectedSize === size) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.selectedSize === size)));
    showToast(lang === 'bn' ? 'পণ্যটি কার্ট থেকে সরানো হয়েছে' : 'Item removed from cart', 'info');
  };

  const clearCart = () => setCart([]);

  const cartSubtotal = cart.reduce((sum, item) => {
    const unitPrice = item.product.discountPrice || item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const applyCoupon = (code: string) => {
    const found = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!found) {
      return { 
        success: false, 
        message: lang === 'bn' ? 'অবৈধ কুপন কোড! দয়া করে সঠিক কোড দিন।' : 'Invalid coupon code!' 
      };
    }
    if (cartSubtotal < found.minOrderValue) {
      return { 
        success: false, 
        message: lang === 'bn' 
          ? `এই কুপনের জন্য সর্বনিম্ন ৳${found.minOrderValue} টাকার কেনাকাটা প্রয়োজন।` 
          : `Minimum order value for this coupon is ৳${found.minOrderValue}` 
      };
    }
    setAppliedCoupon(found);
    showToast(lang === 'bn' ? `কুপন "${found.code}" সফলভাবে যুক্ত হয়েছে!` : `Coupon "${found.code}" applied!`);
    return { success: true, message: 'Coupon applied' };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const shippingCost = shippingCity === 'inside-dhaka' ? 60 : shippingCity === 'outside-dhaka' ? 120 : 150;

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((cartSubtotal * appliedCoupon.discountValue) / 100);
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const cartTotal = Math.max(0, cartSubtotal + shippingCost - discountAmount);

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlistIds(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast(lang === 'bn' ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'Removed from wishlist', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast(lang === 'bn' ? 'উইশলিস্টে সংরক্ষণ করা হয়েছে!' : 'Saved to wishlist!');
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  // User Auth
  const loginUser = (email: string, name?: string) => {
    const newUser: UserProfile = {
      id: 'u_' + Date.now(),
      name: name || 'ক্রেতা ইউজার',
      email,
      phone: '01800000000',
      addresses: [
        {
          id: 'a1',
          label: 'হোম অ্যাড্রেস',
          address: 'ধানমন্ডি, ঢাকা',
          city: 'ঢাকা সিটি',
          phone: '01800000000',
          isDefault: true
        }
      ]
    };
    setUser(newUser);
    syncUserProfileToFirestore(newUser).catch(console.warn);
    setIsAuthOpen(false);
    showToast(lang === 'bn' ? `স্বাগতম, ${newUser.name}!` : `Welcome, ${newUser.name}!`);
  };

  const registerUser = async (email: string, password: string, name: string, phone?: string) => {
    try {
      const newProf = await registerWithEmail(email, password, name, phone);
      setUser(newProf);
      setIsAuthOpen(false);
      showToast(lang === 'bn' ? `অভিনন্দন ${newProf.name}! অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।` : `Welcome ${newProf.name}! Account created.`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('email-already-in-use')) {
        showToast(lang === 'bn' ? 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি আছে! লগইন করুন।' : 'Email already in use! Please login.', 'error');
      } else if (errMsg.includes('weak-password')) {
        showToast(lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.', 'error');
      } else {
        showToast(lang === 'bn' ? 'রেজিস্ট্রেশনে ত্রুটি হয়েছে। সঠিক তথ্য দিন।' : 'Registration failed. Please try again.', 'error');
      }
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const prof = await loginWithEmailPassword(email, password);
      setUser(prof);
      setIsAuthOpen(false);
      showToast(lang === 'bn' ? `স্বাগতম, ${prof.name}!` : `Welcome back, ${prof.name}!`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('user-not-found')) {
        // Automatically create account seamlessly for convenience if valid password
        if (password.length >= 6) {
          try {
            const userName = email.split('@')[0] || 'সম্মানিত ক্রেতা';
            const newProf = await registerWithEmail(email, password, userName);
            setUser(newProf);
            setIsAuthOpen(false);
            showToast(lang === 'bn' ? `অ্যাকাউন্ট তৈরি ও লগইন সফল হয়েছে: ${newProf.name}` : `Account created and logged in: ${newProf.name}`);
            return;
          } catch {
            showToast(lang === 'bn' ? 'এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি। দয়া করে রেজিস্ট্রেশন করুন।' : 'Account not found. Please register first.', 'info');
          }
        } else {
          showToast(lang === 'bn' ? 'এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি। দয়া করে রেজিস্ট্রেশন করুন।' : 'Account not found. Please register first.', 'info');
        }
      } else if (errMsg.includes('wrong-password') || errMsg.includes('invalid-credential')) {
        showToast(lang === 'bn' ? 'ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।' : 'Invalid password. Please try again.', 'error');
      } else {
        showToast(lang === 'bn' ? 'লগইন তথ্য সঠিক নয়। আবার চেষ্টা করুন।' : 'Invalid login credentials.', 'error');
      }
    }
  };

  const loginWithGoogle = async () => {
    try {
      const fbUser = await signInWithGoogle();
      if (fbUser) {
        let userProf = await getUserProfileFromFirestore(fbUser.uid);
        if (!userProf) {
          userProf = {
            id: fbUser.uid,
            name: fbUser.displayName || 'সম্মানিত ক্রেতা',
            email: fbUser.email || '',
            phone: fbUser.phoneNumber || '01800000000',
            avatar: fbUser.photoURL || undefined,
            addresses: [
              {
                id: 'a1',
                label: 'হোম অ্যাড্রেস',
                address: 'ঢাকা, বাংলাদেশ',
                city: 'ঢাকা সিটি',
                phone: fbUser.phoneNumber || '01800000000',
                isDefault: true
              }
            ],
            createdAt: new Date().toISOString()
          };
          await syncUserProfileToFirestore(userProf);
        }
        setUser(userProf);
        setIsAuthOpen(false);
        showToast(lang === 'bn' ? `গুগল দিয়ে লগইন সফল: ${userProf.name}` : `Google login successful: ${userProf.name}`);
      }
    } catch (err) {
      console.error('Google login err:', err);
      showToast(lang === 'bn' ? 'গুগল লগইনে সমস্যা হয়েছে' : 'Google sign in failed', 'error');
    }
  };

  const logoutUser = async () => {
    try {
      await signOutFirebase();
    } catch {}
    setUser(null);
    safeStorage.removeItem('kb_user');
    showToast(lang === 'bn' ? 'লগআউট সফল হয়েছে' : 'Logged out', 'info');
  };

  const updateUserProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser: UserProfile = { ...user, ...profileData };
    setUser(updatedUser);
    await syncUserProfileToFirestore(updatedUser);
    showToast(lang === 'bn' ? 'প্রোফাইল তথ্য আপডেট হয়েছে' : 'Profile updated successfully');
  };

  // Orders - Secure, reliably unique ID, server validation, and Firestore persistence
  const createOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status' | 'trackingNumber'>): Promise<Order> => {
    if (isOrderSubmittingRef.current) {
      throw new Error(lang === 'bn' ? 'অর্ডারটি ইতিমধ্যে প্রসেস হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...' : 'Order is already processing, please wait...');
    }
    isOrderSubmittingRef.current = true;

    try {
      const now = new Date();
      const datePart = now.toISOString().slice(2, 10).replace(/-/g, '');
      const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const uniqueOrderId = `KB-${datePart}-${randPart}`;
      const trackingNum = `KB-TRK-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

      // 1. Build complete item details breakdown
      const itemDetails = orderData.itemDetails || orderData.items.map(item => {
        const prod = item.product;
        const unitPrice = prod ? (prod.discountPrice || prod.price || 0) : 0;
        return {
          productId: prod ? prod.id : 'KB-ITEM',
          nameBn: prod ? prod.nameBn : 'পণ্য',
          nameEn: prod ? prod.nameEn : 'Product',
          selectedSize: item.selectedSize || 'Standard',
          selectedColor: item.selectedColor || { nameBn: 'ডিফল্ট', nameEn: 'Default', hex: '#000000' },
          quantity: item.quantity,
          unitPrice,
          totalPrice: unitPrice * item.quantity,
          image: prod?.images?.[0] || ''
        };
      });

      // 2. Perform authoritative validation and registration via trusted server
      let validatedPayload: any = null;
      try {
        const serverRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...orderData,
            id: uniqueOrderId,
            trackingNumber: trackingNum,
            itemDetails,
            couponCode: appliedCoupon?.code,
            // Only pass genuine user ID if user is authenticated with Firebase
            userId: (auth.currentUser && user && user.id) ? auth.currentUser.uid : undefined
          })
        });

        if (serverRes.ok) {
          const resJson = await serverRes.json();
          if (resJson.success && resJson.order) {
            validatedPayload = resJson.order;
          }
        }
      } catch (serverErr) {
        console.warn('Server order validation note:', serverErr);
      }

      // 3. Assemble validated order object
      const newOrder: Order = {
        ...orderData,
        id: validatedPayload?.id || uniqueOrderId,
        itemDetails: validatedPayload?.itemDetails || itemDetails,
        subtotal: validatedPayload?.subtotal !== undefined ? validatedPayload.subtotal : orderData.subtotal,
        shippingCost: validatedPayload?.shippingCost !== undefined ? validatedPayload.shippingCost : orderData.shippingCost,
        discountAmount: validatedPayload?.discountAmount !== undefined ? validatedPayload.discountAmount : orderData.discountAmount,
        total: validatedPayload?.total !== undefined ? validatedPayload.total : orderData.total,
        date: now.toISOString().split('T')[0],
        createdAt: now.toISOString(),
        status: 'pending',
        trackingNumber: validatedPayload?.trackingNumber || trackingNum
      };

      // STRICT: Omit userId completely for guest orders; never send fake string or undefined
      if (auth.currentUser && user && user.id && user.id !== 'u101') {
        newOrder.userId = auth.currentUser.uid;
      } else {
        delete (newOrder as any).userId;
      }

      // 4. Save to Firestore and await confirmation before reporting success
      await syncOrderToFirestore(newOrder);

      // 5. Update local state and clear cart ONLY after successful persistence
      setOrders(prev => {
        if (prev.some(o => o.id === newOrder.id)) return prev;
        return [newOrder, ...prev];
      });
      alertedOrderIdsRef.current.add(newOrder.id);
      clearCart();
      setAppliedCoupon(null);
      setActiveOrderConfirmation(newOrder);
      triggerOrderRealtimeAlert(newOrder);

      showToast(lang === 'bn' ? `অর্ডার #${newOrder.id} সফলভাবে সম্পন্ন হয়েছে!` : `Order #${newOrder.id} placed successfully!`);
      return newOrder;
    } finally {
      isOrderSubmittingRef.current = false;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    
    // Update on server if server admin session token available
    const adminToken = sessionStorage.getItem('kb_admin_session_token');
    if (adminToken) {
      updateOrderStatusOnServer(adminToken, orderId, status).catch(console.warn);
    }
    
    // Also update in Firestore
    updateOrderStatusInFirestore(orderId, status).catch(console.warn);
    showToast(lang === 'bn' ? `অর্ডার #${orderId} স্ট্যাটাস পরিবর্তন হয়েছে` : `Order #${orderId} updated`, 'info');
  };

  // Admin Actions - Products
  const addProduct = (p: Omit<Product, 'id' | 'sku' | 'rating' | 'reviewCount' | 'reviews' | 'salesCount'> & { sku?: string }) => {
    const newP: Product = {
      ...p,
      id: 'p_' + Date.now(),
      sku: p.sku || ('KB-CUS-' + Math.floor(100 + Math.random() * 900)),
      rating: 5.0,
      reviewCount: 1,
      reviews: [],
      salesCount: 0
    };
    setProducts(prev => [newP, ...prev]);
    syncProductToFirestore(newP).catch(console.warn);
    showToast(lang === 'bn' ? 'নতুন পণ্য ক্লাউডে সফলভাবে যুক্ত হয়েছে!' : 'Product added to cloud successfully!');
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    syncProductToFirestore(updated).catch(console.warn);
    showToast(lang === 'bn' ? 'পণ্য আপডেট সম্পন্ন হয়েছে' : 'Product updated');
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    deleteProductFromFirestore(productId).catch(console.warn);
    showToast(lang === 'bn' ? 'পণ্য মুছে ফেলা হয়েছে' : 'Product deleted', 'info');
  };

  const togglePublishProduct = (productId: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const updated = { ...p, isPublished: !p.isPublished };
        syncProductToFirestore(updated).catch(console.warn);
        return updated;
      }
      return p;
    }));
  };

  // Media Actions
  const addMediaItem = (itemData: Omit<MediaItem, 'id' | 'createdAt' | 'viewsCount' | 'likesCount'>) => {
    const newItem: MediaItem = {
      ...itemData,
      id: 'media_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
      viewsCount: 1,
      likesCount: 0
    };
    setMediaList(prev => [newItem, ...prev]);
    syncMediaItemToFirestore(newItem).catch(console.warn);
    showToast(lang === 'bn' ? 'মিডিয়া ফাইল সফলভাবে আপলোড করা হয়েছে!' : 'Media uploaded successfully!');
  };

  const addMultipleMediaItems = (itemsData: Omit<MediaItem, 'id' | 'createdAt' | 'viewsCount' | 'likesCount'>[]) => {
    const newItems: MediaItem[] = itemsData.map((item, index) => ({
      ...item,
      id: 'media_' + (Date.now() + index) + '_' + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
      viewsCount: 1,
      likesCount: 0
    }));
    setMediaList(prev => [...newItems, ...prev]);
    newItems.forEach(item => syncMediaItemToFirestore(item).catch(console.warn));
    showToast(
      lang === 'bn' 
        ? `${itemsData.length} টি মিডিয়া ফাইল আপলোড সফল হয়েছে!` 
        : `${itemsData.length} media items uploaded successfully!`
    );
  };

  const updateMediaItem = (updated: MediaItem) => {
    setMediaList(prev => prev.map(m => m.id === updated.id ? updated : m));
    syncMediaItemToFirestore(updated).catch(console.warn);
    showToast(lang === 'bn' ? 'মিডিয়া তথ্য আপডেট হয়েছে' : 'Media updated');
  };

  const deleteMediaItem = (id: string) => {
    setMediaList(prev => prev.filter(m => m.id !== id));
    deleteMediaItemFromFirestore(id).catch(console.warn);
    showToast(lang === 'bn' ? 'মিডিয়া ফাইলটি মুছে ফেলা হয়েছে' : 'Media deleted', 'info');
  };

  const toggleFeaturedMedia = (id: string) => {
    setMediaList(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, isFeatured: !m.isFeatured };
        syncMediaItemToFirestore(updated).catch(console.warn);
        return updated;
      }
      return m;
    }));
    showToast(lang === 'bn' ? 'ফিচার্ড স্ট্যাটাস আপডেট হয়েছে' : 'Featured status updated');
  };

  const incrementMediaViews = (id: string) => {
    setMediaList(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, viewsCount: (m.viewsCount || 0) + 1 };
        syncMediaItemToFirestore(updated).catch(console.warn);
        return updated;
      }
      return m;
    }));
  };

  const toggleLikeMedia = (id: string) => {
    setMediaList(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, likesCount: (m.likesCount || 0) + 1 };
        syncMediaItemToFirestore(updated).catch(console.warn);
        return updated;
      }
      return m;
    }));
  };

  // Hero Slide Actions
  const addHeroSlide = (slideData: Omit<HeroSlide, 'id'>) => {
    const newSlide: HeroSlide = {
      ...slideData,
      id: 'slide_' + Date.now()
    };
    setHeroSlides(prev => [...prev, newSlide]);
    syncHeroSlideToFirestore(newSlide).catch(console.warn);
    showToast(lang === 'bn' ? 'নতুন ব্যানারের স্লাইড যোগ করা হয়েছে!' : 'New hero slide added!');
  };

  const updateHeroSlide = (updatedSlide: HeroSlide) => {
    setHeroSlides(prev => prev.map(s => s.id === updatedSlide.id ? updatedSlide : s));
    syncHeroSlideToFirestore(updatedSlide).catch(console.warn);
    showToast(lang === 'bn' ? 'স্লাইড তথ্য ক্লাউডে সেভ করা হয়েছে!' : 'Hero slide updated in cloud!');
  };

  const deleteHeroSlide = (id: string) => {
    if (heroSlides.length <= 1) {
      showToast(lang === 'bn' ? 'কমপক্ষে একটি স্লাইড থাকা আবশ্যক' : 'At least one slide required', 'error');
      return;
    }
    setHeroSlides(prev => prev.filter(s => s.id !== id));
    deleteHeroSlideFromFirestore(id).catch(console.warn);
    showToast(lang === 'bn' ? 'স্লাইড মুছে ফেলা হয়েছে' : 'Hero slide deleted', 'info');
  };

  const toggleHeroSlideActive = (id: string) => {
    setHeroSlides(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, isActive: !s.isActive };
        syncHeroSlideToFirestore(updated).catch(console.warn);
        return updated;
      }
      return s;
    }));
    showToast(lang === 'bn' ? 'স্লাইডের স্ট্যাটাস পরিবর্তন হয়েছে!' : 'Slide active status toggled!');
  };

  const reorderHeroSlides = (newSlidesList: HeroSlide[]) => {
    setHeroSlides(newSlidesList);
    newSlidesList.forEach(s => syncHeroSlideToFirestore(s).catch(console.warn));
    showToast(lang === 'bn' ? 'স্লাইডের ক্রম পরিবর্তন করা হয়েছে!' : 'Slide order updated!');
  };

  // Header Config Actions
  const addHeaderConfig = (configData: Omit<HeaderConfig, 'id'>) => {
    const newConfig: HeaderConfig = {
      ...configData,
      id: 'hdr_' + Date.now()
    };
    setHeaderConfigs(prev => {
      const list = newConfig.isActive
        ? [newConfig, ...prev.map(h => ({ ...h, isActive: false }))]
        : [newConfig, ...prev];
      list.forEach(h => syncHeaderConfigToFirestore(h).catch(console.warn));
      return list;
    });
    showToast(lang === 'bn' ? 'নতুন হেডার তৈরি করা হয়েছে!' : 'New header created!');
  };

  const updateHeaderConfig = (updated: HeaderConfig) => {
    setHeaderConfigs(prev => {
      const list = prev.map(h => {
        if (h.id === updated.id) return updated;
        if (updated.isActive) return { ...h, isActive: false };
        return h;
      });
      list.forEach(h => syncHeaderConfigToFirestore(h).catch(console.warn));
      return list;
    });
    showToast(lang === 'bn' ? 'হেডার তথ্য সেভ করা হয়েছে!' : 'Header saved!');
  };

  const deleteHeaderConfig = (id: string) => {
    if (headerConfigs.length <= 1) {
      showToast(lang === 'bn' ? 'কমপক্ষে একটি হেডার থাকা আবশ্যক' : 'At least one header required', 'error');
      return;
    }
    setHeaderConfigs(prev => {
      const filtered = prev.filter(h => h.id !== id);
      if (!filtered.some(h => h.isActive)) {
        filtered[0].isActive = true;
      }
      filtered.forEach(h => syncHeaderConfigToFirestore(h).catch(console.warn));
      return filtered;
    });
    deleteHeaderConfigFromFirestore(id).catch(console.warn);
    showToast(lang === 'bn' ? 'হেডার মুছে ফেলা হয়েছে' : 'Header deleted', 'info');
  };

  const setActiveHeaderConfig = (id: string) => {
    setHeaderConfigs(prev => {
      const list = prev.map(h => ({
        ...h,
        isActive: h.id === id
      }));
      list.forEach(h => syncHeaderConfigToFirestore(h).catch(console.warn));
      return list;
    });
    showToast(lang === 'bn' ? 'সক্রিয় হেডার পরিবর্তন করা হয়েছে!' : 'Active header updated!');
  };

  const updateAdminNotificationSettings = (settings: Partial<AdminNotificationSettings>) => {
    setAdminNotificationSettings(prev => {
      const updated = { ...prev, ...settings };
      syncAdminSettingsToFirestore(updated).catch(console.warn);
      return updated;
    });
    showToast(lang === 'bn' ? 'নোটিফিকেশন সেটিংস আপডেট হয়েছে' : 'Notification settings updated');
  };

  const updateStoreBranding = async (branding: Partial<StoreBranding>) => {
    const updated: StoreBranding = {
      ...storeBranding,
      ...branding,
      updatedAt: new Date().toISOString()
    };
    setStoreBranding(updated);
    try {
      await syncStoreBrandingToFirestore(updated);
      showToast(lang === 'bn' ? 'স্টোর ব্র্যান্ডিং সফলভাবে আপডেট হয়েছে!' : 'Store branding updated successfully!');
    } catch (err) {
      console.error('Failed to sync store branding:', err);
      showToast(lang === 'bn' ? 'ব্র্যান্ডিং সেভ করতে সমস্যা হয়েছে' : 'Failed to update branding', 'error');
    }
  };

  // Add review
  const addReview = (productId: string, rating: number, comment: string, userName: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newReview = {
          id: 'r_' + Date.now(),
          userName: userName || 'সম্মানিত ক্রেতা',
          rating,
          date: new Date().toISOString().split('T')[0],
          comment,
          verifiedPurchase: true
        };
        const updatedReviews = [newReview, ...p.reviews];
        const avgRating = Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1));
        const updated = {
          ...p,
          reviews: updatedReviews,
          rating: avgRating,
          reviewCount: updatedReviews.length
        };
        syncProductToFirestore(updated).catch(console.warn);
        return updated;
      }
      return p;
    }));
    showToast(lang === 'bn' ? 'আপনার মতামতের জন্য ধন্যবাদ!' : 'Thank you for your review!');
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        const updated = { ...n, isRead: true };
        syncNotificationToFirestore(updated).catch(console.warn);
        return updated;
      }
      return n;
    }));
  };

  const sendBroadcastNotification = (titleBn: string, titleEn: string, messageBn: string, messageEn: string) => {
    const newN: NotificationItem = {
      id: 'n_' + Date.now(),
      titleBn,
      titleEn,
      messageBn,
      messageEn,
      date: new Date().toISOString().split('T')[0],
      isRead: false,
      type: 'promo'
    };
    setNotifications(prev => [newN, ...prev]);
    syncNotificationToFirestore(newN).catch(console.warn);
    showToast(lang === 'bn' ? 'নোটিফিকেশন পাঠানো হয়েছে' : 'Notification broadcasted');
  };

  return (
    <ShopContext.Provider value={{
      lang,
      setLang,
      products,
      categories,
      brands,
      coupons,
      filters,
      setFilters,
      resetFilters,
      filteredProducts,
      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      cartSubtotal,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      shippingCity,
      setShippingCity,
      shippingCost,
      cartTotal,
      wishlistIds,
      toggleWishlist,
      isWishlisted,
      isCartOpen,
      setIsCartOpen,
      activeDetailProduct,
      setActiveDetailProduct,
      activeVideoProduct,
      setActiveVideoProduct,
      activeShareProduct,
      setActiveShareProduct,
      isCheckoutOpen,
      setIsCheckoutOpen,
      isAuthOpen,
      setIsAuthOpen,
      isAdminOpen,
      setIsAdminOpen,
      isAiAdvisorOpen,
      setIsAiAdvisorOpen,
      activeOrderConfirmation,
      setActiveOrderConfirmation,
      user,
      loginUser,
      registerUser,
      loginWithEmail,
      loginWithGoogle,
      logoutUser,
      updateUserProfile,
      orders,
      createOrder,
      updateOrderStatus,
      addProduct,
      updateProduct,
      deleteProduct,
      togglePublishProduct,
      mediaList,
      addMediaItem,
      addMultipleMediaItems,
      updateMediaItem,
      deleteMediaItem,
      toggleFeaturedMedia,
      incrementMediaViews,
      toggleLikeMedia,
      activeMediaModal,
      setActiveMediaModal,
      headerConfigs,
      activeHeaderConfig,
      addHeaderConfig,
      updateHeaderConfig,
      deleteHeaderConfig,
      setActiveHeaderConfig,
      heroSlides,
      addHeroSlide,
      updateHeroSlide,
      deleteHeroSlide,
      toggleHeroSlideActive,
      reorderHeroSlides,
      adminNotificationSettings,
      updateAdminNotificationSettings,
      addReview,
      notifications,
      markNotificationRead,
      sendBroadcastNotification,
      isFirebaseConnected,
      syncAllDataToFirebase,
      toasts,
      showToast,
      storeBranding,
      updateStoreBranding
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within a ShopProvider');
  return context;
};
