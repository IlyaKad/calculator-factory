# Calculator Factory — Final Quiz
## All Claude Code Entities

Legend: ✅ Correct | ⚠️ Partial | ❌ Incorrect

---

## Section 1 — CLAUDE.md

**1.** CLAUDE.md is loaded into every agent automatically. Where does this loading happen — who reads it and when?
> **Answer:** On agent spawn CLAUDE.MD loaded in agent memory, similar to componentDidMount     
> **Feedback:** ✅ Correct. The Claude Code runtime injects it automatically on every agent spawn — no agent needs to explicitly read it.

**2.** You add a new agent to the pipeline. What is the minimum change required to make the orchestrator aware of it, given the lean orchestrator pattern?
> **Answer:** To mention new-agent in orchestrator and better to add it to CLAUDE.MD        
> **Feedback:** ✅ Correct. With the lean pattern, adding it to the agents table in CLAUDE.md is enough — the orchestrator reads that table to discover agents. Updating orchestrator steps is needed only if you want it in the pipeline order.

**3.** CLAUDE.md has a `## Defaults` section with Slack channel and GitHub repo. Why put defaults here instead of in `memory.json`?
> **Answer:** Because it's agency default settings, not working progress data   
> **Feedback:** ✅ Correct. CLAUDE.md holds static project-wide config that never changes between runs. memory.json holds runtime state that changes with every build.

---

## Section 2 — Skills

**4.** What is the difference between a Skill and an Agent? Can a skill call another skill?
> **Answer:** Agent is active vs skill is passive. Agent can call another agent and generate output, skill is a static instruction file that helps agent to act correctly. Skill cannot call another skill.     
> **Feedback:** ✅ Correct. Skills are passive Markdown docs — teaching manuals. Only agents and hooks are active code.

**5.** The `read-notion-ticket.md` skill says "never fetch URLs — flag them for the Fetch Agent." Why is this separation important? What breaks if the ticket-reader fetches URLs itself?
> **Answer:** Orchestrator expects specific output that only fetch-agent returns in known form. Also like microservices — every agent has its own responsibility.   
> **Feedback:** ✅ Correct. The output contract breaks (ticket-reader output no longer matches its `## Output` spec), and single responsibility is violated — making it harder to test, retry, or replace either agent independently.

**6.** The `write-jest-tests.md` skill says "plan before writing." Why is the TODO step output to the orchestrator before writing test code?
> **Answer:** I don't know      
> **Feedback:** ❌ The TODO plan is shown to the orchestrator *before code is written* so gaps can be caught early — e.g. only happy path planned, no edge cases. Cheaper to fix a plan than to rewrite written test code. It also gives the user visibility into what will be tested before it's locked.

---

## Section 3 — Rules

**7.** A rule says "no file may exceed 200 lines." An agent writes a 250-line `logic.ts`. What should happen, and which entity enforces it?
> **Answer:** Builder agent enforces it, or orchestrator returns to builder to fix it.  
> **Feedback:** ✅ Correct. The rule instructs the builder to split by concern into named files. The orchestrator verifies the output and loops back if violated.

**8.** What is the difference between a rule and a hook? Give an example of something a rule can enforce that a hook cannot, and vice versa.
> **Answer:** Hook is proactive, rule is static. Hook fires automatically on Claude tool events. Rule is a strict constraint agents must reason about.  
> **Feedback:** ⚠️ Partial. Clearer framing: a **rule** enforces *reasoning* — e.g. "never invent business rules" can't be detected mechanically, the agent must understand and apply it. A **hook** enforces *mechanics* regardless of what the agent was thinking — e.g. blocking `rm -rf` even if the agent forgot the rule.

**9.** Rules say "never push to main." But the pre-tool-use hook also blocks `git push main`. Why do you need both?
> **Answer:** As additional defence layer if rules not mentioned to agent.  
> **Feedback:** ✅ Correct. Defense in depth. Rules guide agents that reason correctly. Hooks catch agents that reason incorrectly or are given malicious instructions. One can fail without the other taking down the guardrail.

---

## Section 4 — Subagents

**10.** The orchestrator is a subagent too — it's just called by a prompt file instead of another agent. True or false, and why does it matter?
> **Answer:** All agents are defined the same. Subagent = agent called by another agent, with limited context (only what the parent passed it).     
> **Feedback:** ✅ Correct. The file structure is identical — the only difference is who spawns it and what context it receives.

**11.** The fetch-agent is conditional — it only runs if `urls[]` is non-empty. Where exactly is this decision made, and what file contains that logic?
> **Answer:** Orchestrator gets data from ticket-reader and checks the array, calls fetch-agent if needed.  
> **Feedback:** ✅ Correct. `orchestrator.md` Step 2 contains the conditional logic.

