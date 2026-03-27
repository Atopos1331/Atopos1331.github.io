import { getCommandDefinition } from "../commands/specs";
import type { CommandExecutionContext } from "../commands/types";
import { defaultShellSessionPreferences } from "./shellSession";
import type { ActiveWorkspacePluginState } from "./workspacePluginManifest";
import type { LayoutMode, WorkspaceBackgroundBlur } from "../types/workspace";
import type { ShellSessionPreferences } from "./shellSession";
import type { TypingPreferences } from "./typingPreferences";
import type { WorkspaceBackgroundPath } from "../types/workspace";
import type { ProgramSessionDescriptor } from "../program/programTypes";

/**
 * The shell runtime is the execution core that bridges parsed user input with
 * the command registry and script runner.
 */
export type ShellRuntimeChunk =
  | {
      kind: "line";
      text: string;
      tone?: "normal" | "error" | "muted" | "accent";
    }
  | {
      kind: "pre";
      text: string;
      tone?: "normal" | "error" | "muted";
    }
  | {
      kind: "source";
      sourceKind: "blank" | "comment" | "command";
      text: string;
      tone?: "normal" | "error" | "muted";
    };

export type ShellLineExecutionResult = {
  emittedOutput: boolean;
};

export type ShellRuntimeContext = {
  clearHistory?: () => void;
  emit: (chunk: ShellRuntimeChunk) => Promise<void>;
  getActivePluginStates?: () => ActiveWorkspacePluginState[];
  getActivePreviewPath?: () => string;
  getBackgroundBlur?: () => WorkspaceBackgroundBlur;
  getBackgroundOverlayOpacity?: () => number;
  getBackgroundPath?: () => WorkspaceBackgroundPath;
  getCwd: () => string;
  getShellPreferences?: () => ShellSessionPreferences;
  getTypingPreferences?: () => TypingPreferences;
  layoutMode?: LayoutMode;
  openPreview?: (path: string) => void;
  runProgram?: (descriptor: ProgramSessionDescriptor) => Promise<number>;
  setActivePluginStates?: (states: ActiveWorkspacePluginState[]) => void;
  setBackgroundBlur?: (blur: WorkspaceBackgroundBlur) => void;
  setBackgroundOverlayOpacity?: (opacity: number) => void;
  setBackgroundPath?: (path: WorkspaceBackgroundPath) => void;
  setCwd: (cwd: string) => void;
  setIdlePathname?: (pathname: string) => void;
  setLayoutMode?: (layoutMode: LayoutMode) => void;
  setShellPreferences?: (preferences: ShellSessionPreferences) => void;
  setTypingPreferences?: (preferences: TypingPreferences) => void;
  shouldStop?: () => boolean;
  switchTheme?: CommandExecutionContext["switchTheme"];
};

type ShellScriptState = {
  verbose: boolean;
};

type ShellScriptLine = {
  hasRunnableCommand: boolean;
  sourceKind: "blank" | "comment" | "command";
  text: string;
  trimmedText: string;
};

type ShellScriptLineEffect =
  | {
      kind: "none";
    }
  | {
      kind: "state-change";
      value: boolean;
    }
  | {
      kind: "command";
      source: string;
    };

const tokenPattern = /'[^']*'|"[^"]*"|`[^`]*`|\S+/g;

/**
 * Removes shell comments while preserving quoted `#` characters.
 */
export const stripShellComment = (value: string) => {
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];

    if (character === "'" && !inDoubleQuote && !inBacktick) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (character === '"' && !inSingleQuote && !inBacktick) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (character === "`" && !inSingleQuote && !inDoubleQuote) {
      inBacktick = !inBacktick;
      continue;
    }

    if (character === "#" && !inSingleQuote && !inDoubleQuote && !inBacktick) {
      return value.slice(0, index);
    }
  }

  return value;
};

/**
 * Removes matching quotes from a token.
 */
export const stripMatchingQuotes = (value: string) => {
  if (value.length < 2) {
    return value;
  }

  const firstChar = value[0];
  const lastChar = value[value.length - 1];

  if (
    (firstChar === "'" || firstChar === '"' || firstChar === "`") &&
    firstChar === lastChar
  ) {
    return value.slice(1, -1);
  }

  return value;
};

/**
 * Tokenizes shell input into command and arguments.
 */
