const surfaceFrame = document.getElementById("surfaceFrame");
const playBtn = document.getElementById("play");
const pauseBtn = document.getElementById("pause");
const speedInput = document.getElementById("speed");
const tickerSelect = document.getElementById("ticker");
const dateDisplay = document.getElementById("dateDisplay");
const frameSlider = document.getElementById("frameSlider");

let surfaces = {};
let timer = null;
let frameIndex = 0;

function extractDate(filename) {
  return filename.split("_")[0];
}

function loadFrame(ticker, index) {
  if (!surfaces[ticker] || index >= surfaces[ticker].length) return;
  const file = surfaces[ticker][index];
  surfaceFrame.src = `data/${ticker}/${file}`;
  dateDisplay.textContent = `Date: ${extractDate(file)}`;
  frameSlider.value = index;
}

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
      frameIndex = 0;
    }
  }, parseInt(speedInput.value, 10));
}

function pause() {
  clearInterval(timer);
}

async function init() {
  const response = await fetch("data/manifest.json");
  surfaces = await response.json();

  const ticker = tickerSelect.value;
  frameIndex = 0;
  frameSlider.max = surfaces[ticker].length - 1;
  loadFrame(ticker, frameIndex);

  playBtn.addEventListener("click", play);
  pauseBtn.addEventListener("click", pause);

  frameSlider.addEventListener("input", () => {
    const t = tickerSelect.value;
    frameIndex = parseInt(frameSlider.value, 10);
    loadFrame(t, frameIndex);
  });

  tickerSelect.addEventListener("change", () => {
    frameIndex = 0;
    const t = tickerSelect.value;
    frameSlider.max = surfaces[t].length - 1;
    loadFrame(t, frameIndex);
  });
}

init();
