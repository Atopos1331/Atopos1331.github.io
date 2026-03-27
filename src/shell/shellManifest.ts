import { profile } from "../data/siteContent";
import { encodeExecutableSource, encodePluginSource } from "../utils/elfCodec";
import { basename, dirname, shellRootPath } from "./shellPath";

/**
 * The shell manifest converts bundled `src/content` assets into a virtual
 * filesystem that command handlers can query like a tiny operating system.
 */
export type ShellEntryType = "directory" | "file";
export type PreviewRenderer =
  | "markdown"
  | "html"
  | "iframe"
  | "plugin"
  | "executable"
  | "text"
  | "asset";
export type ShellPathKind =
  | "markdown"
  | "plugin"
  | "executable"
  | "html"
  | "script"
  | "raw"
  | "asset";
type ShellManifestRenderer =
  | "markdown"
  | "html"
  | "plugin"
  | "executable"
  | "text"
  | "asset";

type ShellFileDescriptor = {
  path: string;
  renderer: ShellManifestRenderer;
};

export type ShellDirectory = {
  type: "directory";
  path: string;
};

type ShellFileBase = {
  type: "file";
  path: string;
  renderer: PreviewRenderer;
};

export type MarkdownFile = ShellFileBase & {
  content: string;
  renderer: "markdown";
};

export type HtmlFile = ShellFileBase & {
  content: string;
  renderer: "html";
};

export type IframeFile = ShellFileBase & {
  fallbackUrl: string;
  renderer: "iframe";
  src: string;
  title: string;
};

export type TextFile = ShellFileBase & {
  content: string;
  renderer: "text";
};

type EncodedPackageFileBase = ShellFileBase & {
  src: string;
};

export type PluginFile = EncodedPackageFileBase & {
  renderer: "plugin";
};

export type ExecutableFile = EncodedPackageFileBase & {
  renderer: "executable";
};

export type AssetFile = ShellFileBase & {
  renderer: "asset";
  src: string;
};

export type ShellFile =
  | MarkdownFile
  | HtmlFile
  | IframeFile
  | PluginFile
  | ExecutableFile
  | TextFile
  | AssetFile;
export type ShellEntry = ShellDirectory | ShellFile;

const rawTextExtensions = [
  "md",
  "html",
  "txt",
  "sh",
  "js",
  "jsx",
  "ts",
  "tsx",
  "json",
  "css",
  "xml",
  "yml",
  "yaml",
  "toml",
  "ini",
  "py",
  "java",
  "c",
  "cpp",
  "h",
  "hpp",
  "cs",
  "rs",
  "go",
  "sql",
  "log",
  "conf",
  "diff",
  "patch",
  "ps1",
  "psd1",
  "psm1",
];
const rawTextExtensionPattern = new RegExp(
  `\\.(${rawTextExtensions.join("|")})$`,
  "i"
);
const pluginRawPattern = /\.plg-raw$/i;
const executableRawPattern = /\.exe-raw$/i;

/**
 * Vite exposes content files as eagerly loaded text and asset URLs.
 */
const shellTextContentModules = import.meta.glob(
  "../content/**/*.{md,html,txt,sh,js,jsx,ts,tsx,json,css,xml,yml,yaml,toml,ini,py,java,c,cpp,h,hpp,cs,rs,go,sql,log,conf,diff,patch,ps1,psd1,psm1}",
  {
    as: "raw",
    eager: true,
  }
) as Record<string, string>;
const shellPluginSourceModules = import.meta.glob("../content/**/*.plg-raw", {
  as: "raw",
  eager: true,
}) as Record<string, string>;
const shellExecutableSourceModules = import.meta.glob("../content/**/*.exe-raw", {
  as: "raw",
  eager: true,
}) as Record<string, string>;
const shellAssetModules = import.meta.glob(
  ["../content/**/*", "!../content/**/*.plg-raw", "!../content/**/*.exe-raw"],
  {
    eager: true,
    import: "default",
    query: "?url",
  }
) as Record<string, string>;

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = "";

  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
};

const toDataUrl = (bytes: Uint8Array) =>
  `data:application/octet-stream;base64,${bytesToBase64(bytes)}`;

const generatedPluginAssetModules = Object.fromEntries(
  Object.entries(shellPluginSourceModules).map(([modulePath, sourceText]) => [
    modulePath.replace(pluginRawPattern, ".plg"),
    toDataUrl(encodePluginSource(sourceText)),
  ])
) as Record<string, string>;

const generatedExecutableAssetModules = Object.fromEntries(
  Object.entries(shellExecutableSourceModules).map(([modulePath, sourceText]) => [
    modulePath.replace(executableRawPattern, ".exe"),
    toDataUrl(encodeExecutableSource(sourceText)),
  ])
) as Record<string, string>;

const shellResolvedAssetModules = {
  ...shellAssetModules,
  ...generatedPluginAssetModules,
  ...generatedExecutableAssetModules,
} as Record<string, string>;

