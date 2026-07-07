const COMMAND = "scan-qr";
const input = document.getElementById("shortcut");
const status = document.getElementById("status");
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

async function load() {
  const commands = await browser.commands.getAll();
  const cmd = commands.find((c) => c.name === COMMAND);
  input.value = (cmd && cmd.shortcut) || "";
  pending = input.value;
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

document.getElementById("save").addEventListener("click", async () => {
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

load();
