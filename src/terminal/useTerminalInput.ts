import { useCallback, useState } from "react";

type UseTerminalInputArgs = {
  currentPromptText: string;
  setSelectionOffset: (offset: number) => void;
};

/**
 * Owns the editable prompt state without coupling to command execution.
 */
export const useTerminalInput = ({
  currentPromptText,
  setSelectionOffset,
}: UseTerminalInputArgs) => {
  const [inputVal, setInputVal] = useState("");
  const [hints, setHints] = useState<string[]>([]);
  const [pointer, setPointer] = useState(-1);

  /**
   * Clears all prompt-level UI state.
   */
  const clearInputUi = useCallback(() => {
    setInputVal("");
    setHints([]);
    setPointer(-1);
    setSelectionOffset(0);
  }, [setSelectionOffset]);

  /**
   * Parses the textarea value while preserving the immutable prompt prefix.
   */
  const handleTextAreaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const rawValue = e.target.value;
      const nextValue = rawValue.startsWith(currentPromptText)
        ? rawValue.slice(currentPromptText.length)
        : rawValue.length > currentPromptText.length
          ? rawValue.slice(currentPromptText.length)
          : "";
      const selectionStart = e.target.selectionStart ?? currentPromptText.length;

      setSelectionOffset(Math.max(0, selectionStart - currentPromptText.length));
      setInputVal(nextValue);
    },
    [currentPromptText, setSelectionOffset]
  );

  const handleProgramTextAreaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const nextValue = e.target.value;
      const selectionStart = e.target.selectionStart ?? nextValue.length;

      setSelectionOffset(selectionStart);
      setInputVal(nextValue);
    },
    [setSelectionOffset]
  );

  return {
    clearInputUi,
    handleProgramTextAreaChange,
    handleTextAreaChange,
    hints,
    inputVal,
    pointer,
    setHints,
    setInputVal,
    setPointer,
  };
};
