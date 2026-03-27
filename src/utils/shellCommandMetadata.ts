import { getCommandDefinition } from "../commands/specs";

export type ShellPathArgumentRule = {
  directoriesOnly?: boolean;
  fileExtensions?: string[];
  indexes: number[];
};

/**
 * Derives shell path metadata from the centralized command registry.
 */
export const getShellPathArgumentRule = (
  command: string
): ShellPathArgumentRule | undefined => {
  const definition = getCommandDefinition(command);

  if (!definition?.pathArguments || definition.pathArguments.length === 0) {
    return undefined;
  }

  return {
    directoriesOnly:
      definition.pathArguments.every(argument => argument.directoriesOnly === true) ||
      undefined,
    fileExtensions: definition.pathArguments[0]?.fileExtensions
      ? [...definition.pathArguments[0].fileExtensions]
      : undefined,
    indexes: definition.pathArguments.map(argument => argument.index),
  };
};

/**
 * Returns whether the given argument index should be treated as a shell path.
 */
export const isShellPathArgument = (command: string, argIndex: number) =>
  getShellPathArgumentRule(command)?.indexes.includes(argIndex) ?? false;
