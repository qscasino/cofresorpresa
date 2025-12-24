// Three.js CDN (módulo). Funciona directo en GitHub Pages.
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const STORAGE_KEY = "noel_chest_prize_v3_three";

// ===== DOM =====
const preloader = document.getElementById("preloader");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const progressSub  = document.getElementById("progressSub");

const soundBtn = document.getElementById("soundBtn");
const wrap = document.getElementById("threeWrap");
const hint = document.getElementById("hint");

const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const claimBtn = document.getElementById("claimBtn");
const copyBtn = document.getElementById("copyBtn");
const tinyMsg = document.getElementById("tinyMsg");

const bigRarity = document.getElementById("bigRarity");
const bigIcon = document.getElementById("bigIcon");
const bigTitle = document.getElementById("bigTitle");
const bigDesc = document.getElementById("bigDesc");

// ===== PRIZES =====
const PRIZES = [
  { id:"100", label:"BONO 100%", rarity:"COMÚN",      icon:"🎁", desc:"Mostrale este resultado a tu asesor para acreditarlo.",              weight: 52, tint: 0xffd36a },
  { id:"150", label:"BONO 150%", rarity:"RARA",       icon:"💎", desc:"Mostrale este resultado a tu asesor para acreditarlo.",              weight: 26, tint: 0x88ddff },
  { id:"200", label:"BONO 200%", rarity:"LEGENDARIA", icon:"🏆", desc:"¡Premio máximo! Mostralo a tu asesor para acreditarlo.",             weight: 12, tint: 0xffe39a },
  { id:"choice", label:"BONO A ELECCIÓN", rarity:"ÉPICA", icon:"🎯", desc:"Elegí tu bono con tu asesor. Mostrale este resultado.",         weight: 7,  tint: 0xc28bff },
  { id:"mystery", label:"BONO SORPRESA", rarity:"MISTERIOSA", icon:"❓", desc:"Tu asesor te dirá la sorpresa. Mostrale este resultado.",   weight: 3,  tint: 0xffa45a },
];

function weightedPick(items){
  const total = items.reduce((s, it) => s + it.weight, 0);
  let r = Math.random() * total;
  for(const it of items){
    r -= it.weight;
    if(r <= 0) return it;
  }
  return items[0];
}

function savePrize(prize){
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: prize.id, ts: Date.now() }));
}
function loadPrize(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return null;
  try{
    const parsed = JSON.parse(raw);
    const prize = PRIZES.find(p => p.id === parsed.id);
    return prize || null;
  }catch{
    return null;
  }
}

// Reset rápido: ?reset=1
if(new URLSearchParams(location.search).get("reset") === "1"){
  localStorage.removeItem(STORAGE_KEY);
}

// ===== AUDIO (opcional) =====
let soundEnabled = true;
let audioUnlocked = false;

const sounds = {
  ambient: new Audio("assets/ambient.mp3"),
  open:    new Audio("assets/sfx_open.mp3"),
  reveal:  new Audio("assets/sfx_reveal.mp3"),
};

Object.values(sounds).forEach(a => {
  a.volume = 0.55;
  a.onerror = () => {};
});
sounds.ambient.loop = true;
sounds.ambient.volume = 0.28;

function unlockAudio(){
  if(audioUnlocked) return;
  audioUnlocked = true;
  if(soundEnabled) sounds.ambient.play().catch(()=>{});
}
function playSound(a){
  if(!soundEnabled || !a) return;
  a.currentTime = 0;
  a.play().catch(()=>{});
}

window.addEventListener("pointerdown", unlockAudio, { once:true });

soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundBtn.textContent = soundEnabled ? "🔊" : "🔇";
  soundBtn.classList.toggle("muted", !soundEnabled);
  if(soundEnabled){
    unlockAudio();
    sounds.ambient.play().catch(()=>{});
  }else{
    sounds.ambient.pause();
  }
});

// ===== MODAL =====
function openModal(prize){
  bigRarity.textContent = prize.rarity;
  bigIcon.textContent   = prize.icon;
  bigTitle.textContent  = prize.label;
  bigDesc.textContent   = prize.desc;

  modal.classList.add("active");
  modal.setAttribute("aria-hidden","false");
  tinyMsg.textContent = "";
}
function closeModal(){
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden","true");
  tinyMsg.textContent = "";
}
modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if(e.target === modal) closeModal(); });

claimBtn.addEventListener("click", () => {
  tinyMsg.textContent = "✅ Listo. Mostrale esta pantalla a tu asesor para acreditarlo.";
});

