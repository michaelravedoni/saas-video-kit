import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT, SPRINGS } from "../theme";

// Ligne d'inscription avec case à cocher, dans le style de l'application (capture-1.png).
export const CheckRow: React.FC<{
  name: string;
  meta: string;
  width: number;
  /** Image (relative à la scène) à laquelle la case est cochée. */
  checkAt: number;
}> = ({ name, meta, width, checkAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - checkAt, fps, config: SPRINGS.snappy });
  const checked = frame >= checkAt;

  return (
    <div
      style={{
        width,
        height: 150,
        boxSizing: "border-box",
        padding: "0 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 16,
        backgroundColor: COLORS.white,
        border: `1px solid ${checked ? COLORS.blueMid : COLORS.line}`,
        boxShadow: "0 8px 24px rgba(15,23,42,.08)",
        fontFamily: FONT(),
      }}
    >
      <div>
        <div style={{ fontSize: 40, fontWeight: 600, color: COLORS.ink }}>
          {name}
        </div>
        <div
          style={{
            fontSize: 30,
            fontWeight: 500,
            color: COLORS.gray,
            marginTop: 4,
          }}
        >
          {meta}
        </div>
      </div>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          border: `3px solid ${checked ? COLORS.blue : COLORS.blueMid}`,
          backgroundColor: checked ? COLORS.blue : COLORS.white,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: checked ? interpolate(p, [0, 1], [0.8, 1]) : 1,
        }}
      >
        <svg width={38} height={38} viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12.5 L10 17.5 L19 7"
            stroke={COLORS.white}
            strokeWidth={3.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={30}
            strokeDashoffset={30 * (1 - (checked ? p : 0))}
          />
        </svg>
      </div>
    </div>
  );
};
