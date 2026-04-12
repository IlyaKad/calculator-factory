# Claude Code — General Cheatsheet
## Not project-specific. Applies to any Claude Code agentic system.

---

## Entity Types & What They Are

| Entity | What it is | Executable? | Auto-loaded? |
|---|---|---|---|
| `CLAUDE.md` | Shared context injected into every agent | No | ✅ Always |
| Skill | Passive Markdown — domain knowledge agents read on demand | No | No |
| Rule | Hard constraints agents must reason about | No | No |
| Prompt File | Human-triggered entry point via `/command` | No | No |
| Agent / Subagent | Markdown defining role, input, steps, output, tools | No | No |
| Hook | Python script that fires on tool lifecycle events | ✅ Yes | ✅ Always |
| MCP Server | External tool server agents call via protocol | ✅ Yes | ✅ Always |
| Memory | JSON file for persistent cross-session state | No | No |

---

## Entity File Structure & Recommended Size

### CLAUDE.md
```
# Project Name
## Purpose / Overview
## Tech Stack
## Output Convention
## Agents (table)
## Defaults
## Rules pointer
## Learning Context (if applicable)
```
**Size:** Under 150 lines. Every agent loads it — keep it lean.

---

### Skill (`skills/{name}.md`)
```
# Skill: {Name}
## Purpose
## [Domain-specific sections]
## Rules for this skill
## Output format
```
**Size:** Under 100 lines. Single topic. If it's getting long, split into two skills.

---

### Rules (`rules.md`)
```
# Rules — {Project Name}
## {Category 1} Rules   (e.g. Workflow, Code, Git, Data, Safety)
## {Category 2} Rules
...
```
**Size:** Under 80 lines. Short imperative sentences. No explanations — if a rule needs explaining, put that in a skill or CLAUDE.md.

---

### Prompt File (`.claude/commands/{name}.md`)
```
# /{command-name}
## Usage         (code block with examples)
## Input         ($ARGUMENTS description)
## What to do   (numbered steps)
## Rules
```
**Size:** Under 40 lines. Thin entry point only — no domain logic here.

---

### Agent (`.claude/agents/{name}.md`)
```
# Agent: {Name}
## Role           (1-2 sentences)
## Context        (what it needs to know before starting)
## Input          (JSON contract — orchestrator reads this)
## Steps          (numbered, one action per step)
## Output         (JSON contract — orchestrator verifies this)
## Tools Allowed  (explicit list)
## Rules          (agent-specific only — don't duplicate rules.md)
```
**Size:** Under 120 lines. If steps are getting long, the agent is doing too much — split it.

---

### Hook (`.claude/hooks/{name}.py`)
```python
import json, sys

def approve(): print(json.dumps({"decision": "approve"}))
def block(r):  print(json.dumps({"decision": "block", "reason": r}))

def main():
    try:
        event      = json.load(sys.stdin)
        tool_name  = event.get("tool_name", "")
        tool_input = event.get("tool_input", {})
        # ... your logic ...
        approve()
    except Exception as e:
        print(f"Hook error: {e}", file=sys.stderr)
        approve()  # ALWAYS approve on crash — never freeze the pipeline

if __name__ == "__main__":
    main()
```
**Size:** Under 80 lines per hook. One hook file per concern.

---

### MCP Config (`.claude/mcp_settings.json`)
```json
{
  "mcpServers": {
    "{name}": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "{package}"],
      "env": { "API_KEY": "${ENV_VAR}" }
    }
  }
}
```
Credentials always via `${ENV_VAR}` — never hardcoded.

---

## Hook Lifecycle Events

| Event | When it fires | Can block? | Use for |
|---|---|---|---|
| `PreToolUse` | Before any tool executes | ✅ Yes | Guards, allowlists, blocking dangerous commands |
| `PostToolUse` | After any tool completes | No | Logging, side effects, locking files |
| `Notification` | When agent sends a notification | No | Monitoring, alerts |
| `Stop` | When agent finishes | No | Cleanup, final state sync |

**Hook input format:**
```json
{ "tool_name": "Bash", "tool_input": { "command": "..." } }
```
**MCP tool name format:** `mcp__{server}__{tool}` e.g. `mcp__github__push_files`

---

## Context Inheritance: Agent vs Subagent

