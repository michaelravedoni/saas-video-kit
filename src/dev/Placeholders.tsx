import React from "react";
import { AbsoluteFill } from "remotion";
import { REGISTRY } from "../generated/registry";
import { setActive } from "../engine/active";
import { COLORS, FONT } from "../theme";

// Captures de REMPLACEMENT : maquettes « fil de fer » sans texte (neutres, sans langue) aux couleurs de la marque.
// Elles permettent de prévisualiser et valider toute la chaîne avant de recevoir les vraies captures.
// Chaque image porte un badge « PLACEHOLDER » : à remplacer avant la publication (le validateur le rappelle).
//   npm run placeholders -- <vidéo>
// Mise en page : les repères de la scène « reveal » (ligne cliquée) correspondent à la 1re ligne du tableau.

export type PlaceholderProps = { videoId: string; locale: string };

const useBrand = (videoId: string, locale: string) => {
  const entry = REGISTRY[videoId];
  if (!entry) throw new Error(`Vidéo inconnue : « ${videoId} ».`);
  setActive({
    brand: entry.brand,
    video: entry.video,
    locale,
    format: "16x9",
    copy: entry.copy[locale] ?? {},
  });
  return entry.brand;
};

const bar = (
  w: number | string,
  h = 14,
  color: string = COLORS.line,
  radius = 7,
): React.CSSProperties => ({
  width: w,
  height: h,
  borderRadius: radius,
  backgroundColor: color,
});

const Badge: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div
    style={{
      position: "absolute",
      right: 24 * scale,
      bottom: 24 * scale,
      padding: `${8 * scale}px ${18 * scale}px`,
      borderRadius: 999,
      backgroundColor: COLORS.ink,
      color: COLORS.white,
      fontFamily: FONT(),
      fontWeight: 700,
      fontSize: 18 * scale,
      letterSpacing: "0.08em",
    }}
  >
    PLACEHOLDER
  </div>
);

// ── Ordinateur : 1440×900 (à rendre avec --scale=2 → 2880×1800) ──
export const PlaceholderDesktop: React.FC<PlaceholderProps> = ({
  videoId,
  locale,
}) => {
  useBrand(videoId, locale);
  const W = 1440,
    H = 900;
  const card: React.CSSProperties = {
    position: "absolute",
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 12,
    boxShadow: "0 2px 6px rgba(15,23,42,.06)",
  };
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* barre du haut */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: W,
          height: 62,
          backgroundColor: COLORS.white,
          borderBottom: `1px solid ${COLORS.line}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 24,
            top: 18,
            ...bar(26, 26, COLORS.blue, 7),
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 62,
            top: 24,
            ...bar(70, 14, COLORS.ink),
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 70,
            top: 18,
            ...bar(260, 26, COLORS.bg, 8),
            border: `1px solid ${COLORS.line}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 24,
            top: 15,
            ...bar(32, 32, COLORS.ink, 16),
          }}
        />
      </div>
      {/* menu latéral */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 62,
          width: 340,
          height: H - 62,
          backgroundColor: COLORS.white,
          borderRight: `1px solid ${COLORS.line}`,
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 20,
              top: 28 + i * 52,
              width: 300,
              height: 40,
              borderRadius: 9,
              backgroundColor: i === 1 ? COLORS.line : "transparent",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 12,
                top: 11,
                ...bar(18, 18, i === 1 ? COLORS.blue : COLORS.blueMid, 5),
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 44,
                top: 13,
                ...bar(
                  i % 3 === 0 ? 120 : 90,
                  14,
                  i === 1 ? COLORS.ink : COLORS.gray,
                ),
              }}
            />
          </div>
        ))}
      </div>
      {/* titre */}
      <div
        style={{
          position: "absolute",
          left: 353,
          top: 100,
          ...bar(240, 30, COLORS.ink, 9),
        }}
      />
      {/* 4 cartes de statistiques */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            ...card,
            left: 353 + i * 266,
            top: 166,
            width: 246,
            height: 138,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 20,
              top: 22,
              ...bar(100, 12, COLORS.gray),
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 20,
              top: 52,
              ...bar(70, 34, COLORS.ink, 8),
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 20,
              top: 104,
              ...bar(90, 10, COLORS.line),
            }}
          />
        </div>
      ))}
      {/* tableau : 5 lignes (la 1re = ligne cliquée de la scène « reveal ») */}
      <div style={{ ...card, left: 353, top: 331, width: 516, height: 449 }}>
        <div
          style={{
            position: "absolute",
            left: 20,
            top: 18,
            ...bar(120, 16, COLORS.ink),
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 62,
            width: 516,
            height: 1,
            backgroundColor: COLORS.line,
          }}
        />
        {[0, 1, 2].map((c) => (
          <div
            key={c}
            style={{
              position: "absolute",
              left: 20 + c * 150,
              top: 80,
              ...bar(70, 11, COLORS.gray),
            }}
          />
        ))}
        {[0, 1, 2, 3, 4].map((r) => (
          <div
            key={r}
            style={{
              position: "absolute",
              left: 0,
              top: 112 + r * 57,
              width: 516,
              height: 57,
              borderTop: `1px solid ${COLORS.line}`,
            }}
          >
            {[0, 1, 2].map((c) => (
              <div
                key={c}
                style={{
                  position: "absolute",
                  left: 20 + c * 150,
                  top: 22,
                  ...bar(c === 0 ? 110 : 80, 12, COLORS.ink, 6),
                }}
              />
            ))}
          </div>
        ))}
      </div>
      {/* activités */}
      <div style={{ ...card, left: 892, top: 331, width: 520, height: 540 }}>
        <div
          style={{
            position: "absolute",
            left: 20,
            top: 18,
            ...bar(100, 16, COLORS.ink),
          }}
        />
        {[0, 1, 2, 3, 4].map((r) => (
          <div
            key={r}
            style={{
              position: "absolute",
              left: 20,
              top: 80 + r * 88,
              width: 480,
            }}
          >
            <div style={{ ...bar(64, 24, COLORS.successTint, 7) }} />
            <div
              style={{
                position: "absolute",
                left: 90,
                top: 2,
                ...bar(260, 12, COLORS.ink),
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 90,
                top: 28,
                ...bar(190, 11, COLORS.gray),
              }}
            />
          </div>
        ))}
      </div>
      <Badge />
    </AbsoluteFill>
  );
};

