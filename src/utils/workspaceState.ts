import {
  basename,
  dirname,
  getFile,
  getShellInputPath,
  resolveShellPath,
  shellRootPath,
} from "../shell/filesystem";
import type { LayoutMode, PreviewMode } from "../types/workspace";

export type InitialWorkspaceState = {
  activePreviewPath: string;
  bootstrapCommands: string[];
  cwd: string;
  idlePathname: string;
  layoutMode: LayoutMode;
  previewMode: PreviewMode;
  terminalNotice: string | null;
};

const getPreviewMode = (search: string): PreviewMode => {
  const params = new URLSearchParams(search);
  return params.get("preview")?.toLowerCase() === "forced"
    ? "forced"
    : "normal";
};

const normalizeLayoutMode = (value: string | null): LayoutMode => {
  switch (value?.toLowerCase()) {
    case "preview":
      return "preview";
    case "terminal":
    case "fullscreen":
      return "terminal";
    case "split":
    default:
      return "split";
  }
};

export const resolvePreviewMatchFromUrl = (pathname: string) => {
  const normalizedPath = decodeURIComponent(pathname).replace(/^\/+|\/+$/g, "");

  if (!normalizedPath) {
    return {
      bootstrapCommands: [],
      kind: "root" as const,
      previewPath: "",
      routePathname: "/",
      terminalNotice: null,
    };
  }

  const resolved = resolveShellPath(normalizedPath, shellRootPath);
  const file = resolved ? getFile(resolved) : null;

  if (resolved && file) {
    const isShellScript = resolved.endsWith(".sh");

    return {
      bootstrapCommands: isShellScript
        ? [`cd ${getShellInputPath(dirname(resolved))}`, `bash ${basename(resolved)}`]
        : [
            `cd ${getShellInputPath(dirname(resolved))}`,
            `preview ${basename(resolved)}`,
          ],
      kind: (isShellScript ? "script" : "preview") as "preview" | "script",
      previewPath: isShellScript ? "" : resolved,
      routePathname: pathname,
      terminalNotice: null,
    };
  }

  return {
    bootstrapCommands: [],
    kind: "notFound" as const,
    previewPath: "",
    routePathname: "/",
    terminalNotice: `404: ${pathname} not found. Redirected to /.`,
  };
};

export const getInitialLayoutMode = (search: string): LayoutMode => {
  const params = new URLSearchParams(search);
  const layoutParam = params.get("layout");

  if (layoutParam) {
    return normalizeLayoutMode(layoutParam);
  }

  // Backward-compatible fallback for older shared URLs.
  if (params.get("preview")?.toLowerCase() === "fullscreen") {
    return "preview";
  }

  return "split";
};

export const resolvePreviewPathFromUrl = (pathname: string) => {
  return resolvePreviewMatchFromUrl(pathname).previewPath;
};

export const getInitialWorkspaceState = (
  pathname: string,
  search: string
): InitialWorkspaceState => {
  const previewMatch = resolvePreviewMatchFromUrl(pathname);
  const previewMode = getPreviewMode(search);
  const requestedLayoutMode = getInitialLayoutMode(search);
  const resolvedPath =
    previewMatch.kind === "preview"
      ? resolveShellPath(
          decodeURIComponent(pathname).replace(/^\/+|\/+$/g, ""),
          shellRootPath
        ) ?? ""
      : "";
  const activePreviewPath =
    (previewMode === "forced" && resolvedPath) ||
    (requestedLayoutMode === "preview" &&
      previewMatch.kind === "preview" &&
      resolvedPath)
      ? resolvedPath
      : previewMatch.previewPath;

  return {
    activePreviewPath,
    bootstrapCommands:
      ((previewMode === "forced" ||
        (requestedLayoutMode === "preview" &&
          previewMatch.kind === "preview")) &&
        activePreviewPath)
        ? []
        : previewMatch.bootstrapCommands,
    cwd: shellRootPath,
    idlePathname: previewMatch.routePathname,
    layoutMode:
      previewMode === "forced" && activePreviewPath
        ? "preview"
        : requestedLayoutMode,
    previewMode,
    terminalNotice: previewMatch.terminalNotice,
  };
};

export const getUrlPathForPreview = (previewPath: string) => {
  if (!previewPath) {
    return "/";
  }

  if (previewPath.startsWith(shellRootPath)) {
    const relativePath = previewPath.slice(shellRootPath.length);
    return relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  }

  return "/";
};
