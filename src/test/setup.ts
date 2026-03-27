import "@testing-library/jest-dom";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { encodeExecutableSource, encodePluginSource } from "../utils/elfCodec";
import {
  setBinaryAssetFallbackReader,
} from "../shell/shellReader";
import { shellRootPath } from "../shell/shellPath";

setBinaryAssetFallbackReader(async targetPath => {
  const workspacePath = path.resolve(
    process.cwd(),
    targetPath.startsWith("src/")
      ? targetPath
      : `src/content${targetPath.slice(shellRootPath.length)}`
  );

  if (targetPath.endsWith(".plg-raw")) {
    const sourceText = await readFile(workspacePath, "utf8");
    return encodePluginSource(sourceText);
  }

  if (targetPath.endsWith(".exe-raw")) {
    const sourceText = await readFile(workspacePath, "utf8");
    return encodeExecutableSource(sourceText);
  }

  const buffer = await readFile(workspacePath);
  return new Uint8Array(buffer);
});
