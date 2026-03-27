export type ShellSessionPreferences = {
  verbose: boolean;
};

export type SetCommandResult =
  | {
      kind: "status";
    }
  | {
      kind: "update";
      nextPreferences: ShellSessionPreferences;
    }
  | {
      kind: "invalid";
      message: string;
    };

export const defaultShellSessionPreferences: ShellSessionPreferences = {
  verbose: false,
};

export const getSetStatusMessage = (preferences: ShellSessionPreferences) =>
  `Shell verbose mode ${preferences.verbose ? "on" : "off"}.`;

export const resolveSetCommand = (
  arg: string[],
  currentPreferences: ShellSessionPreferences
): SetCommandResult => {
  if (arg.length === 0) {
    return { kind: "status" };
  }

  if (arg.length === 1 && (arg[0] === "-v" || arg[0] === "+v")) {
    return {
      kind: "update",
      nextPreferences: {
        ...currentPreferences,
        verbose: arg[0] === "-v",
      },
    };
  }

  return {
    kind: "invalid",
    message: "Usage: set <-v | +v>",
  };
};

export const resolveVerboseModeFromSetSource = (source: string) => {
  if (source === "set -v") {
    return true;
  }

  if (source === "set +v") {
    return false;
  }

  return null;
};
