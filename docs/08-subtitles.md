# Sous-titres (option)

Désactivés par défaut. On les active dans `video.json` :

```json
"subtitles": { "source": "auto" }
```

Effets : `npm run render-all` écrit aussi les fichiers `.srt` et `.vtt` de chaque langue, et chaque vidéo gagne des compositions **sous-titrées** (`<id>-<langue>-<format>[-musique]-st`) que `render-all` rend avec `--variants music,muted,subtitled`.

## Deux sources

| `source` | Contenu | Quand l'utiliser |
|---|---|---|
| `"auto"` | les **textes à l'écran** de chaque scène, minutés sur leurs repères d'animation | accessibilité et référencement : fichier de sous-titres à téléverser avec la vidéo (YouTube, LinkedIn…). Aucune rédaction. |
| `"copy"` | une **narration écrite** dans `copy.<langue>.json`, clé `subtitles` | quand le sous-titre dit autre chose que le texte à l'écran (voix off future, explication, commentaire) |

Narration écrite (secondes depuis le début de la vidéo) :

```json
"subtitles": [
  { "from": 0.9, "to": 3.3, "text": "Un message WhatsApp à 23·h·30 : vous reconnaissez ?" },
  { "from": 3.5, "to": 6.0, "text": "Acme range tout, pour vous." }
]
```

Si la clé `subtitles` existe dans une langue, elle prime sur le mode automatique pour cette langue.

## Fichiers `.srt` / `.vtt` ou texte incrusté ?

- **Fichiers (recommandé pour le mode `auto`)** : les textes sont déjà à l'écran ; incruster les mêmes mots en bas de l'image les double. Les fichiers servent la lecture sans image, les moteurs de recherche et les plateformes qui proposent leurs propres sous-titres.
- **Incrustés** (`-st`) : utiles pour la narration (`copy`), ou pour une plateforme qui n'accepte pas de fichier. Légende blanche sur fond sombre, en bas de l'image (dans la zone de sécurité en 9:16).

## Règles de rédaction (source `copy`)

2 lignes de 42 caractères au maximum par réplique ; 20 caractères par seconde au maximum ; 0,8 s au minimum à l'écran ; pas de chevauchement. Le validateur contrôle tout cela (avertissements) et refuse les répliques invalides ou qui dépassent la fin de la vidéo. Les marqueurs de typographie (`·`, `··`) fonctionnent comme dans les autres textes.

## Commandes

```bash
npm run subtitles -- <id> [--locale fr] [--source auto|copy]      # écrit out/<id>/<langue>/<id>-<langue>.srt et .vtt
npm run render-all -- <id> --variants music,muted,subtitled        # ajoute les versions incrustées
```

## Voix off

Pas encore dans le kit. Quand elle sera ajoutée, les sous-titres de narration (`copy`) seront la base du texte à lire et les minutages viendront de la durée de l'audio généré.
