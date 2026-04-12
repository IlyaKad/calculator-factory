import sys
import json
import subprocess   # like child_process in Node.js — runs shell commands
import os
import stat         # provides file permission constants — like fs.constants in Node.js
import platform     # detects the OS — like process.platform in Node.js
import datetime

# ── helpers ──────────────────────────────────────────────────────────────────

def approve():
    print(json.dumps({ "decision": "approve" }))

def lock_file(file_path: str):
    if platform.system() == "Windows":
        # attrib +R = Windows command to make a file read-only
        subprocess.run(["attrib", "+R", file_path], check=False)
    else:
        # chmod 444 = read-only for owner, group, and others — Linux/Mac
        # os.stat(file_path).st_mode gets current permissions, then we strip write bits
        # stat.S_IWRITE / stat.S_IWGRP / stat.S_IWOTH are the write permission constants
        current = os.stat(file_path).st_mode
        os.chmod(file_path, current & ~(stat.S_IWRITE | stat.S_IWGRP | stat.S_IWOTH))

def run_coverage_check(file_path: str) -> float:
    result = subprocess.run(
        ["npx", "jest", file_path, "--coverage", "--coverageReporters=text-summary"],
        capture_output=True,
        text=True
    )
    for line in result.stdout.splitlines():
        if "Statements" in line:
            parts = line.split()
            for part in parts:
                if part.endswith("%"):
                    return float(part.replace("%", ""))
    return 0.0

def log_to_audit(message: str):
    timestamp = datetime.datetime.utcnow().isoformat()
    log_line = f"[{timestamp}] POST-FILE-WRITE | {message}\n"
    os.makedirs("logs", exist_ok=True)
    with open("logs/audit.log", "a") as f:
        f.write(log_line)

# ── main ─────────────────────────────────────────────────────────────────────

def main():
    try:
        event = json.load(sys.stdin)
        tool_name  = event.get("tool_name", "")
        tool_input = event.get("tool_input", {})
        file_path  = tool_input.get("file_path", "")

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
