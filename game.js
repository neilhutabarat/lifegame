// ==================== ENGINE UTAMA RENTAL PS & LIFE SIMULATOR (2010 - SEKARANG) ====================
const STORAGE_KEY = 'oneilverse_rental_ps_sim_2010_v2';
const THEME_KEY = 'oneilverse_theme_v1';

function createEmptySlots20() {
  const arr = [];
  for (let i = 1; i <= 20; i++) {
    arr.push({
      id: i,
      isRoom: i >= 11, // 1..10 = Luar Sejejer, 11..20 = Room VIP Tertutup
      name: i <= 10 ? `Unit Luar #${i}` : `Room VIP #${i - 10} (Slot #${i})`,
      console: null,       // Object dari gudang konsol
      tv: null,            // Object dari gudang TV
      cooling: null,       // Kipas / AC
      controller: null,    // { platform, quality: 'new'|'serviced', durability: 100, maxDurability: 100 }
      memCard: null,       // { platform, name }
      installedGame: null, // Untuk versi kaset fisik (1 kaset) atau game aktif
      digitalGames: [],    // Untuk PS3/4/5 Digital (array id game)
      occupied: false,
      customerName: '',
      customerSeed: 1,
      minutesLeft: 0,
      hourlyRate: 3000
    });
  }
  return arr;
}

const state = {
  version: 'v2.0',
  cityId: 'jbi',
  paused: false,
  speed: 1,

  // Kalender Asli Mulai Jumat, 1 Januari 2010
  year: 2010,
  month: 1,
  day: 1,
  dayOfWeek: 5, // 1 Jan 2010 = Jumat
  totalDays: 1,
  hour: 8,
  minute: 0,

  // Modal Awal 50 Juta dari Orang Tua (Dibagi ke Bank, Laci, Dompet & Saldo Pulsa)
  laciCash: 5000000,
  handWallet: 1500000,
  personalBank: 42500000,
  businessPpobBalance: 1000000,

  // Listrik PLN & Kebersihan Tempat Usaha
  kwh: 45.0,
  plnBlackout: false,
  cleanliness: 100,
  renovLevel: 1,
  rentalOpen: true,

  // 20 Slot Modular (10 Luar Sejejer + 10 Room VIP) & Ruang Tunggu Antrean
  slots: createEmptySlots20(),
  waitingQueue: [],

  // Gudang Perangkat yang Belum Dipasang / Dilepas dari Slot
  warehouseConsoles: [],
  warehouseTvs: [],
  warehouseCoolings: [],

  // Stok Stik & Memory Card di Kasir (Stik Baru, Stik Hasil Servis, Stik Rusak)
  cashierSticksNew: { PS1: 2, PS2: 4, PS3: 0, PS4: 0, PS5: 0 },
  cashierSticksServiced: { PS1: 0, PS2: 0, PS3: 0, PS4: 0, PS5: 0 },
  cashierSticksBroken: { PS1: 0, PS2: 0, PS3: 0, PS4: 0, PS5: 0 },
  cashierMemCards: { PS1: 1, PS2: 2 },

  // Koleksi Kaset Game yang Dimiliki: { [gameId]: totalOwnedCopies }
  ownedDiscs: {
    'ps1_we2002': 1,
    'ps1_ctr': 1,
    'ps2_gta_sa': 1,
    'ps2_we10_pes': 1,
    'ps2_downhill': 1
  },

  // Stok Makanan & Minuman Kasir (dalam satuan Pcs, dibeli Per Dus dari Agen)
  snackStockPcs: {
    'sn_indomie_grg': 40,
    'sn_teh_gelas': 24,
    'sn_aqua_gelas': 48
  },

  // Karyawan Rental PS
  employees: [],

  // Pinjaman Orang Tua (Maks 50jt, 52x mingguan tanpa bunga) & Pinjaman Bank (Usia 21+)
  parentLoan: {
    active: false,
    remainingTotal: 0,
    weeklyInstallment: 0,
    weeksLeft: 0
  },
  bankLoan: {
    active: false,
    principal: 0,
    remainingTotal: 0,
    monthlyInstallment: 0,
    monthsLeft: 0,
    interestRatePct: 0
  },

  // Otomotif & Gadget yang Dimiliki
  ownedVehicles: [],
  ownedGadgets: [],

  // Karakter Utama (Dimulai minimal usia 8 tahun)
  player: {
    name: 'Neil Aura',
    gender: 'Laki-laki',
    religion: 'Islam',
    ethnicity: 'chinese',
    birthDay: 15,
    birthMonth: 5,
    birthYear: 1998, // Usia 12 tahun di 2010 (masih sekolah, minimal usia 8 tahun = kelahiran <= 2002)
    age: 12,
    energy: 100,
    hunger: 90,
    mood: 90,
    bpjsTier: 'none',
    partner: null,
    relationship: 0,
    married: false,
    childrenList: []
  },

  mainTab: 'slots',
  slotSubFilter: 'all', // 'all' | 'outdoor' | 'vip'
  discPlatformFilter: 'PS2',
  discSearchQuery: '',
  hwCategoryFilter: 'console',
  hwConsolePlatFilter: 'PS1',
  soundEnabled: true
};

// ==================== EFEK SUARA GAME (WEB AUDIO API) ====================
let audioCtx = null;
function playSfx(type) {
  if (!state.soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    if (type === 'cash') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.07);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now); osc.stop(now + 0.28);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(220, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      osc.start(now); osc.stop(now + 0.26);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now); osc.stop(now + 0.06);
    }
  } catch (e) {}
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  const btn = document.getElementById('btnSoundToggle');
  if (btn) btn.textContent = state.soundEnabled ? '🔊' : '🔇';
  if (state.soundEnabled) playSfx('click');
}

// Pasang 2 unit awal (1 PS1 di Slot #1 & 1 PS2 di Room VIP #11) supaya langsung terlihat hidup!
function seedStarterUnits() {
  const c1 = CONSOLE_CATALOG.find(x => x.id === 'ps1_one');
  const c2 = CONSOLE_CATALOG.find(x => x.id === 'ps2_slim');
  const tv1 = TV_CATALOG.find(x => x.id === 'tv_crt14');
  const tv2 = TV_CATALOG.find(x => x.id === 'tv_crt21');
  const fan1 = COOLING_CATALOG.find(x => x.id === 'fan_wall');
  const g1 = GAME_DISC_CATALOG.find(x => x.id === 'ps1_we2002');
  const g2 = GAME_DISC_CATALOG.find(x => x.id === 'ps2_gta_sa');

  if (c1 && tv1 && state.slots[0]) {
    state.slots[0].console = { ...c1, uid: 'c_init_1', cond: 100 };
    state.slots[0].tv = { ...tv1, uid: 'tv_init_1', cond: 100 };
    state.slots[0].controller = { platform: 'PS1', quality: 'new', durability: 100, maxDurability: 100 };
    state.slots[0].memCard = { platform: 'PS1', name: 'Memory Card PS1 1MB' };
    state.slots[0].installedGame = g1;
  }
  if (c2 && tv2 && state.slots[10]) {
    state.slots[10].console = { ...c2, uid: 'c_init_2', cond: 100 };
    state.slots[10].tv = { ...tv2, uid: 'tv_init_2', cond: 100 };
    state.slots[10].cooling = { ...fan1, uid: 'cl_init_1' };
    state.slots[10].controller = { platform: 'PS2', quality: 'new', durability: 100, maxDurability: 100 };
    state.slots[10].memCard = { platform: 'PS2', name: 'Memory Card PS2 8MB' };
    state.slots[10].installedGame = g2;
  }
}

// ==================== HELPER HARGA & WAKTU SESUAI ZAMAN ====================
function fmtRp(n) { return 'Rp ' + Math.round(n || 0).toLocaleString('id-ID'); }
function roundTo500(n) { return Math.max(500, Math.round(n / 500) * 500); }
function getCity() { return INDONESIA_CITIES.find(c => c.id === state.cityId) || INDONESIA_CITIES[0]; }
function getCurrentUmr() { return roundTo500(getCity().umr2024 * getEraMultiplier(state.year)); }
function getPriceFrom2010(base2010) { return roundTo500(base2010 * get2010Multiplier(state.year)); }
function getDaysInMonth(y, m) { return new Date(y, m, 0).getDate(); }
function computeDayOfWeek(y, m, d) { return new Date(y, m - 1, d).getDay(); }

function isPlayerAtSchool() {
  if (state.player.age >= 18) return false;
  if (state.dayOfWeek === 0) return false; // Minggu libur
  if (getHolidayName(state.year, state.month, state.day)) return false; // Tanggal merah libur
  return state.hour >= 7 && state.hour < 13;
}

function isEmployeeOnDuty(emp) {
  if (!emp) return false;
  if (emp.workDays === 'mon_sat' && state.dayOfWeek === 0) return false;
  const start = Number(emp.startHour) || 8;
  const dur = Number(emp.durationHours) || 8;
  const end = start + dur;
  if (end <= 24) {
    return state.hour >= start && state.hour < end;
  }
  return state.hour >= start || state.hour < (end % 24);
}

function getSlotHourlyRate(slot) {
  if (!slot || !slot.console || !slot.tv) return 0;
  const base2010 = (slot.console.baseRate2010 || 2500) + (slot.tv.rateBonus2010 || 0) + (slot.cooling ? (slot.cooling.rateBonus2010 || 0) : 0);
  const vipMult = slot.isRoom ? 1.25 : 1.0;
  const renovMult = (RENOV_LEVELS[state.renovLevel - 1] || RENOV_LEVELS[0]).rateMult;
  return roundTo500(base2010 * vipMult * renovMult * get2010Multiplier(state.year));
}

function getUsedDiscCopies(gameId) {
  let used = 0;
  state.slots.forEach(s => {
    if (s.console && s.console.mediaType === 'disc' && s.installedGame && s.installedGame.id === gameId) used++;
  });
  return used;
}

function getAvailableDiscsForPlatform(plat) {
  return GAME_DISC_CATALOG.filter(g => g.platform === plat && (state.ownedDiscs[g.id] || 0) > 0);
}

function isSlotReadyToPlay(slot) {
  if (!slot || !slot.console || !slot.tv || !slot.controller) return { ok: false, reason: 'Belum lengkap (Wajib PS + TV + Stik)' };
  if (slot.console.cond <= 0) return { ok: false, reason: 'Konsol PS Rusak' };
  if (slot.tv.cond <= 0) return { ok: false, reason: 'TV Rusak' };
  if (slot.controller.durability <= 0) return { ok: false, reason: 'Stik Rusak (Ganti dari Kasir)' };
  const avail = getAvailableDiscsForPlatform(slot.console.platform);
  if (avail.length === 0) {
    return { ok: false, reason: `Beli minimal 1 Kaset ${slot.console.platform} di Toko!` };
  }
  return { ok: true, reason: 'Siap Dimainkan' };
}

function addLog(msg) {
  const toast = document.getElementById('liveToastBar');
  if (toast) toast.innerHTML = msg;
  const box = document.getElementById('logBox');
  if (!box) return;
  const div = document.createElement('div');
  div.className = 'log-entry';
  const hh = String(state.hour).padStart(2, '0');
  const mm = String(state.minute).padStart(2, '0');
  div.innerHTML = `<span style="color:var(--muted)">[${DAY_NAMES[state.dayOfWeek]}, ${state.day}/${state.month}/${state.year} ${hh}:${mm}]</span> ${msg}`;
  box.prepend(div);
  if (box.children.length > 80) box.removeChild(box.lastChild);
}

function getReleasedPlatforms() {
  const plats = ['PS1', 'PS2', 'PS3'];
  if (state.year >= 2013) plats.push('PS4');
  if (state.year >= 2020) plats.push('PS5');
  return plats;
}

// ==================== TEMA & MODAL ====================
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  const btn = document.getElementById('btnTheme');
  if (btn) btn.textContent = isDark ? '☀️ Terang' : '🌙 Gelap';
}
(function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light') document.body.classList.remove('dark-theme');
  else document.body.classList.add('dark-theme');
})();

