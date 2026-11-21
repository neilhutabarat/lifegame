const DENOMINATIONS = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500];

const CONSOLE_CATALOG = [
  { id: 'ps1_fat', platform: 'PS1', name: 'PlayStation 1 Fat (Refurbish Ori)', year: 2020, month: 1, price: 450000, watt: 30, storageGB: 0, media: 'disc', defaultRate: 2000, dailyRentRate: 25000 },
  { id: 'ps1_slim', platform: 'PS1', name: 'PSOne Slim Putih + 2 Stik Ori', year: 2020, month: 1, price: 650000, watt: 25, storageGB: 0, media: 'disc', defaultRate: 2500, dailyRentRate: 30000 },
  { id: 'ps2_fat', platform: 'PS2', name: 'PS2 Fat NA + Harddisk 80GB', year: 2020, month: 1, price: 850000, watt: 50, storageGB: 0, media: 'disc', defaultRate: 3000, dailyRentRate: 40000 },
  { id: 'ps2_slim', platform: 'PS2', name: 'PS2 Slim Seri 90006', year: 2020, month: 1, price: 1100000, watt: 35, storageGB: 0, media: 'disc', defaultRate: 3500, dailyRentRate: 45000 },
  { id: 'ps3_slim_320', platform: 'PS3', name: 'PS3 Slim 320GB OFW/HEN', year: 2020, month: 1, price: 1850000, watt: 110, storageGB: 290, media: 'storage', defaultRate: 5000, dailyRentRate: 65000 },
  { id: 'ps3_ss_500', platform: 'PS3', name: 'PS3 Super Slim 500GB', year: 2020, month: 1, price: 2250000, watt: 95, storageGB: 460, media: 'storage', defaultRate: 5000, dailyRentRate: 70000 },
  { id: 'ps4_fat_500', platform: 'PS4', name: 'PS4 Fat 500GB CUH-1206', year: 2020, month: 1, price: 3400000, watt: 140, storageGB: 408, media: 'storage', defaultRate: 8000, dailyRentRate: 110000 },
  { id: 'ps4_slim_500', platform: 'PS4', name: 'PS4 Slim 500GB Garansi Sony', year: 2020, month: 1, price: 4100000, watt: 110, storageGB: 408, media: 'storage', defaultRate: 8000, dailyRentRate: 120000 },
  { id: 'ps4_slim_1tb', platform: 'PS4', name: 'PS4 Slim 1TB Garansi Sony', year: 2020, month: 1, price: 4700000, watt: 110, storageGB: 860, media: 'storage', defaultRate: 9000, dailyRentRate: 135000 },
  { id: 'ps4_pro_1tb', platform: 'PS4', name: 'PS4 Pro 1TB 4K HDR', year: 2020, month: 1, price: 5600000, watt: 165, storageGB: 860, media: 'storage', defaultRate: 10000, dailyRentRate: 150000 },
  { id: 'ps5_digital', platform: 'PS5', name: 'PS5 Digital Edition 825GB', year: 2020, month: 11, price: 11500000, watt: 180, storageGB: 667, media: 'storage', defaultRate: 15000, dailyRentRate: 230000 },
  { id: 'ps5_disc', platform: 'PS5', name: 'PS5 Disc Edition 825GB', year: 2020, month: 11, price: 13500000, watt: 200, storageGB: 667, media: 'storage', defaultRate: 16000, dailyRentRate: 250000 },
  { id: 'switch_lite', platform: 'Switch', name: 'Nintendo Switch Lite (32GB)', year: 2020, month: 1, price: 3100000, watt: 18, storageGB: 26, media: 'storage', defaultRate: 7000, dailyRentRate: 85000 },
  { id: 'switch_v2', platform: 'Switch', name: 'Nintendo Switch V2 Neon (32GB)', year: 2020, month: 1, price: 4650000, watt: 35, storageGB: 26, media: 'storage', defaultRate: 9000, dailyRentRate: 110000 },
  { id: 'xbox_one_s', platform: 'Xbox', name: 'Xbox One S 1TB All-Digital', year: 2020, month: 1, price: 3600000, watt: 90, storageGB: 780, media: 'storage', defaultRate: 8000, dailyRentRate: 100000 }
];

const PC_CATALOG = [
  { id: 'pc_entry_2020', platform: 'PC', name: 'PC Rakitan Warnet 2020 (i3-9100F, GTX 1650 4GB, RAM 8GB, SSD 240GB)', year: 2020, month: 1, price: 6800000, watt: 220, storageGB: 220, media: 'storage', defaultRate: 6000, dailyRentRate: 0 },
  { id: 'pc_mid_2020', platform: 'PC', name: 'PC Gaming Mid 2020 (Ryzen 5 3600, GTX 1660 Super 6GB, RAM 16GB, SSD 512GB)', year: 2020, month: 1, price: 11200000, watt: 300, storageGB: 470, media: 'storage', defaultRate: 9000, dailyRentRate: 0 }
];

