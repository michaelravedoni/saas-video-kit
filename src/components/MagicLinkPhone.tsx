import React from "react";
import { captureFile } from "../engine/assets";
import {
  CanvasImage,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useScene } from "../engine/scene";
import { COLORS, FONT, SPRINGS } from "../theme";
import { CheckRow } from "./CheckRow";
import { PhoneMock } from "./PhoneMock";
import { Pill } from "./Pill";

// Téléphone de S3 (e-mail → profil → famille) et clé barrée, partagés par les versions 16:9 et 9:16.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const DEFAULT_PHONE_W = 560;

// Géométrie de l'écran du téléphone et cibles du curseur, en coordonnées de scène.
export const magicGeometry = (
  left: number,
  top: number,
  width = DEFAULT_PHONE_W,
) => {
  const bezel = width * 0.04;
  const screenW = width - 2 * bezel;
  const sx = left + bezel;
  const sy = top + bezel;
  return {
    screenW,
    btn: { x: sx + screenW / 2, y: sy + 674 },
    check1: { x: sx + 435, y: sy + 415 },
    check2: { x: sx + 435, y: sy + 595 },
  };
};

export const KeyStrike: React.FC = () => {
  const { cues } = useScene("phoneFlow");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - 6,
    fps,
    config: SPRINGS.smooth,
    durationInFrames: 22,
  });
  const strike = interpolate(frame, [30, 48], [0, 1], clamp);
  const exit = interpolate(
    frame,
    [cues.title[1] - 8, cues.title[1]],
    [1, 0],
    clamp,
  );
  return (
    <svg
      width={150}
      height={150}
      viewBox="0 0 24 24"
      fill="none"
      style={{ opacity: p * exit, scale: interpolate(p, [0, 1], [0.8, 1]) }}
    >
      <g opacity={interpolate(strike, [0, 1], [1, 0.35])}>
        <circle cx={7.5} cy={12} r={4} stroke={COLORS.ink} strokeWidth={1.8} />
        <path
          d="M11.5 12 H21 M17.5 12 V15.5 M20.5 12 V14.5"
          stroke={COLORS.ink}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </g>
      <path
        d="M3 20.5 L21 3.5"
        stroke={COLORS.blue}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeDasharray={26}
        strokeDashoffset={26 * (1 - strike)}
      />
    </svg>
  );
};

const EmailScreen: React.FC<{ screenW: number }> = ({ screenW: SCREEN_W }) => {
  const { copy, cues } = useScene("phoneFlow");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = spring({
    frame: frame - cues.email[0],
    fps,
    config: SPRINGS.pop,
    durationInFrames: 22,
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: COLORS.bg,
        fontFamily: FONT(),
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 76,
          left: 28,
          fontSize: 38,
          fontWeight: 700,
          color: COLORS.ink,
        }}
      >
        {copy.inbox}
      </div>
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 20,
          width: SCREEN_W - 40,
          height: 600,
          boxSizing: "border-box",
          padding: 28,
          borderRadius: 24,
          backgroundColor: COLORS.white,
          border: `1px solid ${COLORS.line}`,
          boxShadow: "0 12px 32px rgba(15,23,42,.1)",
          opacity: card,
          translate: `0px ${interpolate(card, [0, 1], [-60, 0])}px`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 999,
              backgroundColor: COLORS.blue,
              color: COLORS.white,
              fontSize: 32,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            T
          </div>
          <div>
            <div style={{ fontSize: 34, fontWeight: 700, color: COLORS.ink }}>
              {copy.emailSender}
            </div>
            <div style={{ fontSize: 28, fontWeight: 500, color: COLORS.gray }}>
              {copy.emailNow}
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: 40,
            fontWeight: 700,
            lineHeight: 1.15,
            color: COLORS.ink,
          }}
        >
          {copy.emailSubject}
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 32,
            fontWeight: 500,
            lineHeight: 1.25,
            color: COLORS.gray,
          }}
        >
          {copy.emailBody}
        </div>
        <div
          style={{
            position: "absolute",
            left: 28,
            right: 28,
            bottom: 28,
            display: "flex",
          }}
        >
          <WideButton />
        </div>
      </div>
    </div>
  );
};

