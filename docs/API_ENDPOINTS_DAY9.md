# DAY9 API endpoint inventory

All protected endpoints use `Authorization: Bearer <accessToken>`. Swagger is available at `/api/docs` while the Backend is running.

## Authentication and administration

| Method             | Endpoint                            | Purpose                                    |
| ------------------ | ----------------------------------- | ------------------------------------------ |
| POST               | `/api/auth/login`                   | Validate credentials and initiate OTP      |
| POST               | `/api/auth/verify-otp`              | Verify OTP and issue tokens                |
| POST               | `/api/auth/resend-otp`              | Resend OTP                                 |
| POST               | `/api/auth/activate`                | Activate invited account                   |
| POST               | `/api/auth/refresh`                 | Refresh access token                       |
| POST               | `/api/auth/logout`                  | End session                                |
| GET                | `/api/auth/me`                      | Current user                               |
| GET/POST/PUT/PATCH | `/api/users...`                     | User management                            |
| GET/PUT            | `/api/roles...`, `/api/permissions` | Role and permission matrix                 |
| GET/PUT/POST       | `/api/facilities...`                | Facility settings, rooms, capabilities     |
| GET/PUT            | `/api/care-levels...`               | LOC master data and rates                  |
| GET/POST/PUT       | `/api/staffing-ratios...`           | Staffing ratio configuration               |
| GET/PUT            | `/api/incident-severities...`       | Incident severity configuration            |
| GET/PUT            | `/api/sla-configurations...`        | SLA configuration                          |
| GET/POST/PATCH/PUT | `/api/equipment-supplies...`        | Equipment and supply inventory             |
| GET/POST           | `/api/demo-data...`                 | Demo data status, seed, reset, load, clear |

## Admission and clinical workflow

| Method             | Endpoint                                                      | Purpose                                     |
| ------------------ | ------------------------------------------------------------- | ------------------------------------------- |
| GET/POST/PUT/PATCH | `/api/residents...`                                           | Resident list, detail, create, edit, status |
| POST               | `/api/admissions/pre-screening`                               | Pre-admission screening                     |
| POST               | `/api/admissions`                                             | Confirm admission and room assignment       |
| GET                | `/api/admissions/resident/:residentId`                        | Admission history                           |
| POST               | `/api/assessments`                                            | Initial assessment                          |
| GET                | `/api/assessments/resident/:residentId`                       | Assessment history                          |
| GET                | `/api/assessments/resident/:residentId/latest-classification` | LOC result                                  |
| POST               | `/api/assessments/:id/confirm-loc`                            | Confirm or override LOC                     |
| GET                | `/api/residents/:residentId/loc-history`                      | LOC audit history                           |
| POST               | `/api/reassessments`                                          | Reassessment and care-plan version          |

## Care plan, daily care, and billing

| Method       | Endpoint                                     | Purpose                              |
| ------------ | -------------------------------------------- | ------------------------------------ |
| GET/POST/PUT | `/api/care-plans...`                         | Care-plan list, detail, create, edit |
| GET          | `/api/care-plans/loc-gate/:residentId`       | Confirmed-LOC gate                   |
| POST         | `/api/care-plans/:id/don-review`             | DON approve or reject                |
| POST         | `/api/care-plans/:id/esign`                  | Password-verified e-signature        |
| POST         | `/api/care-plans/:id/idt-ack`                | IDT acknowledgment                   |
| GET          | `/api/care-tasks/today`                      | Current shift/day tasks              |
| GET/PATCH    | `/api/care-tasks/:id...`                     | Task detail and completion           |
| POST/GET     | `/api/vitals...`                             | Record and review vital signs        |
| GET/PUT      | `/api/residents/:residentId/billing-cost...` | Billing breakdown and future rates   |

## Incident and chart-lock workflow

| Method   | Endpoint                                    | Purpose                                     |
| -------- | ------------------------------------------- | ------------------------------------------- |
| GET/POST | `/api/incidents`                            | Incident list and report incident           |
| GET      | `/api/incidents/:id`                        | Role-aware incident detail data             |
| PATCH    | `/api/incidents/:id/investigation`          | DON/Admin root-cause analysis               |
| POST     | `/api/incidents/:id/progress-notes`         | Add clinical progress note                  |
| POST     | `/api/incidents/:id/request-don-review`     | Request DON review                          |
| POST     | `/api/incidents/:id/submit-external-report` | E-signed regulatory submission and receipt  |
| POST     | `/api/incidents/:id/resolve`                | Resolve incident after checklist completion |
| POST     | `/api/incidents/:id/lock-chart`             | Lock resident chart                         |
| POST     | `/api/incidents/:id/unlock-chart`           | Password-verified DON/Admin unlock          |

## Dashboards

- `GET /api/dashboard/nurse`
- `GET /api/dashboard/don`
- `GET /api/dashboard/cna`
- `GET /api/dashboard/summary`
