const surfaceFrame = document.getElementById("surfaceFrame");
const playBtn = document.getElementById("play");
const pauseBtn = document.getElementById("pause");
const speedInput = document.getElementById("speed");
const tickerSelect = document.getElementById("ticker");

let timer = null;
let frameIndex = 0;
let datesCache = {};

// Example: replace with JSON manifest later if you automate it
async function fetchDates(ticker) {
  if (datesCache[ticker]) return datesCache[ticker];

  // Hardcoded demo list — must match files in docs/data/<TICKER>/
  const files = [
    "2025-08-30_surface.html",
    "2025-09-01_surface.html"
  ];

  datesCache[ticker] = files;
  return files;
}

async function startTimelapse() {
  clearInterval(timer); // stop any previous run
  const ticker = tickerSelect.value;
  const dates = await fetchDates(ticker);

  frameIndex = 0;
  timer = setInterval(() => {
    if (frameIndex >= dates.length) {
      clearInterval(timer);
      return;
    }
    const path = `data/${ticker}/${dates[frameIndex]}`;
    console.log("Loading frame:", path);
    surfaceFrame.src = `/data/${ticker}/${dates[frameIndex]}`;
    frameIndex++;
  }, parseInt(speedInput.value, 10));
}

playBtn.addEventListener("click", startTimelapse);
pauseBtn.addEventListener("click", () => clearInterval(timer));
