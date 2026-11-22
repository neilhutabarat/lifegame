// ID SIMULATOR BY ONEILVERSE - V1.0 FULL REALISM & BUG-FREE ENGINE
const STORAGE_KEY = 'oneilverse_id_simulator_v1_0_full';
const THEME_KEY = 'oneilverse_theme_v1';

const state = {
  version: 'v1.0',
  gameMode: 'dev',
  cityId: 'jkt',
  paused: false,
  speed: 1,

  // Waktu & Kalender Asli
  year: 2019,
  month: 1,
  day: 1,
  dayOfWeek: 2,
  totalDays: 1,
  hour: 8,
  minute: 0,

  // 4 Pos Keuangan
  handWallet: 1500000,
  personalBank: 94500000,
  laciCash: 2000000,
  businessPpobBalance: 2000000,

  // Listrik PLN & Lab R&D Baterai
  kwh: 25.0,
  plnBlackout: false,
  blackoutMinutesLeft: 0,
  batteryLab: {
    capacityMah: 5000,
    currentWh: 18.5,
    efficiencyPct: 50,
    isLocked: false,
    chargerTierIdx: 0,
    chargerStepProgress: 0,
    chargerStepTarget: 12,
    nextStepName: CHARGER_STEPS[0]
  },

  // Usaha & Rental (Rental hanya terbuka jika disewa!)
  rentedBusinesses: [],
  rentalUnlocked: false,
  rentalOpen: false,
  rooms: [],
  employees: [],

  // Aset Pribadi (Punya kondisi, bahan bakar, usia pakai & bisa dijual kembali)
  ownedGadgets: [],
  ownedVehicles: [],

  // Karakter Utama
  player: {
    name: 'Neila Aura',
    gender: 'Perempuan',
    religion: 'Islam',
    ethnicity: 'chinese',
    birthYear: 2001,
    age: 18,
    energy: 100,
    hunger: 90,
    hygiene: 95,
    mood: 85,
    hbBar: 20,
    guiltBar: 0,
    isSick: false,
    bpjsTier: 'none',
    hasPrivateToy: false,
    charm: 35,
    worshipDoneToday: [],
    job: null,
    college: {
      enrolled: false,
      majorId: null,
      majorName: '',
      semester: 1,
      monthsInSemester: 0,
      preClinicSemesters: 8,
      totalSemesters: 12,
      classesThisSem: 0,
      requiredClassesPerSem: 6,
      skedEarned: false,
      graduated: false,
      droppedOut: false
    },
    partner: null,
    affairPartner: null,
    relationship: 0,
    affairRelationship: 0,
    kbActive: false,
    condomActive: false,
    pregnant: false,
    pregnantWeeks: 0,
    babyFatherEthnicity: 'chinese',
    childrenList: []
  },

  mainTab: 'karier',
  gadgetBrandFilter: 'Semua',
  gadgetCatFilter: 'Semua',
  vehCatFilter: 'Semua'
};

function fmtRp(n) { return 'Rp ' + Math.round(n).toLocaleString('id-ID'); }
function roundTo500(n) { return Math.max(500, Math.round(n / 500) * 500); }
function getCity() { return INDONESIA_CITIES.find(c => c.id === state.cityId) || INDONESIA_CITIES[0]; }
function getCurrentUmr() { return roundTo500(getCity().umr2024 * getEraMultiplier(state.year)); }
function getEraPrice(base2024) { return roundTo500(base2024 * getEraMultiplier(state.year)); }
function getMaxBatteryWh() { return (state.batteryLab.capacityMah * 3.7) / 1000; }
function getDaysInMonth(y, m) { return new Date(y, m, 0).getDate(); }
function computeDayOfWeek(y, m, d) { return new Date(y, m - 1, d).getDay(); }

function addLog(msg) {
  const box = document.getElementById('logBox');
  if (!box) return;
  const div = document.createElement('div');
  div.className = 'log-entry';
  const hh = String(state.hour).padStart(2, '0');
  const mm = String(state.minute).padStart(2, '0');
  div.innerHTML = `<span style="color:var(--muted)">[${DAY_NAMES[state.dayOfWeek]}, ${state.day}/${state.month}/${state.year} ${hh}:${mm}]</span> ${msg}`;
  box.prepend(div);
  if (box.children.length > 75) box.removeChild(box.lastChild);
}

// ==================== TEMA CLEAN LIGHT / DARK ====================
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  const btn = document.getElementById('btnTheme');
  if (btn) btn.textContent = isDark ? '☀️ Terang' : '🌙 Gelap';
}
(function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark') document.body.classList.add('dark-theme');
})();

// ==================== CUSTOM MODAL & PEMBUATAN KARAKTER ====================
function showCustomModal(title, body, footer) {
  document.getElementById('customModalTitle').innerHTML = title;
  document.getElementById('customModalBody').innerHTML = body;
  document.getElementById('customModalFooter').innerHTML = footer || '';
  document.getElementById('customModalBackdrop').style.display = 'flex';
}
function closeCustomModal() { document.getElementById('customModalBackdrop').style.display = 'none'; }

function validateStartYearInput() {
  const bYear = Number(document.getElementById('ccBYear').value) || 2001;
  const minStart = Math.max(1980, bYear + 17);
  const sInp = document.getElementById('ccStartYear');
  sInp.min = minStart;
  if (Number(sInp.value) < minStart) sInp.value = minStart;
  document.getElementById('ccAgePreview').textContent = `Usia saat mulai: ${Number(sInp.value) - bYear} tahun (Minimal tahun mulai: ${minStart})`;
}

function openCharacterCreationModal() {
  const islands = [...new Set(INDONESIA_CITIES.map(c => c.island))];
  const cityOptions = islands.map(isl =>
    `<optgroup label="Pulau / Wilayah ${isl}">` +
    INDONESIA_CITIES.filter(c => c.island === isl).map(c => `<option value="${c.id}">${c.name}</option>`).join('') +
    `</optgroup>`
  ).join('');

  showCustomModal(
    '🇮🇩 Buat Karakter — ID Simulator by Oneilverse (v1.0)',
    `<div class="grid-2">
       <div><label style="font-size:0.71rem;color:var(--muted);">Nama Karakter:</label><input type="text" id="ccName" value="Neila Aura" /></div>
       <div><label style="font-size:0.71rem;color:var(--muted);">Jenis Kelamin:</label><select id="ccGender"><option value="Perempuan">Perempuan</option><option value="Laki-laki">Laki-laki</option></select></div>
     </div>
     <div class="grid-2">
       <div><label style="font-size:0.71rem;color:var(--muted);">Agama (Jadwal Ibadah Realistis):</label><select id="ccReligion">${RELIGIONS_ID.map(r => `<option value="${r}">${r}</option>`).join('')}</select></div>
       <div><label style="font-size:0.71rem;color:var(--muted);">Etnis / Keturunan:</label><select id="ccEthnicity">${ETHNICITIES.map(e => `<option value="${e.id}">${e.name}</option>`).join('')}</select></div>
     </div>
     <div class="grid-2">
       <div><label style="font-size:0.71rem;color:var(--muted);">Kota / Daerah (38 Provinsi Indonesia):</label><select id="ccCity">${cityOptions}</select></div>
       <div><label style="font-size:0.71rem;color:var(--muted);">Tahun Kelahiran (Min. 1962):</label><input type="number" id="ccBYear" value="2001" min="1962" max="2009" oninput="validateStartYearInput()" /></div>
     </div>
     <div>
       <label style="font-size:0.71rem;color:var(--muted);">Tahun Mulai Bermain (1980–2026, Usia Min. 17 Thn):</label>
       <input type="number" id="ccStartYear" value="2019" min="1980" max="2026" oninput="validateStartYearInput()" />
       <div id="ccAgePreview" style="font-size:0.7rem;color:var(--green);margin-top:3px;">Usia saat mulai: 18 tahun (Minimal tahun mulai: 2018)</div>
     </div>`,
    `<button class="purple" onclick="finishCharacterSetup('dev')">🛠️ Mode Dev</button>
     <button class="success" onclick="finishCharacterSetup('release')">🎮 Mode Rilis (Realistis)</button>`
  );
}

