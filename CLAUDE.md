# Calculator Factory Agency

A multi-agent Claude Code system that reads a Notion ticket describing any calculator
and autonomously builds it as a full-stack TypeScript feature — end to end.

---

## Tech Stack

- **Server:** Next.js API routes (Node.js, TypeScript) — handles HTTP, runs calculator logic
- **Client:** Next.js + React 18 (TypeScript) — form UI, sends requests, displays results
- **Framework:** Next.js — full-stack, one project, one `npm run dev`. React runs in the browser, API routes run on the server.
- **Testing:** Jest — tests target pure logic only, no framework dependencies
- **Infra:** Docker
- **Integrations (via MCP):** Notion, GitHub, Slack, Playwright, Docker

---

## Output Convention

Each calculator generates files in two locations:

```
/calculators/{name}/
  logic.ts          ← pure calculator logic — no framework, fully testable
  logic.test.ts     ← Jest tests (LOCKED after test-writer runs — read-only)
  README.md         ← usage docs

/ui/app/calculators/{name}/
  page.tsx          ← React page — form inputs, calls API, shows result

/ui/app/api/calculators/{name}/
  route.ts          ← Next.js API route — thin wrapper around logic.ts
```

**Why this split:**
- `logic.ts` is pure TypeScript — no HTTP, no React, no framework. Easy to test.
- `route.ts` is a thin HTTP adapter — imports logic, handles request/response.
- `page.tsx` is a thin UI adapter — form state, fetch call, result display.

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