copyBtn.addEventListener("click", async () => {
  const prize = loadPrize();
  if(!prize) return;
  const text = `🎁 El Secreto de Papá Noel — Premio: ${prize.label} (${prize.rarity})`;
  try{
    await navigator.clipboard.writeText(text);
    tinyMsg.textContent = "📋 Copiado. Pegalo en WhatsApp.";
  }catch{
    tinyMsg.textContent = "No se pudo copiar (bloqueo del navegador).";
  }
});

// ===== PRELOADER fake =====
async function runPreloader(){
  const minTime = 900;
  const start = performance.now();
  let p = 0;

  const steps = ["Preparando la magia…", "Cargando el cofre 3D…", "Armando el escenario…", "Listo 🎄"];
  const timer = setInterval(() => {
    p = Math.min(100, p + (Math.random() * 14 + 7));
    progressFill.style.width = `${p}%`;
    progressText.textContent = `${Math.floor(p)}%`;

    if(p < 35)       progressSub.textContent = steps[0];
    else if(p < 65)  progressSub.textContent = steps[1];
    else if(p < 92)  progressSub.textContent = steps[2];
    else             progressSub.textContent = steps[3];

    if(p >= 100) clearInterval(timer);
  }, 120);

  while(performance.now() - start < minTime){
    await new Promise(r => setTimeout(r, 60));
  }

  progressFill.style.width = `100%`;
  progressText.textContent = `100%`;
  progressSub.textContent = steps[3];

  await new Promise(r => setTimeout(r, 240));
  preloader.classList.add("hidden");
}
await runPreloader();

// ===== THREE SETUP =====
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(wrap.clientWidth, wrap.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
wrap.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x07070c, 8, 30);

const camera = new THREE.PerspectiveCamera(45, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
camera.position.set(0, 3.2, 9.5);
camera.lookAt(0, 1.8, 0);

// Lights
scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1a22, 0.9));

const dir = new THREE.DirectionalLight(0xffffff, 1.1);
dir.position.set(6, 10, 6);
scene.add(dir);

const goldLight = new THREE.PointLight(0xffd36a, 0.0, 18, 2);
goldLight.position.set(0, 2.0, 0.5);
scene.add(goldLight);

// Ground (snow)
const groundMat = new THREE.MeshStandardMaterial({
  color: 0xdfe8ff,
  roughness: 0.95,
  metalness: 0.0,
});
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
scene.add(ground);

// ===== AMBIENCE: TREES + SANTA =====
const ambience = new THREE.Group();
scene.add(ambience);

const treeGreen  = new THREE.MeshStandardMaterial({ color: 0x145a34, roughness: 0.92, metalness: 0.02 });
const treeGreen2 = new THREE.MeshStandardMaterial({ color: 0x0e4a2a, roughness: 0.92, metalness: 0.02 });
const bark       = new THREE.MeshStandardMaterial({ color: 0x5b3a1e,  roughness: 0.95, metalness: 0.01 });

// Emissive bulbs materials (luces)
const bulbMats = [
  new THREE.MeshStandardMaterial({ color: 0xffe28a, emissive: 0xffd36a, emissiveIntensity: 1.2, roughness: 0.25, metalness: 0.2 }),
  new THREE.MeshStandardMaterial({ color: 0xff6b6b, emissive: 0xff3b3b, emissiveIntensity: 1.2, roughness: 0.25, metalness: 0.2 }),
  new THREE.MeshStandardMaterial({ color: 0x7bd3ff, emissive: 0x3aa8ff, emissiveIntensity: 1.2, roughness: 0.25, metalness: 0.2 }),
  new THREE.MeshStandardMaterial({ color: 0xb6ff9b, emissive: 0x42ff7a, emissiveIntensity: 1.2, roughness: 0.25, metalness: 0.2 }),
];

