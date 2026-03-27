import { getEntry, listDirectory, resolveShellPath } from "../../shell/filesystem";
import { defineCommand } from "../helpers";

/**
 * Implements the `ls` command for directory listings inside the virtual shell.
 */
export const lsCommand = defineCommand({
  name: "ls",
  desc: "list files in the current directory",
  execute: async ({ arg, cwd, emit }) => {
    if (arg.length > 1) {
      await emit({ kind: "line", text: "Usage: ls <path>", tone: "error" });
      return;
    }

    const targetPath = resolveShellPath(arg[0], cwd);
    if (!targetPath || getEntry(targetPath)?.type !== "directory") {
      await emit({
        kind: "line",
        text: `ls: no such directory: ${arg[0] ?? "."}`,
        tone: "error",
      });
      return;
    }

    // Directory entries are emitted one by one so typing effects can stream.
    for (const item of listDirectory(targetPath) ?? []) {
      await emit({
        kind: "line",
        text: item.type === "directory" ? `${item.name}/` : item.name,
        tone: item.type === "directory" ? "accent" : "normal",
      });
    }
  },
  group: "Files",
  pathArguments: [{ index: 0, directoriesOnly: true }],
  tab: 5,
});
