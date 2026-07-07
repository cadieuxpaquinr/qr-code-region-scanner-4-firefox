const COMMAND = "scan-qr";

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
    await browser.tabs.executeScript(tab.id, { file: "content.js" });
  } catch (e) {
    notify("This page cannot be scanned. Try it on a regular web page.");
  }
}

browser.commands.onCommand.addListener((name) => {
  if (name === COMMAND) startScan();
});

browser.browserAction.onClicked.addListener((tab) => startScan(tab));

browser.runtime.onMessage.addListener((msg, sender) => {
  switch (msg && msg.type) {
    case "capture":
      return browser.tabs.captureVisibleTab(sender.tab.windowId, { format: "png" });
    case "open-url":
      return browser.tabs.create({ url: msg.url });
    case "notify":
      return notify(msg.message, msg.title);
  }
});
