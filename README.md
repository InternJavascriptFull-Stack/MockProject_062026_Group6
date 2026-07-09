# MockProject_Group6 - Nursing Home Management System

This repository is a simple npm workspaces monorepo for the Nursing Home Management System.

## Tech Stack

- Node.js LTS v24
- npm workspaces
- TypeScript 5.9.x
- ReactJS with Vite
- Tailwind CSS and shadcn-style UI components
- NestJS backend
- Prisma ORM
- SQL Server 2022 Express through Docker
- Zustand, Axios, React Query, Zod, React Hook Form, Day.js
- ESLint and Prettier

## Project Structure

```text
MockProject_Group6/
├── apps/
│   ├── frontend/
│   └── backend/
├── packages/
│   ├── eslint-config/
│   └── typescript-config/
├── docs/
│   ├── codingStandards.md
│   └── techStackDecisions.md
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

## Setup

```powershell
cd D:\Downloads\MockProject_Group6_Merged_Final_Standards\MockProject_Group6_Merged_Final
npm install
npm run dev
```

Open:

```text
http://localhost:3001
```

## Useful Scripts

```bash
npm run dev
npm run dev:frontend
npm run dev:backend
npm run build
npm run lint
npm run format
```

## Routes

```text
/                         Landing page
/dashboard                Internal dashboard
/residents                Resident list
/residents/reception      Resident reception
/doctor-schedule          Doctor schedule
/emar                     eMAR medicine
/care-plan                Care plan
/login                    Login
/login/register           Register
/login/forgot-password    Forgot password
/login/enter-new-password Enter new password
/sign-in                  Sign in
/sign-up                  Sign up
```

## Database

Start SQL Server 2022 Express with Docker:

```bash
docker compose up -d
```

Stop it:

```bash
docker compose down
```

See `.env.example` for the shared Prisma `DATABASE_URL`.
