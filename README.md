# Flow — A charity: water Game Concept

**Tagline:** Every Drop Makes a Difference.

Flow is a browser-based puzzle and resource-management game inspired by [charity: water](https://www.charitywater.org/)'s mission. Players distribute a limited supply of clean water across a town's hospital, homes, school, and factory, balancing competing needs under realistic constraints like supply shortages and pipe leakage.

> **This is an independent, unofficial educational prototype.** It is not produced, endorsed, or verified by charity: water. Playing Flow does not generate real donations or fund real water projects. All community names, impact figures, and statistics referencing "households helped" are simulated/illustrative, not verified real-world data.

---

## How to run it

No build step, no server, no dependencies.

1. Open the `flow-game` folder.
2. Double-click `index.html` (or open it from your browser with File → Open).
3. Play.

That's it — everything runs client-side with plain HTML, CSS, and JavaScript. Progress is saved automatically to your browser's `localStorage`, so it will still be there next time you open the file in the same browser.

If your browser restricts certain features (like audio) when opening files directly via `file://`, you can optionally serve the folder locally instead:

```bash
cd flow-game
python3 -m http.server 8000
# then visit http://localhost:8000
```

---

## Project structure

```
flow-game/
│
├── index.html        All screens (home, tutorial, puzzle, results, leaderboard, overlays)
├── style.css          All styling, animations, and responsive layout
├── script.js           Game data, state, scoring logic, rendering, and event handling
│
├── assets/
│   ├── images/        Reserved for future illustration assets
│   ├── icons/           Reserved for future icon assets
│   └── audio/          Reserved for future audio assets (sound is currently synthesized
│                        live via the Web Audio API, so no audio files are required to play)
│
└── README.md
```

Building icons currently use emoji (🏥🏠🏫🏭) combined with CSS cards/animations rather than bitmap images, which keeps the prototype dependency-free and fast to load. The `assets/` folders are included per the project structure and ready for real artwork to be dropped in later.

---

## Gameplay summary

- Each puzzle gives you a **limited water supply** and four buildings with their own **demand**.
- Allocate water with sliders or +/− buttons. You can never allocate more than a building needs (excess is wasted) or more than your total supply.
- **Efficiency** = (number of fully-satisfied buildings ÷ total buildings) × 100.
- Submitting awards XP based on efficiency:
  - 85–100% → **Success** → 75 XP
  - 60–84% → **Partial Success** → 50 XP
  - Below 60% → **Needs Improvement** → 20 XP
- You can retry any puzzle. XP is only awarded for the *improvement* over your previous best result on that puzzle, so repeated identical submissions can't farm unlimited XP.
- Clearing a puzzle (≥60% efficiency) unlocks the next one. Finishing all 5 puzzles in a town shows a Town Complete summary and unlocks the next town.
- 3 towns × 5 puzzles = **15 total puzzles**, with increasing difficulty: exact-fit tutorial levels, then water-shortage levels, then levels combining shortages, pipe leakage, and a critical (priority) hospital building that creates real trade-off decisions.

## Features implemented

- Full water-allocation puzzle loop with sliders, +/− buttons, live remaining-supply tracking, and per-building status (Fully Satisfied / Partially Satisfied / Unsatisfied), communicated with color, text, and icons.
- Submit / Retry / Reset Allocation controls.
- Results screen with animated efficiency ring, per-zone breakdown, animated XP award, confetti celebration on success, and an educational fact.
- Town progression (3 towns, 5 puzzles each), Town Complete screen with a clearly-labeled illustrative impact summary.
- Water Shortage and Pipe Leakage challenge mechanics, plus Critical/Priority buildings (hospital) that must be weighed against other needs.
- Local/demo leaderboard with a few labeled demo players, sorted by XP, clearly marked as device-local (not synced online).
- Player profile panel with stats and four unlockable achievements (First Drop, Perfect Flow, Water Hero, Resource Master).
- Sound toggle with lightweight synthesized sound effects (Web Audio API — no audio files needed) that never autoplay loudly on load.
- `prefers-reduced-motion` support (disables background animation/confetti and shortens transitions).
- Responsive layout tested at 375px (mobile), 768px (tablet), and 1440px (desktop).
- `localStorage` persistence for XP, puzzle/town progress, achievements, sound setting, and best scores, with graceful fallback if saved data is missing or corrupted.
- Reset Game option with a confirmation step before erasing progress.