function finishCharacterSetup(mode) {
  const name = document.getElementById('ccName').value.trim() || 'Warga Nusantara';
  const gender = document.getElementById('ccGender').value;
  const religion = document.getElementById('ccReligion').value;
  const ethnicity = document.getElementById('ccEthnicity').value;
  const cityId = document.getElementById('ccCity').value;
  const bYear = Math.max(1962, Math.min(2009, Number(document.getElementById('ccBYear').value) || 2001));
  const startYear = Math.max(1980, Math.max(bYear + 17, Math.min(2026, Number(document.getElementById('ccStartYear').value) || 2019)));

  state.gameMode = mode;
  state.cityId = cityId;
  state.year = startYear;
  state.month = 1; state.day = 1;
  state.dayOfWeek = computeDayOfWeek(startYear, 1, 1);
  state.totalDays = 1;
  state.hour = 8; state.minute = 0;

  state.rentedBusinesses = [];
  state.rentalUnlocked = false;
  state.rentalOpen = false;
  state.rooms = [];
  for (let i = 1; i <= 5; i++) {
    state.rooms.push({ id: i, mode: 'empty', rate: 0, customer: null, timeLeft: 0, totalTime: 0, cleaningTime: 0 });
  }
  state.ownedGadgets = [];
  state.ownedVehicles = [];
  state.kwh = 25.0;
  state.plnBlackout = false;
  state.blackoutMinutesLeft = 0;
  state.batteryLab = { capacityMah: 5000, currentWh: 18.5, efficiencyPct: 50, isLocked: false, chargerTierIdx: 0, chargerStepProgress: 0, chargerStepTarget: 12, nextStepName: CHARGER_STEPS[0] };

  state.player = {
    name, gender, religion, ethnicity, birthYear: bYear, age: startYear - bYear,
    energy: 100, hunger: 90, hygiene: 95, mood: 85, hbBar: 20, guiltBar: 0,
    isSick: false, bpjsTier: 'none', hasPrivateToy: false, charm: 35,
    worshipDoneToday: [], job: null,
    college: { enrolled: false, majorId: null, majorName: '', semester: 1, monthsInSemester: 0, preClinicSemesters: 8, totalSemesters: 12, classesThisSem: 0, requiredClassesPerSem: 6, skedEarned: false, graduated: false, droppedOut: false },
    partner: null, affairPartner: null, relationship: 0, affairRelationship: 0,
    kbActive: false, condomActive: false, pregnant: false, pregnantWeeks: 0, babyFatherEthnicity: ethnicity, childrenList: []
  };

  const mult = getEraMultiplier(startYear);
  if (mode === 'dev') {
    state.handWallet = roundTo500(2500000 * mult);
    state.personalBank = roundTo500(95000000 * mult);
    state.laciCash = roundTo500(2000000 * mult);
    state.businessPpobBalance = roundTo500(1000000 * mult);
  } else {
    state.handWallet = roundTo500(1500000 * mult);
    state.personalBank = roundTo500(12000000 * mult);
    state.laciCash = 0;
    state.businessPpobBalance = 0;
  }

  addLog(`🇮🇩 Selamat datang <b>${name}</b> (${gender}, ${state.player.age} thn) di <b>${getCity().name}</b> tahun <b>${startYear}</b>. UMR: <b>${fmtRp(getCurrentUmr())}</b>.`);
  closeCustomModal();
  saveGame(true);
  renderAll(true);
}

// ==================== ENGINE WAKTU (ANTI-BUG DROPDOWN & ANTI-SCROLL JUMP!) ====================
setInterval(() => {
  if (state.paused) return;
  advanceTimeMinutes(state.speed);
  updateHudOnly();
  // HANYA update angka/bar secara langsung by ID, JANGAN PERNAH panggil renderRightPanel() di dalam timer!
  updateLiveElementsOnly();
}, 1000);

setInterval(() => { saveGame(false); }, 10000);

function togglePause() { state.paused = !state.paused; updateHudOnly(); }
function setSpeed(s) { state.speed = s; state.paused = false; updateHudOnly(); }

function advanceTimeMinutes(totalMins) {
  for (let i = 0; i < totalMins; i++) {
    tickOneMinute();
  }
}

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

  // Pemadaman bergilir acak sesekali
  if (!state.plnBlackout && state.kwh > 0 && Math.random() < 0.0005) {
    state.plnBlackout = true;
    state.blackoutMinutesLeft = Math.floor(25 + Math.random() * 50);
    addLog(`⚡⚠️ <b>MATI LAMPU PLN!</b> Baterai modifikasi (${state.batteryLab.capacityMah.toLocaleString('id-ID')} mAh) mengambil alih listrik.`);
  }

  let loadW = 45;
  if (state.rentalUnlocked && state.rentalOpen) {
    loadW += 65; // Laptop kasir
    state.rooms.forEach(r => { if (r.customer) loadW += 220; });
  }

  const maxWh = getMaxBatteryWh();
  if (!state.plnBlackout) {
    state.kwh = Math.max(0, +(state.kwh - (loadW / 1000) / 60).toFixed(4));
    if (state.batteryLab.currentWh < maxWh) {
      const cWatt = CHARGER_TIERS[state.batteryLab.chargerTierIdx] || 5;
      state.batteryLab.currentWh = Math.min(maxWh, state.batteryLab.currentWh + ((cWatt * 0.85) / 1000) / 60);
    }
  } else {
    state.blackoutMinutesLeft -= 1;
    const effFactor = Math.max(0.15, 1.3 - (state.batteryLab.efficiencyPct / 100));
    state.batteryLab.currentWh = Math.max(0, state.batteryLab.currentWh - ((loadW * effFactor) / 1000) / 60);
    if (state.blackoutMinutesLeft <= 0) {
      state.plnBlackout = false;
      addLog('💡 <b>Listrik PLN kembali menyala!</b>');
    }
  }

  // Makan otomatis jam makan jika ada uang di dompet
  if (state.minute === 0 && (state.hour === 8 || state.hour === 13 || state.hour === 19)) {
    const cost = roundTo500(18000 * getCity().costFactor * getEraMultiplier(state.year));
    if (state.handWallet >= cost && state.player.hunger < 75) {
      state.handWallet -= cost;
      state.player.hunger = Math.min(100, state.player.hunger + 35);
      addLog(`🍽️ Makan harian (${getCity().name}): <b>-${fmtRp(cost)}</b>.`);
    }
  }

  // Operasional Room Rental jika sudah disewa & dibuka
  const powerOk = (!state.plnBlackout && state.kwh > 0) || (state.plnBlackout && state.batteryLab.currentWh > 0);
  if (state.rentalUnlocked && state.rentalOpen && powerOk) {
    state.rooms.forEach(r => {
      if (r.cleaningTime > 0) r.cleaningTime -= 1;
      if (r.customer) {
        r.timeLeft -= 1;
        if (r.timeLeft <= 0) {
          const isCouple = r.mode === 'couple';
          r.customer = null;
          if (isCouple) r.cleaningTime = 15;
        }
      }
    });
    if (Math.random() < 0.08) {
      const ready = state.rooms.filter(r => !r.customer && r.cleaningTime === 0 && r.mode !== 'empty');
      if (ready.length > 0) {
        const rm = ready[Math.floor(Math.random() * ready.length)];
        const hrs = Math.floor(Math.random() * 3) + 1;
        const pay = roundTo500(rm.rate * hrs);
        rm.customer = { name: 'Tamu', hours: hrs };
        rm.totalTime = hrs * 60; rm.timeLeft = hrs * 60;
        state.laciCash += pay;
        addLog(`💵 Tamu masuk <b>Room #${rm.id}</b> (${hrs} jam) bayar <b>+${fmtRp(pay)}</b> ke Laci.`);
        renderMainWorkspace();
      }
    }
  }
}

function onNewHour() {
  state.player.energy = Math.max(0, state.player.energy - 2);
  state.player.hunger = Math.max(0, state.player.hunger - 3);
  state.player.hygiene = Math.max(0, state.player.hygiene - 2);
  state.player.hbBar = Math.min(100, state.player.hbBar + 3);
  if (state.player.guiltBar >= 50) state.player.mood = Math.max(0, state.player.mood - 2);

  if ((state.player.energy <= 0 || state.player.hunger <= 0) && !state.player.isSick) {
    state.player.isSick = true;
    addLog(`🤒⚠️ <b>KAMU JATUH SAKIT!</b> Stamina/makan habis. Segera berobat ke Klinik/RS di tab Hidup.`);
    renderMainWorkspace();
  }
}

function onNewDay() {
  state.day += 1;
  state.totalDays += 1;
  state.player.worshipDoneToday = [];

  const maxDays = getDaysInMonth(state.year, state.month);
  if (state.day > maxDays) {
    state.day = 1;
    state.month += 1;
    onNewMonth();
  }
  if (state.month > 12) {
    state.month = 1;
    state.year += 1;
    state.player.age += 1;
    state.ownedGadgets.forEach(g => { g.condition = Math.max(10, g.condition - 8); });
    state.ownedVehicles.forEach(v => { v.condition = Math.max(10, v.condition - 5); });
    addLog(`🎂 Tahun <b>${state.year}</b>! Usiamu sekarang <b>${state.player.age} tahun</b>.`);
  }
  state.dayOfWeek = computeDayOfWeek(state.year, state.month, state.day);

  const hol = NATIONAL_HOLIDAYS[`${state.day}-${state.month}`];
  if (hol) addLog(`🇮🇩 Hari Libur Nasional: <b>${hol.name}</b>.`);

  state.rentedBusinesses.forEach(b => {
    if (!b.isInteractiveRental) {
      let profit = roundTo500(b.dailyProfitBase * getEraMultiplier(state.year) * getCity().costFactor);
      if (b.id === 'biz_battery_shop') {
        profit = roundTo500(profit * (1 + state.batteryLab.efficiencyPct / 100) * Math.max(1, state.batteryLab.capacityMah / 5000));
      }
      state.personalBank += profit;
      addLog(`🏢 Laba harian <b>${b.name}</b>: <b>+${fmtRp(profit)}</b> ke Bank Pribadi.`);
    }
  });

  if (state.player.pregnant) {
    state.player.pregnantWeeks += 1;
    if (state.player.pregnantWeeks >= 36) {
      state.player.pregnant = false; state.player.pregnantWeeks = 0;
      const desc = getMixedChildAppearance(state.player.ethnicity, state.player.babyFatherEthnicity);
      state.player.childrenList.push({ name: `Anak ke-${state.player.childrenList.length + 1}`, appearance: desc, age: 0 });
      addLog(`👶 Buah hati lahir sehat! Ciri fisik: <b>${desc}</b>.`);
    }
  }
}

