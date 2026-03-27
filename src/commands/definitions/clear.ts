import { defineCommand } from "../helpers";

/**
 * Implements the `clear` command as a terminal-history side effect.
 */
export const clearCommand = defineCommand({
  name: "clear",
  desc: "clear the terminal",
  execute: ({ arg, clearHistory }) => {
    if (arg.length === 0) {
      clearHistory?.();
    }
  },
  group: "Shell",
  locksForTyping: false,
  tab: 8,
});
