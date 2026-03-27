import {
  basename,
  getFile,
  getFileBytes,
  getPathSuggestions,
  resolveShellPath,
} from "../../shell/filesystem";
import { decodeExecutableBytes } from "../../utils/elfCodec";
import { defineCommand, emitAccent, emitError } from "../helpers";

type LoadedExecutableResult =
  | {
      decoded: ReturnType<typeof decodeExecutableBytes>;
      error?: undefined;
      file: ReturnType<typeof getFile> & { renderer: "executable" };
    }
  | {
      decoded?: undefined;
      error: string;
      file?: undefined;
    };

const loadExecutableFile = async (
  pathArg: string,
  cwd: string
): Promise<LoadedExecutableResult> => {
  const targetPath = resolveShellPath(pathArg, cwd);
  const file = targetPath ? getFile(targetPath) : null;

  if (!file) {
    return {
      error: `exe: no such file: ${pathArg}`,
    };
  }

  if (file.renderer !== "executable") {
    return {
      error: `exe: not an executable file: ${pathArg}`,
    };
  }

  const bytes = await getFileBytes(file.path);

  if (!bytes) {
    return {
      error: `exe: unable to read executable file: ${pathArg}`,
    };
  }

  try {
    const decoded = decodeExecutableBytes(bytes);

    if (!decoded.manifest) {
      return {
        error: `exe: invalid executable manifest: ${pathArg}`,
      };
    }

    return {
      decoded,
      file,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? `exe: ${error.message}`
          : `exe: invalid executable manifest: ${pathArg}`,
    };
  }
};

export const exeCommand = defineCommand({
  name: "exe",
  desc: "run a blocking .exe program session: exe <file.exe>",
  autocomplete: ({ activeArgIndex, activeToken, cwd }) => {
    if (activeArgIndex !== 0) {
      return [];
    }

    return getPathSuggestions(activeToken, cwd).filter(
      suggestion => suggestion.endsWith("/") || suggestion.toLowerCase().endsWith(".exe")
    );
  },
  execute: async context => {
    const targetArg = context.arg[0];

    if (!targetArg || context.arg.length !== 1) {
      await emitError(context, "Usage: exe <file.exe>");
      return;
    }

    if (!context.runProgram) {
      await emitError(context, "exe: program runtime unavailable");
      return;
    }

    const loadedExecutable = await loadExecutableFile(targetArg, context.cwd);

    if (loadedExecutable.error) {
      await emitError(context, loadedExecutable.error);
      return;
    }

    const executableFile = loadedExecutable.file;
    const decodedExecutable = loadedExecutable.decoded;

    if (!executableFile || !decodedExecutable) {
      await emitError(context, `exe: invalid executable manifest: ${targetArg}`);
      return;
    }

    await emitAccent(
      context,
      `Program session started: ${basename(executableFile.path)}`
    );
    const manifest = decodedExecutable.manifest;

    if (!manifest) {
      await emitError(context, `exe: invalid executable manifest: ${targetArg}`);
      return;
    }

    const exitCode = await context.runProgram({
      name: manifest.name,
      path: executableFile.path,
      script: manifest.runtime.script,
    });

    if (exitCode !== 0 && exitCode !== 130) {
      await emitError(
        context,
        `Program exited with code ${exitCode}: ${basename(executableFile.path)}`
      );
      return;
    }

    if (exitCode === 0) {
      await emitAccent(
        context,
        `Program finished: ${basename(executableFile.path)}`
      );
    }
  },
  group: "Workspace",
  pathArguments: [
    {
      fileExtensions: ["exe"],
      index: 0,
    },
  ],
  tab: 4,
});
