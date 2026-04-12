# Claude Code — Key Tips That Make a Big Difference

---

## 1. CLAUDE.md is your broadcast channel
Every agent sees it automatically. Anything that ALL agents need to know belongs here.
If you find yourself repeating the same context in multiple agent files — it belongs in CLAUDE.md.

## 2. The `## Input` section IS the handoff contract
Don't document the handoff separately from the agent. Put it in `## Input` inside the agent file itself. The orchestrator reads it there. One source of truth, zero drift.

## 3. Hooks must ALWAYS approve on crash
A hook that throws without calling `approve()` will freeze the entire pipeline silently.
Wrap everything in `try/except` and call `approve()` in the `except` block. Always.

## 4. MCP tool names have a specific format
When writing a hook that intercepts MCP tool calls, the `tool_name` is:
`mcp__{server_name}__{tool_name}` — e.g. `mcp__playwright__browser_navigate`
Not just `browser_navigate`. Get this wrong and the hook never fires.

## 5. Lock tests BEFORE fixing code, not after
The lock enforces the discipline: tests define the contract, code must satisfy it.
If you fix code first and then lock, you may lock tests that were written around broken behavior.

## 6. `missing[]` is the most important field in the ticket spec
If `missing[]` is non-empty and the orchestrator proceeds anyway, every downstream agent builds on a broken foundation. Stop early, surface it to the user, and save 10 agents' worth of wasted tokens.

## 7. The lean orchestrator pays off when you add agents
With hardcoded handoffs: adding an agent = update orchestrator in 3 places.
With the lean pattern: adding an agent = add it to CLAUDE.md and write the agent file. Done.

## 8. `.build-state.json` vs `memory.json` — know the difference
`.build-state.json` = current run only. Ephemeral. Hooks read it mid-run.
`memory.json` = permanent record. Survives sessions. Orchestrator reads it at start.
Don't store long-term data in `.build-state.json` — it gets deleted after each run.

## 9. Prompt files are thin — keep them that way
If domain logic ends up in a prompt file, it belongs in an agent or skill instead.
Prompt files: accept arguments, write initial state, spawn orchestrator, report back. That's it.

## 10. Defense in depth: rules AND hooks for the same constraint
Rules guide agents that reason correctly.
Hooks block agents that don't — or that receive malicious instructions.
For critical constraints (no push to main, no delete), you want both.

## 11. Publisher failures should never be blocking
Publishing is the last step. If Slack is down, the calculator is still built and tested.
Each MCP step in the publisher is independent — log failures, continue, report partial completion.

## 12. Skills live once, used by many
Put domain knowledge in skill files, not in agent files. When the knowledge changes (e.g. new tax bracket format), update one skill file instead of every agent that uses it.
