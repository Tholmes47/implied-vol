const surfaceFrame = document.getElementById("surfaceFrame");
const playBtn = document.getElementById("play");
const pauseBtn = document.getElementById("pause");
const speedInput = document.getElementById("speed");
const tickerSelect = document.getElementById("ticker");
const dateDisplay = document.getElementById("dateDisplay");
const frameSlider = document.getElementById("frameSlider");

let timer = null;
let frameIndex = 0;
let surfaces = {};

// Load manifest.json with available files
async function loadManifest() {
  const response = await fetch("data/manifest.json");
  surfaces = await response.json();

  // Set slider max based on current ticker
  frameSlider.max = surfaces[tickerSelect.value].length - 1;

  // Load the very first frame
  loadFrame(tickerSelect.value, frameIndex);
}

// Extract date from filenames like "2025-09-01_surface.html"
function extractDate(filename) {
  return filename.split("_")[0];
}

// Load one frame into the iframe
function loadFrame(ticker, index) {
  if (!surfaces[ticker] || index >= surfaces[ticker].length) return;

  const file = surfaces[ticker][index];
  surfaceFrame.src = `data/${ticker}/${file}`;
  dateDisplay.textContent = extractDate(file);  // ✅ show date
  frameSlider.value = index;                    // ✅ sync slider
}

// Start the timelapse
function play() {
  const ticker = tickerSelect.value;
  clearInterval(timer);
  frameIndex = 0;
  frameSlider.max = surfaces[ticker].length - 1;

  timer = setInterval(() => {
    loadFrame(ticker, frameIndex);
    frameIndex++;
    if (frameIndex >= surfaces[ticker].length) {
      clearInterval(timer);
      frameIndex = 0; // restart for replay
    }
  }, parseInt(speedInput.value, 10));
}

// Pause timelapse
function pause() {
  clearInterval(timer);
}

// Slider manually moves frames
frameSlider.addEventListener("input", () => {
  const ticker = tickerSelect.value;
  frameIndex = parseInt(frameSlider.value, 10);
  loadFrame(ticker, frameIndex);
});

// When user changes ticker
tickerSelect.addEventListener("change", () => {
  frameIndex = 0;
  frameSlider.max = surfaces[tickerSelect.value].length - 1;
  loadFrame(tickerSelect.value, frameIndex);
});

// Buttons
playBtn.addEventListener("click", play);
pauseBtn.addEventListener("click", pause);

// Kick things off
loadManifest();
