import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

initializeApp();
const db = getFirestore();
const messaging = getMessaging();
const MAX_BATCH = 500;
const MIN_BROADCAST_GAP_MS = 30_000;

export const sendCustomerAnnouncement = onCall({ region: 'us-central1' }, async request => {
  const claims = request.auth?.token;
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in first.');
  if (claims?.role !== 'admin' || claims?.email_verified !== true) {
    throw new HttpsError('permission-denied', 'Admin permission is required.');
  }

  const title = String(request.data?.title || '').trim().slice(0, 80);
  const body = String(request.data?.body || '').trim().slice(0, 180);
  if (!title || !body) throw new HttpsError('invalid-argument', 'A title and message are required.');

  const rateRef = db.doc(`notificationRates/${request.auth.uid}`);
  await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(rateRef);
    const lastSentAt = snapshot.get('lastSentAt');
    if (lastSentAt instanceof Timestamp && Date.now() - lastSentAt.toMillis() < MIN_BROADCAST_GAP_MS) {
      throw new HttpsError('resource-exhausted', 'Wait before sending another announcement.');
    }
    transaction.set(rateRef, { lastSentAt: FieldValue.serverTimestamp() }, { merge: true });
  });

  const tokenDocs = await db.collectionGroup('pushTokens').get();
  const unique = new Map();
  tokenDocs.forEach(document => {
    const token = document.get('token');
    if (typeof token === 'string' && token.length > 0) unique.set(token, document.ref);
  });
  const tokens = Array.from(unique.keys());
  if (!tokens.length) return { sent: 0, failed: 0, devices: 0 };

  let sent = 0;
  let failed = 0;
  const staleRefs = [];
  const url = '/index.html?from=notification';

  for (let start = 0; start < tokens.length; start += MAX_BATCH) {
    const batch = tokens.slice(start, start + MAX_BATCH);
    const response = await messaging.sendEachForMulticast({
      tokens: batch,
      data: { title, body, url },
      webpush: { headers: { TTL: '3600' }, fcmOptions: { link: url } }
    });
    sent += response.successCount;
    failed += response.failureCount;
    response.responses.forEach((result, index) => {
      const code = result.error?.code || '';
      if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token') {
        const ref = unique.get(batch[index]);
        if (ref) staleRefs.push(ref);
      }
    });
  }

  for (let start = 0; start < staleRefs.length; start += MAX_BATCH) {
    const cleanup = db.batch();
    staleRefs.slice(start, start + MAX_BATCH).forEach(ref => cleanup.delete(ref));
    await cleanup.commit();
  }
  return { sent, failed, devices: tokens.length };
});