**12.** A subagent finishes and returns output. The orchestrator needs to verify the output before passing it forward. What section of each agent file defines what valid output looks like?
> **Answer:** `## Output`   
> **Feedback:** ✅ Correct.

---

## Section 5 — Hooks

**13.** Name the 4 hook lifecycle events. Which ones can block an action and which cannot?
> **Answer:** Can block: PreToolUse. Cannot block: PostToolUse. (Only named 2 of 4)     
> **Feedback:** ⚠️ Partial. The 4 are: `PreToolUse` (can block), `PostToolUse` (cannot block), `Notification` (cannot block), `Stop` (cannot block). We only used PreToolUse and PostToolUse in this project — your instinct was right, Claude Code docs may list additional events beyond what we covered.

**14.** The `notion-status-sync.py` hook calls Notion directly via `urllib.request` instead of using the Notion MCP. Why can't it use the MCP?
> **Answer:** Hook is a script file — it cannot use MCP servers or call agents to use MCP.  
> **Feedback:** ✅ Correct. Hooks are plain Python scripts that only have access to stdin/stdout and the shell. MCP infrastructure lives in the Claude Code runtime, which hooks don't have access to.

**15.** The `audit-logger.py` hook runs on every tool call. If it crashes, what happens to the pipeline? Where is this handled in the code?
> **Answer:** Line 64 has approve(), so it won't block flow.    
> **Feedback:** ⚠️ Partial. Right outcome, but the key mechanism is the `except Exception` block — it catches *any* crash and calls `approve()` there, so the pipeline always continues regardless of what went wrong inside the hook.

**16.** You want a hook that fires only when a Playwright MCP tool is called. What would the `tool_name` value look like in the hook event JSON?
> **Answer:** Elicitation event.    
> **Feedback:** ❌ MCP tools have a specific naming format: `mcp__{server_name}__{tool_name}`. For Playwright it would be e.g. `mcp__playwright__browser_navigate`. You filter on this in the hook's `if tool_name ==` check. "Elicitation" is a different concept (asking the user for input mid-run).

---

## Section 6 — Prompt Files (Commands)

**17.** What is the difference between a prompt file and an agent file? Can an agent trigger a prompt file?
> **Answer:** Prompt file is the "front door" — entry point for humans to activate an agent or agentic flow with all necessary metadata.    
> **Feedback:** ✅ Correct. And no — agents cannot trigger prompt files. Prompt files are human-only entry points invoked via slash commands.

**18.** `/build-calculator` writes `.build-state.json` before spawning the orchestrator. Why write this file in the prompt file rather than letting the orchestrator write it?
> **Answer:** It's current design — could be vice versa.    
> **Feedback:** ⚠️ Partial. There's a specific reason: `.build-state.json` must exist *before* the orchestrator starts because the `notion-status-sync.py` hook reads it immediately on the first file write. If the orchestrator wrote it, there's a window where hooks fire before the file exists and `ticket_id` is unavailable.

**19.** `/calculator-finish batch` reads `finished-builds.json`. Where does that file get written, and by which entity?
> **Answer:** Written by general/headless Claude agent, not one of my agency agents.    
> **Feedback:** ❌ `finished-builds.json` is written by the **orchestrator** at Step 9 (final cleanup). It's one of our agents — the orchestrator appends a completed build entry to that file at the end of every successful run.

---

## Section 7 — Orchestrator

**20.** The lean orchestrator reads each agent's `## Input` section before spawning it. What problem does this solve compared to hardcoding the handoff in the orchestrator?
> **Answer:** Acts like a standard API — no duplication between orchestrator steps and agent input contracts. Single source of truth that's a nightmare to keep in sync otherwise.  
> **Feedback:** ✅ Correct.

**21.** The orchestrator retries a failed agent once before stopping. What would happen if it retried indefinitely?
> **Answer:** It will consume all available tokens and explode the session context window.      
> **Feedback:** ✅ Correct.

**22.** Step 3 requires user approval on the architect design before continuing. Why is this a hard stop rather than letting the orchestrator decide automatically?
> **Answer:** User has say in key development points. Saves tokens and time to rewrite after implementation is done.        
> **Feedback:** ✅ Correct. Design mistakes caught at the design stage cost near nothing. Caught after builder + test-writer have run, they cost several agents' worth of work.

---

## Section 8 — MCP Servers

**23.** MCP servers are defined in `.claude/mcp_settings.json` using `${ENV_VAR}` placeholders. Why not just hardcode the tokens in the file?
> **Answer:** Security breach — token leak if committed to git.     
> **Feedback:** ✅ Correct.

