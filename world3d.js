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

  const WORLD_W = 540, WORLD_H = 920;
  const DOOR_POS = { x: 270, y: 885 };

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
    const sx = 28 + col * 98;
    const sy = (isRoom ? 405 : 112) + row * 134;
    return { sx, sy, sw: 90, sh: 124, isRoom, seatX: sx + 45, seatY: sy + 82 };
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
      const tx = 340 + (idx % 4) * 44;
      const ty = idx < 4 ? 765 : 815;
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
      const tx = isCleaner ? 270 + Math.sin(t * 0.45 + idx) * 160 : 145 + idx * 32;
      const ty = isCleaner ? 385 + Math.cos(t * 0.35 + idx) * 20 : 815;
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

    const baseScale = Math.min((cw - 6) / WORLD_W, (ch - 96) / WORLD_H);
    const effScale = Math.max(0.28, baseScale * zoom);
    const offsetX = (cw - WORLD_W * effScale) / 2 + panX;
    const offsetY = (ch - WORLD_H * effScale) / 2 + 8 + panY;

    ctx.translate(offsetX, offsetY);
    ctx.scale(effScale, effScale);

    hitRegions.length = 0;

    // 1. Dinding Luar Ruko & Lantai Kayu / Keramik Cerah Hangat (Portrait Fullscreen)
    const renovLv = typeof state !== 'undefined' ? (state.renovLevel || 1) : 1;
    const floorPalettes = ['#e7d8c3', '#f1e4d1', '#e2e8f0', '#ede9fe'];
    const wallPalettes = ['#fef3c7', '#e0f2fe', '#f3e8ff', '#dbeafe'];
    const floorCol = floorPalettes[Math.min(3, renovLv - 1)];
    const wallCol = wallPalettes[Math.min(3, renovLv - 1)];

    roundRect(8, 8, WORLD_W - 16, WORLD_H - 16, 20, floorCol, '#475569', 5);
    roundRect(12, 12, WORLD_W - 24, 62, 14, wallCol, '#cbd5e1', 2);

    ctx.strokeStyle = 'rgba(120, 53, 15, 0.1)';
    ctx.lineWidth = 1.2;
    for (let y = 84; y < WORLD_H - 20; y += 36) {
      ctx.beginPath(); ctx.moveTo(14, y); ctx.lineTo(WORLD_W - 14, y); ctx.stroke();
    }

    // Papan Nama Toko & Poster
    roundRect(95, 18, 350, 48, 10, '#1e293b', '#f59e0b', 2.5);
    ctx.fillStyle = '#fde047'; ctx.font = '900 15px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText('🎮 RENTAL PS & KONTER PULSA', 270, 40);
    ctx.fillStyle = '#38bdf8'; ctx.font = '700 9.5px Inter, Arial';
    ctx.fillText('10 UNIT REGULER • 10 ROOM VIP • RUANG TUNGGU', 270, 56);

    // Zona Area Reguler (Atas) & Room VIP (Tengah)
    roundRect(18, 84, WORLD_W - 36, 290, 14, 'rgba(255,255,255,0.28)', 'rgba(148,163,184,0.4)', 1.5);
    roundRect(18, 382, WORLD_W - 36, 290, 14, 'rgba(199,210,254,0.35)', 'rgba(99,102,241,0.45)', 1.5);
    ctx.fillStyle = '#334155'; ctx.font = '800 10px Inter, Arial'; ctx.textAlign = 'left';
    ctx.fillText('🕹️ AREA REGULER (10 UNIT)', 28, 102);
    ctx.fillStyle = '#3730a3';
    ctx.fillText('👑 AREA ROOM VIP AC (10 ROOM)', 28, 398);

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
    roundRect(18, 684, 210, 180, 14, 'rgba(255,255,255,0.55)', '#94a3b8', 2);
    roundRect(30, 715, 130, 38, 8, '#78350f', '#451a03', 1.5);
    ctx.fillStyle = '#fde047'; ctx.font = '800 9px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText('KASIR & PULSA', 95, 738);
    roundRect(170, 700, 46, 115, 6, '#334155', '#0f172a', 1.5);
    ctx.fillStyle = '#fde047'; ctx.font = '700 8px Arial'; ctx.fillText('KASET', 193, 715);
    ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b'].forEach((c, ci) => {
      roundRect(176, 725 + ci * 18, 34, 10, 2, c);
    });
    hitRegions.push({ x: 18, y: 684, w: 210, h: 180, action: 'cashier' });

    // Owner di Kasir
    if (typeof isPlayerAtSchool !== 'function' || !isPlayerAtSchool()) {
      drawPerson25D(95, 815, 7, '#f5ccb0', '#2563eb', false, false, typeof state !== 'undefined' ? state.player.name.split(' ')[0] : 'Owner', t);
    }

    // Pintu Masuk Utama (Bawah Tengah)
    roundRect(235, 875, 70, 32, 6, '#0ea5e9', '#0f172a', 2.5);
    roundRect(240, 845, 60, 26, 6, '#b91c1c', '#7f1d1d', 1.5);
    ctx.fillStyle = '#fde047'; ctx.font = '800 8.5px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText('WELCOME', 270, 861);

    // 4. Ruang Tunggu Antrean (Bawah Kanan)
    roundRect(312, 684, 210, 180, 14, 'rgba(255,255,255,0.55)', '#94a3b8', 2);
    ctx.fillStyle = '#1e293b'; ctx.font = '800 9.5px Inter, Arial'; ctx.textAlign = 'left';
    ctx.fillText('🪑 RUANG TUNGGU', 324, 704);
    roundRect(324, 750, 186, 26, 6, '#475569', '#1e293b', 1.5);
    roundRect(324, 800, 186, 26, 6, '#475569', '#1e293b', 1.5);

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
    const baseScale = Math.min((cw - 6) / WORLD_W, (ch - 96) / WORLD_H);
    const effScale = Math.max(0.28, baseScale * zoom);
    const offsetX = (cw - WORLD_W * effScale) / 2 + panX;
    const offsetY = (ch - WORLD_H * effScale) / 2 + 8 + panY;
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
