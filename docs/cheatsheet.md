# Claude Code — Cheatsheet

## Entities

| Entity | Type | Active | Auto-loaded | Triggered by |
|---|---|---|---|---|
| CLAUDE.md | Markdown | No | ✅ Always | Runtime on agent spawn |
| Skill | Markdown | No | No | Agent reads explicitly |
| Rule | Markdown | No | No | Agent reads explicitly |
| Prompt File | Markdown | No | No | Human via `/command` |
| Subagent | Markdown | No | No | Parent agent spawns |
| Orchestrator | Markdown | No | No | Prompt file spawns |
| Hook | Python | ✅ | ✅ Always | Tool events |
| MCP Server | Config+npm | ✅ | ✅ Always | Agent calls MCP tool |
| Memory | JSON | No | No | Agent reads/writes |

---

## Hook Lifecycle Events

| Event | Fires | Can block? |
|---|---|---|
| `PreToolUse` | Before any tool call | ✅ Yes |
| `PostToolUse` | After any tool call | No |
| `Notification` | On agent notification | No |
| `Stop` | When agent stops | No |

---

## Hook Input/Output

**Input** (via stdin):
```json
{
  "tool_name": "Bash",
  "tool_input": { "command": "rm -rf /" }
}
```

**Output** (via stdout):
```json
{ "decision": "approve" }
{ "decision": "block", "reason": "Not allowed" }
```

---

## MCP Tool Name Format

```
mcp__{server_name}__{tool_name}
```
Examples:
- `mcp__playwright__browser_navigate`
- `mcp__github__push_files`
- `mcp__claude_ai_Notion__notion-fetch`
- `mcp__claude_ai_Slack__slack_send_message`

---

## Agent File Structure

```markdown
# Agent: {Name}
## Role
## Context
## Input        ← handoff contract (orchestrator reads this before spawning)
## Steps
## Output       ← verification contract (orchestrator checks this after)
## Tools Allowed
## Rules
```

---

## Prompt File Structure

```markdown
# /{command-name}
## Usage
## Input        ($ARGUMENTS)
## What to do   (steps)
## Rules
```

---

## Skill File Structure

```markdown
# Skill: {Name}
## Purpose
## [domain sections]
## Output to Orchestrator / Rules
```

---

## Project File Locations

```
CLAUDE.md                          ← auto-loaded into every agent
rules.md                           ← hard constraints
skills/{name}.md                   ← passive domain knowledge
.claude/agents/{name}.md           ← agent definitions
.claude/commands/{name}.md         ← slash commands (prompt files)
.claude/hooks/{event}.py           ← hook scripts
.claude/mcp_settings.json          ← MCP server config
.claude/memory.json                ← persistent runtime state
.build-state.json                  ← current run state (runtime, gitignored)
finished-builds.json               ← completed runs log (runtime, gitignored)
logs/audit.log                     ← hook audit trail (runtime, gitignored)
calculators/{name}/logic.ts        ← generated: pure calculator logic
calculators/{name}/logic.test.ts   ← generated: Jest tests (LOCKED)
calculators/{name}/app/page.tsx    ← generated: React UI
calculators/{name}/app/api/route.ts ← generated: Next.js API route
calculators/{name}/package.json    ← generated: standalone dependencies
calculators/{name}/Dockerfile      ← generated: runs calculator as container
calculators/{name}/README.md       ← generated: usage docs
```

---

## Pipeline Order

```
ticket-reader → [fetch-agent] → architect → builder →
test-writer → test-runner → simplify → ui-tester →
docs-writer → publisher
```
`[fetch-agent]` = conditional, only if ticket has URLs.

---

## MCP Servers (this project)

| Name | npm package | Used for |
|---|---|---|
| Notion | `@anthropic-ai/mcp-server-notion` | Read tickets, update status |
| GitHub | `@anthropic-ai/mcp-server-github` | Releases, file pushes |
| Slack | `@anthropic-ai/mcp-server-slack` | Announcements |
| Playwright | `@playwright/mcp` | Browser automation, screenshots |
| Docker | `@anthropic-ai/mcp-server-docker` | Container builds |

---

## mcp_settings.json Pattern (Windows)

```json
{
  "mcpServers": {
    "notion": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@anthropic-ai/mcp-server-notion"],
      "env": { "NOTION_API_KEY": "${NOTION_TOKEN}" }
    }
  }
}
```

---

## memory.json Schema

```json
{
  "project": { "github_repo", "slack_channel", "notion_database_id" },
  "builds":  { "last_ticket_id", "last_calculator_name", "total_built" },
  "calculators": [
    { "ticket_id", "name", "status", "build_time", "path", "coverage", "github_release_url" }
  ],
  "decisions": [
    { "ticket_id", "calculator_name", "decision", "timestamp" }
  ]
}
```

---

## OS File Locking (post-file-write hook)

```python
import platform, stat, os, subprocess

def lock_file(path):
    if platform.system() == "Windows":
        subprocess.run(["attrib", "+R", path], check=False)
    else:
        current = os.stat(path).st_mode
        os.chmod(path, current & ~(stat.S_IWRITE | stat.S_IWGRP | stat.S_IWOTH))
```

---

## Slash Commands

```
/build-calculator {notion-ticket-id}   ← build one ticket
/build-calculator batch                ← build all "Not Started" tickets
/calculator-finish                     ← finish current active build
/calculator-finish {ticket-id}         ← finish specific ticket
/calculator-finish batch               ← finish all in finished-builds.json
```
