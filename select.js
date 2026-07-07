const img = document.getElementById("shot");
const box = document.getElementById("box");
let startX = 0;
let startY = 0;
let dragging = false;

browser.runtime.sendMessage({ type: "get-capture" }).then((dataUrl) => {
  if (!dataUrl) {
    window.close();
    return;
  }
  img.src = dataUrl;
});

function send(msg) {
  return browser.runtime.sendMessage(msg);
}

function currentRect(e) {
  return {
    left: Math.min(startX, e.clientX),
    top: Math.min(startY, e.clientY),
    width: Math.abs(e.clientX - startX),
    height: Math.abs(e.clientY - startY)
  };
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") window.close();
});

document.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;
  dragging = true;
  startX = e.clientX;
  startY = e.clientY;
  Object.assign(box.style, { left: startX + "px", top: startY + "px", width: "0px", height: "0px", display: "block" });
});

document.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  const r = currentRect(e);
  Object.assign(box.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
});

document.addEventListener("mouseup", (e) => {
  if (!dragging) return;
  dragging = false;
  const r = currentRect(e);
  if (r.width < 5 || r.height < 5) {
    window.close();
    return;
  }
  box.style.display = "none";
  scanRegion(r);
});

function scanRegion(sel) {
  const ir = img.getBoundingClientRect();
  const scale = img.naturalWidth / ir.width;
  let sx = Math.max(0, Math.round((sel.left - ir.left) * scale));
  let sy = Math.max(0, Math.round((sel.top - ir.top) * scale));
  const sw = Math.max(1, Math.min(Math.round(sel.width * scale), img.naturalWidth - sx));
  const sh = Math.max(1, Math.min(Math.round(sel.height * scale), img.naturalHeight - sy));
  handleResult(QRScanCore.decodeRegion(img, sx, sy, sw, sh));
}

async function handleResult(result) {
  try {
    if (!result || !result.data) {
      await send({ type: "notify", message: "No QR code found in the selected region." });
      return;
    }
    const text = result.data;
    if (QRScanCore.isHttpUrl(text)) {
      await send({ type: "open-url", url: text, fromSelector: true });
    } else {
      const copied = QRScanCore.copyText(text);
      await send({ type: "notify", message: (copied ? "Copied to clipboard: " : "Scanned: ") + text, title: "QR code scanned" });
    }
  } finally {
    window.close();
  }
}
