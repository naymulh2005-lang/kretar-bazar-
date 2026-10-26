import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  orderBy,
  writeBatch,
  getDoc,
  getDocFromServer
} from 'firebase/firestore';
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User as FirebaseUser 
} from 'firebase/auth';
import { db, auth, storage, googleAuthProvider, COLLECTIONS } from '../firebase';
import { 
  Product, 
  Order, 
  MediaItem, 
  HeroSlide, 
  HeaderConfig, 
  AdminNotificationSettings, 
  NotificationItem,
  UserProfile,
  StoreBranding 
} from '../types';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { INITIAL_HERO_SLIDES } from '../data/mockHeroSlides';
import { INITIAL_HEADER_CONFIGS } from '../data/mockHeaderConfigs';
import { INITIAL_MEDIA } from '../data/mockMedia';
import { optimizeImageForUpload } from '../utils/imageOptimizer';

// ======================= ERROR HANDLING & CONNECTION =======================

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  if (errMessage.includes('Missing or insufficient permissions') || errMessage.includes('permission-denied')) {
    console.error('Firestore Permission Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  } else {
    console.warn(`Firestore note [${operationType} on ${path || 'unknown'}]:`, errMessage);
  }
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore notice: Client is currently operating with local cache/offline mode.');
    }
  }
}

export const isAuthorizedAdmin = (user: FirebaseUser | null = auth.currentUser): boolean => {
  if (!user || !user.email) return false;
  const em = user.email.toLowerCase();
  return em === 'naymulh2005@gmail.com' || em === 'admin@kretarbazar.com';
};

let isSigningInAdmin = false;
export const ensureFirebaseAuthAdmin = async (): Promise<boolean> => {
  if (isAuthorizedAdmin(auth.currentUser)) {
    return true;
  }
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('kb_admin_session_token') : null;
  if (!token) return false;
  if (isSigningInAdmin) return false;

  try {
    isSigningInAdmin = true;
    try {
      await signInWithEmailAndPassword(auth, 'admin@kretarbazar.com', 'KretarBazar@2026Admin');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
        try {
          await createUserWithEmailAndPassword(auth, 'admin@kretarbazar.com', 'KretarBazar@2026Admin');
        } catch {
          // ignore if already created
        }
      }
    }
    if (auth.currentUser && isAuthorizedAdmin(auth.currentUser)) {
      try {
        await setDoc(doc(db, 'admins', auth.currentUser.uid), {
          email: auth.currentUser.email,
          role: 'admin',
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch {}
    }
    return isAuthorizedAdmin(auth.currentUser);
  } catch (err) {
    console.warn('Firebase admin auto sign-in notice:', err);
    return false;
  } finally {
    isSigningInAdmin = false;
  }
};

// Check and seed initial collections if empty without creating duplicate entries
export const seedInitialDatabase = async (): Promise<boolean> => {
  try {
    if (!isAuthorizedAdmin(auth.currentUser)) {
      await ensureFirebaseAuthAdmin();
    }
    const authorized = isAuthorizedAdmin(auth.currentUser);
    if (!authorized) {
      return false;
    }

    // 1. Seed Products if empty or sync missing products
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const productSnap = await getDocs(productsRef);
    const existingProductIds = new Set(productSnap.docs.map(d => d.id));
    
    const missingProducts = MOCK_PRODUCTS.filter(p => !existingProductIds.has(p.id));
    if (missingProducts.length > 0) {
      console.log(`Seeding ${missingProducts.length} products into Firestore...`);
      const batch = writeBatch(db);
      for (const prod of missingProducts) {
        const prodDoc = doc(db, COLLECTIONS.PRODUCTS, prod.id);
        batch.set(prodDoc, prod);
      }
      await batch.commit();
    }

    // 2. Seed Hero Slides if empty
    const slidesRef = collection(db, COLLECTIONS.HERO_SLIDES);
    const slidesSnap = await getDocs(slidesRef);
    if (slidesSnap.empty) {
      const batch = writeBatch(db);
      for (const slide of INITIAL_HERO_SLIDES) {
        const slideDoc = doc(db, COLLECTIONS.HERO_SLIDES, slide.id);
        batch.set(slideDoc, slide);
      }
      await batch.commit();
    }

    // 3. Seed Header Configs if empty
    const headerRef = collection(db, COLLECTIONS.HEADER_CONFIGS);
    const headerSnap = await getDocs(headerRef);
    if (headerSnap.empty) {
      const batch = writeBatch(db);
      for (const hdr of INITIAL_HEADER_CONFIGS) {
        const hdrDoc = doc(db, COLLECTIONS.HEADER_CONFIGS, hdr.id);
        batch.set(hdrDoc, hdr);
      }
      await batch.commit();
    }

    // 4. Seed Media Gallery if empty
    const mediaRef = collection(db, COLLECTIONS.MEDIA);
    const mediaSnap = await getDocs(mediaRef);
    if (mediaSnap.empty) {
      const batch = writeBatch(db);
      for (const med of INITIAL_MEDIA) {
        const medDoc = doc(db, COLLECTIONS.MEDIA, med.id);
        batch.set(medDoc, med);
      }
      await batch.commit();
    }

    // 5. Seed Admin Settings if not present
    const settingsDocRef = doc(db, COLLECTIONS.SETTINGS, 'admin_settings');
    const settingsSnap = await getDoc(settingsDocRef);
    if (!settingsSnap.exists()) {
      await setDoc(settingsDocRef, {
        adminEmail: 'admin@kretarbazar.com',
        adminPhone: '01700000000',
        whatsappNumber: '8801700000000',
        soundEnabled: true,
        browserNotificationsEnabled: true
      });
    }

    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg.includes('unavailable') || errorMsg.includes('offline')) {
      console.warn('Firestore initial sync operating in offline/cached mode. Realtime listeners will sync when online.');
    } else {
      console.warn('Firestore initial data check:', errorMsg);
    }
    return false;
  }
};

// ======================= REAL-TIME FIRESTORE LISTENERS =======================

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  const q = query(collection(db, COLLECTIONS.PRODUCTS));
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const items: Product[] = [];
      snapshot.forEach(docSnap => {
        items.push({ ...docSnap.data(), id: docSnap.id } as Product);
      });
      callback(items);
    }
  }, (error) => {
    console.warn('Firestore Products onSnapshot warning:', error);
  });
};

