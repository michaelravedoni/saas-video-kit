import React from "react";
import { COLORS, FONT } from "../theme";

// Notification de messagerie GÉNÉRIQUE (aucun logo WhatsApp). Props de S1 : textes plus petits que l'UI standard.
export const ChatBubble: React.FC<{
  name: string;
  message: string;
  width: number;
  hue: string;
}> = ({ name, message, width, hue }) => {
  return (
    <div
      style={{
        width,
        boxSizing: "border-box",
        display: "flex",
        gap: 18,
        padding: "20px 22px",
        borderRadius: 30,
        backgroundColor: "rgba(255,255,255,0.94)",
        fontFamily: FONT(),
        boxShadow: "0 12px 30px rgba(0,0,0,.35)",
      }}
    >
      <div
        style={{
          flex: "none",
          width: 68,
          height: 68,
          borderRadius: 999,
          backgroundColor: hue,
          color: COLORS.white,
          fontSize: 34,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {name[0]}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: COLORS.ink }}>
          {name}
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 500,
            color: COLORS.ink,
            lineHeight: 1.15,
          }}
        >
          {message}
        </div>
      </div>
    </div>
  );
};
