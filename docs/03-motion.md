# Mouvement

Principe : **fluide, rapide, jamais gadget**. Tout est piloté par `useCurrentFrame()`, `interpolate()` et `spring()` à 30 fps. **Aucune transition ni animation CSS** (elles ne se rendent pas image par image).

## Ressorts (`SPRINGS` dans `src/theme.ts`)

| Nom | Réglage | Usage |
|---|---|---|
| `smooth` | `{ damping: 200 }` | apparitions de textes, fondus, glissements calmes (sans rebond) |
| `snappy` | `{ damping: 20, stiffness: 200 }` | boutons, pastilles, coches |
| `pop` | `{ damping: 12, stiffness: 180 }` | notifications, pastille « validé » (léger rebond) |

## Durées de référence (images à 30 fps)

| Action | Images |
|---|---|
| Entrée d'un texte | 6 par mot, décalage de 3 entre les mots (`KineticText`) |
| Entrée d'une carte ou d'une capture | 18–24 |
| Sortie d'un élément | 8–10 |
| Clic de curseur | 12 |
| Déplacement de curseur | 20–30, en arc |
| Transition de scène | 10 (recouvrement) |

## Caméra sur les captures

Poussée lente permanente (échelle 1 → 1,04 à 1,06 sur toute la scène) ; légère inclinaison 3D à l'entrée des cadres ; parallaxe entre bureau et mobile. Pas de zoom au-delà de ×2,2.

## Rythme

Une idée toutes les 2–3 secondes ; un changement visible au moins toutes les 20 images. La première scène est nerveuse (secousses, empilement), les suivantes calmes et assurées : **le contraste raconte l'histoire**. Les moments clés seuls ont un rebond.

## Transitions (`video.json > scenes[].transitionOut`)

`fade` ou `slide` (de la droite en 16:9, du bas en 9:16). Le flash blanc de la première scène est intégré à la scène `chaos` (voile blanc qui monte) et à `reveal` (voile qui se résorbe) : la transition entre les deux est un `fade`.

## À éviter

Rotations folles, glitch, particules, plus de 3 éléments animés dans la même zone, rebonds partout, textes qui bougent en même temps que la caméra.

## Repères (`cues`)

Chaque type de scène a des repères par défaut en images relatives (`src/engine/archetypes.json`). Pour un texte plus long ou un autre rythme, surcharger dans `video.json` : `"cues": { "subtitle": [146, 340] }`. Si on rallonge une scène, rallonger aussi les repères de ses textes (le validateur compare au temps de lecture).
