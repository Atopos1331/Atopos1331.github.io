export const terminalRunEventName = "terminal:run";

export const runTerminalCommand = (command: string | readonly string[]) => {
  window.dispatchEvent(
    new CustomEvent(terminalRunEventName, {
      detail: {
        commands: Array.isArray(command) ? [...command] : [command],
      },
    })
  );
};

export const exposeTerminalCommandRunner = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.runTerminalCommand = (command: string | readonly string[]) => {
    runTerminalCommand(command);
  };
};
