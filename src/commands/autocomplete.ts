import { getPathSuggestions } from "../shell/filesystem";
import { tokenizeShellInput } from "../utils/shellRuntime";
import { commandDefinitions, getCommandDefinition } from "./specs";

export type CommandAutocompleteResult = {
  commandPrefix: string;
  suggestions: string[];
};

/**
 * Returns shell autocomplete suggestions for the current input value.
 */
export const getCommandAutocomplete = (
  input: string,
  cwd: string
): CommandAutocompleteResult => {
  // Tokenization mirrors runtime parsing so completion and execution stay aligned.
  const tokens = tokenizeShellInput(input);
  const command = tokens[0] ?? "";
  const spec = getCommandDefinition(command);
  const activeArgIndex = input.endsWith(" ")
    ? Math.max(0, tokens.length - 1)
    : Math.max(0, tokens.length - 2);
  const activeToken = input.endsWith(" ")
    ? ""
    : input.match(/(?:^|\s)(\S+)$/)?.[1] ?? "";
  const commandPrefix =
    activeToken === "" ? input : input.slice(0, input.length - activeToken.length);

  // Before the first space we only suggest command names.
  if (tokens.length <= 1 && !input.includes(" ")) {
    return {
      commandPrefix: "",
      suggestions: commandDefinitions
        .map(definition => definition.cmd)
        .filter(name => name.startsWith(input)),
    };
  }

  if (!spec) {
    return {
      commandPrefix,
      suggestions: [],
    };
  }

  // Commands can override default behavior when argument meaning depends on position.
  if (spec.autocomplete) {
    return {
      commandPrefix,
      suggestions: spec.autocomplete({
        activeArgIndex,
        activeToken,
        command,
        cwd,
        input,
        tokens,
      }),
    };
  }

  const pathArgument = spec.pathArguments?.find(
    argument => argument.index === activeArgIndex
  );

  // Path-aware arguments reuse the shared shell suggestion helpers.
  if (pathArgument) {
    return {
      commandPrefix,
      suggestions: getPathSuggestions(
        activeToken,
        cwd,
        pathArgument.directoriesOnly
      ).filter(suggestion => {
        if (!pathArgument.fileExtensions || suggestion.endsWith("/")) {
          return true;
        }

        return pathArgument.fileExtensions.some(extension =>
          suggestion.toLowerCase().endsWith(`.${extension.toLowerCase()}`)
        );
      }),
    };
  }

  const argumentSuggestions = spec.argumentSuggestions?.[activeArgIndex] ?? [];

  return {
    commandPrefix,
    suggestions: argumentSuggestions.filter(suggestion =>
      suggestion.startsWith(activeToken)
    ),
  };
};
