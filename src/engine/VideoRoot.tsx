import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate } from "remotion";
import { REGISTRY } from "../generated/registry";
import { setActive } from "./active";
import { musicFile } from "./assets";
import { Subtitles } from "../components/Subtitles";
import { resolveScene } from "./scenes";
import { SceneProvider } from "./scene";
import { Timeline } from "./Timeline";
import { totalFrames } from "./video";
import type { Format } from "./types";

export type VideoRootProps = {
  videoId: string;
  locale: string;
  format: Format;
  /** Ajoute la musique de video.json. */
  music?: boolean;
  /** Incruste les sous-titres (video.json > subtitles). */
  subtitles?: boolean;
  /** Rend une seule scène (aperçu dans le Studio) au lieu de toute la vidéo. */
  sceneIndex?: number;
};

// Point d'entrée de toutes les compositions : fixe la marque, la langue et le format actifs,
// puis rend la vidéo (ou une scène). Les composants lisent COLORS, COPY, etc. dans ce contexte.
export const VideoRoot: React.FC<VideoRootProps> = ({
  videoId,
  locale,
  format,
  music,
  subtitles,
  sceneIndex,
}) => {
  const entry = REGISTRY[videoId];
  if (!entry)
    throw new Error(`Vidéo inconnue : « ${videoId} » (voir content/videos/).`);
  const copy = entry.copy[locale];
  if (!copy)
    throw new Error(
      `La vidéo « ${videoId} » n'a pas de textes pour la langue « ${locale} ».`,
    );
  setActive({ brand: entry.brand, video: entry.video, locale, format, copy });

  if (sceneIndex !== undefined) {
    const scene = entry.video.scenes[sceneIndex];
    const Scene = resolveScene(videoId, scene, format);
    return (
      <SceneProvider scene={scene}>
        <Scene />
      </SceneProvider>
    );
  }

  const total = totalFrames(entry.video);
  const cfg = entry.video.music;
  return (
    <AbsoluteFill>
      <Timeline />
      {subtitles && entry.video.subtitles ? <Subtitles /> : null}
      {music && cfg ? (
        <Audio
          src={musicFile()}
          trimAfter={total}
          volume={(f) =>
            cfg.volume *
            interpolate(
              f,
              [0, cfg.fadeInFrames, total - cfg.fadeOutFrames, total],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            )
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
