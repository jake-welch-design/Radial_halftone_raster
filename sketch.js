let canvas;
let GUI;
let img;

let canvasWidthSlider, canvasHeightSlider;
let canvasWidth = 800;
let canvasHeight = 800;
let canvasWidthInput, canvasHeightInput;

let rings = 50;
let ringsSlider;
let ringsInput;
let ringResolution = 1.5;

let spacing = 10;
let spacingSlider;
let spacingInput;

let minWeight = 1;
let minWeightSlider;
let minWeightInput;

let maxWeight =10;
let maxWeightSlider;
let maxWeightInput;

let weightScaling = 0.1;
let weightScalingSlider;
let weightScalingInput;

let downloadButton;

let bgColor = "#000000";
let primaryColor = "#FFFFFF";
let bgColorInput, primaryColorInput;

function preload() {
  img = loadImage("assets.run.png", resizeAndCropImage, () => {
    console.error("Error loading image. Image not found");
  });
}

function setup() {
  canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent("canvas-container");
  canvas.drop(gotFile);
  img.loadPixels(); 

  GUI = createDiv().parent("slider-container");
  GUI.class("GUI");

  createGUItoggleButton();
  initGui();
  setInitialGUIvalues();
}

function draw() {
  background(bgColor);
  drawComp();
}

function drawComp() {
  let centerX = width / 2;
  let centerY = height / 2;
  let maxRadius = min(width, height) / 2;

  for (let i = 0; i < rings; i++) {
    let r = i * spacing;
    if (r >= maxRadius) break;

    let angleStep = TWO_PI / (r * ringResolution);
    for (let angle = 0; angle < TWO_PI; angle += angleStep) {
      let x1 = centerX + cos(angle) * r;
      let y1 = centerY + sin(angle) * r;
      let x2 = centerX + cos(angle + angleStep) * r;
      let y2 = centerY + sin(angle + angleStep) * r;

      let imgX1 = floor(map(x1, 0, width, 0, img.width));
      let imgY1 = floor(map(y1, 0, height, 0, img.height));
      let index1 = (imgY1 * img.width + imgX1) * 4;
      let rCol1 = img.pixels[index1];
      let gCol1 = img.pixels[index1 + 1];
      let bCol1 = img.pixels[index1 + 2];
      let aCol1 = img.pixels[index1 + 3];
      let brightness1 = aCol1 === 0 ? 0 : (rCol1 + gCol1 + bCol1) / 3;
      let strokeWeightValue1 = map(brightness1, 0, 255, minWeight, maxWeight);

      let imgX2 = floor(map(x2, 0, width, 0, img.width));
      let imgY2 = floor(map(y2, 0, height, 0, img.height));
      let index2 = (imgY2 * img.width + imgX2) * 4;
      let rCol2 = img.pixels[index2];
      let gCol2 = img.pixels[index2 + 1];
      let bCol2 = img.pixels[index2 + 2];
      let aCol2 = img.pixels[index2 + 3];
      let brightness2 = aCol2 === 0 ? 0 : (rCol2 + gCol2 + bCol2) / 3;
      let strokeWeightValue2 = map(brightness2, 0, 255, minWeight, maxWeight); 

      let distanceFromCenter = dist(centerX, centerY, (x1 + x2) / 2, (y1 + y2) / 2);
      let distanceFactor = map(distanceFromCenter, 0, maxRadius, 1, weightScaling); 

      stroke(primaryColor);
      strokeWeight(((strokeWeightValue1 + strokeWeightValue2) / 2) * distanceFactor); 
      noFill();
      beginShape();
      vertex(x1, y1);
      vertex(x2, y2);
      endShape();
    }
  }
}

// START OF GUI FUNCTIONS

function createGUItoggleButton() {
  const toggle = createButton("SHOW GUI");
  toggle.class("toggle");
  toggle.mousePressed(toggleGUI);
  toggle.size(100);
}

function toggleGUI() {
  GUI.toggleClass("hide");
}

function initGui() {
  const canvasMin = 100;
  const canvasWidthMax = windowWidth-100;
  const canvasHeightMax = windowHeight-100;

  const ringsMin = 5;
  const ringsMax = 150;

  const strokeMin = 1;
  const strokeMax = 100;

  const scalingMin = 0.01;
  const scalingMax = 1;

  const spacingMin = 1;
  const spacingMax = 100;

  const oneStep = 1;
  const tenthStep = 0.1;
  const hundredthStep = 0.01;

  ({ input: canvasWidthInput, slider: canvasWidthSlider } = createGUI(
    "CANVAS WIDTH", canvasWidth, canvasMin, canvasWidthMax, oneStep, updateFromInputs, updateFromSliders, GUI, 
  ));

  ({ input: canvasHeightInput, slider: canvasHeightSlider } = createGUI(
    "CANVAS HEIGHT", canvasHeight, canvasMin, canvasHeightMax, oneStep, updateFromInputs, updateFromSliders, GUI, 
  ));

  ({ input: ringsInput, slider: ringsSlider } = createGUI(
    "RINGS #", rings, ringsMin, ringsMax, oneStep, updateFromInputs, updateFromSliders, GUI, 
  ));

  ({ input: spacingInput, slider: spacingSlider } = createGUI(
    "SPACING", spacing, spacingMin, spacingMax, oneStep, updateFromInputs, updateFromSliders, GUI, 
  ));

  ({ input: minWeightInput, slider: minWeightSlider } = createGUI(
    "MIN STROKE WEIGHT", minWeight, strokeMin, strokeMax, oneStep, updateFromInputs, updateFromSliders, GUI, 
  ));

  ({ input: maxWeightInput, slider: maxWeightSlider } = createGUI(
    "MAX STROKE WEIGHT", maxWeight, strokeMin, strokeMax, oneStep, updateFromInputs, updateFromSliders, GUI, 
  ));

  ({ input: weightScalingInput, slider: weightScalingSlider } = createGUI(
    "WEIGHT SCALING", weightScaling, scalingMin, scalingMax, hundredthStep, updateFromInputs, updateFromSliders, GUI,
  ));

  ({ input: bgColorInput } = createColorGUI(
    "BACKGROUND COLOR", bgColor, updateFromInputs, GUI, 
  ));

  ({ input: primaryColorInput } = createColorGUI(
    "STROKE COLOR", primaryColor, updateFromInputs, GUI,
  ));

  downloadButton = createButton("DOWNLOAD").parent(createDiv().parent(GUI).class("row"));
  downloadButton.mousePressed(download);
}