// ── Mobile : 720×1601 (à rendre avec --scale=2 → 1440×3202) ──
export const PlaceholderMobile: React.FC<PlaceholderProps> = ({
  videoId,
  locale,
}) => {
  useBrand(videoId, locale);
  const card: React.CSSProperties = {
    position: "absolute",
    left: 28,
    width: 664,
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 18,
    boxShadow: "0 2px 8px rgba(15,23,42,.06)",
  };
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 36,
          ...bar(40, 40, COLORS.blue, 10),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 84,
          top: 48,
          ...bar(180, 16, COLORS.ink),
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 28,
          top: 48,
          ...bar(110, 16, COLORS.gray),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 150,
          ...bar(120, 14, COLORS.gray),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 184,
          ...bar(360, 36, COLORS.ink, 10),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 246,
          ...bar(300, 14, COLORS.gray),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 282,
          ...bar(240, 16, COLORS.ink),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 322,
          ...bar(280, 14, COLORS.gray),
        }}
      />
      <div style={{ ...card, top: 410, height: 520 }}>
        <div
          style={{
            position: "absolute",
            left: 32,
            top: 34,
            ...bar(180, 20, COLORS.ink),
          }}
        />
        {[0, 1].map((i) => (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: 32,
                top: 100 + i * 150,
                ...bar(260, 13, COLORS.gray),
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 32,
                top: 132 + i * 150,
                width: 600,
                height: 64,
                borderRadius: 12,
                border: `1px solid ${COLORS.line}`,
                backgroundColor: COLORS.bg,
              }}
            />
          </React.Fragment>
        ))}
        <div
          style={{
            position: "absolute",
            left: 32,
            top: 410,
            ...bar(150, 64, COLORS.blue, 12),
          }}
        />
      </div>
      <div style={{ ...card, top: 980, height: 440 }}>
        <div
          style={{
            position: "absolute",
            left: 32,
            top: 34,
            ...bar(300, 20, COLORS.ink),
          }}
        />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 32,
              top: 100 + i * 100,
              width: 400 + i * 40,
              height: 64,
              borderRadius: 12,
              border: `1px solid ${COLORS.line}`,
              backgroundColor: COLORS.white,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 20,
                top: 25,
                ...bar(200, 14, COLORS.ink),
              }}
            />
          </div>
        ))}
      </div>
      <Badge scale={1.2} />
    </AbsoluteFill>
  );
};

// ── Logo : 500×166, fond transparent ──
export const PlaceholderLogo: React.FC<PlaceholderProps> = ({
  videoId,
  locale,
}) => {
  const brand = useBrand(videoId, locale);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: FONT(),
          fontWeight: 800,
          fontSize: 96,
          letterSpacing: "-0.03em",
          color: COLORS.blue,
          lineHeight: 1,
        }}
      >
        {brand.name}
      </div>
    </AbsoluteFill>
  );
};
