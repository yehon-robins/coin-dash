// Draws the player's Chinese (lóng) dragon in code and stores it as a reusable texture.
// The dragon faces right; game.js flips it horizontally when moving left.
// The texture is wider than the hitbox so the serpentine tail fits behind the head.
window.DRAGON_TEXTURE = { key: 'player-dragon', width: 48, height: 32 };
// 24x24 hitbox (texture pixels) over the head and front body when facing right.
// game.js mirrors the x offset when the dragon faces left so the tail never collides.
window.DRAGON_HITBOX = { x: 22, y: 4, size: 24 };

window.makeDragonTexture = function makeDragonTexture(scene) {
  const { key, width, height } = window.DRAGON_TEXTURE;
  if (scene.textures.exists(key)) return key; // textures survive scene restarts
  const C = {
    outline: 0x1a0d08,   // near-black brown edge reads on both navy and sunset backgrounds
    jade: 0x1f9e74,
    jadeDark: 0x0f6b4f,
    jadeLight: 0x6fdcae,
    gold: 0xf2b630,
    cream: 0xffe7a0,
    crimson: 0xb3243a,
    white: 0xffffff
  };
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const V = (x, y) => new Phaser.Math.Vector2(x, y);

  // S-shaped spine from the tail tip (t = 0) to the neck (t = 1); the body thickens towards the head.
  const spine = new Phaser.Curves.Spline([
    V(5, 9), V(10, 13), V(14, 19), V(20, 23), V(26, 21), V(30, 16), V(34, 13)
  ]);
  const radius = (t) => 1 + 4 * t;
  const samples = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const p = spine.getPoint(t);
    const tan = spine.getTangent(t);
    samples.push({ t, p, tan, n: V(tan.y, -tan.x), r: radius(t) }); // n points to the dragon's back
  }
  const at = (s, along, out) => V(s.p.x + s.tan.x * along + s.n.x * out, s.p.y + s.tan.y * along + s.n.y * out);

  // Shapes are drawn twice: first a thick dark silhouette, then the colour on top.
  let outlinePass = true;
  const shape = (color, name, ...args) => {
    if (outlinePass) {
      g.fillStyle(C.outline, 1)[`fill${name}`](...args);
      g.lineStyle(3, C.outline, 1)[`stroke${name}`](...args);
    } else {
      g.fillStyle(color, 1)[`fill${name}`](...args);
    }
  };
  const poly = (color, pts) => {
    const v = pts.map(([x, y]) => V(x, y));
    if (outlinePass) {
      g.fillStyle(C.outline, 1).fillPoints(v, true);
      g.lineStyle(3, C.outline, 1).strokePoints(v, true, true);
    } else {
      g.fillStyle(color, 1).fillPoints(v, true);
    }
  };
  const stroke = (color, lineWidth, pts) => {
    const v = new Phaser.Curves.Spline(pts.map(([x, y]) => V(x, y))).getPoints(10);
    g.lineStyle(outlinePass ? lineWidth + 2 : lineWidth, outlinePass ? C.outline : color, 1);
    g.strokePoints(v);
  };

  const drawParts = () => {
    // Small legs with a bent foot (claws are added afterwards).
    poly(C.jadeDark, [[15, 21], [19, 21], [19, 26], [21, 27], [16, 28], [15, 25]]); // back leg
    poly(C.jadeDark, [[27, 19], [31, 19], [31, 25], [34, 26], [29, 27], [28, 24]]); // front leg
    // Flame-like tuft at the tail tip.
    poly(C.crimson, [[7, 7], [2, 2], [4, 8], [1, 10], [5, 11], [3, 15], [8, 11]]);
    // Dorsal ridge spikes along the back, swept towards the tail.
    for (let t = 0.15; t <= 0.92; t += 0.075) {
      const s = samples[Math.round(t * 60)];
      const h = 1.4 + s.r * 0.5;
      const a = at(s, 1.6, s.r - 0.6);
      const b = at(s, -1.6, s.r - 0.6);
      const tip = at(s, -1.4, s.r + h);
      shape(C.gold, 'Triangle', a.x, a.y, b.x, b.y, tip.x, tip.y);
    }
    // Long serpentine body.
    samples.forEach((s) => shape(C.jade, 'Circle', s.p.x, s.p.y, s.r));
    // Crimson mane behind the head.
    poly(C.crimson, [[34, 7], [29, 4], [31, 9], [27, 9], [31, 12], [28, 15], [34, 15]]);
    // Antler-like horns (far one first).
    stroke(C.gold, 1.5, [[38, 7], [38.5, 4.5], [40.5, 2.5]]);
    stroke(C.gold, 2, [[36, 7], [34, 4.5], [31, 2.5]]);
    stroke(C.gold, 1.5, [[34.3, 4.8], [35.5, 2.5]]);
    // Head: skull, long snout and lower jaw.
    shape(C.jade, 'Circle', 37, 11, 5);
    shape(C.jade, 'Ellipse', 41, 13, 10, 6);
    shape(C.jadeDark, 'Ellipse', 40, 16.5, 8, 3);
    // Flowing whiskers / barbels.
    stroke(C.cream, 1, [[45, 14.5], [44, 18.5], [40, 21], [36, 20.5]]);
    stroke(C.cream, 1, [[44, 11], [46, 7.5], [44.5, 4.5], [42.5, 5]]);
  };
  drawParts();
  outlinePass = false;
  drawParts();

  // Details drawn on top of the coloured parts.
  samples.forEach((s) => {
    if (s.t < 0.1) return;
    const belly = at(s, 0, -s.r * 0.5);
    g.fillStyle(C.cream, 1).fillCircle(belly.x, belly.y, s.r * 0.42); // pale gold belly scales
    const shine = at(s, 0, s.r * 0.3);
    g.fillStyle(C.jadeLight, 1).fillCircle(shine.x, shine.y, Math.max(0.6, s.r * 0.25)); // back highlight
  });
  for (let t = 0.2; t <= 0.9; t += 0.1) { // dark scale flecks between highlight and belly
    const s = samples[Math.round(t * 60)];
    const fleck = at(s, 0, -s.r * 0.05);
    g.fillStyle(C.jadeDark, 1).fillCircle(fleck.x, fleck.y, 0.7);
  }
  g.fillStyle(C.gold, 1).fillPoints([V(5, 9), V(3, 5), V(5, 8.5), V(2.5, 10), V(6, 10)], true); // flame core
  g.fillStyle(C.gold, 1); // claws
  [[16, 28], [18, 28], [20, 27.5], [30, 27], [32, 27], [34, 26.5]].forEach(([x, y]) => g.fillRect(x, y, 1, 1.5));
  g.fillStyle(C.gold, 1).fillTriangle(36, 7.5, 41.5, 8, 36.5, 9);   // golden brow
  g.fillStyle(C.cream, 1).fillCircle(39, 10, 1.6);                  // eye
  g.fillStyle(C.outline, 1).fillRect(39, 9, 1, 2);                  // slit pupil
  g.fillStyle(C.outline, 1).fillRect(45, 11, 1, 1);                 // nostril
  g.fillStyle(C.outline, 1).fillRect(37, 15, 8, 0.8);               // mouth line
  g.fillStyle(C.white, 1).fillTriangle(43, 15.5, 44.2, 15.5, 43.6, 17); // small fang

  g.generateTexture(key, width, height);
  g.destroy();
  return key;
};