function makeTree({ x, z, s=1.0, lights=true }){
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  // trunk
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16*s, 0.22*s, 1.0*s, 8), bark);
  trunk.position.y = 0.5*s;
  g.add(trunk);

  // pine layers
  const c1 = new THREE.Mesh(new THREE.ConeGeometry(0.95*s, 1.5*s, 7), treeGreen);
  c1.position.y = 1.4*s;
  g.add(c1);

  const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.75*s, 1.3*s, 7), treeGreen2);
  c2.position.y = 2.1*s;
  g.add(c2);

  const c3 = new THREE.Mesh(new THREE.ConeGeometry(0.55*s, 1.1*s, 7), treeGreen);
  c3.position.y = 2.75*s;
  g.add(c3);

  // star top
  const starMat = new THREE.MeshStandardMaterial({
    color: 0xffe39a,
    emissive: 0xffd36a,
    emissiveIntensity: 0.9,
    roughness: 0.35,
    metalness: 0.8
  });
  const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.16*s, 0), starMat);
  star.position.y = 3.35*s;
  star.rotation.y = Math.random()*Math.PI;
  g.add(star);

  // garlands + bulbs
  if(lights){
    const bulbs = new THREE.Group();
    const bulbGeo = new THREE.SphereGeometry(0.06*s, 12, 12);

    const loops = [
      { y: 1.55*s, r: 0.78*s, n: 10 },
      { y: 2.20*s, r: 0.60*s, n: 8 },
      { y: 2.80*s, r: 0.42*s, n: 6 },
    ];

    for(const L of loops){
      for(let i=0;i<L.n;i++){
        const a = (i / L.n) * Math.PI * 2 + Math.random()*0.15;
        const b = new THREE.Mesh(bulbGeo, bulbMats[(i + Math.floor(Math.random()*4)) % bulbMats.length]);
        b.position.set(Math.cos(a)*L.r, L.y + Math.sin(a*2)*0.04*s, Math.sin(a)*L.r);
        b.userData.tw = Math.random()*1.4 + 0.6;
        b.userData.ph = Math.random()*Math.PI*2;
        bulbs.add(b);
      }
    }
    g.add(bulbs);
    g.userData.bulbs = bulbs;
    g.userData.star = star;
  }

  g.rotation.y = Math.random()*Math.PI*2;
  ambience.add(g);
  return g;
}

/**
 * Papá Noel cartoon, más “humano”
 * – cabeza grande con cara completa
 * – cuerpo redondo
 * – brazo derecho saludando de forma natural
 */
