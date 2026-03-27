import { defineCommand } from "../helpers";

/**
 * Implements the `date` command using the shell's UTC display convention.
 */
export const dateCommand = defineCommand({
  name: "date",
  desc: "print the current UTC date",
  execute: async ({ emit }) => {
    await emit({ kind: "line", text: new Date().toUTCString() });
  },
  group: "Shell",
  tab: 8,
});
