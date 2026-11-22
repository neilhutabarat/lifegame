// ==================== DATABASE EKONOMI, HARDWARE RENTAL PS, AGEN GROSIR & OTOMOTIF INDONESIA (2010 - 2026+) ====================

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const RELIGIONS_ID = ['Islam', 'Kristen Protestan', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];

// 38 PROVINSI & KOTA UTAMA INDONESIA
const INDONESIA_CITIES = [
  { id: 'btj', island: 'Sumatra', name: 'Banda Aceh (Aceh)', umr2024: 3550000, costFactor: 0.92 },
  { id: 'mdn', island: 'Sumatra', name: 'Medan (Sumatera Utara)', umr2024: 3769082, costFactor: 1.00 },
  { id: 'pdg', island: 'Sumatra', name: 'Padang (Sumatera Barat)', umr2024: 2811449, costFactor: 0.90 },
  { id: 'pku', island: 'Sumatra', name: 'Pekanbaru (Riau)', umr2024: 3451584, costFactor: 0.98 },
  { id: 'btm', island: 'Sumatra', name: 'Batam (Kepulauan Riau)', umr2024: 4685050, costFactor: 1.15 },
  { id: 'jbi', island: 'Sumatra', name: 'Kota Jambi (Jambi)', umr2024: 3387064, costFactor: 0.94 },
  { id: 'bks_bgl', island: 'Sumatra', name: 'Kota Bengkulu (Bengkulu)', umr2024: 2507079, costFactor: 0.88 },
  { id: 'plg', island: 'Sumatra', name: 'Palembang (Sumatera Selatan)', umr2024: 3677591, costFactor: 0.95 },
  { id: 'pgk', island: 'Sumatra', name: 'Pangkalpinang (Bangka Belitung)', umr2024: 3640000, costFactor: 1.02 },
  { id: 'tkg', island: 'Sumatra', name: 'Bandar Lampung (Lampung)', umr2024: 3103631, costFactor: 0.88 },
  { id: 'jkt', island: 'Jawa', name: 'DKI Jakarta', umr2024: 5067381, costFactor: 1.25 },
  { id: 'tng', island: 'Jawa', name: 'Tangerang / Serang (Banten)', umr2024: 4760289, costFactor: 1.12 },
  { id: 'bks', island: 'Jawa', name: 'Bekasi / Karawang (Jawa Barat)', umr2024: 5343430, costFactor: 1.15 },
  { id: 'bdg', island: 'Jawa', name: 'Bandung (Jawa Barat)', umr2024: 4209309, costFactor: 1.05 },
  { id: 'smg', island: 'Jawa', name: 'Semarang (Jawa Tengah)', umr2024: 3243969, costFactor: 0.92 },
  { id: 'ygk', island: 'Jawa', name: 'Yogyakarta (DI Yogyakarta)', umr2024: 2492997, costFactor: 0.80 },
  { id: 'slo', island: 'Jawa', name: 'Surakarta / Solo (Jawa Tengah)', umr2024: 2269070, costFactor: 0.78 },
  { id: 'sby', island: 'Jawa', name: 'Surabaya (Jawa Timur)', umr2024: 4725479, costFactor: 1.10 },
  { id: 'mlg', island: 'Jawa', name: 'Malang (Jawa Timur)', umr2024: 3309144, costFactor: 0.92 },
  { id: 'pnk', island: 'Kalimantan', name: 'Pontianak (Kalimantan Barat)', umr2024: 2840206, costFactor: 0.95 },
  { id: 'pky', island: 'Kalimantan', name: 'Palangka Raya (Kalimantan Tengah)', umr2024: 3310004, costFactor: 1.02 },
  { id: 'bdj', island: 'Kalimantan', name: 'Banjarmasin (Kalimantan Selatan)', umr2024: 3379513, costFactor: 0.98 },
  { id: 'bpn', island: 'Kalimantan', name: 'Balikpapan / IKN (Kalimantan Timur)', umr2024: 3475595, costFactor: 1.15 },
  { id: 'sri', island: 'Kalimantan', name: 'Samarinda (Kalimantan Timur)', umr2024: 3497124, costFactor: 1.10 },
  { id: 'trk', island: 'Kalimantan', name: 'Tarakan (Kalimantan Utara)', umr2024: 4160000, costFactor: 1.12 },
  { id: 'mdc', island: 'Sulawesi', name: 'Manado (Sulawesi Utara)', umr2024: 3590000, costFactor: 1.02 },
  { id: 'gto', island: 'Sulawesi', name: 'Kota Gorontalo (Gorontalo)', umr2024: 3025100, costFactor: 0.92 },
  { id: 'plw', island: 'Sulawesi', name: 'Palu (Sulawesi Tengah)', umr2024: 3179895, costFactor: 0.92 },
  { id: 'mju', island: 'Sulawesi', name: 'Mamuju (Sulawesi Barat)', umr2024: 2914958, costFactor: 0.90 },
  { id: 'mks', island: 'Sulawesi', name: 'Makassar (Sulawesi Selatan)', umr2024: 3643321, costFactor: 0.98 },
  { id: 'kdi', island: 'Sulawesi', name: 'Kendari (Sulawesi Tenggara)', umr2024: 3140000, costFactor: 0.94 },
  { id: 'dps', island: 'Bali & Nusra', name: 'Denpasar (Bali)', umr2024: 3096823, costFactor: 1.12 },
  { id: 'ami', island: 'Bali & Nusra', name: 'Mataram (Nusa Tenggara Barat)', umr2024: 2685089, costFactor: 0.88 },
  { id: 'koe', island: 'Bali & Nusra', name: 'Kupang (Nusa Tenggara Timur)', umr2024: 2200000, costFactor: 0.86 },
  { id: 'amq', island: 'Maluku & Papua', name: 'Ambon (Maluku)', umr2024: 2950000, costFactor: 1.15 },
  { id: 'tte', island: 'Maluku & Papua', name: 'Ternate (Maluku Utara)', umr2024: 3250000, costFactor: 1.18 },
  { id: 'soq', island: 'Maluku & Papua', name: 'Sorong (Papua Barat Daya)', umr2024: 3500000, costFactor: 1.30 },
  { id: 'jyp', island: 'Maluku & Papua', name: 'Jayapura (Papua)', umr2024: 4024270, costFactor: 1.38 }
];

