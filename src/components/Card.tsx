import React from "react";
import { COLORS, SHADOW } from "../theme";

export const Card: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => {
  return (
    <div
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 16,
        border: `1px solid ${COLORS.line}`,
        boxShadow: SHADOW.card,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
