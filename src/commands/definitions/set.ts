import {
  getSetStatusMessage,
  resolveSetCommand,
} from "../../utils/shellSession";
import { defineCommand, emitError } from "../helpers";

/**
 * Implements the `set` command for shell-session flags such as verbose mode.
 */
export const setCommand = defineCommand({
  name: "set",
  desc: "toggle shell options: set -v | set +v",
  execute: async context => {
    const currentPreferences = context.getShellPreferences?.();
    if (!currentPreferences || !context.setShellPreferences) {
      await emitError(context, "set: unavailable");
      return;
    }

    // Parsing and status formatting are delegated, but command flow stays local.
    const result = resolveSetCommand(context.arg, currentPreferences);
    if (result.kind === "invalid") {
      await context.emit({ kind: "line", text: result.message });
      return;
    }
    if (result.kind === "update") {
      context.setShellPreferences(result.nextPreferences);
      return;
    }

    await context.emit({
      kind: "line",
      text: getSetStatusMessage(currentPreferences),
    });
  },
  group: "Shell",
  locksForTyping: false,
  tab: 8,
});
