/* suara.js — lagu tema orisinal (3 suasana: pagi, jam buka, malam) & efek suara dengan Web Audio API.
   Tanpa berkas audio luar; langsung disintesis secara musikal dan bisa dimatikan di menu Atur. */
(function (g) {
  'use strict';
  var KUNCI = 'kk_suara_v1';
  var ctx = null, masterMusik = null, masterEfek = null;
  var setelan = { musik: true, efek: true };
  var suasanaAktif = 'pagi';
  var timerMusik = null, langkah = 0, sudahInteraksi = false;

  try {
    var simpanan = JSON.parse(localStorage.getItem(KUNCI) || 'null');
    if (simpanan && typeof simpanan === 'object') {
      if (typeof simpanan.musik === 'boolean') setelan.musik = simpanan.musik;
      if (typeof simpanan.efek === 'boolean') setelan.efek = simpanan.efek;
    }
  } catch (e) {}

  function simpanSetelan() {
    try { localStorage.setItem(KUNCI, JSON.stringify(setelan)); } catch (e) {}
  }

  function pastikanCtx() {
    if (!ctx) {
      var AC = g.AudioContext || g.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      masterMusik = ctx.createGain();
      masterMusik.gain.value = setelan.musik ? 0.18 : 0;
      masterMusik.connect(ctx.destination);
      masterEfek = ctx.createGain();
      masterEfek.gain.value = setelan.efek ? 0.28 : 0;
      masterEfek.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') {
      try { ctx.resume(); } catch (e) {}
    }
    return ctx;
  }

  function hz(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /* Instrumen sintetis sederhana dengan amplop ADSR lembut */
  function mainNada(midi, durasi, warna, vol, tunda, tujuan) {
    if (!midi || !ctx) return;
    var t0 = ctx.currentTime + (tunda || 0);
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = warna || 'sine';
    osc.frequency.setValueAtTime(hz(midi), t0);

    var puncak = Math.max(0.001, vol || 0.25);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(puncak, t0 + 0.025);
    gain.gain.exponentialRampToValueAtTime(puncak * 0.45, t0 + Math.min(0.14, durasi * 0.45));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durasi);

    osc.connect(gain);
    gain.connect(tujuan || masterMusik);
    osc.start(t0);
    osc.stop(t0 + durasi + 0.03);
  }

  /* Perkusi shaker / rim halus untuk suasana kedai buka */
  function mainKetukan(jenis, vol, tunda) {
    if (!ctx) return;
    var t0 = ctx.currentTime + (tunda || 0);
    if (jenis === 'kick') {
      var osc = ctx.createOscillator(), gKick = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(115, t0);
      osc.frequency.exponentialRampToValueAtTime(42, t0 + 0.11);
      gKick.gain.setValueAtTime(vol || 0.22, t0);
      gKick.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.13);
      osc.connect(gKick); gKick.connect(masterMusik);
      osc.start(t0); osc.stop(t0 + 0.15);
    } else if (jenis === 'rim') {
      var osc2 = ctx.createOscillator(), gRim = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(620, t0);
      osc2.frequency.exponentialRampToValueAtTime(240, t0 + 0.035);
      gRim.gain.setValueAtTime(vol || 0.09, t0);
      gRim.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.045);
      osc2.connect(gRim); gRim.connect(masterMusik);
      osc2.start(t0); osc2.stop(t0 + 0.055);
    }
  }

  /* Komposisi 3 suasana lagu tema orisinal Kopi Kontainer (siklus 32 ketuk) */
  var TEMA = {
    /* PAGI: akustik/kalimba hangat & cerah menyambut matahari terbit (C - Fmaj7 - Am7 - G6) */
    pagi: {
      tempoMs: 360,
      akor: [
        [60, 64, 67, 71], [65, 69, 72, 76], [57, 64, 69, 72], [55, 62, 67, 71]
      ],
      bas: [48, 0, 55, 0, 48, 0, 52, 0, 53, 0, 60, 0, 53, 0, 57, 0, 45, 0, 52, 0, 45, 0, 48, 0, 43, 0, 50, 0, 43, 0, 47, 0],
      melodi: [
        72, 0, 74, 76, 79, 0, 76, 0,
        77, 0, 76, 74, 72, 0, 69, 0,
        72, 0, 76, 0, 81, 0, 79, 76,
        74, 0, 71, 74, 72, 0, 0, 0
      ]
    },
    /* JAM BUKA: bossa nova / lo-fi kedai kopi yang semangat & ramah (Dm9 - G13 - Cmaj9 - A7) */
    buka: {
      tempoMs: 240,
      akor: [
        [62, 65, 69, 72], [55, 62, 65, 71], [60, 64, 67, 71], [57, 61, 64, 69]
      ],
      bas: [50, 0, 0, 50, 57, 0, 50, 0, 43, 0, 0, 43, 50, 0, 43, 0, 48, 0, 0, 48, 55, 0, 48, 0, 45, 0, 0, 45, 52, 0, 49, 0],
      melodi: [
        74, 77, 0, 81, 0, 79, 77, 74,
        71, 0, 74, 79, 0, 76, 74, 0,
        72, 76, 0, 79, 0, 83, 81, 79,
        76, 0, 73, 76, 81, 0, 79, 0
      ]
    },
    /* MALAM: elektrik piano Rhodes teduh & menenangkan setelah tutup kedai (Am7 - Dm7 - G7 - Cmaj7) */
    malam: {
      tempoMs: 460,
      akor: [
        [57, 60, 64, 67], [62, 65, 69, 72], [55, 59, 62, 65], [60, 64, 67, 71]
      ],
      bas: [45, 0, 0, 0, 52, 0, 0, 0, 50, 0, 0, 0, 57, 0, 0, 0, 43, 0, 0, 0, 50, 0, 0, 0, 48, 0, 0, 0, 52, 0, 0, 0],
      melodi: [
        69, 0, 72, 0, 76, 0, 74, 72,
        74, 0, 69, 0, 65, 0, 0, 0,
        67, 0, 71, 0, 74, 0, 72, 71,
        72, 0, 67, 0, 64, 0, 0, 0
      ]
    }
  };

  function detakMusik() {
    if (!setelan.musik || !sudahInteraksi) return;
    if (!pastikanCtx()) return;
    var t = TEMA[suasanaAktif] || TEMA.pagi;
    var i = langkah % 32;
    var idxAkor = Math.floor(i / 8) % t.akor.length;
    var akor = t.akor[idxAkor];
    var durKetuk = t.tempoMs / 1000;

    /* Akor pengiring */
    if (suasanaAktif === 'pagi') {
      /* Petikan arpeggio lembut di pagi hari */
      var nadaArp = akor[i % akor.length];
      mainNada(nadaArp, durKetuk * 1.6, 'triangle', 0.14, 0);
    } else if (suasanaAktif === 'buka') {
      /* Sinkopasi bossa nova di jam buka */
      if (i % 8 === 0 || i % 8 === 3 || i % 8 === 6) {
        for (var a = 0; a < akor.length; a++) {
          mainNada(akor[a], durKetuk * 1.3, 'triangle', 0.09, a * 0.012);
        }
      }
      if (i % 4 === 0) mainKetukan('kick', 0.16, 0);
      if (i % 8 === 2 || i % 8 === 5 || i % 8 === 7) mainKetukan('rim', 0.07, 0);
    } else {
      /* Pad & Rhodes panjang di malam hari */
      if (i % 8 === 0) {
        for (var m = 0; m < akor.length; m++) {
          mainNada(akor[m], durKetuk * 6.5, 'sine', 0.11, m * 0.03);
        }
      } else if (i % 4 === 2) {
        mainNada(akor[(i / 2) % akor.length] + 12, durKetuk * 2.2, 'sine', 0.07, 0);
      }
    }

    /* Bas */
    var nadaBas = t.bas[i];
    if (nadaBas) {
      mainNada(nadaBas, durKetuk * (suasanaAktif === 'malam' ? 3.2 : 1.7), 'sine', suasanaAktif === 'buka' ? 0.24 : 0.19, 0);
    }

    /* Melodi utama */
    var nadaMel = t.melodi[i];
    if (nadaMel) {
      var warnaMel = suasanaAktif === 'buka' ? 'triangle' : 'sine';
      var volMel = suasanaAktif === 'buka' ? 0.2 : suasanaAktif === 'pagi' ? 0.18 : 0.15;
      mainNada(nadaMel, durKetuk * 1.85, warnaMel, volMel, 0.01);
      if (suasanaAktif === 'pagi') {
        /* Harmoni oktaf kalimba tipis */
        mainNada(nadaMel + 12, durKetuk * 0.7, 'sine', 0.05, 0.015);
      }
    }

    langkah = (langkah + 1) % 32;
    timerMusik = setTimeout(detakMusik, t.tempoMs);
  }

  function mulaiLoop() {
    if (timerMusik) { clearTimeout(timerMusik); timerMusik = null; }
    if (setelan.musik && sudahInteraksi) {
      detakMusik();
    }
  }

  /* Ganti suasana otomatis dari main.js: 'pagi' | 'buka' | 'malam' */
  function suasana(nama) {
    if (!TEMA[nama] || nama === suasanaAktif) return;
    suasanaAktif = nama;
    langkah = 0;
    if (setelan.musik && sudahInteraksi) mulaiLoop();
  }

  /* Efek suara tindakan di dalam game */
  function bunyi(jenis) {
    if (!setelan.efek) return;
    if (!pastikanCtx()) return;
    if (jenis === 'tap') {
      mainNada(76, 0.06, 'sine', 0.16, 0, masterEfek);
    } else if (jenis === 'racik') {
      mainNada(67, 0.08, 'triangle', 0.18, 0, masterEfek);
      mainNada(72, 0.1, 'triangle', 0.18, 0.05, masterEfek);
    } else if (jenis === 'bayar' || jenis === 'saji') {
      /* Suara kasir / lonceng transaksi masuk */
      mainNada(79, 0.11, 'triangle', 0.25, 0, masterEfek);
      mainNada(84, 0.24, 'sine', 0.28, 0.08, masterEfek);
    } else if (jenis === 'beli') {
      mainNada(72, 0.09, 'triangle', 0.22, 0, masterEfek);
      mainNada(76, 0.11, 'triangle', 0.22, 0.07, masterEfek);
      mainNada(79, 0.18, 'sine', 0.24, 0.14, masterEfek);
    } else if (jenis === 'buka') {
      /* Lonceng pintu kedai buka */
      mainNada(72, 0.14, 'triangle', 0.22, 0, masterEfek);
      mainNada(76, 0.14, 'triangle', 0.22, 0.09, masterEfek);
      mainNada(79, 0.16, 'triangle', 0.24, 0.18, masterEfek);
      mainNada(84, 0.32, 'sine', 0.26, 0.27, masterEfek);
    } else if (jenis === 'tutup') {
      mainNada(79, 0.15, 'sine', 0.2, 0, masterEfek);
      mainNada(76, 0.15, 'sine', 0.2, 0.11, masterEfek);
      mainNada(72, 0.3, 'triangle', 0.22, 0.22, masterEfek);
    } else if (jenis === 'pesan') {
      mainNada(81, 0.1, 'sine', 0.22, 0, masterEfek);
      mainNada(88, 0.18, 'sine', 0.22, 0.09, masterEfek);
    } else if (jenis === 'salah') {
      mainNada(52, 0.12, 'sawtooth', 0.14, 0, masterEfek);
      mainNada(48, 0.18, 'sawtooth', 0.14, 0.09, masterEfek);
    }
  }

  function aturMusik(nyala) {
    setelan.musik = !!nyala;
    simpanSetelan();
    pastikanCtx();
    if (masterMusik && ctx) {
      masterMusik.gain.setValueAtTime(setelan.musik ? 0.18 : 0, ctx.currentTime);
    }
    if (setelan.musik) {
      sudahInteraksi = true;
      mulaiLoop();
    } else if (timerMusik) {
      clearTimeout(timerMusik);
      timerMusik = null;
    }
    return setelan.musik;
  }

  function aturEfek(nyala) {
    setelan.efek = !!nyala;
    simpanSetelan();
    pastikanCtx();
    if (masterEfek && ctx) {
      masterEfek.gain.setValueAtTime(setelan.efek ? 0.28 : 0, ctx.currentTime);
    }
    if (setelan.efek) bunyi('tap');
    return setelan.efek;
  }

  function aktifkanSaatSentuh() {
    if (sudahInteraksi) return;
    sudahInteraksi = true;
    pastikanCtx();
    if (setelan.musik) mulaiLoop();
  }

  ['pointerdown', 'click', 'keydown'].forEach(function (ev) {
    g.addEventListener(ev, aktifkanSaatSentuh, { passive: true });
  });

  g.KK_SUARA = {
    suasana: suasana,
    bunyi: bunyi,
    aturMusik: aturMusik,
    aturEfek: aturEfek,
    musikOn: function () { return setelan.musik; },
    efekOn: function () { return setelan.efek; },
    suasanaAktif: function () { return suasanaAktif; }
  };
})(window);
