import React from "react";
import { COLORS, FONT } from "../theme";

// E-mail « perdu » de S1.
export const MailChip: React.FC<{
  subject: string;
  meta: string;
  width: number;
}> = ({ subject, meta, width }) => {
  return (
    <div
      style={{
        width,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "28px 32px",
        borderRadius: 24,
        backgroundColor: COLORS.white,
        fontFamily: FONT(),
        boxShadow: "0 24px 60px rgba(0,0,0,.45)",
      }}
    >
      <svg width={72} height={72} viewBox="0 0 24 24" fill="none">
        <rect
          x={2.5}
          y={5}
          width={19}
          height={14}
          rx={3}
          stroke={COLORS.blue}
          strokeWidth={1.8}
        />
        <path
          d="M3.5 7 L12 13 L20.5 7"
          stroke={COLORS.blue}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: COLORS.ink }}>
          {subject}
        </div>
        <div style={{ fontSize: 30, fontWeight: 500, color: COLORS.gray }}>
          {meta}
        </div>
      </div>
    </div>
  );
};
