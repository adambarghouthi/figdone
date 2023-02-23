import {
  on,
  showUI,
  traverseNode,
  getParentNode,
} from "@create-figma-plugin/utilities";
import {
  FocusFrameHandler,
  GetFigmaUserHandler,
  UpdateStatusHandler,
} from "./types";

const options = { height: 390, width: 300 };

function getStatusIcon(frame: any) {
  const regex = /\[(.*?)]/g;
  const match = regex.exec(frame.name);

  const statusIcon = match?.[1] || "";

  return statusIcon;
}

function formatFrames() {
  const frames = [];

  for (let child of figma.currentPage.children) {
    if (child.type === "FRAME") {
      frames.push({
        id: `${child.id}`,
        name: child.name.replace(/\[(.*?)]/g, ""),
        statusIcon: getStatusIcon(child),
      });
    }

    if (child.type === "SECTION") {
      traverseNode(
        child,
        () => {},
        (node) => {
          if (node.type === "FRAME") {
            frames.push({
              id: `${node.id}`,
              name: node.name.replace(/\[(.*?)]/g, ""),
              statusIcon: getStatusIcon(node),
            });
            return true;
          }
          return false;
        }
      );
    }
  }

  return frames;
}

export default function () {
  figma.on("selectionchange", () => {
    const { selection } = figma.currentPage;

    const selectedFrames = selection.filter((s) => {
      const parentNode = getParentNode(s);

      if (
        s.type === "FRAME" &&
        (parentNode.type === "PAGE" || parentNode.type === "SECTION")
      ) {
        return true;
      }

      return false;
    });

    const formattedSelectedFrames = selectedFrames.map((s) => s.id);

    figma.ui.postMessage({
      message: "select-frames",
      selectedFrames: formattedSelectedFrames,
    });

    figma.ui.postMessage({
      message: "update-frames",
      frames: formatFrames(),
    });
  });

  figma.on("currentpagechange", () => {
    figma.ui.postMessage({
      message: "update-frames",
      frames: formatFrames(),
    });
  });

  on<GetFigmaUserHandler>("GET_FIGMA_USER", function () {
    figma.ui.postMessage({
      message: "set-user",
      user: figma.currentUser,
    });
  });
  on<FocusFrameHandler>("FOCUS_FRAME", function (frameId: string) {
    for (let child of figma.currentPage.children) {
      let frame;

      if (child.type === "SECTION") {
        traverseNode(
          child,
          () => {},
          (node) => {
            if (node.type === "FRAME" && node.id === frameId) {
              frame = node;
              return true;
            }
            return false;
          }
        );
      }

      if (child.id === frameId) {
        frame = child;
      }

      if (frame) {
        figma.viewport.scrollAndZoomIntoView([frame]);
        figma.currentPage.selection = [frame];
        break;
      }
    }
  });
  on<UpdateStatusHandler>(
    "UPDATE_STATUS",
    async function (frameId: string | string[], icon: string) {
      for (let i = 0; i < figma.currentPage.children.length; i += 1) {
        const child = figma.currentPage.children[i];
        let frame;

        if (child.type === "SECTION") {
          traverseNode(
            child,
            () => {},
            (node) => {
              if (node.type === "FRAME" && node.id === frameId) {
                frame = node;
                return true;
              }
              return false;
            }
          );
        }

        if (Array.isArray(frameId)) {
          if (frameId.includes(child.id)) {
            frame = child;
          }
        } else {
          if (child.id === frameId) {
            frame = child;
          }
        }

        if (frame) {
          const regex = /\[(.*?)]/g;
          const strippedName = frame.name.replace(regex, "").trim();
          frame.name = icon ? `[${icon}] ${strippedName}` : strippedName;

          if (!Array.isArray(frameId)) {
            break;
          }
        }
      }

      figma.ui.postMessage({
        message: "update-frames",
        frames: formatFrames(),
      });
    }
  );
  showUI(options, { initialFrames: formatFrames() });
}
