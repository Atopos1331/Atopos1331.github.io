import { defineCommand } from "../helpers";

/**
 * Implements the `uname` command.
 */
export const unameCommand = defineCommand({
  name: "uname",
  desc: "print the operating system name",
  execute: async ({ emit }) => {
    await emit({ kind: "line", text: "AtopOS" });
  },
  group: "Shell",
  tab: 7,
});