function makeSanta({ x, z, s = 1.0 }) {
  const santa = new THREE.Group();
  santa.position.set(x, 0, z);
  santa.rotation.y = -0.55; // ligeramente hacia el cofre

  // ===== Materials =====
  const red      = new THREE.MeshStandardMaterial({ color: 0xc61f2f, roughness: 0.75, metalness: 0.05 });
  const redDark  = new THREE.MeshStandardMaterial({ color: 0x9b1422, roughness: 0.80, metalness: 0.05 });
  const white    = new THREE.MeshStandardMaterial({ color: 0xf6f2e9, roughness: 0.85, metalness: 0.0  });
  const skin     = new THREE.MeshStandardMaterial({ color: 0xf0c9a6, roughness: 0.90, metalness: 0.0  });
  const cheekMat = new THREE.MeshStandardMaterial({ color: 0xf7b49d, roughness: 0.95, metalness: 0.0  });
  const black    = new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.60, metalness: 0.15 });
  const goldBelt = new THREE.MeshStandardMaterial({ color: 0xffd36a, roughness: 0.35, metalness: 0.85 });

  // ===== BOTAS =====
  const bootGeo = new THREE.BoxGeometry(0.32 * s, 0.20 * s, 0.45 * s);
  const bootL = new THREE.Mesh(bootGeo, black);
  bootL.position.set(-0.22 * s, 0.10 * s, 0.10 * s);
  santa.add(bootL);

  const bootR = bootL.clone();
  bootR.position.x = 0.22 * s;
  santa.add(bootR);

  // ===== PIERNAS =====
  const legGeo = new THREE.CylinderGeometry(0.13 * s, 0.15 * s, 0.38 * s, 10);
  const legL = new THREE.Mesh(legGeo, redDark);
  legL.position.set(-0.22 * s, 0.40 * s, 0.0);
  santa.add(legL);

  const legR = legL.clone();
  legR.position.x = 0.22 * s;
  santa.add(legR);

  // ===== CUERPO =====
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.62 * s, 24, 24), red);
  belly.position.y = 0.95 * s;
  santa.add(belly);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.52 * s, 24, 24), red);
  chest.position.set(0, 1.30 * s, 0);
  santa.add(chest);

  // ===== FAJA =====
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.55 * s, 0.55 * s, 0.18 * s, 24), black);
  belt.position.set(0, 1.00 * s, 0);
  santa.add(belt);

  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.28 * s, 0.20 * s, 0.05 * s), goldBelt);
  buckle.position.set(0, 1.00 * s, 0.35 * s);
  santa.add(buckle);

  // ===== HEAD GROUP (clave para alinear gorro y cara) =====
  const headRadius = 0.38 * s;

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.80 * s, 0);
  headGroup.rotation.y = 0.12; // leve “mirada” más humana (opcional)
  santa.add(headGroup);

  const head = new THREE.Mesh(new THREE.SphereGeometry(headRadius, 28, 28), skin);
  headGroup.add(head);

  // ===== FACE GROUP (todo lo facial adelante) =====
  const faceGroup = new THREE.Group();
  faceGroup.position.set(0, 0.02 * s, headRadius * 0.82); // adelante de la cabeza
  headGroup.add(faceGroup);

  // OJOS (más grandes + un poquito más adelante)
  const eyeWhiteGeo = new THREE.SphereGeometry(0.082 * s, 16, 16);
  const eyeWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.22,
    metalness: 0.0
  });

  const irisGeo = new THREE.SphereGeometry(0.045 * s, 14, 14);
  const irisMat = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.35, metalness: 0.0 });

  const pupilGeo = new THREE.SphereGeometry(0.028 * s, 12, 12);
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.25, metalness: 0.0 });

  function makeEye(xOff) {
    const g = new THREE.Group();
    g.position.set(xOff, 0.06 * s, 0);

    const sclera = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    sclera.scale.set(1.0, 0.85, 0.90);
    g.add(sclera);

    const iris = new THREE.Mesh(irisGeo, irisMat);
    iris.position.z = 0.03 * s;
    g.add(iris);

    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    pupil.position.set(0, -0.01 * s, 0.06 * s);
    g.add(pupil);

    return g;
  }

  faceGroup.add(makeEye(-0.14 * s));
  faceGroup.add(makeEye( 0.14 * s));

  // CEJAS (curvas, más “pelito” y visibles)
  const browGeo = new THREE.TorusGeometry(0.10 * s, 0.022 * s, 10, 22, Math.PI * 0.85);
  const browMat = new THREE.MeshStandardMaterial({ color: 0xf7f3e6, roughness: 0.75, metalness: 0.0 });

  const browL = new THREE.Mesh(browGeo, browMat);
  browL.position.set(-0.14 * s, 0.15 * s, 0.02 * s);
  browL.rotation.set(Math.PI / 2, 0, Math.PI * 0.06);
  faceGroup.add(browL);

  const browR = browL.clone();
  browR.position.x = 0.14 * s;
  browR.rotation.z = -Math.PI * 0.06;
  faceGroup.add(browR);

  // NARIZ (un toque más chica y centrada)
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.088 * s, 16, 16), skin);
  nose.position.set(0, -0.02 * s, 0.12 * s);
  nose.scale.set(1.0, 0.85, 1.05);
  faceGroup.add(nose);

  // MEJILLAS (un toque abajo, para que no compitan con ojos)
  const cheekGeo = new THREE.SphereGeometry(0.065 * s, 16, 16);
  const cheekL = new THREE.Mesh(cheekGeo, cheekMat);
  cheekL.position.set(-0.20 * s, -0.06 * s, 0.06 * s);
  faceGroup.add(cheekL);

  const cheekR = cheekL.clone();
  cheekR.position.x = 0.20 * s;
  faceGroup.add(cheekR);

  // ===== BARBA (más baja y menos invasiva) =====
  const beard = new THREE.Mesh(new THREE.SphereGeometry(0.42 * s, 24, 24), white);
  beard.position.set(0, -0.26 * s, 0.10 * s);
  beard.scale.set(1.05, 0.52, 1.05);
  headGroup.add(beard);

  // BIGOTE (un poco más abajo y al frente, dejando ojos libres)
  const moustacheGeo = new THREE.SphereGeometry(0.15 * s, 16, 16);
  const moustacheL = new THREE.Mesh(moustacheGeo, white);
  moustacheL.position.set(-0.11 * s, -0.11 * s, headRadius * 0.92);
  moustacheL.scale.set(1.18, 0.60, 1.0);
  headGroup.add(moustacheL);

  const moustacheR = moustacheL.clone();
  moustacheR.position.x = 0.11 * s;
  headGroup.add(moustacheR);

  // ===== GORRO (ahora es hijo de la cabeza → nunca se desalineará) =====
  const hatGroup = new THREE.Group();
  hatGroup.position.set(0, headRadius * 0.78, -0.02 * s); // arriba de la cabeza, leve hacia atrás
  headGroup.add(hatGroup);

  // Brim “real”: cilindro finito + torus finito (y más alto para NO tapar ojos)
  const brim = new THREE.Mesh(
    new THREE.CylinderGeometry(headRadius * 1.10, headRadius * 1.08, 0.10 * s, 24),
    white
  );
  brim.position.y = 0.02 * s;
  brim.scale.y = 0.75;
  hatGroup.add(brim);

  const brimFur = new THREE.Mesh(
    new THREE.TorusGeometry(headRadius * 1.06, 0.035 * s, 10, 28),
    white
  );
  brimFur.rotation.x = Math.PI / 2;
  brimFur.position.y = 0.06 * s;
  brimFur.scale.set(1, 0.8, 1);
  hatGroup.add(brimFur);

  // Cono del gorro (apoyado y alineado)
  const hatCone = new THREE.Mesh(
    new THREE.ConeGeometry(headRadius * 0.95, 0.78 * s, 24),
    redDark
  );
  hatCone.position.set(0.06 * s, 0.42 * s, 0.00 * s);
  hatCone.rotation.z = 0.55;
  hatGroup.add(hatCone);

  const hatPom = new THREE.Mesh(new THREE.SphereGeometry(0.12 * s, 16, 16), white);
  hatPom.position.set(0.36 * s, 0.78 * s, 0.00 * s);
  hatGroup.add(hatPom);

  // ===== BRAZO IZQUIERDO (igual que el tuyo) =====
  const armLGroup = new THREE.Group();
  armLGroup.position.set(-0.55 * s, 1.35 * s, 0.05 * s);
  armLGroup.rotation.z = 0.30;
  santa.add(armLGroup);

  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.11 * s, 0.11 * s, 0.52 * s, 10), redDark);
  armL.rotation.z = Math.PI / 2;
  armL.position.x = -0.26 * s;
  armLGroup.add(armL);

  const cuffL = new THREE.Mesh(new THREE.CylinderGeometry(0.13 * s, 0.13 * s, 0.13 * s, 16), white);
  cuffL.position.x = -0.51 * s;
  armLGroup.add(cuffL);

  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.12 * s, 16, 16), white);
  handL.position.x = -0.68 * s;
  armLGroup.add(handL);

  // ===== BRAZO DERECHO (saludando) =====
  const armRGroup = new THREE.Group();
  armRGroup.position.set(0.55 * s, 1.35 * s, 0.05 * s);
  santa.add(armRGroup);

  const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.11 * s, 0.11 * s, 0.52 * s, 10), redDark);
  armR.rotation.z = Math.PI / 2;
  armR.position.x = 0.26 * s;
  armRGroup.add(armR);

  const cuffR = new THREE.Mesh(new THREE.CylinderGeometry(0.13 * s, 0.13 * s, 0.13 * s, 16), white);
  cuffR.position.x = 0.51 * s;
  armRGroup.add(cuffR);

  const handR = new THREE.Mesh(new THREE.SphereGeometry(0.12 * s, 16, 16), white);
  handR.position.x = 0.68 * s;
  armRGroup.add(handR);

  // Grupo para animación de saludo
  santa.userData.waveArm = armRGroup;

  // Extra: sombras si tu renderer/luces las tienen activas
  santa.traverse(o => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  ambience.add(santa);
  return santa;
}



