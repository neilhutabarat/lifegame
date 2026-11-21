// DATABASE REALISTIS INDONESIA (MULAI JANUARI 2020) - RENTAL SIMULATOR BY ONEILVERSE

const DENOMINATIONS = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 100];

const CONSOLE_CATALOG = [
  // PS1
  { id: 'ps1_fat', platform: 'PS1', name: 'PlayStation 1 Fat (Refurbish Ori)', year: 2020, month: 1, price: 450000, watt: 30, storageGB: 0, media: 'disc', defaultRate: 2000, dailyRentRate: 25000 },
  { id: 'ps1_slim', platform: 'PS1', name: 'PSOne Slim Putih + 2 Stik Ori', year: 2020, month: 1, price: 650000, watt: 25, storageGB: 0, media: 'disc', defaultRate: 2500, dailyRentRate: 30000 },
  // PS2
  { id: 'ps2_fat', platform: 'PS2', name: 'PS2 Fat NA + Harddisk 80GB', year: 2020, month: 1, price: 850000, watt: 50, storageGB: 0, media: 'disc', defaultRate: 3000, dailyRentRate: 40000 },
  { id: 'ps2_slim', platform: 'PS2', name: 'PS2 Slim Seri 90006', year: 2020, month: 1, price: 1100000, watt: 35, storageGB: 0, media: 'disc', defaultRate: 3500, dailyRentRate: 45000 },
  // PS3
  { id: 'ps3_slim_320', platform: 'PS3', name: 'PS3 Slim 320GB OFW/HEN', year: 2020, month: 1, price: 1850000, watt: 110, storageGB: 290, media: 'storage', defaultRate: 5000, dailyRentRate: 65000 },
  { id: 'ps3_ss_500', platform: 'PS3', name: 'PS3 Super Slim 500GB', year: 2020, month: 1, price: 2250000, watt: 95, storageGB: 460, media: 'storage', defaultRate: 5000, dailyRentRate: 70000 },
  // PS4
  { id: 'ps4_fat_500', platform: 'PS4', name: 'PS4 Fat 500GB CUH-1206', year: 2020, month: 1, price: 3400000, watt: 140, storageGB: 408, media: 'storage', defaultRate: 8000, dailyRentRate: 110000 },
  { id: 'ps4_slim_500', platform: 'PS4', name: 'PS4 Slim 500GB Garansi Sony', year: 2020, month: 1, price: 4100000, watt: 110, storageGB: 408, media: 'storage', defaultRate: 8000, dailyRentRate: 120000 },
  { id: 'ps4_slim_1tb', platform: 'PS4', name: 'PS4 Slim 1TB Garansi Sony', year: 2020, month: 1, price: 4700000, watt: 110, storageGB: 860, media: 'storage', defaultRate: 9000, dailyRentRate: 135000 },
  { id: 'ps4_pro_1tb', platform: 'PS4', name: 'PS4 Pro 1TB 4K HDR', year: 2020, month: 1, price: 5600000, watt: 165, storageGB: 860, media: 'storage', defaultRate: 10000, dailyRentRate: 150000 },
  // PS5 (Rilis November 2020)
  { id: 'ps5_digital', platform: 'PS5', name: 'PS5 Digital Edition 825GB', year: 2020, month: 11, price: 11500000, watt: 180, storageGB: 667, media: 'storage', defaultRate: 15000, dailyRentRate: 230000 },
  { id: 'ps5_disc', platform: 'PS5', name: 'PS5 Disc Edition 825GB', year: 2020, month: 11, price: 13500000, watt: 200, storageGB: 667, media: 'storage', defaultRate: 16000, dailyRentRate: 250000 },
  { id: 'ps5_slim_1tb', platform: 'PS5', name: 'PS5 Slim 1TB Resmi Sony ID', year: 2023, month: 11, price: 9699000, watt: 190, storageGB: 848, media: 'storage', defaultRate: 15000, dailyRentRate: 220000 },
  // Switch & Xbox
  { id: 'switch_lite', platform: 'Switch', name: 'Nintendo Switch Lite (32GB)', year: 2020, month: 1, price: 3100000, watt: 18, storageGB: 26, media: 'storage', defaultRate: 7000, dailyRentRate: 85000 },
  { id: 'switch_v2', platform: 'Switch', name: 'Nintendo Switch V2 Neon (32GB)', year: 2020, month: 1, price: 4650000, watt: 35, storageGB: 26, media: 'storage', defaultRate: 9000, dailyRentRate: 110000 },
  { id: 'switch_oled', platform: 'Switch', name: 'Nintendo Switch OLED (64GB)', year: 2021, month: 10, price: 5400000, watt: 35, storageGB: 54, media: 'storage', defaultRate: 10000, dailyRentRate: 125000 },
  { id: 'xbox_one_s', platform: 'Xbox', name: 'Xbox One S 1TB All-Digital', year: 2020, month: 1, price: 3600000, watt: 90, storageGB: 780, media: 'storage', defaultRate: 8000, dailyRentRate: 100000 },
  { id: 'xbox_series_s', platform: 'Xbox', name: 'Xbox Series S 512GB', year: 2020, month: 11, price: 5400000, watt: 85, storageGB: 364, media: 'storage', defaultRate: 11000, dailyRentRate: 140000 },
  { id: 'xbox_series_x', platform: 'Xbox', name: 'Xbox Series X 1TB', year: 2020, month: 11, price: 9500000, watt: 170, storageGB: 802, media: 'storage', defaultRate: 15000, dailyRentRate: 220000 }
];

