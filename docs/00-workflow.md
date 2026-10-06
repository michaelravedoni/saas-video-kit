# Workflow : du brief à la vidéo publiée

Chaque étape se termine par un **point de contrôle** : on montre le résultat à l'utilisateur et on attend sa validation avant de continuer. Ne jamais enchaîner toutes les étapes d'un coup.

| # | Étape | Commande / fichier | Point de contrôle |
|---|---|---|---|
| 1 | **Entretien et brief** | `content/videos/<id>/brief.md` | brief relu et validé |
| 2 | **Marque** (si nouvelle) | `npm run new-brand -- <id> --name … --primary #…` | palette, logo, police, affirmations autorisées |
| 3 | **Script** : textes à l'écran par scène | `copy.<langue>.json` (règles : `docs/01-brief-and-script.md`) | textes validés, affirmations confirmées |
| 4 | **Storyboard** : scènes, durées, paramètres | `video.json` | enchaînement et durées validés |
| 5 | **Captures** | `npm run capture-guide -- <id>` puis dépôt dans `public/videos/<id>/captures/` | captures reçues et conformes (`docs/04-captures.md`) |
| 6 | **Validation** | `npm run validate -- <id>` | 0 erreur ; avertissements examinés |
| 7 | **Aperçu scène par scène** | `npm run dev` : dossier `<id>-<langue>-<format>-scenes` | images clés montrées (3 points de contrôle conseillés) |
| 8 | **Musique** | `npm run music-prompt -- <id>` → générer → `npm run mix-music -- <id> <fichier>` | cassure calée, niveau conforme ; **écoute par l'utilisateur** |
| 9 | **Miniatures** | clés `thumbnail` + `thumbnails` ; rendu des 2 formats | miniatures validées |
| 10 | **Sous-titres** (option) | `video.json > subtitles` ; `docs/08-subtitles.md` | fichiers `.srt` / version incrustée validés |
| 11 | **Rendu et contrôle final** | `npm run render-all -- <id>` | fichiers conformes, relecture par l'utilisateur |

## Règles de conduite

- **Demander avant d'inventer** : toute affirmation commerciale (prix, gratuité, délai, « sans carte »…) doit être confirmée par l'utilisateur et listée dans `brand.json > claims.allowed`.
- **Ne rien inventer sur le produit** : l'interface montrée vient des captures de l'utilisateur ou de composants recréés fidèlement. Jamais d'écran imaginé.
- **Valider avant de rendre** : `npm run validate` doit passer ; un rendu complet dure plusieurs minutes.
- **Dire ce qui n'a pas été vérifié** : une image clé ne remplace pas la vidéo en mouvement ; aucun outil ne remplace l'oreille pour la musique.

## Durées indicatives de rendu

Une vidéo de 60 s (1920×1080 ou 1080×1920) prend environ 3 à 4 minutes. `render-all` pour une vidéo à 2 langues × 2 formats × 2 variantes (musique, muet) : environ 30 minutes.