function onNewMonth() {
  if (state.player.job) {
    state.personalBank += state.player.job.monthlySalary;
    addLog(`💼 Gaji bulanan <b>${state.player.job.title}</b> cair: <b>+${fmtRp(state.player.job.monthlySalary)}</b>.`);
  }

  const bpjs = BPJS_TIERS.find(b => b.id === state.player.bpjsTier);
  if (bpjs && bpjs.monthly2024 > 0) {
    const fee = getEraPrice(bpjs.monthly2024);
    if (state.personalBank >= fee) {
      state.personalBank -= fee;
      addLog(`🏥 Iuran bulanan <b>${bpjs.name}</b> terpotong: <b>-${fmtRp(fee)}</b>.`);
    } else {
      state.player.bpjsTier = 'none';
      addLog(`⚠️ Saldo Bank kurang untuk bayar BPJS! Kepesertaan BPJS dinonaktifkan.`);
    }
  }

  state.rentedBusinesses.forEach(b => {
    state.personalBank = Math.max(0, state.personalBank - b.monthlyRent);
  });

  // PROGRES SEMESTER KULIAH REALISTIS (1 SEMESTER = 6 BULAN AKADEMIK)
  const col = state.player.college;
  if (col.enrolled && !col.graduated && !col.droppedOut) {
    col.monthsInSemester += 1;
    if (col.monthsInSemester >= 6) {
      const attRatio = col.classesThisSem / col.requiredClassesPerSem;
      if (attRatio < 0.5) {
        col.droppedOut = true;
        col.enrolled = false;
        addLog(`❌🎓 <b>DROP OUT (DO)!</b> Kehadiran Semester ${col.semester} hanya ${Math.round(attRatio * 100)}% (wajib minimal 50%).`);
      } else {
        const maj = UNIVERSITY_MAJORS.find(m => m.id === col.majorId);
        if (col.majorId === 'med' && col.semester === col.preClinicSemesters && !col.skedEarned) {
          col.skedEarned = true;
          addLog(`🎓 <b>LULUS SARJANA KEDOKTERAN (S.Ked)!</b> Mulai Semester 9 masuk tahap <b>KOAS (2 Tahun)</b> di RS.`);
        }
        if (col.semester >= col.totalSemesters) {
          col.graduated = true;
          col.enrolled = false;
          if (maj && maj.degreePrefix && !state.player.name.startsWith(maj.degreePrefix)) {
            state.player.name = maj.degreePrefix + state.player.name;
          }
          addLog(`🎓🎉 <b>WISUDA & SUMPAH PROFESI!</b> Lulus <b>${col.majorName}</b> (${state.player.name})!`);
        } else {
          const ukt = getEraPrice(maj.baseUkt2024);
          if (state.personalBank >= ukt) {
            state.personalBank -= ukt;
            col.semester += 1;
            col.monthsInSemester = 0;
            col.classesThisSem = 0;
            addLog(`📑 Naik ke <b>Semester ${col.semester}</b> (UKT -${fmtRp(ukt)}).`);
          } else {
            col.monthsInSemester = 6;
            addLog(`⚠️ Menunggak UKT Semester ${col.semester + 1} (${fmtRp(ukt)})! Siapkan saldo Bank.`);
          }
        }
      }
    }
  }
}

// ==================== TIDUR & SKIP 1 BULAN AMAN ====================
function sleepToMorning() {
  state.player.energy = 100;
  state.hour = 7;
  state.minute = 0;
  onNewDay();
  addLog('🌅 Bangun pagi dalam keadaan segar (Stamina 100%).');
  saveGame(true);
  renderAll(true);
}

function skipOneMonthSafe() {
  // Simulasikan 30 hari dengan makan & istirahat normal supaya tidak jatuh sakit tiba-tiba
  const daysToSkip = getDaysInMonth(state.year, state.month);
  for (let i = 0; i < daysToSkip; i++) {
    state.player.energy = Math.max(60, state.player.energy);
    state.player.hunger = Math.max(60, state.player.hunger);
    onNewDay();
  }
  state.hour = 8; state.minute = 0;
  addLog(`⏩ Waktu maju 1 bulan penuh (${state.day}/${state.month}/${state.year}).`);
  saveGame(true);
  renderAll(true);
}

// ==================== TRANSFER BANK / DOMPET / LACI ====================
function openBankTransferModal() {
  showCustomModal(
    '🏦 Transfer Antar Pos Keuangan (4 Pos)',
    `<div style="font-size:0.76rem;background:var(--panel-2);padding:8px;border-radius:8px;border:1px solid var(--border);line-height:1.5;">
      👛 Dompet di Tangan: <b style="color:var(--green);">${fmtRp(state.handWallet)}</b><br>
      🏦 Bank Pribadi: <b style="color:var(--accent);">${fmtRp(state.personalBank)}</b><br>
      🗄️ Laci Kasir Usaha: <b style="color:var(--purple);">${fmtRp(state.laciCash)}</b>
    </div>
    <label style="font-size:0.73rem;color:var(--muted);">Nominal Transfer (Kelipatan Rp 500):</label>
    <input type="number" id="tfAmtInp" value="500000" step="50000" />
    <div class="grid-2">
      <button class="success" onclick="doBankTransfer('bankToHand')">Bank ➡️ Dompet Tangan</button>
      <button class="primary" onclick="doBankTransfer('handToBank')">Dompet ➡️ Bank Pribadi</button>
      <button class="purple" onclick="doBankTransfer('laciToBank')">Laci ➡️ Bank Pribadi</button>
      <button onclick="doBankTransfer('bankToLaci')">Bank ➡️ Laci Usaha</button>
    </div>`,
    `<button onclick="closeCustomModal()">Tutup</button>`
  );
}

function doBankTransfer(dir) {
  const amt = roundTo500(Math.max(0, Number(document.getElementById('tfAmtInp')?.value || 0)));
  if (amt <= 0) return;
  if (dir === 'bankToHand') {
    if (state.personalBank < amt) return addLog('❌ Saldo Bank Pribadi kurang!');
    state.personalBank -= amt; state.handWallet += amt;
    addLog(`👛 Tarik tunai ke Dompet: <b>+${fmtRp(amt)}</b>.`);
  } else if (dir === 'handToBank') {
    if (state.handWallet < amt) return addLog('❌ Uang di Dompet kurang!');
    state.handWallet -= amt; state.personalBank += amt;
    addLog(`🏦 Setor Dompet ke Bank: <b>+${fmtRp(amt)}</b>.`);
  } else if (dir === 'laciToBank') {
    if (state.laciCash < amt) return addLog('❌ Uang di Laci kurang!');
    state.laciCash -= amt; state.personalBank += amt;
    addLog(`🏦 Setor Laci Usaha ke Bank: <b>+${fmtRp(amt)}</b>.`);
  } else if (dir === 'bankToLaci') {
    if (state.personalBank < amt) return addLog('❌ Saldo Bank Pribadi kurang!');
    state.personalBank -= amt; state.laciCash += amt;
    addLog(`🗄️ Suntik dana Bank ke Laci: <b>+${fmtRp(amt)}</b>.`);
  }
  saveGame(true); updateHudOnly(); openBankTransferModal();
}

// ==================== BPJS, KESEHATAN, PLN TOKEN & ASET ====================
function setBpjsTier(val) {
  state.player.bpjsTier = val;
  const obj = BPJS_TIERS.find(b => b.id === val);
  addLog(`🏥 Status BPJS Kesehatan diatur ke: <b>${obj ? obj.name : val}</b>.`);
  saveGame(true);
  renderMainWorkspace();
}

function visitClinicHospital() {
  if (!state.player.isSick) return addLog('✅ Kondisi tubuhmu sedang sehat.');
  const bpjs = BPJS_TIERS.find(b => b.id === state.player.bpjsTier);
  const rawCost = getEraPrice(350000);
  const finalCost = (bpjs && bpjs.coverPct === 100) ? 0 : rawCost;

  if (finalCost > 0 && state.personalBank < finalCost && state.handWallet < finalCost) {
    return addLog(`❌ Uang tidak cukup untuk berobat (${fmtRp(finalCost)})!`);
  }
  if (finalCost > 0) {
    if (state.personalBank >= finalCost) state.personalBank -= finalCost;
    else state.handWallet -= finalCost;
  }
  state.player.isSick = false;
  state.player.energy = 75;
  state.player.hunger = 70;
  advanceTimeMinutes(120);
  addLog(finalCost === 0
    ? `🏥 Berobat di RS selesai & sembuh! Biaya <b>Rp 0 (Ditanggung ${bpjs.name})</b>.`
    : `🏥 Berobat di Klinik selesai & sembuh! Biaya <b>-${fmtRp(finalCost)}</b>.`);
  saveGame(true); renderAll(true);
}

