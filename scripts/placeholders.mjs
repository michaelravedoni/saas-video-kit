// Crée des captures de REMPLACEMENT (maquettes fil de fer, badge « PLACEHOLDER ») pour les captures manquantes
// d'une vidéo, et le logo de la marque s'il manque. Sert à prévisualiser toute la chaîne avant les vraies captures.
//   npm run placeholders -- <vidéo> [--force]
// Les fichiers créés sont listés dans public/videos/<vidéo>/captures/.placeholders.json : le validateur avertit
// tant qu'une capture de remplacement est utilisée.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadVideo, root } from "./lib/timeline.mjs";

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
if (!id) {
  console.log("Usage : npm run placeholders -- <vidéo> [--force]");
  process.exit(1);
}
const force = args.includes("--force");
const { video, brand } = loadVideo(id);
spawnSync("node", ["scripts/build-registry.mjs"], { cwd: root });

const names = new Set();
const collect = (v) => {
  if (typeof v === "string") names.add(v);
  else if (v && typeof v === "object")
    Object.values(v).forEach((x) => names.add(x));
};
for (const sc of video.scenes)
  for (const [k, v] of Object.entries(sc.props ?? {}))
    if (/Capture$/.test(k)) collect(v);
if (video.thumbnails) {
  collect(video.thumbnails.desktopCapture);
  collect(video.thumbnails.mobileCapture);
}

const dir = join(root, "public", "videos", id, "captures");
mkdirSync(dir, { recursive: true });
const markerPath = join(dir, ".placeholders.json");
const marker = existsSync(markerPath)
  ? JSON.parse(readFileSync(markerPath, "utf-8"))
  : [];
const props = JSON.stringify({ videoId: id, locale: video.locales[0] });

const render = (comp, out, extra = []) =>
  spawnSync(
    "npx",
    ["remotion", "still", comp, out, `--props=${props}`, ...extra],
    { cwd: root, stdio: "inherit" },
  ).status === 0;

let made = 0;
for (const name of names) {
  const out = join(dir, name);
  if (existsSync(out) && !force) continue;
  const mobile = /mobile|mobil|phone|profil|profile/i.test(name);
  console.log(`▶ ${name} (${mobile ? "mobile" : "ordinateur"})`);
  if (
    render(mobile ? "placeholder-mobile" : "placeholder-desktop", out, [
      "--scale=2",
    ])
  ) {
    made++;
    if (!marker.includes(name)) marker.push(name);
  }
}
writeFileSync(markerPath, JSON.stringify(marker, null, 2) + "\n");

const logo = join(root, "public", brand.logo.file);
if (!existsSync(logo) || force) {
  mkdirSync(join(logo, ".."), { recursive: true });
  console.log("▶ logo (nom de la marque en texte)");
  if (render("placeholder-logo", logo, ["--image-format=png"])) made++;
}
console.log(
  `\n${made} fichier(s) de remplacement créé(s). À remplacer par les vraies captures avant la publication.`,
);
