# Design

Direction par défaut : **SaaS moderne, épuré, blanc et couleur de marque**, police sans empattement. L'interface recréée reprend le langage du produit réel (cartes blanches, bords arrondis, ombres douces, boutons de la couleur de marque).

## Couleurs (`brand.json > colors`)

Les noms de clés sont fixes ; `npm run new-brand` dérive la palette d'une couleur principale.

| Clé | Rôle |
|---|---|
| `blue` | couleur principale : boutons, mots clés, accents (le nom « blue » est historique : c'est la couleur de marque) |
| `blueDeep`, `blueLogo`, `blueTint`, `blueMid` | variantes : ombres, logo, fonds de pastilles et de halos, traits |
| `blueOnNight` | couleur principale éclaircie, lisible sur fond sombre (scène `chaos`) |
| `bg`, `white`, `ink`, `gray`, `line` | fond, cartes, texte, texte secondaire, bordures |
| `success`, `danger` (+ `…Tint`) | états uniquement (validé, erreur, quota incomplet) |
| `night`, `nightDeep` | fond de la scène sombre `chaos` |

Règles : **une seule couleur d'accent par écran** ; le vert et le rouge ne servent qu'aux états ; ombres teintées de la couleur de marque, jamais de noir pur ; la scène `chaos` est la seule scène sombre, par choix narratif (nuit → jour au flash blanc).

## Typographie

Polices prises en charge : voir `src/engine/fonts.ts` (Inter, Poppins, Manrope, DM Sans, Montserrat, Plus Jakarta Sans, Work Sans, Outfit, Space Grotesk). Pour en ajouter une : importer son `loadFont` et son facteur de largeur (`fonts.json`).

| Rôle | 16:9 (1920×1080) | 9:16 (1080×1920) |
|---|---|---|
| Titre héros | 150–170 px | 104–128 px |
| Titre de scène | 150 px | 116 px |
| Sous-titre | 76 px | 64 px |
| Interface recréée, principale | 36–40 px | 36–40 px |
| Interface recréée, secondaire | 28 px minimum | 28 px minimum |

Titres en poids 800, interlettrage −0,03 em, interligne 1,05.

## Zone de sécurité 9:16

Les interfaces des plateformes masquent le haut et surtout le bas. **Zone utile : x 80 → 1000, y 220 → 1540** (constante `SAFE_V`). Texte et boutons toujours dedans ; les décors (téléphone qui dépasse en bas) peuvent déborder. Vérifier avec la surcouche : `npx remotion still <id>-<langue>-9x16-scene-N-<type> out/x.png --frame=N --props='{"guides":true}'`.

## Mise en page

- 16:9 : **texte à gauche, visuel à droite**.
- 9:16 : **texte en haut, visuel en dessous**.
- Un message par plan. Densité faible, beaucoup d'espace.
- Fond `bg` avec un halo radial de la couleur de marque (opacité 0,06 à 0,14).

## Interface recréée

Quand un écran n'existe pas dans les captures, il est recréé en React dans le style exact du produit (exemple : la carte de choix de poste). Ne jamais inventer un écran « plausible » : s'appuyer sur une capture de référence.

## Captures dans les scènes

Plan large uniquement pour les captures qui contiennent des textes non traduits ou périmés. Les zones sensibles (liens de connexion, e-mails réels) sont floutées via `props.blur`.
