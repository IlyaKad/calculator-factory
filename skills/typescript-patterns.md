# Skill: TypeScript Patterns

## Purpose
Define how to structure the three files generated per calculator.
Every calculator follows this exact split — do not combine layers.

---

## The Three Files and Why They're Separate

| File | Layer | Rule |
|---|---|---|
| `logic.ts` | Business logic | No framework, no HTTP, no React — pure functions only |
| `route.ts` | Server (HTTP) | Thin wrapper — imports logic, handles request/response |
| `page.tsx` | Client (UI) | Thin wrapper — form state, calls API, shows result |

The agent tests `logic.ts` directly. If logic lives inside `route.ts` or `page.tsx`, it cannot be unit tested without a server or browser.

---

## logic.ts — Pure Calculator Logic

Define input/output shapes as TypeScript interfaces first, then the function.

```typescript
// Always define interfaces before the function
export interface IncomeTaxInput {
  monthlySalary: number
  year: number
}

export interface IncomeTaxResult {
  taxAmount: number
  netSalary: number
  effectiveRate: number
}

// Pure function — takes typed input, returns typed output, throws on invalid input
export function calculateIncomeTax(input: IncomeTaxInput): IncomeTaxResult {
  if (input.monthlySalary <= 0) throw new Error('Salary must be positive')
  // ... logic here
  return { taxAmount, netSalary, effectiveRate }
}
```

**Rules for logic.ts:**
- No `import` from Next.js, React, or any HTTP library
- All inputs validated at the top — throw `Error` with a clear message on invalid input
- Return a typed result object, never a raw primitive
- Export both the interfaces and the function — the route and tests import them

---

## route.ts — Next.js API Route

Thin HTTP adapter. Imports from logic.ts, nothing else.

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { calculateIncomeTax, IncomeTaxInput } from '@/calculators/israeli-income-tax/logic'

export async function POST(req: NextRequest) {
  try {
    const body: IncomeTaxInput = await req.json()
    const result = calculateIncomeTax(body)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Calculation failed' },
      { status: 400 }
    )
  }
}
```

**Rules for route.ts:**
- Only POST routes for calculators — calculators take inputs and return results
- Catch errors from logic and return `400` with the error message
- No business logic here — if you're writing math, it belongs in logic.ts
- Keep it under 30 lines — if it's longer, logic has leaked in

---

## page.tsx — React Calculator Page

Thin UI adapter. Manages form state, calls the API route, displays result.

```typescript
'use client'

import { useState } from 'react'
import { IncomeTaxInput, IncomeTaxResult } from '@/calculators/israeli-income-tax/logic'

export default function IncomeTaxPage() {
  const [input, setInput] = useState<IncomeTaxInput>({ monthlySalary: 0, year: 2024 })
  const [result, setResult] = useState<IncomeTaxResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch('/api/calculators/israeli-income-tax', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const data = await res.json()
    if (!res.ok) return setError(data.error)
    setResult(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* one input per IncomeTaxInput field */}
      {error && <p>{error}</p>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </form>
  )
}
```

**Rules for page.tsx:**
- `'use client'` at the top — always, calculators are interactive
- Import types from `logic.ts` — never duplicate type definitions
- No calculation logic — if you're doing math, it belongs in logic.ts
- **Follow the architect's UI Design section exactly** — implement the specified layout, color scheme, and components. Never produce unstyled or bare HTML.
- Use Tailwind CSS for all styling — no inline `style={{}}`, no CSS modules unless specified by the architect
- Always handle loading, error, and result states visually — use distinct styles for each state

---

## Naming Convention

| Calculator name (slug) | logic function | API path |
|---|---|---|
| `israeli-income-tax` | `calculateIncomeTax` | `/api/calculators/israeli-income-tax` |
| `compound-interest` | `calculateCompoundInterest` | `/api/calculators/compound-interest` |

Function name: `calculate` + PascalCase of the slug.
