import { Easing } from "remotion";
import { getActive, hasActive } from "./engine/active";
import { loadBrandFont } from "./engine/fonts";
import type { BrandColors } from "./engine/types";

// Couleurs, police et décor de la MARQUE ACTIVE (content/brands/<id>/brand.json).
// COLORS se lit comme un objet ordinaire : COLORS.blue, COLORS.ink, …
// La valeur est résolue à chaque lecture, donc elle suit la composition en cours de rendu.

const FALLBACK_COLORS: BrandColors = {
  blue: "#1058C8",
  blueDeep: "#0C4092",
  blueLogo: "#0D47A1",
  blueTint: "#E8F0FD",
  blueMid: "#C9DBF8",
  bg: "#F9FAFB",
  white: "#FFFFFF",
  ink: "#0F172A",
  gray: "#6B7280",
  line: "#E5E7EB",
  success: "#16A34A",
  successTint: "#DCFCE7",
  danger: "#DC2626",
  dangerTint: "#FEE2E2",
  night: "#0A1A3A",
  nightDeep: "#050D1F",
  blueOnNight: "#6FA3FF",
};

export const COLORS: BrandColors = new Proxy({} as BrandColors, {
  get: (_t, key: string) =>
    (hasActive() ? getActive().brand.colors : FALLBACK_COLORS)[
      key as keyof BrandColors
    ],
});

/** Police CSS de la marque active (chargée au premier appel). */
export const FONT = (): string =>
  loadBrandFont(hasActive() ? getActive().brand.font : "Inter");

// Couleurs de décor (accessoires, hors interface du produit). Surchargeables dans brand.json (« decor »).
const DEFAULT_DECOR = {
  avatars: ["#2DB67C", "#E8833A", "#7C5CE0", "#D8467A"], // pastilles de messagerie (S1)
  phoneOff: "#050A16", // écran de téléphone éteint (S1)
  phoneRim: "#1E2B4D", // liseré du téléphone (S1)
  wallpaper: "linear-gradient(180deg, #1B3A78 0%, #0F2250 55%, #0A1A3A 100%)", // fond d'écran (S1)
  swissRed: "#DA291C", // drapeau suisse (S6)
};

export const DECOR: typeof DEFAULT_DECOR = new Proxy(
  {} as typeof DEFAULT_DECOR,
  {
    get: (_t, key: string) => {
      const override = hasActive() ? getActive().brand.decor : undefined;
      return (override?.[key as keyof typeof DEFAULT_DECOR] ??
        DEFAULT_DECOR[key as keyof typeof DEFAULT_DECOR]) as never;
    },
  },
);

// Ressorts (docs/04-motion.md)
export const SPRINGS = {
  smooth: { damping: 200 },
  snappy: { damping: 20, stiffness: 200 },
  pop: { damping: 12, stiffness: 180 },
} as const;

// Sortie douce par défaut quand il n'y a pas de ressort.
export const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

// Échelle typographique pour une composition de 1920 px de large
// (minimums du skill remotion-create : titre 84 px et texte 44 px pour 1080 px de large, mis à l'échelle).
export const TYPE = {
  hero: 170,
  title: 150,
  subtitle: 76,
  ui: 40,
  pill: 40,
} as const;

// Version verticale 9:16 (1080×1920). Minimums du skill pour 1080 px de large.
export const TYPE_V = {
  hero: 128,
  title: 116,
  chaos: 104, // lignes courtes de S1
  subtitle: 64,
  ui: 40,
  pill: 37,
} as const;

// Zone de sécurité verticale : les interfaces des plateformes masquent le haut et surtout le bas.
// Zone utile : x 80 → 1000, y 220 → 1540.
export const SAFE_V = { x: 80, top: 220, bottom: 380, width: 920 } as const;

// Marges de sécurité (px)
export const SAFE = { x: 140, y: 120 } as const;
export const MAX_TEXT_WIDTH = 1500;

export const SHADOW = {
  card: "0 8px 24px rgba(15,23,42,.08)",
  window: "0 40px 80px rgba(16,88,200,.18)",
} as const;