// KURS USD / IDR ASLI PER TAHUN (2010 - 2026+)
const HISTORICAL_USD_IDR = {
  2010: 9090, 2011: 8770, 2012: 9380, 2013: 10450, 2014: 11870,
  2015: 13390, 2016: 13300, 2017: 13380, 2018: 14240, 2019: 14140,
  2020: 14580, 2021: 14310, 2022: 14850, 2023: 15240, 2024: 15850,
  2025: 16100, 2026: 16250
};
function getUsdRate(year) {
  if (year <= 2010) return 9090;
  if (HISTORICAL_USD_IDR[year]) return HISTORICAL_USD_IDR[year];
  return 16250 + (year - 2026) * 200;
}

// SUKU BUNGA PINJAMAN BANK UMKM / KREDIT USAHA (% PER TAHUN SESUAI ZAMAN)
function getBankInterestRate(year) {
  if (year <= 2012) return 13.5;
  if (year <= 2016) return 12.0;
  if (year <= 2019) return 10.5;
  if (year <= 2022) return 9.0;
  return 9.5;
}

// HARGA BENSIN (PREMIUM / PERTALITE) PER LITER SESUAI TAHUN INDONESIA
function getBbmPricePerLiter(year) {
  if (year <= 2012) return 4500;
  if (year === 2013) return 6500;
  if (year === 2014) return 8500;
  if (year <= 2017) return 7500;
  if (year <= 2021) return 7650;
  return 10000;
}

// INFLASI EKONOMI INDONESIA (PATOKAN 2010 = 0.55x dari 2024, ATAU PATOKAN HARGA 2010 = 1.0x)
function getEraMultiplier(year) {
  if (year <= 2010) return 0.55;
  if (year === 2011) return 0.58;
  if (year === 2012) return 0.62;
  if (year === 2013) return 0.67;
  if (year === 2014) return 0.72;
  if (year === 2015) return 0.76;
  if (year === 2016) return 0.79;
  if (year === 2017) return 0.83;
  if (year === 2018) return 0.86;
  if (year === 2019) return 0.89;
  if (year === 2020) return 0.91;
  if (year === 2021) return 0.93;
  if (year === 2022) return 0.96;
  if (year === 2023) return 0.98;
  if (year === 2024) return 1.00;
  return +(1.00 + (year - 2024) * 0.035).toFixed(3);
}

// Multiplier terhadap harga basis 2010
function get2010Multiplier(year) {
  return +(getEraMultiplier(year) / 0.55).toFixed(3);
}

// TOKEN LISTRIK PLN REALISTIS (2010: TDL ~Rp 790/kWh -> 20rb dapat ~23.5 kWh; 2024+: TDL Rp 1.444,70/kWh -> 20rb dapat ~13.29 kWh)
const PLN_TOKEN_NOMINALS = [20000, 50000, 100000, 200000, 500000, 1000000];
function calcPlnToken(nominal, year) {
  const tdl2024 = 1444.70;
  const tdl = tdl2024 * getEraMultiplier(year);
  const adminFee = year <= 2014 ? 1500 : year <= 2019 ? 2000 : 2500;
  const ppj = nominal * 0.04; // Pajak Penerangan Jalan 4%
  const netRupiah = nominal - ppj;
  const kwhReceived = +(netRupiah / tdl).toFixed(2);
  return { nominal, adminFee, totalPay: nominal + adminFee, kwhReceived, tdl: Math.round(tdl) };
}

// BPJS KESEHATAN
const BPJS_TIERS = [
  { id: 'none', name: 'Tanpa BPJS', monthly2024: 0 },
  { id: 'k3', name: 'BPJS Kelas 3', monthly2024: 35000 },
  { id: 'k2', name: 'BPJS Kelas 2', monthly2024: 100000 },
  { id: 'k1', name: 'BPJS Kelas 1', monthly2024: 150000 }
];

