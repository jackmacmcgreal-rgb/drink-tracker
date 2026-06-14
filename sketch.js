let drinks = [];
let total = 0;

let screen = "home";
let step = null;

let selection = {};
let buttons = [];

let manualHours = 0;
let manualMode = false;

let lastDecayTime;
const ALCOHOL_DECAY_RATE_PER_HOUR = 1.2; 
// tuned for your system scale (matches your drink units ≈ BAC proxy)

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);

  let c = document.querySelector("canvas");
  if (c) {
    c.style.position = "fixed";
    c.style.touchAction = "none";
    c.style.userSelect = "none";
    c.style.webkitTouchCallout = "none";
  }

  drinks = JSON.parse(localStorage.getItem("drinks") || "[]");
  total = Number(localStorage.getItem("total") || 0);
  
 lastDecayTime = Number(localStorage.getItem("lastDecayTime"));

if (!lastDecayTime || isNaN(lastDecayTime)) {
  lastDecayTime = millis();
}
}

// ================= DRAW =================

function draw() {
  background(15);

  handleDecay(); // 👈 ADD THIS

  buttons = [];

  drawTop();

  if (screen === "home") drawHome();
  else drawFlow();

  drawBottom();
}

// ================= TOP =================

function drawTop() {
  fill(20);
  rect(0, 0, width, 120);

  fill(255);
  textSize(26);
  text("Drink Tracker", width / 2, 25);

  textSize(48);
  text(nf(total, 1, 1), width / 2, 75);

  addBtn("undo", 10, 40, 80, 40, "Undo", 80, undo);
  addBtn("reset", width - 90, 40, 80, 40, "Reset", [200, 60, 60], reset);
}

// ================= HOME =================

function drawHome() {
  addBtn("beer", width / 2 - 120, 150, 240, 80, "BEER", 40, () => {
    screen = "beer";
    step = "beer_type";
  });

  addBtn("wine", width / 2 - 120, 250, 240, 80, "WINE", 40, () => {
    screen = "wine";
    step = "wine_type";
  });

  addBtn("spirit", width / 2 - 120, 350, 240, 80, "SPIRIT", 40, () => {
    screen = "spirit";
    step = "spirit_type";
  });
  
  addBtn("manual", width / 2 - 120, 450, 240, 80, "MANUAL TIME", 40, () => {
  screen = "manual";
  manualMode = true;
});
}

// ================= FLOW =================

function drawFlow() {
  addBtn("back", 10, 130, 80, 40, "Back", 80, () => {
    screen = "home";
    step = null;
    selection = {};

  });

  // ================= BEER =================

  if (screen === "beer" && step === "beer_type") {
    option("PINT (425ml)", 150, () => {
      selection.beer = "PINT (425ml)";
      step = "beer_strength";
    });

    option("SCHOONER (285ml)", 250, () => {
      selection.beer = "SCHOONER (285ml)";
      step = "beer_strength";
    });

    option("BOTTLE (375ml)", 350, () => {
      selection.beer = "BOTTLE (375ml)";
      step = "beer_strength";
    });
  }

  if (screen === "beer" && step === "beer_strength") {
    option("FULL STRENGTH (4.8%)", 150, () => addBeer(1));
    option("MID STRENGTH (3.5%)", 250, () => addBeer(0.8));
    option("LOW STRENGTH (2.7%)", 350, () => addBeer(0.6));
  }

  // ================= WINE =================

  if (screen === "wine" && step === "wine_type") {
    option("RED (13.5%)", 150, () => {
      selection.wine = "RED (13.5%)";
      step = "wine_size";
    });

    option("WHITE (11.5%)", 250, () => {
      selection.wine = "WHITE (11.5%)";
      step = "wine_size";
    });

    option("SPARKLING (12%)", 350, () => {
      selection.sparkling = "SPARKLING (12%)";
      step = "sparkling_size";
    });
  }

  if (screen === "wine" && step === "sparkling_size"){
    option("GLASS (150ml)", 150, () => add(selection.sparkling,1.5))
    option("BOTTLE (750ml)", 250, () => add(selection.sparkling,7.5))
  }
  
  if (screen === "wine" && step === "wine_size") {
    let base = selection.wine === "RED (13.5%)" ? 1.6 : 1.4;

    option("RESTAURANT (150ml)", 150, () => add(selection.wine, base));
    option("BAR (100ml)", 250, () => add(selection.wine, 1.0));
    option("BOTTLE (750ml)", 350, () =>
      add(selection.wine, selection.wine === "RED" ? 8 : 7.5)
    );
  }

  // ================= SPIRIT =================

  if (screen === "spirit" && step === "spirit_type") {
    option("MIXER", 150, () => add("MIXER", 0.5));

    option("COCKTAIL", 250, () => add("COCKTAIL", 2));

    option("SHOT", 350, () => {
      step = "spirit_shot";
    });
  }

  if (screen === "spirit" && step === "spirit_shot") {
    option("LIQUEUR", 150, () => add("SHOT LIQUEUR", 0.5));
    option("LIQUOR", 250, () => add("SHOT LIQUOR", 1));
  }
  
  if (screen === "manual") {
  drawManual();
}
}

