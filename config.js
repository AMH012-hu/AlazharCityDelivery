/* =====================================================================
   ALAZHAR CITY DELIVERY — الإعدادات + المنتجات
   كل حاجة تتعدل من الملف ده بس (الأسعار، المنتجات، العروض، رقم الواتساب).
   ⚠️ الأسعار هنا تقديرية — راجعها على أسعار السوق عندك قبل النشر.
   ===================================================================== */

let CONFIG = {
    brand: 'ALAZHAR CITY',
    whatsapp: '201501805674',        // ← حط رقمك بصيغة دولية بدون + (مثال: 201012345678)
    storageKey: 'alazhar-city-v4',
    area: 'الحي السادس — مدينة نصر',
    audience: 'أهالي الحي السادس',
    deliveryFee: 15,                 // رسوم التوصيل
    freeDelivery: 300,               // التوصيل ببلاش لو الطلب بيعدي المبلغ ده (0 = تعطيل)
    minOrder: 50,                    // أقل قيمة للطلب
    eta: 'حوالي 10 دقايق',
    openHour: 6,                     // بيفتح الساعة 6 ص
    closeHour: 14,                   // بيقفل الساعة 2 م
    hideUnpriced: false,
    autoImages: true,                // يحمّل صورة كل منتج تلقائيًا من images/products/<كود-المنتج>.webp
    imageDir: 'images/products/',
    imageVersion: '3'                // غيّره (2، 3...) لما تبدّل صور عشان الكاش
};

/* متاجر الحي السادس — المتاجر الجديدة تظهر للعميل عند إضافة منتجاتها من البوابة. */
const STORE_DIRECTORY = [
    { id: 'market-1', name: 'السوبر ماركت', type: 'market', image: 'images/stores/supermarket.svg', description: 'احتياجات البيت والدراسة' },
    { id: 'koshary-hind', name: 'كشري هند', type: 'koshary', image: 'images/stores/koshary.webp', description: 'كشري وأطباق مصرية' },
    { id: 'bakery-sixth', name: 'مخبز الجهيني', type: 'bakeryShop', image: 'images/stores/baladi-bread.webp', description: 'عيش ومخبوزات الحي' },
    { id: 'pizza-rahma', name: 'بيتزا الرحمة', type: 'pizza', image: 'images/stores/pizza.webp', description: 'بيتزا طازة من الحي السادس' },
    { id: 'pharmacy-1', name: 'صيدلية الجهيني', type: 'pharmacy', image: 'images/stores/pharmacy.svg', description: 'احتياجاتك الصحية' }
];

/* [key, الاسم, إيموجي, المجموعة, اللون] */
const CATEGORIES = [
    ['dairy',    'ألبان وأجبان',      '🧀', 'market',   '#fff4d6'],
    ['bakery',   'مخبوزات وبيض',      '🥖', 'market',   '#ffe8d1'],
    ['drinks',   'مياه وعصائر',       '🧃', 'market',   '#dff3ff'],
    ['soda',     'غازيات وطاقة',      '🥤', 'market',   '#ffe0e0'],
    ['hot',      'شاي وقهوة',         '☕', 'market',   '#f1e4d8'],
    ['snacks',   'سناكس وشيبسي',      '🍿', 'market',   '#fff0c2'],
    ['sweets',   'شوكولاتة وحلويات',  '🍫', 'market',   '#f3e1ee'],
    ['study',    'سهرة المذاكرة',     '🍜', 'market',   '#e6e9ff'],
    ['pantry',   'بقالة أساسية',      '🍚', 'market',   '#f5efd9'],
    ['rice',     'أرز ومكرونة وبقوليات','🍝','market',  '#fdf1d3'],
    ['veg',      'خضار وفاكهة',       '🥬', 'market',   '#e2f6dc'],
    ['spices',   'بهارات وتوابل',     '🌶️', 'market',   '#ffe4d2'],
    ['baking',   'حلويات وعجين منزلي','🎂', 'market',   '#fde6f0'],
    ['kitchen',  'مستلزمات مطبخ',     '🍳', 'market',   '#e8eefc'],
    ['canned',   'معلبات وصلصات',     '🥫', 'market',   '#ffe3d6'],
    ['frozen',   'مجمدات',            '🧊', 'market',   '#dcf1f7'],
    ['clean',    'منظفات',            '🧼', 'market',   '#e0f7f0'],
    ['care',     'عناية شخصية',       '🧴', 'market',   '#efe7fb'],
    ['stationery','أدوات دراسة',      '✏️', 'market',   '#e8f1ff'],
    ['pain',     'مسكنات وحرارة',     '💊', 'pharmacy', '#e3f8ec'],
    ['cold',     'برد وكحة وحلق',     '🤧', 'pharmacy', '#e0f4ff'],
    ['stomach',  'معدة وهضم',         '🫄', 'pharmacy', '#fff1d6'],
    ['vitamins', 'فيتامينات ومكملات', '🍊', 'pharmacy', '#ffeccf'],
    ['firstaid', 'إسعافات وأجهزة',    '🩹', 'pharmacy', '#ffe1e1'],
    ['skin',     'بشرة وشعر',         '🧴', 'pharmacy', '#f4e6ff'],
    ['hygiene',  'نظافة شخصية',       '🧻', 'pharmacy', '#e0f3f1'],
    ['koshary-menu', 'كشري',          '🍲', 'koshary',  '#fff0d8'],
    ['pizza-menu',   'بيتزا',         '🍕', 'pizza',    '#ffe5df'],
    ['bakery-shop',  'مخبوزات',       '🥐', 'bakeryShop','#fff1d7']
];

