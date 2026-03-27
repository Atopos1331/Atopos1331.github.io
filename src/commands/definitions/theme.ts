import themes from "../../components/styles/themes";
import { defineCommand } from "../helpers";

const themeNames = Object.keys(themes);

/**
 * Implements the `theme` command for listing and switching site themes.
 */
export const themeCommand = defineCommand({
  name: "theme",
  desc: "list themes or switch with: theme <name>",
  argumentSuggestions: { 0: themeNames },
  helpLines: ["theme -> list themes + usage", "theme <theme>"],
  execute: async ({ arg, emit, switchTheme }) => {
    if (arg.length === 0) {
      await emit({ kind: "line", text: themeNames.join(" ") });
      await emit({ kind: "line", text: "Usage: theme <theme>", tone: "muted" });
      return;
    }

    if (arg.length !== 1 || !(arg[0] in themes)) {
      await emit({ kind: "line", text: "Usage: theme <theme>", tone: "error" });
      return;
    }

    // Theme switching is delegated to the app-level theme context.
    switchTheme?.(themes[arg[0]]);
  },
  group: "Workspace",
  locksForTyping: false,
  tab: 7,
});
