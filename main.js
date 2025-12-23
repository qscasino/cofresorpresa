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
  { id:"100", label:"BONO 100%", rarity:"COMÚN", icon:"🎁", desc:"Mostrale este resultado a tu asesor para acreditarlo.", weight: 52, tint: 0xffd36a },
  { id:"150", label:"BONO 150%", rarity:"RARA", icon:"💎", desc:"Mostrale este resultado a tu asesor para acreditarlo.", weight: 26, tint: 0x88ddff },
  { id:"200", label:"BONO 200%", rarity:"LEGENDARIA", icon:"🏆", desc:"¡Premio máximo! Mostralo a tu asesor para acreditarlo.", weight: 12, tint: 0xffe39a },
  { id:"choice", label:"BONO A ELECCIÓN", rarity:"ÉPICA", icon:"🎯", desc:"Elegí tu bono con tu asesor. Mostrale este resultado.", weight: 7, tint: 0xc28bff },
  { id:"mystery", label:"BONO SORPRESA", rarity:"MISTERIOSA", icon:"❓", desc:"Tu asesor te dirá la sorpresa. Mostrale este resultado.", weight: 3, tint: 0xffa45a },
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
  open: new Audio("assets/sfx_open.mp3"),
  reveal: new Audio("assets/sfx_reveal.mp3"),
};

Object.values(sounds).forEach(a => {
  a.volume = 0.55;
  a.onerror = () => {}; // si no existe, no rompe
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
  bigIcon.textContent = prize.icon;
  bigTitle.textContent = prize.label;
  bigDesc.textContent = prize.desc;

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

  const steps = ["Preparando la magia…", "Cargando el cofre 3D…", "Creando tu carta…", "Listo 🎄"];
  const timer = setInterval(() => {
    p = Math.min(100, p + (Math.random() * 14 + 7));
    progressFill.style.width = `${p}%`;
    progressText.textContent = `${Math.floor(p)}%`;

    if(p < 35) progressSub.textContent = steps[0];
    else if(p < 65) progressSub.textContent = steps[1];
    else if(p < 92) progressSub.textContent = steps[2];
    else progressSub.textContent = steps[3];

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

// Simple mountains (low poly)
function addRock(x,z,s){
  const geo = new THREE.IcosahedronGeometry(s, 0);
  const mat = new THREE.MeshStandardMaterial({ color: 0x2b2f3a, roughness: 0.95 });
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, s*0.6, z);
  m.rotation.y = Math.random()*Math.PI;
  scene.add(m);
}
addRock(-7, -6, 3.0);
addRock(8, -8, 3.6);
addRock(-10, -12, 4.2);
addRock(11, -14, 4.8);

// Snow particles
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

// ===== CHEST 3D MODEL (lowpoly) =====
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
lidPivot.position.set(0, 0.70, -1.05); // hinge near back
chest.add(lidPivot);

const lid = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.8, 2.2), wood);
lid.position.set(0, 0.35, 1.05);
lidPivot.add(lid);

const lidBand = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.12, 2.25), gold);
lidBand.position.set(0, 0.55, 1.05);
lidPivot.add(lidBand);

// ===== LIGHT CONE (volumetric fake, no rectangles) =====
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
function makeGlowSprite(color=0xffd36a){
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

  // bg
  ctx.fillStyle = "rgba(20,18,26,0.95)";
  ctx.fillRect(0,0,c.width,c.height);

  // gradient overlay
  const grad = ctx.createLinearGradient(0,0,c.width,c.height);
  grad.addColorStop(0, "rgba(255,211,106,0.18)");
  grad.addColorStop(0.5, "rgba(255,255,255,0.03)");
  grad.addColorStop(1, "rgba(255,211,106,0.00)");
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,c.width,c.height);

  // border
  ctx.lineWidth = 12;
  ctx.strokeStyle = "rgba(255,211,106,0.75)";
  roundRect(ctx, 18, 18, c.width-36, c.height-36, 32);
  ctx.stroke();

  // chip
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  roundRect(ctx, 36, 36, 200, 64, 32);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,211,106,0.35)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "rgba(255,239,179,0.95)";
  ctx.font = "800 26px Inter, Arial";
  ctx.textAlign = "left";
  ctx.fillText(prize.rarity, 58, 78);

  // icon
  ctx.font = "140px Inter, Arial";
  ctx.textAlign = "center";
  ctx.fillText(prize.icon, c.width/2, 340);

  // title
  ctx.fillStyle = "rgba(255,239,179,0.98)";
  ctx.font = "900 54px Cinzel, serif";
  ctx.fillText(prize.label, c.width/2, 470);

  // sub
  ctx.fillStyle = "rgba(246,242,233,0.82)";
  ctx.font = "600 28px Inter, Arial";
  ctx.fillText("Tocá para ver el detalle", c.width/2, 540);

  // subtle shine diagonal
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
card.rotation.set(0, 0, 0);
scene.add(card);

