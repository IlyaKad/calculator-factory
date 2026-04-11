# Calculator Factory Agency

A multi-agent Claude Code system that reads a Notion ticket describing any calculator and autonomously builds it as a full-stack TypeScript feature — end to end.

---

## What It Does

Give it a Notion ticket. It builds a working calculator:

- Reads the ticket spec (and fetches any reference URLs)
- Designs the TypeScript architecture
- Implements `logic.ts`, `route.ts`, and `page.tsx`
- Writes and locks Jest unit tests (70% coverage minimum)
- Runs tests and fixes code until all pass
- Simplifies the code
- Runs Playwright UI tests against a live dev server
- Writes a README
- Publishes: Docker container, GitHub release, Slack announcement, Notion status update

---

## Tech Stack

| Layer | Technology |
|---|---|
| Calculator logic | TypeScript, Node.js |
| API | Next.js API routes |
| UI | Next.js + React 18 |
| Testing (unit) | Jest |
| Testing (UI) | Playwright |
| Infra | Docker |
| Integrations | Notion, GitHub, Slack (via MCP) |

---

## Output Per Calculator

```
/calculators/{name}/
  logic.ts          ← pure calculator logic, fully testable
  logic.test.ts     ← Jest tests (locked read-only after writing)
  README.md         ← usage docs

/ui/app/calculators/{name}/
  page.tsx          ← React form UI

/ui/app/api/calculators/{name}/
  route.ts          ← Next.js API route
```

---

## Agent Pipeline

```
Ticket Reader → [Fetch Agent] → Architect → Builder →
Test Writer → Test Runner → Simplify → UI Tester →
Docs Writer → Publisher
```

Fetch Agent runs only when the Notion ticket contains external URLs.
Each agent reads its own input contract — the orchestrator coordinates without hardcoding agent details.

---

## Usage

### Build a calculator from a Notion ticket

```
/build-calculator {notion-ticket-id}
```

### Build from all "Not Started" tickets

```
/build-calculator batch
```

### Mark a calculator as done

```
/calculator-finish
/calculator-finish {notion-ticket-id}
```

---

## Project Structure

```
calculator-factory/
├── .claude/
│   ├── mcp_settings.json     ← 5 MCP servers (Notion, GitHub, Slack, Playwright, Docker)
│   ├── agents/               ← all agent definitions
│   ├── commands/             ← slash commands (/build-calculator, /calculator-finish)
│   └── hooks/                ← pre-tool-use, post-file-write, audit-logger, notion-status-sync
├── skills/                   ← read-notion-ticket, typescript-patterns, write-jest-tests
├── calculators/              ← generated output (runtime)
├── ui/                       ← Next.js app (generated output)
├── logs/                     ← audit log (runtime)
├── CLAUDE.md                 ← shared context injected into every agent
├── rules.md                  ← hard constraints, no exceptions
└── .env                      ← credentials (gitignored)
```

---

## Agents

| Agent | Role |
|---|---|
| Orchestrator | Coordinates the full pipeline |
| Ticket Reader | Reads Notion ticket, outputs structured spec |
| Fetch Agent | Fetches URLs from ticket (plain fetch → Playwright fallback) |
| Architect | Designs function signatures and TypeScript interfaces |
| Builder | Implements logic.ts, route.ts, page.tsx |
| Test Writer | Writes Jest tests from interface, locks the file |
| Test Runner | Runs locked tests, fixes logic.ts until all pass |
| UI Tester | Writes and runs Playwright tests, fixes page.tsx if needed |
| Docs Writer | Writes README.md |
| Publisher | Publishes via Docker, GitHub, Slack, Notion |

---

## Setup

1. Clone this repo
2. Copy `.env.example` to `.env` and fill in your tokens
3. Source env and launch Claude Code:
   ```bash
   source .env && claude
   ```
4. Verify MCPs are connected:
   ```
   /mcp
   ```

---

## Rules

All hard constraints are in `rules.md`. Key ones:

- Tests are locked read-only after the test-writer runs — code is fixed to pass tests, never the reverse
- Coverage must reach 70% minimum
- No business logic in `route.ts` or `page.tsx`
- No file may exceed 200 lines
- No push to main — PRs only
- No secrets in generated code

---

## Learning Context

This project was built as a hands-on learning exercise for Claude Code entities:
CLAUDE.md, Skills, Rules, Subagents, Hooks, Prompt Files, Orchestrator, MCP Servers, and Memory.

See `SYLLABUS.md` for the full phase plan.