function showCustomModal(title, body, footer) {
  document.getElementById('customModalTitle').innerHTML = title;
  document.getElementById('customModalBody').innerHTML = body;
  document.getElementById('customModalFooter').innerHTML = footer || `<button onclick="closeCustomModal()">Tutup</button>`;
  document.getElementById('customModalBackdrop').style.display = 'flex';
}
function closeCustomModal() { document.getElementById('customModalBackdrop').style.display = 'none'; }

// ==================== PEMBUATAN KARAKTER (MULAI 2010, MINIMAL USIA 8 TAHUN, MODAL 50 JUTA) ====================
function openCharacterCreationModal() {
  const cityOpts = INDONESIA_CITIES.map(c => `<option value="${c.id}" ${c.id === state.cityId ? 'selected' : ''}>${c.name}</option>`).join('');
  const ethOpts = ETHNICITIES.map(e => `<option value="${e.id}">${e.name} — ${e.trait}</option>`).join('');
  const relOpts = RELIGIONS_ID.map(r => `<option value="${r}">${r}</option>`).join('');

  showCustomModal(
    '🎮 Mulai Usaha Rental PS Baru (Tahun 2010 • Modal Rp 50.000.000)',
    `<div class="spec-line">Orang tuamu memberikan modal mandiri <b>Rp 50.000.000</b> di tahun <b>2010</b> untuk menyewa ruko & mengelola usaha Rental PS. Jika usiamu masih di bawah 18 tahun (minimal 8 tahun), kamu tetap berangkat sekolah tiap pagi dan mendapat uang jajan ke Dompet!</div>
     <div class="grid-2">
       <div><label class="spec-line">Nama Lengkap</label><input id="ccName" value="${state.player.name}" /></div>
       <div><label class="spec-line">Gender</label><select id="ccGender"><option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option></select></div>
     </div>
     <div class="grid-2">
       <div><label class="spec-line">Agama</label><select id="ccRel">${relOpts}</select></div>
       <div><label class="spec-line">Ras / Etnis</label><select id="ccEth">${ethOpts}</select></div>
     </div>
     <div><label class="spec-line">Kota / Wilayah Tempat Usaha</label><select id="ccCity">${cityOpts}</select></div>
     <div class="grid-3">
       <div><label class="spec-line">Tgl Lahir</label><input type="number" id="ccBDay" min="1" max="31" value="15" /></div>
       <div><label class="spec-line">Bln Lahir</label><input type="number" id="ccBMonth" min="1" max="12" value="5" /></div>
       <div><label class="spec-line">Thn Lahir (Maks 2002 / Min 8 Thn)</label><input type="number" id="ccBYear" min="1965" max="2002" value="1998" /></div>
     </div>`,
    `<button onclick="closeCustomModal()">Batal</button>
     <button class="primary" onclick="confirmCharacterCreation()">🚀 Mulai Tahun 2010 (Modal 50 Juta)</button>`
  );
}

function confirmCharacterCreation() {
  const name = (document.getElementById('ccName').value || 'Neil Aura').trim();
  const gender = document.getElementById('ccGender').value;
  const religion = document.getElementById('ccRel').value;
  const ethnicity = document.getElementById('ccEth').value;
  const cityId = document.getElementById('ccCity').value;
  const bDay = Math.max(1, Math.min(31, Number(document.getElementById('ccBDay').value) || 15));
  const bMonth = Math.max(1, Math.min(12, Number(document.getElementById('ccBMonth').value) || 5));
  const bYear = Math.max(1965, Math.min(2002, Number(document.getElementById('ccBYear').value) || 1998));

  state.cityId = cityId;
  state.year = 2010; state.month = 1; state.day = 1; state.dayOfWeek = 5;
  state.hour = 8; state.minute = 0; state.totalDays = 1;

  // Total Modal Awal 50 Juta
  state.laciCash = 5000000;
  state.handWallet = 1500000;
  state.personalBank = 42500000;
  state.businessPpobBalance = 1000000;

  state.kwh = 45.0;
  state.plnBlackout = false;
  state.cleanliness = 100;
  state.renovLevel = 1;
  state.rentalOpen = true;
  state.slots = createEmptySlots20();
  state.waitingQueue = [];
  state.warehouseConsoles = [];
  state.warehouseTvs = [];
  state.warehouseCoolings = [];
  state.cashierSticksNew = { PS1: 2, PS2: 4, PS3: 0, PS4: 0, PS5: 0 };
  state.cashierSticksServiced = { PS1: 0, PS2: 0, PS3: 0, PS4: 0, PS5: 0 };
  state.cashierSticksBroken = { PS1: 0, PS2: 0, PS3: 0, PS4: 0, PS5: 0 };
  state.cashierMemCards = { PS1: 1, PS2: 2 };
  state.ownedDiscs = { 'ps1_we2002': 1, 'ps1_ctr': 1, 'ps2_gta_sa': 1, 'ps2_we10_pes': 1, 'ps2_downhill': 1 };
  state.snackStockPcs = { 'sn_indomie_grg': 40, 'sn_teh_gelas': 24, 'sn_aqua_gelas': 48 };
  state.employees = [];
  state.parentLoan = { active: false, remainingTotal: 0, weeklyInstallment: 0, weeksLeft: 0 };
  state.bankLoan = { active: false, principal: 0, remainingTotal: 0, monthlyInstallment: 0, monthsLeft: 0, interestRatePct: 0 };
  state.ownedVehicles = [];
  state.ownedGadgets = [];

  state.player = {
    name, gender, religion, ethnicity,
    birthDay: bDay, birthMonth: bMonth, birthYear: bYear,
    age: 2010 - bYear,
    energy: 100, hunger: 95, mood: 95,
    bpjsTier: 'none', partner: null, relationship: 0, married: false, childrenList: []
  };

  seedStarterUnits();
  saveGame();
  closeCustomModal();
  addLog(`🎉 Selamat datang <b>${name}</b> (Usia ${state.player.age} thn) di tahun 2010! Modal awal <b>Rp 50.000.000</b> siap dikelola.`);
  renderAll();
}

// ==================== SIMULASI WAKTU (1 JAM = 30 DETIK -> 1 MENIT GAME = 500 MS PADA 1X) ====================
let tickAccumulatorMs = 0;
let lastFrameTime = performance.now();

function togglePause() {
  state.paused = !state.paused;
  tickAccumulatorMs = 0;
  renderHud();
}

function setSpeed(spd) {
  state.speed = Number(spd) || 1;
  state.paused = false;
  tickAccumulatorMs = 0;
  playSfx('click');
  renderHud();
}

function stepOneGameMinute() {
  state.minute++;
  if (state.minute >= 60) {
    state.minute = 0;
    state.hour++;
    onHourPassed();
  }
  if (state.hour >= 24) {
    state.hour = 0;
    onDayPassed();
  }

  // 1. Konsumsi Listrik PLN per menit dari semua unit yang menyala
  let totalWatt = 25; // Lampu ruko dasar
  state.slots.forEach(s => {
    if (s.occupied && !state.plnBlackout && state.kwh > 0) {
      totalWatt += (s.console ? s.console.watt : 0) + (s.tv ? s.tv.watt : 0) + (s.cooling ? s.cooling.watt : 0);
    } else if (s.console && s.tv && !state.plnBlackout && state.kwh > 0) {
      totalWatt += 8; // Standby TV/PS
    }
  });
  const kwhUsedThisMin = (totalWatt / 1000) / 60;
  if (state.kwh > 0) {
    state.kwh = Math.max(0, +(state.kwh - kwhUsedThisMin).toFixed(4));
    if (state.kwh <= 0) {
      state.plnBlackout = true;
      addLog('⚡ <b>TOKEN LISTRIK HABIS (0.0 kWh)!</b> Semua TV & PS mati mendadak. Segera isi Token PLN!');
    }
  }

  // 2. Proses Slot yang Sedang Dimainkan Pelanggan
  state.slots.forEach(s => {
    if (!s.occupied) return;
    if (state.plnBlackout || state.kwh <= 0) {
      // Listrik mati -> pelanggan batal & keluar
      s.occupied = false;
      s.minutesLeft = 0;
      return;
    }
    s.minutesLeft--;
    // Penurunan ketahanan stik & kebersihan
    if (s.controller && Math.random() < 0.045) {
      s.controller.durability = Math.max(0, +(s.controller.durability - 0.5).toFixed(1));
      if (s.controller.durability <= 0) {
        const plat = s.controller.platform;
        state.cashierSticksBroken[plat] = (state.cashierSticksBroken[plat] || 0) + 1;
        s.controller = null;
        s.occupied = false;
        s.minutesLeft = 0;
        addLog(`🎮 Stik ${plat} di <b>${s.name}</b> RUSAK (0%) dan dipindahkan ke stok stik rusak di Kasir!`);
        return;
      }
    }
    // Pelanggan beli jajan / minuman dari stok kasir
    if (Math.random() < 0.008) {
      tryCustomerBuySnack(s.customerName || s.name);
    }
    // Waktu sewa selesai
    if (s.minutesLeft <= 0) {
      s.occupied = false;
      s.minutesLeft = 0;
      state.cleanliness = Math.max(0, +(state.cleanliness - 0.6).toFixed(1));
    }
  });

  // 3. Karyawan yang Sedang Bertugas (Otomatis Bersih-bersih & Servis Stik Rusak)
  state.employees.forEach(emp => {
    if (!isEmployeeOnDuty(emp)) return;
    if (emp.tasks.includes('clean') && state.cleanliness < 100) {
      state.cleanliness = Math.min(100, +(state.cleanliness + 0.35).toFixed(1));
    }
    if (emp.tasks.includes('service') && Math.random() < 0.04) {
      autoEmployeeServiceStick(emp.name);
    }
  });

  // 4. Masukkan Pelanggan dari Ruang Tunggu ke Slot yang Kosong & Siap
  if (state.waitingQueue.length > 0 && !state.plnBlackout && state.kwh > 0) {
    // Cek apakah ada yang jaga kasir (Owner tidak sedang sekolah, atau ada karyawan tugas 'guard')
    const hasGuard = !isPlayerAtSchool() || state.employees.some(e => isEmployeeOnDuty(e) && e.tasks.includes('guard'));
    if (hasGuard) {
      for (let i = 0; i < state.slots.length && state.waitingQueue.length > 0; i++) {
        const sl = state.slots[i];
        if (!sl.occupied && isSlotReadyToPlay(sl).ok) {
          const guest = state.waitingQueue.shift();
          seatCustomerAtSlot(sl, guest);
        }
      }
    }
  }

  // 5. Kedatangan Pelanggan Baru (Hanya jika Rental BUKA & jam operasional 08:00 - 23:00)
  if (state.rentalOpen && state.hour >= 8 && state.hour <= 23 && !state.plnBlackout && state.kwh > 0) {
    const isHol = !!getHolidayName(state.year, state.month, state.day) || state.dayOfWeek === 0 || state.dayOfWeek === 6;
    const cleanFactor = Math.max(0.2, state.cleanliness / 100);
    const renovBonus = 1 + (state.renovLevel - 1) * 0.22;
    const spawnChance = 0.055 * (isHol ? 1.55 : 1.0) * cleanFactor * renovBonus;
    if (Math.random() < spawnChance && state.waitingQueue.length < 8) {
      spawnIncomingCustomer();
    }
  }

  // 6. Pelanggan Beli Pulsa di Konter Kasir
  if (state.rentalOpen && state.hour >= 8 && state.hour <= 22 && Math.random() < 0.015) {
    tryCustomerBuyPulsa();
  }
}

const GUEST_NAMES = ['Budi', 'Rizky', 'Fajar', 'Deni', 'Agus', 'Hendra', 'Wahyu', 'Ilham', 'Tono', 'Bayu', 'Dimas', 'Reza', 'Aldi', 'Yudi', 'Rian', 'Eko'];