export const tokenizeShellInput = (value: string) =>
  (value.match(tokenPattern) ?? []).map(stripMatchingQuotes);

export type ParsedShellInput = {
  command: string;
  comment: string;
  content: string;
  normalizedInput: string;
  tokens: string[];
};

export const parseShellInput = (value: string): ParsedShellInput => {
  const commentStartIndex = (() => {
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inBacktick = false;

    for (let index = 0; index < value.length; index += 1) {
      const character = value[index];

      if (character === "'" && !inDoubleQuote && !inBacktick) {
        inSingleQuote = !inSingleQuote;
        continue;
      }

      if (character === '"' && !inSingleQuote && !inBacktick) {
        inDoubleQuote = !inDoubleQuote;
        continue;
      }

      if (character === "`" && !inSingleQuote && !inDoubleQuote) {
        inBacktick = !inBacktick;
        continue;
      }

      if (character === "#" && !inSingleQuote && !inDoubleQuote && !inBacktick) {
        return index;
      }
    }

    return -1;
  })();
  const content = commentStartIndex >= 0 ? value.slice(0, commentStartIndex) : value;
  const comment = commentStartIndex >= 0 ? value.slice(commentStartIndex) : "";
  const normalizedInput = content.trim();
  const tokens = normalizedInput === "" ? [] : tokenizeShellInput(normalizedInput);

  return {
    command: tokens[0] ?? "",
    comment,
    content,
    normalizedInput,
    tokens,
  };
};

/**
 * Parses the `sleep` duration helper used by UI validation.
 */
export const parseSleepSeconds = (value: string | undefined) => {
  if (!value) {
    return null;
  }

  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
};

/**
 * Returns the shell date string format used throughout the app.
 */
export const getShellDateString = (date = new Date()) => date.toUTCString();

/**
 * Indicates whether the current execution should be interrupted.
 */
const shouldStop = (context: ShellRuntimeContext) => context.shouldStop?.() === true;

/**
 * Waits for an interruptible delay.
 */
export const waitForShellDelay = async (
  milliseconds: number,
  context: ShellRuntimeContext
) => {
  if (milliseconds <= 0) {
    return !shouldStop(context);
  }

  let remaining = milliseconds;

  while (remaining > 0) {
    if (shouldStop(context)) {
      return false;
    }

    const step = Math.min(remaining, 50);

    await new Promise(resolve => {
      window.setTimeout(resolve, step);
    });

    remaining -= step;
  }

  return !shouldStop(context);
};

/**
 * Classifies a shell script line for verbose rendering and execution.
 */
const classifyShellScriptLine = (line: string): ShellScriptLine => {
  const trimmedText = line.trim();
  const runnableText = stripShellComment(line).trim();
  const hasRunnableCommand = runnableText !== "";
  const sourceKind =
    trimmedText === ""
      ? "blank"
      : hasRunnableCommand
        ? "command"
        : "comment";

  return {
    hasRunnableCommand,
    sourceKind,
    text: line,
    trimmedText,
  };
};

/**
 * Detects shell script lines that toggle verbose state without producing output.
 */
const resolveShellScriptLineEffect = (line: ShellScriptLine): ShellScriptLineEffect => {
  if (line.trimmedText === "set -v") {
    return {
      kind: "state-change",
      value: true,
    };
  }

  if (line.trimmedText === "set +v") {
    return {
      kind: "state-change",
      value: false,
    };
  }

  if (line.hasRunnableCommand) {
    return {
      kind: "command",
      source: line.text,
    };
  }

  return {
    kind: "none",
  };
};

/**
 * Executes a single command line through the centralized command registry.
 */
