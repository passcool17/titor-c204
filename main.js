import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { PARTS, TOUR, STEPS, DOSSIER } from './data.js?v=0.6';
import { CAR_PARTS, CAR_STEPS } from './data-car.js?v=0.6';
import { createCorvette } from './corvette.js?v=0.6';

const $ = s => document.querySelector(s);
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05080c);
scene.fog = new THREE.Fog(0x05080c, 6, 16);
const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 60);
camera.position.set(1.15, 1.45, 1.5);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.target.set(0, 0.2, 0);
controls.minDistance = 0.5; controls.maxDistance = 7; controls.maxPolarAngle = Math.PI * 0.49;

scene.add(new THREE.HemisphereLight(0xbfd8ff, 0x20160c, 1.1));
const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(2, 4, 3); scene.add(sun);
const coreLight = new THREE.PointLight(0x66ccff, 0, 3); coreLight.position.set(-0.12, 0.3, 0); scene.add(coreLight);

// sol + grille
const floor = new THREE.Mesh(new THREE.CircleGeometry(6, 48), new THREE.MeshStandardMaterial({ color: 0x0d151c, roughness: 0.95 }));
floor.rotation.x = -Math.PI / 2; scene.add(floor);
const grid = new THREE.GridHelper(12, 48, 0x1c3342, 0x10202a); grid.position.y = 0.001; scene.add(grid);
const blob = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.9), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.45 }));
blob.rotation.x = -Math.PI / 2; blob.position.y = 0.003; scene.add(blob);

// ---------- matériaux ----------
function stripeTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64; const g = c.getContext('2d');
  g.fillStyle = '#eee'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#111';
  for (let i = -64; i < 128; i += 22) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 11, 0); g.lineTo(i + 75, 64); g.lineTo(i + 64, 64); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function plateTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#7a7d72'; g.fillRect(0, 0, 256, 128); g.fillStyle = '#1a1a1a'; g.font = 'bold 15px monospace';
  ['UNIT CONTROL', 'INSTRUCTIONS', 'C204 GDTDU', 'TMH-2006/4605'].forEach((s, i) => g.fillText(s, 14, 28 + i * 26));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const M = {
  shell: new THREE.MeshStandardMaterial({ color: 0x3f4a3a, roughness: 0.7, metalness: 0.3 }),
  inner: new THREE.MeshStandardMaterial({ color: 0x2a2f33, roughness: 0.8, metalness: 0.2 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x9aa3ab, roughness: 0.35, metalness: 0.9 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x15191d, roughness: 0.6, metalness: 0.4 }),
  copper: new THREE.MeshStandardMaterial({ color: 0xb8692e, roughness: 0.35, metalness: 1 }),
  stripe: new THREE.MeshStandardMaterial({ map: stripeTex(), roughness: 0.6 }),
  plate: new THREE.MeshStandardMaterial({ map: plateTex(), roughness: 0.6 }),
  tank: new THREE.MeshStandardMaterial({ color: 0x101214, roughness: 0.4, metalness: 0.6 }),
  screen: new THREE.MeshStandardMaterial({ color: 0x031a10, emissive: 0x0a3a24, roughness: 0.2 }),
  red: new THREE.MeshStandardMaterial({ color: 0xaa1111, emissive: 0x220000, roughness: 0.4 }),
  led: new THREE.MeshStandardMaterial({ color: 0x113311, emissive: 0x000000, roughness: 0.4 }),
  cable: new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.8 }),
  beige: new THREE.MeshStandardMaterial({ color: 0xb8ad94, roughness: 0.7 }),
};
const coreMat = new THREE.MeshBasicMaterial({ color: 0x9fe8ff });
const haloMat = new THREE.SpriteMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, '#fff'); r.addColorStop(.3, '#7fdcff'); r.addColorStop(1, 'rgba(0,80,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 });

// ---------- modèle ----------
const machine = new THREE.Group(); scene.add(machine);
const pickables = []; const groups = {}; // id -> [objets]
const explodeData = []; // {obj, base, off}
function reg(id, obj, off = [0, 0, 0]) {
  if (!obj.parent) machine.add(obj);
  obj.userData.part = id; obj.traverse(o => { if (o.isMesh) { o.userData.part = id; pickables.push(o); } });
  (groups[id] ||= []).push(obj);
  explodeData.push({ obj, base: obj.position.clone(), off: new THREE.Vector3(...off) });
  return obj;
}
const box = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); return o; };
const cyl = (r, h, m, seg = 16) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);

