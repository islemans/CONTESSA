/**
 * The 58 official wilayas of Algeria (the 48 historic ones plus the 10 created
 * in 2019). This is only the seed — the `wilayas` table is the source of truth
 * and is fully editable from the dashboard.
 *
 * Tuple shape: [code, latin name, arabic name]
 */
export const ALGERIA_WILAYAS: [number, string, string][] = [
  [1, "Adrar", "أدرار"],
  [2, "Chlef", "الشلف"],
  [3, "Laghouat", "الأغواط"],
  [4, "Oum El Bouaghi", "أم البواقي"],
  [5, "Batna", "باتنة"],
  [6, "Béjaïa", "بجاية"],
  [7, "Biskra", "بسكرة"],
  [8, "Béchar", "بشار"],
  [9, "Blida", "البليدة"],
  [10, "Bouira", "البويرة"],
  [11, "Tamanrasset", "تمنراست"],
  [12, "Tébessa", "تبسة"],
  [13, "Tlemcen", "تلمسان"],
  [14, "Tiaret", "تيارت"],
  [15, "Tizi Ouzou", "تيزي وزو"],
  [16, "Alger", "الجزائر"],
  [17, "Djelfa", "الجلفة"],
  [18, "Jijel", "جيجل"],
  [19, "Sétif", "سطيف"],
  [20, "Saïda", "سعيدة"],
  [21, "Skikda", "سكيكدة"],
  [22, "Sidi Bel Abbès", "سيدي بلعباس"],
  [23, "Annaba", "عنابة"],
  [24, "Guelma", "قالمة"],
  [25, "Constantine", "قسنطينة"],
  [26, "Médéa", "المدية"],
  [27, "Mostaganem", "مستغانم"],
  [28, "M'Sila", "المسيلة"],
  [29, "Mascara", "معسكر"],
  [30, "Ouargla", "ورقلة"],
  [31, "Oran", "وهران"],
  [32, "El Bayadh", "البيض"],
  [33, "Illizi", "إليزي"],
  [34, "Bordj Bou Arréridj", "برج بوعريريج"],
  [35, "Boumerdès", "بومرداس"],
  [36, "El Tarf", "الطارف"],
  [37, "Tindouf", "تندوف"],
  [38, "Tissemsilt", "تيسمسيلت"],
  [39, "El Oued", "الوادي"],
  [40, "Khenchela", "خنشلة"],
  [41, "Souk Ahras", "سوق أهراس"],
  [42, "Tipaza", "تيبازة"],
  [43, "Mila", "ميلة"],
  [44, "Aïn Defla", "عين الدفلى"],
  [45, "Naâma", "النعامة"],
  [46, "Aïn Témouchent", "عين تموشنت"],
  [47, "Ghardaïa", "غرداية"],
  [48, "Relizane", "غليزان"],
  [49, "Timimoun", "تيميمون"],
  [50, "Bordj Badji Mokhtar", "برج باجي مختار"],
  [51, "Ouled Djellal", "أولاد جلال"],
  [52, "Béni Abbès", "بني عباس"],
  [53, "In Salah", "عين صالح"],
  [54, "In Guezzam", "عين قزام"],
  [55, "Touggourt", "تقرت"],
  [56, "Djanet", "جانت"],
  [57, "El M'Ghair", "المغير"],
  [58, "El Meniaa", "المنيعة"],
];

/**
 * Rough starting tariffs by zone, in DZD. The north is cheapest, the deep
 * south most expensive — the usual shape for Algerian carriers. Adjust every
 * one of these from the dashboard to match your actual contract.
 */
const SOUTH_DEEP = new Set([11, 33, 37, 50, 54, 56]);
const SOUTH = new Set([1, 8, 30, 32, 39, 45, 47, 49, 51, 52, 53, 55, 57, 58, 3, 17]);

export function defaultDeliveryPrices(code: number): {
  homePrice: number;
  deskPrice: number;
} {
  if (SOUTH_DEEP.has(code)) return { homePrice: 1400, deskPrice: 900 };
  if (SOUTH.has(code)) return { homePrice: 900, deskPrice: 550 };
  return { homePrice: 600, deskPrice: 350 };
}

export type ThemeMode = "light" | "dark";

export type ThemeTokenSet = {
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  accentInk: string;
  gold: string;
  border: string;
};

export type SiteSettingsShape = {
  key: string;
  siteName: string;
  tagline: string;
  announcement: string;
  announcementActive: boolean;
  phone: string;
  email: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  storeOpen: boolean;
  freeDeliveryThreshold: number;
  theme: {
    defaultMode: ThemeMode;
    allowUserToggle: boolean;
    radius: string;
    light: ThemeTokenSet;
    dark: ThemeTokenSet;
  };
};

/**
 * Palette sampled from the Contessa logos: rose-gold line art on ivory for
 * light, warm champagne gold on near-black for dark.
 *
 * Annotated rather than inferred — without the explicit type, `defaultMode`
 * narrows to the literal "light" and the theme editor can never set "dark".
 */
export const DEFAULT_SETTINGS: SiteSettingsShape = {
  key: "site",
  siteName: "CONTESSA",
  tagline: "Beauté & Élégance",
  announcement: "Livraison vers les 58 wilayas · Paiement à la livraison",
  announcementActive: true,
  phone: "",
  email: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  storeOpen: true,
  freeDeliveryThreshold: 0,
  theme: {
    defaultMode: "light",
    allowUserToggle: true,
    radius: "0.75rem",
    light: {
      bg: "#FBF8F5",
      surface: "#FFFFFF",
      ink: "#2B211C",
      muted: "#8A7A70",
      accent: "#B5715A",
      accentInk: "#FFFFFF",
      gold: "#C0975C",
      border: "#EAE0D8",
    },
    dark: {
      bg: "#0B0908",
      surface: "#151110",
      ink: "#F2E8DE",
      muted: "#A2938A",
      accent: "#D9A55F",
      accentInk: "#1A1310",
      gold: "#E0BA82",
      border: "#2A2220",
    },
  },
};