const PC_CATALOG = [
  { id: 'pc_entry_2020', platform: 'PC', name: 'PC Rakitan Warnet 2020 (i3-9100F, GTX 1650 4GB, RAM 8GB, SSD 240GB)', year: 2020, month: 1, price: 6800000, watt: 220, storageGB: 220, media: 'storage', defaultRate: 6000, dailyRentRate: 0 },
  { id: 'pc_mid_2020', platform: 'PC', name: 'PC Gaming Mid 2020 (Ryzen 5 3600, GTX 1660 Super 6GB, RAM 16GB, SSD 512GB)', year: 2020, month: 1, price: 11200000, watt: 300, storageGB: 470, media: 'storage', defaultRate: 9000, dailyRentRate: 0 },
  { id: 'pc_high_2021', platform: 'PC', name: 'PC Sultan RTX 2021 (i5-11400F, RTX 3060 12GB, RAM 16GB, NVMe 1TB)', year: 2021, month: 3, price: 17500000, watt: 420, storageGB: 930, media: 'storage', defaultRate: 13000, dailyRentRate: 0 },
  { id: 'pc_ultra_2023', platform: 'PC', name: 'PC Pro Esports 2023 (i7-13700F, RTX 4070 12GB, RAM 32GB, NVMe 2TB)', year: 2023, month: 5, price: 26500000, watt: 520, storageGB: 1860, media: 'storage', defaultRate: 18000, dailyRentRate: 0 }
];

const PC_PARTS_UPGRADE = [
  { id: 'up_ram16', name: 'Upgrade RAM 16GB DDR4 Dual Channel', price: 850000, bonusRate: 1000, addGB: 0 },
  { id: 'up_ssd512', name: 'Tambah SSD SATA 512GB', price: 750000, bonusRate: 500, addGB: 470 },
  { id: 'up_nvme1tb', name: 'Tambah NVMe M.2 1TB', price: 1350000, bonusRate: 1000, addGB: 930 },
  { id: 'up_gpu_rtx', name: 'Upgrade VGA ke RTX 3060 12GB', price: 5400000, bonusRate: 3500, addGB: 0 },
  { id: 'up_monitor144', name: 'Upgrade Monitor 24" 144Hz IPS', price: 2300000, bonusRate: 1500, addGB: 0 }
];

