#!/usr/bin/env bash
set -e

FILE="index.html"

if [ ! -f "$FILE" ]; then
    echo "❌ index.html not found."
    echo "Run this command from the folder containing index.html."
    exit 1
fi

cp "$FILE" "${FILE}.before_scroll_tour_$(date +%Y%m%d_%H%M%S).bak"

python3 - "$FILE" <<'PY'
from pathlib import Path
import sys

file = Path(sys.argv[1])
html = file.read_text(encoding="utf-8")

# ------------------------------------------------------------
# Remove a previous version if the user runs this installer
# more than once.
# ------------------------------------------------------------

START = "<!-- AMH_SCROLL_TOUR_START -->"
END   = "<!-- AMH_SCROLL_TOUR_END -->"

if START in html and END in html:
    a = html.index(START)
    b = html.index(END, a) + len(END)
    html = html[:a] + html[b:]

# ------------------------------------------------------------
# CSS
# ------------------------------------------------------------

css = r'''
<!-- AMH_SCROLL_TOUR_START -->

<style id="amhScrollTourCSS">

/* ============================================================
   AMH PROFESSIONAL SCROLL ONBOARDING
   ============================================================ */

:root{
  --tour-brand:#e94b3c;
  --tour-brand-dark:#bd3027;
  --tour-green:#0a8150;
  --tour-ink:#14231d;
  --tour-muted:#65746d;
  --tour-glass:rgba(255,255,255,.92);
}

/* ---------- Main layer ---------- */

.amh-scroll-tour{
  position:fixed;
  inset:0;
  z-index:99990;
  pointer-events:none;
  opacity:0;
  visibility:hidden;
  transition:
    opacity .35s ease,
    visibility .35s ease;
  direction:rtl;
}

.amh-scroll-tour.is-active{
  opacity:1;
  visibility:visible;
}

/* ---------- Background ---------- */

.amh-tour-backdrop{
  position:absolute;
  inset:0;
  background:
    radial-gradient(
      circle at 50% 45%,
      rgba(255,255,255,.04),
      rgba(3,12,9,.48)
    );
  backdrop-filter:blur(1.5px);
  -webkit-backdrop-filter:blur(1.5px);
}

/* ---------- Spotlight ---------- */

.amh-tour-spotlight{
  position:fixed;
  z-index:99991;
  pointer-events:none;
  border-radius:18px;

  box-shadow:
    0 0 0 2px rgba(255,255,255,.92),
    0 0 0 5px rgba(233,75,60,.34),
    0 0 0 100vmax rgba(3,12,9,.42),
    0 18px 60px rgba(0,0,0,.28);

  opacity:0;

  transition:
    left .42s cubic-bezier(.2,.8,.2,1),
    top .42s cubic-bezier(.2,.8,.2,1),
    width .42s cubic-bezier(.2,.8,.2,1),
    height .42s cubic-bezier(.2,.8,.2,1),
    border-radius .3s ease,
    opacity .25s ease;
}

.amh-scroll-tour.is-active .amh-tour-spotlight{
  opacity:1;
}

/* ---------- Animated pulse around target ---------- */

.amh-tour-pulse{
  position:absolute;
  inset:-7px;
  border-radius:inherit;
  border:2px solid rgba(233,75,60,.45);
  animation:amhTourPulse 1.7s ease-out infinite;
}

@keyframes amhTourPulse{
  0%{
    transform:scale(.96);
    opacity:.9;
  }
  70%{
    transform:scale(1.08);
    opacity:0;
  }
  100%{
    transform:scale(1.08);
    opacity:0;
  }
}

/* ---------- Main information card ---------- */

.amh-tour-card{
  position:fixed;
  z-index:99994;

  width:min(390px,calc(100vw - 28px));

  background:
    linear-gradient(
      145deg,
      rgba(255,255,255,.98),
      rgba(248,251,249,.95)
    );

  border:1px solid rgba(20,35,29,.09);
  border-radius:24px;

  padding:17px 17px 15px;

  box-shadow:
    0 24px 80px rgba(0,0,0,.28),
    0 5px 20px rgba(0,0,0,.12);

  transform:
    translateY(18px)
    scale(.94);

  opacity:0;

  transition:
    left .4s cubic-bezier(.2,.8,.2,1),
    top .4s cubic-bezier(.2,.8,.2,1),
    transform .4s cubic-bezier(.2,.8,.2,1),
    opacity .3s ease;
}

.amh-tour-card.show{
  opacity:1;
  transform:translateY(0) scale(1);
}

/* ---------- Card top ---------- */

.amh-tour-top{
  display:flex;
  align-items:flex-start;
  gap:11px;
}

.amh-tour-icon{
  width:46px;
  height:46px;
  min-width:46px;

  display:grid;
  place-items:center;

  border-radius:15px;

  background:
    linear-gradient(
      135deg,
      #fff0ed,
      #fff8f7
    );

  border:1px solid rgba(233,75,60,.12);

  font-size:22px;

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.9);
}

.amh-tour-heading{
  min-width:0;
  flex:1;
  padding-left:23px;
}

.amh-tour-step{
  display:block;
  color:var(--tour-brand);
  font-size:10px;
  font-weight:900;
  letter-spacing:.5px;
  margin-bottom:3px;
}

.amh-tour-title{
  margin:0;
  color:var(--tour-ink);
  font-size:15px;
  line-height:1.35;
  font-weight:950;
}

.amh-tour-close{
  position:absolute;
  top:10px;
  left:11px;

  width:27px;
  height:27px;

  border:0;
  border-radius:50%;

  display:grid;
  place-items:center;

  background:#f1f4f2;
  color:#68756f;

  cursor:pointer;

  font-size:17px;
  line-height:1;

  transition:
    background .2s ease,
    transform .2s ease;
}

.amh-tour-close:hover{
  background:#e8ece9;
  transform:rotate(8deg);
}

/* ---------- Description ---------- */

.amh-tour-description{
  margin:10px 0 12px;

  color:var(--tour-muted);

  font-size:12px;
  line-height:1.75;
}

/* ---------- Bottom controls ---------- */

.amh-tour-bottom{
  display:flex;
  align-items:center;
  gap:10px;
}

.amh-tour-progress{
  display:flex;
  align-items:center;
  gap:4px;
  flex:1;
}

.amh-tour-dot{
  height:4px;
  flex:1;
  border-radius:99px;
  background:#e1e8e4;

  transition:
    background .3s ease,
    transform .3s ease;
}

.amh-tour-dot.active{
  background:var(--tour-brand);
  transform:scaleY(1.35);
}

.amh-tour-counter{
  color:#84918b;
  font-size:10px;
  font-weight:800;
  white-space:nowrap;
}

/* ---------- Scroll hint ---------- */

.amh-tour-scroll-hint{
  position:fixed;
  z-index:99993;

  left:50%;
  bottom:18px;

  transform:
    translateX(-50%)
    translateY(10px);

  display:flex;
  align-items:center;
  gap:7px;

  padding:8px 13px;

  background:rgba(20,35,29,.88);
  color:#fff;

  border-radius:999px;

  font-size:10px;
  font-weight:800;

  box-shadow:0 10px 35px rgba(0,0,0,.22);

  opacity:0;

  transition:
    opacity .3s ease,
    transform .3s ease;
}

.amh-tour-scroll-hint.show{
  opacity:1;
  transform:translateX(-50%) translateY(0);
}

.amh-tour-scroll-icon{
  display:inline-block;
  animation:
    amhScrollFinger 1.2s ease-in-out infinite;
}

@keyframes amhScrollFinger{
  0%,100%{
    transform:translateY(-2px);
  }
  50%{
    transform:translateY(4px);
  }
}

/* ---------- Arrow ---------- */

.amh-tour-arrow{
  position:fixed;
  z-index:99993;

  width:52px;
  height:52px;

  display:grid;
  place-items:center;

  border-radius:50%;

  background:
    linear-gradient(
      145deg,
      #ffffff,
      #f8faf9
    );

  color:var(--tour-brand);

  border:2px solid rgba(233,75,60,.16);

  box-shadow:
    0 14px 40px rgba(0,0,0,.22),
    0 0 0 5px rgba(255,255,255,.18);

  font-size:24px;
  font-weight:900;

  opacity:0;

  transform:scale(.65);

  transition:
    left .4s cubic-bezier(.2,.8,.2,1),
    top .4s cubic-bezier(.2,.8,.2,1),
    opacity .25s ease,
    transform .35s cubic-bezier(.2,.8,.2,1);
}

.amh-tour-arrow.show{
  opacity:1;
  transform:scale(1);

  animation:
    amhArrowFloat 1.25s ease-in-out infinite;
}

@keyframes amhArrowFloat{
  0%,100%{
    margin-top:0;
  }
  50%{
    margin-top:8px;
  }
}

/* ---------- Target animation ---------- */

.amh-tour-target{
  position:relative!important;
  z-index:99992!important;

  transition:
    transform .3s ease,
    box-shadow .3s ease!important;
}

.amh-tour-target:hover{
  transform:translateY(-1px);
}

/* ---------- Tiny label attached to target ---------- */

.amh-tour-label{
  position:fixed;
  z-index:99995;

  padding:6px 9px;

  background:var(--tour-brand);
  color:#fff;

  border-radius:8px;

  font-size:9px;
  font-weight:900;

  white-space:nowrap;

  box-shadow:0 7px 20px rgba(233,75,60,.28);

  opacity:0;

  transform:translateY(5px);

  transition:
    opacity .25s ease,
    transform .25s ease;
}

.amh-tour-label.show{
  opacity:1;
  transform:translateY(0);
}

/* ---------- Completion ---------- */

.amh-tour-complete{
  position:fixed;
  inset:0;
  z-index:100000;

  display:grid;
  place-items:center;

  background:
    radial-gradient(
      circle at center,
      rgba(10,129,80,.18),
      rgba(3,12,9,.72)
    );

  opacity:0;
  visibility:hidden;

  transition:
    opacity .35s ease,
    visibility .35s ease;
}

.amh-tour-complete.show{
  opacity:1;
  visibility:visible;
}

.amh-tour-complete-box{
  width:min(380px,calc(100vw - 30px));

  padding:28px 22px;

  text-align:center;

  background:#fff;
  border-radius:28px;

  box-shadow:0 30px 100px rgba(0,0,0,.32);

  transform:scale(.9);
  transition:transform .4s cubic-bezier(.2,.8,.2,1);
}

.amh-tour-complete.show .amh-tour-complete-box{
  transform:scale(1);
}

.amh-tour-complete-icon{
  width:68px;
  height:68px;

  margin:0 auto 12px;

  display:grid;
  place-items:center;

  border-radius:22px;

  background:#e9f7f0;

  font-size:31px;

  animation:
    amhCompletePop .55s cubic-bezier(.2,1.5,.4,1);
}

@keyframes amhCompletePop{
  0%{transform:scale(.4);opacity:0}
  100%{transform:scale(1);opacity:1}
}

.amh-tour-complete h3{
  margin:0 0 7px;
  color:var(--tour-ink);
  font-size:18px;
  font-weight:950;
}

.amh-tour-complete p{
  margin:0;
  color:var(--tour-muted);
  font-size:12px;
  line-height:1.7;
}

.amh-tour-complete button{
  margin-top:17px;

  border:0;
  border-radius:13px;

  padding:11px 20px;

  background:
    linear-gradient(
      135deg,
      var(--tour-brand),
      var(--tour-brand-dark)
    );

  color:#fff;

  font-weight:900;
  font-size:12px;

  cursor:pointer;

  box-shadow:
    0 8px 22px rgba(233,75,60,.25);
}

/* ---------- Mobile ---------- */

@media(max-width:600px){

  .amh-tour-card{
    left:14px!important;
    right:14px!important;
    bottom:15px!important;
    top:auto!important;

    width:auto;

    border-radius:22px;

    padding:15px 15px 13px;
  }

  .amh-tour-arrow{
    width:44px;
    height:44px;
    font-size:21px;
  }

  .amh-tour-scroll-hint{
    bottom:165px;
  }

  .amh-tour-label{
    display:none;
  }
}

/* ---------- Reduced motion ---------- */

@media(prefers-reduced-motion:reduce){

  .amh-tour-arrow.show,
  .amh-tour-scroll-icon,
  .amh-tour-pulse,
  .amh-tour-complete-icon{
    animation:none!important;
  }

  .amh-tour-card,
  .amh-tour-arrow,
  .amh-tour-spotlight,
  .amh-tour-label{
    transition:none!important;
  }
}

</style>
'''