function buyPlnToken(nominal2024) {
  const info = calcPlnToken(nominal2024, state.year);
  if (state.personalBank < info.totalPay && state.laciCash < info.totalPay) {
    return addLog(`❌ Saldo Bank/Laci kurang untuk beli Token PLN (${fmtRp(info.totalPay)})!`);
  }
  if (state.laciCash >= info.totalPay) state.laciCash -= info.totalPay;
  else state.personalBank -= info.totalPay;
  state.kwh = +(state.kwh + info.kwhReceived).toFixed(2);
  addLog(`⚡ Beli Token PLN ${fmtRp(info.nominal)} (Bayar ${fmtRp(info.totalPay)} incl. admin) ➔ Masuk <b>+${info.kwhReceived} kWh</b>!`);
  saveGame(true); renderAll(true);
}

function upgradeBatteryMah() {
  const add = state.batteryLab.capacityMah < 20000 ? 15000 : Math.round(state.batteryLab.capacityMah * 0.5);
  const cost = getEraPrice(Math.max(1, Math.round(add / 5000)) * 85000 + 150000);
  if (state.personalBank < cost) return addLog(`❌ Saldo Bank Pribadi kurang (${fmtRp(cost)})!`);
  state.personalBank -= cost;
  state.batteryLab.capacityMah += add;
  state.batteryLab.isLocked = false;
  state.batteryLab.efficiencyPct = Math.floor(1 + Math.random() * 100);
  addLog(`🔋 Gabung modul baterai: Kapasitas kini <b>${state.batteryLab.capacityMah.toLocaleString('id-ID')} mAh</b> (Efisiensi: ${state.batteryLab.efficiencyPct}%).`);
  saveGame(true); renderAll(true);
}

function researchBatteryEfficiency() {
  if (state.batteryLab.isLocked) return;
  const cost = getEraPrice(roundTo500(300000 + Math.random() * 200000));
  if (state.personalBank < cost) return addLog(`❌ Saldo Bank Pribadi kurang (${fmtRp(cost)})!`);
  state.personalBank -= cost;
  state.batteryLab.efficiencyPct = Math.floor(1 + Math.random() * 100);
  addLog(`🧪 Riset efisiensi (-${fmtRp(cost)}): <b>${state.batteryLab.efficiencyPct}%</b>!`);
  saveGame(true); renderRightPanel(); updateHudOnly();
}

function lockBatteryVersion() {
  state.batteryLab.isLocked = true;
  addLog(`🔒 Versi baterai <b>${state.batteryLab.capacityMah.toLocaleString('id-ID')} mAh (${state.batteryLab.efficiencyPct}%)</b> dikunci.`);
  saveGame(true); renderRightPanel();
}

function researchChargerStep() {
  if (state.batteryLab.chargerTierIdx >= CHARGER_TIERS.length - 1) return;
  const cost = getEraPrice(roundTo500(300000 + Math.random() * 200000));
  if (state.personalBank < cost) return addLog(`❌ Saldo Bank Pribadi kurang (${fmtRp(cost)})!`);
  state.personalBank -= cost;
  state.batteryLab.chargerStepProgress += 1;
  state.batteryLab.nextStepName = CHARGER_STEPS[Math.floor(Math.random() * CHARGER_STEPS.length)];
  if (state.batteryLab.chargerStepProgress >= state.batteryLab.chargerStepTarget) {
    state.batteryLab.chargerTierIdx += 1;
    state.batteryLab.chargerStepProgress = 0;
    state.batteryLab.chargerStepTarget = Math.floor(10 + Math.random() * 21);
    addLog(`⚡🎉 Riset Charger selesai! Kecepatan naik ke <b>${CHARGER_TIERS[state.batteryLab.chargerTierIdx]} Watt</b>!`);
  } else {
    addLog(`🔌 Riset 1 tahap charger (-${fmtRp(cost)}) • Progres ${state.batteryLab.chargerStepProgress}/${state.batteryLab.chargerStepTarget}.`);
  }
  saveGame(true); renderRightPanel(); updateHudOnly();
}

function buyGadget(id) {
  const g = GADGET_CATALOG.find(x => x.id === id);
  if (!g) return;
  const price = getEraPrice(g.price);
  if (state.personalBank < price) return addLog(`❌ Saldo Bank Pribadi kurang (${fmtRp(price)})!`);
  state.personalBank -= price;
  state.ownedGadgets.push({ uid: 'g_' + Date.now() + Math.random(), ...g, buyPrice: price, buyYear: state.year, condition: 100 });
  state.player.charm = Math.min(100, state.player.charm + g.charm);
  addLog(`📱 Membeli <b>${g.name}</b> (-${fmtRp(price)}).`);
  saveGame(true); renderRightPanel(); updateHudOnly();
}

function sellGadget(uid) {
  const idx = state.ownedGadgets.findIndex(x => x.uid === uid);
  if (idx === -1) return;
  const g = state.ownedGadgets.splice(idx, 1)[0];
  const ageYears = Math.max(0, state.year - g.buyYear);
  const resale = roundTo500(g.buyPrice * (g.condition / 100) * Math.max(0.2, 0.72 - ageYears * 0.1));
  state.personalBank += resale;
  addLog(`💰 Menjual bekas <b>${g.name}</b> (Kondisi ${g.condition}%): <b>+${fmtRp(resale)}</b>.`);
  saveGame(true); renderRightPanel(); updateHudOnly();
}

function buyVehicle(id) {
  const v = VEHICLE_CATALOG.find(x => x.id === id);
  if (!v) return;
  const price = getEraPrice(v.price);
  if (state.personalBank < price) return addLog(`❌ Saldo Bank Pribadi kurang (${fmtRp(price)})!`);
  state.personalBank -= price;
  state.ownedVehicles.push({ uid: 'v_' + Date.now() + Math.random(), ...v, buyPrice: price, buyYear: state.year, fuelPct: 100, condition: 100 });
  addLog(`🛵 Membeli <b>${v.name}</b> (-${fmtRp(price)}).`);
  saveGame(true); renderRightPanel(); updateHudOnly();
}

function refuelVehicle(uid) {
  const v = state.ownedVehicles.find(x => x.uid === uid);
  if (!v || v.fuelPct >= 99) return;
  const missingRatio = (100 - v.fuelPct) / 100;
  const unitsNeeded = v.tankCap * missingRatio;
  const cost = roundTo500(unitsNeeded * v.fuelCostPerUnit * getEraMultiplier(state.year));
  if (state.handWallet < cost && state.personalBank < cost) return addLog(`❌ Uang kurang (${fmtRp(cost)})!`);
  if (state.handWallet >= cost) state.handWallet -= cost;
  else state.personalBank -= cost;
  v.fuelPct = 100;
  addLog(`${v.isEV ? '🔌 Cas penuh' : '⛽ Isi bensin full'} <b>${v.name}</b> (${unitsNeeded.toFixed(1)} ${v.isEV ? 'kWh' : 'L'}) <b>-${fmtRp(cost)}</b>.`);
  saveGame(true); renderRightPanel(); updateHudOnly();
}

function repairVehicle(uid) {
  const v = state.ownedVehicles.find(x => x.uid === uid);
  if (!v || v.condition >= 98) return;
  const dmg = 100 - v.condition;
  const cost = roundTo500((v.buyPrice * 0.004) * dmg);
  if (state.personalBank < cost && state.handWallet < cost) return addLog(`❌ Uang kurang untuk servis (${fmtRp(cost)})!`);
  if (state.personalBank >= cost) state.personalBank -= cost;
  else state.handWallet -= cost;
  v.condition = 100;
  addLog(`🔧 Servis bengkel <b>${v.name}</b> selesai (Kondisi 100%) <b>-${fmtRp(cost)}</b>.`);
  saveGame(true); renderRightPanel(); updateHudOnly();
}

function sellVehicle(uid) {
  const idx = state.ownedVehicles.findIndex(x => x.uid === uid);
  if (idx === -1) return;
  const v = state.ownedVehicles.splice(idx, 1)[0];
  const ageYears = Math.max(0, state.year - v.buyYear);
  const resale = roundTo500(v.buyPrice * (v.condition / 100) * Math.max(0.25, 0.78 - ageYears * 0.08));
  state.personalBank += resale;
  addLog(`💰 Menjual bekas <b>${v.name}</b>: <b>+${fmtRp(resale)}</b>.`);
  saveGame(true); renderRightPanel(); updateHudOnly();
}

