import { profile } from "../../data/siteContent";
import { defineCommand } from "../helpers";

/**
 * Implements the `whoami` command using profile metadata.
 */
export const whoamiCommand = defineCommand({
  name: "whoami",
  desc: "about current user",
  execute: async ({ emit }) => {
    await emit({ kind: "line", text: profile.promptUser });
  },
  group: "Shell",
  tab: 7,
});
