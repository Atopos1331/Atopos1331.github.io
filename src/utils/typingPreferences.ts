export type TypingPreferences = {
  commandDelayMs: number;
  enabled: boolean;
  speedMs: number;
};

export type TypingCommandResult =
  | {
      kind: "status";
    }
  | {
      kind: "update";
      nextPreferences: TypingPreferences;
    }
  | {
      kind: "invalid";
      message: string;
    };

export const defaultTypingPreferences: TypingPreferences = {
  commandDelayMs: 0,
  enabled: false,
  speedMs: 24,
};

const clampSpeed = (value: number) => Math.min(Math.max(value, 5), 240);
const clampCommandDelay = (value: number) => Math.min(Math.max(value, 0), 5000);

const parseSpeed = (value: string | undefined) => {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? clampSpeed(parsed) : null;
};

const parseCommandDelay = (value: string | undefined) => {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0
    ? clampCommandDelay(parsed)
    : null;
};

export const getTypingStatusMessage = (preferences: TypingPreferences) =>
  `Typing effect ${preferences.enabled ? "on" : "off"} at ${preferences.speedMs}ms/char.`;

export const getPaceStatusMessage = (preferences: TypingPreferences) =>
  preferences.commandDelayMs > 0
    ? `Command pacing on at ${preferences.commandDelayMs}ms between commands.`
    : "Command pacing off.";

export const resolveTypingCommand = (
  arg: string[],
  currentPreferences: TypingPreferences
): TypingCommandResult => {
  if (arg.length === 0) {
    return { kind: "status" };
  }

  if (arg.length === 1 && arg[0] === "0") {
    return {
      kind: "update",
      nextPreferences: {
        ...currentPreferences,
        enabled: false,
      },
    };
  }

  if (arg.length === 1) {
    const speedMs = parseSpeed(arg[0]);

    if (speedMs !== null) {
      return {
        kind: "update",
        nextPreferences: {
          ...currentPreferences,
          enabled: true,
          speedMs,
        },
      };
    }
  }

  return {
    kind: "invalid",
    message: "Usage: typing <0 | speed-ms>",
  };
};

export const resolvePaceCommand = (
  arg: string[],
  currentPreferences: TypingPreferences
): TypingCommandResult => {
  if (arg.length === 0) {
    return { kind: "status" };
  }

  if (arg[0] === "off" && arg.length === 1) {
    return {
      kind: "update",
      nextPreferences: {
        ...currentPreferences,
        commandDelayMs: 0,
      },
    };
  }

  if (arg.length === 1) {
    const commandDelayMs = parseCommandDelay(arg[0]);

    if (commandDelayMs !== null) {
      return {
        kind: "update",
        nextPreferences: {
          ...currentPreferences,
          commandDelayMs,
        },
      };
    }
  }

  return {
    kind: "invalid",
    message: "Usage: pace <delay-ms | off>",
  };
};
