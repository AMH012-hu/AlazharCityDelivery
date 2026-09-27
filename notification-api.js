import express from 'express';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'alazhar-city-delivery';
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const options = { projectId };
  if (serviceAccountJson) options.credential = cert(JSON.parse(serviceAccountJson));
  // ID-token verification and the portal broadcast endpoint need only the
  // project ID. Firestore-backed order/break notifications additionally need
  // Firebase Admin credentials supplied securely by the hosting environment.
  initializeApp(options);
}
const db = getFirestore();
const router = express.Router();
router.use((req, res, next) => {
  const origin = String(req.headers.origin || '');
  const allowed = new Set([process.env.PUBLIC_SITE_URL, 'https://alazhar-city-delivery.web.app', 'https://alazhar-city-delivery.firebaseapp.com', 'http://localhost:3000'].filter(Boolean).map(x => x.replace(/\/$/, '')));
  if (origin && allowed.has(origin.replace(/\/$/, ''))) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin'); res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type'); res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
router.use(express.json({ limit: '16kb' }));

async function signedIn(req, res, next) {
  try {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ code: 'UNAUTHENTICATED' });
    req.identity = await getAuth().verifyIdToken(token);
    next();
  } catch { res.status(401).json({ code: 'UNAUTHENTICATED' }); }
}

async function sendPush(userIds, { title, body, url }) {
  const appId = process.env.ONESIGNAL_APP_ID || '4554f317-d06c-4e85-97d0-ea3a0c49106e';
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  if (!appId || !apiKey) throw Object.assign(new Error('ONESIGNAL_SERVER_CONFIG_MISSING'), { status: 503 });
  const ids = [...new Set(userIds.filter(Boolean).map(String))];
  const target = ids.length ? { include_aliases: { external_id: ids } } : { filters: [{ field: 'tag', key: 'role', relation: '=', value: 'customer' }] };
  const response = await fetch('https://api.onesignal.com/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Key ${apiKey}` },
    body: JSON.stringify({
      app_id: appId,
      target_channel: 'push',
      ...target,
      headings: { ar: title, en: title },
      contents: { ar: body, en: body },
      url: new URL(url || '/', process.env.PUBLIC_SITE_URL || 'https://alazhar-city-delivery.web.app').toString()
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error('ONESIGNAL_SEND_FAILED'), { status: 502 });
  return { sent: Number(result.recipients || 0), devices: ids.length || Number(result.recipients || 0) };
}

async function staffRecipients(storeId) {
  const [stores, admins] = await Promise.all([
    db.collection('users').where('role', '==', 'store').get(),
    db.collection('users').where('role', '==', 'admin').get()
  ]);
  return [
    ...stores.docs.filter(doc => !storeId || doc.get('storeId') === storeId).map(doc => doc.id),
    ...admins.docs.map(doc => doc.id)
  ];
}

const statusCopy = {
  accepted: ['تم تأكيد الطلب', 'المتجر أكد الطلب وبدأ تجهيزه.'],
  preparing: ['الطلب قيد التجهيز', 'المتجر يجهز طلبك الآن.'],
  ready: ['الطلب جاهز للاستلام', 'طلبك جاهز والمندوب سيستلمه.'],
  delivering: ['المندوب في الطريق', 'المندوب استلم الطلب وهو في طريقه إليك.'],
  delivered: ['تم تسليم الطلب', 'تم تسليم طلبك بنجاح.'],
  cancelled: ['تم إلغاء الطلب', 'تم إلغاء الطلب.']
};

router.post('/order-event', signedIn, async (req, res) => {
  try {
    const orderId = String(req.body?.orderId || '').slice(0, 128);
    const event = String(req.body?.event || '');
    const ref = db.collection('orders').doc(orderId);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ code: 'ORDER_NOT_FOUND' });
    const order = snap.data(), role = req.identity.role || 'customer', uid = req.identity.uid;
    const admin = role === 'admin' && req.identity.email_verified === true;
    const store = role === 'store' && req.identity.email_verified === true && req.identity.storeId === order.storeId;
    const rider = role === 'rider' && req.identity.email_verified === true && order.riderId === uid;
    const customer = role === 'customer' && order.customerId === uid;
    let recipients = [], title = '', body = '';
    if (event === 'new' && customer && order.status === 'new') {
      recipients = [order.customerId, ...await staffRecipients(order.storeId)];
      title = 'تم استلام طلبك'; body = `طلب ${order.reference || orderId} وصل للمتجر، وتقدر تتابعه خطوة بخطوة.`;
    } else if (event === 'rider_assigned' && (store || admin) && order.riderId) {
      recipients = [order.customerId, order.riderId, ...await staffRecipients(order.storeId)];
      title = 'تم استدعاء مندوب'; body = `تم إسناد طلب ${order.reference || orderId} لمندوب.`;
    } else if (statusCopy[event] && order.status === event && ((['accepted','preparing','ready','cancelled'].includes(event) && (store || admin)) || (['delivering','delivered'].includes(event) && (rider || admin)))) {
      recipients = [order.customerId, order.riderId, ...await staffRecipients(order.storeId)];
      [title, body] = statusCopy[event];
    } else return res.status(403).json({ code: 'FORBIDDEN' });

    const marker = ref.collection('notificationDispatch').doc(`${event}-${uid}`);
    const markerSnap = await marker.get();
    if (markerSnap.exists) return res.json({ sent: 0, duplicate: true });
    const result = await sendPush(recipients, { title, body, url: `/track.html?id=${encodeURIComponent(orderId)}` });
    await marker.set({ event, senderUid: uid, sentAt: FieldValue.serverTimestamp() });
    return res.json(result);
  } catch (error) {
    console.error('OneSignal order dispatch failed:', error?.message || error);
    return res.status(error.status || 500).json({ code: error.message || 'NOTIFICATION_SEND_FAILED' });
  }
});

router.post('/rider-break', signedIn, async (req, res) => {
  try {
    if (req.identity.role !== 'rider' || req.identity.email_verified !== true) return res.status(403).json({ code: 'FORBIDDEN' });
    const riderSnap = await db.collection('riderDirectory').doc(req.identity.uid).get();
    if (!riderSnap.exists || riderSnap.get('status') !== 'on_break') return res.status(409).json({ code: 'BREAK_NOT_ACTIVE' });
    const recipients = [req.identity.uid, ...await staffRecipients('')];
    const minutes = Math.max(10, Math.min(120, Number(req.body?.minutes) || 10));
    const result = await sendPush(recipients, { title: 'المندوب أخذ استراحة', body: `المندوب بدأ استراحة لمدة ${minutes} دقيقة.`, url: '/portal.html' });
    return res.json(result);
  } catch (error) {
    console.error('OneSignal break dispatch failed:', error?.message || error);
    return res.status(error.status || 500).json({ code: error.message || 'NOTIFICATION_SEND_FAILED' });
  }
});

router.post('/broadcast', signedIn, async (req, res) => {
  try {
    if (req.identity.role !== 'admin' || req.identity.email_verified !== true) return res.status(403).json({ code: 'FORBIDDEN' });
    const title = String(req.body?.title || '').trim().slice(0, 80);
    const body = String(req.body?.body || '').trim().slice(0, 180);
    if (!title || !body) return res.status(400).json({ code: 'NOTIFICATION_TEXT_REQUIRED' });
    const result = await sendPush([], { title, body, url: '/' });
    return res.json(result);
  } catch (error) {
    console.error('OneSignal broadcast failed:', error?.message || error);
    return res.status(error.status || 500).json({ code: error.message || 'NOTIFICATION_SEND_FAILED' });
  }
});

export default router;
