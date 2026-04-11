import sys
import json
import os
import datetime

# ── helpers ──────────────────────────────────────────────────────────────────

def approve():
    print(json.dumps({ "decision": "approve" }))

def summarize(tool_name: str, tool_input: dict) -> str:
    # Build a short human-readable summary per tool type
    # This keeps logs useful without dumping the full input payload

    if tool_name == "Bash":
        cmd = tool_input.get("command", "")
        # Truncate long commands — [:80] = .slice(0, 80) in JS
        return f"bash: {cmd[:80]}"

    elif tool_name == "Write":
        return f"wrote: {tool_input.get('file_path', '?')}"

    elif tool_name == "Edit":
        return f"edited: {tool_input.get('file_path', '?')}"

    elif tool_name == "Read":
        return f"read: {tool_input.get('file_path', '?')}"

    elif tool_name == "Glob":
        return f"glob: {tool_input.get('pattern', '?')}"

    elif tool_name == "Grep":
        return f"grep: '{tool_input.get('pattern', '?')}' in {tool_input.get('path', '.')}"

    else:
        # Unknown tool — log its name only, don't try to parse input
        return f"tool: {tool_name}"

def log_to_audit(tool_name: str, summary: str):
    timestamp = datetime.datetime.utcnow().isoformat()
    log_line = f"[{timestamp}] AUDIT | {tool_name:<12} | {summary}\n"
    # f"{tool_name:<12}" = left-align in 12 chars — makes log columns line up visually

    os.makedirs("logs", exist_ok=True)
    with open("logs/audit.log", "a") as f:
        f.write(log_line)

# ── main ─────────────────────────────────────────────────────────────────────

def main():
    try:
        event = json.load(sys.stdin)

        tool_name  = event.get("tool_name", "")
        tool_input = event.get("tool_input", {})

        summary = summarize(tool_name, tool_input)
        log_to_audit(tool_name, summary)

        approve()

    except Exception as e:
        print(f"Hook error: {e}", file=sys.stderr)
        approve()

if __name__ == "__main__":
    main()
