# Étendre le kit

## Ajouter une marque
`npm run new-brand -- <id> --name "Nom" --primary "#RRGGBB" [--font Poppins] [--flag CH]` puis : logo dans `public/brands/<id>/logo.png` (ajuster `logo.width/height`), relire les couleurs dérivées, remplir `claims`, `tone`, `music`.

## Ajouter une vidéo
`npm run new-video -- <id> --brand <marque> --locales fr,en [--scenes chaos,reveal,…]` crée `video.json`, `brief.md` et un `copy.<langue>.json` rempli de « TODO » pour toutes les clés attendues. Ensuite : brief → textes → `npm run capture-guide` → captures → `npm run validate`. Les compositions apparaissent dans le Studio (`<id>-<langue>-<format>[-musique]`).

## Ajouter une langue
Créer `copy.<langue>.json` (mêmes clés), l'ajouter à `video.json > locales`. Si les captures sont traduites : `{ "fr": "a.png", "en": "a-en.png" }`. Vérifier les titres sur les deux formats.

## Ajouter une police
Importer son `loadFont` dans `src/engine/fonts.ts`, l'ajouter à la table `LOADERS`, et à `src/engine/fonts.json` (largeur moyenne d'un caractère en em, ≈ 0,47 à 0,55).

## Régler une scène existante
- Durées et ordre : `video.json > scenes`. Repères d'animation : `scenes[].cues` (valeurs par défaut dans `src/engine/archetypes.json`).
- Paramètres : `scenes[].props` (captures, nombres, ligne cliquée, zone floutée). La liste figure dans `archetypes.json > <type> > props`.

## Créer un nouveau type de scène (archétype)
1. Décrire le type dans `src/engine/archetypes.json` : `copy` (clés de texte), `rawCopy`, `textCues`, `props`, `propsDefaults`, `cues`, `music` (rôle et événements pour le prompt de musique).
2. Ajouter ses types TypeScript dans `src/engine/archetypes.ts` (`…Copy`, `…Props`, `…Cues`, entrée de `SceneData`) et le nom dans `SceneType` (`src/engine/types.ts`). Le validateur lit les types dans `archetypes.json`.
3. Écrire **deux composants de scène** (16:9 dans `src/scenes/`, 9:16 dans `src/scenes-vertical/`) qui lisent leurs données avec `useScene("<type>")` ; réutiliser les composants de `src/components/`.
4. Les enregistrer dans `src/engine/scenes.ts`.
Règles : animations uniquement par `useCurrentFrame`/`interpolate`/`spring` ; aucune couleur en dur (utiliser `COLORS`, `DECOR`) ; aucune police en dur (`FONT()`) ; aucun texte en dur (tout vient de `copy`) ; aucune lecture de `COPY`/`COLORS` au niveau du module (valeurs résolues à chaque rendu).

## Écrire une scène sur mesure pour une seule vidéo (type `custom`)
Pas besoin de toucher au moteur : un fichier dans la vidéo suffit.
1. Créer `content/videos/<id>/scenes/<Nom>.tsx` avec `export default defineScene({ "16x9": …, "9x16": … })` (voir l'exemple `content/videos/demo/scenes/Highlight.tsx`). Les composants lisent leurs données avec `useScene("custom")` : `copy`, `props`, `cues`.
2. Déclarer la scène dans `video.json` : `{ "type": "custom", "name": "<Nom>", "id": "<clé de copie>", "frames": 240, "transitionOut": "fade", "musicRole": "build", "cues": {…}, "textCues": {…}, "props": {…} }`.
3. Écrire les textes dans `copy.<langue>.json` sous la clé `id`.
4. `npm run registry` (ou `npm run lint`, qui le lance) puis `npm run validate`.
La scène est une scène comme les autres : mêmes compositions, aperçus `…-scene-N-custom`, sous-titres (via `textCues`), prompt de musique (via `musicRole`), guide de capture. Elle peut utiliser tous les composants de `src/components/` ; un composant propre à la vidéo se met à côté, dans `content/videos/<id>/`. Mêmes règles que pour un archétype (pas de couleur, police ni texte en dur ; rien de résolu au niveau du module). Si une mise en page sert à plusieurs vidéos, la promouvoir en archétype (section précédente).

## Vérifier qu'on n'a rien cassé (régression)
Avant de modifier un composant partagé, rendre des images de référence des vidéos validées :
`npx remotion still <id>-<langue>-<format>-scene-N-<type> ref.png --frame=F` (2 images par scène, 2 formats). Après la modification, re-rendre et comparer au pixel près (Pillow : `ImageChops.difference(a, b).getbbox()` doit valoir `None`). Tolérance : de très petits écarts (quelques dizaines de pixels, amplitude ≤ 15/255) sur les bords de formes 3D peuvent venir du bruit d'anti-crénelage : re-rendre deux fois la même image pour le vérifier.

## Pièges rencontrés (à connaître)
- `·` est le marqueur d'espace insécable : pour un vrai point médian, écrire `··`.
- Les valeurs de `COLORS`, `COPY`, `DECOR` sont résolues **à chaque lecture** pour la marque et la langue actives : ne jamais les copier dans une constante de module.
- Les captures de l'interface restent dans leur langue : prévoir une capture par langue.
- Un texte plus long (autre langue) peut passer sur une ligne de plus et heurter un autre élément : vérifier sur images, dans les deux formats.
- `remotion still` d'une même image 3D peut différer de quelques pixels d'un rendu à l'autre : ce n'est pas une régression.
