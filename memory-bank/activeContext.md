# Active Context

## Current Focus
The Memory Bank scaffold has been created. Immediate focus:
1. Document existing codebase & deployment pipeline.
2. Remove legacy/duplicate Next.js routes and align API path with Express server.
3. Consolidate knowledge JSON files (`brian_data*.json`) and standardize loading path.
4. Add unit tests and linting for server endpoints.
5. Evaluate converting static pages to a component-based framework (optional, low priority).

## Recent Changes
- Added Memory Bank with six core markdown files.
- Conducted initial repository analysis and documented architecture, tech stack and current state.

## Next Steps
- Decide whether to keep Next.js pages or fully commit to static HTML + Express API.
- Update `vercel.json` routes once path structure is finalized.
- Create CI workflow for linting/tests.
- Polish AI chat UI and client-side error handling.

## Active Decisions & Considerations
- Simplicity & fast deployments are prioritized over adopting a heavy framework.
- All AI responses must be grounded strictly in the curated JSON knowledge base.
- Must adhere to Vercel’s serverless limits (execution timeouts, cold starts).