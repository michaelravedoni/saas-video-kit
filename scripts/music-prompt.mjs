// Génère le prompt de musique d'une vidéo, minuté sur son storyboard.
//   npm run music-prompt -- demo
// Écrit content/videos/<vidéo>/music-prompt.md (à copier dans Gemini/Lyria, Suno, Udio, ElevenLabs Music…).
// Les minutages viennent de video.json (durées des scènes, transitions) et des repères d'animation de chaque
// type de scène (src/engine/archetypes.json) : si on change la vidéo, on relance et le prompt suit.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { ARCH, FPS, fmt, loadVideo, root, timeline } from "./lib/timeline.mjs";

const id = process.argv[2];
if (!id) {
  console.log("Usage : npm run music-prompt -- <vidéo>");
  process.exit(1);
}
const { video, brand } = loadVideo(id);
const ROLES = ARCH._music.roles;
const { scenes, total, drop } = timeline(video);
const dur = (sec) => `${sec.toFixed(1)} s`;

// Sections : scènes consécutives de même rôle fusionnées
const sections = [];
for (const sc of scenes) {
  const last = sections[sections.length - 1];
  if (last && last.role === sc.role) {
    last.end = sc.end;
    last.events.push(...sc.events);
    last.types.push(sc.type);
  } else
    sections.push({
      role: sc.role,
      start: sc.start,
      end: sc.end,
      events: [...sc.events],
      types: [sc.type],
    });
}
sections[sections.length - 1].end = total;

// BPM : celui pour lequel le drop tombe le plus près d'un début de mesure (4 temps)
let bpm = 120;
if (drop) {
  let best = Infinity;
  for (let b = 100; b <= 128; b++) {
    const bars = (drop * b) / 60 / 4;
    const score =
      Math.abs(bars - Math.round(bars)) + Math.abs(b - 118) * 0.0004;
    if (score < best) {
      best = score;
      bpm = b;
    }
  }
}
const barSec = (60 / bpm) * 4;
const dropBars = drop ? drop / barSec : null;

const fadeOutSec = (video.music?.fadeOutFrames ?? 30) / FPS;
const style =
  brand.music?.style ?? "modern, clean, warm, human, quietly confident";
const avoid =
  brand.music?.avoid ??
  "vocals, cheesy corporate sound, aggressive EDM, long intros, abrupt endings";

// ── Rédaction ───────────────────────────────────────────────────────────────
const eventLines = (events, offset = 0) =>
  events
    .filter((e) => e.t - offset >= -0.001)
    .map(
      (e) =>
        `  - ${fmt(e.t - offset)} ${e.kind === "end" ? "(END)" : e.kind === "hit" ? "(hit)" : "(small accent)"} : ${e.label}`,
    )
    .join("\n");

const sectionBlock = (s, offset = 0, titleFn) =>
  `${fmt(Math.max(s.start - offset, 0))} – ${fmt(s.end - offset)} — ${titleFn(s)}\n${ROLES[s.role]}\nSync points:\n${eventLines(s.events, offset)}`;
const title = (s) =>
  ({
    tension: "TENSION (the chaos)",
    release: "RELEASE (the solution)",
    groove: "GROOVE (the proof)",
    build: "BUILD (control and confidence)",
    resolution: "RESOLUTION (call to action)",
  })[s.role];

const global = `GLOBAL SETTINGS
- Instrumental only. No vocals, no spoken words, no lyrics.
- Style: ${style}.
- Tempo: ${bpm} BPM, 4/4, constant throughout${dropBars ? ` (so ${fmt(drop)} falls on bar ${dropBars.toFixed(1)}: bars are ${barSec.toFixed(2)} s long)` : ""}.
- Key: a bright major key for the release and after; the first section may feel minor or suspended.
- Avoid: ${avoid}.
- Mix: clean, modern, not too loud, no heavy bass that would mask sound effects; leave room in the mid frequencies.`;

const optionA = `Compose an instrumental music track, exactly ${total.toFixed(1)} seconds long, for a modern SaaS product video (${brand.name}).

${global}
- Length: ${total.toFixed(1)} seconds exactly. Natural ${fadeOutSec.toFixed(0)}-second fade out at the very end (${fmt(total - fadeOutSec)} to ${fmt(total)}). No long silence at the start or end.

STRUCTURE (timestamps in seconds from the start)

${sections.map((s) => sectionBlock(s, 0, title)).join("\n\n")}
${
  drop
    ? `
