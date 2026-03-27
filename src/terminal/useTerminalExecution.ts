import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { ProgramSessionDescriptor } from "../program/programTypes";
import { shellRootPath } from "../shell/filesystem";
import { TerminalCommandManager } from "../utils/terminalCommandManager";
import type { ShellRuntimeChunk } from "../utils/shellRuntime";
import {
  defaultShellSessionPreferences,
  type ShellSessionPreferences,
} from "../utils/shellSession";
import {
  defaultTypingPreferences,
  type TypingPreferences,
} from "../utils/typingPreferences";
import type { WorkspaceContextValue } from "../workspace/workspaceStore";
import {
  runCommandExecution,
  type ActiveExecutionState,
  type RuntimeRefs,
} from "./executionEngine";
import {
  getUserInputHistory,
  updateHistoryEntries,
} from "./historyStore";
import {
  useProgramSessionController,
  type ActiveProgramSession,
} from "./programSessionController";
import {
  applyEntryTypingState,
  markEntryTypingCancelled,
  shouldUpdateEntryTypingState,
  type EntryTypingState,
} from "./typingCoordinator";
import {
  defaultHistoryEntry,
  type HistoryEntry,
  type HistoryRuntimeChunk,
  type HistoryRuntimeState,
} from "./terminalContext";

type UseTerminalExecutionArgs = {
  clearInputUi: () => void;
  switchTheme?: ((theme: import("styled-components").DefaultTheme) => void) | null;
  workspace: WorkspaceContextValue | null;
};

/**
 * Tracks terminal history, execution queues, and shell session preferences.
 */
