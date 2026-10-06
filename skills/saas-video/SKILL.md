---
name: saas-video
description: Monte une vidéo de présentation de SaaS (16:9, 9:16, miniatures YouTube, musique, sous-titres en option) avec le kit Remotion, à partir d'un brief, d'une marque et de captures d'écran, par points de contrôle. À utiliser quand l'utilisateur veut créer, modifier, traduire ou rendre une vidéo promotionnelle de produit ou de SaaS, préparer une miniature YouTube, générer un prompt de musique, caler la musique ou ajouter des sous-titres, ou démarrer un nouveau projet de vidéos SaaS.
---

# Skill : vidéo de présentation SaaS

Ce skill fait partie du kit « saas-video-kit » (plugin Claude Code ou extension Gemini CLI). La **racine du kit** est le dossier situé deux niveaux au-dessus de ce fichier (`<racine>/skills/saas-video/SKILL.md`) : elle contient le modèle de projet complet et `scripts/init.mjs`.

## Étape 0 : se placer dans un projet du kit

Un projet du kit contient `AGENTS.md` et un dossier `content/` à sa racine.

- Si le dossier de travail en contient un : continue. Lis `AGENTS.md`, puis `docs/00-workflow.md`.
- Sinon : propose de créer le projet, demande le nom du dossier (vide), puis lance
  `node "<racine>/scripts/init.mjs" <dossier> --name <nom>`
  (2 à 3 minutes pour `npm install`). Vérifie avec `npm run validate` (0 erreur), puis travaille dans ce projet.

## Déroulé

Une étape = un point de contrôle : montre le résultat, attends la validation de l'utilisateur, puis passe à la suivante. Ne chaîne jamais plusieurs étapes sans validation. Pose tes questions dans la conversation, par petits groupes (4 au maximum à la fois), avec ta recommandation pour chacune.

1. **Cadrer** : nouvelle vidéo, nouvelle langue ou format, modification, miniature, musique, sous-titres ou rendu ? Regarde ce qui existe (`ls content/brands content/videos`, `npm run validate`).
2. **Entretien et brief** : questions de `docs/01-brief-and-script.md` (cible, douleur concrète, message unique, 3 preuves, affirmations commerciales vraies, captures possibles). Écris `brief.md`, fais-le valider.
3. **Marque** : `npm run new-brand -- <id> --name "…" --primary "#…" [--font …] [--flag CH]`. `claims.allowed` est rempli par l'utilisateur, jamais de ta propre initiative.
4. **Vidéo et script** : `npm run new-video -- <id> --brand <marque> --locales fr[,en]`, puis remplacer chaque « TODO » des textes en suivant `docs/01-brief-and-script.md`. Présente le script scène par scène (texte, durée) et fais-le valider ; ajuste `video.json`.
5. **Captures** : `npm run capture-guide -- <id>` ; transmets la liste et les consignes de `docs/04-captures.md` (l'utilisateur se connecte lui-même). Quand elles arrivent, **regarde chaque image** (lis le fichier PNG) : langue, données, zones sensibles. Si tu ne peux pas ouvrir une image, dis-le.
6. **Validation** : `npm run validate -- <id>` doit afficher 0 erreur ; examine chaque avertissement.
7. **Aperçu** : `npx remotion still <id>-<langue>-<format>-scene-N-<type> fichier.png --frame=N` (16:9, puis 9:16 avec `--props='{"guides":true}'`). Assemble des planches (scènes 1–2, 3–4, 5–6), montre-les, corrige.
8. **Musique** : `npm run music-prompt -- <id>` ; donne le prompt (option B recommandée) ; quand le fichier arrive, `npm run mix-music -- <id> <fichier>`, puis `--apply --write` si la cassure est décalée. **L'écoute est à l'utilisateur.**
9. **Miniatures** : clés `thumbnail` (textes) et `thumbnails` (visuels) ; rends les 2 formats par langue ; fais valider.
10. **Sous-titres (option)** : demande s'il en veut ; `docs/08-subtitles.md`.
11. **Rendu et contrôle** : `npm run render-all -- <id> --dry-run` pour annoncer ce qui sera rendu (≈ 30 min pour 2 langues × 2 formats × 2 variantes), puis le lancer en arrière-plan après validation. Rapporte le bilan des contrôles tel quel, échecs compris.

## Garde-fous

- Un écran ou un élément propre à la vidéo (hors des 6 types) : scène sur mesure `type: "custom"`, voir `docs/07-extending.md`. Ne modifie jamais `src/generated/` à la main ; avant de toucher un composant partagé, compare des images avant/après au pixel près (`docs/07-extending.md`).
- Rien en dur dans les scènes (textes, couleurs, police, durées) ; aucune animation CSS.
- Ne devine jamais une affirmation commerciale ni un écran du produit.
- Si une commande échoue ou si tu ne peux pas vérifier quelque chose, dis-le.