const ETHNICITIES = [
  { id: 'chinese', name: 'Chinese / Tionghoa', trait: 'Kulit putih cerah, mata sipit manis', skin: '#fce7d6' },
  { id: 'batak', name: 'Batak', trait: 'Tegas, berkarisma kuat, sorot mata tajam', skin: '#e8b89a' },
  { id: 'melayu', name: 'Melayu (Jambi / Riau / Deli)', trait: 'Ramah, lembut, tutur kata santun', skin: '#f1c6a7' },
  { id: 'jawa', name: 'Jawa', trait: 'Lembut, anggun, senyum manis', skin: '#e2ae8b' },
  { id: 'sunda', name: 'Sunda', trait: 'Kulit bersih, ramah, memikat', skin: '#f5ccb0' },
  { id: 'minang', name: 'Minangkabau', trait: 'Cerdas berdagang, paras menawan', skin: '#ecc0a1' },
  { id: 'manado', name: 'Manado / Minahasa', trait: 'Wajah blasteran alami, kulit cerah', skin: '#fae1cd' },
  { id: 'bule', name: 'Bule (Eropa / Kaukasia)', trait: 'Hidung mancung, mata terang, postur tinggi', skin: '#fff0e5' },
  { id: 'arab', name: 'Arab / Timur Tengah', trait: 'Alis tebal, hidung mancung', skin: '#f3cfb6' },
  { id: 'korea', name: 'Korea / Asia Timur', trait: 'Kulit glass-skin, fitur wajah lembut', skin: '#fdf0e6' }
];

// KALENDER HARI LIBUR NASIONAL INDONESIA (2010 - SEKARANG)
const FIXED_HOLIDAYS = {
  '1-1': 'Tahun Baru Masehi',
  '1-5': 'Hari Buruh Internasional',
  '1-6': 'Hari Lahir Pancasila',
  '17-8': 'HUT Kemerdekaan RI',
  '25-12': 'Hari Raya Natal'
};
// Tanggal Idul Fitri & Imlek Asli per Tahun (2010 - 2026)
const MOVING_HOLIDAYS_BY_YEAR = {
  2010: { '14-2': 'Tahun Baru Imlek 2561', '10-9': 'Hari Raya Idul Fitri 1431 H', '11-9': 'Cuti Bersama Idul Fitri', '17-11': 'Idul Adha 1431 H' },
  2011: { '3-2': 'Tahun Baru Imlek 2562', '30-8': 'Hari Raya Idul Fitri 1432 H', '31-8': 'Idul Fitri Hari Kedua', '6-11': 'Idul Adha 1432 H' },
  2012: { '23-1': 'Tahun Baru Imlek 2563', '19-8': 'Hari Raya Idul Fitri 1433 H', '20-8': 'Idul Fitri Hari Kedua', '26-10': 'Idul Adha 1433 H' },
  2013: { '10-2': 'Tahun Baru Imlek 2564', '8-8': 'Hari Raya Idul Fitri 1434 H', '9-8': 'Idul Fitri Hari Kedua', '15-10': 'Idul Adha 1434 H' },
  2014: { '31-1': 'Tahun Baru Imlek 2565', '28-7': 'Hari Raya Idul Fitri 1435 H', '29-7': 'Idul Fitri Hari Kedua', '5-10': 'Idul Adha 1435 H' },
  2015: { '19-2': 'Tahun Baru Imlek 2566', '17-7': 'Hari Raya Idul Fitri 1436 H', '18-7': 'Idul Fitri Hari Kedua', '24-9': 'Idul Adha 1436 H' },
  2016: { '8-2': 'Tahun Baru Imlek 2567', '6-7': 'Hari Raya Idul Fitri 1437 H', '7-7': 'Idul Fitri Hari Kedua', '12-9': 'Idul Adha 1437 H' },
  2017: { '28-1': 'Tahun Baru Imlek 2568', '25-6': 'Hari Raya Idul Fitri 1438 H', '26-6': 'Idul Fitri Hari Kedua', '1-9': 'Idul Adha 1438 H' },
  2018: { '16-2': 'Tahun Baru Imlek 2569', '15-6': 'Hari Raya Idul Fitri 1439 H', '16-6': 'Idul Fitri Hari Kedua', '22-8': 'Idul Adha 1439 H' },
  2019: { '5-2': 'Tahun Baru Imlek 2570', '5-6': 'Hari Raya Idul Fitri 1440 H', '6-6': 'Idul Fitri Hari Kedua', '11-8': 'Idul Adha 1440 H' },
  2020: { '25-1': 'Tahun Baru Imlek 2571', '24-5': 'Hari Raya Idul Fitri 1441 H', '25-5': 'Idul Fitri Hari Kedua', '31-7': 'Idul Adha 1441 H' },
  2021: { '12-2': 'Tahun Baru Imlek 2572', '13-5': 'Hari Raya Idul Fitri 1442 H', '14-5': 'Idul Fitri Hari Kedua', '20-7': 'Idul Adha 1442 H' },
  2022: { '1-2': 'Tahun Baru Imlek 2573', '2-5': 'Hari Raya Idul Fitri 1443 H', '3-5': 'Idul Fitri Hari Kedua', '10-7': 'Idul Adha 1443 H' },
  2023: { '22-1': 'Tahun Baru Imlek 2574', '22-4': 'Hari Raya Idul Fitri 1444 H', '23-4': 'Idul Fitri Hari Kedua', '29-6': 'Idul Adha 1444 H' },
  2024: { '10-2': 'Tahun Baru Imlek 2575', '10-4': 'Hari Raya Idul Fitri 1445 H', '11-4': 'Idul Fitri Hari Kedua', '17-6': 'Idul Adha 1445 H' },
  2025: { '29-1': 'Tahun Baru Imlek 2576', '31-3': 'Hari Raya Idul Fitri 1446 H', '1-4': 'Idul Fitri Hari Kedua', '6-6': 'Idul Adha 1446 H' },
  2026: { '17-2': 'Tahun Baru Imlek 2577', '20-3': 'Hari Raya Idul Fitri 1447 H', '21-3': 'Idul Fitri Hari Kedua', '27-5': 'Idul Adha 1447 H' }
};
function getHolidayName(year, month, day) {
  const key = `${day}-${month}`;
  if (FIXED_HOLIDAYS[key]) return FIXED_HOLIDAYS[key];
  if (MOVING_HOLIDAYS_BY_YEAR[year] && MOVING_HOLIDAYS_BY_YEAR[year][key]) return MOVING_HOLIDAYS_BY_YEAR[year][key];
  return null;
}

