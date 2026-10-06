import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT, SPRINGS } from "../theme";
import { Card } from "./Card";

// Carte de statistique du tableau de bord (recréée en français) avec compteur animé.
export const StatCard: React.FC<{
  label: string;
  sub: string;
  value: number;
  /** Image (relative à la scène) à laquelle la carte entre. */
  from: number;
  width: number;
}> = ({ label, sub, value, from, width }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - from,
    fps,
    config: SPRINGS.smooth,
    durationInFrames: 24,
  });
  const count = Math.round(
    interpolate(frame, [from + 6, from + 40], [0, value], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    }),
  );
  return (
    <Card
      style={{
        width,
        height: 270,
        boxSizing: "border-box",
        padding: "30px 28px",
        fontFamily: FONT(),
        opacity: p,
        translate: `0px ${interpolate(p, [0, 1], [60, 0])}px`,
      }}
    >
      <div style={{ fontSize: 38, fontWeight: 600, color: COLORS.gray }}>
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 124,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: COLORS.ink,
          lineHeight: 1.05,
        }}
      >
        {count}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 30,
          fontWeight: 500,
          color: COLORS.gray,
        }}
      >
        {sub}
      </div>
    </Card>
  );
};
