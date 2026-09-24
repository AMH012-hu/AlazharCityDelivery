/* Alazhar City Platform — Real-time & Local Data Layer
   Provides reactive order management, customer addresses, rider dispatching, merchant tracking, and order rating. */
(function () {
  'use strict';
  const KEY = 'alazhar-city-platform-v3';
  const RIDER_SESSION_KEY = 'acd_rider_session_v1';
  const STORE_SESSION_KEY = 'acd_store_session_v1';
  const CUSTOMER_SESSION_KEY = 'acd_customer_session_v1';
  const NOTIFICATIONS_KEY = 'acd_customer_notifications_v1';
  // Remove legacy plaintext customer credentials from previous builds.
  try { localStorage.removeItem('acd_local_customers_v1'); localStorage.removeItem('acd_customer_session_v1'); } catch (_) {}
  const now = () => new Date().toISOString();

  // Registered Riders
  const registeredRiders = [
    { id: 'rider-1', name: 'أحمد محمود (كابتن الأزهر)', phone: '01025896314', vehicle: 'موتوسيكل بوكسر أحمر', status: 'available', rating: 4.9, completedCount: 14 }
  ];

  // Registered Stores
  const registeredStores = [
    { id: 'market-1', code: 'baraka', phone: '01015678901', name: 'سوبرماركت البركة والخير', type: 'market', area: 'الحي السادس - خلف بوابة المدينة الجامعية' },
    { id: 'pharmacy-1', code: 'shifa', phone: '01123456789', name: 'صيدلية الشفاء ود. مصطفى', type: 'pharmacy', area: 'الحي السادس - امتداد شارع الطيران' }
  ];

  // Default Daily Deals & Notifications (Talabat-like daily promo alerts)
  const defaultOffers = [
    {
      id: 'offer-1',
      title: 'خصم 20% على طلبات السوبرماركت 🛒',
      desc: 'استمتع بتوصيل سريع وخصومات على منتجات الألبان والمخبوزات لطلبة الأزهر.',
      tag: 'عرض اليوم',
      date: 'اليوم'
    },
    {
      id: 'offer-2',
      title: 'توصيل مجاني عند الطلب فوق 100 ج.م ⚡',
      desc: 'وفّر مصاريف الشحن لجميع مساكن الحي السادس ومحيط المدينة الجامعية.',
      tag: 'توصيل مجاني',
      date: 'اليوم'
    },
    {
      id: 'offer-3',
      title: 'خدمة روشتة وطوارئ الصيدلية 24/7 💊',
      desc: 'صيدلية الشفاء بخدمتك لتأمين مستلزماتك والأدوية بدون تأخير.',
      tag: 'صيدلية',
      date: 'أمس'
    }
  ];

  let channel = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('acd_orders_channel');
      channel.onmessage = () => {
        window.dispatchEvent(new Event('acd-platform-change'));
      };
    }
  } catch (_) {}

  const seed = () => ({
    stores: [
      { id: 'market-1', name: 'سوبرماركت البركة والخير', type: 'market', status: 'active', area: 'الحي السادس - خلف بوابة المدينة الجامعية', phone: '01015678901' },
      { id: 'pharmacy-1', name: 'صيدلية الشفاء ود. مصطفى', type: 'pharmacy', status: 'active', area: 'الحي السادس - امتداد شارع الطيران', phone: '01123456789' }
    ],
    riders: [
      { id: 'rider-1', name: 'أحمد محمود (كابتن الأزهر)', phone: '01025896314', status: 'available', vehicle: 'موتوسيكل بوكسر أحمر', rating: 4.9, completedCount: 14 }
    ],
    orders: [
      {
        id: 'ord-seed-1',
        reference: 'AZ-1048',
        createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        status: 'delivering',
        storeId: 'market-1',
        riderId: 'rider-1',
        customer: {
          name: 'عبدالرحمن إبراهيم',
          phone: '01098765432',
          address: 'عمارة 14 الدور الثالث شقة 6 - أمام مسجد السلام الحي السادس',
          note: 'رن جرس الباب أول ما توصل يا كابتن',
          addressLabel: 'السكن'
        },
        items: [
          { id: 'juhayna-milk', name: 'لبن جهينة كامل الدسم 1 لتر', quantity: 2, price: 44 },
          { id: 'fino-bread', name: 'فينو طازج سادة (كيس 5 أرغفة)', quantity: 2, price: 15 },
          { id: 'tea-arousa-1', name: 'شاي العروسة ناعم 100 جم', quantity: 1, price: 22 }
        ],
        subtotal: 125,
        deliveryFee: 15,
        total: 140,
        special: '',
        hasPharma: false,
        rating: null
      },
      {
        id: 'ord-seed-2',
        reference: 'AZ-1049',
        createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        status: 'ready',
        storeId: 'pharmacy-1',
        riderId: null,
        customer: {
          name: 'محمود الصاوي',
          phone: '01155443322',
          address: 'سكن طلبة كلية الدعوة - شارع الشيخ عبدالحليم محمود',
          note: 'ضروري البانادول لو سمحت',
          addressLabel: 'السكن الجامعي'
        },
        items: [
          { id: 'panadol-blue', name: 'بانادول أزرق مسكن (شريط)', quantity: 2, price: 30 },
          { id: 'vitamin-c', name: 'فيتامين سي فوار مصري 1000 مجم', quantity: 1, price: 35 }
        ],
        subtotal: 95,
        deliveryFee: 15,
        total: 110,
        special: '',
        hasPharma: true,
        rating: null
      }
    ]
  });

  function read() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY));
      if (parsed && Array.isArray(parsed.orders) && parsed.orders.length) return parsed;
      return write(seed());
    } catch (_) {
      return seed();
    }
  }

  function write(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (_) {}
    window.dispatchEvent(new Event('acd-platform-change'));
    if (channel) {
      try { channel.postMessage({ type: 'sync', time: Date.now() }); } catch (_) {}
    }
    return data;
  }

  function uid(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }


  function createOrder(input) {
    const data = read();
    const orderRefNum = data.orders.length + 1050;
    const currentCust = auth.getCustomerSession();

    const order = {
      id: uid('ord'),
      reference: 'AZ-' + String(orderRefNum),
      createdAt: now(),
      status: 'new',
      storeId: input.hasPharma ? 'pharmacy-1' : 'market-1',
      riderId: null,
      customerId: currentCust?.id || null,
      customer: input.customer,
      items: input.items || [],
      subtotal: Number(input.subtotal || 0),
      deliveryFee: Number(input.deliveryFee || 15),
      total: Number(input.total || (Number(input.subtotal || 0) + Number(input.deliveryFee || 15))),
      special: input.special || '',
      hasPharma: !!input.hasPharma,
      rating: null
    };

    data.orders.unshift(order);
    write(data);

    // Save address to user's saved list automatically
    if (currentCust && input.customer) {
      auth.addCustomerSavedAddress({
        label: input.customer.addressLabel || 'السكن',
        address: input.customer.address,
        lat: input.customer.lat,
        lng: input.customer.lng
      });
    }

    return order;
  }

  function getOrder(id) {
    const data = read();
    return data.orders.find(o => o.id === id || o.reference === id) || null;
  }

  function updateOrder(id, patch) {
    const data = read();
    const order = data.orders.find(o => o.id === id || o.reference === id);
    if (!order) return null;
    Object.assign(order, patch, { updatedAt: now() });
    write(data);
    return order;
  }

  function rateOrder(id, ratingData) {
    const data = read();
    const order = data.orders.find(o => o.id === id || o.reference === id);
    if (!order) return null;
    order.rating = {
      stars: Math.max(1, Math.min(5, Number(ratingData.stars || 5))),
      comment: String(ratingData.comment || '').trim(),
      tags: Array.isArray(ratingData.tags) ? ratingData.tags : [],
      createdAt: now()
    };
    order.updatedAt = now();
    write(data);
    return order;
  }

  function assignRider(orderId, riderId) {
    return updateOrder(orderId, { riderId: riderId || 'rider-1', status: 'delivering' });
  }

  function setRiderStatus(riderId, status) {
    const data = read();
    const rider = data.riders.find(r => r.id === riderId);
    if (rider) {
      rider.status = status;
      write(data);
    }
    return rider;
  }

  // Get daily notifications/offers
  function getOffers() {
    try {
      const stored = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY));
      if (stored && Array.isArray(stored)) return stored;
    } catch (_) {}
    return defaultOffers;
  }

  // Compatibility adapter only. Production identity/authentication belongs to Firebase Auth.
  // No passwords, PINs, or privileged credentials are stored in localStorage anymore.
  const auth = {
    getCustomerSession() {
      const cloud = window.ACDCloud;
      const user = cloud?.user?.();
      const profile = cloud?.profile?.();
      if (!user || !profile) return null;
      return {
        id: user.uid,
        name: profile.name || user.displayName || 'عميل الأزهر',
        email: user.email || '',
        phone: profile.phone || user.phoneNumber || '',
        savedAddresses: Array.isArray(profile.savedAddresses) ? profile.savedAddresses : [],
        role: profile.role || 'customer',
        emailVerified: !!user.emailVerified
      };
    },

    async logoutCustomer() {
      if (window.ACDCloud?.signOut && window.ACDCloud.user()) {
        await window.ACDCloud.signOut();
      }
    },

    async addCustomerSavedAddress(addrObj) {
      if (!window.ACDCloud?.saveCustomerAddress) return null;
      try {
        const profile = await window.ACDCloud.saveCustomerAddress(addrObj);
        return profile?.savedAddresses || [];
      } catch (_) {
        return null;
      }
    },

    // Legacy local auth methods intentionally disabled. They remain as explicit errors
    // so old integrations fail safely instead of silently accepting insecure credentials.
    registerCustomer() {
      return { success: false, error: 'تم نقل تسجيل العملاء إلى Firebase Authentication.' };
    },
    loginCustomer() {
      return { success: false, error: 'تم نقل تسجيل العملاء إلى Firebase Authentication.' };
    },
    loginRider() {
      return { success: false, error: 'تسجيل المندوب يتم بحساب Firebase مع صلاحية rider معتمدة.' };
    },
    getRiderSession() { return null; },
    logoutRider() {},
    loginStore() {
      return { success: false, error: 'تسجيل المتجر يتم بحساب Firebase مع صلاحية store معتمدة.' };
    },
    getStoreSession() { return null; },
    logoutStore() {}
  };


  window.ACDPlatform = {
    read,
    write,
    createOrder,
    getOrder,
    updateOrder,
    rateOrder,
    assignRider,
    setRiderStatus,
    getOffers,
    auth,
    uid
  };
})();
