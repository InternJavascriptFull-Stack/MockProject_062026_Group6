# User Status Descriptions

This document outlines the valid statuses for a User account in the NHMS system and their effects.

## Valid Statuses

### 1. ACTIVE
- **Description:** The user account is in good standing.
- **System Behavior:** The user is fully allowed to log in, receive access tokens, and perform operations based on their assigned role's permissions.

### 2. INACTIVE
- **Description:** The user account has been deactivated manually by an administrator.
- **System Behavior:** 
  - The user is completely blocked from logging in. 
  - Any active sessions or tokens associated with this user should be immediately invalidated or rejected by the system.
  - The user's historical data remains in the system for auditing purposes.

### 3. LOCKED
- **Description:** The user account has been temporarily locked by the system's security policies.
- **System Behavior:**
  - Usually triggered automatically after a certain number of failed login attempts, or by a security administrator.
  - The user cannot log in until an Administrator explicitly unlocks the account (changing the status back to `ACTIVE`).
