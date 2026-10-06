# saas-video-kit

Produis des **vidéos de présentation de SaaS** (16:9 et 9:16, miniatures YouTube, musique, sous-titres en option) à partir d'un brief, avec [Remotion](https://www.remotion.dev) et un assistant IA (Claude Code ou Gemini CLI).

Tu fournis : une marque (couleur, police, logo), un brief et quelques captures d'écran de ton produit. Le kit fournit : un storyboard par scènes, des textes par langue, les rendus dans tous les formats, les miniatures, un prompt pour générer la musique, et des contrôles qualité.

> Ce dépôt est **à la fois** le projet (le kit lui-même), un **plugin Claude Code** et une **extension Gemini CLI**. Un seul dépôt, un seul `git clone` ou une seule commande d'installation.

## Ce que ça produit

Pour chaque vidéo, langue et format : `<vidéo>-<langue>-<format>[-musique][-st]`

- **Formats** : 16:9 (1920×1080) et 9:16 (1080×1920, avec zone de sécurité pour les plateformes verticales).
- **Langues** : autant que tu veux (fr et en fournis), un fichier de textes par langue.
- **Miniatures** : YouTube 16:9 et YouTube Shorts 9:16, par langue.
- **Musique** : un prompt calculé depuis le storyboard (tempo, bascule sur un début de mesure) à coller dans Suno, Udio, Gemini… puis un outil qui contrôle et cale le fichier reçu.
- **Sous-titres** (option) : fichiers `.srt` / `.vtt` et version incrustée.
- **Rendu en lot** avec contrôles automatiques (durée, résolution, loudness).

## Installation

Prérequis : Node.js 20 ou plus, Git, un compte Claude Code ou Gemini CLI.

### Avec Claude Code

```bash
claude plugin marketplace add michaelravedoni/saas-video-kit
claude plugin install saas-video-kit@saas-video
```

Puis, dans un dossier vide : `/saas-video-kit:init` crée le projet, `/saas-video-kit:saas-video` guide le montage d'une vidéo.

### Avec Gemini CLI

```bash
gemini extensions install https://github.com/michaelravedoni/saas-video-kit
```

Puis : `/saas-video:init` (nouveau projet), `/saas-video:new` (nouvelle vidéo), `/saas-video:render` (rendu et contrôles).

### Sans IA, ou pour développer le kit

```bash
git clone https://github.com/michaelravedoni/saas-video-kit
cd saas-video-kit
npm install
npm run validate     # vérifie marques, vidéos et textes (0 erreur attendue)
npm run dev          # Studio Remotion : compositions « demo-fr-16x9 », etc.
```

Pour démarrer **un projet à toi** à partir du kit : `node scripts/init.mjs ../mes-videos --name mes-videos`.

## Comment on travaille

Une vidéo se construit en étapes, chacune avec un **point de contrôle** (tu valides avant de passer à la suivante) :

1. **Brief** : cible, douleur concrète, message unique, 3 preuves, affirmations commerciales vraies.
2. **Marque** : `npm run new-brand -- <id> --name "…" --primary "#…"`.
3. **Script et storyboard** : `npm run new-video -- <id> --brand <marque> --locales fr,en`, puis textes (`copy.<langue>.json`) et scènes (`video.json`).
4. **Captures** : `npm run capture-guide -- <id>` liste ce qu'il faut capturer (tu te connectes toi-même à ton produit).
5. **Validation** : `npm run validate -- <id>`.
6. **Aperçu** : images clés dans Remotion, en 16:9 puis 9:16.
7. **Musique** : `npm run music-prompt -- <id>`, puis `npm run mix-music -- <id> <fichier>`. L'écoute reste à toi.
8. **Miniatures**, **sous-titres** (option), puis **rendu** : `npm run render-all -- <id>`.

Le détail est dans [`docs/00-workflow.md`](docs/00-workflow.md). L'assistant IA suit ces étapes grâce au skill `saas-video`.

## Personnaliser

Tu n'es pas limité aux scènes fournies :

- **6 types de scènes** prêts à l'emploi (`chaos`, `reveal`, `phoneFlow`, `choiceCard`, `control`, `cta`), réglables par `video.json` (durées, ordre, repères, paramètres).
- **Scènes sur mesure** pour une seule vidéo (`type: "custom"`) : un fichier React dans `content/videos/<id>/scenes/`, qui réutilise les composants du kit, les couleurs de la marque, les textes par langue, et fonctionne dans les deux formats, les sous-titres et le prompt de musique. Exemple : [`content/videos/demo/scenes/Highlight.tsx`](content/videos/demo/scenes/Highlight.tsx).
- **Nouveaux types de scènes, polices, langues, marques** : [`docs/07-extending.md`](docs/07-extending.md).

## Organisation du dépôt

```
content/
  brands/<marque>/brand.json          couleurs, police, logo, ton, affirmations autorisées
  videos/<vidéo>/
    video.json                        marque, langues, formats, scènes, transitions, musique
    copy.<langue>.json                tous les textes d'une langue
    scenes/<Nom>.tsx                  scènes sur mesure (option)
public/                               logos, captures, musique (par marque / par vidéo)
src/
  engine/                             contexte actif, polices, typographie, chronologie
  scenes/ scenes-vertical/            bibliothèque de scènes 16:9 et 9:16
  components/                         téléphone, curseur, cartes, texte animé…
  thumbnails/                         miniatures
scripts/                              validateur, prompt de musique, rendu en lot, création de marque/vidéo…
docs/                                 workflow, script, design, mouvement, captures, audio, qualité, extension, sous-titres
skills/  commands/  .claude-plugin/  gemini-extension.json
                                      skills, commandes et métadonnées du plugin Claude / de l'extension Gemini
AGENTS.md  CLAUDE.md  GEMINI.md       consignes pour les assistants IA
```

Un exemple fictif complet (« demo », marque Acme, fr + en, captures de remplacement) est inclus pour tout essayer sans rien configurer.

## Documentation

| | |
|---|---|
| [`docs/00-workflow.md`](docs/00-workflow.md) | le déroulé complet, étape par étape |
| [`docs/01-brief-and-script.md`](docs/01-brief-and-script.md) | brief et règles d'écriture des textes |
| [`docs/02-design.md`](docs/02-design.md), [`03-motion.md`](docs/03-motion.md) | design et mouvement |
| [`docs/04-captures.md`](docs/04-captures.md) | captures d'écran à fournir |
| [`docs/05-audio.md`](docs/05-audio.md) | musique, calage, niveau sonore |
| [`docs/06-qa-checklist.md`](docs/06-qa-checklist.md) | contrôle qualité avant publication |
| [`docs/07-extending.md`](docs/07-extending.md) | marques, langues, scènes sur mesure, nouveaux types |
| [`docs/08-subtitles.md`](docs/08-subtitles.md) | sous-titres |

## Licence

Aucune licence n'est définie pour l'instant : par défaut, tous droits réservés. Remotion a sa propre licence, qui demande une licence payante pour certaines entreprises : voir [remotion.dev/license](https://www.remotion.dev/license).