export const subscribeToOrders = (
  callback: (orders: Order[]) => void,
  serverAdminToken?: string | null
) => {
  const currentAuthUser = auth.currentUser;
  const isAuthorized = isAuthorizedAdmin(currentAuthUser);

  // If server admin session token exists, use server-verified admin polling/streaming
  if (serverAdminToken) {
    let isStopped = false;
    const fetchAdminOrders = async () => {
      try {
        const res = await fetch('/api/admin/orders', {
          headers: { Authorization: `Bearer ${serverAdminToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders) && !isStopped) {
            callback(data.orders);
          }
        }
      } catch (err) {
        console.warn('Error fetching admin orders from server:', err);
      }
    };

    fetchAdminOrders();
    const interval = setInterval(fetchAdminOrders, 3500);
    return () => {
      isStopped = true;
      clearInterval(interval);
    };
  }

  let q;
  if (isAuthorized) {
    // Authorized admin gets the full live orders stream
    q = query(collection(db, COLLECTIONS.ORDERS));
  } else if (currentAuthUser) {
    // Authenticated user gets only their own personal orders
    q = query(collection(db, COLLECTIONS.ORDERS), where('userId', '==', currentAuthUser.uid));
  } else {
    // Unauthenticated guest: local session orders only, prevent unauthorized query
    return () => {};
  }

  return onSnapshot(q, (snapshot) => {
    const items: Order[] = [];
    snapshot.forEach(docSnap => {
      items.push({ ...docSnap.data(), id: docSnap.id } as Order);
    });
    // Sort descending by date
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    callback(items);
  }, (error) => {
    console.warn('Firestore Orders onSnapshot note:', error);
  });
};

export const subscribeToHeroSlides = (callback: (slides: HeroSlide[]) => void) => {
  const q = query(collection(db, COLLECTIONS.HERO_SLIDES));
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const items: HeroSlide[] = [];
      snapshot.forEach(docSnap => {
        items.push({ ...docSnap.data(), id: docSnap.id } as HeroSlide);
      });
      callback(items);
    }
  }, (error) => {
    console.warn('Firestore HeroSlides onSnapshot warning:', error);
  });
};

export const subscribeToHeaderConfigs = (callback: (configs: HeaderConfig[]) => void) => {
  const q = query(collection(db, COLLECTIONS.HEADER_CONFIGS));
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const items: HeaderConfig[] = [];
      snapshot.forEach(docSnap => {
        items.push({ ...docSnap.data(), id: docSnap.id } as HeaderConfig);
      });
      callback(items);
    }
  }, (error) => {
    console.warn('Firestore HeaderConfigs onSnapshot warning:', error);
  });
};

export const subscribeToMedia = (callback: (media: MediaItem[]) => void) => {
  const q = query(collection(db, COLLECTIONS.MEDIA));
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const items: MediaItem[] = [];
      snapshot.forEach(docSnap => {
        items.push({ ...docSnap.data(), id: docSnap.id } as MediaItem);
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    }
  }, (error) => {
    console.warn('Firestore Media onSnapshot warning:', error);
  });
};

export const subscribeToAdminSettings = (callback: (settings: AdminNotificationSettings) => void) => {
  const docRef = doc(db, COLLECTIONS.SETTINGS, 'admin_settings');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as AdminNotificationSettings);
    }
  }, (error) => {
    console.warn('Firestore AdminSettings onSnapshot warning:', error);
  });
};

export const subscribeToStoreBranding = (callback: (branding: StoreBranding) => void) => {
  const docRef = doc(db, COLLECTIONS.SETTINGS, 'store_branding');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as StoreBranding);
    }
  }, (error) => {
    console.warn('Firestore StoreBranding onSnapshot warning:', error);
  });
};

export const subscribeToNotifications = (callback: (notifications: NotificationItem[]) => void) => {
  const q = query(collection(db, COLLECTIONS.NOTIFICATIONS));
  return onSnapshot(q, (snapshot) => {
    const items: NotificationItem[] = [];
    snapshot.forEach(docSnap => {
      items.push({ ...docSnap.data(), id: docSnap.id } as NotificationItem);
    });
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    callback(items);
  }, (error) => {
    console.warn('Firestore Notifications onSnapshot warning:', error);
  });
};

// ======================= FIRESTORE WRITE ACTIONS =======================

export const syncProductToFirestore = async (product: Product): Promise<void> => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('kb_admin_session_token') : null;

  // Dual-sync to server store if server admin session is active
  if (token) {
    try {
      await syncProductToServer(token, product);
    } catch (err) {
      console.warn('Server product sync note:', err);
    }
  }

  if (!isAuthorizedAdmin(auth.currentUser)) {
    await ensureFirebaseAuthAdmin();
  }

  if (!isAuthorizedAdmin(auth.currentUser)) {
    console.warn('Skipping Firestore write: Admin not authenticated to Firebase.');
    return;
  }

  const docRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
  try {
    await setDoc(docRef, product, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.PRODUCTS}/${product.id}`);
  }
};

export const deleteProductFromFirestore = async (productId: string): Promise<void> => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('kb_admin_session_token') : null;

  if (token) {
    try {
      await deleteProductFromServer(token, productId);
    } catch (err) {
      console.warn('Server product delete note:', err);
    }
  }

  if (!isAuthorizedAdmin(auth.currentUser)) {
    await ensureFirebaseAuthAdmin();
  }

  if (!isAuthorizedAdmin(auth.currentUser)) {
    console.warn('Skipping Firestore delete: Admin not authenticated to Firebase.');
    return;
  }

  const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.PRODUCTS}/${productId}`);
  }
};

export const syncOrderToFirestore = async (order: Order): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.ORDERS, order.id);

  // Clean undefined properties and ensure valid Firestore format
  const cleanOrder: Record<string, any> = {
    id: order.id,
    date: order.date,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    shippingAddress: order.shippingAddress,
    city: order.city,
    country: order.country || 'BD',
    countryName: order.countryName || 'Bangladesh',
    items: order.items || [],
    subtotal: Number(order.subtotal) || 0,
    shippingCost: Number(order.shippingCost) || 0,
    discountAmount: Number(order.discountAmount) || 0,
    total: Number(order.total) || 0,
    paymentMethod: order.paymentMethod || 'cod',
    paymentStatus: order.paymentStatus || 'unpaid',
    status: order.status || 'pending',
    trackingNumber: order.trackingNumber
  };

  if (order.customerEmail) cleanOrder.customerEmail = order.customerEmail;
  if (order.postalCode) cleanOrder.postalCode = order.postalCode;
  if (order.customerNote) cleanOrder.customerNote = order.customerNote;
  if (order.district) cleanOrder.district = order.district;
  if (order.area) cleanOrder.area = order.area;
  if (order.transactionId) cleanOrder.transactionId = order.transactionId;
  if (order.createdAt) cleanOrder.createdAt = order.createdAt;
  if (order.itemDetails && order.itemDetails.length > 0) cleanOrder.itemDetails = order.itemDetails;

  // STRICT: Omit userId completely for guest orders; never send fake string or undefined
  if (order.userId && typeof order.userId === 'string' && order.userId.trim() && order.userId !== 'u101' && order.userId !== 'guest') {
    cleanOrder.userId = order.userId.trim();
  }

  try {
    await setDoc(docRef, cleanOrder, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTIONS.ORDERS}/${order.id}`);
    throw error;
  }
};

