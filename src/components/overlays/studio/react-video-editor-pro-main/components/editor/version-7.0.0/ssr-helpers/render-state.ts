import fs from "fs";
import path from "path";

/**
 * Interface for render state data
 */
interface RenderState {
  progress?: number;
  status?: "rendering" | "done" | "error" | "pending";
  url?: string;
  size?: number;
  error?: string;
  [key: string]: unknown; // Allow additional properties
}

const RENDER_STATE_DIR = path.join(process.cwd(), "tmp", "render-state");

// Ensure the directory exists
if (!fs.existsSync(RENDER_STATE_DIR)) {
  fs.mkdirSync(RENDER_STATE_DIR, { recursive: true });
}

export const saveRenderState = (renderId: string, state: RenderState) => {
  const filePath = path.join(RENDER_STATE_DIR, `${renderId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(state));
};

export const getRenderState = (renderId: string): RenderState | null => {
  const filePath = path.join(RENDER_STATE_DIR, `${renderId}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as RenderState;
};

export const updateRenderProgress = (renderId: string, progress: number) => {
  const state = getRenderState(renderId) || {};
  state.progress = progress;
  state.status = "rendering";
  saveRenderState(renderId, state);
};

export const completeRender = (renderId: string, url: string, size: number) => {
  const state = getRenderState(renderId) || {};
  state.status = "done";
  state.url = url;
  state.size = size;
  saveRenderState(renderId, state);
};

export const failRender = (renderId: string, error: string) => {
  const state = getRenderState(renderId) || {};
  state.status = "error";
  state.error = error;
  saveRenderState(renderId, state);
};
