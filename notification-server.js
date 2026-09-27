import express from 'express';
import notificationApi from './notification-api.js';

const app = express();
const PORT = Number(process.env.PORT || 3000);
app.disable('x-powered-by');
app.get('/healthz', (_req, res) => res.json({ ok: true, service: 'notification-api' }));
app.use('/api/notifications', notificationApi);
app.listen(PORT, '0.0.0.0', () => console.log(`Notification API listening on port ${PORT}`));
