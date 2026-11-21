// RENTAL LIFE BY ONEILVERSE - V1.0 RELEASE ENGINE
// Lengkap: Profil Karakter (Nama, Agama, Tgl Lahir, Etnis, Jadwal Sholat Dinamis),
// Lab R&D Baterai & Charger (5.000mAh -> Tak Terbatas, Efisiensi Gacha+Lock 1-100%, Charger 5W->480W 10-30 Tahap),
// Kuliah Kedokteran & Jurusan Lain, Toko HP Realistis + Google Pixel, Sims Stats + HB Bar + Selingkuh,
// 5 Room Kosong Serbaguna, HR Karyawan Tanpa Batas, Keuangan 4 Pos, Firestore Cloud Sync & Reset.

const STORAGE_KEY = 'oneilverse_rental_life_v1_0';

const state = {
  version: 'v1.0',
  gameMode: 'dev',
  rentalName: 'Rental Life by Oneilverse',
  vip2x: false,
  paused: false,
  speed: 1, // 1x (1 hari = 24 mnt), 2x, 4x

  // Kalender Indonesia mulai Rabu, 1 Januari 2020, 08:00
  year: 2020,
  month: 1,
  day: 1,
  dayOfWeek: 3,
  totalDays: 1,
  hour: 8,
  minute: 0,
  isOpen: false,
  plnBlackout: false,
  blackoutMinutesLeft: 0,

  // 4 Pos Keuangan Terpisah:
  // 1. handWallet = Dompet Tunai Pribadi di tangan
  // 2. personalBank = Rekening Bank Pribadi (M-Banking)
  // 3. laciCash = Laci Kasir Usaha Rental
  // 4. businessPpobBalance = Saldo Agen Bisnis PPOB
  handWallet: 1500000,
  personalBank: 94500000,
  laciCash: 2000000,
  businessPpobBalance: 2000000,
  qrisBalance: 0,
  qrisLinkedToBank: false,

  // Listrik kWh & Lab R&D Baterai Modifikasi Sendiri
  kwh: 60.0,
  kiosLevel: 1,
  kiosOwned: false,
  batteryLab: {
    capacityMah: 5000, // Awal 5.000 mAh
    currentWh: 18.5, // 5000 mAh * 3.7V / 1000 = 18.5 Wh
    efficiencyPct: 50, // 1% - 100% (makin tinggi makin irit)
    isLocked: false, // Jika dikunci, kapasitas naik -> efisiensi riset ulang
    lockedVersionLabel: 'Belum Dikunci',
    chargerTierIdx: 0, // Index ke CHARGER_TIERS (0 = 5W)
    chargerStepProgress: 0,
    chargerStepTarget: 12, // 10 - 30 tahap per kenaikan watt
    nextStepName: 'Riset Gulungan Trafo Step-Down',
    isCharging: true
  },

  // Stok Grosir Etalase Kasir & Sparepart
  retailStock: {
    sutra: 6,
    fiesta: 6,
    durex: 0,
    vivo: 0,
    sagami: 0,
    popmie: 12,
    esteh: 20
  },
  spareSticks: 2,

  // HR Karyawan Tanpa Batas & Hutang Berbunga 20%
  employees: [],
  debts: [],

  // Wi-Fi & Hotspot
  wifi: {
    provider: null,
    hotspotOpen: false,
    voucherPrice: 3000,
    voucherHours: 3,
    activeUsers: 0
  },

  // Inventaris Perangkat, Kendaraan & HP
  inventoryConsoles: [],
  inventoryTVs: [],
  inventoryBeds: [],
  ownedVehicles: [],
  ownedPhones: [],
  activePhone: null,

  // 5 Room Kosong Awal
  rooms: [],
  recommendedGames: [],
  selectedRoomForGames: null,

  // Profil Karakter Utama (The Sims Stats + Agama + Etnis + Kuliah + Relasi)
  player: {
    name: 'Neila Aura',
    religion: 'Islam',
    ethnicity: 'chinese',
    birthDay: 15,
    birthMonth: 6,
    birthYear: 2002,
    age: 18,
    gender: 'Perempuan',
    // Stats ala The Sims
    energy: 100,
    hunger: 90,
    hygiene: 95,
    mood: 85,
    hbBar: 25, // 0 - 100 (Gairah / Hasrat)
    hasPrivateToy: false,
    charm: 35,
    reputation: 4.5,
    location: 'Di Rental',
    prayedToday: [],
    // Kuliah & Pendidikan
    college: {
      enrolled: false,
      majorId: null,
      majorName: '',
      semester: 1,
      maxSemesters: 8,
      studyProgress: 0,
      gpa: 3.5,
      graduated: false,
      degreePrefix: ''
    },
    // Relasi, Pasangan & Selingkuhan
    status: 'Lajang',
    partner: null, // Pasangan utama
    affairPartner: null, // Selingkuhan / Suami Orang
    relationship: 0,
    affairRelationship: 0,
    kbActive: false,
    condomActive: false,
    pregnant: false,
    pregnantWeeks: 0,
    babyFatherEthnicity: 'chinese',
    childrenList: [], // [{ name, ethnicityDesc, age }]
    gossipLevel: 0
  },

  mainTab: 'toko',
  subTab: 'konsol',
  syncStatus: 'Offline'
};

