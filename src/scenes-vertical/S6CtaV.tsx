import React from "react";
import { getActive } from "../engine/active";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useScene } from "../engine/scene";
import { COLORS, FONT, SAFE_V, SPRINGS, TYPE_V } from "../theme";
import { PILL_STAGGER } from "../timing";
import { Button } from "../components/Button";
import { Logo } from "../components/Logo";
import { Pill } from "../components/Pill";
import { SafeGuides } from "../components/SafeGuides";
import { SwissFlag } from "../components/SwissFlag";
import { TextCue } from "../components/TextCue";
import { TimerRing } from "../components/TimerRing";

// Colle les trois derniers mots (espaces insécables) : la dernière ligne ne reste jamais un mot seul.
const glueLastWords = (text: string): string =>
  text.replace(/ (?=[^ ]+ [^ ]+$)/, "\u00A0").replace(/ (?=[^ ]+$)/, "\u00A0");

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const S6CtaV: React.FC = () => {
  const { copy, cues, props } = useScene("cta");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = cues;

  const halo = interpolate(frame, [0, 40], [0, 1], clamp);
  const url = spring({
    frame: frame - c.url,
    fps,
    config: SPRINGS.smooth,
    durationInFrames: 24,
  });
  const fade = interpolate(frame, c.fadeOut, [0, 1], clamp);

  return (
    <AbsoluteFill
      name="S6 · L'appel à l'action (9:16)"
      style={{ backgroundColor: COLORS.bg }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(1000px 900px at 540px 900px, rgba(16,88,200,${0.14 * halo}), rgba(16,88,200,0) 70%), radial-gradient(700px 500px at 150px 200px, rgba(16,88,200,${0.06 * halo}), rgba(16,88,200,0) 70%)`,
        }}
      />

      {/* pile centrée dans la zone utile (y 220 → 1540) */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 56,
          paddingBottom: 160,
        }}
      >
        <div style={{ height: 252, display: "flex", alignItems: "center" }}>
          <TextCue
            cue={c.question}
            text={glueLastWords(copy.question)}
            size={TYPE_V.title}
            maxWidth={SAFE_V.width}
            hold
          />
        </div>

        <div style={{ height: 112 }}>
          <Button label={copy.button} size="cta" from={c.button} pulse />
        </div>

        <div
          style={{
            width: SAFE_V.width,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 24,
          }}
        >
          {copy.pills.map((label, i) => (
            <Pill
              key={i}
              label={label}
              size={TYPE_V.pill}
              from={c.pills + i * PILL_STAGGER}
              icon={
                i === props.timerPill ? (
                  <TimerRing from={c.timer[0]} to={c.timer[1]} size={52} />
                ) : undefined
              }
            />
          ))}
        </div>

        <div
          style={{
            height: 96,
            display: "flex",
            alignItems: "center",
            gap: 32,
            opacity: url,
            translate: `0px ${interpolate(url, [0, 1], [30, 0])}px`,
            fontFamily: FONT(),
          }}
        >
          <Logo width={280} />
          <div
            style={{ width: 2, height: 52, backgroundColor: COLORS.blueMid }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {getActive().brand.flag === "CH" ? <SwissFlag size={48} /> : null}
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: COLORS.ink,
              }}
            >
              {copy.url}
            </div>
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ backgroundColor: COLORS.white, opacity: fade }} />
      <SafeGuides />
    </AbsoluteFill>
  );
};
