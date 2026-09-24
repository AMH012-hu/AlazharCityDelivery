import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';

// Baseline hardening headers. Authentication/authorization is enforced by Firebase
// Auth + Firestore Security Rules; these headers reduce common browser-side risks.
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(), microphone=()');
  next();
});

// Headers for PWA service worker and manifest
app.use((req, res, next) => {
  if (req.path === '/sw.js') {
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.setHeader('Cache-Control', 'no-cache');
  } else if (req.path === '/manifest.json' || req.path === '/manifest-rider.json' || req.path === '/manifest-store.json') {
    res.setHeader('Content-Type', 'application/manifest+json; charset=UTF-8');
  }
  next();
});

// Subdomain routing middleware:
// e.g. rider.domain.com -> rider.html, store.domain.com / pharmacy.domain.com -> store.html
app.use((req, res, next) => {
  const host = (req.headers.host || '').toLowerCase();
  const pathname = req.path;

  // Let static assets (css, js, images, icons, fonts) pass through
  if (pathname.includes('.') && !pathname.endsWith('.html')) {
    return next();
  }

  // Subdomain routing
  if (host.startsWith('rider.') || host.startsWith('delivery.')) {
    if (pathname === '/' || pathname === '/index.html') {
      return res.sendFile(join(__dirname, 'rider.html'));
    }
  } else if (host.startsWith('store.') || host.startsWith('merchant.') || host.startsWith('pharmacy.') || host.startsWith('market.')) {
    if (pathname === '/' || pathname === '/index.html') {
      return res.sendFile(join(__dirname, 'store.html'));
    }
  }

  // Clean path-based routing
  if (pathname === '/rider' || pathname === '/rider/') {
    return res.sendFile(join(__dirname, 'rider.html'));
  }
  if (pathname === '/store' || pathname === '/store/' || pathname === '/merchant' || pathname === '/pharmacy') {
    return res.sendFile(join(__dirname, 'store.html'));
  }
  if (pathname === '/track' || pathname === '/track/' || pathname === '/tracking') {
    return res.sendFile(join(__dirname, 'track.html'));
  }
  if (pathname === '/portal' || pathname === '/portal/') {
    return res.sendFile(join(__dirname, 'portal.html'));
  }

  next();
});

// Serve static files from root directory
app.use(express.static(__dirname, {
  extensions: ['html'],
  index: 'index.html'
}));

// Fallback to index.html
app.use((req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Alazhar City Delivery server running on http://${HOST}:${PORT}`);
});
