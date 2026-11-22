// DATABASE LINTAS ZAMAN INDONESIA (1980 - 2026+) - ID SIMULATOR BY ONEILVERSE v1.0

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const RELIGIONS_ID = ['Islam', 'Kristen Protestan', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];

// LENGKAP 38 PROVINSI & KOTA UTAMA DI SELURUH INDONESIA (TERMASUK JAMBI!)
const INDONESIA_CITIES = [
  // Sumatra (10 Provinsi)
  { id: 'btj', island: 'Sumatra', name: 'Banda Aceh (Aceh)', umr2024: 3550000, costFactor: 0.92 },
  { id: 'mdn', island: 'Sumatra', name: 'Medan (Sumatera Utara)', umr2024: 3769082, costFactor: 1.00 },
  { id: 'pdg', island: 'Sumatra', name: 'Padang (Sumatera Barat)', umr2024: 2811449, costFactor: 0.90 },
  { id: 'pku', island: 'Sumatra', name: 'Pekanbaru (Riau)', umr2024: 3451584, costFactor: 0.98 },
  { id: 'btm', island: 'Sumatra', name: 'Batam (Kepulauan Riau)', umr2024: 4685050, costFactor: 1.15 },
  { id: 'jbi', island: 'Sumatra', name: 'Kota Jambi (Jambi)', umr2024: 3387064, costFactor: 0.94 },
  { id: 'bks_bgl', island: 'Sumatra', name: 'Kota Bengkulu (Bengkulu)', umr2024: 2507079, costFactor: 0.88 },
  { id: 'plg', island: 'Sumatra', name: 'Palembang (Sumatera Selatan)', umr2024: 3677591, costFactor: 0.95 },
  { id: 'pgk', island: 'Sumatra', name: 'Pangkalpinang (Kep. Bangka Belitung)', umr2024: 3640000, costFactor: 1.02 },
  { id: 'tkg', island: 'Sumatra', name: 'Bandar Lampung (Lampung)', umr2024: 3103631, costFactor: 0.88 },

  // Jawa (6 Provinsi + Kota Industri Utama)
  { id: 'jkt', island: 'Jawa', name: 'DKI Jakarta', umr2024: 5067381, costFactor: 1.25 },
  { id: 'tng', island: 'Jawa', name: 'Tangerang / Serang (Banten)', umr2024: 4760289, costFactor: 1.12 },
  { id: 'bks', island: 'Jawa', name: 'Bekasi / Karawang (Jawa Barat)', umr2024: 5343430, costFactor: 1.15 },
  { id: 'bdg', island: 'Jawa', name: 'Bandung (Jawa Barat)', umr2024: 4209309, costFactor: 1.05 },
  { id: 'smg', island: 'Jawa', name: 'Semarang (Jawa Tengah)', umr2024: 3243969, costFactor: 0.92 },
  { id: 'ygk', island: 'Jawa', name: 'Yogyakarta (DI Yogyakarta)', umr2024: 2492997, costFactor: 0.80 },
  { id: 'slo', island: 'Jawa', name: 'Surakarta / Solo (Jawa Tengah)', umr2024: 2269070, costFactor: 0.78 },
  { id: 'sby', island: 'Jawa', name: 'Surabaya (Jawa Timur)', umr2024: 4725479, costFactor: 1.10 },
  { id: 'mlg', island: 'Jawa', name: 'Malang (Jawa Timur)', umr2024: 3309144, costFactor: 0.92 },

  // Kalimantan (5 Provinsi)
  { id: 'pnk', island: 'Kalimantan', name: 'Pontianak (Kalimantan Barat)', umr2024: 2840206, costFactor: 0.95 },
  { id: 'pky', island: 'Kalimantan', name: 'Palangka Raya (Kalimantan Tengah)', umr2024: 3310004, costFactor: 1.02 },
  { id: 'bdj', island: 'Kalimantan', name: 'Banjarmasin (Kalimantan Selatan)', umr2024: 3379513, costFactor: 0.98 },
  { id: 'bpn', island: 'Kalimantan', name: 'Balikpapan / IKN (Kalimantan Timur)', umr2024: 3475595, costFactor: 1.15 },
  { id: 'sri', island: 'Kalimantan', name: 'Samarinda (Kalimantan Timur)', umr2024: 3497124, costFactor: 1.10 },
  { id: 'trk', island: 'Kalimantan', name: 'Tarakan (Kalimantan Utara)', umr2024: 4160000, costFactor: 1.12 },

  // Sulawesi (6 Provinsi)
  { id: 'mdc', island: 'Sulawesi', name: 'Manado (Sulawesi Utara)', umr2024: 3590000, costFactor: 1.02 },
  { id: 'gto', island: 'Sulawesi', name: 'Kota Gorontalo (Gorontalo)', umr2024: 3025100, costFactor: 0.92 },
  { id: 'plw', island: 'Sulawesi', name: 'Palu (Sulawesi Tengah)', umr2024: 3179895, costFactor: 0.92 },
  { id: 'mju', island: 'Sulawesi', name: 'Mamuju (Sulawesi Barat)', umr2024: 2914958, costFactor: 0.90 },
  { id: 'mks', island: 'Sulawesi', name: 'Makassar (Sulawesi Selatan)', umr2024: 3643321, costFactor: 0.98 },
  { id: 'kdi', island: 'Sulawesi', name: 'Kendari (Sulawesi Tenggara)', umr2024: 3140000, costFactor: 0.94 },

  // Bali & Nusa Tenggara (3 Provinsi)
  { id: 'dps', island: 'Bali & Nusra', name: 'Denpasar (Bali)', umr2024: 3096823, costFactor: 1.12 },
  { id: 'ami', island: 'Bali & Nusra', name: 'Mataram (Nusa Tenggara Barat)', umr2024: 2685089, costFactor: 0.88 },
  { id: 'koe', island: 'Bali & Nusra', name: 'Kupang (Nusa Tenggara Timur)', umr2024: 2200000, costFactor: 0.86 },

  // Maluku & Papua (8 Provinsi)
  { id: 'amq', island: 'Maluku & Papua', name: 'Ambon (Maluku)', umr2024: 2950000, costFactor: 1.15 },
  { id: 'tte', island: 'Maluku & Papua', name: 'Ternate (Maluku Utara)', umr2024: 3250000, costFactor: 1.18 },
  { id: 'soq', island: 'Maluku & Papua', name: 'Sorong (Papua Barat Daya)', umr2024: 3500000, costFactor: 1.30 },
  { id: 'mkw', island: 'Maluku & Papua', name: 'Manokwari (Papua Barat)', umr2024: 3393000, costFactor: 1.28 },
  { id: 'nbx', island: 'Maluku & Papua', name: 'Nabire (Papua Tengah)', umr2024: 4024270, costFactor: 1.35 },
  { id: 'wmx', island: 'Maluku & Papua', name: 'Wamena (Papua Pegunungan)', umr2024: 4024270, costFactor: 1.45 },
  { id: 'mkq', island: 'Maluku & Papua', name: 'Merauke (Papua Selatan)', umr2024: 4024270, costFactor: 1.32 },
  { id: 'jyp', island: 'Maluku & Papua', name: 'Jayapura (Papua)', umr2024: 4024270, costFactor: 1.38 }
];

