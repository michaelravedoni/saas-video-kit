// Contrôle (et prépare) la musique d'une vidéo.
//   npm run mix-music -- <vidéo> <fichier audio> [--apply] [--write] [--target -14] [--drop <secondes>]
//
//   sans option : ANALYSE seulement (rien n'est modifié)
//   --apply     : écrit public/videos/<vidéo>/audio/music.mp3, recalé (début coupé ou décalé) et coupé à la durée
//   --write     : met à jour video.json (music.file, music.volume)
//
// Contrôles : position de la cassure (le « souffle » puis le coup juste avant la bascule du storyboard),
// durée par rapport à la vidéo, niveau sonore (LUFS) et pic, puis réglage de volume recommandé.
// Aucun outil ne remplace l'oreille : écouter les 10 premières secondes et le moment de bascule.
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  unlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fmt, loadVideo, root, timeline } from "./lib/timeline.mjs";

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => {
  const i = args.indexOf(n);
  return i >= 0 ? Number(args[i + 1]) : d;
};
const positional = args.filter(
  (a, i) =>
    !a.startsWith("--") &&
    !(i > 0 && ["--target", "--drop"].includes(args[i - 1])),
);
const [id, input] = positional;
if (!id || !input) {
  console.log(
    "Usage : npm run mix-music -- <vidéo> <fichier audio> [--apply] [--write] [--target -14] [--drop <s>]",
  );
  process.exit(1);
}
const inPath = resolve(input);
if (!existsSync(inPath)) {
  console.log(`Fichier introuvable : ${inPath}`);
  process.exit(1);
}

const { video, path: videoPath } = loadVideo(id);
const { total, drop: planDrop } = timeline(video);
const drop = opt("--drop", planDrop);
const TARGET_LUFS = opt("--target", -14);
const TP_MAX = -1.5;
const HIT_OFFSET = 0.15; // le coup musical doit tomber un peu après le début de la bascule (flash blanc)
const TOLERANCE = 0.35;

const ffmpeg = (argv, opts = {}) =>
  spawnSync("npx", ["remotion", "ffmpeg", ...argv], {
    cwd: root,
    maxBuffer: 256 * 1024 * 1024,
    ...opts,
  });

// ── Durée du fichier ────────────────────────────────────────────────────────
const probe = ffmpeg(["-i", inPath, "-f", "null", "-"], { encoding: "utf-8" });
const dm = /Duration: (\d+):(\d+):([\d.]+)/.exec(probe.stderr ?? "");
if (!dm) {
  console.log("Impossible de lire ce fichier audio.");
  process.exit(1);
}
const audioDur = Number(dm[1]) * 3600 + Number(dm[2]) * 60 + Number(dm[3]);

// ── Enveloppe d'énergie (mono, 8 kHz, fenêtres de 20 ms) ────────────────────
const tmpWav = join(tmpdir(), `mix-music-${process.pid}.wav`);
const raw = ffmpeg(
  ["-y", "-i", inPath, "-ac", "1", "-ar", "8000", "-c:a", "pcm_s16le", tmpWav],
  { encoding: "utf-8" },
);
if (raw.status !== 0 || !existsSync(tmpWav)) {
  console.log("Décodage impossible.");
  process.exit(1);
}
const wav = readFileSync(tmpWav);
unlinkSync(tmpWav);
const dataAt = wav.indexOf("data") + 8; // fin de l'en-tête WAV : 4 octets « data » + 4 octets de taille
const pcm = wav.subarray(dataAt);
const samples = new Int16Array(
  pcm.buffer.slice(
    pcm.byteOffset,
    pcm.byteOffset + pcm.length - (pcm.length % 2),
  ),
);
const SR = 8000,
  WIN = Math.round(SR * 0.02);
const env = [];
for (let i = 0; i + WIN <= samples.length; i += WIN) {
  let sum = 0;
  for (let j = 0; j < WIN; j++) sum += samples[i + j] * samples[i + j];
  env.push(20 * Math.log10(Math.max(Math.sqrt(sum / WIN), 1) / 32768));
}
const T = (k) => k * 0.02;
const avg = (a, b) => {
  let s = 0,
    n = 0;
  for (let k = Math.max(a, 0); k < Math.min(b, env.length); k++) {
    s += env[k];
    n++;
  }
  return n ? s / n : -120;
};

// ── Cassure : un creux soudain (le « souffle »), un coup, puis un morceau plus calme ──
// Score = chute d'énergie par rapport à la demi-seconde qui précède (minimum avec la remontée qui suit)
//       + contraste entre les 2 s avant la cassure et les secondes 0,5 à 3 s après (tension → soulagement).
let breath = null,
  hit = null,
  breakScore = null;
if (drop != null) {
  const lo = Math.max(Math.round((drop - 5) / 0.02), 100),
    hi = Math.round((drop + 5) / 0.02);
  let best = -Infinity,
    bk = lo;
  for (let k = lo; k < Math.min(hi, env.length - 160); k++) {
    const dip = (env[k] + env[k + 1]) / 2;
    const before = avg(k - 25, k);
    let peak = -Infinity;
    for (let j = k + 1; j <= k + 15; j++) peak = Math.max(peak, env[j]);
    const dipScore = Math.min(before - dip, peak - dip);
    const contrast = avg(k - 100, k) - avg(k + 25, k + 150);
    const score = dipScore + Math.max(contrast, -10);
    if (score > best) {
      best = score;
      bk = k;
    }
  }
  breakScore = best;
  breath = T(bk);
  hit = breath + 0.1;
  for (let k = bk + 1; k <= bk + 15; k++)
    if (env[k] - env[bk] >= 3) {
      hit = T(k);
      break;
    }
}
const intendedHit = drop != null ? drop + HIT_OFFSET : null;
const shift = drop != null ? intendedHit - hit : 0; // > 0 : le coup arrive trop tôt (il faut retarder) ; < 0 : trop tard (couper le début)
const aligned = Math.abs(shift) <= TOLERANCE;

