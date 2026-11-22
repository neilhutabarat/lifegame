// ==================== PAPAN RUANGAN & BILLING 20 SLOT (TANPA KARAKTER, RINGAN, GAMBAR PS+TV & BAR MUNDUR BILLING) ====================
// Terkunci penuh di layar HP (tidak bisa geser samping), menampilkan gambar PS & TV yang terpasang di tiap slot beserta bar mundur billing real-time.

(function () {
  'use strict';

  let boardFilter = 'all'; // 'all' | 'outdoor' | 'vip'

  function fmtDuration(mins) {
    const m = Math.max(0, Math.round(mins || 0));
    const h = Math.floor(m / 60);
    const r = m % 60;
    return h > 0 ? `${h}j ${String(r).padStart(2, '0')}m` : `${r} mnt`;
  }

  window.setBoardFilter = function (f) {
    boardFilter = f;
    window.renderRoomBoard(true);
  };

  window.renderRoomBoard = function (fullRebuild) {
    const container = document.getElementById('studio3dViewport');
    if (!container || typeof state === 'undefined' || !state.slots) return;

    const list = state.slots.filter(s =>
      boardFilter === 'all' ? true : boardFilter === 'outdoor' ? !s.isRoom : s.isRoom
    );

    // Jika container belum punya struktur atau diminta rebuild penuh
    if (fullRebuild || !document.getElementById('slotsBoardGrid')) {
      const activeCount = state.slots.filter(s => s.occupied).length;
      const readyCount = state.slots.filter(s => typeof isSlotReadyToPlay === 'function' && isSlotReadyToPlay(s).ok).length;

      container.innerHTML = `
        <div class="room-filter-bar">
          <button type="button" class="${boardFilter === 'all' ? 'active' : ''}" onclick="setBoardFilter('all')">Semua (${activeCount}/${readyCount} Main)</button>
          <button type="button" class="${boardFilter === 'outdoor' ? 'active' : ''}" onclick="setBoardFilter('outdoor')">10 Unit Luar</button>
          <button type="button" class="${boardFilter === 'vip' ? 'active' : ''}" onclick="setBoardFilter('vip')">10 Room VIP</button>
        </div>
        <div id="slotsBoardGrid" class="slots-board-grid"></div>
      `;
    }

    const grid = document.getElementById('slotsBoardGrid');
    if (!grid) return;

    grid.innerHTML = list.map(s => {
      const hasHw = !!(s.console || s.tv || s.cooling);
      if (!hasHw) {
        return `<div class="slot-card empty-slot ${s.isRoom ? 'vip' : ''}" onclick="openSlotConfigModal(${s.id})">
          <b style="color:#94a3b8;font-size:0.75rem;">+ ${s.isRoom ? `Room VIP #${s.id - 10}` : `Slot Luar #${s.id}`}</b>
          <span class="spec-line">Tap untuk pasang PS &amp; TV</span>
        </div>`;
      }

      const st = typeof isSlotReadyToPlay === 'function' ? isSlotReadyToPlay(s) : { ok: true, reason: 'Siap' };
      const rate = typeof getSlotHourlyRate === 'function' ? getSlotHourlyRate(s) : 3000;
      const totalMins = Math.max(60, s.totalMinutesBooked || 120);
      const pct = s.occupied ? Math.max(0, Math.min(100, Math.round((s.minutesLeft / totalMins) * 100))) : 0;
      const totalBill = s.occupied ? (s.totalBillPaid || (rate * Math.ceil(totalMins / 60))) : rate;

      const psImg = s.console ? s.console.img : (typeof REAL_CONSOLE_PHOTOS !== 'undefined' ? REAL_CONSOLE_PHOTOS.ps2_slim : '');
      const tvImg = s.tv ? s.tv.img : (typeof REAL_CONSOLE_PHOTOS !== 'undefined' ? REAL_CONSOLE_PHOTOS.tv_crt : '');
      const gameName = s.occupied && s.installedGame
        ? s.installedGame.title
        : (s.console ? `Bebas Pilih (${s.console.platform})` : 'Belum ada PS');

      return `<div class="slot-card ${s.isRoom ? 'vip' : ''} ${s.occupied ? 'playing' : ''}" onclick="openSlotConfigModal(${s.id})">
        <div class="slot-card-head">
          <b>${s.isRoom ? `👑 VIP #${s.id - 10}` : `🕹️ Slot #${s.id}`}</b>
          <span class="badge ${s.occupied ? 'ok' : st.ok ? 'busy' : 'warn'}">${s.occupied ? '🟢 MAIN' : st.ok ? 'SIAP' : 'CEK'}</span>
        </div>

        <div class="slot-hw-pics">
          ${s.console ? `<img class="slot-pic" src="${psImg}" alt="PS" />` : ''}
          ${s.tv ? `<img class="slot-pic" src="${tvImg}" alt="TV" />` : ''}
          <div class="slot-hw-info">
            <div><b>${s.console ? s.console.platform : 'Tanpa PS'}</b> • ${s.tv ? s.tv.name.split(' ')[2] || 'TV' : 'Tanpa TV'}</div>
            <div>❄️ ${s.cooling ? (s.cooling.type === 'ac' ? 'AC Dingin' : 'Kipas') : 'Tanpa Kipas'}</div>
            <div>🕹️ Stik: <b>${s.controller ? `${Math.round(s.controller.durability)}%` : 'Kosong'}</b></div>
          </div>
        </div>

        <div class="billing-box">
          <div class="billing-top">
            <span style="color:${s.occupied ? '#4ade80' : '#94a3b8'};">${s.occupied ? `⏱️ ${fmtDuration(s.minutesLeft)}` : 'Kosong'}</span>
            <span style="color:#fbbf24;">${typeof fmtRp === 'function' ? fmtRp(totalBill) : totalBill}${s.occupied ? '' : '/jam'}</span>
          </div>
          <div class="countdown-track">
            <div class="countdown-fill" style="width:${pct}%;"></div>
          </div>
          <div class="spec-line" style="font-size:0.6rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            💿 ${s.occupied ? `${s.customerName}: ${gameName}` : (st.ok ? gameName : st.reason)}
          </div>
        </div>
      </div>`;
    }).join('');
  };

  window.resetStudio3dCamera = function () {
    window.renderRoomBoard(true);
  };

  window.initRental3D = function () {
    window.renderRoomBoard(true);
  };
})();
