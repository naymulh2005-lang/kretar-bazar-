import React, { useState, useRef, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { TRANSLATIONS } from '../data/translations';
import { Product, AgeGroup, CategoryId, OrderStatus, MediaCategory, MediaItem, HeaderConfig, Order } from '../types';
import { MasterLogo } from './MasterLogo';
import { extractYouTubeId, getYouTubeEmbedUrl, isYouTubeUrl } from '../utils/youtube';
import { 
  uploadMediaFile, 
  uploadFileWithProgress,
  syncProductToServer,
  deleteProductFromServer,
  signInWithGoogle, 
  signOutFirebase, 
  onAuthStatusChange,
  loginAdminWithServer,
  verifyAdminServerSession,
  changeAdminServerPassword,
  ensureFirebaseAuthAdmin
} from '../services/firebaseService';
import { auth } from '../firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  X, 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Layers, 
  Megaphone, 
  BellRing, 
  TrendingUp, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Printer, 
  Check, 
  Clock, 
  DollarSign, 
  Users,
  Image as ImageIcon,
  Video,
  Lock,
  KeyRound,
  LogOut,
  UploadCloud,
  Film,
  Sparkles,
  Star,
  Link as LinkIcon,
  Sliders,
  ArrowUp,
  ArrowDown,
  Tag,
  Cloud,
  CloudCheck,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Calendar,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  FileText,
  ChevronRight,
  Info,
  ExternalLink
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { 
    lang, 
    isAdminOpen, 
    setIsAdminOpen, 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    togglePublishProduct,
    orders, 
    updateOrderStatus, 
    categories, 
    brands,
    sendBroadcastNotification,
    mediaList,
    addMediaItem,
    addMultipleMediaItems,
    deleteMediaItem,
    toggleFeaturedMedia,
    showToast,
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
    isFirebaseConnected,
    syncAllDataToFirebase,
    storeBranding,
    updateStoreBranding
  } = useShop();

  const AUTHORIZED_ADMIN_EMAIL = 'naymulh2005@gmail.com';
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [serverAdminSession, setServerAdminSession] = useState<{ username: string; email: string; token: string } | null>(() => {
    try {
      const saved = sessionStorage.getItem('kb_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Admin Username & Password Authentication State
  const [adminUsername, setAdminUsername] = useState('naymul');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Password Management in Settings
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);

  // Dynamic Store Branding Upload States
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUploadProgress, setLogoUploadProgress] = useState(0);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerUploadProgress, setBannerUploadProgress] = useState(0);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onAuthStatusChange((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // Verify server session token on load/mount
  useEffect(() => {
    const token = serverAdminSession?.token || sessionStorage.getItem('kb_admin_session_token');
    if (token) {
      ensureFirebaseAuthAdmin().catch(() => {});
      verifyAdminServerSession(token).then(res => {
        if (res.valid && res.admin) {
          setServerAdminSession({ username: res.admin.username, email: res.admin.email, token });
        } else {
          sessionStorage.removeItem('kb_admin_session');
          sessionStorage.removeItem('kb_admin_session_token');
          setServerAdminSession(null);
        }
      }).catch(() => {
        // Keep session
      });
    }
  }, []);

  const isVerifiedAdmin = Boolean(
    serverAdminSession ||
    (currentUser && currentUser.email && (
      currentUser.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase() ||
      currentUser.email.toLowerCase() === 'admin@kretarbazar.com'
    ))
  );

  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'hero_slider' | 'header' | 'settings' | 'notifications' | 'media'>('analytics');

  // Order Management Search, Filter & Inspector Modal State
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
  const [orderDateFilter, setOrderDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);

  // Email Notification Audit & Test State
  const [emailStatus, setEmailStatus] = useState<{ configured: boolean; recipient: string; logs: any[] } | null>(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success?: boolean; message?: string; details?: any } | null>(null);

  const fetchEmailStatus = async () => {
    const token = serverAdminSession?.token || sessionStorage.getItem('kb_admin_session_token');
    if (!token) return;
    try {
      const res = await fetch('/api/admin/order-emails', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setEmailStatus({
            configured: data.configured,
            recipient: data.recipient,
            logs: data.logs || []
          });
        }
      }
    } catch {}
  };

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchEmailStatus();
    }
  }, [activeTab]);

  const handleTestEmailDispatch = async () => {
    const token = serverAdminSession?.token || sessionStorage.getItem('kb_admin_session_token');
    if (!token) return;
    setTestingEmail(true);
    setTestEmailResult(null);
    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTestEmailResult(data);
      if (data.success) {
        showToast(lang === 'bn' ? 'টেস্ট ইমেইল সফলভাবে পাঠানো হয়েছে!' : 'Test email dispatched successfully!');
      } else {
        showToast(data.message || (lang === 'bn' ? 'টেস্ট সম্পন্ন হয়েছে' : 'Test finished'), 'info');
      }
      fetchEmailStatus();
    } catch {
      setTestEmailResult({ success: false, message: 'সার্ভারে সংযোগ ব্যর্থ হয়েছে' });
    } finally {
      setTestingEmail(false);
    }
  };

  // Hero Slider Form State
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [slideTitleBn, setSlideTitleBn] = useState('');
  const [slideTitleEn, setSlideTitleEn] = useState('');
  const [slideSubtitleBn, setSlideSubtitleBn] = useState('');
  const [slideSubtitleEn, setSlideSubtitleEn] = useState('');
  const [slideDescBn, setSlideDescBn] = useState('');
  const [slideDescEn, setSlideDescEn] = useState('');
  const [slideCouponCode, setSlideCouponCode] = useState('');
  const [slideImage, setSlideImage] = useState('');
  const [slideBtnTextBn, setSlideBtnTextBn] = useState('');
  const [slideBtnTextEn, setSlideBtnTextEn] = useState('');
  const [slideBtnLink, setSlideBtnLink] = useState('#products');
  const [slideIsActive, setSlideIsActive] = useState(true);
  const [slideBgGradient, setSlideBgGradient] = useState('from-blue-950 via-blue-900 to-indigo-950');

  // Dynamic Header Form State
  const [editingHeaderId, setEditingHeaderId] = useState<string | null>(null);
  const [hdrTitleBn, setHdrTitleBn] = useState('');
  const [hdrTitleEn, setHdrTitleEn] = useState('');
  const [hdrWelcomeBn, setHdrWelcomeBn] = useState('');
  const [hdrWelcomeEn, setHdrWelcomeEn] = useState('');
  const [hdrPromoBn, setHdrPromoBn] = useState('');
  const [hdrPromoEn, setHdrPromoEn] = useState('');
  const [hdrHotline, setHdrHotline] = useState('');
  const [hdrBannerImage, setHdrBannerImage] = useState('');
  const [hdrBtnTextBn, setHdrBtnTextBn] = useState('');
  const [hdrBtnTextEn, setHdrBtnTextEn] = useState('');
  const [hdrBtnLink, setHdrBtnLink] = useState('');
  const [hdrIsActive, setHdrIsActive] = useState(true);

  // Admin Notification Settings Form State
  const [adminEmail, setAdminEmail] = useState(adminNotificationSettings.adminEmail);
  const [adminPhone, setAdminPhone] = useState(adminNotificationSettings.adminPhone);
  const [whatsappNumber, setWhatsappNumber] = useState(adminNotificationSettings.whatsappNumber);
  const [soundEnabled, setSoundEnabled] = useState(adminNotificationSettings.soundEnabled);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(adminNotificationSettings.browserNotificationsEnabled);


  // Media Form State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaTitleBn, setMediaTitleBn] = useState('');
  const [mediaTitleEn, setMediaTitleEn] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaCategory, setMediaCategory] = useState<MediaCategory>('product_photoshoot');
  const [mediaCaptionBn, setMediaCaptionBn] = useState('');
  const [mediaCaptionEn, setMediaCaptionEn] = useState('');
  const [mediaLinkedProduct, setMediaLinkedProduct] = useState('');
  const [mediaIsFeatured, setMediaIsFeatured] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Add/Edit Product Modal Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [pSku, setPSku] = useState('');
  const [pNameBn, setPNameBn] = useState('');
  const [pNameEn, setPNameEn] = useState('');
  const [pCategory, setPCategory] = useState<CategoryId>('baby-care');
  const [pBrand, setPBrand] = useState('Mothercare');
  const [pAgeGroup, setPAgeGroup] = useState<AgeGroup>('6-12m');
  const [pPrice, setPPrice] = useState(1450);
  const [pDiscountPrice, setPDiscountPrice] = useState(1150);
  const [pStock, setPStock] = useState(25);
  const [pDescBn, setPDescBn] = useState('');
  const [pDescEn, setPDescEn] = useState('');
  const [pImageUrl, setPImageUrl] = useState('');
  const [pImagesList, setPImagesList] = useState<string[]>([]);
  const [productUploadProgress, setProductUploadProgress] = useState(0);
  const [productUploadError, setProductUploadError] = useState<string | null>(null);
  const [pColorsText, setPColorsText] = useState('পিচ কোরাল: #FF7F50, সফট পিঙ্ক: #F48FB1');
  const [pVideoUrl, setPVideoUrl] = useState('');
  const [pIsFeatured, setPIsFeatured] = useState(true);
  const [pIsBestSeller, setPIsBestSeller] = useState(false);
  const [pIsNewArrival, setPIsNewArrival] = useState(true);
  const [pIsFlashSale, setPIsFlashSale] = useState(false);

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setPSku(p.sku || '');
    setPNameBn(p.nameBn);
    setPNameEn(p.nameEn);
    setPCategory(p.categoryId);
    setPBrand(p.brand);
    setPAgeGroup(p.ageGroup);
    setPPrice(p.price);
    setPDiscountPrice(p.discountPrice || 0);
    setPStock(p.stock);
    setPDescBn(p.descriptionBn);
    setPDescEn(p.descriptionEn);
    setPImagesList(Array.isArray(p.images) && p.images.length > 0 ? [...p.images] : []);
    setPImageUrl((Array.isArray(p.images) && p.images[0]) || '');
    setProductUploadError(null);
    setProductUploadProgress(0);
    setPColorsText(Array.isArray(p.colors) ? p.colors.map(c => `${c?.nameBn || c?.nameEn || ''}: ${c?.hex || '#000000'}`).join(', ') : '');
    setPVideoUrl(p.videoUrl || '');
    setPIsFeatured(!!p.isFeatured);
    setPIsBestSeller(!!p.isBestSeller);
    setPIsNewArrival(!!p.isNewArrival);
    setPIsFlashSale(!!p.isFlashSale);
    setIsAddModalOpen(true);
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setPSku(`KB-${Date.now().toString().slice(-4)}`);
    setPNameBn('');
    setPNameEn('');
    setPCategory('baby-care');
    setPBrand('Mothercare');
    setPAgeGroup('6-12m');
    setPPrice(1500);
    setPDiscountPrice(1200);
    setPStock(25);
    setPDescBn('');
    setPDescEn('');
    setPImagesList([]);
    setPImageUrl('');
    setProductUploadError(null);
    setProductUploadProgress(0);
    setPColorsText('পিচ কোরাল: #FF7F50, সফট পিঙ্ক: #F48FB1');
    setPVideoUrl('');
    setPIsFeatured(true);
    setPIsBestSeller(false);
    setPIsNewArrival(true);
    setPIsFlashSale(false);
    setIsAddModalOpen(true);
  };

  // Notification Broadcast Form
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');

  // Product Media Upload Refs and State
  const [uploadingProductMedia, setUploadingProductMedia] = useState(false);
  const productImageInputRef = useRef<HTMLInputElement>(null);

  if (!isAdminOpen) return null;

  const handleAdminPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim() || !adminPassword) {
      setAuthError(lang === 'bn' ? 'ব্যবহারকারীর নাম ও পাসওয়ার্ড দিন' : 'Enter username and password');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await loginAdminWithServer(adminUsername.trim(), adminPassword);
      if (res.success && res.token && res.admin) {
        const sess = { username: res.admin.username, email: res.admin.email, token: res.token };
        sessionStorage.setItem('kb_admin_session', JSON.stringify(sess));
        sessionStorage.setItem('kb_admin_session_token', res.token);
        setServerAdminSession(sess);
        try {
          await ensureFirebaseAuthAdmin();
        } catch (fbErr) {
          console.warn('Firebase admin sign-in attempt:', fbErr);
        }
        window.dispatchEvent(new Event('kb_admin_session_updated'));
        setAdminPassword('');
        showToast(lang === 'bn' ? 'অ্যাডমিন লগইন সফল হয়েছে!' : 'Admin authentication verified!');
      } else {
        setAuthError(res.message || (lang === 'bn' ? 'ভুল ব্যবহারকারীর নাম অথবা পাসওয়ার্ড!' : 'Invalid username or password!'));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg || (lang === 'bn' ? 'সার্ভার ভেরিফিকেশনে ত্রুটি হয়েছে।' : 'Server authentication error.'));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const fbUser = await signInWithGoogle();
      if (!fbUser) {
        setAuthError(lang === 'bn' ? 'লগইন সম্পন্ন হয়নি।' : 'Sign-in cancelled.');
        return;
      }
      if (!fbUser.email || fbUser.email.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        setAuthError(
          lang === 'bn'
            ? `অননুমোদিত অ্যাকাউন্ট (${fbUser.email})! শুধুমাত্র অনুমোদিত প্রশাসক (${AUTHORIZED_ADMIN_EMAIL}) এই প্যানেল পরিচালনা করতে পারবেন।`
            : `Unauthorized account (${fbUser.email})! Only the authorized administrator (${AUTHORIZED_ADMIN_EMAIL}) can access this panel.`
        );
        return;
      }
      showToast(lang === 'bn' ? 'অ্যাডমিন ভেরিফিকেশন সফল হয়েছে!' : 'Admin authentication verified!');
    } catch (err: unknown) {
      console.error('Admin Google login error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg || (lang === 'bn' ? 'গুগল সাইন-ইনে ত্রুটি হয়েছে।' : 'Google Sign-in failed.'));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      sessionStorage.removeItem('kb_admin_session');
      sessionStorage.removeItem('kb_admin_session_token');
      setServerAdminSession(null);
      window.dispatchEvent(new Event('kb_admin_session_updated'));
      await signOutFirebase();
      showToast(lang === 'bn' ? 'অ্যাডমিন সেশন সমাপ্ত হয়েছে।' : 'Admin session signed out.');
      setIsAdminOpen(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleDirectProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingProductMedia(true);
    setProductUploadProgress(10);
    setProductUploadError(null);
    try {
      const fileList = Array.from(files) as File[];
      const newUrls: string[] = [];
      let idx = 0;
      for (const file of fileList) {
        if (!file.type.startsWith('image/')) {
          showToast(lang === 'bn' ? `${file.name} কোনো ছবি ফাইল নয়` : `${file.name} is not an image`, 'error');
          continue;
        }
        if (file.size > 15 * 1024 * 1024) {
          showToast(lang === 'bn' ? `${file.name} ১৫ মেগাবাইটের বেশি` : `${file.name} exceeds 15MB`, 'error');
          continue;
        }
        const url = await uploadFileWithProgress(file, 'products/images', (p) => {
          setProductUploadProgress(Math.round(((idx + p / 100) / fileList.length) * 100));
        });
        newUrls.push(url);
        idx++;
      }
      if (newUrls.length > 0) {
        setPImagesList(prev => [...prev, ...newUrls]);
        if (!pImageUrl) setPImageUrl(newUrls[0]);
        showToast(lang === 'bn' ? `${newUrls.length}টি পণ্যের ছবি আপলোড সম্পন্ন হয়েছে!` : `${newUrls.length} photo(s) uploaded successfully!`);
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      setProductUploadError(msg || (lang === 'bn' ? 'ছবি আপলোডে সমস্যা হয়েছে' : 'Image upload failed'));
      showToast(lang === 'bn' ? 'ছবি আপলোডে ত্রুটি হয়েছে' : 'Image upload failed', 'error');
    } finally {
      setUploadingProductMedia(false);
      setProductUploadProgress(0);
      if (productImageInputRef.current) productImageInputRef.current.value = '';
    }
  };

  const handleRemoveProductImage = (idxToRemove: number) => {
    setPImagesList(prev => {
      const updated = prev.filter((_, i) => i !== idxToRemove);
      if (pImageUrl === prev[idxToRemove]) {
        setPImageUrl(updated[0] || '');
      }
      return updated;
    });
  };

  const handleSetPrimaryProductImage = (idxToPrimary: number) => {
    setPImagesList(prev => {
      const item = prev[idxToPrimary];
      const others = prev.filter((_, i) => i !== idxToPrimary);
      setPImageUrl(item);
      return [item, ...others];
    });
    showToast(lang === 'bn' ? 'কভার ছবি নির্ধারণ করা হয়েছে' : 'Set as primary photo');
  };

  // Dedicated Admin Login Gateway
  if (!isVerifiedAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-amber-300/60 text-center space-y-5">
          <button
            onClick={() => {
              setIsAdminOpen(false);
              setAuthError(null);
            }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-amber-300 flex items-center justify-center shadow-lg border border-amber-400/30">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900">
              {lang === 'bn' ? 'প্রশাসক পোর্টাল লগইন' : 'Administrator Portal Login'}
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              {lang === 'bn' 
                ? 'ক্রেতার বাজার কন্ট্রোল প্যানেলে প্রবেশ করতে ইউজারনেম ও পাসওয়ার্ড দিয়ে লগইন করুন।' 
                : 'Enter your administrator username and password to proceed.'}
            </p>
          </div>

          {/* Secure Username & Password Admin Form */}
          <form onSubmit={handleAdminPasswordLogin} className="space-y-3 text-left">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === 'bn' ? 'ব্যবহারকারীর নাম (Username)' : 'Username'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={e => setAdminUsername(e.target.value)}
                  placeholder="naymul"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === 'bn' ? 'অ্যাডমিন পাসওয়ার্ড (Password)' : 'Admin Password'}
              </label>
              <div className="relative">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-3 pr-10 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showAdminPassword ? 'Hide' : 'Show'}
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="text-xs font-bold text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-950 hover:to-indigo-900 text-amber-300 font-black py-3 rounded-2xl text-xs shadow-md transition cursor-pointer border border-amber-400/30 flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{lang === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...'}</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'অ্যাডমিন লগইন করুন' : 'Sign In as Administrator'}</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase">
              {lang === 'bn' ? 'অথবা' : 'or'}
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Google Sign-In Secondary Option for Authorized Account */}
          <button
            type="button"
            onClick={handleAdminGoogleLogin}
            disabled={authLoading}
            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2.5 px-4 rounded-2xl text-xs border border-slate-200 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z" />
              <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 17.4C3.7 21.1 7.5 24 12 24z" />
            </svg>
            <span>{lang === 'bn' ? 'গুগল দিয়ে অ্যাডমিন প্রবেশ' : 'Google Sign-In as Admin'}</span>
          </button>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-slate-500">
              {lang === 'bn' ? 'অনুমোদিত অ্যাডমিন অ্যাকাউন্ট: ' : 'Authorized Administrator: '}
              <strong className="text-slate-800 font-mono">{AUTHORIZED_ADMIN_EMAIL}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const t = TRANSLATIONS[lang];

  // Total Sales Calc
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    // Use pImagesList or fallback
    const finalImages = pImagesList.length > 0 
      ? pImagesList 
      : (pImageUrl ? [pImageUrl] : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80']);

    // Parse colors
    const parsedColors = pColorsText
      .split(',')
      .map(entry => entry.trim())
      .filter(Boolean)
      .map(entry => {
        const parts = entry.split(':');
        const name = parts[0]?.trim() || 'কালার';
        const hex = parts[1]?.trim() || '#FF5722';
        return { nameBn: name, nameEn: name, hex };
      });
    const finalColors = parsedColors.length > 0 ? parsedColors : [{ nameBn: 'ডিফল্ট', nameEn: 'Default', hex: '#FF5722' }];

    const adminToken = serverAdminSession?.token || sessionStorage.getItem('kb_admin_session_token');

    if (editingProduct) {
      const updatedProduct: Product = {
        ...editingProduct,
        sku: pSku || editingProduct.sku,
        nameBn: pNameBn,
        nameEn: pNameEn || pNameBn,
        categoryId: pCategory,
        brand: pBrand,
        ageGroup: pAgeGroup,
        price: pPrice,
        discountPrice: pDiscountPrice || undefined,
        stock: pStock,
        descriptionBn: pDescBn,
        descriptionEn: pDescEn,
        images: finalImages,
        colors: finalColors,
        videoUrl: pVideoUrl || undefined,
        isFeatured: pIsFeatured,
        isBestSeller: pIsBestSeller,
        isNewArrival: pIsNewArrival,
        isFlashSale: pIsFlashSale
      };
      updateProduct(updatedProduct);
      if (adminToken) {
        syncProductToServer(adminToken, updatedProduct).catch(console.warn);
      }
      showToast(lang === 'bn' ? 'পণ্য সফলভাবে আপডেট ও ক্লাউডে সিঙ্ক হয়েছে!' : 'Product updated and synced to Cloud!');
    } else {
      const newProductPayload = {
        sku: pSku || `KB-${Date.now().toString().slice(-4)}`,
        nameBn: pNameBn,
        nameEn: pNameEn || pNameBn,
        categoryId: pCategory,
        brand: pBrand,
        price: pPrice,
        discountPrice: pDiscountPrice || undefined,
        stock: pStock,
        isPublished: true,
        isFeatured: pIsFeatured,
        isBestSeller: pIsBestSeller,
        isNewArrival: pIsNewArrival,
        isFlashSale: pIsFlashSale,
        ageGroup: pAgeGroup,
        ageTextBn: pAgeGroup === '6-12m' ? '৬-১২ মাস' : pAgeGroup === '1-2y' ? '১-২ বছর' : '২-৪ বছর',
        ageTextEn: pAgeGroup,
        sizes: ['S', 'M', 'L'],
        colors: finalColors,
        descriptionBn: pDescBn,
        descriptionEn: pDescEn,
        specifications: [{ keyBn: 'উপাদান', keyEn: 'Material', valueBn: '১০০% সফট কটন', valueEn: '100% Cotton' }],
        images: finalImages,
        videoUrl: pVideoUrl || undefined,
        faqs: []
      };
      addProduct(newProductPayload);
      if (adminToken) {
        syncProductToServer(adminToken, {
          ...newProductPayload,
          id: 'p_' + Date.now(),
          sku: newProductPayload.sku,
          rating: 5.0,
          reviewCount: 1,
          reviews: [],
          salesCount: 0
        }).catch(console.warn);
      }
      showToast(lang === 'bn' ? 'নতুন পণ্য সফলভাবে যোগ ও ক্লাউডে সিঙ্ক হয়েছে!' : 'New product created and synced to Cloud!');
    }

    setIsAddModalOpen(false);
    setEditingProduct(null);
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast(lang === 'bn' ? 'অনুগ্রহ করে ছবি ফাইল আপলোড করুন' : 'Please select an image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast(lang === 'bn' ? 'লোগোর সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে পারে' : 'Logo size must be under 5MB', 'error');
      return;
    }
    setUploadingLogo(true);
    setLogoUploadProgress(15);
    try {
      const url = await uploadFileWithProgress(file, 'branding/logo', (p) => setLogoUploadProgress(p));
      await updateStoreBranding({ logoUrl: url });
      showToast(lang === 'bn' ? 'মাস্টার লোগো সফলভাবে ক্লাউডে সেভ ও লাইভ আপডেট হয়েছে!' : 'Master logo updated successfully!');
    } catch (err: unknown) {
      console.error(err);
      showToast(lang === 'bn' ? 'লোগো আপলোডে ত্রুটি হয়েছে' : 'Logo upload failed', 'error');
    } finally {
      setUploadingLogo(false);
      setLogoUploadProgress(0);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast(lang === 'bn' ? 'অনুগ্রহ করে ছবি ফাইল আপলোড করুন' : 'Please select an image file', 'error');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast(lang === 'bn' ? 'ব্যানারের সাইজ সর্বোচ্চ ৮ মেগাবাইট হতে পারে' : 'Banner size must be under 8MB', 'error');
      return;
    }
    setUploadingBanner(true);
    setBannerUploadProgress(15);
    try {
      const url = await uploadFileWithProgress(file, 'branding/hero-banner', (p) => setBannerUploadProgress(p));
      await updateStoreBranding({ heroBannerUrl: url });
      showToast(lang === 'bn' ? 'প্রমোশনাল হিরো ব্যানার সফলভাবে ক্লাউডে সেভ ও লাইভ আপডেট হয়েছে!' : 'Hero banner updated successfully!');
    } catch (err: unknown) {
      console.error(err);
      showToast(lang === 'bn' ? 'ব্যানার আপলোডে ত্রুটি হয়েছে' : 'Banner upload failed', 'error');
    } finally {
      setUploadingBanner(false);
      setBannerUploadProgress(0);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordChangeError(lang === 'bn' ? 'নতুন পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError(lang === 'bn' ? 'নতুন পাসওয়ার্ড দুটি মিলছে না।' : 'Passwords do not match.');
      return;
    }
    const token = serverAdminSession?.token || sessionStorage.getItem('kb_admin_session_token');
    if (!token) {
      setPasswordChangeError(lang === 'bn' ? 'সেশন শেষ হয়েছে, পুনরায় লগইন করুন।' : 'Session expired. Please log in again.');
      return;
    }
    setIsChangingPassword(true);
    setPasswordChangeError(null);
    setPasswordChangeSuccess(null);
    try {
      const res = await changeAdminServerPassword(token, oldPassword, newPassword);
      if (res.success) {
        setPasswordChangeSuccess(lang === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' : 'Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        showToast(lang === 'bn' ? 'অ্যাডমিন পাসওয়ার্ড পরিবর্তিত হয়েছে' : 'Admin password updated');
      } else {
        setPasswordChangeError(res.message || (lang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।' : 'Failed to change password.'));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPasswordChangeError(msg || 'Error changing password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRemoveYouTubeVideo = () => {
    setPVideoUrl('');
    showToast(lang === 'bn' ? 'ভিডিও লিংক রিমুভ করা হয়েছে' : 'Video link removed', 'info');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    showToast(lang === 'bn' ? 'ফাইলগুলো ফায়ারবেসে আপলোড হচ্ছে...' : 'Uploading files to Firebase...', 'info');
    
    try {
      const newItems: Omit<MediaItem, 'id' | 'createdAt' | 'viewsCount' | 'likesCount'>[] = [];
      const fileList = Array.from(files) as File[];
      for (const file of fileList) {
        const isVid = file.type.startsWith('video/');
        const uploadedUrl = await uploadMediaFile(file, isVid ? 'media/videos' : 'media/images');
        
        newItems.push({
          type: isVid ? 'video' : 'image',
          url: uploadedUrl,
          thumbnailUrl: isVid ? uploadedUrl : undefined,
          titleBn: mediaTitleBn.trim() || file.name.split('.')[0] || 'নতুন মিডিয়া আপলোড',
          titleEn: mediaTitleEn.trim() || file.name.split('.')[0] || 'New Media Upload',
          category: mediaCategory,
          captionBn: mediaCaptionBn,
          captionEn: mediaCaptionEn,
          linkedProductId: mediaLinkedProduct || undefined,
          isFeatured: mediaIsFeatured
        });
      }

      addMultipleMediaItems(newItems);
      setMediaTitleBn('');
      setMediaTitleEn('');
      setMediaCaptionBn('');
      setMediaCaptionEn('');
      setMediaUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('File upload error:', error);
      showToast(lang === 'bn' ? 'আপলোডে সমস্যা হয়েছে' : 'Upload error', 'error');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleAddMediaByUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl.trim()) return;

    addMediaItem({
      type: mediaType,
      url: mediaUrl.trim(),
      thumbnailUrl: mediaType === 'video' ? mediaUrl.trim() : undefined,
      titleBn: mediaTitleBn.trim() || (mediaType === 'video' ? 'নতুন ভিডিও' : 'নতুন ছবি'),
      titleEn: mediaTitleEn.trim() || (mediaType === 'video' ? 'New Video' : 'New Image'),
      category: mediaCategory,
      captionBn: mediaCaptionBn,
      captionEn: mediaCaptionEn,
      linkedProductId: mediaLinkedProduct || undefined,
      isFeatured: mediaIsFeatured
    });

    setMediaTitleBn('');
    setMediaTitleEn('');
    setMediaCaptionBn('');
    setMediaCaptionEn('');
    setMediaUrl('');
  };

  const handleBroadcastNotif = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMsg) return;
    sendBroadcastNotification(notifTitle, notifTitle, notifMsg, notifMsg);
    setNotifTitle('');
    setNotifMsg('');
  };

  const handleEditSlide = (slide: any) => {
    setEditingSlideId(slide.id);
    setSlideTitleBn(slide.titleBn);
    setSlideTitleEn(slide.titleEn);
    setSlideSubtitleBn(slide.subtitleBn || '');
    setSlideSubtitleEn(slide.subtitleEn || '');
    setSlideDescBn(slide.descriptionBn || '');
    setSlideDescEn(slide.descriptionEn || '');
    setSlideCouponCode(slide.couponCode || '');
    setSlideImage(slide.image);
    setSlideBtnTextBn(slide.buttonTextBn || '');
    setSlideBtnTextEn(slide.buttonTextEn || '');
    setSlideBtnLink(slide.buttonLink || '#products');
    setSlideIsActive(slide.isActive);
    setSlideBgGradient(slide.bgGradient || 'from-blue-950 via-blue-900 to-indigo-950');
  };

  const resetSlideForm = () => {
    setEditingSlideId(null);
    setSlideTitleBn('');
    setSlideTitleEn('');
    setSlideSubtitleBn('');
    setSlideSubtitleEn('');
    setSlideDescBn('');
    setSlideDescEn('');
    setSlideCouponCode('');
    setSlideImage('');
    setSlideBtnTextBn('এখনই শপ করুন');
    setSlideBtnTextEn('Shop Now');
    setSlideBtnLink('#products');
    setSlideIsActive(true);
    setSlideBgGradient('from-blue-950 via-blue-900 to-indigo-950');
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlideId) {
      updateHeroSlide({
        id: editingSlideId,
        titleBn: slideTitleBn,
        titleEn: slideTitleEn || slideTitleBn,
        subtitleBn: slideSubtitleBn,
        subtitleEn: slideSubtitleEn || slideSubtitleBn,
        descriptionBn: slideDescBn,
        descriptionEn: slideDescEn || slideDescBn,
        couponCode: slideCouponCode,
        image: slideImage || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
        buttonTextBn: slideBtnTextBn || 'এখনই শপ করুন',
        buttonTextEn: slideBtnTextEn || 'Shop Now',
        buttonLink: slideBtnLink || '#products',
        isActive: slideIsActive,
        bgGradient: slideBgGradient
      });
    } else {
      addHeroSlide({
        titleBn: slideTitleBn || 'আপনার সোনামণির জন্য সবচেয়ে নিরাপদ ও প্রিমিয়াম কালেকশন',
        titleEn: slideTitleEn || 'Safe, Gentle & Premium Collection',
        subtitleBn: slideSubtitleBn || '👶 বাচ্চাদের সেরা পছন্দ',
        subtitleEn: slideSubtitleEn || '👶 Best Choice for Little Ones',
        descriptionBn: slideDescBn || '১০০% বিশুদ্ধ সুতির জামা, মন্টেসরি লার্নিং খেলনা ও হাইজেনিক স্কিন কেয়ার',
        descriptionEn: slideDescEn || '100% Cotton Clothes, Educational Toys & Skincare',
        couponCode: slideCouponCode,
        image: slideImage || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
        buttonTextBn: slideBtnTextBn || 'এখনই শপ করুন',
        buttonTextEn: slideBtnTextEn || 'Shop Now',
        buttonLink: slideBtnLink || '#products',
        isActive: slideIsActive,
        bgGradient: slideBgGradient
      });
    }
    resetSlideForm();
  };

  const handleMoveSlideUp = (index: number) => {
    if (index === 0) return;
    const newSlides = [...heroSlides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[index - 1];
    newSlides[index - 1] = temp;
    reorderHeroSlides(newSlides);
  };

  const handleMoveSlideDown = (index: number) => {
    if (index === heroSlides.length - 1) return;
    const newSlides = [...heroSlides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[index + 1];
    newSlides[index + 1] = temp;
    reorderHeroSlides(newSlides);
  };

  const handleEditHeader = (hdr: HeaderConfig) => {
    setEditingHeaderId(hdr.id);
    setHdrTitleBn(hdr.titleBn);
    setHdrTitleEn(hdr.titleEn);
    setHdrWelcomeBn(hdr.welcomeMessageBn);
    setHdrWelcomeEn(hdr.welcomeMessageEn);
    setHdrPromoBn(hdr.promoAnnouncementBn);
    setHdrPromoEn(hdr.promoAnnouncementEn);
    setHdrHotline(hdr.hotlinePhone);
    setHdrBannerImage(hdr.bannerImage);
    setHdrBtnTextBn(hdr.buttonTextBn);
    setHdrBtnTextEn(hdr.buttonTextEn);
    setHdrBtnLink(hdr.buttonLink);
    setHdrIsActive(hdr.isActive);
  };

  const resetHeaderForm = () => {
    setEditingHeaderId(null);
    setHdrTitleBn('');
    setHdrTitleEn('');
    setHdrWelcomeBn('');
    setHdrWelcomeEn('');
    setHdrPromoBn('');
    setHdrPromoEn('');
    setHdrHotline('');
    setHdrBannerImage('');
    setHdrBtnTextBn('');
    setHdrBtnTextEn('');
    setHdrBtnLink('#products');
    setHdrIsActive(true);
  };

  const handleSaveHeaderConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHeaderId) {
      updateHeaderConfig({
        id: editingHeaderId,
        titleBn: hdrTitleBn,
        titleEn: hdrTitleEn,
        welcomeMessageBn: hdrWelcomeBn,
        welcomeMessageEn: hdrWelcomeEn,
        promoAnnouncementBn: hdrPromoBn,
        promoAnnouncementEn: hdrPromoEn,
        hotlinePhone: hdrHotline,
        bannerImage: hdrBannerImage || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=1200',
        buttonTextBn: hdrBtnTextBn || 'আজই কেনাকাটা করুন',
        buttonTextEn: hdrBtnTextEn || 'Shop Now',
        buttonLink: hdrBtnLink || '#products',
        isActive: hdrIsActive
      });
    } else {
      addHeaderConfig({
        titleBn: hdrTitleBn || 'ক্রেতার বাজার কিডস এন্ড বেবি ক্যাফে',
        titleEn: hdrTitleEn || 'Kretar Bazar Kids & Baby Store',
        welcomeMessageBn: hdrWelcomeBn || 'স্বাগতম! আপনার সোনামণির সেরা পোশাক ও খেলনার নির্ভরযোগ্য গন্তব্য',
        welcomeMessageEn: hdrWelcomeEn || 'Welcome! Your trusted shop for premium kids clothing & toys',
        promoAnnouncementBn: hdrPromoBn || '🔥 মেগা সেল! সকল পণ্যে ৩০% পর্যন্ত বিশেষ ছাড় ও ফাস্ট ক্যাশ অন ডেলিভারি!',
        promoAnnouncementEn: hdrPromoEn || '🔥 Mega Sale! Up to 30% discount & Express Cash on Delivery!',
        hotlinePhone: hdrHotline || '01700000000',
        bannerImage: hdrBannerImage || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=1200',
        buttonTextBn: hdrBtnTextBn || 'আজই কেনাকাটা করুন',
        buttonTextEn: hdrBtnTextEn || 'Shop Now',
        buttonLink: hdrBtnLink || '#products',
        isActive: hdrIsActive
      });
    }
    resetHeaderForm();
  };

  const handleSaveNotificationSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminNotificationSettings({
      adminEmail,
      adminPhone,
      whatsappNumber,
      soundEnabled,
      browserNotificationsEnabled
    });
  };

  const handleTestRealtimeAlert = () => {
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
    } catch {}

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('🔔 রিয়েল-টাইম নোটিফিকেশন টেস্ট', {
          body: `অ্যাডমিন ফোন: ${adminPhone} - ইমেইল: ${adminEmail}`,
          icon: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(p => {
          if (p === 'granted') {
            new Notification('🔔 রিয়েল-টাইম নোটিফিকেশন টেস্ট', {
              body: `অ্যাডমিন ফোন: ${adminPhone} - ইমেইল: ${adminEmail}`,
              icon: '/favicon.ico'
            });
          }
        });
      }
    }

    showToast(lang === 'bn' ? 'সাউন্ড ও রিয়েল-টাইম নোটিফিকেশন টেস্ট করা হয়েছে!' : 'Test alert triggered successfully!');
  };


  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full my-auto overflow-hidden shadow-2xl relative border border-slate-200 max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 text-amber-200 border-b border-amber-500/30 flex items-center justify-between shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <MasterLogo size="md" variant="full" />
            <div className="pl-3 border-l border-amber-500/30 flex items-center gap-2">
              <span className="bg-amber-400 text-blue-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Happy Control Panel
              </span>
              <div 
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                  isFirebaseConnected 
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' 
                    : 'bg-amber-950 text-amber-300 border-amber-500/40'
                }`}
                title="Firebase Firestore & Storage Realtime Status"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isFirebaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                <span>{isFirebaseConnected ? 'Firebase Live' : 'Connecting Cloud...'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={syncAllDataToFirebase}
              className="flex items-center gap-1.5 text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 px-2.5 py-1 rounded-xl transition cursor-pointer"
              title="Firebase এ সম্পূর্ণ ডাটা সিঙ্ক করুন"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ক্লাউড সিঙ্ক</span>
            </button>
            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1 text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-xl transition cursor-pointer"
              title="Lock/Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
            <button
              onClick={() => setIsAdminOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar Tabs */}
        <div className="bg-slate-100 px-4 pt-2 border-b border-slate-200 flex items-center gap-1 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'analytics' ? 'bg-white text-pink-600 border-t-2 border-pink-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t.adminAnalyticsTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'products' ? 'bg-white text-pink-600 border-t-2 border-pink-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{t.adminProductsTab} ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'orders' ? 'bg-white text-pink-600 border-t-2 border-pink-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t.adminOrdersTab} ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('hero_slider')}
            className={`px-3.5 py-2 font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'hero_slider' ? 'bg-white text-amber-600 border-t-2 border-amber-500' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
            <span>হিরো স্লাইডার ({heroSlides.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('header')}
            className={`px-3.5 py-2 font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'header' ? 'bg-white text-blue-600 border-t-2 border-blue-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
            <span>হেডার সেটিং</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'settings' ? 'bg-white text-emerald-600 border-t-2 border-emerald-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BellRing className="w-3.5 h-3.5 text-emerald-600" />
            <span>ফোন ও নোটিফিকেশন</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3.5 py-2 font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'notifications' ? 'bg-white text-pink-600 border-t-2 border-pink-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>{t.adminNotificationsTab}</span>
          </button>


          <button
            onClick={() => setActiveTab('media')}
            className={`px-3.5 py-2 font-bold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'media' ? 'bg-white text-amber-600 border-t-2 border-amber-500' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.adminMediaTab} ({mediaList.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700">
          
          {/* Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-pink-50 border border-pink-100 p-4 rounded-2xl">
                  <p className="text-[11px] font-bold text-pink-700">মোট বিক্রয় (Revenue)</p>
                  <p className="text-xl font-black text-pink-600 mt-1">৳{totalRevenue}</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                  <p className="text-[11px] font-bold text-emerald-700">মোট অর্ডার (Orders)</p>
                  <p className="text-xl font-black text-emerald-600 mt-1">{orders.length} টি</p>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                  <p className="text-[11px] font-bold text-amber-700">মোট পণ্য (Products)</p>
                  <p className="text-xl font-black text-amber-600 mt-1">{products.length} টি</p>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
                  <p className="text-[11px] font-bold text-indigo-700">কাস্টমার সংখ্যা</p>
                  <p className="text-xl font-black text-indigo-600 mt-1">১০,০০০+</p>
                </div>
              </div>

              {/* Order Status Breakdown */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="font-extrabold text-slate-800 text-xs">সাম্প্রতিক অর্ডার ট্র্যাকিং বিশ্লেষণ</h4>
                <div className="divide-y divide-slate-100">
                  {orders.map(o => (
                    <div key={o.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">#{o.id}</span> - <span className="text-slate-600">{o.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-pink-600">৳{o.total}</span>
                        <span className="uppercase text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-200">
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Products Manager */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-800 text-sm">পণ্য তালিকা ({products.length})</h4>
                <button
                  onClick={openAddProduct}
                  className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addProduct}</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {products.map(p => (
                  <div key={p.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={(Array.isArray(p.images) && p.images.find(img => typeof img === 'string' && img.trim().length > 0)) || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80'} 
                        alt="" 
                        className="w-12 h-12 object-cover rounded-xl shrink-0" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h5 className="font-bold text-slate-800 text-xs truncate">{p.nameBn}</h5>
                          {p.isFeatured && <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded">Featured</span>}
                          {p.isBestSeller && <span className="bg-indigo-100 text-indigo-800 text-[9px] font-black px-1.5 py-0.5 rounded">Best Seller</span>}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {p.brand} | বয়স: {p.ageTextBn} | ছবি: {(p.images || []).length}টি | কালার: {(p.colors || []).length}টি | স্টক: {p.stock ?? 0}টি
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-extrabold text-pink-600">৳{p.discountPrice || p.price}</span>

                      {/* Publish Toggle */}
                      <button
                        onClick={() => togglePublishProduct(p.id)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          p.isPublished ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                        title={p.isPublished ? 'Published' : 'Hidden'}
                      >
                        {p.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => openEditProduct(p)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                        title="Edit Product & Variants"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Manager */}
          {activeTab === 'orders' && (() => {
            const pendingCount = orders.filter(o => o.status === 'pending').length;
            const processingCount = orders.filter(o => o.status === 'processing').length;
            const shippedCount = orders.filter(o => o.status === 'shipped').length;
            const deliveredCount = orders.filter(o => o.status === 'delivered').length;
            const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

            const filteredOrders = orders.filter(order => {
              if (orderSearchQuery.trim()) {
                const q = orderSearchQuery.toLowerCase().trim();
                const matchId = (order.id || '').toLowerCase().includes(q);
                const matchTracking = (order.trackingNumber || '').toLowerCase().includes(q);
                const matchName = (order.customerName || '').toLowerCase().includes(q);
                const matchPhone = (order.customerPhone || '').toLowerCase().includes(q);
                const matchEmail = (order.customerEmail || '').toLowerCase().includes(q);
                if (!matchId && !matchTracking && !matchName && !matchPhone && !matchEmail) return false;
              }

              if (orderStatusFilter !== 'all' && order.status !== orderStatusFilter) {
                return false;
              }

              if (orderDateFilter !== 'all') {
                const orderDateStr = order.createdAt || order.date;
                const orderDate = new Date(orderDateStr);
                if (!isNaN(orderDate.getTime())) {
                  const now = new Date();
                  const diffHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
                  if (orderDateFilter === 'today' && diffHours > 24) return false;
                  if (orderDateFilter === '7days' && diffHours > 24 * 7) return false;
                  if (orderDateFilter === '30days' && diffHours > 24 * 30) return false;
                }
              }

              return true;
            });

            return (
              <div className="space-y-4">
                {/* Orders Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-pink-600" />
                      <span>সকল কাস্টমার অর্ডার ({filteredOrders.length}{filteredOrders.length !== orders.length ? ` / মোট ${orders.length}` : ''}টি)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">গেস্ট ও রেজিস্টার্ড উভয় গ্রাহকের অর্ডার ফায়ারবেস ক্লাউডের সাথে রিয়েল-টাইমে সিঙ্ক হচ্ছে।</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>রিয়েল-টাইম সিঙ্ক সক্রিয়</span>
                    </span>
                  </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={orderSearchQuery}
                        onChange={e => setOrderSearchQuery(e.target.value)}
                        placeholder="অর্ডার আইডি, কাস্টমার নাম, ফোন বা ইমেইল দিয়ে খুঁজুন..."
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold focus:outline-none focus:border-pink-500"
                      />
                      {orderSearchQuery && (
                        <button
                          onClick={() => setOrderSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                          title="সার্চ মুছুন"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Date Filter */}
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                      <button
                        onClick={() => setOrderDateFilter('all')}
                        className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                          orderDateFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        সব
                      </button>
                      <button
                        onClick={() => setOrderDateFilter('today')}
                        className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                          orderDateFilter === 'today' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        আজকে
                      </button>
                      <button
                        onClick={() => setOrderDateFilter('7days')}
                        className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                          orderDateFilter === '7days' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        ৭ দিন
                      </button>
                      <button
                        onClick={() => setOrderDateFilter('30days')}
                        className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                          orderDateFilter === '30days' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        ৩০ দিন
                      </button>
                    </div>
                  </div>

                  {/* Status Filter Buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                    <button
                      onClick={() => setOrderStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition cursor-pointer ${
                        orderStatusFilter === 'all'
                          ? 'bg-pink-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      সব অর্ডার ({orders.length})
                    </button>
                    <button
                      onClick={() => setOrderStatusFilter('pending')}
                      className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition cursor-pointer ${
                        orderStatusFilter === 'pending'
                          ? 'bg-amber-500 text-blue-950 shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      অপেক্ষমাণ ({pendingCount})
                    </button>
                    <button
                      onClick={() => setOrderStatusFilter('processing')}
                      className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition cursor-pointer ${
                        orderStatusFilter === 'processing'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      প্রক্রিয়াধীন ({processingCount})
                    </button>
                    <button
                      onClick={() => setOrderStatusFilter('shipped')}
                      className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition cursor-pointer ${
                        orderStatusFilter === 'shipped'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      পাঠানো হয়েছে ({shippedCount})
                    </button>
                    <button
                      onClick={() => setOrderStatusFilter('delivered')}
                      className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition cursor-pointer ${
                        orderStatusFilter === 'delivered'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ডেলিভারি সম্পন্ন ({deliveredCount})
                    </button>
                    <button
                      onClick={() => setOrderStatusFilter('cancelled')}
                      className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition cursor-pointer ${
                        orderStatusFilter === 'cancelled'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      বাতিলকৃত ({cancelledCount})
                    </button>
                  </div>
                </div>

                {/* Orders List Content */}
                {filteredOrders.length === 0 ? (
                  <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center text-slate-400 space-y-2">
                    <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="font-bold text-xs">
                      {orderSearchQuery || orderStatusFilter !== 'all' || orderDateFilter !== 'all'
                        ? 'উক্ত ফিল্টারে কোনো অর্ডার খুঁজে পাওয়া যায়নি।'
                        : 'এখনও কোনো অর্ডার আসেনি।'}
                    </p>
                    {(orderSearchQuery || orderStatusFilter !== 'all' || orderDateFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setOrderSearchQuery('');
                          setOrderStatusFilter('all');
                          setOrderDateFilter('all');
                        }}
                        className="text-pink-600 font-bold text-xs underline cursor-pointer hover:text-pink-700"
                      >
                        ফিল্টার রিসেট করুন
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map(order => {
                      const itemsList = order.itemDetails && order.itemDetails.length > 0
                        ? order.itemDetails
                        : (order.items || []).map(i => ({
                            productId: i.product?.id || 'unknown',
                            nameBn: i.product?.nameBn || 'পণ্য',
                            nameEn: i.product?.nameEn || 'Product',
                            selectedSize: i.selectedSize || 'Standard',
                            selectedColor: i.selectedColor || { nameBn: 'ডিফল্ট', nameEn: 'Default', hex: '#000000' },
                            quantity: i.quantity || 1,
                            unitPrice: i.product?.discountPrice || i.product?.price || 0,
                            totalPrice: (i.product?.discountPrice || i.product?.price || 0) * (i.quantity || 1),
                            image: i.product?.images?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=200&q=80'
                          }));

                      return (
                        <div key={order.id} className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3.5 hover:border-slate-300 transition">
                          
                          {/* Order Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-slate-900 text-sm bg-slate-100 px-2.5 py-1 rounded-lg">
                                #{order.id}
                              </span>
                              <span className="text-slate-400 text-[11px] font-semibold">
                                {order.date}
                              </span>
                              {order.trackingNumber && (
                                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                                  ট্র্যাকিং: {order.trackingNumber}
                                </span>
                              )}
                              {!order.userId ? (
                                <span className="text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  🟢 গেস্ট অর্ডার
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
                                  👤 আইডি: {order.userId}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-500">মোট:</span>
                              <span className="font-black text-pink-600 text-base">৳{order.total}</span>
                            </div>
                          </div>

                          {/* Customer & Shipping Details Card */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl text-xs">
                            <div className="space-y-1">
                              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                                <span>👤</span>
                                <span>{order.customerName}</span>
                              </p>
                              <p className="text-slate-600 font-medium flex items-center gap-1.5">
                                <span>📞</span>
                                <a href={`tel:${order.customerPhone}`} className="text-blue-600 hover:underline">
                                  {order.customerPhone}
                                </a>
                              </p>
                              {order.customerEmail ? (
                                <p className="text-slate-500 text-[11px] flex items-center gap-1.5">
                                  <span>✉️</span>
                                  <span>{order.customerEmail}</span>
                                </p>
                              ) : (
                                <p className="text-slate-400 text-[10px]">✉️ ইমেইল: প্রদান করা হয়নি</p>
                              )}
                            </div>

                            <div className="space-y-1">
                              <p className="text-slate-700 leading-snug">
                                <strong>📍 ঠিকানা:</strong> {order.shippingAddress}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                                <span>
                                  <strong>জোন:</strong> {
                                    order.city === 'inside-dhaka' ? 'ঢাকা সিটির ভেতর' :
                                    order.city === 'outside-dhaka' ? 'ঢাকা সিটির বাইরে' :
                                    order.city === 'express-dhaka' ? 'জরুরি ডেলিভারি' : order.city
                                  }
                                </span>
                                {order.district && <span>• জেলা: {order.district}</span>}
                                {order.area && <span>• এলাকা: {order.area}</span>}
                              </div>
                              <p className="text-slate-500 text-[11px]">
                                <strong>পেমেন্ট:</strong> <span className="uppercase font-bold text-slate-700">{order.paymentMethod}</span> ({order.paymentStatus === 'paid' ? 'পরিশোধিত' : 'অপরিশোধিত'})
                                {order.transactionId && <span className="ml-1 text-slate-400">[{order.transactionId}]</span>}
                              </p>
                            </div>
                          </div>

                          {/* Customer Note if present */}
                          {order.customerNote && (
                            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                              <span className="font-bold shrink-0">📝 বিশেষ নোট:</span>
                              <span className="text-[11px]">{order.customerNote}</span>
                            </div>
                          )}

                          {/* Product Items Breakdown */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <h6 className="font-extrabold text-slate-700 uppercase tracking-wider">
                                অর্ডারকৃত পণ্য ({itemsList.length}টি আইটেম):
                              </h6>
                            </div>
                            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                              {itemsList.map((item, idx) => (
                                <div key={idx} className="p-2.5 flex items-center justify-between gap-3 text-xs">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <img 
                                      src={(typeof item.image === 'string' && item.image.trim()) || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80'} 
                                      alt="" 
                                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0 bg-white" 
                                    />
                                    <div className="min-w-0">
                                      <p className="font-bold text-slate-800 truncate">
                                        {item.nameBn || item.nameEn}
                                      </p>
                                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 flex-wrap">
                                        {item.selectedSize && (
                                          <span className="bg-slate-200/80 px-1.5 py-0.2 rounded font-semibold text-slate-700">
                                            সাইজ: {item.selectedSize}
                                          </span>
                                        )}
                                        {item.selectedColor && (
                                          <span className="inline-flex items-center gap-1 bg-slate-200/80 px-1.5 py-0.2 rounded font-semibold text-slate-700">
                                            <span 
                                              className="w-2 h-2 rounded-full border border-black/20" 
                                              style={{ backgroundColor: item.selectedColor.hex || '#000000' }}
                                            ></span>
                                            <span>{item.selectedColor.nameBn || item.selectedColor.nameEn}</span>
                                          </span>
                                        )}
                                        <span>পরিমাণ: <strong>{item.quantity}টি</strong></span>
                                        <span>দর: ৳{item.unitPrice}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <span className="font-extrabold text-slate-800 shrink-0">
                                    ৳{item.totalPrice || (item.unitPrice * item.quantity)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Financial Summary */}
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span>সাবটোটাল: <strong>৳{order.subtotal}</strong></span>
                              <span>ডেলিভারি ফি: <strong>৳{order.shippingCost}</strong></span>
                              {order.discountAmount > 0 && (
                                <span className="text-emerald-600 font-bold">ডিসকাউন্ট: -৳{order.discountAmount}</span>
                              )}
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-800">সর্বমোট: ৳{order.total}</span>
                            </div>
                          </div>

                          {/* Action Footer: Details Modal & Status Changer */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedOrderForModal(order)}
                                className="bg-slate-900 hover:bg-pink-600 text-white font-bold py-1.5 px-3 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>পূর্ণাঙ্গ চালান ও বিবরণ</span>
                              </button>

                              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                                order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'processing' ? 'bg-amber-100 text-amber-800' :
                                order.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                                'bg-slate-200 text-slate-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-slate-500">স্ট্যাটাস পরিবর্তন:</span>
                              <select
                                value={order.status}
                                onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-xs focus:outline-none focus:border-pink-500 shadow-xs cursor-pointer"
                              >
                                <option value="pending">Pending (অপেক্ষমাণ)</option>
                                <option value="processing">Processing (প্রক্রিয়াধীন)</option>
                                <option value="shipped">Shipped (পাঠানো হয়েছে)</option>
                                <option value="delivered">Delivered (ডেলিভারি সম্পন্ন)</option>
                                <option value="cancelled">Cancelled (বাতিলকৃত)</option>
                              </select>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Comprehensive Order Details Inspector Modal */}
                {selectedOrderForModal && (() => {
                  const modalOrder = selectedOrderForModal;
                  const modalItems = modalOrder.itemDetails && modalOrder.itemDetails.length > 0
                    ? modalOrder.itemDetails
                    : (modalOrder.items || []).map(i => ({
                        productId: i.product?.id || 'unknown',
                        nameBn: i.product?.nameBn || 'পণ্য',
                        nameEn: i.product?.nameEn || 'Product',
                        selectedSize: i.selectedSize || 'Standard',
                        selectedColor: i.selectedColor || { nameBn: 'ডিফল্ট', nameEn: 'Default', hex: '#000000' },
                        quantity: i.quantity || 1,
                        unitPrice: i.product?.discountPrice || i.product?.price || 0,
                        totalPrice: (i.product?.discountPrice || i.product?.price || 0) * (i.quantity || 1),
                        image: i.product?.images?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=200&q=80'
                      }));

                  return (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
                      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
                        
                        {/* Modal Top Header */}
                        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-black text-base sm:text-lg">অর্ডার বিবরণী #{modalOrder.id}</h3>
                              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                                modalOrder.status === 'delivered' ? 'bg-emerald-500 text-white' :
                                modalOrder.status === 'shipped' ? 'bg-blue-500 text-white' :
                                modalOrder.status === 'processing' ? 'bg-amber-500 text-blue-950' :
                                modalOrder.status === 'cancelled' ? 'bg-rose-500 text-white' :
                                'bg-slate-600 text-white'
                              }`}>
                                {modalOrder.status}
                              </span>
                            </div>
                            <p className="text-slate-400 text-xs mt-0.5">
                              তারিখ: {modalOrder.date} {modalOrder.createdAt ? `• সময়: ${new Date(modalOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => window.print()}
                              className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                              title="চালান প্রিন্ট করুন"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">প্রিন্ট ইনভয়েস</span>
                            </button>
                            <button
                              onClick={() => setSelectedOrderForModal(null)}
                              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
                          
                          {/* Tracking & Account Type Info Banner */}
                          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-slate-700">ট্র্যাকিং নম্বর:</span>
                              <span className="font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
                                {modalOrder.trackingNumber || 'N/A'}
                              </span>
                            </div>

                            <div>
                              {!modalOrder.userId ? (
                                <span className="inline-flex items-center gap-1.5 font-extrabold text-purple-800 bg-purple-50 border border-purple-200 px-3 py-1 rounded-xl">
                                  <span>🟢 গেস্ট অর্ডার</span>
                                  <span className="text-[10px] font-normal text-purple-600">(অ্যাকাউন্ট রেজিস্টার ছাড়াই সরাসরি অর্ডারকৃত)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl">
                                  <span>👤 নিবন্ধিত গ্রাহক অ্যাকাউন্ট</span>
                                  <span className="font-mono text-[10px] text-slate-500">[{modalOrder.userId}]</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Customer & Delivery Full Information */}
                          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
                            <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-pink-600">
                              <MapPin className="w-4 h-4 text-pink-600" />
                              <span>গ্রাহক ও ডেলিভারি সংক্রান্ত পূর্ণাঙ্গ তথ্য</span>
                            </h5>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="space-y-1.5">
                                <div>
                                  <span className="text-slate-400 text-[10px] block font-bold">গ্রাহকের পূর্ণ নাম:</span>
                                  <span className="font-extrabold text-slate-900 text-sm">{modalOrder.customerName}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 text-[10px] block font-bold">যোগাযোগের ফোন নম্বর:</span>
                                  <a href={`tel:${modalOrder.customerPhone}`} className="font-extrabold text-blue-600 text-sm hover:underline">
                                    {modalOrder.customerPhone}
                                  </a>
                                </div>
                                <div>
                                  <span className="text-slate-400 text-[10px] block font-bold">ইমেইল ঠিকানা:</span>
                                  <span className="font-medium text-slate-700">
                                    {modalOrder.customerEmail || <span className="text-slate-400 italic">প্রদান করা হয়নি (Not provided)</span>}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <div>
                                  <span className="text-slate-400 text-[10px] block font-bold">সম্পূর্ণ ডেলিভারি ঠিকানা:</span>
                                  <span className="font-bold text-slate-800 leading-snug block">{modalOrder.shippingAddress}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                                  <div>
                                    <span className="text-slate-400 text-[10px] block font-bold">জেলা / বিভাগ:</span>
                                    <span className="font-semibold text-slate-800">
                                      {modalOrder.district || <span className="text-slate-400 italic">প্রদান করা হয়নি</span>}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 text-[10px] block font-bold">থানা / এলাকা:</span>
                                    <span className="font-semibold text-slate-800">
                                      {modalOrder.area || <span className="text-slate-400 italic">প্রদান করা হয়নি</span>}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 text-[10px] block font-bold">পোস্টাল কোড:</span>
                                    <span className="font-semibold text-slate-800">
                                      {modalOrder.postalCode || <span className="text-slate-400 italic">প্রদান করা হয়নি</span>}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 text-[10px] block font-bold">ডেলিভারি জোন:</span>
                                    <span className="font-semibold text-slate-800">
                                      {modalOrder.city === 'inside-dhaka' ? 'ঢাকা সিটির ভেতর' :
                                       modalOrder.city === 'outside-dhaka' ? 'ঢাকা সিটির বাইরে' :
                                       modalOrder.city === 'express-dhaka' ? 'জরুরি ডেলিভারি' : modalOrder.city}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Customer Notes */}
                            <div className="pt-2 border-t border-slate-200">
                              <span className="text-slate-400 text-[10px] block font-bold">গ্রাহকের বিশেষ নির্দেশনা ও নোট:</span>
                              <p className="text-slate-800 font-medium text-xs mt-0.5 bg-white p-2 rounded-xl border border-slate-200">
                                {modalOrder.customerNote || <span className="text-slate-400 italic">কোনো বিশেষ নির্দেশনা দেওয়া হয়নি (None)</span>}
                              </p>
                            </div>
                          </div>

                          {/* Order Items Detailed Table */}
                          <div className="space-y-2">
                            <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-pink-600">
                              <Package className="w-4 h-4 text-pink-600" />
                              <span>অর্ডারকৃত পণ্য তালিকা ({modalItems.length}টি আইটেম)</span>
                            </h5>

                            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                              <div className="divide-y divide-slate-100">
                                {modalItems.map((item, idx) => (
                                  <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <img
                                        src={(typeof item.image === 'string' && item.image.trim()) || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80'}
                                        alt=""
                                        className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0 bg-white"
                                      />
                                      <div className="min-w-0">
                                        <p className="font-extrabold text-slate-900 text-xs">
                                          {item.nameBn} <span className="font-normal text-slate-500">({item.nameEn})</span>
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                          SKU/ID: {item.productId}
                                        </p>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-1 flex-wrap">
                                          {item.selectedSize && (
                                            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-700">
                                              সাইজ: {item.selectedSize}
                                            </span>
                                          )}
                                          {item.selectedColor && (
                                            <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-700">
                                              <span
                                                className="w-2.5 h-2.5 rounded-full border border-black/20"
                                                style={{ backgroundColor: item.selectedColor.hex || '#000000' }}
                                              ></span>
                                              <span>{item.selectedColor.nameBn || item.selectedColor.nameEn}</span>
                                            </span>
                                          )}
                                          <span className="font-semibold text-slate-500">
                                            দর: ৳{item.unitPrice} × {item.quantity}টি
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                      <span className="font-black text-slate-900 text-sm">
                                        ৳{item.totalPrice || (item.unitPrice * item.quantity)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Payment & Financial Breakdown */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Payment Method Details */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                              <h6 className="font-extrabold text-slate-800 text-xs">পেমেন্ট বিবরণী</h6>
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500">পেমেন্ট মেথড:</span>
                                  <span className="font-extrabold uppercase text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                    {modalOrder.paymentMethod}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500">পেমেন্ট স্ট্যাটাস:</span>
                                  <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                                    modalOrder.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {modalOrder.paymentStatus === 'paid' ? 'পরিশোধিত (Paid)' : 'ক্যাশ অন ডেলিভারি / অপরিশোধিত'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500">ট্রানজেকশন আইডি:</span>
                                  <span className="font-mono text-slate-700">
                                    {modalOrder.transactionId || <span className="text-slate-400 italic">প্রযোজ্য নয় (N/A)</span>}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                              <h6 className="font-extrabold text-slate-800 text-xs">মূল্য ও চার্জ বিবরণী</h6>
                              <div className="space-y-1.5 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500">সাবটোটাল:</span>
                                  <span className="font-bold text-slate-800">৳{modalOrder.subtotal}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500">ডেলিভারি চার্জ:</span>
                                  <span className="font-bold text-slate-800">৳{modalOrder.shippingCost}</span>
                                </div>
                                {modalOrder.discountAmount > 0 && (
                                  <div className="flex items-center justify-between text-emerald-600 font-bold">
                                    <span>কুপন ডিসকাউন্ট:</span>
                                    <span>-৳{modalOrder.discountAmount}</span>
                                  </div>
                                )}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm">
                                  <span className="font-extrabold text-slate-900">সর্বমোট প্রদেয়:</span>
                                  <span className="font-black text-pink-600 text-base">৳{modalOrder.total}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quick Status Updater in Modal */}
                          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-pink-50/50 rounded-2xl border border-pink-100">
                            <div>
                              <span className="font-bold text-slate-800 block text-xs">অর্ডার প্রসেসিং স্ট্যাটাস হালনাগাদ:</span>
                              <span className="text-[11px] text-slate-500">স্ট্যাটাস পরিবর্তন করলে ক্লাউড ও কাস্টমার ট্র্যাকিং-এ তাৎক্ষণিক আপডেট হবে।</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={modalOrder.status}
                                onChange={e => {
                                  const newStatus = e.target.value as OrderStatus;
                                  updateOrderStatus(modalOrder.id, newStatus);
                                  setSelectedOrderForModal(prev => prev ? { ...prev, status: newStatus } : null);
                                }}
                                className="bg-white border border-pink-300 rounded-xl px-3 py-2 font-black text-xs text-slate-800 focus:outline-none focus:border-pink-500 shadow-xs cursor-pointer"
                              >
                                <option value="pending">Pending (অপেক্ষমাণ)</option>
                                <option value="processing">Processing (প্রক্রিয়াধীন)</option>
                                <option value="shipped">Shipped (পাঠানো হয়েছে)</option>
                                <option value="delivered">Delivered (ডেলিভারি সম্পন্ন)</option>
                                <option value="cancelled">Cancelled (বাতিলকৃত)</option>
                              </select>
                            </div>
                          </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
                          <button
                            onClick={() => setSelectedOrderForModal(null)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-5 py-2 rounded-xl text-xs transition cursor-pointer"
                          >
                            বন্ধ করুন
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })()}

              </div>
            );
          })()}

          {/* Dynamic Hero Banner Slider Management */}
          {activeTab === 'hero_slider' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-500" />
                    <span>ডাইনামিক হিরো স্লাইডার ম্যানেজার ({heroSlides.length} টি স্লাইড)</span>
                  </h4>
                  <p className="text-slate-500 text-[11px]">হোমপেজের শীর্ষে প্রদর্শিত স্লাইডগুলো নিয়ন্ত্রণ করুন। সেভ করার সাথে সাথে লাইভ সিঙ্ক হবে।</p>
                </div>
                {editingSlideId && (
                  <button
                    onClick={resetSlideForm}
                    className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    + নতুন স্লাইড যোগ করুন
                  </button>
                )}
              </div>

              {/* Slide List Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {heroSlides.map((slide, idx) => (
                  <div 
                    key={slide.id}
                    className={`p-4 rounded-2xl border transition relative flex flex-col justify-between gap-3 ${
                      slide.isActive 
                        ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/20 shadow-sm' 
                        : 'bg-white border-slate-200 shadow-xs opacity-75'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            slide.isActive ? 'bg-amber-500 text-blue-950' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {slide.isActive ? '🟢 লাইভ এক্টিভ' : 'ইন-এক্টিভ'}
                          </span>
                          <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            স্লাইড #{idx + 1}
                          </span>
                        </div>
                        
                        {/* Up / Down Reorder Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveSlideUp(idx)}
                            disabled={idx === 0}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 transition cursor-pointer"
                            title="উপরে সরান"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveSlideDown(idx)}
                            disabled={idx === heroSlides.length - 1}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 transition cursor-pointer"
                            title="নিচে সরান"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 mt-1">
                        <img 
                          src={(typeof slide.image === 'string' && slide.image.trim()) || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80'} 
                          alt="" 
                          className="w-20 h-16 object-cover rounded-xl border border-slate-200 shrink-0 bg-slate-100"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-extrabold text-slate-900 text-xs truncate">{slide.titleBn}</h5>
                          {slide.subtitleBn && (
                            <p className="text-[11px] font-medium text-amber-700 mt-0.5 truncate">{slide.subtitleBn}</p>
                          )}
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{slide.descriptionBn}</p>
                          
                          {slide.couponCode && (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 border border-amber-200">
                              <Tag className="w-3 h-3 text-amber-600" />
                              কুপন: {slide.couponCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-200/60">
                      <button
                        onClick={() => toggleHeroSlideActive(slide.id)}
                        className={`flex-1 font-bold py-1.5 px-3 rounded-xl text-xs transition cursor-pointer ${
                          slide.isActive 
                            ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' 
                            : 'bg-amber-500 hover:bg-amber-600 text-blue-950 shadow-xs'
                        }`}
                      >
                        {slide.isActive ? 'বন্ধ করুন' : 'লাইভ চালূ করুন'}
                      </button>

                      <button
                        onClick={() => handleEditSlide(slide)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold py-1.5 px-3 rounded-xl text-xs transition cursor-pointer"
                      >
                        এডিট
                      </button>

                      {heroSlides.length > 1 && (
                        <button
                          onClick={() => deleteHeroSlide(slide.id)}
                          className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold p-1.5 rounded-xl text-xs transition cursor-pointer"
                          title="ডিলিট"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Form to Add / Edit Slide */}
              <form onSubmit={handleSaveSlide} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h5 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-500" />
                  <span>{editingSlideId ? 'স্লাইডের তথ্য পরিবর্তন করুন' : 'নতুন হিরো ব্যানার স্লাইড যোগ করুন'}</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">হেডলাইন/টাইটেল (বাংলা) *</label>
                    <input
                      type="text"
                      required
                      value={slideTitleBn}
                      onChange={e => setSlideTitleBn(e.target.value)}
                      placeholder="আপনার সোনামণির জন্য সবচেয়ে নিরাপদ..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">হেডলাইন/টাইটেল (English)</label>
                    <input
                      type="text"
                      value={slideTitleEn}
                      onChange={e => setSlideTitleEn(e.target.value)}
                      placeholder="Safe, Gentle & Premium Collection..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">সাব-টাইটেল/ট্যাগ (বাংলা)</label>
                    <input
                      type="text"
                      value={slideSubtitleBn}
                      onChange={e => setSlideSubtitleBn(e.target.value)}
                      placeholder="👶 ৬ মাস - ১০ বছরের বাচ্চাদের সেরা পছন্দ"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">সাব-টাইটেল/ট্যাগ (English)</label>
                    <input
                      type="text"
                      value={slideSubtitleEn}
                      onChange={e => setSlideSubtitleEn(e.target.value)}
                      placeholder="👶 Best Choice for Ages 6m - 10y"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">বর্ণনা/হাইলাইটস (বাংলা)</label>
                    <textarea
                      rows={2}
                      value={slideDescBn}
                      onChange={e => setSlideDescBn(e.target.value)}
                      placeholder="১০০% বিশুদ্ধ সুতির জামা, মন্টেসরি লার্নিং খেলনা ও হাইজেনিক স্কিন কেয়ার..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">বর্ণনা/হাইলাইটস (English)</label>
                    <textarea
                      rows={2}
                      value={slideDescEn}
                      onChange={e => setSlideDescEn(e.target.value)}
                      placeholder="100% Organic Cotton Clothes, Educational Toys..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">কুপন কোড/অফার ব্যাজ (অপশনাল)</label>
                    <input
                      type="text"
                      value={slideCouponCode}
                      onChange={e => setSlideCouponCode(e.target.value)}
                      placeholder="যেমন: SAVE30, KRETA10"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">বাটন টেক্সট (বাংলা)</label>
                    <input
                      type="text"
                      value={slideBtnTextBn}
                      onChange={e => setSlideBtnTextBn(e.target.value)}
                      placeholder="এখনই শপ করুন"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">বাটন লিঙ্ক/ট্রিগার</label>
                    <input
                      type="text"
                      value={slideBtnLink}
                      onChange={e => setSlideBtnLink(e.target.value)}
                      placeholder="#products বা পেজ লিংক"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">ব্যানার ইমেজ লিংক (Image URL) *</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      value={slideImage}
                      onChange={e => setSlideImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                    
                    {/* Quick Image Presets */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-bold">ডেমো ছবি দ্রুত সিলেক্ট করুন:</span>
                      <button
                        type="button"
                        onClick={() => setSlideImage('https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80')}
                        className="text-[10px] font-bold bg-white border border-slate-200 hover:border-amber-400 px-2.5 py-1 rounded-lg text-slate-700 transition cursor-pointer"
                      >
                        👶 Baby Cotton
                      </button>
                      <button
                        type="button"
                        onClick={() => setSlideImage('https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1000&q=80')}
                        className="text-[10px] font-bold bg-white border border-slate-200 hover:border-amber-400 px-2.5 py-1 rounded-lg text-slate-700 transition cursor-pointer"
                      >
                        🧸 Montessori Toys
                      </button>
                      <button
                        type="button"
                        onClick={() => setSlideImage('https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1000&q=80')}
                        className="text-[10px] font-bold bg-white border border-slate-200 hover:border-amber-400 px-2.5 py-1 rounded-lg text-slate-700 transition cursor-pointer"
                      >
                        👗 Newborn Fashion
                      </button>
                      <button
                        type="button"
                        onClick={() => setSlideImage('https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1000&q=80')}
                        className="text-[10px] font-bold bg-white border border-slate-200 hover:border-amber-400 px-2.5 py-1 rounded-lg text-slate-700 transition cursor-pointer"
                      >
                        👟 Baby Shoes
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="slideIsActiveCb"
                    checked={slideIsActive}
                    onChange={e => setSlideIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                  />
                  <label htmlFor="slideIsActiveCb" className="font-bold text-slate-800 text-xs cursor-pointer">
                    তাতক্ষনিকভাবে ওয়েবসাইটের সকল ইউজারের জন্য এই স্লাইডটি লাইভ এক্টিভ রাখুন
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-blue-950 font-black py-2.5 px-6 rounded-xl text-xs shadow-md transition cursor-pointer"
                  >
                    {editingSlideId ? 'স্লাইড আপডেট করুন' : 'নতুন স্লাইড সেভ করুন'}
                  </button>
                  {editingSlideId && (
                    <button
                      type="button"
                      onClick={resetSlideForm}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
                    >
                      বাতিল
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Dynamic Header Management */}
          {activeTab === 'header' && (
            <div className="space-y-6">
              {/* Master Logo & Promotional Hero Banner Direct Upload Section */}
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-100/30 to-amber-500/5 p-5 rounded-3xl border border-amber-300 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h5 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>স্টোর ব্র্যান্ডিং অ্যাসেট (মাস্টার লোগো ও প্রমোশনাল হিরো ব্যানার)</span>
                    </h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      এখানে আপলোড করা লোগো ও ব্যানার সাথে সাথে পুরো ওয়েবসাইটে সকল ডিভাইসের ব্যবহারকারীদের জন্য লাইভ প্রদর্শিত হবে।
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-200">
                    ফায়ারবেস ক্লাউড সিঙ্ক
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Master Logo Box */}
                  <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-slate-800 text-xs">
                          মাস্টার লোগো (Master Logo)
                        </span>
                        <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          📐 1:1 স্কয়ার (512 x 512 px)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-3">
                        ওয়েবসাইটের হেডার, মোবাইল বার ও ব্র্যান্ড মার্ক হিসেবে ব্যবহৃত হয়।
                      </p>

                      {/* Current Preview */}
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="h-16 min-w-16 max-w-32 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 p-1 shadow-sm flex items-center justify-center">
                          <MasterLogo size="lg" variant="emblem" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {storeBranding.logoUrl ? 'কাস্টম আপলোডেড লোগো' : 'ডিফল্ট মাস্টার লোগো'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            ফরম্যাট: PNG / JPG / WebP, সর্বোচ্চ ৫MB
                          </p>
                          {storeBranding.logoUrl && (
                            <button
                              type="button"
                              onClick={() => updateStoreBranding({ logoUrl: '' })}
                              className="text-[10px] font-bold text-rose-600 hover:underline mt-1 cursor-pointer"
                            >
                              ডিফল্ট লোগো রিস্টোর করুন
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <input
                        type="file"
                        ref={logoInputRef}
                        onChange={handleUploadLogo}
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="w-full bg-slate-900 hover:bg-amber-600 text-white hover:text-blue-950 font-bold py-2 px-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{uploadingLogo ? 'লোগো আপলোড হচ্ছে...' : 'নতুন মাস্টার লোগো আপলোড করুন'}</span>
                      </button>
                      {uploadingLogo && (
                        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(10, logoUploadProgress)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Promotional Hero Banner Box */}
                  <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-slate-800 text-xs">
                          প্রমোশনাল হিরো ব্যানার (Hero Banner)
                        </span>
                        <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          📐 16:9 রেশিও (1920 x 1080 px)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-3">
                        হোমপেজের শীর্ষে পণ্যের তালিকার উপরে দৃশ্যমান মূল অফার ব্যানার।
                      </p>

                      {/* Current Preview */}
                      <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
                        <img 
                          src={(storeBranding?.heroBannerUrl && storeBranding.heroBannerUrl.trim()) || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80'} 
                          alt="Banner Preview"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                          {storeBranding.heroBannerUrl ? 'কাস্টম ব্যানার' : 'ডিফল্ট ব্যানার'}
                        </span>
                      </div>
                      {storeBranding.heroBannerUrl && (
                        <button
                          type="button"
                          onClick={() => updateStoreBranding({ heroBannerUrl: '' })}
                          className="text-[10px] font-bold text-rose-600 hover:underline mt-1.5 cursor-pointer block"
                        >
                          ডিফল্ট ব্যানার রিস্টোর করুন
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        type="file"
                        ref={bannerInputRef}
                        onChange={handleUploadBanner}
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        disabled={uploadingBanner}
                        className="w-full bg-slate-900 hover:bg-amber-600 text-white hover:text-blue-950 font-bold py-2 px-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{uploadingBanner ? 'ব্যানার আপলোড হচ্ছে...' : 'নতুন হিরো ব্যানার আপলোড করুন'}</span>
                      </button>
                      {uploadingBanner && (
                        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(10, bannerUploadProgress)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">ডাইনামিক হেডার ও ব্যানার ম্যানেজার</h4>
                  <p className="text-slate-500 text-[11px]">এখান থেকে ওয়েবসাইটের হেডার টেক্সট, ব্যানার ও অফার মেসেজ লাইভ পরিবর্তন করুন</p>
                </div>
                {editingHeaderId && (
                  <button
                    onClick={resetHeaderForm}
                    className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    + নতুন হেডার বানান
                  </button>
                )}
              </div>

              {/* Header List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {headerConfigs.map(hdr => (
                  <div 
                    key={hdr.id} 
                    className={`p-4 rounded-2xl border transition relative flex flex-col justify-between gap-3 ${
                      hdr.isActive 
                        ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-400/20 shadow-md' 
                        : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          hdr.isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {hdr.isActive ? '🟢 লাইভ অ্যাক্টিভ' : 'ইন-অ্যাক্টিভ'}
                        </span>
                        <span className="text-[10px] text-slate-400">ID: {hdr.id}</span>
                      </div>

                      <h5 className="font-black text-slate-900 text-sm">{hdr.titleBn}</h5>
                      <p className="text-slate-600 text-xs mt-1 leading-snug">{hdr.welcomeMessageBn}</p>
                      <p className="text-amber-700 bg-amber-50 p-2 rounded-xl text-[11px] font-medium mt-2 border border-amber-200">
                        📢 {hdr.promoAnnouncementBn}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                        <span>📞 হটলাইন: <strong>{hdr.hotlinePhone}</strong></span>
                        <span>•</span>
                        <span>বাটন: <strong>{hdr.buttonTextBn}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-200/60">
                      {!hdr.isActive && (
                        <button
                          onClick={() => setActiveHeaderConfig(hdr.id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-xl text-xs transition cursor-pointer shadow-xs"
                        >
                          লাইভ সেট করুন
                        </button>
                      )}
                      <button
                        onClick={() => handleEditHeader(hdr)}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold py-1.5 px-3 rounded-xl text-xs transition cursor-pointer"
                      >
                        এডিট
                      </button>
                      {headerConfigs.length > 1 && (
                        <button
                          onClick={() => deleteHeaderConfig(hdr.id)}
                          className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold p-1.5 rounded-xl text-xs transition cursor-pointer"
                          title="ডিলিট"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Form to Add/Edit Header */}
              <form onSubmit={handleSaveHeaderConfig} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h5 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  <span>{editingHeaderId ? 'হেডার তথ্য সংশোধন করুন' : 'নতুন হেডার কনফিগারেশন যোগ করুন'}</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">দোকানের শিরোনাম (বাংলা) *</label>
                    <input
                      type="text"
                      required
                      value={hdrTitleBn}
                      onChange={e => setHdrTitleBn(e.target.value)}
                      placeholder="ক্রেতার বাজার Kids & Baby Store"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">দোকানের শিরোনাম (English)</label>
                    <input
                      type="text"
                      value={hdrTitleEn}
                      onChange={e => setHdrTitleEn(e.target.value)}
                      placeholder="Kretar Bazar Kids & Baby Store"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">ওয়েলকাম মেসেজ (বাংলা) *</label>
                    <input
                      type="text"
                      required
                      value={hdrWelcomeBn}
                      onChange={e => setHdrWelcomeBn(e.target.value)}
                      placeholder="স্বাগতম! আপনার সোনামণির জন্য সেরা সোপিং..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">ওয়েলকাম মেসেজ (English)</label>
                    <input
                      type="text"
                      value={hdrWelcomeEn}
                      onChange={e => setHdrWelcomeEn(e.target.value)}
                      placeholder="Welcome! Best kids products..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">প্রোমোশনাল মেসেজ (টপ নোটিশ বাংলা) *</label>
                    <input
                      type="text"
                      required
                      value={hdrPromoBn}
                      onChange={e => setHdrPromoBn(e.target.value)}
                      placeholder="🔥 মেগা সেল! ৩০% ছাড় ও ফাস্ট ক্যাশ অন ডেলিভারি"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">হটলাইন মোবাইল নম্বর *</label>
                    <input
                      type="text"
                      required
                      value={hdrHotline}
                      onChange={e => setHdrHotline(e.target.value)}
                      placeholder="01700000000"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">বাটন টেক্সট (বাংলা)</label>
                    <input
                      type="text"
                      value={hdrBtnTextBn}
                      onChange={e => setHdrBtnTextBn(e.target.value)}
                      placeholder="আজই কেনাকাটা করুন"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">বাটন লিংক</label>
                    <input
                      type="text"
                      value={hdrBtnLink}
                      onChange={e => setHdrBtnLink(e.target.value)}
                      placeholder="#products"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">ব্যালের ইমেজ লিংক (Hero Banner URL)</label>
                    <input
                      type="text"
                      value={hdrBannerImage}
                      onChange={e => setHdrBannerImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="hdrIsActiveCb"
                    checked={hdrIsActive}
                    onChange={e => setHdrIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="hdrIsActiveCb" className="font-bold text-slate-800 text-xs cursor-pointer">
                    তাতক্ষনিকভাবে ওয়েবসাইটের সকল ইউজারের জন্য লাইভ এক্টিভ করুন
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 px-6 rounded-xl text-xs shadow-md transition cursor-pointer"
                  >
                    {editingHeaderId ? 'হেডার আপডেট করুন' : 'নতুন হেডার সেভ করুন'}
                  </button>
                  {editingHeaderId && (
                    <button
                      type="button"
                      onClick={resetHeaderForm}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
                    >
                      বাতিল
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Realtime Alert & Contact Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-emerald-950 text-emerald-100 p-5 rounded-3xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-white text-base flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-amber-400" />
                    <span>রিয়েল-টাইম কাস্টমার অর্ডার অ্যালার্ট হাব</span>
                  </h4>
                  <p className="text-emerald-300/80 text-xs mt-1">
                    যেকোনো কাস্টমার অর্ডার করার সাথে সাথে অ্যাডমিনের ফোনে সাউন্ড বেল বাজবে ও ব্রাউজার পুশ অ্যালার্ট যাবে।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTestRealtimeAlert}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-950 font-black py-2.5 px-4 rounded-2xl text-xs shadow-lg transition cursor-pointer shrink-0 border border-amber-300"
                >
                  🔊 টেস্ট সাউন্ড ও অ্যালার্ট স্পিকার
                </button>
              </div>

              <form onSubmit={handleSaveNotificationSettings} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h5 className="font-extrabold text-slate-800 text-sm">অ্যাডমিন যোগাযোগ ও নোটিফিকেশন কনফিগারেশন</h5>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full self-start sm:self-auto">
                    সাউন্ড ও ব্রাউজার পুশ সক্রিয়
                  </span>
                </div>

                <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-3">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-extrabold text-blue-950">নোটিফিকেশন চ্যানেল চ্যানেল পরিচিতি ও স্ট্যাটাস:</p>
                    <ul className="text-[11px] text-blue-900 space-y-0.5 list-disc pl-3">
                      <li><strong>ইন-অ্যাপ সাউন্ড চিম ও ব্রাউজার পুশ:</strong> সরাসরি সক্রিয়। ব্রাউজার পারমিশন দেওয়া থাকলে ব্যাকগ্রাউন্ডেও অ্যালার্ট বাজবে।</li>
                      <li><strong>এসএমএস ও হোয়াটসঅ্যাপ নম্বর:</strong> এই নম্বরগুলোতে বাহ্যিক বার্তা পাঠানোর জন্য থার্ড-পার্টি এসএমএস গেটওয়ে (যেমন Twilio বা Greenweb) কনফিগারেশন প্রয়োজন। গেটওয়ে সক্রিয় না থাকা পর্যন্ত বাহ্যিক বার্তা পাঠানো হবে না।</li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">অ্যাডমিন ফোন নম্বর (Order Notification SMS) *</label>
                    <input
                      type="text"
                      required
                      value={adminPhone}
                      onChange={e => setAdminPhone(e.target.value)}
                      placeholder="01700000000"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">অ্যাডমিন ইমেইল (Order Mail Alert) *</label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="admin@kretarbazar.com"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">হোয়াটসঅ্যাপ নম্বর (WhatsApp Alert) *</label>
                    <input
                      type="text"
                      required
                      value={whatsappNumber}
                      onChange={e => setWhatsappNumber(e.target.value)}
                      placeholder="8801700000000"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                    <div>
                      <span className="font-extrabold text-slate-800 block text-xs">শব্দ অ্যালার্ট (Order Sound Chime)</span>
                      <span className="text-[11px] text-slate-500">নতুন অর্ডার আসলে সাথে সাথেই মিউজিক্যাল সাউন্ড টিউন বাজবে</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={e => setSoundEnabled(e.target.checked)}
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                    <div>
                      <span className="font-extrabold text-slate-800 block text-xs">ব্রাউজার পুশ নোটিফিকেশন (Browser Push Notifications)</span>
                      <span className="text-[11px] text-slate-500">অন্য ট্যাবে থাকলেও স্ক্রিনে পপআপ অ্যালার্ট আসবে</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={browserNotificationsEnabled}
                      onChange={e => setBrowserNotificationsEnabled(e.target.checked)}
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-6 rounded-xl text-xs shadow-md transition cursor-pointer"
                >
                  নোটিফিকেশন সেটিংস সেভ করুন
                </button>
              </form>

              {/* Administrator Password & Security Management Form */}
              <form onSubmit={handleChangePassword} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    <span>প্রশাসক পাসওয়ার্ড পরিবর্তন (Change Admin Password)</span>
                  </h5>
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    ইউজারনেম: <strong>{serverAdminSession?.username || 'naymul'}</strong>
                  </span>
                </div>

                <p className="text-[11px] text-slate-500">
                  নিরাপদ স্ক্রিপ্ট (Scrypt) এনক্রিপশনযুক্ত পাসওয়ার্ড আপডেট করুন। পরিবর্তিত পাসওয়ার্ড পরবর্তী প্রতিবার লগইনে কার্যকর হবে।
                </p>

                {passwordChangeSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{passwordChangeSuccess}</span>
                  </div>
                )}

                {passwordChangeError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{passwordChangeError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">বর্তমান পাসওয়ার্ড (Current) *</label>
                    <input
                      type="password"
                      required
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">নতুন পাসওয়ার্ড (New Password) *</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="ন্যূনতম ৬ অক্ষর"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">নতুন পাসওয়ার্ড নিশ্চিত করুন *</label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      placeholder="পুনরায় নতুন পাসওয়ার্ড"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="bg-blue-900 hover:bg-blue-950 text-amber-300 font-black py-2.5 px-6 rounded-xl text-xs shadow-md transition cursor-pointer border border-amber-400/30 flex items-center gap-2"
                  >
                    {isChangingPassword ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>আপডেট হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>পাসওয়ার্ড আপডেট করুন</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleAdminLogout}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>লগআউট করুন</span>
                  </button>
                </div>
              </form>

              {/* Order Notification Email Service Hub */}
              <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/40">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-sm text-white">
                        অটোমেটেড অর্ডার ইমেইল নোটিফিকেশন সার্ভিস
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        প্রতিটি কাস্টমার অর্ডার গ্রহণের সাথে সাথেই স্বয়ংক্রিয়ভাবে ইমেইল ইনভয়েস পাঠানো হয়
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-auto border ${
                    emailStatus?.configured
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-950 text-amber-300 border-amber-500/40'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${emailStatus?.configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <span>{emailStatus?.configured ? 'SMTP Active (Live Email)' : 'Pending Gmail App Password'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">প্রাপক ইমেইল (Fixed Recipient)</span>
                    <p className="font-mono font-bold text-amber-300 text-sm">
                      {emailStatus?.recipient || 'naymulh2005@gmail.com'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      গেস্ট বা নিবন্ধিত যেকোনো ডিভাইস থেকে অর্ডার কনফার্ম হলে সম্পূর্ণ বিবরণসহ ইনভয়েস এই ইমেইলে যাবে।
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">লাইভ ডেলিভারি টেস্ট</span>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        সার্ভারের ইমেইল প্রেরণ ইঞ্জিন পরীক্ষা করতে টেস্ট বাটন চাপুন:
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleTestEmailDispatch}
                      disabled={testingEmail}
                      className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-950 font-black py-2.5 px-4 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
                    >
                      {testingEmail ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>পরীক্ষা করা হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-3.5 h-3.5" />
                          <span>টেস্ট নোটিফিকেশন ইমেইল পাঠান</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {testEmailResult && (
                  <div className={`p-3 rounded-2xl border text-xs font-semibold ${
                    testEmailResult.success 
                      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' 
                      : 'bg-amber-950/80 border-amber-500/40 text-amber-200'
                  }`}>
                    <p className="font-bold flex items-center gap-1.5">
                      {testEmailResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Info className="w-4 h-4 text-amber-400" />}
                      <span>{testEmailResult.message}</span>
                    </p>
                  </div>
                )}

                {/* Free Zero-Cost Setup Guidance */}
                <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl text-[11px] text-slate-300 space-y-1.5">
                  <p className="font-extrabold text-amber-300 text-xs">
                    💡 ১০০% ফ্রী জিমেইল এসএমটিপি সেটআপ তথ্য (Zero Extra Cost):
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    সিস্টেমে সম্পূর্ণ ফ্রি নোডমেইলার (Nodemailer) সার্ভিস ইন্টিগ্রেট করা রয়েছে। এটি কোনো পেইড থার্ড-পার্টি সার্ভিস ছাড়াই সরাসরি গুগল জিমেইল দিয়ে কাজ করে।
                    বাইরের ইনবক্সে ইমেইল সরাসরি পৌঁছাতে আপনার গুগল অ্যাকাউন্টের <em>2-Step Verification &gt; App Passwords</em> থেকে ১৬ অক্ষরের ফ্রি অ্যাপ পাসওয়ার্ড তৈরি করে পরিবেশ ভেরিয়েবল (<code className="text-amber-300">GMAIL_USER</code> এবং <code className="text-amber-300">GMAIL_APP_PASSWORD</code>) এ যোগ করলেই ইনবক্সে রিয়েল-টাইম ডেলিভারি শুরু হবে।
                  </p>
                </div>

                {/* Audit Logs */}
                {emailStatus?.logs && emailStatus.logs.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      সাম্প্রতিক নোটিফিকেশন অডিট হিস্টোরি (Recent Logs)
                    </span>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {emailStatus.logs.slice(0, 4).map((log: any, idx: number) => (
                        <div key={idx} className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-[11px] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${log.status === 'SENT' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            <span className="font-bold text-white">#{log.orderId}</span>
                            <span className="text-slate-400 font-mono text-[10px]">{log.recipient}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${log.status === 'SENT' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'}`}>
                              {log.status}
                            </span>
                            <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* Broadcast Notifications */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleBroadcastNotif} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-pink-600" />
                <span>পুশ নোটিফিকেশন ব্রডকাস্ট করুন</span>
              </h4>

              <div>
                <label className="font-bold text-slate-700 block mb-1">নোটিফিকেশন টাইটেল</label>
                <input
                  type="text"
                  required
                  placeholder="🎉 স্পেশাল অফার চালু হয়েছে!"
                  value={notifTitle}
                  onChange={e => setNotifTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">বিস্তারিত বার্তা</label>
                <textarea
                  required
                  rows={3}
                  placeholder="আজই কেনাকাটায় পাবেন ১০% কুপন ছাড়..."
                  value={notifMsg}
                  onChange={e => setNotifMsg(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <button
                type="submit"
                className="bg-pink-600 hover:bg-pink-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                সকল ইউজারের কাছে পাঠান
              </button>
            </form>
          )}

          {/* Media Management System */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              
              {/* Media Upload Box */}
              <div className="bg-slate-900 text-white p-5 rounded-3xl border border-amber-500/30 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-black text-amber-300 text-sm flex items-center gap-2">
                      <Film className="w-4 h-4 text-amber-400" />
                      <span>এক বা একাধিক ছবি ও ভিডিও আপলোড করুন (CDN Auto-Live)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      আপলোড করার সাথে সাথেই সকল কাস্টমারের কাছে লাইভ আপডেট হবে
                    </p>
                  </div>

                  <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>অটোমেটিক লাইভ সিঙ্ক চালু</span>
                  </span>
                </div>

                {/* File Upload Zone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Local Device Gallery Upload */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-400/40 hover:border-amber-400 bg-slate-950/60 hover:bg-slate-950/90 rounded-2xl p-6 text-center space-y-2 cursor-pointer transition flex flex-col items-center justify-center min-h-[160px]"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/40">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-extrabold text-amber-200 text-xs">
                        {uploadingFiles ? 'আপলোড হচ্ছে...' : 'ডিভাইস বা গ্যালারি থেকে ছবি/ভিডিও সিলেক্ট করুন'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        একত্রে একাধিক ফাইল (JPEG, PNG, MP4) ড্র্যাগ অথবা ক্লিক করে যোগ করুন
                      </p>
                    </div>
                  </div>

                  {/* CDN / Storage Direct Link Form */}
                  <form onSubmit={handleAddMediaByUrl} className="space-y-2.5 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-300 text-[11px]">অথবা CDN/Firebase URL দিয়ে যুক্ত করুন</span>
                      
                      {/* Type Toggle */}
                      <div className="flex bg-slate-800 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => setMediaType('image')}
                          className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] transition ${
                            mediaType === 'image' ? 'bg-amber-400 text-blue-950' : 'text-slate-400'
                          }`}
                        >
                          ছবি
                        </button>
                        <button
                          type="button"
                          onClick={() => setMediaType('video')}
                          className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] transition ${
                            mediaType === 'video' ? 'bg-amber-400 text-blue-950' : 'text-slate-400'
                          }`}
                        >
                          ভিডিও
                        </button>
                      </div>
                    </div>

                    <input
                      type="url"
                      required
                      placeholder={mediaType === 'video' ? 'https://commondatastorage.../video.mp4' : 'https://images.unsplash.com/...jpg'}
                      value={mediaUrl}
                      onChange={e => setMediaUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-amber-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="টাইটেল (বাংলা)"
                        value={mediaTitleBn}
                        onChange={e => setMediaTitleBn(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Title (English)"
                        value={mediaTitleEn}
                        onChange={e => setMediaTitleEn(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={mediaCategory}
                        onChange={e => setMediaCategory(e.target.value as MediaCategory)}
                        className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-amber-200"
                      >
                        <option value="product_photoshoot">📸 ফটোশুট</option>
                        <option value="video_review">🎬 ভিডিও রিভিউ</option>
                        <option value="new_collection">✨ নতুন কালেকশন</option>
                        <option value="customer_moments">❤️ হ্যাপি ক্লায়েন্ট</option>
                      </select>

                      <select
                        value={mediaLinkedProduct}
                        onChange={e => setMediaLinkedProduct(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-amber-200"
                      >
                        <option value="">🛒 লিংককৃত পণ্য (ঐচ্ছিক)</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.nameBn}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-950 font-black py-2 rounded-xl text-xs transition shadow-md cursor-pointer"
                    >
                      পাবলিশ করুন (Live Publish)
                    </button>
                  </form>

                </div>
              </div>

              {/* Uploaded Media Collection Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                    <span>লাইভ মিডিয়া গ্যালারি মোড</span>
                    <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-xs font-black">
                      {mediaList.length} টি ফাইল
                    </span>
                  </h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {mediaList.map(item => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                      <div className="aspect-video bg-slate-950 relative overflow-hidden group">
                        {item.type === 'video' ? (
                          (item.url && item.url.trim()) ? <video src={item.url.trim()} className="w-full h-full object-cover" /> : null
                        ) : (
                          <img src={(item.url && item.url.trim()) || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80'} alt="" className="w-full h-full object-cover" />
                        )}

                        <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-black text-amber-300">
                          {item.type === 'video' ? '🎬 ভিডিও' : '📸 ছবি'}
                        </div>

                        {item.isFeatured && (
                          <div className="absolute top-2 right-2 bg-rose-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md">
                            ⭐ FEATURED
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 space-y-1.5 flex-1 flex flex-col justify-between text-xs">
                        <div>
                          <h5 className="font-bold text-slate-800 text-xs line-clamp-1">{item.titleBn}</h5>
                          <p className="text-[10px] text-slate-400">
                            দেখা হয়েছে: {item.viewsCount || 1} | পছন্দ: {item.likesCount || 0}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <button
                            onClick={() => toggleFeaturedMedia(item.id)}
                            className={`p-1 rounded-lg border transition cursor-pointer text-[10px] font-bold flex items-center gap-1 ${
                              item.isFeatured 
                                ? 'bg-amber-50 border-amber-300 text-amber-700' 
                                : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                          >
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{item.isFeatured ? 'ফিচার্ড' : 'নরমাল'}</span>
                          </button>

                          <button
                            onClick={() => deleteMediaItem(item.id)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Add / Edit Product Sub-Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-slate-800 text-sm">
              {editingProduct ? 'পণ্য সম্পাদনা করুন' : 'নতুন পণ্য যোগ করুন'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">প্রোডাক্ট SKU / কোড</label>
                  <input
                    type="text"
                    value={pSku}
                    onChange={e => setPSku(e.target.value)}
                    placeholder="KB-BED-701"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ব্র্যান্ড (Brand)</label>
                  <input
                    type="text"
                    value={pBrand}
                    onChange={e => setPBrand(e.target.value)}
                    placeholder="Mothercare / Chicco"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">পণ্যের নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  value={pNameBn}
                  onChange={e => setPNameBn(e.target.value)}
                  placeholder="যেমন: বেবি নেস্ট বেড ও পোর্টেবল মসকিটো নেট সেট"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">পণ্যের নাম (English) *</label>
                <input
                  type="text"
                  required
                  value={pNameEn}
                  onChange={e => setPNameEn(e.target.value)}
                  placeholder="e.g. Baby Nest Lounger Bed with Mosquito Net"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ক্যাটাগরি</label>
                  <select
                    value={pCategory}
                    onChange={e => setPCategory(e.target.value as CategoryId)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nameBn}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">বয়স গ্রুপ</label>
                  <select
                    value={pAgeGroup}
                    onChange={e => setPAgeGroup(e.target.value as AgeGroup)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  >
                    <option value="6-12m">০ - ১২ মাস (Baby Care)</option>
                    <option value="1-2y">১ - ২ বছর</option>
                    <option value="2-4y">২ - ৪ বছর</option>
                    <option value="4-6y">৪ - ৬ বছর</option>
                    <option value="6-10y">৬ - ১০ বছর</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">মূল দাম (৳)</label>
                  <input
                    type="number"
                    required
                    value={pPrice}
                    onChange={e => setPPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">অফার দাম (৳)</label>
                  <input
                    type="number"
                    value={pDiscountPrice}
                    onChange={e => setPDiscountPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">স্টক পরিমাণ</label>
                  <input
                    type="number"
                    required
                    value={pStock}
                    onChange={e => setPStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  />
                </div>
              </div>

              {/* Badges Toggle */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="font-bold text-slate-700 block mb-2">পণ্যের ব্যাজ ও হাইলাইট (Badges)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={pIsFeatured}
                      onChange={e => setPIsFeatured(e.target.checked)}
                      className="rounded text-pink-600"
                    />
                    <span>ফিচার্ড (Featured)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={pIsBestSeller}
                      onChange={e => setPIsBestSeller(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>বেস্ট সেলার</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={pIsNewArrival}
                      onChange={e => setPIsNewArrival(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>নতুন আগমন</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={pIsFlashSale}
                      onChange={e => setPIsFlashSale(e.target.checked)}
                      className="rounded text-rose-600"
                    />
                    <span>ফ্ল্যাশ সেল</span>
                  </label>
                </div>
              </div>

              {/* Direct Product Photos Upload Control */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="font-bold text-slate-800 block text-xs">
                    পণ্যের ছবি আপলোড (Direct Photo Upload) *
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                    ⚡ স্বয়ংক্রিয় WebP অপ্টিমাইজেশন ও ফায়ারবেস ক্লাউড সেভ (Free 5GB)
                  </span>
                </div>

                <input
                  type="file"
                  ref={productImageInputRef}
                  onChange={handleDirectProductImageUpload}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  multiple
                  className="hidden"
                />

                {/* Upload Button Area */}
                <div 
                  onClick={() => productImageInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/60 rounded-2xl p-4 text-center cursor-pointer transition group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-black text-slate-800">
                    ডিভাইস থেকে সরাসরি ছবি সিলেক্ট করুন
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    মোবাইল ক্যামেরা বা গ্যালারি থেকে একাধিক ছবি দিন — স্বয়ংক্রিয়ভাবে কম্প্রেস হয়ে ফায়ারবেস ক্লাউডে সংরক্ষিত হবে
                  </p>
                </div>

                {/* Upload Progress Bar */}
                {uploadingProductMedia && (
                  <div className="space-y-1 bg-white p-3 rounded-xl border border-emerald-200">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
                      <span>⚡ স্বয়ংক্রিয় অপ্টিমাইজেশন ও ফায়ারবেস ক্লাউড সেভ হচ্ছে...</span>
                      <span>{productUploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(5, productUploadProgress)}%` }}
                      />
                    </div>
                  </div>
                )}

                {productUploadError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{productUploadError}</span>
                  </div>
                )}

                {/* Uploaded Photos Preview List */}
                {pImagesList.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600">
                        নির্বাচিত ছবি সমূহ ({pImagesList.length} টি)
                      </span>
                      <button
                        type="button"
                        onClick={() => productImageInputRef.current?.click()}
                        disabled={uploadingProductMedia}
                        className="text-[11px] font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>আরো ছবি যোগ করুন</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                      {pImagesList.map((imgUrl, idx) => (
                        <div 
                          key={idx}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-slate-100 group shadow-xs ${
                            idx === 0 ? 'border-pink-500 ring-2 ring-pink-300/40' : 'border-slate-200'
                          }`}
                        >
                          <img 
                            src={(typeof imgUrl === 'string' && imgUrl.trim()) || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80'} 
                            alt={`Product preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Primary Cover Badge */}
                          {idx === 0 ? (
                            <span className="absolute top-1 left-1 bg-pink-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow">
                              মেইন কভার
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryProductImage(idx)}
                              title="কভার ছবি বানান"
                              className="absolute top-1 left-1 bg-black/60 hover:bg-pink-600 text-white p-1 rounded transition opacity-0 group-hover:opacity-100 cursor-pointer"
                            >
                              <Star className="w-3 h-3" />
                            </button>
                          )}

                          {/* Delete Photo Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveProductImage(idx)}
                            title="মুছে ফেলুন"
                            className="absolute top-1 right-1 bg-rose-600/90 hover:bg-rose-700 text-white p-1 rounded transition opacity-90 group-hover:opacity-100 cursor-pointer shadow"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      💡 প্রথম ছবিটি শপ পেজের মেইন কার্ডে দেখাবে, বাকিগুলো প্রোডাক্টের ডিটেইলস গ্যালারিতে থাকবে।
                    </p>
                  </div>
                )}
              </div>

              {/* Color Variants */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  কালার ভ্যারিয়েন্ট ও হেক্স কোড (Color Variants)
                </label>
                <input
                  type="text"
                  value={pColorsText}
                  onChange={e => setPColorsText(e.target.value)}
                  placeholder="পিচ কোরাল: #FF7F50, সফট পিঙ্ক: #F48FB1, মিন্ট গ্রিন: #80CBC4"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">ফরম্যাট: কালার নাম: #HexCode, কমা দিয়ে আলাদা করুন</p>
              </div>

              {/* Product YouTube Video Link Control */}
              <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="font-bold text-slate-800 block text-xs flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-red-600" />
                    <span>ইউটিউব ভিডিও লিংক (YouTube Video Link - ঐচ্ছিক)</span>
                  </label>
                  <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                    🎬 Official YouTube HD Embed
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... অথবা https://youtu.be/..."
                    value={pVideoUrl}
                    onChange={e => setPVideoUrl(e.target.value.trim())}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-red-500 font-mono"
                  />
                  {pVideoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveYouTubeVideo}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                      title="লিংক মুছে ফেলুন"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">
                  ইউটিউব ভিডিওর লিংক পেস্ট করুন (যেমন: https://www.youtube.com/watch?v=... বা https://youtu.be/...)। কাস্টমাররা ওয়েবসাইটে সরাসরি HD কোয়ালিটিতে ভিডিওটি দেখতে পাবেন।
                </p>

                {/* Live YouTube Preview & Remove Button */}
                {pVideoUrl && (
                  <div className="bg-slate-900 rounded-2xl p-2.5 space-y-2 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-red-500" />
                        <span>ভিডিও প্রিভিউ ({isYouTubeUrl(pVideoUrl) ? 'YouTube HD Player' : 'Direct Video'})</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveYouTubeVideo}
                        className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-800"
                        title="ভিডিও মুছে ফেলুন"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>ভিডিও রিমুভ করুন</span>
                      </button>
                    </div>

                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black max-h-56 flex items-center justify-center">
                      {isYouTubeUrl(pVideoUrl) ? (
                        getYouTubeEmbedUrl(pVideoUrl, false) ? (
                          <iframe
                            src={getYouTubeEmbedUrl(pVideoUrl, false)!}
                            title="YouTube Product Video Preview"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        ) : null
                      ) : pVideoUrl && pVideoUrl.trim() ? (
                        <video
                          src={pVideoUrl.trim()}
                          controls
                          playsInline
                          className="w-full h-full object-contain"
                        />
                      ) : null}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      💡 কাস্টমাররা প্রোডাক্ট কার্ড ও ডিটেইলস পেজের <strong>🎬 ভিডিও দেখুন</strong> বাটনে ক্লিক করে ওয়েবসাইটেই HD কোয়ালিটিতে এই ভিডিও দেখতে পাবেন।
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">বিবরণ (বাংলা)</label>
                  <textarea
                    rows={3}
                    value={pDescBn}
                    onChange={e => setPDescBn(e.target.value)}
                    placeholder="পণ্যের গুণাগুণ ও বৈশিষ্ট্য লিখুন..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description (English)</label>
                  <textarea
                    rows={3}
                    value={pDescEn}
                    onChange={e => setPDescEn(e.target.value)}
                    placeholder="Write detailed product highlights..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-black py-3.5 rounded-2xl text-xs shadow-lg transition cursor-pointer"
              >
                সংরক্ষণ ও ক্লাউড সিঙ্ক করুন (Save & Sync)
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
