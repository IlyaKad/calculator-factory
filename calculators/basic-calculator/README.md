# Basic Calculator

A basic arithmetic calculator supporting addition, subtraction, multiplication, division, modulo, and percentage operations. Built as a standalone Next.js app with a pure TypeScript logic core.

## Inputs

| Field | Type | Validation |
|---|---|---|
| `a` | number | Any finite number |
| `b` | number | Any finite number |
| `operator` | string | One of: `+`, `-`, `*`, `/`, `%`, `pct` |

**Operator semantics:**
- `+` — addition (`a + b`)
- `-` — subtraction (`a - b`)
- `*` — multiplication (`a * b`)
- `/` — division (`a / b`); throws `Division by zero` when `b = 0`
- `%` — modulo (`a % b`); throws `Division by zero` when `b = 0`
- `pct` — percentage (`a * b / 100`)

## Outputs

| Field | Type | Description |
|---|---|---|
| `result` | number | Result of the arithmetic operation |
| `expression` | string | Human-readable expression, e.g. `10 % 3 = 1` |

## API

**Endpoint:** `POST /api`

**Request:**
```json
{ "a": 500, "b": 20, "operator": "pct" }
```

**Response (200):**
```json
{ "result": 100, "expression": "500 pct 20 = 100" }
```

**Response (400 — error):**
```json
{ "error": "Division by zero" }
```

## UI

Open [http://localhost:3000](http://localhost:3000). Enter values for A and B, select an operator from the dropdown, and click **Calculate**. The expression and result are displayed below the form. Click **Reset** to clear.

## Tests

Coverage: **100%** (statements, branches, functions, lines)

Run unit tests:
```bash
npm test
```

Run with coverage report:
```bash
npm run test:coverage
```

Run Playwright UI tests (requires dev server on port 3001):
```bash
npx next dev --port 3001 &
npx playwright test tests/page.test.ts
```

## Running Locally

```bash
npm install
npm run dev      # dev server on localhost:3000
```

## Docker

```bash
docker build -t basic-calculator .
docker run -p 3000:3000 basic-calculator
```
