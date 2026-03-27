import { getEntry, listDirectory } from "./shellManifest";
import { resolveShellPath } from "./shellPath";

/**
 * Returns shell path completions for the active token.
 */
export const getPathSuggestions = (
  value: string | undefined,
  cwd: string,
  directoriesOnly = false
) => {
  const rawValue = value ?? "";

  if (rawValue === "~") {
    return ["~/"];
  }

  const normalizedValue = rawValue.trim();
  const hasTrailingSlash = normalizedValue.endsWith("/");
  const lastSlashIndex = normalizedValue.lastIndexOf("/");

  const parentInput =
    normalizedValue === ""
      ? "."
      : hasTrailingSlash
        ? normalizedValue
        : lastSlashIndex >= 0
          ? normalizedValue.slice(0, lastSlashIndex + 1)
          : ".";

  const valuePrefix =
    normalizedValue === ""
      ? ""
      : hasTrailingSlash
        ? normalizedValue
        : lastSlashIndex >= 0
          ? normalizedValue.slice(0, lastSlashIndex + 1)
          : "";

  const namePrefix =
    normalizedValue === ""
      ? ""
      : hasTrailingSlash
        ? ""
        : lastSlashIndex >= 0
          ? normalizedValue.slice(lastSlashIndex + 1)
          : normalizedValue;

  const parentPath = resolveShellPath(parentInput, cwd);

  if (!parentPath || getEntry(parentPath)?.type !== "directory") {
    return [];
  }

  return (listDirectory(parentPath) ?? [])
    .filter(item => !directoriesOnly || item.type === "directory")
    .filter(item => item.name.startsWith(namePrefix))
    .map(item => `${valuePrefix}${item.name}${item.type === "directory" ? "/" : ""}`);
};
