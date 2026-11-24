// MERIDIAN BAY — Golden Hour (Double Life)
// A 3D low-poly open-world crime game. Three.js, no build step, no network.
// Player: Mara Voss, double agent — drives for the crew, informs for the MBPD.
import * as THREE from 'three';

window.addEventListener('error', (e) => {
  const el = document.getElementById('err');
  if (el) { el.style.display = 'block'; el.textContent = 'ERR: ' + e.message; }
  document.title = 'ERR: ' + e.message;
});

// ---------------------------------------------------------------- constants
const YELLOW = 0xffc81e;
const SUNSET_TOP = '#5a2a72';
const SUNSET_MID = '#c14b63';
const SUNSET_LOW = '#ffb347';
const CITY = 190;            // half-size of drivable city
const ROAD_AT = [-120, -60, 0, 60, 120]; // avenue coordinates
const ROAD_W = 14;

// ---------------------------------------------------------------- renderer
const container = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x9a5a68, 120, 420);
const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 900);
camera.position.set(0, 9, 18);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------------------------------------------------------------- sky + sun
function skyTexture() {
  const c = document.createElement('canvas'); c.width = 4; c.height = 512;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.0, SUNSET_TOP);
  grad.addColorStop(0.45, SUNSET_MID);
  grad.addColorStop(0.75, '#e8703f');
  grad.addColorStop(1.0, SUNSET_LOW);
  g.fillStyle = grad; g.fillRect(0, 0, 4, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
scene.background = skyTexture();

const sunLight = new THREE.DirectionalLight(0xffc27a, 2.8);
sunLight.position.set(180, 55, -40);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.left = -220; sunLight.shadow.camera.right = 220;
sunLight.shadow.camera.top = 220; sunLight.shadow.camera.bottom = -220;
sunLight.shadow.camera.near = 1; sunLight.shadow.camera.far = 600;
sunLight.shadow.bias = -0.0002; sunLight.shadow.normalBias = 1.5;
scene.add(sunLight);
scene.add(new THREE.HemisphereLight(0xb08ac0, 0x4a3038, 1.1));
const fillLight = new THREE.DirectionalLight(0x6a7cff, 0.4);
fillLight.position.set(-120, 80, 120);
scene.add(fillLight);
// warm fill light that follows the camera so the hero car always reads
const camLight = new THREE.DirectionalLight(0xffe0b0, 0.85);
const camLightTarget = new THREE.Object3D();
scene.add(camLightTarget);
scene.add(camLight);
camLight.target = camLightTarget;

// big low sun disc on the eastern horizon
const sunDisc = new THREE.Mesh(
  new THREE.CircleGeometry(26, 40),
  new THREE.MeshBasicMaterial({ color: 0xffd9a0, fog: false })
);
sunDisc.position.set(330, 34, 30);
sunDisc.lookAt(camera.position);
scene.add(sunDisc);
const sunGlow = new THREE.Mesh(
  new THREE.CircleGeometry(46, 40),
  new THREE.MeshBasicMaterial({ color: 0xff8a3d, transparent: true, opacity: 0.35, fog: false })
);
sunGlow.position.set(332, 34, 30);
sunGlow.lookAt(camera.position);
scene.add(sunGlow);

// drifting pink clouds (flattened spheres)
const cloudMat = new THREE.MeshLambertMaterial({ color: 0xd96a8a, transparent: true, opacity: 0.85 });
const clouds = [];
for (let i = 0; i < 9; i++) {
  const cl = new THREE.Group();
  for (let j = 0; j < 3; j++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(9 + Math.random() * 7, 10, 8), cloudMat);
    s.scale.y = 0.32; s.position.set(j * 11 - 11, Math.random() * 2, Math.random() * 4);
    cl.add(s);
  }
  cl.position.set(-260 + Math.random() * 520, 95 + Math.random() * 45, -220 + Math.random() * 320);
  scene.add(cl); clouds.push(cl);
}

// ---------------------------------------------------------------- materials
const MAT = {
  asphalt: new THREE.MeshPhongMaterial({ color: 0x2e2a3c, shininess: 45, specular: 0x554433 }),
  roadLine: new THREE.MeshBasicMaterial({ color: 0xe8e2c8 }),
  sidewalk: new THREE.MeshLambertMaterial({ color: 0x4a4038 }),
  sand: new THREE.MeshLambertMaterial({ color: 0xb98d5f }),
  sea: new THREE.MeshLambertMaterial({ color: 0x14505e }),
  pierWood: new THREE.MeshLambertMaterial({ color: 0x6e4f30 }),
  pierPost: new THREE.MeshLambertMaterial({ color: 0x4a3421 }),
  trunk: new THREE.MeshLambertMaterial({ color: 0x5a3a26 }),
  frond: new THREE.MeshLambertMaterial({ color: 0x1e5c33 }),
  lampPole: new THREE.MeshLambertMaterial({ color: 0x2c2c34 }),
  lampGlow: new THREE.MeshBasicMaterial({ color: 0xffe9a8 }),
  crate: new THREE.MeshLambertMaterial({ color: 0x8a6a2f }),
  barrel: new THREE.MeshLambertMaterial({ color: 0x3d5a74 }),
  black: new THREE.MeshLambertMaterial({ color: 0x111114 }),
  glass: new THREE.MeshLambertMaterial({ color: 0x18242e }),
  tire: new THREE.MeshLambertMaterial({ color: 0x0c0c0e }),
  headlight: new THREE.MeshBasicMaterial({ color: 0xfff6c8 }),
  taillight: new THREE.MeshBasicMaterial({ color: 0xff2a2a }),
};

