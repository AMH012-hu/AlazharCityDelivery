/* ==========================================================================
   config.js  —  الملف الوحيد اللي هتعدل فيه (المنتجات، الأسعار، الإعدادات)
   ==========================================================================
   إزاي تضيف منتج؟  انسخ سطر من الأسطر اللي تحت وعدّل عليه:
     id      : اسم إنجليزي فريد بدون مسافات (مثال: 'juhayna-milk')
     name    : الاسم اللي يظهر للعميل
     price   : السعر بالجنيه (رقم). لو لسه مش عارف السعر اكتب null
               وهيظهر للعميل "السعر عند التأكيد" ومش بيدخل في الإجمالي.
     cat     : القسم  (grocery / drinks / dairy)  أو أي قسم تضيفه في CATEGORIES
     img     : مسار الصورة جوه فولدر images/  (يفضل .webp وأقل من 60KB)
     soldOut : اختياري — اكتب true لو المنتج خلص (بيظهر "غير متاح")
   ملاحظة: لازم كل سطر ينتهي بفاصلة "," وكل النصوص بين علامتين ' '
   ========================================================================== */

const CONFIG = {
    whatsapp: '201277423376',   // رقم واتساب بالصيغة الدولية بدون +
    deliveryFee: 10,            // مصاريف التوصيل بالجنيه
    minOrder: 0,                // أقل قيمة للطلب (0 = بدون حد أدنى)
    hideUnpriced: false,        // true = إخفاء المنتجات اللي ملهاش سعر
    storageKey: 'alazhar-city-v3'
};

const CATEGORIES = [
    ['all', 'الكل'],
    ['grocery', 'بقالة'],
    ['drinks', 'مشروبات'],
    ['dairy', 'ألبان']
];

const PRODUCTS = [
    /* ---------- بقالة: مكرونة ---------- */
    { id: 'malka-spaghetti',    name: 'مكرونة الملكة اسباجيتي',          price: 22,   cat: 'grocery', img: 'images/malka-spaghetti.webp' },
    { id: 'malka-short-1',      name: 'مكرونة الملكة قصيرة',             price: 22,   cat: 'grocery', img: 'images/malka-short-1.webp' },
    { id: 'malka-short-2',      name: 'مكرونة الملكة قصيرة (نوع ٢)',      price: 22,   cat: 'grocery', img: 'images/malka-short-2.webp' },
    { id: 'malka-elbow',        name: 'مكرونة الملكة هلالية',            price: 22,   cat: 'grocery', img: 'images/malka-elbow.webp' },
    { id: 'italiano-spaghetti', name: 'مكرونة إيطاليانو اسباجيتي',        price: null, cat: 'grocery', img: 'images/italiano-spaghetti.webp' },
    { id: 'italiano-short-1',   name: 'مكرونة إيطاليانو قصيرة',           price: null, cat: 'grocery', img: 'images/italiano-short-1.webp' },
    { id: 'italiano-short-2',   name: 'مكرونة إيطاليانو قصيرة (نوع ٢)',    price: null, cat: 'grocery', img: 'images/italiano-short-2.webp' },
    { id: 'italiano-plus',      name: 'مكرونة إيطاليانو بلس',             price: null, cat: 'grocery', img: 'images/italiano-plus.webp' },
    { id: 'royal-pasta',        name: 'مكرونة رويال',                     price: null, cat: 'grocery', img: 'images/royal-pasta.webp' },

    /* ---------- بقالة: أرز وشاي ونودلز ---------- */
    { id: 'rice-basmati',       name: 'أرز بسمتي - 1 كجم',               price: null, cat: 'grocery', img: 'images/rice-basmati.webp' },
    { id: 'tea-arousa-1',       name: 'شاي العروسة (علبة)',               price: null, cat: 'grocery', img: 'images/tea-arousa-1.webp' },
    { id: 'tea-arousa-2',       name: 'شاي العروسة (باكو)',               price: null, cat: 'grocery', img: 'images/tea-arousa-2.webp' },
    { id: 'supermi-vegetable',  name: 'سوبر مي - خضار',                   price: null, cat: 'grocery', img: 'images/supermi-vegetable.webp' },
    { id: 'supermi-hot-spicy',  name: 'سوبر مي - خضار حار',               price: null, cat: 'grocery', img: 'images/supermi-hot-spicy.webp' },
    { id: 'indomie-chicken',    name: 'إندومي - فراخ',                    price: null, cat: 'grocery', img: 'images/indomie-chicken.webp' },
    { id: 'indomie-beef',       name: 'إندومي - لحمة',                    price: null, cat: 'grocery', img: 'images/indomie-beef.webp' },
    { id: 'indomie-beef-jumbo', name: 'إندومي - لحمة جامبو',              price: null, cat: 'grocery', img: 'images/indomie-beef-jumbo.webp' },

    /* ---------- مشروبات ---------- */
    { id: 'v7-cola',            name: 'في سوبر صودا - كولا',              price: 15,   cat: 'drinks',  img: 'images/v7-cola.webp' },
    { id: 'v7-diet-cola',       name: 'في سوبر صودا - دايت كولا',         price: 15,   cat: 'drinks',  img: 'images/v7-diet-cola.webp' },
    { id: 'v7-malt-apple',      name: 'في 7 مالت - تفاح',                 price: 15,   cat: 'drinks',  img: 'images/v7-malt-apple.webp' },
    { id: 'v7-lemon-lime',      name: 'في سوبر صودا - ليمون',             price: 15,   cat: 'drinks',  img: 'images/v7-lemon-lime.webp' },
    { id: 'water-ogi',          name: 'مياه أوجي',                        price: null, cat: 'drinks',  img: 'images/water-ogi.webp' },

    /* ---------- ألبان ---------- */
    { id: 'juhayna-milk',       name: 'حليب جهينة - كامل الدسم',          price: 42,   cat: 'dairy',   img: 'images/juhayna-milk.webp' },
    { id: 'juhayna-bakheera',   name: 'جهينة بخيره - كامل الدسم',         price: null, cat: 'dairy',   img: 'images/juhayna-bakheera.webp' },
    { id: 'almarai-milk',       name: 'حليب المراعي - 1 لتر',             price: null, cat: 'dairy',   img: 'images/almarai-milk.webp' },
    { id: 'obour-feta',         name: 'جبنة عبور لاند - فيتا',            price: 38,   cat: 'dairy',   img: 'images/obour-feta.webp' }
];
