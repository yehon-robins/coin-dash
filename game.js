/* global Phaser, COIN_DASH */
class CoinDash extends Phaser.Scene {
  constructor() { super('CoinDash'); }

  create() {
    const c = COIN_DASH;
    this.score = 0;
    this.finished = false;
    this.deadline = this.time.now + c.roundSeconds * 1000;
    this.physics.world.setBounds(0, 44, c.width, c.height - 44);
    this.add.grid(c.width / 2, c.height / 2, c.width, c.height, 40, 40,
      c.colors.background, 1, 0x24334b, 0.45);
    this.hud = this.add.text(18, 12, '', { font: '18px monospace', color: '#ffffff' });
    this.player = this.add.rectangle(c.width / 2, c.height / 2, 24, 24, c.colors.player);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.makeCoinTexture();
    this.coin = this.add.image(100, 100, 'coin');
    this.physics.add.existing(this.coin);
    this.coin.body.setCircle(9);
    this.coin.body.setCollideWorldBounds(true).setBounce(1, 1);
    this.coinSpeed = c.coinBaseSpeed;
    this.lastCoinPickup = this.time.now;
    this.idleSlowdowns = 0;
    this.placeCoin();
    // placeCoin() -> body.reset() just zeroed the velocity, so setCoinSpeed()
    // sees a stationary body and picks a fresh random direction for us.
    this.setCoinSpeed(this.coinSpeed);
    const bombGeom = this.makeBombTexture();
    this.bomb = this.add.image(700, 400, 'bomb').setOrigin(0.5, bombGeom.originY);
    this.physics.add.existing(this.bomb);
    this.bomb.body.setCircle(bombGeom.radius, bombGeom.offsetX, bombGeom.offsetY);
    this.placeBomb();
    this.drones = this.physics.add.group();
    for (let i = 0; i < c.droneCount; i++) {
      const drone = this.add.rectangle(90 + i * 270, 100, 26, 26, c.colors.drone);
      this.drones.add(drone);
      drone.body.setCollideWorldBounds(true).setBounce(1, 1);
      const angle = (35 + i * 105) * Math.PI / 180;
      drone.body.setVelocity(Math.cos(angle) * c.droneSpeed, Math.sin(angle) * c.droneSpeed);
    }
    this.physics.add.overlap(this.player, this.coin, () => {
      if (this.finished) return;
      this.score++;
      this.lastCoinPickup = this.time.now;
      this.idleSlowdowns = 0;
      this.setCoinSpeed(this.coinSpeed + c.coinSpeedIncrement);
      this.placeCoin();
      // Fresh random heading at the (now faster) speed, rather than
      // continuing on the pre-teleport direction.
      this.setCoinSpeed(this.coinSpeed);
    });
    this.physics.add.overlap(this.player, this.bomb, () => {
      if (this.finished) return;
      this.explodeAt(this.bomb.x, this.bomb.y);
      this.score = Math.max(0, this.score - 2);
      this.placeBomb();
    });
    this.physics.add.overlap(this.player, this.drones, () => this.finish('A drone caught you!'));
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,R');
    this.input.keyboard.on('keydown-R', () => this.scene.restart());
  }

  // Bakes a small radial-gradient texture (gold edge to pale highlight center)
  // so the coin reads as shiny instead of a flat fill, drawn entirely in-engine.
  makeCoinTexture() {
    const c = COIN_DASH;
    const radius = 9;
    const rings = [
      { r: radius, color: c.colors.coin },
      { r: radius * 0.78, color: 0xffdc85 },
      { r: radius * 0.56, color: 0xffe8a5 },
      { r: radius * 0.33, color: c.colors.coinHighlight }
    ];
    const g = this.add.graphics();
    rings.forEach(({ r, color }) => {
      g.fillStyle(color, 1);
      g.fillCircle(radius, radius, r);
    });
    g.generateTexture('coin', radius * 2, radius * 2);
    g.destroy();
  }

  // Recomputes the coin's velocity from its current direction of travel at a
  // new speed (clamped to the configured min/max), so changing speed never
  // picks an arbitrary new heading. Right after body.reset() the body is
  // stationary (velocity 0,0), in which case this picks a fresh random
  // heading instead.
  setCoinSpeed(newSpeed) {
    const c = COIN_DASH;
    this.coinSpeed = Phaser.Math.Clamp(newSpeed, c.coinMinSpeed, c.coinMaxSpeed);
    const v = this.coin.body.velocity;
    const angle = (v.x === 0 && v.y === 0) ? Phaser.Math.Angle.Random() : Math.atan2(v.y, v.x);
    this.coin.body.setVelocity(Math.cos(angle) * this.coinSpeed, Math.sin(angle) * this.coinSpeed);
  }

