/* adegan.js — adegan kedai di kanvas 2D: langit sesuai jam, ruko, tiang listrik, kontainer, barista, motor lewat.
   Gambar masih bentuk sederhana; gambar AI menggantikan bagian ini di tahap 9. */
(function (g) {
  'use strict';
  var cv, cx, W = 360, H = 640, dpr = 1;
  var anim = { rolling: 0, pantulKedai: 0, pantulBarista: 0, kedip: 0, motor: [], tMotor: 0, angkat: 0, teks: [], cup: [] };
  var ruko = [];

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

  function gambarBarista(x, y, t) {
    var bob = Math.sin(t / 420) * 1.2, p = anim.pantulBarista, sk = 1 + Math.sin(p * 18) * 0.08 * p;
    cx.save(); cx.translate(x, y + bob); cx.scale(1 / sk, sk);
    /* badan dan celemek */
    kotakBulat(-17, -6, 34, 30, 10, '#2c3e50');
    kotakBulat(-11, -2, 22, 26, 6, '#f2a516');
    /* kepala */
    bulat(0, -24, 17, '#f1c39b');
    cx.fillStyle = '#2a1d1a'; cx.beginPath(); cx.arc(0, -27, 17, Math.PI * 1.05, Math.PI * 1.95); cx.fill();
    /* topi */
    kotakBulat(-16, -44, 32, 12, 6, '#155e57'); kotak(2, -35, 20, 4, '#155e57');
    /* mata berkedip */
    var tutup = anim.kedip > 0;
    cx.fillStyle = '#2a1d1a';
    if (tutup) { cx.fillRect(-8, -23, 6, 1.6); cx.fillRect(3, -23, 6, 1.6); }
    else { bulat(-5, -22, 2.4, '#2a1d1a'); bulat(6, -22, 2.4, '#2a1d1a'); }
    bulat(-10, -16, 3, 'rgba(230,120,110,.35)'); bulat(11, -16, 3, 'rgba(230,120,110,.35)');
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
      var ekstra = Math.min(2, Math.max(0, (s.staf || 0)));
      for (var e = 0; e < ekstra; e++) { cx.save(); cx.translate(e === 0 ? bx + 26 : bx + bw - 26, by + bh + 4); cx.scale(0.82, 0.82); gambarBarista(0, 0, t + 900 * (e + 1)); cx.restore(); }
      gambarBarista(bx + bw / 2, by + bh + 2, t);
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
    /* papan nama */
    kotakBulat(x0 + 28, y0 - 34, w - 56, 26, 6, '#2a1d1a');
    cx.fillStyle = '#ffe3a1'; cx.font = '700 15px "Baloo 2", "Nunito", system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText('Kopi Kontainer', x0 + w / 2, y0 - 20);
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

  /* motor lewat: lebih ramai siang, sepi tengah malam */
  function aturMotor(dt, m, kec) {
    var ramai = m < 300 ? 0.15 : m < 420 ? 0.6 : m < 1260 ? 1 : 0.35;
    anim.tMotor -= dt * kec;
    if (anim.tMotor <= 0) {
      anim.tMotor = (1800 + Math.random() * 3800) / ramai;
      var kanan = Math.random() < 0.5, warna = ['#d9443a', '#2f6fb0', '#222', '#e8e4da', '#2f8f5b', '#7a4fa0'][Math.floor(Math.random() * 6)];
      anim.motor.push({ x: kanan ? -50 : W + 50, arah: kanan ? 1 : -1, jalur: kanan ? 1 : 0, v: 70 + Math.random() * 50, warna: warna, helm: ['#f2a516', '#fff', '#1f8a80', '#111'][Math.floor(Math.random() * 4)] });
    }
    anim.motor.forEach(function (mt) { mt.x += mt.arah * mt.v * dt / 1000 * Math.min(kec, 2); });
    anim.motor = anim.motor.filter(function (mt) { return mt.x > -80 && mt.x < W + 80; });
  }
  function gambarMotor(mt, jalan, m) {
    var y = jalan + 40 + mt.jalur * 44, d = mt.arah;
    cx.save(); cx.translate(mt.x, y); cx.scale(d, 1);
    cx.fillStyle = 'rgba(0,0,0,.25)'; cx.beginPath(); cx.ellipse(0, 12, 26, 4, 0, 0, Math.PI * 2); cx.fill();
    bulat(-16, 6, 7, '#1b1b1b'); bulat(16, 6, 7, '#1b1b1b'); bulat(-16, 6, 3, '#9aa3a6'); bulat(16, 6, 3, '#9aa3a6');
    kotakBulat(-18, -6, 34, 10, 5, mt.warna);
    kotak(10, -16, 3, 12, '#333');
    kotakBulat(-8, -22, 12, 18, 5, '#3d5a80');
    bulat(-2, -28, 7, mt.helm);
    if (gelap(m) > 0.4) { var gr = cx.createRadialGradient(22, -4, 0, 22, -4, 40); gr.addColorStop(0, 'rgba(255,240,190,.5)'); gr.addColorStop(1, 'rgba(255,240,190,0)'); cx.fillStyle = gr; cx.fillRect(18, -30, 50, 50); }
    cx.restore();
  }

  /* ---------- pembeli ---------- */
  var BAJU = ['#e0675a', '#3f7fbf', '#7a9e4a', '#e0a33a', '#8a6bb8'];
  var X_DEPAN = 222, JARAK = 36, kotakDepan = null;
  function gambarOrang(o, yKaki, t, menit) {
    var x = o.x, jalan = Math.abs(o.x - o.tx) > 1, langkahK = jalan ? Math.sin(t / 90 + o.id) : 0, r = o.rupa;
    var bob = jalan ? Math.abs(langkahK) * 2 : Math.sin(t / 500 + o.id) * 0.8;
    var lompat = o.lompat > 0 ? Math.sin((1 - o.lompat) * Math.PI) * 8 : 0;
    var y = yKaki - bob - lompat, baju = BAJU[r.baju], celana = '#33414d', hadap = o.keadaan === 'pulang' ? o.arahPulang : (o.tx > o.x + 1 ? 1 : o.tx < o.x - 1 ? -1 : 1);
    if (o.jenis === 'kantor') { baju = '#eef2f5'; celana = '#2c3640'; }
    if (o.jenis === 'ojol') baju = '#4f6b3a';
    cx.fillStyle = 'rgba(0,0,0,.18)'; cx.beginPath(); cx.ellipse(x, yKaki + 1, 13, 3.5, 0, 0, Math.PI * 2); cx.fill();
    /* anak kecil ikut keluarga */
    if (o.jenis === 'keluarga') {
      var kx = x - 15 * hadap;
      kotak(kx - 3, y - 10, 2.6, 10, '#33414d'); kotak(kx + 1, y - 10, 2.6, 10, '#33414d');
      kotakBulat(kx - 6, y - 24, 12, 15, 4, '#f2a516'); bulat(kx, y - 30, 7, r.kulit);
      cx.fillStyle = r.rambut; cx.beginPath(); cx.arc(kx, y - 32, 7, Math.PI, 0); cx.fill();
    }
    /* kaki */
    kotak(x - 6 + langkahK * 2, y - 16, 5, 16, celana); kotak(x + 1 - langkahK * 2, y - 16, 5, 16, celana);
    /* ransel mahasiswa */
    if (o.jenis === 'mahasiswa') kotakBulat(x - 13 * hadap - 5, y - 40, 10, 20, 3, '#2f3e4a');
    /* badan */
    kotakBulat(x - 11, y - 42, 22, 28, 7, baju);
    if (o.jenis === 'kantor') { cx.strokeStyle = '#2f6fb0'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(x - 4, y - 41); cx.lineTo(x, y - 30); cx.lineTo(x + 4, y - 41); cx.stroke(); kotak(x - 2, y - 30, 4, 5, '#2f6fb0'); }
    if (o.jenis === 'ojol') kotak(x - 11, y - 30, 22, 3, '#d8d8c8');
    /* kepala */
    var yk = y - 52;
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
    /* tangan: HP pembuat konten, cup yang dibawa pulang */
    if (o.jenis === 'konten' && !o.bawaCup) { kotak(x + 9 * hadap - 2, y - 46, 5, 9, '#222'); kotak(x + 9 * hadap - 1, y - 45, 3, 6, '#7fd3e8'); }
    if (o.bawaCup) gambarCup(x + 13 * hadap, y - 30, o.menu, 0.8);
    /* rasa sabar dan pesanan */
    if (o.keadaan === 'antre' || o.keadaan === 'dilayani') {
      if (o.keadaan === 'antre') {
        var sisa = Math.max(0, 1 - (menit - o.tiba) / o.sabar);
        kotakBulat(x - 13, yk - 22, 26, 5, 2.5, 'rgba(0,0,0,.35)');
        kotakBulat(x - 12, yk - 21, Math.max(2, 24 * sisa), 3, 1.5, sisa > 0.5 ? '#4fbf6a' : sisa > 0.25 ? '#f2a516' : '#d9443a');
      }
      if (o.slot === 0) {
        cx.font = '800 12px "Baloo 2", "Nunito", system-ui, sans-serif';
        var tw = cx.measureText(o.menu.pendek).width + 16, bxx = Math.min(W - tw - 4, Math.max(4, x - tw / 2)), byy = yk - 52;
        kotakBulat(bxx, byy, tw, 24, 10, o.keadaan === 'dilayani' ? '#f2a516' : '#fbfaf6');
        cx.fillStyle = o.keadaan === 'dilayani' ? '#f2a516' : '#fbfaf6';
        cx.beginPath(); cx.moveTo(x - 5, byy + 23); cx.lineTo(x + 5, byy + 23); cx.lineTo(x, byy + 30); cx.closePath(); cx.fill();
        cx.fillStyle = '#1d2b33'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(o.menu.pendek, bxx + tw / 2, byy + 12.5);
        kotakDepan = { x: x - 18, y: byy, w: 36, h: yKaki - byy };
      }
    }
  }
  function gambarCup(x, y, menu, sk) {
    cx.save(); cx.translate(x, y); cx.scale(sk, sk);
    var panas = menu && (menu.id === 'hitam' || menu.id === 'sanger');
    var isi = { aren: '#a8774e', klasik: '#c49a6c', hitam: '#3a2116', sanger: '#b78a5c', cokelat: '#6b3b25', teh: '#b8622a' }[menu ? menu.id : 'aren'];
    if (panas) { kotak(-6, -12, 12, 14, '#f3e6d0'); kotak(-6, -6, 12, 5, '#1f8a80'); kotak(-7, -14, 14, 3, '#fbfaf6'); }
    else { cx.fillStyle = isi; cx.beginPath(); cx.moveTo(-7, -14); cx.lineTo(7, -14); cx.lineTo(5, 3); cx.lineTo(-5, 3); cx.closePath(); cx.fill();
      cx.fillStyle = 'rgba(255,255,255,.35)'; cx.fillRect(-5, -12, 3, 12); kotak(-8, -17, 16, 3, '#e8f4f8'); kotak(1, -26, 2, 10, '#d9443a'); }
    cx.restore();
  }
  function aturPembeli(daftar, dMenit, dt) {
    daftar.forEach(function (o) {
      if (o.tx == null) o.tx = o.x;
      if (o.keadaan === 'pulang') { o.tx = o.arahPulang < 0 ? -50 : W + 50; }
      else o.tx = X_DEPAN - (o.slot || 0) * JARAK;
      var laju = o.keadaan === 'pulang' ? 70 * dt / 1000 : 37 * dMenit;
      var d = o.tx - o.x; o.x += Math.sign(d) * Math.min(Math.abs(d), laju);
      if (o.lompat > 0) o.lompat = Math.max(0, o.lompat - dt / 450);
      if (o.efek) {
        var e = o.efek; o.efek = null;
        anim.teks.push({ teks: e.teks, x: o.x, y: 0, umur: 0, warna: e.warna });
        if (e.cup) { anim.cup.push({ x0: X_DEPAN, x1: o.x, u: 0, menu: o.menu, id: o.id }); o.bawaCup = false; o.tundaCup = true; }
      }
      if (o.keadaan === 'pulang' && (o.x < -45 || o.x > W + 45)) o.hilang = true;
    });
  }

  /* motor milik kedai, diparkir di tepi jalan */
  var WARNA_MOTOR = { dazz: '#2f6fb0', revo: '#d9443a', mio: '#7a4fa0', beat: '#e8e4da', gear: '#2b2b2b', supra: '#2f6fb0', vario: '#d9443a', icon: '#7fd3e8', nmax: '#3b3f46', rxking: '#2b2b2b', 'beat-bekas': '#d9443a', 'supra-bekas': '#2b2b2b' };
  function gambarParkir(x, y, id, m) {
    cx.save(); cx.translate(x, y); cx.scale(-1, 1);
    cx.fillStyle = 'rgba(0,0,0,.25)'; cx.beginPath(); cx.ellipse(0, 12, 28, 4, 0, 0, Math.PI * 2); cx.fill();
    bulat(-17, 6, 8, '#1b1b1b'); bulat(17, 6, 8, '#1b1b1b'); bulat(-17, 6, 3.5, '#9aa3a6'); bulat(17, 6, 3.5, '#9aa3a6');
    var w = WARNA_MOTOR[id] || '#d9443a';
    if (id === 'rxking') { kotakBulat(-14, -10, 24, 9, 4, w); kotakBulat(-4, -16, 16, 8, 4, w); kotak(-16, -4, 30, 4, '#9aa3a6'); kotak(-20, -14, 14, 5, '#3b2a22'); }
    else { kotakBulat(-20, -6, 38, 11, 5, w); kotakBulat(-18, -14, 18, 7, 3, '#2b2b2b'); }
    kotak(12, -20, 3, 16, '#333'); kotak(8, -22, 10, 3, '#333');
    cx.restore();
    if (gelap(m) > 0.4) { cx.fillStyle = 'rgba(10,18,45,' + (gelap(m) * 0.3).toFixed(2) + ')'; cx.fillRect(x - 32, y - 26, 64, 44); }
  }

  /* ---------- kamar kos ---------- */
  /* ---------- rumah sendiri: denah ringkas supaya barang terlihat di atas tombol bawah ---------- */
  function gambarRumah(s, t) {
    var m = s.menit % 1440, gp = gelap(m), b = s.barang || {}, rumah = s.rumah, lantai = Math.max(330, H - 300);
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
    if (b.ac) { kotakBulat(196, lantai - 236, 112, 32, 8, '#f6f6f2'); kotak(204, lantai - 212, 96, 3, '#d6d6d0'); bulat(294, lantai - 226, 2.5, s.acNyala ? '#4fbf6a' : '#d9443a');
      if (s.acNyala && s.tidur) { cx.strokeStyle = 'rgba(150,200,230,.5)'; cx.lineWidth = 2; for (var a = 0; a < 3; a++) { var yy = lantai - 196 + a * 10 + Math.sin(t / 300 + a) * 3; cx.beginPath(); cx.moveTo(212, yy); cx.quadraticCurveTo(252, yy + 6, 292, yy); cx.stroke(); } } }
    /* dinding belakang: dapur kecil, mesin cuci, TV, kulkas */
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
      if (b.ps5 || b.ps5disc) { kotakBulat(276, lantai - 22, 12, 26, 4, '#f6f6f2'); kotak(280, lantai - 18, 4, 18, '#1b1b1b'); }
      else if (b.ps4 || b.ps3 || b.ps2) { kotakBulat(274, lantai - 16, 16, 20, 2, '#1b1b1b'); kotak(276, lantai - 14, 2, 16, '#2f6fb0'); }
      else if (b.ps1) { kotakBulat(274, lantai - 12, 18, 14, 2, '#b8bfc4'); bulat(283, lantai - 5, 5, '#9aa3a6'); }
    }
    if (b.kulkas2) { kotakBulat(302, lantai - 96, 50, 126, 5, '#d8dde1'); kotak(326, lantai - 92, 2, 118, '#b8c0c6'); kotak(318, lantai - 50, 3, 18, '#8d969b'); kotak(331, lantai - 50, 3, 18, '#8d969b'); }
    else if (b.kulkas) { kotakBulat(304, lantai - 56, 46, 84, 5, '#e8ecef'); kotak(308, lantai - 26, 38, 2, '#c8ced3'); kotak(340, lantai - 46, 3, 14, '#9aa3a6'); }
    /* lantai depan: kasur, karpet, sofa, meja makan, kipas */
    if (b.karpet) kotakBulat(176, lantai + 76, 168, 56, 10, '#b85c4a');
    if (b.springbed) { kotakBulat(10, lantai + 20, 12, 82, 4, '#6b4a2e'); kotakBulat(14, lantai + 50, 156, 56, 10, '#6b4a2e'); kotakBulat(18, lantai + 36, 148, 34, 10, '#f3f1ea'); kotakBulat(22, lantai + 28, 44, 22, 10, '#fff'); kotakBulat(66, lantai + 40, 98, 28, 8, '#c86a5a'); }
    else { kotakBulat(14, lantai + 70, 156, 30, 8, '#e9e2cf'); kotakBulat(18, lantai + 58, 148, 22, 8, '#f3f1ea'); kotakBulat(22, lantai + 50, 42, 18, 8, '#fff'); kotakBulat(66, lantai + 60, 98, 20, 8, '#a5b88a'); }
    var yKepala = b.springbed ? lantai + 34 : lantai + 54;
    if (s.tidur) {
      bulat(42, yKepala, 11, '#f1c39b'); cx.fillStyle = '#2a1d1a'; cx.beginPath(); cx.arc(42, yKepala - 3, 11, Math.PI, 0); cx.fill();
      cx.fillStyle = '#5b6b73'; cx.font = '800 16px "Baloo 2", system-ui, sans-serif'; cx.fillText('z', 64, yKepala - 24 - (t / 40) % 12); cx.fillText('Z', 76, yKepala - 40 - (t / 50) % 14);
    }
    if (b.sofa) { kotakBulat(184, lantai + 84, 150, 46, 14, '#5b7a8c'); kotakBulat(190, lantai + 70, 138, 28, 12, '#6d8ea1'); }
    if (b.mejamakan) { kotakBulat(18, lantai + 112, 18, 26, 3, '#a86c3c'); kotak(36, lantai + 112, 80, 7, '#8f5a31'); kotak(42, lantai + 119, 5, 20, '#6b4a2e'); kotak(104, lantai + 119, 5, 20, '#6b4a2e'); kotakBulat(118, lantai + 112, 18, 26, 3, '#a86c3c'); }
    if (b.kipas) { kotak(178, lantai + 30, 4, 50, '#3b3f46'); bulat(180, lantai + 24, 16, '#dfeef3'); cx.save(); cx.translate(180, lantai + 24); cx.rotate(t / 60); kotak(-2, -13, 4, 26, '#9ab'); kotak(-13, -2, 26, 4, '#9ab'); cx.restore(); }
    if (s.tidur) { cx.fillStyle = 'rgba(10,18,45,.45)'; cx.fillRect(0, 0, W, H); }
    else if (gp > 0.5) { cx.fillStyle = 'rgba(255,230,180,.06)'; cx.fillRect(0, 0, W, H); }
  }
  function gambarKos(s, t) {
    if (s.rumah) return gambarRumah(s, t);
    var m = s.menit % 1440, gp = gelap(m), b = s.barang || {}, rumah = s.rumah;
    var lantai = Math.max(330, H - 300);
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
    /* AC di dinding: kos sudah ada; rumah harus beli */
    if (!rumah || b.ac) { kotakBulat(214, lantai - 300, 112, 34, 8, '#f6f6f2'); kotak(222, lantai - 274, 96, 3, '#d6d6d0');
      bulat(312, lantai - 290, 2.5, s.acNyala ? '#4fbf6a' : '#d9443a'); }
    if (rumah) { /* pintu dan saklar */ kotakBulat(296, lantai - 200, 58, 200, 3, rumah === 'mewah' ? '#6b4a2e' : '#9c7a52'); bulat(344, lantai - 96, 3, '#e0d3b8'); }
    if (s.acNyala && s.tidur) { cx.strokeStyle = 'rgba(150,200,230,.5)'; cx.lineWidth = 2; for (var a = 0; a < 3; a++) { var yy = lantai - 258 + a * 10 + Math.sin(t / 300 + a) * 3; cx.beginPath(); cx.moveTo(230, yy); cx.quadraticCurveTo(270, yy + 6, 310, yy); cx.stroke(); } }
    /* lemari bawaan kos */
    if (!rumah) { kotakBulat(276, lantai - 170, 70, 180, 4, '#9c7a52'); kotak(310, lantai - 165, 2, 170, '#7d5f3f'); bulat(304, lantai - 80, 2.5, '#e0d3b8'); bulat(318, lantai - 80, 2.5, '#e0d3b8'); }
    /* kasur: kos bawaan; rumah pakai kasur lantai sampai beli spring bed */
    if (rumah && !b.springbed) { kotakBulat(20, lantai + 60, 200, 34, 8, '#e9e2cf'); kotakBulat(26, lantai + 46, 188, 26, 8, '#f3f1ea'); kotakBulat(30, lantai + 38, 50, 20, 8, '#fff'); kotakBulat(84, lantai + 48, 128, 24, 8, '#a5b88a'); }
    else {
      if (b.springbed) kotakBulat(16, lantai - 40, 14, 120, 4, '#6b4a2e');
      kotakBulat(20, lantai + 30, 200, 70, 10, b.springbed ? '#6b4a2e' : '#7d5f3f');
      kotakBulat(24, lantai + 14, 192, 40, 10, '#f3f1ea'); kotakBulat(30, lantai + 4, 54, 24, 10, '#ffffff');
      kotakBulat(84, lantai + 18, 130, 34, 8, b.springbed ? '#c86a5a' : '#6aa0c8'); /* selimut */
    }
    if (s.tidur) {
      if (rumah && !b.springbed) cx.translate(0, 34);
      bulat(58, lantai + 12, 13, '#f1c39b'); cx.fillStyle = '#2a1d1a'; cx.beginPath(); cx.arc(58, lantai + 9, 13, Math.PI, 0); cx.fill();
      cx.fillStyle = '#5b6b73'; cx.font = '800 16px "Baloo 2", system-ui, sans-serif'; cx.fillText('z', 84, lantai - 14 - (t / 40) % 12); cx.fillText('Z', 96, lantai - 30 - (t / 50) % 14);
      if (rumah && !b.springbed) cx.translate(0, -34);
    }
    if (b.karpet) kotakBulat(150, lantai + 120, 150, 50, 10, '#b85c4a');
    if (b.kipas) { kotak(250, lantai + 40, 4, 60, '#3b3f46'); bulat(252, lantai + 34, 18, '#dfeef3'); cx.save(); cx.translate(252, lantai + 34); cx.rotate(t / 60); kotak(-2, -15, 4, 30, '#9ab'); kotak(-15, -2, 30, 4, '#9ab'); cx.restore(); }
    if (b.kulkas2) { kotakBulat(240, lantai - 40, 52, 136, 5, '#d8dde1'); kotak(265, lantai - 36, 2, 128, '#b8c0c6'); kotak(258, lantai + 10, 3, 18, '#8d969b'); kotak(270, lantai + 10, 3, 18, '#8d969b'); }
    else if (b.kulkas) { kotakBulat(296, lantai + 10, 50, 86, 5, '#e8ecef'); kotak(300, lantai + 40, 42, 2, '#c8ced3'); kotak(336, lantai + 20, 3, 14, '#9aa3a6'); }
    /* meja TV */
    if (b.tv || b.tv55) {
      var besar = b.tv55 && rumah ? 1.35 : 1;
      kotak(150, lantai + 60, 120 * besar > 140 ? 130 : 110, 30, '#7d5f3f');
      kotakBulat(170 - (besar - 1) * 45, lantai - 10 - (besar - 1) * 58, 90 * besar, 58 * besar, 4, '#1b1b1b');
      var nyalaTv = !s.tidur && (m >= 1080 || m < 120);
      kotak(174 - (besar - 1) * 45, lantai - 6 - (besar - 1) * 58, 90 * besar - 8, 58 * besar - 10, nyalaTv ? ['#3a6fb0', '#4fa060', '#b06a3a'][Math.floor(t / 1200) % 3] : '#2b2f36');
      kotak(210, lantai + 48, 10, 12, '#1b1b1b');
      if (b.ps5 || b.ps5disc) { kotakBulat(240, lantai + 30, 14, 30, 4, '#f6f6f2'); kotak(244, lantai + 34, 6, 22, '#1b1b1b'); }
      else if (b.ps4 || b.ps3 || b.ps2) { kotakBulat(238, lantai + 38, 18, 22, 2, '#1b1b1b'); kotak(240, lantai + 40, 2, 18, '#2f6fb0'); }
      else if (b.ps1) { kotakBulat(238, lantai + 44, 20, 16, 2, '#b8bfc4'); bulat(248, lantai + 52, 5, '#9aa3a6'); }
    }
    if (b.ricecooker) { bulat(190, lantai + 98, 12, '#f6f6f2'); kotak(180, lantai + 98, 20, 10, '#f6f6f2'); }
    if (b.dispenser) { kotak(14, lantai + 110, 24, 40, '#f3f1ea'); kotakBulat(12, lantai + 80, 28, 32, 6, 'rgba(150,200,230,.7)'); }
    if (b.sofa) { kotakBulat(110, lantai + 190, 170, 54, 14, '#5b7a8c'); kotakBulat(116, lantai + 176, 158, 30, 12, '#6d8ea1'); kotak(124, lantai + 240, 8, 10, '#3b2a22'); kotak(258, lantai + 240, 8, 10, '#3b2a22'); }
    if (b.mejamakan) { kotak(290, lantai + 196, 62, 8, '#8f5a31'); kotak(296, lantai + 204, 5, 40, '#6b4a2e'); kotak(340, lantai + 204, 5, 40, '#6b4a2e'); kotakBulat(286, lantai + 176, 14, 30, 3, '#a86c3c'); kotakBulat(342, lantai + 176, 14, 30, 3, '#a86c3c'); }
    if (b.mesincuci) { kotakBulat(20, lantai + 188, 70, 58, 6, '#eef1f3'); bulat(42, lantai + 214, 13, '#bcd3e0'); bulat(72, lantai + 214, 9, '#bcd3e0'); kotak(24, lantai + 192, 62, 6, '#c8ced3'); }
    if (b.kompor) { kotak(60, lantai + 120, 70, 8, '#a5adb3'); kotak(64, lantai + 128, 62, 30, '#d9dcde'); bulat(80, lantai + 118, 6, '#2b2b2b'); bulat(110, lantai + 118, 6, '#2b2b2b'); kotakBulat(134, lantai + 126, 18, 30, 6, '#7fb069'); }
    /* gelap malam bila lampu dimatikan saat tidur */
    if (s.tidur) { cx.fillStyle = 'rgba(10,18,45,.45)'; cx.fillRect(0, 0, W, H); }
    else if (gp > 0.5) { cx.fillStyle = 'rgba(255,230,180,.06)'; cx.fillRect(0, 0, W, H); }
  }

  /* ---------- motor sendiri, ngojek, mobil, pindahan ---------- */
  var SPORT = { gsxr150: '#2f6fb0', cbr150: '#d9443a', r15: '#2f6fb0', mt25: '#3b3f46', cbr250: '#d9443a', ninja250: '#4fa53a', r25: '#2f6fb0', zx25r: '#4fa53a', zx4rr: '#4fa53a', zx6r: '#4fa53a', zx10r: '#4fa53a', cbr1000: '#d9443a', h2: '#2b2f36', r6: '#2f6fb0', 'cbr250-bekas': '#d9443a' };
  /* motor menghadap kanan; dasar = permukaan jalan */
  function gambarMotorKu(x, y, id, o, t) {
    o = o || {};
    var sport = !!SPORT[id], w = SPORT[id] || WARNA_MOTOR[id] || '#d9443a', putar = o.jalan ? t / 60 : 0;
    cx.save(); cx.translate(x, y); if (o.kiri) cx.scale(-1, 1);
    cx.fillStyle = 'rgba(0,0,0,.25)'; cx.beginPath(); cx.ellipse(0, 1, 30, 4, 0, 0, Math.PI * 2); cx.fill();
    [-20, 20].forEach(function (rx) {
      bulat(rx, -9, 9, '#1b1b1b'); bulat(rx, -9, 4, '#9aa3a6');
      cx.strokeStyle = '#6b7378'; cx.lineWidth = 1; cx.beginPath();
      for (var j = 0; j < 3; j++) { var a = putar + j * Math.PI / 3; cx.moveTo(rx + Math.cos(a) * 7, -9 + Math.sin(a) * 7); cx.lineTo(rx - Math.cos(a) * 7, -9 - Math.sin(a) * 7); }
      cx.stroke();
    });
    if (sport) {
      cx.fillStyle = w; cx.beginPath(); cx.moveTo(-14, -14); cx.lineTo(8, -16); cx.lineTo(24, -30); cx.lineTo(18, -12); cx.lineTo(-4, -8); cx.closePath(); cx.fill();
      kotakBulat(-24, -26, 22, 6, 3, '#2b2b2b'); kotak(-26, -28, 10, 4, w);
      cx.fillStyle = 'rgba(150,200,230,.75)'; cx.beginPath(); cx.moveTo(18, -30); cx.lineTo(24, -30); cx.lineTo(20, -38); cx.closePath(); cx.fill();
    } else { kotakBulat(-22, -20, 40, 11, 5, w); kotakBulat(-20, -28, 22, 8, 3, '#2b2b2b'); kotak(14, -36, 3, 18, '#333'); kotak(10, -38, 10, 3, '#333'); }
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
  var WARNA_MOBIL = { granmax: '#e8e4da', carry: '#e8e4da', hilux: '#d6d8da', l300: '#3e6fb0', calya: '#b8bcc0', agya: '#d9443a', avanza: '#e8e4da', rush: '#2b2f36', veloz: '#8a2a2a', zenix: '#d8d4cc', fortuner: '#2b2f36', camry: '#3a3f46', gr86: '#d9443a', alphard: '#f3f1ea', landcruiser: '#2b2f36' };
  function gambarMobil(x, y, bentuk, id, kiri, roda) {
    var w = WARNA_MOBIL[id] || '#e8e4da', kaca = 'rgba(120,160,190,.85)';
    cx.save(); cx.translate(x, y); if (kiri) cx.scale(-1, 1);
    cx.fillStyle = 'rgba(0,0,0,.28)'; cx.beginPath(); cx.ellipse(0, 1, 64, 5, 0, 0, Math.PI * 2); cx.fill();
    var tinggi = { pikap: 40, hatch: 36, mpv: 46, suv: 50, sedan: 34, sport: 28, van: 54 }[bentuk] || 40;
    if (bentuk === 'pikap') {
      kotakBulat(14, -50, 44, 38, 6, w); kotak(20, -46, 30, 16, kaca); kotak(-58, -26, 72, 14, w); kotak(-58, -34, 72, 4, '#9aa3a6');
      kotak(-50, -44, 22, 16, '#c8a06a');
    } else {
      kotakBulat(-60, -tinggi * 0.55 - 12, 120, tinggi * 0.55, 8, w);
      cx.fillStyle = w; cx.beginPath();
      var atas = -tinggi - 10, dpn = bentuk === 'sport' ? 10 : bentuk === 'sedan' ? 18 : 34, blk = bentuk === 'van' || bentuk === 'mpv' || bentuk === 'suv' ? -56 : bentuk === 'hatch' ? -50 : -34;
      cx.moveTo(blk, -tinggi * 0.55 - 10); cx.lineTo(blk + 4, atas); cx.lineTo(dpn - 12, atas); cx.lineTo(dpn + 8, -tinggi * 0.55 - 10); cx.closePath(); cx.fill();
      cx.fillStyle = kaca; cx.beginPath(); cx.moveTo(blk + 6, -tinggi * 0.55 - 12); cx.lineTo(blk + 9, atas + 4); cx.lineTo(dpn - 14, atas + 4); cx.lineTo(dpn + 2, -tinggi * 0.55 - 12); cx.closePath(); cx.fill();
      kotak((blk + dpn) / 2 - 2, atas + 2, 3, tinggi * 0.45, w);
      if (bentuk === 'van') { kotak(-60, -14, 120, 3, '#c9b37a'); kotak(48, -tinggi * 0.55 - 6, 10, 10, '#c9b37a'); }
      if (bentuk === 'suv') kotak(blk + 6, atas - 4, dpn - blk - 22, 3, '#3b3f46');
    }
    var pt = roda ? roda / 60 : 0;
    [-38, 38].forEach(function (rx) { bulat(rx, -9, 11, '#1b1b1b'); bulat(rx, -9, 5, '#b8c0c6'); cx.strokeStyle = '#6b7378'; cx.lineWidth = 1.2; cx.beginPath(); cx.moveTo(rx + Math.cos(pt) * 5, -9 + Math.sin(pt) * 5); cx.lineTo(rx - Math.cos(pt) * 5, -9 - Math.sin(pt) * 5); cx.stroke(); });
    kotak(56, -tinggi * 0.4 - 6, 5, 6, '#ffe58f'); kotak(-61, -tinggi * 0.4 - 6, 4, 6, '#d9443a');
    cx.restore();
  }
  /* adegan jalan raya saat mengantar order ojol */
  function gambarJalanRaya(s, t) {
    var m = s.menit % 1440, f = s.ojek, jalan = H * 0.62, dasarRuko = jalan - 60, lebar = W + 44, geser = (t * 0.06) % lebar;
    gambarLangit(m, t);
    cx.save(); cx.translate(-geser, 0); gambarRuko(m, dasarRuko); cx.translate(lebar, 0); gambarRuko(m, dasarRuko); cx.restore();
    var gp = gelap(m); if (gp > 0) { cx.fillStyle = 'rgba(10,18,45,' + (gp * 0.38).toFixed(3) + ')'; cx.fillRect(0, 0, W, dasarRuko); }
    kotak(0, dasarRuko, W, jalan - dasarRuko, '#b9b2a6');
    var g2 = (t * 0.25) % 20; for (var x0 = -20; x0 < W + 20; x0 += 20) kotak(x0 - g2, jalan - 7, 10, 7, (Math.round((x0 + 20) / 20)) % 2 ? '#f3f1ea' : '#2b2b2b');
    kotak(0, jalan, W, H - jalan, '#4a4d52');
    var g3 = (t * 0.32) % 70; cx.fillStyle = '#e9e4d4'; for (var x1 = -70; x1 < W + 70; x1 += 70) cx.fillRect(x1 - g3, jalan + 64, 34, 3);
    if (gp > 0) { cx.fillStyle = 'rgba(10,18,45,' + (gp * 0.3).toFixed(3) + ')'; cx.fillRect(0, dasarRuko, W, H - dasarRuko); }
    /* kendaraan lain menyalip pelan */
    var sx = W + 80 - ((t * 0.03) % (W + 260));
    gambarMobil(sx, jalan + 130, ['mpv', 'hatch', 'suv'][Math.floor(t / 9000) % 3], ['avanza', 'agya', 'rush'][Math.floor(t / 9000) % 3], false, t);
    var antar = f.status === 'antar', goyang = Math.sin(t / 90) * 1.2;
    gambarMotorKu(W * 0.42, jalan + 52 + goyang, s.motorId, { naik: true, jalan: true, bonceng: antar && f.jenis === 'penumpang', muatan: antar && f.jenis !== 'penumpang' ? (f.jenis === 'makanan' ? 'makanan' : 'paket') : null }, t);
    if (gp > 0.4) { var gr = cx.createRadialGradient(W * 0.42 + 40, jalan + 30, 0, W * 0.42 + 40, jalan + 30, 90); gr.addColorStop(0, 'rgba(255,240,190,.45)'); gr.addColorStop(1, 'rgba(255,240,190,0)'); cx.fillStyle = gr; cx.fillRect(W * 0.42, jalan - 40, 140, 140); }
    if (s.hujan) {
      cx.fillStyle = 'rgba(30,40,60,.2)'; cx.fillRect(0, 0, W, H);
      cx.strokeStyle = 'rgba(210,225,240,.55)'; cx.lineWidth = 1.2; cx.beginPath();
      for (var hi = 0; hi < 90; hi++) { var hx = acak(hi + 500) * (W + 40) - 20, hy = (acak(hi + 600) * (H + 60) + (t / 3) % 40 * 3) % (H + 60) - 30; cx.moveTo(hx, hy); cx.lineTo(hx - 5, hy + 12); }
      cx.stroke();
    }
  }
  /* adegan pindahan: pikap membawa kasur, kardus, dan barang */
  function gambarPindahan(s, t) {
    var m = s.menit % 1440, jalan = H * 0.5, dasarRuko = jalan - 60, u = Math.max(0, Math.min(1, s.pindah.u));
    gambarLangit(m, t); gambarRuko(m, dasarRuko);
    var gp = gelap(m); if (gp > 0) { cx.fillStyle = 'rgba(10,18,45,' + (gp * 0.38).toFixed(3) + ')'; cx.fillRect(0, 0, W, dasarRuko); }
    kotak(0, dasarRuko, W, jalan - dasarRuko, '#b9b2a6'); kotak(0, jalan, W, H - jalan, '#4a4d52');
    cx.fillStyle = '#e9e4d4'; for (var x1 = 8; x1 < W; x1 += 70) cx.fillRect(x1, jalan + 64, 34, 3);
    var x = -90 + u * (W + 180), y = jalan + 90 + Math.sin(t / 80);
    gambarMobil(x, y, 'pikap', s.pindah.pikap ? s.pindah.warna : 'granmax', false, t);
    /* muatan di bak */
    kotakBulat(x - 56, y - 60, 60, 14, 5, '#f3f1ea'); kotak(x - 30, y - 74, 18, 14, '#c8a06a'); kotak(x - 50, y - 72, 16, 12, '#c8a06a'); kotakBulat(x - 10, y - 66, 18, 20, 3, '#9aa3a6');
    cx.font = '800 20px "Baloo 2", "Nunito", system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.lineWidth = 5; cx.strokeStyle = 'rgba(29,43,51,.6)'; cx.strokeText('Pindahan…', W / 2, H * 0.36); cx.fillStyle = '#fbfaf6'; cx.fillText('Pindahan…', W / 2, H * 0.36);
  }

  var kotakKedai = null, kotakBarista = null, tAkhir = 0;
  /* s: { menit, buka (bool), kecepatan } */
  function gambar(s, t) {
    if (!cx) return;
    var dt = tAkhir ? Math.min(100, t - tAkhir) : 16; tAkhir = t;
    anim.rolling += ((s.buka ? 1 : 0) - anim.rolling) * Math.min(1, dt / 260);
    if (Math.abs(anim.rolling - (s.buka ? 1 : 0)) < 0.003) anim.rolling = s.buka ? 1 : 0;
    anim.pantulKedai = Math.max(0, anim.pantulKedai - dt / 600);
    anim.pantulBarista = Math.max(0, anim.pantulBarista - dt / 500);
    anim.kedip -= dt; if (anim.kedip < -3400 - Math.random() * 1500) anim.kedip = 140;
    aturMotor(dt, s.menit, s.jalan ? s.kecepatan : 0.4);

    if (s.pindah) { cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0); gambarPindahan(s, t); kotakKedai = null; kotakBarista = null; kotakDepan = null; return; }
    if (s.ojek && s.ojek.status !== 'standby' && s.motorId) { cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0); gambarJalanRaya(s, t); kotakKedai = null; kotakBarista = null; kotakDepan = null; return; }
    if (s.posisi === 'kos') { cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0); gambarKos(s, t); kotakKedai = null; kotakBarista = null; kotakDepan = null; return; }
    var jalan = H - 190, trotoar = jalan - 72, dasarRuko = trotoar + 4, dasarKedai = jalan - 20, m = s.menit, yKaki = jalan - 9;
    /* angkat adegan saat panel racik menutupi kaki pembeli */
    var skala = cv.getBoundingClientRect().width / W || 1;
    var targetAngkat = Math.max(0, yKaki + 12 - (H - (s.ruangBawah || 0) / skala));
    anim.angkat += (targetAngkat - anim.angkat) * Math.min(1, dt / 160);
    var f = cv.width / W;
    cx.setTransform(f, 0, 0, f, 0, -anim.angkat * f);
    gambarLangit(m, t);
    gambarRuko(m, dasarRuko);
    var gp = gelap(m);
    if (gp > 0) { cx.fillStyle = 'rgba(10,18,45,' + (gp * 0.38).toFixed(3) + ')'; cx.fillRect(0, 0, W, dasarRuko); }
    gambarJalan(trotoar, jalan);
    gambarTiang(dasarKedai, dasarRuko - 270);
    gambarPisang(132, dasarKedai, t);
    kotakKedai = gambarKedai(160, dasarKedai, s, t, m);
    var nyala = s.buka && !s.padam ? Math.max(gp, 0.15) : 0;
    rantaiLampu(29, dasarRuko - 238, kotakKedai.x + 6, kotakKedai.y + 4, nyala, t);
    var wk = s.kayu ? ['#8f5a31', '#a86c3c'] : ['#d9443a', '#2f6fb0'];
    gambarKursi(44, dasarKedai + 4, wk[0]); gambarKursi(88, dasarKedai + 8, wk[1]);
    if ((s.tier || 1) >= 2) { gambarKursi(8, dasarKedai + 10, wk[1]); kotak(20, dasarKedai - 22, 30, 4, s.kayu ? '#b97a46' : '#e8e4da'); }
    kotak(60, dasarKedai - 26, 34, 4, '#e8e4da'); kotak(74, dasarKedai - 22, 4, 24, '#c8c2b4');
    if (gp > 0) { cx.fillStyle = 'rgba(10,18,45,' + (gp * 0.32).toFixed(3) + ')'; cx.fillRect(0, trotoar, W, H - trotoar); }
    var daftar = s.pembeli || [];
    aturPembeli(daftar, s.dMenit || 0, dt);
    kotakDepan = null;
    daftar.slice().sort(function (a, b) { return (b.slot || 0) - (a.slot || 0); }).forEach(function (o) { gambarOrang(o, yKaki, t, m); });
    /* cup terbang dari konter ke tangan pembeli */
    anim.cup = anim.cup.filter(function (c) {
      c.u += dt / 420; var u = Math.min(1, c.u), x = c.x0 + (c.x1 - c.x0) * u, y = kotakKedai.by + kotakKedai.bh - 6 + (yKaki - 30 - kotakKedai.by - kotakKedai.bh + 6) * u - Math.sin(u * Math.PI) * 34;
      gambarCup(x, y, c.menu, 1);
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
    if (s.mobil) { gambarMobil(80, jalan + 38, s.mobil.bentuk, s.mobil.id, true); if (gelap(m) > 0.4) { cx.fillStyle = 'rgba(10,18,45,' + (gelap(m) * 0.3).toFixed(2) + ')'; cx.fillRect(10, jalan - 30, 140, 74); } }
    if (s.ojek && s.ojek.status === 'standby' && s.motorId) gambarMotorKu(300, jalan + 32, s.motorId, { naik: true, hp: true, kiri: true }, t);
    else if (s.motorParkir) { if (SPORT[s.motorParkir]) gambarMotorKu(312, jalan + 32, s.motorParkir, { kiri: true }, t); else gambarParkir(312, jalan + 20, s.motorParkir, m); }
    anim.motor.forEach(function (mt) { gambarMotor(mt, jalan, m); });
    if (s.hujan) {
      cx.fillStyle = 'rgba(30,40,60,' + (s.hujan > 1 ? 0.28 : 0.18) + ')'; cx.fillRect(0, anim.angkat - 20, W, H + 40);
      cx.strokeStyle = 'rgba(210,225,240,.55)'; cx.lineWidth = 1.2; cx.beginPath();
      var jml = s.hujan > 1 ? 140 : 80, geser = (t / 3) % 40;
      for (var hi = 0; hi < jml; hi++) { var hx = acak(hi + 500) * (W + 40) - 20, hy = (acak(hi + 600) * (H + 60) + geser * (2 + acak(hi) * 2)) % (H + 60) - 30 + anim.angkat; cx.moveTo(hx, hy); cx.lineTo(hx - 3, hy + 12); }
      cx.stroke();
      if (s.hujan > 1) { cx.fillStyle = 'rgba(120,100,70,.35)'; cx.fillRect(0, jalan - 4, W, H - jalan + 40); }
    }
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
  g.KK_ADEGAN = { init: init, gambar: gambar, ketuk: ketuk, ukur: ukur, gelap: gelap, racikSaja: racikSaja };
})(window);