const L = 1.4, D = 0.5, H = 0.3, T = 0.02; // dimensions estimées (m)
const singRot = [];
function buildProcedural() {
  // boîtier
  const hs = new THREE.Group();
  hs.add(box(L, T, D, M.shell, 0, T / 2, 0));
  hs.add(box(L, H, T, M.shell, 0, H / 2, D / 2 - T / 2));
  hs.add(box(L, H, T, M.shell, 0, H / 2, -D / 2 + T / 2));
  hs.add(box(T, H, D, M.shell, -L / 2 + T / 2, H / 2, 0));
  hs.add(box(T, H, D, M.shell, L / 2 - T / 2, H / 2, 0));
  hs.add(box(L - 0.04, 0.012, D - 0.04, M.inner, 0, 0.1, 0));
  for (const x of [-0.55, -0.02]) { const s = box(0.14, H * 0.98, 0.004, M.stripe, x, H / 2, D / 2 + 0.002); s.material = M.stripe; hs.add(s); }
  for (const x of [-0.6, 0.6]) hs.add(box(0.1, 0.03, 0.04, M.metal, x, H * 0.6, D / 2 + 0.02)); // poignées
  reg('case', hs);
  // couvercle à charnière (arrière)
  const lidPivot = new THREE.Group(); lidPivot.position.set(0, H, -D / 2);
  const lidG = new THREE.Group(); lidPivot.add(lidG);
  lidG.add(box(L, 0.04, D, M.shell, 0, 0.02, D / 2));
  for (const x of [-0.42, 0.1]) lidG.add(box(0.12, 0.002, D - 0.04, M.stripe, x, -0.002, D / 2));
  const pl = box(0.3, 0.002, 0.18, M.plate, 0.42, -0.002, D / 2); pl.rotation.x = Math.PI; lidG.add(pl);
  lidPivot.rotation.x = -1.95; reg('lid', lidPivot, [0, 0.35, -0.25]);
  // réservoirs (10)
  const tk = new THREE.Group();
  for (const x of [-0.6, -0.48]) { const c = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.28, 4, 12), M.tank); c.rotation.x = Math.PI / 2; c.position.set(x, 0.16, 0); tk.add(c); const b = box(0.02, 0.01, 0.3, M.metal, x, 0.215, 0); tk.add(b); }
  reg('tanks', tk, [-0.5, 0.25, 0]);
  // pompe (9)
  const pm = cyl(0.04, 0.08, M.metal); pm.position.set(-0.36, 0.15, -0.14); reg('pump', pm, [-0.2, 0.5, -0.3]);
  // singularités (1, 2) + bobines + boîtiers
  const coilG = new THREE.Group(), coolG = new THREE.Group(), motG = new THREE.Group(), magG = new THREE.Group();
  [['mainSing', -0.12], ['steerSing', 0.11]].forEach(([id, z], i) => {
    const g = new THREE.Group(); g.position.set(-0.2, 0.19, z);
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 14), new THREE.MeshStandardMaterial({ color: 0x222830, metalness: 0.8, roughness: 0.3, transparent: true, opacity: 0.55 }));
    g.add(shell);
    const spin = new THREE.Group(); g.add(spin);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.018, 1), coreMat); spin.add(core);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.004, 6, 24), coreMat); ring.rotation.x = Math.PI / 2; spin.add(ring);
    const halo = new THREE.Sprite(haloMat); halo.scale.setScalar(0.22); g.add(halo);
    singRot.push({ spin, dir: i ? -1 : 1, halo });
    reg(id, g, [0, 0.55, i ? 0.35 : -0.35]);
    for (let k = -2; k <= 2; k++) { const c = new THREE.Mesh(new THREE.TorusGeometry(0.083, 0.008, 6, 28), M.copper); c.rotation.y = Math.PI / 2; c.position.set(-0.2 + k * 0.025, 0.19, z); c.scale.setScalar(1 - Math.abs(k) * 0.12); coilG.add(c); }
    const ch = box(0.05, 0.05, 0.05, M.metal, -0.2 + 0.07, 0.25, z + 0.05); ch.rotation.y = 0.6; coolG.add(ch);
    const ms = box(0.025, 0.03, 0.025, M.dark, -0.2, 0.28, z); motG.add(ms);
    magG.add(box(0.1, 0.05, 0.07, M.dark, -0.2, 0.13, z));
  });
  reg('coils', coilG, [0, 0.4, 0]); reg('coolHousing', coolG, [0.1, 0.75, 0]); reg('motion', motG, [0, 0.9, 0]); reg('magGen', magG, [0, -0.02, 0.55]);
  // injecteur (4), régulateur (5), générateur (6)
  const inj = new THREE.Group();
  const path = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.2, 0.12, -0.12), new THREE.Vector3(-0.06, 0.12, -0.05), new THREE.Vector3(-0.06, 0.12, 0.05), new THREE.Vector3(-0.2, 0.12, 0.11)]);
  inj.add(new THREE.Mesh(new THREE.TubeGeometry(path, 20, 0.008, 6), M.copper));
  reg('injector', inj, [0.15, 0.3, 0]);
  const er = box(0.05, 0.05, 0.05, M.metal, -0.04, 0.14, 0); reg('eReg', er, [0.2, 0.45, 0]);
  const eg = box(0.16, 0.12, 0.22, M.dark, 0.1, 0.17, 0); eg.add(box(0.162, 0.03, 0.222, M.tank, 0, 0, 0)); reg('eGen', eg, [0.1, 0.35, 0.3]);
  // capteur de gravité (11), horloges (x3), ordinateurs (x4), batteries (12)
  const gs = new THREE.Group(); gs.add(box(0.04, 0.1, 0.04, M.tank, 0.26, 0.17, -0.16)); gs.add(box(0.07, 0.05, 0.08, M.beige, 0.3, 0.14, -0.08)); reg('gravSensor', gs, [0, 0.45, -0.3]);
  const ck = new THREE.Group(); for (let i = 0; i < 3; i++) { const b = box(0.05, 0.035, 0.06, M.beige, 0.24 + i * 0.06, 0.13, 0.13); b.add(box(0.03, 0.012, 0.002, M.led, 0, 0.005, 0.031)); ck.add(b); } reg('clocks', ck, [0, 0.55, 0.3]);
  const cp = new THREE.Group(); for (let i = 0; i < 4; i++) cp.add(box(0.035, 0.09, 0.08, M.dark, 0.41 + i * 0.045, 0.15, -0.14)); reg('computers', cp, [0, 0.4, -0.45]);
  const bt = new THREE.Group(); for (let i = 0; i < 4; i++) bt.add(box(0.055, 0.07, 0.09, M.tank, -0.15 + i * 0.06, 0.04, 0.17)); reg('battery', bt, [0, -0.03, 0.5]);
  // panneau de commande (p.7 : 4, 5, 6, 8) et stockage (9)
  const panel = box(0.24, 0.015, D - 0.06, M.inner, 0.48, H - 0.01, 0); reg('case', panel);
  const scr = box(0.1, 0.004, 0.06, M.screen, 0.44, H, -0.12); reg('screen', scr, [0, 0.3, 0]);
  const dis = cyl(0.022, 0.02, M.red); dis.position.set(0.44, H + 0.008, 0.06); reg('disconnect', dis, [0, 0.32, 0]);
  const sw = new THREE.Group(); sw.add(box(0.05, 0.01, 0.04, M.dark, 0, 0, 0)); const lever = box(0.01, 0.035, 0.01, M.metal, 0, 0.018, 0); lever.rotation.x = -0.5; sw.add(lever); sw.position.set(0.44, H + 0.005, 0.15); sw.userData.lever = lever; reg('onoff', sw, [0, 0.34, 0]);
  const em = new THREE.Group(); const leds = [];
  for (let i = 0; i < 8; i++) { const l = cyl(0.007, 0.008, M.led.clone(), 8); l.position.set(0.53, H + 0.004, -0.17 + i * 0.03); em.add(l); leds.push(l); }
  em.add(box(0.04, 0.008, 0.05, M.red, 0.56, H, 0.14)); reg('emergency', em, [0, 0.36, 0]);
  const st = box(0.11, H - 0.04, D - 0.06, M.beige, L / 2 - 0.08, (H - 0.04) / 2 + 0.01, 0); reg('storage', st, [0.45, 0.1, 0]);
  // télécommande (3) + câble
  const rc = new THREE.Group(); rc.add(box(0.12, 0.08, 0.06, M.beige, 0, 0.04, 0)); rc.add(box(0.07, 0.03, 0.002, M.screen, -0.01, 0.06, 0.031)); rc.add(box(0.06, 0.04, 0.05, M.dark, 0, -0.0, 0.0));
  rc.position.set(0.55, 0.02, 0.62); reg('remote', rc, [0.2, 0.2, 0.3]);
  const cc = new THREE.CatmullRomCurve3([new THREE.Vector3(0.62, 0.1, 0.25), new THREE.Vector3(0.66, 0.02, 0.4), new THREE.Vector3(0.6, 0.01, 0.55), new THREE.Vector3(0.55, 0.05, 0.6)]);
  reg('cable', new THREE.Mesh(new THREE.TubeGeometry(cc, 24, 0.006, 5), M.cable), [0.2, 0.1, 0.15]);
  return { leds, lever, scr };
}
let rig = buildProcedural();

