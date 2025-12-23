// =====================
// El Secreto de Papá Noel — Chest + Card
// Listo para GitHub Pages (rutas relativas)
// =====================

const $ = (q) => document.querySelector(q);

const preloader = $("#preloader");
const progressFill = $("#progressFill");
const progressText = $("#progressText");
const progressSub = $("#progressSub");

const soundBtn = $("#soundBtn");
const screen = $("#screen");

const chestBtn = $("#chestBtn");
const chestWrap = $("#chestWrap");
const instruction = $("#instruction");

const cardPop = $("#cardPop");
const prizeCard = $("#prizeCard");
const rarityChip = $("#rarityChip");
const prizeIcon = $("#prizeIcon");
const prizeTitle = $("#prizeTitle");
const prizeSub = $("#prizeSub");

const modal = $("#modal");
const modalClose = $("#modalClose");
const claimBtn = $("#claimBtn");
const copyBtn = $("#copyBtn");
const tinyMsg = $("#tinyMsg");

const bigCard = $("#bigCard");
const bigRarity = $("#bigRarity");
const bigIcon = $("#bigIcon");
const bigTitle = $("#bigTitle");
const bigDesc = $("#bigDesc");

const snow = $("#snow");

// ===== LocalStorage =====
const STORAGE_KEY = "santa_noel_prize_v1";

// ===== Prizes =====
const PRIZES = [
  { id:"100", label:"BONO 100%", rarity:"COMÚN", icon:"🎁", desc:"Mostrale este resultado a tu asesor para acreditarlo.", css:"common", weight: 52 },
  { id:"150", label:"BONO 150%", rarity:"RARA", icon:"💎", desc:"Mostrale este resultado a tu asesor para acreditarlo.", css:"rare", weight: 26 },
  { id:"200", label:"BONO 200%", rarity:"LEGENDARIA", icon:"🏆", desc:"¡Premio máximo! Mostralo a tu asesor para acreditarlo.", css:"legendary", weight: 12 },
  { id:"choice", label:"BONO A ELECCIÓN", rarity:"ÉPICA", icon:"🎯", desc:"Elegí tu bono con tu asesor. Mostrale este resultado.", css:"epic", weight: 7 },
  { id:"mystery", label:"BONO SORPRESA", rarity:"MISTERIOSA", icon:"❓", desc:"Tu asesor te dirá qué sorpresa te tocó. Mostrale este resultado.", css:"mystery", weight: 3 },
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

// ===== Audio (opcional) =====
let soundEnabled = true;
let audioUnlocked = false;

const sounds = {
  ambient: new Audio("assets/ambient.mp3"),
  open: new Audio("assets/sfx_open.mp3"),
  reveal: new Audio("assets/sfx_reveal.mp3"),
};

Object.values(sounds).forEach(a => {
  a.volume = 0.55;
  a.onerror = () => {}; // si no existe el archivo, no rompe
});
sounds.ambient.loop = true;
sounds.ambient.volume = 0.28;

function tryPlay(audio){
  if(!soundEnabled || !audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function unlockAudio(){
  if(audioUnlocked) return;
  audioUnlocked = true;
  if(soundEnabled) sounds.ambient.play().catch(()=>{});
}

// Toggle sound
soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundBtn.textContent = soundEnabled ? "🔊" : "🔇";
  soundBtn.classList.toggle("muted", !soundEnabled);

  if(soundEnabled){
    unlockAudio();
    sounds.ambient.play().catch(()=>{});
  } else {
    sounds.ambient.pause();
  }
});

// Primer interacción desbloquea audio en móviles
window.addEventListener("pointerdown", unlockAudio, { once:true });

// ===== Preloader =====
async function runPreloader(){
  const minTime = 900; // para que se sienta pro
  const start = performance.now();

  const steps = [
    "Encendiendo la magia…",
    "Cargando brillo dorado…",
    "Preparando el regalo…",
    "Listo 🎄"
  ];

  let p = 0;
  const timer = setInterval(() => {
    p = Math.min(100, p + (Math.random() * 14 + 7));
    progressFill.style.width = `${p}%`;
    progressText.textContent = `${Math.floor(p)}%`;
    progressFill.parentElement?.parentElement?.setAttribute("aria-valuenow", String(Math.floor(p)));

    if(p < 35) progressSub.textContent = steps[0];
    else if(p < 65) progressSub.textContent = steps[1];
    else if(p < 92) progressSub.textContent = steps[2];
    else progressSub.textContent = steps[3];

    if(p >= 100){
      clearInterval(timer);
    }
  }, 120);

  // esperar mínimo
  while(performance.now() - start < minTime){
    await new Promise(r => setTimeout(r, 60));
  }

  // asegurar 100
  progressFill.style.width = "100%";
  progressText.textContent = "100%";
  progressSub.textContent = "Listo 🎄";

  await new Promise(r => setTimeout(r, 260));
  preloader.classList.add("hidden");
  startSnow();
  restoreIfPlayed();
}
runPreloader();

// ===== Snow =====
function startSnow(){
  const max = window.innerWidth < 700 ? 10 : 16;
  function spawn(){
    const f = document.createElement("div");
    f.className = "flake";
    f.textContent = Math.random() > 0.65 ? "❄" : "✦";
    f.style.left = `${Math.random() * 100}vw`;
    f.style.fontSize = `${Math.random() * 10 + 10}px`;
    f.style.opacity = String(Math.random() * 0.45 + 0.25);
    f.style.animationDuration = `${Math.random() * 5 + 7}s`;
    f.style.transform = `translateY(-12px) rotate(${Math.random()*180}deg)`;
    snow.appendChild(f);

    f.addEventListener("animationend", () => f.remove());
  }

  let alive = 0;
  setInterval(() => {
    if(alive < max){
      spawn();
      alive++;
      setTimeout(() => alive--, 400); // control suave
    }
  }, 260);
}

// ===== Prize render =====
function applyPrizeToCard(prize){
  // reset clases
  chestWrap.classList.remove("prize-common","prize-rare","prize-epic","prize-legendary","prize-mystery");
  chestWrap.classList.add(`prize-${prize.css}`);

  rarityChip.textContent = prize.rarity;
  prizeIcon.textContent = prize.icon;
  prizeTitle.textContent = prize.label;
  prizeSub.textContent = "Tocá la carta para ver el detalle";

  // Big modal
  bigCard.classList.remove("big-common","big-rare","big-epic","big-legendary","big-mystery");
  bigCard.classList.add(`big-${prize.css}`);

  bigRarity.textContent = prize.rarity;
  bigIcon.textContent = prize.icon;
  bigTitle.textContent = prize.label;
  bigDesc.textContent = prize.desc;
}

function openModal(){
  modal.classList.add("active");
  modal.setAttribute("aria-hidden","false");
}
function closeModal(){
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden","true");
  tinyMsg.textContent = "";
}

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if(e.target === modal) closeModal();
});

