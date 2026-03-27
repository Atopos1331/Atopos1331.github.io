import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MutableRefObject,
} from "react";

type UseTerminalViewportArgs = {
  entriesLength: number;
  hintsLength: number;
  inputVal: string;
  isInputLocked: boolean;
  isProgramSessionActive: boolean;
  isLatestEntryTyping: boolean;
  pointer: number;
  selectionPrefixLength: number;
  selectionOffsetRef: MutableRefObject<number>;
  scrollSignal: number;
};

export type TerminalScrollMetrics = {
  atBottom: boolean;
  atTop: boolean;
  clientHeight: number;
  isScrollable: boolean;
  maxScrollTop: number;
  scrollHeight: number;
  scrollTop: number;
};

const defaultScrollMetrics: TerminalScrollMetrics = {
  atBottom: true,
  atTop: true,
  clientHeight: 0,
  isScrollable: false,
  maxScrollTop: 0,
  scrollHeight: 0,
  scrollTop: 0,
};

const nearlyEqual = (left: number, right: number) => Math.abs(left - right) <= 1;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * Owns prompt focus, selection clamping, and auto-follow scrolling.
 */
export const useTerminalViewport = ({
  entriesLength,
  hintsLength,
  inputVal,
  isInputLocked,
  isProgramSessionActive,
  isLatestEntryTyping,
  pointer,
  selectionPrefixLength,
  selectionOffsetRef,
  scrollSignal,
}: UseTerminalViewportArgs) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const autoFollowRef = useRef(true);
  const previousScrollTopRef = useRef(0);
  const shouldForceFollow = isLatestEntryTyping || isProgramSessionActive;
  const [scrollMetrics, setScrollMetrics] =
    useState<TerminalScrollMetrics>(defaultScrollMetrics);

  /**
   * Snapshots the live scroll geometry so the visual rail can stay in sync.
   */
  const syncScrollMetrics = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const maxScrollTop = Math.max(container.scrollHeight - container.clientHeight, 0);
    const scrollTop = clamp(container.scrollTop, 0, maxScrollTop);
    const nextMetrics: TerminalScrollMetrics = {
      atBottom: maxScrollTop <= 1 || maxScrollTop - scrollTop <= 2,
      atTop: scrollTop <= 1,
      clientHeight: container.clientHeight,
      isScrollable: maxScrollTop > 1,
      maxScrollTop,
      scrollHeight: container.scrollHeight,
      scrollTop,
    };

    setScrollMetrics(previousMetrics =>
      nearlyEqual(previousMetrics.scrollTop, nextMetrics.scrollTop) &&
      nearlyEqual(previousMetrics.scrollHeight, nextMetrics.scrollHeight) &&
      nearlyEqual(previousMetrics.clientHeight, nextMetrics.clientHeight) &&
      previousMetrics.isScrollable === nextMetrics.isScrollable &&
      previousMetrics.atTop === nextMetrics.atTop &&
      previousMetrics.atBottom === nextMetrics.atBottom
        ? previousMetrics
        : nextMetrics
    );

    previousScrollTopRef.current = scrollTop;

    if (!nextMetrics.isScrollable) {
      autoFollowRef.current = true;
    }
  }, []);

  /**
   * Moves focus back to the prompt.
   */
  const focusInput = useCallback(() => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    try {
      input.focus({ preventScroll: true });
    } catch {
      input.focus();
    }
  }, []);

  /**
   * Stores the current logical cursor offset inside the editable region.
   */
  const setSelectionOffset = useCallback((offset: number) => {
    selectionOffsetRef.current = offset;
  }, [selectionOffsetRef]);

  /**
   * Keeps the caret to the right of the prompt prefix.
   */
  const clampSelectionToPrompt = useCallback(() => {
    const textarea = inputRef.current;

    if (!textarea) {
      return;
    }

    const promptLength = selectionPrefixLength;
    const start = textarea.selectionStart ?? promptLength;
    const end = textarea.selectionEnd ?? promptLength;
    const nextStart = Math.max(promptLength, start);
    const nextEnd = Math.max(promptLength, end);

    if (start !== nextStart || end !== nextEnd) {
      textarea.setSelectionRange(nextStart, nextEnd);
    }

    selectionOffsetRef.current = Math.max(0, nextEnd - promptLength);
  }, [selectionOffsetRef, selectionPrefixLength]);

  /**
   * Scrolls the terminal to the latest output.
   */
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    if (typeof container.scrollTo === "function") {
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
    } else {
      container.scrollTop = container.scrollHeight;
    }

    previousScrollTopRef.current = container.scrollTop;
    window.requestAnimationFrame(syncScrollMetrics);
  }, [syncScrollMetrics]);

  /**
   * Moves the viewport by a relative delta for the custom rail controls.
   */
  const scrollByDelta = useCallback(
    (delta: number, behavior: ScrollBehavior = "smooth") => {
      const container = containerRef.current;

      if (!container) {
        return;
      }

      const maxScrollTop = Math.max(container.scrollHeight - container.clientHeight, 0);
      const nextScrollTop = clamp(container.scrollTop + delta, 0, maxScrollTop);

      if (typeof container.scrollTo === "function") {
        container.scrollTo({
          top: nextScrollTop,
          behavior,
        });
      } else {
        container.scrollTop = nextScrollTop;
      }

      autoFollowRef.current = maxScrollTop - nextScrollTop <= 24;
      window.requestAnimationFrame(syncScrollMetrics);
    },
    [syncScrollMetrics]
  );

  /**
   * Jumps to a proportional position along the viewport height.
   */
  const scrollToRatio = useCallback(
    (ratio: number, behavior: ScrollBehavior = "smooth") => {
      const container = containerRef.current;

      if (!container) {
        return;
      }

      const maxScrollTop = Math.max(container.scrollHeight - container.clientHeight, 0);
      const nextScrollTop = clamp(ratio, 0, 1) * maxScrollTop;

      if (typeof container.scrollTo === "function") {
        container.scrollTo({
          top: nextScrollTop,
          behavior,
        });
      } else {
        container.scrollTop = nextScrollTop;
      }

      autoFollowRef.current = maxScrollTop - nextScrollTop <= 24;
      window.requestAnimationFrame(syncScrollMetrics);
    },
    [syncScrollMetrics]
  );

  /**
   * Toggles auto-follow based on manual scrolling.
   */
  const handleScroll = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const distanceToBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const nextScrollTop = container.scrollTop;
    const previousScrollTop = previousScrollTopRef.current;

    // If the user scrolls up, disable auto-follow so they can reliably reach the top.
    if (nextScrollTop < previousScrollTop - 1) {
      autoFollowRef.current = false;
      previousScrollTopRef.current = nextScrollTop;
      return;
    }

    // Re-enable auto-follow only when the user is back near the bottom.
    autoFollowRef.current = distanceToBottom <= 24;
    previousScrollTopRef.current = nextScrollTop;
    syncScrollMetrics();
  }, [syncScrollMetrics]);

  /**
   * Focuses the prompt when the user clicks empty terminal space.
   */
  const handleWrapperClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;

      if (target.closest("a, button, input, textarea")) {
        return;
      }

      focusInput();
      const selection = selectionPrefixLength + inputVal.length;
      window.requestAnimationFrame(() => {
        inputRef.current?.setSelectionRange(selection, selection);
      });
    },
    [focusInput, inputVal.length, selectionPrefixLength]
  );

  /**
   * Schedules a cursor move after history navigation updates.
   */
  const moveCursorTo = useCallback((selection: number) => {
    window.requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(selection, selection);
    });
  }, []);

  useEffect(() => {
    if (isInputLocked) {
      return;
    }

    const container = containerRef.current;

    if (container) {
      const distanceToBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      autoFollowRef.current = distanceToBottom <= 24;
      previousScrollTopRef.current = container.scrollTop;
      syncScrollMetrics();
    }

    const timer = window.setTimeout(() => {
      focusInput();
      syncScrollMetrics();
    }, 1);

    return () => window.clearTimeout(timer);
  }, [entriesLength, focusInput, hintsLength, isInputLocked, pointer, syncScrollMetrics]);

  useLayoutEffect(() => {
    if (isInputLocked || !inputRef.current) {
      return;
    }

    const nextSelection = selectionPrefixLength + selectionOffsetRef.current;
    inputRef.current.setSelectionRange(nextSelection, nextSelection);
  }, [inputVal, isInputLocked, selectionOffsetRef, selectionPrefixLength]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (shouldForceFollow) {
        autoFollowRef.current = true;
      }

      if (autoFollowRef.current || shouldForceFollow) {
        scrollToBottom();
      } else {
        syncScrollMetrics();
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [
    entriesLength,
    hintsLength,
    inputVal,
    isInputLocked,
    isProgramSessionActive,
    isLatestEntryTyping,
    scrollSignal,
    scrollToBottom,
    syncScrollMetrics,
  ]);

  useLayoutEffect(() => {
    syncScrollMetrics();
  }, [syncScrollMetrics]);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (shouldForceFollow) {
        autoFollowRef.current = true;
      }

      if (autoFollowRef.current || shouldForceFollow) {
        scrollToBottom();
      } else {
        syncScrollMetrics();
      }
    });

    observer.observe(container);
    observer.observe(content);

    return () => observer.disconnect();
  }, [
    isInputLocked,
    isLatestEntryTyping,
    isProgramSessionActive,
    scrollToBottom,
    shouldForceFollow,
    syncScrollMetrics,
  ]);

  return {
    clampSelectionToPrompt,
    containerRef,
    contentRef,
    focusInput,
    handleScroll,
    handleWrapperClick,
    inputRef,
    moveCursorTo,
    scrollByDelta,
    scrollMetrics,
    scrollToRatio,
    setSelectionOffset,
  };
};
