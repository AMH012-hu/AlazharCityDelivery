/* Alazhar City Platform — local demo data layer.
   Replace this adapter with Firebase/Firestore to share data between devices. */
(function () {
  'use strict';
  const KEY = 'alazhar-city-platform-v1';
  const now = () => new Date().toISOString();
  const seed = () => ({
    stores: [
      { id: 'market-1', name: 'متجر تجريبي', type: 'market', status: 'active', area: 'الحي السادس' },
      { id: 'pharmacy-1', name: 'صيدلية تجريبية', type: 'pharmacy', status: 'pending', area: 'الحي السادس' }
    ],
    riders: [{ id: 'rider-1', name: 'مندوب تجريبي', phone: '01000000000', status: 'available', orders: 0 }],
    orders: []
  });
  function read(){ try { return JSON.parse(localStorage.getItem(KEY)) || seed(); } catch (_) { return seed(); } }
  function write(data){ localStorage.setItem(KEY, JSON.stringify(data)); window.dispatchEvent(new Event('acd-platform-change')); return data; }
  function uid(prefix){ return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  function createOrder(input){
    const data = read();
    const order = { id: uid('ord'), reference: 'AZ-' + String(data.orders.length + 1001), createdAt: now(), status: 'new', storeId: 'market-1', riderId: null, customer: input.customer, items: input.items, subtotal: input.subtotal, deliveryFee: input.deliveryFee, total: input.total, special: input.special || '', hasPharma: !!input.hasPharma };
    data.orders.unshift(order); write(data); return order;
  }
  function updateOrder(id, patch){ const data = read(), order = data.orders.find(o => o.id === id); if (!order) return null; Object.assign(order, patch, { updatedAt: now() }); write(data); return order; }
  window.ACDPlatform = { read, write, createOrder, updateOrder, uid };
})();
