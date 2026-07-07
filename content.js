(() => {
  if (window.__qrRegionScannerActive) return;
  window.__qrRegionScannerActive = true;

  const Z = 2147483647;
  let startX = 0;
  let startY = 0;
  let dragging = false;

  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: String(Z),
    cursor: "crosshair",
    background: "rgba(0, 0, 0, 0.25)"
  });

  const box = document.createElement("div");
  Object.assign(box.style, {
    position: "fixed",
    border: "2px dashed #4cc9f0",
    background: "rgba(76, 201, 240, 0.1)",
    display: "none",
    zIndex: String(Z),
    pointerEvents: "none"
  });

  function teardown() {
    overlay.remove();
    box.remove();
    window.removeEventListener("keydown", onKey, true);
    window.__qrRegionScannerActive = false;
  }

  function onKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      teardown();
    }
  }

  function currentRect(e) {
    const left = Math.min(startX, e.clientX);
    const top = Math.min(startY, e.clientY);
    const width = Math.abs(e.clientX - startX);
    const height = Math.abs(e.clientY - startY);
    return { left, top, width, height };
  }

  overlay.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    Object.assign(box.style, { left: startX + "px", top: startY + "px", width: "0px", height: "0px", display: "block" });
  });

  overlay.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const r = currentRect(e);
    Object.assign(box.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
  });

  overlay.addEventListener("mouseup", (e) => {
    if (!dragging) return;
    dragging = false;
    const r = currentRect(e);
    if (r.width < 5 || r.height < 5) {
      teardown();
      return;
    }
    overlay.remove();
    box.remove();
    window.removeEventListener("keydown", onKey, true);
    requestAnimationFrame(() => scanRegion(r));
  });

  async function scanRegion(rect) {
    try {
      const dataUrl = await browser.runtime.sendMessage({ type: "capture" });
      const result = await decode(dataUrl, rect);
      handleResult(result);
    } catch (e) {
      report("Could not capture or scan this region.");
    } finally {
      window.__qrRegionScannerActive = false;
    }
  }

  function decode(dataUrl, rect) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const dpr = window.devicePixelRatio || 1;
        const sx = Math.round(rect.left * dpr);
        const sy = Math.round(rect.top * dpr);
        const sw = Math.max(1, Math.round(rect.width * dpr));
        const sh = Math.max(1, Math.round(rect.height * dpr));
        resolve(QRScanCore.decodeRegion(img, sx, sy, sw, sh));
      };
      img.onerror = () => reject(new Error("image load failed"));
      img.src = dataUrl;
    });
  }

  function handleResult(result) {
    if (!result || !result.data) {
      report("No QR code found in the selected region.");
      return;
    }
    const text = result.data;
    if (QRScanCore.isHttpUrl(text)) {
      browser.runtime.sendMessage({ type: "open-url", url: text });
    } else {
      const copied = QRScanCore.copyText(text);
      report(copied ? "Copied to clipboard: " + text : "Scanned: " + text, "QR code scanned");
    }
  }

  function report(message, title) {
    browser.runtime.sendMessage({ type: "notify", message, title });
  }

  window.addEventListener("keydown", onKey, true);
  document.documentElement.appendChild(overlay);
  document.documentElement.appendChild(box);
})();
