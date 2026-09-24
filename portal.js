(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const app = $('#app');
  let role = null;
  let cloudOrders = null;
  let stopOrders = null;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const statusLabels = {new:'جديد',accepted:'مقبول',preparing:'جاري التجهيز',ready:'جاهز',delivering:'في الطريق',delivered:'تم التسليم',cancelled:'ملغي'};

  function table(orders, rowFn) {
    if (!orders.length) return '<div class="empty">لا توجد بيانات حالياً.</div>';
    return `<div style="overflow:auto"><table class="table"><thead><tr><th>الطلب</th><th>العميل</th><th>الحالة</th><th>الإجمالي</th><th>إجراء</th></tr></thead><tbody>${orders.map(rowFn).join('')}</tbody></table></div>`;
  }

  function orderRow(o, actionHtml) {
    return `<tr><td><b>${esc(o.reference)}</b></td><td>${esc(o.customer?.name || '—')}</td><td><span class="tag ${esc(o.status)}">${esc(statusLabels[o.status] || o.status)}</span></td><td>${Number(o.total || 0).toLocaleString('en-US')} ج.م</td><td>${actionHtml || '—'}</td></tr>`;
  }

  function adminView(orders) {
    const adminTools = typeof window.adminCatalogView === "function" ? window.adminCatalogView() : "";
    const counts = ['new','accepted','preparing','ready','delivering','delivered'].reduce((a,s)=>{a[s]=orders.filter(o=>o.status===s).length;return a;},{});
    return adminTools + `<div class="metrics">${[['كل الطلبات',orders.length],['جديد',counts.new],['تجهيز',counts.preparing],['في الطريق',counts.delivering]].map(([l,v])=>`<div class="metric"><small>${l}</small><b>${v}</b></div>`).join('')}</div><section class="panel"><h2>آخر الطلبات</h2>${table(orders.slice(0,30), o => orderRow(o, `<button class="action" data-set="preparing" data-id="${esc(o.id)}">تجهيز</button>`))}</section>`;
  }

  function storeView(orders) {
    return `<section class="panel"><h2>طلبات المتجر المصرح بها</h2><p style="color:#69736e;font-size:.82rem">هذه القائمة تأتي من Firebase وفق storeId الموجود في صلاحيات الحساب.</p>${table(orders, o => orderRow(o, o.status === 'new' ? `<button class="action" data-set="accepted" data-id="${esc(o.id)}">قبول</button>` : o.status === 'accepted' ? `<button class="action" data-set="preparing" data-id="${esc(o.id)}">بدء التجهيز</button>` : o.status === 'preparing' ? `<button class="action" data-set="ready" data-id="${esc(o.id)}">جاهز</button>` : '—'))}</section>`;
  }

  function riderView(orders) {
    return `<section class="panel"><h2>طلبات المندوب</h2>${table(orders, o => orderRow(o, o.status === 'ready' && !o.riderId ? `<button class="action" data-pick="${esc(o.id)}">استلام</button>` : o.status === 'delivering' ? `<button class="action" data-set="delivered" data-id="${esc(o.id)}">تم التسليم</button>` : '—'))}</section>`;
  }

  function customerView(orders) {
    return `<section class="panel"><h2>طلباتي</h2>${table(orders, o => orderRow(o, '—'))}</section>`;
  }

  function render() {
    const profile = window.ACDCloud?.profile?.();
    if (!profile) {
      role = null;
      if ($('#modeNote')) $('#modeNote').textContent = 'يجب تسجيل الدخول بحساب Firebase لفتح بوابة التشغيل.';
      app.innerHTML = `<section class="panel" style="text-align:center;padding:36px"><h2>🔐 البوابة محمية</h2><p style="color:#69736e">استخدم تسجيل الدخول ثم سيتم فتح الواجهة المطابقة لصلاحية حسابك فقط.</p></section>`;
      return;
    }

    role = profile.role;
    const orders = Array.isArray(cloudOrders) ? cloudOrders : [];
    const notes = {
      admin:'كل اللي يخص التشغيل اليومي في مكان واحد.',
      store:'طلبات متجرك فقط، حسب الصلاحيات المرتبطة بحسابك.',
      rider:'شوف الطلبات الجاهزة والطلبات المسندة لك، وحدّث حالتها أول بأول.',
      customer:'هنا تتابع الطلبات المرتبطة بحسابك.'
    };
    $('#modeNote').textContent = notes[role] || 'حساب غير معتمد.';

    app.innerHTML = role==='admin' ? adminView(orders) : role==='store' ? storeView(orders) : role==='rider' ? riderView(orders) : role==='customer' ? customerView(orders) : `<section class="panel"><div class="empty">الحساب ده مش متسجل بصلاحية تشغيل. تواصل مع إدارة المنصة.</div></section>`;

    document.querySelectorAll('[data-role]').forEach(btn => {
      btn.style.display = btn.dataset.role === role ? 'inline-flex' : 'none';
    });
  }

  async function doLoginLogout() {
    try {
      if (ACDCloud.user()) await ACDCloud.signOut();
      else await ACDCloud.signIn();
    } catch (err) {
      alert(ACDCloud.authError(err));
    }
  }

  document.addEventListener('click', async e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.id === 'loginBtn') return doLoginLogout();

    if (b.dataset.set && ACDCloud.user()) {
      try { await ACDCloud.updateOrder(b.dataset.id, { status: b.dataset.set }); }
      catch (err) { alert(ACDCloud.authError(err)); }
      return;
    }
    if (b.dataset.pick && ACDCloud.user()) {
      try { await ACDCloud.updateOrder(b.dataset.pick, { status: 'delivering', riderId: ACDCloud.user().uid }); }
      catch (err) { alert(ACDCloud.authError(err)); }
    }
  });

  function cloudReady() {
    if (!window.ACDCloud) return;
    const u = ACDCloud.user();
    $('#loginBtn').textContent = u ? `خروج ${u.displayName || ''}`.trim() : 'تسجيل الدخول';
    if (stopOrders) { try { stopOrders(); } catch (_) {} }
    stopOrders = u ? ACDCloud.watchOrders(x => { cloudOrders = x; render(); }) : null;
    render();
  }

  window.addEventListener('acd-auth-change', cloudReady);
  window.addEventListener('acd-auth-profile', cloudReady);
  window.addEventListener('acd-orders-change', e => { cloudOrders = e.detail || []; render(); });
  cloudReady();
})();


