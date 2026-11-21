const STORAGE_KEY = 'oneilverse_rental_sim_v4.1';

const state = {
  gameMode: 'dev',
  rentalName: 'Rental Room Oneilverse',
  paused: false,
  speed: 1,
  year: 2020,
  month: 1,
  day: 1,
  totalDays: 1,
  hour: 8,
  minute: 0,

  walletMCash: 5000000,
  drawer: { 100000: 5, 50000: 5, 20000: 10, 10000: 10, 5000: 10, 2000: 10, 1000: 10, 500: 10 },
  businessPpobBalance: 1000000,
  qrisBalance: 0,

  kwh: 60.0,
  kiosLevel: 1,
  kiosOwned: false,

  stock: { popmie: 10, esteh: 10, condomSutra: 5, condomFiesta: 5, stikPS: 3 },
  employees: [],
  debts: [],
  wifi: { provider: null, hotspotOpen: false, voucherPrice: 3000, voucherHours: 3, activeUsers: 0 },
  inventoryConsoles: [],
  inventoryTVs: [],
  booths: [],
  queue: [],
  loyalCustomers: [],
  recommendedGames: [],
  selectedBoothForGames: null,
  unlockedBusinesses: [],
  player: {
    age: 18, gender: 'Perempuan', energy: 100, charm: 30, reputation: 4.5,
    status: 'Lajang', partner: null, relationship: 0, pregnant: false, pregnantWeeks: 0, children: 0
  },
  mainTab: 'toko',
  subTab: 'konsol',
  syncStatus: 'Offline'
};

function getDrawerTotal() { return DENOMINATIONS.reduce((sum, d) => sum + d * (state.drawer[d] || 0), 0); }
function fmtRp(n) { return 'Rp ' + Math.round(n).toLocaleString('id-ID'); }

function addLog(msg) {
  const box = document.getElementById('logBox');
  if (!box) return;
  const div = document.createElement('div');
  div.className = 'log-entry';
  const hh = String(state.hour).padStart(2, '0');
  const mm = String(state.minute).padStart(2, '0');
  div.innerHTML = `<span style="color:#64748b">[${state.day}/${state.month}/${state.year} ${hh}:${mm}]</span> ${msg}`;
  box.prepend(div);
  if (box.children.length > 50) box.removeChild(box.lastChild);
}

function addCashToDrawer(amt) {
  let rem = Math.round(amt);
  for (const d of DENOMINATIONS) {
    const c = Math.floor(rem / d);
    if (c > 0) { state.drawer[d] = (state.drawer[d] || 0) + c; rem -= c * d; }
  }
}
function deductCashFromDrawer(amt) {
  let tot = Math.max(0, getDrawerTotal() - amt);
  DENOMINATIONS.forEach(d => state.drawer[d] = 0);
  addCashToDrawer(tot);
}

function initStarterRooms() {
  state.booths = [];
  for (let i = 1; i <= 5; i++) {
    state.booths.push({
      id: i, type: (i <= 3 ? 'ps' : 'couple'),
      console: null, tv: null, rate: (i <= 3 ? 3000 : 50000), discountPct: 0,
      hasFan: true, hasAC: false, hasCCTV: false,
      customer: null, timeLeft: 0, totalTime: 0, cleaningTime: 0, snackOrder: null
    });
  }
}

function applyGameMode(mode) {
  state.gameMode = mode;
  state.year = 2020; state.month = 1; state.day = 1; state.totalDays = 1;
  state.hour = 8; state.minute = 0;
  state.inventoryConsoles = []; state.inventoryTVs = [];
  initStarterRooms();
  if (mode === 'dev') {
    state.walletMCash = 50000000;
    addCashToDrawer(2000000);
    addLog('🛠️ <b>Mode Developer</b> aktif (Dompet Pribadi Rp 50 Juta).');
  } else {
    state.walletMCash = 10000000;
    addCashToDrawer(500000);
    addLog('🚀 <b>Mode Rilis</b> aktif (Dompet Pribadi Rp 10 Juta).');
  }
  closeCustomModal();
  saveGame(true);
  renderAll(true);
}

function showCustomModal(title, body, footer) {
  document.getElementById('customModalTitle').innerHTML = title;
  document.getElementById('customModalBody').innerHTML = body;
  document.getElementById('customModalFooter').innerHTML = footer || '';
  document.getElementById('customModalBackdrop').style.display = 'flex';
}
function closeCustomModal() { document.getElementById('customModalBackdrop').style.display = 'none'; }

