import sys
import json
import os
import urllib.request   # built-in HTTP client — like fetch() in JS, no install needed
import urllib.error

# ── config ───────────────────────────────────────────────────────────────────

# Status values must match your Notion database's status options exactly
STATUS_MAP = {
    "in_progress": "In Progress",
    "built":       "Built",
    "failed":      "Failed",
}

# ── helpers ──────────────────────────────────────────────────────────────────

def approve():
    print(json.dumps({ "decision": "approve" }))

def get_build_state() -> dict:
    # The orchestrator writes .build-state.json at the start of every run
    # This is how the hook knows which Notion ticket is currently being built
    try:
        with open(".build-state.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}   # no active build — hook does nothing

def update_notion_status(ticket_id: str, status: str):
    token = os.environ.get("NOTION_TOKEN")
    if not token:
        print("notion-status-sync: NOTION_TOKEN not set", file=sys.stderr)
        return

    notion_status = STATUS_MAP.get(status, "In Progress")

    # Build the PATCH request payload — Notion API format
    payload = json.dumps({
        "properties": {
            "Status": {
                "status": { "name": notion_status }
            }
        }
    }).encode("utf-8")   # .encode() converts string to bytes — required for urllib

    # urllib.request.Request = like new Request() in fetch API
    req = urllib.request.Request(
        url=f"https://api.notion.com/v1/pages/{ticket_id}",
        data=payload,
        method="PATCH",
        headers={
            "Authorization":  f"Bearer {token}",
            "Content-Type":   "application/json",
            "Notion-Version": "2022-06-28",   # Notion requires this header on every request
        }
    )

    try:
        # urllib.request.urlopen() = await fetch() in JS
        with urllib.request.urlopen(req) as response:
            print(f"notion-status-sync: ticket {ticket_id} → '{notion_status}'", file=sys.stderr)
    except urllib.error.HTTPError as e:
        # HTTPError = non-2xx response — like checking res.ok in fetch
        print(f"notion-status-sync: Notion API error {e.code}: {e.reason}", file=sys.stderr)

# ── status resolver ──────────────────────────────────────────────────────────

def resolve_status(tool_name: str, file_path: str) -> str | None:
    # Returns which status to set, or None if this write doesn't warrant a sync

    if tool_name != "Write":
        return None

    if file_path.startswith("/calculators/") and file_path.endswith("logic.ts"):
        return "in_progress"   # builder just wrote the implementation

    if file_path.startswith("/calculators/") and file_path.endswith("logic.test.ts"):
        return "in_progress"   # test-writer just wrote tests

    if file_path.startswith("/calculators/") and file_path.endswith("README.md"):
        return "built"         # docs-writer finished — full pipeline done

    return None

# ── main ─────────────────────────────────────────────────────────────────────

def main():
    try:
tml_name  = event.get("tool_name", "")
        tool_input = event.get("tool_input", {})
        file_path  = tool_input.get("file_path", "")

        status = resolve_status(tool_name, file_path)

        if status:
            state = get_build_state()
            ticket_id = state.get("ticket_id")

            if ticket_id:
                update_notion_status(ticket_id, status)

        approve()

    except Exception as e:
        print(f"Hook error: {e}", file=sys.stderr)
        approve()

if __name__ == "__main__":
    main()
