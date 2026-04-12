# Project Syllabus — Calculator Factory Agency
# Claude Code Learning Project

---

## What This Project Is

A multi-agent Claude Code system that reads a Notion ticket describing any calculator,
and autonomously builds it as a runnable TypeScript CLI — end to end.

**Example inputs (Notion tickets you'll create):**
- "Israeli income tax calculator for employees — 2024 brackets"
- "Compound interest investment calculator with monthly contributions"
- "Basic arithmetic calculator with history and undo"
- "Mortgage calculator with early repayment scenarios"

**The agency always produces:**
- `/calculators/{name}/index.ts` — the calculator engine
- `/calculators/{name}/index.test.ts` — Jest tests
- `/calculators/{name}/README.md` — usage docs
- A running Docker container
- A Slack message announcing it's ready
- A GitHub release
- A Notion "Built" status update on the original ticket

---

## The Learning Goal

This project is a LEARNING VEHICLE. The calculator is just the excuse.

The real goal is hands-on mastery of every Claude Code entity:

| Entity | Where you build it | Build style |
|---|---|---|
| CLAUDE.md | Phase 1 | Together |
| Skills | Phase 2 | 1 together + 2 solo |
| Rules | Phase 3 | Together |
| Subagents | Phase 4 | 1 together + 1 solo |
| Hooks | Phase 5 | 1 together + 2 solo |
| Prompt File | Phase 6 | Together |
| Orchestrator + Handoffs | Phase 7 | Together |
| MCP Servers (×5) | Phase 8 | One exercise each |
| Memory | Phase 9 | Together |

---

## Full Folder Structure

Build this structure progressively — do NOT create it all at once upfront.
Each phase introduces the files it owns.

```
calculator-factory/
│
├── .claude/
│   ├── mcp_settings.json          ← Phase 0
│   ├── memory.json                ← Phase 9
│   │
│   ├── agents/
│   │   ├── orchestrator.md        ← Phase 7
│   │   ├── ticket-reader.md       ← Phase 4 (built together)
│   │   ├── architect.md           ← Phase 4 (built solo)
│   │   ├── builder.md             ← Phase 7
│   │   ├── test-writer.md         ← Phase 7
│   │   ├── docs-writer.md         ← Phase 7
│   │   └── publisher.md           ← Phase 8
│   │
│   ├── commands/
│   │   └── build-calculator.md    ← Phase 6
│   │
│   └── hooks/
│       ├── pre-tool-use.py        ← Phase 5 (built together)
│       ├── post-file-write.py     ← Phase 5 (built solo)
│       └── audit-logger.py        ← Phase 5 (built solo)
│
├── skills/
│   ├── read-notion-ticket.md      ← Phase 2 (built together)
│   ├── typescript-cli-patterns.md ← Phase 2 (built solo)
│   └── write-jest-tests.md        ← Phase 2 (built solo)
│
├── calculators/                   ← generated output, created at runtime
│   └── {calculator-name}/
│       ├── index.ts
│       ├── index.test.ts
│       └── README.md
│
├── logs/
│   └── audit.log                  ← created by hooks at runtime
│
├── CLAUDE.md                      ← Phase 1
├── rules.md                       ← Phase 3
├── docs/SYLLABUS.md               ← this file
└── docs/TEACHER_SETTINGS.md       ← teacher config
```

---

## Phase 0 — Environment Setup & Mental Map
**Time:** 15 min
**Entities introduced:** MCP config, folder structure
**Files created:** `mcp_settings.json`, base folder skeleton

### What you do
- Create the project folder from scratch
- Install Claude Code if not already installed (`npm install -g @anthropic-ai/claude-code`)
- Launch Claude Code from inside the project folder: `cd calculator-factory && claude`
- Create `.claude/mcp_settings.json` and wire all 5 MCPs locally
- Verify all MCPs are connected with: `/mcp` command inside Claude Code
- Draw the mental map of which entity lives where

### MCP servers to wire
```json
{
  "mcpServers": {
    "notion":     { "command": "npx", "args": ["@notionhq/mcp"] },
    "github":     { "command": "npx", "args": ["@modelcontextprotocol/server-github"] },
    "slack":      { "command": "npx", "args": ["@modelcontextprotocol/server-slack"] },
    "playwright": { "command": "npx", "args": ["@playwright/mcp"] },
    "docker":     { "command": "npx", "args": ["@modelcontextprotocol/server-docker"] }
  }
}
```

### What you learn
- Project-scoped vs global MCP config — why local is safer for learning
- Why the `.claude/` folder is the control center of everything
- The difference between "entity files you write" vs "output files agents generate"

### Understanding check before moving on
> "Look at the folder structure. Tell me which folders contain things YOU write vs things AGENTS generate at runtime."

### Tips covered
- Windows path quirks in MCP config (forward slashes, env vars)
- How to verify MCPs are connected: type `/mcp` inside Claude Code — shows all servers + status
- How to verify a specific MCP tool works: ask Claude Code "list available notion tools"
- Why we scope MCPs to project — prevents bleeding into other Claude Code projects

---

## Phase 1 — CLAUDE.md
**Time:** 15 min
**Entities introduced:** CLAUDE.md
**Files created:** `CLAUDE.md`

### What you do
Write the master context file for this project together.

### What goes in CLAUDE.md
- Project name and one-line purpose
- Tech stack (TypeScript, Node.js CLI, Docker)
- Output folder convention (`/calculators/{name}/`)
- Which skills exist and when to use them
- Reference to rules.md
- Reference to agents folder
- Learning context block (see below — critical for Claude Code sessions)

### The learning context block — add this to CLAUDE.md
```markdown
## Learning Context
This is a hands-on learning project for Claude Code entities.
At the start of every session, read:
- SYLLABUS.md — full phase plan and instructions
- TEACHER_SETTINGS.md — teaching style and preferences

Teaching mode is always ON. Explain WHY before HOW.
Guide Ilya to write — do not write for him unless asked.
```

This block ensures that even if Ilya forgets to mention the files,
any spawned subagent still inherits the teaching context automatically.

### What you learn
- CLAUDE.md is automatically injected into EVERY agent's context — it's the shared brain
- What belongs here vs in a Skill (project facts vs domain knowledge)
- What belongs here vs in Rules (context vs constraints)
- CLAUDE.md for a single repo vs monorepo (different patterns)

### Understanding check before moving on
> "If you added a new skill tomorrow, what's the minimum change you'd make to CLAUDE.md? Why?"

### Tips covered
- Keep CLAUDE.md under ~200 lines — agents read it every time, token cost matters
- Never put "how to do X" in CLAUDE.md — that belongs in a Skill
- Never put "never do X" in CLAUDE.md — that belongs in Rules

---

## Phase 2 — Skills
**Time:** 25 min
**Entities introduced:** Skills
**Files created:** `skills/read-notion-ticket.md`, `skills/typescript-cli-patterns.md`, `skills/write-jest-tests.md`

### Core concept before building
Skills are Markdown teaching manuals. The agent reads them and applies the knowledge.
They are PASSIVE — they don't run. They don't call tools. They teach.

The test for "is this a skill?":
> "Would a junior developer need to read this before starting the task?" → Skill.
> "Is this a constraint they must never violate?" → Rule.
> "Is this a fact about the project?" → CLAUDE.md.

### Skill 1 — Built together: `read-notion-ticket.md`
Teaches the agent how to extract a calculator spec from a Notion ticket.

Structure we write together:
```markdown
# Skill: Read Notion Ticket

## Purpose
When given a Notion ticket ID, extract a structured calculator spec.

## What to extract
- Calculator name (slug-friendly)
- Calculator type (financial / arithmetic / unit-conversion / other)
- Input fields: name, type, validation rules
- Output fields: what the calculator should return
- Business rules: formulas, edge cases, constraints
- Example inputs and expected outputs if provided

## Output format
Always output a JSON spec block:
{
  "name": "israeli-income-tax",
  "type": "financial",
  "inputs": [...],
  "outputs": [...],
  "rules": [...],
  "examples": [...]
}

## What to do if the ticket is vague
List what's missing and ask the orchestrator to flag it — never invent business rules.
```

### Skill 2 — You build solo: `typescript-cli-patterns.md`
Brief: Teach the agent how to structure a Node.js CLI in TypeScript.
Cover: commander.js usage, input validation with zod, async main pattern,
error handling (exit codes), colored output with chalk.

### Skill 3 — You build solo: `write-jest-tests.md`
Brief: Teach the agent how to write Jest tests for a calculator function.
Cover: describe/it structure, edge cases (negative numbers, zero, invalid input),
one happy path + two edge cases minimum per function.

### Understanding check before moving on
> "What's the difference between a Skill and a Rule? Give me a real example from this project where you had to decide which one to use."

### Tips covered
- Skill quality test: if an agent ignores it and still gets it right, the skill was too vague
- Skill length: 50–150 lines sweet spot. Longer = agent loses focus midway
- Never put executable code in a skill — pseudocode or patterns only
- Skills can reference other skills ("see typescript-cli-patterns.md for output format")

---

## Phase 3 — Rules
**Time:** 15 min
**Entities introduced:** Rules
**Files created:** `rules.md`

### Core concept before building
Rules are hard stops. The agent CANNOT override them, work around them,
or decide "in this case it's fine." They are non-negotiable.

The test for "is this a rule?":
> "If the agent violated this, would something break or be dangerous?" → Rule.
> "Is this just best practice?" → Skill or CLAUDE.md note.

### What you build together
```markdown
# Rules — Calculator Factory

## Code Rules
- NEVER modify files inside /calculators/{name}/ after the test-writer agent has run
- NEVER skip writing tests — a calculator without tests is not considered built
- ALWAYS output calculator files to /calculators/{name}/ — never to project root
- NEVER hardcode values that belong in the Notion ticket spec

## Git / Release Rules
- NEVER commit directly to main
- NEVER create a GitHub release if tests are failing
- ALWAYS create PRs as draft first

## Data Rules
- NEVER invent business rules not present in the Notion ticket
- If a ticket is ambiguous, STOP and report what's missing — do not guess

## Safety Rules
- NEVER delete files — move to /archive if needed
- NEVER expose secrets or env vars in generated code or logs
```

### The intentional break exercise
After writing rules, you'll deliberately instruct the agent to violate one rule,
and observe how it handles the conflict. This makes rules feel real, not theoretical.

### Understanding check before moving on
> "If you wanted the agent to 'prefer' using zod for validation but not require it — where does that go? Rule, Skill, or CLAUDE.md? Why?"

### Tips covered
- Fewer rules = stronger rules. 30 rules = agent treats them as suggestions
- Rules and Hooks are complementary: Rules tell the agent what not to do, Hooks enforce it mechanically
- Rules can't cover every edge case — that's what skills and agent judgment are for

---

## Phase 4 — Subagents
**Time:** 20 min
**Entities introduced:** Subagents, agent file anatomy
**Files created:** `agents/ticket-reader.md`, `agents/architect.md`

### Core concept before building
Every agent file is a system prompt. Nothing more.
The difference between orchestrator and subagent is only:
- Orchestrator uses the `Task` tool to spawn others
- Subagent focuses on one thing and returns a structured result

### Agent file anatomy
```markdown
# Agent: {Name}

## Role
One sentence. What is this agent's single responsibility?

## Context
What does it need to know to do its job?
(Reference CLAUDE.md facts, point to relevant skills)

## Input
What does it receive? (from orchestrator handoff or user)

## Steps
Numbered. What does it do, in order?

## Output
Exact format of what it returns to the orchestrator.

## Tools allowed
List only what this agent needs — don't give every agent every tool.

## Rules
Any agent-specific constraints (plus it inherits global rules.md)
```

### Agent 1 — Built together: `ticket-reader.md`
Role: Reads a Notion ticket by ID, extracts the calculator spec using the
`read-notion-ticket` skill, outputs a structured JSON spec.

### Agent 2 — You build solo: `architect.md`
Brief: Receives the JSON spec from ticket-reader. Designs the TypeScript file structure:
function signatures, input/output types, formula outline (not implementation).
Outputs a design document that the builder agent will follow.

### Understanding check before moving on
> "Why does ticket-reader output JSON specifically, instead of just describing the spec in prose?"

### Tips covered
- One responsibility per agent — if you're writing "and then it also...", split it
- Explicitly list allowed tools per agent — an agent with no tool constraints will improvise badly
- Output format matters as much as the logic — the next agent depends on it exactly
- Agents don't share memory — everything must be in the handoff message

---

## Phase 5 — Hooks
**Time:** 25 min
**Entities introduced:** Hooks
**Files created:** `hooks/pre-tool-use.py`, `hooks/post-file-write.py`, `hooks/audit-logger.py`

### Core concept before building
Hooks are Python/bash scripts that fire on specific Claude Code events.
They are the ONLY entity besides agents and MCP servers that is actual running code.

Hook events:
- `pre-tool-use` — fires BEFORE a tool call. Can BLOCK it.
- `post-tool-use` — fires AFTER a tool call. Can LOG or REACT.
- `pre-response` — fires before Claude responds to the user.

Hook script receives event JSON on stdin. Returns decision JSON on stdout.

```python
import json, sys
event = json.load(sys.stdin)
# event has: tool_name, tool_input, conversation_id

# To approve:
print(json.dumps({"decision": "approve"}))

# To block:
print(json.dumps({"decision": "block", "reason": "Why it was blocked"}))
```

### Hook 1 — Built together: `pre-tool-use.py`
Guards: block any bash command containing `rm -rf`,
block any git push targeting `main`,
block any file write outside the `/calculators/` folder during build phase.

### Hook 2 — You build solo: `post-file-write.py`
Brief: After any `.ts` file is written inside `/calculators/`,
automatically trigger `npx tsc --noEmit` on that file to catch type errors immediately.
If tsc fails, log the error to `logs/audit.log`.

### Hook 3 — You build solo: `audit-logger.py`
Brief: After EVERY tool call (any tool), append a line to `logs/audit.log`:
timestamp, agent name if available, tool name, and a short summary of what it did.

### Understanding check before moving on
> "A hook and a rule both prevent the agent from pushing to main. Why do you need both? What does each one actually do?"

### Tips covered
- Hooks fail silently if they crash — always wrap in try/catch and log errors
- A bad hook can block ALL agent actions — test hooks in isolation first
- Hooks don't have access to agent context automatically — only what's in the event payload
- `pre-tool-use` is the safety layer. `post-tool-use` is the reaction layer.
- Keep hooks fast — a slow hook adds latency to every single tool call

---

## Phase 6 — Prompt File
**Time:** 10 min
**Entities introduced:** Prompt files (slash commands)
**Files created:** `.claude/commands/build-calculator.md`

### Core concept before building
Prompt files are slash commands. Only HUMANS trigger them.
An agent never calls a prompt file — agents use the `Task` tool to spawn other agents.

Prompt files are the front door of the entire pipeline.

### What you build together
```markdown
<!-- .claude/commands/build-calculator.md -->

# /build-calculator

You are starting a Calculator Factory build run.

Notion Ticket ID: $ARGUMENTS

Steps:
1. Read skills/read-notion-ticket.md
2. Spawn the orchestrator agent with the ticket ID
3. Report back when the orchestrator confirms completion

Rules: Follow all rules in rules.md.
```

Usage: `/build-calculator abc123def456`

### Understanding check before moving on
> "Why can't an agent trigger /build-calculator to start a sub-build? What would you use instead?"

### Tips covered
- `$ARGUMENTS` is the only variable available in prompt files
- In Claude Code, slash commands appear as autocomplete when you type `/` — try it
- Keep prompt files short — they're entry points, not instruction manuals
- The prompt file should reference agents and skills, not duplicate their content
- You can have multiple prompt files for different entry points:
  `/build-calculator`, `/rebuild-calculator`, `/test-calculator`

---

## Phase 7 — Orchestrator & Handoffs
**Time:** 25 min
**Entities introduced:** Orchestrator agent, Task tool, handoff pattern
**Files created:** `agents/orchestrator.md`, `agents/builder.md`, `agents/test-writer.md`, `agents/docs-writer.md`

### Core concept before building
The orchestrator is just another agent — same file format.
What makes it an orchestrator is that it uses the `Task` tool to spawn subagents,
passing a handoff message to each one.

A handoff is a structured message — it's not a file type or entity,
it's a pattern: everything the receiving agent needs, nothing it doesn't.

### Good handoff anatomy
```markdown
# Handoff to: {agent-name}

## What was done before you
- Ticket read: ✅ (ticket-reader)
- Architecture designed: ✅ (architect)

## Your task
{specific instruction}

## Input you need
{structured data from previous agent output}

## Output expected from you
{exact format}

## Constraints
{any specific rules for this step}
```

### What you build together: `orchestrator.md`
The orchestrator:
1. Receives ticket ID from prompt file
2. Spawns ticket-reader → waits for JSON spec
3. Spawns architect → waits for design doc
4. Spawns builder → waits for generated files
5. Spawns test-writer → waits for test results
6. Spawns docs-writer → waits for README
7. Spawns publisher (Phase 8) → waits for confirmation
8. Reports completion summary

### What you build (guided, not solo): `builder.md`, `test-writer.md`, `docs-writer.md`
These follow the same agent anatomy. Claude walks you through each one,
you write, Claude reviews.

### Understanding check before moving on
> "The architect agent returned its design doc. Write a handoff message to the builder agent. What must you include? What would you leave out?"

### Tips covered
- Orchestrator should be dumb about implementation — it coordinates, it doesn't decide HOW to build
- Sequential vs parallel spawning: sequential when output of A is input of B, parallel when independent
- If a subagent fails: retry once, then surface the error — don't silently skip
- Token management: handoff messages accumulate — keep them structured and concise
- The orchestrator is where 80% of multi-agent bugs appear — log its decisions

---

## Phase 8 — MCP Integration
**Time:** 25 min
**Entities introduced:** MCP servers (hands-on with all 5)
**Files created:** `agents/publisher.md`

### Core concept before building
MCP servers are external processes that expose tools the agent can call.
The agent calls them like functions. They return results. That's it.

The agent decides WHEN to call them. The MCP server decides HOW to execute.

### Publisher agent — built together: `agents/publisher.md`
This is the final agent in the chain. It uses ALL 5 MCPs in sequence.

| Step | MCP Used | What it does |
|---|---|---|
| 1 | Notion | Update ticket status to "Built", add output file links |
| 2 | Docker | Build the container, verify it runs and exits cleanly |
| 3 | Playwright | Run the CLI inside container, screenshot the output |
| 4 | GitHub | Create a release with the README as release notes |
| 5 | Slack | Post announcement: calculator name, GitHub release link, screenshot |

### One focused exercise per MCP

**Notion:** Read a ticket, then update its status.
You'll learn: how to structure Notion API calls, how to parse Notion block content.

**Docker:** Build an image from a Dockerfile, run it, read its logs.
You'll learn: how the agent constructs docker build/run commands via Bash tool vs Docker MCP.

**Playwright:** Run the CLI, capture terminal output as screenshot.
You'll learn: headless browser context for CLI vs web, how to pass the screenshot to the next step.

**GitHub:** Create a release with a tag and description.
You'll learn: GitHub release vs PR — when the agent should use which.

**Slack:** Post a formatted message with an attachment.
You'll learn: Slack message blocks format, how to attach a file (screenshot) to a message.

### Understanding check before moving on
> "The Docker MCP and the Bash tool can both run docker commands. How would you decide which to use for a given step? What's the tradeoff?"

### Tips covered
- Always handle MCP errors gracefully — external services fail, agents shouldn't crash
- Rate limits: GitHub API has limits per hour — don't spawn parallel publisher agents
- MCP tool discovery: agents can ask an MCP what tools it exposes — useful for debugging
- Never put API keys in mcp_settings.json — use env vars and .env file (gitignored)
- Test MCPs independently before wiring them into the agent pipeline

---

## Phase 9 — Memory & Polish
**Time:** 15 min
**Entities introduced:** Agent memory, project polish
**Files created:** `.claude/memory.json`

### What memory is for
Memory lets the agent remember facts across sessions.
Without memory: every run starts from zero.
With memory: agent remembers the last calculator built, its status, any failed runs.

### What you build together
Memory file structure:
```json
{
  "last_run": {
    "ticket_id": "abc123",
    "calculator_name": "israeli-income-tax",
    "status": "completed",
    "timestamp": "2025-01-15T14:32:00Z"
  },
  "built_calculators": [
    "israeli-income-tax",
    "compound-interest"
  ],
  "failed_runs": []
}
```

Add memory read/write steps to the orchestrator:
- At start: read memory, check if this ticket was already built → skip if so
- At end: update memory with result

### Memory vs PostgreSQL — the distinction
| Memory file | PostgreSQL (via MCP) |
|---|---|
| Ephemeral context | Permanent history |
| Fast, no query needed | Queryable, sortable |
| Lost if deleted | Survives everything |
| Good for: last run, current state | Good for: full run history, analytics |

### Final tips session (the high-value stuff)
- **Debugging a broken agent pipeline:** where to look first, how to isolate which agent failed
- **Token budget management:** what happens when the orchestrator context gets too large
- **Checkpoints:** how to save agent state and roll back a bad run
- **`--dangerouslySkipPermissions`:** what it actually bypasses and when it's genuinely safe
- **The most common mistake:** agents that are too broad and try to do too much in one step

---

## Full Entity Coverage Map

| Entity | Phase | Built | Depth |
|---|---|---|---|
| MCP config | 0 | Together | Setup + understand |
| CLAUDE.md | 1 | Together | Build + explain what belongs here |
| Skills (×3) | 2 | 1 together + 2 solo | Full anatomy + quality test |
| Rules | 3 | Together | Hard vs soft + intentional break exercise |
| Subagents (×2) | 4 | 1 together + 1 solo | Full anatomy + output format |
| Hooks (×3) | 5 | 1 together + 2 solo | All 3 event types + failure modes |
| Prompt File | 6 | Together | Human entry point pattern |
| Orchestrator + Handoffs | 7 | Together (guided) | Task tool + handoff anatomy |
| MCP Servers (×5) | 8 | Together | One exercise per MCP |
| Memory | 9 | Together | Memory vs DB distinction |

---

## How to Run a Session in Claude Code

**First time ever (before Phase 0):**
```bash
mkdir calculator-factory
cd calculator-factory
claude
```

**Every session after that:**
```bash
cd calculator-factory
claude
```

Then just tell Claude Code which phase to start:
```
Read SYLLABUS.md and TEACHER_SETTINGS.md, then let's start Phase 0
```
```
Read SYLLABUS.md and TEACHER_SETTINGS.md. Last completed: Phase 2. Start Phase 3.
```

Claude Code reads both files directly from disk using the Read tool — no pasting needed.
CLAUDE.md (once created in Phase 1) is loaded automatically on every launch.

**At the end of any session:** say "Pause point" — Claude Code will summarize what
was covered and tell you exactly what to update in TEACHER_SETTINGS.md before next session.

---

## After the Project — What You Can Do Next

With all entities learned, natural next steps:

- **Add a 6th MCP** (PostgreSQL) to store full build history
- **Rebuild your `feature-agent` CLI** (which you already have at Ness Tech) using everything learned here
- **Port learnings to your security vulnerability fixing system** (your active Claude Code project)
- **Build a `/rebuild-calculator` prompt file** that patches an existing calculator from a follow-up Notion ticket
- **Add parallel subagent spawning** in the orchestrator — architect + ticket-reader run simultaneously

---

*This syllabus is a guide, not a contract. Phases can be extended, split, or reordered based on what needs more time.*
*Update TEACHER_SETTINGS.md after every session.*
