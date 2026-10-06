import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT } from "../theme";

// Petit chronomètre circulaire qui compte de 0 à `seconds`, entre `from` et `to` (images relatives).
export const TimerRing: React.FC<{
  from: number;
  to: number;
  seconds?: number;
  size?: number;
}> = ({ from, to, seconds = 30, size = 48 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.45, 0, 0.25, 1),
  });
  const stroke = size * 0.14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ rotate: "-90deg" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={COLORS.blueMid}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={COLORS.blue}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p)}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT(),
          fontWeight: 700,
          fontSize: size * 0.34,
          color: COLORS.blue,
        }}
      >
        {Math.round(p * seconds)}
      </div>
    </div>
  );
};
