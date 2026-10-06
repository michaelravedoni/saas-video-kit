import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useScene } from "../engine/scene";
import { COLORS, FONT, SPRINGS } from "../theme";
import { Pill } from "./Pill";

// Écran « choix de poste » RECRÉÉ (aucune capture n'existe), dans le style de l'application.
export const CARD_W = 800;
export const HEADER_H = 160;
export const ROW_H = 140;
export const PANEL_H = 130;
const PAD = 36;

// Cibles du curseur (coordonnées de scène) pour une carte posée en (cardLeft, cardTop) :
// bouton « Choisir » de la ligne choisie, puis créneau choisi.
export const choiceTargets = (
  cardLeft: number,
  cardTop: number,
  selectRow: number,
  slotIndex: number,
) => ({
  choose: {
    x: cardLeft + CARD_W - 36 - 95,
    y: cardTop + HEADER_H + selectRow * ROW_H + ROW_H / 2,
  },
  slot: {
    x: cardLeft + 36 + slotIndex * (340 + 16) + 170,
    y: cardTop + HEADER_H + (selectRow + 1) * ROW_H + PANEL_H / 2,
  },
});

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const CheckIcon: React.FC<{ color: string; size?: number }> = ({
  color,
  size = 30,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M5 12.5 L10 17.5 L19 7"
      stroke={color}
      strokeWidth={3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const QuotaBadge: React.FC<{
  value: number;
  total: number;
  changedAt: number;
}> = ({ value, total, changedAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: frame - changedAt,
    fps,
    config: SPRINGS.pop,
    durationInFrames: 16,
  });
  const complete = value >= total;
  return (
    <div
      style={{
        padding: "8px 22px",
        borderRadius: 999,
        fontFamily: FONT(),
        fontSize: 36,
        fontWeight: 700,
        whiteSpace: "nowrap",
        backgroundColor: complete ? COLORS.successTint : COLORS.dangerTint,
        color: complete ? COLORS.success : COLORS.danger,
        scale: frame >= changedAt ? interpolate(pop, [0, 1], [1.25, 1]) : 1,
      }}
    >
      {value} / {total}
    </div>
  );
};

const Gauge: React.FC<{ ratio: number; complete: boolean }> = ({
  ratio,
  complete,
}) => (
  <div
    style={{
      height: 12,
      borderRadius: 999,
      backgroundColor: COLORS.blueTint,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        width: `${ratio * 100}%`,
        height: "100%",
        borderRadius: 999,
        backgroundColor: complete ? COLORS.success : COLORS.blue,
      }}
    />
  </div>
);

type RowProps = {
  top: number;
  name: string;
  total: number;
  value: number;
  changedAt: number;
  action: React.ReactNode;
  tint?: string;
  tintOpacity?: number;
};

const Row: React.FC<RowProps> = ({
  top,
  name,
  total,
  value,
  changedAt,
  action,
  tint,
  tintOpacity = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // La jauge se remplit en douceur à chaque changement.
  const g = spring({
    frame: frame - changedAt,
    fps,
    config: SPRINGS.smooth,
    durationInFrames: 20,
  });
  const prev = Math.max(value - 1, 0);
  const ratio =
    frame >= changedAt
      ? interpolate(g, [0, 1], [prev / total, value / total])
      : prev / total;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top,
        width: CARD_W,
        height: ROW_H,
        boxSizing: "border-box",
        padding: `0 ${PAD}px`,
        display: "flex",
        alignItems: "center",
        gap: 24,
        borderTop: `1px solid ${COLORS.line}`,
        fontFamily: FONT(),
      }}
    >
      {tint ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: tint,
            opacity: tintOpacity,
          }}
        />
      ) : null}
      <div style={{ width: 320, position: "relative" }}>
        <div
          style={{
            fontSize: 40,
            fontWeight: 600,
            color: COLORS.ink,
            marginBottom: 14,
          }}
        >
          {name}
        </div>
        <Gauge ratio={ratio} complete={value >= total} />
      </div>
      <div style={{ position: "relative" }}>
        <QuotaBadge value={value} total={total} changedAt={changedAt} />
      </div>
      <div
        style={{
          position: "relative",
          marginLeft: "auto",
          display: "flex",
          justifyContent: "flex-end",
          width: 190,
        }}
      >
        {action}
      </div>
    </div>
  );
};

const ChooseButton: React.FC<{ pressAt?: number }> = ({ pressAt }) => {
  const { copy } = useScene("choiceCard");
  const frame = useCurrentFrame();
  const press =
    pressAt === undefined
      ? 1
      : interpolate(
          frame,
          [pressAt, pressAt + 4, pressAt + 12],
          [1, 0.92, 1],
          clamp,
        );
  return (
    <div
      style={{
        height: 64,
        padding: "0 30px",
        display: "flex",
        alignItems: "center",
        borderRadius: 12,
        border: `3px solid ${COLORS.blue}`,
        color: COLORS.blue,
        fontFamily: FONT(),
        fontSize: 34,
        fontWeight: 600,
        scale: press,
      }}
    >
      {copy.choose}
    </div>
  );
};

