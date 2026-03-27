import {
  basename,
  getFile,
  getFileBytes,
  getPathSuggestions,
  type PluginFile,
  resolveShellPath,
} from "../../shell/filesystem";
import { decodePluginBytes } from "../../utils/elfCodec";
import { applyWorkspacePluginOverrides } from "../../utils/workspacePluginManifest";
import type {
  ActiveWorkspacePluginState,
  WorkspacePluginManifest,
} from "../../utils/workspacePluginManifest";
import { defineCommand, emitAccent, emitError } from "../helpers";
import type { CommandExecutionContext } from "../types";

type LoadedPluginResult = {
  decoded: ReturnType<typeof decodePluginBytes> & {
    manifest: WorkspacePluginManifest;
  };
  file: PluginFile;
};

/**
 * Implements the `plugin` command family, including inspection, decoding, and
 * plugin activation inside the workspace runtime.
 */
/**
 * Loads and validates a packaged plugin file.
 */
const loadPluginFile = async (
  pathArg: string,
  context: CommandExecutionContext
): Promise<LoadedPluginResult | null> => {
  const targetPath = resolveShellPath(pathArg, context.cwd);
  const file = targetPath ? getFile(targetPath) : null;

  if (!file) {
    await emitError(context, `plugin: no such file: ${pathArg}`);
    return null;
  }

  if (file.renderer !== "plugin") {
    await emitError(context, `plugin: not a plugin file: ${pathArg}`);
    return null;
  }

  const bytes = await getFileBytes(file.path);

  if (!bytes) {
    await emitError(context, `plugin: unable to read plugin file: ${pathArg}`);
    return null;
  }

  try {
    const decoded = decodePluginBytes(bytes);

    if (!decoded.manifest) {
      await emitError(context, `plugin: invalid plugin manifest: ${pathArg}`);
      return null;
    }

    return {
      decoded: {
        ...decoded,
        manifest: decoded.manifest,
      },
      file,
    };
  } catch (error) {
    await emitError(
      context,
      `plugin: ${(error as Error).message || `invalid plugin manifest: ${pathArg}`}`
    );
    return null;
  }
};

/**
 * Formats scalar values for the `plugin detail` output.
 */
const formatPluginDetailValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return "unset";
  }

  if (typeof value === "string") {
    return value.length > 0 ? `"${value}"` : '""';
  }

  return String(value);
};

/**
 * Aligns metadata blocks for the `plugin detail` output.
 */
const formatPluginDetailMetadata = (
  entries: ReadonlyArray<readonly [label: string, value: string]>
) => {
  const maxLabelLength = entries.reduce(
    (largest, [label]) => Math.max(largest, label.length),
    0
  );

  return entries.map(
    ([label, value]) => `  ${label.padEnd(maxLabelLength)} : ${value}`
  );
};

/**
 * Builds the human-readable `plugin detail` output.
 */
const formatPluginDetail = (
  filePath: string,
  manifest: WorkspacePluginManifest,
  active: boolean
) => {
  const metadataLines = formatPluginDetailMetadata([
    ["Active", active ? "yes" : "no"],
    ["File", basename(filePath)],
    ["Name", manifest.name],
    ["Module", manifest.entry.module],
    ["Scope", manifest.entry.scope ?? "workspace"],
    ["Mount", manifest.entry.mount ?? "background"],
  ]);

  const parameterBlocks =
    manifest.paramsSchema.length === 0
      ? ["  (none)"]
      : manifest.paramsSchema.flatMap((field, index) => {
          const detailLines: string[] = [
            `  ${field.label} (${field.key})`,
            ...formatPluginDetailMetadata([
              ["Type", field.type],
              [
                "Current",
                formatPluginDetailValue(
                  manifest.params[field.key] ?? field.defaultValue ?? null
                ),
              ],
              ["Default", formatPluginDetailValue(field.defaultValue ?? null)],
            ]).map(line => `  ${line.trimStart()}`),
          ];

          if (field.description) {
            detailLines.push(`    Description : ${field.description}`);
          }

          if (field.pattern) {
            detailLines.push(`    Pattern     : ${field.pattern}`);
          }

          if (
            field.min !== undefined ||
            field.max !== undefined ||
            field.step !== undefined
          ) {
            const rangeParts = [
              field.min !== undefined ? `min=${field.min}` : null,
              field.max !== undefined ? `max=${field.max}` : null,
              field.step !== undefined ? `step=${field.step}` : null,
            ].filter((part): part is string => part !== null);
            detailLines.push(`    Range       : ${rangeParts.join(", ")}`);
          }

          if (field.options && field.options.length > 0) {
            detailLines.push(
              `    Options     : ${field.options
                .map(option => `${option.label}=${formatPluginDetailValue(option.value)}`)
                .join(", ")}`
            );
          }

          return index < manifest.paramsSchema.length - 1
            ? [...detailLines, ""]
            : detailLines;
        });

  return ["Metadata", ...metadataLines, "", "Parameters", ...parameterBlocks].join(
    "\n"
  );
};

