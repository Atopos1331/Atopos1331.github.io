import { profile } from "../../data/siteContent";
import { defineCommand } from "../helpers";

/**
 * Implements the `linkedin` shortcut command.
 */
export const linkedinCommand = defineCommand({
  name: "linkedin",
  desc: "open my LinkedIn profile in a new tab",
  execute: () => {
    window.open(profile.linkedinUrl, "_blank", "noopener,noreferrer");
  },
  group: "Links",
  tab: 1,
});
