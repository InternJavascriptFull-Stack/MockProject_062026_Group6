# Database setup and alignment note

## Runtime database used by the completed code

The application uses `apps/backend/prisma/schema.prisma` as its executable database contract. SSMS is optional.

```powershell
docker compose up -d
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

The Prisma schema already contains the additional DAY9 configuration fields and Facility/Staffing tables required by the completed source. The SQL file in `database/migrations/` is retained only as a reference for teams that manage an existing SQL database manually.

## Official SQL reference

`Database_SQL_Official.sql` is preserved unchanged from the supplied project document.

There is an inherited incompatibility between that SQL file and the current merged Prisma contract:

- The official SQL uses `BIGINT IDENTITY` for almost every primary and foreign key.
- The merged Prisma schema and existing application code use SQL Server `UNIQUEIDENTIFIER` values for many core records, including users, residents, admissions, assessments, care plans, incidents, invoices and notifications.

Do not import the official SQL and then run `prisma db push` without first agreeing on one ID strategy. The safe runnable baseline for this package is the Prisma schema. A future database-normalization task must choose one ID strategy, update foreign keys and DTOs, regenerate Prisma Client, migrate existing data and rerun end-to-end tests.
