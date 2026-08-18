/**
 * UI copy in the three languages the shop serves.
 *
 * Flat dotted keys rather than nested objects: with three dictionaries to keep
 * in sync, a flat shape makes a missing key a compile error you can see, and
 * makes any string greppable back to where it renders.
 *
 * French is the source of truth — `ar` and `en` are typed as Record<Key,string>
 * so TypeScript refuses to build if either falls behind.
 *
 * `{x}` placeholders are substituted by `t()`.
 */
import {
  adminAr,
  adminEn,
  adminFr,
  type AdminTranslationKey,
} from "./admin-dictionaries";

export const fr = {
  // Language names, shown in their own language in the switcher.
  "lang.fr": "Français",
  "lang.ar": "العربية",
  "lang.en": "English",
  "lang.label": "Langue",

  // Navigation and chrome
  "nav.shop": "Boutique",
  "nav.all": "Tout",
  "nav.allShop": "Toute la boutique",
  "nav.menu": "Menu",
  "nav.openMenu": "Ouvrir le menu",
  "nav.closeMenu": "Fermer le menu",
  "nav.search": "Rechercher",
  "nav.searchPlaceholder": "Rechercher un produit…",
  "nav.closeSearch": "Fermer la recherche",
  "nav.noResults": "Aucun résultat pour « {term} ».",
  "nav.cart": "Panier",
  "nav.cartAria": "Panier, {n} article|Panier, {n} articles",
  "nav.theme": "Thème",
  "nav.themeToggle": "Changer de thème",
  "nav.home": "Contessa — accueil",

  // Hero
  "hero.subtitle":
    "Maquillage et prêt-à-porter féminin, choisis pièce par pièce. Livraison partout en Algérie, réglée à la réception.",
  "hero.cta": "Découvrir la boutique",
  "hero.tagline": "Beauté & Élégance",

  // Home page
  "home.collections": "Collections",
  "home.exploreHouse": "Explorer la maison",
  "home.discover": "Découvrir",
  "home.selection": "Sélection",
  "home.favourites": "Nos coups de cœur",
  "home.seeAll": "Tout voir",
  "home.comingSoon": "La collection arrive bientôt",
  "home.comingSoonBody":
    "Les premières pièces seront publiées très prochainement.",
  "home.assurance1Title": "Livraison 58 wilayas",
  "home.assurance1Body":
    "À domicile ou au bureau de livraison, partout dans le pays.",
  "home.assurance2Title": "Paiement à la livraison",
  "home.assurance2Body":
    "Vous réglez votre commande une fois le colis entre vos mains.",
  "home.assurance3Title": "Sélection soignée",
  "home.assurance3Body":
    "Chaque pièce est choisie et vérifiée avant d'entrer en boutique.",

  // Shop listing
  "shop.title": "La boutique",
  "shop.brand": "Contessa",
  "shop.count": "{n} article|{n} articles",
  "shop.sortBy": "Trier par",
  "shop.sortNew": "Nouveautés",
  "shop.sortPriceAsc": "Prix croissant",
  "shop.sortPriceDesc": "Prix décroissant",
  "shop.emptyTitle": "Rien ici pour l'instant",
  "shop.emptyBody": "Cette collection sera bientôt garnie.",
  "shop.seeAllItems": "Voir tous les articles",

  // Product card / detail
  "product.soldOut": "Épuisé",
  "product.back": "Boutique",
  "product.size": "Taille",
  "product.colour": "Couleur",
  "product.quantity": "Quantité",
  "product.addToCart": "Ajouter au panier",
  "product.buyNow": "Commander maintenant",
  "product.onlyLeft": "Plus que {n} en stock",
  "product.deliveryNote":
    "Livraison à domicile ou au bureau, dans toutes les wilayas.",
  "product.codNote": "Paiement à la livraison — vous réglez à la réception.",
  "product.related": "À découvrir",
  "product.relatedTitle": "Dans le même esprit",
  "product.notFound": "Article introuvable",
  "product.notFoundBody":
    "Cette pièce n'est plus disponible ou a été retirée.",
  "product.backToShop": "Retour à la boutique",
  "product.photo": "Photo {n}",
  "product.chooseSize": "Choisissez une taille.",
  "product.chooseColour": "Choisissez une couleur.",
  "product.added": "Ajouté à votre panier",
  "product.discount": "Remise",
  "product.previousPhoto": "Photo précédente",
  "product.nextPhoto": "Photo suivante",
  "product.zoom": "Agrandir la photo",

  // Quick order (straight from the product page)
  "quick.title": "Commander directement",
  "quick.subtitle":
    "Remplissez ce formulaire et nous vous appelons pour confirmer. Pas besoin de passer par le panier.",
  "quick.open": "Commander maintenant",
  "quick.close": "Fermer",
  "quick.itemLine": "{name} × {n}",

  // Cart
  "cart.title": "Panier",
  "cart.eyebrow": "Votre sélection",
  "cart.emptyTitle": "Votre panier est vide",
  "cart.emptyBody": "Parcourez la boutique et ajoutez vos pièces préférées.",
  "cart.subtotalLine": "Sous-total ({n} article)|Sous-total ({n} articles)",
  "cart.deliveryLater":
    "Les frais de livraison sont calculés à l'étape suivante, selon votre wilaya.",
  "cart.checkout": "Passer la commande",
  "cart.continue": "Continuer mes achats",
  "cart.remove": "Retirer {name}",
  "cart.decrease": "Diminuer",
  "cart.increase": "Augmenter",

  // Checkout
  "checkout.eyebrow": "Dernière étape",
  "checkout.title": "Commander",
  "checkout.yourDetails": "Vos coordonnées",
  "checkout.fullName": "Nom complet",
  "checkout.namePlaceholder": "Amina Benali",
  "checkout.phone": "Téléphone",
  "checkout.phoneHint": "Format : 0551234567",
  "checkout.delivery": "Livraison",
  "checkout.wilaya": "Wilaya",
  "checkout.wilayaPlaceholder": "Choisissez votre wilaya…",
  "checkout.deliveryMode": "Mode de livraison",
  "checkout.home": "À domicile",
  "checkout.homeBody": "Le livreur vous apporte le colis à votre adresse.",
  "checkout.desk": "Au bureau",
  "checkout.deskBody": "Vous récupérez le colis au bureau de livraison.",
  "checkout.unavailableHere": "Non disponible dans cette wilaya",
  "checkout.commune": "Commune",
  "checkout.communePlaceholder": "Bab Ezzouar",
  "checkout.address": "Adresse complète",
  "checkout.addressPlaceholder": "Cité 5 Juillet, Bât. 12, Apt. 3",
  "checkout.note": "Note (facultatif)",
  "checkout.notePlaceholder": "Une précision pour le livreur…",
  "checkout.yourOrder": "Votre commande",
  "checkout.subtotal": "Sous-total",
  "checkout.deliveryFee": "Livraison",
  "checkout.free": "Offerte",
  "checkout.total": "Total",
  "checkout.freeAway": "Plus que {amount} pour la livraison offerte.",
  "checkout.confirm": "Confirmer la commande",
  "checkout.sending": "Envoi…",
  "checkout.codReassurance":
    "Paiement à la livraison. Vous ne payez rien maintenant — nous vous appelons pour confirmer.",
  "checkout.chooseWilaya": "Choisissez votre wilaya.",

  // Order confirmation
  "order.thanks": "Merci {name}",
  "order.recorded":
    "Votre commande est enregistrée. Nous vous appelons très vite au {phone} pour la confirmer.",
  "order.reference": "Commande {ref}",
  "order.summary": "Récapitulatif",
  "order.keepRef":
    "Gardez le numéro {ref} — il nous permet de retrouver votre commande.",
  "order.notFound": "Commande introuvable",
  "order.notFoundBody":
    "Vérifiez le lien, ou contactez-nous avec votre numéro de commande.",
  "order.continue": "Continuer mes achats",

  // Footer
  "footer.about":
    "Maquillage et vêtements choisis pour celles qui aiment le détail. Livraison vers toutes les wilayas, paiement à la livraison.",
  "footer.shop": "Boutique",
  "footer.seeAll": "Tout voir",
  "footer.contact": "Contact",
  "footer.deliveryLine": "Livraison à domicile ou au bureau",
  "footer.codLine": "Paiement à la livraison",

  // Misc
  "store.closed":
    "La boutique est momentanément fermée. Vous pouvez parcourir le catalogue, les commandes rouvriront bientôt.",
  "error.generic": "Une erreur est survenue.",
  "notFound.eyebrow": "Erreur 404",
  "notFound.title": "Page introuvable",
  "notFound.body": "Cette page n'existe pas ou a été déplacée.",
  "notFound.cta": "Retour à l'accueil",
} as const;

