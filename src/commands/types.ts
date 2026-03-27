import type { DefaultTheme } from "styled-components";
import type { LayoutMode, WorkspaceBackgroundBlur } from "../types/workspace";
import type { ShellRuntimeChunk } from "../utils/shellRuntime";
import type { ActiveWorkspacePluginState } from "../utils/workspacePluginManifest";
import type { ShellSessionPreferences } from "../utils/shellSession";
import type { TypingPreferences } from "../utils/typingPreferences";
import type { WorkspaceBackgroundPath } from "../types/workspace";
import type { ProgramSessionDescriptor } from "../program/programTypes";

/**
 * Shared command categories used by help output and command organization.
 */
export type CommandGroup =
  | "Shell"
  | "Files"
  | "Workspace"
  | "Pages"
  | "Links";

export type CommandPathArgument = {
  directoriesOnly?: boolean;
  fileExtensions?: readonly string[];
  index: number;
};

/**
 * Context available to command-level autocomplete providers.
 */
export type CommandAutocompleteContext = {
  activeArgIndex: number;
  activeToken: string;
  command: string;
  cwd: string;
  input: string;
  tokens: string[];
};

export type CommandExecutionContext = {
  arg: string[];
  clearHistory?: () => void;
  cwd: string;
  delayMs: (milliseconds: number) => Promise<boolean>;
  emit: (chunk: ShellRuntimeChunk) => Promise<void>;
  getActivePluginStates?: () => ActiveWorkspacePluginState[];
  getActivePreviewPath?: () => string;
  getBackgroundBlur?: () => WorkspaceBackgroundBlur;
  getBackgroundOverlayOpacity?: () => number;
  getBackgroundPath?: () => WorkspaceBackgroundPath;
  getShellPreferences?: () => ShellSessionPreferences;
  getTypingPreferences?: () => TypingPreferences;
  layoutMode?: LayoutMode;
  normalizedInput: string;
  openPreview?: (path: string) => void;
  runProgram?: (descriptor: ProgramSessionDescriptor) => Promise<number>;
  runScript: (scriptSource: string, options?: { idlePathname?: string }) => Promise<void>;
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
  switchTheme?: (nextTheme: DefaultTheme) => void;
};

/**
 * Render-only commands receive a narrow context because their content is static.
 */
export type CommandRenderContext = {
  layoutMode?: LayoutMode;
};

/**
 * Command definitions combine metadata, autocomplete, execution, and optional
 * render output in a single colocated shape.
 */
export type CommandDefinition = {
  argumentSuggestions?: Readonly<Record<number, readonly string[]>>;
  autocomplete?: (context: CommandAutocompleteContext) => string[];
  cmd: string;
  desc: string;
  execute?: (context: CommandExecutionContext) => Promise<void> | void;
  group: CommandGroup;
  helpLines?: readonly string[];
  locksForTyping?: boolean;
  pathArguments?: readonly CommandPathArgument[];
  render?: React.FC<CommandRenderContext>;
  tab: number;
};
