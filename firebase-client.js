import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  linkWithPopup,
  linkWithRedirect,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-storage.js';
import { getMessaging, getToken, onMessage, isSupported as messagingIsSupported } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-messaging.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-functions.js';

const app = initializeApp({
  apiKey: 'AIzaSyB1byxcijqYpzdRhoZETKmMGiTPq_y1uS4',
  authDomain: 'alazhar-city-delivery.firebaseapp.com',
  projectId: 'alazhar-city-delivery',
  storageBucket: 'alazhar-city-delivery.firebasestorage.app',
  messagingSenderId: '604870856587',
  appId: '1:604870856587:web:f5af0a344ab4568e04e98e'
});

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app, 'us-central1');
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

let currentUser = null;
let currentProfile = null;
let currentClaims = {};
let stopOrderListeners = [];
let persistenceReady = false;
let foregroundPushBound = false;

const ROLE_CUSTOMER = 'customer';
const PRIVILEGED_ROLES = new Set(['admin', 'store', 'rider']);

function normalizeProfile(user, profile = null, claims = currentClaims) {
  const claimRole = typeof claims?.role === 'string' ? claims.role : ROLE_CUSTOMER;
  const privileged = PRIVILEGED_ROLES.has(claimRole);
  return {
    ...(profile || {}),
    role: claimRole,
    name: user?.displayName || profile?.name || (privileged ? 'مستخدم الفريق' : 'عميل الأزهر'),
    email: user?.email || profile?.email || '',
    phone: profile?.phone || user?.phoneNumber || '',
    photoURL: user?.photoURL || profile?.photoURL || '',
    storeId: privileged && claimRole === 'store' ? (claims.storeId || null) : null,
    riderId: privileged && claimRole === 'rider' ? (claims.riderId || null) : null,
    savedAddresses: Array.isArray(profile?.savedAddresses) ? profile.savedAddresses : [],
    emailVerified: !!user?.emailVerified,
    disabled: !!user?.disabled
  };
}

async function getClaims(user = currentUser, forceRefresh = false) {
  if (!user) return {};
  const token = await user.getIdTokenResult(forceRefresh);
  currentClaims = token.claims || {};
  return currentClaims;
}