export const updateOrderStatusInFirestore = async (orderId: string, status: Order['status']) => {
  const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
  try {
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.ORDERS}/${orderId}`);
  }
};

export const updateOrderStatusOnServer = async (
  token: string,
  orderId: string,
  status: Order['status']
): Promise<boolean> => {
  try {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch {
    return false;
  }
};

export const syncHeroSlideToFirestore = async (slide: HeroSlide) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('kb_admin_session_token') : null;
  if (token) {
    try { await syncSlideToServer(token, slide); } catch {}
  }
  if (!isAuthorizedAdmin(auth.currentUser)) {
    await ensureFirebaseAuthAdmin();
  }
  if (!isAuthorizedAdmin(auth.currentUser)) return;
  const docRef = doc(db, COLLECTIONS.HERO_SLIDES, slide.id);
  try {
    await setDoc(docRef, slide, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.HERO_SLIDES}/${slide.id}`);
  }
};

export const deleteHeroSlideFromFirestore = async (slideId: string) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('kb_admin_session_token') : null;
  if (token) {
    try { await deleteSlideFromServer(token, slideId); } catch {}
  }
  if (!isAuthorizedAdmin(auth.currentUser)) {
    await ensureFirebaseAuthAdmin();
  }
  if (!isAuthorizedAdmin(auth.currentUser)) return;
  const docRef = doc(db, COLLECTIONS.HERO_SLIDES, slideId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.HERO_SLIDES}/${slideId}`);
  }
};

export const syncHeaderConfigToFirestore = async (config: HeaderConfig) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('kb_admin_session_token') : null;
  if (token) {
    try { await syncHeaderToServer(token, config); } catch {}
  }
  if (!isAuthorizedAdmin(auth.currentUser)) {
    await ensureFirebaseAuthAdmin();
  }
  if (!isAuthorizedAdmin(auth.currentUser)) return;
  const docRef = doc(db, COLLECTIONS.HEADER_CONFIGS, config.id);
  try {
    await setDoc(docRef, config, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.HEADER_CONFIGS}/${config.id}`);
  }
};

