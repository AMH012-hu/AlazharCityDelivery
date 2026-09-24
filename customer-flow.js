(() => {
  'use strict';

  const TRACK_KEY = 'acd-active-order-v14';
  const RATING_KEY = 'acd-pending-rating-v14';

  let modalReady = false;
  let wrapped = false;
  let timer = null;
  let busy = false;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }

  function load(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; }
  }

  function remove(key) {
    try { localStorage.removeItem(key); } catch (_) {}
  }

  function clearCartStorage() {
    const stores = [localStorage, sessionStorage];

    for (const storage of stores) {
      try {
        const keys = [];
        for (let i = 0; i < storage.length; i++) {
          const k = storage.key(i);
          if (k && /cart|basket|bag|shopping/i.test(k)) keys.push(k);
        }
        keys.forEach(k => storage.removeItem(k));
      } catch (_) {}
    }
  }

  function ensureModal() {
    if (modalReady || !document.body) return;

    const style = document.createElement('style');
    style.textContent = `
      #acdOrderFlow {
        position:fixed; inset:0; z-index:9999;
        background:rgba(10,20,16,.58);
        backdrop-filter:blur(8px);
        display:none; align-items:center; justify-content:center;
        padding:16px;
      }
      #acdOrderFlow.open { display:flex; }
      #acdOrderCard {
        width:min(500px,100%);
        background:#fff; border-radius:22px;
        padding:22px; box-shadow:0 24px 70px rgba(0,0,0,.25);
      }
      #acdOrderFlow h2 { margin:0 0 5px; font-size:1.25rem; }
      #acdOrderRef { color:#6b756f; font-size:.8rem; margin-bottom:18px; }
      .acd-status { display:flex; gap:12px; align-items:flex-start; margin:10px 0; }
      .acd-dot {
        width:11px; height:11px; border-radius:50%;
        background:#d7dfda; margin-top:7px; flex:none;
      }
      .acd-status.active .acd-dot { background:#e94b3c; }
      .acd-status.done .acd-dot { background:#0a8150; }
      .acd-status b { display:block; font-size:.88rem; }
      .acd-status small { color:#707a75; font-size:.72rem; }
      #acdRatingBox { display:none; margin-top:18px; padding-top:18px; border-top:1px solid #e6ebe8; }
      #acdRatingBox.open { display:block; }
      #acdStars { display:flex; gap:5px; margin:10px 0 12px; }
      .acd-star {
        border:1px solid #dce4df; background:#fff;
        border-radius:10px; width:42px; height:42px;
        font-size:20px; cursor:pointer;
      }
      .acd-star.selected { background:#fff4d6; border-color:#f0c96a; }
      #acdRatingComment {
        width:100%; min-height:90px; resize:vertical;
        border:1px solid #dce4df; border-radius:12px;
        padding:10px; font:inherit;
      }
      #acdSubmitRating {
        width:100%; margin-top:10px;
        border:0; border-radius:12px; padding:12px;
        background:#14231d; color:#fff; font-weight:800;
        cursor:pointer;
      }
      #acdCloseFlow {
        width:100%; margin-top:8px;
        border:0; background:#f2f5f3;
        border-radius:12px; padding:10px;
        color:#34413b; font-weight:700; cursor:pointer;
      }
    `;
    document.head.appendChild(style);

    document.body.insertAdjacentHTML('beforeend', `
      <div id="acdOrderFlow">
        <div id="acdOrderCard">
          <h2 id="acdOrderTitle">متابعة الطلب</h2>
          <div id="acdOrderRef"></div>
          <div id="acdStatusList"></div>

          <div id="acdRatingBox">
            <b>قيّم طلبك</b>
            <div style="color:#707a75;font-size:.76rem;margin-top:3px">
              التقييم متاح بعد استلام الطلب.
            </div>
            <div id="acdStars">
              ${[1,2,3,4,5].map(n => `<button class="acd-star" data-star="${n}" type="button">★</button>`).join('')}
            </div>
            <textarea id="acdRatingComment" placeholder="اكتب ملاحظتك (اختياري)"></textarea>
            <button id="acdSubmitRating" type="button">إرسال التقييم</button>
          </div>

          <button id="acdCloseFlow" type="button">إغلاق</button>
        </div>
      </div>
    `);

    let selectedStars = 5;

    document.querySelectorAll('.acd-star').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedStars = Number(btn.dataset.star || 5);
        document.querySelectorAll('.acd-star').forEach(x => {
          x.classList.toggle('selected', Number(x.dataset.star) <= selectedStars);
        });
      });
    });

    document.querySelector('#acdCloseFlow')?.addEventListener('click', () => {
      document.querySelector('#acdOrderFlow')?.classList.remove('open');
    });

    document.querySelector('#acdSubmitRating')?.addEventListener('click', async () => {
      const data = load(RATING_KEY) || load(TRACK_KEY);
      if (!data?.id || busy) return;

      busy = true;
      const btn = document.querySelector('#acdSubmitRating');
      if (btn) btn.disabled = true;

      try {
        await ACDCloud.rateOrder(data.id, {
          stars: selectedStars,
          comment: document.querySelector('#acdRatingComment')?.value || ''
        });

        remove(RATING_KEY);
        remove(TRACK_KEY);

        const title = document.querySelector('#acdOrderTitle');
        if (title) title.textContent = 'شكرًا على تقييمك';

        const list = document.querySelector('#acdStatusList');
        if (list) list.innerHTML = '<div style="color:#0a8150;font-weight:800">تم حفظ التقييم.</div>';

        document.querySelector('#acdRatingBox')?.classList.remove('open');
      } catch (err) {
        alert(ACDCloud.authError(err));
      } finally {
        busy = false;
        if (btn) btn.disabled = false;
      }
    });

    modalReady = true;
  }

  function statusSteps(status) {
    const steps = [
      ['new', 'تم إرسال الطلب', 'الطلب وصل للمتجر.'],
      ['preparing', 'جاري تجهيز الطلب', 'المتجر بيجهز الطلب الآن.'],
      ['ready', 'الطلب جاهز', 'الطلب جاهز لاستلام المندوب.'],
      ['delivering', 'المندوب في الطريق', 'الطلب خرج للتوصيل.'],
      ['delivered', 'تم التوصيل', 'تم استلام الطلب.']
    ];

    const order = ['new','preparing','ready','delivering','delivered'];
    const current = order.indexOf(status);

    return steps.map(([key,title,desc], i) => `
      <div class="acd-status ${i < current ? 'done' : i === current ? 'active' : ''}">
        <span class="acd-dot"></span>
        <div><b>${title}</b><small>${desc}</small></div>
      </div>
    `).join('');
  }

  async function refresh() {
    if (!window.ACDCloud?.user?.() || !window.ACDCloud?.getOrder) return;

    const track = load(TRACK_KEY);
    const rating = load(RATING_KEY);
    const target = rating || track;

    if (!target?.id) return;

    ensureModal();

    try {
      const order = await ACDCloud.getOrder(target.id);
      if (!order) return;

      const flow = document.querySelector('#acdOrderFlow');
      const ref = document.querySelector('#acdOrderRef');
      const list = document.querySelector('#acdStatusList');
      const ratingBox = document.querySelector('#acdRatingBox');
      const title = document.querySelector('#acdOrderTitle');

      if (ref) ref.textContent = order.reference ? `رقم الطلب: ${order.reference}` : '';
      if (list) list.innerHTML = order.status === 'cancelled'
        ? '<div style="color:#c0392b;font-weight:800">تم إلغاء الطلب.</div>'
        : statusSteps(order.status);

      if (order.status === 'delivered' && !order.rating) {
        save(RATING_KEY, { id: order.id, reference: order.reference });
        if (ratingBox) ratingBox.classList.add('open');
        if (title) title.textContent = 'تم استلام طلبك';
      } else if (order.status !== 'delivered') {
        if (ratingBox) ratingBox.classList.remove('open');
        if (title) title.textContent = 'متابعة الطلب';
      }

      if (order.status === 'delivered' && order.rating) {
        remove(TRACK_KEY);
        remove(RATING_KEY);
      }

      flow?.classList.add('open');
    } catch (_) {}
  }

  function wrapCreateOrder() {
    if (wrapped || !window.ACDCloud?.createOrder) return;

    const original = window.ACDCloud.createOrder;

    window.ACDCloud.createOrder = async function(input) {
      const result = await original.call(this, input);

      if (result?.id) {
        save(TRACK_KEY, {
          id: result.id,
          reference: result.reference || ''
        });

        remove(RATING_KEY);
        clearCartStorage();

        setTimeout(() => location.reload(), 120);
      }

      return result;
    };

    wrapped = true;
  }

  function start() {
    ensureModal();
    wrapCreateOrder();

    if (timer) clearInterval(timer);
    refresh();
    timer = setInterval(() => {
      wrapCreateOrder();
      refresh();
    }, 3000);
  }

  window.addEventListener('acd-auth-profile', start);
  window.addEventListener('acd-auth-change', start);
  document.addEventListener('DOMContentLoaded', start);
  setTimeout(start, 800);
})();