// ── Niveau sonore (sur la durée utile, après recalage éventuel) ─────────────
const trim = !aligned && shift < 0 ? -shift : 0; // secondes à couper au début
const delay = !aligned && shift > 0 ? shift : 0; // secondes de silence à ajouter au début
const chain = [];
if (trim) chain.push(`atrim=start=${trim.toFixed(3)}`, "asetpts=PTS-STARTPTS");
if (delay)
  chain.push(`adelay=${Math.round(delay * 1000)}|${Math.round(delay * 1000)}`);
chain.push(`atrim=end=${(total + 1).toFixed(3)}`);
const ln = ffmpeg(
  [
    "-i",
    inPath,
    "-af",
    [
      ...chain,
      `loudnorm=I=${TARGET_LUFS}:TP=${TP_MAX}:LRA=11:print_format=json`,
    ].join(","),
    "-f",
    "null",
    "-",
  ],
  { encoding: "utf-8" },
);
const jm = /\{[\s\S]*?"input_i"[\s\S]*?\}/.exec(ln.stderr ?? "");
const loud = jm ? JSON.parse(jm[0]) : null;
let volume = null,
  lufs = null,
  tp = null,
  gain = null;
if (loud) {
  lufs = Number(loud.input_i);
  tp = Number(loud.input_tp);
  gain = Math.min(TARGET_LUFS - lufs, TP_MAX - tp);
  volume = Math.min(1, Math.pow(10, gain / 20));
}

// ── Rapport ─────────────────────────────────────────────────────────────────
const ok = (b) => (b ? "✓" : "✗");
const warns = [];
console.log(`\nMusique de « ${id} » : ${inPath}\n`);
console.log(
  `Durée du fichier : ${audioDur.toFixed(1)} s · durée de la vidéo : ${total.toFixed(1)} s`,
);
if (audioDur < total + (trim ? trim : 0) - delay) {
  warns.push(
    "Le fichier est plus court que la vidéo : la musique s'arrêtera trop tôt (relancer la génération avec la bonne durée).",
  );
}
console.log(`${ok(audioDur >= total)} durée suffisante`);
if (drop != null) {
  console.log(`\nBascule du storyboard : ${fmt(drop)}`);
  console.log(
    `Souffle détecté : ${fmt(breath)} · coup détecté : ${fmt(hit)} (attendu vers ${fmt(intendedHit)})`,
  );
  console.log(
    `${ok(aligned)} cassure ${aligned ? "bien calée" : `décalée de ${Math.abs(shift).toFixed(2)} s : ${shift < 0 ? "couper le début du fichier" : "ajouter du silence au début"} (--apply le fait)`}`,
  );
  if (breakScore != null && breakScore < 8)
    warns.push(
      `Aucune cassure nette trouvée près de ${fmt(drop)} (contraste ${breakScore.toFixed(1)} dB) : la détection est peu fiable, écouter pour confirmer.`,
    );
}
if (loud) {
  console.log(
    `\nNiveau sonore : ${lufs.toFixed(1)} LUFS · pic ${tp.toFixed(1)} dBTP (cible ${TARGET_LUFS} LUFS, pic ≤ ${TP_MAX} dBTP)`,
  );
  console.log(
    `Réglage recommandé : music.volume = ${volume.toFixed(2)} (${gain.toFixed(1)} dB)`,
  );
  if (TARGET_LUFS - lufs > 0.5)
    warns.push(
      `La musique est plus faible que la cible (${lufs.toFixed(1)} LUFS) : volume plafonné à 1.`,
    );
}
for (const w of warns) console.log(`! ${w}`);

// ── Écriture ────────────────────────────────────────────────────────────────
if (flag("--apply")) {
  const outDir = join(root, "public", "videos", id, "audio");
  mkdirSync(outDir, { recursive: true });
  const out = join(outDir, "music.mp3");
  if (resolve(out) === inPath) {
    console.log(
      "\n--apply : le fichier source est déjà music.mp3 ; le renommer avant (il serait écrasé en cours de lecture).",
    );
    process.exit(1);
  }
  const r = ffmpeg(
    [
      "-y",
      "-i",
      inPath,
      "-af",
      chain.join(","),
      "-c:a",
      "libmp3lame",
      "-b:a",
      "192k",
      out,
    ],
    { encoding: "utf-8" },
  );
  if (r.status !== 0) {
    console.log("Écriture impossible :\n" + r.stderr);
    process.exit(1);
  }
  console.log(
    `\nÉcrit : public/videos/${id}/audio/music.mp3 (${trim ? `début coupé de ${trim.toFixed(2)} s` : delay ? `silence de ${delay.toFixed(2)} s ajouté` : "sans recalage"}, durée ≤ ${(total + 1).toFixed(1)} s)`,
  );
}
if (flag("--write")) {
  const v = JSON.parse(readFileSync(videoPath, "utf-8"));
  v.music = {
    file: "audio/music.mp3",
    volume: Number(volume?.toFixed(2) ?? 0.75),
    fadeInFrames: v.music?.fadeInFrames ?? 6,
    fadeOutFrames: v.music?.fadeOutFrames ?? 30,
  };
  writeFileSync(videoPath, JSON.stringify(v, null, 2) + "\n");
  console.log(`video.json mis à jour : music.volume = ${v.music.volume}`);
}
if (!flag("--apply") && !flag("--write"))
  console.log(
    "\n(analyse seulement : rien n'a été modifié ; --apply écrit le fichier recalé, --write met à jour video.json)",
  );
