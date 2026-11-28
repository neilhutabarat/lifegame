/* mobil_desain.js — P81: Desain 100% Kode Asli untuk SEMUA 58 Model Mobil (Dealer, Garasi, Mangkal, & Narik 100% Identik + Animasi Live) */
(function (g) {
  'use strict';

  function geserHex(hex, delta) {
    var s = String(hex || '#94a3b8').replace('#', '');
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    var r = Math.max(0, Math.min(255, parseInt(s.substr(0, 2), 16) + delta));
    var gr = Math.max(0, Math.min(255, parseInt(s.substr(2, 2), 16) + delta));
    var b = Math.max(0, Math.min(255, parseInt(s.substr(4, 2), 16) + delta));
    return '#' + ('0' + r.toString(16)).slice(-2) + ('0' + gr.toString(16)).slice(-2) + ('0' + b.toString(16)).slice(-2);
  }

  /* ---------- 1. ARCHETYPE KURVA BEZIER ASLI (VIEWBOX 0..200 x 0..92, HADAP KANAN) ----------
     Setiap mobil memiliki konfigurasi spesifik (siluet, kaca, pilar, bumper, cladding, grille, DRL, tail, velg, warna OEM)
     sehingga TIDAK ada dua model beda merek yang tampil sama! */
  var ARCH = {
    /* Gran Max: pikap semi-bonnet membulat, hidung pendek, bak rendah */
    granmax: {
      body: 'M 10,67 L 10,45 L 116,45 L 118,17 C 122,14 148,14 156,19 L 176,41 L 187,49 C 191,54 190,62 187,67 Z',
      glass: 'M 124,40 L 125,21 L 152,21 L 170,40 Z',
      pillars: [[148, 21, 2.2, 19]], bedLine: [10, 50, 115, 50], bedWall: [115, 17, 3, 29],
      wb: 44, wf: 162, wy: 68, wr: 13.5, rim: 'steel',
      head: [179, 50, 10, 6], tail: [9, 52, 4, 7], bumperF: [178, 57, 12, 10], mirror: [162, 37], handles: [[127, 46]],
      drvX: 142, drvY: 36, paxX: 0
    },
    /* Suzuki Carry: kabin tegak tinggi, jendela persegi lebar, bumper hitam tebal */
    carry: {
      body: 'M 10,67 L 10,44 L 114,44 L 116,15 C 120,13 152,13 158,17 L 177,40 L 188,46 L 189,67 Z',
      glass: 'M 122,39 L 122,19 L 154,19 L 170,39 Z',
      pillars: [], bedLine: [10, 49, 113, 49], bedWall: [113, 15, 3, 30],
      wb: 44, wf: 158, wy: 68, wr: 13.5, rim: 'steel',
      head: [179, 47, 10, 6.5], tail: [9, 51, 4, 7], bumperF: [178, 54, 12, 13], mirror: [162, 36], handles: [[126, 45]],
      drvX: 140, drvY: 35, paxX: 0
    },
    /* Mitsubishi L300: kabin kotak klasik hitam, kaca depan sangat tegak, teralis bak tinggi */
    l300: {
      body: 'M 9,67 L 9,44 L 116,44 L 118,16 C 122,14 156,14 162,17 L 177,41 L 186,46 L 187,67 Z',
      glass: 'M 124,38 L 124,20 L 157,20 L 170,38 Z',
      pillars: [], bedLine: [9, 49, 115, 49], bedWall: [113, 10, 4, 35], teralis: true,
      wb: 43, wf: 157, wy: 68, wr: 13.5, rim: 'steel',
      head: [181, 49, 6.5, 7], tail: [8, 51, 4, 7], bumperF: [179, 58, 9, 9], mirror: [168, 36], handles: [[128, 43]],
      drvX: 142, drvY: 34, paxX: 0
    },
    /* Isuzu Traga: kabin semi-truk lebih tinggi, bak super panjang, tangki samping */
    traga: {
      body: 'M 8,66 L 8,43 L 122,43 L 125,13 C 130,11 161,11 168,16 L 183,39 L 189,47 L 189,66 Z',
      glass: 'M 131,37 L 131,17 L 164,17 L 177,37 Z',
      pillars: [], bedLine: [8, 48, 121, 48], bedWall: [120, 13, 3.5, 31], sideTank: [80, 56, 28, 10],
      wb: 42, wf: 160, wy: 68, wr: 14, rim: 'steel',
      head: [182, 48, 7.5, 8], tail: [7, 50, 4, 7], bumperF: [180, 57, 10, 9], mirror: [172, 34], handles: [[135, 44]],
      drvX: 148, drvY: 33, paxX: 0
    },
    /* Hilux Rangga: pikap modern bermoncong kotak */
    hilux_rangga: {
      body: 'M 12,67 L 12,44 L 106,44 L 107,18 C 110,15 138,15 144,18 L 159,38 L 186,42 C 190,44 191,53 190,67 Z',
      glass: 'M 113,38 L 113,21 L 141,21 L 154,38 Z',
      pillars: [[134, 21, 2.2, 17]], bedLine: [12, 49, 105, 49], bedWall: [104, 18, 3, 27],
      wb: 46, wf: 158, wy: 68, wr: 14.5, rim: 'steel',
      head: [182, 45, 8, 6], tail: [11, 49, 4, 8], bumperF: [179, 55, 12, 12], mirror: [147, 36], handles: [[120, 44]],
      drvX: 132, drvY: 35, paxX: 0
    },
    /* Triton Single Cab 4x4: tinggi gagah, overfender hitam, ban A/T besar */
    triton_sc: {
      body: 'M 11,63 L 12,41 L 98,41 L 102,16 C 107,14 136,14 142,17 L 159,36 L 186,40 C 191,42 192,51 190,63 Z',
      glass: 'M 108,36 L 110,20 L 139,20 L 153,36 Z',
      pillars: [[130, 20, 2.2, 16]], bedLine: [12, 46, 97, 46], bedWall: [97, 16, 3, 26],
      wb: 45, wf: 157, wy: 67, wr: 16, rim: 'offroad', clad: true,
      head: [180, 42, 10, 5.5], tail: [11, 44, 4.5, 9], step: [78, 64, 54, 3], mirror: [145, 34], handles: [[118, 42]],
      drvX: 128, drvY: 33, paxX: 0
    },
    /* Hilux Double Cabin 4x4 */
    hilux_dc: {
      body: 'M 9,63 L 10,40 L 66,40 L 70,16 C 74,14 134,14 142,17 L 160,36 L 188,40 C 192,42 193,51 191,63 Z',
      glass: 'M 75,36 L 78,20 L 139,20 L 154,36 Z',
      pillars: [[108, 20, 3.2, 16], [75, 20, 2.5, 16]], bedLine: [10, 45, 65, 45], rollbar: 'M 64,40 L 58,17 L 71,17',
      wb: 43, wf: 159, wy: 67, wr: 16, rim: 'offroad', clad: true,
      head: [180, 42, 10, 5.5], tail: [9, 44, 4.5, 10], step: [68, 64, 72, 3.2], mirror: [145, 34], handles: [[90, 41], [122, 41]],
      drvX: 126, drvY: 33, paxX: 92
    },
    /* Honda Brio: hatchback kompak sporty, buritan tegak, spoiler atap */
    brio: {
      body: 'M 28,68 C 24,60 23,46 27,39 L 36,20 C 44,17 108,16 122,20 L 146,38 L 172,44 C 178,46 179,57 177,68 Z',
      glass: 'M 36,39 L 43,23 C 56,21 106,21 118,24 L 140,39 Z',
      pillars: [[90, 22, 3.2, 17], [56, 22, 2.8, 17]], crease: 'M 32,48 L 160,44',
      wb: 50, wf: 149, wy: 68, wr: 13.5, rim: 'alloy5',
      head: [164, 46, 12, 5], tail: [24, 43, 7, 7], spoiler: [27, 19, 14, 3.8], mirror: [132, 37], handles: [[72, 42], [110, 42]],
      drvX: 112, drvY: 36, paxX: 74
    },
    /* Agya GR / Ayla: hatchback tajam modern dengan kaca belakang menanjak */
    agya_ayla: {
      body: 'M 25,68 C 22,59 22,47 27,40 L 42,20 C 52,17 112,17 124,21 L 148,38 L 174,43 C 179,46 180,57 177,68 Z',
      glass: 'M 38,39 L 48,23 C 62,21 110,21 120,24 L 141,39 Z',
      pillars: [[92, 22, 3.2, 17], [60, 22, 2.6, 17]], crease: 'M 34,46 L 166,46',
      wb: 50, wf: 150, wy: 68, wr: 13.5, rim: 'sport',
      head: [166, 46, 12, 4.5], tail: [23, 44, 7.5, 6], spoiler: [30, 20, 15, 3.5], mirror: [134, 37], handles: [[75, 43], [112, 43]],
      drvX: 114, drvY: 36, paxX: 76
    },
    /* Wuling Air EV: mikro EV 2-pintu super mungil mengotak + bar LED */
    airev: {
      body: 'M 48,69 C 45,62 45,35 48,21 C 52,15 124,15 133,20 L 150,40 L 156,46 C 159,53 158,62 155,69 Z',
      glass: 'M 54,40 L 56,22 C 68,20 120,20 129,23 L 145,40 Z',
      pillars: [[98, 21, 3.6, 19]], ev: true,
      wb: 66, wf: 137, wy: 70, wr: 11.5, rim: 'aero',
      drlBar: [140, 43, 17, 3.2], tail: [45, 44, 5, 7], mirror: [136, 38], handles: [[94, 46]],
      drvX: 116, drvY: 37, paxX: 78
    },
    /* Wuling BinguoEV: retro membulat imut + atap putih + dop retro */
    binguoev: {
      body: 'M 22,68 C 17,58 19,42 29,34 C 37,22 50,17 98,17 C 118,17 132,25 144,38 C 156,40 171,44 176,51 C 180,57 179,64 175,68 Z',
      glass: 'M 36,38 C 43,25 54,21 96,21 C 112,21 124,26 136,38 Z',
      pillars: [[86, 21, 3, 17], [56, 22, 2.6, 16]], ev: true,
      wb: 49, wf: 147, wy: 68, wr: 13.5, rim: 'retro', chromeWin: true,
      head: [164, 46, 10, 6.5], tail: [20, 45, 7, 7], mirror: [128, 36], handles: [[72, 43], [108, 43]],
      drvX: 110, drvY: 36, paxX: 72
    },
    /* Wuling Cloud EV: membulat lembut ala awan + handle rata */
    cloudev: {
      body: 'M 17,68 C 13,58 15,44 23,37 L 37,20 C 50,16 116,16 131,21 L 155,39 L 179,44 C 185,47 185,57 182,68 Z',
      glass: 'M 31,39 L 43,23 C 58,20 116,20 128,24 L 149,39 Z',
      pillars: [[94, 21, 3.2, 18], [58, 22, 2.8, 17]], floatD: 'M 22,39 L 32,23 L 38,23 L 31,39 Z', ev: true,
      wb: 47, wf: 153, wy: 68, wr: 14, rim: 'aero',
      drlBar: [170, 46, 13, 3.5], tail: [16, 42, 9, 4.5], mirror: [140, 37], handles: [[76, 44], [114, 44]],
      drvX: 118, drvY: 36, paxX: 78
    },
    /* Calya / Sigra: LCGC 7-seater kompak, kaca kuarter belakang lebar */
    calya_sigra: {
      body: 'M 15,68 C 13,58 14,42 18,36 L 28,18 C 38,16 118,16 130,20 L 152,38 L 180,43 C 185,46 186,57 183,68 Z',
      glass: 'M 24,37 L 32,22 L 126,22 L 146,37 Z',
      pillars: [[96, 22, 3.2, 16], [56, 22, 3, 16]], floatD: 'M 17,37 L 25,22 L 32,22 L 25,37 Z',
      wb: 46, wf: 154, wy: 68, wr: 13.5, rim: 'alloy5',
      head: [170, 45, 11, 5.5], tail: [14, 40, 7, 7], mirror: [137, 36], handles: [[74, 42], [116, 42]],
      drvX: 118, drvY: 35, paxX: 76
    },
    /* Avanza / Xenia / Veloz / BYD M6: LMPV FWD hidung memanjang elegan */
    avanza_mpv: {
      body: 'M 12,68 C 10,57 11,43 16,36 L 26,18 C 38,15 120,15 134,20 L 158,38 L 185,43 C 190,46 190,57 187,68 Z',
      glass: 'M 23,38 L 32,21 C 50,19 118,19 130,23 L 151,38 Z',
      pillars: [[100, 20, 3.2, 18], [58, 21, 3, 17]], floatD: 'M 15,38 L 23,21 L 32,21 L 24,38 Z',
      crease: 'M 24,45 L 174,44',
      wb: 46, wf: 157, wy: 68, wr: 14, rim: 'alloy10',
      head: [173, 45, 12, 5], tail: [12, 39, 8.5, 6], mirror: [142, 36], handles: [[78, 43], [120, 43]],
      drvX: 122, drvY: 35, paxX: 80
    },
    /* Suzuki Ertiga: MPV mengalir halus, lampu belakang vertikal tinggi */
    ertiga: {
      body: 'M 13,68 C 11,57 12,43 16,35 L 27,18 C 40,15 118,15 133,20 L 157,38 L 184,43 C 189,46 189,57 186,68 Z',
      glass: 'M 24,38 L 33,21 L 129,21 L 150,38 Z',
      pillars: [[99, 21, 3, 17], [58, 21, 2.8, 17]], floatD: 'M 16,38 L 24,21 L 33,21 L 25,38 Z',
      wb: 46, wf: 156, wy: 68, wr: 14, rim: 'alloy5',
      head: [173, 45, 12, 5.5], tail: [12, 34, 6.5, 13], mirror: [141, 36], handles: [[77, 43], [119, 43]],
      drvX: 120, drvY: 35, paxX: 78
    },
    /* Mitsubishi Xpander: hidung Dynamic Shield tegak tajam + garis bahu naik + overfender */
    xpander: {
      body: 'M 12,67 C 10,55 11,42 16,35 L 26,17 C 38,15 118,15 132,19 L 156,37 L 185,40 L 190,48 L 187,67 Z',
      glass: 'M 24,37 L 32,21 L 128,21 L 149,37 Z',
      pillars: [[98, 21, 3.2, 17], [58, 21, 3, 17]], floatD: 'M 16,37 L 25,21 L 32,21 L 25,37 Z',
      crease: 'M 20,47 L 178,41',
      wb: 46, wf: 157, wy: 68, wr: 14.5, rim: 'turbine', clad: true,
      head: [175, 42, 12, 4.5], tail: [12, 36, 8, 9], mirror: [141, 35], handles: [[78, 42], [119, 42]],
      drvX: 120, drvY: 35, paxX: 78
    },
    /* Hyundai Stargazer: kapsul one-curve + bar lampu DRL horizontal penuh */
    stargazer: {
      body: 'M 13,68 C 10,57 11,42 18,35 L 32,19 C 50,15 114,15 137,22 C 155,28 171,38 186,47 C 190,52 190,62 186,68 Z',
      glass: 'M 27,38 L 37,22 C 58,19 116,19 135,25 L 158,38 Z',
      pillars: [[100, 21, 3.2, 17], [60, 22, 3, 16]],
      wb: 46, wf: 156, wy: 68, wr: 14, rim: 'aero',
      drlBar: [170, 44, 16, 3], tail: [13, 38, 7, 11], mirror: [146, 36], handles: [[78, 43], [120, 43]],
      drvX: 122, drvY: 35, paxX: 78
    },
    /* Innova Reborn: MPV legenda lebar + jendela belakang segitiga tajam khas Reborn */
    innova_reborn: {
      body: 'M 10,67 C 9,56 10,42 15,35 L 26,16 C 39,14 120,14 134,19 L 158,37 L 187,42 C 192,45 192,56 189,67 Z',
      glass: 'M 22,35 L 32,19 L 130,19 L 151,37 L 42,37 Z',
      pillars: [[98, 19, 3.2, 18], [58, 19, 3, 18]],
      wb: 45, wf: 158, wy: 68, wr: 14.5, rim: 'alloy5',
      head: [174, 44, 13, 5], tail: [11, 38, 8, 7], spoiler: [16, 16, 13, 3.2], mirror: [142, 35], handles: [[76, 42], [118, 42]],
      drvX: 120, drvY: 34, paxX: 78
    },
    /* Innova Zenix: MPV-Crossover + overfender hitam + pilar D patah */
    innova_zenix: {
      body: 'M 10,67 C 9,55 10,41 15,34 L 26,15 C 40,13 122,13 136,18 L 160,36 L 187,40 C 192,43 192,56 189,67 Z',
      glass: 'M 24,36 L 33,19 L 132,19 L 153,36 Z',
      pillars: [[100, 19, 3.4, 17], [58, 19, 3.2, 17]],
      wb: 46, wf: 158, wy: 67, wr: 15, rim: 'alloy10', clad: true, chromeWin: true,
      head: [175, 42, 12, 5], tail: [11, 37, 8, 7], spoiler: [16, 15, 14, 3.5], mirror: [144, 34], handles: [[78, 41], [120, 41]],
      drvX: 122, drvY: 34, paxX: 80
    },
    /* LSUV 7-Seater (Terios / Rush / XL7 / BR-V): tinggi gagah + roof rail + cladding */
    lsuv: {
      body: 'M 14,65 C 12,54 13,41 18,35 L 28,17 C 42,15 118,15 130,19 L 152,36 L 183,40 C 188,43 189,55 186,65 Z',
      glass: 'M 26,37 L 34,21 L 126,21 L 146,37 Z',
      pillars: [[96, 21, 3.2, 16], [58, 21, 3, 16]],
      wb: 47, wf: 155, wy: 66, wr: 15, rim: 'alloy5', clad: true, roofRail: [34, 14, 84],
      head: [171, 42, 12, 5], tail: [13, 38, 8, 6.5], spoiler: [19, 17, 13, 3.2], mirror: [138, 35], handles: [[76, 42], [116, 42]],
      drvX: 118, drvY: 34, paxX: 76
    },
    /* Compact Turbo SUV (Raize / Creta / Yaris Cross / Atto 3): bodi kompak berotot 5-seater */
    compact_suv: {
      body: 'M 20,66 C 17,55 18,42 23,36 L 35,18 C 48,16 116,16 128,20 L 150,37 L 179,41 C 184,44 185,55 182,66 Z',
      glass: 'M 32,37 L 41,22 L 124,22 L 144,37 Z',
      pillars: [[94, 22, 3.2, 15], [60, 22, 3, 15]],
      wb: 49, wf: 152, wy: 67, wr: 15, rim: 'sport', clad: true,
      head: [168, 43, 12, 5], tail: [18, 39, 8, 6], spoiler: [24, 18, 13, 3.2], mirror: [136, 35], handles: [[76, 42], [114, 42]],
      drvX: 116, drvY: 34, paxX: 76
    },
    /* Coupe-SUV (Honda HR-V / BYD Sealion 7): atap miring coupe sporty + handle belakang tersembunyi */
    coupe_suv: {
      body: 'M 14,66 C 12,56 14,44 22,37 L 43,19 C 56,16 116,16 132,21 L 156,37 L 184,42 C 189,45 190,56 186,66 Z',
      glass: 'M 33,38 L 48,22 C 62,20 116,20 129,24 L 150,38 Z',
      pillars: [[98, 21, 3.2, 17], [62, 22, 3, 16]],
      wb: 48, wf: 156, wy: 67, wr: 15, rim: 'turbine', clad: true,
      head: [173, 44, 12, 4.5], tail: [15, 40, 11, 4.5], spoiler: [27, 21, 14, 3], mirror: [142, 35], handles: [[118, 42]],
      drvX: 120, drvY: 35, paxX: 80
    },
    /* Hyundai IONIQ 5: sudut tajam origami + garis lipatan diagonal Z di pintu + velg fractal */
    ioniq5: {
      body: 'M 14,67 L 16,42 L 32,19 C 46,16 122,16 135,20 L 156,38 L 185,42 L 188,54 L 185,67 Z',
      glass: 'M 28,39 L 38,22 L 131,22 L 150,39 Z',
      pillars: [[98, 22, 3.4, 17], [56, 22, 3.2, 17]], crease: 'M 54,57 L 138,40', ev: true,
      wb: 46, wf: 158, wy: 67, wr: 15.5, rim: 'aero', clad: true,
      head: [175, 44, 10, 5], tail: [15, 43, 8, 5], spoiler: [22, 18, 13, 3.2], mirror: [142, 36], handles: [[76, 44], [116, 44]],
      drvX: 120, drvY: 35, paxX: 78
    },
    /* Toyota Fortuner: SUV bongsor + garis kaca belakang menanjak tajam ikonik */
    fortuner: {
      body: 'M 10,64 C 9,53 10,39 14,32 L 25,14 C 39,12 122,12 136,16 L 156,34 L 188,38 C 193,41 193,54 190,64 Z',
      glass: 'M 22,32 L 31,18 L 131,18 L 150,35 L 48,35 Z',
      pillars: [[100, 18, 3.6, 17], [58, 18, 3.4, 17]],
      wb: 45, wf: 159, wy: 66, wr: 16, rim: 'sport', clad: true, roofRail: [31, 11, 94], chromeWin: true,
      head: [176, 40, 13, 5], tail: [10, 35, 9, 5.5], step: [64, 64, 76, 3.2], spoiler: [15, 14, 13, 3.2], mirror: [142, 33], handles: [[76, 40], [118, 40]],
      drvX: 122, drvY: 32, paxX: 80
    },
    /* Mitsubishi Pajero Sport: bodi berotot + lampu belakang vertikal menjuntai khas Pajero */
    pajerosport: {
      body: 'M 10,64 C 9,53 10,39 15,32 L 26,14 C 40,12 122,12 135,16 L 156,34 L 188,38 C 193,41 193,54 190,64 Z',
      glass: 'M 24,33 L 32,18 L 130,18 L 149,35 L 52,35 Z',
      pillars: [[99, 18, 3.4, 17], [58, 18, 3.2, 17]], crease: 'M 20,44 L 178,41',
      wb: 45, wf: 159, wy: 66, wr: 16, rim: 'alloy10', clad: true, roofRail: [32, 11, 92], chromeWin: true,
      head: [176, 40, 13, 5], tail: [10, 34, 5.5, 18], step: [64, 64, 76, 3.2], spoiler: [16, 14, 13, 3.2], mirror: [141, 33], handles: [[76, 40], [118, 40]],
      drvX: 120, drvY: 32, paxX: 78
    },
    /* Flagship Big SUV (CR-V / Palisade / Land Cruiser 300): panjang tegak & kaca baris ke-3 besar */
    flagship_suv: {
      body: 'M 9,64 C 8,52 9,38 13,31 L 20,13 C 34,11 124,11 138,15 L 157,34 L 189,37 C 194,40 194,54 191,64 Z',
      glass: 'M 18,35 L 25,17 L 133,17 L 151,35 Z',
      pillars: [[102, 17, 3.8, 18], [56, 17, 3.8, 18]],
      wb: 44, wf: 160, wy: 66, wr: 16.2, rim: 'alloy10', clad: true, roofRail: [26, 10, 100], chromeWin: true,
      head: [177, 39, 13, 6], tail: [9, 34, 7, 10], step: [62, 64, 78, 3.4], spoiler: [12, 13, 12, 3.2], mirror: [143, 32], handles: [[76, 40], [118, 40]],
      drvX: 122, drvY: 32, paxX: 78
    },
    /* Suzuki Jimny 5-Door: retro 4x4 sangat mengotak + overfender kotak + ban serep belakang */
    jimny: {
      body: 'M 24,65 L 24,17 C 26,14 128,14 132,16 L 142,37 L 176,39 C 180,41 180,55 178,65 Z',
      glass: 'M 30,37 L 30,20 L 128,20 L 137,37 Z',
      pillars: [[94, 20, 4, 17], [56, 20, 3.8, 17]], spare: [11, 33, 12, 26],
      wb: 50, wf: 152, wy: 66, wr: 15.5, rim: 'offroad', clad: true,
      head: [171, 41, 7, 7], tail: [23, 55, 5, 6], mirror: [134, 34], handles: [[72, 41], [110, 41]],
      drvX: 112, drvY: 34, paxX: 74
    },
    /* Mercedes-AMG G 63: G-Wagon ikonik, knalpot samping, lis pelindung, ban serep besar */
    g63: {
      body: 'M 20,64 L 20,12 C 22,10 132,10 136,13 L 146,35 L 184,37 C 188,39 188,54 186,64 Z',
      glass: 'M 27,35 L 27,16 L 132,16 L 141,35 Z',
      pillars: [[96, 16, 4.2, 19], [56, 16, 4, 19]], spare: [6, 28, 13, 29], crease: 'M 20,40 L 185,40',
      wb: 49, wf: 157, wy: 66, wr: 16.5, rim: 'sport', caliper: '#ef4444', clad: true,
      head: [177, 40, 8, 8], tail: [19, 53, 5, 6], step: [66, 63, 74, 3.8], exhaust: [72, 66, 16, 3], mirror: [138, 32], handles: [[74, 42], [116, 42]],
      drvX: 116, drvY: 32, paxX: 76
    },
    /* Honda Civic RS / BYD Seal / Tesla Model 3: sedan fastback rendah sporty */
    sedan_sport: {
      body: 'M 10,68 C 9,58 10,47 16,42 L 38,37 L 60,21 C 74,18 114,18 128,22 L 154,39 L 185,45 C 190,48 190,59 187,68 Z',
      glass: 'M 40,39 L 62,24 C 76,22 112,22 124,25 L 147,39 Z',
      pillars: [[98, 22, 3, 17]],
      wb: 44, wf: 158, wy: 68, wr: 14, rim: 'sport',
      head: [173, 47, 14, 4.5], tail: [11, 44, 10, 5], spoiler: [13, 40, 14, 2.8], mirror: [138, 38], handles: [[76, 44], [116, 44]],
      drvX: 116, drvY: 36, paxX: 78
    },
    /* Camry / BMW 330i: sedan 3-box eksekutif klasik (kap mesin panjang + bagasi tegas) */
    sedan_exec: {
      body: 'M 9,68 C 8,58 9,47 14,42 L 34,39 L 52,21 C 68,18 112,18 126,22 L 152,39 L 186,44 C 191,47 191,58 188,68 Z',
      glass: 'M 42,39 L 56,24 C 72,21 110,21 122,24 L 145,39 Z',
      pillars: [[96, 22, 3, 17]], chromeWin: true,
      wb: 43, wf: 159, wy: 68, wr: 14, rim: 'alloy10',
      head: [174, 46, 14, 4.5], tail: [10, 44, 11, 5.5], mirror: [136, 37], handles: [[74, 43], [114, 43]],
      drvX: 114, drvY: 36, paxX: 76
    },
    /* Toyota GR 86: coupe sport 2-pintu + kap panjang + ducktail */
    gr86: {
      body: 'M 12,68 C 10,59 12,48 19,43 L 40,36 L 64,22 C 78,19 106,19 122,25 L 146,40 L 184,45 C 189,48 190,59 186,68 Z',
      glass: 'M 48,40 L 67,25 C 80,22 104,23 118,28 L 140,40 Z',
      pillars: [[96, 24, 2.6, 16]],
      wb: 46, wf: 156, wy: 68, wr: 14.5, rim: 'sport', caliper: '#ef4444',
      head: [172, 46, 14, 5], tail: [13, 45, 10, 4.5], spoiler: [14, 39, 16, 3.2], mirror: [134, 38], handles: [[100, 45]],
      drvX: 108, drvY: 36, paxX: 0
    },
    /* Porsche 911 Carrera S: flyline melandai mulus + lampu oval + kaliper kuning */
    porsche911: {
      body: 'M 11,68 C 9,60 11,49 18,45 L 44,34 C 60,24 86,21 114,24 C 130,27 144,36 156,41 C 170,41 184,45 189,52 C 191,57 190,64 186,68 Z',
      glass: 'M 54,40 C 66,30 88,26 112,28 C 125,29 137,35 148,41 Z',
      pillars: [[102, 27, 2.4, 14]],
      wb: 46, wf: 156, wy: 68, wr: 14.5, rim: 'sport', caliper: '#eab308',
      head: [170, 44, 13, 6], tail: [12, 46, 12, 4], spoiler: [14, 42, 18, 3], mirror: [136, 39], handles: [[104, 46]],
      drvX: 112, drvY: 37, paxX: 0
    },
    /* Toyota HiAce Premio: van travel panjang 4 jendela + atap tinggi */
    hiace: {
      body: 'M 7,68 L 7,13 C 12,11 144,11 156,14 L 176,38 L 191,44 C 194,48 194,59 191,68 Z',
      glass: 'M 14,38 L 14,17 L 152,17 L 170,38 Z',
      pillars: [[126, 17, 3.2, 21], [90, 17, 3, 21], [54, 17, 3, 21]], crease: 'M 14,44 L 124,44',
      wb: 42, wf: 162, wy: 68, wr: 14.5, rim: 'alloy5',
      head: [181, 46, 10, 6], tail: [7, 38, 5, 16], mirror: [163, 36], handles: [[118, 44], [144, 44]],
      drvX: 146, drvY: 34, paxX: 72
    },
    /* Hyundai Staria: van futuristik moncong peluru + jendela raksasa rendah */
    staria: {
      body: 'M 9,68 L 9,14 C 16,11 118,11 136,16 C 156,22 175,34 189,47 C 192,52 192,61 189,68 Z',
      glass: 'M 16,42 L 16,18 L 134,19 C 152,24 166,34 176,42 Z',
      pillars: [[118, 19, 3.2, 23], [74, 18, 3.2, 24]],
      wb: 44, wf: 158, wy: 68, wr: 14.5, rim: 'alloy10',
      drlBar: [173, 44, 16, 3], tail: [9, 24, 5, 28], mirror: [152, 39], handles: [[110, 47], [134, 47]],
      drvX: 138, drvY: 35, paxX: 74
    },
    /* Alphard / Vellfire / Lexus LM: VIP luxury van dengan pilar B bersirip & krom */
    luxvan: {
      body: 'M 9,68 L 9,13 C 16,11 128,11 142,14 L 168,36 L 188,41 C 191,45 191,58 188,68 Z',
      glass: 'M 15,38 L 15,17 L 138,17 L 162,38 Z',
      pillars: [[116, 17, 4, 21], [72, 17, 3.2, 21]],
      chromeTrim: 'M 15,39 L 112,39 L 120,21 L 124,21 L 116,40 L 162,40',
      chromeGrille: [184, 43, 6, 21],
      wb: 44, wf: 158, wy: 68, wr: 14.5, rim: 'alloy10', chromeWin: true,
      head: [174, 42, 14, 5.5], tail: [9, 35, 9, 8], mirror: [148, 36], handles: [[108, 43], [126, 43]],
      drvX: 136, drvY: 34, paxX: 78
    }
  };

  /* ---------- 2. SPESIFIKASI PER MODEL (SEMUA 58 MOBIL DI N.mobil) ---------- */
  var SPEK = {
    granmax:    { a: 'granmax',      w: '#f1f5f9' },
    carry:      { a: 'carry',        w: '#f8fafc' },
    l300:       { a: 'l300',         w: '#18181b' },
    traga:      { a: 'traga',        w: '#f8fafc' },
    hilux:      { a: 'hilux_rangga', w: '#e2e8f0' },
    triton:     { a: 'triton_sc',    w: '#f1f5f9' },
    calya:      { a: 'calya_sigra',  w: '#a89f91' },
    sigra:      { a: 'calya_sigra',  w: '#4b5563', chromeWin: true },
    ayla:       { a: 'agya_ayla',    w: '#cbd5e1', rim: 'alloy5' },
    agya:       { a: 'agya_ayla',    w: '#eab308', roof: '#111827', caliper: '#ef4444' },
    brio:       { a: 'brio',         w: '#dc2626' },
    airev:      { a: 'airev',        w: '#f8fafc', roof: '#1e293b' },
    xenia:      { a: 'avanza_mpv',   w: '#64748b', rim: 'alloy5' },
    avanza:     { a: 'avanza_mpv',   w: '#cbd5e1' },
    avanzahev27:{ a: 'avanza_mpv',   w: '#e2e8f0', chromeWin: true },
    ertiga:     { a: 'ertiga',       w: '#991b1b' },
    terios:     { a: 'lsuv',         w: '#57534e' },
    rush:       { a: 'lsuv',         w: '#f1f5f9', caliper: '#ef4444', sideMolding: true },
    xl7:        { a: 'lsuv',         w: '#d6cbb8', roof: '#18181b' },
    veloz:      { a: 'avanza_mpv',   w: '#f1f5f9', chromeWin: true, roofRail: [34, 14, 86] },
    xpander:    { a: 'xpander',      w: '#f1f5f9' },
    stargazer:  { a: 'stargazer',    w: '#94a3b8' },
    binguoev:   { a: 'binguoev',     w: '#d6c7b2', roof: '#f8fafc' },
    bydm6:      { a: 'avanza_mpv',   w: '#e2e8f0', rim: 'aero', chromeWin: true, ev: true },
    creta:      { a: 'compact_suv',  w: '#f1f5f9', roof: '#111827', cPillarAccent: '#cbd5e1' },
    hrv:        { a: 'coupe_suv',    w: '#94a3b8' },
    hrvhev26:   { a: 'coupe_suv',    w: '#cbd5e1', caliper: '#ef4444' },
    innova:     { a: 'innova_reborn',w: '#cbd5e1' },
    zenix:      { a: 'innova_zenix', w: '#e5e7eb' },
    zenix27:    { a: 'innova_zenix', w: '#cbd5e1' },
    raize:      { a: 'compact_suv',  w: '#0ea5e9', roof: '#0f172a', caliper: '#ef4444' },
    brv:        { a: 'lsuv',         w: '#b5a692', chromeWin: true },
    cloudev:    { a: 'cloudev',      w: '#d1d5db' },
    yariscross: { a: 'compact_suv',  w: '#dc2626', roof: '#111827', rim: 'alloy10' },
    atto3:      { a: 'compact_suv',  w: '#3b82f6', rim: 'aero', cPillarAccent: '#cbd5e1', ev: true },
    hiace:      { a: 'hiace',        w: '#cbd5e1' },
    jimny:      { a: 'jimny',        w: '#84a94c', roof: '#18181b' },
    hiluxdc:    { a: 'hilux_dc',     w: '#27272a' },
    fortuner:   { a: 'fortuner',     w: '#1e293b', caliper: '#ef4444' },
    fortuner28: { a: 'fortuner',     w: '#111827', caliper: '#ef4444' },
    pajerosport:{ a: 'pajerosport',  w: '#1f2937', caliper: '#ef4444' },
    civicrs:    { a: 'sedan_sport',  w: '#dc2626', caliper: '#ef4444' },
    bydseal:    { a: 'sedan_sport',  w: '#3b82f6', rim: 'aero', caliper: '#ef4444', ev: true },
    crv:        { a: 'flagship_suv', w: '#1e3a5f', rim: 'sport', step: null },
    ioniq5:     { a: 'ioniq5',       w: '#c5bda8' },
    sealion7:   { a: 'coupe_suv',    w: '#1d4ed8', rim: 'sport', caliper: '#ef4444', ev: true },
    camry:      { a: 'sedan_exec',   w: '#374151', rim: 'alloy10' },
    gr86:       { a: 'gr86',         w: '#dc2626' },
    staria:     { a: 'staria',       w: '#1f2937' },
    palisade:   { a: 'flagship_suv', w: '#1e293b', rim: 'alloy10', cPillarAccent: '#cbd5e1' },
    model3:     { a: 'sedan_sport',  w: '#dc2626', rim: 'aero', caliper: '#ef4444', ev: true },
    bmw330i:    { a: 'sedan_exec',   w: '#1d4ed8', rim: 'sport', caliper: '#ef4444' },
    alphard:    { a: 'luxvan',       w: '#f5f5f4' },
    vellfire:   { a: 'luxvan',       w: '#18181b' },
    lexuslm:    { a: 'luxvan',       w: '#64748b' },
    landcruiser:{ a: 'flagship_suv', w: '#334155', rim: 'alloy10' },
    porsche911: { a: 'porsche911',   w: '#dc2626' },
    mercg63:    { a: 'g63',          w: '#18181b' }
  };

  function ambilSpek(id, bentuk) {
    var bid = String(id || '').replace(/-bekas$/, '');
    var s = SPEK[bid];
    if (!s) {
      var aDef = bentuk === 'pikap' ? 'granmax' : bentuk === 'hatch' ? 'brio' : bentuk === 'sport' ? 'gr86' : bentuk === 'sedan' ? 'sedan_exec' : bentuk === 'van' ? 'luxvan' : bentuk === 'suv' ? 'lsuv' : 'avanza_mpv';
      s = { a: aDef, w: '#cbd5e1' };
    }
    var base = ARCH[s.a] || ARCH.avanza_mpv;
    var out = {};
    Object.keys(base).forEach(function (k) { out[k] = base[k]; });
    Object.keys(s).forEach(function (k) { if (s[k] !== undefined) out[k] = s[k]; });
    out.bid = bid;
    return out;
  }

  /* ---------- 3. SVG PREVIEW (DEALER MOBIL, AGEN BEKAS, GARASI) — 100% IDENTIK DENGAN JALAN ---------- */
  function svgRoda(cxp, cyp, r, jenis, caliper) {
    var spokes = '', n = jenis === 'alloy10' ? 10 : jenis === 'offroad' ? 6 : 5;
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

  function htmlPreview(id, bentuk, warnaKustom) {
    var sp = ambilSpek(id, bentuk);
    var w = warnaKustom || sp.w || '#cbd5e1';
    var wHi = geserHex(w, 48), wMid = geserHex(w, 8), wShade = geserHex(w, -26), wLo = geserHex(w, -58);
    var uid = 'mb_' + sp.bid + '_' + String(w).replace('#', '');
    var h = '<svg viewBox="0 0 200 90" width="100%" height="64" style="display:block;margin:2px auto 4px">';
    h += '<defs>' +
      '<linearGradient id="' + uid + '_b" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="' + wHi + '"/><stop offset="32%" stop-color="' + wMid + '"/>' +
        '<stop offset="56%" stop-color="' + wShade + '"/><stop offset="72%" stop-color="' + wMid + '"/><stop offset="100%" stop-color="' + wLo + '"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + uid + '_g" x1="0" y1="0" x2="0.4" y2="1">' +
        '<stop offset="0%" stop-color="#0f172a"/><stop offset="55%" stop-color="#1e293b"/><stop offset="100%" stop-color="#475569"/>' +
      '</linearGradient></defs>';
    h += '<ellipse cx="100" cy="82" rx="82" ry="5.5" fill="rgba(15,23,42,0.24)"/>';
    if (sp.spare) {
      h += '<rect x="' + sp.spare[0] + '" y="' + sp.spare[1] + '" width="' + sp.spare[2] + '" height="' + sp.spare[3] + '" rx="4" fill="#111827" stroke="#334155" stroke-width="0.8"/>';
      h += '<rect x="' + (sp.spare[0] + 2) + '" y="' + (sp.spare[1] + 4) + '" width="' + (sp.spare[2] - 4) + '" height="' + (sp.spare[3] - 8) + '" rx="2" fill="' + wShade + '"/>';
    }
    if (sp.rollbar) h += '<path d="' + sp.rollbar + '" fill="none" stroke="#1e293b" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>';
    if (sp.roofRail) h += '<rect x="' + sp.roofRail[0] + '" y="' + sp.roofRail[1] + '" width="' + sp.roofRail[2] + '" height="3" rx="1.5" fill="#334155"/>';
    if (sp.spoiler) h += '<rect x="' + sp.spoiler[0] + '" y="' + sp.spoiler[1] + '" width="' + sp.spoiler[2] + '" height="' + sp.spoiler[3] + '" rx="1.2" fill="#0f172a"/>';
    if (sp.sideTank) h += '<rect x="' + sp.sideTank[0] + '" y="' + sp.sideTank[1] + '" width="' + sp.sideTank[2] + '" height="' + sp.sideTank[3] + '" rx="2" fill="#1e293b"/>';
    h += '<path d="' + sp.body + '" fill="url(#' + uid + '_b)" stroke="rgba(15,23,42,0.38)" stroke-width="1"/>';
    if (sp.roof) {
      h += '<clipPath id="' + uid + '_c"><path d="' + sp.body + '"/></clipPath>';
      h += '<rect x="0" y="0" width="200" height="23" fill="' + sp.roof + '" clip-path="url(#' + uid + '_c)"/>';
    }
    if (sp.cPillarAccent) h += '<path d="M 28,37 L 36,20 L 42,20 L 34,37 Z" fill="' + sp.cPillarAccent + '" opacity="0.9"/>';
    h += '<path d="' + sp.glass + '" fill="url(#' + uid + '_g)" stroke="' + (sp.chromeWin ? '#cbd5e1' : '#0f172a') + '" stroke-width="' + (sp.chromeWin ? '1.4' : '0.9') + '"/>';
    h += '<path d="M 76,22 L 88,22 L 78,38 L 66,38 Z" fill="rgba(255,255,255,0.18)"/>';
    if (sp.floatD) h += '<path d="' + sp.floatD + '" fill="#0f172a" opacity="0.88"/>';
    if (sp.pillars) sp.pillars.forEach(function (pl) {
      h += '<rect x="' + pl[0] + '" y="' + pl[1] + '" width="' + pl[2] + '" height="' + pl[3] + '" fill="#0f172a"/>';
    });
    if (sp.bedLine) h += '<line x1="' + sp.bedLine[0] + '" y1="' + sp.bedLine[1] + '" x2="' + sp.bedLine[2] + '" y2="' + sp.bedLine[3] + '" stroke="rgba(15,23,42,0.35)" stroke-width="1.2"/>';
    if (sp.bedWall) h += '<rect x="' + sp.bedWall[0] + '" y="' + sp.bedWall[1] + '" width="' + sp.bedWall[2] + '" height="' + sp.bedWall[3] + '" fill="' + wLo + '"/>';
    if (sp.teralis) h += '<line x1="112" y1="12" x2="112" y2="44" stroke="#3f3f46" stroke-width="1.6"/><line x1="110" y1="16" x2="117" y2="16" stroke="#3f3f46" stroke-width="1.2"/>';
    if (sp.crease) h += '<path d="' + sp.crease + '" fill="none" stroke="rgba(255,255,255,0.48)" stroke-width="1.4"/>';
    else h += '<line x1="34" y1="45" x2="162" y2="43" stroke="rgba(255,255,255,0.34)" stroke-width="1.1"/>';
    if (sp.sideMolding) h += '<rect x="64" y="55" width="72" height="4" rx="1.5" fill="#18181b"/>';
    if (typeof sp.chromeTrim === 'string') h += '<path d="' + sp.chromeTrim + '" fill="none" stroke="#e2c87d" stroke-width="1.8"/>';
    if (sp.chromeGrille) h += '<rect x="' + sp.chromeGrille[0] + '" y="' + sp.chromeGrille[1] + '" width="' + sp.chromeGrille[2] + '" height="' + sp.chromeGrille[3] + '" rx="1" fill="#cbd5e1"/>';
    if (sp.clad) {
      h += '<path d="M ' + (sp.wb - sp.wr - 4) + ',67 A ' + (sp.wr + 4) + ',' + (sp.wr + 4) + ' 0 0 1 ' + (sp.wb + sp.wr + 4) + ',67" fill="none" stroke="#18181b" stroke-width="3.6"/>';
      h += '<path d="M ' + (sp.wf - sp.wr - 4) + ',67 A ' + (sp.wr + 4) + ',' + (sp.wr + 4) + ' 0 0 1 ' + (sp.wf + sp.wr + 4) + ',67" fill="none" stroke="#18181b" stroke-width="3.6"/>';
    }
    if (sp.step) h += '<rect x="' + sp.step[0] + '" y="' + sp.step[1] + '" width="' + sp.step[2] + '" height="' + sp.step[3] + '" rx="1.2" fill="#18181b"/>';
    if (sp.exhaust) h += '<rect x="' + sp.exhaust[0] + '" y="' + sp.exhaust[1] + '" width="' + sp.exhaust[2] + '" height="' + sp.exhaust[3] + '" rx="1.2" fill="#e2e8f0" stroke="#475569" stroke-width="0.6"/>';
    if (sp.bumperF) h += '<rect x="' + sp.bumperF[0] + '" y="' + sp.bumperF[1] + '" width="' + sp.bumperF[2] + '" height="' + sp.bumperF[3] + '" rx="2" fill="#1e293b"/>';
    if (sp.mirror) h += '<ellipse cx="' + sp.mirror[0] + '" cy="' + sp.mirror[1] + '" rx="4.2" ry="2.6" fill="' + wLo + '" stroke="#0f172a" stroke-width="0.7"/>';
    if (sp.handles) sp.handles.forEach(function (hd) {
      h += '<rect x="' + hd[0] + '" y="' + hd[1] + '" width="6.5" height="2" rx="1" fill="' + (sp.chromeWin ? '#e2e8f0' : '#1e293b') + '"/>';
    });
    if (sp.drlBar) h += '<rect x="' + sp.drlBar[0] + '" y="' + sp.drlBar[1] + '" width="' + sp.drlBar[2] + '" height="' + sp.drlBar[3] + '" rx="1.5" fill="#e0f2fe" stroke="#38bdf8" stroke-width="0.6"/>';
    if (sp.head) h += '<rect x="' + sp.head[0] + '" y="' + sp.head[1] + '" width="' + sp.head[2] + '" height="' + sp.head[3] + '" rx="2" fill="#e0f2fe" stroke="#64748b" stroke-width="0.6"/>';
    if (sp.tail) h += '<rect x="' + sp.tail[0] + '" y="' + sp.tail[1] + '" width="' + sp.tail[2] + '" height="' + sp.tail[3] + '" rx="1.6" fill="#dc2626" stroke="#7f1d1d" stroke-width="0.6"/>';
    h += svgRoda(sp.wb, sp.wy, sp.wr, sp.rim, sp.caliper);
    h += svgRoda(sp.wf, sp.wy, sp.wr, sp.rim, sp.caliper);
    h += '</svg>';
    return h;
  }

  /* ---------- 4. RENDER LIVE CANVAS 2D (100% IDENTIK + SUPIR, PENUMPANG, RODA BERPUTAR, LAMPU, KNAPOT) ---------- */
  function parsePathKeCanvas(cx, d) {
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

  function gambarRodaCanvas(cx, rx, ry, r, pt, jenis, caliper) {
    cx.fillStyle = '#090d16'; cx.beginPath(); cx.arc(rx, ry, r + 1.5, 0, Math.PI * 2); cx.fill();
    cx.fillStyle = '#181c24'; cx.beginPath(); cx.arc(rx, ry, r, 0, Math.PI * 2); cx.fill();
    if (jenis === 'steel') {
      cx.fillStyle = '#94a3b8'; cx.beginPath(); cx.arc(rx, ry, r * 0.62, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = '#1e293b';
      for (var i = 0; i < 8; i++) {
        var a = pt + i * Math.PI / 4;
        cx.beginPath(); cx.arc(rx + Math.cos(a) * r * 0.42, ry + Math.sin(a) * r * 0.42, 1.3, 0, Math.PI * 2); cx.fill();
      }
    } else if (jenis === 'retro') {
      cx.fillStyle = '#f8fafc'; cx.beginPath(); cx.arc(rx, ry, r * 0.66, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = '#94a3b8'; cx.beginPath(); cx.arc(rx, ry, r * 0.30, 0, Math.PI * 2); cx.fill();
    } else {
      cx.fillStyle = (jenis === 'sport' || jenis === 'aero') ? '#334155' : '#1e293b';
      cx.beginPath(); cx.arc(rx, ry, r * 0.68, 0, Math.PI * 2); cx.fill();
      if (caliper) { cx.fillStyle = caliper; cx.fillRect(rx + r * 0.16, ry - r * 0.24, 3.2, 5.2); }
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
      cx.fillStyle = '#f8fafc'; cx.beginPath(); cx.arc(rx, ry, 2.4, 0, Math.PI * 2); cx.fill();
    }
  }

  function gambarSiluetKabin(cx, x, y, baju, pegangHp) {
    /* Siluet realistis pengemudi / penumpang terlihat lembut di balik kaca mobil */
    cx.fillStyle = baju || '#1f9a3f';
    cx.beginPath(); cx.arc(x, y + 3, 6.5, Math.PI, 0); cx.fill();
    cx.fillStyle = '#e5b887';
    cx.beginPath(); cx.arc(x, y - 5.5, 4.3, 0, Math.PI * 2); cx.fill();
    cx.fillStyle = '#18181b';
    cx.beginPath(); cx.arc(x - 0.5, y - 6.8, 4.2, Math.PI * 0.9, Math.PI * 2.05); cx.fill();
    if (pegangHp) {
      /* Cahaya layar HP kecil saat mangkal nunggu order */
      cx.fillStyle = '#38bdf8';
      cx.fillRect(x + 5, y - 4, 2.6, 4.2);
    }
  }

  function gambarCanvas(cx, id, bentuk, pt, lampuNyala, warnaKustom, opt) {
    opt = opt || {};
    var sp = ambilSpek(id, bentuk);
    var w = warnaKustom || sp.w || '#cbd5e1';
    var gerak = !!(pt && Math.abs(pt) > 0.001);
    var bob = gerak ? Math.sin(pt * 2.2) * 0.65 : 0;
    var skala = sp.a === 'airev' ? 0.63 : (sp.a === 'brio' || sp.a === 'agya_ayla' || sp.a === 'binguoev') ? 0.64 :
      (sp.a === 'flagship_suv' || sp.a === 'fortuner' || sp.a === 'pajerosport' || sp.a === 'g63' || sp.a === 'luxvan' || sp.a === 'hiace' || sp.a === 'staria') ? 0.72 : 0.67;

    /* Bayangan jalan */
    cx.fillStyle = 'rgba(0,0,0,0.44)';
    cx.beginPath(); cx.ellipse(0, 2, 86 * skala, 5.5, 0, 0, Math.PI * 2); cx.fill();

    cx.save();
    cx.translate(-100 * skala, -82 * skala + bob);
    cx.scale(skala, skala);

    /* Asap knalpot tipis animasi saat mobil non-EV melaju */
    if (gerak && !sp.ev) {
      var pf = (Math.abs(pt) * 2.4) % 1;
      cx.fillStyle = 'rgba(226,232,240,' + (0.28 * (1 - pf)).toFixed(2) + ')';
      cx.beginPath(); cx.arc(6 - pf * 22, 65 - pf * 5, 3 + pf * 4.5, 0, Math.PI * 2); cx.fill();
    }

    var bg = cx.createLinearGradient(0, 12, 0, 70);
    bg.addColorStop(0, geserHex(w, 48));
    bg.addColorStop(0.32, geserHex(w, 10));
    bg.addColorStop(0.56, geserHex(w, -26));
    bg.addColorStop(0.72, geserHex(w, 12));
    bg.addColorStop(1, geserHex(w, -58));

    var gl = cx.createLinearGradient(0, 14, 0, 42);
    gl.addColorStop(0, '#0f172a'); gl.addColorStop(0.58, '#1e293b'); gl.addColorStop(1, '#334155');

    if (sp.spare) {
      cx.fillStyle = '#111827'; cx.fillRect(sp.spare[0], sp.spare[1], sp.spare[2], sp.spare[3]);
      cx.fillStyle = geserHex(w, -20); cx.fillRect(sp.spare[0] + 2, sp.spare[1] + 4, sp.spare[2] - 4, sp.spare[3] - 8);
    }
    if (sp.rollbar) { cx.strokeStyle = '#1e293b'; cx.lineWidth = 3.6; parsePathKeCanvas(cx, sp.rollbar); cx.stroke(); }
    if (sp.roofRail) { cx.fillStyle = '#334155'; cx.fillRect(sp.roofRail[0], sp.roofRail[1], sp.roofRail[2], 3); }
    if (sp.spoiler) { cx.fillStyle = '#0f172a'; cx.fillRect(sp.spoiler[0], sp.spoiler[1], sp.spoiler[2], sp.spoiler[3]); }
    if (sp.sideTank) { cx.fillStyle = '#1e293b'; cx.fillRect(sp.sideTank[0], sp.sideTank[1], sp.sideTank[2], sp.sideTank[3]); }

    parsePathKeCanvas(cx, sp.body);
    cx.fillStyle = bg; cx.fill();
    cx.strokeStyle = 'rgba(15,23,42,0.36)'; cx.lineWidth = 1.1; cx.stroke();

    if (sp.roof) {
      cx.save(); parsePathKeCanvas(cx, sp.body); cx.clip();
      cx.fillStyle = sp.roof; cx.fillRect(0, 0, 200, 23); cx.restore();
    }
    if (sp.cPillarAccent) {
      cx.fillStyle = sp.cPillarAccent;
      cx.beginPath(); cx.moveTo(28, 37); cx.lineTo(36, 20); cx.lineTo(42, 20); cx.lineTo(34, 37); cx.closePath(); cx.fill();
    }

    /* Kaca & isi kabin (supir + penumpang terlihat hidup saat mangkal & narik!) */
    parsePathKeCanvas(cx, sp.glass);
    cx.fillStyle = gl; cx.fill();
    if (opt.adaSupir || opt.adaPenumpang) {
      cx.save(); parsePathKeCanvas(cx, sp.glass); cx.clip();
      if (opt.adaSupir && sp.drvX) gambarSiluetKabin(cx, sp.drvX, sp.drvY || 35, opt.baju || '#1f9a3f', !!opt.mangkal);
      if (opt.adaPenumpang && sp.paxX) gambarSiluetKabin(cx, sp.paxX, sp.drvY || 35, '#64748b', false);
      /* Lapisan kaca film tipis di atas siluet kabin agar menyatu alami */
      cx.fillStyle = 'rgba(15,23,42,0.34)'; cx.fillRect(0, 0, 200, 50);
      cx.restore();
    }
    if (sp.chromeWin) { parsePathKeCanvas(cx, sp.glass); cx.strokeStyle = '#cbd5e1'; cx.lineWidth = 1.5; cx.stroke(); }
    cx.fillStyle = 'rgba(255,255,255,0.18)';
    cx.beginPath(); cx.moveTo(76, 22); cx.lineTo(88, 22); cx.lineTo(78, 38); cx.lineTo(66, 38); cx.closePath(); cx.fill();

    if (sp.floatD) { parsePathKeCanvas(cx, sp.floatD); cx.fillStyle = '#0f172a'; cx.fill(); }
    if (sp.pillars) { cx.fillStyle = '#0f172a'; sp.pillars.forEach(function (pl) { cx.fillRect(pl[0], pl[1], pl[2], pl[3]); }); }
    if (sp.bedLine) { cx.strokeStyle = 'rgba(15,23,42,0.38)'; cx.lineWidth = 1.3; cx.beginPath(); cx.moveTo(sp.bedLine[0], sp.bedLine[1]); cx.lineTo(sp.bedLine[2], sp.bedLine[3]); cx.stroke(); }
    if (sp.bedWall) { cx.fillStyle = geserHex(w, -50); cx.fillRect(sp.bedWall[0], sp.bedWall[1], sp.bedWall[2], sp.bedWall[3]); }
    if (sp.teralis) { cx.strokeStyle = '#3f3f46'; cx.lineWidth = 1.6; cx.beginPath(); cx.moveTo(112, 12); cx.lineTo(112, 44); cx.stroke(); }
    if (sp.crease) { cx.strokeStyle = 'rgba(255,255,255,0.52)'; cx.lineWidth = 1.4; parsePathKeCanvas(cx, sp.crease); cx.stroke(); }
    else { cx.strokeStyle = 'rgba(255,255,255,0.36)'; cx.lineWidth = 1.1; cx.beginPath(); cx.moveTo(34, 45); cx.lineTo(162, 43); cx.stroke(); }
    if (sp.sideMolding) { cx.fillStyle = '#18181b'; cx.fillRect(64, 55, 72, 4); }
    if (typeof sp.chromeTrim === 'string') { cx.strokeStyle = '#e2c87d'; cx.lineWidth = 2; parsePathKeCanvas(cx, sp.chromeTrim); cx.stroke(); }
    if (sp.chromeGrille) { cx.fillStyle = '#cbd5e1'; cx.fillRect(sp.chromeGrille[0], sp.chromeGrille[1], sp.chromeGrille[2], sp.chromeGrille[3]); }

    if (sp.clad) {
      cx.strokeStyle = '#18181b'; cx.lineWidth = 3.8;
      cx.beginPath(); cx.arc(sp.wb, 67, sp.wr + 4, Math.PI, 0); cx.stroke();
      cx.beginPath(); cx.arc(sp.wf, 67, sp.wr + 4, Math.PI, 0); cx.stroke();
    }
    if (sp.step) { cx.fillStyle = '#18181b'; cx.fillRect(sp.step[0], sp.step[1], sp.step[2], sp.step[3]); }
    if (sp.exhaust) { cx.fillStyle = '#e2e8f0'; cx.fillRect(sp.exhaust[0], sp.exhaust[1], sp.exhaust[2], sp.exhaust[3]); }
    if (sp.bumperF) { cx.fillStyle = '#1e293b'; cx.fillRect(sp.bumperF[0], sp.bumperF[1], sp.bumperF[2], sp.bumperF[3]); }
    if (sp.mirror) { cx.fillStyle = geserHex(w, -48); cx.beginPath(); cx.ellipse(sp.mirror[0], sp.mirror[1], 4.2, 2.6, 0, 0, Math.PI * 2); cx.fill(); }
    if (sp.handles) { cx.fillStyle = sp.chromeWin ? '#e2e8f0' : '#1e293b'; sp.handles.forEach(function (hd) { cx.fillRect(hd[0], hd[1], 6.5, 2); }); }

    if (sp.drlBar) { cx.fillStyle = '#e0f2fe'; cx.fillRect(sp.drlBar[0], sp.drlBar[1], sp.drlBar[2], sp.drlBar[3]); }
    if (sp.head) { cx.fillStyle = '#e0f2fe'; cx.fillRect(sp.head[0], sp.head[1], sp.head[2], sp.head[3]); }
    if (sp.tail) { cx.fillStyle = opt.mangkal ? '#ef4444' : '#dc2626'; cx.fillRect(sp.tail[0], sp.tail[1], sp.tail[2], sp.tail[3]); }

    /* Lampu hazard kuning berkedip pelan saat mangkal menunggu penumpang */
    if (opt.mangkal && Math.floor((new Date().getTime()) / 550) % 2 === 0) {
      cx.fillStyle = '#facc15';
      if (sp.head) cx.fillRect(sp.head[0] + sp.head[2] - 3, sp.head[1], 3.5, 4);
      if (sp.tail) cx.fillRect(sp.tail[0], sp.tail[1] + 2, 3.5, 4);
    }

    gambarRodaCanvas(cx, sp.wb, sp.wy, sp.wr, pt, sp.rim, sp.caliper);
    gambarRodaCanvas(cx, sp.wf, sp.wy, sp.wr, pt, sp.rim, sp.caliper);

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
    SPEK: SPEK,
    htmlPreview: htmlPreview,
    gambarCanvas: gambarCanvas
  };
})(typeof window !== 'undefined' ? window : this);
