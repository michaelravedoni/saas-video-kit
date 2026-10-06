import { getActive } from "./engine/active";
import { typographize } from "./engine/typography";

// Textes de la vidéo ACTIVE, dans la langue active (content/videos/<id>/copy.<langue>.json).
// COPY se lit comme un objet ordinaire : COPY.chaos.message, …
// Les chaînes sont passées par la typographie de la langue (« · » → espace insécable, apostrophes).
// Les scènes lisent leurs textes via useScene() (src/engine/scene.tsx), typés par archétype ;
// scripts/validate.mjs vérifie que chaque langue a les clés attendues.

type CopyShape = Record<string, unknown>;

const process = (value: unknown, locale: string): unknown => {
  if (typeof value === "string") return typographize(value, locale);
  if (Array.isArray(value)) return value.map((v) => process(v, locale));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, process(v, locale)]),
    );
  }
  return value;
};

const cache = new WeakMap<object, { locale: string; value: CopyShape }>();

const current = (): CopyShape => {
  const { copy, locale } = getActive();
  const hit = cache.get(copy);
  if (hit && hit.locale === locale) return hit.value;
  const value = process(copy, locale) as CopyShape;
  cache.set(copy, { locale, value });
  return value;
};

export const COPY: CopyShape = new Proxy({} as CopyShape, {
  get: (_t, key: string) => current()[key as keyof CopyShape],
});
