import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { getCommandDefinition } from "../commands/specs";
import type { ProgramSessionDescriptor } from "../program/programTypes";
import {
  executeShellLine,
  parseShellInput,
  type ShellRuntimeChunk,
} from "../utils/shellRuntime";
import type {
  ShellSessionPreferences,
} from "../utils/shellSession";
import type { TerminalCommandManager } from "../utils/terminalCommandManager";
import type { TypingPreferences } from "../utils/typingPreferences";
import { emitWorkspaceCommandPulse } from "../utils/workspaceEvents";
import type { WorkspaceContextValue } from "../workspace/workspaceStore";
import { createHistoryEntry } from "./historyStore";
import type { HistoryEntry, HistoryRuntimeChunk, HistoryRuntimeState } from "./terminalContext";

export type ActiveExecutionState = {
  cancelled: boolean;
  entryId: number | null;
  phase: "pre-exec" | "executing" | "finished";
};

export type RuntimeRefs = {
  currentActivePluginStatesRef: MutableRefObject<WorkspaceContextValue["activePluginStates"]>;
  currentCwdRef: MutableRefObject<string>;
  currentShellPreferencesRef: MutableRefObject<ShellSessionPreferences>;
  currentTypingPreferencesRef: MutableRefObject<TypingPreferences>;
};

export const createShellExecutionContext = ({
  nextEntryId,
  refs,
  shouldStop,
  switchTheme,
  updateEntry,
  workspace,
  clearHistory,
  commandManager,
  setShellPreferences,
  setTypingPreferences,
  runProgram,
}: {
  clearHistory: () => void;
  commandManager: TerminalCommandManager;
  nextEntryId: number;
  refs: RuntimeRefs;
  setShellPreferences: Dispatch<SetStateAction<ShellSessionPreferences>>;
  setTypingPreferences: Dispatch<SetStateAction<TypingPreferences>>;
  runProgram: (descriptor: ProgramSessionDescriptor) => Promise<number>;
  shouldStop: () => boolean;
  switchTheme?: ((theme: import("styled-components").DefaultTheme) => void) | null;
  updateEntry: (entryId: number, updater: (entry: HistoryEntry) => HistoryEntry) => void;
  workspace: WorkspaceContextValue | null;
}) => ({
  clearHistory,
  emit: (chunk: ShellRuntimeChunk) =>
    commandManager.emitRuntimeChunk(
      nextEntryId,
      chunk,
      refs.currentTypingPreferencesRef.current
    ),
  getActivePluginStates: () => refs.currentActivePluginStatesRef.current,
  getActivePreviewPath: () => workspace?.activePreviewPath ?? "",
  getBackgroundBlur: () => workspace?.backgroundBlur ?? 0,
  getBackgroundOverlayOpacity: () => workspace?.backgroundOverlayOpacity ?? 65,
  getBackgroundPath: () => workspace?.backgroundPath ?? "",
  getCwd: () => refs.currentCwdRef.current,
  getShellPreferences: () => refs.currentShellPreferencesRef.current,
  getTypingPreferences: () => refs.currentTypingPreferencesRef.current,
  layoutMode: workspace?.layoutMode,
  openPreview: workspace?.openPreview,
  runProgram,
  setActivePluginStates: (states: WorkspaceContextValue["activePluginStates"]) => {
    refs.currentActivePluginStatesRef.current = states;
    workspace?.setActivePluginStates(states);
  },
  setBackgroundBlur: workspace?.setBackgroundBlur,
  setBackgroundOverlayOpacity: workspace?.setBackgroundOverlayOpacity,
  setBackgroundPath: workspace?.setBackgroundPath,
  setCwd: (nextCwd: string) => {
    refs.currentCwdRef.current = nextCwd;
    workspace?.setCurrentDirectory(nextCwd);
    updateEntry(nextEntryId, entry => ({
      ...entry,
      resultCwd: nextCwd,
    }));
  },
  setIdlePathname: workspace?.setIdlePathname,
  setLayoutMode: workspace?.setLayoutMode,
  setShellPreferences: (preferences: ShellSessionPreferences) => {
    refs.currentShellPreferencesRef.current = preferences;
    setShellPreferences(preferences);
  },
  setTypingPreferences: (preferences: TypingPreferences) => {
    refs.currentTypingPreferencesRef.current = preferences;
    setTypingPreferences(preferences);
    updateEntry(nextEntryId, entry => ({
      ...entry,
      typingPreferencesSnapshot: preferences,
    }));
  },
  shouldStop,
  switchTheme: switchTheme ?? undefined,
});

export const waitForInterruptibleDelay = async (
  milliseconds: number,
  shouldStop?: () => boolean
) => {
  if (milliseconds <= 0) {
    return !(shouldStop?.() === true);
  }

  let remaining = milliseconds;

  while (remaining > 0) {
    if (shouldStop?.() === true) {
      return false;
    }

    const step = Math.min(remaining, 50);

    await new Promise(resolve => {
      window.setTimeout(resolve, step);
    });

    remaining -= step;
  }

  return !(shouldStop?.() === true);
};