  // Bakes a cartoon-bomb texture (round body + fuse + spark highlight) so the
  // bomb reads as an actual bomb instead of a flat circle, drawn entirely
  // in-engine like the coin's gradient texture. Returns the geometry needed
  // to line up the circular physics body with the drawn body and to anchor
  // the image on the ball's center (matching the old Circle's x/y meaning).
  makeBombTexture() {
    const c = COIN_DASH;
    const radius = 15;
    const fuseWidth = 4;
    const fuseHeight = 8;
    const sparkRadius = 3;
    const topMargin = fuseHeight + sparkRadius * 2; // room above the body for fuse + spark
    const width = radius * 2;
    const height = topMargin + radius * 2;
    const cx = radius;
    const cy = topMargin + radius;

    const g = this.add.graphics();
    // Fuse: a short dark wick sticking out of the top of the body.
    g.fillStyle(c.colors.bombFuse, 1);
    g.fillRect(cx - fuseWidth / 2, topMargin - fuseHeight, fuseWidth, fuseHeight);
    // Body: bright, alarming red-orange so it reads clearly against the navy background.
    g.fillStyle(c.colors.bomb, 1);
    g.fillCircle(cx, cy, radius);
    // Soft glossy highlight for a bit of shading on the body.
    g.fillStyle(0xffffff, 0.16);
    g.fillCircle(cx - radius * 0.35, cy - radius * 0.35, radius * 0.38);
    // Spark at the fuse tip: a warm glow with a bright white core.
    g.fillStyle(c.colors.bombFuseSpark, 1);
    g.fillCircle(cx, topMargin - fuseHeight, sparkRadius);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(cx, topMargin - fuseHeight, sparkRadius * 0.45);
    g.generateTexture('bomb', width, height);
    g.destroy();

    return { radius, offsetX: cx - radius, offsetY: cy - radius, originY: cy / height };
  }

  placeCoin() {
    const c = COIN_DASH;
    // Avoid spawning the next coin directly underneath the player.
    let x, y;
    do {
      x = Phaser.Math.Between(25, c.width - 25);
      y = Phaser.Math.Between(70, c.height - 25);
    } while (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 60);
    this.coin.setPosition(x, y);
    this.coin.body.reset(x, y);
  }

  placeBomb() {
    const c = COIN_DASH;
    // Avoid spawning the bomb on the player or right on top of the coin.
    // The fuse/spark stick up above the body's center, so keep extra
    // headroom (78 instead of 70) to keep the whole sprite on-screen.
    let x, y;
    do {
      x = Phaser.Math.Between(25, c.width - 25);
      y = Phaser.Math.Between(78, c.height - 25);
    } while (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 60
      || Phaser.Math.Distance.Between(x, y, this.coin.x, this.coin.y) < 40);
    this.bomb.setPosition(x, y);
    this.bomb.body.reset(x, y);
  }

  // A quick, self-cleaning burst of flat-color circles (scaled up and
  // faded out via tween) so touching a bomb reads as a small explosion,
  // without needing any image/particle assets.
  explodeAt(x, y) {
    const c = COIN_DASH;
    const outer = this.add.circle(x, y, 14, c.colors.bomb, 0.85).setScale(0.2);
    const inner = this.add.circle(x, y, 7, c.colors.bombFuseSpark, 0.95).setScale(0.2);
    this.tweens.add({
      targets: [outer, inner],
      scale: 2.2,
      alpha: 0,
      duration: 260,
      ease: 'Cubic.easeOut',
      onComplete: () => { outer.destroy(); inner.destroy(); }
    });
  }

  update() {
    if (this.finished) return;
    const dx = Number(this.cursors.right.isDown || this.keys.D.isDown)
      - Number(this.cursors.left.isDown || this.keys.A.isDown);
    const dy = Number(this.cursors.down.isDown || this.keys.S.isDown)
      - Number(this.cursors.up.isDown || this.keys.W.isDown);
    const direction = new Phaser.Math.Vector2(dx, dy).normalize().scale(COIN_DASH.playerSpeed);
    this.player.body.setVelocity(direction.x, direction.y);
    // Every full 10s window without a pickup, ease the coin's speed down a
    // notch (toward coinMinSpeed) so an idle player gets a breather. Gated by
    // idleSlowdowns so this fires once per window, not every frame.
    const idleMs = this.time.now - this.lastCoinPickup;
    const dueSlowdowns = Math.floor(idleMs / (COIN_DASH.coinIdleSeconds * 1000));
    if (dueSlowdowns > this.idleSlowdowns) {
      this.idleSlowdowns = dueSlowdowns;
      this.setCoinSpeed(this.coinSpeed * COIN_DASH.coinIdleDecay);
    }
    const seconds = Math.max(0, Math.ceil((this.deadline - this.time.now) / 1000));
    this.hud.setText(`Coins: ${this.score}                       Time: ${seconds}s`);
    if (seconds === 0) this.finish('Time is up!');
  }

  finish(reason) {
    if (this.finished) return;
    this.finished = true;
    this.physics.pause();
    const c = COIN_DASH;
    this.add.rectangle(c.width / 2, c.height / 2, 460, 150, 0x0a1120, 0.95);
    this.add.text(c.width / 2, c.height / 2,
      `${reason}\n${this.score} coins collected\nPress R to try again`,
      { font: '24px monospace', color: '#ffffff', align: 'center', lineSpacing: 12 }
    ).setOrigin(0.5);
  }
}
window.coinDashGame = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: COIN_DASH.width,
  height: COIN_DASH.height,
  backgroundColor: COIN_DASH.colors.background,
  physics: { default: 'arcade', arcade: { debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY },
  scene: CoinDash
});
