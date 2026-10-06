# Gemini CLI : kit saas-video

Ce dépôt est à la fois un **projet** (kit Remotion de vidéos de présentation de SaaS) et une **extension Gemini CLI**.

- Pour toute demande de vidéo, de miniature, de musique, de sous-titres ou de projet de vidéos SaaS : **active le skill `saas-video`** et suis-le.
- Commandes de l'extension : `/saas-video:init` (nouveau projet), `/saas-video:new` (nouvelle vidéo), `/saas-video:render` (rendu et contrôles).
- Dans un projet du kit (dossier avec `AGENTS.md` et `content/`), les consignes complètes sont dans **`AGENTS.md`** (elles font foi, les mêmes servent à Claude) puis `docs/00-workflow.md` : lis-les avant d'agir.

Spécifique à Gemini :
- Pour regarder une image rendue (planche de contrôle, capture), lis le fichier PNG comme image ; si tu ne peux pas l'ouvrir, dis-le plutôt que d'affirmer que le résultat est bon.
- Les commandes sont des scripts `npm run …` (voir `AGENTS.md`) : ne réécris pas leur logique à la main.
- Règles essentielles : aucun écran ni affirmation commerciale inventés ; un point de contrôle à chaque étape ; dire ce qui n'a pas été vérifié ; l'écoute de la musique est à l'utilisateur.
