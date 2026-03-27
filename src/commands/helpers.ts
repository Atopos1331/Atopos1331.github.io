import type { CommandDefinition, CommandExecutionContext } from "./types";

/**
 * Creates a command definition while keeping the public command name out of the
 * runtime shape stored in the registry.
 */
export const defineCommand = ({
  name,
  ...definition
}: Omit<CommandDefinition, "cmd"> & { name: string }): CommandDefinition => ({
  ...definition,
  cmd: name,
});

/**
 * Emits an error line with shell-consistent styling.
 */
export const emitError = async (
  context: CommandExecutionContext,
  text: string
) => {
  await context.emit({
    kind: "line",
    text,
    tone: "error",
  });
};

/**
 * Emits an accent line with shell-consistent styling.
 */
export const emitAccent = async (
  context: CommandExecutionContext,
  text: string
) => {
  await context.emit({
    kind: "line",
    text,
    tone: "accent",
  });
};