# ------------------------------------------------------------
# HTML
# ------------------------------------------------------------

tour_html = r'''
<div
  class="amh-scroll-tour"
  id="amhScrollTour"
  aria-hidden="true"
>

  <div class="amh-tour-backdrop"></div>

  <div
    class="amh-tour-spotlight"
    id="amhTourSpotlight"
    aria-hidden="true"
  >
    <div class="amh-tour-pulse"></div>
  </div>

  <div
    class="amh-tour-arrow"
    id="amhTourArrow"
    aria-hidden="true"
  >
    ↓
  </div>

  <div
    class="amh-tour-label"
    id="amhTourLabel"
    aria-hidden="true"
  ></div>

  <section
    class="amh-tour-card"
    id="amhTourCard"
    role="dialog"
    aria-live="polite"
    aria-label="دليل استخدام الموقع"
  >

    <button
      type="button"
      class="amh-tour-close"
      id="amhTourClose"
      aria-label="إغلاق الدليل"
    >×</button>

    <div class="amh-tour-top">

      <div
        class="amh-tour-icon"
        id="amhTourIcon"
      >👋</div>

      <div class="amh-tour-heading">

        <span
          class="amh-tour-step"
          id="amhTourStep"
        >دليل الموقع</span>

        <h3
          class="amh-tour-title"
          id="amhTourTitle"
        >أهلاً بيك</h3>

      </div>

    </div>

    <p
      class="amh-tour-description"
      id="amhTourDescription"
    ></p>

    <div class="amh-tour-bottom">

      <div
        class="amh-tour-progress"
        id="amhTourProgress"
      ></div>

      <span
        class="amh-tour-counter"
        id="amhTourCounter"
      >1 / 6</span>

    </div>

  </section>

  <div
    class="amh-tour-scroll-hint"
    id="amhTourScrollHint"
  >
    <span class="amh-tour-scroll-icon">☝️</span>
    <span>انزل بالصفحة للتعرف على باقي الموقع</span>
  </div>

</div>


<div
  class="amh-tour-complete"
  id="amhTourComplete"
  aria-hidden="true"
>

  <div class="amh-tour-complete-box">

    <div class="amh-tour-complete-icon">
      ✓
    </div>

    <h3>
      كده عرفت الموقع كله 🎉
    </h3>

    <p>
      دلوقتي تقدر تعمل حساب، تختار منتجاتك،
      تحدد مكان التوصيل، وتتابع طلبك لحد الاستلام.
    </p>

    <button
      type="button"
      id="amhTourCompleteClose"
    >
      ابدأ استخدام الموقع
    </button>

  </div>

</div>
'''