async function fetchUserProfile(uid) {
  if (!uid) return null;
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

async function ensurePersistence() {
  if (persistenceReady) return;
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (err) {
    console.warn('Firebase persistence unavailable:', err?.code || err);
  }
  persistenceReady = true;
}

function emitProfile() {
  window.dispatchEvent(new CustomEvent('acd-auth-profile', {
    detail: currentProfile
  }));
}

function readableAuthError(error) {
  const code = String(error?.code || error?.message || '');
  const map = {
    'auth/email-already-in-use': 'هذا البريد الإلكتروني مستخدم بالفعل. جرّب تسجيل الدخول أو إعادة تعيين كلمة المرور.',
    'auth/invalid-email': 'البريد الإلكتروني غير صحيح.',
    'auth/invalid-credential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    'auth/invalid-login-credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    'auth/user-not-found': 'لا يوجد حساب بهذا البريد الإلكتروني.',
    'auth/wrong-password': 'كلمة المرور غير صحيحة.',
    'auth/weak-password': 'كلمة المرور ضعيفة. استخدم 8 أحرف/أرقام على الأقل مع تنوع مناسب.',
    'auth/too-many-requests': 'تم إيقاف محاولات الدخول مؤقتاً للحماية. حاول لاحقاً.',
    'auth/popup-closed-by-user': 'تم إغلاق نافذة تسجيل الدخول.',
    'auth/popup-blocked': 'المتصفح منع نافذة تسجيل الدخول. اسمح بالنوافذ المنبثقة وحاول مرة أخرى.',
    'auth/account-exists-with-different-credential': 'الحساب ده موجود بالفعل. سجّل الدخول بالطريقة اللي كنت بتستخدمها، وبعدها من «حسابي» اختار «ربط Google».',
    'auth/unauthorized-domain': 'الرابط الحالي غير مضاف في Firebase Authentication. أضف الدومين من Authorized domains.',
    'auth/cancelled-popup-request': 'في نافذة تسجيل دخول مفتوحة بالفعل. كمّلها أو اقفلها وحاول تاني.',
    'auth/provider-already-linked': 'حساب Google مرتبط بالفعل بحسابك.',
    'auth/credential-already-in-use': 'حساب Google ده مرتبط بحساب تاني في المنصة.',
    'SIGN_IN_REQUIRED': 'سجّل الدخول أولاً ثم جرّب مرة أخرى.',
    'NAME_REQUIRED': 'اكتب الاسم بالكامل.',
    'PHONE_INVALID': 'رقم الموبايل غير صحيح.',
    'auth/network-request-failed': 'تعذر الاتصال بخدمة تسجيل الدخول. تحقق من الإنترنت وحاول مرة أخرى.',
    'auth/requires-recent-login': 'لأسباب أمنية، سجّل الدخول مرة أخرى ثم أعد المحاولة.',
    'auth/operation-not-allowed': 'طريقة تسجيل الدخول المطلوبة غير مفعلة في Firebase Authentication.',
    'functions/unauthenticated': 'سجّل دخولك من جديد ثم حاول الإرسال.',
    'functions/permission-denied': 'إرسال الإشعارات متاح لحساب الإدارة المعتمد فقط.',
    'functions/unavailable': 'خدمة الإشعارات لسه مش منشورة أو غير متاحة حاليًا.',
    'functions/failed-precondition': 'خدمة الإشعارات محتاجة إعداد Firebase قبل الاستخدام.',
    'functions/not-found': 'ميزة البث لسه محتاجة نشر Firebase Cloud Functions.',
    'functions/invalid-argument': 'راجع عنوان الإشعار والرسالة وحاول تاني.',
    'functions/internal': 'حصلت مشكلة داخل خدمة الإشعارات. راجع سجلات Firebase وحاول تاني.',
    'functions/resource-exhausted': 'تم إرسال إشعار قريبًا. استنى شوية قبل ما تبعت إشعار تاني.',
    'auth/user-disabled': 'هذا الحساب متوقف. تواصل مع إدارة المنصة.',
    'FORBIDDEN': 'مش مسموح للحساب ده بتنفيذ العملية المطلوبة.',
    'PRODUCT_REQUIRED': 'اكتب اسم المنتج واختار القسم على الأقل.',
    'PRODUCT_PRICE_REQUIRED': 'اكتب السعر الحالي للمنتج أو سيبه غير متاح للطلب لحد التأكيد.',
    'OFFER_REQUIRED': 'اكتب عنوان العرض على الأقل.',
    'IMAGE_REQUIRED': 'اختار صورة للمنتج.',
    'IMAGE_TYPE': 'اختار ملف صورة صالح.',
    'IMAGE_TOO_LARGE': 'الصورة كبيرة جدًا. الحد الأقصى 5 ميجابايت.',
    'EMAIL_NOT_VERIFIED': 'فعّل بريدك الإلكتروني أولاً. أرسلنا لك رابط تفعيل ويمكنك إعادة إرساله من الحساب.',
    'RATING_AFTER_DELIVERY_ONLY': 'التقييم متاح بعد استلام الطلب.',
    'HOURS_INVALID': 'اختار ميعاد فتح وقفل مختلفين.',
    'PUSH_SIGN_IN_REQUIRED': 'سجّل دخول بحساب عميل الأول علشان نربط الإشعارات بجهازك.',
    'PUSH_UNSUPPORTED': 'الإشعارات مش مدعومة في المتصفح أو الجهاز ده. جرّب تثبيت التطبيق على الشاشة الرئيسية.',
    'PUSH_VAPID_MISSING': 'إعداد الإشعارات ناقص من لوحة الإدارة. المفتاح العام مطلوب من إعدادات Firebase.',
    'PUSH_PERMISSION_DENIED': 'الإشعارات مرفوضة من إعدادات الجهاز. فعّلها للتطبيق وجرب تاني.',
    'PUSH_PERMISSION_NOT_GRANTED': 'لازم توافق على الإشعارات علشان توصلك تنبيهات المتاجر.',
    'PUSH_TOKEN_FAILED': 'ماقدرناش نسجل الجهاز للإشعارات. جرّب تاني بعد تثبيت التطبيق.',
    'NOTIFICATION_TEXT_REQUIRED': 'اكتب عنوان ورسالة قصيرة قبل الإرسال.',
    'ALREADY_RATED': 'تم تقييم هذا الطلب بالفعل.'
  };
  return map[code] || error?.message || 'حدث خطأ غير متوقع. حاول مرة أخرى.';
}

async function syncCurrentProfile({createIfMissing = true} = {}) {
  if (!currentUser) {
    currentProfile = null;
    currentClaims = {};
    return null;
  }

  await getClaims(currentUser);
  const existing = await fetchUserProfile(currentUser.uid);
  const next = normalizeProfile(currentUser, existing, currentClaims);

  if (!existing && createIfMissing) {
    // A new browser account can only create a customer profile from the client.
    // Staff/admin profile creation is handled by the privileged setup script.
    const customerProfile = {
      role: ROLE_CUSTOMER,
      name: next.name,
      email: next.email,
      phone: next.phone,
      photoURL: next.photoURL,
      savedAddresses: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(doc(db, 'users', currentUser.uid), customerProfile, { merge: false });
    currentProfile = normalizeProfile(currentUser, customerProfile, currentClaims);
  } else {
    currentProfile = next;

    // Only synchronize safe, user-editable fields. Never let the client write role,
    // storeId, riderId, or other authorization attributes.
    if (existing) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), {
          name: currentProfile.name,
          email: currentProfile.email,
          phone: currentProfile.phone,
          photoURL: currentProfile.photoURL,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn('Profile sync failed:', err?.code || err);
      }
    }
  }

  emitProfile();
  return currentProfile;
}

function isLikelyMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '') || !!window.matchMedia?.('(max-width: 768px)')?.matches;
}

async function signIn(preferredRole) {
  void preferredRole;
  await ensurePersistence();
  sessionStorage.setItem('acd-google-auth-intent','1');
  if (isLikelyMobile()) { await signInWithRedirect(auth, googleProvider); return { redirecting: true }; }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    sessionStorage.removeItem('acd-google-auth-intent');
    currentUser=result.user;
    await currentUser.getIdToken(true);
    await syncCurrentProfile();
    return { user: currentUser, profile: currentProfile };
  } catch (error) {
    if (error?.code==='auth/popup-blocked' || error?.code==='auth/cancelled-popup-request') { await signInWithRedirect(auth,googleProvider); return {redirecting:true}; }
    sessionStorage.removeItem('acd-google-auth-intent');
    throw error;
  }
}

async function linkGoogleAccount(){
  if(!currentUser) throw new Error('SIGN_IN_REQUIRED');
  await ensurePersistence();
  if(isLikelyMobile()){ sessionStorage.setItem('acd-google-link-intent','1'); await linkWithRedirect(currentUser,googleProvider); return {redirecting:true}; }
  try { const result=await linkWithPopup(currentUser,googleProvider); currentUser=result.user; await currentUser.getIdToken(true); await syncCurrentProfile({createIfMissing:false}); return {user:currentUser,profile:currentProfile}; }
  catch(error){ if(error?.code==='auth/popup-blocked' || error?.code==='auth/cancelled-popup-request'){sessionStorage.setItem('acd-google-link-intent','1');await linkWithRedirect(currentUser,googleProvider);return {redirecting:true};} throw error; }
}

async function signUpWithEmail(email, password, displayName, phone, addressObj = null) {
  await ensurePersistence();
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) throw new Error('auth/invalid-email');
  if (String(password || '').length < 8) throw new Error('auth/weak-password');

  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  currentUser = cred.user;

  const safeName = String(displayName || '').trim().slice(0, 80);
  const safePhone = String(phone || '').replace(/\D/g, '').slice(0, 15);
  if (safeName) {
    try { await updateProfile(currentUser, { displayName: safeName }); } catch (_) {}
  }

  let savedAddresses = [];
  if (addressObj && (addressObj.address || addressObj.lat || addressObj.lng)) {
    savedAddresses.push({
      id: window.crypto?.randomUUID?.() || `addr-${Date.now().toString(36)}`,
      label: String(addressObj.label || 'السكن').slice(0, 40),
      address: String(addressObj.address || '').slice(0, 250),
      lat: Number.isFinite(addressObj.lat) ? addressObj.lat : null,
      lng: Number.isFinite(addressObj.lng) ? addressObj.lng : null,
      isDefault: true
    });
  }

  await setDoc(doc(db, 'users', currentUser.uid), {
    role: ROLE_CUSTOMER,
    name: safeName || 'عميل الأزهر',
    email: cleanEmail,
    phone: safePhone,
    savedAddresses,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // Email verification is a normal production account-control step.
  await sendEmailVerification(currentUser);
  await syncCurrentProfile({createIfMissing: false});
  return { user: currentUser, profile: currentProfile };
}

async function signInWithEmail(email, password) {
  await ensurePersistence();
  const cred = await signInWithEmailAndPassword(auth, String(email || '').trim().toLowerCase(), String(password || ''));
  currentUser = cred.user;
  await syncCurrentProfile();
  return { user: currentUser, profile: currentProfile };
}

async function resetPassword(email) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) throw new Error('auth/invalid-email');
  await sendPasswordResetEmail(auth, cleanEmail, {
    url: `${window.location.origin}${window.location.pathname}`,
    handleCodeInApp: false
  });
}