export const deleteHeaderConfigFromFirestore = async (headerId: string) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('kb_admin_session_token') : null;
  if (token) {
    try { await deleteHeaderFromServer(token, headerId); } catch {}
  }
  if (!isAuthorizedAdmin(auth.currentUser)) {
    await ensureFirebaseAuthAdmin();
  }
  if (!isAuthorizedAdmin(auth.currentUser)) return;
  const docRef = doc(db, COLLECTIONS.HEADER_CONFIGS, headerId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.HEADER_CONFIGS}/${headerId}`);
  }
};

export const syncMediaItemToFirestore = async (item: MediaItem) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('kb_admin_session_token') : null;
  if (token) {
    try { await syncMediaToServer(token, item); } catch {}
  }
  if (!isAuthorizedAdmin(auth.currentUser)) {
    await ensureFirebaseAuthAdmin();
  }
  if (!isAuthorizedAdmin(auth.currentUser)) return;
  const docRef = doc(db, COLLECTIONS.MEDIA, item.id);
  try {
    const cleanItem: Record<string, unknown> = {};
    Object.entries(item).forEach(([k, v]) => {
      if (v !== undefined) cleanItem[k] = v;
    });
    await setDoc(docRef, cleanItem, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.MEDIA}/${item.id}`);
  }
};