// HANYA TV LCD & LED/UHD/QLED TERBAIK TAHUN 2020+ (TANPA TV TABUNG!) - DIURUTKAN TERMURAH KE TERMAHAL
const TV_CATALOG = [
  { id: 'tv_lcd_24_poly', name: 'TV LCD/LED Polytron 24" HD PLD24D123 (Entry)', type: 'LCD/LED', inch: 24, year: 2020, price: 1199000, watt: 35, bonusRate: 0 },
  { id: 'tv_lcd_32_lg', name: 'TV LCD LG 32" 32LK500BPTA HD Ready', type: 'LCD', inch: 32, year: 2020, price: 1650000, watt: 55, bonusRate: 500 },
  { id: 'tv_led_32_tcl', name: 'TV LED TCL 32" 32D3000A HD', type: 'LED', inch: 32, year: 2020, price: 1849000, watt: 45, bonusRate: 500 },
  { id: 'tv_led_32_sharp', name: 'TV LED Sharp Aquos 32" 2T-C32BA1i', type: 'LED', inch: 32, year: 2020, price: 2099000, watt: 45, bonusRate: 1000 },
  { id: 'tv_led_32_sam', name: 'TV LED Samsung 32" UA32T4001', type: 'LED', inch: 32, year: 2020, price: 2299000, watt: 48, bonusRate: 1000 },
  { id: 'tv_led_40_coocaa', name: 'Smart TV LED Coocaa 40" 40S6G Full HD', type: 'LED FHD', inch: 40, year: 2020, price: 2799000, watt: 60, bonusRate: 1500 },
  { id: 'tv_led_43_tcl', name: 'Smart TV LED UHD 4K TCL 43" 43A8', type: 'LED 4K', inch: 43, year: 2020, price: 3899000, watt: 75, bonusRate: 2000 },
  { id: 'tv_led_43_sam', name: 'Smart TV LED Crystal UHD 4K Samsung 43" TU7000', type: 'LED 4K', inch: 43, year: 2020, price: 4799000, watt: 85, bonusRate: 2500 },
  { id: 'tv_led_50_lg', name: 'Smart TV LED UHD 4K LG 50" 50UN7300PTC', type: 'LED 4K', inch: 50, year: 2020, price: 6299000, watt: 105, bonusRate: 3000 },
  { id: 'tv_led_55_sony', name: 'Smart TV LED 4K HDR Sony Bravia 55" KD-55X7500H', type: 'LED 4K HDR', inch: 55, year: 2020, price: 8999000, watt: 120, bonusRate: 4000 },
  { id: 'tv_qled_65_sam', name: 'Smart TV QLED 4K 120Hz Samsung 65" Q80T (Flagship)', type: 'QLED 4K', inch: 65, year: 2020, price: 18500000, watt: 165, bonusRate: 6000 }
];

// 50 GAME PS1 TERKENAL DI INDONESIA
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
  id: 'ps1_g_' + i,
  platform: 'PS1',
  title,
  year: 2020,
  price: (i < 10 ? 45000 : 35000),
  sizeGB: 0
}));

// 30 GAME PS2 PALING TERKENAL DI INDONESIA
const PS2_GAMES = [
  "GTA: San Andreas", "Winning Eleven 10", "PES 2013 (Patch Indo)", "Downhill Domination", "Bully",
  "God of War II", "God of War I", "Resident Evil 4", "Naruto Shippuden: Ultimate Ninja 5", "Dragon Ball Z: Budokai Tenkaichi 3",
  "Need for Speed: Most Wanted", "Need for Speed: Underground 2", "Burnout 3: Takedown", "Gran Turismo 4",
  "Mortal Kombat: Shaolin Monks", "Tekken 5", "Basara 2 Heroes", "Dynasty Warriors 5", "Guitar Hero III: Legends of Rock",
  "The Warriors", "Black", "Def Jam: Fight for NY", "SmackDown! Here Comes the Pain", "Final Fantasy X",
  "Kingdom Hearts II", "Harvest Moon: Save the Homeland", "Harvest Moon: A Wonderful Life", "Rumble Racing",
  "Shadow of the Colossus", "Metal Gear Solid 3: Snake Eater"
].map((title, i) => ({
  id: 'ps2_g_' + i,
  platform: 'PS2',
  title,
  year: 2020,
  price: (i < 8 ? 65000 : 50000),
  sizeGB: 0
}));

