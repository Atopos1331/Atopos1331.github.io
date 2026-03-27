import { displayPath } from "../../shell/filesystem";
import { defineCommand } from "../helpers";

/**
 * Implements the `pwd` command.
 */
export const pwdCommand = defineCommand({
  name: "pwd",
  desc: "print current working directory",
  execute: async ({ cwd, emit }) => {
    await emit({ kind: "line", text: displayPath(cwd) });
  },
  group: "Files",
  tab: 10,
});
