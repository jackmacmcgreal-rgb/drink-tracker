let drinks = [];
let total = 0;

let lastUpdateTime;
let scrollY = 0;
let prevTouchY = 0;
let contentHeight = 0;
let deleteBtn;

let categories = [
  {
    name: "Quick Add",
    items: [
      { name: "Cocktail", value: 2 },
      { name: "Liquor Shot", value: 1 },
      { name: "Liqueur Shot", value: 0.5 },
      { name: "Mixer", value: 1 }
    ]
  },
  {
    name: "Beer",
    items: [
      { name: "Schooner Full", value: 1.1 },
      { name: "Schooner Mid", value: 0.8 },
      { name: "Schooner Light", value: 0.6 },
      { name: "Pint Full", value: 1.6 },
      { name: "Pint Mid", value: 1.2 },
      { name: "Pint Light", value: 0.9 },
      { name: "Bottle Full", value: 1.4 },
      { name: "Bottle Mid", value: 1 },
      { name: "Bottle Light", value: 0.8 }
    ]
  },
  {
    name: "Wine",
    items: [
      { name: "Red 150ml", value: 1.6 },
      { name: "White 150ml", value: 1.4 },
      { name: "Champagne 150ml", value: 1.5 },
      { name: "Bottle Wine", value: 7.5 }
    ]
  }
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);

  lastUpdateTime = millis();

  drinks = JSON.parse(localStorage.getItem("drinks") || "[]");
  total = parseFloat(localStorage.getItem("total") || "0");
}

function draw() {
  background(10);

  drawTopBar();

  push();
  translate(0, scrollY);
  contentHeight = drawCategories();
  pop();

  drawBottomPanel();
}

function drawTopBar() {
  fill(20);
  rect(0, 0, width, 100);

  fill(255);
  textSize(40);
  text("Drinks", width / 2, 30);

  textSize(60);
  text(nf(total, 1, 1), width / 2, 75);

  deleteBtn = { x: width - 130, y: 30, w: 120, h: 40 };

  fill(200, 60, 60);
  rect(deleteBtn.x, deleteBtn.y, deleteBtn.w, deleteBtn.h, 10);

  fill(255);
  textSize(14);
  text("Undo", deleteBtn.x + 60, deleteBtn.y + 20);
}

function drawCategories() {
  let y = 120;

  for (let cat of categories) {
    fill(120, 200, 255);
    textSize(24);
    text(cat.name, width / 2, y);
    y += 30;

    for (let item of cat.items) {
      fill(30);
      rect(20, y, width - 40, 60, 12);

      fill(255);
      textSize(18);
      text(item.name + " (" + item.value + ")", width / 2, y + 30);

      item.x = 20;
      item.y = y;
      item.w = width - 40;
      item.h = 60;

      y += 70;
    }

    y += 20;
  }

  return y;
}

function drawBottomPanel() {
  let h = 180;

  fill(20);
  rect(0, height - h, width, h);

  fill(255);
  textSize(20);
  text("Recent", width / 2, height - h + 30);

  let recent = drinks.slice(-3).reverse();
  let y = height - h + 70;

  for (let d of recent) {
    text(d.name + " +" + d.value, width / 2, y);
    y += 25;
  }
}


function mousePressed() {
  handleTap(mouseX, mouseY);
  prevTouchY = mouseY;
}

function touchStarted() {
  if (touches.length > 0) {
    handleTap(touches[0].x, touches[0].y);
    prevTouchY = touches[0].y;
  }
  return false;
}

function touchMoved() {
  if (touches.length > 0) {
    let currentY = touches[0].y;
    let delta = currentY - prevTouchY;

    if (isFinite(delta)) {
      scrollY += delta;
    }

    prevTouchY = currentY;

    let minScroll = min(0, height - contentHeight - 120);
    scrollY = constrain(scrollY, minScroll, 0);
  }
  return false;
}
