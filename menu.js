const REPO = "https://github.com/cadieuxpaquinr/qr-code-region-scanner-4-firefox";
const ISSUES = `${REPO}/issues`;

// Await the message before closing: closing the panel first tears down this
// context and the message can be dropped in flight.
async function run(message) {
  await browser.runtime.sendMessage(message);
  window.close();
}

const scan = document.getElementById("scan");
const settings = document.getElementById("settings");
const report = document.getElementById("report");
const about = document.getElementById("about");
const checkbox = document.getElementById("disable-shortcut");
const label = document.getElementById("shortcut-label");

scan.addEventListener("click", () => run({ type: "start-scan" }));
settings.addEventListener("click", () => run({ type: "open-settings" }));
report.addEventListener("click", () => run({ type: "open-url", url: ISSUES }));
about.addEventListener("click", () => run({ type: "open-url", url: REPO }));

function paint(disabled) {
  checkbox.checked = disabled;
  label.textContent = QRShortcut.label(disabled);
}

// Unlike the buttons, toggling leaves the panel open.
checkbox.addEventListener("change", async () => {
  const wanted = checkbox.checked;
  try {
    await (wanted ? QRShortcut.disable() : QRShortcut.enable());
    paint(wanted);
  } catch (e) {
    paint(!wanted);
  }
});

// Firefox gives these rows no arrow key navigation, which a menu is expected to have.
const items = [scan, checkbox, settings, report, about];

document.addEventListener("keydown", (e) => {
  const step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
  if (!step) return;
  e.preventDefault();
  const current = items.indexOf(document.activeElement);
  const from = current < 0 ? (step > 0 ? -1 : 0) : current;
  items[(from + step + items.length) % items.length].focus();
});

QRShortcut.state().then((s) => paint(s.disabled));