// lit-window facade textures (procedural, 3 variants)
function facadeTexture(base, litRatio) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 128, 256);
  const cols = 6, rows = 14, ww = 128 / cols, hh = 256 / rows;
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const lit = Math.random() < litRatio;
      if (lit) g.fillStyle = Math.random() < 0.7 ? '#ffd98a' : '#9fd4ff';
      else g.fillStyle = '#0e0e18';
      g.fillRect(col * ww + 3, r * hh + 4, ww - 6, hh - 8);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const facades = [
  facadeTexture('#241a33', 0.55),
  facadeTexture('#2e1f1f', 0.5),
  facadeTexture('#1b2340', 0.62),
];
function buildingMat(i) {
  const tex = facades[i % facades.length];
  return new THREE.MeshLambertMaterial({
    map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.55,
  });
}

// ---------------------------------------------------------------- ground + roads
const ground = new THREE.Mesh(new THREE.PlaneGeometry(560, 560), MAT.asphalt);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// road strips + dashed centre lines
function roadStrip(x, z, w, l, horizontal) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(horizontal ? l : w, horizontal ? w : l),
    new THREE.MeshPhongMaterial({ color: 0x3d364e, shininess: 70, specular: 0x775533 }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, 0.06, z);
  m.receiveShadow = true;
  scene.add(m);
  const n = Math.floor(l / 14);
  for (let i = 0; i < n; i++) {
    const d = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 0.5), MAT.roadLine);
    d.rotation.x = -Math.PI / 2;
    const t = -l / 2 + 7 + i * 14;
    d.position.set(horizontal ? t : x, 0.09, horizontal ? z : t);
    if (horizontal) d.rotation.z = Math.PI / 2;
    scene.add(d);
  }
}
for (const a of ROAD_AT) {
  roadStrip(a, 0, ROAD_W, 400, false);
  roadStrip(0, a, ROAD_W, 400, true);
  // sidewalks flanking each avenue
  for (const off of [-ROAD_W / 2 - 2.5, ROAD_W / 2 + 2.5]) {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(5, 400), MAT.sidewalk);
    sw.rotation.x = -Math.PI / 2; sw.position.set(a + off, 0.05, 0);
    sw.receiveShadow = true;
    scene.add(sw);
    const sw2 = new THREE.Mesh(new THREE.PlaneGeometry(400, 5), MAT.sidewalk);
    sw2.rotation.x = -Math.PI / 2; sw2.position.set(0, 0.05, a + off);
    sw2.receiveShadow = true;
    scene.add(sw2);
  }
}

// ---------------------------------------------------------------- buildings
const buildingBoxes = []; // {minX,maxX,minZ,maxZ} for collision
const blockCenters = [-150, -90, -30, 30, 90];
for (const bx of blockCenters) {
  for (const bz of blockCenters) {
    if (Math.random() < 0.12) continue; // a couple of empty lots / plazas
    const w = 30 + Math.random() * 10, d = 30 + Math.random() * 10;
    const h = 10 + Math.random() * 32;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), buildingMat((bx + bz) | 0));
    b.position.set(bx + (Math.random() * 4 - 2), h / 2, bz + (Math.random() * 4 - 2));
    b.castShadow = true; b.receiveShadow = true;
    scene.add(b);
    buildingBoxes.push({ minX: b.position.x - w / 2, maxX: b.position.x + w / 2, minZ: b.position.z - d / 2, maxZ: b.position.z + d / 2 });
    // rooftop box
    if (Math.random() < 0.5) {
      const r = new THREE.Mesh(new THREE.BoxGeometry(6, 2.5, 6), MAT.black);
      r.position.set(b.position.x + 6, h + 1.2, b.position.z - 5);
      scene.add(r);
    }
  }
}
// a few towers near the beach road for the skyline
for (let i = 0; i < 4; i++) {
  const h = 46 + Math.random() * 22;
  const t = new THREE.Mesh(new THREE.BoxGeometry(24, h, 24), buildingMat(i + 1));
  t.position.set(128, h / 2, -120 + i * 78);
  t.castShadow = true; t.receiveShadow = true;
  scene.add(t);
  buildingBoxes.push({ minX: 116, maxX: 140, minZ: -132 + i * 78, maxZ: -108 + i * 78 });
}

// ---------------------------------------------------------------- beach, sea, pier
const sand = new THREE.Mesh(new THREE.PlaneGeometry(70, 560), MAT.sand);
sand.rotation.x = -Math.PI / 2; sand.position.set(185, 0.04, 0);
sand.receiveShadow = true;
scene.add(sand);
const sea = new THREE.Mesh(new THREE.PlaneGeometry(220, 560), MAT.sea);
sea.rotation.x = -Math.PI / 2; sea.position.set(330, 0.02, 0);
scene.add(sea);
// wave lines
for (let i = 0; i < 6; i++) {
  const wv = new THREE.Mesh(new THREE.PlaneGeometry(140, 1.2), new THREE.MeshBasicMaterial({ color: 0x9fd8e8, transparent: true, opacity: 0.5 }));
  wv.rotation.x = -Math.PI / 2; wv.position.set(300 + Math.random() * 90, 0.05, -220 + i * 85);
  scene.add(wv);
}
// Pier 9 — wooden deck reaching into the sea
const pier = new THREE.Group();
const deck = new THREE.Mesh(new THREE.BoxGeometry(70, 1.2, 16), MAT.pierWood);
deck.position.set(185, 1.4, 30);
deck.receiveShadow = true;
pier.add(deck);
for (let x = 155; x <= 215; x += 10) {
  for (const dz of [-7, 7]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 5, 8), MAT.pierPost);
    post.position.set(x, -0.6, 30 + dz);
    pier.add(post);
  }
}
// crates, barrels, rope coils on the pier
const pierProps = [];
function addCrate(x, z, s) {
  const c = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), MAT.crate);
  c.position.set(x, 2 + s / 2, z); c.rotation.y = Math.random();
  c.castShadow = true;
  pier.add(c); pierProps.push(c);
  return c;
}
addCrate(196, 26, 2.4); addCrate(199, 33, 1.8); addCrate(192, 34, 1.6);
addCrate(206, 27, 2.0); addCrate(208, 33, 1.5);
for (const [x, z] of [[188, 27], [190, 35], [212, 31]]) {
  const b = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 2.4, 12), MAT.barrel);
  b.position.set(x, 3.2, z); b.castShadow = true; pier.add(b);
}
// seagulls over the pier
const gulls = [];
const gullMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
for (let i = 0; i < 5; i++) {
  const gu = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.2, 4), gullMat);
  gu.rotation.z = Math.PI / 2;
  gu.position.set(170 + Math.random() * 50, 22 + Math.random() * 10, 18 + Math.random() * 26);
  pier.add(gu); gulls.push(gu);
}
scene.add(pier);

