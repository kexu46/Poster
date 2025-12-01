// Snow flakes
let flakes = [];
let mic;
let started = false;

// Akakiy letters
let akakiyLetters = [];
let akakiyActive = false;
let akakiyTargetY;

// The Overcoat
let overcoatTexts = [];

function setup() {
  let canvas= createCanvas((windowHeight * 9) / 16, windowHeight);
  canvas.parent('p5');
  userStartAudio().then(() => {
    mic = new p5.AudioIn();
    mic.start();
    started = true;
  });
}

function windowResized() {
  let w = (windowHeight * 9) / 16;
  resizeCanvas(w, windowHeight);
}


function draw() {
  background(0, 90); // snow trails

  let vol = 0;
  if (started && mic) {
    vol = mic.getLevel();
  }

  let c = lerpColor(color(255), color(random(0,255),random(0,255),random(0,255)), constrain(vol * 5, 0, 1));
  let wind = map(vol, 0, 0.2, 0, 4);

  // Spawn Akakiy
  function spawnAkakiy() {
    akakiyLetters = [];
    akakiyActive = true;
    akakiyTargetY = random(height * 0.3, height * 0.7);

    let str = "WHERE IS MY COAT";
    let spacing = 10;
    textSize(13)
    let akakiyW = textWidth(str);
    let startX = random(0, width - akakiyW*2);

    for (let i = 0; i < str.length; i++) {
      akakiyLetters.push({
        char: str[i],
        x: random(width),
        y: random(height),
        targetX: startX + i * spacing,
        targetY: akakiyTargetY,
        alpha: 0,
      });
    }
  }

  // Trigger Akakiy
  if (wind > 2 && !akakiyActive) {
    spawnAkakiy();
  }

  // Update Akakiy
  if (akakiyLetters.length > 0) {
    for (let l of akakiyLetters) {
      l.x += (l.targetX - l.x) * 0.06;
      l.y += (l.targetY - l.y) * 0.06;

      // Fade
      if (wind > 2) {
        l.alpha = min(l.alpha + 10, 255); // fade in
      } else {
        l.alpha = max(l.alpha - 3, 0); // fade out
      }

      fill(255, 255, 255, l.alpha);
      textSize(l.size);
      textStyle(BOLD);
      text(l.char, l.x, l.y);
    }

    // Deactivate
    if (akakiyLetters.every((l) => l.alpha === 0)) {
      akakiyLetters = [];
      akakiyActive = false;
    }
  }


  // Spawn Overcoat
  function spawnOvercoat() {
    overcoatTexts.push({
      text: "",
      x: random(0, width - 200),
      y: -50,
      size: random(22, 28),
      speed: random(0.5, 1.5),
      alpha: 0,
      angle: random(-0.5, 0.5),
      rotateSpeed: random(-0.003, 0.003),
    });
  }

  // Spawn new
  if (frameCount % 300 === 0) {
    spawnOvercoat();
  }

  // Update Overcoat
  for (let i = overcoatTexts.length - 1; i >= 0; i--) {
    let t = overcoatTexts[i];

    t.y += t.speed;
    t.angle += t.rotateSpeed;

    // Fade in
    t.alpha = min(t.alpha + 5, 255);

    let letters = t.text.split("");
    let spacing = t.size * 0.7;
    let totalWidth = letters.length * spacing;

    push();
    translate(t.x, t.y);
    rotate(t.angle);

    // fill(255, 255, 255, t.alpha);
    textStyle(BOLD);

    fill(165, 245, 245, t.alpha);
    textSize(t.size * 1.2);
let overcoatW = textWidth("THE OVERCOAT");
    let waveX1 = sin(frameCount * 0.1) * 2;
    let waveY1 = cos(frameCount * 0.1) * 2;
    text("THE OVERCOAT", waveX1, waveY1);

    fill(0, 255, 255, t.alpha);
    textSize(t.size * 0.75);
    let waveX2 = sin(frameCount * 0.1 + 0.5) * 2;
    let waveY2 = cos(frameCount * 0.1 + 0.4) * 1.2;
    text("11.07 19:30 @BLACKBOX 2", waveX2, t.size * 1.2 + waveY2);

    pop();

    // Deactivate
    if (t.y > height + 50) {
      overcoatTexts.splice(i, 1);
    }
  }

  // Snow 
  function newFlake() {
    let depth = random();

    let letters = [];
    for (let c of ["s", "n", "o", "w"]) {
      letters.push({
        char: c,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        angle: random(-0.05, 0.05),
      });
    }

    return {
      x: random(width),
      y: -20,
      size: lerp(12, 22, depth),
      speed: lerp(0.5, 2, depth),
      blur: lerp(5, 0, depth),
      swing: random(0.2, 0.8),
      offset: random(1000),
      angle: random(-0.02, 0.02),
      rotateSpeed: random(-0.003, 0.003),
      windFactor: random(0.5, 1.2),
      split: false,
      letters: letters,
    };
  }

  // Spawn new
  if (frameCount % 5 === 0) {
    flakes.push(newFlake());
  }

  // Update snow
  for (let i = flakes.length - 1; i >= 0; i--) {
    let f = flakes[i];

    f.y += f.speed;

    if (!f.split && wind > 2) {
      f.split = true;
      f.letters.forEach((l) => {
        l.x = f.x;
        l.y = f.y;
        l.vx = random(-wind, wind);
        l.vy = random(0.5, 1.5);
      });
    }

    //Drift and blur
    if (!f.split) {
      f.x += sin(frameCount * 0.02 + f.offset) * f.swing + wind * f.windFactor;
      f.angle += f.rotateSpeed;

      push();
      translate(f.x, f.y);
      rotate(f.angle);
      drawingContext.filter = `blur(${f.blur}px)`;
      fill(c);
      textSize(f.size);
      text("snow", 0, 0);
      // drawingContext.filter = "none";
      pop();
    } else {
      f.letters.forEach((l) => {
        l.x += l.vx;
        l.y += l.vy;

        push();
        translate(l.x, l.y);
        rotate(l.angle);
        fill(c);
        textSize(f.size / 1.2);
        text(l.char, 0, 0);
        pop();
      });
    }

    if (f.y > height + 50) flakes.splice(i, 1);
  }
}
