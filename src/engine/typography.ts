// Typographie par langue. Dans les fichiers de textes :
//   « · »  = espace insécable (ex. « 23·h·30 », « vie·? »)
//   « ·· » = point médian littéral (ex. « 2014 ·· U12W » s'affiche « 2014 · U12W »)
const NBSP = "\u00A0";
const LITERAL_DOT = "\u0000";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const typographize = (s: string, _locale: string): string =>
  // Mêmes règles pour toutes les langues pour l'instant ; les règles propres à une langue
  // (ex. guillemets allemands) s'ajoutent ici.
  s
    .replace(/··/g, LITERAL_DOT)
    .replace(/·/g, NBSP)
    .replace(new RegExp(LITERAL_DOT, "g"), "·")
    .replace(/'/g, "\u2019");