// ---------------------------------------------------------------- palms + lamps
const palms = [];
function makePalm(x, z, s) {
  const p = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * s, 0.55 * s, 7 * s, 7), MAT.trunk);
  trunk.position.y = 3.5 * s; trunk.rotation.z = (Math.random() - 0.5) * 0.14;
  p.add(trunk);
  const fronds = [];
  for (let i = 0; i < 6; i++) {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.9 * s, 5.5 * s, 4), MAT.frond);
    f.position.y = 7 * s;
    f.rotation.z = Math.PI / 2.4;
    f.rotation.y = (i / 6) * Math.PI * 2;
    f.translateY(1.6 * s);
    p.add(f); fronds.push(f);
  }
  p.position.set(x, 0, z);
  p.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  scene.add(p);
  palms.push({ group: p, fronds, phase: Math.random() * 6 });
  return p;
}
for (const a of ROAD_AT) {
  for (let t = -170; t <= 170; t += 22) {
    if (Math.random() < 0.1) continue;
    if (ROAD_AT.some((r) => Math.abs(t - r) < 4)) continue; // no palms in the middle of a cross road
    makePalm(a + 11.5, t, 0.95 + Math.random() * 0.4);
    if (Math.random() < 0.85) makePalm(a - 11.5, t + 11, 0.95 + Math.random() * 0.4);
  }
}
// palm row along the beach road (reads in the city + pier shots)
for (let z = -140; z <= 140; z += 46) makePalm(158, z, 1.1 + Math.random() * 0.3);
// beach palms near the pier
makePalm(152, 12, 1.2); makePalm(150, 48, 1.1); makePalm(156, -6, 1.0);

const lamps = [];
for (const a of ROAD_AT) {
  for (let t = -150; t <= 150; t += 60) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 7, 6), MAT.lampPole);
    pole.position.set(a + 9.5, 3.5, t);
    scene.add(pole);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8), MAT.lampGlow);
    bulb.position.set(a + 9.5, 7.2, t);
    scene.add(bulb);
    lamps.push(bulb);
  }
}

// ---------------------------------------------------------------- cars
function makeCar(color, opts = {}) {
  const g = new THREE.Group();
  const paint = new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.32 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.62, 4.6), paint);
  body.position.y = 0.55; g.add(body);
  // sloped hood — nose tapers down so the body reads less boxy
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.22, 1.3), paint);
  hood.position.set(0, 0.82, 1.95); hood.rotation.x = 0.22; g.add(hood);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.42, 1.1), paint);
  nose.position.set(0, 0.5, 2.3); g.add(nose);
  // rounded glasshouse — curved roofline instead of a sharp box
  const cabin = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 2.1, 14), MAT.glass);
  cabin.rotation.x = Math.PI / 2;
  cabin.scale.set(1.35, 1, 0.72);
  cabin.position.set(0, 0.98, -0.3); g.add(cabin);
  // sloped windshield + rear glass so the cabin reads as a real car, not a box
  const shield = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.9), MAT.glass);
  shield.position.set(0, 1.12, 0.78); shield.rotation.x = -0.55; g.add(shield);
  const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.7), MAT.glass);
  rearGlass.position.set(0, 1.12, -1.28); rearGlass.rotation.x = 0.5; g.add(rearGlass);
  // side mirrors
  for (const sx of [-1.05, 1.05]) {
    const mir = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.3), MAT.black);
    mir.position.set(sx, 1.02, 0.55); g.add(mir);
  }
  // front bumper + grille
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.3, 0.35), MAT.black);
  bumper.position.set(0, 0.32, 2.75); g.add(bumper);
  const grille = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.14, 0.06), MAT.black);
  grille.position.set(0, 0.62, 2.87); g.add(grille);
  // exhaust pipes
  for (const sx of [-0.6, 0.6]) {
    const ex = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.3, 8), MAT.black);
    ex.rotation.x = Math.PI / 2; ex.position.set(sx, 0.35, -2.4); g.add(ex);
  }
  if (opts.spoiler) {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.09, 0.5), MAT.black);
    sp.position.set(0, 1.0, -2.2); g.add(sp);
    const finL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.4, 0.4), MAT.black);
    finL.position.set(-0.9, 0.8, -2.2); g.add(finL);
    const finR = finL.clone(); finR.position.x = 0.9; g.add(finR);
  }
  const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 12);
  const wheels = [];
  for (const [x, z] of [[-1.0, 1.5], [1.0, 1.5], [-1.0, -1.5], [1.0, -1.5]]) {
    const w = new THREE.Mesh(wheelGeo, MAT.tire);
    w.rotation.z = Math.PI / 2; w.position.set(x, 0.42, z);
    g.add(w); wheels.push(w);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.37, 10),
      new THREE.MeshLambertMaterial({ color: 0xc8ccd4, emissive: 0x222222 }));
    rim.rotation.z = Math.PI / 2; rim.position.set(x, 0.42, z);
    g.add(rim);
  }
  // fender flares over the wheels
  for (const [x, z] of [[-1.02, 1.5], [1.02, 1.5], [-1.02, -1.5], [1.02, -1.5]]) {
    const fl = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 1.1), paint);
    fl.position.set(x, 0.78, z); g.add(fl);
  }
  for (const sx of [-0.62, 0.62]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.2, 0.1), MAT.headlight);
    hl.position.set(sx, 0.58, 2.86); g.add(hl);
  }
  const tl = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.16, 0.1), MAT.taillight);
  tl.position.set(0, 0.6, -2.36); g.add(tl);
  if (opts.police) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.16, 0.4), MAT.black);
    bar.position.set(0, 1.42, -0.3); g.add(bar);
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.42), new THREE.MeshBasicMaterial({ color: 0xff2222 }));
    r.position.set(-0.3, 1.55, -0.3); g.add(r);
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.42), new THREE.MeshBasicMaterial({ color: 0x2266ff }));
    b.position.set(0.3, 1.55, -0.3); g.add(b);
    g.userData.beaconR = r; g.userData.beaconB = b;
  }
  g.userData.wheels = wheels;
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}

