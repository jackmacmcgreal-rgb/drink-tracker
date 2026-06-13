
let drinks = [];
let total = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);

  drinks = JSON.parse(localStorage.getItem("drinks") || "[]");
  total = parseFloat(localStorage.getItem("total") || "0");
}

function draw() {
  background(10);

  fill(255);
  textSize(40);
  text("WORKING TEST", width / 2, height / 2);

  textSize(20);
  text("Tap anywhere", width / 2, height / 2 + 50);
}

function touchStarted() {
  total += 1;
  localStorage.setItem("total", total);
  return false;
}

function mousePressed() {
  total += 1;
  localStorage.setItem("total", total);
  return false;
}