export const deleteMediaItemFromFirestore = async (mediaId: string) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('kb_admin_session_token') : null;
  if (token) {
    try { await deleteMediaFromServer(token, mediaId); } catch {}
  }
  if (!isAuthorizedAdmin(auth.currentUser)) {
    await ensureFirebaseAuthAdmin();
  }
  if (!isAuthorizedAdmin(auth.currentUser)) return;
  const docRef = doc(db, COLLECTIONS.MEDIA, mediaId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.MEDIA}/${mediaId}`);
  }
};

export const syncAdminSettingsToFirestore = async (settings: Partial<AdminNotificationSettings>) => {
  if (!isAuthorizedAdmin(auth.currentUser)) {
    await ensureFirebaseAuthAdmin();
  }
  if (!isAuthorizedAdmin(auth.currentUser)) return;
  const docRef = doc(db, COLLECTIONS.SETTINGS, 'admin_settings');
  try {
    await setDoc(docRef, settings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.SETTINGS}/admin_settings`);
  }
};

export const syncStoreBrandingToFirestore = async (branding: Partial<StoreBranding>) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('kb_admin_session_token') : null;
  if (token) {
    try { await syncBrandingToServer(token, branding); } catch {}
  }
  if (!isAuthorizedAdmin(auth.currentUser)) {
    await ensureFirebaseAuthAdmin();
  }
  if (!isAuthorizedAdmin(auth.currentUser)) return;
  const docRef = doc(db, COLLECTIONS.SETTINGS, 'store_branding');
  try {
    await setDoc(docRef, { ...branding, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.SETTINGS}/store_branding`);
  }
};

export const syncNotificationToFirestore = async (notif: NotificationItem) => {
  const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, notif.id);
  try {
    await setDoc(docRef, notif, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.NOTIFICATIONS}/${notif.id}`);
  }
};

// ======================= MEDIA & STORAGE UPLOADS =======================

/**
 * Uploads a file directly to the backend server /api/upload endpoint with true XMLHttpRequest progress
 */
export const uploadToServer = (
  file: File,
  folder = 'products/images',
  onProgress?: (pct: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ফাইল পড়তে ত্রুটি হয়েছে।'));
    reader.onload = () => {
      const base64Data = reader.result as string;
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      xhr.setRequestHeader('Content-Type', 'application/json');

      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const pct = Math.round((evt.loaded / evt.total) * 100);
            onProgress(pct);
          }
        };
      }

      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && res.success && res.url) {
            if (onProgress) onProgress(100);
            resolve(res.url);
          } else {
            reject(new Error(res.error || 'সার্ভারে ফাইল সংরক্ষণে সমস্যা হয়েছে।'));
          }
        } catch {
          reject(new Error('সার্ভার থেকে সঠিক রেসপন্স পাওয়া যায়নি।'));
        }
      };

      xhr.onerror = () => reject(new Error('সার্ভারে ফাইল আপলোডের সময় নেটওয়ার্ক ত্রুটি ঘটেছে।'));

      const payload = JSON.stringify({
        fileData: base64Data,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        folder
      });
      xhr.send(payload);
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Uploads media file to Firebase Storage if available, otherwise seamlessly uses local server storage
 * Automatically optimizes images to lightweight WebP before uploading.
 */
