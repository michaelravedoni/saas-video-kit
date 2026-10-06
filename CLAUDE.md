# Claude Code : consignes du kit

Les consignes complètes sont dans **`AGENTS.md`** : lis-le en premier, il fait foi (les mêmes consignes servent à Gemini et aux autres agents).

Spécifique à Claude Code :
- Le skill **`saas-video`** (plugin `saas-video-kit`, ou `skills/saas-video/` dans ce dépôt) guide le montage d'une vidéo de bout en bout : il se déclenche quand l'utilisateur demande de créer ou de modifier une vidéo de présentation SaaS.
- Charge le skill `remotion:remotion-best-practices` avant d'écrire ou de modifier une composition.
- Pour une tâche longue, avance par étapes avec un point de contrôle à chacune (voir `docs/00-workflow.md`) et vérifie sur des images rendues avant de dire que c'est fini.