async function resendVerification() {
  if (!currentUser) throw new Error('SIGN_IN_REQUIRED');
  if (currentUser.emailVerified) return;
  await sendEmailVerification(currentUser);
}

async function refreshClaims() {
  if (!currentUser) return {};
  await getClaims(currentUser, true);
  await syncCurrentProfile({createIfMissing: false});
  return currentClaims;
}

async function saveCustomerProfile({name, phone}) {
  if (!currentUser) throw new Error('SIGN_IN_REQUIRED');
  const safeName = String(name || '').trim().slice(0, 80);
  const safePhone = String(phone || '').replace(/\D/g, '').slice(0, 15);
  if (safeName.length < 3) throw new Error('NAME_REQUIRED');
  if (safePhone && !/^(20)?1[0125]\d{8}$/.test(safePhone.replace(/^0/, ''))) throw new Error('PHONE_INVALID');

  if (safeName !== currentUser.displayName) {
    await updateProfile(currentUser, { displayName: safeName });
  }
  await updateDoc(doc(db, 'users', currentUser.uid), {
    name: safeName,
    phone: safePhone,
    email: currentUser.email || '',
    updatedAt: serverTimestamp()
  });
  currentProfile = { ...currentProfile, name: safeName, phone: safePhone };
  emitProfile();
  return currentProfile;
}

async function saveCustomerAddress(addressObj) {
  if (!currentUser) throw new Error('SIGN_IN_REQUIRED');
  if (currentProfile?.role !== ROLE_CUSTOMER) throw new Error('FORBIDDEN');
  const existing = await fetchUserProfile(currentUser.uid) || {};
  let addresses = Array.isArray(existing.savedAddresses) ? existing.savedAddresses.slice() : [];
  const label = String(addressObj?.label || 'السكن').slice(0, 40);
  addresses = addresses.filter(a => a.label !== label);
  addresses.unshift({
    id: window.crypto?.randomUUID?.() || `addr-${Date.now().toString(36)}`,
    label,
    address: String(addressObj?.address || '').slice(0, 250),
    lat: Number.isFinite(addressObj?.lat) ? addressObj.lat : null,
    lng: Number.isFinite(addressObj?.lng) ? addressObj.lng : null,
    isDefault: true
  });

  const patch = {
    savedAddresses: addresses.slice(0, 10),
    phone: String(addressObj?.phone || existing.phone || '').replace(/\D/g, '').slice(0, 15),
    updatedAt: serverTimestamp()
  };
  await updateDoc(doc(db, 'users', currentUser.uid), patch);
  currentProfile = { ...currentProfile, ...patch };
  emitProfile();
  return currentProfile;
}


