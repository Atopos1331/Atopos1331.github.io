import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import {
  startProgramSession,
  type ProgramSessionHandle,
} from "../program/programSession";
import type { ProgramSessionDescriptor } from "../program/programTypes";
import type { ShellRuntimeChunk } from "../utils/shellRuntime";
import type { HistoryEntry } from "./terminalContext";

type ActiveProgramSession = {
  descriptor: ProgramSessionDescriptor;
  entryId: number;
  handle: ProgramSessionHandle;
  interrupted: boolean;
};

type ProgramSessionControllerArgs = {
  activeProgramSessionRef: MutableRefObject<ActiveProgramSession | null>;
  clearEntryRuntimeOutput: (entryId: number) => void;
  emitProgramRuntimeChunk: (entryId: number, chunk: ShellRuntimeChunk) => Promise<void>;
  setActiveProgramSessionEntryId: Dispatch<SetStateAction<number | null>>;
  setProgramSessionDescriptor: Dispatch<SetStateAction<ProgramSessionDescriptor | null>>;
  updateEntry: (entryId: number, updater: (entry: HistoryEntry) => HistoryEntry) => void;
};

export const useProgramSessionController = ({
  activeProgramSessionRef,
  clearEntryRuntimeOutput,
  emitProgramRuntimeChunk,
  setActiveProgramSessionEntryId,
  setProgramSessionDescriptor,
  updateEntry,
}: ProgramSessionControllerArgs) => {
  const runProgramSession = useCallback(
    async (entryId: number, descriptor: ProgramSessionDescriptor) => {
      const activeExistingSession = activeProgramSessionRef.current;

      if (activeExistingSession?.handle.isActive()) {
        return 1;
      }

      const sessionHandle = startProgramSession(descriptor, {
        onClear: () => {
          clearEntryRuntimeOutput(entryId);
        },
        onError: async message => {
          await emitProgramRuntimeChunk(entryId, {
            kind: "line",
            text: message,
            tone: "error",
          });
        },
        onExit: async code => {
          setActiveProgramSessionEntryId(currentEntryId =>
            currentEntryId === entryId ? null : currentEntryId
          );
          setProgramSessionDescriptor(currentDescriptor =>
            currentDescriptor?.path === descriptor.path ? null : currentDescriptor
          );

          const activeProgramSession = activeProgramSessionRef.current;

          if (
            activeProgramSession?.entryId === entryId &&
            activeProgramSession.descriptor.path === descriptor.path
          ) {
            activeProgramSessionRef.current = null;
          }

          if (code === 130) {
            updateEntry(entryId, entry => ({
              ...entry,
              terminationMessage: "Terminated.",
            }));
          }
        },
        onStderr: async text => {
          await emitProgramRuntimeChunk(entryId, {
            kind: "line",
            text,
            tone: "error",
          });
        },
        onStdout: async text => {
          await emitProgramRuntimeChunk(entryId, {
            kind: "line",
            text,
          });
        },
      });

      activeProgramSessionRef.current = {
        descriptor,
        entryId,
        handle: sessionHandle,
        interrupted: false,
      };
      setActiveProgramSessionEntryId(entryId);
      setProgramSessionDescriptor(descriptor);

      return sessionHandle.completion;
    },
    [
      activeProgramSessionRef,
      clearEntryRuntimeOutput,
      emitProgramRuntimeChunk,
      setActiveProgramSessionEntryId,
      setProgramSessionDescriptor,
      updateEntry,
    ]
  );

  const submitProgramInput = useCallback(
    async (value: string) => {
      const activeProgramSession = activeProgramSessionRef.current;

      if (!activeProgramSession?.handle.isActive()) {
        return false;
      }

      activeProgramSession.handle.writeLine(value);
      await emitProgramRuntimeChunk(activeProgramSession.entryId, {
        kind: "line",
        text: `> ${value}`,
        tone: "muted",
      });
      return true;
    },
    [activeProgramSessionRef, emitProgramRuntimeChunk]
  );

  return {
    runProgramSession,
    submitProgramInput,
  };
};

export type { ActiveProgramSession };