# ------------------------------------------------------------
# JavaScript
# ------------------------------------------------------------

js = r'''
<script id="amhScrollTourJS">
(function(){

  'use strict';

  /* ==========================================================
     AMH PROFESSIONAL SCROLL TOUR
     ========================================================== */

  const TOUR_KEY =
    (window.CONFIG && CONFIG.storageKey
      ? CONFIG.storageKey
      : 'alazhar-city-delivery')
    + '-professional-scroll-tour-v2';

  const $ = (selector) =>
    document.querySelector(selector);

  const tour =
    $('#amhScrollTour');

  const card =
    $('#amhTourCard');

  const spotlight =
    $('#amhTourSpotlight');

  const arrow =
    $('#amhTourArrow');

  const label =
    $('#amhTourLabel');

  const icon =
    $('#amhTourIcon');

  const stepEl =
    $('#amhTourStep');

  const title =
    $('#amhTourTitle');

  const description =
    $('#amhTourDescription');

  const progress =
    $('#amhTourProgress');

  const counter =
    $('#amhTourCounter');

  const close =
    $('#amhTourClose');

  const scrollHint =
    $('#amhTourScrollHint');

  const complete =
    $('#amhTourComplete');

  const completeClose =
    $('#amhTourCompleteClose');

  if(
    !tour ||
    !card ||
    !spotlight ||
    !arrow
  ){
    return;
  }

  /* ==========================================================
     TOUR STEPS
     ========================================================== */

  const steps = [

    {
      selector:'#openAccountBtn',

      icon:'👤',

      title:'ابدأ بإنشاء حسابك',

      text:
        'من زر الحساب تقدر تسجل حسابك وتدخل بياناتك وتضيف عناوين التوصيل. الحساب بيخلي إدارة طلباتك أسهل في كل مرة.',

      label:'حسابك وعناوينك',

      position:'top',

      start:0
    },

    {
      selector:'#catSec',

      icon:'🛍️',

      title:'اختار المنتجات',

      text:
        'انزل لقسم المنتجات واختار القسم اللي محتاجه. تصفح المنتجات وأضف اللي تحتاجه مباشرة إلى السلة.',

      label:'الأقسام والمنتجات',

      position:'top',

      start:.12
    },

    {
      selector:'#openCart',

      icon:'🛒',

      title:'راجع السلة',

      text:
        'من السلة تقدر تراجع المنتجات والكميات والإجمالي قبل إتمام الطلب، وتعدل أي حاجة محتاج تغيرها.',

      label:'سلة المشتريات',

      position:'bottom',

      start:.30
    },

    {
      selector:'#openAccountBtn',

      icon:'📍',

      title:'حدد مكان التوصيل',

      text:
        'من حسابك تقدر تضيف عنوان السكن أو تستخدم تحديد الموقع. كده بيانات التوصيل تبقى جاهزة للطلب.',

      label:'العنوان و GPS',

      position:'top',

      start:.48
    },

    {
      selector:'a[href="./track.html"]',

      icon:'📦',

      title:'تابع طلبك',

      text:
        'بعد إرسال الطلب استخدم متابعة الطلبات علشان تعرف حالة الطلب وتفاصيله وتتابع الرحلة لحد الاستلام.',

      label:'متابعة الطلب',

      position:'bottom',

      start:.67
    },

    {
      selector:'#installBox',

      icon:'📲',

      title:'ثبّت التطبيق على جهازك',

      text:
        'لو حابب وصول أسرع، تقدر تثبت التطبيق على جهازك وتفتحه مباشرة من الشاشة الرئيسية.',

      label:'تثبيت التطبيق',

      position:'top',

      start:.84
    }

  ];

  let current = -1;
  let running = false;
  let initialized = false;
  let scrollRAF = 0;
  let finishTimer = null;

  /* ==========================================================
     STORAGE
     ========================================================== */

  function wasCompleted(){

    try{
      return localStorage.getItem(TOUR_KEY) === '1';
    }catch(e){
      return false;
    }

  }

  function markCompleted(){

    try{
      localStorage.setItem(
        TOUR_KEY,
        '1'
      );
    }catch(e){}

  }

  /* ==========================================================
     TARGET
     ========================================================== */

  function findTarget(step){

    if(!step) return null;

    const nodes =
      document.querySelectorAll(
        step.selector
      );

    if(!nodes.length){
      return null;
    }

    for(const node of nodes){

      const rect =
        node.getBoundingClientRect();

      const style =
        window.getComputedStyle(node);

      if(
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden'
      ){
        return node;
      }

    }

    return nodes[0];
  }

  /* ==========================================================
     PROGRESS
     ========================================================== */

  function buildProgress(){

    progress.innerHTML = '';

    steps.forEach((_,index)=>{

      const dot =
        document.createElement('i');

      dot.className =
        'amh-tour-dot';

      if(index === 0){
        dot.classList.add('active');
      }

      progress.appendChild(dot);

    });

  }

  function updateProgress(index){

    [...progress.children]
      .forEach((dot,i)=>{

        dot.classList.toggle(
          'active',
          i === index
        );

      });

    counter.textContent =
      `${index + 1} / ${steps.length}`;
  }

  /* ==========================================================
     TARGET RECT
     ========================================================== */

  function getRect(target){

    if(!target){
      return null;
    }

    const r =
      target.getBoundingClientRect();

    const padding = 7;

    return {
      left:
        Math.max(
          4,
          r.left - padding
        ),

      top:
        Math.max(
          4,
          r.top - padding
        ),

      width:
        Math.min(
          window.innerWidth - 8,
          r.width + padding * 2
        ),

      height:
        Math.min(
          window.innerHeight - 8,
          r.height + padding * 2
        ),

      right:
        r.right + padding,

      bottom:
        r.bottom + padding
    };

  }

  /* ==========================================================
     SPOTLIGHT
     ========================================================== */

  function moveSpotlight(target){

    const r =
      getRect(target);

    if(!r){
      spotlight.style.opacity = '0';
      return;
    }

    spotlight.style.left =
      r.left + 'px';

    spotlight.style.top =
      r.top + 'px';

    spotlight.style.width =
      r.width + 'px';

    spotlight.style.height =
      r.height + 'px';

    spotlight.style.borderRadius =
      Math.min(
        20,
        Math.max(
          10,
          r.height / 5
        )
      ) + 'px';

  }

  /* ==========================================================
     ARROW
     ========================================================== */

  function moveArrow(target,step){

    const r =
      getRect(target);

    if(!r){
      arrow.classList.remove('show');
      return;
    }

    let x =
      r.left +
      r.width / 2 -
      26;

    let y;

    if(
      step.position === 'bottom'
    ){

      y =
        Math.min(
          window.innerHeight - 65,
          r.bottom + 14
        );

      arrow.textContent = '↓';

    }else{

      y =
        Math.max(
          12,
          r.top - 66
        );

      arrow.textContent = '↑';

    }

    x =
      Math.max(
        8,
        Math.min(
          window.innerWidth - 60,
          x
        )
      );

    arrow.style.left =
      x + 'px';

    arrow.style.top =
      y + 'px';

    arrow.classList.add('show');

  }

  /* ==========================================================
     LABEL
     ========================================================== */

  function moveLabel(target,step){

    const r =
      getRect(target);

    if(
      !r ||
      window.innerWidth <= 600
    ){

      label.classList.remove('show');
      return;

    }

    label.textContent =
      step.label;

    let x =
      r.left +
      r.width / 2 -
      45;

    let y;

    if(
      step.position === 'bottom'
    ){

      y =
        Math.min(
          window.innerHeight - 40,
          r.bottom + 8
        );

    }else{

      y =
        Math.max(
          8,
          r.top - 32
        );

    }

    x =
      Math.max(
        8,
        Math.min(
          window.innerWidth - 110,
          x
        )
      );

    label.style.left =
      x + 'px';

    label.style.top =
      y + 'px';

    label.classList.add('show');

  }

  /* ==========================================================
     CARD POSITION
     ========================================================== */

  function moveCard(target,step){

    /*
     * On mobile the card stays at the bottom,
     * keeping the target completely visible.
     */

    if(window.innerWidth <= 600){

      card.style.left = '';
      card.style.right = '';
      card.style.top = '';
      card.style.bottom = '15px';

      return;

    }

    const r =
      getRect(target);

    if(!r) return;

    const cardWidth =
      Math.min(
        390,
        window.innerWidth - 28
      );

    let left =
      r.left +
      r.width / 2 -
      cardWidth / 2;

    let top;

    if(
      step.position === 'bottom'
    ){

      top =
        r.bottom + 18;

    }else{

      top =
        r.top - 185;

    }

    /*
     * If there isn't enough space above,
     * put the card below.
     */

    if(top < 12){

      top =
        r.bottom + 18;

    }

    /*
     * If there isn't enough space below,
     * put it above.
     */

    if(
      top + 180 >
      window.innerHeight
    ){

      top =
        r.top - 190;

    }

    left =
      Math.max(
        14,
        Math.min(
          window.innerWidth -
          cardWidth -
          14,
          left
        )
      );

    top =
      Math.max(
        12,
        Math.min(
          window.innerHeight -
          190,
          top
        )
      );

    card.style.width =
      cardWidth + 'px';

    card.style.left =
      left + 'px';

    card.style.right =
      'auto';

    card.style.top =
      top + 'px';

    card.style.bottom =
      'auto';

  }

  /* ==========================================================
     MOVE EVERYTHING
     ========================================================== */

  function updateVisuals(){

    if(
      !running ||
      current < 0
    ){
      return;
    }

    const step =
      steps[current];

    const target =
      findTarget(step);

    if(!target){
      return;
    }

    moveSpotlight(target);
    moveArrow(target,step);
    moveLabel(target,step);
    moveCard(target,step);

  }

  /* ==========================================================
     REMOVE TARGET
     ========================================================== */

  function clearTargets(){

    document
      .querySelectorAll(
        '.amh-tour-target'
      )
      .forEach(el=>{

        el.classList.remove(
          'amh-tour-target'
        );

      });

  }

  /* ==========================================================
     SHOW STEP
     ========================================================== */

  function showStep(index){

    if(
      index < 0 ||
      index >= steps.length
    ){
      return;
    }

    const step =
      steps[index];

    const target =
      findTarget(step);

    if(!target){

      /*
       * If a target is missing,
       * continue gracefully.
       */

      return;

    }

    clearTargets();

    current = index;
    running = true;

    target.classList.add(
      'amh-tour-target'
    );

    icon.textContent =
      step.icon;

    stepEl.textContent =
      `الخطوة ${index + 1}`;

    title.textContent =
      step.title;

    description.textContent =
      step.text;

    updateProgress(index);

    tour.classList.add(
      'is-active'
    );

    tour.setAttribute(
      'aria-hidden',
      'false'
    );

    /*
     * Smooth entrance.
     */

    card.classList.remove(
      'show'
    );

    requestAnimationFrame(()=>{

      updateVisuals();

      requestAnimationFrame(()=>{

        card.classList.add(
          'show'
        );

      });

    });

    /*
     * Scroll hint appears during
     * the first several steps.
     */

    if(index < steps.length - 1){

      scrollHint.classList.add(
        'show'
      );

      clearTimeout(
        window.__amhTourHintTimer
      );

      window.__amhTourHintTimer =
        setTimeout(()=>{

          scrollHint.classList.remove(
            'show'
          );

        },2800);

    }else{

      scrollHint.classList.remove(
        'show'
      );

    }

  }

  /* ==========================================================
     CLOSE
     ========================================================== */

  function closeTour(save=true){

    running = false;

    clearTargets();

    card.classList.remove(
      'show'
    );

    arrow.classList.remove(
      'show'
    );

    label.classList.remove(
      'show'
    );

    spotlight.style.opacity =
      '0';

    scrollHint.classList.remove(
      'show'
    );

    tour.classList.remove(
      'is-active'
    );

    tour.setAttribute(
      'aria-hidden',
      'true'
    );

    if(save){
      markCompleted();
    }

  }

  /* ==========================================================
     COMPLETE SCREEN
     ========================================================== */

  function showComplete(){

    clearTimeout(
      finishTimer
    );

    closeTour(false);

    complete.classList.add(
      'show'
    );

    complete.setAttribute(
      'aria-hidden',
      'false'
    );

    markCompleted();

  }

  function closeComplete(){

    complete.classList.remove(
      'show'
    );

    complete.setAttribute(
      'aria-hidden',
      'true'
    );

    markCompleted();

  }

  /* ==========================================================
     DETERMINE CURRENT STEP FROM PAGE SCROLL
     ========================================================== */

  function calculateStep(){

    const doc =
      document.documentElement;

    const maxScroll =
      Math.max(
        1,
        doc.scrollHeight -
        window.innerHeight
      );

    const ratio =
      window.scrollY /
      maxScroll;

    let index = 0;

    for(
      let i = 0;
      i < steps.length;
      i++
    ){

      if(
        ratio >= steps[i].start
      ){
        index = i;
      }

    }

    return index;

  }

  /* ==========================================================
     SCROLL ENGINE
     ========================================================== */

  function handleScroll(){

    if(
      !running ||
      !initialized
    ){
      return;
    }

    if(scrollRAF){
      return;
    }

    scrollRAF =
      requestAnimationFrame(()=>{

        scrollRAF = 0;

        const next =
          calculateStep();

        if(
          next !== current
        ){

          showStep(next);

        }else{

          updateVisuals();

        }

        /*
         * End of page.
         */

        const doc =
          document.documentElement;

        const nearBottom =
          window.scrollY +
          window.innerHeight >=
          doc.scrollHeight - 80;

        if(
          nearBottom &&
          current === steps.length - 1
        ){

          finishTimer =
            setTimeout(
              showComplete,
              650
            );

        }

      });

  }

  /* ==========================================================
     USER INTERACTION
     ========================================================== */

  close.addEventListener(
    'click',
    ()=>{
      closeTour(true);
    }
  );

  completeClose.addEventListener(
    'click',
    closeComplete
  );

  /*
   * ESC closes the tour.
   */

  document.addEventListener(
    'keydown',
    event=>{

      if(
        event.key === 'Escape' &&
        running
      ){

        closeTour(true);

      }

    }
  );

  /*
   * Clicking the backdrop closes it.
   */

  tour
    .querySelector('.amh-tour-backdrop')
    ?.addEventListener(
      'click',
      ()=>{
        closeTour(true);
      }
    );

  /*
   * Keep the target in view if the
   * user manually resizes the window.
   */

  window.addEventListener(
    'resize',
    ()=>{
      if(running){
        updateVisuals();
      }
    },
    {passive:true}
  );

  window.addEventListener(
    'scroll',
    handleScroll,
    {passive:true}
  );

  /* ==========================================================
     START
     ========================================================== */

  function start(){

    if(wasCompleted()){
      return;
    }

    buildProgress();

    initialized = true;

    /*
     * Don't block the first page.
     * Give the user a short introduction,
     * then the scroll controls the tour.
     */

    setTimeout(()=>{

      if(
        wasCompleted()
      ){
        return;
      }

      const first =
        findTarget(steps[0]);

      if(!first){
        return;
      }

      showStep(0);

      scrollHint.classList.add(
        'show'
      );

      setTimeout(()=>{

        scrollHint.classList.remove(
          'show'
        );

      },4000);

    },1500);

  }

  /*
   * Wait until the current site has loaded.
   */

  if(
    document.readyState ===
    'loading'
  ){

    document.addEventListener(
      'DOMContentLoaded',
      start,
      {once:true}
    );

  }else{

    start();

  }

  /*
   * Developer/testing helper.
   *
   * From console:
   * window.resetAMHScrollTour()
   */

  window.resetAMHScrollTour =
    function(){

      try{
        localStorage.removeItem(
          TOUR_KEY
        );
      }catch(e){}

      location.reload();

    };

})();
</script>
'''

