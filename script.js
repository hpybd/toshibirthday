// =========================
// PERSONALIZE HERE
// =========================
const HER_NAME = "Toshiiii";
const YOUR_NAME = "The Annoying Presence";

// Final conclusion page personalization
const LTCA_HER_NAME = "Madam Mystery";
const LTCA_YOUR_NAME = "The Annoying Presence";
const LTCA_TYPE_LINE = "You’re vibrant on the outside… and honestly, that’s your superpower.";

// =========================
// Helpers
// =========================
const $ = (sel) => document.querySelector(sel);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const screens = ["invite", "letter", "affirm", "final"].map(id => $(`#screen-${id}`));
function showScreen(id){
  screens.forEach(s => s.classList.remove("active"));
  $(`#screen-${id}`).classList.add("active");
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
}

// Set name in invite
$("#herName").textContent = HER_NAME;

// =========================
// State
// =========================
const state = {
  mood: null,
  tone: null,
  letterStep: 0
};

// =========================
// Sparkle pop (tiny, harmless)
// =========================
function sparkleAt(x, y){
  const el = document.createElement("div");
  el.textContent = "✨";
  el.style.position = "fixed";
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.transform = "translate(-50%, -50%)";
  el.style.fontSize = "18px";
  el.style.zIndex = "999";
  el.style.pointerEvents = "none";
  el.style.opacity = "0";
  el.style.transition = "opacity .15s ease, transform .4s ease";
  document.body.appendChild(el);

  requestAnimationFrame(() => {
    el.style.opacity = "1";
    el.style.transform = "translate(-50%, -50%) translateY(-18px) scale(1.1)";
  });

  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translate(-50%, -50%) translateY(-28px) scale(.95)";
  }, 220);

  setTimeout(() => el.remove(), 650);
}

document.addEventListener("click", (e) => {
  const t = e.target;
  if (t && t.classList && t.classList.contains("sparkle") && !prefersReducedMotion){
    sparkleAt(e.clientX, e.clientY);
  }
});

// =========================
// Screen 1: Invitation
// =========================
document.querySelectorAll("[data-mood]").forEach(btn => {
  btn.addEventListener("click", () => {
    state.mood = btn.dataset.mood;

    $("#statusChip").textContent =
      state.mood === "calm"
        ? "Chaos Appreciation Society — Certified Vibing"
        : "Chaos Appreciation Society — Certified Pretending";

    state.letterStep = 0;
    $("#letterNextBtn").disabled = true;

    renderLetterStep();
    showScreen("letter");
  });
});

// Restart buttons
$("#restartBtn").addEventListener("click", resetAll);
$("#endRestartBtn").addEventListener("click", resetAll);

function resetAll(){
  state.mood = null;
  state.tone = null;
  state.letterStep = 0;

  $("#statusChip").textContent = "Chaos Appreciation Society — Invitation Only";
  $("#letterBlock").innerHTML = "";
  $("#affirmText").textContent = "“You don’t need to be louder to be unforgettable.”";

  closeLTCAModalIfOpen();
  showScreen("invite");
}