async function getPublicCatalog() {
  const snap = await getDocs(collection(db, 'products'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function getPublicOffers() {
  const snap = await getDocs(query(collection(db, 'offers'), where('active', '==', true)));
  const now = Date.now();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(o => !o.expiresAt || new Date(o.expiresAt).getTime() > now);
}

function requireAdmin() {
  if (!currentUser || currentProfile?.role !== 'admin') throw new Error('FORBIDDEN');
}

function cleanDocId(value, fallback) {
  const s = String(value || '').trim().toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  return s || fallback;
}

async function adminListProducts() {
  requireAdmin();
  const snap = await getDocs(collection(db, 'products'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a,b) => String(a.name||'').localeCompare(String(b.name||''), 'ar'));
}

async function adminSaveProduct(input) {
  requireAdmin();
  const id = cleanDocId(input?.id, 'product-' + Date.now().toString(36));
  const allowedStores = new Set(['market-1','koshary-hind','bakery-sixth','pizza-rahma','pharmacy-1']);
  const groupForCategory = { pain:'pharmacy',cold:'pharmacy',stomach:'pharmacy',vitamins:'pharmacy',firstaid:'pharmacy',skin:'pharmacy',hygiene:'pharmacy','koshary-menu':'koshary','pizza-menu':'pizza','bakery-shop':'bakeryShop' };
  const defaultStore = groupForCategory[input?.cat] === 'pharmacy' ? 'pharmacy-1' : groupForCategory[input?.cat] === 'koshary' ? 'koshary-hind' : groupForCategory[input?.cat] === 'pizza' ? 'pizza-rahma' : groupForCategory[input?.cat] === 'bakeryShop' ? 'bakery-sixth' : 'market-1';
  const storeId = allowedStores.has(String(input?.storeId || '')) ? String(input.storeId) : defaultStore;
  const data = {
    name: String(input?.name || '').trim().slice(0, 120),
    cat: String(input?.cat || '').trim().slice(0, 60),
    price: Math.max(0, Number(input?.price || 0)),
    oldPrice: Number(input?.oldPrice || 0),
    emoji: String(input?.emoji || '🛍️').slice(0, 8),
    badge: String(input?.badge || '').slice(0, 40),
    img: String(input?.img || '').slice(0, 300),
    storeId,
    active: input?.active !== false,
    soldOut: !!input?.soldOut,
    comingSoon: input?.comingSoon === true,
    updatedAt: serverTimestamp()
  };
  if (data.oldPrice <= data.price) delete data.oldPrice;
  if (!data.name || !data.cat) throw new Error('PRODUCT_REQUIRED');
  if (!data.comingSoon && data.price <= 0) throw new Error('PRODUCT_PRICE_REQUIRED');
  const ref = doc(db, 'products', id);
  const existing = await getDoc(ref);
  if (!existing.exists()) data.createdAt = serverTimestamp();
  await setDoc(ref, data, { merge: true });
  return { id, ...data };
}

async function adminDeleteProduct(id) {
  requireAdmin();
  await setDoc(doc(db, 'products', cleanDocId(id, id)), {
    active: false, updatedAt: serverTimestamp()
  }, { merge: true });
}

async function adminListOffers() {
  requireAdmin();
  const snap = await getDocs(collection(db, 'offers'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a,b) => Number(b.priority||0) - Number(a.priority||0));
}

async function adminSaveOffer(input) {
  requireAdmin();
  const id = cleanDocId(input?.id, 'offer-' + Date.now().toString(36));
  const data = {
    title: String(input?.title || '').trim().slice(0, 120),
    desc: String(input?.desc || '').trim().slice(0, 280),
    tag: String(input?.tag || 'عرض اليوم').trim().slice(0, 40),
    priority: Number(input?.priority || 0),
    expiresAt: String(input?.expiresAt || '').trim().slice(0, 40),
    active: input?.active !== false,
    updatedAt: serverTimestamp()
  };
  if (!data.title) throw new Error('OFFER_REQUIRED');
  const ref = doc(db, 'offers', id);
  const existing = await getDoc(ref);
  if (!existing.exists()) data.createdAt = serverTimestamp();
  await setDoc(ref, data, { merge: true });
  return { id, ...data };
}

async function adminDeleteOffer(id) {
  requireAdmin();
  await setDoc(doc(db, 'offers', cleanDocId(id, id)), {
    active: false, updatedAt: serverTimestamp()
  }, { merge: true });
}

async function getSiteSettings() {
  const snap = await getDoc(doc(db, 'settings', 'site'));
  return snap.exists() ? snap.data() : {};
}

function watchSiteSettings(callback) {
  if (typeof callback !== 'function') return () => {};
  return onSnapshot(doc(db, 'settings', 'site'), snap => callback(snap.exists() ? snap.data() : {}), error => {
    console.warn('Public shop settings unavailable:', error?.code || error);
  });
}

function cairoDateKey() {
  const parts = new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  return `${parts.find(x=>x.type==='year')?.value}-${parts.find(x=>x.type==='month')?.value}-${parts.find(x=>x.type==='day')?.value}`;
}

async function adminSaveSiteSettings(input) {
  requireAdmin();
  const toMinutes = (value, fallback) => {
    const match = /^(\d{2}):(\d{2})$/.exec(String(value || ''));
    if (match) { const h=Number(match[1]),m=Number(match[2]); if(h<24&&m<60)return h*60+m; }
    return Math.max(0,Number(fallback)||0)*60;
  };
  const openTime = /^\d{2}:\d{2}$/.test(String(input?.openTime||'')) ? String(input.openTime) : `${String(Number(input?.openHour ?? 6)%24).padStart(2,'0')}:00`;
  const closeTime = /^\d{2}:\d{2}$/.test(String(input?.closeTime||'')) ? String(input.closeTime) : `${String(Number(input?.closeHour ?? 14)%24).padStart(2,'0')}:00`;
  const openMinutes = toMinutes(openTime,6), closeMinutes = toMinutes(closeTime,14);
  if (openMinutes === closeMinutes) throw new Error('HOURS_INVALID');
  const closedToday = input?.closedToday === true;
  const data = {
    area: String(input?.area || '').trim().slice(0, 100),
    audience: String(input?.audience || '').trim().slice(0, 100),
    eta: String(input?.eta || '').trim().slice(0, 40),
    deliveryFee: Math.max(0, Number(input?.deliveryFee || 0)),
    freeDelivery: Math.max(0, Number(input?.freeDelivery || 0)),
    minOrder: Math.max(0, Number(input?.minOrder || 0)),
    openTime,
    closeTime,
    openHour: Math.floor(openMinutes/60),
    closeHour: Math.floor(closeMinutes/60) + (closeMinutes <= openMinutes ? 24 : 0),
    closedToday,
    closedTodayDate: closedToday ? cairoDateKey() : '',
    closedTodayReason: closedToday ? String(input?.closedTodayReason||'').trim().slice(0,120) : '',
    pushVapidKey: String(input?.pushVapidKey||'').trim().slice(0,500),
    updatedAt: serverTimestamp()
  };
  await setDoc(doc(db, 'settings', 'site'), data, { merge: true });
  return data;
}

async function enableCustomerPush() {
  if (!currentUser || currentProfile?.role !== ROLE_CUSTOMER) throw new Error('PUSH_SIGN_IN_REQUIRED');
  if (!currentUser.emailVerified) throw new Error('EMAIL_NOT_VERIFIED');
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) throw new Error('PUSH_UNSUPPORTED');
  const cachedKey=String(window.ACDSiteSettings?.pushVapidKey||'').trim();
  if (!cachedKey) throw new Error('PUSH_VAPID_MISSING');
  if (Notification.permission === 'denied') throw new Error('PUSH_PERMISSION_DENIED');
  const permissionPromise=Notification.permission === 'default' ? Notification.requestPermission() : Promise.resolve(Notification.permission);
  if (!(await messagingIsSupported())) throw new Error('PUSH_UNSUPPORTED');
  const vapidKey = cachedKey;
  if (!vapidKey) throw new Error('PUSH_VAPID_MISSING');
  const permission = await permissionPromise;
  if (permission !== 'granted') throw new Error(permission === 'denied' ? 'PUSH_PERMISSION_DENIED' : 'PUSH_PERMISSION_NOT_GRANTED');
  const registration = await navigator.serviceWorker.ready;
  const messaging=getMessaging(app);
  if(!foregroundPushBound){
    foregroundPushBound=true;
    onMessage(messaging,payload=>window.dispatchEvent(new CustomEvent('acd-push-message',{detail:payload?.data||{}})));
  }
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  if (!token) throw new Error('PUSH_TOKEN_FAILED');
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const tokenId = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,'0')).join('');
  await setDoc(doc(db,'users',currentUser.uid,'pushTokens',tokenId), {
    token,
    platform: /iphone|ipad|ipod/i.test(navigator.userAgent) ? 'ios' : /android/i.test(navigator.userAgent) ? 'android' : 'web',
    updatedAt: serverTimestamp()
  }, { merge: true });
  return { enabled: true };
}

