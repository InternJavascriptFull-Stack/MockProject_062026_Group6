# User Validation Rules

This document specifies the validation rules that must be enforced when creating or updating a User via the API.

## Validation Matrix

| Field | Rule | Error Message |
|-------|------|---------------|
| `firstName` | String, Required, Minimum 2 characters, No special characters/numbers. | "First name must be at least 2 characters long and contain only letters." |
| `lastName`  | String, Required, Minimum 2 characters, No special characters/numbers. | "Last name must be at least 2 characters long and contain only letters." |
| `email`     | String, Required, Must be a valid email format, Must be unique in DB. | "Invalid email format." / "Email is already registered." |
| `roleId`    | Integer, Required, Must exist in the `roles` table. | "A valid Role must be selected." |
| `status`    | String, Required, Enum: `ACTIVE`, `INACTIVE`, `LOCKED`. | "Status must be ACTIVE, INACTIVE, or LOCKED." |

## Security Note
All input fields should be properly sanitized before inserting into the database to prevent SQL Injection and XSS attacks. The email field should be converted to lowercase to maintain consistency in uniqueness checks.
