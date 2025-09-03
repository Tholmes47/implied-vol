document.addEventListener('DOMContentLoaded', function() {
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
    // Check if we have data for this ticker
    if (!surfaces[ticker] || surfaces[ticker].length === 0) {
      console.error("No frames available for", ticker);
      dateDisplay.textContent = "No data available";
      return;
    }
    
    // Check if index is valid
    if (index >= surfaces[ticker].length) {
      console.error("Invalid frame index", index, "for", ticker);
      return;
    }
    
    const file = surfaces[ticker][index];
    surfaceFrame.src = `data/${ticker}/${file}`;
    dateDisplay.textContent = `Date: ${extractDate(file)}`;
    frameSlider.value = index;
  }

  function play() {
    const ticker = tickerSelect.value;
    
    // Validate we have data for this ticker
    if (!surfaces[ticker] || surfaces[ticker].length === 0) {
      console.error("No frames available for", ticker);
      dateDisplay.textContent = "No data available for " + ticker;
      return;
    }
    
    clearInterval(timer);
    frameIndex = parseInt(frameSlider.value, 10);
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
    try {
      const response = await fetch("data/manifest.json");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      surfaces = await response.json();
      console.log("Loaded manifest:", surfaces);

      // Set up event listeners
      playBtn.addEventListener("click", play);
      pauseBtn.addEventListener("click", pause);

      frameSlider.addEventListener("input", () => {
        const t = tickerSelect.value;
        frameIndex = parseInt(frameSlider.value, 10);
        loadFrame(t, frameIndex);
      });

      tickerSelect.addEventListener("change", () => {
        const t = tickerSelect.value;
        
        // Check if we have data for this ticker
        if (surfaces[t] && surfaces[t].length > 0) {
          frameIndex = 0;
          frameSlider.max = surfaces[t].length - 1;
          loadFrame(t, frameIndex);
        } else {
          console.error("No data for ticker:", t);
          dateDisplay.textContent = "No data available for " + t;
          surfaceFrame.src = ""; // Clear the iframe
        }
      });

      // Load initial frame
      const ticker = tickerSelect.value;
      if (surfaces[ticker] && surfaces[ticker].length > 0) {
        frameIndex = 0;
        frameSlider.max = surfaces[ticker].length - 1;
        loadFrame(ticker, frameIndex);
      } else {
        console.error("No initial data for ticker:", ticker);
        dateDisplay.textContent = "No data available for " + ticker;
      }
      
    } catch (error) {
      console.error("Failed to load manifest:", error);
      dateDisplay.textContent = "Failed to load data. Check console for details.";
    }
  }

  init();
});