import { createContext } from "react";
import type { ShellRuntimeChunk } from "../utils/shellRuntime";
import {
  defaultTypingPreferences,
  type TypingPreferences,
} from "../utils/typingPreferences";
import { shellRootPath } from "../shell/filesystem";

/**
 * Runtime chunks stored in history also capture the typing preferences that
 * were active when the chunk was emitted.
 */
export type HistoryRuntimeChunk = ShellRuntimeChunk & {
  id: string;
  typingPreferencesSnapshot: TypingPreferences;
};

/**
 * Runtime commands append typed output incrementally while they are running.
 */
export type HistoryRuntimeState = {
  chunks: HistoryRuntimeChunk[];
  running: boolean;
};

/**
 * Every submitted command becomes a history entry in the terminal session.
 */
export type HistoryEntrySource = "system" | "user";

export type HistoryEntry = {
  cwd: string;
  id: number;
  input: string;
  ready: boolean;
  resultCwd: string;
  runtimeState?: HistoryRuntimeState;
  source: HistoryEntrySource;
  terminationMessage?: string;
  typingPreferencesSnapshot: TypingPreferences;
};

/**
 * Child output renderers consume a narrow view of the active history item.
 */
export type TermContextValue = {
  arg: string[];
  entries: HistoryEntry[];
  entry: HistoryEntry;
  index: number;
  submissionId: number;
  clearHistory?: () => void;
  completeRuntimeChunk?: (chunkId: string) => void;
};

export const defaultHistoryEntry: HistoryEntry = {
  cwd: shellRootPath,
  id: 0,
  input: "welcome",
  ready: true,
  resultCwd: shellRootPath,
  source: "system",
  typingPreferencesSnapshot: defaultTypingPreferences,
};

export const termContext = createContext<TermContextValue>({
  arg: [],
  entries: [],
  entry: defaultHistoryEntry,
  index: 0,
  submissionId: 0,
});