// INFLASI EKONOMI INDONESIA BERDASARKAN TAHUN (1980 - 2026+)
function getEraMultiplier(year) {
  if (year < 1985) return 0.04;
  if (year < 1990) return 0.07;
  if (year < 1997) return 0.12;
  if (year < 2000) return 0.24;
  if (year < 2005) return 0.36;
  if (year < 2010) return 0.52;
  if (year < 2015) return 0.70;
  if (year < 2019) return 0.88;
  if (year <= 2024) return 1.00;
  return 1.07;
}

// KALKULASI TOKEN LISTRIK PLN ASLI INDONESIA (R1 1300VA/2200VA + PPJ 4% + ADMIN BANK Rp 2.500)
const PLN_TOKEN_NOMINALS = [20000, 50000, 100000, 200000, 500000];
function calcPlnToken(nominal2024, year) {
  const mult = getEraMultiplier(year);
  const nominal = Math.max(5000, Math.round((nominal2024 * mult) / 5000) * 5000);
  const adminFee = Math.max(500, Math.round((2500 * mult) / 500) * 500);
  const totalPay = nominal + adminFee;
  const tdlPerKwh = 1444.7 * mult;
  const ppj = nominal * 0.04;
  const netRupiah = nominal - ppj;
  const kwhReceived = +(netRupiah / tdlPerKwh).toFixed(2);
  return { nominal, adminFee, totalPay, kwhReceived };
}

// BPJS KESEHATAN MANDIRI (IURAN BULANAN)
const BPJS_TIERS = [
  { id: 'none', name: 'Tanpa BPJS', monthly2024: 0, coverPct: 0 },
  { id: 'k3', name: 'BPJS Kesehatan Kelas 3', monthly2024: 35000, coverPct: 100 },
  { id: 'k2', name: 'BPJS Kesehatan Kelas 2', monthly2024: 100000, coverPct: 100 },
  { id: 'k1', name: 'BPJS Kesehatan Kelas 1', monthly2024: 150000, coverPct: 100 }
];

const ETHNICITIES = [
  { id: 'chinese', name: 'Chinese / Tionghoa', trait: 'Kulit putih cerah, mata sipit manis' },
  { id: 'batak', name: 'Batak', trait: 'Tegas, berkarisma kuat, sorot mata tajam' },
  { id: 'melayu', name: 'Melayu (Jambi / Riau / Deli)', trait: 'Ramah, lembut, tutur kata santun' },
  { id: 'jawa', name: 'Jawa', trait: 'Lembut, anggun, senyum manis' },
  { id: 'sunda', name: 'Sunda', trait: 'Kulit bersih, ramah, memikat' },
  { id: 'minang', name: 'Minangkabau', trait: 'Cerdas berdagang, paras menawan' },
  { id: 'manado', name: 'Manado / Minahasa', trait: 'Wajah blasteran alami, kulit cerah' },
  { id: 'bule', name: 'Bule (Eropa / Kaukasia)', trait: 'Hidung mancung, mata terang, postur tinggi' },
  { id: 'arab', name: 'Arab / Timur Tengah', trait: 'Alis tebal, hidung mancung, bulu mata lentik' },
  { id: 'korea', name: 'Korea / Asia Timur', trait: 'Kulit glass-skin, fitur wajah lembut' }
];

function getMixedChildAppearance(eth1, eth2) {
  const pair = [eth1, eth2].sort().join('+');
  const map = {
    'bule+chinese': 'Blasteran Chindo-Eropa (Kulit putih porselen, hidung mancung, mata almond indah)',
    'batak+bule': 'Blasteran Batak-Eropa (Postur tinggi, rahang tegas, hidung mancung)',
    'bule+jawa': 'Indo-Eropa Jawa (Paras eksotis menawan, mata cokelat terang)',
    'bule+melayu': 'Indo-Eropa Melayu (Kulit cerah, hidung mancung, senyum ramah)',
    'batak+chinese': 'Chindo-Batak (Kulit cerah, karakter kuat & cerdas)',
    'chinese+jawa': 'Peranakan Chindo-Jawa (Kulit kuning langsat halus, wajah lembut)',
    'arab+chinese': 'Blasteran Tionghoa-Timur Tengah (Kulit putih, alis tebal, mata tajam)'
  };
  if (eth1 === eth2) {
    const same = ETHNICITIES.find(e => e.id === eth1);
    return `Keturunan ${same ? same.name : eth1} murni (${same ? same.trait : 'sehat & rupawan'})`;
  }
  return map[pair] || `Blasteran ${eth1.toUpperCase()} - ${eth2.toUpperCase()} (Perpaduan dua etnis)`;
}

