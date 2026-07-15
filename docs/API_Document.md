# NHMS API Documentation

**Project:** Nursing Home Management System (NHMS)
**Base URL:** `http://localhost:3000`
**Version:** 1.0
**Updated:** 2026-07-15

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Common Error Responses](#2-common-error-responses)
3. [Users](#3-users)
4. [Roles & Permissions](#4-roles--permissions)
5. [Facilities](#5-facilities)
6. [Residents](#6-residents)
7. [Admissions & Pre-Screening](#7-admissions--pre-screening)
8. [Assessments & LOC](#8-assessments--loc)
9. [Care Plans](#9-care-plans)
10. [Care Tasks](#10-care-tasks)
11. [Vital Signs](#11-vital-signs)
12. [Incidents](#12-incidents)
13. [Billing](#13-billing)
14. [Dashboard](#14-dashboard)
15. [Care Levels](#15-care-levels)
16. [Incident Severities](#16-incident-severities)
17. [SLA Configurations](#17-sla-configurations)
18. [Staffing Ratios](#18-staffing-ratios)
19. [Equipment & Supplies](#19-equipment--supplies)
20. [Demo Data](#20-demo-data)

---

## Authorization

All protected endpoints require:

```
Authorization: Bearer <accessToken>
```

The `accessToken` is obtained after successful OTP verification (`POST /api/auth/verify-otp`).
The `refreshToken` is used only on `POST /api/auth/refresh`.

---

## 1. Authentication

> **Owner:** Backend Lead (Member 6 - Auth)

---

### 1.1 Login

| Field             | Value             |
| ----------------- | ----------------- |
| **API Name**      | Login             |
| **Screen**        | Login Screen      |
| **Method**        | `POST`            |
| **Endpoint**      | `/api/auth/login` |
| **Auth Required** | No                |

**Description:** Accepts email or phone number + password. On success, generates a 6-digit OTP, sends it to the user's registered email, and returns `otpRequired: true`. Does **not** issue a JWT at this stage.

**Request Headers:**

| Header         | Value              |
| -------------- | ------------------ |
| `Content-Type` | `application/json` |

**Request Body:**

| Field        | Type   | Required | Validation                                               | Example                |
| ------------ | ------ | -------- | -------------------------------------------------------- | ---------------------- |
| `identifier` | string | Yes      | Non-empty, max 255 chars. Accepts email or phone (E.164) | `"staff@facility.org"` |
| `password`   | string | Yes      | Non-empty                                                | `"Password123!"`       |

```json
{
    "identifier": "staff@facility.org",
    "password": "Password123!"
}
```

**Success Response — `200 OK` (OTP flow):**

```json
{
    "success": true,
    "message": "OTP has been sent to your email.",
    "data": {
        "email": "staff@facility.org",
        "otpRequired": true,
        "twoStepRequired": true
    }
}
```

**Error Responses:**

| Status | Message                                       | Condition                                             |
| ------ | --------------------------------------------- | ----------------------------------------------------- |
| `400`  | `"Account not activated, check invite link."` | Account status is `INACTIVE`, `PENDING`, or `INVITED` |
| `401`  | `"Invalid credentials"`                       | User not found or wrong password                      |
| `403`  | `"Please contact your administrator."`        | Account is `SUSPENDED` or `DEACTIVATED`               |
| `500`  | `"Unable to send OTP email."`                 | SMTP delivery failure                                 |

```json
{ "statusCode": 401, "message": "Invalid credentials", "error": "Unauthorized" }
```

**Validation Rules:**

- `identifier`: required, string, max 255 chars
- `password`: required, string

---

### 1.2 Verify OTP

| Field             | Value                        |
| ----------------- | ---------------------------- |
| **API Name**      | Verify OTP                   |
| **Screen**        | Two-Step Verification Screen |
| **Method**        | `POST`                       |
| **Endpoint**      | `/api/auth/verify-otp`       |
| **Auth Required** | No                           |

**Description:** Validates the 6-digit OTP sent to the user's email. This is the **only** endpoint that issues JWTs and updates `last_login_at`.

**Request Body:**

| Field   | Type   | Required | Validation                     | Example                |
| ------- | ------ | -------- | ------------------------------ | ---------------------- |
| `email` | string | Yes      | Valid email format             | `"staff@facility.org"` |
| `otp`   | string | Yes      | Exactly 6 digits, numeric only | `"123456"`             |

```json
{ "email": "staff@facility.org", "otp": "123456" }
```

**Success Response — `200 OK`:**

```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "token": "eyJhbGci...",
        "accessToken": "eyJhbGci...",
        "refreshToken": "eyJhbGci...",
        "user": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "email": "staff@facility.org",
            "employeeCode": "EMP001",
            "firstName": "John",
            "middleName": null,
            "lastName": "Doe",
            "phoneNumber": "+15550001234",
            "roleId": "1",
            "roleName": "Administrator",
            "status": "ACTIVE",
            "mfaEnabled": true
        }
    }
}
```

**Error Responses:**

| Status | Message                                                    | Condition                          |
| ------ | ---------------------------------------------------------- | ---------------------------------- |
| `400`  | `"OTP session not found or expired. Please log in again."` | No active OTP session              |
| `400`  | `"OTP has expired. Please request a new one."`             | OTP TTL (5 min) elapsed            |
| `400`  | `"Invalid OTP code. N attempt(s) remaining."`              | Wrong OTP, attempts < 5            |
| `400`  | `"Too many incorrect attempts. Please log in again."`      | 5 wrong attempts                   |
| `401`  | `"User not found."`                                        | User deleted between login and OTP |
| `403`  | `"Please contact your administrator."`                     | Account blocked after OTP sent     |

**Validation Rules:**

- `email`: required, valid email format
- `otp`: required, exactly 6 digits (`/^\d{6}$/`), max 5 incorrect attempts

---

### 1.3 Resend OTP

| Field             | Value                        |
| ----------------- | ---------------------------- |
| **API Name**      | Resend OTP                   |
| **Screen**        | Two-Step Verification Screen |
| **Method**        | `POST`                       |
| **Endpoint**      | `/api/auth/resend-otp`       |
| **Auth Required** | No                           |

**Description:** Invalidates the current OTP, generates a new one, resets the 5-minute expiry, and sends the new OTP to the user's email.

**Request Body:**

| Field   | Type   | Required | Validation         | Example                |
| ------- | ------ | -------- | ------------------ | ---------------------- |
| `email` | string | Yes      | Valid email format | `"staff@facility.org"` |

```json
{ "email": "staff@facility.org" }
```

**Success Response — `200 OK`:**

```json
{ "success": true, "message": "A new OTP has been sent to your email." }
```

**Error Responses:**

| Status | Message                                            | Condition                  |
| ------ | -------------------------------------------------- | -------------------------- |
| `400`  | `"No active OTP session. Please log in again."`    | No session exists          |
| `400`  | `"OTP session has expired. Please log in again."`  | Session TTL elapsed        |
| `429`  | `"Too many resend requests. Please log in again."` | ≥ 3 resends in one session |

---

### 1.4 Get Activation Context

| Field             | Value                                                |
| ----------------- | ---------------------------------------------------- |
| **API Name**      | Get Activation Context                               |
| **Screen**        | Activate Account Screen (page load)                  |
| **Method**        | `GET`                                                |
| **Endpoint**      | `/api/auth/activate` or `/api/auth/activate-context` |
| **Auth Required** | No                                                   |

**Description:** Validates the activation link before rendering the form. Returns the user's email (read-only) and pre-filled phone number if admin provided one.

**Request Query Parameters:**

| Param   | Type   | Required | Description                                          | Example              |
| ------- | ------ | -------- | ---------------------------------------------------- | -------------------- |
| `email` | string | Yes      | User's email address                                 | `staff@facility.org` |
| `code`  | string | Yes      | One-time activation code (stored in `licenseNumber`) | `ACT123`             |

**Success Response — `200 OK`:**

```json
{
    "success": true,
    "data": {
        "email": "new.staff@facility.org",
        "phoneNumber": null
    }
}
```

**Error Responses:**

| Status | Message                                                  | Condition                                         |
| ------ | -------------------------------------------------------- | ------------------------------------------------- |
| `400`  | `"Invalid or expired activation link."`                  | User not found, code mismatch, or link > 24 h old |
| `400`  | `"Account is already activated or cannot be activated."` | User status is not INACTIVE/PENDING/INVITED       |

---

### 1.5 Activate Account

| Field             | Value                   |
| ----------------- | ----------------------- |
| **API Name**      | Activate Account        |
| **Screen**        | Activate Account Screen |
| **Method**        | `POST`                  |
| **Endpoint**      | `/api/auth/activate`    |
| **Auth Required** | No                      |

**Description:** Completes account activation. Sets password, phone number, changes status to `ACTIVE`, enables MFA. Does **not** log the user in or issue JWT.

**Request Body:**

| Field            | Type   | Required | Validation                                        | Example                    |
| ---------------- | ------ | -------- | ------------------------------------------------- | -------------------------- |
| `email`          | string | Yes      | Valid email                                       | `"new.staff@facility.org"` |
| `activationCode` | string | Yes      | Non-empty                                         | `"ACT123"`                 |
| `password`       | string | Yes      | Min 8 chars, ≥1 uppercase, ≥1 lowercase, ≥1 digit | `"P@ssword1"`              |
| `phoneNumber`    | string | Yes      | E.164 format (`+` + 7–15 digits)                  | `"+15550001234"`           |

```json
{
    "email": "new.staff@facility.org",
    "activationCode": "ACT123",
    "password": "P@ssword1",
    "phoneNumber": "+15550001234"
}
```

**Success Response — `200 OK`:**

```json
{ "success": true, "message": "Account activated successfully. Please login." }
```

**Error Responses:**

| Status | Message                                                  | Condition                           |
| ------ | -------------------------------------------------------- | ----------------------------------- |
| `400`  | `"Invalid or expired activation link."`                  | Bad code, wrong email, or > 24h     |
| `400`  | `"Account is already activated or cannot be activated."` | Status not INACTIVE/PENDING/INVITED |
| `400`  | `"Phone number is required for activation."`             | No phone in DB and none provided    |
| `422`  | Validation error array                                   | Password/phone format violations    |

**Validation Rules:**

- `email`: required, valid email format
- `activationCode`: required, non-empty string
- `password`: min length 8, must match `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/`
- `phoneNumber`: must match `/^\+\d{7,15}$/` (E.164)

---

### 1.6 Refresh Token

| Field             | Value                                        |
| ----------------- | -------------------------------------------- |
| **API Name**      | Refresh Token                                |
| **Screen**        | (Background — token renewal)                 |
| **Method**        | `POST`                                       |
| **Endpoint**      | `/api/auth/refresh`                          |
| **Auth Required** | Yes — `Authorization: Bearer <refreshToken>` |

**Description:** Issues a new `accessToken` and `refreshToken` pair using a valid refresh token. The refresh token expires in 7 days; the access token in 24 hours.

**Request Headers:**

| Header          | Value                   |
| --------------- | ----------------------- |
| `Authorization` | `Bearer <refreshToken>` |

**Success Response — `200 OK`:**

```json
{
    "success": true,
    "message": "Tokens refreshed successfully.",
    "data": {
        "accessToken": "eyJhbGci...",
        "refreshToken": "eyJhbGci..."
    }
}
```

**Error Responses:**

| Status | Message                              | Condition                                |
| ------ | ------------------------------------ | ---------------------------------------- |
| `401`  | `"Refresh token is missing"`         | No Bearer token                          |
| `401`  | `"Invalid or expired refresh token"` | Token invalid, expired, or user inactive |

---

### 1.7 Logout

| Field             | Value                                       |
| ----------------- | ------------------------------------------- |
| **API Name**      | Logout                                      |
| **Screen**        | Any authenticated screen                    |
| **Method**        | `POST`                                      |
| **Endpoint**      | `/api/auth/logout`                          |
| **Auth Required** | Yes — `Authorization: Bearer <accessToken>` |

**Description:** Clears the in-memory OTP session for the user. JWT invalidation is handled client-side (discard tokens from storage).

**Request Headers:**

| Header          | Value                  |
| --------------- | ---------------------- |
| `Authorization` | `Bearer <accessToken>` |

**Success Response — `200 OK`:**

```json
{ "success": true, "message": "Logged out successfully." }
```

**Error Responses:**

| Status | Message                             | Condition                |
| ------ | ----------------------------------- | ------------------------ |
| `401`  | `"Access token is missing"`         | No Bearer token          |
| `401`  | `"Invalid or expired access token"` | Token invalid or expired |

---

### 1.8 Get Current User (Me / Profile)

| Field             | Value                                       |
| ----------------- | ------------------------------------------- |
| **API Name**      | Get Current User                            |
| **Screen**        | Any authenticated screen (header/profile)   |
| **Method**        | `GET`                                       |
| **Endpoint**      | `/api/auth/me` or `/api/auth/profile`       |
| **Auth Required** | Yes — `Authorization: Bearer <accessToken>` |

**Description:** Returns the authenticated user's profile data. Both `/me` and `/profile` return identical data.

**Request Headers:**

| Header          | Value                  |
| --------------- | ---------------------- |
| `Authorization` | `Bearer <accessToken>` |

**Success Response — `200 OK`:**

```json
{
    "success": true,
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "staff@facility.org",
        "employeeCode": "EMP001",
        "firstName": "John",
        "middleName": null,
        "lastName": "Doe",
        "phoneNumber": "+15550001234",
        "roleId": "1",
        "roleName": "Administrator",
        "status": "ACTIVE",
        "mfaEnabled": true
    }
}
```

**Error Responses:**

| Status | Message                             | Condition                       |
| ------ | ----------------------------------- | ------------------------------- |
| `401`  | `"Access token is missing"`         | No Bearer token                 |
| `401`  | `"Invalid or expired access token"` | Token invalid or expired        |
| `401`  | `"User not found."`                 | User deleted after token issued |

---

## 2. Common Error Responses

All error responses follow NestJS's default exception filter format:

```json
{
  "statusCode": <number>,
  "message": "<string or string[]>",
  "error": "<string>"
}
```

| Status | Error                   | Description                                  | Example Message                                       |
| ------ | ----------------------- | -------------------------------------------- | ----------------------------------------------------- |
| `400`  | `Bad Request`           | Validation failure or invalid business logic | `"Password must be at least 8 characters"`            |
| `401`  | `Unauthorized`          | Missing or invalid authentication token      | `"Access token is missing"`                           |
| `403`  | `Forbidden`             | Token valid but insufficient permissions     | `"You do not have permission to perform this action"` |
| `404`  | `Not Found`             | Resource does not exist                      | `"User with ID xyz not found"`                        |
| `409`  | `Conflict`              | Duplicate resource                           | `"Email is already registered"`                       |
| `422`  | `Unprocessable Entity`  | Class-validator constraint failure (nested)  | Array of constraint messages                          |
| `429`  | `Too Many Requests`     | Rate limit exceeded                          | `"Too many resend requests. Please log in again."`    |
| `500`  | `Internal Server Error` | Unexpected server error                      | `"Unable to send OTP email."`                         |

**Example — 400 Validation Error (class-validator):**

```json
{
    "statusCode": 400,
    "message": ["password must be longer than or equal to 8 characters", "phoneNumber must match /^\\+\\d{7,15}$/ regular expression"],
    "error": "Bad Request"
}
```

**Example — 401 Unauthorized:**

```json
{ "statusCode": 401, "message": "Access token is missing", "error": "Unauthorized" }
```

**Example — 404 Not Found:**

```json
{ "statusCode": 404, "message": "Resident with ID abc not found", "error": "Not Found" }
```

---

## 3. Users

> **Owner:** Member 3
> **Auth Required:** All endpoints — No auth guard currently applied (subject to change)

---

### 3.1 Create User

| Field        | Value        |
| ------------ | ------------ |
| **Method**   | `POST`       |
| **Endpoint** | `/api/users` |

**Request Body:**

| Field         | Type   | Required | Validation                           | Example                   |
| ------------- | ------ | -------- | ------------------------------------ | ------------------------- |
| `firstName`   | string | Yes      | Min 2 chars                          | `"John"`                  |
| `lastName`    | string | Yes      | Min 2 chars                          | `"Doe"`                   |
| `email`       | string | Yes      | Valid email                          | `"john.doe@facility.org"` |
| `phoneNumber` | string | No       | —                                    | `"+14155550100"`          |
| `roleId`      | number | Yes      | Non-empty                            | `1`                       |
| `status`      | string | Yes      | Enum: `ACTIVE`, `INACTIVE`, `LOCKED` | `"ACTIVE"`                |
| `facilityId`  | string | No       | UUID                                 | `"uuid-here"`             |

**Success Response — `201 Created`:**

```json
{
    "id": "uuid",
    "employeeCode": "EMP-123456",
    "email": "john.doe@facility.org",
    "firstName": "John",
    "lastName": "Doe",
    "status": "ACTIVE",
    "role": { "id": "1", "roleName": "Nurse (RN/LPN)" }
}
```

**Error Responses:**

| Status | Message                         |
| ------ | ------------------------------- |
| `400`  | `"Email is already registered"` |

---

### 3.2 List Users

| Field        | Value        |
| ------------ | ------------ |
| **Method**   | `GET`        |
| **Endpoint** | `/api/users` |

**Query Parameters:**

| Param    | Type   | Default | Description                                    |
| -------- | ------ | ------- | ---------------------------------------------- |
| `page`   | number | `1`     | Page number                                    |
| `limit`  | number | `10`    | Items per page                                 |
| `search` | string | —       | Filter by name, email, phone, or employee code |

**Success Response — `200 OK`:**

```json
{
    "data": [{ "id": "...", "email": "...", "status": "ACTIVE" }],
    "meta": { "total": 50, "page": 1, "limit": 10, "totalPages": 5 }
}
```

---

### 3.3 Get User by ID

| Method | Endpoint         |
| ------ | ---------------- |
| `GET`  | `/api/users/:id` |

**Success Response — `200 OK`:** Full user object with role and facilities.
**Error:** `404` if not found.

---

### 3.4 Update User

| Method | Endpoint         |
| ------ | ---------------- |
| `PUT`  | `/api/users/:id` |

**Request Body:** Same fields as `CreateUserDto`, all optional.
**Error:** `400` if email already taken, `404` if not found.

---

### 3.5 Update User Status

| Method  | Endpoint                |
| ------- | ----------------------- |
| `PATCH` | `/api/users/:id/status` |

**Request Body:**

```json
{ "status": "ACTIVE" }
```

**Valid Status Values:** `ACTIVE`, `INACTIVE`, `LOCKED`

---

## 4. Roles & Permissions

> **Owner:** Member 3
> **Auth Required:** No guard currently on controller

| Method | Endpoint                     | Description                        |
| ------ | ---------------------------- | ---------------------------------- |
| `GET`  | `/api/roles`                 | List all roles                     |
| `GET`  | `/api/permissions`           | List all permissions               |
| `GET`  | `/api/roles/:id/permissions` | Get permissions assigned to a role |
| `PUT`  | `/api/roles/:id/permissions` | Update permissions for a role      |

**Update Role Permissions — Request Body:**

```json
{ "permissions": ["VIEW_PATIENTS", "EDIT_PATIENTS"] }
```

**Error:** `404` if role not found.

---

## 5. Facilities

> **Owner:** Member 4
> **Auth Required:** `AccessTokenGuard` on all endpoints

---

### 5.1 List Facilities

| Method | Endpoint          |
| ------ | ----------------- |
| `GET`  | `/api/facilities` |

Returns list of all non-deleted facilities.

---

### 5.2 Get Primary Facility Settings (Current)

| Method | Endpoint                           |
| ------ | ---------------------------------- |
| `GET`  | `/api/facilities/settings/current` |

Returns the primary facility with rooms, beds, capabilities, and room rates.

**Success Response — `200 OK`:**

```json
{
    "id": "uuid",
    "facilityCode": "FAC-001",
    "name": "NHMS Demo SNF",
    "licenseNumber": "CA-SNF-004821",
    "targetState": "CA",
    "phoneNumber": "+14155550142",
    "timezone": "America/Los_Angeles",
    "address": { "streetLine1": "123 Main St", "city": "San Francisco", "state": "CA", "zipCode": "94102" },
    "rooms": [{ "id": "uuid", "wing": "Wing A", "roomNumber": "101", "roomType": "Private", "beds": [] }],
    "capabilities": [{ "code": "wound-care", "label": "Wound Care", "supported": true }],
    "updatedAt": "2026-07-15T00:00:00.000Z"
}
```

**Error:** `404` `"Facility settings not found. Please run the Prisma seed first."`

---

### 5.3 Get Facility Settings by ID

| Method | Endpoint                       |
| ------ | ------------------------------ |
| `GET`  | `/api/facilities/:id/settings` |

Same response shape as 5.2 but for a specific facility.

---

### 5.4 Get Admin Facility Settings

| Method | Endpoint                 |
| ------ | ------------------------ |
| `GET`  | `/api/facility/settings` |

Returns facility data with room summary, room rates, and capabilities (used by administration screen).

---

### 5.5 Update Admin Facility Settings

| Method | Endpoint                 |
| ------ | ------------------------ |
| `PUT`  | `/api/facility/settings` |

**Request Body:** `UpdateFacilitySettingsDto` (simple):

| Field           | Type                              | Required |
| --------------- | --------------------------------- | -------- |
| `name`          | string                            | No       |
| `licenseNumber` | string                            | No       |
| `targetState`   | string                            | No       |
| `timezone`      | string                            | No       |
| `phoneNumber`   | string                            | No       |
| `rooms`         | `FacilityRoomDto[]`               | No       |
| `roomRates`     | `FacilityRoomRateDto[]`           | No       |
| `capabilities`  | `FacilityClinicalCapabilityDto[]` | No       |

---

### 5.6 Update Detailed Facility Settings

| Method | Endpoint                       |
| ------ | ------------------------------ |
| `PUT`  | `/api/facilities/:id/settings` |

Same as 5.5 but requires `address` (nested DTO) and `capabilities` as required fields.

---

### 5.7 Add Room to Facility

| Method | Endpoint                    |
| ------ | --------------------------- |
| `POST` | `/api/facilities/:id/rooms` |

**Request Body:**

| Field        | Type   | Required | Validation                                     |
| ------------ | ------ | -------- | ---------------------------------------------- |
| `roomNumber` | string | Yes      | Non-empty                                      |
| `roomType`   | string | Yes      | Non-empty (e.g. `"Private"`, `"Semi-Private"`) |
| `bedCount`   | number | Yes      | Integer ≥ 1                                    |

---

### 5.8 Get Facility Capabilities

| Method | Endpoint                           |
| ------ | ---------------------------------- |
| `GET`  | `/api/facilities/:id/capabilities` |

Returns clinical capabilities for a facility (used by pre-admission screening).

---

## 6. Residents

> **Owner:** Member 7
> **Auth Required:** No guard currently on controller (recommended to add)

---

### 6.1 List Residents

| Method | Endpoint         |
| ------ | ---------------- |
| `GET`  | `/api/residents` |

**Query Parameters:**

| Param       | Type   | Default | Description                                                              |
| ----------- | ------ | ------- | ------------------------------------------------------------------------ |
| `page`      | number | `1`     | Page number                                                              |
| `limit`     | number | `10`    | Items per page                                                           |
| `search`    | string | —       | Search by name                                                           |
| `status`    | string | —       | Enum: `pending`, `under_evaluation`, `admitted`, `discharged`            |
| `careLevel` | string | —       | Enum: `independent`, `assisted_living`, `memory_care`, `skilled_nursing` |

**Success Response — `200 OK`:**

```json
{
    "data": [{ "id": "uuid", "residentCode": "NH-XXXX", "fullName": "Eleanor Rigby", "status": "admitted" }],
    "meta": { "total": 100, "page": 1, "limit": 10, "totalPages": 10 }
}
```

---

### 6.2 Get Resident by ID

| Method | Endpoint             |
| ------ | -------------------- |
| `GET`  | `/api/residents/:id` |

**Error:** `404` if not found.

---

### 6.3 Create Resident

| Method | Endpoint         |
| ------ | ---------------- |
| `POST` | `/api/residents` |

**Request Body (required fields):**

| Field                   | Type   | Validation                                                               |
| ----------------------- | ------ | ------------------------------------------------------------------------ |
| `fullName`              | string | Min 2 chars                                                              |
| `dateOfBirth`           | string | ISO 8601 (`YYYY-MM-DD`)                                                  |
| `gender`                | string | Enum: `male`, `female`, `other`                                          |
| `admissionDate`         | string | ISO 8601                                                                 |
| `roomNumber`            | string | Non-empty                                                                |
| `careLevel`             | string | Enum: `independent`, `assisted_living`, `memory_care`, `skilled_nursing` |
| `emergencyContactName`  | string | Min 2 chars                                                              |
| `emergencyContactPhone` | string | Min 7 chars                                                              |

---

### 6.4 Update Resident

| Method | Endpoint             |
| ------ | -------------------- |
| `PUT`  | `/api/residents/:id` |

**Error:** `403` `"Resident chart is locked."` if chart is locked.

---

### 6.5 Update Resident Status

| Method  | Endpoint                    |
| ------- | --------------------------- |
| `PATCH` | `/api/residents/:id/status` |

**Request Body:**

```json
{ "status": "admitted" }
```

**Valid Values:** `pending`, `under_evaluation`, `admitted`, `discharged`

---

## 7. Admissions & Pre-Screening

> **Owner:** Member 8
> **Auth Required:** `AccessTokenGuard`

---

### 7.1 Create Pre-Admission Screening

| Method | Endpoint                        |
| ------ | ------------------------------- |
| `POST` | `/api/admissions/pre-screening` |

**Request Body (nested):**

```json
{
    "personalInfo": {
        "fullName": "Eleanor Rigby",
        "dateOfBirth": "1942-08-18",
        "gender": "female",
        "phone": "(415) 555-0128",
        "address": "123 Mission St"
    },
    "admissionInfo": {
        "admissionDate": "2026-07-10",
        "roomNumber": "A-104",
        "careLevel": "assisted_living",
        "assignedNurse": "Sarah Johnson, RN",
        "assignedDoctor": "Dr. Michael Brown"
    },
    "emergencyContact": {
        "name": "Paul Rigby",
        "relationship": "Son",
        "phone": "(415) 555-0199",
        "email": "paul.rigby@example.com"
    },
    "medicalSummary": {
        "primaryDiagnosis": "Hypertension",
        "allergies": "Penicillin",
        "currentMedications": "Metformin 500mg",
        "mobilityStatus": "walker"
    },
    "initialEvaluation": {
        "cognitiveStatus": "mild_impairment",
        "fallRisk": "medium",
        "painLevel": 3,
        "clinicalNotes": "Requires review."
    }
}
```

**Validation:**

- `personalInfo.fullName`: min 2 chars
- `personalInfo.dateOfBirth`: ISO 8601
- `personalInfo.gender`: enum `male | female | other`
- `admissionInfo.admissionDate`: ISO 8601
- `admissionInfo.careLevel`: enum `independent | assisted_living | memory_care | skilled_nursing`
- `emergencyContact.phone`: min 7 chars
- `initialEvaluation.painLevel`: integer 0–10
- `initialEvaluation.fallRisk`: enum `low | medium | high`
- `initialEvaluation.cognitiveStatus`: enum `alert_oriented | mild_impairment | moderate_impairment | severe_impairment`

---

### 7.2 Create Admission

| Method | Endpoint          |
| ------ | ----------------- |
| `POST` | `/api/admissions` |

**Request Body:**

| Field              | Type     | Required | Description                     |
| ------------------ | -------- | -------- | ------------------------------- |
| `residentId`       | string   | Yes      | UUID of resident                |
| `facilityId`       | string   | Yes      | UUID of facility                |
| `bedId`            | string   | No       | UUID of bed                     |
| `admissionDate`    | string   | Yes      | ISO 8601                        |
| `payerSource`      | string   | Yes      | e.g. `"Medicare"`, `"Medicaid"` |
| `policyNumber`     | string   | No       | Insurance policy number         |
| `primaryPhysician` | string   | No       | Name                            |
| `nurseInCharge`    | string   | No       | Name                            |
| `consents`         | string[] | Yes      | Array of consent identifiers    |

---

### 7.3 Get Admission History for Resident

| Method | Endpoint                               |
| ------ | -------------------------------------- |
| `GET`  | `/api/admissions/resident/:residentId` |

---

## 8. Assessments & LOC

> **Owner:** Member 8
> **Auth Required:** `AccessTokenGuard`

---

### 8.1 Create Assessment

| Method | Endpoint           |
| ------ | ------------------ |
| `POST` | `/api/assessments` |

**Request Body:**

| Field           | Type                    | Required | Validation             |
| --------------- | ----------------------- | -------- | ---------------------- |
| `residentId`    | string                  | Yes      | Non-empty              |
| `metrics`       | `AssessmentMetricDto[]` | Yes      | Array of metric scores |
| `clinicalNotes` | string                  | No       | —                      |

Each metric in `metrics`:

| Field        | Type   | Required | Validation   |
| ------------ | ------ | -------- | ------------ |
| `category`   | string | Yes      | Non-empty    |
| `metricName` | string | Yes      | Non-empty    |
| `score`      | number | Yes      | Integer 0–10 |
| `notes`      | string | No       | —            |

---

### 8.2 Get Assessment History

| Method | Endpoint                                |
| ------ | --------------------------------------- |
| `GET`  | `/api/assessments/resident/:residentId` |

---

### 8.3 Get Latest LOC Classification

| Method | Endpoint                                                      |
| ------ | ------------------------------------------------------------- |
| `GET`  | `/api/assessments/resident/:residentId/latest-classification` |

---

### 8.4 Confirm or Override LOC

| Method | Endpoint                           |
| ------ | ---------------------------------- |
| `POST` | `/api/assessments/:id/confirm-loc` |

**Request Body:**

| Field            | Type    | Required    | Validation                                  |
| ---------------- | ------- | ----------- | ------------------------------------------- |
| `careLevelId`    | string  | Yes         | Non-empty                                   |
| `isOverride`     | boolean | No          | —                                           |
| `overrideReason` | string  | Conditional | Required if `isOverride=true`, min 20 chars |

---

### 8.5 Create Reassessment

| Method | Endpoint             |
| ------ | -------------------- |
| `POST` | `/api/reassessments` |

Same as Create Assessment plus:

| Field           | Type   | Required |
| --------------- | ------ | -------- |
| `carePlanId`    | string | Yes      |
| `reason`        | string | Yes      |
| `goals`         | array  | No       |
| `interventions` | array  | No       |

---

### 8.6 Get LOC History for Resident

| Method | Endpoint                                 |
| ------ | ---------------------------------------- |
| `GET`  | `/api/residents/:residentId/loc-history` |
