import React from "react";
import { COLORS, DECOR } from "../theme";

// Drapeau suisse, petit et discret.
export const SwissFlag: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <rect width={32} height={32} rx={6} fill={DECOR.swissRed} />
    <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" fill={COLORS.white} />
  </svg>
);
