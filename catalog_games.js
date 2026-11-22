// ==================== KATALOG 100 GAME PS1 & 100 GAME PS2 TERKENAL DI INDONESIA (+ PS3/PS4/PS5) ====================
// Hanya menampilkan game yang SUDAH RILIS pada tahun berjalan (releaseYear <= state.year).
// Menggunakan cover box art bergaya cetak original dengan fallback foto nyata.

function makeItemIllus(kind, label, sub, accent) {
  accent = accent || '#2563eb';
  var safeL = String(label || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').slice(0, 20);
  var safeS = String(sub || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').slice(0, 24);
  var shape = '';
  if (kind === 'ps1') {
    shape = '<rect x="30" y="28" width="100" height="64" rx="10" fill="#cbd5e1" stroke="#64748b" stroke-width="3"/>' +
      '<circle cx="80" cy="60" r="24" fill="#94a3b8" stroke="#475569" stroke-width="2"/>' +
      '<circle cx="44" cy="78" r="5" fill="#16a34a"/>';
  } else if (kind === 'ps2') {
    shape = '<rect x="24" y="34" width="112" height="50" rx="6" fill="#0f172a" stroke="#2563eb" stroke-width="3"/>' +
      '<line x1="26" y1="48" x2="134" y2="48" stroke="#38bdf8" stroke-width="2.5"/>' +
      '<text x="80" y="72" text-anchor="middle" fill="#38bdf8" font-family="Arial" font-weight="900" font-size="16">PS2</text>';
  } else if (kind === 'ps3') {
    shape = '<path d="M26,78 Q80,26 134,78 L134,90 L26,90 Z" fill="#111827" stroke="#ef4444" stroke-width="2.5"/>' +
      '<text x="80" y="76" text-anchor="middle" fill="#f8fafc" font-family="Arial" font-weight="900" font-size="15">PS3</text>';
  } else if (kind === 'ps4') {
    shape = '<polygon points="32,38 136,38 126,84 22,84" fill="#0f172a" stroke="#0ea5e9" stroke-width="2.5"/>' +
      '<line x1="28" y1="61" x2="131" y2="61" stroke="#38bdf8" stroke-width="3"/>' +
      '<text x="80" y="56" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="900" font-size="14">PS4</text>';
  } else if (kind === 'ps5') {
    shape = '<path d="M54,20 Q80,28 106,20 L100,92 L60,92 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/>' +
      '<rect x="68" y="24" width="24" height="66" rx="5" fill="#0f172a"/>' +
      '<line x1="67" y1="28" x2="67" y2="84" stroke="#38bdf8" stroke-width="2"/>' +
      '<line x1="93" y1="28" x2="93" y2="84" stroke="#38bdf8" stroke-width="2"/>';
  } else if (kind === 'tv_crt') {
    shape = '<rect x="28" y="22" width="104" height="70" rx="10" fill="#334155" stroke="#64748b" stroke-width="3"/>' +
      '<rect x="38" y="30" width="84" height="50" rx="8" fill="#0ea5e9"/>';
  } else if (kind === 'tv_led') {
    shape = '<rect x="20" y="24" width="120" height="62" rx="5" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5"/>' +
      '<rect x="25" y="29" width="110" height="52" fill="#0284c7"/>' +
      '<rect x="68" y="86" width="24" height="6" fill="#64748b"/>';
  } else if (kind === 'stik') {
    shape = '<path d="M40,48 Q80,38 120,48 L128,78 Q114,92 100,74 L60,74 Q46,92 32,78 Z" fill="' + accent + '" stroke="#e2e8f0" stroke-width="2.5"/>' +
      '<circle cx="54" cy="60" r="6" fill="#0f172a"/><circle cx="106" cy="60" r="6" fill="#0f172a"/>';
  } else if (kind === 'mc') {
    shape = '<rect x="52" y="24" width="56" height="68" rx="6" fill="' + accent + '" stroke="#94a3b8" stroke-width="2.5"/>' +
      '<rect x="60" y="32" width="40" height="22" rx="3" fill="#e2e8f0"/>';
  } else if (kind === 'fan') {
    shape = '<circle cx="80" cy="56" r="28" fill="rgba(56,189,248,0.2)" stroke="#94a3b8" stroke-width="2.5"/>' +
      '<line x1="80" y1="30" x2="80" y2="82" stroke="#38bdf8" stroke-width="5"/>' +
      '<line x1="54" y1="56" x2="106" y2="56" stroke="#38bdf8" stroke-width="5"/>';
  } else if (kind === 'ac') {
    shape = '<rect x="22" y="36" width="116" height="38" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="2.5"/>' +
      '<line x1="30" y1="66" x2="130" y2="66" stroke="#0ea5e9" stroke-width="3"/>';
  } else if (kind === 'box') {
    shape = '<rect x="34" y="28" width="92" height="60" rx="8" fill="#d97706" stroke="#fcd34d" stroke-width="2.5"/>' +
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

const REAL_CONSOLE_PHOTOS = {
  ps1_fat: makeItemIllus('ps1', 'PS1 Original', 'CD Fisik'),
  ps1_one: makeItemIllus('ps1', 'PSOne Slim', 'CD Fisik'),
  ps2_fat: makeItemIllus('ps2', 'PS2 Fat', 'DVD Fisik'),
  ps2_slim: makeItemIllus('ps2', 'PS2 Slim', 'DVD Fisik'),
  ps3_fat: makeItemIllus('ps3', 'PS3 Fat', 'Blu-Ray'),
  ps3_slim: makeItemIllus('ps3', 'PS3 Slim', 'Fisik / Digital'),
  ps3_sslim: makeItemIllus('ps3', 'PS3 SuperSlim', 'Digital 500GB'),
  ps4_fat: makeItemIllus('ps4', 'PS4 Fat', '500GB'),
  ps4_slim: makeItemIllus('ps4', 'PS4 Slim', 'Fisik / Digital'),
  ps4_pro: makeItemIllus('ps4', 'PS4 Pro 4K', 'Digital 2TB'),
  ps5_disc: makeItemIllus('ps5', 'PS5 Disc', 'Kaset BD'),
  ps5_dig: makeItemIllus('ps5', 'PS5 Digital', 'SSD Internal'),
  stik_ps1: makeItemIllus('stik', 'Stik PS1', 'Analog Ori', '#64748b'),
  stik_ps2: makeItemIllus('stik', 'Stik PS2', 'DualShock 2', '#1e293b'),
  stik_ps3: makeItemIllus('stik', 'Stik PS3', 'Wireless', '#991b1b'),
  stik_ps4: makeItemIllus('stik', 'Stik PS4', 'DualShock 4', '#1d4ed8'),
  stik_ps5: makeItemIllus('stik', 'Stik PS5', 'DualSense', '#475569'),
  mc_ps1: makeItemIllus('mc', 'MemCard PS1', '1MB Save', '#475569'),
  mc_ps2: makeItemIllus('mc', 'MemCard PS2', '8MB MagicGate', '#0f172a'),
  tv_crt: makeItemIllus('tv_crt', 'TV Tabung', 'CRT Klasik'),
  tv_lcd: makeItemIllus('tv_led', 'TV LCD HD', 'HDMI Ready'),
  tv_led: makeItemIllus('tv_led', 'TV LED/OLED', 'Full HD / 4K'),
  fan: makeItemIllus('fan', 'Kipas Angin', 'Anti Gerah'),
  ac: makeItemIllus('ac', 'AC Split', 'Dingin Sejuk'),
  indomie: makeItemIllus('box', 'Dus Indomie', 'Isi 40 Bks'),
  snack: makeItemIllus('box', 'Dus Snack', 'Grosir Agen'),
  drink: makeItemIllus('box', 'Dus Minuman', 'Grosir Agen')
};

const PS1_100_NAMES = [
  ['we2002', 'Winning Eleven 2002 (WE6)', 'Sports', 98, 2002],
  ['ctr', 'Crash Team Racing (CTR)', 'Racing', 97, 1999],
  ['pepsiman', 'Pepsiman', 'Action', 95, 1999],
  ['bishi_bashi', 'Bishi Bashi Special', 'Party', 96, 2000],
  ['tekken3', 'Tekken 3', 'Fighting', 97, 1998],
  ['hm_btn', 'Harvest Moon: Back to Nature', 'Simulation', 96, 1999],
  ['nascar_rumble', 'NASCAR Rumble', 'Racing', 96, 2000],
  ['vigilante8_2', 'Vigilante 8: 2nd Offense', 'Vehicular Combat', 94, 1999],
  ['metal_slug_x', 'Metal Slug X', 'Action', 95, 2001],
  ['re3_nemesis', 'Resident Evil 3: Nemesis', 'Survival Horror', 94, 1999],
  ['re2', 'Resident Evil 2 Dual Shock', 'Survival Horror', 93, 1998],
  ['re1_dc', 'Resident Evil: Director\'s Cut', 'Survival Horror', 90, 1997],
  ['dino_crisis2', 'Dino Crisis 2', 'Action', 93, 2000],
  ['dino_crisis1', 'Dino Crisis', 'Survival Horror', 90, 1999],
  ['crash_bandicoot3', 'Crash Bandicoot: Warped', 'Platformer', 94, 1998],
  ['crash_bandicoot2', 'Crash Bandicoot 2: Cortex Strikes Back', 'Platformer', 92, 1997],
  ['crash_bandicoot1', 'Crash Bandicoot', 'Platformer', 91, 1996],
  ['crash_bash', 'Crash Bash', 'Party', 95, 2000],
  ['road_rash_jailbreak', 'Road Rash: Jailbreak', 'Racing', 94, 2000],
  ['road_rash_3d', 'Road Rash 3D', 'Racing', 90, 1998],
  ['twisted_metal4', 'Twisted Metal 4', 'Vehicular Combat', 93, 1999],
  ['twisted_metal2', 'Twisted Metal 2', 'Vehicular Combat', 92, 1996],
  ['twisted_metal3', 'Twisted Metal III', 'Vehicular Combat', 89, 1998],
  ['yugioh_fm', 'Yu-Gi-Oh! Forbidden Memories', 'Card Battle', 95, 1999],
  ['digimon_world1', 'Digimon World', 'RPG', 92, 1999],
  ['digimon_world2', 'Digimon World 2', 'RPG', 89, 2000],
  ['digimon_world3', 'Digimon World 3', 'RPG', 93, 2002],
  ['digimon_rumble', 'Digimon Rumble Arena', 'Fighting', 95, 2001],
  ['suikoden2', 'Suikoden II', 'RPG', 94, 1998],
  ['suikoden1', 'Suikoden', 'RPG', 89, 1995],
  ['ff7', 'Final Fantasy VII', 'RPG', 95, 1997],
  ['ff8', 'Final Fantasy VIII', 'RPG', 94, 1999],
  ['ff9', 'Final Fantasy IX', 'RPG', 93, 2000],
  ['fft', 'Final Fantasy Tactics', 'Strategy RPG', 91, 1997],
  ['chrono_cross', 'Chrono Cross', 'RPG', 92, 1999],
  ['legend_of_dragoon', 'The Legend of Dragoon', 'RPG', 92, 1999],
  ['legend_of_legaia', 'Legend of Legaia', 'RPG', 91, 1998],
  ['breath_of_fire4', 'Breath of Fire IV', 'RPG', 90, 2000],
  ['breath_of_fire3', 'Breath of Fire III', 'RPG', 88, 1997],
  ['brigandine', 'Brigandine: The Legend of Forsena', 'Strategy', 91, 1998],
  ['front_mission3', 'Front Mission 3', 'Strategy RPG', 91, 1999],
  ['gran_turismo2', 'Gran Turismo 2', 'Racing', 94, 1999],
  ['gran_turismo1', 'Gran Turismo', 'Racing', 91, 1997],
  ['ridge_racer_t4', 'R4: Ridge Racer Type 4', 'Racing', 89, 1998],
  ['nfs_high_stakes', 'Need for Speed: High Stakes', 'Racing', 90, 1999],
  ['nfs_porsche', 'Need for Speed: Porsche Unleashed', 'Racing', 89, 2000],
  ['nfs3_hot_pursuit', 'Need for Speed III: Hot Pursuit', 'Racing', 91, 1998],
  ['tony_hawk2', 'Tony Hawk\'s Pro Skater 2', 'Sports', 93, 2000],
  ['tony_hawk3', 'Tony Hawk\'s Pro Skater 3', 'Sports', 91, 2001],
  ['3xtreme', '3Xtreme (Sepeda/Skate Ekstrem)', 'Sports', 93, 1999],
  ['2xtreme', '2Xtreme', 'Sports', 89, 1996],
  ['wwe_smackdown2', 'WWF SmackDown! 2: Know Your Role', 'Fighting', 96, 2000],
  ['wwe_smackdown1', 'WWF SmackDown!', 'Fighting', 92, 2000],
  ['bloody_roar2', 'Bloody Roar II', 'Fighting', 95, 1999],
  ['bloody_roar1', 'Bloody Roar', 'Fighting', 89, 1997],
  ['marvel_vs_capcom', 'Marvel vs. Capcom: Clash of Super Heroes', 'Fighting', 94, 1999],
  ['street_fighter_alpha3', 'Street Fighter Alpha 3', 'Fighting', 92, 1998],
  ['rival_schools', 'Rival Schools: United by Fate', 'Fighting', 90, 1998],
  ['soul_blade', 'Soul Blade (Soul Edge)', 'Fighting', 89, 1996],
  ['mortal_kombat_trilogy', 'Mortal Kombat Trilogy', 'Fighting', 91, 1996],
  ['mortal_kombat4', 'Mortal Kombat 4', 'Fighting', 89, 1998],
  ['dragon_ball_gt', 'Dragon Ball GT: Final Bout', 'Fighting', 92, 1997],
  ['kamen_rider_kuuga', 'Kamen Rider Kuuga', 'Fighting', 91, 2000],
  ['kamen_rider_agito', 'Kamen Rider Agito', 'Fighting', 90, 2001],
  ['kamen_rider_ryuki', 'Kamen Rider Ryuki', 'Fighting', 92, 2002],
  ['ultraman_fighting_evo', 'Ultraman Fighting Evolution', 'Fighting', 91, 1998],
  ['powerrangers_lightspeed', 'Power Rangers Lightspeed Rescue', 'Action', 88, 2000],
  ['jackie_chan_stuntmaster', 'Jackie Chan Stuntmaster', 'Action', 94, 2000],
  ['fighting_force', 'Fighting Force', 'Beat em up', 92, 1997],
  ['captain_commando', 'Captain Commando', 'Beat em up', 93, 1998],
  ['warrior_of_fate', 'Warriors of Fate (Sangokushi II)', 'Beat em up', 91, 1996],
  ['castlevania_sotn', 'Castlevania: Symphony of the Night', 'Action RPG', 94, 1997],
  ['megaman_x4', 'Mega Man X4', 'Action', 92, 1997],
  ['megaman_x5', 'Mega Man X5', 'Action', 91, 2000],
  ['megaman_x6', 'Mega Man X6', 'Action', 90, 2001],
  ['megaman_legends2', 'Mega Man Legends 2', 'Action RPG', 89, 2000],
  ['metal_gear_solid', 'Metal Gear Solid', 'Stealth Action', 95, 1998],
  ['syphon_filter2', 'Syphon Filter 2', 'Shooter', 92, 2000],
  ['syphon_filter3', 'Syphon Filter 3', 'Shooter', 91, 2001],
  ['medal_of_honor', 'Medal of Honor', 'FPS', 92, 1999],
  ['medal_of_honor_ug', 'Medal of Honor: Underground', 'FPS', 91, 2000],
  ['time_crisis', 'Time Crisis', 'Arcade Shooter', 91, 1997],
  ['point_blank3', 'Point Blank 3', 'Arcade Shooter', 90, 2000],
  ['silent_hill1', 'Silent Hill', 'Survival Horror', 93, 1999],
  ['parasite_eve2', 'Parasite Eve II', 'Survival Horror', 91, 1999],
  ['tenchu2', 'Tenchu 2: Birth of the Stealth Assassins', 'Stealth Action', 93, 2000],
  ['tenchu1', 'Tenchu: Stealth Assassins', 'Stealth Action', 91, 1998],
  ['tomb_raider2', 'Tomb Raider II', 'Action Adventure', 90, 1997],
  ['tomb_raider4', 'Tomb Raider: The Last Revelation', 'Action Adventure', 89, 1999],
  ['spiderman1', 'Spider-Man (2000)', 'Action', 94, 2000],
  ['spiderman2_enter', 'Spider-Man 2: Enter Electro', 'Action', 92, 2001],
  ['tarzan_ps1', 'Disney\'s Tarzan', 'Platformer', 91, 1999],
  ['hercules_ps1', 'Disney\'s Hercules Action Game', 'Platformer', 92, 1997],
  ['toy_story2', 'Toy Story 2: Buzz Lightyear to the Rescue', 'Platformer', 91, 1999],
  ['klonoa', 'Klonoa: Door to Phantomile', 'Platformer', 90, 1997],
  ['spyro3', 'Spyro: Year of the Dragon', 'Platformer', 91, 2000],
  ['ace_combat3', 'Ace Combat 3: Electrosphere', 'Flight Action', 90, 1999],
  ['driver2', 'Driver 2: Back on the Streets', 'Action Driving', 92, 2000],
  ['gta2_ps1', 'Grand Theft Auto 2 (GTA 2)', 'Action', 91, 1999],
  ['super_shot_soccer', 'Super Shot Soccer (Bola Jurus Negara)', 'Sports', 96, 2002]
];

const PS2_100_NAMES = [
  ['gta_sa', 'Grand Theft Auto: San Andreas', 'Open World', 100, 2004],
  ['we10_pes', 'Winning Eleven 10 / PES Liga Indonesia', 'Sports', 100, 2006],
  ['pes_2013_ps2', 'Pro Evolution Soccer (PES) Update', 'Sports', 99, 2010],
  ['downhill', 'Downhill Domination', 'Racing', 99, 2003],
  ['smackdown_pain', 'WWE SmackDown! Here Comes the Pain', 'Fighting', 98, 2003],
  ['smackdown_svr2007', 'WWE SmackDown vs. Raw 2007', 'Fighting', 97, 2006],
  ['god_of_war2', 'God of War II', 'Action', 98, 2007],
  ['god_of_war1', 'God of War', 'Action', 97, 2005],
  ['re4_ps2', 'Resident Evil 4', 'Action Horror', 98, 2005],
  ['guitar_hero3', 'Guitar Hero III: Legends of Rock', 'Rhythm', 98, 2007],
  ['guitar_hero2', 'Guitar Hero II (Koplo/Indo Edition)', 'Rhythm', 97, 2006],
  ['bully_ps2', 'Bully', 'Open World', 98, 2006],
  ['the_warriors', 'The Warriors', 'Beat em up', 97, 2005],
  ['mortal_kombat_sm', 'Mortal Kombat: Shaolin Monks', 'Action Co-op', 98, 2005],
  ['def_jam_ffny', 'Def Jam: Fight for NY', 'Fighting', 98, 2004],
  ['black_ps2', 'BLACK', 'FPS', 97, 2006],
  ['nfs_most_wanted', 'Need for Speed: Most Wanted', 'Racing', 98, 2005],
  ['nfs_underground2', 'Need for Speed: Underground 2', 'Racing', 97, 2004],
  ['nfs_carbon', 'Need for Speed: Carbon', 'Racing', 94, 2006],
  ['burnout3', 'Burnout 3: Takedown', 'Racing', 96, 2004],
  ['burnout_revenge', 'Burnout Revenge', 'Racing', 95, 2005],
  ['rumble_racing', 'Rumble Racing', 'Racing', 98, 2001],
  ['gran_turismo4', 'Gran Turismo 4', 'Racing', 96, 2004],
  ['midnight_club3', 'Midnight Club 3: DUB Edition Remix', 'Racing', 95, 2005],
  ['tekken5', 'Tekken 5', 'Fighting', 98, 2005],
  ['tekken4', 'Tekken 4', 'Fighting', 92, 2002],
  ['tekken_tag', 'Tekken Tag Tournament', 'Fighting', 93, 2000],
  ['dbz_bt3', 'Dragon Ball Z: Budokai Tenkaichi 3', 'Fighting', 98, 2007],
  ['dbz_bt2', 'Dragon Ball Z: Budokai Tenkaichi 2', 'Fighting', 94, 2006],
  ['naruto_un5', 'Naruto Shippuden: Ultimate Ninja 5', 'Fighting', 97, 2007],
  ['naruto_un3', 'Naruto: Ultimate Ninja 3', 'Fighting', 94, 2005],
  ['naruto_uzumaki2', 'Naruto: Uzumaki Chronicles 2', 'Action', 92, 2006],
  ['dynasty_warriors5', 'Dynasty Warriors 5', 'Hack & Slash', 96, 2005],
  ['dynasty_warriors6', 'Dynasty Warriors 6', 'Hack & Slash', 95, 2008],
  ['samurai_warriors2', 'Samurai Warriors 2', 'Hack & Slash', 94, 2006],
  ['warriors_orochi2', 'Warriors Orochi 2', 'Hack & Slash', 96, 2008],
  ['basara2_heroes', 'Sengoku Basara 2 Heroes', 'Hack & Slash', 98, 2007],
  ['dmc3_se', 'Devil May Cry 3: Special Edition', 'Action', 96, 2006],
  ['dmc1', 'Devil May Cry', 'Action', 93, 2001],
  ['onimusha3', 'Onimusha 3: Demon Siege', 'Action', 93, 2004],
  ['onimusha_dawn', 'Onimusha: Dawn of Dreams', 'Action', 92, 2006],
  ['god_hand', 'God Hand', 'Beat em up', 97, 2006],
  ['urban_reign', 'Urban Reign', 'Beat em up', 96, 2005],
  ['metal_slug_anthology', 'Metal Slug Anthology', 'Action Co-op', 95, 2007],
  ['contra_shattered', 'Contra: Shattered Soldier', 'Action Co-op', 92, 2002],
  ['mgs3_snake_eater', 'Metal Gear Solid 3: Snake Eater', 'Stealth Action', 96, 2004],
  ['mgs2_sons', 'Metal Gear Solid 2: Sons of Liberty', 'Stealth Action', 94, 2001],
  ['splinter_cell_ct', 'Tom Clancy\'s Splinter Cell: Chaos Theory', 'Stealth', 91, 2005],
  ['hitman_blood_money', 'Hitman: Blood Money', 'Stealth', 93, 2006],
  ['gta_vice_city', 'Grand Theft Auto: Vice City', 'Open World', 96, 2002],
  ['gta3', 'Grand Theft Auto III', 'Open World', 93, 2001],
  ['gta_lcs', 'Grand Theft Auto: Liberty City Stories', 'Open World', 93, 2006],
  ['gta_vcs', 'Grand Theft Auto: Vice City Stories', 'Open World', 93, 2007],
  ['true_crime_ny', 'True Crime: New York City', 'Open World', 90, 2005],
  ['gun_ps2', 'GUN (Koboi Open World)', 'Action', 91, 2005],
  ['red_dead_revolver', 'Red Dead Revolver', 'Action', 90, 2004],
  ['shadow_of_rome', 'Shadow of Rome', 'Action', 91, 2005],
  ['spartan_total_warrior', 'Spartan: Total Warrior', 'Hack & Slash', 91, 2005],
  ['shadow_of_colossus', 'Shadow of the Colossus', 'Adventure', 95, 2005],
  ['ico_ps2', 'ICO', 'Adventure', 90, 2001],
  ['okami_ps2', 'Okami', 'Action Adventure', 91, 2006],
  ['kingdom_hearts2', 'Kingdom Hearts II', 'Action RPG', 95, 2005],
  ['kingdom_hearts1', 'Kingdom Hearts', 'Action RPG', 93, 2002],
  ['ff10', 'Final Fantasy X', 'RPG', 96, 2001],
  ['ff12', 'Final Fantasy XII', 'RPG', 95, 2006],
  ['persona4', 'Persona 4', 'RPG', 94, 2008],
  ['persona3_fes', 'Persona 3 FES', 'RPG', 93, 2007],
  ['dragon_quest8', 'Dragon Quest VIII: Journey of the Cursed King', 'RPG', 93, 2004],
  ['suikoden5', 'Suikoden V', 'RPG', 92, 2006],
  ['dark_cloud2', 'Dark Cloud 2 (Dark Chronicle)', 'Action RPG', 90, 2002],
  ['hm_save_homeland', 'Harvest Moon: Save the Homeland', 'Simulation', 93, 2001],
  ['hm_wonderful_life', 'Harvest Moon: A Wonderful Life SE', 'Simulation', 95, 2004],
  ['sims2_ps2', 'The Sims 2 (Co-op Split Screen)', 'Simulation', 94, 2005],
  ['sims_bustin_out', 'The Sims Bustin\' Out', 'Simulation', 92, 2003],
  ['urbz_sims', 'The Urbz: Sims in the City', 'Simulation', 91, 2004],
  ['monster_hunter_dos', 'Monster Hunter 2 (Dos)', 'Action RPG', 92, 2006],
  ['silent_hill2', 'Silent Hill 2', 'Survival Horror', 95, 2001],
  ['silent_hill3', 'Silent Hill 3', 'Survival Horror', 93, 2003],
  ['fatal_frame2', 'Fatal Frame II: Crimson Butterfly', 'Survival Horror', 95, 2003],
  ['fatal_frame3', 'Fatal Frame III: The Tormented', 'Survival Horror', 93, 2005],
  ['resident_evil_outbreak2', 'Resident Evil Outbreak: File #2', 'Survival Horror', 91, 2004],
  ['kuon_ps2', 'Kuon', 'Survival Horror', 89, 2004],
  ['siren_ps2', 'Forbidden Siren', 'Survival Horror', 89, 2003],
  ['clock_tower3', 'Clock Tower 3', 'Survival Horror', 89, 2002],
  ['medal_of_honor_frontline', 'Medal of Honor: Frontline', 'FPS', 93, 2002],
  ['medal_of_honor_vanguard', 'Medal of Honor: Vanguard', 'FPS', 92, 2007],
  ['cod3_ps2', 'Call of Duty 3', 'FPS', 93, 2006],
  ['cod_world_at_war_ff', 'Call of Duty: World at War – Final Fronts', 'FPS', 92, 2008],
  ['killzone_ps2', 'Killzone', 'FPS', 92, 2004],
  ['timesplitters_fp', 'TimeSplitters: Future Perfect', 'FPS Co-op', 93, 2005],
  ['ace_combat5', 'Ace Combat 5: The Unsung War', 'Flight Action', 93, 2004],
  ['ace_combat_zero', 'Ace Combat Zero: The Belkan War', 'Flight Action', 93, 2006],
  ['tony_hawk_ug2', 'Tony Hawk\'s Underground 2', 'Sports', 92, 2004],
  ['ssx_tricky', 'SSX Tricky', 'Sports', 93, 2001],
  ['fifa_street2', 'FIFA Street 2', 'Sports', 96, 2006],
  ['nba_street_v2', 'NBA Street Vol. 2', 'Sports', 94, 2003],
  ['ultramannexus', 'Ultraman Fighting Evolution 3', 'Fighting', 96, 2004],
  ['Ultraman_rebirth', 'Ultraman Fighting Evolution Rebirth', 'Fighting', 95, 2005],
  ['digimon_rumble2', 'Digimon Rumble Arena 2', 'Fighting', 95, 2004],
  ['spiderman2_ps2', 'Spider-Man 2', 'Action Open World', 94, 2004]
];

const PS3_50_LIST = [
  ['ps3_pes2010', 'Pro Evolution Soccer 2010', 'Sports', 96, 2009, 320000, 10],
  ['ps3_gow3', 'God of War III', 'Action', 97, 2010, 420000, 20],
  ['ps3_uncharted2', 'Uncharted 2: Among Thieves', 'Action', 95, 2009, 380000, 16],
  ['ps3_rdr', 'Red Dead Redemption', 'Open World', 96, 2010, 420000, 15],
  ['ps3_uncharted3', 'Uncharted 3: Drake\'s Deception', 'Action', 96, 2011, 420000, 20],
  ['ps3_pes2013', 'Pro Evolution Soccer 2013 (PES 2013 Legend)', 'Sports', 100, 2012, 350000, 12],
  ['ps3_cod_bo2', 'Call of Duty: Black Ops II', 'FPS', 97, 2012, 450000, 14],
  ['ps3_tekken_ttt2', 'Tekken Tag Tournament 2', 'Fighting', 96, 2012, 400000, 15],
  ['ps3_gtav', 'Grand Theft Auto V (GTA 5)', 'Open World', 100, 2013, 550000, 18],
  ['ps3_tlou', 'The Last of Us', 'Action Adventure', 98, 2013, 480000, 24],
  ['ps3_naruto_storm3', 'Naruto Shippuden: Ultimate Ninja Storm 3', 'Fighting', 95, 2013, 400000, 12],
  ['ps3_gt6', 'Gran Turismo 6', 'Racing', 94, 2013, 420000, 16],
  ['ps3_gta4', 'Grand Theft Auto IV', 'Open World', 96, 2008, 350000, 14],
  ['ps3_fifa14', 'FIFA 14 World Cup', 'Sports', 95, 2013, 380000, 11],
  ['ps3_pes2016', 'Pro Evolution Soccer 2016', 'Sports', 96, 2015, 400000, 12],
  ['ps3_pes2018', 'Pro Evolution Soccer 2018', 'Sports', 97, 2017, 420000, 13],
  ['ps3_cod_mw3', 'Call of Duty: Modern Warfare 3', 'FPS', 95, 2011, 420000, 14],
  ['ps3_cod_bo1', 'Call of Duty: Black Ops', 'FPS', 95, 2010, 400000, 14],
  ['ps3_bf3', 'Battlefield 3', 'FPS', 93, 2011, 390000, 15],
  ['ps3_bf4', 'Battlefield 4', 'FPS', 94, 2013, 420000, 16],
  ['ps3_ac2', 'Assassin\'s Creed II', 'Action', 94, 2009, 340000, 12],
  ['ps3_ac_bf', 'Assassin\'s Creed IV: Black Flag', 'Action', 95, 2013, 440000, 15],
  ['ps3_arkham_city', 'Batman: Arkham City', 'Action', 95, 2011, 400000, 14],
  ['ps3_mgs4', 'Metal Gear Solid 4: Guns of the Patriots', 'Stealth', 96, 2008, 420000, 30],
  ['ps3_mgsv', 'Metal Gear Solid V: The Phantom Pain', 'Stealth', 96, 2015, 480000, 26],
  ['ps3_skyrim', 'The Elder Scrolls V: Skyrim', 'RPG', 95, 2011, 420000, 12],
  ['ps3_dark_souls', 'Dark Souls', 'Action RPG', 94, 2011, 400000, 10],
  ['ps3_dmc4', 'Devil May Cry 4', 'Action', 93, 2008, 350000, 12],
  ['ps3_tekken6', 'Tekken 6', 'Fighting', 95, 2009, 380000, 12],
  ['ps3_sf4', 'Ultra Street Fighter IV', 'Fighting', 93, 2014, 390000, 15],
  ['ps3_mk9', 'Mortal Kombat (2011)', 'Fighting', 95, 2011, 400000, 13],
  ['ps3_injustice', 'Injustice: Gods Among Us', 'Fighting', 92, 2013, 390000, 12],
  ['ps3_dbz_xv', 'Dragon Ball Xenoverse', 'Fighting', 93, 2015, 420000, 11],
  ['ps3_naruto_rev', 'Naruto Shippuden: Storm Revolution', 'Fighting', 94, 2014, 410000, 12],
  ['ps3_sengoku_basara4', 'Sengoku Basara 4 Sumeragi', 'Hack & Slash', 94, 2015, 430000, 18],
  ['ps3_dw8', 'Dynasty Warriors 8: Xtreme Legends', 'Hack & Slash', 93, 2013, 410000, 20],
  ['ps3_nfs_mw2012', 'Need for Speed: Most Wanted (2012)', 'Racing', 94, 2012, 400000, 10],
  ['ps3_nfs_rivals', 'Need for Speed: Rivals', 'Racing', 93, 2013, 420000, 11],
  ['ps3_blur', 'Blur (Racing Power-Up)', 'Racing', 94, 2010, 360000, 9],
  ['ps3_burnout_para', 'Burnout Paradise', 'Racing', 93, 2008, 340000, 8],
  ['ps3_gt5', 'Gran Turismo 5', 'Racing', 93, 2010, 400000, 15],
  ['ps3_motorstorm', 'MotorStorm: Apocalypse', 'Racing', 91, 2011, 350000, 14],
  ['ps3_wwe2k14', 'WWE 2K14', 'Fighting', 94, 2013, 410000, 13],
  ['ps3_nba2k14', 'NBA 2K14', 'Sports', 93, 2013, 390000, 12],
  ['ps3_re5', 'Resident Evil 5 Gold Edition', 'Action Horror', 94, 2009, 360000, 13],
  ['ps3_re6', 'Resident Evil 6', 'Action Horror', 93, 2012, 410000, 16],
  ['ps3_tomb_raider', 'Tomb Raider (2013)', 'Adventure', 94, 2013, 420000, 14],
  ['ps3_far_cry3', 'Far Cry 3', 'FPS', 95, 2012, 410000, 11],
  ['ps3_watch_dogs', 'Watch Dogs', 'Open World', 92, 2014, 430000, 18],
  ['ps3_minecraft', 'Minecraft: PlayStation 3 Edition', 'Sandbox', 95, 2013, 320000, 2]
];

const PS4_50_LIST = [
  ['ps4_gtav', 'Grand Theft Auto V Premium Edition', 'Open World', 99, 2014, 550000, 65],
  ['ps4_naruto_storm4', 'Naruto Shippuden: Ultimate Ninja Storm 4', 'Fighting', 97, 2016, 480000, 35],
  ['ps4_pes2018', 'Pro Evolution Soccer 2018', 'Sports', 98, 2017, 450000, 32],
  ['ps4_tekken7', 'Tekken 7', 'Fighting', 97, 2017, 550000, 42],
  ['ps4_rdr2', 'Red Dead Redemption 2', 'Open World', 99, 2018, 749000, 105],
  ['ps4_gow2018', 'God of War (2018)', 'Action', 98, 2018, 599000, 45],
  ['ps4_spiderman', 'Marvel\'s Spider-Man', 'Action', 98, 2018, 599000, 50],
  ['ps4_mk11', 'Mortal Kombat 11', 'Fighting', 96, 2019, 590000, 48],
  ['ps4_re2_remake', 'Resident Evil 2 Remake', 'Horror', 96, 2019, 550000, 28],
  ['ps4_pes2021', 'eFootball PES 2021 Season Update', 'Sports', 100, 2020, 490000, 40],
  ['ps4_ghost_tsushima', 'Ghost of Tsushima', 'Open World', 98, 2020, 699000, 55],
  ['ps4_fc24', 'EA Sports FC 24', 'Sports', 99, 2023, 750000, 45],
  ['ps4_fc25', 'EA Sports FC 25', 'Sports', 99, 2024, 799000, 48],
  ['ps4_fifa23', 'FIFA 23', 'Sports', 97, 2022, 650000, 44],
  ['ps4_fifa22', 'FIFA 22', 'Sports', 96, 2021, 590000, 42],
  ['ps4_pes2020', 'eFootball PES 2020', 'Sports', 98, 2019, 490000, 38],
  ['ps4_tlou2', 'The Last of Us Part II', 'Action', 97, 2020, 699000, 78],
  ['ps4_tlou_rem', 'The Last of Us Remastered', 'Action', 96, 2014, 420000, 45],
  ['ps4_uncharted4', 'Uncharted 4: A Thief\'s End', 'Action', 97, 2016, 480000, 52],
  ['ps4_horizon', 'Horizon Zero Dawn Complete Edition', 'Action RPG', 96, 2017, 450000, 48],
  ['ps4_days_gone', 'Days Gone', 'Open World', 94, 2019, 520000, 60],
  ['ps4_witcher3', 'The Witcher 3: Wild Hunt', 'RPG', 98, 2015, 520000, 55],
  ['ps4_bloodborne', 'Bloodborne', 'Action RPG', 96, 2015, 450000, 35],
  ['ps4_sekiro', 'Sekiro: Shadows Die Twice', 'Action', 97, 2019, 650000, 22],
  ['ps4_elden_ring', 'Elden Ring', 'Action RPG', 98, 2022, 749000, 50],
  ['ps4_gow_rag', 'God of War Ragnarök', 'Action', 98, 2022, 799000, 95],
  ['ps4_miles', 'Spider-Man: Miles Morales', 'Action', 96, 2020, 629000, 52],
  ['ps4_re3_rem', 'Resident Evil 3 Remake', 'Horror', 94, 2020, 550000, 26],
  ['ps4_re4_rem', 'Resident Evil 4 Remake', 'Action Horror', 97, 2023, 749000, 58],
  ['ps4_re7', 'Resident Evil 7: Biohazard', 'Horror', 95, 2017, 450000, 25],
  ['ps4_re8', 'Resident Evil Village', 'Horror', 96, 2021, 650000, 38],
  ['ps4_dmc5', 'Devil May Cry 5', 'Action', 96, 2019, 550000, 36],
  ['ps4_mhw', 'Monster Hunter: World Iceborne', 'Action RPG', 96, 2018, 550000, 48],
  ['ps4_cod_mw', 'Call of Duty: Modern Warfare (2019)', 'FPS', 96, 2019, 690000, 95],
  ['ps4_cod_bo3', 'Call of Duty: Black Ops III', 'FPS', 95, 2015, 520000, 55],
  ['ps4_bf1', 'Battlefield 1', 'FPS', 94, 2016, 480000, 50],
  ['ps4_bf5', 'Battlefield V', 'FPS', 93, 2018, 520000, 55],
  ['ps4_ac_odyssey', 'Assassin\'s Creed Odyssey', 'Action RPG', 94, 2018, 550000, 52],
  ['ps4_ac_valhalla', 'Assassin\'s Creed Valhalla', 'Action RPG', 94, 2020, 650000, 65],
  ['ps4_nfs_heat', 'Need for Speed Heat', 'Racing', 95, 2019, 550000, 35],
  ['ps4_gt_sport', 'Gran Turismo Sport', 'Racing', 94, 2017, 480000, 60],
  ['ps4_ctr_nf', 'Crash Team Racing Nitro-Fueled', 'Racing', 96, 2019, 490000, 18],
  ['ps4_itt', 'It Takes Two (Co-op 2P)', 'Adventure', 98, 2021, 550000, 38],
  ['ps4_way_out', 'A Way Out (Co-op 2P)', 'Action', 96, 2018, 420000, 22],
  ['ps4_overcooked2', 'Overcooked! 2 (Party)', 'Party', 95, 2018, 350000, 8],
  ['ps4_wwe2k23', 'WWE 2K23', 'Fighting', 94, 2023, 690000, 55],
  ['ps4_nba2k24', 'NBA 2K24', 'Sports', 94, 2023, 690000, 62],
  ['ps4_dbz_kakarot', 'Dragon Ball Z: Kakarot', 'Action RPG', 94, 2020, 590000, 36],
  ['ps4_one_piece_pw4', 'One Piece: Pirate Warriors 4', 'Hack & Slash', 93, 2020, 550000, 24],
  ['ps4_minecraft', 'Minecraft PS4 Edition', 'Sandbox', 95, 2014, 350000, 4]
];

const PS5_50_LIST = [
  ['ps5_efootball', 'eFootball Patch Liga 1 & Eropa', 'Sports', 99, 2021, 350000, 48],
  ['ps5_gow_ragnarok', 'God of War Ragnarök', 'Action', 99, 2022, 1029000, 85],
  ['ps5_gt7', 'Gran Turismo 7', 'Racing', 97, 2022, 899000, 110],
  ['ps5_elden_ring', 'Elden Ring: Shadow of the Erdtree', 'Action RPG', 98, 2022, 899000, 80],
  ['ps5_fc24', 'EA Sports FC 24', 'Sports', 99, 2023, 899000, 52],
  ['ps5_spiderman2', 'Marvel\'s Spider-Man 2', 'Action', 99, 2023, 1029000, 98],
  ['ps5_re4_remake', 'Resident Evil 4 Remake', 'Action Horror', 98, 2023, 829000, 68],
  ['ps5_fc25', 'EA Sports FC 25', 'Sports', 100, 2024, 999000, 55],
  ['ps5_tekken8', 'Tekken 8', 'Fighting', 99, 2024, 999000, 100],
  ['ps5_wukong', 'Black Myth: Wukong', 'Action RPG', 100, 2024, 899000, 105],
  ['ps5_gtav_ee', 'GTA V Expanded & Enhanced', 'Open World', 98, 2022, 599000, 92],
  ['ps5_mk1', 'Mortal Kombat 1', 'Fighting', 96, 2023, 899000, 110],
  ['ps5_sf6', 'Street Fighter 6', 'Fighting', 96, 2023, 829000, 65],
  ['ps5_ff7_rebirth', 'Final Fantasy VII Rebirth', 'RPG', 97, 2024, 1029000, 145],
  ['ps5_ff16', 'Final Fantasy XVI', 'Action RPG', 96, 2023, 999000, 90],
  ['ps5_stellar_blade', 'Stellar Blade', 'Action', 96, 2024, 999000, 35],
  ['ps5_helldivers2', 'Helldivers 2', 'Shooter', 96, 2024, 579000, 45],
  ['ps5_astro_bot', 'Astro Bot', 'Platformer', 97, 2024, 829000, 42],
  ['ps5_rise_ronin', 'Rise of the Ronin', 'Action RPG', 94, 2024, 999000, 96],
  ['ps5_silent_hill2', 'Silent Hill 2 Remake', 'Horror', 96, 2024, 939000, 50],
  ['ps5_dbz_sparking', 'Dragon Ball: Sparking! ZERO', 'Fighting', 98, 2024, 999000, 48],
  ['ps5_wwe2k24', 'WWE 2K24', 'Fighting', 95, 2024, 899000, 75],
  ['ps5_nba2k25', 'NBA 2K25', 'Sports', 96, 2024, 949000, 115],
  ['ps5_fifa23', 'FIFA 23 Next-Gen', 'Sports', 96, 2022, 799000, 50],
  ['ps5_cod_mw3', 'Call of Duty: Modern Warfare III', 'FPS', 95, 2023, 999000, 120],
  ['ps5_cod_bo6', 'Call of Duty: Black Ops 6', 'FPS', 97, 2024, 1049000, 115],
  ['ps5_cyberpunk', 'Cyberpunk 2077: Phantom Liberty', 'Open World', 96, 2023, 749000, 88],
  ['ps5_hogwarts', 'Hogwarts Legacy', 'Action RPG', 96, 2023, 899000, 80],
  ['ps5_baldur3', 'Baldur\'s Gate 3', 'RPG', 97, 2023, 949000, 110],
  ['ps5_demon_souls', 'Demon\'s Souls Remake', 'Action RPG', 94, 2020, 899000, 66],
  ['ps5_ratchet', 'Ratchet & Clank: Rift Apart', 'Action', 94, 2021, 829000, 42],
  ['ps5_returnal', 'Returnal', 'Shooter', 93, 2021, 829000, 56],
  ['ps5_horizon_fw', 'Horizon Forbidden West', 'Action RPG', 96, 2022, 899000, 98],
  ['ps5_tlou_p1', 'The Last of Us Part I', 'Action', 96, 2022, 899000, 79],
  ['ps5_tlou_p2r', 'The Last of Us Part II Remastered', 'Action', 97, 2024, 729000, 76],
  ['ps5_ghost_dc', 'Ghost of Tsushima Director\'s Cut', 'Open World', 97, 2021, 899000, 60],
  ['ps5_miles', 'Spider-Man: Miles Morales PS5', 'Action', 95, 2020, 729000, 54],
  ['ps5_ac_mirage', 'Assassin\'s Creed Mirage', 'Action', 93, 2023, 749000, 40],
  ['ps5_nfs_unbound', 'Need for Speed Unbound', 'Racing', 94, 2022, 829000, 35],
  ['ps5_f1_24', 'F1 24', 'Racing', 93, 2024, 899000, 55],
  ['ps5_crew_mf', 'The Crew Motorfest', 'Racing', 94, 2023, 849000, 48],
  ['ps5_re_village', 'Resident Evil Village PS5', 'Horror', 96, 2021, 729000, 40],
  ['ps5_dead_space', 'Dead Space Remake', 'Horror', 94, 2023, 849000, 42],
  ['ps5_alan_wake2', 'Alan Wake 2', 'Horror', 95, 2023, 899000, 82],
  ['ps5_persona3r', 'Persona 3 Reload', 'RPG', 95, 2024, 899000, 32],
  ['ps5_like_dragon', 'Like a Dragon: Infinite Wealth', 'RPG', 95, 2024, 899000, 54],
  ['ps5_naruto_conn', 'Naruto x Boruto Ultimate Ninja Storm Connections', 'Fighting', 95, 2023, 829000, 32],
  ['ps5_itt', 'It Takes Two PS5 (Co-op)', 'Adventure', 97, 2021, 599000, 40],
  ['ps5_palworld', 'Palworld PS5', 'Survival', 95, 2024, 450000, 24],
  ['ps5_gta6', 'Grand Theft Auto VI (GTA 6)', 'Open World', 100, 2025, 1199000, 140]
];

const NEXTGEN_GAMES_RAW = [
  ...PS3_50_LIST.map(([id, t, g, h, y, p, s]) => [id, 'PS3', t, g, h, y, p, s]),
  ...PS4_50_LIST.map(([id, t, g, h, y, p, s]) => [id, 'PS4', t, g, h, y, p, s]),
  ...PS5_50_LIST.map(([id, t, g, h, y, p, s]) => [id, 'PS5', t, g, h, y, p, s])
];

// Box Art Cover CD / DVD / Blu-Ray Original Detail Tinggi (dengan efek kilap plastik, hologram PlayStation, & rating ESRB)
function makeDiscCoverSvg(platform, title, genre, id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i);
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 55) % 360;
  const caseColor = platform === 'PS1' ? '#1e293b' : platform === 'PS2' ? '#172554' : platform === 'PS3' ? '#7f1d1d' : platform === 'PS4' ? '#0369a1' : '#f8fafc';
  const headerFg = platform === 'PS5' ? '#0f172a' : '#ffffff';
  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const words = safeTitle.split(' ');
  const l1 = words.slice(0, 2).join(' ').slice(0, 16);
  const l2 = words.slice(2, 5).join(' ').slice(0, 18);
  const l3 = words.slice(5).join(' ').slice(0, 18);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 230" width="180" height="230">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${hue1},78%,42%)"/>
        <stop offset="55%" stop-color="hsl(${hue2},85%,22%)"/>
        <stop offset="100%" stop-color="#090d16"/>
      </linearGradient>
      <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="rgba(255,255,255,0.28)"/>
        <stop offset="20%" stop-color="rgba(255,255,255,0.03)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0.12)"/>
      </linearGradient>
    </defs>
    <rect width="180" height="230" rx="8" fill="#0f172a" stroke="#64748b" stroke-width="3"/>
    <rect x="10" y="6" width="164" height="218" rx="4" fill="url(#bg)"/>
    <rect x="10" y="6" width="164" height="28" fill="${caseColor}"/>
    <text x="18" y="25" fill="${headerFg}" font-family="Impact,Arial Black,sans-serif" font-size="14" letter-spacing="1">${platform} • NTSC/J</text>
    <circle cx="92" cy="108" r="46" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
    <circle cx="92" cy="108" r="32" fill="rgba(56,189,248,0.18)"/>
    <circle cx="92" cy="108" r="10" fill="#090d16" stroke="#e2e8f0" stroke-width="2"/>
    <text x="92" y="166" text-anchor="middle" fill="#ffffff" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="13">${l1}</text>
    <text x="92" y="182" text-anchor="middle" fill="#f1f5f9" font-family="Arial,sans-serif" font-weight="800" font-size="11.5">${l2}</text>
    <text x="92" y="196" text-anchor="middle" fill="#cbd5e1" font-family="Arial,sans-serif" font-weight="700" font-size="10">${l3}</text>
    <rect x="16" y="198" width="20" height="22" rx="2" fill="#ffffff" stroke="#000" stroke-width="1.5"/>
    <text x="26" y="214" text-anchor="middle" fill="#000" font-family="Arial Black" font-size="12">T</text>
    <rect x="44" y="203" width="122" height="15" rx="4" fill="rgba(0,0,0,0.6)"/>
    <text x="105" y="214" text-anchor="middle" fill="#38bdf8" font-family="Arial" font-weight="800" font-size="9">${genre.toUpperCase()}</text>
    <rect x="10" y="6" width="164" height="218" fill="url(#shine)"/>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const GAME_DISC_CATALOG = [
  ...PS1_100_NAMES.map(([id, title, genre, hype, year], idx) => ({
    id: 'ps1_' + id,
    code: 'PS1-' + String(idx + 1).padStart(3, '0'),
    platform: 'PS1',
    title,
    genre,
    hype,
    releaseYear: year,
    basePrice2010: 25000 + (hype >= 95 ? 15000 : 5000),
    sizeGb: 0.65,
    cover: makeDiscCoverSvg('PS1', title, genre, id)
  })),
  ...PS2_100_NAMES.map(([id, title, genre, hype, year], idx) => ({
    id: 'ps2_' + id,
    code: 'PS2-' + String(idx + 1).padStart(3, '0'),
    platform: 'PS2',
    title,
    genre,
    hype,
    releaseYear: year,
    basePrice2010: 45000 + (hype >= 97 ? 25000 : 10000),
    sizeGb: 4.2,
    cover: makeDiscCoverSvg('PS2', title, genre, id)
  })),
  ...NEXTGEN_GAMES_RAW.map(([id, platform, title, genre, hype, year, price2010, sizeGb], idx) => ({
    id,
    code: platform + '-' + String(idx + 1).padStart(3, '0'),
    platform,
    title,
    genre,
    hype,
    releaseYear: year,
    basePrice2010: price2010,
    sizeGb,
    cover: makeDiscCoverSvg(platform, title, genre, id)
  }))
];
