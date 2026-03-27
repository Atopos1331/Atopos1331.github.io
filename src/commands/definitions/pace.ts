import {
  getPaceStatusMessage,
  resolvePaceCommand,
} from "../../utils/typingPreferences";
import { defineCommand, emitError } from "../helpers";

const paceModes = ["off"] as const;

/**
 * Implements the `pace` command for inter-command delay preferences.
 */
export const paceCommand = defineCommand({
  name: "pace",
  desc: "set delay between commands in ms",
  argumentSuggestions: { 0: paceModes },
  execute: async context => {
    const currentPreferences = context.getTypingPreferences?.();
    if (!currentPreferences || !context.setTypingPreferences) {
      await emitError(context, "pace: unavailable");
      return;
    }

    // Parsing stays in the shared preferences helper while command flow stays here.
    const result = resolvePaceCommand(context.arg, currentPreferences);
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
      text: getPaceStatusMessage(currentPreferences),
    });
  },
  group: "Workspace",
  locksForTyping: false,
  tab: 7,
});
