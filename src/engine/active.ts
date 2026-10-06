import type { BrandConfig, CopyTree, Format, VideoConfig } from "./types";

// Contexte « actif » : marque, vidéo, langue et format de la composition en cours de rendu.
// Chaque composition est rendue dans son propre onglet (rendu) ou remplacée (Studio) :
// VideoRoot fixe ce contexte avant de rendre ses enfants, donc COLORS, COPY et les chemins
// de fichiers (captures, musique) se résolvent toujours pour la bonne marque et la bonne langue.

export type ActiveContext = {
  brand: BrandConfig;
  video: VideoConfig;
  locale: string;
  format: Format;
  copy: CopyTree;
};

let active: ActiveContext | null = null;

export const setActive = (ctx: ActiveContext): void => {
  active = ctx;
};

export const getActive = (): ActiveContext => {
  if (!active) {
    throw new Error(
      "Aucun contexte actif : rends la composition via <VideoRoot> (voir src/engine/VideoRoot.tsx).",
    );
  }
  return active;
};

export const hasActive = (): boolean => active !== null;
