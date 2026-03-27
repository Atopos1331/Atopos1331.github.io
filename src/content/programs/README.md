# Programs

Programs are packaged `.exe` worker sessions designed to run within the terminal environment. While active, they maintain terminal focus and stream `stdout` and `stderr` line by line in real-time.

## Available Programs

| Program | Description |
| :--- | :--- |
| **echo-loop.exe** | A minimal stdin echo loop featuring built-in support for `exit` and `clear` commands. |
| **js-calculator.exe** | A lightweight JavaScript calculator and REPL equipped with specialized math helpers. |

## Suggested Commands

* **Navigate to directory:** `cd ~/programs`
* **List all programs:** `ls`
* **Inspect program manifest:** `preview ~/programs/echo-loop.exe`
* **Execute program:** `exe ~/programs/echo-loop.exe`
* **Launch REPL:** `exe ~/programs/js-calculator.exe`

---

**Session Control:** Use `Ctrl+C` to send an interrupt signal and terminate a running program session. For programs that support the `clear` command, execution will only reset the live output buffer for that specific session.