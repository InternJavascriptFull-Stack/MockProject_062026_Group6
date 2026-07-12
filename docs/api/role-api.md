# Role API Document

## Base URL
`/api/roles`

---

## 1. Get All Roles
- **Method:** `GET`
- **Endpoint:** `/`
- **Description:** Retrieves all active roles in the system.
- **Responses:**
  - `200 OK`: Returns an array of role objects.
    - `id`: Unique identifier (BigInt format)
    - `roleName`: Name of the role (e.g., "System Admin", "Facility Manager")
    - `description`: Detailed description of the role's purpose
