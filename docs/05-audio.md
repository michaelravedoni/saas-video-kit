# Audio

Par défaut : **musique seule**, sans voix off. La musique se pose sur le rendu, avec un gain et des fondus réglés dans `video.json > music`.

## Chaîne de travail

1. `npm run music-prompt -- <id>` écrit `content/videos/<id>/music-prompt.md` : durée, tempo (la bascule tombe sur un début de mesure), sections, points de synchronisation à la seconde près, et deux prompts à copier (un morceau, ou deux morceaux raccordés à la bascule : **l'option la plus fiable**).
2. L'utilisateur génère la musique (Gemini/Lyria, Suno, Udio, ElevenLabs Music…) et dépose le fichier dans `public/videos/<id>/audio/`.
3. `npm run mix-music -- <id> <fichier>` analyse : position de la cassure vs bascule du storyboard, durée, niveau (LUFS, pic) et volume recommandé. `--apply` écrit `music.mp3` recalé (début coupé ou silence ajouté), `--write` met à jour `video.json`.
4. **L'utilisateur écoute** les 10 premières secondes, la bascule et les dernières secondes.

## Réglages (`video.json > music`)

| Champ | Rôle |
|---|---|
| `file` | chemin relatif à `public/videos/<id>/` |
| `volume` | gain 0–1 ; cible : −14 LUFS et pic ≤ −1,5 dBTP (réglage recommandé par `mix-music`) |
| `fadeInFrames` | fondu d'entrée (6 images) |
| `fadeOutFrames` | fondu de sortie (30 images = 1 s) ; le fichier est coupé à la durée de la vidéo |

La direction musicale (style, à éviter) est dans `brand.json > music`.

## Limites

- La détection de la cassure est une heuristique (creux soudain, coup, puis passage plus calme). Elle avertit quand le contraste est faible ; pour un autre style de musique, se fier à l'oreille.
- Les modèles de musique respectent mal les minutages : prévoir de régénérer ou de raccorder deux morceaux.
- La voix off et les sous-titres ne sont pas dans cette version du kit (le skill `remotion-captions` et ElevenLabs sont les pistes ; le minutage dépendrait alors de la durée de l'audio).
