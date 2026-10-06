import React from "react";
import { AbsoluteFill } from "remotion";
import { StatCard } from "../../../../src/components/StatCard";
import { TextCue } from "../../../../src/components/TextCue";
import { defineScene } from "../../../../src/engine/defineScene";
import { useScene } from "../../../../src/engine/scene";
import { COLORS, SAFE_V, TYPE, TYPE_V } from "../../../../src/theme";

// Exemple de scène PROPRE À UNE VIDÉO : un titre et trois chiffres clés.
//   - déclarée dans video.json : { "type": "custom", "name": "Highlight", "id": "highlight", … }
//   - textes : copy.<langue>.json, clé « highlight » ; chiffres : props.values ; repères : cues
// Elle réutilise les composants du kit (TextCue, StatCard) et les couleurs de la marque.

type Copy = {
  title: string;
  titleHighlight: string;
  labels: string[];
  sub: string;
};
type Props = { values: number[] };
type Cues = { title: readonly [number, number]; stats: number };

const useData = () => {
  const scene = useScene("custom");
  return {
    copy: scene.copy as unknown as Copy,
    props: scene.props as unknown as Props,
    cues: scene.cues as unknown as Cues,
  };
};

const Background: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: COLORS.bg,
      background: `radial-gradient(1000px 800px at 50% 70%, ${COLORS.blueTint}, rgba(0,0,0,0) 70%), ${COLORS.bg}`,
    }}
  />
);

const Landscape: React.FC = () => {
  const { copy, props, cues } = useData();
  const cardW = (1640 - 2 * 40) / 3;
  return (
    <AbsoluteFill>
      <Background />
      <div style={{ position: "absolute", left: 140, top: 110, width: 1640 }}>
        <TextCue
          cue={cues.title}
          text={copy.title}
          highlight={copy.titleHighlight}
          size={TYPE.title}
          align="left"
          maxWidth={1500}
          hold
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 700,
          display: "flex",
          gap: 40,
        }}
      >
        {copy.labels.map((label, i) => (
          <StatCard
            key={label}
            label={label}
            sub={copy.sub}
            value={props.values[i]}
            from={cues.stats + i * 8}
            width={cardW}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Portrait: React.FC = () => {
  const { copy, props, cues } = useData();
  return (
    <AbsoluteFill>
      <Background />
      <div
        style={{
          position: "absolute",
          left: SAFE_V.x,
          top: SAFE_V.top,
          width: SAFE_V.width,
        }}
      >
        <TextCue
          cue={cues.title}
          text={copy.title}
          highlight={copy.titleHighlight}
          size={TYPE_V.title}
          align="left"
          maxWidth={SAFE_V.width}
          hold
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: SAFE_V.x,
          top: 660,
          width: SAFE_V.width,
          display: "flex",
          flexDirection: "column",
          gap: 30,
        }}
      >
        {copy.labels.map((label, i) => (
          <StatCard
            key={label}
            label={label}
            sub={copy.sub}
            value={props.values[i]}
            from={cues.stats + i * 8}
            width={SAFE_V.width}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

export default defineScene({ "16x9": Landscape, "9x16": Portrait });