/**
 * Builds usage lines for the plugin command.
 */
const getPluginUsageLines = (manifest?: WorkspacePluginManifest | null) => {
  const lines = [
    "Usage: plugin <file.plg> [key=value ...]",
    "       plugin detail [file.plg]",
    "       plugin decode <file.plg>",
    "Behavior: running plugin <file.plg> again disables the same plugin when no overrides are provided.",
    "Tip: wrap assignments containing spaces as 'key=value with spaces'.",
  ];

  if (!manifest) {
    return lines;
  }

  return [
    ...lines,
    `Plugin: ${manifest.name}`,
    ...manifest.paramsSchema.map(field => {
      const patternText = field.pattern ? ` pattern=${field.pattern}` : "";
      const defaultValue = field.defaultValue ?? manifest.params[field.key] ?? "unset";
      return `  ${field.key}: ${field.type} default=${String(defaultValue)}${patternText}`;
    }),
  ];
};

/**
 * Emits plugin usage information.
 */
const emitPluginUsage = async (
  context: CommandExecutionContext,
  manifest?: WorkspacePluginManifest | null
) => {
  for (const line of getPluginUsageLines(manifest)) {
    await context.emit({
      kind: "line",
      text: line,
      tone: line.startsWith("Usage:") ? "accent" : "muted",
    });
  }
};

/**
 * Parses `key=value` overrides for the plugin command.
 */
const parsePluginOverrides = (arg: string[]) => {
  const overrides: Record<string, string> = {};
  const invalidSegments: string[] = [];

  arg.forEach(segment => {
    const equalsIndex = segment.indexOf("=");

    if (equalsIndex <= 0) {
      invalidSegments.push(segment);
      return;
    }

    const key = segment.slice(0, equalsIndex).trim();
    const value = segment.slice(equalsIndex + 1).trim();

    if (!key || value === "") {
      invalidSegments.push(segment);
      return;
    }

    overrides[key] = value;
  });

  return {
    invalidSegments,
    overrides,
  };
};

/**
 * Emits plugin detail for either a target file or the active plugin set.
 */
const emitPluginDetail = async (
  context: CommandExecutionContext,
  activePluginStates: ActiveWorkspacePluginState[],
  targetPathArg?: string
) => {
  if (targetPathArg) {
    const loadedPlugin = await loadPluginFile(targetPathArg, context);

    if (!loadedPlugin) {
      return;
    }

    const activeState = activePluginStates.find(
      state => state.path === loadedPlugin.file.path
    );
    await context.emit({
      kind: "pre",
      text: formatPluginDetail(
        loadedPlugin.file.path,
        activeState?.manifest ?? loadedPlugin.decoded.manifest,
        Boolean(activeState)
      ),
    });
    return;
  }

  if (activePluginStates.length === 0) {
    await context.emit({
      kind: "line",
      text: "plugin: no active plugins.",
      tone: "muted",
    });
    return;
  }

  for (const activePluginState of activePluginStates) {
    await context.emit({
      kind: "pre",
      text: formatPluginDetail(
        activePluginState.path,
        activePluginState.manifest,
        true
      ),
    });
  }
};