// =========================
// Screen 2: Choice-based letter (new tone)
// =========================
const letterSteps = [
  {
    kind: "text",
    getText: (mood) => {
      if (mood === "overwhelmed") {
        return [
          `Okay listen, ${HER_NAME} —`,
          `If today feels like a lot, that’s allowed. You’re not required to “be fine” just because it’s your birthday.`,
          `Also: born on February 28? Elite. End-of-month main character energy.`
        ];
      }
      return [
        `Okay listen, ${HER_NAME} —`,
        `It’s February 28, which is basically the universe’s way of saying: “save the best for last.”`,
        `You walk around like you’re unbothered. That act is strong. I respect the craft.`
      ];
    }
  },

  {
    kind: "choice",
    prompt: "Choose your flavor:",
    options: [
      { key: "roast", label: "Roast me a little" },
      { key: "sweet", label: "Be sweet (just this once)" }
    ],
    getBranchText: (choice, mood) => {
      if (choice === "roast") {
        return mood === "overwhelmed"
          ? `Fine. Roast mode: you’re the type to say “I’m okay” while your soul is holding 47 tabs open. Close a few.`
          : `Roast mode: you act like you don’t care… but if someone forgets you exist, you’ll remember it forever. (Relatable.)`;
      }
      return mood === "overwhelmed"
        ? `Sweet mode: you don’t need to carry everything quietly. You deserve people who notice the small shifts too.`
        : `Sweet mode: your energy makes life fun — but your heart is the part that makes you unforgettable.`;
    }
  },

  {
    kind: "text",
    getText: (mood) => [
      `You’re funny. You’re loud. You’re chaotic in the best way.`,
      `And under all that? You’re surprisingly thoughtful. You just don’t advertise it.`,
      mood === "overwhelmed"
        ? `If you’re tired today, let the day be soft. Not every moment needs a performance.`
        : `If you’re happy today, enjoy it properly. If you’re not, you don’t have to fake it for anybody.`
    ]
  },

  {
    kind: "choice",
    prompt: "Pick one:",
    options: [
      { key: "hype", label: "Hype me up" },
      { key: "real", label: "Say the real thing" }
    ],
    getBranchText: (choice, mood) => {
      if (choice === "hype") {
        return `Hype mode: you’re the type of person who makes a room lighter. Like… inconveniently powerful vibes.`;
      }
      return mood === "overwhelmed"
        ? `Real thing: you care deeply, even when you pretend you don’t. That’s not weakness — it’s courage with a good disguise.`
        : `Real thing: you don’t need to “earn” being seen. The right people notice you even when you’re quiet.`;
    }
  },

  {
    kind: "text",
    getText: () => [
      `So yes — welcome to the Chaos Appreciation Society.`,
      `You’ve been a member since February 28.`,
      `And if you ever forget how loved you are, come back to this page. It will still be here.`
    ]
  }
];

function renderLetterStep(){
  const container = $("#letterBlock");
  container.innerHTML = "";

  for (let i = 0; i <= state.letterStep; i++){
    const step = letterSteps[i];
    if (!step) break;

    if (step.kind === "text"){
      step.getText(state.mood).forEach(line => {
        const p = document.createElement("p");
        p.textContent = line;
        container.appendChild(p);
      });
    }

    if (step.kind === "choice"){
      const box = document.createElement("div");
      box.className = "choice-row";

      const label = document.createElement("p");
      label.className = "hint";
      label.style.margin = "0 0 10px";
      label.textContent = step.prompt;
      box.appendChild(label);

      const row = document.createElement("div");
      row.className = "choices";

      step.options.forEach(opt => {
        const b = document.createElement("button");
        b.className = "btn primary sparkle";
        b.textContent = opt.label;

        b.addEventListener("click", () => {
          if (box.dataset.chosen) return;
          box.dataset.chosen = "true";
          state.tone = opt.key;

          const branch = document.createElement("p");
          branch.style.marginTop = "10px";
          branch.textContent = step.getBranchText(opt.key, state.mood);
          box.appendChild(branch);

          $("#letterNextBtn").disabled = false;
        });

        row.appendChild(b);
      });

      box.appendChild(row);
      container.appendChild(box);

      $("#letterNextBtn").disabled = true;
    }
  }

  const atEnd = state.letterStep >= letterSteps.length - 1;
  $("#letterNextBtn").textContent = atEnd ? "Go to compliments" : "Continue";

  const current = letterSteps[state.letterStep];
  if (current && current.kind === "text") $("#letterNextBtn").disabled = false;
  if (current && current.kind === "choice") $("#letterNextBtn").disabled = true;
}

$("#letterNextBtn").addEventListener("click", () => {
  if (state.letterStep >= letterSteps.length - 1){
    $("#statusChip").textContent = "Chaos Appreciation Society — Emergency compliments";
    showScreen("affirm");
    return;
  }
  state.letterStep += 1;
  renderLetterStep();
});

$("#skipToAffirmationsBtn").addEventListener("click", () => {
  $("#statusChip").textContent = "Chaos Appreciation Society — Emergency compliments";
  showScreen("affirm");
});

