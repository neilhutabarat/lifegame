// RENTAL SIMULATOR BY ONEILVERSE - CORE ENGINE

const state = {
  rentalName: 'Rental PS & PC Oneilverse',
  vip2x: false,
  speed: 1, // 1x, 2x, 4x, 8x
  // Waktu mulai: 1 Januari 2020, 08:00
  // 1 jam in-game = 1 menit nyata (60 detik) pada 1x -> 1 menit in-game = 1 detik nyata
  year: 2020,
  month: 1,
  day: 1,
  totalDays: 1,
  hour: 8,
  minute: 0,
  isOpen: false,

  // Keuangan & Laci Pecahan Rupiah
  drawer: {
    100000: 2,
    50000: 3,
    20000: 5,
    10000: 10,
    5000: 10,
    2000: 15,
    1000: 15,
    500: 10,
    100: 10
  },
  bankBalance: 1500000, // Tabungan awal di Bank
  qrisBalance: 0,
  ppobSaldo: 250000,
  kasbon: 0,

  // Listrik kWh & Kios
  kwh: 45.0,
  kiosLevel: 1,
  kiosOwned: false,
  rentDueDay: 30,

  // Stok Warung & Sparepart
  stock: {
    popmie: 6,
    esteh: 8,
    stikPS: 2,
    kbPill: 1,
    condom: 2
  },
  staffHired: false,
  staffSalary: 1400000,

  // Wi-Fi & Hotspot Bisnis
  wifi: {
    provider: null, // object from WIFI_PROVIDERS
    hotspotOpen: false,
    voucherPrice: 3000,
    voucherHours: 3,
    activeUsers: 0
  },

  // Inventaris & Bilik Rental
  inventoryConsoles: [],
  inventoryTVs: [],
  booths: [],
  queue: [],
  selectedCustomerId: null,
  selectedBoothForGames: null,

  // Karakter Utama (Cewek 18 Tahun)
  player: {
    age: 18,
    gender: 'Perempuan',
    energy: 100,
    charm: 25,
    reputation: 4.2,
    status: 'Lajang', // Lajang | Pacaran | Menikah
    partner: null,
    relationship: 0,
    kbActive: false,
    condomActive: false,
    pregnant: false,
    pregnantWeeks: 0,
    children: 0,
    gossipLevel: 0
  },

  // UI Navigation
  mainTab: 'toko',
  subTab: 'konsol',
  activeCheckout: null,
  givenChange: {}
};

// Inisialisasi 2 Bilik Awal Tahun 2020 (PS1 + PS2 & TV Tabung, 1 game starter biar bisa langsung dicoba)
function initStarterSetup() {
  const c1 = { uid: 'u1', ...CONSOLE_CATALOG[0], games: [PS1_GAMES[0].id, PS1_GAMES[1].id], stickHp: 100, repairing: false };
  const t1 = { uid: 't1', ...TV_CATALOG[0] };
  const c2 = { uid: 'u2', ...CONSOLE_CATALOG[2], games: [PS2_GAMES[0].id, PS2_GAMES[1].id], stickHp: 100, repairing: false };
  const t2 = { uid: 't2', ...TV_CATALOG[1] };

  state.booths.push({
    id: 1, console: c1, tv: t1,
    rate: 2000, discountPct: 0,
    customer: null, timeLeft: 0, totalTime: 0, snackOrder: null
  });
  state.booths.push({
    id: 2, console: c2, tv: t2,
    rate: 3000, discountPct: 0,
    customer: null, timeLeft: 0, totalTime: 0, snackOrder: null
  });
}

function getDrawerTotal() {
  return DENOMINATIONS.reduce((sum, d) => sum + d * (state.drawer[d] || 0), 0);
}

function fmtRp(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

function addLog(msg) {
  const box = document.getElementById('logBox');
  const div = document.createElement('div');
  div.className = 'log-entry';
  const hh = String(state.hour).padStart(2, '0');
  const mm = String(state.minute).padStart(2, '0');
  div.innerHTML = `<span style="color:#64748b">[${state.day}/${state.month}/${state.year} ${hh}:${mm}]</span> ${msg}`;
  box.prepend(div);
  if (box.children.length > 60) box.removeChild(box.lastChild);
}

function editRentalName() {
  const baru = prompt('Masukkan nama baru untuk tempat rental kamu:', state.rentalName);
  if (baru && baru.trim().length >= 3) {
    state.rentalName = baru.trim();
    addLog(`✏️ Nama rental diubah menjadi <b>${state.rentalName}</b>.`);
    renderAll();
  }
}

function setSpeed(s) {
  state.speed = s;
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.classList.toggle('active', Number(btn.dataset.speed) === s);
  });
}

function toggleVip2x() {
  if (state.vip2x) {
    state.vip2x = false;
    addLog('ℹ️ Mode VIP Pengali 2x dinonaktifkan.');
    renderAll();
    return;
  }
  const confirmBuy = confirm(
    '🌟 AKTIFKAN VIP PASS: PENGALI 2x (PAID FEATURE) 🌟\n\n' +
    '• Semua pendapatan Rental, Warung, Wi-Fi & PPOB dikali 2x!\n' +
    '• Kenaikan reputasi & relasi lebih cepat.\n' +
    '• Harga Lisensi Rilis: Rp 29.000 (atau gunakan saldo Bank Rp 500.000 untuk simulasi testing).\n\n' +
    'Klik OK untuk aktivasi Mode Pengali 2x sekarang!'
  );
  if (confirmBuy) {
    state.vip2x = true;
    addLog('🌟 <b>VIP PASS 2x AKTIF!</b> Seluruh pemasukan otomatis dikali 2!');
    renderAll();
  }
}

function toggleShop() {
  if (!state.isOpen && state.player.energy < 10) {
    addLog('⚠️ Energi terlalu lelah! Istirahat/tidur dulu.');
    return;
  }
  state.isOpen = !state.isOpen;
  const btn = document.getElementById('btnToggleShop');
  btn.textContent = state.isOpen ? '🔴 TUTUP RENTAL' : '🟢 BUKA RENTAL';
  btn.className = state.isOpen ? 'danger' : 'success';
  if (!state.isOpen) {
    state.queue = [];
    state.selectedCustomerId = null;
  }
  addLog(state.isOpen ? `🟢 <b>${state.rentalName}</b> resmi BUKA!` : '🔴 Pintu rolling door ditutup.');
  renderAll();
}

// ==================== ENGINE WAKTU & SIMULASI ====================
// 1x = 1 detik nyata = 1 menit in-game (1 jam = 1 menit nyata, 24 jam = 24 menit nyata)
setInterval(() => {
  for (let step = 0; step < state.speed; step++) {
    tickOneInGameMinute();
  }
  renderAll();
}, 1000);