// Colocación árboles y Papá Noel
const trees = [];
trees.push(makeTree({ x:-7,  z:-6,  s:1.25, lights:true }));
trees.push(makeTree({ x: 8,  z:-8,  s:1.45, lights:true }));
trees.push(makeTree({ x:-10, z:-12, s:1.70, lights:true }));
trees.push(makeTree({ x: 11, z:-14, s:1.95, lights:true }));
trees.push(makeTree({ x:-3.8, z:-3.5, s:0.95, lights:true }));
trees.push(makeTree({ x: 3.9, z:-3.9, s:1.00, lights:true }));

const santa = makeSanta({ x: 3.2, z: 1.4, s: 1.05 });

// ===== SNOW =====
const snowCount = wrap.clientWidth < 520 ? 800 : 1200;
const snowGeo = new THREE.BufferGeometry();
const snowPos = new Float32Array(snowCount * 3);
const snowVel = new Float32Array(snowCount);

for(let i=0;i<snowCount;i++){
  snowPos[i*3+0] = (Math.random()-0.5)*28;
  snowPos[i*3+1] = Math.random()*10 + 2;
  snowPos[i*3+2] = (Math.random()-0.5)*28;
  snowVel[i] = Math.random()*0.8 + 0.4;
}
snowGeo.setAttribute("position", new THREE.BufferAttribute(snowPos, 3));
const snowMat = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.05,
  transparent: true,
  opacity: 0.8,
  depthWrite: false,
});
const snowPoints = new THREE.Points(snowGeo, snowMat);
scene.add(snowPoints);

