import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useScene } from "../engine/scene";
import { COLORS } from "../theme";
import { ChaosMail, ChaosPhone, ChaosSheet } from "../components/ChaosProps";
import { TextCue } from "../components/TextCue";

const COL_X = 1400; // centre de la colonne visuelle (à droite)
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const S1Chaos: React.FC = () => {
  const { copy, cues } = useScene("chaos");
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [12, 30], [0, 1], clamp);
  const flash = interpolate(frame, [296, 310], [0, 1], clamp);

  return (
    <AbsoluteFill
      name="S1 · Le chaos"
      style={{ backgroundColor: COLORS.night }}
    >
      {/* lueur de l'écran + vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 900px at ${COL_X}px 520px, rgba(80,140,255,${0.28 * glow}), rgba(80,140,255,0) 70%), radial-gradient(1400px 900px at 50% 120%, ${COLORS.nightDeep}, rgba(5,13,31,0) 70%)`,
        }}
      />

      {/* colonne de texte à gauche */}
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 0,
          height: "100%",
          width: 860,
          display: "flex",
          alignItems: "center",
        }}
      >
        <TextCue
          cue={cues.message}
          text={copy.message}
          align="left"
          color={COLORS.white}
          maxWidth={860}
        />
        <TextCue
          cue={cues.mail}
          text={copy.mail}
          align="left"
          color={COLORS.white}
          maxWidth={860}
        />
        <TextCue
          cue={cues.excel}
          text={copy.excel}
          align="left"
          color={COLORS.white}
          maxWidth={860}
        />
      </div>

      <ChaosPhone />
      <ChaosMail />
      <ChaosSheet />

      {/* phrase finale, centrée */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <TextCue
          cue={cues.end}
          text={copy.end}
          highlight={copy.endHighlight}
          color={COLORS.white}
          highlightColor={COLORS.blueOnNight}
          maxWidth={1500}
          hold
        />
      </AbsoluteFill>

      {/* voile blanc : le flash vers S2 */}
      <AbsoluteFill style={{ backgroundColor: COLORS.white, opacity: flash }} />
    </AbsoluteFill>
  );
};
