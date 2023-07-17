p5.disableFriendlyErrors = true;

const bongos = {};

let cameraVideo;
let handModel;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);

  cameraVideo = createCapture(VIDEO, () => {
    resizeCanvas(cameraVideo.width, cameraVideo.height);
    centerCanvas(canvas);
    setupModel();

    bongos.left = getBongoObj(
      width - width / 4,
      height,
      100,
      100,
      "./assets/left_bongo.mp3"
    );
    bongos.right = getBongoObj(
      width / 4,
      height,
      100,
      100,
      "./assets/high_bongo.mp3"
    );
  });

  cameraVideo.hide();
}

// @ts-ignore
async function draw() {
  drawMirroredCapture(cameraVideo);

  if (handModel === undefined) {
    return;
  }

  // @ts-ignore
  Object.values(bongos).forEach((bongo) => {
    drawBongo(bongo);
  });

  await handModel.estimateHands(cameraVideo.elt).then(onHandsFound);
}

function onHandsFound(hands) {
  if (!Array.isArray(hands) || hands.length === 0) {
    return;
  }

  const leftHand = getLeftHand(hands);
  const rightHand = getRightHand(hands);

  if (Object.keys(leftHand).length > 0) {
    const hand = calculateHandCenter(leftHand);

    // debugHandBox(hand, "blue");

    if (isTouchingBongo(hand, bongos.left)) {
      bongos.left.sound.play();
    }
  }

  if (Object.keys(rightHand).length > 0) {
    const hand = calculateHandCenter(rightHand);

    // debugHandBox(hand, "red");

    if (isTouchingBongo(hand, bongos.right)) {
      bongos.right.sound.play();
    }
  }
}

function calculateHandCenter(hand) {
  const middleFingerBase = hand.keypoints[9];
  const palmBase = hand.keypoints[0];

  const handCenter = {
    x: (middleFingerBase.x + palmBase.x) / 2,
    y: (middleFingerBase.y + palmBase.y) / 2,
  };

  return getMirroredPos(handCenter);
}

function getLeftHand(hands) {
  const leftHand = hands.find((hand) => {
    return hand.handedness === "Left";
  });

  return leftHand !== undefined ? leftHand : {};
}

function getRightHand(hands) {
  const rightHand = hands.find((hand) => {
    return hand.handedness === "Right";
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

function centerCanvas(canvas) {
  const x = (windowWidth - width) / 2;
  const y = (windowHeight - height) / 2;
  canvas.position(x, y);
}

function drawBongo({ x, y, width, height }) {
  push();
  rectMode(CENTER);
  fill("green");

  rect(x, y, width, height);
  pop();
}

function getBongoObj(x, y, width, height, soundPath) {
  const sound = loadSound(soundPath);
  sound.playMode("untildone");

  const hitbox = {
    top: y - height / 2,
    bottom: y + height / 2,
    left: x - width / 2,
    right: x + width / 2,
  };

  return {
    x,
    y,
    width,
    height,
    hitbox,
    sound,
  };
}

function isTouchingBongo(hand, bongo) {
  if (hand.y < bongo.hitbox.top) {
    return false;
  }

  if (hand.x < bongo.hitbox.left || hand.x > bongo.hitbox.right) {
    return false;
  }

  return true;
}

function getMirroredPos({ x, y }) {
  const centerDistance = width / 2 - x;
  return { x: x + 2 * centerDistance, y };
}

function drawMirroredCapture(capture) {
  push();
  translate(width, 0);
  scale(-1, 1);
  image(capture, 0, 0, width, height);
  pop();
}

function debugHandBox(hand, color) {
  push();
  rectMode(CENTER);
  fill(color);
  rect(hand.x, hand.y, 50, 50);
  pop();
}