**24.** The publisher agent uses 5 MCPs in sequence but treats each as independent. Why does a failure in one MCP step not stop the others?
> **Answer:** It's just publishing committed finished data, not actual work.        
> **Feedback:** ⚠️ Partial. Also: each MCP serves a different audience (Notion = ticket owner, Slack = team, GitHub = developers). A Slack outage shouldn't prevent the GitHub release from being created. Independence = resilience across unrelated systems.

**25.** The Playwright MCP is used as a fallback in the fetch-agent. What triggers the fallback, and what does Playwright solve that plain `curl` cannot?
> **Answer:** Plain fetch struggles with SPA websites — Playwright handles JS-rendered pages.       
> **Feedback:** ✅ Correct. `curl` gets raw HTML before JavaScript runs. Playwright runs a real browser, waits for JS to execute, and returns the fully rendered DOM.

---

## Section 9 — Memory

**26.** The orchestrator reads `memory.json` at Step 0 to check if a calculator was already built. What field and value does it look for?
> **Answer:** `status` field in `calculators[]` array.      
> **Feedback:** ✅ Correct. Specifically: find an entry matching `ticket_id` with `status: "built"`.

**27.** Two orchestrator runs happen simultaneously on different tickets. Describe the race condition on `memory.json` and one way to fix it.
> **Answer:** Both write to the file and overwrite each other — data loss. Fix: file lock, or separate progress files merged into memory after.     
> **Feedback:** ✅ Correct. Both solutions are valid. Separate files per run (e.g. `memory-{ticket_id}.json`) then merge is simpler and avoids lock complexity.

**28.** Why are architect design decisions stored in `memory.json` under `decisions[]` instead of in `.build-state.json`?
> **Answer:** It's a list of design decisions, not progress state.      
> **Feedback:** ✅ Correct. `.build-state.json` is ephemeral — deleted after each run. `memory.json` is persistent — decisions survive across sessions so the same architect design doesn't need re-approval on re-runs.

---

## Wildcard Scenarios

**W1.** A new requirement: calculators must support a "dry run" mode.
> **Answer:** `build-calculator.md` needs another start option for orchestrator.        
> **Feedback:** ⚠️ Partial. Right entry point. Full answer: `build-calculator.md` adds `--dry-run` flag → passes it to orchestrator → orchestrator passes it to publisher → **`publisher.md`** skips all 5 MCP steps and returns what *would* have been published. `logic.ts`, `route.ts`, `page.tsx`, and tests are still built normally — only the publish step changes.

**W2.** Test-runner fails after 5 attempts. What's in a bad state and how does the system recover?
> **Answer:** Add additional Notion status, or adjust notion-status-sync hook to return ticket to "Not Started".        
> **Feedback:** ⚠️ Partial. Full bad state inventory: (1) Notion ticket stuck at "In Progress", (2) `.build-state.json` has `status: "failed"`, (3) generated files exist in `/calculators/` and `/ui/` (partial build), (4) `memory.json` has no entry (build never completed). Recovery: hook sets Notion → "Failed" on pipeline stop, orchestrator deletes partial files (or moves to `/archive/`), `.build-state.json` is cleared so next run can start fresh.

**W3.** Add a sixth MCP — PostgreSQL database — to log completed calculators.
> **Answer:** Add additional step to `calculator-finish.md` prompt file.        
> **Feedback:** ⚠️ Partial. Better location: **`publisher.md`** Step 6 (after Slack), since publishing is where all external system writes happen. Also need to add the MCP to `.claude/mcp_settings.json` and add the DB token to `.env` / `.env.example`. `calculator-finish.md` is for manual finalization — not the right place for automated pipeline logging.

**W4.** Client wants Hebrew RTL input labels on all calculators.
> **Answer:** `page.tsx` is affected. Update builder agent and `build-calculator.md` to start with specific language.       
> **Feedback:** ⚠️ Partial. Right layer — `page.tsx` only, logic and route are unaffected. But the entity to update is **`skills/typescript-patterns.md`** (add RTL/Hebrew label pattern to the page.tsx template) and **`rules.md`** (add a rule enforcing `dir="rtl"` and Hebrew labels in all generated pages). The builder reads both — no need to change `build-calculator.md`.

---

## Summary

| Section | Score |
|---|---|
| CLAUDE.md | 3/3 |
| Skills | 2/3 |
| Rules | 2.5/3 |
| Subagents | 3/3 |
| Hooks | 2.5/4 |
| Prompt Files | 1.5/3 |
| Orchestrator | 3/3 |
| MCP Servers | 2.5/3 |
| Memory | 3/3 |
| Wildcards | 2/4 |
| **Total** | **25/32** |

*Strong on architecture and reasoning. Areas to revisit: hook tool_name format for MCP tools (Q16), prompt file timing reasoning (Q18), finished-builds.json ownership (Q19), wildcard depth.*