// ===== CHEST 3D MODEL =====
const chest = new THREE.Group();
scene.add(chest);
chest.position.set(0, 0.7, 0);

const wood = new THREE.MeshStandardMaterial({
  color: 0x5a3418,
  roughness: 0.85,
  metalness: 0.05
});
const woodDark = new THREE.MeshStandardMaterial({
  color: 0x3b1f10,
  roughness: 0.92,
  metalness: 0.03
});
const gold = new THREE.MeshStandardMaterial({
  color: 0xffd36a,
  roughness: 0.35,
  metalness: 0.85
});

const base = new THREE.Mesh(new THREE.BoxGeometry(3.1, 1.4, 2.1), wood);
base.position.set(0, 0, 0);
chest.add(base);

// front inset panel
const panel = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.9, 0.05), woodDark);
panel.position.set(0, 0.05, 1.05);
chest.add(panel);

// gold bands
function band(y){
  const b = new THREE.Mesh(new THREE.BoxGeometry(3.25, 0.12, 2.15), gold);
  b.position.set(0, y, 0);
  chest.add(b);
}
band(0.45);
band(-0.35);

// lock
const lockPlate = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.12), gold);
lockPlate.position.set(0, 0.15, 1.12);
chest.add(lockPlate);

const lockBody = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.16), gold);
lockBody.position.set(0, 0.05, 1.20);
chest.add(lockBody);

const lockArc = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 10, 22, Math.PI), gold);
lockArc.rotation.x = Math.PI;
lockArc.position.set(0, 0.33, 1.18);
chest.add(lockArc);

// Lid with pivot
const lidPivot = new THREE.Group();
lidPivot.position.set(0, 0.70, -1.05);
chest.add(lidPivot);

const lid = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.8, 2.2), wood);
lid.position.set(0, 0.35, 1.05);
lidPivot.add(lid);

const lidBand = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.12, 2.25), gold);
lidBand.position.set(0, 0.55, 1.05);
lidPivot.add(lidBand);

// ===== LIGHT CONE (volumetric fake) =====
const coneGeo = new THREE.ConeGeometry(1.55, 5.2, 32, 1, true);
const coneMat = new THREE.MeshBasicMaterial({
  color: 0xffd36a,
  transparent: true,
  opacity: 0.0,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide
});
const lightCone = new THREE.Mesh(coneGeo, coneMat);
lightCone.position.set(0, 2.6, 0.25);
lightCone.rotation.x = Math.PI;
scene.add(lightCone);

// bloom sprite
function makeGlowSprite(){
  const c = document.createElement("canvas");
  c.width = 256; c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(128,128,0,128,128,128);
  g.addColorStop(0, "rgba(255,211,106,0.95)");
  g.addColorStop(0.35, "rgba(255,211,106,0.22)");
  g.addColorStop(1, "rgba(255,211,106,0.0)");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,256,256);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(6.5, 6.5, 1);
  return sp;
}
const bloom = makeGlowSprite();
bloom.position.set(0, 2.25, 0.2);
scene.add(bloom);

