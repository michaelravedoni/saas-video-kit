# SaaS Video Kit : consignes pour les agents (Claude, Gemini, autres)

Tu aides à produire des vidéos de présentation de SaaS avec Remotion (React + TypeScript) : une **marque**, un **storyboard** et des **textes par langue** produisent la vidéo en 16:9 et 9:16, avec ou sans musique, plus les miniatures YouTube.

Langue de travail avec l'utilisateur et des textes de la vidéo : celle de la vidéo (le français par défaut, vouvoiement). Réponds de façon concise, dis ce qui n'est **pas** vérifié, et ne déclare jamais une étape terminée sans l'avoir contrôlée.

## Commence ici

1. Lis `docs/00-workflow.md` (les étapes et les points de contrôle).
2. Selon l'étape : `docs/01-brief-and-script.md`, `02-design.md`, `03-motion.md`, `04-captures.md`, `05-audio.md`, `06-qa-checklist.md`, `07-extending.md`, `08-subtitles.md`.
3. Pour savoir ce que contient une scène : `src/engine/archetypes.json` (clés de texte, paramètres, repères). Exemple complet : `content/videos/demo/` (marque `content/brands/demo/`).

## Commandes

```bash
npm run new-brand -- <id> --name "Nom" --primary "#RRGGBB"      # nouvelle marque
npm run new-video -- <id> --brand <marque> --locales fr,en        # nouvelle vidéo (textes « TODO » à compléter)
npm run capture-guide -- <id>                                      # captures à fournir
npm run validate -- <id>                                           # À LANCER AVANT TOUT RENDU
npm run dev                                                        # Studio Remotion (compositions <id>-<langue>-<format>[-musique])
npm run music-prompt -- <id>                                       # prompt de musique minuté sur le storyboard
npm run mix-music -- <id> <fichier> [--apply] [--write]            # contrôle et calage de la musique
npm run subtitles -- <id>                                          # sous-titres .srt/.vtt (option : video.json > subtitles)
npm run render-all -- <id> [--locale fr] [--format 9x16] [--variants music,muted,subtitled] [--dry-run]   # toutes les versions + miniatures + contrôles
```

Images clés : `npx remotion still <composition> <fichier.png> --frame=N` (ajouter `--props='{"guides":true}'` pour afficher la zone de sécurité 9:16).

## Où est quoi

```
content/brands/<marque>/brand.json         couleurs, police, logo, affirmations autorisées, musique
content/videos/<id>/video.json             scènes (type, durée, transition, props, cues), langues, formats, musique, miniatures
content/videos/<id>/copy.<langue>.json     tous les textes ; clé = id de la scène (par défaut son type)
content/videos/<id>/brief.md               le brief
public/videos/<id>/captures|audio/         captures d'écran, musique
src/engine/                                contexte actif, polices, typographie, chronologie, VideoRoot, archetypes.json
src/scenes/ src/scenes-vertical/           scènes 16:9 et 9:16 (6 types)
src/components/                            composants partagés
src/generated/registry.ts                  GÉNÉRÉ : ne jamais modifier à la main
```

## Règles non négociables

1. **Aucune animation CSS** (transition, animation, @keyframes) : uniquement `useCurrentFrame()`, `interpolate()`, `spring()`. Sinon le rendu image par image casse.
2. **Rien en dur** dans les scènes : textes via `copy` (`useScene`), couleurs via `COLORS`/`DECOR`, police via `FONT()`, durées dans `video.json`, repères dans `cues`. Ne jamais copier `COLORS`/`COPY` dans une constante de module (valeurs résolues à chaque rendu).
3. **Ne rien inventer sur le produit** : écrans = captures de l'utilisateur ou composants recréés fidèlement. **Demander avant** toute affirmation commerciale ; seules celles de `brand.json > claims.allowed` sont permises.
4. **Textes** : marqueur `·` = espace insécable, `··` = point médian ; casse de phrase (fr) ; pas de mot seul en fin de ligne. Détails : `docs/01-brief-and-script.md`.
5. **Un point de contrôle à chaque étape** : montre des images clés (planche), attends la validation, n'enchaîne pas. Ne lance les rendus complets (plusieurs minutes) qu'une fois `npm run validate` à zéro erreur.
6. **Ne casse pas les vidéos validées** : avant de modifier un composant partagé, rends des images de référence et compare avant/après au pixel près (`docs/07-extending.md`).
7. **Ne lis pas une image à la place de l'utilisateur** : l'oreille (musique) et le visionnage en mouvement sont à lui.
8. Les fichiers générés (`src/generated/`, `out/`, `node_modules/`) ne se modifient pas à la main.

## Paquets

`npm run package` fabrique le plugin Claude et l'extension Gemini (voir `PACKAGING.md`). Le dépôt Git doit être propre avant : valide et commite d'abord. Commits : message clair en français, une fonctionnalité par commit.

## Skills Remotion utiles (si ton environnement les propose)

`remotion-best-practices` avant d'écrire une composition ; `remotion-render` pour le rendu ; `remotion-studio` pour le Studio ; `remotion-captions` si des sous-titres sont demandés.
