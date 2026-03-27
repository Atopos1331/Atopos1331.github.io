# Plugins

Plugins are packaged `.plg` files used to mount visual or interactive runtime layers directly into the workspace.

## Available Plugins

| Plugin | Description |
| :--- | :--- |
| **music-card.plg** | A docked media player that sources audio files from `~/music`. |
| **command-radar.plg** | A draggable radar widget that visualizes real-time terminal command activity. |
| **cyber-particles.plg** | An interactive background featuring a dynamic particle network. |
| **sparticles-stars.plg** | A starfield background powered by integrated Sparticles assets. |
| **camera-scanner.plg** | A docked AI module for object detection and classification via camera or uploaded picture. |
| **psych-eval.plg** | A docked AI utility that performs sentiment and emotional analysis on text input. |

## Suggested Commands

* **Navigate to directory:** `cd ~/plugins`
* **List all plugins:** `ls ~/plugins`
* **Preview manifest:** `preview ~/plugins/music-card.plg`
* **Enable/Mount plugin:** `plugin ~/plugins/music-card.plg`
* **View plugin metadata:** `plugin detail ~/plugins/sparticles-stars.plg`
* **Decompile/Decode:** `plugin decode ~/plugins/command-radar.plg`

---

**Tip:** Running the `plugin` command on an active plugin will disable it. We recommend using `preview` first to inspect the manifest and runtime notes before deployment.