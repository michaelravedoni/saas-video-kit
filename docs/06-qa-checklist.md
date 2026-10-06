# Contrôle qualité

À cocher sur des images **rendues**, pas de mémoire. `npm run render-all` contrôle automatiquement durée, résolution, piste audio, niveau sonore et poids des miniatures ; le reste est visuel.

## Textes
- [ ] Chaque texte correspond au script validé ; casse et ponctuation de la langue respectées.
- [ ] Espaces insécables (fr) ; aucun mot seul en fin de ligne sur les titres, dans **chaque langue et chaque format**.
- [ ] Aucun texte tiers ou étranger visible (badge de capture, interface non traduite).
- [ ] Aucune affirmation hors de `claims.allowed`, aucun mot de `forbiddenWords`.
- [ ] Temps de lecture suffisant (avertissements du validateur examinés).

## Design
- [ ] Une seule couleur d'accent par écran ; logo lisible partout (jamais un logo foncé sur fond sombre).
- [ ] Interface recréée fidèle au produit (comparer à une capture).
- [ ] Captures sans donnée personnelle ni lien de connexion visible.
- [ ] 9:16 : texte et boutons dans la zone utile (images avec `guides`).

## Mouvement
- [ ] Aucune animation CSS ; pas d'image figée de plus de 20 images ; clics suivis d'un effet immédiat.
- [ ] Transitions conformes ; le flash blanc est net.

## Audio
- [ ] Cassure de la musique sur la bascule (écoute) ; niveau −14 LUFS ± 1,5, pic ≤ −1 dBTP ; fondu de fin propre.

## Technique
- [ ] `npm run validate` : 0 erreur.
- [ ] Toutes les versions rendues : durée, résolution, audio (musique) ou pas d'audio (muet).
- [ ] Miniatures < 2 Mo, texte lisible en petit.
- [ ] **Après toute modification d'un composant partagé** : comparer des images avant/après (voir `docs/07-extending.md`) pour vérifier que les vidéos validées n'ont pas changé.

## Message
- [ ] Sans le son, on comprend en une minute : le problème, la solution, les 3 preuves, le bouton.
- [ ] La bascule du chaos au soulagement est nette ; la dernière image invite à cliquer.
