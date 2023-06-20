let videoLoaded = false;
let capture;
let handModel;
let hands;

loadModel();

function setup() {
  let canvas = createCanvas(200, 200);
  capture = createCapture(VIDEO);

  // elt property access' the underlying html element
  // this looks just like <video onloadeddata="myFunction()">
  capture.elt.onloadeddata = function () {
    resizeCanvas(capture.width, capture.height);
    centerCanvas(canvas);
    videoLoaded = true;
  };

  capture.hide();
}

function draw() {
  background(255);
  image(capture, 0, 0, width, height);

  updateHands();

  if (Array.isArray(hands) && hands.length) {
    fill("blue");
    rectMode(CENTER);
    rect(...calculateHandCenter(), 50, 50);
  }
}

function centerCanvas(canvas) {
  let canvasX = (windowWidth - width) / 2;
  let canvasy = (windowHeight - height) / 2;
  canvas.position(canvasX, canvasy);
}

/**

 * @returns {[number, number]}

*/
function calculateHandCenter() {
  const [topLeftX, topLeftY] = hands[0].boundingBox.topLeft;
  const [bottomRightX, bottomRightY] = hands[0].boundingBox.bottomRight;

  return [(topLeftX + bottomRightX) / 2, (topLeftY + bottomRightY) / 2];
}

function updateHands() {
  if (handModel && videoLoaded) {
    handModel.estimateHands(capture.elt).then(function (_hands) {
      hands = _hands;
    });
  }
}

function loadModel() {
  // @ts-ignore
  handpose.load().then(function (_model) {
    handModel = _model;
  });
}