function openModeSelectModal() {
  showCustomModal(
    '⚙️ Pilih Mode Awal Permainan',
    `<div style="font-size:0.8rem;color:var(--muted);line-height:1.4;">
      • <b>Mode Developer:</b> Dompet Pribadi Rp 50 Juta.<br>
      • <b>Mode Rilis:</b> Dompet Pribadi Rp 10 Juta (Mulai dari nol murni).
    </div>`,
    `<button class="purple" onclick="applyGameMode('dev')">🛠️ Developer (50 Jt)</button>
     <button class="success" onclick="applyGameMode('release')">🎮 Rilis (10 Jt)</button>`
  );
}

function togglePause() { state.paused = !state.paused; updateHudOnly(); }
function setSpeed(s) { state.speed = s; state.paused = false; updateHudOnly(); }

setInterval(() => {
  if (state.paused) return;
  for (let i = 0; i < state.speed; i++) tickOneMinute();
  updateHudOnly();
  renderQueue();
  renderBooths();
}, 1000);

setInterval(() => { saveGame(); }, 10000);

function tickOneMinute() {
  state.minute += 1;
  if (state.minute >= 60) {
    state.minute = 0;
    state.hour += 1;
    onNewHour();
  }
  if (state.hour >= 24) {
    state.hour = 0;
    onNewDay();
  }

  if (state.minute === 0 && (state.hour === 12 || state.hour === 19)) {
    const cost = Math.floor(15000 + Math.random() * 25000);
    if (state.walletMCash >= cost) {
      state.walletMCash -= cost;
      addLog(`🍔 Pengeluaran harian (Makan/Bensin): -${fmtRp(cost)} dari Dompet Pribadi.`);
    }
  }

  state.booths.forEach(b => {
    if (b.cleaningTime > 0) {
      b.cleaningTime -= 1;
      if (b.cleaningTime === 0) addLog(`✨ Karyawan selesai membersihkan Room #${b.id}. Siap disewa lagi!`);
    }
    if (b.customer && b.cleaningTime === 0) {
      b.timeLeft -= 1;
      if (b.timeLeft <= 0) {
        const pay = b.customer.totalPaid;
        addCashToDrawer(pay);
        addLog(`💵 Sesi sewa ${b.customer.name} di Room #${b.id} selesai. Pendapatan +${fmtRp(pay)} masuk Kasir.`);
        b.customer = null;
        b.cleaningTime = 15;
      }
    }
  });

  if (state.hour >= 8 && state.hour <= 23 && state.queue.length < 5 && Math.random() < 0.08) {
    spawnAutoCustomer();
  }
}

function onNewHour() { state.player.energy = Math.max(0, state.player.energy - 1); }
function onNewDay() {
  state.day += 1; state.totalDays += 1;
  if (state.day > 30) { state.day = 1; state.month += 1; onNewMonth(); }
  if (state.month > 12) { state.month = 1; state.year += 1; state.player.age += 1; }
  addLog(`🌅 Hari baru ke-${state.totalDays} (${state.day}/${state.month}/${state.year}).`);
}
function onNewMonth() {
  const kios = KIOS_TIERS.find(k => k.level === state.kiosLevel);
  if (!state.kiosOwned && state.walletMCash >= kios.monthlyRent) {
    state.walletMCash -= kios.monthlyRent;
    addLog(`🏠 Sewa ruko bulanan (${fmtRp(kios.monthlyRent)}) dibayar.`);
  }
}

function spawnAutoCustomer() {
  const emptyRoom = state.booths.find(b => !b.customer && b.cleaningTime === 0 && (b.console || b.type === 'couple'));
  if (!emptyRoom) return;
  const names = ['Rizky', 'Bima', 'Aldi', 'Dika', 'Fajar', 'Galih', 'Nando'];
  const name = names[Math.floor(Math.random() * names.length)];
  const hours = Math.floor(Math.random() * 2) + 1;
  const rate = emptyRoom.type === 'couple' ? 50000 : (emptyRoom.console ? emptyRoom.console.defaultRate : 3000);
  const totalPaid = rate * hours;

  emptyRoom.customer = { name, hours, totalPaid };
  emptyRoom.timeLeft = hours * 60;
  addLog(`🚪 <b>${name}</b> masuk ke Room #${emptyRoom.id} (${emptyRoom.type === 'couple' ? 'Room Pasangan' : emptyRoom.console.name}) bayar <b>${fmtRp(totalPaid)}</b>.`);
}

function withdrawLaba(amt) {
  const drawerTot = getDrawerTotal();
  if (drawerTot < amt) return addLog('❌ Uang di kasir kurang!');
  deductCashFromDrawer(amt);
  state.walletMCash += amt;
  addLog(`💰 Menarik laba rental <b>${fmtRp(amt)}</b> ke Dompet Pribadi.`);
  saveGame(true);
  renderAll(true);
}

