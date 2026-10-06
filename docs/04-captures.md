# Captures d'écran

`npm run capture-guide -- <id>` écrit `content/videos/<id>/captures-needed.md` : la liste exacte des fichiers attendus, d'après `video.json`, avec leur état (présent ou manquant).

## Consignes (à transmettre telles quelles à l'utilisateur)

- **Taille** : ordinateur **2880×1800** (fenêtre de navigateur 1440×900 en capture « retina ») ; mobile **1440×3202**. Les grands formats permettent de zoomer sans flou.
- **Langue** : l'interface dans la langue de la vidéo, **partout**. Aucun texte anglais ou technique visible (exemples réels rencontrés : « Last 30 days », « Your email »). Une capture par langue si la vidéo est multilingue (`{ "fr": "a.png", "en": "a-en.png" }`).
- **Données de démonstration** : noms fictifs, dates plausibles et **futures** (« dans 4 jours »), pas de données réelles.
- **Éléments personnels** : pas de lien de connexion, jeton ni e-mail réel visibles ; sinon prévoir `props.blur` ({ left, top, width, height } dans l'écran du téléphone).
- **Mode clair**, sans bannière, notification ni extension de navigateur visible.
- **PNG**, nommés comme dans le guide.

## Pourquoi c'est à la main

Beaucoup de produits demandent une connexion : l'IA ne peut pas faire les captures. Quand un écran manque, on le **recrée en composant** (comme la carte de choix, la carte de délai d'inscription, les cartes de statistiques) plutôt que d'attendre.

## Contrôle

`npm run validate` vérifie que chaque capture déclarée existe. Il ne peut pas lire l'image : regarder chaque capture (taille, langue, données, zones sensibles) avant de rendre.
