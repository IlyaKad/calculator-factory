# Calculator Factory — Extended Summary

## Table of Contents
- [1. CLAUDE.md](#1-claudemd)
- [2. Skills](#2-skills)
- [3. Rules](#3-rules)
- [4. Subagents](#4-subagents)
- [5. Hooks](#5-hooks)
- [6. Prompt Files](#6-prompt-files)
- [7. Orchestrator](#7-orchestrator)
- [8. MCP Servers](#8-mcp-servers)
- [9. Memory](#9-memory)
- [Key Design Decisions](#key-design-decisions)

---

## 1. CLAUDE.md

**File:** `CLAUDE.md`

The one file injected into every agent automatically by the Claude Code runtime. No agent needs to read it explicitly — it's always there.

Contains: tech stack, output file convention, skills table, agents table, pipeline order, defaults (Slack channel, GitHub repo), rules pointer, learning context.

**Key insight:** Because every agent sees it, it's the right place for anything that all agents need to know. Adding a new agent = add it to the agents table here.

**What it is NOT:** it's not a rule file, not a skill, not memory. It's shared context.

---

## 2. Skills

**Files:** `skills/read-notion-ticket.md`, `skills/typescript-patterns.md`, `skills/write-jest-tests.md`

Passive Markdown documents — teaching manuals that agents read on demand. Not auto-loaded. Agent must explicitly `Read` the skill file.

| Skill | Used by | Purpose |
|---|---|---|
| read-notion-ticket | ticket-reader | How to extract and structure a Notion ticket |
| typescript-patterns | builder, test-runner | The 3-file split, naming conventions, code patterns |
| write-jest-tests | test-writer | TODO planning step, test structure, coverage rules |

**Key insight:** Skills exist so domain knowledge lives in one place — not duplicated across multiple agent files. Update the skill, all agents that use it benefit.

**Skills vs Rules vs CLAUDE.md:**
- Skill = HOW to do a specific task
- Rule = hard constraint, non-negotiable
- CLAUDE.md = shared context for all agents

---

## 3. Rules

**File:** `rules.md`

Hard stops. No agent may override, work around, or make exceptions. If an instruction conflicts with a rule — the rule wins.

5 sections: Workflow, Code, Git/Release, Data, Safety.

**Enforced two ways:**
1. Agent reasoning — agent reads rules.md and applies them
2. Hooks — mechanical enforcement regardless of reasoning (e.g. blocking `rm -rf`)

**Key insight:** Rules enforce *reasoning*. A rule like "never invent business rules" can't be mechanically detected — the agent must understand and apply it. That's why hooks are also needed for things that CAN be detected mechanically.

---

## 4. Subagents

**Files:** `.claude/agents/*.md`

Each agent is a Markdown file with sections: Role, Context, Input, Steps, Output, Tools Allowed, Rules.

The `## Input` section IS the handoff contract — the orchestrator reads it before spawning.
The `## Output` section IS the verification contract — the orchestrator checks it after.

**Agent roster:**
| Agent | Spawned by | Conditional? |
|---|---|---|
| orchestrator | prompt file | No |
| ticket-reader | orchestrator | No |
| fetch-agent | orchestrator | Yes — only if urls[] non-empty |
| architect | orchestrator | No |
| builder | orchestrator | No |
| test-writer | orchestrator | No |
| test-runner | orchestrator | No |
| ui-tester | orchestrator | No |
| docs-writer | orchestrator | No |
| publisher | orchestrator | No |

**Key insight:** All agent files have identical structure. "Subagent" just means spawned by another agent. The orchestrator is also an agent — just spawned by a prompt file.

---

## 5. Hooks

**Files:** `.claude/hooks/*.py`

The only entity (besides MCP servers) that is actual running code. Python scripts that fire automatically on tool events.

**4 lifecycle events:**
| Event | Can block? | Used in this project |
|---|---|---|
| PreToolUse | ✅ Yes | `pre-tool-use.py` |
| PostToolUse | No | `post-file-write.py`, `audit-logger.py`, `notion-status-sync.py` |
| Notification | No | — |
| Stop | No | — |

**Our 4 hooks:**
- `pre-tool-use.py` — blocks `rm -rf`, `git push main`, writes outside allowed paths
- `post-file-write.py` — runs coverage check, locks `logic.test.ts` if ≥70%
- `audit-logger.py` — logs every tool call to `logs/audit.log`
- `notion-status-sync.py` — calls Notion REST API directly to update ticket status

**Key insight:** Hooks can't use MCP servers — they're plain Python with only stdin/stdout access. Always `approve()` in the `except` block — a crashed hook must never freeze the pipeline.

**MCP tool_name format:** `mcp__{server}__{tool}` e.g. `mcp__playwright__browser_navigate`

---

## 6. Prompt Files

**Files:** `.claude/commands/build-calculator.md`, `.claude/commands/calculator-finish.md`

Human-only entry points. Triggered by `/command` in the Claude Code CLI. Agents cannot trigger prompt files.

**Thin entry points — they:**
- Accept `$ARGUMENTS`
- Write initial state (`.build-state.json`)
- Spawn the orchestrator with a handoff
- Wait for completion and report back

**Key insight:** `.build-state.json` is written by the prompt file (not the orchestrator) because hooks need `ticket_id` immediately on the first file write — before the orchestrator has started.

---

## 7. Orchestrator

**File:** `.claude/agents/orchestrator.md`

Coordinates the full pipeline. Does not implement, test, or publish anything itself.

**Lean pattern:** reads CLAUDE.md for agent list, reads each agent's `## Input` before spawning. No hardcoded handoffs — the agent's own file is the contract.

**Key responsibilities:**
- Reads `memory.json` on start (Step 0) — skips if already built
- Maintains `.build-state.json` throughout
- Gets user approval after architect (Step 3)
- Handles failures: retry once, then stop
- Writes to `memory.json` on finish (Step 9)

**Conditional logic:**
- fetch-agent: only if `urls[]` non-empty
- If `missing_unresolved[]` non-empty after fetch: stop pipeline

---

## 8. MCP Servers

**Config:** `.claude/mcp_settings.json`

5 MCP servers, all project-scoped (not global):

| MCP | Used by | Purpose |
|---|---|---|
| Notion | ticket-reader, publisher, notion-status-sync hook | Read tickets, update status |
| GitHub | publisher | Create releases, push files |
| Slack | publisher | Post announcements |
| Playwright | fetch-agent (fallback), ui-tester, publisher | Browser automation, screenshots |
| Docker | publisher | Build and verify containers |

**Credentials:** `${ENV_VAR}` placeholders in config → actual tokens in `.env` (gitignored).

**Key insight:** Publisher treats each MCP as independent — failure in one doesn't stop others. Each serves a different audience.

---

## 9. Memory

**File:** `.claude/memory.json`

Persistent state that survives across sessions. Read at Step 0, written at Step 9.

**Schema:**
```json
{
  "project": { "github_repo", "slack_channel", "notion_database_id" },
  "builds": { "last_ticket_id", "last_calculator_name", "total_built" },
  "calculators": [ { "ticket_id", "name", "status", "build_time", "path", "coverage", "github_release_url" } ],
  "decisions": [ { "ticket_id", "calculator_name", "decision", "timestamp" } ]
}
```

**Key insight:** Memory is for facts that outlive a session. `.build-state.json` is ephemeral (deleted after each run). `memory.json` is permanent. Architect decisions go in memory so they don't need re-approval on reruns.

**Race condition:** two concurrent runs both read then write the file — second write overwrites first. Fix: separate file per run, merge on finish.

---

## Key Design Decisions

| Decision | Why |
|---|---|
| Tests locked read-only after test-writer | Code is fixed to pass tests, never the reverse |
| Orchestrator reads agent `## Input` instead of hardcoding | Single source of truth, no duplication |
| Hooks call Notion REST directly, not MCP | Hooks don't have access to MCP runtime |
| publisher treats each MCP as independent | Resilience — Slack outage shouldn't block GitHub release |
| `.build-state.json` written by prompt file, not orchestrator | Hooks need `ticket_id` immediately on first file write |
| `missing[]` is blocking | Never build a calculator on incomplete spec |
| UI tests not locked | UI evolves — locking makes iteration impossible |
