# User API Documentation

This document describes the REST APIs for managing Users in the NHMS system.

## Base URL
`/api/users`

---

## 1. Get All Users
- **Method:** `GET`
- **Endpoint:** `/`
- **Description:** Retrieves a paginated list of all users, with optional search by email/phone.
- **Query Parameters:**
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `search` (optional): Search string for email or phone
- **Responses:**
  - `200 OK`: Returns an array of users and pagination metadata.
  - `401 Unauthorized`: Authentication required.

## 2. Get User by ID
- **Method:** `GET`
- **Endpoint:** `/:id`
- **Description:** Retrieves full details of a specific user.
- **Path Parameters:**
  - `id`: The UUID of the user.
- **Responses:**
  - `200 OK`: Returns the user object.
  - `404 Not Found`: User does not exist.

## 3. Create User
- **Method:** `POST`
- **Endpoint:** `/`
- **Description:** Creates a new user in the system.
- **Body Payload (JSON):**
  - `firstName` (string, required): Minimum 2 characters.
  - `lastName` (string, required): Minimum 2 characters.
  - `email` (string, required): Must be a valid email format.
  - `roleId` (number, required): The ID of the assigned role.
  - `status` (enum, required): `ACTIVE`, `INACTIVE`, `LOCKED`.
- **Validation Rules:**
  - Email must be unique.
  - Full Name (first + last) must be valid.
- **Responses:**
  - `201 Created`: Returns the newly created user.
  - `400 Bad Request`: Validation failed.

## 4. Update User
- **Method:** `PUT`
- **Endpoint:** `/:id`
- **Description:** Fully updates an existing user's information.
- **Path Parameters:**
  - `id`: The UUID of the user.
- **Body Payload (JSON):** Same as Create User.
- **Responses:**
  - `200 OK`: User updated successfully.
  - `404 Not Found`: User does not exist.

## 5. Update User Status
- **Method:** `PATCH`
- **Endpoint:** `/:id/status`
- **Description:** Updates only the status of a specific user.
- **Path Parameters:**
  - `id`: The UUID of the user.
- **Body Payload (JSON):**
  - `status` (enum, required): `ACTIVE`, `INACTIVE`, `LOCKED`.
- **Responses:**
  - `200 OK`: Status updated successfully.
  - `400 Bad Request`: Invalid status value.

---

## Enums
### User Status
- `ACTIVE`: User can log in and access the system.
- `INACTIVE`: User account is deactivated and cannot log in.
- `LOCKED`: User account is temporarily locked (e.g., due to failed login attempts).