type RunCommandExecutionArgs = {
  activeExecution: ActiveExecutionState;
  clearHistory: () => void;
  clearInputUi: () => void;
  clearNotice: boolean;
  commandManager: TerminalCommandManager;
  createTrackedRuntimeChunk: (
    chunk: ShellRuntimeChunk,
    typingPreferencesSnapshot: TypingPreferences
  ) => {
    completion: Promise<void>;
    historyChunk: HistoryRuntimeChunk;
  } | null;
  currentEntryId: () => number;
  refs: RuntimeRefs;
  runProgramSession: (entryId: number, descriptor: ProgramSessionDescriptor) => Promise<number>;
  rawInput: string;
  setEntries: Dispatch<SetStateAction<HistoryEntry[]>>;
  setPendingTypingEntryId: Dispatch<SetStateAction<number | null>>;
  setRuntimeState: (entryId: number, runtimeState: HistoryRuntimeState) => void;
  setShellPreferences: Dispatch<SetStateAction<ShellSessionPreferences>>;
  setSubmissionId: Dispatch<SetStateAction<number>>;
  setTypingPreferences: Dispatch<SetStateAction<TypingPreferences>>;
  shouldStop: () => boolean;
  switchTheme?: ((theme: import("styled-components").DefaultTheme) => void) | null;
  updateEntry: (entryId: number, updater: (entry: HistoryEntry) => HistoryEntry) => void;
  workspace: WorkspaceContextValue | null;
};

export const runCommandExecution = async ({
  activeExecution,
  clearHistory,
  clearInputUi,
  clearNotice,
  commandManager,
  createTrackedRuntimeChunk,
  currentEntryId,
  refs,
  runProgramSession,
  rawInput,
  setEntries,
  setPendingTypingEntryId,
  setRuntimeState,
  setShellPreferences,
  setSubmissionId,
  setTypingPreferences,
  shouldStop,
  switchTheme,
  updateEntry,
  workspace,
}: RunCommandExecutionArgs) => {
  const input = rawInput.trim();
  const { command, normalizedInput } = parseShellInput(input);
  const isNoOpCommand = normalizedInput === "";
  const cwd = refs.currentCwdRef.current;
  const definition = getCommandDefinition(command);
  const shouldEmitVerboseSource =
    !isNoOpCommand &&
    (refs.currentShellPreferencesRef.current.verbose || normalizedInput === "set -v");
  const typingPreferencesSnapshot = refs.currentTypingPreferencesRef.current;
  const initialVerboseSourceChunk =
    shouldEmitVerboseSource && createTrackedRuntimeChunk
      ? createTrackedRuntimeChunk(
          {
            kind: "source",
            sourceKind: "command",
            text: normalizedInput,
            tone: "muted",
          },
          typingPreferencesSnapshot
        )
      : null;

  if (clearNotice) {
    workspace?.clearTerminalNotice();
  }

  const nextEntryId = currentEntryId();
  const nextEntry = createHistoryEntry(
    nextEntryId,
    cwd,
    input,
    typingPreferencesSnapshot,
    initialVerboseSourceChunk
  );
  const shouldLockForTyping =
    typingPreferencesSnapshot.enabled &&
    definition?.render &&
    definition.locksForTyping !== false;

  setEntries(prevState => [...prevState, nextEntry]);
  activeExecution.entryId = nextEntry.id;

  if (shouldLockForTyping) {
    setPendingTypingEntryId(nextEntry.id);
  }

  if (shouldStop()) {
    return;
  }

  if (!isNoOpCommand) {
    if (shouldEmitVerboseSource) {
      await initialVerboseSourceChunk?.completion;
    }

    const shouldContinue = await waitForInterruptibleDelay(
      typingPreferencesSnapshot.commandDelayMs,
      shouldStop
    );

    if (!shouldContinue) {
      return;
    }
  }

  if (!isNoOpCommand) {
    emitWorkspaceCommandPulse(normalizedInput);
  }

  clearInputUi();
  setSubmissionId(prevState => prevState + 1);
  activeExecution.phase = "executing";
  setRuntimeState(nextEntry.id, {
    chunks: nextEntry.runtimeState?.chunks ?? [],
    running: true,
  });

  const result = await executeShellLine(
    normalizedInput,
    createShellExecutionContext({
      clearHistory,
      commandManager,
      nextEntryId: nextEntry.id,
      refs,
      runProgram: descriptor => runProgramSession(nextEntry.id, descriptor),
      setShellPreferences,
      setTypingPreferences,
      shouldStop,
      switchTheme,
      updateEntry,
      workspace,
    })
  );

  updateEntry(nextEntry.id, entry => ({
    ...entry,
    ready: true,
    runtimeState: {
      chunks: entry.runtimeState?.chunks ?? [],
      running: false,
    },
  }));

  if (result.emittedOutput) {
    const shouldContinue = await waitForInterruptibleDelay(
      refs.currentTypingPreferencesRef.current.commandDelayMs,
      shouldStop
    );

    if (!shouldContinue) {
      return;
    }
  }

  await commandManager.waitForEntryIdle(nextEntry.id);
};