function fmtRp(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

function roundTo500(n) {
  return Math.round(n / 500) * 500;
}

function getMaxBatteryWh() {
  return (state.batteryLab.capacityMah * 3.7) / 1000;
}

function getCurrentChargerWatt() {
  return CHARGER_TIERS[state.batteryLab.chargerTierIdx] || 5;
}

function getHoursToFullCharge() {
  const maxWh = getMaxBatteryWh();
  const remWh = Math.max(0, maxWh - state.batteryLab.currentWh);
  const watt = getCurrentChargerWatt();
  return remWh / (watt * 0.85);
}

function addLog(msg) {
  const box = document.getElementById('logBox');
  if (!box) return;
  const div = document.createElement('div');
  div.className = 'log-entry';
  const hh = String(state.hour).padStart(2, '0');
  const mm = String(state.minute).padStart(2, '0');
  const dayStr = DAY_NAMES[state.dayOfWeek];
  div.innerHTML = `<span style="color:#64748b">[${dayStr}, ${state.day}/${state.month}/${state.year} ${hh}:${mm}]</span> ${msg}`;
  box.prepend(div);
  if (box.children.length > 65) box.removeChild(box.lastChild);
}

// ==================== INISIALISASI 5 ROOM KOSONG & PROFIL KARAKTER ====================
function initEmptyStarterRooms() {
  state.rooms = [];
  for (let i = 1; i <= 5; i++) {
    state.rooms.push({
      id: i,
      mode: 'empty',
      console: null,
      tv: null,
      bed: null,
      entertainer: null,
      rate: 0,
      discountPct: 0,
      hasFan: false,
      hasAC: false,
      hasCCTV: false,
      customer: null,
      timeLeft: 0,
      totalTime: 0,
      cleaningTime: 0
    });
  }
}

function showCustomModal(title, bodyHtml, footerHtml) {
  document.getElementById('customModalTitle').innerHTML = title;
  document.getElementById('customModalBody').innerHTML = bodyHtml;
  document.getElementById('customModalFooter').innerHTML = footerHtml || '';
  document.getElementById('customModalBackdrop').style.display = 'flex';
}

function closeCustomModal() {
  document.getElementById('customModalBackdrop').style.display = 'none';
}

function openCharacterCreationModal() {
  showCustomModal(
    '👩🏻 Buat Karakter & Pilih Mode Awal (v1.0)',
    `<div class="grid-2">
       <div>
         <label style="font-size:0.72rem;color:var(--muted);">Nama Karakter:</label>
         <input type="text" id="ccName" value="${state.player.name}" />
       </div>
       <div>
         <label style="font-size:0.72rem;color:var(--muted);">Agama (Mempengaruhi Jadwal Ibadah):</label>
         <select id="ccReligion">
           ${RELIGIONS_ID.map(rel => `<option value="${rel}" ${state.player.religion===rel?'selected':''}>${rel}</option>`).join('')}
         </select>
       </div>
     </div>
     <div class="grid-2">
       <div>
         <label style="font-size:0.72rem;color:var(--muted);">Etnis / Keturunan:</label>
         <select id="ccEthnicity">
           ${ETHNICITIES.map(eth => `<option value="${eth.id}" ${state.player.ethnicity===eth.id?'selected':''}>${eth.name}</option>`).join('')}
         </select>
       </div>
       <div>
         <label style="font-size:0.72rem;color:var(--muted);">Tanggal Lahir (Mulai Jan 2020):</label>
         <div style="display:flex;gap:4px;">
           <input type="number" id="ccBDay" value="15" min="1" max="30" placeholder="Tgl" />
           <input type="number" id="ccBMonth" value="6" min="1" max="12" placeholder="Bln" />
           <input type="number" id="ccBYear" value="2002" min="1985" max="2003" placeholder="Thn" />
         </div>
       </div>
     </div>
     <div style="font-size:0.74rem;color:var(--muted);background:#090e1a;padding:8px;border-radius:8px;line-height:1.4;">
       • <b>Islam:</b> Muncul jadwal Sholat 5 waktu dinamis sesuai pergeseran matahari tiap tanggal & bulan.<br>
       • <b>Etnis:</b> Menentukan ciri fisik keturunan jika memiliki anak (misal Chinese + Bule).<br>
       • <b>5 Room Awal Kosong:</b> Bebas diisi PS1–PS5, PC, Kasur Pasangan, atau Pekerja Hiburan.
     </div>`,
    `<button class="purple" onclick="finishCharacterSetup('dev')">🛠️ Mulai Mode Dev (100 Jt)</button>
     <button class="success" onclick="finishCharacterSetup('release')">🎮 Mulai Mode Rilis (30 Jt)</button>`
  );
}

function finishCharacterSetup(mode) {
  const name = document.getElementById('ccName').value.trim() || 'Neila Aura';
  const religion = document.getElementById('ccReligion').value;
  const ethnicity = document.getElementById('ccEthnicity').value;
  const bDay = Math.max(1, Math.min(30, Number(document.getElementById('ccBDay').value) || 15));
  const bMonth = Math.max(1, Math.min(12, Number(document.getElementById('ccBMonth').value) || 6));
  const bYear = Math.max(1980, Math.min(2003, Number(document.getElementById('ccBYear').value) || 2002));

  state.gameMode = mode;
  state.year = 2020; state.month = 1; state.day = 1; state.dayOfWeek = 3; state.totalDays = 1;
  state.hour = 8; state.minute = 0;
  state.isOpen = false;
  state.plnBlackout = false;
  state.kiosLevel = 1; state.kiosOwned = false;
  state.inventoryConsoles = []; state.inventoryTVs = []; state.inventoryBeds = [];
  state.ownedVehicles = []; state.ownedPhones = []; state.activePhone = null;
  state.employees = []; state.debts = [];
  state.batteryLab = {
    capacityMah: 5000, currentWh: 18.5, efficiencyPct: 50, isLocked: false,
    lockedVersionLabel: 'Belum Dikunci', chargerTierIdx: 0, chargerStepProgress: 0,
    chargerStepTarget: 12, nextStepName: CHARGER_RESEARCH_STEPS_NAMES[0], isCharging: true
  };
  initEmptyStarterRooms();

  state.player.name = name;
  state.player.religion = religion;
  state.player.ethnicity = ethnicity;
  state.player.birthDay = bDay;
  state.player.birthMonth = bMonth;
  state.player.birthYear = bYear;
  state.player.age = 2020 - bYear;
  state.player.energy = 100; state.player.hunger = 90; state.player.hygiene = 95; state.player.mood = 85; state.player.hbBar = 25;
  state.player.status = 'Lajang'; state.player.partner = null; state.player.affairPartner = null;
  state.player.pregnant = false; state.player.childrenList = [];
  state.player.college = { enrolled: false, majorId: null, majorName: '', semester: 1, maxSemesters: 8, studyProgress: 0, gpa: 3.5, graduated: false, degreePrefix: '' };

  if (mode === 'dev') {
    state.handWallet = 2000000;
    state.personalBank = 94000000;
    state.laciCash = 2000000;
    state.businessPpobBalance = 2000000;
    addLog(`🛠️ <b>Mode Developer (v1.0)</b> • Selamat datang <b>${name}</b> (${religion}, ${ETHNICITIES.find(e=>e.id===ethnicity)?.name}).`);
  } else {
    state.handWallet = 1500000;
    state.personalBank = 26500000;
    state.laciCash = 1000000;
    state.businessPpobBalance = 1000000;
    addLog(`🚀 <b>Mode Rilis (v1.0)</b> • Selamat datang <b>${name}</b> (${religion}).`);
  }

  closeCustomModal();
  saveGame(true);
  renderAll(true);
}

function openEditRentalNameModal() {
  showCustomModal(
    '✏️ Ubah Nama Tempat Usaha',
    `<input type="text" id="inpRentalName" value="${state.rentalName}" maxlength="32" />`,
    `<button onclick="closeCustomModal()">Batal</button>
     <button class="primary" onclick="const v=document.getElementById('inpRentalName').value.trim();if(v.length>=3){state.rentalName=v;closeCustomModal();saveGame(true);updateHudOnly();}">Simpan</button>`
  );
}

function togglePause() { state.paused = !state.paused; updateHudOnly(); }
function setSpeed(s) { state.speed = s; state.paused = false; updateHudOnly(); }
function toggleShopManual() {
  state.isOpen = !state.isOpen;
  addLog(state.isOpen ? `🟢 <b>${state.rentalName}</b> dibuka.` : '🔴 Rental ditutup.');
  saveGame(true); updateHudOnly();
}

// ==================== ENGINE WAKTU, SHOLAT, KELISTRIKAN & LAB BATERAI ====================
setInterval(() => {
  if (state.paused) return;
  for (let i = 0; i < state.speed; i++) {
    tickOneInGameMinute();
  }
  updateHudOnly();
  renderRooms();
  if (state.mainTab === 'lab') renderRightPanel();
}, 1000);

setInterval(() => { saveGame(false); }, 10000);

function getActiveEmployeesNow() {
  return state.employees.filter(emp => {
    if (emp.offDays.includes(state.dayOfWeek)) return false;
    if (emp.shiftStart <= emp.shiftEnd) return state.hour >= emp.shiftStart && state.hour < emp.shiftEnd;
    return state.hour >= emp.shiftStart || state.hour < emp.shiftEnd;
  });
}

function calculateTotalLoadWatt() {
  // Laptop Kasir (65W saat buka) + Wi-Fi (25W) + seluruh unit room aktif
  let watt = state.isOpen ? 65 : 0;
  if (state.wifi.provider) watt += 25;
  state.rooms.forEach(r => {
    if (r.hasCCTV) watt += 12;
    if (r.customer) {
      if (r.console) watt += r.console.watt;
      if (r.tv) watt += r.tv.watt;
      if (r.bed) watt += r.bed.watt;
      if (r.hasAC) watt += 350;
      else if (r.hasFan) watt += 45;
    }
  });
  return watt;
}

function tickOneInGameMinute() {
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

  // Notifikasi Waktu Sholat Dinamis jika karakter beragama Islam
  if (state.player.religion === 'Islam') {
    const pTimes = getDynamicPrayerTimes(state.month, state.day);
    const nowStr = `${String(state.hour).padStart(2, '0')}:${String(state.minute).padStart(2, '0')}`;
    for (const [key, timeVal] of Object.entries(pTimes)) {
      if (nowStr === timeVal && !state.player.prayedToday.includes(key)) {
        addLog(`🕌 Masuk waktu Sholat <b>${key.toUpperCase()} (${timeVal})</b>. Kamu bisa menunaikan sholat di menu Hidup.`);
      }
    }
  }

  // Jam buka otomatis berdasarkan shift karyawan
  const activeEmps = getActiveEmployeesNow();
  if (state.employees.length > 0) {
    const shouldOpen = activeEmps.length > 0;
    if (shouldOpen && !state.isOpen) {
      state.isOpen = true;
      addLog(`🧑‍💼 Karyawan <b>${activeEmps[0].name}</b> masuk shift & membuka rental.`);
    } else if (!shouldOpen && state.isOpen && state.player.location !== 'Di Rental') {
      state.isOpen = false;
      addLog('🔒 Shift karyawan berakhir, rental tutup otomatis.');
    }
  }

  // Pemadaman Listrik PLN Bergilir (Acak sesekali) -> Baterai Modifikasi Backup Otomatis!
  if (!state.plnBlackout && state.isOpen && Math.random() < 0.0012) {
    state.plnBlackout = true;
    state.blackoutMinutesLeft = Math.floor(20 + Math.random() * 55);
    addLog(`⚡⚠️ <b>MATI LAMPU PLN!</b> Baterai modifikasi (${state.batteryLab.capacityMah.toLocaleString('id-ID')} mAh) otomatis mengambil alih listrik rental!`);
  }

  const loadWatt = calculateTotalLoadWatt();
  const maxWh = getMaxBatteryWh();

  if (state.plnBlackout) {
    state.blackoutMinutesLeft -= 1;
    if (state.blackoutMinutesLeft <= 0) {
      state.plnBlackout = false;
      addLog('💡 <b>Listrik PLN kembali menyala!</b> Charger baterai mulai mengisi ulang.');
    } else if (loadWatt > 0) {
      // Efisiensi baterai mengurangi konsumsi Wh (1% - 100% efisiensi)
      const effFactor = Math.max(0.15, 1.3 - (state.batteryLab.efficiencyPct / 100));
      const whUsed = ((loadWatt * effFactor) / 1000) / 60;
      state.batteryLab.currentWh = Math.max(0, state.batteryLab.currentWh - whUsed);
      if (state.batteryLab.currentWh <= 0) {
        addLog('🪫 <b>BATERAI BACKUP HABIS (0%)!</b> Perangkat elektronik mati mendadak!');
        state.rooms.forEach(r => { if (r.customer) { r.customer = null; r.timeLeft = 0; } });
      }
    }
  } else {
    // PLN Nyala -> Charger mengisi baterai sesuai Watt charger!
    if (state.batteryLab.isCharging && state.batteryLab.currentWh < maxWh) {
      const cWatt = getCurrentChargerWatt();
      const whAdded = ((cWatt * 0.85) / 1000) / 60;
      state.batteryLab.currentWh = Math.min(maxWh, state.batteryLab.currentWh + whAdded);
    }
    // Pemakaian kWh PLN
    if (loadWatt > 0) {
      state.kwh = Math.max(0, +(state.kwh - (loadWatt / 1000) / 60).toFixed(4));
      if (state.kwh <= 0) {
        addLog('⚡ <b>TOKEN PLN HABIS (0 kWh)!</b>');
        state.rooms.forEach(r => { if (r.customer) { r.customer = null; r.timeLeft = 0; } });
      }
    }
  }

  // Pengeluaran makan & bensin dari Dompet Tunai di Tangan
  if (state.minute === 0 && (state.hour === 8 || state.hour === 13 || state.hour === 19)) {
    const cost = roundTo500(15000 + Math.random() * 20000);
    if (state.handWallet >= cost) {
      state.handWallet -= cost;
      addLog(`🍽️ Pengeluaran harian (Makan/Bensin): <b>-${fmtRp(cost)}</b> dari Dompet Tunai.`);
    }
  }

  // Update Sesi Setiap Room + Auto-Cleaning 15 Menit
  const hasCleaner = activeEmps.some(e => e.role === 'all' || e.role === 'clean');
  const hasTech = activeEmps.some(e => e.role === 'all' || e.role === 'tech');
  const powerAvailable = (!state.plnBlackout && state.kwh > 0) || (state.plnBlackout && state.batteryLab.currentWh > 0);

  state.rooms.forEach(r => {
    if (r.cleaningTime > 0 && (hasCleaner || state.player.location === 'Di Rental')) {
      r.cleaningTime -= 1;
      if (r.cleaningTime <= 0) {
        r.cleaningTime = 0;
        addLog(`✨ <b>Room #${r.id}</b> selesai dibersihkan dan siap disewa lagi.`);
      }
    }
    if (r.customer && powerAvailable) {
      r.timeLeft -= 1;
      if (r.console && r.console.stickHp > 0 && Math.random() < 0.003) {
        r.console.stickHp = Math.max(0, r.console.stickHp - 15);
        if (r.console.stickHp === 0 && hasTech && state.spareSticks > 0) {
          state.spareSticks -= 1;
          r.console.stickHp = 100;
          addLog(`🔧 Teknisi otomatis ganti stik rusak di <b>Room #${r.id}</b>.`);
        }
      }
      if (r.timeLeft <= 0) {
        addLog(`✅ Tamu <b>${r.customer.name}</b> selesai di <b>Room #${r.id}</b>.`);
        const needClean = (r.mode === 'couple' || r.mode === 'entertainment');
        r.customer = null;
        r.timeLeft = 0;
        if (needClean) {
          r.cleaningTime = 15;
          addLog(`🧹 <b>Room #${r.id}</b> sedang dibersihkan (15 menit)...`);
        }
      }
    }
  });

  // Pelanggan datang otomatis
  if (state.isOpen && powerAvailable && Math.random() < 0.09) {
    spawnAutoWalkInCustomer();
  }
  if (state.isOpen && Math.random() < 0.045) {
    sellRetailItemToVisitor();
  }
  if (state.isOpen && state.wifi.provider && state.wifi.hotspotOpen && Math.random() < 0.03) {
    const inc = roundTo500(state.wifi.voucherPrice * (state.vip2x ? 2 : 1));
    state.laciCash += inc;
    state.wifi.activeUsers = Math.min(30, state.wifi.activeUsers + 1);
    addLog(`📶 Voucher Wi-Fi terjual <b>+${fmtRp(inc)}</b> ke Laci Kasir.`);
  }
  if (state.isOpen && state.businessPpobBalance >= 60000 && Math.random() < 0.025) {
    const valid = PPOB_PRODUCTS.filter(p => state.businessPpobBalance >= (p.nominal + p.adminProvider));
    if (valid.length > 0) {
      const pr = valid[Math.floor(Math.random() * valid.length)];
      const modal = pr.nominal + pr.adminProvider;
      const profit = (pr.hargaJual - modal) * (state.vip2x ? 2 : 1);
      state.businessPpobBalance -= modal;
      state.laciCash += roundTo500(modal + profit);
      addLog(`📲 PPOB: <b>${pr.name}</b> • Saldo Bisnis -${fmtRp(modal)}, Laci +${fmtRp(modal + profit)}.`);
    }
  }
}

function onNewHour() {
  // Stats ala The Sims berubah tiap jam
  state.player.energy = Math.max(0, state.player.energy - 2);
  state.player.hunger = Math.max(0, state.player.hunger - 3);
  state.player.hygiene = Math.max(0, state.player.hygiene - 2);
  state.player.mood = Math.max(0, state.player.mood - 1);
  state.player.hbBar = Math.min(100, state.player.hbBar + 3);
}

function onNewDay() {
  state.day += 1;
  state.totalDays += 1;
  state.dayOfWeek = (state.dayOfWeek + 1) % 7;
  state.player.prayedToday = [];

  if (state.day > 30) {
    state.day = 1;
    state.month += 1;
    onNewMonth();
  }
  if (state.month > 12) {
    state.month = 1;
    state.year += 1;
    state.player.age += 1;
    if (state.player.partner) state.player.partner.age += 1;
    if (state.player.affairPartner) state.player.affairPartner.age += 1;
    state.player.childrenList.forEach(c => c.age += 1);
    addLog(`🎂 Tahun baru ${state.year}! Usiamu sekarang <b>${state.player.age} tahun</b>.`);
  }

  // Pelunasan kasbon berbunga 20%
  const dueDebts = state.debts.filter(d => state.totalDays >= d.dueDay);
  if (dueDebts.length > 0) {
    dueDebts.forEach(d => {
      state.laciCash += d.totalDue;
      addLog(`💸 <b>${d.debtorName}</b> melunasi hutang + bunga 20% sebesar <b>+${fmtRp(d.totalDue)}</b> ke Laci!`);
    });
    state.debts = state.debts.filter(d => state.totalDays < d.dueDay);
  }

  // Penghasilan tambahan jika sudah lulus dokter / sarjana
  if (state.player.college.graduated) {
    const major = UNIVERSITY_MAJORS.find(m => m.id === state.player.college.majorId);
    if (major) {
      state.personalBank += major.jobBonus;
      addLog(`🩺 Honor praktik/profesi (${major.name}): <b>+${fmtRp(major.jobBonus)}</b> masuk Bank Pribadi.`);
    }
  }

  // Sewa kendaraan
  state.ownedVehicles.forEach(v => {
    if (v.isRentedOut) {
      const inc = roundTo500(v.rentDaily * (state.vip2x ? 2 : 1));
      state.personalBank += inc;
      addLog(`🛵 Sewa harian <b>${v.name}</b> masuk Bank Pribadi: <b>+${fmtRp(inc)}</b>.`);
    }
  });

  // Kehamilan & Kelahiran dengan genetika campuran etnis
  if (state.player.pregnant) {
    state.player.pregnantWeeks += 1;
    if (state.player.pregnantWeeks >= 36) {
      state.player.pregnant = false;
      state.player.pregnantWeeks = 0;
      const desc = getMixedChildAppearance(state.player.ethnicity, state.player.babyFatherEthnicity);
      const childNum = state.player.childrenList.length + 1;
      state.player.childrenList.push({ name: `Anak ke-${childNum}`, appearance: desc, age: 0 });
      addLog(`👶 Selamat! Buah hati lahir sehat! Ciri fisik: <b>${desc}</b>.`);
    }
  }
}

function onNewMonth() {
  const kios = KIOS_TIERS.find(k => k.level === state.kiosLevel);
  if (!state.kiosOwned) {
    state.laciCash = Math.max(0, state.laciCash - kios.monthlyRent);
    addLog(`🏠 Sewa bulanan ${kios.name} (<b>-${fmtRp(kios.monthlyRent)}</b>) dibayar dari Laci.`);
  }
  if (state.wifi.provider) {
    state.laciCash = Math.max(0, state.laciCash - state.wifi.provider.monthly);
  }
  state.employees.forEach(emp => {
    const totalPay = emp.salary + (emp.bonus || 0) + (emp.bpjs ? 150000 : 0);
    state.laciCash = Math.max(0, state.laciCash - totalPay);
    addLog(`🧑‍💼 Gaji bulanan <b>${emp.name}</b>: <b>-${fmtRp(totalPay)}</b>.`);
  });
}

function spawnAutoWalkInCustomer() {
  const readyRooms = state.rooms.filter(r => !r.customer && r.cleaningTime === 0 && r.mode !== 'empty');
  if (readyRooms.length === 0) return;
  const room = readyRooms[Math.floor(Math.random() * readyRooms.length)];
  if (room.mode === 'gaming' && (!room.console || !room.tv || room.console.stickHp <= 0)) return;

  const names = ['Rizky', 'Bima', 'Aldi', 'Dika', 'Fajar', 'Galih', 'Hendra', 'Kevin', 'Nando', 'Taufik'];
  const custName = names[Math.floor(Math.random() * names.length)];
  const hours = room.mode === 'couple' ? (Math.floor(Math.random() * 4) + 1) : (Math.floor(Math.random() * 3) + 1);
  const netRate = roundTo500(room.rate * (1 - room.discountPct / 100));
  const totalPay = roundTo500(netRate * hours * (state.vip2x ? 2 : 1));
  let ownerShare = totalPay;
  if (room.mode === 'entertainment' && room.entertainer) {
    ownerShare = roundTo500(totalPay * (room.entertainer.ownerPct / 100));
  }

  room.customer = { name: custName, hours, totalPaid: ownerShare };
  room.totalTime = hours * 60;
  room.timeLeft = hours * 60;

  if (Math.random() < 0.14 && ownerShare > 0) {
    const withInterest = roundTo500(ownerShare * 1.2);
    state.debts.push({ id: 'd_' + Date.now(), debtorName: custName, principal: ownerShare, totalDue: withInterest, dueDay: state.totalDays + 2 });
    addLog(`📒 <b>${custName}</b> masuk <b>Room #${room.id}</b> (${hours} jam) Kasbon <b>${fmtRp(ownerShare)} + 20% = ${fmtRp(withInterest)}</b>.`);
  } else if (Math.random() < 0.35) {
    if (state.qrisLinkedToBank) {
      state.personalBank += ownerShare;
      addLog(`📲 <b>${custName}</b> masuk <b>Room #${room.id}</b> bayar QRIS <b>+${fmtRp(ownerShare)}</b> ke Bank Pribadi.`);
    } else {
      state.qrisBalance += ownerShare;
      addLog(`📲 <b>${custName}</b> masuk <b>Room #${room.id}</b> bayar QRIS <b>+${fmtRp(ownerShare)}</b> ke Saldo QRIS.`);
    }
  } else {
    state.laciCash += ownerShare;
    addLog(`💵 <b>${custName}</b> masuk <b>Room #${room.id}</b> (${hours} jam) bayar tunai <b>+${fmtRp(ownerShare)}</b> ke Laci.`);
  }
}

function sellRetailItemToVisitor() {
  const available = RETAIL_GOODS.filter(g => (state.retailStock[g.id] || 0) > 0);
  if (available.length === 0) return;
  const item = available[Math.floor(Math.random() * available.length)];
  state.retailStock[item.id] -= 1;
  const earn = roundTo500(item.sellPrice * (state.vip2x ? 2 : 1));
  state.laciCash += earn;
  addLog(`🛒 Pengunjung membeli <b>${item.name.split(' (')[0]}</b> di etalase (<b>+${fmtRp(earn)}</b>).`);
}

// ==================== LAB R&D BATERAI & CHARGER ====================
function upgradeBatteryCapacity() {
  const curMah = state.batteryLab.capacityMah;
  // Kenaikan bertahap realistis: 5rb -> 20rb -> +20rb -> +50rb -> dst eksponensial
  let addMah = 15000;
  if (curMah >= 20000 && curMah < 100000) addMah = 20000;
  else if (curMah >= 100000 && curMah < 1000000) addMah = 100000;
  else if (curMah >= 1000000) addMah = Math.round(curMah * 0.5);

  const cellBlocks = Math.max(1, Math.round(addMah / 5000));
  const cost = roundTo500(cellBlocks * 85000 + 150000); // Harga sel baterai + BMS + kabel

  if (state.personalBank < cost && state.handWallet < cost) {
    return addLog(`❌ Saldo Bank Pribadi / Dompet kurang (${fmtRp(cost)}) untuk merakit +${addMah.toLocaleString('id-ID')} mAh!`);
  }
  if (state.personalBank >= cost) state.personalBank -= cost;
  else state.handWallet -= cost;

  state.batteryLab.capacityMah += addMah;
  // Jika sebelumnya dikunci, buka kunci dan reset efisiensi untuk diriset ulang di kapasitas baru!
  if (state.batteryLab.isLocked) {
    state.batteryLab.isLocked = false;
    state.batteryLab.efficiencyPct = Math.floor(1 + Math.random() * 40);
    addLog(`🔓 Kunci versi lama dilepas! Kapasitas naik ke <b>${state.batteryLab.capacityMah.toLocaleString('id-ID')} mAh</b> — silakan riset ulang efisiensinya!`);
  } else {
    state.batteryLab.efficiencyPct = Math.floor(1 + Math.random() * 100);
    addLog(`🔋 Merakit sel baru! Kapasitas naik ke <b>${state.batteryLab.capacityMah.toLocaleString('id-ID')} mAh</b> (Efisiensi acak: ${state.batteryLab.efficiencyPct}%).`);
  }
  saveGame(true); renderRightPanel();
}

function researchBatteryEfficiency() {
  if (state.batteryLab.isLocked) return addLog('🔒 Versi baterai ini sudah dikunci! Naikkan kapasitas mAh dulu jika ingin meriset versi baru.');
  const cost = roundTo500(300000 + Math.random() * 200000); // Rp 300rb - 500rb
  if (state.personalBank < cost) return addLog(`❌ Butuh saldo Bank Pribadi ${fmtRp(cost)} untuk riset efisiensi!`);
  state.personalBank -= cost;
  const newEff = Math.floor(1 + Math.random() * 100);
  state.batteryLab.efficiencyPct = newEff;
  addLog(`🧪 Riset Efisiensi Baterai (-${fmtRp(cost)}): Hasil efisiensi menjadi <b>${newEff}%</b>!`);
  saveGame(true); renderRightPanel();
}

function lockBatteryVersion() {
  state.batteryLab.isLocked = true;
  state.batteryLab.lockedVersionLabel = `${state.batteryLab.capacityMah.toLocaleString('id-ID')} mAh (Eff ${state.batteryLab.efficiencyPct}%)`;
  addLog(`🔒 <b>Profil Baterai Dikunci:</b> ${state.batteryLab.lockedVersionLabel}.`);
  saveGame(true); renderRightPanel();
}

function researchChargerStep() {
  if (state.batteryLab.chargerTierIdx >= CHARGER_TIERS.length - 1) {
    return addLog('⚡ Charger sudah mencapai batas maksimal 480 Watt!');
  }
  const cost = roundTo500(300000 + Math.random() * 200000); // Rp 300rb - 500rb per tahap
  if (state.personalBank < cost) return addLog(`❌ Butuh saldo Bank Pribadi ${fmtRp(cost)} untuk riset tahap charger!`);
  state.personalBank -= cost;

  state.batteryLab.chargerStepProgress += 1;
  const stepDone = state.batteryLab.nextStepName;
  state.batteryLab.nextStepName = CHARGER_RESEARCH_STEPS_NAMES[Math.floor(Math.random() * CHARGER_RESEARCH_STEPS_NAMES.length)];

  if (state.batteryLab.chargerStepProgress >= state.batteryLab.chargerStepTarget) {
    state.batteryLab.chargerTierIdx += 1;
    state.batteryLab.chargerStepProgress = 0;
    state.batteryLab.chargerStepTarget = Math.floor(10 + Math.random() * 21); // 10 - 30 tahap acak berikutnya!
    const newWatt = getCurrentChargerWatt();
    addLog(`⚡🎉 <b>RISET CHARGER SELESAI!</b> Kecepatan pengecasan meningkat menjadi <b>${newWatt} Watt</b>!`);
  } else {
    addLog(`🔌 Tahap riset charger selesai (${stepDone}) [-${fmtRp(cost)}] • Progres: ${state.batteryLab.chargerStepProgress}/${state.batteryLab.chargerStepTarget}.`);
  }
  saveGame(true); renderRightPanel();
}

// ==================== INTERAKSI ROMANTIS, SELINGKUH, TRAKTIR, MINTA UANG & KULIAH ====================
function performIntimateAction(actionType) {
  const target = state.player.affairPartner || state.player.partner;
  if (!target) return addLog('⚠️ Pilih pasangan atau selingkuhan dulu!');

  const isAffair = Boolean(state.player.affairPartner);
  const actions = {
    chat: { label: '💬 Ngobrol Romantis & Bercanda', rel: 8, hb: 5, energy: 3 },
    kiss: { label: '💋 Ciuman Mesra & Pelukan Hangat', rel: 12, hb: -15, energy: 5 },
    touch: { label: '🔥 Sentuhan Sensual & Foreplay', rel: 15, hb: -30, energy: 10 },
    oral: { label: '💦 Sesi Intim Mendalam (Oral/Foreplay)', rel: 18, hb: -45, energy: 15 },
    woohoo: { label: '❤️ Bercinta Penuh Gairah', rel: 22, hb: -70, energy: 20 }
  };
  const act = actions[actionType];
  if (!act) return;
  if (state.player.energy < act.energy) return addLog('😴 Energi terlalu lelah!');

  state.player.energy = Math.max(0, state.player.energy - act.energy);
  state.player.hbBar = Math.max(0, Math.min(100, state.player.hbBar + act.hb));
  state.player.mood = Math.min(100, state.player.mood + 15);

  if (isAffair) state.player.affairRelationship = Math.min(100, state.player.affairRelationship + act.rel);
  else state.player.relationship = Math.min(100, state.player.relationship + act.rel);

  addLog(`${act.label} bersama <b>${target.name}</b>${isAffair ? ' (Selingkuhan)' : ''} • HB Bar: ${state.player.hbBar}%.`);

  if (actionType === 'woohoo') {
    const protectedNow = state.player.kbActive || state.player.condomActive;
    if (state.player.condomActive) state.player.condomActive = false;
    if (!protectedNow && !state.player.pregnant && Math.random() < 0.45) {
      state.player.pregnant = true;
      state.player.pregnantWeeks = 1;
      state.player.babyFatherEthnicity = target.ethnicity;
      addLog(`🤰 <b>Kamu positif hamil!</b> Ayah biologisnya: <b>${target.name}</b> (${ETHNICITIES.find(e=>e.id===target.ethnicity)?.name}).`);
    }
  }
  saveGame(true); renderRightPanel(); updateHudOnly();
}

function usePrivateToy() {
  if (!state.player.hasPrivateToy) return;
  state.player.hbBar = Math.max(0, state.player.hbBar - 55);
  state.player.mood = Math.min(100, state.player.mood + 15);
  state.player.energy = Math.max(0, state.player.energy - 8);
  addLog(`🎁 Menggunakan alat bantu pribadi di kamar — HB Bar turun ke <b>${state.player.hbBar}%</b> & mood membaik.`);
  saveGame(true); renderRightPanel();
}

function treatPartner() {
  const target = state.player.affairPartner || state.player.partner;
  if (!target) return;
  const cost = 100000;
  if (state.handWallet < cost) return addLog('❌ Dompet Tunai kurang (butuh Rp 100.000 untuk mentraktir)!');
  state.handWallet -= cost;
  if (state.player.affairPartner) state.player.affairRelationship = Math.min(100, state.player.affairRelationship + 15);
  else state.player.relationship = Math.min(100, state.player.relationship + 15);
  addLog(`🍽️ Kamu mentraktir <b>${target.name}</b> makan malam romantis (-Rp 100.000 • Kemesraan +15%).`);
  saveGame(true); renderRightPanel(); updateHudOnly();
}

function askPartnerMoneyOrGift() {
  const target = state.player.affairPartner || state.player.partner;
  if (!target) return;
  const rel = state.player.affairPartner ? state.player.affairRelationship : state.player.relationship;
  if (rel < 40) return addLog(`💬 ${target.name}: "Kita baru dekat, tunggu kemesraan minimal 40% ya sayang."`);

  const giftAmt = roundTo500(target.generosity * (0.7 + Math.random() * 0.8));
  state.personalBank += giftAmt;
  addLog(`💝 <b>${target.name}</b> mentransfer uang jajan & hadiah sebesar <b>+${fmtRp(giftAmt)}</b> ke Bank Pribadimu!`);
  saveGame(true); renderRightPanel(); updateHudOnly();
}

function enrollCollege(majorId) {
  const maj = UNIVERSITY_MAJORS.find(m => m.id === majorId);
  if (!maj) return;
  if (state.personalBank < maj.uktPerSemester) return addLog(`❌ Saldo Bank Pribadi kurang untuk bayar UKT Semester 1 (${fmtRp(maj.uktPerSemester)})!`);
  state.personalBank -= maj.uktPerSemester;
  state.player.college = {
    enrolled: true, majorId: maj.id, majorName: maj.name,
    semester: 1, maxSemesters: maj.semesters, studyProgress: 0, gpa: 3.6, graduated: false, degreePrefix: maj.titlePrefix
  };
  addLog(`🎓 Resmi terdaftar kuliah di jurusan <b>${maj.name}</b> (UKT -${fmtRp(maj.uktPerSemester)})!`);
  saveGame(true); renderRightPanel(); updateHudOnly();
}

function attendCollegeClass() {
  const col = state.player.college;
  if (!col.enrolled || col.graduated) return;
  if (state.player.energy < 15) return addLog('😴 Energi lelah untuk kuliah! Istirahat/makan dulu.');
  state.player.energy -= 15;
  col.studyProgress += 25;
  addLog(`📚 Mengikuti perkuliahan & praktikum <b>${col.majorName}</b> (Progres Semester ${col.semester}: ${col.studyProgress}%).`);

  if (col.studyProgress >= 100) {
    if (col.semester >= col.maxSemesters) {
      col.graduated = true;
      if (col.degreePrefix && !state.player.name.startsWith(col.degreePrefix)) {
        state.player.name = col.degreePrefix + state.player.name;
      }
      addLog(`🎓🎉 <b>SELAMAT WISUDA!</b> Kamu resmi lulus <b>${col.majorName}</b> dan menyandang gelar <b>${state.player.name}</b>!`);
    } else {
      const maj = UNIVERSITY_MAJORS.find(m => m.id === col.majorId);
      if (state.personalBank >= maj.uktPerSemester) {
        state.personalBank -= maj.uktPerSemester;
        col.semester += 1;
        col.studyProgress = 0;
        addLog(`📑 Naik ke <b>Semester ${col.semester}</b> (Bayar UKT -${fmtRp(maj.uktPerSemester)}).`);
      } else {
        col.studyProgress = 100;
        addLog(`⚠️ Siapkan saldo Bank Pribadi ${fmtRp(maj.uktPerSemester)} untuk daftar ulang Semester ${col.semester + 1}.`);
      }
    }
  }
  saveGame(true); renderRightPanel(); updateHudOnly();
}

// ==================== KELOLA ROOM, HR, STORE, BANK, RESET SETTINGS ====================
function openRoomSetupModal(roomId) {
  const r = state.rooms.find(x => x.id === roomId);
  if (!r) return;
  showCustomModal(
    `🚪 Kelola & Isi Room #${r.id}`,
    `<div style="font-size:0.76rem;background:#090e1a;padding:8px;border-radius:8px;">
      Status: <b>${r.mode === 'empty' ? 'Room Kosong' : (r.mode === 'gaming' ? r.console.name + ' + ' + r.tv.name : (r.mode === 'couple' ? r.bed.name : r.entertainer.name))}</b><br>
      Tarif Aktif: <b>${fmtRp(roundTo500(r.rate * (1 - r.discountPct / 100)))}/jam</b>
    </div>
    ${r.mode === 'empty' ? `
      <div style="font-size:0.74rem;font-weight:700;color:var(--accent);">1. Isi Room Gaming:</div>
      <div class="grid-2">
        <select id="selRC">${state.inventoryConsoles.length===0?'<option value="">-- Gudang Konsol Kosong --</option>':state.inventoryConsoles.map(c=>`<option value="${c.uid}">${c.name}</option>`).join('')}</select>
        <select id="selRT">${state.inventoryTVs.length===0?'<option value="">-- Gudang TV Kosong --</option>':state.inventoryTVs.map(t=>`<option value="${t.uid}">${t.name}</option>`).join('')}</select>
      </div>
      <button class="primary" onclick="installGamingToRoom(${r.id})" ${(state.inventoryConsoles.length===0||state.inventoryTVs.length===0)?'disabled':''}>🎮 Pasang Konsol & TV</button>

      <div style="font-size:0.74rem;font-weight:700;color:var(--pink);">2. Isi Room Pasangan (Kasur per Jam):</div>
      <div class="grid-2">
        <select id="selRB">${state.inventoryBeds.length===0?'<option value="">-- Gudang Kasur Kosong --</option>':state.inventoryBeds.map(b=>`<option value="${b.uid}">${b.name}</option>`).join('')}</select>
        <button class="pink" onclick="installBedToRoom(${r.id})" ${state.inventoryBeds.length===0?'disabled':''}>🛋️ Pasang Kasur</button>
      </div>

      <div style="font-size:0.74rem;font-weight:700;color:var(--purple);">3. Tempatkan Pekerja Hiburan:</div>
      <div class="grid-2">
        <select id="selRE">${ENTERTAINERS_CATALOG.map(e=>`<option value="${e.id}">${e.name}</option>`).join('')}</select>
        <button class="purple" onclick="installEntertainerToRoom(${r.id})">🎤 Tempatkan</button>
      </div>
    ` : `
      <div class="grid-2">
        <button onclick="unmountRoomEquipment(${r.id}, 'store')">📦 Lepas ke Gudang</button>
        <button class="danger" onclick="unmountRoomEquipment(${r.id}, 'sell')">💰 Jual Perangkat (70%)</button>
      </div>
    `}
    <div class="grid-3">
      <button onclick="rSetDiscount(${r.id},0)">Normal</button>
      <button onclick="rSetDiscount(${r.id},50)">Disc 50%</button>
      <button class="success" onclick="rSetDiscount(${r.id},100)">🎁 GRATIS</button>
    </div>
    <div class="item-row"><span>🌀 Kipas Angin (Rp 250rb)</span><button ${r.hasFan?'disabled':''} onclick="buyRoomAddon(${r.id},'fan')">${r.hasFan?'✅ Ada':'Pasang'}</button></div>
    <div class="item-row"><span>❄️ AC Split (Rp 2,85Jt • +Rp 2rb/jam)</span><button ${r.hasAC?'disabled':''} onclick="buyRoomAddon(${r.id},'ac')">${r.hasAC?'✅ Ada':'Pasang AC'}</button></div>
    <div class="item-row"><span>📹 CCTV Room (Rp 450rb)</span><button ${r.hasCCTV?'disabled':''} onclick="buyRoomAddon(${r.id},'cctv')">${r.hasCCTV?'✅ Ada':'Pasang CCTV'}</button></div>`,
    `<button class="primary" onclick="closeCustomModal()">Tutup</button>`
  );
}

function installGamingToRoom(id) {
  const r = state.rooms.find(x => x.id === id);
  const cIdx = state.inventoryConsoles.findIndex(c => c.uid === document.getElementById('selRC')?.value);
  const tIdx = state.inventoryTVs.findIndex(t => t.uid === document.getElementById('selRT')?.value);
  if (!r || cIdx === -1 || tIdx === -1) return;
  const con = state.inventoryConsoles.splice(cIdx, 1)[0];
  const tv = state.inventoryTVs.splice(tIdx, 1)[0];
  r.mode = 'gaming'; r.console = con; r.tv = tv; r.rate = con.defaultRate + tv.bonusRate + (r.hasAC ? 2000 : 0);
  saveGame(true); openRoomSetupModal(id); renderRooms();
}
function installBedToRoom(id) {
  const r = state.rooms.find(x => x.id === id);
  const bIdx = state.inventoryBeds.findIndex(b => b.uid === document.getElementById('selRB')?.value);
  if (!r || bIdx === -1) return;
  const bed = state.inventoryBeds.splice(bIdx, 1)[0];
  r.mode = 'couple'; r.bed = bed; r.rate = bed.hourlyRate + (r.hasAC ? 15000 : 0);
  saveGame(true); openRoomSetupModal(id); renderRooms();
}
function installEntertainerToRoom(id) {
  const r = state.rooms.find(x => x.id === id);
  const ent = ENTERTAINERS_CATALOG.find(e => e.id === document.getElementById('selRE')?.value);
  if (!r || !ent) return;
  r.mode = 'entertainment'; r.entertainer = { ...ent }; r.rate = ent.hourlyRate;
  saveGame(true); openRoomSetupModal(id); renderRooms();
}
function unmountRoomEquipment(id, act) {
  const r = state.rooms.find(x => x.id === id);
  if (!r || r.customer) return addLog('⚠️ Tunggu tamu selesai!');
  if (r.mode === 'gaming') {
    if (act === 'store') { if (r.console) state.inventoryConsoles.push(r.console); if (r.tv) state.inventoryTVs.push(r.tv); }
    else state.laciCash += roundTo500(((r.console?.price || 0) + (r.tv?.price || 0)) * 0.7);
  } else if (r.mode === 'couple' && r.bed) {
    if (act === 'store') state.inventoryBeds.push(r.bed);
    else state.laciCash += roundTo500(r.bed.price * 0.7);
  }
  r.mode = 'empty'; r.console = null; r.tv = null; r.bed = null; r.entertainer = null; r.rate = 0;
  saveGame(true); openRoomSetupModal(id); renderRooms(); updateHudOnly();
}
function rSetDiscount(id, pct) { const r = state.rooms.find(x => x.id === id); if (r) { r.discountPct = pct; saveGame(true); openRoomSetupModal(id); renderRooms(); } }
function buyRoomAddon(id, t) {
  const r = state.rooms.find(x => x.id === id);
  const c = { fan: 250000, ac: 2850000, cctv: 450000 }[t];
  if (!r || state.laciCash < c) return addLog('❌ Uang di Laci Kasir kurang!');
  state.laciCash -= c;
  if (t === 'fan') r.hasFan = true;
  if (t === 'ac') { r.hasAC = true; r.rate += 2000; }
  if (t === 'cctv') r.hasCCTV = true;
  saveGame(true); openRoomSetupModal(id); renderRooms(); updateHudOnly();
}

function openUnitGamesModal(roomId) {
  state.selectedRoomForGames = roomId;
  document.getElementById('unitGamesModal').style.display = 'flex';
  const r = state.rooms.find(x => x.id === roomId);
  if (!r || !r.console) return;
  const con = r.console;
  let usedGB = 0;
  if (con.media === 'storage') con.games.forEach(gid => { const g = ALL_GAMES.find(x => x.id === gid); if (g) usedGB += g.sizeGB; });
  document.getElementById('unitGamesHeader').innerHTML = `<b>Room #${r.id} — ${con.name}</b> • ${con.media==='storage'?`Storage: <b>${usedGB}/${con.storageGB} GB</b>`:'CD Fisik'}`;
  const list = document.getElementById('unitGamesList');
  list.innerHTML = '';
  ALL_GAMES.filter(g => g.platform === con.platform && g.year <= state.year).forEach(g => {
    const owned = con.games.includes(g.id);
    const full = con.media === 'storage' && !owned && (usedGB + g.sizeGB > con.storageGB);
    list.innerHTML += `<div class="item-row"><div><b>${g.title}</b> ${g.sizeGB>0?`<span class="badge">${g.sizeGB}GB</span>`:''}<br><span style="color:#34d399;">${fmtRp(g.price)}</span></div>${owned?`<button class="danger" onclick="toggleUnitGame('${g.id}',false)">Hapus</button>`:`<button class="primary" ${full?'disabled':''} onclick="toggleUnitGame('${g.id}',true)">${full?'Penuh':'Beli'}</button>`}</div>`;
  });
}
function toggleUnitGame(gid, ins) {
  const r = state.rooms.find(x => x.id === state.selectedRoomForGames);
  const g = ALL_GAMES.find(x => x.id === gid);
  if (!r || !r.console || !g) return;
  if (ins) {
    if (state.laciCash < g.price) return addLog('❌ Uang di Laci Kasir kurang!');
    state.laciCash -= g.price; r.console.games.push(g.id);
  } else r.console.games = r.console.games.filter(x => x !== g.id);
  saveGame(true); openUnitGamesModal(r.id); renderRooms(); updateHudOnly();
}

function openHireEmployeeModal() {
  showCustomModal(
    '🧑‍💼 Rekrut Karyawan Baru',
    `<label style="font-size:0.73rem;color:var(--muted);">Nama Karyawan:</label><input type="text" id="empName" value="Siti Rahmawati" />
     <div class="grid-2">
       <div><label style="font-size:0.72rem;color:var(--muted);">Jam Masuk (0-23):</label><input type="number" id="empStart" value="8" min="0" max="23" /></div>
       <div><label style="font-size:0.72rem;color:var(--muted);">Durasi Kerja (1-12 Jam):</label><input type="number" id="empDur" value="8" min="1" max="12" /></div>
     </div>
     <div class="grid-2">
       <div><label style="font-size:0.72rem;color:var(--muted);">Gaji Pokok (Rp):</label><input type="number" id="empSalary" value="1500000" step="100000" /></div>
       <div><label style="font-size:0.72rem;color:var(--muted);">Tugas:</label><select id="empRole"><option value="all">Semua Tugas</option><option value="guard">Jaga Toko</option><option value="clean">Bersih-bersih</option><option value="tech">Teknisi Stik</option></select></div>
     </div>
     <label style="font-size:0.74rem;display:flex;align-items:center;gap:6px;"><input type="checkbox" id="empBpjs" checked style="width:auto;" /> Aktifkan BPJS (+Rp 150.000/bln)</label>`,
    `<button onclick="closeCustomModal()">Batal</button><button class="success" onclick="confirmHireEmployee()">Rekrut</button>`
  );
}
function confirmHireEmployee() {
  const name = document.getElementById('empName').value.trim() || 'Karyawan';
  const start = Math.max(0, Math.min(23, Number(document.getElementById('empStart').value)));
  const dur = Math.max(1, Math.min(12, Number(document.getElementById('empDur').value)));
  state.employees.push({ id: 'emp_' + Date.now(), name, shiftStart: start, shiftEnd: (start + dur) % 24, duration: dur, offDays: [0], salary: Math.max(500000, roundTo500(Number(document.getElementById('empSalary').value))), bonus: 0, bpjs: document.getElementById('empBpjs').checked, role: document.getElementById('empRole').value });
  closeCustomModal(); saveGame(true); renderRightPanel();
}
function toggleEmployeeOffDay(empId, dIdx) {
  const emp = state.employees.find(e => e.id === empId);
  if (!emp) return;
  if (emp.offDays.includes(dIdx)) emp.offDays = emp.offDays.filter(d => d !== dIdx);
  else emp.offDays.push(dIdx);
  saveGame(true); renderRightPanel();
}

// ==================== SETTINGS & RESET GAME ====================
function openSettingsResetModal() {
  showCustomModal(
    '⚙️ Pengaturan & Mulai Ulang Permainan (v1.0)',
    `<div style="font-size:0.78rem;color:var(--muted);line-height:1.45;">
      Ingin memulai permainan dari awal lagi? Ketik kata <b style="color:#f87171;">reset</b> di kolom bawah ini untuk mengaktifkan tombol Mulai Ulang:
    </div>
    <input type="text" id="inpConfirmReset" placeholder="Ketik: reset" oninput="document.getElementById('btnDoReset').disabled=(this.value.trim().toLowerCase()!=='reset')" />`,
    `<button onclick="closeCustomModal()">Batal</button>
     <button id="btnDoReset" class="danger" disabled onclick="executeFullReset()">🗑️ Mulai Ulang Game</button>`
  );
}

function executeFullReset() {
  localStorage.removeItem(STORAGE_KEY);
  addLog('🔄 Permainan di-reset ke awal!');
  openCharacterCreationModal();
}

// ==================== STORE, BANK, LUAR, HIDUP & RENDER ====================
function switchMainTab(tab, el) {
  state.mainTab = tab;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  renderRightPanel();
}
function switchSubTab(sub) { state.subTab = sub; renderRightPanel(); }

function buyStoreItem(cat, id) {
  if (cat === 'console' || cat === 'pc') {
    const list = cat === 'console' ? CONSOLE_CATALOG : PC_CATALOG;
    const it = list.find(x => x.id === id);
    if (!it || state.laciCash < it.price) return addLog('❌ Uang di Laci Kasir kurang! Tarik dana dari Bank Pribadi ke Laci dulu.');
    state.laciCash -= it.price;
    state.inventoryConsoles.push({ uid: 'c_' + Date.now() + Math.random(), ...it, games: [], stickHp: 100 });
    addLog(`📦 Membeli <b>${it.name}</b> masuk gudang.`);
  } else if (cat === 'tv') {
    const it = TV_CATALOG.find(x => x.id === id);
    if (!it || state.laciCash < it.price) return addLog('❌ Uang di Laci Kasir kurang!');
    state.laciCash -= it.price;
    state.inventoryTVs.push({ uid: 't_' + Date.now() + Math.random(), ...it });
    addLog(`📺 Membeli <b>${it.name}</b> masuk gudang.`);
  } else if (cat === 'bed') {
    const it = BED_PACKAGES.find(x => x.id === id);
    if (!it || state.laciCash < it.price) return addLog('❌ Uang di Laci Kasir kurang!');
    state.laciCash -= it.price;
    state.inventoryBeds.push({ uid: 'b_' + Date.now() + Math.random(), ...it });
    addLog(`🛋️ Membeli <b>${it.name}</b> masuk gudang.`);
  } else if (cat === 'retail') {
    const it = RETAIL_GOODS.find(x => x.id === id);
    if (!it || state.laciCash < it.buyPrice) return addLog('❌ Uang di Laci Kasir kurang!');
    state.laciCash -= it.buyPrice;
    state.retailStock[it.id] = (state.retailStock[it.id] || 0) + it.packCount;
    addLog(`🛒 Kulakan etalase: +${it.packCount} pcs <b>${it.name.split(' (')[0]}</b>.`);
  } else if (cat === 'kwh50') {
    if (state.laciCash < 72000) return addLog('❌ Uang di Laci Kasir kurang!');
    state.laciCash -= 72000; state.kwh += 50;
    addLog('⚡ Token PLN +50 kWh diisi.');
  } else if (cat === 'phone') {
    const ph = PHONE_CATALOG.find(x => x.id === id);
    if (!ph || state.personalBank < ph.price) return addLog('❌ Saldo Bank Pribadi kurang untuk beli HP ini!');
    state.personalBank -= ph.price;
    state.ownedPhones.push(ph);
    state.activePhone = ph;
    state.player.charm = Math.min(100, state.player.charm + ph.charmBonus);
    addLog(`📱 Membeli HP baru <b>${ph.name}</b> (+${ph.charmBonus} Pesona)!`);
  } else if (cat === 'vehicle') {
    const v = VEHICLES_CATALOG.find(x => x.id === id);
    if (!v || state.personalBank < v.price) return addLog('❌ Saldo Bank Pribadi kurang!');
    state.personalBank -= v.price;
    state.ownedVehicles.push({ uid: 'v_' + Date.now(), ...v, isRentedOut: false });
    addLog(`🛵 Membeli kendaraan pribadi <b>${v.name}</b>.`);
  }
  saveGame(true); renderRightPanel(); updateHudOnly();
}

function transferMoney(dir) {
  const amt = roundTo500(Math.max(0, Number(document.getElementById('tfAmt')?.value || 0)));
  if (amt <= 0 && dir !== 'qrisToLaci') return;

  if (dir === 'laciToBank') {
    if (state.laciCash < amt) return addLog('❌ Uang di Laci Kasir kurang!');
    state.laciCash -= amt; state.personalBank += amt;
    addLog(`🏦 Setor laba dari Laci ke Bank Pribadi: <b>+${fmtRp(amt)}</b>.`);
  } else if (dir === 'bankToLaci') {
    if (state.personalBank < amt) return addLog('❌ Saldo Bank Pribadi kurang!');
    state.personalBank -= amt; state.laciCash += amt;
    addLog(`💵 Pindah dana dari Bank Pribadi ke Laci Kasir: <b>+${fmtRp(amt)}</b>.`);
  } else if (dir === 'bankToHand') {
    if (state.personalBank < amt) return addLog('❌ Saldo Bank Pribadi kurang!');
    state.personalBank -= amt; state.handWallet += amt;
    addLog(`👛 Tarik tunai ke Dompet di Tangan: <b>+${fmtRp(amt)}</b>.`);
  } else if (dir === 'laciToPpob') {
    if (state.laciCash < amt) return addLog('❌ Uang di Laci Kasir kurang!');
    state.laciCash -= amt; state.businessPpobBalance += amt;
    addLog(`📲 Top Up Deposit PPOB dari Laci: <b>+${fmtRp(amt)}</b>.`);
  } else if (dir === 'qrisToLaci') {
    if (state.qrisBalance <= 0) return;
    const m = state.qrisBalance; state.qrisBalance = 0; state.laciCash += m;
    addLog(`📲 Cairkan Saldo QRIS <b>+${fmtRp(m)}</b> ke Laci Kasir.`);
  }
  saveGame(true); renderRightPanel(); updateHudOnly();
}

function updateHudOnly() {
  document.getElementById('rentalTitleDisplay').textContent = state.rentalName;
  const hh = String(state.hour).padStart(2, '0');
  const mm = String(state.minute).padStart(2, '0');
  const hol = HOLIDAYS_ID[`${state.day}-${state.month}`];
  document.getElementById('hudDateTime').textContent = `${DAY_NAMES[state.dayOfWeek]}, ${state.day}/${state.month}/${state.year} • ${hh}:${mm}${hol ? ' 🇮🇩' : ''}`;
  document.getElementById('hudHand').textContent = fmtRp(state.handWallet);
  document.getElementById('hudBank').textContent = fmtRp(state.personalBank);
  document.getElementById('hudLaci').textContent = fmtRp(state.laciCash);
  document.getElementById('hudPpob').textContent = fmtRp(state.businessPpobBalance);
  document.getElementById('hudKwh').textContent = state.plnBlackout ? '⚡ MATI LAMPU' : `${state.kwh.toFixed(1)} kWh`;

  document.getElementById('btnPause').classList.toggle('active', state.paused);
  document.querySelectorAll('.speed-btn[data-speed]').forEach(btn => {
    btn.classList.toggle('active', !state.paused && Number(btn.dataset.speed) === state.speed);
  });
  const shopBtn = document.getElementById('btnToggleShop');
  shopBtn.textContent = state.isOpen ? '🔴 TUTUP' : '🟢 BUKA';
  shopBtn.className = state.isOpen ? 'danger' : 'success';
}

function renderRooms() {
  const grid = document.getElementById('boothsGrid');
  grid.innerHTML = '';
  state.rooms.forEach(r => {
    const netRate = roundTo500(r.rate * (1 - r.discountPct / 100));
    const pct = r.totalTime ? Math.max(0, Math.round((r.timeLeft / r.totalTime) * 100)) : 0;
    let titleTag = r.mode === 'empty' ? 'Kosong' : (r.mode === 'gaming' ? `Gaming (${r.console.platform})` : (r.mode === 'couple' ? 'Room Pasangan 💑' : 'Room Hiburan 🎤'));
    const installedTitles = (r.mode === 'gaming' && r.console) ? r.console.games.map(gid => ALL_GAMES.find(x => x.id === gid)?.title || gid) : [];

    const div = document.createElement('div');
    div.className = 'booth' + (r.customer ? ' active' : '') + (r.cleaningTime > 0 ? ' broken' : '');
    div.innerHTML = `
      <div class="booth-top">
        <span>🚪 Room #${r.id} • ${titleTag}</span>
        <span class="badge ${r.cleaningTime>0?'warn':(r.customer?'busy':'ok')}">${r.cleaningTime>0?`Dibersihkan (${r.cleaningTime}m)`:(r.customer?'Terisi':'Siap')}</span>
      </div>
      <div class="spec-line">
        ${r.mode==='empty'?'<i>Klik tombol di bawah untuk isi room.</i>':''}
        ${r.mode==='gaming'?`🎮 <b>${r.console.name}</b><br>📺 ${r.tv.name}<br>💵 <b>${fmtRp(netRate)}/jam</b> • Stik: ${r.console.stickHp}%`:''}
        ${r.mode==='couple'?`🛋️ <b>${r.bed.name}</b><br>💵 <b>${fmtRp(netRate)}/jam</b>`:''}
        ${r.mode==='entertainment'?`🎤 <b>${r.entertainer.name}</b><br>💵 <b>${fmtRp(netRate)}/jam</b>`:''}
      </div>
      <div class="room-facilities">${r.hasAC?'<span class="fac-tag">❄️ AC</span>':(r.hasFan?'<span class="fac-tag">🌀 Kipas</span>':'')}${r.hasCCTV?'<span class="fac-tag">📹 CCTV</span>':''}</div>
      ${r.mode==='gaming'?`<div class="games-pill-wrap">${installedTitles.length===0?'<span style="font-size:0.66rem;color:#f87171;">⚠️ Belum ada game</span>':installedTitles.map(t=>`<span class="game-pill">${t}</span>`).join('')}</div>`:''}
      ${r.customer?`<div style="background:#090e1a;padding:5px;border-radius:7px;font-size:0.71rem;"><div>👤 <b>${r.customer.name}</b> (${r.customer.hours} jam) • Sisa ${r.timeLeft}m</div><div class="progress-bar" style="margin-top:3px;"><div class="progress-fill" style="width:${pct}%"></div></div></div>`:''}
      <div style="display:flex;gap:4px;margin-top:auto;">
        <button class="primary" style="flex:1;" onclick="openRoomSetupModal(${r.id})">⚙️ Isi / Atur</button>
        ${r.mode==='gaming'?`<button onclick="openUnitGamesModal(${r.id})">💿 Game (${installedTitles.length})</button>`:''}
      </div>
    `;
    grid.appendChild(div);
  });
}

function renderRightPanel() {
  const box = document.getElementById('rightPanelContent');
  const prevScroll = document.getElementById('mainScrollArea')?.scrollTop || 0;
  box.innerHTML = '';

  if (state.mainTab === 'toko') {
    box.innerHTML = `
      <div class="sub-tabs">
        <button class="sub-btn ${state.subTab==='konsol'?'active':''}" onclick="switchSubTab('konsol')">🎮 Konsol</button>
        <button class="sub-btn ${state.subTab==='pc'?'active':''}" onclick="switchSubTab('pc')">🖥️ PC</button>
        <button class="sub-btn ${state.subTab==='tv'?'active':''}" onclick="switchSubTab('tv')">📺 TV</button>
        <button class="sub-btn ${state.subTab==='kasur'?'active':''}" onclick="switchSubTab('kasur')">🛋️ Kasur</button>
        <button class="sub-btn ${state.subTab==='etalase'?'active':''}" onclick="switchSubTab('etalase')">🛒 Etalase</button>
        <button class="sub-btn ${state.subTab==='hp'?'active':''}" onclick="switchSubTab('hp')">📱 Toko HP</button>
        <button class="sub-btn ${state.subTab==='kendaraan'?'active':''}" onclick="switchSubTab('kendaraan')">🛵 Kendaraan</button>
      </div>
      <div class="scroll-area" id="mainScrollArea"></div>
    `;
    const sc = document.getElementById('mainScrollArea');
    if (state.subTab === 'konsol') {
      CONSOLE_CATALOG.filter(c => c.year <= state.year).forEach(c => { sc.innerHTML += `<div class="item-row"><div><b>${c.name}</b><br><span style="color:#34d399;">${fmtRp(c.price)} (Laci)</span></div><button class="primary" onclick="buyStoreItem('console','${c.id}')">Beli</button></div>`; });
    } else if (state.subTab === 'pc') {
      PC_CATALOG.filter(p => p.year <= state.year).forEach(p => { sc.innerHTML += `<div class="item-row"><div><b>${p.name}</b><br><span style="color:#34d399;">${fmtRp(p.price)} (Laci)</span></div><button class="primary" onclick="buyStoreItem('pc','${p.id}')">Beli</button></div>`; });
    } else if (state.subTab === 'tv') {
      TV_CATALOG.filter(t => t.year <= state.year).forEach(t => { sc.innerHTML += `<div class="item-row"><div><b>${t.name}</b><br><span style="color:#34d399;">${fmtRp(t.price)} (Laci)</span></div><button class="primary" onclick="buyStoreItem('tv','${t.id}')">Beli</button></div>`; });
    } else if (state.subTab === 'kasur') {
      BED_PACKAGES.forEach(b => { sc.innerHTML += `<div class="item-row"><div><b>${b.name}</b><br><span style="color:#34d399;">${fmtRp(b.price)} (Laci)</span></div><button class="pink" onclick="buyStoreItem('bed','${b.id}')">Beli</button></div>`; });
    } else if (state.subTab === 'etalase') {
      sc.innerHTML += `<div class="item-row"><div><b>⚡ Token PLN 50 kWh</b><br><span style="color:#34d399;">Rp 72.000</span></div><button class="primary" onclick="buyStoreItem('kwh50')">Beli</button></div>`;
      RETAIL_GOODS.forEach(g => { sc.innerHTML += `<div class="item-row"><div><b>${g.name}</b> (Stok: ${state.retailStock[g.id]||0})<br><span style="color:#34d399;">Kulakan: ${fmtRp(g.buyPrice)}</span></div><button class="success" onclick="buyStoreItem('retail','${g.id}')">Kulakan</button></div>`; });
    } else if (state.subTab === 'hp') {
      PHONE_CATALOG.filter(ph => ph.year <= state.year).forEach(ph => {
        const owned = state.ownedPhones.some(x => x.id === ph.id);
        sc.innerHTML += `<div class="item-row"><div><b>${ph.name}</b> <span class="badge">${ph.brand} • ${ph.year}</span><br><span style="color:#60a5fa;">${fmtRp(ph.price)} (Bank Pribadi)</span></div><button class="primary" ${owned?'disabled':''} onclick="buyStoreItem('phone','${ph.id}')">${owned?'✅ Dimiliki':'Beli HP'}</button></div>`;
      });
    } else if (state.subTab === 'kendaraan') {
      VEHICLES_CATALOG.forEach(v => { sc.innerHTML += `<div class="item-row"><div><b>${v.name}</b><br><span style="color:#60a5fa;">${fmtRp(v.price)} (Bank Pribadi)</span></div><button class="primary" onclick="buyStoreItem('vehicle','${v.id}')">Beli</button></div>`; });
    }
    sc.scrollTop = prevScroll;

  } else if (state.mainTab === 'lab') {
    const lab = state.batteryLab;
    const maxWh = getMaxBatteryWh();
    const pct = Math.min(100, Math.round((lab.currentWh / maxWh) * 100));
    const cWatt = getCurrentChargerWatt();
    const hoursLeft = getHoursToFullCharge();
    const loadW = calculateTotalLoadWatt();

    box.innerHTML = `
      <div class="item-row" style="flex-direction:column;align-items:stretch;gap:6px;">
        <div style="display:flex;justify-content:space-between;">
          <b>🔋 Lab R&D Baterai Backup Modifikasi</b>
          <span class="badge ${state.plnBlackout?'warn':'ok'}">${state.plnBlackout?'⚡ BACKUP AKTIF':'🔌 CHARGING'}</span>
        </div>
        <div style="font-size:0.73rem;color:var(--muted);line-height:1.45;">
          Kapasitas Rakitan: <b style="color:#34d399;">${lab.capacityMah.toLocaleString('id-ID')} mAh</b> (${maxWh.toFixed(1)} Wh)<br>
          Daya Tersimpan: <b>${pct}% (${lab.currentWh.toFixed(1)} Wh)</b> • Beban Saat Ini: <b>${loadW} W</b><br>
          Efisiensi Inverter: <b style="color:#fbbf24;">${lab.efficiencyPct}%</b> (${lab.isLocked?'🔒 Terkunci':'🔓 Belum Dikunci'})<br>
          Charger Aktif: <b style="color:#60a5fa;">${cWatt} Watt</b> • Estimasi Penuh: <b>${hoursLeft <= 0.01 ? 'Penuh (100%)' : hoursLeft.toFixed(1) + ' jam'}</b>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <button class="primary" onclick="upgradeBatteryCapacity()">➕ Gabung Modul Sel Baterai (Naikkan mAh)</button>
        <div class="grid-2">
          <button class="purple" ${lab.isLocked?'disabled':''} onclick="researchBatteryEfficiency()">🧪 Riset Efisiensi (Rp 300-500rb)</button>
          <button class="success" ${lab.isLocked?'disabled':''} onclick="lockBatteryVersion()">🔒 Kunci Versi Baterai</button>
        </div>
      </div>

      <div class="item-row" style="flex-direction:column;align-items:stretch;gap:6px;">
        <b>⚡ Riset Kecepatan Charger (5W ➔ 480W Max)</b>
        <div style="font-size:0.73rem;color:var(--muted);">
          Tier Saat Ini: <b>${cWatt}W</b> ${lab.chargerTierIdx < CHARGER_TIERS.length-1 ? `➔ Target Berikutnya: <b>${CHARGER_TIERS[lab.chargerTierIdx+1]}W</b>` : '(MAX)'}<br>
          Progres Tahapan: <b>${lab.chargerStepProgress} / ${lab.chargerStepTarget} tahap</b><br>
          Tahap Berikutnya: <i>${lab.nextStepName}</i>
        </div>
        <button class="primary" ${lab.chargerTierIdx >= CHARGER_TIERS.length-1 ? 'disabled' : ''} onclick="researchChargerStep()">
          🔬 Kerjakan 1 Tahap Riset Charger (Rp 300–500rb)
        </button>
      </div>
    `;

  } else if (state.mainTab === 'hr') {
    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:0.75rem;color:var(--muted);">Karyawan Aktif: <b>${state.employees.length}</b></span>
        <button class="success" onclick="openHireEmployeeModal()">➕ Rekrut Karyawan</button>
      </div>
      <div class="scroll-area" id="mainScrollArea">
        ${state.employees.map(emp => `
          <div class="item-row" style="flex-direction:column;align-items:stretch;gap:5px;">
            <div style="display:flex;justify-content:space-between;"><b>🧑‍💼 ${emp.name}</b><button class="danger" onclick="state.employees=state.employees.filter(x=>x.id!=='${emp.id}');saveGame(true);renderRightPanel();">Pecat</button></div>
            <div style="font-size:0.71rem;color:var(--muted);">Shift: ${String(emp.shiftStart).padStart(2,'0')}:00–${String(emp.shiftEnd).padStart(2,'0')}:00 (${emp.duration}j) • Gaji: ${fmtRp(emp.salary)} • BPJS: ${emp.bpjs?'Ya':'Tidak'}</div>
            <div style="display:flex;gap:3px;flex-wrap:wrap;">${DAY_NAMES.map((dn, idx) => `<span class="day-chip ${emp.offDays.includes(idx)?'off':''}" onclick="toggleEmployeeOffDay('${emp.id}', ${idx})">${dn.slice(0,3)}</span>`).join('')}</div>
          </div>
        `).join('')}
      </div>
    `;

  } else if (state.mainTab === 'bank') {
    box.innerHTML = `
      <div class="item-row" style="flex-direction:column;align-items:stretch;gap:6px;">
        <div style="display:flex;justify-content:space-between;"><span>👛 Dompet Tunai (di Tangan):</span><b style="color:#34d399;">${fmtRp(state.handWallet)}</b></div>
        <div style="display:flex;justify-content:space-between;"><span>🏦 Bank Pribadi (M-Banking):</span><b style="color:#60a5fa;">${fmtRp(state.personalBank)}</b></div>
        <div style="display:flex;justify-content:space-between;"><span>🗄️ Laci Kasir Usaha:</span><b style="color:#fbbf24;">${fmtRp(state.laciCash)}</b></div>
        <div style="display:flex;justify-content:space-between;"><span>📲 Deposit PPOB / QRIS:</span><b style="color:#c084fc;">${fmtRp(state.businessPpobBalance)} / ${fmtRp(state.qrisBalance)}</b></div>
        <input type="number" id="tfAmt" value="500000" step="50000" />
        <div class="grid-2">
          <button class="success" onclick="transferMoney('laciToBank')">Laci ➡️ Bank Pribadi</button>
          <button class="primary" onclick="transferMoney('bankToLaci')">Bank Pribadi ➡️ Laci</button>
          <button onclick="transferMoney('bankToHand')">Bank ➡️ Dompet Tangan</button>
          <button class="purple" onclick="transferMoney('laciToPpob')">Laci ➡️ Deposit PPOB</button>
        </div>
        <button onclick="transferMoney('qrisToLaci')">📲 Cairkan QRIS ke Laci Kasir</button>
      </div>
      <div style="font-weight:700;font-size:0.74rem;color:var(--accent);">📒 Buku Hutang / Kasbon (Wajib Bayar + Bunga 20%):</div>
      <div class="scroll-area" style="max-height:110px;">
        ${state.debts.length===0?'<div style="font-size:0.72rem;color:#64748b;">Tidak ada kasbon aktif.</div>':state.debts.map(d=>`<div class="item-row"><span>${d.debtorName}</span><b style="color:#fbbf24;">${fmtRp(d.totalDue)}</b></div>`).join('')}
      </div>
    `;

  } else if (state.mainTab === 'kuliah') {
    const col = state.player.college;
    box.innerHTML = `
      <div class="item-row" style="flex-direction:column;align-items:stretch;gap:6px;">
        <b>🎓 Pendidikan & Kuliah (${state.player.name})</b>
        ${!col.enrolled ? `
          <div style="font-size:0.74rem;color:var(--muted);">Pilih jurusan kuliah (termasuk Pendidikan Dokter):</div>
          ${UNIVERSITY_MAJORS.map(m => `
            <div class="item-row">
              <div><b>${m.name}</b><br><span style="color:#60a5fa;">UKT: ${fmtRp(m.uktPerSemester)}/sem</span></div>
              <button class="primary" onclick="enrollCollege('${m.id}')">Daftar</button>
            </div>
          `).join('')}
        ` : `
          <div style="font-size:0.75rem;color:var(--muted);">
            Jurusan: <b>${col.majorName}</b><br>
            Status: <b>${col.graduated ? '🎓 LULUS WISUDA' : `Semester ${col.semester} / ${col.maxSemesters} (${col.studyProgress}%)`}</b>
          </div>
          ${!col.graduated ? `<button class="success" onclick="attendCollegeClass()">📚 Masuk Kelas & Praktikum (+25% Progres)</button>` : ''}
        `}
      </div>
    `;

  } else if (state.mainTab === 'luar') {
    box.innerHTML = `
      <div style="font-size:0.74rem;color:var(--muted);">Lokasi: <b>${state.player.location}</b> • Dompet Tunai: <b>${fmtRp(state.handWallet)}</b></div>
      <button class="success" onclick="state.player.location='Di Rental';saveGame(true);renderRightPanel();">🏠 Kembali ke Rental</button>
      <div class="scroll-area" id="mainScrollArea">
        ${OUTSIDE_ACTIVITIES.map(a => `
          <div class="item-row">
            <div><b>${a.name}</b><br><span style="color:var(--muted);">${a.desc}</span><br><b style="color:#34d399;">${fmtRp(a.cost)}</b></div>
            <button class="primary" onclick="if(state.handWallet>=${a.cost}){state.handWallet-=${a.cost};state.player.energy=Math.min(100,state.player.energy+${a.energyGain});state.player.hunger=Math.min(100,state.player.hunger+${a.hungerGain});state.player.charm=Math.min(100,state.player.charm+${a.charmGain});if('${a.id}'==='act_toy')state.player.hasPrivateToy=true;state.player.location='Di Luar';addLog('🛵 ${a.name} (-${fmtRp(a.cost)}).');saveGame(true);renderRightPanel();updateHudOnly();}else{addLog('❌ Dompet Tunai kurang!');}">Pergi</button>
          </div>
        `).join('')}
      </div>
    `;

  } else if (state.mainTab === 'life') {
    const pl = state.player;
    const ethObj = ETHNICITIES.find(e => e.id === pl.ethnicity);
    const pTimes = pl.religion === 'Islam' ? getDynamicPrayerTimes(state.month, state.day) : null;

    box.innerHTML = `
      <div class="item-row" style="flex-direction:column;align-items:stretch;gap:6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <b>👩🏻 ${pl.name} (${pl.age} Thn)</b>
          <span class="badge" style="color:#f472b6;">${pl.religion} • ${ethObj ? ethObj.name.split(' ')[0] : pl.ethnicity}</span>
        </div>
        <div class="sims-stats">
          <div class="sim-bar-wrap"><span>⚡ Energi: <b>${pl.energy}%</b></span><div class="progress-bar"><div class="progress-fill" style="width:${pl.energy}%"></div></div></div>
          <div class="sim-bar-wrap"><span>🍛 Kenyang: <b>${pl.hunger}%</b></span><div class="progress-bar"><div class="progress-fill" style="width:${pl.hunger}%;background:#3b82f6;"></div></div></div>
          <div class="sim-bar-wrap"><span>🚿 Kebersihan: <b>${pl.hygiene}%</b></span><div class="progress-bar"><div class="progress-fill" style="width:${pl.hygiene}%;background:#06b6d4;"></div></div></div>
          <div class="sim-bar-wrap"><span>🔥 HB Bar: <b>${pl.hbBar}%</b></span><div class="progress-bar"><div class="progress-fill" style="width:${pl.hbBar}%;background:#ec4899;"></div></div></div>
        </div>

        ${pTimes ? `
          <div style="background:#090e1a;padding:6px;border-radius:7px;font-size:0.69rem;color:#93c5fd;">
            🕌 <b>Jadwal Sholat Dinamis (${state.day}/${state.month}):</b> Subuh ${pTimes.subuh} • Dzuhur ${pTimes.dzuhur} • Ashar ${pTimes.ashar} • Maghrib ${pTimes.maghrib} • Isya ${pTimes.isya}
            <button style="margin-top:4px;width:100%;" onclick="state.player.mood=Math.min(100,state.player.mood+10);addLog('🤲 Kamu menunaikan ibadah sholat dengan khusyuk (+Mood).');saveGame(true);">🕌 Tunaikan Sholat</button>
          </div>
        ` : ''}

        <div class="grid-2">
          <button class="${pl.kbActive?'success':''}" onclick="state.player.kbActive=!state.player.kbActive;saveGame(true);renderRightPanel();">${pl.kbActive?'💊 Pil KB: AKTIF':'💊 Aktifkan Pil KB'}</button>
          <button class="${pl.condomActive?'success':''}" onclick="state.player.condomActive=!state.player.condomActive;saveGame(true);renderRightPanel();">${pl.condomActive?'🛡️ Kondom: SIAP':'🛡️ Pakai Kondom'}</button>
          <button onclick="state.player.hygiene=100;addLog('🚿 Mandi bersih & wangi!');saveGame(true);renderRightPanel();">🚿 Mandi Bersih</button>
          <button onclick="state.player.energy=100;state.hour=8;state.minute=0;onNewDay();saveGame(true);renderAll(true);">🛏️ Tidur Besok</button>
        </div>
        ${pl.hasPrivateToy ? `<button class="pink" onclick="usePrivateToy()">🎁 Gunakan Alat Bantu Pribadi (-HB Bar)</button>` : ''}
        ${pl.pregnant ? `<div style="font-size:0.74rem;color:#f472b6;">🤰 Sedang Hamil (${pl.pregnantWeeks}/36 minggu)</div>` : ''}
        ${pl.childrenList.length > 0 ? `<div style="font-size:0.71rem;color:#34d399;">👶 Anak: ${pl.childrenList.map(c=>`${c.name} (${c.appearance})`).join('; ')}</div>` : ''}
      </div>

      <div class="scroll-area" style="max-height:250px;">
        ${!pl.partner ? `
          <div style="font-size:0.73rem;font-weight:700;color:var(--accent);">Pilih Pasangan / Gebetan (Pesona kamu: ${pl.charm}):</div>
          ${PARTNERS_LIST.map(pt => `
            <div class="item-row">
              <div>
                <b>${pt.name}</b> (${pt.age} Thn) <span class="badge ${pt.maritalStatus==='Suami Orang'?'warn':'ok'}">${pt.maritalStatus}</span><br>
                <span style="color:var(--muted);">${ETHNICITIES.find(e=>e.id===pt.ethnicity)?.name} • ${pt.job} (Pesona ${pt.charmReq})</span>
              </div>
              <button class="pink" onclick="if(state.player.charm>=${pt.charmReq}){if('${pt.maritalStatus}'==='Suami Orang'){state.player.affairPartner=${JSON.stringify(pt).replace(/"/g,'&quot;')};state.player.affairRelationship=35;addLog('🔥 Menjalin hubungan rahasia dengan ${pt.name} (Suami Orang)!');}else{state.player.partner=${JSON.stringify(pt).replace(/"/g,'&quot;')};state.player.status='Pacaran';state.player.relationship=35;addLog('💕 Resmi pacaran dengan ${pt.name}!');}saveGame(true);renderRightPanel();}else{addLog('💔 Pesona kurang!');}">Dekati</button>
            </div>
          `).join('')}
        ` : `
          <div class="item-row" style="flex-direction:column;align-items:stretch;gap:6px;">
            <div><b>💑 Pasangan Utama: ${pl.partner.name}</b> (${pl.partner.age} Thn • ${pl.partner.maritalStatus}) • Kemesraan: <b>${pl.relationship}%</b></div>
            ${pl.affairPartner ? `<div style="color:#f472b6;font-size:0.73rem;">🔥 Selingkuhan: <b>${pl.affairPartner.name}</b> (${pl.affairPartner.age} Thn) • Kemesraan: <b>${pl.affairRelationship}%</b></div>` : ''}
            <div class="grid-2">
              <button onclick="treatPartner()">🍽️ Traktir Pasangan</button>
              <button class="success" onclick="askPartnerMoneyOrGift()">💝 Minta Hadiah / Uang</button>
            </div>
            <div style="font-size:0.72rem;font-weight:700;color:#f472b6;">Aksi Romantis & Intim:</div>
            <div class="grid-3">
              <button onclick="performIntimateAction('chat')">💬 Ngobrol</button>
              <button onclick="performIntimateAction('kiss')">💋 Ciuman</button>
              <button onclick="performIntimateAction('touch')">🔥 Sentuhan</button>
              <button class="pink" onclick="performIntimateAction('oral')">💦 Foreplay</button>
              <button class="pink" onclick="performIntimateAction('woohoo')">❤️ Bercinta</button>
              <button class="danger" onclick="state.player.partner=null;state.player.affairPartner=null;state.player.status='Lajang';saveGame(true);renderRightPanel();">💔 Putus</button>
            </div>
          </div>
          ${!pl.affairPartner ? `
            <div style="font-size:0.72rem;font-weight:700;color:#fbbf24;margin-top:4px;">🔥 Opsi Selingkuh (Dengan Suami Orang / Pria Lain):</div>
            ${PARTNERS_LIST.filter(x => x.id !== pl.partner.id).map(sp => `
              <div class="item-row">
                <div><b>${sp.name}</b> (${sp.age} Thn • ${sp.maritalStatus})</div>
                <button class="purple" onclick="state.player.affairPartner=${JSON.stringify(sp).replace(/"/g,'&quot;')};state.player.affairRelationship=30;addLog('🤫 Kamu mulai selingkuh diam-diam dengan ${sp.name}!');saveGame(true);renderRightPanel();">Selingkuh</button>
              </div>
            `).join('')}
          ` : ''}
        `}
      </div>
    `;
  }
}

// ==================== CLOUD SYNC & BOOTSTRAP ====================
async function saveGame(forceCloud = false) {
  try {
    state.lastSavedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (navigator.onLine && CloudSync.init()) {
      await CloudSync.pushToCloud(state, forceCloud);
    }
  } catch (e) {}
}

async function syncPullNow() {
  const res = await CloudSync.pullFromCloud();
  if (!res.ok) return addLog('⚠️ Data cloud belum ada atau offline.');
  Object.assign(state, res.state);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  addLog(`✅ Progres v1.0 dimuat dari Firestore (${CloudSync.syncId})!`);
  closeCustomModal(); renderAll(true);
}

function openCloudSyncModal() {
  showCustomModal(
    '☁️ Sinkronisasi Firestore (Laptop ↔ HP)',
    `<label style="font-size:0.75rem;color:var(--muted);">Sync ID:</label>
     <div style="display:flex;gap:6px;"><input type="text" id="inpSyncId" value="${CloudSync.syncId}" /><button class="primary" onclick="if(CloudSync.setSyncId(document.getElementById('inpSyncId').value)){openCloudSyncModal();}">Set ID</button></div>
     <div class="grid-2"><button class="success" onclick="saveGame(true);addLog('☁️ Tersimpan!');closeCustomModal();">⬆️ Simpan ke Cloud</button><button class="purple" onclick="syncPullNow()">⬇️ Muat dari Cloud</button></div>`,
    `<button onclick="closeCustomModal()">Tutup</button>`
  );
}

function loadGameLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    Object.assign(state, JSON.parse(raw));
    return true;
  } catch (e) { return false; }
}

function renderAll(includeRight = true) {
  updateHudOnly();
  renderRooms();
  if (includeRight) renderRightPanel();
}

(async function bootstrap() {
  CloudSync.init();
  const had = loadGameLocal();
  if (!had) {
    initEmptyStarterRooms();
    openCharacterCreationModal();
  } else {
    closeCustomModal();
    addLog(`💾 Progres <b>${state.player.name}</b> dimuat (v1.0).`);
  }
  renderAll(true);
  if (navigator.onLine && CloudSync.init()) {
    const cr = await CloudSync.pullFromCloud();
    if (cr.ok && cr.state && (cr.updatedAt > (state.lastSavedAt || 0) + 5000)) {
      Object.assign(state, cr.state);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      renderAll(true);
    }
  }
})();
