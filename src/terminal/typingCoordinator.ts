export type EntryTypingState = {
  active: boolean;
  totalLength: number;
  visibleLength: number;
};

export const shouldUpdateEntryTypingState = (
  currentState: EntryTypingState | undefined,
  nextState: EntryTypingState
) =>
  !(
    currentState?.active === nextState.active &&
    currentState?.totalLength === nextState.totalLength &&
    currentState?.visibleLength === nextState.visibleLength
  );

export const applyEntryTypingState = (
  previousState: Record<number, EntryTypingState>,
  entryId: number,
  nextState: EntryTypingState
) => ({
  ...previousState,
  [entryId]: nextState,
});

export const markEntryTypingCancelled = (
  previousState: Record<number, EntryTypingState>,
  entryId: number
) => {
  const currentState = previousState[entryId];

  if (!currentState) {
    return previousState;
  }

  return {
    ...previousState,
    [entryId]: {
      ...currentState,
      active: false,
      visibleLength: currentState.totalLength,
    },
  };
};
