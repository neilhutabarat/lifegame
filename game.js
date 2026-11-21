// RENTAL SIMULATOR BY ONEILVERSE - V5.0 FULL REALISTIS & HR ENGINE

const STORAGE_KEY = 'oneilverse_rental_sim_v5';

const state = {
  gameMode: 'dev',
  rentalName: 'Rental Room Oneilverse',
  vip2x: false,
  paused: false,
  speed: 1, // 1x (1 hari = 24 mnt), 2x, 4x

  // Kalender Indonesia mulai Rabu, 1 Januari 2020, 08:00
  year: 2020,
  month: 1,
  day: 1,
  dayOfWeek: 3, // 0=Minggu, 1=Senin, 2=Selasa, 3=Rabu, 4=Kamis, 5=Jumat, 6=Sabtu
  totalDays: 1,
  hour: 8,
  minute: 0,
  isOpen: false,

  // Pemisahan Keuangan Ketat:
  // 1. walletMCash = Uang Pribadi (bisa diambil dari kas kasir rental tiap hari)
  // 2. drawerCash = Kas Tunai di Laci Rental (pecahan minimal Rp 500)
  // 3. businessPpobBalance = Deposit Saldo Bisnis (Pulsa/E-Wallet/Token)
  // 4. qrisBalance = Saldo Merchant QRIS (masuk ke M-Cash jika ditautkan/dicairkan)
  walletMCash: 50000000,
  drawerCash: 2000000,
  businessPpobBalance: 2000000,
  qrisBalance: 0,
  qrisLinkedToMCash: false,

  // Listrik kWh & Kios
  kwh: 60.0,
  kiosLevel: 1,
  kiosOwned: false,

  // Stok Grosir Etalase Kasir (Dijual ke pengunjung) & Sparepart
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

  // HR Karyawan Tanpa Batas (Jadwal Masuk, Jam Kerja 1-12 jam, Hari Libur, Gaji, Bonus, BPJS, Tugas)
  employees: [],

  // Buku Hutang / Kasbon Berbunga 20%
  debts: [],

  // Wi-Fi & Hotspot
  wifi: {
    provider: null,
    hotspotOpen: false,
    voucherPrice: 3000,
    voucherHours: 3,
    activeUsers: 0
  },

  // Inventaris Barang & Kendaraan Pribadi
  inventoryConsoles: [],
  inventoryTVs: [],
  inventoryBeds: [],
  ownedVehicles: [], // { uid, id, name, price, rentDaily, isRentedOut }

  // 5 Room Kosong Awal (Bebas diisi PS/PC, Kasur Pasangan, atau Pekerja Hiburan)
  rooms: [],
  loyalCustomers: [],
  recommendedGames: [],
  selectedRoomForGames: null,

  // Karakter Utama (Cewek 18 Tahun)
  player: {
    age: 18,
    gender: 'Perempuan',
    energy: 100,
    charm: 30,
    reputation: 4.5,
    location: 'Di Rental',
    status: 'Lajang',
    partner: null,
    relationship: 0,
    kbActive: false,
    condomActive: false,
    pregnant: false,
    pregnantWeeks: 0,
    children: 0,
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
  if (box.children.length > 60) box.removeChild(box.lastChild);
}

// ==================== INISIALISASI 5 ROOM KOSONG MURNI ====================
function initEmptyStarterRooms() {
  state.rooms = [];
  for (let i = 1; i <= 5; i++) {
    state.rooms.push({
      id: i,
      mode: 'empty', // 'empty' | 'gaming' | 'couple' | 'entertainment'
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

function applyGameMode(mode) {
  state.gameMode = mode;
  state.year = 2020; state.month = 1; state.day = 1; state.dayOfWeek = 3; state.totalDays = 1;
  state.hour = 8; state.minute = 0;
  state.isOpen = false;
  state.kiosLevel = 1; state.kiosOwned = false;
  state.inventoryConsoles = []; state.inventoryTVs = []; state.inventoryBeds = []; state.ownedVehicles = [];
  state.employees = []; state.debts = [];
  initEmptyStarterRooms();

  if (mode === 'dev') {
    state.walletMCash = 96000000;
    state.drawerCash = 2000000;
    state.businessPpobBalance = 2000000;
    addLog('🛠️ <b>Mode Developer Aktif</b> (Total Modal Rp 100 Juta • 5 Room Kosong Siap Diisi).');
  } else {
    state.walletMCash = 28000000;
    state.drawerCash = 1000000;
    state.businessPpobBalance = 1000000;
    addLog('🚀 <b>Mode Rilis Pemain Aktif</b> (Total Modal Rp 30 Juta • 5 Room Kosong Siap Diisi).');
  }
  closeCustomModal();
  saveGame(true);
  renderAll(true);
}

// ==================== CUSTOM IN-GAME MODAL (NOL BROWSER POPUP!) ====================
function showCustomModal(title, bodyHtml, footerHtml) {
  document.getElementById('customModalTitle').innerHTML = title;
  document.getElementById('customModalBody').innerHTML = bodyHtml;
  document.getElementById('customModalFooter').innerHTML = footerHtml || '';
  document.getElementById('customModalBackdrop').style.display = 'flex';
}

function closeCustomModal() {
  document.getElementById('customModalBackdrop').style.display = 'none';
}

function openModeSelectModal() {
  showCustomModal(
    '⚙️ Pilih Mode Awal Permainan (Start 1 Jan 2020)',
    `<div style="font-size:0.8rem;color:var(--muted);line-height:1.5;">
      Mulai dengan <b>5 Room Kosong</b> tanpa perangkat terpasang:<br>
      • <b>Mode Developer (Rp 100 Juta):</b> Pengujian bebas oleh developer.<br>
      • <b>Mode Rilis Pemain (Rp 30 Juta):</b> Modal resmi rilis untuk beli konsol/PC, TV, kasur & stok.
    </div>`,
    `<button class="purple" onclick="applyGameMode('dev')">🛠️ Developer (100 Jt)</button>
     <button class="success" onclick="applyGameMode('release')">🎮 Rilis (30 Jt)</button>`
  );
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
  addLog(state.isOpen ? `🟢 <b>${state.rentalName}</b> dibuka manual.` : '🔴 Rental ditutup manual.');
  saveGame(true); updateHudOnly();
}

// ==================== ENGINE WAKTU OTOMATIS (1 HARI = 24 MENIT DI 1x) ====================
setInterval(() => {
  if (state.paused) return;
  for (let i = 0; i < state.speed; i++) {
    tickOneInGameMinute();
  }
  updateHudOnly();
  renderRooms();
}, 1000);

setInterval(() => { saveGame(false); }, 10000);

function getActiveEmployeesNow() {
  return state.employees.filter(emp => {
    if (emp.offDays.includes(state.dayOfWeek)) return false;
    if (emp.shiftStart <= emp.shiftEnd) {
      return state.hour >= emp.shiftStart && state.hour < emp.shiftEnd;
    } else {
      // Shift malam melewati tengah malam (misal 20:00 - 06:00)
      return state.hour >= emp.shiftStart || state.hour < emp.shiftEnd;
    }
  });
}

function tickOneInGameMinute() {
  // Waktu TERUS BERJALAN otomatis tanpa perlu klik buka!
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

  // Jika ada karyawan yang sedang shift -> rental otomatis buka pada jam kerjanya!
  const activeEmps = getActiveEmployeesNow();
  if (state.employees.length > 0) {
    const shouldBeOpen = activeEmps.length > 0;
    if (shouldBeOpen && !state.isOpen) {
      state.isOpen = true;
      addLog(`🧑‍💼 Karyawan <b>${activeEmps[0].name}</b> masuk shift dan membuka <b>${state.rentalName}</b>.`);
    } else if (!shouldBeOpen && state.isOpen && state.player.location !== 'Di Rental') {
      state.isOpen = false;
      addLog('🔒 Jam shift karyawan selesai, rental tutup otomatis.');
    }
  }

  // Pengeluaran Hidup Harian Dinamis (Makan, Minum, Bensin) dari Dompet Pribadi (MCash)
  if (state.minute === 0 && (state.hour === 8 || state.hour === 13 || state.hour === 19)) {
    const dailyMeals = [
      { label: 'Sarapan Nasi Uduk & Teh Hangat', min: 12000, max: 18000 },
      { label: 'Makan Siang Ayam Geprek + Es Jeruk', min: 18000, max: 28000 },
      { label: 'Makan Malam Nasi Goreng + Bensin Motor', min: 25000, max: 40000 }
    ];
    const meal = state.hour === 8 ? dailyMeals[0] : (state.hour === 13 ? dailyMeals[1] : dailyMeals[2]);
    const cost = roundTo500(meal.min + Math.random() * (meal.max - meal.min));
    if (state.walletMCash >= cost) {
      state.walletMCash -= cost;
      addLog(`🍽️ Pengeluaran pribadi (${meal.label}): <b>-${fmtRp(cost)}</b> dari Dompet MCash.`);
    }
  }

  // Hitung konsumsi listrik kWh
  let totalWatt = state.wifi.provider ? 25 : 0;
  state.rooms.forEach(r => {
    if (r.hasCCTV) totalWatt += 12;
    if (r.customer) {
      if (r.console) totalWatt += r.console.watt;
      if (r.tv) totalWatt += r.tv.watt;
      if (r.bed) totalWatt += r.bed.watt;
      if (r.hasAC) totalWatt += 350;
      else if (r.hasFan) totalWatt += 45;
    }
  });
  if (totalWatt > 0) {
    state.kwh = Math.max(0, +(state.kwh - (totalWatt / 1000) / 60).toFixed(4));
    if (state.kwh <= 0) {
      addLog('⚡ <b>TOKEN PLN HABIS (0 kWh)!</b> Semua room padam!');
      state.rooms.forEach(r => { if (r.customer) { r.customer = null; r.timeLeft = 0; } });
    }
  }

  // Update Sesi Setiap Room + Auto-Cleaning 15 Menit oleh Karyawan
  const hasCleaner = activeEmps.some(e => e.role === 'all' || e.role === 'clean');
  const hasTech = activeEmps.some(e => e.role === 'all' || e.role === 'tech');

  state.rooms.forEach(r => {
    if (r.cleaningTime > 0) {
      // Jika ada karyawan bersih-bersih aktif, pembersihan berjalan normal (15 mnt)
      if (hasCleaner || state.player.location === 'Di Rental') {
        r.cleaningTime -= 1;
        if (r.cleaningTime <= 0) {
          r.cleaningTime = 0;
          addLog(`✨ <b>Room #${r.id}</b> selesai dibersihkan dan siap menerima tamu kembali!`);
        }
      }
    }

    if (r.customer) {
      r.timeLeft -= 1;
      if (r.console && r.console.stickHp > 0 && Math.random() < 0.003) {
        r.console.stickHp = Math.max(0, r.console.stickHp - 15);
        if (r.console.stickHp === 0 && hasTech && state.spareSticks > 0) {
          state.spareSticks -= 1;
          r.console.stickHp = 100;
          addLog(`🔧 Karyawan teknisi otomatis mengganti stik rusak di <b>Room #${r.id}</b>.`);
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

  // Pelanggan Datang Otomatis -> Masuk Room Kosong & Bayar di Depan!
  if (state.isOpen && state.kwh > 0 && Math.random() < 0.09) {
    spawnAutoWalkInCustomer();
  }

  // Pengunjung Beli Kondom & Jajanan di Etalase Kasir!
  if (state.isOpen && Math.random() < 0.045) {
    sellRetailItemToVisitor();
  }

  // Voucher Wi-Fi & Transaksi PPOB
  if (state.isOpen && state.wifi.provider && state.wifi.hotspotOpen && Math.random() < 0.03) {
    const mult = state.vip2x ? 2 : 1;
    const inc = roundTo500(state.wifi.voucherPrice * mult);
    state.drawerCash += inc;
    state.wifi.activeUsers = Math.min(30, state.wifi.activeUsers + 1);
    addLog(`📶 Pengunjung beli Voucher Wi-Fi (${state.wifi.voucherHours} jam) <b>+${fmtRp(inc)}</b> ke Kas Kasir.`);
  }

  if (state.isOpen && state.businessPpobBalance >= 60000 && Math.random() < 0.025) {
    const valid = PPOB_PRODUCTS.filter(p => state.businessPpobBalance >= (p.nominal + p.adminProvider));
    if (valid.length > 0) {
      const pr = valid[Math.floor(Math.random() * valid.length)];
      const modal = pr.nominal + pr.adminProvider;
      const profit = (pr.hargaJual - modal) * (state.vip2x ? 2 : 1);
      state.businessPpobBalance -= modal;
      state.drawerCash += roundTo500(modal + profit);
      addLog(`📲 PPOB: <b>${pr.name}</b> • Saldo Bisnis -${fmtRp(modal)}, Kasir +${fmtRp(modal + profit)}.`);
    }
  }
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
  const mult = state.vip2x ? 2 : 1;
  let totalPay = roundTo500(netRate * hours * mult);

  // Jika mode entertainment (pekerja hiburan), hitung bagi hasil persenan pemilik
  let ownerShare = totalPay;
  if (room.mode === 'entertainment' && room.entertainer) {
    ownerShare = roundTo500(totalPay * (room.entertainer.ownerPct / 100));
  }

  // 15% kemungkinan pelanggan minta kasbon (hutang wajib bayar + bunga 20%)
  const isDebt = Math.random() < 0.15 && ownerShare > 0;

  room.customer = { name: custName, hours, totalPaid: ownerShare };
  room.totalTime = hours * 60;
  room.timeLeft = hours * 60;

  // Catat rekomendasi game jika room gaming punya < 3 game
  if (room.mode === 'gaming' && room.console && room.console.games.length < 3) {
    const eraGames = ALL_GAMES.filter(g => g.platform === room.console.platform && g.year <= state.year && !room.console.games.includes(g.id));
    if (eraGames.length > 0) {
      const rec = eraGames[Math.floor(Math.random() * eraGames.length)];
      if (!state.recommendedGames.some(x => x.gameId === rec.id)) {
        state.recommendedGames.push({ gameId: rec.id, title: rec.title, platform: rec.platform });
      }
    }
  }

  if (isDebt) {
    const withInterest = roundTo500(ownerShare * 1.2); // Bunga 20%!
    state.debts.push({
      id: 'd_' + Date.now() + Math.random(),
      debtorName: custName,
      principal: ownerShare,
      totalDue: withInterest,
      dueDay: state.totalDays + 2
    });
    addLog(`📒 <b>${custName}</b> masuk ke <b>Room #${room.id}</b> (${hours} jam) & mencatat <b>Kasbon ${fmtRp(ownerShare)} + Bunga 20% = ${fmtRp(withInterest)}</b>!`);
  } else {
    // Pembayaran QRIS vs Tunai Kasir:
    // QRIS masuk ke qrisBalance (atau ke MCash HANYA JIKA sudah ditautkan!)
    const payQris = Math.random() < 0.35;
    if (payQris) {
      if (state.qrisLinkedToMCash) {
        state.walletMCash += ownerShare;
        addLog(`📲 <b>${custName}</b> masuk <b>Room #${room.id}</b> (${hours} jam) bayar QRIS <b>+${fmtRp(ownerShare)}</b> (Langsung masuk M-Cash tertaut).`);
      } else {
        state.qrisBalance += ownerShare;
        addLog(`📲 <b>${custName}</b> masuk <b>Room #${room.id}</b> (${hours} jam) bayar QRIS <b>+${fmtRp(ownerShare)}</b> ke Saldo QRIS Bisnis.`);
      }
    } else {
      state.drawerCash += ownerShare;
      addLog(`💵 <b>${custName}</b> masuk <b>Room #${room.id}</b> (${hours} jam) & bayar tunai di depan <b>+${fmtRp(ownerShare)}</b> ke Kas Kasir.`);
    }
  }
}

function sellRetailItemToVisitor() {
  const available = RETAIL_GOODS.filter(g => (state.retailStock[g.id] || 0) > 0);
  if (available.length === 0) return;
  const item = available[Math.floor(Math.random() * available.length)];
  state.retailStock[item.id] -= 1;
  const mult = state.vip2x ? 2 : 1;
  const earn = roundTo500(item.sellPrice * mult);
  state.drawerCash += earn;
  const shortName = item.name.split(' (')[0];
  addLog(`🛒 Pengunjung membeli <b>${shortName}</b> di etalase kasir (<b>+${fmtRp(earn)}</b>).`);
}

function onNewHour() {
  state.player.energy = Math.max(0, state.player.energy - 1);
}

function onNewDay() {
  state.day += 1;
  state.totalDays += 1;
  state.dayOfWeek = (state.dayOfWeek + 1) % 7;

  if (state.day > 30) {
    state.day = 1;
    state.month += 1;
    onNewMonth();
  }
  if (state.month > 12) {
    state.month = 1;
    state.year += 1;
    state.player.age += 1;
    addLog(`🎂 Selamat ulang tahun! Usia kamu sekarang <b>${state.player.age} tahun</b> (${state.year}).`);
  }

  const hol = HOLIDAYS_ID[`${state.day}-${state.month}`];
  if (hol) addLog(`🇮🇩 Hari Libur Nasional: <b>${hol}</b>!`);

  // Pelunasan Hutang/Kasbon Jatuh Tempo + Bunga 20%
  const dueDebts = state.debts.filter(d => state.totalDays >= d.dueDay);
  if (dueDebts.length > 0) {
    dueDebts.forEach(d => {
      state.drawerCash += d.totalDue;
      addLog(`💸 <b>${d.debtorName}</b> melunasi hutang beserta bunga 20% sebesar <b>+${fmtRp(d.totalDue)}</b> ke Kas Kasir!`);
    });
    state.debts = state.debts.filter(d => state.totalDays < d.dueDay);
  }

  // Sewa Kendaraan Harian jika disewakan
  state.ownedVehicles.forEach(v => {
    if (v.isRentedOut) {
      const inc = roundTo500(v.rentDaily * (state.vip2x ? 2 : 1));
      state.walletMCash += inc;
      addLog(`🛵 Sewa harian <b>${v.name}</b> masuk Dompet Pribadi: <b>+${fmtRp(inc)}</b>.`);
    }
  });

  // Biaya harian jika sudah menikah
  if (state.player.status === 'Menikah' && state.player.partner) {
    const pkg = WEDDING_PACKAGES.find(w => w.id === state.player.partner.weddingId) || WEDDING_PACKAGES[0];
    const [minC, maxC] = pkg.dailyCostRange;
    const exp = roundTo500(minC + Math.random() * (maxC - minC));
    state.walletMCash = Math.max(0, state.walletMCash - exp);
    addLog(`💍 Kebutuhan rumah tangga harian bersama ${state.player.partner.name}: <b>-${fmtRp(exp)}</b>.`);
  }

  if (state.player.pregnant) {
    state.player.pregnantWeeks += 1;
    if (state.player.pregnantWeeks >= 36) {
      state.player.pregnant = false;
      state.player.pregnantWeeks = 0;
      state.player.children += 1;
      addLog(`👶 Selamat! Buah hati lahir sehat! Total anak: ${state.player.children}.`);
    }
  }
}

function onNewMonth() {
  const kios = KIOS_TIERS.find(k => k.level === state.kiosLevel);
  if (!state.kiosOwned) {
    state.drawerCash = Math.max(0, state.drawerCash - kios.monthlyRent);
    addLog(`🏠 Sewa bulanan ${kios.name} (<b>-${fmtRp(kios.monthlyRent)}</b>) dibayar dari Kas Rental.`);
  }
  if (state.wifi.provider) {
    state.drawerCash = Math.max(0, state.drawerCash - state.wifi.provider.monthly);
    addLog(`🌐 Tagihan bulanan ${state.wifi.provider.name} (<b>-${fmtRp(state.wifi.provider.monthly)}</b>) dibayar.`);
  }
  // Gaji + Bonus + BPJS seluruh karyawan
  state.employees.forEach(emp => {
    const bpjsCost = emp.bpjs ? 150000 : 0;
    const totalPay = emp.salary + (emp.bonus || 0) + bpjsCost;
    state.drawerCash = Math.max(0, state.drawerCash - totalPay);
    addLog(`🧑‍💼 Gaji bulanan <b>${emp.name}</b> (Gaji + Bonus + BPJS): <b>-${fmtRp(totalPay)}</b>.`);
  });
  // Gaji pekerja hiburan yang sistem gaji tetap
  state.rooms.forEach(r => {
    if (r.mode === 'entertainment' && r.entertainer && r.entertainer.model === 'salary') {
      state.drawerCash = Math.max(0, state.drawerCash - r.entertainer.monthlySalary);
      addLog(`🎤 Gaji bulanan <b>${r.entertainer.name}</b> (Room #${r.id}): <b>-${fmtRp(r.entertainer.monthlySalary)}</b>.`);
    }
  });
}

// ==================== KELOLA ROOM SERBAGUNA (ISI / GANTI / JUAL / TARIF) ====================
function openRoomSetupModal(roomId) {
  const r = state.rooms.find(x => x.id === roomId);
  if (!r) return;

  showCustomModal(
    `🚪 Kelola & Isi Room #${r.id}`,
    `<div style="font-size:0.78rem;background:#090e1a;padding:8px;border-radius:8px;line-height:1.45;">
      Status Saat Ini: <b>${r.mode === 'empty' ? 'Room Kosong' : (r.mode === 'gaming' ? r.console.name + ' + ' + r.tv.name : (r.mode === 'couple' ? r.bed.name : r.entertainer.name))}</b><br>
      Tarif Aktif: <b>${fmtRp(roundTo500(r.rate * (1 - r.discountPct / 100)))}/jam</b> (Diskon ${r.discountPct}%)
    </div>

    ${r.mode === 'empty' ? `
      <div style="font-size:0.76rem;font-weight:700;color:var(--accent);">1. Jadikan Room Gaming (Pilih dari Gudang):</div>
      <div class="grid-2">
        <select id="selRoomConsole">
          ${state.inventoryConsoles.length === 0 ? `<option value="">-- Gudang Konsol/PC Kosong --</option>` : state.inventoryConsoles.map(c => `<option value="${c.uid}">${c.name}</option>`).join('')}
        </select>
        <select id="selRoomTV">
          ${state.inventoryTVs.length === 0 ? `<option value="">-- Gudang TV Kosong --</option>` : state.inventoryTVs.map(t => `<option value="${t.uid}">${t.name}</option>`).join('')}
        </select>
      </div>
      <button class="primary" onclick="installGamingToRoom(${r.id})" ${(state.inventoryConsoles.length === 0 || state.inventoryTVs.length === 0) ? 'disabled' : ''}>🎮 Pasang Konsol/PC & TV ke Room</button>

      <div style="font-size:0.76rem;font-weight:700;color:var(--pink);margin-top:4px;">2. Jadikan Room Sewa Pasangan (Kasur per Jam):</div>
      <div class="grid-2">
        <select id="selRoomBed">
          ${state.inventoryBeds.length === 0 ? `<option value="">-- Gudang Kasur Kosong --</option>` : state.inventoryBeds.map(b => `<option value="${b.uid}">${b.name} (${fmtRp(b.hourlyRate)}/jam)</option>`).join('')}
        </select>
        <button class="pink" onclick="installBedToRoom(${r.id})" ${state.inventoryBeds.length === 0 ? 'disabled' : ''}>🛋️ Pasang Kasur</button>
      </div>

      <div style="font-size:0.76rem;font-weight:700;color:var(--purple);margin-top:4px;">3. Jadikan Room Hiburan / Karaoke / Terapis:</div>
      <div class="grid-2">
        <select id="selRoomEnt">
          ${ENTERTAINERS_CATALOG.map(e => `<option value="${e.id}">${e.name} (${e.model === 'share' ? 'Bagi Hasil ' + e.ownerPct + '%' : 'Gaji ' + fmtRp(e.monthlySalary)})</option>`).join('')}
        </select>
        <button class="purple" onclick="installEntertainerToRoom(${r.id})">🎤 Tempatkan</button>
      </div>
    ` : `
      <div class="grid-2">
        <button onclick="unmountRoomEquipment(${r.id}, 'store')">📦 Lepas ke Gudang (Ganti Unit)</button>
        <button class="danger" onclick="unmountRoomEquipment(${r.id}, 'sell')">💰 Jual Perangkat Room (70%)</button>
      </div>
    `}

    <div style="font-size:0.76rem;font-weight:700;margin-top:4px;">Atur Diskon / Gratis Promo Room:</div>
    <div class="grid-3">
      <button class="${r.discountPct === 0 ? 'primary' : ''}" onclick="rSetDiscount(${r.id}, 0)">Normal</button>
      <button class="${r.discountPct === 25 ? 'primary' : ''}" onclick="rSetDiscount(${r.id}, 25)">Disc 25%</button>
      <button class="${r.discountPct === 50 ? 'primary' : ''}" onclick="rSetDiscount(${r.id}, 50)">Disc 50%</button>
      <button class="${r.discountPct === 100 ? 'success' : ''}" onclick="rSetDiscount(${r.id}, 100)">🎁 GRATIS</button>
    </div>

    <div style="font-size:0.76rem;font-weight:700;margin-top:4px;">Fasilitas Tambahan Room (Dari Kas Rental):</div>
    <div class="item-row">
      <span>🌀 Kipas Angin Dinding (Rp 250.000)</span>
      <button ${r.hasFan ? 'disabled' : ''} onclick="buyRoomAddon(${r.id}, 'fan')">${r.hasFan ? '✅ Ada' : 'Pasang'}</button>
    </div>
    <div class="item-row">
      <span>❄️ AC Split 1/2 PK (Rp 2.850.000 • +Rp 2.000/jam)</span>
      <button ${r.hasAC ? 'disabled' : ''} onclick="buyRoomAddon(${r.id}, 'ac')">${r.hasAC ? '✅ Ada' : 'Pasang AC'}</button>
    </div>
    <div class="item-row">
      <span>📹 Kamera CCTV Room (Rp 450.000)</span>
      <button ${r.hasCCTV ? 'disabled' : ''} onclick="buyRoomAddon(${r.id}, 'cctv')">${r.hasCCTV ? '✅ Ada' : 'Pasang CCTV'}</button>
    </div>`,
    `<button class="primary" onclick="closeCustomModal()">Tutup</button>`
  );
}

function installGamingToRoom(roomId) {
  const r = state.rooms.find(x => x.id === roomId);
  const cUid = document.getElementById('selRoomConsole')?.value;
  const tUid = document.getElementById('selRoomTV')?.value;
  const cIdx = state.inventoryConsoles.findIndex(c => c.uid === cUid);
  const tIdx = state.inventoryTVs.findIndex(t => t.uid === tUid);
  if (!r || cIdx === -1 || tIdx === -1) return;

  const con = state.inventoryConsoles.splice(cIdx, 1)[0];
  const tv = state.inventoryTVs.splice(tIdx, 1)[0];
  r.mode = 'gaming';
  r.console = con;
  r.tv = tv;
  r.rate = con.defaultRate + tv.bonusRate + (r.hasAC ? 2000 : 0);
  addLog(`🎮 <b>Room #${r.id}</b> diisi <b>${con.name}</b> + <b>${tv.name}</b>.`);
  saveGame(true); openRoomSetupModal(roomId); renderRooms();
}

function installBedToRoom(roomId) {
  const r = state.rooms.find(x => x.id === roomId);
  const bUid = document.getElementById('selRoomBed')?.value;
  const bIdx = state.inventoryBeds.findIndex(b => b.uid === bUid);
  if (!r || bIdx === -1) return;

  const bed = state.inventoryBeds.splice(bIdx, 1)[0];
  r.mode = 'couple';
  r.bed = bed;
  r.rate = bed.hourlyRate + (r.hasAC ? 15000 : 0);
  addLog(`💑 <b>Room #${r.id}</b> diset menjadi <b>Room Pasangan</b> (${bed.name} • ${fmtRp(r.rate)}/jam).`);
  saveGame(true); openRoomSetupModal(roomId); renderRooms();
}

function installEntertainerToRoom(roomId) {
  const r = state.rooms.find(x => x.id === roomId);
  const entId = document.getElementById('selRoomEnt')?.value;
  const ent = ENTERTAINERS_CATALOG.find(e => e.id === entId);
  if (!r || !ent) return;

  r.mode = 'entertainment';
  r.entertainer = { ...ent };
  r.rate = ent.hourlyRate;
  addLog(`🎤 <b>${ent.name}</b> mulai bekerja di <b>Room #${r.id}</b>.`);
  saveGame(true); openRoomSetupModal(roomId); renderRooms();
}

function unmountRoomEquipment(roomId, action) {
  const r = state.rooms.find(x => x.id === roomId);
  if (!r || r.customer) return addLog('⚠️ Tunggu tamu selesai sebelum membongkar perangkat room!');

  if (r.mode === 'gaming') {
    if (action === 'store') {
      if (r.console) state.inventoryConsoles.push(r.console);
      if (r.tv) state.inventoryTVs.push(r.tv);
      addLog(`📦 Perangkat <b>Room #${r.id}</b> dilepas & dikembalikan ke gudang.`);
    } else {
      const val = roundTo500(((r.console?.price || 0) + (r.tv?.price || 0)) * 0.7);
      state.drawerCash += val;
      addLog(`💰 Perangkat <b>Room #${r.id}</b> dijual bekas laku <b>+${fmtRp(val)}</b>.`);
    }
  } else if (r.mode === 'couple' && r.bed) {
    if (action === 'store') state.inventoryBeds.push(r.bed);
    else state.drawerCash += roundTo500(r.bed.price * 0.7);
  }

  r.mode = 'empty'; r.console = null; r.tv = null; r.bed = null; r.entertainer = null; r.rate = 0;
  saveGame(true); openRoomSetupModal(roomId); renderRooms(); updateHudOnly();
}

function rSetDiscount(roomId, pct) {
  const r = state.rooms.find(x => x.id === roomId);
  if (!r) return;
  r.discountPct = pct;
  saveGame(true); openRoomSetupModal(roomId); renderRooms();
}

function buyRoomAddon(roomId, type) {
  const r = state.rooms.find(x => x.id === roomId);
  if (!r) return;
  const costs = { fan: 250000, ac: 2850000, cctv: 450000 };
  const cost = costs[type];
  if (state.drawerCash < cost) return addLog('❌ Kas Kasir Rental kurang! Tarik dana dari Dompet MCash ke Kasir dulu.');
  state.drawerCash -= cost;
  if (type === 'fan') r.hasFan = true;
  if (type === 'ac') { r.hasAC = true; r.rate += 2000; }
  if (type === 'cctv') r.hasCCTV = true;
  saveGame(true); openRoomSetupModal(roomId); renderRooms(); updateHudOnly();
}

// ==================== GAME PER-UNIT ====================
function openUnitGamesModal(roomId) {
  state.selectedRoomForGames = roomId;
  document.getElementById('unitGamesModal').style.display = 'flex';
  renderUnitGamesModal();
}

function renderUnitGamesModal() {
  const r = state.rooms.find(x => x.id === state.selectedRoomForGames);
  if (!r || !r.console) return;
  const con = r.console;
  let usedGB = 0;
  if (con.media === 'storage') {
    con.games.forEach(gid => { const g = ALL_GAMES.find(x => x.id === gid); if (g) usedGB += g.sizeGB; });
  }
  document.getElementById('unitGamesHeader').innerHTML = `
    <b>Room #${r.id} — ${con.name}</b><br>
    <span style="font-size:0.75rem;color:#94a3b8;">${con.media === 'storage' ? `Storage: <b>${usedGB} GB / ${con.storageGB} GB</b>` : 'Media: <b>CD Fisik</b>'}</span>
  `;
  const avail = ALL_GAMES.filter(g => g.platform === con.platform && g.year <= state.year);
  const list = document.getElementById('unitGamesList');
  list.innerHTML = '';
  avail.forEach(g => {
    const owned = con.games.includes(g.id);
    const full = con.media === 'storage' && !owned && (usedGB + g.sizeGB > con.storageGB);
    list.innerHTML += `
      <div class="item-row">
        <div><b>${g.title}</b> ${g.sizeGB > 0 ? `<span class="badge">${g.sizeGB} GB</span>` : ''}<br><span style="color:#34d399;">${fmtRp(g.price)}</span></div>
        ${owned
          ? `<button class="danger" onclick="toggleUnitGame('${g.id}', false)">Hapus</button>`
          : `<button class="primary" ${full ? 'disabled' : ''} onclick="toggleUnitGame('${g.id}', true)">${full ? 'Penuh' : 'Beli & Pasang'}</button>`}
      </div>`;
  });
}

function toggleUnitGame(gameId, install) {
  const r = state.rooms.find(x => x.id === state.selectedRoomForGames);
  const g = ALL_GAMES.find(x => x.id === gameId);
  if (!r || !r.console || !g) return;
  if (install) {
    if (state.drawerCash < g.price) return addLog('❌ Kas Kasir Rental kurang untuk membeli game ini!');
    state.drawerCash -= g.price;
    r.console.games.push(g.id);
    addLog(`💿 Membeli & memasang <b>${g.title}</b> di <b>Room #${r.id}</b>.`);
  } else {
    r.console.games = r.console.games.filter(id => id !== g.id);
  }
  saveGame(true); renderUnitGamesModal(); renderRooms(); updateHudOnly();
}

// ==================== HR KARYAWAN (CUSTOM MODAL LENGKAP) ====================
function openHireEmployeeModal() {
  showCustomModal(
    '🧑‍💼 Rekrut & Atur Jadwal Karyawan Baru',
    `<label style="font-size:0.75rem;color:var(--muted);">Nama Karyawan:</label>
     <input type="text" id="empName" value="Siti Rahmawati" />
     <div class="grid-2">
       <div>
         <label style="font-size:0.74rem;color:var(--muted);">Jam Masuk (0–23):</label>
         <input type="number" id="empStart" value="8" min="0" max="23" />
       </div>
       <div>
         <label style="font-size:0.74rem;color:var(--muted);">Durasi Kerja (1–12 Jam):</label>
         <input type="number" id="empDur" value="8" min="1" max="12" />
       </div>
     </div>
     <div class="grid-2">
       <div>
         <label style="font-size:0.74rem;color:var(--muted);">Gaji Bulanan (Rp):</label>
         <input type="number" id="empSalary" value="1500000" step="100000" />
       </div>
       <div>
         <label style="font-size:0.74rem;color:var(--muted);">Tugas Utama:</label>
         <select id="empRole">
           <option value="all">Semua Tugas (Jaga + Bersih + Servis)</option>
           <option value="guard">Jaga Kasir & Buka/Tutup Toko</option>
           <option value="clean">Bersih-bersih Room Pasangan</option>
           <option value="tech">Teknisi Servis Stik & Konsol</option>
         </select>
       </div>
     </div>
     <label style="font-size:0.75rem;display:flex;align-items:center;gap:6px;margin-top:4px;">
       <input type="checkbox" id="empBpjs" checked style="width:auto;" /> Daftarkan BPJS Kesehatan & Ketenagakerjaan (+Rp 150.000/bln)
     </label>`,
    `<button onclick="closeCustomModal()">Batal</button>
     <button class="success" onclick="confirmHireEmployee()">✅ Rekrut Karyawan</button>`
  );
}

function confirmHireEmployee() {
  const name = document.getElementById('empName').value.trim() || 'Karyawan';
  const start = Math.max(0, Math.min(23, Number(document.getElementById('empStart').value)));
  const dur = Math.max(1, Math.min(12, Number(document.getElementById('empDur').value)));
  const end = (start + dur) % 24;
  const salary = Math.max(500000, roundTo500(Number(document.getElementById('empSalary').value)));
  const role = document.getElementById('empRole').value;
  const bpjs = document.getElementById('empBpjs').checked;

  state.employees.push({
    id: 'emp_' + Date.now(),
    name, shiftStart: start, shiftEnd: end, duration: dur,
    offDays: [0], // Default Minggu libur, bisa ditambah/kurangi kapan saja
    salary, bonus: 0, bpjs, role
  });
  addLog(`🧑‍💼 Merekrut <b>${name}</b> (Shift ${String(start).padStart(2,'0')}:00–${String(end).padStart(2,'0')}:00, ${dur} jam/hari).`);
  closeCustomModal();
  saveGame(true);
  renderRightPanel();
}

function toggleEmployeeOffDay(empId, dayIdx) {
  const emp = state.employees.find(e => e.id === empId);
  if (!emp) return;
  if (emp.offDays.includes(dayIdx)) emp.offDays = emp.offDays.filter(d => d !== dayIdx);
  else emp.offDays.push(dayIdx);
  saveGame(true);
  renderRightPanel();
}

function openEditEmployeeModal(empId) {
  const emp = state.employees.find(e => e.id === empId);
  if (!emp) return;
  showCustomModal(
    `⚙️ Atur Gaji, Bonus & Shift — ${emp.name}`,
    `<div class="grid-2">
       <div>
         <label style="font-size:0.74rem;color:var(--muted);">Jam Masuk (0–23):</label>
         <input type="number" id="edStart" value="${emp.shiftStart}" min="0" max="23" />
       </div>
       <div>
         <label style="font-size:0.74rem;color:var(--muted);">Durasi Kerja (1–12 Jam):</label>
         <input type="number" id="edDur" value="${emp.duration}" min="1" max="12" />
       </div>
     </div>
     <div class="grid-2">
       <div>
         <label style="font-size:0.74rem;color:var(--muted);">Gaji Pokok (Rp):</label>
         <input type="number" id="edSal" value="${emp.salary}" step="100000" />
       </div>
       <div>
         <label style="font-size:0.74rem;color:var(--muted);">Bonus Bulanan (Rp):</label>
         <input type="number" id="edBonus" value="${emp.bonus || 0}" step="50000" />
       </div>
     </div>
     <label style="font-size:0.74rem;color:var(--muted);">Tugas Karyawan:</label>
     <select id="edRole">
       <option value="all" ${emp.role==='all'?'selected':''}>Semua Tugas (Jaga + Bersih + Servis)</option>
       <option value="guard" ${emp.role==='guard'?'selected':''}>Jaga Kasir & Buka/Tutup Toko</option>
       <option value="clean" ${emp.role==='clean'?'selected':''}>Bersih-bersih Room</option>
       <option value="tech" ${emp.role==='tech'?'selected':''}>Teknisi Servis Stik</option>
     </select>
     <label style="font-size:0.75rem;display:flex;align-items:center;gap:6px;">
       <input type="checkbox" id="edBpjs" ${emp.bpjs?'checked':''} style="width:auto;" /> Aktifkan BPJS (+Rp 150.000/bln)
     </label>`,
    `<button class="danger" onclick="state.employees=state.employees.filter(x=>x.id!=='${emp.id}');closeCustomModal();saveGame(true);renderRightPanel();">Pecat</button>
     <button class="primary" onclick="saveEditEmployee('${emp.id}')">Simpan Perubahan</button>`
  );
}

function saveEditEmployee(empId) {
  const emp = state.employees.find(e => e.id === empId);
  if (!emp) return;
  emp.shiftStart = Math.max(0, Math.min(23, Number(document.getElementById('edStart').value)));
  emp.duration = Math.max(1, Math.min(12, Number(document.getElementById('edDur').value)));
  emp.shiftEnd = (emp.shiftStart + emp.duration) % 24;
  emp.salary = Math.max(500000, roundTo500(Number(document.getElementById('edSal').value)));
  emp.bonus = Math.max(0, roundTo500(Number(document.getElementById('edBonus').value)));
  emp.role = document.getElementById('edRole').value;
  emp.bpjs = document.getElementById('edBpjs').checked;
  closeCustomModal(); saveGame(true); renderRightPanel();
}

// ==================== STORE, WIFI, BANK/PPOB, AKTIVITAS LUAR & HIDUP ====================
function switchMainTab(tab, el) {
  state.mainTab = tab;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  renderRightPanel();
}
function switchSubTab(sub) { state.subTab = sub; renderRightPanel(); }

function buyStoreItem(cat, id) {
  if (cat === 'console') {
    const it = CONSOLE_CATALOG.find(x => x.id === id);
    if (!it || state.drawerCash < it.price) return addLog('❌ Kas Kasir Rental kurang! Pindahkan dana dari MCash dulu.');
    state.drawerCash -= it.price;
    state.inventoryConsoles.push({ uid: 'c_' + Date.now() + Math.random(), ...it, games: [], stickHp: 100 });
    addLog(`📦 Membeli <b>${it.name}</b> masuk ke gudang.`);
  } else if (cat === 'pc') {
    const it = PC_CATALOG.find(x => x.id === id);
    if (!it || state.drawerCash < it.price) return addLog('❌ Kas Kasir Rental kurang!');
    state.drawerCash -= it.price;
    state.inventoryConsoles.push({ uid: 'c_' + Date.now() + Math.random(), ...it, games: [], stickHp: 100 });
    addLog(`🖥️ Membeli <b>${it.name}</b> masuk ke gudang.`);
  } else if (cat === 'tv') {
    const it = TV_CATALOG.find(x => x.id === id);
    if (!it || state.drawerCash < it.price) return addLog('❌ Kas Kasir Rental kurang!');
    state.drawerCash -= it.price;
    state.inventoryTVs.push({ uid: 't_' + Date.now() + Math.random(), ...it });
    addLog(`📺 Membeli <b>${it.name}</b> masuk ke gudang.`);
  } else if (cat === 'bed') {
    const it = BED_PACKAGES.find(x => x.id === id);
    if (!it || state.drawerCash < it.price) return addLog('❌ Kas Kasir Rental kurang!');
    state.drawerCash -= it.price;
    state.inventoryBeds.push({ uid: 'b_' + Date.now() + Math.random(), ...it });
    addLog(`🛋️ Membeli <b>${it.name}</b> untuk Room Pasangan.`);
  } else if (cat === 'retail') {
    const it = RETAIL_GOODS.find(x => x.id === id);
    if (!it || state.drawerCash < it.buyPrice) return addLog('❌ Kas Kasir Rental kurang!');
    state.drawerCash -= it.buyPrice;
    state.retailStock[it.id] = (state.retailStock[it.id] || 0) + it.packCount;
    addLog(`🛒 Stok etalase kasir bertambah: <b>+${it.packCount} pcs ${it.name.split(' (')[0]}</b> (Siap dijual ke pengunjung!).`);
  } else if (cat === 'kwh50') {
    if (state.drawerCash < 72000) return addLog('❌ Kas Kasir kurang!');
    state.drawerCash -= 72000; state.kwh += 50;
    addLog('⚡ Token PLN +50 kWh diisi.');
  } else if (cat === 'stick') {
    if (state.drawerCash < 65000) return addLog('❌ Kas Kasir kurang!');
    state.drawerCash -= 65000; state.spareSticks += 2;
    addLog('🎮 +2 Stik cadangan ditambahkan.');
  } else if (cat === 'vehicle') {
    const v = VEHICLES_CATALOG.find(x => x.id === id);
    if (!v || state.walletMCash < v.price) return addLog('❌ Dompet Pribadi (MCash) kurang untuk beli kendaraan!');
    state.walletMCash -= v.price;
    state.ownedVehicles.push({ uid: 'v_' + Date.now(), ...v, isRentedOut: false });
    addLog(`🛵 Membeli <b>${v.name}</b> untuk pribadi (bisa disewakan atau dijual kapan saja).`);
  }
  saveGame(true); renderRightPanel(); updateHudOnly();
}

function installWifi(id) {
  const p = WIFI_PROVIDERS.find(x => x.id === id);
  if (!p || state.drawerCash < p.installFee) return addLog('❌ Kas Kasir Rental kurang untuk biaya pasang Wi-Fi!');
  state.drawerCash -= p.installFee;
  state.wifi.provider = p;
  state.wifi.hotspotOpen = true;
  addLog(`📶 Wi-Fi <b>${p.name}</b> berhasil dipasang!`);
  saveGame(true); renderRightPanel(); updateHudOnly();
}

function openVoucherConfigModal() {
  showCustomModal(
    '🎫 Atur Tarif Voucher Wi-Fi Hotspot',
    `<label style="font-size:0.76rem;color:var(--muted);">Harga Voucher (Kelipatan Rp 500):</label>
     <input type="number" id="vPrice" value="${state.wifi.voucherPrice}" step="500" />
     <label style="font-size:0.76rem;color:var(--muted);">Durasi Paket (Jam):</label>
     <input type="number" id="vHours" value="${state.wifi.voucherHours}" min="1" max="24" />`,
    `<button onclick="closeCustomModal()">Batal</button>
     <button class="primary" onclick="state.wifi.voucherPrice=Math.max(1000,roundTo500(Number(document.getElementById('vPrice').value)));state.wifi.voucherHours=Math.max(1,Number(document.getElementById('vHours').value));closeCustomModal();saveGame(true);renderRightPanel();">Simpan</button>`
  );
}

function transferMoney(dir) {
  const amt = roundTo500(Math.max(0, Number(document.getElementById('tfAmountInput')?.value || 0)));
  if (amt <= 0 && dir !== 'qrisToCash') return;

  if (dir === 'kasirToMCash') {
    if (state.drawerCash < amt) return addLog('❌ Kas Kasir tidak cukup!');
    state.drawerCash -= amt; state.walletMCash += amt;
    addLog(`💰 Tarik laba rental <b>${fmtRp(amt)}</b> ke Dompet Pribadi (MCash).`);
  } else if (dir === 'mcashToKasir') {
    if (state.walletMCash < amt) return addLog('❌ Saldo Dompet Pribadi kurang!');
    state.walletMCash -= amt; state.drawerCash += amt;
    addLog(`🏦 Suntik modal pribadi <b>${fmtRp(amt)}</b> ke Kas Kasir Rental.`);
  } else if (dir === 'kasirToPpob') {
    if (state.drawerCash < amt) return addLog('❌ Kas Kasir tidak cukup!');
    state.drawerCash -= amt; state.businessPpobBalance += amt;
    addLog(`📲 Isi Deposit Saldo Bisnis PPOB dari Kasir: <b>+${fmtRp(amt)}</b>.`);
  } else if (dir === 'qrisToCash') {
    if (state.qrisBalance <= 0) return;
    const m = state.qrisBalance; state.qrisBalance = 0; state.drawerCash += m;
    addLog(`📲 Cairkan Saldo QRIS <b>${fmtRp(m)}</b> ke Kas Kasir.`);
  }
  saveGame(true); renderRightPanel(); updateHudOnly();
}

function doOutsideActivity(actId) {
  const act = OUTSIDE_ACTIVITIES.find(x => x.id === actId);
  if (!act) return;
  if (state.walletMCash < act.cost) return addLog('❌ Uang di Dompet Pribadi (MCash) tidak cukup!');
  state.walletMCash -= act.cost;
  state.player.energy = Math.min(100, state.player.energy + act.energyGain);
  state.player.charm = Math.min(100, state.player.charm + act.charmGain);
  state.player.location = 'Di Luar (Jalan-Jalan)';
  addLog(`🛵 Aktivitas Luar: <b>${act.name}</b> (-${fmtRp(act.cost)} dari MCash • Energi ${state.player.energy}%, Pesona ${state.player.charm}).`);
  saveGame(true); renderRightPanel(); updateHudOnly();
}

function datePartner(pid) {
  const p = PARTNERS_LIST.find(x => x.id === pid);
  if (!p) return;
  if (state.player.charm < p.charmReq) return addLog(`💔 Pesona kamu masih ${state.player.charm} (butuh ${p.charmReq}). Jalan-jalan/salon dulu!`);
  state.player.status = 'Pacaran';
  state.player.partner = { ...p };
  state.player.relationship = 35;
  addLog(`💕 Kamu resmi berpacaran dengan <b>${p.name}</b>!`);
  saveGame(true); renderRightPanel();
}

function doHB() {
  if (!state.player.partner) return;
  if (state.player.energy < 20) return addLog('😴 Energi lelah!');
  state.player.energy -= 20;
  state.player.relationship = Math.min(100, state.player.relationship + 20);
  const prot = state.player.kbActive || state.player.condomActive;
  if (state.player.condomActive) state.player.condomActive = false;
  addLog(`❤️ Melakukan HB bersama ${state.player.partner.name} (Kemesraan ${state.player.relationship}%).`);
  if (!prot && !state.player.pregnant && Math.random() < 0.45) {
    state.player.pregnant = true; state.player.pregnantWeeks = 1;
    if (state.player.status !== 'Menikah') {
      state.player.reputation = Math.max(1.0, +(state.player.reputation - 0.3).toFixed(2));
      addLog('🤰 <b>Hamil di luar nikah!</b> Jadi bahan omongan tetangga.');
    } else {
      addLog('🤰 Selamat! Kamu positif hamil bersama suami.');
    }
  }
  saveGame(true); renderRightPanel(); updateHudOnly();
}

function marryPartner(pkgId) {
  const pkg = WEDDING_PACKAGES.find(w => w.id === pkgId);
  if (!pkg || !state.player.partner) return;
  if (state.player.relationship < 80) return addLog('💕 Kemesraan minimal 80% untuk menikah!');
  if (state.walletMCash < pkg.cost) return addLog(`❌ Saldo Dompet Pribadi (MCash) kurang (${fmtRp(pkg.cost)})!`);
  state.walletMCash -= pkg.cost;
  state.player.status = 'Menikah';
  state.player.partner.weddingId = pkg.id;
  addLog(`💒 <b>SAH!</b> Resmi menikah dengan ${state.player.partner.name} (${pkg.name})!`);
  saveGame(true); renderRightPanel(); updateHudOnly();
}

// ==================== RENDER UI ====================
function updateHudOnly() {
  document.getElementById('rentalTitleDisplay').textContent = state.rentalName;
  const hh = String(state.hour).padStart(2, '0');
  const mm = String(state.minute).padStart(2, '0');
  const hol = HOLIDAYS_ID[`${state.day}-${state.month}`];
  document.getElementById('hudDateTime').textContent = `${DAY_NAMES[state.dayOfWeek]}, ${state.day}/${state.month}/${state.year} • ${hh}:${mm}${hol ? ' 🇮🇩' : ''}`;
  document.getElementById('hudWallet').textContent = fmtRp(state.walletMCash);
  document.getElementById('hudDrawer').textContent = fmtRp(state.drawerCash);
  document.getElementById('hudPpob').textContent = fmtRp(state.businessPpobBalance);
  document.getElementById('hudKwh').textContent = `${state.kwh.toFixed(1)} kWh`;
  document.getElementById('hudRep').textContent = `⭐ ${state.player.reputation.toFixed(2)}`;

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

    let titleTag = 'Kosong (Bebas Diisi)';
    let badgeClass = 'ok';
    let badgeText = 'Siap Diisi';
    if (r.cleaningTime > 0) { badgeClass = 'warn'; badgeText = `Dibersihkan (${r.cleaningTime}m)`; }
    else if (r.customer) { badgeClass = 'busy'; badgeText = 'Terisi'; }
    else if (r.mode !== 'empty') { badgeClass = 'ok'; badgeText = 'Kosong'; }

    if (r.mode === 'gaming') titleTag = `Gaming (${r.console.platform})`;
    if (r.mode === 'couple') titleTag = 'Room Pasangan 💑';
    if (r.mode === 'entertainment') titleTag = 'Room Hiburan 🎤';

    const installedTitles = (r.mode === 'gaming' && r.console) ? r.console.games.map(gid => ALL_GAMES.find(x => x.id === gid)?.title || gid) : [];

    const div = document.createElement('div');
    div.className = 'booth' + (r.customer ? ' active' : '') + (r.cleaningTime > 0 ? ' broken' : '');
    div.innerHTML = `
      <div class="booth-top">
        <span>🚪 Room #${r.id} • ${titleTag}</span>
        <span class="badge ${badgeClass}">${badgeText}</span>
      </div>
      <div class="spec-line">
        ${r.mode === 'empty' ? '<i>Belum ada perangkat/kasur. Klik tombol di bawah untuk mengisi room ini.</i>' : ''}
        ${r.mode === 'gaming' ? `🎮 <b>${r.console.name}</b><br>📺 ${r.tv.name}<br>💵 Tarif: <b>${netRate === 0 ? 'GRATIS' : fmtRp(netRate) + '/jam'}</b> • Stik: <b>${r.console.stickHp}%</b>` : ''}
        ${r.mode === 'couple' ? `🛋️ <b>${r.bed.name}</b><br>💵 Tarif: <b>${netRate === 0 ? 'GRATIS' : fmtRp(netRate) + '/jam'}</b>` : ''}
        ${r.mode === 'entertainment' ? `🎤 <b>${r.entertainer.name}</b><br>💵 Tarif: <b>${fmtRp(netRate)}/jam</b> (${r.entertainer.model === 'share' ? 'Bagi Hasil ' + r.entertainer.ownerPct + '%' : 'Sistem Gaji'})` : ''}
      </div>
      <div class="room-facilities">
        ${r.hasAC ? `<span class="fac-tag">❄️ AC</span>` : (r.hasFan ? `<span class="fac-tag">🌀 Kipas</span>` : '')}
        ${r.hasCCTV ? `<span class="fac-tag">📹 CCTV</span>` : ''}
      </div>
      ${r.mode === 'gaming' ? `
        <div class="games-pill-wrap">
          ${installedTitles.length === 0 ? `<span style="font-size:0.68rem;color:#f87171;">⚠️ Belum ada game</span>` : installedTitles.map(t => `<span class="game-pill">${t}</span>`).join('')}
        </div>
      ` : ''}
      ${r.customer ? `
        <div style="background:#090e1a;padding:6px;border-radius:7px;font-size:0.73rem;">
          <div>👤 <b>${r.customer.name}</b> (${r.customer.hours} jam)</div>
          <div style="color:#94a3b8;">Sisa waktu: ${r.timeLeft} menit</div>
          <div class="progress-bar" style="margin-top:4px;"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>
      ` : ''}
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:auto;">
        <button class="primary" style="flex:1;" onclick="openRoomSetupModal(${r.id})">⚙️ Isi / Atur Room</button>
        ${r.mode === 'gaming' ? `<button onclick="openUnitGamesModal(${r.id})">💿 Game (${installedTitles.length})</button>` : ''}
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
        <button class="sub-btn ${state.subTab==='etalase'?'active':''}" onclick="switchSubTab('etalase')">🛒 Etalase/PLN</button>
        <button class="sub-btn ${state.subTab==='kendaraan'?'active':''}" onclick="switchSubTab('kendaraan')">🛵 Motor/Mobil</button>
      </div>
      <div style="background:#090e1a;padding:6px 8px;border-radius:8px;font-size:0.72rem;color:var(--muted);">
        Gudang Siap Pasang: <b>${state.inventoryConsoles.length} Konsol/PC</b> • <b>${state.inventoryTVs.length} TV</b> • <b>${state.inventoryBeds.length} Kasur</b>
      </div>
      <div class="scroll-area" id="mainScrollArea"></div>
    `;
    const sc = document.getElementById('mainScrollArea');

    if (state.subTab === 'konsol') {
      CONSOLE_CATALOG.filter(c => c.year < state.year || (c.year === state.year && c.month <= state.month)).forEach(c => {
        sc.innerHTML += `<div class="item-row"><div><b>${c.name}</b> <span class="badge">${c.platform}</span><br><span style="color:#34d399;">${fmtRp(c.price)}</span></div><button class="primary" onclick="buyStoreItem('console','${c.id}')">Beli</button></div>`;
      });
    } else if (state.subTab === 'pc') {
      PC_CATALOG.filter(p => p.year <= state.year).forEach(p => {
        sc.innerHTML += `<div class="item-row"><div><b>${p.name}</b><br><span style="color:#34d399;">${fmtRp(p.price)}</span></div><button class="primary" onclick="buyStoreItem('pc','${p.id}')">Beli</button></div>`;
      });
    } else if (state.subTab === 'tv') {
      TV_CATALOG.filter(t => t.year <= state.year).forEach(t => {
        sc.innerHTML += `<div class="item-row"><div><b>${t.name}</b> <span class="badge">${t.type} ${t.inch}"</span><br><span style="color:#34d399;">${fmtRp(t.price)}</span></div><button class="primary" onclick="buyStoreItem('tv','${t.id}')">Beli</button></div>`;
      });
    } else if (state.subTab === 'kasur') {
      BED_PACKAGES.forEach(b => {
        sc.innerHTML += `<div class="item-row"><div><b>${b.name}</b><br><span style="color:var(--muted);">Tarif Sewa: ${fmtRp(b.hourlyRate)}/jam</span><br><b style="color:#34d399;">${fmtRp(b.price)}</b></div><button class="pink" onclick="buyStoreItem('bed','${b.id}')">Beli</button></div>`;
      });
    } else if (state.subTab === 'etalase') {
      sc.innerHTML += `
        <div class="item-row"><div><b>⚡ Token Listrik PLN 50 kWh</b><br><span style="color:#34d399;">Rp 72.000</span></div><button class="primary" onclick="buyStoreItem('kwh50')">Beli</button></div>
        <div class="item-row"><div><b>🎮 2x Stik PS Cadangan</b> (Stok: ${state.spareSticks})<br><span style="color:#34d399;">Rp 65.000</span></div><button onclick="buyStoreItem('stick')">Beli</button></div>
      `;
      RETAIL_GOODS.forEach(g => {
        sc.innerHTML += `<div class="item-row"><div><b>${g.name}</b><br><span style="color:var(--muted);">Stok Etalase: <b>${state.retailStock[g.id] || 0} pcs</b> • Jual ${fmtRp(g.sellPrice)}/pcs</span><br><b style="color:#34d399;">Grosir: ${fmtRp(g.buyPrice)}</b></div><button class="success" onclick="buyStoreItem('retail','${g.id}')">Kulakan</button></div>`;
      });
    } else if (state.subTab === 'kendaraan') {
      VEHICLES_CATALOG.forEach(v => {
        sc.innerHTML += `<div class="item-row"><div><b>${v.name}</b><br><span style="color:var(--muted);">Bisa dipakai pribadi atau disewakan ${fmtRp(v.rentDaily)}/hr</span><br><b style="color:#60a5fa;">${fmtRp(v.price)} (MCash)</b></div><button class="primary" onclick="buyStoreItem('vehicle','${v.id}')">Beli</button></div>`;
      });
      if (state.ownedVehicles.length > 0) {
        sc.innerHTML += `<div style="font-weight:700;color:var(--accent);font-size:0.76rem;margin-top:4px;">Garasi Kendaraanmu:</div>`;
        state.ownedVehicles.forEach((ov, i) => {
          sc.innerHTML += `<div class="item-row"><div><b>${ov.name}</b><br><span style="color:${ov.isRentedOut?'#34d399':'#94a3b8'};">${ov.isRentedOut ? 'Sedang Disewakan (' + fmtRp(ov.rentDaily) + '/hr)' : 'Dipakai Pribadi'}</span></div><div style="display:flex;gap:4px;"><button onclick="state.ownedVehicles[${i}].isRentedOut=!state.ownedVehicles[${i}].isRentedOut;saveGame(true);renderRightPanel();">${ov.isRentedOut ? 'Tarik' : 'Sewakan'}</button><button class="danger" onclick="state.walletMCash+=roundTo500(${ov.price}*0.75);state.ownedVehicles.splice(${i},1);saveGame(true);renderRightPanel();updateHudOnly();">Jual</button></div></div>`;
        });
      }
    }
    sc.scrollTop = prevScroll;

  } else if (state.mainTab === 'hr') {
    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:0.76rem;color:var(--muted);">Total Karyawan: <b>${state.employees.length}</b> (Tanpa Batas)</span>
        <button class="success" onclick="openHireEmployeeModal()">➕ Rekrut Karyawan</button>
      </div>
      <div class="scroll-area" id="mainScrollArea">
        ${state.employees.length === 0 ? `<div style="color:#64748b;font-size:0.78rem;text-align:center;padding:20px 0;">Belum ada karyawan. Klik Rekrut Karyawan untuk mengatur shift otomatis.</div>` : ''}
        ${state.employees.map(emp => `
          <div class="item-row" style="flex-direction:column;align-items:stretch;gap:6px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <b>🧑‍💼 ${emp.name}</b>
              <button onclick="openEditEmployeeModal('${emp.id}')">⚙️ Gaji/Shift</button>
            </div>
            <div style="font-size:0.73rem;color:var(--muted);">
              Shift: <b>${String(emp.shiftStart).padStart(2,'0')}:00 – ${String(emp.shiftEnd).padStart(2,'0')}:00</b> (${emp.duration} jam) • Tugas: <b>${emp.role.toUpperCase()}</b><br>
              Gaji: <b>${fmtRp(emp.salary)}</b> • Bonus: <b>${fmtRp(emp.bonus || 0)}</b> • BPJS: <b>${emp.bpjs ? '✅ Aktif' : '❌ Tidak'}</b>
            </div>
            <div style="font-size:0.7rem;color:var(--muted);">Klik hari untuk atur <b>Hari Libur</b> (Merah = Libur):</div>
            <div style="display:flex;gap:3px;flex-wrap:wrap;">
              ${DAY_NAMES.map((dn, idx) => `<span class="day-chip ${emp.offDays.includes(idx)?'off':''}" onclick="toggleEmployeeOffDay('${emp.id}', ${idx})">${dn.slice(0,3)}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;

  } else if (state.mainTab === 'wifi') {
    box.innerHTML = `
      <div class="item-row" style="flex-direction:column;align-items:stretch;gap:5px;">
        <div style="display:flex;justify-content:space-between;"><b>ISP Terpasang:</b><span>${state.wifi.provider ? state.wifi.provider.name : 'Belum Ada'}</span></div>
        ${state.wifi.provider ? `
          <div style="font-size:0.74rem;color:var(--muted);">Voucher Hotspot: <b>${fmtRp(state.wifi.voucherPrice)} / ${state.wifi.voucherHours} Jam</b> • User Aktif: <b>${state.wifi.activeUsers}</b></div>
          <div class="grid-2">
            <button class="primary" onclick="openVoucherConfigModal()">🎫 Atur Voucher</button>
            <button onclick="state.wifi.hotspotOpen=!state.wifi.hotspotOpen;saveGame(true);renderRightPanel();">${state.wifi.hotspotOpen ? '🟢 Hotspot Buka' : '🔴 Hotspot Tutup'}</button>
          </div>
        ` : ''}
      </div>
      <div class="scroll-area" id="mainScrollArea">
        ${WIFI_PROVIDERS.filter(p => p.year <= state.year).map(p => `
          <div class="item-row">
            <div><b>${p.name}</b><br><span style="color:var(--muted);">Pasang: ${fmtRp(p.installFee)} • Bulanan: ${fmtRp(p.monthly)}</span></div>
            <button class="primary" onclick="installWifi('${p.id}')">Pasang</button>
          </div>
        `).join('')}
      </div>
    `;

  } else if (state.mainTab === 'bank') {
    const kios = KIOS_TIERS.find(k => k.level === state.kiosLevel);
    const nextKios = KIOS_TIERS.find(k => k.level === state.kiosLevel + 1);
    box.innerHTML = `
      <div class="item-row" style="flex-direction:column;align-items:stretch;gap:6px;">
        <div style="display:flex;justify-content:space-between;"><span>💳 Dompet Pribadi (M-Cash):</span><b style="color:#60a5fa;">${fmtRp(state.walletMCash)}</b></div>
        <div style="display:flex;justify-content:space-between;"><span>💵 Kas Kasir Rental:</span><b style="color:#34d399;">${fmtRp(state.drawerCash)}</b></div>
        <div style="display:flex;justify-content:space-between;"><span>📲 Deposit Bisnis PPOB:</span><b style="color:#fbbf24;">${fmtRp(state.businessPpobBalance)}</b></div>
        <div style="display:flex;justify-content:space-between;"><span>📱 Saldo QRIS Bisnis:</span><b style="color:#c084fc;">${fmtRp(state.qrisBalance)}</b></div>
        <input type="number" id="tfAmountInput" value="500000" step="50000" />
        <div class="grid-2">
          <button class="success" onclick="transferMoney('kasirToMCash')">Kasir ➡️ Dompet MCash</button>
          <button class="primary" onclick="transferMoney('mcashToKasir')">Dompet MCash ➡️ Kasir</button>
          <button class="purple" onclick="transferMoney('kasirToPpob')">Kasir ➡️ Deposit PPOB</button>
          <button onclick="transferMoney('qrisToCash')">Cairkan QRIS ke Kasir</button>
        </div>
        <button onclick="state.qrisLinkedToMCash=!state.qrisLinkedToMCash;saveGame(true);renderRightPanel();">
          ${state.qrisLinkedToMCash ? '🔗 QRIS Tertaut ke M-Cash Pribadi (Aktif)' : '🔓 Tautkan Pembayaran QRIS Langsung ke M-Cash'}
        </button>
      </div>

      <div class="item-row" style="flex-direction:column;align-items:stretch;gap:5px;">
        <b>🏢 Status Ruko (${kios.name}):</b>
        ${!state.kiosOwned ? `<button class="primary" onclick="if(state.walletMCash>=${kios.buyPrice}){state.walletMCash-=${kios.buyPrice};state.kiosOwned=true;saveGame(true);renderRightPanel();updateHudOnly();}">🏠 Beli Hak Milik Ruko (${fmtRp(kios.buyPrice)})</button>` : '<span class="badge ok">✅ HAK MILIK</span>'}
        ${nextKios ? `<button class="purple" onclick="if(state.walletMCash>=${nextKios.monthlyRent*2}){state.walletMCash-=${nextKios.monthlyRent*2};state.kiosLevel=${nextKios.level};while(state.rooms.length<${nextKios.maxRooms}){state.rooms.push({id:state.rooms.length+1,mode:'empty',console:null,tv:null,bed:null,entertainer:null,rate:0,discountPct:0,hasFan:false,hasAC:false,hasCCTV:false,customer:null,timeLeft:0,totalTime:0,cleaningTime:0});}saveGame(true);renderAll(true);}">🚀 Ekspansi ke ${nextKios.name}</button>` : ''}
      </div>

      <div style="font-weight:700;font-size:0.75rem;color:var(--accent);">📒 Buku Kasbon / Hutang Warga (Wajib Bayar + Bunga 20%):</div>
      <div class="scroll-area" style="max-height:110px;">
        ${state.debts.length === 0 ? `<div style="font-size:0.73rem;color:#64748b;">Tidak ada catatan kasbon aktif.</div>` : state.debts.map(d => `<div class="item-row"><span><b>${d.debtorName}</b> (Pokok ${fmtRp(d.principal)})</span><b style="color:#fbbf24;">Tagih: ${fmtRp(d.totalDue)}</b></div>`).join('')}
      </div>
    `;

  } else if (state.mainTab === 'luar') {
    box.innerHTML = `
      <div style="font-size:0.75rem;color:var(--muted);">Lokasi Saat Ini: <b>${state.player.location}</b> • MCash: <b>${fmtRp(state.walletMCash)}</b></div>
      <button class="success" onclick="state.player.location='Di Rental';saveGame(true);renderRightPanel();">🏠 Kembali ke Tempat Rental</button>
      <div class="scroll-area" id="mainScrollArea">
        ${OUTSIDE_ACTIVITIES.map(a => `
          <div class="item-row">
            <div><b>${a.name}</b><br><span style="color:var(--muted);">${a.desc}</span><br><b style="color:#60a5fa;">${fmtRp(a.cost)}</b></div>
            <button class="primary" onclick="doOutsideActivity('${a.id}')">Pergi</button>
          </div>
        `).join('')}
      </div>
    `;

  } else if (state.mainTab === 'life') {
    const pl = state.player;
    box.innerHTML = `
      <div class="item-row" style="flex-direction:column;align-items:stretch;gap:5px;">
        <div style="display:flex;justify-content:space-between;"><b>👩🏻 Profil (${pl.gender}, ${pl.age} Thn)</b><span class="badge" style="color:#f472b6;">${pl.status}</span></div>
        <div style="font-size:0.74rem;color:var(--muted);">Pesona: <b>${pl.charm}/100</b> • Energi: <b>${pl.energy}%</b> • Anak: <b>${pl.children}</b>${pl.pregnant ? ` • 🤰 Hamil (${pl.pregnantWeeks} mgg)` : ''}</div>
        <div class="grid-2">
          <button onclick="pl.kbActive=!pl.kbActive;saveGame(true);renderRightPanel();">${pl.kbActive ? '💊 KB: AKTIF' : '💊 Aktifkan KB'}</button>
          <button onclick="pl.condomActive=!pl.condomActive;saveGame(true);renderRightPanel();">${pl.condomActive ? '🛡️ Kondom: SIAP' : '🛡️ Pakai Kondom'}</button>
        </div>
        <button class="primary" onclick="state.player.energy=100;state.hour=8;state.minute=0;onNewDay();saveGame(true);renderAll(true);">🛏️ Tidur & Lanjut Hari Berikutnya</button>
      </div>
      ${!pl.partner ? `
        <div class="scroll-area">
          ${PARTNERS_LIST.map(pt => `<div class="item-row"><div><b>${pt.name}</b><br><span style="color:var(--muted);">${pt.job} • Syarat Pesona ${pt.charmReq}</span></div><button class="pink" onclick="datePartner('${pt.id}')">Pacaran</button></div>`).join('')}
        </div>
      ` : `
        <div class="item-row" style="flex-direction:column;align-items:stretch;gap:6px;">
          <div><b>💑 Pasangan: ${pl.partner.name}</b> • Kemesraan: <b>${pl.relationship}%</b></div>
          <div class="grid-2">
            <button onclick="if(state.walletMCash>=50000){state.walletMCash-=50000;pl.relationship=Math.min(100,pl.relationship+15);saveGame(true);renderRightPanel();updateHudOnly();}">☕ Kencan (Rp 50rb)</button>
            <button class="pink" onclick="doHB()">❤️ Tombol HB</button>
          </div>
        </div>
        ${pl.status === 'Pacaran' ? `
          <div class="scroll-area" style="max-height:170px;">
            ${WEDDING_PACKAGES.map(w => `<div class="item-row"><div><b>${w.name}</b><br><span style="color:#fbbf24;">${fmtRp(w.cost)}</span></div><button class="success" onclick="marryPartner('${w.id}')">Menikah</button></div>`).join('')}
          </div>
        ` : ''}
      `}
    `;
  }
}

// ==================== CLOUD SYNC ====================
async function saveGame(forceCloud = false) {
  try {
    state.lastSavedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (navigator.onLine && CloudSync.init()) {
      const res = await CloudSync.pushToCloud(state, forceCloud);
      if (res.ok) state.syncStatus = `☁️ Firestore (${CloudSync.syncId})`;
    }
  } catch (e) {}
}

async function syncPullNow() {
  const res = await CloudSync.pullFromCloud();
  if (!res.ok) {
    addLog('⚠️ Data cloud belum ditemukan atau offline.');
    return;
  }
  Object.assign(state, res.state);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  addLog(`✅ Progres berhasil dimuat dari Firestore (${CloudSync.syncId})!`);
  closeCustomModal(); renderAll(true);
}

function openCloudSyncModal() {
  showCustomModal(
    '☁️ Sinkronisasi Cloud Firestore (Laptop ↔ HP)',
    `<label style="font-size:0.76rem;color:var(--muted);">Sync ID (Gunakan ID yang sama di Laptop & HP):</label>
     <div style="display:flex;gap:6px;">
       <input type="text" id="inpSyncId" value="${CloudSync.syncId}" />
       <button class="primary" onclick="if(CloudSync.setSyncId(document.getElementById('inpSyncId').value)){openCloudSyncModal();}">Set ID</button>
     </div>
     <div class="grid-2">
       <button class="success" onclick="saveGame(true);addLog('☁️ Tersimpan ke Firestore!');closeCustomModal();">⬆️ Simpan ke Cloud</button>
       <button class="purple" onclick="syncPullNow()">⬇️ Muat dari Cloud</button>
     </div>`,
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
    addLog('🎮 Selamat datang di <b>Rental Simulator by Oneilverse</b>! Mulai dengan 5 Room Kosong.');
    openModeSelectModal();
  } else {
    closeCustomModal();
    addLog('💾 Progres permainan dimuat.');
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