// ---------- branchement du GLB (quand Rendu & export le livre) ----------
const NAME2ID = { housing: 'case', gravity_sensor_unit: 'gravSensor', lid: 'lid', singularity_main: 'mainSing', singularity_steering: 'steerSing', field_coil: 'coils', mag_field_generator: 'magGen', electron_injector_manifold: 'injector', electron_regulator: 'eReg', electron_generator: 'eGen', motion_sensor: 'motion', cooling_housing: 'coolHousing', cooling_pump: 'pump', cooling_tank: 'tanks', gravity_sensor: 'gravSensor', battery_pack: 'battery', cesium_clock: 'clocks', control_computer: 'computers', emergency_view_screen: 'screen', emergency_disconnect: 'disconnect', main_switch: 'onoff', emergency_controls: 'emergency', remote_storage_unit: 'storage', remote_control_unit: 'remote', cable_remote: 'cable' };
let mixer = null, actions = {}, glbRoot = null, fan = null;
const KEYS = Object.keys(NAME2ID).sort((x, y) => y.length - x.length); // préfixe le plus long d'abord
function idFor(name) { const n = (name || '').toLowerCase(); return KEYS.find(k => n === k || n.startsWith(k + '_')) && NAME2ID[KEYS.find(k => n === k || n.startsWith(k + '_'))]; }
let draco = null, ktx2 = null;
function makeLoader() { // un seul décodeur Draco/KTX2 partagé par les deux scènes
  draco ||= new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/gltf/');
  ktx2 ||= new KTX2Loader().setTranscoderPath('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/basis/').detectSupport(renderer);
  return new GLTFLoader().setDRACOLoader(draco).setKTX2Loader(ktx2).setMeshoptDecoder(MeshoptDecoder);
}
let c204Resolve; const c204Ready = new Promise(r => c204Resolve = r); // GLB de la machine, réutilisé (copie fusionnée) dans la voiture
async function tryGLB() {
  let url = null; try { url = (await (await fetch('assets/model.json', { cache: 'no-store' })).json()).url; } catch { return c204Resolve(null); }
  if (!url) return c204Resolve(null);
  const loader = makeLoader();
  loader.load(url, gltf => {
    // remplace le modèle provisoire et libère sa mémoire
    scene.remove(machine);
    machine.traverse(o => { if (o.isMesh) { o.geometry.dispose(); } if (o.isSprite) o.material.dispose?.(); });
    Object.values(M).forEach(m => { m.map?.dispose(); m.dispose(); });
    pickables.length = 0; for (const k in groups) delete groups[k]; explodeData.length = 0; singRot.length = 0;
    const root = gltf.scene; glbRoot = root; { const l = root.getObjectByName('lid'); if (l) l.userData.r0 = l.rotation.x; } machine.clear(); machine.add(root); scene.add(machine);
    root.updateMatrixWorld(true);
    const bbAll = new THREE.Box3().setFromObject(root), ctr = bbAll.getCenter(new THREE.Vector3());
    const parts = []; root.traverse(o => { if (o !== root && o.parent && !o.parent.userData.part) { const id = idFor(o.name); if (id) parts.push([id, o]); } });
    parts.forEach(([id, o]) => {
      const c = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
      const d = c.sub(ctr); d.y = 0; d.multiplyScalar(0.6);
      reg(id, o, id === 'case' ? [0, 0, 0] : id === 'lid' ? [0, 0.35, -0.25] : [d.x, 0.18 + Math.abs(d.x) * 0.25, d.z]);
    });
    // couvercle ouvert pour voir l'intérieur (pivot = charnière arrière)
    const lid = root.getObjectByName('lid'); if (lid && !gltf.animations.length) lid.rotation.x += -105 * Math.PI / 180; // sans animations : on l'ouvre nous-mêmes
    // boîtiers des singularités semi-transparents pour voir tourner rotors et cœurs
    ['singularity_main_housing', 'singularity_steering_housing'].forEach(n => root.getObjectByName(n)?.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.28; o.material.depthWrite = false; } }));
    // voyants, écran, levier
    const leds = []; root.traverse(o => { if (o.isMesh && /^emergency_controls_led_\d+/.test(o.name)) { o.material = o.material.clone(); o.material.emissive = new THREE.Color(0); o.material.emissiveIntensity = 3; o.scale.multiplyScalar(1.6); leds.push(o); } });
    leds.sort((x, y) => x.name.localeCompare(y.name));
    let scr = null; root.getObjectByName('emergency_view_screen')?.traverse(o => { if (o.isMesh && !scr) { o.material = o.material.clone(); scr = o; } });
    const lever = root.getObjectByName('main_switch_lever');
    rig = { leds, scr, lever: lever && { base: lever.rotation.x, set: on => lever.rotation.x = lever.userData.r0 + (on ? 0.9 : 0) } };
    if (lever) lever.userData.r0 = lever.rotation.x;
    fan = root.getObjectByName('cooling_fan_blades');
    // rotors des singularités + halo lumineux au cœur
    [['singularity_main', 1], ['singularity_steering', -1]].forEach(([n, dir]) => {
      const rotor = root.getObjectByName(n + '_rotor'), core = root.getObjectByName(n + '_core');
      let halo = null;
      if (core) { halo = new THREE.Sprite(haloMat); halo.scale.setScalar(0.18); halo.raycast = () => {}; core.add(halo); }
      if (rotor) singRot.push({ spin: rotor, dir, halo, axis: 'y' });
    });
    // champ et lumière centrés entre les deux singularités
    const cm = root.getObjectByName('singularity_main_core'), cs = root.getObjectByName('singularity_steering_core');
    if (cm && cs) { const pm = cm.getWorldPosition(new THREE.Vector3()), ps = cs.getWorldPosition(new THREE.Vector3()); field.position.copy(pm).add(ps).multiplyScalar(0.5); coreLight.position.copy(pm); }
    else field.position.copy(ctr);
    mixer = new THREE.AnimationMixer(root);
    // explode revenue au début : on l'arrête pour qu'elle ne pèse plus sur les autres actions (couvercle de startup)
    mixer.addEventListener('finished', e => { if (e.action === actions.explode && e.direction < 0) e.action.stop(); });
    gltf.animations.forEach(c => actions[c.name] = mixer.clipAction(c));
    if (actions.spin_singularities) actions.spin ||= actions.spin_singularities; if (actions.field_pulse) actions.field ||= actions.field_pulse;
    if (actions.spin || actions.lid_open) singRot.length = 0; // si l'animation fait tourner, on ne double pas
    actions.idle?.play();
    console.log('GLB C204 chargé', url, parts.length, 'pièces', Object.keys(actions), bbAll.getSize(new THREE.Vector3()).toArray().map(v => v.toFixed(2)));
    window.__c204.glb = { url, parts: parts.length, actions: Object.keys(actions) };
    c204Resolve(root);
  }, undefined, e => { console.warn('GLB non chargé', e); c204Resolve(null); });
}
tryGLB();

