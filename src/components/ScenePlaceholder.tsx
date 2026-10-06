import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT } from "../theme";

// Gabarit temporaire des scènes (étape 2). Remplacé scène par scène à l'étape 3.
export const ScenePlaceholder: React.FC<{
  name: string;
  background: string;
  dark?: boolean;
  children?: React.ReactNode;
}> = ({ name, background, dark = false, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fg = dark ? COLORS.white : COLORS.ink;
  return (
    <AbsoluteFill
      name={name}
      style={{
        backgroundColor: background,
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT(),
        color: fg,
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          left: 140,
          bottom: 120,
          fontSize: 40,
          fontWeight: 600,
          opacity: 0.55,
        }}
      >
        {name} · image {frame} / {durationInFrames}
      </div>
    </AbsoluteFill>
  );
};
