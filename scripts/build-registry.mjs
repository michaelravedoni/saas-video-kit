// Génère src/generated/registry.ts : importe toutes les marques et vidéos de content/.
// Lancé automatiquement par les scripts npm (dev, build, render). À relancer après l'ajout d'une marque ou d'une vidéo.
import { readdirSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const brandsDir = join(root, "content", "brands");
const videosDir = join(root, "content", "videos");

const dirs = (d) =>
  existsSync(d)
    ? readdirSync(d, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
    : [];

const brands = dirs(brandsDir).filter((b) =>
  existsSync(join(brandsDir, b, "brand.json")),
);
const videos = dirs(videosDir).filter((v) =>
  existsSync(join(videosDir, v, "video.json")),
);

const ident = (s) => s.replace(/[^a-zA-Z0-9]/g, "_");
const lines = [
  "// FICHIER GÉNÉRÉ par scripts/build-registry.mjs : ne pas modifier à la main.",
  'import type { BrandConfig, CopyTree, VideoConfig } from "../engine/types";',
];

for (const b of brands)
  lines.push(
    `import brand_${ident(b)} from "../../content/brands/${b}/brand.json";`,
  );
const copyImports = [];
for (const v of videos) {
  lines.push(
    `import video_${ident(v)} from "../../content/videos/${v}/video.json";`,
  );
  for (const f of readdirSync(join(videosDir, v))) {
    const m = f.match(/^copy\.([a-z]{2})\.json$/);
    if (m) {
      lines.push(
        `import copy_${ident(v)}_${m[1]} from "../../content/videos/${v}/${f}";`,
      );
      copyImports.push([v, m[1]]);
    }
  }
}

// Scènes propres aux vidéos : content/videos/<id>/scenes/<Nom>.tsx (export par défaut : { "16x9": Composant, "9x16": Composant })
const customScenes = [];
for (const v of videos) {
  const sd = join(videosDir, v, "scenes");
  if (!existsSync(sd)) continue;
  for (const f of readdirSync(sd)) {
    const m = f.match(/^([A-Za-z0-9_-]+)\.tsx$/);
    if (!m) continue;
    lines.push(
      `import custom_${ident(v)}_${ident(m[1])} from "../../content/videos/${v}/scenes/${m[1]}";`,
    );
    customScenes.push([v, m[1]]);
  }
}
lines.push('import type { FC } from "react";');

lines.push(
  "",
  "export type RegistryEntry = { video: VideoConfig; brand: BrandConfig; copy: Record<string, CopyTree> };",
  "",
);
lines.push("export const REGISTRY: Record<string, RegistryEntry> = {");
for (const v of videos) {
  const locs = copyImports
    .filter(([vv]) => vv === v)
    .map(([, l]) => `      ${l}: copy_${ident(v)}_${l} as unknown as CopyTree,`)
    .join("\n");
  lines.push(
    `  "${v}": {`,
    `    video: video_${ident(v)} as unknown as VideoConfig,`,
    `    brand: (${brands.map((b) => `video_${ident(v)}.brand === "${b}" ? brand_${ident(b)} : `).join("")}undefined) as unknown as BrandConfig,`,
    `    copy: {`,
    locs,
    "    },",
    "  },",
  );
}
lines.push("};", "");

lines.push(
  'export const CUSTOM_SCENES: Record<string, Record<string, Partial<Record<"16x9" | "9x16", FC>>>> = {',
);
for (const v of videos) {
  const mine = customScenes.filter(([vv]) => vv === v);
  if (!mine.length) continue;
  lines.push(
    `  "${v}": {`,
    ...mine.map(([, n]) => `    "${n}": custom_${ident(v)}_${ident(n)},`),
    "  },",
  );
}
lines.push("};", "");

mkdirSync(join(root, "src", "generated"), { recursive: true });
writeFileSync(join(root, "src", "generated", "registry.ts"), lines.join("\n"));
console.log(`registry : ${brands.length} marque(s), ${videos.length} vidéo(s)`);
