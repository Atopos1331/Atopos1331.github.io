import {
  getEntry,
  getFileBytes,
  resolveShellPath,
} from "../../shell/filesystem";
import { formatHexDump } from "../../utils/forensics";
import { defineCommand } from "../helpers";

/**
 * Implements the `xxd` command for hex dumping shell files.
 */
export const xxdCommand = defineCommand({
  name: "xxd",
  desc: "render a file as hex dump",
  execute: async ({ arg, cwd, emit }) => {
    if (arg.length !== 1) {
      await emit({ kind: "line", text: "Usage: xxd <file>", tone: "error" });
      return;
    }

    const targetPath = resolveShellPath(arg[0], cwd);
    if (!targetPath || getEntry(targetPath)?.type !== "file") {
      await emit({ kind: "line", text: `xxd: no such file: ${arg[0]}`, tone: "error" });
      return;
    }

    // Hex formatting is shared so output stays consistent across views and tests.
    const bytes = await getFileBytes(targetPath);
    if (!bytes) {
      await emit({
        kind: "line",
        text: `xxd: unable to read file: ${arg[0]}`,
        tone: "error",
      });
      return;
    }

    await emit({
      kind: "pre",
      text: formatHexDump(bytes) || `xxd: empty file: ${arg[0]}`,
    });
  },
  group: "Files",
  pathArguments: [{ index: 0 }],
  tab: 6,
});
