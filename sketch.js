
let drinks = [];
let total = 0;

let screen = "home"; // home | beer | wine | spirits

let buttons = {};

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);

  let c = document.querySelector("canvas");
  if (c) {
    c.style.position = "fixed";
    c.style.touchAction = "none";
  }

  drinks = JSON.parse(localStorage.getItem("drinks") || "[]");
  total = Number(localStorage.getItem("total") || 0);
}

// ================= DRAW =================

function draw() {
  background(15);

  drawTopBar();

  if (screen === "home") drawHome();
  if (screen === "beer") drawBeer();
  if (screen === "wine") drawWine();
  if (screen === "spirits") drawSpirits();

  drawBottomBar();
}

// ================= TOP BAR (ALWAYS VISIBLE) =================

function drawTopBar() {
  fill(20);
  rect(0, 0, width, 120);

  fill(255);
  textSize(28);
  text("Drink Tracker", width / 2, 25);

  textSize(44);
  text(nf(total, 1, 1), width / 2, 75);

  // NEVER BLOCKED BUTTONS
  buttons.undo = { x: 10, y: 40, w: 80, h: 40 };
  buttons.reset = { x: width - 90, y: 40, w: 80, h: 40 };

  drawBtn(buttons.undo, "Undo", color(80));
  drawBtn(buttons.reset, "Reset", color(200, 60, 60));
}

function drawBtn(b, label, col) {
  fill(col);
  rect(b.x, b.y, b.w, b.h, 10);
  fill(255);
  textSize(12);
  text(label, b.x + b.w / 2, b.y + b.h / 2);
}

// ================= HOME SCREEN =================

function drawHome() {
  drawNavButton("Beer", width / 2, 220, "beer");
  drawNavButton("Wine", width / 2, 340, "wine");
  drawNavButton("Spirits", width / 2, 460, "spirits");
}

function drawNavButton(label, x, y, target) {
  fill(40);
  rect(x - 120, y - 40, 240, 80, 16);

  fill(255);
  textSize(22);
  text(label, x, y);

  buttons[label] = { x: x - 120, y: y - 40, w: 240, h: 80, target };
}

// ================= BEER =================

function drawBeer() {
  drawBack();

  let items = [
    ["Pint", 1.6],
    ["Schooner", 1.1],
    ["Bottle", 1.4]
  ];

  drawItems(items);
}

// ================= WINE =================

function drawWine() {
  drawBack();

  let items = [
    ["Red 150ml", 1.6],
    ["White 150ml", 1.4],
    ["Champagne", 1.5]
  ];

  drawItems(items);
}

// ================= SPIRITS =================

function drawSpirits() {
  drawBack();

  let items = [
    ["Shot", 1],
    ["Double Shot", 2],
    ["Liqueur", 0.5]
  ];

  drawItems(items);
}

// ================= ITEMS =================

function drawItems(items) {
  let y = 180;

  for (let i of items) {
    let b = { x: 20, y: y, w: width - 40, h: 70 };

    fill(30);
    rect(b.x, b.y, b.w, b.h, 14);

    fill(255);
    textSize(18);
    text(`${i[0]} (${i[1]})`, width / 2, y + 35);

    b.label = i[0];
    b.value = i[1];

    buttons[i[0]] = b;

    y += 90;
  }
}

// ================= BACK BUTTON =================

function drawBack() {
  fill(80);
  rect(10, 130, 90, 40, 10);

  fill(255);
  textSize(14);
  text("Back", 55, 150);

  buttons.back = { x: 10, y: 130, w: 90, h: 40 };
}

// ================= BOTTOM BAR (SAFE AREA) =================

function drawBottomBar() {
  let h = 80;

  fill(20);
  rect(0, height - h, width, h);

  fill(200);
  textSize(12);
  text("Tap items • Use Undo / Reset", width / 2, height - 45);
}

// ================= INPUT =================

function touchStarted() {
  if (touches.length > 0) {
    handleTap(touches[0].x, touches[0].y);
  }
  return false;
}

function mousePressed() {
  handleTap(mouseX, mouseY);
  return false;
}

// ================= TAP SYSTEM =================

function handleTap(x, y) {
  // undo
  if (hit(buttons.undo, x, y)) return undo();

  // reset
  if (hit(buttons.reset, x, y)) return reset();

  // back
  if (hit(buttons.back, x, y)) {
    screen = "home";
    return;
  }

  // nav
  for (let k in buttons) {
    let b = buttons[k];
    if (b.target && hit(b, x, y)) {
      screen = b.target;
      return;
    }
  }

  // add drinks
  for (let k in buttons) {
    let b = buttons[k];
    if (b.value && hit(b, x, y)) {
      addDrink(b.label, b.value);
      return;
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
}

function undo() {
  if (drinks.length > 0) {
    let last = drinks.pop();
    total -= last.value;
    total = max(0, total);
    save();
  }
}

function reset() {
  drinks = [];
  total = 0;
  save();
}

function save() {
  localStorage.setItem("drinks", JSON.stringify(drinks));
  localStorage.setItem("total", total);
}
