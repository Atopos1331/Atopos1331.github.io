import { profile } from "../../data/siteContent";
import { defineCommand } from "../helpers";

/**
 * Implements the `github` shortcut command.
 */
export const githubCommand = defineCommand({
  name: "github",
  desc: "open my GitHub profile in a new tab",
  execute: () => {
    window.open(profile.githubUrl, "_blank", "noopener,noreferrer");
  },
  group: "Links",
  tab: 2,
});
