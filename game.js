// RENTAL SIMULATOR BY ONEILVERSE - V3.0 ENGINE
// Fix: No scroll reset, Pause button, Dev (100jt) vs Release (30jt) mode, Custom In-Game Modals,
// M-Banking vs Business PPOB Balance, Room AC/Fan/CCTV, Home PS Rental, Offline+Firestore Sync, Mobile Responsive.

const STORAGE_KEY = 'oneilverse_rental_sim_v3';

const state = {
  gameMode: 'dev', // 'dev' (100jt) | 'release' (30jt)
  rentalName: 'Rental Room Oneilverse',
  vip2x: false,
  paused: false,
  speed: 1, // 1x, 2x, 4x, 8x

  // Waktu mulai: 1 Januari 2020, 08:00 (1 jam = 1 menit nyata pada 1x)
  year: 2020,
  month: 1,
  day: 1,
  totalDays: 1,
  hour: 8,
  minute: 0,
  isOpen: false,

  // Keuangan Terpisah: Laci Kasir, M-Banking Pribadi, QRIS, Deposit Saldo Bisnis PPOB
  drawer: {
    100000: 5,
    50000: 6,
    20000: 10,
    10000: 15,
    5000: 10,
    2000: 15,
    1000: 15,
    500: 10,
    100: 10
  },
  mbankingBalance: 98900000, // M-Banking Pribadi (Total awal Dev = 100jt)
  businessPpobBalance: 1000000, // Saldo Agen Bisnis (Pulsa, E-Wallet, Token, Transfer)
  qrisBalance: 0,

  // Listrik kWh & Kios
  kwh: 60.0,
  kiosLevel: 1,
  kiosOwned: false,

  // Stok Warung & Perlengkapan
  stock: {
    popmie: 6,
    esteh: 8,
    stikPS: 2,
    kbPill: 1,
    condom: 2
  },
  staffHired: false,
  staffSalary: 1400000,

  // Wi-Fi & Hotspot
  wifi: {
    provider: null,
    hotspotOpen: false,
    voucherPrice: 3000,
    voucherHours: 3,
    activeUsers: 0
  },

  // Inventaris & Room Rental
  inventoryConsoles: [],
  inventoryTVs: [],
  booths: [], // Room rental
  queue: [],
  loyalCustomers: [], // Pelanggan tetap hasil rekomendasi game
  recommendedGames: [], // Daftar game yang direkomendasikan pelanggan
  selectedCustomerId: null,
  selectedBoothForGames: null,

  // Sewa PS Bawa Pulang (Home Rental)
  homeRental: {
    enabled: false,
    slots: 2,
    activeRentals: [] // { id, consoleUid, consoleName, customerName, daysLeft, dailyRate }
  },

  // Bisnis Jasa Sewa & Penginapan Bertahap
  unlockedBusinesses: [],

  // Karakter Utama (Cewek 18 Tahun)
  player: {
    age: 18,
    gender: 'Perempuan',
    energy: 100,
    charm: 30,
    reputation: 4.3,
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

  // UI States
  mainTab: 'toko',
  subTab: 'konsol',
  mobileView: 'rooms', // 'queue' | 'rooms' | 'menu'
  activeCheckout: null,
  givenChange: {},
  syncStatus: 'Offline (Tersimpan Lokal)'
};

function getDrawerTotal() {
  return DENOMINATIONS.reduce((sum, d) => sum + d * (state.drawer[d] || 0), 0);
}

function fmtRp(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

function setDrawerExact(totalAmount) {
  let rem = Math.max(0, Math.round(totalAmount));
  DENOMINATIONS.forEach(d => state.drawer[d] = 0);
  for (const d of DENOMINATIONS) {
    const cnt = Math.floor(rem / d);
    if (cnt > 0) {
      state.drawer[d] = cnt;
      rem -= cnt * d;
    }
  }
}

function addCashToDrawer(amount) {
  let rem = Math.round(amount);
  for (const d of DENOMINATIONS) {
    const cnt = Math.floor(rem / d);
    if (cnt > 0) {
      state.drawer[d] = (state.drawer[d] || 0) + cnt;
      rem -= cnt * d;
    }
  }
}

function deductCashFromDrawer(amount) {
  const cur = getDrawerTotal();
  setDrawerExact(Math.max(0, cur - amount));
}

// ==================== INITIALIZATION & MODE SELECTION ====================
function initStarterRooms() {
  state.booths = [];
  const c1 = { uid: 'u1', ...CONSOLE_CATALOG[0], games: [PS1_GAMES[0].id, PS1_GAMES[1].id], stickHp: 100, repairing: false };
  const t1 = { uid: 't1', ...TV_CATALOG[1] }; // TV LCD LG 32" (Tanpa TV Tabung)
  const c2 = { uid: 'u2', ...CONSOLE_CATALOG[2], games: [PS2_GAMES[0].id, PS2_GAMES[1].id], stickHp: 100, repairing: false };
  const t2 = { uid: 't2', ...TV_CATALOG[2] }; // TV LED TCL 32"

  state.booths.push({
    id: 1, console: c1, tv: t1,
    rate: 2500, discountPct: 0,
    hasFan: true, hasAC: false, hasCCTV: false,
    customer: null, timeLeft: 0, totalTime: 0, snackOrder: null
  });
  state.booths.push({
    id: 2, console: c2, tv: t2,
    rate: 3500, discountPct: 0,
    hasFan: true, hasAC: false, hasCCTV: false,
    customer: null, timeLeft: 0, totalTime: 0, snackOrder: null
  });
}

function applyGameMode(mode) {
  state.gameMode = mode;
  state.year = 2020; state.month = 1; state.day = 1; state.totalDays = 1;
  state.hour = 8; state.minute = 0;
  state.isOpen = false;
  state.kiosLevel = 1; state.kiosOwned = false;
  state.inventoryConsoles = []; state.inventoryTVs = [];
  state.unlockedBusinesses = [];
  state.homeRental = { enabled: false, slots: 2, activeRentals: [] };
  initStarterRooms();

  if (mode === 'dev') {
    setDrawerExact(2000000);
    state.mbankingBalance = 96000000;
    state.businessPpobBalance = 2000000;
    addLog('🛠️ <b>Mode Developer Aktif</b> — Total Modal Utama: <b>Rp 100.000.000</b>.');
  } else {
    setDrawerExact(1500000);
    state.mbankingBalance = 27500000;
    state.businessPpobBalance = 1000000;
    addLog('🚀 <b>Mode Rilis Pemain Aktif</b> — Total Modal Awal: <b>Rp 30.000.000</b>.');
  }
  closeCustomModal();
  saveGame(true);
  renderAll(true);
}

// ==================== CUSTOM IN-GAME MODAL (NO BROWSER POPUP!) ====================
function showCustomModal(title, bodyHtml, footerHtml) {
  document.getElementById('customModalTitle').innerHTML = title;
  document.getElementById('customModalBody').innerHTML = bodyHtml;
  document.getElementById('customModalFooter').innerHTML = footerHtml || '';
  document.getElementById('customModalBackdrop').style.display = 'flex';
}

function closeCustomModal() {
  document.getElementById('customModalBackdrop').style.display = 'none';
}

function openEditRentalNameModal() {
  showCustomModal(
    '✏️ Ubah Nama Tempat Rental',
    `<label style="font-size:0.78rem;color:var(--muted);">Nama Usaha Rental Kamu:</label>
     <input type="text" id="inputRentalName" value="${state.rentalName}" maxlength="32" />`,
    `<button onclick="closeCustomModal()">Batal</button>
     <button class="primary" onclick="saveRentalName()">Simpan Nama</button>`
  );
}

function saveRentalName() {
  const val = document.getElementById('inputRentalName').value.trim();
  if (val.length >= 3) {
    state.rentalName = val;
    addLog(`✏️ Nama rental diubah menjadi <b>${state.rentalName}</b>.`);
    closeCustomModal();
    saveGame();
    updateHudOnly();
  }
}

function openModeSelectModal() {
  showCustomModal(
    '⚙️ Mode Modal Permainan (Start 2020)',
    `<div style="font-size:0.8rem;color:var(--muted);line-height:1.45;">
      Pilih skenario modal awal permainan:<br>
      • <b>Mode Developer (Rp 100 Juta):</b> Untuk pengujian fitur lengkap oleh developer.<br>
      • <b>Mode Rilis Pemain (Rp 30 Juta):</b> Pengalaman resmi saat game dirilis ke pemain.
    </div>`,
    `<button class="purple" onclick="applyGameMode('dev')">🛠️ Developer (100 Juta)</button>
     <button class="success" onclick="applyGameMode('release')">🎮 Rilis Pemain (30 Juta)</button>`
  );
}

function openVip2xModal() {
  if (state.vip2x) {
    showCustomModal(
      '🌟 Status VIP Pass 2x Boost',
      `<p style="font-size:0.82rem;margin:0;">Mode <b>Pengali 2x</b> sedang aktif. Semua pendapatan rental, warung, Wi-Fi, PPOB & penginapan dikali 2.</p>`,
      `<button class="danger" onclick="state.vip2x=false;closeCustomModal();saveGame();updateHudOnly();">Nonaktifkan</button>
       <button class="primary" onclick="closeCustomModal()">Tutup</button>`
    );
    return;
  }
  showCustomModal(
    '🌟 Aktifkan VIP Pass: Pengali 2x',
    `<div style="font-size:0.82rem;line-height:1.5;">
      Fitur berbayar untuk versi rilis:<br>
      • Seluruh pemasukan otomatis dikali <b>2x Lipat</b>.<br>
      • Harga Lisensi Rilis: <b>Rp 29.000</b>.
    </div>`,
    `<button onclick="closeCustomModal()">Nanti Saja</button>
     <button class="primary" onclick="state.vip2x=true;addLog('🌟 <b>VIP Pass 2x Boost AKTIF!</b>');closeCustomModal();saveGame();updateHudOnly();">✅ Aktifkan 2x Boost</button>`
  );
}

// ==================== KONTROL PAUSE, SPEED & MOBILE NAV ====================
function togglePause() {
  state.paused = !state.paused;
  updateHudOnly();
}

function setSpeed(s) {
  state.speed = s;
  state.paused = false;
  updateHudOnly();
}

function switchMobileView(view, btn) {
  state.mobileView = view;
  document.querySelectorAll('.mob-nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.mobile-section').forEach(sec => {
    sec.classList.toggle('active-mobile', sec.dataset.mob === view);
  });
}

function toggleShop() {
  if (!state.isOpen && state.player.energy < 10) {
    addLog('⚠️ Energi terlalu lelah! Tidur dulu di menu Hidup.');
    return;
  }
  state.isOpen = !state.isOpen;
  if (!state.isOpen) {
    state.queue = [];
    state.selectedCustomerId = null;
  }
  addLog(state.isOpen ? `🟢 <b>${state.rentalName}</b> resmi BUKA!` : '🔴 Pintu rolling door ditutup.');
  saveGame();
  renderAll(true);
}

// ==================== GAME LOOP (ANTI SCROLL JUMP!) ====================
setInterval(() => {
  if (state.paused) return;
  for (let i = 0; i < state.speed; i++) {
    tickOneMinute();
  }
  // Hanya update HUD & daftar dinamis (antrean & room), JANGAN re-render panel kanan yang sedang di-scroll!
  updateHudOnly();
  renderQueue();
  renderBooths();
}, 1000);

// Auto-save offline setiap 10 detik + sinkronisasi Firestore jika online
setInterval(() => {
  saveGame();
}, 10000);

function tickOneMinute() {
  if (!state.isOpen && state.booths.every(b => !b.customer)) return;

  state.minute += 1;
  if (state.minute >= 60) {
    state.minute = 0;
    state.hour += 1;
    state.player.energy = Math.max(0, state.player.energy - 2);
    if (state.wifi.activeUsers > 0) state.wifi.activeUsers = Math.max(0, state.wifi.activeUsers - 2);
  }
  if (state.hour >= 24) {
    state.hour = 0;
    onNewDay();
  }

  // Konsumsi listrik kWh (Konsol + TV + AC/Kipas + CCTV + Wi-Fi)
  let totalWatt = state.wifi.provider ? 25 : 0;
  state.booths.forEach(b => {
    if (b.hasCCTV) totalWatt += 12;
    if (b.customer) {
      totalWatt += (b.console ? b.console.watt : 0) + (b.tv ? b.tv.watt : 0);
      if (b.hasAC) totalWatt += 350;
      else if (b.hasFan) totalWatt += 45;
    }
  });

  if (totalWatt > 0) {
    const kwhUsed = (totalWatt / 1000) / 60;
    state.kwh = Math.max(0, +(state.kwh - kwhUsed).toFixed(4));
    if (state.kwh <= 0) {
      addLog('⚡ <b>TOKEN PLN HABIS (0 kWh)!</b> Semua room mati listrik!');
      state.booths.forEach(b => { if (b.customer) { b.customer = null; b.timeLeft = 0; } });
    }
  }

  // Sesi bermain di tiap room
  state.booths.forEach(b => {
    if (!b.customer) return;
    b.timeLeft -= 1;

    if (b.console && b.console.stickHp > 0 && Math.random() < 0.004) {
      b.console.stickHp = Math.max(0, b.console.stickHp - 15);
      if (b.console.stickHp === 0) {
        addLog(`🎮💥 Stik di <b>Room #${b.id}</b> rusak! Segera ganti stik cadangan atau servis.`);
      }
    }

    if (!b.snackOrder && Math.random() < 0.005) {
      b.snackOrder = Math.random() < 0.55 ? 'Pop Mie' : 'Es Teh';
      addLog(`🍜 Room #${b.id} (${b.customer.name}) pesan <b>${b.snackOrder}</b>!`);
    }

    if (b.timeLeft <= 0 && !state.activeCheckout) {
      triggerCheckout(b);
    }
  });

  // Pelanggan datang
  if (state.isOpen && state.hour >= 8 && state.hour <= 22 && state.queue.length < 5 && Math.random() < 0.075) {
    spawnCustomer();
  }

  // Kesabaran antrean (Jika pergi karena game belum ada -> TIDAK menurunkan reputasi!)
  state.queue.forEach(c => c.patience -= 1);
  const left = state.queue.filter(c => c.patience <= 0);
  if (left.length > 0) {
    state.queue = state.queue.filter(c => c.patience > 0);
    left.forEach(c => {
      if (!c.hasMatchingGame) {
        addLog(`👋 ${c.name} pamit pulang karena game <b>${c.wantedGameTitle}</b> belum tersedia (Reputasi tetap aman).`);
      } else {
        addLog(`⏳ ${c.name} pulang karena room sedang penuh semua.`);
      }
    });
  }

  // Pendapatan Voucher Wi-Fi
  if (state.isOpen && state.wifi.provider && state.wifi.hotspotOpen && Math.random() < 0.025) {
    const mult = state.vip2x ? 2 : 1;
    const income = state.wifi.voucherPrice * mult;
    addCashToDrawer(income);
    state.wifi.activeUsers = Math.min(30, state.wifi.activeUsers + 1);
    addLog(`📶 Voucher Wi-Fi terjual (${state.wifi.voucherHours} jam) +${fmtRp(income)} ke Laci.`);
  }

  // Transaksi Pelanggan PPOB (Pulsa, E-Wallet, Token PLN, Transfer) -> Memotong Saldo Bisnis PPOB, Uang Pokok + Untung Masuk Laci!
  if (state.isOpen && state.businessPpobBalance >= 60000 && Math.random() < 0.02) {
    processAutoPpobTransaction();
  }
}

function processAutoPpobTransaction() {
  const validProds = PPOB_PRODUCTS.filter(p => state.businessPpobBalance >= (p.nominal + p.adminProvider));
  if (validProds.length === 0) return;
  const prod = validProds[Math.floor(Math.random() * validProds.length)];

  const modalTerpakai = prod.nominal + prod.adminProvider;
  const baseProfit = prod.hargaJual - modalTerpakai;
  const mult = state.vip2x ? 2 : 1;
  const totalMasukLaci = modalTerpakai + (baseProfit * mult);

  state.businessPpobBalance -= modalTerpakai;
  addCashToDrawer(totalMasukLaci);

  const adminTxt = prod.adminProvider > 0 ? `Admin Operator ${fmtRp(prod.adminProvider)}` : 'Bebas Admin';
  addLog(
    `📲 Transaksi <b>${prod.name}</b> (${adminTxt}) • Saldo Bisnis -${fmtRp(modalTerpakai)}, Laci +${fmtRp(totalMasukLaci)} (Untung ${fmtRp(baseProfit * mult)}).`
  );
}

function onNewDay() {
  state.day += 1;
  state.totalDays += 1;
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

  // Update Sewa PS Bawa Pulang (Home Rental)
  if (state.homeRental.activeRentals.length > 0) {
    const mult = state.vip2x ? 2 : 1;
    state.homeRental.activeRentals.forEach(r => {
      r.daysLeft -= 1;
      const earn = r.dailyRate * mult;
      state.mbankingBalance += earn;
      addLog(`🏠 Setoran Sewa PS Bawa Pulang (<b>${r.consoleName}</b> oleh ${r.customerName}): +${fmtRp(earn)} ke M-Banking.`);
    });
    const finished = state.homeRental.activeRentals.filter(r => r.daysLeft <= 0);
    if (finished.length > 0) {
      finished.forEach(f => addLog(`📦 Unit sewa <b>${f.consoleName}</b> telah dikembalikan oleh ${f.customerName}.`));
      state.homeRental.activeRentals = state.homeRental.activeRentals.filter(r => r.daysLeft > 0);
    }
  }

  // Pendapatan Harian Unit Bisnis Jasa Sewa & Penginapan
  if (state.unlockedBusinesses.length > 0) {
    const mult = state.vip2x ? 2 : 1;
    state.unlockedBusinesses.forEach(bizId => {
      const biz = EXPANSION_BUSINESSES.find(x => x.id === bizId);
      if (biz) {
        const [minI, maxI] = biz.dailyIncomeRange;
        const inc = Math.floor(minI + Math.random() * (maxI - minI)) * mult;
        state.mbankingBalance += inc;
        addLog(`🏨 Pendapatan harian <b>${biz.name}</b>: +${fmtRp(inc)} masuk M-Banking.`);
      }
    });
  }

  // Biaya harian acak setelah menikah
  if (state.player.status === 'Menikah' && state.player.partner) {
    const pkg = WEDDING_PACKAGES.find(w => w.id === state.player.partner.weddingId) || WEDDING_PACKAGES[0];
    const [minC, maxC] = pkg.dailyCostRange;
    const dailyExpense = Math.floor(minC + Math.random() * (maxC - minC));
    state.mbankingBalance = Math.max(0, state.mbankingBalance - dailyExpense);
    addLog(`💍 Kebutuhan rumah tangga harian bersama ${state.player.partner.name}: <b>-${fmtRp(dailyExpense)}</b>.`);
  }

  if (state.player.pregnant) {
    state.player.pregnantWeeks += 1;
    if (state.player.pregnantWeeks >= 36) {
      state.player.pregnant = false;
      state.player.pregnantWeeks = 0;
      state.player.children += 1;
      addLog(`👶 Selamat! Buah hati lahir dengan sehat! Total anak: ${state.player.children}.`);
    }
  }
}

function onNewMonth() {
  const kios = KIOS_TIERS.find(k => k.level === state.kiosLevel);
  if (!state.kiosOwned) {
    state.mbankingBalance = Math.max(0, state.mbankingBalance - kios.monthlyRent);
    addLog(`🏠 Sewa bulanan ${kios.name} (-${fmtRp(kios.monthlyRent)}) dibayar dari M-Banking.`);
  }
  if (state.wifi.provider) {
    state.mbankingBalance = Math.max(0, state.mbankingBalance - state.wifi.provider.monthly);
    addLog(`🌐 Tagihan bulanan ${state.wifi.provider.name} (-${fmtRp(state.wifi.provider.monthly)}) dibayar.`);
  }
  if (state.staffHired) {
    state.mbankingBalance = Math.max(0, state.mbankingBalance - state.staffSalary);
    addLog(`🧑‍💼 Gaji bulanan karyawan kasir (-${fmtRp(state.staffSalary)}) dibayar.`);
  }
}

// ==================== PELANGGAN, REKOMENDASI GAME & PELANGGAN TETAP ====================
function spawnCustomer() {
  const eraGames = ALL_GAMES.filter(g => g.year <= state.year);
  const wantedGame = eraGames[Math.floor(Math.random() * eraGames.length)];

  const names = ['Rizky', 'Bima', 'Aldi', 'Dika', 'Fajar', 'Galih', 'Hendra', 'Ilham', 'Kevin', 'Nando'];
  const archetypes = [
    { role: 'Bocil SD', icon: '🧒', honesty: 'quiet', hours: 1 },
    { role: 'Anak SMP', icon: '🎒', honesty: 'greedy', hours: 2 },
    { role: 'Mahasiswa', icon: '🎓', honesty: 'honest', hours: 3 },
    { role: 'Karyawan', icon: '👨🏻', honesty: 'honest', hours: 2 },
    { role: 'Driver Ojol', icon: '🛵', honesty: 'quiet', hours: 1 }
  ];

  // Cek apakah ada pelanggan tetap yang kembali
  const isLoyal = state.loyalCustomers.length > 0 && Math.random() < 0.35;
  let custName = '';
  let arch = archetypes[Math.floor(Math.random() * archetypes.length)];
  let chosenGame = wantedGame;

  if (isLoyal) {
    const loyal = state.loyalCustomers[Math.floor(Math.random() * state.loyalCustomers.length)];
    custName = `${loyal.name} ⭐ (Pelanggan Tetap)`;
    const fav = ALL_GAMES.find(g => g.id === loyal.favGameId);
    if (fav) chosenGame = fav;
  } else {
    custName = `${names[Math.floor(Math.random() * names.length)]} (${arch.role})`;
  }

  const matchingRooms = state.booths.filter(b => b.console && b.console.games.includes(chosenGame.id));
  const hasMatchingGame = matchingRooms.length > 0;

  const cust = {
    id: 'c_' + Date.now() + Math.random(),
    name: custName,
    icon: isLoyal ? '🌟' : arch.icon,
    honesty: arch.honesty,
    hours: isLoyal ? arch.hours + 1 : arch.hours,
    wantedGameId: chosenGame.id,
    wantedGameTitle: chosenGame.title,
    wantedPlatform: chosenGame.platform,
    hasMatchingGame,
    isLoyal,
    patience: 45
  };

  state.queue.push(cust);

  if (!hasMatchingGame) {
    // Catat sebagai rekomendasi game dari pelanggan (tanpa mengurangi reputasi!)
    if (!state.recommendedGames.some(r => r.gameId === chosenGame.id)) {
      state.recommendedGames.push({
        gameId: chosenGame.id,
        title: chosenGame.title,
        platform: chosenGame.platform,
        requesterName: cust.name
      });
    }
    addLog(
      `${cust.icon} <b>${cust.name}</b> ingin main <b>${chosenGame.title} (${chosenGame.platform})</b>, tapi belum ada. Ia merekomendasikanmu membeli game itu (atau bisa main game lain yang tersedia).`
    );
  } else {
    addLog(`${cust.icon} <b>${cust.name}</b> datang mau main <b>${chosenGame.title}</b> (${cust.hours} jam).`);
  }
}

function selectCustomer(id) {
  state.selectedCustomerId = (state.selectedCustomerId === id) ? null : id;
  renderQueue();
  renderBooths();
}

function seatCustomer(boothId, allowAltGame = false) {
  const booth = state.booths.find(b => b.id === boothId);
  const idx = state.queue.findIndex(c => c.id === state.selectedCustomerId);
  if (!booth || idx === -1) return;
  if (state.kwh <= 0) return addLog('⚡ Token PLN 0 kWh! Isi token dulu.');
  if (!booth.console || !booth.tv) return addLog('⚠️ Room belum lengkap.');
  if (booth.console.stickHp <= 0 || booth.console.repairing) return addLog('🔧 Stik room ini sedang rusak/diservis!');
  if (booth.console.games.length === 0) return addLog('❌ Room ini belum punya game sama sekali! Beli game dulu.');

  const cust = state.queue[idx];
  const exactMatch = booth.console.games.includes(cust.wantedGameId);

  if (!exactMatch && !allowAltGame) {
    // Tawarkan pilihan: main game lain yang ada di room ini
    const altGameId = booth.console.games[0];
    const altGame = ALL_GAMES.find(g => g.id === altGameId);
    showCustomModal(
      '🎮 Game Tidak Tersedia di Room Ini',
      `<p style="font-size:0.82rem;margin:0;line-height:1.5;">
        <b>${cust.name}</b> awalnya mencari <b>${cust.wantedGameTitle}</b>, tapi di <b>Room #${booth.id}</b> tidak ada.<br><br>
        Apakah kamu mau menawarkannya main game lain yang tersedia di room ini (<b>${altGame ? altGame.title : 'Game Tersedia'}</b>)?
      </p>`,
      `<button onclick="closeCustomModal()">Batal</button>
       <button class="primary" onclick="closeCustomModal();seatCustomer(${booth.id}, true);">✅ Tawarkan Main Game Lain</button>`
    );
    return;
  }

  state.queue.splice(idx, 1);
  state.selectedCustomerId = null;
  const playedGameTitle = exactMatch
    ? cust.wantedGameTitle
    : (ALL_GAMES.find(g => g.id === booth.console.games[0])?.title || 'Game Tersedia');

  booth.customer = { ...cust, playedGameTitle };
  booth.totalTime = cust.hours * 60;
  booth.timeLeft = cust.hours * 60;
  booth.snackOrder = null;

  addLog(`🎮 ${cust.icon} <b>${cust.name}</b> mulai main <b>${playedGameTitle}</b> di <b>Room #${booth.id}</b>.`);
  renderAll(false);
}

// ==================== BILLING ROOM: TARIF, DISKON, GRATIS, AC, KIPAS, CCTV ====================
function openRoomBillingModal(boothId) {
  const b = state.booths.find(x => x.id === boothId);
  if (!b) return;
  const netRate = Math.round(b.rate * (1 - b.discountPct / 100));

  showCustomModal(
    `🏷️ Pengaturan Billing & Fasilitas Room #${b.id}`,
    `<div style="font-size:0.8rem;line-height:1.5;background:#090e1a;padding:9px;border-radius:8px;">
      Perangkat: <b>${b.console.name}</b> + <b>${b.tv.name}</b><br>
      Tarif Normal: <b>${fmtRp(b.rate)}/jam</b> • Tarif Aktif: <b style="color:#34d399;">${netRate === 0 ? 'GRATIS (PROMO)' : fmtRp(netRate) + '/jam'}</b>
    </div>
    <div style="font-size:0.78rem;font-weight:700;margin-top:4px;">Pilih Diskon / Gratis Promo Billing:</div>
    <div class="grid-3">
      <button class="${b.discountPct === 0 ? 'primary' : ''}" onclick="setRoomDiscount(${b.id}, 0)">Normal (0%)</button>
      <button class="${b.discountPct === 25 ? 'primary' : ''}" onclick="setRoomDiscount(${b.id}, 25)">Diskon 25%</button>
      <button class="${b.discountPct === 50 ? 'primary' : ''}" onclick="setRoomDiscount(${b.id}, 50)">Diskon 50%</button>
      <button class="${b.discountPct === 75 ? 'primary' : ''}" onclick="setRoomDiscount(${b.id}, 75)">Diskon 75%</button>
      <button class="${b.discountPct === 100 ? 'success' : ''}" onclick="setRoomDiscount(${b.id}, 100)">🎁 GRATIS 100%</button>
    </div>
    <div style="font-size:0.78rem;font-weight:700;margin-top:6px;">Fasilitas Room (Menaikkan Tarif & Kenyamanan):</div>
    <div style="display:flex;flex-direction:column;gap:6px;">
      <div class="item-row">
        <span>🌀 Kipas Angin Dinding Miyako (Rp 250.000)</span>
        <button ${b.hasFan ? 'disabled' : ''} onclick="buyRoomFacility(${b.id}, 'fan')">${b.hasFan ? '✅ Terpasang' : 'Pasang'}</button>
      </div>
      <div class="item-row">
        <span>❄️ AC Split 1/2 PK Sharp/Daikin (Rp 2.850.000 • +Rp 2.000/jam)</span>
        <button ${b.hasAC ? 'disabled' : ''} onclick="buyRoomFacility(${b.id}, 'ac')">${b.hasAC ? '✅ Terpasang' : 'Pasang AC'}</button>
      </div>
      <div class="item-row">
        <span>📹 Kamera CCTV Room Hikvision (Rp 450.000 • Anti Maling Stik)</span>
        <button ${b.hasCCTV ? 'disabled' : ''} onclick="buyRoomFacility(${b.id}, 'cctv')">${b.hasCCTV ? '✅ Terpasang' : 'Pasang CCTV'}</button>
      </div>
    </div>`,
    `<button class="primary" onclick="closeCustomModal()">Selesai</button>`
  );
}

function setRoomDiscount(boothId, pct) {
  const b = state.booths.find(x => x.id === boothId);
  if (!b) return;
  b.discountPct = pct;
  addLog(`🏷️ Billing <b>Room #${b.id}</b> diatur ke <b>${pct === 100 ? 'GRATIS PROMO' : 'Diskon ' + pct + '%'}</b>.`);
  saveGame();
  openRoomBillingModal(boothId);
  renderBooths();
}

function buyRoomFacility(boothId, type) {
  const b = state.booths.find(x => x.id === boothId);
  if (!b) return;
  const costs = { fan: 250000, ac: 2850000, cctv: 450000 };
  const cost = costs[type];
  if (state.mbankingBalance < cost && getDrawerTotal() < cost) {
    return addLog('❌ Saldo M-Banking / Laci kurang untuk pasang fasilitas room!');
  }
  if (state.mbankingBalance >= cost) state.mbankingBalance -= cost;
  else deductCashFromDrawer(cost);

  if (type === 'fan') { b.hasFan = true; addLog(`🌀 Kipas angin terpasang di <b>Room #${b.id}</b>.`); }
  if (type === 'ac') { b.hasAC = true; b.rate += 2000; addLog(`❄️ AC Split terpasang di <b>Room #${b.id}</b> (+Rp 2.000/jam).`); }
  if (type === 'cctv') { b.hasCCTV = true; addLog(`📹 CCTV terpasang di <b>Room #${b.id}</b>.`); }

  saveGame();
  openRoomBillingModal(boothId);
  renderAll(false);
}

// ==================== KASIR PECAHAN RUPIAH ====================
function triggerCheckout(booth) {
  const cust = booth.customer;
  const hourly = Math.round(booth.rate * (1 - booth.discountPct / 100));
  const roomBonus = (booth.hasAC ? 500 : 0) + (booth.hasCCTV ? 200 : 0);
  const baseBill = (hourly + (hourly > 0 ? roomBonus : 0)) * cust.hours + (cust.snackBill || 0);
  const mult = state.vip2x ? 2 : 1;
  const finalBill = Math.max(0, baseBill * mult);

  if (finalBill === 0) {
    addLog(`🎁 Sesi GRATIS promo selesai untuk <b>${cust.name}</b>! Reputasi meningkat.`);
    state.player.reputation = Math.min(5.0, +(state.player.reputation + 0.08).toFixed(2));
    booth.customer = null; booth.timeLeft = 0;
    return;
  }

  if (state.staffHired) {
    addCashToDrawer(finalBill);
    addLog(`🧑‍💼 Karyawan kasir menerima pembayaran pas <b>${fmtRp(finalBill)}</b> dari ${cust.name}.`);
    booth.customer = null; booth.timeLeft = 0;
    return;
  }

  if (Math.random() < 0.35) {
    state.qrisBalance += finalBill;
    addLog(`📱 ${cust.name} bayar via <b>QRIS</b> sebesar <b>${fmtRp(finalBill)}</b>.`);
    booth.customer = null; booth.timeLeft = 0;
    return;
  }

  const paidNotes = generateCustomerPayment(finalBill);
  const totalPaid = paidNotes.reduce((a, b) => a + b, 0);
  const exactChange = totalPaid - finalBill;
  paidNotes.forEach(n => { state.drawer[n] = (state.drawer[n] || 0) + 1; });

  state.activeCheckout = { boothId: booth.id, cust, finalBill, totalPaid, exactChange };
  state.givenChange = {};
  DENOMINATIONS.forEach(d => state.givenChange[d] = 0);

  document.getElementById('cashierModal').style.display = 'flex';
  renderCashierModal();
}

function generateCustomerPayment(bill) {
  if (bill <= 5000) return [5000];
  if (bill <= 10000) return [10000];
  if (bill <= 20000) return [20000];
  if (bill <= 50000) return [50000];
  if (bill <= 100000) return [100000];
  return Array(Math.ceil(bill / 100000)).fill(100000);
}

function adjustChange(denom, delta) {
  const cur = state.givenChange[denom] || 0;
  const avail = state.drawer[denom] || 0;
  const next = cur + delta;
  if (next < 0 || next > avail) return;
  state.givenChange[denom] = next;
  renderCashierModal();
}

function renderCashierModal() {
  const c = state.activeCheckout;
  if (!c) return;
  const givenTotal = DENOMINATIONS.reduce((s, d) => s + d * (state.givenChange[d] || 0), 0);
  document.getElementById('cashierSummary').innerHTML = `
    Pelanggan: <b>${c.cust.icon} ${c.cust.name}</b><br>
    Total Tagihan: <b>${fmtRp(c.finalBill)}</b> | Dibayar: <b>${fmtRp(c.totalPaid)}</b><br>
    Kembalian Seharusnya: <b style="color:#fbbf24;">${fmtRp(c.exactChange)}</b><br>
    Kembalian Disusun: <b style="color:${givenTotal === c.exactChange ? '#34d399' : '#60a5fa'};">${fmtRp(givenTotal)}</b>
  `;
  const grid = document.getElementById('denomGrid');
  grid.innerHTML = '';
  DENOMINATIONS.forEach(d => {
    const count = state.givenChange[d] || 0;
    const stock = state.drawer[d] || 0;
    grid.innerHTML += `
      <div class="denom-btn">
        <b>${fmtRp(d)}</b>
        <small>Laci: ${stock}</small>
        <div style="display:flex;gap:6px;align-items:center;margin-top:4px;">
          <button onclick="adjustChange(${d}, -1)" ${count <= 0 ? 'disabled' : ''}>-</button>
          <b>${count}</b>
          <button onclick="adjustChange(${d}, 1)" ${count >= stock ? 'disabled' : ''}>+</button>
        </div>
      </div>`;
  });
}

function submitCashierChange() {
  const c = state.activeCheckout;
  if (!c) return;
  const givenTotal = DENOMINATIONS.reduce((s, d) => s + d * (state.givenChange[d] || 0), 0);
  const diff = givenTotal - c.exactChange;
  DENOMINATIONS.forEach(d => { state.drawer[d] -= (state.givenChange[d] || 0); });

  if (diff === 0) {
    addLog(`💵 Kembalian pas <b>${fmtRp(givenTotal)}</b>! ${c.cust.name} puas.`);
    state.player.reputation = Math.min(5.0, +(state.player.reputation + 0.03).toFixed(2));
  } else if (diff < 0) {
    const kurang = Math.abs(diff);
    if (c.cust.honesty === 'honest' || c.cust.honesty === 'greedy') {
      addLog(`🗣️ "${c.cust.name}: Kak, kembaliannya kurang ${fmtRp(kurang)}!" Kamu nombokin.`);
      deductCashFromDrawer(kurang);
    } else {
      addLog(`😶 ${c.cust.name} diam saja saat kembaliannya kurang ${fmtRp(kurang)}.`);
    }
  } else {
    if (c.cust.honesty === 'honest') {
      addCashToDrawer(diff);
      addLog(`😇 ${c.cust.name} jujur mengembalikan kelebihan kembalian <b>${fmtRp(diff)}</b>!`);
    } else {
      addLog(`💸 Kembalian kelebihan <b>${fmtRp(diff)}</b> dan ${c.cust.name} langsung pergi!`);
    }
  }

  const booth = state.booths.find(b => b.id === c.boothId);
  if (booth) { booth.customer = null; booth.timeLeft = 0; }
  state.activeCheckout = null;
  document.getElementById('cashierModal').style.display = 'none';
  saveGame();
  renderAll(false);
}

// ==================== KELOLA GAME PER-UNIT & PELANGGAN TETAP ====================
function openUnitGamesModal(boothId) {
  state.selectedBoothForGames = boothId;
  document.getElementById('unitGamesModal').style.display = 'flex';
  renderUnitGamesModal();
}

function renderUnitGamesModal() {
  const booth = state.booths.find(b => b.id === state.selectedBoothForGames);
  if (!booth || !booth.console) return;
  const con = booth.console;

  let usedGB = 0;
  if (con.media === 'storage') {
    con.games.forEach(gid => {
      const g = ALL_GAMES.find(x => x.id === gid);
      if (g) usedGB += g.sizeGB;
    });
  }

  document.getElementById('unitGamesHeader').innerHTML = `
    <b>Room #${booth.id} — ${con.name}</b><br>
    <span style="font-size:0.76rem;color:#94a3b8;">
      ${con.media === 'storage' ? `Kapasitas Storage: <b>${usedGB} GB / ${con.storageGB} GB</b>` : `Media: <b>Kaset/CD Fisik (Bebas Slot)</b>`}
    </span>
  `;

  const availGames = ALL_GAMES.filter(g => g.platform === con.platform && g.year <= state.year);
  const list = document.getElementById('unitGamesList');
  list.innerHTML = '';

  availGames.forEach(g => {
    const owned = con.games.includes(g.id);
    const isRec = state.recommendedGames.some(r => r.gameId === g.id);
    const notEnoughSpace = con.media === 'storage' && !owned && (usedGB + g.sizeGB > con.storageGB);
    list.innerHTML += `
      <div class="item-row">
        <div>
          <b>${g.title}</b> ${g.sizeGB > 0 ? `<span class="badge">${g.sizeGB} GB</span>` : `<span class="badge">CD</span>`}
          ${isRec ? `<span class="badge ok">⭐ Direkomendasikan Pelanggan</span>` : ''}<br>
          <span style="color:#34d399;">${fmtRp(g.price)}</span>
        </div>
        ${owned
          ? `<button class="danger" onclick="uninstallGameFromUnit('${g.id}')">Hapus</button>`
          : `<button class="primary" ${notEnoughSpace ? 'disabled' : ''} onclick="buyGameForUnit('${g.id}')">${notEnoughSpace ? 'Penuh' : 'Beli & Pasang'}</button>`
        }
      </div>`;
  });
}

function buyGameForUnit(gameId) {
  const booth = state.booths.find(b => b.id === state.selectedBoothForGames);
  const game = ALL_GAMES.find(g => g.id === gameId);
  if (!booth || !booth.console || !game) return;
  if (state.mbankingBalance < game.price && getDrawerTotal() < game.price) {
    return addLog('❌ Saldo M-Banking / Laci kurang untuk beli game ini!');
  }
  if (state.mbankingBalance >= game.price) state.mbankingBalance -= game.price;
  else deductCashFromDrawer(game.price);

  booth.console.games.push(game.id);
  addLog(`💿 Berhasil beli & pasang <b>${game.title}</b> di <b>Room #${booth.id}</b>!`);

  // Cek apakah game ini direkomendasikan pelanggan -> ubah jadi Pelanggan Tetap!
  const recIdx = state.recommendedGames.findIndex(r => r.gameId === game.id);
  if (recIdx !== -1) {
    const rec = state.recommendedGames.splice(recIdx, 1)[0];
    state.loyalCustomers.push({ name: rec.requesterName.split(' (')[0], favGameId: game.id });
    addLog(`🌟 <b>${rec.requesterName}</b> senang rekomendasinya dibeli dan resmi menjadi <b>Pelanggan Tetap</b>!`);
  }

  saveGame();
  renderUnitGamesModal();
  renderBooths();
  updateHudOnly();
}

function uninstallGameFromUnit(gameId) {
  const booth = state.booths.find(b => b.id === state.selectedBoothForGames);
  if (!booth || !booth.console) return;
  booth.console.games = booth.console.games.filter(id => id !== gameId);
  saveGame();
  renderUnitGamesModal();
  renderBooths();
}

function repairBoothStick(boothId) {
  const booth = state.booths.find(b => b.id === boothId);
  if (!booth || !booth.console) return;
  if (state.stock.stikPS > 0) {
    state.stock.stikPS -= 1;
    booth.console.stickHp = 100;
    addLog(`🎮 Stik cadangan dipasang di <b>Room #${booth.id}</b>!`);
    saveGame(); renderBooths(); return;
  }
  if (booth.console.repairing) return;
  booth.console.repairing = true;
  addLog(`🔧 Menyervis stik <b>Room #${booth.id}</b> secara mandiri...`);
  renderBooths();
  setTimeout(() => {
    booth.console.stickHp = 100;
    booth.console.repairing = false;
    addLog(`✅ Servis stik <b>Room #${booth.id}</b> selesai!`);
    saveGame(); renderBooths();
  }, 5000);
}

function serveSnack(boothId) {
  const booth = state.booths.find(b => b.id === boothId);
  if (!booth || !booth.snackOrder) return;
  if (booth.snackOrder === 'Pop Mie' && state.stock.popmie > 0) {
    state.stock.popmie -= 1;
    booth.customer.snackBill = (booth.customer.snackBill || 0) + 8000;
    booth.snackOrder = null;
    addLog(`🍜 Pop Mie diantar ke Room #${booth.id} (+Rp 8.000).`);
  } else if (booth.snackOrder === 'Es Teh' && state.stock.esteh > 0) {
    state.stock.esteh -= 1;
    booth.customer.snackBill = (booth.customer.snackBill || 0) + 4000;
    booth.snackOrder = null;
    addLog(`🧊 Es Teh diantar ke Room #${booth.id} (+Rp 4.000).`);
  } else {
    addLog(`❌ Stok ${booth.snackOrder} habis! Beli di Store.`);
  }
  renderBooths();
}

// ==================== STORE, SEWA PS HARIAN, WIFI, BANK/PPOB, EKSPANSI & LIFE ====================
function switchMainTab(tab, el) {
  state.mainTab = tab;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  renderRightPanel();
}

function switchSubTab(sub) {
  state.subTab = sub;
  renderRightPanel();
}

function buyHardware(category, id) {
  let item = null;
  if (category === 'console') item = CONSOLE_CATALOG.find(x => x.id === id);
  if (category === 'pc') item = PC_CATALOG.find(x => x.id === id);
  if (category === 'tv') item = TV_CATALOG.find(x => x.id === id);
  if (!item) return;

  if (state.mbankingBalance < item.price && getDrawerTotal() < item.price) {
    return addLog('❌ Saldo M-Banking / Laci tidak cukup!');
  }
  if (state.mbankingBalance >= item.price) state.mbankingBalance -= item.price;
  else deductCashFromDrawer(item.price);

  if (category === 'console' || category === 'pc') {
    state.inventoryConsoles.push({
      uid: 'u_' + Date.now() + Math.random(),
      ...item, games: [], stickHp: 100, repairing: false
    });
    addLog(`📦 Membeli <b>${item.name}</b> ke gudang (bisa dirakit ke Room atau disewakan bawa pulang).`);
  } else {
    state.inventoryTVs.push({ uid: 't_' + Date.now() + Math.random(), ...item });
    addLog(`📺 Membeli <b>${item.name}</b> masuk ke gudang.`);
  }
  saveGame();
  renderRightPanel();
  updateHudOnly();
}

function assembleNewBooth() {
  const kios = KIOS_TIERS.find(k => k.level === state.kiosLevel);
  if (state.booths.length >= kios.maxRooms) {
    return addLog(`⚠️ Kapasitas ${kios.name} penuh (maks ${kios.maxRooms} room)!`);
  }
  if (state.inventoryConsoles.length === 0 || state.inventoryTVs.length === 0) {
    return addLog('⚠️ Butuh minimal 1 Konsol/PC dan 1 TV/Monitor di gudang!');
  }
  const con = state.inventoryConsoles.shift();
  const tv = state.inventoryTVs.shift();
  const newId = state.booths.length + 1;
  state.booths.push({
    id: newId, console: con, tv: tv,
    rate: con.defaultRate + tv.bonusRate, discountPct: 0,
    hasFan: false, hasAC: false, hasCCTV: false,
    customer: null, timeLeft: 0, totalTime: 0, snackOrder: null
  });
  addLog(`🎉 <b>Room #${newId}</b> berhasil dirakit (${con.name} + ${tv.name})!`);
  saveGame();
  renderAll(true);
}

function rentOutSpareConsole(consoleUid) {
  if (!state.homeRental.enabled) return addLog('⚠️ Aktifkan layanan Sewa PS Bawa Pulang terlebih dahulu!');
  if (state.homeRental.activeRentals.length >= state.homeRental.slots) {
    return addLog('⚠️ Slot sewa PS bawa pulang sudah penuh! Tambah slot dulu.');
  }
  const idx = state.inventoryConsoles.findIndex(c => c.uid === consoleUid);
  if (idx === -1) return;
  const con = state.inventoryConsoles[idx];
  if (con.dailyRentRate <= 0) return addLog('⚠️ PC Rakitan tidak disewakan bawa pulang, khusus PS/Switch/Xbox.');

  state.inventoryConsoles.splice(idx, 1);
  const custNames = ['Pak RT', 'Mas Bayu', 'Bang Toni', 'Deva', 'Rama'];
  const days = Math.floor(Math.random() * 3) + 1;
  state.homeRental.activeRentals.push({
    id: 'hr_' + Date.now(),
    consoleUid: con.uid,
    consoleObj: con,
    consoleName: con.name,
    customerName: custNames[Math.floor(Math.random() * custNames.length)],
    daysLeft: days,
    dailyRate: con.dailyRentRate
  });
  addLog(`🏠 <b>${con.name}</b> disewakan bawa pulang selama <b>${days} hari</b> (${fmtRp(con.dailyRentRate)}/hari).`);
  saveGame();
  renderRightPanel();
}

function returnHomeRentalEarly(hrId) {
  const idx = state.homeRental.activeRentals.findIndex(r => r.id === hrId);
  if (idx === -1) return;
  const rec = state.homeRental.activeRentals.splice(idx, 1)[0];
  state.inventoryConsoles.push(rec.consoleObj);
  addLog(`📦 <b>${rec.consoleName}</b> kembali masuk gudang.`);
  saveGame();
  renderRightPanel();
}

function unlockBusiness(bizId) {
  const biz = EXPANSION_BUSINESSES.find(x => x.id === bizId);
  if (!biz || state.unlockedBusinesses.includes(bizId)) return;
  if (state.mbankingBalance < biz.unlockCost) return addLog('❌ Saldo M-Banking kurang untuk membuka unit bisnis ini!');
  state.mbankingBalance -= biz.unlockCost;
  state.unlockedBusinesses.push(bizId);
  addLog(`🏢 Ekspansi Sukses! Unit bisnis <b>${biz.name}</b> resmi beroperasi!`);
  saveGame();
  renderRightPanel();
  updateHudOnly();
}

function buySupply(type) {
  const prices = { kwh20: 30000, kwh50: 72000, popmie: 25000, esteh: 15000, stik: 65000, staff: 1400000, kb: 25000, condom: 20000 };
  const cost = prices[type];
  if (getDrawerTotal() < cost && state.mbankingBalance < cost) return addLog('❌ Saldo tidak cukup!');
  if (getDrawerTotal() >= cost) deductCashFromDrawer(cost);
  else state.mbankingBalance -= cost;

  if (type === 'kwh20') { state.kwh = +(state.kwh + 20).toFixed(2); addLog('⚡ Token PLN +20 kWh masuk!'); }
  if (type === 'kwh50') { state.kwh = +(state.kwh + 50).toFixed(2); addLog('⚡ Token PLN +50 kWh masuk!'); }
  if (type === 'popmie') { state.stock.popmie += 6; addLog('🍜 Stok Pop Mie +6 cup.'); }
  if (type === 'esteh') { state.stock.esteh += 10; addLog('🧊 Stok Es Teh +10 gelas.'); }
  if (type === 'stik') { state.stock.stikPS += 2; addLog('🎮 Stik cadangan +2 unit.'); }
  if (type === 'kb') { state.stock.kbPill += 1; addLog('💊 Pil KB +1 strip.'); }
  if (type === 'condom') { state.stock.condom += 3; addLog('🛡️ Kondom +3 pcs.'); }
  if (type === 'staff') { state.staffHired = true; addLog('🧑‍💼 Karyawan kasir resmi direkrut!'); }
  saveGame();
  renderRightPanel();
  updateHudOnly();
}

function installWifi(id) {
  const prov = WIFI_PROVIDERS.find(p => p.id === id);
  if (!prov) return;
  if (state.mbankingBalance < prov.installFee) return addLog('❌ Saldo M-Banking kurang untuk pasang Wi-Fi!');
  state.mbankingBalance -= prov.installFee;
  state.wifi.provider = prov;
  state.wifi.hotspotOpen = true;
  addLog(`📶 Wi-Fi <b>${prov.name}</b> terpasang!`);
  saveGame();
  renderRightPanel();
  updateHudOnly();
}

function openVoucherModal() {
  showCustomModal(
    '🎫 Atur Tarif Voucher Wi-Fi Hotspot',
    `<label style="font-size:0.78rem;color:var(--muted);">Harga Voucher per Lembar (Rp):</label>
     <input type="number" id="inpVoucherPrice" value="${state.wifi.voucherPrice}" step="500" />
     <label style="font-size:0.78rem;color:var(--muted);">Durasi Paket Wi-Fi (Jam):</label>
     <input type="number" id="inpVoucherHours" value="${state.wifi.voucherHours}" min="1" max="24" />`,
    `<button onclick="closeCustomModal()">Batal</button>
     <button class="primary" onclick="saveVoucherModal()">Simpan Paket</button>`
  );
}

function saveVoucherModal() {
  const p = Number(document.getElementById('inpVoucherPrice').value);
  const h = Number(document.getElementById('inpVoucherHours').value);
  if (p >= 1000 && h >= 1) {
    state.wifi.voucherPrice = p;
    state.wifi.voucherHours = h;
    addLog(`🎫 Tarif Voucher Wi-Fi diatur: <b>${fmtRp(p)} / ${h} jam</b>.`);
    closeCustomModal();
    saveGame();
    renderRightPanel();
  }
}

function bankTransferAction(action) {
  const amt = Math.max(0, Number(document.getElementById('bankAmtInput')?.value || 0));
  if (amt <= 0 && action !== 'qrisToBank') return;

  if (action === 'drawerToBank') {
    if (getDrawerTotal() < amt) return addLog('❌ Uang di laci kasir kurang!');
    deductCashFromDrawer(amt);
    state.mbankingBalance += amt;
    addLog(`🏦 Setor tunai dari Laci ke M-Banking: <b>${fmtRp(amt)}</b>.`);
  } else if (action === 'bankToDrawer') {
    if (state.mbankingBalance < amt) return addLog('❌ Saldo M-Banking tidak cukup!');
    state.mbankingBalance -= amt;
    addCashToDrawer(amt);
    addLog(`🏧 Tarik tunai M-Banking ke Laci Kasir: <b>${fmtRp(amt)}</b>.`);
  } else if (action === 'drawerToPpob') {
    if (getDrawerTotal() < amt) return addLog('❌ Uang di laci kasir kurang untuk isi deposit bisnis!');
    deductCashFromDrawer(amt);
    state.businessPpobBalance += amt;
    addLog(`📲 Top Up Deposit Saldo Bisnis (Pulsa/E-Wallet/Token) dari Laci: <b>+${fmtRp(amt)}</b>.`);
  } else if (action === 'bankToPpob') {
    if (state.mbankingBalance < amt) return addLog('❌ Saldo M-Banking kurang!');
    state.mbankingBalance -= amt;
    state.businessPpobBalance += amt;
    addLog(`📲 Top Up Deposit Saldo Bisnis dari M-Banking: <b>+${fmtRp(amt)}</b>.`);
  } else if (action === 'qrisToBank') {
    if (state.qrisBalance <= 0) return;
    const moved = state.qrisBalance;
    state.qrisBalance = 0;
    state.mbankingBalance += moved;
    addLog(`📲 Cairkan saldo QRIS <b>${fmtRp(moved)}</b> ke M-Banking.`);
  }
  saveGame();
  renderRightPanel();
  updateHudOnly();
}

function buyOrUpgradeKios(mode) {
  const cur = KIOS_TIERS.find(k => k.level === state.kiosLevel);
  if (mode === 'buy') {
    if (state.mbankingBalance < cur.buyPrice) return addLog('❌ Saldo M-Banking kurang untuk beli hak milik ruko!');
    state.mbankingBalance -= cur.buyPrice;
    state.kiosOwned = true;
    addLog(`🏢 <b>${cur.name}</b> resmi menjadi HAK MILIK!`);
  } else if (mode === 'upgrade') {
    const next = KIOS_TIERS.find(k => k.level === state.kiosLevel + 1);
    if (!next) return;
    const cost = state.kiosOwned ? next.buyPrice : next.monthlyRent * 2;
    if (state.mbankingBalance < cost) return addLog(`❌ Butuh saldo M-Banking minimal ${fmtRp(cost)}!`);
    state.mbankingBalance -= cost;
    state.kiosLevel = next.level;
    addLog(`🚀 Ekspansi berhasil ke <b>${next.name}</b> (maks ${next.maxRooms} room)!`);
  }
  saveGame();
  renderRightPanel();
  updateHudOnly();
}

// ==================== LIFE SIMULATOR ====================
function datePartner(partnerId) {
  const p = PARTNERS_LIST.find(x => x.id === partnerId);
  if (!p) return;
  if (state.player.charm < p.charmReq) return addLog(`💔 Pesona kamu masih ${state.player.charm} (butuh ${p.charmReq}).`);
  state.player.status = 'Pacaran';
  state.player.partner = { ...p };
  state.player.relationship = 35;
  addLog(`💕 Resmi berpacaran dengan <b>${p.name}</b>!`);
  saveGame(); renderRightPanel(); updateHudOnly();
}

function goHangout() {
  if (!state.player.partner) return;
  if (getDrawerTotal() < 50000) return addLog('❌ Butuh Rp 50.000 di laci.');
  deductCashFromDrawer(50000);
  state.player.relationship = Math.min(100, state.player.relationship + 15);
  state.player.charm = Math.min(100, state.player.charm + 3);
  addLog(`☕ Kencan bareng ${state.player.partner.name} (+15% Kemesraan).`);
  saveGame(); renderRightPanel(); updateHudOnly();
}

function toggleProtection(type) {
  if (type === 'kb') {
    if (!state.player.kbActive && state.stock.kbPill <= 0) return addLog('❌ Stok Pil KB habis!');
    if (!state.player.kbActive) state.stock.kbPill -= 1;
    state.player.kbActive = !state.player.kbActive;
  } else {
    if (!state.player.condomActive && state.stock.condom <= 0) return addLog('❌ Stok Kondom habis!');
    if (!state.player.condomActive) state.stock.condom -= 1;
    state.player.condomActive = !state.player.condomActive;
  }
  saveGame(); renderRightPanel();
}

function doHB() {
  if (!state.player.partner) return;
  if (state.player.energy < 20) return addLog('😴 Energi lelah!');
  state.player.energy -= 20;
  state.player.relationship = Math.min(100, state.player.relationship + 20);
  const isProtected = state.player.kbActive || state.player.condomActive;
  if (state.player.condomActive) state.player.condomActive = false;
  addLog(`❤️ Melakukan HB bersama ${state.player.partner.name}.`);

  if (!isProtected && !state.player.pregnant && Math.random() < 0.45) {
    state.player.pregnant = true;
    state.player.pregnantWeeks = 1;
    if (state.player.status !== 'Menikah') {
      state.player.reputation = Math.max(1.0, +(state.player.reputation - 0.35).toFixed(2));
      state.player.gossipLevel += 1;
      addLog('🤰 <b>Hamil di luar nikah!</b> Menjadi bahan omongan tetangga & reputasi rental turun sedikit.');
    } else {
      addLog('🤰 Selamat! Kamu positif hamil bersama suami.');
    }
  }
  saveGame(); renderRightPanel(); updateHudOnly();
}

function marryPartner(pkgId) {
  const pkg = WEDDING_PACKAGES.find(w => w.id === pkgId);
  if (!pkg || !state.player.partner) return;
  if (state.player.relationship < 80) return addLog('💕 Kemesraan minimal 80% untuk menikah!');
  if (state.mbankingBalance < pkg.cost) return addLog(`❌ Saldo M-Banking kurang (${fmtRp(pkg.cost)})!`);
  state.mbankingBalance -= pkg.cost;
  state.player.status = 'Menikah';
  state.player.partner.weddingId = pkg.id;
  state.player.reputation = Math.min(5.0, +(state.player.reputation + pkg.repBonus).toFixed(2));
  addLog(`💒 <b>SAH!</b> Menikah dengan ${state.player.partner.name} (${pkg.name})!`);
  saveGame(); renderRightPanel(); updateHudOnly();
}

function sleepNextDay() {
  if (state.isOpen) return addLog('⚠️ Tutup rental dulu sebelum tidur!');
  state.player.energy = 100;
  state.hour = 8; state.minute = 0;
  onNewDay();
  addLog(`🌅 Selamat pagi Hari ke-${state.totalDays} (${state.day}/${state.month}/${state.year}).`);
  saveGame(); renderAll(true);
}


// ==================== FIRESTORE CLOUD SYNC + OFFLINE HYBRID ====================
async function saveGame(forceCloud = false) {
  try {
    state.lastSavedAt = Date.now();
    const payload = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, payload);

    if (!navigator.onLine) {
      state.syncStatus = `Offline • Lokal (${CloudSync.syncId})`;
      updateHudOnly();
      return;
    }

    const res = await CloudSync.pushToCloud(state, forceCloud);
    if (res.ok) {
      state.syncStatus = `☁️ Firestore (${CloudSync.syncId})`;
    } else if (res.reason === 'unconfigured') {
      state.syncStatus = `Online • Lokal (Set Cloud)`;
    } else {
      state.syncStatus = `Offline/Pending (${CloudSync.syncId})`;
    }
    updateHudOnly();
  } catch (e) {}
}

async function syncPullNow() {
  addLog(`☁️ Mengambil data dari Firestore untuk Sync ID: <b>${CloudSync.syncId}</b>...`);
  const res = await CloudSync.pullFromCloud();
  if (!res.ok) {
    if (res.reason === 'unconfigured') addLog('⚠️ Konfigurasi Firebase belum diisi! Isi dulu di menu Cloud Sync.');
    else if (res.reason === 'not_found') addLog(`ℹ️ Belum ada data cloud untuk Sync ID <b>${CloudSync.syncId}</b>. Menyimpan progres saat ini ke cloud...`), await saveGame(true);
    else if (res.reason === 'offline') addLog('📴 Perangkat sedang offline.');
    else addLog(`❌ Gagal tarik data cloud: ${res.reason}`);
    return;
  }

  Object.assign(state, res.state);
  state.activeCheckout = null;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  state.syncStatus = `☁️ Firestore (${CloudSync.syncId})`;
  addLog(`✅ Berhasil sinkron dari Firestore! Progres <b>${state.rentalName}</b> (${state.day}/${state.month}/${state.year}) dimuat.`);
  closeCustomModal();
  renderAll(true);
}

function openCloudSyncModal() {
  const cfg = CloudSync.getConfig() || { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' };
  const isReady = CloudSync.init();

  showCustomModal(
    '☁️ Cloud Save Firestore (Laptop ↔ HP)',
    `<div style="font-size:0.78rem;background:#090e1a;padding:8px;border-radius:8px;line-height:1.45;">
      Status Koneksi: <b style="color:${isReady ? '#34d399' : '#fbbf24'};">${isReady ? 'Terhubung ke Firebase Firestore' : 'Belum Dikonfigurasi (Mode Lokal)'}</b><br>
      Gunakan <b>Sync ID</b> yang sama di Laptop & HP agar progres otomatis berpindah.
    </div>

    <label style="font-size:0.76rem;color:var(--muted);">1. Sync ID / Kode Pemain (Min. 4 huruf/angka):</label>
    <div style="display:flex;gap:6px;">
      <input type="text" id="inpSyncId" value="${CloudSync.syncId}" placeholder="contoh: oneil_master" />
      <button class="primary" onclick="applyNewSyncId()">Set ID</button>
    </div>

    <div class="grid-2" style="margin-top:2px;">
      <button class="success" onclick="saveGame(true);addLog('☁️ Progres di-upload ke Firestore!');closeCustomModal();">⬆️ Simpan ke Cloud</button>
      <button class="purple" onclick="syncPullNow()">⬇️ Muat dari Cloud</button>
    </div>

    <details style="margin-top:4px;font-size:0.76rem;">
      <summary style="cursor:pointer;color:var(--accent);font-weight:700;">⚙️ Pengaturan Firebase Config (Isi Sekali Saja)</summary>
      <div style="display:flex;flex-direction:column;gap:5px;margin-top:6px;">
        <input type="text" id="fbApiKey" value="${cfg.apiKey || ''}" placeholder="apiKey (AIzaSy...)" />
        <input type="text" id="fbAuthDomain" value="${cfg.authDomain || ''}" placeholder="authDomain (project-id.firebaseapp.com)" />
        <input type="text" id="fbProjectId" value="${cfg.projectId || ''}" placeholder="projectId (project-id)" />
        <input type="text" id="fbStorageBucket" value="${cfg.storageBucket || ''}" placeholder="storageBucket (project-id.appspot.com)" />
        <input type="text" id="fbSenderId" value="${cfg.messagingSenderId || ''}" placeholder="messagingSenderId" />
        <input type="text" id="fbAppId" value="${cfg.appId || ''}" placeholder="appId (1:xxx:web:xxx)" />
        <button class="primary" onclick="saveFirebaseConfigFromUI()">💾 Simpan Config & Hubungkan Firestore</button>
      </div>
    </details>`,
    `<button onclick="closeCustomModal()">Tutup</button>`
  );
}

function applyNewSyncId() {
  const val = document.getElementById('inpSyncId').value;
  if (CloudSync.setSyncId(val)) {
    addLog(`🆔 Sync ID diubah ke <b>${CloudSync.syncId}</b>.`);
    openCloudSyncModal();
    updateHudOnly();
  } else {
    addLog('⚠️ Sync ID minimal 4 karakter (huruf/angka).');
  }
}

function saveFirebaseConfigFromUI() {
  const newCfg = {
    apiKey: document.getElementById('fbApiKey').value.trim(),
    authDomain: document.getElementById('fbAuthDomain').value.trim(),
    projectId: document.getElementById('fbProjectId').value.trim(),
    storageBucket: document.getElementById('fbStorageBucket').value.trim(),
    messagingSenderId: document.getElementById('fbSenderId').value.trim(),
    appId: document.getElementById('fbAppId').value.trim()
  };
  if (!newCfg.apiKey || !newCfg.projectId) {
    addLog('⚠️ apiKey dan projectId wajib diisi!');
    return;
  }
  const ok = CloudSync.saveCustomConfig(newCfg);
  if (ok) {
    addLog('✅ Firebase Firestore berhasil terhubung!');
    saveGame(true);
    openCloudSyncModal();
  } else {
    addLog('❌ Gagal menghubungkan Firebase. Periksa kembali config.');
  }
}

function loadGameLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    Object.assign(state, saved);
    state.activeCheckout = null;
    return true;
  } catch (e) { return false; }
}
window.addEventListener('online', () => { saveGame(true); });
window.addEventListener('offline', () => { saveGame(false); });

