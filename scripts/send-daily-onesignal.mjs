const APP_ID = '4554f317-d06c-4e85-97d0-ea3a0c49106e';
const SITE_URL = 'https://alazhar-city-delivery.web.app/';

const schedules = {
  '7 18 * * *': {
    name: 'فتح المتجر اليومي',
    title: 'فتحنا! 🎉',
    body: 'الأزهر على عجلة جاهز لاستقبال طلباتك. اطلب احتياجاتك من المتاجر القريبة.',
  },
  '35 1 * * *': {
    name: 'تذكير قبل إغلاق المتجر اليومي',
    title: 'فاضل نصف ساعة على الإغلاق ⏰',
    body: 'الحق اطلب احتياجاتك قبل ما المتاجر تقفل الساعة 2 صباحًا.',
  },
};

const schedule = process.env.GITHUB_EVENT_SCHEDULE;
const message = schedules[schedule];
const apiKey = process.env.ONESIGNAL_REST_API_KEY;

if (!message) {
  console.error('Unknown scheduled event; no notification was sent.');
  process.exit(1);
}
if (!apiKey) {
  console.error('Missing ONESIGNAL_REST_API_KEY GitHub secret.');
  process.exit(1);
}

const response = await fetch('https://api.onesignal.com/notifications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    Authorization: `Key ${apiKey}`,
  },
  body: JSON.stringify({
    app_id: APP_ID,
    target_channel: 'push',
    included_segments: ['Subscribed Users'],
    name: message.name,
    headings: { ar: message.title, en: message.title },
    contents: { ar: message.body, en: message.body },
    url: SITE_URL,
  }),
});

const result = await response.json().catch(() => ({}));
if (!response.ok) {
  console.error(`OneSignal rejected the scheduled push (HTTP ${response.status}).`, result);
  process.exit(1);
}

console.log(`OneSignal accepted "${message.name}"; recipients: ${Number(result.recipients || 0)}.`);