// ==================== KATALOG KONSOL PS1 - PS5 (VERSI KASET FISIK & VERSI DIGITAL INTERNAL + FOTO ASLI) ====================
const CONSOLE_CATALOG = [
  { id: 'ps1_fat', platform: 'PS1', name: 'PlayStation 1 (PSX SCPH-7501) CD Fisik', mediaType: 'disc', storageGb: 0, releaseYear: 1995, basePrice2010: 450000, watt: 18, baseRate2010: 2000, img: REAL_CONSOLE_PHOTOS.ps1_fat },
  { id: 'ps1_one', platform: 'PS1', name: 'PSOne Slim Original CD Fisik', mediaType: 'disc', storageGb: 0, releaseYear: 2000, basePrice2010: 550000, watt: 15, baseRate2010: 2500, img: REAL_CONSOLE_PHOTOS.ps1_one },
  { id: 'ps2_fat', platform: 'PS2', name: 'PlayStation 2 Fat (SCPH-50000) DVD Fisik', mediaType: 'disc', storageGb: 0, releaseYear: 2001, basePrice2010: 1150000, watt: 45, baseRate2010: 3000, img: REAL_CONSOLE_PHOTOS.ps2_fat },
  { id: 'ps2_slim', platform: 'PS2', name: 'PlayStation 2 Slim (SCPH-90006) DVD Fisik', mediaType: 'disc', storageGb: 0, releaseYear: 2007, basePrice2010: 1350000, watt: 35, baseRate2010: 3500, img: REAL_CONSOLE_PHOTOS.ps2_slim },
  { id: 'ps3_fat_disc', platform: 'PS3', name: 'PS3 Fat Blu-Ray Fisik (80GB)', mediaType: 'disc', storageGb: 80, releaseYear: 2007, basePrice2010: 3400000, watt: 160, baseRate2010: 6000, img: REAL_CONSOLE_PHOTOS.ps3_fat },
  { id: 'ps3_slim_disc', platform: 'PS3', name: 'PS3 Slim Versi Kaset BD Fisik (160GB)', mediaType: 'disc', storageGb: 160, releaseYear: 2009, basePrice2010: 3800000, watt: 95, baseRate2010: 7000, img: REAL_CONSOLE_PHOTOS.ps3_slim },
  { id: 'ps3_slim_dig120', platform: 'PS3', name: 'PS3 Slim Digital Internal 120GB', mediaType: 'digital', storageGb: 120, releaseYear: 2009, basePrice2010: 3950000, watt: 95, baseRate2010: 7000, img: REAL_CONSOLE_PHOTOS.ps3_slim },
  { id: 'ps3_slim_dig250', platform: 'PS3', name: 'PS3 Slim Digital Internal 250GB', mediaType: 'digital', storageGb: 250, releaseYear: 2010, basePrice2010: 4300000, watt: 90, baseRate2010: 7500, img: REAL_CONSOLE_PHOTOS.ps3_slim },
  { id: 'ps3_sslim_dig500', platform: 'PS3', name: 'PS3 Super Slim Digital Internal 500GB', mediaType: 'digital', storageGb: 500, releaseYear: 2012, basePrice2010: 4600000, watt: 80, baseRate2010: 8000, img: REAL_CONSOLE_PHOTOS.ps3_sslim },
  { id: 'ps4_fat_disc', platform: 'PS4', name: 'PS4 Fat Blu-Ray Fisik (500GB)', mediaType: 'disc', storageGb: 500, releaseYear: 2013, basePrice2010: 5200000, watt: 140, baseRate2010: 10000, img: REAL_CONSOLE_PHOTOS.ps4_fat },
  { id: 'ps4_slim_disc', platform: 'PS4', name: 'PS4 Slim Versi Kaset BD Fisik (500GB)', mediaType: 'disc', storageGb: 500, releaseYear: 2016, basePrice2010: 4800000, watt: 110, baseRate2010: 11000, img: REAL_CONSOLE_PHOTOS.ps4_slim },
  { id: 'ps4_slim_dig500', platform: 'PS4', name: 'PS4 Slim Digital Internal 500GB', mediaType: 'digital', storageGb: 500, releaseYear: 2016, basePrice2010: 4900000, watt: 110, baseRate2010: 11000, img: REAL_CONSOLE_PHOTOS.ps4_slim },
  { id: 'ps4_slim_dig1tb', platform: 'PS4', name: 'PS4 Slim Digital Internal 1TB (1000GB)', mediaType: 'digital', storageGb: 1000, releaseYear: 2016, basePrice2010: 5400000, watt: 110, baseRate2010: 12000, img: REAL_CONSOLE_PHOTOS.ps4_slim },
  { id: 'ps4_pro_dig2tb', platform: 'PS4', name: 'PS4 Pro 4K Digital Internal 2TB', mediaType: 'digital', storageGb: 2000, releaseYear: 2017, basePrice2010: 6500000, watt: 155, baseRate2010: 14000, img: REAL_CONSOLE_PHOTOS.ps4_pro },
  { id: 'ps5_disc', platform: 'PS5', name: 'PlayStation 5 Disc Edition (Kaset BD Fisik)', mediaType: 'disc', storageGb: 825, releaseYear: 2020, basePrice2010: 7800000, watt: 200, baseRate2010: 18000, img: REAL_CONSOLE_PHOTOS.ps5_disc },
  { id: 'ps5_dig_825', platform: 'PS5', name: 'PlayStation 5 Digital Edition (SSD 825GB)', mediaType: 'digital', storageGb: 825, releaseYear: 2020, basePrice2010: 6800000, watt: 190, baseRate2010: 18000, img: REAL_CONSOLE_PHOTOS.ps5_dig },
  { id: 'ps5_slim_dig1tb', platform: 'PS5', name: 'PS5 Slim Digital Edition (SSD 1TB)', mediaType: 'digital', storageGb: 1000, releaseYear: 2023, basePrice2010: 7200000, watt: 185, baseRate2010: 20000, img: REAL_CONSOLE_PHOTOS.ps5_dig },
  { id: 'ps5_pro_dig2tb', platform: 'PS5', name: 'PS5 Pro Digital Edition (SSD 2TB)', mediaType: 'digital', storageGb: 2000, releaseYear: 2024, basePrice2010: 9500000, watt: 215, baseRate2010: 25000, img: REAL_CONSOLE_PHOTOS.ps5_disc }
];