// JADWAL SHOLAT DINAMIS (BERGESER SESUAI DEKLINASI MATAHARI TIAP TANGGAL & BULAN)
function getDynamicPrayerWindows(month, day) {
  const dayOfYear = (month - 1) * 30 + day;
  const solarShift = Math.round(Math.sin((dayOfYear / 365) * 2 * Math.PI) * 16);
  const asharShift = Math.round(Math.cos((dayOfYear / 365) * 2 * Math.PI) * 10);

  const subuhStart = 4 * 60 + 38 + solarShift;
  const dzuhurStart = 11 * 60 + 58 + Math.round(solarShift * 0.7);
  const asharStart = 15 * 60 + 15 + asharShift;
  const maghribStart = 17 * 60 + 58 - Math.round(solarShift * 0.8);
  const isyaStart = 19 * 60 + 10 - Math.round(solarShift * 0.8);

  const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(((m % 60) + 60) % 60).padStart(2, '0')}`;
  return [
    { id: 'subuh', name: 'Sholat Subuh', startMin: subuhStart, endMin: subuhStart + 75, label: fmt(subuhStart) },
    { id: 'dzuhur', name: 'Sholat Dzuhur', startMin: dzuhurStart, endMin: asharStart - 1, label: fmt(dzuhurStart) },
    { id: 'ashar', name: 'Sholat Ashar', startMin: asharStart, endMin: maghribStart - 1, label: fmt(asharStart) },
    { id: 'maghrib', name: 'Sholat Maghrib', startMin: maghribStart, endMin: isyaStart - 1, label: fmt(maghribStart) },
    { id: 'isya', name: 'Sholat Isya', startMin: isyaStart, endMin: 23 * 60 + 59, label: fmt(isyaStart) }
  ];
}

// CEK APAKAH WAKTU IBADAH SEDANG AKTIF (TOMBOL HANYA BISA DIKLIK PADA JAM/HARINYA!)
function getActiveWorshipWindow(religion, month, day, dayOfWeek, hour, minute, doneToday) {
  const curMin = hour * 60 + minute;
  const hol = NATIONAL_HOLIDAYS[`${day}-${month}`];

  if (religion === 'Islam') {
    const windows = getDynamicPrayerWindows(month, day);
    const active = windows.find(w => curMin >= w.startMin && curMin <= w.endMin);
    if (!active) return { canWorship: false, label: 'Belum Masuk Waktu Sholat', slotId: null };
    if (doneToday.includes(active.id)) return { canWorship: false, label: `✅ ${active.name} Sudah Ditunaikan`, slotId: active.id };
    return { canWorship: true, label: `🕌 Tunaikan ${active.name} (${active.label})`, slotId: active.id };
  }
  if (religion === 'Kristen Protestan' || religion === 'Katolik') {
    const isSunday = (dayOfWeek === 0 && hour >= 7 && hour <= 19);
    const isHoliday = hol && (hol.religion === 'Kristen Protestan' || hol.religion === 'Katolik');
    const slotId = `church_${day}_${month}`;
    if (!isSunday && !isHoliday) return { canWorship: false, label: 'Ibadah/Misa Aktif Hari Minggu (07:00–19:00)', slotId: null };
    if (doneToday.includes(slotId)) return { canWorship: false, label: '✅ Ibadah Minggu Sudah Diikuti', slotId };
    return { canWorship: true, label: religion === 'Katolik' ? '✝️ Ikuti Misa Kudus Minggu' : '⛪ Ikuti Kebaktian Minggu', slotId };
  }
  if (religion === 'Hindu') {
    const slots = [
      { id: 'trisandhya_pagi', name: 'Puja Tri Sandhya Pagi', s: 330, e: 450 },
      { id: 'trisandhya_siang', name: 'Puja Tri Sandhya Siang', s: 690, e: 810 },
      { id: 'trisandhya_sore', name: 'Puja Tri Sandhya Sore', s: 1050, e: 1170 }
    ];
    const active = slots.find(x => curMin >= x.s && curMin <= x.e);
    if (!active) return { canWorship: false, label: 'Tri Sandhya Aktif Jam 06:00, 12:00 & 18:00', slotId: null };
    if (doneToday.includes(active.id)) return { canWorship: false, label: `✅ ${active.name} Selesai`, slotId: active.id };
    return { canWorship: true, label: `🛕 ${active.name}`, slotId: active.id };
  }
  const isPagi = (hour >= 6 && hour < 9);
  const isSore = (hour >= 17 && hour < 20);
  if (!isPagi && !isSore) return { canWorship: false, label: 'Sembahyang/Puja Bakti Aktif 06:00–09:00 & 17:00–20:00', slotId: null };
  const slotId = isPagi ? 'pagi' : 'sore';
  if (doneToday.includes(slotId)) return { canWorship: false, label: '✅ Ibadah Sesi Ini Sudah Selesai', slotId };
  return { canWorship: true, label: religion === 'Buddha' ? `☸️ Puja Bakti ${isPagi ? 'Pagi' : 'Sore'}` : `🏮 Sembahyang ${isPagi ? 'Pagi' : 'Sore'}`, slotId };
}

const NATIONAL_HOLIDAYS = {
  '1-1': { name: 'Tahun Baru Masehi', religion: 'Semua' },
  '25-1': { name: 'Tahun Baru Imlek', religion: 'Konghucu' },
  '25-3': { name: 'Hari Suci Nyepi', religion: 'Hindu' },
  '10-4': { name: 'Wafat Isa Almasih', religion: 'Kristen Protestan' },
  '1-5': { name: 'Hari Buruh Internasional', religion: 'Semua' },
  '7-5': { name: 'Hari Raya Waisak', religion: 'Buddha' },
  '24-5': { name: 'Hari Raya Idul Fitri', religion: 'Islam' },
  '1-6': { name: 'Hari Lahir Pancasila', religion: 'Semua' },
  '31-7': { name: 'Hari Raya Idul Adha', religion: 'Islam' },
  '17-8': { name: 'HUT Kemerdekaan RI', religion: 'Semua' },
  '25-12': { name: 'Hari Raya Natal', religion: 'Katolik' }
};

const CHARGER_TIERS = [5, 10, 15, 18, 25, 33, 45, 67, 80, 90, 100, 120, 180, 240, 360, 480];
const CHARGER_STEPS = [
  'Gulungan Trafo Step-Down', 'Kalibrasi Mosfet Switching', 'Kapasitor Tegangan Tinggi',
  'Jalur PCB Tembaga Tebal', 'Heatsink Thermal Tembaga', 'Firmware IC Kontroler PWM',
  'Uji Stabilitas Ripple', 'Proteksi Short-Circuit & Overheat', 'Optimasi Efisiensi Inverter'
];

// KATALOG GADGET LENGKAP (1980 - 2026+, TERMASUK 2019 MELIMPAH & GOOGLE PIXEL)
const GADGET_CATALOG = [
  { id: 'mot_dynatac', brand: 'Motorola', category: 'HP', name: 'Motorola DynaTAC 8000X', yearStart: 1984, yearEnd: 1994, price: 8500000, charm: 10 },
  { id: 'mot_pager', brand: 'Motorola', category: 'HP', name: 'Pager Starko / Motorola Advisor', yearStart: 1990, yearEnd: 2002, price: 350000, charm: 4 },
  { id: 'nok_3310', brand: 'Nokia', category: 'HP', name: 'Nokia 3310 Legend', yearStart: 2000, yearEnd: 2008, price: 1200000, charm: 6 },
  { id: 'nok_n95', brand: 'Nokia', category: 'HP', name: 'Nokia N95 8GB Symbian', yearStart: 2007, yearEnd: 2012, price: 5500000, charm: 10 },
  { id: 'bb_bold', brand: 'BlackBerry', category: 'HP', name: 'BlackBerry Bold 9000 (BBM)', yearStart: 2008, yearEnd: 2015, price: 4800000, charm: 10 },
  { id: 'ip_4s', brand: 'Apple', category: 'HP', name: 'iPhone 4S 32GB', yearStart: 2011, yearEnd: 2016, price: 6500000, charm: 9 },
  { id: 'sam_s6', brand: 'Samsung', category: 'HP', name: 'Samsung Galaxy S6 Edge', yearStart: 2015, yearEnd: 2019, price: 9500000, charm: 10 },
  { id: 'ip_x', brand: 'Apple', category: 'HP', name: 'iPhone X 64GB Resmi', yearStart: 2017, yearEnd: 2021, price: 15999000, charm: 13 },
  { id: 'px_3', brand: 'Google Pixel', category: 'HP', name: 'Google Pixel 3 XL (4/64GB)', yearStart: 2018, yearEnd: 2022, price: 11500000, charm: 10 },

  // 2019 LENGKAP SEMUA BRAND
  { id: 'px_4_2019', brand: 'Google Pixel', category: 'HP', name: 'Google Pixel 4 (6/64GB)', yearStart: 2019, yearEnd: 2023, price: 10800000, charm: 10 },
  { id: 'px_4xl_2019', brand: 'Google Pixel', category: 'HP', name: 'Google Pixel 4 XL (6/128GB)', yearStart: 2019, yearEnd: 2023, price: 12900000, charm: 12 },
  { id: 'ip_11_2019', brand: 'Apple', category: 'HP', name: 'iPhone 11 128GB Resmi iBox', yearStart: 2019, yearEnd: 2024, price: 13999000, charm: 12 },
  { id: 'ip_11pm_2019', brand: 'Apple', category: 'HP', name: 'iPhone 11 Pro Max 256GB', yearStart: 2019, yearEnd: 2023, price: 21999000, charm: 15 },
  { id: 'sam_a50_2019', brand: 'Samsung', category: 'HP', name: 'Samsung Galaxy A50 (4/64GB)', yearStart: 2019, yearEnd: 2022, price: 3899000, charm: 5 },
  { id: 'sam_s10p_2019', brand: 'Samsung', category: 'HP', name: 'Samsung Galaxy S10+ (8/128GB)', yearStart: 2019, yearEnd: 2023, price: 13999000, charm: 12 },
  { id: 'sam_n10p_2019', brand: 'Samsung', category: 'HP', name: 'Samsung Galaxy Note 10+ (12/256GB)', yearStart: 2019, yearEnd: 2023, price: 16499000, charm: 14 },
  { id: 'xi_rn8p_2019', brand: 'Xiaomi', category: 'HP', name: 'Redmi Note 8 Pro (6/64GB)', yearStart: 2019, yearEnd: 2022, price: 2999000, charm: 4 },
  { id: 'xi_mi9t_2019', brand: 'Xiaomi', category: 'HP', name: 'Xiaomi Mi 9T Pro Snapdragon 855', yearStart: 2019, yearEnd: 2022, price: 5499000, charm: 7 },
  { id: 'op_reno2_2019', brand: 'OPPO', category: 'HP', name: 'OPPO Reno2 Shark-Fin Camera (8/256GB)', yearStart: 2019, yearEnd: 2022, price: 7999000, charm: 8 },
  { id: 'vv_v17p_2019', brand: 'Vivo', category: 'HP', name: 'Vivo V17 Pro Dual Pop-Up (8/128GB)', yearStart: 2019, yearEnd: 2022, price: 5699000, charm: 7 },
  { id: 'rm_x2p_2019', brand: 'Realme', category: 'HP', name: 'Realme X2 Pro 90Hz (12/256GB)', yearStart: 2019, yearEnd: 2022, price: 7799000, charm: 8 },
  { id: 'rog_2_2019', brand: 'ASUS', category: 'HP', name: 'ASUS ROG Phone 2 (8/128GB)', yearStart: 2019, yearEnd: 2023, price: 8499000, charm: 10 },
  { id: 'ipad_air3_2019', brand: 'Apple', category: 'Tablet', name: 'iPad Air 3 (2019) 10.5" 64GB', yearStart: 2019, yearEnd: 2023, price: 8499000, charm: 8 },
  { id: 'mbp16_2019', brand: 'Apple', category: 'Laptop', name: 'MacBook Pro 16" (2019) Core i7', yearStart: 2019, yearEnd: 2023, price: 34999000, charm: 15 },
  { id: 'aw_s5_2019', brand: 'Apple', category: 'Smartwatch', name: 'Apple Watch Series 5 GPS 44mm', yearStart: 2019, yearEnd: 2023, price: 7499000, charm: 8 },
  { id: 'sam_gw_active2', brand: 'Samsung', category: 'Smartwatch', name: 'Samsung Galaxy Watch Active2', yearStart: 2019, yearEnd: 2023, price: 4199000, charm: 6 },
  { id: 'asus_zen14_2019', brand: 'ASUS', category: 'Laptop', name: 'ASUS ZenBook 14 UX433 (2019)', yearStart: 2019, yearEnd: 2023, price: 14500000, charm: 9 },

  // 2020 - 2026+
  { id: 'px_4a_2020', brand: 'Google Pixel', category: 'HP', name: 'Google Pixel 4a (6/128GB)', yearStart: 2020, yearEnd: 2024, price: 5800000, charm: 6 },
  { id: 'px_5_2020', brand: 'Google Pixel', category: 'HP', name: 'Google Pixel 5 5G (8/128GB)', yearStart: 2020, yearEnd: 2024, price: 9800000, charm: 9 },
  { id: 'px_6p_2021', brand: 'Google Pixel', category: 'HP', name: 'Google Pixel 6 Pro (12/256GB)', yearStart: 2021, yearEnd: 2025, price: 13800000, charm: 12 },
  { id: 'px_7p_2022', brand: 'Google Pixel', category: 'HP', name: 'Google Pixel 7 Pro (12/256GB)', yearStart: 2022, yearEnd: 2026, price: 14200000, charm: 13 },
  { id: 'px_8p_2023', brand: 'Google Pixel', category: 'HP', name: 'Google Pixel 8 Pro (12/256GB)', yearStart: 2023, yearEnd: 2030, price: 15800000, charm: 15 },
  { id: 'px_9p_2024', brand: 'Google Pixel', category: 'HP', name: 'Google Pixel 9 Pro XL (16/256GB)', yearStart: 2024, yearEnd: 2030, price: 17900000, charm: 17 },
  { id: 'px_watch2', brand: 'Google Pixel', category: 'Smartwatch', name: 'Google Pixel Watch 2 LTE', yearStart: 2023, yearEnd: 2030, price: 5499000, charm: 7 },
  { id: 'px_tab', brand: 'Google Pixel', category: 'Tablet', name: 'Google Pixel Tablet + Dock', yearStart: 2023, yearEnd: 2030, price: 8200000, charm: 8 },
  { id: 'ip_12pm_2020', brand: 'Apple', category: 'HP', name: 'iPhone 12 Pro Max 256GB', yearStart: 2020, yearEnd: 2025, price: 22499000, charm: 15 },
  { id: 'ip_14pm_2022', brand: 'Apple', category: 'HP', name: 'iPhone 14 Pro Max 256GB', yearStart: 2022, yearEnd: 2027, price: 23999000, charm: 17 },
  { id: 'ip_16pm_2024', brand: 'Apple', category: 'HP', name: 'iPhone 16 Pro Max 256GB', yearStart: 2024, yearEnd: 2030, price: 25499000, charm: 20 },
  { id: 'mba_m1_2020', brand: 'Apple', category: 'Laptop', name: 'MacBook Air M1 (2020) 8/256GB', yearStart: 2020, yearEnd: 2026, price: 14999000, charm: 13 },
  { id: 'mbp_m3_2023', brand: 'Apple', category: 'Laptop', name: 'MacBook Pro M3 14" 16/512GB', yearStart: 2023, yearEnd: 2030, price: 26999000, charm: 17 },
  { id: 'sam_s20u_2020', brand: 'Samsung', category: 'HP', name: 'Samsung Galaxy S20 Ultra 5G', yearStart: 2020, yearEnd: 2024, price: 18499000, charm: 13 },
  { id: 'sam_s24u_2024', brand: 'Samsung', category: 'HP', name: 'Samsung Galaxy S24 Ultra AI', yearStart: 2024, yearEnd: 2030, price: 21999000, charm: 18 },
  { id: 'sam_tabs9_2023', brand: 'Samsung', category: 'Tablet', name: 'Samsung Galaxy Tab S9 Ultra', yearStart: 2023, yearEnd: 2030, price: 19999000, charm: 14 },
  { id: 'xi_14_2024', brand: 'Xiaomi', category: 'HP', name: 'Xiaomi 14 Leica (12/256GB)', yearStart: 2024, yearEnd: 2030, price: 11999000, charm: 13 },
  { id: 'xi_pad6_2023', brand: 'Xiaomi', category: 'Tablet', name: 'Xiaomi Pad 6 (8/256GB)', yearStart: 2023, yearEnd: 2030, price: 4999000, charm: 6 },
  { id: 'op_findx5_2022', brand: 'OPPO', category: 'HP', name: 'OPPO Find X5 Pro 5G Hasselblad', yearStart: 2022, yearEnd: 2026, price: 14999000, charm: 13 },
  { id: 'vv_x100_2024', brand: 'Vivo', category: 'HP', name: 'Vivo X100 Pro ZEISS', yearStart: 2024, yearEnd: 2030, price: 16999000, charm: 15 },
  { id: 'asus_rog_g16', brand: 'ASUS', category: 'Laptop', name: 'ASUS ROG Strix G16 RTX 4060', yearStart: 2023, yearEnd: 2030, price: 22999000, charm: 14 },
  { id: 'len_tp_x1', brand: 'Lenovo', category: 'Laptop', name: 'Lenovo ThinkPad X1 Carbon Gen 11', yearStart: 2023, yearEnd: 2030, price: 24500000, charm: 13 }
];

// KATALOG OTOMOTIF LENGKAP INDONESIA (DENGAN KAPASITAS TANGKI LITER / BATERAI kWh)
const VEHICLE_CATALOG = [
  { id: 'mt_grand', category: 'Motor Bensin', name: 'Honda Astrea Grand 100cc', yearStart: 1991, yearEnd: 2005, price: 3200000, isEV: false, tankCap: 4.0, fuelCostPerUnit: 10000 },
  { id: 'mt_rxking', category: 'Motor Bensin', name: 'Yamaha RX-King 135cc', yearStart: 1983, yearEnd: 2009, price: 4800000, isEV: false, tankCap: 9.5, fuelCostPerUnit: 10000 },
  { id: 'mt_supra', category: 'Motor Bensin', name: 'Honda Supra X 125 FI', yearStart: 2005, yearEnd: 2030, price: 18500000, isEV: false, tankCap: 4.0, fuelCostPerUnit: 10000 },
  { id: 'mt_beat', category: 'Motor Bensin', name: 'Honda Beat Street eSP', yearStart: 2014, yearEnd: 2030, price: 18200000, isEV: false, tankCap: 4.2, fuelCostPerUnit: 10000 },
  { id: 'mt_scoopy', category: 'Motor Bensin', name: 'Honda Scoopy Prestige', yearStart: 2015, yearEnd: 2030, price: 22500000, isEV: false, tankCap: 4.2, fuelCostPerUnit: 10000 },
  { id: 'mt_vario160', category: 'Motor Bensin', name: 'Honda Vario 160 ABS', yearStart: 2022, yearEnd: 2030, price: 29500000, isEV: false, tankCap: 5.5, fuelCostPerUnit: 12500 },
  { id: 'mt_nmax', category: 'Motor Bensin', name: 'Yamaha NMAX 155 Connected ABS', yearStart: 2015, yearEnd: 2030, price: 32500000, isEV: false, tankCap: 7.1, fuelCostPerUnit: 12500 },
  { id: 'mt_pcx160', category: 'Motor Bensin', name: 'Honda PCX 160 ABS', yearStart: 2021, yearEnd: 2030, price: 35800000, isEV: false, tankCap: 8.1, fuelCostPerUnit: 12500 },
  { id: 'mt_vespa', category: 'Motor Bensin', name: 'Vespa Sprint 150 i-Get ABS', yearStart: 2018, yearEnd: 2030, price: 54500000, isEV: false, tankCap: 7.0, fuelCostPerUnit: 13500 },
  { id: 'mt_zx25r', category: 'Motor Bensin', name: 'Kawasaki Ninja ZX-25R 4 Silinder', yearStart: 2020, yearEnd: 2030, price: 107500000, isEV: false, tankCap: 15.0, fuelCostPerUnit: 14500 },
  { id: 'ev_gesits', category: 'Motor Listrik', name: 'Gesits G1 Electric', yearStart: 2019, yearEnd: 2030, price: 28900000, isEV: true, tankCap: 2.0, fuelCostPerUnit: 1500 },
  { id: 'ev_volta', category: 'Motor Listrik', name: 'Volta 401 Lithium SGB', yearStart: 2021, yearEnd: 2030, price: 16950000, isEV: true, tankCap: 1.5, fuelCostPerUnit: 1500 },
  { id: 'ev_polytron', category: 'Motor Listrik', name: 'Polytron Fox-R Electric', yearStart: 2023, yearEnd: 2030, price: 20500000, isEV: true, tankCap: 3.7, fuelCostPerUnit: 1500 },
  { id: 'ev_alva', category: 'Motor Listrik', name: 'ALVA Cervo Electric Sport', yearStart: 2023, yearEnd: 2030, price: 37750000, isEV: true, tankCap: 3.6, fuelCostPerUnit: 1500 },
  { id: 'mb_kijang', category: 'Mobil Bensin', name: 'Toyota Kijang Super / Kapsul', yearStart: 1986, yearEnd: 2004, price: 38000000, isEV: false, tankCap: 55, fuelCostPerUnit: 10000 },
  { id: 'mb_avanza', category: 'Mobil Bensin', name: 'Toyota Avanza 1.5 G CVT', yearStart: 2004, yearEnd: 2030, price: 255000000, isEV: false, tankCap: 43, fuelCostPerUnit: 12500 },
  { id: 'mb_brio', category: 'Mobil Bensin', name: 'Honda Brio RS CVT', yearStart: 2013, yearEnd: 2030, price: 225000000, isEV: false, tankCap: 35, fuelCostPerUnit: 12500 },
  { id: 'mb_xpander', category: 'Mobil Bensin', name: 'Mitsubishi Xpander Ultimate', yearStart: 2017, yearEnd: 2030, price: 315000000, isEV: false, tankCap: 45, fuelCostPerUnit: 13000 },
  { id: 'mb_innova', category: 'Mobil Bensin', name: 'Toyota Kijang Innova Zenix Hybrid', yearStart: 2022, yearEnd: 2030, price: 477000000, isEV: false, tankCap: 52, fuelCostPerUnit: 13500 },
  { id: 'mb_fortuner', category: 'Mobil Bensin', name: 'Toyota Fortuner 2.8 GR Sport 4x4', yearStart: 2016, yearEnd: 2030, price: 640000000, isEV: false, tankCap: 80, fuelCostPerUnit: 14500 },
  { id: 'ev_kona', category: 'Mobil Listrik', name: 'Hyundai Kona Electric', yearStart: 2020, yearEnd: 2030, price: 540000000, isEV: true, tankCap: 48, fuelCostPerUnit: 2466 },
  { id: 'ev_airev', category: 'Mobil Listrik', name: 'Wuling Air ev Long Range', yearStart: 2022, yearEnd: 2030, price: 299000000, isEV: true, tankCap: 26.7, fuelCostPerUnit: 2466 },
  { id: 'ev_ioniq5', category: 'Mobil Listrik', name: 'Hyundai IONIQ 5 Signature Long Range', yearStart: 2022, yearEnd: 2030, price: 859000000, isEV: true, tankCap: 72.6, fuelCostPerUnit: 2466 },
  { id: 'ev_byd_seal', category: 'Mobil Listrik', name: 'BYD Seal Performance AWD', yearStart: 2024, yearEnd: 2030, price: 719000000, isEV: true, tankCap: 82.5, fuelCostPerUnit: 2466 }
];

// PEKERJAAN LINTAS ZAMAN (SHIFT KERJA MINIMAL 8 JAM!)
const CAREERS_CATALOG = [
  { id: 'job_koran', title: 'Loper Koran & Majalah Pagi', yearStart: 1980, yearEnd: 2016, umrMult: 0.45, reqEdu: 'none', reqItem: null, acceptChance: 0.95, desc: 'Antar koran cetak (punah di era digital).' },
  { id: 'job_wartel', title: 'Operator Wartel / Kios Telepon', yearStart: 1985, yearEnd: 2011, umrMult: 0.65, reqEdu: 'none', reqItem: null, acceptChance: 0.90, desc: 'Menjaga bilik telepon umum.' },
  { id: 'job_vhs', title: 'Penjaga Sewa Kaset VHS / VCD', yearStart: 1985, yearEnd: 2014, umrMult: 0.70, reqEdu: 'none', reqItem: null, acceptChance: 0.88, desc: 'Menyewakan kaset film fisik.' },
  { id: 'job_ojol', title: 'Driver Ojek Online (Gojek / Grab)', yearStart: 2015, yearEnd: 2035, umrMult: 1.05, reqEdu: 'none', reqItem: 'motor_and_hp', acceptChance: 0.92, desc: 'Narik penumpang & pesan-antar 8 jam (Wajib punya Motor & HP).' },
  { id: 'job_kurir', title: 'Kurir Paket (Shopee Xpress / J&T)', yearStart: 2016, yearEnd: 2035, umrMult: 1.00, reqEdu: 'none', reqItem: 'motor_and_hp', acceptChance: 0.90, desc: 'Antar paket e-commerce 8 jam/shift.' },
  { id: 'job_admin', title: 'Staf Administrasi Perusahaan', yearStart: 1980, yearEnd: 2035, umrMult: 1.05, reqEdu: 'none', reqItem: null, acceptChance: 0.65, desc: 'Pekerjaan kantoran standar UMR (8 jam kerja).' },
  { id: 'job_banker', title: 'Officer Bank Swasta / BUMN', yearStart: 1980, yearEnd: 2035, umrMult: 1.70, reqEdu: 'bachelor', reqItem: null, acceptChance: 0.50, desc: 'Wajib lulusan Sarjana (S1). Seleksi ketat.' },
  { id: 'job_swe', title: 'Software Engineer / IT Developer', yearStart: 2005, yearEnd: 2035, umrMult: 2.35, reqEdu: 'it', reqItem: 'laptop', acceptChance: 0.55, desc: 'Wajib S1 IT & punya Laptop.' },
  { id: 'job_doctor', title: 'Dokter Umum Rumah Sakit & Klinik', yearStart: 1980, yearEnd: 2035, umrMult: 3.40, reqEdu: 'med', reqItem: null, acceptChance: 0.88, desc: 'Wajib lulus S.Ked (4 Thn) + KOAS (2 Thn) + Sumpah Dokter (dr.).' }
];

// KULIAH REALISTIS SESUAI KALENDER AKADEMIK (1 TAHUN = 2 SEMESTER)
const UNIVERSITY_MAJORS = [
  {
    id: 'med', name: 'Pendidikan Dokter (4 Thn S.Ked + 2 Thn KOAS = dr.)',
    preClinicSemesters: 8,
    totalSemesters: 12,
    baseUkt2024: 15000000, degreePrefix: 'dr. ',
    preActivities: ['Kuliah Anatomi & Fisiologi', 'Praktikum Lab Histologi', 'Skill Lab Pemeriksaan Klinis', 'Ujian Blok Kedokteran'],
    koasActivities: ['Jaga IGD & Bangsal (KOAS)', 'Stase Bedah Umum (KOAS)', 'Stase Penyakit Dalam (KOAS)', 'Persiapan Ujian UKMPPD']
  },
  {
    id: 'it', name: 'S1 Teknik Informatika (4 Tahun / S.Kom)',
    preClinicSemesters: 8, totalSemesters: 8,
    baseUkt2024: 5500000, degreePrefix: '',
    preActivities: ['Kuliah Struktur Data & Algoritma', 'Praktikum Pemrograman Web', 'Riset Sistem & Jaringan', 'Bimbingan Skripsi'],
    koasActivities: []
  },
  {
    id: 'biz', name: 'S1 Manajemen Bisnis (4 Tahun / S.M)',
    preClinicSemesters: 8, totalSemesters: 8,
    baseUkt2024: 4800000, degreePrefix: '',
    preActivities: ['Kuliah Ekonomi & Manajemen', 'Studi Kasus Bisnis UMKM', 'Analisis Laporan Keuangan', 'Bimbingan Skripsi'],
    koasActivities: []
  }
];

// USAHA DI INDONESIA
const BUSINESS_TYPES_CATALOG = [
  { id: 'biz_rental', name: 'Rental Game & Room Usaha (5 Unit Room)', yearStart: 1980, baseRent2024: 1200000, isInteractiveRental: true, dailyProfitBase: 0, desc: 'Sewa ruko untuk membuka 5 room rental PS/PC & room pasangan.' },
  { id: 'biz_battery_shop', name: 'Toko & Pabrik Baterai Oneilverse Energy', yearStart: 1980, baseRent2024: 1800000, isInteractiveRental: false, dailyProfitBase: 320000, desc: 'Menjual baterai rakitan hasil Lab R&D ke masyarakat & industri.' },
  { id: 'biz_warung', name: 'Warung Sembako & Kelontong UMKM', yearStart: 1980, baseRent2024: 800000, isInteractiveRental: false, dailyProfitBase: 140000, desc: 'Usaha kebutuhan pokok harian.' },
  { id: 'biz_wartel', name: 'Kios Wartel & Jasa Ketik', yearStart: 1985, yearEnd: 2012, baseRent2024: 600000, isInteractiveRental: false, dailyProfitBase: 110000, desc: 'Jasa telepon interlokal era lama.' },
  { id: 'biz_konter', name: 'Konter Pulsa, Kuota & Agen PPOB', yearStart: 2005, baseRent2024: 950000, isInteractiveRental: false, dailyProfitBase: 190000, desc: 'Agen pulsa, e-wallet & token listrik.' },
  { id: 'biz_cafe', name: 'Kedai Kopi & Roastery', yearStart: 2015, baseRent2024: 3200000, isInteractiveRental: false, dailyProfitBase: 480000, desc: 'Kafe nongkrong anak muda.' },
  { id: 'biz_klinik', name: 'Klinik Pratama & Apotek Kesehatan', yearStart: 1980, baseRent2024: 5500000, isInteractiveRental: false, dailyProfitBase: 950000, desc: 'Layanan dokter umum & apotek.' },
  { id: 'biz_corp', name: 'PT Oneilverse Nusantara (Korporasi)', yearStart: 1980, baseRent2024: 25000000, isInteractiveRental: false, dailyProfitBase: 3800000, desc: 'Perusahaan skala besar lintas sektor.' }
];

// DAFTAR PASANGAN (DIFILTER KETAT HETEROSEKSUAL BERDASARKAN GENDER KARAKTER!)
const PARTNERS_LIST = [
  { id: 'p_dimas', name: 'Dimas Pratama', gender: 'Laki-laki', age: 21, ethnicity: 'jawa', job: 'Mekanik Bengkel', maritalStatus: 'Lajang', charmReq: 20, generosity: 60000 },
  { id: 'p_reza', name: 'Reza Mahendra', gender: 'Laki-laki', age: 23, ethnicity: 'sunda', job: 'Programmer Startup', maritalStatus: 'Lajang', charmReq: 35, generosity: 150000 },
  { id: 'p_kenzo', name: 'Kenzo Wijaya', gender: 'Laki-laki', age: 25, ethnicity: 'chinese', job: 'Pengusaha Distributor', maritalStatus: 'Lajang', charmReq: 50, generosity: 450000 },
  { id: 'p_dr_andi', name: 'dr. Andi Saputra', gender: 'Laki-laki', age: 28, ethnicity: 'batak', job: 'Dokter Umum RSUD', maritalStatus: 'Lajang', charmReq: 60, generosity: 650000 },
  { id: 'p_lukas', name: 'Lukas Schneider', gender: 'Laki-laki', age: 29, ethnicity: 'bule', job: 'Arsitek Jerman', maritalStatus: 'Lajang', charmReq: 65, generosity: 1200000 },
  { id: 'p_hendra', name: 'Pak Hendra Gunawan', gender: 'Laki-laki', age: 38, ethnicity: 'chinese', job: 'Pemilik Showroom Mobil', maritalStatus: 'Suami Orang', charmReq: 55, generosity: 1600000 },
  { id: 'p_daniel', name: 'Daniel Weber', gender: 'Laki-laki', age: 36, ethnicity: 'bule', job: 'Konsultan Energi', maritalStatus: 'Suami Orang', charmReq: 65, generosity: 2100000 },

  { id: 'p_nadine', name: 'Nadine Putri', gender: 'Perempuan', age: 20, ethnicity: 'sunda', job: 'Mahasiswi Farmasi', maritalStatus: 'Lajang', charmReq: 20, generosity: 50000 },
  { id: 'p_clarissa', name: 'Clarissa Tan', gender: 'Perempuan', age: 22, ethnicity: 'chinese', job: 'Model & Selebgram', maritalStatus: 'Lajang', charmReq: 50, generosity: 350000 },
  { id: 'p_elena', name: 'Elena Petrova', gender: 'Perempuan', age: 26, ethnicity: 'bule', job: 'Desainer Fashion', maritalStatus: 'Lajang', charmReq: 65, generosity: 800000 },
  { id: 'p_nadia', name: 'Bu Nadia Maharani', gender: 'Perempuan', age: 34, ethnicity: 'jawa', job: 'Sosialita & Owner Butik', maritalStatus: 'Istri Orang', charmReq: 60, generosity: 1400000 }
];
