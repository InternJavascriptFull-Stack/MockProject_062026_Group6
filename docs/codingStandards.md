# Coding Standards Document

## I. Introduction

This document defines the coding rules for MockProject_Group6. The goal is to keep a shared coding standard, improve maintainability, and improve code quality across the project.

**Important:** All naming used in source code must be written in English. All comments in source code must also be written in English.

## II. Standards

### 1. Readable code

Code must be easy to read, with logical spacing and line breaks. Avoid cramped blocks.

### 2. Avoid duplicate code

Do not repeat the same logic across multiple functions or components. Extract shared logic into reusable functions, components, hooks, or constants.

### 3. Formatting

- Indentation: **4 spaces**.
- Recommended line length: keep lines under **180 characters** when practical.
- Braces: use opening braces on the same line.

```ts
if (condition) {
    doSomething();
}
```

### 4. Naming

| Item | Standard | Example |
| --- | --- | --- |
| Directory | camelCase | `userModule/`, `authService/` |
| File | camelCase | `userService.ts`, `authController.ts` |
| Class | PascalCase | `UserService`, `OrderController` |
| Function | camelCase | `calculateTotal()` |
| Variable | camelCase | `studentName`, `isLoggedIn` |
| Constant | UPPER_CASE | `MAX_RETRY_COUNT` |

Avoid unclear names such as `a`, `x`, or `tmp`.

### 5. Comments

All comments in source code must be written in English. Use comments only when they explain why the code exists or clarify complex logic.

### 6. Git / GitHub

Use branch names such as:

- `feature/login` for new features.
- `bugfix/payment` for bug fixes.

### 7. Shared constants

Use `src/constants/` for shared constants.

```text
src/
└── constants/
    ├── userRole.ts
    ├── apiRoutes.ts
    ├── appRoutes.ts
    └── messages.ts
```