function spawnIncomingCustomer() {
  const gName = GUEST_NAMES[Math.floor(Math.random() * GUEST_NAMES.length)];
  const hrs = [1, 2, 2, 3, 4][Math.floor(Math.random() * 5)];
  const guest = {
    id: 'g_' + Date.now() + '_' + Math.floor(Math.random() * 999),
    name: gName,
    hours: hrs,
    seed: Math.floor(Math.random() * 1000)
  };
  // Jika ada slot kosong dan ada penjaga kasir, langsung duduk; jika penuh, antre di Ruang Tunggu!
  const hasGuard = !isPlayerAtSchool() || state.employees.some(e => isEmployeeOnDuty(e) && e.tasks.includes('guard'));
  const readySlots = state.slots.filter(s => !s.occupied && isSlotReadyToPlay(s).ok);
  if (hasGuard && readySlots.length > 0) {
    const chosen = readySlots[Math.floor(Math.random() * readySlots.length)];
    seatCustomerAtSlot(chosen, guest);
  } else {
    state.waitingQueue.push(guest);
  }
}

function seatCustomerAtSlot(slot, guest) {
  // Pelanggan otomatis memilih sendiri game dari kaset/koleksi yang tersedia di toko!
  if (slot.console) {
    const avail = getAvailableDiscsForPlatform(slot.console.platform);
    if (avail.length > 0) {
      slot.installedGame = avail[Math.floor(Math.random() * avail.length)];
    }
  }
  const rate = getSlotHourlyRate(slot);
  const totalPay = rate * guest.hours;
  slot.occupied = true;
  slot.customerName = guest.name;
  slot.customerSeed = guest.seed;
  slot.totalMinutesBooked = guest.hours * 60;
  slot.minutesLeft = guest.hours * 60;
  slot.hourlyRate = rate;
  slot.totalBillPaid = totalPay;
  state.laciCash += totalPay;
  playSfx('cash');
  const gTitle = slot.installedGame ? slot.installedGame.title : slot.console.platform;
  addLog(`🎮 <b>${guest.name}</b> main di <b>${slot.name}</b> (${gTitle}) ${guest.hours} jam: <b style="color:var(--green)">+${fmtRp(totalPay)}</b> ke Laci.`);
}

function tryCustomerBuySnack(buyerName) {
  const availKeys = Object.keys(state.snackStockPcs).filter(k => state.snackStockPcs[k] > 0);
  if (!availKeys.length) return;
  const k = availKeys[Math.floor(Math.random() * availKeys.length)];
  const item = WHOLESALE_SNACK_CATALOG.find(x => x.id === k);
  if (!item) return;
  state.snackStockPcs[k]--;
  const price = getPriceFrom2010(item.sellPcs2010);
  state.laciCash += price;
  state.cleanliness = Math.max(0, +(state.cleanliness - 0.4).toFixed(1));
  addLog(`🍜 <b>${buyerName}</b> beli <b>${item.name}</b>: <b style="color:var(--green)">+${fmtRp(price)}</b> ke Laci.`);
}

function tryCustomerBuyPulsa() {
  const hasGuard = !isPlayerAtSchool() || state.employees.some(e => isEmployeeOnDuty(e) && e.tasks.includes('guard'));
  if (!hasGuard) return;
  const op = PPOB_OPERATORS[Math.floor(Math.random() * PPOB_OPERATORS.length)];
  const nomBase = [5000, 10000, 20000, 25000, 50000][Math.floor(Math.random() * 5)];
  const modal = nomBase;
  const margin = getPriceFrom2010(1500);
  if (state.businessPpobBalance < modal) return;
  state.businessPpobBalance -= modal;
  state.laciCash += (modal + margin);
  addLog(`📱 Pelanggan beli Pulsa <b>${op.name} ${ nomBase.toLocaleString('id-ID') }</b>: Laba <b style="color:var(--green)">+${fmtRp(margin)}</b> (Total ${fmtRp(modal + margin)} ke Laci).`);
}

function autoEmployeeServiceStick(empName) {
  const plats = Object.keys(state.cashierSticksBroken).filter(p => state.cashierSticksBroken[p] > 0);
  if (!plats.length) return;
  const p = plats[0];
  state.cashierSticksBroken[p]--;
  state.cashierSticksServiced[p] = (state.cashierSticksServiced[p] || 0) + 1;
  addLog(`🔧 Karyawan <b>${empName}</b> selesai menyervis 1 Stik ${p} (Masuk ke Stok Stik Servis di Kasir, ketahanan 65%).`);
  // Otomatis pasang ke slot yang kehilangan stik jika cocok
  const needSlot = state.slots.find(s => s.console && s.console.platform === p && !s.controller);
  if (needSlot && state.cashierSticksServiced[p] > 0) {
    state.cashierSticksServiced[p]--;
    needSlot.controller = { platform: p, quality: 'serviced', durability: 65, maxDurability: 65 };
    addLog(`🎮 <b>${empName}</b> otomatis memasang Stik ${p} hasil servis ke <b>${needSlot.name}</b>.`);
  }
}

function onHourPassed() {
  // Jam 07:00 pagi (Senin-Sabtu, usia < 18, bukan hari libur): Berangkat sekolah & dapat uang jajan orang tua!
  if (state.hour === 7 && isPlayerAtSchool()) {
    const pocketMoney = getPriceFrom2010(15000);
    state.handWallet += pocketMoney;
    addLog(`🎒 Kamu berangkat sekolah (07:00–13:00). Orang tua memberi uang jajan <b style="color:var(--green)">+${fmtRp(pocketMoney)}</b> ke Dompet!`);
  }
  if (state.hour === 13 && state.player.age < 18 && state.dayOfWeek !== 0 && !getHolidayName(state.year, state.month, state.day)) {
    addLog(`🏠 Kamu pulang sekolah dan kembali menjaga Rental PS.`);
  }
}

function onDayPassed() {
  state.totalDays++;
  state.day++;
  const maxD = getDaysInMonth(state.year, state.month);
  if (state.day > maxD) {
    state.day = 1;
    state.month++;
    onMonthPassed();
  }
  if (state.month > 12) {
    state.month = 1;
    state.year++;
    addLog(`🎆 <b>SELAMAT TAHUN BARU ${state.year}!</b> Kurs USD kini Rp ${getUsdRate(state.year).toLocaleString('id-ID')}/USD.`);
  }
  state.dayOfWeek = computeDayOfWeek(state.year, state.month, state.day);

  // Cek Ulang Tahun Karakter Utama & Anak
  if (state.day === state.player.birthDay && state.month === state.player.birthMonth) {
    state.player.age++;
    addLog(`🎂 <b>Selamat Ulang Tahun!</b> Usiamu kini <b>${state.player.age} tahun</b>.`);
  }
  (state.player.childrenList || []).forEach(ch => {
    if (state.day === (ch.birthDay || 1) && state.month === (ch.birthMonth || 1)) {
      ch.age++;
      addLog(`🎈 Anakmu <b>${ch.name}</b> berulang tahun ke-<b>${ch.age}</b>!`);
    }
  });

  // Cek Hari Libur Nasional
  const hol = getHolidayName(state.year, state.month, state.day);
  if (hol) {
    addLog(`🇮🇩 <b>HARI LIBUR NASIONAL: ${hol}!</b> Sekolah libur & pelanggan rental PS membludak!`);
  }

  // Biaya makan harian dari Dompet
  const mealCost = getPriceFrom2010(18000);
  if (state.handWallet >= mealCost) state.handWallet -= mealCost;
  else if (state.laciCash >= mealCost) state.laciCash -= mealCost;

  // Pendapatan harian mobil usaha Travel / Pick Up Kargo jika punya
  state.ownedVehicles.forEach(v => {
    if (v.commercialDaily2010 > 0 && v.fuelLiters >= 4) {
      v.fuelLiters = Math.max(0, +(v.fuelLiters - 4).toFixed(1));
      const profit = getPriceFrom2010(v.commercialDaily2010);
      state.personalBank += profit;
      addLog(`🚚 Setoran usaha angkutan/travel <b>${v.name}</b>: <b style="color:var(--green)">+${fmtRp(profit)}</b> ke Bank.`);
    }
  });

  // Pembayaran Gaji Karyawan Harian & Mingguan
  state.employees.forEach(emp => {
    if (emp.payPeriod === 'daily') payEmployeeSalary(emp, 'Harian');
    else if (emp.payPeriod === 'weekly' && state.totalDays % 7 === 0) payEmployeeSalary(emp, 'Mingguan');
  });

  // Cicilan Pinjaman Orang Tua (Per Minggu / tiap 7 hari, 52x cicilan, 0% bunga)
  if (state.parentLoan.active && state.totalDays % 7 === 0) {
    const pay = Math.min(state.parentLoan.remainingTotal, state.parentLoan.weeklyInstallment);
    if (deductFromAnyCash(pay)) {
      state.parentLoan.remainingTotal -= pay;
      state.parentLoan.weeksLeft = Math.max(0, state.parentLoan.weeksLeft - 1);
      addLog(`👨‍👩‍👦 Bayar cicilan mingguan ke Orang Tua (0% bunga): <b>-${fmtRp(pay)}</b> (Sisa ${state.parentLoan.weeksLeft}x / ${fmtRp(state.parentLoan.remainingTotal)}).`);
      if (state.parentLoan.remainingTotal <= 0 || state.parentLoan.weeksLeft <= 0) {
        state.parentLoan.active = false;
        addLog(`✅ <b>LUNAS!</b> Pinjaman ke Orang Tua sudah lunas sepenuhnya!`);
      }
    } else {
      addLog(`⚠️ Uang tidak cukup untuk bayar cicilan mingguan ke Orang Tua (${fmtRp(pay)})!`);
    }
  }

  saveGame();
}

function onMonthPassed() {
  // 1. Bayar Sewa Ruko Tempat Usaha per bulan
  const rentCost = getPriceFrom2010(1200000);
  if (deductFromAnyCash(rentCost)) {
    addLog(`🏢 Bayar sewa ruko Rental PS bulanan: <b>-${fmtRp(rentCost)}</b>.`);
  } else {
    addLog(`⚠️ Saldo kurang untuk bayar sewa ruko bulanan (${fmtRp(rentCost)})!`);
  }

  // 2. Gaji Karyawan Bulanan + BPJS + Insentif
  state.employees.forEach(emp => {
    if (emp.payPeriod === 'monthly') payEmployeeSalary(emp, 'Bulanan');
  });

  // 3. Cicilan Pinjaman Bank Bulanan
  if (state.bankLoan.active) {
    const pay = Math.min(state.bankLoan.remainingTotal, state.bankLoan.monthlyInstallment);
    if (deductFromAnyCash(pay)) {
      state.bankLoan.remainingTotal -= pay;
      state.bankLoan.monthsLeft = Math.max(0, state.bankLoan.monthsLeft - 1);
      addLog(`🏦 Bayar cicilan Kredit Bank: <b>-${fmtRp(pay)}</b> (Sisa ${state.bankLoan.monthsLeft} bln).`);
      if (state.bankLoan.remainingTotal <= 0 || state.bankLoan.monthsLeft <= 0) {
        state.bankLoan.active = false;
        addLog(`✅ <b>LUNAS!</b> Pinjaman Kredit Bank telah lunas!`);
      }
    }
  }
}

function deductFromAnyCash(amount) {
  if (state.laciCash >= amount) { state.laciCash -= amount; return true; }
  if (state.personalBank >= amount) { state.personalBank -= amount; return true; }
  if (state.handWallet >= amount) { state.handWallet -= amount; return true; }
  return false;
}

function payEmployeeSalary(emp, label) {
  const bpjsCost = emp.hasBpjs ? getPriceFrom2010(55000) : 0;
  const total = Number(emp.salaryAmount || 0) + Number(emp.incentive || 0) + (label === 'Bulanan' ? bpjsCost : 0);
  if (deductFromAnyCash(total)) {
    addLog(`👷 Bayar gaji ${label} <b>${emp.name}</b> (Pokok + Insentif${emp.hasBpjs ? ' + BPJS' : ''}): <b>-${fmtRp(total)}</b>.`);
  } else {
    addLog(`⚠️ Gagal bayar gaji <b>${emp.name}</b> (${fmtRp(total)}) karena kas habis!`);
  }
}

