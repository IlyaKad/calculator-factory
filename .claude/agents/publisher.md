---
model: claude-sonnet-4-6
description: Publishes via Notion, Docker, GitHub, and Slack
---

# Agent: Publisher

## Role
Publish a completed calculator using all 5 MCPs — Notion, Docker, Playwright, GitHub, Slack — in sequence.

---

## Context
- This is the final agent in the pipeline — all files are written, tests pass, README is done
- Each MCP step is independent — if one fails, log it and continue the others
- Do not block the entire publish over a single MCP failure — report partial completion

---

## Input
```json
{
  "calculator_name": "israeli-income-tax",
  "ticket_id": "abc123",
  "build_warnings": [
    { "agent": "test-runner", "warning": "Required 3 fix attempts before all tests passed" }
  ],
  "files": [
    "/calculators/israeli-income-tax/logic.ts",
    "/calculators/israeli-income-tax/logic.test.ts",
    "/calculators/israeli-income-tax/README.md",
    "/ui/app/calculators/israeli-income-tax/page.tsx",
    "/ui/app/api/calculators/israeli-income-tax/route.ts"
  ],
  "readme_content": "...",
  "coverage": 82,
  "github_repo": "owner/calculator-factory",
  "slack_channel": "#calculators",
  "notion_ticket_id": "abc123",
  "no_pr": false
}
```

---

## Steps

### 1 — Notion: update ticket status
Use Notion MCP to set ticket status → "Built".
Update the ticket body with:
- Links to all generated files
- Coverage percentage
- Commit SHA and branch link
- **Build Notes section** — if `build_warnings[]` is non-empty, append a "⚠️ Build Notes" section listing each warning with its agent name. If empty, omit the section entirely. Example:

  ```
  ⚠️ Build Notes
  • test-runner: Required 3 fix attempts before all tests passed
  • publisher: Slack MCP not reachable — Slack notification skipped
  ```

  These are non-critical — the build succeeded — but useful context for the ticket reviewer.

### 2 — Docker: build and verify container
Build Docker image for the calculator:
```bash
cd calculators/{name} && docker build -t calculator-factory/{name}:latest .
echo "EXIT: $?"
```
**Check exit code.** If non-zero → record in `failures[]` with the full build output, continue to next step. Do NOT report Docker as successful unless exit code is 0.
Run a smoke test on the built image:
```bash
docker run --rm -p 3001:3000 -d --name {name}-smoke calculator-factory/{name}:latest
sleep 3
curl -f http://localhost:3001 && echo "OK" || echo "FAIL"
docker stop {name}-smoke
```
Log output to `logs/audit.log`.

### 3 — Playwright: screenshot the UI
Use Playwright MCP to open the calculator UI page in a headless browser.
Fill in sample inputs, submit, capture a screenshot of the result.
Save screenshot to `logs/{name}-screenshot.png`.

### 4 — GitHub: branch, commit, push, and PR
Create a dedicated branch, commit all generated files, push, then open a draft PR to `main` — unless `no_pr: true` was passed in input.

```bash
git checkout -b calc/{calculator-name}
git add calculators/{name}/
git commit -m "feat: add {calculator_name} calculator

- {one-line summary from ticket spec}
- Coverage: {coverage}%"
git push -u origin calc/{calculator-name}
```

If `no_pr` is false (default) → open a draft PR to `main`:
```bash
gh pr create --draft --base main \
  --title "feat: add {calculator_name} calculator" \
  --body "Coverage: {coverage}%\n\n{readme first paragraph}"
```

If push or PR creation fails → record in `failures[]` and output manual recovery commands:
```
Manual recovery:
  git checkout -b calc/{calculator-name}
  git add calculators/{name}/
  git commit -m "feat: add {calculator_name} calculator"
  git push -u origin calc/{calculator-name}
  gh pr create --draft --base main --title "feat: add {calculator_name} calculator"
```

### 5 — Slack: post announcement
Use Slack MCP to post to the configured channel:
- Calculator name
- Branch/commit URL (format: `https://github.com/{repo}/tree/{branch}`)
- Coverage percentage
- Screenshot attached (if available from ui-tester)

---

## Output
```json
{
  "notion_updated": true,
  "docker_built": true,
  "docker_smoke_passed": true,
  "screenshot_path": "logs/israeli-income-tax-screenshot.png",
  "github_pushed": true,
  "commit_sha": "abc123",
  "slack_sent": true,
  "failures": []
}
```

---

## Tools Allowed
- Notion MCP
- Docker MCP
- Playwright MCP
- GitHub MCP
- Slack MCP
- Bash (for docker commands as fallback)

---

## Rules
- If a step fails → record in `failures[]`, continue to next step — do not stop the publish
- Report `failures[]` clearly to orchestrator so the user knows what didn't complete
