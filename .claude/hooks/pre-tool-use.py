import json   # like JSON.parse / JSON.stringify in Node.js
import sys    # gives access to stdin / stdout / stderr — like process in Node.js

# ── helpers ──────────────────────────────────────────────────────────────────

def approve():
    # print() in Python = writing to stdout, which is how we talk back to Claude Code
    print(json.dumps({ "decision": "approve" }))

def block(reason: str):
    print(json.dumps({ "decision": "block", "reason": reason }))

# ── guards ───────────────────────────────────────────────────────────────────

def check_bash(tool_input: dict):
    # tool_input is a dict (like a JS object) — "command" is the bash command string
    command = tool_input.get("command", "")   # .get() = safe access, like optional chaining ?.

    if "rm -rf" in command:
        block("Blocked: 'rm -rf' is not allowed. Move files to /archive/ instead.")
        return

    # Check for git push to main — catches both "main" and "origin main"
    if "git push" in command and "main" in command:
        block("Blocked: direct push to main is not allowed. Open a PR instead.")
        return

    approve()

def check_file_write(tool_input: dict):
    path = tool_input.get("file_path", "")

    # List of allowed path prefixes during build — like an allowlist middleware in Express
    allowed_prefixes = [
        "/calculators/",
        "/ui/",
        ".claude/",
        "skills/",
        "logs/",
    ]

    # any() = like .some() in JavaScript arrays
    if any(path.startswith(prefix) for prefix in allowed_prefixes):
        approve()
        return

    block(f"Blocked: file write to '{path}' is not allowed. Calculator files must go in /calculators/ or /ui/.")

# ── main ─────────────────────────────────────────────────────────────────────

def main():
    try:
        # sys.stdin = the input stream — Claude Code pipes the event JSON into this script
        # json.load() reads and parses it — like JSON.parse(data) in Node.js
        event = json.load(sys.stdin)

        tool_name  = event.get("tool_name", "")
        tool_input = event.get("tool_input", {})

        # Route to the right check based on which tool Claude is about to call
        if tool_name == "Bash":
            check_bash(tool_input)
        elif tool_name == "Write":
            check_file_write(tool_input)
        else:
            # Any other tool — approve by default
            approve()

    except Exception as e:
        # NEVER let the hook crash silently — a crash blocks all agent actions
        # Write the error to stderr (like console.error in Node.js) so it shows in logs
        print(f"Hook error: {e}", file=sys.stderr)
        # When in doubt, approve — a broken hook should not freeze the entire pipeline
        approve()

if __name__ == "__main__":
    main()
