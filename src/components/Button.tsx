import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT, SPRINGS } from "../theme";

export const Button: React.FC<{
  label: string;
  /** « ui » = bouton d'interface recréée (72 px) ; « cta » = appel à l'action (112 px). */
  size?: "ui" | "cta";
  from?: number;
  /** Légère pulsation après l'entrée. */
  pulse?: boolean;
  /** Image (relative à la scène) à laquelle l'effet d'appui commence (clic). */
  pressAt?: number;
}> = ({ label, size = "ui", from = 0, pulse = false, pressAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - from, fps, config: SPRINGS.snappy });
  const height = size === "cta" ? 112 : 72;
  const fontSize = size === "cta" ? 52 : 34;

  const pulseScale = pulse
    ? 1 + 0.025 * Math.sin(((frame - from) / fps) * Math.PI * 1.6) * enter
    : 1;
  const press =
    pressAt === undefined
      ? 1
      : interpolate(frame, [pressAt, pressAt + 4, pressAt + 12], [1, 0.92, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height,
        padding: `0 ${height * 0.55}px`,
        borderRadius: 12 + (size === "cta" ? 8 : 0),
        backgroundColor: COLORS.blue,
        color: COLORS.white,
        fontFamily: FONT(),
        fontSize,
        fontWeight: 600,
        whiteSpace: "nowrap",
        boxShadow: "0 16px 40px rgba(16,88,200,.35)",
        opacity: enter,
        scale: interpolate(enter, [0, 1], [0.9, 1]) * pulseScale * press,
      }}
    >
      {label}
    </div>
  );
};
