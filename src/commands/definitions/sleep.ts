import { defineCommand, emitError } from "../helpers";

/**
 * Implements the `sleep` command and keeps all delay semantics in one place.
 */
export const sleepCommand = defineCommand({
  name: "sleep",
  desc: "wait for a number of seconds",
  execute: async context => {
    if (context.arg.length !== 1) {
      await emitError(context, "Usage: sleep <seconds>");
      return;
    }

    const seconds = Number(context.arg[0]);
    if (!Number.isFinite(seconds) || seconds < 0) {
      await emitError(context, `sleep: invalid duration: ${context.arg[0]}`);
      return;
    }

    // The runtime owns interruption; this command only decides whether to wait.
    const shouldContinue = await context.delayMs(seconds * 1000);
    if (!shouldContinue || context.shouldStop?.() === true) {
      return;
    }
  },
  group: "Shell",
  locksForTyping: false,
  tab: 6,
});
