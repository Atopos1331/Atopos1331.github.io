import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const contentRoot = join(process.cwd(), "src", "content");
const pluginRawPattern = /\.plg-raw$/i;
const executableRawPattern = /\.exe-raw$/i;

const toVirtualRoute = (relativePath: string) => {
  if (pluginRawPattern.test(relativePath)) {
    return `/${relativePath.replace(pluginRawPattern, ".plg")}`;
  }

  if (executableRawPattern.test(relativePath)) {
    return `/${relativePath.replace(executableRawPattern, ".exe")}`;
  }

  return `/${relativePath}`;
};

const readContentRoutes = (directory: string): string[] =>
  readdirSync(directory).flatMap(entry => {
    const entryPath = join(directory, entry);
    const relativePath = relative(contentRoot, entryPath).split(sep).join("/");

    if (statSync(entryPath).isDirectory()) {
      return readContentRoutes(entryPath);
    }

    return [toVirtualRoute(relativePath)];
  });

// These are route-shape hints for the virtual preview fallback, not the filesystem itself.
export const virtualPreviewRoutes = readContentRoutes(contentRoot);

const virtualPreviewRouteSet = new Set(
  virtualPreviewRoutes.map(route => route.toLowerCase())
);

export const isVirtualPreviewRoute = (pathname: string) =>
  virtualPreviewRouteSet.has(pathname.toLowerCase());
