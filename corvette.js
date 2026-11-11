// Scène « Corvette 1967 » : modèle PROVISOIRE procédural (aucun logo), remplacé par le GLB de la chaîne 3D
// dès que assets/corvette.json donne une url. Noms d'objets attendus : body, door_L, door_R, hood, trunk,
// soft_top (ou soft_top_* : arceaux), steering_wheel, wheel_FL/FR/RL/RR, c204_unit (+ c204_cable, c204_mount).
// Actions attendues (par nom) : idle, doors_open, top_down, hood_open, wheels_spin, jump. Sans action : mouvements par code.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const CAR = { L: 4.45, W: 1.77, H: 1.25, WB: 2.49 }; // Corvette 1967 : 175,1 x 69,6 po, empattement 98 po
const AXLE = CAR.WB / 2, TRACK = 0.725, WR = 0.345, ZF = CAR.L / 2;

// ---------- profils de carrosserie (z : arrière -, avant +) ----------
const lerpTab = (tab, z) => { if (z <= tab[0][0]) return tab[0][1]; for (let i = 1; i < tab.length; i++) if (z <= tab[i][0]) { const [z0, v0] = tab[i - 1], [z1, v1] = tab[i]; const k = (z - z0) / (z1 - z0); return v0 + (v1 - v0) * (k * k * (3 - 2 * k)); } return tab[tab.length - 1][1]; };
const WT = [[-ZF, 0.70], [-2.0, 0.80], [-1.6, 0.87], [-AXLE, 0.885], [-0.8, 0.86], [-0.2, 0.83], [0.4, 0.84], [1.0, 0.875], [AXLE, 0.885], [1.7, 0.84], [2.05, 0.72], [ZF, 0.50]];
const BT = [[-ZF, 0.70], [-1.9, 0.78], [-1.4, 0.84], [-1.0, 0.85], [-0.6, 0.84], [0.3, 0.82], [0.8, 0.80], [AXLE, 0.80], [1.8, 0.74], [2.15, 0.63], [ZF, 0.58]];
const CT = [[-ZF, 0.0], [-1.9, 0.04], [-1.0, 0.06], [0.4, 0.04], [1.2, 0.06], [2.0, 0.03], [ZF, 0.0]];
const BOT = [[-ZF, 0.36], [-2.0, 0.22], [2.0, 0.22], [ZF, 0.34]];
const CK0 = -0.95, CK1 = 0.42, FLOOR = 0.30; // habitacle ouvert
const smooth = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
const cockpit = z => smooth(CK0, CK0 + 0.12, z) * (1 - smooth(CK1 - 0.12, CK1, z));
function bottom(z) {
  let b = lerpTab(BOT, z);
  for (const a of [-AXLE, AXLE]) { const dz = z - a, r = 0.39; if (Math.abs(dz) < r) b = Math.max(b, WR + Math.sqrt(r * r - dz * dz)); }
  return b;
}
function section(z, c = cockpit(z)) { // demi-section droite (x >= 0), 9 points du bas au centre du dessus
  const w = lerpTab(WT, z), belt = lerpTab(BT, z), cr = lerpTab(CT, z), b = bottom(z);
  const side = belt - 0.18, p2y = Math.min(b + 0.12, side - 0.02);
  const inX = w * 0.93 - 0.07;
  const top = [[inX, belt + cr * 0.3], [w * 0.45, belt + cr * 0.8], [0, belt + cr]];
  const pit = [[inX, belt - 0.02], [inX - 0.01, FLOOR], [0, FLOOR]];
  return [[0, b], [w * 0.85, b], [w, p2y], [w, side], [w * 0.98, belt - 0.03], [w * 0.93, belt],
    ...top.map((p, i) => [p[0] + (pit[i][0] - p[0]) * c, p[1] + (pit[i][1] - p[1]) * c])];
}
const fullRing = h => [...h, ...h.slice(1, -1).reverse().map(([x, y]) => [-x, y])];
// surface balayée : rings[i] = liste de [x,y] à z[i] ; anneau fermé ; bouchons optionnels
function loft(zs, ringAt, caps = true) {
  const rings = zs.map(ringAt), n = rings[0].length, pos = [], idx = [];
  zs.forEach((z, i) => rings[i].forEach(([x, y]) => pos.push(x, y, z)));
  for (let i = 0; i < zs.length - 1; i++) for (let j = 0; j < n; j++) {
    const a = i * n + j, b = i * n + (j + 1) % n, c = a + n, d = b + n; idx.push(a, c, b, b, c, d);
  }
  if (caps) for (const [i, flip] of [[0, true], [zs.length - 1, false]]) {
    const r = rings[i], cx = r.reduce((s, p) => s + p[0], 0) / n, cy = r.reduce((s, p) => s + p[1], 0) / n, ci = pos.length / 3; pos.push(cx, cy, zs[i]);
    for (let j = 0; j < n; j++) { const a = i * n + j, b = i * n + (j + 1) % n; flip ? idx.push(ci, b, a) : idx.push(ci, a, b); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
const range = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + (b - a) * i / n);

// ---------- matériaux partagés (peu de draw calls) ----------
function mats() {
  return {
    paint: new THREE.MeshStandardMaterial({ color: 0x9e1b1b, roughness: 0.32, metalness: 0.35, envMapIntensity: 1.1 }), // rouge type Rally Red, aucun logo
    interior: new THREE.MeshStandardMaterial({ color: 0x2a2224, roughness: 0.85 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x111316, roughness: 0.7, metalness: 0.2 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xd8dde2, roughness: 0.12, metalness: 1 }),
    tire: new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9 }),
    rim: new THREE.MeshStandardMaterial({ color: 0x8c9096, roughness: 0.3, metalness: 0.9 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x9fc4d8, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false }),
    canvas: new THREE.MeshStandardMaterial({ color: 0x1b1b1d, roughness: 0.95, side: THREE.DoubleSide }),
    head: new THREE.MeshStandardMaterial({ color: 0xeeeeea, emissive: 0xfff2c8, emissiveIntensity: 0, roughness: 0.2 }),
    tail: new THREE.MeshStandardMaterial({ color: 0x5a0b0b, emissive: 0xff2010, emissiveIntensity: 0, roughness: 0.3 }),
    cable: new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.8 }),
    mount: new THREE.MeshStandardMaterial({ color: 0x4a4f55, roughness: 0.6, metalness: 0.6 }),
  };
}
const boxG = (w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) => { const g = new THREE.BoxGeometry(w, h, d); g.rotateX(rx); g.rotateY(ry); g.rotateZ(rz); g.translate(x, y, z); return g; };
const merge = gs => mergeGeometries(gs.map(g => g.index ? g.toNonIndexed() : g).map(g => { for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k); return g; }));
const named = (name, obj) => { obj.name = name; return obj; };

