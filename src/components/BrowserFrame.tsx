import React from "react";
import { COLORS, SHADOW } from "../theme";

// Fenêtre blanche, rayon 20 px, barre fine avec trois points (docs/03-design-system.md).
export const BrowserFrame: React.FC<{
  width: number;
  height: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ width, height, children, style }) => {
  const bar = 56;
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: COLORS.white,
        boxShadow: SHADOW.window,
        border: `1px solid ${COLORS.line}`,
        ...style,
      }}
    >
      <div
        style={{
          height: bar,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 22px",
          backgroundColor: COLORS.bg,
          borderBottom: `1px solid ${COLORS.line}`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: COLORS.line,
            }}
          />
        ))}
      </div>
      <div style={{ position: "relative", width, height: height - bar }}>
        {children}
      </div>
    </div>
  );
};
