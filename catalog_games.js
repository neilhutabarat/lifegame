// ==================== DATABASE 100 GAME PS1 & 100 GAME PS2 TERKENAL DI INDONESIA (+ PS3/PS4/PS5) ====================
// Lengkap dengan tahun rilis, harga kaset original sesuai zaman, daya tarik pelanggan (hype), dan cover art CD/DVD/BD original.

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

const NEXTGEN_GAMES_RAW = [
  // PS3 (2006 - 2016)
  ['ps3_pes2013', 'PS3', 'Pro Evolution Soccer 2013 (PES 2013 Legend)', 'Sports', 100, 2012, 350000, 12],
  ['ps3_gtav', 'PS3', 'Grand Theft Auto V (GTA 5)', 'Open World', 100, 2013, 550000, 18],
  ['ps3_tlou', 'PS3', 'The Last of Us', 'Action Adventure', 98, 2013, 480000, 24],
  ['ps3_gow3', 'PS3', 'God of War III', 'Action', 97, 2010, 420000, 20],
  ['ps3_uncharted2', 'PS3', 'Uncharted 2: Among Thieves', 'Action', 95, 2009, 380000, 16],
  ['ps3_uncharted3', 'PS3', 'Uncharted 3: Drake\'s Deception', 'Action', 96, 2011, 420000, 20],
  ['ps3_rdr', 'PS3', 'Red Dead Redemption', 'Open World', 96, 2010, 420000, 15],
  ['ps3_cod_bo2', 'PS3', 'Call of Duty: Black Ops II', 'FPS', 97, 2012, 450000, 14],
  ['ps3_tekken_ttt2', 'PS3', 'Tekken Tag Tournament 2', 'Fighting', 96, 2012, 400000, 15],
  ['ps3_naruto_storm3', 'PS3', 'Naruto Shippuden: Ultimate Ninja Storm 3', 'Fighting', 95, 2013, 400000, 12],
  ['ps3_gt6', 'PS3', 'Gran Turismo 6', 'Racing', 94, 2013, 420000, 16],
  ['ps3_fifa14', 'PS3', 'EA Sports FIFA 14 World Cup', 'Sports', 95, 2013, 380000, 11],

  // PS4 (2013 - 2024)
  ['ps4_pes2021', 'PS4', 'eFootball PES 2021 Season Update', 'Sports', 100, 2020, 490000, 40],
  ['ps4_pes2018', 'PS4', 'Pro Evolution Soccer 2018', 'Sports', 98, 2017, 450000, 32],
  ['ps4_gtav', 'PS4', 'Grand Theft Auto V Premium Edition', 'Open World', 99, 2014, 550000, 65],
  ['ps4_rdr2', 'PS4', 'Red Dead Redemption 2', 'Open World', 99, 2018, 749000, 105],
  ['ps4_gow2018', 'PS4', 'God of War (2018)', 'Action', 98, 2018, 599000, 45],
  ['ps4_spiderman', 'PS4', 'Marvel\'s Spider-Man', 'Action', 98, 2018, 599000, 50],
  ['ps4_ghost_tsushima', 'PS4', 'Ghost of Tsushima', 'Open World', 98, 2020, 699000, 55],
  ['ps4_tekken7', 'PS4', 'Tekken 7', 'Fighting', 97, 2017, 550000, 42],
  ['ps4_mk11', 'PS4', 'Mortal Kombat 11', 'Fighting', 96, 2019, 590000, 48],
  ['ps4_fc24', 'PS4', 'EA Sports FC 24', 'Sports', 99, 2023, 750000, 45],
  ['ps4_re2_remake', 'PS4', 'Resident Evil 2 Remake', 'Horror', 96, 2019, 550000, 28],
  ['ps4_naruto_storm4', 'PS4', 'Naruto Shippuden: Ultimate Ninja Storm 4', 'Fighting', 97, 2016, 480000, 35],

  // PS5 (2020 - 2026+)
  ['ps5_fc25', 'PS5', 'EA Sports FC 25', 'Sports', 100, 2024, 999000, 55],
  ['ps5_fc24', 'PS5', 'EA Sports FC 24', 'Sports', 99, 2023, 899000, 52],
  ['ps5_efootball', 'PS5', 'eFootball Patch Liga 1 & Eropa', 'Sports', 99, 2022, 350000, 48],
  ['ps5_spiderman2', 'PS5', 'Marvel\'s Spider-Man 2', 'Action', 99, 2023, 1029000, 98],
  ['ps5_gow_ragnarok', 'PS5', 'God of War Ragnarök', 'Action', 99, 2022, 1029000, 85],
  ['ps5_tekken8', 'PS5', 'Tekken 8', 'Fighting', 99, 2024, 999000, 100],
  ['ps5_wukong', 'PS5', 'Black Myth: Wukong', 'Action RPG', 100, 2024, 899000, 105],
  ['ps5_gt7', 'PS5', 'Gran Turismo 7', 'Racing', 97, 2022, 899000, 110],
  ['ps5_re4_remake', 'PS5', 'Resident Evil 4 Remake', 'Action Horror', 98, 2023, 829000, 68],
  ['ps5_elden_ring', 'PS5', 'Elden Ring: Shadow of the Erdtree', 'Action RPG', 98, 2022, 899000, 80]
];

