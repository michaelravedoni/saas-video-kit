import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT, SPRINGS } from "../theme";

// Puce de fichier qui sort du bouton « Liste PDF » (geste sans texte).
export const PdfChip: React.FC<{ name: string; from: number }> = ({
  name,
  from,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - from, fps, config: SPRINGS.snappy });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 18,
        padding: "18px 30px 18px 22px",
        borderRadius: 18,
        backgroundColor: COLORS.white,
        border: `1px solid ${COLORS.line}`,
        boxShadow: "0 24px 50px rgba(16,88,200,.22)",
        fontFamily: FONT(),
        fontSize: 36,
        fontWeight: 600,
        color: COLORS.ink,
        whiteSpace: "nowrap",
        opacity: interpolate(p, [0, 1], [0, 1]),
        scale: interpolate(p, [0, 1], [0.6, 1]),
        translate: `0px ${interpolate(p, [0, 1], [-70, 0])}px`,
      }}
    >
      <div
        style={{
          width: 52,
          height: 64,
          borderRadius: 10,
          backgroundColor: COLORS.dangerTint,
          color: COLORS.danger,
          fontSize: 22,
          fontWeight: 800,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: 8,
          boxSizing: "border-box",
        }}
      >
        PDF
      </div>
      {name}
    </div>
  );
};
