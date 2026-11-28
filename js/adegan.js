/* adegan.js — adegan The Driver 100% vektor Kanvas 2D: langit sesuai jam, ruko, pemandangan tema & ikon kota, interior kos/rumah, karakter, motor, dan mobil vektor dengan roda berputar. */
(function (g) {
  'use strict';
  var cv, cx, W = 360, H = 640, dpr = 1;
  var anim = { rolling: 0, pantulKedai: 0, pantulBarista: 0, kedip: 0, motor: [], tMotor: 0, pejalan: [], tPejalan: 0, angkat: 0, teks: [], cup: [] };
  var ruko = [];
  function hashNama(teks) {
    var h = 0, s = String(teks || '');
    for (var i = 0; i < s.length; i++) h = ((h * 31) + s.charCodeAt(i)) >>> 0;
    return h;
  }
  function pilihKunciChar(nama, gender, usia, peran) {
    var nm = String(nama || '').trim().toLowerCase();
    var cw = gender === 'cowok';
    if ((usia != null && usia < 12) || (peran === 'anak' && (usia == null || usia < 12))) return cw ? 'anak-cowok' : 'anak-cewek';
    if (usia != null && usia < 20) return cw ? 'remaja-cowok' : 'remaja-cewek';
    return (cw ? 'cowok-' : 'cewek-') + (hashNama(nm || (cw ? 'c' : 'p')) % 6);
  }
  var genderPemain = 'cewek';
  var IMG_CACHE = {};
  function muatImg(src) {
    if (!src || typeof Image === 'undefined') return null;
    var im = IMG_CACHE[src];
    if (im) return (im.complete && im.naturalWidth > 0) ? im : null;
    im = new Image();
    im.decoding = 'async';
    im.src = src;
    IMG_CACHE[src] = im;
    return null;
  }
  function gambarBgCover(im, tw, th) {
    if (!im || !im.naturalWidth || !im.naturalHeight) return false;
    var iw = im.naturalWidth, ih = im.naturalHeight;
    var sc = Math.max(tw / iw, th / ih);
    var dw = iw * sc, dh = ih * sc;
    var dx = (tw - dw) * 0.5, dy = (th - dh) * 0.5;
    cx.drawImage(im, dx, dy, dw, dh);
    return true;
  }
  function srcRumahHD(kunciTema) {
    if (kunciTema === 'kos_hemat' || kunciTema === 'kontrakan_petak') return 'img/rumah/kos_hemat.jpg';
    if (kunciTema === 'kos_ac' || kunciTema === 'kos_eksklusif' || kunciTema === 'apt_rusunami') return 'img/rumah/kos_ac.jpg';
    if (kunciTema === 'kontrakan_1kt' || kunciTema === 'kontrakan_2kt' || kunciTema === 'rumah_subsidi') return 'img/rumah/kontrakan.jpg';
    if (kunciTema === 'apt_studio' || kunciTema === 'apt_2br') return 'img/rumah/apartemen.jpg';
    return 'img/rumah/rumah_mewah.jpg';
  }
  function srcKarakterHD(gender, tp, o) {
    o = o || {};
    var sk = o.skala || 1, cw = gender === 'cowok';
    if (sk < 0.72) return cw ? 'img/char/anak_cowok.png' : 'img/char/anak_cewek.png';
    if (sk < 0.88 && o.label && /\(\d+t\)/.test(o.label)) return cw ? 'img/char/remaja_cowok.png' : 'img/char/remaja_cewek.png';
    if (!cw) {
      if (tp && tp.rambut === 'hijab') return 'img/char/cewek_hijab.png';
      if (o.driver) return 'img/char/cewek_driver.png';
      return 'img/char/cewek_kasual.png';
    }
    var h = hashNama(o.namaAsli || o.label || 'cowok');
    return (h % 2 === 0) ? 'img/char/cowok_kasual.png' : 'img/char/cowok_kemeja.png';
  }
  function faceSrcHD(nama, gender, usia, peran, tp, driver) {
    var cw = gender === 'cowok';
    var isAnak = peran === 'anak' || (usia != null && usia < 12);
    var isRemaja = !isAnak && usia != null && usia < 19;
    if (isAnak) return cw ? 'img/char/face_anak_cowok.jpg' : 'img/char/face_anak_cewek.jpg';
    if (isRemaja) return cw ? 'img/char/face_remaja_cowok.jpg' : 'img/char/face_remaja_cewek.jpg';
    if (!cw) {
      if (tp && tp.rambut === 'hijab') return 'img/char/face_cewek_hijab.jpg';
      if (driver) return 'img/char/face_cewek_driver.jpg';
      return 'img/char/face_cewek_kasual.jpg';
    }
    var h = hashNama(nama || 'cowok');
    return (h % 2 === 0) ? 'img/char/face_cowok_kasual.jpg' : 'img/char/face_cowok_kemeja.jpg';
  }
  /* State gerakan hidup penghuni rumah (jalan-jalan santai, berhenti, balik badan, berkedip) */
  var wargaRumah = {};
  function gerakWargaRumah(kunci, xAwal, xMin, xMax, dt) {
    var w = wargaRumah[kunci];
    if (!w) {
      w = { x: xAwal, tx: xAwal, yOff: 0, tyOff: 0, arah: 1, tunggu: 2200 + (hashNama(kunci) % 2400), jalan: false };
      wargaRumah[kunci] = w;
    }
    var d = Math.max(1, Math.min(60, dt || 16));
    if (w.jalan) {
      var dx = w.tx - w.x, dy = w.tyOff - w.yOff;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 2.2) {
        w.x = w.tx; w.yOff = w.tyOff; w.jalan = false;
        w.tunggu = 3600 + Math.random() * 4400;
      } else {
        var spd = 0.036 * d;
        w.x += (dx / dist) * Math.min(dist, spd);
        w.yOff += (dy / dist) * Math.min(dist, spd);
        if (Math.abs(dx) > 1.5) w.arah = dx >= 0 ? 1 : -1;
      }
    } else {
      w.tunggu -= d;
      if (w.tunggu <= 0) {
        w.tx = xMin + Math.random() * Math.max(20, xMax - xMin);
        w.tyOff = -5 + Math.random() * 14;
        if (Math.abs(w.tx - w.x) > 18) {
          w.jalan = true;
          w.arah = w.tx >= w.x ? 1 : -1;
        } else {
          w.tunggu = 2600 + Math.random() * 2500;
        }
      }
    }
    return w;
  }
  function gambarPotretAi() { return false; }
  function gambarKarakterPenuh() { return false; }
  function imChar() { return null; }
  function imCharFull() { return null; }
  function imPemain() { return null; }
  function imPasangan() { return null; }

  /* angka acak tetap supaya ruko dan jendela selalu sama */
  function acak(seed) { var x = Math.sin(seed * 999.13) * 43758.5453; return x - Math.floor(x); }

  function siapkanRuko() {
    ruko = [];
    var warna = ['#c9b394', '#9fb8a6', '#d4a27a', '#a9b3c8', '#c7a3a0', '#b7c09a'];
    var papan = ['#d9443a', '#2f6fb0', '#f2a516', '#2f8f5b', '#7a4fa0'];
    var x = -20, i = 0;
    while (x < W + 20) {
      var w = 72 + Math.floor(acak(i + 1) * 34), tinggi = 150 + Math.floor(acak(i + 7) * 90), lantai = tinggi > 205 ? 3 : 2;
      ruko.push({ x: x, w: w, h: tinggi, lantai: lantai, warna: warna[i % warna.length], papan: papan[Math.floor(acak(i + 3) * papan.length)], seed: i * 17 });
      x += w + 2; i++;
    }
  }

  var texAspalHD = null, texTanahHD = null;
  function siapkanTeksturHD() {
    if (texAspalHD || typeof document === 'undefined' || !document.createElement) return;
    try {
      var ca = document.createElement('canvas'); ca.width = 160; ca.height = 96;
      var ga = ca.getContext && ca.getContext('2d');
      if (ga && typeof ga.createImageData === 'function') {
        var im = ga.createImageData(160, 96);
        for (var i = 0; i < im.data.length; i += 4) {
          var r = acak(i * 0.13 + 7);
          var v = r < 0.15 ? 24 : r > 0.86 ? 228 : (92 + Math.floor(r * 78));
          im.data[i] = v; im.data[i + 1] = v; im.data[i + 2] = v;
          im.data[i + 3] = (r < 0.15 || r > 0.86) ? 34 : 16;
        }
        ga.putImageData(im, 0, 0);
        ga.strokeStyle = 'rgba(14,18,24,0.40)'; ga.lineWidth = 0.9;
        ga.beginPath();
        ga.moveTo(16, 20); ga.lineTo(34, 29); ga.lineTo(44, 47); ga.moveTo(34, 29); ga.lineTo(54, 25);
        ga.moveTo(104, 56); ga.lineTo(122, 65); ga.lineTo(140, 58); ga.moveTo(122, 65); ga.lineTo(129, 78);
        ga.stroke();
        texAspalHD = ca;
      }
      var ct = document.createElement('canvas'); ct.width = 160; ct.height = 96;
      var gt = ct.getContext && ct.getContext('2d');
      if (gt && typeof gt.createImageData === 'function') {
        var imt = gt.createImageData(160, 96);
        for (var j = 0; j < imt.data.length; j += 4) {
          var rt = acak(j * 0.19 + 41);
          imt.data[j] = rt < 0.25 ? 58 : rt > 0.8 ? 168 : 118;
          imt.data[j + 1] = rt < 0.25 ? 36 : rt > 0.8 ? 116 : 74;
          imt.data[j + 2] = rt < 0.25 ? 18 : rt > 0.8 ? 68 : 40;
          imt.data[j + 3] = (rt < 0.2 || rt > 0.82) ? 44 : 22;
        }
        gt.putImageData(imt, 0, 0);
        texTanahHD = ct;
      }
    } catch (eTex) {}
  }

  function init(canvas) {
    cv = canvas;
    try { cx = cv.getContext('2d', { alpha: false, desynchronized: true }) || cv.getContext('2d'); }
    catch (eCtx) { cx = cv.getContext('2d'); }
    ukur(); siapkanRuko(); siapkanTeksturHD(); window.addEventListener('resize', ukur);
  }
  function ukur() {
    var r = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.max(1, Math.round(r.width * dpr)); cv.height = Math.max(1, Math.round(r.height * dpr));
    H = r.height / r.width * W;
  }

  /* ---------- warna langit ---------- */
  var KF = [[0, '#0b1430', '#1c2a55'], [300, '#101b3d', '#2b3a6b'], [345, '#3d4f8f', '#f0a37f'], [390, '#79b7e6', '#f6d1a8'],
    [480, '#5fb2ea', '#bfe4f6'], [900, '#5aaee6', '#c6e8f5'], [1005, '#6c9fd6', '#f6c58c'], [1065, '#4a4f8e', '#f08a63'],
    [1110, '#1d2550', '#5a3f6e'], [1170, '#0e1736', '#1d2b55'], [1440, '#0b1430', '#1c2a55']];
  function hex(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
  function campur(a, b, t) { var A = hex(a), B = hex(b); return 'rgb(' + [0, 1, 2].map(function (i) { return Math.round(A[i] + (B[i] - A[i]) * t); }).join(',') + ')'; }
  function langit(m) {
    for (var i = 0; i < KF.length - 1; i++) if (m >= KF[i][0] && m <= KF[i + 1][0]) {
      var t = (m - KF[i][0]) / (KF[i + 1][0] - KF[i][0]);
      return [campur(KF[i][1], KF[i + 1][1], t), campur(KF[i][2], KF[i + 1][2], t)];
    }
    return [KF[0][1], KF[0][2]];
  }
  function gelap(m) {
    if (m < 330 || m > 1140) return 1;
    if (m < 420) return 1 - (m - 330) / 90;
    if (m > 1050) return (m - 1050) / 90;
    return 0;
  }

  /* ---------- bentuk dasar ---------- */
  function kotak(x, y, w, h, warna) { cx.fillStyle = warna; cx.fillRect(x, y, w, h); }
  function bulat(x, y, r, warna) { cx.fillStyle = warna; cx.beginPath(); cx.arc(x, y, r, 0, Math.PI * 2); cx.fill(); }
  function kotakBulat(x, y, w, h, r, warna) {
    cx.fillStyle = warna; cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r);
    cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); cx.fill();
  }

  /* Awan realistis vektor berlapis: menyatu alami dengan gradien langit, kabut stratus cakrawala, dan pencahayaan waktu + mendung */
  function gambarAwanLangit(m, t, cw) {
    var awan = cw ? (cw.awan != null ? cw.awan : 0.3) : 0.25;
    var mendung = cw ? (cw.mendung || 0) : 0;
    var angin = cw ? (cw.angin || 0.15) : 0.15;
    var gp = gelap(m);
    var senja = (m >= 330 && m <= 420) || (m >= 995 && m <= 1115);
    /* 1. Lapisan langit mendung / stratus halus di latar agar awan bergerak tidak kontras dengan langit */
    if (awan > 0.18 || mendung > 0.15) {
      var grStr = cx.createLinearGradient(0, 0, 0, H * 0.56);
      var aTop = Math.min(0.72, mendung * 0.58 + awan * 0.12);
      var aMid = Math.min(0.45, mendung * 0.36 + awan * 0.08);
      if (gp > 0.5) {
        grStr.addColorStop(0, 'rgba(18,26,46,' + aTop.toFixed(3) + ')');
        grStr.addColorStop(0.65, 'rgba(28,38,62,' + aMid.toFixed(3) + ')');
        grStr.addColorStop(1, 'rgba(28,38,62,0)');
      } else if (mendung > 0.35) {
        grStr.addColorStop(0, 'rgba(72,84,102,' + aTop.toFixed(3) + ')');
        grStr.addColorStop(0.65, 'rgba(116,128,144,' + aMid.toFixed(3) + ')');
        grStr.addColorStop(1, 'rgba(135,146,160,0)');
      } else if (senja) {
        grStr.addColorStop(0, 'rgba(185,148,145,' + (aTop * 0.65).toFixed(3) + ')');
        grStr.addColorStop(0.7, 'rgba(235,188,155,' + (aMid * 0.55).toFixed(3) + ')');
        grStr.addColorStop(1, 'rgba(240,196,162,0)');
      } else {
        grStr.addColorStop(0, 'rgba(205,228,244,' + (aTop * 0.65).toFixed(3) + ')');
        grStr.addColorStop(0.7, 'rgba(222,238,248,' + (aMid * 0.55).toFixed(3) + ')');
        grStr.addColorStop(1, 'rgba(222,238,248,0)');
      }
      cx.fillStyle = grStr;
      cx.fillRect(0, 0, W, H * 0.58);
    }
    /* 2. Awan latar jauh (bergerak pelan, sangat menyatu dengan warna cakrawala) */
    var nJauh = Math.max(2, Math.round(2 + awan * 4));
    for (var cj = 0; cj < nJauh; cj++) {
      var sj = cj * 43 + 11;
      var xj = (((acak(sj) * (W + 180) + t * (0.0018 + angin * 0.008)) % (W + 190)) - 95);
      var yj = H * 0.24 + acak(sj + 2) * (H * 0.14);
      var wj = 56 + acak(sj + 4) * 50 + mendung * 28;
      var grJ = cx.createLinearGradient(xj, yj - 18, xj, yj + 16);
      var rJ = gp > 0.5 ? 42 : mendung > 0.45 ? Math.round(138 - mendung * 42) : senja ? 236 : 226;
      var gJ = gp > 0.5 ? 54 : mendung > 0.45 ? Math.round(146 - mendung * 42) : senja ? 202 : 238;
      var bJ = gp > 0.5 ? 82 : mendung > 0.45 ? Math.round(160 - mendung * 38) : senja ? 186 : 248;
      grJ.addColorStop(0, 'rgba(' + rJ + ',' + gJ + ',' + bJ + ',' + (0.28 + awan * 0.22).toFixed(2) + ')');
      grJ.addColorStop(1, 'rgba(' + rJ + ',' + gJ + ',' + bJ + ',0)');
      cx.fillStyle = grJ;
      cx.beginPath();
      cx.ellipse(xj, yj, wj, 14 + mendung * 8, 0, 0, Math.PI * 2);
      cx.ellipse(xj - wj * 0.35, yj - 4, wj * 0.55, 11 + mendung * 6, 0, 0, Math.PI * 2);
      cx.ellipse(xj + wj * 0.35, yj - 2, wj * 0.5, 10 + mendung * 6, 0, 0, Math.PI * 2);
      cx.fill();
    }
    /* 3. Awan cumulus / cumulonimbus depan dengan gradien atas-bawah halus selaras langit */
    var nAwan = Math.max(2, Math.round(2 + awan * 6));
    var spd = 0.0035 + angin * 0.02;
    for (var ci = 0; ci < nAwan; ci++) {
      var seed = ci * 31 + 7;
      var cx0 = (((acak(seed) * (W + 150) + t * spd * (0.65 + (ci % 3) * 0.22)) % (W + 160)) - 80);
      var cy0 = 46 + acak(seed + 3) * (H * 0.20) + (ci % 2) * 12;
      var sk = 0.78 + acak(seed + 5) * 0.68 + mendung * 0.32;
      var isGelap = mendung > 0.4 && (cw.kode !== 'sebagian_mendung' || ci % 2 === 0);
      var rT, gT, bT, rB, gB, bB, aC;
      if (isGelap) {
        rT = Math.round(130 - mendung * 45 - gp * 45);
        gT = Math.round(138 - mendung * 46 - gp * 45);
        bT = Math.round(152 - mendung * 42 - gp * 38);
        rB = Math.max(24, rT - 34); gB = Math.max(28, gT - 32); bB = Math.max(38, bT - 26);
        aC = Math.min(0.84, 0.44 + mendung * 0.38);
      } else {
        rT = gp > 0.5 ? 54 : senja ? 245 : 238;
        gT = gp > 0.5 ? 66 : senja ? 210 : 246;
        bT = gp > 0.5 ? 94 : senja ? 190 : 252;
        rB = gp > 0.5 ? 36 : senja ? 205 : 196;
        gB = gp > 0.5 ? 46 : senja ? 168 : 216;
        bB = gp > 0.5 ? 72 : senja ? 158 : 232;
        aC = gp > 0.5 ? 0.30 : Math.min(0.76, 0.42 + awan * 0.28);
      }
      cx.save(); cx.translate(cx0, cy0); cx.scale(sk, sk * (isGelap ? 0.88 : 0.74));
      var grCl = cx.createLinearGradient(0, -24, 0, 22);
      grCl.addColorStop(0, 'rgba(' + rT + ',' + gT + ',' + bT + ',' + aC.toFixed(2) + ')');
      grCl.addColorStop(0.68, 'rgba(' + rB + ',' + gB + ',' + bB + ',' + (aC * 0.82).toFixed(2) + ')');
      grCl.addColorStop(1, 'rgba(' + rB + ',' + gB + ',' + bB + ',0)');
      cx.fillStyle = grCl;
      cx.beginPath();
      cx.arc(-25, 3, 16, 0, Math.PI * 2);
      cx.arc(-9, -8, 22, 0, Math.PI * 2);
      cx.arc(13, -5, 20, 0, Math.PI * 2);
      cx.arc(28, 4, 15, 0, Math.PI * 2);
      cx.ellipse(2, 10, 38, 12, 0, 0, Math.PI * 2);
      if (isGelap) cx.arc(2, -16, 15, 0, Math.PI * 2);
      cx.fill();
      cx.restore();
    }
  }
  /* Pengaruh atmosfer mendung/awan tebal pada seluruh latar kota/desa agar pencahayaan dunia terasa nyata & menyatu */
  function gambarAtmosferCuaca(s) {
    if (!s || s.hbAnim || s.kerjaAnim || s.posisi === 'kos') return;
    var cw = s.cuacaInfo, mendung = cw ? (cw.mendung || 0) : 0;
    var m = (s.menit || 480) % 1440, jam = m / 60;
    cx.save();
    cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0);
    /* 1. Volumetric Golden-Hour Sunbeams (PS2 lighting polish) saat pagi/sore cerah */
    if (mendung < 0.45 && ((jam >= 6.1 && jam <= 8.4) || (jam >= 16.2 && jam <= 18.0))) {
      var intens = jam < 10 ? (1 - Math.abs(jam - 7.2) / 1.2) : (1 - Math.abs(jam - 17.1) / 1.0);
      var aBeam = Math.max(0, intens) * (1 - mendung) * 0.14;
      if (aBeam > 0.01) {
        var sx = jam < 10 ? W * 0.88 : W * 0.14;
        for (var b = 0; b < 3; b++) {
          var grB = cx.createLinearGradient(sx, 20, sx + (jam < 10 ? -180 : 180) + b * 45, H * 0.68);
          grB.addColorStop(0, 'rgba(255,226,158,' + aBeam.toFixed(3) + ')');
          grB.addColorStop(1, 'rgba(255,215,130,0)');
          cx.fillStyle = grB;
          cx.beginPath();
          cx.moveTo(sx, 10);
          cx.lineTo(sx + (jam < 10 ? -240 : 240) + b * 65, H * 0.72);
          cx.lineTo(sx + (jam < 10 ? -160 : 160) + b * 65, H * 0.72);
          cx.closePath(); cx.fill();
        }
      }
    }
    /* 2. Atmosfer mendung realistis */
    if (mendung > 0.25) {
      var grAtm = cx.createLinearGradient(0, 0, 0, H);
      grAtm.addColorStop(0, 'rgba(42,54,72,' + (mendung * 0.22).toFixed(3) + ')');
      grAtm.addColorStop(0.55, 'rgba(64,78,96,' + (mendung * 0.16).toFixed(3) + ')');
      grAtm.addColorStop(1, 'rgba(38,48,64,' + (mendung * 0.14).toFixed(3) + ')');
      cx.fillStyle = grAtm;
      cx.fillRect(0, 0, W, H);
    }
    /* 3. Kabut Asap Karhutla Nusantara (selimut kabut kuning-coklat hangat) */
    if (s.kabutAsap) {
      var grAsap = cx.createLinearGradient(0, 0, 0, H);
      grAsap.addColorStop(0, 'rgba(182,138,76,0.34)');
      grAsap.addColorStop(0.6, 'rgba(196,156,92,0.28)');
      grAsap.addColorStop(1, 'rgba(155,120,68,0.22)');
      cx.fillStyle = grAsap;
      cx.fillRect(0, 0, W, H);
    }
    cx.restore();
  }
  function gambarLangit(m, t, s) {
    var l = langit(m), cw = s && s.cuacaInfo, mendung = cw ? (cw.mendung || 0) : 0;
    var gr = cx.createLinearGradient(0, 0, 0, H * 0.75);
    gr.addColorStop(0, l[0]); gr.addColorStop(1, l[1]);
    cx.fillStyle = gr; cx.fillRect(0, 0, W, H);
    var gp = gelap(m);
    if (gp > 0.3 && mendung < 0.75) {
      var starVis = (gp - 0.3) * (1 - mendung * 0.85);
      for (var i = 0; i < 42; i++) {
        var kel = 0.45 + 0.55 * Math.sin(t / 700 + i * 3.1);
        cx.fillStyle = 'rgba(255,255,240,' + (starVis * 0.92 * kel).toFixed(3) + ')';
        cx.fillRect(acak(i + 50) * W, acak(i + 90) * H * 0.48, (i % 5 === 0) ? 2.1 : 1.4, (i % 5 === 0) ? 2.1 : 1.4);
      }
    }
    /* Matahari (05.45–18.15) dengan pencahayaan atmosfer realistis; Bulan (18.15–05.45) dengan fase & arah sabit astronomis nyata */
    var siang = m >= 345 && m <= 1095;
    if (siang) {
      var p = (m - 345) / 750;
      var elev = Math.sin(p * Math.PI); /* 0 di cakrawala, 1 di zenith */
      var x = 24 + p * (W - 48), y = H * 0.44 - elev * H * 0.33;
      var redupAwan = 1 - mendung * 0.75;
      var wrInti = elev < 0.25 ? '#ff9d52' : elev < 0.5 ? '#ffd479' : '#fff9dc';
      var wrHalo = elev < 0.25 ? 'rgba(255,140,70,' : 'rgba(255,236,165,';
      /* korona sinar matahari berlapis */
      var grS = cx.createRadialGradient(x, y, 6, x, y, 72 + (1 - elev) * 28);
      grS.addColorStop(0, wrHalo + (0.55 * redupAwan).toFixed(3) + ')');
      grS.addColorStop(0.4, wrHalo + (0.20 * redupAwan).toFixed(3) + ')');
      grS.addColorStop(1, wrHalo + '0)');
      cx.fillStyle = grS; cx.beginPath(); cx.arc(x, y, 98, 0, Math.PI * 2); cx.fill();
      if (redupAwan > 0.25) {
        cx.save(); cx.globalAlpha = redupAwan;
        bulat(x, y, 16 + (1 - elev) * 4, wrInti);
        bulat(x, y, 11 + (1 - elev) * 2, '#fffef2');
        cx.restore();
      }
    } else {
      var pm = ((m + 345) % 1440) / 690;
      var elevM = Math.sin(Math.min(1, Math.max(0, pm)) * Math.PI);
      var xm = 30 + Math.min(1, Math.max(0, pm)) * (W - 60), ym = H * 0.40 - elevM * H * 0.28;
      var fb = (s && s.faseBulan) || { fase: 0.2, iluminasi: 0.35, waxing: true };
      var rB = 15, visM = Math.max(0.12, (1 - mendung * 0.8));
      /* cahaya halo bulan proporsional dengan iluminasi fase (purnama paling terang!) */
      var grM = cx.createRadialGradient(xm, ym, rB * 0.5, xm, ym, 34 + fb.iluminasi * 44);
      grM.addColorStop(0, 'rgba(220,235,255,' + ((0.16 + fb.iluminasi * 0.34) * visM).toFixed(3) + ')');
      grM.addColorStop(1, 'rgba(220,235,255,0)');
      cx.fillStyle = grM; cx.beginPath(); cx.arc(xm, ym, 78, 0, Math.PI * 2); cx.fill();
      /* gambar piringan bulan & arah sabit realistis (waxing = sisi terang kanan/barat, waning = sisi terang kiri/timur, diputar halus mengikuti busur ekuatorial) */
      cx.save(); cx.translate(xm, ym);
      cx.rotate(fb.waxing ? -0.35 : 0.35);
      cx.globalAlpha = visM;
      /* sisi gelap earthshine lembut */
      bulat(0, 0, rB, 'rgba(30,44,74,.45)');
      /* sisi terang sesuai fase sinodis 0..1 */
      if (fb.iluminasi > 0.03) {
        cx.save();
        cx.beginPath(); cx.arc(0, 0, rB, 0, Math.PI * 2); cx.clip();
        bulat(0, 0, rB, '#f7f4e2');
        /* bayangan terminator: offset bergeser mulus dari penuh (-2r) ke purnama (0) ke penuh (+2r) */
        if (fb.iluminasi < 0.96) {
          var geserSh = (fb.waxing ? -1 : 1) * (fb.iluminasi * 2 * rB);
          bulat(geserSh, 0, rB * 1.02, l[0]);
        }
        cx.restore();
      }
      cx.restore();
    }
    gambarAwanLangit(m, t, cw);
  }

  function gambarRuko(m, dasar) {
    var gp = gelap(m);
    ruko.forEach(function (r) {
      var y0 = dasar - r.h;
      kotak(r.x, y0, r.w, r.h, r.warna);
      kotak(r.x - 3, y0 - 6, r.w + 6, 8, 'rgba(0,0,0,.18)');
      /* papan nama ruko, sengaja kosong */
      kotak(r.x + 6, dasar - 70, r.w - 12, 16, r.papan);
      /* pintu gulung lantai dasar */
      kotak(r.x + 8, dasar - 50, r.w - 16, 50, '#8d969b');
      cx.fillStyle = 'rgba(0,0,0,.12)';
      for (var j = dasar - 48; j < dasar; j += 5) cx.fillRect(r.x + 8, j, r.w - 16, 1);
      /* jendela lantai atas */
      for (var lt = 1; lt < r.lantai; lt++) {
        var yj = dasar - 70 - lt * 62 + 14;
        for (var k = 0; k < 2; k++) {
          var xj = r.x + 10 + k * (r.w - 20) / 2, wj = (r.w - 30) / 2;
          var nyala = acak(r.seed + lt * 5 + k) > 0.45;
          kotak(xj, yj, wj, 30, nyala && gp > 0.2 ? 'rgba(255,214,130,' + (0.35 + gp * 0.6).toFixed(2) + ')' : 'rgba(40,60,80,.35)');
          kotak(xj + wj / 2 - 0.5, yj, 1, 30, 'rgba(0,0,0,.2)');
        }
      }
    });
  }

  function gambarTiang(dasar, yAtas) {
    kotak(26, yAtas, 6, dasar - yAtas + 6, '#3b3f46');
    kotak(12, yAtas + 14, 34, 4, '#3b3f46');
    cx.strokeStyle = 'rgba(30,30,40,.7)'; cx.lineWidth = 1.2;
    [yAtas + 15, yAtas + 22, yAtas + 30].forEach(function (y, i) {
      cx.beginPath(); cx.moveTo(-10, y + 20 + i * 6); cx.quadraticCurveTo(10, y + 8, 29, y);
      cx.quadraticCurveTo(200, y + 46 + i * 8, W + 10, y + 6 + i * 4); cx.stroke();
    });
    /* trafo kecil di tiang */
    kotakBulat(18, yAtas + 46, 22, 26, 3, '#5d646c');
  }

  function gambarJalan(trotoar, jalan, s, t) {
    var hujan = !!(s && s.hujan);
    var grTr = cx.createLinearGradient(0, trotoar, 0, jalan);
    grTr.addColorStop(0, hujan ? '#8b8a84' : '#c6bfb3');
    grTr.addColorStop(1, hujan ? '#72726d' : '#aba498');
    cx.fillStyle = grTr; cx.fillRect(0, trotoar, W, jalan - trotoar);
    cx.fillStyle = 'rgba(0,0,0,.07)';
    for (var x = 0; x < W; x += 24) cx.fillRect(x, trotoar, 1, jalan - trotoar);
    /* bayangan tepi trotoar 3D (PS2 depth) */
    kotak(0, trotoar, W, 3, 'rgba(0,0,0,.14)');
    /* trotoar bercat hitam putih khas jalan kota */
    for (var x2 = 0; x2 < W; x2 += 20) kotak(x2, jalan - 7, 10, 7, (x2 / 20) % 2 ? '#f3f1ea' : '#26292e');
    /* aspal gradien perspektif 3D + tekstur agregat kasar + genangan air reflektif */
    var grAsp = cx.createLinearGradient(0, jalan, 0, H + 120);
    grAsp.addColorStop(0, hujan ? '#262d38' : '#454a52');
    grAsp.addColorStop(0.45, hujan ? '#1d232c' : '#383d45');
    grAsp.addColorStop(1, hujan ? '#141820' : '#2c3037');
    cx.fillStyle = grAsp; cx.fillRect(0, jalan, W, H - jalan + 400);
    if (texAspalHD) {
      for (var gxS = 0; gxS < W; gxS += 160) cx.drawImage(texAspalHD, gxS, jalan, 160, Math.min(260, H - jalan + 60));
    }
    /* garis tepi jalan & marka jalan */
    kotak(0, jalan + 2, W, 2, 'rgba(255,255,255,.18)');
    cx.fillStyle = hujan ? '#d6d2c2' : '#e9e4d4';
    for (var x3 = 8; x3 < W; x3 += 46) cx.fillRect(x3, jalan + 58, 24, 3);
    /* efek pantulan basah & genangan cermin langit saat hujan */
    if (hujan) {
      var shim = 0.08 + 0.04 * Math.sin((t || 0) / 380);
      for (var rx = 18; rx < W; rx += 64) {
        var grRef = cx.createLinearGradient(rx, jalan + 8, rx, jalan + 125);
        grRef.addColorStop(0, 'rgba(180,220,255,' + shim.toFixed(3) + ')');
        grRef.addColorStop(0.5, 'rgba(255,220,160,' + (shim * 0.7).toFixed(3) + ')');
        grRef.addColorStop(1, 'rgba(140,180,220,0)');
        cx.fillStyle = grRef;
        cx.fillRect(rx, jalan + 8, 22, 118);
      }
      var lSt = langit(((s && s.menit) || 600) % 1440);
      [[78, jalan + 36, 32, 7], [228, jalan + 46, 38, 8], [326, jalan + 32, 24, 5.5]].forEach(function (pd) {
        cx.fillStyle = 'rgba(14,18,26,0.58)';
        cx.beginPath(); cx.ellipse(pd[0], pd[1], pd[2] + 4, pd[3] + 2, 0, 0, Math.PI * 2); cx.fill();
        var gpP = cx.createLinearGradient(pd[0] - pd[2], pd[1] - pd[3], pd[0] + pd[2], pd[1] + pd[3]);
        gpP.addColorStop(0, lSt[0]); gpP.addColorStop(0.55, lSt[1]); gpP.addColorStop(1, lSt[0]);
        cx.save(); cx.globalAlpha = 0.62; cx.fillStyle = gpP;
        cx.beginPath(); cx.ellipse(pd[0], pd[1], pd[2], pd[3], 0, 0, Math.PI * 2); cx.fill();
        cx.strokeStyle = 'rgba(255,255,255,0.28)'; cx.lineWidth = 0.9;
        cx.beginPath(); cx.ellipse(pd[0], pd[1] - 0.6, pd[2] * 0.82, pd[3] * 0.65, 0, Math.PI * 1.1, Math.PI * 1.9); cx.stroke();
        cx.restore();
      });
    }
  }

  function gambarKursi(x, y, warna) {
    kotak(x, y - 22, 26, 5, warna);
    kotak(x + 2, y - 17, 4, 17, warna); kotak(x + 20, y - 17, 4, 17, warna);
    kotak(x + 4, y - 9, 18, 2, warna);
  }

  function gambarPisang(x, y, t) {
    kotakBulat(x - 12, y - 20, 24, 20, 4, '#9c5b38');
    var goyang = Math.sin(t / 900) * 0.05;
    for (var i = 0; i < 5; i++) {
      var a = -Math.PI / 2 + (i - 2) * 0.5 + goyang;
      cx.save(); cx.translate(x, y - 20); cx.rotate(a);
      cx.fillStyle = i % 2 ? '#3f9a4f' : '#4fae5c';
      cx.beginPath(); cx.ellipse(26, 0, 28, 9, 0, 0, Math.PI * 2); cx.fill();
      cx.restore();
    }
    kotak(x - 2, y - 44, 4, 24, '#5e8c3a');
  }

  /* skala barista disamakan dengan skala pembeli (kepala r=11, badan 22x26) + menyesuaikan gender cewek/cowok */
  function gambarBarista(x, y, t, gender, tpCustom) {
    var bob = Math.sin(t / 420) * 0.9, p = anim.pantulBarista, sk = 1 + Math.sin(p * 18) * 0.08 * p;
    var cewek = gender === 'cewek';
    var tp = tpCustom || tampilanDariNama(cewek ? 'BaristaP' : 'BaristaL', cewek ? 'cewek' : 'cowok', false);
    cx.save(); cx.translate(x, y + bob); cx.scale(0.74 / sk, 0.74 * sk);
    kotakBulat(-17, -6, 34, 30, 10, cewek ? '#7a3e54' : '#2c3e50');
    kotakBulat(-11, -2, 22, 26, 6, '#f2a516');
    gambarKepalaPotret(0, -23, 14.5, cewek ? 'cewek' : 'cowok', tp, { baju: cewek ? '#7a3e54' : '#2c3e50', merem: anim.kedip > 0, topiBarista: tp.rambut !== 'hijab' && tp.rambut !== 'peci' });
    cx.restore();
  }

  function rantaiLampu(x1, y1, x2, y2, nyala, t) {
    cx.strokeStyle = '#2b2b2b'; cx.lineWidth = 1;
    var my = Math.max(y1, y2) + 18;
    cx.beginPath(); cx.moveTo(x1, y1); cx.quadraticCurveTo((x1 + x2) / 2, my, x2, y2); cx.stroke();
    for (var i = 1; i < 10; i++) {
      var u = i / 10, bx = (1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * (x1 + x2) / 2 + u * u * x2, by = (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * my + u * u * y2;
      if (nyala > 0) {
        var kel = 0.85 + 0.15 * Math.sin(t / 300 + i);
        var gr = cx.createRadialGradient(bx, by + 4, 0, bx, by + 4, 14);
        gr.addColorStop(0, 'rgba(255,210,120,' + (0.55 * nyala * kel).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,210,120,0)');
        cx.fillStyle = gr; cx.fillRect(bx - 14, by - 10, 28, 28);
      }
      bulat(bx, by + 4, 3, nyala > 0 ? '#ffe3a1' : '#d8d2c0');
    }
  }

  function gambarKedai(x0, dasar, s, t, m) {
    var tier = s.tier || 1, w = tier === 1 ? 180 : 196, h = tier === 1 ? 132 : 144, y0 = dasar - h, p = anim.pantulKedai, sk = 1 + Math.sin(p * 16) * 0.05 * p;
    if (tier > 1) x0 -= 16;
    var ruko = tier === 4, warnaBadan = ruko ? '#e9e3d6' : '#1f8a80', warnaTepi = ruko ? '#c9bfa9' : '#176d65';
    cx.save(); cx.translate(x0 + w / 2, dasar); cx.scale(1 / sk, sk); cx.translate(-(x0 + w / 2), -dasar);
    /* lantai atas: rooftop (tahap 3) atau lantai dua ruko (tahap 4) */
    if (tier === 3) {
      kotak(x0 + 10, y0 - 70, w - 20, 64, '#2f6fb0'); cx.fillStyle = 'rgba(0,0,0,.12)'; for (var r1 = x0 + 14; r1 < x0 + w - 10; r1 += 9) cx.fillRect(r1, y0 - 70, 3, 64);
      kotak(x0 + 4, y0 - 82, w - 8, 4, '#3b3f46'); for (var r2 = x0 + 8; r2 < x0 + w - 4; r2 += 14) kotak(r2, y0 - 82, 2, 14, '#3b3f46');
      cx.fillStyle = '#f2a516'; cx.beginPath(); cx.moveTo(x0 + w - 60, y0 - 104); cx.lineTo(x0 + w - 30, y0 - 90); cx.lineTo(x0 + w - 90, y0 - 90); cx.closePath(); cx.fill(); kotak(x0 + w - 61, y0 - 92, 2, 20, '#3b3f46');
    }
    if (ruko) {
      kotak(x0 - 10, y0 - 120, w + 20, 120, '#d9cfbb'); kotak(x0 - 14, y0 - 126, w + 28, 8, '#b8ab90');
      for (var r3 = 0; r3 < 3; r3++) kotak(x0 + 14 + r3 * (w - 28) / 3, y0 - 100, (w - 28) / 3 - 10, 56, 'rgba(60,90,110,.55)');
      kotakBulat(x0 + w - 40, y0 - 40, 26, 16, 3, '#f3f1ea');
    }
    /* bayangan */
    cx.fillStyle = 'rgba(0,0,0,.18)'; cx.beginPath(); cx.ellipse(x0 + w / 2, dasar + 2, w / 2 + 8, 7, 0, 0, Math.PI * 2); cx.fill();
    /* badan kontainer bergelombang */
    kotak(x0, y0, w, h, warnaBadan);
    cx.fillStyle = 'rgba(0,0,0,.10)';
    if (!ruko) for (var i = x0 + 4; i < x0 + w; i += 9) cx.fillRect(i, y0, 3, h);
    kotak(x0 - 3, y0 - 6, w + 6, 8, warnaTepi);
    kotak(x0 - 3, dasar - 6, w + 6, 6, warnaTepi);
    /* bukaan jendela */
    var bx = x0 + 18, by = y0 + 30, bw = w - 36, bh = 54;
    kotak(bx, by, bw, bh, '#3b2a22');
    kotak(bx + 6, by + 12, bw - 12, 3, '#6b4a36'); kotak(bx + 6, by + 30, bw - 12, 3, '#6b4a36');
    for (var j = 0; j < 6; j++) kotakBulat(bx + 10 + j * 22, by + 2, 10, 10, 2, j % 2 ? '#c9a27a' : '#e0d3b8');
    /* moka pot dan grinder */
    kotak(bx + bw - 34, by + 34, 12, 16, '#b8bfc4'); kotak(bx + bw - 36, by + 32, 16, 4, '#8d969b');
    kotak(bx + 14, by + 30, 14, 20, '#2f2f33');
    if (anim.rolling > 0.35) {
      var stafG = s.stafGender || [];
      var ekstra = Math.min(2, Math.max(0, stafG.length || (s.staf || 0)));
      for (var e = 0; e < ekstra; e++) {
        cx.save();
        cx.translate(e === 0 ? bx + 28 : bx + bw - 28, by + bh - 4);
        gambarBarista(0, 0, t + 900 * (e + 1), stafG[e] || (e % 2 ? 'cewek' : 'cowok'));
        cx.restore();
      }
      if (s.anakBantu && s.anakBantu.length) {
        cx.save();
        cx.translate(bx + bw - 14, by + bh - 1);
        cx.scale(0.82, 0.82);
        gambarBarista(0, 0, t + 500, s.anakBantu[0]);
        cx.restore();
      }
      gambarBarista(bx + bw / 2, by + bh - 4, t, s.gender, s.tampilan);
    }
    /* rolling door */
    var tutup = (1 - anim.rolling) * bh;
    if (tutup > 0.5) {
      kotak(bx, by, bw, tutup, '#9aa3a6');
      cx.fillStyle = 'rgba(0,0,0,.14)';
      for (var r = by + 4; r < by + tutup; r += 5) cx.fillRect(bx, r, bw, 1);
      kotak(bx + bw / 2 - 8, by + tutup - 5, 16, 3, '#6d7477');
    }
    /* meja konter kayu */
    kotak(bx - 8, by + bh, bw + 16, 9, '#b97a46'); kotak(bx - 8, by + bh + 9, bw + 16, 3, '#8f5a31');
    /* tenda garis */
    for (var a = 0; a < 8; a++) {
      cx.fillStyle = a % 2 ? '#fdf7ea' : '#f2a516';
      var ax = bx - 10 + a * (bw + 20) / 8, aw = (bw + 20) / 8;
      cx.beginPath(); cx.moveTo(ax + 4, by - 16); cx.lineTo(ax + aw + 4, by - 16); cx.lineTo(ax + aw, by - 2); cx.lineTo(ax, by - 2); cx.closePath(); cx.fill();
      bulat(ax + aw / 2, by - 2, aw / 2, a % 2 ? '#fdf7ea' : '#f2a516');
    }
    /* papan nama (bisa custom nama toko) */
    var namaToko = (s.namaToko && s.namaToko.trim()) ? s.namaToko.trim() : 'Kopi Kontainer';
    kotakBulat(x0 + 20, y0 - 34, w - 40, 26, 6, '#2a1d1a');
    var ukFont = namaToko.length > 18 ? 11 : namaToko.length > 14 ? 13 : 15;
    cx.fillStyle = '#ffe3a1'; cx.font = '700 ' + ukFont + 'px "Baloo 2", "Nunito", system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText(namaToko.slice(0, 24), x0 + w / 2, y0 - 20);
    cx.restore();
    /* gelap malam di atas kedai, lalu cahaya dari dalam saat buka */
    var gp = gelap(m);
    if (gp > 0) { cx.fillStyle = 'rgba(10,18,45,' + (gp * 0.28).toFixed(3) + ')'; cx.fillRect(x0 - 4, y0 - 36, w + 8, h + 40); }
    if (anim.rolling > 0.05 && gp > 0) {
      var gr = cx.createRadialGradient(x0 + w / 2, by + bh / 2, 10, x0 + w / 2, by + bh / 2, 140);
      gr.addColorStop(0, 'rgba(255,200,120,' + (0.35 * gp * anim.rolling).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,200,120,0)');
      cx.fillStyle = gr; cx.fillRect(x0 - 100, by - 100, w + 200, 260);
    }
    return { x: x0, y: y0 - 34, w: w, h: h + 34, bx: bx, by: by, bw: bw, bh: bh };
  }

  function gambarPapanMenu(x, dasar) {
    cx.fillStyle = '#6b4a36';
    cx.beginPath(); cx.moveTo(x, dasar); cx.lineTo(x + 12, dasar - 52); cx.lineTo(x + 24, dasar); cx.lineWidth = 3; cx.strokeStyle = '#6b4a36'; cx.stroke();
    kotakBulat(x - 2, dasar - 50, 28, 34, 3, '#263238');
    cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = 1.2;
    cx.beginPath(); cx.moveTo(x + 6, dasar - 40); cx.lineTo(x + 18, dasar - 40); cx.lineTo(x + 16, dasar - 26); cx.lineTo(x + 8, dasar - 26); cx.closePath(); cx.stroke();
    cx.beginPath(); cx.arc(x + 19, dasar - 34, 3, -Math.PI / 2, Math.PI / 2); cx.stroke();
  }

  /* lalu lintas jalan raya: motor (skutik, maxi, sport) & mobil (MPV, hatchback, SUV, pikap, sedan) melintas cepat */
  function aturMotor(dt, m, kec) {
    var ramai = m < 300 ? 0.2 : m < 420 ? 0.65 : m < 1260 ? 1.15 : 0.45;
    anim.tMotor -= dt * Math.max(0.5, kec);
    if (anim.tMotor <= 0) {
      anim.tMotor = (1100 + Math.random() * 2200) / ramai;
      var kanan = Math.random() < 0.5;
      var jadiMobil = Math.random() < 0.38;
      if (jadiMobil) {
        var bentukList = ['mpv', 'hatch', 'suv', 'pikap', 'sedan'];
        var bentuk = bentukList[Math.floor(Math.random() * bentukList.length)];
        var warnaMobil = ['#f0ede6', '#2b2f36', '#b8bcc0', '#c83e36', '#2e5c8a', '#7c858e'][Math.floor(Math.random() * 6)];
        anim.motor.push({ jenis: 'mobil', bentuk: bentuk, x: kanan ? -110 : W + 110, arah: kanan ? 1 : -1, jalur: kanan ? 1 : 0,
          v: 155 + Math.random() * 95, warna: warnaMobil });
      } else {
        var tipeList = ['skutik', 'skutik', 'maxi', 'sport'];
        var tipe = tipeList[Math.floor(Math.random() * tipeList.length)];
        var warna = ['#d9443a', '#2f6fb0', '#23262b', '#e8e4da', '#2f8f5b', '#d48b1c'][Math.floor(Math.random() * 6)];
        anim.motor.push({ jenis: 'motor', tipe: tipe, x: kanan ? -70 : W + 70, arah: kanan ? 1 : -1, jalur: kanan ? 1 : 0,
          v: 175 + Math.random() * 115, warna: warna, jaket: ['#2e4057', '#1f6f50', '#333', '#6b4a36', '#3d5a80'][Math.floor(Math.random() * 5)],
          helm: ['#f2a516', '#f4f4f0', '#1f8a80', '#1d1f23', '#d9443a'][Math.floor(Math.random() * 5)] });
      }
    }
    var lajuFaktor = Math.min(Math.max(kec, 0.5), 2.2);
    anim.motor.forEach(function (mt) { mt.x += mt.arah * mt.v * dt / 1000 * lajuFaktor; mt.roda = (mt.roda || 0) + mt.v * dt / 1000 * 0.5; });
    anim.motor = anim.motor.filter(function (mt) { return mt.x > -130 && mt.x < W + 130; });
    /* Animasi pejalan kaki lalu-lalang di trotoar/pinggir jalan (ramai siang, sepi tengah malam) */
    var jamP = ((m || 480) % 1440) / 60;
    var ramaiP = (jamP >= 6 && jamP < 21) ? 1.15 : 0.25;
    anim.tPejalan -= dt * Math.max(0.5, kec);
    if (anim.tPejalan <= 0 && anim.pejalan.length < 6) {
      anim.tPejalan = (1800 + Math.random() * 2600) / ramaiP;
      var keKanan = Math.random() < 0.5;
      anim.pejalan.push({
        x: keKanan ? -28 : W + 28,
        arah: keKanan ? 1 : -1,
        v: 24 + Math.random() * 18,
        skala: 0.90 + Math.random() * 0.12,
        baju: ['#d9534f', '#2e7d9b', '#3f8f5b', '#e29e2e', '#7c5aa8', '#f0f2f5', '#2c3e50'][Math.floor(Math.random() * 7)],
        celana: ['#2b3540', '#3d4c5c', '#1f2937', '#54433a'][Math.floor(Math.random() * 4)],
        kulit: ['#f4c9a0', '#e3b086', '#c68d63'][Math.floor(Math.random() * 3)],
        rambut: ['#1b1817', '#332620', '#2b2421'][Math.floor(Math.random() * 3)],
        payung: ['#1f8a80', '#d9443a', '#2563eb', '#f59e0b', '#7c3aed'][Math.floor(Math.random() * 5)],
        hijab: Math.random() < 0.38,
        fase: Math.random() * 10
      });
    }
    anim.pejalan.forEach(function (pj) { pj.x += pj.arah * pj.v * dt / 1000 * Math.min(1.6, lajuFaktor); });
    anim.pejalan = anim.pejalan.filter(function (pj) { return pj.x > -45 && pj.x < W + 45; });
  }
  function gambarPejalanKaki(pj, yTrotoar, t, hujan) {
    var sk = pj.skala || 0.78;
    var ayun = Math.sin(t / 130 + pj.fase) * 5.2;
    var bob = Math.abs(Math.sin(t / 130 + pj.fase)) * 1.8;
    cx.save();
    cx.translate(pj.x, yTrotoar);
    cx.scale(pj.arah * sk, sk);
    /* bayangan kontak halus PS2 */
    cx.fillStyle = 'rgba(0,0,0,.22)';
    cx.beginPath(); cx.ellipse(0, 1, 11, 3.2, 0, 0, Math.PI * 2); cx.fill();
    cx.translate(0, -bob);
    /* kaki berjalan bergantian */
    cx.strokeStyle = pj.celana; cx.lineWidth = 4.6; cx.lineCap = 'round';
    cx.beginPath(); cx.moveTo(-2, -20); cx.lineTo(-2 + ayun, -2); cx.stroke();
    cx.beginPath(); cx.moveTo(2, -20); cx.lineTo(2 - ayun, -2); cx.stroke();
    /* badan & lengan mengayun */
    kotakBulat(-7.5, -42, 15, 24, 5, pj.baju);
    cx.strokeStyle = pj.baju; cx.lineWidth = 3.8;
    cx.beginPath(); cx.moveTo(0, -37); cx.lineTo(-ayun * 0.9, -22); cx.stroke();
    /* kepala & rambut/hijab */
    bulat(0, -50, 7.2, pj.kulit);
    if (pj.hijab) {
      cx.fillStyle = pj.baju; cx.beginPath(); cx.arc(0, -51, 8, Math.PI * 0.85, Math.PI * 2.15); cx.fill();
      kotakBulat(-7.5, -49, 15, 9, 3, pj.baju);
    } else {
      cx.fillStyle = pj.rambut; cx.beginPath(); cx.arc(0, -52, 7.3, Math.PI * 0.9, Math.PI * 2.1); cx.fill();
    }
    /* payung otomatis saat hujan */
    if (hujan) {
      cx.strokeStyle = '#334155'; cx.lineWidth = 1.6;
      cx.beginPath(); cx.moveTo(4, -30); cx.lineTo(4, -64); cx.stroke();
      cx.fillStyle = pj.payung;
      cx.beginPath(); cx.arc(4, -61, 16, Math.PI, 0); cx.closePath(); cx.fill();
    }
    cx.restore();
  }
  function gambarMotor(mt, jalan, m, t) {
    var y = jalan + 44 + mt.jalur * 46, d = mt.arah;
    if (mt.jenis === 'mobil') {
      /* mobil melintas dengan desain realistis */
      cx.save();
      cx.translate(mt.x, y + 10);
      cx.scale(d * 0.92, 0.92);
      gambarMobilRealistis(mt.bentuk, mt.warna, mt.roda || 0, gelap(m) > 0.4);
      cx.restore();
      return;
    }
    cx.save(); cx.translate(mt.x, y); cx.scale(d, 1);
    var pt = mt.roda || 0;
    /* bayangan */
    cx.fillStyle = 'rgba(0,0,0,.26)'; cx.beginPath(); cx.ellipse(0, 13, 29, 4.2, 0, 0, Math.PI * 2); cx.fill();
    /* roda depan & belakang bervelg palang */
    [-19, 19].forEach(function (rx) {
      bulat(rx, 5, 8.5, '#191b1e');
      bulat(rx, 5, 4.8, '#8d969e');
      cx.strokeStyle = '#3a4046'; cx.lineWidth = 1.2; cx.beginPath();
      for (var s = 0; s < 3; s++) { var a = pt + s * Math.PI / 3; cx.moveTo(rx + Math.cos(a) * 4.5, 5 + Math.sin(a) * 4.5); cx.lineTo(rx - Math.cos(a) * 4.5, 5 - Math.sin(a) * 4.5); }
      cx.stroke();
      bulat(rx, 5, 1.8, '#cfd6dc');
    });
    /* knalpot */
    cx.strokeStyle = '#555c63'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(-24, 3); cx.lineTo(-8, 6); cx.stroke();
    if (mt.tipe === 'sport') {
      /* motor sport (CBR / R15 / Ninja): fairing aerodinamis, tangki menonjol, buntut runcing */
      cx.fillStyle = mt.warna;
      cx.beginPath(); cx.moveTo(-24, -10); cx.lineTo(-4, -10); cx.lineTo(12, -16); cx.lineTo(24, -10); cx.lineTo(18, 2); cx.lineTo(-8, 2); cx.closePath(); cx.fill();
      kotakBulat(-22, -11, 14, 4, 2, '#1f2226'); /* jok split */
      kotakBulat(-2, -16, 13, 7, 3, mt.warna); /* tangki */
      /* windshield sport */
      cx.fillStyle = 'rgba(170,215,240,.75)';
      cx.beginPath(); cx.moveTo(15, -14); cx.lineTo(23, -10); cx.lineTo(19, -20); cx.closePath(); cx.fill();
      /* fork depan */
      cx.strokeStyle = '#b9933a'; cx.lineWidth = 2.4; cx.beginPath(); cx.moveTo(19, 5); cx.lineTo(14, -13); cx.stroke();
      /* pengendara merunduk */
      kotak(-8, -12, 6, 13, '#26323c');
      cx.save(); cx.translate(-3, -24); cx.rotate(0.45);
      kotakBulat(-7, 0, 14, 17, 5, mt.jaket);
      cx.restore();
      bulat(4, -27, 7.5, mt.helm);
      kotakBulat(5, -29, 7, 4, 1.5, 'rgba(20,30,40,.85)'); /* visor */
    } else if (mt.tipe === 'maxi') {
      /* maxi-skutik (NMAX / PCX): bodi bongsor + windshield tinggi */
      cx.fillStyle = mt.warna;
      cx.beginPath(); cx.moveTo(-25, -8); cx.lineTo(-2, -7); cx.lineTo(6, -2); cx.lineTo(15, -15); cx.lineTo(24, -11); cx.lineTo(20, 3); cx.lineTo(-21, 3); cx.closePath(); cx.fill();
      kotakBulat(-22, -12, 22, 6, 3, '#23262b'); /* jok lebar */
      /* windshield tinggi */
      cx.fillStyle = 'rgba(180,220,245,.7)';
      cx.beginPath(); cx.moveTo(15, -14); cx.lineTo(22, -12); cx.lineTo(19, -24); cx.lineTo(14, -22); cx.closePath(); cx.fill();
      cx.strokeStyle = '#4a525a'; cx.lineWidth = 2.2; cx.beginPath(); cx.moveTo(19, 5); cx.lineTo(15, -12); cx.stroke();
      /* pengendara tegak santai */
      kotak(-5, -10, 6, 13, '#2b3945');
      kotakBulat(-11, -26, 13, 19, 5, mt.jaket);
      cx.strokeStyle = mt.jaket; cx.lineWidth = 3.5; cx.beginPath(); cx.moveTo(-2, -21); cx.lineTo(12, -16); cx.stroke();
      bulat(-4, -33, 7.2, mt.helm);
      kotakBulat(-1, -35, 6.5, 4, 1.5, 'rgba(20,30,40,.8)');
    } else {
      /* skutik harian (BeAT / Vario): dek rata, bodi depan meruncing, lampu LED */
      cx.fillStyle = mt.warna;
      cx.beginPath(); cx.moveTo(-23, -8); cx.lineTo(-4, -7); cx.lineTo(2, 1); cx.lineTo(12, 1); cx.lineTo(15, -16); cx.lineTo(22, -13); cx.lineTo(19, 2); cx.lineTo(-19, 2); cx.closePath(); cx.fill();
      kotakBulat(-21, -11, 18, 5, 2.5, '#222'); /* jok */
      kotak(13, -19, 4, 6, '#333'); /* batok setang */
      cx.strokeStyle = '#555'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(19, 5); cx.lineTo(15, -14); cx.stroke();
      /* pengendara */
      kotak(-3, -10, 5.5, 13, '#2c3a47');
      kotakBulat(-10, -25, 12, 18, 5, mt.jaket);
      cx.strokeStyle = mt.jaket; cx.lineWidth = 3.2; cx.beginPath(); cx.moveTo(-2, -20); cx.lineTo(12, -16); cx.stroke();
      bulat(-4, -32, 7, mt.helm);
      kotakBulat(-1, -34, 6, 3.6, 1.5, 'rgba(20,30,40,.8)');
    }
    /* lampu depan & belakang */
    kotak(21, -11, 3, 4, '#fff4b8');
    kotak(-24, -8, 2.5, 4, '#e03c31');
    if (gelap(m) > 0.4) {
      var gr = cx.createRadialGradient(24, -9, 0, 24, -9, 46);
      gr.addColorStop(0, 'rgba(255,244,190,.55)'); gr.addColorStop(1, 'rgba(255,244,190,0)');
      cx.fillStyle = gr; cx.fillRect(20, -34, 56, 52);
    }
    cx.restore();
  }
  function geserHex(hexStr, d) {
    var h = hex(hexStr || '#cbd5e1');
    return 'rgb(' + Math.max(0, Math.min(255, h[0] + d)) + ',' + Math.max(0, Math.min(255, h[1] + d)) + ',' + Math.max(0, Math.min(255, h[2] + d)) + ')';
  }
  var PROFIL_MOBIL = {
    airev: 'micro',
    ayla: 'hatch', agya: 'hatch', brio: 'hatch', binguoev: 'hatch', cloudev: 'hatch',
    calya: 'lmpv', sigra: 'lmpv', xenia: 'lmpv', avanza: 'lmpv', avanzahev27: 'lmpv', ertiga: 'lmpv', terios: 'csuv', rush: 'csuv', xl7: 'csuv', veloz: 'lmpv', xpander: 'lmpv', stargazer: 'lmpv', bydm6: 'lmpv',
    innova: 'innova', zenix: 'innova', zenix27: 'innova',
    raize: 'csuv', brv: 'csuv', yariscross: 'csuv', atto3: 'csuv', creta: 'csuv', hrv: 'csuv', hrvhev26: 'csuv', crv: 'csuv', ioniq5: 'csuv', sealion7: 'csuv',
    fortuner: 'bigsuv', fortuner28: 'bigsuv', pajerosport: 'bigsuv', palisade: 'bigsuv', landcruiser: 'bigsuv',
    jimny: 'boxy4x4', mercg63: 'boxy4x4',
    alphard: 'luxvan', vellfire: 'luxvan', lexuslm: 'luxvan',
    hiace: 'vancom', staria: 'staria',
    civicrs: 'sedan', bydseal: 'sedan', camry: 'sedan', model3: 'sedan', bmw330i: 'sedan',
    gr86: 'sport', porsche911: 'sport',
    granmax: 'pikap', carry: 'pikap', l300: 'pikap', traga: 'pikap',
    hilux: 'pikapdc', hiluxdc: 'pikapdc', triton: 'pikapdc'
  };
  function profilMobilDari(id, bentuk) {
    var bid = String(id || '').replace(/-bekas$/, '');
    if (PROFIL_MOBIL[bid]) return PROFIL_MOBIL[bid];
    if (bentuk === 'van') return 'luxvan';
    if (bentuk === 'sport') return 'sport';
    if (bentuk === 'sedan') return 'sedan';
    if (bentuk === 'suv') return 'csuv';
    if (bentuk === 'hatch') return 'hatch';
    if (bentuk === 'pikap') return 'pikap';
    return 'lmpv';
  }
  function gambarMobilRealistis(bentuk, w, pt, lampuNyala, id) {
    var prof = profilMobilDari(id, bentuk);
    var isSport = prof === 'sport', isBoxy = prof === 'boxy4x4', isBig = prof === 'bigsuv' || isBoxy;
    var isVan = prof === 'luxvan' || prof === 'vancom' || prof === 'staria';
    var isMicro = prof === 'micro';
    var kaliperMerah = isSport || prof === 'sedan' || id === 'mercg63' || id === 'fortuner' || id === 'fortuner28' || id === 'pajerosport' || id === 'sealion7';

    /* Bayangan lembut bawah mobil */
    var lenHalf = isMicro ? 36 : prof === 'hatch' ? 49 : isVan || isBig || prof === 'pikapdc' ? 62 : 58;
    cx.fillStyle = 'rgba(0,0,0,.46)';
    cx.beginPath(); cx.ellipse(0, 2, lenHalf + 4, 6.2, 0, 0, Math.PI * 2); cx.fill();

    /* Gradien metalik 3D bodi */
    var topY = isVan ? -52 : isBig ? -49 : prof === 'innova' || prof === 'csuv' ? -45 : prof === 'lmpv' ? -43 : isMicro ? -40 : prof === 'hatch' ? -39 : isSport ? -32 : -36;
    var bg = cx.createLinearGradient(0, topY, 0, 0);
    bg.addColorStop(0, geserHex(w, 46));
    bg.addColorStop(0.36, geserHex(w, 10));
    bg.addColorStop(0.55, geserHex(w, -28));
    bg.addColorStop(0.68, geserHex(w, 16));
    bg.addColorStop(1, geserHex(w, -58));

    var glG = cx.createLinearGradient(0, topY + 2, 0, -20);
    glG.addColorStop(0, '#090f1a');
    glG.addColorStop(0.62, '#1e293b');
    glG.addColorStop(1, '#38bdf866');

    var rxA = isMicro ? -22 : prof === 'hatch' ? -31 : isBig || prof === 'pikapdc' ? -38 : -36;
    var rxB = isMicro ? 22 : prof === 'hatch' ? 31 : isBig || prof === 'pikapdc' ? 38 : 36;
    var rBan = isMicro ? 8.5 : isBig || prof === 'pikapdc' ? 12.6 : isSport ? 10.6 : 11;

    if (prof === 'pikap') {
      /* Gran Max / Carry / L300 / Traga: pikap pesek bak luas */
      cx.fillStyle = bg;
      kotakBulat(-58, -24, 72, 16, 3, bg);
      kotak(-58, -26, 72, 3, '#94a3b8');
      cx.fillStyle = bg;
      cx.beginPath();
      cx.moveTo(14, -8); cx.lineTo(14, -44); cx.lineTo(44, -44); cx.lineTo(54, -24); cx.lineTo(57, -8);
      cx.closePath(); cx.fill();
      cx.fillStyle = glG;
      cx.beginPath(); cx.moveTo(19, -24); cx.lineTo(19, -40); cx.lineTo(42, -40); cx.lineTo(50, -24); cx.closePath(); cx.fill();
      kotak(53, -21, 5, 5.5, '#e0f2fe'); kotak(-59, -21, 4, 6, '#ef4444');
    } else if (prof === 'pikapdc') {
      /* Hilux / Triton: pikap bermoncong gagah + rollbar */
      cx.fillStyle = bg;
      cx.beginPath();
      cx.moveTo(-60, -9); cx.lineTo(-60, -27); cx.lineTo(-4, -27); cx.lineTo(0, -47);
      cx.lineTo(28, -47); cx.lineTo(42, -28); cx.lineTo(60, -24); cx.lineTo(61, -9);
      cx.closePath(); cx.fill();
      kotak(-60, -29, 57, 3, '#334155');
      cx.strokeStyle = '#1e293b'; cx.lineWidth = 3;
      cx.beginPath(); cx.moveTo(-8, -28); cx.lineTo(-14, -45); cx.lineTo(-2, -45); cx.stroke();
      cx.fillStyle = glG;
      cx.beginPath(); cx.moveTo(4, -29); cx.lineTo(6, -43); cx.lineTo(26, -43); cx.lineTo(37, -29); cx.closePath(); cx.fill();
      kotak(55, -22, 6, 5, '#e0f2fe'); kotak(-61, -24, 4, 7, '#ef4444');
    } else {
      /* Bodi siluet autentik per profil */
      cx.fillStyle = bg;
      cx.beginPath();
      if (isMicro) {
        /* Wuling Air EV */
        cx.moveTo(-34, -6); cx.lineTo(-35, -24); cx.lineTo(-30, -40); cx.lineTo(12, -40);
        cx.lineTo(28, -24); cx.lineTo(35, -20); cx.lineTo(35, -6);
      } else if (prof === 'hatch') {
        /* Brio / Agya / Ayla / BinguoEV */
        cx.moveTo(-48, -6); cx.lineTo(-49, -20); cx.lineTo(-39, -39); cx.lineTo(10, -39);
        cx.lineTo(28, -24); cx.lineTo(48, -19); cx.lineTo(49, -6);
      } else if (isSport) {
        /* GR 86 / Porsche 911 */
        cx.moveTo(-57, -5); cx.lineTo(-58, -16); cx.lineTo(-44, -24); cx.lineTo(-18, -33);
        cx.lineTo(10, -32); cx.lineTo(32, -20); cx.lineTo(56, -14); cx.lineTo(58, -5);
      } else if (prof === 'sedan') {
        /* Civic RS / Camry / BMW 330i / BYD Seal / Model 3 */
        cx.moveTo(-57, -6); cx.lineTo(-58, -19); cx.lineTo(-38, -23); cx.lineTo(-22, -36);
        cx.lineTo(12, -36); cx.lineTo(30, -23); cx.lineTo(56, -18); cx.lineTo(58, -6);
      } else if (isBoxy) {
        /* Jimny / Mercedes-AMG G 63 */
        cx.moveTo(-54, -9); cx.lineTo(-55, -48); cx.lineTo(16, -48); cx.lineTo(24, -29);
        cx.lineTo(55, -27); cx.lineTo(57, -9);
      } else if (prof === 'luxvan') {
        /* Alphard / Vellfire / Lexus LM */
        cx.moveTo(-59, -6); cx.lineTo(-60, -51); cx.lineTo(28, -51); cx.lineTo(48, -28);
        cx.lineTo(60, -24); cx.lineTo(61, -6);
      } else if (prof === 'staria') {
        /* Hyundai Staria futuristik */
        cx.moveTo(-59, -6); cx.lineTo(-60, -49); cx.lineTo(16, -49); cx.lineTo(54, -27);
        cx.lineTo(61, -18); cx.lineTo(61, -6);
      } else if (prof === 'vancom') {
        /* Toyota HiAce */
        cx.moveTo(-60, -6); cx.lineTo(-61, -50); cx.lineTo(38, -50); cx.lineTo(55, -26);
        cx.lineTo(60, -22); cx.lineTo(60, -6);
      } else if (prof === 'bigsuv') {
        /* Fortuner / Pajero Sport / Palisade / Land Cruiser */
        cx.moveTo(-59, -9); cx.lineTo(-60, -29); cx.lineTo(-49, -48); cx.lineTo(14, -48);
        cx.lineTo(30, -30); cx.lineTo(59, -26); cx.lineTo(61, -9);
      } else if (prof === 'csuv') {
        /* Raize / HR-V / Creta / CR-V / IONIQ 5 / Sealion 7 */
        cx.moveTo(-55, -8); cx.lineTo(-56, -25); cx.lineTo(-44, -44); cx.lineTo(12, -44);
        cx.lineTo(29, -27); cx.lineTo(55, -22); cx.lineTo(56, -8);
      } else if (prof === 'innova') {
        /* Innova Reborn / Zenix */
        cx.moveTo(-57, -6); cx.lineTo(-58, -25); cx.lineTo(-48, -45); cx.lineTo(14, -45);
        cx.lineTo(33, -27); cx.lineTo(57, -21); cx.lineTo(59, -6);
      } else {
        /* LMPV: Avanza / Xenia / Xpander / Veloz / Ertiga / Calya */
        cx.moveTo(-55, -6); cx.lineTo(-56, -23); cx.lineTo(-46, -42); cx.lineTo(16, -42);
        cx.lineTo(34, -25); cx.lineTo(55, -20); cx.lineTo(56, -6);
      }
      cx.closePath(); cx.fill();

      /* Garis lekukan bodi spekular (GTA V HD character line) */
      cx.strokeStyle = 'rgba(255,255,255,0.62)'; cx.lineWidth = 1.25;
      cx.beginPath(); cx.moveTo(-lenHalf + 6, -21); cx.lineTo(lenHalf - 6, -18); cx.stroke();

      /* Kaca jendela gelap reflektif */
      cx.fillStyle = glG;
      cx.beginPath();
      if (isMicro) {
        cx.moveTo(-27, -25); cx.lineTo(-24, -37); cx.lineTo(10, -37); cx.lineTo(23, -25);
      } else if (prof === 'hatch') {
        cx.moveTo(-40, -24); cx.lineTo(-34, -36); cx.lineTo(8, -36); cx.lineTo(23, -24);
      } else if (isSport) {
        cx.moveTo(-36, -22); cx.lineTo(-16, -30); cx.lineTo(8, -29.5); cx.lineTo(26, -21);
      } else if (prof === 'sedan') {
        cx.moveTo(-33, -23); cx.lineTo(-20, -33.5); cx.lineTo(10, -33.5); cx.lineTo(25, -23);
      } else if (isBoxy) {
        cx.moveTo(-49, -29); cx.lineTo(-49, -44); cx.lineTo(13, -44); cx.lineTo(20, -29);
      } else if (isVan) {
        cx.moveTo(-53, -28); cx.lineTo(-53, -47); cx.lineTo(prof === 'staria' ? 14 : 25, -47); cx.lineTo(44, -28);
      } else {
        cx.moveTo(-48, -27); cx.lineTo(-42, topY + 4); cx.lineTo(12, topY + 4); cx.lineTo(28, -27);
      }
      cx.closePath(); cx.fill();

      /* Kilau miring di kaca */
      cx.fillStyle = 'rgba(255,255,255,0.22)';
      cx.beginPath(); cx.moveTo(-18, topY + 5); cx.lineTo(-9, topY + 5); cx.lineTo(-15, -24); cx.lineTo(-24, -24); cx.closePath(); cx.fill();

      /* Pilar B & C */
      cx.fillStyle = '#0f172a';
      if (!isMicro) {
        cx.fillRect(-6, topY + 4, 3, Math.max(8, -24 - (topY + 4)));
        if (!isSport && prof !== 'sedan' && prof !== 'hatch') cx.fillRect(-30, topY + 4, 2.6, Math.max(8, -24 - (topY + 4)));
      }

      /* Ciri khas unik tiap kelas */
      if (isBoxy) {
        /* Ban serep belakang ikonik Jimny & G-Class */
        kotakBulat(-63, -36, 9, 20, 3, '#111827');
        kotakBulat(-61, -33, 5, 14, 2, geserHex(w, -18));
      }
      if (isSport) {
        /* Spoiler belakang GT */
        kotak(-59, -27, 13, 2.8, '#0f172a'); kotak(-55, -24, 3, 6, '#0f172a');
      }
      if (prof === 'luxvan') {
        /* Aksen krom VIP Alphard / Vellfire / Lexus LM */
        kotak(56, -24, 5, 16, '#e2c87d'); kotak(-58, -27, 114, 2, '#e2c87d');
      }
      if (prof === 'bigsuv' || prof === 'csuv') {
        /* Roof rail & pijakan kaki SUV */
        kotak(-40, topY - 2.5, 50, 2.4, '#334155');
        kotak(-24, -9, 48, 2.6, '#1e293b');
      }
      if (prof === 'staria') {
        /* DRL LED penuh Staria */
        kotak(49, -24, 11, 2.5, '#e0f2fe');
      }
      /* Lampu depan LED DRL & lampu rem */
      kotakBulat(lenHalf - 6, isSport ? -15 : -22, 6.5, 4.5, 1.5, '#e0f2fe');
      kotakBulat(-lenHalf - 1, isSport ? -16 : -23, 4.5, 6, 1.5, '#ef4444');
    }

    /* Roda dengan velg alloy 6-spoke + kaliper rem */
    [rxA, rxB].forEach(function (rx) {
      bulat(rx, -rBan + 2, rBan, '#0b0f17');
      bulat(rx, -rBan + 2, rBan * 0.62, '#cbd5e1');
      if (kaliperMerah) { cx.fillStyle = '#ef4444'; cx.fillRect(rx + 1.5, -rBan + 0.5, 2.8, 3.6); }
      cx.strokeStyle = '#1e293b'; cx.lineWidth = 1.3; cx.beginPath();
      for (var s = 0; s < 6; s++) {
        var a = pt + s * (Math.PI / 3);
        cx.moveTo(rx, -rBan + 2); cx.lineTo(rx + Math.cos(a) * (rBan * 0.56), -rBan + 2 + Math.sin(a) * (rBan * 0.56));
      }
      cx.stroke();
      bulat(rx, -rBan + 2, 2.1, '#f8fafc');
    });

    if (lampuNyala) {
      var gr = cx.createRadialGradient(lenHalf + 2, -18, 0, lenHalf + 2, -18, 54);
      gr.addColorStop(0, 'rgba(224,242,254,.62)'); gr.addColorStop(1, 'rgba(224,242,254,0)');
      cx.fillStyle = gr; cx.fillRect(lenHalf - 2, -46, 66, 56);
    }
  }

  /* ---------- pembeli ---------- */
  var BAJU = ['#e0675a', '#3f7fbf', '#7a9e4a', '#e0a33a', '#8a6bb8'];
  var PAYUNG = ['#1f8a80', '#d9443a', '#2f6fb0', '#f2a516', '#7a4fa0'];
  var X_DEPAN = 222, JARAK = 36, KURSI_X = [57, 101, 21], kotakDepan = null;
  function gambarOrang(o, yKaki, t, menit, hujan) {
    var x = o.x, jalan = Math.abs(o.x - o.tx) > 1.5, duduk = o.keadaan === 'duduk' && !jalan;
    var bawaPayung = !!(hujan && !duduk && o.jenis !== 'ojol');
    var langkahK = jalan ? Math.sin(t / 90 + o.id) : 0, r = o.rupa;
    var bob = duduk ? 0 : jalan ? Math.abs(langkahK) * 2 : Math.sin(t / 500 + o.id) * 0.8;
    var lompat = o.lompat > 0 ? Math.sin((1 - o.lompat) * Math.PI) * 8 : 0;
    var y = (duduk ? yKaki - 2 : yKaki) - bob - lompat, baju = BAJU[r.baju], celana = '#33414d', hadap = duduk ? (o.kursi === 1 ? -1 : 1) : o.keadaan === 'pulang' ? o.arahPulang : (o.tx > o.x + 1 ? 1 : o.tx < o.x - 1 ? -1 : 1);
    if (o.jenis === 'kantor') { baju = '#eef2f5'; celana = '#2c3640'; }
    if (o.jenis === 'ojol') baju = '#4f6b3a';
    if (!duduk) { cx.fillStyle = 'rgba(0,0,0,.18)'; cx.beginPath(); cx.ellipse(x, yKaki + 1, 13, 3.5, 0, 0, Math.PI * 2); cx.fill(); }
    /* anak kecil ikut keluarga */
    if (o.jenis === 'keluarga' && !duduk) {
      var kx = x - 15 * hadap;
      kotak(kx - 3, y - 10, 2.6, 10, '#33414d'); kotak(kx + 1, y - 10, 2.6, 10, '#33414d');
      kotakBulat(kx - 6, y - 24, 12, 15, 4, '#f2a516'); bulat(kx, y - 30, 7, r.kulit);
      cx.fillStyle = r.rambut; cx.beginPath(); cx.arc(kx, y - 32, 7, Math.PI, 0); cx.fill();
    }
    /* kaki (duduk vs berdiri/jalan) */
    if (duduk) {
      kotak(x - 6, y - 14, 14 * hadap, 5, celana);
      kotak(x + (hadap > 0 ? 4 : -10), y - 10, 5, 11, celana);
    } else {
      kotak(x - 6 + langkahK * 2, y - 16, 5, 16, celana); kotak(x + 1 - langkahK * 2, y - 16, 5, 16, celana);
    }
    /* ransel mahasiswa */
    if (o.jenis === 'mahasiswa') kotakBulat(x - 13 * hadap - 5, y - (duduk ? 36 : 40), 10, 20, 3, '#2f3e4a');
    /* badan */
    var yBadan = duduk ? y - 37 : y - 42;
    kotakBulat(x - 11, yBadan, 22, 26, 7, baju);
    if (o.jenis === 'kantor') { cx.strokeStyle = '#2f6fb0'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(x - 4, yBadan + 1); cx.lineTo(x, yBadan + 12); cx.lineTo(x + 4, yBadan + 1); cx.stroke(); kotak(x - 2, yBadan + 12, 4, 5, '#2f6fb0'); }
    if (o.jenis === 'ojol') kotak(x - 11, yBadan + 12, 22, 3, '#d8d8c8');
    /* kepala */
    var yk = yBadan - 10;
    if (o.jenis === 'keluarga') { /* ibu berkerudung */
      bulat(x, yk + 1, 13, '#c58fa0'); bulat(x, yk + 2, 9.5, r.kulit);
    } else {
      bulat(x, yk, 11, r.kulit);
      cx.fillStyle = r.rambut;
      if (r.perempuan) { cx.beginPath(); cx.arc(x, yk - 2, 12, Math.PI * 0.95, Math.PI * 2.05); cx.fill(); kotak(x - 12, yk - 2, 5, 15, r.rambut); kotak(x + 7, yk - 2, 5, 15, r.rambut); }
      else { cx.beginPath(); cx.arc(x, yk - 2, 11.5, Math.PI * 1.02, Math.PI * 1.98); cx.fill(); }
      if (o.jenis === 'ojol') { cx.fillStyle = '#2b2b2b'; cx.beginPath(); cx.arc(x, yk - 1, 13, Math.PI, 0); cx.fill(); kotak(x - 13, yk - 2, 26, 3, '#f2a516'); }
    }
    /* wajah */
    var ex = 3.5 * hadap * 0.4;
    bulat(x - 4 + ex, yk + 1, 1.6, '#2a1d1a'); bulat(x + 4 + ex, yk + 1, 1.6, '#2a1d1a');
    cx.strokeStyle = '#2a1d1a'; cx.lineWidth = 1.2; cx.beginPath();
    if (o.marah) cx.arc(x + ex, yk + 8, 3, Math.PI + 0.3, -0.3); else if (o.bawaCup) cx.arc(x + ex, yk + 4, 3.2, 0.2, Math.PI - 0.2); else { cx.moveTo(x - 2 + ex, yk + 6); cx.lineTo(x + 2 + ex, yk + 6); }
    cx.stroke();
    /* tangan: HP pembuat konten, cup kopi (menyeruput saat duduk!), atau payung saat hari hujan */
    if (o.jenis === 'konten' && !o.bawaCup) { kotak(x + 9 * hadap - 2, yBadan - 4, 5, 9, '#222'); kotak(x + 9 * hadap - 1, yBadan - 3, 3, 6, '#7fd3e8'); }
    if (o.bawaCup) {
      var seruput = duduk ? Math.max(0, Math.sin(t / 900 + o.id * 2)) * 9 : 0;
      gambarCup(x + (duduk ? 11 : 13) * hadap, yBadan + 14 - seruput, o.menu, 0.85, o.panas, t);
    }
    if (bawaPayung) {
      var px = x + 3 * hadap, py = yk - 22, wp = PAYUNG[o.id % PAYUNG.length];
      /* gagang payung dipegang tangan */
      cx.strokeStyle = '#3b2f2a'; cx.lineWidth = 1.8;
      cx.beginPath(); cx.moveTo(x + 9 * hadap, yBadan + 8); cx.lineTo(px, py - 14); cx.stroke();
      /* ujung atas payung */
      kotak(px - 1, py - 24, 2, 6, '#2b2420');
      /* tudung payung melengkung */
      cx.fillStyle = wp;
      cx.beginPath(); cx.arc(px, py, 20, Math.PI, 0); cx.closePath(); cx.fill();
      /* garis jari-jari payung agar realistis */
      cx.strokeStyle = 'rgba(255,255,255,.32)'; cx.lineWidth = 1;
      cx.beginPath(); cx.moveTo(px, py - 20); cx.quadraticCurveTo(px - 8, py - 10, px - 10, py); cx.moveTo(px, py - 20); cx.quadraticCurveTo(px + 8, py - 10, px + 10, py); cx.stroke();
    }
    /* rasa sabar dan pesanan (lengkap dengan Panas / Es) */
    if (o.keadaan === 'antre' || o.keadaan === 'dilayani') {
      var geserAtas = bawaPayung ? 24 : 0;
      if (o.keadaan === 'antre') {
        var sisa = Math.max(0, 1 - (menit - o.tiba) / o.sabar);
        kotakBulat(x - 13, yk - 22 - geserAtas, 26, 5, 2.5, 'rgba(0,0,0,.35)');
        kotakBulat(x - 12, yk - 21 - geserAtas, Math.max(2, 24 * sisa), 3, 1.5, sisa > 0.5 ? '#4fbf6a' : sisa > 0.25 ? '#f2a516' : '#d9443a');
      }
      if (o.slot === 0) {
        var teksPesanan = o.menu.cemilan ? o.menu.pendek : o.menu.pendek + (o.panas ? ' · Panas' : ' · Es');
        cx.font = '800 11.5px "Baloo 2", "Nunito", system-ui, sans-serif';
        var tw = cx.measureText(teksPesanan).width + 16, bxx = Math.min(W - tw - 4, Math.max(4, x - tw / 2)), byy = yk - 52 - geserAtas;
        kotakBulat(bxx, byy, tw, 24, 10, o.keadaan === 'dilayani' ? '#f2a516' : '#fbfaf6');
        cx.fillStyle = o.keadaan === 'dilayani' ? '#f2a516' : '#fbfaf6';
        cx.beginPath(); cx.moveTo(x - 5, byy + 23); cx.lineTo(x + 5, byy + 23); cx.lineTo(x, byy + 30); cx.closePath(); cx.fill();
        cx.fillStyle = '#1d2b33'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(teksPesanan, bxx + tw / 2, byy + 12.5);
        kotakDepan = { x: x - 18, y: byy, w: 36, h: yKaki - byy };
      }
    }
  }
  /* gambar gelas kopi realistis (panas: cup kertas + sleeve + uap; dingin: cup bening berlapis + es batu + tutup kubah + sedotan) */
  function gambarCup(x, y, menu, sk, panas, t) {
    cx.save(); cx.translate(x, y); cx.scale(sk, sk);
    var id = menu ? menu.id : 'aren';
    if (menu && menu.cemilan) {
      /* kotak cemilan hangat (kentang goreng / tahu balado / mie goreng sosis telur) */
      kotakBulat(-9, -8, 18, 11, 2.5, '#e8d5b5');
      if (id === 'kentang') {
        kotak(-6, -13, 2.5, 7, '#f2c14e'); kotak(-2, -14, 2.5, 8, '#f7d060'); kotak(2, -13, 2.5, 7, '#e6b23c'); kotak(5, -12, 2.2, 6, '#f2c14e');
      } else if (id === 'tahu') {
        kotakBulat(-6, -12, 5, 5, 1.2, '#f5e6c8'); kotakBulat(1, -12, 5, 5, 1.2, '#f5e6c8');
        bulat(-3.5, -10, 2, '#d9443a'); bulat(3.5, -10, 2, '#d9443a');
      } else {
        bulat(0, -9, 6, '#e0a94c'); bulat(-3, -11, 2.5, '#c85a3a'); bulat(3, -10, 2.8, '#fff'); bulat(3, -10, 1.2, '#f2a516');
      }
      cx.restore();
      return;
    }
    var isPanas = panas != null ? !!panas : (menu && (menu.panas || id === 'hitam' || id === 'espresso'));
    if (isPanas) {
      /* uap panas */
      cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = 1.2;
      var uap = ((t || 0) / 300) % 4;
      cx.beginPath(); cx.moveTo(-3, -18 - uap); cx.quadraticCurveTo(-5, -22 - uap, -2, -25 - uap); cx.moveTo(3, -17 - uap); cx.quadraticCurveTo(5, -21 - uap, 2, -24 - uap); cx.stroke();
      /* cup kertas meruncing */
      cx.fillStyle = '#f5ead6';
      cx.beginPath(); cx.moveTo(-7, -14); cx.lineTo(7, -14); cx.lineTo(5.2, 3); cx.lineTo(-5.2, 3); cx.closePath(); cx.fill();
      /* sleeve pelindung panas teal */
      cx.fillStyle = '#1f8a80';
      cx.beginPath(); cx.moveTo(-6.4, -9); cx.lineTo(6.4, -9); cx.lineTo(5.8, -2); cx.lineTo(-5.8, -2); cx.closePath(); cx.fill();
      bulat(0, -5.5, 2, '#f2a516');
      /* tutup kopi panas hitam/putih */
      kotakBulat(-8, -17, 16, 3.5, 1.5, '#2b2420');
      kotak(-5.5, -18.5, 11, 2, '#3d342f');
    } else {
      /* lapisan warna kopi es realistis */
      var bawah = id === 'aren' ? '#7a3f11' : id === 'mocha' ? '#4a2414' : id === 'susu' || id === 'cappuccino' ? '#d9bc96' : '#26140c';
      var tengah = id === 'aren' ? '#d8bd97' : id === 'susu' ? '#c49a6c' : id === 'mocha' ? '#7a452b' : id === 'cappuccino' ? '#b88960' : '#3a2116';
      var atas = id === 'cappuccino' ? '#f5efe6' : id === 'aren' || id === 'susu' ? '#5c341d' : '#4e2c1a';
      /* badan cup plastik bening */
      var grd = cx.createLinearGradient(0, -14, 0, 3);
      grd.addColorStop(0, atas); grd.addColorStop(0.55, tengah); grd.addColorStop(1, bawah);
      cx.fillStyle = grd;
      cx.beginPath(); cx.moveTo(-7.2, -14); cx.lineTo(7.2, -14); cx.lineTo(5.2, 3); cx.lineTo(-5.2, 3); cx.closePath(); cx.fill();
      /* es batu mengambang */
      cx.fillStyle = 'rgba(235,248,255,.55)';
      kotak(-4.5, -12, 3.5, 3.2, 'rgba(235,248,255,.55)');
      kotak(1, -11, 3.2, 3, 'rgba(235,248,255,.48)');
      kotak(-1.5, -8, 3, 2.8, 'rgba(235,248,255,.38)');
      /* kilau kaca */
      cx.fillStyle = 'rgba(255,255,255,.35)'; cx.fillRect(-5.2, -13, 2, 14);
      /* tutup kubah (dome lid) + sedotan */
      cx.fillStyle = 'rgba(230,245,252,.78)';
      cx.beginPath(); cx.arc(0, -14, 7.5, Math.PI, 0); cx.closePath(); cx.fill();
      kotak(-8.2, -15, 16.4, 2.2, '#e8f4f8');
      cx.strokeStyle = '#1f8a80'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(2, -12); cx.lineTo(4, -26); cx.stroke();
    }
    cx.restore();
  }
  function aturPembeli(daftar, dMenit, dt) {
    daftar.forEach(function (o) {
      if (o.tx == null) o.tx = o.x;
      if (o.keadaan === 'pulang') { o.tx = o.arahPulang < 0 ? -50 : W + 50; }
      else if (o.keadaan === 'duduk') { o.tx = KURSI_X[o.kursi || 0]; }
      else o.tx = X_DEPAN - (o.slot || 0) * JARAK;
      var laju = (o.keadaan === 'pulang' || o.keadaan === 'duduk') ? 70 * dt / 1000 : 37 * dMenit;
      var d = o.tx - o.x; o.x += Math.sign(d) * Math.min(Math.abs(d), laju);
      if (o.lompat > 0) o.lompat = Math.max(0, o.lompat - dt / 450);
      if (o.efek) {
        var e = o.efek; o.efek = null;
        anim.teks.push({ teks: e.teks, x: o.x, y: 0, umur: 0, warna: e.warna });
        if (e.cup) { anim.cup.push({ x0: X_DEPAN, x1: o.x, u: 0, menu: o.menu, panas: o.panas, id: o.id }); o.bawaCup = false; o.tundaCup = true; }
      }
      if (o.keadaan === 'pulang' && (o.x < -45 || o.x > W + 45)) o.hilang = true;
    });
  }

  /* motor milik pemain, desain sesuai merk & tipe asli (Honda, Yamaha, Suzuki, Kawasaki, Vespa, BMW, Ducati, Harley, Alva) */
  var WARNA_MOTOR = {
    dazz: '#2f6fb0', revo: '#d9443a', mio: '#7a4fa0', beat: '#d9443a', gear: '#2b2f36', supra: '#1f4e8c',
    scoopy: '#f0e2c8', vario: '#c62828', vario160: '#1f2328', mxking: '#1f57a8', aerox: '#232830', aeroxalpha: '#1b3a70',
    icon: '#7fd3e8', em1e: '#e8eef2', alvacervo: '#1f6e8c', fazzio: '#6ec6b8', lexi155: '#3a4654', filano: '#d9c5a0', stylo160: '#2d6a4f',
    nmax: '#2c323b', nmaxturbo: '#4a3d2a', pcx160: '#f4f2ec', pcxroadsync: '#dcd8cf', adv160: '#8a2b2b', xmax250: '#374151', forza250: '#1e293b',
    vespa: '#529b8e', vespasprint: '#e6b800', vespagts: '#2b3a4a', vespa946: '#d4af37',
    satriafu: '#1e64b8', cb150r: '#c62828', klx150: '#3da337', w175: '#2d4a3e', crf150l: '#d93829', wr155r: '#1d4ed8', rxking: '#2b2b2b'
  };
  function gambarParkir(x, y, id, m) {
    gambarMotorKu(x, y + 12, id, { kiri: true }, 0);
    if (gelap(m) > 0.4) { cx.fillStyle = 'rgba(10,18,45,' + (gelap(m) * 0.28).toFixed(2) + ')'; cx.fillRect(x - 34, y - 28, 68, 48); }
  }

  /* ---------- wajah & proporsi karakter anatomis 1:1 dengan potret profil (kulit, rambut, mata, kacamata, mulut) ---------- */
  function tampilanDariNama(nama, gender, isAnak) {
    var K = (g.KK_NYATA && g.KK_NYATA.karakterOpsi) || {};
    var klList = K.kulit || [{ id: 'kuning', hex: '#f5cb9f', bayang: '#d9a473' }];
    var wrList = K.warnaRambut || [{ id: 'hitam', hex: '#1c1817', kilau: '#3e3533' }];
    var rcList = K.rambutCowok || [{ id: 'rapi' }];
    var rpList = K.rambutCewek || [{ id: 'panjang' }];
    var mtList = K.mata || [{ id: 'cerah' }];
    var mlList = K.mulut || [{ id: 'senyum' }];
    var h = hashNama(nama || gender || 'd');
    var kl = klList[h % Math.min(4, klList.length)];
    var wr = wrList[h % Math.min(3, wrList.length)];
    var rId = gender === 'cowok' ? rcList[h % Math.max(1, rcList.length - 1)].id : rpList[h % Math.max(1, rpList.length - 1)].id;
    return {
      kulitHex: kl.hex, kulitBayang: kl.bayang || '#c89268',
      rambutHex: wr.hex, rambutKilau: wr.kilau || '#3e3533',
      rambut: rId,
      mata: mtList[h % Math.min(4, mtList.length)].id,
      mulut: mlList[h % Math.min(4, mlList.length)].id,
      isAnak: !!isAnak
    };
  }
  function gambarKepalaPotret(x, y, r, gender, tp, opts) {
    opts = opts || {};
    var isBoy = gender === 'cowok';
    var INK = '#3b2826';
    var s = r / 14.5;
    cx.save();
    cx.translate(x, y);
    if (opts.rot) cx.rotate(opts.rot);
    cx.scale(s, s);

    /* P73.2: Kepala Anime 2D konsisten untuk HB di ranjang/sofa/hotel/ciuman & Tidur */
    if (!isBoy) {
      /* Rambut belakang sebahu + kuncir kanan atas */
      cx.fillStyle = '#1b1824'; cx.strokeStyle = INK; cx.lineWidth = 1.15;
      cx.beginPath();
      cx.moveTo(-16.5, -10); cx.quadraticCurveTo(-21, 8, -16, 22); cx.quadraticCurveTo(0, 25, 16, 22); cx.quadraticCurveTo(21, 8, 16.5, -10);
      cx.closePath(); cx.fill(); cx.stroke();
      cx.save(); cx.translate(13, -16);
      cx.beginPath(); cx.moveTo(0, 0); cx.bezierCurveTo(13, -6, 20, 6, 16, 24); cx.quadraticCurveTo(12, 31, 7, 25); cx.bezierCurveTo(9, 14, 4, 7, -1.5, 2.5); cx.closePath(); cx.fill(); cx.stroke();
      cx.fillStyle = '#fb7185'; cx.strokeStyle = INK; cx.lineWidth = 0.85;
      cx.beginPath(); cx.ellipse(-1, 0, 3.8, 2.2, -0.5, 0, Math.PI * 2); cx.fill(); cx.stroke();
      cx.restore();
    }
    if (!opts.tanpaLeher) {
      _rrAnime(cx, -3.4, 9, 6.8, 11, 3, '#f7dfd2', INK);
    }
    var fcG = cx.createLinearGradient(0, -17, 0, 15);
    fcG.addColorStop(0, isBoy ? '#fff1e6' : '#fff5ee'); fcG.addColorStop(1, isBoy ? '#f7d8c4' : '#fce4d6');
    cx.fillStyle = fcG; cx.strokeStyle = INK; cx.lineWidth = 1.15;
    cx.beginPath();
    if (isBoy) {
      cx.moveTo(-13.8, -5); cx.lineTo(-13.2, 5.2); cx.quadraticCurveTo(-7.5, 12.6, 0, 15.8);
      cx.quadraticCurveTo(7.5, 12.6, 13.2, 5.2); cx.lineTo(13.8, -5);
      cx.bezierCurveTo(13.8, -17.5, 7.5, -20.8, 0, -20.8); cx.bezierCurveTo(-7.5, -20.8, -13.8, -17.5, -13.8, -5);
    } else {
      cx.moveTo(-14.5, -4); cx.bezierCurveTo(-14.8, 7.8, -7.8, 13.5, 0, 14.8);
      cx.bezierCurveTo(7.8, 13.5, 14.8, 7.8, 14.5, -4);
      cx.bezierCurveTo(14.5, -17.8, 8, -20.8, 0, -20.8); cx.bezierCurveTo(-8, -20.8, -14.5, -17.8, -14.5, -4);
    }
    cx.closePath(); cx.fill(); cx.stroke();

    if (!isBoy) {
      cx.fillStyle = opts.merem ? 'rgba(251,113,133,0.42)' : 'rgba(251,146,162,0.32)';
      cx.beginPath(); cx.ellipse(-8.2, 4.2, 3.2, 1.6, 0, 0, Math.PI * 2); cx.fill();
      cx.beginPath(); cx.ellipse(8.2, 4.2, 3.2, 1.6, 0, 0, Math.PI * 2); cx.fill();
    }

    [-5.8, 5.8].forEach(function (ex, idx) {
      if (opts.merem) {
        cx.strokeStyle = INK; cx.lineWidth = 1.5; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(ex - 3.0, 1.0); cx.quadraticCurveTo(ex, 2.4, ex + 3.0, 1.0); cx.stroke();
      } else if (isBoy) {
        cx.fillStyle = '#ffffff'; cx.beginPath(); cx.ellipse(ex, 0.5, 3.0, 1.7, 0, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = '#2d3748'; cx.beginPath(); cx.ellipse(ex + (idx === 0 ? 0.2 : -0.2), 0.5, 1.8, 1.6, 0, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = '#ffffff'; cx.beginPath(); cx.arc(ex - 0.6, -0.25, 0.6, 0, Math.PI * 2); cx.fill();
        cx.strokeStyle = '#181820'; cx.lineWidth = 1.65; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(ex - 3.3, 0.0); cx.quadraticCurveTo(ex, -1.8, ex + 3.3, -0.3); cx.stroke();
        cx.strokeStyle = '#1e1b24'; cx.lineWidth = 1.45;
        cx.beginPath(); cx.moveTo(ex - 3.2, -3.6); cx.lineTo(ex + 3.0, -4.4); cx.stroke();
      } else {
        cx.fillStyle = '#ffffff'; cx.beginPath(); cx.ellipse(ex, 0.7, 2.9, 2.5, 0, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = '#4c3230'; cx.beginPath(); cx.ellipse(ex + (idx === 0 ? 0.18 : -0.18), 0.8, 2.0, 2.2, 0, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = '#ffffff'; cx.beginPath(); cx.arc(ex - 0.72, -0.35, 0.78, 0, Math.PI * 2); cx.fill();
        cx.strokeStyle = '#24181c'; cx.lineWidth = 1.5; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(ex - 3.2, -0.2); cx.quadraticCurveTo(ex, -2.5, ex + 3.2, -0.2); cx.stroke();
        cx.strokeStyle = '#332428'; cx.lineWidth = 1.0;
        cx.beginPath(); cx.moveTo(ex - 2.6, -4.8); cx.quadraticCurveTo(ex, -5.8, ex + 2.6, -4.6); cx.stroke();
      }
    });

    cx.strokeStyle = isBoy ? '#9c5a54' : '#b46266'; cx.lineWidth = 1.2; cx.lineCap = 'round';
    cx.beginPath(); cx.moveTo(-2.5, 8.0); cx.quadraticCurveTo(0, 9.6, 2.5, 8.0); cx.stroke();

    cx.fillStyle = '#1b1824'; cx.strokeStyle = INK; cx.lineWidth = 1.1;
    if (isBoy) {
      cx.beginPath();
      cx.moveTo(-15.5, 0.5); cx.bezierCurveTo(-17, -18, -8.5, -24.5, 0.5, -25.2); cx.bezierCurveTo(9.5, -25.2, 17, -18.5, 15.5, 0.5);
      cx.lineTo(13.2, 3.0); cx.lineTo(12.2, -5.5); cx.quadraticCurveTo(6.5, -10.5, 2.5, -4.5); cx.quadraticCurveTo(-1.5, -10.5, -9.5, -6.5);
      cx.lineTo(-12.2, -4.0); cx.lineTo(-13.2, 3.0); cx.closePath(); cx.fill(); cx.stroke();
    } else {
      cx.beginPath();
      cx.moveTo(-16.5, 0); cx.bezierCurveTo(-17.5, -21.5, -8.2, -24.2, 0, -24.2); cx.bezierCurveTo(8.2, -24.2, 17.5, -21.5, 16.5, 0);
      cx.lineTo(14.5, 11.5); cx.lineTo(11.8, 6.2); cx.lineTo(12.0, -3.5);
      cx.quadraticCurveTo(6.5, -3.2, 3.0, -4.2); cx.quadraticCurveTo(0, -3.0, -3.0, -4.2); cx.quadraticCurveTo(-6.5, -3.2, -12.0, -3.5);
      cx.lineTo(-11.8, 6.2); cx.lineTo(-14.5, 11.5); cx.closePath(); cx.fill(); cx.stroke();
    }
    cx.restore();
    return;
  }
  function _gambarKepalaPotretLegacy(x, y, r, gender, tp, opts) {
    opts = opts || {};
    var cewek = gender === 'cewek';
    var T = (tp && tp.kulitHex) ? tp : tampilanDariNama(opts.nama || '', gender, opts.isAnak);
    var kulit = T.kulitHex || '#f5cb9f', bayang = T.kulitBayang || '#d9a473';
    var rambut = T.rambutHex || '#1c1817', kilau = T.rambutKilau || '#3e3533';
    var gayaR = T.rambut || (cewek ? 'panjang' : 'rapi');
    var gayaM = T.mata || 'cerah', gayaB = T.mulut || 'senyum';
    var baju = opts.baju || (cewek ? '#c94872' : '#1b6b63');
    cx.save();
    cx.translate(x, y);
    if (opts.rot) cx.rotate(opts.rot);
    var s = r / 13; /* unit dasar setara r=13 pada proporsi fotoWajah */

    /* 1. Rambut belakang */
    if (opts.isAnak) {
      bulat(-11 * s, -6 * s, 4.8 * s, rambut); bulat(11 * s, -6 * s, 4.8 * s, rambut);
    } else if (!cewek) {
      if (gayaR === 'gondrong') {
        cx.fillStyle = rambut;
        cx.beginPath(); cx.moveTo(-13 * s, -2 * s); cx.quadraticCurveTo(-15 * s, 11 * s, -11 * s, 16 * s);
        cx.lineTo(11 * s, 16 * s); cx.quadraticCurveTo(15 * s, 11 * s, 13 * s, -2 * s);
        cx.arc(0, -3 * s, 13.5 * s, 0, Math.PI, true); cx.closePath(); cx.fill();
      } else if (gayaR === 'ikal') {
        bulat(-9 * s, -9 * s, 5.6 * s, rambut); bulat(0, -12 * s, 6.4 * s, rambut); bulat(9 * s, -9 * s, 5.6 * s, rambut);
      }
    } else {
      if (gayaR === 'hijab') {
        cx.fillStyle = baju;
        cx.beginPath(); cx.arc(0, -1 * s, 15 * s, Math.PI, 0);
        cx.quadraticCurveTo(16 * s, 14 * s, 11 * s, 21 * s); cx.lineTo(-11 * s, 21 * s);
        cx.quadraticCurveTo(-16 * s, 14 * s, -15 * s, -1 * s); cx.closePath(); cx.fill();
      } else if (gayaR === 'gelombang') {
        cx.fillStyle = rambut;
        cx.beginPath(); cx.arc(0, -2 * s, 14.5 * s, Math.PI, 0);
        cx.quadraticCurveTo(17 * s, 11 * s, 13 * s, 21 * s); cx.lineTo(-13 * s, 21 * s);
        cx.quadraticCurveTo(-17 * s, 11 * s, -14.5 * s, -2 * s); cx.closePath(); cx.fill();
        bulat(-13.5 * s, 9 * s, 4.2 * s, rambut); bulat(13.5 * s, 9 * s, 4.2 * s, rambut);
      } else if (gayaR === 'bob') {
        cx.fillStyle = rambut;
        cx.beginPath(); cx.arc(0, -2 * s, 14 * s, Math.PI, 0);
        cx.quadraticCurveTo(15 * s, 8 * s, 11 * s, 13 * s); cx.lineTo(-11 * s, 13 * s);
        cx.quadraticCurveTo(-15 * s, 8 * s, -14 * s, -2 * s); cx.closePath(); cx.fill();
      } else if (gayaR === 'kuncir') {
        cx.fillStyle = rambut;
        cx.beginPath(); cx.moveTo(9 * s, -8 * s); cx.quadraticCurveTo(20 * s, -10 * s, 18 * s, 6 * s);
        cx.quadraticCurveTo(14 * s, 1 * s, 9 * s, -2 * s); cx.closePath(); cx.fill();
        bulat(10.5 * s, -8 * s, 2.4 * s, '#f2a516');
      } else {
        /* panjang lurus / poni */
        cx.fillStyle = rambut;
        cx.beginPath(); cx.arc(0, -2 * s, 14.2 * s, Math.PI, 0);
        cx.lineTo(14.5 * s, 21 * s); cx.lineTo(-14.5 * s, 21 * s); cx.closePath(); cx.fill();
      }
    }

    /* 2. Leher, telinga & kontur wajah proporsional */
    if (!opts.tanpaLeher) kotakBulat(-3.6 * s, 9.5 * s, 7.2 * s, 7.5 * s, 3 * s, bayang);
    if (gayaR !== 'hijab') {
      bulat(-11.2 * s, 1.5 * s, 2.5 * s, kulit); bulat(11.2 * s, 1.5 * s, 2.5 * s, kulit);
    }
    cx.fillStyle = kulit;
    cx.beginPath();
    cx.moveTo(-10.8 * s, -2 * s);
    cx.bezierCurveTo(-10.8 * s, -11 * s, -5.5 * s, -13.2 * s, 0, -13.2 * s);
    cx.bezierCurveTo(5.5 * s, -13.2 * s, 10.8 * s, -11 * s, 10.8 * s, -2 * s);
    cx.bezierCurveTo(10.8 * s, 6.2 * s, 5.2 * s, 12.2 * s, 0, 12.8 * s);
    cx.bezierCurveTo(-5.2 * s, 12.2 * s, -10.8 * s, 6.2 * s, -10.8 * s, -2 * s);
    cx.closePath(); cx.fill();

    /* rona pipi & garis hidung lembut */
    cx.fillStyle = cewek ? 'rgba(232,122,130,.34)' : 'rgba(232,122,130,.20)';
    cx.beginPath(); cx.ellipse(-6.5 * s, 4 * s, 2.6 * s, 1.4 * s, 0, 0, Math.PI * 2); cx.fill();
    cx.beginPath(); cx.ellipse(6.5 * s, 4 * s, 2.6 * s, 1.4 * s, 0, 0, Math.PI * 2); cx.fill();
    cx.strokeStyle = bayang; cx.lineWidth = Math.max(1, 1.05 * s); cx.lineCap = 'round';
    cx.beginPath(); cx.moveTo(-0.3 * s, 0.5 * s); cx.lineTo(-0.8 * s, 3.6 * s); cx.quadraticCurveTo(0, 4.3 * s, 1.1 * s, 3.6 * s); cx.stroke();

    /* 3. Alis & Mata sesuai pilihan (cerah, tajam, sipit, lembut, kacamata) */
    cx.strokeStyle = rambut; cx.lineWidth = (cewek ? 1.15 : 1.55) * s;
    cx.beginPath(); cx.moveTo(-7.5 * s, -3 * s); cx.quadraticCurveTo(-4.8 * s, -4.4 * s, -2.2 * s, -3.2 * s);
    cx.moveTo(2.2 * s, -3.2 * s); cx.quadraticCurveTo(4.8 * s, -4.4 * s, 7.5 * s, -3 * s); cx.stroke();
    if (opts.merem || anim.kedip > 0) {
      cx.strokeStyle = '#231815'; cx.lineWidth = 1.35 * s;
      cx.beginPath(); cx.arc(-4.8 * s, 0.8 * s, 2.2 * s, 0.15 * Math.PI, 0.85 * Math.PI); cx.stroke();
      cx.beginPath(); cx.arc(4.8 * s, 0.8 * s, 2.2 * s, 0.15 * Math.PI, 0.85 * Math.PI); cx.stroke();
    } else if (gayaM === 'sipit') {
      cx.strokeStyle = '#1e1513'; cx.lineWidth = 1.5 * s;
      cx.beginPath(); cx.moveTo(-7.2 * s, 0.8 * s); cx.quadraticCurveTo(-4.8 * s, -0.6 * s, -2.4 * s, 0.8 * s);
      cx.moveTo(2.4 * s, 0.8 * s); cx.quadraticCurveTo(4.8 * s, -0.6 * s, 7.2 * s, 0.8 * s); cx.stroke();
      bulat(-4.8 * s, 0.9 * s, 1.25 * s, '#1e1513'); bulat(4.8 * s, 0.9 * s, 1.25 * s, '#1e1513');
    } else if (gayaM === 'tajam') {
      cx.fillStyle = '#fff';
      cx.beginPath(); cx.ellipse(-4.8 * s, 0.9 * s, 2.4 * s, 1.5 * s, 0.1, 0, Math.PI * 2); cx.fill();
      cx.beginPath(); cx.ellipse(4.8 * s, 0.9 * s, 2.4 * s, 1.5 * s, -0.1, 0, Math.PI * 2); cx.fill();
      bulat(-4.7 * s, 1 * s, 1.5 * s, '#231815'); bulat(4.7 * s, 1 * s, 1.5 * s, '#231815');
      bulat(-4.2 * s, 0.5 * s, 0.55 * s, '#fff'); bulat(5.2 * s, 0.5 * s, 0.55 * s, '#fff');
      cx.strokeStyle = '#1b1311'; cx.lineWidth = 1.35 * s;
      cx.beginPath(); cx.moveTo(-7.4 * s, -0.1 * s); cx.lineTo(-2.2 * s, 0.6 * s); cx.moveTo(7.4 * s, -0.1 * s); cx.lineTo(2.2 * s, 0.6 * s); cx.stroke();
    } else {
      var ryM = gayaM === 'lembut' ? 1.85 : 2.15;
      cx.fillStyle = '#fff';
      cx.beginPath(); cx.ellipse(-4.8 * s, 0.8 * s, 2.45 * s, ryM * s, 0, 0, Math.PI * 2); cx.fill();
      cx.beginPath(); cx.ellipse(4.8 * s, 0.8 * s, 2.45 * s, ryM * s, 0, 0, Math.PI * 2); cx.fill();
      bulat(-4.7 * s, 0.9 * s, 1.65 * s, gayaM === 'lembut' ? '#3a251d' : '#221714');
      bulat(4.7 * s, 0.9 * s, 1.65 * s, gayaM === 'lembut' ? '#3a251d' : '#221714');
      bulat(-4.1 * s, 0.3 * s, 0.62 * s, '#fff'); bulat(5.3 * s, 0.3 * s, 0.62 * s, '#fff');
    }
    if (gayaM === 'kacamata') {
      cx.strokeStyle = '#2c353d'; cx.lineWidth = 1.15 * s;
      cx.strokeRect(-8.4 * s, -1.6 * s, 7.2 * s, 4.8 * s);
      cx.strokeRect(1.2 * s, -1.6 * s, 7.2 * s, 4.8 * s);
      cx.beginPath(); cx.moveTo(-1.2 * s, 0.6 * s); cx.lineTo(1.2 * s, 0.6 * s); cx.stroke();
    }

    /* 4. Mulut sesuai pilihan (senyum, lebar, kalem, smirk, mungil) */
    var bibir = cewek ? '#d65a6e' : '#b3665d';
    cx.strokeStyle = bibir; cx.lineWidth = 1.35 * s;
    if (gayaB === 'lebar' && !opts.merem) {
      cx.fillStyle = '#fff';
      cx.beginPath(); cx.moveTo(-3.8 * s, 6.4 * s); cx.quadraticCurveTo(0, 10.2 * s, 3.8 * s, 6.4 * s); cx.closePath(); cx.fill(); cx.stroke();
    } else if (gayaB === 'kalem') {
      cx.beginPath(); cx.moveTo(-2.7 * s, 7 * s); cx.quadraticCurveTo(0, 8 * s, 2.7 * s, 7 * s); cx.stroke();
    } else if (gayaB === 'smirk') {
      cx.beginPath(); cx.moveTo(-2.8 * s, 7.3 * s); cx.quadraticCurveTo(1 * s, 7.8 * s, 3.4 * s, 6 * s); cx.stroke();
    } else if (gayaB === 'mungil') {
      cx.beginPath(); cx.moveTo(-2 * s, 6.9 * s); cx.quadraticCurveTo(0, 8.6 * s, 2 * s, 6.9 * s); cx.stroke();
    } else {
      cx.beginPath(); cx.moveTo(-3.4 * s, 6.5 * s); cx.quadraticCurveTo(0, 9.3 * s, 3.4 * s, 6.5 * s); cx.stroke();
    }

    /* 5. Rambut depan / Hijab / Peci */
    if (!cewek) {
      cx.fillStyle = rambut;
      if (gayaR === 'koma') {
        cx.beginPath(); cx.arc(0, -2.5 * s, 11.8 * s, Math.PI, 0);
        cx.quadraticCurveTo(8 * s, -7 * s, 3 * s, -4 * s); cx.quadraticCurveTo(0, -8.5 * s, -2 * s, -3.5 * s);
        cx.quadraticCurveTo(-7 * s, -7 * s, -11.8 * s, -2.5 * s); cx.closePath(); cx.fill();
      } else if (gayaR === 'undercut') {
        cx.beginPath(); cx.arc(0, -5 * s, 11.2 * s, Math.PI * 1.04, Math.PI * 1.96);
        cx.quadraticCurveTo(0, -9.5 * s, -10.8 * s, -5 * s); cx.closePath(); cx.fill();
      } else if (gayaR === 'peci') {
        cx.beginPath(); cx.arc(0, -4 * s, 11.4 * s, Math.PI, 0); cx.closePath(); cx.fill();
        kotakBulat(-11.2 * s, -16.5 * s, 22.4 * s, 9.5 * s, 2.4 * s, '#17191d');
        cx.strokeStyle = 'rgba(255,255,255,.22)'; cx.lineWidth = 1 * s;
        cx.beginPath(); cx.moveTo(-9.5 * s, -13 * s); cx.lineTo(9.5 * s, -13 * s); cx.stroke();
      } else {
        cx.beginPath(); cx.arc(0, -3 * s, 11.8 * s, Math.PI * 0.98, Math.PI * 2.02);
        cx.quadraticCurveTo(3 * s, -8.8 * s, -3 * s, -8.2 * s);
        cx.quadraticCurveTo(-8 * s, -7.2 * s, -11.8 * s, -2.5 * s); cx.closePath(); cx.fill();
      }
      if (gayaR !== 'peci' && gayaR !== 'ikal') {
        cx.strokeStyle = kilau; cx.lineWidth = 1.2 * s;
        cx.beginPath(); cx.moveTo(-6 * s, -10.5 * s); cx.quadraticCurveTo(0, -12.8 * s, 6 * s, -10.2 * s); cx.stroke();
      }
    } else if (gayaR === 'hijab') {
      cx.strokeStyle = baju; cx.lineWidth = 3.2 * s;
      cx.beginPath(); cx.arc(0, 0, 11.6 * s, 0, Math.PI * 2); cx.stroke();
      cx.strokeStyle = 'rgba(255,255,255,.45)'; cx.lineWidth = 1.1 * s;
      cx.beginPath(); cx.arc(0, -0.5 * s, 10.6 * s, Math.PI * 1.08, Math.PI * 1.92); cx.stroke();
    } else if (gayaR === 'poni') {
      cx.fillStyle = rambut;
      cx.beginPath(); cx.arc(0, -2.8 * s, 12.2 * s, Math.PI * 0.96, Math.PI * 2.04);
      cx.lineTo(9.5 * s, -4.5 * s); cx.lineTo(-9.5 * s, -4.5 * s); cx.closePath(); cx.fill();
    } else {
      cx.fillStyle = rambut;
      cx.beginPath(); cx.arc(0, -2.8 * s, 12.2 * s, Math.PI * 0.95, Math.PI * 2.05);
      cx.quadraticCurveTo(5 * s, -8.5 * s, -1 * s, -8.5 * s);
      cx.quadraticCurveTo(-7 * s, -7.5 * s, -12.2 * s, -2 * s); cx.closePath(); cx.fill();
      cx.strokeStyle = kilau; cx.lineWidth = 1.2 * s;
      cx.beginPath(); cx.moveTo(-6 * s, -10.5 * s); cx.quadraticCurveTo(1 * s, -12.8 * s, 7 * s, -10 * s); cx.stroke();
    }
    if (opts.topiBarista) {
      kotakBulat(-12.5 * s, -18 * s, 25 * s, 8.5 * s, 4 * s, '#155e57');
      kotak(1.5 * s, -11.5 * s, 15 * s, 3 * s, '#155e57');
    }
    cx.restore();
  }

  /* Karakter berdiri penuh dengan proporsi anatomis realistis (~165–170 cm = ~136–142 px pada skala 1.0) */
  function gambarKarakterRumah(x, y, gender, t, o) {
    o = o || {};
    var sk = o.skala || 1, cewek = gender === 'cewek';
    var sedangJalan = !!o.jalan;
    var ayunKaki = sedangJalan ? Math.sin(t / 140) * 6 : 0;
    var bob = sedangJalan ? Math.abs(Math.sin(t / 140)) * 2.2 : Math.sin(t / 520 + x * 0.1) * 1.1;
    var baju = o.baju || (cewek ? '#c85a7c' : '#1f7a72');
    var celana = o.celana || (cewek ? '#2f3d4c' : '#263340');
    var tp = (o.tampilan && o.tampilan.kulitHex) ? o.tampilan : tampilanDariNama(o.label || '', gender, sk < 0.72);
    var kulit = tp.kulitHex || '#f5cb9f';
    var berhijab = cewek && tp.rambut === 'hijab';

    /* P73: Karakter Anime 2D Artikulasi 120 FPS (Cewek sebahu + kuncir kanan atas & Cowok Ikemen + mix & match baju/celana) */
    gambarKarakterAnime(cx, x, y, gender, t, o);
    return;
  }

  function _rrAnime(c, x, y, w, h, r, fill, stroke) {
    c.beginPath();
    c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.15; c.stroke(); }
  }

  function gambarKarakterAnime(c, x, y, gender, t, o) {
    o = o || {};
    var sk = (o.skala || 1) * (o.diRumah ? 1.16 : 1.0);
    var isBoy = gender === 'cowok';
    var walk = !!o.jalan;
    var dir = o.arah === -1 ? -1 : 1;
    var tp = o.tampilan || {};
    var topWear = tp.atasan || (o.driver ? 'driver' : 'kaos');
    var botWear = tp.bawahan || (o.driver ? 'jeans' : 'panjang');
    var INK = '#3b2826';
    var step = walk ? Math.sin(t / 125) : 0;
    var bob = walk ? Math.abs(step) * 2.4 : 0;
    var breath = Math.sin(t / 740 + (isBoy ? 1.4 : 0) + x * 0.03) * 0.85;
    var tailSway = Math.sin(t / 520 + x * 0.02) * 0.12 + (walk ? -dir * 0.16 : 0);
    var blink = ((t + (isBoy ? 1700 : 0) + Math.round(x * 7)) % 4100) < 125;

    c.save();
    c.translate(x, y);
    c.scale(sk, sk);

    /* Bayangan pijakan lantai */
    var shG = c.createRadialGradient(0, 1, 2, 0, 1, 22);
    shG.addColorStop(0, 'rgba(42,26,22,0.38)'); shG.addColorStop(1, 'rgba(42,26,22,0)');
    c.fillStyle = shG; c.beginPath(); c.ellipse(0, 1, 22, 4.8, 0, 0, Math.PI * 2); c.fill();

    c.scale(dir, 1);
    c.translate(0, -bob);

    /* 1. Rambut belakang sebahu untuk Cewek */
    if (!isBoy) {
      var hBg = c.createLinearGradient(0, -132, 0, -82);
      hBg.addColorStop(0, '#181620'); hBg.addColorStop(1, '#2a2536');
      c.fillStyle = hBg; c.strokeStyle = INK; c.lineWidth = 1.15;
      c.beginPath();
      c.moveTo(-16.5, -118);
      c.quadraticCurveTo(-22, -98, -17.5, -83);
      c.quadraticCurveTo(-9, -79, 0, -81);
      c.quadraticCurveTo(9, -79, 17.5, -83);
      c.quadraticCurveTo(22, -98, 16.5, -118);
      c.closePath(); c.fill(); c.stroke();
    }

    /* 2. Kaki artikulasi & bawahan (none / pendek / panjang / jeans) */
    var lA = step * 9, lB = -step * 9;
    function drawLeg(ox, swing, dark) {
      c.save(); c.translate(ox, -51);
      c.strokeStyle = INK; c.lineWidth = 1.1;
      var skinL = dark ? '#f3d8ca' : '#fff0e6';
      c.fillStyle = skinL;
      c.beginPath();
      if (isBoy) {
        c.moveTo(-4.6, 0); c.lineTo(4.6, 0); c.lineTo(3.5 + swing * 0.68, 45); c.lineTo(-3.5 + swing * 0.68, 45);
      } else {
        var sw = swing * 0.68;
        c.moveTo(-5.4, -2);
        c.bezierCurveTo(-6.2, 10, -4.4 + sw * 0.35, 22, -3.8 + sw * 0.65, 32);
        c.quadraticCurveTo(-3.2 + sw * 0.85, 39, -2.5 + sw, 45);
        c.lineTo(2.5 + sw, 45);
        c.quadraticCurveTo(3.4 + sw * 0.85, 39, 4.0 + sw * 0.65, 32);
        c.bezierCurveTo(4.6 + sw * 0.35, 22, 6.0, 10, 5.2, -2);
      }
      c.closePath(); c.fill(); c.stroke();

      if (botWear === 'pendek') {
        c.fillStyle = isBoy ? (dark ? '#334155' : '#475569') : (dark ? '#3b5978' : '#4f7396');
        c.beginPath();
        c.moveTo(-5.5, -4); c.lineTo(5.5, -4);
        c.lineTo(4.9 + swing * 0.22, 14.5); c.quadraticCurveTo(swing * 0.22, 16, -4.9 + swing * 0.22, 14.5);
        c.closePath(); c.fill();
        c.beginPath(); c.moveTo(5.5, -2); c.lineTo(4.9 + swing * 0.22, 14.5); c.quadraticCurveTo(swing * 0.22, 16, -4.9 + swing * 0.22, 14.5); c.lineTo(-5.5, -2); c.stroke();
      } else if (botWear === 'panjang' || botWear === 'jeans') {
        var pCol = botWear === 'jeans' ? (dark ? '#25446b' : '#315b8e') : (dark ? '#2b303a' : '#3c4352');
        c.fillStyle = pCol;
        c.beginPath();
        c.moveTo(-5.5, -4); c.lineTo(5.5, -4);
        c.bezierCurveTo(5.6, 12, 4.4 + swing * 0.4, 28, 3.3 + swing * 0.68, 44);
        c.lineTo(-3.3 + swing * 0.68, 44);
        c.bezierCurveTo(-4.4 + swing * 0.4, 28, -5.6, 12, -5.5, -4);
        c.closePath(); c.fill();
        c.beginPath();
        c.moveTo(5.5, -2); c.bezierCurveTo(5.6, 12, 4.4 + swing * 0.4, 28, 3.3 + swing * 0.68, 44);
        c.lineTo(-3.3 + swing * 0.68, 44);
        c.bezierCurveTo(-4.4 + swing * 0.4, 28, -5.6, 12, -5.5, -2);
        c.stroke();
      }

      if (botWear === 'none') {
        _rrAnime(c, -3.8 + swing * 0.68, 43.5, 9.6, 5.4, 2.7, skinL, INK);
      } else {
        _rrAnime(c, -4.8 + swing * 0.68, 43.5, 11.6, 6.4, 3, '#f8fafc', INK);
        c.fillStyle = botWear === 'jeans' ? '#3b82f6' : '#64748b';
        c.fillRect(-3.8 + swing * 0.68, 47.6, 9.6, 1.7);
      }
      c.restore();
    }
    drawLeg(isBoy ? -5.6 : -5.1, lB, true);
    drawLeg(isBoy ? 5.6 : 5.1, lA, false);

    /* 3. Lengan belakang */
    var armCol = topWear === 'none' ? '#fff0e6'
      : topWear === 'driver' ? '#0f766e'
      : topWear === 'kaos' ? (isBoy ? '#3b82f6' : '#fbcfe8')
      : topWear === 'kemeja' ? '#f8fafc'
      : (isBoy ? '#1e293b' : '#334155');
    var shortSlv = (topWear === 'none' || topWear === 'kaos');
    function drawArm(tx, rot) {
      c.save(); c.translate(tx, -86 + breath * 0.5); c.rotate(rot);
      _rrAnime(c, -3.0, 0, 6.0, 29, 3.0, '#fff0e6', INK);
      if (topWear !== 'none') {
        var sw = (!isBoy && topWear === 'kaos') ? 8.2 : 6.8;
        _rrAnime(c, -sw / 2, -1, sw, shortSlv ? ((!isBoy && topWear === 'kaos') ? 15 : 12) : 26, 3.3, armCol, INK);
      }
      c.fillStyle = '#fff0e6'; c.beginPath(); c.arc(0, 30.2, 2.9, 0, Math.PI * 2); c.fill(); c.stroke();
      c.restore();
    }
    drawArm(isBoy ? -14.2 : -11.4, -step * 0.28 + 0.10);

    /* 4. Badan dasar + Pakaian modular (none / kaos oversize / kemeja / formal / driver) */
    c.save(); c.translate(0, breath * 0.55);
    if (isBoy) {
      c.fillStyle = '#fff0e6'; c.strokeStyle = INK; c.lineWidth = 1.15;
      c.beginPath();
      c.moveTo(-4.2, -92.5); c.lineTo(4.2, -92.5);
      c.quadraticCurveTo(13.5, -90.5, 14.8, -83.5);
      c.lineTo(12.2, -52); c.lineTo(-12.2, -52);
      c.lineTo(-14.8, -83.5);
      c.quadraticCurveTo(-13.5, -90.5, -4.2, -92.5);
      c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#334155'; c.strokeStyle = INK; c.lineWidth = 1.1;
      c.beginPath(); c.moveTo(-12.2, -56); c.lineTo(12.2, -56); c.lineTo(11.6, -45); c.lineTo(2, -45); c.lineTo(0, -48); c.lineTo(-2, -45); c.lineTo(-11.6, -45); c.closePath(); c.fill(); c.stroke();
    } else {
      c.fillStyle = '#fff0e6'; c.strokeStyle = INK; c.lineWidth = 1.15;
      c.beginPath();
      c.moveTo(-3.4, -92.5); c.lineTo(3.4, -92.5);
      c.quadraticCurveTo(10.2, -90.8, 11.4, -84.2);
      c.bezierCurveTo(13.4, -78.5, 12.6, -73, 8.2, -65.5);
      c.bezierCurveTo(11.2, -60, 14.0, -55, 13.4, -48.5);
      c.quadraticCurveTo(7.8, -43.5, 0, -43.0);
      c.quadraticCurveTo(-7.8, -43.5, -13.4, -48.5);
      c.bezierCurveTo(-14.0, -55, -11.2, -60, -8.2, -65.5);
      c.bezierCurveTo(-12.6, -73, -13.4, -78.5, -11.4, -84.2);
      c.quadraticCurveTo(-10.2, -90.8, -3.4, -92.5);
      c.closePath(); c.fill(); c.stroke();

      c.fillStyle = 'rgba(175,118,98,0.45)';
      c.beginPath(); c.ellipse(0, -61.5, 0.85, 1.25, 0, 0, Math.PI * 2); c.fill();

      c.fillStyle = '#fb7185'; c.strokeStyle = INK; c.lineWidth = 1.0;
      c.beginPath(); c.moveTo(-7.2, -89.8); c.lineTo(-7.0, -79.5); c.moveTo(7.2, -89.8); c.lineTo(7.0, -79.5); c.stroke();
      c.beginPath();
      c.moveTo(-13.4, -77.5);
      c.quadraticCurveTo(-6.8, -83.2, 0, -76.5);
      c.quadraticCurveTo(6.8, -83.2, 13.4, -77.5);
      c.quadraticCurveTo(7.8, -67.2, 0, -71.8);
      c.quadraticCurveTo(-7.8, -67.2, -13.4, -77.5);
      c.closePath(); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.32)';
      c.beginPath(); c.ellipse(-6.2, -76.5, 3.4, 1.8, -0.2, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(6.2, -76.5, 3.4, 1.8, 0.2, 0, Math.PI * 2); c.fill();

      if (botWear === 'none') {
        c.fillStyle = '#fb7185'; c.strokeStyle = INK; c.lineWidth = 1.0;
        c.beginPath();
        c.moveTo(-12.4, -55.5); c.quadraticCurveTo(0, -53.2, 12.4, -55.5);
        c.quadraticCurveTo(13.4, -51.5, 11.0, -48.2); c.quadraticCurveTo(5.5, -44.2, 0, -43.2);
        c.quadraticCurveTo(-5.5, -44.2, -11.0, -48.2); c.quadraticCurveTo(-13.4, -51.5, -12.4, -55.5);
        c.closePath(); c.fill(); c.stroke();
      }
    }

    if (botWear !== 'none') {
      var wCol = botWear === 'jeans' ? '#315b8e' : botWear === 'pendek' ? (isBoy ? '#475569' : '#4f7396') : '#3c4352';
      var legEdge = isBoy ? 11.1 : 10.6;
      c.fillStyle = wCol; c.strokeStyle = INK; c.lineWidth = 1.1;
      c.beginPath();
      if (isBoy) {
        c.moveTo(-12.6, -56.5); c.lineTo(12.6, -56.5); c.lineTo(legEdge, -42.0); c.lineTo(-legEdge, -42.0);
        c.closePath(); c.fill();
        c.beginPath(); c.moveTo(-legEdge, -42.0); c.lineTo(-12.6, -56.5); c.lineTo(12.6, -56.5); c.lineTo(legEdge, -42.0); c.stroke();
      } else {
        c.moveTo(-10.2, -58.5); c.quadraticCurveTo(0, -57.8, 10.2, -58.5);
        c.bezierCurveTo(14.6, -54.8, 14.4, -48.5, legEdge, -41.5); c.lineTo(-legEdge, -41.5);
        c.bezierCurveTo(-14.4, -48.5, -14.6, -54.8, -10.2, -58.5);
        c.closePath(); c.fill();
        c.beginPath(); c.moveTo(-legEdge, -41.5); c.bezierCurveTo(-14.4, -48.5, -14.6, -54.8, -10.2, -58.5);
        c.quadraticCurveTo(0, -57.8, 10.2, -58.5); c.bezierCurveTo(14.6, -54.8, 14.4, -48.5, legEdge, -41.5); c.stroke();
      }
    }

    function drawSoftBustShade(shCol, hiCol) {
      c.save();
      c.fillStyle = shCol;
      c.beginPath();
      c.moveTo(-13.2, -72.2); c.quadraticCurveTo(-6.4, -66.5, 0, -70.8); c.quadraticCurveTo(6.4, -66.5, 13.2, -72.2);
      c.quadraticCurveTo(7.2, -62.5, 0, -67.2); c.quadraticCurveTo(-7.2, -62.5, -13.2, -72.2);
      c.closePath(); c.fill();
      c.fillStyle = hiCol;
      c.beginPath(); c.ellipse(-6.0, -76.5, 5.0, 2.8, -0.15, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(6.0, -76.5, 5.0, 2.8, 0.15, 0, Math.PI * 2); c.fill();
      c.restore();
    }

    if (topWear === 'kaos') {
      c.fillStyle = isBoy ? '#3b82f6' : '#fbcfe8'; c.strokeStyle = INK; c.lineWidth = 1.15;
      c.beginPath();
      if (isBoy) {
        c.moveTo(-4.8, -92); c.lineTo(4.8, -92); c.quadraticCurveTo(14.0, -90.5, 15.2, -83.5);
        c.lineTo(13.2, -53); c.quadraticCurveTo(0, -52, -13.2, -53); c.lineTo(-15.2, -83.5); c.quadraticCurveTo(-14.0, -90.5, -4.8, -92);
      } else {
        c.moveTo(-4.5, -92); c.lineTo(4.5, -92); c.quadraticCurveTo(12.2, -90.5, 14.2, -83.0);
        c.bezierCurveTo(16.6, -73, 16.4, -54, 17.0, -37.5); c.quadraticCurveTo(8, -35.2, 0, -36.5);
        c.quadraticCurveTo(-8, -35.2, -17.0, -37.5); c.bezierCurveTo(-16.4, -54, -16.6, -73, -14.2, -83.0); c.quadraticCurveTo(-12.2, -90.5, -4.5, -92);
      }
      c.closePath(); c.fill(); c.stroke();
      if (!isBoy) drawSoftBustShade('rgba(190,82,126,0.22)', 'rgba(255,255,255,0.34)');
      c.fillStyle = '#fff0e6'; c.beginPath(); c.arc(0, -91.5, 4.5, 0, Math.PI); c.fill(); c.stroke();
    } else if (topWear === 'kemeja') {
      c.fillStyle = '#f8fafc'; c.strokeStyle = INK; c.lineWidth = 1.15;
      c.beginPath();
      if (isBoy) {
        c.moveTo(-4.8, -92); c.lineTo(4.8, -92); c.quadraticCurveTo(14.2, -90.5, 15.5, -83.5);
        c.lineTo(13.2, -52); c.quadraticCurveTo(0, -51, -13.2, -52); c.lineTo(-15.5, -83.5); c.quadraticCurveTo(-14.2, -90.5, -4.8, -92);
      } else {
        c.moveTo(-4.0, -92); c.lineTo(4.0, -92); c.quadraticCurveTo(11.0, -90.5, 12.8, -83.5);
        c.bezierCurveTo(14.8, -76, 12.6, -69, 9.4, -55); c.quadraticCurveTo(0, -53.5, -9.4, -55);
        c.bezierCurveTo(-12.6, -69, -14.8, -76, -12.8, -83.5); c.quadraticCurveTo(-11.0, -90.5, -4.0, -92);
      }
      c.closePath(); c.fill(); c.stroke();
      if (!isBoy) drawSoftBustShade('rgba(100,116,139,0.20)', 'rgba(255,255,255,0.55)');
      c.strokeStyle = '#94a3b8'; c.lineWidth = 1.0; c.beginPath(); c.moveTo(0, -87); c.lineTo(0, -55); c.stroke();
      c.fillStyle = '#e2e8f0'; c.strokeStyle = INK; c.lineWidth = 0.9;
      c.beginPath(); c.moveTo(0, -86); c.lineTo(-5.5, -90.5); c.lineTo(-4.5, -83); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(0, -86); c.lineTo(5.5, -90.5); c.lineTo(4.5, -83); c.closePath(); c.fill(); c.stroke();
    } else if (topWear === 'formal' || topWear === 'driver') {
      c.fillStyle = topWear === 'driver' ? '#0f766e' : (isBoy ? '#1e293b' : '#334155'); c.strokeStyle = INK; c.lineWidth = 1.15;
      c.beginPath();
      if (isBoy) {
        c.moveTo(-5.0, -92); c.lineTo(5.0, -92); c.quadraticCurveTo(14.5, -90.5, 15.8, -83.5);
        c.lineTo(13.6, -49); c.quadraticCurveTo(0, -48, -13.6, -49); c.lineTo(-15.8, -83.5); c.quadraticCurveTo(-14.5, -90.5, -5.0, -92);
      } else {
        c.moveTo(-4.2, -92); c.lineTo(4.2, -92); c.quadraticCurveTo(11.4, -90.5, 13.0, -83.5);
        c.bezierCurveTo(15.0, -76, 12.6, -69, 9.6, -62); c.quadraticCurveTo(12.2, -56, 11.8, -51);
        c.quadraticCurveTo(0, -49.5, -11.8, -51); c.quadraticCurveTo(-12.2, -56, -9.6, -62);
        c.bezierCurveTo(-12.6, -69, -15.0, -76, -13.0, -83.5); c.quadraticCurveTo(-11.4, -90.5, -4.2, -92);
      }
      c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(-4.6, -91.5); c.lineTo(4.6, -91.5); c.lineTo(3.2, -52); c.lineTo(-3.2, -52); c.closePath(); c.fill();
      if (!isBoy) drawSoftBustShade('rgba(15,23,42,0.28)', 'rgba(255,255,255,0.16)');
      if (topWear === 'formal') {
        if (isBoy) { c.fillStyle = '#dc2626'; c.fillRect(-1.4, -87, 2.8, 22); }
        else { c.fillStyle = '#fb7185'; c.beginPath(); c.arc(0, -84, 2.0, 0, Math.PI * 2); c.fill(); }
      }
    }
    c.restore();

    /* 5. Lengan depan */
    drawArm(isBoy ? 14.2 : 11.4, step * 0.28 - 0.10);

    /* 6. Kepala, Wajah Natural, Poni Rapi sampai Alis + Kuncir Kanan Atas */
    c.save();
    c.translate(0, -109 + breath * 0.65);

    if (!isBoy) {
      c.save(); c.translate(13, -17); c.rotate(tailSway);
      c.fillStyle = '#1b1824'; c.strokeStyle = INK; c.lineWidth = 1.15;
      c.beginPath();
      c.moveTo(0, 0); c.bezierCurveTo(13, -6, 21, 6, 17, 26); c.quadraticCurveTo(13, 33, 7.5, 27);
      c.bezierCurveTo(9.5, 15, 4, 7.5, -1.8, 2.8); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(226,232,255,0.34)'; c.lineWidth = 1.35;
      c.beginPath(); c.moveTo(5.5, 2); c.quadraticCurveTo(13, 8, 12, 17); c.stroke();
      c.fillStyle = '#fb7185'; c.strokeStyle = INK; c.lineWidth = 0.85;
      c.beginPath(); c.ellipse(-1, 0, 3.8, 2.2, -0.5, 0, Math.PI * 2); c.fill(); c.stroke();
      c.beginPath(); c.ellipse(2.8, -2.8, 3.3, 1.9, 0.4, 0, Math.PI * 2); c.fill(); c.stroke();
      c.restore();
    }

    _rrAnime(c, -3.4, 9, 6.8, 11, 3, '#f7dfd2', INK);

    var fcG = c.createLinearGradient(0, -17, 0, 15);
    fcG.addColorStop(0, isBoy ? '#fff1e6' : '#fff5ee'); fcG.addColorStop(1, isBoy ? '#f7d8c4' : '#fce4d6');
    c.fillStyle = fcG; c.strokeStyle = INK; c.lineWidth = 1.15;
    c.beginPath();
    if (isBoy) {
      c.moveTo(-13.8, -5); c.lineTo(-13.2, 5.2); c.quadraticCurveTo(-7.5, 12.6, 0, 15.8);
      c.quadraticCurveTo(7.5, 12.6, 13.2, 5.2); c.lineTo(13.8, -5);
      c.bezierCurveTo(13.8, -17.5, 7.5, -20.8, 0, -20.8); c.bezierCurveTo(-7.5, -20.8, -13.8, -17.5, -13.8, -5);
    } else {
      c.moveTo(-14.5, -4); c.bezierCurveTo(-14.8, 7.8, -7.8, 13.5, 0, 14.8);
      c.bezierCurveTo(7.8, 13.5, 14.8, 7.8, 14.5, -4);
      c.bezierCurveTo(14.5, -17.8, 8, -20.8, 0, -20.8); c.bezierCurveTo(-8, -20.8, -14.5, -17.8, -14.5, -4);
    }
    c.closePath(); c.fill(); c.stroke();

    if (!isBoy) {
      c.fillStyle = 'rgba(251,146,162,0.30)';
      c.beginPath(); c.ellipse(-8.2, 4.2, 3.2, 1.6, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(8.2, 4.2, 3.2, 1.6, 0, 0, Math.PI * 2); c.fill();
    }

    [-5.8, 5.8].forEach(function (ex, idx) {
      if (blink) {
        c.strokeStyle = INK; c.lineWidth = 1.5; c.lineCap = 'round';
        c.beginPath(); c.moveTo(ex - 3.0, 1.0); c.quadraticCurveTo(ex, 2.2, ex + 3.0, 1.0); c.stroke();
      } else if (isBoy) {
        c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(ex, 0.5, 3.0, 1.7, 0, 0, Math.PI * 2); c.fill();
        var irB = c.createLinearGradient(ex, -1.2, ex, 2.2);
        irB.addColorStop(0, '#121622'); irB.addColorStop(0.6, '#2d3748'); irB.addColorStop(1, '#5a6b82');
        c.fillStyle = irB; c.beginPath(); c.ellipse(ex + (idx === 0 ? 0.2 : -0.2), 0.5, 1.8, 1.6, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ffffff'; c.beginPath(); c.arc(ex - 0.6, -0.25, 0.6, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#181820'; c.lineWidth = 1.65; c.lineCap = 'round';
        c.beginPath(); c.moveTo(ex - 3.3, 0.0); c.quadraticCurveTo(ex, -1.8, ex + 3.3, -0.3); c.stroke();
        c.strokeStyle = '#1e1b24'; c.lineWidth = 1.45;
        c.beginPath(); c.moveTo(ex - 3.2, -3.6); c.lineTo(ex + 3.0, -4.4); c.stroke();
      } else {
        c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(ex, 0.7, 2.9, 2.5, 0, 0, Math.PI * 2); c.fill();
        var irG = c.createLinearGradient(ex, -1.8, ex, 3.0);
        irG.addColorStop(0, '#23181a'); irG.addColorStop(0.65, '#4c3230'); irG.addColorStop(1, '#8c6258');
        c.fillStyle = irG; c.beginPath(); c.ellipse(ex + (idx === 0 ? 0.18 : -0.18), 0.8, 2.0, 2.2, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ffffff'; c.beginPath(); c.arc(ex - 0.72, -0.35, 0.78, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#24181c'; c.lineWidth = 1.5; c.lineCap = 'round';
        c.beginPath(); c.moveTo(ex - 3.2, -0.2); c.quadraticCurveTo(ex, -2.5, ex + 3.2, -0.2); c.stroke();
        c.strokeStyle = '#332428'; c.lineWidth = 1.0;
        c.beginPath(); c.moveTo(ex - 2.6, -4.8); c.quadraticCurveTo(ex, -5.8, ex + 2.6, -4.6); c.stroke();
      }
    });

    if (isBoy) {
      c.strokeStyle = '#c48d78'; c.lineWidth = 1.0; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 2.2); c.lineTo(-0.4, 5.2); c.lineTo(0.8, 5.6); c.stroke();
      c.strokeStyle = '#9c5a54'; c.lineWidth = 1.25;
      c.beginPath(); c.moveTo(-2.4, 9.0); c.quadraticCurveTo(0.4, 9.8, 3.0, 8.4); c.stroke();
    } else {
      c.fillStyle = '#d49a8a'; c.fillRect(-0.5, 4.0, 1.0, 1.15);
      c.strokeStyle = '#b46266'; c.lineWidth = 1.2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-2.6, 7.8); c.quadraticCurveTo(0, 9.6, 2.6, 7.8); c.stroke();
    }

    c.fillStyle = '#1b1824'; c.strokeStyle = INK; c.lineWidth = 1.1;
    if (isBoy) {
      c.beginPath();
      c.moveTo(-15.5, 0.5); c.bezierCurveTo(-17, -18, -8.5, -24.5, 0.5, -25.2); c.bezierCurveTo(9.5, -25.2, 17, -18.5, 15.5, 0.5);
      c.lineTo(13.2, 3.0); c.lineTo(12.2, -5.5); c.quadraticCurveTo(6.5, -10.5, 2.5, -4.5); c.quadraticCurveTo(-1.5, -10.5, -9.5, -6.5);
      c.lineTo(-12.2, -4.0); c.lineTo(-13.2, 3.0); c.closePath(); c.fill(); c.stroke();
    } else {
      c.beginPath();
      c.moveTo(-16.5, 0); c.bezierCurveTo(-17.5, -21.5, -8.2, -24.2, 0, -24.2); c.bezierCurveTo(8.2, -24.2, 17.5, -21.5, 16.5, 0);
      c.lineTo(14.5, 11.5); c.lineTo(11.8, 6.2); c.lineTo(12.0, -3.5);
      c.quadraticCurveTo(6.5, -3.2, 3.0, -4.2); c.quadraticCurveTo(0, -3.0, -3.0, -4.2); c.quadraticCurveTo(-6.5, -3.2, -12.0, -3.5);
      c.lineTo(-11.8, 6.2); c.lineTo(-14.5, 11.5); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(180,192,225,0.22)'; c.lineWidth = 0.85; c.lineCap = 'round';
      c.beginPath();
      c.moveTo(-6.8, -16.5); c.quadraticCurveTo(-7.2, -9.5, -6.5, -4.2);
      c.moveTo(-2.5, -17.5); c.quadraticCurveTo(-2.6, -10.5, -2.4, -4.4);
      c.moveTo(2.5, -17.5); c.quadraticCurveTo(2.6, -10.5, 2.4, -4.4);
      c.moveTo(6.8, -16.5); c.quadraticCurveTo(7.2, -9.5, 6.5, -4.2);
      c.stroke();
    }
    c.strokeStyle = 'rgba(226,232,255,0.34)'; c.lineWidth = 1.65; c.lineCap = 'round';
    c.beginPath(); c.arc(-4.8, -13.8, 6.2, Math.PI * 1.18, Math.PI * 1.54); c.stroke();
    c.beginPath(); c.arc(4.8, -13.8, 6.2, Math.PI * 1.46, Math.PI * 1.82); c.stroke();
    c.restore();
    c.restore();

    if (o.label) {
      var yLblH = y - 144 * sk - bob;
      c.save();
      c.font = '800 10.5px "Nunito", system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      var twL = Math.min(118, (c.measureText ? c.measureText(o.label).width : o.label.length * 6) + 14);
      _rrAnime(c, x - twL / 2, yLblH - 8.5, twL, 17, 8.5, 'rgba(14,18,24,0.78)');
      c.fillStyle = '#fef3c7'; c.fillText(o.label, x, yLblH + 0.5);
      c.restore();
    }
  }

  function gambarKarakterPreview(canvasEl, gender, tp, now) {
    if (!canvasEl || !canvasEl.getContext) return;
    var c = canvasEl.getContext('2d');
    var pw = canvasEl.width, ph = canvasEl.height;
    c.clearRect(0, 0, pw, ph);
    var bg = c.createLinearGradient(0, 0, 0, ph);
    bg.addColorStop(0, '#f7e9d4'); bg.addColorStop(0.65, '#e8cfa9'); bg.addColorStop(1, '#c8925a');
    c.fillStyle = bg; c.fillRect(0, 0, pw, ph);
    gambarKarakterAnime(c, pw * 0.5, ph * 0.94, gender, now || Date.now(), { skala: 1.08, tampilan: tp || {} });
  }

  function _gambarKarakterRumahLegacy(x, y, gender, t, o) {
    var sk = o.skala || 1, cewek = gender === 'cewek';
    var sedangJalan = !!o.jalan;
    var ayunKaki = sedangJalan ? Math.sin(t / 140) * 6 : 0;
    var bob = sedangJalan ? Math.abs(Math.sin(t / 140)) * 2.2 : Math.sin(t / 520 + x * 0.1) * 1.1;
    var baju = o.baju || (cewek ? '#c85a7c' : '#1f7a72');
    var celana = o.celana || (cewek ? '#2f3d4c' : '#263340');
    var tp = (o.tampilan && o.tampilan.kulitHex) ? o.tampilan : tampilanDariNama(o.label || '', gender, sk < 0.72);
    var kulit = tp.kulitHex || '#f5cb9f';
    var berhijab = cewek && tp.rambut === 'hijab';

    cx.save();
    cx.translate(x, y);
    cx.scale(sk, sk);
    /* bayangan pijakan lantai */
    cx.fillStyle = 'rgba(0,0,0,.20)';
    cx.beginPath(); cx.ellipse(0, 1, 17, 4.5, 0, 0, Math.PI * 2); cx.fill();
    cx.translate(0, -bob);

    var tKaki = cewek ? 58 : 62;
    var tBadan = cewek ? 45 : 49;
    var yPinggang = -tKaki;
    var yBahu = yPinggang - tBadan;

    /* sepatu & kaki proporsional */
    kotakBulat(-9.5 + ayunKaki * 0.5, -6, 8.5, 6.5, 2.8, '#1e242b');
    kotakBulat(1 - ayunKaki * 0.5, -6, 8.5, 6.5, 2.8, '#1e242b');
    /* tungkai celana panjang / rok panjang */
    if (berhijab) {
      cx.fillStyle = celana;
      cx.beginPath(); cx.moveTo(-11, yPinggang); cx.lineTo(11, yPinggang); cx.lineTo(14, -5); cx.lineTo(-14, -5); cx.closePath(); cx.fill();
    } else {
      cx.fillStyle = celana;
      cx.beginPath(); cx.moveTo(-10.5, yPinggang); cx.lineTo(-1, yPinggang); cx.lineTo(-1.8 + ayunKaki * 0.45, -5); cx.lineTo(-9 + ayunKaki * 0.45, -5); cx.closePath(); cx.fill();
      cx.beginPath(); cx.moveTo(1, yPinggang); cx.lineTo(10.5, yPinggang); cx.lineTo(9 - ayunKaki * 0.45, -5); cx.lineTo(1.8 - ayunKaki * 0.45, -5); cx.closePath(); cx.fill();
    }

    /* lengan kiri & kanan proporsional + telapak tangan sesuai warna kulit */
    var lBahu = cewek ? 13.5 : 15.5;
    var pLengan = cewek ? 39 : 42;
    cx.strokeStyle = baju; cx.lineWidth = cewek ? 6.2 : 7; cx.lineCap = 'round';
    cx.beginPath();
    cx.moveTo(-lBahu, yBahu + 5); cx.quadraticCurveTo(-lBahu - 3, yBahu + pLengan * 0.55, -lBahu - 1 - ayunKaki * 0.4, yBahu + pLengan);
    cx.moveTo(lBahu, yBahu + 5); cx.quadraticCurveTo(lBahu + 3, yBahu + pLengan * 0.55, lBahu + 1 + ayunKaki * 0.4, yBahu + pLengan);
    cx.stroke();
    bulat(-lBahu - 1 - ayunKaki * 0.4, yBahu + pLengan + 2, 3.2, kulit);
    bulat(lBahu + 1 + ayunKaki * 0.4, yBahu + pLengan + 2, 3.2, kulit);

    /* torso (bahu tegap cowok / siluet anggun cewek) dengan shading 3D halus (tidak datar seperti kertas) */
    var grBaju = cx.createLinearGradient(-15, yBahu, 15, yPinggang);
    grBaju.addColorStop(0, geserHex(baju, 24));
    grBaju.addColorStop(0.55, baju);
    grBaju.addColorStop(1, geserHex(baju, -34));
    cx.fillStyle = grBaju;
    cx.beginPath();
    if (cewek) {
      cx.moveTo(-13.5, yBahu + 2);
      cx.quadraticCurveTo(0, yBahu - 3, 13.5, yBahu + 2);
      cx.lineTo(11, yBahu + tBadan * 0.55);
      cx.lineTo(13, yPinggang + 3);
      cx.lineTo(-13, yPinggang + 3);
      cx.lineTo(-11, yBahu + tBadan * 0.55);
    } else {
      cx.moveTo(-15.5, yBahu + 2);
      cx.quadraticCurveTo(0, yBahu - 3, 15.5, yBahu + 2);
      cx.lineTo(12, yPinggang + 2);
      cx.lineTo(-12, yPinggang + 2);
    }
    cx.closePath(); cx.fill();
    cx.strokeStyle = 'rgba(15,23,42,0.18)'; cx.lineWidth = 0.9; cx.stroke();
    /* kerah baju / detail jaket */
    if (!berhijab) {
      cx.fillStyle = kulit;
      cx.beginPath(); cx.moveTo(-4.5, yBahu); cx.lineTo(0, yBahu + 6.5); cx.lineTo(4.5, yBahu); cx.closePath(); cx.fill();
      cx.strokeStyle = 'rgba(255,255,255,.35)'; cx.lineWidth = 1.2;
      cx.beginPath(); cx.moveTo(-5.5, yBahu + 0.5); cx.lineTo(0, yBahu + 7.5); cx.lineTo(5.5, yBahu + 0.5); cx.stroke();
    } else {
      /* kerudung menutup dada secara sopan & rapi */
      cx.fillStyle = baju;
      cx.beginPath(); cx.moveTo(-12, yBahu + 1); cx.quadraticCurveTo(0, yBahu + 18, 12, yBahu + 1); cx.closePath(); cx.fill();
    }
    if (o.hamil) bulat(6, yPinggang - 15, 8.5, baju);

    /* kepala sama persis dengan foto profil! */
    var rKep = cewek ? 12.2 : 12.8;
    var yKep = yBahu - rKep - 1.5;
    gambarKepalaPotret(0, yKep, rKep, gender, tp, { baju: baju, nama: o.label });

    if (o.label) {
      var yLbl = yKep - rKep - (tp.rambut === 'peci' ? 14 : 10);
      cx.font = '800 10.5px "Nunito", system-ui, sans-serif'; cx.textAlign = 'center';
      var wL = cx.measureText(o.label).width + 10;
      kotakBulat(-wL / 2, yLbl - 8, wL, 14, 7, 'rgba(251,250,246,.86)');
      cx.fillStyle = '#1d2b33'; cx.fillText(o.label, 0, yLbl + 2.5);
    }
    cx.restore();
  }
  /* kepala profil samping tampan/cantik untuk adegan ciuman bibir & foreplay romantis (arah: 1 = hadap kanan, -1 = hadap kiri) */
  function gambarKepalaProfil(x, y, r, gender, tp, arah, opts) {
    opts = opts || {};
    var cewek = gender === 'cewek';
    var T = (tp && tp.kulitHex) ? tp : tampilanDariNama('', gender, false);
    var kulit = T.kulitHex || '#f5cb9f', bayang = T.kulitBayang || '#d9a473';
    var rambut = T.rambutHex || '#1c1817', kilau = T.rambutKilau || '#3e3533';
    var gayaR = T.rambut || (cewek ? 'panjang' : 'rapi');
    var baju = opts.baju || (cewek ? '#c85a7c' : '#1f7a72');
    var s = r / 14;
    cx.save();
    cx.translate(x, y);
    if (opts.rot) cx.rotate(opts.rot);
    if (arah < 0) cx.scale(-1, 1);

    /* rambut belakang (mengalir ke belakang kepala) */
    if (cewek) {
      if (gayaR === 'hijab') {
        cx.fillStyle = baju;
        cx.beginPath();
        cx.arc(-2 * s, -1 * s, 15.5 * s, Math.PI * 0.55, Math.PI * 1.92);
        cx.quadraticCurveTo(6 * s, 15 * s, -4 * s, 24 * s);
        cx.lineTo(-18 * s, 24 * s);
        cx.quadraticCurveTo(-20 * s, 8 * s, -16 * s, -2 * s);
        cx.closePath(); cx.fill();
      } else if (gayaR === 'kuncir') {
        cx.fillStyle = rambut;
        cx.beginPath(); cx.moveTo(-12 * s, -4 * s); cx.quadraticCurveTo(-26 * s, -2 * s, -24 * s, 16 * s);
        cx.quadraticCurveTo(-18 * s, 10 * s, -12 * s, 3 * s); cx.closePath(); cx.fill();
        bulat(-12.5 * s, -3 * s, 2.5 * s, '#f2a516');
      } else if (gayaR === 'bob') {
        cx.fillStyle = rambut;
        cx.beginPath(); cx.arc(-2 * s, -2 * s, 14.5 * s, Math.PI * 0.6, Math.PI * 1.9);
        cx.quadraticCurveTo(-17 * s, 10 * s, -12 * s, 16 * s); cx.lineTo(-2 * s, 14 * s); cx.closePath(); cx.fill();
      } else {
        /* rambut panjang / bergelombang */
        cx.fillStyle = rambut;
        cx.beginPath(); cx.arc(-2 * s, -2 * s, 14.8 * s, Math.PI * 0.55, Math.PI * 1.92);
        cx.quadraticCurveTo(-21 * s, 12 * s, -16 * s, 28 * s);
        cx.lineTo(-4 * s, 24 * s); cx.closePath(); cx.fill();
      }
    } else if (gayaR === 'gondrong') {
      cx.fillStyle = rambut;
      cx.beginPath(); cx.arc(-2 * s, -2 * s, 14.2 * s, Math.PI * 0.65, Math.PI * 1.9);
      cx.quadraticCurveTo(-18 * s, 12 * s, -13 * s, 20 * s); cx.lineTo(-4 * s, 16 * s); cx.closePath(); cx.fill();
    }

    /* leher anatomis */
    kotakBulat(-7.5 * s, 9.5 * s, 9.5 * s, 11 * s, 4 * s, bayang);

    /* kontur kepala & profil wajah samping (dahi, hidung, bibir atas-bawah, dagu, rahang) */
    cx.fillStyle = kulit;
    cx.beginPath();
    cx.moveTo(-11 * s, -2 * s);
    cx.bezierCurveTo(-11 * s, -12.5 * s, -3 * s, -14.5 * s, 4.5 * s, -13 * s);
    cx.quadraticCurveTo(10.5 * s, -11 * s, 11.2 * s, -4.5 * s); /* dahi */
    cx.lineTo(14.2 * s, 0.2 * s); /* ujung hidung */
    cx.quadraticCurveTo(14.4 * s, 1.8 * s, 11.8 * s, 2.2 * s); /* bawah hidung */
    cx.lineTo(13.2 * s, 4.2 * s); /* bibir atas */
    cx.lineTo(11.6 * s, 5.2 * s); /* celah bibir */
    cx.lineTo(12.8 * s, 6.8 * s); /* bibir bawah */
    cx.quadraticCurveTo(11.4 * s, 10.8 * s, 7.2 * s, 12.2 * s); /* dagu */
    cx.quadraticCurveTo(-1 * s, 13.4 * s, -7.5 * s, 9.5 * s); /* rahang */
    cx.quadraticCurveTo(-11.2 * s, 5.5 * s, -11 * s, -2 * s);
    cx.closePath(); cx.fill();

    /* rona pipi & warna bibir lembut */
    cx.fillStyle = cewek ? 'rgba(235,105,130,.38)' : 'rgba(225,115,120,.22)';
    cx.beginPath(); cx.ellipse(5.5 * s, 3.2 * s, 3.6 * s, 2.1 * s, 0, 0, Math.PI * 2); cx.fill();
    cx.fillStyle = cewek ? '#d95b7a' : '#c46a6a';
    cx.beginPath(); cx.ellipse(12.2 * s, 5.3 * s, 1.5 * s, 2.0 * s, 0.1, 0, Math.PI * 2); cx.fill();

    /* alis & mata terpejam lembut dengan bulu mata */
    cx.strokeStyle = rambut; cx.lineWidth = (cewek ? 1.1 : 1.5) * s; cx.lineCap = 'round';
    cx.beginPath(); cx.moveTo(4.2 * s, -4.8 * s); cx.quadraticCurveTo(7.8 * s, -6.2 * s, 10.4 * s, -4.4 * s); cx.stroke();
    cx.strokeStyle = '#241816'; cx.lineWidth = (cewek ? 1.4 : 1.3) * s;
    cx.beginPath(); cx.moveTo(4.6 * s, -1.8 * s); cx.quadraticCurveTo(7.6 * s, 0.2 * s, 10.2 * s, -1.4 * s); cx.stroke();
    if (cewek) {
      cx.lineWidth = 1.0 * s;
      cx.beginPath(); cx.moveTo(9.8 * s, -1.3 * s); cx.lineTo(11.4 * s, -2.3 * s); cx.stroke();
    }

    /* telinga (kecuali hijab) */
    if (gayaR !== 'hijab') {
      bulat(-4.5 * s, 1.8 * s, 2.6 * s, kulit);
      cx.strokeStyle = bayang; cx.lineWidth = 0.9 * s;
      cx.beginPath(); cx.arc(-4.5 * s, 1.8 * s, 1.3 * s, -0.8, 1.5); cx.stroke();
    }

    /* rambut atas & poni depan */
    if (gayaR === 'hijab') {
      cx.strokeStyle = baju; cx.lineWidth = 3.2 * s;
      cx.beginPath(); cx.arc(-1.5 * s, -1 * s, 13.5 * s, Math.PI * 0.52, Math.PI * 1.82); cx.stroke();
      cx.strokeStyle = 'rgba(255,255,255,.35)'; cx.lineWidth = 1.1 * s;
      cx.beginPath(); cx.arc(-1.5 * s, -1 * s, 12.2 * s, Math.PI * 0.8, Math.PI * 1.65); cx.stroke();
    } else {
      cx.fillStyle = rambut;
      cx.beginPath();
      cx.arc(-1.5 * s, -3 * s, 13.4 * s, Math.PI * 0.85, Math.PI * 1.95);
      cx.quadraticCurveTo(8 * s, -8.5 * s, 2 * s, -6.5 * s);
      cx.quadraticCurveTo(-4 * s, -4.5 * s, -8.5 * s, 2 * s);
      cx.quadraticCurveTo(-13 * s, -1 * s, -13.5 * s, -3 * s);
      cx.closePath(); cx.fill();
      cx.strokeStyle = kilau; cx.lineWidth = 1.2 * s;
      cx.beginPath(); cx.moveTo(-8 * s, -11 * s); cx.quadraticCurveTo(0, -14 * s, 7 * s, -10.5 * s); cx.stroke();
      if (!cewek && gayaR === 'peci') {
        kotakBulat(-12 * s, -17 * s, 22 * s, 8.5 * s, 2.2 * s, '#17191d');
      }
    }
    cx.restore();
  }
  /* adegan ciuman bibir romantis profil samping */
  function gambarCiumanBibir(cy, t, cwo, cwk) {
    var gerak = Math.sin(t / 520);
    var dekap = gerak * 2.2; /* gerakan lembut bernapas saat bibir saling menyentuh */
    var yBase = cy + 92;
    var klCwo = cwo.tp.kulitHex || '#f5cb9f', klCwk = cwk.tp.kulitHex || '#f5cb9f';
    var bajuCwo = '#1f6f68', bajuCwk = '#c84b74';
    /* cahaya hangat lembut di sekitar titik ciuman */
    var glow = cx.createRadialGradient(180, cy - 2, 6, 180, cy - 2, 110);
    glow.addColorStop(0, 'rgba(255,190,215,' + (0.34 + Math.abs(gerak) * 0.14).toFixed(2) + ')');
    glow.addColorStop(1, 'rgba(255,120,160,0)');
    cx.fillStyle = glow; cx.fillRect(70, cy - 112, 220, 220);

    /* tubuh & bahu proporsional (kiri: cowok condong ke kanan; kanan: cewek condong ke kiri) */
    cx.fillStyle = bajuCwo;
    cx.beginPath();
    cx.moveTo(68, yBase + 90); cx.lineTo(86, cy + 28);
    cx.quadraticCurveTo(126, cy + 16, 158 + dekap * 0.5, cy + 36);
    cx.lineTo(166, yBase + 90); cx.closePath(); cx.fill();

    cx.fillStyle = bajuCwk;
    cx.beginPath();
    cx.moveTo(292, yBase + 90); cx.lineTo(272, cy + 32);
    cx.quadraticCurveTo(234, cy + 20, 202 - dekap * 0.5, cy + 38);
    cx.lineTo(194, yBase + 90); cx.closePath(); cx.fill();

    /* kepala profil saling berhadapan sehingga bibir benar-benar bertemu di tengah (x = 180) */
    gambarKepalaProfil(153.5 + dekap * 0.6, cy - 12, 29, cwo.g, cwo.tp, 1, { rot: 0.08 + gerak * 0.02, baju: bajuCwo });
    gambarKepalaProfil(206.5 - dekap * 0.6, cy - 8, 28, cwk.g, cwk.tp, -1, { rot: -0.10 - gerak * 0.02, baju: bajuCwk });

    /* tangan cowok menyentuh lembut pipi/rahang cewek & tangan cewek merangkul bahu cowok */
    cx.strokeStyle = bajuCwo; cx.lineWidth = 14; cx.lineCap = 'round';
    cx.beginPath(); cx.moveTo(118, cy + 68); cx.quadraticCurveTo(160, cy + 56, 188 - dekap * 0.4, cy + 18); cx.stroke();
    bulat(192 - dekap * 0.4, cy + 14, 7.5, klCwo);

    cx.strokeStyle = bajuCwk; cx.lineWidth = 12; cx.lineCap = 'round';
    cx.beginPath(); cx.moveTo(244, cy + 72); cx.quadraticCurveTo(208, cy + 56, 162 + dekap * 0.4, cy + 44); cx.stroke();
    bulat(158 + dekap * 0.4, cy + 44, 6.8, klCwk);
  }
  /* adegan foreplay terpadu (dipakai saat tombol Foreplay ditekan maupun fase awal Long Time HB) */
  function gambarAdeganForeplay(yRanjang, t, cwo, cwk, wrnSel, wrnSelTua) {
    var ayun = Math.sin(t / 560);
    var usap = Math.sin(t / 420);
    var ciumSesekali = Math.max(0, Math.sin(t / 900)) * 6;
    var klCwo = cwo.tp.kulitHex || '#f5cb9f', klCwk = cwk.tp.kulitHex || '#f5cb9f';
    var bajuCwo = '#1b6b63', bajuCwk = '#c84b74';
    var yD = yRanjang + 18;

    /* cahaya lilin hangat romantis */
    var cg = cx.createRadialGradient(180, yD - 45, 10, 180, yD - 45, 145);
    cg.addColorStop(0, 'rgba(255,195,145,.26)'); cg.addColorStop(1, 'rgba(255,120,100,0)');
    cx.fillStyle = cg; cx.fillRect(35, yD - 190, 290, 260);

    /* 1. Torso cewek bersandar nyaman di bantal kiri-tengah, tubuh sedikit miring menghadap cowok */
    cx.fillStyle = bajuCwk;
    cx.beginPath();
    cx.moveTo(96, yD + 12);
    cx.quadraticCurveTo(106, yD - 42, 138, yD - 44);
    cx.quadraticCurveTo(166, yD - 36, 174, yD + 12);
    cx.closePath(); cx.fill();

    /* 2. Torso cowok condong mendekat dari kanan memeluk erat & penuh kasih */
    cx.fillStyle = bajuCwo;
    cx.beginPath();
    cx.moveTo(176 - ciumSesekali * 0.4, yD + 12);
    cx.quadraticCurveTo(186 - ciumSesekali * 0.5, yD - 48, 224 - ciumSesekali * 0.3, yD - 46);
    cx.quadraticCurveTo(256, yD - 32, 262, yD + 12);
    cx.closePath(); cx.fill();

    /* 3. Kepala profil 3/4 saling berhadapan sangat dekat (sesekali saling mendekat mencium kening/pipi/bibir) */
    gambarKepalaProfil(140 + ciumSesekali * 0.35, yD - 60 + ayun * 1.5, 24, cwk.g, cwk.tp, 1, { rot: -0.14 + ayun * 0.03, baju: bajuCwk });
    gambarKepalaProfil(196 - ciumSesekali * 0.85, yD - 64 + ayun * 1.5, 25, cwo.g, cwo.tp, -1, { rot: 0.16 - ayun * 0.03, baju: bajuCwo });

    /* 4. Lengan saling memeluk & tangan cowok mengusap lembut pipi/rambut cewek */
    cx.strokeStyle = bajuCwk; cx.lineWidth = 10; cx.lineCap = 'round';
    cx.beginPath(); cx.moveTo(132, yD - 24); cx.quadraticCurveTo(168, yD - 20, 206 - ciumSesekali * 0.4, yD - 36); cx.stroke();
    bulat(209 - ciumSesekali * 0.4, yD - 37, 5.5, klCwk);

    cx.strokeStyle = bajuCwo; cx.lineWidth = 11; cx.lineCap = 'round';
    cx.beginPath(); cx.moveTo(222, yD - 20); cx.quadraticCurveTo(186, yD - 28, 156 + usap * 2.5, yD - 44 + usap * 1.8); cx.stroke();
    bulat(154 + usap * 2.5, yD - 45 + usap * 1.8, 6, klCwo);

    /* 5. Selimut lembut menutupi pinggang ke bawah secara rapi */
    cx.fillStyle = wrnSel;
    cx.beginPath();
    cx.moveTo(64, yD + 4);
    cx.quadraticCurveTo(180, yD - 8 + ayun * 2, 312, yD + 6);
    cx.lineTo(312, yD + 52); cx.lineTo(64, yD + 52); cx.closePath(); cx.fill();
    cx.strokeStyle = 'rgba(255,255,255,.26)'; cx.lineWidth = 4;
    cx.beginPath(); cx.moveTo(70, yD + 4); cx.quadraticCurveTo(180, yD - 7 + ayun * 2, 306, yD + 6); cx.stroke();
    cx.strokeStyle = wrnSelTua; cx.lineWidth = 2.2;
    cx.beginPath(); cx.moveTo(86, yD + 24); cx.quadraticCurveTo(185, yD + 14, 294, yD + 26); cx.stroke();
  }
  /* kepala vektor romantis (mata terpejam, pipi merona) tetapi tetap mengikuti kulit & gaya rambut karakter */
  function kepalaV(x, y, r, jenis, rot, tpCustom) {
    gambarKepalaPotret(x, y, r, jenis, tpCustom, { rot: rot || 0, merem: true, tanpaLeher: false });
  }
  var HB_JUDUL = { metime: 'Me time', ciuman: 'Ciuman hangat', foreplay: 'Foreplay romantis', kamar: 'Malam hangat berdua', sofa: 'Berdua di depan TV', hotel: 'Kamar hotel', mandi: 'Berdua di balik uap', pelukan: 'Pelukan hangat', balkon: 'Angin malam di balkon' };
  /* adegan HB sinematik: latar berbeda tiap varian, kedua karakter hanya terlihat dari bahu ke atas, bagian bawah tertutup selimut atau kaca buram */
  /* me time: kamar redup, satu siluet disorot lampu, tanpa detail (sengaja tidak eksplisit) */
  function gambarMeTime(s, t, u, g) {
    var gr = cx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0d0a18'); gr.addColorStop(1, '#1d1530');
    cx.fillStyle = gr; cx.fillRect(0, 0, W, H);
    var kb = 0.10 + Math.abs(Math.sin(t / 900)) * 0.04;
    cx.fillStyle = 'rgba(255,214,150,' + kb.toFixed(3) + ')';
    cx.beginPath(); cx.moveTo(150, 20); cx.lineTo(210, 20); cx.lineTo(282, 400); cx.lineTo(78, 400); cx.closePath(); cx.fill();
    bulat(180, 18, 7, '#ffe2a8');
    var nap = Math.sin(t / 1100) * 2, cyS = 322 + nap;
    cx.fillStyle = '#05030a';
    kotakBulat(90, 392, 180, 40, 12, '#05030a');
    if (g === 'cowok') { kotakBulat(152, cyS + 4, 56, 84, 22, '#05030a'); bulat(180, cyS - 8, 22, '#05030a'); }
    else { kotakBulat(154, cyS + 6, 52, 82, 24, '#05030a'); bulat(180, cyS - 8, 21, '#05030a'); cx.beginPath(); cx.moveTo(160, cyS - 14); cx.quadraticCurveTo(142, cyS + 32, 156, cyS + 58); cx.lineTo(166, cyS + 20); cx.closePath(); cx.fill(); }
    var dim = Math.min(0.3, u * 0.5); cx.fillStyle = 'rgba(8,4,16,' + dim.toFixed(2) + ')'; cx.fillRect(0, 0, W, H);
    var jm = s.menit % 1440, jj = ('0' + Math.floor(jm / 60)).slice(-2) + '.' + ('0' + Math.floor(jm % 60)).slice(-2);
    cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.lineWidth = 5; cx.strokeStyle = 'rgba(8,4,16,.8)'; cx.fillStyle = '#fff';
    cx.font = '800 20px "Baloo 2", "Nunito", system-ui, sans-serif';
    cx.strokeText('Me time', W / 2, 212); cx.fillText('Me time', W / 2, 212);
    cx.font = '800 15px "Nunito", system-ui, sans-serif'; cx.strokeText('Pukul ' + jj, W / 2, 238); cx.fillText('Pukul ' + jj, W / 2, 238);
    kotakBulat(70, 256, 220, 8, 4, 'rgba(255,255,255,.25)'); kotakBulat(70, 256, Math.max(8, 220 * u), 8, 4, '#b79cff');
  }
  function gambarAdeganHb(s, t) {
    var A = s.hbAnim || {}, u = Math.min(1, A.u || 0), v = A.varian || 'kamar', gA = s.gender || 'cewek', gB = A.gB || (gA === 'cowok' ? 'cewek' : 'cowok');
    var irama = Math.sin(t / 240), cy = Math.round(H * 0.52);
    if (v === 'metime') { gambarMeTime(s, t, u, gA); return; }

    /* P73.2: Kembalikan animasi HB di ranjang/hotel/sofa/mandi/balkon/ciuman asli dengan kepala Anime 2D baru! */
    var ayun = irama * 2.2, goyang = irama * 9;
    /* latar */
    var gr = cx.createLinearGradient(0, 0, 0, H);
    if (v === 'ciuman') { gr.addColorStop(0, '#5a1a38'); gr.addColorStop(1, '#a83b62'); }
    else if (v === 'foreplay') { gr.addColorStop(0, '#361024'); gr.addColorStop(1, '#752242'); }
    else if (v === 'hotel') { gr.addColorStop(0, '#2a1240'); gr.addColorStop(1, '#4a1e50'); }
    else if (v === 'sofa') { gr.addColorStop(0, '#18363c'); gr.addColorStop(1, '#26545a'); }
    else if (v === 'tv') { gr.addColorStop(0, '#0f1c2e'); gr.addColorStop(1, '#1d3354'); }
    else if (v === 'mandi') { gr.addColorStop(0, '#6b8fa0'); gr.addColorStop(1, '#a9c4cf'); }
    else if (v === 'pelukan') { gr.addColorStop(0, '#ff9a6a'); gr.addColorStop(1, '#6a3a6e'); }
    else if (v === 'balkon') { gr.addColorStop(0, '#0b1230'); gr.addColorStop(1, '#2a2f5a'); }
    else { gr.addColorStop(0, '#2b1a2a'); gr.addColorStop(1, '#4a2a38'); }
    cx.fillStyle = gr; cx.fillRect(0, 0, W, H);
    if (v === 'ciuman') {
      for (var bk = 0; bk < 12; bk++) {
        cx.globalAlpha = 0.14 + 0.14 * Math.abs(Math.sin(t / 700 + bk));
        bulat(30 + (bk * 67) % (W - 60), 70 + (bk * 53) % 240, 10 + (bk % 3) * 8, '#ffd1e3');
      }
      cx.globalAlpha = 1;
    }
    if (v === 'foreplay') {
      var lln = 0.24 + Math.sin(t / 180) * 0.05;
      [55, W - 55].forEach(function (lx) {
        var cg = cx.createRadialGradient(lx, 360, 4, lx, 360, 95);
        cg.addColorStop(0, 'rgba(255,195,120,' + lln.toFixed(2) + ')');
        cg.addColorStop(1, 'rgba(255,120,80,0)');
        cx.fillStyle = cg; cx.fillRect(lx - 95, 265, 190, 190);
      });
    }
    if (v === 'hotel') {
      /* tirai hotel & lampu neon hangat */
      kotak(0, 0, 32, H, 'rgba(90,26,70,.55)'); kotak(W - 32, 0, 32, H, 'rgba(90,26,70,.55)');
      cx.fillStyle = '#ff5c8a'; kotakBulat(120, 276, 120, 26, 8, '#ff5c8a'); cx.fillStyle = '#fff'; cx.font = '800 18px system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.globalAlpha = 0.75 + Math.sin(t / 260) * 0.25; cx.fillText('HOTEL', 180, 290); cx.globalAlpha = 1;
    }
    if (v === 'sofa') {
      /* ruang tamu: bingkai lukisan, tanaman hias & lampu meja */
      kotak(42, 266, 56, 42, '#4a3525'); kotak(46, 270, 48, 34, '#d9e8e4'); bulat(64, 286, 8, '#e07a5f');
      kotakBulat(286, 304, 28, 22, 4, '#8d5b3e'); bulat(300, 294, 15, '#3a8c5c'); bulat(292, 284, 11, '#4ca36d');
    }
    if (v === 'tv') {
      /* depan TV: layar TV lebar menyala dengan cahaya layar lembut & rak konsol */
      var flTv = 0.45 + Math.abs(Math.sin(t / 290)) * 0.35;
      kotakBulat(94, 262, 172, 82, 8, '#111827');
      kotak(100, 268, 160, 70, 'rgba(96,175,255,' + flTv.toFixed(2) + ')');
      kotak(166, 344, 28, 8, '#334155'); kotakBulat(82, 352, 196, 16, 4, '#5c4033');
    }
    if (v === 'balkon') { for (var st = 0; st < 26; st++) { cx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t / 700 + st)); bulat((st * 53) % W, 40 + (st * 29) % 200, 1.4, '#fff'); } cx.globalAlpha = 1; bulat(290, 90, 22, '#fff3c4'); }
    if (v === 'pelukan') { cx.fillStyle = 'rgba(40,20,50,.85)'; for (var gd = 0; gd < 9; gd++) cx.fillRect(gd * 42 - 10, 300 - ((gd * 37) % 90), 30, 200); }
    /* karakter & selimut: tiap lokasi punya properti & suasana berbeda (kasur kamar, kursi sofa ruang tamu, depan TV, hotel, kamar mandi, balkon) */
    var isRanjang = v === 'kamar' || v === 'hotel' || v === 'sofa' || v === 'tv' || v === 'foreplay';
    var isForeplayIntro = v === 'foreplay' || !!(A.isLong && u < 0.30);
    var g2 = Math.sin(t / 210 + 1.1) * 6;
    var rr = (v === 'pelukan' || v === 'ciuman') ? 30 : 27;
    var tpA = s.tampilan || tampilanDariNama(s.namaPemain || '', gA, false);
    var tpB = A.tpB || tampilanDariNama(A.nama || '', gB, false);
    var cowokDiAtas = gA === 'cowok' ? { tp: tpA, g: 'cowok' } : { tp: tpB, g: 'cowok' };
    var cewekDiBawah = gA === 'cewek' ? { tp: tpA, g: 'cewek' } : { tp: tpB, g: 'cewek' };
    if (v === 'ciuman') {
      gambarCiumanBibir(cy, t, cowokDiAtas, cewekDiBawah);
    } else if (isRanjang) {
      var ritme = Math.sin(t / 195);
      var naikTurun = ritme * 7.5;
      var pantulKasur = Math.max(0, -ritme) * 2.0;
      var yRanjang = (v === 'tv' ? cy + 88 : cy + 62) + (isForeplayIntro ? 0 : pantulKasur);
      /* properti alas berbeda sesuai lokasi */
      if (v === 'sofa') {
        kotakBulat(36, yRanjang - 42, 288, 66, 14, '#325a66');
        kotakBulat(28, yRanjang - 6, 26, 78, 10, '#274852');
        kotakBulat(306, yRanjang - 6, 26, 78, 10, '#274852');
        kotakBulat(54, yRanjang + 18, 252, 46, 10, '#3e6e7c');
        kotakBulat(58, yRanjang - 8 + pantulKasur * 0.4, 54, 24, 10, '#f2c14e');
      } else if (v === 'tv') {
        kotakBulat(26, yRanjang + 22, 308, 46, 16, '#3b2e4a');
        kotakBulat(54, yRanjang + 14, 252, 26, 10, '#54416b');
        kotakBulat(58, yRanjang - 6 + pantulKasur * 0.4, 56, 24, 10, '#cbd5e1');
      } else {
        kotakBulat(38, cy - 10, 22, 135, 8, v === 'hotel' ? '#4f224d' : '#5b3b2c');
        kotakBulat(46, yRanjang + 36, 276, 36, 10, v === 'hotel' ? '#3d1c3d' : '#4a3125');
        kotakBulat(54, yRanjang + 18, 262, 26, 8, '#f6f2eb');
        kotakBulat(56, yRanjang - 10 + (isForeplayIntro ? 0 : pantulKasur * 0.4), 62, 26, 11, '#ffffff');
      }
      var wrnSel = v === 'hotel' ? '#7a2a5e' : v === 'sofa' ? '#2c6a6a' : v === 'tv' ? '#3b4e8c' : v === 'foreplay' ? '#9e2a54' : '#b04a68';
      var wrnSelTua = v === 'hotel' ? '#5c1d46' : v === 'sofa' ? '#1f4f4f' : v === 'tv' ? '#29386b' : v === 'foreplay' ? '#751c3c' : '#8c3550';
      if (isForeplayIntro) {
        gambarAdeganForeplay(yRanjang, t, cowokDiAtas, cewekDiBawah, wrnSel, wrnSelTua);
      } else {
        /* Posisi tubuh proporsional: bahu & leher tersambung jelas ke kepala, seluruh tubuh tertutup selimut tebal */
        var klCwk = cewekDiBawah.tp.kulitHex || '#f5cb9f';
        var klCwo = cowokDiAtas.tp.kulitHex || '#f5cb9f';
        /* 1. Bahu & tubuh bagian atas cewek berbaring di bantal */
        cx.fillStyle = klCwk;
        cx.beginPath(); cx.ellipse(112, yRanjang + 8 + pantulKasur * 0.4, 24, 13, -0.1, 0, Math.PI * 2); cx.fill();
        /* 2. Kepala cewek bersandar natural di atas bantal */
        gambarKepalaPotret(86, yRanjang - 8 + pantulKasur * 0.5, 20, cewekDiBawah.g, cewekDiBawah.tp, { rot: -0.28 + ritme * 0.05, merem: true, tanpaLeher: false });
        if (A.nama2) {
          /* HB Bertiga: pasangan kedua bersandar nyaman di bantal sebelahnya di balik selimut */
          var tpC = A.tpC || tampilanDariNama(A.nama2, A.gC || cewekDiBawah.g, false);
          gambarKepalaPotret(112, yRanjang + 2 + pantulKasur * 0.5, 18.5, A.gC || cewekDiBawah.g, tpC, { rot: -0.18 - ritme * 0.04, merem: true, tanpaLeher: false });
        }
        /* 3. Bahu, punggung atas & lengan cowok di atas, tersambung mulus ke kepala & masuk ke dalam selimut */
        cx.fillStyle = klCwo;
        cx.beginPath(); cx.ellipse(158, yRanjang - 14 + naikTurun * 0.85, 28, 16, 0.28, 0, Math.PI * 2); cx.fill();
        cx.strokeStyle = klCwo; cx.lineWidth = 9; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(148, yRanjang - 18 + naikTurun * 0.8); cx.quadraticCurveTo(124, yRanjang - 6 + naikTurun * 0.4, 118, yRanjang + 10); cx.stroke();
        /* 4. Kepala cowok proporsional di atas bahunya, menunduk lembut mengikuti irama */
        gambarKepalaPotret(136 + ritme * 2.5, yRanjang - 36 + naikTurun * 0.75, 20.5, cowokDiAtas.g, cowokDiAtas.tp, { rot: 0.34 + ritme * 0.06, merem: true, tanpaLeher: false });
        /* 5. Selimut tebal menutupi penuh kedua tubuh dari dada/punggung hingga kaki dengan siluet tubuh jelas & lipatan 3D */
        cx.fillStyle = wrnSel;
        cx.beginPath();
        cx.moveTo(106, yRanjang + 16);
        cx.bezierCurveTo(126, yRanjang - 28 + naikTurun * 0.95, 194, yRanjang - 34 + naikTurun * 1.05, 244, yRanjang - 6 + naikTurun * 0.45);
        cx.quadraticCurveTo(286, yRanjang + 6, 314, yRanjang + 18);
        cx.lineTo(314, yRanjang + 68);
        cx.lineTo(66, yRanjang + 68);
        cx.lineTo(66, yRanjang + 22);
        cx.closePath();
        cx.fill();
        /* lipatan kerah atas selimut (cuff putih lembut) agar batas tubuh & selimut terlihat nyata */
        cx.strokeStyle = 'rgba(255,255,255,.32)'; cx.lineWidth = 5; cx.lineCap = 'round';
        cx.beginPath();
        cx.moveTo(108, yRanjang + 14);
        cx.quadraticCurveTo(144, yRanjang - 18 + naikTurun * 0.85, 188, yRanjang - 16 + naikTurun * 0.9);
        cx.stroke();
        /* lipatan bayangan tubuh di bawah selimut */
        cx.strokeStyle = wrnSelTua; cx.lineWidth = 2.6;
        cx.beginPath();
        cx.moveTo(116, yRanjang + 24 + naikTurun * 0.3);
        cx.quadraticCurveTo(192, yRanjang + 4 + naikTurun * 0.55, 286, yRanjang + 28);
        cx.stroke();
        cx.beginPath();
        cx.moveTo(140, yRanjang + 40 + naikTurun * 0.2);
        cx.quadraticCurveTo(212, yRanjang + 22 + naikTurun * 0.35, 302, yRanjang + 44);
        cx.stroke();
      }
    } else {
      var sepasang = (v === 'ciuman') ? [[150 + dekatC, cy - 6, 0.14 + Math.sin(t / 460) * 0.04], [210 - dekatC, cy - 4, -0.14 - Math.sin(t / 460) * 0.04]]
        : (v === 'foreplay') ? [[146 + irama * 3, cy - Math.abs(goyang) * 0.55, 0.12 + irama * 0.05], [214 - irama * 3, cy + 2 - Math.abs(g2) * 0.55, -0.12 - irama * 0.05]]
        : (v === 'pelukan') ? [[152, cy - 10 - Math.abs(goyang), -0.1 + irama * 0.05], [208, cy - Math.abs(g2), 0.1 - irama * 0.05]]
        : [[146 + irama * 3, cy - Math.abs(goyang), -0.08 + irama * 0.04], [214 + irama * 3, cy + 4 - Math.abs(g2), 0.1 - irama * 0.04]];
      kepalaV(sepasang[0][0], sepasang[0][1], rr, gA, sepasang[0][2], tpA);
      kepalaV(sepasang[1][0], sepasang[1][1], rr, gB, sepasang[1][2], tpB);
      if (v === 'mandi') { cx.fillStyle = 'rgba(235,245,250,.78)'; cx.fillRect(60, cy + 34, 240, 260); for (var dr = 0; dr < 14; dr++) { cx.fillStyle = 'rgba(255,255,255,.55)'; cx.fillRect(70 + dr * 17, (t / 8 + dr * 53) % 300 + 80, 2, 12); } }
      else if (v === 'pelukan' || v === 'ciuman') {
        var fgG = cx.createLinearGradient(0, cy + 36, 0, H);
        fgG.addColorStop(0, v === 'ciuman' ? 'rgba(90,26,56,0)' : 'rgba(40,20,50,.9)');
        fgG.addColorStop(0.35, v === 'ciuman' ? 'rgba(90,26,56,.88)' : 'rgba(40,20,50,.95)');
        fgG.addColorStop(1, v === 'ciuman' ? 'rgba(65,16,40,.98)' : 'rgba(40,20,50,.98)');
        cx.fillStyle = fgG; cx.fillRect(0, cy + 36, W, H - cy);
      } else { cx.fillStyle = v === 'foreplay' ? '#8c2348' : '#3a3f78'; kotakBulat(70, cy + 34 - Math.abs(goyang) * 0.6, 220, 230 + Math.abs(goyang) * 0.6, 30, cx.fillStyle); cx.fillStyle = 'rgba(255,255,255,.12)'; kotakBulat(80, cy + 42, 200, 14, 7, 'rgba(255,255,255,.12)'); }
    }
    /* uap / hati / ciuman / api hangat */
    cx.textAlign = 'center'; cx.textBaseline = 'alphabetic';
    for (var hg = 0; hg < 8; hg++) {
      var fg = (t / 24 + hg * 22) % 100; cx.globalAlpha = Math.max(0, 1 - fg / 100) * 0.9;
      cx.fillStyle = v === 'mandi' ? '#ffffff' : v === 'foreplay' ? (hg % 2 ? '#ff8a5c' : '#ff5c8a') : '#ff5c8a';
      cx.font = '800 ' + (v === 'mandi' ? 22 : 24) + 'px system-ui, sans-serif';
      var sym = v === 'mandi' ? '○' : v === 'ciuman' ? (hg % 2 ? '💋' : '♥') : v === 'foreplay' ? (hg % 2 ? '🔥' : '♥') : '♥';
      cx.fillText(sym, 70 + hg * 31 + Math.sin(t / 500 + hg) * 12, cy - 40 - fg * 1.5);
    }
    cx.globalAlpha = 1;
    var dim = Math.min(0.45, u * 0.7); cx.fillStyle = 'rgba(20,6,20,' + dim.toFixed(2) + ')'; cx.fillRect(0, 0, W, H);
    /* judul, jam, progres */
    var jm = s.menit % 1440, jj = ('0' + Math.floor(jm / 60)).slice(-2) + '.' + ('0' + Math.floor(jm % 60)).slice(-2);
    cx.textBaseline = 'middle'; cx.lineWidth = 5; cx.strokeStyle = 'rgba(30,12,28,.75)'; cx.fillStyle = '#fff';
    cx.font = '800 20px "Baloo 2", "Nunito", system-ui, sans-serif';
    var jd = (v === 'ciuman' ? 'Ciuman hangat' : isForeplayIntro ? 'Foreplay romantis' : A.nama2 ? 'Waktu hangat bertiga' : (HB_JUDUL[v] || 'Waktu berdua')) + (A.nama ? ' · ' + A.nama + (A.nama2 ? ' & ' + A.nama2 : '') : '');
    cx.strokeText(jd, W / 2, 212); cx.fillText(jd, W / 2, 212);
    cx.font = '800 15px "Nunito", system-ui, sans-serif'; cx.strokeText('Pukul ' + jj, W / 2, 238); cx.fillText('Pukul ' + jj, W / 2, 238);
    kotakBulat(70, 256, 220, 8, 4, 'rgba(255,255,255,.3)'); kotakBulat(70, 256, Math.max(8, 220 * u), 8, 4, '#ff5c8a');
  }
  function gambarPenghuniRumah(s, t, xKasur, yBantal, yBerdiri) {
    var kel = s.keluargaRumah || [];
    var pas = kel.filter(function (k) { return k.pasangan; })[0] || null;
    var anakList = kel.filter(function (k) { return !k.pasangan; });
    if (s.hbAnim) { gambarAdeganHb(s, t); return; }
    var tpP = s.tampilan || tampilanDariNama(s.namaPemain, s.gender || 'cewek', false);
    var bajuPemain = s.warnaBaju || (s.gender === 'cewek' ? '#b84b6e' : '#1b6b63');
    if (s.tidur) {
      /* P73.1: Berbaring tenang di atas kasur dengan kepala Anime 2D konsisten (tanpa foto statis P72) */
      gambarKepalaPotret(xKasur + 26, yBantal - 4, 11.5, s.gender || 'cewek', tpP, { merem: true, rot: -0.18, tanpaLeher: true, baju: bajuPemain });
      if (pas) {
        var tpPasT = tampilanDariNama(pas.nama, pas.gender, false);
        gambarKepalaPotret(xKasur + 28, yBantal + 15, 11, pas.gender, tpPasT, { merem: true, rot: -0.12, tanpaLeher: true, baju: pas.gender === 'cewek' ? '#d46a7e' : '#35608a' });
      }
      cx.fillStyle = '#fef3c7'; cx.font = '800 16px "Baloo 2", system-ui, sans-serif';
      cx.fillText('z', xKasur + 56, yBantal - 26 - (t / 40) % 14);
      cx.fillText('Z', xKasur + 72, yBantal - 42 - (t / 50) % 16);
      return;
    }
    /* Berdiri tenang & natural di lantai kamar (tanpa meluncur ke samping seperti patung!) */
    var xPemain = pas ? 222 : 186;
    gambarKarakterRumah(xPemain, yBerdiri, s.gender || 'cewek', t, {
      diRumah: true, namaAsli: s.namaPemain || 'Kamu', baju: bajuPemain, tampilan: tpP, hamil: !!s.hamilPemain, label: s.namaPemain || 'Kamu'
    });
    if (pas) {
      var tpPas = tampilanDariNama(pas.nama, pas.gender, false);
      gambarKarakterRumah(136, yBerdiri + 4, pas.gender, t + 400, {
        diRumah: true, namaAsli: pas.nama, baju: pas.gender === 'cewek' ? '#d46a7e' : '#2d5a88', tampilan: tpPas, hamil: !!pas.hamil, label: pas.nama
      });
    }
    var posAn = [[284, 8], [82, 8], [312, 14], [54, 14]];
    anakList.slice(0, 4).forEach(function (an, i) {
      var sk = an.usia < 2 ? 0.45 : an.usia < 5 ? 0.56 : an.usia < 10 ? 0.68 : an.usia < 15 ? 0.82 : 0.94;
      var tpAn = tampilanDariNama(an.nama, an.gender, an.usia < 12);
      gambarKarakterRumah(posAn[i][0], yBerdiri + posAn[i][1], an.gender, t + 700 * (i + 1), {
        diRumah: true, skala: sk, namaAsli: an.nama, tampilan: tpAn, baju: an.gender === 'cewek' ? '#e88a3e' : '#3d8f52', label: an.nama + ' (' + an.usia + 't)'
      });
    });
  }

  /* ---------- pencahayaan realistis & hujan sungguhan ---------- */
  function pencahayaanRuangan(m, tidur, t) {
    var jam = (m % 1440) / 60, gp = gelap(m);
    if (tidur) {
      cx.fillStyle = 'rgba(8,14,38,.58)'; cx.fillRect(0, 0, W, H);
      var ml = cx.createRadialGradient(W * 0.25, H * 0.2, 10, W * 0.25, H * 0.2, 220);
      ml.addColorStop(0, 'rgba(130,170,255,.12)'); ml.addColorStop(1, 'rgba(0,0,0,0)');
      cx.fillStyle = ml; cx.fillRect(0, 0, W, H);
      return;
    }
    if (jam >= 5.5 && jam < 9) {
      var kP = 1 - Math.abs(jam - 7.2) / 1.8;
      var sg = cx.createLinearGradient(0, 0, W, H * 0.7);
      sg.addColorStop(0, 'rgba(255,220,150,' + (0.16 * Math.max(0, kP)).toFixed(3) + ')');
      sg.addColorStop(1, 'rgba(255,220,150,0)');
      cx.fillStyle = sg; cx.fillRect(0, 0, W, H);
    } else if (jam >= 16 && jam < 18.8) {
      var kS = 1 - Math.abs(jam - 17.4) / 1.5;
      cx.fillStyle = 'rgba(255,135,55,' + (0.14 * Math.max(0, kS)).toFixed(3) + ')';
      cx.fillRect(0, 0, W, H);
    } else if (gp > 0.25) {
      cx.fillStyle = 'rgba(10,16,38,' + (gp * 0.36).toFixed(3) + ')'; cx.fillRect(0, 0, W, H);
      var flk = 0.22 + Math.sin(t / 1200) * 0.015;
      var lg = cx.createRadialGradient(W * 0.5, 52, 8, W * 0.5, 190, 320);
      lg.addColorStop(0, 'rgba(255,232,175,' + (flk * gp).toFixed(3) + ')');
      lg.addColorStop(0.55, 'rgba(255,205,130,' + (flk * 0.45 * gp).toFixed(3) + ')');
      lg.addColorStop(1, 'rgba(0,0,0,0)');
      cx.fillStyle = lg; cx.fillRect(0, 0, W, H);
    }
  }
  function pencahayaanLuar(m, t, yJalan, hx, hy, biled) {
    var jam = (m % 1440) / 60, gp = gelap(m);
    if (jam >= 4.5 && jam < 6.2) {
      var kD = 1 - Math.abs(jam - 5.3) / 1.0;
      cx.fillStyle = 'rgba(70,95,165,' + (0.18 * Math.max(0, kD)).toFixed(3) + ')'; cx.fillRect(0, 0, W, H);
    } else if (jam >= 6.2 && jam < 9) {
      var kP = 1 - Math.abs(jam - 7.5) / 1.5;
      var sg = cx.createRadialGradient(W * 0.85, 60, 10, W * 0.85, 60, 320);
      sg.addColorStop(0, 'rgba(255,220,145,' + (0.22 * Math.max(0, kP)).toFixed(3) + ')');
      sg.addColorStop(1, 'rgba(255,220,145,0)');
      cx.fillStyle = sg; cx.fillRect(0, 0, W, H);
    } else if (jam >= 16 && jam < 18.8) {
      var kS = 1 - Math.abs(jam - 17.5) / 1.5;
      var sn = cx.createLinearGradient(0, 0, 0, H);
      sn.addColorStop(0, 'rgba(255,115,40,' + (0.20 * Math.max(0, kS)).toFixed(3) + ')');
      sn.addColorStop(0.6, 'rgba(255,165,85,' + (0.10 * Math.max(0, kS)).toFixed(3) + ')');
      sn.addColorStop(1, 'rgba(40,25,60,' + (0.14 * Math.max(0, kS)).toFixed(3) + ')');
      cx.fillStyle = sn; cx.fillRect(0, 0, W, H);
    }
    if (gp > 0.35 && hx != null && hy != null) {
      cx.save();
      var jangkau = biled ? 235 : 190;
      var bm = cx.createLinearGradient(hx, hy, hx + jangkau, hy + 28);
      if (biled) {
        bm.addColorStop(0, 'rgba(225,245,255,' + (0.72 * gp).toFixed(3) + ')');
        bm.addColorStop(0.5, 'rgba(185,228,255,' + (0.34 * gp).toFixed(3) + ')');
        bm.addColorStop(1, 'rgba(165,215,255,0)');
      } else {
        bm.addColorStop(0, 'rgba(255,248,205,' + (0.58 * gp).toFixed(3) + ')');
        bm.addColorStop(0.45, 'rgba(255,236,168,' + (0.26 * gp).toFixed(3) + ')');
        bm.addColorStop(1, 'rgba(255,230,150,0)');
      }
      cx.fillStyle = bm;
      cx.beginPath();
      cx.moveTo(hx, hy - 5);
      cx.lineTo(hx + jangkau, hy - 38);
      cx.lineTo(hx + jangkau, hy + 52);
      cx.lineTo(hx, hy + 8);
      cx.closePath();
      cx.fill();
      var gl = cx.createRadialGradient(hx, hy, 1, hx, hy, biled ? 26 : 22);
      gl.addColorStop(0, biled ? ('rgba(235,250,255,' + (0.92 * gp).toFixed(3) + ')') : ('rgba(255,255,235,' + (0.85 * gp).toFixed(3) + ')'));
      gl.addColorStop(1, 'rgba(255,240,180,0)');
      cx.fillStyle = gl; cx.beginPath(); cx.arc(hx, hy, biled ? 26 : 22, 0, Math.PI * 2); cx.fill();
      cx.restore();
    }
    if (gp > 0.4 && yJalan != null) {
      for (var lp = 0; lp < 2; lp++) {
        var lx = lp === 0 ? W * 0.22 : W * 0.78, ly = yJalan - 110;
        var sl = cx.createRadialGradient(lx, ly, 2, lx, ly, 85);
        sl.addColorStop(0, 'rgba(255,215,135,' + (0.22 * gp).toFixed(3) + ')');
        sl.addColorStop(1, 'rgba(255,215,135,0)');
        cx.fillStyle = sl; cx.beginPath(); cx.arc(lx, ly, 85, 0, Math.PI * 2); cx.fill();
      }
    }
  }
  function gambarHujanRealistis(s, t, yJalan, offY) {
    var cw = s && s.cuacaInfo;
    var lvlHujan = cw ? (cw.hujan || 0) : (s.hujan || 0);
    var petirOn = cw ? !!cw.petir : (lvlHujan > 1);
    var angin = cw ? (cw.angin || 0.25) : 0.25;
    var banjirCm = cw ? (cw.banjirCm || 0) : (lvlHujan > 1 ? 40 : 0);
    if (!lvlHujan && !petirOn && banjirCm <= 0) return;
    var deras = lvlHujan >= 2, ribut = lvlHujan >= 3, oy = offY || 0, yJ = yJalan != null ? yJalan : H * 0.62;
    /* mendung & kabut hujan */
    if (lvlHujan > 0 || petirOn) {
      cx.fillStyle = 'rgba(16,26,42,' + (ribut ? 0.36 : deras ? 0.28 : 0.16) + ')';
      cx.fillRect(0, oy - 20, W, H + 40);
      var kabut = cx.createLinearGradient(0, yJ - 60, 0, yJ + 50);
      kabut.addColorStop(0, 'rgba(195,215,235,0)');
      kabut.addColorStop(0.5, 'rgba(195,215,235,' + (deras ? 0.16 : 0.08) + ')');
      kabut.addColorStop(1, 'rgba(195,215,235,0)');
      cx.fillStyle = kabut; cx.fillRect(0, yJ - 60, W, 110);
    }
    /* kilau aspal basah */
    if (lvlHujan > 0) {
      var basah = cx.createLinearGradient(0, yJ, 0, H);
      basah.addColorStop(0, 'rgba(140,185,230,' + (deras ? 0.20 : 0.11) + ')');
      basah.addColorStop(0.5, 'rgba(30,45,70,' + (deras ? 0.20 : 0.08) + ')');
      basah.addColorStop(1, 'rgba(160,200,240,' + (deras ? 0.14 : 0.06) + ')');
      cx.fillStyle = basah; cx.fillRect(0, yJ, W, H - yJ + 40);
    }
    /* Genangan banjir realistis hingga 60 cm (menutupi bagian bawah ban kendaraan + riak arus cokelat keruh!) */
    if (banjirCm >= 20) {
      var tinggiAir = Math.min(26, Math.round(banjirCm * 0.42)); /* 60 cm = ~25 px setinggi setengah ban! */
      var yAir = yJ + 16;
      var grBnj = cx.createLinearGradient(0, yAir, 0, H);
      grBnj.addColorStop(0, 'rgba(116,92,62,' + (banjirCm >= 50 ? 0.62 : 0.42) + ')');
      grBnj.addColorStop(0.4, 'rgba(84,66,44,' + (banjirCm >= 50 ? 0.72 : 0.50) + ')');
      grBnj.addColorStop(1, 'rgba(62,48,32,.78)');
      cx.fillStyle = grBnj; cx.fillRect(0, yAir, W, H - yAir + 40);
      /* garis gelombang & riak air banjir */
      cx.strokeStyle = 'rgba(225,212,185,.38)'; cx.lineWidth = 1.4;
      for (var bi = 0; bi < 8; bi++) {
        var bx = ((t * 0.045 + bi * 58) % (W + 60)) - 30;
        var by = yAir + 6 + (bi % 4) * (tinggiAir * 0.85 + 10);
        cx.beginPath(); cx.moveTo(bx, by); cx.quadraticCurveTo(bx + 14, by - 3, bx + 28, by); cx.stroke();
      }
    }
    /* riak & cipratan air di jalan basah */
    if (lvlHujan > 0) {
      cx.strokeStyle = 'rgba(215,235,255,' + (deras ? 0.48 : 0.30) + ')'; cx.lineWidth = 1;
      var nRiak = ribut ? 26 : deras ? 20 : 10;
      for (var ri = 0; ri < nRiak; ri++) {
        var rx = acak(ri + 710) * W, ry = yJ + 8 + acak(ri + 810) * Math.max(30, H - yJ - 20);
        var fase = ((t / 40 + ri * 7.3) % 12) / 12, rr = 2 + fase * 11;
        cx.globalAlpha = (1 - fase) * (deras ? 0.68 : 0.42);
        cx.beginPath(); cx.ellipse(rx, ry, rr, rr * 0.32, 0, 0, Math.PI * 2); cx.stroke();
      }
      cx.globalAlpha = 1;
      /* 3 lapis hujan (miring deras mengikuti kecepatan angin ribut!) */
      var slK = 1 + angin * 2.2;
      var lapis = [
        { n: ribut ? 95 : deras ? 72 : 34, lw: 0.7, len: ribut ? 14 : 10, spd: ribut ? 0.48 : 0.34, sl: 2.5 * slK, col: 'rgba(200,220,245,.26)' },
        { n: ribut ? 110 : deras ? 82 : 40, lw: 1.15, len: ribut ? 22 : 16, spd: ribut ? 0.72 : 0.52, sl: 4.5 * slK, col: 'rgba(218,236,252,.48)' },
        { n: ribut ? 62 : deras ? 44 : 18, lw: 1.65, len: ribut ? 30 : 24, spd: ribut ? 0.96 : 0.78, sl: 7.0 * slK, col: 'rgba(238,248,255,.70)' }
      ];
      for (var li = 0; li < lapis.length; li++) {
        var L = lapis[li];
        cx.strokeStyle = L.col; cx.lineWidth = L.lw; cx.beginPath();
        for (var hi = 0; hi < L.n; hi++) {
          var sd = hi + li * 200;
          var hx = (acak(sd + 500) * (W + 100) - 20 - (t * L.spd * (0.2 + angin * 0.4)) % (W + 100) + W + 100) % (W + 100) - 20;
          var hy = (acak(sd + 600) * (H + 90) + t * L.spd) % (H + 90) - 40 + oy;
          cx.moveTo(hx, hy); cx.lineTo(hx - L.sl, hy + L.len);
        }
        cx.stroke();
      }
    }
    /* Sambaran petir zig-zag realistis & kilatan langit */
    if (petirOn) {
      var siklusPetir = t % (ribut ? 4600 : 6800);
      if (siklusPetir < 150 || (siklusPetir > 210 && siklusPetir < 290)) {
        cx.fillStyle = 'rgba(225,242,255,.32)'; cx.fillRect(0, oy - 20, W, H + 40);
        var px0 = 70 + ((Math.floor(t / 4600) * 97) % 220);
        cx.strokeStyle = '#f0f9ff'; cx.lineWidth = 2.6; cx.lineCap = 'round';
        cx.beginPath();
        cx.moveTo(px0, 20); cx.lineTo(px0 - 14, 72); cx.lineTo(px0 + 8, 118); cx.lineTo(px0 - 18, 178); cx.lineTo(px0 + 4, 232);
        cx.stroke();
      }
    }
  }
  /* ---------- interior hunian realistis (9 variasi Kos/Kontrakan/Apartemen + 3 tipe Rumah Milik Sendiri, skala arsitektur 0.85 px/cm) ---------- */
  var TEMA_HUNIAN = {
    kos_hemat: { dinding: '#ebe1cc', plint: '#b8a082', lantai: '#c8a684', ubin: 'kotak', jendela: 'teralis', kasur: 'busa', lampu: 'bohlam', gorden: '#b85c4a', sprei: '#5a8fb8' },
    kos_ac: { dinding: '#dce8ee', plint: '#b6c5ce', lantai: '#e3e7ea', ubin: 'kotak', jendela: 'atap', kasur: 'kayu', lampu: 'plafon', gorden: '#3b7a9e', sprei: '#3d8b84', ac: true },
    kos_eksklusif: { dinding: '#e9dfd2', plint: '#8c6b48', lantai: '#dfd8cc', ubin: 'granit', panelKayu: true, jendela: 'kacaLebar', kasur: 'springbed', lampu: 'gantung', gorden: '#7a5c44', sprei: '#8e5572', ac: true },
    kontrakan_petak: { dinding: '#d7e8d4', plint: '#9eb49a', lantai: '#cfb699', ubin: 'kotak', jendela: 'nako', kasur: 'kayu', lampu: 'bohlam', gorden: '#d4843e', sprei: '#5f9a64' },
    kontrakan_1kt: { dinding: '#efe7d6', plint: '#a5845c', lantai: '#dfd4c1', ubin: 'kotakBesar', listDinding: true, jendela: 'pohon', kasur: 'springbed', lampu: 'plafon', gorden: '#5a8a7a', sprei: '#b86456' },
    kontrakan_2kt: { dinding: '#f2eee6', plint: '#8b6c4c', lantai: '#e6dfd4', ubin: 'granit', listDinding: true, lukisan: true, jendela: 'taman', kasur: 'springbed', lampu: 'gantung', gorden: '#4b6b88', sprei: '#3d6b82', ac: true },
    apt_rusunami: { dinding: '#e2e6ea', plint: '#9aa4ae', lantai: '#cfd5dc', ubin: 'vinyl', jendela: 'gedung', kasur: 'kayu', lampu: 'plafon', gorden: '#526478', sprei: '#4c7a9c', ac: true },
    apt_studio: { dinding: '#e5dfd8', plint: '#75563b', lantai: '#bfa07a', ubin: 'parket', panelKayu: true, jendela: 'skyline', kasur: 'springbed', lampu: 'gantung', gorden: '#4a5568', sprei: '#2e5c6e', ac: true },
    apt_2br: { dinding: '#f4efe7', plint: '#63462d', lantai: '#eae4da', ubin: 'marmer', panelMewah: true, lukisan: true, jendela: 'panorama', kasur: 'king', lampu: 'chandelier', gorden: '#6b4e71', sprei: '#7a3b58', ac: true },
    rumah_subsidi: { dinding: '#dfe8dc', plint: '#aebaa9', lantai: '#dad2c4', ubin: 'kotakBesar', jendela: 'pohon', kasur: 'kayu', lampu: 'plafon', gorden: '#5a8a7a', sprei: '#7a9e6a' },
    rumah_komersial: { dinding: '#efe7d8', plint: '#9c7d58', lantai: '#e3dcd0', ubin: 'granit', listDinding: true, lukisan: true, jendela: 'taman', kasur: 'springbed', lampu: 'gantung', gorden: '#8a624a', sprei: '#b85c52' },
    rumah_mewah: { dinding: '#f6f1ea', plint: '#b89b67', lantai: '#ece6dc', ubin: 'marmer', panelMewah: true, lukisan: true, jendela: 'panorama', kasur: 'king', lampu: 'chandelier', gorden: '#7a5a8a', sprei: '#8e3b56' }
  };
  function gambarPemandanganJendela(jenis, x, y, w, h, m) {
    var l = langit(m), gp = gelap(m);
    var gr = cx.createLinearGradient(0, y, 0, y + h);
    gr.addColorStop(0, l[0]); gr.addColorStop(1, l[1]);
    cx.save();
    cx.beginPath(); cx.rect(x, y, w, h); cx.clip();
    cx.fillStyle = gr; cx.fillRect(x, y, w, h);
    if (gp > 0.35) {
      for (var st = 0; st < 8; st++) bulat(x + 8 + ((st * 29) % (w - 14)), y + 8 + ((st * 17) % Math.max(18, h * 0.45)), 1.1, 'rgba(255,255,235,.8)');
    }
    if (jenis === 'skyline' || jenis === 'panorama' || jenis === 'gedung') {
      /* cakrawala gedung bertingkat khas apartemen kota */
      var nG = jenis === 'panorama' ? 7 : 5, bw = Math.ceil(w / nG) + 4;
      for (var i = 0; i < nG; i++) {
        var gh = (0.34 + ((i * 37 + 13) % 42) / 100) * h;
        var gx = x + i * (w / nG) - 2, gy = y + h - gh;
        kotak(gx, gy, bw - 3, gh, gp > 0.35 ? ['#1f2937', '#273449', '#1b2432'][i % 3] : ['#7f95a8', '#90a4b5', '#6c8296'][i % 3]);
        for (var wy = gy + 6; wy < y + h - 6; wy += 9) {
          for (var wx = gx + 4; wx < gx + bw - 8; wx += 7) {
            if ((wx + wy + i) % 3 !== 0) {
              cx.fillStyle = gp > 0.3 ? 'rgba(255,222,135,.85)' : 'rgba(220,240,255,.55)';
              cx.fillRect(wx, wy, 3.5, 4.5);
            }
          }
        }
      }
      if (jenis === 'skyline' || jenis === 'panorama') {
        /* pagar kaca balkon apartemen */
        kotak(x, y + h - 18, w, 18, 'rgba(180,215,235,.24)');
        kotak(x, y + h - 19, w, 2, '#5c6b77');
      }
    } else if (jenis === 'pohon' || jenis === 'taman' || jenis === 'nako') {
      /* suasana kontrakan / rumah tapak: pagar, pepohonan hijau & tanaman pot */
      kotak(x, y + h - 22, w, 22, gp > 0.4 ? '#2d4a35' : '#6ca86a');
      bulat(x + w * 0.25, y + h - 24, 18, gp > 0.4 ? '#1f4229' : '#3f8a48');
      bulat(x + w * 0.72, y + h - 28, 22, gp > 0.4 ? '#264f32' : '#4c9a54');
      if (jenis === 'taman') {
        kotak(x, y + h - 10, w, 3, '#d8d2c5');
        bulat(x + w * 0.5, y + h - 15, 5, '#e85d75');
      }
    } else {
      /* atap genteng tetangga khas kos-kosan dalam gang */
      cx.fillStyle = gp > 0.4 ? '#4a352c' : '#b56345';
      cx.beginPath(); cx.moveTo(x - 6, y + h); cx.lineTo(x + w * 0.35, y + h - 26); cx.lineTo(x + w * 0.75, y + h - 26); cx.lineTo(x + w + 6, y + h); cx.closePath(); cx.fill();
      kotak(x + w * 0.1, y + h - 10, w * 0.8, 10, gp > 0.4 ? '#3c424a' : '#d6cfc2');
    }
    cx.restore();
  }
  function gambarInteriorHunian(s, t) {
    var m = s.menit % 1440, b = s.barang || {};
    var kunciTema = s.rumah ? ('rumah_' + s.rumah) : (s.hunianId || 'kos_ac');
    var T = TEMA_HUNIAN[kunciTema] || TEMA_HUNIAN.kos_ac;
    /* P73: Interior 2D hangat menyatu dengan karakter anime 120 FPS (foto statis P72 dinonaktifkan) */
    /* garis pertemuan dinding & lantai: menyisakan ruang bersih di atas dock bawah */
    var lantai = Math.max(308, Math.min(372, Math.round(H * 0.56)));
    var yBerdiri = lantai + 56;

    /* 1. Dinding & aksen arsitektur tiap tipe rumah/kos/kontrakan/apartemen */
    kotak(0, 0, W, lantai, T.dinding);
    if (T.panelKayu) {
      kotak(0, 0, 68, lantai, '#c9a87c');
      cx.fillStyle = 'rgba(85,55,28,.22)';
      for (var px = 6; px < 68; px += 8) cx.fillRect(px, 0, 3, lantai);
    } else if (T.panelMewah) {
      cx.strokeStyle = 'rgba(184,155,103,.38)'; cx.lineWidth = 1.5;
      cx.strokeRect(14, lantai - 186, 94, 156);
      cx.strokeRect(252, lantai - 186, 94, 156);
      kotak(0, lantai - 198, W, 4, 'rgba(184,155,103,.45)');
    } else if (T.listDinding) {
      kotak(0, lantai - 68, W, 68, 'rgba(0,0,0,.035)');
      kotak(0, lantai - 70, W, 3, T.plint);
    } else {
      cx.fillStyle = 'rgba(0,0,0,.025)';
      for (var wx = 0; wx < W; wx += 36) cx.fillRect(wx, 0, 1.5, lantai);
    }
    /* P71: Ambient Occlusion dinding + lantai bertekstur & kilau cahaya jendela HD agar rumah tidak datar seperti kertas */
    var aoAtas = cx.createLinearGradient(0, 0, 0, 56);
    aoAtas.addColorStop(0, 'rgba(15,23,42,0.22)'); aoAtas.addColorStop(1, 'rgba(15,23,42,0)');
    cx.fillStyle = aoAtas; cx.fillRect(0, 0, W, 56);
    var aoBawah = cx.createLinearGradient(0, lantai - 28, 0, lantai);
    aoBawah.addColorStop(0, 'rgba(15,23,42,0)'); aoBawah.addColorStop(1, 'rgba(15,23,42,0.16)');
    cx.fillStyle = aoBawah; cx.fillRect(0, lantai - 28, W, 28);
    kotak(0, lantai - 7, W, 7, T.plint);

    /* 2. Lantai sesuai material (keramik, granit, parket kayu, vinyl, marmer) + gradien kedalaman 3D */
    var grLnt = cx.createLinearGradient(0, lantai, 0, H);
    grLnt.addColorStop(0, T.lantai); grLnt.addColorStop(1, geserHex(T.lantai, -28));
    cx.fillStyle = grLnt; cx.fillRect(0, lantai, W, H - lantai);
    if (T.ubin === 'parket') {
      cx.strokeStyle = 'rgba(75,45,20,.18)'; cx.lineWidth = 1;
      for (var py = lantai + 12; py < H; py += 14) { cx.beginPath(); cx.moveTo(0, py); cx.lineTo(W, py); cx.stroke(); }
      for (var pxx = 0; pxx < W; pxx += 44) { cx.beginPath(); cx.moveTo(pxx, lantai); cx.lineTo(pxx - 18, H); cx.stroke(); }
    } else if (T.ubin === 'marmer' || T.ubin === 'granit') {
      cx.strokeStyle = 'rgba(255,255,255,.35)'; cx.lineWidth = 1;
      for (var gy = lantai + 28; gy < H; gy += 32) { cx.beginPath(); cx.moveTo(0, gy); cx.lineTo(W, gy); cx.stroke(); }
      for (var gx2 = 20; gx2 < W + 40; gx2 += 64) { cx.beginPath(); cx.moveTo(gx2, lantai); cx.lineTo(gx2 - 26, H); cx.stroke(); }
    } else {
      var stepU = T.ubin === 'kotakBesar' ? 34 : 24;
      cx.strokeStyle = 'rgba(0,0,0,.075)'; cx.lineWidth = 1;
      for (var uy = lantai + stepU; uy < H; uy += stepU) { cx.beginPath(); cx.moveTo(0, uy); cx.lineTo(W, uy); cx.stroke(); }
      for (var ux = 0; ux < W + 30; ux += stepU * 1.6) { cx.beginPath(); cx.moveTo(ux, lantai); cx.lineTo(ux - 24, H); cx.stroke(); }
    }
    /* Kilau pantulan cahaya jendela & volumetric light shaft pada lantai rumah */
    var gpR = gelap(m);
    if (gpR < 0.65) {
      var grSunR = cx.createLinearGradient(90, lantai - 120, 175, lantai + 120);
      grSunR.addColorStop(0, 'rgba(255,244,205,' + (0.20 * (1 - gpR)).toFixed(3) + ')');
      grSunR.addColorStop(1, 'rgba(255,244,205,0)');
      cx.fillStyle = grSunR;
      cx.beginPath(); cx.moveTo(86, lantai - 70); cx.lineTo(190, lantai - 70); cx.lineTo(245, lantai + 125); cx.lineTo(105, lantai + 125); cx.closePath(); cx.fill();
    } else {
      /* Halo hangat lampu plafon malam hari */
      var grLpR = cx.createRadialGradient(180, 42, 4, 180, 42, 165);
      grLpR.addColorStop(0, 'rgba(255,232,165,0.28)'); grLpR.addColorStop(1, 'rgba(255,232,165,0)');
      cx.fillStyle = grLpR; cx.fillRect(0, 0, W, lantai + 90);
    }

    /* 3. Jendela & Pemandangan Luar (85 cm s/d 205 cm di dinding) */
    var isPano = T.jendela === 'skyline' || T.jendela === 'panorama';
    var jx = isPano ? 82 : 84, jy = isPano ? (lantai - 178) : (lantai - 166);
    var jw = isPano ? 142 : 104, jh = isPano ? 148 : 96;
    kotak(jx - 4, jy - 4, jw + 8, jh + 8, isPano ? '#374151' : '#7c5e3c');
    gambarPemandanganJendela(T.jendela, jx, jy, jw, jh, m);
    if (T.jendela === 'teralis') {
      cx.strokeStyle = '#4b5563'; cx.lineWidth = 1.4;
      for (var ty = jy + 16; ty < jy + jh; ty += 16) { cx.beginPath(); cx.moveTo(jx, ty); cx.lineTo(jx + jw, ty); cx.stroke(); }
      kotak(jx + jw / 2 - 1.5, jy, 3, jh, '#7c5e3c');
    } else if (T.jendela === 'nako') {
      cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = 1.2;
      for (var ny = jy + 12; ny < jy + jh; ny += 12) { cx.beginPath(); cx.moveTo(jx, ny); cx.lineTo(jx + jw, ny); cx.stroke(); }
      kotak(jx + jw / 2 - 2, jy, 4, jh, '#7c5e3c');
    } else {
      kotak(jx + jw / 2 - 1.5, jy, 3, jh, isPano ? '#374151' : '#7c5e3c');
    }
    /* batang gorden & gorden samping */
    kotak(jx - 10, jy - 9, jw + 20, 5, '#4a3728');
    kotakBulat(jx - 8, jy - 5, 16, jh + 10, 4, T.gorden);
    kotakBulat(jx + jw - 8, jy - 5, 16, jh + 10, 4, T.gorden);

    /* 4. Pintu kamar proporsional (tinggi 200 cm = 168 px, lebar 64 px) */
    var px0 = 288, pw = 60, ph = 166;
    kotak(px0 - 3, lantai - ph - 3, pw + 6, ph + 3, '#5c432c');
    kotak(px0, lantai - ph, pw, ph, T.panelMewah ? '#5a3e28' : isPano ? '#d5dbe0' : '#96724c');
    cx.strokeStyle = 'rgba(0,0,0,.14)'; cx.lineWidth = 1.2;
    cx.strokeRect(px0 + 8, lantai - ph + 12, pw - 16, 62);
    cx.strokeRect(px0 + 8, lantai - ph + 86, pw - 16, 64);
    bulat(px0 + 10, lantai - 82, 3, '#e2c574');

    /* 5. Lampu plafon & hiasan dinding */
    if (T.lampu === 'chandelier') {
      kotak(178, 0, 4, 24, '#b89b67'); kotakBulat(154, 22, 52, 6, 3, '#b89b67');
      bulat(160, 31, 5, '#fff6d6'); bulat(180, 33, 6, '#fff6d6'); bulat(200, 31, 5, '#fff6d6');
    } else if (T.lampu === 'gantung') {
      kotak(179, 0, 2, 28, '#374151');
      cx.fillStyle = '#d99b43'; cx.beginPath(); cx.arc(180, 34, 13, Math.PI, 0); cx.closePath(); cx.fill();
      bulat(180, 35, 4.5, '#fff8dc');
    } else if (T.lampu === 'bohlam') {
      kotak(179, 0, 2, 20, '#333'); bulat(180, 24, 5, '#fff5cc');
    } else {
      kotakBulat(158, 8, 44, 8, 4, '#f8fafc');
    }
    if (T.lukisan) {
      kotak(26, lantai - 148, 42, 52, '#5c432c'); kotak(30, lantai - 144, 34, 44, '#f6f2e9');
      bulat(42, lantai - 128, 6, '#e07a5f'); bulat(52, lantai - 118, 8, '#3d5a80');
    }

    /* 6. Perabot belakang (AC, Kulkas, TV, Kompor/Dapur, Dispenser, Mesin Cuci) dengan skala nyata */
    if (T.ac || b.ac) {
      kotakBulat(200, lantai - 168, 76, 22, 5, '#f8fafc');
      kotak(206, lantai - 151, 64, 2.5, '#cbd5e1');
      bulat(266, lantai - 160, 2, s.acNyala ? '#22c55e' : '#ef4444');
    }
    if (b.kulkas2) {
      /* Kulkas 2 pintu ~170 cm = 142 px */
      kotakBulat(236, lantai - 126, 46, 136, 4, '#cfd6dd');
      kotak(259, lantai - 122, 1.8, 128, '#94a3b8');
      kotak(254, lantai - 72, 2.5, 20, '#64748b'); kotak(263, lantai - 72, 2.5, 20, '#64748b');
    } else if (b.kulkas) {
      /* Kulkas 1 pintu ~120 cm = 100 px */
      kotakBulat(240, lantai - 88, 42, 98, 4, '#e2e8f0');
      kotak(244, lantai - 54, 34, 1.5, '#cbd5e1'); kotak(274, lantai - 74, 2.5, 14, '#64748b');
    }
    if (b.tv || b.tv55) {
      var tw = b.tv55 ? 82 : 62, th = b.tv55 ? 48 : 36, tx = 192 - tw / 2;
      kotakBulat(152, lantai - 36, 80, 44, 3, '#7c5838'); /* rak TV tinggi ~52 cm */
      kotak(188, lantai - 42, 8, 6, '#1e293b');
      kotakBulat(tx, lantai - 42 - th, tw, th, 3, '#111827');
      var nyalaTv = !s.tidur && (m >= 1080 || m < 120);
      kotak(tx + 3, lantai - 39 - th, tw - 6, th - 6, nyalaTv ? ['#3b82f6', '#22c55e', '#f59e0b'][Math.floor(t / 1200) % 3] : '#1f2937');
    }
    if (b.dispenser) {
      kotakBulat(124, lantai - 54, 22, 62, 3, '#f1f5f9');
      kotakBulat(126, lantai - 78, 18, 24, 5, 'rgba(96,165,250,.65)');
    }
    if (b.kompor || b.ricecooker || kunciTema === 'apt_studio') {
      kotak(282, lantai + 8, 68, 44, '#8b6543'); kotak(280, lantai + 4, 72, 5, '#e5e7eb');
      if (b.kompor) { kotak(288, lantai - 2, 34, 6, '#64748b'); bulat(296, lantai - 3, 4, '#1e293b'); bulat(312, lantai - 3, 4, '#1e293b'); }
      if (b.ricecooker) { kotakBulat(328, lantai - 8, 16, 12, 4, '#f8fafc'); }
    }
    if (b.karpet) {
      kotakBulat(126, lantai + 38, 146, 36, 10, 'rgba(184,92,74,.78)');
    }

    /* 7. Kasur Proporsional Realistis (Tinggi kasur 45–52 cm = 38–44 px; Sandaran 85–95 cm = 72–82 px!)
          Sehingga karakter berdiri (136–142 px) JAUH LEBIH TINGGI dari kasur & sandarannya! */
    var jenisKasur = b.springbed ? (T.kasur === 'king' ? 'king' : 'springbed') : T.kasur;
    var yDasarKasur = lantai + 52;
    var xKasur = 12, wKasur = jenisKasur === 'king' ? 132 : 122;
    var yBantal = yDasarKasur - 38;
    if (jenisKasur === 'busa') {
      /* kasur busa lipat di lantai kos hemat (tebal 18 cm = 16 px) */
      kotakBulat(xKasur, yDasarKasur - 16, 116, 18, 5, '#e2e8f0');
      kotakBulat(xKasur + 4, yDasarKasur - 23, 30, 10, 4, '#ffffff');
      kotakBulat(xKasur + 36, yDasarKasur - 17, 76, 14, 4, T.sprei);
      yBantal = yDasarKasur - 20;
    } else if (jenisKasur === 'kayu') {
      /* ranjang kayu single: sandaran 70 px, tinggi kasur 36 px */
      kotakBulat(xKasur, yDasarKasur - 70, 10, 70, 3, '#6b4a2e');
      kotak(xKasur + 6, yDasarKasur - 22, wKasur - 6, 14, '#7c5838');
      kotak(xKasur + wKasur - 8, yDasarKasur - 22, 7, 22, '#6b4a2e');
      kotakBulat(xKasur + 8, yDasarKasur - 36, wKasur - 10, 16, 5, '#f8fafc');
      kotakBulat(xKasur + 12, yDasarKasur - 43, 32, 11, 5, '#ffffff');
      kotakBulat(xKasur + 46, yDasarKasur - 37, wKasur - 50, 16, 5, T.sprei);
      yBantal = yDasarKasur - 40;
    } else {
      /* springbed / king koil: sandaran empuk 80 px, tinggi kasur 44 px */
      kotakBulat(xKasur, yDasarKasur - 80, 13, 80, 4, jenisKasur === 'king' ? '#4a3525' : '#6b4c35');
      kotakBulat(xKasur + 8, yDasarKasur - 26, wKasur - 8, 24, 4, '#523a28');
      kotakBulat(xKasur + 8, yDasarKasur - 44, wKasur - 8, 20, 6, '#f8fafc');
      kotakBulat(xKasur + 13, yDasarKasur - 52, 34, 12, 5, '#ffffff');
      kotakBulat(xKasur + 48, yDasarKasur - 45, wKasur - 52, 20, 5, T.sprei);
      yBantal = yDasarKasur - 48;
    }

    /* kipas angin berdiri proporsional (~110 cm = 92 px) */
    if (b.kipas || kunciTema === 'kos_hemat' || kunciTema === 'kontrakan_petak') {
      var fx = 148, fy = lantai + 34;
      kotakBulat(fx - 9, fy - 3, 18, 4, 2, '#475569');
      kotak(fx - 1.5, fy - 62, 3, 60, '#64748b');
      bulat(fx, fy - 68, 14, 'rgba(226,232,240,.85)');
      cx.save(); cx.translate(fx, fy - 68); if (!s.padam) cx.rotate(t / 65);
      kotak(-2, -11, 4, 22, '#64748b'); kotak(-11, -2, 22, 4, '#64748b');
      cx.restore();
    }
    if (b.sofa) {
      kotakBulat(246, lantai + 32, 98, 30, 8, '#4b6b88');
      kotakBulat(250, lantai + 20, 90, 18, 6, '#5c7f9e');
    }

    /* 8. Gambar penghuni rumah berdiri tegak proporsional di depan perabot */
    gambarPenghuniRumah(s, t, xKasur, yBantal, yBerdiri);
    pencahayaanRuangan(m, s.tidur, t);
  }
  function gambarRumah(s, t) { gambarInteriorHunian(s, t); }
  function gambarKos(s, t) { gambarInteriorHunian(s, t); }

  /* ---------- motor sendiri (bentuk vektor asli per jenis), ngojek, mobil, pindahan ---------- */
  var SPORT = { gsxr150: '#1e64b8', cbr150: '#d9443a', r15: '#1d4ed8', r15m: '#1e3a8a', mt25: '#3b3f46', cb150r: '#c62828', cbr250: '#d9443a', cbr250sp: '#b91c1c', ninja250: '#3da337', r25: '#1d4ed8', zx25r: '#3da337', zx25rr: '#2e8b2a', zx4rr: '#3da337', zx6r: '#3da337', zx10r: '#2e8b2a', cbr1000: '#c62828', h2: '#23272e', r6: '#1d4ed8', r1m: '#1e293b', s1000rr: '#1565c0', panigalev4: '#cc1d1d', harleysport: '#26292e' };
  var RETRO = { scoopy: 1, vespa: 1, vespasprint: 1, vespagts: 1, vespa946: 1, fazzio: 1, filano: 1, stylo160: 1 }, MAXI = { nmax: 1, nmaxturbo: 1, pcx160: 1, pcxroadsync: 1, adv160: 1, xmax250: 1, forza250: 1, aerox: 1, aeroxalpha: 1, lexi155: 1, alvacervo: 1 }, AYAGO = { satriafu: 1, mxking: 1 }, TRAIL = { klx150: 1, crf150l: 1, wr155r: 1 };
  /* motor menghadap kanan; dasar = permukaan jalan (100% vektor sesuai merk & model asli) */
  function gambarMotorKu(x, y, id, o, t) {
    o = o || {};
    var bid = String(id || 'beat').replace(/-bekas$/, '');
    var sport = !!SPORT[bid], retro = !!RETRO[bid], maxi = !!MAXI[bid], ayago = !!AYAGO[bid], trail = !!TRAIL[bid], klasik = bid === 'rxking' || bid === 'w175', cruiser = bid === 'harleysport', vario = bid === 'vario160' || bid === 'vario';
    var w = SPORT[bid] || WARNA_MOTOR[bid] || '#d9443a', putar = o.jalan ? t / 60 : 0;
    cx.save(); cx.translate(x, y); if (o.kiri) cx.scale(-1, 1);
    cx.fillStyle = 'rgba(0,0,0,.26)'; cx.beginPath(); cx.ellipse(0, 1, 31, 4.2, 0, 0, Math.PI * 2); cx.fill();
    var rBan = trail ? 10 : vario ? 9.6 : 9;
    [-20, 20].forEach(function (rx) {
      bulat(rx, -rBan, rBan, '#191b1e');
      bulat(rx, -rBan, rBan - 3.8, (cruiser || bid === 'vario160') ? '#c9a654' : '#9aa3a6');
      cx.strokeStyle = '#3d434a'; cx.lineWidth = 1.25; cx.beginPath();
      for (var j = 0; j < 5; j++) { var a = putar + j * Math.PI * 2 / 5; cx.moveTo(rx, -rBan); cx.lineTo(rx + Math.cos(a) * (rBan - 4), -rBan + Math.sin(a) * (rBan - 4)); }
      cx.stroke();
      bulat(rx, -rBan, 2.2, '#cfd6dc');
    });
    cx.strokeStyle = '#4a525a'; cx.lineWidth = 3.2; cx.beginPath(); cx.moveTo(-25, -9); cx.lineTo(-8, -7); cx.stroke();
    if (vario) {
      /* Honda Vario 160 / 125: desain tajam sporty-agresif, tameng V-shape + DRL LED ganda, dek rata, buntut runcing & knalpot sporty */
      /* knalpot sporty + pelindung perak */
      cx.strokeStyle = '#22262b'; cx.lineWidth = 4.2; cx.beginPath(); cx.moveTo(-24, -12); cx.lineTo(-9, -7); cx.stroke();
      cx.strokeStyle = '#cbd5e1'; cx.lineWidth = 1.6; cx.beginPath(); cx.moveTo(-22, -11.5); cx.lineTo(-12, -8.5); cx.stroke();
      /* rangka bawah & dek rata hitam doff */
      kotakBulat(-16, -13, 30, 5, 2, '#1c2026');
      /* bodi samping belakang meruncing agresif khas Vario 160 */
      cx.fillStyle = w;
      cx.beginPath();
      cx.moveTo(-27, -23); cx.lineTo(-4, -21); cx.lineTo(2, -12); cx.lineTo(12, -12);
      cx.lineTo(15, -28); cx.lineTo(25, -26); cx.lineTo(23, -15); cx.lineTo(17, -10);
      cx.lineTo(-18, -11); cx.closePath(); cx.fill();
      /* aksen sayap / garis bodi sporty */
      cx.strokeStyle = bid === 'vario160' ? '#d4a843' : '#f8fafc'; cx.lineWidth = 1.4;
      cx.beginPath(); cx.moveTo(-22, -19); cx.lineTo(-5, -18); cx.moveTo(14, -23); cx.lineTo(23, -21); cx.stroke();
      /* jok 2-tingkat ergonomis Vario 160 */
      cx.fillStyle = '#181a1e';
      cx.beginPath(); cx.moveTo(-23, -23); cx.lineTo(-10, -25.5); cx.lineTo(0, -24.5); cx.lineTo(-1, -20.5); cx.lineTo(-22, -21); cx.closePath(); cx.fill();
      /* batok setang & visor sporty */
      kotakBulat(11, -34, 8, 6.5, 2.5, w);
      cx.fillStyle = '#111827'; cx.beginPath(); cx.moveTo(15, -34); cx.lineTo(20, -32); cx.lineTo(18, -37.5); cx.lineTo(13, -36); cx.closePath(); cx.fill();
      /* fork teleskopik depan + spakbor runcing */
      cx.strokeStyle = '#2d333b'; cx.lineWidth = 2.4; cx.beginPath(); cx.moveTo(20, -10); cx.lineTo(15, -27); cx.stroke();
      cx.fillStyle = w; cx.beginPath(); cx.moveTo(15, -17); cx.lineTo(27, -15); cx.lineTo(23, -13); cx.lineTo(16, -14); cx.closePath(); cx.fill();
      /* lampu depan DRL LED putih tajam + lampu utama LED bawah & lampu rem merah tajam */
      cx.strokeStyle = '#e0f4ff'; cx.lineWidth = 1.8; cx.beginPath(); cx.moveTo(21, -26); cx.lineTo(25.5, -24); cx.stroke();
      kotakBulat(22, -23, 3.8, 4.5, 1.2, '#fff6c4');
      kotak(-28, -22, 3, 4.5, '#ef4444');
    } else if (trail) {
      /* Trail (KLX 150 / CRF150L / WR 155 R): spakbor depan tinggi, suspensi panjang, jok lurus tinggi */
      cx.fillStyle = w; cx.beginPath(); cx.moveTo(-26, -28); cx.lineTo(-6, -26); cx.lineTo(8, -32); cx.lineTo(24, -27); cx.lineTo(14, -18); cx.lineTo(-10, -18); cx.closePath(); cx.fill();
      kotakBulat(-22, -30, 22, 4.5, 2, '#1f2226');
      cx.strokeStyle = '#d4a843'; cx.lineWidth = 2.6; cx.beginPath(); cx.moveTo(20, -10); cx.lineTo(13, -34); cx.stroke();
      cx.fillStyle = w; cx.beginPath(); cx.moveTo(14, -28); cx.lineTo(29, -27); cx.lineTo(24, -24); cx.lineTo(14, -24); cx.closePath(); cx.fill(); /* spakbor trail */
      kotak(16, -34, 4, 5, '#fff4b8');
    } else if (cruiser) {
      /* Harley-Davidson Sportster S: stang rendah, tangki kekar, knalpot ganda */
      kotak(-16, -16, 30, 7, '#3a3f47');
      kotakBulat(-22, -22, 16, 5, 2.5, '#191b1e');
      kotakBulat(-4, -29, 18, 9, 4, w);
      kotak(-2, -26, 14, 2, '#d4a843');
      bulat(19, -26, 4.2, '#ffe89c');
      cx.strokeStyle = '#64748b'; cx.lineWidth = 2.8; cx.beginPath(); cx.moveTo(20, -9); cx.lineTo(12, -29); cx.stroke();
    } else if (sport) {
      cx.fillStyle = w; cx.beginPath(); cx.moveTo(-25, -23); cx.lineTo(-5, -22); cx.lineTo(10, -28); cx.lineTo(25, -22); cx.lineTo(19, -10); cx.lineTo(-8, -10); cx.closePath(); cx.fill();
      /* aksen livery merk (Kawasaki hijau-putih, Honda merah-putih, Yamaha biru-hitam, BMW M) */
      if (/^(zx|ninja)/.test(bid)) { kotak(-4, -20, 18, 2.5, '#f8fafc'); }
      else if (bid === 's1000rr') { kotak(-4, -20, 16, 2.2, '#e11d48'); kotak(-4, -17.5, 16, 2.2, '#f8fafc'); }
      else if (/^(cbr|panigale)/.test(bid)) { kotak(-4, -19, 16, 2.2, '#1f2937'); }
      kotakBulat(-23, -24, 15, 4.5, 2, '#1f2226');
      kotakBulat(-2, -29, 14, 7.5, 3, w);
      cx.fillStyle = 'rgba(165,215,245,.78)'; cx.beginPath(); cx.moveTo(16, -27); cx.lineTo(24, -22); cx.lineTo(20, -34); cx.closePath(); cx.fill();
      cx.strokeStyle = '#b9933a'; cx.lineWidth = 2.4; cx.beginPath(); cx.moveTo(20, -9); cx.lineTo(15, -25); cx.stroke();
    } else if (klasik) {
      /* RX-King / Kawasaki W175: tangki klasik, mesin sirip, jok lurus, lampu bulat */
      kotak(-16, -15, 30, 5, '#8c949b');
      kotakBulat(-22, -23, 20, 6, 2.5, '#2b2420');
      kotakBulat(-2, -28, 16, 10, 3, w);
      bulat(18, -26, 4.5, '#ffe89c');
      cx.strokeStyle = '#b8bfc4'; cx.lineWidth = 2.2; cx.beginPath(); cx.moveTo(20, -9); cx.lineTo(14, -29); cx.stroke();
    } else if (retro) {
      /* Scoopy / Vespa / Fazzio / Filano / Stylo: bodi belakang membulat, tameng melengkung, lampu bulat */
      cx.fillStyle = w; cx.beginPath(); cx.ellipse(-10, -17, 15, 9, 0, 0, Math.PI * 2); cx.fill();
      kotakBulat(-21, -26, 18, 6, 3, '#6b4226');
      kotakBulat(8, -29, 11, 20, 5, w);
      bulat(20, -25, 4.2, '#fff2b8');
      cx.strokeStyle = '#8d969b'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(20, -9); cx.lineTo(14, -29); cx.stroke();
    } else if (maxi) {
      /* NMAX / PCX / ADV / XMAX / Forza / Aerox / Alva Cervo: bodi besar gagah + windshield tinggi */
      cx.fillStyle = w; cx.beginPath(); cx.moveTo(-26, -21); cx.lineTo(-2, -20); cx.lineTo(7, -14); cx.lineTo(16, -28); cx.lineTo(25, -24); cx.lineTo(20, -10); cx.lineTo(-21, -10); cx.closePath(); cx.fill();
      kotakBulat(-23, -25, 23, 6, 3, '#222');
      cx.fillStyle = 'rgba(180,220,245,.72)'; cx.beginPath(); cx.moveTo(16, -27); cx.lineTo(23, -25); cx.lineTo(20, -37); cx.lineTo(15, -35); cx.closePath(); cx.fill();
      cx.strokeStyle = '#4a525a'; cx.lineWidth = 2.2; cx.beginPath(); cx.moveTo(20, -9); cx.lineTo(16, -26); cx.stroke();
    } else if (ayago) {
      /* Satria FU / MX King: ayam jago ramping, shock depan panjang tegak, buntut runcing */
      cx.fillStyle = w; cx.beginPath(); cx.moveTo(-24, -22); cx.lineTo(12, -20); cx.lineTo(16, -13); cx.lineTo(-10, -13); cx.closePath(); cx.fill();
      kotakBulat(-22, -25, 22, 5, 2, '#1d1f23');
      cx.strokeStyle = '#9aa3a6'; cx.lineWidth = 2.4; cx.beginPath(); cx.moveTo(20, -9); cx.lineTo(12, -31); cx.stroke();
      kotakBulat(12, -31, 8, 6, 2, w);
      kotak(19, -29, 3, 3.5, '#fff4b8');
    } else {
      /* Skutik harian & bebek (BeAT, Vario 125/160, Supra, Revo, Mio, Gear, EM1 e:) */
      cx.fillStyle = w; cx.beginPath(); cx.moveTo(-23, -21); cx.lineTo(-3, -20); cx.lineTo(3, -12); cx.lineTo(12, -12); cx.lineTo(15, -29); cx.lineTo(23, -25); cx.lineTo(19, -10); cx.lineTo(-19, -10); cx.closePath(); cx.fill();
      kotakBulat(-21, -24, 19, 5.5, 2.5, '#222');
      kotak(13, -32, 4, 6, '#333');
      cx.strokeStyle = '#555'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(20, -9); cx.lineTo(15, -27); cx.stroke();
      kotak(21, -24, 3, 4, '#fff4b8');
    }
    if (o.muatan === 'paket') { kotak(-30, -44, 20, 16, '#c8a06a'); kotak(-30, -38, 20, 2, '#a5844f'); }
    if (o.muatan === 'makanan') { kotakBulat(-34, -50, 24, 24, 3, '#1f9a3f'); kotak(-32, -42, 20, 3, '#f3f1ea'); }
    if (o.bawaDus) {
      /* Tumpukan dus bawaan & tas baju terikat tali di jok belakang saat pindahan kota/daerah */
      kotakBulat(-36, -42, 24, 18, 2, '#c89b60');
      kotak(-36, -35, 24, 2.5, '#f0d8a8');
      kotakBulat(-33, -58, 20, 16, 2, '#b8884e');
      kotak(-33, -51, 20, 2, '#ebd19c');
      kotakBulat(-31, -67, 16, 9, 4, '#2b6cb0'); /* tas baju / ransel di atas dus */
      cx.strokeStyle = '#1f2937'; cx.lineWidth = 1.6;
      cx.beginPath(); cx.moveTo(-25, -24); cx.lineTo(-24, -67); cx.moveTo(-16, -24); cx.lineTo(-19, -58); cx.stroke();
    }
    if (o.bonceng) orangMotor(-15, '#5f7f9a', '#f6f6f2', false, false, false, null, null, 'bonceng');
    var gayaNaik = sport ? 'sport' : maxi ? 'maxi' : trail ? 'trail' : (klasik || cruiser || ayago) ? 'klasik' : 'skutik';
    if (o.naik) orangMotor(sport ? 0 : -4, o.baju || '#1f9a3f', '#1f9a3f', true, o.hp, sport && !o.hp, o.tampilan, o.gender, gayaNaik);
    cx.restore();
  }
  function orangMotor(x, baju, helm, sopir, hp, nunduk, tp, gender, gaya) {
    var yb = nunduk ? -48 : (gaya === 'trail' ? -56 : -52);
    /* posisi kaki realistis menyesuaikan tipe motor: dek rata skutik/Vario 160, selonjor maxi, jepit tangki sport */
    cx.strokeStyle = '#2d3a46'; cx.lineWidth = 5.5; cx.lineCap = 'round'; cx.lineJoin = 'round';
    cx.beginPath();
    if (gaya === 'sport') {
      cx.moveTo(x - 2, -25); cx.lineTo(x + 7, -21); cx.lineTo(x - 1, -12);
    } else if (gaya === 'maxi') {
      cx.moveTo(x - 2, -25); cx.lineTo(x + 10, -21); cx.lineTo(x + 15, -13);
    } else if (gaya === 'bonceng') {
      cx.moveTo(x, -26); cx.lineTo(x + 6, -19); cx.lineTo(x + 4, -11);
    } else {
      /* skutik dek rata (Vario 160, BeAT, Scoopy, Vespa): paha maju, lutut menekuk rapi, kaki menapak di dek rata */
      cx.moveTo(x - 2, -25); cx.lineTo(x + 9, -23); cx.lineTo(x + 10, -13);
    }
    cx.stroke();
    /* sepatu menapak di pijakan / dek */
    var xSep = gaya === 'sport' ? x - 2 : gaya === 'maxi' ? x + 14 : gaya === 'bonceng' ? x + 3 : x + 9;
    kotakBulat(xSep, -14, 7, 3.8, 1.8, '#191b1e');
    cx.save(); cx.translate(x, yb); if (nunduk) cx.rotate(0.35);
    kotakBulat(-8, 0, 16, 26, 6, baju);
    if (sopir) kotak(-8, 10, 16, 3, '#f3f1ea');
    if (sopir && hp && tp) {
      /* saat standby menunggu order di atas motor: helm open-face & wajah/rambut karakter terlihat jelas */
      gambarKepalaPotret(1, -9, 9.5, gender || 'cewek', tp, { tanpaLeher: true });
      cx.fillStyle = helm; cx.beginPath(); cx.arc(1, -11, 10.2, Math.PI * 1.05, Math.PI * 1.98); cx.closePath(); cx.fill();
      kotak(5, -13, 6, 2.5, 'rgba(30,40,50,.65)');
    } else {
      bulat(2, -8, 10, helm); kotak(4, -10, 9, 5, 'rgba(30,40,50,.75)');
    }
    cx.restore();
    /* lengan memegang setang / pegang HP saat standby */
    if (sopir && !hp) {
      cx.strokeStyle = baju; cx.lineWidth = 4.2; cx.lineCap = 'round';
      cx.beginPath(); cx.moveTo(x + 4, yb + 9); cx.lineTo(x + 17, nunduk ? -30 : -32); cx.stroke();
    }
    if (hp) { kotak(x + 7, yb + 5, 5, 9, '#222'); kotak(x + 8, yb + 6, 3, 6, '#7fd3e8'); }
  }
  var WARNA_MOBIL = {
    granmax: '#e8e4da', carry: '#e8e4da', hilux: '#d6d8da', l300: '#2d5a8e', traga: '#e8e4da', triton: '#3a4048',
    calya: '#b8bcc0', sigra: '#c9ced4', ayla: '#e5a93c', agya: '#d9443a', brio: '#f0b92b', airev: '#7ec8e3', binguoev: '#c8ded9', cloudev: '#d4dbe2',
    xenia: '#cfd4d8', avanza: '#e8e4da', avanzahev27: '#dbe2ea', ertiga: '#7b8794', terios: '#d9d6cf', rush: '#2b2f36', xl7: '#59636e', veloz: '#8a2a2a', xpander: '#cfd4da', stargazer: '#bfc6cc',
    raize: '#d9443a', brv: '#d6dade', yariscross: '#1f7a8c', atto3: '#3a7ca5', hiace: '#eef0f2',
    bydm6: '#4a5568', creta: '#c8cfd6', hrv: '#8d99ae', hrvhev26: '#94a3b8', innova: '#cfd4da', zenix: '#d8d4cc', zenix27: '#e2e6ec', jimny: '#9db372', hiluxdc: '#2b2f36',
    fortuner: '#252a32', fortuner28: '#1e242c', pajerosport: '#2c3138', civicrs: '#c62828', bydseal: '#3a6b8c', crv: '#3d4550', ioniq5: '#cfd6dc', sealion7: '#1d4e89', camry: '#3a3f46', gr86: '#d9443a',
    staria: '#2e343d', palisade: '#262b33', model3: '#c92a2a', bmw330i: '#1d4e89',
    alphard: '#f3f1ea', vellfire: '#22262b', lexuslm: '#2d3138', landcruiser: '#2b2f36', porsche911: '#d93829', mercg63: '#1e2227'
  };
  function gambarMobil(x, y, bentuk, id, kiri, roda, gp, bawaDus) {
    var bid = String(id || '').replace(/-bekas$/, '');
    var w = WARNA_MOBIL[bid] || '#e2e8f0';
    var gerak = !!(roda && Math.abs(roda) > 0.001);
    var pt = gerak ? roda : 0;
    var lampu = (gp || 0) > 0.2 && gerak;
    cx.save(); cx.translate(x, y); if (kiri) cx.scale(-1, 1);
    gambarMobilRealistis(bentuk, w, pt, lampu, bid);
    if (bawaDus) {
      /* Rack atap mobil berisi dus kardus & koper baju saat pindah kota/daerah */
      kotak(-34, -47, 56, 3, '#334155');
      kotakBulat(-32, -62, 24, 15, 2, '#c89b60'); kotak(-32, -55, 24, 2, '#f0d8a8');
      kotakBulat(-6, -66, 22, 19, 2, '#b8884e'); kotak(-6, -57, 22, 2, '#ebd19c');
      kotakBulat(-26, -71, 20, 9, 4, '#2b6cb0');
      cx.strokeStyle = '#1e293b'; cx.lineWidth = 1.4;
      cx.beginPath(); cx.moveTo(-22, -47); cx.lineTo(-16, -71); cx.moveTo(8, -47); cx.lineTo(4, -66); cx.stroke();
    }
    cx.restore();
  }
  /* Preview SVG HD Mobil (12 profil siluet autentik) untuk Dealer Mobil, Agen Bekas, & Garasi */
  function svgMobil(id, bentuk, warnaKustom) {
    var bid = String(id || '').replace(/-bekas$/, '');
    var prof = profilMobilDari(bid, bentuk);
    var w = warnaKustom || WARNA_MOBIL[bid] || '#cbd5e1';
    var wHi = geserHex(w, 42), wLo = geserHex(w, -46);
    var uid = 'cm_' + bid + '_' + prof;
    var body = '', glass = '', extra = '', rxA = 34, rxB = 106, rW = 11.5;
    if (prof === 'micro') {
      body = 'M36,56 L35,38 L40,22 L82,22 L98,38 L105,42 L105,56 Z';
      glass = 'M43,37 L46,25 L80,25 L93,37 Z'; rxA = 48; rxB = 92; rW = 9;
    } else if (prof === 'hatch') {
      body = 'M22,56 L21,42 L31,23 L80,23 L98,38 L118,43 L119,56 Z';
      glass = 'M30,38 L36,26 L78,26 L93,38 Z'; rxA = 39; rxB = 101;
    } else if (prof === 'sport') {
      body = 'M13,57 L12,46 L26,38 L52,29 L80,30 L102,42 L126,48 L128,57 Z';
      glass = 'M34,40 L54,32 L78,32.5 L96,41 Z';
      extra = '<rect x="11" y="34" width="13" height="3" fill="#0f172a"/><rect x="15" y="37" width="3" height="5" fill="#0f172a"/>';
    } else if (prof === 'sedan') {
      body = 'M13,56 L12,43 L32,39 L48,26 L82,26 L100,39 L126,44 L128,56 Z';
      glass = 'M37,39 L50,28.5 L80,28.5 L95,39 Z';
    } else if (prof === 'boxy4x4') {
      body = 'M16,53 L15,14 L86,14 L94,33 L125,35 L127,53 Z';
      glass = 'M21,33 L21,18 L83,18 L90,33 Z';
      extra = '<rect x="7" y="25" width="9" height="20" rx="3" fill="#111827"/>'; rW = 12.8;
    } else if (prof === 'luxvan') {
      body = 'M11,56 L10,11 L98,11 L118,34 L130,38 L131,56 Z';
      glass = 'M17,34 L17,15 L95,15 L114,34 Z';
      extra = '<rect x="126" y="38" width="5" height="16" fill="#e2c87d"/><rect x="12" y="35" width="114" height="2" fill="#e2c87d"/>';
    } else if (prof === 'staria') {
      body = 'M11,56 L10,13 L86,13 L124,35 L131,44 L131,56 Z';
      glass = 'M17,34 L17,17 L84,17 L114,34 Z';
      extra = '<rect x="119" y="38" width="11" height="2.5" fill="#e0f2fe"/>';
    } else if (prof === 'vancom') {
      body = 'M10,56 L9,12 L108,12 L125,36 L130,40 L130,56 Z';
      glass = 'M17,34 L17,16 L104,16 L120,34 Z';
    } else if (prof === 'bigsuv') {
      body = 'M11,53 L10,33 L21,14 L84,14 L100,32 L129,36 L131,53 Z';
      glass = 'M22,34 L28,18 L82,18 L97,34 Z';
      extra = '<rect x="28" y="11" width="52" height="2.5" fill="#334155"/>'; rW = 12.8;
    } else if (prof === 'csuv') {
      body = 'M15,54 L14,37 L26,18 L82,18 L99,35 L125,40 L126,54 Z';
      glass = 'M24,35 L30,22 L80,22 L95,35 Z';
      extra = '<rect x="30" y="15" width="48" height="2.2" fill="#334155"/>';
    } else if (prof === 'innova') {
      body = 'M13,56 L12,37 L22,17 L84,17 L103,35 L127,41 L129,56 Z';
      glass = 'M22,35 L28,21 L82,21 L98,35 Z';
    } else if (prof === 'pikap') {
      body = 'M12,56 L12,38 L84,38 L84,18 L114,18 L124,38 L127,56 Z';
      glass = 'M89,38 L89,22 L112,22 L120,38 Z';
    } else if (prof === 'pikapdc') {
      body = 'M10,53 L10,35 L66,35 L70,15 L98,15 L112,34 L130,38 L131,53 Z';
      glass = 'M74,33 L76,19 L96,19 L107,33 Z'; rW = 12.6;
    } else {
      body = 'M15,56 L14,39 L24,20 L86,20 L104,37 L125,42 L126,56 Z';
      glass = 'M23,36 L29,24 L83,24 L98,36 Z';
    }
    return '<svg viewBox="0 0 140 72" width="100%" height="58" style="display:block;margin:2px auto 4px">' +
      '<defs><linearGradient id="' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + wHi + '"/><stop offset="45%" stop-color="' + w + '"/><stop offset="100%" stop-color="' + wLo + '"/></linearGradient></defs>' +
      '<ellipse cx="70" cy="63" rx="56" ry="5" fill="rgba(0,0,0,0.22)"/>' +
      '<path d="' + body + '" fill="url(#' + uid + ')" stroke="rgba(15,23,42,0.35)" stroke-width="1"/>' +
      '<path d="' + glass + '" fill="#1e293b"/>' +
      '<path d="M52,24 L60,24 L54,36 L46,36 Z" fill="rgba(255,255,255,0.24)"/>' + extra +
      '<circle cx="' + rxA + '" cy="54" r="' + rW + '" fill="#0f172a"/><circle cx="' + rxA + '" cy="54" r="' + (rW * 0.58).toFixed(1) + '" fill="#cbd5e1"/><circle cx="' + rxA + '" cy="54" r="2.2" fill="#f8fafc"/>' +
      '<circle cx="' + rxB + '" cy="54" r="' + rW + '" fill="#0f172a"/><circle cx="' + rxB + '" cy="54" r="' + (rW * 0.58).toFixed(1) + '" fill="#cbd5e1"/><circle cx="' + rxB + '" cy="54" r="2.2" fill="#f8fafc"/>' +
      '</svg>';
  }
  /* adegan jalan raya saat mengantar order ojol */
  function gambarLatarAwal(s, t) {
    var m = s.menit % 1440, jalan = H * 0.62, dasarRuko = jalan - 60, lebar = W + 44, geser = (t * 0.02) % lebar, gp = gelap(m);
    gambarLangit(m, t, s);
    cx.save(); cx.translate(-geser, 0); gambarRuko(m, dasarRuko); cx.translate(lebar, 0); gambarRuko(m, dasarRuko); cx.restore();
    kotak(0, dasarRuko, W, jalan - dasarRuko, 'rgba(185,178,166,.55)');
    kotak(0, jalan, W, H - jalan, 'rgba(68,72,78,.8)');
    var g3 = (t * 0.1) % 70; cx.fillStyle = '#e9e4d4'; for (var x1 = -70; x1 < W + 70; x1 += 70) cx.fillRect(x1 - g3, jalan + 64, 34, 3);
    if (gp > 0) { cx.fillStyle = 'rgba(10,18,45,' + (gp * 0.35).toFixed(3) + ')'; cx.fillRect(0, 0, W, H); }
  }
  /* latar wilayah realistis: KOTA (ruko/gedung), KABUPATEN (pertokoan rendah & tugu/pepohonan), DESA (sawah, rumah kampung kayu & pohon kelapa/pisang) */
  function gambarLatarWilayah(tier, m, dasar) {
    var gp = gelap(m);
    if (tier === 'desa') {
      /* perbukitan hijau & sawah berundak khas desa Indonesia */
      bukitLatar(dasar - 28, 72, gp > 0.4 ? '#2b4735' : '#6ea870', 18, 95, 2);
      kotak(0, dasar - 28, W + 60, 30, gp > 0.4 ? '#2a4a2a' : '#7cb342');
      cx.fillStyle = gp > 0.4 ? 'rgba(180,220,140,.08)' : 'rgba(255,245,157,.28)';
      for (var sw = 0; sw < W + 60; sw += 22) cx.fillRect(sw, dasar - 26, 2, 26);
      /* rumah kampung kayu beratap seng/genteng & pohon kelapa */
      for (var d = 0; d < 4; d++) {
        var rx = 18 + d * 96, rh = 38 + (d % 2) * 8;
        kotak(rx, dasar - rh, 56, rh, d % 2 ? '#b88b5a' : '#d7ccc8');
        poli([rx - 7, dasar - rh, rx + 28, dasar - rh - 24, rx + 63, dasar - rh], d % 2 ? '#8d4e32' : '#546e7a');
        kotak(rx + 20, dasar - 24, 14, 24, '#5d4037');
        kotak(rx + 6, dasar - 26, 10, 10, gp > 0.3 ? '#ffe082' : '#455a64');
        pohonSawit(rx + 74, dasar, 0.85);
      }
      return;
    }
    if (tier === 'kabupaten') {
      /* kota kabupaten: ruko 1-2 lantai, pohon peneduh pinggir jalan & tugu kabupaten */
      bukitLatar(dasar - 12, 42, gp > 0.4 ? '#2d3f4d' : '#8aa8a0', 0, 120, 4);
      for (var kb = 0; kb < 5; kb++) {
        var kx = 6 + kb * 78, kh = 54 + (kb % 2) * 28;
        kotak(kx, dasar - kh, 62, kh, ['#e0d5c1', '#d6dfe6', '#e6d8cc', '#d4e2d4', '#dfd7cb'][kb]);
        poli([kx - 4, dasar - kh, kx + 31, dasar - kh - 14, kx + 66, dasar - kh], '#8d4e3a');
        kotak(kx + 8, dasar - 34, 46, 34, '#7d8a92');
        kotak(kx + 8, dasar - 46, 46, 10, ['#1f8a80', '#d97706', '#2563eb', '#059669', '#b91c1c'][kb]);
        if (kb % 2 === 0) pohonBulat(kx + 68, dasar, 0.95, '#3b8244');
      }
      return;
    }
    gambarRuko(m, dasar);
  }
  /* stand tenda penjual takjil Ramadan di pinggir jalan (muncul sore 14.00–19.30 saat bulan puasa) */
  function gambarStandTakjil(dasar, m, t) {
    var jam = (m % 1440) / 60;
    if (jam < 13.5 || jam > 19.8) return;
    var tenda = [
      { x: 24, w: 68, c: '#00897b', lbl: 'TAKJIL' },
      { x: 146, w: 68, c: '#e65100', lbl: 'ES BUAH' },
      { x: 268, w: 68, c: '#1565c0', lbl: 'KOLAK' }
    ];
    tenda.forEach(function (td, i) {
      /* tiang tenda */
      kotak(td.x + 3, dasar - 44, 3, 44, '#cfd8dc');
      kotak(td.x + td.w - 6, dasar - 44, 3, 44, '#cfd8dc');
      /* atap tenda piramid */
      poli([td.x - 4, dasar - 38, td.x + td.w / 2, dasar - 56, td.x + td.w + 4, dasar - 38], td.c);
      kotak(td.x, dasar - 38, td.w, 10, '#fff8e1');
      cx.font = '800 7.5px "Nunito", system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillStyle = td.c; cx.fillText(td.lbl, td.x + td.w / 2, dasar - 33);
      /* meja & toples es buah / gorengan */
      kotak(td.x + 4, dasar - 18, td.w - 8, 18, '#8d5524');
      kotak(td.x + 2, dasar - 20, td.w - 4, 4, '#f5deb3');
      bulat(td.x + 16, dasar - 24, 5, '#ff7043');
      bulat(td.x + 32, dasar - 24, 5, '#66bb6a');
      bulat(td.x + 48, dasar - 24, 5, '#ffd54f');
      if (jam >= 17.5) {
        var grT = cx.createRadialGradient(td.x + td.w / 2, dasar - 34, 1, td.x + td.w / 2, dasar - 34, 24);
        grT.addColorStop(0, 'rgba(255,235,150,.42)'); grT.addColorStop(1, 'rgba(255,235,150,0)');
        cx.fillStyle = grT; cx.fillRect(td.x, dasar - 56, td.w, 46);
      }
    });
  }
  /* ---------- P70: GTA V HD 2D Road + Continuous Biome Morphing + Reflective Puddles & Live Tire Splash Engine (120 FPS) ---------- */
  var hdScroll = 0, hdWheel = 0;
  var hdSplashes = [], hdRipples = [];
  var hdPuddles = [
    { x: 64, yOff: 36, rx: 32, ry: 7.2 },
    { x: 210, yOff: 44, rx: 38, ry: 8.2 },
    { x: 350, yOff: 34, rx: 28, ry: 6.4 },
    { x: 470, yOff: 48, rx: 34, ry: 7.5 }
  ];
  var BIO_PRESET = {
    kota:         { road: [52, 56, 64], shoulder: [122, 126, 132], hill1: [76, 94, 120], hill2: [52, 74, 86], kota: 1, hutan: 0.15, bukit: 0.35, laut: 0, holes: 0.12, mud: 0, bounce: 0.35, tol: 0, basePud: 0.25 },
    tol:          { road: [48, 52, 60], shoulder: [142, 146, 150], hill1: [74, 96, 122], hill2: [48, 78, 72], kota: 0.25, hutan: 0.35, bukit: 0.45, laut: 0, holes: 0.04, mud: 0, bounce: 0.22, tol: 1, basePud: 0.15 },
    mulus:        { road: [54, 58, 64], shoulder: [108, 122, 92], hill1: [70, 96, 118], hill2: [44, 78, 62], kota: 0.45, hutan: 0.55, bukit: 0.55, laut: 0, holes: 0.14, mud: 0, bounce: 0.42, tol: 0, basePud: 0.28 },
    pesisir:      { road: [56, 60, 68], shoulder: [204, 182, 134], hill1: [44, 116, 168], hill2: [36, 98, 138], kota: 0.12, hutan: 0.18, bukit: 0.1, laut: 1, holes: 0.12, mud: 0, bounce: 0.38, tol: 0, basePud: 0.32 },
    perbukitan:   { road: [54, 58, 62], shoulder: [68, 102, 58], hill1: [56, 94, 114], hill2: [34, 76, 58], kota: 0.04, hutan: 0.95, bukit: 1, laut: 0, holes: 0.26, mud: 0.05, bounce: 0.85, tol: 0, basePud: 0.38 },
    bergelombang: { road: [60, 60, 60], shoulder: [98, 106, 74], hill1: [68, 92, 108], hill2: [44, 76, 56], kota: 0.2, hutan: 0.72, bukit: 0.65, laut: 0, holes: 0.52, mud: 0.12, bounce: 1.35, tol: 0, basePud: 0.52 },
    rusak:        { road: [62, 58, 54], shoulder: [102, 90, 66], hill1: [72, 86, 98], hill2: [46, 72, 52], kota: 0.06, hutan: 0.85, bukit: 0.55, laut: 0, holes: 1.0, mud: 0.38, bounce: 2.35, tol: 0, basePud: 0.88 },
    tanah:        { road: [112, 72, 42], shoulder: [74, 54, 30], hill1: [54, 74, 76], hill2: [32, 62, 44], kota: 0, hutan: 1.0, bukit: 0.75, laut: 0, holes: 0.92, mud: 1.0, bounce: 3.1, tol: 0, basePud: 0.92 }
  };
  var bioCur = { road: [52, 56, 64], shoulder: [122, 126, 132], hill1: [76, 94, 120], hill2: [52, 74, 86], kota: 1, hutan: 0.15, bukit: 0.35, laut: 0, holes: 0.12, mud: 0, bounce: 0.35, tol: 0, wet: 0.15, puddles: 0.15 };

  function hdLerp(a, b, k) { return a + (b - a) * k; }
  function hdLerpRgb(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
  function hdRgb(a, al) { return al == null ? ('rgb(' + (a[0] | 0) + ',' + (a[1] | 0) + ',' + (a[2] | 0) + ')') : ('rgba(' + (a[0] | 0) + ',' + (a[1] | 0) + ',' + (a[2] | 0) + ',' + al.toFixed(2) + ')'); }

  function kunciBiomaDari(cfg) {
    var knd = cfg.kondisi || '';
    var md = cfg.medan || '';
    var tm = cfg.tema || '';
    var tier = cfg.tier || 'kota';
    if (knd === 'tol') return 'tol';
    if (knd === 'tanah' || md === 'tanah') return 'tanah';
    if (knd === 'rusak' || md === 'rusak') return 'rusak';
    if (md === 'pesisir' || md === 'pulau' || tm === 'pantai' || tm === 'pelabuhan' || tm === 'danau') return 'pesisir';
    if (md === 'perbukitan' || tm === 'gunung') return 'perbukitan';
    if (knd === 'bergelombang' || md === 'bergelombang') return 'bergelombang';
    if (tm === 'sawit' || tier === 'desa') return 'perbukitan';
    if (md === 'kota' || tm === 'metropolis' || tm === 'kotaBesar' || tier === 'kota') return 'kota';
    return 'mulus';
  }
  function spawnCipratan(x, y, kmh, isMud) {
    if (kmh < 5) return;
    var cnt = Math.min(5, Math.max(2, Math.floor(kmh / 18)));
    for (var i = 0; i < cnt; i++) {
      hdSplashes.push({
        x: x + (Math.random() - 0.5) * 7,
        y: y,
        vx: -(0.75 + Math.random() * 2.0) * Math.max(0.5, kmh / 42),
        vy: -(1.25 + Math.random() * 2.5) * Math.max(0.55, kmh / 46),
        r: 1.4 + Math.random() * 2.2,
        life: 1,
        mud: !!isMud
      });
    }
    if (Math.random() < 0.45) {
      hdRipples.push({ x: x, y: y + 1.5, r: 2.5, maxR: 15 + Math.random() * 8, life: 1 });
    }
  }
  function gambarRukoHD(x, y, idx, roadTop, gp, wet, kotaA) {
    var rw = 58, rh = 72 + (idx % 3) * 20;
    var wg = cx.createLinearGradient(x, y - rh, x + rw, y);
    wg.addColorStop(0, ['#cbd5e1', '#94a3b8', '#e2e8f0', '#b8c4d0'][idx % 4]);
    wg.addColorStop(1, '#334155');
    cx.fillStyle = wg; cx.fillRect(x, y - rh, rw, rh);
    cx.fillStyle = '#1e293b'; cx.fillRect(x - 2, y - rh - 5, rw + 4, 6);
    var malam = gp > 0.32;
    for (var wy = y - rh + 10; wy < y - 28; wy += 16) {
      for (var wx = x + 6; wx < x + rw - 10; wx += 15) {
        var glG = cx.createLinearGradient(wx, wy, wx + 10, wy + 10);
        if (malam && acak(idx * 13 + wx + wy) > 0.32) {
          glG.addColorStop(0, '#fef08a'); glG.addColorStop(1, '#f59e0b');
        } else {
          glG.addColorStop(0, '#0f172a'); glG.addColorStop(0.6, '#1e3a5f'); glG.addColorStop(1, 'rgba(251,191,36,0.52)');
        }
        cx.fillStyle = glG; cx.fillRect(wx, wy, 10, 10);
      }
    }
    /* Pintu kaca lantai dasar & papan neon modern */
    cx.fillStyle = malam ? 'rgba(254,243,199,0.55)' : 'rgba(30,41,59,0.52)';
    cx.fillRect(x + 7, y - 16, rw - 14, 16);
    var neon = ['#ef4444', '#06b6d4', '#f59e0b', '#10b981'][idx % 4];
    cx.fillStyle = '#0f172a'; cx.fillRect(x + 4, y - 24, rw - 8, 8);
    cx.fillStyle = neon; cx.fillRect(x + 6, y - 22, rw - 12, 3.5);
    /* Pantulan papan neon ke aspal basah / lembap */
    if (wet > 0.12) {
      cx.save(); cx.globalAlpha = Math.min(0.32, wet * 0.26 * kotaA);
      cx.fillStyle = neon; cx.fillRect(x + 8, roadTop + 4, rw - 16, 28);
      cx.restore();
    }
  }
  function gambarJalanHD(s, t, dt, cfg) {
    var m = (s.menit || 600) % 1440, gp = gelap(m);
    var cw = s.cuacaInfo, lvlHujan = cw ? (cw.hujan || 0) : (s.hujan || 0);
    var mendung = cw ? (cw.mendung || 0) : (lvlHujan > 0 ? 0.65 : 0);
    var kmh = Math.max(0, cfg.kmh != null ? cfg.kmh : 42);
    var hor = cfg.hor, jt = cfg.jalanTop, roadH = H - jt + 16;

    /* 1. Continuous Smooth Biome Morphing (zero cuts!) */
    var keyT = kunciBiomaDari(cfg);
    var tgt = BIO_PRESET[keyT] || BIO_PRESET.mulus;
    var tgtWet = lvlHujan > 0 ? Math.min(1, 0.7 + lvlHujan * 0.15) : (mendung > 0.45 ? 0.45 : (tgt.basePud > 0.5 ? 0.55 : 0.22));
    var tgtPud = lvlHujan > 0 ? Math.min(1, 0.72 + lvlHujan * 0.14) : (tgt.holes > 0.6 || tgt.mud > 0.5 ? tgt.basePud : (mendung > 0.45 ? 0.42 : tgt.basePud * 0.65));
    var kLerp = 1 - Math.exp(-Math.max(1, dt) * 0.0038);
    bioCur.road = hdLerpRgb(bioCur.road, lvlHujan > 0 ? [tgt.road[0] * 0.74, tgt.road[1] * 0.76, tgt.road[2] * 0.80] : tgt.road, kLerp);
    bioCur.shoulder = hdLerpRgb(bioCur.shoulder, tgt.shoulder, kLerp);
    bioCur.hill1 = hdLerpRgb(bioCur.hill1, tgt.hill1, kLerp);
    bioCur.hill2 = hdLerpRgb(bioCur.hill2, tgt.hill2, kLerp);
    bioCur.kota = hdLerp(bioCur.kota, tgt.kota, kLerp);
    bioCur.hutan = hdLerp(bioCur.hutan, tgt.hutan, kLerp);
    bioCur.bukit = hdLerp(bioCur.bukit, tgt.bukit, kLerp);
    bioCur.laut = hdLerp(bioCur.laut, tgt.laut, kLerp);
    bioCur.holes = hdLerp(bioCur.holes, tgt.holes, kLerp);
    bioCur.mud = hdLerp(bioCur.mud, tgt.mud, kLerp);
    bioCur.bounce = hdLerp(bioCur.bounce, tgt.bounce, kLerp);
    bioCur.tol = hdLerp(bioCur.tol, tgt.tol, kLerp);
    bioCur.wet = hdLerp(bioCur.wet, tgtWet, kLerp);
    bioCur.puddles = hdLerp(bioCur.puddles, tgtPud, kLerp);

    /* Scroll, wheel rotation & road dx synced 1:1 to live km/j! */
    var dxRoad = dt * kmh * 0.0056;
    hdScroll += dt * kmh * 0.0032;
    hdWheel += dt * Math.max(0, kmh) * 0.00052;

    /* 2. Langit Dinamis + Volumetric Sunbeams (GTA V HD) */
    gambarLangit(m, t, s);
    var lSk = langit(m);
    if (gp < 0.45 && lvlHujan < 2) {
      cx.save();
      cx.globalAlpha = 0.14 * (1 - gp * 1.8) * (1 - mendung * 0.65);
      for (var rb = 0; rb < 3; rb++) {
        var rayG = cx.createLinearGradient(W * 0.84, 12, W * (0.18 + rb * 0.25), hor);
        rayG.addColorStop(0, '#fff7ed'); rayG.addColorStop(1, 'rgba(255,247,237,0)');
        cx.fillStyle = rayG;
        cx.beginPath();
        cx.moveTo(W * 0.80, 0); cx.lineTo(W * 0.96, 0);
        cx.lineTo(W * (0.34 + rb * 0.24), hor); cx.lineTo(W * (0.14 + rb * 0.24), hor);
        cx.closePath(); cx.fill();
      }
      cx.restore();
    }

    /* 3. Bukit Berkabut 2 Lapis & Lautan Pesisir */
    if (bioCur.bukit > 0.02 || bioCur.hutan > 0.02) {
      cx.save(); cx.globalAlpha = Math.min(1, Math.max(bioCur.bukit, bioCur.hutan * 0.72));
      cx.fillStyle = hdRgb(bioCur.hill1, 0.80);
      cx.beginPath(); cx.moveTo(0, hor);
      for (var hx1 = 0; hx1 <= W; hx1 += 8) cx.lineTo(hx1, hor - (34 + bioCur.bukit * 52) * (0.5 + 0.5 * Math.sin((hx1 + hdScroll * 0.09) / 48)));
      cx.lineTo(W, hor); cx.closePath(); cx.fill();
      cx.fillStyle = hdRgb(bioCur.hill2, 0.94);
      cx.beginPath(); cx.moveTo(0, hor);
      for (var hx2 = 0; hx2 <= W; hx2 += 8) cx.lineTo(hx2, hor - (18 + bioCur.bukit * 28) * (0.5 + 0.5 * Math.sin((hx2 + hdScroll * 0.18) / 30 + 1.4)));
      cx.lineTo(W, hor); cx.closePath(); cx.fill();
      cx.restore();
    }
    if (bioCur.laut > 0.02) {
      cx.save(); cx.globalAlpha = bioCur.laut;
      var sg = cx.createLinearGradient(0, hor - 32, 0, hor + 2);
      sg.addColorStop(0, gp > 0.4 ? '#0c2742' : '#075985');
      sg.addColorStop(1, gp > 0.4 ? '#1e4066' : '#38bdf8');
      cx.fillStyle = sg; cx.fillRect(0, hor - 32, W, 34);
      cx.fillStyle = 'rgba(255,255,255,0.42)';
      for (var wv = 0; wv < 7; wv++) {
        var wx = (((wv * 64 - hdScroll * 0.25) % (W + 64)) + W + 64) % (W + 64) - 24;
        cx.fillRect(wx, hor - 24 + (wv % 3) * 7, 22, 1.8);
      }
      cx.restore();
    }
    if (cfg.ikonAsal && cfg.u < 0.3) ikonKota(cfg.ikonAsal, 200 - cfg.u / 0.3 * 340, hor + 2, cfg.sk || 0.8, gp);
    if (cfg.ikonTujuan && cfg.u > 0.7) ikonKota(cfg.ikonTujuan, 160 + (1 - cfg.u) / 0.3 * 340, hor + 2, cfg.sk || 0.8, gp);

    /* 4. Bahu Jalan + Permukaan Aspal / Tanah Gradien */
    cx.fillStyle = hdRgb(bioCur.shoulder); cx.fillRect(0, hor, W, jt - hor + 4);
    if (bioCur.kota > 0.35 && bioCur.mud < 0.35) {
      var gk = (hdScroll * 2.2) % 24;
      cx.save(); cx.globalAlpha = Math.min(1, bioCur.kota * (1 - bioCur.mud));
      for (var kb = -24; kb < W + 24; kb += 24) kotak(kb - gk, jt - 5, 12, 5, (Math.round((kb + 24) / 24)) % 2 ? '#f3f1ea' : '#26292e');
      cx.restore();
    }
    var rG = cx.createLinearGradient(0, jt, 0, H);
    rG.addColorStop(0, hdRgb(bioCur.road));
    rG.addColorStop(1, hdRgb([bioCur.road[0] * 0.54, bioCur.road[1] * 0.54, bioCur.road[2] * 0.54]));
    cx.fillStyle = rG; cx.fillRect(0, jt, W, roadH);

    /* Kilau cakrawala basah di permukaan aspal */
    if (bioCur.wet > 0.12 && bioCur.mud < 0.7) {
      var sheen = cx.createLinearGradient(0, jt, 0, jt + 58);
      sheen.addColorStop(0, 'rgba(255,214,168,' + (0.18 * bioCur.wet * (1 - gp * 0.65)).toFixed(3) + ')');
      sheen.addColorStop(1, 'rgba(255,214,168,0)');
      cx.fillStyle = sheen; cx.fillRect(0, jt, W, 58);
    }

    /* 5. Ruko Modern Neon + Hutan Tropis Kalimantan + Tiang Lampu Jalan / Tol */
    if (bioCur.kota > 0.02) {
      cx.save(); cx.globalAlpha = bioCur.kota;
      for (var rk = 0; rk < 7; rk++) {
        var rx = (((rk * 76 - hdScroll * 0.45) % (W + 90)) + W + 90) % (W + 90) - 62;
        gambarRukoHD(rx, hor + 2, rk, jt, gp, bioCur.wet, bioCur.kota);
      }
      if (s.ramadan) { cx.save(); cx.translate(-((hdScroll * 0.5) % (W + 44)), 0); gambarStandTakjil(hor + 10, m, t); cx.restore(); }
      cx.restore();
    }
    if (bioCur.hutan > 0.02 || bioCur.laut > 0.02) {
      cx.save(); cx.globalAlpha = Math.min(1, bioCur.hutan + bioCur.laut * 0.9);
      for (var tr = 0; tr < 9; tr++) {
        var tx = (((tr * 52 - hdScroll * 0.62) % (W + 60)) + W + 60) % (W + 60) - 24;
        if (bioCur.laut > 0.55) {
          pohonSawit(tx, hor + 4, 0.85 + (tr % 3) * 0.1);
        } else {
          cx.fillStyle = '#3b2818'; cx.fillRect(tx - 2.5, hor - 34, 5, 38);
          cx.fillStyle = '#143d26'; cx.beginPath(); cx.arc(tx, hor - 38, 18, 0, Math.PI * 2); cx.fill();
          cx.fillStyle = '#1f5c36'; cx.beginPath(); cx.arc(tx - 6, hor - 43, 12, 0, Math.PI * 2); cx.fill();
        }
      }
      cx.restore();
    }
    if (bioCur.tol > 0.25) {
      cx.save(); cx.globalAlpha = bioCur.tol;
      kotak(0, jt - 2, W, 3.5, '#cbd5e1');
      var gTol = (hdScroll * 1.9) % 120;
      for (var xTol = -120; xTol < W + 120; xTol += 120) {
        var lxT = xTol - gTol;
        kotak(lxT, jt - 46, 3, 48, '#64748b'); kotak(lxT, jt - 46, 16, 3, '#64748b');
        if (gp > 0.25) {
          var glT = cx.createRadialGradient(lxT + 14, jt - 43, 1, lxT + 14, jt - 43, 30);
          glT.addColorStop(0, 'rgba(255,224,148,' + (0.55 * gp).toFixed(2) + ')');
          glT.addColorStop(1, 'rgba(255,224,148,0)');
          cx.fillStyle = glT; cx.beginPath(); cx.arc(lxT + 14, jt - 43, 30, 0, Math.PI * 2); cx.fill();
        }
      }
      cx.restore();
    } else if (gp > 0.28 || bioCur.kota > 0.35) {
      var gLp = (hdScroll * 1.6) % 150;
      for (var xLp = -150; xLp < W + 150; xLp += 150) {
        var pxL = xLp - gLp;
        kotak(pxL, jt - 48, 2.5, 48, '#475569'); kotak(pxL, jt - 48, 12, 2.5, '#475569');
        if (gp > 0.22) {
          var gHal = cx.createRadialGradient(pxL + 11, jt - 45, 1, pxL + 11, jt - 45, 32);
          gHal.addColorStop(0, 'rgba(255,218,136,' + (0.52 * gp).toFixed(2) + ')');
          gHal.addColorStop(1, 'rgba(255,218,136,0)');
          cx.fillStyle = gHal; cx.beginPath(); cx.arc(pxL + 11, jt - 45, 32, 0, Math.PI * 2); cx.fill();
        }
      }
    }

    /* 6. Tekstur Agregat Aspal Kasar & Retakan Halus (Pre-Baked Offscreen 120 FPS!) */
    var texUse = bioCur.mud > 0.55 ? (texTanahHD || texAspalHD) : texAspalHD;
    if (texUse) {
      var gx0 = -((hdScroll * 1.75) % 160);
      for (var gx = gx0 - 160; gx < W + 160; gx += 160) cx.drawImage(texUse, gx, jt, 160, Math.min(220, roadH));
    }

    /* Marka jalan (memudar di jalan rusak & hilang di jalan tanah) */
    if (bioCur.mud < 0.85) {
      cx.save(); cx.globalAlpha = Math.max(0, (1 - bioCur.mud * 1.2) * (1 - bioCur.holes * 0.45));
      cx.fillStyle = '#f1f5f9';
      var mOff = (hdScroll * 1.75) % 66;
      for (var mx = -66; mx < W + 66; mx += 66) cx.fillRect(mx - mOff, jt + 36, 32, 3);
      cx.restore();
    }
    /* Alur roda lumpur di jalan tanah laterit */
    if (bioCur.mud > 0.08) {
      cx.save(); cx.globalAlpha = bioCur.mud * 0.58;
      cx.fillStyle = '#361f0e'; cx.fillRect(0, jt + 24, W, 9); cx.fillRect(0, jt + 52, W, 10);
      cx.restore();
    }
    /* Lubang aspal retak di jalan rusak/bergelombang */
    if (bioCur.holes > 0.25) {
      cx.save(); cx.globalAlpha = Math.min(0.75, bioCur.holes * 0.72);
      var gLub = (hdScroll * 1.75) % 105;
      cx.fillStyle = bioCur.mud > 0.5 ? 'rgba(42,24,10,0.75)' : 'rgba(20,22,26,0.72)';
      for (var lb = -105; lb < W + 105; lb += 105) {
        cx.beginPath(); cx.ellipse(lb - gLub + 38, jt + 26 + (Math.abs(lb) % 3) * 15, 13 + bioCur.holes * 5, 4.2, 0, 0, Math.PI * 2); cx.fill();
      }
      cx.restore();
    }

    /* 7. GENANGAN AIR REFLEKTIF (WARUNG LIFE SIMULATOR STYLE) + DETEKSI BAN + CIPRATAN REAL-TIME! */
    var fTireX = cfg.frontTireX, rTireX = cfg.rearTireX, tireY = cfg.tireY;
    for (var pi = 0; pi < hdPuddles.length; pi++) {
      var p = hdPuddles[pi];
      p.x -= dxRoad;
      if (p.x < -p.rx - 24) {
        p.x = W + 45 + Math.random() * 110;
        p.rx = 24 + Math.random() * 20;
        p.ry = 5.8 + Math.random() * 2.8;
        p.yOff = 32 + Math.random() * 24;
      }
      if (bioCur.puddles > 0.06) {
        var py = jt + p.yOff;
        cx.save(); cx.globalAlpha = bioCur.puddles;
        /* Tepi aspal basah gelap */
        cx.fillStyle = bioCur.mud > 0.5 ? 'rgba(38,22,10,0.74)' : 'rgba(14,18,24,0.66)';
        cx.beginPath(); cx.ellipse(p.x, py, p.rx + 4.5, p.ry + 2.2, 0, 0, Math.PI * 2); cx.fill();
        /* Permukaan cermin pantulan langit / lumpur */
        var pg = cx.createLinearGradient(p.x - p.rx, py - p.ry, p.x + p.rx, py + p.ry);
        if (bioCur.mud > 0.55) {
          pg.addColorStop(0, 'rgba(92,62,38,0.88)'); pg.addColorStop(0.5, 'rgba(156,128,96,0.76)'); pg.addColorStop(1, 'rgba(64,42,24,0.88)');
        } else {
          pg.addColorStop(0, lSk[0]); pg.addColorStop(0.55, lSk[1]); pg.addColorStop(1, lSk[0]);
        }
        cx.fillStyle = pg;
        cx.beginPath(); cx.ellipse(p.x, py, p.rx, p.ry, 0, 0, Math.PI * 2); cx.fill();
        /* Kilau spekular putih tipis di tepi genangan */
        cx.strokeStyle = 'rgba(255,255,255,0.32)'; cx.lineWidth = 0.9;
        cx.beginPath(); cx.ellipse(p.x, py - 0.6, p.rx * 0.82, p.ry * 0.65, 0, Math.PI * 1.1, Math.PI * 1.9); cx.stroke();
        cx.restore();

        /* Deteksi real-time ban depan & belakang melibas genangan! */
        if (fTireX != null && Math.abs(fTireX - p.x) < p.rx * 0.92 && Math.abs(tireY - py) < 28) {
          spawnCipratan(fTireX - 3, tireY, kmh, bioCur.mud > 0.5);
        }
        if (rTireX != null && Math.abs(rTireX - p.x) < p.rx * 0.92 && Math.abs(tireY - py) < 28) {
          spawnCipratan(rTireX - 3, tireY, kmh, bioCur.mud > 0.5);
        }
      }
    }

    /* Riak air mengembang di genangan */
    for (var ri = hdRipples.length - 1; ri >= 0; ri--) {
      var rp = hdRipples[ri];
      rp.x -= dxRoad * 0.85;
      rp.r += dt * 0.026;
      rp.life -= dt * 0.0022;
      if (rp.life <= 0) { hdRipples.splice(ri, 1); continue; }
      cx.strokeStyle = bioCur.mud > 0.5
        ? ('rgba(180,140,100,' + (rp.life * 0.65).toFixed(2) + ')')
        : ('rgba(224,242,254,' + (rp.life * 0.68).toFixed(2) + ')');
      cx.lineWidth = 1.15;
      cx.beginPath(); cx.ellipse(rp.x, rp.y, rp.r, rp.r * 0.3, 0, 0, Math.PI * 2); cx.stroke();
    }

    /* Papan rambu jalan (Travel) */
    if (cfg.rambuTeks && cfg.rambuX != null) {
      kotak(cfg.rambuX + 54, jt - 18, 4, 24, '#64748b');
      kotakBulat(cfg.rambuX, jt - 40, 116, 22, 5, '#0f766e');
      cx.font = '800 10.5px "Baloo 2", "Nunito", system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillStyle = '#fff';
      cx.fillText(cfg.rambuTeks, cfg.rambuX + 58, jt - 29);
    }

    selimutMalam(gp, 0.34);

    /* Pantulan kendaraan & lampu pada aspal basah */
    if (bioCur.wet > 0.15 && cfg.vehX != null && cfg.vehY != null) {
      cx.save(); cx.globalAlpha = Math.min(0.28, bioCur.wet * 0.25);
      cx.fillStyle = '#e2e8f0'; cx.beginPath(); cx.ellipse(cfg.vehX, cfg.vehY + 12, cfg.isCar ? 42 : 24, 6, 0, 0, Math.PI * 2); cx.fill();
      if (gp > 0.25 || s.biled) {
        cx.fillStyle = s.biled ? '#38bdf8' : '#fde68a';
        cx.beginPath(); cx.ellipse(cfg.vehX + (cfg.isCar ? 62 : 36), cfg.vehY + 11, 28, 4.5, 0, 0, Math.PI * 2); cx.fill();
      }
      cx.fillStyle = '#ef4444'; cx.beginPath(); cx.ellipse(cfg.vehX - (cfg.isCar ? 44 : 24), cfg.vehY + 10, 13, 3.6, 0, 0, Math.PI * 2); cx.fill();
      cx.restore();
    }

    var goyang = Math.sin(t / (bioCur.holes > 0.5 ? 52 : 88)) * bioCur.bounce * Math.min(1.4, kmh / 26 + 0.25);
    return { goyang: goyang, wheel: hdWheel, dxRoad: dxRoad, gp: gp };
  }
  function gambarCipratanHD(dt) {
    for (var si = hdSplashes.length - 1; si >= 0; si--) {
      var sp = hdSplashes[si];
      sp.x += sp.vx * (dt * 0.06);
      sp.y += sp.vy * (dt * 0.06);
      sp.vy += 0.13 * (dt * 0.06);
      sp.life -= dt * 0.0026;
      if (sp.life <= 0) { hdSplashes.splice(si, 1); continue; }
      cx.fillStyle = sp.mud
        ? ('rgba(116,74,40,' + (sp.life * 0.9).toFixed(2) + ')')
        : ('rgba(220,244,255,' + (sp.life * 0.9).toFixed(2) + ')');
      cx.beginPath(); cx.arc(sp.x, sp.y, sp.r * sp.life + 0.55, 0, Math.PI * 2); cx.fill();
    }
    if (hdSplashes.length > 96) hdSplashes.splice(0, hdSplashes.length - 96);
  }
  function gambarBloomLampuRem(x, y, gp) {
    var tb = cx.createRadialGradient(x, y, 1, x, y, 20);
    tb.addColorStop(0, 'rgba(239,68,68,' + (0.48 + gp * 0.35).toFixed(2) + ')');
    tb.addColorStop(1, 'rgba(239,68,68,0)');
    cx.fillStyle = tb; cx.beginPath(); cx.arc(x, y, 20, 0, Math.PI * 2); cx.fill();
  }

  function gambarJalanRaya(s, t, dt) {
    var m = s.menit % 1440, f = s.ojek || {}, jalan = H * 0.60, hor = jalan - 32;
    var isCar = f.mode === 'mobil' && !!s.mobil;
    var kmh = f.kmh != null ? f.kmh : 44;
    var vehX = isCar ? W * 0.44 : W * 0.42;
    var vehY = isCar ? jalan + 68 : jalan + 54;
    var st = gambarJalanHD(s, t, dt || 16, {
      hor: hor, jalanTop: jalan, kmh: kmh,
      kondisi: f.kondisi || 'mulus', medan: f.medan || (f.lokSekarang && f.lokSekarang.medan) || 'kota',
      tier: s.tierWilayah || 'kota', isCar: isCar, vehX: vehX, vehY: vehY,
      frontTireX: isCar ? vehX + 26 : vehX + 16, rearTireX: isCar ? vehX - 26 : vehX - 16, tireY: vehY + 4
    });
    var gp = st.gp, goyang = st.goyang;
    /* Kendaraan lain menyalip di lajur belakang */
    var siklus1 = Math.floor((t * 0.03) / (W + 260)) % 3;
    var sx = W + 80 - ((t * 0.03) % (W + 260));
    gambarMobil(sx, jalan + 122, ['mpv', 'hatch', 'suv'][siklus1], ['avanza', 'agya', 'rush'][siklus1], false, t * 0.012, gp);
    var antar = f.status === 'antar';
    if (isCar) {
      gambarBloomLampuRem(vehX - 44, vehY - 14 + goyang, gp);
      gambarMobil(vehX, vehY + goyang, s.mobil.bentuk, s.mobil.id, false, st.wheel, gp);
      pencahayaanLuar(m, t, jalan, vehX + 46, vehY - 18 + goyang, !!s.biled);
    } else {
      gambarBloomLampuRem(vehX - 22, vehY - 18 + goyang, gp);
      gambarMotorKu(vehX, vehY - 4 + goyang, s.motorId, { naik: true, jalan: true, baju: s.warnaBaju, bonceng: antar && f.jenis === 'penumpang', muatan: antar && f.jenis !== 'penumpang' ? (f.jenis === 'makanan' ? 'makanan' : 'paket') : null }, t);
      pencahayaanLuar(m, t, jalan, vehX + 28, vehY - 26 + goyang, !!s.biled);
    }
    gambarCipratanHD(dt || 16);
    if (kmh > 58) {
      cx.strokeStyle = 'rgba(255,255,255,' + Math.min(0.42, (kmh - 58) / 140).toFixed(2) + ')'; cx.lineWidth = 1.4;
      for (var sl = 0; sl < 6; sl++) {
        var ly = jalan + 12 + acak(sl + 31) * 58, lx = ((t * (0.45 + kmh / 100) + sl * 97) % (W + 90));
        cx.beginPath(); cx.moveTo(W - lx, ly); cx.lineTo(W - lx + 24 + kmh / 4.5, ly); cx.stroke();
      }
    }
    gambarHujanRealistis(s, t, jalan, 0);
  }
  /* adegan pindahan: pikap membawa kasur, kardus, dan barang */
  function gambarPindahan(s, t) {
    var m = s.menit % 1440, jalan = H * 0.5, dasarRuko = jalan - 60, u = Math.max(0, Math.min(1, s.pindah.u));
    gambarLangit(m, t, s); gambarRuko(m, dasarRuko);
    var gp = gelap(m); if (gp > 0) { cx.fillStyle = 'rgba(10,18,45,' + (gp * 0.38).toFixed(3) + ')'; cx.fillRect(0, 0, W, dasarRuko); }
    kotak(0, dasarRuko, W, jalan - dasarRuko, '#b9b2a6'); kotak(0, jalan, W, H - jalan, '#4a4d52');
    cx.fillStyle = '#e9e4d4'; for (var x1 = 8; x1 < W; x1 += 70) cx.fillRect(x1, jalan + 64, 34, 3);
    var x = -90 + u * (W + 180), y = jalan + 90;
    gambarMobil(x, y, 'pikap', s.pindah.pikap ? s.pindah.warna : 'granmax', false, t * 0.014, gp);
    /* muatan di bak */
    kotakBulat(x - 56, y - 60, 60, 14, 5, '#f3f1ea'); kotak(x - 30, y - 74, 18, 14, '#c8a06a'); kotak(x - 50, y - 72, 16, 12, '#c8a06a'); kotakBulat(x - 10, y - 66, 18, 20, 3, '#9aa3a6');
    cx.font = '800 20px "Baloo 2", "Nunito", system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.lineWidth = 5; cx.strokeStyle = 'rgba(29,43,51,.6)'; cx.strokeText('Pindahan…', W / 2, H * 0.36); cx.fillStyle = '#fbfaf6'; cx.fillText('Pindahan…', W / 2, H * 0.36);
  }

  /* ---------- Travel antarkota: pemandangan tiap kota, jalan raya, kapal ---------- */
  var tJarak = 0, tRoda = 0;
  function poli(p, w) { cx.fillStyle = w; cx.beginPath(); cx.moveTo(p[0], p[1]); for (var i = 2; i < p.length; i += 2) cx.lineTo(p[i], p[i + 1]); cx.closePath(); cx.fill(); }
  function bukitLatar(dasar, tinggi, warna, off, lebar, seed) {
    cx.fillStyle = warna; cx.beginPath(); cx.moveTo(0, dasar);
    for (var x = 0; x <= W; x += 6) cx.lineTo(x, dasar - tinggi * (0.55 + 0.45 * Math.sin((x + off) / lebar + seed) * Math.sin((x + off) / (lebar * 2.3) + seed * 2)));
    cx.lineTo(W, dasar); cx.closePath(); cx.fill();
  }
  function pohonSawit(x, d, s) {
    kotak(x - 2 * s, d - 36 * s, 4 * s, 36 * s, '#6b4a2e'); cx.strokeStyle = '#2f7a3a'; cx.lineWidth = 3 * s; cx.lineCap = 'round';
    for (var k = -3; k <= 3; k++) { cx.beginPath(); cx.moveTo(x, d - 36 * s); cx.quadraticCurveTo(x + k * 7 * s, d - 52 * s + Math.abs(k) * 3 * s, x + k * 12 * s, d - 36 * s + Math.abs(k) * 6 * s); cx.stroke(); }
  }
  function pohonBulat(x, d, s, w) { kotak(x - 2 * s, d - 18 * s, 4 * s, 18 * s, '#6b4a2e'); bulat(x, d - 26 * s, 13 * s, w || '#3f8a46'); bulat(x - 7 * s, d - 20 * s, 9 * s, w || '#4c9a52'); }
  function gedung(x, d, w, h, warna, lampu) {
    kotak(x, d - h, w, h, warna);
    for (var yy = d - h + 8; yy < d - 10; yy += 14) for (var xx = x + 5; xx < x + w - 6; xx += 11) { cx.fillStyle = lampu ? 'rgba(255,226,140,.9)' : 'rgba(190,215,235,.6)'; cx.fillRect(xx, yy, 5, 7); }
  }
  function kubah(x, d, r, w) { cx.fillStyle = w; cx.beginPath(); cx.arc(x, d, r, Math.PI, 0); cx.fill(); kotak(x - 1.5, d - r - 9, 3, 9, '#c9a24a'); bulat(x, d - r - 10, 3, '#c9a24a'); }
  function atapMinang(x, d, w, h, warna) { poli([x, d, x + w * 0.1, d - h * 0.55, x + w * 0.04, d - h, x + w * 0.3, d - h * 0.55, x + w * 0.5, d - h * 0.7, x + w * 0.7, d - h * 0.55, x + w * 0.96, d - h, x + w * 0.9, d - h * 0.55, x + w, d], warna); }
  /* penanda khas tiap kota; (x, d) = tengah dan dasar, s = skala */
  function ikonKota(id, x, d, s, gp) {
    var lampu = gp > 0.4;
    if (id === 'jakarta') { kotak(x - 40 * s, d - 10 * s, 80 * s, 10 * s, '#d9d4c8'); kotak(x - 5 * s, d - 130 * s, 10 * s, 120 * s, '#f1eee6'); kotak(x - 12 * s, d - 112 * s, 24 * s, 6 * s, '#d9d4c8'); bulat(x, d - 140 * s, 8 * s, '#f2b630'); poli([x - 4 * s, d - 142 * s, x, d - 160 * s, x + 4 * s, d - 142 * s], '#f28a1e'); }
    else if (id === 'medan' || id === 'pekanbaru') { var wk = id === 'medan' ? '#2b2b30' : '#2f8f7a'; kotak(x - 55 * s, d - 40 * s, 110 * s, 40 * s, '#e8e0cc'); kubah(x, d - 40 * s, 26 * s, wk); kubah(x - 40 * s, d - 40 * s, 12 * s, wk); kubah(x + 40 * s, d - 40 * s, 12 * s, wk); kotak(x - 66 * s, d - 90 * s, 7 * s, 90 * s, '#efe8d6'); kotak(x + 59 * s, d - 90 * s, 7 * s, 90 * s, '#efe8d6'); kubah(x - 62.5 * s, d - 90 * s, 6 * s, wk); kubah(x + 62.5 * s, d - 90 * s, 6 * s, wk); }
    else if (id === 'bandung') { kotak(x - 55 * s, d - 36 * s, 110 * s, 36 * s, '#e6d9bf'); kotak(x - 12 * s, d - 56 * s, 24 * s, 20 * s, '#d8c9a6'); kotak(x - 2 * s, d - 96 * s, 4 * s, 40 * s, '#b8a98a'); for (var q = 0; q < 6; q++) bulat(x, d - (70 + q * 5) * s, 3 * s, '#c25a3a'); }
    else if (id === 'cirebon') { kotak(x - 50 * s, d - 40 * s, 40 * s, 40 * s, '#b4543a'); kotak(x + 10 * s, d - 40 * s, 40 * s, 40 * s, '#b4543a'); poli([x - 56 * s, d - 40 * s, x - 30 * s, d - 62 * s, x - 4 * s, d - 40 * s], '#8a3b28'); poli([x + 4 * s, d - 40 * s, x + 30 * s, d - 62 * s, x + 56 * s, d - 40 * s], '#8a3b28'); }
    else if (id === 'semarang') { kotak(x - 50 * s, d - 44 * s, 100 * s, 44 * s, '#f2eee2'); [-1, 1].forEach(function (k) { kotak(x + k * 38 * s - 9 * s, d - 74 * s, 18 * s, 34 * s, '#f2eee2'); poli([x + k * 38 * s - 12 * s, d - 74 * s, x + k * 38 * s, d - 96 * s, x + k * 38 * s + 12 * s, d - 74 * s], '#8d5d3b'); }); for (var w3 = -40; w3 < 40; w3 += 12) kotak(x + w3 * s, d - 30 * s, 5 * s, 14 * s, '#5b7a8a'); }
    else if (id === 'yogyakarta') { kotak(x - 24 * s, d - 12 * s, 48 * s, 12 * s, '#e6e0d0'); kotak(x - 14 * s, d - 28 * s, 28 * s, 16 * s, '#f2eee2'); kotak(x - 6 * s, d - 82 * s, 12 * s, 54 * s, '#f6f3ea'); poli([x - 8 * s, d - 82 * s, x, d - 112 * s, x + 8 * s, d - 82 * s], '#d9a63a'); }
    else if (id === 'surabaya') { poli([x - 14 * s, d, x - 7 * s, d - 120 * s, x + 7 * s, d - 120 * s, x + 14 * s, d], '#e9e3d3'); for (var r2 = 1; r2 < 6; r2++) kotak(x - 12 * s + r2 * 0.3 * s, d - r2 * 20 * s, 24 * s - r2 * 0.7 * s, 2 * s, '#bdb6a4'); poli([x - 8 * s, d - 120 * s, x, d - 140 * s, x + 8 * s, d - 120 * s], '#c9a24a'); }
    else if (id === 'palembang') { cx.strokeStyle = '#d34c2b'; cx.lineWidth = 2 * s; kotak(x - 90 * s, d - 22 * s, 180 * s, 6 * s, '#c8442a'); [-1, 1].forEach(function (k) { kotak(x + k * 30 * s - 5 * s, d - 90 * s, 10 * s, 70 * s, '#d9553a'); cx.beginPath(); cx.moveTo(x + k * 30 * s, d - 88 * s); cx.lineTo(x + k * 88 * s, d - 22 * s); cx.moveTo(x + k * 30 * s, d - 88 * s); cx.lineTo(x + k * 4 * s, d - 22 * s); cx.stroke(); }); }
    else if (id === 'jambi') { kotak(x - 8 * s, d - 90 * s, 16 * s, 90 * s, '#e8dcc2'); poli([x - 40 * s, d - 40 * s, x, d - 110 * s, x + 40 * s, d - 40 * s], 'rgba(214,170,70,.92)'); kotak(x - 44 * s, d - 6 * s, 88 * s, 6 * s, '#cdbf9e'); }
    else if (id === 'bukittinggi') { kotak(x - 17 * s, d - 80 * s, 34 * s, 80 * s, '#efe6d0'); bulat(x, d - 62 * s, 10 * s, '#fffdf2'); cx.strokeStyle = '#33414d'; cx.lineWidth = 1.4 * s; cx.beginPath(); cx.moveTo(x, d - 62 * s); cx.lineTo(x, d - 69 * s); cx.moveTo(x, d - 62 * s); cx.lineTo(x + 5 * s, d - 62 * s); cx.stroke(); atapMinang(x - 24 * s, d - 80 * s, 48 * s, 30 * s, '#9a3a2a'); }
    else if (id === 'padang') { kotak(x - 50 * s, d - 22 * s, 100 * s, 22 * s, '#8a5a3a'); atapMinang(x - 56 * s, d - 22 * s, 112 * s, 52 * s, '#6e2f22'); }
    else if (id === 'parapat') { cx.fillStyle = '#4aa3c8'; cx.fillRect(0, d - 12 * s, W, 12 * s); kotak(x - 34 * s, d - 22 * s, 68 * s, 22 * s, '#7a4a2e'); cx.fillStyle = '#4a2a1a'; cx.beginPath(); cx.moveTo(x - 50 * s, d - 22 * s); cx.quadraticCurveTo(x, d - 46 * s, x + 50 * s, d - 22 * s); cx.lineTo(x + 56 * s, d - 54 * s); cx.lineTo(x + 46 * s, d - 44 * s); cx.quadraticCurveTo(x, d - 66 * s, x - 46 * s, d - 44 * s); cx.lineTo(x - 56 * s, d - 54 * s); cx.closePath(); cx.fill(); }
    else if (id === 'berastagi') { poli([x - 120 * s, d, x - 20 * s, d - 120 * s, x - 6 * s, d - 126 * s, x + 12 * s, d - 120 * s, x + 110 * s, d], '#5a6a62'); bulat(x - 8 * s, d - 136 * s, 9 * s, 'rgba(235,235,235,.8)'); bulat(x + 4 * s, d - 148 * s, 12 * s, 'rgba(235,235,235,.55)'); kotak(x + 55 * s - 4 * s, d - 40 * s, 8 * s, 40 * s, '#e8e2cf'); bulat(x + 55 * s, d - 48 * s, 12 * s, '#f28a1e'); }
    else if (id === 'lampung' || id === 'bakauheni') { kotak(x - 14 * s, d - 56 * s, 28 * s, 56 * s, '#f6f3ea'); poli([x - 30 * s, d - 56 * s, x - 20 * s, d - 94 * s, x - 10 * s, d - 72 * s, x, d - 100 * s, x + 10 * s, d - 72 * s, x + 20 * s, d - 94 * s, x + 30 * s, d - 56 * s], '#e0b23a'); }
    else if (id === 'merak') { kotak(x - 4 * s, d - 80 * s, 8 * s, 80 * s, '#d9553a'); kotak(x - 4 * s, d - 80 * s, 56 * s, 7 * s, '#d9553a'); kotak(x + 46 * s, d - 80 * s, 4 * s, 30 * s, '#444'); kotak(x - 70 * s, d - 28 * s, 50 * s, 28 * s, '#3b6fa0'); kotak(x - 66 * s, d - 40 * s, 22 * s, 12 * s, '#d9553a'); }
    else if (id === 'binjai') { for (var b2 = -2; b2 <= 2; b2++) { bulat(x + b2 * 14 * s, d - 12 * s, 7 * s, '#d9302c'); kotak(x + b2 * 14 * s - 1, d - 32 * s, 2, 20 * s, '#6b4a2e'); } gedung(x - 40 * s, d, 30 * s, 50 * s, '#d9cfb8', lampu); gedung(x + 12 * s, d, 34 * s, 40 * s, '#cdbf9e', lampu); }
    else { gedung(x - 45 * s, d, 28 * s, 56 * s, '#cfc7b4', lampu); gedung(x - 12 * s, d, 30 * s, 72 * s, '#b9c3c9', lampu); gedung(x + 22 * s, d, 26 * s, 48 * s, '#d9cfb8', lampu); }
  }
  /* pemandangan umum per tema (100% vektor), bergeser mengikuti jarak tempuh */
  function latarTema(tema, dasar, geser, gp, m) {
    var lampu = gp > 0.4, off = geser;
    if (tema === 'gunung') { bukitLatar(dasar - 12, 110, '#6d8f8a', off * 0.2, 90, 1); bukitLatar(dasar - 4, 70, '#4f8a55', off * 0.45, 60, 3); for (var r = 0; r < 4; r++) { cx.fillStyle = 'rgba(90,160,80,' + (0.5 - r * 0.08) + ')'; cx.fillRect(0, dasar - 8 - r * 7, W, 3); } }
    else if (tema === 'danau') { bukitLatar(dasar - 18, 90, '#5d7f8a', off * 0.15, 110, 5); cx.fillStyle = 'rgba(90,170,205,.85)'; cx.fillRect(0, dasar - 18, W, 18); bukitLatar(dasar, 36, '#3f7a4a', off * 0.4, 70, 2); }
    else if (tema === 'pantai') { cx.fillStyle = 'rgba(70,160,205,.9)'; cx.fillRect(0, dasar - 30, W, 24); cx.fillStyle = 'rgba(255,255,255,.55)'; for (var w2 = 0; w2 < 7; w2++) cx.fillRect(((w2 * 70 - off * 0.3) % (W + 70) + W + 70) % (W + 70) - 35, dasar - 24 + (w2 % 3) * 6, 26, 2); kotak(0, dasar - 8, W, 8, '#e8d6a0'); for (var k = 0; k < 6; k++) pohonSawit(((k * 80 - off * 0.8) % (W + 80) + W + 80) % (W + 80) - 20, dasar, 0.8); }
    else if (tema === 'sungai') { bukitLatar(dasar - 10, 26, '#5f8f6a', off * 0.2, 80, 4); cx.fillStyle = 'rgba(150,120,80,.9)'; cx.fillRect(0, dasar - 10, W, 12); for (var t3 = 0; t3 < 4; t3++) { var bx = ((t3 * 120 - off * 0.35) % (W + 120) + W + 120) % (W + 120) - 30; kotak(bx, dasar - 8, 34, 5, '#8a5a3a'); kotak(bx + 20, dasar - 18, 10, 10, '#f1eee6'); } }
    else if (tema === 'sawit') { bukitLatar(dasar - 6, 30, '#5f8f55', off * 0.2, 100, 6); for (var s2 = 0; s2 < 9; s2++) pohonSawit(((s2 * 52 - off * 0.7) % (W + 52) + W + 52) % (W + 52) - 10, dasar + (s2 % 2) * 4, 0.9 + (s2 % 3) * 0.12); }
    else if (tema === 'pelabuhan') { cx.fillStyle = 'rgba(60,130,175,.9)'; cx.fillRect(0, dasar - 22, W, 22); for (var c2 = 0; c2 < 5; c2++) { var cxk = ((c2 * 90 - off * 0.5) % (W + 90) + W + 90) % (W + 90) - 20; kotak(cxk, dasar - 18, 34, 18, ['#d9553a', '#3b6fa0', '#e0b23a', '#4a9a5a', '#8a5aa0'][c2]); kotak(cxk + 2, dasar - 32, 30, 14, ['#3b6fa0', '#d9553a', '#4a9a5a', '#e0b23a', '#d9553a'][c2]); } }
    else if (tema === 'budaya') { bukitLatar(dasar - 8, 40, '#7b9f7a', off * 0.2, 90, 2); for (var j2 = 0; j2 < 4; j2++) { var jx = ((j2 * 110 - off * 0.55) % (W + 110) + W + 110) % (W + 110) - 40; kotak(jx, dasar - 14, 46, 14, '#8a5a3a'); poli([jx - 8, dasar - 14, jx + 23, dasar - 40, jx + 54, dasar - 14], '#6e3a24'); } pohonBulat(((50 - off * 0.8) % W + W) % W, dasar, 1.1); }
    else { /* kota */
      for (var g2 = 0; g2 < 8; g2++) { var gx = ((g2 * 62 - off * 0.35) % (W + 62) + W + 62) % (W + 62) - 30, th = 40 + ((g2 * 37) % 70) * (tema === 'metropolis' ? 1.6 : tema === 'kotaBesar' ? 1.2 : 0.8); gedung(gx, dasar, 36, th, ['#aab5bd', '#c3c7c9', '#9aa7b0', '#b7bfc4'][g2 % 4], lampu); }
    }
  }
  function orangAntre(x, y, s, warna, koper) {
    kotakBulat(x - 5 * s, y - 24 * s, 10 * s, 18 * s, 4 * s, warna); bulat(x, y - 29 * s, 5 * s, '#e0b48a'); kotak(x - 4 * s, y - 6 * s, 3 * s, 8 * s, '#33414d'); kotak(x + 1 * s, y - 6 * s, 3 * s, 8 * s, '#33414d');
    if (koper) kotakBulat(x + 7 * s, y - 10 * s, 9 * s, 10 * s, 2, koper);
  }
  function selimutMalam(gp, a) { if (gp > 0) { cx.fillStyle = 'rgba(10,18,45,' + (gp * a).toFixed(3) + ')'; cx.fillRect(0, 0, W, H); } }
  function hujanTravel(s, t) {
    gambarHujanRealistis(s, t, H * 0.65, 0);
  }
  function teksTengah(teks, y, ukuran) {
    cx.font = '800 ' + (ukuran || 18) + 'px "Baloo 2", "Nunito", system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.lineWidth = 5; cx.strokeStyle = 'rgba(29,43,51,.65)'; cx.strokeText(teks, W / 2, y); cx.fillStyle = '#fbfaf6'; cx.fillText(teks, W / 2, y);
  }
  /* geometri adegan travel: mobil selalu terlihat tepat di atas panel bawah; kota tumbuh ke atas */
  function geomTravel(s) {
    var skala = cv.getBoundingClientRect().width / W || 1, bawah = Math.min(H * 0.84, H - (s.ruangBawah || 0) / skala);
    var jalanTop = bawah - 64, hor = jalanTop - 14;
    return { bawah: bawah, jalanTop: jalanTop, hor: hor, carY: bawah - 6, sk: Math.max(0.42, Math.min(1.5, (hor - 170) / 150)) };
  }
  /* pool: mobil menunggu penumpang di kota */
  function gambarPoolTravel(s, t) {
    var f = s.travel, m = s.menit % 1440, gp = gelap(m), G = geomTravel(s), hor = G.hor;
    gambarLangit(m, t, s); latarTema(f.tema, hor, 0, gp, m); ikonKota(f.kota, W * 0.68, hor + 2, G.sk, gp);
    kotak(0, hor, W, G.jalanTop - hor + 6, '#b8b2a4');
    var grPl = cx.createLinearGradient(0, G.jalanTop + 6, 0, H);
    grPl.addColorStop(0, '#444952'); grPl.addColorStop(1, '#262b32');
    cx.fillStyle = grPl; cx.fillRect(0, G.jalanTop + 6, W, H - G.jalanTop);
    if (texAspalHD) { for (var gxP = 0; gxP < W; gxP += 160) cx.drawImage(texAspalHD, gxP, G.jalanTop + 6, 160, Math.min(200, H - G.jalanTop)); }
    cx.fillStyle = '#e9e4d4'; for (var x1 = 8; x1 < W; x1 += 60) cx.fillRect(x1, G.jalanTop + 40, 30, 3);
    selimutMalam(gp, 0.34);
    kotak(18, G.jalanTop - 30, 4, 34, '#59656d'); kotakBulat(6, G.jalanTop - 52, 112, 24, 6, '#6a4fd8'); cx.font = '800 13px "Baloo 2", "Nunito", system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillStyle = '#fff'; cx.fillText('POOL TRAVEL', 62, G.jalanTop - 40);
    var mob = s.mobil || { bentuk: 'mpv', id: 'avanza' };
    gambarMobil(W * 0.3, G.carY, mob.bentuk, mob.id, false, 0, gp);
    var warna = ['#d9553a', '#3b6fa0', '#4a9a5a', '#8a5aa0', '#e0b23a', '#2b8a8a'];
    for (var i = 0; i < f.penumpang; i++) orangAntre(W * 0.54 + i * 14, G.carY - 4 + (i % 2) * 3, 1.05, warna[i % warna.length], i % 2 ? '#7a4a2e' : null);
    teksTengah(RUTE_NAMA(f.kota) + (f.tujuan ? ' → ' + RUTE_NAMA(f.tujuan) : ''), 182, 17);
    hujanTravel(s, t);
  }
  function RUTE_NAMA(id) { return g.KK_RUTE && g.KK_RUTE.nama ? g.KK_RUTE.nama(id) : id; }
  /* jalan raya antarkota (Continuous Biome Morphing + GTA V HD + Puddles & Splash) */
  function gambarJalanTravel(s, t, dt) {
    var f = s.travel, m = s.menit % 1440, G = geomTravel(s), hor = G.hor, jt = G.jalanTop, u = f.u;
    var knd = f.kondisi || (f.tol ? 'tol' : 'mulus');
    var temaAkt = u < 0.48 ? f.temaA : f.temaB;
    var txR = null, tekR = '';
    if (u < 0.2) { txR = 230 - u / 0.2 * 300; tekR = 'Keluar ' + RUTE_NAMA(f.dari).slice(0, 14); }
    else if (u > 0.82) { txR = 240 - (u - 0.82) / 0.18 * 280; tekR = 'Menuju ' + RUTE_NAMA(f.ke).slice(0, 15); }
    var carX = W * 0.46, carY = G.carY;
    var st = gambarJalanHD(s, t, dt || 16, {
      hor: hor, jalanTop: jt, kmh: f.kmh || 40, u: u, sk: G.sk,
      kondisi: knd, medan: (f.lokSekarang && f.lokSekarang.medan) || '', tema: temaAkt,
      ikonAsal: f.dari, ikonTujuan: f.ke, rambuX: txR, rambuTeks: tekR,
      isCar: true, vehX: carX, vehY: carY, frontTireX: carX + 26, rearTireX: carX - 26, tireY: carY + 2
    });
    var gp = st.gp, goyang = st.goyang, mob = s.mobil || { bentuk: 'mpv', id: 'avanza' };
    var sx = -90 + ((t * (0.02 + (f.kmh || 30) * 0.0004)) % (W + 300));
    gambarMobil(sx, jt + 24, ['mpv', 'hatch', 'suv'][Math.floor(t / 11000) % 3], ['avanza', 'agya', 'rush'][Math.floor(t / 11000) % 3], false, t * 0.014, gp);
    gambarBloomLampuRem(carX - 44, carY - 14 + goyang, gp);
    gambarMobil(carX, carY + goyang, mob.bentuk, mob.id, false, st.wheel, gp);
    pencahayaanLuar(m, t, jt, carX + 46, carY - 20 + goyang, !!s.biled);
    gambarCipratanHD(dt || 16);
    if ((f.kmh || 0) > 58) {
      cx.strokeStyle = 'rgba(255,255,255,' + Math.min(0.45, ((f.kmh || 0) - 58) / 145).toFixed(2) + ')'; cx.lineWidth = 1.5;
      for (var sl = 0; sl < 7; sl++) {
        var ly = jt + 12 + acak(sl + 31) * 50, lx = ((t * (0.5 + (f.kmh || 40) / 100) + sl * 97) % (W + 100));
        cx.beginPath(); cx.moveTo(W - lx, ly); cx.lineTo(W - lx + 28 + (f.kmh || 40) / 4, ly); cx.stroke();
      }
    }
    gambarHujanRealistis(s, t, jt, 0);
    teksTengah(RUTE_NAMA(f.dari) + ' → ' + RUTE_NAMA(f.ke), 178, 15.5);
  }
  function gambarKapalTravel(s, t) {
    var f = s.travel, m = s.menit % 1440, gp = gelap(m), G = geomTravel(s), hor = Math.min(G.hor - 40, H * 0.5);
    gambarLangit(m, t, s);
    var gr = cx.createLinearGradient(0, hor, 0, H); gr.addColorStop(0, 'rgba(120,190,225,1)'); gr.addColorStop(1, 'rgba(30,90,140,1)'); cx.fillStyle = gr; cx.fillRect(0, hor, W, H - hor);
    ikonKota(f.dari === 'bakauheni' ? 'bakauheni' : 'merak', 60 - f.u * 200, hor + 2, G.sk, gp); ikonKota(f.ke === 'merak' ? 'merak' : 'bakauheni', 330 + (1 - f.u) * 260, hor + 2, G.sk, gp);
    var gl = Math.sin(t / 700) * 3, y0 = G.bawah - 40 + gl;
    poli([40, y0, 320, y0, 296, y0 + 30, 64, y0 + 30], '#e8e4da'); poli([40, y0, 320, y0, 316, y0 - 8, 44, y0 - 8], '#d9553a'); kotak(226, y0 - 46, 64, 38, '#f6f3ea'); kotak(232, y0 - 38, 50, 9, '#5b7a8a'); kotak(250, y0 - 62, 14, 18, '#d9553a');
    var mob = s.mobil || { bentuk: 'mpv', id: 'avanza' }; gambarMobil(130, y0 - 6, mob.bentuk, mob.id, false, 0, gp);
    cx.strokeStyle = 'rgba(255,255,255,.6)'; cx.lineWidth = 2; for (var w4 = 0; w4 < 9; w4++) { var wx = ((w4 * 52 - t * 0.05) % (W + 60) + W + 60) % (W + 60) - 30, wy = y0 + 36 + (w4 % 4) * 12; cx.beginPath(); cx.moveTo(wx, wy); cx.quadraticCurveTo(wx + 8, wy - 4, wx + 16, wy); cx.stroke(); }
    selimutMalam(gp, 0.36); hujanTravel(s, t);
    teksTengah('Kapal ' + RUTE_NAMA(f.dari) + ' → ' + RUTE_NAMA(f.ke), 182, 16);
  }

  /* perjalanan pulang atau berangkat antar tempat (Peta, Pulang, Kantor, Pindah Domisili): GTA V HD + genangan & cipratan + kecepatan dinamis */
  function gambarPerjalanan(s, t, dt) {
    var f = s.transit, m = s.menit % 1440, jalan = H * 0.60, hor = jalan - 32;
    var kaki = f.kend === 'kaki', isCar = f.kend === 'mobil';
    var kmh = f.kmh != null ? f.kmh : (kaki ? 4.5 : (isCar ? 48 : 38));
    var vehX = isCar ? W * 0.46 : (kaki ? W * 0.45 : W * 0.42);
    var vehY = isCar ? jalan + 72 : (kaki ? jalan + 4 : jalan + 54);
    var st = gambarJalanHD(s, t, dt || 16, {
      hor: hor, jalanTop: jalan, kmh: kmh,
      kondisi: f.kondisi || 'mulus', medan: f.medan || (f.lokSekarang && f.lokSekarang.medan) || '',
      tier: s.tierWilayah || 'kota', isCar: isCar, vehX: kaki ? null : vehX, vehY: kaki ? null : vehY,
      frontTireX: kaki ? null : (isCar ? vehX + 26 : vehX + 16),
      rearTireX: kaki ? null : (isCar ? vehX - 26 : vehX - 16),
      tireY: vehY + 4
    });
    var gp = st.gp, goyang = st.goyang;
    if (kaki) anim.pejalan.forEach(function (pj) { gambarPejalanKaki(pj, jalan - 14, t, s.hujan); });
    if (!kaki) {
      var siklus2 = Math.floor((t * 0.03) / (W + 260)) % 3;
      var sx = W + 80 - ((t * 0.03) % (W + 260));
      gambarMobil(sx, jalan + 122, ['mpv', 'hatch', 'suv'][siklus2], ['avanza', 'agya', 'rush'][siklus2], false, t * 0.012, gp);
    }
    if (isCar) {
      var mob = s.mobil || { bentuk: 'mpv', id: 'avanza' };
      gambarBloomLampuRem(vehX - 44, vehY - 14 + goyang, gp);
      gambarMobil(vehX, vehY + goyang, mob.bentuk, mob.id, false, st.wheel, gp, !!f.bawaDus);
    } else if (kaki) {
      gambarKarakterRumah(vehX, vehY, s.gender === 'cowok' ? 'cowok' : 'cewek', t, { skala: 0.56, jalan: true, baju: s.warnaBaju || '#2b6cb0', tampilan: s.tampilan, label: s.namaPemain || 'Kamu' });
    } else {
      gambarBloomLampuRem(vehX - 22, vehY - 18 + goyang, gp);
      gambarMotorKu(vehX, vehY - 4 + goyang, f.kend === 'motor' ? s.motorId : 'beat', { naik: true, jalan: true, baju: s.warnaBaju, bawaDus: !!f.bawaDus, bonceng: (f.kend === 'ojek' || f.kend === 'teman') && !f.bawaDus }, t);
    }
    pencahayaanLuar(m, t, jalan, kaki ? null : (isCar ? vehX + 46 : vehX + 28), kaki ? null : (isCar ? vehY - 18 + goyang : vehY - 26 + goyang), !!s.biled);
    gambarCipratanHD(dt || 16);
    gambarHujanRealistis(s, t, jalan, 0);
    var kePulang = f.ke === 'kos';
    var judulTr = f.pindahWilayah ? ('🚚 Pindah ke ' + (f.tujuanNama || 'Wilayah Baru'))
      : f.ke === 'kantor' ? ('🏢 Berangkat ke ' + (f.kantorNama || 'Kantor'))
      : f.ke === 'peta' ? ((kaki ? '🚶 ' : f.kend === 'teman' ? '🤝 ' : isCar ? '🚗 ' : '🏍️ ') + (f.tujuanNama || 'Menuju Lokasi'))
      : kePulang ? '🏠 Pulang ke Rumah' : '🏍️ Berangkat Narik';
    teksTengah(judulTr, 178, 15.5);
  }

  /* ---------- P62: Adegan Aktivitas Hidup (SPBU, Warung Makan Ramai, Masjid Sholat, Bengkel, Mall, RS, Taman, & Pesawat Wisata LN) ---------- */
  function gambarAktivitas(s, t) {
    var A = s.aktAnim || { jenis: 'makan', u: 0, judul: 'Aktivitas', sub: '' };
    var u = Math.max(0, Math.min(1, A.u || 0)), m = (s.menit || 600) % 1440, gp = gelap(m);
    var tpP = s.tampilan || tampilanDariNama(s.namaPemain || 'Kamu', s.gender || 'cewek', false);
    var bajuP = s.warnaBaju || '#00aa13';
    var judul = A.judul || 'Aktivitas', sub = A.sub || '';
    var yTanah = Math.round(H * 0.66);

    if (A.jenis === 'spbu') {
      /* SPBU Pertamina + Petugas berseragam merah mengisi BBM ke motor/mobil */
      gambarLangit(m, t, s);
      var grSpW = cx.createLinearGradient(0, yTanah - 140, 0, yTanah);
      grSpW.addColorStop(0, '#f1f5f9'); grSpW.addColorStop(1, '#cbd5e1');
      cx.fillStyle = grSpW; cx.fillRect(0, yTanah - 140, W, 140);
      var grSpF = cx.createLinearGradient(0, yTanah, 0, H);
      grSpF.addColorStop(0, '#475569'); grSpF.addColorStop(1, '#1e293b');
      cx.fillStyle = grSpF; cx.fillRect(0, yTanah, W, H - yTanah);
      if (texAspalHD) { for (var gxSp = 0; gxSp < W; gxSp += 160) cx.drawImage(texAspalHD, gxSp, yTanah, 160, Math.min(200, H - yTanah)); }
      /* Kanopi ikonik SPBU merah-putih-biru */
      kotak(18, yTanah - 210, W - 36, 42, '#dc2626');
      kotak(18, yTanah - 172, W - 36, 9, '#ffffff');
      kotak(18, yTanah - 163, W - 36, 6, '#1d4ed8');
      cx.font = '800 13px "Baloo 2", sans-serif'; cx.fillStyle = '#fff'; cx.textAlign = 'center';
      cx.fillText('PERTAMINA · PASTI PAS!', W / 2, yTanah - 186);
      /* Tiang kanopi & pulau dispenser */
      kotak(56, yTanah - 160, 14, 160, '#cbd5e1'); kotak(W - 70, yTanah - 160, 14, 160, '#cbd5e1');
      kotakBulat(88, yTanah - 102, 54, 102, 6, '#dc2626');
      kotakBulat(94, yTanah - 94, 42, 34, 4, '#0f172a');
      var literNow = ((A.liter || 3) * u).toFixed(1).replace('.', ',');
      cx.font = '800 10px monospace'; cx.fillStyle = '#4ade80'; cx.textAlign = 'center';
      cx.fillText(literNow + (A.ev ? ' kWh' : ' L'), 115, yTanah - 74);
      cx.fillStyle = '#facc15'; cx.fillText(A.bbmNama || 'BBM', 115, yTanah - 63);
      kotak(82, yTanah - 6, 68, 12, '#94a3b8');
      /* Kendaraan pemain sedang diisi BBM */
      var isMbl = !!A.mobil && s.mobil;
      if (isMbl) gambarMobil(242, yTanah + 22, s.mobil.bentuk, s.mobil.id, false, 0, gp);
      else gambarMotorKu(238, yTanah + 4, s.motorId || 'beat', { kiri: true, baju: bajuP }, t);
      /* Petugas SPBU berseragam merah-hitam memegang nozzle */
      var gerakTangan = Math.sin(t / 220) * 2.5;
      gambarKarakterRumah(166, yTanah + 6, 'cowok', t, { skala: 0.56, baju: '#dc2626', celana: '#1e293b', label: 'Petugas' });
      /* Selang hitam melengkung dari dispenser ke tangki */
      cx.strokeStyle = '#111827'; cx.lineWidth = 3.2; cx.beginPath();
      cx.moveTo(142, yTanah - 58); cx.quadraticCurveTo(168, yTanah - 12, isMbl ? 204 : 220, yTanah - 16 + gerakTangan); cx.stroke();
      /* Karakter pemain menunggu di samping */
      gambarKarakterRumah(292, yTanah + 8, s.gender || 'cewek', t, { skala: 0.54, baju: bajuP, tampilan: tpP, label: s.namaPemain || 'Kamu' });
      if (gp > 0) { cx.fillStyle = 'rgba(10,18,45,' + (gp * 0.22).toFixed(2) + ')'; cx.fillRect(0, 0, W, H); }
      judul = A.judul || '⛽ Mengisi BBM di SPBU';
      sub = (A.bbmNama || 'Pertalite') + ' · ' + literNow + (A.ev ? ' kWh' : ' L') + ' (' + Math.round(u * 100) + '%)';
    } else if (A.jenis === 'makan') {
      /* Warung Makan / Sentra Kuliner Ramai + Karakter Duduk Makan */
      kotak(0, 0, W, yTanah, '#f4ebd9');
      kotak(0, 0, W, 86, '#b45309'); /* atap tenda warung */
      for (var st = 0; st < W; st += 32) kotak(st, 80, 16, 10, '#f59e0b');
      kotak(0, yTanah, W, H - yTanah, '#d6c7b2');
      /* Papan menu warung & lampu gantung hangat */
      kotakBulat(54, yTanah - 205, 252, 42, 6, '#1e293b');
      cx.font = '800 13px "Baloo 2", sans-serif'; cx.fillStyle = '#fde68a'; cx.textAlign = 'center';
      cx.fillText('🍲 WARUNG KULINER NUSANTARA', W / 2, yTanah - 179);
      /* Etalase kaca makanan di belakang */
      kotakBulat(28, yTanah - 135, 130, 74, 5, '#e2e8f0');
      kotak(34, yTanah - 128, 118, 28, '#bae6fd'); kotak(34, yTanah - 94, 118, 26, '#bae6fd');
      for (var pr = 0; pr < 4; pr++) { bulat(48 + pr * 28, yTanah - 104, 8, '#f59e0b'); bulat(48 + pr * 28, yTanah - 74, 8, '#ef4444'); }
      /* Pengunjung lain ramai makan di latar */
      gambarKarakterRumah(212, yTanah - 26, 'cowok', t + 400, { skala: 0.44, baju: '#2563eb', label: 'Warga 1' });
      gambarKarakterRumah(268, yTanah - 26, 'cewek', t + 900, { skala: 0.44, baju: '#db2777', label: 'Warga 2' });
      gambarKarakterRumah(316, yTanah - 22, 'cowok', t + 1400, { skala: 0.45, baju: '#059669', label: 'Warga 3' });
      kotakBulat(194, yTanah - 46, 140, 10, 3, '#78350f');
      /* Meja utama pemain di depan + uap hangat makanan + gerakan menyuap */
      var suap = Math.sin(t / 260) * 3.5;
      gambarKarakterRumah(150, yTanah + 58, s.gender || 'cewek', t, { skala: 0.72, baju: bajuP, tampilan: tpP, label: s.namaPemain || 'Kamu' });
      kotakBulat(84, yTanah + 6, 152, 16, 4, '#92400e');
      kotak(94, yTanah + 22, 8, 56, '#78350f'); kotak(218, yTanah + 22, 8, 56, '#78350f');
      /* Piring makanan, minuman & kepulan asap panas */
      cx.fillStyle = '#fff'; cx.beginPath(); cx.ellipse(150, yTanah + 4, 22, 7, 0, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = '#ea580c'; cx.beginPath(); cx.ellipse(150, yTanah + 2, 15, 4.5, 0, 0, Math.PI * 2); cx.fill();
      kotakBulat(186, yTanah - 14, 14, 20, 3, '#38bdf8');
      cx.strokeStyle = 'rgba(255,255,255,.75)'; cx.lineWidth = 2;
      for (var up = 0; up < 3; up++) {
        var yu = ((t / 28 + up * 12) % 24);
        cx.beginPath(); cx.moveTo(142 + up * 8, yTanah - 4 - yu); cx.quadraticCurveTo(146 + up * 8, yTanah - 10 - yu, 141 + up * 8, yTanah - 16 - yu); cx.stroke();
      }
      /* Sendok naik-turun */
      cx.strokeStyle = '#cbd5e1'; cx.lineWidth = 2.4; cx.beginPath(); cx.moveTo(156, yTanah - 4 + suap); cx.lineTo(168, yTanah - 18 + suap); cx.stroke();
      sub = (A.sub || 'Menikmati hidangan hangat...') + ' · ' + Math.round(u * 100) + '%';
    } else if (A.jenis === 'ibadah') {
      /* Interior Masjid / Tempat Ibadah yang tenang + adegan sholat / berdoa */
      kotak(0, 0, W, yTanah, '#ecfdf5');
      /* Lengkungan Mihrab emas-zamrud */
      cx.fillStyle = '#047857';
      cx.beginPath(); cx.moveTo(95, yTanah); cx.lineTo(95, yTanah - 175); cx.quadraticCurveTo(W / 2, yTanah - 255, W - 95, yTanah - 175); cx.lineTo(W - 95, yTanah); cx.closePath(); cx.fill();
      cx.strokeStyle = '#f59e0b'; cx.lineWidth = 4; cx.stroke();
      /* Karpet sajadah hijau dengan garis shaf */
      kotak(0, yTanah, W, H - yTanah, '#065f46');
      cx.strokeStyle = 'rgba(250,204,21,.45)'; cx.lineWidth = 2;
      for (var sh = yTanah + 28; sh < H; sh += 36) { cx.beginPath(); cx.moveTo(0, sh); cx.lineTo(W, sh); cx.stroke(); }
      /* Jamaah & pemain sholat khusyuk (gerakan lembut berdiri/ruku/sujud) */
      var gerakI = Math.sin(t / 700);
      var ySujud = gerakI > 0.35 ? 16 : 0;
      gambarKarakterRumah(104, yTanah + 34 + ySujud * 0.7, 'cowok', t, { skala: 0.56, baju: '#f8fafc', celana: '#1e293b', label: 'Jamaah' });
      gambarKarakterRumah(256, yTanah + 34 + ySujud * 0.7, 'cowok', t + 300, { skala: 0.56, baju: '#e2e8f0', celana: '#334155', label: 'Jamaah' });
      gambarKarakterRumah(W / 2, yTanah + 56 + ySujud, s.gender || 'cewek', t, { skala: 0.64, baju: '#ffffff', tampilan: tpP, label: s.namaPemain || 'Kamu' });
      /* Cahaya lembut dari atas */
      var grI = cx.createRadialGradient(W / 2, 120, 10, W / 2, 260, 220);
      grI.addColorStop(0, 'rgba(254,243,199,.32)'); grI.addColorStop(1, 'rgba(254,243,199,0)');
      cx.fillStyle = grI; cx.fillRect(0, 0, W, H);
    } else if (A.jenis === 'bengkel') {
      /* Bengkel Resmi / Perawatan Kendaraan + Mekanik bekerja */
      kotak(0, 0, W, yTanah, '#e2e8f0'); kotak(0, 0, W, 62, '#1e3a8a');
      cx.font = '800 13px "Baloo 2", sans-serif'; cx.fillStyle = '#fff'; cx.textAlign = 'center';
      cx.fillText('🔧 BENGKEL & SERVIS KENDARAAN', W / 2, 42);
      kotak(0, yTanah, W, H - yTanah, '#64748b');
      /* Rak perkakas & oli */
      kotakBulat(24, yTanah - 140, 86, 110, 4, '#334155');
      for (var ro = 0; ro < 4; ro++) { kotak(32 + ro * 18, yTanah - 126, 12, 22, ro % 2 ? '#f59e0b' : '#ef4444'); kotak(32 + ro * 18, yTanah - 90, 12, 22, '#38bdf8'); }
      /* Kendaraan di hidrolik & mekanik */
      kotak(154, yTanah - 16, 140, 12, '#dc2626'); kotak(214, yTanah - 4, 20, 26, '#475569');
      if (A.mobil && s.mobil) gambarMobil(224, yTanah - 14, s.mobil.bentuk, s.mobil.id, false, 0, 0);
      else gambarMotorKu(224, yTanah - 32, s.motorId || 'beat', { kiri: true }, t);
      gambarKarakterRumah(154, yTanah + 24, 'cowok', t, { skala: 0.58, baju: '#1d4ed8', celana: '#1e293b', label: 'Mekanik' });
      gambarKarakterRumah(308, yTanah + 28, s.gender || 'cewek', t, { skala: 0.56, baju: bajuP, tampilan: tpP, label: s.namaPemain || 'Kamu' });
    } else if (A.jenis === 'mall' || A.jenis === 'rs' || A.jenis === 'taman') {
      if (A.jenis === 'taman') {
        gambarLangit(m, t, s);
        kotak(0, yTanah - 40, W, 46, '#22c55e'); kotak(0, yTanah, W, H - yTanah, '#4ade80');
        kotak(0, yTanah + 24, W, 56, '#d6d3d1'); /* jogging track */
        /* Air mancur taman hidup */
        kotakBulat(134, yTanah - 22, 92, 22, 10, '#94a3b8');
        cx.strokeStyle = '#bae6fd'; cx.lineWidth = 3;
        var spT = 18 + Math.sin(t / 180) * 6;
        cx.beginPath(); cx.moveTo(180, yTanah - 22); cx.quadraticCurveTo(162, yTanah - 48 - spT, 148, yTanah - 18);
        cx.moveTo(180, yTanah - 22); cx.quadraticCurveTo(198, yTanah - 48 - spT, 212, yTanah - 18); cx.stroke();
        gambarKarakterRumah(100 + ((t * 0.04) % 180), yTanah + 58, s.gender || 'cewek', t, { skala: 0.58, jalan: true, baju: bajuP, tampilan: tpP, label: s.namaPemain || 'Kamu' });
      } else if (A.jenis === 'rs') {
        kotak(0, 0, W, yTanah, '#f0f9ff'); kotak(0, yTanah, W, H - yTanah, '#e0f2fe');
        kotakBulat(W / 2 - 22, yTanah - 190, 44, 44, 10, '#ef4444');
        kotak(W / 2 - 5, yTanah - 180, 10, 24, '#fff'); kotak(W / 2 - 12, yTanah - 173, 24, 10, '#fff');
        gambarKarakterRumah(136, yTanah + 36, 'cowok', t, { skala: 0.62, baju: '#ffffff', celana: '#334155', label: 'Dokter' });
        gambarKarakterRumah(232, yTanah + 36, s.gender || 'cewek', t, { skala: 0.62, baju: bajuP, tampilan: tpP, label: s.namaPemain || 'Kamu' });
      } else {
        /* Mall modern */
        kotak(0, 0, W, yTanah, '#fdf4ff'); kotak(0, yTanah, W, H - yTanah, '#e2e8f0');
        kotakBulat(20, yTanah - 170, 104, 150, 8, '#e0e7ff'); kotakBulat(134, yTanah - 170, 104, 150, 8, '#fce7f3'); kotakBulat(248, yTanah - 170, 96, 150, 8, '#fef3c7');
        cx.font = '800 12px "Baloo 2", sans-serif'; cx.fillStyle = '#4c1d95'; cx.textAlign = 'center';
        cx.fillText('🛍️ GRAND MALL NUSANTARA', W / 2, yTanah - 186);
        gambarKarakterRumah(118, yTanah + 36, 'cewek', t, { skala: 0.52, jalan: true, baju: '#db2777', label: 'Pengunjung' });
        gambarKarakterRumah(210, yTanah + 46, s.gender || 'cewek', t, { skala: 0.60, jalan: true, baju: bajuP, tampilan: tpP, label: s.namaPemain || 'Kamu' });
      }
    } else if (A.jenis === 'pesawat') {
      /* Wisata Luar Negeri / Umrah: 3 Tahap Realistis (Bandara/PLBN → Pesawat di Atas Awan → Negara Tujuan!) */
      var dest = A.dest || 'sg';
      var darat = dest === 'kuching';
      if (u < 0.30) {
        /* Tahap 1: Terminal Bandara Internasional / PLBN Perbatasan */
        kotak(0, 0, W, yTanah - 40, '#bae6fd'); kotak(0, yTanah - 40, W, H - yTanah + 40, '#e2e8f0');
        kotak(0, yTanah - 180, W, 120, '#38bdf8');
        cx.strokeStyle = '#64748b'; cx.lineWidth = 3;
        for (var gx = 36; gx < W; gx += 60) { cx.beginPath(); cx.moveTo(gx, yTanah - 180); cx.lineTo(gx, yTanah - 60); cx.stroke(); }
        kotakBulat(44, yTanah - 216, 272, 28, 6, '#0f172a');
        cx.font = '800 11.5px "Baloo 2", sans-serif'; cx.fillStyle = '#facc15'; cx.textAlign = 'center';
        cx.fillText(darat ? '🛂 PLBN ENTIKONG / ARUK · KALBAR – SARAWAK' : '🛫 TERMINAL KEBERANGKATAN · GATE A2', W / 2, yTanah - 198);
        if (!darat) {
          /* Pesawat parkir di luar kaca bandara */
          kotakBulat(160, yTanah - 115, 140, 22, 11, '#ffffff');
          cx.fillStyle = '#0284c7'; cx.beginPath(); cx.moveTo(166, yTanah - 115); cx.lineTo(150, yTanah - 144); cx.lineTo(182, yTanah - 115); cx.closePath(); cx.fill();
        }
        gambarKarakterRumah(136 + u * 180, yTanah + 34, s.gender || 'cewek', t, { skala: 0.60, jalan: true, baju: bajuP, tampilan: tpP, label: s.namaPemain || 'Kamu' });
        kotakBulat(162 + u * 180, yTanah + 12, 18, 24, 4, '#2563eb'); /* koper roda */
        sub = darat ? 'Pemeriksaan Paspor Imigrasi PLBN...' : 'Boarding pesawat di Bandara Internasional...';
      } else if (u < 0.68) {
        /* Tahap 2: Terbang di Atas Awan dengan Pesawat / Jalan Raya Borneo */
        var grFly = cx.createLinearGradient(0, 0, 0, H);
        grFly.addColorStop(0, '#0284c7'); grFly.addColorStop(0.6, '#7dd3fc'); grFly.addColorStop(1, '#e0f2fe');
        cx.fillStyle = grFly; cx.fillRect(0, 0, W, H);
        /* Awan bergerak cepat dari kanan ke kiri */
        for (var aw = 0; aw < 7; aw++) {
          var ax = W + 80 - (((t * 0.14 + aw * 95) % (W + 160)));
          var ay = 260 + (aw % 4) * 58;
          bulat(ax, ay, 28, 'rgba(255,255,255,.92)'); bulat(ax + 24, ay - 6, 32, 'rgba(255,255,255,.95)'); bulat(ax + 50, ay + 2, 24, 'rgba(255,255,255,.9)');
        }
        if (darat) {
          kotak(0, yTanah, W, H - yTanah, '#334155');
          var gmK = (t * 0.35) % 60; cx.fillStyle = '#fde047'; for (var xk = -60; xk < W + 60; xk += 60) cx.fillRect(xk - gmK, yTanah + 46, 30, 4);
          gambarMobil(W * 0.48, yTanah + 36, (s.mobil && s.mobil.bentuk) || 'mpv', (s.mobil && s.mobil.id) || 'avanza', false, t * 0.02, 0);
          sub = 'Menyusuri jalan lintas negara menuju Kuching, Sarawak...';
        } else {
          /* Pesawat jet komersial terbang meluncur halus */
          var yp = H * 0.44 + Math.sin(t / 420) * 8;
          /* Contrail putih */
          cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = 5;
          cx.beginPath(); cx.moveTo(0, yp + 6); cx.lineTo(130, yp + 4); cx.stroke();
          /* Sayap & badan pesawat */
          cx.fillStyle = '#cbd5e1'; cx.beginPath(); cx.moveTo(155, yp - 4); cx.lineTo(130, yp - 42); cx.lineTo(160, yp - 42); cx.lineTo(192, yp - 4); cx.closePath(); cx.fill();
          kotakBulat(118, yp - 14, 152, 26, 13, '#ffffff');
          cx.fillStyle = '#0284c7'; cx.beginPath(); cx.moveTo(126, yp - 14); cx.lineTo(106, yp - 48); cx.lineTo(146, yp - 14); cx.closePath(); cx.fill();
          kotak(138, yp - 4, 114, 5, '#0284c7');
          for (var jn = 0; jn < 9; jn++) bulat(148 + jn * 11, yp - 7, 2.2, '#38bdf8');
          cx.fillStyle = '#94a3b8'; cx.beginPath(); cx.moveTo(165, yp + 6); cx.lineTo(142, yp + 46); cx.lineTo(172, yp + 46); cx.lineTo(200, yp + 6); cx.closePath(); cx.fill();
          sub = '✈️ Di dalam pesawat melintasi awan (35.000 kaki)...';
        }
      } else {
        /* Tahap 3: Tiba di Negara Tujuan! */
        gambarLangit(660, t, s);
        kotak(0, yTanah, W, H - yTanah, dest === 'umrah' ? '#f8fafc' : '#cbd5e1');
        if (dest === 'umrah') {
          /* Masjidil Haram & Ka'bah */
          kotak(36, yTanah - 150, 26, 150, '#e7e5e4'); kotak(W - 62, yTanah - 150, 26, 150, '#e7e5e4');
          kotak(W / 2 - 42, yTanah - 94, 84, 94, '#111827');
          kotak(W / 2 - 42, yTanah - 74, 84, 10, '#eab308'); /* Kiswah emas */
          sub = '🕋 Beribadah khusyuk di depan Ka\'bah, Masjidil Haram!';
        } else if (dest === 'jepang') {
          /* Gunung Fuji, Sakura & Gerbang Torii */
          cx.fillStyle = '#64748b'; cx.beginPath(); cx.moveTo(30, yTanah); cx.lineTo(180, yTanah - 165); cx.lineTo(330, yTanah); cx.closePath(); cx.fill();
          cx.fillStyle = '#ffffff'; cx.beginPath(); cx.moveTo(138, yTanah - 118); cx.lineTo(180, yTanah - 165); cx.lineTo(222, yTanah - 118); cx.closePath(); cx.fill();
          kotak(126, yTanah - 86, 10, 86, '#dc2626'); kotak(224, yTanah - 86, 10, 86, '#dc2626');
          kotak(110, yTanah - 94, 140, 10, '#dc2626'); kotak(120, yTanah - 74, 120, 7, '#dc2626');
          for (var sk = 0; sk < 14; sk++) bulat((sk * 31 + t * 0.04) % W, (sk * 27 + t * 0.03) % yTanah, 3, '#fbcfe8');
          sub = '🇯🇵 Tiba di Jepang! Menikmati Sakura & Gunung Fuji!';
        } else if (dest === 'sg') {
          /* Marina Bay Sands & Merlion */
          kotak(72, yTanah - 150, 34, 150, '#475569'); kotak(122, yTanah - 150, 34, 150, '#475569'); kotak(172, yTanah - 150, 34, 150, '#475569');
          kotakBulat(58, yTanah - 162, 166, 14, 7, '#0ea5e9');
          kotak(0, yTanah - 18, W, 24, '#38bdf8');
          sub = '🇸🇬 Tiba di Marina Bay & Merlion Park, Singapura!';
        } else {
          /* Kuching Waterfront & Sungai Sarawak */
          kotak(0, yTanah - 24, W, 32, '#0ea5e9');
          cx.strokeStyle = '#f59e0b'; cx.lineWidth = 4; cx.beginPath(); cx.moveTo(40, yTanah - 24); cx.quadraticCurveTo(180, yTanah - 104, 320, yTanah - 24); cx.stroke();
          sub = '🇲🇾 Tiba di Kuching Waterfront, Sarawak Malaysia!';
        }
        gambarKarakterRumah(W / 2, yTanah + 52, s.gender || 'cewek', t, { skala: 0.62, baju: dest === 'umrah' ? '#ffffff' : bajuP, tampilan: tpP, label: s.namaPemain || 'Kamu' });
      }
    }

    /* Banner judul & progres bar di atas adegan */
    teksTengah(judul, 174, 16.5);
    if (sub) teksTengah(sub, 198, 12.2);
    kotakBulat(60, 218, 240, 8, 4, 'rgba(15,23,42,.48)');
    kotakBulat(60, 218, Math.max(8, 240 * u), 8, 4, A.jenis === 'spbu' ? '#ef4444' : A.jenis === 'ibadah' ? '#10b981' : A.jenis === 'pesawat' ? '#38bdf8' : '#f59e0b');
  }
  /* adegan kerja kantoran live (waktu bergerak cepat 24x dari jam masuk s/d 17.00) */
  function gambarKantor(s, t) {
    var m = s.menit % 1440, K = s.kerjaAnim || { u: 0, kantor: 'Kantor', peran: 'Karyawan', pulang: 17 };
    var lantai = Math.round(H * 0.58);
    /* dinding kantor modern & lantai granit */
    kotak(0, 0, W, lantai, '#e8edf2');
    kotak(0, lantai - 6, W, 6, '#94a3b8');
    kotak(0, lantai, W, H - lantai, '#cfd8e3');
    cx.strokeStyle = 'rgba(255,255,255,.35)'; cx.lineWidth = 1;
    for (var uy = lantai + 26; uy < H; uy += 28) { cx.beginPath(); cx.moveTo(0, uy); cx.lineTo(W, uy); cx.stroke(); }
    /* jendela besar gedung perkantoran (langit berubah real-time 08.00 → 17.00!) */
    kotak(32, lantai - 176, 200, 118, '#334155');
    gambarPemandanganJendela('skyline', 36, lantai - 172, 192, 110, m);
    kotak(130, lantai - 176, 4, 118, '#334155');
    /* jam dinding kantor berputar mengikuti waktu nyata */
    bulat(292, lantai - 134, 24, '#ffffff');
    cx.strokeStyle = '#334155'; cx.lineWidth = 2.4; cx.beginPath(); cx.arc(292, lantai - 134, 24, 0, Math.PI * 2); cx.stroke();
    var angJam = ((m / 60) % 12) / 12 * Math.PI * 2 - Math.PI / 2;
    var angMnt = (m % 60) / 60 * Math.PI * 2 - Math.PI / 2;
    cx.strokeStyle = '#1e293b'; cx.lineWidth = 2.6; cx.lineCap = 'round';
    cx.beginPath(); cx.moveTo(292, lantai - 134); cx.lineTo(292 + Math.cos(angJam) * 11, lantai - 134 + Math.sin(angJam) * 11); cx.stroke();
    cx.strokeStyle = '#2563eb'; cx.lineWidth = 1.8;
    cx.beginPath(); cx.moveTo(292, lantai - 134); cx.lineTo(292 + Math.cos(angMnt) * 17, lantai - 134 + Math.sin(angMnt) * 17); cx.stroke();
    bulat(292, lantai - 134, 2.2, '#ef4444');
    /* rak dokumen & tanaman kantor */
    kotakBulat(254, lantai - 86, 86, 86, 4, '#64748b');
    kotak(262, lantai - 76, 70, 16, '#e2e8f0'); kotak(262, lantai - 52, 70, 16, '#cbd5e1'); kotak(262, lantai - 28, 70, 18, '#e2e8f0');
    kotak(266, lantai - 74, 10, 14, '#2563eb'); kotak(279, lantai - 74, 10, 14, '#10b981'); kotak(292, lantai - 74, 10, 14, '#f59e0b');
    /* karakter bekerja di meja kantor memakai pakaian aktif (s.warnaBaju) */
    var tpK = s.tampilan || tampilanDariNama(s.namaPemain || 'Kamu', s.gender || 'cewek', false);
    var bajuK = s.warnaBaju || '#1e293b';
    var ketik = Math.sin(t / 110) * 2;
    kotakBulat(144, lantai - 16, 48, 44, 10, '#1e293b'); /* sandaran kursi kantor */
    kotakBulat(146, lantai + 2, 44, 48, 10, bajuK);
    gambarKepalaPotret(168, lantai - 14 + Math.sin(t / 500) * 1.2, 18, s.gender || 'cewek', tpK, { tanpaLeher: false, baju: bajuK });
    /* meja kerja, monitor PC & cangkir kopi */
    kotakBulat(64, lantai + 26, 232, 14, 4, '#8d6e63');
    kotak(74, lantai + 40, 10, 62, '#5d4037'); kotak(276, lantai + 40, 10, 62, '#5d4037');
    kotakBulat(118, lantai - 22, 72, 44, 4, '#0f172a');
    kotak(122, lantai - 18, 64, 36, '#1e3a8a');
    for (var ln = 0; ln < 4; ln++) kotak(128, lantai - 12 + ln * 7, 26 + ((ln * 17 + Math.floor(t / 240)) % 28), 3.2, ln % 2 ? '#38bdf8' : '#a7f3d0');
    kotak(150, lantai + 22, 8, 6, '#334155'); kotakBulat(138, lantai + 25, 32, 4, 2, '#334155');
    kotakBulat(198, lantai + 18 + ketik * 0.4, 34, 8, 2, '#334155'); /* keyboard */
    kotakBulat(246, lantai + 12, 14, 14, 3, '#f8fafc'); /* cangkir kopi kantor */
    pencahayaanRuangan(m, false, t);
    /* overlay progres kerja */
    var jjK = ('0' + Math.floor(m / 60)).slice(-2) + '.' + ('0' + Math.floor(m % 60)).slice(-2);
    teksTengah('🏢 ' + (K.kantor || 'Kantor'), 176, 17);
    teksTengah((K.peran || 'Bekerja') + ' · ' + jjK + ' → ' + (K.pulang || 17) + '.00', 200, 12.5);
    kotakBulat(60, 218, 240, 8, 4, 'rgba(15,23,42,.45)');
    kotakBulat(60, 218, Math.max(8, 240 * Math.min(1, K.u || 0)), 8, 4, '#38bdf8');
  }
  var kotakKedai = null, kotakBarista = null, tAkhir = 0;
  /* s: { menit, buka (bool), kecepatan } */
  /* suasana Ramadan: bulan sabit, bintang, lentera bergoyang di tali */
  function hiasRamadan(s, t) {
    cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0);
    var m = s.menit % 1440, malam = m >= 1080 || m < 330, a = malam ? 1 : 0.55;
    cx.save(); cx.globalAlpha = a;
    /* bulan sabit */
    cx.fillStyle = '#ffe9a6'; cx.beginPath(); cx.arc(318, 214, 15, 0, Math.PI * 2); cx.fill();
    cx.globalCompositeOperation = 'destination-out'; cx.beginPath(); cx.arc(325, 209, 13, 0, Math.PI * 2); cx.fill(); cx.globalCompositeOperation = 'source-over';
    for (var i = 0; i < 5; i++) { cx.globalAlpha = a * (0.4 + 0.6 * Math.abs(Math.sin(t / 600 + i * 1.7))); cx.fillStyle = '#fff6c8'; cx.beginPath(); cx.arc(268 + i * 15, 204 + (i % 2) * 14, 1.8, 0, 7); cx.fill(); }
    cx.globalAlpha = 1;
    /* tali lentera */
    cx.strokeStyle = 'rgba(80,50,20,.55)'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(0, 196); cx.quadraticCurveTo(W / 2, 214, W, 196); cx.stroke();
    var warna = ['#e8433f', '#f2a516', '#1f8a80', '#e8433f', '#f2a516', '#1f8a80', '#e8433f'];
    for (var j = 0; j < 7; j++) {
      var x = 26 + j * 51, yT = 196 + Math.sin((x / W) * Math.PI) * 9, sw = Math.sin(t / 700 + j) * 4;
      cx.strokeStyle = 'rgba(80,50,20,.6)'; cx.beginPath(); cx.moveTo(x, yT); cx.lineTo(x + sw, yT + 14); cx.stroke();
      cx.fillStyle = warna[j]; cx.beginPath(); cx.moveTo(x + sw - 6, yT + 18); cx.lineTo(x + sw, yT + 12); cx.lineTo(x + sw + 6, yT + 18); cx.lineTo(x + sw + 5, yT + 30); cx.lineTo(x + sw - 5, yT + 30); cx.closePath(); cx.fill();
      cx.fillStyle = 'rgba(255,240,170,' + (0.55 + 0.35 * Math.sin(t / 260 + j * 2)).toFixed(2) + ')'; cx.fillRect(x + sw - 2, yT + 19, 4, 8);
      if (malam) { var gr = cx.createRadialGradient(x + sw, yT + 23, 0, x + sw, yT + 23, 22); gr.addColorStop(0, 'rgba(255,220,120,.35)'); gr.addColorStop(1, 'rgba(255,220,120,0)'); cx.fillStyle = gr; cx.fillRect(x + sw - 22, yT, 44, 46); }
    }
    cx.restore();
  }
  /* suasana Hari Raya: H-5..H-1 (50% menjelang Lebaran), 2 hari Lebaran penuh (ketupat & lentera), Malam Natal, & Kembang Api Tahun Baru */
  function hiasHariRaya(s, t) {
    cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0);
    var m = s.menit % 1440, malam = m >= 1080 || m < 340;
    if (s.lebaran === 1 || s.lebaran === 2) {
      var penuh = s.lebaran === 2;
      cx.save();
      /* tali hiasan ketupat & janur kuning */
      cx.strokeStyle = penuh ? 'rgba(242,185,35,.8)' : 'rgba(130,180,70,.55)';
      cx.lineWidth = penuh ? 2 : 1.3;
      cx.beginPath(); cx.moveTo(0, 194); cx.quadraticCurveTo(W / 2, 212, W, 194); cx.stroke();
      var jmlK = penuh ? 7 : 4;
      for (var k = 0; k < jmlK; k++) {
        var xk = (W / (jmlK + 1)) * (k + 1), yk = 194 + Math.sin((xk / W) * Math.PI) * 9, swk = Math.sin(t / 650 + k * 1.1) * 3.5;
        cx.strokeStyle = 'rgba(200,175,60,.75)'; cx.lineWidth = 1;
        cx.beginPath(); cx.moveTo(xk, yk); cx.lineTo(xk + swk, yk + 11); cx.stroke();
        /* bentuk ketupat wajik hijau-kuning */
        cx.save(); cx.translate(xk + swk, yk + 19); cx.rotate(Math.PI / 4);
        cx.fillStyle = k % 2 === 0 ? '#7cb342' : '#fbc02d';
        cx.fillRect(-6, -6, 12, 12);
        cx.strokeStyle = '#33691e'; cx.lineWidth = 0.8;
        cx.strokeRect(-6, -6, 12, 12);
        cx.beginPath(); cx.moveTo(-6, 0); cx.lineTo(6, 0); cx.moveTo(0, -6); cx.lineTo(0, 6); cx.stroke();
        cx.restore();
        /* pita ujung ketupat */
        cx.strokeStyle = '#d4e157'; cx.lineWidth = 1.2;
        cx.beginPath(); cx.moveTo(xk + swk, yk + 27); cx.lineTo(xk + swk - 3, yk + 33); cx.moveTo(xk + swk, yk + 27); cx.lineTo(xk + swk + 3, yk + 33); cx.stroke();
        if (penuh && malam) {
          var grL = cx.createRadialGradient(xk + swk, yk + 19, 0, xk + swk, yk + 19, 20);
          grL.addColorStop(0, 'rgba(255,235,120,.38)'); grL.addColorStop(1, 'rgba(255,235,120,0)');
          cx.fillStyle = grL; cx.fillRect(xk + swk - 20, yk, 40, 40);
        }
      }
      if (penuh) {
        /* spanduk tipis Idulfitri di puncak langit */
        kotakBulat(W / 2 - 92, 170, 184, 20, 10, 'rgba(13,92,70,.82)');
        cx.strokeStyle = 'rgba(242,195,55,.85)'; cx.lineWidth = 1;
        cx.strokeRect(W / 2 - 90, 172, 180, 16);
        cx.font = '800 10.5px "Nunito", system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillStyle = '#fff5cc'; cx.fillText('✨ Selamat Hari Raya Idulfitri ✨', W / 2, 180);
      }
      cx.restore();
    }
    if (s.natal) {
      cx.save();
      cx.strokeStyle = 'rgba(40,95,55,.8)'; cx.lineWidth = 2.2;
      cx.beginPath(); cx.moveTo(0, 195); cx.quadraticCurveTo(W / 2, 210, W, 195); cx.stroke();
      var wrN = ['#ff5252', '#ffd740', '#40c4ff', '#69f0ae', '#ff80ab'];
      for (var ni = 0; ni < 11; ni++) {
        var xn = 16 + ni * 32.8, yn = 195 + Math.sin((xn / W) * Math.PI) * 8;
        var kedip = 0.5 + 0.5 * Math.sin(t / 320 + ni * 1.4);
        cx.fillStyle = wrN[ni % wrN.length]; cx.globalAlpha = 0.45 + 0.55 * kedip;
        cx.beginPath(); cx.arc(xn, yn + 4, 3.3, 0, Math.PI * 2); cx.fill();
        if (malam) {
          var grN = cx.createRadialGradient(xn, yn + 4, 0, xn, yn + 4, 14);
          grN.addColorStop(0, wrN[ni % wrN.length]); grN.addColorStop(1, 'rgba(255,255,255,0)');
          cx.globalAlpha = 0.25 * kedip; cx.fillStyle = grN; cx.fillRect(xn - 14, yn - 10, 28, 28);
        }
      }
      cx.globalAlpha = 1;
      cx.restore();
    }
    if (s.tahunBaru) {
      cx.save();
      var wrK = ['#ff5252', '#ffd740', '#40c4ff', '#ea80fc', '#69f0ae'];
      for (var fi = 0; fi < 4; fi++) {
        var siklus = ((t / 1400 + fi * 0.27) % 1);
        var fx = 58 + fi * 82 + Math.sin(fi * 4.2) * 14;
        var fy = 212 + (fi % 2) * 28;
        var rad = 6 + siklus * 38, alpha = Math.max(0, 1 - Math.pow(siklus, 1.5));
        cx.strokeStyle = wrK[fi % wrK.length]; cx.globalAlpha = alpha * 0.9; cx.lineWidth = 1.6;
        for (var sp = 0; sp < 10; sp++) {
          var ang = (sp / 10) * Math.PI * 2 + fi;
          cx.beginPath();
          cx.moveTo(fx + Math.cos(ang) * (rad * 0.45), fy + Math.sin(ang) * (rad * 0.45));
          cx.lineTo(fx + Math.cos(ang) * rad, fy + Math.sin(ang) * rad);
          cx.stroke();
        }
      }
      cx.globalAlpha = 1;
      cx.restore();
    }
  }
  function gambar(s, t) {
    gambarInti(s, t);
    if (!s.hbAnim && cx) {
      gambarAtmosferCuaca(s);
      if (s.ramadan) hiasRamadan(s, t);
      if (s.lebaran || s.natal || s.tahunBaru) hiasHariRaya(s, t);
    }
  }
  function gambarInti(s, t) {
    if (!cx) return;
    var dt = tAkhir ? Math.min(100, t - tAkhir) : 16; tAkhir = t; genderPemain = s.gender || 'cewek';
    if (s) s._dt = dt;
    anim.rolling += ((s.buka ? 1 : 0) - anim.rolling) * Math.min(1, dt / 260);
    if (Math.abs(anim.rolling - (s.buka ? 1 : 0)) < 0.003) anim.rolling = s.buka ? 1 : 0;
    anim.pantulKedai = Math.max(0, anim.pantulKedai - dt / 600);
    anim.pantulBarista = Math.max(0, anim.pantulBarista - dt / 500);
    anim.kedip -= dt; if (anim.kedip < -3400 - Math.random() * 1500) anim.kedip = 140;
    aturMotor(dt, s.menit, s.jalan ? s.kecepatan : 0.4);

    if (s.hbAnim && s.posisi !== 'kos') { cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0); cx.fillStyle = '#2a1a26'; cx.fillRect(0, 0, W, H); gambarAdeganHb(s, t); kotakKedai = null; kotakBarista = null; kotakDepan = null; return; }
    if (s.latarAwal) { cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0); gambarLatarAwal(s, t); kotakKedai = null; kotakBarista = null; kotakDepan = null; return; }
    if (s.pindah) { cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0); gambarPindahan(s, t); kotakKedai = null; kotakBarista = null; kotakDepan = null; return; }
    if (s.kerjaAnim) { cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0); gambarKantor(s, t); kotakKedai = null; kotakBarista = null; kotakDepan = null; return; }
    if (s.aktAnim) { cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0); gambarAktivitas(s, t); kotakKedai = null; kotakBarista = null; kotakDepan = null; return; }
    if (s.transit) { cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0); gambarPerjalanan(s, t, dt); kotakKedai = null; kotakBarista = null; kotakDepan = null; return; }
    if (s.travel) {
      cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0);
      if (s.travel.mode === 'jalan') gambarJalanTravel(s, t, dt); else if (s.travel.mode === 'kapal') gambarKapalTravel(s, t); else gambarPoolTravel(s, t);
      kotakKedai = null; kotakBarista = null; kotakDepan = null; return;
    }
    if (s.ojek && s.ojek.status !== 'standby' && (s.ojek.mode === 'mobil' ? s.mobil : s.motorId)) { cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0); gambarJalanRaya(s, t, dt); kotakKedai = null; kotakBarista = null; kotakDepan = null; return; }
    if (s.posisi === 'kos') { cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0); gambarKos(s, t); kotakKedai = null; kotakBarista = null; kotakDepan = null; return; }
    var jalan = H - 190, trotoar = jalan - 72, dasarRuko = trotoar + 4, dasarKedai = jalan - 20, m = s.menit, yKaki = jalan - 9;
    /* angkat adegan saat panel racik menutupi kaki pembeli */
    var skala = cv.getBoundingClientRect().width / W || 1;
    var targetAngkat = Math.max(0, yKaki + 12 - (H - (s.ruangBawah || 0) / skala));
    anim.angkat += (targetAngkat - anim.angkat) * Math.min(1, dt / 160);
    var f = cv.width / W;
    cx.setTransform(f, 0, 0, f, 0, -anim.angkat * f);
    var gp = gelap(m), tierW = s.tierWilayah || 'kota';
    gambarLangit(m, t, s);
    gambarLatarWilayah(tierW, m, dasarRuko);
    if (s.ramadan) gambarStandTakjil(dasarRuko + 14, m, t);
    if (gp > 0) { cx.fillStyle = 'rgba(10,18,45,' + (gp * 0.38).toFixed(3) + ')'; cx.fillRect(0, 0, W, dasarRuko); }
    gambarJalan(trotoar, jalan, s, t);
    if (tierW === 'desa') kotak(0, trotoar, W, jalan - trotoar, '#7da356');
    /* pejalan kaki lalu-lalang di trotoar */
    anim.pejalan.forEach(function (pj) { gambarPejalanKaki(pj, jalan - 15, t, s.hujan); });
    gambarTiang(dasarKedai, dasarRuko - 270);
    var motorStandby = !!(s.ojek && s.ojek.status === 'standby' && s.ojek.mode !== 'mobil' && s.motorId);
    if (s.berhentiSewa) {
      /* mode driver: saat standby motor, 1 karakter duduk di atas motornya sendiri (bukan 2 karakter dobel!) */
      kotakKedai = { x: 160, y: dasarKedai - 140, w: 192, h: 140, bx: 180, by: dasarKedai - 110, bw: 152, bh: 54 }; kotakBarista = null;
      if (!motorStandby) {
        /* Proporsi manusia realistis sejajar pejalan kaki di trotoar (tidak raksasa) */
        gambarKarakterRumah(196, dasarKedai - 2, s.gender || 'cewek', t, { skala: 0.48, driver: true, baju: s.warnaBaju || '#00aa13', tampilan: s.tampilan, label: s.namaPemain || 'Driver' });
      }
    } else {
      gambarPisang(132, dasarKedai, t);
      kotakKedai = gambarKedai(160, dasarKedai, s, t, m);
      var nyala = s.buka && !s.padam ? Math.max(gp, 0.15) : 0;
      rantaiLampu(29, dasarRuko - 238, kotakKedai.x + 6, kotakKedai.y + 4, nyala, t);
      var wk = s.kayu ? ['#8f5a31', '#a86c3c'] : ['#d9443a', '#2f6fb0'];
      gambarKursi(44, dasarKedai + 4, wk[0]); gambarKursi(88, dasarKedai + 8, wk[1]);
      if ((s.tier || 1) >= 2) { gambarKursi(8, dasarKedai + 10, wk[1]); kotak(20, dasarKedai - 22, 30, 4, s.kayu ? '#b97a46' : '#e8e4da'); }
      kotak(60, dasarKedai - 26, 34, 4, '#e8e4da'); kotak(74, dasarKedai - 22, 4, 24, '#c8c2b4');
    }
    if (gp > 0) { cx.fillStyle = 'rgba(10,18,45,' + (gp * 0.32).toFixed(3) + ')'; cx.fillRect(0, trotoar, W, H - trotoar); }
    var daftar = s.pembeli || [];
    aturPembeli(daftar, s.dMenit || 0, dt);
    kotakDepan = null;
    daftar.slice().sort(function (a, b) { return (b.slot || 0) - (a.slot || 0); }).forEach(function (o) { gambarOrang(o, yKaki, t, m, s.hujan); });
    /* cup terbang dari konter ke tangan pembeli */
    anim.cup = anim.cup.filter(function (c) {
      c.u += dt / 420; var u = Math.min(1, c.u), x = c.x0 + (c.x1 - c.x0) * u, y = kotakKedai.by + kotakKedai.bh - 6 + (yKaki - 30 - kotakKedai.by - kotakKedai.bh + 6) * u - Math.sin(u * Math.PI) * 34;
      gambarCup(x, y, c.menu, 1, c.panas, t);
      if (c.u >= 1) { daftar.forEach(function (o) { if (o.id === c.id) { o.tundaCup = false; o.bawaCup = true; o.lompat = 1; } }); return false; }
      return true;
    });
    anim.teks = anim.teks.filter(function (e) {
      e.umur += dt; var u = e.umur / 1400, y = yKaki - 136 - u * 36;
      cx.globalAlpha = Math.max(0, 1 - Math.max(0, u - 0.6) / 0.4);
      cx.font = '800 16px "Baloo 2", "Nunito", system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.lineWidth = 4; cx.strokeStyle = '#fbfaf6'; cx.strokeText(e.teks, e.x, y); cx.fillStyle = e.warna; cx.fillText(e.teks, e.x, y);
      cx.globalAlpha = 1; return u < 1;
    });
    if (s.kotor > 35) {
      var nSampah = Math.min(8, Math.floor((s.kotor - 35) / 7) + 1);
      for (var si = 0; si < nSampah; si++) {
        var sx = 30 + acak(si + 300) * 260, sy = dasarKedai - 4 + acak(si + 400) * 22;
        if (si % 2) { cx.save(); cx.translate(sx, sy); cx.rotate(1.3); kotak(-4, -5, 8, 10, '#dfeef3'); cx.restore(); } else bulat(sx, sy, 3, '#f3f1ea');
      }
    }
    if (s.mobil) {
      var carStandby = s.ojek && s.ojek.status === 'standby' && s.ojek.mode === 'mobil';
      gambarMobil(carStandby ? 260 : 80, jalan + (carStandby ? 44 : 38), s.mobil.bentuk, s.mobil.id, !carStandby, 0, gelap(m));
    }
    if (motorStandby) {
      /* 1 karakter saja duduk di atas motor sesuai merk & desain aslinya sambil pantau HP menunggu order */
      cx.save(); cx.translate(226, jalan + 24); cx.scale(1.18, 1.18);
      gambarMotorKu(0, 0, s.motorId, { naik: true, hp: true, kiri: true, baju: s.warnaBaju, tampilan: s.tampilan, gender: s.gender }, t);
      cx.restore();
    } else if (s.motorParkir) {
      var bidP = String(s.motorParkir).replace(/-bekas$/, '');
      if (SPORT[bidP] || TRAIL[bidP] || MAXI[bidP] || RETRO[bidP]) gambarMotorKu(296, jalan + 28, s.motorParkir, { kiri: true }, t);
      else gambarParkir(296, jalan + 16, s.motorParkir, m);
    }
    anim.motor.forEach(function (mt) { gambarMotor(mt, jalan, m, t); });
    pencahayaanLuar(m, t, jalan, null, null);
    gambarHujanRealistis(s, t, jalan, anim.angkat);
    kotakBarista = anim.rolling > 0.35 ? { x: kotakKedai.bx + kotakKedai.bw / 2 - 20, y: kotakKedai.by, w: 40, h: kotakKedai.bh } : null;
  }

  /* ketukan: koordinat layar (px CSS relatif kanvas) */
  function ketuk(px, py) {
    var r = cv.getBoundingClientRect(), x = px / r.width * W, y = py / r.width * W + anim.angkat;
    function di(k) { return k && x >= k.x && x <= k.x + k.w && y >= k.y && y <= k.y + k.h; }
    if (di(kotakDepan)) return 'pembeli';
    if (di(kotakBarista)) { anim.pantulBarista = 1; return 'barista'; }
    if (di(kotakKedai)) { anim.pantulKedai = 1; return 'kedai'; }
    return null;
  }

  function racikSaja() { anim.pantulBarista = 1; }
  g.KK_ADEGAN = { init: init, gambar: gambar, ketuk: ketuk, ukur: ukur, gelap: gelap, racikSaja: racikSaja, pilihChar: pilihKunciChar, svgMobil: svgMobil, faceSrc: faceSrcHD, gambarKarakterPreview: gambarKarakterPreview };
})(window);