// GAME ORIGINAL PS3, PS4, PS5, SWITCH, XBOX, PC
const MODERN_GAMES = [
  { id: 'ps3_pes18', platform: 'PS3', title: 'PES 2018 (Update Transfer)', year: 2020, price: 220000, sizeGB: 14 },
  { id: 'ps3_gta5', platform: 'PS3', title: 'Grand Theft Auto V', year: 2020, price: 250000, sizeGB: 18 },
  { id: 'ps3_tlou', platform: 'PS3', title: 'The Last of Us', year: 2020, price: 210000, sizeGB: 26 },
  { id: 'ps3_gow3', platform: 'PS3', title: 'God of War III', year: 2020, price: 190000, sizeGB: 35 },
  { id: 'ps3_rdr', platform: 'PS3', title: 'Red Dead Redemption', year: 2020, price: 200000, sizeGB: 10 },
  { id: 'ps3_naruto', platform: 'PS3', title: 'Naruto Storm Revolution', year: 2020, price: 185000, sizeGB: 8 },
  { id: 'ps3_minecraft', platform: 'PS3', title: 'Minecraft PS3 Edition', year: 2020, price: 175000, sizeGB: 2 },
  // PS4
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
  // PS5
  { id: 'ps5_spider_mm', platform: 'PS5', title: 'Spider-Man: Miles Morales', year: 2020, price: 729000, sizeGB: 52 },
  { id: 'ps5_fifa22', platform: 'PS5', title: 'FIFA 22 Next-Gen', year: 2021, price: 849000, sizeGB: 54 },
  { id: 'ps5_eafc24', platform: 'PS5', title: 'EA Sports FC 24', year: 2023, price: 899000, sizeGB: 58 },
  { id: 'ps5_gow_rag', platform: 'PS5', title: 'God of War Ragnarök', year: 2022, price: 879000, sizeGB: 84 },
  { id: 'ps5_tekken8', platform: 'PS5', title: 'Tekken 8', year: 2024, price: 949000, sizeGB: 82 },
  { id: 'ps5_gta5', platform: 'PS5', title: 'GTA V PS5 Expanded', year: 2022, price: 499000, sizeGB: 96 },
  // Switch
  { id: 'sw_mk8', platform: 'Switch', title: 'Mario Kart 8 Deluxe', year: 2020, price: 720000, sizeGB: 7 },
  { id: 'sw_acnh', platform: 'Switch', title: 'Animal Crossing: New Horizons', year: 2020, price: 740000, sizeGB: 7 },
  { id: 'sw_smash', platform: 'Switch', title: 'Super Smash Bros. Ultimate', year: 2020, price: 750000, sizeGB: 16 },
  { id: 'sw_zelda', platform: 'Switch', title: 'Zelda: Breath of the Wild', year: 2020, price: 730000, sizeGB: 14 },
  // Xbox
  { id: 'xb_forza4', platform: 'Xbox', title: 'Forza Horizon 4', year: 2020, price: 550000, sizeGB: 75 },
  { id: 'xb_fifa21', platform: 'Xbox', title: 'FIFA 21 Xbox', year: 2020, price: 650000, sizeGB: 45 },
  { id: 'xb_halo', platform: 'Xbox', title: 'Halo: The Master Chief Collection', year: 2020, price: 480000, sizeGB: 110 },
  // PC
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

const WIFI_PROVIDERS = [
  { id: 'indihome_20', name: 'IndiHome 20 Mbps (FUP)', mbps: 20, installFee: 150000, monthly: 345000, year: 2020 },
  { id: 'indihome_50', name: 'IndiHome 50 Mbps', mbps: 50, installFee: 150000, monthly: 495000, year: 2020 },
  { id: 'myrep_50', name: 'MyRepublic 50 Mbps Gamer', mbps: 50, installFee: 100000, monthly: 429000, year: 2020 },
  { id: 'biznet_75', name: 'Biznet Home 75 Mbps', mbps: 75, installFee: 250000, monthly: 575000, year: 2020 },
  { id: 'biznet_150', name: 'Biznet Home 150 Mbps', mbps: 150, installFee: 250000, monthly: 850000, year: 2020 },
  { id: 'starlink_200', name: 'Starlink Residential (200+ Mbps)', mbps: 220, installFee: 7800000, monthly: 750000, year: 2024 }
];

const KIOS_TIERS = [
  { level: 1, name: 'Ruko Sekat 3 Room (3x5m)', maxRooms: 3, monthlyRent: 900000, buyPrice: 38000000 },
  { level: 2, name: 'Ruko 6 Room Private (5x8m)', maxRooms: 6, monthlyRent: 1800000, buyPrice: 80000000 },
  { level: 3, name: 'Ruko 2 Lantai 10 Room VIP (6x12m)', maxRooms: 10, monthlyRent: 3400000, buyPrice: 170000000 },
  { level: 4, name: 'Oneilverse Gaming Tower & Penginapan', maxRooms: 16, monthlyRent: 6500000, buyPrice: 360000000 }
];

// KATALOG PPOB REALISTIS INDONESIA (ADMIN SESUAI OPERATOR / E-WALLET)
const PPOB_PRODUCTS = [
  { id: 'dana_50', name: 'Top Up DANA 50.000', nominal: 50000, adminProvider: 0, hargaJual: 52000 },
  { id: 'dana_100', name: 'Top Up DANA 100.000', nominal: 100000, adminProvider: 0, hargaJual: 102000 },
  { id: 'gopay_50', name: 'Top Up GoPay 50.000', nominal: 50000, adminProvider: 1000, hargaJual: 52500 },
  { id: 'ovo_50', name: 'Top Up OVO 50.000', nominal: 50000, adminProvider: 1000, hargaJual: 52500 },
  { id: 'shopeepay_50', name: 'Top Up ShopeePay 50.000', nominal: 50000, adminProvider: 0, hargaJual: 52000 },
  { id: 'linkaja_50', name: 'Top Up LinkAja 50.000', nominal: 50000, adminProvider: 1000, hargaJual: 52500 },
  { id: 'pln_50', name: 'Token PLN 50.000', nominal: 50000, adminProvider: 1500, hargaJual: 53000 },
  { id: 'pln_100', name: 'Token PLN 100.000', nominal: 100000, adminProvider: 1500, hargaJual: 103000 },
  { id: 'pulsa_tsel_25', name: 'Pulsa Telkomsel 25.000', nominal: 25200, adminProvider: 0, hargaJual: 27000 },
  { id: 'pulsa_xl_25', name: 'Pulsa XL/Axis 25.000', nominal: 24900, adminProvider: 0, hargaJual: 27000 },
  { id: 'tf_bri', name: 'Transfer Antar Bank (BRI/BCA/Mandiri)', nominal: 200000, adminProvider: 2500, hargaJual: 205000 },
  { id: 'tf_seabank', name: 'Transfer SeaBank / Bank Jago (Gratis Admin Bank)', nominal: 150000, adminProvider: 0, hargaJual: 153000 }
];

// UNIT BISNIS EKSPANSI BERTAHAP (JASA SEWA & PENGINAPAN)
const EXPANSION_BUSINESSES = [
  { id: 'biz_powerbank', name: 'Sewa Powerbank & Charger Station', unlockCost: 1500000, dailyIncomeRange: [40000, 90000], desc: 'Sewa powerbank untuk pengunjung room & warga sekitar.' },
  { id: 'biz_kamera', name: 'Sewa Kamera DSLR / Mirrorless & Tripod', unlockCost: 6500000, dailyIncomeRange: [120000, 250000], desc: 'Jasa sewa kamera harian untuk mahasiswa & konten kreator.' },
  { id: 'biz_motor', name: 'Sewa Motor Harian (2 Unit Beat/Vario)', unlockCost: 24000000, dailyIncomeRange: [180000, 320000], desc: 'Penyewaan motor harian untuk pekerja & wisatawan lokal.' },
  { id: 'biz_kos', name: 'Kos-kosan & Penginapan Harian (4 Kamar AC)', unlockCost: 65000000, dailyIncomeRange: [350000, 750000], desc: 'Bisnis penginapan harian / transit & kos bulanan di lantai atas!' },
  { id: 'biz_guesthouse', name: 'Guest House & Penginapan Keluarga Oneilverse', unlockCost: 140000000, dailyIncomeRange: [800000, 1650000], desc: 'Penginapan full fasilitas AC, Wi-Fi kencang, dan sarapan.' }
];

const PARTNERS_LIST = [
  { id: 'p_dimas', name: 'Dimas (Anak Motor Kampung)', job: 'Mekanik Bengkel', charmReq: 20 },
  { id: 'p_reza', name: 'Reza (Mahasiswa IT)', job: 'Freelancer Web', charmReq: 40 },
  { id: 'p_dr_andi', name: 'dr. Andi (Dokter Puskesmas)', job: 'Dokter Umum', charmReq: 65 },
  { id: 'p_kevin', name: 'Kevin (Pengusaha Muda)', job: 'Owner Distributor', charmReq: 85 }
];

const WEDDING_PACKAGES = [
  { id: 'wed_kua', name: 'Nikah Sederhana di KUA + Syukuran Rumah', cost: 3500000, repBonus: 0.2, dailyCostRange: [35000, 75000] },
  { id: 'wed_tenda', name: 'Resepsi Tenda Biru Kampung + Organ Tunggal', cost: 15000000, repBonus: 0.4, dailyCostRange: [60000, 120000] },
  { id: 'wed_gedung', name: 'Resepsi Gedung Serbaguna + Catering Lengkap', cost: 45000000, repBonus: 0.7, dailyCostRange: [100000, 220000] },
  { id: 'wed_luxury', name: 'Royal Ballroom Hotel Mewah + Honeymoon', cost: 120000000, repBonus: 1.2, dailyCostRange: [200000, 450000] }
];
