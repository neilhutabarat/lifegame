/* motor_desain.js — P81: Desain 100% Kode Asli untuk SEMUA 65 Model Motor (Dealer, Agen Bekas, Garasi, Mangkal, & Narik 100% Identik + Animasi Live) */
(function (g) {
  'use strict';

  function geserHex(hex, delta) {
    var s = String(hex || '#dc2626').replace('#', '');
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    var r = Math.max(0, Math.min(255, parseInt(s.substr(0, 2), 16) + delta));
    var gr = Math.max(0, Math.min(255, parseInt(s.substr(2, 2), 16) + delta));
    var b = Math.max(0, Math.min(255, parseInt(s.substr(4, 2), 16) + delta));
    return '#' + ('0' + r.toString(16)).slice(-2) + ('0' + gr.toString(16)).slice(-2) + ('0' + b.toString(16)).slice(-2);
  }

  /* ---------- 1. ARCHETYPE DESAIN ASLI MOTOR (VIEWBOX 0..150 x 0..86, HADAP KANAN) ----------
     Semua proporsi & kurva Bezier dibuat menyerupai wujud asli:
     skutik, vario, aerox, retro, vespa, vespa946, maxi, adv, ev, bebek, ayago, trail, klasik, naked, sport, superbike, cruiser */
  var ARCH = {
    skutik: {
      body: 'M 22,42 L 62,45 L 70,61 L 96,61 L 103,32 C 110,33 119,37 121,44 L 114,62 L 42,62 Z',
      seat: 'M 25,40 C 38,36 58,37 66,43 L 64,47 L 25,44 Z',
      headCap: 'M 97,22 C 102,20 110,21 112,26 L 110,33 L 98,32 Z',
      fender: 'M 102,51 C 112,48 122,50 127,56 L 122,58 C 116,54 108,53 103,55 Z',
      deck: [65, 57, 36, 6], fork: [115, 63, 104, 30], shock: [35, 62, 42, 45], exhaust: [22, 57, 56, 63],
      wb: 36, wf: 115, wy: 64, wr: 15, head: [115, 38, 7, 7], tail: [19, 41, 5, 6], mirror: [102, 16], gaya: 'skutik'
    },
    vario: {
      body: 'M 18,41 L 60,44 L 68,61 L 97,61 L 104,28 C 114,31 124,36 125,45 L 117,62 L 40,62 Z',
      seat: 'M 22,39 C 38,34 57,36 66,43 L 63,47 L 22,43 Z',
      headCap: 'M 96,21 L 112,23 L 110,30 L 97,29 Z',
      visor: 'M 106,22 L 116,24 L 113,15 L 104,17 Z',
      fender: 'M 102,49 C 112,46 124,49 129,56 L 123,58 C 117,53 109,52 103,54 Z',
      deck: [64, 57, 38, 6], fork: [116, 63, 104, 29], shock: [35, 62, 42, 44], exhaust: [20, 55, 58, 63],
      wb: 36, wf: 116, wy: 64, wr: 15.5, head: [118, 39, 7, 6], drl: 'M 113,34 L 123,37', tail: [16, 40, 5, 6], mirror: [101, 15], gaya: 'skutik'
    },
    aerox: {
      body: 'M 16,38 L 62,43 L 74,52 L 96,49 L 106,28 C 117,31 126,37 127,46 L 118,60 L 42,60 Z',
      seat: 'M 20,36 C 36,31 58,34 68,42 L 64,46 L 20,40 Z',
      headCap: 'M 98,21 L 113,24 L 110,30 L 98,29 Z',
      visor: 'M 108,22 L 118,24 L 116,15 L 107,17 Z',
      fender: 'M 103,49 C 113,46 125,49 130,56 L 124,58 C 118,53 110,52 104,54 Z',
      fork: [117, 63, 106, 29], shock: [34, 62, 40, 42], tabungShock: true, exhaust: [18, 52, 56, 63],
      wb: 36, wf: 117, wy: 64, wr: 16, head: [119, 39, 7.5, 6], drl: 'M 114,34 L 124,37', tail: [14, 37, 5, 5], mirror: [103, 15], gaya: 'maxi'
    },
    retro: {
      body: 'M 22,50 C 20,38 34,34 58,38 L 68,61 L 96,61 L 100,32 C 111,32 120,38 119,49 L 114,62 L 38,62 Z',
      seat: 'M 25,38 C 38,34 58,35 67,41 L 64,45 L 25,43 Z',
      headCap: 'M 97,22 C 103,19 112,21 114,27 C 113,32 104,33 98,31 Z',
      fender: 'M 102,52 C 112,48 122,50 126,57 L 120,59 C 115,55 108,54 103,56 Z',
      deck: [64, 57, 36, 6], fork: [114, 64, 105, 30], shock: [36, 62, 42, 46], exhaust: [22, 58, 54, 63],
      wb: 37, wf: 114, wy: 65, wr: 14, roundHead: [116, 28, 5], tail: [19, 44, 5, 6], seatCol: '#6b4226', mirror: [102, 16], gaya: 'skutik'
    },
    vespa: {
      body: 'M 18,52 C 16,36 32,33 60,39 L 70,62 L 96,62 L 98,30 C 110,30 119,38 117,50 L 112,63 L 36,63 Z',
      seat: 'M 23,37 C 38,33 58,35 68,41 L 65,45 L 23,43 Z',
      headCap: 'M 95,22 C 102,19 112,20 115,27 C 114,32 104,33 96,31 Z',
      fender: 'M 100,52 C 111,47 123,49 127,57 L 120,60 C 114,55 107,54 101,56 Z',
      deck: [65, 58, 34, 5], fork: [114, 65, 104, 30], shock: [36, 63, 42, 46], exhaust: [22, 58, 54, 63],
      wb: 36, wf: 114, wy: 65, wr: 14, roundHead: [115, 27, 5.2], chromeLis: true, tail: [16, 44, 5, 6.5], seatCol: '#5c3a21', mirror: [102, 15], gaya: 'skutik'
    },
    vespa946: {
      body: 'M 20,48 C 24,38 42,36 62,43 L 72,62 L 97,62 L 99,30 C 110,30 119,38 117,50 L 112,63 L 40,63 Z',
      seat: 'M 28,34 C 42,33 58,36 67,41 L 64,44 C 52,40 38,39 28,39 Z',
      headCap: 'M 96,21 C 103,19 112,20 115,27 L 111,31 L 97,30 Z',
      fender: 'M 101,51 C 111,47 123,49 127,57 L 120,59 Z',
      fork: [114, 65, 104, 30], shock: [38, 63, 45, 48], exhaust: [24, 58, 54, 63],
      wb: 36, wf: 114, wy: 65, wr: 14, roundHead: [115, 27, 5], chromeLis: true, tail: [19, 44, 5, 5], seatCol: '#7c2d12', mirror: [102, 15], gaya: 'skutik'
    },
    maxi: {
      body: 'M 14,43 L 64,45 L 78,55 L 98,51 L 108,29 C 120,31 130,38 130,49 L 121,63 L 36,63 Z',
      seat: 'M 18,40 C 36,34 58,36 70,45 L 66,49 L 18,45 Z',
      visor: 'M 104,28 L 118,31 L 112,13 L 102,16 Z',
      fender: 'M 104,50 C 114,47 126,49 131,56 L 124,58 Z',
      fork: [119, 63, 108, 30], shock: [33, 62, 40, 44], tabungShock: true, exhaust: [16, 54, 58, 63],
      wb: 34, wf: 119, wy: 64, wr: 15.5, head: [122, 41, 8, 6.5], drl: 'M 116,35 L 128,39', tail: [12, 41, 6, 6], mirror: [105, 18], gaya: 'maxi'
    },
    adv: {
      body: 'M 14,40 L 62,43 L 76,53 L 98,49 L 106,27 C 119,29 129,36 130,46 L 120,61 L 38,61 Z',
      seat: 'M 18,38 C 36,33 58,35 69,43 L 65,47 L 18,42 Z',
      visor: 'M 103,26 L 116,28 L 110,8 L 100,11 Z',
      fender: 'M 105,46 C 116,44 128,47 132,53 L 125,55 Z',
      fork: [120, 62, 108, 28], shock: [34, 61, 40, 42], tabungShock: true, exhaust: [16, 51, 56, 62],
      wb: 34, wf: 120, wy: 63, wr: 16, head: [122, 38, 8, 6], drl: 'M 116,33 L 128,37', tail: [12, 39, 5, 6], mirror: [104, 15], gaya: 'maxi'
    },
    ev: {
      body: 'M 22,42 L 62,44 L 70,60 L 98,60 L 104,30 C 113,31 121,37 121,46 L 114,61 L 40,61 Z',
      seat: 'M 25,39 C 39,36 58,37 67,43 L 64,46 L 25,43 Z',
      headCap: 'M 98,21 L 113,23 L 111,30 L 99,29 Z',
      fender: 'M 103,50 C 113,47 123,50 127,56 L 121,58 Z',
      deck: [65, 56, 36, 6], fork: [115, 63, 105, 29], shock: [35, 62, 41, 45], ev: true,
      wb: 36, wf: 115, wy: 64, wr: 14.5, head: [116, 37, 7, 5], drl: 'M 111,33 L 121,35', tail: [19, 41, 5, 5], mirror: [102, 16], gaya: 'skutik'
    },
    bebek: {
      body: 'M 20,43 L 64,45 L 78,54 L 94,46 L 102,30 L 116,34 L 112,54 L 84,60 L 42,56 Z',
      seat: 'M 24,40 C 40,37 59,38 68,43 L 66,46 L 24,44 Z',
      headCap: 'M 97,22 L 112,24 L 110,31 L 98,30 Z',
      fender: 'M 103,47 C 113,44 124,47 128,53 L 122,55 Z',
      fork: [117, 63, 104, 29], shock: [34, 62, 40, 44], exhaust: [18, 56, 64, 63], engine: [66, 52, 22, 13],
      wb: 35, wf: 117, wy: 64, wr: 16, head: [108, 25, 6, 5.5], tail: [18, 42, 5, 5.5], mirror: [102, 16], gaya: 'skutik'
    },
    ayago: {
      body: 'M 16,39 L 62,43 L 86,44 L 100,40 L 106,54 L 78,59 L 40,51 Z',
      seat: 'M 21,37 C 38,35 58,37 68,42 L 65,45 L 21,41 Z',
      headCap: 'M 102,24 L 118,28 L 114,37 L 101,34 Z',
      fender: 'M 104,47 C 114,44 125,47 129,53 L 123,55 Z',
      fork: [118, 63, 105, 25], shock: [52, 58, 58, 44], exhaust: [18, 54, 66, 62], engine: [72, 48, 22, 16],
      wb: 34, wf: 118, wy: 64, wr: 16, head: [114, 28, 6.5, 6], tail: [14, 38, 5, 5], mirror: [104, 17], gaya: 'klasik'
    },
    trail: {
      body: 'M 12,34 L 54,38 L 76,34 L 104,32 L 108,45 L 82,51 L 46,45 Z',
      seat: 'M 22,34 L 74,35 L 74,40 L 22,39 Z',
      headCap: 'M 98,21 L 112,24 L 110,33 L 98,31 Z',
      fender: 'M 104,35 C 116,34 128,36 135,40 L 129,42 C 121,39 112,39 104,40 Z',
      fork: [120, 61, 103, 22], shock: [48, 56, 56, 40], exhaust: [16, 40, 60, 48], engine: [66, 45, 24, 16],
      wb: 33, wf: 120, wy: 62, wr: 17.5, rim: 'spoke', head: [108, 24, 6, 6], tail: [11, 33, 4.5, 4], mirror: [101, 14], gaya: 'trail'
    },
    klasik: {
      body: 'M 64,34 C 72,27 94,27 102,34 L 100,45 L 66,45 Z',
      seat: 'M 24,38 L 68,38 L 68,45 L 24,45 Z',
      fender: 'M 104,47 C 114,44 125,47 129,53 L 123,55 Z',
      fork: [118, 63, 103, 26], shock: [35, 62, 42, 44], exhaust: [16, 60, 74, 63], engine: [62, 45, 28, 18],
      wb: 35, wf: 118, wy: 64, wr: 16, rim: 'spoke', roundHead: [111, 31, 5.5], seatCol: '#3e2723', tail: [20, 40, 5, 5], mirror: [101, 17], gaya: 'klasik'
    },
    naked: {
      body: 'M 16,35 L 54,42 L 66,31 C 78,27 98,29 108,39 L 102,52 L 64,52 L 42,46 Z',
      seat: 'M 22,35 L 64,40 L 62,45 L 20,39 Z',
      headCap: 'M 105,28 L 118,32 L 115,40 L 104,37 Z',
      fender: 'M 105,47 C 115,44 126,47 130,54 L 124,56 Z',
      fork: [119, 63, 105, 27], usdGold: true, shock: [52, 57, 60, 44], exhaust: [22, 54, 66, 62], engine: [64, 46, 28, 17],
      wb: 34, wf: 119, wy: 64, wr: 16, head: [114, 31, 6, 6], tail: [14, 34, 5, 4.5], mirror: [104, 19], gaya: 'sport'
    },
    sport: {
      body: 'M 14,35 L 54,42 L 68,31 C 80,27 98,29 108,34 L 128,37 L 118,59 L 70,59 L 44,47 Z',
      seat: 'M 20,34 L 62,40 L 60,44 L 18,38 Z',
      visor: 'M 103,31 L 124,36 L 113,22 L 101,25 Z',
      fender: 'M 106,48 C 116,45 127,48 131,55 L 124,57 Z',
      fork: [120, 63, 109, 32], usdGold: true, shock: [52, 57, 60, 44], exhaust: [20, 52, 66, 62],
      wb: 33, wf: 120, wy: 64, wr: 16, head: [121, 38, 7, 5], tail: [12, 34, 5, 4], mirror: [110, 20], gaya: 'sport'
    },
    superbike: {
      body: 'M 12,32 L 54,42 L 68,29 C 82,25 100,28 112,33 L 132,37 L 120,60 L 68,60 L 42,46 Z',
      seat: 'M 18,32 L 62,40 L 60,44 L 16,36 Z',
      visor: 'M 104,30 L 127,36 L 115,20 L 102,24 Z',
      fender: 'M 107,48 C 118,45 129,48 133,55 L 126,57 Z',
      winglet: [118, 41, 12, 3.2],
      fork: [121, 63, 110, 31], usdGold: true, shock: [52, 57, 60, 43], exhaust: [18, 50, 66, 61],
      wb: 32, wf: 121, wy: 64, wr: 16.5, head: [124, 38, 8, 4.5], tail: [10, 31, 5, 4], mirror: [112, 19], gaya: 'sport'
    },
    cruiser: {
      body: 'M 58,42 C 66,31 94,30 104,40 L 100,52 L 60,52 Z',
      seat: 'M 28,46 C 40,44 54,44 62,48 L 60,53 L 28,51 Z',
      fender: 'M 108,49 C 118,46 129,48 133,55 L 127,57 Z',
      fork: [123, 63, 102, 29], shock: [46, 60, 56, 48], exhaust: [22, 46, 86, 51], engine: [60, 48, 32, 18],
      wb: 34, wf: 123, wy: 64, wr: 16.5, head: [111, 35, 8, 5.5], tail: [24, 46, 5, 4.5], mirror: [100, 22], gaya: 'klasik'
    }
  };

  /* ---------- 2. SPESIFIKASI PER MODEL (SEMUA 65 MOTOR DI N.motor + MOTOR BEKAS) ---------- */
  var SPEK = {
    dazz:        { a: 'skutik',    w: '#dc2626' },
    revo:        { a: 'bebek',     w: '#1f2937', livery: '#dc2626' },
    mio:         { a: 'skutik',    w: '#2563eb', livery: '#facc15' },
    beat:        { a: 'skutik',    w: '#dc2626', livery: '#f8fafc' },
    gear:        { a: 'skutik',    w: '#0ea5e9', livery: '#1e293b' },
    supra:       { a: 'bebek',     w: '#18181b', livery: '#ef4444' },
    scoopy:      { a: 'retro',     w: '#f5f0e6', rimCol: '#c9a654' },
    vario:       { a: 'vario',     w: '#b91c1c', livery: '#f8fafc' },
    mxking:      { a: 'ayago',     w: '#1d4ed8', livery: '#facc15' },
    icon:        { a: 'ev',        w: '#f8fafc', livery: '#38bdf8' },
    aerox:       { a: 'aerox',     w: '#1e3a8a', livery: '#38bdf8', rimCol: '#f97316' },
    vario160:    { a: 'vario',     w: '#1f2937', livery: '#d4a843', rimCol: '#c9a654' },
    vario160_27: { a: 'vario',     w: '#0f172a', livery: '#d4a843', rimCol: '#c9a654' },
    nmax:        { a: 'maxi',      w: '#1f2937', rimCol: '#c9a654' },
    nmaxturbo:   { a: 'maxi',      w: '#4a3f35', livery: '#d4a843', rimCol: '#c9a654' },
    nmax_27:     { a: 'maxi',      w: '#1e293b', livery: '#38bdf8', rimCol: '#c9a654' },
    pcx160:      { a: 'maxi',      w: '#f8fafc', rimCol: '#c9a654' },
    pcxroadsync: { a: 'maxi',      w: '#7f1d1d', rimCol: '#c9a654' },
    pcx160_28:   { a: 'maxi',      w: '#e2e8f0', livery: '#38bdf8', rimCol: '#c9a654' },
    nex2:        { a: 'skutik',    w: '#334155', livery: '#38bdf8' },
    address:     { a: 'skutik',    w: '#1e293b', livery: '#cbd5e1' },
    genio:       { a: 'retro',     w: '#27272a', seatCol: '#6b4226' },
    fazzio:      { a: 'retro',     w: '#38bdf8', seatCol: '#1f2937' },
    lexi155:     { a: 'vario',     w: '#334155', livery: '#94a3b8' },
    filano:      { a: 'retro',     w: '#d6d3d1', seatCol: '#6b4226', rimCol: '#94a3b8' },
    stylo160:    { a: 'retro',     w: '#14532d', seatCol: '#78350f', rimCol: '#c9a654' },
    adv160:      { a: 'adv',       w: '#991b1b', livery: '#18181b', rimCol: '#c9a654' },
    vespa:       { a: 'vespa',     w: '#f8fafc' },
    vespasprint: { a: 'vespa',     w: '#eab308', seatCol: '#18181b', rimCol: '#18181b' },
    vespagts:    { a: 'vespa',     w: '#334155', livery: '#facc15', seatCol: '#18181b' },
    vespa946:    { a: 'vespa946',  w: '#f5f0e1', livery: '#15803d', rimCol: '#d4a843' },
    xmax250:     { a: 'maxi',      w: '#374151', livery: '#d4a843', rimCol: '#c9a654' },
    forza250:    { a: 'maxi',      w: '#1e293b', livery: '#cbd5e1', rimCol: '#c9a654' },
    aeroxalpha:  { a: 'aerox',     w: '#dc2626', livery: '#f8fafc', rimCol: '#d4a843' },
    em1e:        { a: 'ev',        w: '#e2e8f0', livery: '#0ea5e9' },
    cuve:        { a: 'ev',        w: '#1e293b', livery: '#38bdf8' },
    alvacervo:   { a: 'aerox',     w: '#f97316', livery: '#18181b', ev: true },
    satriafu:    { a: 'ayago',     w: '#1d4ed8', livery: '#ef4444' },
    cb150r:      { a: 'naked',     w: '#991b1b', livery: '#18181b' },
    klx150:      { a: 'trail',     w: '#16a34a', livery: '#f8fafc' },
    w175:        { a: 'klasik',    w: '#14532d', livery: '#d4a843' },
    rxking:      { a: 'klasik',    w: '#18181b', livery: '#dc2626' },
    crf150l:     { a: 'trail',     w: '#dc2626', livery: '#f8fafc', usdGold: true },
    wr155r:      { a: 'trail',     w: '#1d4ed8', livery: '#f8fafc' },
    gsxr150:     { a: 'sport',     w: '#2563eb', livery: '#facc15' },
    cbr150:      { a: 'sport',     w: '#dc2626', livery: '#1e293b' },
    r15:         { a: 'sport',     w: '#1d4ed8', livery: '#0f172a' },
    r15m:        { a: 'sport',     w: '#cbd5e1', livery: '#1d4ed8' },
    mt25:        { a: 'naked',     w: '#1e293b', livery: '#06b6d4', rimCol: '#06b6d4' },
    cbr250:      { a: 'sport',     w: '#dc2626', livery: '#18181b' },
    cbr250sp:    { a: 'sport',     w: '#b91c1c', livery: '#f8fafc', rimCol: '#c9a654' },
    ninja250:    { a: 'sport',     w: '#16a34a', livery: '#f8fafc' },
    r25:         { a: 'sport',     w: '#1d4ed8', livery: '#f8fafc' },
    zx25r:       { a: 'sport',     w: '#16a34a', livery: '#18181b' },
    zx25rr:      { a: 'superbike', w: '#22c55e', livery: '#f8fafc' },
    zx4rr:       { a: 'superbike', w: '#16a34a', livery: '#facc15' },
    zx6r:        { a: 'superbike', w: '#16a34a', livery: '#f8fafc' },
    zx10r:       { a: 'superbike', w: '#15803d', livery: '#f8fafc' },
    harleysport: { a: 'cruiser',   w: '#18181b', livery: '#d97706', rimCol: '#c9a654' },
    r1m:         { a: 'superbike', w: '#cbd5e1', livery: '#1d4ed8' },
    cbr1000:     { a: 'superbike', w: '#dc2626', livery: '#1d4ed8', rimCol: '#c9a654' },
    h2:          { a: 'superbike', w: '#18181b', livery: '#22c55e', trellis: '#22c55e' },
    s1000rr:     { a: 'superbike', w: '#f8fafc', livery: '#dc2626', livery2: '#1d4ed8' },
    panigalev4:  { a: 'superbike', w: '#dc2626', livery: '#18181b' }
  };

  function ambilSpek(id) {
    var bid = String(id || 'beat').replace(/-bekas$/, '');
    var s = SPEK[bid] || { a: 'skutik', w: '#dc2626' };
    var base = ARCH[s.a] || ARCH.skutik;
    var out = {};
    Object.keys(base).forEach(function (k) { out[k] = base[k]; });
    Object.keys(s).forEach(function (k) { if (s[k] !== undefined) out[k] = s[k]; });
    out.bid = bid;
    return out;
  }

  /* ---------- 3. SVG PREVIEW (DEALER MOTOR, AGEN MOTOR BEKAS, GARASI MOTOR) — 100% IDENTIK ---------- */
  function svgRodaMotor(cxp, cyp, r, rimCol, isSpoke) {
    var col = rimCol || '#94a3b8';
    var h = '<circle cx="' + cxp + '" cy="' + cyp + '" r="' + r + '" fill="#14171f" stroke="#272c36" stroke-width="1"/>';
    h += '<circle cx="' + cxp + '" cy="' + cyp + '" r="' + (r - 4.4).toFixed(1) + '" fill="none" stroke="' + col + '" stroke-width="2.2"/>';
    h += '<circle cx="' + cxp + '" cy="' + cyp + '" r="' + (r - 6.8).toFixed(1) + '" fill="none" stroke="#cbd5e1" stroke-width="1" opacity="0.7"/>';
    var n = isSpoke ? 10 : 5;
    for (var i = 0; i < n; i++) {
      var a = i * (Math.PI * 2 / n) - 0.2;
      h += '<line x1="' + cxp + '" y1="' + cyp + '" x2="' + (cxp + Math.cos(a) * (r - 4.6)).toFixed(1) + '" y2="' + (cyp + Math.sin(a) * (r - 4.6)).toFixed(1) + '" stroke="' + col + '" stroke-width="' + (isSpoke ? '0.9' : '1.9') + '"/>';
    }
    h += '<circle cx="' + cxp + '" cy="' + cyp + '" r="2.8" fill="#e2e8f0" stroke="#0f172a" stroke-width="0.7"/>';
    return h;
  }

  function htmlPreview(id, warnaKustom) {
    var sp = ambilSpek(id);
    var w = warnaKustom || sp.w || '#dc2626';
    var wHi = geserHex(w, 42), wLo = geserHex(w, -46);
    var uid = 'mt_' + sp.bid + '_' + String(w).replace('#', '');
    var h = '<svg viewBox="0 0 150 86" width="100%" height="62" style="display:block;margin:2px auto 4px">';
    h += '<defs><linearGradient id="' + uid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + wHi + '"/><stop offset="48%" stop-color="' + w + '"/><stop offset="100%" stop-color="' + wLo + '"/>' +
      '</linearGradient></defs>';
    h += '<ellipse cx="76" cy="79" rx="58" ry="4.5" fill="rgba(15,23,42,0.22)"/>';
    /* Roda depan & belakang */
    h += svgRodaMotor(sp.wb, sp.wy, sp.wr, sp.rimCol, sp.rim === 'spoke');
    h += svgRodaMotor(sp.wf, sp.wy, sp.wr, sp.rimCol, sp.rim === 'spoke');
    /* Blok mesin & rangka */
    if (sp.engine) h += '<rect x="' + sp.engine[0] + '" y="' + sp.engine[1] + '" width="' + sp.engine[2] + '" height="' + sp.engine[3] + '" rx="3" fill="#475569" stroke="#1e293b" stroke-width="1"/>';
    if (sp.shock) h += '<line x1="' + sp.shock[0] + '" y1="' + sp.shock[1] + '" x2="' + sp.shock[2] + '" y2="' + sp.shock[3] + '" stroke="' + (sp.tabungShock ? '#eab308' : '#94a3b8') + '" stroke-width="3" stroke-linecap="round"/>';
    if (sp.fork) h += '<line x1="' + sp.fork[0] + '" y1="' + sp.fork[1] + '" x2="' + sp.fork[2] + '" y2="' + sp.fork[3] + '" stroke="' + (sp.usdGold ? '#d4a843' : '#64748b') + '" stroke-width="3.6" stroke-linecap="round"/>';
    if (sp.exhaust && !sp.ev) {
      h += '<line x1="' + sp.exhaust[0] + '" y1="' + sp.exhaust[1] + '" x2="' + sp.exhaust[2] + '" y2="' + sp.exhaust[3] + '" stroke="#1e293b" stroke-width="5.5" stroke-linecap="round"/>';
      h += '<line x1="' + (sp.exhaust[0] + 4) + '" y1="' + sp.exhaust[1] + '" x2="' + (sp.exhaust[2] - 8) + '" y2="' + (sp.exhaust[3] - 1) + '" stroke="#cbd5e1" stroke-width="1.8" stroke-linecap="round"/>';
    }
    if (sp.deck) h += '<rect x="' + sp.deck[0] + '" y="' + sp.deck[1] + '" width="' + sp.deck[2] + '" height="' + sp.deck[3] + '" rx="2" fill="#18181b"/>';
    /* Bodi utama */
    h += '<path d="' + sp.body + '" fill="url(#' + uid + ')" stroke="rgba(15,23,42,0.4)" stroke-width="1"/>';
    if (sp.trellis) h += '<path d="M 60,44 L 84,38 L 96,49 L 70,51 Z" fill="none" stroke="' + sp.trellis + '" stroke-width="2.2"/>';
    if (sp.livery) h += '<line x1="42" y1="44" x2="108" y2="41" stroke="' + sp.livery + '" stroke-width="2.6" stroke-linecap="round" opacity="0.9"/>';
    if (sp.livery2) h += '<line x1="48" y1="47.5" x2="104" y2="45" stroke="' + sp.livery2 + '" stroke-width="2.2" stroke-linecap="round" opacity="0.9"/>';
    if (sp.chromeLis) h += '<path d="M 24,49 C 40,48 54,48 64,53" fill="none" stroke="#e2e8f0" stroke-width="1.6"/>';
    /* Jok, batok, visor, spakbor, winglet, spion */
    if (sp.seat) h += '<path d="' + sp.seat + '" fill="' + (sp.seatCol || '#18181b') + '" stroke="#090d16" stroke-width="0.8"/>';
    if (sp.headCap) h += '<path d="' + sp.headCap + '" fill="url(#' + uid + ')" stroke="rgba(15,23,42,0.4)" stroke-width="0.9"/>';
    if (sp.visor) h += '<path d="' + sp.visor + '" fill="rgba(15,23,42,0.72)" stroke="#94a3b8" stroke-width="0.8"/>';
    if (sp.fender) h += '<path d="' + sp.fender + '" fill="url(#' + uid + ')" stroke="rgba(15,23,42,0.35)" stroke-width="0.8"/>';
    if (sp.winglet) h += '<rect x="' + sp.winglet[0] + '" y="' + sp.winglet[1] + '" width="' + sp.winglet[2] + '" height="' + sp.winglet[3] + '" rx="1" fill="#0f172a"/>';
    if (sp.mirror) h += '<line x1="' + (sp.mirror[0] + 4) + '" y1="' + (sp.mirror[1] + 9) + '" x2="' + sp.mirror[0] + '" y2="' + sp.mirror[1] + '" stroke="#1e293b" stroke-width="1.5"/><ellipse cx="' + (sp.mirror[0] - 2) + '" cy="' + sp.mirror[1] + '" rx="4" ry="2.2" fill="#0f172a"/>';
    /* Lampu depan & belakang */
    if (sp.roundHead) h += '<circle cx="' + sp.roundHead[0] + '" cy="' + sp.roundHead[1] + '" r="' + sp.roundHead[2] + '" fill="#fef08a" stroke="#64748b" stroke-width="1"/>';
    if (sp.head) h += '<rect x="' + sp.head[0] + '" y="' + sp.head[1] + '" width="' + sp.head[2] + '" height="' + sp.head[3] + '" rx="2" fill="#e0f2fe" stroke="#64748b" stroke-width="0.7"/>';
    if (sp.drl) h += '<path d="' + sp.drl + '" fill="none" stroke="#e0f2fe" stroke-width="2" stroke-linecap="round"/>';
    if (sp.tail) h += '<rect x="' + sp.tail[0] + '" y="' + sp.tail[1] + '" width="' + sp.tail[2] + '" height="' + sp.tail[3] + '" rx="1.4" fill="#ef4444"/>';
    h += '</svg>';
    return h;
  }

  /* ---------- 4. RENDER LIVE CANVAS 2D (100% IDENTIK DENGAN DEALER/GARASI + RODA BERPUTAR) ---------- */
  function parsePath(cx, d) {
    var tok = d.match(/[MLCZmlcz]|-?\d*\.?\d+/g);
    if (!tok) return;
    var i = 0, cmd = 'M';
    cx.beginPath();
    while (i < tok.length) {
      if (/^[MLCZmlcz]$/.test(tok[i])) { cmd = tok[i++]; if (cmd === 'Z' || cmd === 'z') cx.closePath(); continue; }
      if (cmd === 'M') { cx.moveTo(+tok[i++], +tok[i++]); cmd = 'L'; }
      else if (cmd === 'L') { cx.lineTo(+tok[i++], +tok[i++]); }
      else if (cmd === 'C') { cx.bezierCurveTo(+tok[i++], +tok[i++], +tok[i++], +tok[i++], +tok[i++], +tok[i++]); }
      else { i++; }
    }
  }

  function rodaCanvas(cx, rx, ry, r, pt, rimCol, isSpoke) {
    var col = rimCol || '#94a3b8';
    cx.fillStyle = '#14171f'; cx.beginPath(); cx.arc(rx, ry, r, 0, Math.PI * 2); cx.fill();
    cx.strokeStyle = col; cx.lineWidth = 2.2; cx.beginPath(); cx.arc(rx, ry, r - 4.4, 0, Math.PI * 2); cx.stroke();
    cx.strokeStyle = '#cbd5e1'; cx.lineWidth = 1; cx.beginPath(); cx.arc(rx, ry, r - 6.8, 0, Math.PI * 2); cx.stroke();
    var n = isSpoke ? 10 : 5;
    cx.strokeStyle = col; cx.lineWidth = isSpoke ? 0.9 : 1.9;
    cx.beginPath();
    for (var i = 0; i < n; i++) {
      var a = pt + i * (Math.PI * 2 / n);
      cx.moveTo(rx, ry); cx.lineTo(rx + Math.cos(a) * (r - 4.6), ry + Math.sin(a) * (r - 4.6));
    }
    cx.stroke();
    cx.fillStyle = '#e2e8f0'; cx.beginPath(); cx.arc(rx, ry, 2.7, 0, Math.PI * 2); cx.fill();
  }

  /* Gambar motor di kanvas berpusat di (0, 0) = permukaan aspal tepat di bawah tengah motor */
  function gambarCanvas(cx, id, putar, warnaKustom, opt) {
    opt = opt || {};
    var sp = ambilSpek(id);
    var w = warnaKustom || sp.w || '#dc2626';
    var skala = 0.56;
    var bob = opt.jalan ? Math.sin(putar * 1.8) * 0.6 : 0;

    cx.fillStyle = 'rgba(0,0,0,0.30)';
    cx.beginPath(); cx.ellipse(0, 1, 32, 4.2, 0, 0, Math.PI * 2); cx.fill();

    cx.save();
    cx.translate(-76 * skala, -79 * skala + bob);
    cx.scale(skala, skala);

    /* Asap knalpot tipis saat jalan (non-EV) */
    if (opt.jalan && !sp.ev && sp.exhaust) {
      var pf = (Math.abs(putar) * 0.45) % 1;
      cx.fillStyle = 'rgba(226,232,240,' + (0.28 * (1 - pf)).toFixed(2) + ')';
      cx.beginPath(); cx.arc(sp.exhaust[0] - 4 - pf * 18, sp.exhaust[1] - pf * 4, 2.5 + pf * 3.5, 0, Math.PI * 2); cx.fill();
    }

    rodaCanvas(cx, sp.wb, sp.wy, sp.wr, putar, sp.rimCol, sp.rim === 'spoke');
    rodaCanvas(cx, sp.wf, sp.wy, sp.wr, putar, sp.rimCol, sp.rim === 'spoke');

    if (sp.engine) { cx.fillStyle = '#475569'; cx.fillRect(sp.engine[0], sp.engine[1], sp.engine[2], sp.engine[3]); }
    if (sp.shock) {
      cx.strokeStyle = sp.tabungShock ? '#eab308' : '#94a3b8'; cx.lineWidth = 3; cx.lineCap = 'round';
      cx.beginPath(); cx.moveTo(sp.shock[0], sp.shock[1]); cx.lineTo(sp.shock[2], sp.shock[3]); cx.stroke();
    }
    if (sp.fork) {
      cx.strokeStyle = sp.usdGold ? '#d4a843' : '#64748b'; cx.lineWidth = 3.6; cx.lineCap = 'round';
      cx.beginPath(); cx.moveTo(sp.fork[0], sp.fork[1]); cx.lineTo(sp.fork[2], sp.fork[3]); cx.stroke();
    }
    if (sp.exhaust && !sp.ev) {
      cx.strokeStyle = '#1e293b'; cx.lineWidth = 5.5; cx.lineCap = 'round';
      cx.beginPath(); cx.moveTo(sp.exhaust[0], sp.exhaust[1]); cx.lineTo(sp.exhaust[2], sp.exhaust[3]); cx.stroke();
      cx.strokeStyle = '#cbd5e1'; cx.lineWidth = 1.8;
      cx.beginPath(); cx.moveTo(sp.exhaust[0] + 4, sp.exhaust[1]); cx.lineTo(sp.exhaust[2] - 8, sp.exhaust[3] - 1); cx.stroke();
    }
    if (sp.deck) { cx.fillStyle = '#18181b'; cx.fillRect(sp.deck[0], sp.deck[1], sp.deck[2], sp.deck[3]); }

    var gr = cx.createLinearGradient(0, 20, 0, 64);
    gr.addColorStop(0, geserHex(w, 42)); gr.addColorStop(0.5, w); gr.addColorStop(1, geserHex(w, -46));
    parsePath(cx, sp.body); cx.fillStyle = gr; cx.fill();
    cx.strokeStyle = 'rgba(15,23,42,0.4)'; cx.lineWidth = 1.1; cx.stroke();

    if (sp.trellis) { cx.strokeStyle = sp.trellis; cx.lineWidth = 2.2; parsePath(cx, 'M 60,44 L 84,38 L 96,49 L 70,51 Z'); cx.stroke(); }
    if (sp.livery) { cx.strokeStyle = sp.livery; cx.lineWidth = 2.6; cx.beginPath(); cx.moveTo(42, 44); cx.lineTo(108, 41); cx.stroke(); }
    if (sp.livery2) { cx.strokeStyle = sp.livery2; cx.lineWidth = 2.2; cx.beginPath(); cx.moveTo(48, 47.5); cx.lineTo(104, 45); cx.stroke(); }
    if (sp.chromeLis) { cx.strokeStyle = '#e2e8f0'; cx.lineWidth = 1.6; parsePath(cx, 'M 24,49 C 40,48 54,48 64,53'); cx.stroke(); }

    if (sp.seat) { parsePath(cx, sp.seat); cx.fillStyle = sp.seatCol || '#18181b'; cx.fill(); }
    if (sp.headCap) { parsePath(cx, sp.headCap); cx.fillStyle = gr; cx.fill(); }
    if (sp.visor) { parsePath(cx, sp.visor); cx.fillStyle = 'rgba(15,23,42,0.72)'; cx.fill(); }
    if (sp.fender) { parsePath(cx, sp.fender); cx.fillStyle = gr; cx.fill(); }
    if (sp.winglet) { cx.fillStyle = '#0f172a'; cx.fillRect(sp.winglet[0], sp.winglet[1], sp.winglet[2], sp.winglet[3]); }
    if (sp.mirror) {
      cx.strokeStyle = '#1e293b'; cx.lineWidth = 1.5;
      cx.beginPath(); cx.moveTo(sp.mirror[0] + 4, sp.mirror[1] + 9); cx.lineTo(sp.mirror[0], sp.mirror[1]); cx.stroke();
      cx.fillStyle = '#0f172a'; cx.beginPath(); cx.ellipse(sp.mirror[0] - 2, sp.mirror[1], 4, 2.2, 0, 0, Math.PI * 2); cx.fill();
    }
    if (sp.roundHead) { cx.fillStyle = '#fef08a'; cx.beginPath(); cx.arc(sp.roundHead[0], sp.roundHead[1], sp.roundHead[2], 0, Math.PI * 2); cx.fill(); }
    if (sp.head) { cx.fillStyle = '#e0f2fe'; cx.fillRect(sp.head[0], sp.head[1], sp.head[2], sp.head[3]); }
    if (sp.drl) { cx.strokeStyle = '#e0f2fe'; cx.lineWidth = 2; parsePath(cx, sp.drl); cx.stroke(); }
    if (sp.tail) { cx.fillStyle = '#ef4444'; cx.fillRect(sp.tail[0], sp.tail[1], sp.tail[2], sp.tail[3]); }

    cx.restore();
    return sp.gaya || 'skutik';
  }

  g.KK_MOTOR_DESAIN = {
    SPEK: SPEK,
    htmlPreview: htmlPreview,
    gambarCanvas: gambarCanvas
  };
})(typeof window !== 'undefined' ? window : this);