// ==================== KATALOG TV & MONITOR ====================
const TV_CATALOG = [
  { id: 'tv_crt14', name: 'TV Tabung Polytron 14" CRT', releaseYear: 1995, basePrice2010: 450000, watt: 55, comfortBonus: 0, rateBonus2010: 0, img: REAL_CONSOLE_PHOTOS.tv_crt },
  { id: 'tv_crt21', name: 'TV Tabung Sony Trinitron 21" Flat', releaseYear: 2000, basePrice2010: 750000, watt: 75, comfortBonus: 5, rateBonus2010: 500, img: REAL_CONSOLE_PHOTOS.tv_crt },
  { id: 'tv_lcd24', name: 'TV LCD LG 24" HD Ready', releaseYear: 2008, basePrice2010: 1450000, watt: 40, comfortBonus: 12, rateBonus2010: 1000, img: REAL_CONSOLE_PHOTOS.tv_lcd },
  { id: 'tv_led32', name: 'TV LED Samsung 32" HD', releaseYear: 2010, basePrice2010: 2250000, watt: 48, comfortBonus: 20, rateBonus2010: 1500, img: REAL_CONSOLE_PHOTOS.tv_led },
  { id: 'tv_led43', name: 'Smart TV Sony Bravia 43" Full HD', releaseYear: 2014, basePrice2010: 3600000, watt: 65, comfortBonus: 30, rateBonus2010: 2500, img: REAL_CONSOLE_PHOTOS.tv_led },
  { id: 'tv_oled55', name: 'LG OLED 55" 4K 120Hz Gaming TV', releaseYear: 2019, basePrice2010: 7800000, watt: 95, comfortBonus: 45, rateBonus2010: 5000, img: REAL_CONSOLE_PHOTOS.tv_led }
];

// ==================== KATALOG PENDINGIN (KIPAS & AC) ====================
const COOLING_CATALOG = [
  { id: 'fan_wall', type: 'fan', name: 'Kipas Angin Dinding Miyako 16"', releaseYear: 1995, basePrice2010: 165000, watt: 45, comfortBonus: 10, rateBonus2010: 500, img: REAL_CONSOLE_PHOTOS.fan },
  { id: 'fan_tornado', type: 'fan', name: 'Kipas Tornado Besi Regency 18"', releaseYear: 2005, basePrice2010: 320000, watt: 75, comfortBonus: 16, rateBonus2010: 1000, img: REAL_CONSOLE_PHOTOS.fan },
  { id: 'ac_half_pk', type: 'ac', name: 'AC Split Panasonic 1/2 PK Low Watt', releaseYear: 2008, basePrice2010: 2450000, watt: 340, comfortBonus: 35, rateBonus2010: 2500, img: REAL_CONSOLE_PHOTOS.ac },
  { id: 'ac_1pk_inv', type: 'ac', name: 'AC Daikin Inverter 1 PK Dingin Cepat', releaseYear: 2013, basePrice2010: 3800000, watt: 520, comfortBonus: 50, rateBonus2010: 4000, img: REAL_CONSOLE_PHOTOS.ac }
];