export type TranslationKey = keyof typeof fr;

export const ar: Record<TranslationKey, string> = {
  "lang.fr": "Français",
  "lang.ar": "العربية",
  "lang.en": "English",
  "lang.label": "اللغة",

  "nav.shop": "المتجر",
  "nav.all": "الكل",
  "nav.allShop": "كل المتجر",
  "nav.menu": "القائمة",
  "nav.openMenu": "فتح القائمة",
  "nav.closeMenu": "إغلاق القائمة",
  "nav.search": "بحث",
  "nav.searchPlaceholder": "ابحث عن منتج…",
  "nav.closeSearch": "إغلاق البحث",
  "nav.noResults": "لا توجد نتائج لـ «{term}».",
  "nav.cart": "السلة",
  "nav.cartAria": "السلة، {n} منتج",
  "nav.theme": "المظهر",
  "nav.themeToggle": "تغيير المظهر",
  "nav.home": "كونتيسا — الصفحة الرئيسية",

  "hero.subtitle":
    "مكياج وأزياء نسائية مختارة قطعة بقطعة. التوصيل إلى كل ولايات الجزائر، والدفع عند الاستلام.",
  "hero.cta": "تسوّقي الآن",
  "hero.tagline": "جمال وأناقة",

  "home.collections": "المجموعات",
  "home.exploreHouse": "استكشفي المجموعات",
  "home.discover": "اكتشفي",
  "home.selection": "مختارات",
  "home.favourites": "الأكثر تميّزاً",
  "home.seeAll": "عرض الكل",
  "home.comingSoon": "المجموعة قادمة قريباً",
  "home.comingSoonBody": "سيتم نشر القطع الأولى في وقت قريب جداً.",
  "home.assurance1Title": "التوصيل إلى 58 ولاية",
  "home.assurance1Body": "إلى المنزل أو إلى مكتب التوصيل، في كل أنحاء الوطن.",
  "home.assurance2Title": "الدفع عند الاستلام",
  "home.assurance2Body": "تدفعين قيمة طلبك عند وصول الطرد إلى يديك.",
  "home.assurance3Title": "اختيار بعناية",
  "home.assurance3Body": "كل قطعة مُنتقاة ومفحوصة قبل دخولها المتجر.",

  "shop.title": "المتجر",
  "shop.brand": "كونتيسا",
  "shop.count": "{n} منتج",
  "shop.sortBy": "ترتيب حسب",
  "shop.sortNew": "الأحدث",
  "shop.sortPriceAsc": "الأقل سعراً",
  "shop.sortPriceDesc": "الأعلى سعراً",
  "shop.emptyTitle": "لا يوجد شيء هنا حالياً",
  "shop.emptyBody": "سيتم إثراء هذه المجموعة قريباً.",
  "shop.seeAllItems": "عرض كل المنتجات",

  "product.soldOut": "نفدت الكمية",
  "product.back": "المتجر",
  "product.size": "المقاس",
  "product.colour": "اللون",
  "product.quantity": "الكمية",
  "product.addToCart": "أضيفي إلى السلة",
  "product.buyNow": "اطلبي الآن",
  "product.onlyLeft": "بقيت {n} قطعة فقط",
  "product.deliveryNote": "التوصيل إلى المنزل أو المكتب، في كل الولايات.",
  "product.codNote": "الدفع عند الاستلام — تدفعين عند وصول الطرد.",
  "product.related": "اكتشفي أيضاً",
  "product.relatedTitle": "بنفس الأسلوب",
  "product.notFound": "المنتج غير موجود",
  "product.notFoundBody": "هذه القطعة لم تعد متوفرة أو تم حذفها.",
  "product.backToShop": "العودة إلى المتجر",
  "product.photo": "صورة {n}",
  "product.chooseSize": "اختاري المقاس.",
  "product.chooseColour": "اختاري اللون.",
  "product.added": "تمت الإضافة إلى سلتك",
  "product.discount": "تخفيض",
  "product.previousPhoto": "الصورة السابقة",
  "product.nextPhoto": "الصورة التالية",
  "product.zoom": "تكبير الصورة",

  "quick.title": "اطلبي مباشرة",
  "quick.subtitle":
    "املئي هذه الاستمارة وسنتصل بك للتأكيد. لا حاجة للمرور عبر السلة.",
  "quick.open": "اطلبي الآن",
  "quick.close": "إغلاق",
  "quick.itemLine": "{name} × {n}",

  "cart.title": "السلة",
  "cart.eyebrow": "اختياراتك",
  "cart.emptyTitle": "سلتك فارغة",
  "cart.emptyBody": "تصفّحي المتجر وأضيفي قطعك المفضلة.",
  "cart.subtotalLine": "المجموع الفرعي ({n} منتج)",
  "cart.deliveryLater": "تُحسب مصاريف التوصيل في الخطوة التالية حسب ولايتك.",
  "cart.checkout": "إتمام الطلب",
  "cart.continue": "متابعة التسوّق",
  "cart.remove": "حذف {name}",
  "cart.decrease": "تقليل",
  "cart.increase": "زيادة",

  "checkout.eyebrow": "الخطوة الأخيرة",
  "checkout.title": "إتمام الطلب",
  "checkout.yourDetails": "معلوماتك",
  "checkout.fullName": "الاسم الكامل",
  "checkout.namePlaceholder": "أمينة بن علي",
  "checkout.phone": "الهاتف",
  "checkout.phoneHint": "الصيغة: 0551234567",
  "checkout.delivery": "التوصيل",
  "checkout.wilaya": "الولاية",
  "checkout.wilayaPlaceholder": "اختاري ولايتك…",
  "checkout.deliveryMode": "طريقة التوصيل",
  "checkout.home": "إلى المنزل",
  "checkout.homeBody": "يوصل لك عامل التوصيل الطرد إلى عنوانك.",
  "checkout.desk": "إلى المكتب",
  "checkout.deskBody": "تستلمين الطرد من مكتب التوصيل.",
  "checkout.unavailableHere": "غير متوفر في هذه الولاية",
  "checkout.commune": "البلدية",
  "checkout.communePlaceholder": "باب الزوار",
  "checkout.address": "العنوان الكامل",
  "checkout.addressPlaceholder": "حي 5 جويلية، عمارة 12، شقة 3",
  "checkout.note": "ملاحظة (اختياري)",
  "checkout.notePlaceholder": "تفصيل إضافي لعامل التوصيل…",
  "checkout.yourOrder": "طلبك",
  "checkout.subtotal": "المجموع الفرعي",
  "checkout.deliveryFee": "التوصيل",
  "checkout.free": "مجاني",
  "checkout.total": "المجموع",
  "checkout.freeAway": "بقي {amount} للحصول على توصيل مجاني.",
  "checkout.confirm": "تأكيد الطلب",
  "checkout.sending": "جارٍ الإرسال…",
  "checkout.codReassurance":
    "الدفع عند الاستلام. لن تدفعي شيئاً الآن — سنتصل بك للتأكيد.",
  "checkout.chooseWilaya": "اختاري ولايتك.",

  "order.thanks": "شكراً {name}",
  "order.recorded":
    "تم تسجيل طلبك. سنتصل بك قريباً على الرقم {phone} للتأكيد.",
  "order.reference": "الطلب {ref}",
  "order.summary": "ملخّص الطلب",
  "order.keepRef": "احفظي الرقم {ref} — فهو يساعدنا في العثور على طلبك.",
  "order.notFound": "الطلب غير موجود",
  "order.notFoundBody": "تحققي من الرابط، أو اتصلي بنا مع رقم طلبك.",
  "order.continue": "متابعة التسوّق",

  "footer.about":
    "مكياج وملابس مختارة لمن تهتم بالتفاصيل. التوصيل إلى كل الولايات، والدفع عند الاستلام.",
  "footer.shop": "المتجر",
  "footer.seeAll": "عرض الكل",
  "footer.contact": "اتصلي بنا",
  "footer.deliveryLine": "التوصيل إلى المنزل أو المكتب",
  "footer.codLine": "الدفع عند الاستلام",

  "store.closed":
    "المتجر مغلق مؤقتاً. يمكنك تصفّح المنتجات، وستُفتح الطلبات قريباً.",
  "error.generic": "حدث خطأ ما.",
  "notFound.eyebrow": "خطأ 404",
  "notFound.title": "الصفحة غير موجودة",
  "notFound.body": "هذه الصفحة غير موجودة أو تم نقلها.",
  "notFound.cta": "العودة إلى الرئيسية",
};

