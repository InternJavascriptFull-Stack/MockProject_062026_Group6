# Authentication Module API Documentation

This document describes the APIs implemented for the Authentication module of the Nursing Home Management System (NHMS).

---

## 1. Authentication Status (Get Current User)

* **API Name**: Get Current Authenticated User Info
* **Screen**: SC_001 Login, Global App Routing
* **Method**: `GET`
* **Endpoint**: `/api/auth/me`
* **Description**: Returns details of the currently authenticated user based on the provided JWT token.
* **Authentication**: Required (`Bearer <JWT_TOKEN>`)
* **Request Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Request Body**: None
* **Success Response**:
  - **HTTP Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "success": true,
      "message": "Success",
      "data": {
        "id": 1,
        "email": "admin@facility.org",
        "phoneNumber": "+1 555 000 1234",
        "status": "ACTIVE"
      }
    }
    ```
* **Error Response**:
  - **HTTP Status Code**: `401 Unauthorized`
  - **Body**:
    ```json
    {
      "success": false,
      "message": "Access token is missing"
    }
    ```
  - **HTTP Status Code**: `401 Unauthorized`
  - **Body**:
    ```json
    {
      "success": false,
      "message": "Invalid or expired access token"
    }
    ```
* **Validation Rules**:
  - Authorization header must contain a valid, unexpired Bearer token.
* **Example Request**:
  ```http
  GET /api/auth/me HTTP/1.1
  Host: localhost:3000
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
* **Example Response**:
  ```http
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "success": true,
    "message": "Success",
    "data": {
      "id": 2,
      "email": "j.rivera@facility.org",
      "phoneNumber": "+1 555 000 5678",
      "status": "ACTIVE"
    }
  }
  ```
* **Owner**: Backend Team / Frontend Integrator

---

## 2. User Sign In

* **API Name**: User Login
* **Screen**: SC_001 Login
* **Method**: `POST`
* **Endpoint**: `/api/auth/login`
* **Description**: Authenticates users with their email and password. Generates a 6-digit OTP code if authentication succeeds and stores it with an expiration timestamp.
* **Authentication**: None
* **Request Headers**:
  ```http
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "email": "admin@facility.org",
    "password": "Password123"
  }
  ```
* **Success Response**:
  - **HTTP Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "success": true,
      "message": "OTP sent to your phone",
      "data": {
        "email": "admin@facility.org",
        "twoStepRequired": true,
        "tempCode": "583920"
      }
    }
    ```
* **Error Response**:
  - **HTTP Status Code**: `400 BadRequest`
    - **Body**:
      ```json
      {
        "success": false,
        "message": "Account is pending activation. Please activate your account first."
      }
      ```
  - **HTTP Status Code**: `401 Unauthorized`
    - **Body**:
      ```json
      {
        "success": false,
        "message": "Invalid email or password"
      }
      ```
    - **Body**:
      ```json
      {
        "success": false,
        "message": "Account is disabled. Please contact administrator."
      }
      ```
* **Validation Rules**:
  - `email`: Required, must be a valid email format.
  - `password`: Required, must be a string.
* **Example Request**:
  ```http
  POST /api/auth/login HTTP/1.1
  Host: localhost:3000
  Content-Type: application/json

  {
    "email": "admin@facility.org",
    "password": "Password123"
  }
  ```
* **Example Response**:
  ```http
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "success": true,
    "message": "OTP sent to your phone",
    "data": {
      "email": "admin@facility.org",
      "twoStepRequired": true,
      "tempCode": "748392"
    }
  }
  ```
* **Owner**: Backend Team / Frontend Integrator

---

## 3. Two-Step OTP Verification

* **API Name**: Verify OTP
* **Screen**: SC_003 Two-step Verification
* **Method**: `POST`
* **Endpoint**: `/api/auth/verify-otp`
* **Description**: Validates the 6-digit OTP code sent to the user's phone. Upon success, returns a JWT access token valid for 24 hours.
* **Authentication**: None
* **Request Headers**:
  ```http
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "email": "admin@facility.org",
    "otp": "748392"
  }
  ```
* **Success Response**:
  - **HTTP Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "success": true,
      "message": "Verification successful",
      "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
          "id": 1,
          "email": "admin@facility.org",
          "phoneNumber": "+1 555 000 1234",
          "status": "ACTIVE"
        }
      }
    }
    ```
