import React, { createContext, useContext } from "react";
import { COPY } from "../copy";
import { ARCHETYPES, type SceneData } from "./archetypes";
import type { SceneConfig, SceneType } from "./types";

// Contexte d'une scène : ses textes (copy.<langue>.json, sous l'identifiant de la scène), ses paramètres
// (video.json « props », complétés par les valeurs par défaut) et ses repères d'animation (« cues »,
// valeurs par défaut de l'archétype, surchargeables par scène).

type Loose = Record<string, unknown>;
type Value = {
  id: string;
  type: SceneType;
  copy: Loose;
  props: Loose;
  cues: Loose;
};

const Ctx = createContext<Value | null>(null);

const mergeCues = (base: Loose, over: Loose | undefined): Loose => ({
  ...base,
  ...(over ?? {}),
});

export const SceneProvider: React.FC<{
  scene: SceneConfig;
  children: React.ReactNode;
}> = ({ scene, children }) => {
  // Scène « custom » : pas de manifeste (paramètres et repères libres) ; ses textes sont facultatifs.
  const manifest =
    scene.type === "custom"
      ? { propsDefaults: {}, cues: {} }
      : ARCHETYPES[scene.type];
  const id =
    scene.id ??
    (scene.type === "custom" ? (scene.name ?? "custom") : scene.type);
  const found = (COPY as Record<string, unknown>)[id] as Loose | undefined;
  const copy = found ?? (scene.type === "custom" ? {} : undefined);
  if (!copy)
    throw new Error(
      `Textes manquants pour la scène « ${id} » (clé « ${id} » absente de copy.<langue>.json).`,
    );
  const value: Value = {
    id,
    type: scene.type,
    copy,
    props: { ...manifest.propsDefaults, ...(scene.props ?? {}) },
    cues: mergeCues(manifest.cues as Loose, scene.cues as Loose | undefined),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

/** Textes, paramètres et repères de la scène en cours, typés selon son archétype. */
export function useScene<T extends SceneType>(
  type: T,
): SceneData[T] & { id: string } {
  const v = useContext(Ctx);
  if (!v)
    throw new Error(
      "useScene() doit être appelé sous <SceneProvider> (voir src/engine/Timeline.tsx).",
    );
  if (v.type !== type)
    throw new Error(
      `useScene("${type}") appelé dans une scène de type « ${v.type} ».`,
    );
  return v as unknown as SceneData[T] & { id: string };
}