const TV_CATALOG = [
  { id: 'tv_lcd_32_lg', name: 'TV LCD LG 32" HD Ready', type: 'LCD', inch: 32, year: 2020, price: 1650000, watt: 55, bonusRate: 500 },
  { id: 'tv_led_32_tcl', name: 'TV LED TCL 32" HD', type: 'LED', inch: 32, year: 2020, price: 1849000, watt: 45, bonusRate: 500 },
  { id: 'tv_led_40_coocaa', name: 'Smart TV LED Coocaa 40" Full HD', type: 'LED FHD', inch: 40, year: 2020, price: 2799000, watt: 60, bonusRate: 1500 },
  { id: 'tv_led_43_tcl', name: 'Smart TV LED UHD 4K TCL 43"', type: 'LED 4K', inch: 43, year: 2020, price: 3899000, watt: 75, bonusRate: 2000 }
];

const PS1_GAMES = ["Harvest Moon: Back to Nature", "Crash Team Racing (CTR)", "Winning Eleven 3 Final Ver", "Tekken 3", "Pepsiman", "Digimon World 3", "Resident Evil 3", "Silent Hill"].map((title, i) => ({
  id: 'ps1_g_' + i, platform: 'PS1', title, year: 2020, price: 35000, sizeGB: 0
}));

const PS2_GAMES = ["GTA: San Andreas", "Winning Eleven 10", "PES 2013 (Patch Indo)", "Downhill Domination", "Bully", "God of War II", "Resident Evil 4", "Naruto Shippuden 5", "Mortal Kombat: Shaolin Monks", "Tekken 5"].map((title, i) => ({
  id: 'ps2_g_' + i, platform: 'PS2', title, year: 2020, price: 50000, sizeGB: 0
}));

const MODERN_GAMES = [
  { id: 'ps3_pes18', platform: 'PS3', title: 'PES 2018', year: 2020, price: 220000, sizeGB: 14 },
  { id: 'ps3_gta5', platform: 'PS3', title: 'Grand Theft Auto V', year: 2020, price: 250000, sizeGB: 18 },
  { id: 'ps4_pes20', platform: 'PS4', title: 'eFootball PES 2020', year: 2020, price: 480000, sizeGB: 42 },
  { id: 'ps4_gta5', platform: 'PS4', title: 'GTA V Premium', year: 2020, price: 380000, sizeGB: 94 },
  { id: 'pc_valorant', platform: 'PC', title: 'Valorant', year: 2020, price: 50000, sizeGB: 28 },
  { id: 'pc_dota2', platform: 'PC', title: 'Dota 2', year: 2020, price: 50000, sizeGB: 45 }
];

const ALL_GAMES = [...PS1_GAMES, ...PS2_GAMES, ...MODERN_GAMES];

const WIFI_PROVIDERS = [
  { id: 'indihome_20', name: 'IndiHome 20 Mbps', installFee: 150000, monthly: 345000, year: 2020 },
  { id: 'indihome_50', name: 'IndiHome 50 Mbps', installFee: 150000, monthly: 495000, year: 2020 }
];

const KIOS_TIERS = [
  { level: 1, name: 'Ruko Sekat 5 Room (3x6m)', maxRooms: 5, monthlyRent: 1200000, buyPrice: 45000000 },
  { level: 2, name: 'Ruko 8 Room Private (5x10m)', maxRooms: 8, monthlyRent: 2200000, buyPrice: 95000000 }
];

const PPOB_PRODUCTS = [
  { id: 'dana_50', name: 'Top Up DANA 50.000', nominal: 50000, adminProvider: 0, hargaJual: 52000 },
  { id: 'gopay_50', name: 'Top Up GoPay 50.000', nominal: 50000, adminProvider: 1000, hargaJual: 52500 },
  { id: 'pln_50', name: 'Token PLN 50.000', nominal: 50000, adminProvider: 1500, hargaJual: 53000 }
];

const EXPANSION_BUSINESSES = [
  { id: 'biz_powerbank', name: 'Sewa Powerbank Station', unlockCost: 1500000, dailyIncomeRange: [40000, 90000], desc: 'Sewa powerbank harian.' },
  { id: 'biz_motor', name: 'Sewa Motor Harian (2 Unit)', unlockCost: 24000000, dailyIncomeRange: [180000, 320000], desc: 'Penyewaan motor.' }
];

const PARTNERS_LIST = [
  { id: 'p_dimas', name: 'Dimas (Mekanik)', job: 'Mekanik Bengkel', charmReq: 20 },
  { id: 'p_reza', name: 'Reza (Mahasiswa IT)', job: 'Freelancer', charmReq: 40 }
];

const WEDDING_PACKAGES = [
  { id: 'wed_kua', name: 'Nikah Sederhana di KUA', cost: 3500000, repBonus: 0.2, dailyCostRange: [35000, 75000] }
];
