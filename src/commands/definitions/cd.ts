import { getEntry, resolveShellPath } from "../../shell/filesystem";
import { defineCommand, emitError } from "../helpers";

/**
 * Implements the `cd` command and updates the terminal working directory.
 */
export const cdCommand = defineCommand({
  name: "cd",
  desc: "change current directory",
  execute: async context => {
    const { arg, cwd, setCwd } = context;

    // Extra arguments are ignored to match the lightweight shell semantics.
    if (arg.length > 1) {
      return;
    }

    const target = arg[0] ?? "~";
    const nextPath = resolveShellPath(target, cwd);

    if (!nextPath) {
      await emitError(context, `cd: no such file or directory: ${target}`);
      return;
    }

    const entry = getEntry(nextPath);

    if (!entry) {
      await emitError(context, `cd: no such file or directory: ${target}`);
      return;
    }

    if (entry.type !== "directory") {
      await emitError(context, `cd: not a directory: ${target}`);
      return;
    }

    if (entry.type === "directory") {
      setCwd(nextPath);
    }
  },
  group: "Files",
  locksForTyping: false,
  pathArguments: [{ index: 0, directoriesOnly: true }],
  tab: 5,
});
