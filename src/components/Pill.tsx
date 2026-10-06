import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT, SPRINGS, TYPE } from "../theme";

type Tone = "blue" | "success" | "danger" | "gray";

const tones = (): Record<Tone, { bg: string; fg: string }> => ({
  blue: { bg: COLORS.blueTint, fg: COLORS.blue },
  success: { bg: COLORS.successTint, fg: COLORS.success },
  danger: { bg: COLORS.dangerTint, fg: COLORS.danger },
  gray: { bg: COLORS.line, fg: COLORS.gray },
});

export const Pill: React.FC<{
  label: string;
  tone?: Tone;
  /** Image (relative à la scène) à laquelle la pastille entre. */
  from?: number;
  size?: number;
  icon?: React.ReactNode;
}> = ({ label, tone = "blue", from = 0, size = TYPE.pill, icon }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - from, fps, config: SPRINGS.snappy });
  const { bg, fg } = tones()[tone];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.35,
        padding: `${size * 0.3}px ${size * 0.7}px`,
        borderRadius: 999,
        backgroundColor: bg,
        color: fg,
        fontFamily: FONT(),
        fontSize: size,
        fontWeight: 600,
        whiteSpace: "nowrap",
        opacity: interpolate(p, [0, 1], [0, 1]),
        scale: interpolate(p, [0, 1], [0.85, 1]),
      }}
    >
      {icon}
      {label}
    </div>
  );
};