function tickOneInGameMinute() {
  // Jika toko tutup dan semua bilik kosong, waktu berjalan santai hanya saat aktivitas atau tidur
  if (!state.isOpen && state.booths.every(b => !b.customer)) return;

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

  // Hitung konsumsi listrik kWh berdasarkan Watt bilik aktif + Wi-Fi
  let totalWatt = state.wifi.provider ? 25 : 0;
  state.booths.forEach(b => {
    if (b.customer) {
      totalWatt += (b.console ? b.console.watt : 0) + (b.tv ? b.tv.watt : 0);
    }
  });
  if (totalWatt > 0) {
    const kwhUsed = (totalWatt / 1000) / 60;
    state.kwh = Math.max(0, +(state.kwh - kwhUsed).toFixed(4));
    if (state.kwh <= 0) {
      addLog('⚡ <b>TOKEN PLN HABIS (0 kWh)!</b> Semua bilik mati mendadak!');
      state.booths.forEach(b => {
        if (b.customer) { b.customer = null; b.timeLeft = 0; }
      });
    }
  }

  // Update Sesi Main di setiap Bilik
  state.booths.forEach(b => {
    if (!b.customer) return;
    b.timeLeft -= 1;

    // Kerusakan stik acak
    if (b.console && b.console.stickHp > 0 && Math.random() < 0.004) {
      b.console.stickHp = Math.max(0, b.console.stickHp - 15);
      if (b.console.stickHp === 0) {
        addLog(`🎮💥 Stik di <b>Bilik #${b.id}</b> rusak! Gunakan stik cadangan atau servis.`);
      }
    }

    // Pelanggan pesan jajanan
    if (!b.snackOrder && Math.random() < 0.005) {
      b.snackOrder = Math.random() < 0.55 ? 'Pop Mie' : 'Es Teh';
      addLog(`🍜 Bilik #${b.id} (${b.customer.name}) pesan <b>${b.snackOrder}</b>!`);
    }

    // Sesi Selesai -> Kasir
    if (b.timeLeft <= 0 && !state.activeCheckout) {
      triggerCheckout(b);
    }
  });

  // Pelanggan datang mencari game spesifik di unit tertentu
  if (state.isOpen && state.hour >= 8 && state.hour <= 22 && state.queue.length < 5 && Math.random() < 0.07) {
    spawnRealisticCustomer();
  }

  // Kesabaran antrean
  state.queue.forEach(c => c.patience -= 1);
  const gone = state.queue.filter(c => c.patience <= 0);
  if (gone.length > 0) {
    state.queue = state.queue.filter(c => c.patience > 0);
    state.player.reputation = Math.max(1.0, +(state.player.reputation - 0.05).toFixed(2));
    addLog(`😤 ${gone[0].name} pulang karena kelamaan nunggu (${gone[0].wantedGameTitle} penuh/tidak ada).`);
  }

  // Penjualan Voucher Wi-Fi & PPOB otomatis saat buka
  if (state.isOpen && state.wifi.provider && state.wifi.hotspotOpen && Math.random() < 0.025) {
    const mult = state.vip2x ? 2 : 1;
    const income = state.wifi.voucherPrice * mult;
    addCashToDrawer(income);
    state.wifi.activeUsers = Math.min(25, state.wifi.activeUsers + 1);
    addLog(`📶 Warga beli Voucher Wi-Fi (${state.wifi.voucherHours} jam) +${fmtRp(income)}.`);
  }

  if (state.isOpen && state.ppobSaldo >= 25000 && Math.random() < 0.015) {
    const prod = PPOB_PRODUCTS[Math.floor(Math.random() * PPOB_PRODUCTS.length)];
    if (state.ppobSaldo >= prod.modal) {
      state.ppobSaldo -= prod.modal;
      const mult = state.vip2x ? 2 : 1;
      const earned = prod.jual * mult;
      addCashToDrawer(earned);
      addLog(`📲 Transaksi PPOB: <b>${prod.name}</b> (+${fmtRp(earned)} ke laci).`);
    }
  }
}

function onNewHour() {
  state.player.energy = Math.max(0, state.player.energy - 2);
  if (state.wifi.activeUsers > 0) state.wifi.activeUsers = Math.max(0, state.wifi.activeUsers - 2);
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

  // Biaya harian acak jika sudah menikah
  if (state.player.status === 'Menikah' && state.player.partner) {
    const pkg = WEDDING_PACKAGES.find(w => w.id === state.player.partner.weddingId) || WEDDING_PACKAGES[0];
    const [minC, maxC] = pkg.dailyCostRange;
    const dailyExpense = Math.floor(minC + Math.random() * (maxC - minC));
    if (getDrawerTotal() >= dailyExpense) {
      deductCashFromDrawer(dailyExpense);
      addLog(`💍 Kebutuhan rumah tangga harian bersama ${state.player.partner.name}: <b>-${fmtRp(dailyExpense)}</b>.`);
    } else {
      state.bankBalance = Math.max(0, state.bankBalance - dailyExpense);
      addLog(`💍 Kebutuhan rumah tangga harian dipotong dari Bank: <b>-${fmtRp(dailyExpense)}</b>.`);
    }
  }

  // Kehamilan mingguan
  if (state.player.pregnant) {
    state.player.pregnantWeeks += 1;
    if (state.player.pregnantWeeks >= 36) {
      state.player.pregnant = false;
      state.player.pregnantWeeks = 0;
      state.player.children += 1;
      addLog(`👶 Selamat! Kamu melahirkan seorang bayi yang sehat! Total anak: ${state.player.children}.`);
    }
  }
}

function onNewMonth() {
  const kios = KIOS_TIERS.find(k => k.level === state.kiosLevel);
  if (!state.kiosOwned) {
    if (state.bankBalance >= kios.monthlyRent) {
      state.bankBalance -= kios.monthlyRent;
      addLog(`🏠 Sewa kios bulanan (${fmtRp(kios.monthlyRent)}) autodebet dari Bank.`);
    } else {
      addLog(`🚨 Saldo Bank tidak cukup bayar sewa kios bulan ini (${fmtRp(kios.monthlyRent)})!`);
    }
  }
  if (state.wifi.provider) {
    state.bankBalance = Math.max(0, state.bankBalance - state.wifi.provider.monthly);
    addLog(`🌐 Tagihan Wi-Fi ${state.wifi.provider.name} (-${fmtRp(state.wifi.provider.monthly)}) dibayar.`);
  }
  if (state.staffHired) {
    state.bankBalance = Math.max(0, state.bankBalance - state.staffSalary);
    addLog(`🧑‍💼 Gaji karyawan kasir (-${fmtRp(state.staffSalary)}) dibayar.`);
  }
}

// ==================== PELANGGAN & LOGIKA GAME PER-UNIT ====================
function spawnRealisticCustomer() {
  // Pelanggan memilih game yang tersedia di era tahun berjalan
  const eraGames = ALL_GAMES.filter(g => g.year <= state.year);
  const wantedGame = eraGames[Math.floor(Math.random() * eraGames.length)];

  const archetypes = [
    { name: 'Bocil SD', icon: '🧒', honesty: 'quiet', hours: 1 },
    { name: 'Anak SMP', icon: '🎒', honesty: 'greedy', hours: 2 },
    { name: 'Mahasiswa', icon: '🎓', honesty: 'honest', hours: 3 },
    { name: 'Mas-mas Karyawan', icon: '👨🏻', honesty: 'honest', hours: 2 },
    { name: 'Abang Ojol', icon: '🛵', honesty: 'quiet', hours: 1 }
  ];
  const arch = archetypes[Math.floor(Math.random() * archetypes.length)];

  // Cek apakah ada unit milik pemain yang punya game tersebut
  const matchingBooths = state.booths.filter(b => b.console && b.console.games.includes(wantedGame.id));
  const freeMatching = matchingBooths.find(b => !b.customer && b.console.stickHp > 0 && !b.console.repairing);

  const cust = {
    id: 'c_' + Date.now() + Math.random(),
    ...arch,
    wantedGameId: wantedGame.id,
    wantedGameTitle: wantedGame.title,
    wantedPlatform: wantedGame.platform,
    patience: 45
  };
  state.queue.push(cust);

  if (matchingBooths.length === 0) {
    addLog(`${cust.icon} ${cust.name} nyari <b>${wantedGame.title} (${wantedGame.platform})</b>, tapi belum ada unit yang punya game itu!`);
  } else if (!freeMatching) {
    addLog(`${cust.icon} ${cust.name} mau main <b>${wantedGame.title}</b>, tapi unit yang punya game itu lagi dipakai! Dia ikut antre menunggu.`);
  } else {
    addLog(`${cust.icon} ${cust.name} datang mau main <b>${wantedGame.title}</b> (${cust.hours} jam).`);
  }
}

