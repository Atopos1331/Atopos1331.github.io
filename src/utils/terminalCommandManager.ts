import type { HistoryRuntimeChunk } from "../terminal/terminalContext";
import type { ShellRuntimeChunk } from "./shellRuntime";
import type { TypingPreferences } from "./typingPreferences";

type CreateRuntimeChunk = (
  entryId: number,
  chunk: HistoryRuntimeChunk
) => void;

type IsEntryTyping = (entryId: number) => boolean;

type CreateChunkId = () => string;

type EnqueueOptions = {
  getAfterDelayMs?: () => number;
  getBeforeDelayMs?: () => number;
};

const shouldWaitForChunkCompletion = (
  chunk: ShellRuntimeChunk,
  typingPreferencesSnapshot: TypingPreferences
) => {
  if (!typingPreferencesSnapshot.enabled) {
    return false;
  }

  if (chunk.kind === "source") {
    return true;
  }

  return chunk.text.length > 0;
};

export class TerminalCommandManager {
  private commandQueue = Promise.resolve();
  private chunkResolvers = new Map<string, () => void>();
  private entryIdleResolvers = new Map<number, Array<() => void>>();
  private delayResolvers = new Set<() => void>();
  private queueVersion = 0;

  constructor(
    private readonly createChunkId: CreateChunkId,
    private readonly createRuntimeChunk: CreateRuntimeChunk,
    private readonly isEntryTyping: IsEntryTyping
  ) {}

  private waitForDelay(milliseconds: number, queueVersion: number) {
    if (milliseconds <= 0 || queueVersion !== this.queueVersion) {
      return Promise.resolve();
    }

    return new Promise<void>(resolve => {
      const timer = window.setTimeout(() => {
        this.delayResolvers.delete(cancelDelay);
        resolve();
      }, milliseconds);

      const cancelDelay = () => {
        window.clearTimeout(timer);
        this.delayResolvers.delete(cancelDelay);
        resolve();
      };

      this.delayResolvers.add(cancelDelay);
    });
  }

  enqueue<T>(run: () => Promise<T>, options: EnqueueOptions = {}): Promise<T> {
    const queueVersion = this.queueVersion;

    const wrappedRun = async () => {
      if (queueVersion !== this.queueVersion) {
        return undefined as T;
      }

      await this.waitForDelay(options.getBeforeDelayMs?.() ?? 0, queueVersion);

      if (queueVersion !== this.queueVersion) {
        return undefined as T;
      }

      const result = await run();

      if (queueVersion !== this.queueVersion) {
        return result;
      }

      await this.waitForDelay(options.getAfterDelayMs?.() ?? 0, queueVersion);
      return result;
    };

    const nextRun = this.commandQueue.then(wrappedRun, wrappedRun);
    this.commandQueue = nextRun.then(
      () => undefined,
      () => undefined
    );
    return nextRun;
  }

  emitRuntimeChunk(
    entryId: number,
    chunk: ShellRuntimeChunk,
    typingPreferencesSnapshot: TypingPreferences
  ) {
    const chunkId = this.createChunkId();

    this.createRuntimeChunk(entryId, {
      ...chunk,
      id: chunkId,
      typingPreferencesSnapshot,
    });

    return this.trackRuntimeChunk(chunkId, chunk, typingPreferencesSnapshot);
  }

  trackRuntimeChunk(
    chunkId: string,
    chunk: ShellRuntimeChunk,
    typingPreferencesSnapshot: TypingPreferences
  ) {
    if (!shouldWaitForChunkCompletion(chunk, typingPreferencesSnapshot)) {
      return Promise.resolve();
    }

    return new Promise<void>(resolve => {
      this.chunkResolvers.set(chunkId, resolve);
    });
  }

  completeRuntimeChunk(chunkId: string) {
    const resolve = this.chunkResolvers.get(chunkId);

    if (!resolve) {
      return;
    }

    this.chunkResolvers.delete(chunkId);
    resolve();
  }

  waitForEntryIdle(entryId: number) {
    if (!this.isEntryTyping(entryId)) {
      return Promise.resolve();
    }

    return new Promise<void>(resolve => {
      const resolvers = this.entryIdleResolvers.get(entryId) ?? [];
      this.entryIdleResolvers.set(entryId, [...resolvers, resolve]);
    });
  }

  notifyEntryTypingState(entryId: number) {
    if (this.isEntryTyping(entryId)) {
      return;
    }

    const resolvers = this.entryIdleResolvers.get(entryId);

    if (!resolvers || resolvers.length === 0) {
      return;
    }

    this.entryIdleResolvers.delete(entryId);
    resolvers.forEach(resolve => resolve());
  }

  clear() {
    this.cancelPending();
  }

  cancelPending() {
    this.queueVersion += 1;
    this.chunkResolvers.forEach(resolve => resolve());
    this.chunkResolvers.clear();
    this.entryIdleResolvers.forEach(resolvers =>
      resolvers.forEach(resolve => resolve())
    );
    this.entryIdleResolvers.clear();
    this.delayResolvers.forEach(resolve => resolve());
    this.delayResolvers.clear();
    this.commandQueue = Promise.resolve();
  }
}
