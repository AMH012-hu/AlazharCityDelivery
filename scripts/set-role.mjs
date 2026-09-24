import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'alazhar-city-delivery';
const [, , emailArg, roleArg, entityIdArg, nameArg, typeArg] = process.argv;
const email = String(emailArg || '').trim().toLowerCase();
const role = String(roleArg || '').trim().toLowerCase();
const entityId = String(entityIdArg || '').trim() || null;
const nameArgSafe = String(nameArg || '').trim().slice(0, 80) || null;
const type = String(typeArg || '').trim().toLowerCase() || null;

function usage(message = null) {
  if (message) console.error(`\nError: ${message}\n`);
  console.error('Usage:');
  console.error('  npm run auth:set-role -- <email> admin');
  console.error('  npm run auth:set-role -- <email> store <storeId> "Store Manager" market');
  console.error('  npm run auth:set-role -- <email> rider <riderId> "Rider Name"');
  console.error('\nBefore running it, set one of:');
  console.error('  export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"');
  console.error('  export FIREBASE_SERVICE_ACCOUNT_JSON=\'{"type":"service_account",...}\'');
  console.error('\nProject ID defaults to: alazhar-city-delivery');
  console.error('Override with: export FIREBASE_PROJECT_ID="your-project-id"');
  process.exit(1);
}

if (!email || !/^.+@.+\..+$/.test(email)) usage('A valid email address is required.');
if (!['customer', 'store', 'rider', 'admin'].includes(role)) usage('Invalid role. Use customer, store, rider, or admin.');
if (role === 'store' && !entityId) usage('store role requires a storeId, e.g. market-1');
if (role === 'rider' && !entityId) usage('rider role requires a riderId, e.g. rider-1');
if (role === 'customer' && (entityId || type)) usage('customer role does not accept storeId/riderId or store type.');

function parseServiceAccountJson(raw, sourceLabel) {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.type !== 'service_account' || !parsed.client_email || !parsed.private_key) {
      throw new Error('The JSON is not a valid Firebase service-account key.');
    }
    return parsed;
  } catch (error) {
    throw new Error(`Unable to read service account from ${sourceLabel}: ${error.message}`);
  }
}

function initAdmin() {
  if (getApps().length) return getApps()[0];

  const rawJson = String(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '').trim();
  if (rawJson) {
    return initializeApp({
      credential: cert(parseServiceAccountJson(rawJson, 'FIREBASE_SERVICE_ACCOUNT_JSON')),
      projectId: PROJECT_ID
    });
  }

  const credentialsPath = String(process.env.GOOGLE_APPLICATION_CREDENTIALS || '').trim();
  if (credentialsPath) {
    const resolvedPath = path.resolve(credentialsPath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`GOOGLE_APPLICATION_CREDENTIALS points to a file that does not exist: ${resolvedPath}`);
    }
    const serviceAccount = parseServiceAccountJson(fs.readFileSync(resolvedPath, 'utf8'), resolvedPath);
    return initializeApp({ credential: cert(serviceAccount), projectId: PROJECT_ID });
  }

  throw new Error(
    'Firebase Admin credentials are not configured. On your local Linux machine, download a Firebase Admin service-account JSON file and run:\n' +
    '  export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/service-account.json"\n' +
    'Then run this command again. Do NOT put the JSON file in the public website folder or commit it to git.'
  );
}

let app;
try {
  app = initAdmin();
} catch (error) {
  console.error(`\n${error.message}\n`);
  process.exit(1);
}

const auth = getAuth(app);
const db = getFirestore(app);

try {
  const user = await auth.getUserByEmail(email);

  if (!user.emailVerified) {
    throw new Error('The account email must be verified before granting a privileged role.');
  }

  const claims = { role };
  if (role === 'store') claims.storeId = entityId;
  if (role === 'rider') claims.riderId = entityId;

  await auth.setCustomUserClaims(user.uid, claims);

  const profilePatch = {
    role,
    name: nameArgSafe || user.displayName || email,
    email: user.email || email,
    updatedAt: FieldValue.serverTimestamp()
  };

  if (role === 'store') {
    profilePatch.storeId = entityId;
    if (type === 'market' || type === 'pharmacy') profilePatch.storeType = type;
  } else if (role === 'rider') {
    profilePatch.riderId = entityId;
  } else {
    profilePatch.storeId = FieldValue.delete();
    profilePatch.riderId = FieldValue.delete();
    profilePatch.storeType = FieldValue.delete();
  }

  await db.collection('users').doc(user.uid).set(profilePatch, { merge: true });

  console.log(`Role '${role}' assigned to ${email} (${user.uid}).`);
  console.log('The user must sign out/in again, or force-refresh their ID token, before the new claims are visible in the browser.');
} catch (error) {
  const code = error?.code ? ` [${error.code}]` : '';
  console.error(`\nRole assignment failed${code}: ${error.message}\n`);
  process.exit(1);
}