async function sendBroadcastNotification({title, body}) {
  requireAdmin();
  const cleanTitle=String(title||'').trim().slice(0,80), cleanBody=String(body||'').trim().slice(0,180);
  if(!cleanTitle||!cleanBody)throw new Error('NOTIFICATION_TEXT_REQUIRED');
  const send=httpsCallable(functions,'sendCustomerAnnouncement');
  const result=await send({title:cleanTitle,body:cleanBody});
  return result.data||{sent:0,failed:0};
}


async function adminUploadProductImage(file, productId) {
  requireAdmin();
  if (!(file instanceof File)) throw new Error('IMAGE_REQUIRED');
  if (!String(file.type || '').startsWith('image/')) throw new Error('IMAGE_TYPE');
  if (file.size > 5 * 1024 * 1024) throw new Error('IMAGE_TOO_LARGE');
  const clean = cleanDocId(productId, 'product-' + Date.now().toString(36));
  const extension = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const ref = storageRef(storage, `product-images/${clean}.${extension}`);
  await uploadBytes(ref, file, { contentType: file.type });
  return getDownloadURL(ref);
}

async function createOrder(input) {
  if (!currentUser) throw new Error('SIGN_IN_REQUIRED');
  if (currentProfile?.role !== ROLE_CUSTOMER) throw new Error('FORBIDDEN');
  if (!currentUser.emailVerified) throw new Error('EMAIL_NOT_VERIFIED');

  const itemList = Array.isArray(input?.items) ? input.items.map(item => ({
    id: String(item.id || '').slice(0, 80),
    name: String(item.name || '').slice(0, 120),
    quantity: Math.max(1, Math.min(99, Number(item.quantity || 1))),
    price: Math.max(0, Number(item.price || 0))
  })) : [];
  const subtotal = Math.max(0, Number(input?.subtotal || 0));
  const deliveryFee = Math.max(0, Number(input?.deliveryFee || 0));
  const total = Math.max(0, Number(input?.total || subtotal + deliveryFee));
  const reference = 'AZ-' + Date.now().toString().slice(-8);

  const ref = await addDoc(collection(db, 'orders'), {
    reference,
    customerId: currentUser.uid,
    customerEmail: currentUser.email || '',
    customer: {
      name: String(input?.customer?.name || currentUser.displayName || 'عميل الأزهر').slice(0, 80),
      phone: String(input?.customer?.phone || currentProfile?.phone || '').replace(/\D/g, '').slice(0, 15),
      address: String(input?.customer?.address || '').slice(0, 250),
      note: String(input?.customer?.note || '').slice(0, 300),
      lat: Number.isFinite(input?.customer?.lat) ? input.customer.lat : null,
      lng: Number.isFinite(input?.customer?.lng) ? input.customer.lng : null,
      addressLabel: String(input?.customer?.addressLabel || 'السكن').slice(0, 40)
    },
    items: itemList,
    subtotal,
    deliveryFee,
    total,
    special: String(input?.special || '').slice(0, 300),
    hasPharma: !!input?.hasPharma,
    status: 'new',
    riderId: null,
    storeId: String(input?.storeId || (input?.hasPharma ? 'pharmacy-1' : 'market-1')),
    rating: null,
    ratedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return { id: ref.id, reference };
}

function mapOrderDoc(d) {
  const data = d.data();
  return {
    id: d.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || null
  };
}

async function getMyOrders() {
  if (!currentUser) return [];
  if (currentProfile?.role !== ROLE_CUSTOMER) return [];
  const snap = await getDocs(query(collection(db, 'orders'), where('customerId', '==', currentUser.uid)));
  return snap.docs.map(mapOrderDoc).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

async function getOrder(id) {
  if (!currentUser || !id) return null;
  const snap = await getDoc(doc(db, 'orders', id));
  if (!snap.exists()) return null;
  return mapOrderDoc(snap);
}

function stopAllOrderListeners() {
  stopOrderListeners.forEach(stop => {
    try { stop(); } catch (_) {}
  });
  stopOrderListeners = [];
}

function watchOrders(callback) {
  stopAllOrderListeners();
  if (!currentUser || !currentProfile) return () => {};

  const role = currentProfile.role;
  const listeners = [];
  const byId = new Map();

  const publish = () => {
    const list = Array.from(byId.values()).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    callback(list);
    window.dispatchEvent(new CustomEvent('acd-orders-change', { detail: list }));
  };

  const attach = (q) => {
    const stop = onSnapshot(q, snap => {
      snap.docChanges().forEach(change => {
        if (change.type === 'removed') byId.delete(change.doc.id);
        else byId.set(change.doc.id, mapOrderDoc(change.doc));
      });
      publish();
    }, err => {
      console.warn('Firestore orders listener:', err?.code || err);
      window.dispatchEvent(new CustomEvent('acd-orders-error', { detail: { code: err?.code || '', message: readableAuthError(err) } }));
    });
    listeners.push(stop);
  };

  if (role === 'admin') {
    attach(collection(db, 'orders'));
  } else if (role === 'store') {
    if (currentProfile.storeId) attach(query(collection(db, 'orders'), where('storeId', '==', currentProfile.storeId)));
  } else if (role === 'rider') {
    attach(query(collection(db, 'orders'), where('riderId', '==', currentUser.uid)));
    attach(query(collection(db, 'orders'), where('status', '==', 'ready')));
  } else {
    attach(query(collection(db, 'orders'), where('customerId', '==', currentUser.uid)));
  }

  stopOrderListeners = listeners;
  return stopAllOrderListeners;
}

async function updateOrder(id, patch) {
  if (!currentUser) throw new Error('SIGN_IN_REQUIRED');
  const safePatch = {};
  if (Object.prototype.hasOwnProperty.call(patch || {}, 'status')) safePatch.status = String(patch.status);
  if (Object.prototype.hasOwnProperty.call(patch || {}, 'riderId')) safePatch.riderId = patch.riderId ? String(patch.riderId) : null;
  if (!Object.keys(safePatch).length) throw new Error('NO_MUTABLE_FIELDS');

  if (currentProfile?.role === 'rider' && safePatch.riderId) {
    safePatch.riderId = currentUser.uid;
  }
  await updateDoc(doc(db, 'orders', id), { ...safePatch, updatedAt: serverTimestamp() });
}

async function rateOrder(id, ratingData) {
  if (!currentUser || currentProfile?.role !== ROLE_CUSTOMER) throw new Error('FORBIDDEN');

  const ref = doc(db, 'orders', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('FORBIDDEN');

  const order = snap.data();

  if (order.customerId !== currentUser.uid) throw new Error('FORBIDDEN');
  if (order.status !== 'delivered') throw new Error('RATING_AFTER_DELIVERY_ONLY');
  if (order.rating) throw new Error('ALREADY_RATED');

  const stars = Math.max(1, Math.min(5, Number(ratingData?.stars || 5)));
  const comment = String(ratingData?.comment || '').trim().slice(0, 300);
  const tags = Array.isArray(ratingData?.tags)
    ? ratingData.tags.map(x => String(x).slice(0, 80)).slice(0, 10)
    : [];

  await updateDoc(ref, {
    rating: { stars, comment, tags },
    ratedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}
async function signOutUser() {
  stopAllOrderListeners();
  await signOut(auth);
  currentUser = null;
  currentProfile = null;
  currentClaims = {};
  window.dispatchEvent(new CustomEvent('acd-auth-profile', { detail: null }));
}

window.ACDCloud = {
  signIn,
  linkGoogleAccount,
  signUpWithEmail,
  signInWithEmail,
  resetPassword,
  resendVerification,
  refreshClaims,
  saveCustomerProfile,
  saveCustomerAddress,
  createOrder,
  getMyOrders,
  getOrder,
  updateOrder,
  rateOrder,
   getPublicCatalog, getPublicOffers, adminListProducts, adminSaveProduct, adminDeleteProduct,
   adminListOffers, adminSaveOffer, adminDeleteOffer, getSiteSettings, watchSiteSettings, adminSaveSiteSettings, adminUploadProductImage,
   enableCustomerPush, sendBroadcastNotification,
  watchOrders,
  signOut: signOutUser,
  user: () => currentUser,
  profile: () => currentProfile,
  claims: () => ({ ...currentClaims }),
  role: () => currentProfile?.role || null,
  hasRole: role => currentProfile?.role === role,
  isAdmin: () => currentProfile?.role === 'admin',
  isEmailVerified: () => !!currentUser?.emailVerified,
  authError: readableAuthError
};

(async()=>{
  await ensurePersistence();
  try {
    const redirectResult=await getRedirectResult(auth);
    if(redirectResult?.user){
      const linkIntent=sessionStorage.getItem('acd-google-link-intent')==='1';
      sessionStorage.removeItem('acd-google-auth-intent'); sessionStorage.removeItem('acd-google-link-intent');
      currentUser=redirectResult.user; await currentUser.getIdToken(true); await syncCurrentProfile({createIfMissing:false});
      window.dispatchEvent(new CustomEvent(linkIntent?'acd-auth-google-linked':'acd-auth-google-complete',{detail:{user:currentUser,profile:currentProfile}}));
    }
  } catch(err){ console.error('ACD Google redirect sign-in failed:',err); window.dispatchEvent(new CustomEvent('acd-auth-error',{detail:{code:err?.code||'',message:readableAuthError(err)}})); }
  onAuthStateChanged(auth,async user=>{
    stopAllOrderListeners(); currentUser=user;
    try{ if(user){ await getClaims(user,true); await syncCurrentProfile({createIfMissing:true}); } else { currentProfile=null; currentClaims={}; } }
    catch(err){ console.error('ACD auth initialization failed:',err); currentProfile=null; currentClaims={}; window.dispatchEvent(new CustomEvent('acd-auth-error',{detail:{code:err?.code||'',message:readableAuthError(err)}})); }
    window.dispatchEvent(new CustomEvent('acd-auth-change',{detail:{user:currentUser,profile:currentProfile,claims:currentClaims}})); emitProfile();
  });
})();

window.dispatchEvent(new Event('acd-cloud-ready'));
