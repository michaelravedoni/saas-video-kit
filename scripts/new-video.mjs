// Crée une vidéo pour une marque : video.json, brief.md et textes à compléter pour chaque langue.
//   npm run new-video -- mon-produit --brand acme [--locales fr,en] [--scenes chaos,reveal,phoneFlow,choiceCard,control,cta]
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ARCH, root } from "./lib/timeline.mjs";

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
const opt = (n, d) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : d;
};
const brand = opt("--brand", null);
if (!id || !/^[a-z0-9-]+$/.test(id) || !brand) {
  console.log(
    "Usage : npm run new-video -- <id> --brand <marque> [--locales fr,en] [--scenes chaos,reveal,...]",
  );
  process.exit(1);
}
if (!existsSync(join(root, "content", "brands", brand, "brand.json"))) {
  console.log(`Marque introuvable : ${brand} (npm run new-brand)`);
  process.exit(1);
}
const dir = join(root, "content", "videos", id);
if (existsSync(dir)) {
  console.log(`La vidéo « ${id} » existe déjà.`);
  process.exit(1);
}
const locales = opt("--locales", "fr").split(",");
const types = opt(
  "--scenes",
  "chaos,reveal,phoneFlow,choiceCard,control,cta",
).split(",");
for (const t of types)
  if (!ARCH[t] || t.startsWith("_")) {
    console.log(
      `Type de scène inconnu : ${t} (${Object.keys(ARCH)
        .filter((k) => !k.startsWith("_"))
        .join(", ")})`,
    );
    process.exit(1);
  }

const DEFAULT = {
  chaos: { frames: 310 },
  reveal: { frames: 340 },
  phoneFlow: { frames: 370 },
  choiceCard: { frames: 340 },
  control: { frames: 310 },
  cta: { frames: 210 },
};
const DEFAULT_PROPS = {
  chaos: {},
  reveal: {
    desktopCapture: "TODO-ordinateur.png",
    mobileCapture: "TODO-mobile.png",
    highlightRow: { x: 0.245, y: 0.48, w: 0.358, h: 0.064 },
  },
  phoneFlow: { profileCapture: "TODO-mobile-profil.png", blur: null },
  choiceCard: {
    rows: [
      { total: 10, value: 4 },
      { total: 3, value: 1 },
      { total: 4, value: 2 },
    ],
    selectRow: 0,
    fillRow: 1,
    slotIndex: 1,
  },
  control: { statsValues: [50, 38, 24, 12] },
  cta: { timerPill: 2 },
};
const scenes = types.map((t, i) => ({
  type: t,
  frames: DEFAULT[t].frames,
  ...(i < types.length - 1
    ? { transitionOut: i % 2 === 0 ? "fade" : "slide" }
    : {}),
  ...(Object.keys(DEFAULT_PROPS[t]).length ? { props: DEFAULT_PROPS[t] } : {}),
}));
const video = {
  id,
  brand,
  locales,
  formats: ["16x9", "9x16"],
  transitionFrames: 10,
  scenes,
  thumbnails: {
    desktopCapture: "TODO-ordinateur.png",
    mobileCapture: "TODO-mobile.png",
  },
};

// Squelette de textes : toutes les clés attendues par les types de scènes choisis, valeur « TODO »
const setPath = (tree, path, sample) => {
  const parts = path.split(".");
  let node = tree;
  parts.forEach((part, i) => {
    const m = /^([^\[]+)((?:\[\])*)$/.exec(part);
    const key = m[1],
      depth = m[2].length / 2;
    const last = i === parts.length - 1;
    if (depth === 0) {
      if (last) node[key] = sample;
      else node = node[key] ??= {};
      return;
    }
    // tableau (de tableaux) : 3 éléments d'exemple
    node[key] ??= Array.from({ length: depth === 2 ? 4 : 3 }, () =>
      depth === 2
        ? Array.from({ length: 3 }, () => "TODO")
        : last
          ? sample
          : {},
    );
    if (!last) {
      node = node[key];
      /* éléments objets : on remplit chacun */ const rest = parts
        .slice(i + 1)
        .join(".");
      node.forEach((el) => setPath(el, rest, sample));
      node = {};
    }
  });
};
const skeleton = () => {
  const copy = {};
  for (const t of types) {
    const tree = {};
    for (const p of ARCH[t].copy) setPath(tree, p, "TODO");
    copy[t] = tree;
  }
  copy.thumbnail = {
    lines: ["TODO", "TODO", "TODO"],
    highlight: "TODO",
    badge: "TODO",
  };
  return copy;
};

mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "video.json"), JSON.stringify(video, null, 2) + "\n");
for (const l of locales)
  writeFileSync(
    join(dir, `copy.${l}.json`),
    JSON.stringify(skeleton(), null, 2) + "\n",
  );
writeFileSync(
  join(dir, "brief.md"),
  `# Brief : ${id}

> Remplir ce brief, puis demander à l'IA d'écrire le script (voir docs/00-workflow.md).

## Produit
- Nom, une phrase de description :
- Ce que le produit remplace aujourd'hui (la douleur concrète) :

## Cible
- Qui regarde la vidéo (rôle, contexte, niveau technique) :
- Ce qui lui manque le plus (temps, argent, sérénité…) :

## Message unique
> (une seule phrase)

## Trois preuves (dans l'ordre)
1.
2.
3.

## Appel à l'action
- Bouton :
- Affirmations commerciales **confirmées** (à reporter dans brand.json > claims.allowed) :
- URL :

## Contraintes
- Langues : ${locales.join(", ")}
- Formats : 16:9, 9:16
- Ton :
- À ne jamais dire :

## Visuels
- Écrans du produit disponibles (voir captures-needed.md) :
- Compte de démonstration disponible : oui / non
`,
);
mkdirSync(join(root, "public", "videos", id, "captures"), { recursive: true });
mkdirSync(join(root, "public", "videos", id, "audio"), { recursive: true });
console.log(
  `vidéo créée : content/videos/${id}/ (video.json, brief.md, ${locales.map((l) => `copy.${l}.json`).join(", ")})`,
);
console.log(`Dossiers prêts : public/videos/${id}/captures/ et audio/`);
console.log(
  "Étapes suivantes : remplir brief.md, écrire les textes (remplacer les « TODO »), npm run capture-guide, déposer les captures, npm run validate.",
);