// ---------- modèle provisoire ----------
function buildProcedural(m) {
  const car = named('corvette_1967_provisoire', new THREE.Group());
  const body = named('body', new THREE.Mesh(loft(range(-ZF, ZF, 48), z => fullRing(section(z))), m.paint)); car.add(body);
  // portes (charnière avant), légèrement en saillie sur la carrosserie
  const DZ0 = -0.5, DZ1 = CK1;
  for (const [name, s] of [['door_L', 1], ['door_R', -1]]) {
    const ring = z => { const h = section(z, 0).slice(2, 6).map(([x, y]) => [x + 0.006, y]); const inner = h.map(([x, y]) => [x - 0.05, y]).reverse(); return [...h, ...inner].map(([x, y]) => [x * s, y]); };
    const g = loft(range(DZ0, DZ1, 8), ring); const hx = lerpTab(WT, DZ1) * s; g.translate(-hx, 0, -DZ1);
    if (s < 0) { g.index.array.reverse(); g.computeVertexNormals(); } // miroir : garder les faces vers l'extérieur
    const d = named(name, new THREE.Mesh(g, m.paint)); d.position.set(hx, 0, DZ1); car.add(d);
  }
  // capot (charnière arrière, côté pare-brise) avec bossage central
  const HZ0 = 0.55, HZ1 = 2.08;
  const hoodRing = z => { const h = section(z, 0).slice(5).map(([x, y], i) => [x, y + 0.008 + (i >= 2 ? 0.025 * smooth(HZ0, HZ0 + 0.3, z) * (1 - smooth(1.6, 2.0, z)) : 0)]); const top = fullRing([[0, 0], ...h]).slice(1); const under = top.map(([x, y]) => [x * 0.98, y - 0.03]).reverse(); return [...top, ...under]; };
  const hg = loft(range(HZ0, HZ1, 14), hoodRing); const hy = lerpTab(BT, HZ0) + lerpTab(CT, HZ0); hg.translate(0, -hy, -HZ0);
  const hood = named('hood', new THREE.Mesh(hg, m.paint)); hood.position.set(0, hy, HZ0); car.add(hood);
  // couvercle arrière (rangement de capote), charnière arrière
  const TZ0 = -1.6, TZ1 = CK0 - 0.02;
  const tRing = z => { const h = section(z, 0).slice(5).map(([x, y]) => [x * 0.92, y + 0.008]); const top = fullRing([[0, 0], ...h]).slice(1); const under = top.map(([x, y]) => [x, y - 0.03]).reverse(); return [...top, ...under]; };
  const tg = loft(range(TZ0, TZ1, 8), tRing); const ty = lerpTab(BT, TZ0) + lerpTab(CT, TZ0); tg.translate(0, -ty, -TZ0);
  const trunk = named('trunk', new THREE.Mesh(tg, m.paint)); trunk.position.set(0, ty, TZ0); car.add(trunk);
  // pare-brise
  const wsF = 0.47, wsT = 0.18, wsY0 = 0.84, wsY1 = 1.17;
  const fr = []; for (const s of [-1, 1]) { const a = new THREE.Vector3(0.64 * s, wsY0, wsF), b = new THREE.Vector3(0.6 * s, wsY1, wsT); const len = a.distanceTo(b); const g = new THREE.CylinderGeometry(0.018, 0.022, len, 6); const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); g.applyQuaternion(q); g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); fr.push(g); }
  fr.push(boxG(1.22, 0.04, 0.05, 0, wsY1, wsT), boxG(1.3, 0.03, 0.04, 0, wsY0, wsF));
  car.add(named('windshield_frame', new THREE.Mesh(merge(fr), m.chrome)));
  const gl = new THREE.BufferGeometry(); gl.setAttribute('position', new THREE.Float32BufferAttribute([-0.63, wsY0, wsF, 0.63, wsY0, wsF, 0.59, wsY1, wsT, -0.63, wsY0, wsF, 0.59, wsY1, wsT, -0.59, wsY1, wsT], 3)); gl.computeVertexNormals();
  car.add(named('windshield_glass', new THREE.Mesh(gl, m.glass)));
  // habitacle : siège conducteur, tableau de bord, console (le côté passager reçoit la C204)
  const inG = [boxG(0.46, 0.1, 0.5, 0.33, 0.38, -0.2), boxG(0.46, 0.5, 0.1, 0.33, 0.62, -0.47, -0.2), boxG(1.36, 0.16, 0.14, 0, 0.72, 0.36), boxG(0.16, 0.14, 0.9, 0, 0.38, 0.0), boxG(1.3, 0.02, 1.3, 0, FLOOR + 0.01, -0.25)];
  car.add(named('interior', new THREE.Mesh(merge(inG), m.interior)));
  // volant (côté conducteur, gauche = +x)
  const sw = [new THREE.TorusGeometry(0.19, 0.014, 6, 24)]; for (let k = 0; k < 3; k++) sw.push(boxG(0.17, 0.02, 0.012, 0.085 * Math.cos(k * 2.094), 0.085 * Math.sin(k * 2.094), 0, 0, 0, k * 2.094));
  const steer = named('steering_wheel', new THREE.Mesh(merge(sw), m.dark)); steer.position.set(0.33, 0.83, 0.2); steer.rotation.x = -0.45; car.add(steer);
  // capote : pivot à la charnière arrière, 3 arceaux + toile (soft_top_*)
  const top = named('soft_top', new THREE.Group()); top.position.set(0, 0.86, CK0 + 0.06); car.add(top);
  const bows = [[1.05, 0.31], [0.62, 0.39], [0.2, 0.26]]; // z relatif, hauteur relative
  const arc = (zr, hr, n = 10) => Array.from({ length: n + 1 }, (_, i) => { const a = Math.PI * i / n; return [Math.cos(a) * 0.62, Math.sin(a) * hr, zr]; });
  bows.forEach(([zr, hr], i) => { const pts = arc(zr, hr).map(p => new THREE.Vector3(...p)); top.add(named('soft_top_bow_' + (i + 1), new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, 0.012, 5), m.dark))); });
  const fz = [1.07, 0.62, 0.2, -0.02], fh = [0.31, 0.39, 0.26, 0.02];
  const fp = [], fi = []; const NA = 10; fz.forEach((z, i) => arc(z, fh[i], NA).forEach(p => fp.push(p[0] * 1.01, p[1] + 0.004, z)));
  for (let i = 0; i < fz.length - 1; i++) for (let j = 0; j < NA; j++) { const a = i * (NA + 1) + j, b = a + 1, c = a + NA + 1, d = c + 1; fi.push(a, c, b, b, c, d); }
  const fgeo = new THREE.BufferGeometry(); fgeo.setAttribute('position', new THREE.Float32BufferAttribute(fp, 3)); fgeo.setIndex(fi); fgeo.computeVertexNormals();
  top.add(named('soft_top_fabric', new THREE.Mesh(fgeo, m.canvas)));
  // roues : centre à l'origine, axe X = essieu ; pneu + jante Rally dans une seule géométrie à 2 groupes
  const tire = new THREE.CylinderGeometry(WR, WR, 0.19, 20, 1); tire.rotateZ(Math.PI / 2);
  const rim = new THREE.CylinderGeometry(0.2, 0.2, 0.196, 12, 1); rim.rotateZ(Math.PI / 2);
  const cap = new THREE.CylinderGeometry(0.07, 0.07, 0.2, 8, 1); cap.rotateZ(Math.PI / 2);
  const wheelG = mergeGeometries([tire, mergeGeometries([rim, cap])], true);
  for (const [name, x, z] of [['wheel_FL', TRACK, AXLE], ['wheel_FR', -TRACK, AXLE], ['wheel_RL', TRACK, -AXLE], ['wheel_RR', -TRACK, -AXLE]]) { const w = named(name, new THREE.Mesh(wheelG, [m.tire, m.rim])); w.position.set(x, WR, z); car.add(w); }
  // pare-chocs chromés (lames d'angle), ouïes d'aile (5 fentes, 1967), calandre
  const ch = []; for (const s of [-1, 1]) { ch.push(boxG(0.42, 0.05, 0.08, 0.45 * s, 0.44, ZF - 0.03, 0, -0.35 * s), boxG(0.5, 0.05, 0.08, 0.5 * s, 0.5, -ZF + 0.04, 0, 0.3 * s)); }
  car.add(named('bumpers', new THREE.Mesh(merge(ch), m.chrome)));
  const dk = [boxG(0.72, 0.12, 0.04, 0, 0.45, ZF - 0.01)]; for (const s of [-1, 1]) for (let k = 0; k < 5; k++) dk.push(boxG(0.012, 0.16, 0.035, (lerpTab(WT, 0.72) + 0.002) * s, 0.58, 0.62 + k * 0.05));
  car.add(named('vents_grille', new THREE.Mesh(merge(dk), m.dark)));
  // feux (s'allument pendant le saut) : 2 avant, 4 ronds arrière
  const hl = [], tl = []; for (const s of [-1, 1]) { const h = new THREE.CircleGeometry(0.075, 12); h.translate(0.55 * s, 0.6, ZF - 0.09); hl.push(h); for (const x of [0.36, 0.58]) { const t = new THREE.CircleGeometry(0.055, 12); t.rotateY(Math.PI); t.translate(x * s, 0.64, -ZF - 0.005); tl.push(t); } }
  car.add(named('headlights', new THREE.Mesh(merge(hl), m.head)), named('taillights', new THREE.Mesh(merge(tl), m.tail)));
  return car;
}

