import React from "react";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { getActive } from "./active";
import { resolveScene } from "./scenes";
import { SceneProvider } from "./scene";
import type { TransitionKind } from "./types";

// Enchaîne les scènes de video.json avec leurs transitions. Même chronologie pour tous les formats ;
// les glissements viennent de la droite en 16:9 et du bas en 9:16.
export const Timeline: React.FC = () => {
  const { video, format } = getActive();
  const timing = linearTiming({ durationInFrames: video.transitionFrames });

  const presentation = (kind: TransitionKind) =>
    kind === "slide"
      ? slide({ direction: format === "9x16" ? "from-bottom" : "from-right" })
      : fade();

  const children: React.ReactNode[] = [];
  video.scenes.forEach((scene, i) => {
    const Scene = resolveScene(video.id, scene, format);
    children.push(
      <TransitionSeries.Sequence
        key={`scene-${i}`}
        name={`${i + 1} ${scene.type === "custom" ? scene.name : scene.type}`}
        durationInFrames={scene.frames}
      >
        <SceneProvider scene={scene}>
          <Scene />
        </SceneProvider>
      </TransitionSeries.Sequence>,
    );
    if (scene.transitionOut) {
      children.push(
        <TransitionSeries.Transition
          key={`transition-${i}`}
          presentation={presentation(scene.transitionOut)}
          timing={timing}
        />,
      );
    }
  });

  return <TransitionSeries>{children}</TransitionSeries>;
};