// ===== Chest logic =====
let busy = false;

function setOpenedVisual(){
  chestWrap.classList.add("opened");
  chestWrap.classList.add("show-card");
  instruction.classList.add("hidden");
  cardPop.setAttribute("aria-hidden", "false");
}

function setOpeningVisual(){
  chestWrap.classList.add("opening");
  setTimeout(() => chestWrap.classList.remove("opening"), 650);
}

function savePrize(prize){
  const payload = { id: prize.id, ts: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadPrize(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return null;
  try{
    const parsed = JSON.parse(raw);
    const prize = PRIZES.find(p => p.id === parsed.id);
    return prize ? { prize, meta: parsed } : null;
  }catch{
    return null;
  }
}

function restoreIfPlayed(){
  // Reset rápido para test: ?reset=1
  const params = new URLSearchParams(location.search);
  if(params.get("reset") === "1"){
    localStorage.removeItem(STORAGE_KEY);
  }

  const stored = loadPrize();
  if(!stored) return;

  applyPrizeToCard(stored.prize);
  setOpenedVisual();
  // deja el cofre ya abierto sin animación molesta
}

// Click cofre
chestBtn.addEventListener("click", () => {
  if(busy) return;

  // Si ya hay premio guardado, solo mostrar modal
  const stored = loadPrize();
  if(stored){
    applyPrizeToCard(stored.prize);
    setOpenedVisual();
    openModal();
    return;
  }

  busy = true;

  // Elegir premio y guardar
  const prize = weightedPick(PRIZES);
  savePrize(prize);
  applyPrizeToCard(prize);

  // Animación: shake + abrir + luz + carta
  setOpeningVisual();
  tryPlay(sounds.open);

  setTimeout(() => {
    chestWrap.classList.add("opened");
  }, 620);

  setTimeout(() => {
    chestWrap.classList.add("show-card");
    instruction.classList.add("hidden");
    cardPop.setAttribute("aria-hidden", "false");
    tryPlay(sounds.reveal);
    busy = false;
  }, 980);
});

// Tap en carta abre modal
prizeCard.addEventListener("click", (e) => {
  e.stopPropagation();
  openModal();
});

// Botones modal
claimBtn.addEventListener("click", () => {
  tinyMsg.textContent = "✅ Listo. Mostrale esta pantalla a tu asesor para acreditarlo.";
});

copyBtn.addEventListener("click", async () => {
  const stored = loadPrize();
  if(!stored) return;

  const text = `🎁 El Secreto de Papá Noel — Premio: ${stored.prize.label} (${stored.prize.rarity})`;
  try{
    await navigator.clipboard.writeText(text);
    tinyMsg.textContent = "📋 Copiado. Pegalo en WhatsApp.";
  }catch{
    tinyMsg.textContent = "No se pudo copiar (tu navegador lo bloqueó).";
  }
});
