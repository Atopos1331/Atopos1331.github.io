import {
  getEntry,
  getFileBase64,
  resolveShellPath,
} from "../../shell/filesystem";
import { defineCommand } from "../helpers";

/**
 * Implements the `base64` command and keeps all validation local to this file.
 */
export const base64Command = defineCommand({
  name: "base64",
  desc: "encode a file from the shell filesystem as base64",
  execute: async ({ arg, cwd, emit }) => {
    // The command accepts exactly one shell path argument.
    if (arg.length !== 1) {
      await emit({ kind: "line", text: "Usage: base64 <file>", tone: "error" });
      return;
    }

    const targetPath = resolveShellPath(arg[0], cwd);

    if (!targetPath || getEntry(targetPath)?.type !== "file") {
      await emit({ kind: "line", text: `base64: no such file: ${arg[0]}`, tone: "error" });
      return;
    }

    // Binary and text files are both normalized through the shell reader layer.
    const output = await getFileBase64(targetPath);

    if (!output) {
      await emit({
        kind: "line",
        text: `base64: unable to read file: ${arg[0]}`,
        tone: "error",
      });
      return;
    }

    await emit({ kind: "line", text: output });
  },
  group: "Files",
  pathArguments: [{ index: 0 }],
  tab: 1,
});
