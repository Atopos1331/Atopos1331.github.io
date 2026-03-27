import {
  displayPath,
  getFile,
  resolveShellPath,
} from "../../shell/filesystem";
import { defineCommand } from "../helpers";

/**
 * Implements the `preview` command that opens a shell file in the preview pane.
 */
export const previewCommand = defineCommand({
  name: "preview",
  desc: "preview a file from the shell filesystem",
  execute: async context => {
    const { arg, cwd, emit, getActivePreviewPath, openPreview } = context;

    if (arg.length === 0) {
      await emit({
        kind: "line",
        text: `Active preview: ${
          displayPath(getActivePreviewPath?.() ?? "") || "none"
        }`,
      });
      await emit({ kind: "line", text: "Usage: preview <file>", tone: "muted" });
      return;
    }

    if (arg.length !== 1) {
      await emit({ kind: "line", text: "Usage: preview <file>", tone: "error" });
      return;
    }

    // Preview commands always resolve paths relative to the current shell cwd.
    const targetPath = resolveShellPath(arg[0], cwd);
    const file = targetPath ? getFile(targetPath) : null;

    if (!file) {
      await emit({ kind: "line", text: `preview: no such file: ${arg[0]}`, tone: "error" });
      return;
    }

    // Successful previews also move the workspace into a visible split layout.
    openPreview?.(file.path);
    await emit({ kind: "line", text: `Previewing ${displayPath(file.path)}` });
  },
  group: "Files",
  pathArguments: [{ index: 0 }],
  tab: 1,
});
