/* adegan.js — adegan kedai di kanvas 2D: langit sesuai jam, ruko, tiang listrik, kontainer, barista, motor lewat.
   Gambar masih bentuk sederhana; gambar AI menggantikan bagian ini di tahap 9. */
(function (g) {
  'use strict';
  var cv, cx, W = 360, H = 640, dpr = 1;
  var anim = { rolling: 0, pantulKedai: 0, pantulBarista: 0, kedip: 0, motor: [], tMotor: 0 };
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
    kotak(0, jalan, W, H - jalan, '#4a4d52');
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
    var w = 180, h = 132, y0 = dasar - h, p = anim.pantulKedai, sk = 1 + Math.sin(p * 16) * 0.05 * p;
    cx.save(); cx.translate(x0 + w / 2, dasar); cx.scale(1 / sk, sk); cx.translate(-(x0 + w / 2), -dasar);
    /* bayangan */
    cx.fillStyle = 'rgba(0,0,0,.18)'; cx.beginPath(); cx.ellipse(x0 + w / 2, dasar + 2, w / 2 + 8, 7, 0, 0, Math.PI * 2); cx.fill();
    /* badan kontainer bergelombang */
    kotak(x0, y0, w, h, '#1f8a80');
    cx.fillStyle = 'rgba(0,0,0,.10)';
    for (var i = x0 + 4; i < x0 + w; i += 9) cx.fillRect(i, y0, 3, h);
    kotak(x0 - 3, y0 - 6, w + 6, 8, '#176d65');
    kotak(x0 - 3, dasar - 6, w + 6, 6, '#176d65');
    /* bukaan jendela */
    var bx = x0 + 18, by = y0 + 30, bw = w - 36, bh = 54;
    kotak(bx, by, bw, bh, '#3b2a22');
    kotak(bx + 6, by + 12, bw - 12, 3, '#6b4a36'); kotak(bx + 6, by + 30, bw - 12, 3, '#6b4a36');
    for (var j = 0; j < 6; j++) kotakBulat(bx + 10 + j * 22, by + 2, 10, 10, 2, j % 2 ? '#c9a27a' : '#e0d3b8');
    /* moka pot dan grinder */
    kotak(bx + bw - 34, by + 34, 12, 16, '#b8bfc4'); kotak(bx + bw - 36, by + 32, 16, 4, '#8d969b');
    kotak(bx + 14, by + 30, 14, 20, '#2f2f33');
    if (anim.rolling > 0.35) gambarBarista(bx + bw / 2, by + bh + 2, t);
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

    cx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0);
    var jalan = H - 190, trotoar = jalan - 72, dasarRuko = trotoar + 4, dasarKedai = jalan - 20, m = s.menit;
    gambarLangit(m, t);
    gambarRuko(m, dasarRuko);
    var gp = gelap(m);
    if (gp > 0) { cx.fillStyle = 'rgba(10,18,45,' + (gp * 0.38).toFixed(3) + ')'; cx.fillRect(0, 0, W, dasarRuko); }
    gambarJalan(trotoar, jalan);
    gambarTiang(dasarKedai, dasarRuko - 270);
    gambarPisang(132, dasarKedai, t);
    kotakKedai = gambarKedai(160, dasarKedai, s, t, m);
    var nyala = s.buka ? Math.max(gp, 0.15) : 0;
    rantaiLampu(29, dasarRuko - 238, kotakKedai.x + 6, kotakKedai.y + 4, nyala, t);
    gambarKursi(44, dasarKedai + 4, '#d9443a'); gambarKursi(88, dasarKedai + 8, '#2f6fb0');
    kotak(60, dasarKedai - 26, 34, 4, '#e8e4da'); kotak(74, dasarKedai - 22, 4, 24, '#c8c2b4');
    if (gp > 0) { cx.fillStyle = 'rgba(10,18,45,' + (gp * 0.32).toFixed(3) + ')'; cx.fillRect(0, trotoar, W, H - trotoar); }
    anim.motor.forEach(function (mt) { gambarMotor(mt, jalan, m); });
    kotakBarista = anim.rolling > 0.35 ? { x: kotakKedai.bx + kotakKedai.bw / 2 - 20, y: kotakKedai.by, w: 40, h: kotakKedai.bh } : null;
  }

  /* ketukan: koordinat layar (px CSS relatif kanvas) */
  function ketuk(px, py) {
    var r = cv.getBoundingClientRect(), x = px / r.width * W, y = py / r.width * W;
    function di(k) { return k && x >= k.x && x <= k.x + k.w && y >= k.y && y <= k.y + k.h; }
    if (di(kotakBarista)) { anim.pantulBarista = 1; return 'barista'; }
    if (di(kotakKedai)) { anim.pantulKedai = 1; return 'kedai'; }
    return null;
  }

  g.KK_ADEGAN = { init: init, gambar: gambar, ketuk: ketuk, ukur: ukur, gelap: gelap };
})(window);