/* [التصنيف, الاسم, السعر, إيموجي, السعر قبل الخصم (اختياري), شارة (اختياري)] */
const RAW = [
    [
        "dairy",
        "لبن كامل الدسم 1 لتر",
        48,
        "🥛",
        "",
        "",
        "images/almarai-milk.webp"
    ],
    [
        "dairy",
        "لبن جهينة بخيره 1 لتر",
        46,
        "🥛",
        "",
        "",
        "images/juhayna-bakheera.webp"
    ],
    [
        "dairy",
        "لبن بالشوكولاتة 200 مل",
        14,
        "🍫",
        "",
        "",
        "images/products/choc-milk.webp"
    ],
    [
        "dairy",
        "زبادي طبيعي 105 جم",
        10,
        "🍶",
        "",
        "",
        "images/products/dairy-4.webp"
    ],
    [
        "dairy",
        "زبادي بالفواكه",
        13,
        "🍓",
        "",
        "",
        "images/products/strawberry-yogurt.webp"
    ],
    [
        "dairy",
        "زبادي يوناني",
        22,
        "🍶",
        "",
        "",
        "images/products/greek-yogurt.webp"
    ],
    [
        "dairy",
        "جبنة دومتي/عبور لاند مثلثات (8 قطع)",
        28,
        "🧀",
        32,
        "خصم",
        "images/products/cheese-triangles.webp"
    ],
    [
        "dairy",
        "جبنة كيري مربعات 12 قطعة",
        45,
        "🧀",
        "",
        "",
        "images/products/cheese-triangles.webp"
    ],
    [
        "dairy",
        "جبنة فيتا عبور لاند 250 جم",
        38,
        "🧀",
        "",
        "",
        "images/obour-feta.webp"
    ],
    [
        "dairy",
        "جبنة رومي شرائح 200 جم",
        55,
        "🧀",
        "",
        "",
        "images/products/romi-cheese.webp"
    ],
    [
        "dairy",
        "جبنة شيدر شرائح",
        42,
        "🧀",
        "",
        "",
        "images/products/cheddar-slices.webp"
    ],
    [
        "dairy",
        "لبنة 250 جم",
        30,
        "🥣",
        "",
        "",
        "images/products/dairy-12.webp"
    ],
    [
        "dairy",
        "قشطة بلدي 200 جم",
        32,
        "🥛",
        "",
        "",
        "images/products/dairy-12.webp"
    ],
    [
        "dairy",
        "زبدة طبيعي 100 جم",
        34,
        "🧈",
        "",
        "",
        "images/products/dairy-14.webp"
    ],
    [
        "dairy",
        "مارجرين 250 جم",
        26,
        "🧈",
        "",
        "",
        "images/products/dairy-14.webp"
    ],
    [
        "dairy",
        "عصير لبن رائب 1 لتر",
        30,
        "🥛",
        "",
        "",
        "images/products/dairy-4.webp"
    ],
    [
        "bakery",
        "عيش توست شرائح",
        28,
        "🍞",
        "",
        "الأكثر طلبًا",
        "images/products/toast.webp"
    ],
    [
        "bakery",
        "عيش توست أسمر",
        32,
        "🍞",
        "",
        "",
        "images/products/brown-toast.webp"
    ],
    [
        "bakery",
        "عيش فينو (6 قطع)",
        20,
        "🥖",
        "",
        "",
        "images/products/fino-bread.webp"
    ],
    [
        "bakery",
        "عيش شامي (10 أرغفة)",
        15,
        "🫓",
        "",
        "",
        "images/products/flatbread.webp"
    ],
    [
        "bakery",
        "عيش سن",
        18,
        "🥖",
        "",
        "",
        "images/products/brown-toast.webp"
    ],
    [
        "bakery",
        "كرواسون سادة",
        12,
        "🥐",
        "",
        "",
        "images/products/croissant.webp"
    ],
    [
        "bakery",
        "كيك جاهز شرائح",
        10,
        "🍰",
        "",
        "",
        "images/products/sweets-6.webp"
    ],
    [
        "bakery",
        "بيض مزارع أبيض (طبق 30)",
        150,
        "🥚",
        "165",
        "خصم",
        "images/products/eggs.webp"
    ],
    [
        "bakery",
        "بيض أبيض (6 بيضات)",
        32,
        "🥚",
        "",
        "",
        "images/products/eggs.webp"
    ],
    [
        "bakery",
        "بيض بلدي (6 بيضات)",
        42,
        "🥚",
        "",
        "",
        "images/products/eggs.webp"
    ],
    [
        "bakery",
        "فطير مشلتت بلدي جاهز",
        35,
        "🥧",
        "",
        "",
        "images/products/feteer-meshaltet.webp"
    ],
    [
        "bakery",
        "بقسماط مقرمش",
        14,
        "🍘",
        "",
        "",
        "images/products/crispy-rusks.webp"
    ],
    [
        "drinks",
        "مياه معدنية 1.5 لتر",
        9,
        "💧",
        "",
        "الأكثر طلبًا",
        "images/water-ogi.webp"
    ],
    [
        "drinks",
        "مياه معدنية 600 مل",
        5,
        "💧",
        "",
        "",
        "images/products/drinks-2.webp"
    ],
    [
        "drinks",
        "مياه معدنية (كرتونة 6 × 1.5 لتر)",
        52,
        "💧",
        "",
        "",
        "images/products/drinks-3.webp"
    ],
    [
        "drinks",
        "مياه فوارة",
        14,
        "🫧",
        "",
        "",
        "images/water-ogi.webp"
    ],
    [
        "drinks",
        "عصير برتقال جهينة 1 لتر",
        38,
        "🍊",
        "",
        "",
        "images/products/drinks-6.webp"
    ],
    [
        "drinks",
        "عصير مانجو لمار 1 لتر",
        38,
        "🥭",
        "",
        "",
        "images/products/drinks-6.webp"
    ],
    [
        "drinks",
        "عصير جوافة جهينة 1 لتر",
        38,
        "🍈",
        "",
        "",
        "images/products/drinks-6.webp"
    ],
    [
        "drinks",
        "عصير تفاح جهينة 235 مل",
        10,
        "🍎",
        "",
        "",
        "images/products/drinks-9.webp"
    ],
    [
        "drinks",
        "عصير مانجو 235 مل",
        10,
        "🥭",
        "",
        "",
        "images/products/drinks-9.webp"
    ],
    [
        "drinks",
        "عصير فراولة 235 مل",
        10,
        "🍓",
        "",
        "",
        "images/products/drinks-9.webp"
    ],
    [
        "drinks",
        "مشروب شعير كنز",
        22,
        "🍺",
        "",
        "",
        "images/products/energy-drink.webp"
    ],
    [
        "soda",
        "سبيرو سباتس - تفاح أخضر",
        15,
        "🍏",
        "",
        "الأكثر طلبًا",
        "images/products/spiro-spathis.webp"
    ],
    [
        "soda",
        "سبيرو سباتس - ليمون صودا",
        15,
        "🍋",
        "",
        "الأكثر طلبًا",
        "images/products/spiro-spathis.webp"
    ],
    [
        "soda",
        "في 7 سوبر صودا - كولا",
        15,
        "🥤",
        "",
        "",
        "images/v7-cola.webp"
    ],
    [
        "soda",
        "في 7 سوبر صودا - دايت كولا",
        15,
        "🥤",
        "",
        "",
        "images/v7-diet-cola.webp"
    ],
    [
        "soda",
        "في 7 سوبر صودا - ليمون",
        15,
        "🍋",
        "",
        "",
        "images/v7-lemon-lime.webp"
    ],
    [
        "soda",
        "في 7 مالت - تفاح",
        15,
        "🍎",
        "",
        "",
        "images/v7-malt-apple.webp"
    ],
    [
        "soda",
        "مشروب طاقة 250 مل",
        35,
        "⚡",
        "",
        "الأكثر طلبًا",
        "images/products/energy-drink.webp"
    ],
    [
        "soda",
        "مشروب طاقة (4 عبوات)",
        125,
        "⚡",
        "140",
        "خصم",
        "images/products/energy-drink.webp"
    ],
    [
        "hot",
        "شاي العروسة 25 كيس",
        35,
        "🍵",
        "",
        "الأكثر طلبًا",
        "images/tea-arousa-1.webp"
    ],
    [
        "hot",
        "شاي العروسة سائب 100 جم",
        38,
        "🍵",
        "",
        "",
        "images/tea-arousa-2.webp"
    ],
    [
        "hot",
        "شاي أخضر رويال 20 كيس",
        40,
        "🍃",
        "",
        "",
        "images/products/green-tea.webp"
    ],
    [
        "hot",
        "مصر كافيه 3 في 1 (10 أكياس)",
        48,
        "☕",
        "",
        "الأكثر طلبًا",
        "images/products/coffee-mix.webp"
    ],
    [
        "hot",
        "مصر كافيه سريعة الذوبان 50 جم",
        65,
        "☕",
        "",
        "",
        "images/products/misr-cafe.webp"
    ],
    [
        "hot",
        "قهوة تركي بن عبد المعبود 100 جم",
        48,
        "☕",
        "",
        "",
        "images/products/turkish-coffee.webp"
    ],
    [
        "hot",
        "قهوة فرنساوي",
        50,
        "☕",
        "",
        "",
        "images/products/turkish-coffee.webp"
    ],
    [
        "hot",
        "كابتشينو مصر كافيه (10 أكياس)",
        55,
        "☕",
        "",
        "",
        "images/products/coffee-mix.webp"
    ],
    [
        "hot",
        "ينسون ونعناع رويال أعشاب",
        22,
        "🌿",
        "",
        "",
        "images/products/green-tea.webp"
    ],
    [
        "hot",
        "هوت شوكليت كورونا",
        45,
        "🍫",
        "",
        "",
        "images/products/choc-milk.webp"
    ],
    [
        "hot",
        "سكر أكياس صغيرة",
        20,
        "🍬",
        "",
        "",
        "images/products/sugar.webp"
    ],
    [
        "snacks",
        "بيج شيبس - جبنة متبلة",
        10,
        "🥔",
        "",
        "الأكثر طلبًا",
        "images/products/big-chips-cheese.webp"
    ],
    [
        "snacks",
        "بيج شيبس - شطة وليمون",
        10,
        "🥔",
        "",
        "الأكثر طلبًا",
        "images/products/big-chips-chili.webp"
    ],
    [
        "snacks",
        "بيج شيبس - ملح بحري",
        10,
        "🥔",
        "",
        "",
        "images/products/big-chips-salt.webp"
    ],
    [
        "snacks",
        "بيج شيبس - طماطم",
        10,
        "🥔",
        "",
        "",
        "images/products/big-chips-tomato.webp"
    ],
    [
        "snacks",
        "بيج شيبس - فلفل حلو",
        10,
        "🥔",
        "",
        "",
        "images/products/big-chips-chili.webp"
    ],
    [
        "snacks",
        "بيج شيبس - كباب مشوي",
        10,
        "🥔",
        "",
        "",
        "images/products/big-chips-tomato.webp"
    ],
    [
        "snacks",
        "بيج شيبس سوبر جامبو عائلي",
        20,
        "🥔",
        "22",
        "خصم",
        "images/products/big-chips-cheese.webp"
    ],
    [
        "snacks",
        "فشار ذرة بالملح جاهز",
        15,
        "🍿",
        "",
        "",
        "images/products/sweet-corn.webp"
    ],
    [
        "snacks",
        "بسكويت الشمعدان سادة",
        8,
        "🍪",
        "",
        "",
        "images/products/tea-biscuits.webp"
    ],
    [
        "snacks",
        "بسكويت نواعم مصري",
        10,
        "🍪",
        "",
        "",
        "images/products/nawaem-biscuits.webp"
    ],
    [
        "snacks",
        "ويفر الشمعدان بالشوكولاتة",
        7,
        "🍫",
        "",
        "الأكثر طلبًا",
        "images/products/shamadan-wafer.webp"
    ],
    [
        "snacks",
        "فول سوداني مملح ومحمص",
        18,
        "🥜",
        "",
        "",
        "images/products/mixed-nuts.webp"
    ],
    [
        "snacks",
        "مكسرات مشكلة 100 جم",
        60,
        "🌰",
        "",
        "",
        "images/products/mixed-nuts.webp"
    ],
    [
        "snacks",
        "تمر مجفف فاخر",
        35,
        "🍑",
        "",
        "",
        "images/products/dates-pack.webp"
    ],
    [
        "snacks",
        "باتيه دومتي بالجبنة الرومي",
        12,
        "🥮",
        "",
        "",
        "images/products/croissant.webp"
    ],
    [
        "sweets",
        "شوكولاتة سبريد كورونا 200 جم",
        55,
        "🍫",
        "",
        "بديل وطني",
        "images/products/corona-spread.webp"
    ],
    [
        "sweets",
        "شوكولاتة ألواح كورونا كلاسيك",
        20,
        "🍫",
        "",
        "",
        "images/products/corona-bar.webp"
    ],
    [
        "sweets",
        "شوكولاتة كورونا بالبندق",
        28,
        "🍫",
        "",
        "",
        "images/products/choc-hazelnut.webp"
    ],
    [
        "sweets",
        "شوكولاتة كورونا كراميل",
        24,
        "🍫",
        "",
        "",
        "images/products/chocolate.webp"
    ],
    [
        "sweets",
        "بار بروتين صحي",
        55,
        "💪",
        "",
        "",
        "images/products/protein-bar.webp"
    ],
    [
        "sweets",
        "مصاصة لولي بوب مصرية",
        5,
        "🍭",
        "",
        "",
        "images/products/sweets-6.webp"
    ],
    [
        "sweets",
        "حلاوة طحينية الرشيدي الميزان 200 جم",
        28,
        "🍯",
        "",
        "",
        "images/products/halawa-tahiniya.webp"
    ],
    [
        "sweets",
        "عسل نحل طبيعي إمتنان 250 جم",
        110,
        "🍯",
        "",
        "",
        "images/products/honey.webp"
    ],
    [
        "sweets",
        "مربى فراولة فيتراك 340 جم",
        30,
        "🍓",
        "",
        "",
        "images/products/strawberries.webp"
    ],
    [
        "study",
        "إندومي نودلز فراخ/لحمة",
        8,
        "🍜",
        "",
        "الأكثر طلبًا",
        "images/indomie-chicken.webp"
    ],
    [
        "study",
        "إندومي (كرتونة 40 كيس)",
        290,
        "🍜",
        "320",
        "خصم",
        "images/indomie-beef-jumbo.webp"
    ],
    [
        "study",
        "نودلز إندومي كوب جاهز",
        18,
        "🍜",
        "",
        "",
        "images/indomie-beef.webp"
    ],
    [
        "study",
        "مكرونة سريعة سوبرمي",
        16,
        "🍝",
        "",
        "",
        "images/supermi-hot-spicy.webp"
    ],
    [
        "study",
        "شوفان سريع التحضير 500 جم",
        35,
        "🥣",
        "",
        "",
        "images/products/oats.webp"
    ],
    [
        "study",
        "فول مدمس هارفست مصري",
        14,
        "🫘",
        "",
        "",
        "images/products/foul.webp"
    ],
    [
        "study",
        "تونة معلبة صن شاين",
        42,
        "🐟",
        "",
        "",
        "images/products/tuna.webp"
    ],
    [
        "study",
        "ثلاثي بروتين (بيض + تونة + توست)",
        95,
        "💪",
        "",
        "",
        "images/products/toast.webp"
    ],
    [
        "pantry",
        "أرز مصري فاخر 1 كجم",
        36,
        "🍚",
        "",
        "الأكثر طلبًا",
        "images/products/rice-egyptian.webp"
    ],
    [
        "pantry",
        "مكرونة الملكة 400 جم",
        13,
        "🍝",
        "",
        "",
        "images/malka-elbow.webp"
    ],
    [
        "pantry",
        "مكرونة سباجيتي الملكة 400 جم",
        14,
        "🍝",
        "",
        "",
        "images/malka-spaghetti.webp"
    ],
    [
        "pantry",
        "سكر أبيض 1 كجم",
        28,
        "🍬",
        "",
        "",
        "images/products/sugar.webp"
    ],
    [
        "pantry",
        "ملح طعام الخير 700 جم",
        8,
        "🧂",
        "",
        "",
        "images/products/el-kheir-salt.webp"
    ],
    [
        "pantry",
        "زيت عباد الشمس 800 مل",
        62,
        "🫒",
        "",
        "",
        "images/products/oil.webp"
    ],
    [
        "pantry",
        "زيت ذرة نقي 800 مل",
        68,
        "🌽",
        "",
        "",
        "images/products/oil.webp"
    ],
    [
        "pantry",
        "سمن بلدي/روابي 500 جم",
        55,
        "🧈",
        "",
        "",
        "images/products/rawabi-ghee.webp"
    ],
    [
        "pantry",
        "دقيق أبيض فاخر 1 كجم",
        20,
        "🌾",
        "",
        "",
        "images/products/flour.webp"
    ],
    [
        "pantry",
        "عدس أصفر مصري 500 جم",
        30,
        "🫘",
        "",
        "",
        "images/products/yellow-lentils.webp"
    ],
    [
        "pantry",
        "فاصوليا بيضاء ناشفة 500 جم",
        40,
        "🫘",
        "",
        "",
        "images/products/white-beans.webp"
    ],
    [
        "pantry",
        "تمر صعيدي فاخر 500 جم",
        60,
        "🌴",
        "",
        "",
        "images/products/dates-pack.webp"
    ],
    [
        "pantry",
        "بهارات مشكلة مصرية",
        10,
        "🌶️",
        "",
        "",
        "images/products/ground-cumin.webp"
    ],
    [
        "pantry",
        "خل أبيض وادي فود",
        12,
        "🍶",
        "",
        "",
        "images/products/drinks-2.webp"
    ],
    [
        "canned",
        "تونة قطع صن شاين 185 جم",
        48,
        "🐟",
        "",
        "الأكثر طلبًا",
        "images/products/tuna.webp"
    ],
    [
        "canned",
        "سردين معلب مغربي",
        22,
        "🐟",
        "",
        "",
        "images/products/tuna.webp"
    ],
    [
        "canned",
        "فول مدمس سادة هارفست",
        14,
        "🫘",
        "",
        "",
        "images/products/foul.webp"
    ],
    [
        "canned",
        "ذرة حلوة معلبة",
        20,
        "🌽",
        "",
        "",
        "images/products/sweet-corn.webp"
    ],
    [
        "canned",
        "صلصة طماطم هارفست 320 جم",
        14,
        "🍅",
        "",
        "",
        "images/products/harvest-sauce.webp"
    ],
    [
        "canned",
        "معجون طماطم مركز",
        12,
        "🍅",
        "",
        "",
        "images/products/tomato-paste.webp"
    ],
    [
        "canned",
        "مايونيز بيتي 300 جم",
        36,
        "🥫",
        "",
        "",
        "images/products/canned-8.webp"
    ],
    [
        "canned",
        "كاتشب بيتي 300 جم",
        26,
        "🍅",
        "",
        "",
        "images/products/canned-9.webp"
    ],
    [
        "canned",
        "مخلل خيار بلدي برطمان",
        30,
        "🥒",
        "",
        "",
        "images/products/pickled-cucumbers.webp"
    ],
    [
        "canned",
        "زيتون أسود مخلل",
        32,
        "🫒",
        "",
        "",
        "images/products/oil.webp"
    ],
    [
        "canned",
        "لانشون بقري معلب حلواني",
        45,
        "🥩",
        "",
        "",
        "images/products/beef-luncheon.webp"
    ],
    [
        "frozen",
        "بطاطس مقلية فارم فريتس 1 كجم",
        65,
        "🍟",
        "",
        "",
        "images/products/potatoes.webp"
    ],
    [
        "frozen",
        "ناجتس دجاج مجمد 400 جم",
        85,
        "🍗",
        "95",
        "خصم",
        "images/products/frozen-10.webp"
    ],
    [
        "frozen",
        "برجر لحم بقري مجمد",
        110,
        "🍔",
        "",
        "",
        "images/products/frozen-10.webp"
    ],
    [
        "frozen",
        "كفتة لحم مجمدة",
        95,
        "🍢",
        "",
        "",
        "images/products/frozen-10.webp"
    ],
    [
        "frozen",
        "بانيه دجاج مقرمش مجمد",
        88,
        "🍗",
        "",
        "",
        "images/products/frozen-10.webp"
    ],
    [
        "frozen",
        "خضار مشكل مجمد بسمة",
        30,
        "🥦",
        "",
        "",
        "images/products/frozen-7.webp"
    ],
    [
        "frozen",
        "بازلاء خضراء مجمدة بسمة",
        28,
        "🟢",
        "",
        "",
        "images/products/frozen-7.webp"
    ],
    [
        "clean",
        "مسحوق غسيل أوكسي أوتوماتيك 1 كجم",
        65,
        "🧺",
        "",
        "بديل وطني",
        "images/products/oxi.webp"
    ],
    [
        "clean",
        "سائل غسيل أطباق وفير 1 لتر",
        28,
        "🫧",
        "",
        "بديل وطني",
        "images/products/wafeer.webp"
    ],
    [
        "clean",
        "منظف ومطهر أرضيات فريدة",
        32,
        "🧹",
        "",
        "",
        "images/products/wafeer.webp"
    ],
    [
        "clean",
        "كلور مصري كلوريل",
        18,
        "🧴",
        "",
        "",
        "images/products/wafeer.webp"
    ],
    [
        "clean",
        "مناديل ورقية علبة فاين/زينة",
        22,
        "🧻",
        "",
        "",
        "images/products/tissues.webp"
    ],
    [
        "clean",
        "رول مناديل مطبخ ماصة",
        30,
        "🧻",
        "",
        "",
        "images/products/toilet-paper.webp"
    ],
    [
        "clean",
        "ورق تواليت مضغوط (6 رولات)",
        55,
        "🧻",
        "",
        "",
        "images/products/toilet-paper.webp"
    ],
    [
        "clean",
        "أكياس قمامة سوداء رول",
        25,
        "🗑️",
        "",
        "",
        "images/products/trash-bags.webp"
    ],
    [
        "clean",
        "اسفنج جلي وتنظيف (3 قطع)",
        12,
        "🧽",
        "",
        "",
        "images/products/cleaning-sponges.webp"
    ],
    [
        "clean",
        "معطر جو فريدة برائحة العود",
        45,
        "🌸",
        "",
        "",
        "images/products/shampoo.webp"
    ],
    [
        "care",
        "شامبو شعر مصري 200 مل",
        55,
        "🧴",
        "",
        "",
        "images/products/shampoo.webp"
    ],
    [
        "care",
        "بلسم مغذي للشعر",
        60,
        "🧴",
        "",
        "",
        "images/products/shampoo.webp"
    ],
    [
        "care",
        "صابون استحمام معطر (سافون)",
        14,
        "🧼",
        "",
        "",
        "images/products/bath-soap.webp"
    ],
    [
        "care",
        "شاور جل منعش للجسم",
        48,
        "🚿",
        "",
        "",
        "images/products/shampoo.webp"
    ],
    [
        "care",
        "معجون أسنان سيجنال مصري",
        35,
        "🪥",
        "",
        "",
        "images/products/toothpaste.webp"
    ],
    [
        "care",
        "فرشاة أسنان ناعمة",
        18,
        "🪥",
        "",
        "",
        "images/products/toothpaste.webp"
    ],
    [
        "care",
        "مزيل عرق رول أون",
        60,
        "🧴",
        "",
        "",
        "images/products/rollon-deodorant.webp"
    ],
    [
        "care",
        "شفرات حلاقة حادة (5 قطع)",
        45,
        "🪒",
        "",
        "",
        "images/products/shaving-razors.webp"
    ],
    [
        "care",
        "كولونيا 555 مصرية أصلية",
        55,
        "🌸",
        "",
        "",
        "images/products/cologne-555.webp"
    ],
    [
        "stationery",
        "كشكول سلك 80 ورقة",
        18,
        "📓",
        "",
        "الأكثر طلبًا",
        "images/products/spiral-notebook.webp"
    ],
    [
        "stationery",
        "دفتر ملاحظات مسطر",
        22,
        "📒",
        "",
        "",
        "images/products/notebook.webp"
    ],
    [
        "stationery",
        "طقم أقلام جاف أزرق (3 أقلام)",
        15,
        "🖊️",
        "",
        "",
        "images/products/blue-pens.webp"
    ],
    [
        "stationery",
        "قلم رصاص + ممحاة",
        10,
        "✏️",
        "",
        "",
        "images/products/pencil-eraser.webp"
    ],
    [
        "stationery",
        "قلم تحديد فسفوري (هايلايتر)",
        12,
        "🖍️",
        "",
        "",
        "images/products/highlighter.webp"
    ],
    [
        "stationery",
        "مسطرة هندسية 30 سم",
        6,
        "📏",
        "",
        "",
        "images/products/plastic-ruler.webp"
    ],
    [
        "stationery",
        "ورق تصوير A4 رزمة 500 ورقة",
        210,
        "📄",
        "",
        "",
        "images/products/a4-paper.webp"
    ],
    [
        "pain",
        "بانادول أزرق مسكن (شريط)",
        18,
        "💊",
        "",
        "الأكثر طلبًا",
        "images/products/panadol-blue.webp"
    ],
    [
        "pain",
        "بانادول إكسترا (شريط)",
        30,
        "💊",
        "",
        "",
        "images/products/panadol-extra.webp"
    ],
    [
        "pain",
        "سيتال باراسيتامول شراب أطفال",
        28,
        "🍼",
        "",
        "",
        "images/products/paracetamol-syrup.webp"
    ],
    [
        "pain",
        "سيتال أقراص مسكن وخافض حرارة",
        15,
        "💊",
        "",
        "",
        "images/products/cetal-tablets.webp"
    ],
    [
        "pain",
        "لصقات حرارية لآلام الظهر",
        45,
        "🩹",
        "",
        "",
        "images/products/pain-patch.webp"
    ],
    [
        "pain",
        "جل مسكن ومضاد للالتهاب موضعياً",
        55,
        "🧴",
        "",
        "",
        "images/products/pain-gel.webp"
    ],
    [
        "cold",
        "أقراص استحلاب مص للحلق",
        35,
        "🍬",
        "",
        "الأكثر طلبًا",
        "images/products/throat-lozenges.webp"
    ],
    [
        "cold",
        "بخاخ ماء بحر للأنف",
        40,
        "👃",
        "",
        "",
        "images/products/nasal-spray.webp"
    ],
    [
        "cold",
        "شراب كحة جوافة بالأعشاب",
        45,
        "🍯",
        "",
        "",
        "images/products/cough-syrup-herbal.webp"
    ],
    [
        "cold",
        "فوار فلوفير للبرد والرشح",
        18,
        "🥤",
        "",
        "",
        "images/products/antacid-sachets.webp"
    ],
    [
        "cold",
        "أقراص كونجستال/كومتركس للبرد",
        30,
        "💊",
        "",
        "",
        "images/products/congestal.webp"
    ],
    [
        "cold",
        "مناديل جيب ورقية ناعمة",
        6,
        "🤧",
        "",
        "",
        "images/products/tissues.webp"
    ],
    [
        "cold",
        "ينسون وشاي رويال مهدئ للحلق",
        24,
        "🍵",
        "",
        "",
        "images/products/green-tea.webp"
    ],
    [
        "stomach",
        "فوار راني/فواكه للمعدة (علبة)",
        18,
        "🫧",
        "",
        "الأكثر طلبًا",
        "images/products/antacid-sachets.webp"
    ],
    [
        "stomach",
        "شراب مضاد للحموضة وحرقة المعدة",
        55,
        "🧪",
        "",
        "",
        "images/products/antacid-liquid.webp"
    ],
    [
        "stomach",
        "أقراص مص مضادة للحموضة",
        25,
        "💊",
        "",
        "",
        "images/products/antacid.webp"
    ],
    [
        "stomach",
        "أملاح هيدروسيف لمعالجة الجفاف",
        15,
        "💧",
        "",
        "",
        "images/products/antacid.webp"
    ],
    [
        "stomach",
        "شاي بابونج ونعناع للهضم",
        26,
        "🍵",
        "",
        "",
        "images/products/green-tea.webp"
    ],
    [
        "stomach",
        "أقراص أوكاربون (فحم هضمي)",
        30,
        "⚫",
        "",
        "",
        "images/products/eucarbon.webp"
    ],
    [
        "vitamins",
        "فيتامين سي فوار مصري 1000 مجم",
        75,
        "🍊",
        "85",
        "خصم",
        "images/products/vitamin-c-tube.webp"
    ],
    [
        "vitamins",
        "مالتي فيتامين يومي أقراص",
        140,
        "💊",
        "",
        "",
        "images/products/vitamin-c.webp"
    ],
    [
        "vitamins",
        "مكمل زنك 50 مجم",
        90,
        "💊",
        "",
        "",
        "images/products/vitamin-c.webp"
    ],
    [
        "vitamins",
        "أوميجا 3 زيت سمك نقي",
        180,
        "🐟",
        "",
        "",
        "images/products/omega-3.webp"
    ],
    [
        "vitamins",
        "فيتامين د3 نقط/كبسولات",
        95,
        "☀️",
        "",
        "",
        "images/products/vitamin-c.webp"
    ],
    [
        "vitamins",
        "مكمل حديد فيروجلوبين مصري",
        85,
        "💊",
        "",
        "",
        "images/products/feroglobin.webp"
    ],
    [
        "vitamins",
        "بار بروتين طاقة للمذاكرة",
        55,
        "💪",
        "",
        "",
        "images/products/protein-bar.webp"
    ],
    [
        "firstaid",
        "بلاستر جروح طبي (20 قطعة)",
        20,
        "🩹",
        "",
        "الأكثر طلبًا",
        "images/products/bandages.webp"
    ],
    [
        "firstaid",
        "شاش قطني طبي معقم",
        12,
        "🩹",
        "",
        "",
        "images/products/medical-gauze.webp"
    ],
    [
        "firstaid",
        "رباط ضاغط مطاطي",
        28,
        "🩹",
        "",
        "",
        "images/products/crepe-bandage.webp"
    ],
    [
        "firstaid",
        "بيتادين مطهر جروح 120 مل",
        35,
        "🧴",
        "",
        "",
        "images/products/betadine.webp"
    ],
    [
        "firstaid",
        "كحول إيثيلي طبي 70% 250 مل",
        22,
        "🧴",
        "",
        "",
        "images/products/medical-alcohol.webp"
    ],
    [
        "firstaid",
        "قطن طبي نقي ممتص",
        15,
        "☁️",
        "",
        "",
        "images/products/bandages.webp"
    ],
    [
        "firstaid",
        "ترمومتر ديجيتال دقيق لقياس الحرارة",
        85,
        "🌡️",
        "",
        "",
        "images/products/thermometer.webp"
    ],
    [
        "firstaid",
        "كمامات طبية وقائية (باكت)",
        40,
        "😷",
        "",
        "",
        "images/products/medical-masks.webp"
    ],
    [
        "firstaid",
        "حقيبة إسعافات أولية متكاملة",
        180,
        "🧰",
        "",
        "",
        "images/products/firstaid-kit.webp"
    ],
    [
        "skin",
        "واقي شمس واسع المدى SPF50",
        160,
        "☀️",
        "",
        "",
        "images/products/sunscreen-spf.webp"
    ],
    [
        "skin",
        "كريم مرطب إيفا/نيفيا للبشرة",
        70,
        "🧴",
        "",
        "",
        "images/products/eva-cream.webp"
    ],
    [
        "skin",
        "كريم مرطب لليدين والأظافر",
        45,
        "🧴",
        "",
        "",
        "images/products/eva-cream.webp"
    ],
    [
        "skin",
        "مرطب شفاه بزبدة الشيا",
        30,
        "💄",
        "",
        "",
        "images/products/lip-balm.webp"
    ],
    [
        "skin",
        "فازلين طبي نقي أصلي",
        25,
        "🫙",
        "",
        "",
        "images/products/vaseline-pure.webp"
    ],
    [
        "skin",
        "زيت شعر طبيعي باللوز والصبار",
        55,
        "🌿",
        "",
        "",
        "images/products/hair-oil.webp"
    ],
    [
        "hygiene",
        "مناديل مبللة ديتول/وايبس",
        25,
        "🧻",
        "",
        "",
        "images/products/tissues.webp"
    ],
    [
        "hygiene",
        "جل معقم ومطهر يدين 100 مل",
        30,
        "🧴",
        "",
        "الأكثر طلبًا",
        "images/products/dish-liquid.webp"
    ],
    [
        "hygiene",
        "أعواد قطنية لتنظيف الأذن",
        12,
        "🧼",
        "",
        "",
        "images/products/bandages.webp"
    ],
    [
        "hygiene",
        "خيط أسنان طبي مشمع",
        30,
        "🦷",
        "",
        "",
        "images/products/dental-floss.webp"
    ],
    [
        "hygiene",
        "غسول ومضمضة منعشة للفم",
        48,
        "🫧",
        "",
        "",
        "images/products/mouthwash.webp"
    ],
    [
        "rice",
        "أرز مصري عريض الحبة 5 كجم",
        170,
        "🍚",
        "185",
        "خصم",
        "images/products/rice-egyptian.webp"
    ],
    [
        "rice",
        "أرز مصري رفيع الحبة 2 كجم",
        72,
        "🍚",
        "",
        "",
        "images/products/rice-egyptian.webp"
    ],
    [
        "rice",
        "أرز بسمتي هندي فاخر 1 كجم",
        85,
        "🍚",
        "",
        "",
        "images/rice-basmati.webp"
    ],
    [
        "rice",
        "مكرونة إيطاليانو قلم 400 جم",
        13,
        "🍝",
        "",
        "الأكثر طلبًا",
        "images/italiano-plus.webp"
    ],
    [
        "rice",
        "مكرونة الملكة كوع 400 جم",
        13,
        "🍝",
        "",
        "",
        "images/malka-elbow.webp"
    ],
    [
        "rice",
        "مكرونة سباجيتي الملكة 400 جم",
        14,
        "🍝",
        "",
        "",
        "images/malka-spaghetti.webp"
    ],
    [
        "rice",
        "شعرية تحمير الملكة 400 جم",
        12,
        "🍜",
        "",
        "",
        "images/products/vermicelli-pasta.webp"
    ],
    [
        "rice",
        "لسان عصفور الملكة 400 جم",
        13,
        "🍚",
        "",
        "",
        "images/products/orzo-pasta.webp"
    ],
    [
        "rice",
        "عدس أصفر مصري مجروش 500 جم",
        30,
        "🫘",
        "",
        "",
        "images/products/yellow-lentils.webp"
    ],
    [
        "rice",
        "عدس بجبة بني للكشري 500 جم",
        32,
        "🫘",
        "",
        "",
        "images/products/yellow-lentils.webp"
    ],
    [
        "rice",
        "فاصوليا بيضاء ناشفة 500 جم",
        40,
        "🫘",
        "",
        "",
        "images/products/white-beans.webp"
    ],
    [
        "rice",
        "لوبيا بلدي 500 جم",
        36,
        "🫘",
        "",
        "",
        "images/products/white-beans.webp"
    ],
    [
        "rice",
        "فول تدميس بلدي 500 جم",
        28,
        "🫘",
        "",
        "",
        "images/products/foul.webp"
    ],
    [
        "rice",
        "حمص شام للكشري 500 جم",
        38,
        "🫘",
        "",
        "",
        "images/products/foul.webp"
    ],
    [
        "rice",
        "شوفان حبوب كاملة 500 جم",
        38,
        "🥣",
        "",
        "",
        "images/products/oats.webp"
    ],
    [
        "rice",
        "ذرة حب للفشار 500 جم",
        24,
        "🍿",
        "",
        "",
        "images/products/sweet-corn.webp"
    ],
    [
        "veg",
        "طماطم بلدي طازجة 1 كجم",
        22,
        "🍅",
        "",
        "",
        "images/products/tomatoes.webp"
    ],
    [
        "veg",
        "بصل أحمر بلدي 1 كجم",
        14,
        "🧅",
        "",
        "",
        "images/products/onions.webp"
    ],
    [
        "veg",
        "ثوم بلدي فاخر 250 جم",
        20,
        "🧄",
        "",
        "",
        "images/products/garlic.webp"
    ],
    [
        "veg",
        "بطاطس تحمير وطبخ 1 كجم",
        20,
        "🥔",
        "",
        "",
        "images/products/potatoes.webp"
    ],
    [
        "veg",
        "خيار بلدي طازج 1 كجم",
        18,
        "🥒",
        "",
        "",
        "images/products/cucumbers.webp"
    ],
    [
        "veg",
        "جزر سكري بلدي 1 كجم",
        16,
        "🥕",
        "",
        "",
        "images/products/carrots.webp"
    ],
    [
        "veg",
        "فلفل رومي أخضر 500 جم",
        20,
        "🫑",
        "",
        "",
        "images/products/bell-peppers.webp"
    ],
    [
        "veg",
        "فلفل ألوان أحمر وأصفر 500 جم",
        35,
        "🫑",
        "",
        "",
        "images/products/bell-peppers.webp"
    ],
    [
        "veg",
        "كوسة خضراء طازجة 1 كجم",
        22,
        "🥒",
        "",
        "",
        "images/products/cucumbers.webp"
    ],
    [
        "veg",
        "باذنجان رومي 1 كجم",
        20,
        "🍆",
        "",
        "",
        "images/products/onions.webp"
    ],
    [
        "veg",
        "جرجير وبقدونس وشبت طازج (ربطة)",
        6,
        "🌿",
        "",
        "",
        "images/products/green-herbs.webp"
    ],
    [
        "veg",
        "ملوخية خضراء بلدي طازجة (ربطة)",
        10,
        "🌿",
        "",
        "",
        "images/products/green-herbs.webp"
    ],
    [
        "veg",
        "ليمون بنزهير أصفر 500 جم",
        18,
        "🍋",
        "",
        "",
        "images/products/lemons.webp"
    ],
    [
        "veg",
        "موز بلدي فاخر 1 كجم",
        35,
        "🍌",
        "",
        "الأكثر طلبًا",
        "images/products/bananas.webp"
    ],
    [
        "veg",
        "تفاح أحمر سكري 1 كجم",
        55,
        "🍎",
        "",
        "",
        "images/products/apples.webp"
    ],
    [
        "veg",
        "برتقال بلدي عصير 1 كجم",
        22,
        "🍊",
        "",
        "",
        "images/products/oranges.webp"
    ],
    [
        "veg",
        "فراولة طازجة 500 جم",
        40,
        "🍓",
        "",
        "",
        "images/products/strawberries.webp"
    ],
    [
        "spices",
        "كمون مطحون ناعم",
        10,
        "🌶️",
        "",
        "",
        "images/products/ground-cumin.webp"
    ],
    [
        "spices",
        "كزبرة جافة مطحونة",
        10,
        "🌿",
        "",
        "",
        "images/products/ground-cumin.webp"
    ],
    [
        "spices",
        "فلفل أسود برازيلي مطحون",
        12,
        "⚫",
        "",
        "",
        "images/products/black-pepper.webp"
    ],
    [
        "spices",
        "شطة حمراء حارة مطحونة",
        12,
        "🌶️",
        "",
        "",
        "images/products/red-paprika.webp"
    ],
    [
        "spices",
        "بابريكا حلوة مطحونة",
        12,
        "🌶️",
        "",
        "",
        "images/products/red-paprika.webp"
    ],
    [
        "spices",
        "كركم وكاري هندي",
        12,
        "🟡",
        "",
        "",
        "images/products/ground-cumin.webp"
    ],
    [
        "spices",
        "قرفة ناعمة عطرية",
        12,
        "🍂",
        "",
        "",
        "images/products/ground-cumin.webp"
    ],
    [
        "spices",
        "بهارات لحمة وفراخ مشكلة",
        12,
        "🧂",
        "",
        "",
        "images/products/ground-cumin.webp"
    ],
    [
        "spices",
        "ورق لورا مجفف",
        8,
        "🍃",
        "",
        "",
        "images/products/green-tea.webp"
    ],
    [
        "spices",
        "مكعبات مرقة دجاج فاين فودز (12)",
        22,
        "🧊",
        "",
        "",
        "images/products/chicken-stock.webp"
    ],
    [
        "spices",
        "مكعبات مرقة لحمة فاين فودز (12)",
        22,
        "🧊",
        "",
        "",
        "images/products/chicken-stock.webp"
    ],
    [
        "spices",
        "ثوم وبصل بودر مخلوط",
        12,
        "🧄",
        "",
        "",
        "images/products/garlic.webp"
    ],
    [
        "baking",
        "دقيق أبيض فاخر للحلويات 1 كجم",
        24,
        "🌾",
        "",
        "",
        "images/products/flour.webp"
    ],
    [
        "baking",
        "خميرة فورية دريم أكياس",
        8,
        "🍞",
        "",
        "",
        "images/products/baking-powder.webp"
    ],
    [
        "baking",
        "بيكنج بودر دريم مصري",
        6,
        "🥄",
        "",
        "",
        "images/products/baking-powder.webp"
    ],
    [
        "baking",
        "فانيليا دريم مصرية",
        6,
        "🍦",
        "",
        "",
        "images/products/baking-powder.webp"
    ],
    [
        "baking",
        "كاكاو بودر خام دريم",
        25,
        "🍫",
        "",
        "",
        "images/products/baking-powder.webp"
    ],
    [
        "baking",
        "نشا ذرة نقي 250 جم",
        12,
        "🥄",
        "",
        "",
        "images/products/flour.webp"
    ],
    [
        "baking",
        "سكر بودرة منخول 500 جم",
        22,
        "🍚",
        "",
        "",
        "images/products/sugar.webp"
    ],
    [
        "baking",
        "لبن بودرة نيدو/جهينة 400 جم",
        85,
        "🥛",
        "",
        "",
        "images/products/flour.webp"
    ],
    [
        "baking",
        "جبنة موتزاريلا دومتي مبشورة 300 جم",
        85,
        "🧀",
        "",
        "",
        "images/products/cheese-triangles.webp"
    ],
    [
        "baking",
        "خلطة بشاميل جاهزة فاين فودز",
        22,
        "🥣",
        "",
        "",
        "images/products/flour.webp"
    ],
    [
        "baking",
        "جيلي فراولة دريم",
        10,
        "🍮",
        "",
        "",
        "images/products/baking-powder.webp"
    ],
    [
        "kitchen",
        "ورق ألومنيوم فويل سميك 10 متر",
        35,
        "🥫",
        "",
        "",
        "images/products/aluminum-foil.webp"
    ],
    [
        "kitchen",
        "ورق زبدة للخبز والفرن",
        25,
        "📄",
        "",
        "",
        "images/products/aluminum-foil.webp"
    ],
    [
        "kitchen",
        "سلوفان استريتش تغليف طعام",
        28,
        "🧻",
        "",
        "",
        "images/products/plastic-wrap.webp"
    ],
    [
        "kitchen",
        "أطباق طعام ورقية (25 طبق)",
        30,
        "🍽️",
        "",
        "",
        "images/products/paper-plates.webp"
    ],
    [
        "kitchen",
        "أكواب ورقية للشاي والقهوة (25 كوب)",
        28,
        "🥤",
        "",
        "",
        "images/products/paper-plates.webp"
    ],
    [
        "kitchen",
        "ملاعق وشوك بلاستيكية بيضاء",
        20,
        "🍴",
        "",
        "",
        "images/products/paper-plates.webp"
    ],
    [
        "kitchen",
        "كبريت مطبخ أمان",
        5,
        "🔥",
        "",
        "",
        "images/products/safety-matches.webp"
    ],
    [
        "kitchen",
        "اسفنج وسلك جلي أواني",
        12,
        "🧽",
        "",
        "",
        "images/products/cleaning-sponges.webp"
    ],
    [
        "kitchen",
        "ثلج مكعبات نقي (كيس)",
        15,
        "🧊",
        "",
        "",
        "images/products/drinks-2.webp"
    ]
];