function selectCustomer(id) {
  state.selectedCustomerId = (state.selectedCustomerId === id) ? null : id;
  renderAll();
}

function seatCustomer(boothId) {
  const booth = state.booths.find(b => b.id === boothId);
  const idx = state.queue.findIndex(c => c.id === state.selectedCustomerId);
  if (!booth || idx === -1) return;
  if (state.kwh <= 0) return addLog('⚡ Token PLN 0 kWh! Isi token dulu.');
  if (!booth.console || !booth.tv) return addLog('⚠️ Bilik belum lengkap (butuh Konsol/PC + TV/Monitor).');
  if (booth.console.stickHp <= 0 || booth.console.repairing) return addLog('🔧 Stik/unit bilik ini sedang rusak/diservis!');

  const cust = state.queue[idx];
  if (!booth.console.games.includes(cust.wantedGameId)) {
    addLog(`❌ Di <b>Bilik #${booth.id}</b> tidak terpasang game <b>${cust.wantedGameTitle}</b>! Beli/install dulu atau pilih bilik lain.`);
    return;
  }

  state.queue.splice(idx, 1);
  state.selectedCustomerId = null;
  booth.customer = cust;
  booth.totalTime = cust.hours * 60;
  booth.timeLeft = cust.hours * 60;
  booth.snackOrder = null;
  addLog(`🎮 ${cust.icon} ${cust.name} main <b>${cust.wantedGameTitle}</b> di <b>Bilik #${booth.id}</b>.`);
  renderAll();
}

// ==================== KASIR PECAHAN UANG RUPIAH ====================
function triggerCheckout(booth) {
  const cust = booth.customer;
  const hourly = Math.round(booth.rate * (1 - booth.discountPct / 100));
  const baseBill = hourly * cust.hours + (cust.snackBill || 0);
  const mult = state.vip2x ? 2 : 1;
  const finalBill = Math.max(0, baseBill * mult);

  // Jika 100% gratis (diskon 100%)
  if (finalBill === 0) {
    addLog(`🎁 Sesi gratis promosi selesai untuk ${cust.name}! Reputasi rental meningkat.`);
    state.player.reputation = Math.min(5.0, +(state.player.reputation + 0.08).toFixed(2));
    booth.customer = null;
    booth.timeLeft = 0;
    renderAll();
    return;
  }

  // Jika pakai Karyawan Kasir -> otomatis pas!
  if (state.staffHired) {
    addCashToDrawer(finalBill);
    addLog(`🧑‍💼 Karyawan menyelesaikan pembayaran pas <b>${fmtRp(finalBill)}</b> dari ${cust.name}.`);
    booth.customer = null;
    booth.timeLeft = 0;
    renderAll();
    return;
  }

  // Simulasi uang pecahan yang dibayarkan pelanggan (mulai 2020 sudah ada QRIS)
  const useQris = Math.random() < 0.35;
  if (useQris) {
    state.qrisBalance += finalBill;
    addLog(`📱 ${cust.name} bayar via <b>QRIS</b> sebesar <b>${fmtRp(finalBill)}</b>.`);
    booth.customer = null;
    booth.timeLeft = 0;
    renderAll();
    return;
  }

  // Pelanggan bayar tunai dengan pecahan realistis >= finalBill
  const paidNotes = generateCustomerPayment(finalBill);
  const totalPaid = paidNotes.reduce((a, b) => a + b, 0);
  const exactChange = totalPaid - finalBill;

  // Masukkan uang pelanggan ke laci dulu
  paidNotes.forEach(n => { state.drawer[n] = (state.drawer[n] || 0) + 1; });

  state.activeCheckout = {
    boothId: booth.id,
    cust,
    finalBill,
    totalPaid,
    exactChange
  };
  state.givenChange = {};
  DENOMINATIONS.forEach(d => state.givenChange[d] = 0);

  openCashierModal();
}

function generateCustomerPayment(bill) {
  if (bill <= 5000) return [5000];
  if (bill <= 10000) return [10000];
  if (bill <= 20000) return [20000];
  if (bill <= 50000) return [50000];
  if (bill <= 100000) return [100000];
  const hundreds = Math.ceil(bill / 100000);
  return Array(hundreds).fill(100000);
}

function openCashierModal() {
  const c = state.activeCheckout;
  if (!c) return;
  document.getElementById('cashierModal').style.display = 'flex';
  renderCashierModal();
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
    Total Tagihan: <b>${fmtRp(c.finalBill)}</b><br>
    Uang Diterima: <b>${fmtRp(c.totalPaid)}</b><br>
    Kembalian Seharusnya: <b style="color:#fbbf24;">${fmtRp(c.exactChange)}</b><br>
    Kembalian Kamu Susun: <b style="color:${givenTotal === c.exactChange ? '#34d399' : '#60a5fa'};">${fmtRp(givenTotal)}</b>
  `;

  const grid = document.getElementById('denomGrid');
  grid.innerHTML = '';
  DENOMINATIONS.forEach(d => {
    const count = state.givenChange[d] || 0;
    const stock = state.drawer[d] || 0;
    grid.innerHTML += `
      <div class="denom-btn">
        <b>${fmtRp(d)}</b>
        <small>Laci: ${stock} lbr/kpg</small>
        <div style="display:flex;gap:6px;align-items:center;margin-top:4px;">
          <button onclick="adjustChange(${d}, -1)" ${count <= 0 ? 'disabled' : ''}>-</button>
          <b>${count}</b>
          <button onclick="adjustChange(${d}, 1)" ${count >= stock ? 'disabled' : ''}>+</button>
        </div>
      </div>
    `;
  });
}

function submitCashierChange() {
  const c = state.activeCheckout;
  if (!c) return;
  const givenTotal = DENOMINATIONS.reduce((s, d) => s + d * (state.givenChange[d] || 0), 0);
  const diff = givenTotal - c.exactChange;

  // Potong pecahan dari laci
  DENOMINATIONS.forEach(d => {
    state.drawer[d] -= (state.givenChange[d] || 0);
  });

  if (diff === 0) {
    addLog(`💵 Kembalian pas <b>${fmtRp(givenTotal)}</b>! ${c.cust.name} puas.`);
    state.player.reputation = Math.min(5.0, +(state.player.reputation + 0.03).toFixed(2));
  } else if (diff < 0) {
    // Kembalian KURANG
    const kurang = Math.abs(diff);
    if (c.cust.honesty === 'honest' || c.cust.honesty === 'greedy') {
      addLog(`🗣️ "${c.cust.name}: Kak, kembaliannya kurang ${fmtRp(kurang)}!" Kamu langsung nombokin.`);
      deductCashFromDrawer(kurang);
    } else {
      addLog(`😶 ${c.cust.name} diam aja waktu kembaliannya kurang ${fmtRp(kurang)}, tapi rating turun.`);
      state.player.reputation = Math.max(1.0, +(state.player.reputation - 0.12).toFixed(2));
    }
  } else {
    // Kembalian KELEBIHAN
    if (c.cust.honesty === 'honest') {
      addCashToDrawer(diff);
      addLog(`😇 ${c.cust.name} jujur mengembalikan kelebihan kembalian sebesar <b>${fmtRp(diff)}</b>!`);
    } else {
      addLog(`💸 Waduh! Kembalian kelebihan <b>${fmtRp(diff)}</b> dan ${c.cust.name} langsung kabur! Laci tekor.`);
    }
  }

  const booth = state.booths.find(b => b.id === c.boothId);
  if (booth) {
    booth.customer = null;
    booth.timeLeft = 0;
  }
  state.activeCheckout = null;
  document.getElementById('cashierModal').style.display = 'none';
  renderAll();
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
  let total = getDrawerTotal();
  total = Math.max(0, total - amount);
  DENOMINATIONS.forEach(d => state.drawer[d] = 0);
  addCashToDrawer(total);
}

// ==================== KELOLA BILIK, SERVIS & INSTAL GAME PER-UNIT ====================
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
    <b>Bilik #${booth.id} — ${con.name}</b><br>
    <span style="font-size:0.78rem;color:#94a3b8;">
      ${con.media === 'storage' ? `Kapasitas Storage: <b>${usedGB} GB / ${con.storageGB} GB</b>` : `Media: <b>Kaset/CD Fisik (Bebas Slot)</b>`}
    </span>
  `;

  const availGames = ALL_GAMES.filter(g => g.platform === con.platform && g.year <= state.year);
  const list = document.getElementById('unitGamesList');
  list.innerHTML = '';

  availGames.forEach(g => {
    const owned = con.games.includes(g.id);
    const notEnoughSpace = con.media === 'storage' && !owned && (usedGB + g.sizeGB > con.storageGB);
    list.innerHTML += `
      <div class="item-row">
        <div>
          <b>${g.title}</b> ${g.sizeGB > 0 ? `<span class="badge">${g.sizeGB} GB</span>` : `<span class="badge">CD Fisik</span>`}<br>
          <span style="color:#34d399;">${fmtRp(g.price)}</span>
        </div>
        ${owned ? `
          <button class="danger" onclick="uninstallGameFromUnit('${g.id}')">Hapus</button>
        ` : `
          <button class="primary" ${notEnoughSpace ? 'disabled' : ''} onclick="buyGameForUnit('${g.id}')">
            ${notEnoughSpace ? 'Penuh' : 'Beli & Pasang'}
          </button>
        `}
      </div>
    `;
  });
}

