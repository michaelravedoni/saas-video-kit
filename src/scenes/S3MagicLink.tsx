import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useScene } from "../engine/scene";
import { COLORS } from "../theme";
import { Cursor } from "../components/Cursor";
import {
  KeyStrike,
  MagicLinkPhone,
  magicGeometry,
} from "../components/MagicLinkPhone";
import { TextCue } from "../components/TextCue";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Géométrie (px, coordonnées de la scène)
const PHONE = { left: 1100, top: 90 };

// Cibles du curseur (coordonnées de scène)
const {
  btn: BTN,
  check1: CHECK1,
  check2: CHECK2,
} = magicGeometry(PHONE.left, PHONE.top);

export const S3MagicLink: React.FC = () => {
  const { copy, cues } = useScene("phoneFlow");
  const frame = useCurrentFrame();
  const halo = interpolate(frame, [0, 30], [0, 1], clamp);
  const push = interpolate(frame, [cues.phone[0], 370], [1, 1.04], clamp);

  // Le curseur n'est visible que pendant les deux temps d'interaction.
  const cursorOpacity =
    interpolate(frame, [112, 122], [0, 1], clamp) *
      interpolate(frame, [166, 176], [1, 0], clamp) +
    interpolate(frame, [236, 246], [0, 1], clamp);

  return (
    <AbsoluteFill
      name="S3 · Le lien magique"
      style={{ backgroundColor: COLORS.bg }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(1000px 900px at 1380px 560px, rgba(16,88,200,${0.1 * halo}), rgba(16,88,200,0) 70%), radial-gradient(900px 600px at 200px 900px, rgba(16,88,200,${0.06 * halo}), rgba(16,88,200,0) 70%)`,
        }}
      />

      {/* Titre + clé barrée */}
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 0,
          width: 940,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 36,
        }}
      >
        <KeyStrike />
        <TextCue
          cue={cues.title}
          text={copy.title}
          highlight={copy.titleHighlight}
          align="left"
          maxWidth={940}
        />
      </div>

      {/* « 2 clics pour s'inscrire. » + sous-titre */}
      <div style={{ position: "absolute", left: 140, top: 250, width: 940 }}>
        <TextCue
          cue={cues.clicks}
          text={copy.clicks}
          highlight={copy.clicksHighlight}
          align="left"
          maxWidth={940}
          hold
        />
      </div>
      <div style={{ position: "absolute", left: 140, top: 600, width: 940 }}>
        <TextCue
          cue={cues.family}
          text={copy.family}
          size={76}
          weight={600}
          align="left"
          maxWidth={800}
          hold
        />
      </div>

      <MagicLinkPhone left={PHONE.left} top={PHONE.top} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: cursorOpacity,
          scale: push,
          transformOrigin: "1380px 560px",
        }}
      >
        <Cursor
          path={[
            { frame: 118, x: 1500, y: 960 },
            { frame: 144, x: BTN.x, y: BTN.y },
            { frame: 172, x: BTN.x, y: BTN.y },
            { frame: 236, x: 1560, y: 640 },
            { frame: 258, x: CHECK1.x, y: CHECK1.y },
            { frame: 288, x: CHECK2.x, y: CHECK2.y },
          ]}
          clicks={[cues.click, cues.check1, cues.check2]}
        />
      </div>
    </AbsoluteFill>
  );
};