// ---------- champ sinusoïdal de Tipler (p.5) ----------
const field = new THREE.Group(); field.position.set(-0.05, 0.19, 0); field.visible = false; scene.add(field);
function hyperboloid(r0, k, len, color) {
  const pts = []; for (let i = 0; i <= 24; i++) { const y = -len + (2 * len * i) / 24; pts.push(new THREE.Vector2(r0 * Math.cosh(y / k), y)); }
  const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 28), new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  m.rotation.z = Math.PI / 2; return m;
}
const shells = [hyperboloid(0.35, 0.9, 1.9, 0x3fa9ff), hyperboloid(0.5, 1.0, 2.1, 0xd8f6ff), hyperboloid(0.65, 1.1, 2.3, 0xffb347)];
shells.forEach(s => field.add(s));
const inner = new THREE.Mesh(new THREE.SphereGeometry(0.45, 20, 12), new THREE.MeshBasicMaterial({ color: 0x7fdcff, wireframe: true, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }));
inner.scale.set(1.4, 1, 1); field.add(inner);
for (const x of [-1.6, -1.25, 1.25, 1.6]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.35 * Math.cosh(x / 0.9) * 1.25, 0.008, 6, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending })); r.rotation.y = Math.PI / 2; r.position.x = x; field.add(r); }
let fieldLevel = 0, fieldTarget = 0;

// particules du saut
const pGeo = new THREE.BufferGeometry(); const N = 400; const pPos = new Float32Array(N * 3); const pVel = new Float32Array(N * 3);
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const parts = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xaee9ff, size: 0.03, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
scene.add(parts);

// ---------- son (Web Audio : vrais effets dans assets/sfx, voir GAME.md) ----------
const SFX_NAMES = ['amb_hum', 'spin_loop', 'field_loop', 'click', 'tick', 'beep_soft', 'lid_open', 'jump', 'explode', 'abort'];
const LOOP_LEN = { amb_hum: 4.5, spin_loop: 4, field_loop: 4 }; // durée exacte des boucles (évite le bourrage des encodeurs)
const SFX_EXT = (() => { try { return document.createElement('audio').canPlayType('audio/ogg; codecs="opus"') ? 'ogg' : 'mp3'; } catch { return 'mp3'; } })();
const buf = {}, loops = {}, loopVol = { amb_hum: 0, spin_loop: 0, field_loop: 0 };
let ac = null, master = null, muted = localStorage.getItem('c204-muted') === '1';
function audio() {
  if (!ac) {
    if (navigator.userActivation && !navigator.userActivation.isActive) return; // pas encore de vrai geste : on attend (évite l'avertissement)
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { return; }
    master = ac.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ac.destination);
    if (!running) loopVol.amb_hum = 0.16; // ambiance discrète au repos
    SFX_NAMES.forEach(decodeSfx);
  }
  if (ac.state === 'suspended') ac.resume().catch(() => {});
}
// téléchargement paresseux (après l'affichage), décodage au premier toucher
const raw = {}, pending = {};
function fetchSfx(n) { return raw[n] ||= fetch(`assets/sfx/${n}.${SFX_EXT}`).then(r => r.ok ? r.arrayBuffer() : null).catch(() => null); }
setTimeout(() => SFX_NAMES.forEach(fetchSfx), 1500);
async function decodeSfx(n) {
  try {
    const ab = await fetchSfx(n); if (!ab) return;
    buf[n] = await new Promise((res, rej) => ac.decodeAudioData(ab.slice(0), res, rej));
    if (n in loopVol) setLoop(n, loopVol[n], 0.4);
    const p = pending[n]; delete pending[n]; if (p && performance.now() - p.t < 600) sfx(n, p.vol, p.rate); // joue un son demandé pendant le décodage
  } catch { /* son manquant : on continue sans lui */ }
}
function startLoop(n) {
  const b = buf[n]; if (!b) return null;
  const s = ac.createBufferSource(); s.buffer = b; s.loop = true;
  const off = SFX_EXT === 'mp3' ? 0.025 : 0; // délai d'encodeur mp3
  s.loopStart = off; s.loopEnd = Math.min(off + LOOP_LEN[n], b.duration);
  const g = ac.createGain(); g.gain.value = 0; s.connect(g).connect(master); s.start(0, off);
  return loops[n] = { s, g, v: 0, r: 1 };
}
function setLoop(n, v, tc = 0.3) {
  loopVol[n] = v; if (!ac) return;
  const L = loops[n] || startLoop(n); if (!L) return;
  L.v = v; L.g.gain.setTargetAtTime(v, ac.currentTime, tc);
}
function loopRate(n, r) { const L = loops[n]; if (L && Math.abs(L.r - r) > 0.01) { L.r = r; L.s.playbackRate.setTargetAtTime(r, ac.currentTime, 0.2); } }
function sfx(n, vol = 1, rate = 1) {
  if (!ac || muted) return;
  if (!buf[n]) { pending[n] = { t: performance.now(), vol, rate }; return; }
  const s = ac.createBufferSource(); s.buffer = buf[n]; s.playbackRate.value = rate;
  const g = ac.createGain(); g.gain.value = vol; s.connect(g).connect(master); s.start();
  return { s, g, stop(t = 0.15) { try { g.gain.setTargetAtTime(0, ac.currentTime, t); s.stop(ac.currentTime + t * 5); } catch {} } };
}
function setMuted(m) {
  muted = m; localStorage.setItem('c204-muted', m ? '1' : '0');
  const b = $('#bMute'); b.textContent = m ? '🔇' : '🔊'; b.setAttribute('aria-label', m ? 'Remettre le son' : 'Couper le son'); b.classList.toggle('off', m);
  if (ac) master.gain.setTargetAtTime(m ? 0 : 1, ac.currentTime, 0.05);
}
setMuted(muted);
$('#bMute').onclick = () => { audio(); setMuted(!muted); };
// débloque le son au premier vrai geste, partout (canvas compris, glisser compris)
const UNLOCK = ['pointerdown', 'pointerup', 'touchend', 'keydown', 'click'];
function unlockAudio() { audio(); if (ac && ac.state === 'running') UNLOCK.forEach(t => removeEventListener(t, unlockAudio, true)); }
UNLOCK.forEach(t => addEventListener(t, unlockAudio, { capture: true, passive: true }));
// clic sur chaque bouton de l'interface (sauf le bouton muet)
document.addEventListener('click', e => { const b = e.target.closest('button'); if (b && b.id !== 'bMute') { audio(); sfx('click', 0.45); } }, true);