function buyGameForUnit(gameId) {
  const booth = state.booths.find(b => b.id === state.selectedBoothForGames);
  const game = ALL_GAMES.find(g => g.id === gameId);
  if (!booth || !booth.console || !game) return;
  if (getDrawerTotal() < game.price) return addLog('❌ Uang di kas laci tidak cukup untuk beli game ini!');

  deductCashFromDrawer(game.price);
  booth.console.games.push(game.id);
  addLog(`💿 Berhasil beli & pasang <b>${game.title}</b> khusus untuk <b>Bilik #${booth.id}</b>!`);
  renderUnitGamesModal();
  renderAll();
}

function uninstallGameFromUnit(gameId) {
  const booth = state.booths.find(b => b.id === state.selectedBoothForGames);
  if (!booth || !booth.console) return;
  booth.console.games = booth.console.games.filter(id => id !== gameId);
  renderUnitGamesModal();
  renderAll();
}

function repairBoothStick(boothId) {
  const booth = state.booths.find(b => b.id === boothId);
  if (!booth || !booth.console) return;

  // Jika punya stik cadangan, langsung ganti instan!
  if (state.stock.stikPS > 0) {
    state.stock.stikPS -= 1;
    booth.console.stickHp = 100;
    addLog(`🎮 Stik cadangan langsung dipasang di <b>Bilik #${booth.id}</b>! Siap main lagi.`);
    renderAll();
    return;
  }

  // Jika tidak ada stik cadangan, servis otomatis butuh waktu
  if (booth.console.repairing) return;
  booth.console.repairing = true;
  addLog(`🔧 Kamu mulai menyervis stik <b>Bilik #${booth.id}</b> secara mandiri (butuh beberapa detik)...`);
  renderAll();
  setTimeout(() => {
    booth.console.stickHp = 100;
    booth.console.repairing = false;
    addLog(`✅ Servis stik <b>Bilik #${booth.id}</b> selesai! Normal 100%.`);
    renderAll();
  }, 6000);
}

function setBoothPromo(boothId) {
  const booth = state.booths.find(b => b.id === boothId);
  if (!booth) return;
  const val = prompt(
    `Atur Tarif & Diskon Bilik #${booth.id} (${booth.console.name})\n` +
    `Tarif Default 2020: ${fmtRp(booth.rate)}/jam\n` +
    `Masukkan persentase diskon (0 = Normal, 50 = Diskon 50%, 100 = GRATIS PROMO):`,
    booth.discountPct
  );
  if (val !== null && !isNaN(val)) {
    booth.discountPct = Math.max(0, Math.min(100, Number(val)));
    addLog(`🏷️ Bilik #${booth.id} diset diskon <b>${booth.discountPct}%</b>.`);
    renderAll();
  }
}

function serveSnack(boothId) {
  const booth = state.booths.find(b => b.id === boothId);
  if (!booth || !booth.snackOrder) return;
  if (booth.snackOrder === 'Pop Mie' && state.stock.popmie > 0) {
    state.stock.popmie -= 1;
    booth.customer.snackBill = (booth.customer.snackBill || 0) + 8000;
    booth.snackOrder = null;
    addLog(`🍜 Pop Mie diantar ke Bilik #${booth.id} (+Rp 8.000).`);
  } else if (booth.snackOrder === 'Es Teh' && state.stock.esteh > 0) {
    state.stock.esteh -= 1;
    booth.customer.snackBill = (booth.customer.snackBill || 0) + 4000;
    booth.snackOrder = null;
    addLog(`🧊 Es Teh diantar ke Bilik #${booth.id} (+Rp 4.000).`);
  } else {
    addLog(`❌ Stok ${booth.snackOrder} habis! Beli di Store dulu.`);
  }
  renderAll();
}

// ==================== STORE, BANK, WI-FI, LIFE SIM ====================
function switchMainTab(tab, el) {
  state.mainTab = tab;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
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

  if (getDrawerTotal() < item.price) return addLog('❌ Uang kas laci tidak cukup! Tarik tunai dari Bank dulu.');
  deductCashFromDrawer(item.price);

  if (category === 'console' || category === 'pc') {
    state.inventoryConsoles.push({
      uid: 'u_' + Date.now() + Math.random(),
      ...item,
      games: [], // PS/PC BARU KOSONG TANPA GAME!
      stickHp: 100,
      repairing: false
    });
    addLog(`📦 Membeli <b>${item.name}</b> (Kosong tanpa game — jangan lupa beli game-nya!).`);
  } else {
    state.inventoryTVs.push({
      uid: 't_' + Date.now() + Math.random(),
      ...item
    });
    addLog(`📺 Membeli <b>${item.name}</b> masuk ke gudang inventaris.`);
  }
  renderAll();
}