// ==================== LOOP UTAMA ====================
function mainLoop(now) {
  const dt = Math.min(250, Math.max(0, now - lastFrameTime));
  lastFrameTime = now;
  if (!state.paused) {
    const spd = Number(state.speed) || 1;
    // 1x = 125ms/menit (4x lama), 2x = 62.5ms/menit (8x lama), 4x = 31.25ms/menit, 8x = 15.6ms/menit
    const msPerGameMin = 125 / spd;
    tickAccumulatorMs += dt;
    let steps = 0;
    while (tickAccumulatorMs >= msPerGameMin && steps < 30) {
      tickAccumulatorMs -= msPerGameMin;
      stepOneGameMinute();
      steps++;
    }
    if (steps > 0) {
      renderHud();
      if (typeof window.renderRoomBoard === 'function') window.renderRoomBoard(false);
    }
  }
  requestAnimationFrame(mainLoop);
}

// ==================== RENDER HUD & WORKSPACE ====================
function renderHud() {
  const hh = String(state.hour).padStart(2, '0');
  const mm = String(state.minute).padStart(2, '0');
  const hol = getHolidayName(state.year, state.month, state.day);
  const schoolBadge = isPlayerAtSchool() ? ' • 🎒 Sekolah' : '';
  const holBadge = hol ? ` • 🔴 ${hol}` : '';
  document.getElementById('hudDateTime').textContent = `${DAY_NAMES[state.dayOfWeek]}, ${state.day}/${state.month}/${state.year} • ${hh}:${mm}${schoolBadge}${holBadge}`;
  document.getElementById('hudCityUmr').textContent = `${getCity().name} • $1 = Rp ${getUsdRate(state.year).toLocaleString('id-ID')}`;
  const pBadge = document.getElementById('hudPlayerBadge');
  if (pBadge) pBadge.textContent = `${state.player.name} (${state.player.age} Thn)`;
  document.getElementById('hudLaci').textContent = fmtRp(state.laciCash);
  document.getElementById('hudHand').textContent = fmtRp(state.handWallet);
  document.getElementById('hudBank').textContent = fmtRp(state.personalBank);
  document.getElementById('hudPpob').textContent = fmtRp(state.businessPpobBalance);
  document.getElementById('hudKwh').textContent = `${state.kwh.toFixed(1)} kWh`;
  document.getElementById('hudClean').textContent = `${Math.round(state.cleanliness)}%`;
  const qCount = document.getElementById('lblQueueCount');
  if (qCount) qCount.textContent = state.waitingQueue.length;
  const btnOpen = document.getElementById('btnToggleOpen');
  if (btnOpen) {
    btnOpen.className = state.rentalOpen ? 'success' : 'danger';
    btnOpen.textContent = state.rentalOpen ? '🟢 BUKA' : '🔴 TUTUP';
  }

  const btnPause = document.getElementById('btnPause');
  if (btnPause) {
    btnPause.classList.toggle('active', state.paused);
    btnPause.classList.toggle('paused', state.paused);
    btnPause.textContent = state.paused ? '▶️' : '⏸️';
  }
  const curSpd = Number(state.speed) || 1;
  document.querySelectorAll('.speed-btn[data-speed]').forEach(b => {
    b.classList.toggle('active', !state.paused && Number(b.dataset.speed) === curSpd);
  });
}

function renderCenterWorkspace() {
  if (typeof window.renderRoomBoard === 'function') window.renderRoomBoard(true);
}

function toggleRentalOpenStatus() {
  state.rentalOpen = !state.rentalOpen;
  if (!state.rentalOpen) {
    state.waitingQueue = [];
    addLog('🔴 <b>Rental PS DITUTUP untuk pelanggan baru.</b> Pelanggan yang masih bermain dibiarkan sampai waktu billing-nya habis.');
  } else {
    addLog('🟢 <b>Rental PS DIBUKA!</b> Siap menerima pelanggan baru.');
  }
  renderCenterAndRight();
}

function manualCleanShop() {
  state.cleanliness = 100;
  addLog('🧹 Kamu menyapu & mengepel seluruh ruangan rental PS. Kebersihan kembali <b>100%</b>!');
  renderHud();
  renderCenterWorkspace();
}

// ==================== TAB NAVIGASI PANEL KANAN ====================
const DRAWER_TITLES = {
  slots: '🎮 20 Slot & Room Rental PS (10 Luar + 10 Room VIP)',
  store_hw: '🛒 Toko Konsol PS, TV, Pendingin & Renovasi',
  discs: '💿 Katalog Kaset Game Original (Sesuai Tahun)',
  cashier_stik: '🔧 Meja Kasir: Stok Stik Cadangan, Servis & Gudang',
  agen_ppob: '📦 Agen Grosir Makanan (Per Dus) & Konter Pulsa',
  employees: '👷 Manajemen Karyawan, Jadwal & Tugas',
  finance: '🏦 Token Listrik PLN, Pinjaman Orang Tua & Bank',
  automotive: '🛵 Dealer Motor, Mobil (Travel/Kargo) & Gadget',
  life: '🧬 Kehidupan, Sekolah, Keluarga & Warisan Anak',
  logs: '📜 Riwayat Catatan Aktivitas Rental & Kehidupan'
};

function openDrawerTab(tabId) {
  playSfx('click');
  state.mainTab = tabId;
  document.querySelectorAll('.dock-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabId);
  });
  const titleEl = document.getElementById('drawerTitle');
  if (titleEl) titleEl.textContent = DRAWER_TITLES[tabId] || '📱 Menu Manajemen';
  const backdrop = document.getElementById('appDrawerBackdrop');
  if (backdrop) backdrop.classList.add('open');
  renderRightPanel();
}

function closeDrawer() {
  const backdrop = document.getElementById('appDrawerBackdrop');
  if (backdrop) backdrop.classList.remove('open');
  document.querySelectorAll('.dock-btn').forEach(b => b.classList.remove('active'));
}

function switchMainTab(tabId) {
  openDrawerTab(tabId);
}

function renderCenterAndRight() {
  renderCenterWorkspace();
  renderRightPanel();
}

function renderAll() {
  renderHud();
  renderCenterAndRight();
}