/* =====================================================================
   صفحة «مع فلسطين» (palestine.html)
   ---------------------------------------------------------------------
   ⚠️ مفيش هنا أي رقم أو تبرع مفترض: الصفحة بتعرض بس اللي انت بتكتبه هنا وهو حقيقي.
   • لتفعيل التعهد: pledge.enabled = true واكتب النسبة والجهة (وابدأ تنفّذ فعلًا).
   • لكل تبرع بتعمله: ضيف سطر في ledger مع صورة الإيصال (اخفِ رقم الحساب من الصورة)،
     وحط الصورة في images/receipts/.
   • ما تستلمش تبرعات من العملاء في الطلب: جمع التبرعات في مصر ليه ترخيص
     (راجع الجهات المختصة)، والأسلم توجّه الناس للقنوات الرسمية زي الهلال الأحمر.
   ===================================================================== */
const PALESTINE = {
    pledge: {
        enabled: false,                       // ← فعّلها لما تلتزم بالتعهد فعلًا
        percent: 0,                           // مثال: 2  (نسبة من أرباح المتجر)
        period: 'كل شهر',
        target: 'الهلال الأحمر المصري'
    },
    ledger: [
        // { date: '2026-10-01', amount: 500, to: 'الهلال الأحمر المصري', receipt: 'images/receipts/2026-10.webp', note: 'دفعة أكتوبر' }
    ],
    donateLinks: [
        { label: 'الهلال الأحمر المصري — صفحة التبرع الرسمية', url: 'https://egyptianrc.org/en/donation' }
    ]
};

