# Nishant Shah — Portfolio · Deploy & Claude Code Handoff

This is a **static site** (plain HTML/CSS/JS, no build step). It can be hosted as-is on
Netlify, Vercel, Cloudflare Pages, or GitHub Pages.

## Structure
- `index.html` — entry point (the full-screen team intro video)
- `intro.html` — same intro (kept for the nav)
- `portfolio.html` — main scroll portfolio ("Journey")
- `world.html` — 360° room with hotspot pop-ups + "Ask Me About Nishant" agent
- `spike.html` — per-letter category pages (`spike.html?s=T|E|A|M`)
- `case-study.html` — individual case studies (`case-study.html?p=<id>`)
- `design-system.html`, `team-video.html` — supporting
- `assets/` — css (`tokens.css`), js (`cases.js`, `journey.js`, `dj-hud.js`, etc.), photos, logos, videos

Archived/unused older versions still live in the project root (e.g. `Portfolio.html`,
`Portfolio TEAM.html`, `Portfolio Dawn.html`, `Portfolio Simple.html`,
`Intro 3D archive.html`, `Scrollytelling Storyboard.html`) — move these into an `/archive`
folder so they don't ship.

---

## PROMPT TO PASTE INTO CLAUDE CODE

> I'm deploying my static portfolio site (plain HTML/CSS/JS, no build step). Please:
>
> 1. **Clean up the repo:** move the unused legacy pages (`Portfolio.html`,
>    `Portfolio TEAM.html`, `Portfolio Dawn.html`, `Portfolio Simple.html`,
>    `Intro 3D archive.html`, `Scrollytelling Storyboard.html`, and the original
>    space-named files `Portfolio Journey.html`, `World.html`, `Intro.html`,
>    `Spike.html`, `Case Study.html`, `Design System.html`, `TEAM Video Graphic.html`)
>    into an `/archive` folder. The live site uses only: `index.html`, `intro.html`,
>    `portfolio.html`, `world.html`, `spike.html`, `case-study.html`,
>    `design-system.html`, `team-video.html`, and everything in `assets/`.
>    After moving, grep every shipped file for links to the old names and fix any stragglers.
>
> 2. **Compress media:** all videos in `assets/` (`intro-video.mp4`, `dj-set.mp4`,
>    `dawn.mp4`) are phone exports and are huge — re-encode to H.264 MP4, ~1080p,
>    target 4–8 Mbps, faststart flag, and downscale oversized images to max 2000px.
>    This is the #1 cause of slow loads.
>
> 3. **Secure the Mistral API key:** `world.html` currently has a hardcoded Mistral
>    API key in client JS (the "Ask Me About Nishant" agent). Move it to a serverless
>    function (e.g. `/api/ask` on Vercel/Netlify) that reads the key from an env var,
>    and update `world.html` to call that endpoint instead of Mistral directly.
>    The page already has an offline keyword fallback, so it must still work if the API fails.
>
> 4. **Deploy:** set up the project for Netlify or Vercel (static, no build command,
>    publish directory = repo root). Confirm `index.html` is the entry. Add a
>    `_redirects` / `vercel.json` only if needed.
>
> 5. **Verify:** test that nav (Intro / Portfolio / Room) works, all case-study and
>    spike links resolve, the DJ video widget plays, and the agent responds.
>
> Don't change any copy, layout, colors, or content — this is a deployment/cleanup pass only.

---

## Notes
- The DJ video widget (`assets/dj-hud.js`) and the intro/dawn videos autoplay **muted**
  by browser rule; users click to enable sound. That's expected, not a bug.
- Cross-page "continuous" DJ playback is faked via `localStorage` (resumes timestamp).
  True seamless playback would require converting to a single-page app — out of scope.
