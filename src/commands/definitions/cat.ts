import {
  getEntry,
  getFileTextContent,
  resolveShellPath,
} from "../../shell/filesystem";
import { defineCommand } from "../helpers";

/**
 * Implements the `cat` command for reading text content from the virtual shell.
 */
export const catCommand = defineCommand({
  name: "cat",
  desc: "print a file from the shell filesystem",
  execute: async ({ arg, cwd, emit }) => {
    // `cat` is intentionally strict so bad invocations fail predictably.
    if (arg.length !== 1) {
      await emit({ kind: "line", text: "Usage: cat <file>", tone: "error" });
      return;
    }

    const targetPath = resolveShellPath(arg[0], cwd);

    if (!targetPath || getEntry(targetPath)?.type !== "file") {
      await emit({ kind: "line", text: `cat: no such file: ${arg[0]}`, tone: "error" });
      return;
    }

    // Text output is emitted as a preformatted block to preserve file layout.
    await emit({
      kind: "pre",
      text: getFileTextContent(targetPath) ?? "",
    });
  },
  group: "Files",
  pathArguments: [{ index: 0 }],
  tab: 2,
});
