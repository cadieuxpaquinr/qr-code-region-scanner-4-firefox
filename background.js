const COMMAND = "scan-qr";

let pendingCapture = null;
let sourceWindowId = null;
let settingsWindowId = null;
let lastNormalWindowId = null;

function notify(message, title) {
  return browser.notifications.create({
    type: "basic",
    iconUrl: browser.runtime.getURL("icons/icon.svg"),
    title: title || "QR Region Scanner",
    message
  });
}

// Both the shortcut and the menu can fire while one of our own popup windows holds
// focus, and for a background script "currentWindow" means the last focused window
// of any type. Target the browser window the user came from instead, or the add-on
// ends up scanning its own settings dialog.
async function scanTarget() {
  if (lastNormalWindowId != null) {
    const [remembered] = await browser.tabs.query({
      active: true, windowId: lastNormalWindowId
    });
    if (remembered) return remembered;
  }
  const [current] = await browser.tabs.query({
    active: true, windowType: "normal", currentWindow: true
  });
  if (current) return current;
  const [any] = await browser.tabs.query({ active: true, windowType: "normal" });
  return any;
}

async function startScan() {
  const tab = await scanTarget();
  if (!tab) {
    notify("No page to scan.");
    return;
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
  await browser.windows.create({
    url: browser.runtime.getURL("select.html"),
    type: "popup",
    left: win.left,
    top: win.top,
    width: win.width,
    height: win.height
  });
}

async function openSettings() {
  if (settingsWindowId != null) {
    try {
      await browser.windows.update(settingsWindowId, { focused: true });
      return;
    } catch (e) {
      settingsWindowId = null;
    }
  }
  const win = await browser.windows.create({
    url: browser.runtime.getURL("options.html"),
    type: "popup",
    width: 560,
    height: 420
  });
  settingsWindowId = win.id;
}

browser.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === browser.windows.WINDOW_ID_NONE) return;
  try {
    const win = await browser.windows.get(windowId);
    if (win.type === "normal") lastNormalWindowId = windowId;
  } catch (e) {
    // The window went away between the event and the lookup.
  }
});

browser.windows.onRemoved.addListener((id) => {
  if (id === settingsWindowId) settingsWindowId = null;
  if (id === lastNormalWindowId) lastNormalWindowId = null;
});

browser.commands.onCommand.addListener((name) => {
  if (name === COMMAND) startScan();
});

async function openUrl(msg, sender) {
  if (msg.fromSelector && sourceWindowId != null) {
    await browser.tabs.create({ url: msg.url, windowId: sourceWindowId });
    await browser.windows.update(sourceWindowId, { focused: true });
    return;
  }
  const options = { url: msg.url };
  if (sender.tab) options.windowId = sender.tab.windowId;
  await browser.tabs.create(options);
}

browser.runtime.onMessage.addListener((msg, sender) => {
  switch (msg && msg.type) {
    case "start-scan":
      return startScan();
    case "open-settings":
      return openSettings();
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
