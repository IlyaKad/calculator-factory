import sys
import json
import subprocess   # like child_process in Node.js — runs shell commands
import os
import datetime

# ── helpers ──────────────────────────────────────────────────────────────────

def approve():
    print(json.dumps({ "decision": "approve" }))

def lock_file(file_path: str):
    # attrib +R = Windows command to make a file read-only
    # equivalent to chmod 444 on Linux
    subprocess.run(["attrib", "+R", file_path], check=False)

def run_coverage_check(file_path: str) -> float:
    # subprocess.run() = child_process.execSync() in Node.js
    # capture_output=True means collect stdout/stderr instead of printing them
    # text=True means return strings, not bytes
    result = subprocess.run(
        ["npx", "jest", file_path, "--coverage", "--coverageReporters=text-summary"],
        capture_output=True,
        text=True
    )

    # Parse coverage % from jest output — looks for "Statements : 82.5%"
    for line in result.stdout.splitlines():
        if "Statements" in line:
            # line.split() splits on whitespace — like .split(' ') in JS
            # then find the part that ends with "%"
            parts = line.split()
            for part in parts:
                if part.endswith("%"):
                    return float(part.replace("%", ""))  # float() = parseFloat() in JS

    return 0.0  # if we can't parse coverage, assume 0

def log_to_audit(message: str):
    # datetime.datetime.utcnow().isoformat() = new Date().toISOString() in JS
    timestamp = datetime.datetime.utcnow().isoformat()
    log_line = f"[{timestamp}] POST-FILE-WRITE | {message}\n"

    # "a" = append mode — like fs.appendFileSync() in Node.js
    os.makedirs("logs", exist_ok=True)  # create logs/ folder if it doesn't exist
    with open("logs/audit.log", "a") as f:
        f.write(log_line)

# ── main ─────────────────────────────────────────────────────────────────────

def main():
    try:
        event = json.load(sys.stdin)

        tool_name  = event.get("tool_name", "")
        tool_input = event.get("tool_input", {})
        file_path  = tool_input.get("file_path", "")

        # Only act on logic.test.ts files inside /calculators/
        # startswith() = string.startsWith() in JS
        # endswith()   = string.endsWith() in JS
        if tool_name == "Write" and \
           file_path.startswith("/calculators/") and \
           file_path.endswith("logic.test.ts"):

            coverage = run_coverage_check(file_path)

            if coverage >= 70.0:
                lock_file(file_path)
                log_to_audit(f"{file_path} | coverage: {coverage}% | LOCKED")
            else:
                log_to_audit(f"{file_path} | coverage: {coverage}% | WARNING: below 70% threshold — file not locked")

        approve()

    except Exception as e:
        print(f"Hook error: {e}", file=sys.stderr)
        approve()

if __name__ == "__main__":
    main()