// ---------- C204 : copie fusionnée par matériau du GLB de la machine (peu de draw calls) ----------
function mergeByMaterial(orig) {
  const src = orig.clone(); // copie : la machine n'est pas touchée
  const lid = src.getObjectByName('lid'); if (lid && lid.userData.r0 !== undefined) lid.rotation.x = lid.userData.r0 - 1.83; // couvercle ouvert (~105°) pour reconnaître l'unité
  src.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(src.matrixWorld).invert();
  const byMat = new Map();
  src.traverse(o => {
    if (!o.isMesh || !o.geometry) return;
    const g = o.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
    const ng = g.index ? g.toNonIndexed() : g; const out = new THREE.BufferGeometry();
    out.setAttribute('position', ng.attributes.position);
    if (ng.attributes.normal) out.setAttribute('normal', ng.attributes.normal); else { out.computeVertexNormals(); }
    out.setAttribute('uv', ng.attributes.uv || new THREE.Float32BufferAttribute(new Float32Array(ng.attributes.position.count * 2), 2));
    const mat = Array.isArray(o.material) ? o.material[0] : o.material; (byMat.get(mat) || byMat.set(mat, []).get(mat)).push(out);
  });
  const mats = [...byMat.keys()]; const geo = mergeGeometries(mats.map(k => mergeGeometries(byMat.get(k))), true);
  return new THREE.Mesh(geo, mats);
}
function placeholderUnit(m) { // en attendant le GLB de la machine
  const g = merge([boxG(1.10, 0.37, 0.42, 0, 0.185, 0)]); return new THREE.Mesh(g, m.mount);
}