function assembleNewBooth() {
  const kios = KIOS_TIERS.find(k => k.level === state.kiosLevel);
  if (state.booths.length >= kios.maxUnits) {
    return addLog(`⚠️ Kapasitas ${kios.name} penuh (maks ${kios.maxUnits} bilik)! Upgrade/beli kios lebih besar.`);
  }
  if (state.inventoryConsoles.length === 0 || state.inventoryTVs.length === 0) {
    return addLog('⚠️ Butuh minimal 1 Konsol/PC dan 1 TV/Monitor di gudang untuk rakit bilik baru!');
  }
  const con = state.inventoryConsoles.shift();
  const tv = state.inventoryTVs.shift();
  const newId = state.booths.length + 1;
  state.booths.push({
    id: newId,
    console: con,
    tv: tv,
    rate: con.defaultRate + tv.bonusRate,
    discountPct: 0,
    customer: null,
    timeLeft: 0,
    totalTime: 0,
    snackOrder: null
  });
  addLog(`🎉 <b>Bilik #${newId}</b> berhasil dirakit (${con.name} + ${tv.name})! Segera isi game-nya.`);
  renderAll();
}

function upgradePcHardware(boothId, partId) {
  const booth = state.booths.find(b => b.id === boothId);
  const part = PC_PARTS_UPGRADE.find(p => p.id === partId);
  if (!booth || !part) return;
  if (getDrawerTotal() < part.price) return addLog('❌ Kas laci kurang!');
  deductCashFromDrawer(part.price);
  booth.rate += part.bonusRate;
  booth.console.storageGB += part.addGB;
  addLog(`🖥️ Bilik #${booth.id} di-upgrade: <b>${part.name}</b> (Tarif +${fmtRp(part.bonusRate)}/jam).`);
  renderAll();
}

function buySupply(type) {
  const prices = { kwh20: 30000, kwh50: 72000, popmie: 25000, esteh: 15000, stik: 65000, staff: 1400000, kb: 25000, condom: 20000 };
  const cost = prices[type];
  if (getDrawerTotal() < cost) return addLog('❌ Uang laci tidak cukup!');
  deductCashFromDrawer(cost);

  if (type === 'kwh20') { state.kwh = +(state.kwh + 20).toFixed(2); addLog('⚡ Token PLN +20 kWh masuk!'); }
  if (type === 'kwh50') { state.kwh = +(state.kwh + 50).toFixed(2); addLog('⚡ Token PLN +50 kWh masuk!'); }
  if (type === 'popmie') { state.stock.popmie += 6; addLog('🍜 Stok Pop Mie +6 cup.'); }
  if (type === 'esteh') { state.stock.esteh += 10; addLog('🧊 Stok Es Teh +10 gelas.'); }
  if (type === 'stik') { state.stock.stikPS += 2; addLog('🎮 Stik cadangan +2 unit.'); }
  if (type === 'kb') { state.stock.kbPill += 1; addLog('💊 Pil KB (1 strip) dibeli.'); }
  if (type === 'condom') { state.stock.condom += 3; addLog('🛡️ Kondom (1 pack isi 3) dibeli.'); }
  if (type === 'staff') { state.staffHired = true; addLog('🧑‍💼 Karyawan kasir resmi direkrut! Kembalian otomatis pas.'); }
  renderAll();
}

function installWifi(id) {
  const prov = WIFI_PROVIDERS.find(p => p.id === id);
  if (!prov) return;
  if (getDrawerTotal() < prov.installFee) return addLog('❌ Uang kas laci kurang untuk biaya pasang Wi-Fi!');
  deductCashFromDrawer(prov.installFee);
  state.wifi.provider = prov;
  state.wifi.hotspotOpen = true;
  addLog(`📶 Wi-Fi <b>${prov.name}</b> terpasang! Hotspot rental & voucher aktif.`);
  renderAll();
}

function setVoucherConfig() {
  const p = prompt('Harga jual Voucher Wi-Fi per lembar (Rp):', state.wifi.voucherPrice);
  const h = prompt('Durasi paket Voucher Wi-Fi (jam):', state.wifi.voucherHours);
  if (p && h && Number(p) >= 1000 && Number(h) >= 1) {
    state.wifi.voucherPrice = Number(p);
    state.wifi.voucherHours = Number(h);
    addLog(`🎫 Paket Voucher Wi-Fi diatur: <b>${fmtRp(state.wifi.voucherPrice)} / ${state.wifi.voucherHours} jam</b>.`);
    renderAll();
  }
}

function bankAction(action) {
  const input = document.getElementById('bankAmountInput');
  const amt = Math.max(0, Number(input ? input.value : 0));
  if (amt <= 0) return;

  if (action === 'deposit') {
    if (getDrawerTotal() < amt) return addLog('❌ Uang di kas laci kurang!');
    deductCashFromDrawer(amt);
    state.bankBalance += amt;
    addLog(`🏦 Setor tunai <b>${fmtRp(amt)}</b> ke tabungan Bank.`);
  } else if (action === 'withdraw') {
    if (state.bankBalance < amt) return addLog('❌ Saldo Bank tidak cukup!');
    state.bankBalance -= amt;
    addCashToDrawer(amt);
    addLog(`🏧 Tarik tunai <b>${fmtRp(amt)}</b> ke laci kasir.`);
  } else if (action === 'qrisToBank') {
    if (state.qrisBalance <= 0) return;
    const moved = state.qrisBalance;
    state.qrisBalance = 0;
    state.bankBalance += moved;
    addLog(`📲 Cairkan saldo QRIS <b>${fmtRp(moved)}</b> ke rekening Bank.`);
  } else if (action === 'topupPpob') {
    if (state.bankBalance < amt) return addLog('❌ Saldo Bank kurang untuk isi deposit PPOB!');
    state.bankBalance -= amt;
    state.ppobSaldo += amt;
    addLog(`📱 Saldo agen Pulsa & E-Wallet bertambah <b>${fmtRp(amt)}</b>.`);
  }
  renderAll();
}

function buyOrUpgradeKios(mode) {
  const cur = KIOS_TIERS.find(k => k.level === state.kiosLevel);
  if (mode === 'buy') {
    if (state.bankBalance < cur.buyPrice) return addLog('❌ Saldo Bank kurang untuk membeli hak milik kios ini!');
    state.bankBalance -= cur.buyPrice;
    state.kiosOwned = true;
    addLog(`🏢 Selamat! <b>${cur.name}</b> resmi menjadi HAK MILIK (bebas sewa bulanan)!`);
  } else if (mode === 'upgrade') {
    const next = KIOS_TIERS.find(k => k.level === state.kiosLevel + 1);
    if (!next) return;
    const cost = state.kiosOwned ? next.buyPrice : next.monthlyRent * 2;
    if (state.bankBalance < cost) return addLog(`❌ Butuh saldo Bank minimal ${fmtRp(cost)} untuk pindah/ekspansi!`);
    state.bankBalance -= cost;
    state.kiosLevel = next.level;
    addLog(`🚀 Ekspansi berhasil! Sekarang menempati <b>${next.name}</b> (kapasitas ${next.maxUnits} unit).`);
  }
  renderAll();
}

// ==================== LIFE SIMULATOR (PACARAN, NIKAH, HB, KB, KONDOM) ====================
function datePartner(partnerId) {
  const p = PARTNERS_LIST.find(x => x.id === partnerId);
  if (!p) return;
  if (state.player.charm < p.charmReq) {
    return addLog(`💔 ${p.name} menolak karena pesona kamu masih ${state.player.charm} (butuh ${p.charmReq}).`);
  }
  state.player.status = 'Pacaran';
  state.player.partner = { ...p };
  state.player.relationship = 35;
  addLog(`💕 Kamu resmi berpacaran dengan <b>${p.name}</b> (${p.job})!`);
  renderAll();
}