// ===== PRIZE CARD (3D plane con canvas texture) =====
function cardTexture(prize){
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 768;
  const ctx = c.getContext("2d");

  ctx.fillStyle = "rgba(20,18,26,0.95)";
  ctx.fillRect(0,0,c.width,c.height);

  const grad = ctx.createLinearGradient(0,0,c.width,c.height);
  grad.addColorStop(0, "rgba(255,211,106,0.18)");
  grad.addColorStop(0.5, "rgba(255,255,255,0.03)");
  grad.addColorStop(1, "rgba(255,211,106,0.00)");
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,c.width,c.height);

  ctx.lineWidth = 12;
  ctx.strokeStyle = "rgba(255,211,106,0.75)";
  roundRect(ctx, 18, 18, c.width-36, c.height-36, 32);
  ctx.stroke();

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  roundRect(ctx, 36, 36, 220, 64, 32);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,211,106,0.35)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "rgba(255,239,179,0.95)";
  ctx.font = "800 26px Inter, Arial";
  ctx.textAlign = "left";
  ctx.fillText(prize.rarity, 58, 78);

  ctx.font = "140px Inter, Arial";
  ctx.textAlign = "center";
  ctx.fillText(prize.icon, c.width/2, 340);

  ctx.fillStyle = "rgba(255,239,179,0.98)";
  ctx.font = "900 54px Cinzel, serif";
  ctx.fillText(prize.label, c.width/2, 470);

  ctx.fillStyle = "rgba(246,242,233,0.82)";
  ctx.font = "600 28px Inter, Arial";
  ctx.fillText("Tocá para ver el detalle", c.width/2, 540);

  ctx.save();
  ctx.translate(c.width/2, c.height/2);
  ctx.rotate(-0.35);
  const shine = ctx.createLinearGradient(-400,0,400,0);
  shine.addColorStop(0, "rgba(255,255,255,0)");
  shine.addColorStop(0.5, "rgba(255,255,255,0.10)");
  shine.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = shine;
  ctx.fillRect(-700,-60,1400,120);
  ctx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

function roundRect(ctx, x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
}

const cardGeo = new THREE.PlaneGeometry(2.4, 3.6);
const cardMat = new THREE.MeshBasicMaterial({
  map: null,
  transparent: true,
  opacity: 0.0,
  side: THREE.DoubleSide,
  depthWrite: false
});
const card = new THREE.Mesh(cardGeo, cardMat);
card.position.set(0, 1.25, 0.4);
scene.add(card);