// =========================
// Screen 3: Affirmation Engine (new tone)
// =========================
const affirmations = [
  `${HER_NAME}, you pretend you’re unbothered. Oscar-worthy.`,
  `Your loud is fun. Your quiet is precious. Both are you.`,
  `You act like attention is annoying… but you deserve the right kind.`,
  `You don’t need to perform to be seen. But when you do? Legendary.`,
  `Even when you say “I don’t care,” your heart says “I do.” I heard it.`,
  `You deserve people who notice the small shifts, not just the big laughs.`,
  `Your energy is a party. Your heart is the home.`,
  `You’re not “too much.” You’re just more alive than most.`,
  `You care deeply — you’re just picky about who gets to see it. Respect.`,
  `February 28 energy: last day vibes. Main character, quietly.`
];

let lastAffirmIndex = -1;
function nextAffirmation(){
  let idx = Math.floor(Math.random() * affirmations.length);
  if (idx === lastAffirmIndex) idx = (idx + 1) % affirmations.length;
  lastAffirmIndex = idx;
  return affirmations[idx];
}

$("#affirmBtn").addEventListener("click", () => {
  $("#affirmText").textContent = `“${nextAffirmation()}”`;
});

$("#toFinalBtn").addEventListener("click", () => {
  $("#statusChip").textContent = "Chaos Appreciation Society — Final page";
  showScreen("final");
  initLTCAConclusion(); // safe to re-run
});

// =========================
// Music Toggle (shared)
// =========================
const music = $("#bgMusic");
const musicBtn = $("#musicBtn");
const musicState = $("#musicState");
let playing = false;

musicBtn.addEventListener("click", async () => {
  try{
    if (!playing){
      await music.play();
      playing = true;
      musicBtn.setAttribute("aria-pressed", "true");
      musicState.textContent = "(on)";
    } else {
      music.pause();
      playing = false;
      musicBtn.setAttribute("aria-pressed", "false");
      musicState.textContent = "(off)";
    }
  } catch (e){
    musicState.textContent = "(unavailable)";
    console.warn("Music could not play. Put song.mp3 next to index.html.", e);
  }
});

// =========================
// Final Conclusion: LTCA wiring
// =========================
let ltcaInitialized = false;

function initLTCAConclusion(){
  const her = document.getElementById("ltcaHerName");
  const you = document.getElementById("ltcaYourName");
  const dateEl = document.getElementById("ltcaTodayDate");
  const typedEl = document.getElementById("ltcaTypedLine");

  if (!her || !you || !dateEl || !typedEl) return;

  her.textContent = LTCA_HER_NAME;
  you.textContent = LTCA_YOUR_NAME;

  dateEl.textContent = "February 28, 2026"

  typewriter(typedEl, LTCA_TYPE_LINE, 28);

  if (ltcaInitialized) return;
  ltcaInitialized = true;

  // Reveal
  const revealEls = document.querySelectorAll("#screen-final .reveal");
  if (!prefersReducedMotion && "IntersectionObserver" in window){
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("show");
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("show"));
    typedEl.style.borderLeft = "none";
  }

  // Modal
  const modalBackdrop = document.getElementById("ltcaModalBackdrop");
  const openBtn = document.getElementById("ltcaSurpriseBtn");
  const closeBtn = document.getElementById("ltcaCloseModalBtn");

  function openModal(){
    modalBackdrop.style.display = "flex";
    closeBtn.focus();
  }
  function closeModal(){
    modalBackdrop.style.display = "none";
    openBtn.focus();
  }

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalBackdrop.style.display === "flex") closeModal();
  });
}

function closeLTCAModalIfOpen(){
  const modalBackdrop = document.getElementById("ltcaModalBackdrop");
  if (modalBackdrop) modalBackdrop.style.display = "none";
}

function typewriter(el, text, speed=34){
  if (!el) return;
  if (prefersReducedMotion){
    el.textContent = text;
    el.style.borderLeft = "none";
    return;
  }
  el.textContent = "";
  let i = 0;
  const timer = setInterval(() => {
    el.textContent += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(timer);
  }, speed);
}

// Initialize letter on load (safe)
renderLetterStep();


