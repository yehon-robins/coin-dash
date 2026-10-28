// Keep tuning separate from game behaviour so features can be developed independently.
window.COIN_DASH = {
  width: 800,
  height: 500,
  roundSeconds: 60,
  playerSpeed: 240,
  droneSpeed: 105,
  coinsPerExtraDrone: 5,
  droneCount: 3,
  coinBaseSpeed: 60,
  coinSpeedIncrement: 10,
  coinMaxSpeed: 200,
  coinMinSpeed: 40,
  coinIdleSeconds: 10,
  coinIdleDecay: 0.85,
  colors: {
    background: 0x101c31, player: 0x71e8ce, coin: 0xffd166, drone: 0xff657a,
    coinHighlight: 0xfff3c4, bomb: 0xff5a1f, bombFuse: 0x2b1a12, bombFuseSpark: 0xffe066
  }
};