export const VolunteerCard: React.FC = () => {
  const { copy, cues, props } = useScene("choiceCard");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = cues;
  const { rows, selectRow, fillRow, slotIndex } = props;

  // Ouverture puis fermeture du sélecteur de créneau
  const open = spring({
    frame: frame - (c.choose + 2),
    fps,
    config: SPRINGS.smooth,
    durationInFrames: 16,
  });
  const close = spring({
    frame: frame - c.collapse,
    fps,
    config: SPRINGS.smooth,
    durationInFrames: 16,
  });
  const e = open * (1 - close);
  const E = PANEL_H * e;

  const selecting = interpolate(frame, [c.choose, c.choose + 6], [0, 1], clamp);
  const validated = frame >= c.validated;
  const validatedP = spring({
    frame: frame - c.validated,
    fps,
    config: SPRINGS.pop,
    durationInFrames: 16,
  });
  const slotChosen = frame >= c.slotClick;

  // Ligne choisie : +1 à la validation. Ligne qui se remplit : +1 à chacun des deux paliers.
  const fillSteps = (frame >= c.timer2 ? 1 : 0) + (frame >= c.timer3 ? 1 : 0);
  const fillChanged =
    frame >= c.timer3 ? c.timer3 : frame >= c.timer2 ? c.timer2 : -999;

  const rowsTop = HEADER_H;
  return (
    <div
      style={{
        width: CARD_W,
        height: HEADER_H + rows.length * ROW_H + E,
        position: "relative",
        overflow: "hidden",
        borderRadius: 20,
        backgroundColor: COLORS.white,
        border: `1px solid ${COLORS.line}`,
        boxShadow: "0 40px 80px rgba(16,88,200,.18)",
        fontFamily: FONT(),
      }}
    >
      <div style={{ padding: `${PAD - 4}px ${PAD}px` }}>
        <div
          style={{
            fontSize: 60,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: COLORS.ink,
          }}
        >
          {copy.cardTitle}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 32,
            fontWeight: 500,
            color: COLORS.gray,
          }}
        >
          {copy.cardMeta}
        </div>
      </div>

      {rows.map((row, i) => {
        const top = rowsTop + i * ROW_H + (i > selectRow ? E : 0);
        const name = copy.rows[i].name;

        // Ligne choisie par l'utilisateur
        if (i === selectRow) {
          return (
            <Row
              key={i}
              top={top}
              name={name}
              total={row.total}
              value={row.value + (validated ? 1 : 0)}
              changedAt={c.validated}
              tint={validated ? COLORS.successTint : COLORS.blueTint}
              tintOpacity={validated ? 0.6 : selecting * 0.7}
              action={
                validated ? (
                  <div
                    style={{
                      scale: interpolate(validatedP, [0, 1], [0.7, 1]),
                      opacity: validatedP,
                    }}
                  >
                    <Pill
                      label={copy.validated}
                      tone="success"
                      size={34}
                      icon={<CheckIcon color={COLORS.success} />}
                    />
                  </div>
                ) : (
                  <ChooseButton pressAt={c.choose} />
                )
              }
            />
          );
        }

        // Ligne qui se remplit toute seule jusqu'à « Complet »
        if (i === fillRow) {
          const value = row.value + fillSteps;
          return (
            <Row
              key={i}
              top={top}
              name={name}
              total={row.total}
              value={value}
              changedAt={fillChanged}
              action={
                value >= row.total ? (
                  <Pill label={copy.full} tone="gray" size={34} />
                ) : (
                  <ChooseButton />
                )
              }
            />
          );
        }

        // Autres lignes : statiques
        return (
          <Row
            key={i}
            top={top}
            name={name}
            total={row.total}
            value={row.value}
            changedAt={-999}
            action={<ChooseButton />}
          />
        );
      })}

      {/* Sélecteur de créneau, sous la ligne choisie */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: rowsTop + (selectRow + 1) * ROW_H,
          width: CARD_W,
          height: E,
          overflow: "hidden",
          opacity: e,
          backgroundColor: COLORS.bg,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 16,
            padding: `${(PANEL_H - 76) / 2}px ${PAD}px`,
          }}
        >
          {copy.slots.map((label, i) => {
            const selected = i === slotIndex && slotChosen;
            return (
              <div
                key={label}
                style={{
                  width: 340,
                  height: 76,
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 14,
                  fontSize: 34,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  border: `3px solid ${selected ? COLORS.blue : COLORS.blueMid}`,
                  backgroundColor: selected ? COLORS.blue : COLORS.white,
                  color: selected ? COLORS.white : COLORS.ink,
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
