// Coin pickup sound, synthesized with the Web Audio API (no assets, no network).
(function () {
  let ctx = null;

  function getContext() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Quick two-note rising "ding" (B5 -> E6), about 150 ms in total.
  window.playCoinSound = function () {
    try {
      const ac = getContext();
      if (!ac) return;
      const t = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(988, t);
      osc.frequency.setValueAtTime(1319, t + 0.06);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
      osc.connect(gain).connect(ac.destination);
      osc.start(t);
      osc.stop(t + 0.16);
    } catch (e) {
      // Audio is a nicety; never let it break the game.
    }
  };
})();
