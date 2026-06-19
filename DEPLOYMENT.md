# Deployment Guide — Nishant Shah Portfolio (Vercel)

Static site (plain HTML/CSS/JS) + one serverless function for the "Ask Me About Nishant" agent.
No build step. This file documents the deploy-ready state produced by the cleanup pass.

## 🔴 Do this first — rotate the exposed API key
The old Mistral key (`yrL3iFnCk2…`) was hardcoded in the client and is now in git history.
**Treat it as compromised:** revoke it at https://console.mistral.ai/ → API Keys, and create a new one.
Use the **new** key as the `MISTRAL_API_KEY` env var below. Never put it back in client code.

## Deploy to Vercel

**Option A — CLI**
```bash
npm i -g vercel          # if not installed
cd "<this folder>"
vercel                   # first run links/creates the project
vercel env add MISTRAL_API_KEY   # paste the NEW key (Production + Preview)
vercel --prod            # deploy to production
```

**Option B — Git + dashboard**
1. Push this repo to GitHub/GitLab.
2. vercel.com → New Project → import the repo.
3. Framework preset: **Other**. Build command: **none**. Output dir: **root** (leave default).
4. Project → Settings → Environment Variables → add `MISTRAL_API_KEY` = your new key.
5. Deploy.

Zero config needed: Vercel serves the static files and auto-detects `api/ask.js` as a serverless
function at `/api/ask`. `.vercelignore` keeps `archive/`, `screenshots/`, `uploads/`, and these
docs out of the deploy.

## Live site = these files only
`index.html` (entry), `intro.html`, `portfolio.html`, `world.html`, `spike.html`,
`case-study.html`, `design-system.html`, `team-video.html`, `assets/`, `api/ask.js`.

## What the cleanup pass changed
- **Archived 9 legacy pages** → `archive/` (not deployed): the old `Portfolio Journey.html`,
  `Case Study.html`, `Design System.html`, `TEAM Video Graphic.html`, `Portfolio TEAM.html`,
  `Portfolio Dawn.html`, `Portfolio Simple.html`, `Intro 3D archive.html`,
  `Scrollytelling Storyboard.html`.
- **Normalized filenames to lowercase** (`Intro.html`→`intro.html`, `World.html`→`world.html`,
  `Spike.html`→`spike.html`, `Portfolio.html`→`portfolio.html`) and rewrote every internal link
  to match exactly. This was required: the local Mac filesystem is case-insensitive, but Vercel
  (Linux) is case-sensitive, so the previous mixed-case links would have 404'd in production.
- **Secured the Mistral key**: moved the key + system prompt into `api/ask.js` (reads
  `MISTRAL_API_KEY` from the environment). `world.html` now calls `/api/ask` and still falls back
  to its built-in offline keyword answers if the function is unavailable.
- **Compressed media**: images 224 MB → ~25 MB (downscaled to ≤2000px, q80); 4K intro video
  re-encoded to 1080p (19.5 → 14.5 MB); `dj-set.mp4` and `dawn.mp4` remuxed with the faststart
  flag for progressive playback. Total deploy payload ≈ 81 MB.
- **git** was initialized with a baseline commit before any changes, so everything is reversible.

## Notes / decisions to be aware of
- **Two portfolio designs existed.** `portfolio.html` (bento case-study grid) is canonical — it's
  what `index.html` links to and what the deploy doc specified. The alternate "Journey/TEAM" design
  is preserved at `archive/Portfolio Journey.html`. To switch to it instead, swap the two files and
  re-point links — ask and it's a quick change.
- **`spike.html`** (the T/E/A/M letter pages) shipped per the deploy doc, but nothing currently
  links to it — that TEAM-letter navigation only lived in the retired Journey design. It works via
  direct URL (`spike.html?s=T`). Wire it into `portfolio.html` later if you want it in the nav.
- **`assets/graph2d.js` / `graph3d.js`** are dead code (no live page loads them) and contain a
  pre-existing broken image ref (`photos/theatre.jpg`). Harmless; left as-is.
- **Agent autoplay/muted video** behavior and cross-page DJ playback are unchanged (expected).