function createGUI(labelText, defaultValue, min, max, steps, inputCallback, sliderCallback, parentContainer) {
  const container = createDiv().parent(parentContainer);
  container.class("row");

  const label = createP(labelText).parent(container);
  label.style("margin", "0");

  const input = createInput(defaultValue).parent(container);
  input.style("margin", "0 10px");
  input.size(60);
  input.attribute("type", "number");
  input.input(inputCallback);

  const slider = createSlider(min, max, defaultValue, steps).parent(container);
  slider.style("flex", "1");
  slider.input(sliderCallback);

  return { input, slider };
}

function createColorGUI(labelText, defaultValue, inputCallback, parentContainer) {
  const container = createDiv().parent(parentContainer);
  container.class("row");

  const label = createP(labelText).parent(container);
  label.style("margin", "0");

  const input = createInput(defaultValue, "color").parent(container);
  input.style("margin", "0 10px");
  input.size(60);
  input.attribute("type", "color");
  input.input(inputCallback);

  return { input };
}

function download() {
  saveCanvas(canvas, "output", "png");
}

function setInitialGUIvalues() {
let numberInput = document.querySelector('input[type="number"]');
  numberInput.setAttribute("step", "0.1");
}

function syncInputsSliders() {
  updateCanvasSize();
  canvasWidthInput.value(canvasWidth);
  canvasHeightInput.value(canvasHeight);
  ringsInput.value(rings);
  spacingInput.value(spacing);
  minWeightInput.value(minWeight);
  maxWeightInput.value(maxWeight);
  weightScalingInput.value(weightScaling);
}

function syncSlidersInputs() {
  canvasWidthSlider.value(canvasWidth);
  canvasHeightSlider.value(canvasHeight);
  ringsSlider.value(rings);
  spacingSlider.value(spacing);
  minWeightSlider.value(minWeight);
  maxWeightSlider.value(maxWeight);
  weightScalingSlider.value(weightScaling);
  bgColorInput.value(bgColor);
  primaryColorInput.value(primaryColor);
}

function updateFromSliders() {
  canvasWidth = canvasWidthSlider.value();
  canvasHeight = canvasHeightSlider.value();
  rings = ringsSlider.value();
  spacing = spacingSlider.value();
  minWeight = minWeightSlider.value();
  maxWeight = maxWeightSlider.value();
  weightScaling = weightScalingSlider.value();

  updateCanvasSize();
  syncInputsSliders();
}

function updateFromInputs() {
  canvasWidth = parseInt(canvasWidthInput.value());
  canvasHeight = parseInt(canvasHeightInput.value());
  rings = parseInt(ringsInput.value());
  spacing = parseInt(spacingInput.value());
  minWeight = parseInt(minWeightInput.value());
  maxWeight = parseInt(maxWeightInput.value());
  weightScaling = parseFloat(weightScalingInput.value());
  bgColor = bgColorInput.value();
  primaryColor = primaryColorInput.value();

  updateCanvasSize();
  img.loadPixels(); 
  loop(); 
  syncSlidersInputs();
}

function updateCanvasSize() {
  if (canvasWidth !== width || canvasHeight !== height) {
    resizeCanvas(canvasWidth, canvasHeight);
    img = resizeAndCropImage(loadedImage, canvasWidth, canvasHeight);
      img.loadPixels(); 
      loop(); 
  }
}

function gotFile(file) {
  const reader = new FileReader();
  reader.onload = function (event) {
    loadImage(
      event.target.result,
      (loadedImage) => {
        img = resizeAndCropImage(loadedImage, canvasWidth, canvasHeight);
        img.loadPixels(); 
        loop();
      },
      (error) => {
        console.error("Error loading image:", error);
      }
    );
  };
  reader.readAsDataURL(file.file);
}

function handleFile(file) {
  if (file.type === "image") {
    loadImage(file.data, (loadedImage) => {
      img = resizeAndCropImage(loadedImage, canvasWidth, canvasHeight);
      img.loadPixels(); 
      loop(); 
    });
  } else {
    console.log("This file is not an image.");
  }
}

function resizeAndCropImage(image) {
  const imgAspectRatio = image.width / image.height;
  const canvasAspectRatio = canvasWidth / canvasHeight;

  let newWidth, newHeight;
  if (imgAspectRatio > canvasAspectRatio) {
    newHeight = canvasHeight;
    newWidth = imgAspectRatio * newHeight;
  } else {
    newWidth = canvasWidth;
    newHeight = newWidth / imgAspectRatio;
  }

  const resizedImage = createImage(newWidth, newHeight);
  resizedImage.copy(image, 0, 0, image.width, image.height, 0, 0, newWidth, newHeight);

  const croppedImage = createImage(canvasWidth, canvasHeight);
  croppedImage.copy(resizedImage, (newWidth - canvasWidth) / 2, (newHeight - canvasHeight) / 2, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);

  img = croppedImage;
  img.loadPixels();
  loop();
}