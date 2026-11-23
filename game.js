// ==================== ENGINE UTAMA WARNET & LIFE SIMULATOR (2010 - SEKARANG) ====================
const STORAGE_KEY = 'oneilverse_warnet_sim_2010_v3';

function createEmptyWarnetSlots20() {
  const slots = [];
  for (let i = 1; i <= 20; i++) {
    slots.push({
      id: i,
      isRoom: true,
      name: `Room VIP #${i}`,
      unitType: 'pc', // 'pc' (Rakit PC) atau 'ps' (Rental PlayStation)
      psConsole: null,
      cpu: null,
      rams: [], // Bisa pasang 2, 4, hingga 8 keping RAM tergantung processor!
      vga: null,
      storage: null,
      os: null,
      monitor: null,
      cooling: null,
      gear: null,
      chair: null,
      overclocked: false,
      tempC: 40,
      dustPct: 0,
      installedGames: [], // Semua game belum terinstal! Instal & uninstal per PC sesuai storage & spek.
      occupied: false,
      customerName: '',
      partyTag: '',
      activityLabel: '',
      billingMode: 'paket',
      packageName: '',
      packagePrice: 0,
      snackBill: 0,
      totalSecondsBooked: 0,
      secondsLeft: 0,
      elapsedSeconds: 0,
      hourlyRate: 5000,
      updatingPatch: false,
      updatingGameId: null,
      updatingGameTitle: '',
      patchDoneMb: 0,
      patchTotalMb: 0
    });
  }
  return slots;
}

const state = {
  version: 'v3.0',
  cityId: 'jbi',
  paused: false,
  speed: 1,

  // Kalender Asli Mulai Jumat, 1 Januari 2010
  year: 2010,
  month: 1,
  day: 1,
  dayOfWeek: 5, // Jumat
  totalDays: 1,
  hour: 8,
  minute: 0,
  second: 0,

  // Modal Awal Rp 0 (Pinjam ke Orang Tua 5-30 Juta untuk mulai rakit PC!)
  laciCash: 0,
  handWallet: 0,
  personalBank: 0,
  businessPpobBalance: 0,

  // Listrik PLN, Meteran VA, Genset Otomatis, Kebersihan, Renovasi, PC Server & Jam Operasional
  kwh: 45.0,
  plnMeterLevel: 1,
  plnBlackout: false,
  genset: {
    owned: true,
    active: false,
    fuelLiters: 8.0,
    maxTankLiters: 15.0
  },
  cleanliness: 100,
  renovLevel: 1,
  serverLevel: 1,
  internetPlanId: 'isp_1m',
  rentalOpen: true,
  openHour: 8,
  closeHour: 23,
  weather: 'cerah', // 'cerah' | 'panas' | 'hujan'
  happyHourActive: false,
  nightPackageActive: false,
  qrisActive: false,
  facilities: {},
  members: { count: 0, discountPct: 10 },
  goldGrams: 0,
  itCourseCompleted: false,
  familyHappiness: 90,
  lastTournamentDay: -10,
  reputationBonus: 0,
  branches: { warnetOwned: false, psRentalOwned: false },
  financeStats: { revBilling: 0, revSnack: 0, revExtra: 0, expPower: 0, expSalary: 0, expLoan: 0 },

  // Pengaturan Tarif Billing Meter (Per Jam, Dihitung Per Detik!) & Paket Custom
  billingHourlyRate: 3000, // Bisa diubah bebas oleh pemain (misal 6000/jam = Rp 1.66/detik)
  vipRateBonus: 1500,
  customPackages: [
    { id: 'pkt_1', name: 'Paket 1 Jam', hours: 1, price: 3000 },
    { id: 'pkt_2', name: 'Paket 2 Jam', hours: 2, price: 5000 },
    { id: 'pkt_3', name: 'Paket 3 Jam', hours: 3, price: 7000 },
    { id: 'pkt_5', name: 'Paket Begadang 5 Jam', hours: 5, price: 10000 }
  ],

  // 20 Slot PC Warnet / Rental PS & Ruang Tunggu
  slots: createEmptyWarnetSlots20(),
  waitingQueue: [],

  // Gudang Komponen Rakit PC, Kursi & Konsol PS (Belum Dipasang / Dilepas dari Slot)
  warehouseCpus: [],
  warehouseRams: [],
  warehouseVgas: [],
  warehouseStorages: [],
  warehouseMonitors: [],
  warehouseCoolings: [],
  warehouseChairs: [],
  warehousePsConsoles: [],

  // Stok Gear (Mouse+KB+Headset) di Kasir: Baru Standar (100%), Mechanical RGB (220%), Servis (65%), Rusak
  cashierGearNew: 3,
  cashierGearMech: 0,
  cashierGearServiced: 0,
  cashierGearBroken: 0,

  // Library Kaset DVD PC & Installer yang sudah dibeli/didownload (Belum terinstal ke PC!)
  installedGames: {},
  // Daftar game online yang sedang butuh update patch: { [gameId]: patchMb }
  pendingGamePatches: {},

  // Logistik Warnet: Air Galon (Porsi Seduh) + Stok Pop Mie & Minuman (Pcs)
  waterGallonServings: 45, // 1 Galon 19L = 45 cup seduhan Pop Mie/Kopi
  snackStockPcs: {
    'sn_popmie_ayam': 24,
    'sn_kopi_goodday': 30,
    'sn_teh_pucuk': 24
  },

  // Karyawan Warnet (Lengkap dengan Hari Senin-Minggu)
  employees: [],

  // Status Ruko: Sewa Bulanan atau Cicil Beli Ruko Permanen
  property: {
    owned: false,
    kprActive: false,
    kprRemaining: 0,
    kprMonthly: 0,
    kprMonthsLeft: 0
  },

  // Pinjaman Orang Tua (5-30 Jt, 52x mingguan 0% bunga), Kredit Bank (Usia 21+), & Cicilan Aset (Motor/Mobil/Rumah)
  parentLoan: { active: false, remainingTotal: 0, weeklyInstallment: 0, weeksLeft: 0 },
  bankLoan: { active: false, principal: 0, remainingTotal: 0, monthlyInstallment: 0, monthsLeft: 0, interestRatePct: 0 },
  assetLoans: [],
  ownedHouses: [],

  // Otomotif & Gadget
  ownedVehicles: [],
  ownedGadgets: [],

  // Karakter Utama (Energi 100% = tahan 36 jam, bisa sakit, BPJS Kesehatan)
  player: {
    name: 'Neil Aura',
    gender: 'Laki-laki',
    religion: 'Islam',
    ethnicity: 'chinese',
    birthDay: 15,
    birthMonth: 5,
    birthYear: 1998,
    age: 12,
    energy: 100,
    isSick: false,
    sickName: '',
    bpjsTier: 'none',
    partner: null,
    married: false,
    childrenList: []
  },

  mainTab: 'slots',
  slotSubFilter: 'all',
  hwCategoryFilter: 'cpu',
  gameTypeFilter: 'online',
  soundEnabled: true,
  musicEnabled: true,
  bgmTrack: 1,
  unlockAllEras: true
};

// Awal mulai Rp 0 tanpa PC — pemain pinjam ke Orang Tua (5-30 Juta) dulu lalu beli & rakit PC sendiri!
function seedStarterWarnetPcs() {
  // Sengaja dikosongkan sesuai skenario mulai dari Rp 0
}

// ==================== SYNTHESIZER MUSIK BACKSOUND CHIPTUNE/LO-FI WARNET (3 LAGU + BEAT + BASS + CHORD) ====================
let audioCtx = null;
let bgmTimer = null;
let bgmStepIdx = 0;

const BGM_TRACKS = {
  1: {
    name: '🎵 Lagu 1: Nostalgia Warnet 2010',
    tempoMs: 260,
    wave: 'triangle',
    melody: [
      523.25, 659.25, 783.99, 659.25, 587.33, 659.25, 523.25, 392.00,
      440.00, 523.25, 659.25, 880.00, 783.99, 659.25, 587.33, 523.25,
      349.23, 440.00, 523.25, 698.46, 659.25, 523.25, 440.00, 392.00,
      392.00, 493.88, 587.33, 783.99, 659.25, 587.33, 523.25, 392.00
    ],
    bass: [130.81, 130.81, 110.00, 110.00, 87.31, 87.31, 98.00, 98.00]
  },
  2: {
    name: '🎵 Lagu 2: Cyber Arena Mabar',
    tempoMs: 210,
    wave: 'square',
    melody: [
      440.00, 0, 523.25, 659.25, 587.33, 0, 523.25, 440.00,
      349.23, 440.00, 523.25, 698.46, 659.25, 587.33, 523.25, 392.00,
      440.00, 523.25, 659.25, 880.00, 783.99, 659.25, 523.25, 440.00,
      329.63, 392.00, 493.88, 659.25, 587.33, 493.88, 440.00, 329.63
    ],
    bass: [110.00, 110.00, 87.31, 87.31, 130.81, 130.81, 98.00, 82.41]
  },
  3: {
    name: '🎵 Lagu 3: Lo-Fi Begadang Malam',
    tempoMs: 340,
    wave: 'sine',
    melody: [
      392.00, 493.88, 587.33, 783.99, 659.25, 587.33, 493.88, 392.00,
      329.63, 392.00, 493.88, 659.25, 587.33, 493.88, 392.00, 329.63,
      261.63, 329.63, 392.00, 523.25, 493.88, 392.00, 329.63, 261.63,
      293.66, 369.99, 440.00, 587.33, 523.25, 440.00, 369.99, 293.66
    ],
    bass: [98.00, 98.00, 82.41, 82.41, 65.41, 65.41, 73.42, 73.42]
  }
};

function ensureAudioContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playBgmStep() {
  if (!state.soundEnabled || state.musicEnabled === false) return;
  try {
    const ctx = ensureAudioContext();
    if (ctx.state === 'suspended') return;
    const now = ctx.currentTime;
    const tr = BGM_TRACKS[state.bgmTrack || 1] || BGM_TRACKS[1];
    const leadFreq = tr.melody[bgmStepIdx % tr.melody.length];
    const bassFreq = tr.bass[Math.floor(bgmStepIdx / 4) % tr.bass.length];

    // 1. Lead Melody Synth (Jelas & Nyaring)
    if (leadFreq > 0) {
      const oscLead = ctx.createOscillator();
      const gainLead = ctx.createGain();
      oscLead.type = tr.wave || 'triangle';
      oscLead.frequency.setValueAtTime(leadFreq, now);
      const peakGain = tr.wave === 'square' ? 0.055 : 0.11;
      gainLead.gain.setValueAtTime(peakGain, now);
      gainLead.gain.exponentialRampToValueAtTime(0.002, now + (tr.tempoMs / 1000) * 0.9);
      oscLead.connect(gainLead);
      gainLead.connect(ctx.destination);
      oscLead.start(now);
      oscLead.stop(now + (tr.tempoMs / 1000) * 0.95);
    }

    // 2. Warm Harmony Chord pada tiap awal ketukan 4
    if (bgmStepIdx % 4 === 0 && leadFreq > 0) {
      const oscChord = ctx.createOscillator();
      const gainChord = ctx.createGain();
      oscChord.type = 'sine';
      oscChord.frequency.setValueAtTime(leadFreq * 0.75, now);
      gainChord.gain.setValueAtTime(0.06, now);
      gainChord.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      oscChord.connect(gainChord);
      gainChord.connect(ctx.destination);
      oscChord.start(now);
      oscChord.stop(now + 0.8);
    }

    // 3. Bassline + Drum Kick Synth pada tiap ketukan genap
    if (bgmStepIdx % 2 === 0) {
      const oscBass = ctx.createOscillator();
      const gainBass = ctx.createGain();
      oscBass.type = 'triangle';
      oscBass.frequency.setValueAtTime(bassFreq * 2, now);
      oscBass.frequency.exponentialRampToValueAtTime(bassFreq, now + 0.08);
      gainBass.gain.setValueAtTime(0.13, now);
      gainBass.gain.exponentialRampToValueAtTime(0.002, now + 0.45);
      oscBass.connect(gainBass);
      gainBass.connect(ctx.destination);
      oscBass.start(now);
      oscBass.stop(now + 0.48);
    }

    bgmStepIdx = (bgmStepIdx + 1) % tr.melody.length;
  } catch (e) {}
}

function startOrUpdateBgm() {
  if (bgmTimer) {
    clearInterval(bgmTimer);
    bgmTimer = null;
  }
  const btnM = document.getElementById('btnMusicTrack');
  if (btnM) {
    if (!state.soundEnabled || state.musicEnabled === false) {
      btnM.textContent = '🔇 Musik';
    } else {
      btnM.textContent = `🎵 Lagu ${state.bgmTrack || 1}`;
    }
  }
  if (state.soundEnabled && state.musicEnabled !== false) {
    const tr = BGM_TRACKS[state.bgmTrack || 1] || BGM_TRACKS[1];
    bgmTimer = setInterval(playBgmStep, tr.tempoMs || 260);
  }
}

function cycleBgmTrack() {
  ensureAudioContext();
  if (!state.soundEnabled || state.musicEnabled === false) {
    state.soundEnabled = true;
    state.musicEnabled = true;
    state.bgmTrack = 1;
  } else if ((state.bgmTrack || 1) < 3) {
    state.bgmTrack = (state.bgmTrack || 1) + 1;
  } else {
    state.musicEnabled = false;
  }
  bgmStepIdx = 0;
  startOrUpdateBgm();
  const btnS = document.getElementById('btnSoundToggle');
  if (btnS) btnS.textContent = state.soundEnabled ? '🔊' : '🔇';
  if (state.musicEnabled) {
    playBgmStep();
    const tr = BGM_TRACKS[state.bgmTrack || 1] || BGM_TRACKS[1];
    showFloatingToast(`🎶 Memutar <b>${tr.name}</b> (Tap tombol 🎵 di atas untuk ganti lagu / matikan musik).`, 'ok');
  } else {
    showFloatingToast('🔇 <b>Musik Backsound Dimatikan.</b> Tap tombol 🔇 Musik lagi untuk menyalakan.', 'info');
  }
  saveGame();
}

// Unlock Web Audio API pada event click / touchend / pointerup / keydown agar musik selalu menyala di Chrome/HP!
if (typeof window !== 'undefined') {
  ['click', 'touchend', 'pointerup', 'keydown'].forEach(evName => {
    window.addEventListener(evName, function unlockBgmAudio() {
      try {
        const ctx = ensureAudioContext();
        if (!bgmTimer && state.soundEnabled && state.musicEnabled !== false) {
          startOrUpdateBgm();
          playBgmStep();
        }
      } catch (e) {}
    }, { passive: true });
  });
}

function playSfx(type) {
  if (!state.soundEnabled) return;
  try {
    const ctx = ensureAudioContext();
    if (!bgmTimer && state.musicEnabled !== false) startOrUpdateBgm();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'cash') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.07);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now); osc.stop(now + 0.25);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, now);
      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now); osc.stop(now + 0.05);
    }
  } catch (e) {}
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  state.musicEnabled = state.soundEnabled;
  const btn = document.getElementById('btnSoundToggle');
  if (btn) btn.textContent = state.soundEnabled ? '🔊' : '🔇';
  startOrUpdateBgm();
  if (state.soundEnabled) {
    playSfx('click');
    playBgmStep();
    showFloatingToast('🔊 <b>Suara & Musik Aktif!</b>', 'ok');
  } else {
    showFloatingToast('🔇 <b>Semua Suara & Musik Dimatikan (Mute).</b>', 'info');
  }
}

// ==================== HELPER EKONOMI, INTERNET, PENJAGA & SPEK PC ====================
function isEraUnlocked(releaseYear) {
  if (state.unlockAllEras !== false) return true;
  return (releaseYear || 2010) <= state.year;
}
function toggleUnlockAllEras() {
  state.unlockAllEras = (state.unlockAllEras === false);
  playSfx('click');
  showFloatingToast(
    state.unlockAllEras
      ? '🌍 <b>Mode Semua Era (2010–2026+) Aktif!</b> Semua spek PC Tier 12, PS5 Pro, 87 Game, 250 Mbps, HP &amp; Mobil tampil di toko!'
      : `📅 <b>Mode Historis Aktif!</b> Item toko kini mengikuti tahun berjalan (<b>${state.year}</b>).`,
    'ok'
  );
  saveGame();
  renderAll();
}
function getStoreEraBannerHtml() {
  const allOn = state.unlockAllEras !== false;
  return `<div class="item-row" style="background:rgba(37,99,235,0.18);border-color:rgba(59,130,246,0.4);">
    <div style="flex:1">
      <b>${allOn ? '🌍 Katalog Lengkap Semua Era (2010–2026+) Aktif' : `📅 Mode Historis (Hanya Rilisan ≤ ${state.year})`}</b>
      <div class="spec-line">${allOn ? 'Semua spek PC Tier 12, PS5 Pro, 87 Game & 250 Mbps langsung terbuka!' : 'Hanya item sampai tahun kalender saat ini yang tampil.'}</div>
    </div>
    <button type="button" class="${allOn ? 'success' : 'amber'}" onclick="toggleUnlockAllEras()">${allOn ? '🌍 Semua Era ON' : `📅 Thn ${state.year} Saja`}</button>
  </div>`;
}
function fmtRp(n) { return 'Rp ' + Math.round(n || 0).toLocaleString('id-ID'); }
function roundTo500(n) { return Math.max(500, Math.round(n / 500) * 500); }
function getCity() { return INDONESIA_CITIES.find(c => c.id === state.cityId) || INDONESIA_CITIES[0]; }
function getCurrentUmr() { return roundTo500(getCity().umr2024 * getEraMultiplier(state.year)); }
function getPriceFrom2010(base2010) { return roundTo500(base2010 * get2010Multiplier(state.year)); }
function getDaysInMonth(y, m) { return new Date(y, m, 0).getDate(); }
function computeDayOfWeek(y, m, d) { return new Date(y, m - 1, d).getDay(); }

function getInternetPlan() {
  return INTERNET_PLANS.find(p => p.id === state.internetPlanId) || INTERNET_PLANS[0];
}

function getCurrentPingMs() {
  const plan = getInternetPlan();
  const onlineCount = state.slots.filter(s => s.occupied).length;
  const overload = Math.max(0, onlineCount - plan.maxSmoothPcs);
  return Math.round(18 + (onlineCount * 2) + overload * 28);
}

function isPlayerAtSchool() {
  if (state.player.age >= 18) return false;
  if (state.dayOfWeek === 0) return false;
  if (getHolidayName(state.year, state.month, state.day)) return false;
  return state.hour >= 7 && state.hour < 13;
}

function isEmployeeOnDuty(emp) {
  if (!emp) return false;
  // Cek array hari kerja (0=Minggu, 1=Senin, ..., 6=Sabtu)
  const daysArr = Array.isArray(emp.workDaysArray) ? emp.workDaysArray : [1, 2, 3, 4, 5, 6];
  if (!daysArr.includes(state.dayOfWeek)) return false;
  const start = Number(emp.startHour) || 8;
  const dur = Number(emp.durationHours) || 8;
  const end = start + dur;
  const inShift = end <= 24 ? (state.hour >= start && state.hour < end) : (state.hour >= start || state.hour < (end % 24));
  if (inShift) return true;
  // Jika warnet sudah tutup tapi masih ada PC yang sedang proses update patch, karyawan teknisi/jaga belum pulang!
  if (!state.rentalOpen && (emp.tasks.includes('service') || emp.tasks.includes('guard')) && state.slots.some(s => s.updatingPatch)) {
    return true;
  }
  return false;
}

// Saat karyawan jaga, karakter kita TIDAK perlu ikut jaga! Karakter kita hanya nongol jaga saat tidak ada karyawan.
function getCurrentGuardStatus() {
  const onDutyGuards = (state.employees || []).filter(e => isEmployeeOnDuty(e) && e.tasks.includes('guard'));
  if (onDutyGuards.length > 0) {
    return { hasGuard: true, byEmployee: true, label: `👷 ${onDutyGuards[0].name} (Kamu Bebas)` };
  }
  if (isPlayerAtSchool()) {
    return { hasGuard: false, byEmployee: false, label: `🎒 Kamu di Sekolah (Kosong!)` };
  }
  return { hasGuard: true, byEmployee: false, label: `👤 ${state.player.name} (Jaga Sendiri)` };
}

function getPcTotalRamGb(slot) {
  if (!slot) return 0;
  if (Array.isArray(slot.rams) && slot.rams.length > 0) {
    return slot.rams.reduce((sum, r) => sum + (r.sizeGb || 0), 0);
  }
  return slot.ram ? (slot.ram.sizeGb || 0) : 0;
}

function getPcTotalStorageGb(slot) {
  return (slot && slot.storage) ? (slot.storage.sizeGb || 0) : 0;
}

function getPcUsedStorageGb(slot) {
  if (!slot || !Array.isArray(slot.installedGames)) return 0;
  return +(slot.installedGames.reduce((sum, gid) => {
    const g = GAME_DISC_CATALOG.find(x => x.id === gid);
    return sum + (g ? g.sizeGb : 0);
  }, 0)).toFixed(1);
}

function getPcTier(slot) {
  if (!slot) return 0;
  if (slot.unitType === 'ps') {
    return slot.psConsole ? (slot.psConsole.tier || 2) : 0;
  }
  const ramGb = getPcTotalRamGb(slot);
  if (!slot.cpu || ramGb <= 0 || !slot.vga) return 0;
  const ramTier = ramGb >= 64 ? 12 : ramGb >= 32 ? 10 : ramGb >= 16 ? 8 : ramGb >= 8 ? 5 : ramGb >= 4 ? 3 : ramGb >= 2 ? 2 : 1;
  let baseTier = Math.min(slot.cpu.tier || 1, ramTier, slot.vga.tier || 1);
  if (slot.overclocked) baseTier += 1;
  if ((slot.tempC || 40) > 85) baseTier = Math.max(1, baseTier - 1);
  return baseTier;
}

function getSlotComfortScore(slot) {
  if (!slot) return 0;
  let c = 0;
  if (slot.monitor && slot.monitor.comfortBonus) c += slot.monitor.comfortBonus;
  if (slot.cooling && slot.cooling.comfortBonus) c += slot.cooling.comfortBonus;
  if (slot.chair && slot.chair.comfortBonus) c += slot.chair.comfortBonus;
  if (slot.gear && slot.gear.quality === 'mech') c += 15;
  return c;
}

function getSlotHourlyRate(slot) {
  const base = Number(state.billingHourlyRate) || 3000;
  const vipAdd = (slot && slot.isRoom) ? (Number(state.vipRateBonus) || 1500) : 0;
  if (!slot) return base + vipAdd;

  // Dampak Nyata Upgrade PC / PS, Monitor, Kursi, AC, Mechanical Gear & Paket Internet terhadap Tarif Sewa!
  const tier = getPcTier(slot);
  const tierBonus = tier > 1 ? getPriceFrom2010((tier - 1) * 450) : 0;
  const monBonus = (slot.monitor && slot.monitor.rateBonus2010) ? getPriceFrom2010(slot.monitor.rateBonus2010) : 0;
  const coolBonus = (slot.cooling && slot.cooling.rateBonus2010) ? getPriceFrom2010(slot.cooling.rateBonus2010) : 0;
  const chairBonus = (slot.chair && slot.chair.rateBonus2010) ? getPriceFrom2010(slot.chair.rateBonus2010) : 0;
  const gearBonus = (slot.gear && slot.gear.quality === 'mech') ? getPriceFrom2010(1200) : 0;
  const psBonus = (slot.unitType === 'ps' && slot.psConsole && slot.psConsole.rateBonus2010) ? getPriceFrom2010(slot.psConsole.rateBonus2010) : 0;
  const plan = getInternetPlan();
  const ispBonus = (plan && plan.rateBonus2010) ? getPriceFrom2010(plan.rateBonus2010) : 0;
  const renovObj = RENOV_LEVELS[(state.renovLevel || 1) - 1] || RENOV_LEVELS[0];
  const rawTotal = base + vipAdd + tierBonus + monBonus + coolBonus + chairBonus + gearBonus + psBonus + ispBonus;
  return roundTo500(rawTotal * (renovObj.rateMult || 1.0));
}

function getWarnetStarRating() {
  const readySlots = state.slots.filter(s => isSlotReadyToPlay(s).ok);
  const avgTier = readySlots.length > 0
    ? readySlots.reduce((sum, s) => sum + getPcTier(s), 0) / readySlots.length
    : 1;
  const cleanScore = (state.cleanliness || 100) / 100; // 0..1
  const plan = getInternetPlan();
  const ping = getCurrentPingMs();
  const ispScore = Math.min(1.2, (plan.mbps >= 50 ? 1.15 : plan.mbps >= 10 ? 0.95 : plan.mbps >= 3 ? 0.8 : 0.6) - (ping > 100 ? 0.35 : 0));
  const facCount = Object.keys(state.facilities || {}).filter(k => state.facilities[k]).length;
  const repAdd = Math.min(0.8, (state.reputationBonus || 0) * 0.05);
  const star = 2.2 + (cleanScore * 0.9) + Math.min(1.0, avgTier * 0.12) + (ispScore * 0.4) + Math.min(0.5, facCount * 0.05) + repAdd;
  return Math.max(1.0, Math.min(5.0, +star.toFixed(1)));
}

function getWholesaleDiscountMult() {
  // Jika punya Mobil Pick-Up / Mobil -> Diskon Grosir 22%, jika punya Motor -> Diskon Grosir 12%
  const hasPickupOrCar = (state.ownedVehicles || []).some(v => v.category === 'Mobil');
  if (hasPickupOrCar) return 0.78;
  const hasMotor = (state.ownedVehicles || []).length > 0;
  if (hasMotor) return 0.88;
  return 1.0;
}

function getPlnMeterObj() {
  const lv = state.plnMeterLevel || 1;
  return (typeof PLN_METER_LEVELS !== 'undefined' ? PLN_METER_LEVELS : [])[lv - 1] || { level: 1, name: 'Daya PLN 1.300 VA', maxWatts: 1300, baseCost2010: 0 };
}

function getCurrentActiveWatts() {
  let totalWatt = 35;
  state.slots.forEach(s => {
    if (s.occupied || s.updatingPatch) {
      if (s.unitType === 'ps') {
        totalWatt += (s.psConsole ? s.psConsole.watt : 90) + (s.monitor ? s.monitor.watt : 35) + (s.cooling ? s.cooling.watt : 0);
      } else {
        const ocMult = s.overclocked ? 1.28 : 1.0;
        totalWatt += Math.round(((s.cpu ? s.cpu.watt : 65) + (s.vga ? s.vga.watt : 50)) * ocMult) + (s.monitor ? s.monitor.watt : 35) + (s.cooling ? s.cooling.watt : 0);
      }
    }
  });
  return totalWatt;
}

