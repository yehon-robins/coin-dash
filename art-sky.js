/* global Phaser */
// Sunset sky backdrop for Coin Dash, drawn entirely in code (no image files).
// The sky is painted once into a texture and shown as a plain image at the
// back of the scene, so it has no physics body and costs nothing per frame.
(function () {
  const KEY = 'sunset-sky';

  // Gradient stops from the top of the screen (0) to the bottom (1).
  // Kept fairly dark and muted so the HUD, coin, player and drones stay readable.
  const STOPS = [
    [0.00, 0x160d2e], // deep indigo (dark band behind the HUD)
    [0.30, 0x2f1854], // purple
    [0.58, 0x5e2668], // plum / magenta
    [0.80, 0x96395f], // dusky pink
    [0.95, 0xc9573f]  // orange near the horizon
  ];

  function lerpColor(a, b, t) {
    const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
    const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);
    return (r << 16) | (g << 8) | bl;
  }

  function skyColorAt(p) {
    if (p <= STOPS[0][0]) return STOPS[0][1];
    for (let i = 1; i < STOPS.length; i++) {
      if (p <= STOPS[i][0]) {
        const [p0, c0] = STOPS[i - 1];
        const [p1, c1] = STOPS[i];
        return lerpColor(c0, c1, (p - p0) / (p1 - p0));
      }
    }
    return STOPS[STOPS.length - 1][1];
  }

  function hillPoints(width, height, baseY, amp, freq, phase) {
    const pts = [{ x: 0, y: height }];
    for (let x = 0; x <= width; x += 10) {
      const y = baseY - amp * (0.6 * Math.sin(x * freq + phase) + 0.4 * Math.sin(x * freq * 2.3 + phase * 1.7));
      pts.push({ x, y });
    }
    pts.push({ x: width, y: height });
    return pts;
  }

  function paint(scene, width, height) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);

    // 1. Vertical gradient as thin horizontal bands (works in WebGL and Canvas).
    const band = 4;
    for (let y = 0; y < height; y += band) {
      g.fillStyle(skyColorAt(y / height), 1);
      g.fillRect(0, y, width, band);
    }

    // 2. Low setting sun with a soft glow, partly hidden by the hills below.
    const sunX = width * 0.7, sunY = height * 0.88, sunR = height * 0.13;
    g.fillStyle(0xf28a5a, 0.08); g.fillCircle(sunX, sunY, sunR * 2.4);
    g.fillStyle(0xf28a5a, 0.12); g.fillCircle(sunX, sunY, sunR * 1.7);
    g.fillStyle(0xf59a62, 0.20); g.fillCircle(sunX, sunY, sunR * 1.25);
    g.fillStyle(0xf7a56a, 0.85); g.fillCircle(sunX, sunY, sunR);

    // 3. A few soft, faint clouds.
    const clouds = [
      [width * 0.18, height * 0.30, 1.0],
      [width * 0.55, height * 0.20, 0.8],
      [width * 0.82, height * 0.52, 0.9],
      [width * 0.32, height * 0.62, 0.7]
    ];
    for (const [cx, cy, s] of clouds) {
      g.fillStyle(0xe7a0bf, 0.10);
      g.fillEllipse(cx, cy, 170 * s, 26 * s);
      g.fillEllipse(cx - 40 * s, cy - 8 * s, 90 * s, 22 * s);
      g.fillEllipse(cx + 35 * s, cy - 6 * s, 100 * s, 20 * s);
    }

    // 4. Two layers of dark silhouetted hills along the bottom edge.
    g.fillStyle(0x3a1a45, 1);
    g.fillPoints(hillPoints(width, height, height * 0.90, 16, 0.009, 0.8), true);
    g.fillStyle(0x200f2c, 1);
    g.fillPoints(hillPoints(width, height, height * 0.95, 12, 0.013, 2.4), true);

    g.generateTexture(KEY, width, height);
    g.destroy();
  }

  // Adds the sunset backdrop to `scene`. Call it before creating other game
  // objects; it is also placed at a very low depth so it always renders behind.
  // It is a plain image with no physics body. The texture is painted once and
  // reused when the scene restarts.
  window.drawSunsetSky = function drawSunsetSky(scene, width, height) {
    const w = width || scene.scale.width;
    const h = height || scene.scale.height;
    if (!scene.textures.exists(KEY)) paint(scene, w, h);
    return scene.add.image(0, 0, KEY).setOrigin(0, 0).setDepth(-1000);
  };
})();