* **Error Response**:
  - **HTTP Status Code**: `400 BadRequest`
    - **Body**:
      ```json
      {
        "success": false,
        "message": "OTP verification session invalid or expired"
      }
      ```
    - **Body**:
      ```json
      {
        "success": false,
        "message": "OTP has expired"
      }
      ```
    - **Body**:
      ```json
      {
        "success": false,
        "message": "Invalid OTP code"
      }
      ```
* **Validation Rules**:
  - `email`: Required, must be a valid email format.
  - `otp`: Required, must be exactly 6 numeric digits.
* **Example Request**:
  ```http
  POST /api/auth/verify-otp HTTP/1.1
  Host: localhost:3000
  Content-Type: application/json

  {
    "email": "admin@facility.org",
    "otp": "748392"
  }
  ```
* **Example Response**:
  ```http
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "success": true,
    "message": "Verification successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "email": "admin@facility.org",
        "phoneNumber": "+1 555 000 1234",
        "status": "ACTIVE"
      }
    }
  }
  ```
* **Owner**: Backend Team / Frontend Integrator

---

## 4. Account Activation

* **API Name**: Activate User Account
* **Screen**: SC_002 Account Activation
* **Method**: `POST`
* **Endpoint**: `/api/auth/activate`
* **Description**: Activates a pending/invited user account by assigning a custom password, setting their phone number for 2FA, changing status to `ACTIVE`, and clearing the temporary activation invitation code.
* **Authentication**: None
* **Request Headers**:
  ```http
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "email": "j.rivera@facility.org",
    "activationCode": "ACT123",
    "password": "Password123",
    "phoneNumber": "+1 555 000 5678"
  }
  ```
* **Success Response**:
  - **HTTP Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "success": true,
      "message": "Account activated successfully"
    }
    ```
* **Error Response**:
  - **HTTP Status Code**: `400 BadRequest`
    - **Body**:
      ```json
      {
        "success": false,
        "message": "User not found"
      }
      ```
    - **Body**:
      ```json
      {
        "success": false,
        "message": "Invalid activation code or account already activated"
      }
      ```
* **Validation Rules**:
  - `email`: Required, valid email format.
  - `activationCode`: Required.
  - `password`: Required, must be at least 8 characters, contain mixed case (uppercase and lowercase) and at least one number.
  - `phoneNumber`: Required.
* **Example Request**:
  ```http
  POST /api/auth/activate HTTP/1.1
  Host: localhost:3000
  Content-Type: application/json

  {
    "email": "j.rivera@facility.org",
    "activationCode": "ACT123",
    "password": "Password123",
    "phoneNumber": "+1 555 000 5678"
  }
  ```
* **Example Response**:
  ```http
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "success": true,
    "message": "Account activated successfully"
  }
  ```
* **Owner**: Backend Team / Frontend Integrator

---

## 5. User Sign Out

* **API Name**: User Logout
* **Screen**: Global Header
* **Method**: `POST`
* **Endpoint**: `/api/auth/logout`
* **Description**: Demo sign-out endpoint.
* **Authentication**: None Required
* **Request Headers**: None
* **Request Body**: None
* **Success Response**:
  - **HTTP Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "success": true,
      "message": "Logged out successfully"
    }
    ```
* **Error Response**: None
* **Example Request**:
  ```http
  POST /api/auth/logout HTTP/1.1
  Host: localhost:3000
  ```
* **Example Response**:
  ```http
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```
* **Owner**: Backend Team / Frontend Integrator