function isSlotReadyToPlay(slot) {
  if (!slot) return { ok: false, reason: 'Slot Kosong' };
  if (slot.unitType === 'ps') {
    if (!slot.psConsole || !slot.monitor) {
      return { ok: false, reason: 'Rental PS Belum Lengkap (Wajib Konsol PS + TV/Monitor)' };
    }
    return { ok: true, reason: 'Rental PS Siap Main' };
  }
  const ramGb = getPcTotalRamGb(slot);
  if (!slot.cpu || ramGb <= 0 || !slot.vga || !slot.storage || !slot.monitor) {
    return { ok: false, reason: 'PC Belum Lengkap (Wajib CPU+RAM+VGA+HDD+Monitor)' };
  }
  if (!slot.os) return { ok: false, reason: 'Belum Install Windows OS' };
  if (!slot.gear || slot.gear.durability <= 0) return { ok: false, reason: 'Mouse/KB/Headset Rusak!' };
  if (slot.updatingPatch) return { ok: false, reason: 'Sedang Update Patch Game' };
  return { ok: true, reason: 'Siap Online' };
}

function isPowerAvailable() {
  return state.kwh > 0 || (state.genset.owned && state.genset.fuelLiters > 0);
}

function addRevenueToWarnet(amount, category = 'billing') {
  state.financeStats = state.financeStats || { revBilling: 0, revSnack: 0, revExtra: 0, expPower: 0, expSalary: 0, expLoan: 0 };
  if (category === 'snack') state.financeStats.revSnack += amount;
  else if (category === 'extra') state.financeStats.revExtra += amount;
  else state.financeStats.revBilling += amount;

  if (state.qrisActive && state.year >= 2019) {
    const toBank = Math.round(amount * 0.5);
    const toLaci = amount - toBank;
    state.personalBank += toBank;
    state.laciCash += toLaci;
  } else {
    state.laciCash += amount;
  }
}

let floatingToastTimer = null;
function showFloatingToast(htmlMsg, kind = 'info') {
  const el = document.getElementById('floatingPopupToast');
  if (!el) return;
  el.className = 'floating-popup-toast show ' + (kind === 'warn' ? 'warn' : kind === 'ok' ? 'ok' : '');
  el.innerHTML = `<div style="flex:1">${htmlMsg}</div><span style="color:#94a3b8;font-weight:900;cursor:pointer;padding-left:6px;">✕</span>`;
  if (floatingToastTimer) clearTimeout(floatingToastTimer);
  floatingToastTimer = setTimeout(() => {
    el.classList.remove('show');
  }, 4200);
}

function notifyBlockedPopup(title, reasonHtml) {
  playSfx('click');
  addLog(`🔒 <b>${title}:</b> ${reasonHtml}`);
  showFloatingToast(`🔒 <b>${title}</b><br>${reasonHtml}`, 'warn');
  // Jika modal tidak sedang terbuka, tampilkan juga popup modal penjelasan agar pemain paham 100%!
  const modalBg = document.getElementById('customModalBackdrop');
  const isModalOpen = modalBg && modalBg.style.display === 'flex';
  if (!isModalOpen) {
    showCustomModal(
      `🔒 ${title}`,
      `<div class="card" style="border-color:#f59e0b;">
         <div class="spec-line" style="font-size:0.78rem;color:#f8fafc;">${reasonHtml}</div>
       </div>`,
      `<button type="button" class="primary" onclick="closeCustomModal()">👍 Mengerti</button>`
    );
  }
}

function pullAllLaciToWalletNow() {
  if (state.laciCash <= 0) {
    showFloatingToast('⚠️ Saldo di Laci Kasir saat ini Rp 0.', 'warn');
    return;
  }
  const amt = state.laciCash;
  state.handWallet += amt;
  state.laciCash = 0;
  playSfx('cash');
  addLog(`👛 Menarik seluruh uang dari <b>Laci Kasir (${fmtRp(amt)})</b> ke <b>Dompet</b>!`);
  showFloatingToast(`✅ <b>${fmtRp(amt)}</b> ditarik dari Laci Kasir ke Dompet! Sekarang kamu bisa lanjut belanja.`, 'ok');
  saveGame();
  renderAll();
}

