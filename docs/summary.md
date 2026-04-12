# Calculator Factory — Quick Summary

## What We Built
A multi-agent Claude Code system. Give it a Notion ticket → it builds a full-stack TypeScript calculator end to end.

---

## The 9 Entities

| Entity | File type | Active? | Auto-loaded? |
|---|---|---|---|
| CLAUDE.md | Markdown | No | ✅ Yes — every agent |
| Skills | Markdown | No | No — agents read on demand |
| Rules | Markdown | No | No — agents read on demand |
| Prompt Files | Markdown | No | No — human triggers via `/command` |
| Subagents | Markdown | No | No — orchestrator spawns them |
| Orchestrator | Markdown | No | No — prompt file spawns it |
| Hooks | Python | ✅ Yes | ✅ Yes — fires on tool events |
| MCP Servers | Config + npm | ✅ Yes | ✅ Yes — available to all agents |
| Memory | JSON | No | No — agents read/write on demand |

**Active code = Hooks + MCP Servers. Everything else = documents.**

---

## The Pipeline
```
/build-calculator {id}
    ↓ prompt file writes .build-state.json
    ↓ spawns orchestrator
        ↓ Step 0: check memory.json (skip if already built)
        ↓ Step 1: ticket-reader → JSON spec
        ↓ Step 2: fetch-agent (only if urls[] non-empty)
        ↓ Step 3: architect → design doc → USER APPROVAL
        ↓ Step 4: builder → logic.ts, route.ts, page.tsx
        ↓ Step 5: test-writer → logic.test.ts → LOCKED
        ↓ Step 5.5: test-runner → fixes logic.ts until tests pass
        ↓ Step 5.75: simplify → clean up, re-run tests
        ↓ Step 6: ui-tester → Playwright → screenshot
        ↓ Step 7: docs-writer → README.md
        ↓ Step 8: publisher → Notion + Docker + GitHub + Slack
        ↓ Step 9: write memory.json, cleanup
```

---

## The 3-File Output Per Calculator
```
logic.ts    — pure TypeScript, no framework, fully testable
route.ts    — thin Next.js POST handler, imports logic only
page.tsx    — thin React form, calls API, shows result
```
If logic leaks into route or page → can't unit test it.

---

## Key Rules to Remember
- Tests locked after test-writer → code fixed to pass tests, never the reverse
- 70% coverage minimum before locking
- No file > 200 lines — split by concern
- No push to main — PRs only
- Hooks fail safe → always `approve()` on crash
- `missing[]` in ticket spec is blocking — orchestrator stops if non-empty