export const en: Record<TranslationKey, string> = {
  "lang.fr": "Français",
  "lang.ar": "العربية",
  "lang.en": "English",
  "lang.label": "Language",

  "nav.shop": "Shop",
  "nav.all": "All",
  "nav.allShop": "The whole shop",
  "nav.menu": "Menu",
  "nav.openMenu": "Open menu",
  "nav.closeMenu": "Close menu",
  "nav.search": "Search",
  "nav.searchPlaceholder": "Search for a product…",
  "nav.closeSearch": "Close search",
  "nav.noResults": "No results for “{term}”.",
  "nav.cart": "Bag",
  "nav.cartAria": "Bag, {n} item|Bag, {n} items",
  "nav.theme": "Theme",
  "nav.themeToggle": "Switch theme",
  "nav.home": "Contessa — home",

  "hero.subtitle":
    "Women's makeup and ready-to-wear, chosen piece by piece. Delivered anywhere in Algeria, paid on arrival.",
  "hero.cta": "Explore the shop",
  "hero.tagline": "Beauty & Elegance",

  "home.collections": "Collections",
  "home.exploreHouse": "Explore the house",
  "home.discover": "Discover",
  "home.selection": "Selection",
  "home.favourites": "Our favourites",
  "home.seeAll": "See all",
  "home.comingSoon": "The collection is on its way",
  "home.comingSoonBody": "The first pieces will be published very soon.",
  "home.assurance1Title": "58 wilayas covered",
  "home.assurance1Body":
    "To your door or to the delivery desk, anywhere in the country.",
  "home.assurance2Title": "Pay on delivery",
  "home.assurance2Body": "You settle up once the parcel is in your hands.",
  "home.assurance3Title": "Carefully chosen",
  "home.assurance3Body":
    "Every piece is selected and checked before it reaches the shop.",

  "shop.title": "The shop",
  "shop.brand": "Contessa",
  "shop.count": "{n} item|{n} items",
  "shop.sortBy": "Sort by",
  "shop.sortNew": "Newest",
  "shop.sortPriceAsc": "Price: low to high",
  "shop.sortPriceDesc": "Price: high to low",
  "shop.emptyTitle": "Nothing here yet",
  "shop.emptyBody": "This collection will be filled soon.",
  "shop.seeAllItems": "See all items",

  "product.soldOut": "Sold out",
  "product.back": "Shop",
  "product.size": "Size",
  "product.colour": "Colour",
  "product.quantity": "Quantity",
  "product.addToCart": "Add to bag",
  "product.buyNow": "Order now",
  "product.onlyLeft": "Only {n} left in stock",
  "product.deliveryNote": "Delivery to your door or desk, in every wilaya.",
  "product.codNote": "Pay on delivery — you settle up when it arrives.",
  "product.related": "Also worth a look",
  "product.relatedTitle": "In the same spirit",
  "product.notFound": "Product not found",
  "product.notFoundBody":
    "This piece is no longer available or has been removed.",
  "product.backToShop": "Back to the shop",
  "product.photo": "Photo {n}",
  "product.chooseSize": "Please choose a size.",
  "product.chooseColour": "Please choose a colour.",
  "product.added": "Added to your bag",
  "product.discount": "Off",
  "product.previousPhoto": "Previous photo",
  "product.nextPhoto": "Next photo",
  "product.zoom": "Zoom in",

  "quick.title": "Order directly",
  "quick.subtitle":
    "Fill this in and we'll call you to confirm. No need to go through the bag.",
  "quick.open": "Order now",
  "quick.close": "Close",
  "quick.itemLine": "{name} × {n}",

  "cart.title": "Bag",
  "cart.eyebrow": "Your selection",
  "cart.emptyTitle": "Your bag is empty",
  "cart.emptyBody": "Browse the shop and add your favourite pieces.",
  "cart.subtotalLine": "Subtotal ({n} item)|Subtotal ({n} items)",
  "cart.deliveryLater":
    "Delivery is calculated at the next step, based on your wilaya.",
  "cart.checkout": "Place the order",
  "cart.continue": "Keep shopping",
  "cart.remove": "Remove {name}",
  "cart.decrease": "Decrease",
  "cart.increase": "Increase",

  "checkout.eyebrow": "Last step",
  "checkout.title": "Checkout",
  "checkout.yourDetails": "Your details",
  "checkout.fullName": "Full name",
  "checkout.namePlaceholder": "Amina Benali",
  "checkout.phone": "Phone",
  "checkout.phoneHint": "Format: 0551234567",
  "checkout.delivery": "Delivery",
  "checkout.wilaya": "Wilaya",
  "checkout.wilayaPlaceholder": "Choose your wilaya…",
  "checkout.deliveryMode": "Delivery method",
  "checkout.home": "To my door",
  "checkout.homeBody": "The courier brings the parcel to your address.",
  "checkout.desk": "To the desk",
  "checkout.deskBody": "You collect the parcel from the delivery desk.",
  "checkout.unavailableHere": "Not available in this wilaya",
  "checkout.commune": "Commune",
  "checkout.communePlaceholder": "Bab Ezzouar",
  "checkout.address": "Full address",
  "checkout.addressPlaceholder": "Cité 5 Juillet, Bldg 12, Apt 3",
  "checkout.note": "Note (optional)",
  "checkout.notePlaceholder": "Anything the courier should know…",
  "checkout.yourOrder": "Your order",
  "checkout.subtotal": "Subtotal",
  "checkout.deliveryFee": "Delivery",
  "checkout.free": "Free",
  "checkout.total": "Total",
  "checkout.freeAway": "{amount} more for free delivery.",
  "checkout.confirm": "Confirm the order",
  "checkout.sending": "Sending…",
  "checkout.codReassurance":
    "Pay on delivery. You pay nothing now — we'll call you to confirm.",
  "checkout.chooseWilaya": "Please choose your wilaya.",

  "order.thanks": "Thank you {name}",
  "order.recorded":
    "Your order is recorded. We'll call you shortly on {phone} to confirm.",
  "order.reference": "Order {ref}",
  "order.summary": "Summary",
  "order.keepRef": "Keep the number {ref} — it lets us find your order.",
  "order.notFound": "Order not found",
  "order.notFoundBody":
    "Check the link, or contact us with your order number.",
  "order.continue": "Keep shopping",

  "footer.about":
    "Makeup and clothing chosen for those who love the detail. Delivered to every wilaya, paid on arrival.",
  "footer.shop": "Shop",
  "footer.seeAll": "See all",
  "footer.contact": "Contact",
  "footer.deliveryLine": "Delivery to your door or desk",
  "footer.codLine": "Pay on delivery",

  "store.closed":
    "The shop is closed for the moment. You can still browse — orders will reopen soon.",
  "error.generic": "Something went wrong.",
  "notFound.eyebrow": "Error 404",
  "notFound.title": "Page not found",
  "notFound.body": "This page doesn't exist or has been moved.",
  "notFound.cta": "Back to home",
};

export const LOCALES = ["fr", "ar", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * Storefront and dashboard copy in one lookup, so `t()` works the same on both
 * sides. They live in separate files only because a single one got unwieldy.
 */
export type AnyTranslationKey = TranslationKey | AdminTranslationKey;

export const DICTIONARIES: Record<Locale, Record<AnyTranslationKey, string>> = {
  fr: { ...fr, ...adminFr },
  ar: { ...ar, ...adminAr },
  en: { ...en, ...adminEn },
};

/** Arabic is the only right-to-left language here. */
export const RTL_LOCALES: Locale[] = ["ar"];

/** Short labels for the switcher chip. */
export const LOCALE_SHORT: Record<Locale, string> = {
  fr: "FR",
  ar: "ع",
  en: "EN",
};