// ==================== KERJA (MINIMAL SKIP 8 JAM!), KULIAH, IBADAH & RELASI ====================
function applyForJob(jobId) {
  const job = CAREERS_CATALOG.find(j => j.id === jobId);
  if (!job) return;
  if (job.reqEdu === 'med' && (!state.player.college.graduated || state.player.college.majorId !== 'med')) return addLog('❌ Ditolak: Wajib lulus Pendidikan Dokter + KOAS (dr.)!');
  if (job.reqEdu === 'it' && (!state.player.college.graduated || state.player.college.majorId !== 'it')) return addLog('❌ Ditolak: Wajib lulus S1 Teknik Informatika!');
  if (job.reqEdu === 'bachelor' && !state.player.college.graduated) return addLog('❌ Ditolak: Wajib lulus Sarjana (S1)!');
  if (job.reqItem === 'motor_and_hp') {
    const hasMotor = state.ownedVehicles.some(v => v.category.includes('Motor'));
    const hasHp = state.ownedGadgets.some(g => g.category === 'HP');
    if (!hasMotor || !hasHp) return addLog('❌ Ditolak: Wajib memiliki Motor & HP sendiri!');
  }
  if (job.reqItem === 'laptop' && !state.ownedGadgets.some(g => g.category === 'Laptop')) return addLog('❌ Ditolak: Wajib memiliki Laptop sendiri!');

  if (Math.random() > job.acceptChance) {
    return addLog(`📄😔 <b>Lamaran Ditolak HRD</b> untuk posisi ${job.title}. Coba lagi di kesempatan lain.`);
  }
  const salary = roundTo500(getCurrentUmr() * job.umrMult);
  state.player.job = { id: job.id, title: job.title, monthlySalary: salary };
  addLog(`🎉💼 <b>DITERIMA KERJA!</b> Posisi: <b>${job.title}</b> (${fmtRp(salary)}/bln).`);
  saveGame(true); renderAll(true);
}

function workDailyShift() {
  if (state.player.isSick) return addLog('🤒 Kamu sedang sakit! Berobat dulu ke Klinik/RS.');
  if (!state.player.job) return;
  if (state.player.energy < 30) return addLog('😴 Stamina minimal 30% untuk masuk shift kerja 8 jam! Istirahat dulu.');

  if (state.player.job.id === 'job_ojol' || state.player.job.id === 'job_kurir') {
    const motor = state.ownedVehicles.find(v => v.category.includes('Motor'));
    if (!motor) return addLog('❌ Kamu tidak punya motor untuk narik!');
    if (motor.fuelPct < 20) return addLog(`⛽ ${motor.isEV ? 'Baterai' : 'Bensin'} motor ${motor.name} habis! Isi dulu di menu Aset.`);
    if (motor.condition < 15) return addLog(`🔧 Motor ${motor.name} rusak parah! Servis bengkel dulu.`);
    motor.fuelPct = Math.max(0, motor.fuelPct - 35);
    motor.condition = Math.max(5, motor.condition - 6);
  }

  // LOGIKA REALISTIS: Masuk kerja minimal skip 8 jam (480 menit)!
  state.player.energy = Math.max(0, state.player.energy - 14); // + 16 dari 8 jam tick = total ~30% stamina terpakai
  advanceTimeMinutes(480);
  const earn = roundTo500(state.player.job.monthlySalary / 22);
  state.handWallet += earn;
  addLog(`💼 Selesai shift kerja <b>8 jam</b> (${state.player.job.title}): <b>+${fmtRp(earn)}</b> masuk Dompet Tunai.`);
  saveGame(true); renderAll(true);
}

function enrollUniversity(majId) {
  const maj = UNIVERSITY_MAJORS.find(m => m.id === majId);
  if (!maj) return;
  const ukt = getEraPrice(maj.baseUkt2024);
  if (state.personalBank < ukt) return addLog(`❌ Saldo Bank Pribadi kurang untuk UKT Semester 1 (${fmtRp(ukt)})!`);
  state.personalBank -= ukt;
  state.player.college = {
    enrolled: true, majorId: maj.id, majorName: maj.name,
    semester: 1, monthsInSemester: 0, preClinicSemesters: maj.preClinicSemesters, totalSemesters: maj.totalSemesters,
    classesThisSem: 0, requiredClassesPerSem: 6, skedEarned: false, graduated: false, droppedOut: false
  };
  addLog(`🎓 Resmi kuliah di <b>${maj.name}</b> (1 Semester = 6 Bulan • UKT -${fmtRp(ukt)}).`);
  saveGame(true); renderAll(true);
}

function attendCollegeSession(actLabel) {
  if (state.player.isSick) return addLog('🤒 Kamu sedang sakit! Berobat dulu.');
  const col = state.player.college;
  if (!col.enrolled || col.graduated) return;
  if (state.player.energy < 15) return addLog('😴 Stamina kurang untuk kuliah!');

  state.player.energy = Math.max(0, state.player.energy - 12);
  col.classesThisSem += 1;
  advanceTimeMinutes(120);
  addLog(`📚 Mengikuti <b>${actLabel}</b> (2 jam) • Kehadiran Sem ${col.semester}: <b>${col.classesThisSem}/${col.requiredClassesPerSem}</b>.`);
  saveGame(true); renderAll(true);
}

function doWorshipNow() {
  const w = getActiveWorshipWindow(state.player.religion, state.month, state.day, state.dayOfWeek, state.hour, state.minute, state.player.worshipDoneToday);
  if (!w.canWorship) return;
  state.player.worshipDoneToday.push(w.slotId);
  state.player.guiltBar = Math.max(0, state.player.guiltBar - 20);
  state.player.mood = Math.min(100, state.player.mood + 15);
  advanceTimeMinutes(20);
  addLog(`${w.label} selesai — Hati lebih tenang (-Beban Batin, +Mood).`);
  saveGame(true); renderAll(true);
}

function approachPartner(partnerId) {
  const pt = PARTNERS_LIST.find(p => p.id === partnerId);
  if (!pt) return;
  if (pt.maritalStatus.includes('Orang')) {
    state.player.affairPartner = { ...pt };
    state.player.affairRelationship = 35;
    addLog(`🔥 Menjalin hubungan rahasia dengan <b>${pt.name}</b> (${pt.maritalStatus}).`);
  } else {
    state.player.partner = { ...pt };
    state.player.relationship = 35;
    addLog(`💕 Mulai dekat & berpacaran dengan <b>${pt.name}</b>.`);
  }
  saveGame(true);
  renderRightPanel();
}

function endRelationship() {
  state.player.partner = null;
  state.player.affairPartner = null;
  state.player.relationship = 0;
  state.player.affairRelationship = 0;
  addLog('💔 Hubungan diakhiri.');
  saveGame(true);
  renderRightPanel();
}

function performIntimateAction(type, fee) {
  const target = state.player.affairPartner || state.player.partner;
  if (!target) return;
  if (state.player.isSick) return addLog('🤒 Sedang sakit, tidak kuat melakukan aktivitas ini.');
  if (state.player.energy < 15) return addLog('😴 Terlalu lelah!');

  const cfg = {
    kiss: { label: '💋 Ciuman & Pelukan Mesra', mins: 60, hb: -20, en: 6, hyg: 5 },
    foreplay: { label: '🔥 Sentuhan Intim & Foreplay', mins: 60, hb: -40, en: 10, hyg: 10 },
    woohoo: { label: '❤️ Bercinta Penuh Gairah', mins: 90, hb: -70, en: 15, hyg: 18 },
    paid: { label: '💸🔥 Sesi Intim Berbayar (Pasang Tarif)', mins: 120, hb: -75, en: 18, hyg: 20 }
  }[type];

  if (!cfg) return;
  advanceTimeMinutes(cfg.mins);
  state.player.energy = Math.max(0, state.player.energy - cfg.en);
  state.player.hygiene = Math.max(0, state.player.hygiene - cfg.hyg);
  state.player.hbBar = Math.max(0, state.player.hbBar + cfg.hb);

  if (fee > 0) {
    state.personalBank += fee;
    state.player.guiltBar = Math.min(100, state.player.guiltBar + 22);
    addLog(`${cfg.label} dengan <b>${target.name}</b> (${cfg.mins} mnt) ➔ <b>+${fmtRp(fee)}</b> ke Bank Pribadi.`);
  } else {
    if (state.player.affairPartner) state.player.guiltBar = Math.min(100, state.player.guiltBar + 14);
    addLog(`${cfg.label} bersama <b>${target.name}</b> (${cfg.mins} mnt) • HB Bar: ${state.player.hbBar}%.`);
  }

  if (type === 'woohoo' || type === 'paid') {
    const prot = state.player.kbActive || state.player.condomActive;
    if (state.player.condomActive) state.player.condomActive = false;
    if (!prot && state.player.gender === 'Perempuan' && !state.player.pregnant && Math.random() < 0.4) {
      state.player.pregnant = true; state.player.pregnantWeeks = 1;
      state.player.babyFatherEthnicity = target.ethnicity;
      addLog(`🤰 <b>Kamu positif hamil!</b> Ayah biologis: <b>${target.name}</b>.`);
    }
  }
  saveGame(true); renderAll(true);
}

