# Technical Context

## Technologies Used
- Node.js 18+
- Express 4.x
- OpenAI JavaScript SDK 4.x
- Vanilla JavaScript, HTML5, CSS3/SCSS
- Vercel (static hosting + serverless functions)

## Development Setup
1. `npm install` to install dependencies.
2. `npm run dev` (nodemon) to start local Express server at `http://localhost:3000` and auto-reload on change.
3. Static pages are served from `public/`.
4. SCSS compiled manually; compiled CSS committed to repo (no automated build script yet).
5. Environment variable `OPENAI_API_KEY` must be set locally and on Vercel.

## Technical Constraints
- Vercel serverless functions (Hobby tier) have ~10 s execution limit.
- Bundle size must stay < 50 MB.
- OpenAI tokens limited to 1000 per request to control cost.

## Dependencies
(See `package.json`)
- express ^4.18.2
- body-parser ^1.20.2
- cors ^2.8.5
- openai ^4.0.0
- node-fetch ^2.6.1
- dev: nodemon ^3.1.0