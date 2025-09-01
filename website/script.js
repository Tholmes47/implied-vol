const surfaceFrame = document.getElementById("surfaceFrame");
const playBtn = document.getElementById("play");
const pauseBtn = document.getElementById("pause");
const speedInput = document.getElementById("speed");
const tickerSelect = document.getElementById("ticker");

let timer = null;
let frameIndex = 0;

async function fetchDates(ticker) {
  // Hardcode or fetch from a JSON list of available files
  // Example: store a manifest JSON that Actions updates
  return [
    "2025-08-30_surface.html",
    "2025-09-01_surface.html"
  ];
}

async function startTimelapse() {
  const ticker = tickerSelect.value;
  const dates = await fetchDates(ticker);

  frameIndex = 0;
  timer = setInterval(() => {
    if (frameIndex >= dates.length) {
      clearInterval(timer);
      return;
    }
    surfaceFrame.src = `../data/${ticker}/${dates[frameIndex]}`;
    frameIndex++;
  }, parseInt(speedInput.value));
}

playBtn.addEventListener("click", startTimelapse);
pauseBtn.addEventListener("click", () => clearInterval(timer));
