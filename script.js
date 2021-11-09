import { GIFEncoder, quantize, applyPalette } from "https://unpkg.com/gifenc";

function makeTextAnImage(value) {

  // Canvas dimensions
  const canvas = document.querySelector('canvas')//document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;

  let context = canvas.getContext("2d");
  context.font = "24px monospace";

  let tryUntil = 60;
  let startSize = 24;

  // // Size up until it fits nicely
  let measurements = context.measureText(value);
  for (let i = startSize; i < tryUntil; i++) {
    context.font = `${i}px monospace`;

    let measurementTest = context.measureText(value);
    if (measurementTest.width > canvas.width) {
      context.font = `${i - 1}px monospace`;
      measurements = context.measureText(value);
      break;
    }
  }

  // Try to center align
  context.textAlign = "center";
  context.textBaseline = "middle";

  context.fillText(
    value,
    canvas.width / 2,
    canvas.height / 2 + (measurements.fontBoundingBoxDescent || 2)
  );

  return canvas;
}

// Random + or - int between range rounded
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.round(Math.floor(Math.random() * (max - min + 1)) + min);
}

// Make the shaky image
function makeShakyBoi(char, intensity) {

  if(!char) return
  
  // Get emoji as canvas
  const emojiInCanvas = makeTextAnImage(char);

  // Use this canvas to create frames
  const fgCanvas = document.createElement('canvas')
  const fgContext = fgCanvas.getContext("2d");
  fgCanvas.width = 64;
  fgCanvas.height = 64;

  // Gif Encoder
  const gif = GIFEncoder();
  for (let i = 0; i < 42; i++) {
    fgCanvas.width = fgCanvas.width;
    fgContext.drawImage(
      emojiInCanvas,
      getRandomInt(-intensity, intensity),
      getRandomInt(-intensity, intensity)
    );

    const data = fgContext.getImageData(0, 0, fgCanvas.width, fgCanvas.height)
      .data;

    const palette = quantize(data, 256, { format: "rgba4444"});
    const index = applyPalette(data, palette, "rgba4444");

    gif.writeFrame(index, fgCanvas.width, fgCanvas.height, {
      palette,
      delay: 20,
      transparent: true
    });
  }

  gif.finish();

  const buffer = gif.bytesView();
  const blob = buffer instanceof Blob ? buffer : new Blob([buffer], { type: "image/gif" });
  const dataUrl = URL.createObjectURL(blob);

  document.getElementById("image").src = dataUrl
  document.querySelector('.bg').style.backgroundImage = `url(${dataUrl})`
}


let intensityVal = 2

const textInput = document.querySelector("input[type=text]")
textInput.addEventListener('input', (e) => {
  textInput.value = e.data
  makeShakyBoi(e.data, intensityVal)
})

const slider = document.querySelector("input[type=range]")
slider.addEventListener('change', () => {
  intensityVal = slider.value
  makeShakyBoi(textInput.value, intensityVal)
})

const randomStarts = ['👀', '🤡', '🤫', '😐', '🥶']

textInput.value = randomStarts[Math.floor(Math.random() * randomStarts.length)]

makeShakyBoi(textInput.value, intensityVal)




