// Écrit les fichiers de sous-titres (SRT et WebVTT) d'une vidéo, pour chaque langue.
//   npm run subtitles -- demo [--locale fr] [--source auto|copy]
// Sorties : out/<vidéo>/<langue>/<vidéo>-<langue>.srt et .vtt (à téléverser avec la vidéo sur YouTube, etc.)
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ARCH, loadVideo, root } from "./lib/timeline.mjs";
import { buildSubtitles, toSrt, toVtt } from "./lib/subtitles.mjs";

const args = process.argv.slice(2);
const id = args.find(
  (a) =>
    !a.startsWith("--") &&
    args[args.indexOf(a) - 1] !== "--locale" &&
    args[args.indexOf(a) - 1] !== "--source",
);
const opt = (n) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : null;
};
if (!id) {
  console.log(
    "Usage : npm run subtitles -- <vidéo> [--locale fr,en] [--source auto|copy]",
  );
  process.exit(1);
}
const { video } = loadVideo(id);
const locales = opt("--locale")?.split(",") ?? video.locales;
const source = opt("--source") ?? video.subtitles?.source ?? "auto";

for (const locale of locales) {
  const p = join(root, "content", "videos", id, `copy.${locale}.json`);
  if (!existsSync(p)) {
    console.log(`copy.${locale}.json introuvable`);
    process.exit(1);
  }
  const copyTree = JSON.parse(readFileSync(p, "utf-8"));
  const cues = buildSubtitles({ video, copyTree, archetypes: ARCH, source });
  const dir = join(root, "out", id, locale);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${id}-${locale}.srt`), toSrt(cues));
  writeFileSync(join(dir, `${id}-${locale}.vtt`), toVtt(cues));
  console.log(
    `✓ ${locale} : ${cues.length} sous-titre(s) (source ${source}) → out/${id}/${locale}/${id}-${locale}.srt / .vtt`,
  );
}
