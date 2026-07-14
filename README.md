# MockProject Group 6 — Nursing Home Management System

Simple npm-workspaces monorepo containing a React/Vite Frontend and NestJS/Prisma Backend for the NHMS workflow SC_001–SC_044.

## Approved stack

- Node.js LTS v24 and npm workspaces
- TypeScript 5.9
- React, Vite, Tailwind CSS, React Query, Axios, Zustand
- NestJS, Prisma ORM, class-validator, JWT
- SQL Server 2022 Express through Docker
- ESLint and Prettier

## Project structure

```text
MockProject_Group6/
├── apps/frontend/
├── apps/backend/
├── packages/
├── database/
├── docs/
├── docker-compose.yml
├── .env.example
└── package.json
```

## Recommended local setup — Docker + Prisma

SSMS is optional. Prisma can create and update the SQL Server database directly from `schema.prisma`.

Use Node.js v24 as defined by `.node-version`.

```powershell
Copy-Item .env.example .env
npm install
docker compose up -d
npm run db:generate
npm run db:push
npm run db:seed
```

Start both applications in separate terminals:

```powershell
npm run dev:backend
npm run dev:frontend
```

- Frontend: `http://localhost:3001`
- Backend: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`

## Reset the local database completely

The command below deletes the Docker volume and all existing local database data:

```powershell
docker compose down -v
docker compose up -d
npm run db:generate
npm run db:push
npm run db:seed
```

## Build and test

```powershell
npm run build:all
npm test --workspace=backend -- --runInBand
```

## Main routes

```text
/login
/activate
/verify-otp
/dashboard
/admin/users
/admin/roles
/admin/facility
/admin/loc-rates
/admin/staffing
/admin/incident-severity
/admin/sla-config
/admin/data
/admin/equipment
/residents
/admissions/pre-screening
/admissions/new
/assessments/new
/assessments/history
/care-plans
/care-tasks/today
/reassessments/new
/billing/cost-panel
/incidents
/incidents/report
```

## Database note

`database/Database_SQL_Official.sql` is retained as the official SQL reference. The merged source code currently uses Prisma as the executable schema contract. Do not import the official SQL and then run `prisma db push` unless the team first unifies their primary-key strategy. Read `database/README.md` for details.

## Documentation

- `docs/COMPLETION_REPORT.md`
- `docs/API_ENDPOINTS_DAY9.md`
- `docs/codingStandards.md`
- `docs/techStackDecisions.md`
- `database/README.md`