// Bouton « Se connecter » pleine largeur, avec effet d'appui au clic.
const WideButton: React.FC = () => {
  const { cues } = useScene("phoneFlow");
  const frame = useCurrentFrame();
  const press = interpolate(
    frame - cues.click,
    [0, 4, 12],
    [1, 0.94, 1],
    clamp,
  );
  return (
    <div style={{ width: "100%", scale: press }}>
      <ButtonFull />
    </div>
  );
};

const ButtonFull: React.FC = () => {
  const { copy } = useScene("phoneFlow");
  return (
    <div
      style={{
        height: 96,
        borderRadius: 14,
        backgroundColor: COLORS.blue,
        color: COLORS.white,
        fontFamily: FONT(),
        fontSize: 40,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 12px 28px rgba(16,88,200,.35)",
      }}
    >
      {copy.emailButton}
    </div>
  );
};

const FamilyScreen: React.FC<{ screenW: number }> = ({ screenW: SCREEN_W }) => {
  const { copy, cues } = useScene("phoneFlow");
  const frame = useCurrentFrame();
  const done = [cues.check1, cues.check2].filter((c) => frame >= c).length;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: COLORS.bg,
        fontFamily: FONT(),
      }}
    >
      <div style={{ position: "absolute", top: 76, left: 28, right: 28 }}>
        <div
          style={{
            fontSize: 46,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: COLORS.ink,
          }}
        >
          {copy.eventName}
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 32,
            fontWeight: 500,
            color: COLORS.gray,
          }}
        >
          {copy.eventMeta}
        </div>
        <div style={{ marginTop: 24 }}>
          <Pill
            label={`${done} / ${copy.items.length} ${copy.registered}`}
            tone={done === copy.items.length ? "success" : "blue"}
            size={34}
            from={cues.familyScreen}
          />
        </div>
      </div>
      {copy.items.map((item, i) => (
        <div
          key={i}
          style={{ position: "absolute", top: 340 + i * 180, left: 20 }}
        >
          <CheckRow
            name={item.name}
            meta={item.meta}
            width={SCREEN_W - 40}
            checkAt={i === 0 ? cues.check1 : cues.check2}
          />
        </div>
      ))}
    </div>
  );
};

export const MagicLinkPhone: React.FC<{
  left?: number;
  top?: number;
  width?: number;
}> = ({ left = 1100, top = 90, width: PHONE_W = DEFAULT_PHONE_W }) => {
  const { cues, props } = useScene("phoneFlow");
  const SCREEN_W = magicGeometry(left, top, PHONE_W).screenW;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - cues.phone[0],
    fps,
    config: SPRINGS.smooth,
    durationInFrames: 28,
  });
  const p1 = spring({
    frame: frame - (cues.click + 4),
    fps,
    config: SPRINGS.smooth,
    durationInFrames: 22,
  });
  const p2 = spring({
    frame: frame - cues.familyScreen,
    fps,
    config: SPRINGS.smooth,
    durationInFrames: 22,
  });
  const push = interpolate(
    frame,
    [cues.phone[0], cues.phone[1]],
    [1, 1.04],
    clamp,
  );

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        opacity: enter,
        translate: `0px ${interpolate(enter, [0, 1], [320, 0])}px`,
        scale: push,
        transformOrigin: "50% 40%",
      }}
    >
      <PhoneMock width={PHONE_W}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            translate: `${-SCREEN_W * p1}px 0px`,
          }}
        >
          <EmailScreen screenW={SCREEN_W} />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            translate: `${SCREEN_W * (1 - p1) - SCREEN_W * p2}px 0px`,
          }}
        >
          <CanvasImage
            src={captureFile(props.profileCapture)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top",
            }}
          />
          {/* zone floutée de la capture (ex. lien de connexion personnel) */}
          {props.blur ? (
            <div
              style={{
                position: "absolute",
                left: props.blur.left,
                top: props.blur.top,
                width: props.blur.width,
                height: props.blur.height,
                borderRadius: 10,
                backdropFilter: "blur(9px)",
                backgroundColor: "rgba(255,255,255,0.55)",
              }}
            />
          ) : null}
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            translate: `${SCREEN_W * (1 - p2)}px 0px`,
          }}
        >
          <FamilyScreen screenW={SCREEN_W} />
        </div>
      </PhoneMock>
    </div>
  );
};
