import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import _ from "lodash";
import { themeContext } from "../theme/themeContext";
import { workspaceContext } from "../workspace/workspaceStore";
import { shellRootPath } from "../shell/filesystem";
import { terminalRunEventName } from "../utils/terminalEvents";
import { getPromptText } from "../components/TermInfo";
import { argTab } from "../utils/funcs";
import { useTerminalExecution } from "./useTerminalExecution";
import { useTerminalInput } from "./useTerminalInput";
import { useTerminalViewport } from "./useTerminalViewport";

/**
 * Composes the terminal input, execution, and viewport subsystems.
 */
export const useTerminalController = () => {
  const workspace = useContext(workspaceContext);
  const switchTheme = useContext(themeContext);
  const selectionOffsetRef = useRef(0);
  const currentPromptText = useMemo(
    () => getPromptText(workspace?.cwd ?? shellRootPath),
    [workspace?.cwd]
  );
  const setSelectionOffset = useCallback((offset: number) => {
    selectionOffsetRef.current = offset;
  }, []);

  const input = useTerminalInput({
    currentPromptText,
    setSelectionOffset,
  });

  const execution = useTerminalExecution({
    clearInputUi: input.clearInputUi,
    switchTheme,
    workspace,
  });

  const liveViewport = useTerminalViewport({
    entriesLength: execution.entries.length,
    hintsLength: input.hints.length,
    inputVal: input.inputVal,
    isInputLocked: execution.isInputLocked,
    isProgramSessionActive: execution.isProgramSessionActive,
    isLatestEntryTyping: execution.isLatestEntryTyping,
    pointer: input.pointer,
    selectionPrefixLength: execution.isProgramSessionActive ? 0 : currentPromptText.length,
    selectionOffsetRef,
    scrollSignal: execution.scrollSignal,
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (execution.isProgramSessionActive) {
        void execution.submitProgramInput(input.inputVal);
        input.clearInputUi();
        return;
      }

      execution.enqueueCommand(input.inputVal);
    },
    [execution, input]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const ctrlC = e.ctrlKey && e.key.toLowerCase() === "c";
      const ctrlI = e.ctrlKey && e.key.toLowerCase() === "i";
      const ctrlL = e.ctrlKey && e.key.toLowerCase() === "l";
      const selectionStart = e.currentTarget.selectionStart ?? currentPromptText.length;
      const selectionEnd = e.currentTarget.selectionEnd ?? currentPromptText.length;

      if (ctrlC && (execution.isInputLocked || execution.isProgramSessionActive)) {
        e.preventDefault();
        execution.cancelCurrentExecution();
        return;
      }

      if (execution.isProgramSessionActive) {
        if (e.key === "Enter") {
          e.preventDefault();
          void execution.submitProgramInput(input.inputVal);
          input.clearInputUi();
        }

        return;
      }

      if (execution.isBusy && !execution.isProgramSessionActive) {
        e.preventDefault();
        return;
      }

      if (
        (e.key === "Backspace" && selectionStart <= currentPromptText.length) ||
        (e.key === "ArrowLeft" && selectionStart <= currentPromptText.length) ||
        (e.key === "Home" && !e.shiftKey) ||
        ((e.key === "Delete" || e.key === "Cut") &&
          selectionEnd <= currentPromptText.length)
      ) {
        e.preventDefault();
        e.currentTarget.setSelectionRange(
          currentPromptText.length,
          currentPromptText.length
        );
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        execution.enqueueCommand(input.inputVal);
        return;
      }

      if (e.key === "Tab" || ctrlI) {
        e.preventDefault();
        if (!input.inputVal) {
          return;
        }

        const returnedHints = argTab(
          input.inputVal,
          workspace?.cwd ?? shellRootPath,
          input.setInputVal,
          setSelectionOffset
        );

        if ((returnedHints?.length ?? 0) > 1) {
          input.setHints(_.uniq(returnedHints ?? []));
        } else if ((returnedHints?.length ?? 0) === 1) {
          const nextValue = returnedHints?.[0] ?? "";
          input.setInputVal(nextValue);
          setSelectionOffset(nextValue.length);
          input.setHints([]);
        }
      }

      if (ctrlL) {
        execution.clearHistory();
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();

        if (
          execution.inputHistory.length === 0 ||
          input.pointer + 1 >= execution.inputHistory.length
        ) {
          return;
        }

        const nextPointer = input.pointer + 1;
        const nextValue =
          execution.inputHistory[execution.inputHistory.length - 1 - nextPointer];
        input.setInputVal(nextValue);
        setSelectionOffset(nextValue.length);
        input.setPointer(nextPointer);
        liveViewport.moveCursorTo(currentPromptText.length + nextValue.length);
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();

        if (input.pointer < 0) {
          return;
        }

        if (input.pointer === 0) {
          input.setInputVal("");
          setSelectionOffset(0);
          input.setPointer(-1);
          liveViewport.moveCursorTo(currentPromptText.length);
          return;
        }

        const nextPointer = input.pointer - 1;
        const nextValue =
          execution.inputHistory[execution.inputHistory.length - 1 - nextPointer];
        input.setInputVal(nextValue);
        setSelectionOffset(nextValue.length);
        input.setPointer(nextPointer);
        liveViewport.moveCursorTo(currentPromptText.length + nextValue.length);
      }
    },
    [currentPromptText.length, execution, input, liveViewport, setSelectionOffset, workspace?.cwd]
  );

  useEffect(() => {
    const handleRunCommand = (event: Event) => {
      const customEvent = event as CustomEvent<{ commands?: string[] }>;
      const commands = customEvent.detail?.commands
        ?.map(command => command.trim())
        .filter(Boolean);

      if (!commands || commands.length === 0) {
        return;
      }

      commands.forEach(command => {
        execution.enqueueCommand(command, false);
      });
    };

    window.addEventListener(terminalRunEventName, handleRunCommand as EventListener);

    return () => {
      window.removeEventListener(
        terminalRunEventName,
        handleRunCommand as EventListener
      );
    };
  }, [execution]);

  useEffect(() => {
    const handleWindowKeyDown = (event: KeyboardEvent) => {
      if (
        event.ctrlKey &&
        event.key.toLowerCase() === "c" &&
        (execution.isBusy ||
          execution.isLatestEntryTyping ||
          execution.isProgramSessionActive)
      ) {
        event.preventDefault();
        execution.cancelCurrentExecution();
      }
    };

    window.addEventListener("keydown", handleWindowKeyDown);

    return () => {
      window.removeEventListener("keydown", handleWindowKeyDown);
    };
  }, [execution]);

  return {
    currentPromptText,
    execution,
    handleKeyDown,
    handleSubmit,
    input,
    viewport: liveViewport,
    workspace,
  };
};
