import React from "react";
import { Composition, getInputProps } from "remotion";
import { Main } from "./main";
import { COMP_NAME, DURATION_IN_FRAMES, FPS } from "../constants";
import { Overlay } from "../types";

/**
 * Input props interface for the Remotion composition
 */
interface RemotionInputProps {
  overlays?: Overlay[];
  durationInFrames?: number;
  fps?: number;
  width?: number;
  height?: number;
  src?: string;
}

/**
 * Root component for the Remotion project.
 * Sets up the composition and provides default props.
 */
export const RemotionRoot: React.FC = () => {
  // Get input props passed from the render request
  const inputProps = getInputProps() as RemotionInputProps;

  console.log("🎬 RemotionRoot: Received inputProps:", inputProps);

  // Use inputProps if available, otherwise use defaults with proper type casting
  const overlays = inputProps?.overlays || [];
  const durationInFrames = Number(inputProps?.durationInFrames) || DURATION_IN_FRAMES;
  const fps = Number(inputProps?.fps) || FPS;
  const width = Number(inputProps?.width) || 1920;
  const height = Number(inputProps?.height) || 1920;
  const src = inputProps?.src || "";
  
  console.log("🎬 RemotionRoot: Using values:", {
    overlaysCount: Array.isArray(overlays) ? overlays.length : 0,
    durationInFrames,
    fps,
    width,
    height,
  });

  const defaultMyCompProps = {
    overlays,
    durationInFrames,
    fps,
    width,
    height,
    src,
    setSelectedOverlayId: () => {},
    selectedOverlayId: null as number | null,
    changeOverlay: () => {},
  };

  return (
    <>
      <Composition
        id={COMP_NAME}
        component={Main}
        durationInFrames={durationInFrames}
        fps={fps}
        width={width}
        height={height}
        /**
         * Dynamically calculates the video metadata based on the composition props.
         * These values will be reflected in the Remotion player/preview.
         * When the composition renders, it will use these dimensions and duration.
         *
         * @param props - The composition props passed to the component
         * @returns An object containing the video dimensions and duration
         */
        calculateMetadata={async ({ props }) => {
          console.log("🎬 calculateMetadata: props received:", props);
          return {
            durationInFrames: Number(props.durationInFrames) || durationInFrames,
            width: Number(props.width) || width,
            height: Number(props.height) || height,
          };
        }}
        defaultProps={defaultMyCompProps}
      />
    </>
  );
};
