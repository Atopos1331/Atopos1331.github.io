import type { TypingPreferences } from "../utils/typingPreferences";
import type {
  HistoryEntry,
  HistoryRuntimeChunk,
} from "./terminalContext";

export const createHistoryEntry = (
  entryId: number,
  cwd: string,
  input: string,
  typingPreferencesSnapshot: TypingPreferences,
  initialVerboseSourceChunk: {
    historyChunk: HistoryRuntimeChunk;
  } | null
): HistoryEntry => ({
  cwd,
  id: entryId,
  input,
  ready: false,
  resultCwd: cwd,
  runtimeState: initialVerboseSourceChunk
    ? {
        chunks: [initialVerboseSourceChunk.historyChunk],
        running: true,
      }
    : undefined,
  source: "user",
  typingPreferencesSnapshot,
});

export const getUserInputHistory = (entries: readonly HistoryEntry[]) =>
  entries
    .filter(entry => entry.source === "user" && entry.input.trim().length > 0)
    .map(entry => entry.input);

export const updateHistoryEntries = (
  entries: readonly HistoryEntry[],
  entryId: number,
  updater: (entry: HistoryEntry) => HistoryEntry
) => entries.map(entry => (entry.id === entryId ? updater(entry) : entry));
