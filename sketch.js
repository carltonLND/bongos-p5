p5.disableFriendlyErrors = true;

let capture;
let detector;

function setup() {
  const canvas = createCanvas(200, 200);

  capture = createCapture(VIDEO);
  capture.elt.onloadeddata = function () {
    createDetector();
    resizeCanvas(capture.width, capture.height);
    centerCanvas(canvas);
  };

  capture.hide();
}

function draw() {
  background(255);
  image(capture, 0, 0, width, height);

  if (detector === undefined) {
    return;
  }

  detector.estimateHands(capture.elt).then(onHandsFound);
}

function centerCanvas(canvas) {
  let canvasX = (windowWidth - width) / 2;
  let canvasy = (windowHeight - height) / 2;
  canvas.position(canvasX, canvasy);
}

function calculateHandCenter(hand) {
  const middleFingerBase = hand.keypoints[9];
  const palmBase = hand.keypoints[0];

  return {
    x: (middleFingerBase.x + palmBase.x) / 2,
    y: (middleFingerBase.y + palmBase.y) / 2,
  };
}

function getLeftHand(hands) {
  const leftHand = hands.find((hand) => {
    return hand.handedness === "Right";
  });

  return leftHand !== undefined ? leftHand : {};
}

function getRightHand(hands) {
  const rightHand = hands.find((hand) => {
    return hand.handedness === "Left";
  });

  return rightHand !== undefined ? rightHand : {};
}

function createDetector() {
  // @ts-ignore
  const handPoseModel = handPoseDetection.SupportedModels.MediaPipeHands;

  const detectorConfig = {
    runtime: "mediapipe",
    solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/hands",
    modelType: "full",
  };

  // @ts-ignore
  handPoseDetection
    .createDetector(handPoseModel, detectorConfig)
    .then((_detector) => {
      detector = _detector;
    });
}

function onHandsFound(hands) {
  if (!Array.isArray(hands) || hands.length === 0) {
    return;
  }

  const leftHand = getLeftHand(hands);
  const rightHand = getRightHand(hands);

  rectMode(CENTER);

  if (Object.keys(leftHand).length > 0) {
    const leftHandCenter = calculateHandCenter(leftHand);
    fill("blue");
    rect(leftHandCenter.x, leftHandCenter.y, 50, 50);
  }

  if (Object.keys(rightHand).length > 0) {
    const rightHandCenter = calculateHandCenter(rightHand);
    fill("red");
    rect(rightHandCenter.x, rightHandCenter.y, 50, 50);
  }
}
