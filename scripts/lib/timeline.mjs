// Minutage d'une vidéo (partagé par music-prompt.mjs et mix-music.mjs) : mêmes règles que src/engine/video.ts.
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const FPS = 30;
export const read = (p) => JSON.parse(readFileSync(p, "utf-8"));
export const ARCH = read(join(root, "src", "engine", "archetypes.json"));

export const loadVideo = (id) => {
  const p = join(root, "content", "videos", id, "video.json");
  if (!existsSync(p)) throw new Error(`Vidéo introuvable : ${id}`);
  const video = read(p);
  const brand = read(
    join(root, "content", "brands", video.brand, "brand.json"),
  );
  return { video, brand, path: p };
};

export const timeline = (video) => {
  const overlap = video.transitionFrames;
  const starts = [];
  let cursor = 0;
  for (const sc of video.scenes) {
    starts.push(cursor);
    cursor += sc.frames - (sc.transitionOut ? overlap : 0);
  }
  const totalFrames =
    video.scenes.reduce((a, s) => a + s.frames, 0) -
    video.scenes.filter((s) => s.transitionOut).length * overlap;
  const total = totalFrames / FPS;
  const scenes = video.scenes.map((sc, i) => {
    const man =
      sc.type === "custom"
        ? { cues: {}, music: { role: sc.musicRole ?? "groove", events: [] } }
        : ARCH[sc.type];
    const cues = { ...man.cues, ...(sc.cues ?? {}) };
    const start = starts[i] / FPS;
    const end =
      (i + 1 < video.scenes.length ? starts[i + 1] : starts[i] + sc.frames) /
      FPS;
    const events = man.music.events
      .map((e) => {
        const v = cues[e.cue];
        const f = Array.isArray(v) ? (e.edge === "end" ? v[1] : v[0]) : v;
        return { t: start + f / FPS, kind: e.kind, label: e.label };
      })
      .sort((a, b) => a.t - b.t);
    return { type: sc.type, role: man.music.role, start, end, events };
  });
  // « Drop » : début de la première scène de soulagement qui suit une scène de tension
  let drop = null;
  for (let i = 1; i < scenes.length; i++)
    if (scenes[i].role === "release" && scenes[i - 1].role === "tension") {
      drop = scenes[i].start;
      break;
    }
  return { scenes, total, totalFrames, drop };
};

export const fmt = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, "0")}`;
};