# ------------------------------------------------------------
# Completion marker
# ------------------------------------------------------------

block = (
    START
    + "\n"
    + css
    + "\n"
    + tour_html
    + "\n"
    + js
    + "\n"
    + END
)

# ------------------------------------------------------------
# Insert CSS/HTML before </head>
# and JS before </body>
#
# The whole block is kept together by markers so it can be
# replaced cleanly if the installer is run again.
# ------------------------------------------------------------

# CSS + HTML must be in body/head correctly.
# Split into three pieces for valid HTML.

css_only = START + "\n" + css.split("</style>",1)[0] + "</style>\n"
html_only = tour_html
js_only = js + "\n" + END

if "</head>" not in html:
    raise SystemExit("❌ </head> not found.")

if "</body>" not in html:
    raise SystemExit("❌ </body> not found.")

html = html.replace(
    "</head>",
    css_only + "</head>",
    1
)

html = html.replace(
    "</body>",
    html_only + "\n" + js_only + "\n</body>",
    1
)

file.write_text(
    html,
    encoding="utf-8"
)

print()
print("╔══════════════════════════════════════════════╗")
print("║     AMH PROFESSIONAL SCROLL TOUR             ║")
print("╠══════════════════════════════════════════════╣")
print("║ ✅ CSS installed                             ║")
print("║ ✅ Interactive spotlight installed           ║")
print("║ ✅ Animated arrows installed                 ║")
print("║ ✅ Step progress installed                   ║")
print("║ ✅ Mobile layout installed                   ║")
print("║ ✅ First-visit storage installed             ║")
print("║ ✅ Completion screen installed               ║")
print("╚══════════════════════════════════════════════╝")
print()
print("Backup created automatically.")
PY

chmod +x install_scroll_tour.sh
./install_scroll_tour.sh
