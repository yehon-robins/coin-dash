// Drone artwork: a red quadcopter seen from above, drawn in code (no image files).
// makeDroneTexture(scene) builds two textures that differ only in rotor-blade angle and
// returns the key of the first. spinDrone(drone) swaps between them based on how far the
// drone has moved, so the rotors stop whenever physics is paused (P) or the round ends.
(function () {
  const SIZE = 40;              // texture is 40x40; the physics body is 26x26 in texture pixels (set in game.js)
  const KEYS = ['drone-quad-a', 'drone-quad-b'];
  const OUTLINE = 0x1a0509;     // dark outline keeps the drone readable on light/warm backgrounds
  const ROTOR_RIM = 0xffe3e8;   // pale rim keeps it readable on dark backgrounds

  function droneColor() {
    return (window.COIN_DASH && window.COIN_DASH.colors && window.COIN_DASH.colors.drone) || 0xff657a;
  }

  function draw(scene, key, bladeAngle) {
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const red = droneColor();
    const c = SIZE / 2;
    const rotors = [[8, 8], [32, 8], [8, 32], [32, 32]];

    // Arms: dark thick stroke under a red thinner stroke.
    rotors.forEach(([x, y]) => {
      g.lineStyle(6, OUTLINE, 1).lineBetween(c, c, x, y);
    });
    rotors.forEach(([x, y]) => {
      g.lineStyle(3, red, 1).lineBetween(c, c, x, y);
    });

    // Rotors: translucent disc, pale rim, two crossed blades, hub.
    rotors.forEach(([x, y]) => {
      g.fillStyle(OUTLINE, 0.55).fillCircle(x, y, 7.5);
      g.fillStyle(red, 0.35).fillCircle(x, y, 7);
      g.lineStyle(1.5, ROTOR_RIM, 0.9).strokeCircle(x, y, 7);
      g.lineStyle(2, ROTOR_RIM, 1);
      for (let k = 0; k < 2; k++) {
        const a = bladeAngle + k * Math.PI / 2;
        const dx = Math.cos(a) * 6, dy = Math.sin(a) * 6;
        g.lineBetween(x - dx, y - dy, x + dx, y + dy);
      }
      g.fillStyle(OUTLINE, 1).fillCircle(x, y, 1.8);
    });

    // Central body with outline, a darker stripe, and a small warning light.
    g.fillStyle(OUTLINE, 1).fillRoundedRect(c - 9, c - 9, 18, 18, 5);
    g.fillStyle(red, 1).fillRoundedRect(c - 7.5, c - 7.5, 15, 15, 4);
    g.fillStyle(0xb3203a, 1).fillRect(c - 7.5, c + 1, 15, 3);
    g.fillStyle(0xffffff, 1).fillCircle(c, c - 2, 2.6);
    g.fillStyle(0xffd23f, 1).fillCircle(c, c - 2, 1.4);

    g.generateTexture(key, SIZE, SIZE);
    g.destroy();
  }

  window.makeDroneTexture = function makeDroneTexture(scene) {
    draw(scene, KEYS[0], Math.PI / 4);
    draw(scene, KEYS[1], 0);
    return KEYS[0];
  };

  // Rotor "spin" + slight tilt toward travel direction. Driven only by the drone's position,
  // so it freezes automatically while physics is paused or after the round finishes.
  window.spinDrone = function spinDrone(drone) {
    const scene = drone.scene;
    const onUpdate = () => {
      if (!drone.active || !drone.body) return;
      const frame = Math.floor((drone.x + drone.y) / 5) % 2;
      const key = KEYS[frame === 0 ? 0 : 1];
      if (drone.texture.key !== key) drone.setTexture(key);
      drone.setRotation(Math.sign(drone.body.velocity.x) * 0.08);
    };
    scene.events.on('update', onUpdate);
    drone.once('destroy', () => scene.events.off('update', onUpdate));
  };
})();
