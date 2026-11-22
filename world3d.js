// ==================== PAPAN MONITOR BILLING WARNET 20 PC (PAKET BAR MENURUN vs BILLING METER RP NAIK PER DETIK + UPDATE PATCH MB/GB) ====================

(function () {
  'use strict';

  let boardFilter = 'all'; // 'all' | 'outdoor' | 'vip'

  function fmtSecToHms(sec) {
    const s = Math.max(0, Math.floor(sec || 0));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
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

    const activeCount = state.slots.filter(s => s.occupied).length;
    const readyCount = state.slots.filter(s => typeof isSlotReadyToPlay === 'function' && isSlotReadyToPlay(s).ok).length;
    const guardInfo = typeof getCurrentGuardStatus === 'function' ? getCurrentGuardStatus() : { label: 'Owner' };

    if (fullRebuild || !document.getElementById('slotsBoardGrid')) {
      container.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;background:rgba(15,23,42,0.85);padding:6px 8px;border-radius:10px;border:1px solid var(--border);font-size:0.68rem;">
          <span>🖥️ <b>Penjaga:</b> <span id="lblGuardStatus">${guardInfo.label}</span></span>
          <div style="display:flex;gap:4px;">
            <button type="button" class="primary" style="padding:3px 7px;font-size:0.64rem;" onclick="openBillingRateModal()">⚙️ Tarif/Paket</button>
            <button type="button" class="amber" style="padding:3px 7px;font-size:0.64rem;" onclick="triggerManualPatchAll()">🔄 Update Game</button>
          </div>
        </div>
        <div class="room-filter-bar">
          <button type="button" class="${boardFilter === 'all' ? 'active' : ''}" onclick="setBoardFilter('all')">Semua (${activeCount}/${readyCount} Online)</button>
          <button type="button" class="${boardFilter === 'outdoor' ? 'active' : ''}" onclick="setBoardFilter('outdoor')">10 PC Reguler</button>
          <button type="button" class="${boardFilter === 'vip' ? 'active' : ''}" onclick="setBoardFilter('vip')">10 Room VIP</button>
        </div>
        <div id="slotsBoardGrid" class="slots-board-grid"></div>
      `;
    } else {
      const gs = document.getElementById('lblGuardStatus');
      if (gs) gs.textContent = guardInfo.label;
    }

    const grid = document.getElementById('slotsBoardGrid');
    if (!grid) return;

    grid.innerHTML = list.map(s => {
      const hasPc = !!(s.cpu || s.monitor);
      if (!hasPc) {
        return `<div class="slot-card empty-slot ${s.isRoom ? 'vip' : ''}" onclick="openSlotConfigModal(${s.id})">
          <b style="color:#94a3b8;font-size:0.74rem;">+ ${s.isRoom ? `Room VIP #${s.id - 10}` : `Bilik PC #${s.id}`}</b>
          <span class="spec-line">Tap untuk Rakit PC &amp; Monitor</span>
        </div>`;
      }

      const st = typeof isSlotReadyToPlay === 'function' ? isSlotReadyToPlay(s) : { ok: true, reason: 'Siap' };
      const pcImg = s.isRoom ? REAL_CONSOLE_PHOTOS.pc_vip : REAL_CONSOLE_PHOTOS.pc_std;
      const monImg = s.monitor ? s.monitor.img : REAL_CONSOLE_PHOTOS.mon_std;

      // Status Billing / Update Patch
      let billingHtml = '';
      if (s.updatingPatch) {
        const upPct = Math.min(100, Math.round(((s.patchDoneMb || 0) / Math.max(1, s.patchTotalMb || 100)) * 100));
        billingHtml = `
          <div class="billing-box" style="border:1px solid #f59e0b;">
            <div class="billing-top">
              <span style="color:#fbbf24;">🔄 Update Patch</span>
              <span style="color:#38bdf8;">${Math.round(s.patchDoneMb || 0)}/${s.patchTotalMb} MB</span>
            </div>
            <div class="countdown-track">
              <div class="countdown-fill" style="width:${upPct}%;background:linear-gradient(90deg,#f59e0b,#38bdf8);"></div>
            </div>
            <div class="spec-line" style="font-size:0.59rem;color:#fde047;">Patching: ${s.updatingGameTitle || 'Game Online'} (${upPct}%)</div>
          </div>`;
      } else if (s.occupied) {
        if (s.billingMode === 'paket') {
          const totalSec = Math.max(60, s.totalSecondsBooked || 3600);
          const pct = Math.max(0, Math.min(100, Math.round(((s.secondsLeft || 0) / totalSec) * 100)));
          billingHtml = `
            <div class="billing-box">
              <div class="billing-top">
                <span style="color:#4ade80;">📦 ${s.packageName || 'Paket'} (${fmtSecToHms(s.secondsLeft)})</span>
                <span style="color:#fbbf24;">Rp ${Math.round(s.packagePrice || 0).toLocaleString('id-ID')}</span>
              </div>
              <div class="countdown-track">
                <div class="countdown-fill" style="width:${pct}%;"></div>
              </div>
              <div class="spec-line" style="font-size:0.6rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${s.partyTag ? `<b style="color:#f43f5e">[${s.partyTag}]</b> ` : ''}<b>${s.customerName}:</b> ${s.activityLabel || 'Main Game'}
              </div>
            </div>`;
        } else {
          // Mode Billing Meter (Hitung Per Detik, Rupiah Naik Terus!)
          const elSec = s.elapsedSeconds || 0;
          const curRp = Math.floor((elSec / 3600) * (s.hourlyRate || state.billingHourlyRate || 6000));
          const meterPct = Math.min(100, Math.round(((elSec % 3600) / 3600) * 100));
          billingHtml = `
            <div class="billing-box">
              <div class="billing-top">
                <span style="color:#38bdf8;">⏱️ METER ${fmtSecToHms(elSec)}</span>
                <span style="color:#4ade80;">Rp ${curRp.toLocaleString('id-ID')}</span>
              </div>
              <div class="countdown-track">
                <div class="countdown-fill" style="width:${meterPct}%;background:linear-gradient(90deg,#3b82f6,#a855f7);"></div>
              </div>
              <div class="spec-line" style="font-size:0.6rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${s.partyTag ? `<b style="color:#f43f5e">[${s.partyTag}]</b> ` : ''}<b>${s.customerName}:</b> ${s.activityLabel || 'Browsing'}
              </div>
            </div>`;
        }
      } else {
        const rate = typeof getSlotHourlyRate === 'function' ? getSlotHourlyRate(s) : (state.billingHourlyRate || 3000);
        billingHtml = `
          <div class="billing-box">
            <div class="billing-top">
              <span style="color:#94a3b8;">Standby</span>
              <span style="color:#fbbf24;">Rp ${rate.toLocaleString('id-ID')}/jam</span>
            </div>
            <div class="countdown-track"><div class="countdown-fill" style="width:0%;"></div></div>
            <div class="spec-line" style="font-size:0.59rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${st.ok ? `✅ ${s.os ? s.os.name.slice(0, 14) : 'Win 7'} • Siap Pakai` : `⚠️ ${st.reason}`}
            </div>
          </div>`;
      }

      return `<div class="slot-card ${s.isRoom ? 'vip' : ''} ${s.occupied ? 'playing' : ''}" onclick="openSlotConfigModal(${s.id})">
        <div class="slot-card-head">
          <b>${s.isRoom ? `👑 Room #${s.id - 10}` : `🖥️ PC #${s.id}`}</b>
          <span class="badge ${s.updatingPatch ? 'warn' : s.occupied ? 'ok' : st.ok ? 'busy' : 'warn'}">${s.updatingPatch ? 'PATCH' : s.occupied ? (s.billingMode === 'paket' ? 'PAKET' : 'METER') : st.ok ? 'IDLE' : 'CEK'}</span>
        </div>

        <div class="slot-hw-pics">
          <img class="slot-pic" src="${pcImg}" alt="PC" />
          <img class="slot-pic" src="${monImg}" alt="Monitor" />
          <div class="slot-hw-info">
            <div><b>${s.cpu ? s.cpu.name.replace('Intel ', '').replace('AMD ', '').slice(0, 14) : 'Tanpa CPU'}</b></div>
            <div>RAM ${s.ram ? s.ram.sizeGb + 'GB' : '-'} • ${s.vga ? s.vga.name.replace('NVIDIA ', '').replace('GeForce ', '').slice(0, 11) : 'No VGA'}</div>
            <div>❄️ ${s.cooling ? (s.cooling.type === 'ac' ? 'AC' : 'Kipas') : '-'} • 🖱️ <b>${s.gear ? Math.round(s.gear.durability) + '%' : '0%'}</b></div>
          </div>
        </div>

        ${billingHtml}
      </div>`;
    }).join('');
  };

  window.resetStudio3dCamera = function () { window.renderRoomBoard(true); };
  window.initRental3D = function () { window.renderRoomBoard(true); };
})();
