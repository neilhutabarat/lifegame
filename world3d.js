// ==================== FULLSCREEN 3D RENTAL PS TYCOON ENGINE (RAYCAST TAP, REAL SHADOWS & ARTICULATED 3D HUMANS) ====================
// Slot yang belum terpasang perangkat TIDAK merender meja/kursi/sekat kosong agar ruangan 3D rapi & realistis.
// Tap langsung unit/slot di dunia 3D untuk membuka konfigurasi slot, atau tap meja kasir untuk membuka stok stik/agen.

(function () {
  'use strict';

  const THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  let scene, camera, renderer, clock, raycaster, mouseVec;
  let initialized = false;
  let camAngleH = 0.48, camAngleV = 0.72, camDist = 21;
  let camTarget = { x: 0, y: 0.5, z: 0 };
  let isDragging = false, pointerDownPos = { x: 0, y: 0 }, prevMouse = { x: 0, y: 0 };

  const slotMeshes = [];
  const clickableObjects = [];
  const actorMap = new Map();
  const dirtMeshes = [];
  let floorMat, wallMat;

  // Buat tekstur keramik lantai ruko realistis
  function createTileFloorTexture(baseHex, groutHex) {
    const cv = document.createElement('canvas');
    cv.width = 256; cv.height = 256;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = baseHex || '#1e293b';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = groutHex || 'rgba(255,255,255,0.09)';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 124, 124);
    ctx.strokeRect(130, 2, 124, 124);
    ctx.strokeRect(2, 130, 124, 124);
    ctx.strokeRect(130, 130, 124, 124);
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(12, 9);
    return tex;
  }

  // Buat tekstur papan Neon Sign "RENTAL PS & PULSA"
  function createNeonSignTexture() {
    const cv = document.createElement('canvas');
    cv.width = 512; cv.height = 128;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 496, 112);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 38px Arial Black, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RENTAL PS & KONTER PULSA', 256, 62);
    ctx.fillStyle = '#4ade80';
    ctx.font = '700 22px Arial, sans-serif';
    ctx.fillText('10 UNIT REGULER • 10 ROOM VIP AC • SNACK & PPOB', 256, 98);
    return new THREE.CanvasTexture(cv);
  }

  // Buat tekstur wajah manusia 3D detail tinggi (gradasi kulit, mata berlapis iris/pupil/alis/bulu mata, bibir)
  function createDetailedHumanFaceTexture(seed, skinHex) {
    const cv = document.createElement('canvas');
    cv.width = 256; cv.height = 256;
    const ctx = cv.getContext('2d');

    ctx.fillStyle = skinHex || '#f1c6a7';
    ctx.fillRect(0, 0, 256, 256);

    // Shading halus wajah
    const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 125);
    grad.addColorStop(0, 'rgba(255,255,255,0.12)');
    grad.addColorStop(1, 'rgba(120,53,15,0.18)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Rona pipi
    ctx.fillStyle = 'rgba(244, 114, 182, 0.24)';
    ctx.beginPath(); ctx.ellipse(94, 148, 13, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(162, 148, 13, 8, 0, 0, Math.PI * 2); ctx.fill();

    // Alis ekspresif
    const browY = 96 + (seed % 3) * 2;
    ctx.strokeStyle = '#1e1b18';
    ctx.lineWidth = 5.5;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.quadraticCurveTo(100, browY - 6, 114, browY); ctx.moveTo(86, browY + 2); ctx.quadraticCurveTo(100, browY - 6, 114, browY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(142, browY); ctx.quadraticCurveTo(156, browY - 6, 170, browY + 2); ctx.stroke();

    // Mata (Sclera + Iris + Pupil + Highlight)
    const irisColors = ['#3b2314', '#1e293b', '#1d4ed8', '#065f46', '#451a03'];
    const irisHex = irisColors[seed % irisColors.length];
    [100, 156].forEach(ex => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(ex, 116, 12, 8.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#1e1b18';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(ex, 116, 12, 8.5, 0, Math.PI, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = irisHex;
      ctx.beginPath(); ctx.arc(ex, 116, 6.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#090d16';
      ctx.beginPath(); ctx.arc(ex, 116, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(ex + 2.2, 113.5, 1.8, 0, Math.PI * 2); ctx.fill();
    });

    // Mulut & Bibir
    ctx.fillStyle = '#be123c';
    ctx.beginPath();
    ctx.arc(128, 162, 11, 0.1 * Math.PI, 0.9 * Math.PI, false);
    ctx.fill();
    ctx.strokeStyle = '#881337';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(128, 161, 12, 0.12 * Math.PI, 0.88 * Math.PI);
    ctx.stroke();

    return new THREE.CanvasTexture(cv);
  }

  // Buat Karakter Manusia 3D Berartikulasi Lengkap (Kepala, Hidung 3D, Telinga 3D, Rambut Berlapis, Leher, Torso, Lengan, Tangan + Stik PS, Paha, Betis, Sepatu)
  function createArticulatedHuman3D(seed, skinHex, shirtColor, pantsColor, isSeated = false) {
    const root = new THREE.Group();
    const skinMat = new THREE.MeshStandardMaterial({ color: skinHex || '#f1c6a7', roughness: 0.65 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.7 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor || 0x1e293b, roughness: 0.8 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });

    // Kelompok Kepala + Leher
    const headGroup = new THREE.Group();
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.14, 12), skinMat);
    neck.position.y = -0.24;
    headGroup.add(neck);

    const faceTex = createDetailedHumanFaceTexture(seed, skinHex);
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.245, 24, 20), new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.6 }));
    headMesh.scale.set(0.95, 1.06, 0.96);
    headMesh.rotation.y = -Math.PI / 2;
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Hidung 3D Menonjol & 2 Telinga 3D (Bukan Kepala Bulat Polos!)
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.085, 10), skinMat);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, -0.01, 0.245);
    headGroup.add(nose);

    const earGeo = new THREE.SphereGeometry(0.05, 10, 10);
    const earL = new THREE.Mesh(earGeo, skinMat);
    earL.scale.set(0.5, 1.1, 0.8);
    earL.position.set(-0.23, 0, 0);
    const earR = earL.clone();
    earR.position.set(0.23, 0, 0);
    headGroup.add(earL, earR);

    // Gaya Rambut 3D Berlapis
    const hairColors = [0x111827, 0x27272a, 0x3b2314, 0x5c2d16, 0x1e1b4b];
    const hairMat = new THREE.MeshStandardMaterial({ color: hairColors[seed % hairColors.length], roughness: 0.75 });
    const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.262, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.58), hairMat);
    hairBase.scale.set(0.97, 1.06, 1.0);
    headGroup.add(hairBase);

    // Poni depan & variasi gaya rambut
    const bangs = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.09, 0.12), hairMat);
    bangs.position.set(0, 0.14, 0.19);
    bangs.rotation.x = 0.25;
    headGroup.add(bangs);

    if (seed % 3 === 0) {
      for (let s = -1; s <= 1; s++) {
        const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 8), hairMat);
        tuft.position.set(s * 0.09, 0.28, 0.04);
        tuft.rotation.z = -s * 0.25;
        headGroup.add(tuft);
      }
    } else if (seed % 3 === 1) {
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), hairMat);
      bun.position.set(0, 0.16, -0.24);
      headGroup.add(bun);
    }

    headGroup.position.y = isSeated ? 1.08 : 1.32;
    root.add(headGroup);

    // Torso (Bahu + Dada + Pinggang + Kerah Baju)
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.185, 0.54, 16), shirtMat);
    torso.scale.set(1.1, 1, 0.78);
    torso.position.y = isSeated ? 0.62 : 0.84;
    torso.castShadow = true;
    root.add(torso);

    // Lengan Kiri & Kanan (Bahu + Lengan + Tangan)
    const armL = new THREE.Group();
    const upperArmGeo = new THREE.CylinderGeometry(0.062, 0.052, 0.38, 12);
    const uArmL = new THREE.Mesh(upperArmGeo, shirtMat);
    uArmL.position.y = -0.16;
    const handGeo = new THREE.SphereGeometry(0.055, 10, 10);
    const handL = new THREE.Mesh(handGeo, skinMat);
    handL.position.y = -0.36;
    armL.add(uArmL, handL);
    armL.position.set(-0.27, isSeated ? 0.82 : 1.04, 0);

    const armR = new THREE.Group();
    const uArmR = new THREE.Mesh(upperArmGeo, shirtMat);
    uArmR.position.y = -0.16;
    const handR = new THREE.Mesh(handGeo, skinMat);
    handR.position.y = -0.36;
    armR.add(uArmR, handR);
    armR.position.set(0.27, isSeated ? 0.82 : 1.04, 0);
    root.add(armL, armR);

    // Jika sedang duduk main PS, pegang Stik 3D di depan badan
    if (isSeated) {
      const ctrlMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.12), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
      ctrlMesh.position.set(0, 0.54, 0.28);
      root.add(ctrlMesh);
    }

    // Kaki Kiri & Kanan (Paha + Betis + Sepatu)
    const legL = new THREE.Group();
    const legR = new THREE.Group();
    if (isSeated) {
      // Posisi duduk menekuk lutut 90 derajat di atas sofa
      const thighGeo = new THREE.CylinderGeometry(0.078, 0.07, 0.34, 12);
      const calfGeo = new THREE.CylinderGeometry(0.068, 0.058, 0.34, 12);
      [-0.11, 0.11].forEach((lx, idx) => {
        const lg = idx === 0 ? legL : legR;
        const thigh = new THREE.Mesh(thighGeo, pantsMat);
        thigh.rotation.x = Math.PI / 2;
        thigh.position.set(0, 0.38, 0.16);
        const calf = new THREE.Mesh(calfGeo, pantsMat);
        calf.position.set(0, 0.21, 0.31);
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.18), shoeMat);
        shoe.position.set(0, 0.05, 0.34);
        lg.add(thigh, calf, shoe);
        lg.position.x = lx;
      });
    } else {
      const fullLegGeo = new THREE.CylinderGeometry(0.078, 0.062, 0.48, 12);
      [-0.11, 0.11].forEach((lx, idx) => {
        const lg = idx === 0 ? legL : legR;
        const limb = new THREE.Mesh(fullLegGeo, pantsMat);
        limb.position.y = -0.22;
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.19), shoeMat);
        shoe.position.set(0, -0.46, 0.03);
        lg.add(limb, shoe);
        lg.position.set(lx, 0.54, 0);
      });
    }
    root.add(legL, legR);

    root.userData = { headGroup, armL, armR, legL, legR, seed, isSeated };
    return root;
  }

  function createTvScreenCanvas() {
    const cv = document.createElement('canvas');
    cv.width = 160; cv.height = 96;
    const ctx = cv.getContext('2d');
    const tex = new THREE.CanvasTexture(cv);
    return { cv, ctx, tex };
  }

  function drawAnimatedGameOnTv(scr, timeSec, slotData) {
    const { ctx, cv, tex } = scr;
    if (!slotData || !slotData.console || !slotData.tv) return;
    if (!slotData.occupied) {
      const g = ctx.createLinearGradient(0, 0, cv.width, cv.height);
      g.addColorStop(0, '#090d16');
      g.addColorStop(1, slotData.installedGame ? '#1e3a8a' : '#450a0a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(slotData.console.platform + ' READY', 34, 42);
      ctx.fillStyle = slotData.installedGame ? '#4ade80' : '#fca5a5';
      ctx.font = 'bold 11px Arial';
      ctx.fillText(slotData.installedGame ? slotData.installedGame.title.slice(0, 18) : 'PASANG KASET GAME', 16, 64);
      tex.needsUpdate = true;
      return;
    }

    const gameTitle = (slotData.installedGame ? slotData.installedGame.title : 'PES').toLowerCase();
    if (gameTitle.includes('winning') || gameTitle.includes('pes') || gameTitle.includes('fc') || gameTitle.includes('fifa') || gameTitle.includes('soccer')) {
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, 160, 96);
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.strokeRect(8, 8, 144, 80);
      ctx.beginPath(); ctx.arc(80, 48, 16, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(80, 8); ctx.lineTo(80, 88); ctx.stroke();
      const bx = 80 + Math.sin(timeSec * 3.2) * 46;
      const by = 48 + Math.cos(timeSec * 2.5) * 26;
      ctx.fillStyle = '#ef4444'; ctx.fillRect(bx - 12, by - 5, 6, 10);
      ctx.fillStyle = '#3b82f6'; ctx.fillRect(bx + 7, by - 4, 6, 10);
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(bx, by, 3.5, 0, Math.PI * 2); ctx.fill();
    } else if (gameTitle.includes('racing') || gameTitle.includes('need') || gameTitle.includes('downhill') || gameTitle.includes('turismo') || gameTitle.includes('nascar')) {
      ctx.fillStyle = '#0284c7'; ctx.fillRect(0, 0, 160, 44);
      ctx.fillStyle = '#14532d'; ctx.fillRect(0, 44, 160, 52);
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      const curve = Math.sin(timeSec * 2.2) * 22;
      ctx.moveTo(68 + curve, 44); ctx.lineTo(92 + curve, 44);
      ctx.lineTo(140, 96); ctx.lineTo(20, 96); ctx.fill();
      const cx = 80 + Math.sin(timeSec * 4) * 18;
      ctx.fillStyle = '#ef4444'; ctx.fillRect(cx - 12, 74, 24, 13);
    } else {
      ctx.fillStyle = '#1e1b4b'; ctx.fillRect(0, 0, 160, 68);
      ctx.fillStyle = '#334155'; ctx.fillRect(0, 68, 160, 28);
      ctx.fillStyle = '#22c55e'; ctx.fillRect(10, 10, 56, 7);
      ctx.fillStyle = '#eab308'; ctx.fillRect(94, 10, 56, 7);
      const f1x = 56 + Math.sin(timeSec * 6) * 10;
      const f2x = 96 + Math.cos(timeSec * 6) * 10;
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(f1x, 38, 12, 30);
      ctx.fillStyle = '#f43f5e'; ctx.fillRect(f2x, 38, 12, 30);
    }
    tex.needsUpdate = true;
  }

  function buildRentalWorld() {
    const container = document.getElementById('studio3dViewport');
    if (!container || typeof THREE === 'undefined') return;
    container.innerHTML = '';

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060a12);
    scene.fog = new THREE.FogExp2(0x060a12, 0.015);

    camera = new THREE.PerspectiveCamera(44, window.innerWidth / Math.max(1, window.innerHeight), 0.1, 200);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    clock = new THREE.Clock();
    raycaster = new THREE.Raycaster();
    mouseVec = new THREE.Vector2();

    // Pencahayaan Interior Ruko
    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.78);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xfff7ed, 0.95);
    dir.position.set(10, 22, 14);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 1024;
    dir.shadow.mapSize.height = 1024;
    scene.add(dir);

    // Lantai Keramik Ruko
    const tileTex = createTileFloorTexture('#1e293b', 'rgba(255,255,255,0.08)');
    floorMat = new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.45, metalness: 0.08 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 18), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Dinding Ruko + Papan Neon Sign
    wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(24, 3.6, 0.3), wallMat);
    backWall.position.set(0, 1.8, -9);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 1.8), new THREE.MeshBasicMaterial({ map: createNeonSignTexture() }));
    signMesh.position.set(0, 2.35, -8.82);
    scene.add(signMesh);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.6, 18), wallMat);
    leftWall.position.set(-12, 1.8, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.6, 18), wallMat);
    rightWall.position.set(12, 1.8, 0);
    scene.add(rightWall);

    // Meja Kasir & Etalase Konter Pulsa / Stik / Dus Makanan (Bisa Di-Tap!)
    const cashierGroup = new THREE.Group();
    const desk = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.05, 1.3), new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 }));
    desk.position.set(0, 0.525, 0);
    desk.castShadow = true;
    desk.userData = { clickAction: 'cashier' };
    clickableObjects.push(desk);
    cashierGroup.add(desk);

    const glassCase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.65, 0.85), new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.42, roughness: 0.1 }));
    glassCase.position.set(0.85, 1.38, 0);
    glassCase.userData = { clickAction: 'cashier' };
    clickableObjects.push(glassCase);
    cashierGroup.add(glassCase);

    cashierGroup.position.set(-7.5, 0, 6.2);
    scene.add(cashierGroup);

    // Sofa Ruang Tunggu Antrean
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    for (let b = 0; b < 2; b++) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.42, 0.85), benchMat);
      bench.position.set(5.5, 0.21, 5.4 + b * 1.65);
      bench.castShadow = true;
      scene.add(bench);
    }

    // Noda Kotoran Lantai
    dirtMeshes.length = 0;
    const dirtMat = new THREE.MeshBasicMaterial({ color: 0x451a03, transparent: true, opacity: 0.65 });
    for (let d = 0; d < 14; d++) {
      const dm = new THREE.Mesh(new THREE.CircleGeometry(0.38, 12), dirtMat);
      dm.rotation.x = -Math.PI / 2;
      dm.position.set(-8 + (d * 1.3) % 16, 0.02, -5 + ((d * 2.7) % 11));
      dm.visible = false;
      scene.add(dm);
      dirtMeshes.push(dm);
    }

    // ==================== 20 SLOT RENTAL PS (HANYA TAMPIL JIKA SUDAH DIPASANG TV/PS!) ====================
    slotMeshes.length = 0;
    for (let i = 0; i < 20; i++) {
      const isRoom = i >= 10;
      const g = new THREE.Group();
      let sx, sz;
      if (!isRoom) {
        const row = Math.floor(i / 5);
        const col = i % 5;
        sx = -9.6 + col * 2.15;
        sz = -5.5 + row * 4.3;
      } else {
        const rIdx = i - 10;
        const row = Math.floor(rIdx / 5);
        const col = rIdx % 5;
        sx = 1.6 + col * 2.25;
        sz = -5.8 + row * 4.8;
      }
      g.position.set(sx, 0, sz);

      // Penanda Lantai Halus saat Slot Masih Kosong (Bisa di-tap untuk pasang unit)
      const padMat = new THREE.MeshBasicMaterial({ color: isRoom ? 0x4f46e5 : 0x0284c7, transparent: true, opacity: 0.22 });
      const emptyPad = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.9), padMat);
      emptyPad.rotation.x = -Math.PI / 2;
      emptyPad.position.y = 0.015;
      emptyPad.userData = { slotId: i + 1 };
      clickableObjects.push(emptyPad);
      g.add(emptyPad);

      // Grup Furnitur Unit (Meja, Sofa, Sekat Room, TV, PS, Kipas, AC) -> DISamarkan/Sembunyikan jika slot belum dipasang TV/PS!
      const unitGroup = new THREE.Group();

      if (isRoom) {
        const partMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, transparent: true, opacity: 0.72, roughness: 0.6 });
        const wL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 2.4), partMat);
        wL.position.set(-1.05, 1.1, 0);
        const wR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 2.4), partMat);
        wR.position.set(1.05, 1.1, 0);
        const wB = new THREE.Mesh(new THREE.BoxGeometry(2.22, 2.2, 0.12), partMat);
        wB.position.set(0, 1.1, -1.18);
        unitGroup.add(wL, wR, wB);
      }

      // Meja Rak TV
      const table = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.56, 0.68), new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 }));
      table.position.set(0, 0.28, -0.7);
      table.castShadow = true;
      table.userData = { slotId: i + 1 };
      clickableObjects.push(table);
      unitGroup.add(table);

      // Sofa / Kursi Gaming Empuk dengan Sandaran Punggung & Sandaran Tangan
      const sofaGroup = new THREE.Group();
      const sofaColor = isRoom ? 0x4f46e5 : 0x0369a1;
      const sofaMat = new THREE.MeshStandardMaterial({ color: sofaColor, roughness: 0.6 });
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.34, 0.72), sofaMat);
      cushion.position.set(0, 0.17, 0.55);
      cushion.castShadow = true;
      const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.55, 0.18), sofaMat);
      backrest.position.set(0, 0.55, 0.84);
      backrest.rotation.x = 0.12;
      backrest.castShadow = true;
      sofaGroup.add(cushion, backrest);
      unitGroup.add(sofaGroup);

      // TV
      const tvScreen = createTvScreenCanvas();
      const tvGroup = new THREE.Group();
      const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.8, 0.14), new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.4 }));
      tvFrame.position.set(0, 0.98, -0.72);
      tvFrame.castShadow = true;
      tvFrame.userData = { slotId: i + 1 };
      clickableObjects.push(tvFrame);
      const tvPanel = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 0.7), new THREE.MeshBasicMaterial({ map: tvScreen.tex }));
      tvPanel.position.set(0, 0.98, -0.64);
      tvGroup.add(tvFrame, tvPanel);
      unitGroup.add(tvGroup);

      // Konsol PS + Lampu LED Power Hijau
      const psGroup = new THREE.Group();
      const psBody = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.13, 0.34), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 }));
      const psLed = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
      psLed.position.set(0.18, 0.05, 0.17);
      psGroup.add(psBody, psLed);
      psGroup.position.set(0.42, 0.62, -0.62);
      unitGroup.add(psGroup);

      // Kipas Angin
      const fanGroup = new THREE.Group();
      const fanPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.35), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
      fanPole.position.set(-0.75, 0.67, -0.8);
      const fanBlade = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.09, 0.04), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
      fanBlade.position.set(-0.75, 1.38, -0.72);
      fanGroup.add(fanPole, fanBlade);
      unitGroup.add(fanGroup);

      // Unit AC Split
      const acMesh = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.28, 0.25), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 }));
      acMesh.position.set(0, 1.92, -0.95);
      unitGroup.add(acMesh);

      g.add(unitGroup);
      scene.add(g);
      slotMeshes.push({ group: g, emptyPad, unitGroup, tvGroup, tvScreen, psGroup, psBody, fanGroup, fanBlade, acMesh, sx, sz });
    }

    // Kontrol Kamera & Raycast Tap pada Objek 3D
    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', (e) => {
      isDragging = true;
      pointerDownPos = { x: e.clientX, y: e.clientY };
      prevMouse = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('pointerup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const distMoved = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (distMoved < 6) {
        handle3dTap(e.clientX, e.clientY);
      }
    });
    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      prevMouse = { x: e.clientX, y: e.clientY };
      camAngleH -= dx * 0.007;
      camAngleV = Math.max(0.28, Math.min(1.35, camAngleV + dy * 0.006));
    });
    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      camDist = Math.max(8, Math.min(34, camDist + e.deltaY * 0.015));
    }, { passive: false });

    window.addEventListener('resize', onResize);
    initialized = true;
    animate();
  }

  function handle3dTap(clientX, clientY) {
    if (!raycaster || !camera) return;
    mouseVec.x = (clientX / window.innerWidth) * 2 - 1;
    mouseVec.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouseVec, camera);
    const hits = raycaster.intersectObjects(clickableObjects, true);
    if (!hits.length) return;
    const hit = hits[0].object;
    if (hit.userData && hit.userData.slotId && typeof window.openSlotConfigModal === 'function') {
      window.openSlotConfigModal(hit.userData.slotId);
    } else if (hit.userData && hit.userData.clickAction === 'cashier' && typeof window.openDrawerTab === 'function') {
      window.openDrawerTab('cashier_stik');
    }
  }

  function onResize() {
    if (!renderer || !camera) return;
    camera.aspect = window.innerWidth / Math.max(1, window.innerHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function syncWorldWithState(timeSec, dt) {
    if (typeof state === 'undefined' || !state.slots) return;

    const rLv = (typeof RENOV_LEVELS !== 'undefined' && RENOV_LEVELS[state.renovLevel - 1]) || null;
    if (rLv && wallMat) wallMat.color.set(rLv.wallColor);

    const dirtyCount = Math.max(0, Math.floor(((100 - (state.cleanliness || 100)) / 100) * dirtMeshes.length));
    dirtMeshes.forEach((dm, idx) => { dm.visible = idx < dirtyCount; });

    const activeActorIds = new Set();

    // 1. Karakter Utama (Owner)
    const atSchool = typeof isPlayerAtSchool === 'function' ? isPlayerAtSchool() : false;
    if (!atSchool) {
      const pid = 'player_main';
      activeActorIds.add(pid);
      let pMesh = actorMap.get(pid);
      if (!pMesh) {
        const eth = (typeof ETHNICITIES !== 'undefined' && ETHNICITIES.find(e => e.id === state.player.ethnicity)) || { skin: '#f1c6a7' };
        pMesh = createArticulatedHuman3D(7, eth.skin, 0x2563eb, 0x0f172a, false);
        scene.add(pMesh);
        actorMap.set(pid, pMesh);
      }
      pMesh.position.set(-7.5 + Math.sin(timeSec * 0.8) * 0.45, 0, 5.0);
      pMesh.rotation.y = Math.sin(timeSec * 0.5) * 0.35;
    }

    // 2. Karyawan Aktif
    (state.employees || []).forEach((emp, idx) => {
      const onDuty = typeof isEmployeeOnDuty === 'function' ? isEmployeeOnDuty(emp) : true;
      if (!onDuty) return;
      const eid = 'emp_' + emp.id;
      activeActorIds.add(eid);
      let eMesh = actorMap.get(eid);
      if (!eMesh) {
        eMesh = createArticulatedHuman3D(100 + idx * 17, '#ecc0a1', 0x10b981, 0x1e293b, false);
        scene.add(eMesh);
        actorMap.set(eid, eMesh);
      }
      if (emp.tasks && emp.tasks.includes('clean')) {
        const wx = Math.sin(timeSec * 0.45 + idx) * 6.0;
        const wz = Math.cos(timeSec * 0.32 + idx) * 4.2;
        eMesh.position.set(wx, 0, wz);
        eMesh.rotation.y = timeSec * 0.45 + Math.PI / 2;
        eMesh.userData.armR.rotation.x = Math.sin(timeSec * 7) * 0.45;
        eMesh.userData.legL.rotation.x = Math.sin(timeSec * 5) * 0.35;
        eMesh.userData.legR.rotation.x = -Math.sin(timeSec * 5) * 0.35;
      } else {
        eMesh.position.set(-5.8 + idx * 1.1, 0, 5.2);
        eMesh.rotation.y = 0;
      }
    });

    // 3. 20 Slot Rental PS (HANYA TAMPILKAN FURNITUR JIKA SUDAH ADA PERANGKAT TERPASANG!)
    state.slots.forEach((slot, i) => {
      const sm = slotMeshes[i];
      if (!sm) return;
      const hasHardware = !!(slot.console || slot.tv || slot.cooling);
      sm.unitGroup.visible = hasHardware;
      sm.emptyPad.visible = !hasHardware;
      if (!hasHardware) return;

      sm.tvGroup.visible = !!slot.tv;
      sm.psGroup.visible = !!slot.console;
      if (slot.console) {
        const pColor = slot.console.platform === 'PS1' ? 0xcbd5e1 : slot.console.platform === 'PS5' ? 0xf8fafc : 0x1e293b;
        sm.psBody.material.color.setHex(pColor);
      }
      sm.fanGroup.visible = !!(slot.cooling && slot.cooling.type === 'fan');
      sm.acMesh.visible = !!(slot.cooling && slot.cooling.type === 'ac');
      if (sm.fanGroup.visible && !state.plnBlackout && state.kwh > 0) {
        sm.fanBlade.rotation.z += dt * 15;
      }

      drawAnimatedGameOnTv(sm.tvScreen, timeSec + i * 1.7, (!state.plnBlackout && state.kwh > 0) ? slot : null);

      if (slot.occupied) {
        const cid = 'cust_slot_' + i;
        activeActorIds.add(cid);
        let cMesh = actorMap.get(cid);
        if (!cMesh) {
          const skinList = ['#fce7d6', '#f1c6a7', '#e2ae8b', '#ecc0a1'];
          const shirtList = [0xef4444, 0xf59e0b, 0x8b5cf6, 0x06b6d4, 0xec4899, 0x3b82f6];
          const seed = (slot.customerSeed || (i * 19 + 5));
          cMesh = createArticulatedHuman3D(seed, skinList[seed % skinList.length], shirtList[seed % shirtList.length], 0x1e293b, true);
          scene.add(cMesh);
          actorMap.set(cid, cMesh);
        }
        cMesh.position.set(sm.sx, 0, sm.sz + 0.48);
        cMesh.rotation.y = Math.PI;
        cMesh.userData.armL.rotation.x = -0.68 + Math.sin(timeSec * 10 + i) * 0.1;
        cMesh.userData.armR.rotation.x = -0.68 + Math.cos(timeSec * 10 + i) * 0.1;
        cMesh.userData.headGroup.rotation.y = Math.sin(timeSec * 2 + i) * 0.1;
      }
    });

    // 4. Pelanggan di Ruang Tunggu Antrean
    (state.waitingQueue || []).forEach((wq, idx) => {
      const wid = 'wait_' + wq.id;
      activeActorIds.add(wid);
      let wMesh = actorMap.get(wid);
      if (!wMesh) {
        const shirtList = [0x14b8a6, 0xf97316, 0x6366f1, 0xe11d48];
        wMesh = createArticulatedHuman3D(wq.seed || (idx + 31), '#f1c6a7', shirtList[idx % shirtList.length], 0x334155, true);
        scene.add(wMesh);
        actorMap.set(wid, wMesh);
      }
      const row = Math.floor(idx / 4);
      const col = idx % 4;
      wMesh.position.set(4.1 + col * 0.95, 0, 5.4 + row * 1.65);
      wMesh.rotation.y = Math.PI;
    });

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

  window.resetStudio3dCamera = function () {
    camAngleH = 0.48; camAngleV = 0.72; camDist = 21;
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
