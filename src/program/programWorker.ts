/// <reference lib="webworker" />

import type {
  MainToProgramWorkerMessage,
  ProgramSessionDescriptor,
  ProgramWorkerToMainMessage,
} from "./programTypes";

declare const self: DedicatedWorkerGlobalScope;

class ProgramExitSignal extends Error {
  code: number;

  constructor(code: number) {
    super(`Program exited with code ${code}`);
    this.code = code;
  }
}

const AsyncFunction = Object.getPrototypeOf(async function () {
  return undefined;
}).constructor as new (
  ...args: string[]
) => (api: Record<string, unknown>) => Promise<unknown>;

let pendingReadResolvers: Array<(value: string) => void> = [];
const queuedInputLines: string[] = [];
let exited = false;

const postToMain = (message: ProgramWorkerToMainMessage) => {
  self.postMessage(message);
};

const readLine = () =>
  new Promise<string>(resolve => {
    const nextInput = queuedInputLines.shift();

    if (nextInput !== undefined) {
      resolve(nextInput);
      return;
    }

    pendingReadResolvers.push(resolve);
  });

const write = (text: unknown) => {
  postToMain({
    text: String(text ?? ""),
    type: "stdout",
  });
};

const writeErr = (text: unknown) => {
  postToMain({
    text: String(text ?? ""),
    type: "stderr",
  });
};

const clear = () => {
  postToMain({
    type: "clear",
  });
};

const exit = (code = 0) => {
  exited = true;
  throw new ProgramExitSignal(Number.isFinite(code) ? Math.trunc(code) : 0);
};

const sleep = (milliseconds: number) =>
  new Promise<void>(resolve => {
    self.setTimeout(resolve, Math.max(0, Number.isFinite(milliseconds) ? milliseconds : 0));
  });

const flushInputToReader = (text: string) => {
  const resolver = pendingReadResolvers.shift();

  if (resolver) {
    resolver(text);
    return;
  }

  queuedInputLines.push(text);
};

const runProgram = async (descriptor: ProgramSessionDescriptor) => {
  exited = false;
  pendingReadResolvers = [];
  queuedInputLines.length = 0;

  const api = {
    clear,
    exit,
    readLine,
    sleep,
    write,
    writeErr,
  };
const runner = new AsyncFunction(
    "api",
    `"use strict";
const { clear, exit, readLine, sleep, write, writeErr } = api;
const window = undefined;
const document = undefined;
const self = undefined;
const globalThis = undefined;
const fetch = undefined;
const XMLHttpRequest = undefined;
const WebSocket = undefined;
const EventSource = undefined;
const importScripts = undefined;
const postMessage = undefined;
const close = undefined;
const setTimeout = undefined;
const setInterval = undefined;
const clearTimeout = undefined;
const clearInterval = undefined;
const Function = undefined;
${descriptor.script}`
  );

  try {
    await runner(api);

    if (!exited) {
      postToMain({
        code: 0,
        type: "exit",
      });
    }
  } catch (error) {
    if (error instanceof ProgramExitSignal) {
      postToMain({
        code: error.code,
        type: "exit",
      });
      return;
    }

    const message =
      error instanceof Error ? error.message : "Program execution failed.";
    postToMain({
      message,
      type: "error",
    });
    postToMain({
      code: 1,
      type: "exit",
    });
  } finally {
    exited = false;
    pendingReadResolvers = [];
    queuedInputLines.length = 0;
  }
};

self.onmessage = (event: MessageEvent<MainToProgramWorkerMessage>) => {
  const message = event.data;

  if (message.type === "stdin") {
    flushInputToReader(message.text);
    return;
  }

  if (message.type === "start") {
    void runProgram(message.descriptor);
  }
};
