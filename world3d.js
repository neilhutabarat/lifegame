// ==================== FULLSCREEN 2D CANVAS RENTAL PS TYCOON ENGINE ====================
// Visual 2D halus (rounded, gradasi, bayangan, layar TV animasi, karakter 2D imut non-kotak) + 60fps ringan di HP & PC!

(function () {
  'use strict';

  let canvas, ctx;
  let initialized = false;
  let panX = 0, panY = 0, zoom = 1;
  let isDragging = false, downPos = { x: 0, y: 0 }, lastPos = { x: 0, y: 0 };
  const hitRegions = [];

  // Koordinat dunia virtual 2D: 1200 x 760
  const WORLD_W = 1200, WORLD_H = 760;

  function roundRect(x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  }

  // Gambar karakter 2D halus (kepala bulat, rambut, mata berkilau, pipi merona, badan membulat)
  function drawCuteCharacter2D(x, y, seed, skinHex, shirtHex, isSitting, label, t) {
    ctx.save();
    ctx.translate(x, y);

    // Bayangan halus di lantai
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = isSitting ? Math.sin(t * 6 + seed) * 1.2 : Math.abs(Math.sin(t * 5 + seed)) * 2.5;
    ctx.translate(0, -bob);

    // Badan / Baju membulat
    roundRect(-13, -4, 26, 22, 9, shirtHex, 'rgba(255,255,255,0.2)');

    // Tangan
    const armSwing = isSitting ? Math.sin(t * 12 + seed) * 2.5 : Math.sin(t * 5 + seed) * 3;
    ctx.fillStyle = skinHex || '#f5ccb0';
    ctx.beginPath(); ctx.arc(-14, 6 + armSwing, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(14, 6 - armSwing, 4.5, 0, Math.PI * 2); ctx.fill();

    // Kepala bulat
    ctx.fillStyle = skinHex || '#f5ccb0';
    ctx.beginPath(); ctx.arc(0, -16, 13.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.5; ctx.stroke();

    // Rambut bervariasi
    const hairColors = ['#0f172a', '#3b2314', '#1e1b4b', '#5c2d16', '#27272a'];
    ctx.fillStyle = hairColors[seed % hairColors.length];
    ctx.beginPath();
    ctx.arc(0, -19, 14, Math.PI, Math.PI * 2);
    ctx.fill();
    if (seed % 2 === 0) {
      ctx.beginPath(); ctx.ellipse(-4, -27, 7, 4, -0.3, 0, Math.PI * 2); ctx.fill();
    }

    // Pipi merona
    ctx.fillStyle = 'rgba(244, 114, 182, 0.35)';
    ctx.beginPath(); ctx.arc(-7, -13, 2.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(7, -13, 2.8, 0, Math.PI * 2); ctx.fill();

    // Mata & Senyum
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(-4.5, -16, 2.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4.5, -16, 2.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(-4, -16.8, 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, -16.8, 0.8, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = '#9f1239'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(0, -12, 3.5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();

    if (label) {
      ctx.fillStyle = 'rgba(15,23,42,0.82)';
      roundRect(-24, -42, 48, 13, 6, 'rgba(15,23,42,0.82)', null);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '700 8.5px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label.slice(0, 9), 0, -33);
    }

    ctx.restore();
  }

  function drawTvAnim2D(x, y, w, h, slot, t) {
    if (typeof state !== 'undefined' && (state.plnBlackout || state.kwh <= 0)) {
      roundRect(x, y, w, h, 4, '#020617', '#334155');
      return;
    }
    if (!slot.occupied) {
      roundRect(x, y, w, h, 4, '#0f172a', '#38bdf8');
      ctx.fillStyle = slot.installedGame ? '#4ade80' : '#f87171';
      ctx.font = '700 7.5px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(slot.console.platform, x + w / 2, y + h / 2 + 2);
      return;
    }
    const title = (slot.installedGame ? slot.installedGame.title : 'PES').toLowerCase();
    if (title.includes('winning') || title.includes('pes') || title.includes('fc') || title.includes('fifa')) {
      roundRect(x, y, w, h, 4, '#15803d', '#38bdf8');
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1;
      ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
      const bx = x + w / 2 + Math.sin(t * 4) * (w * 0.28);
      const by = y + h / 2 + Math.cos(t * 3) * (h * 0.22);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx, by, 2.2, 0, Math.PI * 2); ctx.fill();
    } else if (title.includes('racing') || title.includes('need') || title.includes('downhill')) {
      roundRect(x, y, w, h, 4, '#0284c7', '#38bdf8');
      ctx.fillStyle = '#334155'; ctx.fillRect(x + 6, y + h / 2, w - 12, h / 2 - 2);
      const cx = x + w / 2 + Math.sin(t * 5) * 10;
      ctx.fillStyle = '#ef4444'; ctx.fillRect(cx - 5, y + h - 8, 10, 5);
    } else {
      roundRect(x, y, w, h, 4, '#312e81', '#38bdf8');
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(x + 12 + Math.sin(t * 7) * 5, y + 10, 6, 12);
      ctx.fillStyle = '#f43f5e'; ctx.fillRect(x + w - 18 + Math.cos(t * 7) * 5, y + 10, 6, 12);
    }
  }

  function renderFrame(now) {
    requestAnimationFrame(renderFrame);
    if (!canvas || !ctx) return;
    const t = now * 0.001;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = window.innerWidth, ch = window.innerHeight;
    if (canvas.width !== Math.floor(cw * dpr) || canvas.height !== Math.floor(ch * dpr)) {
      canvas.width = Math.floor(cw * dpr);
      canvas.height = Math.floor(ch * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#060a14';
    ctx.fillRect(0, 0, cw, ch);

    // Hitung skala otomatis agar pas di HP maupun Desktop
    const baseScale = Math.min((cw - 16) / WORLD_W, (ch - 140) / WORLD_H);
    const effScale = Math.max(0.28, baseScale * zoom);
    const offsetX = (cw - WORLD_W * effScale) / 2 + panX;
    const offsetY = (ch - WORLD_H * effScale) / 2 + 18 + panY;

    ctx.translate(offsetX, offsetY);
    ctx.scale(effScale, effScale);

    hitRegions.length = 0;

    // Lantai Ruko & Keramik sesuai Level Renovasi
    const rLv = (typeof RENOV_LEVELS !== 'undefined' && typeof state !== 'undefined' && RENOV_LEVELS[state.renovLevel - 1]) || { floorColor: '#1e293b', wallColor: '#0f172a' };
    roundRect(20, 20, WORLD_W - 40, WORLD_H - 40, 24, rLv.floorColor, '#334155');

    // Garis keramik halus
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let gx = 60; gx < WORLD_W - 40; gx += 48) {
      ctx.beginPath(); ctx.moveTo(gx, 24); ctx.lineTo(gx, WORLD_H - 24); ctx.stroke();
    }
    for (let gy = 60; gy < WORLD_H - 40; gy += 48) {
      ctx.beginPath(); ctx.moveTo(24, gy); ctx.lineTo(WORLD_W - 24, gy); ctx.stroke();
    }

    // Header Papan Neon Sign di Dinding Atas
    roundRect(330, 28, 540, 46, 12, '#090d16', '#38bdf8');
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 18px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎮 RENTAL PS & KONTER PULSA ONEILVERSE', 600, 51);
    ctx.fillStyle = '#4ade80';
    ctx.font = '700 11px Inter, Arial, sans-serif';
    ctx.fillText('10 UNIT REGULER (KIRI) • 10 ROOM VIP AC (KANAN) • RUANG TUNGGU & KASIR', 600, 67);

    // Zona Label Area
    ctx.fillStyle = 'rgba(56,189,248,0.12)';
    roundRect(45, 88, 535, 385, 16, 'rgba(15,23,42,0.45)', 'rgba(56,189,248,0.2)');
    roundRect(615, 88, 540, 385, 16, 'rgba(30,27,75,0.45)', 'rgba(139,92,246,0.25)');
    ctx.fillStyle = '#94a3b8'; ctx.font = '700 12px Inter, Arial'; ctx.textAlign = 'left';
    ctx.fillText('AREA REGULER (10 UNIT SEJEJER)', 62, 110);
    ctx.fillText('AREA ROOM VIP TERTUTUP (10 ROOM)', 632, 110);

    // 20 Slot Unit Rental PS
    if (typeof state !== 'undefined' && state.slots) {
      state.slots.forEach((slot, i) => {
        const isRoom = i >= 10;
        const idxInArea = isRoom ? (i - 10) : i;
        const row = Math.floor(idxInArea / 5);
        const col = idxInArea % 5;
        const sx = (isRoom ? 635 : 60) + col * 103;
        const sy = 128 + row * 172;
        const sw = 92, sh = 152;

        hitRegions.push({ x: sx, y: sy, w: sw, h: sh, action: 'slot', slotId: slot.id });

        const hasHw = !!(slot.console || slot.tv || slot.cooling);
        if (!hasHw) {
          ctx.save();
          ctx.setLineDash([5, 5]);
          roundRect(sx, sy, sw, sh, 12, 'rgba(15,23,42,0.25)', 'rgba(148,163,184,0.22)');
          ctx.restore();
          ctx.fillStyle = '#64748b';
          ctx.font = '700 10px Inter, Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`+ Slot #${slot.id}`, sx + sw / 2, sy + sh / 2);
          return;
        }

        // Sekat Room VIP atau Unit Luar
        roundRect(sx, sy, sw, sh, 12, isRoom ? 'rgba(49,46,129,0.55)' : 'rgba(15,23,42,0.68)', slot.occupied ? '#10b981' : '#334155');

        // Meja TV
        roundRect(sx + 10, sy + 14, sw - 20, 22, 5, '#451a03', '#78350f');
        // TV & Animasi Game
        if (slot.tv) {
          drawTvAnim2D(sx + 18, sy + 6, sw - 36, 26, slot, t + i);
        }
        // Konsol PS di meja
        if (slot.console) {
          const pCol = slot.console.platform === 'PS1' ? '#cbd5e1' : slot.console.platform === 'PS5' ? '#f8fafc' : '#1e293b';
          roundRect(sx + sw - 30, sy + 24, 18, 9, 2, pCol, '#38bdf8');
        }
        // Kipas / AC
        if (slot.cooling && slot.cooling.type === 'ac') {
          roundRect(sx + 20, sy + 1, sw - 40, 6, 3, '#f8fafc', '#38bdf8');
        } else if (slot.cooling && slot.cooling.type === 'fan') {
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath(); ctx.arc(sx + 14, sy + 14, 5, 0, Math.PI * 2); ctx.fill();
        }

        // Sofa Pelanggan
        roundRect(sx + 16, sy + 82, sw - 32, 34, 8, isRoom ? '#4f46e5' : '#0369a1', 'rgba(255,255,255,0.2)');

        // Karakter Pelanggan jika sedang main
        if (slot.occupied) {
          const shirts = ['#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];
          const seed = slot.customerSeed || i;
          drawCuteCharacter2D(sx + sw / 2, sy + 92, seed, '#f5ccb0', shirts[seed % shirts.length], true, slot.customerName || 'Tamu', t);
          ctx.fillStyle = '#4ade80';
          ctx.font = '700 9px Inter, Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${slot.minutesLeft}m`, sx + sw / 2, sy + sh - 10);
        } else {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '700 9px Inter, Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`#${slot.id} • ${slot.console ? slot.console.platform : 'TV'}`, sx + sw / 2, sy + sh - 10);
        }
      });
    }

    // Meja Kasir & Etalase (Bawah Kiri)
    roundRect(55, 515, 340, 185, 16, 'rgba(30,58,138,0.45)', '#3b82f6');
    roundRect(85, 555, 210, 48, 10, '#1e3a8a', '#60a5fa');
    ctx.fillStyle = '#f8fafc'; ctx.font = '800 12px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText('🖥️ MEJA KASIR & KONTER PULSA', 190, 583);
    hitRegions.push({ x: 55, y: 515, w: 340, h: 185, action: 'cashier' });

    // Owner di Kasir (jika tidak sedang sekolah)
    if (typeof isPlayerAtSchool !== 'function' || !isPlayerAtSchool()) {
      drawCuteCharacter2D(190, 642, 7, '#f5ccb0', '#2563eb', false, typeof state !== 'undefined' ? state.player.name.split(' ')[0] : 'Owner', t);
    }

    // Karyawan aktif
    if (typeof state !== 'undefined' && state.employees) {
      state.employees.forEach((emp, idx) => {
        if (typeof isEmployeeOnDuty === 'function' && !isEmployeeOnDuty(emp)) return;
        const ex = emp.tasks && emp.tasks.includes('clean') ? 540 + Math.sin(t * 0.7 + idx) * 240 : 280 + idx * 44;
        const ey = emp.tasks && emp.tasks.includes('clean') ? 495 + Math.cos(t * 0.5 + idx) * 45 : 642;
        drawCuteCharacter2D(ex, ey, 50 + idx, '#ecc0a1', '#10b981', false, emp.name.split(' ')[0], t);
      });
    }

    // Ruang Tunggu Antrean (Bawah Kanan)
    roundRect(760, 515, 390, 185, 16, 'rgba(15,23,42,0.65)', '#475569');
    ctx.fillStyle = '#cbd5e1'; ctx.font = '800 12px Inter, Arial'; ctx.textAlign = 'left';
    ctx.fillText('🪑 RUANG TUNGGU ANTREAN', 782, 540);
    roundRect(785, 560, 340, 34, 8, '#334155', '#64748b');
    roundRect(785, 625, 340, 34, 8, '#334155', '#64748b');
    if (typeof state !== 'undefined' && state.waitingQueue) {
      state.waitingQueue.forEach((wq, idx) => {
        const wx = 820 + (idx % 4) * 78;
        const wy = idx < 4 ? 575 : 640;
        drawCuteCharacter2D(wx, wy, wq.seed || idx, '#f1c6a7', '#f97316', true, wq.name, t);
      });
    }

    // Noda Kotoran Lantai jika kebersihan turun
    if (typeof state !== 'undefined' && state.cleanliness < 90) {
      const n = Math.floor((100 - state.cleanliness) / 8);
      ctx.fillStyle = 'rgba(120, 53, 15, 0.55)';
      for (let d = 0; d < n; d++) {
        ctx.beginPath();
        ctx.ellipse(220 + (d * 97) % 760, 180 + (d * 67) % 320, 12, 7, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  function handleCanvasTap(clientX, clientY) {
    if (!canvas) return;
    const cw = window.innerWidth, ch = window.innerHeight;
    const baseScale = Math.min((cw - 16) / WORLD_W, (ch - 140) / WORLD_H);
    const effScale = Math.max(0.28, baseScale * zoom);
    const offsetX = (cw - WORLD_W * effScale) / 2 + panX;
    const offsetY = (ch - WORLD_H * effScale) / 2 + 18 + panY;
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