function updateHudOnly() {
  document.getElementById('rentalTitleDisplay').textContent = state.rentalName;
  const hh = String(state.hour).padStart(2, '0');
  const mm = String(state.minute).padStart(2, '0');
  document.getElementById('hudDateTime').textContent = `${state.day}/${state.month}/${state.year} • ${hh}:${mm}`;
  document.getElementById('hudWallet').textContent = fmtRp(state.walletMCash);
  document.getElementById('hudDrawer').textContent = fmtRp(getDrawerTotal());
  document.getElementById('hudPpob').textContent = fmtRp(state.businessPpobBalance);
  document.getElementById('hudKwh').textContent = `${state.kwh.toFixed(1)} kWh`;

  document.querySelectorAll('.speed-btn[data-speed]').forEach(btn => {
    btn.classList.toggle('active', !state.paused && Number(btn.dataset.speed) === state.speed);
  });
  document.getElementById('btnPause').classList.toggle('active', state.paused);
}

function renderQueue() {
  document.getElementById('queueCount').textContent = state.booths.filter(b => b.customer).length + '/5 Room Terisi';
  document.getElementById('queueList').innerHTML = `<div style="color:#34d399;font-size:0.78rem;text-align:center;padding:12px 0;">Sistem Pelanggan Otomatis Aktif 🚀</div>`;
}

function renderBooths() {
  const grid = document.getElementById('boothsGrid');
  grid.innerHTML = '';
  state.booths.forEach(b => {
    const isCouple = b.type === 'couple';
    const div = document.createElement('div');
    div.className = 'booth' + (b.customer ? ' active' : '') + (b.cleaningTime > 0 ? ' broken' : '');
    div.innerHTML = `
      <div class="booth-top">
        <span>🚪 Room #${b.id} (${isCouple ? 'Room Pasangan 💑' : 'Room PS 🎮'})</span>
        <span class="badge ${b.cleaningTime > 0 ? 'warn' : (b.customer ? 'busy' : 'ok')}">
          ${b.cleaningTime > 0 ? `Dibersihkan (${b.cleaningTime}m)` : (b.customer ? 'Disewa' : 'Kosong')}
        </span>
      </div>
      <div class="spec-line">
        ${isCouple ? '🛋️ Kasur Nyaman + Kipas<br>💵 Tarif: <b>Rp 50.000/jam</b>' : (b.console ? `🎮 <b>${b.console.name}</b><br>📺 ${b.tv ? b.tv.name : 'Belum ada TV'}<br>💵 Tarif: <b>${fmtRp(b.rate)}/jam</b>` : '<span style="color:#f87171;">⚠️ Belum ada konsol & TV</span>')}
      </div>
      ${b.customer ? `<div style="background:#090e1a;padding:6px;border-radius:7px;font-size:0.74rem;"><div><b>${b.customer.name}</b></div><div style="color:#94a3b8;">Sisa: ${b.timeLeft}m</div></div>` : ''}
      <div style="display:flex;gap:4px;margin-top:4px;">
        ${!isCouple && !b.console ? `<button class="primary" style="flex:1;" onclick="openAssembleModal(${b.id})">➕ Pasang Konsol & TV</button>` : ''}
      </div>
    `;
    grid.appendChild(div);
  });
}

