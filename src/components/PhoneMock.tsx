import React from "react";
import { COLORS } from "../theme";

// Cadre #0F172A, rayon 56 px, encoche discrète, écran blanc (docs/03-design-system.md).
export const PhoneMock: React.FC<{
  width: number;
  children?: React.ReactNode;
  screenColor?: string;
  style?: React.CSSProperties;
}> = ({ width, children, screenColor = COLORS.white, style }) => {
  const height = width * (19.5 / 9);
  const bezel = width * 0.04;
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 56,
        backgroundColor: COLORS.ink,
        padding: bezel,
        boxShadow: "0 40px 80px rgba(16,88,200,.22)",
        position: "relative",
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 56 - bezel,
          overflow: "hidden",
          backgroundColor: screenColor,
          position: "relative",
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          top: bezel + 14,
          left: "50%",
          translate: "-50% 0",
          width: width * 0.28,
          height: 30,
          borderRadius: 999,
          backgroundColor: COLORS.ink,
        }}
      />
    </div>
  );
};
