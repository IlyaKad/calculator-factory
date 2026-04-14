# Calculator Factory Agency

A multi-agent Claude Code system that reads a Notion ticket describing any calculator
and autonomously builds it as a full-stack TypeScript feature — end to end.

---

## Tech Stack

- **Per calculator:** standalone Next.js app — its own `package.json`, `Dockerfile`, UI and API route
- **Logic:** pure TypeScript function — no framework, no HTTP, fully unit-testable
- **UI:** Next.js + React 18 (TypeScript) — form inputs, calls own API route, shows result
- **API:** Next.js API route — thin wrapper around logic.ts
- **Testing:** Jest — targets pure logic only, no framework dependencies
- **Infra:** Docker — each calculator builds and runs as its own container
- **Integrations (via MCP):** Notion, GitHub, Slack, Playwright, Docker

---

## Output Convention

Each calculator is a fully standalone app — copy the folder, run it independently:

```
calculators/{name}/
  logic.ts              ← pure calculator logic — no framework, fully testable
  logic.test.ts         ← Jest tests (LOCKED after test-writer runs — read-only)
  app/
    page.tsx            ← React UI — form inputs, calls API route, shows result
    api/
      route.ts          ← Next.js API route — thin wrapper around logic.ts
  package.json          ← next, react, typescript dependencies
  tsconfig.json
  next.config.ts
  Dockerfile
  README.md
```

**To run a calculator independently:**
```bash
cd calculators/{name}
npm install && npm run dev     # dev server on localhost:3000
docker build -t {name} . && docker run -p 3000:3000 {name}   # containerized
```

**Why this structure:**
- The folder is the unit — zip it, copy it, push it to its own repo
- `logic.ts` is pure TypeScript — no HTTP, no React, no framework. Easy to test.
- `app/api/route.ts` is a thin HTTP adapter — imports logic, handles request/response.
- `app/page.tsx` is a thin UI adapter — form state, fetch call, result display.

---

## Test Locking

After the test-writer agent writes `logic.test.ts`, the file is marked read-only.
No agent may modify tests after this point — code must be fixed to pass tests, never the reverse.
Enforced by: a post-file-write hook (Phase 5) + rule in rules.md.

---

## Skills

| Skill | File | When to use |
|---|---|---|
| Read Notion Ticket | `skills/read-notion-ticket.md` | When extracting a calculator spec from a Notion ticket |
| TypeScript Patterns | `skills/typescript-patterns.md` | When writing logic.ts, route.ts, or page.tsx |
| Write Jest Tests | `skills/write-jest-tests.md` | When writing tests for a calculator logic function |

---

## Agents

All agent definitions live in `.claude/agents/`.

| Agent | File | Role |
|---|---|---|
| Orchestrator | `agents/orchestrator.md` | Coordinates the full build pipeline |
| Ticket Reader | `agents/ticket-reader.md` | Reads Notion ticket, outputs structured spec |
| Fetch Agent | `agents/fetch-agent.md` | Fetches content from URLs in the ticket — plain fetch first, Playwright fallback if fetch fails |
| Architect | `agents/architect.md` | Designs function signatures and types |
| Builder | `agents/builder.md` | Implements logic.ts, route.ts, page.tsx |
| Test Writer | `agents/test-writer.md` | Writes Jest tests for logic.ts, then locks the file |
| Test Runner | `agents/test-runner.md` | Runs locked tests, fixes logic.ts until all pass |
| UI Tester | `agents/ui-tester.md` | Writes and runs Playwright tests against live dev server, fixes page.tsx if needed |
| Docs Writer | `agents/docs-writer.md` | Writes README |
| Publisher | `agents/publisher.md` | Publishes via Docker, GitHub, Slack, Notion |

---

## Pipeline Order

```
Ticket Reader → [Fetch Agent] → Architect → Builder → Test Writer → Test Runner → Simplify → UI Tester → Docs Writer → Publisher
```

Fetch Agent runs only when the Notion ticket contains external URLs.
The orchestrator decides whether to include it based on ticket-reader output.

---

## Defaults

| Setting | Value |
|---|---|
| Slack channel | `#claude` |
| GitHub repo | `IlyaKad/calculator-factory` |

---

## Rules

All hard constraints are in `rules.md`. Every agent must follow them.

---

## Learning Context

This is a hands-on learning project for Claude Code entities.
At the start of every session, read:
- `docs/SYLLABUS.md` — full phase plan and instructions
- `docs/TEACHER_SETTINGS.md` — teaching style and preferences

Teaching mode is always ON. Explain WHY before HOW.
Guide Ilya to write — do not write for him unless asked.
