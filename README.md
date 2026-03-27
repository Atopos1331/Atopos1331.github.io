# Terminal Portfolio Workspace

Interactive terminal-style portfolio built with React, TypeScript, Vite, and styled-components. The project exposes a browser-based shell workspace with a virtual filesystem, preview pane, packaged plugins, and worker-backed `.exe` program sessions.

Idea inspired by Sat Naing's terminal portfolio: [satnaing/terminal-portfolio](https://github.com/satnaing/terminal-portfolio).

## Overview

This is not a static terminal mockup. The site behaves like a small shell-driven environment:

- `src/content/` is packaged into an in-app filesystem rooted at `~/`
- Markdown, HTML, packaged plugins, and packaged `.exe` programs can all be previewed from the shell
- Shell commands such as `ls`, `cd`, `cat`, `preview`, `plugin`, `exe`, and `bash` are implemented in React/TypeScript
- Plugins can mount dock widgets or full background layers
- `.exe` programs run in an isolated worker-backed runtime and can block the terminal like a real foreground session
- URL paths map back to previewable virtual files so content can be shared directly

## Feature Set

- Terminal input with history, completion, command metadata, and typed output pacing
- Split layout with terminal and preview panes
- Virtual filesystem backed by repository content rather than a server-side shell
- Rich Markdown preview with `react-markdown` and GFM support
- Click-to-run inline shell commands inside Markdown previews
- Packaged plugin format for dock widgets and animated backgrounds
- Packaged `.exe` format for interactive terminal programs
- Theme switching, wallpaper/background controls, and persistent workspace state
- Direct preview URLs for files inside the virtual filesystem

## How It Works

### Virtual Filesystem

Repository content under [src/content](/E:/Code/website/src/content) is mapped into the in-app shell filesystem:

- [src/content/description.md](/E:/Code/website/src/content/description.md) -> `~/description.md`
- [src/content/profile](/E:/Code/website/src/content/profile) -> `~/profile/`
- [src/content/plugins](/E:/Code/website/src/content/plugins) -> `~/plugins/`
- [src/content/programs](/E:/Code/website/src/content/programs) -> `~/programs/`
- [src/content/scripts](/E:/Code/website/src/content/scripts) -> `~/scripts/`

Raw packaged files are exposed with runtime extensions:

- `*.plg-raw` becomes `*.plg`
- `*.exe-raw` becomes `*.exe`

### Commands

Command implementations live under [src/commands/definitions](/E:/Code/website/src/commands/definitions). The registry wires them into the shell so both typed commands and clickable inline commands resolve through the same command definitions.

### Plugins

Plugins are JSON-based payloads stored as `.plg-raw`. They can mount:

- dock widgets, such as music or radar panels
- background layers, such as particle or starfield effects

At runtime they are interpreted inside the workspace rather than built as separate React bundles.

### Programs

Programs are stored as `.exe-raw` manifests and executed through the worker runtime. They behave like foreground terminal applications and can stream output, accept input, and clear the screen.

## Local Development

```bash
npm install
npm run dev
```

Vite will start a local dev server. Open the local URL shown in the terminal.

## Build And Validation

```bash
npm run test:once
npm run build
```

Production output is written to `dist/`.

## Common Shell Entry Points

- `help`
- `preview ~/description.md`
- `preview ~/profile/about.md`
- `preview ~/profile.html`
- `plugin ~/plugins/music-card.plg`
- `plugin ~/plugins/command-radar.plg`
- `exe ~/programs/js-calculator.exe`
- `bash ~/scripts/welcome.sh`

## Authoring Content

### Add a profile or documentation page

1. Add a Markdown or HTML file under [src/content](/E:/Code/website/src/content)
2. Preview it in the shell with `preview <path>`
3. If the file should be reachable directly by URL, its route will be generated automatically from the content tree

### Add a plugin

1. Create a `*.plg-raw` file under [src/content/plugins](/E:/Code/website/src/content/plugins)
2. Define `html`, `css`, and `script` in the runtime payload
3. Run it with `plugin ~/plugins/<name>.plg`

### Add a program

1. Create a `*.exe-raw` file under [src/content/programs](/E:/Code/website/src/content/programs)
2. Define the worker/runtime behavior
3. Preview it with `preview`
4. Execute it with `exe`

## Static Deployment Notes

This project builds to static assets, but it is not a plain multi-page site. Preview URLs such as `/profile/about.md` or `/programs/js-calculator.exe` need a static-host fallback to `index.html`.

For static hosting:

- build with `npm run build`
- deploy the `dist/` directory
- configure the host so unknown routes fall back to `index.html`

For GitHub Pages, a common approach is to copy `dist/index.html` to `dist/404.html` during deployment so deep links keep working.

## License

This repository is distributed under the GNU General Public License v3.0 or later. See [LICENSE](LICENSE).