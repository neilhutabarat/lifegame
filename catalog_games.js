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
  { id: 'cpu_e5400', name: 'Intel Pentium Dual-Core E5400 2.7GHz', tier: 1, releaseYear: 2009, basePrice2010: 520000, watt: 65, img: makeItemIllus('cpu', 'Pentium E5400', 'Dual-Core 2.7GHz', '#0284c7') },
  { id: 'cpu_e7500', name: 'Intel Core 2 Duo E7500 2.93GHz', tier: 2, releaseYear: 2009, basePrice2010: 890000, watt: 65, img: makeItemIllus('cpu', 'Core 2 Duo E7500', 'LGA 775 Legend', '#2563eb') },
  { id: 'cpu_athlon250', name: 'AMD Athlon II X2 250 3.0GHz', tier: 2, releaseYear: 2009, basePrice2010: 560000, watt: 65, img: makeItemIllus('cpu', 'Athlon II X2 250', 'Raja Warnet 2010', '#dc2626') },
  { id: 'cpu_i3_2100', name: 'Intel Core i3-2100 Sandy Bridge', tier: 3, releaseYear: 2011, basePrice2010: 1050000, watt: 65, img: makeItemIllus('cpu', 'Core i3-2100', '3.1GHz LGA1155', '#2563eb') },
  { id: 'cpu_fx6300', name: 'AMD FX-6300 Vishera 6-Core', tier: 4, releaseYear: 2012, basePrice2010: 1180000, watt: 95, img: makeItemIllus('cpu', 'AMD FX-6300', '6-Core Warnet', '#ea580c') },
  { id: 'cpu_i5_4460', name: 'Intel Core i5-4460 Haswell', tier: 5, releaseYear: 2014, basePrice2010: 1850000, watt: 84, img: makeItemIllus('cpu', 'Core i5-4460', '4-Core Haswell', '#1d4ed8') },
  { id: 'cpu_i5_7400', name: 'Intel Core i5-7400 Kaby Lake', tier: 6, releaseYear: 2017, basePrice2010: 2100000, watt: 65, img: makeItemIllus('cpu', 'Core i5-7400', 'Kaby Lake Gaming', '#1d4ed8') },
  { id: 'cpu_r5_2600', name: 'AMD Ryzen 5 2600 6C/12T', tier: 7, releaseYear: 2018, basePrice2010: 1950000, watt: 65, img: makeItemIllus('cpu', 'Ryzen 5 2600', '6-Core 12-Thread', '#ea580c') },
  { id: 'cpu_i5_10400f', name: 'Intel Core i5-10400F 6C/12T', tier: 8, releaseYear: 2020, basePrice2010: 1850000, watt: 65, img: makeItemIllus('cpu', 'Core i5-10400F', 'Comet Lake 12T', '#2563eb') },
  { id: 'cpu_r5_5600x', name: 'AMD Ryzen 5 5600X Zen 3', tier: 9, releaseYear: 2020, basePrice2010: 2650000, watt: 65, img: makeItemIllus('cpu', 'Ryzen 5 5600X', 'Esports Beast', '#dc2626') },
  { id: 'cpu_r7_7800x3d', name: 'AMD Ryzen 7 7800X3D 3D V-Cache', tier: 10, releaseYear: 2023, basePrice2010: 4500000, watt: 105, img: makeItemIllus('cpu', 'Ryzen 7 7800X3D', 'Sultan Gaming CPU', '#b91c1c') }
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
  // GAME ONLINE LEGENDARIS WARNET INDONESIA
  ['go_pb', 'online', 'Point Blank (PB Gemscool/Zepetto)', 'FPS Online', 1, 2009, 0, 2.5, 180, true],
  ['go_dn', 'online', 'Dragon Nest INA / SEA', 'Action MMORPG', 2, 2010, 0, 4.5, 420, true],
  ['go_ls', 'online', 'Lost Saga Indonesia', 'Brawler Online', 1, 2011, 0, 1.8, 150, true],
  ['go_ayo', 'online', 'Audition AyoDance (Megaxus)', 'Rhythm Dance', 1, 2007, 0, 3.2, 240, true],
  ['go_rf', 'online', 'RF Online Indonesia (Lyto)', 'Sci-Fi MMORPG', 1, 2007, 0, 2.8, 160, true],
  ['go_atl', 'online', 'Atlantica Online Indonesia', 'Turn-Based MMO', 2, 2010, 0, 5.0, 310, true],
  ['go_cf', 'online', 'CrossFire Indonesia', 'FPS Online', 1, 2009, 0, 2.2, 140, true],
  ['go_cso', 'online', 'Counter-Strike Online (CSO Megaxus)', 'FPS Zombie', 1, 2011, 0, 2.4, 190, true],
  ['go_seal', 'online', 'Seal Online Plus Indonesia', 'Anime MMORPG', 1, 2008, 0, 2.0, 120, true],
  ['go_ro', 'online', 'Ragnarok Online Indonesia', 'MMORPG', 1, 2004, 0, 1.5, 95, true],
  ['go_dota2', 'online', 'Dota 2 (Steam)', 'MOBA 5v5', 3, 2013, 0, 15.0, 650, true],
  ['go_lol', 'online', 'League of Legends Garena', 'MOBA 5v5', 2, 2013, 0, 8.5, 480, true],
  ['go_csgo', 'online', 'Counter-Strike: Global Offensive', 'Esports FPS', 3, 2012, 0, 14.0, 520, true],
  ['go_gtav_rp', 'online', 'GTA V Online / FiveM Roleplay', 'Open World RP', 6, 2015, 350000, 75.0, 950, true],
  ['go_pubg', 'online', 'PUBG: Battlegrounds PC', 'Battle Royale', 7, 2017, 0, 35.0, 850, true],
  ['go_apex', 'online', 'Apex Legends', 'Battle Royale', 7, 2019, 0, 45.0, 900, true],
  ['go_valorant', 'online', 'VALORANT (Riot Games)', 'Tactical FPS', 6, 2020, 0, 28.0, 720, true],
  ['go_genshin', 'online', 'Genshin Impact PC', 'Anime Open World', 7, 2020, 0, 65.0, 1200, false],

  // GAME PC OFFLINE / LAN (BELI KASET DVD INSTALLER PC DI TOKO!)
  ['pc_dota1', 'offline', 'Warcraft III: DotA Allstars v6.67c (LAN)', 'MOBA LAN', 1, 2005, 35000, 1.8, 0, true],
  ['pc_cs16', 'offline', 'Counter-Strike 1.6 + Condition Zero (LAN)', 'FPS LAN', 1, 2004, 30000, 0.9, 0, true],
  ['pc_gtasa', 'offline', 'GTA: San Andreas PC + Mod Indonesia', 'Open World', 1, 2005, 40000, 4.7, 0, false],
  ['pc_l4d2', 'offline', 'Left 4 Dead 2 (Co-op Zombie LAN)', 'Co-op Shooter', 2, 2009, 45000, 7.5, 0, true],
  ['pc_pes2010', 'offline', 'Pro Evolution Soccer 2010 PC', 'Sports', 2, 2009, 45000, 5.5, 0, false],
  ['pc_pes2013', 'offline', 'PES 2013 PC + Patch Liga Indonesia', 'Sports', 2, 2012, 50000, 6.5, 0, false],
  ['pc_nfsmw', 'offline', 'Need for Speed: Most Wanted Black Edition', 'Racing', 1, 2005, 35000, 3.0, 0, false],
  ['pc_ra2', 'offline', 'Command & Conquer: Red Alert 2 Yuri', 'Strategy LAN', 1, 2001, 30000, 1.2, 0, true],
  ['pc_aoe2', 'offline', 'Age of Empires II: The Conquerors', 'Strategy LAN', 1, 2000, 30000, 0.8, 0, true],
  ['pc_pvz', 'offline', 'Plants vs. Zombies + GameHouse Collection', 'Casual', 1, 2009, 25000, 0.6, 0, false],
  ['pc_sims3', 'offline', 'The Sims 3 Complete DVD PC', 'Simulation', 2, 2009, 55000, 6.2, 0, false],
  ['pc_cod_mw2', 'offline', 'Call of Duty: Modern Warfare 2 PC', 'FPS', 2, 2009, 50000, 11.0, 0, true],
  ['pc_skyrim', 'offline', 'The Elder Scrolls V: Skyrim PC DVD', 'Action RPG', 3, 2011, 65000, 9.0, 0, false],
  ['pc_pes2017', 'offline', 'PES 2017 PC + SmokePatch', 'Sports', 4, 2016, 75000, 16.0, 0, false],
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
