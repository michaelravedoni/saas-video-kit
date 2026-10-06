import React from "react";
import { Composition, Folder, Still } from "remotion";
import {
  PlaceholderDesktop,
  PlaceholderLogo,
  PlaceholderMobile,
} from "./dev/Placeholders";
import { ThumbnailRoot, type ThumbnailRootProps } from "./engine/ThumbnailRoot";
import { VideoRoot, type VideoRootProps } from "./engine/VideoRoot";
import { totalFrames } from "./engine/video";
import { REGISTRY } from "./generated/registry";
import { FORMAT_SIZE, FPS } from "./timing";

// Une composition par vidéo × langue × format (+ une version avec musique, + les scènes une à une).
// Convention des identifiants : <vidéo>-<langue>-<format>[-musique]   ex. demo-fr-9x16-musique
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {Object.keys(REGISTRY).length ? (
        <Folder name="placeholders">
          <Still
            id="placeholder-desktop"
            component={PlaceholderDesktop}
            width={1440}
            height={900}
            defaultProps={{
              videoId: Object.keys(REGISTRY)[0],
              locale: REGISTRY[Object.keys(REGISTRY)[0]].video.locales[0],
            }}
          />
          <Still
            id="placeholder-mobile"
            component={PlaceholderMobile}
            width={720}
            height={1601}
            defaultProps={{
              videoId: Object.keys(REGISTRY)[0],
              locale: REGISTRY[Object.keys(REGISTRY)[0]].video.locales[0],
            }}
          />
          <Still
            id="placeholder-logo"
            component={PlaceholderLogo}
            width={500}
            height={166}
            defaultProps={{
              videoId: Object.keys(REGISTRY)[0],
              locale: REGISTRY[Object.keys(REGISTRY)[0]].video.locales[0],
            }}
          />
        </Folder>
      ) : null}
      {Object.entries(REGISTRY).map(([videoId, { video }]) =>
        video.thumbnails
          ? video.locales.map((locale) => (
              <Folder
                key={`${videoId}-${locale}-miniatures`}
                name={`${videoId}-${locale}-miniatures`}
              >
                <Still
                  id={`${videoId}-${locale}-miniature-youtube`}
                  component={ThumbnailRoot}
                  width={1280}
                  height={720}
                  defaultProps={
                    {
                      videoId,
                      locale,
                      kind: "youtube",
                    } satisfies ThumbnailRootProps
                  }
                />
                <Still
                  id={`${videoId}-${locale}-miniature-shorts`}
                  component={ThumbnailRoot}
                  width={1080}
                  height={1920}
                  defaultProps={
                    {
                      videoId,
                      locale,
                      kind: "shorts",
                    } satisfies ThumbnailRootProps
                  }
                />
              </Folder>
            ))
          : null,
      )}
      {Object.entries(REGISTRY).map(([videoId, { video }]) =>
        video.locales.map((locale) =>
          video.formats.map((format) => {
            const { width, height } = FORMAT_SIZE[format];
            const base = `${videoId}-${locale}-${format}`;
            const props: VideoRootProps = { videoId, locale, format };
            return (
              <React.Fragment key={base}>
                <Composition
                  id={base}
                  component={VideoRoot}
                  width={width}
                  height={height}
                  fps={FPS}
                  durationInFrames={totalFrames(video)}
                  defaultProps={props}
                />
                {video.music ? (
                  <Composition
                    id={`${base}-musique`}
                    component={VideoRoot}
                    width={width}
                    height={height}
                    fps={FPS}
                    durationInFrames={totalFrames(video)}
                    defaultProps={{ ...props, music: true }}
                  />
                ) : null}
                {video.subtitles ? (
                  <Composition
                    id={`${base}-st`}
                    component={VideoRoot}
                    width={width}
                    height={height}
                    fps={FPS}
                    durationInFrames={totalFrames(video)}
                    defaultProps={{ ...props, subtitles: true }}
                  />
                ) : null}
                {video.subtitles && video.music ? (
                  <Composition
                    id={`${base}-musique-st`}
                    component={VideoRoot}
                    width={width}
                    height={height}
                    fps={FPS}
                    durationInFrames={totalFrames(video)}
                    defaultProps={{ ...props, music: true, subtitles: true }}
                  />
                ) : null}
                <Folder name={`${base}-scenes`}>
                  {video.scenes.map((scene, i) => (
                    <Composition
                      key={i}
                      id={`${base}-scene-${i + 1}-${scene.type}`}
                      component={VideoRoot}
                      width={width}
                      height={height}
                      fps={FPS}
                      durationInFrames={scene.frames}
                      defaultProps={{ ...props, sceneIndex: i }}
                    />
                  ))}
                </Folder>
              </React.Fragment>
            );
          }),
        ),
      )}
    </>
  );
};
