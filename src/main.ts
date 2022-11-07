import { on, once, showUI, traverseNode, getParentNode } from '@create-figma-plugin/utilities'

import { statusIcons, statusIconToKey } from '../utils/constants';
import { FocusFrameHandler, UpdateStatusHandler } from './types'

const options = { height: 390, width: 300 };

function getStatus(frame:any) {
  const regex = /\[(.*?)]/g;
  const match = regex.exec(frame.name);

  const statusIcon = match?.[1] || '';
  const statusKey = statusIcons.includes(statusIcon)
    ? statusIconToKey[statusIcon]
    : 'no-status';

  return statusKey;
}

function formatFrames() {
  const frames = [];

  for (let child of figma.currentPage.children) {
    if (child.type === "FRAME") {
      frames.push({
        id: `${child.id}`,
        name: child.name.replace(/\[(.*?)]/g, ''),
        status: getStatus(child)
      });
    }

    if (child.type === "SECTION") {
      traverseNode(child, () => {}, (node) => {
        if (node.type === "FRAME") {
          frames.push({
            id: `${node.id}`,
            name: node.name.replace(/\[(.*?)]/g, ''),
            status: getStatus(node)
          });
          return true;
        }
        return false;
      });
    }
  }

  return frames;
}

export default function () {
  figma.on('selectionchange', () => {
    const { selection } = figma.currentPage;

    const selectedFrames = selection.filter((s) => {
      const parentNode = getParentNode(s);

      if (s.type === "FRAME" &&
        (parentNode.type === "PAGE" || parentNode.type === "SECTION")) {
          return true;
      }

      return false;
    });

    const formattedSelectedFrames = selectedFrames.map((s) => s.id);

    figma.ui.postMessage({
      message: 'select-frames',
      selectedFrames: formattedSelectedFrames
    });

    figma.ui.postMessage({
      message: 'update-frames',
      frames: formatFrames()
    });
  });

  figma.on("currentpagechange", () => {
    figma.ui.postMessage({
      message: 'update-frames',
      frames: formatFrames()
    });
  });

  on<FocusFrameHandler>('FOCUS_FRAME', function (frameId:string) {
    for (let child of figma.currentPage.children) {
      let frame;

      if (child.type === 'SECTION') {
        frame = child.children.find((c) => c.id === frameId);
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
  })
  on<UpdateStatusHandler>('UPDATE_STATUS', async function (frameId:string, icon:string) {
    for (let child of figma.currentPage.children) {
      let frame;

      if (child.type === 'SECTION') {
        frame = child.children.find((c) => c.id === frameId);
      }

      if (child.id === frameId) {
        frame = child;
      }

      if (frame) {
        const regex = /\[(.*?)]/g;
        const strippedName = frame.name.replace(regex, "").trim();
        frame.name = icon
            ? `[${icon}] ${strippedName}`
            : strippedName;
        break;
      }
    }

    figma.ui.postMessage({
      message: 'update-frames',
      frames: formatFrames()
    });
  })
  showUI(options, { initialFrames: formatFrames() })
}
