---
name: init
description: Crée un nouveau projet de vidéos de présentation SaaS (kit Remotion complet, avec un exemple fictif) dans un dossier vide. À utiliser quand l'utilisateur veut commencer à produire des vidéos de produit ou de SaaS et qu'il n'y a pas encore de projet du kit dans le dossier courant (pas de fichier AGENTS.md avec un dossier content/).
---

# Initialiser un projet « SaaS Video Kit »

Le kit complet est livré avec ce plugin ou cette extension. Sa **racine** est le dossier situé deux niveaux au-dessus de ce fichier (`<racine>/skills/init/SKILL.md`). Le script `<racine>/scripts/init.mjs` le copie dans un dossier vide, installe les dépendances et initialise Git.

## Déroulé

1. **Vérifie le dossier courant** (`ls -la`). S'il contient déjà `AGENTS.md` et `content/`, c'est déjà un projet du kit : ne recrée rien, passe au skill `saas-video`.
2. **Demande où créer le projet** si le dossier courant n'est pas vide : propose un nom de dossier (ex. `videos-<produit>`) à créer à côté ou dedans, et attends la réponse.
3. **Lance le script** (compte 2 à 3 minutes pour `npm install`, plus au premier lancement) :
   ```bash
   node "<racine>/scripts/init.mjs" <dossier> --name <nom-du-projet>
   ```
   Options : `--no-install`, `--no-git`, `--force`. Node 20 ou plus est requis ; si `node` ou `npm` manque, dis-le plutôt que de contourner.
4. **Vérifie** : `cd <dossier> && npm run validate` doit afficher « 0 erreur » (l'exemple fictif « demo » est inclus).
5. **Termine** en proposant la suite : lire `AGENTS.md`, puis créer la première marque et la première vidéo avec le skill `saas-video` (`npm run new-brand`, `npm run new-video`).

Ne modifie pas le kit installé (plugin ou extension). Ne lance pas de rendu complet à cette étape.
