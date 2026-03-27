import { profile } from "../data/siteContent";

/**
 * The virtual shell is rooted at the user's portfolio home directory.
 */
export const shellRootPath = profile.homeDirectory;

/**
 * Returns the final segment of a shell path.
 */
export const basename = (path: string) => {
  const segments = path.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? path;
};

/**
 * Returns the parent directory for a shell path.
 */
export const dirname = (path: string) => {
  if (path === shellRootPath) {
    return shellRootPath;
  }

  const segments = path.split("/").filter(Boolean);
  if (segments.length <= 2) {
    return shellRootPath;
  }

  return `/${segments.slice(0, -1).join("/")}`;
};

/**
 * Converts an absolute shell path into the user-facing prompt form.
 */
export const displayPath = (path: string) =>
  path.startsWith(shellRootPath)
    ? path.replace(shellRootPath, "~") || "~"
    : path;

/**
 * Converts a shell path into the preferred user input form.
 */
export const getShellInputPath = (path: string) => displayPath(path);

/**
 * Resolves a user-entered shell path against the current working directory.
 */
export const resolveShellPath = (value: string | undefined, cwd: string) => {
  if (!value || value.trim() === "") {
    return cwd;
  }

  const normalizedValue = value.trim();
  const seedPath = normalizedValue.startsWith("/")
    ? normalizedValue
    : normalizedValue.startsWith("~")
      ? normalizedValue.replace("~", shellRootPath)
      : `${cwd}/${normalizedValue}`;

  const parts = seedPath.split("/").filter(Boolean);
  const resolvedParts: string[] = [];

  for (const part of parts) {
    if (part === ".") {
      continue;
    }

    if (part === "..") {
      if (resolvedParts.length > 2) {
        resolvedParts.pop();
      }
      continue;
    }

    resolvedParts.push(part);
  }

  const resolvedPath = `/${resolvedParts.join("/")}`;
  return resolvedPath.startsWith(shellRootPath) ? resolvedPath : null;
};
