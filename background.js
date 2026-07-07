const COMMAND = "scan-qr";

let pendingCapture = null;
let sourceWindowId = null;
let selectorWindowId = null;

function notify(message, title) {
  return browser.notifications.create({
    type: "basic",
    iconUrl: browser.runtime.getURL("icons/icon.svg"),
    title: title || "QR Region Scanner",
    message
  });
}

async function startScan(tab) {
  if (!tab) {
    [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  }
  try {
    await browser.tabs.executeScript(tab.id, { file: "vendor/jsqr.js" });
    await browser.tabs.executeScript(tab.id, { file: "scan-core.js" });
    await browser.tabs.executeScript(tab.id, { file: "content.js" });
  } catch (e) {
    await captureFallback(tab);
  }
}

// Used for pages Firefox will not inject into (PDF viewer, about:, etc.):
// screenshot the tab and select the region in an extension popup window.
async function captureFallback(tab) {
  let dataUrl;
  try {
    dataUrl = await browser.tabs.captureVisibleTab(tab.windowId, { format: "png" });
  } catch (e) {
    notify("This page cannot be captured.");
    return;
  }
  pendingCapture = dataUrl;
  sourceWindowId = tab.windowId;
  const win = await browser.windows.get(tab.windowId);
  const popup = await browser.windows.create({
    url: browser.runtime.getURL("select.html"),
    type: "popup",
    left: win.left,
    top: win.top,
    width: win.width,
    height: win.height
  });
  selectorWindowId = popup.id;
}

browser.commands.onCommand.addListener((name) => {
  if (name === COMMAND) startScan();
});

browser.browserAction.onClicked.addListener((tab) => startScan(tab));

async function openUrl(msg, sender) {
  const options = { url: msg.url };
  const fromSelector = sender.tab && sender.tab.windowId === selectorWindowId;
  if (fromSelector && sourceWindowId != null) {
    options.windowId = sourceWindowId;
    await browser.tabs.create(options);
    await browser.windows.update(sourceWindowId, { focused: true });
    return;
  }
  await browser.tabs.create(options);
}

browser.runtime.onMessage.addListener((msg, sender) => {
  switch (msg && msg.type) {
    case "capture":
      return browser.tabs.captureVisibleTab(sender.tab.windowId, { format: "png" });
    case "get-capture":
      return Promise.resolve(pendingCapture);
    case "open-url":
      return openUrl(msg, sender);
    case "notify":
      return notify(msg.message, msg.title);
  }
});