// player — NIGHTHAWK yellow
const player = {
  mesh: makeCar(YELLOW, { spoiler: true }),
  pos: new THREE.Vector3(0, 0, 60),
  heading: Math.PI, // facing -z (north up the avenue)
  speed: 0, maxSpeed: 34, accel: 22, brake: 34, steer: 0,
};
player.mesh.position.copy(player.pos);
player.mesh.rotation.y = player.heading;
scene.add(player.mesh);

// traffic — loops along the avenues
const traffic = [];
const trafficColors = [0x2a6fd8, 0xd84a4a, 0x9aa0b0, 0x3fae7a, 0xd8d8d8, 0x7a4ad8, 0xe08a2a];
for (let i = 0; i < 9; i++) {
  const horizontal = i % 2 === 0;
  const lane = ROAD_AT[i % ROAD_AT.length] + (Math.random() < 0.5 ? -3.5 : 3.5);
  const dir = Math.random() < 0.5 ? 1 : -1;
  const car = makeCar(trafficColors[i % trafficColors.length]);
  scene.add(car);
  traffic.push({ mesh: car, horizontal, lane, dir, t: -190 + Math.random() * 380, speed: 9 + Math.random() * 6 });
}
// extra visible traffic so the avenues read busy in shots 1/2/4 — clusters placed
// near the shot cameras (same loop behaviour as the regular traffic above)
const extraTraffic = [
  // shot 1 (chase): avenue x=0, camera looks north from z=60
  { horizontal: false, lane: -3.5, t: 30, dir: 1 },
  { horizontal: false, lane: 3.5, t: -30, dir: -1 },
  { horizontal: false, lane: -3.5, t: -90, dir: 1 },
  // shot 2 (city): avenue z=0, camera looks east from x=-40
  { horizontal: true, lane: -3.5, t: 90, dir: 1 },
  { horizontal: true, lane: 3.5, t: 140, dir: -1 },
  { horizontal: true, lane: -3.5, t: 175, dir: 1 },
  // shot 4 (finale): avenue z=-60, camera looks east from x=48
  { horizontal: true, lane: -63.5, t: 95, dir: 1 },
  { horizontal: true, lane: -56.5, t: 135, dir: -1 },
  { horizontal: true, lane: -63.5, t: 170, dir: 1 },
];
extraTraffic.forEach((spec, i) => {
  const car = makeCar(trafficColors[(traffic.length + i) % trafficColors.length]);
  scene.add(car);
  traffic.push({ mesh: car, horizontal: spec.horizontal, lane: spec.lane, dir: spec.dir, t: spec.t, speed: 8 + Math.random() * 3 });
});
function updateTraffic(dt) {
  for (const c of traffic) {
    c.t += c.dir * c.speed * dt;
    if (c.t > 195) c.t = -195;
    if (c.t < -195) c.t = 195;
    if (c.horizontal) {
      c.mesh.position.set(c.t, 0, c.lane);
      c.mesh.rotation.y = c.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      c.mesh.position.set(c.lane, 0, c.t);
      c.mesh.rotation.y = c.dir > 0 ? Math.PI : 0;
    }
    c.mesh.userData.wheels.forEach((w) => { w.rotation.x += c.speed * dt * 2; });
  }
}