// Anillo aura solo para 200%, pero ahora se desvanece con la luz
const ring = new THREE.Mesh(
  new THREE.TorusGeometry(1.55, 0.08, 10, 48),
  new THREE.MeshBasicMaterial({
    color: 0xffe39a,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
ring.position.set(0, 2.15, 0.35);
ring.rotation.x = Math.PI/2;
scene.add(ring);

// ===== INTERACTION (raycast) =====
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let currentPrize = null;
let opened = false;
let anim = null;

// controla cuánta luz está activa (0–1) y si debe seguir desvaneciéndose
let lightAmount = 0;
let lightFadeActive = false;

function setPrize(prize){
  currentPrize = prize;
  const tex = cardTexture(prize);
  if(cardMat.map) cardMat.map.dispose();
  cardMat.map = tex;
  cardMat.needsUpdate = true;
}

function setOpenedVisual(prize){
  opened = true;
  lidPivot.rotation.x = -Math.PI * 0.62;

  // cofre ya abierto por premio guardado -> sin luz
  lightAmount = 0;
  lightFadeActive = false;

  coneMat.opacity = 0;
  bloom.material.opacity = 0;
  goldLight.intensity = 0;
  ring.material.opacity = 0;

  cardMat.opacity = 1.0;
  card.position.set(0, 3.05, 0.55);
  card.rotation.y = 0.12;

  hint.textContent = "🎁 Tocá la carta para ver el detalle";
}

function startOpenSequence(prize){
  opened = true;
  hint.textContent = "✨ Abriendo el cofre…";
  playSound(sounds.open);
  anim = { t0: performance.now(), phase: "shake", prize };

  // reiniciamos luz para esta apertura
  lightAmount = 0;
  lightFadeActive = false;
}

function easeOutBack(x){
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}
function easeInOut(x){
  return x < 0.5 ? 2*x*x : 1 - Math.pow(-2*x + 2, 2)/2;
}

function onPointerDown(e){
  unlockAudio();

  const rect = renderer.domElement.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  pointer.set(x, y);

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(
    [base, lid, panel, lockPlate, lockBody, lockArc, card],
    true
  );
  if(!intersects.length) return;

  const hit = intersects[0].object;

  // si toca la carta
  if(hit === card && cardMat.opacity > 0.6){
    const prize = loadPrize() || currentPrize;
    if(prize) openModal(prize);
    return;
  }

  // si ya hay premio guardado
  const stored = loadPrize();
  if(stored){
    setPrize(stored);
    setOpenedVisual(stored);
    openModal(stored);
    playSound(sounds.reveal);
    return;
  }

  // sorteo normal
  const prize = weightedPick(PRIZES);
  savePrize(prize);
  setPrize(prize);
  startOpenSequence(prize);
}
renderer.domElement.addEventListener("pointerdown", onPointerDown);

// ===== RESTORE IF PLAYED =====
const stored = loadPrize();
if(stored){
  setPrize(stored);
  setOpenedVisual(stored);
}

// ===== RESIZE =====
function onResize(){
  const w = wrap.clientWidth;
  const h = wrap.clientHeight;
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
}
window.addEventListener("resize", onResize);

// ===== LOOP =====
let last = performance.now();
function tick(now){
  const dt = Math.min(0.033, (now - last)/1000);
  last = now;

  // snow
  const pos = snowGeo.attributes.position.array;
  for(let i=0;i<snowCount;i++){
    pos[i*3+1] -= snowVel[i] * dt;
    pos[i*3+0] += Math.sin((now*0.001) + i) * 0.0006;
    if(pos[i*3+1] < 0.2){
      pos[i*3+1] = Math.random()*10 + 6;
      pos[i*3+0] = (Math.random()-0.5)*28;
      pos[i*3+2] = (Math.random()-0.5)*28;
    }
  }
  snowGeo.attributes.position.needsUpdate = true;

  // tree lights twinkle
  const t = now * 0.001;
  for(const tr of trees){
    if(tr.userData.bulbs){
      const bulbs = tr.userData.bulbs.children;
      for(let i=0;i<bulbs.length;i++){
        const b = bulbs[i];
        const s = 0.6 + 0.4 * Math.sin(t*b.userData.tw + b.userData.ph);
        b.material.emissiveIntensity = 0.6 + s;
      }
    }
    if(tr.userData.star){
      tr.userData.star.rotation.y += dt * 0.6;
    }
  }

  // Santa wave (saludo más natural)
  if(santa && santa.userData.waveArm){
    const w = -0.3 + Math.sin(t*1.6) * 0.25; // balanceo suave
    santa.userData.waveArm.rotation.z = w;
  }

  // idle breathing cuando no hay animación
  if(!anim){
    chest.rotation.y = Math.sin(now*0.0006)*0.06;
    chest.position.y = 0.7 + Math.sin(now*0.0012)*0.03;

    if(cardMat.opacity > 0.6){
      card.position.y = 3.05 + Math.sin(now*0.0022)*0.06;
      card.rotation.y = 0.12 + Math.sin(now*0.0018)*0.08;
      if(currentPrize && currentPrize.id === "200"){
        ring.rotation.z += dt * 1.2;
      }
    }
  }

  // open animation (shake → lid → card)
  if(anim){
    const ms = (now - anim.t0);

    if(anim.phase === "shake"){
      const d = Math.min(1, ms / 520);
      const s = Math.sin(d * Math.PI * 6) * (1-d);
      chest.rotation.z = s * 0.08;
      chest.rotation.y = s * 0.10;
      if(d >= 1){
        anim.phase = "lid";
        anim.t0 = now;
      }
    }
    else if(anim.phase === "lid"){
      const d = Math.min(1, ms / 700);
      const e = easeInOut(d);
      lidPivot.rotation.x = -e * Math.PI * 0.62;

      // durante apertura subimos la luz
      lightAmount = e;

      if(d >= 1){
        anim.phase = "card";
        anim.t0 = now;
        playSound(sounds.reveal);
      }
    }
    else if(anim.phase === "card"){
      const d = Math.min(1, ms / 850);
      const e = easeOutBack(d);

      cardMat.opacity = Math.min(1, d * 1.2);
      card.position.y = 1.25 + e * 1.85;
      card.position.z = 0.40 + e * 0.15;
      card.rotation.y = 0.12 + e * 0.30;

      // luz a tope mientras sale la carta
      lightAmount = 1;

      if(d >= 1){
        anim = null;
        hint.textContent = "🎁 Tocá la carta para ver el detalle";
        lightFadeActive = true; // a partir de ahora, desvanecer
      }
    }
  }

  // desvanecer la luz después de la animación
  if(lightFadeActive && !anim){
    lightAmount = Math.max(0, lightAmount - dt * 0.8); // ~1.2 s de fade
    if(lightAmount === 0){
      lightFadeActive = false;
    }
  }

  // aplicar intensidad de luz actual (0–1)
  coneMat.opacity          = 0.70 * lightAmount;
  bloom.material.opacity   = 0.35 * lightAmount;
  goldLight.intensity      = 1.40 * lightAmount;
  ring.material.opacity    = (currentPrize && currentPrize.id === "200")
                             ? 0.55 * lightAmount
                             : 0;

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// autoplay ambient if allowed
if(soundEnabled){
  sounds.ambient.play().catch(()=>{});
}
