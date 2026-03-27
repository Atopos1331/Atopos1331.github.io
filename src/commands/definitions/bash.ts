import {
  getFile,
  getFileTextContent,
  resolveShellPath,
  shellRootPath,
} from "../../shell/filesystem";
import { defineCommand, emitError } from "../helpers";

/**
 * Implements the `bash` command for running script files from the virtual shell.
 */
export const bashCommand = defineCommand({
  name: "bash",
  desc: "run a shell script from the virtual filesystem",
  helpLines: ["bash <file.sh>"],
  execute: async context => {
    const { arg, cwd, runScript, setIdlePathname } = context;

    if (arg.length !== 1) {
      await emitError(context, "Usage: bash <file.sh>");
      return;
    }

    // Script resolution still goes through the same shell path rules as `cat` and `ls`.
    const scriptPath = resolveShellPath(arg[0], cwd);
    const scriptFile = scriptPath ? getFile(scriptPath) : null;
    const scriptSource = scriptPath ? getFileTextContent(scriptPath) : null;
    const isScriptFile = !!scriptPath && scriptPath.endsWith(".sh") && !!scriptFile;

    if (!isScriptFile || !scriptPath || !scriptFile || scriptSource === null) {
      await emitError(context, `bash: no such script: ${arg[0]}`);
      return;
    }

    // The idle pathname keeps the browser URL aligned with the running script location.
    const idlePathname =
      scriptPath.startsWith(shellRootPath)
        ? scriptPath.slice(shellRootPath.length) || "/"
        : "/";

    setIdlePathname?.(idlePathname);
    await runScript(scriptSource, { idlePathname });
  },
  group: "Files",
  pathArguments: [{ index: 0, fileExtensions: ["sh"] }],
  tab: 9,
});
