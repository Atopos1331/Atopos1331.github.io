# Description

This is a terminal-emulated portfolio environment architected by **Eafoo**.

## Getting Started

* **Guided Tour:** Execute `bash ~/scripts/welcome.sh` (or click the command block directly) to launch the interactive walkthrough.
* **System Help:** Use the `help` command to view a comprehensive list of supported utilities and workspace parameters.

## Workspace Hierarchy

The root directory is mapped to `~/`.

| Path | Description |
| :--- | :--- |
| `~/description.md` | This landing page and system overview. |
| `~/profile.html` | A non-terminal personal webpage. |
| `~/profile/` | Directory containing core profile modules: `about`, `experience`, `projects`, etc. |
| `~/scripts/` | Automated shell scripts and system helper flows. |
| `~/plugins/` | Packaged extensions (`.plg`) including UI docks and visual layers. |
| `~/programs/` | Interactive `.exe` worker sessions optimized for terminal execution. |
| `~/ctf/` | A sandboxed reverse-engineering challenge featuring `flag-checker.exe`. |
| `~/music/` | Local audio repository for the integrated media player. |
| `~/preview-demo.html` | A demonstration of native HTML rendering within the preview pane. |

## Recommended Operations

* **View Bio:** `preview ~/profile/about.md`
* **Render Non-Terminal Profile:** `preview ~/profile.html`
* **Check Experience:** `preview ~/profile/experience.md`
* **Initialize System Tour:** `bash ~/scripts/welcome.sh`
* **Deploy Media Plugin:** `plugin ~/plugins/music-card.plg`
* **Initialize JS Calculator:** `exe ~/programs/js-calculator.exe`
* **Begin CTF Challenge:** `exe ~/ctf/flag-checker.exe`
