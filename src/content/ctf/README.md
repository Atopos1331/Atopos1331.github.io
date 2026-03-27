# Flag Checker

This directory currently keeps a single compact reverse-engineering challenge for the website's `.exe` runtime.

## Files

- `flag-checker.exe` -> interactive checker implemented as a packaged worker program
- `README.md` -> quick notes and suggested entry points

## Suggested Flow

- `cd ~/ctf`
- `ls`
- `preview README.md`
- `preview flag-checker.exe`
- `xxd flag-checker.exe`
- `exe flag-checker.exe`

The setup is intentionally minimal: inspect the checker logic, understand the transform, and reconstruct the accepted flag.