function goHangout() {
  if (!state.player.partner) return;
  if (getDrawerTotal() < 50000) return addLog('❌ Butuh Rp 50.000 di laci untuk jalan bareng.');
  deductCashFromDrawer(50000);
  state.player.relationship = Math.min(100, state.player.relationship + 15);
  state.player.charm = Math.min(100, state.player.charm + 3);
  addLog(`☕ Jalan & ngopi bareng ${state.player.partner.name} (+15% Kemesraan).`);
  renderAll();
}

function toggleProtection(type) {
  if (type === 'kb') {
    if (!state.player.kbActive && state.stock.kbPill <= 0) return addLog('❌ Stok Pil KB habis! Beli di Store dulu.');
    if (!state.player.kbActive) state.stock.kbPill -= 1;
    state.player.kbActive = !state.player.kbActive;
    addLog(state.player.kbActive ? '💊 Pil KB diaktifkan.' : '💊 Pil KB dimatikan.');
  } else if (type === 'condom') {
    if (!state.player.condomActive && state.stock.condom <= 0) return addLog('❌ Stok Kondom habis! Beli di Store dulu.');
    if (!state.player.condomActive) state.stock.condom -= 1;
    state.player.condomActive = !state.player.condomActive;
    addLog(state.player.condomActive ? '🛡️ Kondom dipasang untuk sesi berikutnya.' : '🛡️ Kondom dilepas.');
  }
  renderAll();
}

function doHB() {
  if (!state.player.partner) return;
  if (state.player.energy < 20) return addLog('😴 Energi terlalu lelah!');
  state.player.energy -= 20;
  state.player.relationship = Math.min(100, state.player.relationship + 20);

  const isProtected = state.player.kbActive || state.player.condomActive;
  if (state.player.condomActive) state.player.condomActive = false; // sekali pakai

  addLog(`❤️ Kamu dan ${state.player.partner.name} melakukan HB (Kemesraan ${state.player.relationship}%).`);

  if (!isProtected && !state.player.pregnant && Math.random() < 0.45) {
    state.player.pregnant = true;
    state.player.pregnantWeeks = 1;
    if (state.player.status !== 'Menikah') {
      state.player.reputation = Math.max(1.0, +(state.player.reputation - 0.35).toFixed(2));
      state.player.gossipLevel += 1;
      addLog('🤰 <b>Kamu hamil di luar nikah!</b> Tetangga mulai bergosip dan reputasi rental sedikit menurun.');
    } else {
      addLog('🤰 Selamat! Kamu positif hamil buah hati bersama suami tercinta.');
    }
  }
  renderAll();
}

function marryPartner(pkgId) {
  const pkg = WEDDING_PACKAGES.find(w => w.id === pkgId);
  if (!pkg || !state.player.partner) return;
  if (state.player.relationship < 80) return addLog('💕 Kemesraan minimal 80% untuk melangsungkan pernikahan!');
  if (state.bankBalance < pkg.cost) return addLog(`❌ Saldo Bank kurang untuk paket ${pkg.name} (${fmtRp(pkg.cost)})!`);

  state.bankBalance -= pkg.cost;
  state.player.status = 'Menikah';
  state.player.partner.weddingId = pkg.id;
  state.player.reputation = Math.min(5.0, +(state.player.reputation + pkg.repBonus).toFixed(2));
  addLog(`💒 <b>SAH!</b> Kamu resmi menikah dengan ${state.player.partner.name} lewat paket <b>${pkg.name}</b>!`);
  renderAll();
}

function sleepNextDay() {
  if (state.isOpen) return addLog('⚠️ Tutup rental dulu sebelum tidur!');
  state.player.energy = 100;
  state.hour = 8;
  state.minute = 0;
  onNewDay();
  addLog(`🌅 Selamat pagi! Hari ke-${state.totalDays} (${state.day}/${state.month}/${state.year}). Energi pulih 100%.`);
  renderAll();
}

// ==================== RENDER UI ====================
function renderBooths() {
  const grid = document.getElementById('boothsGrid');
  grid.innerHTML = '';
  state.booths.forEach(b => {
    const con = b.console;
    const tv = b.tv;
    const netRate = Math.round(b.rate * (1 - b.discountPct / 100));
    const pct = b.totalTime ? Math.max(0, Math.round((b.timeLeft / b.totalTime) * 100)) : 0;

    const installedTitles = con.games.map(gid => {
      const g = ALL_GAMES.find(x => x.id === gid);
      return g ? g.title : gid;
    });

    const div = document.createElement('div');
    div.className = 'booth' + (b.customer ? ' active' : '') + (con.stickHp <= 0 ? ' broken' : '');
    div.innerHTML = `
      <div class="booth-top">
        <span>Bilik #${b.id} (${con.platform})</span>
        <span class="badge ${con.stickHp <= 0 ? 'warn' : (b.customer ? 'busy' : 'ok')}">
          ${con.repairing ? 'Diservis' : (con.stickHp <= 0 ? 'Stik Rusak' : (b.customer ? 'Dipakai' : 'Kosong'))}
        </span>
      </div>
      <div class="spec-line">
        🎮 <b>${con.name}</b><br>
        📺 ${tv.name} (${tv.inch}" ${tv.type})<br>
        💵 Tarif: <b>${netRate === 0 ? 'GRATIS PROMO' : fmtRp(netRate) + '/jam'}</b> ${b.discountPct > 0 ? `<span class="badge ok">Disc ${b.discountPct}%</span>` : ''} • Stik: <b>${con.stickHp}%</b>
      </div>
      <div class="games-pill-wrap">
        ${installedTitles.length === 0
          ? `<span style="font-size:0.7rem;color:#f87171;">⚠️ Kosong (Belum ada game!)</span>`
          : installedTitles.map(t => `<span class="game-pill">${t}</span>`).join('')}
      </div>
      ${b.customer ? `
        <div style="background:#0b1120;padding:6px;border-radius:7px;font-size:0.75rem;">
          <div>${b.customer.icon} <b>${b.customer.name}</b> — <i>${b.customer.wantedGameTitle}</i></div>
          <div style="color:#94a3b8;">Sisa: ${b.timeLeft} menit</div>
          <div class="progress-bar" style="margin-top:4px;"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>
      ` : `
        <button class="primary" onclick="seatCustomer(${b.id})" ${(!state.selectedCustomerId || con.stickHp <= 0 || con.repairing) ? 'disabled' : ''}>
          ➕ Dudukkan Pelanggan
        </button>
      `}
      <div style="display:flex;gap:4px;flex-wrap:wrap;">
        <button onclick="openUnitGamesModal(${b.id})" style="flex:1;">💿 Game (${installedTitles.length})</button>
        <button onclick="setBoothPromo(${b.id})">🏷️ Tarif</button>
        ${con.stickHp < 70 ? `<button class="danger" onclick="repairBoothStick(${b.id})">🔧 Servis/Ganti Stik</button>` : ''}
        ${b.snackOrder ? `<button class="success" onclick="serveSnack(${b.id})">🍜 Antar ${b.snackOrder}</button>` : ''}
      </div>
    `;
    grid.appendChild(div);
  });
}

