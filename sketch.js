
let drinks = [];
let total = 0;

let screen = "home";
let step = null;
let selection = {};

let buttons = {};

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);

  // 🚨 HARD iOS + DESKTOP TOUCH LOCK (prevents image drag/download)
  let c = document.querySelector("canvas");
  if (c) {
    c.style.position = "fixed";
    c.style.touchAction = "none";
    c.style.userSelect = "none";
    c.style.webkitUserSelect = "none";
    c.style.webkitTouchCallout = "none";
    c.style.webkitTapHighlightColor = "transparent";
  }

  drinks = JSON.parse(localStorage.getItem("drinks") || "[]");
  total = Number(localStorage.getItem("total") || 0);
}

// ================= DRAW =================

function draw() {
  background(15);

  drawTop();

  if (screen === "home") drawHome();
  else drawFlow();

  drawBottom();
}

// ================= TOP BAR =================

function drawTop() {
  fill(20);
  rect(0, 0, width, 120);

  fill(255);
  textSize(26);
  text("Drink Tracker", width / 2, 25);

  textSize(48);
  text(nf(total, 1, 1), width / 2, 75);

  buttons.undo = { x: 10, y: 40, w: 80, h: 40 };
  buttons.reset = { x: width - 90, y: 40, w: 80, h: 40 };

  btn(buttons.undo, "Undo", 80);
  btn(buttons.reset, "Reset", [200, 60, 60]);
}

function btn(b, label, col) {
  fill(col);
  rect(b.x, b.y, b.w, b.h, 10);
  fill(255);
  textSize(12);
  text(label, b.x + b.w / 2, b.y + b.h / 2);
}

// ================= HOME =================

function drawHome() {
  makeBtn("BEER", width / 2, 220, () => {
    screen = "beer_type";
  });

  makeBtn("WINE", width / 2, 350, () => {
    screen = "wine_type";
  });

  makeBtn("SPIRIT", width / 2, 480, () => {
    screen = "spirit_type";
  });
}

// ================= FLOW =================

function drawFlow() {
  backButton();

  if (screen === "beer_type") {
    makeBtn("PINT", width / 2, 220, () => selectBeer("PINT"));
    makeBtn("SCHOONER", width / 2, 330, () => selectBeer("SCHOONER"));
    makeBtn("BOTTLE", width / 2, 440, () => selectBeer("BOTTLE"));
  }

  if (screen === "beer_strength") {
    makeBtn("FULL STRENGTH", width / 2, 220, () => addBeer(1));
    makeBtn("MID STRENGTH", width / 2, 330, () => addBeer(0.8));
    makeBtn("LOW STRENGTH", width / 2, 440, () => addBeer(0.6));
  }

  if (screen === "wine_type") {
    makeBtn("RED", width / 2, 220, () => selectWine("RED"));
    makeBtn("WHITE", width / 2, 330, () => selectWine("WHITE"));
    makeBtn("SPARKLING", width / 2, 440, () => addWineSparkling());
  }

  if (screen === "wine_size") {
    let v = selection.wine === "RED" ? [1.6, 1.0, 8] : [1.4, 1.0, 7];

    makeBtn("LARGE", width / 2, 220, () => addWine(v[0]));
    makeBtn("REGULAR", width / 2, 330, () => addWine(v[1]));
    makeBtn("BOTTLE", width / 2, 440, () => addWine(v[2]));
  }

  if (screen === "spirit_type") {
    makeBtn("MIXER", width / 2, 220, () => selectSpirit("MIXER"));
    makeBtn("COCKTAIL", width / 2, 330, () => addSpirit(2));
    makeBtn("SHOT", width / 2, 440, () => selectSpirit("SHOT"));
  }

  if (screen === "spirit_sub") {
    makeBtn("LIQUEUR", width / 2, 220, () => addSpirit(0.5));
    makeBtn("LIQUOR", width / 2, 330, () => addSpirit(1));
  }
}

// ================= BUTTON SYSTEM =================

function makeBtn(label, x, y, action) {
  let b = { x: x - 120, y: y - 40, w: 240, h: 80, action };

  fill(40);
  rect(b.x, b.y, b.w, b.h, 14);

  fill(255);
  textSize(20);
  text(label, x, y);

  buttons[label] = b;
}

// ================= BACK =================

function backButton() {
  let b = { x: 10, y: 130, w: 80, h: 40 };
  buttons.back = b;

  fill(80);
  rect(b.x, b.y, b.w, b.h, 10);

  fill(255);
  textSize(12);
  text("Back", 50, 150);
}

// ================= LOGIC =================

function selectBeer(type) {
  selection.beer = type;
  screen = "beer_strength";
}

function addBeer(mult) {
  let base =
    selection.beer === "PINT" ? 1.6 :
    selection.beer === "SCHOONER" ? 1.1 :
    1.4;

  add(`${selection.beer}`, base * mult);
}

function selectWine(type) {
  selection.wine = type;
  screen = type === "SPARKLING" ? "home" : "wine_size";
}

function addWine(v) {
  add(`${selection.wine}`, v);
}

function addWineSparkling() {
  add("SPARKLING", 1.5);
}

function selectSpirit(type) {
  selection.spirit = type;
  screen = type === "COCKTAIL" ? "home" : "spirit_sub";
}

function addSpirit(v) {
  add(selection.spirit, v);
}

// ================= CORE =================

function add(name, value) {
  drinks.push({ name, value });
  total += value;
  save();
}

// ================= INPUT =================

function mousePressed() {
  handle(mouseX, mouseY);
  return false;
}

function touchStarted() {
  if (touches.length > 0) handle(touches[0].x, touches[0].y);
  return false;
}

function handle(x, y) {
  for (let k in buttons) {
    let b = buttons[k];

    if (
      x > b.x &&
      x < b.x + b.w &&
      y > b.y &&
      y < b.y + b.h
    ) {
      if (k === "undo") undo();
      else if (k === "reset") reset();
      else if (k === "back") screen = "home";
      else if (b.action) b.action();
    }
  }
}

// ================= ACTIONS =================

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