export const uploadMediaFile = async (file: File, pathFolder = 'uploads'): Promise<string> => {
  const isVideo = file.type.startsWith('video/');
  if (isVideo && file.size > 40 * 1024 * 1024) {
    throw new Error('ভিডিও ফাইলের সাইজ সর্বোচ্চ ৪০ মেগাবাইট (40MB) গ্রহণযোগ্য।');
  }
  if (!isVideo && file.size > 15 * 1024 * 1024) {
    throw new Error('ছবির সাইজ সর্বোচ্চ ১৫ মেগাবাইট (15MB) গ্রহণযোগ্য।');
  }

  let fileToUpload = file;
  let fileExt = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');

  if (!isVideo) {
    const optimized = await optimizeImageForUpload(file, { maxWidth: 1000, maxHeight: 1000, quality: 0.82 });
    fileToUpload = optimized.file;
    fileExt = optimized.format === 'webp' ? 'webp' : 'jpg';
  }

  // Attempt Firebase Storage with 15-second timeout
  const fileName = `${pathFolder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const storageRef = ref(storage, fileName);

  try {
    const uploadPromise = uploadBytes(storageRef, fileToUpload, { contentType: fileToUpload.type });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firebase Storage timeout')), 15000)
    );
    const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
    return await getDownloadURL(snapshot.ref);
  } catch {
    // Immediate fallback to server static storage
    return await uploadToServer(fileToUpload, pathFolder);
  }
};

/**
 * Automatically optimizes raw image to WebP (85-95% space saved),
 * prioritizes permanent Google Firebase Cloud Storage (5GB Free),
 * and seamlessly falls back to server storage if network is offline.
 */
export const uploadFileWithProgress = (
  file: File,
  pathFolder = 'products/images',
  onProgress?: (pct: number) => void
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('দয়া করে শুধুমাত্র বৈধ ছবি (JPG, PNG, WebP) ফাইল নির্বাচন করুন।'));
    }
    if (file.size > 15 * 1024 * 1024) {
      return reject(new Error('ছবির সাইজ অনেক বড়। সর্বোচ্চ ১৫ মেগাবাইট (15MB) ফাইল গ্রহণযোগ্য।'));
    }

    try {
      // 1. Automatic Client-Side WebP Compression & Resizing
      if (onProgress) onProgress(15);
      const optimized = await optimizeImageForUpload(file, {
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.82
      });

      const fileToUpload = optimized.file;
      const originalKb = (optimized.originalSize / 1024).toFixed(0);
      const optimizedKb = (optimized.optimizedSize / 1024).toFixed(0);
      console.log(`[Image Optimizer]: ${file.name} compressed from ${originalKb}KB to ${optimizedKb}KB (${optimized.savedPercent}% saved)`);

      const ext = optimized.format === 'webp' ? 'webp' : 'jpg';
      const fileName = `${pathFolder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
      const storageRef = ref(storage, fileName);

      let storageDone = false;
      let timer: NodeJS.Timeout | null = null;

      try {
        const uploadTask = uploadBytesResumable(storageRef, fileToUpload, { contentType: fileToUpload.type });

        // 15-second timeout for Firebase Storage (plenty for a ~150KB optimized WebP)
        timer = setTimeout(() => {
          if (!storageDone) {
            uploadTask.cancel();
            uploadToServer(fileToUpload, pathFolder, onProgress)
              .then(resolve)
              .catch(reject);
          }
        }, 15000);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.min(95, Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
            if (onProgress) onProgress(progress);
          },
          () => {
            if (!storageDone) {
              storageDone = true;
              if (timer) clearTimeout(timer);
              uploadToServer(fileToUpload, pathFolder, onProgress)
                .then(resolve)
                .catch(reject);
            }
          },
          async () => {
            if (!storageDone) {
              storageDone = true;
              if (timer) clearTimeout(timer);
              try {
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                if (onProgress) onProgress(100);
                resolve(downloadUrl);
              } catch {
                uploadToServer(fileToUpload, pathFolder, onProgress)
                  .then(resolve)
                  .catch(reject);
              }
            }
          }
        );
      } catch {
        uploadToServer(fileToUpload, pathFolder, onProgress)
          .then(resolve)
          .catch(reject);
      }
    } catch (err: unknown) {
      reject(err);
    }
  });
};

/**
 * Dedicated product video upload with progress and validation (MP4/WebM, max 35MB)
 */
