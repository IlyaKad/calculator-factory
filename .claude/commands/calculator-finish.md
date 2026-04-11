# /calculator-finish

Marks a calculator as Done in Notion and cleans up build state.

## Usage
```
/calculator-finish                    ← finish the current active build (reads .build-state.json)
/calculator-finish {ticket-id}        ← finish a specific ticket by ID
/calculator-finish batch              ← finish all tickets listed in finished-builds.json
```

## Input
$ARGUMENTS — a Notion ticket ID, "batch", or empty (uses current build state)

## What to do

**If $ARGUMENTS is empty:**
1. Read `.build-state.json` to get the current active ticket ID
2. If file is missing or empty — report "No active build found" and stop
3. Call Notion MCP to update that ticket's status → "Built"
4. Wait for confirmation
5. Delete `.build-state.json` so the next build can start
6. Report back: ticket updated, build state cleared

**If $ARGUMENTS is a ticket ID:**
1. Call Notion MCP to update that specific ticket's status → "Built"
2. Wait for confirmation
3. If `.build-state.json` contains the same ticket ID — delete it
4. Report back: ticket updated

**If $ARGUMENTS is "batch":**
1. Read `finished-builds.json` — list of completed calculator builds logged by the orchestrator
2. For each entry with status "completed" and Notion status not yet "Built":
   - Call Notion MCP to update status → "Built"
   - Wait for confirmation
3. Report back: how many tickets updated, list of names

## Rules
- Follow all rules in `rules.md`
- Never mark a ticket "Built" if its calculator has failing tests — check `.build-state.json` for test status first
- If Notion MCP call fails — report the error, do not silently skip
