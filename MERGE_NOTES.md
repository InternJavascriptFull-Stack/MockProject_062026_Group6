# Merge Notes

This version keeps the previously merged feature branches and adds a standards pass based on the uploaded Coding Standards Document and Tech Stack Decisions document.

## Included Feature Areas

- Landing page before login/register.
- Dashboard.
- Resident list and resident reception.
- Doctor schedule.
- eMAR medicine screen.
- Care plan screen.
- Login, register, forgot password, enter new password.
- Sign in and sign up screens.

## Standards Pass

- Removed generated `.js` duplicates from `apps/frontend/src` so source code stays TypeScript-first.
- Removed Turborepo usage and kept npm workspaces only.
- Updated Node target to v24.
- Updated Prettier, VS Code, and EditorConfig indentation to 4 spaces.
- Renamed frontend source files and directories to camelCase.
- Added shared frontend constants under `apps/frontend/src/constants`.
- Translated non-English code comments to English.
- Added documentation under `docs/codingStandards.md` and `docs/techStackDecisions.md`.

## Notes

The frontend feature screens are still mock-data based. Backend API integration, Prisma schema, and authentication guards can be developed in the next phase.
