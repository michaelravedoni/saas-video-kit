import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useScene } from "../engine/scene";
import { COLORS, SAFE_V, TYPE_V } from "../theme";
import { Cursor } from "../components/Cursor";
import {
  KeyStrike,
  MagicLinkPhone,
  magicGeometry,
} from "../components/MagicLinkPhone";
import { SafeGuides } from "../components/SafeGuides";
import { TextCue } from "../components/TextCue";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Géométrie (px, scène 1080×1920) : texte en haut, téléphone centré dessous.
const PHONE_W = 560;
const PHONE = { left: (1080 - PHONE_W) / 2, top: 700 };
const {
  btn: BTN,
  check1: CHECK1,
  check2: CHECK2,
} = magicGeometry(PHONE.left, PHONE.top, PHONE_W);
const ORIGIN = "540px 1100px";

export const S3MagicLinkV: React.FC = () => {
  const { copy, cues } = useScene("phoneFlow");
  const frame = useCurrentFrame();
  const halo = interpolate(frame, [0, 30], [0, 1], clamp);
  const push = interpolate(frame, [cues.phone[0], 370], [1, 1.03], clamp);

  const cursorOpacity =
    interpolate(frame, [112, 122], [0, 1], clamp) *
      interpolate(frame, [166, 176], [1, 0], clamp) +
    interpolate(frame, [236, 246], [0, 1], clamp);

  return (
    <AbsoluteFill
      name="S3 · Le lien magique (9:16)"
      style={{ backgroundColor: COLORS.bg }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 900px at 540px 1050px, rgba(16,88,200,${0.1 * halo}), rgba(16,88,200,0) 70%), radial-gradient(700px 500px at 150px 250px, rgba(16,88,200,${0.06 * halo}), rgba(16,88,200,0) 70%)`,
        }}
      />

      {/* Clé barrée + « Zéro mot de passe. » */}
      <div
        style={{
          position: "absolute",
          left: SAFE_V.x,
          top: SAFE_V.top,
          width: SAFE_V.width,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <KeyStrike />
        <TextCue
          cue={cues.title}
          text={copy.title}
          highlight={copy.titleHighlight}
          size={TYPE_V.title}
          align="left"
          maxWidth={SAFE_V.width}
        />
      </div>

      {/* « 2 clics pour s'inscrire. » + sous-titre */}
      <div
        style={{
          position: "absolute",
          left: SAFE_V.x,
          top: SAFE_V.top,
          width: SAFE_V.width,
        }}
      >
        <TextCue
          cue={cues.clicks}
          text={copy.clicks}
          highlight={copy.clicksHighlight}
          size={TYPE_V.title}
          align="left"
          maxWidth={SAFE_V.width}
          hold
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: SAFE_V.x,
          top: SAFE_V.top + 270,
          width: SAFE_V.width,
        }}
      >
        <TextCue
          cue={cues.family}
          text={copy.family}
          size={TYPE_V.subtitle}
          weight={600}
          align="left"
          maxWidth={760}
          hold
        />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          scale: push,
          transformOrigin: ORIGIN,
        }}
      >
        <MagicLinkPhone left={PHONE.left} top={PHONE.top} width={PHONE_W} />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: cursorOpacity,
          scale: push,
          transformOrigin: ORIGIN,
        }}
      >
        <Cursor
          path={[
            { frame: 118, x: 760, y: 1480 },
            { frame: 144, x: BTN.x, y: BTN.y },
            { frame: 172, x: BTN.x, y: BTN.y },
            { frame: 236, x: 820, y: 1200 },
            { frame: 258, x: CHECK1.x, y: CHECK1.y },
            { frame: 288, x: CHECK2.x, y: CHECK2.y },
          ]}
          clicks={[cues.click, cues.check1, cues.check2]}
        />
      </div>

      <SafeGuides />
    </AbsoluteFill>
  );
};
