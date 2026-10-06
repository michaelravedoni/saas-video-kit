// FICHIER GÉNÉRÉ par scripts/build-registry.mjs : ne pas modifier à la main.
import type { BrandConfig, CopyTree, VideoConfig } from "../engine/types";
import brand_demo from "../../content/brands/demo/brand.json";
import video_demo from "../../content/videos/demo/video.json";
import copy_demo_en from "../../content/videos/demo/copy.en.json";
import copy_demo_fr from "../../content/videos/demo/copy.fr.json";
import custom_demo_Highlight from "../../content/videos/demo/scenes/Highlight";
import type { FC } from "react";

export type RegistryEntry = { video: VideoConfig; brand: BrandConfig; copy: Record<string, CopyTree> };

export const REGISTRY: Record<string, RegistryEntry> = {
  "demo": {
    video: video_demo as unknown as VideoConfig,
    brand: (video_demo.brand === "demo" ? brand_demo : undefined) as unknown as BrandConfig,
    copy: {
      en: copy_demo_en as unknown as CopyTree,
      fr: copy_demo_fr as unknown as CopyTree,
    },
  },
};

export const CUSTOM_SCENES: Record<string, Record<string, Partial<Record<"16x9" | "9x16", FC>>>> = {
  "demo": {
    "Highlight": custom_demo_Highlight,
  },
};
