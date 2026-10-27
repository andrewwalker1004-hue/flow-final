/* =========================================================
   FLOW — charity: water inspired puzzle game
   script.js — game data, state, logic, and rendering (Final polish pass)
   ========================================================= */

(function () {
  "use strict";

  /* =========================================================
     1. GAME DATA
     ========================================================= */

  const STORAGE_KEY = "flowGameSave_v1";

  const TOWNS = [
    { id: 1, name: "The Beginning", impactText: "You helped bring water to approximately 120 households in this simulated community." },
    { id: 2, name: "Growing Community", impactText: "You helped bring water to approximately 180 households in this simulated community." },
    { id: 3, name: "The Water Challenge", impactText: "You helped bring water to approximately 150 households in this simulated community, even under difficult supply shortages." },
  ];

  const ZONE_META = {
    hospital: { name: "Hospital", icon: "🏥" },
    homes: { name: "Homes", icon: "🏠" },
    school: { name: "School", icon: "🏫" },
    factory: { name: "Factory", icon: "🏭" },
  };

  const EDU_FACTS = [
    "771 million people worldwide lack access to basic clean drinking water close to home.",
    "Every $1 invested in clean water can yield up to $4 in economic returns through better health and productivity.",
    "Women and girls spend an estimated 200 million hours every day collecting water worldwide — time that could go to school or work.",
    "Access to clean water and basic sanitation can dramatically reduce the spread of preventable diseases in a community.",
    "Reliable water infrastructure allows schools to stay open and reduces student absences caused by illness.",
    "Clean water near a health clinic allows staff to maintain hygiene standards and treat more patients safely.",
    "Community-maintained wells and pipelines help ensure water systems keep working for years, not just months.",
    "When water sources are closer to home, children — especially girls — are more likely to stay in school.",
    "Sanitation infrastructure and clean water access often go hand-in-hand in improving public health outcomes.",
    "Local ownership and maintenance training help water projects remain functional for the long term.",
  ];

  function fact(i) {
    return EDU_FACTS[i % EDU_FACTS.length];
  }

  function makePuzzle(id, town, number, startingSupply, leakage, zoneDemands, factIndex) {
    const zones = Object.keys(zoneDemands).map((key) => ({
      key,
      name: ZONE_META[key].name,
      icon: ZONE_META[key].icon,
      demand: zoneDemands[key].demand,
      critical: !!zoneDemands[key].critical,
    }));
    return {
      id, town, number, startingSupply, leakage,
      usableSupply: startingSupply - leakage,
      zones,
      fact: fact(factIndex),
    };
  }

  const PUZZLES = [
    makePuzzle("t1p1", 1, 1, 1200, 0, { hospital: { demand: 500 }, homes: { demand: 300 }, school: { demand: 250 }, factory: { demand: 150 } }, 0),
    makePuzzle("t1p2", 1, 2, 1300, 0, { hospital: { demand: 450 }, homes: { demand: 350 }, school: { demand: 300 }, factory: { demand: 200 } }, 1),
    makePuzzle("t1p3", 1, 3, 1400, 0, { hospital: { demand: 400 }, homes: { demand: 400 }, school: { demand: 350 }, factory: { demand: 250 } }, 2),
    makePuzzle("t1p4", 1, 4, 1550, 0, { hospital: { demand: 500 }, homes: { demand: 400 }, school: { demand: 350 }, factory: { demand: 300 } }, 3),
    makePuzzle("t1p5", 1, 5, 1500, 0, { hospital: { demand: 550 }, homes: { demand: 450 }, school: { demand: 400 }, factory: { demand: 350 } }, 4),

    makePuzzle("t2p1", 2, 1, 1850, 0, { hospital: { demand: 600 }, homes: { demand: 500 }, school: { demand: 400 }, factory: { demand: 350 } }, 5),
    makePuzzle("t2p2", 2, 2, 1700, 150, { hospital: { demand: 600 }, homes: { demand: 450 }, school: { demand: 350 }, factory: { demand: 300 } }, 6),
    makePuzzle("t2p3", 2, 3, 1600, 0, { hospital: { demand: 650 }, homes: { demand: 500 }, school: { demand: 400 }, factory: { demand: 350 } }, 7),
    makePuzzle("t2p4", 2, 4, 2000, 200, { hospital: { demand: 700 }, homes: { demand: 550 }, school: { demand: 450 }, factory: { demand: 400 } }, 8),
    makePuzzle("t2p5", 2, 5, 2200, 300, { hospital: { demand: 750 }, homes: { demand: 600 }, school: { demand: 500 }, factory: { demand: 450 } }, 9),

    makePuzzle("t3p1", 3, 1, 2100, 0, { hospital: { demand: 700, critical: true }, homes: { demand: 550 }, school: { demand: 450 }, factory: { demand: 400 } }, 0),
    makePuzzle("t3p2", 3, 2, 1900, 0, { hospital: { demand: 750, critical: true }, homes: { demand: 600 }, school: { demand: 500 }, factory: { demand: 450 } }, 1),
    makePuzzle("t3p3", 3, 3, 1700, 0, { hospital: { demand: 800, critical: true }, homes: { demand: 650 }, school: { demand: 550 }, factory: { demand: 500 } }, 2),
    makePuzzle("t3p4", 3, 4, 2200, 250, { hospital: { demand: 850, critical: true }, homes: { demand: 700 }, school: { demand: 600 }, factory: { demand: 550 } }, 3),
    makePuzzle("t3p5", 3, 5, 2500, 400, { hospital: { demand: 950, critical: true }, homes: { demand: 800 }, school: { demand: 650 }, factory: { demand: 600 } }, 4),
  ];

  const PUZZLES_PER_TOWN = 5;

  function getPuzzleIndex(id) { return PUZZLES.findIndex((p) => p.id === id); }
  function getPuzzleById(id) { return PUZZLES.find((p) => p.id === id); }
  function getTownPuzzles(townId) { return PUZZLES.filter((p) => p.town === townId); }
  function getTownMeta(townId) { return TOWNS.find((t) => t.id === townId); }

  const ACHIEVEMENT_DEFS = [
    { id: "first_drop", icon: "💧", name: "First Drop", desc: "Complete your first puzzle." },
    { id: "perfect_flow", icon: "🌟", name: "Perfect Flow", desc: "Reach 100% efficiency on a puzzle." },
    { id: "water_hero", icon: "🏆", name: "Water Hero", desc: "Complete an entire town." },
    { id: "resource_master", icon: "🧩", name: "Resource Master", desc: "Clear a water-shortage puzzle." },
  ];

  // ---- Difficulty modes ----
  const DIFFICULTIES = {
    easy: {
      id: "easy", name: "Easy", icon: "🌤️", supplyMultiplier: 1.2, waiveLeakage: true, timerSeconds: null,
      desc: "More breathing room while you learn the ropes.",
      rules: ["+20% usable water supply", "Pipe leakage is waived", "No countdown timer"],
    },
    normal: {
      id: "normal", name: "Normal", icon: "⚖️", supplyMultiplier: 1.0, waiveLeakage: false, timerSeconds: null,
      desc: "The standard Flow experience, exactly as designed.",
      rules: ["Standard usable water supply", "Leakage applies as designed", "No countdown timer"],
    },
    hard: {
      id: "hard", name: "Hard", icon: "🔥", supplyMultiplier: 0.9, waiveLeakage: false, timerSeconds: 90, warningSeconds: 20,
      desc: "Less water, real pressure, and a ticking clock.",
      rules: ["-10% usable water supply (on top of leakage)", "Full leakage applies", "90-second countdown — auto-submits at 0"],
    },
  };
  const DIFFICULTY_ORDER = ["easy", "normal", "hard"];

  // ---- Milestone tracking (array + loop driven, not hardcoded per-milestone) ----
  const MILESTONES = [
    { xp: 50, id: "first_steps", name: "First Steps", icon: "🥇" },
    { xp: 150, id: "water_helper", name: "Water Helper", icon: "🚰" },
    { xp: 300, id: "community_builder", name: "Community Builder", icon: "🏘️" },
    { xp: 500, id: "water_champion", name: "Water Champion", icon: "🏅" },
    { xp: 750, id: "flow_master", name: "Flow Master", icon: "🌊" },
    { xp: 1000, id: "clean_water_hero", name: "Clean Water Hero", icon: "👑" },
  ];

  /* =========================================================
     2. STATE & PERSISTENCE
     ========================================================= */

  function defaultState() {
    return {
      playerName: "Player",
      totalXP: 0,
      currentTown: 1,
      currentPuzzleId: "t1p1",
      difficulty: "normal",
      puzzleBestReward: {},      // { "puzzleId::difficulty": xpAlreadyAwarded }
      puzzleBestEfficiency: {},  // { "puzzleId::difficulty": bestEfficiency }
      puzzleCleared: {},         // { puzzleId: true } once cleared on ANY difficulty
      unlockedPuzzleIds: ["t1p1"],
      achievements: {},          // { achievementId: true }
      milestonesUnlocked: {},    // { milestoneId: true }
      soundEnabled: true,
    };
  }

  // Legacy keys were bare puzzleId (pre-difficulty-system saves). Migrate them to "puzzleId::normal".
  function migrateDifficultyKeys(merged) {
    ["puzzleBestReward", "puzzleBestEfficiency"].forEach((field) => {
      const migrated = {};
      Object.keys(merged[field] || {}).forEach((key) => {
        const newKey = key.indexOf("::") === -1 ? key + "::normal" : key;
        const val = merged[field][key];
        migrated[newKey] = Math.max(migrated[newKey] || 0, val);
      });
      merged[field] = migrated;
    });
  }

  function rewardKey(puzzleId, difficulty) {
    return puzzleId + "::" + (difficulty || state.difficulty);
  }

  function bestRewardAcrossDifficulties(puzzleId) {
    let max = 0;
    DIFFICULTY_ORDER.forEach((d) => {
      const v = state.puzzleBestReward[rewardKey(puzzleId, d)] || 0;
      if (v > max) max = v;
    });
    return max;
  }

  let state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const base = defaultState();
      const merged = Object.assign({}, base, parsed);
      merged.puzzleBestReward = Object.assign({}, parsed.puzzleBestReward || {});
      merged.puzzleBestEfficiency = Object.assign({}, parsed.puzzleBestEfficiency || {});
      merged.puzzleCleared = Object.assign({}, base.puzzleCleared, parsed.puzzleCleared || {});
      merged.achievements = Object.assign({}, base.achievements, parsed.achievements || {});
      merged.milestonesUnlocked = Object.assign({}, base.milestonesUnlocked, parsed.milestonesUnlocked || {});
      migrateDifficultyKeys(merged);
      if (!Array.isArray(merged.unlockedPuzzleIds) || merged.unlockedPuzzleIds.length === 0) {
        merged.unlockedPuzzleIds = ["t1p1"];
      }
      if (!getPuzzleById(merged.currentPuzzleId)) merged.currentPuzzleId = "t1p1";
      if (typeof merged.totalXP !== "number" || isNaN(merged.totalXP)) merged.totalXP = 0;
      if (!DIFFICULTIES[merged.difficulty]) merged.difficulty = "normal";
      return merged;
    } catch (e) {
      console.warn("Flow: save data was corrupted, starting fresh.", e);
      return defaultState();
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Flow: unable to save progress.", e);
    }
  }

  function resetGame() {
    state = defaultState();
    saveProgress();
    currentAllocations = {};
  }

  /* =========================================================
     3. GAME LOGIC (pure functions — no DOM)
     ========================================================= */

  function calculateEfficiency(zones, allocations) {
    const total = zones.length;
    const satisfied = zones.filter((z) => (allocations[z.key] || 0) >= z.demand).length;
    return (satisfied / total) * 100;
  }

  function getResultBracket(efficiency) {
    if (efficiency >= 85) return "success";
    if (efficiency >= 60) return "partial";
    return "failure";
  }

  function calculateXP(bracket) {
    if (bracket === "success") return 75;
    if (bracket === "partial") return 50;
    return 20;
  }

  // Best achievable efficiency given a supply constraint (brute force over zone subsets — max 4 zones = 16 subsets).
  function getBestAchievableEfficiency(zones, usableSupply) {
    const n = zones.length;
    let best = 0;
    for (let mask = 0; mask < (1 << n); mask++) {
      let sum = 0, count = 0;
      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) { sum += zones[i].demand; count++; }
      }
      if (sum <= usableSupply) best = Math.max(best, count);
    }
    return (best / n) * 100;
  }

  // Difficulty-adjusted usable supply. Easy: +20%, leakage waived. Normal: unchanged. Hard: leakage applies, then -10%.
  function getEffectiveSupplyInfo(puzzle, difficultyId) {
    const diff = DIFFICULTIES[difficultyId] || DIFFICULTIES.normal;
    const baseUsable = diff.waiveLeakage ? puzzle.startingSupply : puzzle.usableSupply;
    const usableSupply = Math.max(0, Math.round((baseUsable * diff.supplyMultiplier) / 10) * 10);
    return {
      usableSupply,
      leakageApplied: diff.waiveLeakage ? 0 : puzzle.leakage,
      startingSupply: puzzle.startingSupply,
    };
  }

  function currentUsableSupply(puzzle) {
    return getEffectiveSupplyInfo(puzzle, state.difficulty).usableSupply;
  }

  function isShortagePuzzleForSupply(puzzle, usableSupply) {
    const totalDemand = puzzle.zones.reduce((s, z) => s + z.demand, 0);
    return usableSupply < totalDemand;
  }

  // The efficiency needed to "clear" (and unlock the next puzzle) this round. Never higher than what's
  // mathematically achievable given the current difficulty's supply — so no difficulty can make a puzzle unclearable.
  function getClearThreshold(puzzle, usableSupply) {
    const best = getBestAchievableEfficiency(puzzle.zones, usableSupply);
    return Math.min(60, best);
  }

  // Auto-detect every newly-crossed milestone between oldXP and newXP (array/loop driven, not hardcoded).
  function checkMilestones(oldXP, newXP) {
    const newlyCrossed = [];
    MILESTONES.forEach((m) => {
      if (newXP >= m.xp && !state.milestonesUnlocked[m.id]) {
        state.milestonesUnlocked[m.id] = true;
        newlyCrossed.push(m);
      }
    });
    return newlyCrossed;
  }

  /* =========================================================
     4. RUNTIME (DOM-dependent) STATE
     ========================================================= */

  let currentAllocations = {}; // { zoneKey: amount } for the puzzle in progress
  let lastSubmission = null;   // snapshot used by the results overlay
  let pendingPuzzleId = null;  // puzzle waiting on a difficulty choice
  let selectedDifficultyDraft = null; // difficulty chosen on the select screen, before confirm
  let timerInterval = null;
  let timerRemaining = 0;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================================================
     5. AUDIO (synthesized — no external files needed)
     ========================================================= */

  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    return audioCtx;
  }

  function playTone(freq, duration, type, gainValue) {
    if (!state.soundEnabled) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.value = gainValue || 0.06;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  }

  const Sound = {
    click: () => playTone(520, 0.08, "sine", 0.05),
    allocate: () => playTone(700, 0.05, "sine", 0.03),       // gentle drop
    submit: () => playTone(600, 0.1, "sine", 0.05),           // soft confirmation
    success: () => {
      playTone(523, 0.14, "triangle", 0.07);
      setTimeout(() => playTone(659, 0.14, "triangle", 0.07), 120);
      setTimeout(() => playTone(784, 0.2, "triangle", 0.07), 240);
    },
    partial: () => {
      playTone(440, 0.15, "triangle", 0.06);
      setTimeout(() => playTone(392, 0.2, "triangle", 0.06), 150);
    },
    failure: () => {                                          // subtle fail
      playTone(220, 0.22, "sawtooth", 0.045);
      setTimeout(() => playTone(180, 0.26, "sawtooth", 0.045), 140);
    },
    townComplete: () => {                                     // special sound
      [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => playTone(f, 0.22, "triangle", 0.08), i * 140));
    },
    milestone: () => {
      [660, 880, 990].forEach((f, i) => setTimeout(() => playTone(f, 0.16, "sine", 0.07), i * 110));
    },
  };

  /* =========================================================
     6. DOM REFERENCES
     ========================================================= */

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const screens = {
    home: $("#screen-home"),
    tutorial: $("#screen-tutorial"),
    difficulty: $("#screen-difficulty"),
    puzzle: $("#screen-puzzle"),
    leaderboard: $("#screen-leaderboard"),
  };

  function showScreen(name) {
    stopTimer();
    Object.values(screens).forEach((el) => el.classList.remove("active"));
    screens[name].classList.add("active");
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }

  function openOverlay(id) { $("#" + id).classList.remove("hidden"); }
  function closeOverlay(id) { $("#" + id).classList.add("hidden"); }

  /* =========================================================
     7. RENDER: HOME SCREEN
     ========================================================= */

  function renderHome() {
    $("#home-xp").textContent = state.totalXP;
    const townPuzzles = getTownPuzzles(state.currentTown);
    const clearedInTown = townPuzzles.filter((p) => state.puzzleCleared[p.id]).length;
    $("#home-town-progress").textContent = `${clearedInTown} / ${PUZZLES_PER_TOWN}`;
    $("#home-town-name").textContent = `Town ${state.currentTown} – ${getTownMeta(state.currentTown).name}`;
    updateSoundButtons();
  }

  /* =========================================================
     8. DIFFICULTY SELECT SCREEN
     ========================================================= */

  function openDifficultyScreen(targetPuzzleId) {
    pendingPuzzleId = targetPuzzleId;
    selectedDifficultyDraft = state.difficulty;
    renderDifficultyScreen();
    showScreen("difficulty");
  }

  function renderDifficultyScreen() {
    const grid = $("#difficulty-grid");
    grid.innerHTML = "";
    DIFFICULTY_ORDER.forEach((id) => {
      const diff = DIFFICULTIES[id];
      const card = document.createElement("div");
      card.className = "difficulty-card" + (selectedDifficultyDraft === id ? " selected" : "");
      card.dataset.difficulty = id;
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-pressed", String(selectedDifficultyDraft === id));
      card.innerHTML = `
        <span class="diff-icon">${diff.icon}</span>
        <div class="diff-name">${diff.name}</div>
        <div class="diff-desc">${diff.desc}</div>
        <ul class="diff-rules">${diff.rules.map((r) => `<li>• ${r}</li>`).join("")}</ul>
      `;
      const select = () => {
        selectedDifficultyDraft = id;
        Sound.click();
        renderDifficultyScreen();
      };
      card.addEventListener("click", select);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(); }
      });
      grid.appendChild(card);
    });
  }

  function confirmDifficultyAndEnter() {
    state.difficulty = selectedDifficultyDraft || "normal";
    saveProgress();
    Sound.click();
    const target = pendingPuzzleId || state.currentPuzzleId;
    pendingPuzzleId = null;
    loadPuzzle(target);
  }

  /* =========================================================
     9. COUNTDOWN TIMER (Hard mode only)
     ========================================================= */

  function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  function startTimerIfNeeded(puzzle) {
    stopTimer();
    const diff = DIFFICULTIES[state.difficulty];
    const wrap = $("#puzzle-timer-wrap");
    if (!diff.timerSeconds) {
      wrap.classList.add("hidden");
      wrap.classList.remove("timer-warning");
      return;
    }
    wrap.classList.remove("hidden");
    timerRemaining = diff.timerSeconds;
    updateTimerDisplay(diff);
    timerInterval = setInterval(() => {
      timerRemaining -= 1;
      updateTimerDisplay(diff);
      if (timerRemaining <= 0) {
        stopTimer();
        submitDistribution(true);
      }
    }, 1000);
  }

  function updateTimerDisplay(diff) {
    const wrap = $("#puzzle-timer-wrap");
    $("#puzzle-timer").textContent = `${Math.max(0, timerRemaining)}s`;
    wrap.classList.toggle("timer-warning", timerRemaining <= (diff.warningSeconds || 20));
  }

  /* =========================================================
     10. RENDER: PUZZLE SCREEN
     ========================================================= */

  function loadPuzzle(puzzleId) {
    const puzzle = getPuzzleById(puzzleId);
    if (!puzzle) return;
    state.currentPuzzleId = puzzleId;
    state.currentTown = puzzle.town;
    currentAllocations = {};
    puzzle.zones.forEach((z) => (currentAllocations[z.key] = 0));
    saveProgress();
    renderPuzzle();
    showScreen("puzzle");
    startTimerIfNeeded(puzzle);
  }

  function renderPuzzle() {
    const puzzle = getPuzzleById(state.currentPuzzleId);
    if (!puzzle) return;

    const diff = DIFFICULTIES[state.difficulty];
    const supplyInfo = getEffectiveSupplyInfo(puzzle, state.difficulty);
    const usableSupply = supplyInfo.usableSupply;

    $("#puzzle-title").textContent = `Town ${puzzle.town} – Puzzle ${puzzle.number}`;
    $("#puzzle-subtitle").textContent = `${getTownMeta(puzzle.town).name} • ${diff.icon} ${diff.name} Mode`;
    $("#puzzle-xp").textContent = state.totalXP;
    $("#puzzle-difficulty-label").textContent = diff.name;

    const totalDemand = puzzle.zones.reduce((s, z) => s + z.demand, 0);
    $("#supply-total").textContent = `${usableSupply.toLocaleString()} L`;
    $("#supply-demand").textContent = `${totalDemand.toLocaleString()} L`;

    // Leakage / difficulty banner
    const banner = $("#leakage-banner");
    const bannerText = $("#leakage-text");
    if (diff.waiveLeakage && puzzle.leakage > 0) {
      banner.classList.remove("hidden");
      banner.classList.add("leakage-banner-waived");
      bannerText.textContent = `Easy Mode waives this puzzle's usual ${puzzle.leakage.toLocaleString()} L pipe leakage — full starting supply boosted by +20% is usable: ${usableSupply.toLocaleString()} L.`;
    } else if (puzzle.leakage > 0) {
      banner.classList.remove("hidden");
      banner.classList.remove("leakage-banner-waived");
      bannerText.textContent = `Starting Supply: ${puzzle.startingSupply.toLocaleString()} L — Leakage: ${puzzle.leakage.toLocaleString()} L — Usable Supply: ${usableSupply.toLocaleString()} L${state.difficulty === "hard" ? " (Hard Mode: additional -10% applied)" : ""}.`;
    } else {
      banner.classList.add("hidden");
      banner.classList.remove("leakage-banner-waived");
    }

    // Best-possible note for shortage puzzles (difficulty-aware)
    if (isShortagePuzzleForSupply(puzzle, usableSupply)) {
      const best = getBestAchievableEfficiency(puzzle.zones, usableSupply);
      $("#best-possible-note").classList.remove("hidden");
      $("#best-possible-note").textContent =
        `💧 Water shortage on ${diff.name} mode: usable supply is below total demand. The best achievable result here is ${Math.round(best)}% — and this puzzle clears at ${Math.round(getClearThreshold(puzzle, usableSupply))}% so it always stays winnable.`;
    } else {
      $("#best-possible-note").classList.add("hidden");
    }

    renderTownGrid(puzzle);
    updateRemainingAndEfficiency(puzzle);
    updateSoundButtons();
  }

  function renderTownGrid(puzzle) {
    const grid = $("#town-grid");
    grid.innerHTML = "";
    puzzle.zones.forEach((zone) => {
      const card = document.createElement("div");
      card.className = "building-card state-empty";
      card.dataset.zoneKey = zone.key;
      card.innerHTML = `
        ${zone.critical ? '<span class="critical-tag">CRITICAL</span>' : ""}
        <div class="building-header">
          <div class="building-icon-wrap">${zone.icon}</div>
          <div>
            <div class="building-name">${zone.name}</div>
            <div class="building-demand">Needs ${zone.demand.toLocaleString()} L</div>
          </div>
          <span class="status-badge" data-role="status-badge">✕ Unsatisfied</span>
        </div>
        <span class="pipe-label">Pipe from reservoir</span>
        <div class="pipe-connector" data-role="pipe">
          <div class="pipe-fill" data-role="pipe-fill"></div>
        </div>
        <div class="building-progress-track">
          <div class="building-progress-fill" data-role="progress-fill"></div>
        </div>
        <div class="allocation-readout">
          <span>Allocated</span>
          <strong data-role="allocated-readout">0 / ${zone.demand.toLocaleString()} L</strong>
        </div>
        <div class="allocation-controls">
          <button class="alloc-btn" data-action="decrement" aria-label="Decrease ${zone.name} allocation">−</button>
          <input type="range" class="alloc-slider" min="0" max="${zone.demand}" step="10" value="0"
                 aria-label="${zone.name} water allocation" />
          <button class="alloc-btn" data-action="increment" aria-label="Increase ${zone.name} allocation">+</button>
        </div>
      `;
      grid.appendChild(card);
    });

    grid.querySelectorAll(".building-card").forEach((card) => {
      const zoneKey = card.dataset.zoneKey;
      const slider = card.querySelector(".alloc-slider");
      const decBtn = card.querySelector('[data-action="decrement"]');
      const incBtn = card.querySelector('[data-action="increment"]');

      slider.addEventListener("input", () => {
        setAllocation(puzzle, zoneKey, parseInt(slider.value, 10) || 0);
      });
      decBtn.addEventListener("click", () => {
        setAllocation(puzzle, zoneKey, (currentAllocations[zoneKey] || 0) - 10);
      });
      incBtn.addEventListener("click", () => {
        setAllocation(puzzle, zoneKey, (currentAllocations[zoneKey] || 0) + 10);
      });
    });
  }

  // Clamp and apply a new allocation value for one zone, respecting demand cap and difficulty-adjusted supply cap.
  function setAllocation(puzzle, zoneKey, requestedValue) {
    const zone = puzzle.zones.find((z) => z.key === zoneKey);
    if (!zone) return;
    const usableSupply = currentUsableSupply(puzzle);

    const otherAllocatedSum = Object.keys(currentAllocations).reduce((sum, key) => {
      return key === zoneKey ? sum : sum + (currentAllocations[key] || 0);
    }, 0);
    const maxAllowedBySupply = usableSupply - otherAllocatedSum;

    let value = Math.max(0, requestedValue);
    value = Math.min(value, zone.demand);
    value = Math.min(value, maxAllowedBySupply);
    if (value < 0) value = 0;

    const previousValue = currentAllocations[zoneKey] || 0;
    currentAllocations[zoneKey] = value;
    updateBuildingCard(puzzle, zoneKey);
    updateRemainingAndEfficiency(puzzle);
    Sound.allocate();

    if (value > previousValue) spawnDroplet(zoneKey);
  }

  function getZoneState(zone, allocated) {
    if (allocated >= zone.demand) return "full";
    if (allocated > 0) return "partial";
    return "empty";
  }

  // Dynamically create a transient droplet element traveling along the pipe, then remove it (cleanup).
  function spawnDroplet(zoneKey) {
    if (prefersReducedMotion) return;
    const card = document.querySelector(`.building-card[data-zone-key="${zoneKey}"]`);
    if (!card) return;
    const pipe = card.querySelector('[data-role="pipe"]');
    if (!pipe) return;
    const drop = document.createElement("span");
    drop.className = "water-droplet-fx";
    drop.textContent = "💧";
    pipe.appendChild(drop);
    const cleanup = () => { if (drop.parentNode) drop.parentNode.removeChild(drop); };
    drop.addEventListener("animationend", cleanup);
    setTimeout(cleanup, 900); // safety-net fallback
  }

  function updateBuildingCard(puzzle, zoneKey) {
    const zone = puzzle.zones.find((z) => z.key === zoneKey);
    const allocated = currentAllocations[zoneKey] || 0;
    const card = document.querySelector(`.building-card[data-zone-key="${zoneKey}"]`);
    if (!card) return;

    const zoneState = getZoneState(zone, allocated);
    card.classList.remove("state-full", "state-partial", "state-empty");
    card.classList.add(`state-${zoneState}`);

    const pct = Math.min(100, (allocated / zone.demand) * 100);
    card.querySelector('[data-role="progress-fill"]').style.width = pct + "%";

    const pipeFill = card.querySelector('[data-role="pipe-fill"]');
    pipeFill.style.width = pct + "%";
    pipeFill.classList.toggle("pipe-flowing", zoneState === "partial" && !prefersReducedMotion);

    card.querySelector('[data-role="allocated-readout"]').textContent =
      `${allocated.toLocaleString()} / ${zone.demand.toLocaleString()} L`;

    const badge = card.querySelector('[data-role="status-badge"]');
    if (zoneState === "full") badge.textContent = "✓ Fully Satisfied";
    else if (zoneState === "partial") badge.textContent = "◐ Partially Satisfied";
    else badge.textContent = "✕ Unsatisfied";

    const slider = card.querySelector(".alloc-slider");
    if (parseInt(slider.value, 10) !== allocated) slider.value = allocated;

    const decBtn = card.querySelector('[data-action="decrement"]');
    const incBtn = card.querySelector('[data-action="increment"]');
    decBtn.disabled = allocated <= 0;

    const usableSupply = currentUsableSupply(puzzle);
    const otherAllocatedSum = Object.keys(currentAllocations).reduce((sum, key) => {
      return key === zoneKey ? sum : sum + (currentAllocations[key] || 0);
    }, 0);
    const remainingForThis = usableSupply - otherAllocatedSum - allocated;
    incBtn.disabled = allocated >= zone.demand || remainingForThis <= 0;
  }

  function updateRemainingAndEfficiency(puzzle) {
    const usableSupply = currentUsableSupply(puzzle);
    const totalAllocated = Object.values(currentAllocations).reduce((s, v) => s + v, 0);
    const remaining = usableSupply - totalAllocated;
    $("#supply-remaining").textContent = `${remaining.toLocaleString()} L`;

    const pct = usableSupply > 0 ? Math.max(0, Math.min(100, (remaining / usableSupply) * 100)) : 0;
    $("#remaining-fill").style.width = pct + "%";
    $("#remaining-fill").style.background = remaining <= 0 ? "var(--warning)" : "";

    const efficiency = calculateEfficiency(puzzle.zones, currentAllocations);
    $("#puzzle-efficiency-preview").textContent = Math.round(efficiency) + "%";

    puzzle.zones.forEach((z) => updateBuildingCard(puzzle, z.key));
  }

  // Clears allocations and any in-flight droplet/animation elements. Never touches XP or town progress.
  function resetAllocation() {
    const puzzle = getPuzzleById(state.currentPuzzleId);
    if (!puzzle) return;
    puzzle.zones.forEach((z) => (currentAllocations[z.key] = 0));
    renderTownGrid(puzzle); // full rebuild: wipes any lingering droplet elements/animations
    updateRemainingAndEfficiency(puzzle);
    Sound.click();
  }

  /* =========================================================
     11. SUBMIT / RESULTS
     ========================================================= */

  function submitDistribution(autoSubmitted) {
    const puzzle = getPuzzleById(state.currentPuzzleId);
    if (!puzzle) return;
    stopTimer();

    const usableSupply = currentUsableSupply(puzzle);
    const efficiency = calculateEfficiency(puzzle.zones, currentAllocations);
    const bracket = getResultBracket(efficiency);
    const xpForResult = calculateXP(bracket);

    // XP anti-farming: only award the improvement over the best previously-earned reward for this puzzle+difficulty.
    const key = rewardKey(puzzle.id);
    const prevBestReward = state.puzzleBestReward[key] || 0;
    const gainedXP = Math.max(0, xpForResult - prevBestReward);
    const oldTotalXP = state.totalXP;
    state.totalXP += gainedXP;
    state.puzzleBestReward[key] = Math.max(prevBestReward, xpForResult);

    const prevBestEff = state.puzzleBestEfficiency[key] || 0;
    state.puzzleBestEfficiency[key] = Math.max(prevBestEff, efficiency);

    const clearThreshold = getClearThreshold(puzzle, usableSupply);
    const resourceConstrained = clearThreshold < 60;
    const wasAlreadyCleared = !!state.puzzleCleared[puzzle.id];
    const clearsNow = efficiency >= clearThreshold;
    if (clearsNow) state.puzzleCleared[puzzle.id] = true;

    let nextPuzzleId = null;
    let townJustCompleted = false;
    if (clearsNow) {
      const idx = getPuzzleIndex(puzzle.id);
      const next = PUZZLES[idx + 1];
      if (next) {
        nextPuzzleId = next.id;
        if (!state.unlockedPuzzleIds.includes(next.id)) state.unlockedPuzzleIds.push(next.id);
        if (next.town !== puzzle.town) townJustCompleted = true;
      } else {
        townJustCompleted = true;
      }
    }

    const newlyUnlocked = [];
    if (!state.achievements.first_drop && clearsNow) {
      state.achievements.first_drop = true; newlyUnlocked.push("first_drop");
    }
    if (!state.achievements.perfect_flow && efficiency >= 100) {
      state.achievements.perfect_flow = true; newlyUnlocked.push("perfect_flow");
    }
    if (!state.achievements.resource_master && clearsNow && isShortagePuzzleForSupply(puzzle, usableSupply)) {
      state.achievements.resource_master = true; newlyUnlocked.push("resource_master");
    }
    const townPuzzles = getTownPuzzles(puzzle.town);
    const allTownPuzzlesCleared = townPuzzles.every((p) => state.puzzleCleared[p.id]);
    if (!state.achievements.water_hero && allTownPuzzlesCleared) {
      state.achievements.water_hero = true; newlyUnlocked.push("water_hero");
    }

    const newMilestones = checkMilestones(oldTotalXP, state.totalXP);

    saveProgress();

    lastSubmission = {
      puzzle, efficiency, bracket, xpForResult, gainedXP, clearThreshold, resourceConstrained,
      wasAlreadyCleared, clearsNow, nextPuzzleId, townJustCompleted, autoSubmitted,
      newlyUnlocked, newMilestones, allocations: Object.assign({}, currentAllocations),
    };

    displayResults(lastSubmission);
  }

  function displayResults(result) {
    const { puzzle, efficiency, bracket, xpForResult, gainedXP, clearsNow, resourceConstrained, autoSubmitted, allocations } = result;

    const card = $(".results-card");
    card.classList.remove("result-success", "result-partial", "result-failure");
    card.classList.add(`result-${bracket}`);

    const icon = $("#result-icon");
    const title = $("#result-title");
    const message = $("#result-message");

    if (bracket === "success") {
      icon.textContent = "✅";
      title.textContent = "Success!";
      message.textContent = "Outstanding work — nearly every community got the water it needed.";
      Sound.success();
      spawnConfetti();
    } else if (bracket === "partial") {
      icon.textContent = "⚠️";
      title.textContent = "Partial Success";
      message.textContent = "Good effort! Some zones are still underfunded — see below.";
      Sound.partial();
    } else {
      icon.textContent = "❌";
      title.textContent = "Needs Improvement";
      message.textContent = autoSubmitted
        ? "Time ran out before you finished allocating — don't worry, you can retry right away."
        : "Several communities didn't get enough water. Don't worry — you can retry right away.";
      Sound.failure();
    }

    if (clearsNow && resourceConstrained && bracket !== "success") {
      message.textContent += " Given this difficulty's reduced supply, that's the best possible outcome for this puzzle — you've cleared it despite the resource constraint!";
    }

    const degrees = (efficiency / 100) * 360;
    $("#eff-ring").style.background = `conic-gradient(var(--blue) ${degrees}deg, var(--light-blue) ${degrees}deg)`;
    $("#eff-ring-value").textContent = Math.round(efficiency) + "%";

    const zonesList = $("#result-zones");
    zonesList.innerHTML = "";
    let satisfiedCount = 0;
    puzzle.zones.forEach((zone) => {
      const allocated = allocations[zone.key] || 0;
      const st = getZoneState(zone, allocated);
      if (st === "full") satisfiedCount++;
      const icon2 = st === "full" ? "✅" : st === "partial" ? "◐" : "❌";
      const criticalWarn = zone.critical && st !== "full" ? ' <strong style="color:var(--error)">(critical!)</strong>' : "";
      const row = document.createElement("div");
      row.className = "zone-row";
      row.innerHTML = `<span>${icon2}</span><span>${zone.icon} ${zone.name}: ${allocated}/${zone.demand} L${criticalWarn}</span>`;
      zonesList.appendChild(row);
    });

    $("#result-summary-counts").textContent = `${satisfiedCount} of ${puzzle.zones.length} buildings fully satisfied`;

    $("#xp-award-value").textContent = `+${gainedXP}`;
    if (gainedXP === 0 && xpForResult > 0) {
      $("#xp-note").textContent = `You already earned the max XP (${xpForResult}) for this result on this difficulty — no additional XP this time, but feel free to keep improving!`;
    } else if (gainedXP < xpForResult) {
      $("#xp-note").textContent = `(Improved from a previous attempt on this difficulty — awarded the ${gainedXP} XP difference above your prior best.)`;
    } else {
      $("#xp-note").textContent = "";
    }
    $("#result-total-xp").textContent = state.totalXP;

    $("#result-fact").textContent = `💡 Did you know? ${puzzle.fact}`;

    const continueBtn = $("#btn-continue");
    if (clearsNow) {
      continueBtn.style.display = "inline-block";
      continueBtn.textContent = result.townJustCompleted ? "Finish Town →" : "Continue →";
    } else {
      continueBtn.style.display = "none";
    }

    renderHome();
    openOverlay("overlay-results");
    if (gainedXP > 0) showXpToast(gainedXP);
    if (result.newMilestones && result.newMilestones.length) queueMilestoneToasts(result.newMilestones);
  }

  function handleContinue() {
    closeOverlay("overlay-results");
    if (!lastSubmission) return;
    if (lastSubmission.townJustCompleted) {
      showTownComplete(lastSubmission.puzzle.town);
    } else if (lastSubmission.nextPuzzleId) {
      loadPuzzle(lastSubmission.nextPuzzleId);
    }
  }

  function handleRetry() {
    closeOverlay("overlay-results");
    loadPuzzle(state.currentPuzzleId);
  }

  function showTownComplete(townId) {
    stopTimer();
    const meta = getTownMeta(townId);
    const townPuzzles = getTownPuzzles(townId);
    const earnedXP = townPuzzles.reduce((s, p) => s + bestRewardAcrossDifficulties(p.id), 0);

    $("#town-complete-impact").textContent = meta.impactText;
    $("#town-complete-xp").textContent = earnedXP;
    $("#town-complete-puzzles").textContent = `${townPuzzles.length} / ${townPuzzles.length}`;

    const nextTown = TOWNS.find((t) => t.id === townId + 1);
    const nextBtn = $("#btn-next-town");
    if (nextTown) {
      nextBtn.style.display = "inline-block";
      nextBtn.textContent = `Next Town: ${nextTown.name} →`;
      nextBtn.onclick = () => {
        state.currentTown = nextTown.id;
        saveProgress();
        closeOverlay("overlay-town-complete");
        const firstPuzzle = getTownPuzzles(nextTown.id)[0];
        openDifficultyScreen(firstPuzzle.id);
      };
    } else {
      nextBtn.style.display = "none";
    }

    Sound.townComplete();
    spawnConfetti();
    openOverlay("overlay-town-complete");
  }

  /* =========================================================
     12. FX: confetti + XP toast + milestone toast
     ========================================================= */

  function spawnConfetti() {
    if (prefersReducedMotion) return;
    const layer = $("#confetti-layer");
    const pieces = ["💧", "🎉", "✨", "💦"];
    const count = 26;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "confetti-piece";
      el.textContent = pieces[Math.floor(Math.random() * pieces.length)];
      el.style.left = Math.random() * 100 + "%";
      el.style.animationDelay = Math.random() * 0.4 + "s";
      el.style.animationDuration = 1.4 + Math.random() * 1 + "s";
      layer.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }
  }

  function showXpToast(amount) {
    const toast = $("#xp-toast");
    toast.textContent = `+${amount} XP`;
    toast.classList.remove("hidden");
    toast.style.animation = "none";
    requestAnimationFrame(() => { toast.style.animation = ""; });
    setTimeout(() => toast.classList.add("hidden"), 2400);
  }

  // Multiple milestones can be crossed in one submission (big XP jump); show them one after another.
  function queueMilestoneToasts(milestones) {
    milestones.forEach((m, i) => {
      setTimeout(() => showMilestoneToast(m), i * 2600);
    });
  }

  function showMilestoneToast(milestone) {
    const toast = $("#milestone-toast");
    toast.textContent = `${milestone.icon} Milestone Unlocked: ${milestone.name}!`;
    toast.classList.remove("hidden");
    toast.style.animation = "none";
    requestAnimationFrame(() => { toast.style.animation = ""; });
    Sound.milestone();
    setTimeout(() => toast.classList.add("hidden"), 2400);
  }

  /* =========================================================
     13. LEADERBOARD
     ========================================================= */

  const DEMO_PLAYERS = [
    { name: "Amara (demo)", xp: 410, town: 2, puzzles: 7 },
    { name: "Chidi (demo)", xp: 265, town: 2, puzzles: 5 },
    { name: "Priya (demo)", xp: 610, town: 3, puzzles: 11 },
    { name: "Sofia (demo)", xp: 95, town: 1, puzzles: 2 },
  ];

  function renderLeaderboard() {
    $("#player-name-input").value = state.playerName;

    const puzzlesCompleted = Object.keys(state.puzzleCleared).filter((id) => state.puzzleCleared[id]).length;
    const entries = DEMO_PLAYERS.map((p) => Object.assign({ isMe: false }, p));
    entries.push({
      name: state.playerName + " (You)",
      xp: state.totalXP,
      town: state.currentTown,
      puzzles: puzzlesCompleted,
      isMe: true,
    });
    entries.sort((a, b) => b.xp - a.xp);

    const body = $("#leaderboard-body");
    body.innerHTML = "";
    entries.forEach((entry, i) => {
      const row = document.createElement("tr");
      if (entry.isMe) row.classList.add("me");
      row.innerHTML = `<td>#${i + 1}</td><td>${entry.name}</td><td>${entry.xp}</td><td>${entry.town}</td><td>${entry.puzzles}</td>`;
      body.appendChild(row);
    });
  }

  /* =========================================================
     14. PROFILE / ACHIEVEMENTS / MILESTONES
     ========================================================= */

  function renderProfile() {
    const puzzlesCompleted = Object.keys(state.puzzleCleared).filter((id) => state.puzzleCleared[id]).length;
    const townsCompleted = TOWNS.filter((t) => getTownPuzzles(t.id).every((p) => state.puzzleCleared[p.id])).length;
    const bestEff = Math.max(0, ...Object.values(state.puzzleBestEfficiency));

    $("#profile-stats").innerHTML = `
      <div class="pstat"><strong>${state.playerName}</strong><span>Display Name</span></div>
      <div class="pstat"><strong>${state.totalXP}</strong><span>Total XP</span></div>
      <div class="pstat"><strong>${puzzlesCompleted} / ${PUZZLES.length}</strong><span>Puzzles Completed</span></div>
      <div class="pstat"><strong>${townsCompleted} / ${TOWNS.length}</strong><span>Towns Completed</span></div>
      <div class="pstat"><strong>${Math.round(bestEff)}%</strong><span>Best Efficiency</span></div>
      <div class="pstat"><strong>${DIFFICULTIES[state.difficulty].icon} ${DIFFICULTIES[state.difficulty].name}</strong><span>Current Difficulty</span></div>
    `;

    const grid = $("#achievements-grid");
    grid.innerHTML = "";
    ACHIEVEMENT_DEFS.forEach((a) => {
      const unlocked = !!state.achievements[a.id];
      const div = document.createElement("div");
      div.className = "achievement" + (unlocked ? " unlocked" : "");
      div.innerHTML = `<span class="ach-icon">${a.icon}</span><strong>${a.name}</strong><div>${a.desc}</div>`;
      grid.appendChild(div);
    });

    renderMilestones();
    updateSoundButtons();
  }

  function renderMilestones() {
    const container = $("#milestones-panel");
    const nextMilestone = MILESTONES.find((m) => state.totalXP < m.xp);
    let progressHtml;
    if (nextMilestone) {
      const prevThreshold = MILESTONES.slice().reverse().find((m) => m.xp <= state.totalXP);
      const prevXp = prevThreshold ? prevThreshold.xp : 0;
      const pct = Math.min(100, ((state.totalXP - prevXp) / (nextMilestone.xp - prevXp)) * 100);
      progressHtml = `
        <div class="milestone-progress">
          <div class="milestone-progress-label">Current XP: ${state.totalXP} / Next Milestone: ${nextMilestone.name} — Progress: ${state.totalXP}/${nextMilestone.xp} XP</div>
          <div class="milestone-progress-track"><div class="milestone-progress-fill" style="width:${pct}%"></div></div>
        </div>`;
    } else {
      progressHtml = `<div class="milestone-progress"><div class="milestone-progress-label">🎉 Current XP: ${state.totalXP} — All milestones unlocked!</div></div>`;
    }

    const listHtml = MILESTONES.map((m) => {
      const unlocked = !!state.milestonesUnlocked[m.id];
      return `
        <div class="milestone-item ${unlocked ? "unlocked" : ""}">
          <span class="milestone-icon">${m.icon}</span>
          <div><strong>${m.name}</strong><span>${m.xp} XP</span></div>
          <span class="${unlocked ? "milestone-check" : "milestone-lock"}">${unlocked ? "✓" : "🔒"}</span>
        </div>`;
    }).join("");

    container.innerHTML = progressHtml + `<div class="milestone-list">${listHtml}</div>`;
  }

  /* =========================================================
     15. SOUND TOGGLE
     ========================================================= */

  function updateSoundButtons() {
    const label = state.soundEnabled ? "🔊" : "🔇";
    $("#btn-sound").textContent = label;
    $("#btn-sound").setAttribute("aria-pressed", String(state.soundEnabled));
    $("#btn-puzzle-sound").textContent = label;
    $("#btn-puzzle-sound").setAttribute("aria-pressed", String(state.soundEnabled));
    $("#btn-toggle-sound-profile").textContent = "Sound: " + (state.soundEnabled ? "On" : "Off");
  }

  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    saveProgress();
    updateSoundButtons();
    if (state.soundEnabled) Sound.click();
  }

  /* =========================================================
     16. EVENT WIRING
     ========================================================= */

  function wireEvents() {
    $("#btn-play").addEventListener("click", () => { Sound.click(); openDifficultyScreen(state.currentPuzzleId); });
    $("#btn-howto").addEventListener("click", () => { Sound.click(); showScreen("tutorial"); });
    $("#btn-leaderboard").addEventListener("click", () => { Sound.click(); renderLeaderboard(); showScreen("leaderboard"); });
    $("#btn-profile").addEventListener("click", () => { Sound.click(); renderProfile(); openOverlay("overlay-profile"); });
    $("#btn-learn").addEventListener("click", () => { Sound.click(); openOverlay("overlay-learn"); });
    $("#btn-sound").addEventListener("click", toggleSound);
    $("#btn-puzzle-sound").addEventListener("click", toggleSound);
    $("#btn-toggle-sound-profile").addEventListener("click", toggleSound);

    $("#btn-tutorial-play").addEventListener("click", () => { Sound.click(); openDifficultyScreen(state.currentPuzzleId); });
    $("#btn-tutorial-back").addEventListener("click", () => { Sound.click(); renderHome(); showScreen("home"); });

    $("#btn-difficulty-confirm").addEventListener("click", confirmDifficultyAndEnter);
    $("#btn-difficulty-back").addEventListener("click", () => { Sound.click(); pendingPuzzleId = null; renderHome(); showScreen("home"); });

    $("#btn-change-difficulty").addEventListener("click", () => { Sound.click(); openDifficultyScreen(state.currentPuzzleId); });

    $("#btn-puzzle-home").addEventListener("click", () => { Sound.click(); renderHome(); showScreen("home"); });
    $("#btn-reset-allocation").addEventListener("click", resetAllocation);
    $("#btn-submit").addEventListener("click", () => { Sound.submit(); submitDistribution(false); });

    $("#btn-retry").addEventListener("click", handleRetry);
    $("#btn-continue").addEventListener("click", handleContinue);
    $("#btn-result-home").addEventListener("click", () => {
      closeOverlay("overlay-results");
      renderHome();
      showScreen("home");
    });

    $("#btn-learn-more-town").addEventListener("click", () => openOverlay("overlay-learn"));
    $("#btn-town-complete-home").addEventListener("click", () => {
      closeOverlay("overlay-town-complete");
      renderHome();
      showScreen("home");
    });

    $("#btn-leaderboard-back").addEventListener("click", () => { Sound.click(); renderHome(); showScreen("home"); });
    $("#btn-save-name").addEventListener("click", () => {
      const val = $("#player-name-input").value.trim();
      state.playerName = val.length > 0 ? val.slice(0, 18) : "Player";
      saveProgress();
      renderLeaderboard();
      Sound.click();
    });

    $$(".overlay-close").forEach((btn) => {
      btn.addEventListener("click", () => closeOverlay(btn.dataset.close));
    });

    $("#btn-reset-game").addEventListener("click", () => openOverlay("overlay-confirm-reset"));
    $("#btn-confirm-reset").addEventListener("click", () => {
      resetGame();
      closeOverlay("overlay-confirm-reset");
      closeOverlay("overlay-profile");
      renderHome();
      showScreen("home");
    });
    $("#btn-cancel-reset").addEventListener("click", () => closeOverlay("overlay-confirm-reset"));

    $$(".overlay").forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay && overlay.id !== "overlay-confirm-reset") {
          overlay.classList.add("hidden");
        }
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        $$(".overlay:not(.hidden)").forEach((o) => {
          if (o.id !== "overlay-confirm-reset") o.classList.add("hidden");
        });
      }
    });
  }

  /* =========================================================
     17. INIT
     ========================================================= */

  function initializeGame() {
    wireEvents();
    renderHome();
    showScreen("home");
  }

  document.addEventListener("DOMContentLoaded", initializeGame);
})();
