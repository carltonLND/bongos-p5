p5.disableFriendlyErrors = true;

let cameraVideo;
let handModel;
let bongoSound;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);

  cameraVideo = createCapture(VIDEO);
  cameraVideo.elt.onloadeddata = function () {
    resizeCanvas(cameraVideo.width, cameraVideo.height);
    centerCanvas(canvas);
    setupModel();
  };

  cameraVideo.hide();

  bongoSound = loadSound("./assets/temp-bongo.mp3");
  bongoSound.playMode("untildone");
}

function draw() {
  background("gray");

  image(cameraVideo, 0, 0, width, height);

  if (handModel === undefined) {
    return;
  }

  handModel.estimateHands(cameraVideo.elt).then(onHandsFound);
}

function onHandsFound(hands) {
  if (!Array.isArray(hands) || hands.length === 0) {
    return;
  }

  const leftHand = getLeftHand(hands);
  const rightHand = getRightHand(hands);

  rectMode(CENTER);

  if (Object.keys(leftHand).length > 0) {
    const { x, y } = calculateHandCenter(leftHand);

    fill("blue");
    rect(x, y, 50, 50);
  }

  if (Object.keys(rightHand).length > 0) {
    const { x, y } = calculateHandCenter(rightHand);

    fill("red");
    rect(x, y, 50, 50);
  }
}

function calculateHandCenter(hand) {
  const middleFingerBase = hand.keypoints[9];
  const palmBase = hand.keypoints[0];

  const handCenter = {
    x: (middleFingerBase.x + palmBase.x) / 2,
    y: (middleFingerBase.y + palmBase.y) / 2,
  };
  return getRelativePos(handCenter);
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

function setupModel() {
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
      handModel = _detector;
    });
}

function getRelativePos({ x, y }) {
  const factorX = width / cameraVideo.width;
  const factorY = height / cameraVideo.height;

  return { x: x * factorX, y: y * factorY };
}

function centerCanvas(canvas) {
  const x = (windowWidth - width) / 2;
  const y = (windowHeight - height) / 2;
  canvas.position(x, y);
}
