p5.disableFriendlyErrors = true;

let capture;
let detector;

function setup() {
  createCanvas(windowWidth, windowHeight);

  capture = createCapture(VIDEO);
  capture.elt.onloadeddata = function () {
    createDetector();
  };

  capture.hide();
}

function draw() {
  background("gray");

  if (detector === undefined) {
    return;
  }

  detector.estimateHands(capture.elt).then(onHandsFound);
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
    const { x, y } = getRelativePos(leftHandCenter);
    fill("blue");
    rect(x, y, 50, 50);
  }

  if (Object.keys(rightHand).length > 0) {
    const rightHandCenter = calculateHandCenter(rightHand);
    const { x, y } = getRelativePos(rightHandCenter);
    fill("red");
    rect(x, y, 50, 50);
  }
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

function getRelativePos({ x, y }) {
  const factorX = width / capture.width;
  const factorY = height / capture.height;

  return { x: x * factorX, y: y * factorY };
}
