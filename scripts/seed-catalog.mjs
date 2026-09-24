import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const projectId = process.env.FIREBASE_PROJECT_ID || 'alazhar-city-delivery';
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credentialsPath || !fs.existsSync(credentialsPath)) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to your Firebase service-account JSON first.');
  process.exit(1);
}
const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(credentialsPath), 'utf8'));
const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(serviceAccount), projectId });
const db = getFirestore(app);

const source = fs.readFileSync(new URL('../config.js', import.meta.url), 'utf8');
const sandbox = { console };
vm.createContext(sandbox);
vm.runInContext(`${source}\n;globalThis.__seed={CONFIG,CATEGORIES,PRODUCTS};`, sandbox, { timeout: 15000 });
const seed = sandbox.__seed;

const batch = db.batch();
for (const p of seed.PRODUCTS) {
  const ref = db.collection('products').doc(String(p.id));
  batch.set(ref, {
    ...p,
    active: true,
    soldOut: !!p.soldOut,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });
}
batch.set(db.collection('settings').doc('site'), {
  area: seed.CONFIG.area,
  audience: seed.CONFIG.audience,
  eta: seed.CONFIG.eta,
  deliveryFee: seed.CONFIG.deliveryFee,
  freeDelivery: seed.CONFIG.freeDelivery,
  minOrder: seed.CONFIG.minOrder,
  openHour: seed.CONFIG.openHour,
  closeHour: seed.CONFIG.closeHour,
  updatedAt: FieldValue.serverTimestamp()
}, { merge: true });
await batch.commit();
console.log(`Seeded ${seed.PRODUCTS.length} products and the site settings into ${projectId}.`);
