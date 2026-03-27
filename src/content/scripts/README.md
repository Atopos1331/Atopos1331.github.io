# Scripts

These shell scripts automate workspace routines, system configurations, and interactive walkthroughs. Execute them using the `bash` command directly within the terminal.

## Current Files

| Script | Description |
| :--- | :--- |
| **welcome.sh** | Launches the comprehensive guided tour of the workspace, including profile modules and interactive plugins. |
| **default_theme.sh** | System UI restoration—resets the wallpaper, overlay opacity, blur, and theme to factory defaults. |
| **default_output.sh** | Resets I/O parameters, including terminal pacing, typing speed, and verbose command echoing. |
| **easter_egg.sh** | An experimental script that triggers the `rm -rf /` sequence with command echoing enabled. |

## Command Reference

* **Navigate to directory:** `cd ~/scripts`
* **List available scripts:** `ls`
* **Inspect script logic:** `preview ~/scripts/welcome.sh`
* **Initialize system tour:** `bash ~/scripts/welcome.sh`
* **Reset UI environment:** `bash ~/scripts/default_theme.sh`
* **Reset output speed:** `bash ~/scripts/default_output.sh`

---

Note: These scripts are designed to be lightweight and human-readable. You can use the `preview` command to audit the logic and command sequence of the script before execution.