/* =====================================================================
   سياسة المقاطعة — منتجات الشركات دي مش بنبيعها ومش بنوصّلها
   ---------------------------------------------------------------------
   • المصدر الأساسي: قائمة اللجنة الوطنية الفلسطينية لحركة المقاطعة BDS (BNC):
     https://bdsmovement.net/Guide-to-BDS-Boycott
   • مفيش قائمة رسمية مصرية موحّدة. الطبقة الثانية والثالثة مأخوذة من قوائم حملات
     المقاطعة الشعبية (Ethical Consumer وحملات PSC) وبتتغير مع الوقت.
   • عايز تقصر القائمة على BNC بس؟ خلّي enabled: false للطبقتين 'wide' و'extended'.
   • أي اسم من الكلمات دي يظهر في اسم منتج بيتشال تلقائيًا، وبيتمنع في «الطلب الخاص» والملاحظات.
   ===================================================================== */
const BOYCOTT = {
    updated: '2026-09-20',
    tiers: [
        {
            id: 'bnc', enabled: true,
            title: 'قائمة حركة المقاطعة BDS الرسمية',
            note: 'الشركات اللي اللجنة الوطنية الفلسطينية (BNC) بتدعو لمقاطعتها، وبتدعم حملات المقاطعة الشعبية ضد بعضها.',
            sources: [{ label: 'BDS Movement — Guide to BDS Boycott', url: 'https://bdsmovement.net/Guide-to-BDS-Boycott' }],
            groups: [
                { name: 'كوكاكولا وعلاماتها',
                  brands: ['كوكاكولا', 'سبرايت', 'فانتا', 'شويبس', 'مينيت ميد', 'كابي', 'باوريد', 'داساني', 'كوستا'],
                  keys: ['كوكاكولا','كوكا كولا','coca cola','coca-cola','cocacola','coke','سبرايت','sprite','فانتا','fanta','شويبس','schweppes','مينيت ميد','مينوت ميد','minute maid','كابي','cappy','باوريد','powerade','داساني','dasani','كوستا','costa coffee','فيوز تي','fuze tea'] },
                { name: 'سودا ستريم (SodaStream)', brands: ['سودا ستريم'], keys: ['سودا ستريم','sodastream','soda stream'] },
                { name: 'تيفا للأدوية (Teva)', brands: ['تيفا (Teva)'], keys: ['تيفا','teva'] },
                { name: 'سلاسل الوجبات السريعة المستهدفة', brands: ['ماكدونالدز','برجر كينج','بابا جونز','بيتزا هت','دومينوز'],
                  keys: ['ماكدونالدز','ماكدونالد','mcdonalds','برجر كينج','burger king','بابا جونز','papa johns','بيتزا هت','pizza hut','دومينوز','dominos'] }
            ]
        },
        {
            id: 'wide', enabled: true,
            title: 'شركات مشمولة في حملات المقاطعة الشعبية الأوسع',
            note: 'مش على قائمة BNC الأساسية، لكن عليها دعوات مقاطعة واسعة من حملات المستهلكين، منها PepsiCo (المالكة لسودا ستريم) ونستله (المساهم المسيطر في أوسم الإسرائيلية).',
            sources: [
                { label: 'Ethical Consumer — Active Consumer Boycotts List', url: 'https://www.ethicalconsumer.org/ethicalcampaigns/boycotts' },
                { label: 'Daily Sabah — تقرير عن ملكية نستله لأوسم', url: 'https://www.dailysabah.com/business/economy/2-years-into-gaza-genocide-global-boycotts-batter-brands-linked-to-israel' }
            ],
            groups: [
                { name: 'بيبسيكو (PepsiCo)',
                  brands: ['بيبسي','ميرندا','سفن أب','ماونتن ديو','تروبيكانا','كويكر','شيبسي','ليز','دوريتوس','شيتوس','جاتوريد','أكوافينا','صبرا'],
                  keys: ['بيبسي','ببسي','pepsi','ميرندا','mirinda','سفن اب','7up','7 up','seven up','ماونتن ديو','mountain dew','تروبيكانا','tropicana','كويكر','quaker','ليز','lays','دوريتوس','doritos','شيتوس','cheetos','شيبسي','chipsy','جاتوريد','gatorade','اكوافينا','aquafina','صبرا','sabra'] },
                { name: 'نستله (Nestlé)',
                  brands: ['نسكافيه','كيت كات','ماجي','نيدو','سيريلاك','لاكتوجين','نسكويك','كوفي ميت','نستي','بيرييه','سان بيليجرينو','بيور لايف','نسبريسو','سمارتيز'],
                  keys: ['نستله','nestle','نسكافيه','نيسكافيه','nescafe','كيت كات','كيتكات','kitkat','kit kat','ماجي','maggi','نيدو','nido','سيريلاك','cerelac','لاكتوجين','lactogen','نسكويك','nesquik','كوفي ميت','coffee mate','coffeemate','نستي','nestea','بيرييه','perrier','سان بيليجرينو','san pellegrino','بيور لايف','pure life','نسبريسو','nespresso','سمارتيز','smarties'] }
            ]
        },
        {
            id: 'extended', enabled: true,
            title: 'شركات أخرى واردة في قوائم المقاطعة الشعبية',
            note: 'شركات عالمية كبيرة واردة في قوائم بعض حملات المقاطعة (مش من قائمة BNC الأساسية). لو عايز تقتصر على القوائم الأضيق، اقفل الطبقة دي.',
            sources: [{ label: 'حملة PSC (West Surrey) — قائمة المقاطعة', url: 'https://www.westsurreypsc.org/boycott.html' }],
            groups: [
                { name: 'يونيليفر (Unilever)',
                  brands: ['كنور','لايف بوي','ريكسونا','صانسيلك','أومو','كومفورت','دومستوس','فازلين','هيلمانز','ماجنوم','ألجيدا','كورنيتو'],
                  keys: ['يونيليفر','unilever','كنور','knorr','لايف بوي','lifebuoy','ريكسونا','rexona','صانسيلك','sunsilk','اومو','omo','كومفورت','comfort','دومستوس','domestos','فازلين','vaseline','هيلمانز','hellmanns','ماجنوم','magnum','الجيدا','algida','كورنيتو','cornetto'] },
                { name: 'بروكتر آند جامبل (P&G)',
                  brands: ['أريال','تايد','فيري','بامبرز','أولويز','جيليت','هيد آند شولدرز','بانتين','أورال بي','أولاي','فيكس','داوني'],
                  keys: ['بروكتر','procter','اريال','ariel','تايد','tide','فيري','fairy','بامبرز','pampers','اولويز','always','جيليت','gillette','هيد اند شولدرز','head shoulders','بانتين','pantene','اورال بي','oral b','اولاي','olay','فيكس','vicks','داوني','downy'] },
                { name: 'دانون (Danone)',
                  brands: ['أكتيفيا','دانيت','أكتيميل','إيفيان','فولفيك','دانب'],
                  keys: ['دانون','danone','اكتيفيا','activia','دانيت','danette','اكتيميل','actimel','ايفيان','evian','فولفيك','volvic','دانب','danup'] },
                { name: 'مونديليز (Mondelez)',
                  brands: ['أوريو','كادبوري','ميلكا','توبلرون','تاك','هولز','تانج'],
                  keys: ['مونديليز','mondelez','اوريو','oreo','كادبوري','cadbury','ميلكا','milka','توبلرون','toblerone','tuc','هولز','halls','تانج','tang'] },
                { name: 'مارس (Mars)',
                  brands: ['سنيكرز','تويكس','باونتي','ميلكي واي','مالتيسرز'],
                  keys: ['mars','سنيكرز','snickers','تويكس','twix','باونتي','bounty','ميلكي واي','milky way','مالتيسرز','maltesers'] }
            ]
        }
    ]
};

