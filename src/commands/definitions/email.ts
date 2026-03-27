import { profile } from "../../data/siteContent";
import { defineCommand } from "../helpers";

/**
 * Implements the `email` command by delegating to a `mailto:` navigation.
 */
export const emailCommand = defineCommand({
  name: "email",
  desc: "send an email to me",
  execute: () => {
    window.location.href = `mailto:${profile.email}`;
  },
  group: "Links",
  tab: 8,
});
