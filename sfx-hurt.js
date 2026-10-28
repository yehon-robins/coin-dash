// Synthesized "hurt" sound for when a drone catches the player.
// Uses the Web Audio API only: no audio files, nothing fetched from the network.
(function () {
  let ctx = null;

  function getContext() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctx) ctx = new AudioCtx();
    // Browsers suspend audio until a user gesture; keyboard play counts.
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  window.playHurtSound = function playHurtSound() {
    try {
      const ac = getContext();
      if (!ac) return;
      const t = ac.currentTime;
      const duration = 0.35;

      const out = ac.createGain();
      out.gain.setValueAtTime(0.0001, t);
      out.gain.exponentialRampToValueAtTime(0.35, t + 0.01);
      out.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      out.connect(ac.destination);

      // Descending buzzy tone: sawtooth plus a slightly detuned square.
      [['sawtooth', 0, 0.6], ['square', 12, 0.4]].forEach(([type, detune, level]) => {
        const osc = ac.createOscillator();
        osc.type = type;
        osc.detune.value = detune;
        osc.frequency.setValueAtTime(420, t);
        osc.frequency.exponentialRampToValueAtTime(70, t + duration);
        const g = ac.createGain();
        g.gain.value = level;
        osc.connect(g).connect(out);
        osc.start(t);
        osc.stop(t + duration + 0.02);
      });

      // Short decaying burst of noise for an impact "crunch".
      const noiseLen = Math.floor(ac.sampleRate * 0.12);
      const buffer = ac.createBuffer(1, noiseLen, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < noiseLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / noiseLen);
      const noise = ac.createBufferSource();
      noise.buffer = buffer;
      const ng = ac.createGain();
      ng.gain.value = 0.25;
      noise.connect(ng).connect(out);
      noise.start(t);
    } catch (e) {
      // Audio is optional; never let it break the game.
    }
  };
})();