const modulePathToShellPath = (modulePath: string) =>
  modulePath.replace("../content", shellRootPath).replace(/\\/g, "/");

const getRenderer = (path: string): ShellManifestRenderer => {
  if (path.endsWith(".md")) {
    return "markdown";
  }

  if (path.endsWith(".html")) {
    return "html";
  }

  if (path.endsWith(".plg")) {
    return "plugin";
  }

  if (path.endsWith(".exe")) {
    return "executable";
  }

  if (rawTextExtensionPattern.test(path)) {
    return "text";
  }

  if (path.includes(".")) {
    return "asset";
  }

  return "text";
};

const shellFileContents = Object.fromEntries(
  Object.entries(shellTextContentModules).map(([modulePath, content]) => [
    modulePathToShellPath(modulePath),
    content,
  ])
) as Record<string, string>;

const shellFileUrls = Object.fromEntries(
  Object.entries(shellResolvedAssetModules).map(([modulePath, url]) => [
    modulePathToShellPath(modulePath),
    url,
  ])
) as Record<string, string>;

const shellFileDescriptors: readonly ShellFileDescriptor[] = Object.keys(
  shellResolvedAssetModules
)
  .map(modulePath => {
    const path = modulePathToShellPath(modulePath);

    return {
      path,
      renderer: getRenderer(path),
    };
  })
  .sort((left, right) => left.path.localeCompare(right.path));

const shellDirectoryPaths = Array.from(
  new Set(
    shellFileDescriptors.flatMap(({ path }) => {
      const nestedDirectories: string[] = [shellRootPath];
      const segments = path.slice(shellRootPath.length).split("/").filter(Boolean);
      let currentPath: string = shellRootPath;

      for (const segment of segments.slice(0, -1)) {
        currentPath = `${currentPath}/${segment}`;
        nestedDirectories.push(currentPath);
      }

      return nestedDirectories;
    })
  )
).sort((left, right) => left.localeCompare(right));

export const shellFileRoutePaths = shellFileDescriptors.map(({ path }) => {
  const relativePath = path.slice(shellRootPath.length);
  return relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
});

export const defaultPreviewPath = `${profile.homeDirectory}/description.md`;

const directories = new Set<string>(shellDirectoryPaths);

const shellFiles: Record<string, ShellFile> = Object.fromEntries(
  shellFileDescriptors.map(descriptor => [
    descriptor.path,
    descriptor.renderer === "asset"
      ? {
          type: "file",
          path: descriptor.path,
          renderer: "asset",
          src: shellFileUrls[descriptor.path],
        }
      : descriptor.renderer === "plugin"
        ? {
            type: "file",
            path: descriptor.path,
            renderer: "plugin",
            src: shellFileUrls[descriptor.path],
          }
        : descriptor.renderer === "executable"
          ? {
              type: "file",
              path: descriptor.path,
              renderer: "executable",
              src: shellFileUrls[descriptor.path],
            }
          : {
              type: "file",
              path: descriptor.path,
              renderer: descriptor.renderer,
              content: shellFileContents[descriptor.path],
            },
  ])
) as Record<string, ShellFile>;

/**
 * Returns the shell path kind used by preview and autocomplete.
 */
export const getShellPathKind = (path: string): ShellPathKind => {
  if (/\.md$/i.test(path)) {
    return "markdown";
  }

  if (/\.plg$/i.test(path)) {
    return "plugin";
  }

  if (/\.exe$/i.test(path)) {
    return "executable";
  }

  if (/\.html$/i.test(path)) {
    return "html";
  }

  if (/\.sh$/i.test(path)) {
    return "script";
  }

  if (/\.[a-z0-9]+$/i.test(path)) {
    return "asset";
  }

  return "raw";
};

/**
 * Looks up a filesystem entry by shell path.
 */
export const getEntry = (path: string): ShellEntry | null => {
  if (directories.has(path)) {
    return {
      type: "directory",
      path,
    };
  }

  return shellFiles[path] ?? null;
};

/**
 * Returns a file entry when the path resolves to a file.
 */
export const getFile = (path: string) => {
  const entry = getEntry(path);
  return entry?.type === "file" ? entry : null;
};

/**
 * Lists a directory in shell ordering: folders first, then files.
 */
export const listDirectory = (path: string) => {
  if (!directories.has(path)) {
    return null;
  }

  const entries: Array<{ name: string; path: string; type: ShellEntryType }> = [];

  directories.forEach(directoryPath => {
    if (directoryPath !== path && dirname(directoryPath) === path) {
      entries.push({
        name: basename(directoryPath),
        path: directoryPath,
        type: "directory",
      });
    }
  });

  Object.values(shellFiles).forEach(file => {
    if (dirname(file.path) === path) {
      entries.push({
        name: basename(file.path),
        path: file.path,
        type: "file",
      });
    }
  });

  return entries.sort((left, right) => {
    if (left.type !== right.type) {
      return left.type === "directory" ? -1 : 1;
    }

    return left.name.localeCompare(right.name);
  });
};