export const pluginCommand = defineCommand({
  name: "plugin",
  desc: "manage .plg workspace plugins: plugin <file> [key=value] | plugin detail [file] | plugin decode <file>",
  helpLines: [
    "plugin <file> [key=value]",
    "plugin detail [file]",
    "plugin decode <file>",
  ],
  autocomplete: ({ activeArgIndex, activeToken, tokens, cwd }) => {
    const getPluginPathSuggestions = () =>
      getPathSuggestions(activeToken, cwd).filter(
        suggestion => suggestion.endsWith("/") || suggestion.toLowerCase().endsWith(".plg")
      );

    // Suggestions are tailored to the current subcommand because the command is multi-stage.
    const subcommand = tokens[1];

    if (activeArgIndex === 0) {
      return ["detail", "decode", "current", ...getPluginPathSuggestions()].filter(
        (option, index, suggestions) =>
          option.startsWith(activeToken) && suggestions.indexOf(option) === index
      );
    }

    if (
      activeArgIndex === 1 &&
      (subcommand === "detail" || subcommand === "decode" || subcommand === "current")
    ) {
      return getPluginPathSuggestions();
    }

    return [];
  },
  execute: async context => {
    const { arg } = context;

    // Detail/current are read-only views over either a file or the active plugin state.
    if (arg[0] === "detail" || arg[0] === "current") {
      await emitPluginDetail(
        context,
        context.getActivePluginStates?.() ?? [],
        arg.length >= 2 ? arg[1] : undefined
      );
      return;
    }

    // Decode returns the original plugin source payload without mutating workspace state.
    if (arg[0] === "decode") {
      if (arg.length !== 2) {
        await emitError(context, "Usage: plugin decode <file.plg>");
        return;
      }

      const loadedPlugin = await loadPluginFile(arg[1], context);

      if (!loadedPlugin) {
        return;
      }

      await context.emit({
        kind: "pre",
        text: loadedPlugin.decoded.sourceText,
      });
      return;
    }

    if (arg.length === 0) {
      await emitPluginUsage(context);
      return;
    }

    if (!context.getActivePluginStates || !context.setActivePluginStates) {
      await emitError(context, "plugin: unavailable");
      return;
    }

    // Running `plugin <file>` toggles or updates the plugin in the shared workspace store.
    const loadedPlugin = await loadPluginFile(arg[0], context);

    if (!loadedPlugin) {
      return;
    }

    const { decoded, file } = loadedPlugin;
    const { invalidSegments, overrides } = parsePluginOverrides(arg.slice(1));

    if (invalidSegments.length > 0) {
      await emitError(
        context,
        `plugin: invalid override syntax: ${invalidSegments.join(", ")}`
      );
      await emitPluginUsage(context, decoded.manifest);
      return;
    }

    const overrideResult = applyWorkspacePluginOverrides(decoded.manifest, overrides);

    if (overrideResult.errors.length > 0) {
      for (const error of overrideResult.errors) {
        await emitError(context, `plugin: ${error}`);
      }
      await emitPluginUsage(context, decoded.manifest);
      return;
    }

    const activePluginStates = context.getActivePluginStates();
    const activePluginState = activePluginStates.find(
      state => state.path === file.path
    );
    const shouldDisable =
      activePluginState?.path === file.path && Object.keys(overrides).length === 0;

    if (shouldDisable) {
      context.setActivePluginStates(
        activePluginStates.filter(state => state.path !== file.path)
      );
      await emitAccent(context, `Plugin disabled: ${basename(file.path)}`);
      return;
    }

    const nextState: ActiveWorkspacePluginState = {
      manifest: overrideResult.manifest,
      path: file.path,
      sourceText: decoded.sourceText,
    };

    context.setActivePluginStates([
      ...activePluginStates.filter(state => state.path !== file.path),
      nextState,
    ]);
    await emitAccent(
      context,
      activePluginState?.path === file.path
        ? `Plugin updated: ${basename(file.path)}`
        : `Plugin enabled: ${basename(file.path)}`
    );
  },
  group: "Workspace",
  tab: 4,
});