// ---------- sélection / fiches ----------
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
let selected = null; const hiMat = new Map();
function highlight(id) {
  if (sceneId === 'corvette') return car?.highlight(id);
  hiMat.forEach((m, o) => o.material = m); hiMat.clear();
  if (!id) return;
  (groups[id] || []).forEach(g => g.traverse(o => { if (o.isMesh && o.material !== coreMat) { hiMat.set(o, o.material); const m = o.material.clone(); m.emissive = new THREE.Color(0x6a5200); m.emissiveIntensity = 1; o.material = m; } }));
}
function showPart(id, tourIdx, quiet) {
  const p = (sceneId === 'corvette' ? CAR_PARTS : PARTS)[id]; if (!p) return; selected = id; highlight(id); if (!quiet) sfx('beep_soft', 0.5);
  $('#shRef').textContent = p.ref; $('#shTitle').textContent = p.fr; $('#shEn').textContent = p.en;
  $('#shBody').textContent = p.body || ''; $('#shBody').style.display = p.body ? '' : 'none';
  // « Récit de Titor » et « Faits vérifiés » toujours séparés
  $('#shStory').classList.toggle('hidden', !p.story); $('#shStory p').textContent = p.story || '';
  $('#shFacts').classList.toggle('hidden', !p.facts); $('#shFacts p').textContent = p.facts || '';
  $('#shNote').textContent = p.note || ''; $('#shNote').style.display = p.note ? '' : 'none';
  $('#tourNav').classList.toggle('hidden', tourIdx == null);
  if (tourIdx != null) $('#tPos').textContent = `${tourIdx + 1} / ${TOUR.length}`;
  $('#sheet').classList.remove('hidden'); $('#dateBox').classList.add('hidden');
}
let downAt = null;
canvas.addEventListener('pointerdown', e => downAt = [e.clientX, e.clientY, performance.now()]);
canvas.addEventListener('pointerup', e => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 8 || performance.now() - downAt[2] > 400) return;
  ptr.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ptr, camera);
  $('#hint').style.opacity = 0;
  if (sceneId === 'corvette') {
    const id = carPick();
    if (id === 'c204') { sfx('beep_soft', 0.5); location.hash = '#machine'; return; } // toucher la C204 ouvre la vue Machine
    if (id) { if (id === 'wheels') car.spin(); focusOn(id); showPart(id); } else { $('#sheet').classList.add('hidden'); highlight(null); }
    return;
  }
  const hit = ray.intersectObjects(pickables, false)[0];
  if (hit) { tourIdx = null; focusOn(hit.object.userData.part); showPart(hit.object.userData.part); }
  else { $('#sheet').classList.add('hidden'); highlight(null); }
});
document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => { if (b.dataset.close === 'dossier') return closeDossier(); $('#' + b.dataset.close).classList.add('hidden'); if (b.dataset.close === 'sheet') { highlight(null); tourIdx = null; } });

// Corvette : repères touchables d'abord, puis la C204 (prioritaire), puis la zone élargie de l'installation si elle est devant
function carPick() {
  if (car.hotspots.some(h => h.visible)) { // si deux repères se chevauchent, celui dont le centre est le plus près du doigt
    const sh = ray.intersectObjects(car.hotspots, false), d2 = o => { const v = o.getWorldPosition(new THREE.Vector3()).project(camera); return (v.x - ptr.x) ** 2 * camera.aspect ** 2 + (v.y - ptr.y) ** 2; };
    if (sh.length) return sh.map(h => h.object).sort((a, b) => d2(a) - d2(b))[0].userData.card;
  }
  const hs = ray.intersectObjects(car.pickables, false);
  const real = hs.find(x => !x.object.userData.hitbox), hb = hs.find(x => x.object.userData.hitbox);
  if (real?.object.userData.card === 'c204') return 'c204';
  if (hb && (!real || hb.distance < real.distance + 0.05)) return 'install';
  return real?.object.userData.card || null;
}
// caméra animée
let camAnim = null;
function focusOn(id) {
  const objs = (sceneId === 'corvette' ? car.groups : groups)[id]; if (!objs) return;
  const bb = new THREE.Box3(); objs.forEach(o => bb.expandByObject(o));
  const c = bb.getCenter(new THREE.Vector3()); const s = Math.min(sceneId === 'corvette' ? 2.2 : 9, Math.max(0.25, bb.getSize(new THREE.Vector3()).length()));
  const dir = camera.position.clone().sub(controls.target).normalize();
  if (dir.y < 0.35) { dir.y = 0.5; dir.normalize(); }
  const dist = sceneId === 'corvette' ? Math.max(1.6, fitDist(bb.getSize(new THREE.Vector3()).length() / 2)) : s * 2.2 + 0.4; // la pièce entière reste à l'écran, portrait compris
  camAnim = { t: 0, fromP: camera.position.clone(), fromT: controls.target.clone(), toT: c, toP: c.clone().add(dir.multiplyScalar(dist)) };
}
function overview() { if (sceneId === 'corvette') return carOverview(); camAnim = { t: 0, fromP: camera.position.clone(), fromT: controls.target.clone(), toT: new THREE.Vector3(0, 0.2, 0), toP: new THREE.Vector3(1.15, 1.45, 1.5) }; }

// visite guidée
let tourIdx = null;
$('#bTour').onclick = () => { tourIdx = 0; go(); };
$('#tNext').onclick = () => { tourIdx = (tourIdx + 1) % TOUR.length; go(); };
$('#tPrev').onclick = () => { tourIdx = (tourIdx - 1 + TOUR.length) % TOUR.length; go(); };
function go() { const id = TOUR[tourIdx]; focusOn(id); showPart(id, tourIdx); }

// vue éclatée
let explode = 0, explodeTarget = 0;
function setExplode(on, speed = 1) {
  explodeTarget = on ? 1 : 0; $('#bExplode').classList.toggle('on', on);
  const a = actions.explode; if (!a) return; // sans GLB : le lerp de explode suit explodeTarget
  const d = a.getClip().duration, active = a.isScheduled();
  a.clampWhenFinished = true; a.setLoop(THREE.LoopOnce, 1);
  if (on) { if (!active) a.reset().play(); a.enabled = true; a.paused = false; a.timeScale = speed; return; }
  if (!active) return; // déjà refermée
  if (a.paused && a.time >= d - 1e-3) a.time = d; // figée à la fin : on repart de la fin, tout de suite
  a.enabled = true; a.paused = false; a.timeScale = -speed;
}
$('#bExplode').onclick = () => { setExplode(!explodeTarget); sfx('explode', 0.85, explodeTarget ? 1 : 0.85); camAnim = { t: 0, fromP: camera.position.clone(), fromT: controls.target.clone(), toT: new THREE.Vector3(0, explodeTarget ? 0.45 : 0.2, 0), toP: explodeTarget ? new THREE.Vector3(1.7, 2.1, 2.3) : new THREE.Vector3(1.15, 1.45, 1.5) }; };
$('#bField').onclick = () => { if (running) return; fieldTarget = fieldTarget ? 0 : 0.6; $('#bField').classList.toggle('on', !!fieldTarget); };

// dossier
$('#dosContent').innerHTML = DOSSIER;
function openDossier() { $('#sheet').classList.add('hidden'); $('#dateBox').classList.add('hidden'); $('#dossier').classList.remove('hidden'); document.body.classList.add('dos-open'); }
function closeDossier() { $('#dossier').classList.add('hidden'); document.body.classList.remove('dos-open'); }
$('#bDossier').onclick = openDossier;
document.querySelectorAll('#dossier [data-go]').forEach(b => b.onclick = () => document.getElementById(b.dataset.go).scrollIntoView({ behavior: 'smooth' }));

