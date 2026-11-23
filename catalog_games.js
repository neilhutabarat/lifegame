// ==================== DATABASE RAKIT PC WARNET, GAME ONLINE/PC, ISP INTERNET, SERVER & LOGISTIK (2010 - 2026+) ====================

function makeItemIllus(kind, label, sub, accent) {
  accent = accent || '#2563eb';
  var safeL = String(label || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').slice(0, 20);
  var safeS = String(sub || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').slice(0, 24);
  var shape = '';
  if (kind === 'pc_case') {
    shape = '<rect x="46" y="20" width="68" height="76" rx="7" fill="#0f172a" stroke="' + accent + '" stroke-width="3"/>' +
      '<rect x="54" y="28" width="52" height="12" rx="2" fill="#334155"/>' +
      '<circle cx="80" cy="64" r="16" fill="none" stroke="' + accent + '" stroke-width="3"/>' +
      '<circle cx="80" cy="64" r="4" fill="#22c55e"/>';
  } else if (kind === 'cpu') {
    shape = '<rect x="48" y="26" width="64" height="64" rx="8" fill="#1e293b" stroke="' + accent + '" stroke-width="3"/>' +
      '<rect x="58" y="36" width="44" height="44" rx="4" fill="' + accent + '"/>' +
      '<text x="80" y="63" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="900" font-size="13">CPU</text>';
  } else if (kind === 'vga') {
    shape = '<rect x="26" y="36" width="108" height="46" rx="7" fill="#0f172a" stroke="' + accent + '" stroke-width="3"/>' +
      '<circle cx="56" cy="59" r="15" fill="#1e293b" stroke="' + accent + '" stroke-width="2.5"/>' +
      '<circle cx="104" cy="59" r="15" fill="#1e293b" stroke="' + accent + '" stroke-width="2.5"/>';
  } else if (kind === 'ram') {
    shape = '<rect x="24" y="42" width="112" height="34" rx="5" fill="#065f46" stroke="#34d399" stroke-width="2.5"/>' +
      '<rect x="34" y="48" width="18" height="22" fill="#0f172a"/><rect x="58" y="48" width="18" height="22" fill="#0f172a"/>' +
      '<rect x="82" y="48" width="18" height="22" fill="#0f172a"/><rect x="106" y="48" width="18" height="22" fill="#0f172a"/>';
  } else if (kind === 'storage') {
    shape = '<rect x="44" y="24" width="72" height="68" rx="8" fill="#334155" stroke="' + accent + '" stroke-width="2.5"/>' +
      '<circle cx="80" cy="54" r="18" fill="#94a3b8"/><circle cx="80" cy="54" r="5" fill="#0f172a"/>';
  } else if (kind === 'monitor') {
    shape = '<rect x="24" y="22" width="112" height="62" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5"/>' +
      '<rect x="29" y="27" width="102" height="52" fill="' + accent + '"/>' +
      '<rect x="68" y="84" width="24" height="7" fill="#64748b"/><rect x="52" y="91" width="56" height="4" rx="2" fill="#94a3b8"/>';
  } else if (kind === 'gear') {
    shape = '<rect x="26" y="46" width="70" height="28" rx="5" fill="#1e293b" stroke="' + accent + '" stroke-width="2.5"/>' +
      '<ellipse cx="118" cy="60" rx="14" ry="19" fill="#1e293b" stroke="' + accent + '" stroke-width="2.5"/>';
  } else if (kind === 'fan') {
    shape = '<circle cx="80" cy="56" r="28" fill="rgba(56,189,248,0.2)" stroke="#94a3b8" stroke-width="2.5"/>' +
      '<line x1="80" y1="30" x2="80" y2="82" stroke="#38bdf8" stroke-width="5"/>' +
      '<line x1="54" y1="56" x2="106" y2="56" stroke="#38bdf8" stroke-width="5"/>';
  } else if (kind === 'ac') {
    shape = '<rect x="22" y="36" width="116" height="38" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="2.5"/>' +
      '<line x1="30" y1="66" x2="130" y2="66" stroke="#0ea5e9" stroke-width="3"/>';
  } else if (kind === 'galon') {
    shape = '<rect x="54" y="32" width="52" height="60" rx="12" fill="#0284c7" stroke="#bae6fd" stroke-width="2.5"/>' +
      '<rect x="68" y="18" width="24" height="14" rx="4" fill="#0369a1"/>' +
      '<text x="80" y="66" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="900" font-size="11">19 LITER</text>';
  } else if (kind === 'box') {
    shape = '<rect x="34" y="28" width="92" height="60" rx="8" fill="' + accent + '" stroke="#fcd34d" stroke-width="2.5"/>' +
      '<text x="80" y="64" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="900" font-size="13">1 DUS</text>';
  } else if (kind === 'motor') {
    shape = '<circle cx="48" cy="76" r="15" fill="#1e293b" stroke="#cbd5e1" stroke-width="3"/>' +
      '<circle cx="112" cy="76" r="15" fill="#1e293b" stroke="#cbd5e1" stroke-width="3"/>' +
      '<path d="M48,76 L70,48 L98,48 L112,76" fill="none" stroke="' + accent + '" stroke-width="6" stroke-linecap="round"/>';
  } else if (kind === 'mobil') {
    shape = '<path d="M26,70 L40,44 L108,44 L130,70 Z" fill="' + accent + '" stroke="#e2e8f0" stroke-width="2"/>' +
      '<rect x="22" y="64" width="116" height="16" rx="5" fill="' + accent + '"/>' +
      '<circle cx="48" cy="82" r="11" fill="#0f172a" stroke="#cbd5e1" stroke-width="3"/>' +
      '<circle cx="112" cy="82" r="11" fill="#0f172a" stroke="#cbd5e1" stroke-width="3"/>';
  } else {
    shape = '<rect x="48" y="22" width="64" height="68" rx="9" fill="' + accent + '" stroke="#e2e8f0" stroke-width="2.5"/>' +
      '<circle cx="80" cy="82" r="3" fill="#fff"/>';
  }
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 135" width="160" height="135">' +
    '<rect width="160" height="135" rx="14" fill="#0f172a" stroke="#334155" stroke-width="2"/>' +
    shape +
    '<text x="80" y="112" text-anchor="middle" fill="#f8fafc" font-family="Arial,sans-serif" font-weight="800" font-size="10.5">' + safeL + '</text>' +
    '<text x="80" y="126" text-anchor="middle" fill="#38bdf8" font-family="Arial,sans-serif" font-weight="700" font-size="9">' + safeS + '</text>' +
    '</svg>';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// ==================== KOMPONEN RAKIT PC WARNET (SESUAI TAHUN 2010 - 2026+) ====================
const PC_CPU_CATALOG = [
  { id: 'cpu_e5400', name: 'Intel Pentium Dual-Core E5400 2.7GHz', tier: 1, maxRamSlots: 2, releaseYear: 2009, basePrice2010: 520000, watt: 65, img: makeItemIllus('cpu', 'Pentium E5400', '2 Slot RAM • 2.7GHz', '#0284c7') },
  { id: 'cpu_e7500', name: 'Intel Core 2 Duo E7500 2.93GHz', tier: 2, maxRamSlots: 2, releaseYear: 2009, basePrice2010: 890000, watt: 65, img: makeItemIllus('cpu', 'Core 2 Duo E7500', '2 Slot RAM • LGA775', '#2563eb') },
  { id: 'cpu_athlon250', name: 'AMD Athlon II X2 250 3.0GHz', tier: 2, maxRamSlots: 2, releaseYear: 2009, basePrice2010: 560000, watt: 65, img: makeItemIllus('cpu', 'Athlon II X2 250', '2 Slot RAM • 3.0GHz', '#dc2626') },
  { id: 'cpu_i3_2100', name: 'Intel Core i3-2100 Sandy Bridge', tier: 3, maxRamSlots: 4, releaseYear: 2011, basePrice2010: 1050000, watt: 65, img: makeItemIllus('cpu', 'Core i3-2100', '4 Slot RAM • LGA1155', '#2563eb') },
  { id: 'cpu_fx6300', name: 'AMD FX-6300 Vishera 6-Core', tier: 4, maxRamSlots: 4, releaseYear: 2012, basePrice2010: 1180000, watt: 95, img: makeItemIllus('cpu', 'AMD FX-6300', '4 Slot RAM • 6-Core', '#ea580c') },
  { id: 'cpu_i5_4460', name: 'Intel Core i5-4460 Haswell', tier: 5, maxRamSlots: 4, releaseYear: 2014, basePrice2010: 1850000, watt: 84, img: makeItemIllus('cpu', 'Core i5-4460', '4 Slot RAM • Haswell', '#1d4ed8') },
  { id: 'cpu_i5_7400', name: 'Intel Core i5-7400 Kaby Lake', tier: 6, maxRamSlots: 4, releaseYear: 2017, basePrice2010: 2100000, watt: 65, img: makeItemIllus('cpu', 'Core i5-7400', '4 Slot RAM • Kaby Lake', '#1d4ed8') },
  { id: 'cpu_r5_2600', name: 'AMD Ryzen 5 2600 6C/12T', tier: 7, maxRamSlots: 4, releaseYear: 2018, basePrice2010: 1950000, watt: 65, img: makeItemIllus('cpu', 'Ryzen 5 2600', '4 Slot RAM • 12T', '#ea580c') },
  { id: 'cpu_i5_10400f', name: 'Intel Core i5-10400F 6C/12T', tier: 8, maxRamSlots: 4, releaseYear: 2020, basePrice2010: 1850000, watt: 65, img: makeItemIllus('cpu', 'Core i5-10400F', '4 Slot RAM • 12T', '#2563eb') },
  { id: 'cpu_r5_5600x', name: 'AMD Ryzen 5 5600X Zen 3', tier: 9, maxRamSlots: 4, releaseYear: 2020, basePrice2010: 2650000, watt: 65, img: makeItemIllus('cpu', 'Ryzen 5 5600X', '4 Slot RAM • Esports', '#dc2626') },
  { id: 'cpu_r7_7800x3d', name: 'AMD Ryzen 7 7800X3D 3D V-Cache', tier: 10, maxRamSlots: 4, releaseYear: 2023, basePrice2010: 4500000, watt: 105, img: makeItemIllus('cpu', 'Ryzen 7 7800X3D', '4 Slot RAM • Sultan', '#b91c1c') }
];

const PC_RAM_CATALOG = [
  { id: 'ram_1gb', name: 'RAM 1GB DDR2 V-GEN', sizeGb: 1, tier: 1, releaseYear: 2008, basePrice2010: 180000, img: makeItemIllus('ram', 'RAM 1GB DDR2', 'Standar XP') },
  { id: 'ram_2gb', name: 'RAM 2GB DDR3 Kingston', sizeGb: 2, tier: 2, releaseYear: 2009, basePrice2010: 320000, img: makeItemIllus('ram', 'RAM 2GB DDR3', 'PB & Dragon Nest') },
  { id: 'ram_4gb', name: 'RAM 4GB DDR3 Corsair', sizeGb: 4, tier: 3, releaseYear: 2010, basePrice2010: 540000, img: makeItemIllus('ram', 'RAM 4GB DDR3', 'Lancar Multitask') },
  { id: 'ram_8gb', name: 'RAM 8GB DDR3/DDR4 Dual Channel', sizeGb: 8, tier: 5, releaseYear: 2013, basePrice2010: 780000, img: makeItemIllus('ram', 'RAM 8GB Dual', 'Dota 2 & GTA V') },
  { id: 'ram_16gb', name: 'RAM 16GB DDR4 3200MHz RGB', sizeGb: 16, tier: 8, releaseYear: 2017, basePrice2010: 1250000, img: makeItemIllus('ram', 'RAM 16GB DDR4', 'PUBG & Valorant') },
  { id: 'ram_32gb', name: 'RAM 32GB DDR5 6000MHz', sizeGb: 32, tier: 10, releaseYear: 2022, basePrice2010: 2100000, img: makeItemIllus('ram', 'RAM 32GB DDR5', 'Ultra Sultan') }
];

const PC_VGA_CATALOG = [
  { id: 'vga_onboard', name: 'VGA Onboard Intel GMA (Tanpa VGA Card)', tier: 1, releaseYear: 2008, basePrice2010: 100000, watt: 15, img: makeItemIllus('vga', 'VGA Onboard', 'Browsing & CS 1.6', '#64748b') },
  { id: 'vga_9500gt', name: 'NVIDIA GeForce 9500 GT 512MB', tier: 2, releaseYear: 2009, basePrice2010: 480000, watt: 50, img: makeItemIllus('vga', 'GeForce 9500 GT', 'PB & AyoDance', '#16a34a') },
  { id: 'vga_hd5670', name: 'ATI Radeon HD 5670 1GB GDDR5', tier: 3, releaseYear: 2010, basePrice2010: 780000, watt: 64, img: makeItemIllus('vga', 'Radeon HD 5670', 'Dragon Nest & RF', '#dc2626') },
  { id: 'vga_gts450', name: 'NVIDIA GeForce GTS 450 1GB', tier: 4, releaseYear: 2011, basePrice2010: 980000, watt: 106, img: makeItemIllus('vga', 'GeForce GTS 450', 'Dota 2 Lancar', '#16a34a') },
  { id: 'vga_gtx750ti', name: 'NVIDIA GTX 750 Ti 2GB (Legenda Warnet)', tier: 6, releaseYear: 2014, basePrice2010: 1550000, watt: 60, img: makeItemIllus('vga', 'GTX 750 Ti 2GB', 'Hemat Listrik & Kencang', '#15803d') },
  { id: 'vga_gtx1050ti', name: 'NVIDIA GTX 1050 Ti 4GB GDDR5', tier: 7, releaseYear: 2016, basePrice2010: 1950000, watt: 75, img: makeItemIllus('vga', 'GTX 1050 Ti 4GB', 'PUBG & GTA V', '#16a34a') },
  { id: 'vga_gtx1650', name: 'NVIDIA GTX 1650 4GB Super', tier: 8, releaseYear: 2019, basePrice2010: 2250000, watt: 85, img: makeItemIllus('vga', 'GTX 1650 4GB', 'Valorant 144FPS+', '#16a34a') },
  { id: 'vga_rtx3060', name: 'NVIDIA GeForce RTX 3060 12GB', tier: 9, releaseYear: 2021, basePrice2010: 3900000, watt: 170, img: makeItemIllus('vga', 'RTX 3060 12GB', 'Ray Tracing iCafe', '#059669') },
  { id: 'vga_rtx4070', name: 'NVIDIA GeForce RTX 4070 Super', tier: 10, releaseYear: 2023, basePrice2010: 6200000, watt: 200, img: makeItemIllus('vga', 'RTX 4070 Super', 'Rata Kanan 4K', '#10b981') }
];

const PC_STORAGE_CATALOG = [
  { id: 'hdd_80', name: 'Hardisk Seagate 80GB IDE/SATA', sizeGb: 80, releaseYear: 2008, basePrice2010: 250000, img: makeItemIllus('storage', 'HDD 80GB', 'Muat 6-8 Game', '#64748b') },
  { id: 'hdd_250', name: 'Hardisk WD Blue 250GB SATA', sizeGb: 250, releaseYear: 2009, basePrice2010: 380000, img: makeItemIllus('storage', 'HDD 250GB', 'Standar Warnet 2010', '#2563eb') },
  { id: 'hdd_500', name: 'Hardisk Seagate 500GB 7200RPM', sizeGb: 500, releaseYear: 2010, basePrice2010: 490000, img: makeItemIllus('storage', 'HDD 500GB', 'Koleksi Lengkap', '#0284c7') },
  { id: 'ssd_256_hdd1tb', name: 'SSD 256GB + HDD 1TB (Booting Cepat)', sizeGb: 1256, releaseYear: 2015, basePrice2010: 950000, img: makeItemIllus('storage', 'SSD 256G + 1TB', 'Anti Loading Lama', '#10b981') },
  { id: 'nvme_2tb', name: 'SSD NVMe M.2 Gen4 2TB (2000GB)', sizeGb: 2000, releaseYear: 2020, basePrice2010: 1550000, img: makeItemIllus('storage', 'NVMe 2TB Gen4', 'Speed 7000MB/s', '#8b5cf6') }
];

const PC_OS_CATALOG = [
  { id: 'os_xp', name: 'Windows XP Professional SP3 (Billing Explorer)', releaseYear: 2008, basePrice2010: 50000 },
  { id: 'os_win7', name: 'Windows 7 Ultimate 64-Bit (SmartBilling)', releaseYear: 2009, basePrice2010: 100000 },
  { id: 'os_win10', name: 'Windows 10 Pro 64-Bit Gaming Edition', releaseYear: 2015, basePrice2010: 150000 },
  { id: 'os_win11', name: 'Windows 11 Pro 64-Bit DirectStorage', releaseYear: 2021, basePrice2010: 200000 }
];

const MONITOR_CATALOG = [
  { id: 'mon_crt15', name: 'Monitor Tabung LG 15" CRT', releaseYear: 2005, basePrice2010: 350000, watt: 55, comfortBonus: 0, rateBonus2010: 0, img: makeItemIllus('monitor', 'Monitor Tabung 15"', '55W • Klasik', '#334155') },
  { id: 'mon_lcd17', name: 'Monitor LCD AOC / BenQ 17" Square', releaseYear: 2008, basePrice2010: 780000, watt: 28, comfortBonus: 8, rateBonus2010: 500, img: makeItemIllus('monitor', 'Monitor LCD 17"', '28W • Hemat Listrik', '#0284c7') },
  { id: 'mon_lcd19w', name: 'Monitor LCD Samsung 19" Widescreen', releaseYear: 2010, basePrice2010: 1050000, watt: 32, comfortBonus: 15, rateBonus2010: 1000, img: makeItemIllus('monitor', 'Samsung 19" Wide', '32W • Favorit PB/DN', '#2563eb') },
  { id: 'mon_led24_144', name: 'Monitor Gaming ASUS/Zowie 24" 144Hz', releaseYear: 2015, basePrice2010: 2350000, watt: 38, comfortBonus: 30, rateBonus2010: 2000, img: makeItemIllus('monitor', 'Gaming 24" 144Hz', '38W • Smooth Esports', '#4f46e5') },
  { id: 'mon_led27_240', name: 'Monitor Esports 27" 240Hz IPS HDR', releaseYear: 2020, basePrice2010: 3800000, watt: 45, comfortBonus: 45, rateBonus2010: 3500, img: makeItemIllus('monitor', 'Esports 27" 240Hz', '45W • Sultan iCafe', '#7c3aed') }
];

const COOLING_CATALOG = [
  { id: 'fan_wall', type: 'fan', name: 'Kipas Angin Dinding Miyako 16"', releaseYear: 1995, basePrice2010: 165000, watt: 45, comfortBonus: 10, rateBonus2010: 500, img: makeItemIllus('fan', 'Kipas Dinding 16"', '45W • Anti Gerah') },
  { id: 'fan_tornado', type: 'fan', name: 'Kipas Tornado Besi Regency 18"', releaseYear: 2005, basePrice2010: 320000, watt: 75, comfortBonus: 16, rateBonus2010: 800, img: makeItemIllus('fan', 'Kipas Tornado 18"', '75W • Angin Kencang') },
  { id: 'ac_half_pk', type: 'ac', name: 'AC Split Panasonic 1/2 PK Low Watt', releaseYear: 2008, basePrice2010: 2450000, watt: 340, comfortBonus: 35, rateBonus2010: 1500, img: makeItemIllus('ac', 'AC Panasonic 1/2 PK', '340W • Dingin Sejuk') },
  { id: 'ac_1pk_inv', type: 'ac', name: 'AC Daikin Inverter 1 PK Dingin Cepat', releaseYear: 2013, basePrice2010: 3800000, watt: 520, comfortBonus: 50, rateBonus2010: 2500, img: makeItemIllus('ac', 'AC Daikin 1 PK', '520W • Super Dingin') }
];

// PERIPHERAL (MOUSE + KEYBOARD + HEADSET WARNET) - BISA RUSAK & DISERVIS
const PERIPHERAL_CATALOG = [
  { id: 'gear_std', name: 'Set Mouse Optic + Keyboard + Headset Warnet (Logitech B100)', releaseYear: 2008, basePrice2010: 120000, img: makeItemIllus('gear', 'Set Gear Warnet', 'Mouse+KB+Headset', '#475569') }
];

// ==================== PAKET LANGGANAN INTERNET ASLI INDONESIA (TELKOM SPEEDY 2010 & INDIHOME/BIZNET) ====================
const INTERNET_PLANS = [
  { id: 'isp_1m', name: 'Telkom Speedy Familia 1 Mbps Unlimited', mbps: 1, releaseYear: 2009, monthlyReal: 295000, maxSmoothPcs: 6 },
  { id: 'isp_2m', name: 'Telkom Speedy Executive 2 Mbps', mbps: 2, releaseYear: 2010, monthlyReal: 495000, maxSmoothPcs: 11 },
  { id: 'isp_3m', name: 'Telkom Speedy Biz 3 Mbps Warnet', mbps: 3, releaseYear: 2010, monthlyReal: 695000, maxSmoothPcs: 16 },
  { id: 'isp_5m', name: 'Telkom Speedy Gold 5 Mbps', mbps: 5, releaseYear: 2012, monthlyReal: 990000, maxSmoothPcs: 20 },
  { id: 'isp_10m', name: 'IndiHome Fiber Optic 10 Mbps', mbps: 10, releaseYear: 2015, monthlyReal: 385000, maxSmoothPcs: 20 },
  { id: 'isp_20m', name: 'IndiHome Fiber 20 Mbps', mbps: 20, releaseYear: 2016, monthlyReal: 515000, maxSmoothPcs: 20 },
  { id: 'isp_50m', name: 'IndiHome / Biznet 50 Mbps', mbps: 50, releaseYear: 2018, monthlyReal: 890000, maxSmoothPcs: 20 },
  { id: 'isp_100m', name: 'Biznet Metronet 100 Mbps iCafe', mbps: 100, releaseYear: 2020, monthlyReal: 1250000, maxSmoothPcs: 20 },
  { id: 'isp_250m', name: 'Biznet Dedicated GameNet 250 Mbps', mbps: 250, releaseYear: 2023, monthlyReal: 2100000, maxSmoothPcs: 20 }
];

// ==================== UPGRADE PC SERVER KASIR (DISKLESS / AUTO-PATCH CACHE) ====================
const SERVER_LEVELS = [
  { level: 1, name: 'Level 1: PC Kasir Billing Standar (Update Manual Tiap PC)', baseCost2010: 0, patchSpeedMult: 1.0 },
  { level: 2, name: 'Level 2: Server Billing + Local Patch Cache (Update 2x Lebih Cepat)', baseCost2010: 3500000, patchSpeedMult: 2.0 },
  { level: 3, name: 'Level 3: Server Diskless CyberIndo / Gcafe (Update 4x Lebih Cepat)', baseCost2010: 8500000, patchSpeedMult: 4.0 },
  { level: 4, name: 'Level 4: Enterprise 10GbE Diskless Raid Server (Update 8x Instan)', baseCost2010: 18000000, patchSpeedMult: 8.0 }
];

// ==================== KATALOG GAME ONLINE & GAME PC OFFLINE (SESUAI TAHUN + UKURAN PATCH MB) ====================
function makeGameCoverSvg(type, title, genre, id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i);
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 52) % 360;
  const badgeBg = type === 'online' ? '#0284c7' : '#d97706';
  const badgeText = type === 'online' ? 'GAME ONLINE' : 'DVD PC OFFLINE';
  const safeT = title.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const l1 = safeT.slice(0, 17);
  const l2 = safeT.slice(17, 34);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="160" height="200">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="hsl(${hue1},75%,38%)"/><stop offset="100%" stop-color="hsl(${hue2},85%,16%)"/></linearGradient></defs>
    <rect width="160" height="200" rx="10" fill="url(#g)" stroke="#475569" stroke-width="3"/>
    <rect width="160" height="26" rx="8" fill="${badgeBg}"/>
    <text x="80" y="17" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="900" font-size="11">${badgeText}</text>
    <circle cx="80" cy="92" r="36" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
    <text x="80" y="152" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="900" font-size="11.5">${l1}</text>
    <text x="80" y="167" text-anchor="middle" fill="#e2e8f0" font-family="Arial" font-weight="700" font-size="10">${l2}</text>
    <rect x="24" y="176" width="112" height="15" rx="7" fill="rgba(0,0,0,0.5)"/>
    <text x="80" y="187" text-anchor="middle" fill="#38bdf8" font-family="Arial" font-weight="700" font-size="9">${genre.toUpperCase()}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// [id, type ('online'|'offline'), title, genre, minTier, releaseYear, price2010 (0=gratis download, >0=beli kaset DVD installer), sizeGb, patchMb, canPartyMabar]
const PC_GAMES_RAW = [
  // ==================== 42 GAME ONLINE LEGENDARIS WARNET INDONESIA (2010 - 2026+) ====================
  ['go_pb', 'online', 'Point Blank (PB Gemscool/Zepetto)', 'FPS Online', 1, 2009, 0, 2.5, 180, true],
  ['go_dn', 'online', 'Dragon Nest INA / SEA (Gemscool)', 'Action MMORPG', 2, 2010, 0, 4.5, 420, true],
  ['go_ls', 'online', 'Lost Saga Indonesia', 'Brawler Online', 1, 2011, 0, 1.8, 150, true],
  ['go_ayo', 'online', 'Audition AyoDance (Megaxus)', 'Rhythm Dance', 1, 2007, 0, 3.2, 240, true],
  ['go_rf', 'online', 'RF Online Indonesia (Lyto)', 'Sci-Fi MMORPG', 1, 2007, 0, 2.8, 160, true],
  ['go_atl', 'online', 'Atlantica Online Indonesia', 'Turn-Based MMO', 2, 2010, 0, 5.0, 310, true],
  ['go_cf', 'online', 'CrossFire Indonesia (Lyto)', 'FPS Online', 1, 2009, 0, 2.2, 140, true],
  ['go_cso', 'online', 'Counter-Strike Online (CSO Megaxus)', 'FPS Zombie', 1, 2011, 0, 2.4, 190, true],
  ['go_seal', 'online', 'Seal Online Plus Indonesia', 'Anime MMORPG', 1, 2008, 0, 2.0, 120, true],
  ['go_ro', 'online', 'Ragnarok Online Indonesia', 'Classic MMORPG', 1, 2004, 0, 1.5, 95, true],
  ['go_pw', 'online', 'Perfect World Indonesia (Lyto)', 'Fantasy MMORPG', 2, 2008, 0, 4.2, 260, true],
  ['go_idol', 'online', 'Idol Street Indonesia', 'Dance Online', 1, 2008, 0, 2.6, 170, true],
  ['go_getamped', 'online', 'GetAmped-X Indonesia', 'Fighting Online', 1, 2006, 0, 0.9, 80, true],
  ['go_ghost', 'online', 'Ghost Online Indonesia', '2D Side MMORPG', 1, 2008, 0, 1.1, 90, true],
  ['go_yulgang', 'online', 'Yulgang Online (Scions of Fate)', 'Martial MMO', 1, 2009, 0, 1.7, 110, true],
  ['go_luna', 'online', 'Luna Online Plus Indonesia', 'Cute MMORPG', 1, 2010, 0, 2.1, 140, true],
  ['go_rohan', 'online', 'Rohan Online: Blood Feud', 'PK MMORPG', 2, 2009, 0, 3.4, 210, true],
  ['go_cabal', 'online', 'Cabal Online Indonesia', 'Action MMORPG', 2, 2010, 0, 2.9, 180, true],
  ['go_crazykart', 'online', 'Crazy Kart 2 Indonesia', 'Kart Racing', 1, 2010, 0, 1.2, 95, true],
  ['go_pangya', 'online', 'PangYa Golf Online', 'Sports Fantasy', 1, 2008, 0, 1.8, 120, true],
  ['go_hon', 'online', 'Heroes of Newerth (HoN Garena)', 'MOBA 5v5', 2, 2011, 0, 3.8, 280, true],
  ['go_elsword', 'online', 'Elsword Indonesia (Netmarble)', 'Anime Action MMO', 2, 2012, 0, 4.5, 320, true],
  ['go_SDgundam', 'online', 'SD Gundam Capsule Fighter Online', 'Mecha Shooter', 2, 2012, 0, 3.6, 240, true],
  ['go_ava', 'online', 'A.V.A (Alliance of Valiant Arms)', 'Military FPS', 2, 2011, 0, 4.8, 290, true],
  ['go_dota2', 'online', 'Dota 2 (Steam)', 'MOBA 5v5', 3, 2013, 0, 15.0, 650, true],
  ['go_lol', 'online', 'League of Legends (LoL Garena)', 'MOBA 5v5', 2, 2013, 0, 8.5, 480, true],
  ['go_csgo', 'online', 'Counter-Strike: Global Offensive (CS:GO)', 'Esports FPS', 3, 2012, 0, 14.0, 520, true],
  ['go_tf2', 'online', 'Team Fortress 2 (Steam)', 'Class Shooter', 2, 2011, 0, 11.0, 380, true],
  ['go_wot', 'online', 'World of Tanks Online', 'Tank Combat', 3, 2012, 0, 16.0, 540, true],
  ['go_warthunder', 'online', 'War Thunder PC', 'Vehicular Combat', 4, 2013, 0, 22.0, 680, true],
  ['go_closers', 'online', 'Closers Online Megaxus', 'Anime Action', 3, 2016, 0, 10.0, 420, true],
  ['go_treeofsavior', 'online', 'Tree of Savior (Gemscool)', 'MMORPG', 3, 2016, 0, 12.0, 450, true],
  ['go_bdo', 'online', 'Black Desert Online SEA', 'Open World MMO', 6, 2018, 0, 42.0, 950, true],
  ['go_gtav_rp', 'online', 'GTA V Online / FiveM Indo Roleplay', 'Open World RP', 6, 2015, 350000, 75.0, 950, true],
  ['go_pubg', 'online', 'PUBG: Battlegrounds PC', 'Battle Royale', 7, 2017, 0, 35.0, 850, true],
  ['go_fortnite', 'online', 'Fortnite Battle Royale PC', 'Battle Royale', 6, 2017, 0, 32.0, 820, true],
  ['go_apex', 'online', 'Apex Legends (Steam/EA)', 'Battle Royale', 7, 2019, 0, 45.0, 900, true],
  ['go_valorant', 'online', 'VALORANT (Riot Games)', 'Tactical FPS', 6, 2020, 0, 28.0, 720, true],
  ['go_genshin', 'online', 'Genshin Impact PC', 'Anime Open World', 7, 2020, 0, 65.0, 1200, false],
  ['go_roblox', 'online', 'Roblox PC Player', 'Sandbox Online', 2, 2014, 0, 2.5, 180, true],
  ['go_fconline', 'online', 'EA Sports FC Online (FIFA Online 4)', 'Football Online', 5, 2018, 0, 24.0, 620, true],
  ['go_cs2', 'online', 'Counter-Strike 2 (CS2 Source 2)', 'Esports FPS', 8, 2023, 0, 38.0, 980, true],

  // ==================== 45 GAME PC OFFLINE / LAN (BELI KASET DVD INSTALLER PC DI TOKO!) ====================
  ['pc_dota1', 'offline', 'Warcraft III: DotA Allstars v6.67c (LAN)', 'MOBA LAN', 1, 2005, 35000, 1.8, 0, true],
  ['pc_cs16', 'offline', 'Counter-Strike 1.6 + Condition Zero (LAN)', 'FPS LAN', 1, 2004, 30000, 0.9, 0, true],
  ['pc_css', 'offline', 'Counter-Strike: Source (LAN Edition)', 'FPS LAN', 1, 2006, 35000, 2.4, 0, true],
  ['pc_gtasa', 'offline', 'GTA: San Andreas PC + Mod Indonesia', 'Open World', 1, 2005, 40000, 4.7, 0, false],
  ['pc_gtavc', 'offline', 'GTA: Vice City PC Original', 'Open World', 1, 2003, 30000, 1.6, 0, false],
  ['pc_gta4', 'offline', 'Grand Theft Auto IV Complete DVD', 'Open World', 3, 2008, 60000, 16.0, 0, false],
  ['pc_l4d1', 'offline', 'Left 4 Dead 1 (Co-op Zombie LAN)', 'Co-op Shooter', 1, 2008, 40000, 5.0, 0, true],
  ['pc_l4d2', 'offline', 'Left 4 Dead 2 (Co-op Zombie LAN)', 'Co-op Shooter', 2, 2009, 45000, 7.5, 0, true],
  ['pc_pes6', 'offline', 'Winning Eleven 9 / PES 6 PC', 'Sports', 1, 2006, 35000, 2.2, 0, false],
  ['pc_pes2010', 'offline', 'Pro Evolution Soccer 2010 PC', 'Sports', 2, 2009, 45000, 5.5, 0, false],
  ['pc_pes2013', 'offline', 'PES 2013 PC + Patch Liga Indonesia', 'Sports', 2, 2012, 50000, 6.5, 0, false],
  ['pc_pes2016', 'offline', 'Pro Evolution Soccer 2016 PC', 'Sports', 3, 2015, 65000, 12.0, 0, false],
  ['pc_pes2017', 'offline', 'PES 2017 PC + SmokePatch Liga 1', 'Sports', 4, 2016, 75000, 16.0, 0, false],
  ['pc_pes2021', 'offline', 'eFootball PES 2021 Season Update PC', 'Sports', 6, 2020, 110000, 38.0, 0, false],
  ['pc_fifa14', 'offline', 'EA Sports FIFA 14 World Cup PC', 'Sports', 3, 2013, 55000, 9.0, 0, false],
  ['pc_nfsu2', 'offline', 'Need for Speed: Underground 2 PC', 'Racing', 1, 2004, 30000, 2.0, 0, true],
  ['pc_nfsmw', 'offline', 'Need for Speed: Most Wanted Black Edition', 'Racing', 1, 2005, 35000, 3.0, 0, true],
  ['pc_nfscarbon', 'offline', 'Need for Speed: Carbon Collector PC', 'Racing', 1, 2006, 38000, 4.2, 0, false],
  ['pc_burnout', 'offline', 'Burnout Paradise: The Ultimate Box', 'Racing', 2, 2009, 45000, 3.8, 0, false],
  ['pc_dirt3', 'offline', 'DiRT 3 Complete Edition (Rally)', 'Racing', 2, 2011, 50000, 11.0, 0, true],
  ['pc_ets2', 'offline', 'Euro Truck Simulator 2 + Mod Bus & Truk Indo', 'Simulation', 3, 2012, 55000, 8.5, 0, false],
  ['pc_ra2', 'offline', 'Command & Conquer: Red Alert 2 Yuri (LAN)', 'Strategy LAN', 1, 2001, 30000, 1.2, 0, true],
  ['pc_generals', 'offline', 'C&C: Generals Zero Hour (LAN)', 'Strategy LAN', 1, 2003, 35000, 2.2, 0, true],
  ['pc_aoe2', 'offline', 'Age of Empires II: The Conquerors (LAN)', 'Strategy LAN', 1, 2000, 30000, 0.8, 0, true],
  ['pc_aoe3', 'offline', 'Age of Empires III Complete (LAN)', 'Strategy LAN', 1, 2007, 40000, 3.5, 0, true],
  ['pc_stronghold', 'offline', 'Stronghold Crusader Extreme (LAN)', 'Strategy LAN', 1, 2008, 32000, 1.1, 0, true],
  ['pc_battlerealms', 'offline', 'Battle Realms: Winter of the Wolf (LAN)', 'Strategy LAN', 1, 2002, 30000, 0.9, 0, true],
  ['pc_starcraft', 'offline', 'StarCraft: Brood War (LAN)', 'Strategy LAN', 1, 2001, 28000, 0.8, 0, true],
  ['pc_sc2', 'offline', 'StarCraft II: Wings of Liberty PC', 'Strategy', 2, 2010, 50000, 10.0, 0, true],
  ['pc_pvz', 'offline', 'Plants vs. Zombies + 150 GameHouse Collection', 'Casual', 1, 2009, 25000, 1.4, 0, false],
  ['pc_sims2', 'offline', 'The Sims 2 All Expansions PC', 'Simulation', 1, 2005, 40000, 5.0, 0, false],
  ['pc_sims3', 'offline', 'The Sims 3 Complete DVD PC', 'Simulation', 2, 2009, 55000, 6.2, 0, false],
  ['pc_sims4', 'offline', 'The Sims 4 Deluxe Edition PC', 'Simulation', 4, 2014, 80000, 18.0, 0, false],
  ['pc_cod4', 'offline', 'Call of Duty 4: Modern Warfare (LAN)', 'FPS LAN', 2, 2007, 45000, 6.5, 0, true],
  ['pc_cod_mw2', 'offline', 'Call of Duty: Modern Warfare 2 PC', 'FPS', 2, 2009, 50000, 11.0, 0, true],
  ['pc_cod_bo1', 'offline', 'Call of Duty: Black Ops PC', 'FPS', 2, 2010, 55000, 12.0, 0, true],
  ['pc_farcry3', 'offline', 'Far Cry 3 Deluxe Edition PC', 'Action FPS', 3, 2012, 60000, 10.0, 0, false],
  ['pc_skyrim', 'offline', 'The Elder Scrolls V: Skyrim Legendary PC', 'Action RPG', 3, 2011, 65000, 9.0, 0, false],
  ['pc_re4', 'offline', 'Resident Evil 4 PC Edition', 'Action Horror', 1, 2007, 38000, 3.8, 0, false],
  ['pc_re5', 'offline', 'Resident Evil 5 Gold Edition PC', 'Action Horror', 2, 2009, 50000, 8.0, 0, true],
  ['pc_dmc4', 'offline', 'Devil May Cry 4 PC DVD', 'Hack & Slash', 2, 2008, 45000, 7.2, 0, false],
  ['pc_naruto_s4', 'offline', 'Naruto Shippuden: Ultimate Ninja Storm 4 PC', 'Fighting', 5, 2016, 85000, 32.0, 0, false],
  ['pc_witcher3', 'offline', 'The Witcher 3: Wild Hunt GOTY PC', 'RPG', 6, 2015, 120000, 40.0, 0, false],
  ['pc_rdr2', 'offline', 'Red Dead Redemption 2 PC Installer', 'Open World', 8, 2019, 220000, 115.0, 0, false],
  ['pc_elden', 'offline', 'Elden Ring PC Deluxe Installer', 'Action RPG', 8, 2022, 250000, 60.0, 0, false]
];

const GAME_DISC_CATALOG = PC_GAMES_RAW.map(([id, type, title, genre, minTier, releaseYear, basePrice2010, sizeGb, patchMb, canPartyMabar]) => ({
  id,
  type, // 'online' | 'offline'
  platform: type === 'online' ? 'ONLINE' : 'PC_DVD',
  title,
  genre,
  minTier,
  releaseYear,
  basePrice2010,
  sizeGb,
  patchMb,
  canPartyMabar,
  cover: makeGameCoverSvg(type, title, genre, id)
}));

// AKTIVITAS NON-GAMING PELANGGAN WARNET (SOSMED / YOUTUBE / TUGAS)
const NON_GAME_ACTIVITIES = [
  { id: 'act_fb', title: '📘 Buka Facebook & Chatting', minYear: 2010 },
  { id: 'act_yt', title: '▶️ Nonton YouTube & Musik', minYear: 2010 },
  { id: 'act_tw', title: '🐦 Main Twitter & Kaskus', minYear: 2010 },
  { id: 'act_doc', title: '📄 Ngetik Tugas Word & Browsing', minYear: 2010 },
  { id: 'act_tt', title: '🎵 Scroll TikTok & Reels Web', minYear: 2019 }
];

// LOGISTIK WARNET: POP MIE, MINUMAN DINGIN & AIR GALON (WAJIB UNTUK SEDUH POP MIE/KOPI)
const WARNET_SUPPLY_CATALOG = [
  { id: 'galon_air', kind: 'galon', name: 'Isi Ulang Air Galon Aqua 19 Liter (Untuk 45 Cup Pop Mie/Kopi)', servings: 45, boxPrice2010: 12000, sellPcs2010: 0, needsWater: false, img: makeItemIllus('galon', 'Galon Air 19L', 'Untuk 45 Seduhan') },
  { id: 'sn_popmie_ayam', kind: 'snack', name: 'Pop Mie Rasa Ayam / Baso (1 Dus 24 Cup)', pcsPerBox: 24, boxPrice2010: 62000, sellPcs2010: 4500, needsWater: true, img: makeItemIllus('box', 'Dus Pop Mie', 'Isi 24 Cup • Butuh Air', '#dc2626') },
  { id: 'sn_kopi_goodday', kind: 'snack', name: 'Es Kopi Good Day / Kapal Api (1 Box 30 Sachet)', pcsPerBox: 30, boxPrice2010: 27000, sellPcs2010: 2500, needsWater: true, img: makeItemIllus('box', 'Box Kopi Seduh', '30 Sachet • Butuh Air', '#78350f') },
  { id: 'sn_teh_pucuk', kind: 'snack', name: 'Teh Pucuk Harum Dingin (1 Dus 24 Botol)', pcsPerBox: 24, boxPrice2010: 48000, sellPcs2010: 3500, needsWater: false, img: makeItemIllus('box', 'Dus Teh Pucuk', 'Isi 24 Botol Dingin', '#16a34a') },
  { id: 'sn_extrajoss', kind: 'snack', name: 'Extra Joss / KukuBima Susu Dingin (1 Box 24 Porsi)', pcsPerBox: 24, boxPrice2010: 32000, sellPcs2010: 3000, needsWater: true, img: makeItemIllus('box', 'Box ExtraJoss', 'Isi 24 Porsi • Butuh Air', '#eab308') }
];

const REAL_CONSOLE_PHOTOS = {
  pc_std: makeItemIllus('pc_case', 'PC Client Warnet', 'Tower Rakitan', '#3b82f6'),
  pc_vip: makeItemIllus('pc_case', 'PC Gaming VIP', 'RGB Tempered Glass', '#8b5cf6'),
  mon_std: makeItemIllus('monitor', 'Monitor PC', 'Layar Jernih', '#0284c7')
};

// KATALOG FASILITAS & PERALATAN TAMBAHAN RUKO WARNET (YANG DISETUJUI PEMAIN)
const WARNET_FACILITIES_CATALOG = [
  { id: 'fac_showcase', name: 'Kulkas Showcase Minuman Dingin', basePrice2010: 1850000, desc: 'Minuman dingin lebih laris & harga jual +35% lebih menguntungkan!' },
  { id: 'fac_dispenser', name: 'Dispenser Air Panas & Dingin Otomatis', basePrice2010: 450000, desc: 'Seduh Pop Mie & Kopi jauh lebih cepat (+25% penjualan Pop Mie/Kopi).' },
  { id: 'fac_wifi_router', name: 'Router Hotspot Voucher WiFi Warga/Kos', basePrice2010: 650000, desc: 'Menghasilkan pemasukan pasif harian dari jualan Voucher WiFi tanpa makan slot PC!' },
  { id: 'fac_exhaust', name: 'Exhaust Fan & Pengharum Ruangan Otomatis', basePrice2010: 550000, desc: 'Mengurangi bau rokok/apek & memperlambat penurunan kebersihan ruko hingga 50%.' },
  { id: 'fac_neonbox', name: 'Spanduk & Neon Box Menyala Depan Ruko', basePrice2010: 950000, desc: 'Meningkatkan kedatangan pengunjung baru & rombongan mabar (+30% traffic).' },
  { id: 'fac_stabilizer', name: 'Stabilizer Tegangan & Penangkal Petir Ruko', basePrice2010: 1250000, desc: 'Melindungi seluruh PC 100% dari kerusakan komponen saat hujan deras & petir!' },
  { id: 'fac_deepfreeze', name: 'Lisensi Deep Freeze & Antivirus Semua PC', basePrice2010: 350000, desc: 'Mencegah PC terkena virus flashdisk tamu atau blue screen mendadak.' }
];

// HARGA EMAS ANTAM PER GRAM ASLI INDONESIA (2010 - 2026+)
function getHistoricalGoldPricePerGram(year, daySeed = 1) {
  const table = {
    2010: 385000, 2011: 465000, 2012: 535000, 2013: 515000, 2014: 525000,
    2015: 545000, 2016: 585000, 2017: 615000, 2018: 655000, 2019: 725000,
    2020: 965000, 2021: 935000, 2022: 995000, 2023: 1085000, 2024: 1385000,
    2025: 1520000, 2026: 1650000
  };
  const base = table[year] || (year < 2010 ? 385000 : 1650000 + (year - 2026) * 110000);
  const swing = Math.sin(daySeed * 0.85) * 0.025; // Fluktuasi harian +-2.5%
  return Math.round((base * (1 + swing)) / 1000) * 1000;
}

// KATALOG PROPERTI (RUMAH, APARTEMEN, RUKO PRIBADI)
const PROPERTY_CATALOG = [
  { id: 'prop_subsidi', name: 'Rumah Subsidi Type 36/60', basePrice2010: 95000000, desc: 'Rumah sederhana untuk keluarga baru' },
  { id: 'prop_cluster', name: 'Rumah Minimalis 2 Lantai Type 70', basePrice2010: 260000000, desc: 'Cluster nyaman dekat pusat kota' },
  { id: 'prop_apt', name: 'Apartemen Studio / 2BR City Center', basePrice2010: 380000000, desc: 'Hunian modern strategis' },
  { id: 'prop_mewah', name: 'Rumah Mewah Sultan + Kolam Renang', basePrice2010: 950000000, desc: 'Hunian elit keluarga besar' }
];
