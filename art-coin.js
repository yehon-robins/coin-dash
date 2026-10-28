// Gold coin artwork drawn in code: no image files, nothing fetched from the network.
// window.makeCoinTexture(scene) draws the coin once into a texture and returns its key.
(function () {
  const KEY = 'coin-gold';
  const SIZE = 30;          // texture is 30x30; the coin itself has radius 13
  const RADIUS = 13;

  function starPoints(cx, cy, outer, inner) {
    const points = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = -Math.PI / 2 + i * Math.PI / 5;
      points.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    }
    return points;
  }

  window.COIN_ART = { key: KEY, size: SIZE, radius: RADIUS };

  window.makeCoinTexture = function makeCoinTexture(scene) {
    if (scene.textures.exists(KEY)) return KEY;
    const c = SIZE / 2;
    const g = scene.make.graphics({ x: 0, y: 0, add: false }, false);
    // Dark outline keeps the coin readable on both dark navy and warm orange backgrounds.
    g.fillStyle(0x5c3a03, 1);
    g.fillCircle(c, c, RADIUS);
    // Darker gold rim.
    g.fillStyle(0xc98a0b, 1);
    g.fillCircle(c, c, RADIUS - 1.5);
    // Rim bevel: lighter top-left edge.
    g.lineStyle(1, 0xffe08a, 0.7);
    g.beginPath();
    g.arc(c, c, RADIUS - 2, Math.PI * 0.95, Math.PI * 1.6, false);
    g.strokePath();
    // Gold face.
    g.fillStyle(0xffc531, 1);
    g.fillCircle(c, c, RADIUS - 3.5);
    // Inner ring.
    g.lineStyle(1, 0xd08f10, 1);
    g.strokeCircle(c, c, RADIUS - 5);
    // Embossed star: dark shadow down-right, light edge up-left, gold face on top.
    g.fillStyle(0xa86d06, 1);
    g.fillPoints(starPoints(c + 0.8, c + 0.8, 5.5, 2.4), true);
    g.fillStyle(0xfff0b8, 1);
    g.fillPoints(starPoints(c - 0.5, c - 0.5, 5.5, 2.4), true);
    g.fillStyle(0xffd65a, 1);
    g.fillPoints(starPoints(c, c, 5.5, 2.4), true);
    // Small white shine highlight, upper left.
    g.fillStyle(0xffffff, 0.85);
    g.fillEllipse(c - 5, c - 6.5, 5, 2.5);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(c - 7.5, c - 3.5, 0.9);
    g.generateTexture(KEY, SIZE, SIZE);
    g.destroy();
    return KEY;
  };
})();
