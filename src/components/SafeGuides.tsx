import React from "react";
import { AbsoluteFill, getInputProps } from "remotion";
import { SAFE_V } from "../theme";
import { HEIGHT_V, WIDTH_V } from "../timing";

// Surcouche de contrôle : dessine la zone utile 9:16. N'apparaît que si la composition reçoit
// la prop « guides » (ex. npx remotion still S3-Vertical out/x.png --props='{"guides":true}').
export const SafeGuides: React.FC = () => {
  const props = getInputProps() as { guides?: boolean };
  if (!props.guides) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: SAFE_V.x,
          top: SAFE_V.top,
          width: WIDTH_V - 2 * SAFE_V.x,
          height: HEIGHT_V - SAFE_V.top - SAFE_V.bottom,
          outline: "3px dashed rgba(255,0,90,.85)",
          backgroundColor: "rgba(255,0,90,.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: WIDTH_V,
          height: SAFE_V.top,
          backgroundColor: "rgba(255,0,90,.12)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: WIDTH_V,
          height: SAFE_V.bottom,
          backgroundColor: "rgba(255,0,90,.12)",
        }}
      />
    </AbsoluteFill>
  );
};
