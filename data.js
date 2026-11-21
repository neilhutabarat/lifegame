// DATABASE LENGKAP INDONESIA (2020 - 2026+) - RENTAL LIFE BY ONEILVERSE v1.0

const DENOMINATIONS = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500];
const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// AGAMA DI INDONESIA
const RELIGIONS_ID = ['Islam', 'Kristen Protestan', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];

// ETNIS & GENETIKA KETURUNAN
const ETHNICITIES = [
  { id: 'chinese', name: 'Chinese / Tionghoa', trait: 'Kulit putih cerah, mata sipit manis' },
  { id: 'batak', name: 'Batak', trait: 'Tegas, berkarisma kuat, sorot mata tajam' },
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
    'bule+jawa': 'Indo-Eropa Jawa (Paras eksotis menawan, senyum manis, mata cokelat terang)',
    'bule+sunda': 'Indo-Eropa Sunda (Kulit cerah merona, hidung mancung, wajah fotogenik)',
    'batak+chinese': 'Chindo-Batak (Kulit cerah, karakter kuat & cerdas)',
    'chinese+jawa': 'Peranakan Chindo-Jawa (Kulit kuning langsat halus, wajah lembut)',
    'chinese+korea': 'East-Asian Mix (Wajah seperti idol Korea-Tionghoa)',
    'arab+chinese': 'Blasteran Tionghoa-Timur Tengah (Kulit putih, alis tebal, mata tajam)'
  };
  if (eth1 === eth2) {
    const same = ETHNICITIES.find(e => e.id === eth1);
    return `Keturunan ${same ? same.name : eth1} murni (${same ? same.trait : 'sehat & rupawan'})`;
  }
  return map[pair] || `Blasteran ${eth1.toUpperCase()} - ${eth2.toUpperCase()} (Paras unik perpaduan dua budaya)`;
}

