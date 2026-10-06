import { FORMAT_SIZE } from "../timing";
import type { Format, VideoConfig } from "./types";

// Calculs de minutage à partir de video.json (durées de scènes et transitions qui se recouvrent).

export const totalFrames = (video: VideoConfig): number => {
  const sum = video.scenes.reduce((acc, s) => acc + s.frames, 0);
  const overlaps = video.scenes.filter((s) => s.transitionOut).length;
  return sum - overlaps * video.transitionFrames;
};

/** Image globale à laquelle chaque scène commence (en tenant compte des recouvrements). */
export const sceneStarts = (video: VideoConfig): number[] => {
  const starts: number[] = [];
  let cursor = 0;
  for (const scene of video.scenes) {
    starts.push(cursor);
    cursor += scene.frames - (scene.transitionOut ? video.transitionFrames : 0);
  }
  return starts;
};

export const formatSize = (format: Format) => FORMAT_SIZE[format];
