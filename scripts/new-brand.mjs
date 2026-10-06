// Crée une marque à partir d'une couleur principale.
//   npm run new-brand -- acme --name "Acme" --primary "#E4572E" [--font Poppins] [--flag CH]
// Écrit content/brands/<id>/brand.json (palette dérivée de la couleur principale) et prépare public/brands/<id>/.
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { root } from "./lib/timeline.mjs";

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
const opt = (n, d) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : d;
};
if (!id || !/^[a-z0-9-]+$/.test(id)) {
  console.log(
    'Usage : npm run new-brand -- <id> --name "Nom" --primary "#RRGGBB" [--font Inter] [--flag CH]\n(id en minuscules, chiffres et tirets)',
  );
  process.exit(1);
}
const primary = opt("--primary", "#1058C8");
if (!/^#[0-9a-fA-F]{6}$/.test(primary)) {
  console.log("--primary doit être au format #RRGGBB");
  process.exit(1);
}
const dir = join(root, "content", "brands", id);
if (existsSync(dir)) {
  console.log(`La marque « ${id} » existe déjà.`);
  process.exit(1);
}

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c) =>
  "#" +
  c
    .map((v) =>
      Math.round(Math.max(0, Math.min(255, v)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")
    .toUpperCase();
const mix = (h, other, t) =>
  hex(rgb(h).map((v, i) => v * (1 - t) + rgb(other)[i] * t));

const brand = {
  id,
  name: opt("--name", id),
  font: opt("--font", "Inter"),
  ...(opt("--flag", null) ? { flag: opt("--flag") } : {}),
  logo: { file: `brands/${id}/logo.png`, width: 500, height: 166 },
  colors: {
    blue: primary.toUpperCase(),
    blueDeep: mix(primary, "#000000", 0.25),
    blueLogo: mix(primary, "#000000", 0.15),
    blueTint: mix(primary, "#FFFFFF", 0.9),
    blueMid: mix(primary, "#FFFFFF", 0.78),
    bg: "#F9FAFB",
    white: "#FFFFFF",
    ink: "#0F172A",
    gray: "#6B7280",
    line: "#E5E7EB",
    success: "#16A34A",
    successTint: "#DCFCE7",
    danger: "#DC2626",
    dangerTint: "#FEE2E2",
    night: "#0A1A3A",
    nightDeep: "#050D1F",
    blueOnNight: mix(primary, "#FFFFFF", 0.45),
  },
  claims: { allowed: [], forbiddenWords: [] },
  tone: "TODO : décrire le ton (ex. chaleureux, concret, direct ; sans jargon).",
  music: {
    style:
      "modern tech-product launch music, light electronic-pop with organic touches (piano, plucks, soft percussion), clean sound design, warm, human, quietly confident",
    avoid:
      "vocals, choirs, spoken voice, cheesy corporate sound, aggressive EDM, heavy distortion, long intros, abrupt endings",
  },
};
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "brand.json"), JSON.stringify(brand, null, 2) + "\n");
mkdirSync(join(root, "public", "brands", id), { recursive: true });
console.log(`marque créée : content/brands/${id}/brand.json`);
console.log(
  `À faire : déposer le logo dans public/brands/${id}/logo.png (et ajuster logo.width/height dans brand.json),`,
);
console.log(
  "relire les couleurs dérivées, compléter claims.allowed (affirmations autorisées) et claims.forbiddenWords.",
);
console.log(
  "Si la scène « chaos » (sombre) est utilisée : le logo ne doit pas être affiché sur fond sombre.",
);
