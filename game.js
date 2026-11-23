// ==================== ENGINE UTAMA WARNET & LIFE SIMULATOR (2010 - SEKARANG) ====================
const STORAGE_KEY = 'oneilverse_warnet_sim_2010_v3';

function createEmptyWarnetSlots20() {
  const slots = [];
  for (let i = 1; i <= 20; i++) {
    slots.push({
      id: i,
      isRoom: true,
      name: `Room VIP #${i}`,
      cpu: null,
      rams: [], // Bisa pasang 2 s/d 4 keping RAM tergantung support processor!
      vga: null,
      storage: null,
      os: null,
      monitor: null,
      cooling: null,
      gear: null,
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

  // Listrik PLN, Genset Otomatis, Kebersihan, Renovasi, PC Server & Jam Operasional
  kwh: 45.0,
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
  qrisActive: false,
  facilities: {},
  members: { count: 0, discountPct: 10 },
  goldGrams: 0,
  itCourseCompleted: false,
  familyHappiness: 90,

  // Pengaturan Tarif Billing Meter (Per Jam, Dihitung Per Detik!) & Paket Custom
  billingHourlyRate: 3000, // Bisa diubah bebas oleh pemain (misal 6000/jam = Rp 1.66/detik)
  vipRateBonus: 1500,
  customPackages: [
    { id: 'pkt_1', name: 'Paket 1 Jam', hours: 1, price: 3000 },
    { id: 'pkt_2', name: 'Paket 2 Jam', hours: 2, price: 5000 },
    { id: 'pkt_3', name: 'Paket 3 Jam', hours: 3, price: 7000 },
    { id: 'pkt_5', name: 'Paket Begadang 5 Jam', hours: 5, price: 10000 }
  ],

  // 20 Slot PC Warnet & Ruang Tunggu
  slots: createEmptyWarnetSlots20(),
  waitingQueue: [],

  // Gudang Komponen Rakit PC (Belum Dipasang / Dilepas dari Slot)
  warehouseCpus: [],
  warehouseRams: [],
  warehouseVgas: [],
  warehouseStorages: [],
  warehouseMonitors: [],
  warehouseCoolings: [],

  // Stok Gear (Mouse+KB+Headset) di Kasir: Baru (100%), Servis (65%), Rusak
  cashierGearNew: 3,
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
  soundEnabled: true
};

// Awal mulai Rp 0 tanpa PC — pemain pinjam ke Orang Tua (5-30 Juta) dulu lalu beli & rakit PC sendiri!
function seedStarterWarnetPcs() {
  // Sengaja dikosongkan sesuai skenario mulai dari Rp 0
}

// ==================== EFEK SUARA (WEB AUDIO API) ====================
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
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now); osc.stop(now + 0.25);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now); osc.stop(now + 0.05);
    }
  } catch (e) {}
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  const btn = document.getElementById('btnSoundToggle');
  if (btn) btn.textContent = state.soundEnabled ? '🔊' : '🔇';
  if (state.soundEnabled) playSfx('click');
}

// ==================== HELPER EKONOMI, INTERNET, PENJAGA & SPEK PC ====================
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
  const ramGb = getPcTotalRamGb(slot);
  if (!slot || !slot.cpu || ramGb <= 0 || !slot.vga) return 0;
  const ramTier = ramGb >= 16 ? 8 : ramGb >= 8 ? 5 : ramGb >= 4 ? 3 : ramGb >= 2 ? 2 : 1;
  return Math.min(slot.cpu.tier || 1, ramTier, slot.vga.tier || 1);
}

function getSlotHourlyRate(slot) {
  const base = Number(state.billingHourlyRate) || 3000;
  const vipAdd = (slot && slot.isRoom) ? (Number(state.vipRateBonus) || 1500) : 0;
  const coolAdd = (slot && slot.cooling && slot.cooling.type === 'ac') ? 1000 : 0;
  return base + vipAdd + coolAdd;
}