export const useTerminalExecution = ({
  clearInputUi,
  switchTheme,
  workspace,
}: UseTerminalExecutionArgs) => {
  const [entries, setEntries] = useState<HistoryEntry[]>([defaultHistoryEntry]);
  const [isBusy, setIsBusy] = useState(false);
  const [submissionId, setSubmissionId] = useState(0);
  const [typingPreferences, setTypingPreferences] = useState<TypingPreferences>(
    defaultTypingPreferences
  );
  const [shellPreferences, setShellPreferences] = useState<ShellSessionPreferences>(
    defaultShellSessionPreferences
  );
  const [pendingTypingEntryId, setPendingTypingEntryId] = useState<number | null>(
    null
  );
  const [entryTypingState, setEntryTypingState] = useState<
    Record<number, EntryTypingState>
  >({});
  const [activeProgramSessionEntryId, setActiveProgramSessionEntryId] =
    useState<number | null>(null);
  const [programSessionDescriptor, setProgramSessionDescriptor] =
    useState<ProgramSessionDescriptor | null>(null);
  const [scrollSignal, setScrollSignal] = useState(0);

  const busyCommandCountRef = useRef(0);
  const entryIdRef = useRef(1);
  const runtimeChunkIdRef = useRef(0);
  const currentCwdRef = useRef<string>(shellRootPath);
  const currentActivePluginStatesRef = useRef(
    workspace?.activePluginStates ?? []
  );
  const currentTypingPreferencesRef = useRef(defaultTypingPreferences);
  const currentShellPreferencesRef = useRef(defaultShellSessionPreferences);
  const pendingTypingEntryIdRef = useRef<number | null>(null);
  const entryTypingStateRef = useRef<Record<number, EntryTypingState>>({});
  const commandManagerRef = useRef<TerminalCommandManager>();
  const activeExecutionRef = useRef<ActiveExecutionState | null>(null);
  const activeProgramSessionRef = useRef<ActiveProgramSession | null>(null);

  const inputHistory = useMemo(() => getUserInputHistory(entries), [entries]);
  const latestEntryId = entries.at(-1)?.id ?? null;
  const isLatestEntryTyping =
    latestEntryId !== null &&
    (pendingTypingEntryId === latestEntryId ||
      entryTypingState[latestEntryId]?.active === true);
  const isProgramSessionActive = programSessionDescriptor !== null;
  const isInputLocked = (isBusy && !isProgramSessionActive) || isLatestEntryTyping;

  const updateEntry = useCallback(
    (entryId: number, updater: (entry: HistoryEntry) => HistoryEntry) => {
      setEntries(previousState =>
        updateHistoryEntries(previousState, entryId, updater)
      );
    },
    []
  );

  const setPendingTypingEntryIdTracked = useCallback<
    Dispatch<SetStateAction<number | null>>
  >(value => {
    setPendingTypingEntryId(previousState => {
      const nextState =
        typeof value === "function"
          ? (value as (state: number | null) => number | null)(previousState)
          : value;
      pendingTypingEntryIdRef.current = nextState;
      return nextState;
    });
  }, []);

  const runtimeRefs = useMemo<RuntimeRefs>(
    () => ({
      currentActivePluginStatesRef,
      currentCwdRef,
      currentShellPreferencesRef,
      currentTypingPreferencesRef,
    }),
    []
  );

  if (!commandManagerRef.current) {
    commandManagerRef.current = new TerminalCommandManager(
      () => `runtime-chunk-${runtimeChunkIdRef.current++}`,
      (entryId, chunk) => {
        updateEntry(entryId, entry => ({
          ...entry,
          runtimeState: {
            chunks: [...(entry.runtimeState?.chunks ?? []), chunk],
            running: entry.runtimeState?.running ?? true,
          },
        }));
      },
      entryId =>
        pendingTypingEntryIdRef.current === entryId ||
        entryTypingStateRef.current[entryId]?.active === true
    );
  }

  const requireCommandManager = useCallback(() => {
    const commandManager = commandManagerRef.current;

    if (!commandManager) {
      throw new Error("Terminal command manager unavailable.");
    }

    return commandManager;
  }, []);

  useEffect(() => {
    currentCwdRef.current = workspace?.cwd ?? shellRootPath;
  }, [workspace?.cwd]);

  useEffect(() => {
    currentActivePluginStatesRef.current = workspace?.activePluginStates ?? [];
  }, [workspace?.activePluginStates]);

  useEffect(() => {
    currentTypingPreferencesRef.current = typingPreferences;
  }, [typingPreferences]);

  useEffect(() => {
    currentShellPreferencesRef.current = shellPreferences;
  }, [shellPreferences]);

  useEffect(() => {
    entryTypingStateRef.current = entryTypingState;
  }, [entryTypingState]);

  const handleEntryTypingStateChange = useCallback(
    (entryId: number, nextState: EntryTypingState) => {
      setPendingTypingEntryIdTracked(currentState =>
        currentState === entryId ? null : currentState
      );

      setEntryTypingState(previousState => {
        const currentState = previousState[entryId];

        if (!shouldUpdateEntryTypingState(currentState, nextState)) {
          return previousState;
        }

        const nextEntryTypingState = applyEntryTypingState(
          previousState,
          entryId,
          nextState
        );
        entryTypingStateRef.current = nextEntryTypingState;
        return nextEntryTypingState;
      });

      setScrollSignal(previousState => previousState + 1);
      commandManagerRef.current?.notifyEntryTypingState(entryId);
    },
    [setPendingTypingEntryIdTracked]
  );

  const setRuntimeState = useCallback(
    (entryId: number, runtimeState: HistoryRuntimeState) => {
      updateEntry(entryId, entry => ({
        ...entry,
        runtimeState,
      }));
    },
    [updateEntry]
  );

  const createTrackedRuntimeChunk = useCallback(
    (
      chunk: ShellRuntimeChunk,
      typingPreferencesSnapshot: TypingPreferences
    ): {
      completion: Promise<void>;
      historyChunk: HistoryRuntimeChunk;
    } => {
      const chunkId = `runtime-chunk-${runtimeChunkIdRef.current++}`;

      return {
        completion:
          commandManagerRef.current?.trackRuntimeChunk(
            chunkId,
            chunk,
            typingPreferencesSnapshot
          ) ?? Promise.resolve(),
        historyChunk: {
          ...chunk,
          id: chunkId,
          typingPreferencesSnapshot,
        },
      };
    },
    []
  );

  const clearHistory = useCallback(() => {
    if (isInputLocked) {
      return;
    }

    workspace?.clearTerminalNotice();
    setEntries([]);
    setPendingTypingEntryIdTracked(null);
    setEntryTypingState({});
    entryTypingStateRef.current = {};
    commandManagerRef.current?.clear();
    clearInputUi();
  }, [clearInputUi, isInputLocked, setPendingTypingEntryIdTracked, workspace]);

  const completeRuntimeChunk = useCallback((chunkId: string) => {
    commandManagerRef.current?.completeRuntimeChunk(chunkId);
  }, []);

  const emitProgramRuntimeChunk = useCallback(
    async (entryId: number, chunk: ShellRuntimeChunk) => {
      await commandManagerRef.current?.emitRuntimeChunk(entryId, chunk, {
        ...currentTypingPreferencesRef.current,
        enabled: false,
      });
      setScrollSignal(previousState => previousState + 1);
    },
    []
  );

  const clearEntryRuntimeOutput = useCallback(
    (entryId: number) => {
      updateEntry(entryId, entry => ({
        ...entry,
        runtimeState: entry.runtimeState
          ? {
              ...entry.runtimeState,
              chunks: [],
            }
          : entry.runtimeState,
      }));
      setScrollSignal(previousState => previousState + 1);
    },
    [updateEntry]
  );

  const { runProgramSession, submitProgramInput } = useProgramSessionController({
    activeProgramSessionRef,
    clearEntryRuntimeOutput,
    emitProgramRuntimeChunk,
    setActiveProgramSessionEntryId,
    setProgramSessionDescriptor,
    updateEntry,
  });

  const cancelCurrentExecution = useCallback(() => {
    const activeExecution = activeExecutionRef.current;
    const activeProgramSession = activeProgramSessionRef.current;

    if (!activeExecution && !isInputLocked) {
      return;
    }

    if (activeExecution) {
      activeExecution.cancelled = true;
      activeExecutionRef.current = null;
    }

    if (activeProgramSession?.handle.isActive()) {
      activeProgramSession.interrupted = true;
      activeProgramSession.handle.interrupt();
      activeProgramSessionRef.current = null;
      setActiveProgramSessionEntryId(null);
      setProgramSessionDescriptor(null);
      updateEntry(activeProgramSession.entryId, entry => ({
        ...entry,
        terminationMessage: "Terminated.",
      }));
      clearInputUi();
      return;
    }

    busyCommandCountRef.current = 0;
    commandManagerRef.current?.cancelPending();
    setIsBusy(false);
    setPendingTypingEntryIdTracked(null);
    clearInputUi();

    if (
      activeExecution?.entryId !== null &&
      activeExecution?.entryId !== undefined &&
      activeExecution.phase === "executing"
    ) {
      const cancelledEntryId = activeExecution.entryId;

      setEntryTypingState(previousState => {
        const nextState = markEntryTypingCancelled(
          previousState,
          cancelledEntryId
        );

        if (nextState === previousState) {
          return previousState;
        }

        entryTypingStateRef.current = nextState;
        return nextState;
      });

      updateEntry(cancelledEntryId, entry => ({
        ...entry,
        ready: true,
        terminationMessage: "Terminated.",
        runtimeState: entry.runtimeState
          ? {
              running: false,
              chunks: entry.runtimeState.chunks.map(chunk => ({
                ...chunk,
                typingPreferencesSnapshot: {
                  ...chunk.typingPreferencesSnapshot,
                  enabled: false,
                },
              })),
            }
          : entry.runtimeState,
        typingPreferencesSnapshot: {
          ...entry.typingPreferencesSnapshot,
          enabled: false,
        },
      }));

      commandManagerRef.current?.notifyEntryTypingState(cancelledEntryId);
    }
  }, [
    clearInputUi,
    isInputLocked,
    setPendingTypingEntryIdTracked,
    updateEntry,
  ]);

  const commitCommand = useCallback(
    async (rawInput: string, clearNotice = true) => {
      const activeExecution: ActiveExecutionState = {
        cancelled: false,
        entryId: null,
        phase: "pre-exec",
      };
      activeExecutionRef.current = activeExecution;

      try {
        await runCommandExecution({
          activeExecution,
          clearHistory,
          clearInputUi,
          clearNotice,
          commandManager: requireCommandManager(),
          createTrackedRuntimeChunk,
          currentEntryId: () => entryIdRef.current++,
          refs: runtimeRefs,
          runProgramSession,
          rawInput,
          setEntries,
          setPendingTypingEntryId: setPendingTypingEntryIdTracked,
          setRuntimeState,
          setShellPreferences,
          setSubmissionId,
          setTypingPreferences,
          shouldStop: () => activeExecution.cancelled,
          switchTheme,
          updateEntry,
          workspace,
        });
      } finally {
        activeExecution.phase = "finished";

        if (activeExecutionRef.current === activeExecution) {
          activeExecutionRef.current = null;
        }
      }
    },
    [
      clearHistory,
      clearInputUi,
      createTrackedRuntimeChunk,
      requireCommandManager,
      runProgramSession,
      runtimeRefs,
      setPendingTypingEntryIdTracked,
      setRuntimeState,
      switchTheme,
      updateEntry,
      workspace,
    ]
  );

  const enqueueCommand = useCallback(
    (command: string, clearNotice = true) => {
      if (activeProgramSessionRef.current?.handle.isActive()) {
        return;
      }

      busyCommandCountRef.current += 1;
      setIsBusy(true);
      const queuedRun = commandManagerRef.current?.enqueue(async () => {
        await commitCommand(command, clearNotice);
      });

      void queuedRun?.finally(() => {
        busyCommandCountRef.current = Math.max(0, busyCommandCountRef.current - 1);
        setIsBusy(busyCommandCountRef.current > 0);
      });
    },
    [commitCommand]
  );

  return {
    activeProgramSessionEntryId,
    cancelCurrentExecution,
    clearHistory,
    completeRuntimeChunk,
    enqueueCommand,
    entries,
    handleEntryTypingStateChange,
    inputHistory,
    isBusy,
    isInputLocked,
    isLatestEntryTyping,
    isProgramSessionActive,
    programSessionDescriptor,
    scrollSignal,
    submitProgramInput,
    submissionId,
  };
};