| What | Main agent | Subagent |
|---|---|---|
| `CLAUDE.md` | ✅ Auto-loaded | ✅ Auto-loaded |
| Full conversation history | ✅ Has it | ❌ Does NOT have it |
| Tool results from parent | ✅ Has it | ❌ Does NOT have it |
| Explicit handoff content | ✅ Has it | ✅ Has it (only this) |
| Files on disk | ✅ Can read | ✅ Can read (same filesystem) |
| MCP servers | ✅ Available | ✅ Available |
| Hooks | ✅ Fire | ✅ Fire (same session) |

**Key rule:** A subagent only knows what the parent explicitly passes in the handoff + what it reads from disk. Nothing else. Design handoffs to be complete — don't assume context will "leak" from the parent.

---

## Token Saving Strategies

### 1. Fail early on missing data
Stop the pipeline at the first sign of incomplete input (`missing[]` check).
Running 5 more agents to discover a missing field at the end wastes all of them.

### 2. User approval at design, not at implementation
Get approval on the architect design (cheap — just text).
Not after builder + test-writer have run (expensive — multiple agents).

### 3. Lean orchestrator
Orchestrator reads agent `## Input` instead of getting the full agent file context.
Less context per spawn = fewer tokens per coordination step.

### 4. Scope tool permissions tightly
Agent files list `## Tools Allowed`. An agent that only needs `Read` and `Bash` shouldn't also have `Write` — fewer available tools = less context injected per turn.

### 5. Retry limit on agents
Max 1-2 retries before stopping. Indefinite retry loops burn the entire context window.

### 6. Skills over inline instructions
Repeating the same instructions in every agent file multiplies token cost each time an agent loads. Put shared knowledge in a skill — agents read it once when needed.

### 7. Subagent context is minimal by design
Subagents start with only CLAUDE.md + their handoff. This is a feature — they don't carry the full conversation history. Use it: spawn subagents for isolated tasks where you want a clean, focused context.

### 8. Hooks don't count against agent context
Hooks run as separate Python processes — they don't inflate the agent's context window. Move side effects (logging, status syncing) to hooks instead of agent steps.

### 9. Memory over re-reading
If an agent re-reads the same file on every run (ticket spec, architect design), cache the key facts in `memory.json`. Read memory once at start instead of re-fetching.

### 10. Short, structured outputs
Agents that output structured JSON (not prose) are cheaper to parse and produce.
A 500-token JSON handoff is worth more than a 2000-token narrative summary.

---

## Useful Hook Patterns

### Block a specific bash command
```python
if "rm -rf" in tool_input.get("command", ""):
    block("Blocked: use /archive/ instead")
    return
approve()
```

### Allow writes only to specific paths
```python
path = tool_input.get("file_path", "")
allowed = ["/src/", "/tests/", "docs/"]
if any(path.startswith(p) for p in allowed):
    approve()
else:
    block(f"Write to '{path}' not allowed")
```

### Fire only on a specific MCP tool
```python
if tool_name == "mcp__github__push_files":
    # your logic
approve()
```

### PostToolUse — act after a file is written
```python
# tool_name is still the original tool (e.g. "Write")
# tool_input has file_path, content, etc.
if tool_name == "Write" and file_path.endswith(".test.ts"):
    run_coverage_check(file_path)
approve()
```

---

## settings.json Hook Registration

Hooks are registered in `.claude/settings.json` (project) or `~/.claude/settings.json` (global):

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "*", "hooks": [{ "type": "command", "command": "python .claude/hooks/pre-tool-use.py" }] }
    ],
    "PostToolUse": [
      { "matcher": "Write", "hooks": [{ "type": "command", "command": "python .claude/hooks/post-file-write.py" }] }
    ]
  }
}
```

`matcher: "*"` = fires on every tool. `matcher: "Write"` = fires only on Write tool calls.

---

## Common Mistakes

| Mistake | Correct approach |
|---|---|
| Hook crashes without `approve()` | Always `approve()` in `except` block |
| Subagent assumes parent context | Pass everything needed explicitly in handoff |
| Domain logic in prompt file | Move to agent or skill |
| Hardcoded credentials in mcp_settings.json | Use `${ENV_VAR}` placeholders |
| Retrying indefinitely on failure | Max 1-2 retries, then stop and report |
| Same instructions repeated in every agent | Extract to CLAUDE.md or a skill |
| Writing tests after seeing implementation | Write tests from the interface/spec, not the code |
| Storing cross-session state in .build-state.json | Use memory.json — .build-state.json is ephemeral |
