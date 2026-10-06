import React from "react";
import { CanvasImage } from "remotion";
import { getActive } from "../engine/active";
import { logoFile } from "../engine/assets";

// Logo de la marque active (brand.json). À ne pas utiliser sur fond sombre si le logo est foncé.
export const Logo: React.FC<{
  width?: number;
  style?: React.CSSProperties;
}> = ({ width = 500, style }) => {
  const { logo } = getActive().brand;
  return (
    <CanvasImage
      src={logoFile()}
      style={{ width, height: (width * logo.height) / logo.width, ...style }}
    />
  );
};
