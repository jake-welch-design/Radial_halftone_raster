let img;
let pane;

//GUI VARIABLES
let PARAMS = {
  Rings: 25,
  Spacing: 25,
  MaxThickness: 5,
  MinThickness: 40,
  ThicknessScaling: 0.1,
  Background: '#ffffff',
  Primary: '#ff0000',

  Save: function () {
    saveCanvas("export", "png");
  },
};

let bgColor = 255;
let primaryColor = 'red'; // Color of the lines

function preload(){
  img = loadImage('assets/run.png');
}

function setup() {
  let canvas = createCanvas(1000, 1000);
  canvas.drop(gotFile);
  img.loadPixels(); 

  //DAT GUI
  let containerElement = document.getElementById('tweakpane-container');

  pane = new Tweakpane.Pane({
    title: 'Spiral halftone raster',
    expanded: true,
    container: containerElement,
  });   

  pane.addInput(PARAMS, 'Rings', {
    min: 5,
    max: 100,
    step: 1,
  });
  pane.addInput(PARAMS, 'Spacing', {
    min: 1,
    max: 100,
    step: 1,
  });
  pane.addInput(PARAMS, 'MaxThickness', {
    min: 1,
    max: 100,
    step: 1,
  });

  pane.addInput(PARAMS, 'MinThickness', {
    min: 1,
    max: 100,
    step: 1,
  });

  pane.addInput(PARAMS, 'ThicknessScaling', {
    min: 0,
    max: 1,
    step: 0.1,
  });

  pane.addInput(PARAMS, 'Background').on('change', (value) => {
    bgColor = value;
  });

  pane.addInput(PARAMS, 'Primary').on('change', (value) => {
    primaryColor = value;
  });

  pane.addButton({
    title: 'Save',
  }).on('click', PARAMS.Save);
}

function draw() {
  background(PARAMS.Background);

  let centerX = width / 2;
  let centerY = height / 2;
  let maxRadius = min(width, height) / 2;

  for (let i = 0; i < PARAMS.Rings; i++) {
    let r = i * PARAMS.Spacing;
    if (r >= maxRadius) break;

    let angleStep = TWO_PI / (r * 0.5 + 1); // Adjust the number of lines per ring
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
      let strokeWeightValue1 = map(brightness1, 0, 255, PARAMS.MaxThickness, PARAMS.MinThickness); // Thicker for darker, thinner for lighter

      let imgX2 = floor(map(x2, 0, width, 0, img.width));
      let imgY2 = floor(map(y2, 0, height, 0, img.height));
      let index2 = (imgY2 * img.width + imgX2) * 4;
      let rCol2 = img.pixels[index2];
      let gCol2 = img.pixels[index2 + 1];
      let bCol2 = img.pixels[index2 + 2];
      let aCol2 = img.pixels[index2 + 3];
      let brightness2 = aCol2 === 0 ? 0 : (rCol2 + gCol2 + bCol2) / 3;
      let strokeWeightValue2 = map(brightness2, 0, 255, PARAMS.MaxThickness, PARAMS.MinThickness); // Thicker for darker, thinner for lighter

      // Calculate the distance from the center and apply the distanceScale factor
      let distanceFromCenter = dist(centerX, centerY, (x1 + x2) / 2, (y1 + y2) / 2);
      let distanceFactor = map(distanceFromCenter, 0, maxRadius, 1, PARAMS.ThicknessScaling); // Scale factor from 1 to distanceScale

      stroke(PARAMS.Primary);
      strokeWeight(((strokeWeightValue1 + strokeWeightValue2) / 2) * distanceFactor); // Apply the scaling factor
      noFill();
      beginShape();
      vertex(x1, y1);
      vertex(x2, y2);
      endShape();
    }
  }
}

function keyPressed(){
  if (key == 's' || key == 'S'){
    saveCanvas('image', 'png');
  }
}

function gotFile(file) {
  const reader = new FileReader();
  reader.onload = function (event) {
    loadImage(
      event.target.result,
      (loadedImage) => {
        img = loadedImage;
        img.loadPixels(); // Load the pixel data of the new image
        loop(); // Redraw the canvas with the new image
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
    img = loadImage(file.data, () => {
      img.loadPixels(); // Load the pixel data of the new image
      loop(); // Redraw the canvas with the new image
    });
  } else {
    console.log("This file is not an image.");
  }
}