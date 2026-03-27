import { defineCommand } from "../helpers";

const layoutModes = ["split", "terminal", "preview"] as const;

/**
 * Implements the `layout` command that controls the terminal/preview arrangement.
 */
export const layoutCommand = defineCommand({
  name: "layout",
  desc: "switch layout: split | terminal | preview",
  argumentSuggestions: { 0: layoutModes },
  execute: async ({ arg, emit, layoutMode, setLayoutMode }) => {
    // No arguments means "show status and usage" instead of mutating state.
    if (arg.length === 0) {
      await emit({ kind: "line", text: `Current layout: ${layoutMode ?? "split"}` });
      await emit({
        kind: "line",
        text: "Usage: layout <split | terminal | preview>",
        tone: "muted",
      });
      return;
    }

    if (arg.length !== 1 || !layoutModes.includes(arg[0] as (typeof layoutModes)[number])) {
      await emit({
        kind: "line",
        text: "Usage: layout <split | terminal | preview>",
        tone: "error",
      });
      return;
    }

    // Valid layout choices are forwarded to the shared workspace store.
    setLayoutMode?.(arg[0] as (typeof layoutModes)[number]);
  },
  group: "Workspace",
  locksForTyping: false,
  tab: 7,
});
