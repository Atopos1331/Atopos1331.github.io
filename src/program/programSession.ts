import type {
  MainToProgramWorkerMessage,
  ProgramSessionDescriptor,
  ProgramWorkerToMainMessage,
} from "./programTypes";

const createProgramWorker = () =>
  new Worker(new URL("./programWorker.ts", import.meta.url), {
    type: "module",
  });

type ProgramOutputHandlers = {
  onClear: () => void;
  onError: (message: string) => Promise<void> | void;
  onExit: (code: number) => Promise<void> | void;
  onStderr: (text: string) => Promise<void> | void;
  onStdout: (text: string) => Promise<void> | void;
};

export type ProgramSessionHandle = {
  completion: Promise<number>;
  interrupt: () => void;
  isActive: () => boolean;
  writeLine: (text: string) => void;
};

export const startProgramSession = (
  descriptor: ProgramSessionDescriptor,
  handlers: ProgramOutputHandlers
): ProgramSessionHandle => {
  const worker = createProgramWorker();
  let active = true;
  let settled = false;
  let resolveCompletion: (code: number) => void = () => undefined;

  const completion = new Promise<number>(resolve => {
    resolveCompletion = resolve;
  });

  const settle = (code: number) => {
    if (settled) {
      return;
    }

    settled = true;
    active = false;
    worker.terminate();
    resolveCompletion(code);
  };

  worker.onmessage = event => {
    const message = event.data as ProgramWorkerToMainMessage;

    if (!active) {
      return;
    }

    if (message.type === "stdout") {
      void handlers.onStdout(message.text);
      return;
    }

    if (message.type === "stderr") {
      void handlers.onStderr(message.text);
      return;
    }

    if (message.type === "clear") {
      handlers.onClear();
      return;
    }

    if (message.type === "error") {
      void handlers.onError(message.message);
      return;
    }

    if (message.type === "exit") {
      void Promise.resolve(handlers.onExit(message.code)).finally(() => {
        settle(message.code);
      });
    }
  };

  worker.onerror = event => {
    void Promise.resolve(
      handlers.onError(event.message || "Program worker failed.")
    ).finally(() => {
      void Promise.resolve(handlers.onExit(1)).finally(() => {
        settle(1);
      });
    });
  };

  const postMessage = (message: MainToProgramWorkerMessage) => {
    worker.postMessage(message);
  };

  postMessage({
    descriptor,
    type: "start",
  });

  return {
    completion,
    interrupt: () => {
      if (!active) {
        return;
      }

      settle(130);
    },
    isActive: () => active,
    writeLine: (text: string) => {
      if (!active) {
        return;
      }

      postMessage({
        text,
        type: "stdin",
      });
    },
  };
};
