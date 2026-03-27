import { emitWorkspaceGlitch } from "../../utils/workspaceEvents";
import { defineCommand, emitError } from "../helpers";

/**
 * Implements the guarded `rm` command used for the portfolio's glitch effect.
 */
export const rmCommand = defineCommand({
  name: "rm",
  desc: "trigger protected shell effects for dangerous commands",
  execute: async context => {
    const { arg } = context;
    // A single dramatic input path is reserved for the visual glitch sequence.
    if (arg.length === 2 && arg[0] === "-rf" && arg[1] === "/") {
      emitWorkspaceGlitch();
      await emitError(context, "rm: refusing to remove root /");
      return;
    }

    await emitError(context, "rm: disabled in this terminal");
  },
  group: "Shell",
  tab: 9,
});