export const executeShellLine = async (
  source: string,
  context: ShellRuntimeContext
) => {
  const { normalizedInput, tokens } = parseShellInput(source);

  if (tokens.length === 0 || shouldStop(context)) {
    return {
      emittedOutput: false,
    } satisfies ShellLineExecutionResult;
  }

  const [command, ...arg] = tokens;
  // Command lookup is centralized through the registry assembled from individual files.
  const definition = getCommandDefinition(command);
  let emittedOutput = false;
  const runtimeContext: ShellRuntimeContext = {
    ...context,
    emit: async chunk => {
      emittedOutput = true;
      await context.emit(chunk);
    },
  };

  if (!definition) {
    await runtimeContext.emit({
      kind: "line",
      text: `${command}: command not found`,
      tone: "error",
    });

    return {
      emittedOutput: true,
    } satisfies ShellLineExecutionResult;
  }

  if (!definition.execute) {
    return {
      emittedOutput: false,
    } satisfies ShellLineExecutionResult;
  }

  // Runtime context is narrowed into the command contract used by all commands.
  const commandContext: CommandExecutionContext = {
    arg,
    clearHistory: runtimeContext.clearHistory,
    cwd: runtimeContext.getCwd(),
    delayMs: milliseconds => waitForShellDelay(milliseconds, runtimeContext),
    emit: runtimeContext.emit,
    getActivePluginStates: runtimeContext.getActivePluginStates,
    getActivePreviewPath: runtimeContext.getActivePreviewPath,
    getBackgroundBlur: runtimeContext.getBackgroundBlur,
    getBackgroundOverlayOpacity: runtimeContext.getBackgroundOverlayOpacity,
    getBackgroundPath: runtimeContext.getBackgroundPath,
    getShellPreferences: runtimeContext.getShellPreferences,
    getTypingPreferences: runtimeContext.getTypingPreferences,
    layoutMode: runtimeContext.layoutMode,
    normalizedInput,
    openPreview: runtimeContext.openPreview,
    runProgram: runtimeContext.runProgram,
    runScript: async (scriptSource, options) => {
      if (options?.idlePathname) {
        runtimeContext.setIdlePathname?.(options.idlePathname);
      }

      await executeShellScript(scriptSource, runtimeContext);
    },
    setActivePluginStates: runtimeContext.setActivePluginStates,
    setBackgroundBlur: runtimeContext.setBackgroundBlur,
    setBackgroundOverlayOpacity: runtimeContext.setBackgroundOverlayOpacity,
    setBackgroundPath: runtimeContext.setBackgroundPath,
    setCwd: runtimeContext.setCwd,
    setIdlePathname: runtimeContext.setIdlePathname,
    setLayoutMode: runtimeContext.setLayoutMode,
    setShellPreferences: runtimeContext.setShellPreferences,
    setTypingPreferences: runtimeContext.setTypingPreferences,
    shouldStop: runtimeContext.shouldStop,
    switchTheme: runtimeContext.switchTheme,
  };

  await definition.execute(commandContext);

  return {
    emittedOutput,
  } satisfies ShellLineExecutionResult;
};

/**
 * Executes a shell script line by line, preserving verbose script semantics.
 */
export const executeShellScript = async (
  scriptSource: string,
  context: ShellRuntimeContext
) => {
  const lines = scriptSource.replace(/\r\n/g, "\n").split("\n");
  const state: ShellScriptState = {
    verbose:
      context.getShellPreferences?.().verbose ??
      defaultShellSessionPreferences.verbose,
  };

  for (const lineText of lines) {
    const line = classifyShellScriptLine(lineText);
    const effect = resolveShellScriptLineEffect(line);
    const shouldEmitSource = state.verbose || line.trimmedText === "set -v";
    const commandDelayMs = context.getTypingPreferences?.()?.commandDelayMs ?? 0;

    if (shouldStop(context)) {
      break;
    }

    // Verbose mode emits script source before execution to mimic a shell trace.
    if (shouldEmitSource) {
      await context.emit({
        kind: "source",
        sourceKind: line.sourceKind,
        text: line.text,
        tone: "muted",
      });
    }

    if (shouldEmitSource || line.hasRunnableCommand) {
      const shouldContinue = await waitForShellDelay(commandDelayMs, context);

      if (!shouldContinue) {
        break;
      }
    }

    if (effect.kind === "state-change") {
      state.verbose = effect.value;
      context.setShellPreferences?.({
        ...(context.getShellPreferences?.() ?? defaultShellSessionPreferences),
        verbose: effect.value,
      });
      continue;
    }

    if (effect.kind === "none") {
      continue;
    }

    const result = await executeShellLine(effect.source, context);

    if (shouldStop(context)) {
      break;
    }

    if (result.emittedOutput) {
      const shouldContinue = await waitForShellDelay(commandDelayMs, context);

      if (!shouldContinue) {
        break;
      }
    }
  }
};
