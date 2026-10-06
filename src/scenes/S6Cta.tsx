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
import { COLORS, FONT, SPRINGS } from "../theme";
import { PILL_STAGGER } from "../timing";
import { Button } from "../components/Button";
import { Logo } from "../components/Logo";
import { Pill } from "../components/Pill";
import { SwissFlag } from "../components/SwissFlag";
import { TextCue } from "../components/TextCue";
import { TimerRing } from "../components/TimerRing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const S6Cta: React.FC = () => {
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
      name="S6 · L'appel à l'action"
      style={{ backgroundColor: COLORS.bg }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(1100px 800px at 960px 620px, rgba(16,88,200,${0.14 * halo}), rgba(16,88,200,0) 70%), radial-gradient(800px 500px at 200px 100px, rgba(16,88,200,${0.06 * halo}), rgba(16,88,200,0) 70%)`,
        }}
      />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 40,
        }}
      >
        <div style={{ height: 320, display: "flex", alignItems: "center" }}>
          <TextCue cue={c.question} text={copy.question} maxWidth={1640} hold />
        </div>

        <div style={{ height: 112 }}>
          <Button label={copy.button} size="cta" from={c.button} pulse />
        </div>

        <div
          style={{
            width: 1640,
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
              from={c.pills + i * PILL_STAGGER}
              icon={
                i === props.timerPill ? (
                  <TimerRing from={c.timer[0]} to={c.timer[1]} size={56} />
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
            gap: 40,
            opacity: url,
            translate: `0px ${interpolate(url, [0, 1], [30, 0])}px`,
            fontFamily: FONT(),
          }}
        >
          <Logo width={260} />
          <div
            style={{ width: 2, height: 56, backgroundColor: COLORS.blueMid }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
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

      {/* fondu au blanc final */}
      <AbsoluteFill style={{ backgroundColor: COLORS.white, opacity: fade }} />
    </AbsoluteFill>
  );
};
