// Draws the player's small dragon in code and stores it as a reusable texture.
// The dragon faces right; game.js flips it horizontally when moving left.
window.makeDragonTexture = function makeDragonTexture(scene) {
  const key = 'player-dragon';
  if (scene.textures.exists(key)) return key; // textures survive scene restarts
  const size = 32;
  const outline = 0x0b3d33; // dark green edge keeps the dragon readable on bright sunsets
  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  // Each part draws the same shape; the first pass is a thick dark silhouette, the second the colour.
  const parts = [
    { color: 0x2fbf9a, draw: (f) => f('Triangle', 1, 10, 11, 17, 10, 22) },   // tail
    { color: 0x1f8f74, draw: (f) => f('Triangle', 10, 15, 21, 15, 13, 2) },   // wing
    { color: 0x71e8ce, draw: (f) => f('Ellipse', 15, 20, 18, 12) },           // body
    { color: 0x71e8ce, draw: (f) => f('Circle', 23, 14, 6) },                 // head
    { color: 0x71e8ce, draw: (f) => f('Ellipse', 27, 16, 7, 6) },             // snout
    { color: 0xd9f99d, draw: (f) => f('Triangle', 19, 9, 22, 8, 18, 3) },     // horn
    { color: 0x2fbf9a, draw: (f) => f('Rect', 10, 24, 4, 5) },                // back leg
    { color: 0x2fbf9a, draw: (f) => f('Rect', 17, 24, 4, 5) }                 // front leg
  ];
  const shape = (method) => (name, ...args) => g[method + name](...args);

  g.lineStyle(3, outline, 1);
  g.fillStyle(outline, 1);
  parts.forEach((p) => { p.draw(shape('fill')); p.draw(shape('stroke')); });
  parts.forEach((p) => { g.fillStyle(p.color, 1); p.draw(shape('fill')); });

  g.fillStyle(0xd9f99d, 1).fillEllipse(15, 22, 11, 5);       // pale belly
  g.fillStyle(0xffffff, 1).fillCircle(24, 12, 2);            // eye
  g.fillStyle(outline, 1).fillCircle(25, 12, 1);             // pupil
  g.fillStyle(outline, 1).fillRect(29, 15, 1, 1);            // nostril

  g.generateTexture(key, size, size);
  g.destroy();
  return key;
};
