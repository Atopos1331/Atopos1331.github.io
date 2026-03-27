import { defineCommand } from "../helpers";

/**
 * Implements the `echo` command for plain line output.
 */
export const echoCommand = defineCommand({
  name: "echo",
  desc: "print out anything",
  execute: async ({ arg, emit }) => {
    await emit({ kind: "line", text: arg.join(" ") });
  },
  group: "Shell",
  tab: 9,
});