// pedestrians — strolling the sidewalks
const peds = [];
const pedColors = [0xd84a6a, 0x4a7ad8, 0xe8b13d, 0x7ad84a, 0xd8d8d8, 0xb06ad8];
for (let i = 0; i < 12; i++) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 1.5, 8),
    new THREE.MeshLambertMaterial({ color: pedColors[i % pedColors.length] }));
  body.position.y = 1.15; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8),
    new THREE.MeshLambertMaterial({ color: 0xd8a077 }));
  head.position.y = 2.2; g.add(head);
  const lane = ROAD_AT[i % ROAD_AT.length] + (Math.random() < 0.5 ? -11.5 : 11.5);
  const horizontal = i % 3 === 0;
  g.position.set(horizontal ? -180 + Math.random() * 360 : lane, 0, horizontal ? lane : -180 + Math.random() * 360);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  scene.add(g);
  peds.push({ mesh: g, horizontal, lane, dir: Math.random() < 0.5 ? 1 : -1, speed: 1.1 + Math.random() * 0.7, phase: Math.random() * 6 });
}
// extra pedestrians on the sidewalks of the shot corridors (avenue x=0, z=0, z=-60)
const corridorPeds = [
  { h: false, lane: -11.5, a: -120, b: 60 }, { h: false, lane: 11.5, a: -100, b: 40 },
  { h: true, lane: -11.5, a: 0, b: 170 }, { h: true, lane: 11.5, a: 20, b: 180 },
  { h: true, lane: -71.5, a: 70, b: 180 }, { h: true, lane: -48.5, a: 80, b: 170 },
];
for (const spec of corridorPeds) {
  for (let k = 0; k < 2; k++) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 1.5, 8),
      new THREE.MeshLambertMaterial({ color: pedColors[peds.length % pedColors.length] }));
    body.position.y = 1.15; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8),
      new THREE.MeshLambertMaterial({ color: 0xd8a077 }));
    head.position.y = 2.2; g.add(head);
    const along = spec.a + Math.random() * (spec.b - spec.a);
    g.position.set(spec.h ? along : spec.lane, 0, spec.h ? spec.lane : along);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    scene.add(g);
    peds.push({ mesh: g, horizontal: spec.h, lane: spec.lane, dir: Math.random() < 0.5 ? 1 : -1, speed: 1.1 + Math.random() * 0.7, phase: Math.random() * 6 });
  }
}
function updatePeds(dt, t) {
  for (const p of peds) {
    const step = p.dir * p.speed * dt;
    if (p.horizontal) {
      p.mesh.position.x += step;
      if (p.mesh.position.x > 190) p.mesh.position.x = -190;
      if (p.mesh.position.x < -190) p.mesh.position.x = 190;
      p.mesh.rotation.y = p.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      p.mesh.position.z += step;
      if (p.mesh.position.z > 190) p.mesh.position.z = -190;
      if (p.mesh.position.z < -190) p.mesh.position.z = 190;
      p.mesh.rotation.y = p.dir > 0 ? Math.PI : 0;
    }
    p.mesh.position.y = Math.abs(Math.sin(t * 6 + p.phase)) * 0.12;
  }
}

// scooters — 2, looping the shot avenues like traffic
const scooters = [];
function makeScooter(color) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 1.9),
    new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.25 }));
  body.position.y = 0.55; g.add(body);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.9), MAT.black);
  seat.position.set(0, 0.85, -0.3); g.add(seat);
  const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.18, 10);
  for (const z of [0.75, -0.75]) {
    const w = new THREE.Mesh(wheelGeo, MAT.tire);
    w.rotation.z = Math.PI / 2; w.position.set(0, 0.32, z); g.add(w);
  }
  const hl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.08), MAT.headlight);
  hl.position.set(0, 0.6, 0.98); g.add(hl);
  // rider
  const rider = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.85, 8),
    new THREE.MeshLambertMaterial({ color: 0xe8e8e8 }));
  rider.position.set(0, 1.25, -0.25); g.add(rider);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8),
    new THREE.MeshLambertMaterial({ color: 0xff5a5a }));
  helmet.position.set(0, 1.85, -0.2); g.add(helmet);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}
const scooterSpecs = [
  { color: 0xd84a6a, horizontal: false, lane: 3.5, t: 15, dir: 1 },   // avenue x=0 (shot 1)
  { color: 0x2ad8c8, horizontal: true, lane: -56.5, t: 85, dir: 1 },  // avenue z=-60 (shot 4)
];
for (const spec of scooterSpecs) {
  const s = makeScooter(spec.color);
  scene.add(s);
  scooters.push({ mesh: s, horizontal: spec.horizontal, lane: spec.lane, dir: spec.dir, t: spec.t, speed: 5 });
}
function updateScooters(dt) {
  for (const s of scooters) {
    s.t += s.dir * s.speed * dt;
    if (s.t > 195) s.t = -195;
    if (s.t < -195) s.t = 195;
    if (s.horizontal) {
      s.mesh.position.set(s.t, 0, s.lane);
      s.mesh.rotation.y = s.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      s.mesh.position.set(s.lane, 0, s.t);
      s.mesh.rotation.y = s.dir > 0 ? Math.PI : 0;
    }
  }
}

// police helicopter — circles above the city, searchlight cone
const heli = new THREE.Group();
{
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.5, 6.5), new THREE.MeshLambertMaterial({ color: 0x1c2733 }));
  heli.add(body);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 5), new THREE.MeshLambertMaterial({ color: 0x1c2733 }));
  tail.position.set(0, 0.3, -5.2); heli.add(tail);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 1.2), new THREE.MeshLambertMaterial({ color: 0x1c2733 }));
  fin.position.set(0, 0.8, -7.4); heli.add(fin);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.0, 1.6), MAT.glass);
  glass.position.set(0, 0.1, 2.6); heli.add(glass);
  const rotor = new THREE.Mesh(new THREE.BoxGeometry(16, 0.12, 0.7), MAT.black);
  rotor.position.y = 1.4; heli.add(rotor);
  heli.userData.rotor = rotor;
  const coneGeo = new THREE.ConeGeometry(9, 55, 20, 1, true);
  const cone = new THREE.Mesh(coneGeo, new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }));
  cone.position.y = -28; heli.add(cone);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), MAT.lampGlow);
  lamp.position.set(0, -0.9, 2.2); heli.add(lamp);
}
heli.position.set(-40, 58, -30);
heli.scale.setScalar(1.6); // big heli, reads clearly in the shots
heli.traverse((o) => { if (o.isMesh && o.material && o.material.color && o.material.color.getHex() === 0x1c2733) o.material.color.setHex(0x4a5f73); }); // lighten body so it reads against the purple sky
heli.traverse((o) => { if (o.isMesh) o.castShadow = true; });
scene.add(heli);

