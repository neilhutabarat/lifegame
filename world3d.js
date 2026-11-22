/* world3d.js — Fullscreen 3D Rental PS Simulator (ala Warung Life Simulator) untuk ID Simulator by Oneilverse.
   - Fullscreen 3D viewport + HUD mengambang + tombol buka Menu / Catatan / Mode Klasik
   - Kontrol jalan karakter (WASD / Panah + Joystick sentuh di HP) & kamera mengikuti karakter */
(function () {
  'use strict';
  if (window.__ONEIL_3D_INIT) return;
  window.__ONEIL_3D_INIT = true;

  function loadThree(cb) {
    if (window.THREE) return cb();
    var s = document.createElement('script');
    s.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
    s.onload = cb;
    document.head.appendChild(s);
  }

  function buildFullscreenUI() {
    if (document.getElementById('w3d-fs')) return;
    var root = document.createElement('div');
    root.id = 'w3d-fs';
    root.style.cssText = 'position:fixed;inset:0;z-index:900;background:#070b16;overflow:hidden;font-family:system-ui,-apple-system,sans-serif;';
    root.innerHTML =
      '<div id="w3d-canvas" style="position:absolute;inset:0;touch-action:none;"></div>' +
      // Top HUD
      '<div style="position:absolute;top:12px;left:12px;right:12px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;pointer-events:none;">' +
        '<div style="pointer-events:auto;display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:8px 14px;border-radius:14px;background:rgba(15,23,42,.78);backdrop-filter:blur(10px);color:#f8fafc;border:1px solid rgba(255,255,255,.12);font-size:12px;font-weight:700;">' +
          '<span>🎮 Rental PS</span>' +
          '<span id="w3d-time" style="color:#93c5fd;">--</span>' +
          '<span id="w3d-cash" style="color:#4ade80;">Rp 0</span>' +
          '<span id="w3d-laci" style="color:#c084fc;">Laci: Rp 0</span>' +
        '</div>' +
        '<div style="pointer-events:auto;display:flex;gap:6px;flex-wrap:wrap;">' +
          '<button id="w3d-spawn" type="button" style="padding:8px 12px;border-radius:12px;border:0;background:#22c55e;color:#04210f;font-weight:800;font-size:12px;cursor:pointer;">+ Tamu</button>' +
          '<button id="w3d-menu" type="button" style="padding:8px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:rgba(15,23,42,.85);color:#fff;font-weight:800;font-size:12px;cursor:pointer;">📱 Menu &amp; Usaha</button>' +
          '<button id="w3d-classic" type="button" style="padding:8px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:rgba(15,23,42,.85);color:#cbd5e1;font-weight:700;font-size:12px;cursor:pointer;">Tutup 3D</button>' +
        '</div>' +
      '</div>' +
      // Bottom-left D-pad / Mobile controls + hint
      '<div style="position:absolute;left:14px;bottom:14px;display:flex;flex-direction:column;align-items:center;gap:4px;user-select:none;">' +
        '<button data-mv="up" type="button" style="width:44px;height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:rgba(15,23,42,.72);color:#fff;font-size:16px;font-weight:800;">▲</button>' +
        '<div style="display:flex;gap:4px;">' +
          '<button data-mv="left" type="button" style="width:44px;height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:rgba(15,23,42,.72);color:#fff;font-size:16px;font-weight:800;">◀</button>' +
          '<button data-mv="down" type="button" style="width:44px;height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:rgba(15,23,42,.72);color:#fff;font-size:16px;font-weight:800;">▼</button>' +
          '<button data-mv="right" type="button" style="width:44px;height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:rgba(15,23,42,.72);color:#fff;font-size:16px;font-weight:800;">▶</button>' +
        '</div>' +
        '<div style="font-size:10px;color:#94a3b8;margin-top:2px;">WASD / Panah · Seret layar putar kamera</div>' +
      '</div>' +
      // Bottom-right quick action
      '<div style="position:absolute;right:14px;bottom:14px;">' +
        '<button id="w3d-act" type="button" style="padding:12px 18px;border-radius:999px;border:0;background:#3b82f6;color:#fff;font-weight:800;font-size:13px;box-shadow:0 8px 24px rgba(59,130,246,.45);cursor:pointer;">🕹️ Kelola Rental</button>' +
      '</div>';
    document.body.appendChild(root);

    document.getElementById('w3d-classic').onclick = function () {
      root.style.display = 'none';
      if (!document.getElementById('w3d-reopen')) {
        var b = document.createElement('button');
        b.id = 'w3d-reopen'; b.type = 'button';
        b.textContent = '🎮 Masuk Mode 3D';
        b.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:950;padding:10px 16px;border-radius:999px;border:0;background:#2563eb;color:#fff;font-weight:800;font-size:12px;box-shadow:0 8px 24px rgba(37,99,235,.45);cursor:pointer;';
        b.onclick = function () { root.style.display = 'block'; b.style.display = 'none'; };
        document.body.appendChild(b);
      } else {
        document.getElementById('w3d-reopen').style.display = 'block';
      }
    };
    document.getElementById('w3d-menu').onclick = function () {
      document.getElementById('w3d-classic').click();
    };
    document.getElementById('w3d-act').onclick = function () {
      document.getElementById('w3d-classic').click();
      var cw = document.getElementById('centerWorkspace');
      if (cw) cw.scrollIntoView({ behavior: 'smooth' });
    };
  }

  function start3D() {
    buildFullscreenUI();
    var wrap = document.getElementById('w3d-canvas');
    if (!wrap || wrap.dataset.ready) return;
    wrap.dataset.ready = '1';

    var T = window.THREE;
    var scene = new T.Scene();
    scene.background = new T.Color(0x0d1324);

    var camera = new T.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 100);
    var camYaw = 0.25, camPitch = 0.42, camDist = 7.5;

    var renderer = new T.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    wrap.appendChild(renderer.domElement);

    // Camera drag & zoom
    var dragging = false, lx = 0, ly = 0;
    renderer.domElement.addEventListener('pointerdown', function (e) { dragging = true; lx = e.clientX; ly = e.clientY; });
    window.addEventListener('pointerup', function () { dragging = false; });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      camYaw -= (e.clientX - lx) * 0.007;
      camPitch = Math.max(0.15, Math.min(1.15, camPitch + (e.clientY - ly) * 0.007));
      lx = e.clientX; ly = e.clientY;
    });
    renderer.domElement.addEventListener('wheel', function (e) {
      e.preventDefault();
      camDist = Math.max(4, Math.min(18, camDist + e.deltaY * 0.01));
    }, { passive: false });

    // Lights
    var amb = new T.AmbientLight(0xcbd5e1, 0.78);
    scene.add(amb);
    var sun = new T.DirectionalLight(0xfffbeb, 1.15);
    sun.position.set(8, 14, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);

    var roomLight = new T.PointLight(0x93c5fd, 0.85, 24);
    roomLight.position.set(0, 4.2, 0);
    scene.add(roomLight);

    // Floor & Walls
    var floor = new T.Mesh(new T.BoxGeometry(14, 0.2, 10), new T.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 }));
    floor.position.y = -0.1; floor.receiveShadow = true; scene.add(floor);
    var grid = new T.GridHelper(14, 14, 0x334155, 0x263244);
    grid.position.y = 0.01; scene.add(grid);

    var wallMat = new T.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
    var backWall = new T.Mesh(new T.BoxGeometry(14, 4.2, 0.2), wallMat);
    backWall.position.set(0, 2.1, -4.9); backWall.receiveShadow = true; scene.add(backWall);
    var leftWall = new T.Mesh(new T.BoxGeometry(0.2, 4.2, 10), wallMat);
    leftWall.position.set(-6.9, 2.1, 0); scene.add(leftWall);

    // Neon Sign
    var signMesh = new T.Mesh(
      new T.BoxGeometry(4.4, 0.65, 0.12),
      new T.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x1d4ed8, emissiveIntensity: 0.95 })
    );
    signMesh.position.set(0, 3.3, -4.75); scene.add(signMesh);

    // Cashier Desk
    var desk = new T.Mesh(new T.BoxGeometry(2.2, 1.0, 1.1), new T.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 }));
    desk.position.set(4.8, 0.5, 2.6); desk.castShadow = true; desk.receiveShadow = true; scene.add(desk);
    var monitor = new T.Mesh(new T.BoxGeometry(0.7, 0.45, 0.08), new T.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0284c7, emissiveIntensity: 0.6 }));
    monitor.position.set(4.8, 1.25, 2.6); scene.add(monitor);

    function makeChar(shirtColor, pantsColor) {
      var g = new T.Group();
      var skin = new T.MeshStandardMaterial({ color: 0xf1c27d });
      var shirt = new T.MeshStandardMaterial({ color: shirtColor });
      var pants = new T.MeshStandardMaterial({ color: pantsColor });
      var hair = new T.MeshStandardMaterial({ color: 0x1e1b18 });

      var body = new T.Mesh(new T.BoxGeometry(0.46, 0.56, 0.26), shirt);
      body.position.y = 0.96; body.castShadow = true; g.add(body);
      var head = new T.Mesh(new T.BoxGeometry(0.34, 0.34, 0.34), skin);
      head.position.y = 1.44; head.castShadow = true; g.add(head);
      var cap = new T.Mesh(new T.BoxGeometry(0.36, 0.12, 0.36), hair);
      cap.position.y = 1.62; g.add(cap);

      var legL = new T.Mesh(new T.BoxGeometry(0.18, 0.62, 0.18), pants);
      legL.position.set(-0.12, 0.34, 0); legL.castShadow = true;
      var legR = legL.clone(); legR.position.x = 0.12;
      g.add(legL, legR);

      var armL = new T.Mesh(new T.BoxGeometry(0.14, 0.48, 0.14), shirt);
      armL.position.set(-0.32, 0.96, 0); armL.castShadow = true;
      var armR = armL.clone(); armR.position.x = 0.32;
      g.add(armL, armR);

      g.userData = { legL: legL, legR: legR, armL: armL, armR: armR, body: body };
      return g;
    }

    // Controllable Player Character
    var player = makeChar(0x2563eb, 0x0f172a);
    player.position.set(1.5, 0, 2.2);
    scene.add(player);

    // Input state (Keyboard + Mobile D-pad)
    var keys = { up: false, down: false, left: false, right: false };
    window.addEventListener('keydown', function (e) {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.up = true;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.down = true;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = true;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = true;
    });
    window.addEventListener('keyup', function (e) {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.up = false;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.down = false;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = false;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = false;
    });
    document.querySelectorAll('[data-mv]').forEach(function (btn) {
      var dir = btn.getAttribute('data-mv');
      btn.addEventListener('pointerdown', function (e) { e.preventDefault(); keys[dir] = true; });
      btn.addEventListener('pointerup', function () { keys[dir] = false; });
      btn.addEventListener('pointerleave', function () { keys[dir] = false; });
    });

    // 5 PS Stations
    var stations = [];
    var xs = [-5.0, -2.5, 0.0, 2.5, 5.0];
    xs.forEach(function (x, idx) {
      var tbl = new T.Mesh(new T.BoxGeometry(1.6, 0.55, 0.65), new T.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 }));
      tbl.position.set(x, 0.275, -4.1); tbl.castShadow = true; tbl.receiveShadow = true; scene.add(tbl);

      var ps = new T.Mesh(new T.BoxGeometry(0.42, 0.1, 0.32), new T.MeshStandardMaterial({ color: 0x020617, roughness: 0.35 }));
      ps.position.set(x - 0.42, 0.6, -4.05); scene.add(ps);

      var ledMat = new T.MeshBasicMaterial({ color: 0xef4444 });
      var led = new T.Mesh(new T.BoxGeometry(0.12, 0.03, 0.04), ledMat);
      led.position.set(x - 0.42, 0.64, -3.88); scene.add(led);

      var cv = document.createElement('canvas'); cv.width = 160; cv.height = 96;
      var ctx = cv.getContext('2d');
      var tex = new T.CanvasTexture(cv);
      var scrMat = new T.MeshBasicMaterial({ map: tex });
      var tv = new T.Mesh(new T.BoxGeometry(1.42, 0.84, 0.08), new T.MeshStandardMaterial({ color: 0x090d16 }));
      tv.position.set(x, 1.15, -4.25); tv.castShadow = true; scene.add(tv);

      var screen = new T.Mesh(new T.PlaneGeometry(1.32, 0.74), scrMat);
      screen.position.set(x, 1.15, -4.205); scene.add(screen);

      var glow = new T.PointLight(0x38bdf8, 0, 3.8);
      glow.position.set(x, 1.2, -3.6); scene.add(glow);

      var sofa = new T.Mesh(new T.BoxGeometry(1.45, 0.42, 0.72), new T.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.8 }));
      sofa.position.set(x, 0.21, -2.5); sofa.castShadow = true; sofa.receiveShadow = true; scene.add(sofa);
      var back = new T.Mesh(new T.BoxGeometry(1.45, 0.5, 0.16), new T.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.8 }));
      back.position.set(x, 0.55, -2.22); scene.add(back);

      stations.push({
        id: idx, x: x, busy: false, cv: cv, ctx: ctx, tex: tex,
        ledMat: ledMat, glow: glow, ballX: 40 + idx * 15, ballY: 40, vx: 2.2, vy: 1.7, score: 0
      });
    });

    // NPCs
    var npcs = [];
    var shirtPalette = [0x10b981, 0xf59e0b, 0xec4899, 0x8b5cf6, 0x06b6d4, 0xef4444];
    function spawnCustomer() {
      var free = stations.filter(function (s) { return !s.busy; });
      if (!free.length) return;
      var st = free[Math.floor(Math.random() * free.length)];
      st.busy = true;
      var mesh = makeChar(shirtPalette[Math.floor(Math.random() * shirtPalette.length)], 0x1e293b);
      mesh.position.set(-5.8, 0, 4.2);
      scene.add(mesh);
      npcs.push({ mesh: mesh, station: st, state: 'walkToSeat', timer: 7 + Math.random() * 6, walkT: 0 });
    }
    document.getElementById('w3d-spawn').onclick = spawnCustomer;
    spawnCustomer();
    setTimeout(spawnCustomer, 900);

    function drawTv(st) {
      var c = st.ctx, w = st.cv.width, h = st.cv.height;
      if (!st.busy) {
        c.fillStyle = '#070b14'; c.fillRect(0, 0, w, h);
        st.ledMat.color.setHex(0xef4444); st.glow.intensity = 0; st.tex.needsUpdate = true;
        return;
      }
      st.ledMat.color.setHex(0x22c55e); st.glow.intensity = 0.85;
      c.fillStyle = '#064e3b'; c.fillRect(0, 0, w, h);
      c.strokeStyle = '#34d399'; c.lineWidth = 2; c.strokeRect(6, 6, w - 12, h - 12);
      c.beginPath(); c.moveTo(w / 2, 6); c.lineTo(w / 2, h - 6); c.stroke();
      c.beginPath(); c.arc(w / 2, h / 2, 14, 0, Math.PI * 2); c.stroke();
      st.ballX += st.vx; st.ballY += st.vy;
      if (st.ballX < 14 || st.ballX > w - 14) { st.vx *= -1; st.score++; }
      if (st.ballY < 14 || st.ballY > h - 14) st.vy *= -1;
      c.fillStyle = '#38bdf8'; c.fillRect(18, st.ballY - 10, 6, 20);
      c.fillStyle = '#fb7185'; c.fillRect(w - 24, h - st.ballY - 10, 6, 20);
      c.fillStyle = '#fef08a'; c.beginPath(); c.arc(st.ballX, st.ballY, 4.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ffffff'; c.font = 'bold 10px monospace';
      c.fillText('P1 ' + (st.score % 9) + ' - ' + ((st.score + 1) % 7) + ' P2', 46, 17);
      st.tex.needsUpdate = true;
    }

    function syncHud() {
      var t = document.getElementById('hudDateTime'), h = document.getElementById('hudHand'), l = document.getElementById('hudLaci');
      if (t) document.getElementById('w3d-time').textContent = t.textContent;
      if (h) document.getElementById('w3d-cash').textContent = h.textContent;
      if (l) document.getElementById('w3d-laci').textContent = 'Laci: ' + l.textContent;
      var m = t && /(\d{2}):(\d{2})/.exec(t.textContent || '');
      if (m) {
        var hr = parseInt(m[1], 10), night = hr < 6 || hr >= 18;
        amb.intensity = night ? 0.45 : 0.85;
        sun.intensity = night ? 0.25 : 1.15;
        roomLight.intensity = night ? 1.25 : 0.6;
        scene.background.setHex(night ? 0x070b16 : 0x142038);
      }
    }

    var clock = new T.Clock(), pWalk = 0;
    function animate() {
      requestAnimationFrame(animate);
      var dt = Math.min(clock.getDelta(), 0.05), elapsed = clock.elapsedTime;
      syncHud();
      stations.forEach(drawTv);

      // Player movement relative to camera yaw
      var mx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      var mz = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
      if (mx !== 0 || mz !== 0) {
        var ang = Math.atan2(mx, mz) + camYaw;
        player.position.x = Math.max(-6.2, Math.min(6.2, player.position.x + Math.sin(ang) * dt * 3.6));
        player.position.z = Math.max(-3.2, Math.min(4.4, player.position.z + Math.cos(ang) * dt * 3.6));
        player.rotation.y = ang;
        pWalk += dt * 11;
        player.userData.legL.rotation.x = Math.sin(pWalk) * 0.65;
        player.userData.legR.rotation.x = -Math.sin(pWalk) * 0.65;
        player.userData.armL.rotation.x = -Math.sin(pWalk) * 0.5;
        player.userData.armR.rotation.x = Math.sin(pWalk) * 0.5;
      } else {
        player.userData.legL.rotation.x = 0; player.userData.legR.rotation.x = 0;
        player.userData.armL.rotation.x = Math.sin(elapsed * 2) * 0.06;
        player.userData.armR.rotation.x = -Math.sin(elapsed * 2) * 0.06;
      }

      // Third-person camera follow player
      var tx = player.position.x, ty = 1.2, tz = player.position.z;
      camera.position.x = tx + camDist * Math.sin(camYaw) * Math.cos(camPitch);
      camera.position.y = ty + camDist * Math.sin(camPitch);
      camera.position.z = tz + camDist * Math.cos(camYaw) * Math.cos(camPitch);
      camera.lookAt(tx, ty, tz);

      // NPCs
      for (var i = npcs.length - 1; i >= 0; i--) {
        var n = npcs[i], m = n.mesh, u = m.userData, gx = 0, gz = 0;
        if (n.state === 'walkToSeat') {
          gx = n.station.x; gz = -2.5;
          var dx = gx - m.position.x, dz = gz - m.position.z, d = Math.hypot(dx, dz);
          if (d > 0.12) {
            m.position.x += (dx / d) * dt * 2.4; m.position.z += (dz / d) * dt * 2.4;
            m.rotation.y = Math.atan2(dx, dz); n.walkT += dt * 9;
            u.legL.rotation.x = Math.sin(n.walkT) * 0.6; u.legR.rotation.x = -Math.sin(n.walkT) * 0.6;
            u.armL.rotation.x = -Math.sin(n.walkT) * 0.45; u.armR.rotation.x = Math.sin(n.walkT) * 0.45;
          } else {
            n.state = 'playing'; m.position.set(n.station.x, 0, -2.55); m.rotation.y = Math.PI;
            u.legL.rotation.x = -1.2; u.legR.rotation.x = -1.2;
          }
        } else if (n.state === 'playing') {
          n.timer -= dt;
          u.armL.rotation.x = -0.9 + Math.sin(elapsed * 10 + i) * 0.12;
          u.armR.rotation.x = -0.9 + Math.cos(elapsed * 10 + i) * 0.12;
          if (n.timer <= 0) { n.state = 'walkToPay'; n.station.busy = false; u.legL.rotation.x = 0; u.legR.rotation.x = 0; }
        } else if (n.state === 'walkToPay') {
          gx = 4.0; gz = 2.6;
          var dx2 = gx - m.position.x, dz2 = gz - m.position.z, d2 = Math.hypot(dx2, dz2);
          if (d2 > 0.15) {
            m.position.x += (dx2 / d2) * dt * 2.4; m.position.z += (dz2 / d2) * dt * 2.4;
            m.rotation.y = Math.atan2(dx2, dz2); n.walkT += dt * 9;
            u.legL.rotation.x = Math.sin(n.walkT) * 0.6; u.legR.rotation.x = -Math.sin(n.walkT) * 0.6;
          } else n.state = 'walkExit';
        } else if (n.state === 'walkExit') {
          gx = -5.8; gz = 4.2;
          var dx3 = gx - m.position.x, dz3 = gz - m.position.z, d3 = Math.hypot(dx3, dz3);
          if (d3 > 0.2) {
            m.position.x += (dx3 / d3) * dt * 2.4; m.position.z += (dz3 / d3) * dt * 2.4;
            m.rotation.y = Math.atan2(dx3, dz3); n.walkT += dt * 9;
            u.legL.rotation.x = Math.sin(n.walkT) * 0.6; u.legR.rotation.x = -Math.sin(n.walkT) * 0.6;
          } else { scene.remove(m); npcs.splice(i, 1); setTimeout(spawnCustomer, 1500); }
        }
      }

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  function boot() {
    loadThree(start3D);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
