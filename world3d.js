// ==================== 3D RENTAL PS TYCOON ENGINE (20 SLOT: 10 LUAR SEJEJER + 10 ROOM VIP + RUANG TUNGGU) ====================
// Otomatis bergerak (Tycoon Camera: Orbit + Zoom + Fullscreen toggle) dengan Karakter Kecil 3D Berwajah Unik (Non-Lego!)

(function () {
  'use strict';

  const THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  let scene, camera, renderer, clock;
  let initialized = false, isFullscreen = false;
  let camAngleH = 0.55, camAngleV = 0.68, camDist = 24;
  let camTarget = { x: 0, y: 0, z: 0 };
  let isDragging = false, prevMouse = { x: 0, y: 0 };

  const slotMeshes = []; // 20 slots (0..9 = Luar Sejejer, 10..19 = VIP Room)
  const actorMap = new Map();
  const dirtMeshes = [];
  let floorMat, wallMat;

  // Buat tekstur wajah unik (mata, alis, hidung, mulut ekspresif, pipi) supaya BUKAN seperti Lego kotak!
  function createUniqueFaceTexture(seed, skinHex, mood = 'happy') {
    const cv = document.createElement('canvas');
    cv.width = 256; cv.height = 128;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = skinHex || '#f1c6a7';
    ctx.fillRect(0, 0, 256, 128);

    // Pipi merona halus
    ctx.fillStyle = 'rgba(244, 114, 182, 0.22)';
    ctx.beginPath(); ctx.arc(102, 78, 10, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(154, 78, 10, 0, Math.PI * 2); ctx.fill();

    // Variasi bentuk alis & mata berdasarkan seed
    const eyeStyle = seed % 3;
    const browTilt = (seed % 2 === 0) ? -2 : 2;

    // Alis
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(98, 46 + browTilt); ctx.lineTo(116, 46 - browTilt); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(140, 46 - browTilt); ctx.lineTo(158, 46 + browTilt); ctx.stroke();

    // Bagian putih mata (sclera)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(107, 58, 9, eyeStyle === 1 ? 5 : 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(149, 58, 9, eyeStyle === 1 ? 5 : 7, 0, 0, Math.PI * 2); ctx.fill();

    // Iris & Pupil
    const irisColors = ['#1e293b', '#451a03', '#0f172a', '#1d4ed8', '#065f46'];
    ctx.fillStyle = irisColors[seed % irisColors.length];
    ctx.beginPath(); ctx.arc(107, 58, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(149, 58, 4.5, 0, Math.PI * 2); ctx.fill();

    // Pantulan cahaya mata (catchlight)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(109, 56, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(151, 56, 1.6, 0, Math.PI * 2); ctx.fill();

    // Hidung
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(128, 58); ctx.lineTo(125, 72); ctx.lineTo(131, 74); ctx.stroke();

    // Mulut sesuai ekspresi
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    if (mood === 'annoyed') {
      ctx.arc(128, 96, 9, Math.PI * 1.15, Math.PI * 1.85);
    } else if (mood === 'focus') {
      ctx.moveTo(120, 88); ctx.lineTo(136, 88);
    } else {
      ctx.arc(128, 84, 10, 0.15 * Math.PI, 0.85 * Math.PI);
    }
    ctx.stroke();

    const tex = new THREE.CanvasTexture(cv);
    tex.needsUpdate = true;
    return tex;
  }

  // Buat karakter 3D organik (Kepala bulat berwajah unik + gaya rambut + tubuh bulat + tangan/kaki animasi)
  function createCharacter3D(seed, skinHex, shirtColor, pantsColor, roleBadge) {
    const group = new THREE.Group();

    // Kepala bulat (Sphere) dengan tekstur wajah unik
    const faceTex = createUniqueFaceTexture(seed, skinHex, 'happy');
    const headGeo = new THREE.SphereGeometry(0.28, 20, 16);
    const headMat = new THREE.MeshLambertMaterial({ map: faceTex });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.28;
    // Putar sphere agar wajah menghadap +Z
    head.rotation.y = -Math.PI / 2;
    group.add(head);

    // Gaya rambut 3D bervariasi (bukan kepala polos)
    const hairColors = [0x0f172a, 0x27272a, 0x451a03, 0x78350f, 0x1e1b4b];
    const hairMat = new THREE.MeshLambertMaterial({ color: hairColors[seed % hairColors.length] });
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.295, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58), hairMat);
    hairCap.position.y = 1.30;
    group.add(hairCap);

    if (seed % 3 === 0) {
      // Jambul / Spiky hair
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.22, 8), hairMat);
      spike.position.set(0, 1.60, 0.06);
      spike.rotation.x = 0.3;
      group.add(spike);
    } else if (seed % 3 === 1) {
      // Topi / Pony
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 12), hairMat);
      brim.position.set(0, 1.44, 0.12);
      group.add(brim);
    }

    // Badan (Cylinder membulat)
    const bodyMat = new THREE.MeshLambertMaterial({ color: shirtColor });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.24, 0.56, 14), bodyMat);
    body.position.y = 0.78;
    group.add(body);

    // Lengan Kiri & Kanan
    const limbSkinMat = new THREE.MeshLambertMaterial({ color: skinHex || '#f1c6a7' });
    const armGeo = new THREE.CylinderGeometry(0.065, 0.06, 0.42, 10);
    const armL = new THREE.Mesh(armGeo, limbSkinMat);
    armL.position.set(-0.28, 0.78, 0);
    const armR = new THREE.Mesh(armGeo, limbSkinMat);
    armR.position.set(0.28, 0.78, 0);
    group.add(armL, armR);

    // Kaki Kiri & Kanan
    const legMat = new THREE.MeshLambertMaterial({ color: pantsColor || 0x1e293b });
    const legGeo = new THREE.CylinderGeometry(0.08, 0.075, 0.48, 10);
    const legL = new THREE.Mesh(legGeo, legMat);
    legL.position.set(-0.11, 0.26, 0);
    const legR = new THREE.Mesh(legGeo, legMat);
    legR.position.set(0.11, 0.26, 0);
    group.add(legL, legR);

    group.userData = { head, armL, armR, legL, legR, seed, roleBadge, walkPhase: (seed % 10) * 0.6 };
    return group;
  }

  // Buat Canvas Texture animasi layar TV saat sedang dimainkan (Sepakbola WE/PES, Balapan CTR/Downhill/GT, atau Fighting Tekken/SmackDown)
  function createTvScreenCanvas() {
    const cv = document.createElement('canvas');
    cv.width = 128; cv.height = 80;
    const ctx = cv.getContext('2d');
    const tex = new THREE.CanvasTexture(cv);
    return { cv, ctx, tex };
  }

  function drawAnimatedGameOnTv(scr, timeSec, slotData) {
    const { ctx, cv, tex } = scr;
    if (!slotData || !slotData.console || !slotData.tv) {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, cv.width, cv.height);
      tex.needsUpdate = true;
      return;
    }
    if (!slotData.occupied) {
      // Standby Blue/PlayStation Menu Screen
      const g = ctx.createLinearGradient(0, 0, cv.width, cv.height);
      g.addColorStop(0, '#0f172a');
      g.addColorStop(1, slotData.installedGame ? '#1e3a8a' : '#31102f');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px Arial';
      ctx.fillText(slotData.console.platform + ' READY', 28, 36);
      ctx.fillStyle = slotData.installedGame ? '#4ade80' : '#f87171';
      ctx.font = '9px Arial';
      ctx.fillText(slotData.installedGame ? slotData.installedGame.title.slice(0, 16) : 'NO DISC / GAME', 16, 54);
      tex.needsUpdate = true;
      return;
    }

    // Sedang dimainkan pelanggan -> Animasi game nyata!
    const gameTitle = (slotData.installedGame ? slotData.installedGame.title : 'PES').toLowerCase();
    if (gameTitle.includes('winning') || gameTitle.includes('pes') || gameTitle.includes('fc') || gameTitle.includes('fifa') || gameTitle.includes('soccer')) {
      // Lapangan Sepak Bola WE / PES
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, 128, 80);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.strokeRect(6, 6, 116, 68);
      ctx.beginPath(); ctx.arc(64, 40, 14, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(64, 6); ctx.lineTo(64, 74); ctx.stroke();
      // Pemain & Bola bergerak
      const bx = 64 + Math.sin(timeSec * 3.2) * 38;
      const by = 40 + Math.cos(timeSec * 2.5) * 22;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(bx - 10, by - 4, 5, 8);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(bx + 6, by - 3, 5, 8);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(bx, by, 3, 0, Math.PI * 2); ctx.fill();
    } else if (gameTitle.includes('racing') || gameTitle.includes('need') || gameTitle.includes('downhill') || gameTitle.includes('turismo') || gameTitle.includes('nascar')) {
      // Game Balapan 3D Perspektif
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, 128, 38);
      ctx.fillStyle = '#166534';
      ctx.fillRect(0, 38, 128, 42);
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      const curve = Math.sin(timeSec * 2) * 18;
      ctx.moveTo(54 + curve, 38); ctx.lineTo(74 + curve, 38);
      ctx.lineTo(112, 80); ctx.lineTo(16, 80); ctx.fill();
      // Mobil pemain
      const cx = 64 + Math.sin(timeSec * 4) * 14;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cx - 10, 62, 20, 11);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(cx - 8, 64, 4, 3); ctx.fillRect(cx + 4, 64, 4, 3);
    } else {
      // Game Action / Fighting (Tekken / SmackDown / GTA / God of War)
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, 0, 128, 56);
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 56, 128, 24);
      // Health bars
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(8, 8, 46, 6);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(74, 8, 46, 6);
      // 2 Fighter bergerak
      const f1x = 46 + Math.sin(timeSec * 6) * 8;
      const f2x = 78 + Math.cos(timeSec * 6) * 8;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(f1x, 32, 10, 24);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(f2x, 32, 10, 24);
    }
    tex.needsUpdate = true;
  }

  function buildRentalWorld() {
    const container = document.getElementById('studio3dViewport');
    if (!container || typeof THREE === 'undefined') return;
    container.innerHTML = '';

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / Math.max(1, container.clientHeight), 0.1, 200);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    clock = new THREE.Clock();

    // Pencahayaan
    const amb = new THREE.AmbientLight(0xffffff, 0.72);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xfffbeb, 0.85);
    dir.position.set(12, 24, 14);
    scene.add(dir);

    // Lantai Utama Toko (Lebar 24m x Panjang 18m)
    floorMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 18), floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const grid = new THREE.GridHelper(24, 24, 0x334155, 0x1e293b);
    grid.position.y = 0.01;
    scene.add(grid);

    // Dinding Belakang & Samping
    wallMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(24, 3.2, 0.25), wallMat);
    backWall.position.set(0, 1.6, -9);
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, 18), wallMat);
    leftWall.position.set(-12, 1.6, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, 18), wallMat);
    rightWall.position.set(12, 1.6, 0);
    scene.add(rightWall);

    // Meja Kasir & Etalase Stik/Makanan/Pulsa (di depan kiri)
    const cashierGroup = new THREE.Group();
    const desk = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.05, 1.3), new THREE.MeshLambertMaterial({ color: 0x1d4ed8 }));
    desk.position.set(0, 0.525, 0);
    cashierGroup.add(desk);
    const glassCase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 0.8), new THREE.MeshLambertMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 }));
    glassCase.position.set(0.8, 1.35, 0);
    cashierGroup.add(glassCase);
    cashierGroup.position.set(-7.5, 0, 6.2);
    scene.add(cashierGroup);

    // Ruang Tunggu Antrean (Benches di depan kanan dekat pintu masuk)
    const benchMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
    for (let b = 0; b < 2; b++) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.42, 0.8), benchMat);
      bench.position.set(5.5, 0.21, 5.5 + b * 1.6);
      scene.add(bench);
    }

    // Noda Kotoran Lantai (muncul kalau kebersihan turun)
    dirtMeshes.length = 0;
    const dirtMat = new THREE.MeshBasicMaterial({ color: 0x451a03, transparent: true, opacity: 0.65 });
    for (let d = 0; d < 14; d++) {
      const dm = new THREE.Mesh(new THREE.CircleGeometry(0.35 + (d % 3) * 0.15, 10), dirtMat);
      dm.rotation.x = -Math.PI / 2;
      dm.position.set(-8 + (d * 1.3) % 16, 0.02, -5 + ((d * 2.7) % 11));
      dm.visible = false;
      scene.add(dm);
      dirtMeshes.push(dm);
    }

    // ==================== 20 SLOT RENTAL PS ====================
    // Slot 0..9 (Unit #1-#10): Sejejer di Luar (Area Kiri-Tengah, 2 baris x 5 unit)
    // Slot 10..19 (Room #11-#20): 10 Room VIP Tertutup (Area Kanan & Belakang, per room per pelanggan dengan sekat dinding!)
    slotMeshes.length = 0;

    for (let i = 0; i < 20; i++) {
      const isRoom = i >= 10;
      const g = new THREE.Group();
      let sx, sz;
      if (!isRoom) {
        // 10 Unit Luar Sejejer (2 baris @ 5 unit)
        const row = Math.floor(i / 5);
        const col = i % 5;
        sx = -9.6 + col * 2.1;
        sz = -5.5 + row * 4.2;
      } else {
        // 10 Room Tertutup (2 baris @ 5 room di sisi kanan)
        const rIdx = i - 10;
        const row = Math.floor(rIdx / 5);
        const col = rIdx % 5;
        sx = 1.6 + col * 2.25;
        sz = -6.0 + row * 4.8;
      }
      g.position.set(sx, 0, sz);

      // Sekat Room VIP jika i >= 10
      if (isRoom) {
        const partMat = new THREE.MeshLambertMaterial({ color: 0x334155, transparent: true, opacity: 0.55 });
        const wL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.1, 2.3), partMat);
        wL.position.set(-1.05, 1.05, 0);
        const wR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.1, 2.3), partMat);
        wR.position.set(1.05, 1.05, 0);
        const wB = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.1, 0.1), partMat);
        wB.position.set(0, 1.05, -1.15);
        g.add(wL, wR, wB);
      }

      // Meja TV
      const table = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.55, 0.65), new THREE.MeshLambertMaterial({ color: 0x3b2f2f }));
      table.position.set(0, 0.275, -0.7);
      g.add(table);

      // Kursi / Sofa Pelanggan
      const chairMat = new THREE.MeshLambertMaterial({ color: isRoom ? 0x4f46e5 : 0x334155 });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 0.7), chairMat);
      seat.position.set(0, 0.175, 0.55);
      g.add(seat);

      // Mesh TV (Hanya tampil jika slot punya TV terpasang)
      const tvScreen = createTvScreenCanvas();
      const tvGroup = new THREE.Group();
      const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.78, 0.12), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
      tvFrame.position.set(0, 0.96, -0.72);
      const tvPanel = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.68), new THREE.MeshBasicMaterial({ map: tvScreen.tex }));
      tvPanel.position.set(0, 0.96, -0.65);
      tvGroup.add(tvFrame, tvPanel);
      g.add(tvGroup);

      // Mesh Konsol PS (di atas meja di bawah TV)
      const psMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.32), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
      psMesh.position.set(0.42, 0.62, -0.62);
      g.add(psMesh);

      // Mesh Kipas Angin (Baling-baling berputar)
      const fanGroup = new THREE.Group();
      const fanPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.3), new THREE.MeshLambertMaterial({ color: 0x94a3b8 }));
      fanPole.position.set(-0.75, 0.65, -0.8);
      const fanBlade = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.04), new THREE.MeshLambertMaterial({ color: 0x38bdf8 }));
      fanBlade.position.set(-0.75, 1.35, -0.72);
      fanGroup.add(fanPole, fanBlade);
      fanGroup.visible = false;
      g.add(fanGroup);

      // Mesh Unit AC Split (di dinding atas belakang TV)
      const acMesh = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.28, 0.24), new THREE.MeshLambertMaterial({ color: 0xf8fafc }));
      acMesh.position.set(0, 1.88, -0.95);
      acMesh.visible = false;
      g.add(acMesh);

      scene.add(g);
      slotMeshes.push({ group: g, tvGroup, tvScreen, psMesh, fanGroup, fanBlade, acMesh, sx, sz });
    }

    // Event Kamera Orbit & Zoom
    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('pointerup', () => { isDragging = false; });
    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      prevMouse = { x: e.clientX, y: e.clientY };
      camAngleH -= dx * 0.007;
      camAngleV = Math.max(0.25, Math.min(1.38, camAngleV + dy * 0.006));
    });
    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      camDist = Math.max(8, Math.min(36, camDist + e.deltaY * 0.015));
    }, { passive: false });

    window.addEventListener('resize', onResize);
    initialized = true;
    animate();
  }

  function onResize() {
    const container = document.getElementById('studio3dViewport');
    if (!container || !renderer || !camera) return;
    camera.aspect = container.clientWidth / Math.max(1, container.clientHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  // Sinkronisasi state game ke dunia 3D setiap frame
  function syncWorldWithState(timeSec, dt) {
    if (typeof state === 'undefined' || !state.slots) return;

    // Update warna lantai & dinding sesuai level renovasi
    const rLv = (typeof RENOV_LEVELS !== 'undefined' && RENOV_LEVELS[state.renovLevel - 1]) || null;
    if (rLv && floorMat && wallMat) {
      floorMat.color.set(rLv.floorColor);
      wallMat.color.set(rLv.wallColor);
    }

    // Update noda kotoran lantai berdasarkan state.cleanliness
    const dirtyCount = Math.max(0, Math.floor(((100 - (state.cleanliness || 100)) / 100) * dirtMeshes.length));
    dirtMeshes.forEach((dm, idx) => { dm.visible = idx < dirtyCount; });

    const activeActorIds = new Set();

    // 1. Karakter Utama (Owner) - jika sedang sekolah (usia < 18, Senin-Sabtu 07:00-13:00, bukan hari libur), tidak di kasir
    const atSchool = typeof isPlayerAtSchool === 'function' ? isPlayerAtSchool() : false;
    if (!atSchool) {
      const pid = 'player_main';
      activeActorIds.add(pid);
      let pMesh = actorMap.get(pid);
      if (!pMesh) {
        const eth = (typeof ETHNICITIES !== 'undefined' && ETHNICITIES.find(e => e.id === state.player.ethnicity)) || { skin: '#f1c6a7' };
        pMesh = createCharacter3D(7, eth.skin, 0x2563eb, 0x0f172a, 'OWNER');
        scene.add(pMesh);
        actorMap.set(pid, pMesh);
      }
      // Berdiri/bergerak halus di sekitar meja kasir
      pMesh.position.set(-7.5 + Math.sin(timeSec * 0.8) * 0.6, 0, 5.1);
      pMesh.rotation.y = Math.sin(timeSec * 0.5) * 0.3;
    }

    // 2. Karyawan yang sedang dalam jam kerja
    (state.employees || []).forEach((emp, idx) => {
      const onDuty = typeof isEmployeeOnDuty === 'function' ? isEmployeeOnDuty(emp) : true;
      if (!onDuty) return;
      const eid = 'emp_' + emp.id;
      activeActorIds.add(eid);
      let eMesh = actorMap.get(eid);
      if (!eMesh) {
        eMesh = createCharacter3D(100 + idx * 13, '#ecc0a1', 0x10b981, 0x1e293b, 'STAFF');
        scene.add(eMesh);
        actorMap.set(eid, eMesh);
      }
      // Jika punya tugas bersih-bersih, keliling menyapu lantai; jika jaga/servis, di sekitar kasir/tengah
      if (emp.tasks && emp.tasks.includes('clean')) {
        const wx = Math.sin(timeSec * 0.5 + idx) * 6.5;
        const wz = Math.cos(timeSec * 0.35 + idx) * 4.5;
        eMesh.position.set(wx, 0, wz);
        eMesh.rotation.y = timeSec * 0.5 + Math.PI / 2;
        eMesh.userData.armR.rotation.x = Math.sin(timeSec * 8) * 0.5;
        eMesh.userData.legL.rotation.x = Math.sin(timeSec * 6) * 0.4;
        eMesh.userData.legR.rotation.x = -Math.sin(timeSec * 6) * 0.4;
      } else {
        eMesh.position.set(-6.0 + idx * 1.1, 0, 5.3);
        eMesh.rotation.y = 0;
      }
    });

    // 3. 20 Slot Rental PS (Hardware & Pelanggan yang sedang bermain)
    state.slots.forEach((slot, i) => {
      const sm = slotMeshes[i];
      if (!sm) return;
      sm.tvGroup.visible = !!slot.tv;
      sm.psMesh.visible = !!slot.console;
      if (slot.console) {
        const pColor = slot.console.platform === 'PS1' ? 0xcbd5e1 : slot.console.platform === 'PS5' ? 0xf8fafc : 0x1e293b;
        sm.psMesh.material.color.setHex(pColor);
      }
      sm.fanGroup.visible = !!(slot.cooling && slot.cooling.type === 'fan');
      sm.acMesh.visible = !!(slot.cooling && slot.cooling.type === 'ac');
      if (sm.fanGroup.visible && !state.plnBlackout && state.kwh > 0) {
        sm.fanBlade.rotation.z += dt * 14;
      }

      drawAnimatedGameOnTv(sm.tvScreen, timeSec + i * 1.7, (!state.plnBlackout && state.kwh > 0) ? slot : null);

      if (slot.occupied) {
        const cid = 'cust_slot_' + i;
        activeActorIds.add(cid);
        let cMesh = actorMap.get(cid);
        if (!cMesh) {
          const skinList = ['#fce7d6', '#f1c6a7', '#e2ae8b', '#ecc0a1'];
          const shirtList = [0xef4444, 0xf59e0b, 0x8b5cf6, 0x06b6d4, 0xec4899, 0x3b82f6];
          const seed = (slot.customerSeed || (i * 17 + 5));
          cMesh = createCharacter3D(seed, skinList[seed % skinList.length], shirtList[seed % shirtList.length], 0x1e293b, 'GUEST');
          scene.add(cMesh);
          actorMap.set(cid, cMesh);
        }
        // Duduk menghadap TV (-Z) sambil menggerakkan tangan main stik PS
        cMesh.position.set(sm.sx, -0.12, sm.sz + 0.45);
        cMesh.rotation.y = Math.PI;
        cMesh.userData.armL.rotation.x = -0.6 + Math.sin(timeSec * 10 + i) * 0.15;
        cMesh.userData.armR.rotation.x = -0.6 + Math.cos(timeSec * 10 + i) * 0.15;
        cMesh.userData.head.rotation.y = -Math.PI / 2 + Math.sin(timeSec * 2 + i) * 0.12;
      }
    });

    // 4. Pelanggan di Ruang Tunggu Antrean (state.waitingQueue)
    (state.waitingQueue || []).forEach((wq, idx) => {
      const wid = 'wait_' + wq.id;
      activeActorIds.add(wid);
      let wMesh = actorMap.get(wid);
      if (!wMesh) {
        const shirtList = [0x14b8a6, 0xf97316, 0x6366f1, 0xe11d48];
        wMesh = createCharacter3D(wq.seed || (idx + 31), '#f1c6a7', shirtList[idx % shirtList.length], 0x334155, 'QUEUE');
        scene.add(wMesh);
        actorMap.set(wid, wMesh);
      }
      const row = Math.floor(idx / 4);
      const col = idx % 4;
      wMesh.position.set(4.1 + col * 0.95, 0, 5.4 + row * 1.55);
      wMesh.rotation.y = Math.PI;
    });

    // Hapus aktor yang sudah keluar
    for (const [id, mesh] of actorMap.entries()) {
      if (!activeActorIds.has(id)) {
        scene.remove(mesh);
        actorMap.delete(id);
      }
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!renderer || !scene || !camera) return;
    const dt = clock ? clock.getDelta() : 0.016;
    const elapsed = clock ? clock.getElapsedTime() : 0;

    syncWorldWithState(elapsed, dt);

    camera.position.x = camTarget.x + camDist * Math.sin(camAngleV) * Math.sin(camAngleH);
    camera.position.y = camTarget.y + camDist * Math.cos(camAngleV);
    camera.position.z = camTarget.z + camDist * Math.sin(camAngleV) * Math.cos(camAngleH);
    camera.lookAt(camTarget.x, camTarget.y, camTarget.z);

    renderer.render(scene, camera);
  }

  window.toggleStudio3dFullscreen = function () {
    const card = document.getElementById('studio3dCard');
    if (!card) return;
    isFullscreen = !isFullscreen;
    card.classList.toggle('studio3d-fullscreen', isFullscreen);
    const btn = document.getElementById('btn3dFs');
    if (btn) btn.textContent = isFullscreen ? '↙️ Kecilkan 3D' : '⛶ Fullscreen 3D';
    setTimeout(onResize, 60);
  };

  window.resetStudio3dCamera = function () {
    camAngleH = 0.55; camAngleV = 0.68; camDist = 24;
  };

  window.initRental3D = function () {
    if (initialized) { onResize(); return; }
    if (typeof THREE !== 'undefined') {
      buildRentalWorld();
      return;
    }
    const s = document.createElement('script');
    s.src = THREE_CDN;
    s.onload = buildRentalWorld;
    document.head.appendChild(s);
  };
})();