// ---------- correspondance noms -> fiches ----------
const NAME2CARD = { body: 'body', door_l: 'doors', door_r: 'doors', hood: 'engine', trunk: 'deck', soft_top: 'top', steering_wheel: 'cockpit', wheel: 'wheels', c204_unit: 'c204', c204_cable: 'install', c204_mount: 'install', interior: 'cockpit', windshield: 'body', bumpers: 'body', headlights: 'body', taillights: 'body', vents: 'body' };
const NKEYS = Object.keys(NAME2CARD).sort((a, b) => b.length - a.length);
const matchKey = (n, k) => n === k || (n.startsWith(k) && /[_.\d]/.test(n[k.length] || ''));
const cardFor = name => { const n = (name || '').toLowerCase(); const k = NKEYS.find(k => matchKey(n, k)); return k ? NAME2CARD[k] : null; };
const ACTS = ['idle', 'doors_open', 'top_down', 'hood_open', 'wheels_spin', 'jump'];

export function createCorvette({ renderer, makeLoader, c204Ready }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05080c); scene.fog = new THREE.Fog(0x05080c, 10, 30);
  const pmrem = new THREE.PMREMGenerator(renderer); const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04); scene.environment = envRT.texture; pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xbfd8ff, 0x20160c, 0.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(3, 6, 4); scene.add(sun);
  const unitLight = new THREE.PointLight(0x66ccff, 0, 4); scene.add(unitLight);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 48), new THREE.MeshStandardMaterial({ color: 0x0d151c, roughness: 0.95 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const grid = new THREE.GridHelper(28, 56, 0x1c3342, 0x10202a); grid.position.y = 0.001; scene.add(grid);
  const blobTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const r = g.createRadialGradient(32, 32, 4, 32, 32, 32); r.addColorStop(0, 'rgba(0,0,0,0.75)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 5.2), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false })); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.004; scene.add(blob);
  // champ autour de la voiture pendant le saut
  const field = new THREE.Group(); scene.add(field); field.position.y = 0.6;
  const shellMat = i => new THREE.MeshBasicMaterial({ color: i ? 0xffd75a : 0x7fdcff, wireframe: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const shells = [0, 1].map(i => { const s = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 10), shellMat(i)); s.scale.set(1.3 + i * 0.15, 0.9 + i * 0.1, 2.7 + i * 0.2); field.add(s); return s; });
  field.visible = false;

  const m = mats();
  const holder = new THREE.Group(); scene.add(holder); // vibration et disparition par code
  let root = null, mixer = null, actions = {}, parts = {}, pickables = [], groups = {}, fx = {}, source = 'procédural', unit = null;
  const state = { doors: 0, top: 1, hood: 0, trunk: 0 }, target = { doors: 0, top: 1, hood: 0, trunk: 0 };
  let spinT = 0, shake = 0, lights = 0, jumpScales = [];

  function index(r) {
    pickables = []; groups = {}; parts = { door_L: [], door_R: [], hood: [], trunk: [], soft_top: [], wheels: [] };
    r.traverse(o => {
      const n = o.name.toLowerCase();
      if (matchKey(n, 'door_l')) parts.door_L.push(o); else if (matchKey(n, 'door_r')) parts.door_R.push(o);
      else if (n === 'hood') parts.hood.push(o); else if (n === 'trunk') parts.trunk.push(o);
      else if (matchKey(n, 'soft_top') && !(o.parent && matchKey(o.parent.name.toLowerCase(), 'soft_top'))) parts.soft_top.push(o);
      else if (matchKey(n, 'wheel')) parts.wheels.push(o);
    });
    // pas de double rotation : si soft_top contient des arceaux, on fait tourner le groupe parent seulement
    Object.values(parts).flat().forEach(o => { o.userData.rest ||= o.rotation.clone(); });
    r.traverse(o => { if (!o.isMesh) return; let p = o, id = null; while (p && p !== r.parent && !id) { id = cardFor(p.name); p = p.parent; } id ||= 'body'; o.userData.card = id; pickables.push(o); });
    r.traverse(o => { const id = cardFor(o.name); if (id && o !== r) (groups[id] ||= []).push(o); });
    if (!groups.c204 && unit) groups.c204 = [unit];
  }
  function attachUnit(r) {
    let u = r.getObjectByName('c204_unit');
    if (u) { unit = u; return; } // le GLB livre sa propre C204
    unit = named('c204_unit', new THREE.Group()); unit.position.set(-0.34, FLOOR + 0.04, -0.4); unit.rotation.y = Math.PI / 2; r.add(unit);
    unit.add(named('c204_placeholder', placeholderUnit(m)));
    const mount = named('c204_mount', new THREE.Mesh(boxG(1.16, 0.04, 0.48, 0, -0.02, 0), m.mount)); unit.add(mount);
    const cc = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.2, FLOOR + 0.38, -0.05), new THREE.Vector3(-0.15, FLOOR + 0.5, 0.15), new THREE.Vector3(-0.08, 0.7, 0.3), new THREE.Vector3(0, 0.72, 0.29)]);
    r.add(named('c204_cable', new THREE.Mesh(new THREE.TubeGeometry(cc, 20, 0.012, 5), m.cable)));
    c204Ready.then(src => {
      if (!src || !unit) return; const mm = mergeByMaterial(src); mm.name = 'c204_unit_glb';
      const bb = new THREE.Box3().setFromObject(mm); mm.position.set(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
      const ph = unit.getObjectByName('c204_placeholder'); unit.remove(ph); ph.geometry.dispose(); unit.add(mm); index(root);
    });
  }
  function setRoot(r) {
    if (root) { holder.remove(root); dispose(root); }
    root = r; holder.add(r); attachUnit(r); index(r);
    const cm = unit.getWorldPosition(new THREE.Vector3()); unitLight.position.copy(cm).add(new THREE.Vector3(0, 0.5, 0));
  }
  setRoot(buildProcedural(m));

  // GLB final (assets/corvette.json -> { "url": ... })
  (async () => {
    let url = null; try { url = (await (await fetch('assets/corvette.json', { cache: 'no-store' })).json()).url; } catch { return; }
    if (!url) return;
    makeLoader().load(url, gltf => {
      setRoot(gltf.scene); source = url;
      mixer = new THREE.AnimationMixer(gltf.scene); actions = {};
      gltf.animations.forEach(c => { const n = c.name.toLowerCase(); const k = ACTS.find(a => matchKey(n, a)); if (k && !actions[k]) actions[k] = mixer.clipAction(c); });
      mixer.addEventListener('finished', e => { if (e.direction < 0 && e.action !== actions.jump) e.action.stop(); });
      const jc = actions.jump?.getClip(); jumpScales = [];
      jc?.tracks.forEach(t => { if (t.name.endsWith('.scale')) { const o = gltf.scene.getObjectByName(t.name.split('.')[0]); if (o) jumpScales.push([o, o.scale.clone()]); } });
      actions.idle?.play();
      if (actions.top_down) toggle('top', true, true);
      console.log('GLB Corvette chargé', url, Object.keys(actions));
    }, undefined, () => {});
  })();

  function playAction(a, on, instant) {
    const d = a.getClip().duration, active = a.isScheduled();
    a.clampWhenFinished = true; a.setLoop(THREE.LoopOnce, 1);
    if (on) { if (!active) a.reset().play(); a.enabled = true; a.paused = false; a.timeScale = 1; if (instant) a.time = d; return; }
    if (!active) return; if (a.paused && a.time >= d - 1e-3) a.time = d; a.enabled = true; a.paused = false; a.timeScale = -1;
  }
  const ACT_OF = { doors: 'doors_open', top: 'top_down', hood: 'hood_open' };
  function toggle(what, on, instant = false) {
    target[what] = on ? 1 : 0;
    const a = actions[ACT_OF[what]]; if (a) playAction(a, on, instant); else if (instant) state[what] = target[what];
    return on;
  }
  function apply(o, axis, amount) { if (o.userData.rest) o.rotation[axis] = o.userData.rest[axis] + amount; }
  function update(dt, t, rpm, fieldLevel) {
    for (const k in state) state[k] += (target[k] - state[k]) * Math.min(1, dt * 3.5);
    if (!actions.doors_open) { parts.door_L.forEach(o => apply(o, 'y', -1.1 * state.doors)); parts.door_R.forEach(o => apply(o, 'y', 1.1 * state.doors)); }
    if (!actions.hood_open) parts.hood.forEach(o => apply(o, 'x', -0.95 * state.hood));
    parts.trunk.forEach(o => apply(o, 'x', -0.9 * state.trunk));
    if (!actions.top_down) parts.soft_top.forEach(o => { apply(o, 'x', -2.85 * state.top); o.scale.y = 1 - 0.55 * state.top; });
    if (spinT > 0) { spinT -= dt; if (!actions.wheels_spin) parts.wheels.forEach(o => o.rotation.x += 12 * dt * Math.min(1, spinT)); if (spinT <= 0) actions.wheels_spin?.fadeOut(0.4); }
    const amp = Math.max(rpm * 0.006, shake * 0.012);
    holder.position.set((Math.random() - 0.5) * amp, Math.abs(Math.random() - 0.5) * amp, (Math.random() - 0.5) * amp);
    m.head.emissiveIntensity += (lights * 2.2 - m.head.emissiveIntensity) * Math.min(1, dt * 5);
    m.tail.emissiveIntensity += (lights * 2.5 - m.tail.emissiveIntensity) * Math.min(1, dt * 5);
    unitLight.intensity = rpm * 2.5 + lights * 0.5;
    field.visible = fieldLevel > 0.02;
    if (field.visible) shells.forEach((s, i) => { s.material.opacity = fieldLevel * (0.18 + 0.12 * Math.sin(t * 4 + i)); s.rotation.z = t * (0.2 + i * 0.15) * (i ? -1 : 1); });
    if (mixer) mixer.update(dt);
  }
  function spin(sec = 2.5) { spinT = sec; const a = actions.wheels_spin; if (a) { a.reset().setLoop(THREE.LoopRepeat).fadeIn(0.2).play(); } }
  function startJump() { actions.jump?.reset().setLoop(THREE.LoopOnce).play(); shake = 1; }
  function hide() { if (!actions.jump) holder.visible = false; }
  function show() { holder.visible = true; }
  function endJump() { // toujours appelé à la fin ou à l'arrêt : la voiture revient entière
    shake = 0; holder.visible = true; holder.scale.set(1, 1, 1); holder.position.set(0, 0, 0);
    if (actions.jump?.isScheduled()) actions.jump.stop();
    if (root) { root.visible = true; root.scale.set(1, 1, 1); }
    jumpScales.forEach(([o, s]) => { o.scale.copy(s); o.visible = true; });
  }
  let hi = new Map();
  function highlight(id) {
    hi.forEach((mat, o) => { o.material.dispose?.(); o.material = mat; }); hi.clear(); if (!id) return;
    pickables.forEach(o => { if (o.userData.card === id && !Array.isArray(o.material) && o.material.emissive) { hi.set(o, o.material); const c = o.material.clone(); c.emissive = new THREE.Color(0x6a5200); c.emissiveIntensity = 1; o.material = c; } });
  }
  function dispose(r) {
    r.traverse(o => { if (o.isMesh) o.geometry?.dispose(); });
  }
  function stats() {
    let tris = 0, meshes = 0; holder.traverse(o => { if (o.isMesh && o.visible) { meshes++; const g = o.geometry; tris += (g.index ? g.index.count : g.attributes.position.count) / 3; } });
    return { source, meshes, tris: Math.round(tris), actions: Object.keys(actions), visible: holder.visible && (root?.visible ?? false), scale: holder.scale.x, state: { ...state }, unit: !!unit, unitGLB: !!scene.getObjectByName('c204_unit_glb'), names: Object.keys(groups) };
  }
  return {
    scene, update, toggle, spin, startJump, hide, show, endJump, highlight, stats,
    setLights: v => { lights = v; },
    get pickables() { return pickables; }, get groups() { return groups; }, get state() { return target; },
  };
}
