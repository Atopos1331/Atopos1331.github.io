import { getCommandAutocomplete } from "../commands/autocomplete";

/**
 * Generates html tabs
 * @param {number} num - The number of tabs
 * @returns {string} tabs - Tab string
 */
export const generateTabs = (num = 0): string => {
  let tabs = "\xA0\xA0";
  for (let i = 0; i < num; i++) {
    tabs += "\xA0";
  }
  return tabs;
};

/**
 * Performs registry-backed tab completion for the active terminal input.
 * The helper stays intentionally small so completion rules live in the
 * command registry instead of drifting into terminal UI code.
 */
export const argTab = (
  inputVal: string,
  cwd: string,
  setInputVal: (value: React.SetStateAction<string>) => void,
  setSelectionOffset: (offset: number) => void
): string[] | undefined => {
  const { commandPrefix, suggestions } = getCommandAutocomplete(inputVal, cwd);

  if (suggestions.length === 1) {
    const nextValue = `${commandPrefix}${suggestions[0]}`;
    setInputVal(nextValue);
    setSelectionOffset(nextValue.length);
    return [];
  }

  if (suggestions.length > 1) {
    return suggestions;
  }

  return undefined;
};