THE DROP / RELEASE (the most important moment)
Just before ${fmt(drop)}, cut everything to near-silence for about 0.3 seconds (a breath), then at exactly ${fmt(drop)} a bright, clean release arrives: a soft impact plus a warm chord, as if light floods the room. From dark to light in one beat.`
    : ""
}`;

const first = sections[0];
const partA = drop
  ? `Instrumental, ${drop.toFixed(1)} seconds, ${bpm} BPM. ${ROLES.tension}
Sync points (seconds from the start):
${eventLines(first.events)}
From ${fmt(drop - 2)} to ${fmt(drop - 0.3)}, a short accelerating riser (white-noise sweep, denser pulse). It ends abruptly (cut to near-silence) at exactly ${fmt(drop - 0.3)}. No vocals, no warm chords, no melody.
Overall style of the project: ${style}. Avoid: ${avoid}.`
  : null;

const rest = sections.filter((s) => s.start >= (drop ?? 0) - 0.001);
const partB = drop
  ? `Instrumental, ${(total - drop).toFixed(1)} seconds, ${bpm} BPM, bright major key. It starts immediately with a warm, bright release on the very first beat (soft impact plus warm chord, as if light floods in), no intro.
${rest.map((s) => sectionBlock({ ...s, start: s.start }, drop, title)).join("\n\n")}
Style: ${style}. Natural ${fadeOutSec.toFixed(0)}-second fade out at the end. Avoid: ${avoid}.`
  : null;

const md = `# Prompt de musique : ${video.id}

Généré par \`npm run music-prompt -- ${video.id}\` à partir de \`video.json\` et des repères des scènes. **Ne pas modifier à la main** : relancer la commande après tout changement de durée ou de scène.

## Chiffres clés

| | |
|---|---|
| Durée de la vidéo | **${dur(total)}** (${Math.round(total * FPS)} images à ${FPS} fps) |
| Tempo conseillé | **${bpm} BPM** |
| ${drop ? "Moment de bascule (« drop »)" : "Bascule"} | ${drop ? `**${fmt(drop)}** = mesure ${dropBars.toFixed(1)} à ${bpm} BPM` : "aucune (pas de scène de tension suivie d'une scène de soulagement)"} |
| Fin de la musique | fondu de ${fadeOutSec.toFixed(0)} s, de ${fmt(total - fadeOutSec)} à ${fmt(total)} |

## Découpage de la vidéo

| Temps | Scène | Rôle musical |
|---|---|---|
${scenes.map((s) => `| ${fmt(s.start)} – ${fmt(s.end)} | ${s.type} | ${s.role} |`).join("\n")}

## Option A : un seul morceau (copier-coller)

Les modèles de musique respectent mal les minutages précis : si le résultat est décalé, passer à l'option B.

\`\`\`
${optionA}
\`\`\`
${
  drop
    ? `
## Option B : deux morceaux (recommandé), raccordés à ${fmt(drop)} par \`npm run mix-music\`

**Morceau 1 : la tension (${drop.toFixed(1)} s)**

\`\`\`
${partA}
\`\`\`

**Morceau 2 : la libération (${(total - drop).toFixed(1)} s)**

\`\`\`
${partB}
\`\`\`
`
    : ""
}
## Ensuite

1. Déposer le fichier dans \`public/videos/${video.id}/audio/\` (par exemple \`music.mp3\`).
2. \`npm run mix-music -- ${video.id} public/videos/${video.id}/audio/<fichier>\` : vérifie le calage de la cassure, la durée et le niveau sonore, et recommande le réglage \`music.volume\` de \`video.json\`.
3. Écouter les 10 premières secondes et le moment de bascule : aucun outil ne remplace l'oreille.
`;

const out = join(root, "content", "videos", id, "music-prompt.md");
writeFileSync(out, md);
console.log(`prompt écrit : content/videos/${id}/music-prompt.md`);
console.log(
  `durée ${dur(total)} · ${bpm} BPM${drop ? ` · bascule à ${fmt(drop)} (mesure ${dropBars.toFixed(1)})` : ""}`,
);