// police interceptors
const police = [];
for (let i = 0; i < 3; i++) {
  const car = makeCar(0x14181f, { police: true });
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.2, 4.62), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  stripe.position.y = 0.62; car.add(stripe);
  car.position.set(-30 - i * 18, 0, 90 + i * 12);
  scene.add(car);
  police.push({ mesh: car, heading: 0, speed: 0 });
}
function updatePolice(dt, t) {
  const wanted = MISSIONS[state.mission].wanted;
  const active = wanted >= 3;
  police.forEach((p, i) => {
    p.mesh.visible = active || state.shot === 'chase';
    if (!p.mesh.visible) return;
    // simple pursuit: steer toward the player, cap speed below the player's top
    const dx = player.pos.x - p.mesh.position.x;
    const dz = player.pos.z - p.mesh.position.z;
    const target = Math.atan2(dx, dz);
    let dh = target - p.heading;
    while (dh > Math.PI) dh -= Math.PI * 2;
    while (dh < -Math.PI) dh += Math.PI * 2;
    p.heading += Math.max(-1.6 * dt, Math.min(1.6 * dt, dh));
    p.speed = Math.min(p.speed + 14 * dt, 27);
    p.mesh.position.x += Math.sin(p.heading) * p.speed * dt;
    p.mesh.position.z += Math.cos(p.heading) * p.speed * dt;
    p.mesh.rotation.y = p.heading;
    const blink = Math.sin(t * 10 + i * 2) > 0;
    if (p.mesh.userData.beaconR) p.mesh.userData.beaconR.material.color.setHex(blink ? 0xff2222 : 0x551111);
    if (p.mesh.userData.beaconB) p.mesh.userData.beaconB.material.color.setHex(blink ? 0x113355 : 0x2266ff);
  });
}

// ---------------------------------------------------------------- missions
const MISSIONS = [
  {
    name: 'DOUBLE LIFE', obj: 'Lose the tail. Hit every marker.',
    wanted: 4, mbpd: 62, crew: 74,
    who: 'MARA VOSS', whoClass: 'mara',
    text: 'MBPD thinks I\u2019m their informant. The crew thinks I\u2019m their driver. Both are wrong.',
    cps: [[0, -140], [0, -60], [-60, -60], [-60, 40], [0, 100]],
  },
  {
    name: 'SMOKE & MIRRORS', obj: 'Cruise the boulevard. Look innocent.',
    wanted: 1, mbpd: 66, crew: 70,
    who: 'WREN', whoClass: 'wren',
    text: 'Air One is sweeping the avenue. Keep it under eighty and smile at the cameras.',
    cps: [[60, -120], [120, -60], [120, 60], [60, 120], [-60, 120]],
  },
  {
    name: 'THE HANDOFF', obj: 'Reach Pier 9. Grab the case.',
    wanted: 2, mbpd: 58, crew: 82,
    who: 'MARA VOSS', whoClass: 'mara',
    text: 'The case is on the pier, third crate from the end. In and out — no speeches.',
    cps: [[60, 30], [120, 30], [150, 30], [185, 30]],
  },
  {
    name: 'CLEAN GETAWAY', obj: 'Run for the sunrise road. Don\u2019t stop.',
    wanted: 5, mbpd: 41, crew: 91,
    who: 'WREN', whoClass: 'wren',
    text: 'Every unit in the city is rolling. Wren here — I\u2019m jamming their radios. GO.',
    cps: [[120, -60], [120, -120], [60, -140], [0, -160], [-60, -160]],
  },
];
const state = {
  mission: 0, cpIndex: 0, started: false, shot: null,
  cpMesh: null, beamMesh: null, elapsed: 0, grabDone: false,
};
const cpRing = new THREE.Mesh(
  new THREE.TorusGeometry(4.2, 0.35, 10, 32),
  new THREE.MeshBasicMaterial({ color: 0xffc81e })
);
const cpBeam = new THREE.Mesh(
  new THREE.CylinderGeometry(0.9, 0.9, 42, 12, 1, true),
  new THREE.MeshBasicMaterial({ color: 0xffc81e, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false })
);
scene.add(cpRing); scene.add(cpBeam);
function placeCheckpoint() {
  const m = MISSIONS[state.mission];
  const cp = m.cps[Math.min(state.cpIndex, m.cps.length - 1)];
  cpRing.position.set(cp[0], 2.2, cp[1]);
  cpBeam.position.set(cp[0], 21, cp[1]);
  cpRing.visible = true; cpBeam.visible = true;
}
function setMission(i) {
  state.mission = i; state.cpIndex = 0; state.grabDone = false;
  const m = MISSIONS[i];
  document.getElementById('mName').textContent = m.name;
  document.getElementById('mObj').textContent = m.obj;
  document.getElementById('dWho').textContent = m.who;
  document.getElementById('dWho').className = 'who ' + m.whoClass;
  document.getElementById('dText').textContent = m.text;
  document.getElementById('trustMbpd').style.height = m.mbpd + '%';
  document.getElementById('trustCrew').style.height = m.crew + '%';
  document.getElementById('trustMbpdN').textContent = m.mbpd;
  document.getElementById('trustCrewN').textContent = m.crew;
  document.getElementById('stars').innerHTML = '&#9733;'.repeat(m.wanted) + '&#9734;'.repeat(5 - m.wanted);
  placeCheckpoint();
}
function nextCheckpoint() {
  const m = MISSIONS[state.mission];
  state.cpIndex++;
  if (state.cpIndex >= m.cps.length) {
    // mission complete — advance, or loop back on the last
    document.getElementById('dText').textContent = state.mission === 3
      ? 'Clean. The sun is coming up and nobody knows my name. — MARA'
      : 'Done. Next job is already on the board. — WREN';
    setMission((state.mission + 1) % MISSIONS.length);
    player.pos.set(0, 0, 60); player.heading = Math.PI; player.speed = 0;
  } else {
    placeCheckpoint();
  }
}