// ==================== RENDER FUNCTIONS ====================
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

function updateHudOnly() {
  document.getElementById('rentalTitleDisplay').textContent = state.rentalName;
  document.getElementById('syncBadge').textContent = `${state.gameMode === 'dev' ? '🛠️ Dev 100Jt' : '🎮 Rilis 30Jt'} • ${state.syncStatus}`;
  const hh = String(state.hour).padStart(2, '0');
  const mm = String(state.minute).padStart(2, '0');
  document.getElementById('hudDateTime').textContent = `${state.day}/${state.month}/${state.year} • ${hh}:${mm}`;
  document.getElementById('hudDrawer').textContent = fmtRp(getDrawerTotal());
  document.getElementById('hudBank').textContent = fmtRp(state.mbankingBalance);
  document.getElementById('hudPpob').textContent = fmtRp(state.businessPpobBalance);
  document.getElementById('hudKwh').textContent = `${state.kwh.toFixed(1)} kWh`;
  document.getElementById('hudRep').textContent = `⭐ ${state.player.reputation.toFixed(2)}`;

  const pauseBtn = document.getElementById('btnPause');
  pauseBtn.classList.toggle('active', state.paused);
  document.querySelectorAll('.speed-btn[data-speed]').forEach(btn => {
    btn.classList.toggle('active', !state.paused && Number(btn.dataset.speed) === state.speed);
  });

  const shopBtn = document.getElementById('btnToggleShop');
  shopBtn.textContent = state.isOpen ? '🔴 TUTUP' : '🟢 BUKA';
  shopBtn.className = state.isOpen ? 'danger' : 'success';

  const vipBtn = document.getElementById('btnVip2x');
  vipBtn.textContent = state.vip2x ? '🌟 2x AKTIF' : '🔒 2x Boost';
  vipBtn.className = state.vip2x ? 'primary' : '';
}

