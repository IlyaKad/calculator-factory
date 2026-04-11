# Skill: Write Jest Tests

## Purpose
Write unit tests for `logic.ts` only.
Tests must be written from the function's interface — not from its implementation.
Minimum coverage: 70%. Tests are locked read-only after this agent runs.

---

## What to Test (and What Not To)

| Test target | Tool | Who runs it |
|---|---|---|
| `logic.ts` functions | Jest (this skill) | test-writer agent |
| `route.ts` API endpoints | — | out of scope for this agent |
| `page.tsx` UI | Playwright | test-runner agent (separate) |

Never test `route.ts` or `page.tsx` here. The logic is the contract — if it passes, the adapters around it are thin enough to trust.

---

## Step 1 — Plan Before Writing (TODO list)

Before writing any test code, output a TODO list:

```
Tests to write for calculateIncomeTax:
[ ] Happy path: standard salary, correct tax amount returned
[ ] Edge case: salary = 0 → throws error
[ ] Edge case: negative salary → throws error
[ ] Edge case: salary at exact bracket boundary → correct bracket applied
[ ] Edge case: very high salary → top bracket applied correctly
```

The orchestrator reviews this list before the agent proceeds to write code.
This prevents writing tests that only cover the happy path.

---

## Step 2 — Test Structure

One `describe` block per function. One `it` per test case.

```typescript
import { calculateIncomeTax } from '../logic'

describe('calculateIncomeTax', () => {

  // 1. Happy path first
  it('returns correct tax for standard monthly salary', () => {
    const result = calculateIncomeTax({ monthlySalary: 10000, year: 2024 })
    expect(result.taxAmount).toBeCloseTo(1234.56)
    expect(result.netSalary).toBe(10000 - result.taxAmount)
    expect(result.effectiveRate).toBeGreaterThan(0)
  })

  // 2. Invalid input — always test throws
  it('throws if salary is zero', () => {
    expect(() => calculateIncomeTax({ monthlySalary: 0, year: 2024 }))
      .toThrow('Salary must be positive')
  })

  it('throws if salary is negative', () => {
    expect(() => calculateIncomeTax({ monthlySalary: -5000, year: 2024 }))
      .toThrow('Salary must be positive')
  })

  // 3. Boundary cases — bracket edges, zero outputs, max values
  it('applies correct bracket at boundary salary', () => {
    const result = calculateIncomeTax({ monthlySalary: 6790, year: 2024 })
    expect(result.taxAmount).toBeCloseTo(expected_boundary_value)
  })

})
```

**Rules:**
- Minimum 1 happy path + 2 edge cases per exported function
- Use `toBeCloseTo` for floating point tax/interest calculations — never `toBe`
- Test error messages exactly — they are part of the contract
- Import only from `logic.ts` — never import from route or page

---

## Step 3 — Coverage Check

After writing tests, run coverage and verify:

```bash
npx jest --coverage --collectCoverageFrom="calculators/{name}/logic.ts"
```

If coverage is below 70%, add tests until it passes.
Report the final coverage number in the output to the orchestrator.

---

## Step 4 — Lock the File

After all tests pass and coverage is confirmed, the `post-file-write` hook
automatically marks `logic.test.ts` as read-only.

Do not attempt to modify the test file after this point.
If the builder agent's code fails the tests, the builder fixes the code — not the tests.

---

## Output to Orchestrator

```
Tests written: 5
Coverage: 82%
File locked: calculators/israeli-income-tax/logic.test.ts (read-only)
Status: PASS
```