function rentBusinessSpace(bizId) {
  const biz = BUSINESS_TYPES_CATALOG.find(b => b.id === bizId);
  if (!biz || state.rentedBusinesses.some(x => x.id === bizId)) return;
  const rent = getEraPrice(biz.baseRent2024);
  if (state.personalBank < rent) return addLog(`❌ Saldo Bank Pribadi kurang (${fmtRp(rent)})!`);
  state.personalBank -= rent;
  state.rentedBusinesses.push({ ...biz, monthlyRent: rent });
  if (biz.isInteractiveRental) {
    state.rentalUnlocked = true;
    addLog(`🎮🏢 <b>Tempat Usaha Rental Resmi Disewa!</b> 5 Room usaha kini terbuka.`);
  } else {
    addLog(`🏢 Menyewa tempat untuk <b>${biz.name}</b> (-${fmtRp(rent)}/bln).`);
  }
  saveGame(true); renderAll(true);
}

function toggleRoomMode(roomId) {
  const rm = state.rooms.find(x => x.id === roomId);
  if (!rm) return;
  rm.mode = (rm.mode === 'gaming' ? 'couple' : 'gaming');
  rm.rate = getEraPrice(rm.mode === 'gaming' ? 8000 : 50000);
  saveGame(true);
  renderMainWorkspace();
}

function openSettingsResetModal() {
  showCustomModal(
    '⚙️ Settings & Mulai Ulang Permainan (v1.0)',
    `<div style="font-size:0.78rem;color:var(--muted);">Ketik kata <b style="color:var(--red);">reset</b> untuk menghapus progres dan memulai karakter/tahun baru:</div>
     <input type="text" id="inpResetWord" placeholder="Ketik: reset" oninput="document.getElementById('btnConfirmReset').disabled=(this.value.trim().toLowerCase()!=='reset')" />`,
    `<button onclick="closeCustomModal()">Batal</button>
     <button id="btnConfirmReset" class="danger" disabled onclick="localStorage.removeItem(STORAGE_KEY);openCharacterCreationModal();">🗑️ Mulai Ulang Game</button>`
  );
}

function openCloudSyncModal() {
  showCustomModal(
    '☁️ Sinkronisasi Firestore (Laptop ↔ HP)',
    `<label style="font-size:0.74rem;color:var(--muted);">Sync ID:</label>
     <div style="display:flex;gap:6px;"><input type="text" id="inpSyncId" value="${CloudSync.syncId}" /><button class="primary" onclick="if(CloudSync.setSyncId(document.getElementById('inpSyncId').value)){openCloudSyncModal();}">Set ID</button></div>
     <div class="grid-2"><button class="success" onclick="saveGame(true);addLog('☁️ Tersimpan ke Firestore!');closeCustomModal();">⬆️ Simpan ke Cloud</button><button class="purple" onclick="syncPullNow()">⬇️ Muat dari Cloud</button></div>`,
    `<button onclick="closeCustomModal()">Tutup</button>`
  );
}

async function syncPullNow() {
  const res = await CloudSync.pullFromCloud();
  if (!res.ok) return addLog('⚠️ Data cloud belum ada atau offline.');
  Object.assign(state, res.state);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  addLog(`✅ Progres dimuat dari Firestore (${CloudSync.syncId})!`);
  closeCustomModal(); renderAll(true);
}

// ==================== LIVE TARGETED UPDATER (TANPA RESET SCROLL & TANPA TUTUP DROPDOWN!) ====================
function updateLiveElementsOnly() {
  const pl = state.player;
  // Update bar di tab Hidup jika sedang terbuka
  const elEn = document.getElementById('lifeEnergyVal');
  if (elEn) {
    elEn.textContent = pl.energy + '%';
    document.getElementById('lifeEnergyBar').style.width = pl.energy + '%';
    document.getElementById('lifeHungerVal').textContent = pl.hunger + '%';
    document.getElementById('lifeHungerBar').style.width = pl.hunger + '%';
    document.getElementById('lifeHbVal').textContent = pl.hbBar + '%';
    document.getElementById('lifeHbBar').style.width = pl.hbBar + '%';
    document.getElementById('lifeGuiltVal').textContent = pl.guiltBar + '%';
    document.getElementById('lifeGuiltBar').style.width = pl.guiltBar + '%';

    const worship = getActiveWorshipWindow(pl.religion, state.month, state.day, state.dayOfWeek, state.hour, state.minute, pl.worshipDoneToday);
    const btnW = document.getElementById('btnWorship');
    if (btnW) {
      btnW.textContent = worship.label;
      btnW.disabled = !worship.canWorship;
      btnW.className = worship.canWorship ? 'success' : '';
    }
    const btnC = document.getElementById('btnClinic');
    if (btnC) {
      btnC.textContent = pl.isSick ? '🏥 BEROBAT SEKARANG' : '🏥 Cek Kesehatan';
      btnC.className = pl.isSick ? 'danger' : '';
    }
  }
  // Update sisa kWh & baterai di tab PLN/Lab jika sedang terbuka
  const elKwh = document.getElementById('plnKwhLive');
  if (elKwh) {
    elKwh.textContent = state.kwh.toFixed(2) + ' kWh';
  }
}

function switchMainTab(t, el) {
  state.mainTab = t;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  renderRightPanel();
}

function updateHudOnly() {
  const hh = String(state.hour).padStart(2, '0');
  const mm = String(state.minute).padStart(2, '0');
  const hol = NATIONAL_HOLIDAYS[`${state.day}-${state.month}`];
  document.getElementById('hudDateTime').textContent = `${DAY_NAMES[state.dayOfWeek]}, ${state.day}/${state.month}/${state.year} • ${hh}:${mm}${hol ? ' 🇮🇩' : ''}`;
  document.getElementById('hudCityUmr').textContent = `${getCity().name} (UMR ${fmtRp(getCurrentUmr())})`;
  document.getElementById('hudHand').textContent = fmtRp(state.handWallet);
  document.getElementById('hudBank').textContent = fmtRp(state.personalBank);
  document.getElementById('hudLaci').textContent = fmtRp(state.laciCash);
  document.getElementById('hudKwh').textContent = state.plnBlackout ? '⚡ MATI LAMPU' : `${state.kwh.toFixed(1)} kWh`;

  document.getElementById('btnPause').classList.toggle('active', state.paused);
  document.querySelectorAll('.speed-btn[data-speed]').forEach(btn => {
    btn.classList.toggle('active', !state.paused && Number(btn.dataset.speed) === state.speed);
  });
}

function renderMainWorkspace() {
  const box = document.getElementById('centerWorkspace');
  const col = state.player.college;
  if (!state.rentalUnlocked) {
    box.innerHTML = `
      <div class="card">
        <h2>🏙️ Ringkasan Kehidupan — ${state.player.name} (${state.player.age} Thn)</h2>
        <div style="font-size:0.76rem;color:var(--muted);line-height:1.55;">
          • <b>Domisili:</b> ${getCity().name} (${getCity().island}) • Tahun <b>${state.year}</b><br>
          • <b>Kesehatan:</b> ${state.player.isSick ? '<span class="badge warn">🤒 SAKIT (Wajib Berobat)</span>' : '<span class="badge ok">✅ Sehat</span>'} • BPJS: <b>${BPJS_TIERS.find(b=>b.id===state.player.bpjsTier)?.name}</b><br>
          • <b>Pekerjaan:</b> ${state.player.job ? `${state.player.job.title} (${fmtRp(state.player.job.monthlySalary)}/bln)` : 'Belum Bekerja'}<br>
          • <b>Pendidikan:</b> ${col.enrolled ? `${col.majorName} — Sem ${col.semester}/${col.totalSemesters} (Bulan ${col.monthsInSemester}/6)` : (col.graduated ? '🎓 Lulus Wisuda' : 'Belum Kuliah')}<br>
          • <b>Aset Dimiliki:</b> ${state.ownedGadgets.length} Gadget • ${state.ownedVehicles.length} Kendaraan • ${state.rentedBusinesses.length} Tempat Usaha
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
          <button class="primary" onclick="skipOneMonthSafe()">⏩ Lanjut 1 Bulan (Aman)</button>
          <button onclick="sleepToMorning()">🛏️ Tidur Sampai Pagi</button>
          <button class="success" onclick="openBankTransferModal()">🏦 Transfer Bank / Dompet</button>
        </div>
      </div>`;
    return;
  }

  box.innerHTML = `
    <div class="card">
      <h2>
        <span>🚪 Tempat Usaha Rental (5 Room • Billing Aktif)</span>
        <button class="${state.rentalOpen?'danger':'success'}" onclick="state.rentalOpen=!state.rentalOpen;saveGame(true);renderMainWorkspace();">${state.rentalOpen?'🔴 TUTUP':'🟢 BUKA'}</button>
      </h2>
      <div class="booths-grid">
        ${state.rooms.map(r => `
          <div class="booth ${r.customer?'active':''}">
            <div class="booth-top"><span>🚪 Room #${r.id}</span><span class="badge ok">${r.mode==='empty'?'Kosong':(r.customer?'Terisi':'Siap')}</span></div>
            <div class="spec-line">${r.mode==='empty'?'Kosong (Belum diisi)':`${r.mode.toUpperCase()} • ${fmtRp(r.rate)}/jam`}</div>
            <button class="primary" onclick="toggleRoomMode(${r.id})">⚙️ Ubah Jenis Room</button>
          </div>
        `).join('')}
      </div>
      <div style="display:flex;gap:6px;margin-top:4px;">
        <button onclick="sleepToMorning()">🛏️ Tidur Sampai Pagi</button>
        <button class="success" onclick="openBankTransferModal()">🏦 Tarik Laci / Transfer</button>
      </div>
    </div>`;
}

