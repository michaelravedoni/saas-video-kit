// Rend toutes les versions d'une vidéo : langues × formats × (avec musique / muet) + miniatures,
// puis contrôle chaque fichier (durée, résolution, piste audio, niveau sonore).
//   npm run render-all -- demo
//   npm run render-all -- demo --locale fr --format 9x16 --variants music --skip-thumbnails
//   npm run render-all -- demo --variants music,muted,subtitled   (version sous-titrée si video.json > subtitles)
//   npm run render-all -- demo --dry-run        (affiche les commandes sans rien rendre)
// Sorties : out/<vidéo>/<langue>/<vidéo>-<langue>-<format>[-musique].mp4 et miniature-youtube.png / miniature-shorts.png
import { spawnSync } from "node:child_process";
import { mkdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { FPS, loadVideo, root, timeline } from "./lib/timeline.mjs";

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
if (!id) {
  console.log(
    "Usage : npm run render-all -- <vidéo> [--locale fr,en] [--format 16x9,9x16] [--variants music,muted] [--skip-thumbnails] [--dry-run]",
  );
  process.exit(1);
}
const opt = (n) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : null;
};
const dry = args.includes("--dry-run");

const { video } = loadVideo(id);
const locales = opt("--locale")?.split(",") ?? video.locales;
const formats = opt("--format")?.split(",") ?? video.formats;
const wanted = opt("--variants")?.split(",") ?? ["music", "muted"];
const variants = [];
if (wanted.includes("music") && video.music) variants.push("music");
if (wanted.includes("muted")) variants.push("muted");
if (wanted.includes("subtitled") && video.subtitles) variants.push("subtitled");
const { totalFrames } = timeline(video);
const SIZE = { "16x9": [1920, 1080], "9x16": [1080, 1920] };

const run = (cmd, argv, label) => {
  console.log(`\n▶ ${label}\n  ${cmd} ${argv.join(" ")}`);
  if (dry) return true;
  const r = spawnSync(cmd, argv, { cwd: root, stdio: "inherit" });
  return r.status === 0;
};

// 1) Validation et registre
if (!run("node", ["scripts/validate.mjs", id], "validation")) {
  console.log("\nValidation en échec : rien n'a été rendu.");
  process.exit(1);
}
run("node", ["scripts/build-registry.mjs"], "registre");

const results = [];

// 2) Vidéos
for (const locale of locales) {
  const dir = join(root, "out", id, locale);
  if (!dry) mkdirSync(dir, { recursive: true });
  for (const format of formats) {
    for (const variant of variants) {
      const comp = `${id}-${locale}-${format}${variant === "music" ? "-musique" : ""}${variant === "subtitled" ? (video.music ? "-musique-st" : "-st") : ""}`;
      const out = join(dir, `${comp}.mp4`);
      const ok = run(
        "npx",
        [
          "remotion",
          "render",
          comp,
          out,
          "--codec",
          "h264",
          "--crf",
          "16",
          ...(variant === "muted" || (variant === "subtitled" && !video.music)
            ? ["--muted"]
            : []),
        ],
        `rendu ${comp}`,
      );
      results.push({ kind: "vidéo", comp, out, ok, variant, format });
    }
  }
}

// 2 bis) Fichiers de sous-titres (SRT, WebVTT) si video.json > subtitles
if (video.subtitles)
  run(
    "node",
    ["scripts/subtitles.mjs", id, "--locale", locales.join(",")],
    "sous-titres (SRT, VTT)",
  );

// 3) Miniatures
if (!args.includes("--skip-thumbnails") && video.thumbnails) {
  for (const locale of locales) {
    const dir = join(root, "out", id, locale);
    for (const kind of ["youtube", "shorts"]) {
      const comp = `${id}-${locale}-miniature-${kind}`;
      const out = join(dir, `miniature-${kind}.png`);
      const ok = run(
        "npx",
        ["remotion", "still", comp, out],
        `miniature ${comp}`,
      );
      results.push({
        kind: "miniature",
        comp,
        out,
        ok,
        format: kind === "shorts" ? "9x16" : "16x9",
      });
    }
  }
}

if (dry) {
  console.log("\n(simulation : rien n'a été rendu)");
  process.exit(0);
}

// 4) Contrôles
const ffmpeg = (argv) =>
  spawnSync("npx", ["remotion", "ffmpeg", ...argv], {
    cwd: root,
    encoding: "utf-8",
    maxBuffer: 64 * 1024 * 1024,
  });
const probe = (file) => {
  const r = ffmpeg(["-i", file, "-f", "null", "-"]);
  const t = r.stderr ?? "";
  const d = /Duration: (\d+):(\d+):([\d.]+)/.exec(t);
  const dim = /Video:.*?, (\d{3,5})x(\d{3,5})/.exec(t);
  return {
    duration: d ? Number(d[1]) * 3600 + Number(d[2]) * 60 + Number(d[3]) : null,
    w: dim ? Number(dim[1]) : null,
    h: dim ? Number(dim[2]) : null,
    audio: /Audio:/.test(t),
  };
};
const loudness = (file) => {
  const r = ffmpeg([
    "-i",
    file,
    "-af",
    "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json",
    "-vn",
    "-f",
    "null",
    "-",
  ]);
  const m = /\{[\s\S]*?"input_i"[\s\S]*?\}/.exec(r.stderr ?? "");
  return m
    ? {
        i: Number(JSON.parse(m[0]).input_i),
        tp: Number(JSON.parse(m[0]).input_tp),
      }
    : null;
};

console.log("\n══ Contrôles ══");
let failures = 0;
for (const r of results) {
  const problems = [];
  if (!r.ok || !existsSync(r.out)) problems.push("rendu échoué");
  else if (r.kind === "vidéo") {
    const p = probe(r.out);
    const [w, h] = SIZE[r.format];
    if (p.w !== w || p.h !== h)
      problems.push(`résolution ${p.w}×${p.h} (attendu ${w}×${h})`);
    const expected = totalFrames / FPS;
    if (p.duration == null || Math.abs(p.duration - expected) > 0.2)
      problems.push(
        `durée ${p.duration?.toFixed(2)} s (attendu ${expected.toFixed(2)} s)`,
      );
    if (r.variant === "music" || (r.variant === "subtitled" && video.music)) {
      if (!p.audio) problems.push("pas de piste audio");
      else {
        const l = loudness(r.out);
        if (l && (l.i < -16 || l.i > -12))
          problems.push(`niveau ${l.i.toFixed(1)} LUFS (attendu −16 à −12)`);
        if (l && l.tp > -1) problems.push(`pic ${l.tp.toFixed(1)} dBTP (> −1)`);
        if (l) r.note = `${l.i.toFixed(1)} LUFS · ${l.tp.toFixed(1)} dBTP`;
      }
    } else if (p.audio)
      problems.push("piste audio présente dans une version muette");
  } else {
    const size = statSync(r.out).size;
    if (size > 2 * 1024 * 1024)
      problems.push(
        `${(size / 1024 / 1024).toFixed(1)} Mo (YouTube accepte 2 Mo maximum)`,
      );
    r.note = `${(size / 1024).toFixed(0)} Ko`;
  }
  if (problems.length) failures++;
  console.log(
    `${problems.length ? "✗" : "✓"} ${r.comp}${r.note ? "  (" + r.note + ")" : ""}${problems.length ? "\n    → " + problems.join("\n    → ") : ""}`,
  );
}
console.log(
  `\n${results.length - failures}/${results.length} fichier(s) conformes. Sorties dans out/${id}/`,
);
process.exit(failures ? 1 : 0);
