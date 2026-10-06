import { staticFile } from "remotion";
import { getActive } from "./active";

// Fichiers de la vidéo active : captures (public/videos/<id>/captures/), musique, logo de la marque.

/** Une capture : un nom de fichier, ou un fichier par langue ({ "fr": "a.png", "en": "a-en.png" }). */
export type CaptureRef = string | Record<string, string>;

export const captureFile = (ref: CaptureRef): string => {
  const { video, locale } = getActive();
  const name =
    typeof ref === "string" ? ref : (ref[locale] ?? Object.values(ref)[0]);
  return staticFile(`videos/${video.id}/captures/${name}`);
};

export const musicFile = (): string => {
  const { video } = getActive();
  if (!video.music)
    throw new Error(
      `La vidéo « ${video.id} » n'a pas de musique (video.json).`,
    );
  return staticFile(`videos/${video.id}/${video.music.file}`);
};

export const logoFile = (): string => staticFile(getActive().brand.logo.file);