function renderRightPanel() {
  const box = document.getElementById('rightPanelContent');
  // Simpan posisi scroll agar tidak lompat ke atas saat tombol di-klik!
  const prevScrollEl = box.querySelector('.scroll-area');
  const savedScroll = prevScrollEl ? prevScrollEl.scrollTop : 0;
  box.innerHTML = '';

  if (state.mainTab === 'karier') {
    const availJobs = CAREERS_CATALOG.filter(j => state.year >= j.yearStart && (!j.yearEnd || state.year <= j.yearEnd));
    box.innerHTML = `
      ${state.player.job ? `<button class="success" onclick="workDailyShift()">💼 Masuk Kerja / Narik Shift 8 Jam (+Uang Tunai)</button>` : ''}
      <div class="scroll-area">
        ${availJobs.map(j => `
          <div class="item-row">
            <div><b>${j.title}</b> <span class="badge">~${fmtRp(roundTo500(getCurrentUmr()*j.umrMult))}/bln</span><br><span style="color:var(--muted);">${j.desc}</span></div>
            <button class="primary" onclick="applyForJob('${j.id}')">${state.player.job?.id===j.id?'✅ Aktif':'Lamar'}</button>
          </div>
        `).join('')}
      </div>`;

  } else if (state.mainTab === 'usaha') {
    const availBiz = BUSINESS_TYPES_CATALOG.filter(b => state.year >= b.yearStart && (!b.yearEnd || state.year <= b.yearEnd));
    box.innerHTML = `
      <div class="scroll-area">
        ${availBiz.map(b => {
          const owned = state.rentedBusinesses.some(x => x.id === b.id);
          return `<div class="item-row"><div><b>${b.name}</b><br><span style="color:var(--muted);">${b.desc}</span><br><b style="color:var(--accent);">Sewa: ${fmtRp(getEraPrice(b.baseRent2024))}/bln</b></div><button class="${owned?'success':'primary'}" ${owned?'disabled':''} onclick="rentBusinessSpace('${b.id}')">${owned?'✅ Disewa':'Sewa'}</button></div>`;
        }).join('')}
      </div>`;

  } else if (state.mainTab === 'gadget') {
    const brands = ['Semua', 'Google Pixel', 'Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo', 'Realme', 'ASUS', 'Lenovo', 'Nokia', 'BlackBerry'];
    const cats = ['Semua', 'HP', 'Tablet', 'Laptop', 'Smartwatch'];
    const list = GADGET_CATALOG.filter(g => state.year >= g.yearStart && state.year <= g.yearEnd && (state.gadgetBrandFilter==='Semua'||g.brand===state.gadgetBrandFilter) && (state.gadgetCatFilter==='Semua'||g.category===state.gadgetCatFilter));
    box.innerHTML = `
      <div class="sub-tabs">${brands.map(br=>`<button class="sub-btn ${state.gadgetBrandFilter===br?'active':''}" onclick="state.gadgetBrandFilter='${br}';renderRightPanel();">${br}</button>`).join('')}</div>
      <div class="sub-tabs">${cats.map(ct=>`<button class="sub-btn ${state.gadgetCatFilter===ct?'active':''}" onclick="state.gadgetCatFilter='${ct}';renderRightPanel();">${ct}</button>`).join('')}</div>
      <div class="scroll-area">
        ${list.length===0?`<div style="font-size:0.73rem;color:var(--muted);">Belum ada produk rilis pada tahun ${state.year} untuk filter ini.</div>`:''}
        ${list.map(g => `<div class="item-row"><div><b>${g.name}</b> <span class="badge">${g.brand} • ${g.category}</span><br><b style="color:var(--accent);">${fmtRp(getEraPrice(g.price))}</b></div><button class="primary" onclick="buyGadget('${g.id}')">Beli</button></div>`).join('')}
      </div>`;

  } else if (state.mainTab === 'otomotif') {
    const vCats = ['Semua', 'Motor Bensin', 'Motor Listrik', 'Mobil Bensin', 'Mobil Listrik'];
    const list = VEHICLE_CATALOG.filter(v => state.year >= v.yearStart && state.year <= v.yearEnd && (state.vehCatFilter==='Semua'||v.category===state.vehCatFilter));
    box.innerHTML = `
      <div class="sub-tabs">${vCats.map(vc=>`<button class="sub-btn ${state.vehCatFilter===vc?'active':''}" onclick="state.vehCatFilter='${vc}';renderRightPanel();">${vc}</button>`).join('')}</div>
      <div class="scroll-area">
        ${list.length===0?`<div style="font-size:0.73rem;color:var(--muted);">Belum ada kendaraan kategori ini di tahun ${state.year}.</div>`:''}
        ${list.map(v => `<div class="item-row"><div><b>${v.name}</b> <span class="badge">${v.category}</span><br><b style="color:var(--accent);">${fmtRp(getEraPrice(v.price))}</b></div><button class="primary" onclick="buyVehicle('${v.id}')">Beli</button></div>`).join('')}
      </div>`;

  } else if (state.mainTab === 'aset') {
    box.innerHTML = `
      <div class="scroll-area">
        <div style="font-weight:700;font-size:0.75rem;">🛵 Garasi Kendaraan (Bensin/Cas, Servis & Jual Kembali):</div>
        ${state.ownedVehicles.length===0?'<div style="font-size:0.72rem;color:var(--muted);">Belum punya kendaraan.</div>':''}
        ${state.ownedVehicles.map(v => `
          <div class="item-row" style="flex-direction:column;align-items:stretch;gap:5px;">
            <div><b>${v.name}</b> (${v.category})<br><span style="color:var(--muted);">${v.isEV?'🔋 Baterai':'⛽ Bensin'}: <b>${v.fuelPct}%</b> • Kondisi Mesin: <b>${v.condition}%</b></span></div>
            <div class="grid-3">
              <button class="primary" onclick="refuelVehicle('${v.uid}')">${v.isEV?'🔌 Cas':'⛽ Bensin'}</button>
              <button onclick="repairVehicle('${v.uid}')">🔧 Servis</button>
              <button class="danger" onclick="sellVehicle('${v.uid}')">💰 Jual</button>
            </div>
          </div>
        `).join('')}

        <div style="font-weight:700;font-size:0.75rem;margin-top:6px;">📱 Koleksi Gadget (Usia Pakai & Jual Bekas):</div>
        ${state.ownedGadgets.length===0?'<div style="font-size:0.72rem;color:var(--muted);">Belum punya gadget.</div>':''}
        ${state.ownedGadgets.map(g => `
          <div class="item-row">
            <div><b>${g.name}</b><br><span style="color:var(--muted);">Kondisi: <b>${g.condition}%</b> • Beli thn ${g.buyYear}</span></div>
            <button class="danger" onclick="sellGadget('${g.uid}')">💰 Jual</button>
          </div>
        `).join('')}
      </div>`;

  } else if (state.mainTab === 'kuliah') {
    const col = state.player.college;
    const maj = UNIVERSITY_MAJORS.find(m => m.id === col.majorId);
    const isKoas = col.semester > col.preClinicSemesters;
    const acts = maj ? (isKoas ? maj.koasActivities : maj.preActivities) : [];
    box.innerHTML = `
      <div class="item-row" style="flex-direction:column;align-items:stretch;gap:6px;">
        <b>🎓 Pendidikan Tinggi Realistis (1 Semester = 6 Bulan)</b>
        ${col.droppedOut?'<div class="badge warn">❌ DROP OUT (DO) karena kehadiran &lt; 50%</div>':''}
        ${!col.enrolled && !col.graduated ? UNIVERSITY_MAJORS.map(m => `
          <div class="item-row">
            <div><b>${m.name}</b><br><span style="color:var(--accent);">UKT: ${fmtRp(getEraPrice(m.baseUkt2024))}/semester</span></div>
            <button class="primary" onclick="enrollUniversity('${m.id}')">Daftar</button>
          </div>
        `).join('') : (col.graduated ? `<div class="badge ok">🎓 LULUS WISUDA (${col.majorName})</div>` : `
          <div style="font-size:0.73rem;color:var(--muted);line-height:1.45;">
            Jurusan: <b>${col.majorName}</b><br>
            Tahap: <b>${isKoas ? '🏥 KOAS DOKTER MUDA (RS)' : '📚 Pre-Klinik / Sarjana'}</b><br>
            Semester: <b>${col.semester} / ${col.totalSemesters}</b> (Bulan ke-${col.monthsInSemester}/6)<br>
            Kehadiran Semester Ini: <b>${col.classesThisSem}/${col.requiredClassesPerSem} sesi</b> (Wajib ≥ 50% agar tidak DO)
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            ${acts.map(a => `<button class="success" onclick="attendCollegeSession('${a}')">▶ ${a} (+2 Jam)</button>`).join('')}
          </div>
        `)}
      </div>`;

  } else if (state.mainTab === 'pln') {
    const lab = state.batteryLab;
    const cWatt = CHARGER_TIERS[lab.chargerTierIdx];
    box.innerHTML = `
      <div class="scroll-area">
        <div class="item-row" style="flex-direction:column;align-items:stretch;gap:6px;">
          <b>⚡ Beli Token Listrik PLN Asli (Sisa: <span id="plnKwhLive">${state.kwh.toFixed(2)} kWh</span>)</b>
          ${PLN_TOKEN_NOMINALS.map(nom => {
            const tk = calcPlnToken(nom, state.year);
            return `<div class="item-row"><div><b>Token ${fmtRp(tk.nominal)}</b><br><span style="color:var(--muted);">Bayar ${fmtRp(tk.totalPay)} ➔ Dapat <b>${tk.kwhReceived} kWh</b></span></div><button class="primary" onclick="buyPlnToken(${nom})">Beli</button></div>`;
          }).join('')}
        </div>
        <div class="item-row" style="flex-direction:column;align-items:stretch;gap:6px;">
          <b>🔋 Lab R&D Baterai & Charger (5W ➔ 480W)</b>
          <div style="font-size:0.72rem;color:var(--muted);">Kapasitas: <b>${lab.capacityMah.toLocaleString('id-ID')} mAh</b> • Efisiensi: <b>${lab.efficiencyPct}%</b> (${lab.isLocked?'🔒 Kunci':'🔓 Bebas'}) • Charger: <b>${cWatt}W</b> (${lab.chargerStepProgress}/${lab.chargerStepTarget})</div>
          <button class="primary" onclick="upgradeBatteryMah()">➕ Gabung Sel (+mAh)</button>
          <div class="grid-2">
            <button class="purple" ${lab.isLocked?'disabled':''} onclick="researchBatteryEfficiency()">🧪 Riset Efisiensi</button>
            <button class="success" ${lab.isLocked?'disabled':''} onclick="lockBatteryVersion()">🔒 Kunci Versi</button>
          </div>
          <button class="amber" ${lab.chargerTierIdx>=CHARGER_TIERS.length-1?'disabled':''} onclick="researchChargerStep()">🔌 Riset Charger (${cWatt}W)</button>
        </div>
      </div>`;

  } else if (state.mainTab === 'life') {
    const pl = state.player;
    const worship = getActiveWorshipWindow(pl.religion, state.month, state.day, state.dayOfWeek, state.hour, state.minute, pl.worshipDoneToday);
    const validPartners = PARTNERS_LIST.filter(p => p.gender !== pl.gender);

    box.innerHTML = `
      <div class="scroll-area">
        <div class="item-row" style="flex-direction:column;align-items:stretch;gap:6px;">
          <div style="display:flex;justify-content:space-between;">
            <b>${pl.gender==='Perempuan'?'👩🏻':'👨🏻'} ${pl.name} (${pl.age} Thn)</b>
            <span class="badge">${pl.religion} • ${ETHNICITIES.find(e=>e.id===pl.ethnicity)?.name.split(' ')[0]}</span>
          </div>
          <div class="sims-stats">
            <div class="sim-bar-wrap"><span>⚡ Stamina: <b id="lifeEnergyVal">${pl.energy}%</b></span><div class="progress-bar"><div id="lifeEnergyBar" class="progress-fill" style="width:${pl.energy}%"></div></div></div>
            <div class="sim-bar-wrap"><span>🍛 Kenyang: <b id="lifeHungerVal">${pl.hunger}%</b></span><div class="progress-bar"><div id="lifeHungerBar" class="progress-fill" style="width:${pl.hunger}%;background:var(--accent);"></div></div></div>
            <div class="sim-bar-wrap"><span>🔥 HB Bar: <b id="lifeHbVal">${pl.hbBar}%</b></span><div class="progress-bar"><div id="lifeHbBar" class="progress-fill" style="width:${pl.hbBar}%;background:var(--pink);"></div></div></div>
            <div class="sim-bar-wrap"><span>⚖️ Beban Batin: <b id="lifeGuiltVal">${pl.guiltBar}%</b></span><div class="progress-bar"><div id="lifeGuiltBar" class="progress-fill" style="width:${pl.guiltBar}%;background:var(--red);"></div></div></div>
          </div>

          <button id="btnWorship" class="${worship.canWorship?'success':''}" ${worship.canWorship?'':'disabled'} onclick="doWorshipNow()">${worship.label}</button>

          <div class="grid-2">
            <button id="btnClinic" class="${pl.isSick?'danger':''}" onclick="visitClinicHospital()">${pl.isSick?'🏥 BEROBAT SEKARANG':'🏥 Cek Kesehatan'}</button>
            <select onchange="setBpjsTier(this.value)">
              ${BPJS_TIERS.map(b => `<option value="${b.id}" ${pl.bpjsTier===b.id?'selected':''}>${b.name} (${fmtRp(getEraPrice(b.monthly2024))}/bln)</option>`).join('')}
            </select>
          </div>

          <div class="grid-2">
            <button class="${pl.kbActive?'success':''}" onclick="state.player.kbActive=!state.player.kbActive;saveGame(true);renderRightPanel();">${pl.kbActive?'💊 Pil KB: AKTIF':'💊 Aktifkan KB'}</button>
            <button class="${pl.condomActive?'success':''}" onclick="state.player.condomActive=!state.player.condomActive;saveGame(true);renderRightPanel();">${pl.condomActive?'🛡️ Kondom: SIAP':'🛡️ Pakai Kondom'}</button>
          </div>
          ${pl.childrenList.length>0?`<div style="font-size:0.71rem;color:var(--green);">👶 Anak: ${pl.childrenList.map(c=>`${c.name} (${c.appearance})`).join('; ')}</div>`:''}
        </div>

        ${!pl.partner && !pl.affairPartner ? validPartners.map(pt => `
          <div class="item-row">
            <div><b>${pt.name}</b> (${pt.age} Thn) <span class="badge ${pt.maritalStatus.includes('Orang')?'warn':'ok'}">${pt.maritalStatus}</span><br><span style="color:var(--muted);">${ETHNICITIES.find(e=>e.id===pt.ethnicity)?.name} • ${pt.job}</span></div>
            <button class="pink" onclick="approachPartner('${pt.id}')">Dekati</button>
          </div>
        `).join('') : `
          <div class="item-row" style="flex-direction:column;align-items:stretch;gap:6px;">
            <div><b>💑 Relasi: ${(pl.affairPartner||pl.partner).name}</b> (${(pl.affairPartner||pl.partner).age} Thn • ${(pl.affairPartner||pl.partner).maritalStatus})</div>
            <div class="grid-2">
              <button onclick="performIntimateAction('kiss', 0)">💋 Ciuman (+1 Jam)</button>
              <button onclick="performIntimateAction('foreplay', 0)">🔥 Foreplay (+1 Jam)</button>
              <button class="pink" onclick="performIntimateAction('woohoo', 0)">❤️ Bercinta (+1.5 Jam)</button>
              <button class="amber" onclick="performIntimateAction('paid', getEraPrice(1500000))">💸 Pasang Tarif (+2 Jam)</button>
            </div>
            <button class="danger" onclick="endRelationship()">💔 Akhiri Hubungan</button>
          </div>
        `}
      </div>`;
  }

  // Kembalikan posisi scroll agar tetap di posisi terakhir!
  const newScrollEl = box.querySelector('.scroll-area');
  if (newScrollEl) newScrollEl.scrollTop = savedScroll;
}

function saveGame(force = false) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); CloudSync.pushToCloud(state, force); } catch (e) {}
}
function loadGameLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    Object.assign(state, JSON.parse(raw));
    return true;
  } catch (e) { return false; }
}
function renderAll(r) { updateHudOnly(); renderMainWorkspace(); if (r) renderRightPanel(); }

(function boot() {
  CloudSync.init();
  const btn = document.getElementById('btnTheme');
  if (btn) btn.textContent = document.body.classList.contains('dark-theme') ? '☀️ Terang' : '🌙 Gelap';
  const had = loadGameLocal();
  if (!had) openCharacterCreationModal();
  else { closeCustomModal(); addLog(`💾 Progres <b>${state.player.name}</b> (${getCity().name}, ${state.year}) dimuat.`); }
  renderAll(true);
})();
