import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useScene } from "../engine/scene";
import { COLORS, SAFE_V, TYPE_V } from "../theme";
import { ChaosMail, ChaosPhone, ChaosSheet } from "../components/ChaosProps";
import { SafeGuides } from "../components/SafeGuides";
import { TextCue } from "../components/TextCue";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const CX = 540; // centre horizontal
const TEXT_TOP = SAFE_V.top; // les lignes courtes commencent en haut de la zone utile
const VISUAL_TOP = 570; // début de la zone visuelle (téléphone, e-mail, tableur)

export const S1ChaosV: React.FC = () => {
  const { copy, cues } = useScene("chaos");
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [12, 30], [0, 1], clamp);
  const flash = interpolate(frame, [296, 310], [0, 1], clamp);
  const line = {
    size: TYPE_V.chaos,
    align: "left" as const,
    color: COLORS.white,
    maxWidth: SAFE_V.width,
  };

  return (
    <AbsoluteFill
      name="S1 · Le chaos (9:16)"
      style={{ backgroundColor: COLORS.night }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 900px at ${CX}px 1050px, rgba(80,140,255,${0.28 * glow}), rgba(80,140,255,0) 70%), radial-gradient(1400px 900px at 50% 120%, ${COLORS.nightDeep}, rgba(5,13,31,0) 70%)`,
        }}
      />

      {/* lignes courtes, en haut de la zone utile */}
      <div
        style={{
          position: "absolute",
          left: SAFE_V.x,
          top: TEXT_TOP,
          width: SAFE_V.width,
        }}
      >
        <TextCue cue={cues.message} text={copy.message} {...line} />
        <TextCue cue={cues.mail} text={copy.mail} {...line} />
        <TextCue cue={cues.excel} text={copy.excel} {...line} />
      </div>

      <ChaosPhone centerX={CX} top={VISUAL_TOP} notifTop={310} slot={150} />
      <ChaosMail centerX={CX} top={VISUAL_TOP + 120} width={880} />
      <ChaosSheet centerX={CX} top={VISUAL_TOP + 100} width={880} />

      {/* phrase finale, centrée */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <TextCue
          cue={cues.end}
          text={copy.end}
          highlight={copy.endHighlight}
          size={TYPE_V.title}
          color={COLORS.white}
          highlightColor={COLORS.blueOnNight}
          maxWidth={SAFE_V.width}
          hold
        />
      </AbsoluteFill>

      <AbsoluteFill style={{ backgroundColor: COLORS.white, opacity: flash }} />
      <SafeGuides />
    </AbsoluteFill>
  );
};