// =================  MANUAL TIME =================

function drawManual() {
 
  addBtn("back", 10, 130, 80, 40, "Back", 80, () => {
    screen = "home";
    manualMode = false;
  });

  // title
  fill(255);
  textSize(22);
  text("Manual Time Adjustment", width / 2, 200);

  textSize(14);
  text("Simulate hours passed for alcohol decay", width / 2, 240);

  // minus
  addBtn("minus", width/2 - 140, 300, 80, 60, "-", 80, () => {
    manualHours = max(0, manualHours - 1);
  });

  // display
  fill(255);
  textSize(32);
  text(manualHours + " hrs", width / 2, 330);

  // plus
  addBtn("plus", width/2 + 60, 300, 80, 60, "+", 80, () => {
    manualHours += 1;
  });

  // apply
  addBtn("apply", width/2 - 120, 420, 240, 70, "APPLY", 40, applyManual);
}

function applyManual() {
  if (manualHours <= 0) return;

  let decayRate = 1.2; // same as BAC system

  let reduction = decayRate * manualHours;

  total = max(0, total - reduction);

  lastDecayTime += manualHours * 3600000;

  manualHours = 0;

  saveData();
  screen = "home";
  manualMode = false;
}

// ================= BUTTON =================

function option(label, y, action) {
  addBtn(label, width / 2 - 120, y, 240, 80, label, 30, action);
}

function addBtn(id, x, y, w, h, label, col, action) {
  fill(col);
  rect(x, y, w, h, 14);

  fill(255);
  textSize(18);
  text(label, x + w / 2, y + h / 2);

  buttons.push({ x, y, w, h, action });
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
  for (let b of buttons) {
    if (
      x > b.x &&
      x < b.x + b.w &&
      y > b.y &&
      y < b.y + b.h
    ) {
      b.action();
      return;
    }
  }
}

// ================= CORE =================

function add(name, value) {
  drinks.push({ name, value });
  total += value;
  saveData();
}

function addBeer(mult) {
  let base =
    selection.beer === "PINT (425ml)" ? 1.6 :
    selection.beer === "SCHOONER (285ml)" ? 1.1 :
    1.4;

  add(selection.beer, base * mult);
}

function undo() {
  if (drinks.length > 0) {
    let last = drinks.pop();
    total -= last.value;
    total = max(0, total);
    saveData();
  }
}

function reset() {
  drinks = [];
  total = 0;
  saveData();
}

function saveData() {
  localStorage.setItem("drinks", JSON.stringify(drinks));
  localStorage.setItem("total", total);
  localStorage.setItem("lastDecayTime", lastDecayTime);
}

// ================= SOBER UP =================
function handleDecay() {
  let now = millis();

  let hoursPassed = (now - lastDecayTime) / 3600000;

  if (hoursPassed <= 0) return;

  // Continuous decay (smooth curve over time)
  let decayAmount = ALCOHOL_DECAY_RATE_PER_HOUR * hoursPassed;

  total = max(0, total - decayAmount);

  // update timestamp precisely (no stacking error)
  lastDecayTime = now;

  saveData();
}

// ================= BOTTOM =================

function drawBottom() {
  fill(20);
  rect(0, height - 80, width, 80);

  fill(200);
  textSize(12);
  text("A Jack McGreal Project", width / 2, height - 40);
}