// ---------------------------------------------------------------- input
const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.key >= '1' && e.key <= '4') setMission(Number(e.key) - 1);
  if (e.key.toLowerCase() === 'r') { player.pos.set(0, 0, 60); player.heading = Math.PI; player.speed = 0; setMission(state.mission); }
  if (e.key.toLowerCase() === 'e' && state.mission === 2) {
    const d = Math.hypot(player.pos.x - 196, player.pos.z - 30);
    if (d < 12) { state.grabDone = true; nextCheckpoint(); }
  }
});
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
document.getElementById('start').addEventListener('click', () => {
  document.getElementById('start').style.display = 'none';
  state.started = true;
  setMission(0);
});

// ---------------------------------------------------------------- minimap
const mapCtx = document.getElementById('minimap').getContext('2d');
let mapTick = 0;
function drawMinimap() {
  const S = 150, sc = S / 460;
  mapCtx.fillStyle = '#1a2450'; mapCtx.fillRect(0, 0, S, S);
  // sea
  mapCtx.fillStyle = '#1a6a80'; mapCtx.fillRect((150 + 230) * sc, 0, S, S);
  mapCtx.fillStyle = '#c99a68'; mapCtx.fillRect(150 * sc, 0, 70 * sc, S);
  // roads
  mapCtx.strokeStyle = '#9a94c8'; mapCtx.lineWidth = 5;
  for (const a of ROAD_AT) {
    mapCtx.beginPath(); mapCtx.moveTo((a + 230) * sc, 0); mapCtx.lineTo((a + 230) * sc, S); mapCtx.stroke();
    mapCtx.beginPath(); mapCtx.moveTo(0, (a + 230) * sc); mapCtx.lineTo(S, (a + 230) * sc); mapCtx.stroke();
  }
  // pier
  mapCtx.strokeStyle = '#6e4f30'; mapCtx.lineWidth = 4;
  mapCtx.beginPath(); mapCtx.moveTo(150 * sc, (30 + 230) * sc); mapCtx.lineTo(220 * sc, (30 + 230) * sc); mapCtx.stroke();
  // checkpoint
  const m = MISSIONS[state.mission];
  const cp = m.cps[Math.min(state.cpIndex, m.cps.length - 1)];
  mapCtx.fillStyle = '#ffc81e';
  mapCtx.beginPath(); mapCtx.arc((cp[0] + 230) * sc, (cp[1] + 230) * sc, 5, 0, 7); mapCtx.fill();
  // police
  mapCtx.fillStyle = '#ff4444';
  for (const p of police) {
    if (!p.mesh.visible) continue;
    mapCtx.beginPath(); mapCtx.arc((p.mesh.position.x + 230) * sc, (p.mesh.position.z + 230) * sc, 3, 0, 7); mapCtx.fill();
  }
  // player arrow
  mapCtx.save();
  mapCtx.translate((player.pos.x + 230) * sc, (player.pos.z + 230) * sc);
  mapCtx.rotate(Math.atan2(Math.sin(player.heading), Math.cos(player.heading)) + Math.PI);
  mapCtx.fillStyle = '#ffc81e';
  mapCtx.beginPath(); mapCtx.moveTo(0, -7); mapCtx.lineTo(5, 6); mapCtx.lineTo(-5, 6); mapCtx.closePath(); mapCtx.fill();
  mapCtx.restore();
}

// ---------------------------------------------------------------- camera + shots
const camModes = { chase: 0, city: 1, pier: 2, finale: 3 };
let camMode = 0;
const camTarget = new THREE.Vector3();
function updateCamera(dt) {
  const p = player.pos, h = player.heading;
  if (camMode === 1) {
    // boulevard shot: straight down avenue z=0, east into the sunset
    camTarget.set(-40, 24, 0);
    camera.position.lerp(camTarget, Math.min(1, dt * 2));
    camera.lookAt(200, 6, 30);
  } else if (camMode === 2) {
    camTarget.set(163, 15, 60);
    camera.position.lerp(camTarget, Math.min(1, dt * 2));
    camera.lookAt(202, 3, 28);
  } else if (camMode === 3) {
    const bx = p.x - Math.sin(h) * 12, bz = p.z - Math.cos(h) * 12;
    camTarget.set(bx, 4.2, bz);
    camera.position.lerp(camTarget, Math.min(1, dt * 4));
    camera.lookAt(p.x + Math.sin(h) * 30, 3, p.z + Math.cos(h) * 30);
  } else {
    const bx = p.x - Math.sin(h) * 10.5, bz = p.z - Math.cos(h) * 10.5;
    camTarget.set(bx, 5.0, bz);
    camera.position.lerp(camTarget, Math.min(1, dt * 5));
    camera.lookAt(p.x + Math.sin(h) * 18, 3.0, p.z + Math.cos(h) * 18);
  }
}