function renderRightPanel() {
  const box = document.getElementById('rightPanelContent');
  box.innerHTML = '';
  if (state.mainTab === 'toko') {
    box.innerHTML = `
      <div class="sub-tabs">
        <button class="sub-btn ${state.subTab === 'konsol' ? 'active' : ''}" onclick="switchSubTab('konsol')">🎮 Konsol</button>
        <button class="sub-btn ${state.subTab === 'tv' ? 'active' : ''}" onclick="switchSubTab('tv')">📺 TV</button>
        <button class="sub-btn ${state.subTab === 'warung' ? 'active' : ''}" onclick="switchSubTab('warung')">🛒 Warung</button>
      </div>
      <div class="scroll-area" id="storeScroll">
        ${state.subTab === 'konsol' ? CONSOLE_CATALOG.map(c => `<div class="item-row"><div><b>${c.name}</b><br><span style="color:#34d399;">${fmtRp(c.price)}</span></div><button class="primary" onclick="buyHardware('console', '${c.id}')">Beli</button></div>`).join('') : ''}
        ${state.subTab === 'tv' ? TV_CATALOG.map(t => `<div class="item-row"><div><b>${t.name}</b><br><span style="color:#34d399;">${fmtRp(t.price)}</span></div><button class="primary" onclick="buyHardware('tv', '${t.id}')">Beli</button></div>`).join('') : ''}
        ${state.subTab === 'warung' ? `<div class="item-row"><div><b>Kondom Sutra</b><br><span style="color:#34d399;">Rp 20.000</span></div><button onclick="buyStock('condomSutra', 20000)">Beli</button></div><div class="item-row"><div><b>Token PLN 20 kWh</b><br><span style="color:#34d399;">Rp 30.000</span></div><button onclick="buyToken(20, 30000)">Beli</button></div>` : ''}
      </div>`;
  } else if (state.mainTab === 'karyawan') {
    box.innerHTML = `<button class="primary" onclick="openHireModal()">🧑‍💼 Rekrut Karyawan</button><div class="scroll-area">${state.employees.map(e => `<div class="item-row"><div><b>${e.name}</b> • Gaji: ${fmtRp(e.salary)}</div></div>`).join('')}</div>`;
  } else if (state.mainTab === 'bank') {
    box.innerHTML = `<div class="item-row" style="flex-direction:column;align-items:stretch;gap:6px;"><div style="display:flex;justify-content:space-between;"><span>Dompet:</span><b style="color:#60a5fa;">${fmtRp(state.walletMCash)}</b></div><div style="display:flex;justify-content:space-between;"><span>Kasir:</span><b style="color:#34d399;">${fmtRp(getDrawerTotal())}</b></div><button class="success" onclick="withdrawLaba(200000)">💰 Tarik Laba (Rp 200rb)</button></div>`;
  } else if (state.mainTab === 'life') {
    box.innerHTML = `<div class="item-row" style="flex-direction:column;gap:4px;"><b>👩🏻 Karakter (18 Thn)</b><button class="primary" onclick="state.player.energy=100;addLog('Istirahat pulih.');updateHudOnly();">🛏️ Tidur</button></div>`;
  }
}

function buyHardware(cat, id) {
  let item = cat === 'console' ? CONSOLE_CATALOG.find(x => x.id === id) : TV_CATALOG.find(x => x.id === id);
  if (!item) return;
  if (state.walletMCash < item.price) return addLog('❌ Dompet Pribadi kurang!');
  state.walletMCash -= item.price;
  if (cat === 'console') state.inventoryConsoles.push({ uid: 'c_' + Date.now(), ...item, games: [], stickHp: 100 });
  else state.inventoryTVs.push({ uid: 't_' + Date.now(), ...item });
  addLog(`📦 Beli <b>${item.name}</b>.`);
  saveGame(true); renderRightPanel(); updateHudOnly();
}
function buyStock(k, p) { if (state.walletMCash < p) return addLog('❌ Uang kurang!'); state.walletMCash -= p; state.stock[k]++; addLog('🛒 Beli stok.'); saveGame(true); updateHudOnly(); }
function buyToken(k, p) { if (state.walletMCash < p) return addLog('❌ Uang kurang!'); state.walletMCash -= p; state.kwh += k; addLog('⚡ Token PLN diisi.'); saveGame(true); updateHudOnly(); }
function openAssembleModal(rid) {
  if (state.inventoryConsoles.length === 0 || state.inventoryTVs.length === 0) return addLog('⚠️ Butuh 1 Konsol & 1 TV di gudang!');
  const c = state.inventoryConsoles.shift(), t = state.inventoryTVs.shift(), r = state.booths.find(x => x.id === rid);
  if (r) { r.console = c; r.tv = t; r.rate = c.defaultRate + t.bonusRate; addLog(`🎉 Room #${rid} dirakit!`); saveGame(true); renderBooths(); renderRightPanel(); }
}
function openHireModal() {
  const name = prompt('Nama Karyawan:', 'Siti');
  if (!name) return;
  state.employees.push({ name, salary: 1500000, bpjs: true });
  addLog(`🧑‍💼 Karyawan <b>${name}</b> direkrut.`);
  saveGame(true); renderRightPanel();
}

function switchMainTab(tab, el) {
  state.mainTab = tab;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  renderRightPanel();
}
function switchSubTab(sub) { state.subTab = sub; renderRightPanel(); }

function saveGame(f = false) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); CloudSync.pushToCloud(state, f); } catch(e){} }
function loadGameLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    Object.assign(state, JSON.parse(raw));
    return true;
  } catch(e) { return false; }
}

(async function boot() {
  CloudSync.init();
  const had = loadGameLocal();
  if (!had) { initStarterRooms(); openModeSelectModal(); }
  else { closeCustomModal(); addLog('💾 Progres dimuat.'); }
  renderAll(true);
  if (navigator.onLine && CloudSync.init()) {
    const r = await CloudSync.pullFromCloud();
    if (r.ok && r.state) {
      Object.assign(state, r.state);
      saveGame(true);
      renderAll(true);
    }
  }
})();

function renderAll(r) { updateHudOnly(); renderQueue(); renderBooths(); if(r) renderRightPlayer ? renderRightPanel() : renderRightPanel(); }
