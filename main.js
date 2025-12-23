(() => {
  const STORAGE_KEY = "secreto_papanoel_v1";

  const preloader = document.getElementById("preloader");
  const barFill = document.getElementById("barFill");
  const barText = document.getElementById("barText");

  const snow = document.getElementById("snow");
  const chestWrap = document.getElementById("chestWrap");
  const tapHint = document.getElementById("tapHint");
  const aura = document.getElementById("aura");
  const beam = document.getElementById("beam");
  const gift = document.getElementById("gift");

  const modal = document.getElementById("modal");
  const prizeTitle = document.getElementById("prizeTitle");
  const prizeDesc = document.getElementById("prizeDesc");
  const rarityEl = document.getElementById("rarity");
  const codeEl = document.getElementById("code");
  const tagEl = document.getElementById("tag");

  const claimBtn = document.getElementById("claimBtn");
  const closeBtn = document.getElementById("closeBtn");

  const soundBtn = document.getElementById("soundBtn");

  // ---------- Simple audio (beep) + optional bg music ----------
  let soundEnabled = true;

  const beep = (freq = 520, dur = 0.07, type = "triangle", vol = 0.03) => {
    if (!soundEnabled) return;
    try {
      const ctx = beep.ctx || (beep.ctx = new (window.AudioContext || window.webkitAudioContext)());
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = vol;
      o.connect(g); g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + dur);
    } catch {}
  };

  // Optional: si agregás ./assets/bg-music.mp3
  const bgMusic = new Audio("./assets/bg-music.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.25;
  bgMusic.onerror = () => {}; // si no existe, no rompe

  const tryStartMusic = () => {
    if (!soundEnabled) return;
    bgMusic.play().catch(() => {});
  };

  soundBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundBtn.textContent = soundEnabled ? "🔊" : "🔇";
    if (soundEnabled) tryStartMusic();
    else bgMusic.pause();
    beep(soundEnabled ? 880 : 220, 0.06, "square", 0.02);
  });

  // ---------- Snow particles ----------
  function spawnSnowflake() {
    const s = document.createElement("div");
    s.className = "snowflake";
    s.textContent = Math.random() > 0.15 ? "❄" : "✦";
    s.style.left = (Math.random() * 100) + "vw";
    s.style.fontSize = (Math.random() * 10 + 10) + "px";
    s.style.opacity = (Math.random() * 0.55 + 0.25).toFixed(2);
    s.style.setProperty("--drift", `${(Math.random() * 80 - 40).toFixed(0)}px`);
    s.style.animationDuration = (Math.random() * 4 + 6).toFixed(2) + "s";

    snow.appendChild(s);
    s.addEventListener("animationend", () => s.remove());
  }

  function snowLoop() {
    const isMobile = window.innerWidth < 768;
    const max = isMobile ? 10 : 16;
    let active = 0;

    const tick = () => {
      if (active < max) {
        spawnSnowflake();
        active++;
      }
      // release count gradually
      setTimeout(() => { active = Math.max(0, active - 1); }, 900);
      setTimeout(tick, 220);
    };
    tick();
  }

  // ---------- Prize logic ----------
  const PRIZES = [
    { key: "BONO_100", label: "Bono del 100%", rarity: "Común", weight: 40, code: "NOEL-100" },
    { key: "BONO_150", label: "Bono del 150%", rarity: "Rara", weight: 28, code: "NOEL-150" },
    { key: "BONO_200", label: "Bono del 200%", rarity: "Legendaria", weight: 14, code: "NOEL-200" },
    { key: "BONO_ELECCION", label: "Bono a elección", rarity: "Épica", weight: 10, code: "NOEL-ELEG" },
    { key: "BONO_SORPRESA", label: "Bono sorpresa", rarity: "Misteriosa", weight: 8, code: "NOEL-SORP" },
  ];

  function pickPrize() {
    const total = PRIZES.reduce((a, p) => a + p.weight, 0);
    let r = Math.random() * total;
    for (const p of PRIZES) {
      r -= p.weight;
      if (r <= 0) return p;
    }
    return PRIZES[0];
  }

  function saveResult(result) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      played: true,
      result,
      ts: Date.now()
    }));
  }

  function loadResult() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); }
    catch { return null; }
  }

  // ---------- Effects ----------
  function enableMagicLight() {
    aura.style.opacity = "1";
    aura.style.transform = "scale(1)";
    beam.style.opacity = "1";
    beam.style.transform = "translateY(0) scale(1)";
  }

  function disableMagicLight() {
    aura.style.opacity = "0";
    aura.style.transform = "scale(.92)";
    beam.style.opacity = "0";
    beam.style.transform = "translateY(14px) scale(.96)";
  }

  function showGift() {
    gift.classList.add("show");
  }

  function hideGift() {
    gift.classList.remove("show");
  }

  function openModal(prize) {
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    const isLegend = prize.key === "BONO_200";
    tagEl.textContent = isLegend ? "👑 Legendaria" : "🎁 Resultado";
    prizeTitle.textContent = isLegend ? "¡Premio Máximo!" : "¡Premio desbloqueado!";
    prizeDesc.textContent = prize.label;

    rarityEl.textContent = prize.rarity;
    codeEl.textContent = prize.code;

    // mini sparkle audio
    beep(isLegend ? 880 : 640, 0.09, "square", 0.03);
    setTimeout(() => beep(isLegend ? 740 : 520, 0.08, "triangle", 0.02), 90);
  }

  function closeModal() {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  }

  // ---------- Gameplay ----------
  let busy = false;
  let opened = false;

  function playSequence(prize) {
    busy = true;

    // opening
    chestWrap.classList.add("opening");
    tapHint.style.opacity = "0";
    beep(420, 0.08, "sawtooth", 0.02);

    setTimeout(() => {
      chestWrap.classList.remove("opening");
      chestWrap.classList.add("opened");
      enableMagicLight();
      beep(520, 0.07, "triangle", 0.02);
    }, 520);

    // show gift
    setTimeout(() => {
      showGift();
      beep(660, 0.07, "triangle", 0.02);
    }, 980);

    // modal
    setTimeout(() => {
      openModal(prize);
      busy = false;
      opened = true;
    }, 1500);
  }

  function startGame() {
    const saved = loadResult();
    if (saved?.played && saved?.result) {
      // ya jugó: mostrar resultado directo
      chestWrap.classList.add("opened");
      enableMagicLight();
      showGift();
      opened = true;
      setTimeout(() => openModal(saved.result), 450);
      return;
    }

    // new run
    chestWrap.addEventListener("click", onOpen);
    chestWrap.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") onOpen();
    });
  }

  function onOpen() {
    if (busy || opened) return;

    // iniciar música al primer gesto (mobile policy)
    tryStartMusic();

    const prize = pickPrize();
    saveResult(prize);
    playSequence(prize);
  }

  // Claim
  claimBtn.addEventListener("click", () => {
    // acá podés poner tu integración real (WhatsApp / link / etc.)
    // ejemplo: window.location.href = "https://wa.me/...";
    beep(880, 0.09, "square", 0.03);
    closeModal();
  });

  closeBtn.addEventListener("click", () => {
    beep(360, 0.06, "triangle", 0.02);
    closeModal();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // ---------- Preloader ----------
  function runPreloader() {
    let p = 0;
    const i = setInterval(() => {
      p += Math.random() * 12 + 6;
      if (p >= 100) {
        p = 100;
        clearInterval(i);
        setTimeout(() => {
          preloader.classList.add("hidden");
          snowLoop();
          startGame();
        }, 400);
      }
      barFill.style.width = p + "%";
      barText.textContent = Math.floor(p) + "%";
    }, 120);
  }

  // Start
  disableMagicLight();
  hideGift();
  runPreloader();
})();

