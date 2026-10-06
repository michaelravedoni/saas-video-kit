import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useScene } from "../engine/scene";
import { COLORS, SAFE_V, SPRINGS, TYPE_V } from "../theme";
import { Cursor } from "../components/Cursor";
import { SafeGuides } from "../components/SafeGuides";
import { TextCue } from "../components/TextCue";
import {
  CARD_W,
  VolunteerCard,
  choiceTargets,
} from "../components/VolunteerCard";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Carte « Loto » : réutilisée telle quelle (800 px). Centrée pendant l'interaction,
// puis elle glisse vers le bas pendant que « Le système gère les quotas. » apparaît en haut.
const CARD_LEFT = (1080 - CARD_W) / 2;
const CARD_TOP_INTERACT = 450;
const CARD_TOP_QUOTAS = 760;

export const S4VolunteersV: React.FC = () => {
  const { copy, cues, props } = useScene("choiceCard");
  const { choose: CHOOSE_BTN, slot: SLOT_2 } = choiceTargets(
    CARD_LEFT,
    CARD_TOP_INTERACT,
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
  const top = CARD_TOP_INTERACT + (CARD_TOP_QUOTAS - CARD_TOP_INTERACT) * shift;
  const halo = interpolate(frame, [0, 30], [0, 1], clamp);
  const cursorOpacity =
    interpolate(frame, [c.card + 6, c.card + 16], [0, 1], clamp) *
    interpolate(frame, [c.collapse, c.collapse + 12], [1, 0], clamp);

  return (
    <AbsoluteFill
      name="S4 · Les bénévoles (9:16)"
      style={{ backgroundColor: COLORS.bg }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 900px at 540px 950px, rgba(16,88,200,${0.1 * halo}), rgba(16,88,200,0) 70%), radial-gradient(700px 500px at 950px 1500px, rgba(16,88,200,${0.06 * halo}), rgba(16,88,200,0) 70%)`,
        }}
      />

      {/* Titre centré */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <TextCue
          cue={c.title}
          text={copy.title}
          highlight={copy.titleHighlight}
          size={TYPE_V.title}
          maxWidth={SAFE_V.width}
        />
      </AbsoluteFill>

      {/* « Le système gère les quotas. » en haut */}
      <div
        style={{
          position: "absolute",
          left: SAFE_V.x,
          top: SAFE_V.top,
          width: SAFE_V.width,
        }}
      >
        <TextCue
          cue={c.quotas}
          text={copy.quotas}
          highlight={copy.quotasHighlight}
          size={TYPE_V.title}
          align="left"
          maxWidth={SAFE_V.width}
          hold
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: CARD_LEFT,
          top,
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
            { frame: c.card + 8, x: 860, y: 1250 },
            { frame: c.choose - 4, x: CHOOSE_BTN.x, y: CHOOSE_BTN.y },
            { frame: c.choose + 4, x: CHOOSE_BTN.x, y: CHOOSE_BTN.y },
            { frame: c.slotClick - 4, x: SLOT_2.x, y: SLOT_2.y },
            { frame: c.collapse, x: SLOT_2.x, y: SLOT_2.y },
          ]}
          clicks={[c.choose, c.slotClick]}
        />
      </div>

      <SafeGuides />
    </AbsoluteFill>
  );
};
