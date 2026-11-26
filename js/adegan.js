/* adegan.js — adegan The Driver 100% vektor Kanvas 2D: langit sesuai jam, ruko, pemandangan tema & ikon kota, interior kos/rumah, karakter, motor, dan mobil vektor dengan roda berputar. */
(function (g) {
  'use strict';
  var cv, cx, W = 360, H = 640, dpr = 1;
  var anim = { rolling: 0, pantulKedai: 0, pantulBarista: 0, kedip: 0, motor: [], tMotor: 0, angkat: 0, teks: [], cup: [] };
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
  function gambarPotretAi() { return false; }
  function gambarBgCover() { return false; }
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

  function init(canvas) { cv = canvas; cx = cv.getContext('2d'); ukur(); siapkanRuko(); window.addEventListener('resize', ukur); }
  function ukur() {
    var r = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
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

  function gambarLangit(m, t) {
    var l = langit(m), gr = cx.createLinearGradient(0, 0, 0, H * 0.75);
    gr.addColorStop(0, l[0]); gr.addColorStop(1, l[1]);
    cx.fillStyle = gr; cx.fillRect(0, 0, W, H);
    var gp = gelap(m);
    if (gp > 0.3) for (var i = 0; i < 40; i++) {
      var kel = 0.5 + 0.5 * Math.sin(t / 700 + i * 3.1);
      cx.fillStyle = 'rgba(255,255,240,' + ((gp - 0.3) * 0.9 * kel).toFixed(3) + ')';
      cx.fillRect(acak(i + 50) * W, acak(i + 90) * H * 0.5, 1.6, 1.6);
    }
    /* matahari 06.00–18.00, bulan 18.00–06.00, melintas dalam busur */
    var siang = m >= 360 && m <= 1080, p = siang ? (m - 360) / 720 : ((m + 360) % 1440) / 720;
    var x = 30 + p * (W - 60), y = H * 0.42 - Math.sin(p * Math.PI) * H * 0.3;
    if (siang) { bulat(x, y, 30, 'rgba(255,236,170,.35)'); bulat(x, y, 19, '#ffe58f'); }
    else { bulat(x, y, 15, '#f4f1dc'); bulat(x + 6, y - 4, 13, l[0]); }
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

  function gambarJalan(trotoar, jalan) {
    kotak(0, trotoar, W, jalan - trotoar, '#b9b2a6');
    cx.fillStyle = 'rgba(0,0,0,.06)';
    for (var x = 0; x < W; x += 24) cx.fillRect(x, trotoar, 1, jalan - trotoar);
    /* trotoar bercat hitam putih khas jalan kota */
    for (var x2 = 0; x2 < W; x2 += 20) kotak(x2, jalan - 7, 10, 7, (x2 / 20) % 2 ? '#f3f1ea' : '#2b2b2b');
    kotak(0, jalan, W, H - jalan + 400, '#4a4d52');
    cx.fillStyle = '#e9e4d4';
    for (var x3 = 8; x3 < W; x3 += 46) cx.fillRect(x3, jalan + 58, 24, 3);
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
  function gambarBarista(x, y, t, gender) {
    var bob = Math.sin(t / 420) * 0.9, p = anim.pantulBarista, sk = 1 + Math.sin(p * 18) * 0.08 * p;
    var cewek = gender === 'cewek';
    cx.save(); cx.translate(x, y + bob); cx.scale(0.68 / sk, 0.68 * sk);
    /* rambut belakang untuk cewek */
    if (cewek) { kotakBulat(-18, -28, 36, 30, 12, '#2a1d1a'); }
    /* badan dan celemek */
    kotakBulat(-17, -6, 34, 30, 10, cewek ? '#7a3e54' : '#2c3e50');
    kotakBulat(-11, -2, 22, 26, 6, '#f2a516');
    /* kepala */
    bulat(0, -24, 17, '#f1c39b');
    cx.fillStyle = '#2a1d1a'; cx.beginPath(); cx.arc(0, -27, 17, Math.PI * 1.05, Math.PI * 1.95); cx.fill();
    if (cewek) {
      /* poni samping manis */
      kotak(-17, -27, 6, 18, '#2a1d1a'); kotak(11, -27, 6, 18, '#2a1d1a');
    }
    /* topi barista */
    kotakBulat(-16, -44, 32, 12, 6, '#155e57'); kotak(2, -35, 20, 4, '#155e57');
    /* mata berkedip */
    var tutup = anim.kedip > 0;
    cx.fillStyle = '#2a1d1a';
    if (tutup) { cx.fillRect(-8, -23, 6, 1.6); cx.fillRect(3, -23, 6, 1.6); }
    else { bulat(-5, -22, 2.4, '#2a1d1a'); bulat(6, -22, 2.4, '#2a1d1a'); }
    bulat(-10, -16, 3.2, cewek ? 'rgba(235,110,120,.45)' : 'rgba(230,120,110,.35)');
    bulat(11, -16, 3.2, cewek ? 'rgba(235,110,120,.45)' : 'rgba(230,120,110,.35)');
    cx.strokeStyle = '#2a1d1a'; cx.lineWidth = 1.4; cx.beginPath(); cx.arc(0.5, -16, 3.5, 0.2, Math.PI - 0.2); cx.stroke();
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
      gambarBarista(bx + bw / 2, by + bh - 4, t, s.gender);
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
  function gambarMobilRealistis(bentuk, w, pt, lampuNyala) {
    var kaca = 'rgba(130,175,205,.88)', rangka = '#23282e';
    /* bayangan bawah mobil */
    cx.fillStyle = 'rgba(0,0,0,.3)'; cx.beginPath(); cx.ellipse(0, 2, 62, 5, 0, 0, Math.PI * 2); cx.fill();
    var tBadan = bentuk === 'suv' ? 24 : bentuk === 'mpv' ? 22 : bentuk === 'pikap' ? 18 : 19;
    var tAtap = bentuk === 'suv' ? 46 : bentuk === 'mpv' ? 44 : bentuk === 'hatch' ? 38 : bentuk === 'pikap' ? 42 : 35;
    if (bentuk === 'pikap') {
      /* Gran Max / L300 pikap realistis */
      kotakBulat(-58, -22, 74, 15, 3, w); /* bak */
      kotak(-58, -24, 74, 3, '#9aa3a6'); /* bibir bak */
      kotakBulat(14, -tAtap, 42, 35, 6, w); /* kabin */
      cx.fillStyle = kaca; cx.beginPath(); cx.moveTo(20, -tAtap + 4); cx.lineTo(44, -tAtap + 4); cx.lineTo(52, -22); cx.lineTo(20, -22); cx.closePath(); cx.fill();
      kotak(16, -24, 38, 1.5, 'rgba(0,0,0,.2)');
    } else {
      /* bodi bawah & kap mesin */
      kotakBulat(-58, -tBadan - 6, 116, tBadan, 7, w);
      /* rumah kabin & atap */
      var dpnAtap = bentuk === 'sedan' ? 16 : bentuk === 'hatch' ? 24 : 26;
      var blkAtap = bentuk === 'sedan' ? -30 : bentuk === 'hatch' ? -46 : -50;
      cx.fillStyle = w; cx.beginPath();
      cx.moveTo(blkAtap - 6, -tBadan - 5);
      cx.lineTo(blkAtap, -tAtap);
      cx.lineTo(dpnAtap - 6, -tAtap);
      cx.lineTo(dpnAtap + 14, -tBadan - 5);
      cx.closePath(); cx.fill();
      /* kaca jendela menyatu dengan pilar B */
      cx.fillStyle = kaca; cx.beginPath();
      cx.moveTo(blkAtap - 2, -tBadan - 7);
      cx.lineTo(blkAtap + 3, -tAtap + 3.5);
      cx.lineTo(dpnAtap - 8, -tAtap + 3.5);
      cx.lineTo(dpnAtap + 8, -tBadan - 7);
      cx.closePath(); cx.fill();
      /* pilar B & garis pintu */
      var xPilar = (blkAtap + dpnAtap) / 2;
      kotak(xPilar - 1.5, -tAtap + 3, 3, tAtap - tBadan - 8, rangka);
      if (bentuk === 'mpv' || bentuk === 'suv') kotak(blkAtap + 14, -tAtap + 3, 2.5, tAtap - tBadan - 8, rangka);
      /* roof rail SUV */
      if (bentuk === 'suv') { kotak(blkAtap + 4, -tAtap - 3, dpnAtap - blkAtap - 14, 2.5, '#3b4249'); }
      /* spion samping & gagang pintu */
      kotakBulat(dpnAtap + 2, -tBadan - 9, 6, 4, 1.5, w);
      kotak(xPilar - 10, -tBadan + 1, 6, 2, 'rgba(0,0,0,.35)');
      kotak(xPilar + 6, -tBadan + 1, 6, 2, 'rgba(0,0,0,.35)');
      /* grille depan & bumper */
      kotak(54, -tBadan + 3, 4, 10, '#23282e');
      kotak(-59, -11, 118, 4, 'rgba(0,0,0,.18)');
    }
    /* lampu depan LED & lampu rem */
    kotakBulat(53, -tBadan - 1, 6, 5, 1.5, '#fff6cc');
    kotakBulat(-59, -tBadan - 1, 5, 6, 1.5, '#e03c31');
    /* roda bervelg alloy berputar */
    [-36, 36].forEach(function (rx) {
      bulat(rx, -7, 11, '#181a1d');
      bulat(rx, -7, 6.2, '#b9c2ca');
      cx.strokeStyle = '#485058'; cx.lineWidth = 1.4; cx.beginPath();
      for (var s = 0; s < 4; s++) { var a = pt + s * Math.PI / 4; cx.moveTo(rx + Math.cos(a) * 5.6, -7 + Math.sin(a) * 5.6); cx.lineTo(rx - Math.cos(a) * 5.6, -7 - Math.sin(a) * 5.6); }
      cx.stroke();
      bulat(rx, -7, 2, '#eef2f5');
    });
    if (lampuNyala) {
      var gr = cx.createRadialGradient(60, -tBadan + 2, 0, 60, -tBadan + 2, 54);
      gr.addColorStop(0, 'rgba(255,244,190,.55)'); gr.addColorStop(1, 'rgba(255,244,190,0)');
      cx.fillStyle = gr; cx.fillRect(54, -tBadan - 26, 66, 56);
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

  /* motor milik kedai, desain sesuai bentuk asli (Scoopy/Vespa retro, Satria FU ayago, NMAX/PCX maxi, Vario/BeAT skutik, RX-King, Sport) */
  var WARNA_MOTOR = { dazz: '#2f6fb0', revo: '#d9443a', mio: '#7a4fa0', beat: '#e8e4da', gear: '#2b2b2b', supra: '#2f6fb0', scoopy: '#f0e2c8', vario: '#d9443a', vario160: '#1f2328', mxking: '#1f57a8', aerox: '#232830', icon: '#7fd3e8', nmax: '#3b3f46', pcx160: '#f4f2ec', vespa: '#529b8e', satriafu: '#1e64b8', rxking: '#2b2b2b', 'beat-bekas': '#d9443a', 'supra-bekas': '#2b2b2b' };
  function gambarParkir(x, y, id, m) {
    gambarMotorKu(x, y + 12, id, { kiri: true }, 0);
    if (gelap(m) > 0.4) { cx.fillStyle = 'rgba(10,18,45,' + (gelap(m) * 0.28).toFixed(2) + ')'; cx.fillRect(x - 34, y - 28, 68, 48); }
  }

  /* ---------- karakter di dalam rumah / kos (pemain, pasangan, anak sesuai usia, tidur & animasi HB) ---------- */
  function gambarKarakterRumah(x, y, gender, t, o) {
    o = o || {};
    var sk = o.skala || 1, cewek = gender === 'cewek', bob = Math.sin(t / 480 + x) * 1.1;
    var baju = o.baju || (cewek ? '#c86a84' : '#2f6fb0');
    var kulit = o.kulit || '#f1c39b';
    var rambut = o.warnaRambut || '#2a1d1a';
    var gaya = o.gayaRambut || '';
    cx.save(); cx.translate(x, y + bob); cx.scale(sk, sk);
    cx.fillStyle = 'rgba(0,0,0,.16)'; cx.beginPath(); cx.ellipse(0, 1, 13, 3.5, 0, 0, Math.PI * 2); cx.fill();
    kotak(-6, -16, 5, 16, '#33414d'); kotak(1, -16, 5, 16, '#33414d');
    if (cewek && gaya === 'hijab') { kotakBulat(-13, -62, 26, 36, 12, baju); }
    else if (cewek) { kotakBulat(-12, -46, 24, 24, 9, rambut); }
    kotakBulat(-11, -41, 22, 26, 7, baju);
    if (o.hamil) { bulat(7, -23, 7, baju); }
    bulat(0, -51, 11, kulit);
    if (cewek && gaya === 'hijab') {
      cx.strokeStyle = baju; cx.lineWidth = 4; cx.beginPath(); cx.arc(0, -51, 11.5, 0, Math.PI * 2); cx.stroke();
    } else {
      cx.fillStyle = rambut;
      cx.beginPath(); cx.arc(0, -53, 11.5, Math.PI * 1.02, Math.PI * 1.98); cx.fill();
      if (cewek) { kotak(-12, -53, 4.5, 14, rambut); kotak(7.5, -53, 4.5, 14, rambut); }
      if (!cewek && gaya === 'peci') { kotakBulat(-10, -64, 20, 8, 2, '#1b1d22'); }
    }
    bulat(-4, -50, 1.6, '#2a1d1a'); bulat(4, -50, 1.6, '#2a1d1a');
    bulat(-7, -47, 2.2, 'rgba(235,110,120,.4)'); bulat(7, -47, 2.2, 'rgba(235,110,120,.4)');
    cx.strokeStyle = '#2a1d1a'; cx.lineWidth = 1.2; cx.beginPath(); cx.arc(0, -47, 3, 0.2, Math.PI - 0.2); cx.stroke();
    if (o.label) {
      cx.font = '800 10px "Nunito", system-ui, sans-serif'; cx.textAlign = 'center';
      cx.fillStyle = 'rgba(29,43,51,.8)'; cx.fillText(o.label, 0, -68);
    }
    cx.restore();
  }
  /* kepala vektor sederhana (mata terpejam, pipi merona) */
  function kepalaV(x, y, r, jenis, rot) {
    var rambut = jenis === 'cowok' ? '#2a1d1a' : '#4a2c2a';
    cx.save(); cx.translate(x, y); cx.rotate(rot || 0);
    if (jenis !== 'cowok') { cx.fillStyle = rambut; cx.beginPath(); cx.ellipse(0, r * 0.35, r * 1.18, r * 1.35, 0, 0, Math.PI * 2); cx.fill(); }
    bulat(0, 0, r, '#f1c39b');
    cx.fillStyle = rambut; cx.beginPath(); cx.arc(0, -r * 0.05, r * 1.05, Math.PI * 1.02, Math.PI * 1.98); cx.lineTo(r * 0.9, -r * 0.2); cx.quadraticCurveTo(0, -r * 0.55, -r * 0.9, -r * 0.2); cx.fill();
    cx.strokeStyle = '#3a2420'; cx.lineWidth = 1.6; cx.lineCap = 'round';
    cx.beginPath(); cx.arc(-r * 0.36, r * 0.1, r * 0.17, 0.15 * Math.PI, 0.85 * Math.PI); cx.stroke();
    cx.beginPath(); cx.arc(r * 0.36, r * 0.1, r * 0.17, 0.15 * Math.PI, 0.85 * Math.PI); cx.stroke();
    cx.fillStyle = 'rgba(255,110,140,.45)'; cx.beginPath(); cx.arc(-r * 0.6, r * 0.38, r * 0.17, 0, 7); cx.arc(r * 0.6, r * 0.38, r * 0.17, 0, 7); cx.fill();
    cx.strokeStyle = '#b5524a'; cx.beginPath(); cx.arc(0, r * 0.38, r * 0.2, 0.2 * Math.PI, 0.8 * Math.PI); cx.stroke();
    cx.restore();
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
    var irama = Math.sin(t / 210), ayun = irama * 2.2, goyang = irama * 9, cy = 330;
    if (v === 'metime') { gambarMeTime(s, t, u, gA); return; }
    /* latar */
    var gr = cx.createLinearGradient(0, 0, 0, H);
    if (v === 'ciuman') { gr.addColorStop(0, '#5a1a38'); gr.addColorStop(1, '#a83b62'); }
    else if (v === 'foreplay') { gr.addColorStop(0, '#361024'); gr.addColorStop(1, '#752242'); }
    else if (v === 'hotel') { gr.addColorStop(0, '#2a1240'); gr.addColorStop(1, '#4a1e50'); }
    else if (v === 'sofa') { gr.addColorStop(0, '#16303a'); gr.addColorStop(1, '#244a50'); }
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
    if (v === 'hotel') { cx.fillStyle = '#ff5c8a'; kotakBulat(120, 276, 120, 26, 8, '#ff5c8a'); cx.fillStyle = '#fff'; cx.font = '800 18px system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.globalAlpha = 0.75 + Math.sin(t / 260) * 0.25; cx.fillText('HOTEL', 180, 290); cx.globalAlpha = 1; }
    if (v === 'sofa') { var fl = 0.35 + Math.abs(Math.sin(t / 310)) * 0.25; kotakBulat(120, 268, 120, 34, 8, 'rgba(120,200,255,' + fl.toFixed(2) + ')'); }
    if (v === 'balkon') { for (var st = 0; st < 26; st++) { cx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t / 700 + st)); bulat((st * 53) % W, 40 + (st * 29) % 200, 1.4, '#fff'); } cx.globalAlpha = 1; bulat(290, 90, 22, '#fff3c4'); }
    if (v === 'pelukan') { cx.fillStyle = 'rgba(40,20,50,.85)'; for (var gd = 0; gd < 9; gd++) cx.fillRect(gd * 42 - 10, 300 - ((gd * 37) % 90), 30, 200); }
    /* karakter: tampilkan badan penuh dari bahu ke atas di balik selimut/kaca buram, tanpa gelembung bulat */
    var g2 = Math.sin(t / 210 + 1.1) * 6;
    var dekatC = Math.abs(Math.sin(t / 460)) * 8;
    var sepasang = (v === 'ciuman') ? [[150 + dekatC, cy - 6, 0.14 + Math.sin(t / 460) * 0.04], [210 - dekatC, cy - 4, -0.14 - Math.sin(t / 460) * 0.04]]
      : (v === 'foreplay') ? [[146 + irama * 3, cy - Math.abs(goyang) * 0.55, 0.12 + irama * 0.05], [214 - irama * 3, cy + 2 - Math.abs(g2) * 0.55, -0.12 - irama * 0.05]]
      : (v === 'pelukan') ? [[152, cy - 10 - Math.abs(goyang), -0.1 + irama * 0.05], [208, cy - Math.abs(g2), 0.1 - irama * 0.05]]
      : (v === 'sofa' || v === 'balkon') ? [[146 + irama * 3, cy - Math.abs(goyang), -0.08 + irama * 0.04], [214 + irama * 3, cy + 4 - Math.abs(g2), 0.1 - irama * 0.04]]
      : [[138, cy + 6 - Math.abs(goyang), -0.15 + irama * 0.06], [220, cy + 6 - Math.abs(g2) * 0.6, 0.15 - irama * 0.06]];
    var rr = (v === 'pelukan' || v === 'ciuman') ? 30 : 27;
    var imFullA = imCharFull(s.namaPemain, gA), imFullB = imCharFull(A.nama, gB);
    function gambarTubuhHb(imF, px, py, rot, gDef) {
      if (imF && imF.naturalWidth) {
        var th = 165, tw = th * (imF.naturalWidth / imF.naturalHeight);
        cx.save(); cx.translate(px, py + 32); cx.rotate(rot);
        cx.drawImage(imF, -tw / 2, -62, tw, th);
        cx.restore();
      } else {
        kepalaV(px, py, rr, gDef, rot);
      }
    }
    gambarTubuhHb(imFullA, sepasang[0][0], sepasang[0][1], sepasang[0][2], gA);
    gambarTubuhHb(imFullB, sepasang[1][0], sepasang[1][1], sepasang[1][2], gB);
    /* penutup: selimut atau kaca buram */
    if (v === 'mandi') { cx.fillStyle = 'rgba(235,245,250,.78)'; cx.fillRect(60, cy + 34, 240, 260); for (var dr = 0; dr < 14; dr++) { cx.fillStyle = 'rgba(255,255,255,.55)'; cx.fillRect(70 + dr * 17, (t / 8 + dr * 53) % 300 + 80, 2, 12); } }
    else if (v === 'pelukan' || v === 'ciuman') {
      var fgG = cx.createLinearGradient(0, cy + 36, 0, H);
      fgG.addColorStop(0, v === 'ciuman' ? 'rgba(90,26,56,0)' : 'rgba(40,20,50,.9)');
      fgG.addColorStop(0.35, v === 'ciuman' ? 'rgba(90,26,56,.88)' : 'rgba(40,20,50,.95)');
      fgG.addColorStop(1, v === 'ciuman' ? 'rgba(65,16,40,.98)' : 'rgba(40,20,50,.98)');
      cx.fillStyle = fgG; cx.fillRect(0, cy + 36, W, H - cy);
    } else { cx.fillStyle = v === 'foreplay' ? '#8c2348' : v === 'hotel' ? '#7a2a5e' : v === 'sofa' ? '#2c6a6a' : v === 'balkon' ? '#3a3f78' : '#b04a68'; kotakBulat(70, cy + 34 - Math.abs(goyang) * 0.6, 220, 230 + Math.abs(goyang) * 0.6, 30, cx.fillStyle); cx.fillStyle = 'rgba(255,255,255,.12)'; kotakBulat(80, cy + 42, 200, 14, 7, 'rgba(255,255,255,.12)'); }
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
    var jd = (HB_JUDUL[v] || 'Waktu berdua') + (A.nama ? ' · ' + A.nama : '');
    cx.strokeText(jd, W / 2, 212); cx.fillText(jd, W / 2, 212);
    cx.font = '800 15px "Nunito", system-ui, sans-serif'; cx.strokeText('Pukul ' + jj, W / 2, 238); cx.fillText('Pukul ' + jj, W / 2, 238);
    kotakBulat(70, 256, 220, 8, 4, 'rgba(255,255,255,.3)'); kotakBulat(70, 256, Math.max(8, 220 * u), 8, 4, '#ff5c8a');
  }
  function gambarPenghuniRumah(s, t, xKasur, yKasur, yLantai) {
    var kel = s.keluargaRumah || [];
    var pas = kel.filter(function (k) { return k.pasangan; })[0] || null;
    var anakList = kel.filter(function (k) { return !k.pasangan; });
    /* animasi HB: istri berbaring di kasur, suami naik ke atas istri dengan efek hati sebelum layar gelap */
    if (s.hbAnim) { gambarAdeganHb(s, t); return; }
    /* karakter utama saat bangun atau tidur */
    if (s.tidur) {
      if (!gambarPotretAi(imPemain(s), xKasur + 36, yKasur + 4, 21, t, { diam: true, zoom: 1.35, bingkai: '#5b6b73', ikonEkspresi: '💤', label: s.namaPemain || 'Tidur' })) {
        bulat(xKasur + 24, yKasur, 11.5, '#f1c39b');
        cx.fillStyle = '#2a1d1a'; cx.beginPath(); cx.arc(xKasur + 24, yKasur - 3, 11.5, Math.PI, 0); cx.fill();
      }
      if (pas) {
        if (!gambarPotretAi(imChar(pas.nama, pas.gender, pas.usia, pas.peran), xKasur + 84, yKasur + 6, 20, t, { diam: true, zoom: 1.35, bingkai: '#e91e63', ikonEkspresi: '💤', label: pas.nama })) {
          bulat(xKasur + 52, yKasur + 2, 10.5, '#f1c39b');
          cx.fillStyle = '#2a1d1a'; cx.beginPath(); cx.arc(xKasur + 52, yKasur - 1, 10.5, Math.PI, 0); cx.fill();
        }
      }
      cx.fillStyle = '#fff'; cx.font = '800 16px "Baloo 2", system-ui, sans-serif';
      cx.fillText('z', xKasur + 46, yKasur - 24 - (t / 40) % 12);
      cx.fillText('Z', xKasur + 60, yKasur - 40 - (t / 50) % 14);
    } else {
      var ekspPemain = s.sakitPemain ? '🤒' : s.capekPemain ? '😓' : s.hbTinggi ? '❤️' : ['😊', '☕', '✨'][Math.floor(t / 4000) % 3];
      var imP = imCharFull(s.namaPemain, s.gender || 'cewek');
      var tp = s.tampilan || {};
      if (!gambarKarakterPenuh(imP, 228, yLantai + 162, 160, t, { gerak: 4, bingkai: '#1f8a80', ikonEkspresi: ekspPemain, label: s.namaPemain || 'Kamu' })) {
        gambarKarakterRumah(132, yLantai + 102, s.gender || 'cewek', t, { baju: s.gender === 'cewek' ? '#7a3e54' : '#1f8a80', kulit: tp.kulitHex, warnaRambut: tp.rambutHex, gayaRambut: tp.rambut, hamil: !!s.hamilPemain, label: s.namaPemain || 'Kamu' });
      }
      if (pas) {
        var ekspPas = pas.hamil ? '🤰' : s.hbTinggi ? '😘' : ['🥰', '😊', '💕'][Math.floor(t / 4500) % 3];
        var imPas = imCharFull(pas.nama, pas.gender, pas.usia, pas.peran);
        if (!gambarKarakterPenuh(imPas, 148, yLantai + 168, 154, t + 400, { gerak: 3, bingkai: '#e91e63', ikonEkspresi: ekspPas, label: pas.nama + (pas.hamil ? ' 🤰' : '') })) {
          gambarKarakterRumah(196, yLantai + 104, pas.gender, t + 400, { baju: pas.gender === 'cewek' ? '#d46a7e' : '#35608a', hamil: !!pas.hamil, label: pas.nama });
        }
      }
    }
    /* anak-anak & ipar yang berada di rumah tampil penuh sesuai usia di lantai depan */
    var posAn = [[76, 174], [292, 174], [112, 196], [264, 196]];
    anakList.slice(0, 4).forEach(function (an, i) {
      var isIpar = an.peran === 'adik_ipar' || an.peran === 'kakak_ipar';
      var tinggiAn = isIpar ? (an.usia < 20 ? 136 : 148) : (an.usia < 3 ? 78 : an.usia < 7 ? 96 : an.usia < 12 ? 114 : an.usia < 18 ? 136 : 148);
      var ax = posAn[i][0], ay = yLantai + posAn[i][1];
      var imAn = imCharFull(an.nama, an.gender, an.usia, an.peran);
      var ekspAn = isIpar ? ['😉', '✨', '🌸'][Math.floor((t + i * 900) / 4200) % 3] : ['😄', '🌟', '🎵'][Math.floor((t + i * 700) / 3800) % 3];
      if (!gambarKarakterPenuh(imAn, ax, ay, tinggiAn, t + 700 * (i + 1), { gerak: 3, bingkai: isIpar ? '#ff70a6' : '#f2a516', ikonEkspresi: ekspAn, label: an.nama + ' (' + an.usia + 't)' })) {
        var sk = an.usia < 2 ? 0.52 : an.usia < 5 ? 0.64 : an.usia < 10 ? 0.76 : an.usia < 15 ? 0.88 : 0.96;
        gambarKarakterRumah(ax, ay, an.gender, t + 700 * (i + 1), { skala: sk, baju: an.gender === 'cewek' ? '#f2a516' : '#4fa55a', label: an.nama + ' (' + an.usia + 't)' });
      }
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
  function pencahayaanLuar(m, t, yJalan, hx, hy) {
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
      var bm = cx.createLinearGradient(hx, hy, hx + 185, hy + 28);
      bm.addColorStop(0, 'rgba(255,248,205,' + (0.58 * gp).toFixed(3) + ')');
      bm.addColorStop(0.45, 'rgba(255,236,168,' + (0.26 * gp).toFixed(3) + ')');
      bm.addColorStop(1, 'rgba(255,230,150,0)');
      cx.fillStyle = bm;
      cx.beginPath();
      cx.moveTo(hx, hy - 5);
      cx.lineTo(hx + 190, hy - 34);
      cx.lineTo(hx + 190, hy + 46);
      cx.lineTo(hx, hy + 8);
      cx.closePath();
      cx.fill();
      var gl = cx.createRadialGradient(hx, hy, 1, hx, hy, 22);
      gl.addColorStop(0, 'rgba(255,255,235,' + (0.85 * gp).toFixed(3) + ')');
      gl.addColorStop(1, 'rgba(255,240,180,0)');
      cx.fillStyle = gl; cx.beginPath(); cx.arc(hx, hy, 22, 0, Math.PI * 2); cx.fill();
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
    if (!s.hujan) return;
    var deras = s.hujan > 1, oy = offY || 0, yJ = yJalan != null ? yJalan : H * 0.62;
    /* mendung & kabut tipis */
    cx.fillStyle = 'rgba(18,28,44,' + (deras ? 0.30 : 0.18) + ')';
    cx.fillRect(0, oy - 20, W, H + 40);
    var kabut = cx.createLinearGradient(0, yJ - 60, 0, yJ + 50);
    kabut.addColorStop(0, 'rgba(195,215,235,0)');
    kabut.addColorStop(0.5, 'rgba(195,215,235,' + (deras ? 0.14 : 0.08) + ')');
    kabut.addColorStop(1, 'rgba(195,215,235,0)');
    cx.fillStyle = kabut; cx.fillRect(0, yJ - 60, W, 110);
    /* kilau aspal basah */
    var basah = cx.createLinearGradient(0, yJ, 0, H);
    basah.addColorStop(0, 'rgba(140,185,230,' + (deras ? 0.18 : 0.10) + ')');
    basah.addColorStop(0.5, 'rgba(30,45,70,' + (deras ? 0.18 : 0.08) + ')');
    basah.addColorStop(1, 'rgba(160,200,240,' + (deras ? 0.14 : 0.06) + ')');
    cx.fillStyle = basah; cx.fillRect(0, yJ, W, H - yJ + 40);
    /* riak & cipratan air di jalan aspal basah */
    cx.strokeStyle = 'rgba(215,235,255,' + (deras ? 0.45 : 0.32) + ')'; cx.lineWidth = 1;
    var nRiak = deras ? 20 : 12;
    for (var ri = 0; ri < nRiak; ri++) {
      var rx = acak(ri + 710) * W, ry = yJ + 8 + acak(ri + 810) * Math.max(30, H - yJ - 20);
      var fase = ((t / 40 + ri * 7.3) % 12) / 12, rr = 2 + fase * 11;
      cx.globalAlpha = (1 - fase) * (deras ? 0.65 : 0.45);
      cx.beginPath(); cx.ellipse(rx, ry, rr, rr * 0.32, 0, 0, Math.PI * 2); cx.stroke();
    }
    cx.globalAlpha = 1;
    /* 3 lapis hujan (jauh, sedang, dekat) */
    var lapis = [
      { n: deras ? 75 : 48, lw: 0.7, len: 10, spd: 0.34, sl: 2.5, col: 'rgba(200,220,245,.26)' },
      { n: deras ? 85 : 55, lw: 1.15, len: 16, spd: 0.52, sl: 4.5, col: 'rgba(218,236,252,.48)' },
      { n: deras ? 45 : 26, lw: 1.65, len: 24, spd: 0.78, sl: 7.0, col: 'rgba(238,248,255,.68)' }
    ];
    for (var li = 0; li < lapis.length; li++) {
      var L = lapis[li];
      cx.strokeStyle = L.col; cx.lineWidth = L.lw; cx.beginPath();
      for (var hi = 0; hi < L.n; hi++) {
        var sd = hi + li * 200;
        var hx = (acak(sd + 500) * (W + 80) - 20 - (t * L.spd * 0.22) % (W + 80) + W + 80) % (W + 80) - 20;
        var hy = (acak(sd + 600) * (H + 90) + t * L.spd) % (H + 90) - 40 + oy;
        cx.moveTo(hx, hy); cx.lineTo(hx - L.sl, hy + L.len);
      }
      cx.stroke();
    }
    /* genangan kecokelatan & kilatan petir saat hujan deras/banjir */
    if (deras) {
      cx.fillStyle = 'rgba(95,82,62,.28)'; cx.fillRect(0, yJ - 2, W, H - yJ + 40);
      var siklusPetir = t % 7800;
      if (siklusPetir < 130 || (siklusPetir > 190 && siklusPetir < 260)) {
        cx.fillStyle = 'rgba(225,240,255,.28)'; cx.fillRect(0, oy - 20, W, H + 40);
      }
    }
  }
  /* ---------- kamar kos ---------- */
  /* ---------- rumah sendiri: denah ringkas supaya barang terlihat di atas tombol bawah ---------- */
  function gambarRumah(s, t) {
    var m = s.menit % 1440, gp = gelap(m), b = s.barang || {}, rumah = s.rumah, lantai = Math.max(330, H - 300);
    var adaBgRumah = false;
    if (!adaBgRumah) {
      kotak(0, 0, W, H, { subsidi: '#dfe6dc', komersial: '#efe6d6', mewah: '#f4efe8' }[rumah]);
      cx.fillStyle = 'rgba(0,0,0,.035)'; for (var x = 0; x < W; x += 30) cx.fillRect(x, 0, 2, lantai);
      kotak(0, lantai - 8, W, 8, rumah === 'mewah' ? '#b9a27a' : '#c8bfae'); /* plint */
      kotak(0, lantai, W, H - lantai, rumah === 'mewah' ? '#e6e0d6' : '#d8cfc0');
      cx.strokeStyle = 'rgba(0,0,0,.07)'; cx.lineWidth = 1;
      for (var y = lantai; y < H; y += 40) { cx.beginPath(); cx.moveTo(0, y); cx.lineTo(W, y); cx.stroke(); }
      for (var x2 = 0; x2 < W; x2 += 60) { cx.beginPath(); cx.moveTo(x2, lantai); cx.lineTo(x2 - 30, H); cx.stroke(); }
      /* jendela dan pintu */
      var l = langit(m), gr = cx.createLinearGradient(0, lantai - 230, 0, lantai - 110);
      gr.addColorStop(0, l[0]); gr.addColorStop(1, l[1]);
      kotak(30, lantai - 236, 120, 128, '#8a6a4a'); cx.fillStyle = gr; cx.fillRect(36, lantai - 230, 108, 116); kotak(88, lantai - 230, 4, 116, '#8a6a4a');
      kotak(24, lantai - 242, 132, 8, rumah === 'mewah' ? '#7a5a8a' : '#5a8a7a');
    }
    var yKepala = b.springbed ? lantai + 34 : lantai + 54;
    if (!adaBgRumah) {
      if (b.ac) { kotakBulat(196, lantai - 236, 112, 32, 8, '#f6f6f2'); kotak(204, lantai - 212, 96, 3, '#d6d6d0'); bulat(294, lantai - 226, 2.5, s.acNyala ? '#4fbf6a' : '#d9443a'); }
      if (b.kompor || b.ricecooker) { kotak(14, lantai - 34, 88, 50, '#b98a5a'); kotak(14, lantai - 38, 88, 6, '#e8e4da');
        if (b.kompor) { kotak(22, lantai - 46, 44, 8, '#a5adb3'); bulat(32, lantai - 47, 5, '#2b2b2b'); bulat(56, lantai - 47, 5, '#2b2b2b'); kotakBulat(80, lantai - 20, 16, 34, 6, '#7fb069'); }
        if (b.ricecooker) { bulat(86, lantai - 46, 10, '#f6f6f2'); kotak(76, lantai - 46, 20, 8, '#f6f6f2'); } }
      if (b.mesincuci) { kotakBulat(108, lantai - 44, 52, 62, 6, '#eef1f3'); bulat(124, lantai - 14, 11, '#bcd3e0'); bulat(148, lantai - 14, 7, '#bcd3e0'); kotak(112, lantai - 40, 44, 5, '#c8ced3'); }
      if (b.dispenser) { kotak(164, lantai - 14, 22, 34, '#f3f1ea'); kotakBulat(162, lantai - 44, 26, 30, 6, 'rgba(150,200,230,.7)'); }
      if (b.tv || b.tv55) {
        var tw = b.tv55 ? 120 : 88, th = b.tv55 ? 70 : 52, tx = 246 - tw / 2;
        kotak(192, lantai + 2, 104, 26, '#7d5f3f');
        kotakBulat(tx, lantai - 6 - th, tw, th, 4, '#1b1b1b');
        var nyalaTv = !s.tidur && (m >= 1080 || m < 120);
        kotak(tx + 4, lantai - 2 - th, tw - 8, th - 8, nyalaTv ? ['#3a6fb0', '#4fa060', '#b06a3a'][Math.floor(t / 1200) % 3] : '#2b2f36');
        kotak(242, lantai - 6, 8, 8, '#1b1b1b');
      }
      if (b.kulkas2) { kotakBulat(302, lantai - 96, 50, 126, 5, '#d8dde1'); kotak(326, lantai - 92, 2, 118, '#b8c0c6'); kotak(318, lantai - 50, 3, 18, '#8d969b'); kotak(331, lantai - 50, 3, 18, '#8d969b'); }
      else if (b.kulkas) { kotakBulat(304, lantai - 56, 46, 84, 5, '#e8ecef'); kotak(308, lantai - 26, 38, 2, '#c8ced3'); kotak(340, lantai - 46, 3, 14, '#9aa3a6'); }
      if (b.karpet) kotakBulat(176, lantai + 76, 168, 56, 10, '#b85c4a');
      if (b.springbed) { kotakBulat(10, lantai + 20, 12, 82, 4, '#6b4a2e'); kotakBulat(14, lantai + 50, 156, 56, 10, '#6b4a2e'); kotakBulat(18, lantai + 36, 148, 34, 10, '#f3f1ea'); kotakBulat(22, lantai + 28, 44, 22, 10, '#fff'); kotakBulat(66, lantai + 40, 98, 28, 8, '#c86a5a'); }
      else { kotakBulat(14, lantai + 70, 156, 30, 8, '#e9e2cf'); kotakBulat(18, lantai + 58, 148, 22, 8, '#f3f1ea'); kotakBulat(22, lantai + 50, 42, 18, 8, '#fff'); kotakBulat(66, lantai + 60, 98, 20, 8, '#a5b88a'); }
      if (b.sofa) { kotakBulat(184, lantai + 84, 150, 46, 14, '#5b7a8c'); kotakBulat(190, lantai + 70, 138, 28, 12, '#6d8ea1'); }
      if (b.mejamakan) { kotakBulat(18, lantai + 112, 18, 26, 3, '#a86c3c'); kotak(36, lantai + 112, 80, 7, '#8f5a31'); kotak(42, lantai + 119, 5, 20, '#6b4a2e'); kotak(104, lantai + 119, 5, 20, '#6b4a2e'); kotakBulat(118, lantai + 112, 18, 26, 3, '#a86c3c'); }
      if (b.kipas) { kotak(178, lantai + 30, 4, 50, '#3b3f46'); bulat(180, lantai + 24, 16, '#dfeef3'); cx.save(); cx.translate(180, lantai + 24); cx.rotate(t / 60); kotak(-2, -13, 4, 26, '#9ab'); kotak(-13, -2, 26, 4, '#9ab'); cx.restore(); }
    }
    gambarPenghuniRumah(s, t, 18, yKepala, lantai);
    pencahayaanRuangan(m, s.tidur, t);
  }
  function gambarKos(s, t) {
    if (s.rumah) return gambarRumah(s, t);
    var m = s.menit % 1440, gp = gelap(m), b = s.barang || {}, rumah = s.rumah;
    var lantai = Math.max(330, H - 300);
    var adaBgKos = false;
    if (!adaBgKos) {
      kotak(0, 0, W, H, rumah ? { subsidi: '#dfe6dc', komersial: '#efe6d6', mewah: '#f4efe8' }[rumah] : '#e9dcc4'); /* dinding */
      cx.fillStyle = 'rgba(0,0,0,.04)'; for (var x = 0; x < W; x += 30) cx.fillRect(x, 0, 2, lantai);
      kotak(0, lantai, W, H - lantai, rumah === 'mewah' ? '#e6e0d6' : rumah ? '#d8cfc0' : '#c9b08a'); /* lantai keramik atau marmer */
      cx.strokeStyle = 'rgba(0,0,0,.08)'; cx.lineWidth = 1;
      for (var y = lantai; y < H; y += 34) { cx.beginPath(); cx.moveTo(0, y); cx.lineTo(W, y); cx.stroke(); }
      for (var x2 = 0; x2 < W; x2 += 48) { cx.beginPath(); cx.moveTo(x2, lantai); cx.lineTo(x2 - 30, H); cx.stroke(); }
      /* jendela: langit sesuai jam */
      var l = langit(m), gr = cx.createLinearGradient(0, lantai - 300, 0, lantai - 180);
      gr.addColorStop(0, l[0]); gr.addColorStop(1, l[1]);
      kotak(36, lantai - 300, 110, 120, '#8a6a4a'); cx.fillStyle = gr; cx.fillRect(42, lantai - 294, 98, 108);
      kotak(89, lantai - 294, 4, 108, '#8a6a4a'); kotak(42, lantai - 242, 98, 4, '#8a6a4a');
      kotak(30, lantai - 306, 122, 8, '#c86a5a'); /* gorden */
    } else {
      cx.fillStyle = 'rgba(18,22,28,.16)'; cx.fillRect(0, 0, W, H);
    }
    if (!adaBgKos) {
      if (!rumah || b.ac) { kotakBulat(214, lantai - 300, 112, 34, 8, '#f6f6f2'); kotak(222, lantai - 274, 96, 3, '#d6d6d0');
        bulat(312, lantai - 290, 2.5, s.acNyala ? '#4fbf6a' : '#d9443a'); }
      if (rumah) { /* pintu dan saklar */ kotakBulat(296, lantai - 200, 58, 200, 3, rumah === 'mewah' ? '#6b4a2e' : '#9c7a52'); bulat(344, lantai - 96, 3, '#e0d3b8'); }
      if (!rumah) { kotakBulat(276, lantai - 170, 70, 180, 4, '#9c7a52'); kotak(310, lantai - 165, 2, 170, '#7d5f3f'); bulat(304, lantai - 80, 2.5, '#e0d3b8'); bulat(318, lantai - 80, 2.5, '#e0d3b8'); }
      if (rumah && !b.springbed) { kotakBulat(20, lantai + 60, 200, 34, 8, '#e9e2cf'); kotakBulat(26, lantai + 46, 188, 26, 8, '#f3f1ea'); kotakBulat(30, lantai + 38, 50, 20, 8, '#fff'); kotakBulat(84, lantai + 48, 128, 24, 8, '#a5b88a'); }
      else {
        if (b.springbed) kotakBulat(16, lantai - 40, 14, 120, 4, '#6b4a2e');
        kotakBulat(20, lantai + 30, 200, 70, 10, b.springbed ? '#6b4a2e' : '#7d5f3f');
        kotakBulat(24, lantai + 14, 192, 40, 10, '#f3f1ea'); kotakBulat(30, lantai + 4, 54, 24, 10, '#ffffff');
        kotakBulat(84, lantai + 18, 130, 34, 8, b.springbed ? '#c86a5a' : '#6aa0c8');
      }
      if (b.karpet) kotakBulat(150, lantai + 120, 150, 50, 10, '#b85c4a');
      if (b.kipas) { kotak(250, lantai + 40, 4, 60, '#3b3f46'); bulat(252, lantai + 34, 18, '#dfeef3'); cx.save(); cx.translate(252, lantai + 34); cx.rotate(t / 60); kotak(-2, -15, 4, 30, '#9ab'); kotak(-15, -2, 30, 4, '#9ab'); cx.restore(); }
      if (b.kulkas2) { kotakBulat(240, lantai - 40, 52, 136, 5, '#d8dde1'); kotak(265, lantai - 36, 2, 128, '#b8c0c6'); kotak(258, lantai + 10, 3, 18, '#8d969b'); kotak(270, lantai + 10, 3, 18, '#8d969b'); }
      else if (b.kulkas) { kotakBulat(296, lantai + 10, 50, 86, 5, '#e8ecef'); kotak(300, lantai + 40, 42, 2, '#c8ced3'); kotak(336, lantai + 20, 3, 14, '#9aa3a6'); }
      if (b.tv || b.tv55) {
        var besar = b.tv55 && rumah ? 1.35 : 1;
        kotak(150, lantai + 60, 120 * besar > 140 ? 130 : 110, 30, '#7d5f3f');
        kotakBulat(170 - (besar - 1) * 45, lantai - 10 - (besar - 1) * 58, 90 * besar, 58 * besar, 4, '#1b1b1b');
        var nyalaTv = !s.tidur && (m >= 1080 || m < 120);
        kotak(174 - (besar - 1) * 45, lantai - 6 - (besar - 1) * 58, 90 * besar - 8, 58 * besar - 10, nyalaTv ? ['#3a6fb0', '#4fa060', '#b06a3a'][Math.floor(t / 1200) % 3] : '#2b2f36');
        kotak(210, lantai + 48, 10, 12, '#1b1b1b');
      }
      if (b.ricecooker) { bulat(190, lantai + 98, 12, '#f6f6f2'); kotak(180, lantai + 98, 20, 10, '#f6f6f2'); }
      if (b.dispenser) { kotak(14, lantai + 110, 24, 40, '#f3f1ea'); kotakBulat(12, lantai + 80, 28, 32, 6, 'rgba(150,200,230,.7)'); }
      if (b.sofa) { kotakBulat(110, lantai + 190, 170, 54, 14, '#5b7a8c'); kotakBulat(116, lantai + 176, 158, 30, 12, '#6d8ea1'); kotak(124, lantai + 240, 8, 10, '#3b2a22'); kotak(258, lantai + 240, 8, 10, '#3b2a22'); }
      if (b.mejamakan) { kotak(290, lantai + 196, 62, 8, '#8f5a31'); kotak(296, lantai + 204, 5, 40, '#6b4a2e'); kotak(340, lantai + 204, 5, 40, '#6b4a2e'); kotakBulat(286, lantai + 176, 14, 30, 3, '#a86c3c'); kotakBulat(342, lantai + 176, 14, 30, 3, '#a86c3c'); }
      if (b.mesincuci) { kotakBulat(20, lantai + 188, 70, 58, 6, '#eef1f3'); bulat(42, lantai + 214, 13, '#bcd3e0'); bulat(72, lantai + 214, 9, '#bcd3e0'); kotak(24, lantai + 192, 62, 6, '#c8ced3'); }
      if (b.kompor) { kotak(60, lantai + 120, 70, 8, '#a5adb3'); kotak(64, lantai + 128, 62, 30, '#d9dcde'); bulat(80, lantai + 118, 6, '#2b2b2b'); bulat(110, lantai + 118, 6, '#2b2b2b'); kotakBulat(134, lantai + 126, 18, 30, 6, '#7fb069'); }
    }
    /* tampilkan karakter utama, pasangan (istri/suami), anak-anak, serta animasi tidur / HB di kamar kos */
    gambarPenghuniRumah(s, t, 34, lantai + 12, lantai + 14);
    pencahayaanRuangan(m, s.tidur, t);
  }

  /* ---------- motor sendiri (bentuk vektor asli per jenis), ngojek, mobil, pindahan ---------- */
  var SPORT = { gsxr150: '#2f6fb0', cbr150: '#d9443a', r15: '#2f6fb0', r15m: '#1f4e8c', mt25: '#3b3f46', cbr250: '#d9443a', cbr250sp: '#c62828', ninja250: '#4fa53a', r25: '#2f6fb0', zx25r: '#4fa53a', zx25rr: '#43a047', zx4rr: '#4fa53a', zx6r: '#4fa53a', zx10r: '#4fa53a', cbr1000: '#d9443a', h2: '#2b2f36', r6: '#2f6fb0', r1m: '#1f3a60', s1000rr: '#1565c0', panigalev4: '#c62828', harleysport: '#26292e', 'cbr250-bekas': '#d9443a' };
  var RETRO = { scoopy: 1, vespa: 1, vespasprint: 1, vespagts: 1, vespa946: 1, fazzio: 1, filano: 1, stylo160: 1 }, MAXI = { nmax: 1, nmaxturbo: 1, pcx160: 1, pcxroadsync: 1, adv160: 1, xmax250: 1, forza250: 1, aeroxalpha: 1, alvacervo: 1 }, AYAGO = { satriafu: 1, mxking: 1 };
  /* motor menghadap kanan; dasar = permukaan jalan (100% vektor) */
  function gambarMotorKu(x, y, id, o, t) {
    o = o || {};
    var sport = !!SPORT[id], retro = !!RETRO[id], maxi = !!MAXI[id], ayago = !!AYAGO[id];
    var w = SPORT[id] || WARNA_MOTOR[id] || '#d9443a', putar = o.jalan ? t / 60 : 0;
    cx.save(); cx.translate(x, y); if (o.kiri) cx.scale(-1, 1);
    cx.fillStyle = 'rgba(0,0,0,.26)'; cx.beginPath(); cx.ellipse(0, 1, 31, 4.2, 0, 0, Math.PI * 2); cx.fill();
    [-20, 20].forEach(function (rx) {
      bulat(rx, -9, 9, '#191b1e'); bulat(rx, -9, 5, '#9aa3a6');
      cx.strokeStyle = '#485058'; cx.lineWidth = 1.2; cx.beginPath();
      for (var j = 0; j < 3; j++) { var a = putar + j * Math.PI / 3; cx.moveTo(rx + Math.cos(a) * 5, -9 + Math.sin(a) * 5); cx.lineTo(rx - Math.cos(a) * 5, -9 - Math.sin(a) * 5); }
      cx.stroke();
      bulat(rx, -9, 1.8, '#e8ecef');
    });
    cx.strokeStyle = '#5a626a'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(-25, -9); cx.lineTo(-8, -7); cx.stroke();
    if (sport) {
      cx.fillStyle = w; cx.beginPath(); cx.moveTo(-25, -23); cx.lineTo(-5, -22); cx.lineTo(10, -28); cx.lineTo(25, -22); cx.lineTo(19, -10); cx.lineTo(-8, -10); cx.closePath(); cx.fill();
      kotakBulat(-23, -24, 15, 4.5, 2, '#1f2226');
      kotakBulat(-2, -29, 14, 7.5, 3, w);
      cx.fillStyle = 'rgba(165,215,245,.78)'; cx.beginPath(); cx.moveTo(16, -27); cx.lineTo(24, -22); cx.lineTo(20, -34); cx.closePath(); cx.fill();
      cx.strokeStyle = '#b9933a'; cx.lineWidth = 2.4; cx.beginPath(); cx.moveTo(20, -9); cx.lineTo(15, -25); cx.stroke();
    } else if (id === 'rxking') {
      /* RX-King: tangki kotak khas, mesin sirip, jok lurus, knalpot krom */
      kotak(-16, -15, 30, 5, '#8c949b');
      kotakBulat(-22, -23, 20, 6, 2.5, '#2b2420');
      kotakBulat(-2, -28, 16, 10, 2, w); /* tangki kotak */
      bulat(18, -26, 4.5, '#ffe89c'); /* lampu bulat */
      cx.strokeStyle = '#b8bfc4'; cx.lineWidth = 2.2; cx.beginPath(); cx.moveTo(20, -9); cx.lineTo(14, -29); cx.stroke();
    } else if (retro) {
      /* Scoopy / Vespa: bodi belakang membulat, tameng depan melengkung, lampu bulat */
      cx.fillStyle = w; cx.beginPath(); cx.ellipse(-10, -17, 15, 9, 0, 0, Math.PI * 2); cx.fill();
      kotakBulat(-21, -26, 18, 6, 3, '#6b4226'); /* jok cokelat retro */
      kotakBulat(8, -29, 11, 20, 5, w); /* tameng depan melengkung */
      bulat(20, -25, 4.2, '#fff2b8'); /* lampu depan bundar */
      cx.strokeStyle = '#8d969b'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(20, -9); cx.lineTo(14, -29); cx.stroke();
    } else if (maxi) {
      /* NMAX / PCX: bodi panjang gagah + windshield tinggi */
      cx.fillStyle = w; cx.beginPath(); cx.moveTo(-26, -21); cx.lineTo(-2, -20); cx.lineTo(7, -14); cx.lineTo(16, -28); cx.lineTo(25, -24); cx.lineTo(20, -10); cx.lineTo(-21, -10); cx.closePath(); cx.fill();
      kotakBulat(-23, -25, 23, 6, 3, '#222');
      cx.fillStyle = 'rgba(180,220,245,.72)'; cx.beginPath(); cx.moveTo(16, -27); cx.lineTo(23, -25); cx.lineTo(20, -37); cx.lineTo(15, -35); cx.closePath(); cx.fill();
      cx.strokeStyle = '#4a525a'; cx.lineWidth = 2.2; cx.beginPath(); cx.moveTo(20, -9); cx.lineTo(16, -26); cx.stroke();
    } else if (ayago) {
      /* Satria FU / MX King: ayam jago ramping, shock depan panjang tegak, buntut runcing */
      cx.fillStyle = w; cx.beginPath(); cx.moveTo(-24, -22); cx.lineTo(12, -20); cx.lineTo(16, -13); cx.lineTo(-10, -13); cx.closePath(); cx.fill();
      kotakBulat(-22, -25, 22, 5, 2, '#1d1f23');
      cx.strokeStyle = '#9aa3a6'; cx.lineWidth = 2.4; cx.beginPath(); cx.moveTo(20, -9); cx.lineTo(12, -31); cx.stroke();
      kotakBulat(12, -31, 8, 6, 2, w); /* batok lampu kecil khas ayago */
      kotak(19, -29, 3, 3.5, '#fff4b8');
    } else {
      /* Skutik harian & bebek (BeAT, Vario 125/160, Aerox, Supra, Revo) */
      cx.fillStyle = w; cx.beginPath(); cx.moveTo(-23, -21); cx.lineTo(-3, -20); cx.lineTo(3, -12); cx.lineTo(12, -12); cx.lineTo(15, -29); cx.lineTo(23, -25); cx.lineTo(19, -10); cx.lineTo(-19, -10); cx.closePath(); cx.fill();
      kotakBulat(-21, -24, 19, 5.5, 2.5, '#222');
      kotak(13, -32, 4, 6, '#333');
      cx.strokeStyle = '#555'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(20, -9); cx.lineTo(15, -27); cx.stroke();
      kotak(21, -24, 3, 4, '#fff4b8');
    }
    if (o.muatan === 'paket') { kotak(-30, -44, 20, 16, '#c8a06a'); kotak(-30, -38, 20, 2, '#a5844f'); }
    if (o.muatan === 'makanan') { kotakBulat(-34, -50, 24, 24, 3, '#1f9a3f'); kotak(-32, -42, 20, 3, '#f3f1ea'); }
    if (o.bonceng) orangMotor(-14, '#5f7f9a', '#f6f6f2', false);
    if (o.naik) orangMotor(sport ? 2 : 0, '#1f9a3f', '#1f9a3f', true, o.hp, sport);
    cx.restore();
  }
  function orangMotor(x, baju, helm, sopir, hp, nunduk) {
    var yb = nunduk ? -50 : -54;
    kotak(x - 4, -24, 6, 14, '#33414d');
    cx.save(); cx.translate(x, yb); if (nunduk) cx.rotate(0.35);
    kotakBulat(-8, 0, 16, 26, 6, baju);
    if (sopir) kotak(-8, 10, 16, 3, '#f3f1ea');
    bulat(2, -8, 10, helm); kotak(4, -10, 9, 5, 'rgba(30,40,50,.75)');
    cx.restore();
    if (sopir && !hp) kotak(x + 8, yb + 8, 12, 4, baju);
    if (hp) { kotak(x + 6, yb + 4, 5, 9, '#222'); kotak(x + 7, yb + 5, 3, 6, '#7fd3e8'); }
  }
  var WARNA_MOBIL = {
    granmax: '#e8e4da', carry: '#e8e4da', hilux: '#d6d8da', l300: '#3e6fb0', traga: '#e8e4da', triton: '#3a4048',
    calya: '#b8bcc0', sigra: '#c9ced4', ayla: '#e5a93c', agya: '#d9443a', brio: '#f0b92b', airev: '#8ecae6', binguoev: '#d6e5e3', cloudev: '#d8dde2',
    xenia: '#cfd4d8', avanza: '#e8e4da', ertiga: '#7b8794', terios: '#d9d6cf', rush: '#2b2f36', xl7: '#59636e', veloz: '#8a2a2a', xpander: '#cfd4da', stargazer: '#bfc6cc',
    raize: '#d9443a', brv: '#d6dade', yariscross: '#1f7a8c', atto3: '#3a7ca5', hiace: '#eef0f2',
    bydm6: '#4a5568', creta: '#c8cfd6', hrv: '#8d99ae', innova: '#c8ccd0', zenix: '#d8d4cc', jimny: '#a7b97d', hiluxdc: '#2b2f36',
    fortuner: '#2b2f36', pajerosport: '#2c3138', civicrs: '#c62828', bydseal: '#457b9d', crv: '#3d4550', ioniq5: '#cfd6dc', camry: '#3a3f46', gr86: '#d9443a',
    staria: '#2e343d', palisade: '#262b33', model3: '#c92a2a', bmw330i: '#1d4e89',
    alphard: '#f3f1ea', vellfire: '#22262b', lexuslm: '#2d3138', landcruiser: '#2b2f36', porsche911: '#d93829', mercg63: '#1e2227'
  };
  function gambarMobil(x, y, bentuk, id, kiri, roda, gp) {
    var w = WARNA_MOBIL[id] || '#e8e4da';
    var gerak = !!(roda && Math.abs(roda) > 0.001);
    var pt = gerak ? roda : 0;
    var lampu = (gp || 0) > 0.2 && gerak;
    cx.save(); cx.translate(x, y); if (kiri) cx.scale(-1, 1);
    if (id === 'hilux' || id === 'triton') {
      /* Pikap bermoncong (bonnet) 100% vektor dengan roda berputar */
      cx.fillStyle = 'rgba(0,0,0,.3)'; cx.beginPath(); cx.ellipse(0, 2, 64, 5, 0, 0, Math.PI * 2); cx.fill();
      kotakBulat(-58, -24, 62, 16, 3, w); kotak(-58, -26, 62, 3, '#8d969b');
      kotakBulat(4, -24, 54, 16, 4, w);
      cx.fillStyle = w; cx.beginPath(); cx.moveTo(4, -24); cx.lineTo(8, -44); cx.lineTo(30, -44); cx.lineTo(42, -24); cx.closePath(); cx.fill();
      cx.fillStyle = 'rgba(130,175,205,.88)'; cx.beginPath(); cx.moveTo(10, -25); cx.lineTo(13, -40); cx.lineTo(28, -40); cx.lineTo(37, -25); cx.closePath(); cx.fill();
      kotak(54, -20, 5, 6, '#fff6cc'); kotak(-59, -20, 4, 6, '#e03c31');
      [-36, 38].forEach(function (rx) {
        bulat(rx, -7, 11.5, '#181a1d'); bulat(rx, -7, 6.2, '#b9c2ca');
        cx.strokeStyle = '#485058'; cx.lineWidth = 1.4; cx.beginPath();
        for (var s = 0; s < 4; s++) { var a = pt + s * Math.PI / 4; cx.moveTo(rx + Math.cos(a) * 5.6, -7 + Math.sin(a) * 5.6); cx.lineTo(rx - Math.cos(a) * 5.6, -7 - Math.sin(a) * 5.6); }
        cx.stroke();
        bulat(rx, -7, 2, '#eef2f5');
      });
    } else if (bentuk === 'van') {
      /* Alphard / Vellfire / HiAce / Staria: boxy MPV mewah + aksen krom */
      gambarMobilRealistis('mpv', w, pt, lampu);
      kotak(52, -28, 7, 18, '#c9b37a'); kotak(-56, -15, 112, 2.5, '#c9b37a');
    } else if (bentuk === 'sport') {
      /* GR 86 / Porsche 911: sports coupe ceper + spoiler belakang */
      gambarMobilRealistis('sedan', w, pt, lampu);
      kotak(-56, -32, 12, 3, '#1f2328'); kotak(-52, -29, 3, 5, '#1f2328');
    } else {
      gambarMobilRealistis(bentuk, w, pt, lampu);
    }
    cx.restore();
  }
  /* adegan jalan raya saat mengantar order ojol */
  function gambarLatarAwal(s, t) {
    var m = s.menit % 1440, jalan = H * 0.62, dasarRuko = jalan - 60, lebar = W + 44, geser = (t * 0.02) % lebar, gp = gelap(m);
    gambarLangit(m, t);
    cx.save(); cx.translate(-geser, 0); gambarRuko(m, dasarRuko); cx.translate(lebar, 0); gambarRuko(m, dasarRuko); cx.restore();
    kotak(0, dasarRuko, W, jalan - dasarRuko, 'rgba(185,178,166,.55)');
    kotak(0, jalan, W, H - jalan, 'rgba(68,72,78,.8)');
    var g3 = (t * 0.1) % 70; cx.fillStyle = '#e9e4d4'; for (var x1 = -70; x1 < W + 70; x1 += 70) cx.fillRect(x1 - g3, jalan + 64, 34, 3);
    if (gp > 0) { cx.fillStyle = 'rgba(10,18,45,' + (gp * 0.35).toFixed(3) + ')'; cx.fillRect(0, 0, W, H); }
  }
  function gambarJalanRaya(s, t) {
    var m = s.menit % 1440, f = s.ojek, jalan = H * 0.62, dasarRuko = jalan - 60, lebar = W + 44, geser = (t * 0.06) % lebar;
    var gp = gelap(m);
    gambarLangit(m, t);
    cx.save(); cx.translate(-geser, 0); gambarRuko(m, dasarRuko); cx.translate(lebar, 0); gambarRuko(m, dasarRuko); cx.restore();
    if (gp > 0) { cx.fillStyle = 'rgba(10,18,45,' + (gp * 0.38).toFixed(3) + ')'; cx.fillRect(0, 0, W, dasarRuko); }
    kotak(0, dasarRuko, W, jalan - dasarRuko, 'rgba(185,178,166,.55)');
    var g2 = (t * 0.25) % 20; for (var x0 = -20; x0 < W + 20; x0 += 20) kotak(x0 - g2, jalan - 7, 10, 7, (Math.round((x0 + 20) / 20)) % 2 ? '#f3f1ea' : '#2b2b2b');
    kotak(0, jalan, W, H - jalan, s.hujan ? 'rgba(38,44,54,.72)' : 'rgba(68,72,78,.72)');
    var g3 = (t * 0.32) % 70; cx.fillStyle = '#e9e4d4'; for (var x1 = -70; x1 < W + 70; x1 += 70) cx.fillRect(x1 - g3, jalan + 64, 34, 3);
    if (gp > 0) { cx.fillStyle = 'rgba(10,18,45,' + (gp * 0.3).toFixed(3) + ')'; cx.fillRect(0, dasarRuko, W, H - dasarRuko); }
    /* kendaraan lain menyalip pelan */
    var sx = W + 80 - ((t * 0.03) % (W + 260));
    gambarMobil(sx, jalan + 130, ['mpv', 'hatch', 'suv'][Math.floor(t / 9000) % 3], ['avanza', 'agya', 'rush'][Math.floor(t / 9000) % 3], false, t * 0.012, gp);
    var antar = f.status === 'antar', goyang = Math.sin(t / 90) * 1.2;
    if (f.mode === 'mobil' && s.mobil) {
      gambarMobil(W * 0.44, jalan + 76, s.mobil.bentuk, s.mobil.id, false, t * 0.018, gp);
      pencahayaanLuar(m, t, jalan, W * 0.44 + 46, jalan + 54);
    } else {
      gambarMotorKu(W * 0.42, jalan + 52 + goyang, s.motorId, { naik: true, jalan: true, bonceng: antar && f.jenis === 'penumpang', muatan: antar && f.jenis !== 'penumpang' ? (f.jenis === 'makanan' ? 'makanan' : 'paket') : null }, t);
      pencahayaanLuar(m, t, jalan, W * 0.42 + 28, jalan + 24 + goyang);
    }
    gambarHujanRealistis(s, t, jalan, 0);
  }
  /* adegan pindahan: pikap membawa kasur, kardus, dan barang */
  function gambarPindahan(s, t) {
    var m = s.menit % 1440, jalan = H * 0.5, dasarRuko = jalan - 60, u = Math.max(0, Math.min(1, s.pindah.u));
    gambarLangit(m, t); gambarRuko(m, dasarRuko);
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
    gambarLangit(m, t); latarTema(f.tema, hor, 0, gp, m); ikonKota(f.kota, W * 0.68, hor + 2, G.sk, gp);
    kotak(0, hor, W, G.jalanTop - hor + 6, '#c9c3b4'); kotak(0, G.jalanTop + 6, W, H - G.jalanTop, 'rgba(68,72,78,.95)');
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
  /* jalan raya antarkota */
  function gambarJalanTravel(s, t, dt) {
    var f = s.travel, m = s.menit % 1440, gp = gelap(m), G = geomTravel(s), hor = G.hor, jt = G.jalanTop, u = f.u;
    tJarak += dt * f.kmh * 0.0045; var geser = tJarak;
    tRoda += dt * Math.max(8, f.kmh || 0) * 0.00055;
    gambarLangit(m, t);
    var tema = u < 0.5 ? f.temaA : f.temaB; latarTema(tema, hor, geser, gp, m);
    if (u < 0.3) ikonKota(f.dari, 200 - u / 0.3 * 340, hor + 2, G.sk, gp);
    if (u > 0.7) ikonKota(f.ke, 160 + (1 - u) / 0.3 * 340, hor + 2, G.sk, gp);
    var knd = f.kondisi || (f.tol ? 'tol' : 'mulus');
    kotak(0, hor, W, jt - hor + 6, f.tol ? '#9aa3a6' : knd === 'tanah' ? '#8c6b43' : '#7d8a6a');
    var wrnJalan = knd === 'tanah' ? (s.hujan ? '#5a3f24' : '#8a653c') : knd === 'rusak' ? (s.hujan ? '#3c3a38' : '#5e5a54') : (s.hujan ? 'rgba(38,44,54,.95)' : 'rgba(68,72,78,.95)');
    kotak(0, jt + 6, W, H - jt, wrnJalan);
    if (knd !== 'tanah') {
      var g3 = (geser * 3) % 70; cx.fillStyle = knd === 'rusak' ? 'rgba(233,228,212,.45)' : '#e9e4d4';
      for (var x1 = -70; x1 < W + 70; x1 += 70) cx.fillRect(x1 - g3, jt + 36, 34, 3);
    }
    if (knd === 'bergelombang' || knd === 'rusak' || knd === 'tanah') {
      var gLub = (geser * 3) % 90;
      cx.fillStyle = knd === 'tanah' ? 'rgba(55,36,18,.55)' : 'rgba(28,28,30,.55)';
      for (var lb = -90; lb < W + 90; lb += 90) {
        cx.beginPath(); cx.ellipse(lb - gLub + 30, jt + 24 + (Math.abs(lb) % 3) * 14, knd === 'rusak' || knd === 'tanah' ? 14 : 9, 4, 0, 0, Math.PI * 2); cx.fill();
      }
    }
    if (f.tol) { kotak(0, jt + 6, W, 3, '#d9d4c8'); var g4 = (geser * 2) % 120; for (var x2 = -120; x2 < W + 120; x2 += 120) { kotak(x2 - g4, jt - 26, 3, 34, '#59656d'); kotak(x2 - g4, jt - 26, 14, 3, '#59656d'); } }
    else { var g5 = (geser * 2.4) % 100; for (var x3 = -100; x3 < W + 100; x3 += 100) pohonBulat(x3 - g5, jt + 4, 0.9, '#3f8a46'); }
    var tx = null, tek = '';
    if (u < 0.2) { tx = 230 - u / 0.2 * 300; tek = 'Meninggalkan ' + RUTE_NAMA(f.dari).slice(0, 14); } else if (u > 0.82) { tx = 240 - (u - 0.82) / 0.18 * 280; tek = 'Menuju ' + RUTE_NAMA(f.ke).slice(0, 15); }
    if (tx !== null) { kotak(tx + 54, jt - 14, 4, 22, '#59656d'); kotakBulat(tx, jt - 36, 112, 22, 5, '#1f8a80'); cx.font = '800 11px "Baloo 2", "Nunito", system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillStyle = '#fff'; cx.fillText(tek, tx + 56, jt - 25); }
    selimutMalam(gp, 0.36);
    var goyF = knd === 'tanah' ? 2.2 : knd === 'rusak' ? 1.6 : knd === 'bergelombang' ? 1.0 : 0.35;
    var goyang = Math.sin(t / (knd === 'tanah' || knd === 'rusak' ? 55 : 90)) * Math.min(2.4, (f.kmh / 70) * goyF), mob = s.mobil || { bentuk: 'mpv', id: 'avanza' };
    var sx = -90 + ((t * (0.02 + f.kmh * 0.0004)) % (W + 300)); gambarMobil(sx, jt + 26, ['mpv', 'hatch', 'suv'][Math.floor(t / 11000) % 3], ['avanza', 'agya', 'rush'][Math.floor(t / 11000) % 3], false, t * 0.014, gp);
    gambarMobil(W * 0.46, G.carY + goyang, mob.bentuk, mob.id, false, tRoda, gp);
    pencahayaanLuar(m, t, jt, W * 0.46 + 46, G.carY - 22 + goyang);
    if (f.kmh > 55) { cx.strokeStyle = 'rgba(255,255,255,' + Math.min(0.5, (f.kmh - 55) / 150) + ')'; cx.lineWidth = 1.5; for (var sl = 0; sl < 8; sl++) { var ly = jt + 12 + acak(sl + 31) * 50, lx = ((t * (0.5 + f.kmh / 100) + sl * 97) % (W + 100)); cx.beginPath(); cx.moveTo(W - lx, ly); cx.lineTo(W - lx + 30 + f.kmh / 4, ly); cx.stroke(); } }
    gambarHujanRealistis(s, t, jt, 0);
    teksTengah(RUTE_NAMA(f.dari) + ' → ' + RUTE_NAMA(f.ke), 182, 16);
  }
  function gambarKapalTravel(s, t) {
    var f = s.travel, m = s.menit % 1440, gp = gelap(m), G = geomTravel(s), hor = Math.min(G.hor - 40, H * 0.5);
    gambarLangit(m, t);
    var gr = cx.createLinearGradient(0, hor, 0, H); gr.addColorStop(0, 'rgba(120,190,225,1)'); gr.addColorStop(1, 'rgba(30,90,140,1)'); cx.fillStyle = gr; cx.fillRect(0, hor, W, H - hor);
    ikonKota(f.dari === 'bakauheni' ? 'bakauheni' : 'merak', 60 - f.u * 200, hor + 2, G.sk, gp); ikonKota(f.ke === 'merak' ? 'merak' : 'bakauheni', 330 + (1 - f.u) * 260, hor + 2, G.sk, gp);
    var gl = Math.sin(t / 700) * 3, y0 = G.bawah - 40 + gl;
    poli([40, y0, 320, y0, 296, y0 + 30, 64, y0 + 30], '#e8e4da'); poli([40, y0, 320, y0, 316, y0 - 8, 44, y0 - 8], '#d9553a'); kotak(226, y0 - 46, 64, 38, '#f6f3ea'); kotak(232, y0 - 38, 50, 9, '#5b7a8a'); kotak(250, y0 - 62, 14, 18, '#d9553a');
    var mob = s.mobil || { bentuk: 'mpv', id: 'avanza' }; gambarMobil(130, y0 - 6, mob.bentuk, mob.id, false, 0, gp);
    cx.strokeStyle = 'rgba(255,255,255,.6)'; cx.lineWidth = 2; for (var w4 = 0; w4 < 9; w4++) { var wx = ((w4 * 52 - t * 0.05) % (W + 60) + W + 60) % (W + 60) - 30, wy = y0 + 36 + (w4 % 4) * 12; cx.beginPath(); cx.moveTo(wx, wy); cx.quadraticCurveTo(wx + 8, wy - 4, wx + 16, wy); cx.stroke(); }
    selimutMalam(gp, 0.36); hujanTravel(s, t);
    teksTengah('Kapal ' + RUTE_NAMA(f.dari) + ' → ' + RUTE_NAMA(f.ke), 182, 16);
  }

  /* perjalanan pulang atau berangkat antar tempat: jalan kota bergulir, jarak sisa terlihat */
  function gambarPerjalanan(s, t, dt) {
    var f = s.transit, m = s.menit % 1440, gp = gelap(m), jalan = H * 0.62, dasarRuko = jalan - 60, lebar = W + 44;
    var kaki = f.kend === 'kaki';
    tJarak += dt * (kaki ? 0.1 : 0.34); var geser = tJarak % lebar;
    gambarLangit(m, t);
    cx.save(); cx.translate(-geser, 0); gambarRuko(m, dasarRuko); cx.translate(lebar, 0); gambarRuko(m, dasarRuko); cx.restore();
    if (gp > 0) { cx.fillStyle = 'rgba(10,18,45,' + (gp * 0.38).toFixed(3) + ')'; cx.fillRect(0, 0, W, dasarRuko); }
    kotak(0, dasarRuko, W, jalan - dasarRuko, 'rgba(185,178,166,.9)');
    var g2 = (geser * 3.2) % 20; for (var x0 = -20; x0 < W + 20; x0 += 20) kotak(x0 - g2, jalan - 7, 10, 7, (Math.round((x0 + 20) / 20)) % 2 ? '#f3f1ea' : '#2b2b2b');
    kotak(0, jalan, W, H - jalan, s.hujan ? 'rgba(38,44,54,.95)' : 'rgba(68,72,78,.95)');
    var g3 = (geser * 3.4) % 70; cx.fillStyle = '#e9e4d4'; for (var x1 = -70; x1 < W + 70; x1 += 70) cx.fillRect(x1 - g3, jalan + 64, 34, 3);
    if (gp > 0) { cx.fillStyle = 'rgba(10,18,45,' + (gp * 0.3).toFixed(3) + ')'; cx.fillRect(0, dasarRuko, W, H - dasarRuko); }
    if (!kaki) { var sx = W + 80 - ((t * 0.03) % (W + 260)); gambarMobil(sx, jalan + 130, ['mpv', 'hatch', 'suv'][Math.floor(t / 9000) % 3], ['avanza', 'agya', 'rush'][Math.floor(t / 9000) % 3], false, t * 0.012, gp); }
    var goyang = Math.sin(t / 90) * 1.2;
    if (f.kend === 'mobil') { var mob = s.mobil || { bentuk: 'mpv', id: 'avanza' }; gambarMobil(W * 0.46, jalan + 84, mob.bentuk, mob.id, false, t * 0.016, gp); }
    else if (f.kend === 'kaki') {
      if (!gambarKarakterPenuh(imCharFull(s.namaPemain, s.gender), W * 0.45, jalan + 88, 126, t * 2.4, { label: s.namaPemain || 'Kamu' })) {
        gambarKarakterRumah(W * 0.45, jalan + 78, s.gender === 'cowok' ? 'cowok' : 'cewek', t * 2.4, { skala: 1.5, label: s.namaPemain || 'Kamu' });
      }
    }
    else gambarMotorKu(W * 0.42, jalan + 52 + goyang, f.kend === 'motor' ? s.motorId : 'beat', { naik: true, jalan: true, bonceng: f.kend === 'ojek' }, t);
    pencahayaanLuar(m, t, jalan, kaki ? null : (f.kend === 'mobil' ? W * 0.46 + 46 : W * 0.42 + 28), kaki ? null : (f.kend === 'mobil' ? jalan + 62 + goyang : jalan + 24 + goyang));
    gambarHujanRealistis(s, t, jalan, 0);
    var kePulang = f.ke === 'kos', sisa = Math.max(0, f.km * (1 - f.u));
    teksTengah(kePulang ? 'Pulang ke rumah' : 'Berangkat narik', 182, 18);
    teksTengah(sisa.toFixed(1).replace('.', ',') + ' km lagi · total ' + String(f.km).replace('.', ',') + ' km', 208, 13);
    kotakBulat(60, 228, 240, 8, 4, 'rgba(29,43,51,.45)'); kotakBulat(60, 228, Math.max(8, 240 * Math.min(1, f.u)), 8, 4, '#f2a516');
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
  function gambar(s, t) { gambarInti(s, t); if (s.ramadan && !s.hbAnim && cx) hiasRamadan(s, t); }
  function gambarInti(s, t) {
    if (!cx) return;
    var dt = tAkhir ? Math.min(100, t - tAkhir) : 16; tAkhir = t; genderPemain = s.gender || 'cewek';
    anim.rolling += ((s.buka ? 1 : 0) - anim.rolling) * Math.min(1, dt / 260);
    if (Math.abs(anim.rolling - (s.buka ? 1 : 0)) < 0.003) anim.rolling = s.buka ? 1 : 0;
    anim.pantulKedai = Math.max(0, anim.pantulKedai - dt / 600);
    anim.pantulBarista = Math.max(0, anim.pantulBarista - dt / 500);
    anim.kedip -= dt; if (anim.kedip < -3400 - Math.random() * 1500) anim.kedip = 140;
    aturMotor(dt, s.menit, s.jalan ? s.kecepatan : 0.4);

    if (s.hbAnim && s.posisi !== 'kos') { cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0); cx.fillStyle = '#2a1a26'; cx.fillRect(0, 0, W, H); gambarAdeganHb(s, t); kotakKedai = null; kotakBarista = null; kotakDepan = null; return; }
    if (s.latarAwal) { cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0); gambarLatarAwal(s, t); kotakKedai = null; kotakBarista = null; kotakDepan = null; return; }
    if (s.pindah) { cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0); gambarPindahan(s, t); kotakKedai = null; kotakBarista = null; kotakDepan = null; return; }
    if (s.transit) { cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0); gambarPerjalanan(s, t, dt); kotakKedai = null; kotakBarista = null; kotakDepan = null; return; }
    if (s.travel) {
      cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0);
      if (s.travel.mode === 'jalan') gambarJalanTravel(s, t, dt); else if (s.travel.mode === 'kapal') gambarKapalTravel(s, t); else gambarPoolTravel(s, t);
      kotakKedai = null; kotakBarista = null; kotakDepan = null; return;
    }
    if (s.ojek && s.ojek.status !== 'standby' && (s.ojek.mode === 'mobil' ? s.mobil : s.motorId)) { cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0); gambarJalanRaya(s, t); kotakKedai = null; kotakBarista = null; kotakDepan = null; return; }
    if (s.posisi === 'kos') { cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0); gambarKos(s, t); kotakKedai = null; kotakBarista = null; kotakDepan = null; return; }
    var jalan = H - 190, trotoar = jalan - 72, dasarRuko = trotoar + 4, dasarKedai = jalan - 20, m = s.menit, yKaki = jalan - 9;
    /* angkat adegan saat panel racik menutupi kaki pembeli */
    var skala = cv.getBoundingClientRect().width / W || 1;
    var targetAngkat = Math.max(0, yKaki + 12 - (H - (s.ruangBawah || 0) / skala));
    anim.angkat += (targetAngkat - anim.angkat) * Math.min(1, dt / 160);
    var f = cv.width / W;
    cx.setTransform(f, 0, 0, f, 0, -anim.angkat * f);
    var gp = gelap(m);
    gambarLangit(m, t);
    gambarRuko(m, dasarRuko);
    if (gp > 0) { cx.fillStyle = 'rgba(10,18,45,' + (gp * 0.38).toFixed(3) + ')'; cx.fillRect(0, 0, W, dasarRuko); }
    gambarJalan(trotoar, jalan);
    gambarTiang(dasarKedai, dasarRuko - 270);
    if (s.berhentiSewa) {
      /* mode driver: tidak ada kedai, hanya jalan raya vektor dan pemain vektor di tepi jalan */
      kotakKedai = { x: 160, y: dasarKedai - 140, w: 192, h: 140, bx: 180, by: dasarKedai - 110, bw: 152, bh: 54 }; kotakBarista = null;
      if (!s.ojek || s.ojek.status === 'standby') {
        gambarKarakterRumah(242, dasarKedai + 6, s.gender || 'cewek', t, { skala: 1.25, baju: '#00aa13', label: s.namaPemain || 'Driver' });
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
    if (s.ojek && s.ojek.status === 'standby' && s.ojek.mode !== 'mobil' && s.motorId) gambarMotorKu(300, jalan + 32, s.motorId, { naik: true, hp: true, kiri: true }, t);
    else if (s.motorParkir) { if (SPORT[s.motorParkir]) gambarMotorKu(312, jalan + 32, s.motorParkir, { kiri: true }, t); else gambarParkir(312, jalan + 20, s.motorParkir, m); }
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
  g.KK_ADEGAN = { init: init, gambar: gambar, ketuk: ketuk, ukur: ukur, gelap: gelap, racikSaja: racikSaja, pilihChar: pilihKunciChar };
})(window);
