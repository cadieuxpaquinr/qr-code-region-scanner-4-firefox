// Await the message before closing: closing the panel first tears down this
// context and the message can be dropped in flight.
async function run(type) {
  await browser.runtime.sendMessage({ type });
  window.close();
}

document.getElementById("scan").addEventListener("click", () => run("start-scan"));
