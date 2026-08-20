(function () {
  "use strict";

  var context = null;
  var muted = false;
  var masterGain = null;
  var ambienceGain = null;
  var ambienceNodes = [];

  function ensureContext() {
    if (!context) {
      var AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) return null;
      context = new AudioContextCtor();
      masterGain = context.createGain();
      ambienceGain = context.createGain();
      masterGain.gain.value = 0.72;
      ambienceGain.gain.value = 0.16;
      ambienceGain.connect(masterGain);
      masterGain.connect(context.destination);
    }
    if (context.state === "suspended") {
      context.resume();
    }
    return context;
  }

  function tone(frequency, duration, type, gainValue) {
    if (muted) return;
    var ctx = ensureContext();
    if (!ctx) return;

    var oscillator = ctx.createOscillator();
    var gain = ctx.createGain();
    oscillator.type = type || "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(gainValue || 0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(masterGain || ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  }

  function startAmbience() {
    if (muted || ambienceNodes.length) return;
    var ctx = ensureContext();
    if (!ctx || !ambienceGain) return;

    var wind = ctx.createOscillator();
    var veil = ctx.createOscillator();
    var windGain = ctx.createGain();
    var veilGain = ctx.createGain();

    wind.type = "sine";
    wind.frequency.value = 74;
    veil.type = "triangle";
    veil.frequency.value = 137;
    windGain.gain.value = 0.16;
    veilGain.gain.value = 0.045;

    wind.connect(windGain);
    veil.connect(veilGain);
    windGain.connect(ambienceGain);
    veilGain.connect(ambienceGain);
    wind.start();
    veil.start();

    ambienceNodes = [wind, veil, windGain, veilGain];
  }

  function stopAmbience() {
    ambienceNodes.forEach(function (node) {
      if (typeof node.stop === "function") {
        try {
          node.stop();
        } catch (error) {
          // The browser may stop suspended nodes on its own.
        }
      }
      if (typeof node.disconnect === "function") {
        try {
          node.disconnect();
        } catch (error) {
          // Disconnect failures are harmless in this tiny synth layer.
        }
      }
    });
    ambienceNodes = [];
  }

  function pulseAmbience(value, duration) {
    var ctx = ensureContext();
    if (!ctx || !ambienceGain) return;
    ambienceGain.gain.cancelScheduledValues(ctx.currentTime);
    ambienceGain.gain.setValueAtTime(ambienceGain.gain.value, ctx.currentTime);
    ambienceGain.gain.linearRampToValueAtTime(value, ctx.currentTime + 0.12);
    ambienceGain.gain.linearRampToValueAtTime(0.16, ctx.currentTime + duration);
  }

  window.ElUltimoCaminoAudio = {
    init: function () {
      var ctx = ensureContext();
      startAmbience();
      return ctx;
    },
    setMuted: function (value) {
      muted = Boolean(value);
      if (muted) {
        stopAmbience();
      } else {
        startAmbience();
      }
    },
    isMuted: function () {
      return muted;
    },
    ui: function () {
      tone(420, 0.05, "triangle", 0.025);
    },
    map: function () {
      pulseAmbience(0.22, 1.3);
      tone(196, 0.16, "sine", 0.02);
    },
    event: function () {
      tone(294, 0.09, "triangle", 0.02);
      window.setTimeout(function () {
        tone(247, 0.16, "sine", 0.018);
      }, 90);
    },
    camp: function () {
      pulseAmbience(0.08, 1.6);
      tone(330, 0.08, "triangle", 0.018);
      window.setTimeout(function () {
        tone(392, 0.06, "triangle", 0.016);
      }, 120);
    },
    enemy: function () {
      pulseAmbience(0.28, 1.1);
      tone(73, 0.22, "sawtooth", 0.035);
      window.setTimeout(function () {
        tone(146, 0.08, "square", 0.018);
      }, 100);
    },
    boss: function () {
      pulseAmbience(0.34, 1.8);
      tone(65, 0.4, "sine", 0.055);
      window.setTimeout(function () {
        tone(98, 0.35, "triangle", 0.035);
      }, 220);
    },
    hit: function () {
      tone(92, 0.06, "sawtooth", 0.06);
      window.setTimeout(function () {
        tone(58, 0.09, "square", 0.025);
      }, 35);
    },
    heal: function () {
      tone(620, 0.12, "sine", 0.035);
      window.setTimeout(function () {
        tone(820, 0.12, "sine", 0.025);
      }, 80);
    },
    guard: function () {
      tone(220, 0.08, "triangle", 0.025);
      window.setTimeout(function () {
        tone(330, 0.1, "triangle", 0.018);
      }, 60);
    },
    victory: function () {
      tone(392, 0.12, "triangle", 0.04);
      window.setTimeout(function () {
        tone(523, 0.18, "triangle", 0.04);
      }, 120);
    },
    defeat: function () {
      tone(180, 0.2, "sawtooth", 0.04);
      window.setTimeout(function () {
        tone(90, 0.28, "sine", 0.04);
      }, 180);
    }
  };
})();