function isSlotReadyToPlay(slot) {
  const ramGb = getPcTotalRamGb(slot);
  if (!slot || !slot.cpu || ramGb <= 0 || !slot.vga || !slot.storage || !slot.monitor) {
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

function addRevenueToWarnet(amount) {
  if (state.qrisActive && state.year >= 2019) {
    const toBank = Math.round(amount * 0.5);
    const toLaci = amount - toBank;
    state.personalBank += toBank;
    state.laciCash += toLaci;
  } else {
    state.laciCash += amount;
  }
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

    // 2. Proses Billing PC yang Sedang Online (Per Detik!)
    if (!s.occupied) return;
    if (!powerOk) {
      s.occupied = false;
      return;
    }

    if (s.billingMode === 'paket') {
      s.secondsLeft = Math.max(0, (s.secondsLeft || 0) - SEC_STEP);
      // Saat cuaca hujan deras, peluang tamu nambah jam naik 2x lipat!
      const extChance = state.weather === 'hujan' ? 0.52 : 0.28;
      if (s.secondsLeft <= 60 && s.secondsLeft > 0 && state.rentalOpen && Math.random() < extChance) {
        const extPkt = state.customPackages[0] || { name: 'Paket 1 Jam', hours: 1, price: state.billingHourlyRate };
        s.secondsLeft += extPkt.hours * 3600;
        s.totalSecondsBooked += extPkt.hours * 3600;
        s.packagePrice += extPkt.price;
        addRevenueToWarnet(extPkt.price);
        playSfx('cash');
        addLog(`⏱️ <b>${s.customerName}</b> otomatis tambah waktu (${extPkt.name}${state.weather === 'hujan' ? ' • 🌧️ Hujan' : ''}) di <b>${s.name}</b>: <b style="color:var(--green)">+${fmtRp(extPkt.price)}</b>.`);
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
        const totalBill = Math.max(500, Math.round((s.elapsedSeconds / 3600) * (s.hourlyRate || state.billingHourlyRate)));
        addRevenueToWarnet(totalBill);
        playSfx('cash');
        addLog(`💳 <b>${s.customerName}</b> selesai Billing Meter di <b>${s.name}</b> (${Math.round(s.elapsedSeconds / 60)} mnt): <b style="color:var(--green)">+${fmtRp(totalBill)}</b>.`);
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

  // 1. Konsumsi Listrik PLN per menit
  if (state.kwh > 0) {
    let totalWatt = 35;
    state.slots.forEach(s => {
      if (s.occupied || s.updatingPatch) {
        totalWatt += (s.cpu ? s.cpu.watt : 65) + (s.vga ? s.vga.watt : 50) + (s.monitor ? s.monitor.watt : 35) + (s.cooling ? s.cooling.watt : 0);
      }
    });
    const kwhUsed = (totalWatt / 1000) / 60;
    state.kwh = Math.max(0, +(state.kwh - kwhUsed).toFixed(4));
  }

  // 2. Penurunan ketahanan Mouse/KB/Headset & Pembelian Pop Mie / Minuman
  state.slots.forEach(s => {
    if (!s.occupied) return;
    if (s.gear && Math.random() < 0.04) {
      s.gear.durability = Math.max(0, +(s.gear.durability - 0.5).toFixed(1));
      if (s.gear.durability <= 0) {
        state.cashierGearBroken++;
        s.gear = null;
        s.occupied = false;
        addLog(`🖱️ Mouse/Keyboard/Headset di <b>${s.name}</b> RUSAK (0%) dan masuk ke stok servis Kasir!`);
        // Jika ada karyawan tugas servis/jaga & ada stok cadangan (Baru/Servis), langsung pasang otomatis!
        const staffOn = state.employees.find(e => isEmployeeOnDuty(e) && (e.tasks.includes('service') || e.tasks.includes('guard')));
        if (staffOn) {
          if (state.cashierGearNew > 0) {
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
    const snackChance = (state.facilities && state.facilities.fac_dispenser) ? 0.013 : 0.01;
    if (Math.random() < snackChance) {
      tryCustomerBuyPopMieOrDrink(s);
    }
    // Risiko virus flashdisk tamu jika belum pasang Deep Freeze
    if (!(state.facilities && state.facilities.fac_deepfreeze) && Math.random() < 0.0012) {
      s.occupied = false;
      addLog(`🦠 <b>${s.name}</b> terkena virus flashdisk tamu &amp; Blue Screen! Pasang <b>Deep Freeze</b> di menu Rakit/Server agar aman.`);
    }
  });

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

  // 5. Kedatangan Pelanggan Baru / Party Mabar (Dipengaruhi Neon Box, Member, Happy Hour & Cuaca)
  if (state.rentalOpen && state.hour >= 8 && state.hour <= 23 && isPowerAvailable()) {
    const isHol = !!getHolidayName(state.year, state.month, state.day) || state.dayOfWeek === 0 || state.dayOfWeek === 6;
    const cleanFactor = Math.max(0.25, state.cleanliness / 100);
    const neonMult = (state.facilities && state.facilities.fac_neonbox) ? 1.3 : 1.0;
    const hhMult = (state.happyHourActive && state.hour >= 8 && state.hour < 12) ? 1.45 : 1.0;
    const memberMult = 1 + Math.min(0.5, ((state.members && state.members.count) || 0) * 0.015);
    const spawnChance = 0.065 * (isHol ? 1.5 : 1.0) * cleanFactor * neonMult * hhMult * memberMult;
    if (Math.random() < spawnChance && state.waitingQueue.length < 10) {
      // Peluang tamu daftar jadi Member Baru & setor deposit saldo di muka!
      if (Math.random() < 0.09) {
        state.members = state.members || { count: 0, discountPct: 10 };
        state.members.count++;
        const dep = getPriceFrom2010(50000);
        addRevenueToWarnet(dep);
        playSfx('cash');
        addLog(`💳 Pelanggan mendaftar jadi <b>Member VIP Warnet #${state.members.count}</b> &amp; setor deposit <b style="color:var(--green)">+${fmtRp(dep)}</b>!`);
      }
      if (Math.random() < 0.22) spawnMabarParty();
      else spawnSingleCustomer();
    }
  }
}

const GUEST_NAMES = ['Budi', 'Rizky', 'Fajar', 'Deni', 'Agus', 'Hendra', 'Wahyu', 'Ilham', 'Tono', 'Bayu', 'Dimas', 'Reza', 'Aldi', 'Yudi', 'Rian', 'Eko', 'Kevin', 'Putra', 'gilang', 'Dani'];

function pickActivityForPc(slot) {
  const tier = getPcTier(slot);
  const pcGames = Array.isArray(slot.installedGames) ? slot.installedGames : [];
  if (pcGames.length === 0 || Math.random() < 0.25) {
    const acts = NON_GAME_ACTIVITIES.filter(a => a.minYear <= state.year);
    const chosen = acts[Math.floor(Math.random() * acts.length)] || NON_GAME_ACTIVITIES[0];
    return chosen.title;
  }
  const playable = GAME_DISC_CATALOG.filter(g =>
    pcGames.includes(g.id) &&
    g.releaseYear <= state.year &&
    g.minTier <= tier &&
    !state.pendingGamePatches[g.id]
  );
  if (playable.length > 0) {
    const g = playable[Math.floor(Math.random() * playable.length)];
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
    state.installedGames[g.id] && g.canPartyMabar && g.releaseYear <= state.year && !state.pendingGamePatches[g.id]
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
      forcedActivity: `🎮 ${chosenGame}`
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
    const pkt = state.customPackages[Math.floor(Math.random() * state.customPackages.length)];
    const vipExtra = slot.isRoom ? Math.round(pkt.hours * (state.vipRateBonus || 1500)) : 0;
    let totalPay = pkt.price + vipExtra;
    if (discPct > 0) totalPay = roundTo500(totalPay * (1 - discPct / 100));
    slot.billingMode = 'paket';
    slot.packageName = pkt.name;
    slot.packagePrice = totalPay;
    slot.totalSecondsBooked = pkt.hours * 3600;
    slot.secondsLeft = pkt.hours * 3600;
    addRevenueToWarnet(totalPay);
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
    if (item.kind === 'galon') return false;
    if ((state.snackStockPcs[item.id] || 0) <= 0) return false;
    if (item.needsWater && state.waterGallonServings <= 0) return false;
    return true;
  });
  if (avail.length === 0) {
    if (state.waterGallonServings <= 0 && Math.random() < 0.25) {
      addLog('💧 <b>AIR GALON HABIS!</b> Pelanggan batal beli Pop Mie/Kopi karena air galon 0. Segera beli Galon Air 19L!');
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
  addRevenueToWarnet(price);
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
  const needSlot = state.slots.find(s => s.cpu && (!s.gear || s.gear.durability <= 0));
  if (needSlot && state.cashierGearServiced > 0) {
    state.cashierGearServiced--;
    needSlot.gear = { name: 'Set Gear Servis', quality: 'serviced', durability: 65, maxDurability: 65 };
    addLog(`🖱️ <b>${empName}</b> otomatis memasang Set Gear hasil servis ke <b>${needSlot.name}</b>.`);
  }
}

function onHourPassed() {
  // 1. Cek Jam Buka & Jam Tutup Warnet Otomatis
  const oh = Number(state.openHour ?? 8);
  const ch = Number(state.closeHour ?? 23);
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
  let shiftEnded = (state.hour === ch && ch !== 24);
  (state.employees || []).forEach(emp => {
    const start = Number(emp.startHour) || 8;
    const end = (start + (Number(emp.durationHours) || 8)) % 24;
    if (state.hour === end) shiftEnded = true;
  });
  if (shiftEnded && state.laciCash > 0) {
    const moved = state.laciCash;
    state.handWallet += moved;
    state.laciCash = 0;
    addLog(`👛 <b>Ganti Shift / Tutup Kasir:</b> Uang di Laci (<b>${fmtRp(moved)}</b>) masuk ke <b>Dompetmu</b>!`);
  }

  if (state.hour === 7 && isPlayerAtSchool()) {
    const pocket = getPriceFrom2010(15000);
    state.handWallet += pocket;
    addLog(`🎒 Kamu berangkat sekolah (07:00–13:00). Dapat uang jajan <b style="color:var(--green)">+${fmtRp(pocket)}</b> ke Dompet.`);
  }
  if (state.hour === 23 && Math.random() < 0.45) {
    const onlineInstalled = GAME_DISC_CATALOG.filter(g => g.type === 'online' && state.installedGames[g.id] && g.releaseYear <= state.year);
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

  // Pemasukan Pasif Harian Voucher WiFi Hotspot jika sudah pasang Router Hotspot
  if (state.facilities && state.facilities.fac_wifi_router) {
    const wifiIncome = getPriceFrom2010(35000 + Math.floor(Math.random() * 25000));
    addRevenueToWarnet(wifiIncome);
    addLog(`📶 Penjualan Voucher WiFi Hotspot warga/kos hari ini: <b style="color:var(--green)">+${fmtRp(wifiIncome)}</b>.`);
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
      addLog(`👨‍👩‍👦 Cicilan mingguan ke Orang Tua: <b>-${fmtRp(pay)}</b> (Sisa ${state.parentLoan.weeksLeft}x).`);
      if (state.parentLoan.remainingTotal <= 0 || state.parentLoan.weeksLeft <= 0) state.parentLoan.active = false;
    }
  }
  saveGame();
}

function onMonthPassed() {
  // 1. Sewa Ruko atau Cicilan Beli Ruko Permanen
  if (!state.property.owned) {
    if (state.property.kprActive) {
      const kPay = Math.min(state.property.kprRemaining, state.property.kprMonthly);
      if (deductFromAnyCash(kPay)) {
        state.property.kprRemaining -= kPay;
        state.property.kprMonthsLeft = Math.max(0, state.property.kprMonthsLeft - 1);
        addLog(`🏠 Bayar cicilan KPR Ruko Warnet: <b>-${fmtRp(kPay)}</b> (Sisa ${state.property.kprMonthsLeft} bln).`);
        if (state.property.kprRemaining <= 0 || state.property.kprMonthsLeft <= 0) {
          state.property.kprActive = false;
          state.property.owned = true;
          addLog('🎉 <b>LUNAS!</b> Ruko Warnet kini milikmu permanen (Bebas biaya sewa selamanya)!');
        }
      }
    } else {
      const rentCost = getPriceFrom2010(1500000);
      if (deductFromAnyCash(rentCost)) addLog(`🏢 Bayar sewa ruko bulanan: <b>-${fmtRp(rentCost)}</b>.`);
    }
  }

  // 2. Tagihan Internet Asli Speedy / IndiHome
  const ispPlan = getInternetPlan();
  const ispCost = ispPlan.monthlyReal || 295000;
  if (deductFromAnyCash(ispCost)) {
    addLog(`🌐 Bayar tagihan internet <b>${ispPlan.name}</b>: <b>-${fmtRp(ispCost)}</b>.`);
  }

  // 3. Biaya Sekolah SPP (jika usia < 18) + Iuran Kebersihan/Keamanan & Pajak UMKM
  if (state.player.age < 18) {
    const spp = getPriceFrom2010(250000);
    if (deductFromAnyCash(spp)) addLog(`🎒 Bayar SPP Sekolah bulanan: <b>-${fmtRp(spp)}</b>.`);
  }
  const rtTax = getPriceFrom2010(175000);
  const pdamBill = getPriceFrom2010(85000);
  if (deductFromAnyCash(rtTax + pdamBill)) {
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
      addLog(`💳 Bayar cicilan <b>${al.name}</b>: <b>-${fmtRp(pay)}</b> (Sisa ${al.monthsLeft} bln).`);
      if (al.remainingTotal <= 0 || al.monthsLeft <= 0) {
        al.active = false;
        addLog(`🎉 <b>LUNAS!</b> Cicilan <b>${al.name}</b> telah lunas sepenuhnya!`);
      }
    }
  });
}

// ATURAN KETAT: Pembelian & Tagihan TIDAK boleh mengambil dari Laci Kasir! Harus dari Bank atau Dompet.
function deductFromAnyCash(amount) {
  if (state.personalBank >= amount) { state.personalBank -= amount; return true; }
  if (state.handWallet >= amount) { state.handWallet -= amount; return true; }
  addLog(`⚠️ Saldo <b>Bank &amp; Dompet</b> kurang (${fmtRp(amount)})! Tarik uang dari <b>Laci Kasir</b> dulu.`);
  return false;
}

function payEmployeeSalary(emp, label) {
  const bpjsCost = emp.hasBpjs ? getPriceFrom2010(55000) : 0;
  const otHours = emp.overtimeHours || 0;
  const otPay = otHours * getPriceFrom2010(10000);
  const total = Number(emp.salaryAmount || 0) + Number(emp.incentive || 0) + otPay + (label === 'Bulanan' ? bpjsCost : 0);

  // Pastikan pembayaran gaji karyawan SELALU JALAN (ambil dari Bank, Dompet, gabungan Bank+Dompet, atau Laci jika terpaksa)
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
  document.getElementById('hudDateTime').textContent = `${DAY_NAMES[state.dayOfWeek].slice(0, 3)}, ${state.day}/${state.month}/${state.year} • ${hh}:${mm} • ${wIcon}${hol ? ' 🔴' : ''}`;
  document.getElementById('hudCityUmr').textContent = `${getCity().name.split(' ')[0]} • $1=Rp${getUsdRate(state.year).toLocaleString('id-ID')}`;
  document.getElementById('hudPlayerBadge').textContent = `${state.player.name.split(' ')[0]} (${state.player.age}th)`;
  document.getElementById('hudLaci').textContent = fmtRp(state.laciCash);
  document.getElementById('hudHand').textContent = fmtRp(state.handWallet);
  document.getElementById('hudBank').textContent = fmtRp(state.personalBank);

  const plan = getInternetPlan();
  document.getElementById('hudPpob').textContent = `${plan.mbps}Mbps • ${getCurrentPingMs()}ms`;
  document.getElementById('hudKwh').textContent = `${state.kwh.toFixed(1)}kWh • ⛽${state.genset.fuelLiters.toFixed(1)}L`;
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
         <input type="checkbox" id="chkQrisActive" ${state.qrisActive && canQris ? 'checked' : ''} ${!canQris ? 'disabled' : ''} style="width:auto;" />
         <span>📱 <b>Pembayaran QRIS / E-Wallet (${canQris ? 'Tersedia' : 'Terbuka Tahun 2019+'})</b>: 50% omzet otomatis langsung masuk ke Bank</span>
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
    box.innerHTML = `
      <div style="display:flex;gap:6px;">
        <button type="button" class="primary" style="flex:1" onclick="openBillingRateModal()">⚙️ Atur Tarif Meter &amp; Paket Jam</button>
        <button type="button" class="amber" onclick="triggerManualPatchAll()">🔄 Patch Semua PC</button>
      </div>
      ${state.slots.map(s => {
        const st = isSlotReadyToPlay(s);
        return `<div class="item-row" style="flex-direction:column;align-items:stretch;">
          <div style="display:flex;justify-content:space-between;">
            <b>${s.name}</b>
            <span class="badge ${s.occupied ? 'ok' : st.ok ? 'busy' : 'warn'}">${s.occupied ? `${s.customerName} (${s.billingMode.toUpperCase()})` : st.reason}</span>
          </div>
          <div class="spec-line">
            • CPU: <b>${s.cpu ? s.cpu.name : '-'}</b> | RAM: <b>${s.ram ? s.ram.name : '-'}</b><br>
            • VGA: <b>${s.vga ? s.vga.name : '-'}</b> | Storage: <b>${s.storage ? s.storage.name : '-'}</b><br>
            • OS: <b>${s.os ? s.os.name : '-'}</b> | Monitor: <b>${s.monitor ? s.monitor.name : '-'}</b> | Gear: <b>${s.gear ? s.gear.durability + '%' : 'Kosong'}</b>
          </div>
          <button type="button" class="primary" onclick="openSlotConfigModal(${s.id})">🔧 Rakit / Bongkar Pasang PC Ini</button>
        </div>`;
      }).join('')}
    `;
    return;
  }

  if (state.mainTab === 'store_hw') {
    state.facilities = state.facilities || {};
    const nextRenov = RENOV_LEVELS[state.renovLevel];
    const nextSrv = SERVER_LEVELS[state.serverLevel];
    const discMult = state.itCourseCompleted ? 0.85 : 1;
    const cats = [
      ['cpu', '🧠 Processor'],
      ['ram', '⚡ RAM'],
      ['vga', '🎮 VGA Card'],
      ['storage', '💾 HDD/SSD'],
      ['monitor', '🖥️ Monitor'],
      ['cooling', '❄️ Kipas/AC'],
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
    else if (state.hwCategoryFilter === 'fac') list = typeof WARNET_FACILITIES_CATALOG !== 'undefined' ? WARNET_FACILITIES_CATALOG : [];
    else list = PERIPHERAL_CATALOG;

    box.innerHTML = `
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
          <div class="spec-line">${nextRenov ? nextRenov.name : 'Sudah Level Maksimal'}</div>
        </div>
        ${nextRenov ? `<button type="button" class="amber" onclick="upgradeRenovation()">Renov (${fmtRp(getPriceFrom2010(nextRenov.baseCost2010))})</button>` : '<span class="badge ok">MAX</span>'}
      </div>
      ${state.itCourseCompleted ? `<div class="spec-line" style="color:var(--green)">🎓 <b>Sertifikat Kuliah/Kursus IT Aktif:</b> Diskon Permanen 15% semua harga komponen PC!</div>` : ''}
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
                <b>${f.name}</b>
                <div class="spec-line">${f.desc}</div>
                <div style="color:var(--green);font-weight:700;">${fmtRp(fPrice)}</div>
              </div>
              <button type="button" class="${owned ? 'success' : 'primary'}" ${owned ? 'disabled' : ''} onclick="buyFacilityItem('${f.id}')">${owned ? 'Terpasang' : 'Pasang'}</button>
            </div>`;
          }).join('')
        : list.filter(it => it.releaseYear <= state.year).map(it => {
            const price = roundTo500(getPriceFrom2010(it.basePrice2010) * discMult);
            return `<div class="item-row">
              <img class="prod-thumb" src="${it.img}" alt="${it.name}" />
              <div style="flex:1">
                <b>${it.name}</b>
                <div class="spec-line">Rilis: ${it.releaseYear} ${it.watt ? `• Daya: ${it.watt}W` : ''} ${it.sizeGb ? `• Kapasitas: ${it.sizeGb}GB` : ''}</div>
                <div style="color:var(--green);font-weight:700;">${fmtRp(price)} ${state.itCourseCompleted ? '<small style="color:#38bdf8">(-15%)</small>' : ''}</div>
              </div>
              <button type="button" class="primary" onclick="buyPcComponent('${state.hwCategoryFilter}','${it.id}')">Beli</button>
            </div>`;
          }).join('')}
    `;
    return;
  }

  if (state.mainTab === 'discs') {
    const curPlan = getInternetPlan();
    const games = GAME_DISC_CATALOG.filter(g => g.type === state.gameTypeFilter && g.releaseYear <= state.year);
    box.innerHTML = `
      <div class="card">
        <b>🌐 Paket Internet Warnet Saat Ini: ${curPlan.name} (${curPlan.mbps} Mbps • Ping ${getCurrentPingMs()}ms)</b>
        <div class="spec-line">Makin tinggi Mbps internet, makin banyak PC bisa main game online tanpa lag & makin cepat proses Update Patch!</div>
        ${INTERNET_PLANS.filter(p => p.releaseYear <= state.year).map(p => `
          <div class="item-row">
            <div><b>${p.name}</b><div class="spec-line">Stabil s/d ${p.maxSmoothPcs} PC Online • <b>${fmtRp(p.monthlyReal)}/bln</b> (Harga Asli)</div></div>
            <button type="button" class="${p.id === state.internetPlanId ? 'success' : 'primary'}" onclick="changeInternetPlan('${p.id}')">${p.id === state.internetPlanId ? 'Aktif' : 'Pasang'}</button>
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
        return `<div class="item-row">
          <img class="disc-thumb" src="${g.cover}" alt="${g.title}" />
          <div style="flex:1">
            <b>${g.title}</b> ${g.canPartyMabar ? '<span class="badge ok">Party Mabar</span>' : ''}
            <div class="spec-line">${g.genre} • Min Spek Tier ${g.minTier} • Ukuran ${g.sizeGb}GB ${g.patchMb ? `• Patch ${g.patchMb}MB` : ''}</div>
            <div style="color:var(--green);font-weight:700;">${price > 0 ? fmtRp(price) : 'Gratis Download Installer'}</div>
          </div>
          ${installed
            ? (needPatch ? `<button type="button" class="amber" onclick="triggerManualPatchAll()">🔄 Update ${needPatch}MB</button>` : `<span class="badge ok">Ter-install</span>`)
            : `<button type="button" class="primary" onclick="installOrBuyPcGame('${g.id}')">${price > 0 ? 'Beli DVD' : 'Download'}</button>`}
        </div>`;
      }).join('')}
    `;
    return;
  }

  if (state.mainTab === 'cashier_stik') {
    box.innerHTML = `
      <div class="card">
        <b>🖱️ Stok & Servis Gear (Mouse + Keyboard + Headset) di Kasir</b>
        <div class="spec-line">Baru (100%): <b>${state.cashierGearNew}</b> • Hasil Servis (65%): <b>${state.cashierGearServiced}</b> • Rusak: <b style="color:var(--red)">${state.cashierGearBroken}</b></div>
        <button type="button" class="amber" ${state.cashierGearBroken <= 0 ? 'disabled' : ''} onclick="manualServiceGear()">🔧 Servis Sendiri 1 Set Gear Rusak</button>
      </div>
      <div class="card">
        <b>📦 Gudang Komponen PC (Bisa Dipasang ke PC atau Dijual Second)</b>
        ${['Cpus', 'Rams', 'Vgas', 'Storages', 'Monitors', 'Coolings'].map(k => {
          const arr = state['warehouse' + k] || [];
          return arr.map((it, idx) => {
            const sellP = Math.round(getPriceFrom2010(it.basePrice2010) * 0.65 * ((it.cond || 100) / 100));
            return `<div class="item-row"><span>${it.name} (${it.cond || 100}%)</span><button type="button" class="amber" onclick="sellSecondhandPart('${k}',${idx})">Jual Second ${fmtRp(sellP)}</button></div>`;
          }).join('');
        }).join('')}
      </div>
    `;
    return;
  }

  if (state.mainTab === 'agen_ppob') {
    box.innerHTML = `
      <div class="card">
        <b>💧 Stok Air Galon &amp; Jualan Pop Mie / Minuman Dingin</b>
        <div class="spec-line">Sisa Air Galon Saat Ini: <b style="color:#38bdf8">${state.waterGallonServings} porsi seduhan</b>. Setiap penjualan Pop Mie / Kopi / ExtraJoss membutuhkan 1 porsi air galon!</div>
        ${WARNET_SUPPLY_CATALOG.map(it => {
          const price = getPriceFrom2010(it.boxPrice2010);
          const stock = it.kind === 'galon' ? `${state.waterGallonServings} porsi` : `${state.snackStockPcs[it.id] || 0} pcs`;
          return `<div class="item-row">
            <img class="prod-thumb" src="${it.img}" alt="${it.name}" />
            <div style="flex:1">
              <b>${it.name}</b> <span class="badge">Stok: ${stock}</span>
              <div class="spec-line">${it.kind === 'galon' ? 'Wajib untuk seduh Pop Mie & Kopi' : `Harga jual ecer: ${fmtRp(getPriceFrom2010(it.sellPcs2010))}/cup`}</div>
              <div style="color:var(--green);font-weight:700;">${fmtRp(price)}</div>
            </div>
            <button type="button" class="primary" onclick="buyWarnetSupply('${it.id}')">+ Beli</button>
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
    box.innerHTML = `
      <div class="card">
        <b>🪙 Investasi Emas Antam Lintas Tahun (Harga Tahun ${state.year}: ${fmtRp(goldPrice)}/gram)</b>
        <div class="spec-line">Tabungan Emasmu: <b style="color:#fbbf24">${state.goldGrams} gram</b> (Nilai Jual Saat Ini: <b style="color:var(--green)">${fmtRp(state.goldGrams * goldPrice)}</b>)</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button type="button" class="amber" onclick="buyGoldGrams(1)">+ Beli 1gr (${fmtRp(goldPrice)})</button>
          <button type="button" class="amber" onclick="buyGoldGrams(5)">+ Beli 5gr (${fmtRp(5 * goldPrice)})</button>
          <button type="button" class="success" ${state.goldGrams < 1 ? 'disabled' : ''} onclick="sellGoldGrams(1)">💸 Jual 1gr</button>
          <button type="button" class="success" ${state.goldGrams < 1 ? 'disabled' : ''} onclick="sellGoldGrams(${state.goldGrams})">💸 Jual Semua Emas</button>
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
            : `<div class="spec-line">Saat ini masih Sewa Bulanan (${fmtRp(getPriceFrom2010(1500000))}/bln). Beli permanen atau cicil 36 bulan:</div>
               <div style="display:flex;gap:6px;">
                 <button type="button" class="primary" onclick="startRukoKpr()">🏠 Cicil KPR 36 Bln (${fmtRp(getPriceFrom2010(120000000))})</button>
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
          : `<div style="display:flex;gap:6px;"><button type="button" class="primary" ${!canBank ? 'disabled' : ''} onclick="takeBankLoan(50000000)">Kredit 50 Jt</button><button type="button" class="primary" ${!canBank ? 'disabled' : ''} onclick="takeBankLoan(150000000)">Kredit 150 Jt</button></div>`}
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
          : `<button type="button" class="primary" ${p.age < 18 ? 'disabled' : ''} onclick="takeItNightCourse()">🎓 Ikut Kursus / Kuliah Malam IT (${fmtRp(getPriceFrom2010(4500000))})</button>`}
      </div>

      <div class="card">
        <b>🚗 Kendaraan &amp; Meteran Perawatan (Bensin, Oli, Mesin &amp; Jual Darurat)</b>
        ${state.ownedVehicles.length === 0 ? `<div class="spec-line">Belum punya motor/mobil.</div>` : ''}
        ${state.ownedVehicles.map((v, idx) => `
          <div class="item-row" style="flex-direction:column;align-items:stretch;">
            <div style="display:flex;justify-content:space-between;"><b>${v.name}</b><span class="badge">BBM ${v.fuelLiters.toFixed(1)}/${v.tankCap}L • Oli ${Math.round(v.oilPct ?? 100)}% • Mesin ${Math.round(v.engineCond ?? 100)}%</span></div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;">
              <button type="button" onclick="refuelOwnedVehicle(${idx})">⛽ Bensin (${fmtRp(bbmPrice)}/L)</button>
              <button type="button" onclick="changeOilVehicle(${idx})">🛢️ Ganti Oli</button>
              <button type="button" onclick="serviceVehicleEngine(${idx})">🔧 Servis</button>
              <button type="button" class="primary" onclick="rideOwnedVehicle(${idx})">🛣️ Jalan</button>
              <button type="button" class="danger" onclick="sellEmergencyAsset('vehicle', ${idx})">💸 Jual Darurat</button>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="card">
        <b>🏠 Properti (Rumah / Apartemen), Cicilan &amp; Jual Aset</b>
        ${(state.ownedHouses || []).map((h, idx) => `
          <div class="item-row">
            <div><b>🏡 Milik Sendiri: ${h.name}</b></div>
            <button type="button" class="danger" onclick="sellEmergencyAsset('house', ${idx})">💸 Jual Rumah (75%)</button>
          </div>
        `).join('')}
        ${PROPERTY_CATALOG.map(pr => `
          <div class="item-row">
            <div><b>${pr.name}</b><div class="spec-line">${pr.desc}</div><div style="color:var(--green);font-weight:700;">${fmtRp(getPriceFrom2010(pr.basePrice2010))}</div></div>
            <div style="display:flex;flex-direction:column;gap:3px;">
              <button type="button" class="primary" onclick="buyOrInstallmentAsset('${pr.name}', ${pr.basePrice2010}, false, 'house')">Cash</button>
              <button type="button" class="amber" onclick="buyOrInstallmentAsset('${pr.name}', ${pr.basePrice2010}, true, 'house')">Cicil</button>
            </div>
          </div>
        `).join('')}
        ${(state.assetLoans || []).filter(a => a.active).map((al, idx) => `
          <div class="item-row">
            <div><b>Cicilan ${al.name}</b><div class="spec-line">Sisa ${fmtRp(al.remainingTotal)} (${al.monthsLeft} bln @ ${fmtRp(al.monthlyInstallment)})</div></div>
            <button type="button" class="success" onclick="payOffAssetLoan(${idx})">Lunasi</button>
          </div>
        `).join('')}
      </div>

      <div class="card">
        <b>📱 Katalog HP &amp; Laptop (iPhone, Samsung, Pixel, Xiaomi • Tahun ${state.year})</b>
        ${GADGET_CATALOG.filter(g => g.yearStart <= state.year).map(g => {
          const ownedIdx = state.ownedGadgets.findIndex(og => og.id === g.id);
          const owned = ownedIdx >= 0;
          return `<div class="item-row">
            <img class="prod-thumb" src="${g.img}" alt="${g.name}" />
            <div style="flex:1"><b>${g.name}</b> <span class="badge">${g.brand}</span><div style="color:var(--green);font-weight:700;">${fmtRp(getPriceFrom2010(g.price2010))}</div></div>
            ${owned
              ? `<button type="button" class="danger" onclick="sellEmergencyAsset('gadget', ${ownedIdx})">💸 Jual Second</button>`
              : `<button type="button" class="primary" onclick="buyGadgetItem('${g.id}')">Beli</button>`}
          </div>`;
        }).join('')}
      </div>

      <div class="card">
        <b>🛵 Kendaraan Motor &amp; Mobil (Cash / Cicil DP 20% • Tahun ${state.year})</b>
        ${VEHICLE_CATALOG.filter(v => v.yearStart <= state.year).map(v => `
          <div class="item-row">
            <img class="prod-thumb" src="${v.img}" alt="${v.name}" />
            <div style="flex:1"><b>${v.name}</b><div style="color:var(--green);font-weight:700;">${fmtRp(getPriceFrom2010(v.price2010))}</div></div>
            <div style="display:flex;flex-direction:column;gap:3px;">
              <button type="button" class="primary" onclick="buyVehicle('${v.id}', false)">Cash</button>
              <button type="button" class="amber" onclick="buyVehicle('${v.id}', true)">Cicil</button>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="card">
        <b>💍 Keluarga, Kebahagiaan (${state.familyHappiness ?? 85}%) &amp; Wariskan Warnet</b>
        <div class="spec-line">Kebahagiaan Keluarga: <b style="color:var(--green)">${state.familyHappiness ?? 85}%</b> • <button type="button" class="amber" onclick="giveFamilyGift()">🎁 Beli Hadiah / Liburan Keluarga (${fmtRp(getPriceFrom2010(500000))})</button></div>
        ${!p.partner ? PARTNERS_LIST.filter(pt => pt.gender !== p.gender).map(pt => `
          <div class="item-row"><span><b>${pt.name}</b> (${pt.job})</span><button type="button" class="primary" ${p.age < 17 ? 'disabled' : ''} onclick="choosePartner('${pt.id}')">Pacaran</button></div>
        `).join('') : `
          <div style="display:flex;gap:6px;">
            ${!p.married ? `<button type="button" class="primary" onclick="marryPartner()">💍 Menikah dengan ${p.partner.name}</button>` : `<button type="button" class="success" onclick="haveChildWithPartner()">👶 Program Anak</button>`}
          </div>
        `}
        ${(p.childrenList || []).map((ch, idx) => `
          <div class="item-row"><span>👶 <b>${ch.name}</b> (${ch.age} thn)</span><button type="button" class="amber" ${ch.age < 8 ? 'disabled' : ''} onclick="inheritToChild(${idx})">👑 Wariskan</button></div>
        `).join('')}
      </div>
    `;
  }
}

// ==================== MODAL RAKIT PC PER SLOT (MULTI-RAM 2-4 SLOT + INSTAL/UNINSTAL GAME PER PC) ====================
function openSlotConfigModal(slotId) {
  const s = state.slots.find(x => x.id === slotId);
  if (!s) return;
  if (!Array.isArray(s.rams)) s.rams = s.ram ? [s.ram] : [];
  if (!Array.isArray(s.installedGames)) s.installedGames = [];
  const availOs = PC_OS_CATALOG.filter(o => o.releaseYear <= state.year);
  const maxRams = s.cpu ? (s.cpu.maxRamSlots || 2) : 2;
  const totalRamGb = getPcTotalRamGb(s);
  const totalGb = getPcTotalStorageGb(s);
  const usedGb = getPcUsedStorageGb(s);
  const pcTier = getPcTier(s);

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

  const ownedLibGames = GAME_DISC_CATALOG.filter(g => state.installedGames[g.id] && g.releaseYear <= state.year);

  showCustomModal(
    `🖥️ Rakit & Kelola Game ${s.name}`,
    `<div class="spec-line">Spek PC: Tier <b>${pcTier}</b> • RAM: <b>${totalRamGb} GB</b> (${s.rams.length}/${maxRams} Slot) • Storage: <b>${usedGb}/${totalGb} GB</b></div>
     ${partRow('🧠 Processor', 'cpu', 'Cpus')}
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
     ${partRow('❄️ Kipas/AC', 'cooling', 'Coolings')}
     <div class="item-row">
       <div><b>🪟 Windows OS:</b> ${s.os ? s.os.name : 'Belum Install'}</div>
       <select onchange="if(this.value)installWindowsOs(${s.id},this.value)">
         <option value="">-- Install Windows --</option>
         ${availOs.map(o => `<option value="${o.id}">${o.name} (${fmtRp(getPriceFrom2010(o.basePrice2010))})</option>`).join('')}
       </select>
     </div>
     <div class="item-row">
       <div><b>🖱️ Mouse+KB+Headset:</b> ${s.gear ? `${s.gear.durability}%` : 'Kosong'}</div>
       <div style="display:flex;gap:4px;">
         <button type="button" class="primary" ${state.cashierGearNew <= 0 ? 'disabled' : ''} onclick="attachGearToPc(${s.id},'new')">Baru (${state.cashierGearNew})</button>
         <button type="button" class="amber" ${state.cashierGearServiced <= 0 ? 'disabled' : ''} onclick="attachGearToPc(${s.id},'serviced')">Servis (${state.cashierGearServiced})</button>
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
             : `<button type="button" class="primary" ${(!fitSpace || !fitSpec) ? 'disabled' : ''} onclick="toggleGameOnPc(${s.id},'${g.id}',true)">${!fitSpec ? 'Spek Kurang' : !fitSpace ? 'HDD Penuh' : 'Instal'}</button>`}
         </div>`;
       }).join('')}
     </div>`
  );
}

function attachRamToSlot(slotId, whIdx) {
  const s = state.slots.find(x => x.id === slotId);
  const idx = Number(whIdx);
  if (!s || !state.warehouseRams[idx]) return;
  if (!Array.isArray(s.rams)) s.rams = [];
  const maxRams = s.cpu ? (s.cpu.maxRamSlots || 2) : 2;
  if (s.rams.length >= maxRams) return;
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
  if (doInstall) {
    if (!s.installedGames.includes(gameId)) s.installedGames.push(gameId);
  } else {
    s.installedGames = s.installedGames.filter(id => id !== gameId);
  }
  playSfx('click');
  saveGame(); openSlotConfigModal(slotId); renderAll();
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

function attachGearToPc(slotId, quality) {
  const s = state.slots.find(x => x.id === slotId);
  if (!s) return;
  if (quality === 'new' && state.cashierGearNew > 0) {
    state.cashierGearNew--;
    s.gear = { name: 'Set Gear Baru', quality: 'new', durability: 100, maxDurability: 100 };
  } else if (quality === 'serviced' && state.cashierGearServiced > 0) {
    state.cashierGearServiced--;
    s.gear = { name: 'Set Gear Servis', quality: 'serviced', durability: 65, maxDurability: 65 };
  }
  saveGame();
  openSlotConfigModal(slotId);
  renderAll();
}

// ==================== PEMBELIAN KOMPONEN, SERVER, ISP, GAME, GALON, GENSET & KARYAWAN SENIN-MINGGU ====================
function buyPcComponent(cat, id) {
  let item, whKey;
  const discMult = state.itCourseCompleted ? 0.85 : 1;
  if (cat === 'cpu') { item = PC_CPU_CATALOG.find(x => x.id === id); whKey = 'warehouseCpus'; }
  else if (cat === 'ram') { item = PC_RAM_CATALOG.find(x => x.id === id); whKey = 'warehouseRams'; }
  else if (cat === 'vga') { item = PC_VGA_CATALOG.find(x => x.id === id); whKey = 'warehouseVgas'; }
  else if (cat === 'storage') { item = PC_STORAGE_CATALOG.find(x => x.id === id); whKey = 'warehouseStorages'; }
  else if (cat === 'monitor') { item = MONITOR_CATALOG.find(x => x.id === id); whKey = 'warehouseMonitors'; }
  else if (cat === 'cooling') { item = COOLING_CATALOG.find(x => x.id === id); whKey = 'warehouseCoolings'; }
  else if (cat === 'gear') {
    item = PERIPHERAL_CATALOG[0];
    const p = roundTo500(getPriceFrom2010(item.basePrice2010) * discMult);
    if (!deductFromAnyCash(p)) return addLog('⚠️ Uang kurang!');
    state.cashierGearNew++;
    playSfx('cash');
    addLog(`🛒 Beli 1 Set Mouse+KB+Headset ke stok Kasir (${fmtRp(p)}).`);
    saveGame(); renderAll(); return;
  }
  if (!item) return;
  const price = roundTo500(getPriceFrom2010(item.basePrice2010) * discMult);
  if (!deductFromAnyCash(price)) return addLog('⚠️ Uang tidak cukup!');
  state[whKey].push({ ...item, uid: cat + '_' + Date.now(), cond: 100 });
  playSfx('cash');
  addLog(`🛒 Membeli <b>${item.name}</b> (${fmtRp(price)}) ke Gudang Rakit PC.`);
  saveGame();
  renderAll();
}

function buyFacilityItem(facId) {
  state.facilities = state.facilities || {};
  if (state.facilities[facId]) return;
  const fac = (typeof WARNET_FACILITIES_CATALOG !== 'undefined' ? WARNET_FACILITIES_CATALOG : []).find(x => x.id === facId);
  if (!fac) return;
  const price = getPriceFrom2010(fac.basePrice2010);
  if (!deductFromAnyCash(price)) return addLog('⚠️ Uang di Dompet/Bank tidak cukup untuk memasang fasilitas ini!');
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
  if (!deductFromAnyCash(totalCost)) return addLog('⚠️ Saldo Dompet/Bank tidak cukup untuk membeli Emas Antam!');
  state.goldGrams = (state.goldGrams || 0) + g;
  playSfx('cash');
  addLog(`🪙 Membeli <b>${g} gram Emas Antam</b> seharga <b>${fmtRp(totalCost)}</b> (${fmtRp(pricePerGram)}/gr).`);
  saveGame();
  renderAll();
}

function sellGoldGrams(grams) {
  state.goldGrams = state.goldGrams || 0;
  const g = Math.min(state.goldGrams, Math.max(1, Number(grams) || 1));
  if (g <= 0) return;
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
  if (state.itCourseCompleted) return;
  if (state.player.age < 18) return addLog('⚠️ Minimal usia 18 tahun untuk mengambil Kursus/Kuliah Malam IT!');
  const cost = getPriceFrom2010(4500000);
  if (!deductFromAnyCash(cost)) return addLog('⚠️ Uang tidak cukup untuk biaya Kursus/Kuliah Malam IT!');
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
    const cat = VEHICLE_CATALOG.find(x => x.id === v.id);
    const base = cat ? cat.price2010 : 12000000;
    const condMult = ((v.engineCond ?? 85) / 100);
    const sellPrice = roundTo500(getPriceFrom2010(base) * 0.65 * condMult);
    state.ownedVehicles.splice(idx, 1);
    state.handWallet += sellPrice;
    playSfx('cash');
    addLog(`💸 Menjual kendaraan <b>${v.name}</b> secara darurat: <b style="color:var(--green)">+${fmtRp(sellPrice)}</b> masuk ke Dompet.`);
  } else if (type === 'gadget') {
    const g = state.ownedGadgets[idx];
    if (!g) return;
    const cat = GADGET_CATALOG.find(x => x.id === g.id);
    const base = cat ? cat.price2010 : 3500000;
    const sellPrice = roundTo500(getPriceFrom2010(base) * 0.60);
    state.ownedGadgets.splice(idx, 1);
    state.handWallet += sellPrice;
    playSfx('cash');
    addLog(`💸 Menjual gadget second <b>${g.name}</b>: <b style="color:var(--green)">+${fmtRp(sellPrice)}</b> masuk ke Dompet.`);
  } else if (type === 'house') {
    const h = (state.ownedHouses || [])[idx];
    if (!h) return;
    const sellPrice = roundTo500(getPriceFrom2010(h.basePrice2010 || 120000000) * 0.75);
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
  const price = Math.round(getPriceFrom2010(it.basePrice2010) * 0.65 * ((it.cond || 100) / 100));
  state.laciCash += price;
  playSfx('cash');
  addLog(`💸 Menjual komponen second <b>${it.name}</b>: <b style="color:var(--green)">+${fmtRp(price)}</b> ke Laci.`);
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
  if (state.cashierGearBroken <= 0) return;
  const partCost = getPriceFrom2010(10000);
  if (!deductFromAnyCash(partCost)) return addLog('⚠️ Uang kurang untuk beli kabel/switch mouse!');
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
  const cost = getPriceFrom2010(it.boxPrice2010);
  if (!deductFromAnyCash(cost)) return addLog('⚠️ Uang kurang!');
  if (it.kind === 'galon') {
    state.waterGallonServings += it.servings;
    addLog(`💧 Beli 1 Galon Air 19L (+${it.servings} porsi seduhan Pop Mie/Kopi).`);
  } else {
    state.snackStockPcs[it.id] = (state.snackStockPcs[it.id] || 0) + it.pcsPerBox;
    addLog(`🍜 Beli 1 Dus <b>${it.name}</b> (+${it.pcsPerBox} pcs).`);
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
  state.employees.splice(idx, 1);
  saveGame();
  renderAll();
}

// ==================== PINJAMAN, TRANSFER KAS, KARAKTER & CLOUD ====================
function takeParentLoan(amount) {
  if (state.parentLoan.active) return;
  const amt = Math.min(30000000, amount);
  state.personalBank += amt;
  state.parentLoan = { active: true, remainingTotal: amt, weeklyInstallment: Math.ceil(amt / 52), weeksLeft: 52 };
  playSfx('cash');
  addLog(`👨‍👩‍👦 Pinjaman Orang Tua cair <b>+${fmtRp(amt)}</b> (52x mingguan tanpa bunga).`);
  saveGame(); renderAll();
}

function takeBankLoan(amount) {
  if (state.player.age < 21 || state.bankLoan.active) return;
  const rate = getBankInterestRate(state.year);
  const months = amount > 60000000 ? 24 : 12;
  const total = Math.round(amount * (1 + (rate / 100) * (months / 12)));
  state.personalBank += amount;
  state.bankLoan = { active: true, principal: amount, remainingTotal: total, monthlyInstallment: Math.ceil(total / months), monthsLeft: months, interestRatePct: rate };
  playSfx('cash');
  addLog(`🏦 Kredit Usaha Bank cair <b>+${fmtRp(amount)}</b>.`);
  saveGame(); renderAll();
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
    state.ownedVehicles.push({ ...v, fuelLiters: v.tankCap });
    playSfx('cash');
    addLog(`💳 Kredit <b>${v.name}</b> disetujui! DP <b>-${fmtRp(dp)}</b>, cicilan ${months} bln @ ${fmtRp(Math.ceil(rem / months))}/bln.`);
  } else {
    if (!deductFromAnyCash(price)) return;
    state.ownedVehicles.push({ ...v, fuelLiters: v.tankCap });
    playSfx('cash');
    addLog(`🛵 Membeli tunai <b>${v.name}</b> (${fmtRp(price)}).`);
  }
  saveGame(); renderAll();
}

function buyOrInstallmentAsset(name, basePrice2010, isInstallment, kind) {
  const price = getPriceFrom2010(basePrice2010);
  if (isInstallment) {
    const dp = Math.round(price * 0.2);
    if (!deductFromAnyCash(dp)) return;
    const rem = Math.round((price - dp) * 1.15);
    const months = 60;
    state.assetLoans = state.assetLoans || [];
    state.assetLoans.push({ name, active: true, remainingTotal: rem, monthlyInstallment: Math.ceil(rem / months), monthsLeft: months });
    if (kind === 'house') state.ownedHouses.push({ name, boughtYear: state.year });
    playSfx('cash');
    addLog(`🏠 KPR <b>${name}</b> disetujui! DP <b>-${fmtRp(dp)}</b>, cicilan 60 bln.`);
  } else {
    if (!deductFromAnyCash(price)) return;
    if (kind === 'house') state.ownedHouses.push({ name, boughtYear: state.year });
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
  const pt = PARTNERS_LIST.find(x => x.id === id);
  if (!pt) return;
  state.player.partner = pt;
  state.player.married = false;
  saveGame(); renderAll();
}

function marryPartner() {
  if (!state.player.partner) return;
  const cost = getPriceFrom2010(15000000);
  if (!deductFromAnyCash(cost)) return addLog('⚠️ Biaya nikah kurang!');
  state.player.married = true;
  addLog(`💍 Resmi menikah dengan <b>${state.player.partner.name}</b>!`);
  saveGame(); renderAll();
}

function haveChildWithPartner() {
  if (!state.player.married) return;
  const isBoy = Math.random() < 0.5;
  const cName = isBoy ? `Putra ${state.player.name.split(' ')[0]}` : `Putri ${state.player.name.split(' ')[0]}`;
  state.player.childrenList.push({ name: cName, gender: isBoy ? 'Laki-laki' : 'Perempuan', age: 0, birthDay: state.day, birthMonth: state.month, birthYear: state.year });
  addLog(`👶 Anakmu <b>${cName}</b> lahir!`);
  saveGame(); renderAll();
}

function inheritToChild(idx) {
  const ch = state.player.childrenList[idx];
  if (!ch || ch.age < 8) return;
  state.player.name = ch.name;
  state.player.gender = ch.gender;
  state.player.age = ch.age;
  state.player.birthYear = ch.birthYear;
  state.player.partner = null;
  state.player.married = false;
  state.player.childrenList = [];
  addLog(`👑 Seluruh usaha Warnet resmi diwariskan kepada <b>${ch.name}</b>!`);
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
    '🖥️ Mulai Usaha Warnet Baru (Tahun 2010 • Modal Rp 50 Juta)',
    `<div class="grid-2">
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
  state.kwh = 45.0; state.plnBlackout = false;
  state.genset = { owned: true, active: false, fuelLiters: 8.0, maxTankLiters: 15.0 };
  state.cleanliness = 100; state.renovLevel = 1; state.serverLevel = 1; state.internetPlanId = 'isp_1m';
  state.rentalOpen = true;
  state.slots = createEmptyWarnetSlots20();
  state.waitingQueue = [];
  state.warehouseCpus = []; state.warehouseRams = []; state.warehouseVgas = [];
  state.warehouseStorages = []; state.warehouseMonitors = []; state.warehouseCoolings = [];
  state.cashierGearNew = 3; state.cashierGearServiced = 0; state.cashierGearBroken = 0;
  state.waterGallonServings = 45;
  state.employees = [];
  state.player = { name, gender, religion, ethnicity, birthDay: bDay, birthMonth: bMonth, birthYear: bYear, age: 2010 - bYear, partner: null, married: false, childrenList: [] };
  seedStarterWarnetPcs();
  saveGame();
  closeCustomModal();
  renderAll();
  addLog(`🎉 Usaha Warnet <b>${name}</b> (Usia ${state.player.age} thn) resmi dimulai di tahun 2010 dengan modal Rp 50 Juta!`);
}

function saveGame() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (typeof CloudSync !== 'undefined') CloudSync.pushToCloud(state);
  } catch (e) {}
}

function loadGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { seedStarterWarnetPcs(); return false; }
    const parsed = JSON.parse(raw);
    Object.assign(state, parsed);
    if (!state.slots || state.slots.length !== 20 || !('cpu' in state.slots[0])) {
      state.slots = createEmptyWarnetSlots20();
      seedStarterWarnetPcs();
    }
    return true;
  } catch (e) {
    seedStarterWarnetPcs();
    return false;
  }
}

function openCloudSyncModal() {
  showCustomModal(
    '☁️ Cloud Save Warnet',
    `<input id="cloudSyncIdInp" value="${typeof CloudSync !== 'undefined' ? CloudSync.syncId : 'oneil_default'}" />`,
    `<button type="button" onclick="closeCustomModal()">Tutup</button>`
  );
}

window.addEventListener('DOMContentLoaded', () => {
  loadGame();
  renderAll();
  setInterval(gameTick, 250);
});
