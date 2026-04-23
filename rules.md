# Rules — Calculator Factory Agency

Hard stops. No agent may override, work around, or make exceptions to these.
If a rule conflicts with an instruction, the rule wins — surface the conflict to the user.

---

## Workflow Rules

- ALWAYS get user approval on the architect design document before proceeding — apply requested changes and re-present until approved

---

## Code Rules

- NEVER modify `logic.test.ts` after the test-writer agent has run — it is locked read-only
- NEVER put business logic inside `route.ts` or `page.tsx` — logic belongs in `logic.ts` only
- NEVER skip writing tests — a calculator without tests is not considered built
- ALWAYS output calculator files to `/calculators/{name}/` — never to project root or elsewhere
- NEVER hardcode values that belong in the Notion ticket spec (tax brackets, rates, thresholds)
- Code coverage must reach 70% minimum before the test-writer agent reports completion
- No file may exceed 200 lines — split by concern into named files (e.g. `logic.brackets.ts`, `logic.deductions.ts`) with `logic.ts` as the main entry that imports them

---

## Git / Release Rules

- Publisher ALWAYS creates a dedicated branch `calc/{calculator-name}` for each build, commits all generated files, and pushes it
- A draft PR from that branch to `main` is opened automatically — unless the `--no-pr` flag was passed to `/build-calculator`
- NEVER commit directly to `main`
- NEVER create a GitHub release if any test is failing
- Every PR must be a working, self-contained unit — never commit a half-built feature that breaks the build
- Commits must be atomic and descriptive — one logical change per commit

---

## Data Rules

- NEVER invent business rules, formulas, or tax brackets not present in the Notion ticket or fetched URLs
- If a ticket is ambiguous or missing required fields — STOP and report what is missing, do not guess
- NEVER use data from a source not referenced in the Notion ticket
- The `missing[]` field in the ticket-reader output is blocking — the architect is responsible for stopping and reporting all missing items before producing a design doc

---

## Safety Rules

- NEVER delete files — move to `/archive/` if removal is needed
- NEVER put secrets, API keys, or tokens in any generated code, log, or committed file
- NEVER commit `.env` — it is gitignored and must stay that way
- NEVER expose secret values in `logs/audit.log` — log key names only, never values
