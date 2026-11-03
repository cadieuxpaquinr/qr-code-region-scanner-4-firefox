const COMMAND = QRShortcut.COMMAND;
const input = document.getElementById("shortcut");
const status = document.getElementById("status");
const save = document.getElementById("save");
const checkbox = document.getElementById("disable-shortcut");
const shortcutLabel = document.getElementById("shortcut-label");
let pending = "";

const KEY_NAMES = {
  " ": "Space",
  ",": "Comma",
  ".": "Period",
  "ArrowUp": "Up",
  "ArrowDown": "Down",
  "ArrowLeft": "Left",
  "ArrowRight": "Right",
  "PageUp": "PageUp",
  "PageDown": "PageDown",
  "Home": "Home",
  "End": "End",
  "Insert": "Insert",
  "Delete": "Delete"
};

function setStatus(message, isError) {
  status.textContent = message;
  status.classList.toggle("error", !!isError);
}

function mainKey(e) {
  if (KEY_NAMES[e.key]) return KEY_NAMES[e.key];
  if (/^[a-z]$/i.test(e.key)) return e.key.toUpperCase();
  if (/^[0-9]$/.test(e.key)) return e.key;
  if (/^F([1-9]|1[0-2])$/.test(e.key)) return e.key;
  return null;
}

// The single painter: every change reloads from Firefox, so a rejected call
// leaves the form showing what is really bound rather than what was clicked.
async function load() {
  const { shortcut, disabled } = await QRShortcut.state();
  input.value = shortcut;
  pending = shortcut;
  checkbox.checked = disabled;
  shortcutLabel.textContent = QRShortcut.label(disabled);
  input.disabled = disabled;
  save.disabled = disabled;
}

input.addEventListener("keydown", (e) => {
  e.preventDefault();
  const key = mainKey(e);
  if (!key) return;

  const mods = [];
  if (e.ctrlKey) mods.push("Ctrl");
  if (e.altKey) mods.push("Alt");
  if (e.metaKey) mods.push("Command");
  if (e.shiftKey) mods.push("Shift");

  const hasPrimary = e.ctrlKey || e.altKey || e.metaKey;
  const isFunctionKey = /^F([1-9]|1[0-2])$/.test(key);
  if (!hasPrimary && !isFunctionKey) {
    setStatus("Use at least Ctrl, Alt or Command, or a function key.", true);
    return;
  }

  pending = mods.concat(key).join("+");
  input.value = pending;
  setStatus("");
});

checkbox.addEventListener("change", async () => {
  const wanted = checkbox.checked;
  try {
    await (wanted ? QRShortcut.disable() : QRShortcut.enable());
    setStatus(wanted ? "Shortcut disabled." : "Shortcut enabled.");
  } catch (e) {
    setStatus("Could not change the shortcut.", true);
  }
  await load();
});

save.addEventListener("click", async () => {
  if (!pending) {
    setStatus("Pick a shortcut first.", true);
    return;
  }
  try {
    await browser.commands.update({ name: COMMAND, shortcut: pending });
    setStatus("Saved.");
  } catch (e) {
    setStatus("Could not save that shortcut.", true);
  }
});

document.getElementById("reset").addEventListener("click", async () => {
  await browser.commands.reset(COMMAND);
  await load();
  setStatus("Reset to default.");
});

const nav = document.getElementById("sections");

nav.addEventListener("click", (e) => {
  const name = e.target.dataset && e.target.dataset.section;
  if (!name) return;
  for (const button of nav.children) {
    const selected = button === e.target;
    if (selected) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
    document.getElementById(button.dataset.section).hidden = !selected;
  }
});

async function loadTheme() {
  const value = await QRTheme.current();
  document.querySelector(`input[name="theme"][value="${value}"]`).checked = true;
}

for (const radio of document.querySelectorAll('input[name="theme"]')) {
  radio.addEventListener("change", () => QRTheme.set(radio.value));
}

load();
loadTheme();
