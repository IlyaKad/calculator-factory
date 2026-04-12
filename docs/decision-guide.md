# When to Use Which Entity — Decision Guide

A practical guide for the most common "where does this belong?" questions.

---

## Where does this knowledge go?

| If it's... | Put it in |
|---|---|
| Needed by ALL agents always | `CLAUDE.md` |
| HOW to do a specific task (reusable) | `skills/{name}.md` |
| A hard constraint, no exceptions | `rules.md` |
| A human entry point to start a flow | `.claude/commands/{name}.md` (prompt file) |
| A step in the pipeline | `.claude/agents/{name}.md` |
| Something that must fire automatically on a tool event | `.claude/hooks/{event}.py` |
| State that must survive across sessions | `.claude/memory.json` |
| State for the current run only | `.build-state.json` |
| An external system connection | `.claude/mcp_settings.json` |

---

## Should this be a rule or a hook?

**Make it a rule if:**
- The constraint requires reasoning or judgment (e.g. "never invent business rules not in the ticket")
- It depends on context that can't be mechanically detected
- It's about WHAT to do, not WHETHER to proceed

**Make it a hook if:**
- The constraint can be detected mechanically from the tool name + input
- You want it enforced even if the agent ignores rules
- It involves a specific tool call (Bash, Write, MCP tool)
- You need it to block the action, not just advise against it

**Make it both if:**
- It's critical enough to need two layers (e.g. no push to main, no delete)

---

## Should this be in CLAUDE.md or the agent file?

**Put it in CLAUDE.md if:**
- Every agent needs to know it
- It's project-wide config or conventions
- It describes the overall system (pipeline order, tech stack, defaults)

**Put it in the agent file if:**
- Only that agent needs it
- It's specific to that agent's role or tools
- It's the input/output contract for that agent

---

## Should this be in memory.json or .build-state.json?

**memory.json if:**
- It needs to survive after the current run ends
- It's useful for future runs of the same or different calculators
- It's a historical record (what was built, decisions made)

**.build-state.json if:**
- It's only relevant during the current build
- Hooks need to read it mid-run (ticket_id, calculator_name, status)
- It should be deleted when the build completes or fails

---

## Should this logic go in logic.ts, route.ts, or page.tsx?

**logic.ts if:**
- It's a calculation, formula, or business rule
- It has no dependency on HTTP, React, or any framework
- It needs to be unit tested

**route.ts if:**
- It's about parsing the HTTP request or formatting the HTTP response
- It imports from logic.ts and passes data through
- It's error handling for the HTTP layer

**page.tsx if:**
- It's about form state, user interaction, or display
- It calls the API route via `fetch()`
- It handles loading/error/result UI states

**Rule of thumb:** If you're writing math in route.ts or page.tsx, stop. Move it to logic.ts.

---

## Should this be a new agent or a new step in an existing agent?

**New agent if:**
- The task has a distinct role that could be replaced or retried independently
- The task has its own input/output contract
- The task needs different tools than the existing agent
- Failure of this task should be isolated from other tasks

**New step in existing agent if:**
- It's a sub-task that logically belongs to the same role
- It always runs as part of the same flow with no independent retry
- It uses the same tools and context

---

## Should this be in the orchestrator or the agent?

**Orchestrator if:**
- It's coordination logic (order of steps, conditionals, failure handling)
- It involves deciding whether to spawn an agent at all
- It's about passing data between agents

**Agent file if:**
- It's domain logic specific to that agent's role
- It's the implementation of a step, not the coordination of steps
- It's something the agent needs to know regardless of who spawned it