// Generator Cover Art CD / DVD / Blu-Ray Original (SVG Data URI tajam, tidak pernah broken link!)
function makeDiscCoverSvg(platform, title, genre, id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i);
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 48) % 360;
  const headerBg = platform === 'PS1' ? '#111827' : platform === 'PS2' ? '#1e3a8a' : platform === 'PS3' ? '#991b1b' : platform === 'PS4' ? '#0284c7' : '#e2e8f0';
  const headerFg = platform === 'PS5' ? '#0f172a' : '#ffffff';
  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const l1 = safeTitle.slice(0, 18);
  const l2 = safeTitle.slice(18, 36);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="160" height="200">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${hue1},72%,36%)"/>
        <stop offset="100%" stop-color="hsl(${hue2},82%,18%)"/>
      </linearGradient>
    </defs>
    <rect width="160" height="200" rx="10" fill="url(#g)" stroke="#475569" stroke-width="3"/>
    <rect width="160" height="28" rx="8" fill="${headerBg}"/>
    <text x="10" y="19" fill="${headerFg}" font-family="Arial,sans-serif" font-weight="900" font-size="13">${platform} ORIGINAL</text>
    <circle cx="80" cy="96" r="40" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>
    <circle cx="80" cy="96" r="11" fill="#0f172a" stroke="#cbd5e1" stroke-width="2"/>
    <text x="80" y="156" text-anchor="middle" fill="#ffffff" font-family="Arial,sans-serif" font-weight="800" font-size="11.5">${l1}</text>
    <text x="80" y="171" text-anchor="middle" fill="#e2e8f0" font-family="Arial,sans-serif" font-weight="700" font-size="10.5">${l2}</text>
    <rect x="30" y="178" width="100" height="15" rx="7" fill="rgba(0,0,0,0.45)"/>
    <text x="80" y="189" text-anchor="middle" fill="#38bdf8" font-family="Arial,sans-serif" font-weight="700" font-size="9">${genre.toUpperCase()}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Generator Foto/Visual Hardware Nyata (PS1-PS5, TV, Kipas, AC, Stik, Memory Card, Dus Makanan, Motor, Mobil, HP)