// ==================== KATALOG STIK & MEMORY CARD (STOK KASIR) ====================
const ACCESSORY_CATALOG = [
  { id: 'stik_ps1', kind: 'stik', platform: 'PS1', name: 'Stik PS1 Analog Original', releaseYear: 1995, basePrice2010: 45000, maxDurabilityNew: 100, maxDurabilityServiced: 65, img: REAL_CONSOLE_PHOTOS.stik_ps1 },
  { id: 'stik_ps2', kind: 'stik', platform: 'PS2', name: 'Stik PS2 DualShock 2 Ori Pabrik (OP)', releaseYear: 2001, basePrice2010: 65000, maxDurabilityNew: 100, maxDurabilityServiced: 65, img: REAL_CONSOLE_PHOTOS.stik_ps2 },
  { id: 'stik_ps3', kind: 'stik', platform: 'PS3', name: 'Stik PS3 DualShock 3 Wireless Ori', releaseYear: 2007, basePrice2010: 185000, maxDurabilityNew: 100, maxDurabilityServiced: 65, img: REAL_CONSOLE_PHOTOS.stik_ps3 },
  { id: 'stik_ps4', kind: 'stik', platform: 'PS4', name: 'Stik PS4 DualShock 4 Lightbar Ori', releaseYear: 2013, basePrice2010: 420000, maxDurabilityNew: 100, maxDurabilityServiced: 65, img: REAL_CONSOLE_PHOTOS.stik_ps4 },
  { id: 'stik_ps5', kind: 'stik', platform: 'PS5', name: 'Stik PS5 DualSense Haptic Original', releaseYear: 2020, basePrice2010: 680000, maxDurabilityNew: 100, maxDurabilityServiced: 65, img: REAL_CONSOLE_PHOTOS.stik_ps5 },
  { id: 'mc_ps1', kind: 'mc', platform: 'PS1', name: 'Memory Card PS1 1MB (15 Blocks)', releaseYear: 1995, basePrice2010: 35000, img: REAL_CONSOLE_PHOTOS.mc_ps1 },
  { id: 'mc_ps2', kind: 'mc', platform: 'PS2', name: 'Memory Card PS2 8MB MagicGate', releaseYear: 2001, basePrice2010: 55000, img: REAL_CONSOLE_PHOTOS.mc_ps2 }
];

// ==================== RENOVASI TEMPAT USAHA & ROOM ====================
const RENOV_LEVELS = [
  { level: 1, name: 'Level 1: Ruko Standar Semen & Cat Polos', baseCost2010: 0, appealBonus: 0, rateMult: 1.0, wallColor: '#1e293b', floorColor: '#0f172a' },
  { level: 2, name: 'Level 2: Keramik Bersih, Cat Cerah & Poster Game', baseCost2010: 4500000, appealBonus: 15, rateMult: 1.15, wallColor: '#1e3a8a', floorColor: '#1e293b' },
  { level: 3, name: 'Level 3: Sofa Beanbag/Kulit, Partisi Kaca & Lampu LED', baseCost2010: 12500000, appealBonus: 35, rateMult: 1.35, wallColor: '#312e81', floorColor: '#172554' },
  { level: 4, name: 'Level 4: Sultan Esports Arena (Kedap Suara, Vinyl & RGB)', baseCost2010: 28000000, appealBonus: 65, rateMult: 1.65, wallColor: '#4c1d95', floorColor: '#090d16' }
];

// ==================== GROSIR MAKANAN & MINUMAN AGEN (BELI PER DUS + FOTO ASLI!) ====================
const WHOLESALE_SNACK_CATALOG = [
  { id: 'sn_indomie_grg', name: 'Indomie Goreng Spesial (Matang + Telur)', pcsPerBox: 40, boxPrice2010: 48000, sellPcs2010: 3500, img: REAL_CONSOLE_PHOTOS.indomie },
  { id: 'sn_indomie_soto', name: 'Indomie Kuah Soto Mie (Matang)', pcsPerBox: 40, boxPrice2010: 46000, sellPcs2010: 3500, img: REAL_CONSOLE_PHOTOS.indomie },
  { id: 'sn_teh_gelas', name: 'Teh Gelas Cup Dingin', pcsPerBox: 24, boxPrice2010: 16500, sellPcs2010: 1000, img: REAL_CONSOLE_PHOTOS.drink },
  { id: 'sn_teh_pucuk', name: 'Teh Pucuk Harum Botol 350ml', pcsPerBox: 24, boxPrice2010: 48000, sellPcs2010: 3000, img: REAL_CONSOLE_PHOTOS.drink },
  { id: 'sn_aqua_gelas', name: 'Aqua Gelas Air Mineral', pcsPerBox: 48, boxPrice2010: 20000, sellPcs2010: 500, img: REAL_CONSOLE_PHOTOS.drink },
  { id: 'sn_kopi_goodday', name: 'Es Kopi Good Day / Kapal Api Seduh', pcsPerBox: 30, boxPrice2010: 27000, sellPcs2010: 2000, img: REAL_CONSOLE_PHOTOS.drink },
  { id: 'sn_chitato', name: 'Chitato / Qtela Snack Kentang', pcsPerBox: 20, boxPrice2010: 55000, sellPcs2010: 4000, img: REAL_CONSOLE_PHOTOS.snack },
  { id: 'sn_kacang_garuda', name: 'Kacang Garuda / Sukro Rosta', pcsPerBox: 24, boxPrice2010: 36000, sellPcs2010: 2500, img: REAL_CONSOLE_PHOTOS.snack }
];