/* ================== إدارة الموقع من لوحة الإدارة ================== */
(function(){
  'use strict';
  const $ = s => document.querySelector(s);
  const esc2 = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const cats = () => Array.isArray(window.CATEGORIES) ? window.CATEGORIES : [];
  function categoryOptions(){ return cats().map(c=>`<option value="${esc2(c[0])}">${esc2(c[2]+' '+c[1])}</option>`).join(''); }
  function toast(msg){ let x=$('#portalToast'); if(!x){x=document.createElement('div');x.id='portalToast';Object.assign(x.style,{position:'fixed',left:'16px',right:'16px',bottom:'16px',zIndex:9999,maxWidth:'520px',margin:'auto',background:'#14231d',color:'#fff',padding:'12px 14px',borderRadius:'14px',font:'800 13px Cairo,system-ui',textAlign:'center',boxShadow:'0 12px 30px #0003'});document.body.appendChild(x);}x.textContent=msg;x.style.display='block';clearTimeout(x._t);x._t=setTimeout(()=>x.style.display='none',2500); }
  window.adminCatalogView = function(){
    if(!window.ACDCloud?.isAdmin?.()) return '';
    return `<section class="panel" id="catalogAdminPanel"><div class="catalog-admin-head"><div><h2>🛠️ إدارة الموقع</h2><p>أضف المنتجات والعروض وعدّل إعدادات الموقع من هنا، من غير ما تلمس الكود.</p></div><span class="catalog-live">Firebase Live</span></div><div class="catalog-tabs"><button class="catalog-tab active" data-catalog-tab="products">المنتجات</button><button class="catalog-tab" data-catalog-tab="offers">العروض</button><button class="catalog-tab" data-catalog-tab="settings">إعدادات الموقع</button></div><div class="catalog-pane active" data-catalog-pane="products"><form id="productAdminForm" class="catalog-form"><input id="productId" placeholder="كود اختياري — مثال: milk-1"><input id="productName" placeholder="اسم المنتج" required><select id="productCat"><option value="">اختار القسم</option>${categoryOptions()}</select><div class="catalog-grid2"><input id="productPrice" type="number" min="0" step="0.01" placeholder="السعر"><input id="productOldPrice" type="number" min="0" step="0.01" placeholder="السعر قبل الخصم"></div><div class="catalog-grid2"><input id="productEmoji" placeholder="إيموجي — مثال 🥛"><input id="productBadge" placeholder="شارة — الأكثر طلبًا / جديد"></div><input id="productImg" placeholder="رابط/مسار الصورة — أو ارفعها من هنا"><input id="productImageFile" type="file" accept="image/*"><label class="checkline"><input id="productActive" type="checkbox" checked> ظاهر على الموقع</label><label class="checkline"><input id="productSoldOut" type="checkbox"> غير متوفر حاليًا</label><div class="catalog-actions"><button type="submit" class="action red">حفظ المنتج</button><button type="button" id="productReset" class="action">منتج جديد</button></div></form><div id="adminProductsList"><div class="empty">جارٍ تحميل المنتجات…</div></div></div><div class="catalog-pane" data-catalog-pane="offers"><form id="offerAdminForm" class="catalog-form"><input id="offerId" placeholder="كود اختياري — مثال: friday"><input id="offerTitle" placeholder="عنوان العرض" required><textarea id="offerDesc" rows="3" placeholder="وصف بسيط للعرض"></textarea><div class="catalog-grid2"><input id="offerTag" placeholder="الشارة — عرض اليوم"><input id="offerPriority" type="number" placeholder="الأولوية" value="0"></div><input id="offerExpiresAt" type="datetime-local"><label class="checkline"><input id="offerActive" type="checkbox" checked> ظاهر على الموقع</label><div class="catalog-actions"><button type="submit" class="action red">حفظ العرض</button><button type="button" id="offerReset" class="action">عرض جديد</button></div></form><div id="adminOffersList"><div class="empty">جارٍ تحميل العروض…</div></div></div><div class="catalog-pane" data-catalog-pane="settings"><form id="siteSettingsForm" class="catalog-form"><div class="catalog-grid2"><input id="siteArea" placeholder="منطقة التوصيل"><input id="siteAudience" placeholder="الجمهور"></div><input id="siteEta" placeholder="المدة — مثال 30–45 دقيقة"><div class="catalog-grid2"><input id="siteDeliveryFee" type="number" min="0" placeholder="رسوم التوصيل"><input id="siteFreeDelivery" type="number" min="0" placeholder="مجاني فوق مبلغ"></div><div class="catalog-grid2"><input id="siteMinOrder" type="number" min="0" placeholder="الحد الأدنى للطلب"><input id="siteOpenHour" type="number" min="0" max="23" placeholder="فتح — 9"></div><input id="siteCloseHour" type="number" min="0" max="48" placeholder="غلق — 26 = 2 ص"><div class="catalog-actions"><button type="submit" class="action red">حفظ إعدادات الموقع</button></div></form></div></section>`;
  };
  async function refreshLists(){
    if(!window.ACDCloud?.isAdmin?.()) return;
    const p=$('#adminProductsList'),o=$('#adminOffersList');
    try{ if(p){const list=await ACDCloud.adminListProducts();p.innerHTML=list.length?`<div class="admin-mini-list">${list.map(x=>`<article class="admin-mini-row"><div><b>${esc2(x.name)}</b><small>${esc2(x.cat)} · ${Number(x.price||0).toLocaleString('ar-EG')} ج.م ${x.active===false?'· مخفي':''}</small></div><div class="catalog-row-actions"><button class="action" data-edit-product="${esc2(x.id)}">تعديل</button><button class="action red" data-delete-product="${esc2(x.id)}">إخفاء</button></div></article>`).join('')}</div>`:'<div class="empty">لسه مفيش منتجات على Firebase.</div>';} if(o){const list=await ACDCloud.adminListOffers();o.innerHTML=list.length?`<div class="admin-mini-list">${list.map(x=>`<article class="admin-mini-row"><div><b>${esc2(x.title)}</b><small>${esc2(x.tag||'عرض')} · ${x.active===false?'مخفي':'ظاهر'}</small></div><div class="catalog-row-actions"><button class="action" data-edit-offer="${esc2(x.id)}">تعديل</button><button class="action red" data-delete-offer="${esc2(x.id)}">إخفاء</button></div></article>`).join('')}</div>`:'<div class="empty">لسه مفيش عروض على Firebase.</div>';}}
    catch(e){toast(ACDCloud.authError(e));}
  }
  function bind(){
    const panel=$('#catalogAdminPanel'); if(!panel || panel.dataset.bound==='1') return; panel.dataset.bound='1';
    panel.querySelectorAll('[data-catalog-tab]').forEach(btn=>btn.addEventListener('click',()=>{panel.querySelectorAll('[data-catalog-tab]').forEach(x=>x.classList.toggle('active',x===btn));panel.querySelectorAll('[data-catalog-pane]').forEach(x=>x.classList.toggle('active',x.dataset.catalogPane===btn.dataset.catalogTab));}));
    $('#productAdminForm')?.addEventListener('submit',async e=>{e.preventDefault();try{let imageUrl=$('#productImg').value.trim();const file=$('#productImageFile')?.files?.[0];if(file){$('#productImg').value='جارٍ رفع الصورة…';imageUrl=await ACDCloud.adminUploadProductImage(file,$('#productId').value||$('#productName').value);$('#productImg').value=imageUrl;}await ACDCloud.adminSaveProduct({id:$('#productId').value,name:$('#productName').value,cat:$('#productCat').value,price:$('#productPrice').value,oldPrice:$('#productOldPrice').value,emoji:$('#productEmoji').value,badge:$('#productBadge').value,img:imageUrl,active:$('#productActive').checked,soldOut:$('#productSoldOut').checked});e.target.reset();$('#productActive').checked=true;toast('تم حفظ المنتج ✅');await refreshLists();}catch(err){toast(ACDCloud.authError(err));}});
    $('#offerAdminForm')?.addEventListener('submit',async e=>{e.preventDefault();try{await ACDCloud.adminSaveOffer({id:$('#offerId').value,title:$('#offerTitle').value,desc:$('#offerDesc').value,tag:$('#offerTag').value,priority:$('#offerPriority').value,expiresAt:$('#offerExpiresAt').value,active:$('#offerActive').checked});e.target.reset();$('#offerActive').checked=true;toast('تم حفظ العرض ✅');await refreshLists();}catch(err){toast(ACDCloud.authError(err));}});
    $('#siteSettingsForm')?.addEventListener('submit',async e=>{e.preventDefault();try{await ACDCloud.adminSaveSiteSettings({area:$('#siteArea').value,audience:$('#siteAudience').value,eta:$('#siteEta').value,deliveryFee:$('#siteDeliveryFee').value,freeDelivery:$('#siteFreeDelivery').value,minOrder:$('#siteMinOrder').value,openHour:$('#siteOpenHour').value,closeHour:$('#siteCloseHour').value});toast('تم حفظ إعدادات الموقع ✅');}catch(err){toast(ACDCloud.authError(err));}});
    panel.addEventListener('click',async e=>{const pe=e.target.closest('[data-edit-product]');if(pe){const x=(await ACDCloud.adminListProducts()).find(v=>v.id===pe.dataset.editProduct);if(!x)return;$('#productId').value=x.id;$('#productName').value=x.name||'';$('#productCat').value=x.cat||'';$('#productPrice').value=x.price||'';$('#productOldPrice').value=x.oldPrice||'';$('#productEmoji').value=x.emoji||'';$('#productBadge').value=x.badge||'';$('#productImg').value=x.img||'';$('#productActive').checked=x.active!==false;$('#productSoldOut').checked=!!x.soldOut;panel.querySelector('[data-catalog-tab="products"]').click();return;}const pd=e.target.closest('[data-delete-product]');if(pd){if(!confirm('إخفاء المنتج من الموقع؟'))return;try{await ACDCloud.adminDeleteProduct(pd.dataset.deleteProduct);toast('تم إخفاء المنتج ✅');await refreshLists();}catch(err){toast(ACDCloud.authError(err));}}const oe=e.target.closest('[data-edit-offer]');if(oe){const x=(await ACDCloud.adminListOffers()).find(v=>v.id===oe.dataset.editOffer);if(!x)return;$('#offerId').value=x.id;$('#offerTitle').value=x.title||'';$('#offerDesc').value=x.desc||'';$('#offerTag').value=x.tag||'';$('#offerPriority').value=x.priority||0;$('#offerExpiresAt').value=x.expiresAt||'';$('#offerActive').checked=x.active!==false;panel.querySelector('[data-catalog-tab="offers"]').click();return;}const od=e.target.closest('[data-delete-offer]');if(od){if(!confirm('إخفاء العرض من الموقع؟'))return;try{await ACDCloud.adminDeleteOffer(od.dataset.deleteOffer);toast('تم إخفاء العرض ✅');await refreshLists();}catch(err){toast(ACDCloud.authError(err));}}});
    ACDCloud.getSiteSettings().then(x=>{['area','audience','eta','deliveryFee','freeDelivery','minOrder','openHour','closeHour'].forEach(k=>{const el=$('#site'+k.charAt(0).toUpperCase()+k.slice(1));if(el&&x[k]!==undefined)el.value=x[k];});}).catch(()=>{});
    refreshLists();
  }
  window.addEventListener('acd-auth-change',()=>setTimeout(bind,0));
  window.addEventListener('acd-auth-profile',()=>setTimeout(bind,0));
  const obs=new MutationObserver(()=>{if($('#catalogAdminPanel'))bind();});
  obs.observe(document.documentElement,{childList:true,subtree:true});
  if(window.ACDCloud?.isAdmin?.()) setTimeout(()=>window.dispatchEvent(new CustomEvent('acd-auth-profile')),0);
})();