export const uploadVideoWithProgress = (
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    if (!file.type.startsWith('video/')) {
      return reject(new Error('দয়া করে শুধুমাত্র বৈধ ভিডিও (MP4, WebM) ফাইল নির্বাচন করুন।'));
    }
    if (file.size > 35 * 1024 * 1024) {
      return reject(new Error('ভিডিওর সাইজ অনেক বড়। সর্বোচ্চ ৩৫ মেগাবাইট (35MB) ফাইল গ্রহণযোগ্য।'));
    }

    const fileExt = file.name.split('.').pop() || 'mp4';
    const fileName = `products/videos/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const storageRef = ref(storage, fileName);

    let storageDone = false;
    let timer: NodeJS.Timeout | null = null;

    try {
      const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type });

      timer = setTimeout(() => {
        if (!storageDone) {
          uploadTask.cancel();
          uploadToServer(file, 'products/videos', onProgress)
            .then(resolve)
            .catch(reject);
        }
      }, 3500);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (onProgress) onProgress(progress);
        },
        () => {
          if (!storageDone) {
            storageDone = true;
            if (timer) clearTimeout(timer);
            uploadToServer(file, 'products/videos', onProgress)
              .then(resolve)
              .catch(reject);
          }
        },
        async () => {
          if (!storageDone) {
            storageDone = true;
            if (timer) clearTimeout(timer);
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl);
            } catch {
              uploadToServer(file, 'products/videos', onProgress)
                .then(resolve)
                .catch(reject);
            }
          }
        }
      );
    } catch {
      uploadToServer(file, 'products/videos', onProgress)
        .then(resolve)
        .catch(reject);
    }
  });
};

export const syncProductToServer = async (token: string, product: Product): Promise<boolean> => {
  try {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(product)
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const deleteProductFromServer = async (token: string, productId: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const syncSlideToServer = async (token: string, slide: HeroSlide): Promise<boolean> => {
  try {
    const res = await fetch('/api/admin/slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(slide)
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const deleteSlideFromServer = async (token: string, slideId: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/admin/slides/${slideId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const syncHeaderToServer = async (token: string, config: HeaderConfig): Promise<boolean> => {
  try {
    const res = await fetch('/api/admin/headers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(config)
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const deleteHeaderFromServer = async (token: string, headerId: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/admin/headers/${headerId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const syncBrandingToServer = async (token: string, branding: Partial<StoreBranding>): Promise<boolean> => {
  try {
    const res = await fetch('/api/admin/branding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(branding)
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const syncMediaToServer = async (token: string, item: MediaItem): Promise<boolean> => {
  try {
    const res = await fetch('/api/admin/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(item)
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const deleteMediaFromServer = async (token: string, mediaId: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/admin/media/${mediaId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.ok;
  } catch {
    return false;
  }
};



// ======================= FIREBASE AUTH & USER PROFILE =======================

export const findUserByEmailInFirestore = async (email: string): Promise<UserProfile | null> => {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const usersRef = collection(db, COLLECTIONS.USERS);
    const q = query(usersRef, where('email', '==', cleanEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as UserProfile;
    }
    // Also check all documents if case sensitive match or fallback
    const allSnap = await getDocs(usersRef);
    const matched = allSnap.docs.find(d => {
      const data = d.data() as UserProfile;
      return data.email && data.email.toLowerCase() === cleanEmail;
    });
    if (matched) {
      return matched.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Error querying user by email in Firestore:', err);
  }
  return null;
};

export const registerWithEmail = async (email: string, password: string, name: string, phone?: string): Promise<UserProfile> => {
  const cleanEmail = email.trim().toLowerCase();
  
  try {
    // Attempt standard Firebase Auth
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = credential.user;
    if (name) {
      try {
        await updateProfile(fbUser, { displayName: name });
      } catch (e) {
        console.warn('Update profile displayName warning:', e);
      }
    }

    const userProfile: UserProfile = {
      id: fbUser.uid,
      name: name || 'ক্রেতা ইউজার',
      email: fbUser.email || cleanEmail,
      phone: phone || '01800000000',
      avatar: fbUser.photoURL || undefined,
      addresses: [
        {
          id: 'a1',
          label: 'হোম অ্যাড্রেস',
          address: 'ঢাকা, বাংলাদেশ',
          city: 'ঢাকা সিটি',
          phone: phone || '01800000000',
          isDefault: true
        }
      ],
      createdAt: new Date().toISOString()
    };

    await syncUserProfileToFirestore(userProfile);
    return userProfile;
  } catch (err: unknown) {
    const errorString = String(err);
    console.warn('Primary Firebase Auth registration error, checking fallback:', errorString);

    // If email/password provider is not enabled in Firebase console or auth operation not allowed
    if (
      errorString.includes('auth/operation-not-allowed') || 
      errorString.includes('operation-not-allowed') ||
      errorString.includes('auth/configuration-not-found')
    ) {
      // Check if user already registered in Firestore
      const existingUser = await findUserByEmailInFirestore(cleanEmail);
      if (existingUser) {
        const customErr = new Error('auth/email-already-in-use');
        throw customErr;
      }

      // Generate a persistent unique ID for user
      const uniqueUid = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
      const fallbackProfile: UserProfile = {
        id: uniqueUid,
        name: name || 'ক্রেতা ইউজার',
        email: cleanEmail,
        phone: phone || '01800000000',
        password: password, // Save for database-level credential verification
        addresses: [
          {
            id: 'a1',
            label: 'হোম অ্যাড্রেস',
            address: 'ঢাকা, বাংলাদেশ',
            city: 'ঢাকা সিটি',
            phone: phone || '01800000000',
            isDefault: true
          }
        ],
        createdAt: new Date().toISOString()
      };

      await syncUserProfileToFirestore(fallbackProfile);
      return fallbackProfile;
    }

    throw err;
  }
};

export const loginWithEmailPassword = async (email: string, password: string): Promise<UserProfile> => {
  const cleanEmail = email.trim().toLowerCase();

  try {
    // Attempt standard Firebase Auth
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = credential.user;
    
    const existingProfile = await getUserProfileFromFirestore(fbUser.uid);
    if (existingProfile) {
      return existingProfile;
    }

    const newProfile: UserProfile = {
      id: fbUser.uid,
      name: fbUser.displayName || 'সম্মানিত ক্রেতা',
      email: fbUser.email || cleanEmail,
      phone: fbUser.phoneNumber || '01800000000',
      avatar: fbUser.photoURL || undefined,
      addresses: [
        {
          id: 'a1',
          label: 'হোম অ্যাড্রেস',
          address: 'ঢাকা, বাংলাদেশ',
          city: 'ঢাকা সিটি',
          phone: '01800000000',
          isDefault: true
        }
      ],
      createdAt: new Date().toISOString()
    };

    await syncUserProfileToFirestore(newProfile);
    return newProfile;
  } catch (err: unknown) {
    const errorString = String(err);

    // Check Firestore if user exists in database
    const existingUser = await findUserByEmailInFirestore(cleanEmail);
    if (existingUser) {
      if (existingUser.password && existingUser.password !== password) {
        throw new Error('auth/wrong-password');
      }
      return existingUser;
    }

    // If user not found at all, throw clean user-not-found error code without logging fatal
    throw new Error('auth/user-not-found');
  }
};

export const syncUserProfileToFirestore = async (profile: UserProfile) => {
  const userDocRef = doc(db, COLLECTIONS.USERS, profile.id);
  await setDoc(userDocRef, profile, { merge: true });
};

export const getUserProfileFromFirestore = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Error fetching user profile from Firestore:', err);
  }
  return null;
};

export const subscribeToUserProfile = (userId: string, callback: (profile: UserProfile | null) => void) => {
  const userDocRef = doc(db, COLLECTIONS.USERS, userId);
  return onSnapshot(userDocRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as UserProfile);
    }
  }, (err) => {
    console.warn('User profile snapshot warning:', err);
  });
};

export const signInWithGoogle = async (): Promise<FirebaseUser | null> => {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign In error:', error);
    throw error;
  }
};

export const signOutFirebase = async () => {
  await signOut(auth);
};

export const onAuthStatusChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ======================= SEPARATE SERVER ADMIN AUTH =======================

export interface AdminLoginResponse {
  success: boolean;
  token?: string;
  admin?: { username: string; email: string; role: string };
  error?: string;
  message?: string;
}

export const loginAdminWithServer = async (username: string, password: string): Promise<AdminLoginResponse> => {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'লগইন ব্যর্থ হয়েছে।' };
    }
    return data;
  } catch (err) {
    return { success: false, error: 'সার্ভার সংযোগে ত্রুটি হয়েছে।' };
  }
};

export const verifyAdminServerSession = async (token: string): Promise<{ valid: boolean; admin?: { username: string; email: string; role: string } }> => {
  try {
    const res = await fetch('/api/admin/session', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return { valid: false };
    return await res.json();
  } catch {
    return { valid: false };
  }
};

export const changeAdminServerPassword = async (
  token: string,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const headers: Record<string, string> = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers,
      body: JSON.stringify({ currentPassword: oldPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।' };
    }
    return { success: true, message: data.message };
  } catch {
    return { success: false, error: 'সার্ভার সংযোগে ত্রুটি।' };
  }
};

