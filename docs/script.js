const surfaceFrame = document.getElementById("surfaceFrame");
const playBtn = document.getElementById("play");
const pauseBtn = document.getElementById("pause");
const speedInput = document.getElementById("speed");
const tickerSelect = document.getElementById("ticker");
const dateDisplay = document.getElementById("dateDisplay");

let timer = null;
let frameIndex = 0;

// Hardcoded example — automate later with a manifest
const surfaces = {
  "AAPL": ["2025-08-31_surface.html", "2025-09-01_surface.html"],
  "MSFT": ["2025-08-31_surface.html", "2025-09-01_surface.html"]
};

// Helper: extract date from filename
function extractDate(filename) {
  return filename.split("_")[0]; // e.g. "2025-09-01"
}

// Load a single frame in the iframe
function loadFrame(ticker, index) {
  if (!surfaces[ticker] || index >= surfaces[ticker].length) return;
  const file = surfaces[ticker][index];
  surfaceFrame.src = `data/${ticker}/${file}`;
  dateDisplay.textContent = `Date: ${extractDate(file)}`;
}

// Start timelapse
function play() {
  const ticker = tickerSelect.value;
  clearInterval(timer);
  frameIndex = 0;

  timer = setInterval(() => {
    loadFrame(ticker, frameIndex);
    frameIndex++;
    if (frameIndex >= surfaces[ticker].length) {
      clearInterval(timer);
      frameIndex = 0; // reset for replay
    }
  }, parseInt(speedInput.value, 10));
}

// Pause timelapse
function pause() {
  clearInterval(timer);
}

// Event listeners
playBtn.addEventListener("click", play);
pauseBtn.addEventListener("click", pause);
tickerSelect.addEventListener("change", () => {
  frameIndex = 0;
  loadFrame(tickerSelect.value, frameIndex);
});

// Initialize first frame
loadFrame(tickerSelect.value, frameIndex);
