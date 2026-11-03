// Await the message before closing: closing the panel first tears down this
// context and the message can be dropped in flight.
async function run(type) {
  await browser.runtime.sendMessage({ type });
  window.close();
}

const items = [
  ["scan", "start-scan"],
  ["settings", "open-settings"]
].map(([id, type]) => {
  const button = document.getElementById(id);
  button.addEventListener("click", () => run(type));
  return button;
});

// Firefox gives buttons no arrow key navigation, which a menu is expected to have.
document.addEventListener("keydown", (e) => {
  const step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
  if (!step) return;
  e.preventDefault();
  const current = items.indexOf(document.activeElement);
  const from = current < 0 ? (step > 0 ? -1 : 0) : current;
  items[(from + step + items.length) % items.length].focus();
});
