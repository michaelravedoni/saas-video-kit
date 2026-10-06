import React from "react";
import { AbsoluteFill, CanvasImage } from "remotion";
import { BrowserFrame } from "../components/BrowserFrame";
import { Logo } from "../components/Logo";
import { PhoneMock } from "../components/PhoneMock";
import { SwissFlag } from "../components/SwissFlag";
import { COPY } from "../copy";
import { getActive } from "../engine/active";
import { captureFile } from "../engine/assets";
import { fontWidthFactor } from "../engine/fonts";
import { COLORS, FONT } from "../theme";

// Miniatures YouTube pilotées par la marque et la vidéo :
//   - texte : copy.<langue>.json, clé « thumbnail » { lines[], highlight, badge }
//   - visuels : video.json, clé « thumbnails » { desktopCapture, mobileCapture }
// Deux formats : 16:9 (1280×720) et Shorts 9:16 (1080×1920, contenu dans la zone y 220 → 1540).

type ThumbCopy = { lines: string[]; highlight: string; badge: string };

const thumbCopy = (): ThumbCopy =>
  (COPY as Record<string, unknown>).thumbnail as ThumbCopy;

const thumbCaptures = () => {
  const cfg = getActive().video.thumbnails;
  if (!cfg) throw new Error("video.json : clé « thumbnails » manquante.");
  return cfg;
};

// Taille adaptée au texte : on réduit la taille de base si la ligne la plus longue dépasse la largeur
// disponible ou si le bloc dépasse la hauteur disponible (largeur moyenne d'un caractère : facteur de la police, src/engine/fonts.json).
const fitSize = (
  base: number,
  lines: string[],
  maxWidth: number,
  maxHeight: number,
): number => {
  const longest = Math.max(...lines.map((l) => l.length));
  return Math.floor(
    Math.min(
      base,
      maxWidth / (longest * fontWidthFactor(getActive().brand.font)),
      maxHeight / (lines.length * 1.04),
    ),
  );
};

const Headline: React.FC<{
  size: number;
  align: "left" | "center";
  maxWidth: number;
  maxHeight: number;
}> = ({ size: baseSize, align, maxWidth, maxHeight }) => {
  const { lines, highlight } = thumbCopy();
  const size = fitSize(baseSize, lines, maxWidth, maxHeight);
  return (
    <div
      style={{
        fontFamily: FONT(),
        fontSize: size,
        fontWeight: 800,
        letterSpacing: "-0.03em",
        lineHeight: 1.04,
        color: COLORS.ink,
        textAlign: align,
      }}
    >
      {lines.map((line, li) => (
        <div key={li}>
          {line.split(" ").map((word, wi, words) => (
            <React.Fragment key={wi}>
              {word === highlight ? (
                <span
                  style={{
                    color: COLORS.blue,
                    position: "relative",
                    display: "inline-block",
                  }}
                >
                  {word}
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: -size * 0.04,
                      height: size * 0.07,
                      borderRadius: 999,
                      backgroundColor: COLORS.blue,
                      opacity: 0.35,
                    }}
                  />
                </span>
              ) : (
                word
              )}
              {wi < words.length - 1 ? " " : null}
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
};

const Badge: React.FC<{ size: number; flag: number }> = ({ size, flag }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: size * 0.35,
      padding: `${size * 0.3}px ${size * 0.7}px`,
      borderRadius: 999,
      backgroundColor: COLORS.blueTint,
      color: COLORS.blue,
      fontFamily: FONT(),
      fontSize: size,
      fontWeight: 600,
      whiteSpace: "nowrap",
    }}
  >
    {getActive().brand.flag === "CH" ? <SwissFlag size={flag} /> : null}
    {thumbCopy().badge}
  </div>
);

const Halo: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(${r}px ${r}px at ${x}px ${y}px, rgba(16,88,200,.16), rgba(16,88,200,0) 70%)`,
    }}
  />
);

const Dashboard: React.FC<{ width: number }> = ({ width }) => {
  const h = width / 1.6;
  return (
    <BrowserFrame width={width} height={h + 56}>
      <CanvasImage
        src={captureFile(thumbCaptures().desktopCapture)}
        style={{ width, height: h }}
      />
    </BrowserFrame>
  );
};

const Phone: React.FC<{ width: number }> = ({ width }) => (
  <PhoneMock width={width}>
    <CanvasImage
      src={captureFile(thumbCaptures().mobileCapture)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "top",
      }}
    />
  </PhoneMock>
);

// ───────────── YouTube 16:9 · 1280×720 ─────────────
export const ThumbnailYoutube: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: FONT() }}>
    <Halo x={930} y={380} r={760} />
    <div style={{ position: "absolute", left: 56, top: 40 }}>
      <Logo width={250} />
    </div>
    <div style={{ position: "absolute", left: 60, top: 170 }}>
      <Headline size={96} align="left" maxWidth={640} maxHeight={420} />
    </div>
    <div style={{ position: "absolute", left: 60, bottom: 52 }}>
      <Badge size={32} flag={34} />
    </div>
    <div
      style={{
        position: "absolute",
        left: 716,
        top: 140,
        transform: "perspective(1800px) rotateY(-7deg)",
      }}
    >
      <Dashboard width={700} />
    </div>
    <div style={{ position: "absolute", left: 1000, top: 380 }}>
      <Phone width={250} />
    </div>
  </AbsoluteFill>
);

// ───────────── YouTube Shorts 9:16 · 1080×1920 ─────────────
export const ThumbnailShorts: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: FONT() }}>
    <Halo x={540} y={1100} r={1100} />
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 235,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Logo width={330} />
    </div>
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top: 400,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Headline size={136} align="center" maxWidth={920} maxHeight={460} />
    </div>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 880,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Badge size={38} flag={40} />
    </div>
    <div style={{ position: "absolute", left: 80, top: 990 }}>
      <Dashboard width={920} />
    </div>
    <div style={{ position: "absolute", left: 650, top: 1220 }}>
      <Phone width={330} />
    </div>
  </AbsoluteFill>
);
