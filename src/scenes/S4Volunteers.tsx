import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useScene } from "../engine/scene";
import { COLORS, SPRINGS } from "../theme";
import { Cursor } from "../components/Cursor";
import { TextCue } from "../components/TextCue";
import {
  CARD_W,
  VolunteerCard,
  choiceTargets,
} from "../components/VolunteerCard";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Position de la carte (px, scène)
const CARD_TOP = 170;
const LEFT_CENTER = (1920 - CARD_W) / 2; // 560 : centrée pendant l'interaction
const LEFT_RIGHT = 1000; // à droite pendant « quotas »

export const S4Volunteers: React.FC = () => {
  const { copy, cues, props } = useScene("choiceCard");
  const { choose: CHOOSE_BTN, slot: SLOT_2 } = choiceTargets(
    LEFT_CENTER,
    CARD_TOP,
    props.selectRow,
    props.slotIndex,
  );
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = cues;

  const enter = spring({
    frame: frame - c.card,
    fps,
    config: SPRINGS.smooth,
    durationInFrames: 28,
  });
  const shift = spring({
    frame: frame - c.shift[0],
    fps,
    config: SPRINGS.smooth,
    durationInFrames: c.shift[1] - c.shift[0],
  });
  const left = LEFT_CENTER + (LEFT_RIGHT - LEFT_CENTER) * shift;
  const halo = interpolate(frame, [0, 30], [0, 1], clamp);
  const cursorOpacity =
    interpolate(frame, [c.card + 6, c.card + 16], [0, 1], clamp) *
    interpolate(frame, [c.collapse, c.collapse + 12], [1, 0], clamp);

  return (
    <AbsoluteFill
      name="S4 · Les bénévoles"
      style={{ backgroundColor: COLORS.bg }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(1000px 900px at 960px 560px, rgba(16,88,200,${0.1 * halo}), rgba(16,88,200,0) 70%), radial-gradient(900px 600px at 1700px 960px, rgba(16,88,200,${0.06 * halo}), rgba(16,88,200,0) 70%)`,
        }}
      />

      {/* Titre centré */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <TextCue
          cue={c.title}
          text={copy.title}
          highlight={copy.titleHighlight}
          maxWidth={1500}
        />
      </AbsoluteFill>

      {/* « Le système gère les quotas. » */}
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 0,
          width: 850,
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <TextCue
          cue={c.quotas}
          text={copy.quotas}
          highlight={copy.quotasHighlight}
          align="left"
          maxWidth={850}
          hold
        />
      </div>

      {/* Carte « Loto » recréée */}
      <div
        style={{
          position: "absolute",
          left,
          top: CARD_TOP,
          opacity: enter,
          translate: `0px ${interpolate(enter, [0, 1], [160, 0])}px`,
          scale: interpolate(enter, [0, 1], [0.96, 1]),
        }}
      >
        <VolunteerCard />
      </div>

      <div style={{ position: "absolute", inset: 0, opacity: cursorOpacity }}>
        <Cursor
          path={[
            { frame: c.card + 8, x: 1500, y: 900 },
            { frame: c.choose - 4, x: CHOOSE_BTN.x, y: CHOOSE_BTN.y },
            { frame: c.choose + 4, x: CHOOSE_BTN.x, y: CHOOSE_BTN.y },
            { frame: c.slotClick - 4, x: SLOT_2.x, y: SLOT_2.y },
            { frame: c.collapse, x: SLOT_2.x, y: SLOT_2.y },
          ]}
          clicks={[c.choose, c.slotClick]}
        />
      </div>
    </AbsoluteFill>
  );
};