function addLog(msg) {
  const toast = document.getElementById('liveToastBar');
  if (toast) toast.innerHTML = msg;

  // Jika drawer atau modal sedang terbuka, tampilkan feedback aksi pemain di Floating Popup Toast atas (z-index 99999) agar tidak tertutup!
  const drawerEl = document.getElementById('appDrawerBackdrop');
  const modalEl = document.getElementById('customModalBackdrop');
  const overlayOpen = (drawerEl && drawerEl.classList.contains('open')) || (modalEl && modalEl.style.display === 'flex');
  const isWarn = msg.includes('⚠️') || msg.includes('🔒');
  const isUserAction = isWarn || msg.startsWith('🛒') || msg.startsWith('🏠') || msg.startsWith('💳') || msg.startsWith('🏦') || msg.startsWith('👨‍👩‍👦') || msg.startsWith('🎓') || msg.startsWith('🏆') || msg.startsWith('🏪') || msg.startsWith('🎮') || msg.startsWith('💸') || msg.startsWith('🔧') || msg.startsWith('🌬️') || msg.startsWith('🌐') || msg.startsWith('🧱') || msg.startsWith('🖥️') || msg.startsWith('⚡') || msg.startsWith('⛽') || msg.startsWith('💧') || msg.startsWith('💍') || msg.startsWith('👶') || msg.startsWith('👑') || msg.startsWith('💕') || msg.startsWith('🏥') || msg.startsWith('🚕') || msg.startsWith('🏫') || msg.startsWith('🪙');
  if (isWarn || (overlayOpen && isUserAction)) {
    showFloatingToast(msg, isWarn ? 'warn' : 'ok');
  }

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

function showCustomModal(title, body, footer) {
  document.getElementById('customModalTitle').innerHTML = title;
  document.getElementById('customModalBody').innerHTML = body;
  document.getElementById('customModalFooter').innerHTML = footer || `<button type="button" onclick="closeCustomModal()">Tutup</button>`;
  document.getElementById('customModalBackdrop').style.display = 'flex';
}
function closeCustomModal() { document.getElementById('customModalBackdrop').style.display = 'none'; }

// ==================== SIMULASI WAKTU PER DETIK & PER MENIT ====================
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

// Dipanggil setiap 10 detik waktu game (6x per menit game) agar argo Billing Meter & Update Patch berjalan per detik dengan mulus!
function stepTenGameSeconds() {
  const SEC_STEP = 10;
  state.second += SEC_STEP;

  // Cek ketersediaan listrik (PLN atau Genset Otomatis)
  if (state.kwh <= 0 && state.genset.owned && state.genset.fuelLiters > 0) {
    if (!state.genset.active) {
      state.genset.active = true;
      state.plnBlackout = false;
      addLog('⛽ <b>GENSET OTOMATIS MENYALA!</b> Token PLN habis, listrik warnet otomatis di-backup Genset.');
    }
    // Konsumsi bensin genset ~0.6 Liter per jam
    state.genset.fuelLiters = Math.max(0, +(state.genset.fuelLiters - (0.6 / 360)).toFixed(4));
    if (state.genset.fuelLiters <= 0) {
      state.genset.active = false;
      state.plnBlackout = true;
      addLog('⚠️ <b>BENSIN GENSET & TOKEN PLN HABIS!</b> Semua PC warnet mati. Segera isi Token PLN atau Bensin Genset!');
    }
  } else if (state.kwh > 0) {
    state.genset.active = false;
    state.plnBlackout = false;
  } else {
    state.plnBlackout = true;
  }

  const powerOk = isPowerAvailable();
  const plan = getInternetPlan();
  const srv = SERVER_LEVELS[state.serverLevel - 1] || SERVER_LEVELS[0];
  // Kecepatan download patch (MB per 10 detik game) berdasarkan Mbps Internet & PC Server Kasir
  const patchMbPerStep = +(plan.mbps * 0.45 * srv.patchSpeedMult).toFixed(1);

  state.slots.forEach(s => {
    // 1. Proses Update Patch Game pada PC
    if (s.updatingPatch && powerOk) {
      s.patchDoneMb = Math.min(s.patchTotalMb, +(s.patchDoneMb + patchMbPerStep).toFixed(1));
      if (s.patchDoneMb >= s.patchTotalMb) {
        const gId = s.updatingGameId;
        s.updatingPatch = false;
        s.patchDoneMb = 0;
        if (gId && state.pendingGamePatches[gId]) {
          delete state.pendingGamePatches[gId];
        }
        addLog(`✅ <b>${s.name}</b> selesai update patch <b>${s.updatingGameTitle}</b>!`);
      }
      return;
    }

    // 2. Proses Billing PC / PS yang Sedang Online (Per Detik!)
    if (!s.occupied) return;
    if (!powerOk) {
      s.occupied = false;
      return;
    }

    if (s.billingMode === 'paket') {
      s.secondsLeft = Math.max(0, (s.secondsLeft || 0) - SEC_STEP);
      // Peluang tambah jam dipengaruhi Cuaca Hujan, Kenyamanan Kursi/Monitor/AC, SSD & Kecepatan Internet!
      const comfortBonusChance = Math.min(0.25, getSlotComfortScore(s) * 0.0025);
      const ssdBonus = (s.storage && s.storage.sizeGb >= 1000) ? 0.08 : 0;
      const ispBonus = plan.mbps >= 20 ? 0.08 : 0;
      const extChance = (state.weather === 'hujan' ? 0.48 : 0.24) + comfortBonusChance + ssdBonus + ispBonus;
      if (s.secondsLeft <= 60 && s.secondsLeft > 0 && state.rentalOpen && Math.random() < extChance) {
        const extPkt = state.customPackages[0] || { name: 'Paket 1 Jam', hours: 1, price: state.billingHourlyRate };
        const extPrice = Math.max(extPkt.price, getSlotHourlyRate(s));
        s.secondsLeft += extPkt.hours * 3600;
        s.totalSecondsBooked += extPkt.hours * 3600;
        s.packagePrice += extPrice;
        addRevenueToWarnet(extPrice, 'billing');
        playSfx('cash');
        addLog(`⏱️ <b>${s.customerName}</b> betah &amp; tambah waktu (${extPkt.name}${state.weather === 'hujan' ? ' • 🌧️ Hujan' : ''}) di <b>${s.name}</b>: <b style="color:var(--green)">+${fmtRp(extPrice)}</b>.`);
      }
      if (s.secondsLeft <= 0) {
        s.occupied = false;
        s.partyTag = '';
        const dirtLoss = (state.facilities && state.facilities.fac_exhaust) ? 0.25 : 0.5;
        state.cleanliness = Math.max(0, +(state.cleanliness - dirtLoss).toFixed(1));
      }
    } else {
      // Mode Billing Meter: Detik & Rupiah Naik Terus, Bayar Saat Selesai!
      s.elapsedSeconds = (s.elapsedSeconds || 0) + SEC_STEP;
      if (s.elapsedSeconds >= (s.targetMeterSeconds || 3600)) {
        const totalBill = Math.max(500, Math.round((s.elapsedSeconds / 3600) * (s.hourlyRate || getSlotHourlyRate(s))));
        // Risiko bocil kabur belum bayar Billing Meter jika belum pasang CCTV!
        if (!(state.facilities && state.facilities.fac_cctv) && Math.random() < 0.03) {
          addLog(`🏃‍♂️💨 <b>BOCIL KABUR!</b> Pelanggan <b>${s.customerName}</b> di <b>${s.name}</b> kabur belum bayar Billing Meter (${fmtRp(totalBill)})! Pasang <b>CCTV Keamanan</b> agar tidak kebobolan!`);
        } else {
          addRevenueToWarnet(totalBill, 'billing');
          playSfx('cash');
          addLog(`💳 <b>${s.customerName}</b> selesai Billing Meter di <b>${s.name}</b> (${Math.round(s.elapsedSeconds / 60)} mnt): <b style="color:var(--green)">+${fmtRp(totalBill)}</b>.`);
        }
        s.occupied = false;
        s.elapsedSeconds = 0;
        s.partyTag = '';
        const dirtLoss = (state.facilities && state.facilities.fac_exhaust) ? 0.25 : 0.5;
        state.cleanliness = Math.max(0, +(state.cleanliness - dirtLoss).toFixed(1));
      }
    }
  });

  if (state.second >= 60) {
    state.second = 0;
    stepOneGameMinute();
  }
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

  // 1. Konsumsi Listrik PLN per menit & Cek Beban Daya Meteran PLN (MCB Jeglek jika kelebihan beban Watt!)
  const totalWatt = getCurrentActiveWatts();
  const meterObj = getPlnMeterObj();
  if (!state.genset.active && state.kwh > 0 && totalWatt > meterObj.maxWatts) {
    // MCB PLN Jeglek karena daya VA kurang! Matikan 1-2 PC yang baru menyala
    const activeSlots = state.slots.filter(s => s.occupied);
    if (activeSlots.length > 0) {
      const victim = activeSlots[activeSlots.length - 1];
      victim.occupied = false;
      addLog(`🔌 <b>MCB LISTRIK JEGLEK!</b> Beban daya warnet (<b>${totalWatt}W</b>) melebihi batas <b>${meterObj.name} (${meterObj.maxWatts}W)</b>! Upgrade Daya Meteran PLN di tab <b>⚡ PLN/Genset</b>!`);
    }
  }
  if (state.kwh > 0) {
    const kwhUsed = (totalWatt / 1000) / 60;
    state.kwh = Math.max(0, +(state.kwh - kwhUsed).toFixed(4));
  }

  // 1.5 Efek Lag Internet jika jumlah PC Online melampaui kapasitas paket internet murah!
  const curPing = getCurrentPingMs();
  if (curPing > 135 && Math.random() < 0.03) {
    const onlineGamers = state.slots.filter(s => s.occupied && s.unitType !== 'ps');
    if (onlineGamers.length > 0) {
      const gSlot = onlineGamers[Math.floor(Math.random() * onlineGamers.length)];
      addLog(`📶 <b>PING LAG (${curPing}ms)!</b> Pelanggan di <b>${gSlot.name}</b> mengeluh patah-patah/DC karena bandwidth internet kurang. Upgrade paket Mbps di tab <b>🌐 Game/ISP</b>!`);
    }
  }

  // 2. Penurunan ketahanan Mouse/KB/Headset, Suhu/Debu PC, Pembelian Pop Mie/Indomie, Print Tugas, Voucher Game & MP3
  state.slots.forEach(s => {
    if (!s.occupied) {
      s.tempC = Math.max(36, (s.tempC || 40) - 1);
      return;
    }
    // Simulasi Debu & Suhu PC
    if (s.unitType !== 'ps') {
      s.dustPct = Math.min(100, +((s.dustPct || 0) + 0.03).toFixed(2));
      const coolCut = s.cooling ? (s.cooling.type === 'ac' ? 18 : 9) : 0;
      const ocHeat = s.overclocked ? 12 : 0;
      const targetTemp = 54 + Math.round((s.dustPct || 0) * 0.35) + ocHeat - coolCut;
      s.tempC = Math.round(((s.tempC || 45) * 0.85) + (targetTemp * 0.15));
      if (s.tempC > 88 && Math.random() < 0.008) {
        addLog(`🌡️ <b>OVERHEAT (${s.tempC}°C)!</b> <b>${s.name}</b> kepanasan &amp; FPS drop karena berdebu (${Math.round(s.dustPct)}%). Pasang Kipas/AC atau semprot Kompresor &amp; Pasta Thermal!`);
      }
    }

    if (s.unitType !== 'ps' && s.gear && Math.random() < 0.04) {
      const wear = s.overclocked ? 0.6 : 0.45;
      s.gear.durability = Math.max(0, +(s.gear.durability - wear).toFixed(1));
      if (s.gear.durability <= 0) {
        state.cashierGearBroken++;
        s.gear = null;
        s.occupied = false;
        addLog(`🖱️ Mouse/Keyboard/Headset di <b>${s.name}</b> RUSAK (0%) dan masuk ke stok servis Kasir!`);
        const staffOn = state.employees.find(e => isEmployeeOnDuty(e) && (e.tasks.includes('service') || e.tasks.includes('guard')));
        if (staffOn) {
          if ((state.cashierGearMech || 0) > 0) {
            state.cashierGearMech--;
            s.gear = { name: 'Set Mechanical RGB', quality: 'mech', durability: 220, maxDurability: 220 };
            addLog(`🔧 <b>${staffOn.name}</b> langsung memasang cadangan Mechanical RGB ke <b>${s.name}</b>!`);
          } else if (state.cashierGearNew > 0) {
            state.cashierGearNew--;
            s.gear = { name: 'Set Gear Baru', quality: 'new', durability: 100, maxDurability: 100 };
            addLog(`🔧 <b>${staffOn.name}</b> langsung memasang cadangan Gear Baru ke <b>${s.name}</b>!`);
          } else if (state.cashierGearServiced > 0) {
            state.cashierGearServiced--;
            s.gear = { name: 'Set Gear Servis', quality: 'serviced', durability: 65, maxDurability: 65 };
            addLog(`🔧 <b>${staffOn.name}</b> langsung memasang cadangan Gear Servis ke <b>${s.name}</b>!`);
          }
        }
      }
    }
    const snackChance = (state.facilities && state.facilities.fac_dispenser) ? 0.014 : 0.01;
    if (Math.random() < snackChance) {
      tryCustomerBuyPopMieOrDrink(s);
    }
    // Jasa Print Tugas/Skripsi jika punya Printer & stok HVS+Tinta
    if (state.facilities && state.facilities.fac_printer && (state.snackStockPcs['sup_hvs_tinta'] || 0) > 0 && Math.random() < 0.005) {
      state.snackStockPcs['sup_hvs_tinta']--;
      const printPay = getPriceFrom2010(3500);
      addRevenueToWarnet(printPay, 'extra');
      playSfx('cash');
      addLog(`🖨️ <b>${s.customerName}</b> nge-print tugas/skripsi di Kasir: <b style="color:var(--green)">+${fmtRp(printPay)}</b>.`);
    }
    // Penjualan Voucher Game Online Fisik (G-Cash / Megaxus / Steam Wallet)
    if ((state.snackStockPcs['sup_voucher_game'] || 0) > 0 && Math.random() < 0.0045) {
      state.snackStockPcs['sup_voucher_game']--;
      const vPay = getPriceFrom2010(12000);
      addRevenueToWarnet(vPay, 'extra');
      playSfx('cash');
      addLog(`💎 <b>${s.customerName}</b> beli Voucher Game Online (G-Cash/Steam): <b style="color:var(--green)">+${fmtRp(vPay)}</b>.`);
    }
    // Jasa Isi Lagu MP3 / Film ke HP & Flashdisk
    if (state.facilities && state.facilities.fac_mp3_booth && Math.random() < 0.003) {
      const mp3Pay = getPriceFrom2010(5000);
      addRevenueToWarnet(mp3Pay, 'extra');
      playSfx('cash');
      addLog(`💿 <b>${s.customerName}</b> minta isi lagu MP3/Film ke Flashdisk: <b style="color:var(--green)">+${fmtRp(mp3Pay)}</b>.`);
    }
    // Risiko virus flashdisk tamu jika belum pasang Deep Freeze
    if (s.unitType !== 'ps' && !(state.facilities && state.facilities.fac_deepfreeze) && Math.random() < 0.0012) {
      s.occupied = false;
      addLog(`🦠 <b>${s.name}</b> terkena virus flashdisk tamu &amp; Blue Screen! Pasang <b>Deep Freeze</b> di menu Rakit/Server agar aman.`);
    }
  });

  // Celotehan khas anak warnet sesekali di log
  if (state.rentalOpen && Math.random() < 0.006 && typeof WARNET_CHAT_BUBBLES !== 'undefined') {
    const activeGuests = state.slots.filter(s => s.occupied);
    if (activeGuests.length > 0) {
      const g = activeGuests[Math.floor(Math.random() * activeGuests.length)];
      const msg = WARNET_CHAT_BUBBLES[Math.floor(Math.random() * WARNET_CHAT_BUBBLES.length)];
      addLog(`<b>[${g.customerName} - ${g.name}]</b> ${msg}`);
    }
  }

  // 2.5 Penurunan Energi / Stamina (Full 100% = 36 jam). Otomatis tidur jika <= 20% dan ada karyawan jaga atau warnet tutup!
  if (state.player.energy === undefined) state.player.energy = 100;
  const drainPerMin = state.player.isSick ? 0.08 : 0.0463;
  state.player.energy = Math.max(0, +(state.player.energy - drainPerMin).toFixed(2));
  const guardNow = getCurrentGuardStatus();
  if (state.player.energy <= 20 && !state.player.isSick && (guardNow.byEmployee || !state.rentalOpen)) {
    state.player.energy = 100;
    addLog(`😴 Stamina menyentuh 20% — Kamu otomatis tidur/istirahat (${guardNow.byEmployee ? 'warnet dijaga karyawan' : 'warnet sedang tutup'}). Stamina kembali <b>100%</b>!`);
  } else if (state.player.energy < 8 && !state.player.isSick && Math.random() < 0.004) {
    const ills = ['Tipes / Demam Tinggi', 'Maag Akut & Kelelahan', 'ISPA'];
    state.player.isSick = true;
    state.player.sickName = ills[Math.floor(Math.random() * ills.length)];
    addLog(`🤒 <b>KAMU JATUH SAKIT (${state.player.sickName})</b> karena jaga sendirian tanpa tidur! Segera berobat ke Rumah Sakit di tab Hidup!`);
  }

  state.employees.forEach(emp => {
    if (!isEmployeeOnDuty(emp)) return;
    if (emp.tasks.includes('clean') && state.cleanliness < 100) {
      state.cleanliness = Math.min(100, +(state.cleanliness + 0.4).toFixed(1));
    }
    if (emp.tasks.includes('service') && Math.random() < 0.05) {
      autoEmployeeServiceGear(emp.name);
      // Teknisi juga otomatis membersihkan debu PC sedikit demi sedikit
      state.slots.forEach(s => { if (s.dustPct > 0) s.dustPct = Math.max(0, +(s.dustPct - 4).toFixed(1)); });
    }
  });

  // Jika warnet sedang TUTUP dan ada jadwal patch game online yang belum di-update, otomatis jalankan update di PC!
  if (!state.rentalOpen && Object.keys(state.pendingGamePatches).length > 0) {
    triggerManualPatchAll(true);
  }

  // 4. Masukkan Pelanggan dari Ruang Tunggu ke PC Kosong
  const guard = getCurrentGuardStatus();
  if (guard.hasGuard && state.waitingQueue.length > 0 && isPowerAvailable()) {
    for (let i = 0; i < state.slots.length && state.waitingQueue.length > 0; i++) {
      const sl = state.slots[i];
      if (!sl.occupied && isSlotReadyToPlay(sl).ok) {
        const guest = state.waitingQueue.shift();
        seatCustomerAtPc(sl, guest);
      }
    }
  }

  // 5. Kedatangan Pelanggan Baru / Party Mabar (Dipengaruhi Rating Bintang, Kecepatan Internet Mbps, Neon Box, Member, Happy Hour & Paket Malam Begadang)
  const isNightHours = (state.hour >= 22 || state.hour < 6);
  const canSpawnThisHour = (state.hour >= 8 && state.hour <= 23) || (state.nightPackageActive && isNightHours);
  if (state.rentalOpen && canSpawnThisHour && isPowerAvailable()) {
    const isHol = !!getHolidayName(state.year, state.month, state.day) || state.dayOfWeek === 0 || state.dayOfWeek === 6;
    const cleanFactor = Math.max(0.25, state.cleanliness / 100);
    const neonMult = (state.facilities && state.facilities.fac_neonbox) ? 1.3 : 1.0;
    const hhMult = (state.happyHourActive && state.hour >= 8 && state.hour < 12) ? 1.45 : 1.0;
    const nightMult = (state.nightPackageActive && isNightHours) ? 1.5 : 1.0;
    const memberMult = 1 + Math.min(0.5, ((state.members && state.members.count) || 0) * 0.015);
    const plan = getInternetPlan();
    const ispMult = 1 + ((plan.appealBonusPct || 0) / 100);
    const starMult = 0.7 + (getWarnetStarRating() * 0.14);
    const spawnChance = 0.065 * (isHol ? 1.5 : 1.0) * cleanFactor * neonMult * hhMult * nightMult * memberMult * ispMult * starMult;
    if (Math.random() < spawnChance && state.waitingQueue.length < 12) {
      // Peluang tamu daftar jadi Member Baru & setor deposit saldo di muka!
      if (Math.random() < 0.09) {
        state.members = state.members || { count: 0, discountPct: 10 };
        state.members.count++;
        const dep = getPriceFrom2010(50000);
        addRevenueToWarnet(dep, 'extra');
        playSfx('cash');
        addLog(`💳 Pelanggan mendaftar jadi <b>Member VIP Warnet #${state.members.count}</b> &amp; setor deposit <b style="color:var(--green)">+${fmtRp(dep)}</b>!`);
      }
      const mabarChance = Math.min(0.45, 0.20 + ((plan.appealBonusPct || 0) * 0.002));
      if (Math.random() < mabarChance) spawnMabarParty();
      else spawnSingleCustomer();
    }
  }
}

const GUEST_NAMES = ['Budi', 'Rizky', 'Fajar', 'Deni', 'Agus', 'Hendra', 'Wahyu', 'Ilham', 'Tono', 'Bayu', 'Dimas', 'Reza', 'Aldi', 'Yudi', 'Rian', 'Eko', 'Kevin', 'Putra', 'gilang', 'Dani'];

function pickActivityForPc(slot) {
  if (slot && slot.unitType === 'ps' && slot.psConsole) {
    return slot.psConsole.defaultGame || '🎮 Main Rental PlayStation';
  }
  const tier = getPcTier(slot);
  const pcGames = Array.isArray(slot.installedGames) ? slot.installedGames : [];
  if (pcGames.length === 0 || Math.random() < 0.25) {
    const acts = NON_GAME_ACTIVITIES.filter(a => a.minYear <= state.year);
    const chosen = acts[Math.floor(Math.random() * acts.length)] || NON_GAME_ACTIVITIES[0];
    return chosen.title;
  }
  const playable = GAME_DISC_CATALOG.filter(g =>
    pcGames.includes(g.id) &&
    isEraUnlocked(g.releaseYear) &&
    g.minTier <= tier &&
    !state.pendingGamePatches[g.id]
  );
  if (playable.length > 0) {
    // Prioritaskan game dengan Tier tertinggi yang terpasang di PC tersebut!
    playable.sort((a, b) => b.minTier - a.minTier);
    const topPool = playable.slice(0, Math.min(4, playable.length));
    const g = topPool[Math.floor(Math.random() * topPool.length)];
    return `🎮 ${g.title}`;
  }
  return '📘 Buka Facebook & YouTube';
}

function spawnSingleCustomer() {
  const gName = GUEST_NAMES[Math.floor(Math.random() * GUEST_NAMES.length)];
  const usePaket = Math.random() < 0.58 && state.customPackages.length > 0;
  const guest = {
    id: 'g_' + Date.now() + '_' + Math.floor(Math.random() * 999),
    name: gName,
    billingMode: usePaket ? 'paket' : 'meter',
    partyTag: '',
    forcedActivity: ''
  };
  const guard = getCurrentGuardStatus();
  const readySlots = state.slots.filter(s => !s.occupied && isSlotReadyToPlay(s).ok);
  if (guard.hasGuard && readySlots.length > 0) {
    const chosen = readySlots[Math.floor(Math.random() * readySlots.length)];
    seatCustomerAtPc(chosen, guest);
  } else {
    state.waitingQueue.push(guest);
  }
}

// Party Mabar (3 s/d 8 Orang duduk di PC berdekatan main Dragon Nest INA, Point Blank, Lost Saga, Dota, dll!)
function spawnMabarParty() {
  const guard = getCurrentGuardStatus();
  if (!guard.hasGuard) return;
  const readySlots = state.slots.filter(s => !s.occupied && isSlotReadyToPlay(s).ok);
  if (readySlots.length < 3) return spawnSingleCustomer();

  const partySize = Math.min(readySlots.length, [3, 4, 5, 6, 8][Math.floor(Math.random() * 5)]);
  const mabarGames = GAME_DISC_CATALOG.filter(g =>
    state.installedGames[g.id] && g.canPartyMabar && isEraUnlocked(g.releaseYear) && !state.pendingGamePatches[g.id]
  );
  const chosenGame = mabarGames.length > 0
    ? mabarGames[Math.floor(Math.random() * mabarGames.length)].title
    : 'Dragon Nest INA / Point Blank';

  // Pilih PC yang nomornya berurutan/berdekatan
  const selectedSlots = readySlots.slice(0, partySize);
  selectedSlots.forEach((sl, idx) => {
    const gName = GUEST_NAMES[(idx * 3 + Math.floor(Math.random() * 10)) % GUEST_NAMES.length];
    seatCustomerAtPc(sl, {
      id: 'pty_' + Date.now() + '_' + idx,
      name: gName,
      billingMode: 'paket',
      partyTag: `Party ${partySize}P`,
      forcedActivity: sl.unitType === 'ps' ? (sl.psConsole ? sl.psConsole.defaultGame : '🎮 Main PS') : `🎮 ${chosenGame}`
    }, true);
  });
  addLog(`🔥 <b>ROMBONGAN MABAR (${partySize} Orang)</b> duduk berdekatan di <b>${selectedSlots.map(s => '#' + s.id).join(', ')}</b> main <b>${chosenGame}</b>!`);
}

function seatCustomerAtPc(slot, guest, silentLog = false) {
  let rate = getSlotHourlyRate(slot);
  // Diskon Happy Hour Pagi (08:00 - 12:00) atau Diskon Khusus Member VIP
  const isMember = (state.members && state.members.count > 0 && Math.random() < 0.35);
  const discPct = isMember ? (state.members.discountPct || 10) : ((state.happyHourActive && state.hour >= 8 && state.hour < 12) ? 20 : 0);
  if (discPct > 0) rate = roundTo500(rate * (1 - discPct / 100));

  slot.occupied = true;
  slot.customerName = guest.name + (isMember ? ' ⭐' : '');
  slot.partyTag = guest.partyTag || '';
  slot.activityLabel = guest.forcedActivity || pickActivityForPc(slot);
  slot.hourlyRate = rate;
  slot.snackBill = 0;

  if (guest.billingMode === 'paket' && state.customPackages.length > 0) {
    const isNight = (state.hour >= 22 || state.hour < 5) && state.nightPackageActive;
    const pkt = isNight
      ? (state.customPackages[state.customPackages.length - 1] || state.customPackages[0])
      : state.customPackages[Math.floor(Math.random() * state.customPackages.length)];
    // Harga paket otomatis menyesuaikan bonus spek PC/PS, monitor, kursi, AC & internet!
    const specAddonPerHr = Math.max(0, rate - (Number(state.billingHourlyRate) || 3000));
    let totalPay = pkt.price + Math.round(pkt.hours * specAddonPerHr * 0.85);
    if (discPct > 0) totalPay = roundTo500(totalPay * (1 - discPct / 100));
    slot.billingMode = 'paket';
    slot.packageName = pkt.name;
    slot.packagePrice = totalPay;
    slot.totalSecondsBooked = pkt.hours * 3600;
    slot.secondsLeft = pkt.hours * 3600;
    addRevenueToWarnet(totalPay, 'billing');
    playSfx('cash');
    if (!silentLog) {
      addLog(`📦 <b>${slot.customerName}</b> beli <b>${pkt.name}</b> di <b>${slot.name}</b> (${slot.activityLabel}): <b style="color:var(--green)">+${fmtRp(totalPay)}</b>.`);
    }
  } else {
    const targetHours = [1, 1.5, 2, 3][Math.floor(Math.random() * 4)];
    slot.billingMode = 'meter';
    slot.elapsedSeconds = 0;
    slot.targetMeterSeconds = Math.round(targetHours * 3600);
    if (!silentLog) {
      addLog(`⏱️ <b>${slot.customerName}</b> mulai <b>Billing Meter</b> di <b>${slot.name}</b> (${slot.activityLabel} • Tarif ${fmtRp(rate)}/jam).`);
    }
  }
}

function tryCustomerBuyPopMieOrDrink(slot) {
  const buyerName = slot ? (slot.customerName || slot.name) : 'Tamu';
  const avail = WARNET_SUPPLY_CATALOG.filter(item => {
    if (item.kind !== 'snack') return false;
    if (item.requiresFacility && !(state.facilities && state.facilities[item.requiresFacility])) return false;
    if ((state.snackStockPcs[item.id] || 0) <= 0) return false;
    if (item.needsWater && state.waterGallonServings <= 0) return false;
    return true;
  });
  if (avail.length === 0) {
    if (state.waterGallonServings <= 0 && Math.random() < 0.25) {
      addLog('💧 <b>AIR GALON HABIS!</b> Pelanggan batal beli Pop Mie/Indomie/Kopi karena air galon 0. Segera beli Galon Air 19L!');
    }
    return;
  }
  const chosen = avail[Math.floor(Math.random() * avail.length)];
  state.snackStockPcs[chosen.id]--;
  if (chosen.needsWater) state.waterGallonServings = Math.max(0, state.waterGallonServings - 1);
  let price = getPriceFrom2010(chosen.sellPcs2010);
  // Jika sudah punya Kulkas Showcase Minuman Dingin, harga jual minuman naik +35%!
  if (!chosen.needsWater && state.facilities && state.facilities.fac_showcase) {
    price = roundTo500(price * 1.35);
  }
  if (slot) slot.snackBill = (slot.snackBill || 0) + price;
  addRevenueToWarnet(price, 'snack');
  const dirtLoss = (state.facilities && state.facilities.fac_exhaust) ? 0.2 : 0.4;
  state.cleanliness = Math.max(0, +(state.cleanliness - dirtLoss).toFixed(1));
  playSfx('cash');
  addLog(`🍜 <b>${buyerName}</b> (${slot ? slot.name : 'Kasir'}) pesan <b>${chosen.name.split('(')[0]}</b>: <b style="color:var(--green)">+${fmtRp(price)}</b>.`);
}

function autoEmployeeServiceGear(empName) {
  if (state.cashierGearBroken <= 0) return;
  state.cashierGearBroken--;
  state.cashierGearServiced++;
  addLog(`🔧 Teknisi <b>${empName}</b> selesai menyervis 1 set Mouse+KB+Headset (Ketahanan 65%).`);
  const needSlot = state.slots.find(s => s.unitType !== 'ps' && s.cpu && (!s.gear || s.gear.durability <= 0));
  if (needSlot && state.cashierGearServiced > 0) {
    state.cashierGearServiced--;
    needSlot.gear = { name: 'Set Gear Servis', quality: 'serviced', durability: 65, maxDurability: 65 };
    addLog(`🖱️ <b>${empName}</b> otomatis memasang Set Gear hasil servis ke <b>${needSlot.name}</b>.`);
  }
}

function onHourPassed() {
  // 1. Cek Jam Buka & Jam Tutup Warnet Otomatis (Jika Paket Begadang Malam aktif, tetap buka 24 jam!)
  const oh = Number(state.openHour ?? 8);
  const ch = state.nightPackageActive ? 24 : Number(state.closeHour ?? 23);
  if (state.hour === oh && !state.rentalOpen) {
    state.rentalOpen = true;
    addLog(`🟢 <b>WARNET BUKA OTOMATIS</b> (Jam ${String(oh).padStart(2, '0')}:00)!`);
  }
  if (state.hour === ch && ch !== 24 && state.rentalOpen) {
    state.rentalOpen = false;
    state.waitingQueue = [];
    addLog(`🔴 <b>WARNET TUTUP OTOMATIS</b> (Jam ${String(ch).padStart(2, '0')}:00). Menunggu tamu aktif selesai & update game.`);
    triggerManualPatchAll(true);
  }

  // 2. Cek Pergantian / Selesai Shift Karyawan ATAU Jam Tutup Warnet -> Uang Laci Kasir Otomatis Pindah ke DOMPET!
  let shiftEnded = (state.hour === ch && ch !== 24) || (state.nightPackageActive && state.hour === 23);
  (state.employees || []).forEach(emp => {
    const start = Number(emp.startHour) || 8;
    const end = (start + (Number(emp.durationHours) || 8)) % 24;
    if (state.hour === end) shiftEnded = true;
  });
  if (shiftEnded && state.laciCash > 0) {
    const moved = state.laciCash;
    state.handWallet += moved;
    state.laciCash = 0;
    addLog(`👛 <b>Ganti Shift / Setor Kasir:</b> Uang di Laci (<b>${fmtRp(moved)}</b>) masuk ke <b>Dompetmu</b>!`);
  }

  if (state.hour === 7 && isPlayerAtSchool()) {
    const pocket = getPriceFrom2010(15000);
    state.handWallet += pocket;
    addLog(`🎒 Kamu berangkat sekolah (07:00–13:00). Dapat uang jajan <b style="color:var(--green)">+${fmtRp(pocket)}</b> ke Dompet.`);
  }
  if (state.hour === 23 && Math.random() < 0.45) {
    const onlineInstalled = GAME_DISC_CATALOG.filter(g => g.type === 'online' && state.installedGames[g.id] && isEraUnlocked(g.releaseYear));
    if (onlineInstalled.length > 0) {
      const g = onlineInstalled[Math.floor(Math.random() * onlineInstalled.length)];
      state.pendingGamePatches[g.id] = g.patchMb || 250;
      addLog(`🔄 <b>JADWAL UPDATE GAME:</b> <b>${g.title}</b> merilis Patch baru (<b>${g.patchMb} MB</b>).`);
    }
  }

  // 3. Perubahan Cuaca Dinamis & Risiko Petir jika belum pasang Stabilizer
  if (state.hour % 6 === 0) {
    const wList = ['cerah', 'cerah', 'panas', 'hujan'];
    state.weather = wList[Math.floor(Math.random() * wList.length)];
    if (state.weather === 'hujan' && !(state.facilities && state.facilities.fac_stabilizer) && Math.random() < 0.15) {
      addLog('⚡ <b>PETIR MENYAMBAR SAAT HUJAN DERAS!</b> Listrik sempat lonjak. Pasang <b>Stabilizer &amp; Penangkal Petir</b> di menu Rakit/Server agar PC tidak rusak!');
    }
  }

  // 4. Hitung Jam Lembur Karyawan yang masih standby update patch setelah warnet tutup
  if (!state.rentalOpen && state.slots.some(s => s.updatingPatch)) {
    (state.employees || []).forEach(emp => {
      if (emp.tasks.includes('service') || emp.tasks.includes('guard')) {
        emp.overtimeHours = (emp.overtimeHours || 0) + 1;
      }
    });
  }
}

function onDayPassed() {
  state.totalDays++;
  state.day++;
  if (state.day > getDaysInMonth(state.year, state.month)) {
    state.day = 1;
    state.month++;
    onMonthPassed();
  }
  if (state.month > 12) {
    state.month = 1;
    state.year++;
    addLog(`🎆 <b>TAHUN BARU ${state.year}!</b> Kurs USD kini Rp ${getUsdRate(state.year).toLocaleString('id-ID')}. Komponen PC & Game baru tersedia!`);
  }
  state.dayOfWeek = computeDayOfWeek(state.year, state.month, state.day);

  if (state.day === state.player.birthDay && state.month === state.player.birthMonth) {
    state.player.age++;
    addLog(`🎂 <b>Selamat Ulang Tahun!</b> Usiamu kini <b>${state.player.age} tahun</b>.`);
  }
  (state.player.childrenList || []).forEach(ch => {
    if (state.day === (ch.birthDay || 1) && state.month === (ch.birthMonth || 1)) ch.age++;
  });

  // Biaya hidup & makan variatif harian (dipotong dari DOMPET)
  const menuHarian = [
    ['Nasi Goreng + Es Teh', 18000],
    ['Warteg Lengkap + Kopi', 24000],
    ['Ayam Geprek + Es Jeruk', 28000],
    ['Bakso + Mie Ayam + Minum', 32000],
    ['Nasi Padang Rendang + Jus', 42000]
  ];
  const [mName, mBase] = menuHarian[Math.floor(Math.random() * menuHarian.length)];
  const mealCost = getPriceFrom2010(mBase);
  if (state.handWallet >= mealCost) {
    state.handWallet -= mealCost;
    addLog(`🍛 Kebutuhan harian (<b>${mName}</b>): <b>-${fmtRp(mealCost)}</b> dari Dompet.`);
  } else if (deductFromAnyCash(mealCost)) {
    addLog(`🍛 Kebutuhan harian (<b>${mName}</b>): <b>-${fmtRp(mealCost)}</b>.`);
  }

  // Pemasukan Pasif Harian Voucher WiFi Hotspot sesuai Kecepatan Paket Internet Mbps!
  if (state.facilities && state.facilities.fac_wifi_router) {
    const plan = getInternetPlan();
    const baseWifi = plan.wifiDaily2010 || 25000;
    const wifiIncome = getPriceFrom2010(baseWifi + Math.floor(Math.random() * 15000));
    addRevenueToWarnet(wifiIncome, 'extra');
    addLog(`📶 Penjualan Voucher WiFi Hotspot (${plan.mbps} Mbps) hari ini: <b style="color:var(--green)">+${fmtRp(wifiIncome)}</b>.`);
  }

  // Pemasukan Pasif Harian dari Mobil yang Disewakan Jadi Travel / Kargo Angkutan Barang!
  (state.ownedVehicles || []).forEach(v => {
    if (v.rentedOut && (v.commercialDaily2010 || 85000) > 0) {
      const rentInc = getPriceFrom2010(v.commercialDaily2010 || 85000);
      state.personalBank += rentInc;
      state.financeStats = state.financeStats || { revBilling: 0, revSnack: 0, revExtra: 0, expPower: 0, expSalary: 0, expLoan: 0 };
      state.financeStats.revExtra += rentInc;
      v.oilPct = Math.max(10, (v.oilPct ?? 100) - 1.5);
      v.engineCond = Math.max(25, (v.engineCond ?? 100) - 0.8);
      addLog(`🚕 Setoran harian sewa angkutan/travel <b>${v.name}</b>: <b style="color:var(--green)">+${fmtRp(rentInc)}</b> masuk ke Bank!`);
    }
  });

  // Pemasukan Pasif Harian dari Cabang ke-2 (Franchise Warnet iCafe & Cabang Rental PS VIP)
  if (state.branches && state.branches.warnetOwned) {
    const brInc = getPriceFrom2010(380000 + Math.floor(Math.random() * 120000));
    state.personalBank += brInc;
    state.financeStats.revExtra += brInc;
    addLog(`🏪 Setoran profit bersih <b>Cabang ke-2 Warnet iCafe</b>: <b style="color:var(--green)">+${fmtRp(brInc)}</b> masuk ke Bank.`);
  }
  if (state.branches && state.branches.psRentalOwned) {
    const psInc = getPriceFrom2010(290000 + Math.floor(Math.random() * 90000));
    state.personalBank += psInc;
    state.financeStats.revExtra += psInc;
    addLog(`🎮 Setoran profit bersih <b>Cabang Rental PlayStation VIP</b>: <b style="color:var(--green)">+${fmtRp(psInc)}</b> masuk ke Bank.`);
  }

  // Gaji Karyawan Harian & Mingguan
  state.employees.forEach(emp => {
    if (emp.payPeriod === 'daily') payEmployeeSalary(emp, 'Harian');
    else if (emp.payPeriod === 'weekly' && state.totalDays % 7 === 0) payEmployeeSalary(emp, 'Mingguan');
  });

  // Cicilan Mingguan Pinjaman Orang Tua (52x, 0% bunga)
  if (state.parentLoan.active && state.totalDays % 7 === 0) {
    const pay = Math.min(state.parentLoan.remainingTotal, state.parentLoan.weeklyInstallment);
    if (deductFromAnyCash(pay)) {
      state.parentLoan.remainingTotal -= pay;
      state.parentLoan.weeksLeft = Math.max(0, state.parentLoan.weeksLeft - 1);
      state.financeStats.expLoan += pay;
      addLog(`👨‍👩‍👦 Cicilan mingguan ke Orang Tua: <b>-${fmtRp(pay)}</b> (Sisa ${state.parentLoan.weeksLeft}x).`);
      if (state.parentLoan.remainingTotal <= 0 || state.parentLoan.weeksLeft <= 0) state.parentLoan.active = false;
    }
  }
  saveGame();
}

function onMonthPassed() {
  state.financeStats = state.financeStats || { revBilling: 0, revSnack: 0, revExtra: 0, expPower: 0, expSalary: 0, expLoan: 0 };
  // 1. Sewa Ruko atau Cicilan Beli Ruko Permanen
  if (!state.property.owned) {
    if (state.property.kprActive) {
      const kPay = Math.min(state.property.kprRemaining, state.property.kprMonthly);
      if (deductFromAnyCash(kPay)) {
        state.property.kprRemaining -= kPay;
        state.property.kprMonthsLeft = Math.max(0, state.property.kprMonthsLeft - 1);
        state.financeStats.expLoan += kPay;
        addLog(`🏠 Bayar cicilan KPR Ruko Warnet: <b>-${fmtRp(kPay)}</b> (Sisa ${state.property.kprMonthsLeft} bln).`);
        if (state.property.kprRemaining <= 0 || state.property.kprMonthsLeft <= 0) {
          state.property.kprActive = false;
          state.property.owned = true;
          addLog('🎉 <b>LUNAS!</b> Ruko Warnet kini milikmu permanen (Bebas biaya sewa selamanya)!');
        }
      }
    } else {
      const rentCost = getPriceFrom2010(1500000);
      if (deductFromAnyCash(rentCost)) {
        state.financeStats.expLoan += rentCost;
        addLog(`🏢 Bayar sewa ruko bulanan: <b>-${fmtRp(rentCost)}</b>.`);
      }
    }
  }

  // 2. Tagihan Internet Asli Speedy / IndiHome
  const ispPlan = getInternetPlan();
  const ispCost = ispPlan.monthlyReal || 295000;
  if (deductFromAnyCash(ispCost)) {
    state.financeStats.expPower += ispCost;
    addLog(`🌐 Bayar tagihan internet <b>${ispPlan.name}</b>: <b>-${fmtRp(ispCost)}</b>.`);
  }

  // 3. Biaya Sekolah SPP (jika usia < 18) + Sekolah Anak + Iuran Kebersihan/Keamanan & Pajak UMKM
  if (state.player.age < 18) {
    const spp = getPriceFrom2010(250000);
    if (deductFromAnyCash(spp)) addLog(`🎒 Bayar SPP Sekolah bulanan: <b>-${fmtRp(spp)}</b>.`);
  }
  (state.player.childrenList || []).forEach(ch => {
    if (ch.age >= 6 && ch.eliteSchool) {
      const childSpp = getPriceFrom2010(450000);
      if (deductFromAnyCash(childSpp)) {
        ch.skillBonus = (ch.skillBonus || 0) + 1;
        addLog(`🏫 Bayar SPP Sekolah Unggulan IT untuk <b>${ch.name}</b>: <b>-${fmtRp(childSpp)}</b>.`);
      }
    }
  });
  const rtTax = getPriceFrom2010(175000);
  const pdamBill = getPriceFrom2010(85000);
  if (deductFromAnyCash(rtTax + pdamBill)) {
    state.financeStats.expPower += (rtTax + pdamBill);
    addLog(`🧾 Tagihan Air PDAM (${fmtRp(pdamBill)}), kebersihan &amp; pajak UMKM (${fmtRp(rtTax)}): <b>-${fmtRp(rtTax + pdamBill)}</b>.`);
  }

  // 3.5 Iuran Bulanan BPJS Kesehatan Pribadi
  const bpjsObj = BPJS_TIERS.find(b => b.id === state.player.bpjsTier);
  if (bpjsObj && bpjsObj.monthly2024 > 0) {
    const bpjsCost = roundTo500(bpjsObj.monthly2024 * getEraMultiplier(state.year));
    if (deductFromAnyCash(bpjsCost)) addLog(`🏥 Bayar iuran bulanan <b>${bpjsObj.name}</b>: <b>-${fmtRp(bpjsCost)}</b>.`);
  }

  state.employees.forEach(emp => {
    if (emp.payPeriod === 'monthly') payEmployeeSalary(emp, 'Bulanan');
  });
  if (state.bankLoan.active) {
    const pay = Math.min(state.bankLoan.remainingTotal, state.bankLoan.monthlyInstallment);
    if (deductFromAnyCash(pay)) {
      state.bankLoan.remainingTotal -= pay;
      state.bankLoan.monthsLeft = Math.max(0, state.bankLoan.monthsLeft - 1);
      state.financeStats.expLoan += pay;
      if (state.bankLoan.remainingTotal <= 0 || state.bankLoan.monthsLeft <= 0) state.bankLoan.active = false;
    }
  }

  // 4. Cicilan Bulanan Motor, Mobil & Rumah/Aset
  (state.assetLoans || []).forEach(al => {
    if (!al.active) return;
    const pay = Math.min(al.remainingTotal, al.monthlyInstallment);
    if (deductFromAnyCash(pay)) {
      al.remainingTotal -= pay;
      al.monthsLeft = Math.max(0, al.monthsLeft - 1);
      state.financeStats.expLoan += pay;
      addLog(`💳 Bayar cicilan <b>${al.name}</b>: <b>-${fmtRp(pay)}</b> (Sisa ${al.monthsLeft} bln).`);
      if (al.remainingTotal <= 0 || al.monthsLeft <= 0) {
        al.active = false;
        addLog(`🎉 <b>LUNAS!</b> Cicilan <b>${al.name}</b> telah lunas sepenuhnya!`);
      }
    }
  });
}

// ATURAN KETAT: Pembelian & Tagihan TIDAK boleh mengambil dari Laci Kasir! Bisa dari Bank, Dompet, atau gabungan Bank + Dompet.
function deductFromAnyCash(amount) {
  if (state.personalBank >= amount) { state.personalBank -= amount; return true; }
  if (state.handWallet >= amount) { state.handWallet -= amount; return true; }
  if (state.personalBank + state.handWallet >= amount) {
    const rem = amount - state.personalBank;
    state.personalBank = 0;
    state.handWallet -= rem;
    return true;
  }
  const availNow = state.personalBank + state.handWallet;
  if (availNow + state.laciCash >= amount && state.laciCash > 0) {
    const msg = `⚠️ Saldo <b>Dompet + Bank</b> kurang (Butuh <b>${fmtRp(amount)}</b>, ada <b>${fmtRp(availNow)}</b>). Tapi di <b>Laci Kasir</b> ada <b>${fmtRp(state.laciCash)}</b>! <button type="button" class="amber" style="margin-left:6px;padding:2px 8px;" onclick="event.stopPropagation();pullAllLaciToWalletNow()">💸 Tarik Laci ke Dompet</button>`;
    addLog(msg);
  } else {
    const needLoanBtn = (!state.parentLoan.active && availNow < 500000)
      ? ` <button type="button" class="primary" style="margin-left:6px;padding:2px 8px;" onclick="event.stopPropagation();openDrawerTab('finance')">👨‍👩‍👦 Pinjam Modal Ortu</button>`
      : '';
    addLog(`⚠️ Saldo <b>Bank + Dompet</b> tidak cukup! Butuh <b>${fmtRp(amount)}</b> (Tersedia: <b>${fmtRp(availNow)}</b>).${needLoanBtn}`);
  }
  return false;
}

function payEmployeeSalary(emp, label) {
  const bpjsCost = emp.hasBpjs ? getPriceFrom2010(55000) : 0;
  const otHours = emp.overtimeHours || 0;
  const otPay = otHours * getPriceFrom2010(10000);
  const total = Number(emp.salaryAmount || 0) + Number(emp.incentive || 0) + otPay + (label === 'Bulanan' ? bpjsCost : 0);

  let paidOk = false;
  if (state.personalBank >= total) {
    state.personalBank -= total;
    paidOk = true;
  } else if (state.handWallet >= total) {
    state.handWallet -= total;
    paidOk = true;
  } else if (state.personalBank + state.handWallet >= total) {
    const rem = total - state.personalBank;
    state.personalBank = 0;
    state.handWallet -= rem;
    paidOk = true;
  } else if (state.personalBank + state.handWallet + state.laciCash >= total) {
    let rem = total - state.personalBank;
    state.personalBank = 0;
    const fromW = Math.min(state.handWallet, rem);
    state.handWallet -= fromW;
    rem -= fromW;
    state.laciCash -= rem;
    paidOk = true;
  }

  if (paidOk) {
    emp.totalPaidHistory = (emp.totalPaidHistory || 0) + total;
    emp.overtimeHours = 0;
    state.financeStats = state.financeStats || { revBilling: 0, revSnack: 0, revExtra: 0, expPower: 0, expSalary: 0, expLoan: 0 };
    state.financeStats.expSalary += total;
    addLog(`👷 Bayar gaji ${label} <b>${emp.name}</b>${otHours > 0 ? ` (+Lembur ${otHours}j: ${fmtRp(otPay)})` : ''}: <b>-${fmtRp(total)}</b>.`);
  } else {
    addLog(`⚠️ Kas tidak cukup untuk bayar gaji ${label} <b>${emp.name}</b> (${fmtRp(total)})!`);
  }
}

// ==================== LOOP HEMAT BATERAI & ANTI-PANAS HP (250ms TICK, BUKAN 60FPS!) ====================
function gameTick() {
  if (document.hidden || state.paused) {
    lastFrameTime = performance.now();
    return;
  }
  const now = performance.now();
  const dt = Math.min(400, Math.max(0, now - lastFrameTime));
  lastFrameTime = now;
  const spd = Number(state.speed) || 1;
  // 2x lama menjadi 1x baru (~10.4ms per 10 detik game pada 1x), sehingga 16x baru = 32x lama!
  const msPerTenSec = (125 / 12) / spd;
  tickAccumulatorMs += dt;
  let steps = 0;
  while (tickAccumulatorMs >= msPerTenSec && steps < 80) {
    tickAccumulatorMs -= msPerTenSec;
    stepTenGameSeconds();
    steps++;
  }
  if (steps > 0) {
    renderHud();
    if (typeof window.renderRoomBoard === 'function') window.renderRoomBoard(false);
  }
}

// ==================== RENDER HUD & DRAWER ====================
function renderHud() {
  const hh = String(state.hour).padStart(2, '0');
  const mm = String(state.minute).padStart(2, '0');
  const hol = getHolidayName(state.year, state.month, state.day);
  const wIcon = state.weather === 'hujan' ? '🌧️ Hujan' : (state.weather === 'panas' ? '🥵 Panas' : '☀️ Cerah');
  const star = getWarnetStarRating().toFixed(1);
  document.getElementById('hudDateTime').textContent = `${DAY_NAMES[state.dayOfWeek].slice(0, 3)}, ${state.day}/${state.month}/${state.year} • ${hh}:${mm} • ${wIcon}${hol ? ' 🔴' : ''}`;
  document.getElementById('hudCityUmr').textContent = `${getCity().name.split(' ')[0]} • ⭐${star} • $1=Rp${getUsdRate(state.year).toLocaleString('id-ID')}`;
  document.getElementById('hudPlayerBadge').textContent = `${state.player.name.split(' ')[0]} (${state.player.age}th)`;
  document.getElementById('hudLaci').textContent = fmtRp(state.laciCash);
  document.getElementById('hudHand').textContent = fmtRp(state.handWallet);
  document.getElementById('hudBank').textContent = fmtRp(state.personalBank);

  const plan = getInternetPlan();
  document.getElementById('hudPpob').textContent = `${plan.mbps}Mbps • ${getCurrentPingMs()}ms`;
  document.getElementById('hudKwh').textContent = `${state.kwh.toFixed(1)}kWh • ${getCurrentActiveWatts()}W • ⛽${state.genset.fuelLiters.toFixed(1)}L`;
  const gEl = document.getElementById('hudGalon');
  if (gEl) gEl.textContent = state.waterGallonServings;
  const qEl = document.getElementById('lblQueueCount');
  if (qEl) qEl.textContent = state.waitingQueue.length;
  document.getElementById('hudClean').textContent = `${Math.round(state.cleanliness)}%`;
  const enEl = document.getElementById('hudEnergy');
  if (enEl) {
    enEl.textContent = `${Math.round(state.player.energy ?? 100)}%${state.player.isSick ? '🤒' : ''}`;
    enEl.style.color = state.player.isSick ? '#ef4444' : (state.player.energy < 25 ? '#fbbf24' : '#4ade80');
  }

  const btnOpen = document.getElementById('btnToggleOpen');
  if (btnOpen) {
    btnOpen.className = 'hud-open-btn ' + (state.rentalOpen ? 'success' : 'danger');
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

function renderAll() {
  renderHud();
  if (typeof window.renderRoomBoard === 'function') window.renderRoomBoard(true);
  renderRightPanel();
}

function toggleRentalOpenStatus() {
  state.rentalOpen = !state.rentalOpen;
  if (!state.rentalOpen) {
    state.waitingQueue = [];
    addLog('🔴 <b>Warnet DITUTUP untuk tamu baru.</b> Tamu aktif tetap main sampai selesai & PC otomatis meng-update patch game yang tertunda!');
    triggerManualPatchAll(true);
  } else {
    addLog('🟢 <b>Warnet DIBUKA!</b> Siap menerima pelanggan & rombongan mabar.');
  }
  renderAll();
}

function manualCleanShop() {
  state.cleanliness = 100;
  playSfx('click');
  addLog('🧹 Ruangan warnet disapu & dipel bersih (100%)!');
  renderHud();
}

// ==================== PENGATURAN TARIF BILLING METER & PAKET CUSTOM + UPDATE PATCH ====================
function openBillingRateModal() {
  state.members = state.members || { count: 0, totalDeposit: 0, discountPct: 10 };
  const canQris = state.year >= 2019;
  showCustomModal(
    '⚙️ Atur Jam Buka/Tutup, Tarif Billing, Promo & QRIS',
    `<div class="grid-2">
       <div><label class="spec-line">Jam Buka Otomatis (0-23)</label><input type="number" id="inpOpenHr" value="${state.openHour ?? 8}" min="0" max="23" /></div>
       <div><label class="spec-line">Jam Tutup Otomatis (1-24, 24=Nonstop)</label><input type="number" id="inpCloseHr" value="${state.closeHour ?? 23}" min="1" max="24" /></div>
     </div>
     <div class="spec-line">Tarif Billing Meter dihitung <b>per detik nyata</b> (Misal Rp 6.000/jam = tepat 3.600 detik Rp 6.000).</div>
     <div class="grid-2">
       <div><label class="spec-line">Tarif Billing Meter / Jam (Rp)</label><input type="number" id="inpMeterRate" value="${state.billingHourlyRate}" step="500" /></div>
       <div><label class="spec-line">Tambahan Room VIP / Jam (Rp)</label><input type="number" id="inpVipBonus" value="${state.vipRateBonus}" step="500" /></div>
     </div>
     <div class="card" style="margin:6px 0;">
       <label style="display:flex;align-items:center;gap:6px;font-size:11px;cursor:pointer;">
         <input type="checkbox" id="chkHappyHour" ${state.happyHourActive ? 'checked' : ''} style="width:auto;" />
         <span>🏷️ <b>Promo Happy Hour Pagi (08:00–12:00)</b>: Diskon 20% tarif pagi, pelanggan pagi +45% lebih ramai</span>
       </label>
       <label style="display:flex;align-items:center;gap:6px;font-size:11px;cursor:pointer;margin-top:4px;">
         <input type="checkbox" id="chkNightPkg" ${state.nightPackageActive ? 'checked' : ''} style="width:auto;" />
         <span>🌙 <b>Paket Begadang / Kalong Malam (22:00–06:00 Nonstop)</b>: Warnet buka 24 jam &amp; diserbu anak begadang malam!</span>
       </label>
       <label style="display:flex;align-items:center;gap:6px;font-size:11px;cursor:pointer;margin-top:4px;">
         <input type="checkbox" id="chkQrisActive" ${state.qrisActive && canQris ? 'checked' : ''} style="width:auto;" onclick="if(${!canQris}){this.checked=false;showFloatingToast('🔒 <b>QRIS Belum Tersedia di Tahun ' + state.year + '!</b><br>Pembayaran QRIS / E-Wallet baru terbuka mulai <b>Tahun 2019+</b>.', 'warn');}" />
         <span>📱 <b>Pembayaran QRIS / E-Wallet (${canQris ? 'Tersedia' : '🔒 Terbuka Tahun 2019+'})</b>: 50% omzet otomatis langsung masuk ke Bank</span>
       </label>
       <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:6px;">
         <span class="spec-line">⭐ <b>Member Terdaftar: ${state.members.count} orang</b> • Diskon Khusus Member (%):</span>
         <input type="number" id="inpMemberDisc" value="${state.members.discountPct ?? 10}" min="0" max="35" style="width:70px;" />
       </div>
     </div>
     <b>📦 Daftar Paket Jam (Bar Menurun):</b>
     ${state.customPackages.map((p, idx) => `
       <div class="grid-3" style="align-items:center;">
         <input id="pktName_${idx}" value="${p.name}" />
         <input type="number" id="pktHrs_${idx}" value="${p.hours}" min="1" max="24" placeholder="Jam" />
         <input type="number" id="pktPrice_${idx}" value="${p.price}" step="500" placeholder="Harga Rp" />
       </div>
     `).join('')}`,
    `<button type="button" onclick="closeCustomModal()">Batal</button>
     <button type="button" class="primary" onclick="saveBillingRateConfig()">💾 Simpan Tarif & Paket</button>`
  );
}

function saveBillingRateConfig() {
  state.openHour = Math.max(0, Math.min(23, Number(document.getElementById('inpOpenHr').value) || 8));
  state.closeHour = Math.max(1, Math.min(24, Number(document.getElementById('inpCloseHr').value) || 23));
  state.billingHourlyRate = Math.max(1000, Number(document.getElementById('inpMeterRate').value) || 3000);
  state.vipRateBonus = Math.max(0, Number(document.getElementById('inpVipBonus').value) || 1500);
  const hhEl = document.getElementById('chkHappyHour');
  if (hhEl) state.happyHourActive = !!hhEl.checked;
  const npEl = document.getElementById('chkNightPkg');
  if (npEl) state.nightPackageActive = !!npEl.checked;
  const qrEl = document.getElementById('chkQrisActive');
  if (qrEl && state.year >= 2019) state.qrisActive = !!qrEl.checked;
  const mdEl = document.getElementById('inpMemberDisc');
  state.members = state.members || { count: 0, totalDeposit: 0, discountPct: 10 };
  if (mdEl) state.members.discountPct = Math.max(0, Math.min(35, Number(mdEl.value) || 0));
  state.customPackages.forEach((p, idx) => {
    const nm = document.getElementById('pktName_' + idx);
    const hr = document.getElementById('pktHrs_' + idx);
    const pr = document.getElementById('pktPrice_' + idx);
    if (nm && hr && pr) {
      p.name = nm.value.trim() || `Paket ${hr.value} Jam`;
      p.hours = Math.max(1, Number(hr.value) || 1);
      p.price = Math.max(1000, Number(pr.value) || 3000);
    }
  });
  saveGame();
  closeCustomModal();
  addLog(`⚙️ Tarif Billing Meter diatur ke <b>${fmtRp(state.billingHourlyRate)}/jam</b> (dihitung per detik).`);
  renderAll();
}

function triggerManualPatchAll(silent = false) {
  state.pendingGamePatches = state.pendingGamePatches || {};
  state.installedGames = state.installedGames || { go_pb: true, go_dn: true, go_ayo: true };
  const pendingIds = Object.keys(state.pendingGamePatches);
  const sampleGame = (pendingIds.length > 0 && GAME_DISC_CATALOG.find(g => g.id === pendingIds[0]))
    || GAME_DISC_CATALOG.find(g => g.type === 'online' && state.installedGames[g.id])
    || GAME_DISC_CATALOG.find(g => g.type === 'online');
  if (!sampleGame) return;
  const totalMb = (pendingIds.length > 0 ? state.pendingGamePatches[pendingIds[0]] : sampleGame.patchMb) || 320;
  let count = 0;
  let busyCount = 0;
  state.slots.forEach(s => {
    if (s.cpu && s.monitor) {
      if (!s.occupied && !s.updatingPatch) {
        s.updatingPatch = true;
        s.updatingGameId = sampleGame.id;
        s.updatingGameTitle = sampleGame.title;
        s.patchDoneMb = 0;
        s.patchTotalMb = totalMb;
        count++;
      } else if (s.occupied) {
        busyCount++;
      }
    }
  });
  if (count > 0) {
    playSfx('click');
    addLog(`🔄 Memulai download & update patch <b>${sampleGame.title} (${totalMb} MB)</b> di <b>${count} PC</b> yang idle!`);
    if (typeof window.renderRoomBoard === 'function') window.renderRoomBoard(true);
    saveGame();
  } else if (!silent) {
    playSfx('click');
    if (busyCount > 0) {
      showCustomModal(
        '🔄 Update Patch Game Online',
        `<div class="spec-line">Semua <b>${busyCount} PC</b> yang terpasang saat ini sedang dipakai oleh pelanggan.</div>
         <div class="spec-line">Kamu bisa menunggu pelanggan selesai, menutup warnet dulu, atau paksa update di semua PC yang sudah idle nanti.</div>`,
        `<button type="button" onclick="closeCustomModal()">Tunggu Selesai</button>
         <button type="button" class="amber" onclick="forcePatchAllBusyPcs('${sampleGame.id}', ${totalMb})">⚡ Hentikan Sesi &amp; Update Sekarang</button>`
      );
    } else {
      addLog('ℹ️ Belum ada PC yang dirakit (atau semua PC sudah sedang proses update).');
    }
  }
}

function forcePatchAllBusyPcs(gameId, totalMb) {
  const g = GAME_DISC_CATALOG.find(x => x.id === gameId) || GAME_DISC_CATALOG[0];
  let count = 0;
  state.slots.forEach(s => {
    if (s.cpu && s.monitor && !s.updatingPatch) {
      s.occupied = false;
      s.updatingPatch = true;
      s.updatingGameId = g.id;
      s.updatingGameTitle = g.title;
      s.patchDoneMb = 0;
      s.patchTotalMb = totalMb || g.patchMb || 250;
      count++;
    }
  });
  closeCustomModal();
  addLog(`🔄 Memulai update patch <b>${g.title}</b> di <b>${count} PC</b>!`);
  saveGame();
  renderAll();
}

// ==================== DRAWER TABS ====================
const DRAWER_TITLES = {
  slots: '🖥️ Rakit & Konfigurasi 20 PC Warnet (10 Reguler + 10 Room VIP)',
  store_hw: '🛒 Toko Komponen PC, Monitor, AC, Renovasi & PC Server Kasir',
  discs: '🌐 Langganan Internet (Mbps), Game Online & DVD Game PC',
  cashier_stik: '🔧 Meja Teknisi: Servis Gear Rusak & Jual Komponen Second',
  agen_ppob: '🍜 Stok Air Galon 19L, Dus Pop Mie, Minuman & Pulsa',
  employees: '👷 Karyawan Warnet (Jadwal Hari Senin–Minggu & Tugas)',
  finance: '⚡ Token Listrik PLN, Genset Otomatis (Bensin) & Pinjaman',
  life: '🧬 Kehidupan, Sekolah, Motor/Mobil/HP, Keluarga & Warisan',
  logs: '📜 Catatan Aktivitas Warnet & Kehidupan'
};

function openDrawerTab(tabId) {
  playSfx('click');
  state.mainTab = tabId;
  document.querySelectorAll('.dock-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  const tEl = document.getElementById('drawerTitle');
  if (tEl) tEl.textContent = DRAWER_TITLES[tabId] || '📱 Menu Warnet';
  document.getElementById('appDrawerBackdrop').classList.add('open');
  renderRightPanel();
}

function closeDrawer() {
  document.getElementById('appDrawerBackdrop').classList.remove('open');
  document.querySelectorAll('.dock-btn').forEach(b => b.classList.remove('active'));
}

function renderRightPanel() {
  const box = document.getElementById('rightPanelContent');
  if (!box) return;

  if (state.mainTab === 'logs') {
    const lb = document.getElementById('logBox');
    box.innerHTML = lb ? lb.innerHTML : '<div class="spec-line">Belum ada catatan.</div>';
    return;
  }

  if (state.mainTab === 'slots') {
    const star = getWarnetStarRating().toFixed(1);
    box.innerHTML = `
      <div class="card" style="margin-bottom:6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <b>🏅 Rating Warnet &amp; Rental PS: ⭐ ${star} / 5.0</b>
          <span class="badge ok">Member VIP: ${(state.members && state.members.count) || 0}</span>
        </div>
        <div class="spec-line">Makin tinggi spek PC/PS, monitor Hz, kursi, AC, internet Mbps &amp; kebersihan, makin tinggi tarif sewa/jam &amp; rating bintang!</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
          <button type="button" class="primary" style="flex:1" onclick="openBillingRateModal()">⚙️ Tarif, Begadang &amp; QRIS</button>
          <button type="button" class="amber" onclick="triggerManualPatchAll()">🔄 Patch Semua PC</button>
          <button type="button" class="success" onclick="holdWeekendTournament()">🏆 Gelar Turnamen</button>
        </div>
      </div>
      ${state.slots.map(s => {
        const st = isSlotReadyToPlay(s);
        const tier = getPcTier(s);
        const rateNow = getSlotHourlyRate(s);
        const ramGb = getPcTotalRamGb(s);
        const isPs = s.unitType === 'ps';
        return `<div class="item-row" style="flex-direction:column;align-items:stretch;">
          <div style="display:flex;justify-content:space-between;">
            <b>${s.name} <span class="badge">${isPs ? '🎮 RENTAL PS' : `🖥️ PC Tier ${tier}${s.overclocked ? ' ⚡OC' : ''}`}</span> <small style="color:var(--green)">${fmtRp(rateNow)}/jam</small></b>
            <span class="badge ${s.occupied ? 'ok' : st.ok ? 'busy' : 'warn'}">${s.occupied ? `${s.customerName} (${s.billingMode.toUpperCase()})` : st.reason}</span>
          </div>
          <div class="spec-line">
            ${isPs
              ? `• Konsol: <b>${s.psConsole ? s.psConsole.name : '-'}</b> | TV/Monitor: <b>${s.monitor ? s.monitor.name : '-'}</b><br>• Kursi: <b>${s.chair ? s.chair.name : 'Kursi Plastik'}</b> | Pendingin: <b>${s.cooling ? s.cooling.name : '-'}</b>`
              : `• CPU: <b>${s.cpu ? s.cpu.name : '-'}</b> | RAM: <b>${ramGb}GB (${(s.rams || []).length}/${s.cpu ? (s.cpu.maxRamSlots || 2) : 2} Slot)</b><br>
                 • VGA: <b>${s.vga ? s.vga.name : '-'}</b> | Storage: <b>${s.storage ? s.storage.name : '-'}</b><br>
                 • Monitor: <b>${s.monitor ? s.monitor.name : '-'}</b> | Kursi: <b>${s.chair ? s.chair.name : 'Plastik'}</b> | Suhu: <b style="color:${(s.tempC || 40) > 82 ? '#ef4444' : '#38bdf8'}">${s.tempC || 40}°C (Debu ${Math.round(s.dustPct || 0)}%)</b>`}
          </div>
          <button type="button" class="primary" onclick="openSlotConfigModal(${s.id})">🔧 Rakit PC / Pasang PS &amp; Kursi Bilik Ini</button>
        </div>`;
      }).join('')}
    `;
    return;
  }

  if (state.mainTab === 'store_hw') {
    state.facilities = state.facilities || {};
    const nextRenov = RENOV_LEVELS[state.renovLevel];
    const nextSrv = SERVER_LEVELS[state.serverLevel];
    const itMult = state.itCourseCompleted ? 0.85 : 1.0;
    const whMult = getWholesaleDiscountMult();
    const discMult = +(itMult * whMult).toFixed(3);
    const cats = [
      ['cpu', '🧠 Processor'],
      ['ram', '⚡ RAM (s/d 8 Slot)'],
      ['vga', '🎮 VGA Card'],
      ['storage', '💾 HDD/SSD'],
      ['monitor', '🖥️ Monitor/TV'],
      ['cooling', '❄️ Kipas/AC'],
      ['chair', '🪑 Kursi Bilik'],
      ['ps', '🎮 Konsol PS'],
      ['gear', '🖱️ Gear Set'],
      ['fac', '🏢 Fasilitas Ruko']
    ];
    let list = [];
    if (state.hwCategoryFilter === 'cpu') list = PC_CPU_CATALOG;
    else if (state.hwCategoryFilter === 'ram') list = PC_RAM_CATALOG;
    else if (state.hwCategoryFilter === 'vga') list = PC_VGA_CATALOG;
    else if (state.hwCategoryFilter === 'storage') list = PC_STORAGE_CATALOG;
    else if (state.hwCategoryFilter === 'monitor') list = MONITOR_CATALOG;
    else if (state.hwCategoryFilter === 'cooling') list = COOLING_CATALOG;
    else if (state.hwCategoryFilter === 'chair') list = typeof CHAIR_CATALOG !== 'undefined' ? CHAIR_CATALOG : [];
    else if (state.hwCategoryFilter === 'ps') list = typeof PS_CONSOLE_CATALOG !== 'undefined' ? PS_CONSOLE_CATALOG : [];
    else if (state.hwCategoryFilter === 'fac') list = typeof WARNET_FACILITIES_CATALOG !== 'undefined' ? WARNET_FACILITIES_CATALOG : [];
    else list = PERIPHERAL_CATALOG;

    const upcomingItems = state.hwCategoryFilter === 'fac' ? [] : list.filter(it => !isEraUnlocked(it.releaseYear));

    box.innerHTML = `
      ${getStoreEraBannerHtml()}
      <div class="item-row" style="background:var(--panel-3);">
        <div>
          <b>🖥️ Upgrade PC Server Kasir (Saat ini: Level ${state.serverLevel})</b>
          <div class="spec-line">${nextSrv ? `${nextSrv.name}` : 'Sudah Level Maksimal (10GbE Diskless Server)'}</div>
        </div>
        ${nextSrv ? `<button type="button" class="primary" onclick="upgradeCashierServer()">Upgrade (${fmtRp(getPriceFrom2010(nextSrv.baseCost2010))})</button>` : '<span class="badge ok">MAX</span>'}
      </div>
      <div class="item-row" style="background:var(--panel-3);">
        <div>
          <b>🧱 Renovasi Ruangan Warnet (Level ${state.renovLevel})</b>
          <div class="spec-line">${nextRenov ? `${nextRenov.name} (Tarif Sewa x${nextRenov.rateMult})` : 'Sudah Level Maksimal'}</div>
        </div>
        ${nextRenov ? `<button type="button" class="amber" onclick="upgradeRenovation()">Renov (${fmtRp(getPriceFrom2010(nextRenov.baseCost2010))})</button>` : '<span class="badge ok">MAX</span>'}
      </div>
      ${(state.itCourseCompleted || whMult < 1) ? `<div class="spec-line" style="color:var(--green)">🏷️ <b>Diskon Aktif:</b> ${state.itCourseCompleted ? 'Sertifikat IT (-15%) ' : ''}${whMult < 1 ? `+ Kendaraan Belanja Grosir (-${Math.round((1 - whMult) * 100)}%)` : ''}</div>` : ''}
      <div class="sub-tabs">
        ${cats.map(([id, lbl]) => `<button type="button" class="sub-btn ${state.hwCategoryFilter === id ? 'active' : ''}" onclick="state.hwCategoryFilter='${id}';renderRightPanel()">${lbl}</button>`).join('')}
      </div>
      ${state.hwCategoryFilter === 'fac'
        ? list.map(f => {
            const owned = !!state.facilities[f.id];
            const fPrice = getPriceFrom2010(f.basePrice2010);
            return `<div class="item-row">
              <div style="font-size:24px;width:36px;text-align:center;">${f.icon || '🏢'}</div>
              <div style="flex:1">
                <b>${f.name}</b> ${owned ? '<span class="badge ok">✅ Aktif</span>' : ''}
                <div class="spec-line">${f.desc}</div>
                <div style="color:var(--green);font-weight:700;">${fmtRp(fPrice)}</div>
              </div>
              <button type="button" class="${owned ? 'success' : 'primary'}" onclick="buyFacilityItem('${f.id}')">${owned ? '✅ Terpasang' : 'Pasang'}</button>
            </div>`;
          }).join('')
        : list.filter(it => isEraUnlocked(it.releaseYear)).map(it => {
            const price = roundTo500(getPriceFrom2010(it.basePrice2010) * discMult);
            let inWhCount = 0;
            let instCount = 0;
            const cat = state.hwCategoryFilter;
            if (cat === 'gear') {
              inWhCount = it.id === 'gear_mech' ? (state.cashierGearMech || 0) : (state.cashierGearNew || 0);
              instCount = state.slots.filter(s => s.gear && ((it.id === 'gear_mech' && s.gear.quality === 'mech') || (it.id !== 'gear_mech' && s.gear.quality === 'new'))).length;
            } else {
              const whMap = { cpu: 'warehouseCpus', ram: 'warehouseRams', vga: 'warehouseVgas', storage: 'warehouseStorages', monitor: 'warehouseMonitors', cooling: 'warehouseCoolings', chair: 'warehouseChairs', ps: 'warehousePsConsoles' };
              const propMap = { cpu: 'cpu', vga: 'vga', storage: 'storage', monitor: 'monitor', cooling: 'cooling', chair: 'chair', ps: 'psConsole' };
              const whArr = state[whMap[cat]] || [];
              inWhCount = whArr.filter(x => x.id === it.id).length;
              if (cat === 'ram') {
                state.slots.forEach(s => { (s.rams || []).forEach(r => { if (r.id === it.id) instCount++; }); });
              } else if (propMap[cat]) {
                instCount = state.slots.filter(s => s[propMap[cat]] && s[propMap[cat]].id === it.id).length;
              }
            }
            return `<div class="item-row">
              <img class="prod-thumb" src="${it.img}" alt="${it.name}" />
              <div style="flex:1">
                <b>${it.name}</b> ${it.tier ? `<span class="badge ok">Tier ${it.tier}</span>` : ''} ${it.maxRamSlots ? `<span class="badge">${it.maxRamSlots} Slot RAM</span>` : ''}
                <div class="spec-line">Rilis: ${it.releaseYear} ${it.watt ? `• Daya: ${it.watt}W` : ''} ${it.sizeGb ? `• Kapasitas: ${it.sizeGb}GB` : ''} ${it.rateBonus2010 ? `• +${fmtRp(getPriceFrom2010(it.rateBonus2010))}/jam` : ''}</div>
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:2px;">
                  <span style="color:var(--green);font-weight:700;">${fmtRp(price)} ${discMult < 1 ? `<small style="color:#38bdf8">(-${Math.round((1 - discMult) * 100)}%)</small>` : ''}</span>
                  ${inWhCount > 0 ? `<span class="badge ok">📦 Di Gudang: ${inWhCount}</span>` : ''}
                  ${instCount > 0 ? `<span class="badge busy">🖥️ Terpasang: ${instCount}</span>` : ''}
                </div>
              </div>
              <button type="button" class="primary" onclick="buyPcComponent('${state.hwCategoryFilter}','${it.id}')">+ Beli</button>
            </div>`;
          }).join('')}
      ${upcomingItems.length > 0 ? `
        <div class="card" style="margin-top:8px;">
          <b>🔒 Segera Hadir di Tahun Mendatang (${upcomingItems.length} Item Terkunci Tahun):</b>
          ${upcomingItems.map(it => `
            <div class="item-row" style="opacity:0.85;">
              <div style="flex:1">
                <b>${it.name}</b> ${it.tier ? `<span class="badge">Tier ${it.tier}</span>` : ''}
                <div class="spec-line">Terbuka Otomatis pada <b>Tahun ${it.releaseYear}</b></div>
              </div>
              <button type="button" class="btn-locked" onclick="notifyUpcomingItemPopup('${state.hwCategoryFilter}','${it.id}')">🔒 Thn ${it.releaseYear}</button>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
    return;
  }

  if (state.mainTab === 'discs') {
    const curPlan = getInternetPlan();
    const games = GAME_DISC_CATALOG.filter(g => g.type === state.gameTypeFilter && isEraUnlocked(g.releaseYear));
    box.innerHTML = `
      ${getStoreEraBannerHtml()}
      <div class="card">
        <b>🌐 Paket Internet Warnet Saat Ini: ${curPlan.name} (${curPlan.mbps} Mbps • Ping ${getCurrentPingMs()}ms)</b>
        <div class="spec-line">Dampak Nyata Internet: Makin tinggi Mbps, makin banyak PC bebas Lag/RTO, kecepatan Patch naik drastis, Traffic Rombongan Mabar naik (+${curPlan.appealBonusPct || 0}%), Bonus Tarif Sewa +${fmtRp(getPriceFrom2010(curPlan.rateBonus2010 || 0))}/jam, &amp; omzet WiFi Hotspot naik!</div>
        ${INTERNET_PLANS.filter(p => isEraUnlocked(p.releaseYear)).map(p => `
          <div class="item-row">
            <div>
              <b>${p.name}</b>
              <div class="spec-line">Stabil <b>${p.maxSmoothPcs} PC</b> • Traffic <b>+${p.appealBonusPct || 0}%</b> • Bonus Tarif <b>+${fmtRp(getPriceFrom2010(p.rateBonus2010 || 0))}/jam</b> • <b>${fmtRp(p.monthlyReal)}/bln</b></div>
            </div>
            <button type="button" class="${p.id === state.internetPlanId ? 'success' : 'primary'}" onclick="changeInternetPlan('${p.id}')">${p.id === state.internetPlanId ? '✅ Aktif' : 'Pasang'}</button>
          </div>
        `).join('')}
      </div>
      <div class="sub-tabs">
        <button type="button" class="sub-btn ${state.gameTypeFilter === 'online' ? 'active' : ''}" onclick="state.gameTypeFilter='online';renderRightPanel()">🌐 Game Online</button>
        <button type="button" class="sub-btn ${state.gameTypeFilter === 'offline' ? 'active' : ''}" onclick="state.gameTypeFilter='offline';renderRightPanel()">💿 Kaset DVD Game PC</button>
      </div>
      ${games.map(g => {
        const installed = !!state.installedGames[g.id];
        const needPatch = state.pendingGamePatches[g.id];
        const price = g.basePrice2010 > 0 ? getPriceFrom2010(g.basePrice2010) : 0;
        const safeTitle = g.title.replace(/'/g, "\\'");
        return `<div class="item-row">
          <img class="disc-thumb" src="${g.cover}" alt="${g.title}" />
          <div style="flex:1">
            <b>${g.title}</b> ${g.canPartyMabar ? '<span class="badge ok">Party Mabar</span>' : ''}
            <div class="spec-line">${g.genre} • Min Spek Tier ${g.minTier} • Ukuran ${g.sizeGb}GB ${g.patchMb ? `• Patch ${g.patchMb}MB` : ''}</div>
            <div style="color:var(--green);font-weight:700;">${price > 0 ? fmtRp(price) : 'Gratis Download Installer'}</div>
          </div>
          ${installed
            ? (needPatch
                ? `<button type="button" class="amber" onclick="triggerManualPatchAll()">🔄 Update ${needPatch}MB</button>`
                : `<button type="button" class="success" onclick="notifyBlockedPopup('Game Sudah Dimiliki di Server Kasir', 'Master installer <b>${safeTitle}</b> sudah ada di Server Kasir.<br><br>💡 <b>Cara Instal ke PC:</b> Tap salah satu kartu <b>Room VIP #1–#20</b> di layar utama (atau tab Billing/PC), lalu klik tombol <b>Instal</b> pada daftar game di bilik PC tersebut!')">✅ Di Server</button>`)
            : `<button type="button" class="primary" onclick="installOrBuyPcGame('${g.id}')">${price > 0 ? 'Beli DVD' : 'Download'}</button>`}
        </div>`;
      }).join('')}
    `;
    return;
  }

  if (state.mainTab === 'cashier_stik') {
    box.innerHTML = `
      <div class="card">
        <b>🖱️ Stok &amp; Servis Gear (Mouse + Keyboard + Headset) &amp; Perawatan Suhu PC</b>
        <div class="spec-line">Standar Baru (100%): <b>${state.cashierGearNew}</b> • Mechanical RGB (220%): <b style="color:#a855f7">${state.cashierGearMech || 0}</b> • Hasil Servis (65%): <b>${state.cashierGearServiced}</b> • Rusak: <b style="color:var(--red)">${state.cashierGearBroken}</b></div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
          <button type="button" class="${state.cashierGearBroken <= 0 ? 'btn-locked' : 'amber'}" onclick="manualServiceGear()">🔧 Servis 1 Set Gear Rusak (${state.cashierGearBroken})</button>
          <button type="button" class="primary" onclick="cleanAllPcDustAndPaste()">🌬️ Semprot Debu &amp; Ganti Pasta Thermal Semua PC (${state.facilities && state.facilities.fac_kompresor ? 'GRATIS Kompresor' : fmtRp(getPriceFrom2010(75000))})</button>
        </div>
      </div>
      <div class="card">
        <b>📦 Gudang Komponen PC, Kursi &amp; PS (Harga Jual Second Sesuai Tahun Pemakaian)</b>
        ${['Cpus', 'Rams', 'Vgas', 'Storages', 'Monitors', 'Coolings', 'Chairs', 'PsConsoles'].map(k => {
          const arr = state['warehouse' + k] || [];
          return arr.map((it, idx) => {
            const sellP = calcSecondhandPartPrice(it);
            const ageYrs = Math.max(0, state.year - (it.boughtYear || state.year));
            return `<div class="item-row"><span><b>${it.name}</b> <small style="color:var(--muted)">(${ageYrs === 0 ? 'Baru Tahun Ini' : `Pakai ${ageYrs} thn`})</small></span><button type="button" class="amber" onclick="sellSecondhandPart('${k}',${idx})">💸 Jual Second ${fmtRp(sellP)}</button></div>`;
          }).join('');
        }).join('') || '<div class="spec-line">Gudang komponen sedang kosong. Beli komponen di tab <b>🛒 Rakit/Server</b>.</div>'}
      </div>
    `;
    return;
  }

  if (state.mainTab === 'agen_ppob') {
    const whMult = getWholesaleDiscountMult();
    box.innerHTML = `
      <div class="card">
        <b>💧 Stok Air Galon, Pop Mie, Indomie Telur, Kertas Print &amp; Voucher Game</b>
        <div class="spec-line">Sisa Air Galon Saat Ini: <b style="color:#38bdf8">${state.waterGallonServings} porsi seduhan</b>. ${whMult < 1 ? `<span style="color:var(--green)">🛵 Diskon Grosir Kendaraan Pribadi Aktif (-${Math.round((1 - whMult) * 100)}%)!</span>` : 'Miliki Motor atau Mobil Pick-Up untuk diskon belanja grosir s/d 22%!'}</div>
        ${WARNET_SUPPLY_CATALOG.map(it => {
          const price = roundTo500(getPriceFrom2010(it.boxPrice2010) * whMult);
          const stock = it.kind === 'galon' ? `${state.waterGallonServings} porsi` : `${state.snackStockPcs[it.id] || 0} pcs`;
          const lockedFac = it.requiresFacility && !(state.facilities && state.facilities[it.requiresFacility]);
          return `<div class="item-row">
            <img class="prod-thumb" src="${it.img}" alt="${it.name}" />
            <div style="flex:1">
              <b>${it.name}</b> <span class="badge ok">Stok: ${stock}</span>
              <div class="spec-line">${it.kind === 'galon' ? 'Wajib untuk seduh Pop Mie, Indomie & Kopi' : `Harga jual ecer: ${fmtRp(getPriceFrom2010(it.sellPcs2010))}/porsi`}</div>
              <div style="color:var(--green);font-weight:700;">${fmtRp(price)} ${whMult < 1 ? `<small style="color:#38bdf8">(-${Math.round((1 - whMult) * 100)}% Grosir)</small>` : ''}</div>
            </div>
            <button type="button" class="${lockedFac ? 'btn-locked' : 'primary'}" onclick="buyWarnetSupply('${it.id}')">${lockedFac ? '🔒 Butuh Fasilitas' : '+ Beli'}</button>
          </div>`;
        }).join('')}
      </div>
    `;
    return;
  }

  if (state.mainTab === 'employees') {
    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <b>👷 Karyawan Warnet (${state.employees.length} orang)</b>
        <button type="button" class="primary" onclick="openHireEmployeeModal()">+ Rekrut Karyawan</button>
      </div>
      <div class="spec-line">Saat karyawan jaga sedang bertugas, kamu tidak perlu ikut jaga! Setelah tutup, karyawan teknisi/jaga juga otomatis menyelesaikan update game di PC.</div>
      ${state.employees.map((emp, idx) => {
        const onDuty = isEmployeeOnDuty(emp);
        const isStandby = onDuty && !state.rentalOpen;
        const dayLabels = (emp.workDaysArray || [1,2,3,4,5,6]).map(d => DAY_NAMES[d].slice(0, 3)).join(', ');
        return `<div class="item-row" style="flex-direction:column;align-items:stretch;cursor:pointer;" onclick="openHireEmployeeModal(${idx})">
          <div style="display:flex;justify-content:space-between;">
            <b>${emp.name} <small style="color:#38bdf8">(Tap untuk Edit)</small></b>
            <span class="badge ${isStandby ? 'busy' : onDuty ? 'ok' : 'warn'}">${isStandby ? '⏳ Standby Tunggu Buka' : onDuty ? '🟢 Sedang Jaga' : '⚪ Libur / Luar Shift'}</span>
          </div>
          <div class="spec-line">
            • Hari Kerja: <b>${dayLabels}</b> • Shift: <b>${String(emp.startHour).padStart(2, '0')}:00</b> (${emp.durationHours} jam)<br>
            • Gaji (${emp.payPeriod}): <b>${fmtRp(emp.salaryAmount)}</b> + Insentif <b>${fmtRp(emp.incentive)}</b> • Lembur: <b>${emp.overtimeHours || 0} jam</b><br>
            • Total Gaji Sudah Dibayar: <b style="color:var(--green)">${fmtRp(emp.totalPaidHistory || 0)}</b> • Tugas: <b>${emp.tasks.join(', ').toUpperCase()}</b>
          </div>
          <div style="display:flex;gap:6px;margin-top:4px;">
            <button type="button" class="success" onclick="event.stopPropagation();payEmployeeNowManual(${idx})">💸 Bayar Gaji Sekarang</button>
            <button type="button" class="danger" onclick="event.stopPropagation();fireEmployee(${idx})">Berhentikan</button>
          </div>
        </div>`;
      }).join('')}
    `;
    return;
  }

  if (state.mainTab === 'finance') {
    const bbmPrice = getBbmPricePerLiter(state.year);
    const bRate = getBankInterestRate(state.year);
    const canBank = state.player.age >= 21;
    const goldPrice = typeof getHistoricalGoldPricePerGram === 'function' ? getHistoricalGoldPricePerGram(state.year, state.totalDays) : getPriceFrom2010(385000);
    state.goldGrams = state.goldGrams || 0;
    const fs = state.financeStats || { revBilling: 0, revSnack: 0, revExtra: 0, expPower: 0, expSalary: 0, expLoan: 0 };
    const totalRev = (fs.revBilling || 0) + (fs.revSnack || 0) + (fs.revExtra || 0);
    const totalExp = (fs.expPower || 0) + (fs.expSalary || 0) + (fs.expLoan || 0);
    const netProfit = totalRev - totalExp;
    const curMeter = getPlnMeterObj();
    const nextMeter = (typeof PLN_METER_LEVELS !== 'undefined' ? PLN_METER_LEVELS : [])[(state.plnMeterLevel || 1)];
    state.branches = state.branches || { warnetOwned: false, psRentalOwned: false };

    box.innerHTML = `
      <div class="card">
        <b>📈 Laporan Keuangan Usaha Warnet &amp; Aset</b>
        <div class="spec-line">
          • Omzet Sewa Billing PC/PS: <b style="color:var(--green)">+${fmtRp(fs.revBilling || 0)}</b><br>
          • Omzet Pop Mie/Indomie/Minuman: <b style="color:var(--green)">+${fmtRp(fs.revSnack || 0)}</b><br>
          • Omzet WiFi/Print/Voucher/Travel/Cabang: <b style="color:var(--green)">+${fmtRp(fs.revExtra || 0)}</b><br>
          • Beban Listrik/ISP/Gaji/Cicilan: <b style="color:var(--red)">-${fmtRp(totalExp)}</b><br>
          • <b>Profit Bersih Akumulasi:</b> <b style="color:${netProfit >= 0 ? 'var(--green)' : 'var(--red)'}">${fmtRp(netProfit)}</b>
        </div>
      </div>
      <div class="card">
        <b>🔌 Daya Meteran Listrik PLN Saat Ini: ${curMeter.name} (Beban Aktif: ${getCurrentActiveWatts()}W / ${curMeter.maxWatts}W)</b>
        <div class="spec-line">Jika total watt PC + AC melampaui batas VA meteran PLN, MCB akan jeglek!</div>
        ${nextMeter
          ? `<button type="button" class="primary" onclick="upgradePlnMeterLevel()">⚡ Upgrade ke ${nextMeter.name} (${fmtRp(getPriceFrom2010(nextMeter.baseCost2010))})</button>`
          : `<span class="badge ok">Sudah Daya Maksimal 10.600 VA 3-Phase</span>`}
      </div>
      <div class="card">
        <b>🏪 Buka Cabang ke-2 (Franchise Warnet iCafe &amp; Cabang Rental PS VIP)</b>
        <div class="spec-line">Buka cabang baru yang dikelola manajer dan menyetor profit bersih setiap hari ke Bank!</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
          ${state.branches.warnetOwned
            ? `<span class="badge ok">✅ Cabang Warnet iCafe Aktif (+Setoran Harian)</span>`
            : `<button type="button" class="primary" onclick="buySecondBranch('warnet')">🏪 Buka Cabang Warnet PC (${fmtRp(getPriceFrom2010(45000000))})</button>`}
          ${state.branches.psRentalOwned
            ? `<span class="badge ok">✅ Cabang Rental PS VIP Aktif (+Setoran Harian)</span>`
            : `<button type="button" class="amber" onclick="buySecondBranch('ps')">🎮 Buka Cabang Rental PS (${fmtRp(getPriceFrom2010(32000000))})</button>`}
        </div>
      </div>
      <div class="card">
        <b>🪙 Investasi Emas Antam Lintas Tahun (Harga Tahun ${state.year}: ${fmtRp(goldPrice)}/gram)</b>
        <div class="spec-line">Tabungan Emasmu: <b style="color:#fbbf24">${state.goldGrams} gram</b> (Nilai Jual Saat Ini: <b style="color:var(--green)">${fmtRp(state.goldGrams * goldPrice)}</b>)</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button type="button" class="amber" onclick="buyGoldGrams(1)">+ Beli 1gr (${fmtRp(goldPrice)})</button>
          <button type="button" class="amber" onclick="buyGoldGrams(5)">+ Beli 5gr (${fmtRp(5 * goldPrice)})</button>
          <button type="button" class="${state.goldGrams < 1 ? 'btn-locked' : 'success'}" onclick="sellGoldGrams(1)">💸 Jual 1gr</button>
          <button type="button" class="${state.goldGrams < 1 ? 'btn-locked' : 'success'}" onclick="sellGoldGrams(${Math.max(1, state.goldGrams)})">💸 Jual Semua Emas</button>
        </div>
      </div>
      <div class="card">
        <b>⛽ Genset Otomatis Backup Listrik (Meteran Bensin: ${state.genset.fuelLiters.toFixed(1)} / ${state.genset.maxTankLiters} Liter)</b>
        <div class="spec-line">Status: <b>${state.genset.active ? '🟢 MENYALA OTOMATIS (Backup PLN)' : '⚪ Standby Otomatis'}</b> • Harga Bensin Tahun ${state.year}: <b>${fmtRp(bbmPrice)}/Liter</b></div>
        <div style="display:flex;gap:6px;">
          <button type="button" class="amber" onclick="refuelGenset(5)">+ Isi 5 Liter (${fmtRp(5 * bbmPrice)})</button>
          <button type="button" class="primary" onclick="refuelGenset(15)">+ Isi Full Tangki</button>
        </div>
      </div>
      <div class="card">
        <b>⚡ Token Listrik PLN Prabayar (Sisa: ${state.kwh.toFixed(2)} kWh)</b>
        <div class="grid-2">
          ${PLN_TOKEN_NOMINALS.map(nom => {
            const info = calcPlnToken(nom, state.year);
            return `<button type="button" onclick="buyPlnToken(${nom})">⚡ Token ${nom.toLocaleString('id-ID')}<br><small style="color:var(--green)">+${info.kwhReceived} kWh</small></button>`;
          }).join('')}
        </div>
      </div>
      <div class="card">
        <b>🏢 Status Ruko Warnet (Semua 20 Room VIP)</b>
        ${state.property && state.property.owned
          ? `<div class="spec-line" style="color:var(--green)">✅ <b>Ruko Milik Sendiri Permanen!</b> Bebas biaya sewa bulanan selamanya.</div>`
          : state.property && state.property.kprActive
            ? `<div class="spec-line">Cicilan KPR Ruko: <b>${fmtRp(state.property.kprRemaining)}</b> (${state.property.kprMonthsLeft} bln @ ${fmtRp(state.property.kprMonthly)}/bln)</div>
               <button type="button" class="success" onclick="payOffRukoKpr()">💸 Lunasi KPR Ruko Sekarang</button>`
            : `<div class="spec-line">Saat ini masih Sewa Bulanan (${fmtRp(getPriceFrom2010(1500000))}/bln). Beli permanen atau cicil 36 bulan (DP 20% = ${fmtRp(Math.round(getPriceFrom2010(120000000) * 0.2))}):</div>
               <div style="display:flex;gap:6px;">
                 <button type="button" class="primary" onclick="startRukoKpr()">🏠 Cicil KPR 36 Bln (DP ${fmtRp(Math.round(getPriceFrom2010(120000000) * 0.2))})</button>
                 <button type="button" class="amber" onclick="buyRukoCash()">💵 Beli Cash</button>
               </div>`}
      </div>
      <div class="card">
        <b>👨‍👩‍👦 Pinjaman Orang Tua (5–30 Juta • 52x Mingguan • Bunga 0%)</b>
        ${state.parentLoan.active
          ? `<div class="spec-line">Sisa Hutang: <b>${fmtRp(state.parentLoan.remainingTotal)}</b> (${state.parentLoan.weeksLeft} mgg @ ${fmtRp(state.parentLoan.weeklyInstallment)})</div>
             <div style="display:flex;gap:6px;">
               <button type="button" class="primary" onclick="payParentLoanNow(false)">Cicil 1x</button>
               <button type="button" class="success" onclick="payParentLoanNow(true)">✅ Lunasi Semua</button>
             </div>`
          : `<div class="grid-2">
               <button type="button" class="primary" onclick="takeParentLoan(5000000)">Pinjam 5 Juta</button>
               <button type="button" class="primary" onclick="takeParentLoan(10000000)">Pinjam 10 Juta</button>
               <button type="button" class="primary" onclick="takeParentLoan(20000000)">Pinjam 20 Juta</button>
               <button type="button" class="amber" onclick="takeParentLoan(30000000)">Pinjam Maks 30 Jt</button>
             </div>`}
      </div>
      <div class="card">
        <b>🏦 Kredit Usaha Bank (Wajib Usia 21+ • Bunga ${bRate}%/thn)</b>
        ${state.bankLoan.active
          ? `<div class="spec-line">Sisa Hutang Bank: <b>${fmtRp(state.bankLoan.remainingTotal)}</b> (${state.bankLoan.monthsLeft} bln @ ${fmtRp(state.bankLoan.monthlyInstallment)})</div>
             <div style="display:flex;gap:6px;">
               <button type="button" class="primary" onclick="payBankLoanNow(false)">Cicil 1x</button>
               <button type="button" class="success" onclick="payBankLoanNow(true)">✅ Lunasi Semua</button>
             </div>`
          : `<div style="display:flex;gap:6px;">
               <button type="button" class="${!canBank ? 'btn-locked' : 'primary'}" onclick="takeBankLoan(50000000)">${!canBank ? '🔒 ' : ''}Kredit 50 Jt</button>
               <button type="button" class="${!canBank ? 'btn-locked' : 'primary'}" onclick="takeBankLoan(150000000)">${!canBank ? '🔒 ' : ''}Kredit 150 Jt</button>
             </div>`}
      </div>
    `;
    return;
  }

  if (state.mainTab === 'life') {
    const p = state.player;
    const en = Math.round(p.energy ?? 100);
    const bbmPrice = getBbmPricePerLiter(state.year);
    box.innerHTML = `
      <div class="card">
        <b>👤 ${p.name} (${p.age} Thn • ${p.religion})</b>
        <div class="spec-line">Stamina / Energi (Full = 36 Jam): <b style="color:${en < 25 ? '#ef4444' : '#4ade80'}">${en}%</b> • Status: <b>${p.isSick ? `🤒 Sakit (${p.sickName})` : '💚 Sehat'}</b></div>
        <div class="countdown-track"><div class="countdown-fill" style="width:${en}%;"></div></div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button type="button" class="primary" onclick="restPlayerEnergy()">😴 Tidur / Istirahat (+100%)</button>
          ${p.isSick ? `<button type="button" class="danger" onclick="goToHospital()">🏥 Berobat RS (${p.bpjsTier !== 'none' ? 'GRATIS BPJS' : fmtRp(getPriceFrom2010(1250000))})</button>` : ''}
          <button type="button" onclick="openDrawerTab('logs')">📜 Log</button>
          <button type="button" class="danger" onclick="resetGameFull()">🔄 Reset Game</button>
        </div>
      </div>

      <div class="card">
        <b>🏥 BPJS Kesehatan (Biaya RS Gratis Jika Aktif)</b>
        <div class="grid-2">
          ${BPJS_TIERS.map(b => {
            const cost = roundTo500(b.monthly2024 * getEraMultiplier(state.year));
            return `<button type="button" class="${p.bpjsTier === b.id ? 'success' : ''}" onclick="setBpjsTier('${b.id}')">${b.name}<br><small>${cost > 0 ? fmtRp(cost) + '/bln' : 'Tanpa Iuran'}</small></button>`;
          }).join('')}
        </div>
      </div>

      <div class="card">
        <b>🎓 Pendidikan &amp; Kursus Malam Bisnis / Teknisi IT (Usia 18+)</b>
        <div class="spec-line">Mengikuti kuliah/kursus malam IT memberi <b>Diskon Permanen 15%</b> semua komponen rakit PC di Toko!</div>
        ${state.itCourseCompleted
          ? `<div class="spec-line" style="color:var(--green)">✅ <b>Lulus Sertifikasi Teknisi IT &amp; Bisnis Warnet!</b> (Diskon 15% Komponen PC Aktif)</div>`
          : `<button type="button" class="${p.age < 18 ? 'btn-locked' : 'primary'}" onclick="takeItNightCourse()">${p.age < 18 ? '🔒 ' : '🎓 '}Ikut Kursus / Kuliah Malam IT (${fmtRp(getPriceFrom2010(4500000))})</button>`}
      </div>

      <div class="card">
        <b>🚗 Kendaraan, Sewa Travel/Kargo Harian &amp; Jual Second Sesuai Tahun Pakai</b>
        <div class="spec-line">Punya Motor memberi diskon belanja grosir <b>-12%</b>, punya Mobil/Pick-Up memberi diskon grosir <b>-22%</b> &amp; bisa disewakan jadi Travel/Angkutan!</div>
        ${state.ownedVehicles.length === 0 ? `<div class="spec-line">Belum punya motor/mobil.</div>` : ''}
        ${state.ownedVehicles.map((v, idx) => {
          const sellPrice = calcResalePrice('vehicle', v);
          const usedYrs = Math.max(0, state.year - (v.boughtYear || state.year));
          const dailyRent = getPriceFrom2010(v.commercialDaily2010 || (v.category === 'Mobil' ? 95000 : 0));
          return `<div class="item-row" style="flex-direction:column;align-items:stretch;">
            <div style="display:flex;justify-content:space-between;">
              <b>${v.name} <small style="color:var(--muted)">(${usedYrs === 0 ? 'Baru' : `Pakai ${usedYrs} thn`})</small></b>
              <span class="badge">BBM ${v.fuelLiters.toFixed(1)}/${v.tankCap}L • Oli ${Math.round(v.oilPct ?? 100)}% • Mesin ${Math.round(v.engineCond ?? 100)}%</span>
            </div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px;">
              <button type="button" onclick="refuelOwnedVehicle(${idx})">⛽ Bensin (${fmtRp(bbmPrice)}/L)</button>
              <button type="button" onclick="changeOilVehicle(${idx})">🛢️ Ganti Oli</button>
              <button type="button" onclick="serviceVehicleEngine(${idx})">🔧 Servis</button>
              <button type="button" class="primary" onclick="rideOwnedVehicle(${idx})">🛣️ Jalan</button>
              ${v.category === 'Mobil' ? `<button type="button" class="${v.rentedOut ? 'success' : 'amber'}" onclick="toggleRentOutVehicle(${idx})">🚕 ${v.rentedOut ? `Disewakan (+${fmtRp(dailyRent)}/hr)` : `Sewakan Travel (+${fmtRp(dailyRent)}/hr)`}</button>` : ''}
              <button type="button" class="danger" onclick="sellEmergencyAsset('vehicle', ${idx})">💸 Jual Second (${fmtRp(sellPrice)})</button>
            </div>
          </div>`;
        }).join('')}
      </div>

      <div class="card">
        <b>🏠 Properti (Rumah / Apartemen), Cicilan KPR (DP Mulai 10%) &amp; Jual Aset</b>
        ${(state.ownedHouses || []).map((h, idx) => {
          const sellP = calcResalePrice('house', h);
          return `<div class="item-row">
            <div><b>🏡 Milik Sendiri: ${h.name}</b> <small style="color:var(--muted)">(Beli ${h.boughtYear || state.year})</small></div>
            <button type="button" class="danger" onclick="sellEmergencyAsset('house', ${idx})">💸 Jual (${fmtRp(sellP)})</button>
          </div>`;
        }).join('')}
        ${PROPERTY_CATALOG.map(pr => {
          const fullP = getPriceFrom2010(pr.basePrice2010);
          const dpRate = pr.dpPct || 0.15;
          const dpAmt = Math.round(fullP * dpRate);
          const ownedCount = (state.ownedHouses || []).filter(h => h.name === pr.name).length;
          return `<div class="item-row">
            <div>
              <b>${pr.name}</b> ${ownedCount > 0 ? `<span class="badge ok">✅ Dimiliki: ${ownedCount}</span>` : ''}
              <div class="spec-line">${pr.desc} • DP KPR: <b>${fmtRp(dpAmt)} (${Math.round(dpRate * 100)}%)</b></div>
              <div style="color:var(--green);font-weight:700;">Harga Cash: ${fmtRp(fullP)}</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:3px;">
              <button type="button" class="primary" onclick="buyOrInstallmentAsset('${pr.name}', ${pr.basePrice2010}, false, 'house', ${dpRate})">Cash</button>
              <button type="button" class="amber" onclick="buyOrInstallmentAsset('${pr.name}', ${pr.basePrice2010}, true, 'house', ${dpRate})">Cicil (DP ${Math.round(dpRate * 100)}%)</button>
            </div>
          </div>`;
        }).join('')}
        ${(state.assetLoans || []).filter(a => a.active).map((al, idx) => `
          <div class="item-row">
            <div><b>Cicilan ${al.name}</b><div class="spec-line">Sisa ${fmtRp(al.remainingTotal)} (${al.monthsLeft} bln @ ${fmtRp(al.monthlyInstallment)})</div></div>
            <button type="button" class="success" onclick="payOffAssetLoan(${idx})">Lunasi</button>
          </div>
        `).join('')}
      </div>

      <div class="card">
        <b>📱 Katalog HP &amp; Laptop (Harga Second iPhone/Apple Jauh Lebih Stabil Saat Dijual Balik!)</b>
        ${GADGET_CATALOG.filter(g => isEraUnlocked(g.yearStart)).map(g => {
          const ownedIdx = state.ownedGadgets.findIndex(og => og.id === g.id);
          const owned = ownedIdx >= 0;
          const ownedObj = owned ? state.ownedGadgets[ownedIdx] : null;
          const resaleP = ownedObj ? calcResalePrice('gadget', ownedObj) : 0;
          const usedYrs = ownedObj ? Math.max(0, state.year - (ownedObj.boughtYear || state.year)) : 0;
          return `<div class="item-row">
            <img class="prod-thumb" src="${g.img}" alt="${g.name}" />
            <div style="flex:1">
              <b>${g.name}</b> <span class="badge">${g.brand}</span> ${g.brand === 'Apple' ? '<span class="badge ok">Harga Second Stabil</span>' : ''}
              <div style="color:var(--green);font-weight:700;">Beli Baru: ${fmtRp(getPriceFrom2010(g.price2010))}</div>
              ${owned ? `<div class="spec-line">Dimiliki (${usedYrs === 0 ? 'Baru Tahun Ini' : `Pakai ${usedYrs} thn`}) • Nilai Jual Second: <b style="color:#fbbf24">${fmtRp(resaleP)}</b></div>` : ''}
            </div>
            ${owned
              ? `<button type="button" class="danger" onclick="sellEmergencyAsset('gadget', ${ownedIdx})">💸 Jual ${fmtRp(resaleP)}</button>`
              : `<button type="button" class="primary" onclick="buyGadgetItem('${g.id}')">Beli</button>`}
          </div>`;
        }).join('')}
      </div>

      <div class="card">
        <b>🛵 Kendaraan Motor &amp; Mobil (Cash / Cicil DP 20% • ${state.unlockAllEras !== false ? 'Semua Era 2010–2026+' : `Tahun ${state.year}`})</b>
        ${VEHICLE_CATALOG.filter(v => isEraUnlocked(v.yearStart)).map(v => {
          const ownedCount = (state.ownedVehicles || []).filter(ov => ov.id === v.id).length;
          return `<div class="item-row">
            <img class="prod-thumb" src="${v.img}" alt="${v.name}" />
            <div style="flex:1">
              <b>${v.name}</b> ${ownedCount > 0 ? `<span class="badge ok">✅ Dimiliki: ${ownedCount}</span>` : ''}
              <div class="spec-line">${v.category === 'Mobil' ? `Bisa Disewakan Travel (+${fmtRp(getPriceFrom2010(v.commercialDaily2010 || 95000))}/hr) & Diskon Grosir 22%` : 'Diskon Belanja Grosir 12%'}</div>
              <div style="color:var(--green);font-weight:700;">${fmtRp(getPriceFrom2010(v.price2010))}</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:3px;">
              <button type="button" class="primary" onclick="buyVehicle('${v.id}', false)">Cash</button>
              <button type="button" class="amber" onclick="buyVehicle('${v.id}', true)">Cicil (DP 20%)</button>
            </div>
          </div>`;
        }).join('')}
      </div>

      <div class="card">
        <b>💍 Keluarga, Pendidikan Anak, Kebahagiaan (${state.familyHappiness ?? 85}%) &amp; Wariskan Warnet</b>
        <div class="spec-line">Kebahagiaan Keluarga: <b style="color:var(--green)">${state.familyHappiness ?? 85}%</b> • <button type="button" class="amber" onclick="giveFamilyGift()">🎁 Beli Hadiah / Liburan Keluarga (${fmtRp(getPriceFrom2010(500000))})</button></div>
        ${!p.partner ? PARTNERS_LIST.filter(pt => pt.gender !== p.gender).map(pt => `
          <div class="item-row"><span><b>${pt.name}</b> (${pt.job})</span><button type="button" class="${p.age < 17 ? 'btn-locked' : 'primary'}" onclick="choosePartner('${pt.id}')">${p.age < 17 ? '🔒 ' : '💕 '}Pacaran</button></div>
        `).join('') : `
          <div style="display:flex;gap:6px;">
            ${!p.married ? `<button type="button" class="primary" onclick="marryPartner()">💍 Menikah dengan ${p.partner.name}</button>` : `<button type="button" class="success" onclick="haveChildWithPartner()">👶 Program Anak</button>`}
          </div>
        `}
        ${(p.childrenList || []).map((ch, idx) => `
          <div class="item-row" style="flex-wrap:wrap;">
            <span>👶 <b>${ch.name}</b> (${ch.age} thn) ${ch.eliteSchool ? '<span class="badge ok">🎓 Sekolah IT</span>' : ''}</span>
            <div style="display:flex;gap:4px;">
              ${ch.age >= 6 ? `<button type="button" class="${ch.eliteSchool ? 'success' : 'primary'}" onclick="toggleChildEliteSchool(${idx})">🏫 ${ch.eliteSchool ? 'Sekolah IT Aktif' : 'Sekolahkan IT'}</button>` : ''}
              <button type="button" class="${ch.age < 8 ? 'btn-locked' : 'amber'}" onclick="inheritToChild(${idx})">${ch.age < 8 ? '🔒 ' : '👑 '}Wariskan</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

// ==================== MODAL RAKIT PC / RENTAL PS PER SLOT (MULTI-RAM 2-8 SLOT + KURSI + OVERCLOCK + INSTAL GAME) ====================
function openSlotConfigModal(slotId) {
  const s = state.slots.find(x => x.id === slotId);
  if (!s) return;
  s.unitType = s.unitType || 'pc';
  if (!Array.isArray(s.rams)) s.rams = s.ram ? [s.ram] : [];
  if (!Array.isArray(s.installedGames)) s.installedGames = [];
  state.warehouseChairs = state.warehouseChairs || [];
  state.warehousePsConsoles = state.warehousePsConsoles || [];
  const availOs = PC_OS_CATALOG.filter(o => isEraUnlocked(o.releaseYear));
  const maxRams = s.cpu ? (s.cpu.maxRamSlots || 2) : 2;
  const totalRamGb = getPcTotalRamGb(s);
  const totalGb = getPcTotalStorageGb(s);
  const usedGb = getPcUsedStorageGb(s);
  const pcTier = getPcTier(s);
  const rateNow = getSlotHourlyRate(s);
  const isPs = s.unitType === 'ps';

  function partRow(label, prop, whKey) {
    const cur = s[prop];
    const wh = state['warehouse' + whKey] || [];
    return `<div class="item-row">
      <div><b>${label}:</b> ${cur ? cur.name : 'Kosong'}</div>
      ${cur
        ? `<button type="button" class="danger" onclick="detachPcPart(${s.id},'${prop}','${whKey}')">Lepas</button>`
        : `<select onchange="if(this.value!=='')attachPcPart(${s.id},'${prop}','${whKey}',this.value)"><option value="">-- Pasang (${wh.length}) --</option>${wh.map((it, idx) => `<option value="${idx}">${it.name}</option>`).join('')}</select>`}
    </div>`;
  }

  const ownedLibGames = GAME_DISC_CATALOG.filter(g => state.installedGames[g.id] && isEraUnlocked(g.releaseYear));

  showCustomModal(
    `🖥️ Konfigurasi ${s.name} (${isPs ? 'Mode Rental PS' : 'Mode Rakit PC'})`,
    `<div class="sub-tabs" style="margin-bottom:6px;">
       <button type="button" class="sub-btn ${!isPs ? 'active' : ''}" onclick="setSlotUnitType(${s.id},'pc')">🖥️ Mode Rakit PC Warnet</button>
       <button type="button" class="sub-btn ${isPs ? 'active' : ''}" onclick="setSlotUnitType(${s.id},'ps')">🎮 Mode Rental PlayStation</button>
     </div>
     <div class="spec-line">Spek: <b>Tier ${pcTier}${s.overclocked && !isPs ? ' (⚡OC +1 Tier)' : ''}</b> • Tarif Sewa Bilik Ini: <b style="color:var(--green)">${fmtRp(rateNow)}/jam</b></div>
     ${isPs
       ? `${partRow('🎮 Konsol PlayStation', 'psConsole', 'PsConsoles')}
          ${partRow('🖥️ TV / Monitor', 'monitor', 'Monitors')}
          ${partRow('🪑 Kursi Bilik', 'chair', 'Chairs')}
          ${partRow('❄️ Kipas / AC', 'cooling', 'Coolings')}`
       : `<div class="spec-line">RAM: <b>${totalRamGb} GB</b> (${s.rams.length}/${maxRams} Slot) • Storage: <b>${usedGb}/${totalGb} GB</b> • Suhu: <b>${s.tempC || 40}°C</b> (Debu ${Math.round(s.dustPct || 0)}%)</div>
          <div style="display:flex;gap:6px;margin:4px 0;">
            <button type="button" class="${s.overclocked ? 'amber' : 'primary'}" onclick="toggleSlotOverclock(${s.id})">⚡ ${s.overclocked ? 'Overclock AKTIF (+1 Tier)' : 'Aktifkan Overclock (+1 Tier)'}</button>
            <button type="button" onclick="cleanSinglePcThermal(${s.id})">🌬️ Bersihkan Debu &amp; Pasta Thermal</button>
          </div>
          ${partRow('🧠 Processor (2/4/8 Slot RAM)', 'cpu', 'Cpus')}
          <div class="item-row" style="flex-direction:column;align-items:stretch;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <b>⚡ Slot RAM (${s.rams.length}/${maxRams} Keping • Total ${totalRamGb}GB)</b>
              ${s.rams.length < maxRams ? `<select style="width:auto;" onchange="if(this.value!=='')attachRamToSlot(${s.id},this.value)"><option value="">+ Tambah RAM (${state.warehouseRams.length})</option>${state.warehouseRams.map((r, idx) => `<option value="${idx}">${r.name}</option>`).join('')}</select>` : '<span class="badge ok">Slot Penuh</span>'}
            </div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;">
              ${s.rams.map((r, rIdx) => `<button type="button" class="danger" style="font-size:0.65rem;padding:2px 6px;" onclick="detachRamFromSlot(${s.id},${rIdx})">✕ ${r.sizeGb}GB</button>`).join('') || '<span class="spec-line">Belum ada RAM terpasang</span>'}
            </div>
          </div>
          ${partRow('🎮 VGA Card', 'vga', 'Vgas')}
          ${partRow('💾 Storage', 'storage', 'Storages')}
          ${partRow('🖥️ Monitor', 'monitor', 'Monitors')}
          ${partRow('🪑 Kursi Bilik', 'chair', 'Chairs')}
          ${partRow('❄️ Kipas/AC', 'cooling', 'Coolings')}
          <div class="item-row">
            <div><b>🪟 Windows OS:</b> ${s.os ? s.os.name : 'Belum Install'}</div>
            <select onchange="if(this.value)installWindowsOs(${s.id},this.value)">
              <option value="">-- Install Windows --</option>
              ${availOs.map(o => `<option value="${o.id}">${o.name} (${fmtRp(getPriceFrom2010(o.basePrice2010))})</option>`).join('')}
            </select>
          </div>
          <div class="item-row">
            <div><b>🖱️ Mouse+KB+Headset:</b> ${s.gear ? `${s.gear.name} (${s.gear.durability}%)` : 'Kosong'}</div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;">
              <button type="button" class="${state.cashierGearNew <= 0 ? 'btn-locked' : 'primary'}" onclick="attachGearToPc(${s.id},'new')">Standar (${state.cashierGearNew})</button>
              <button type="button" class="${(state.cashierGearMech || 0) <= 0 ? 'btn-locked' : 'success'}" onclick="attachGearToPc(${s.id},'mech')">Mech RGB (${state.cashierGearMech || 0})</button>
              <button type="button" class="${state.cashierGearServiced <= 0 ? 'btn-locked' : 'amber'}" onclick="attachGearToPc(${s.id},'serviced')">Servis (${state.cashierGearServiced})</button>
            </div>
          </div>
          <div class="card">
            <b>💿 Instal / Uninstal Game di PC Ini (${usedGb} / ${totalGb} GB)</b>
            ${ownedLibGames.length === 0 ? `<div class="spec-line">Belum ada kaset/installer game yang dibeli di tab <b>🌐 Game/ISP</b>!</div>` : ''}
            ${ownedLibGames.map(g => {
              const isInst = s.installedGames.includes(g.id);
              const fitSpace = (usedGb + g.sizeGb) <= totalGb;
              const fitSpec = pcTier >= g.minTier;
              return `<div class="item-row">
                <div><b>${g.title}</b><div class="spec-line">${g.sizeGb}GB • Min Tier ${g.minTier}</div></div>
                ${isInst
                  ? `<button type="button" class="danger" onclick="toggleGameOnPc(${s.id},'${g.id}',false)">Uninstal</button>`
                  : `<button type="button" class="${(!fitSpace || !fitSpec) ? 'btn-locked' : 'primary'}" onclick="toggleGameOnPc(${s.id},'${g.id}',true)">${!fitSpec ? '🔒 Spek Kurang' : !fitSpace ? '🔒 HDD Penuh' : 'Instal'}</button>`}
              </div>`;
            }).join('')}
          </div>`}`
  );
}

function attachRamToSlot(slotId, whIdx) {
  const s = state.slots.find(x => x.id === slotId);
  const idx = Number(whIdx);
  if (!s || !state.warehouseRams[idx]) return;
  if (!Array.isArray(s.rams)) s.rams = [];
  const maxRams = s.cpu ? (s.cpu.maxRamSlots || 2) : 2;
  if (s.rams.length >= maxRams) {
    showFloatingToast(`🔒 <b>Slot RAM Penuh (${maxRams} Slot)!</b><br>Upgrade Processor ke seri yang mendukung 4 atau 8 Slot RAM untuk menambah keping RAM lagi.`, 'warn');
    return;
  }
  s.rams.push(state.warehouseRams.splice(idx, 1)[0]);
  saveGame(); openSlotConfigModal(slotId); renderAll();
}

function detachRamFromSlot(slotId, rIdx) {
  const s = state.slots.find(x => x.id === slotId);
  if (!s || !Array.isArray(s.rams) || !s.rams[rIdx]) return;
  state.warehouseRams.push(s.rams.splice(rIdx, 1)[0]);
  saveGame(); openSlotConfigModal(slotId); renderAll();
}

function toggleGameOnPc(slotId, gameId, doInstall) {
  const s = state.slots.find(x => x.id === slotId);
  if (!s) return;
  if (!Array.isArray(s.installedGames)) s.installedGames = [];
  const g = GAME_DISC_CATALOG.find(x => x.id === gameId);
  if (doInstall && g) {
    const pcTier = getPcTier(s);
    const totalGb = getPcTotalStorageGb(s);
    const usedGb = getPcUsedStorageGb(s);
    if (pcTier < g.minTier) {
      const cpuT = s.cpu ? s.cpu.tier : 0;
      const vgaT = s.vga ? s.vga.tier : 0;
      const ramGb = getPcTotalRamGb(s);
      const ramT = ramGb >= 64 ? 12 : ramGb >= 32 ? 10 : ramGb >= 16 ? 8 : ramGb >= 8 ? 5 : ramGb >= 4 ? 3 : ramGb >= 2 ? 2 : 0;
      showFloatingToast(`🔒 <b>Spek PC Kurang untuk ${g.title}!</b><br>Butuh minimal <b>Tier ${g.minTier}</b>, sedangkan PC ini masih <b>Tier ${pcTier}</b> (CPU Tier ${cpuT}, RAM ${ramGb}GB=Tier ${ramT}, VGA Tier ${vgaT}).<br>💡 <b>Solusi:</b> Upgrade komponen yang Tier-nya paling rendah atau tekan tombol <b>⚡ Aktifkan Overclock (+1 Tier)</b>!`, 'warn');
      return;
    }
    if ((usedGb + g.sizeGb) > totalGb) {
      showFloatingToast(`🔒 <b>Kapasitas HDD/SSD Tidak Cukup!</b><br>Game <b>${g.title}</b> butuh <b>${g.sizeGb} GB</b>, sedangkan sisa ruang kosong di PC ini hanya <b>${Math.max(0, +(totalGb - usedGb).toFixed(1))} GB</b> (Total ${totalGb} GB).<br>💡 <b>Solusi:</b> Uninstal game lain atau ganti HDD/SSD yang lebih besar!`, 'warn');
      return;
    }
    if (!s.installedGames.includes(gameId)) s.installedGames.push(gameId);
    showFloatingToast(`✅ Berhasil meng-instal <b>${g.title}</b> di <b>${s.name}</b>!`, 'ok');
  } else {
    s.installedGames = s.installedGames.filter(id => id !== gameId);
    if (g) showFloatingToast(`🗑️ Meng-uninstal <b>${g.title}</b> dari <b>${s.name}</b>.`, 'info');
  }
  playSfx('click');
  saveGame(); openSlotConfigModal(slotId); renderAll();
}

function notifyUpcomingItemPopup(cat, id) {
  let list = [];
  if (cat === 'cpu') list = PC_CPU_CATALOG;
  else if (cat === 'ram') list = PC_RAM_CATALOG;
  else if (cat === 'vga') list = PC_VGA_CATALOG;
  else if (cat === 'storage') list = PC_STORAGE_CATALOG;
  else if (cat === 'monitor') list = MONITOR_CATALOG;
  else if (cat === 'cooling') list = COOLING_CATALOG;
  else if (cat === 'chair') list = typeof CHAIR_CATALOG !== 'undefined' ? CHAIR_CATALOG : [];
  else if (cat === 'ps') list = typeof PS_CONSOLE_CATALOG !== 'undefined' ? PS_CONSOLE_CATALOG : [];
  else list = PERIPHERAL_CATALOG;
  const it = list.find(x => x.id === id);
  if (!it) return;
  notifyBlockedPopup(
    `Item Belum Rilis (Tahun ${it.releaseYear})`,
    `<b>${it.name}</b> baru rilis di Indonesia pada <b>Tahun ${it.releaseYear}</b> (Saat ini Tahun <b>${state.year}</b>).<br><br>💡 Klik tombol <b>🌍 Semua Era ON</b> di bagian atas Toko jika ingin langsung membuka seluruh komponen 2010–2026+!`
  );
}

function attachPcPart(slotId, prop, whKey, idxStr) {
  const s = state.slots.find(x => x.id === slotId);
  const wh = state['warehouse' + whKey];
  const idx = Number(idxStr);
  if (!s || !wh || !wh[idx]) return;
  s[prop] = wh.splice(idx, 1)[0];
  saveGame();
  openSlotConfigModal(slotId);
  renderAll();
}

function detachPcPart(slotId, prop, whKey) {
  const s = state.slots.find(x => x.id === slotId);
  if (!s || !s[prop]) return;
  s.occupied = false;
  state['warehouse' + whKey].push(s[prop]);
  s[prop] = null;
  saveGame();
  openSlotConfigModal(slotId);
  renderAll();
}

function installWindowsOs(slotId, osId) {
  const s = state.slots.find(x => x.id === slotId);
  const os = PC_OS_CATALOG.find(o => o.id === osId);
  if (!s || !os) return;
  const cost = getPriceFrom2010(os.basePrice2010);
  if (!deductFromAnyCash(cost)) return addLog('⚠️ Uang kurang untuk install Windows!');
  s.os = { ...os };
  addLog(`🪟 Meng-install <b>${os.name}</b> di <b>${s.name}</b> (${fmtRp(cost)}).`);
  saveGame();
  openSlotConfigModal(slotId);
  renderAll();
}

function setSlotUnitType(slotId, mode) {
  const s = state.slots.find(x => x.id === slotId);
  if (!s) return;
  s.occupied = false;
  s.unitType = mode === 'ps' ? 'ps' : 'pc';
  playSfx('click');
  saveGame();
  openSlotConfigModal(slotId);
  renderAll();
}

function toggleSlotOverclock(slotId) {
  const s = state.slots.find(x => x.id === slotId);
  if (!s) return;
  s.overclocked = !s.overclocked;
  playSfx('click');
  addLog(`⚡ Overclocking pada <b>${s.name}</b> kini <b>${s.overclocked ? 'AKTIF (+1 Tier Spek)' : 'NONAKTIF'}</b>.`);
  saveGame();
  openSlotConfigModal(slotId);
  renderAll();
}

function cleanSinglePcThermal(slotId) {
  const s = state.slots.find(x => x.id === slotId);
  if (!s) return;
  const hasKompresor = state.facilities && state.facilities.fac_kompresor;
  const cost = hasKompresor ? 0 : getPriceFrom2010(15000);
  if (cost > 0 && !deductFromAnyCash(cost)) return;
  s.dustPct = 0;
  s.tempC = 38;
  playSfx('click');
  addLog(`🌬️ Debu &amp; Pasta Thermal <b>${s.name}</b> dibersihkan (${hasKompresor ? 'Gratis Kompresor' : fmtRp(cost)}). Suhu dingin 38°C!`);
  saveGame();
  openSlotConfigModal(slotId);
  renderAll();
}

function cleanAllPcDustAndPaste() {
  const hasKompresor = state.facilities && state.facilities.fac_kompresor;
  const cost = hasKompresor ? 0 : getPriceFrom2010(75000);
  if (cost > 0 && !deductFromAnyCash(cost)) return;
  state.slots.forEach(s => {
    s.dustPct = 0;
    s.tempC = 38;
  });
  playSfx('cash');
  addLog(`🌬️ Seluruh 20 PC disemprot Kompresor &amp; diganti Pasta Thermal (${hasKompresor ? 'Gratis Kompresor' : fmtRp(cost)})! Suhu semua PC dingin 38°C!`);
  saveGame();
  renderAll();
}

function holdWeekendTournament() {
  const readySlots = state.slots.filter(s => isSlotReadyToPlay(s).ok);
  if (readySlots.length < 6) {
    return notifyBlockedPopup(
      'Unit PC / PS Belum Cukup untuk Turnamen',
      `Untuk menggelar Turnamen Lokal, minimal harus ada <b>6 unit PC / Rental PS</b> yang sudah lengkap &amp; siap main.<br><br>Saat ini baru ada <b>${readySlots.length} unit</b> yang siap main. Rakit/lengkapi bilik terlebih dahulu!`
    );
  }
  const daysSince = state.totalDays - (state.lastTournamentDay || -10);
  if (daysSince < 5) {
    return notifyBlockedPopup(
      'Turnamen Masih Cooldown',
      `Kamu baru saja menggelar turnamen ${daysSince} hari yang lalu.<br>Tunggu <b>${5 - daysSince} hari lagi</b> untuk menggelar turnamen berikutnya!`
    );
  }
  const prizeCost = getPriceFrom2010(350000);
  if (!deductFromAnyCash(prizeCost)) return;
  state.lastTournamentDay = state.totalDays;
  const participants = readySlots.length * 4;
  const regFee = getPriceFrom2010(25000);
  const grossRev = participants * regFee;
  addRevenueToWarnet(grossRev, 'extra');
  state.reputationBonus = (state.reputationBonus || 0) + 2;
  state.members = state.members || { count: 0, discountPct: 10 };
  state.members.count += 3;
  playSfx('cash');
  addLog(`🏆 <b>TURNAMEN WARNET &amp; RENTAL PS SUKSES!</b> ${participants} peserta mendaftar. Hadiah -${fmtRp(prizeCost)}, Pendaftaran <b style="color:var(--green)">+${fmtRp(grossRev)}</b>, +3 Member VIP &amp; Rating Warnet naik!`);
  saveGame();
  renderAll();
}

function attachGearToPc(slotId, quality) {
  const s = state.slots.find(x => x.id === slotId);
  if (!s) return;
  if (quality === 'new') {
    if (state.cashierGearNew <= 0) {
      return showFloatingToast('🔒 <b>Stok Gear Standar Baru di Kasir Kosong (0)!</b><br>Beli dulu di menu <b>🛒 Rakit/Server -> 🖱️ Gear Set</b>.', 'warn');
    }
    state.cashierGearNew--;
    s.gear = { name: 'Set Gear Standar', quality: 'new', durability: 100, maxDurability: 100 };
    showFloatingToast(`✅ Memasang <b>Set Gear Standar (100%)</b> ke <b>${s.name}</b>.`, 'ok');
  } else if (quality === 'mech') {
    if ((state.cashierGearMech || 0) <= 0) {
      return showFloatingToast('🔒 <b>Stok Mechanical RGB Gear di Kasir Kosong (0)!</b><br>Beli dulu di menu <b>🛒 Rakit/Server -> 🖱️ Gear Set</b> (Rilis 2014+).', 'warn');
    }
    state.cashierGearMech--;
    s.gear = { name: 'Set Mechanical RGB', quality: 'mech', durability: 220, maxDurability: 220 };
    showFloatingToast(`✅ Memasang <b>Set Mechanical RGB (220%)</b> ke <b>${s.name}</b>.`, 'ok');
  } else if (quality === 'serviced') {
    if (state.cashierGearServiced <= 0) {
      return showFloatingToast('🔒 <b>Stok Gear Hasil Servis Kosong (0)!</b><br>Servis dulu gear yang rusak di menu <b>🔧 Teknisi/Part</b>.', 'warn');
    }
    state.cashierGearServiced--;
    s.gear = { name: 'Set Gear Servis', quality: 'serviced', durability: 65, maxDurability: 65 };
    showFloatingToast(`✅ Memasang <b>Set Gear Servis (65%)</b> ke <b>${s.name}</b>.`, 'ok');
  }
  playSfx('click');
  saveGame();
  openSlotConfigModal(slotId);
  renderAll();
}

// ==================== PEMBELIAN KOMPONEN, SERVER, ISP, GAME, GALON, GENSET & KARYAWAN SENIN-MINGGU ====================
function buyPcComponent(cat, id) {
  let item, whKey;
  const itMult = state.itCourseCompleted ? 0.85 : 1.0;
  const whMult = getWholesaleDiscountMult();
  const discMult = +(itMult * whMult).toFixed(3);
  state.warehouseChairs = state.warehouseChairs || [];
  state.warehousePsConsoles = state.warehousePsConsoles || [];
  if (cat === 'cpu') { item = PC_CPU_CATALOG.find(x => x.id === id); whKey = 'warehouseCpus'; }
  else if (cat === 'ram') { item = PC_RAM_CATALOG.find(x => x.id === id); whKey = 'warehouseRams'; }
  else if (cat === 'vga') { item = PC_VGA_CATALOG.find(x => x.id === id); whKey = 'warehouseVgas'; }
  else if (cat === 'storage') { item = PC_STORAGE_CATALOG.find(x => x.id === id); whKey = 'warehouseStorages'; }
  else if (cat === 'monitor') { item = MONITOR_CATALOG.find(x => x.id === id); whKey = 'warehouseMonitors'; }
  else if (cat === 'cooling') { item = COOLING_CATALOG.find(x => x.id === id); whKey = 'warehouseCoolings'; }
  else if (cat === 'chair') { item = (typeof CHAIR_CATALOG !== 'undefined' ? CHAIR_CATALOG : []).find(x => x.id === id); whKey = 'warehouseChairs'; }
  else if (cat === 'ps') { item = (typeof PS_CONSOLE_CATALOG !== 'undefined' ? PS_CONSOLE_CATALOG : []).find(x => x.id === id); whKey = 'warehousePsConsoles'; }
  else if (cat === 'gear') {
    item = PERIPHERAL_CATALOG.find(x => x.id === id) || PERIPHERAL_CATALOG[0];
    const p = roundTo500(getPriceFrom2010(item.basePrice2010) * discMult);
    if (!deductFromAnyCash(p)) return;
    if (item.id === 'gear_mech') {
      state.cashierGearMech = (state.cashierGearMech || 0) + 1;
    } else {
      state.cashierGearNew++;
    }
    playSfx('cash');
    addLog(`🛒 Beli 1 <b>${item.name}</b> ke stok Kasir (${fmtRp(p)}).`);
    saveGame(); renderAll(); return;
  }
  if (!item) return;
  const price = roundTo500(getPriceFrom2010(item.basePrice2010) * discMult);
  if (!deductFromAnyCash(price)) return;
  state[whKey].push({ ...item, uid: cat + '_' + Date.now(), cond: 100, boughtYear: state.year });
  playSfx('cash');
  addLog(`🛒 Membeli <b>${item.name}</b> (${fmtRp(price)}) ke Gudang.`);
  saveGame();
  renderAll();
}

function calcSecondhandPartPrice(it) {
  if (!it) return 0;
  const baseNow = getPriceFrom2010(it.basePrice2010 || 200000);
  const ageYears = Math.max(0, state.year - (it.boughtYear || state.year));
  const depMult = Math.max(0.30, 0.75 - (ageYears * 0.08));
  const condMult = (it.cond || 100) / 100;
  return roundTo500(baseNow * depMult * condMult);
}

function calcResalePrice(type, obj) {
  if (!obj) return 0;
  const ageYears = Math.max(0, state.year - (obj.boughtYear || state.year));
  if (type === 'gadget') {
    const cat = GADGET_CATALOG.find(x => x.id === obj.id);
    const base2010 = cat ? cat.price2010 : (obj.price2010 || 3500000);
    const brand = (cat ? cat.brand : obj.brand) || '';
    // iPhone / Apple harga jual second jauh lebih stabil dibanding merek lain!
    const isApple = brand.toLowerCase().includes('apple') || (obj.name || '').toLowerCase().includes('iphone');
    const ratio = isApple
      ? Math.max(0.48, 0.85 - (ageYears * 0.055))
      : Math.max(0.25, 0.72 - (ageYears * 0.12));
    return roundTo500(getPriceFrom2010(base2010) * ratio);
  }
  if (type === 'vehicle') {
    const cat = VEHICLE_CATALOG.find(x => x.id === obj.id);
    const base2010 = cat ? cat.price2010 : (obj.price2010 || 14000000);
    const condMult = ((obj.engineCond ?? 90) / 100);
    const ratio = Math.max(0.32, 0.78 - (ageYears * 0.07));
    return roundTo500(getPriceFrom2010(base2010) * ratio * condMult);
  }
  if (type === 'house') {
    const pr = PROPERTY_CATALOG.find(x => x.name === obj.name);
    const base2010 = obj.basePrice2010 || (pr ? pr.basePrice2010 : 95000000);
    // Properti / Rumah cenderung naik/stabil seiring tahun!
    const ratio = Math.min(1.35, 0.85 + (ageYears * 0.03));
    return roundTo500(getPriceFrom2010(base2010) * ratio);
  }
  return 0;
}

function upgradePlnMeterLevel() {
  const next = (typeof PLN_METER_LEVELS !== 'undefined' ? PLN_METER_LEVELS : [])[(state.plnMeterLevel || 1)];
  if (!next) return;
  const cost = getPriceFrom2010(next.baseCost2010);
  if (!deductFromAnyCash(cost)) return;
  state.plnMeterLevel = next.level;
  playSfx('cash');
  addLog(`🔌 <b>UPGRADE DAYA LISTRIK PLN!</b> Meteran ruko kini <b>${next.name} (Maks ${next.maxWatts}W)</b>!`);
  saveGame();
  renderAll();
}

function buySecondBranch(kind) {
  state.branches = state.branches || { warnetOwned: false, psRentalOwned: false };
  if (kind === 'warnet') {
    if (state.branches.warnetOwned) return;
    const cost = getPriceFrom2010(45000000);
    if (!deductFromAnyCash(cost)) return;
    state.branches.warnetOwned = true;
    playSfx('cash');
    addLog(`🏪 <b>CABANG KE-2 WARNET iCAFE DIBUKA!</b> Manajer cabang akan menyetor profit bersih setiap hari ke Bank!`);
  } else if (kind === 'ps') {
    if (state.branches.psRentalOwned) return;
    const cost = getPriceFrom2010(32000000);
    if (!deductFromAnyCash(cost)) return;
    state.branches.psRentalOwned = true;
    playSfx('cash');
    addLog(`🎮 <b>CABANG RENTAL PLAYSTATION VIP DIBUKA!</b> Setoran harian rental PS otomatis masuk ke Bank setiap hari!`);
  }
  saveGame();
  renderAll();
}

function toggleRentOutVehicle(idx) {
  const v = state.ownedVehicles[idx];
  if (!v) return;
  v.rentedOut = !v.rentedOut;
  playSfx('click');
  const dailyRent = getPriceFrom2010(v.commercialDaily2010 || 95000);
  addLog(`🚕 Status <b>${v.name}</b>: <b>${v.rentedOut ? `Disewakan Jadi Travel/Kargo (+${fmtRp(dailyRent)}/hari ke Bank)` : 'Dipakai Pribadi'}</b>.`);
  saveGame();
  renderAll();
}

function toggleChildEliteSchool(idx) {
  const ch = (state.player.childrenList || [])[idx];
  if (!ch) return;
  ch.eliteSchool = !ch.eliteSchool;
  playSfx('click');
  addLog(`🏫 Pendidikan <b>${ch.name}</b>: <b>${ch.eliteSchool ? 'Terdaftar di Sekolah Unggulan IT & Bisnis (Otomatis Lulus Sertifikasi IT saat Warisan!)' : 'Sekolah Reguler'}</b>.`);
  saveGame();
  renderAll();
}

function buyFacilityItem(facId) {
  state.facilities = state.facilities || {};
  const fac = (typeof WARNET_FACILITIES_CATALOG !== 'undefined' ? WARNET_FACILITIES_CATALOG : []).find(x => x.id === facId);
  if (!fac) return;
  if (state.facilities[facId]) {
    return showFloatingToast(`✅ <b>${fac.name}</b> sudah terpasang dan aktif di ruko warnetmu!`, 'ok');
  }
  const price = getPriceFrom2010(fac.basePrice2010);
  if (!deductFromAnyCash(price)) return;
  state.facilities[facId] = true;
  playSfx('cash');
  addLog(`${fac.icon || '🏢'} Memasang <b>${fac.name}</b> (${fmtRp(price)})! ${fac.desc}`);
  saveGame();
  renderAll();
}

function payEmployeeNowManual(idx) {
  const emp = state.employees[idx];
  if (!emp) return;
  payEmployeeSalary(emp, `Manual (${emp.payPeriod})`);
  saveGame();
  renderAll();
}

function buyGoldGrams(grams) {
  const g = Math.max(1, Number(grams) || 1);
  const pricePerGram = typeof getHistoricalGoldPricePerGram === 'function' ? getHistoricalGoldPricePerGram(state.year, state.totalDays) : getPriceFrom2010(385000);
  const totalCost = g * pricePerGram;
  if (!deductFromAnyCash(totalCost)) return;
  state.goldGrams = (state.goldGrams || 0) + g;
  playSfx('cash');
  addLog(`🪙 Membeli <b>${g} gram Emas Antam</b> seharga <b>${fmtRp(totalCost)}</b> (${fmtRp(pricePerGram)}/gr).`);
  saveGame();
  renderAll();
}

function sellGoldGrams(grams) {
  state.goldGrams = state.goldGrams || 0;
  if (state.goldGrams <= 0) {
    return notifyBlockedPopup(
      'Belum Punya Tabungan Emas Antam',
      'Saldo tabungan Emas Antam kamu saat ini masih <b>0 gram</b>.<br>Beli emas terlebih dahulu melalui tombol <b>+ Beli 1gr</b> atau <b>+ Beli 5gr</b>!'
    );
  }
  const g = Math.min(state.goldGrams, Math.max(1, Number(grams) || 1));
  const pricePerGram = typeof getHistoricalGoldPricePerGram === 'function' ? getHistoricalGoldPricePerGram(state.year, state.totalDays) : getPriceFrom2010(385000);
  const totalProceeds = g * pricePerGram;
  state.goldGrams -= g;
  state.handWallet += totalProceeds;
  playSfx('cash');
  addLog(`💸 Menjual <b>${g} gram Emas Antam</b>: <b style="color:var(--green)">+${fmtRp(totalProceeds)}</b> masuk ke Dompet!`);
  saveGame();
  renderAll();
}

function takeItNightCourse() {
  if (state.itCourseCompleted) {
    return showFloatingToast('✅ Kamu sudah lulus Sertifikasi Teknisi IT (Diskon 15% komponen PC aktif)!', 'ok');
  }
  if (state.player.age < 18) {
    return notifyBlockedPopup(
      'Syarat Usia Kuliah / Kursus Malam IT (Minimal 18 Tahun)',
      `Usiamu saat ini masih <b>${state.player.age} tahun</b> (masih usia sekolah).<br><br>Kamu baru bisa mendaftar <b>Kursus / Kuliah Malam Sertifikasi Teknisi IT</b> setelah berusia <b>18 tahun</b>!`
    );
  }
  const cost = getPriceFrom2010(4500000);
  if (!deductFromAnyCash(cost)) return;
  state.itCourseCompleted = true;
  playSfx('cash');
  addLog(`🎓 <b>Selamat!</b> Kamu lulus Kursus & Sertifikasi Teknisi IT (${fmtRp(cost)}). Semua komponen rakit PC di Toko kini <b>Diskon Permanen 15%</b>!`);
  saveGame();
  renderAll();
}

function giveFamilyGift() {
  const cost = getPriceFrom2010(500000);
  if (!deductFromAnyCash(cost)) return addLog('⚠️ Uang di Dompet/Bank tidak cukup untuk membeli hadiah keluarga!');
  state.familyHappiness = Math.min(100, (state.familyHappiness ?? 85) + 15);
  state.player.energy = Math.min(100, (state.player.energy ?? 80) + 20);
  playSfx('cash');
  addLog(`🎁 Membelikan hadiah & makan bersama keluarga (${fmtRp(cost)}). Kebahagiaan keluarga naik ke <b>${state.familyHappiness}%</b> & Stamina +20%!`);
  saveGame();
  renderAll();
}

function sellEmergencyAsset(type, idx) {
  if (type === 'vehicle') {
    const v = state.ownedVehicles[idx];
    if (!v) return;
    const sellPrice = calcResalePrice('vehicle', v);
    state.ownedVehicles.splice(idx, 1);
    state.handWallet += sellPrice;
    playSfx('cash');
    addLog(`💸 Menjual kendaraan <b>${v.name}</b> (Harga Second Tahun ${state.year}): <b style="color:var(--green)">+${fmtRp(sellPrice)}</b> masuk ke Dompet.`);
  } else if (type === 'gadget') {
    const g = state.ownedGadgets[idx];
    if (!g) return;
    const sellPrice = calcResalePrice('gadget', g);
    state.ownedGadgets.splice(idx, 1);
    state.handWallet += sellPrice;
    playSfx('cash');
    addLog(`💸 Menjual gadget second <b>${g.name}</b>: <b style="color:var(--green)">+${fmtRp(sellPrice)}</b> masuk ke Dompet.`);
  } else if (type === 'house') {
    const h = (state.ownedHouses || [])[idx];
    if (!h) return;
    const sellPrice = calcResalePrice('house', h);
    state.ownedHouses.splice(idx, 1);
    state.personalBank += sellPrice;
    playSfx('cash');
    addLog(`💸 Menjual properti <b>${h.name}</b>: <b style="color:var(--green)">+${fmtRp(sellPrice)}</b> masuk ke Bank.`);
  }
  saveGame();
  renderAll();
}

function sellSecondhandPart(whSuffix, idx) {
  const arr = state['warehouse' + whSuffix];
  if (!arr || !arr[idx]) return;
  const it = arr.splice(idx, 1)[0];
  const price = calcSecondhandPartPrice(it);
  state.handWallet += price;
  playSfx('cash');
  addLog(`💸 Menjual komponen second <b>${it.name}</b>: <b style="color:var(--green)">+${fmtRp(price)}</b> masuk ke Dompet.`);
  saveGame();
  renderAll();
}

function upgradeCashierServer() {
  const next = SERVER_LEVELS[state.serverLevel];
  if (!next) return;
  const cost = getPriceFrom2010(next.baseCost2010);
  if (!deductFromAnyCash(cost)) return addLog('⚠️ Uang kurang untuk upgrade PC Server Kasir!');
  state.serverLevel = next.level;
  playSfx('cash');
  addLog(`🖥️ <b>UPGRADE SERVER KASIR!</b> Kini menggunakan <b>${next.name}</b>.`);
  saveGame();
  renderAll();
}

function upgradeRenovation() {
  const next = RENOV_LEVELS[state.renovLevel];
  if (!next) return;
  const cost = getPriceFrom2010(next.baseCost2010);
  if (!deductFromAnyCash(cost)) return addLog('⚠️ Uang kurang untuk renovasi!');
  state.renovLevel = next.level;
  playSfx('cash');
  addLog(`🧱 Renovasi warnet naik ke <b>${next.name}</b>!`);
  saveGame();
  renderAll();
}

function changeInternetPlan(planId) {
  const p = INTERNET_PLANS.find(x => x.id === planId);
  if (!p) return;
  if (state.internetPlanId === p.id) {
    return showFloatingToast(`✅ Paket internet <b>${p.name}</b> sudah aktif di warnetmu!`, 'ok');
  }
  const installFee = p.monthlyReal || 295000;
  if (!deductFromAnyCash(installFee)) return;
  state.internetPlanId = p.id;
  playSfx('cash');
  addLog(`🌐 Paket internet warnet di-upgrade ke <b>${p.name} (${p.mbps} Mbps)</b> — ${fmtRp(installFee)}/bln!`);
  saveGame();
  renderAll();
}

function startRukoKpr() {
  const price = getPriceFrom2010(120000000);
  const dp = Math.round(price * 0.2);
  if (!deductFromAnyCash(dp)) return;
  const rem = price - dp;
  state.property = { owned: false, kprActive: true, kprRemaining: rem, kprMonthly: Math.ceil(rem / 36), kprMonthsLeft: 36 };
  playSfx('cash');
  addLog(`🏠 KPR Ruko Warnet disetujui! DP <b>-${fmtRp(dp)}</b>, cicilan 36 bln @ ${fmtRp(state.property.kprMonthly)}/bln.`);
  saveGame(); renderAll();
}

function buyRukoCash() {
  const price = getPriceFrom2010(120000000);
  if (!deductFromAnyCash(price)) return;
  state.property = { owned: true, kprActive: false, kprRemaining: 0, kprMonthly: 0, kprMonthsLeft: 0 };
  playSfx('cash');
  addLog(`🎉 Membeli Ruko Warnet secara tunai (${fmtRp(price)})! Bebas sewa selamanya!`);
  saveGame(); renderAll();
}

function payOffRukoKpr() {
  if (!state.property || !state.property.kprActive) return;
  if (!deductFromAnyCash(state.property.kprRemaining)) return;
  state.property = { owned: true, kprActive: false, kprRemaining: 0, kprMonthly: 0, kprMonthsLeft: 0 };
  playSfx('cash');
  addLog('🎉 KPR Ruko Warnet LUNAS sepenuhnya!');
  saveGame(); renderAll();
}

function payParentLoanNow(all) {
  if (!state.parentLoan.active) return;
  const amt = all ? state.parentLoan.remainingTotal : Math.min(state.parentLoan.remainingTotal, state.parentLoan.weeklyInstallment);
  if (!deductFromAnyCash(amt)) return;
  state.parentLoan.remainingTotal -= amt;
  state.parentLoan.weeksLeft = all ? 0 : Math.max(0, state.parentLoan.weeksLeft - 1);
  if (state.parentLoan.remainingTotal <= 0) state.parentLoan.active = false;
  playSfx('cash');
  addLog(`👨‍👩‍👦 Bayar hutang ke Orang Tua: <b>-${fmtRp(amt)}</b>${!state.parentLoan.active ? ' (LUNAS!)' : ''}.`);
  saveGame(); renderAll();
}

function payBankLoanNow(all) {
  if (!state.bankLoan.active) return;
  const amt = all ? state.bankLoan.remainingTotal : Math.min(state.bankLoan.remainingTotal, state.bankLoan.monthlyInstallment);
  if (!deductFromAnyCash(amt)) return;
  state.bankLoan.remainingTotal -= amt;
  state.bankLoan.monthsLeft = all ? 0 : Math.max(0, state.bankLoan.monthsLeft - 1);
  if (state.bankLoan.remainingTotal <= 0) state.bankLoan.active = false;
  playSfx('cash');
  addLog(`🏦 Bayar hutang Bank: <b>-${fmtRp(amt)}</b>${!state.bankLoan.active ? ' (LUNAS!)' : ''}.`);
  saveGame(); renderAll();
}

function installOrBuyPcGame(gameId) {
  const g = GAME_DISC_CATALOG.find(x => x.id === gameId);
  if (!g) return;
  const cost = g.basePrice2010 > 0 ? getPriceFrom2010(g.basePrice2010) : 0;
  if (cost > 0 && !deductFromAnyCash(cost)) return addLog('⚠️ Uang kurang untuk beli kaset DVD Installer PC!');
  state.installedGames[g.id] = true;
  if (g.patchMb > 0) {
    state.pendingGamePatches[g.id] = g.patchMb;
    triggerManualPatchAll(true);
  }
  playSfx('cash');
  addLog(`💿 Menyediakan game <b>${g.title}</b> di Warnet!`);
  saveGame();
  renderAll();
}

function manualServiceGear() {
  if (state.cashierGearBroken <= 0) {
    return notifyBlockedPopup(
      'Tidak Ada Gear yang Rusak (0 Set)',
      'Saat ini belum ada Mouse/Keyboard/Headset yang rusak di stok kasir.<br><br>Ketika gear di bilik PC aus hingga 0% setelah dipakai pelanggan, gear tersebut otomatis masuk ke stok rusak untuk diservis di sini.'
    );
  }
  const partCost = getPriceFrom2010(10000);
  if (!deductFromAnyCash(partCost)) return;
  state.cashierGearBroken--;
  state.cashierGearServiced++;
  playSfx('click');
  addLog(`🔧 Kamu menyervis 1 Set Mouse+KB+Headset (Masuk ke Stok Servis 65%).`);
  saveGame();
  renderAll();
}

function buyWarnetSupply(id) {
  const it = WARNET_SUPPLY_CATALOG.find(x => x.id === id);
  if (!it) return;
  if (it.requiresFacility && !(state.facilities && state.facilities[it.requiresFacility])) {
    const reqFac = (typeof WARNET_FACILITIES_CATALOG !== 'undefined' ? WARNET_FACILITIES_CATALOG : []).find(f => f.id === it.requiresFacility);
    const facName = reqFac ? reqFac.name : 'Fasilitas Ruko';
    return notifyBlockedPopup(
      `Butuh Fasilitas: ${facName}`,
      `Untuk membeli &amp; menjual <b>${it.name}</b>, ruko warnetmu wajib memasang <b>${facName}</b> terlebih dahulu!<br><br>
       <button type="button" class="primary" onclick="closeCustomModal();state.hwCategoryFilter='fac';openDrawerTab('store_hw')">🏢 Buka Menu Fasilitas Ruko Sekarang</button>`
    );
  }
  const whMult = getWholesaleDiscountMult();
  const cost = roundTo500(getPriceFrom2010(it.boxPrice2010) * whMult);
  if (!deductFromAnyCash(cost)) return;
  if (it.kind === 'galon') {
    state.waterGallonServings += it.servings;
    addLog(`💧 Beli 1 Galon Air 19L (+${it.servings} porsi seduhan) seharga ${fmtRp(cost)}.`);
  } else {
    state.snackStockPcs[it.id] = (state.snackStockPcs[it.id] || 0) + it.pcsPerBox;
    addLog(`🍜 Beli 1 Dus/Pak <b>${it.name}</b> (+${it.pcsPerBox} pcs) seharga ${fmtRp(cost)}.`);
  }
  playSfx('cash');
  saveGame();
  renderAll();
}

function refuelGenset(liters) {
  const need = Math.min(liters, state.genset.maxTankLiters - state.genset.fuelLiters);
  if (need <= 0.1) return addLog('⛽ Tangki bensin Genset sudah penuh!');
  const cost = Math.round(need * getBbmPricePerLiter(state.year));
  if (!deductFromAnyCash(cost)) return addLog('⚠️ Uang kurang untuk beli bensin Genset!');
  state.genset.fuelLiters = +(state.genset.fuelLiters + need).toFixed(1);
  playSfx('cash');
  addLog(`⛽ Mengisi bensin Genset <b>+${need.toFixed(1)} Liter</b> (${fmtRp(cost)}).`);
  saveGame();
  renderAll();
}

function buyPlnToken(nom) {
  const info = calcPlnToken(nom, state.year);
  if (!deductFromAnyCash(info.totalPay)) return addLog('⚠️ Uang kurang untuk beli Token PLN!');
  state.kwh = +(state.kwh + info.kwhReceived).toFixed(2);
  state.plnBlackout = false;
  state.genset.active = false;
  playSfx('cash');
  addLog(`⚡ Isi Token PLN <b>${fmtRp(nom)}</b>: <b>+${info.kwhReceived} kWh</b>!`);
  saveGame();
  renderAll();
}

// ==================== REKRUT & EDIT KARYAWAN (CHECKLIST HARI SENIN - MINGGU) ====================
function openHireEmployeeModal(editIdx = -1) {
  const isEdit = editIdx >= 0 && state.employees[editIdx];
  const emp = isEdit ? state.employees[editIdx] : null;
  const umrNow = getCurrentUmr();
  const activeDays = emp && Array.isArray(emp.workDaysArray) ? emp.workDaysArray : [1, 2, 3, 4, 5, 6];
  const daysCheckHtml = [
    [1, 'Senin'], [2, 'Selasa'], [3, 'Rabu'], [4, 'Kamis'], [5, 'Jumat'], [6, 'Sabtu'], [0, 'Minggu']
  ].map(([dIdx, dName]) => `<label style="display:inline-flex;align-items:center;gap:3px;margin-right:8px;"><input type="checkbox" class="empDayCb" value="${dIdx}" ${activeDays.includes(dIdx) ? 'checked' : ''} style="width:auto"> ${dName}</label>`).join('');

  showCustomModal(
    isEdit ? `✏️ Perbarui Gaji & Jadwal: ${emp.name}` : '👷 Rekrut Karyawan & Teknisi Warnet',
    `<div class="spec-line">Centang bebas hari apa saja karyawan ini masuk kerja (Senin–Minggu):</div>
     <div class="grid-2">
       <div><label class="spec-line">Nama Karyawan</label><input id="empName" value="${emp ? emp.name : 'Rian Teknisi'}" /></div>
       <div><label class="spec-line">Skema Gaji</label><select id="empPeriod"><option value="daily" ${emp && emp.payPeriod === 'daily' ? 'selected' : ''}>Harian</option><option value="weekly" ${emp && emp.payPeriod === 'weekly' ? 'selected' : ''}>Mingguan</option><option value="monthly" ${!emp || emp.payPeriod === 'monthly' ? 'selected' : ''}>Bulanan</option></select></div>
     </div>
     <div class="grid-2">
       <div><label class="spec-line">Gaji Pokok (Rp)</label><input type="number" id="empSalary" value="${emp ? emp.salaryAmount : Math.round(umrNow * 0.6)}" /></div>
       <div><label class="spec-line">Insentif (Rp)</label><input type="number" id="empInc" value="${emp ? emp.incentive : 100000}" /></div>
     </div>
     <div class="grid-2">
       <div><label class="spec-line">Jam Masuk (0-23)</label><input type="number" id="empStart" min="0" max="23" value="${emp ? emp.startHour : 8}" /></div>
       <div><label class="spec-line">Durasi Kerja (Jam)</label><input type="number" id="empDur" min="4" max="16" value="${emp ? emp.durationHours : 8}" /></div>
     </div>
     <div class="spec-line"><b>📅 Hari Masuk Kerja (Senin–Minggu):</b><br>${daysCheckHtml}</div>
     <div class="spec-line">
       <b>🛠️ Tugas Karyawan:</b><br>
       <label><input type="checkbox" id="empTaskGuard" ${!emp || emp.tasks.includes('guard') ? 'checked' : ''} style="width:auto"> Jaga Operator Billing (Kamu tidak perlu ikut jaga)</label><br>
       <label><input type="checkbox" id="empTaskClean" ${!emp || emp.tasks.includes('clean') ? 'checked' : ''} style="width:auto"> Bersih-bersih Ruangan Warnet</label><br>
       <label><input type="checkbox" id="empTaskService" ${!emp || emp.tasks.includes('service') ? 'checked' : ''} style="width:auto"> Teknisi Servis Gear &amp; Update Patch Game</label><br>
       <label><input type="checkbox" id="empBpjs" ${!emp || emp.hasBpjs ? 'checked' : ''} style="width:auto"> Berikan BPJS Kesehatan</label>
     </div>`,
    `<button type="button" onclick="closeCustomModal()">Batal</button><button type="button" class="primary" onclick="confirmHireEmployee(${editIdx})">${isEdit ? '💾 Simpan Perubahan' : '✅ Rekrut'}</button>`
  );
}

function confirmHireEmployee(editIdx = -1) {
  const name = (document.getElementById('empName').value || 'Operator').trim();
  const payPeriod = document.getElementById('empPeriod').value;
  const salaryAmount = Math.max(10000, Number(document.getElementById('empSalary').value) || 500000);
  const incentive = Math.max(0, Number(document.getElementById('empInc').value) || 0);
  const startHour = Math.max(0, Math.min(23, Number(document.getElementById('empStart').value) || 8));
  const durationHours = Math.max(4, Math.min(16, Number(document.getElementById('empDur').value) || 8));
  const workDaysArray = [];
  document.querySelectorAll('.empDayCb:checked').forEach(cb => workDaysArray.push(Number(cb.value)));
  if (workDaysArray.length === 0) workDaysArray.push(1, 2, 3, 4, 5, 6);

  const tasks = [];
  if (document.getElementById('empTaskGuard').checked) tasks.push('guard');
  if (document.getElementById('empTaskClean').checked) tasks.push('clean');
  if (document.getElementById('empTaskService').checked) tasks.push('service');
  const hasBpjs = document.getElementById('empBpjs').checked;

  const obj = {
    id: (editIdx >= 0 && state.employees[editIdx]) ? state.employees[editIdx].id : Date.now(),
    name, payPeriod, salaryAmount, incentive, startHour, durationHours, workDaysArray, tasks, hasBpjs
  };
  if (editIdx >= 0 && state.employees[editIdx]) {
    state.employees[editIdx] = obj;
    addLog(`✏️ Jadwal &amp; gaji <b>${name}</b> diperbarui!`);
  } else {
    state.employees.push(obj);
    addLog(`👷 Merekrut <b>${name}</b> (${workDaysArray.length} hari/minggu, jam ${startHour}:00).`);
  }
  closeCustomModal();
  saveGame();
  renderAll();
}

function fireEmployee(idx) {
  const emp = state.employees[idx];
  if (!emp) return;
  state.employees.splice(idx, 1);
  playSfx('click');
  addLog(`👷 Karyawan <b>${emp.name}</b> telah diberhentikan.`);
  saveGame();
  renderAll();
}

// ==================== PINJAMAN, TRANSFER KAS, KARAKTER & CLOUD ====================
function takeParentLoan(amount) {
  if (state.parentLoan.active) {
    return notifyBlockedPopup('Pinjaman Orang Tua Masih Aktif', 'Lunasi pinjaman orang tua yang sedang berjalan terlebih dahulu sebelum meminjam lagi!');
  }
  const amt = Math.min(30000000, amount);
  state.personalBank += amt;
  state.parentLoan = { active: true, remainingTotal: amt, weeklyInstallment: Math.ceil(amt / 52), weeksLeft: 52 };
  playSfx('cash');
  addLog(`👨‍👩‍👦 Pinjaman Orang Tua cair <b>+${fmtRp(amt)}</b> ke Bank (52x mingguan tanpa bunga).`);
  saveGame(); renderAll();
}

function takeBankLoan(amount) {
  if (state.player.age < 21) {
    return notifyBlockedPopup(
      'Syarat Usia Kredit Usaha Bank (Minimal 21 Tahun)',
      `Pengajuan kredit ditolak oleh Bank karena usiamu saat ini masih <b>${state.player.age} tahun</b>.<br><br>
       💡 <b>Solusi:</b> Selama usia di bawah 21 tahun, gunakan <b>👨‍👩‍👦 Pinjaman Orang Tua (5–30 Juta, Bunga 0%)</b> di kartu atas!`
    );
  }
  if (state.bankLoan.active) {
    return notifyBlockedPopup('Kredit Bank Masih Berjalan', 'Kamu masih memiliki cicilan Kredit Usaha Bank yang aktif. Lunasi terlebih dahulu sebelum mengajukan kredit baru!');
  }
  const rate = getBankInterestRate(state.year);
  const months = amount > 60000000 ? 24 : 12;
  const total = Math.round(amount * (1 + (rate / 100) * (months / 12)));
  state.personalBank += amount;
  state.bankLoan = { active: true, principal: amount, remainingTotal: total, monthlyInstallment: Math.ceil(total / months), monthsLeft: months, interestRatePct: rate };
  playSfx('cash');
  addLog(`🏦 Kredit Usaha Bank cair <b>+${fmtRp(amount)}</b> ke Bank.`);
  saveGame(); renderAll();
}

function openBankTransferModal() {
  showCustomModal(
    '🏦 Kelola & Tarik Uang (Laci ⇄ Bank ⇄ Dompet)',
    `<div class="spec-line">Laci: <b>${fmtRp(state.laciCash)}</b> • Bank: <b>${fmtRp(state.personalBank)}</b> • Dompet: <b>${fmtRp(state.handWallet)}</b></div>
     <div class="grid-2">
       <div><label class="spec-line">Dari</label><select id="tfFrom"><option value="laci">Laci Kasir</option><option value="bank">Bank</option><option value="wallet">Dompet</option></select></div>
       <div><label class="spec-line">Ke</label><select id="tfTo"><option value="wallet">Dompet</option><option value="bank">Bank</option><option value="laci">Laci Kasir</option></select></div>
     </div>
     <div><label class="spec-line">Nominal (Rp)</label><input type="number" id="tfAmt" value="100000" min="1000" step="1000" /></div>
     <div class="grid-3">
       <button type="button" onclick="document.getElementById('tfAmt').value=10000">10rb</button>
       <button type="button" onclick="document.getElementById('tfAmt').value=50000">50rb</button>
       <button type="button" onclick="document.getElementById('tfAmt').value=100000">100rb</button>
       <button type="button" onclick="document.getElementById('tfAmt').value=500000">500rb</button>
       <button type="button" onclick="document.getElementById('tfAmt').value=1000000">1 Juta</button>
       <button type="button" class="amber" onclick="transferCustomFunds(true)">Tarik Semua</button>
     </div>`,
    `<button type="button" onclick="closeCustomModal()">Tutup</button><button type="button" class="primary" onclick="transferCustomFunds(false)">💸 Pindahkan Uang</button>`
  );
}

function transferCustomFunds(all) {
  const from = document.getElementById('tfFrom').value;
  const to = document.getElementById('tfTo').value;
  if (from === to) {
    return showFloatingToast('⚠️ Pilih rekening <b>Dari</b> dan <b>Ke</b> yang berbeda!', 'warn');
  }
  const keyMap = { laci: 'laciCash', bank: 'personalBank', wallet: 'handWallet' };
  const labelMap = { laci: 'Laci Kasir', bank: 'Bank', wallet: 'Dompet' };
  const avail = state[keyMap[from]] || 0;
  if (avail <= 0) {
    return showFloatingToast(`⚠️ Saldo di <b>${labelMap[from]}</b> saat ini masih <b>Rp 0</b>!`, 'warn');
  }
  const amt = all ? avail : Math.min(avail, Math.max(0, Number(document.getElementById('tfAmt').value) || 0));
  if (amt <= 0) {
    return showFloatingToast('⚠️ Masukkan nominal transfer yang valid!', 'warn');
  }
  state[keyMap[from]] -= amt;
  state[keyMap[to]] += amt;
  playSfx('cash');
  addLog(`💸 Memindahkan <b>${fmtRp(amt)}</b> dari <b>${labelMap[from]}</b> ke <b>${labelMap[to]}</b>.`);
  saveGame();
  openBankTransferModal();
  renderAll();
}

function buyVehicle(id, isInstallment = false) {
  const v = VEHICLE_CATALOG.find(x => x.id === id);
  if (!v) return;
  const price = getPriceFrom2010(v.price2010);
  if (isInstallment) {
    const dp = Math.round(price * 0.2);
    if (!deductFromAnyCash(dp)) return;
    const rem = Math.round((price - dp) * 1.12);
    const months = v.category === 'Mobil' ? 36 : 12;
    state.assetLoans = state.assetLoans || [];
    state.assetLoans.push({ name: v.name, active: true, remainingTotal: rem, monthlyInstallment: Math.ceil(rem / months), monthsLeft: months });
    state.ownedVehicles.push({ ...v, fuelLiters: v.tankCap, oilPct: 100, engineCond: 100, boughtYear: state.year, rentedOut: false });
    playSfx('cash');
    addLog(`💳 Kredit <b>${v.name}</b> disetujui! DP <b>-${fmtRp(dp)}</b>, cicilan ${months} bln @ ${fmtRp(Math.ceil(rem / months))}/bln.`);
  } else {
    if (!deductFromAnyCash(price)) return;
    state.ownedVehicles.push({ ...v, fuelLiters: v.tankCap, oilPct: 100, engineCond: 100, boughtYear: state.year, rentedOut: false });
    playSfx('cash');
    addLog(`🛵 Membeli tunai <b>${v.name}</b> (${fmtRp(price)}). Diskon belanja grosir aktif!`);
  }
  saveGame(); renderAll();
}

function buyOrInstallmentAsset(name, basePrice2010, isInstallment, kind, dpRate = 0.15) {
  const price = getPriceFrom2010(basePrice2010);
  if (isInstallment) {
    const dp = Math.round(price * (dpRate || 0.15));
    if (!deductFromAnyCash(dp)) return;
    const rem = Math.round((price - dp) * 1.15);
    const months = 60;
    state.assetLoans = state.assetLoans || [];
    state.assetLoans.push({ name, active: true, remainingTotal: rem, monthlyInstallment: Math.ceil(rem / months), monthsLeft: months });
    if (kind === 'house') state.ownedHouses.push({ name, basePrice2010, boughtYear: state.year });
    playSfx('cash');
    addLog(`🏠 KPR <b>${name}</b> disetujui! DP (${Math.round((dpRate || 0.15) * 100)}%) <b>-${fmtRp(dp)}</b>, cicilan 60 bln @ ${fmtRp(Math.ceil(rem / months))}/bln.`);
  } else {
    if (!deductFromAnyCash(price)) return;
    if (kind === 'house') state.ownedHouses.push({ name, basePrice2010, boughtYear: state.year });
    playSfx('cash');
    addLog(`🏠 Membeli tunai <b>${name}</b> (${fmtRp(price)})!`);
  }
  saveGame(); renderAll();
}

function payOffAssetLoan(idx) {
  const al = (state.assetLoans || [])[idx];
  if (!al || !al.active) return;
  if (!deductFromAnyCash(al.remainingTotal)) return;
  const paid = al.remainingTotal;
  al.remainingTotal = 0; al.monthsLeft = 0; al.active = false;
  playSfx('cash');
  addLog(`✅ Cicilan <b>${al.name}</b> dilunasi (${fmtRp(paid)})!`);
  saveGame(); renderAll();
}

function choosePartner(id) {
  if (state.player.age < 17) {
    return notifyBlockedPopup(
      'Belum Cukup Umur untuk Pacaran (Minimal 17 Tahun)',
      `Usiamu saat ini masih <b>${state.player.age} tahun</b>.<br>Kamu baru bisa mulai berpacaran setelah berusia minimal <b>17 tahun</b>!`
    );
  }
  const pt = PARTNERS_LIST.find(x => x.id === id);
  if (!pt) return;
  state.player.partner = pt;
  state.player.married = false;
  playSfx('click');
  addLog(`💕 Kamu resmi berpacaran dengan <b>${pt.name} (${pt.job})</b>!`);
  saveGame(); renderAll();
}

function marryPartner() {
  if (!state.player.partner) return;
  const cost = getPriceFrom2010(15000000);
  if (!deductFromAnyCash(cost)) return;
  state.player.married = true;
  playSfx('cash');
  addLog(`💍 Resmi menikah dengan <b>${state.player.partner.name}</b>!`);
  saveGame(); renderAll();
}

function haveChildWithPartner() {
  if (!state.player.married) return;
  const isBoy = Math.random() < 0.5;
  const cName = isBoy ? `Putra ${state.player.name.split(' ')[0]}` : `Putri ${state.player.name.split(' ')[0]}`;
  state.player.childrenList.push({ name: cName, gender: isBoy ? 'Laki-laki' : 'Perempuan', age: 0, birthDay: state.day, birthMonth: state.month, birthYear: state.year, eliteSchool: false, skillBonus: 0 });
  playSfx('cash');
  addLog(`👶 Anakmu <b>${cName}</b> lahir!`);
  saveGame(); renderAll();
}

function inheritToChild(idx) {
  const ch = state.player.childrenList[idx];
  if (!ch) return;
  if (ch.age < 8) {
    return notifyBlockedPopup(
      'Anak Masih Terlalu Kecil (Minimal 8 Tahun)',
      `Anakmu <b>${ch.name}</b> saat ini baru berusia <b>${ch.age} tahun</b>.<br>Tunggu hingga usianya minimal <b>8 tahun</b> untuk mewariskan seluruh usaha warnet kepadanya!`
    );
  }
  const hadElite = !!ch.eliteSchool;
  state.player.name = ch.name;
  state.player.gender = ch.gender;
  state.player.age = ch.age;
  state.player.birthYear = ch.birthYear;
  state.player.partner = null;
  state.player.married = false;
  state.player.childrenList = [];
  if (hadElite) {
    state.itCourseCompleted = true;
    state.reputationBonus = (state.reputationBonus || 0) + 3;
  }
  playSfx('cash');
  addLog(`👑 Seluruh usaha Warnet resmi diwariskan kepada <b>${ch.name}</b>${hadElite ? ' (Lulusan Sekolah Unggulan IT: Diskon 15% Komponen PC & Bonus Reputasi Aktif!)' : ''}!`);
  saveGame(); renderAll();
}

function restPlayerEnergy() {
  state.player.energy = 100;
  playSfx('click');
  addLog('😴 Kamu tidur & beristirahat cukup. Stamina kembali <b>100%</b> (Tahan 36 jam!).');
  saveGame(); renderAll();
}

function setBpjsTier(tierId) {
  state.player.bpjsTier = tierId;
  const obj = BPJS_TIERS.find(b => b.id === tierId);
  addLog(`🏥 Kepesertaan BPJS diubah ke <b>${obj ? obj.name : tierId}</b>.`);
  saveGame(); renderAll();
}

function goToHospital() {
  if (!state.player.isSick) return;
  const hasBpjs = state.player.bpjsTier && state.player.bpjsTier !== 'none';
  const cost = hasBpjs ? 0 : getPriceFrom2010(1250000);
  if (cost > 0 && !deductFromAnyCash(cost)) return;
  state.player.isSick = false;
  state.player.sickName = '';
  state.player.energy = 100;
  playSfx('cash');
  addLog(`🏥 Selesai berobat di Rumah Sakit (${hasBpjs ? '<b>GRATIS ditanggung BPJS!</b>' : `Biaya <b>-${fmtRp(cost)}</b>`}). Kamu sembuh total!`);
  saveGame(); renderAll();
}

function refuelOwnedVehicle(idx) {
  const v = state.ownedVehicles[idx];
  if (!v) return;
  const need = Math.max(0, v.tankCap - v.fuelLiters);
  if (need <= 0.1) return addLog('⛽ Bensin sudah penuh!');
  const cost = Math.round(need * getBbmPricePerLiter(state.year));
  if (!deductFromAnyCash(cost)) return;
  v.fuelLiters = v.tankCap;
  playSfx('cash');
  addLog(`⛽ Isi bensin <b>${v.name}</b> (+${need.toFixed(1)}L): <b>-${fmtRp(cost)}</b>.`);
  saveGame(); renderAll();
}

function changeOilVehicle(idx) {
  const v = state.ownedVehicles[idx];
  if (!v) return;
  const cost = getPriceFrom2010(v.category === 'Mobil' ? 280000 : 55000);
  if (!deductFromAnyCash(cost)) return;
  v.oilPct = 100;
  playSfx('cash');
  addLog(`🛢️ Ganti oli <b>${v.name}</b>: <b>-${fmtRp(cost)}</b> (Oli 100%).`);
  saveGame(); renderAll();
}

function serviceVehicleEngine(idx) {
  const v = state.ownedVehicles[idx];
  if (!v) return;
  const cost = getPriceFrom2010(v.category === 'Mobil' ? 650000 : 140000);
  if (!deductFromAnyCash(cost)) return;
  v.engineCond = 100;
  playSfx('cash');
  addLog(`🔧 Servis mesin <b>${v.name}</b>: <b>-${fmtRp(cost)}</b> (Mesin 100%).`);
  saveGame(); renderAll();
}

function rideOwnedVehicle(idx) {
  const v = state.ownedVehicles[idx];
  if (!v) return;
  if (v.fuelLiters < 1) return addLog('⚠️ Bensin habis! Isi bensin dulu.');
  if ((v.oilPct ?? 100) <= 5 || (v.engineCond ?? 100) <= 10) return addLog('⚠️ Oli habis / Mesin butuh servis! Rawat kendaraanmu dulu.');
  v.fuelLiters = Math.max(0, +(v.fuelLiters - 1.2).toFixed(1));
  v.oilPct = Math.max(0, (v.oilPct ?? 100) - 8);
  v.engineCond = Math.max(0, (v.engineCond ?? 100) - 4);
  state.player.energy = Math.min(100, (state.player.energy ?? 100) + 5);
  playSfx('click');
  addLog(`🛣️ Jalan-jalan naik <b>${v.name}</b> (Bensin -1.2L, Oli -8%, Mesin -4%).`);
  saveGame(); renderAll();
}

function buyGadgetItem(id) {
  const g = GADGET_CATALOG.find(x => x.id === id);
  if (!g) return;
  const price = getPriceFrom2010(g.price2010);
  if (!deductFromAnyCash(price)) return;
  state.ownedGadgets.push({ ...g, boughtYear: state.year });
  playSfx('cash');
  addLog(`📱 Membeli <b>${g.name}</b> (${fmtRp(price)})!`);
  saveGame(); renderAll();
}

function resetGameFull() {
  if (!confirm('Reset seluruh progres game dan mulai ulang dari awal tahun 2010 (Rp 0)?')) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

function openCharacterCreationModal() {
  const cityOpts = INDONESIA_CITIES.map(c => `<option value="${c.id}" ${c.id === state.cityId ? 'selected' : ''}>${c.name}</option>`).join('');
  const ethOpts = ETHNICITIES.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
  const relOpts = RELIGIONS_ID.map(r => `<option value="${r}">${r}</option>`).join('');
  showCustomModal(
    '🖥️ Mulai Usaha Warnet & Rental PS Baru (Tahun 2010 • Mulai Rp 0)',
    `<div class="spec-line">Mulai dari Rp 0 di tahun 2010! Pinjam modal ke Orang Tua (5–30 Juta tanpa bunga di tab <b>⚡ PLN/Genset</b>) lalu rakit PC atau pasang PS pertamamu.</div>
     <div class="grid-2">
       <div><label class="spec-line">Nama</label><input id="ccName" value="${state.player.name}" /></div>
       <div><label class="spec-line">Gender</label><select id="ccGender"><option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option></select></div>
     </div>
     <div class="grid-2">
       <div><label class="spec-line">Agama</label><select id="ccRel">${relOpts}</select></div>
       <div><label class="spec-line">Etnis</label><select id="ccEth">${ethOpts}</select></div>
     </div>
     <div><label class="spec-line">Kota</label><select id="ccCity">${cityOpts}</select></div>
     <div class="grid-3">
       <div><label class="spec-line">Tgl Lahir</label><input type="number" id="ccBDay" value="15" /></div>
       <div><label class="spec-line">Bln Lahir</label><input type="number" id="ccBMonth" value="5" /></div>
       <div><label class="spec-line">Thn Lahir (<=2002)</label><input type="number" id="ccBYear" max="2002" value="1998" /></div>
     </div>`,
    `<button type="button" class="danger" onclick="resetGameFull()">🔄 Reset Total</button><button type="button" onclick="closeCustomModal()">Batal</button><button type="button" class="primary" onclick="confirmCharacterCreation()">🚀 Mulai Warnet 2010</button>`
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

  localStorage.removeItem(STORAGE_KEY);
  state.cityId = cityId;
  state.year = 2010; state.month = 1; state.day = 1; state.dayOfWeek = 5;
  state.hour = 8; state.minute = 0; state.second = 0; state.totalDays = 1;
  state.laciCash = 0; state.handWallet = 0; state.personalBank = 0;
  state.openHour = 8; state.closeHour = 23;
  state.kwh = 45.0; state.plnMeterLevel = 1; state.plnBlackout = false;
  state.genset = { owned: true, active: false, fuelLiters: 8.0, maxTankLiters: 15.0 };
  state.cleanliness = 100; state.renovLevel = 1; state.serverLevel = 1; state.internetPlanId = 'isp_1m';
  state.rentalOpen = true;
  state.happyHourActive = false; state.nightPackageActive = false; state.qrisActive = false;
  state.facilities = {}; state.members = { count: 0, discountPct: 10 };
  state.goldGrams = 0; state.itCourseCompleted = false; state.familyHappiness = 90;
  state.lastTournamentDay = -10; state.reputationBonus = 0;
  state.branches = { warnetOwned: false, psRentalOwned: false };
  state.financeStats = { revBilling: 0, revSnack: 0, revExtra: 0, expPower: 0, expSalary: 0, expLoan: 0 };
  state.slots = createEmptyWarnetSlots20();
  state.waitingQueue = [];
  state.warehouseCpus = []; state.warehouseRams = []; state.warehouseVgas = [];
  state.warehouseStorages = []; state.warehouseMonitors = []; state.warehouseCoolings = [];
  state.warehouseChairs = []; state.warehousePsConsoles = [];
  state.cashierGearNew = 3; state.cashierGearMech = 0; state.cashierGearServiced = 0; state.cashierGearBroken = 0;
  state.waterGallonServings = 45;
  state.employees = [];
  state.property = { owned: false, kprActive: false, kprRemaining: 0, kprMonthly: 0, kprMonthsLeft: 0 };
  state.parentLoan = { active: false, remainingTotal: 0, weeklyInstallment: 0, weeksLeft: 0 };
  state.bankLoan = { active: false, principal: 0, remainingTotal: 0, monthlyInstallment: 0, monthsLeft: 0, interestRatePct: 0 };
  state.assetLoans = []; state.ownedHouses = []; state.ownedVehicles = []; state.ownedGadgets = [];
  state.player = { name, gender, religion, ethnicity, birthDay: bDay, birthMonth: bMonth, birthYear: bYear, age: 2010 - bYear, energy: 100, isSick: false, sickName: '', bpjsTier: 'none', partner: null, married: false, childrenList: [] };
  seedStarterWarnetPcs();
  saveGame();
  closeCustomModal();
  renderAll();
  addLog(`🎉 Usaha Warnet <b>${name}</b> (Usia ${state.player.age} thn) resmi dimulai di tahun 2010! Ambil Pinjaman Orang Tua di tab <b>⚡ PLN/Genset</b> untuk mulai merakit PC!`);
}

function saveGame() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (typeof CloudSync !== 'undefined') CloudSync.pushToCloud(state);
  } catch (e) {}
}

function migrateStateDefaults() {
  if (state.soundEnabled === undefined) state.soundEnabled = true;
  if (state.musicEnabled === undefined) state.musicEnabled = true;
  if (!state.bgmTrack) state.bgmTrack = 1;
  if (state.unlockAllEras === undefined) state.unlockAllEras = true;
  if (!state.plnMeterLevel) state.plnMeterLevel = 1;
  if (!state.facilities) state.facilities = {};
  if (!state.members) state.members = { count: 0, discountPct: 10 };
  if (!state.branches) state.branches = { warnetOwned: false, psRentalOwned: false };
  if (!state.financeStats) state.financeStats = { revBilling: 0, revSnack: 0, revExtra: 0, expPower: 0, expSalary: 0, expLoan: 0 };
  if (!Array.isArray(state.warehouseChairs)) state.warehouseChairs = [];
  if (!Array.isArray(state.warehousePsConsoles)) state.warehousePsConsoles = [];
  if (state.cashierGearMech === undefined) state.cashierGearMech = 0;
  if (state.goldGrams === undefined) state.goldGrams = 0;
  if (state.familyHappiness === undefined) state.familyHappiness = 90;
  if (state.lastTournamentDay === undefined) state.lastTournamentDay = -10;
  if (state.reputationBonus === undefined) state.reputationBonus = 0;
  if (!state.property) state.property = { owned: false, kprActive: false, kprRemaining: 0, kprMonthly: 0, kprMonthsLeft: 0 };
  if (!Array.isArray(state.assetLoans)) state.assetLoans = [];
  if (!Array.isArray(state.ownedHouses)) state.ownedHouses = [];
  if (!Array.isArray(state.ownedVehicles)) state.ownedVehicles = [];
  if (!Array.isArray(state.ownedGadgets)) state.ownedGadgets = [];
  if (!state.slots || state.slots.length !== 20 || !('cpu' in state.slots[0])) {
    state.slots = createEmptyWarnetSlots20();
    seedStarterWarnetPcs();
  }
  state.slots.forEach(s => {
    if (!s.unitType) s.unitType = 'pc';
    if (!Array.isArray(s.rams)) s.rams = s.ram ? [s.ram] : [];
    if (!Array.isArray(s.installedGames)) s.installedGames = [];
    if (s.tempC === undefined) s.tempC = 40;
    if (s.dustPct === undefined) s.dustPct = 0;
  });
}

function loadGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { seedStarterWarnetPcs(); migrateStateDefaults(); return false; }
    const parsed = JSON.parse(raw);
    Object.assign(state, parsed);
    migrateStateDefaults();
    return true;
  } catch (e) {
    seedStarterWarnetPcs();
    migrateStateDefaults();
    return false;
  }
}

function openCloudSyncModal() {
  showCustomModal(
    '☁️ Cloud Save & Load Warnet',
    `<div class="spec-line">Masukkan ID Cloud Save unikmu (minimal 4 karakter) untuk menyimpan atau memuat progres game lintas perangkat:</div>
     <input id="cloudSyncIdInp" value="${typeof CloudSync !== 'undefined' ? CloudSync.syncId : 'oneil_default'}" placeholder="ID Cloud Save" />`,
    `<button type="button" onclick="closeCustomModal()">Tutup</button>
     <button type="button" class="amber" onclick="manualCloudPull()">📥 Muat dari Cloud</button>
     <button type="button" class="primary" onclick="manualCloudPush()">☁️ Simpan ke Cloud</button>`
  );
}

async function manualCloudPush() {
  if (typeof CloudSync === 'undefined') return showFloatingToast('⚠️ Modul CloudSync belum aktif.', 'warn');
  const inp = document.getElementById('cloudSyncIdInp');
  if (inp && !CloudSync.setSyncId(inp.value)) {
    return showFloatingToast('⚠️ ID Cloud minimal 4 karakter (huruf/angka)!', 'warn');
  }
  showFloatingToast('☁️ Menyimpan data ke Cloud...', 'info');
  const res = await CloudSync.pushToCloud(state, true);
  if (res && res.ok) {
    playSfx('cash');
    showFloatingToast(`✅ Berhasil disimpan ke Cloud (ID: <b>${CloudSync.syncId}</b>)!`, 'ok');
  } else {
    showFloatingToast(`⚠️ Gagal simpan ke Cloud (${res ? res.reason : 'offline'}). Progres tetap aman di memori lokal.`, 'warn');
  }
}

async function manualCloudPull() {
  if (typeof CloudSync === 'undefined') return showFloatingToast('⚠️ Modul CloudSync belum aktif.', 'warn');
  const inp = document.getElementById('cloudSyncIdInp');
  if (inp && !CloudSync.setSyncId(inp.value)) {
    return showFloatingToast('⚠️ ID Cloud minimal 4 karakter (huruf/angka)!', 'warn');
  }
  showFloatingToast('📥 Memuat data dari Cloud...', 'info');
  const res = await CloudSync.pullFromCloud();
  if (res && res.ok && res.state) {
    Object.assign(state, res.state);
    migrateStateDefaults();
    saveGame();
    closeCustomModal();
    renderAll();
    startOrUpdateBgm();
    playSfx('cash');
    showFloatingToast(`✅ Data Cloud (ID: <b>${CloudSync.syncId}</b>) berhasil dimuat!`, 'ok');
  } else {
    showFloatingToast(`⚠️ Data Cloud tidak ditemukan untuk ID <b>${CloudSync.syncId}</b>.`, 'warn');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadGame();
  renderAll();
  const btnS = document.getElementById('btnSoundToggle');
  if (btnS) btnS.textContent = state.soundEnabled ? '🔊' : '🔇';
  startOrUpdateBgm();
  setInterval(gameTick, 250);
});