function makeHardwareSvg(kind, label, sub, accent = '#2563eb') {
  const safeL = (label || '').replace(/&/g, '&amp;').slice(0, 22);
  const safeS = (sub || '').replace(/&/g, '&amp;').slice(0, 26);
  let shape = '';
  if (kind === 'ps1') {
    shape = `<rect x="28" y="34" width="104" height="68" rx="8" fill="#cbd5e1" stroke="#64748b" stroke-width="3"/>
             <circle cx="80" cy="68" r="26" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
             <circle cx="42" cy="88" r="6" fill="#16a34a"/><circle cx="118" cy="88" r="6" fill="#475569"/>`;
  } else if (kind === 'ps2') {
    shape = `<rect x="22" y="42" width="116" height="48" rx="4" fill="#0f172a" stroke="#1d4ed8" stroke-width="3"/>
             <line x1="24" y1="54" x2="136" y2="54" stroke="#2563eb" stroke-width="2"/>
             <line x1="24" y1="64" x2="136" y2="64" stroke="#1e293b" stroke-width="2"/>
             <text x="80" y="80" text-anchor="middle" fill="#38bdf8" font-family="Arial" font-weight="900" font-size="16">PS2</text>`;
  } else if (kind === 'ps3') {
    shape = `<path d="M24,84 Q80,30 136,84 L136,96 L24,96 Z" fill="#111827" stroke="#dc2626" stroke-width="2.5"/>
             <text x="80" y="82" text-anchor="middle" fill="#f8fafc" font-family="Arial" font-weight="900" font-size="15">PS3</text>`;
  } else if (kind === 'ps4') {
    shape = `<polygon points="30,45 138,45 128,92 20,92" fill="#0f172a" stroke="#0ea5e9" stroke-width="2.5"/>
             <line x1="26" y1="68" x2="133" y2="68" stroke="#38bdf8" stroke-width="3"/>
             <text x="80" y="62" text-anchor="middle" fill="#ffffff" font-family="Arial" font-weight="900" font-size="14">PS4</text>`;
  } else if (kind === 'ps5') {
    shape = `<path d="M52,24 Q80,34 108,24 L102,102 L58,102 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/>
             <rect x="66" y="28" width="28" height="72" rx="6" fill="#0f172a"/>
             <line x1="65" y1="32" x2="65" y2="90" stroke="#38bdf8" stroke-width="2"/>
             <line x1="95" y1="32" x2="95" y2="90" stroke="#38bdf8" stroke-width="2"/>`;
  } else if (kind === 'tv_crt') {
    shape = `<rect x="26" y="26" width="108" height="76" rx="10" fill="#334155" stroke="#64748b" stroke-width="3"/>
             <rect x="36" y="34" width="88" height="56" rx="8" fill="#0ea5e9"/>
             <circle cx="118" cy="96" r="3" fill="#22c55e"/>`;
  } else if (kind === 'tv_led') {
    shape = `<rect x="18" y="28" width="124" height="66" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5"/>
             <rect x="23" y="33" width="114" height="56" fill="url(#tvg)"/>
             <rect x="66" y="94" width="28" height="6" fill="#64748b"/>
             <rect x="52" y="100" width="56" height="4" rx="2" fill="#94a3b8"/>`;
  } else if (kind === 'stik') {
    shape = `<path d="M40,54 Q80,44 120,54 L130,86 Q116,100 102,82 L58,82 Q44,100 30,86 Z" fill="${accent}" stroke="#e2e8f0" stroke-width="2.5"/>
             <circle cx="52" cy="66" r="7" fill="#0f172a"/><circle cx="108" cy="66" r="7" fill="#0f172a"/>
             <circle cx="66" cy="76" r="6" fill="#334155"/><circle cx="94" cy="76" r="6" fill="#334155"/>`;
  } else if (kind === 'ac') {
    shape = `<rect x="20" y="42" width="120" height="42" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="2.5"/>
             <line x1="28" y1="74" x2="132" y2="74" stroke="#0ea5e9" stroke-width="3"/>
             <text x="122" y="60" fill="#16a34a" font-family="Arial" font-weight="900" font-size="11">18°C</text>`;
  } else if (kind === 'fan') {
    shape = `<circle cx="80" cy="62" r="30" fill="rgba(56,189,248,0.18)" stroke="#94a3b8" stroke-width="2.5"/>
             <circle cx="80" cy="62" r="8" fill="#0284c7"/>
             <line x1="80" y1="34" x2="80" y2="90" stroke="#38bdf8" stroke-width="5"/>
             <line x1="52" y1="62" x2="108" y2="62" stroke="#38bdf8" stroke-width="5"/>`;
  } else if (kind === 'box') {
    shape = `<rect x="34" y="34" width="92" height="64" rx="6" fill="#d97706" stroke="#fcd34d" stroke-width="2.5"/>
             <line x1="34" y1="50" x2="126" y2="50" stroke="#78350f" stroke-width="3"/>
             <text x="80" y="76" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="900" font-size="13">1 DUS GROSIR</text>`;
  } else if (kind === 'motor') {
    shape = `<circle cx="46" cy="84" r="16" fill="#1e293b" stroke="#cbd5e1" stroke-width="3"/>
             <circle cx="114" cy="84" r="16" fill="#1e293b" stroke="#cbd5e1" stroke-width="3"/>
             <path d="M46,84 L68,54 L98,54 L114,84 M62,54 L54,40 L72,40" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>`;
  } else if (kind === 'mobil') {
    shape = `<path d="M24,78 L38,50 L108,50 L132,78 Z" fill="${accent}" stroke="#e2e8f0" stroke-width="2"/>
             <rect x="20" y="72" width="120" height="18" rx="6" fill="${accent}"/>
             <circle cx="46" cy="90" r="12" fill="#0f172a" stroke="#cbd5e1" stroke-width="3"/>
             <circle cx="114" cy="90" r="12" fill="#0f172a" stroke="#cbd5e1" stroke-width="3"/>`;
  } else {
    shape = `<rect x="46" y="26" width="68" height="76" rx="10" fill="${accent}" stroke="#e2e8f0" stroke-width="2.5"/>
             <circle cx="80" cy="94" r="3" fill="#fff"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 145" width="160" height="145">
    <defs><linearGradient id="tvg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0284c7"/><stop offset="100%" stop-color="#1e1b4b"/></linearGradient></defs>
    <rect width="160" height="145" rx="12" fill="#0f172a" stroke="#334155" stroke-width="2"/>
    ${shape}
    <text x="80" y="122" text-anchor="middle" fill="#f8fafc" font-family="Arial,sans-serif" font-weight="800" font-size="10.5">${safeL}</text>
    <text x="80" y="136" text-anchor="middle" fill="#38bdf8" font-family="Arial,sans-serif" font-weight="700" font-size="9.5">${safeS}</text>
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
    basePrice2010: 25000 + (hype >= 95 ? 15000 : 5000), // Harga CD Original/Grade A PS1 tahun 2010
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
    basePrice2010: 45000 + (hype >= 97 ? 25000 : 10000), // Harga DVD Original/pilihan PS2 tahun 2010
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
