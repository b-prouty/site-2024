# Progress

## What Works
- All static portfolio pages render correctly.
- CSS/SCSS styling is responsive and visually consistent.
- Express `/ask` endpoint streams GPT-4 responses grounded in `brian_data.json`.
- Vercel deployment (static files + Node function) is configured and running.

## What's Left to Build
- Deduplicate and remove unused Next.js `pages/` directory or adopt Next.js fully.
- Consolidate multiple `brian_data*.json` files into a single source of truth.
- Add robust client-side error handling for streaming API.
- Automate SCSS compilation or migrate to CSS Modules/PostCSS.
- Introduce ESLint/Prettier and write unit tests for server code.
- Conduct full accessibility audit (WCAG AA) and performance pass (Lighthouse).

## Current Status
MVP portfolio site is live with a beta AI chat feature. The project is entering the documentation, cleanup and quality-improvement phase.

## Known Issues
- Duplicate AI implementations (Express vs Next.js API) cause confusion and redundant code paths.
- Some unused code and images remain in the repo, increasing build size.
- No continuous integration pipeline for lint/tests.
- Serverless function may time-out for very long answers (>10 s).