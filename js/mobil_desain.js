/* mobil_desain.js — P80: Desain Mobil Asli (12 Foto-Sprite PNG Transparan + Blueprint Bezier Spesifik Semua 58 Model Mobil) */
(function (g) {
  'use strict';

  /* ---------- 1. REGISTRY FOTO-SPRITE ASLI TRANSPARAN (img/mobil/*.png) ---------- */
  var FOTO_MAP = {
    granmax:     { src: 'img/mobil/granmax.png?v=100',     w: 112, wf: 0.78, wb: 0.25, wy: 0.80, wr: 10.5 },
    carry:       { src: 'img/mobil/carry.png?v=100',       w: 112, wf: 0.76, wb: 0.24, wy: 0.80, wr: 10.5 },
    l300:        { src: 'img/mobil/l300.png?v=100',        w: 116, wf: 0.77, wb: 0.25, wy: 0.80, wr: 10.5 },
    traga:       { src: 'img/mobil/traga.png?v=100',       w: 122, wf: 0.79, wb: 0.26, wy: 0.81, wr: 10.5 },
    brio:        { src: 'img/mobil/brio.png?v=100',        w: 100, wf: 0.80, wb: 0.20, wy: 0.79, wr: 10.2 },
    avanza:      { src: 'img/mobil/avanza.png?v=100',      w: 118, wf: 0.80, wb: 0.21, wy: 0.79, wr: 10.8 },
    avanzahev27: { src: 'img/mobil/avanza.png?v=100',      w: 118, wf: 0.80, wb: 0.21, wy: 0.79, wr: 10.8 },
    innova:      { src: 'img/mobil/innova.png?v=100',      w: 128, wf: 0.79, wb: 0.21, wy: 0.79, wr: 11.2 },
    fortuner:    { src: 'img/mobil/fortuner.png?v=100',    w: 132, wf: 0.79, wb: 0.22, wy: 0.78, wr: 12.2 },
    fortuner28:  { src: 'img/mobil/fortuner.png?v=100',    w: 132, wf: 0.79, wb: 0.22, wy: 0.78, wr: 12.2 },
    civicrs:     { src: 'img/mobil/civicrs.png?v=100',     w: 124, wf: 0.80, wb: 0.21, wy: 0.76, wr: 10.8 },
    gr86:        { src: 'img/mobil/gr86.png?v=100',        w: 118, wf: 0.79, wb: 0.22, wy: 0.76, wr: 10.8 },
    alphard:     { src: 'img/mobil/alphard.png?v=100',     w: 136, wf: 0.81, wb: 0.21, wy: 0.79, wr: 11.4 },
    landcruiser: { src: 'img/mobil/landcruiser.png?v=100', w: 138, wf: 0.79, wb: 0.23, wy: 0.78, wr: 12.8 }
  };

  var imgCache = {};
  function muatFoto(id) {
    var bid = String(id || '').replace(/-bekas$/, '');
    var info = FOTO_MAP[bid];
    if (!info) return null;
    if (typeof Image === 'undefined') return null;
    if (!imgCache[info.src]) {
      var im = new Image();
      im.src = info.src;
      imgCache[info.src] = im;
    }
    var c = imgCache[info.src];
    return (c && c.complete && c.naturalWidth > 0) ? { img: c, info: info } : null;
  }
  function preloadSemua() {
    if (typeof Image === 'undefined') return;
    Object.keys(FOTO_MAP).forEach(function (k) { muatFoto(k); });
  }
  if (typeof window !== 'undefined' && typeof Image !== 'undefined') {
    setTimeout(preloadSemua, 120);
  }

  /* ---------- 2. HELPERS WARNA ---------- */
  function geserHex(hex, delta) {
    var s = String(hex || '#94a3b8').replace('#', '');
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    var r = Math.max(0, Math.min(255, parseInt(s.substr(0, 2), 16) + delta));
    var gr = Math.max(0, Math.min(255, parseInt(s.substr(2, 2), 16) + delta));
    var b = Math.max(0, Math.min(255, parseInt(s.substr(4, 2), 16) + delta));
    return '#' + ('0' + r.toString(16)).slice(-2) + ('0' + gr.toString(16)).slice(-2) + ('0' + b.toString(16)).slice(-2);
  }

  /* ---------- 3. BLUEPRINT DESAIN ASLI PER MODEL (KOORDINAT VIEWBOX 0..200 x 0..92, HADAP KANAN) ----------
     Setiap model mendefinisikan siluet bodi kurva Bezier autentik, kaca jendela asli, pilar,
     roda (wb, wf, wy, wr, rim), warna OEM, atap two-tone, cladding SUV, spoiler, DRL/tail signature, dll. */
  var ARCH = {
    /* Pickup modern bermoncong (Hilux Rangga) */
    pikap_hood: {
      body: 'M 14,67 L 14,44 L 106,44 L 107,18 C 109,15 138,15 144,18 L 160,39 L 185,43 C 190,45 191,52 190,67 Z',
      glass: 'M 113,39 L 113,22 L 141,22 L 154,39 Z',
      pillars: [[134, 22, 2.2, 17]],
      bedLine: [14, 48, 105, 48],
      bedWall: [104, 18, 3, 27],
      wb: 48, wf: 156, wy: 68, wr: 14.5, rim: 'steel',
      head: [182, 46, 8, 6], tail: [13, 49, 4, 8],
      bumperF: [180, 56, 11, 11], mirror: [146, 36]
    },
    /* Pickup 4x4 single cab (Triton HDX) */
    pikap_4x4: {
      body: 'M 12,64 L 13,41 L 100,41 L 104,17 C 108,14 137,14 143,17 L 160,36 L 186,40 C 191,42 192,50 190,64 Z',
      glass: 'M 109,37 L 111,21 L 140,21 L 154,37 Z',
      pillars: [[132, 21, 2.2, 16]],
      bedLine: [14, 46, 98, 46],
      bedWall: [99, 17, 3.2, 25],
      wb: 46, wf: 157, wy: 67, wr: 16, rim: 'offroad', clad: true,
      head: [181, 43, 9, 5.5], tail: [12, 44, 4.5, 9],
      step: [78, 65, 58, 3], mirror: [145, 34]
    },
    /* Double Cabin 4x4 (Hilux DC) */
    pikap_dc: {
      body: 'M 10,64 L 11,40 L 66,40 L 70,17 C 74,14 134,14 142,17 L 160,36 L 188,40 C 192,42 193,51 191,64 Z',
      glass: 'M 75,37 L 78,21 L 139,21 L 154,37 Z',
      pillars: [[108, 21, 3.2, 16], [75, 21, 2.5, 16]],
      bedLine: [12, 45, 65, 45],
      rollbar: 'M 64,40 L 58,18 L 71,18',
      wb: 44, wf: 158, wy: 67, wr: 16, rim: 'offroad', clad: true,
      head: [181, 43, 10, 5.5], tail: [10, 44, 4.5, 10],
      step: [68, 65, 72, 3.2], mirror: [145, 34], handles: [[90, 42], [122, 42]]
    },
    /* City Hatchback modern (Ayla / Agya) */
    hatch_mod: {
      body: 'M 26,68 C 22,60 22,47 26,41 L 40,21 C 46,17 110,16 122,20 L 146,38 L 172,44 C 178,46 179,56 177,68 Z',
      glass: 'M 38,39 L 47,23 C 58,21 108,21 118,24 L 140,39 Z',
      pillars: [[90, 22, 3.2, 18], [58, 22, 2.6, 17]],
      wb: 52, wf: 148, wy: 68, wr: 13.5, rim: 'alloy5',
      head: [165, 47, 11, 5], tail: [23, 44, 7, 7],
      spoiler: [28, 20, 14, 3.5], mirror: [132, 37], handles: [[74, 43], [110, 43]]
    },
    /* Micro EV Cube (Wuling Air EV) */
    micro_ev: {
      body: 'M 48,69 C 45,62 45,35 48,22 C 51,16 124,15 132,20 L 149,40 L 155,46 C 158,52 158,62 155,69 Z',
      glass: 'M 54,40 L 56,22 C 68,20 120,20 128,23 L 144,40 Z',
      pillars: [[98, 21, 3.6, 20]],
      wb: 66, wf: 136, wy: 70, wr: 11.5, rim: 'aero',
      drlBar: [140, 43, 16, 3], tail: [45, 44, 5, 7],
      mirror: [136, 38], handles: [[94, 46]]
    },
    /* Retro Rounded EV Hatch (Wuling BinguoEV) */
    retro_ev: {
      body: 'M 22,68 C 17,58 19,42 29,34 C 37,22 50,17 98,17 C 118,17 132,25 144,38 C 156,40 171,44 176,51 C 180,57 179,64 175,68 Z',
      glass: 'M 36,38 C 43,25 54,21 96,21 C 112,21 124,26 136,38 Z',
      pillars: [[86, 21, 3, 17], [56, 22, 2.6, 16]],
      wb: 49, wf: 147, wy: 68, wr: 13.5, rim: 'retro', chromeWin: true,
      head: [164, 46, 10, 6.5], tail: [20, 45, 7, 7],
      mirror: [128, 36], handles: [[72, 43], [108, 43]]
    },
    /* Sleek Rounded EV Hatch (Wuling Cloud EV) */
    cloud_ev: {
      body: 'M 18,68 C 14,58 16,44 24,37 L 38,20 C 50,16 116,16 130,21 L 154,39 L 178,44 C 184,47 185,57 182,68 Z',
      glass: 'M 32,39 L 44,23 C 58,20 116,20 128,24 L 148,39 Z',
      pillars: [[94, 21, 3.2, 18], [58, 22, 2.8, 17]],
      wb: 48, wf: 152, wy: 68, wr: 14, rim: 'aero',
      drlBar: [170, 46, 12, 3.5], tail: [16, 42, 9, 4.5],
      mirror: [140, 37], handles: [[76, 44], [114, 44]]
    },
    /* Compact LCGC MPV (Calya / Sigra) */
    lmpv_lcgc: {
      body: 'M 16,68 C 14,58 14,42 18,36 L 28,18 C 38,16 118,16 130,20 L 152,38 L 180,43 C 185,46 186,57 183,68 Z',
      glass: 'M 25,37 L 33,22 L 126,22 L 146,37 Z',
      pillars: [[96, 22, 3.2, 16], [56, 22, 3, 16]],
      floatD: 'M 18,37 L 26,22 L 33,22 L 26,37 Z',
      wb: 46, wf: 154, wy: 68, wr: 13.5, rim: 'alloy5',
      head: [170, 45, 11, 5.5], tail: [15, 40, 7, 7],
      mirror: [137, 36], handles: [[74, 42], [116, 42]]
    },
    /* Modern Indonesian LMPV (Xenia / Ertiga / Veloz / BYD M6) */
    lmpv_mod: {
      body: 'M 13,68 C 11,57 11,43 16,36 L 26,18 C 38,15 120,15 134,20 L 158,38 L 184,43 C 189,46 190,57 187,68 Z',
      glass: 'M 24,38 L 32,21 C 50,19 118,19 130,23 L 151,38 Z',
      pillars: [[100, 20, 3.2, 18], [58, 21, 3, 17]],
      floatD: 'M 16,38 L 24,21 L 32,21 L 25,38 Z',
      wb: 46, wf: 156, wy: 68, wr: 14, rim: 'alloy10',
      head: [173, 45, 12, 5], tail: [13, 39, 8, 6.5],
      mirror: [142, 36], handles: [[78, 43], [120, 43]]
    },
    /* Mitsubishi Xpander (Dynamic Shield nose + muscular wheel arches) */
    xpander: {
      body: 'M 12,67 C 10,55 11,42 16,35 L 26,17 C 38,15 118,15 132,19 L 156,37 L 184,40 L 189,47 L 187,67 Z',
      glass: 'M 24,37 L 32,21 L 128,21 L 149,37 Z',
      pillars: [[98, 21, 3.2, 17], [58, 21, 3, 17]],
      floatD: 'M 16,37 L 25,21 L 32,21 L 25,37 Z',
      crease: 'M 20,46 L 178,42',
      wb: 46, wf: 157, wy: 68, wr: 14.5, rim: 'turbine', clad: true,
      head: [174, 42, 12, 4.5], tail: [12, 37, 8, 8],
      mirror: [141, 35], handles: [[78, 42], [119, 42]]
    },
    /* Hyundai Stargazer (One-curve sleek bullet MPV + Horizon LED DRL) */
    stargazer: {
      body: 'M 14,68 C 11,57 12,42 18,35 L 32,19 C 50,15 114,15 136,22 C 154,28 170,38 186,47 C 190,52 190,62 186,68 Z',
      glass: 'M 27,38 L 37,22 C 58,19 116,19 134,25 L 158,38 Z',
      pillars: [[100, 21, 3.2, 17], [60, 22, 3, 16]],
      wb: 46, wf: 156, wy: 68, wr: 14, rim: 'aero',
      drlBar: [170, 44, 15, 3], tail: [14, 39, 7, 10],
      mirror: [146, 36], handles: [[78, 43], [120, 43]]
    },
    /* Innova Zenix (Crossover-MPV muscular stance + kinked D-pillar) */
    zenix: {
      body: 'M 10,67 C 9,55 10,41 15,34 L 26,15 C 40,13 122,13 136,18 L 160,36 L 187,40 C 192,43 192,56 189,67 Z',
      glass: 'M 24,36 L 33,19 L 132,19 L 153,36 Z',
      pillars: [[100, 19, 3.4, 17], [58, 19, 3.2, 17]],
      wb: 46, wf: 158, wy: 67, wr: 15, rim: 'alloy10', clad: true, chromeWin: true,
      head: [175, 42, 12, 5], tail: [11, 37, 8, 7],
      spoiler: [16, 15, 14, 3.5], mirror: [144, 34], handles: [[78, 41], [120, 41]]
    },
    /* Compact SUV (Raize / Yaris Cross / Creta / BR-V / XL7 / Rush / Terios / Atto 3) */
    csuv_mod: {
      body: 'M 15,66 C 13,54 14,41 19,35 L 30,17 C 44,15 118,15 130,19 L 152,36 L 182,40 C 187,43 188,55 185,66 Z',
      glass: 'M 28,37 L 36,21 L 126,21 L 146,37 Z',
      pillars: [[96, 21, 3.2, 16], [58, 21, 3, 16]],
      wb: 48, wf: 154, wy: 67, wr: 15, rim: 'alloy5', clad: true, roofRail: [36, 14, 82],
      head: [171, 42, 12, 5], tail: [14, 38, 8, 6.5],
      spoiler: [20, 17, 13, 3.2], mirror: [138, 35], handles: [[76, 42], [116, 42]]
    },
    /* Coupe-SUV (Honda HR-V / BYD Sealion 7) */
    coupe_suv: {
      body: 'M 14,66 C 12,56 14,44 22,37 L 42,19 C 56,16 116,16 132,21 L 156,37 L 184,42 C 189,45 190,56 186,66 Z',
      glass: 'M 33,38 L 48,22 C 62,20 116,20 129,24 L 150,38 Z',
      pillars: [[98, 21, 3.2, 17], [62, 22, 3, 16]],
      wb: 48, wf: 156, wy: 67, wr: 15, rim: 'turbine', clad: true,
      head: [173, 44, 12, 4.5], tail: [15, 40, 11, 4.5],
      spoiler: [26, 21, 14, 3], mirror: [142, 35], handles: [[118, 42]]
    },
    /* Hyundai IONIQ 5 (Sharp Origami Z-Crease + Parametric Pixel) */
    ioniq5: {
      body: 'M 14,67 L 16,42 L 32,19 C 46,16 122,16 135,20 L 156,38 L 185,42 L 188,54 L 185,67 Z',
      glass: 'M 28,39 L 38,22 L 131,22 L 150,39 Z',
      pillars: [[98, 22, 3.4, 17], [56, 22, 3.2, 17]],
      crease: 'M 56,56 L 136,41',
      wb: 46, wf: 158, wy: 67, wr: 15.5, rim: 'aero', clad: true,
      head: [175, 44, 10, 5], tail: [15, 43, 8, 5],
      spoiler: [22, 18, 13, 3.2], mirror: [142, 36], handles: [[76, 44], [116, 44]]
    },
    /* Big Flagship SUV (Pajero Sport / CR-V / Palisade) */
    big_suv: {
      body: 'M 10,65 C 9,53 10,39 14,32 L 24,14 C 38,12 122,12 136,16 L 156,34 L 188,38 C 193,41 193,54 190,65 Z',
      glass: 'M 22,35 L 30,18 L 131,18 L 150,35 Z',
      pillars: [[100, 18, 3.6, 17], [56, 18, 3.4, 17]],
      wb: 45, wf: 159, wy: 66, wr: 16, rim: 'alloy10', clad: true, roofRail: [30, 11, 96], chromeWin: true,
      head: [176, 40, 13, 5.5], tail: [10, 35, 6, 12],
      step: [64, 65, 76, 3.2], spoiler: [14, 14, 13, 3.2], mirror: [142, 33], handles: [[76, 40], [118, 40]]
    },
    /* Boxy 4x4 Icon (Suzuki Jimny 5-Door) */
    jimny: {
      body: 'M 24,65 L 24,17 C 25,14 128,14 132,16 L 142,37 L 176,39 C 180,41 180,55 178,65 Z',
      glass: 'M 30,37 L 30,20 L 128,20 L 137,37 Z',
      pillars: [[94, 20, 4, 17], [56, 20, 3.8, 17]],
      spare: [11, 33, 12, 26],
      wb: 50, wf: 152, wy: 66, wr: 15.5, rim: 'offroad', clad: true,
      head: [171, 41, 7, 7], tail: [23, 55, 5, 6],
      mirror: [134, 34], handles: [[72, 41], [110, 41]]
    },
    /* Mercedes-AMG G 63 V8 Biturbo (Boxy Sultan G-Wagon + side exhaust + spare cover) */
    g63: {
      body: 'M 20,64 L 20,13 C 22,10 132,10 136,13 L 146,35 L 184,37 C 188,39 188,54 186,64 Z',
      glass: 'M 27,35 L 27,16 L 132,16 L 141,35 Z',
      pillars: [[96, 16, 4.2, 19], [56, 16, 4, 19]],
      spare: [6, 29, 13, 28],
      crease: 'M 20,40 L 185,40',
      wb: 49, wf: 157, wy: 66, wr: 16.5, rim: 'sport', caliper: '#ef4444', clad: true,
      head: [177, 40, 8, 8], tail: [19, 53, 5, 6],
      step: [66, 63, 74, 3.8], exhaust: [72, 66, 16, 3], mirror: [138, 32], handles: [[74, 42], [116, 42]]
    },
    /* Executive / Sport Sedan (Camry / BMW 330i / BYD Seal / Tesla Model 3) */
    sedan_lux: {
      body: 'M 10,68 C 9,58 10,48 15,43 L 34,39 L 58,21 C 72,18 114,18 128,22 L 154,39 L 185,45 C 190,48 190,59 187,68 Z',
      glass: 'M 42,40 L 62,24 C 76,22 112,22 124,25 L 147,40 Z',
      pillars: [[98, 22, 3, 18]],
      wb: 44, wf: 158, wy: 68, wr: 14, rim: 'sport', chromeWin: true,
      head: [174, 47, 13, 4.5], tail: [11, 44, 10, 5],
      mirror: [138, 38], handles: [[76, 44], [116, 44]]
    },
    /* Porsche 911 Carrera S (Iconic 911 Flyline + Oval Headlamp + Ducktail) */
    porsche911: {
      body: 'M 11,68 C 9,60 11,49 18,45 L 44,34 C 60,24 86,21 114,24 C 130,27 144,36 156,41 C 170,41 184,45 189,52 C 191,57 190,64 186,68 Z',
      glass: 'M 54,40 C 66,30 88,26 112,28 C 125,29 137,35 148,41 Z',
      pillars: [[102, 27, 2.4, 14]],
      wb: 46, wf: 156, wy: 68, wr: 14.5, rim: 'sport', caliper: '#ef4444',
      head: [170, 44, 13, 6], tail: [12, 46, 12, 4],
      spoiler: [14, 42, 18, 3], mirror: [136, 39], handles: [[104, 46]]
    },
    /* Toyota HiAce Premio (Long Commercial Semi-Bonnet Travel Van) */
    hiace: {
      body: 'M 8,68 L 8,14 C 12,11 142,11 154,14 L 175,38 L 190,44 C 193,48 193,59 190,68 Z',
      glass: 'M 15,38 L 15,18 L 150,18 L 169,38 Z',
      pillars: [[124, 18, 3.2, 20], [88, 18, 3, 20], [52, 18, 3, 20]],
      crease: 'M 15,44 L 122,44',
      wb: 42, wf: 162, wy: 68, wr: 14.5, rim: 'alloy5',
      head: [181, 46, 10, 6], tail: [8, 38, 5, 16],
      mirror: [162, 36], handles: [[116, 44], [142, 44]]
    },
    /* Hyundai Staria (Spaceship Bullet-Nose Panoramic Van) */
    staria: {
      body: 'M 10,68 L 10,14 C 16,11 118,11 136,16 C 156,22 175,34 189,47 C 192,52 192,61 189,68 Z',
      glass: 'M 17,41 L 17,18 L 134,19 C 152,24 166,34 176,41 Z',
      pillars: [[118, 19, 3.2, 22], [74, 18, 3.2, 23]],
      wb: 44, wf: 158, wy: 68, wr: 14.5, rim: 'alloy10',
      drlBar: [173, 44, 16, 3], tail: [10, 24, 5, 28],
      mirror: [152, 39], handles: [[110, 46], [134, 46]]
    },
    /* VIP Luxury Van (Vellfire / Lexus LM) */
    luxvan: {
      body: 'M 10,68 L 10,13 C 16,11 128,11 142,14 L 168,36 L 188,41 C 191,45 191,58 188,68 Z',
      glass: 'M 16,38 L 16,17 L 138,17 L 162,38 Z',
      pillars: [[116, 17, 4, 21], [72, 17, 3.2, 21]],
      chromeTrim: 'M 16,39 L 114,39 L 122,22 L 125,22 L 117,40 L 162,40',
      chromeGrille: [184, 43, 6, 21],
      wb: 44, wf: 158, wy: 68, wr: 14.5, rim: 'alloy10', chromeWin: true,
      head: [174, 42, 14, 5.5], tail: [10, 35, 9, 8],
      mirror: [148, 36], handles: [[108, 43], [126, 43]]
    }
  };

  /* Peta spesifikasi nyata tiap ID mobil -> archetype + warna OEM + variasi ciri khas asli */
  var SPEK = {
    granmax:    { a: 'pikap_hood', w: '#f1f5f9' },
    carry:      { a: 'pikap_hood', w: '#f8fafc' },
    l300:       { a: 'pikap_hood', w: '#18181b' },
    traga:      { a: 'pikap_hood', w: '#f8fafc' },
    hilux:      { a: 'pikap_hood', w: '#e2e8f0', rim: 'steel' },
    triton:     { a: 'pikap_4x4',  w: '#f1f5f9' },
    calya:      { a: 'lmpv_lcgc',  w: '#a89f91' },
    sigra:      { a: 'lmpv_lcgc',  w: '#4b5563' },
    ayla:       { a: 'hatch_mod',  w: '#cbd5e1' },
    agya:       { a: 'hatch_mod',  w: '#eab308', roof: '#111827', caliper: '#ef4444' },
    brio:       { a: 'hatch_mod',  w: '#dc2626' },
    airev:      { a: 'micro_ev',   w: '#f8fafc', roof: '#1e293b', accent: '#38bdf8' },
    xenia:      { a: 'lmpv_mod',   w: '#64748b' },
    avanza:     { a: 'lmpv_mod',   w: '#cbd5e1' },
    avanzahev27:{ a: 'lmpv_mod',   w: '#e2e8f0' },
    ertiga:     { a: 'lmpv_mod',   w: '#991b1b' },
    terios:     { a: 'csuv_mod',   w: '#57534e' },
    rush:       { a: 'csuv_mod',   w: '#f1f5f9', roof: null, caliper: '#ef4444' },
    xl7:        { a: 'csuv_mod',   w: '#d6cbb8', roof: '#18181b' },
    veloz:      { a: 'lmpv_mod',   w: '#f1f5f9', chromeWin: true, roofRail: [34, 14, 86] },
    xpander:    { a: 'xpander',    w: '#f1f5f9' },
    stargazer:  { a: 'stargazer',  w: '#94a3b8' },
    binguoev:   { a: 'retro_ev',   w: '#d6c7b2', roof: '#f8fafc' },
    bydm6:      { a: 'lmpv_mod',   w: '#e2e8f0', rim: 'aero', chromeWin: true },
    creta:      { a: 'csuv_mod',   w: '#f1f5f9', roof: '#111827', cPillarAccent: '#cbd5e1' },
    hrv:        { a: 'coupe_suv',  w: '#94a3b8' },
    hrvhev26:   { a: 'coupe_suv',  w: '#cbd5e1', caliper: '#ef4444' },
    innova:     { a: 'zenix',      w: '#cbd5e1' },
    zenix:      { a: 'zenix',      w: '#e5e7eb' },
    zenix27:    { a: 'zenix',      w: '#cbd5e1' },
    raize:      { a: 'csuv_mod',   w: '#0ea5e9', roof: '#0f172a', caliper: '#ef4444' },
    brv:        { a: 'csuv_mod',   w: '#b5a692' },
    cloudev:    { a: 'cloud_ev',   w: '#d1d5db' },
    yariscross: { a: 'csuv_mod',   w: '#dc2626', roof: '#111827' },
    atto3:      { a: 'csuv_mod',   w: '#3b82f6', rim: 'aero', cPillarAccent: '#cbd5e1' },
    hiace:      { a: 'hiace',      w: '#cbd5e1' },
    jimny:      { a: 'jimny',      w: '#84a94c', roof: '#18181b' },
    hiluxdc:    { a: 'pikap_dc',   w: '#27272a' },
    fortuner:   { a: 'big_suv',    w: '#1e293b', caliper: '#ef4444' },
    fortuner28: { a: 'big_suv',    w: '#111827', caliper: '#ef4444' },
    pajerosport:{ a: 'big_suv',    w: '#1f2937', caliper: '#ef4444' },
    civicrs:    { a: 'sedan_lux',  w: '#dc2626', caliper: '#ef4444' },
    bydseal:    { a: 'sedan_lux',  w: '#3b82f6', rim: 'aero', caliper: '#ef4444' },
    crv:        { a: 'big_suv',    w: '#1e3a5f', rim: 'sport' },
    ioniq5:     { a: 'ioniq5',     w: '#c5bda8' },
    sealion7:   { a: 'coupe_suv',  w: '#1d4ed8', rim: 'sport', caliper: '#ef4444' },
    camry:      { a: 'sedan_lux',  w: '#374151', rim: 'alloy10' },
    gr86:       { a: 'porsche911', w: '#dc2626', caliper: '#ef4444' },
    staria:     { a: 'staria',     w: '#1f2937' },
    palisade:   { a: 'big_suv',    w: '#1e293b', rim: 'alloy10' },
    model3:     { a: 'sedan_lux',  w: '#dc2626', rim: 'aero', caliper: '#ef4444', chromeWin: false },
    bmw330i:    { a: 'sedan_lux',  w: '#1d4ed8', rim: 'sport', caliper: '#ef4444' },
    alphard:    { a: 'luxvan',     w: '#f5f5f4' },
    vellfire:   { a: 'luxvan',     w: '#18181b', chromeTrim: true },
    lexuslm:    { a: 'luxvan',     w: '#64748b', chromeTrim: true },
    landcruiser:{ a: 'big_suv',    w: '#334155' },
    porsche911: { a: 'porsche911', w: '#dc2626', caliper: '#eab308' },
    mercg63:    { a: 'g63',        w: '#18181b' }
  };

  function ambilSpek(id, bentuk) {
    var bid = String(id || '').replace(/-bekas$/, '');
    var s = SPEK[bid];
    if (!s) {
      var aDef = bentuk === 'pikap' ? 'pikap_hood' : bentuk === 'hatch' ? 'hatch_mod' : bentuk === 'sport' ? 'porsche911' : bentuk === 'sedan' ? 'sedan_lux' : bentuk === 'van' ? 'luxvan' : bentuk === 'suv' ? 'csuv_mod' : 'lmpv_mod';
      s = { a: aDef, w: '#cbd5e1' };
    }
    var base = ARCH[s.a] || ARCH.lmpv_mod;
    var out = {};
    Object.keys(base).forEach(function (k) { out[k] = base[k]; });
    Object.keys(s).forEach(function (k) { if (s[k] !== undefined) out[k] = s[k]; });
    out.bid = bid;
    return out;
  }

  /* ---------- 4. SVG HIGH-DETAIL GENERATOR (Dealer, Agen Bekas, Garasi, & Fallback) ---------- */
  function svgRoda(cxp, cyp, r, jenis, caliper) {
    var spokes = '', n = jenis === 'alloy10' ? 10 : jenis === 'offroad' ? 6 : jenis === 'aero' ? 5 : jenis === 'steel' ? 8 : 5;
    if (jenis === 'steel') {
      spokes = '<circle cx="' + cxp + '" cy="' + cyp + '" r="' + (r * 0.62).toFixed(1) + '" fill="#94a3b8" stroke="#475569" stroke-width="1"/>';
      for (var i = 0; i < 8; i++) {
        var a = i * Math.PI / 4;
        spokes += '<circle cx="' + (cxp + Math.cos(a) * r * 0.42).toFixed(1) + '" cy="' + (cyp + Math.sin(a) * r * 0.42).toFixed(1) + '" r="1.4" fill="#1e293b"/>';
      }
    } else if (jenis === 'retro') {
      spokes = '<circle cx="' + cxp + '" cy="' + cyp + '" r="' + (r * 0.66).toFixed(1) + '" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>' +
        '<circle cx="' + cxp + '" cy="' + cyp + '" r="' + (r * 0.28).toFixed(1) + '" fill="#94a3b8"/>';
    } else {
      var colRim = (jenis === 'sport' || jenis === 'aero') ? '#334155' : '#1e293b';
      var colSpk = jenis === 'sport' ? '#e2e8f0' : '#cbd5e1';
      spokes = '<circle cx="' + cxp + '" cy="' + cyp + '" r="' + (r * 0.68).toFixed(1) + '" fill="' + colRim + '" stroke="#94a3b8" stroke-width="1.1"/>';
      if (caliper) spokes += '<rect x="' + (cxp + r * 0.16).toFixed(1) + '" y="' + (cyp - r * 0.24).toFixed(1) + '" width="3.4" height="5.5" rx="1" fill="' + caliper + '"/>';
      for (var j = 0; j < n; j++) {
        var ang = j * (Math.PI * 2 / n) - 0.3;
        spokes += '<line x1="' + cxp + '" y1="' + cyp + '" x2="' + (cxp + Math.cos(ang) * r * 0.62).toFixed(1) + '" y2="' + (cyp + Math.sin(ang) * r * 0.62).toFixed(1) + '" stroke="' + colSpk + '" stroke-width="' + (n > 6 ? '1.3' : '2.1') + '" stroke-linecap="round"/>';
      }
      spokes += '<circle cx="' + cxp + '" cy="' + cyp + '" r="2.6" fill="#f8fafc" stroke="#0f172a" stroke-width="0.8"/>';
    }
    return '<circle cx="' + cxp + '" cy="' + cyp + '" r="' + (r + 1.8).toFixed(1) + '" fill="#090d16"/>' +
      '<circle cx="' + cxp + '" cy="' + cyp + '" r="' + r.toFixed(1) + '" fill="#181c24" stroke="#334155" stroke-width="0.7"/>' + spokes;
  }

  function buatSvgBlueprint(id, bentuk, warnaKustom) {
    var sp = ambilSpek(id, bentuk);
    var w = warnaKustom || sp.w || '#cbd5e1';
    var wHi = geserHex(w, 48), wMid = geserHex(w, 8), wShade = geserHex(w, -26), wLo = geserHex(w, -58);
    var uid = 'mb_' + sp.bid + '_' + String(w).replace('#', '');
    var h = '<svg viewBox="0 0 200 90" width="100%" height="64" style="display:block;margin:2px auto 4px">';
    h += '<defs>' +
      '<linearGradient id="' + uid + '_b" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="' + wHi + '"/>' +
        '<stop offset="32%" stop-color="' + wMid + '"/>' +
        '<stop offset="56%" stop-color="' + wShade + '"/>' +
        '<stop offset="72%" stop-color="' + wMid + '"/>' +
        '<stop offset="100%" stop-color="' + wLo + '"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + uid + '_g" x1="0" y1="0" x2="0.4" y2="1">' +
        '<stop offset="0%" stop-color="#0f172a"/><stop offset="55%" stop-color="#1e293b"/><stop offset="100%" stop-color="#475569"/>' +
      '</linearGradient>' +
      '</defs>';
    /* Bayangan lantai studio */
    h += '<ellipse cx="100" cy="82" rx="82" ry="5.5" fill="rgba(15,23,42,0.24)"/>';
    /* Ban serep belakang Jimny/G63 */
    if (sp.spare) {
      h += '<rect x="' + sp.spare[0] + '" y="' + sp.spare[1] + '" width="' + sp.spare[2] + '" height="' + sp.spare[3] + '" rx="4" fill="#111827" stroke="#334155" stroke-width="0.8"/>';
      h += '<rect x="' + (sp.spare[0] + 2) + '" y="' + (sp.spare[1] + 4) + '" width="' + (sp.spare[2] - 4) + '" height="' + (sp.spare[3] - 8) + '" rx="2" fill="' + wShade + '"/>';
    }
    /* Rollbar double cabin */
    if (sp.rollbar) h += '<path d="' + sp.rollbar + '" fill="none" stroke="#1e293b" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>';
    /* Roof rail SUV */
    if (sp.roofRail) h += '<rect x="' + sp.roofRail[0] + '" y="' + sp.roofRail[1] + '" width="' + sp.roofRail[2] + '" height="3" rx="1.5" fill="#334155"/>';
    /* Spoiler belakang */
    if (sp.spoiler) h += '<rect x="' + sp.spoiler[0] + '" y="' + sp.spoiler[1] + '" width="' + sp.spoiler[2] + '" height="' + sp.spoiler[3] + '" rx="1.2" fill="#0f172a"/>';
    /* Bodi utama metalik */
    h += '<path d="' + sp.body + '" fill="url(#' + uid + '_b)" stroke="rgba(15,23,42,0.38)" stroke-width="1"/>';
    /* Atap two-tone (Agya GR / Raize / XL7 / Creta / Yaris Cross / Jimny / Air EV / BinguoEV) */
    if (sp.roof) {
      h += '<clipPath id="' + uid + '_c"><path d="' + sp.body + '"/></clipPath>';
      h += '<rect x="0" y="0" width="200" height="23" fill="' + sp.roof + '" clip-path="url(#' + uid + '_c)"/>';
    }
    /* Aksen garnish C-pillar (Creta / Atto 3) */
    if (sp.cPillarAccent) h += '<path d="M 28,37 L 36,20 L 42,20 L 34,37 Z" fill="' + sp.cPillarAccent + '" opacity="0.9"/>';
    /* Kaca gelap reflektif + kilau miring */
    h += '<path d="' + sp.glass + '" fill="url(#' + uid + '_g)" stroke="' + (sp.chromeWin ? '#cbd5e1' : '#0f172a') + '" stroke-width="' + (sp.chromeWin ? '1.4' : '0.9') + '"/>';
    h += '<path d="M 76,22 L 88,22 L 78,38 L 66,38 Z" fill="rgba(255,255,255,0.18)"/>';
    if (sp.floatD) h += '<path d="' + sp.floatD + '" fill="#0f172a" opacity="0.88"/>';
    /* Pilar A/B/C/D */
    if (sp.pillars) sp.pillars.forEach(function (pl) {
      h += '<rect x="' + pl[0] + '" y="' + pl[1] + '" width="' + pl[2] + '" height="' + pl[3] + '" fill="#0f172a"/>';
    });
    /* Garis bak pikap & sekat kabin */
    if (sp.bedLine) h += '<line x1="' + sp.bedLine[0] + '" y1="' + sp.bedLine[1] + '" x2="' + sp.bedLine[2] + '" y2="' + sp.bedLine[3] + '" stroke="rgba(15,23,42,0.35)" stroke-width="1.2"/>';
    if (sp.bedWall) h += '<rect x="' + sp.bedWall[0] + '" y="' + sp.bedWall[1] + '" width="' + sp.bedWall[2] + '" height="' + sp.bedWall[3] + '" fill="' + wLo + '"/>';
    /* Character crease line + chrome trim VIP */
    if (sp.crease) h += '<path d="' + sp.crease + '" fill="none" stroke="rgba(255,255,255,0.48)" stroke-width="1.4"/>';
    else h += '<line x1="34" y1="45" x2="162" y2="43" stroke="rgba(255,255,255,0.34)" stroke-width="1.1"/>';
    if (typeof sp.chromeTrim === 'string') h += '<path d="' + sp.chromeTrim + '" fill="none" stroke="#e2c87d" stroke-width="1.8"/>';
    if (sp.chromeGrille) h += '<rect x="' + sp.chromeGrille[0] + '" y="' + sp.chromeGrille[1] + '" width="' + sp.chromeGrille[2] + '" height="' + sp.chromeGrille[3] + '" rx="1" fill="#cbd5e1"/>';
    /* Cladding overfender SUV / Rocker panel / Footstep */
    if (sp.clad) {
      h += '<path d="M ' + (sp.wb - sp.wr - 4) + ',67 A ' + (sp.wr + 4) + ',' + (sp.wr + 4) + ' 0 0 1 ' + (sp.wb + sp.wr + 4) + ',67" fill="none" stroke="#18181b" stroke-width="3.6"/>';
      h += '<path d="M ' + (sp.wf - sp.wr - 4) + ',67 A ' + (sp.wr + 4) + ',' + (sp.wr + 4) + ' 0 0 1 ' + (sp.wf + sp.wr + 4) + ',67" fill="none" stroke="#18181b" stroke-width="3.6"/>';
    }
    if (sp.step) h += '<rect x="' + sp.step[0] + '" y="' + sp.step[1] + '" width="' + sp.step[2] + '" height="' + sp.step[3] + '" rx="1.2" fill="#18181b"/>';
    if (sp.exhaust) h += '<rect x="' + sp.exhaust[0] + '" y="' + sp.exhaust[1] + '" width="' + sp.exhaust[2] + '" height="' + sp.exhaust[3] + '" rx="1.2" fill="#e2e8f0" stroke="#475569" stroke-width="0.6"/>';
    if (sp.bumperF) h += '<rect x="' + sp.bumperF[0] + '" y="' + sp.bumperF[1] + '" width="' + sp.bumperF[2] + '" height="' + sp.bumperF[3] + '" rx="2" fill="#1e293b"/>';
    /* Spion & handle pintu */
    if (sp.mirror) h += '<ellipse cx="' + sp.mirror[0] + '" cy="' + sp.mirror[1] + '" rx="4.2" ry="2.6" fill="' + wLo + '" stroke="#0f172a" stroke-width="0.7"/>';
    if (sp.handles) sp.handles.forEach(function (hd) {
      h += '<rect x="' + hd[0] + '" y="' + hd[1] + '" width="6.5" height="2" rx="1" fill="' + (sp.chromeWin ? '#e2e8f0' : '#1e293b') + '"/>';
    });
    /* Lampu depan LED / DRL & lampu belakang ruby */
    if (sp.drlBar) h += '<rect x="' + sp.drlBar[0] + '" y="' + sp.drlBar[1] + '" width="' + sp.drlBar[2] + '" height="' + sp.drlBar[3] + '" rx="1.5" fill="#e0f2fe" stroke="#38bdf8" stroke-width="0.6"/>';
    if (sp.head) h += '<rect x="' + sp.head[0] + '" y="' + sp.head[1] + '" width="' + sp.head[2] + '" height="' + sp.head[3] + '" rx="2" fill="#e0f2fe" stroke="#64748b" stroke-width="0.6"/>';
    if (sp.tail) h += '<rect x="' + sp.tail[0] + '" y="' + sp.tail[1] + '" width="' + sp.tail[2] + '" height="' + sp.tail[3] + '" rx="1.6" fill="#dc2626" stroke="#7f1d1d" stroke-width="0.6"/>';
    /* Roda & velg OEM */
    h += svgRoda(sp.wb, sp.wy, sp.wr, sp.rim, sp.caliper);
    h += svgRoda(sp.wf, sp.wy, sp.wr, sp.rim, sp.caliper);
    h += '</svg>';
    return h;
  }

  /* Preview HTML untuk Dealer Mobil, Agen Bekas, dan Garasi */
  function htmlPreview(id, bentuk, warnaKustom) {
    var bid = String(id || '').replace(/-bekas$/, '');
    var f = FOTO_MAP[bid];
    if (f && !warnaKustom) {
      return '<div class="mobil-prev" style="height:64px;display:flex;align-items:center;justify-content:center;margin:2px auto 4px;position:relative">' +
        '<img src="' + f.src + '" alt="' + bid + '" loading="lazy" style="max-width:100%;max-height:60px;object-fit:contain;filter:drop-shadow(0 4px 3px rgba(15,23,42,.28))">' +
        '</div>';
    }
    return buatSvgBlueprint(bid, bentuk, warnaKustom);
  }

  /* ---------- 5. RENDER LIVE CANVAS 2D (Jalan Raya, Garasi, Halaman Rumah, Travel) ---------- */
  function parsePathKeCanvas(cx, d) {
    /* Parser mini SVG path (M, L, C, Z) untuk render mulus 120 FPS di semua browser & headless test */
    var tok = d.match(/[MLCZmlcz]|-?\d*\.?\d+/g);
    if (!tok) return;
    var i = 0, cmd = 'M';
    cx.beginPath();
    while (i < tok.length) {
      if (/^[MLCZmlcz]$/.test(tok[i])) { cmd = tok[i++]; if (cmd === 'Z' || cmd === 'z') cx.closePath(); continue; }
      if (cmd === 'M') { cx.moveTo(+tok[i++], +tok[i++]); cmd = 'L'; }
      else if (cmd === 'L') { cx.lineTo(+tok[i++], +tok[i++]); }
      else if (cmd === 'C') {
        cx.bezierCurveTo(+tok[i++], +tok[i++], +tok[i++], +tok[i++], +tok[i++], +tok[i++]);
      } else { i++; }
    }
  }

  function gambarRodaCanvas(cx, rx, ry, r, pt, jenis, caliper) {
    /* Arch bayangan ban */
    cx.fillStyle = '#090d16';
    cx.beginPath(); cx.arc(rx, ry, r + 1.5, 0, Math.PI * 2); cx.fill();
    /* Ban karet */
    cx.fillStyle = '#181c24';
    cx.beginPath(); cx.arc(rx, ry, r, 0, Math.PI * 2); cx.fill();
    /* Velg */
    if (jenis === 'steel') {
      cx.fillStyle = '#94a3b8';
      cx.beginPath(); cx.arc(rx, ry, r * 0.62, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = '#1e293b';
      for (var i = 0; i < 8; i++) {
        var a = pt + i * Math.PI / 4;
        cx.beginPath(); cx.arc(rx + Math.cos(a) * r * 0.42, ry + Math.sin(a) * r * 0.42, 1.3, 0, Math.PI * 2); cx.fill();
      }
    } else if (jenis === 'retro') {
      cx.fillStyle = '#f8fafc';
      cx.beginPath(); cx.arc(rx, ry, r * 0.66, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = '#94a3b8';
      cx.beginPath(); cx.arc(rx, ry, r * 0.30, 0, Math.PI * 2); cx.fill();
    } else {
      cx.fillStyle = (jenis === 'sport' || jenis === 'aero') ? '#334155' : '#1e293b';
      cx.beginPath(); cx.arc(rx, ry, r * 0.68, 0, Math.PI * 2); cx.fill();
      if (caliper) {
        cx.fillStyle = caliper;
        cx.fillRect(rx + r * 0.16, ry - r * 0.24, 3.2, 5.2);
      }
      var n = jenis === 'alloy10' ? 10 : jenis === 'offroad' ? 6 : 5;
      cx.strokeStyle = jenis === 'sport' ? '#e2e8f0' : '#cbd5e1';
      cx.lineWidth = n > 6 ? 1.3 : 2.1;
      cx.beginPath();
      for (var j = 0; j < n; j++) {
        var ang = pt + j * (Math.PI * 2 / n);
        cx.moveTo(rx, ry);
        cx.lineTo(rx + Math.cos(ang) * r * 0.62, ry + Math.sin(ang) * r * 0.62);
      }
      cx.stroke();
      cx.fillStyle = '#f8fafc';
      cx.beginPath(); cx.arc(rx, ry, 2.4, 0, Math.PI * 2); cx.fill();
    }
  }

  function gambarCanvas(cx, id, bentuk, pt, lampuNyala, warnaKustom) {
    var bid = String(id || '').replace(/-bekas$/, '');
    var gerak = !!(pt && Math.abs(pt) > 0.001);
    var bob = gerak ? Math.sin(pt * 2.2) * 0.65 : 0;

    /* 1. Prioritas utama: Foto-Sprite Asli Transparan PNG (12+ model) */
    var ft = !warnaKustom ? muatFoto(bid) : null;
    if (ft && ft.img) {
      var info = ft.info, wDraw = info.w;
      var hDraw = wDraw * (ft.img.naturalHeight / Math.max(1, ft.img.naturalWidth));
      var x0 = -wDraw * 0.5, y0 = -hDraw + 2 + bob;
      /* Bayangan lembut menyatu dengan aspal */
      cx.fillStyle = 'rgba(0,0,0,0.44)';
      cx.beginPath(); cx.ellipse(0, 2, wDraw * 0.48, 5.5, 0, 0, Math.PI * 2); cx.fill();
      /* Gambar mobil foto asli */
      cx.drawImage(ft.img, x0, y0, wDraw, hDraw);
      /* Efek kilau rotasi velg halus saat mobil melaju */
      if (gerak) {
        [x0 + wDraw * info.wb, x0 + wDraw * info.wf].forEach(function (wx) {
          var wy = y0 + hDraw * info.wy, rSpin = info.wr * 0.58;
          cx.save();
          cx.strokeStyle = 'rgba(255,255,255,0.28)';
          cx.lineWidth = 1.4;
          cx.beginPath();
          for (var s = 0; s < 3; s++) {
            var a = pt * 1.4 + s * (Math.PI * 2 / 3);
            cx.moveTo(wx - Math.cos(a) * rSpin, wy - Math.sin(a) * rSpin);
            cx.lineTo(wx + Math.cos(a) * rSpin, wy + Math.sin(a) * rSpin);
          }
          cx.stroke();
          cx.restore();
        });
      }
      /* Sorotan lampu depan saat sore/malam */
      if (lampuNyala) {
        var hx = x0 + wDraw - 2, hy = y0 + hDraw * 0.56;
        var gr = cx.createRadialGradient(hx, hy, 0, hx + 14, hy, 58);
        gr.addColorStop(0, 'rgba(224,242,254,0.68)');
        gr.addColorStop(1, 'rgba(224,242,254,0)');
        cx.fillStyle = gr;
        cx.beginPath();
        cx.moveTo(hx, hy - 6); cx.lineTo(hx + 66, hy - 22); cx.lineTo(hx + 66, hy + 24); cx.lineTo(hx, hy + 8);
        cx.closePath(); cx.fill();
      }
      return true;
    }

    /* 2. Blueprint Bezier Real-World Spesifik Model (46 model + fallback instan sebelum PNG selesai dimuat) */
    var sp = ambilSpek(bid, bentuk);
    var w = warnaKustom || sp.w || '#cbd5e1';
    var skala = sp.a === 'micro_ev' ? 0.62 : sp.a === 'hatch_mod' || sp.a === 'retro_ev' ? 0.63 : (sp.a === 'big_suv' || sp.a === 'g63' || sp.a === 'luxvan' || sp.a === 'hiace' || sp.a === 'staria') ? 0.72 : 0.67;

    /* Bayangan jalan */
    cx.fillStyle = 'rgba(0,0,0,0.44)';
    cx.beginPath(); cx.ellipse(0, 2, 86 * skala, 5.5, 0, 0, Math.PI * 2); cx.fill();

    cx.save();
    cx.translate(-100 * skala, -82 * skala + bob);
    cx.scale(skala, skala);

    /* Gradien cat metalik 5-stop */
    var bg = cx.createLinearGradient(0, 12, 0, 70);
    bg.addColorStop(0, geserHex(w, 48));
    bg.addColorStop(0.32, geserHex(w, 10));
    bg.addColorStop(0.56, geserHex(w, -26));
    bg.addColorStop(0.72, geserHex(w, 12));
    bg.addColorStop(1, geserHex(w, -58));

    var gl = cx.createLinearGradient(0, 14, 0, 42);
    gl.addColorStop(0, '#090f1a'); gl.addColorStop(0.58, '#1e293b'); gl.addColorStop(1, '#475569');

    /* Ban serep belakang / Rollbar / Roof rail / Spoiler */
    if (sp.spare) {
      cx.fillStyle = '#111827'; cx.fillRect(sp.spare[0], sp.spare[1], sp.spare[2], sp.spare[3]);
      cx.fillStyle = geserHex(w, -20); cx.fillRect(sp.spare[0] + 2, sp.spare[1] + 4, sp.spare[2] - 4, sp.spare[3] - 8);
    }
    if (sp.rollbar) {
      cx.strokeStyle = '#1e293b'; cx.lineWidth = 3.6;
      parsePathKeCanvas(cx, sp.rollbar); cx.stroke();
    }
    if (sp.roofRail) { cx.fillStyle = '#334155'; cx.fillRect(sp.roofRail[0], sp.roofRail[1], sp.roofRail[2], 3); }
    if (sp.spoiler) { cx.fillStyle = '#0f172a'; cx.fillRect(sp.spoiler[0], sp.spoiler[1], sp.spoiler[2], sp.spoiler[3]); }

    /* Bodi utama */
    parsePathKeCanvas(cx, sp.body);
    cx.fillStyle = bg; cx.fill();
    cx.strokeStyle = 'rgba(15,23,42,0.36)'; cx.lineWidth = 1.1; cx.stroke();

    /* Atap two-tone */
    if (sp.roof) {
      cx.save();
      parsePathKeCanvas(cx, sp.body);
      cx.clip();
      cx.fillStyle = sp.roof;
      cx.fillRect(0, 0, 200, 23);
      cx.restore();
    }
    if (sp.cPillarAccent) {
      cx.fillStyle = sp.cPillarAccent;
      cx.beginPath(); cx.moveTo(28, 37); cx.lineTo(36, 20); cx.lineTo(42, 20); cx.lineTo(34, 37); cx.closePath(); cx.fill();
    }

    /* Kaca gelap + refleksi langit */
    parsePathKeCanvas(cx, sp.glass);
    cx.fillStyle = gl; cx.fill();
    if (sp.chromeWin) { cx.strokeStyle = '#cbd5e1'; cx.lineWidth = 1.5; cx.stroke(); }
    cx.fillStyle = 'rgba(255,255,255,0.20)';
    cx.beginPath(); cx.moveTo(76, 22); cx.lineTo(88, 22); cx.lineTo(78, 38); cx.lineTo(66, 38); cx.closePath(); cx.fill();

    if (sp.floatD) { parsePathKeCanvas(cx, sp.floatD); cx.fillStyle = '#0f172a'; cx.fill(); }
    if (sp.pillars) {
      cx.fillStyle = '#0f172a';
      sp.pillars.forEach(function (pl) { cx.fillRect(pl[0], pl[1], pl[2], pl[3]); });
    }
    if (sp.bedLine) {
      cx.strokeStyle = 'rgba(15,23,42,0.38)'; cx.lineWidth = 1.3;
      cx.beginPath(); cx.moveTo(sp.bedLine[0], sp.bedLine[1]); cx.lineTo(sp.bedLine[2], sp.bedLine[3]); cx.stroke();
    }
    if (sp.bedWall) { cx.fillStyle = geserHex(w, -50); cx.fillRect(sp.bedWall[0], sp.bedWall[1], sp.bedWall[2], sp.bedWall[3]); }

    /* Garis lekukan bodi & aksen krom VIP */
    if (sp.crease) {
      cx.strokeStyle = 'rgba(255,255,255,0.52)'; cx.lineWidth = 1.4;
      parsePathKeCanvas(cx, sp.crease); cx.stroke();
    } else {
      cx.strokeStyle = 'rgba(255,255,255,0.36)'; cx.lineWidth = 1.1;
      cx.beginPath(); cx.moveTo(34, 45); cx.lineTo(162, 43); cx.stroke();
    }
    if (typeof sp.chromeTrim === 'string') {
      cx.strokeStyle = '#e2c87d'; cx.lineWidth = 2;
      parsePathKeCanvas(cx, sp.chromeTrim); cx.stroke();
    }
    if (sp.chromeGrille) { cx.fillStyle = '#cbd5e1'; cx.fillRect(sp.chromeGrille[0], sp.chromeGrille[1], sp.chromeGrille[2], sp.chromeGrille[3]); }

    /* Cladding overfender SUV, step, bumper, spion, handle */
    if (sp.clad) {
      cx.strokeStyle = '#18181b'; cx.lineWidth = 3.8;
      cx.beginPath(); cx.arc(sp.wb, 67, sp.wr + 4, Math.PI, 0); cx.stroke();
      cx.beginPath(); cx.arc(sp.wf, 67, sp.wr + 4, Math.PI, 0); cx.stroke();
    }
    if (sp.step) { cx.fillStyle = '#18181b'; cx.fillRect(sp.step[0], sp.step[1], sp.step[2], sp.step[3]); }
    if (sp.exhaust) { cx.fillStyle = '#e2e8f0'; cx.fillRect(sp.exhaust[0], sp.exhaust[1], sp.exhaust[2], sp.exhaust[3]); }
    if (sp.bumperF) { cx.fillStyle = '#1e293b'; cx.fillRect(sp.bumperF[0], sp.bumperF[1], sp.bumperF[2], sp.bumperF[3]); }
    if (sp.mirror) {
      cx.fillStyle = geserHex(w, -48);
      cx.beginPath(); cx.ellipse(sp.mirror[0], sp.mirror[1], 4.2, 2.6, 0, 0, Math.PI * 2); cx.fill();
    }
    if (sp.handles) {
      cx.fillStyle = sp.chromeWin ? '#e2e8f0' : '#1e293b';
      sp.handles.forEach(function (hd) { cx.fillRect(hd[0], hd[1], 6.5, 2); });
    }

    /* Lampu depan / DRL & lampu rem */
    if (sp.drlBar) { cx.fillStyle = '#e0f2fe'; cx.fillRect(sp.drlBar[0], sp.drlBar[1], sp.drlBar[2], sp.drlBar[3]); }
    if (sp.head) { cx.fillStyle = '#e0f2fe'; cx.fillRect(sp.head[0], sp.head[1], sp.head[2], sp.head[3]); }
    if (sp.tail) { cx.fillStyle = '#dc2626'; cx.fillRect(sp.tail[0], sp.tail[1], sp.tail[2], sp.tail[3]); }

    /* Roda hidup berputar */
    gambarRodaCanvas(cx, sp.wb, sp.wy, sp.wr, pt, sp.rim, sp.caliper);
    gambarRodaCanvas(cx, sp.wf, sp.wy, sp.wr, pt, sp.rim, sp.caliper);

    /* Sorot lampu malam */
    if (lampuNyala) {
      var lx = sp.head ? (sp.head[0] + sp.head[2]) : 186;
      var ly = sp.head ? (sp.head[1] + sp.head[3] * 0.5) : 48;
      var grL = cx.createRadialGradient(lx, ly, 0, lx + 20, ly, 86);
      grL.addColorStop(0, 'rgba(224,242,254,0.68)');
      grL.addColorStop(1, 'rgba(224,242,254,0)');
      cx.fillStyle = grL;
      cx.beginPath(); cx.moveTo(lx, ly - 8); cx.lineTo(lx + 92, ly - 32); cx.lineTo(lx + 92, ly + 32); cx.lineTo(lx, ly + 10); cx.closePath(); cx.fill();
    }

    cx.restore();
    return true;
  }

  g.KK_MOBIL_DESAIN = {
    FOTO_MAP: FOTO_MAP,
    SPEK: SPEK,
    punyaFoto: function (id) { return !!FOTO_MAP[String(id || '').replace(/-bekas$/, '')]; },
    htmlPreview: htmlPreview,
    gambarCanvas: gambarCanvas,
    preload: preloadSemua
  };
})(typeof window !== 'undefined' ? window : this);
