import type React from "react";
import { S1Chaos } from "../scenes/S1Chaos";
import { S2Solution } from "../scenes/S2Solution";
import { S3MagicLink } from "../scenes/S3MagicLink";
import { S4Volunteers } from "../scenes/S4Volunteers";
import { S5Control } from "../scenes/S5Control";
import { S6Cta } from "../scenes/S6Cta";
import { S1ChaosV } from "../scenes-vertical/S1ChaosV";
import { S2SolutionV } from "../scenes-vertical/S2SolutionV";
import { S3MagicLinkV } from "../scenes-vertical/S3MagicLinkV";
import { S4VolunteersV } from "../scenes-vertical/S4VolunteersV";
import { S5ControlV } from "../scenes-vertical/S5ControlV";
import { S6CtaV } from "../scenes-vertical/S6CtaV";
import { CUSTOM_SCENES } from "../generated/registry";
import type { Format, SceneConfig, SceneType } from "./types";

// Bibliothèque de scènes : un archétype (type) a une mise en page par format.
export const SCENE_COMPONENTS: Record<
  Exclude<SceneType, "custom">,
  Record<Format, React.FC>
> = {
  chaos: { "16x9": S1Chaos, "9x16": S1ChaosV },
  reveal: { "16x9": S2Solution, "9x16": S2SolutionV },
  phoneFlow: { "16x9": S3MagicLink, "9x16": S3MagicLinkV },
  choiceCard: { "16x9": S4Volunteers, "9x16": S4VolunteersV },
  control: { "16x9": S5Control, "9x16": S5ControlV },
  cta: { "16x9": S6Cta, "9x16": S6CtaV },
};

/** Composant d'une scène pour un format : bibliothèque, ou fichier propre à la vidéo pour une scène « custom ». */
export const resolveScene = (
  videoId: string,
  scene: SceneConfig,
  format: Format,
): React.FC => {
  if (scene.type !== "custom") return SCENE_COMPONENTS[scene.type][format];
  const file = CUSTOM_SCENES[videoId]?.[scene.name ?? ""];
  if (!file) {
    throw new Error(
      `Scène custom « ${scene.name} » introuvable : créer content/videos/${videoId}/scenes/${scene.name}.tsx (voir docs/07-extending.md).`,
    );
  }
  const Component = file[format];
  if (!Component) {
    throw new Error(
      `La scène custom « ${scene.name} » n'a pas de mise en page pour le format ${format}.`,
    );
  }
  return Component;
};
