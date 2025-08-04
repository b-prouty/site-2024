# Project Brief

## Project Overview
"Site-2024" is the public portfolio and personal-branding website of **Brian Prouty** – a California-based Product Designer with a background in front-end development and graphic design. The site showcases case studies, résumé information and visual assets while providing an AI-powered chat assistant that answers questions about Brian using a curated JSON knowledge base.

## Goals
- Present Brian’s professional work, skills and personality in a visually engaging way.
- Offer prospective employers/clients a quick, conversational way to learn about Brian via an AI chat interface.
- Be deployable as a static site + serverless functions (Vercel) with minimal hosting cost.
- Keep the codebase simple so Brian can iterate quickly without a complex build pipeline.

## Scope
- Static marketing pages (HTML/CSS/JS) for portfolio projects, résumé, contact, etc.
- An Express API (`/ask`) that streams OpenAI Chat completions.
- A public AI chat UI (`ai.html`) and an experimental React/Next page (`pages/ai.js`).
- Asset management for images, fonts and SCSS-based styles.
- Continuous deployment to Vercel.

## Stakeholders
- **Primary:** Brian Prouty (site owner & content author)
- **Secondary:** Recruiters, hiring managers, potential freelance clients, industry peers and casual visitors