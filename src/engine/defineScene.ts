import type React from "react";
import type { Format } from "./types";

/**
 * Déclare une scène propre à une vidéo (content/videos/<id>/scenes/<Nom>.tsx) :
 * un composant par format. Dans le composant, `useScene("custom")` donne `copy`, `props` et `cues`.
 *
 *   export default defineScene({ "16x9": Landscape, "9x16": Portrait });
 */
export const defineScene = (
  layouts: Record<Format, React.FC>,
): Record<Format, React.FC> => layouts;
