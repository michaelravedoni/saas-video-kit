import React from "react";
import { REGISTRY } from "../generated/registry";
import { ThumbnailShorts, ThumbnailYoutube } from "../thumbnails/Thumbnails";
import { setActive } from "./active";
import type { Format } from "./types";

export type ThumbnailKind = "youtube" | "shorts";
export type ThumbnailRootProps = {
  videoId: string;
  locale: string;
  kind: ThumbnailKind;
};

// Comme VideoRoot : fixe la marque, la vidéo et la langue actives, puis rend la miniature.
export const ThumbnailRoot: React.FC<ThumbnailRootProps> = ({
  videoId,
  locale,
  kind,
}) => {
  const entry = REGISTRY[videoId];
  if (!entry) throw new Error(`Vidéo inconnue : « ${videoId} ».`);
  const copy = entry.copy[locale];
  if (!copy)
    throw new Error(
      `La vidéo « ${videoId} » n'a pas de textes pour la langue « ${locale} ».`,
    );
  const format: Format = kind === "shorts" ? "9x16" : "16x9";
  setActive({ brand: entry.brand, video: entry.video, locale, format, copy });
  return kind === "shorts" ? <ThumbnailShorts /> : <ThumbnailYoutube />;
};
