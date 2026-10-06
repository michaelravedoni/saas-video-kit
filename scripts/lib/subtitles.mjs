// Sous-titres : calcul des répliques (début, fin, texte) et formats SRT / WebVTT.
// Module sans dépendance (ni fs ni React) : partagé par scripts/subtitles.mjs, le validateur et la surcouche
// d'incrustation (src/components/Subtitles.tsx).
//
// Deux sources :
//   "auto" : les textes à l'écran de chaque scène, avec le minutage de leurs repères d'animation
//            (accessibilité et référencement : fichier de sous-titres à téléverser avec la vidéo) ;
//   "copy" : un script de narration écrit dans copy.<langue>.json, clé « subtitles » :
//            [{ "from": 1.5, "to": 4, "text": "…" }]  (secondes depuis le début de la vidéo).
// Si source = "copy" ou si la clé « subtitles » existe, la narration écrite prime sur le mode automatique.

const MIN_DURATION = 0.8; // secondes
const GAP = 0.04;

const sceneStarts = (video, fps) => {
  const starts = [];
  let cursor = 0;
  for (const sc of video.scenes) {
    starts.push(cursor / fps);
    cursor += sc.frames - (sc.transitionOut ? video.transitionFrames : 0);
  }
  return starts;
};

export const buildSubtitles = ({
  video,
  copyTree,
  archetypes,
  fps = 30,
  source,
}) => {
  const mode = source ?? video.subtitles?.source ?? "auto";
  let cues = [];
  if (
    (mode === "copy" ||
      (mode !== "auto" && Array.isArray(copyTree.subtitles))) &&
    Array.isArray(copyTree.subtitles)
  ) {
    cues = copyTree.subtitles.map((c) => ({
      start: Number(c.from),
      end: Number(c.to),
      text: String(c.text),
    }));
  } else {
    const starts = sceneStarts(video, fps);
    video.scenes.forEach((sc, i) => {
      const man =
        sc.type === "custom"
          ? { cues: {}, textCues: sc.textCues ?? {} }
          : archetypes[sc.type];
      const sceneCopy =
        copyTree[sc.id ?? (sc.type === "custom" ? sc.name : sc.type)];
      if (!man || !sceneCopy) return;
      const sceneCues = { ...man.cues, ...(sc.cues ?? {}) };
      for (const [copyKey, cueName] of Object.entries(man.textCues)) {
        const text = sceneCopy[copyKey];
        const cue = sceneCues[cueName];
        if (typeof text !== "string" || !Array.isArray(cue)) continue;
        cues.push({
          start: starts[i] + cue[0] / fps,
          end: starts[i] + cue[1] / fps,
          text,
        });
      }
    });
  }
  cues.sort((a, b) => a.start - b.start);
  // Pas de chevauchement ; durée minimale ; on écarte ce qui est vide ou négatif
  const out = [];
  for (let i = 0; i < cues.length; i++) {
    const c = { ...cues[i] };
    const next = cues[i + 1];
    if (next && c.end > next.start - GAP) c.end = next.start - GAP;
    if (!(c.end - c.start >= MIN_DURATION * 0.5) || !c.text.trim()) continue;
    out.push(c);
  }
  return out;
};

/** Texte brut pour SRT/VTT : « · » → espace, « ·· » → point médian, apostrophe typographique. */
export const plainText = (s) =>
  s
    .replace(/··/g, "\u0000")
    .replace(/·/g, " ")
    .replace(/\u0000/g, "·")
    .replace(/'/g, "’");

const pad = (n, w = 2) => String(n).padStart(w, "0");
const stamp = (sec, sep) => {
  const ms = Math.round(sec * 1000);
  const h = Math.floor(ms / 3600000),
    m = Math.floor((ms % 3600000) / 60000),
    s = Math.floor((ms % 60000) / 1000),
    r = ms % 1000;
  return `${pad(h)}:${pad(m)}:${pad(s)}${sep}${pad(r, 3)}`;
};

export const toSrt = (cues, text = plainText) =>
  cues
    .map(
      (c, i) =>
        `${i + 1}\n${stamp(c.start, ",")} --> ${stamp(c.end, ",")}\n${text(c.text)}\n`,
    )
    .join("\n");

export const toVtt = (cues, text = plainText) =>
  "WEBVTT\n\n" +
  cues
    .map(
      (c) =>
        `${stamp(c.start, ".")} --> ${stamp(c.end, ".")}\n${text(c.text)}\n`,
    )
    .join("\n");