// ==================== OPERATOR PULSA ASLI INDONESIA ====================
const PPOB_OPERATORS = [
  { id: 'tsel', name: 'Telkomsel (Simpati / Kartu AS)', color: '#dc2626' },
  { id: 'isat', name: 'Indosat Ooredoo (IM3 / Mentari)', color: '#eab308' },
  { id: 'xl', name: 'XL Axiata', color: '#2563eb' },
  { id: 'axis', name: 'AXIS', color: '#7c3aed' },
  { id: 'tri', name: 'Tri (3 Indonesia)', color: '#ec4899' },
  { id: 'smart', name: 'Smartfren', color: '#e11d48' }
];

const REAL_MOTOR_PHOTO = makeItemIllus('motor', 'Motor Indonesia', 'Otomotif Roda 2', '#ef4444');
const REAL_CAR_PHOTO = makeItemIllus('mobil', 'Mobil Keluarga', 'MPV / SUV / Travel', '#2563eb');
const REAL_PICKUP_PHOTO = makeItemIllus('mobil', 'Pick Up Niaga', 'Angkutan Barang', '#475569');
const REAL_PHONE_PHOTO = makeItemIllus('hp', 'Smartphone / Tablet', 'Gadget Pribadi', '#3b82f6');
const REAL_LAPTOP_PHOTO = makeItemIllus('hp', 'Laptop / Notebook', 'Komputer Portabel', '#0284c7');

// ==================== 20 PILIHAN MOTOR INDONESIA SESUAI TAHUN ====================
const MOTOR_CATALOG_20 = [
  ['m01', 'Honda Supra X 125D / CW', 2005, 14800000, 4.0],
  ['m02', 'Yamaha Mio Sporty CW (Mio Smile)', 2008, 12200000, 3.7],
  ['m03', 'Honda Beat Karbu', 2008, 12500000, 3.5],
  ['m04', 'Suzuki Satria FU 150 SCD', 2009, 18200000, 4.2],
  ['m05', 'Yamaha V-Ixion 150 (Old Vixion)', 2008, 20800000, 12.0],
  ['m06', 'Honda Tiger Revo 200cc', 2008, 24500000, 13.2],
  ['m07', 'Yamaha RX-King Peredam Legend', 2007, 16500000, 9.5],
  ['m08', 'Kawasaki Ninja 150 RR 2-Tak', 2009, 32500000, 11.5],
  ['m09', 'Honda Vario Techno 110 CBS', 2009, 15800000, 3.7],
  ['m10', 'Honda Scoopy Karbu / FI', 2010, 13800000, 3.7],
  ['m11', 'Yamaha Jupiter MX 135 New', 2011, 16800000, 4.0],
  ['m12', 'Honda Vario Techno 125 PGM-FI', 2012, 16500000, 5.5],
  ['m13', 'Honda CB150R StreetFire', 2013, 22800000, 12.0],
  ['m14', 'Honda Beat FI eSP', 2014, 14500000, 4.0],
  ['m15', 'Yamaha NMAX 155 VVA', 2015, 24500000, 6.6],
  ['m16', 'Kawasaki KLX 150 BF Trail', 2015, 29500000, 6.9],
  ['m17', 'Yamaha Aerox 155 VVA', 2017, 23800000, 4.6],
  ['m18', 'Honda PCX 150 / 160 Lokal ABS', 2018, 28800000, 8.0],
  ['m19', 'Vespa Sprint 150 i-Get ABS', 2019, 46500000, 7.0],
  ['m20', 'Kawasaki Ninja ZX-25R 4-Silinder', 2020, 96000000, 15.0]
].map(([id, name, yearStart, price2010, tankCap]) => ({
  id, category: 'Motor', name, yearStart, price2010, tankCap, commercialDaily2010: 0,
  img: REAL_MOTOR_PHOTO
}));

// ==================== 20 PILIHAN MOBIL INDONESIA (PRIBADI + PICK UP ANGKUTAN + TRAVEL) ====================
const CAR_CATALOG_20 = [
  ['c01', 'Suzuki Carry Futura 1.5 Pick Up (Angkutan Barang)', 2005, 82000000, 42, 120000],
  ['c02', 'Daihatsu Gran Max 1.5 Pick Up (Usaha Kargo)', 2008, 88000000, 43, 135000],
  ['c03', 'Mitsubishi L300 Pick Up Diesel (Raja Angkutan)', 2005, 138000000, 47, 185000],
  ['c04', 'Isuzu Elf Microbus 16-Seat (Usaha Travel Antarkota)', 2008, 215000000, 75, 290000],
  ['c05', 'Toyota Avanza 1.3 G VVT-i', 2006, 142000000, 45, 95000],
  ['c06', 'Daihatsu Xenia 1.3 Xi', 2006, 128000000, 45, 85000],
  ['c07', 'Toyota Kijang Innova 2.0 G / 2.5 Diesel', 2008, 218000000, 55, 140000],
  ['c08', 'Honda Jazz GE8 1.5 RS', 2008, 198000000, 42, 0],
  ['c09', 'Toyota Yaris Bakpao 1.5 S', 2009, 185000000, 42, 0],
  ['c10', 'Nissan Grand Livina 1.5 XV', 2008, 168000000, 50, 0],
  ['c11', 'Suzuki Ertiga 1.4 GX', 2012, 165000000, 45, 100000],
  ['c12', 'Honda Brio Satya / RS', 2013, 125000000, 35, 0],
  ['c13', 'Toyota Agya / Daihatsu Ayla LCGC', 2013, 105000000, 33, 0],
  ['c14', 'Toyota HiAce Commuter 15-Seat (Travel Eksekutif)', 2013, 365000000, 70, 420000],
  ['c15', 'Honda Mobilio 1.5 E / RS', 2014, 175000000, 42, 110000],
  ['c16', 'Toyota Calya / Daihatsu Sigra 7-Seater', 2016, 138000000, 36, 95000],
  ['c17', 'Mitsubishi Pajero Sport Dakar 4x2', 2016, 445000000, 68, 0],
  ['c18', 'Toyota Fortuner VRZ 2.4 Diesel', 2016, 450000000, 80, 0],
  ['c19', 'Mitsubishi Xpander Ultimate', 2017, 235000000, 45, 130000],
  ['c20', 'Toyota Kijang Innova Zenix Hybrid / Alphard', 2022, 480000000, 52, 250000]
].map(([id, name, yearStart, price2010, tankCap, commercialDaily2010]) => ({
  id, category: 'Mobil', name, yearStart, price2010, tankCap, commercialDaily2010,
  img: name.includes('Pick Up') ? REAL_PICKUP_PHOTO : REAL_CAR_PHOTO
}));

