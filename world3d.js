// ==================== COLORFUL ILLUSTRATED 2.5D RENTAL PS SIMULATOR (WARNET LIFE STYLE) ====================
// Ruangan hangat & berwarna nyata (lantai kayu/keramik, dinding berposter, pintu masuk, rak kaset, etalase snack)
// Lengkap dengan animasi orang BERJALAN MASUK dari pintu menuju ruang tunggu / room PS, duduk main, dan berjalan keluar!

(function () {
  'use strict';

  let canvas, ctx;
  let initialized = false;
  let panX = 0, panY = 0, zoom = 1;
  let isDragging = false, downPos = { x: 0, y: 0 }, lastPos = { x: 0, y: 0 };
  const hitRegions = [];

  const WORLD_W = 1200, WORLD_H = 760;
  const DOOR_POS = { x: 600, y: 715 };

  // State posisi berjalan tiap karakter agar bergerak mulus dari pintu -> kursi -> pintu keluar
  const walkers = new Map(); // id -> { x, y, tx, ty, state: 'walk'|'sit', seed, name, shirt, isLeaving }

  function roundRect(x, y, w, h, r, fill, stroke, lw) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
  }

  // Gambar Karakter Manusia 2.5D Penuh (Sepatu, Celana, Baju berkerah, Lengan, Kepala proporsional, Rambut, Mata, Mulut)
  function drawPerson25D(x, y, seed, skinHex, shirtHex, isSitting, isWalking, label, t) {
    ctx.save();
    ctx.translate(x, y);

    // Bayangan lembut di lantai
    ctx.fillStyle = 'rgba(0,0,0,0.24)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const walkStep = isWalking ? Math.sin(t * 11 + seed) : 0;
    const bob = isWalking ? Math.abs(walkStep) * 3 : (isSitting ? Math.sin(t * 5 + seed) * 0.8 : 0);
    ctx.translate(0, -bob);

    // Kaki & Sepatu (mengayun saat berjalan)
    if (!isSitting) {
      ctx.fillStyle = '#1e293b';
      roundRect(-8, 4 + walkStep * 3, 6, 12, 3, '#1e293b');
      roundRect(2, 4 - walkStep * 3, 6, 12, 3, '#1e293b');
      ctx.fillStyle = '#0f172a';
      roundRect(-9, 13 + walkStep * 3, 7, 5, 2, '#0f172a');
      roundRect(2, 13 - walkStep * 3, 7, 5, 2, '#0f172a');
    }

    // Badan / Kaos
    roundRect(-12, -10, 24, 19, 7, shirtHex, 'rgba(0,0,0,0.18)', 1.5);
    // Kerah kaos
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.arc(0, -9, 5, 0, Math.PI); ctx.fill();

    // Tangan
    const armSwing = isSitting ? Math.sin(t * 12 + seed) * 2.2 : walkStep * 4;
    ctx.fillStyle = skinHex || '#f5ccb0';
    ctx.beginPath(); ctx.arc(-13, -1 + armSwing, 4.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(13, -1 - armSwing, 4.2, 0, Math.PI * 2); ctx.fill();

    // Leher & Kepala
    ctx.fillStyle = skinHex || '#f5ccb0';
    ctx.fillRect(-3.5, -15, 7, 6);
    ctx.beginPath(); ctx.arc(0, -24, 12.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 1.4; ctx.stroke();

    // Rambut
    const hairColors = ['#18181b', '#3f2314', '#1e1b4b', '#6d351a', '#27272a'];
    ctx.fillStyle = hairColors[seed % hairColors.length];
    ctx.beginPath();
    ctx.arc(0, -27, 13, Math.PI * 0.95, Math.PI * 2.05);
    ctx.fill();
    if (seed % 2 === 0) {
      ctx.beginPath(); ctx.ellipse(-4, -35, 6.5, 3.8, -0.3, 0, Math.PI * 2); ctx.fill();
    }

    // Wajah (Pipi, Mata, Senyum)
    ctx.fillStyle = 'rgba(244, 114, 182, 0.35)';
    ctx.beginPath(); ctx.arc(-6.5, -21, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6.5, -21, 2.5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(-4.2, -24, 1.9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4.2, -24, 1.9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(-3.7, -24.6, 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4.7, -24.6, 0.7, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = '#9f1239'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, -20, 3.2, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();

    if (label) {
      roundRect(-24, -50, 48, 13, 6, 'rgba(15,23,42,0.78)');
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 8.5px Inter, Arial';
      ctx.textAlign = 'center';
      ctx.fillText(label.slice(0, 9), 0, -40.5);
    }

    ctx.restore();
  }

  function drawPlant2D(x, y) {
    ctx.fillStyle = '#b45309';
    roundRect(x - 10, y - 4, 20, 14, 4, '#b45309', '#78350f', 1.5);
    ctx.fillStyle = '#16a34a';
    ctx.beginPath(); ctx.arc(x - 6, y - 10, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 6, y - 10, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath(); ctx.arc(x, y - 16, 9, 0, Math.PI * 2); ctx.fill();
  }

  function drawTvScreen(x, y, w, h, slot, t) {
    if (typeof state !== 'undefined' && (state.plnBlackout || state.kwh <= 0)) {
      roundRect(x, y, w, h, 4, '#111827', '#374151', 2);
      return;
    }
    if (!slot.occupied) {
      roundRect(x, y, w, h, 4, '#1e3a8a', '#0f172a', 2);
      ctx.fillStyle = '#93c5fd';
      ctx.font = '800 8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(slot.console ? slot.console.platform : 'TV', x + w / 2, y + h / 2 + 3);
      return;
    }
    const title = (slot.installedGame ? slot.installedGame.title : 'PES').toLowerCase();
    if (title.includes('winning') || title.includes('pes') || title.includes('fc') || title.includes('fifa')) {
      roundRect(x, y, w, h, 4, '#16a34a', '#0f172a', 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1;
      ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
      const bx = x + w / 2 + Math.sin(t * 4) * (w * 0.25);
      const by = y + h / 2 + Math.cos(t * 3) * (h * 0.2);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx, by, 2.2, 0, Math.PI * 2); ctx.fill();
    } else if (title.includes('racing') || title.includes('need') || title.includes('downhill')) {
      roundRect(x, y, w, h, 4, '#38bdf8', '#0f172a', 2);
      ctx.fillStyle = '#475569'; ctx.fillRect(x + 6, y + h / 2, w - 12, h / 2 - 2);
      ctx.fillStyle = '#ef4444'; ctx.fillRect(x + w / 2 + Math.sin(t * 5) * 9 - 5, y + h - 8, 10, 5);
    } else {
      roundRect(x, y, w, h, 4, '#7c3aed', '#0f172a', 2);
      ctx.fillStyle = '#fde047'; ctx.fillRect(x + 12 + Math.sin(t * 7) * 5, y + 9, 6, 11);
      ctx.fillStyle = '#f43f5e'; ctx.fillRect(x + w - 18 + Math.cos(t * 7) * 5, y + 9, 6, 11);
    }
  }

  function getSlotCoords(i) {
    const isRoom = i >= 10;
    const idx = isRoom ? (i - 10) : i;
    const row = Math.floor(idx / 5);
    const col = idx % 5;
    const sx = (isRoom ? 635 : 55) + col * 104;
    const sy = 128 + row * 172;
    return { sx, sy, sw: 94, sh: 152, isRoom, seatX: sx + 47, seatY: sy + 98 };
  }

  function updateWalkers(dt, t) {
    if (typeof state === 'undefined' || !state.slots) return;
    const activeIds = new Set();
    const shirts = ['#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#2563eb'];

    // 1. Pelanggan di 20 Slot
    state.slots.forEach((slot, i) => {
      if (!slot.occupied) return;
      const id = 'slot_' + slot.id;
      activeIds.add(id);
      const pos = getSlotCoords(i);
      let w = walkers.get(id);
      if (!w) {
        w = {
          x: DOOR_POS.x, y: DOOR_POS.y,
          tx: pos.seatX, ty: pos.seatY,
          seed: slot.customerSeed || i,
          name: slot.customerName || 'Tamu',
          shirt: shirts[(slot.customerSeed || i) % shirts.length]
        };
        walkers.set(id, w);
      } else {
        w.tx = pos.seatX;
        w.ty = pos.seatY;
        w.name = slot.customerName || 'Tamu';
      }
    });

    // 2. Pelanggan di Ruang Tunggu
    (state.waitingQueue || []).forEach((wq, idx) => {
      const id = 'wait_' + wq.id;
      activeIds.add(id);
      const tx = 835 + (idx % 4) * 76;
      const ty = idx < 4 ? 580 : 645;
      let w = walkers.get(id);
      if (!w) {
        w = {
          x: DOOR_POS.x, y: DOOR_POS.y, tx, ty,
          seed: wq.seed || idx, name: wq.name,
          shirt: '#f97316'
        };
        walkers.set(id, w);
      } else {
        w.tx = tx; w.ty = ty;
      }
    });

    // 3. Karyawan
    (state.employees || []).forEach((emp, idx) => {
      if (typeof isEmployeeOnDuty === 'function' && !isEmployeeOnDuty(emp)) return;
      const id = 'emp_' + emp.id;
      activeIds.add(id);
      const isCleaner = emp.tasks && emp.tasks.includes('clean');
      const tx = isCleaner ? 540 + Math.sin(t * 0.45 + idx) * 260 : 285 + idx * 44;
      const ty = isCleaner ? 492 + Math.cos(t * 0.35 + idx) * 35 : 640;
      let w = walkers.get(id);
      if (!w) {
        w = { x: tx, y: ty, tx, ty, seed: 50 + idx, name: emp.name.split(' ')[0], shirt: '#10b981' };
        walkers.set(id, w);
      } else {
        w.tx = tx; w.ty = ty;
      }
    });

    // Gerakkan semua walker menuju targetnya
    for (const [id, w] of walkers.entries()) {
      if (!activeIds.has(id)) {
        // Jika tamu sudah selesai, berjalan keluar menuju Pintu Masuk!
        w.tx = DOOR_POS.x;
        w.ty = DOOR_POS.y + 30;
        w.isLeaving = true;
      }
      const dx = w.tx - w.x, dy = w.ty - w.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 3) {
        const speed = 155 * dt;
        w.x += (dx / dist) * Math.min(speed, dist);
        w.y += (dy / dist) * Math.min(speed, dist);
        w.isWalking = true;
      } else {
        w.x = w.tx; w.y = w.ty;
        w.isWalking = false;
        if (w.isLeaving) walkers.delete(id);
      }
    }
  }

  let lastFrame = performance.now();
  function renderFrame(now) {
    requestAnimationFrame(renderFrame);
    if (!canvas || !ctx) return;
    const dt = Math.min(0.05, (now - lastFrame) * 0.001);
    lastFrame = now;
    const t = now * 0.001;

    updateWalkers(dt, t);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = window.innerWidth, ch = window.innerHeight;
    if (canvas.width !== Math.floor(cw * dpr) || canvas.height !== Math.floor(ch * dpr)) {
      canvas.width = Math.floor(cw * dpr);
      canvas.height = Math.floor(ch * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, cw, ch);

    const baseScale = Math.min((cw - 12) / WORLD_W, (ch - 132) / WORLD_H);
    const effScale = Math.max(0.28, baseScale * zoom);
    const offsetX = (cw - WORLD_W * effScale) / 2 + panX;
    const offsetY = (ch - WORLD_H * effScale) / 2 + 16 + panY;

    ctx.translate(offsetX, offsetY);
    ctx.scale(effScale, effScale);

    hitRegions.length = 0;

    // 1. Dinding Luar Ruko & Lantai Kayu / Keramik Cerah Hangat (Warnet Life Style!)
    const renovLv = typeof state !== 'undefined' ? (state.renovLevel || 1) : 1;
    const floorPalettes = ['#e7d8c3', '#f1e4d1', '#e2e8f0', '#ede9fe'];
    const wallPalettes = ['#fef3c7', '#e0f2fe', '#f3e8ff', '#dbeafe'];
    const floorCol = floorPalettes[Math.min(3, renovLv - 1)];
    const wallCol = wallPalettes[Math.min(3, renovLv - 1)];

    // Dinding Atas
    roundRect(16, 16, WORLD_W - 32, WORLD_H - 32, 22, floorCol, '#475569', 6);
    roundRect(20, 20, WORLD_W - 40, 72, 16, wallCol, '#cbd5e1', 2);

    // Papan Tekstur Lantai Kayu Hangat
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.1)';
    ctx.lineWidth = 1.5;
    for (let y = 100; y < WORLD_H - 30; y += 38) {
      ctx.beginPath(); ctx.moveTo(22, y); ctx.lineTo(WORLD_W - 22, y); ctx.stroke();
    }

    // Poster Game di Dinding Atas & Papan Nama Toko
    roundRect(80, 28, 70, 54, 6, '#ef4444', '#7f1d1d', 2);
    ctx.fillStyle = '#fff'; ctx.font = '800 9px Arial'; ctx.textAlign = 'center'; ctx.fillText('WE 2002', 115, 58);
    roundRect(170, 28, 70, 54, 6, '#2563eb', '#1e3a8a', 2);
    ctx.fillStyle = '#fff'; ctx.fillText('GTA SA', 205, 58);

    roundRect(350, 26, 500, 56, 12, '#1e293b', '#f59e0b', 3);
    ctx.fillStyle = '#fde047'; ctx.font = '900 18px Inter, Arial';
    ctx.fillText('🎮 RENTAL PS & KONTER PULSA', 600, 52);
    ctx.fillStyle = '#38bdf8'; ctx.font = '700 11px Inter, Arial';
    ctx.fillText('TERIMA KASIH TELAH BERMAIN • RENTAL BUKA', 600, 70);

    roundRect(960, 28, 70, 54, 6, '#16a34a', '#14532d', 2);
    ctx.fillStyle = '#fff'; ctx.fillText('DOWNHILL', 995, 58);
    roundRect(1050, 28, 70, 54, 6, '#7c3aed', '#4c1d95', 2);
    ctx.fillStyle = '#fff'; ctx.fillText('TEKKEN', 1085, 58);

    // Karpet Pembatas Area Reguler vs Room VIP
    roundRect(42, 98, 546, 375, 16, 'rgba(255,255,255,0.28)', 'rgba(148,163,184,0.4)', 2);
    roundRect(612, 98, 546, 375, 16, 'rgba(199,210,254,0.35)', 'rgba(99,102,241,0.45)', 2);
    ctx.fillStyle = '#334155'; ctx.font = '800 11px Inter, Arial'; ctx.textAlign = 'left';
    ctx.fillText('🕹️ AREA REGULER (10 UNIT)', 58, 118);
    ctx.fillStyle = '#3730a3';
    ctx.fillText('👑 AREA ROOM VIP AC (10 ROOM)', 628, 118);

    // 2. 20 Slot Unit Rental PS
    if (typeof state !== 'undefined' && state.slots) {
      state.slots.forEach((slot, i) => {
        const { sx, sy, sw, sh, isRoom } = getSlotCoords(i);
        hitRegions.push({ x: sx, y: sy, w: sw, h: sh, action: 'slot', slotId: slot.id });

        const hasHw = !!(slot.console || slot.tv || slot.cooling);
        if (!hasHw) {
          ctx.save();
          ctx.setLineDash([5, 5]);
          roundRect(sx, sy, sw, sh, 12, 'rgba(255,255,255,0.18)', 'rgba(100,116,139,0.45)', 1.5);
          ctx.restore();
          ctx.fillStyle = '#475569'; ctx.font = '700 10px Inter, Arial'; ctx.textAlign = 'center';
          ctx.fillText(`+ Pasang #${slot.id}`, sx + sw / 2, sy + sh / 2);
          return;
        }

        // Bilik / Karpet Unit
        roundRect(sx, sy, sw, sh, 12, isRoom ? '#e0e7ff' : '#f8fafc', slot.occupied ? '#16a34a' : '#94a3b8', 2.5);

        // Meja Kayu TV
        roundRect(sx + 8, sy + 16, sw - 16, 22, 5, '#92400e', '#451a03', 1.5);
        if (slot.tv) drawTvScreen(sx + 18, sy + 6, sw - 36, 26, slot, t + i);
        if (slot.console) {
          const pCol = slot.console.platform === 'PS1' ? '#cbd5e1' : slot.console.platform === 'PS5' ? '#ffffff' : '#1e293b';
          roundRect(sx + sw - 28, sy + 26, 18, 9, 2, pCol, '#475569', 1);
        }
        if (slot.cooling && slot.cooling.type === 'ac') {
          roundRect(sx + 20, sy + 1, sw - 40, 6, 3, '#ffffff', '#0284c7', 1);
        } else if (slot.cooling && slot.cooling.type === 'fan') {
          ctx.fillStyle = '#0284c7'; ctx.beginPath(); ctx.arc(sx + 13, sy + 15, 5, 0, Math.PI * 2); ctx.fill();
        }

        // Sofa Empuk Pelanggan
        roundRect(sx + 15, sy + 84, sw - 30, 34, 9, isRoom ? '#4f46e5' : '#0284c7', '#1e293b', 1.5);
        roundRect(sx + 15, sy + 110, sw - 30, 10, 4, isRoom ? '#3730a3' : '#0369a1');

        ctx.fillStyle = slot.occupied ? '#15803d' : '#475569';
        ctx.font = '800 9.5px Inter, Arial'; ctx.textAlign = 'center';
        ctx.fillText(slot.occupied ? `Sisa ${slot.minutesLeft}m` : `#${slot.id} • ${slot.console ? slot.console.platform : 'TV'}`, sx + sw / 2, sy + sh - 8);
      });
    }

    // 3. Meja Kasir, Etalase Snack & Rak Kaset (Bawah Kiri)
    roundRect(50, 510, 360, 195, 16, 'rgba(255,255,255,0.55)', '#94a3b8', 2);
    roundRect(80, 550, 230, 46, 10, '#78350f', '#451a03', 2);
    roundRect(205, 556, 95, 32, 6, '#bae6fd', '#0284c7', 1.5); // Etalase Kaca Snack/Pulsa
    ctx.fillStyle = '#0f172a'; ctx.font = '800 11px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText('KASIR & ETALASE', 142, 577);
    // Rak Kaset Warna-warni di samping kasir
    roundRect(330, 540, 62, 130, 8, '#334155', '#0f172a', 2);
    ctx.fillStyle = '#fde047'; ctx.font = '700 9px Arial'; ctx.fillText('RAK', 361, 558); ctx.fillText('KASET', 361, 569);
    ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7'].forEach((c, ci) => {
      roundRect(338, 580 + ci * 16, 46, 10, 2, c);
    });
    hitRegions.push({ x: 50, y: 510, w: 360, h: 195, action: 'cashier' });

    // Owner di Kasir
    if (typeof isPlayerAtSchool !== 'function' || !isPlayerAtSchool()) {
      drawPerson25D(155, 645, 7, '#f5ccb0', '#2563eb', false, false, typeof state !== 'undefined' ? state.player.name.split(' ')[0] : 'Owner', t);
    }

    // Tanaman Hias & Pintu Masuk Utama (Bawah Tengah)
    drawPlant2D(445, 535);
    drawPlant2D(730, 535);
    roundRect(535, 695, 130, 46, 8, '#0ea5e9', '#0f172a', 3);
    roundRect(550, 655, 100, 36, 8, '#b91c1c', '#7f1d1d', 2);
    ctx.fillStyle = '#fde047'; ctx.font = '800 10px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText('WELCOME', 600, 677);

    // 4. Ruang Tunggu Antrean (Bawah Kanan)
    roundRect(760, 510, 395, 195, 16, 'rgba(255,255,255,0.55)', '#94a3b8', 2);
    ctx.fillStyle = '#1e293b'; ctx.font = '800 11.5px Inter, Arial'; ctx.textAlign = 'left';
    ctx.fillText('🪑 RUANG TUNGGU ANTREAN', 780, 535);
    roundRect(785, 560, 345, 34, 8, '#475569', '#1e293b', 1.5);
    roundRect(785, 625, 345, 34, 8, '#475569', '#1e293b', 1.5);

    // 5. Render Semua Karakter Berjalan / Duduk (Tamu, Antrean, Karyawan)
    walkers.forEach((w) => {
      const sitting = !w.isWalking && !w.isLeaving && w.shirt !== '#10b981';
      drawPerson25D(w.x, w.y, w.seed, '#f5ccb0', w.shirt, sitting, w.isWalking, w.name, t);
    });

    // Noda Kotoran Lantai jika kebersihan turun
    if (typeof state !== 'undefined' && state.cleanliness < 90) {
      const n = Math.floor((100 - state.cleanliness) / 8);
      ctx.fillStyle = 'rgba(120, 53, 15, 0.45)';
      for (let d = 0; d < n; d++) {
        ctx.beginPath();
        ctx.ellipse(220 + (d * 97) % 760, 180 + (d * 67) % 320, 11, 6, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  function handleCanvasTap(clientX, clientY) {
    if (!canvas) return;
    const cw = window.innerWidth, ch = window.innerHeight;
    const baseScale = Math.min((cw - 12) / WORLD_W, (ch - 132) / WORLD_H);
    const effScale = Math.max(0.28, baseScale * zoom);
    const offsetX = (cw - WORLD_W * effScale) / 2 + panX;
    const offsetY = (ch - WORLD_H * effScale) / 2 + 16 + panY;
    const wx = (clientX - offsetX) / effScale;
    const wy = (clientY - offsetY) / effScale;

    for (let i = hitRegions.length - 1; i >= 0; i--) {
      const r = hitRegions[i];
      if (wx >= r.x && wx <= r.x + r.w && wy >= r.y && wy <= r.y + r.h) {
        if (r.action === 'slot' && typeof window.openSlotConfigModal === 'function') {
          window.openSlotConfigModal(r.slotId);
        } else if (r.action === 'cashier' && typeof window.openDrawerTab === 'function') {
          window.openDrawerTab('cashier_stik');
        }
        return;
      }
    }
  }

  function init2D() {
    if (initialized) return;
    const container = document.getElementById('studio3dViewport');
    if (!container) return;
    container.innerHTML = '';
    canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);
    ctx = canvas.getContext('2d');

    canvas.addEventListener('pointerdown', (e) => {
      isDragging = true;
      downPos = { x: e.clientX, y: e.clientY };
      lastPos = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      panX += e.clientX - lastPos.x;
      panY += e.clientY - lastPos.y;
      lastPos = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('pointerup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      if (Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) < 8) {
        handleCanvasTap(e.clientX, e.clientY);
      }
    });
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      zoom = Math.max(0.6, Math.min(2.2, zoom - e.deltaY * 0.001));
    }, { passive: false });

    initialized = true;
    requestAnimationFrame(renderFrame);
  }

  window.resetStudio3dCamera = function () { panX = 0; panY = 0; zoom = 1; };
  window.initRental3D = init2D;
})();
