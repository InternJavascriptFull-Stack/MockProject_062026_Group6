# MockProject_Group6 - Nursing Home Management System

Welcome to the official repository for the Nursing Home Management System. This project is developed by Group 6.

## Tech Stack Overview

- **Runtime Environment:** **Node.js LTS (v24)**
- **Package Manager:** **npm** (with npm Workspaces, strictly no `yarn`/`pnpm`/`bun` to avoid lockfile conflicts)
- **Programming Language:** **TypeScript (TS) v5.9.x**
- **Frontend Framework:** **ReactJS (Vite)**
- **CSS & UI Framework:** **Tailwind CSS** & **shadcn/ui**
- **Backend Framework:** **NestJS**
- **Database ORM:** **Prisma ORM**
- **Database:** **SQL Server (MSSQL) 2022 Express** (via Docker)
- **State Management:** **Zustand**
- **HTTP Client & Server State:** **Axios** & **React Query (@tanstack/react-query)**
- **Validation:** **Class-Validator** (Backend) & **Zod** (Frontend, with React Hook Form)
- **Authentication:** **NestJS Passport (JWT)** & **Zustand Store (`useAuthStore`)** (using HttpOnly Cookies for secure session rehydration via `/auth/me`)
- **Date/Time Library:** **Day.js**

---

## Repository Directory Structure (Simple Monorepo)

```text
MockProject_Group6/           # Git Repository Root
├── apps/
│   ├── frontend/             # ReactJS (Vite, Tailwind, Zustand)
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── backend/              # NestJS (Prisma ORM, Passport)
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── shared-types/         # Shared package for types, DTO interfaces, validation
│       ├── index.ts
│       └── package.json
├── .vscode/                  # Shared IDE configurations
│   ├── extensions.json
│   └── settings.json
├── docker-compose.yml        # Docker SQL Server 2022 Express config
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── package.json              # Root package defining npm workspaces
└── README.md                 # This file
```

---

## Local Development Setup Guide

### 1. Prerequisite: Install Docker

- **Windows & macOS:** Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
  - _Windows:_ Ensure WSL 2 is enabled in Docker settings.
  - _macOS (Apple Silicon M1/M2/M3):_ Docker Desktop supports Rosetta 2 natively.

- **Linux:** Install Docker Engine and the `docker-compose-plugin` using your package manager.

### 2. Start the local database

Run the following command at the root of the repository to launch the SQL Server container in the background:

```bash
docker compose up -d
```

Verify the database container is active:

```bash
docker ps
```

_(You should see `mssql_nursing_home` with status `Up`)._

### 3. Setup environment variables

Create a `.env` file at the root of the project by copying `.env.example`:

```bash
cp .env.example .env
```

Ensure the credentials in `.env` match your local database configuration (refer to `.env.example` for the default connection variables).

### 4. Sync Database Schema (Prisma)

To initialize the SQL Server database schema from your Prisma models, run:

```bash
npx prisma db push
```

## Running the applications

### 5. Running the applications in Development Mode

You can run both the frontend and backend applications simultaneously in development mode with a single command from the root of the repository:

```bash
npm run dev
```

This uses Turborepo to run the dev tasks in parallel:

- **Backend (NestJS)**: Starts on `http://localhost:3000`
- **Frontend (React/Vite)**: Starts on `http://localhost:3001` (with all `/api` requests proxied to the backend on port 3000 to prevent CORS issues)

Alternatively, you can run individual workspaces:

- Run the Backend only: `npm run dev -w apps/backend`
- Run the Frontend only: `npm run dev -w apps/frontend`

### 6. Code Quality & Formatting

To run the linter across the entire monorepo:

```bash
npm run lint
```

To format code with Prettier:

```bash
npm run format
```

### 7. Path Aliases (`@/*`)

Both frontend and backend packages are configured to use the `@/*` alias pointing to the package's local `src/*` folder.

- **Usage example**: `import { MyComponent } from "@/components/MyComponent";`
- **Resolution**: Vite resolves these natively using `tsconfigPaths: true` during build/development. NestJS resolves them dynamically at runtime in production via `--import tsconfig-paths/register.js`.

### 8. Shutting down the database

To stop the SQL Server container when you are finished coding:

```bash
docker compose down
```

_(Your development database data is persistent and stored in the local volume `mssql_data`)._

---

## Coding Standards & Git Workflow

Before contributing or submitting a Pull Request, please ensure you review and follow the team's coding guidelines:

- **Coding Guidelines:** Refer to the detailed guide in [docs/coding-standards.md](docs/coding-standards.md).
- **Git Branching Policy:** Ensure all branches are named using the lowercase pattern: `feature/<name>`, `bugfix/<name>`, `refactor/<name>`, or `docs/<name>`.
