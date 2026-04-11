# /build-calculator

Starts a full Calculator Factory build run.

## Usage
```
/build-calculator {notion-ticket-id}   ← build one specific ticket
/build-calculator batch                ← pick from all "Not Started" tickets
```

## Input
$ARGUMENTS — either a Notion ticket ID or the word "batch"

## What to do

1. Read and follow all rules in `rules.md`
2. Write `.build-state.json` to the project root:
   ```json
   { "ticket_id": "$ARGUMENTS", "calculator_name": null, "status": "started" }
   ```
   (Set `ticket_id` to null if mode is batch — update it once the orchestrator picks a ticket)
3. Spawn the orchestrator agent (`agents/orchestrator.md`) with the following handoff:
   ```
   mode: "single" | "batch"
   arguments: "$ARGUMENTS"
   ```
5. Wait for the orchestrator to confirm completion
6. Report back: calculator name built, files generated, Notion status updated

## Rules
- Follow all rules in `rules.md` — no exceptions
- If $ARGUMENTS is empty, ask the user: "Provide a Notion ticket ID or type 'batch' to pick from all Not Started tickets"
- Do not proceed if `.build-state.json` already exists with `status: "in_progress"` — a build is already running
