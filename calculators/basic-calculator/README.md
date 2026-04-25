# Basic Calculator

## Purpose

Basic arithmetic calculator supporting addition, subtraction, multiplication,
division, modulo, and percentage. Built as a standalone Next.js application with
a pure TypeScript logic core, a thin API route, and a React UI.

## Screenshot

![Calculator UI](../../logs/basic-calculator-ui-screenshot.png)

## Inputs

| Field      | Type                                      | Validation                                           |
|------------|-------------------------------------------|------------------------------------------------------|
| `a`        | `number`                                  | Must be a finite number (no `NaN`/`Infinity`).       |
| `b`        | `number`                                  | Must be a finite number. Must be non-zero for `/` and `%`. |
| `operator` | `'+' \| '-' \| '*' \| '/' \| '%' \| 'pct'` | Must be one of the supported operators.              |

## Outputs

| Field        | Type     | Description                                            |
|--------------|----------|--------------------------------------------------------|
| `result`     | `number` | The computed value.                                    |
| `expression` | `string` | Human-readable expression, e.g. `"25% of 200 = 50"`.   |

### Operator semantics

| Operator | Meaning                 | Example                        |
|----------|-------------------------|--------------------------------|
| `+`      | Addition                | `2 + 3 = 5`                    |
| `-`      | Subtraction             | `10 - 4 = 6`                   |
| `*`      | Multiplication          | `6 * 7 = 42`                   |
| `/`      | Division (throws on 0)  | `20 / 4 = 5`                   |
| `%`      | Modulo (throws on 0)    | `17 % 5 = 2`                   |
| `pct`    | Percentage: `(a/100)*b` | `25% of 200 = 50`              |

## API

**Endpoint:** `POST /api`

**Request:**
```json
{ "a": 25, "b": 200, "operator": "pct" }
```

**Response (200):**
```json
{ "result": 50, "expression": "25% of 200 = 50" }
```

**Error (400):**
```json
{ "error": "Division by zero is not allowed" }
```

## UI

- Dev: `npm run dev` then open `http://localhost:3000`.
- Dark slate number-pad calculator. Enter `a` with the digit buttons, click an
  operator (`+` `−` `×` `÷` `%` `mod`), enter `b`, then press `=`.
- After a result: pressing an operator chains the result as the new `a`.
  Press Reset to start over.
- Raw token `pct` is never shown — the `%` operator button sends `pct` to the API.

## Tests

- Coverage: **97%** (17 Jest tests covering happy paths, every guard,
  and zero-operand boundaries).
- Run locally:
  ```bash
  cd calculators/basic-calculator
  npm install
  npx jest logic.test.ts --coverage
  ```
- `logic.test.ts` is locked read-only after the test-writer agent runs —
  fix `logic.ts` if a test fails, never the test.

## Run standalone

```bash
cd calculators/basic-calculator
npm install && npm run dev                         # dev server on :3000
docker build -t basic-calculator . && \
  docker run -p 3000:3000 basic-calculator         # containerized
```
