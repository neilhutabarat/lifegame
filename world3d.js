/* world3d.js — Viewport 3D Rental PS Interaktif (Three.js) untuk ID Simulator by Oneilverse.
   Menampilkan 5 unit TV/PS dengan animasi game nyata di layar, pelanggan datang/duduk/main/bayar,
   siklus siang-malam dari #hudDateTime, serta kontrol kamera putar & zoom. */
(function () {
  'use strict';
  if (window.__ONEIL_3D_INIT) return;
  window.__ONEIL_3D_INIT = true;

  function loadThree(cb) {
    if (window.THREE) return cb();
    var s = document.createElement('script');
    s.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
    s.onload = cb;
    s.onerror = function () {
      var box = document.getElementById('world3d-status');
      if (box) box.textContent = 'Gagal memuat Three.js (periksa koneksi internet).';
    };
    document.head.appendChild(s);
  }

  function ensureHost() {
    var cw = document.getElementById('centerWorkspace');
    if (!cw) return null;
    var host = document.getElementById('world3d-card');
    if (!host) {
      host = document.createElement('div');
      host.id = 'world3d-card';
      host.className = 'card';
      host.style.cssText = 'padding:10px;margin-bottom:10px;';
      host.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">' +
          '<div><h2 style="margin:0;font-size:0.95rem;">🎮 Studio 3D Rental PS</h2><div id="world3d-status" style="font-size:0.75rem;opacity:0.75;">Seret untuk putar kamera · Scroll untuk zoom</div></div>' +
          '<div style="display:flex;gap:6px;">' +
            '<button type="button" id="w3d-spawn" style="padding:5px 10px;border-radius:8px;font-size:0.75rem;font-weight:700;cursor:pointer;">+ Pelanggan</button>' +
            '<button type="button" id="w3d-reset" style="padding:5px 10px;border-radius:8px;font-size:0.75rem;font-weight:700;cursor:pointer;">🎥 Reset</button>' +
          '</div>' +
        '</div>' +
        '<div id="world3d-canvas-wrap" style="position:relative;width:100%;height:320px;border-radius:12px;overflow:hidden;background:#0b1020;touch-action:none;"></div>';
      cw.insertBefore(host, cw.firstChild);
    }
    return document.getElementById('world3d-canvas-wrap');
  }

  function start3D() {
    var wrap = ensureHost();
    if (!wrap || wrap.dataset.ready) return;
    wrap.dataset.ready = '1';

    var T = window.THREE;
    var scene = new T.Scene();
    scene.background = new T.Color(0x0d1324);

    var camera = new T.PerspectiveCamera(48, (wrap.clientWidth || 600) / 320, 0.1, 100);
    var camYaw = 0.55, camPitch = 0.48, camDist = 13.5;
    var target = new T.Vector3(0, 1.0, 0);

    function updateCam() {
      camera.position.x = target.x + camDist * Math.sin(camYaw) * Math.cos(camPitch);
      camera.position.y = target.y + camDist * Math.sin(camPitch);
      camera.position.z = target.z + camDist * Math.cos(camYaw) * Math.cos(camPitch);
      camera.lookAt(target);
    }
    updateCam();

    var renderer = new T.WebGLRenderer({ antialias: true });
    renderer.setSize(wrap.clientWidth || 600, 320);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    wrap.appendChild(renderer.domElement);

    // Orbit drag & wheel zoom
    var dragging = false, lx = 0, ly = 0;
    renderer.domElement.addEventListener('pointerdown', function (e) { dragging = true; lx = e.clientX; ly = e.clientY; });
    window.addEventListener('pointerup', function () { dragging = false; });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      camYaw -= (e.clientX - lx) * 0.008;
      camPitch = Math.max(0.15, Math.min(1.25, camPitch + (e.clientY - ly) * 0.008));
      lx = e.clientX; ly = e.clientY;
      updateCam();
    });
    renderer.domElement.addEventListener('wheel', function (e) {
      e.preventDefault();
      camDist = Math.max(6, Math.min(22, camDist + e.deltaY * 0.01));
      updateCam();
    }, { passive: false });

    document.getElementById('w3d-reset').onclick = function () {
      camYaw = 0.55; camPitch = 0.48; camDist = 13.5; updateCam();
    };

    // Lights
    var amb = new T.AmbientLight(0xcbd5e1, 0.75);
    scene.add(amb);
    var sun = new T.DirectionalLight(0xfffbeb, 1.1);
    sun.position.set(8, 14, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);

    var roomLight = new T.PointLight(0x93c5fd, 0.7, 22);
    roomLight.position.set(0, 4.2, 0);
    scene.add(roomLight);

    // Floor & Walls
    var floor = new T.Mesh(
      new T.BoxGeometry(14, 0.2, 9),
      new T.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 })
    );
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    scene.add(floor);

    // Tile grid lines
    var grid = new T.GridHelper(14, 14, 0x334155, 0x263244);
    grid.position.y = 0.01;
    scene.add(grid);

    var wallMat = new T.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
    var backWall = new T.Mesh(new T.BoxGeometry(14, 4.2, 0.2), wallMat);
    backWall.position.set(0, 2.1, -4.4);
    backWall.receiveShadow = true;
    scene.add(backWall);

    var leftWall = new T.Mesh(new T.BoxGeometry(0.2, 4.2, 9), wallMat);
    leftWall.position.set(-6.9, 2.1, 0);
    scene.add(leftWall);

    // Neon sign on back wall
    var signMesh = new T.Mesh(
      new T.BoxGeometry(4.4, 0.65, 0.12),
      new T.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x1d4ed8, emissiveIntensity: 0.9 })
    );
    signMesh.position.set(0, 3.3, -4.25);
    scene.add(signMesh);

    // Cashier Desk (Right side)
    var desk = new T.Mesh(
      new T.BoxGeometry(2.2, 1.0, 1.1),
      new T.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 })
    );
    desk.position.set(4.8, 0.5, 2.2);
    desk.castShadow = true; desk.receiveShadow = true;
    scene.add(desk);

    var monitor = new T.Mesh(
      new T.BoxGeometry(0.7, 0.45, 0.08),
      new T.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0284c7, emissiveIntensity: 0.6 })
    );
    monitor.position.set(4.8, 1.25, 2.2);
    scene.add(monitor);

    // Helper: create articulated character (head, torso, arms, legs)
    function makeChar(shirtColor, pantsColor) {
      var g = new T.Group();
      var skin = new T.MeshStandardMaterial({ color: 0xf1c27d });
      var shirt = new T.MeshStandardMaterial({ color: shirtColor });
      var pants = new T.MeshStandardMaterial({ color: pantsColor });
      var hair = new T.MeshStandardMaterial({ color: 0x1e1b18 });

      var body = new T.Mesh(new T.BoxGeometry(0.46, 0.56, 0.26), shirt);
      body.position.y = 0.96; body.castShadow = true;
      g.add(body);

      var head = new T.Mesh(new T.BoxGeometry(0.34, 0.34, 0.34), skin);
      head.position.y = 1.44; head.castShadow = true;
      g.add(head);

      var cap = new T.Mesh(new T.BoxGeometry(0.36, 0.12, 0.36), hair);
      cap.position.y = 1.62;
      g.add(cap);

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

    // Owner / Player standing behind cashier
    var owner = makeChar(0x2563eb, 0x0f172a);
    owner.position.set(4.8, 0, 3.15);
    owner.rotation.y = Math.PI;
    scene.add(owner);

    // 5 PS Stations along the back wall
    var stations = [];
    var xs = [-5.0, -2.5, 0.0, 2.5, 5.0];
    xs.forEach(function (x, idx) {
      // TV Table
      var tbl = new T.Mesh(
        new T.BoxGeometry(1.6, 0.55, 0.65),
        new T.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 })
      );
      tbl.position.set(x, 0.275, -3.7);
      tbl.castShadow = true; tbl.receiveShadow = true;
      scene.add(tbl);

      // PS Console
      var ps = new T.Mesh(
        new T.BoxGeometry(0.42, 0.1, 0.32),
        new T.MeshStandardMaterial({ color: 0x020617, roughness: 0.35 })
      );
      ps.position.set(x - 0.42, 0.6, -3.65);
      scene.add(ps);

      var ledMat = new T.MeshBasicMaterial({ color: 0xef4444 });
      var led = new T.Mesh(new T.BoxGeometry(0.12, 0.03, 0.04), ledMat);
      led.position.set(x - 0.42, 0.64, -3.48);
      scene.add(led);

      // Dynamic CanvasTexture for real game animation on TV screen
      var cv = document.createElement('canvas');
      cv.width = 160; cv.height = 96;
      var ctx = cv.getContext('2d');
      var tex = new T.CanvasTexture(cv);
      var scrMat = new T.MeshBasicMaterial({ map: tex });
      var tv = new T.Mesh(new T.BoxGeometry(1.42, 0.84, 0.08), new T.MeshStandardMaterial({ color: 0x090d16 }));
      tv.position.set(x, 1.15, -3.85);
      tv.castShadow = true;
      scene.add(tv);

      var screen = new T.Mesh(new T.PlaneGeometry(1.32, 0.74), scrMat);
      screen.position.set(x, 1.15, -3.805);
      scene.add(screen);

      var glow = new T.PointLight(0x38bdf8, 0, 3.8);
      glow.position.set(x, 1.2, -3.2);
      scene.add(glow);

      // Sofa
      var sofa = new T.Mesh(
        new T.BoxGeometry(1.45, 0.42, 0.72),
        new T.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.8 })
      );
      sofa.position.set(x, 0.21, -2.1);
      sofa.castShadow = true; sofa.receiveShadow = true;
      scene.add(sofa);

      var back = new T.Mesh(
        new T.BoxGeometry(1.45, 0.5, 0.16),
        new T.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.8 })
      );
      back.position.set(x, 0.55, -1.82);
      scene.add(back);

      stations.push({
        id: idx, x: x, busy: false, cv: cv, ctx: ctx, tex: tex,
        ledMat: ledMat, glow: glow, ballX: 40 + idx * 15, ballY: 40, vx: 2.2, vy: 1.7, score: 0
      });
    });

    // NPC Customers
    var npcs = [];
    var shirtPalette = [0x10b981, 0xf59e0b, 0xec4899, 0x8b5cf6, 0x06b6d4, 0xef4444];

    function spawnCustomer() {
      var free = stations.filter(function (s) { return !s.busy; });
      if (!free.length) return;
      var st = free[Math.floor(Math.random() * free.length)];
      st.busy = true;
      var mesh = makeChar(shirtPalette[Math.floor(Math.random() * shirtPalette.length)], 0x1e293b);
      mesh.position.set(-5.8, 0, 3.8);
      scene.add(mesh);
      npcs.push({
        mesh: mesh, station: st, state: 'walkToSeat',
        timer: 6 + Math.random() * 6, walkT: 0
      });
    }

    document.getElementById('w3d-spawn').onclick = spawnCustomer;
    spawnCustomer();
    setTimeout(spawnCustomer, 900);

    function drawTv(st, t) {
      var c = st.ctx, w = st.cv.width, h = st.cv.height;
      if (!st.busy) {
        c.fillStyle = '#070b14';
        c.fillRect(0, 0, w, h);
        st.ledMat.color.setHex(0xef4444);
        st.glow.intensity = 0;
        st.tex.needsUpdate = true;
        return;
      }
      st.ledMat.color.setHex(0x22c55e);
      st.glow.intensity = 0.85;
      // Animated football / arcade mini-game on TV screen
      c.fillStyle = '#064e3b';
      c.fillRect(0, 0, w, h);
      c.strokeStyle = '#34d399';
      c.lineWidth = 2;
      c.strokeRect(6, 6, w - 12, h - 12);
      c.beginPath(); c.moveTo(w / 2, 6); c.lineTo(w / 2, h - 6); c.stroke();
      c.beginPath(); c.arc(w / 2, h / 2, 14, 0, Math.PI * 2); c.stroke();

      st.ballX += st.vx; st.ballY += st.vy;
      if (st.ballX < 14 || st.ballX > w - 14) { st.vx *= -1; st.score++; }
      if (st.ballY < 14 || st.ballY > h - 14) st.vy *= -1;

      // Two moving players on screen
      c.fillStyle = '#38bdf8';
      c.fillRect(18, st.ballY - 10, 6, 20);
      c.fillStyle = '#fb7185';
      c.fillRect(w - 24, h - st.ballY - 10, 6, 20);

      // Ball
      c.fillStyle = '#fef08a';
      c.beginPath(); c.arc(st.ballX, st.ballY, 4.5, 0, Math.PI * 2); c.fill();

      c.fillStyle = '#ffffff';
      c.font = 'bold 10px monospace';
      c.fillText('P1 ' + (st.score % 9) + ' - ' + ((st.score + 1) % 7) + ' P2', 46, 17);
      st.tex.needsUpdate = true;
    }

    function syncDayNight() {
      var el = document.getElementById('hudDateTime');
      if (!el) return;
      var m = /(\d{2}):(\d{2})/.exec(el.textContent || '');
      if (!m) return;
      var hr = parseInt(m[1], 10);
      var night = hr < 6 || hr >= 18;
      amb.intensity = night ? 0.45 : 0.85;
      sun.intensity = night ? 0.25 : 1.15;
      roomLight.intensity = night ? 1.2 : 0.55;
      scene.background.setHex(night ? 0x070b16 : 0x142038);
    }

    var clock = new T.Clock();
    function animate() {
      requestAnimationFrame(animate);
      var dt = Math.min(clock.getDelta(), 0.05);
      var elapsed = clock.elapsedTime;

      syncDayNight();
      stations.forEach(function (st) { drawTv(st, elapsed); });

      // Idle breathing for owner
      owner.userData.armL.rotation.x = Math.sin(elapsed * 2) * 0.08;
      owner.userData.armR.rotation.x = -Math.sin(elapsed * 2) * 0.08;

      for (var i = npcs.length - 1; i >= 0; i--) {
        var n = npcs[i], m = n.mesh, u = m.userData;
        var tx = 0, tz = 0;
        if (n.state === 'walkToSeat') {
          tx = n.station.x; tz = -2.1;
          var dx = tx - m.position.x, dz = tz - m.position.z, d = Math.hypot(dx, dz);
          if (d > 0.12) {
            m.position.x += (dx / d) * dt * 2.4;
            m.position.z += (dz / d) * dt * 2.4;
            m.rotation.y = Math.atan2(dx, dz);
            n.walkT += dt * 9;
            u.legL.rotation.x = Math.sin(n.walkT) * 0.6;
            u.legR.rotation.x = -Math.sin(n.walkT) * 0.6;
            u.armL.rotation.x = -Math.sin(n.walkT) * 0.45;
            u.armR.rotation.x = Math.sin(n.walkT) * 0.45;
          } else {
            n.state = 'playing';
            m.position.set(n.station.x, 0, -2.15);
            m.rotation.y = Math.PI; // Face TV
            u.legL.rotation.x = -1.2; u.legR.rotation.x = -1.2; // Sitting pose
          }
        } else if (n.state === 'playing') {
          n.timer -= dt;
          // Controller holding animation
          u.armL.rotation.x = -0.9 + Math.sin(elapsed * 10 + i) * 0.12;
          u.armR.rotation.x = -0.9 + Math.cos(elapsed * 10 + i) * 0.12;
          if (n.timer <= 0) {
            n.state = 'walkToPay';
            n.station.busy = false;
            u.legL.rotation.x = 0; u.legR.rotation.x = 0;
          }
        } else if (n.state === 'walkToPay') {
          tx = 4.0; tz = 2.2;
          var dx2 = tx - m.position.x, dz2 = tz - m.position.z, d2 = Math.hypot(dx2, dz2);
          if (d2 > 0.15) {
            m.position.x += (dx2 / d2) * dt * 2.4;
            m.position.z += (dz2 / d2) * dt * 2.4;
            m.rotation.y = Math.atan2(dx2, dz2);
            n.walkT += dt * 9;
            u.legL.rotation.x = Math.sin(n.walkT) * 0.6;
            u.legR.rotation.x = -Math.sin(n.walkT) * 0.6;
          } else {
            n.state = 'walkExit';
          }
        } else if (n.state === 'walkExit') {
          tx = -5.8; tz = 3.8;
          var dx3 = tx - m.position.x, dz3 = tz - m.position.z, d3 = Math.hypot(dx3, dz3);
          if (d3 > 0.2) {
            m.position.x += (dx3 / d3) * dt * 2.4;
            m.position.z += (dz3 / d3) * dt * 2.4;
            m.rotation.y = Math.atan2(dx3, dz3);
            n.walkT += dt * 9;
            u.legL.rotation.x = Math.sin(n.walkT) * 0.6;
            u.legR.rotation.x = -Math.sin(n.walkT) * 0.6;
          } else {
            scene.remove(m);
            npcs.splice(i, 1);
            setTimeout(spawnCustomer, 1500);
          }
        }
      }

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', function () {
      var w = wrap.clientWidth || 600;
      camera.aspect = w / 320;
      camera.updateProjectionMatrix();
      renderer.setSize(w, 320);
    });
  }

  function boot() {
    loadThree(function () {
      start3D();
      setInterval(start3D, 1500);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
