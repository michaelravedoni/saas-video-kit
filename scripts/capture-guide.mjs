// Liste les captures d'écran nécessaires à une vidéo (d'après video.json) avec leurs consignes.
//   npm run capture-guide -- demo    → content/videos/demo/captures-needed.md
import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ARCH, loadVideo, root } from "./lib/timeline.mjs";

const id = process.argv[2];
if (!id) {
  console.log("Usage : npm run capture-guide -- <vidéo>");
  process.exit(1);
}
const { video } = loadVideo(id);

const rows = [];
const add = (scene, key, val, hint) => {
  const files =
    typeof val === "string" ? [[null, val]] : Object.entries(val ?? {});
  for (const [loc, f] of files)
    rows.push({
      scene,
      key,
      locale: loc,
      file: f,
      hint,
      exists: existsSync(join(root, "public", "videos", id, "captures", f)),
    });
};
video.scenes.forEach((sc) => {
  const man = ARCH[sc.type] ?? { props: {} };
  const sid = sc.id ?? (sc.type === "custom" ? sc.name : sc.type);
  for (const [k, v] of Object.entries(sc.props ?? {}))
    if (/Capture$/.test(k)) add(`${sid} (${sc.type})`, k, v, man.props[k]);
});
if (video.thumbnails)
  for (const k of ["desktopCapture", "mobileCapture"])
    add(
      "miniatures",
      k,
      video.thumbnails[k],
      "même capture que la scène « reveal » en général",
    );

const md = `# Captures d'écran à fournir : ${id}

Généré par \`npm run capture-guide -- ${id}\` : à relancer si \`video.json\` change.
Dossier : \`public/videos/${id}/captures/\`

## Consignes (toutes les captures)

- **Taille :** écran d'ordinateur en **2880×1800** (capture « retina » en plein écran du navigateur, fenêtre en 1440×900 × 2) ; mobile en **1440×3202** (ou proportions 9:19,5). Un grand format permet de zoomer sans flou.
- **Langue :** l'interface dans **la langue de la vidéo**, partout (aucun texte anglais ou de développement visible). Une capture par langue si la vidéo en a plusieurs.
- **Données de démonstration :** noms fictifs, dates plausibles et **futures**, pas de données personnelles réelles.
- **Éléments personnels :** pas de lien de connexion, jeton ou e-mail réel visibles (sinon prévoir une zone floutée dans \`video.json\`).
- **Mode clair**, sans bannière, notification ni extension de navigateur visible.
- **Format :** PNG. Nommer les fichiers comme indiqué ci-dessous.

## Fichiers attendus

| Scène | Paramètre | Langue | Fichier | À montrer | Présent |
|---|---|---|---|---|---|
${rows.map((r) => `| ${r.scene} | \`${r.key}\` | ${r.locale ?? "toutes"} | \`${r.file}\` | ${r.hint ?? ""} | ${r.exists ? "✓" : "✗ manquant"} |`).join("\n")}
`;
writeFileSync(join(root, "content", "videos", id, "captures-needed.md"), md);
const missing = rows.filter((r) => !r.exists).length;
console.log(
  `guide écrit : content/videos/${id}/captures-needed.md (${rows.length} capture(s), ${missing} manquante(s))`,
);
