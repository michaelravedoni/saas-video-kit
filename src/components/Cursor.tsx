import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

export type CursorKeyframe = { frame: number; x: number; y: number };

// Trajectoire en arc : x et y n'ont pas la même courbe (docs/04-motion.md).
// `clicks` : images (relatives à la scène) auxquelles un clic a lieu.
export const Cursor: React.FC<{
  path: CursorKeyframe[];
  clicks?: number[];
  size?: number;
}> = ({ path, clicks = [], size = 44 }) => {
  const frame = useCurrentFrame();
  const frames = path.map((k) => k.frame);

  const x = interpolate(
    frame,
    frames,
    path.map((k) => k.x),
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    },
  );
  const y = interpolate(
    frame,
    frames,
    path.map((k) => k.y),
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.45, 0, 0.25, 1),
    },
  );

  const lastClick = clicks.filter((c) => frame >= c).pop();
  const t = lastClick === undefined ? 99 : frame - lastClick;
  const press = interpolate(t, [0, 4, 8], [1, 0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ripple = interpolate(t, [0, 12], [0, 80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rippleOpacity = interpolate(t, [0, 12], [0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        translate: `${x}px ${y}px`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: ripple * 2,
          height: ripple * 2,
          left: -ripple,
          top: -ripple,
          borderRadius: 999,
          backgroundColor: COLORS.blueTint,
          opacity: rippleOpacity,
        }}
      />
      <svg
        width={size}
        height={size * 1.4}
        viewBox="0 0 24 34"
        style={{ scale: press, transformOrigin: "0 0", display: "block" }}
      >
        <path
          d="M2 2 L2 26 L8.5 20.5 L13 31 L17 29.2 L12.6 19 L21 18.5 Z"
          fill={COLORS.ink}
          stroke={COLORS.white}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
