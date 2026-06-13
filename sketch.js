
let drinks = [];
let total = 0;

let scrollY = 0;
let lastY = 0;

let contentHeight = 0;

let buttons = {};
let popAnim = 0;

let todayKey = new Date().toDateString();

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

  let c = document.querySelector("canvas");
  if (c) {
    c.style.position = "fixed";
    c.style.touchAction = "none";
  }

  // DAILY RESET SYSTEM
  let savedDay = localStorage.getItem("day");
  if (savedDay !== todayKey) {
    localStorage.setItem("drinks", "[]");
    localStorage.setItem("total", "0");
    localStorage.setItem("day", todayKey);
  }

  drinks = JSON.parse(localStorage.getItem("drinks") || "[]");
  total = Number(localStorage.getItem("total") || 0);

  if (isNaN(total)) total = 0;
}

function draw() {
  background(12);

  popAnim *= 0.9;

  drawHeader();

  push();
  translate(0, scrollY);
  contentHeight = drawCategories();
  pop();
  
  drawFooter();
}

// ================= HEADER =================

function drawHeader() {
  fill(20);
  rect(0, 0, width, 120);

  fill(255);
  textSize(28);
  text("Drink Tracker", width / 2, 25);

  textSize(56);
  text(nf(total, 1, 1), width / 2, 75);

  buttons.undo = { x: 15, y: 40, w: 90, h: 40 };
  buttons.reset = { x: width - 105, y: 40, w: 90, h: 40 };

  drawButton(buttons.undo, "Undo", color(80));
  drawButton(buttons.reset, "RESET", color(220, 60, 60));
}

function drawButton(b, label, col) {
  fill(col);
  rect(b.x, b.y, b.w, b.h, 12);

  fill(255);
  textSize(14);
  text(label, b.x + b.w / 2, b.y + b.h / 2);
}

// ================= LIST =================

function drawCategories() {
  let y = 140;

  for (let cat of categories) {
    fill(120, 200, 255);
    textSize(20);
    text(cat.name, width / 2, y);
    y += 30;

    for (let item of cat.items) {
      fill(30);
      rect(15, y, width - 30, 60, 14);

      fill(255);
      textSize(16);
      text(item.name + " (" + item.value + ")", width / 2, y + 30);

      item.x = 15;
      item.y = y;
      item.w = width - 30;
      item.h = 60;

      y += 70;
    }

    y += 20;
  }

  return y;
}

// ================= FOOTER =================

function drawFooter() {
  let h = 120;

  fill(20);
  rect(0, height - h, width, h);

  fill(255);
  textSize(14);
  text("Tap • Scroll • Swipe items • Reset anytime", width / 2, height - h + 25);

  let recent = drinks.slice(-3).reverse();
  let y = height - h + 55;

  for (let d of recent) {
    text(`${d.name} +${d.value}`, width / 2, y);
    y += 20;
  }
}

// ================= INPUT =================

function touchStarted() {
  if (touches.length > 0) {
    handleTap(touches[0].x, touches[0].y);
    lastY = touches[0].y;
  }
  return false;
}

function touchMoved() {
  if (touches.length === 0) return false;

  let y = touches[0].y;
  let delta = y - lastY;

  scrollY += delta;

  let minScroll = min(0, height - contentHeight - 140);
  scrollY = constrain(scrollY, minScroll, 0);

  lastY = y;
  return false;
}

function mousePressed() {
  handleTap(mouseX, mouseY);
  return false;
}

// ================= TAP =================

function handleTap(mx, my) {
  if (hit(buttons.undo, mx, my)) {
    undoDrink();
    return;
  }

  if (hit(buttons.reset, mx, my)) {
    resetAll();
    return;
  }

  let y = my - scrollY;

  for (let cat of categories) {
    for (let item of cat.items) {
      if (
        mx > item.x &&
        mx < item.x + item.w &&
        y > item.y &&
        y < item.y + item.h
      ) {
        addDrink(item.name, item.value);
      }
    }
  }
}

function hit(b, x, y) {
  return b && x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h;
}

// ================= ACTIONS =================

function addDrink(name, value) {
  drinks.push({ name, value });
  total += value;
  save();
  popAnim = 1;

  if (navigator.vibrate) navigator.vibrate(10);
}

function undoDrink() {
  if (drinks.length > 0) {
    let last = drinks.pop();
    total -= last.value;
    total = max(0, total);
    save();
  }
}

function resetAll() {
  drinks = [];
  total = 0;
  save();

  if (navigator.vibrate) navigator.vibrate([30, 30, 30]);
}

function save() {
  localStorage.setItem("drinks", JSON.stringify(drinks));
  localStorage.setItem("total", total);
}
