# Alazhar City Delivery — Professional Authentication Setup

This revision uses **Firebase Authentication** for identity and **Firebase custom claims + Firestore Security Rules** for authorization.

## 1. Customer authentication

Customers can use:

- Email + password
- Google Sign-In
- Password reset
- Email verification

Customer passwords are handled by Firebase Authentication and are not stored in `localStorage`.

## 2. Staff roles

`admin`, `store`, and `rider` are privileged roles. The browser cannot grant itself one of these roles.

Privileged roles are assigned with the Firebase Admin SDK through `scripts/set-role.mjs`.

## 3. First-time local setup for role assignment

### A. Install dependencies

```bash
npm install
```

### B. Create a Firebase Admin service-account key

In Firebase Console:

`Project settings → Service accounts → Firebase Admin SDK → Generate new private key`

Keep the JSON file private. Do not put it in `public/`, your website assets, or git.

### C. Point the Linux shell to the JSON key

Example:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/Downloads/alazhar-city-delivery-admin.json"
export FIREBASE_PROJECT_ID="alazhar-city-delivery"
```

Verify the file exists:

```bash
ls -l "$GOOGLE_APPLICATION_CREDENTIALS"
```

### D. Create/verify the account from the website first

Create the user through the website with Email/Password or Google. For privileged roles, the email must be verified before the role is assigned.

### E. Assign admin

```bash
npm run auth:set-role -- ammarhalawa760@gmail.com admin
```

### F. Assign a store manager

```bash
npm run auth:set-role -- store.owner@example.com store market-1 "Store Manager" market
```

Supported store types:

- `market`
- `pharmacy`

### G. Assign a rider

```bash
npm run auth:set-role -- rider@example.com rider rider-1 "Rider Name"
```

After role assignment, the user must sign out/sign in again, or refresh the Firebase ID token, before the browser sees the new claim.

## 4. Alternative credential input

Instead of `GOOGLE_APPLICATION_CREDENTIALS`, the script also supports:

```bash
export FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

Using a protected JSON file through `GOOGLE_APPLICATION_CREDENTIALS` is preferred for local administration.

## 5. Firebase CLI

This project now includes:

- `firebase.json`
- `.firebaserc`
- `firestore.rules`

Deploy rules with:

```bash
firebase deploy --only firestore:rules
```

Make sure you are authenticated with the Firebase CLI first:

```bash
firebase login
```

## 6. Why your previous command failed

The role command uses the **Firebase Admin SDK**. Unlike the browser Firebase SDK, this is a privileged server-side SDK and cannot use your public Firebase web API key as its credential.

The previous version fell back to Application Default Credentials. On a normal Kali/Linux terminal, those credentials are not automatically available, so the Admin SDK reported:

`Unable to detect a Project Id in the current environment.`

The updated script now fails earlier with an actionable message unless a service-account credential is configured, and it supplies the project ID `alazhar-city-delivery` explicitly.

## 7. Security model

The browser can edit only safe customer profile fields. It cannot elevate a user's role by writing `role`, `storeId`, or `riderId` in Firestore.

Firebase custom claims are assigned by the Admin SDK and enforced by Firestore Security Rules.

Never commit a service-account private key.


## Human UI / account pass
The customer experience now uses natural Egyptian-Arabic copy, clearer account onboarding, editable profile data, saved delivery addresses, Google account linking, verification state, staff portal shortcut, and mobile-friendly Google redirect fallback.


## Multi-app PWA setup

The repository now has four separate installable apps:

- Customer: `index.html` → `manifest.json`
- Rider: `rider.html` → `manifest-rider.json`
- Store: `store.html` → `manifest-store.json`
- Admin: `portal.html` → `manifest-admin.json`

GitHub Pages is static hosting, so use the page URLs directly (for example `/rider.html` and `/store.html`). Each page declares its own manifest, so the browser installs the matching app identity and start URL.

## Admin catalog

After Firebase Authentication and the Admin claim are ready:

```bash
npm run catalog:seed
```

Then open `portal.html` as the admin. The `إدارة الموقع` section lets you manage products, offers, site settings, and product images without editing `config.js`.

Deploy both Firestore and Storage rules:

```bash
firebase deploy --only firestore:rules,storage
```