const VEHICLE_CATALOG = [...MOTOR_CATALOG_20, ...CAR_CATALOG_20];

// ==================== KATALOG GADGET (HP, LAPTOP, TABLET 2010 - 2026+) ====================
const GADGET_CATALOG = [
  ['g01', 'Nokia', 'HP', 'Nokia C3-00 QWERTY', 2010, 1150000],
  ['g02', 'BlackBerry', 'HP', 'BlackBerry Gemini 8520 (BBM Hits)', 2010, 2250000],
  ['g03', 'BlackBerry', 'HP', 'BlackBerry Onyx 9700 Bold', 2010, 4400000],
  ['g04', 'Apple', 'HP', 'iPhone 4 16GB', 2010, 6200000],
  ['g05', 'Acer', 'Laptop', 'Netbook Acer Aspire One 10"', 2010, 2950000],
  ['g06', 'ASUS', 'Laptop', 'ASUS A43S Core i3 GT540M', 2011, 5200000],
  ['g07', 'Samsung', 'HP', 'Samsung Galaxy Young S5360', 2011, 1200000],
  ['g08', 'Apple', 'Tablet', 'iPad 2 32GB Wi-Fi+3G', 2011, 5600000],
  ['g09', 'Samsung', 'HP', 'Samsung Galaxy S4', 2013, 6500000],
  ['g10', 'Apple', 'HP', 'iPhone 5S Gold TouchID', 2013, 8500000],
  ['g11', 'Xiaomi', 'HP', 'Xiaomi Redmi 1S / Note 3G', 2014, 1599000],
  ['g12', 'Lenovo', 'Laptop', 'Lenovo ThinkPad X240 / T440p', 2014, 9500000],
  ['g13', 'ASUS', 'Laptop', 'ASUS ROG GL552VX Gaming', 2016, 12500000],
  ['g14', 'Apple', 'HP', 'iPhone X 64GB FaceID', 2017, 14500000],
  ['g15', 'Xiaomi', 'HP', 'Redmi Note 8 Pro', 2019, 2899000],
  ['g16', 'Apple', 'HP', 'iPhone 11 128GB', 2019, 12999000],
  ['g17', 'Apple', 'Laptop', 'MacBook Air M1', 2020, 13999000],
  ['g18', 'Samsung', 'HP', 'Samsung Galaxy S22 Ultra', 2022, 17999000],
  ['g19', 'ASUS', 'Laptop', 'ASUS ROG Strix G16 RTX 4060', 2023, 21500000],
  ['g20', 'Apple', 'HP', 'iPhone 16 Pro Max 256GB', 2024, 22999000]
].map(([id, brand, category, name, yearStart, price2010]) => ({
  id, brand, category, name, yearStart, price2010,
  img: category === 'Laptop' ? REAL_LAPTOP_PHOTO : REAL_PHONE_PHOTO
}));

// PASANGAN UNTUK MENIKAH & PUNYA ANAK (PEWARIS RENTAL PS)
const PARTNERS_LIST = [
  { id: 'p_dimas', name: 'Dimas Pratama', gender: 'Laki-laki', age: 21, ethnicity: 'jawa', job: 'Teknisi Elektronik' },
  { id: 'p_reza', name: 'Reza Mahendra', gender: 'Laki-laki', age: 23, ethnicity: 'sunda', job: 'Wiraswasta Muda' },
  { id: 'p_kenzo', name: 'Kenzo Wijaya', gender: 'Laki-laki', age: 24, ethnicity: 'chinese', job: 'Distributor Konsol & Part' },
  { id: 'p_nadine', name: 'Nadine Putri', gender: 'Perempuan', age: 20, ethnicity: 'sunda', job: 'Mahasiswi Akuntansi' },
  { id: 'p_clarissa', name: 'Clarissa Tan', gender: 'Perempuan', age: 22, ethnicity: 'chinese', job: 'Desainer Grafis' },
  { id: 'p_ayu', name: 'Ayu Lestari', gender: 'Perempuan', age: 21, ethnicity: 'jawa', job: 'Guru Sekolah' }
];
