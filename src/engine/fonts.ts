import widthFactors from "./fonts.json";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadPlusJakarta } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadWorkSans } from "@remotion/google-fonts/WorkSans";
import { loadFont as loadOutfit } from "@remotion/google-fonts/Outfit";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";

// Polices prises en charge par `brand.json` (champ « font »). Pour en ajouter une :
// importer son `loadFont` ci-dessus et l'ajouter à la table. Poids 500 à 800 requis.
type Loader = (
  style?: "normal",
  options?: { weights?: string[]; subsets?: string[] },
) => {
  fontFamily: string;
};

const LOADERS: Record<string, Loader> = {
  Inter: loadInter as unknown as Loader,
  Poppins: loadPoppins as unknown as Loader,
  Manrope: loadManrope as unknown as Loader,
  "DM Sans": loadDMSans as unknown as Loader,
  Montserrat: loadMontserrat as unknown as Loader,
  "Plus Jakarta Sans": loadPlusJakarta as unknown as Loader,
  "Work Sans": loadWorkSans as unknown as Loader,
  Outfit: loadOutfit as unknown as Loader,
  "Space Grotesk": loadSpaceGrotesk as unknown as Loader,
};

export const SUPPORTED_FONTS = Object.keys(LOADERS);

const loaded = new Map<string, string>();

/** Charge la police (une seule fois) et renvoie son nom CSS. */
export const loadBrandFont = (name: string): string => {
  const cached = loaded.get(name);
  if (cached) return cached;
  const loader = LOADERS[name];
  if (!loader) {
    throw new Error(
      `Police « ${name} » non prise en charge. Polices disponibles : ${SUPPORTED_FONTS.join(", ")}.`,
    );
  }
  const { fontFamily } = loader("normal", {
    weights: ["500", "600", "700", "800"],
    subsets: ["latin"],
  });
  loaded.set(name, fontFamily);
  return fontFamily;
};

/** Largeur moyenne d'un caractère en « em » (titres gras) : sert à adapter la taille des titres de miniatures. */
export const fontWidthFactor = (name: string): number =>
  (widthFactors as Record<string, number>)[name] ?? 0.52;
