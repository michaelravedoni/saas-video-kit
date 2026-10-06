import React from "react";
import { Sequence } from "remotion";
import { KineticText } from "./KineticText";

type Props = Omit<
  React.ComponentProps<typeof KineticText>,
  "from" | "exitAt"
> & {
  /** [début, fin] en images relatives à la scène (voir CUES dans timing.ts). */
  cue: readonly [number, number];
  /** Ne pas faire sortir le texte (dernier texte d'une scène). */
  hold?: boolean;
};

// Affiche un texte pendant son repère : entrée mot à mot, sortie 8 images avant la fin.
export const TextCue: React.FC<Props> = ({ cue, hold = false, ...rest }) => {
  const [start, end] = cue;
  return (
    <Sequence from={start} durationInFrames={end - start} layout="none">
      <KineticText {...rest} exitAt={hold ? undefined : end - start - 8} />
    </Sequence>
  );
};