function renderRightPanel() {
  const box = document.getElementById('rightPanelContent');
  if (!box) return;

  if (state.mainTab === 'slots') {
    const filtered = state.slots.filter(s =>
      state.slotSubFilter === 'all' ? true : state.slotSubFilter === 'outdoor' ? !s.isRoom : s.isRoom
    );
    box.innerHTML = `
      <div class="sub-tabs">
        <button class="sub-btn ${state.slotSubFilter === 'all' ? 'active' : ''}" onclick="state.slotSubFilter='all';renderRightPanel()">Semua (20)</button>
        <button class="sub-btn ${state.slotSubFilter === 'outdoor' ? 'active' : ''}" onclick="state.slotSubFilter='outdoor';renderRightPanel()">10 Unit Luar Sejejer</button>
        <button class="sub-btn ${state.slotSubFilter === 'vip' ? 'active' : ''}" onclick="state.slotSubFilter='vip';renderRightPanel()">10 Room VIP Tertutup</button>
      </div>
      ${filtered.map(s => {
        const st = isSlotReadyToPlay(s);
        return `<div class="item-row" style="flex-direction:column;align-items:stretch;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <b>${s.name}</b>
            <span class="badge ${s.occupied ? 'busy' : st.ok ? 'ok' : 'warn'}">${s.occupied ? `Main: ${s.customerName} (${s.minutesLeft} mnt)` : st.reason}</span>
          </div>
          <div class="spec-line">
            • Konsol: <b>${s.console ? s.console.name : 'Belum dipasang'}</b><br>
            • TV: <b>${s.tv ? s.tv.name : 'Belum dipasang'}</b> | Pendingin: <b>${s.cooling ? s.cooling.name : 'Belum ada'}</b><br>
            • Stik: <b>${s.controller ? `${s.controller.platform} (${s.controller.quality === 'new' ? 'Baru' : 'Servis'} • ${s.controller.durability}%)` : 'Belum dipasang'}</b> | MemCard: <b>${s.memCard ? s.memCard.name : '-'}</b><br>
            • Game Terpasang: <b>${s.console && s.console.mediaType === 'digital' ? `${s.digitalGames.length} Game Digital` : (s.installedGame ? s.installedGame.title : 'Belum ada kaset')}</b>
          </div>
          <div style="display:flex;gap:5px;margin-top:4px;">
            <button class="primary" style="flex:1" onclick="openSlotConfigModal(${s.id})">🔧 Pasang / Lepas Perangkat & Kaset</button>
          </div>
        </div>`;
      }).join('')}
    `;
    return;
  }

  if (state.mainTab === 'logs') {
    const logBox = document.getElementById('logBox');
    box.innerHTML = `<div class="spec-line">Catatan kejadian terbaru di usaha Rental PS & kehidupanmu:</div>` +
      (logBox ? logBox.innerHTML : '<div class="spec-line">Belum ada catatan.</div>');
    return;
  }

  if (state.mainTab === 'store_hw') {
    const nextRenov = RENOV_LEVELS[state.renovLevel];
    const availPlats = getReleasedPlatforms();
    if (!availPlats.includes(state.hwConsolePlatFilter)) state.hwConsolePlatFilter = availPlats[0];
    let itemsHtml = '';
    if (state.hwCategoryFilter === 'console') {
      itemsHtml = `<div class="sub-tabs" style="margin-bottom:4px;">` +
        availPlats.map(p => `<button class="sub-btn ${state.hwConsolePlatFilter === p ? 'active' : ''}" onclick="state.hwConsolePlatFilter='${p}';renderRightPanel()">${p}</button>`).join('') +
        `</div>` +
        CONSOLE_CATALOG.filter(c => c.releaseYear <= state.year && c.platform === state.hwConsolePlatFilter).map(c => {
          const price = getPriceFrom2010(c.basePrice2010);
          return `<div class="item-row">
            <img class="prod-thumb" src="${c.img}" alt="${c.name}" />
            <div style="flex:1">
              <b>${c.name}</b> <span class="badge">${c.mediaType === 'disc' ? '💿 Kaset Fisik' : `💾 Digital ${c.storageGb}GB`}</span>
              <div class="spec-line">Rilis: ${c.releaseYear} • Daya: ${c.watt}W • Tarif dasar: ${fmtRp(getPriceFrom2010(c.baseRate2010))}/jam</div>
              <div style="color:var(--green);font-weight:700;">${fmtRp(price)}</div>
            </div>
            <button class="primary" onclick="buyHardwareItem('console','${c.id}')">Beli</button>
          </div>`;
        }).join('');
    } else if (state.hwCategoryFilter === 'tv') {
      itemsHtml = TV_CATALOG.filter(t => t.releaseYear <= state.year).map(t => {
        const price = getPriceFrom2010(t.basePrice2010);
        return `<div class="item-row">
          <img class="prod-thumb" src="${t.img}" alt="${t.name}" />
          <div style="flex:1">
            <b>${t.name}</b>
            <div class="spec-line">Rilis: ${t.releaseYear} • Daya: ${t.watt}W • Bonus kenyamanan +${t.comfortBonus}</div>
            <div style="color:var(--green);font-weight:700;">${fmtRp(price)}</div>
          </div>
          <button class="primary" onclick="buyHardwareItem('tv','${t.id}')">Beli</button>
        </div>`;
      }).join('');
    } else if (state.hwCategoryFilter === 'cooling') {
      itemsHtml = COOLING_CATALOG.filter(cl => cl.releaseYear <= state.year).map(cl => {
        const price = getPriceFrom2010(cl.basePrice2010);
        return `<div class="item-row">
          <img class="prod-thumb" src="${cl.img}" alt="${cl.name}" />
          <div style="flex:1">
            <b>${cl.name}</b>
            <div class="spec-line">Rilis: ${cl.releaseYear} • Daya: ${cl.watt}W • Bonus sejuk +${cl.comfortBonus}</div>
            <div style="color:var(--green);font-weight:700;">${fmtRp(price)}</div>
          </div>
          <button class="primary" onclick="buyHardwareItem('cooling','${cl.id}')">Beli</button>
        </div>`;
      }).join('');
    } else {
      itemsHtml = ACCESSORY_CATALOG.filter(ac => ac.releaseYear <= state.year).map(ac => {
        const price = getPriceFrom2010(ac.basePrice2010);
        return `<div class="item-row">
          <img class="prod-thumb" src="${ac.img}" alt="${ac.name}" />
          <div style="flex:1">
            <b>${ac.name}</b>
            <div class="spec-line">Masuk ke Stok Cadangan Kasir (${ac.platform})</div>
            <div style="color:var(--green);font-weight:700;">${fmtRp(price)}</div>
          </div>
          <button class="primary" onclick="buyHardwareItem('acc','${ac.id}')">Beli ke Kasir</button>
        </div>`;
      }).join('');
    }

    box.innerHTML = `
      <div class="item-row" style="background:var(--panel-3);">
        <div>
          <b>🧱 Renovasi Ruangan & Room VIP (Saat ini: Level ${state.renovLevel})</b>
          <div class="spec-line">${nextRenov ? `Upgrade ke ${nextRenov.name} (Tarif sewa x${nextRenov.rateMult})` : 'Sudah Level Maksimal (Sultan Esports Arena)'}</div>
        </div>
        ${nextRenov ? `<button class="amber" onclick="upgradeRenovation()">Renov (${fmtRp(getPriceFrom2010(nextRenov.baseCost2010))})</button>` : '<span class="badge ok">MAX</span>'}
      </div>
      <div class="sub-tabs">
        <button class="sub-btn ${state.hwCategoryFilter === 'console' ? 'active' : ''}" onclick="state.hwCategoryFilter='console';renderRightPanel()">🎮 Konsol PS (Thn ${state.year})</button>
        <button class="sub-btn ${state.hwCategoryFilter === 'tv' ? 'active' : ''}" onclick="state.hwCategoryFilter='tv';renderRightPanel()">📺 TV</button>
        <button class="sub-btn ${state.hwCategoryFilter === 'cooling' ? 'active' : ''}" onclick="state.hwCategoryFilter='cooling';renderRightPanel()">❄️ Kipas & AC</button>
        <button class="sub-btn ${state.hwCategoryFilter === 'acc' ? 'active' : ''}" onclick="state.hwCategoryFilter='acc';renderRightPanel()">🕹️ Stik & MemCard</button>
      </div>
      ${itemsHtml}
    `;
    return;
  }

  if (state.mainTab === 'discs') {
    const availPlats = getReleasedPlatforms();
    if (!availPlats.includes(state.discPlatformFilter)) state.discPlatformFilter = availPlats[availPlats.length - 1];
    const q = (state.discSearchQuery || '').toLowerCase();
    const list = GAME_DISC_CATALOG.filter(g =>
      g.platform === state.discPlatformFilter &&
      g.releaseYear <= state.year &&
      (!q || g.title.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q))
    );
    box.innerHTML = `
      <div class="sub-tabs">
        ${availPlats.map(p => `<button class="sub-btn ${state.discPlatformFilter === p ? 'active' : ''}" onclick="state.discPlatformFilter='${p}';renderRightPanel()">💿 ${p} (${GAME_DISC_CATALOG.filter(x => x.platform === p && x.releaseYear <= state.year).length})</button>`).join('')}
      </div>
      <input placeholder="🔍 Cari judul game original yang tersedia di tahun ${state.year}..." value="${state.discSearchQuery}" oninput="state.discSearchQuery=this.value;renderRightPanel()" />
      <div class="spec-line">Aturan Realistis: 1 PS Kaset Fisik membutuhkan 1 Kaset Original yang bebas. Hanya menampilkan game yang sudah rilis s/d tahun ${state.year}.</div>
      ${list.map(g => {
        const owned = state.ownedDiscs[g.id] || 0;
        const used = getUsedDiscCopies(g.id);
        const price = getPriceFrom2010(g.basePrice2010);
        return `<div class="item-row">
          <img class="disc-thumb" src="${g.cover}" alt="${g.title}" />
          <div style="flex:1">
            <b>${g.title}</b> <span class="badge">${g.code}</span>
            <div class="spec-line">${g.genre} • Hype: 🔥${g.hype} • Rilis ${g.releaseYear} • Punya: <b>${owned} kaset</b> (Terpakai: ${used})</div>
            <div style="color:var(--green);font-weight:700;">${fmtRp(price)} / kaset</div>
          </div>
          <button class="primary" onclick="buyGameDisc('${g.id}')">+ Beli Kaset</button>
        </div>`;
      }).join('')}
    `;
    return;
  }

  if (state.mainTab === 'cashier_stik') {
    const availPlats = getReleasedPlatforms();
    box.innerHTML = `
      <div class="card" style="padding:8px;">
        <b>🕹️ Stok Stik Cadangan & Servis di Meja Kasir</b>
        <div class="spec-line">Stik Baru tahan <b>100%</b>, sedangkan Stik Hasil Servis tahan <b>65%</b>. Stik rusak yang dicabut dari PS masuk ke sini untuk kamu servis sendiri atau diservis karyawan.</div>
        ${availPlats.map(p => `
          <div class="item-row">
            <div>
              <b>Stik ${p}</b>
              <div class="spec-line">Baru (100%): <b>${state.cashierSticksNew[p] || 0}</b> • Hasil Servis (65%): <b>${state.cashierSticksServiced[p] || 0}</b> • Rusak: <b style="color:var(--red)">${state.cashierSticksBroken[p] || 0}</b></div>
            </div>
            <button class="amber" ${(state.cashierSticksBroken[p] || 0) <= 0 ? 'disabled' : ''} onclick="manualServiceStick('${p}')">🔧 Servis Sendiri (1)</button>
          </div>
        `).join('')}
      </div>
      <div class="card" style="padding:8px;">
        <b>📦 Gudang Perangkat Belum Dipasang / Dilepas (${state.warehouseConsoles.length} PS, ${state.warehouseTvs.length} TV, ${state.warehouseCoolings.length} Kipas/AC)</b>
        <div class="spec-line">Tap unit/slot langsung di layar 3D atau buka tab 20 Slot untuk memasang perangkat dari gudang ini.</div>
        ${state.warehouseConsoles.map((c, i) => {
          const sellPrice = Math.round(getPriceFrom2010(c.basePrice2010) * 0.65 * ((c.cond || 100) / 100));
          return `<div class="item-row"><span>🎮 ${c.name} (${c.cond}%)</span><button class="amber" onclick="sellSecondhandHardware('console',${i})">Jual ${fmtRp(sellPrice)}</button></div>`;
        }).join('')}
        ${state.warehouseTvs.map((t, i) => {
          const sellPrice = Math.round(getPriceFrom2010(t.basePrice2010) * 0.65 * ((t.cond || 100) / 100));
          return `<div class="item-row"><span>📺 ${t.name} (${t.cond}%)</span><button class="amber" onclick="sellSecondhandHardware('tv',${i})">Jual ${fmtRp(sellPrice)}</button></div>`;
        }).join('')}
        ${state.warehouseCoolings.map((cl, i) => {
          const sellPrice = Math.round(getPriceFrom2010(cl.basePrice2010) * 0.65);
          return `<div class="item-row"><span>❄️ ${cl.name}</span><button class="amber" onclick="sellSecondhandHardware('cooling',${i})">Jual ${fmtRp(sellPrice)}</button></div>`;
        }).join('')}
      </div>
    `;
    return;
  }

  if (state.mainTab === 'agen_ppob') {
    box.innerHTML = `
      <div class="card" style="padding:8px;">
        <b>📱 Konter Pulsa All Operator Indonesia (Saldo PPOB: ${fmtRp(state.businessPpobBalance)})</b>
        <div class="spec-line">Operator aktif: ${PPOB_OPERATORS.map(o => o.name).join(', ')}. Pelanggan otomatis membeli pulsa selama saldo mencukupi!</div>
        <div style="display:flex;gap:6px;margin-top:4px;">
          <button class="primary" onclick="topUpPpobBalance(500000)">+ Isi Saldo Pulsa ${fmtRp(500000)}</button>
          <button class="primary" onclick="topUpPpobBalance(2000000)">+ Isi Saldo ${fmtRp(2000000)}</button>
        </div>
      </div>
      <div class="card" style="padding:8px;">
        <b>📦 Agen Grosir Makanan & Minuman (Beli Per Dus Produk Asli Indonesia)</b>
        <div class="spec-line">Beli per dus harga agen, dijual eceran per pcs ke pelanggan yang sedang main atau antre di ruang tunggu!</div>
        ${WHOLESALE_SNACK_CATALOG.map(sn => {
          const boxPrice = getPriceFrom2010(sn.boxPrice2010);
          const sellPcs = getPriceFrom2010(sn.sellPcs2010);
          const stock = state.snackStockPcs[sn.id] || 0;
          return `<div class="item-row">
            <img class="prod-thumb" src="${sn.img}" alt="${sn.name}" />
            <div style="flex:1">
              <b>${sn.name}</b> <span class="badge">Stok: ${stock} pcs</span>
              <div class="spec-line">1 Dus isi ${sn.pcsPerBox} pcs • Harga Jual Ecer: ${fmtRp(sellPcs)}/pcs</div>
              <div style="color:var(--green);font-weight:700;">Harga Agen: ${fmtRp(boxPrice)} / Dus</div>
            </div>
            <button class="primary" onclick="buyWholesaleSnackBox('${sn.id}')">+ Beli 1 Dus</button>
          </div>`;
        }).join('')}
      </div>
    `;
    return;
  }

  if (state.mainTab === 'employees') {
    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <b>👷 Daftar Karyawan Rental PS (${state.employees.length} orang)</b>
        <button class="primary" onclick="openHireEmployeeModal()">+ Rekrut Karyawan Baru</button>
      </div>
      <div class="spec-line">Atur gaji (harian/mingguan/bulanan), BPJS, insentif, hari masuk, jam masuk, durasi kerja, serta tugas (Jaga Kasir, Bersih-bersih, Servis Stik).</div>
      ${state.employees.length === 0 ? `<div class="item-row">Belum ada karyawan. Klik + Rekrut Karyawan Baru di atas.</div>` : ''}
      ${state.employees.map((emp, idx) => {
        const onDuty = isEmployeeOnDuty(emp);
        return `<div class="item-row" style="flex-direction:column;align-items:stretch;">
          <div style="display:flex;justify-content:space-between;">
            <b>${emp.name}</b>
            <span class="badge ${onDuty ? 'ok' : 'warn'}">${onDuty ? '🟢 Sedang Bekerja' : '⚪ Di Luar Jam Kerja'}</span>
          </div>
          <div class="spec-line">
            • Jadwal: <b>${emp.workDays === 'every_day' ? 'Setiap Hari' : 'Senin–Sabtu'}</b> • Jam Masuk: <b>${String(emp.startHour).padStart(2, '0')}:00</b> (${emp.durationHours} jam/hari)<br>
            • Gaji (${emp.payPeriod}): <b>${fmtRp(emp.salaryAmount)}</b> + Insentif: <b>${fmtRp(emp.incentive)}</b> • BPJS: <b>${emp.hasBpjs ? 'Ya' : 'Tidak'}</b><br>
            • Tugas: <b>${emp.tasks.join(', ').toUpperCase()}</b>
          </div>
          <button class="danger" onclick="fireEmployee(${idx})">Pecat Karyawan</button>
        </div>`;
      }).join('')}
    `;
    return;
  }

  if (state.mainTab === 'finance') {
    const bRate = getBankInterestRate(state.year);
    const canBank = state.player.age >= 21;
    box.innerHTML = `
      <div class="card" style="padding:8px;">
        <b>⚡ Beli Token Listrik PLN Prabayar (Sisa: ${state.kwh.toFixed(2)} kWh)</b>
        <div class="spec-line">Tarif dasar listrik tahun ${state.year} + PPJ 4% (Sesuai dunia nyata: 20rb di 2010 dapat ~23.5 kWh, di 2024 dapat ~13.29 kWh).</div>
        <div class="grid-2">
          ${PLN_TOKEN_NOMINALS.map(nom => {
            const info = calcPlnToken(nom, state.year);
            return `<button onclick="buyPlnToken(${nom})">⚡ Token ${nom.toLocaleString('id-ID')}<br><small style="color:var(--green)">+${info.kwhReceived} kWh</small></button>`;
          }).join('')}
        </div>
      </div>

      <div class="card" style="padding:8px;">
        <b>👨‍👩‍👦 Pinjaman Orang Tua (Maks Rp 50.000.000 • 52x Cicilan Mingguan • Bunga 0%)</b>
        <div class="spec-line">Tersedia sebelum maupun sesudah usia 21 tahun. Tanpa bunga, dicicil 52 minggu (1 tahun).</div>
        ${state.parentLoan.active
          ? `<div class="spec-line">Sisa Pinjaman: <b>${fmtRp(state.parentLoan.remainingTotal)}</b> (${state.parentLoan.weeksLeft} minggu lagi @ ${fmtRp(state.parentLoan.weeklyInstallment)}/mgg)</div>`
          : `<div style="display:flex;gap:6px;"><button class="primary" onclick="takeParentLoan(20000000)">Pinjam 20 Juta</button><button class="primary" onclick="takeParentLoan(50000000)">Pinjam Maks 50 Juta</button></div>`}
      </div>

      <div class="card" style="padding:8px;">
        <b>🏦 Kredit Usaha Bank (Wajib Usia Minimal 21 Tahun • Bunga Tahun ${state.year}: ${bRate}%/thn)</b>
        <div class="spec-line">Usiamu saat ini: <b>${state.player.age} tahun</b>. ${canBank ? 'Kamu sudah memenuhi syarat usia 21+.' : 'Belum berusia 21 tahun (Gunakan Pinjaman Orang Tua dulu).'}</div>
        ${state.bankLoan.active
          ? `<div class="spec-line">Sisa Kredit Bank: <b>${fmtRp(state.bankLoan.remainingTotal)}</b> (${state.bankLoan.monthsLeft} bln @ ${fmtRp(state.bankLoan.monthlyInstallment)}/bln)</div>`
          : `<div style="display:flex;gap:6px;">
               <button class="primary" ${!canBank ? 'disabled' : ''} onclick="takeBankLoan(50000000)">Kredit 50 Juta (12 Bln)</button>
               <button class="primary" ${!canBank ? 'disabled' : ''} onclick="takeBankLoan(150000000)">Kredit 150 Juta (24 Bln)</button>
             </div>`}
      </div>
    `;
    return;
  }

  if (state.mainTab === 'automotive') {
    const bbmPrice = getBbmPricePerLiter(state.year);
    box.innerHTML = `
      <div class="card" style="padding:8px;">
        <b>⛽ Kendaraan & Gadget Milikmu (Harga Bensin Tahun ${state.year}: ${fmtRp(bbmPrice)}/Liter)</b>
        ${state.ownedVehicles.length === 0 ? `<div class="spec-line">Belum punya motor/mobil.</div>` : ''}
        ${state.ownedVehicles.map((v, idx) => `
          <div class="item-row">
            <div>
              <b>${v.name}</b> <span class="badge">BBM: ${v.fuelLiters.toFixed(1)}/${v.tankCap}L</span>
              <div class="spec-line">${v.commercialDaily2010 > 0 ? '🚚 Aktif menghasilkan uang travel/angkutan tiap hari selama bensin terisi!' : '🛵 Bisa dipakai jalan-jalan keliling kota'}</div>
            </div>
            <div style="display:flex;gap:4px;">
              <button onclick="refuelVehicle(${idx})">⛽ Isi Full</button>
              <button class="primary" onclick="rideVehicleTrip(${idx})">🛣️ Jalan</button>
            </div>
          </div>
        `).join('')}
      </div>
      <b>🛵 Pilihan Motor & 🚗 Mobil (Keluaran s/d Tahun ${state.year}) + 📱 HP/Laptop</b>
      ${VEHICLE_CATALOG.filter(v => v.yearStart <= state.year).map(v => {
        const price = getPriceFrom2010(v.price2010);
        return `<div class="item-row">
          <img class="prod-thumb" src="${v.img}" alt="${v.name}" />
          <div style="flex:1">
            <b>${v.name}</b> <span class="badge">${v.category}</span>
            <div class="spec-line">Rilis: ${v.yearStart} • Tangki: ${v.tankCap}L ${v.commercialDaily2010 > 0 ? `• Hasil Usaha: +${fmtRp(getPriceFrom2010(v.commercialDaily2010))}/hari` : ''}</div>
            <div style="color:var(--green);font-weight:700;">${fmtRp(price)}</div>
          </div>
          <button class="primary" onclick="buyVehicle('${v.id}')">Beli</button>
        </div>`;
      }).join('')}
      ${GADGET_CATALOG.filter(g => g.yearStart <= state.year).map(g => {
        const price = getPriceFrom2010(g.price2010);
        return `<div class="item-row">
          <img class="prod-thumb" src="${g.img}" alt="${g.name}" />
          <div style="flex:1">
            <b>${g.name}</b> <span class="badge">${g.category}</span>
            <div class="spec-line">${g.brand} • Rilis ${g.yearStart}</div>
            <div style="color:var(--green);font-weight:700;">${fmtRp(price)}</div>
          </div>
          <button class="primary" onclick="buyGadget('${g.id}')">Beli</button>
        </div>`;
      }).join('')}
    `;
    return;
  }

  if (state.mainTab === 'life') {
    const p = state.player;
    box.innerHTML = `
      <div class="card" style="padding:8px;">
        <b>👤 Profil Karakter & Siklus Kehidupan</b>
        <div class="spec-line">
          • Nama: <b>${p.name}</b> (${p.gender}) • Usia: <b>${p.age} tahun</b> (TTL: ${p.birthDay}/${p.birthMonth}/${p.birthYear})<br>
          • Agama: <b>${p.religion}</b> • Etnis: <b>${p.ethnicity.toUpperCase()}</b><br>
          • Status Pendidikan: <b>${p.age < 18 ? '🎒 Masih Sekolah (07:00–13:00 Senin–Sabtu, Dapat Uang Jajan)' : '🎓 Lulus Sekolah (Fokus Penuh Usaha)'}</b><br>
          • Pasangan: <b>${p.partner ? `${p.partner.name} (${p.married ? 'Menikah' : 'Pacaran'})` : 'Belum ada'}</b>
        </div>
      </div>

      <div class="card" style="padding:8px;">
        <b>💍 Keluarga & Pewaris Usaha Rental PS (Wariskan ke Anak)</b>
        <div class="spec-line">Setelah berusia minimal 18 tahun, kamu bisa menikah, memiliki anak, lalu <b>mewariskan seluruh usaha Rental PS, tabungan, & aset</b> kepada anakmu!</div>
        ${!p.partner ? PARTNERS_LIST.filter(pt => pt.gender !== p.gender).map(pt => `
          <div class="item-row">
            <div><b>${pt.name}</b> (${pt.age} thn • ${pt.job})</div>
            <button class="primary" ${p.age < 17 ? 'disabled' : ''} onclick="choosePartner('${pt.id}')">Kenalan & Pacaran</button>
          </div>
        `).join('') : `
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${!p.married ? `<button class="primary" onclick="marryPartner()">💍 Menikah dengan ${p.partner.name}</button>` : `<button class="success" onclick="haveChildWithPartner()">👶 Program Punya Anak</button>`}
          </div>
        `}
        ${(p.childrenList || []).map((ch, idx) => `
          <div class="item-row">
            <div><b>👶 ${ch.name}</b> (${ch.gender} • Usia ${ch.age} tahun • Lahir ${ch.birthYear})</div>
            <button class="amber" ${ch.age < 8 ? 'disabled' : ''} onclick="inheritToChild(${idx})">${ch.age >= 8 ? '👑 Wariskan Usaha ke Anak Ini' : 'Min Usia 8 Thn'}</button>
          </div>
        `).join('')}
      </div>
    `;
  }
}

// ==================== MODAL KONFIGURASI SLOT (PASANG / LEPAS PS, TV, KIPAS/AC, STIK, MEMCARD, KASET) ====================
function openSlotConfigModal(slotId) {
  const slot = state.slots.find(s => s.id === slotId);
  if (!slot) return;
  const plat = slot.console ? slot.console.platform : null;
  const availDiscs = plat ? GAME_DISC_CATALOG.filter(g => g.platform === plat && (state.ownedDiscs[g.id] || 0) > 0) : [];

  showCustomModal(
    `🔧 Bongkar Pasang ${slot.name}`,
    `<div class="spec-line">Kamu bebas melepas PS, TV, Kipas/AC, Stik, maupun mengganti Kaset Game di slot ini.</div>
     <div class="item-row">
       <div><b>🎮 Konsol PS:</b> ${slot.console ? slot.console.name : 'Kosong'}</div>
       ${slot.console
         ? `<button class="danger" onclick="detachFromSlot(${slot.id},'console')">Lepas PS</button>`
         : `<select onchange="if(this.value)attachToSlot(${slot.id},'console',this.value)"><option value="">-- Pilih PS dari Gudang (${state.warehouseConsoles.length}) --</option>${state.warehouseConsoles.map((c, idx) => `<option value="${idx}">${c.name}</option>`).join('')}</select>`}
     </div>
     <div class="item-row">
       <div><b>📺 TV:</b> ${slot.tv ? slot.tv.name : 'Kosong'}</div>
       ${slot.tv
         ? `<button class="danger" onclick="detachFromSlot(${slot.id},'tv')">Lepas TV</button>`
         : `<select onchange="if(this.value)attachToSlot(${slot.id},'tv',this.value)"><option value="">-- Pilih TV dari Gudang (${state.warehouseTvs.length}) --</option>${state.warehouseTvs.map((t, idx) => `<option value="${idx}">${t.name}</option>`).join('')}</select>`}
     </div>
     <div class="item-row">
       <div><b>❄️ Kipas / AC:</b> ${slot.cooling ? slot.cooling.name : 'Kosong'}</div>
       ${slot.cooling
         ? `<button class="danger" onclick="detachFromSlot(${slot.id},'cooling')">Lepas</button>`
         : `<select onchange="if(this.value)attachToSlot(${slot.id},'cooling',this.value)"><option value="">-- Pilih Kipas/AC Gudang (${state.warehouseCoolings.length}) --</option>${state.warehouseCoolings.map((cl, idx) => `<option value="${idx}">${cl.name}</option>`).join('')}</select>`}
     </div>
     ${plat ? `
       <div class="item-row">
         <div><b>🕹️ Stik ${plat}:</b> ${slot.controller ? `${slot.controller.quality === 'new' ? 'Stik Baru' : 'Stik Servis'} (${slot.controller.durability}%)` : 'Kosong'}</div>
         <div style="display:flex;gap:4px;">
           <button class="primary" ${(state.cashierSticksNew[plat] || 0) <= 0 ? 'disabled' : ''} onclick="attachStickToSlot(${slot.id},'new')">Pasang Baru (${state.cashierSticksNew[plat] || 0})</button>
           <button class="amber" ${(state.cashierSticksServiced[plat] || 0) <= 0 ? 'disabled' : ''} onclick="attachStickToSlot(${slot.id},'serviced')">Pasang Servis (${state.cashierSticksServiced[plat] || 0})</button>
         </div>
       </div>
       <div class="item-row">
         <div><b>💿 Koleksi Game ${plat}:</b><br>
           <span class="spec-line">Tersedia <b>${availDiscs.length} judul game ${plat}</b> di toko. Pelanggan otomatis memilih sendiri game yang ingin dimainkan!</span>
         </div>
       </div>
     ` : `<div class="spec-line">Pasang konsol PS terlebih dahulu untuk memilih Stik & Kaset Game.</div>`}`
  );
}

function attachToSlot(slotId, kind, warehouseIdx) {
  const slot = state.slots.find(s => s.id === slotId);
  const idx = Number(warehouseIdx);
  if (!slot) return;
  if (kind === 'console' && state.warehouseConsoles[idx]) {
    slot.console = state.warehouseConsoles.splice(idx, 1)[0];
    slot.installedGame = null;
    slot.digitalGames = [];
  } else if (kind === 'tv' && state.warehouseTvs[idx]) {
    slot.tv = state.warehouseTvs.splice(idx, 1)[0];
  } else if (kind === 'cooling' && state.warehouseCoolings[idx]) {
    slot.cooling = state.warehouseCoolings.splice(idx, 1)[0];
  }
  saveGame();
  openSlotConfigModal(slotId);
  renderCenterAndRight();
}

function detachFromSlot(slotId, kind) {
  const slot = state.slots.find(s => s.id === slotId);
  if (!slot) return;
  slot.occupied = false;
  slot.minutesLeft = 0;
  if (kind === 'console' && slot.console) {
    state.warehouseConsoles.push(slot.console);
    slot.console = null;
    slot.installedGame = null;
    slot.digitalGames = [];
  } else if (kind === 'tv' && slot.tv) {
    state.warehouseTvs.push(slot.tv);
    slot.tv = null;
  } else if (kind === 'cooling' && slot.cooling) {
    state.warehouseCoolings.push(slot.cooling);
    slot.cooling = null;
  }
  saveGame();
  openSlotConfigModal(slotId);
  renderCenterAndRight();
}

function attachStickToSlot(slotId, quality) {
  const slot = state.slots.find(s => s.id === slotId);
  if (!slot || !slot.console) return;
  const plat = slot.console.platform;
  const pool = quality === 'new' ? state.cashierSticksNew : state.cashierSticksServiced;
  if ((pool[plat] || 0) <= 0) return;
  // Kembalikan stik lama jika masih bagus
  if (slot.controller && slot.controller.durability > 0) {
    if (slot.controller.quality === 'new') state.cashierSticksNew[plat]++;
    else state.cashierSticksServiced[plat]++;
  }
  pool[plat]--;
  const maxD = quality === 'new' ? 100 : 65;
  slot.controller = { platform: plat, quality, durability: maxD, maxDurability: maxD };
  saveGame();
  openSlotConfigModal(slotId);
  renderCenterAndRight();
}

function assignGameToSlot(slotId, gameId) {
  const slot = state.slots.find(s => s.id === slotId);
  const game = GAME_DISC_CATALOG.find(g => g.id === gameId);
  if (!slot || !slot.console || !game) return;
  if (slot.console.mediaType === 'disc') {
    const free = (state.ownedDiscs[gameId] || 0) - getUsedDiscCopies(gameId);
    if (free <= 0) {
      addLog(`⚠️ Kaset fisik <b>${game.title}</b> sedang terpakai semua di PS lain! Beli kaset tambahan di menu Kaset.`);
      return;
    }
    slot.installedGame = game;
  } else {
    if (!slot.digitalGames.includes(gameId)) slot.digitalGames.push(gameId);
    slot.installedGame = game;
  }
  saveGame();
  openSlotConfigModal(slotId);
  renderCenterAndRight();
}

// ==================== PEMBELIAN HARDWARE, KASET, SERVIS STIK, AGEN DUS, KARYAWAN & PINJAMAN ====================
function buyHardwareItem(kind, id) {
  let item, price;
  if (kind === 'console') {
    item = CONSOLE_CATALOG.find(x => x.id === id);
    price = getPriceFrom2010(item.basePrice2010);
    if (!deductFromAnyCash(price)) return addLog('⚠️ Uang tidak cukup untuk membeli konsol ini!');
    state.warehouseConsoles.push({ ...item, uid: 'c_' + Date.now(), cond: 100 });
  } else if (kind === 'tv') {
    item = TV_CATALOG.find(x => x.id === id);
    price = getPriceFrom2010(item.basePrice2010);
    if (!deductFromAnyCash(price)) return addLog('⚠️ Uang tidak cukup untuk membeli TV ini!');
    state.warehouseTvs.push({ ...item, uid: 'tv_' + Date.now(), cond: 100 });
  } else if (kind === 'cooling') {
    item = COOLING_CATALOG.find(x => x.id === id);
    price = getPriceFrom2010(item.basePrice2010);
    if (!deductFromAnyCash(price)) return addLog('⚠️ Uang tidak cukup untuk membeli Kipas/AC ini!');
    state.warehouseCoolings.push({ ...item, uid: 'cl_' + Date.now() });
  } else if (kind === 'acc') {
    item = ACCESSORY_CATALOG.find(x => x.id === id);
    price = getPriceFrom2010(item.basePrice2010);
    if (!deductFromAnyCash(price)) return addLog('⚠️ Uang tidak cukup!');
    if (item.kind === 'stik') state.cashierSticksNew[item.platform] = (state.cashierSticksNew[item.platform] || 0) + 1;
    else state.cashierMemCards[item.platform] = (state.cashierMemCards[item.platform] || 0) + 1;
  }
  addLog(`🛒 Membeli <b>${item.name}</b> seharga <b>${fmtRp(price)}</b>.`);
  saveGame();
  renderAll();
}

function upgradeRenovation() {
  const next = RENOV_LEVELS[state.renovLevel];
  if (!next) return;
  const cost = getPriceFrom2010(next.baseCost2010);
  if (!deductFromAnyCash(cost)) return addLog('⚠️ Uang tidak cukup untuk renovasi!');
  state.renovLevel = next.level;
  addLog(`🧱 <b>RENOVASI BERHASIL!</b> Tempat usaha naik ke <b>${next.name}</b>.`);
  saveGame();
  renderAll();
}

function buyGameDisc(gameId) {
  const g = GAME_DISC_CATALOG.find(x => x.id === gameId);
  if (!g) return;
  const price = getPriceFrom2010(g.basePrice2010);
  if (!deductFromAnyCash(price)) return addLog('⚠️ Uang tidak cukup membeli kaset game!');
  state.ownedDiscs[gameId] = (state.ownedDiscs[gameId] || 0) + 1;
  addLog(`💿 Membeli 1 Kaset Original <b>${g.title} (${g.platform})</b> seharga <b>${fmtRp(price)}</b>.`);
  saveGame();
  renderAll();
}

function manualServiceStick(plat) {
  if ((state.cashierSticksBroken[plat] || 0) <= 0) return;
  const partCost = getPriceFrom2010(8000); // Biaya karet/sparepart analog
  if (!deductFromAnyCash(partCost)) return addLog('⚠️ Kurang biaya karet/part analog untuk servis stik!');
  state.cashierSticksBroken[plat]--;
  state.cashierSticksServiced[plat] = (state.cashierSticksServiced[plat] || 0) + 1;
  addLog(`🔧 Kamu menyervis 1 Stik ${plat} (Biaya part ${fmtRp(partCost)}). Masuk ke Stok Stik Servis di Kasir (ketahanan 65%).`);
  saveGame();
  renderAll();
}

function buyWholesaleSnackBox(snackId) {
  const sn = WHOLESALE_SNACK_CATALOG.find(x => x.id === snackId);
  if (!sn) return;
  const price = getPriceFrom2010(sn.boxPrice2010);
  if (!deductFromAnyCash(price)) return addLog('⚠️ Saldo kurang untuk beli 1 dus di agen!');
  state.snackStockPcs[snackId] = (state.snackStockPcs[snackId] || 0) + sn.pcsPerBox;
  addLog(`📦 Beli 1 Dus <b>${sn.name}</b> (${sn.pcsPerBox} pcs) di Agen seharga <b>${fmtRp(price)}</b>.`);
  saveGame();
  renderAll();
}

function topUpPpobBalance(nom) {
  if (!deductFromAnyCash(nom)) return addLog('⚠️ Uang Laci/Bank tidak cukup untuk isi deposit saldo pulsa!');
  state.businessPpobBalance += nom;
  addLog(`📱 Deposit Saldo Pulsa All Operator bertambah <b>+${fmtRp(nom)}</b>.`);
  saveGame();
  renderAll();
}

function buyPlnToken(nom) {
  const info = calcPlnToken(nom, state.year);
  if (!deductFromAnyCash(info.totalPay)) return addLog('⚠️ Uang tidak cukup untuk beli Token PLN!');
  state.kwh = +(state.kwh + info.kwhReceived).toFixed(2);
  state.plnBlackout = false;
  addLog(`⚡ Isi Token PLN <b>${fmtRp(nom)}</b> (+Admin ${fmtRp(info.adminFee)}) berhasil: <b>+${info.kwhReceived} kWh</b>!`);
  saveGame();
  renderAll();
}

// ==================== REKRUT KARYAWAN LENGKAP ====================
function openHireEmployeeModal() {
  const umrNow = getCurrentUmr();
  showCustomModal(
    '👷 Rekrut Karyawan Rental PS',
    `<div class="spec-line">UMR ${getCity().name} tahun ${state.year}: <b>${fmtRp(umrNow)}/bulan</b>. Tentukan sendiri jadwal & gaji karyawanmu:</div>
     <div class="grid-2">
       <div><label class="spec-line">Nama Karyawan</label><input id="empName" value="Andi Pratama" /></div>
       <div><label class="spec-line">Skema Gaji</label><select id="empPeriod"><option value="daily">Harian</option><option value="weekly">Mingguan</option><option value="monthly" selected>Bulanan</option></select></div>
     </div>
     <div class="grid-2">
       <div><label class="spec-line">Nominal Gaji Pokok (Rp)</label><input type="number" id="empSalary" value="${Math.round(umrNow * 0.6)}" /></div>
       <div><label class="spec-line">Insentif / Bonus (Rp)</label><input type="number" id="empInc" value="100000" /></div>
     </div>
     <div class="grid-3">
       <div><label class="spec-line">Hari Masuk</label><select id="empDays"><option value="mon_sat">Senin–Sabtu</option><option value="every_day">Setiap Hari</option></select></div>
       <div><label class="spec-line">Jam Masuk (0-23)</label><input type="number" id="empStart" min="0" max="23" value="8" /></div>
       <div><label class="spec-line">Durasi Kerja (Jam)</label><input type="number" id="empDur" min="4" max="16" value="8" /></div>
     </div>
     <div class="spec-line">
       <label><input type="checkbox" id="empTaskGuard" checked style="width:auto"> Jaga Kasir & Layani Tamu</label><br>
       <label><input type="checkbox" id="empTaskClean" checked style="width:auto"> Bersih-bersih Ruangan</label><br>
       <label><input type="checkbox" id="empTaskService" checked style="width:auto"> Servis Stik & Konsol Rusak</label><br>
       <label><input type="checkbox" id="empBpjs" checked style="width:auto"> Berikan Tunjangan BPJS Kesehatan</label>
     </div>`,
    `<button onclick="closeCustomModal()">Batal</button><button class="primary" onclick="confirmHireEmployee()">✅ Rekrut Karyawan</button>`
  );
}

function confirmHireEmployee() {
  const name = (document.getElementById('empName').value || 'Karyawan').trim();
  const payPeriod = document.getElementById('empPeriod').value;
  const salaryAmount = Math.max(10000, Number(document.getElementById('empSalary').value) || 500000);
  const incentive = Math.max(0, Number(document.getElementById('empInc').value) || 0);
  const workDays = document.getElementById('empDays').value;
  const startHour = Math.max(0, Math.min(23, Number(document.getElementById('empStart').value) || 8));
  const durationHours = Math.max(4, Math.min(16, Number(document.getElementById('empDur').value) || 8));
  const tasks = [];
  if (document.getElementById('empTaskGuard').checked) tasks.push('guard');
  if (document.getElementById('empTaskClean').checked) tasks.push('clean');
  if (document.getElementById('empTaskService').checked) tasks.push('service');
  const hasBpjs = document.getElementById('empBpjs').checked;

  state.employees.push({
    id: Date.now(),
    name, payPeriod, salaryAmount, incentive, workDays, startHour, durationHours, tasks, hasBpjs
  });
  closeCustomModal();
  addLog(`👷 Merekrut karyawan baru <b>${name}</b> (Jam masuk ${String(startHour).padStart(2, '0')}:00 selama ${durationHours} jam, tugas: ${tasks.join('/')}).`);
  saveGame();
  renderAll();
}

function fireEmployee(idx) {
  const emp = state.employees[idx];
  if (!emp) return;
  state.employees.splice(idx, 1);
  addLog(`👷 Karyawan <b>${emp.name}</b> telah diberhentikan.`);
  saveGame();
  renderAll();
}

// ==================== PINJAMAN ORANG TUA (52x MINGGUAN 0% BUNGA) & BANK (USIA 21+) ====================
function takeParentLoan(amount) {
  if (state.parentLoan.active) return addLog('⚠️ Lunasi dulu pinjaman orang tua yang sedang berjalan!');
  const maxLoan = 50000000;
  const amt = Math.min(maxLoan, amount);
  state.personalBank += amt;
  state.parentLoan = {
    active: true,
    remainingTotal: amt,
    weeklyInstallment: Math.ceil(amt / 52),
    weeksLeft: 52
  };
  addLog(`👨‍👩‍👦 Orang tua meminjamkan modal tambahan <b>${fmtRp(amt)}</b> tanpa bunga (Cicilan 52x mingguan @ ${fmtRp(state.parentLoan.weeklyInstallment)}/minggu).`);
  saveGame();
  renderAll();
}

function takeBankLoan(amount) {
  if (state.player.age < 21) return addLog('⚠️ Usia minimal pengajuan Kredit Bank adalah 21 tahun!');
  if (state.bankLoan.active) return addLog('⚠️ Lunasi dulu kredit bank yang sedang berjalan!');
  const rate = getBankInterestRate(state.year);
  const months = amount > 60000000 ? 24 : 12;
  const totalWithInterest = Math.round(amount * (1 + (rate / 100) * (months / 12)));
  state.personalBank += amount;
  state.bankLoan = {
    active: true,
    principal: amount,
    remainingTotal: totalWithInterest,
    monthlyInstallment: Math.ceil(totalWithInterest / months),
    monthsLeft: months,
    interestRatePct: rate
  };
  addLog(`🏦 Pengajuan Kredit Usaha Bank cair <b>+${fmtRp(amount)}</b> (Bunga ${rate}%/thn, cicilan ${months} bln @ ${fmtRp(state.bankLoan.monthlyInstallment)}/bln).`);
  saveGame();
  renderAll();
}

function sellSecondhandHardware(kind, idx) {
  let item, price = 0;
  if (kind === 'console' && state.warehouseConsoles[idx]) {
    item = state.warehouseConsoles.splice(idx, 1)[0];
    price = Math.round(getPriceFrom2010(item.basePrice2010) * 0.65 * ((item.cond || 100) / 100));
  } else if (kind === 'tv' && state.warehouseTvs[idx]) {
    item = state.warehouseTvs.splice(idx, 1)[0];
    price = Math.round(getPriceFrom2010(item.basePrice2010) * 0.65 * ((item.cond || 100) / 100));
  } else if (kind === 'cooling' && state.warehouseCoolings[idx]) {
    item = state.warehouseCoolings.splice(idx, 1)[0];
    price = Math.round(getPriceFrom2010(item.basePrice2010) * 0.65);
  }
  if (!item) return;
  state.laciCash += price;
  playSfx('cash');
  addLog(`💸 Menjual unit second <b>${item.name}</b> seharga <b style="color:var(--green)">+${fmtRp(price)}</b> ke Laci.`);
  saveGame();
  renderAll();
}

function openBankTransferModal() {
  showCustomModal(
    '🏦 Kelola & Tarik Uang (Laci ⇄ Bank ⇄ Dompet)',
    `<div class="spec-line">Laci: <b>${fmtRp(state.laciCash)}</b> • Bank: <b>${fmtRp(state.personalBank)}</b> • Dompet: <b>${fmtRp(state.handWallet)}</b></div>
     <div class="grid-2">
       <div><label class="spec-line">Dari</label><select id="tfFrom"><option value="laci">Laci Kasir</option><option value="bank">Bank</option><option value="wallet">Dompet</option></select></div>
       <div><label class="spec-line">Ke</label><select id="tfTo"><option value="bank">Bank</option><option value="laci">Laci Kasir</option><option value="wallet">Dompet</option></select></div>
     </div>
     <div><label class="spec-line">Nominal (Rp)</label><input type="number" id="tfAmt" value="100000" min="1000" step="1000" /></div>
     <div class="grid-3">
       <button onclick="document.getElementById('tfAmt').value=10000">10rb</button>
       <button onclick="document.getElementById('tfAmt').value=50000">50rb</button>
       <button onclick="document.getElementById('tfAmt').value=100000">100rb</button>
       <button onclick="document.getElementById('tfAmt').value=500000">500rb</button>
       <button onclick="document.getElementById('tfAmt').value=1000000">1 Juta</button>
       <button class="amber" onclick="transferCustomFunds(true)">Tarik Semua</button>
     </div>`,
    `<button onclick="closeCustomModal()">Tutup</button><button class="primary" onclick="transferCustomFunds(false)">💸 Pindahkan Uang</button>`
  );
}

function transferCustomFunds(all) {
  const from = document.getElementById('tfFrom').value;
  const to = document.getElementById('tfTo').value;
  if (from === to) return;
  const keyMap = { laci: 'laciCash', bank: 'personalBank', wallet: 'handWallet' };
  const avail = state[keyMap[from]] || 0;
  const amt = all ? avail : Math.min(avail, Math.max(0, Number(document.getElementById('tfAmt').value) || 0));
  if (amt <= 0) return;
  state[keyMap[from]] -= amt;
  state[keyMap[to]] += amt;
  playSfx('cash');
  saveGame();
  openBankTransferModal();
  renderAll();
}

// ==================== OTOMOTIF, BENSIN, GADGET, KELUARGA & PEWARISAN ANAK ====================
function buyVehicle(id) {
  const v = VEHICLE_CATALOG.find(x => x.id === id);
  if (!v) return;
  const price = getPriceFrom2010(v.price2010);
  if (!deductFromAnyCash(price)) return addLog('⚠️ Uang tidak cukup untuk membeli kendaraan ini!');
  state.ownedVehicles.push({ ...v, fuelLiters: v.tankCap });
  addLog(`🛵 Membeli <b>${v.name}</b> seharga <b>${fmtRp(price)}</b> (Tangki penuh ${v.tankCap}L).`);
  saveGame();
  renderAll();
}

function refuelVehicle(idx) {
  const v = state.ownedVehicles[idx];
  if (!v) return;
  const need = Math.max(0, v.tankCap - v.fuelLiters);
  if (need <= 0.1) return addLog('⛽ Tangki bensin sudah penuh!');
  const cost = Math.round(need * getBbmPricePerLiter(state.year));
  if (!deductFromAnyCash(cost)) return addLog('⚠️ Uang kurang untuk isi bensin!');
  v.fuelLiters = v.tankCap;
  addLog(`⛽ Isi bensin full <b>${v.name}</b> (${need.toFixed(1)}L): <b>-${fmtRp(cost)}</b>.`);
  saveGame();
  renderAll();
}

function rideVehicleTrip(idx) {
  const v = state.ownedVehicles[idx];
  if (!v || v.fuelLiters < 1) return addLog('⚠️ Bensin habis! Isi bensin dulu.');
  v.fuelLiters = +(v.fuelLiters - 1).toFixed(1);
  state.player.mood = Math.min(100, state.player.mood + 15);
  addLog(`🛣️ Kamu berkeliling kota naik <b>${v.name}</b> (Bensin -1L, Mood naik!). Kamera tetap memantau Rental PS.`);
  saveGame();
  renderAll();
}

function buyGadget(id) {
  const g = GADGET_CATALOG.find(x => x.id === id);
  if (!g) return;
  const price = getPriceFrom2010(g.price2010);
  if (!deductFromAnyCash(price)) return addLog('⚠️ Uang tidak cukup untuk membeli gadget ini!');
  state.ownedGadgets.push({ ...g, boughtYear: state.year });
  addLog(`📱 Membeli gadget <b>${g.name}</b> seharga <b>${fmtRp(price)}</b>.`);
  saveGame();
  renderAll();
}

function choosePartner(id) {
  const pt = PARTNERS_LIST.find(x => x.id === id);
  if (!pt) return;
  state.player.partner = pt;
  state.player.married = false;
  addLog(`❤️ Kamu resmi berpacaran dengan <b>${pt.name}</b> (${pt.job}).`);
  saveGame();
  renderAll();
}

function marryPartner() {
  if (!state.player.partner) return;
  const cost = getPriceFrom2010(15000000);
  if (!deductFromAnyCash(cost)) return addLog(`⚠️ Biaya resepsi pernikahan kurang (${fmtRp(cost)})!`);
  state.player.married = true;
  addLog(`💍 <b>SELAMAT MENEMPUH HIDUP BARU!</b> Kamu resmi menikah dengan <b>${state.player.partner.name}</b>!`);
  saveGame();
  renderAll();
}

function haveChildWithPartner() {
  if (!state.player.married) return;
  const isBoy = Math.random() < 0.5;
  const cName = isBoy ? `Putra ${state.player.name.split(' ')[0]}` : `Putri ${state.player.name.split(' ')[0]}`;
  state.player.childrenList.push({
    name: cName,
    gender: isBoy ? 'Laki-laki' : 'Perempuan',
    age: 0,
    birthDay: state.day,
    birthMonth: state.month,
    birthYear: state.year,
    ethnicity: state.player.ethnicity
  });
  addLog(`👶 <b>KELAHIRAN ANAK!</b> Anakmu <b>${cName}</b> lahir dengan sehat! Saat berusia 8+ tahun nanti, usaha Rental PS bisa diwariskan kepadanya.`);
  saveGame();
  renderAll();
}

function inheritToChild(idx) {
  const ch = state.player.childrenList[idx];
  if (!ch || ch.age < 8) return;
  const oldName = state.player.name;
  state.player.name = ch.name;
  state.player.gender = ch.gender;
  state.player.age = ch.age;
  state.player.birthDay = ch.birthDay || 1;
  state.player.birthMonth = ch.birthMonth || 1;
  state.player.birthYear = ch.birthYear;
  state.player.partner = null;
  state.player.married = false;
  state.player.childrenList = [];
  addLog(`👑 <b>ESTAFET GENERASI BARU!</b> Usaha Rental PS & seluruh aset keluarga resmi diwariskan dari <b>${oldName}</b> kepada anaknya: <b>${ch.name}</b> (Usia ${ch.age} tahun)!`);
  saveGame();
  renderAll();
}

// ==================== SAVE / LOAD & CLOUD SYNC ====================
function saveGame() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (typeof CloudSync !== 'undefined') CloudSync.pushToCloud(state);
  } catch (e) {}
}

function loadGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      seedStarterUnits();
      return false;
    }
    const parsed = JSON.parse(raw);
    Object.assign(state, parsed);
    if (!state.slots || state.slots.length !== 20) {
      state.slots = createEmptySlots20();
      seedStarterUnits();
    }
    return true;
  } catch (e) {
    seedStarterUnits();
    return false;
  }
}

function openCloudSyncModal() {
  showCustomModal(
    '☁️ Sinkronisasi Cloud Save (Oneilverse Cloud)',
    `<div class="spec-line">Simpan atau muat progres usaha Rental PS kamu dari Cloud dengan ID Sinkronisasi:</div>
     <input id="cloudSyncIdInp" value="${typeof CloudSync !== 'undefined' ? CloudSync.syncId : 'oneil_default'}" />`,
    `<button onclick="closeCustomModal()">Tutup</button>
     <button onclick="pullCloudSave()">⬇️ Muat dari Cloud</button>
     <button class="primary" onclick="pushCloudSave()">⬆️ Simpan ke Cloud</button>`
  );
}

async function pushCloudSave() {
  const id = document.getElementById('cloudSyncIdInp').value;
  if (typeof CloudSync !== 'undefined') {
    CloudSync.setSyncId(id);
    const res = await CloudSync.pushToCloud(state, true);
    addLog(res.ok ? '☁️ Progres berhasil disimpan ke Cloud!' : '⚠️ Gagal simpan ke Cloud.');
  }
  closeCustomModal();
}

async function pullCloudSave() {
  const id = document.getElementById('cloudSyncIdInp').value;
  if (typeof CloudSync !== 'undefined') {
    CloudSync.setSyncId(id);
    const res = await CloudSync.pullFromCloud();
    if (res.ok && res.state) {
      Object.assign(state, res.state);
      saveGame();
      renderAll();
      addLog('☁️ Progres berhasil dimuat dari Cloud!');
    }
  }
  closeCustomModal();
}

// ==================== INISIALISASI ====================
window.addEventListener('DOMContentLoaded', () => {
  const hadSave = loadGame();
  renderAll();
  addLog(`🎮 <b>Rental PS & Life Simulator (2010–Now)</b> siap! Kecepatan 1x: 1 Jam = 30 Detik (1 Hari = 12 Menit).`);
  if (!hadSave) {
    setTimeout(openCharacterCreationModal, 400);
  }
  requestAnimationFrame(mainLoop);
});
