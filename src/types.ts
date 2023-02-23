import { EventHandler } from "@create-figma-plugin/utilities";

export interface FocusFrameHandler extends EventHandler {
  name: "FOCUS_FRAME";
  handler: (frameId: string) => void;
}

export interface UpdateStatusHandler extends EventHandler {
  name: "UPDATE_STATUS";
  handler: (frameId: string, icon: string) => void;
}

export interface GetFigmaUserHandler extends EventHandler {
  name: "GET_FIGMA_USER";
  handler: () => void;
}