const _bn = s => String(s).toLowerCase().replace(/['’`]/g, '').replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
const _bt = s => _bn(s).split(/[^a-z0-9\u0600-\u06FF]+/).filter(Boolean);
const _BPFX = ['', 'ال', 'و', 'ب', 'ل', 'بال', 'وال', 'لل'];
let _bIndex = null;
/* بترجّع {group, tier, key} لو النص فيه اسم علامة مقاطعة، وإلا null */
function boycottMatch(text) {
    if (!_bIndex) {
        _bIndex = [];
        BOYCOTT.tiers.filter(t => t.enabled).forEach(t => t.groups.forEach(g => g.keys.forEach(k => {
            const kt = _bt(k); if (kt.length) _bIndex.push({ kt, group: g.name, tier: t.id, key: k });
        })));
    }
    const toks = _bt(text);
    if (!toks.length) return null;
    const same = (a, b, first) => (first ? _BPFX : ['']).some(p => a === p + b);
    return _bIndex.find(e => {
        for (let i = 0; i + e.kt.length <= toks.length; i++) {
            if (e.kt.every((k, j) => same(toks[i + j], k, j === 0))) return true;
        }
        return false;
    }) || null;
}

let PRODUCTS = (() => {
    const counters = {};
    return RAW.map(([cat, name, price, emoji, oldPrice, badge, img]) => {
        counters[cat] = (counters[cat] || 0) + 1;         // الأكواد ثابتة حتى لو منتج اتشال
        if (name === null) return null;                    // محذوف
        const p = { id: cat + '-' + counters[cat], cat, name, price, emoji };
        if (oldPrice) p.oldPrice = Number(oldPrice);
        if (badge) p.badge = badge;
        if (img) p.img = img;
        return p;
    }).filter(p => p && !boycottMatch(p.name));           // شبكة أمان: أي منتج باسم علامة مقاطعة بيتشال
})();

// Menu names below were found on a public listing that names the Al-Azhar University / Sixth District branch.
// The listing is marked temporarily closed and its listed prices are stale, so these previews must stay
// unavailable for ordering until an admin confirms today's price in the Portal.
const ONLINE_MENU_PREVIEWS = [
    ['koshary-mini', 'علبة كشري ميني', '🍲', 'images/stores/koshary.webp'],
    ['koshary-small', 'علبة كشري صغيرة', '🍲', 'images/stores/koshary.webp'],
    ['koshary-medium', 'علبة كشري وسط', '🍲', 'images/stores/koshary.webp'],
    ['koshary-family', 'علبة كشري عائلية', '🍲', 'images/stores/koshary.webp'],
    ['koshary-large', 'علبة كشري كبيرة', '🍲', 'images/stores/koshary.webp'],
    ['koshary-mega', 'علبة كشري ميجا', '🍲', 'images/stores/koshary.webp'],
    ['koshary-jumbo', 'علبة كشري جامبو', '🍲', 'images/stores/koshary.webp'],
    ['koshary-salad', 'سلطة خضراء', '🥗', ''],
    ['koshary-taqliya', 'تقلية', '🧅', ''],
    ['koshary-hummus', 'حمص', '🫘', ''],
    ['koshary-lentils', 'عدس', '🫘', ''],
    ['koshary-sauce', 'صلصة', '🍅', ''],
    ['koshary-hot-sauce', 'شطة', '🌶️', ''],
    ['koshary-toast', 'عيش محمص', '🍞', ''],
    ['koshary-meat-casserole', 'طاجن لحمة', '🥘', ''],
    ['koshary-liver-casserole', 'طاجن كبدة', '🥘', ''],
    ['koshary-chicken-casserole', 'طاجن فراخ', '🥘', ''],
    ['koshary-plain-casserole', 'طاجن سادة', '🥘', ''],
    ['koshary-mix-meat', 'طاجن ميكس لحوم', '🥘', ''],
    ['koshary-mix-liver', 'طاجن ميكس كبدة', '🥘', ''],
    ['koshary-mix-chicken', 'طاجن ميكس فراخ', '🥘', ''],
    ['koshary-rice-pudding', 'أرز باللبن', '🍮', ''],
    ['koshary-mahalabia', 'مهلبية', '🍮', ''],
    ['koshary-jelly', 'جيلي', '🍮', ''],
    ['koshary-creme-caramel', 'كريم كراميل', '🍮', ''],
    ['koshary-water-small', 'مياه معدنية صغيرة', '💧', ''],
    ['koshary-water', 'مياه معدنية', '💧', ''],
    ['koshary-soda', 'مشروبات غازية كانز', '🥤', '']
].map(([id, name, emoji, img]) => ({
    id: `online-${id}`, cat: 'koshary-menu', name, price: 0, emoji,
    ...(img ? {img} : {}), storeId: 'koshary-hind', comingSoon: true
}));
PRODUCTS = [...PRODUCTS, ...ONLINE_MENU_PREVIEWS];

// Expose only public storefront data to the customer and admin portal scripts.
window.CATEGORIES = CATEGORIES;
window.STORE_DIRECTORY = STORE_DIRECTORY;
window.ACDLocalProducts = PRODUCTS;

/* لإضافة صورة حقيقية لمنتج: p.img = 'images/اسم-الملف.webp' (اختياري — لو مفيش صورة بيظهر الإيموجي) */