const SHOTS = {
  chase: { mission: 0, cam: 0, pos: [0, 0, 60], heading: Math.PI, speed: 31, heli: [0, 40, -60] },
  city: { mission: 1, cam: 1, pos: [40, 0, 0], heading: Math.PI / 2, speed: 12, heli: [120, 48, 40] },
  heist: { mission: 2, cam: 2, pos: [186, 2.0, 30], heading: Math.PI / 2, speed: 0, heli: [205, 25, 15] },
  finale: { mission: 3, cam: 3, pos: [60, 0, -60], heading: Math.PI / 2, speed: 33, heli: [40, 58, -90] },
};
function applyShot(name) {
  const s = SHOTS[name];
  if (!s) return;
  state.shot = name;
  document.getElementById('start').style.display = 'none';
  state.started = true;
  setMission(s.mission);
  player.pos.set(s.pos[0], s.pos[1], s.pos[2]);
  player.heading = s.heading;
  player.speed = s.speed;
  camMode = s.cam;
  heli.position.set(s.heli[0], s.heli[1], s.heli[2]);
  // place police visibly behind for the chase shot
  police[0].mesh.position.set(-8, 0, 96); police[0].heading = Math.PI;
  police[1].mesh.position.set(9, 0, 104); police[1].heading = Math.PI;
  police[2].mesh.position.set(0, 0, 118); police[2].heading = Math.PI;
  // snap camera to the preset immediately
  updateCamera(10);
  camera.position.copy(camTarget);
}
const params = new URLSearchParams(location.search);
if (params.get('shot')) applyShot(params.get('shot'));
else setMission(0);

// ---------------------------------------------------------------- main loop
const clock = new THREE.Clock();
const tmpV = new THREE.Vector3();
function collideBuildings() {
  const r = 2.3;
  for (const b of buildingBoxes) {
    const cx = Math.max(b.minX, Math.min(player.pos.x, b.maxX));
    const cz = Math.max(b.minZ, Math.min(player.pos.z, b.maxZ));
    const dx = player.pos.x - cx, dz = player.pos.z - cz;
    const d2 = dx * dx + dz * dz;
    if (d2 < r * r && d2 > 0.0001) {
      const d = Math.sqrt(d2);
      player.pos.x = cx + (dx / d) * r;
      player.pos.z = cz + (dz / d) * r;
      player.speed *= 0.55;
    }
  }
}
function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  state.elapsed += dt;

  // --- player drive (arcade)
  if (state.started && !state.shot) {
    const fwd = keys['w'] || keys['arrowup'] ? 1 : 0;
    const back = keys['s'] || keys['arrowdown'] ? 1 : 0;
    if (fwd) player.speed += player.accel * dt;
    if (back) player.speed -= player.brake * dt;
    if (!fwd && !back) player.speed -= Math.sign(player.speed) * 8 * dt;
    player.speed = Math.max(-12, Math.min(player.maxSpeed, player.speed));
    const steerIn = (keys['a'] || keys['arrowleft'] ? 1 : 0) - (keys['d'] || keys['arrowright'] ? 1 : 0);
    if (Math.abs(player.speed) > 0.5) {
      player.heading += steerIn * 1.9 * dt * Math.sign(player.speed) * Math.min(1, Math.abs(player.speed) / 12);
    }
  }
  if (state.shot) {
    // keep the shot car rolling slowly forward for a living frame
    player.speed = SHOTS[state.shot].speed;
  }
  player.pos.x += Math.sin(player.heading) * player.speed * dt;
  player.pos.z += Math.cos(player.heading) * player.speed * dt;
  player.pos.x = Math.max(-CITY, Math.min(220, player.pos.x));
  player.pos.z = Math.max(-CITY, Math.min(CITY, player.pos.z));
  collideBuildings();
  player.mesh.position.copy(player.pos);
  player.mesh.rotation.y = player.heading;
  player.mesh.userData.wheels.forEach((w) => { w.rotation.x += player.speed * dt * 2; });

  // --- checkpoint pickup
  const m = MISSIONS[state.mission];
  const cp = m.cps[Math.min(state.cpIndex, m.cps.length - 1)];
  tmpV.set(cp[0], 0, cp[1]);
  if (!state.shot && player.pos.distanceTo(tmpV) < 6.5) nextCheckpoint();
  cpRing.rotation.x += dt * 0.8;
  cpRing.rotation.y += dt * 0.5;
  cpBeam.material.opacity = 0.10 + Math.sin(t * 3) * 0.04;

  // --- world life
  updateTraffic(dt);
  updateScooters(dt);
  updatePeds(dt, t);
  updatePolice(dt, t);
  heli.userData.rotor.rotation.y += dt * 22;
  const hx = Math.sin(t * 0.11) * 90, hz = Math.cos(t * 0.11) * 90;
  if (!state.shot) heli.position.set(hx, 58 + Math.sin(t * 0.7) * 2, hz);
  heli.lookAt(player.pos.x, 0, player.pos.z);
  for (const p of palms) {
    p.fronds.forEach((f, i) => { f.rotation.z = Math.PI / 2.4 + Math.sin(t * 1.4 + p.phase + i) * 0.06; });
  }
  for (const g of gulls) {
    g.position.x += dt * 3;
    if (g.position.x > 230) g.position.x = 150;
    g.position.y = 24 + Math.sin(t * 2 + g.position.x * 0.1) * 2;
  }
  for (const c of clouds) {
    c.position.x += dt * 1.2;
    if (c.position.x > 280) c.position.x = -280;
  }

  // --- HUD
  document.getElementById('spd').textContent = Math.round(Math.abs(player.speed) * 3.6);
  const dist = Math.round(Math.hypot(player.pos.x - heli.position.x, player.pos.z - heli.position.z));
  document.querySelector('#dispatch .air').textContent = 'AIR ONE \u2014 ' + dist + 'm';
  if (++mapTick % 6 === 0) drawMinimap();

  updateCamera(dt);
  camLight.position.set(camera.position.x, camera.position.y + 8, camera.position.z);
  camLightTarget.position.copy(player.pos);
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