// Legendary aura ring (solo para 200)
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
let anim = null; // {t0, phase}

function setPrize(prize){
  currentPrize = prize;
  // update card texture
  const tex = cardTexture(prize);
  if(cardMat.map) cardMat.map.dispose();
  cardMat.map = tex;
  cardMat.needsUpdate = true;

  // update modal text
  // (se setea al abrir modal)
}

function setOpenedVisual(prize){
  opened = true;
  // lid open
  lidPivot.rotation.x = -Math.PI * 0.62; // ~ -112°
  // lights on
  coneMat.opacity = 0.65;
  goldLight.intensity = 1.4;
  bloom.material.opacity = 0.35;

  // card visible
  cardMat.opacity = 1.0;
  card.position.set(0, 3.05, 0.55);
  card.rotation.y = 0.12;

  // legendary extras
  if(prize.id === "200"){
    ring.material.opacity = 0.55;
  }else{
    ring.material.opacity = 0.0;
  }

  hint.textContent = "🎁 Tocá la carta para ver el detalle";
}

function startOpenSequence(prize){
  opened = true;
  hint.textContent = "✨ Abriendo el cofre…";
  playSound(sounds.open);

  anim = {
    t0: performance.now(),
    phase: "shake",
    prize
  };
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

  const intersects = raycaster.intersectObjects([base, lid, panel, lockPlate, lockBody, lockArc, card], true);
  if(!intersects.length) return;

  const hit = intersects[0].object;

  // Click en carta abre modal
  if(hit === card && cardMat.opacity > 0.6){
    const prize = loadPrize() || currentPrize;
    if(prize) openModal(prize);
    return;
  }

  // Si ya hay premio guardado: mostrar carta + modal
  const stored = loadPrize();
  if(stored){
    setPrize(stored);
    setOpenedVisual(stored);
    openModal(stored);
    playSound(sounds.reveal);
    return;
  }

  // Elegir premio, guardar y animar
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

  // idle breathing
  if(!anim){
    chest.rotation.y = Math.sin(now*0.0006)*0.06;
    chest.position.y = 0.7 + Math.sin(now*0.0012)*0.03;

    // card float if visible
    if(cardMat.opacity > 0.6){
      card.position.y = 3.05 + Math.sin(now*0.0022)*0.06;
      card.rotation.y = 0.12 + Math.sin(now*0.0018)*0.08;
      if(currentPrize && currentPrize.id === "200"){
        ring.rotation.z += dt * 1.2;
      }
    }
  }

  // open animation
  if(anim){
    const t = (now - anim.t0);

    // phase 1: shake 0-520ms
    if(anim.phase === "shake"){
      const d = Math.min(1, t / 520);
      const s = Math.sin(d * Math.PI * 6) * (1-d);
      chest.rotation.z = s * 0.08;
      chest.rotation.y = s * 0.10;

      if(d >= 1){
        anim.phase = "lid";
        anim.t0 = now;
      }
    }

    // phase 2: open lid 0-700ms
    else if(anim.phase === "lid"){
      const d = Math.min(1, t / 700);
      const e = easeInOut(d);
      lidPivot.rotation.x = -e * Math.PI * 0.62;

      // light ramp
      coneMat.opacity = 0.0 + e * 0.70;
      bloom.material.opacity = 0.0 + e * 0.35;
      goldLight.intensity = 0.0 + e * 1.4;

      if(d >= 1){
        anim.phase = "card";
        anim.t0 = now;
        playSound(sounds.reveal);
      }
    }

    // phase 3: card pop 0-850ms
    else if(anim.phase === "card"){
      const d = Math.min(1, t / 850);
      const e = easeOutBack(d);

      cardMat.opacity = Math.min(1, d * 1.2);
      card.position.y = 1.25 + e * 1.85; // sale
      card.position.z = 0.40 + e * 0.15;
      card.rotation.y = 0.12 + e * 0.30;

      // legendary aura
      if(anim.prize.id === "200"){
        ring.material.opacity = 0.0 + d * 0.55;
        ring.rotation.z += dt * 1.6;
      }else{
        ring.material.opacity = 0.0;
      }

      if(d >= 1){
        anim = null;
        hint.textContent = "🎁 Tocá la carta para ver el detalle";
      }
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// autoplay ambient if allowed
if(soundEnabled){
  sounds.ambient.play().catch(()=>{});
}
