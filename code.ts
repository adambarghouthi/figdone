// This file holds the main code for the plugin. It has access to the *document*.
// You can access browser APIs such as the network by creating a UI which contains
// a full browser environment (see documentation).

function updateFrames() {
  const frames = figma.currentPage.children.map((frame) => ({
    id: frame.id,
    name: frame.name,
  }));

  figma.ui.postMessage({
    message: "update-table",
    frames,
  });
}

function highlightFrames(frames:object) {
  figma.ui.postMessage({
    message: "highlight-frames",
    frames: frames,
  });
}

// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This shows the HTML page in "ui.html".
figma.showUI(__html__);
figma.ui.resize(300, 390);

updateFrames();

figma.on("selectionchange", () => {
  const { selection } = figma.currentPage;

  const isFrame = figma.currentPage.children.filter((f) =>
    selection.find((s) =>
      s.id === f.id))?.[0];

  if (isFrame) {
    const frames = selection.map((s) => s.id);
    updateFrames();
    highlightFrames(frames);
  }
});

figma.on("currentpagechange", () => {
  updateFrames();
});

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

figma.ui.onmessage = (msg) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === "update-status") {
    const { frameId, newStatusIcon } = msg;

    figma.currentPage.children.forEach((f) => {
      if (f.id === frameId) {
        const regex = /\[(.*?)]/g;
        const strippedName = f.name.replace(regex, "").trim();

        f.name = newStatusIcon
          ? `[${newStatusIcon}] ${strippedName}`
          : strippedName;

        updateFrames();
      }
    });
  }

  if (msg.type === "focus-frame") {
    const { frameId } = msg;
    const frame = figma.currentPage.children.find((f) => f.id === frameId);
    if (frame) {
      figma.viewport.scrollAndZoomIntoView([frame]);
      figma.currentPage.selection = [frame];
    }
  }

  // // Make sure to close the plugin when you're done. Otherwise the plugin will
  // // keep running, which shows the cancel button at the bottom of the screen.
  // figma.closePlugin();
};
