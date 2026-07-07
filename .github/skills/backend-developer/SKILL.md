---
name: backend-developer
description: "Use for backend tasks in MockProject_Group6: design and implement NestJS/Prisma/SQL Server APIs, auth/RBAC, DTOs, database changes, and backend tests. Always anchor on docs/techStackDecisions.md and docs/csdl.sql."
argument-hint: "Describe the backend task, affected module, and any target endpoint or table"
user-invocable: true
---

# Backend Developer

## When to Use

- Implement or fix backend features for MockProject_Group6.
- Change NestJS controllers, services, modules, guards, DTOs, validation, or tests.
- Update Prisma-backed data flow or SQL Server schema usage.
- Work on authentication, authorization, roles, sessions, or other backend cross-cutting concerns.
- Investigate a mismatch between the application behavior and `docs/techStackDecisions.md` or `docs/csdl.sql`.

## Working Context

- Stack: Node.js 24, TypeScript 5.9, NestJS, Prisma, SQL Server, JWT/Passport, class-validator, and class-transformer.
- Treat `docs/techStackDecisions.md` as the source of truth for the approved backend stack.
- Treat `docs/csdl.sql` as the source of truth for database tables, columns, constraints, and relationships.
- Keep changes aligned with the existing monorepo structure under `apps/backend`.

## Procedure

1. Read the request and identify the smallest backend surface involved: endpoint, module, service, table, role, or background process.
2. Map the request to the current code and the SQL schema before editing anything.
3. Decide the implementation shape:
    - API-only change: controller, service, DTOs, validation, and tests.
    - Data change: Prisma schema or query logic plus any affected service logic.
    - Security change: JWT strategy, guards, role checks, or permission checks.
    - Shared contract change: response/request shape, enum, or validation alignment.
4. Implement the narrowest change that satisfies the request.
5. Keep names, enums, and constraints consistent with `docs/csdl.sql`.
6. Prefer NestJS-native patterns and Prisma patterns over ad hoc logic unless raw SQL is required.
7. Validate the touched backend slice with the smallest useful check first, then expand if needed.
8. Report what changed, what was validated, and any assumptions that still need confirmation.

## Decision Rules

- If multiple tables or modules are involved, update the owning aggregate or service boundary first.
- If the schema and code disagree, treat `docs/csdl.sql` as the database reference and call out the mismatch.
- If business rules are unclear, ask one focused clarifying question instead of guessing.
- Do not touch the frontend unless the backend contract explicitly requires it.
- Keep validation decorators aligned with SQL constraints, enum values, and nullability.
- For role-restricted or PHI-related data, enforce authorization explicitly and avoid leaking fields by default.

## Completion Checks

- The backend code compiles.
- Relevant tests pass or a clear reason is given if tests were not available.
- DTOs and schema usage match the documented database model.
- Authentication and authorization are enforced where required.
- No unrelated refactors were introduced.
