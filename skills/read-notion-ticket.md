# Skill: Read Notion Ticket

## Purpose
Extract a structured calculator spec from a Notion ticket.
This skill covers reading and parsing only — do not fetch external URLs here.
URLs found in the ticket are flagged in the output for the Fetch Agent to handle.

---

## What to Extract

Read the following fields from the ticket:

| Field | Notion location | Notes |
|---|---|---|
| `name` | Page title | Convert to slug: lowercase, hyphens, no spaces |
| `description` | "About project" section | Full text, preserve as-is |
| `status` | Status property | e.g. "In Progress", "Done", "Built" |
| `priority` | Priority property | e.g. "High", "Medium", "Low" — null if missing |
| `inputs` | Anywhere inputs/fields are described | Name, type, validation rules per input |
| `outputs` | Anywhere outputs/results are described | What the calculator returns |
| `rules` | Business rules, formulas, constraints | Extract only what is explicitly stated |
| `examples` | Example inputs/outputs if provided | Preserve exactly as given |
| `urls` | Any hyperlinks in any section | Collect all — flag for Fetch Agent |
| `action_items` | Action Items section | List of sub-tasks, if present |
| `documents` | Documents section | List embedded file names/types |

---

## Output Format

Always output a single JSON block:

```json
{
  "name": "israeli-income-tax",
  "description": "Calculate income tax for employees according to Israeli tax brackets",
  "status": "In Progress",
  "priority": "High",
  "inputs": [
    { "name": "monthly_salary", "type": "number", "validation": "positive integer" }
  ],
  "outputs": [
    { "name": "tax_amount", "type": "number", "description": "Monthly tax to deduct" }
  ],
  "rules": [],
  "examples": [],
  "urls": [
    "https://www.kolzchut.org.il/he/מס_הכנסה_לשכירים"
  ],
  "action_items": ["To do"],
  "documents": [],
  "missing": ["inputs not specified in ticket", "tax brackets not in ticket — must be fetched from URL"]
}
```

---

## Important Rules for This Skill

- **Never invent business rules.** If tax brackets, formulas, or constraints are not written in the ticket, leave `rules: []` and add a note to `missing`.
- **If inputs/outputs are not specified**, leave them as empty arrays and list them in `missing`.
- **All URLs go into `urls[]`** — do not visit or fetch them. That is the Fetch Agent's job.
- **`missing` is required** — always include it, even if empty. The orchestrator uses it to decide whether to proceed or pause.

---

## What to Do if the Ticket is Vague

If critical fields are missing (no inputs, no outputs, no rules, no URL to fetch from):
- Do NOT guess or invent values
- Fill `missing[]` with exactly what is absent
- Return the partial JSON with `missing` populated
- The orchestrator will surface this to the user before continuing