function renderQueue() {
  const list = document.getElementById('queueList');
  document.getElementById('queueCount').textContent = `${state.queue.length}/5`;
  list.innerHTML = '';
  if (state.queue.length === 0) {
    list.innerHTML = `<div style="color:#64748b;font-size:0.78rem;text-align:center;padding:16px 0;">Menunggu pelanggan datang...</div>`;
    return;
  }
  state.queue.forEach(c => {
    const hasUnit = state.booths.some(b => b.console && b.console.games.includes(c.wantedGameId));
    const div = document.createElement('div');
    div.className = 'queue-item' + (state.selectedCustomerId === c.id ? ' selected' : '');
    div.onclick = () => selectCustomer(c.id);
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;font-weight:700;">
        <span>${c.icon} ${c.name}</span>
        <span style="color:var(--accent);">${c.hours} Jam</span>
      </div>
      <div style="font-size:0.74rem;color:${hasUnit ? '#34d399' : '#f87171'};">
        Ingin main: <b>${c.wantedGameTitle}</b> (${c.wantedPlatform}) ${hasUnit ? '' : '— Belum punya!'}
      </div>
      <div style="font-size:0.7rem;color:var(--muted);">Sabar: ${c.patience} mnt</div>
    `;
    list.appendChild(div);
  });
}

function renderRightPanel() {
  const box = document.getElementById('rightPanelContent');
  box.innerHTML = '';

  if (state.mainTab === 'toko') {
    box.innerHTML = `
      <div class="sub-tabs">
        <button class="sub-btn ${state.subTab === 'konsol' ? 'active' : ''}" onclick="switchSubTab('konsol')">🎮 Konsol (${state.year})</button>
        <button class="sub-btn ${state.subTab === 'pc' ? 'active' : ''}" onclick="switchSubTab('pc')">🖥️ PC & Parts</button>
        <button class="sub-btn ${state.subTab === 'tv' ? 'active' : ''}" onclick="switchSubTab('tv')">📺 TV & Monitor</button>
        <button class="sub-btn ${state.subTab === 'warung' ? 'active' : ''}" onclick="switchSubTab('warung')">⚡ Token & Stok</button>
      </div>
      <div style="background:#0b1120;padding:7px;border-radius:8px;font-size:0.74rem;display:flex;justify-content:space-between;align-items:center;">
        <span>Gudang: <b>${state.inventoryConsoles.length} Unit</b> | <b>${state.inventoryTVs.length} TV</b></span>
        <button class="success" onclick="assembleNewBooth()">➕ Rakit Bilik Baru</button>
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
          </div>
        `;
      });
    } else if (state.subTab === 'pc') {
      PC_CATALOG.filter(p => p.year < state.year || (p.year === state.year && p.month <= state.month)).forEach(p => {
        scroll.innerHTML += `
          <div class="item-row">
            <div>
              <b>${p.name}</b><br>
              <span style="color:var(--muted);">${p.watt}W • SSD ${p.storageGB}GB</span><br>
              <b style="color:#34d399;">${fmtRp(p.price)}</b>
            </div>
            <button class="primary" onclick="buyHardware('pc', '${p.id}')">Beli PC</button>
          </div>
        `;
      });
      const pcBooths = state.booths.filter(b => b.console && b.console.platform === 'PC');
      if (pcBooths.length > 0) {
        scroll.innerHTML += `<div style="font-weight:700;color:var(--accent);font-size:0.78rem;margin-top:4px;">🔧 Upgrade Komponen Bilik PC:</div>`;
        pcBooths.forEach(pb => {
          PC_PARTS_UPGRADE.forEach(part => {
            scroll.innerHTML += `
              <div class="item-row">
                <div><b>Bilik #${pb.id}: ${part.name}</b><br><span style="color:#34d399;">${fmtRp(part.price)}</span></div>
                <button onclick="upgradePcHardware(${pb.id}, '${part.id}')">Pasang</button>
              </div>
            `;
          });
        });
      }
    } else if (state.subTab === 'tv') {
      TV_CATALOG.filter(t => t.year <= state.year).forEach(t => {
        scroll.innerHTML += `
          <div class="item-row">
            <div>
              <b>${t.name}</b> <span class="badge">${t.type} ${t.inch}"</span><br>
              <span style="color:var(--muted);">${t.watt}W • Bonus Tarif +${fmtRp(t.bonusRate)}/jam</span><br>
              <b style="color:#34d399;">${fmtRp(t.price)}</b>
            </div>
            <button class="primary" onclick="buyHardware('tv', '${t.id}')">Beli TV</button>
          </div>
        `;
      });
    } else {
      const supplies = [
        { id: 'kwh20', name: '⚡ Token Listrik PLN 20 kWh', price: 30000 },
        { id: 'kwh50', name: '⚡ Token Listrik PLN 50 kWh', price: 72000 },
        { id: 'popmie', name: '🍜 1 Dus Pop Mie (6 cup)', price: 25000 },
        { id: 'esteh', name: '🧊 Bahan Es Teh Manis (10 porsi)', price: 15000 },
        { id: 'stik', name: '🎮 2x Stik PS Cadangan', price: 65000 },
        { id: 'kb', name: '💊 Pil KB (1 Strip)', price: 25000 },
        { id: 'condom', name: '🛡️ Kondom Sutra/Fiesta (Isi 3)', price: 20000 },
        { id: 'staff', name: state.staffHired ? '✅ Karyawan Kasir Aktif' : '🧑‍💼 Rekrut Karyawan Kasir (Otomatis Kembalian)', price: 1400000, disabled: state.staffHired }
      ];
      supplies.forEach(s => {
        scroll.innerHTML += `
          <div class="item-row">
            <div><b>${s.name}</b><br><span style="color:#34d399;">${fmtRp(s.price)}</span></div>
            <button ${s.disabled ? 'disabled' : ''} onclick="buySupply('${s.id}')">${s.disabled ? 'Aktif' : 'Beli'}</button>
          </div>
        `;
      });
    }
  } else if (state.mainTab === 'wifi') {
    box.innerHTML = `
      <div class="item-row" style="flex-direction:column;align-items:stretch;">
        <div style="display:flex;justify-content:space-between;">
          <b>Provider Aktif:</b>
          <span>${state.wifi.provider ? state.wifi.provider.name : 'Belum Pasang'}</span>
        </div>
        ${state.wifi.provider ? `
          <div style="font-size:0.75rem;color:var(--muted);">
            Paket Voucher Hotspot: <b>${fmtRp(state.wifi.voucherPrice)} / ${state.wifi.voucherHours} Jam</b> • User Aktif: <b>${state.wifi.activeUsers}</b>
          </div>
          <div style="display:flex;gap:6px;margin-top:4px;">
            <button class="primary" onclick="setVoucherConfig()">🎫 Atur Harga Voucher</button>
            <button onclick="state.wifi.hotspotOpen=!state.wifi.hotspotOpen;renderAll()">
              ${state.wifi.hotspotOpen ? '🟢 Hotspot Buka' : '🔴 Hotspot Tutup'}
            </button>
          </div>
        ` : ''}
      </div>
      <div style="font-weight:700;font-size:0.78rem;color:var(--accent);">📡 Pilih Paket ISP (${state.year}):</div>
      <div class="scroll-area" id="wifiScroll"></div>
    `;
    const ws = document.getElementById('wifiScroll');
    WIFI_PROVIDERS.filter(p => p.year <= state.year).forEach(p => {
      ws.innerHTML += `
        <div class="item-row">
          <div>
            <b>${p.name}</b><br>
            <span style="color:var(--muted);">Pasang: ${fmtRp(p.installFee)} • Bulanan: ${fmtRp(p.monthly)}</span>
          </div>
          <button class="primary" onclick="installWifi('${p.id}')">Pasang</button>
        </div>
      `;
    });
  } else if (state.mainTab === 'bank') {
    const kios = KIOS_TIERS.find(k => k.level === state.kiosLevel);
    const nextKios = KIOS_TIERS.find(k => k.level === state.kiosLevel + 1);
    box.innerHTML = `
      <div class="item-row" style="flex-direction:column;align-items:stretch;gap:6px;">
        <div style="display:flex;justify-content:space-between;"><span>🏦 Saldo Tabungan Bank:</span><b style="color:#60a5fa;">${fmtRp(state.bankBalance)}</b></div>
        <div style="display:flex;justify-content:space-between;"><span>📲 Saldo QRIS:</span><b style="color:#34d399;">${fmtRp(state.qrisBalance)}</b></div>
        <div style="display:flex;justify-content:space-between;"><span>📱 Deposit Agen Pulsa/Wallet:</span><b style="color:#fbbf24;">${fmtRp(state.ppobSaldo)}</b></div>
        <input type="number" id="bankAmountInput" value="100000" step="50000" />
        <div class="grid-2">
          <button class="success" onclick="bankAction('deposit')">⬇️ Setor ke Bank</button>
          <button class="primary" onclick="bankAction('withdraw')">⬆️ Tarik ke Laci</button>
          <button onclick="bankAction('qrisToBank')">📲 Cairkan QRIS</button>
          <button onclick="bankAction('topupPpob')">📱 Isi Saldo PPOB</button>
        </div>
      </div>

      <div class="item-row" style="flex-direction:column;align-items:stretch;gap:6px;">
        <b>🏢 Status Properti Kios:</b>
        <div style="font-size:0.76rem;color:var(--muted);">
          ${kios.name} (Maks ${kios.maxUnits} unit) • Status: <b>${state.kiosOwned ? 'HAK MILIK' : 'Sewa ' + fmtRp(kios.monthlyRent) + '/bln'}</b>
        </div>
        ${!state.kiosOwned ? `<button class="primary" onclick="buyOrUpgradeKios('buy')">🏠 Beli Hak Milik Kios (${fmtRp(kios.buyPrice)})</button>` : ''}
        ${nextKios ? `<button class="purple" onclick="buyOrUpgradeKios('upgrade')">🚀 Ekspansi ke ${nextKios.name}</button>` : ''}
      </div>

      <div style="font-weight:700;font-size:0.78rem;color:var(--accent);">📲 Katalog Pulsa & E-Wallet (2020+):</div>
      <div class="scroll-area" style="max-height:170px;">
        ${PPOB_PRODUCTS.map(pr => `
          <div class="item-row">
            <span>${pr.name}</span>
            <span style="color:#34d399;">Untung ${fmtRp(pr.jual - pr.modal)}</span>
          </div>
        `).join('')}
      </div>
    `;
  } else if (state.mainTab === 'life') {
    const pl = state.player;
    box.innerHTML = `
      <div class="item-row" style="flex-direction:column;align-items:stretch;gap:5px;">
        <div style="display:flex;justify-content:space-between;">
          <b>👩🏻 Profil Kamu (${pl.gender}, ${pl.age} Thn)</b>
          <span class="badge pink">${pl.status}</span>
        </div>
        <div style="font-size:0.75rem;color:var(--muted);">
          Pesona: <b>${pl.charm}/100</b> • Energi: <b>${pl.energy}%</b> • Anak: <b>${pl.children}</b>
          ${pl.pregnant ? `<br><span style="color:#f472b6;">🤰 Sedang Hamil (${pl.pregnantWeeks} minggu)</span>` : ''}
          ${pl.gossipLevel > 0 ? `<br><span style="color:#f87171;">🗣️ Gosip Tetangga: Level ${pl.gossipLevel}</span>` : ''}
        </div>
        <div class="grid-2" style="margin-top:4px;">
          <button onclick="toggleProtection('kb')">${pl.kbActive ? '💊 KB: AKTIF' : '💊 Aktifkan KB'} (${state.stock.kbPill})</button>
          <button onclick="toggleProtection('condom')">${pl.condomActive ? '🛡️ Kondom: AKTIF' : '🛡️ Pakai Kondom'} (${state.stock.condom})</button>
        </div>
        <button class="primary" onclick="sleepNextDay()">🛏️ Tidur & Lanjut Hari Berikutnya</button>
      </div>

      ${!pl.partner ? `
        <div style="font-weight:700;font-size:0.78rem;color:var(--pink);">💕 Kenalan & Cari Pasangan:</div>
        <div class="scroll-area">
          ${PARTNERS_LIST.map(pt => `
            <div class="item-row">
              <div><b>${pt.name}</b><br><span style="color:var(--muted);">${pt.job} • Syarat Pesona: ${pt.charmReq}</span></div>
              <button class="pink" onclick="datePartner('${pt.id}')">Pacaran</button>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="item-row" style="flex-direction:column;align-items:stretch;gap:6px;">
          <div><b>💑 Pasangan: ${pl.partner.name}</b> (${pl.partner.job})</div>
          <div style="font-size:0.76rem;">Kemesraan: <b>${pl.relationship}%</b></div>
          <div class="grid-2">
            <button onclick="goHangout()">☕ Kencan (Rp 50rb)</button>
            <button class="pink" onclick="doHB()">❤️ Tombol HB</button>
          </div>
        </div>
        ${pl.status === 'Pacaran' ? `
          <div style="font-weight:700;font-size:0.78rem;color:var(--accent);">💒 Pilihan Paket Pernikahan:</div>
          <div class="scroll-area" style="max-height:190px;">
            ${WEDDING_PACKAGES.map(w => `
              <div class="item-row">
                <div><b>${w.name}</b><br><span style="color:#fbbf24;">${fmtRp(w.cost)} • +${w.repBonus} Rating</span></div>
                <button class="success" onclick="marryPartner('${w.id}')">Menikah</button>
              </div>
            `).join('')}
          </div>
        ` : ''}
      `}
    `;
  }
}

function renderAll() {
  document.getElementById('rentalTitleDisplay').textContent = state.rentalName;
  const hh = String(state.hour).padStart(2, '0');
  const mm = String(state.minute).padStart(2, '0');
  document.getElementById('hudDateTime').textContent = `${state.day}/${state.month}/${state.year} • ${hh}:${mm}`;
  document.getElementById('hudDrawer').textContent = fmtRp(getDrawerTotal());
  document.getElementById('hudBank').textContent = fmtRp(state.bankBalance);
  document.getElementById('hudQris').textContent = fmtRp(state.qrisBalance);
  document.getElementById('hudKwh').textContent = `${state.kwh.toFixed(1)} kWh`;
  document.getElementById('hudRep').textContent = `⭐ ${state.player.reputation.toFixed(2)}`;
  document.getElementById('hudAge').textContent = `👩🏻 ${state.player.age} Thn (${state.player.status})`;

  const vipBtn = document.getElementById('btnVip2x');
  vipBtn.textContent = state.vip2x ? '🌟 VIP 2x: AKTIF' : '🔒 Aktifkan 2x Boost';
  vipBtn.className = state.vip2x ? 'primary' : '';

  renderQueue();
  renderBooths();
  renderRightPanel();
}

initStarterSetup();
addLog(`🎮 Selamat datang di <b>Rental Simulator by Oneilverse</b>! Tahun dimulai: <b>Januari 2020</b>.`);
addLog(`💡 Tips: Setiap konsol/PC baru kosong tanpa game. Klik tombol <b>💿 Game</b> di tiap bilik untuk membeli game-nya!`);
renderAll();
