# Coding Standards & Guidelines

This document defines the coding standards, naming conventions, formatting guidelines, and Git branch workflows for the **MockProject_Group6** repository. Adhering to these standards ensures code readability, maintainability, and consistent collaboration across the team.

---

## I. General Principles

1. **English Naming & Comments:** All directory, file, class, function, variable, and constant names, as well as comments, must be written in **English**.
2. **Clean Code:** Write self-explanatory code with logical spacing, indentation, and structure.
3. **DRY Principle (Don't Repeat Yourself):** Avoid duplicate code blocks. Abstract common functionalities into reusable utilities or hooks.

---

## II. Coding Standards

### 1. Code Spacing & Line Breaks

Code should be well-spaced and split logically into blocks using newlines.

- **Bad Example (Cramped Code):**

  ```typescript
  function calculateOrderPrice(
    items: Item[],
    discount: number,
    tax: number,
  ): number {
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
    }
    total = total - total * discount;
    total = total + total * tax;
    return total;
  }
  ```

- **Good Example (Readable Code):**

  ```typescript
  function calculateOrderPrice(
    items: Item[],
    discount: number,
    tax: number,
  ): number {
    let total = 0;

    for (const item of items) {
      total += item.price * item.quantity;
    }

    total = total - total * discount;
    total = total + total * tax;

    return total;
  }
  ```

### 2. Avoid Code Duplication

Abstract repetitive calculation patterns into parameterized functions.

- **Bad Example (Duplicate Discount Logic):**

  ```typescript
  function calculateStudentDiscount(price: number): number {
    return price - price * 0.1;
  }

  function calculateTeacherDiscount(price: number): number {
    return price - price * 0.1;
  }

  function calculateEmployeeDiscount(price: number): number {
    return price - price * 0.1;
  }
  ```

- **Good Example (Single Parameterized Function):**

  ```typescript
  function applyDiscount(price: number, discountPercent: number): number {
    return price - price * discountPercent;
  }

  const studentPrice = applyDiscount(100, 0.1);
  const teacherPrice = applyDiscount(100, 0.1);
  const employeePrice = applyDiscount(100, 0.1);
  ```

### 3. Formatting

- **Indentation:** Use **2 spaces** (configured automatically in `.vscode/settings.json` and `.prettierrc`).
- **Line Length:** Keep lines under **80 characters** for readability (configured in `.prettierrc`).
- **Braces:** Use the Egyptian/K&R style (opening curly brace on the same line as the statement):

  ```typescript
  if (condition) {
    doSomething();
  }
  ```

  Avoid putting opening braces on a new line (Allman style).

---

## III. Naming Conventions

| Construct     | Case         | Example                                                  |
| :------------ | :----------- | :------------------------------------------------------- |
| **Directory** | `camelCase`  | `userModule/`, `authService/`, `orderHistory/`           |
| **File**      | `camelCase`  | `userService.ts`, `authController.ts`, `shoppingCart.ts` |
| **Class**     | `PascalCase` | `UserService`, `OrderController`, `ProductRepository`    |
| **Function**  | `camelCase`  | `calculateTotal()`, `findUserById()`, `saveOrder()`      |
| **Variable**  | `camelCase`  | `studentName`, `totalPrice`, `isLoggedIn`                |
| **Constant**  | `UPPER_CASE` | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT`                     |

_Note: Avoid using single-letter or meaningless variable names like `a`, `x`, or `tmp`._

---

## IV. Commenting Guidelines

All comments in the codebase must be written in **English**.

- **Single-Line Comments:** Use `//` to explain complex logical updates:

  ```typescript
  // Reset failed login attempts after successful authentication.
  failedLoginCount = 0;
  ```

- **Block Comments:** Use `/* ... */` to document multi-step calculations:

  ```typescript
  /*
   * Calculate the final order price:
   * - Apply discount.
   * - Add shipping fee.
   * - Apply tax.
   */
  const finalPrice = subtotal - discount + shippingFee + tax;
  ```

- **Method JSDoc Comments:** Use `/** ... */` to document functions and parameters:

  ```typescript
  /**
   * Calculate the discounted price.
   *
   * @param price Original price.
   * @param discount Discount percentage (e.g., 0.1 for 10%).
   * @returns Final price after discount.
   */
  function applyDiscount(price: number, discount: number): number {
    return price - price * discount;
  }
  ```

---

## V. Git Branch Workflow

Always use lowercase and separating hyphens for branch naming. Prefix your branch name based on the type of work:

- **`feature/<branch-name>`**: For new features or updates.
  - _Example:_ `feature/login`, `feature/caregiver-schedule`
- **`bugfix/<branch-name>`**: For fixing bugs.
  - _Example:_ `bugfix/payment-retry`, `bugfix/session-expiry`
- **`refactor/<branch-name>`**: For refactoring code without adding new features.
  - _Example:_ `refactor/auth-middleware`
- **`docs/<branch-name>`**: For updating documentation.
  - _Example:_ `docs/readme-setup`

---

## VI. Shared Constants Structure

Place all global shared constant objects in the `src/constants/` folder to prevent magic strings and hardcoded configurations:

```text
src/
└── constants/
    ├── userRole.ts
    ├── apiRoutes.ts
    ├── httpStatus.ts
    └── messages.ts
```

### 1. Declaring Constants (e.g., `userRole.ts`)

Always export constant objects using the `as const` modifier to ensure strict read-only type safety:

```typescript
export const USER_ROLE = {
  ADMIN: "ADMIN",
  USER: "USER",
  MODERATOR: "MODERATOR",
} as const;
```

### 2. Using Constants in Code

```typescript
import { USER_ROLE } from "../constants/userRole";

function canAccessAdminPage(role: string): boolean {
  return role === USER_ROLE.ADMIN;
}

const currentRole = USER_ROLE.ADMIN;

if (canAccessAdminPage(currentRole)) {
  console.log("Access granted.");
}
```

---

## VII. Git Commit Guidelines

We follow the **Conventional Commits** specification for all commit messages. This ensures a clean, searchable git history.

### 1. Commit Message Format

```text
<type>(<scope>): <description>
```

- **`type`**: The type of change being introduced:
  - `feat`: A new feature.
  - `fix`: A bug fix.
  - `docs`: Documentation only changes.
  - `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
  - `refactor`: A code change that neither fixes a bug nor adds a feature.
  - `perf`: A code change that improves performance.
  - `test`: Adding missing tests or correcting existing tests.
  - `chore`: Changes to the build process, tooling, dependencies, or auxiliary tools/libraries.
- **`scope`** (optional): The package or area affected (e.g., `setup`, `frontend`, `backend`, `shared-types`).
- **`description`**: A short, imperative, present-tense description (e.g., "add login page", "fix database reconnection"). Keep it under 50-70 characters.

### 2. Examples

- `feat(frontend): implement dashboard layout`
- `fix(backend): resolve token verification delay`
- `docs: update setup instructions in README`
- `chore(deps): upgrade prisma to latest version`

---

## VIII. Strict TypeScript & ESLint Standards

We enforce a zero-warning, highly strict TypeScript and ESLint configuration to maintain maximum type safety and prevent runtime errors.

### 1. TypeScript Strict Compiler Options

All packages and applications extend `@nursinghome/typescript-config/base`. The following compiler checks are active:

- **`strict: true`**: Enforces strict null checking, implicit any checks, and strict function types.
- **`noUncheckedIndexedAccess: true`**: Accessing object or array keys via indexes (e.g. `items[i]`) always returns `T | undefined`, forcing you to check for existence first.
- **`exactOptionalPropertyTypes: true`**: Disallows explicitly assigning `undefined` to optional properties.
- **`verbatimModuleSyntax: true`**: Enforces explicit type imports (`import type`) to prevent bundling side effects (except in NestJS due to decorator metadata).

### 2. ESLint Rules

We use TypeScript ESLint's **`strictTypeChecked`** rules. The following custom rules are configured:

- **No Explicit Any (`@typescript-eslint/no-explicit-any`)**: Set to `"error"`. Using `any` is strictly prohibited. Use `unknown` or define appropriate interfaces.
- **Unused Variables (`@typescript-eslint/no-unused-vars`)**: Set to `"error"`. Clean up any unused variables or prefix them with `_` if they are required by signatures.
- **Extraneous Empty Classes (`@typescript-eslint/no-extraneous-class`)**: Set to `"error"`, but configured on the backend to allow classes annotated with decorators (e.g., NestJS modules and controllers):

```typescript
"@typescript-eslint/no-extraneous-class": ["error", { allowWithDecorator: true }]
```

---

## IX. Path Aliases (`@/*`)

To keep imports clean and avoid long relative path sequences (e.g. `../../components/Button`), use the `@/*` alias:

- **Standard**: `@/` maps to the `src/` directory of the current application or package.
- **Usage**: `import { Button } from "@/components/Button";`
- **Resolution**:
- **Frontend (React/Vite)**: Vite resolves these natively using `resolve: { tsconfigPaths: true }`.
- **Backend (NestJS)**: Resolved at runtime in development via `ts-node` and in production using `--import tsconfig-paths/register.js`.
- **ESLint**: Integrated with `eslint-import-resolver-typescript` to ensure linter paths compile cleanly.
