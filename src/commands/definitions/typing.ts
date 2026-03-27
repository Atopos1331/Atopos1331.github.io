import {
  getTypingStatusMessage,
  resolveTypingCommand,
} from "../../utils/typingPreferences";
import { defineCommand, emitError } from "../helpers";

const typingModes = ["0", "18", "24", "60"] as const;

/**
 * Implements the `typing` command for per-character output speed.
 */
export const typingCommand = defineCommand({
  name: "typing",
  desc: "set per-character output speed: typing <0 | speed-ms>",
  argumentSuggestions: { 0: typingModes },
  execute: async context => {
    const currentPreferences = context.getTypingPreferences?.();
    if (!currentPreferences || !context.setTypingPreferences) {
      await emitError(context, "typing: unavailable");
      return;
    }

    // Parsing is centralized, but the command owns when updates are applied.
    const result = resolveTypingCommand(context.arg, currentPreferences);
    if (result.kind === "invalid") {
      await context.emit({ kind: "line", text: result.message });
      return;
    }
    if (result.kind === "update") {
      context.setTypingPreferences(result.nextPreferences);
      return;
    }

    await context.emit({
      kind: "line",
      text: getTypingStatusMessage(currentPreferences),
    });
  },
  group: "Workspace",
  locksForTyping: false,
  tab: 4,
});