function renderQueue() {
  const list = document.getElementById('queueList');
  document.getElementById('queueCount').textContent = `${state.queue.length}/5`;
  list.innerHTML = '';
  if (state.queue.length === 0) {
    list.innerHTML = `<div style="color:#64748b;font-size:0.76rem;text-align:center;padding:14px 0;">Belum ada pengunjung mengantre...</div>`;
    return;
  }
  state.queue.forEach(c => {
    const div = document.createElement('div');
    div.className = 'queue-item' + (state.selectedCustomerId === c.id ? ' selected' : '');
    div.onclick = () => selectCustomer(c.id);
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;font-weight:700;">
        <span>${c.icon} ${c.name}</span>
        <span style="color:var(--accent);">${c.hours} Jam</span>
      </div>
      <div style="font-size:0.73rem;color:${c.hasMatchingGame ? '#34d399' : '#fbbf24'};">
        Cari: <b>${c.wantedGameTitle}</b> (${c.wantedPlatform}) ${c.hasMatchingGame ? '' : '• Bisa game lain'}
      </div>
      <div style="font-size:0.68rem;color:var(--muted);">Waktu tunggu: ${c.patience} mnt</div>
    `;
    list.appendChild(div);
  });
}

function renderBooths() {
  const grid = document.getElementById('boothsGrid');
  grid.innerHTML = '';
  state.booths.forEach(b => {
    const con = b.console;
    const tv = b.tv;
    const netRate = Math.round(b.rate * (1 - b.discountPct / 100));
    const pct = b.totalTime ? Math.max(0, Math.round((b.timeLeft / b.totalTime) * 100)) : 0;
    const installedTitles = con.games.map(gid => ALL_GAMES.find(x => x.id === gid)?.title || gid);

    const div = document.createElement('div');
    div.className = 'booth' + (b.customer ? ' active' : '') + (con.stickHp <= 0 ? ' broken' : '');
    div.innerHTML = `
      <div class="booth-top">
        <span>🚪 Room #${b.id} (${con.platform})</span>
        <span class="badge ${con.stickHp <= 0 ? 'warn' : (b.customer ? 'busy' : 'ok')}">
          ${con.repairing ? 'Diservis' : (con.stickHp <= 0 ? 'Stik Rusak' : (b.customer ? 'Terisi' : 'Kosong'))}
        </span>
      </div>
      <div class="spec-line">
        🎮 <b>${con.name}</b><br>
        📺 ${tv.name}<br>
        💵 Billing: <b>${netRate === 0 ? 'GRATIS PROMO' : fmtRp(netRate) + '/jam'}</b> ${b.discountPct > 0 ? `<span class="badge ok">Disc ${b.discountPct}%</span>` : ''} • Stik: <b>${con.stickHp}%</b>
      </div>
      <div class="room-facilities">
        ${b.hasAC ? `<span class="fac-tag">❄️ AC</span>` : (b.hasFan ? `<span class="fac-tag">🌀 Kipas</span>` : `<span class="fac-tag" style="color:#64748b;">Non-AC</span>`)}
        ${b.hasCCTV ? `<span class="fac-tag">📹 CCTV</span>` : ''}
      </div>
      <div class="games-pill-wrap">
        ${installedTitles.length === 0
          ? `<span style="font-size:0.69rem;color:#f87171;">⚠️ Belum ada game terpasang</span>`
          : installedTitles.map(t => `<span class="game-pill">${t}</span>`).join('')}
      </div>
      ${b.customer ? `
        <div style="background:#090e1a;padding:6px;border-radius:7px;font-size:0.74rem;">
          <div>${b.customer.icon} <b>${b.customer.name}</b> — <i>${b.customer.playedGameTitle}</i></div>
          <div style="color:#94a3b8;">Sisa: ${b.timeLeft} menit</div>
          <div class="progress-bar" style="margin-top:4px;"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>
      ` : `
        <button class="primary" onclick="seatCustomer(${b.id})" ${(!state.selectedCustomerId || con.stickHp <= 0 || con.repairing) ? 'disabled' : ''}>
          ➕ Masukkan ke Room
        </button>
      `}
      <div style="display:flex;gap:4px;flex-wrap:wrap;">
        <button onclick="openUnitGamesModal(${b.id})" style="flex:1;">💿 Game (${installedTitles.length})</button>
        <button onclick="openRoomBillingModal(${b.id})">🏷️ Billing/Room</button>
        ${con.stickHp < 70 ? `<button class="danger" onclick="repairBoothStick(${b.id})">🔧 Stik</button>` : ''}
        ${b.snackOrder ? `<button class="success" onclick="serveSnack(${b.id})">🍜 ${b.snackOrder}</button>` : ''}
      </div>
    `;
    grid.appendChild(div);
  });
}

function renderRightPanel() {
  const box = document.getElementById('rightPanelContent');
  // Simpan posisi scroll sebelumnya jika ada
  const prevScroll = document.getElementById('storeScroll')?.scrollTop || 0;
  box.innerHTML = '';

  if (state.mainTab === 'toko') {
    box.innerHTML = `
      <div class="sub-tabs">
        <button class="sub-btn ${state.subTab === 'konsol' ? 'active' : ''}" onclick="switchSubTab('konsol')">🎮 Konsol</button>
        <button class="sub-btn ${state.subTab === 'pc' ? 'active' : ''}" onclick="switchSubTab('pc')">🖥️ PC</button>
        <button class="sub-btn ${state.subTab === 'tv' ? 'active' : ''}" onclick="switchSubTab('tv')">📺 TV LED/LCD</button>
        <button class="sub-btn ${state.subTab === 'warung' ? 'active' : ''}" onclick="switchSubTab('warung')">⚡ Token/Stok</button>
      </div>
      <div style="background:#090e1a;padding:7px;border-radius:8px;font-size:0.73rem;display:flex;justify-content:space-between;align-items:center;">
        <span>Gudang: <b>${state.inventoryConsoles.length} Unit</b> | <b>${state.inventoryTVs.length} TV</b></span>
        <button class="success" onclick="assembleNewBooth()">➕ Rakit Room Baru</button>
      </div>
      <div class="scroll-area" id="storeScroll"></div>
    `;
    const scroll = document.getElementById('storeScroll');

    if (state.subTab === 'konsol') {
      CONSOLE_CATALOG.filter(c => c.year < state.year || (c.year === state.year && c.month <= state.month)).forEach(c => {
        scroll.innerHTML += `
          <div class="item-row">
            <div>
              <b>${c.name}</b> <span class="badge">${c.platform}</span><br>
              <span style="color:var(--muted);">Rilis ${c.year} • ${c.watt}W • ${c.storageGB > 0 ? c.storageGB + 'GB' : 'CD'}</span><br>
              <b style="color:#34d399;">${fmtRp(c.price)}</b>
            </div>
            <button class="primary" onclick="buyHardware('console', '${c.id}')">Beli</button>
          </div>`;
      });
    } else if (state.subTab === 'pc') {
      PC_CATALOG.filter(p => p.year < state.year || (p.year === state.year && p.month <= state.month)).forEach(p => {
        scroll.innerHTML += `
          <div class="item-row">
            <div><b>${p.name}</b><br><span style="color:var(--muted);">${p.watt}W • SSD ${p.storageGB}GB</span><br><b style="color:#34d399;">${fmtRp(p.price)}</b></div>
            <button class="primary" onclick="buyHardware('pc', '${p.id}')">Beli PC</button>
          </div>`;
      });
    } else if (state.subTab === 'tv') {
      TV_CATALOG.filter(t => t.year <= state.year).forEach(t => {
        scroll.innerHTML += `
          <div class="item-row">
            <div>
              <b>${t.name}</b> <span class="badge">${t.type} ${t.inch}"</span><br>
              <span style="color:var(--muted);">${t.watt}W • Bonus +${fmtRp(t.bonusRate)}/jam</span><br>
              <b style="color:#34d399;">${fmtRp(t.price)}</b>
            </div>
            <button class="primary" onclick="buyHardware('tv', '${t.id}')">Beli TV</button>
          </div>`;
      });
    } else {
      const supplies = [
        { id: 'kwh20', name: '⚡ Token Listrik PLN 20 kWh', price: 30000 },
        { id: 'kwh50', name: '⚡ Token Listrik PLN 50 kWh', price: 72000 },
        { id: 'popmie', name: '🍜 1 Dus Pop Mie (6 cup)', price: 25000 },
        { id: 'esteh', name: '🧊 Bahan Es Teh Manis (10 porsi)', price: 15000 },
        { id: 'stik', name: '🎮 2x Stik PS Cadangan', price: 65000 },
        { id: 'kb', name: '💊 Pil KB (1 Strip)', price: 25000 },
        { id: 'condom', name: '🛡️ Kondom (Isi 3)', price: 20000 },
        { id: 'staff', name: state.staffHired ? '✅ Karyawan Kasir Aktif' : '🧑‍💼 Rekrut Karyawan Kasir (Otomatis Kembalian)', price: 1400000, disabled: state.staffHired }
      ];
      supplies.forEach(s => {
        scroll.innerHTML += `
          <div class="item-row">
            <div><b>${s.name}</b><br><span style="color:#34d399;">${fmtRp(s.price)}</span></div>
            <button ${s.disabled ? 'disabled' : ''} onclick="buySupply('${s.id}')">${s.disabled ? 'Aktif' : 'Beli'}</button>
          </div>`;
      });
    }
    scroll.scrollTop = prevScroll;

  } else if (state.mainTab === 'sewa') {
    // SEWA PS BAWA PULANG + BISNIS JASA SEWA & PENGINAPAN BERTAHAP
    const spareConsoles = state.inventoryConsoles.filter(c => c.dailyRentRate > 0);
    box.innerHTML = `
      <div class="item-row" style="flex-direction:column;align-items:stretch;gap:6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <b>🏠 Sewa PS Bawa Pulang (Harian)</b>
          <button class="${state.homeRental.enabled ? 'success' : 'primary'}" onclick="state.homeRental.enabled=!state.homeRental.enabled;saveGame();renderRightPanel();">
            ${state.homeRental.enabled ? '🟢 Layanan Aktif' : 'Aktifkan Sewa PS'}
          </button>
        </div>
        <div style="font-size:0.74rem;color:var(--muted);">
          Slot Disewakan: <b>${state.homeRental.activeRentals.length}/${state.homeRental.slots}</b> • Stok Gudang Siap Sewa: <b>${spareConsoles.length} Unit</b>
        </div>
        ${state.homeRental.enabled ? `
          <button onclick="if(state.mbankingBalance>=500000){state.mbankingBalance-=500000;state.homeRental.slots+=1;saveGame();renderRightPanel();updateHudOnly();}">
            ➕ Tambah Slot Sewa PS (Rp 500.000)
          </button>
          ${spareConsoles.map(sc => `
            <div class="item-row" style="background:#090e1a;">
              <div><b>${sc.name}</b><br><span style="color:#34d399;">Tarif: ${fmtRp(sc.dailyRentRate)}/hari</span></div>
              <button class="primary" onclick="rentOutSpareConsole('${sc.uid}')">Sewakan</button>
            </div>
          `).join('')}
          ${state.homeRental.activeRentals.map(ar => `
            <div class="item-row" style="background:#090e1a;">
              <div><b>${ar.consoleName}</b> (${ar.customerName})<br><span style="color:#fbbf24;">Sisa ${ar.daysLeft} hari • ${fmtRp(ar.dailyRate)}/hr</span></div>
              <button onclick="returnHomeRentalEarly('${ar.id}')">Tarik Unit</button>
            </div>
          `).join('')}
        ` : ''}
      </div>

      <div style="font-weight:700;font-size:0.78rem;color:var(--accent);">🏨 Ekspansi Bisnis Jasa Sewa & Penginapan:</div>
      <div class="scroll-area">
        ${EXPANSION_BUSINESSES.map(biz => {
          const owned = state.unlockedBusinesses.includes(biz.id);
          return `
            <div class="item-row">
              <div>
                <b>${biz.name}</b><br>
                <span style="color:var(--muted);">${biz.desc}</span><br>
                <span style="color:#34d399;">Omzet: ${fmtRp(biz.dailyIncomeRange[0])}–${fmtRp(biz.dailyIncomeRange[1])}/hari</span>
              </div>
              <button class="${owned ? 'success' : 'purple'}" ${owned ? 'disabled' : ''} onclick="unlockBusiness('${biz.id}')">
                ${owned ? '✅ Aktif' : fmtRp(biz.unlockCost)}
              </button>
            </div>`;
        }).join('')}
      </div>
    `;

  } else if (state.mainTab === 'wifi') {
    box.innerHTML = `
      <div class="item-row" style="flex-direction:column;align-items:stretch;">
        <div style="display:flex;justify-content:space-between;">
          <b>ISP Aktif:</b>
          <span>${state.wifi.provider ? state.wifi.provider.name : 'Belum Pasang'}</span>
        </div>
        ${state.wifi.provider ? `
          <div style="font-size:0.74rem;color:var(--muted);">
            Voucher Hotspot: <b>${fmtRp(state.wifi.voucherPrice)} / ${state.wifi.voucherHours} Jam</b> • User: <b>${state.wifi.activeUsers}</b>
          </div>
          <div class="grid-2" style="margin-top:4px;">
            <button class="primary" onclick="openVoucherModal()">🎫 Atur Voucher</button>
            <button onclick="state.wifi.hotspotOpen=!state.wifi.hotspotOpen;saveGame();renderRightPanel();">
              ${state.wifi.hotspotOpen ? '🟢 Hotspot Buka' : '🔴 Hotspot Tutup'}
            </button>
          </div>
        ` : ''}
      </div>
      <div class="scroll-area">
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
        <div style="display:flex;justify-content:space-between;"><span>🏦 M-Banking Pribadi:</span><b style="color:#60a5fa;">${fmtRp(state.mbankingBalance)}</b></div>
        <div style="display:flex;justify-content:space-between;"><span>📲 Deposit Saldo Bisnis (PPOB):</span><b style="color:#fbbf24;">${fmtRp(state.businessPpobBalance)}</b></div>
        <div style="display:flex;justify-content:space-between;"><span>💵 Uang di Laci Kasir:</span><b style="color:#34d399;">${fmtRp(getDrawerTotal())}</b></div>
        <div style="display:flex;justify-content:space-between;"><span>💳 Saldo QRIS:</span><b style="color:#c084fc;">${fmtRp(state.qrisBalance)}</b></div>
        <input type="number" id="bankAmtInput" value="200000" step="50000" />
        <div class="grid-2">
          <button class="success" onclick="bankTransferAction('drawerToBank')">Laci ➡️ M-Banking</button>
          <button class="primary" onclick="bankTransferAction('bankToDrawer')">M-Banking ➡️ Laci</button>
          <button class="purple" onclick="bankTransferAction('drawerToPpob')">Laci ➡️ Saldo Bisnis</button>
          <button onclick="bankTransferAction('bankToPpob')">M-Bank ➡️ Saldo Bisnis</button>
        </div>
        <button onclick="bankTransferAction('qrisToBank')">📲 Cairkan QRIS ke M-Banking</button>
      </div>

      <div class="item-row" style="flex-direction:column;align-items:stretch;gap:5px;">
        <b>🏢 Properti Tempat Usaha:</b>
        <div style="font-size:0.74rem;color:var(--muted);">${kios.name} (Maks ${kios.maxRooms} room) • <b>${state.kiosOwned ? 'HAK MILIK' : 'Sewa ' + fmtRp(kios.monthlyRent) + '/bln'}</b></div>
        ${!state.kiosOwned ? `<button class="primary" onclick="buyOrUpgradeKios('buy')">🏠 Beli Hak Milik (${fmtRp(kios.buyPrice)})</button>` : ''}
        ${nextKios ? `<button class="purple" onclick="buyOrUpgradeKios('upgrade')">🚀 Ekspansi ke ${nextKios.name}</button>` : ''}
      </div>

      <div style="font-weight:700;font-size:0.76rem;color:var(--accent);">📲 Operator Pulsa, E-Wallet & Transfer (Admin Sesuai Provider):</div>
      <div class="scroll-area" style="max-height:150px;">
        ${PPOB_PRODUCTS.map(pr => `
          <div class="item-row">
            <div><b>${pr.name}</b><br><span style="color:var(--muted);">Admin Operator: ${pr.adminProvider === 0 ? 'Rp 0 (Gratis)' : fmtRp(pr.adminProvider)}</span></div>
            <span style="color:#34d399;">+${fmtRp(pr.hargaJual - pr.nominal - pr.adminProvider)}</span>
          </div>
        `).join('')}
      </div>
    `;

  } else if (state.mainTab === 'life') {
    const pl = state.player;
    box.innerHTML = `
      <div class="item-row" style="flex-direction:column;align-items:stretch;gap:5px;">
        <div style="display:flex;justify-content:space-between;">
          <b>👩🏻 Profil (${pl.gender}, ${pl.age} Thn)</b>
          <span class="badge" style="background:rgba(236,72,153,0.2);color:#f472b6;">${pl.status}</span>
        </div>
        <div style="font-size:0.74rem;color:var(--muted);">
          Pesona: <b>${pl.charm}/100</b> • Energi: <b>${pl.energy}%</b> • Anak: <b>${pl.children}</b>
          ${pl.pregnant ? `<br><span style="color:#f472b6;">🤰 Hamil (${pl.pregnantWeeks} minggu)</span>` : ''}
          ${pl.gossipLevel > 0 ? `<br><span style="color:#f87171;">🗣️ Bahan Omongan Tetangga (Lv.${pl.gossipLevel})</span>` : ''}
        </div>
        <div class="grid-2">
          <button onclick="toggleProtection('kb')">${pl.kbActive ? '💊 KB: AKTIF' : '💊 Aktifkan KB'} (${state.stock.kbPill})</button>
          <button onclick="toggleProtection('condom')">${pl.condomActive ? '🛡️ Kondom: AKTIF' : '🛡️ Pakai Kondom'} (${state.stock.condom})</button>
        </div>
        <button class="primary" onclick="sleepNextDay()">🛏️ Tidur & Lanjut Hari Berikutnya</button>
      </div>

      ${!pl.partner ? `
        <div class="scroll-area">
          ${PARTNERS_LIST.map(pt => `
            <div class="item-row">
              <div><b>${pt.name}</b><br><span style="color:var(--muted);">${pt.job} • Pesona ${pt.charmReq}</span></div>
              <button class="pink" onclick="datePartner('${pt.id}')">Pacaran</button>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="item-row" style="flex-direction:column;align-items:stretch;gap:6px;">
          <div><b>💑 Pasangan: ${pl.partner.name}</b> (${pl.partner.job}) • Kemesraan: <b>${pl.relationship}%</b></div>
          <div class="grid-2">
            <button onclick="goHangout()">☕ Kencan (Rp 50rb)</button>
            <button class="pink" onclick="doHB()">❤️ Tombol HB</button>
          </div>
        </div>
        ${pl.status === 'Pacaran' ? `
          <div class="scroll-area" style="max-height:180px;">
            ${WEDDING_PACKAGES.map(w => `
              <div class="item-row">
                <div><b>${w.name}</b><br><span style="color:#fbbf24;">${fmtRp(w.cost)}</span></div>
                <button class="success" onclick="marryPartner('${w.id}')">Menikah</button>
              </div>
            `).join('')}
          </div>
        ` : ''}
      `}
    `;
  }
}

function renderAll(includeRight = true) {
  updateHudOnly();
  renderQueue();
  renderBooths();
  if (includeRight) renderRightPanel();
}

// BOOTSTRAP (OFFLINE LOAD + AUTO CLOUD CHECK)
(async function bootstrapGame() {
  CloudSync.init();
  const hadLocal = loadGameLocal();
  if (!hadLocal) {
    initStarterRooms();
    addLog('🎮 Selamat datang di <b>Rental Simulator by Oneilverse</b>!');
    openModeSelectModal();
  } else {
    addLog('💾 Progres lokal dimuat.');
    closeCustomModal();
  }
  renderAll(true);

  if (navigator.onLine && CloudSync.init()) {
    const cloudRes = await CloudSync.pullFromCloud();
    if (cloudRes.ok && cloudRes.state) {
      const localTime = state.lastSavedAt || 0;
      if (cloudRes.updatedAt > localTime + 5000) {
        Object.assign(state, cloudRes.state);
        state.activeCheckout = null;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        addLog(`☁️ Progres terbaru dari perangkat lain (<b>${CloudSync.syncId}</b>) otomatis disinkronkan!`);
        renderAll(true);
      } else {
        saveGame(true);
      }
    } else if (hadLocal) {
      saveGame(true);
    }
  }
})();
