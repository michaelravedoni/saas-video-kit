# Brief et script

## Le brief (`brief.md`)

Il tient en une page : produit, cible, **message unique**, **trois preuves**, appel à l'action, contraintes (langues, ton, interdits), visuels disponibles. Modèle généré par `npm run new-video`.

Questions à poser à l'utilisateur s'il ne les a pas déjà traitées :
1. Qui regarde, et qu'est-ce qui lui coûte le plus aujourd'hui (temps, argent, sérénité) ?
2. Quelle est la douleur **concrète** qu'on peut mettre en scène (un message à 23 h, un tableur illisible…) ?
3. Quelles sont les 3 preuves les plus fortes, **vérifiables dans le produit** ?
4. Quelles affirmations commerciales sont vraies et autorisées (gratuit, sans carte, délai de mise en route…) ?
5. Peut-on se connecter pour faire des captures, ou faut-il tout recréer ?

## Structure narrative

**Douleur absolue → soulagement immédiat → preuves → action.**

| Scène (type) | Rôle | Durée indicative |
|---|---|---|
| `chaos` | la douleur, sans une seule fonctionnalité, jusqu'à la phrase de rupture | ≈ 10 s |
| `reveal` | le soulagement : logo, slogan, l'application | ≈ 11 s |
| `phoneFlow` | première preuve (ex. connexion sans mot de passe, parcours en 2 clics) | ≈ 12 s |
| `choiceCard` | deuxième preuve (autonomie : l'utilisateur choisit, le système gère) | ≈ 11 s |
| `control` | troisième preuve (le contrôle : chiffres, règle automatique, export) | ≈ 10 s |
| `cta` | une question, un bouton, des pastilles de réassurance, l'URL | ≈ 7 s |

On ne parle du produit qu'à partir du soulagement (≈ 10 s). Les 10 premières secondes doivent fonctionner **sans le son**.

## Règles des textes à l'écran

Pas de voix off par défaut : le texte et le mouvement portent le récit, la musique accompagne.

- **Court** : une idée par carton, 2 lignes maximum, phrases de 4 à 8 mots.
- **Temps de lecture** : `0,6 s + 1 s par tranche de 15 caractères` (≈ 2,4 s pour 27 caractères). Le validateur avertit en dessous de 90 %. Les phrases parallèles (« Un message… Un mail… Un fichier… ») se lisent plus vite.
- **Un mot clé en couleur** par titre (champ `…Highlight` : le mot exact, avec sa ponctuation finale).
- **Concret** : des noms, des heures, des chiffres plutôt que des généralités. Données fictives plausibles.
- **Pas de jargon**, pas de superlatif creux.
- **Pas de promesse non confirmée.**

## Typographie (marqueurs dans les textes)

| Marqueur | Effet |
|---|---|
| `·` | espace insécable : `23·h·30`, `vie·?`, `Plan gratuit·: 0·€` |
| `··` | point médian affiché : `2014 ·· U12W` |
| `!` en tête d'une cellule du tableur | cellule en erreur (rouge) |

Français : majuscule au premier mot et aux noms propres uniquement ; espace insécable avant `? ! : ;` et dans les guillemets « » ; apostrophe typographique (convertie automatiquement) ; `…` et non `...`. Le validateur contrôle ces règles pour le français.

**Mot seul en fin de ligne** (« orphelin ») : le coller au mot précédent avec `·` dans le texte (`2 clicks to sign·up.`). À vérifier dans chaque langue sur les images clés.

## Langues

Un fichier `copy.<langue>.json` par langue, mêmes clés partout (le validateur le vérifie). Ne pas traduire mot à mot : réécrire pour que ça sonne juste et tienne dans la durée. Les textes allemands sont souvent 20 à 30 % plus longs : vérifier les titres sur les deux formats.

## Affirmations commerciales

Liste blanche dans `brand.json > claims.allowed` ; mots interdits dans `claims.forbiddenWords` (le validateur les refuse). Exemple appris : écrire « création et configuration en 30 secondes » et jamais « installation » pour une application web.