// ---------- séquence de démarrage ----------
let running = false, rpm = 0, rpmTarget = 0, abortFlag = false;
const waiters = new Set();
const wait = ms => new Promise((r, j) => { const w = { j, t: setTimeout(() => { waiters.delete(w); abortFlag ? j('abort') : r(); }, ms) }; waiters.add(w); });
function abortWaits() { waiters.forEach(w => { clearTimeout(w.t); w.j('abort'); }); waiters.clear(); } // l'arrêt agit tout de suite
$('#bStart').onclick = () => { if (running) return; closeDossier(); $('#sheet').classList.add('hidden'); $('#dateBox').classList.remove('hidden'); };
document.querySelectorAll('#dateBox .quick button').forEach(b => b.onclick = () => $('#dateIn').value = b.dataset.d);
$('#bGo').onclick = () => { audio(); $('#dateBox').classList.add('hidden'); startSeq($('#dateIn').value || '1975-01-01'); };
$('#bAbort').onclick = () => { if (abortFlag) return; abortFlag = true; abortWaits(); jumpSnd?.stop(); sfx('abort', 0.9); };
function fmtDate(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' }); }
async function startSeq(dest) {
  $('#stTitle').textContent = 'SÉQUENCE DE DÉMARRAGE';
  running = true; abortFlag = false; syncNav(); $('#hint').classList.add('hidden'); closeDossier();
  const wasExploded = explodeTarget > 0 || explode > 0.01 || !!actions.explode?.isScheduled();
  if (wasExploded) { setExplode(false, 2.5); sfx('explode', 0.7, 0.85); } // referme la vue éclatée (≈0,8 s) avant d'ouvrir le couvercle
  $('#destTxt').textContent = fmtDate(dest);
  const ol = $('#stSteps'); ol.innerHTML = STEPS.map(s => `<li>${s[0]}</li>`).join('');
  $('#status').classList.remove('hidden'); $('#count').textContent = ''; $('#bAbort').classList.remove('hidden');
  if (rig?.lever) rig.lever.set ? rig.lever.set(true) : (rig.lever.rotation.x = 0.5);
  sfx('click', 0.9, 0.85); sfx('lid_open', 0.9); // levier puis ouverture du couvercle
  if (actions.startup) { const go = () => { if (!running) return; actions.idle?.fadeOut(0.3); const a = actions.startup.reset(); a.setLoop(THREE.LoopOnce); a.clampWhenFinished = true; a.play(); }; wasExploded && actions.explode ? setTimeout(go, 850) : go(); }
  try {
    for (let i = 0; i < STEPS.length; i++) {
      const li = ol.children[i]; li.className = 'cur'; showPart(STEPS[i][1], undefined, true); sfx('beep_soft', 0.4, 0.8 + i * 0.07);
      if (rig?.leds) rig.leds.forEach((l, k) => { if (k < (i + 1) * rig.leds.length / STEPS.length) l.material.emissive.setHex(0x33ff66); });
      if (i === 0 && rig?.scr) rig.scr.material.emissive.setHex(0x1aff88);
      if (i === 5) { rpmTarget = 1; actions.spin?.play(); }
      if (i === 7) { fieldTarget = 1; actions.field?.play(); }
      setLoop('amb_hum', 0.2 + i * 0.06, 0.4); // l'ambiance monte pendant la séquence
      await wait(i === 5 ? 2200 : 1300); li.className = 'done';
    }
    $('#sheet').classList.add('hidden'); highlight(null); overview();
    for (let n = 5; n > 0; n--) { $('#count').textContent = n; sfx('tick', 0.9, n === 1 ? 1.25 : 1); await wait(1000); }
    $('#count').textContent = 'SAUT';
    await jump(dest);
  } catch (e) {
    $('#count').textContent = 'ARRÊTÉ';
    endJump(); // arrêt pendant le saut : la machine doit toujours revenir
  }
  finishSeq();
}
function finishSeq() {
  rpmTarget = 0; fieldTarget = 0; actions.spin?.fadeOut(1.5); actions.field?.fadeOut(1.5);
  setLoop('amb_hum', 0.16, 1.2); // puis redescend
  if (rig?.leds) rig.leds.forEach(l => l.material.emissive.setHex(0)); if (rig?.lever) rig.lever.set ? rig.lever.set(false) : (rig.lever.rotation.x = -0.5);
  if (rig?.scr) rig.scr.material.emissive.setHex(0x0a3a24);
  $('#bAbort').classList.add('hidden'); $('#bField').classList.remove('on');
  car?.setLights(0); syncNav();
  setTimeout(() => { $('#status').classList.add('hidden'); running = false; syncNav(); }, 4000);
}

// ---------- scène Corvette 1967 ----------
let car = null, sceneId = 'machine';
const camMem = { machine: { p: new THREE.Vector3(1.15, 1.45, 1.5), t: new THREE.Vector3(0, 0.2, 0) }, corvette: null };
const LIMITS = { machine: [0.5, 7], corvette: [1.4, 12] };
function ensureCar() { if (!car) { const t0 = performance.now(); car = createCorvette({ renderer, makeLoader, c204Ready, onReady: () => { if (sceneId === 'corvette') { $('#ttlSub').textContent = 'Installation de l\'unité · modèle 3D du projet'; if (!running) refitCar(); } } }); window.__c204.carBuildMs = Math.round(performance.now() - t0); } return car; }
// Cadrage depuis la vraie boîte de la voiture : la sphère englobante tient dans le plus petit angle de vue
// (portrait : l'horizontal), donc la voiture reste entière sous tous les angles de l'orbite, avec 10 % de marge.
const CAR_DIR = new THREE.Vector3(-0.62, 0.62, -0.48).normalize(); // vue arrière côté passager, en hauteur (on voit la C204)
function fitDist(r) { const v = THREE.MathUtils.degToRad(camera.fov / 2), h = Math.atan(Math.tan(v) * camera.aspect); return r / Math.sin(Math.min(v, h)) * 1.1; }
function carFit(dir) {
  const bb = car?.bbox; if (!bb) return null;
  const c = bb.getCenter(new THREE.Vector3()), d = fitDist(bb.getSize(new THREE.Vector3()).length() / 2);
  LIMITS.corvette[1] = Math.max(12, d * 1.4);
  return { t: c, p: c.clone().addScaledVector(dir, d), d };
}
function refitCar() { // au chargement, à chaque redimensionnement / rotation de l'écran, et à l'arrivée du GLB
  const dir = camera.position.clone().sub(controls.target); if (dir.lengthSq() < 1e-6) dir.copy(CAR_DIR); dir.normalize();
  const f = carFit(dir); if (!f) return; camAnim = null;
  controls.target.copy(f.t); camera.position.copy(f.p); [controls.minDistance, controls.maxDistance] = LIMITS.corvette; controls.update();
}
function carOverview() { const f = carFit(CAR_DIR); if (!f) return; [controls.minDistance, controls.maxDistance] = LIMITS.corvette; camAnim = { t: 0, fromP: camera.position.clone(), fromT: controls.target.clone(), toT: f.t, toP: f.p }; }
function syncNav() { ['#bToCar', '#bToMachine'].forEach(s => $(s).disabled = running); }
function setScene(id) {
  if (id === sceneId) return;
  if (running) { history.replaceState(null, '', '#' + sceneId); return; } // pas de changement pendant une séquence
  camMem[sceneId] = { p: camera.position.clone(), t: controls.target.clone() };
  highlight(null); $('#sheet').classList.add('hidden'); $('#dateBox').classList.add('hidden'); closeDossier();
  if (sceneId === 'machine' && explodeTarget) setExplode(false, 4);
  sceneId = id; if (id === 'corvette') ensureCar();
  document.body.dataset.scene = id;
  $('#bar').classList.toggle('hidden', id !== 'machine'); $('#barCar').classList.toggle('hidden', id !== 'corvette');
  $('#ttlMain').textContent = id === 'corvette' ? 'CORVETTE 1967 · C204' : 'ARMY MODEL GE / C204';
  $('#ttlSub').textContent = id === 'corvette' ? (car?.stats().glb ? 'Installation de l\'unité · modèle 3D du projet' : 'Installation de l\'unité · reconstitution provisoire') : 'Gravity Distortion Time Displacement Unit · simulation';
  $('#hint').textContent = id === 'corvette' ? 'Touche une pièce pour sa fiche · touche la C204 pour l\'ouvrir' : 'Touche une pièce pour sa fiche · glisse pour tourner · pince pour zoomer';
  const m = camMem[id]; camAnim = null;
  if (id === 'corvette') { if (m) { camera.position.copy(m.p); controls.target.copy(m.t); } else { controls.target.set(0, 0, 0); camera.position.copy(CAR_DIR); } refitCar(); return; } // garde l'angle, recadre la distance
  camera.position.copy(m.p); controls.target.copy(m.t);
  [controls.minDistance, controls.maxDistance] = LIMITS[id]; controls.update();
}
addEventListener('hashchange', () => setScene(location.hash === '#corvette' ? 'corvette' : 'machine'));
$('#bToCar').onclick = () => { location.hash = '#corvette'; };
$('#bToMachine').onclick = () => { location.hash = '#machine'; };
const carBtn = (sel, what) => $(sel).onclick = () => { if (running) return; const on = car.toggle(what, !car.state[what]); $(sel).classList.toggle('on', what === 'top' ? !on : on); };
carBtn('#bDoors', 'doors'); carBtn('#bTop', 'top'); carBtn('#bHood', 'hood');
$('#bTrip').onclick = () => { tourIdx = null; showPart('trip'); };
$('#bCarJump').onclick = () => startCarJump();
async function startCarJump() {
  if (running || !car) return;
  running = true; abortFlag = false; syncNav(); $('#hint').classList.add('hidden'); highlight(null); $('#sheet').classList.add('hidden');
  car.toggle('doors', false); car.toggle('hood', false); $('#bDoors').classList.remove('on'); $('#bHood').classList.remove('on');
  $('#stTitle').textContent = 'SAUT DEPUIS LA CORVETTE'; $('#destTxt').textContent = '1975 (récit de Titor)';
  const ol = $('#stSteps'); ol.innerHTML = CAR_STEPS.map(s => `<li>${s}</li>`).join('');
  $('#status').classList.remove('hidden'); $('#count').textContent = ''; $('#bAbort').classList.remove('hidden');
  sfx('click', 0.9, 0.85); carOverview();
  try {
    for (let i = 0; i < CAR_STEPS.length; i++) {
      const li = ol.children[i]; li.className = 'cur'; sfx('beep_soft', 0.4, 0.8 + i * 0.09);
      if (i === 1) car.setLights(1); // les feux s'allument
      if (i === 3) rpmTarget = 1;
      if (i === 4) fieldTarget = 1;
      setLoop('amb_hum', 0.2 + i * 0.08, 0.4);
      await wait(i === 3 ? 2000 : 1300); li.className = 'done';
    }
    for (let n = 5; n > 0; n--) { $('#count').textContent = n; sfx('tick', 0.9, n === 1 ? 1.25 : 1); await wait(1000); }
    $('#count').textContent = 'SAUT';
    const T = car.jumpTiming; // calé sur le clip jump du GLB (disparition img 72-94) ou sur le saut par code
    const until = async t => { while (car.jumpClock() < t - 1e-3) await wait(30); }; // suit l'horloge du clip, même si l'appareil rame
    car.startJump(); jumpSnd = sfx('jump', 1); // la voiture reste immobile et vibre
    await until(T.flash);
    $('#flash').style.opacity = 1; await until(T.gone);
    car.hide(); $('#flash').style.opacity = 0; await until(T.back);
    car.show(); $('#flash').style.opacity = 0.8; await wait(200); $('#flash').style.opacity = 0;
    await until(T.end);
    car.endJump();
    $('#count').innerHTML = '<small style="font-size:13px">Arrivée simulée :</small><br>1975';
  } catch (e) {
    $('#count').textContent = 'ARRÊTÉ';
    $('#flash').style.opacity = 0; car.endJump(); // un arrêt remet toujours la voiture visible, à l'échelle 1
  }
  finishSeq(); // le titre « SAUT DEPUIS LA CORVETTE » reste jusqu'à la fermeture du panneau
}
let jumpT = -1, jumpSnd = null;
function endJump() {
  machine.visible = true; $('#flash').style.opacity = 0;
  jumpT = -1; parts.material.opacity = 0; pPos.fill(0); pGeo.attributes.position.needsUpdate = true;
  if (actions.jump?.isScheduled()) actions.jump.fadeOut(0.3);
  if (actions.idle && !actions.idle.isRunning()) actions.idle.reset().fadeIn(0.3).play();
}
async function jump(dest) {
  actions.jump?.reset().setLoop(THREE.LoopOnce).play();
  jumpSnd = sfx('jump', 1);
  jumpT = 0; for (let i = 0; i < N; i++) { pPos.set([(Math.random() - .5) * 1.4, Math.random() * 0.5, (Math.random() - .5) * 0.6], i * 3); const a = Math.random() * 6.28; pVel.set([Math.cos(a) * 2, Math.random() * 2, Math.sin(a) * 2], i * 3); }
  await wait(1400);
  $('#flash').style.opacity = 1; await wait(350);
  machine.visible = false; (groups.case?.[0]?.parent && scene.children.includes(machine)) || 0;
  $('#flash').style.opacity = 0; await wait(1800);
  machine.visible = true; $('#flash').style.opacity = 0.8; await wait(200); $('#flash').style.opacity = 0;
  $('#count').innerHTML = `<small style="font-size:13px">Arrivée simulée :</small><br>${fmtDate(dest)}`;
  jumpT = -1;
}

// ---------- boucle ----------
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < h ? 62 : 45; camera.updateProjectionMatrix(); if (sceneId === 'corvette' && car) refitCar(); }
addEventListener('resize', resize); resize();
$('#bFull').onclick = async () => { try { if (!document.fullscreenElement) { await document.documentElement.requestFullscreen(); await screen.orientation?.lock?.('portrait').catch(() => {}); } else await document.exitFullscreen(); } catch {} };

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  controls.update();
  if (camAnim) { camAnim.t = Math.min(1, camAnim.t + dt * 1.6); const k = 1 - Math.pow(1 - camAnim.t, 3); camera.position.lerpVectors(camAnim.fromP, camAnim.toP, k); controls.target.lerpVectors(camAnim.fromT, camAnim.toT, k); if (camAnim.t >= 1) camAnim = null; }
  if (sceneId === 'corvette') {
    rpm += (rpmTarget - rpm) * dt * 0.8; fieldLevel += (fieldTarget - fieldLevel) * dt * 1.2;
    $('#gRpm').style.width = (rpm * 100) + '%'; $('#gGrav').style.width = (fieldLevel * 100) + '%';
    car.sizeHotspots(camera, innerHeight); car.showHotspots(!running);
    car.update(dt, t, rpm, fieldLevel); updateLoops(); renderer.render(car.scene, camera); return;
  }
  explode += (explodeTarget - explode) * Math.min(1, dt * 4);
  if (!mixer || !actions.explode) explodeData.forEach(e => e.obj.position.copy(e.base).addScaledVector(e.off, explode));
  rpm += (rpmTarget - rpm) * dt * 0.8;
  const spinSpeed = 0.6 + rpm * 40;
  singRot.forEach(s => { if (s.axis) s.spin.rotation[s.axis] += s.dir * spinSpeed * dt; else { s.spin.rotation.y += s.dir * spinSpeed * dt; s.spin.rotation.x = Math.sin(t * 3) * 0.2 * rpm; } if (s.halo) { haloMat.opacity = 0.15 + rpm * 0.85; s.halo.scale.setScalar(0.18 + rpm * 0.12 + Math.sin(t * 20) * 0.01 * rpm); } });
  if (fan) fan.rotation.x += (1 + rpm * 25) * dt;
  coreLight.intensity = rpm * 3;
  $('#gRpm').style.width = (rpm * 100) + '%'; $('#gGrav').style.width = (fieldLevel * 100) + '%';
  fieldLevel += (fieldTarget - fieldLevel) * dt * 1.2;
  field.visible = fieldLevel > 0.02;
  if (field.visible) { shells.forEach((s, i) => { s.material.opacity = fieldLevel * (0.25 + 0.15 * Math.sin(t * 4 + i)); s.rotation.x = t * (0.3 + i * 0.2) * (i % 2 ? -1 : 1); }); inner.material.opacity = fieldLevel * 0.3; inner.rotation.x = t; field.scale.setScalar(0.6 + fieldLevel * 0.4); }
  updateLoops();
  if (jumpT >= 0) { jumpT += dt; parts.material.opacity = Math.max(0, 1 - jumpT / 3); for (let i = 0; i < N * 3; i++) pPos[i] += pVel[i] * dt; pGeo.attributes.position.needsUpdate = true; } else parts.material.opacity = 0;
  if (mixer) mixer.update(dt);
  renderer.render(scene, camera);
});
function updateLoops() {
  if (ac) { let sv = Math.min(0.55, rpm * 0.6), fv = Math.min(0.6, fieldLevel * 0.7); if (sv < 0.012) sv = 0; if (fv < 0.012) fv = 0; if (Math.abs((loops.spin_loop?.v ?? 0) - sv) > 0.01 || !loops.spin_loop) setLoop('spin_loop', sv, 0.15); if (Math.abs((loops.field_loop?.v ?? 0) - fv) > 0.01 || !loops.field_loop) setLoop('field_loop', fv, 0.15); loopRate('spin_loop', 0.7 + rpm * 0.5); loopRate('amb_hum', 1 + rpm * 0.12); }
}
setTimeout(() => { const l = $('#loading'); l.style.opacity = 0; setTimeout(() => l.remove(), 700); }, 300);
const demo = new URLSearchParams(location.search).get('demo');
if (demo === 'explode') $('#bExplode').click();
if (demo === 'field') { rpmTarget = 1; fieldTarget = 1; }
if (demo === 'tour') $('#bTour').click();
if (demo === 'dossier') $('#bDossier').click();
window.__c204 = { version: '0.6', overview: () => overview(), carView: () => car && car.bbox && (() => { const bb = car.bbox, xs = [], ys = []; for (let i = 0; i < 8; i++) { const v = new THREE.Vector3(i & 1 ? bb.max.x : bb.min.x, i & 2 ? bb.max.y : bb.min.y, i & 4 ? bb.max.z : bb.min.z).project(camera); xs.push((v.x + 1) / 2 * innerWidth); ys.push((1 - v.y) / 2 * innerHeight); } return { x0: Math.round(Math.min(...xs)), x1: Math.round(Math.max(...xs)), y0: Math.round(Math.min(...ys)), y1: Math.round(Math.max(...ys)), dist: +camera.position.distanceTo(controls.target).toFixed(2) }; })(), pickAt(x, y) { ptr.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ptr, camera); return carPick(); }, hotspotAt(card) { const h = car?.hotspots.find(h => h.userData.card === card); if (!h || !h.visible) return null; const v = h.getWorldPosition(new THREE.Vector3()).project(camera); return [Math.round((v.x + 1) / 2 * innerWidth), Math.round((1 - v.y) / 2 * innerHeight)]; }, camera, controls, screenOf(n) { const o = (sceneId === 'corvette' ? car.scene : scene).getObjectByName(n); if (!o) return null; const v = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()).project(camera); return [Math.round((v.x + 1) / 2 * innerWidth), Math.round((1 - v.y) / 2 * innerHeight)]; }, get scene() { return sceneId; }, get car() { return car && car.stats(); }, get render() { const i = renderer.info; return { calls: i.render.calls, triangles: i.render.triangles, geometries: i.memory.geometries, textures: i.memory.textures, heapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null }; }, get machineVisible() { return machine.visible; }, get explode() { const a = actions.explode; return { target: explodeTarget, lerp: +explode.toFixed(3), time: a ? +a.time.toFixed(3) : null, active: a ? a.isScheduled() : false, paused: a ? a.paused : null }; }, groups, PARTS, renderer, get sfx() { return Object.keys(buf); }, get audio() { return { state: ac?.state || 'off', ext: SFX_EXT, muted, master: master?.gain.value, loops: Object.fromEntries(Object.entries(loops).map(([k, L]) => [k, +L.g.gain.value.toFixed(3)])) }; } };

if (location.hash === '#corvette') setScene('corvette');