// KALKULASI JADWAL SHOLAT DINAMIS BERDASARKAN DEKLINASI MATAHARI PER BULAN & TANGGAL (WIB / JAKARTA)
function getDynamicPrayerTimes(month, day) {
  // Pergeseran matahari musiman menggeser Subuh, Dzuhur, Ashar, Maghrib, Isya sekitar ±15-25 menit sepanjang tahun
  const dayOfYear = (month - 1) * 30 + day;
  const solarShift = Math.round(Math.sin((dayOfYear / 365) * 2 * Math.PI) * 16); // -16 s/d +16 menit
  const asharShift = Math.round(Math.cos((dayOfYear / 365) * 2 * Math.PI) * 10);

  function fmt(totalMin) {
    const h = Math.floor(totalMin / 60);
    const m = ((totalMin % 60) + 60) % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  return {
    subuh: fmt(4 * 60 + 38 + solarShift),
    dzuhur: fmt(11 * 60 + 58 + Math.round(solarShift * 0.7)),
    ashar: fmt(15 * 60 + 15 + asharShift),
    maghrib: fmt(17 * 60 + 58 - Math.round(solarShift * 0.8)),
    isya: fmt(19 * 60 + 10 - Math.round(solarShift * 0.8))
  };
}

const HOLIDAYS_ID = {
  '1-1': 'Tahun Baru Masehi',
  '25-1': 'Tahun Baru Imlek',
  '22-3': 'Isra Mikraj',
  '25-3': 'Hari Suci Nyepi',
  '1-5': 'Hari Buruh Internasional',
  '24-5': 'Hari Raya Idul Fitri',
  '1-6': 'Hari Lahir Pancasila',
  '31-7': 'Hari Raya Idul Adha',
  '17-8': 'HUT Kemerdekaan RI',
  '29-10': 'Maulid Nabi Muhammad SAW',
  '25-12': 'Hari Raya Natal'
};

// CHARGER TIERS (5W -> 480W MAX)
const CHARGER_TIERS = [5, 10, 15, 18, 25, 33, 45, 67, 80, 90, 100, 120, 180, 240, 360, 480];
const CHARGER_RESEARCH_STEPS_NAMES = [
  'Riset Gulungan Trafo Step-Down', 'Kalibrasi Mosfet Switching', 'Pengujian Kapasitor Tegangan Tinggi',
  'Desain Jalur PCB Tembaga Tebal', 'Simulasi Thermal Heatsink', 'Pengembangan IC Kontroler PWM',
  'Uji Stabilitas Arus Ripple', 'Proteksi Over-Voltage & Short Circuit', 'Optimasi Efisiensi Konversi Daya',
  'Uji Ketahanan Beban Penuh 24 Jam', 'Kalibrasi Sensor Suhu NTC', 'Penyempurnaan Firmware Fast-Charge'
];

// KATALOG HP REALISTIS INDONESIA (TERMASUK GOOGLE PIXEL, SESUAI TAHUN RILIS 2020-2026)
const PHONE_CATALOG = [
  // 2020
  { id: 'px_4a_2020', brand: 'Google Pixel', name: 'Google Pixel 4a (6/128GB)', year: 2020, price: 5800000, charmBonus: 5 },
  { id: 'px_5_2020', brand: 'Google Pixel', name: 'Google Pixel 5 5G (8/128GB)', year: 2020, price: 9800000, charmBonus: 8 },
  { id: 'sam_a51_2020', brand: 'Samsung', name: 'Samsung Galaxy A51 (6/128GB)', year: 2020, price: 4099000, charmBonus: 4 },
  { id: 'sam_s20_2020', brand: 'Samsung', name: 'Samsung Galaxy S20 Ultra (12/128GB)', year: 2020, price: 18499000, charmBonus: 12 },
  { id: 'ip_11_2020', brand: 'Apple iPhone', name: 'iPhone 11 128GB Resmi iBox', year: 2020, price: 12999000, charmBonus: 10 },
  { id: 'ip_12pm_2020', brand: 'Apple iPhone', name: 'iPhone 12 Pro Max 256GB', year: 2020, price: 22999000, charmBonus: 15 },
  { id: 'xi_rn9p_2020', brand: 'Xiaomi', name: 'Redmi Note 9 Pro (6/64GB)', year: 2020, price: 3499000, charmBonus: 3 },
  { id: 'rog_3_2020', brand: 'ASUS ROG', name: 'ASUS ROG Phone 3 (12/256GB)', year: 2020, price: 14999000, charmBonus: 10 },
  // 2021
  { id: 'px_6_2021', brand: 'Google Pixel', name: 'Google Pixel 6 (8/128GB Tensor)', year: 2021, price: 9500000, charmBonus: 9 },
  { id: 'px_6p_2021', brand: 'Google Pixel', name: 'Google Pixel 6 Pro (12/256GB)', year: 2021, price: 13800000, charmBonus: 12 },
  { id: 'ip_13pm_2021', brand: 'Apple iPhone', name: 'iPhone 13 Pro Max 256GB', year: 2021, price: 21999000, charmBonus: 16 },
  { id: 'sam_zflip3_2021', brand: 'Samsung', name: 'Samsung Galaxy Z Flip3 5G', year: 2021, price: 14999000, charmBonus: 14 },
  // 2022
  { id: 'px_7p_2022', brand: 'Google Pixel', name: 'Google Pixel 7 Pro (12/256GB)', year: 2022, price: 14200000, charmBonus: 13 },
  { id: 'sam_s22u_2022', brand: 'Samsung', name: 'Samsung Galaxy S22 Ultra 5G', year: 2022, price: 18999000, charmBonus: 15 },
  { id: 'ip_14pm_2022', brand: 'Apple iPhone', name: 'iPhone 14 Pro Max 256GB', year: 2022, price: 23999000, charmBonus: 17 },
  // 2023
  { id: 'px_8p_2023', brand: 'Google Pixel', name: 'Google Pixel 8 Pro (12/256GB)', year: 2023, price: 15800000, charmBonus: 15 },
  { id: 'sam_s23u_2023', brand: 'Samsung', name: 'Samsung Galaxy S23 Ultra 5G', year: 2023, price: 19999000, charmBonus: 16 },
  { id: 'ip_15pm_2023', brand: 'Apple iPhone', name: 'iPhone 15 Pro Max 256GB Titanium', year: 2023, price: 24999000, charmBonus: 18 },
  // 2024
  { id: 'px_9p_2024', brand: 'Google Pixel', name: 'Google Pixel 9 Pro XL (16/256GB)', year: 2024, price: 17900000, charmBonus: 17 },
  { id: 'sam_s24u_2024', brand: 'Samsung', name: 'Samsung Galaxy S24 Ultra AI', year: 2024, price: 21999000, charmBonus: 18 },
  { id: 'ip_16pm_2024', brand: 'Apple iPhone', name: 'iPhone 16 Pro Max 256GB', year: 2024, price: 25499000, charmBonus: 20 }
];

// KATALOG KULIAH LENGKAP (TERMASUK KEDOKTERAN)
const UNIVERSITY_MAJORS = [
  { id: 'med', name: 'S1 Pendidikan Dokter + Profesi (dr.)', semesters: 10, uktPerSemester: 14500000, titlePrefix: 'dr. ', jobBonus: 450000 },
  { id: 'it', name: 'S1 Teknik Informatika (S.Kom)', semesters: 8, uktPerSemester: 5500000, titlePrefix: '', jobBonus: 220000 },
  { id: 'biz', name: 'S1 Manajemen Bisnis (S.M)', semesters: 8, uktPerSemester: 4800000, titlePrefix: '', jobBonus: 180000 },
  { id: 'law', name: 'S1 Ilmu Hukum (S.H)', semesters: 8, uktPerSemester: 5000000, titlePrefix: '', jobBonus: 200000 }
];

const CONSOLE_CATALOG = [
  { id: 'ps1_fat', platform: 'PS1', name: 'PlayStation 1 Fat (Refurbish Ori)', year: 2020, month: 1, price: 450000, watt: 30, storageGB: 0, media: 'disc', defaultRate: 2000 },
  { id: 'ps1_slim', platform: 'PS1', name: 'PSOne Slim Putih + 2 Stik Ori', year: 2020, month: 1, price: 650000, watt: 25, storageGB: 0, media: 'disc', defaultRate: 2500 },
  { id: 'ps2_fat', platform: 'PS2', name: 'PS2 Fat NA + Harddisk 80GB', year: 2020, month: 1, price: 850000, watt: 50, storageGB: 0, media: 'disc', defaultRate: 3000 },
  { id: 'ps2_slim', platform: 'PS2', name: 'PS2 Slim Seri 90006', year: 2020, month: 1, price: 1100000, watt: 35, storageGB: 0, media: 'disc', defaultRate: 3500 },
  { id: 'ps3_slim_320', platform: 'PS3', name: 'PS3 Slim 320GB OFW/HEN', year: 2020, month: 1, price: 1850000, watt: 110, storageGB: 290, media: 'storage', defaultRate: 5000 },
  { id: 'ps3_ss_500', platform: 'PS3', name: 'PS3 Super Slim 500GB', year: 2020, month: 1, price: 2250000, watt: 95, storageGB: 460, media: 'storage', defaultRate: 5000 },
  { id: 'ps4_fat_500', platform: 'PS4', name: 'PS4 Fat 500GB CUH-1206', year: 2020, month: 1, price: 3400000, watt: 140, storageGB: 408, media: 'storage', defaultRate: 8000 },
  { id: 'ps4_slim_500', platform: 'PS4', name: 'PS4 Slim 500GB Garansi Sony', year: 2020, month: 1, price: 4100000, watt: 110, storageGB: 408, media: 'storage', defaultRate: 8000 },
  { id: 'ps4_slim_1tb', platform: 'PS4', name: 'PS4 Slim 1TB Garansi Sony', year: 2020, month: 1, price: 4700000, watt: 110, storageGB: 860, media: 'storage', defaultRate: 9000 },
  { id: 'ps4_pro_1tb', platform: 'PS4', name: 'PS4 Pro 1TB 4K HDR', year: 2020, month: 1, price: 5600000, watt: 165, storageGB: 860, media: 'storage', defaultRate: 10000 },
  { id: 'ps5_digital', platform: 'PS5', name: 'PS5 Digital Edition 825GB', year: 2020, month: 11, price: 11500000, watt: 180, storageGB: 667, media: 'storage', defaultRate: 15000 },
  { id: 'ps5_disc', platform: 'PS5', name: 'PS5 Disc Edition 825GB', year: 2020, month: 11, price: 13500000, watt: 200, storageGB: 667, media: 'storage', defaultRate: 16000 },
  { id: 'ps5_slim_1tb', platform: 'PS5', name: 'PS5 Slim 1TB Resmi Sony ID', year: 2023, month: 11, price: 9699000, watt: 190, storageGB: 848, media: 'storage', defaultRate: 15000 },
  { id: 'switch_lite', platform: 'Switch', name: 'Nintendo Switch Lite (32GB)', year: 2020, month: 1, price: 3100000, watt: 18, storageGB: 26, media: 'storage', defaultRate: 7000 },
  { id: 'switch_v2', platform: 'Switch', name: 'Nintendo Switch V2 Neon (32GB)', year: 2020, month: 1, price: 4650000, watt: 35, storageGB: 26, media: 'storage', defaultRate: 9000 },
  { id: 'switch_oled', platform: 'Switch', name: 'Nintendo Switch OLED (64GB)', year: 2021, month: 10, price: 5400000, watt: 35, storageGB: 54, media: 'storage', defaultRate: 10000 },
  { id: 'xbox_one_s', platform: 'Xbox', name: 'Xbox One S 1TB All-Digital', year: 2020, month: 1, price: 3600000, watt: 90, storageGB: 780, media: 'storage', defaultRate: 8000 },
  { id: 'xbox_series_s', platform: 'Xbox', name: 'Xbox Series S 512GB', year: 2020, month: 11, price: 5400000, watt: 85, storageGB: 364, media: 'storage', defaultRate: 11000 },
  { id: 'xbox_series_x', platform: 'Xbox', name: 'Xbox Series X 1TB', year: 2020, month: 11, price: 9500000, watt: 170, storageGB: 802, media: 'storage', defaultRate: 15000 }
];

const PC_CATALOG = [
  { id: 'pc_entry_2020', platform: 'PC', name: 'PC Rakitan Warnet 2020 (i3-9100F, GTX 1650 4GB, RAM 8GB, SSD 240GB)', year: 2020, month: 1, price: 6800000, watt: 220, storageGB: 220, media: 'storage', defaultRate: 6000 },
  { id: 'pc_mid_2020', platform: 'PC', name: 'PC Gaming Mid 2020 (Ryzen 5 3600, GTX 1660 Super 6GB, RAM 16GB, SSD 512GB)', year: 2020, month: 1, price: 11200000, watt: 300, storageGB: 470, media: 'storage', defaultRate: 9000 },
  { id: 'pc_high_2021', platform: 'PC', name: 'PC Sultan RTX 2021 (i5-11400F, RTX 3060 12GB, RAM 16GB, NVMe 1TB)', year: 2021, month: 3, price: 17500000, watt: 420, storageGB: 930, media: 'storage', defaultRate: 13000 },
  { id: 'pc_ultra_2023', platform: 'PC', name: 'PC Pro Esports 2023 (i7-13700F, RTX 4070 12GB, RAM 32GB, NVMe 2TB)', year: 2023, month: 5, price: 26500000, watt: 520, storageGB: 1860, media: 'storage', defaultRate: 18000 }
];

const TV_CATALOG = [
  { id: 'tv_lcd_24_poly', name: 'TV LCD/LED Polytron 24" HD PLD24D123', type: 'LCD/LED', inch: 24, year: 2020, price: 1199000, watt: 35, bonusRate: 0 },
  { id: 'tv_lcd_32_lg', name: 'TV LCD LG 32" 32LK500BPTA HD Ready', type: 'LCD', inch: 32, year: 2020, price: 1650000, watt: 55, bonusRate: 500 },
  { id: 'tv_led_32_tcl', name: 'TV LED TCL 32" 32D3000A HD', type: 'LED', inch: 32, year: 2020, price: 1849000, watt: 45, bonusRate: 500 },
  { id: 'tv_led_32_sharp', name: 'TV LED Sharp Aquos 32" 2T-C32BA1i', type: 'LED', inch: 32, year: 2020, price: 2099000, watt: 45, bonusRate: 1000 },
  { id: 'tv_led_32_sam', name: 'TV LED Samsung 32" UA32T4001', type: 'LED', inch: 32, year: 2020, price: 2299000, watt: 48, bonusRate: 1000 },
  { id: 'tv_led_40_coocaa', name: 'Smart TV LED Coocaa 40" 40S6G Full HD', type: 'LED FHD', inch: 40, year: 2020, price: 2799000, watt: 60, bonusRate: 1500 },
  { id: 'tv_led_43_tcl', name: 'Smart TV LED UHD 4K TCL 43" 43A8', type: 'LED 4K', inch: 43, year: 2020, price: 3899000, watt: 75, bonusRate: 2000 },
  { id: 'tv_led_43_sam', name: 'Smart TV LED Crystal UHD 4K Samsung 43" TU7000', type: 'LED 4K', inch: 43, year: 2020, price: 4799000, watt: 85, bonusRate: 2500 },
  { id: 'tv_led_50_lg', name: 'Smart TV LED UHD 4K LG 50" 50UN7300PTC', type: 'LED 4K', inch: 50, year: 2020, price: 6299000, watt: 105, bonusRate: 3000 },
  { id: 'tv_led_55_sony', name: 'Smart TV LED 4K HDR Sony Bravia 55" KD-55X7500H', type: 'LED 4K HDR', inch: 55, year: 2020, price: 8999000, watt: 120, bonusRate: 4000 },
  { id: 'tv_qled_65_sam', name: 'Smart TV QLED 4K 120Hz Samsung 65" Q80T', type: 'QLED 4K', inch: 65, year: 2020, price: 18500000, watt: 165, bonusRate: 6000 }
];

const PS1_GAMES = [
  "Harvest Moon: Back to Nature", "Crash Team Racing (CTR)", "Winning Eleven 3 Final Ver", "Winning Eleven 2002",
  "Tekken 3", "Pepsiman", "Vigilante 8: 2nd Offense", "Twisted Metal 4", "Nascar Rumble", "Super Shot Soccer",
  "Digimon World 3", "Digimon Rumble Arena", "Resident Evil 3: Nemesis", "Resident Evil 2", "Silent Hill",
  "Final Fantasy VII", "Final Fantasy VIII", "Final Fantasy IX", "Suikoden II", "Breath of Fire IV",
  "Legend of Legaia", "Chrono Cross", "Dragon Ball GT: Final Bout", "Yu-Gi-Oh! Forbidden Memories",
  "Bishi Bashi Special", "Captain Tsubasa J: Get In The Tomorrow", "Jackie Chan Stuntmaster", "Tarzan",
  "Hercules", "Toy Story 2", "A Bug's Life", "Spider-Man (2000)", "Metal Gear Solid", "Syphon Filter 2",
  "Tenchu 2: Birth of the Stealth Assassins", "Dino Crisis 2", "Parasite Eve II", "Tony Hawk's Pro Skater 2",
  "Gran Turismo 2", "Need for Speed: High Stakes", "Road Rash: Jailbreak", "3Xtreme", "Bloody Roar II",
  "Marvel vs. Capcom", "Street Fighter EX2 Plus", "Chocobo Racing", "Tomba! 2", "Megaman X4", "Brigandine", "Monster Rancher 2"
].map((title, i) => ({
  id: 'ps1_g_' + i, platform: 'PS1', title, year: 2020, price: (i < 10 ? 45000 : 35000), sizeGB: 0
}));

const PS2_GAMES = [
  "GTA: San Andreas", "Winning Eleven 10", "PES 2013 (Patch Indo)", "Downhill Domination", "Bully",
  "God of War II", "God of War I", "Resident Evil 4", "Naruto Shippuden: Ultimate Ninja 5", "Dragon Ball Z: Budokai Tenkaichi 3",
  "Need for Speed: Most Wanted", "Need for Speed: Underground 2", "Burnout 3: Takedown", "Gran Turismo 4",
  "Mortal Kombat: Shaolin Monks", "Tekken 5", "Basara 2 Heroes", "Dynasty Warriors 5", "Guitar Hero III: Legends of Rock",
  "The Warriors", "Black", "Def Jam: Fight for NY", "SmackDown! Here Comes the Pain", "Final Fantasy X",
  "Kingdom Hearts II", "Harvest Moon: Save the Homeland", "Harvest Moon: A Wonderful Life", "Rumble Racing",
  "Shadow of the Colossus", "Metal Gear Solid 3: Snake Eater"
].map((title, i) => ({
  id: 'ps2_g_' + i, platform: 'PS2', title, year: 2020, price: (i < 8 ? 65000 : 50000), sizeGB: 0
}));

const MODERN_GAMES = [
  { id: 'ps3_pes18', platform: 'PS3', title: 'PES 2018 (Update Transfer)', year: 2020, price: 220000, sizeGB: 14 },
  { id: 'ps3_gta5', platform: 'PS3', title: 'Grand Theft Auto V', year: 2020, price: 250000, sizeGB: 18 },
  { id: 'ps3_tlou', platform: 'PS3', title: 'The Last of Us', year: 2020, price: 210000, sizeGB: 26 },
  { id: 'ps3_gow3', platform: 'PS3', title: 'God of War III', year: 2020, price: 190000, sizeGB: 35 },
  { id: 'ps3_rdr', platform: 'PS3', title: 'Red Dead Redemption', year: 2020, price: 200000, sizeGB: 10 },
  { id: 'ps3_naruto', platform: 'PS3', title: 'Naruto Storm Revolution', year: 2020, price: 185000, sizeGB: 8 },
  { id: 'ps3_minecraft', platform: 'PS3', title: 'Minecraft PS3 Edition', year: 2020, price: 175000, sizeGB: 2 },
  { id: 'ps3_uncharted3', platform: 'PS3', title: 'Uncharted 3: Drake Deception', year: 2020, price: 180000, sizeGB: 32 },
  { id: 'ps4_pes20', platform: 'PS4', title: 'eFootball PES 2020', year: 2020, price: 480000, sizeGB: 42 },
  { id: 'ps4_pes21', platform: 'PS4', title: 'eFootball PES 2021 Season Update', year: 2020, price: 420000, sizeGB: 44 },
  { id: 'ps4_fifa20', platform: 'PS4', title: 'FIFA 20', year: 2020, price: 450000, sizeGB: 46 },
  { id: 'ps4_fifa23', platform: 'PS4', title: 'FIFA 23', year: 2022, price: 699000, sizeGB: 50 },
  { id: 'ps4_gta5', platform: 'PS4', title: 'GTA V Premium Edition', year: 2020, price: 380000, sizeGB: 94 },
  { id: 'ps4_rdr2', platform: 'PS4', title: 'Red Dead Redemption 2', year: 2020, price: 520000, sizeGB: 115 },
  { id: 'ps4_gow', platform: 'PS4', title: 'God of War (2018)', year: 2020, price: 299000, sizeGB: 45 },
  { id: 'ps4_spiderman', platform: 'PS4', title: 'Marvel Spider-Man GOTY', year: 2020, price: 379000, sizeGB: 68 },
  { id: 'ps4_tekken7', platform: 'PS4', title: 'Tekken 7', year: 2020, price: 340000, sizeGB: 48 },
  { id: 'ps4_ctr', platform: 'PS4', title: 'Crash Team Racing Nitro-Fueled', year: 2020, price: 420000, sizeGB: 24 },
  { id: 'ps4_got', platform: 'PS4', title: 'Ghost of Tsushima', year: 2020, price: 729000, sizeGB: 60 },
  { id: 'ps4_tlou2', platform: 'PS4', title: 'The Last of Us Part II', year: 2020, price: 729000, sizeGB: 78 },
  { id: 'ps4_re4r', platform: 'PS4', title: 'Resident Evil 4 Remake', year: 2023, price: 799000, sizeGB: 58 },
  { id: 'ps5_spider_mm', platform: 'PS5', title: 'Spider-Man: Miles Morales', year: 2020, price: 729000, sizeGB: 52 },
  { id: 'ps5_spider2', platform: 'PS5', title: 'Marvel Spider-Man 2', year: 2023, price: 999000, sizeGB: 98 },
  { id: 'ps5_fifa22', platform: 'PS5', title: 'FIFA 22 Next-Gen', year: 2021, price: 849000, sizeGB: 54 },
  { id: 'ps5_eafc24', platform: 'PS5', title: 'EA Sports FC 24', year: 2023, price: 899000, sizeGB: 58 },
  { id: 'ps5_gow_rag', platform: 'PS5', title: 'God of War Ragnarök', year: 2022, price: 879000, sizeGB: 84 },
  { id: 'ps5_tekken8', platform: 'PS5', title: 'Tekken 8', year: 2024, price: 949000, sizeGB: 82 },
  { id: 'ps5_gta5', platform: 'PS5', title: 'GTA V PS5 Expanded', year: 2022, price: 499000, sizeGB: 96 },
  { id: 'sw_mk8', platform: 'Switch', title: 'Mario Kart 8 Deluxe', year: 2020, price: 720000, sizeGB: 7 },
  { id: 'sw_acnh', platform: 'Switch', title: 'Animal Crossing: New Horizons', year: 2020, price: 740000, sizeGB: 7 },
  { id: 'sw_smash', platform: 'Switch', title: 'Super Smash Bros. Ultimate', year: 2020, price: 750000, sizeGB: 16 },
  { id: 'sw_zelda', platform: 'Switch', title: 'Zelda: Breath of the Wild', year: 2020, price: 730000, sizeGB: 14 },
  { id: 'sw_totk', platform: 'Switch', title: 'Zelda: Tears of the Kingdom', year: 2023, price: 849000, sizeGB: 17 },
  { id: 'xb_forza4', platform: 'Xbox', title: 'Forza Horizon 4', year: 2020, price: 550000, sizeGB: 75 },
  { id: 'xb_forza5', platform: 'Xbox', title: 'Forza Horizon 5', year: 2021, price: 799000, sizeGB: 110 },
  { id: 'xb_fifa21', platform: 'Xbox', title: 'FIFA 21 Xbox', year: 2020, price: 650000, sizeGB: 45 },
  { id: 'xb_halo', platform: 'Xbox', title: 'Halo: The Master Chief Collection', year: 2020, price: 480000, sizeGB: 110 },
  { id: 'pc_valorant', platform: 'PC', title: 'Valorant (Bundle Warnet)', year: 2020, price: 50000, sizeGB: 28 },
  { id: 'pc_pb', platform: 'PC', title: 'Point Blank Zepetto', year: 2020, price: 100000, sizeGB: 12 },
  { id: 'pc_dota2', platform: 'PC', title: 'Dota 2 Steam', year: 2020, price: 50000, sizeGB: 45 },
  { id: 'pc_csgo', platform: 'PC', title: 'Counter-Strike: Global Offensive', year: 2020, price: 215000, sizeGB: 32 },
  { id: 'pc_gta5', platform: 'PC', title: 'GTA V Steam Original', year: 2020, price: 300000, sizeGB: 105 },
  { id: 'pc_pubg', platform: 'PC', title: 'PUBG: Battlegrounds Steam', year: 2020, price: 220000, sizeGB: 40 },
  { id: 'pc_sims4', platform: 'PC', title: 'The Sims 4 Original', year: 2020, price: 280000, sizeGB: 26 },
  { id: 'pc_cyberpunk', platform: 'PC', title: 'Cyberpunk 2077 Steam', year: 2020, price: 699000, sizeGB: 70 }
];

const ALL_GAMES = [...PS1_GAMES, ...PS2_GAMES, ...MODERN_GAMES];

const BED_PACKAGES = [
  { id: 'bed_std', name: 'Kasur Busa + Kipas Angin Dinding', price: 1200000, hourlyRate: 50000, watt: 45 },
  { id: 'bed_spring', name: 'Springbed Queen + Kipas + TV LED', price: 2800000, hourlyRate: 75000, watt: 90 },
  { id: 'bed_vip', name: 'King Bed + AC Split + Smart TV + KM Dalam', price: 6500000, hourlyRate: 120000, watt: 400 }
];

const ENTERTAINERS_CATALOG = [
  { id: 'ent_rina', name: 'Rina (Pemandu Karaoke & Ngobrol)', model: 'share', ownerPct: 40, hourlyRate: 100000, monthlySalary: 0 },
  { id: 'ent_maya', name: 'Maya (Host VIP & Pendamping)', model: 'share', ownerPct: 50, hourlyRate: 150000, monthlySalary: 0 },
  { id: 'ent_siska', name: 'Siska (Terapis Pijat & Relaksasi)', model: 'salary', ownerPct: 100, hourlyRate: 120000, monthlySalary: 2800000 }
];

const RETAIL_GOODS = [
  { id: 'sutra', name: 'Kondom Sutra Merah (Box Grosir 6 Pack)', buyPrice: 45000, packCount: 6, sellPrice: 12000 },
  { id: 'fiesta', name: 'Kondom Fiesta Strawberry/Max (Box 6 Pack)', buyPrice: 60000, packCount: 6, sellPrice: 16000 },
  { id: 'durex', name: 'Kondom Durex Extra Safe/Invisible (Box 6 Pack)', buyPrice: 95000, packCount: 6, sellPrice: 25000 },
  { id: 'vivo', name: 'Kondom Vivo Ultra Thin (Box 6 Pack)', buyPrice: 55000, packCount: 6, sellPrice: 15000 },
  { id: 'sagami', name: 'Kondom Sagami Original 0.02 (Box 4 Pack)', buyPrice: 140000, packCount: 4, sellPrice: 48000 },
  { id: 'popmie', name: '1 Dus Pop Mie Ayam/Baso (12 Cup)', buyPrice: 48000, packCount: 12, sellPrice: 8000 },
  { id: 'esteh', name: 'Bahan Es Teh Manis Jumbo (20 Gelas)', buyPrice: 25000, packCount: 20, sellPrice: 4000 }
];

const WIFI_PROVIDERS = [
  { id: 'indihome_20', name: 'IndiHome 20 Mbps (FUP)', mbps: 20, installFee: 150000, monthly: 345000, year: 2020 },
  { id: 'indihome_50', name: 'IndiHome 50 Mbps', mbps: 50, installFee: 150000, monthly: 495000, year: 2020 },
  { id: 'myrep_50', name: 'MyRepublic 50 Mbps Gamer', mbps: 50, installFee: 100000, monthly: 429000, year: 2020 },
  { id: 'biznet_75', name: 'Biznet Home 75 Mbps', mbps: 75, installFee: 250000, monthly: 575000, year: 2020 },
  { id: 'biznet_150', name: 'Biznet Home 150 Mbps', mbps: 150, installFee: 250000, monthly: 850000, year: 2020 },
  { id: 'starlink_200', name: 'Starlink Residential (200+ Mbps)', mbps: 220, installFee: 7800000, monthly: 750000, year: 2024 }
];

const KIOS_TIERS = [
  { level: 1, name: 'Ruko Awal 5 Room (Bebas Isi)', maxRooms: 5, monthlyRent: 1100000, buyPrice: 42000000 },
  { level: 2, name: 'Ruko 8 Room Private (5x10m)', maxRooms: 8, monthlyRent: 2100000, buyPrice: 90000000 },
  { level: 3, name: 'Ruko 2 Lantai 12 Room VIP', maxRooms: 12, monthlyRent: 3600000, buyPrice: 185000000 }
];

const PPOB_PRODUCTS = [
  { id: 'dana_50', name: 'Top Up DANA 50.000', nominal: 50000, adminProvider: 0, hargaJual: 52000 },
  { id: 'dana_100', name: 'Top Up DANA 100.000', nominal: 100000, adminProvider: 0, hargaJual: 102000 },
  { id: 'gopay_50', name: 'Top Up GoPay 50.000', nominal: 50000, adminProvider: 1000, hargaJual: 52500 },
  { id: 'ovo_50', name: 'Top Up OVO 50.000', nominal: 50000, adminProvider: 1000, hargaJual: 52500 },
  { id: 'shopeepay_50', name: 'Top Up ShopeePay 50.000', nominal: 50000, adminProvider: 0, hargaJual: 52000 },
  { id: 'pln_50', name: 'Token PLN 50.000', nominal: 50000, adminProvider: 1500, hargaJual: 53000 },
  { id: 'pln_100', name: 'Token PLN 100.000', nominal: 100000, adminProvider: 1500, hargaJual: 103000 },
  { id: 'tf_bri', name: 'Transfer Antar Bank (BRI/BCA/Mandiri)', nominal: 200000, adminProvider: 2500, hargaJual: 205000 },
  { id: 'tf_seabank', name: 'Transfer SeaBank / Jago (Gratis Admin)', nominal: 150000, adminProvider: 0, hargaJual: 153000 }
];

const VEHICLES_CATALOG = [
  { id: 'veh_beat', name: 'Honda Beat Street 2020 (Bekas Mulus)', price: 11500000, rentDaily: 75000 },
  { id: 'veh_nmax', name: 'Yamaha NMAX 155 ABS 2020', price: 24500000, rentDaily: 130000 },
  { id: 'veh_brio', name: 'Honda Brio Satya E 2020', price: 135000000, rentDaily: 320000 }
];

const OUTSIDE_ACTIVITIES = [
  { id: 'act_warteg', name: '🍛 Makan Siang di Warteg Bahari', cost: 18000, energyGain: 25, hungerGain: 45, charmGain: 0, desc: 'Makan kenyang & hemat di luar.' },
  { id: 'act_cafe', name: '☕ Nongkrong di Kopi Janji Jiwa / Kafe', cost: 45000, energyGain: 20, hungerGain: 20, charmGain: 4, desc: 'Nongkrong santai menambah mood & pesona.' },
  { id: 'act_salon', name: '💇🏻‍♀️ Perawatan Salon & Skincare', cost: 150000, energyGain: 10, hungerGain: 0, charmGain: 10, desc: 'Tampil makin menarik & wangi.' },
  { id: 'act_mall', name: '🛍️ Belanja Baju & Jalan ke Mall', cost: 350000, energyGain: 15, hungerGain: 15, charmGain: 15, desc: 'Refreshing jalan-jalan ke pusat kota.' },
  { id: 'act_toy', name: '🎁 Beli Alat Bantu Pribadi (Privasi)', cost: 275000, energyGain: 5, hungerGain: 0, charmGain: 2, desc: 'Untuk meredakan HB Bar secara mandiri kapan saja.' },
  { id: 'act_bensin', name: '⛽ Isi Bensin Pertalite/Pertamax Full Tank', cost: 35000, energyGain: 0, hungerGain: 0, charmGain: 0, desc: 'Isi bahan bakar untuk aktivitas harian.' }
];

// DAFTAR PASANGAN REALISTIS (ADA USIA, ETNIS, STATUS LAJANG / SUAMI ORANG)
const PARTNERS_LIST = [
  { id: 'p_dimas', name: 'Dimas Pratama', age: 21, ethnicity: 'jawa', job: 'Mekanik Bengkel', maritalStatus: 'Lajang', charmReq: 20, generosity: 50000 },
  { id: 'p_reza', name: 'Reza Mahendra', age: 22, ethnicity: 'sunda', job: 'Mahasiswa IT & Freelancer', maritalStatus: 'Lajang', charmReq: 35, generosity: 120000 },
  { id: 'p_kenzo', name: 'Kenzo Wijaya', age: 25, ethnicity: 'chinese', job: 'Pengusaha Distributor', maritalStatus: 'Lajang', charmReq: 55, generosity: 450000 },
  { id: 'p_dr_andi', name: 'dr. Andi Saputra', age: 29, ethnicity: 'batak', job: 'Dokter Umum RSUD', maritalStatus: 'Lajang', charmReq: 65, generosity: 600000 },
  { id: 'p_lukas', name: 'Lukas Schneider', age: 31, ethnicity: 'bule', job: 'Arsitek & Ekspatriat Jerman', maritalStatus: 'Lajang', charmReq: 75, generosity: 1200000 },
  { id: 'p_hendra', name: 'Pak Hendra Gunawan', age: 38, ethnicity: 'chinese', job: 'Pemilik Showroom Mobil', maritalStatus: 'Suami Orang', charmReq: 60, generosity: 1500000 },
  { id: 'p_daniel', name: 'Daniel Martin', age: 36, ethnicity: 'bule', job: 'Konsultan Tambang', maritalStatus: 'Suami Orang', charmReq: 70, generosity: 2000000 }
];

const WEDDING_PACKAGES = [
  { id: 'wed_kua', name: 'Nikah Sederhana di KUA + Syukuran Rumah', cost: 3500000, repBonus: 0.2, dailyCostRange: [35000, 75000] },
  { id: 'wed_tenda', name: 'Resepsi Tenda Biru Kampung + Organ Tunggal', cost: 15000000, repBonus: 0.4, dailyCostRange: [60000, 120000] },
  { id: 'wed_gedung', name: 'Resepsi Gedung Serbaguna + Catering Lengkap', cost: 45000000, repBonus: 0.7, dailyCostRange: [100000, 220000] },
  { id: 'wed_luxury', name: 'Royal Ballroom Hotel Mewah + Honeymoon', cost: 120000000, repBonus: 1.2, dailyCostRange: [200000, 450000] }
];
