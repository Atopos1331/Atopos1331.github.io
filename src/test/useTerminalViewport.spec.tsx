import { act, renderHook, waitFor } from "../utils/test-utils";
import { describe, expect, it, vi } from "vitest";
import { useRef, type MutableRefObject } from "react";
import { useTerminalViewport } from "../terminal/useTerminalViewport";

type ViewportProps = {
  entriesLength: number;
  hintsLength: number;
  inputVal: string;
  isInputLocked: boolean;
  isLatestEntryTyping: boolean;
  isProgramSessionActive: boolean;
  pointer: number;
  scrollSignal: number;
};

const createScrollableContainer = ({
  clientHeight,
  scrollHeight,
  scrollTop = 0,
}: {
  clientHeight: number;
  scrollHeight: number;
  scrollTop?: number;
}) => {
  const element = document.createElement("div");
  const metrics = {
    clientHeight,
    scrollHeight,
  };
  let currentScrollTop = scrollTop;
  const scrollTo = vi.fn(
    ({ top }: ScrollToOptions & { top?: number } = {}) => {
      const targetTop = Number(top ?? 0);
      const maxScrollTop = Math.max(metrics.scrollHeight - metrics.clientHeight, 0);
      currentScrollTop = Math.min(Math.max(targetTop, 0), maxScrollTop);
    }
  );

  Object.defineProperty(element, "clientHeight", {
    configurable: true,
    get: () => metrics.clientHeight,
  });
  Object.defineProperty(element, "scrollHeight", {
    configurable: true,
    get: () => metrics.scrollHeight,
  });
  Object.defineProperty(element, "scrollTop", {
    configurable: true,
    get: () => currentScrollTop,
    set: value => {
      currentScrollTop = Number(value);
    },
  });
  Object.defineProperty(element, "scrollTo", {
    configurable: true,
    value: scrollTo,
  });

  return {
    element,
    getScrollTop: () => currentScrollTop,
    scrollTo,
    setScrollHeight: (value: number) => {
      metrics.scrollHeight = value;
    },
  };
};

const useViewportHarness = (props: ViewportProps) => {
  const selectionOffsetRef = useRef(0);

  return useTerminalViewport({
    entriesLength: props.entriesLength,
    hintsLength: props.hintsLength,
    inputVal: props.inputVal,
    isInputLocked: props.isInputLocked,
    isLatestEntryTyping: props.isLatestEntryTyping,
    isProgramSessionActive: props.isProgramSessionActive,
    pointer: props.pointer,
    scrollSignal: props.scrollSignal,
    selectionOffsetRef,
    selectionPrefixLength: 2,
  });
};

const assignRef = <T,>(ref: { current: T | null }, value: T | null) => {
  (ref as MutableRefObject<T | null>).current = value;
};

describe("useTerminalViewport", () => {
  it("forces program sessions to keep following the latest output", async () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(callback => {
      callback(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);

    const { result, rerender } = renderHook(useViewportHarness, {
      initialProps: {
        entriesLength: 1,
        hintsLength: 0,
        inputVal: "",
        isInputLocked: false,
        isLatestEntryTyping: false,
        isProgramSessionActive: false,
        pointer: -1,
        scrollSignal: 0,
      },
    });
    const container = createScrollableContainer({
      clientHeight: 120,
      scrollHeight: 280,
      scrollTop: 80,
    });

    act(() => {
      assignRef(result.current.containerRef, container.element);
      assignRef(result.current.contentRef, document.createElement("div"));
      assignRef(result.current.inputRef, document.createElement("textarea"));
    });

    rerender({
      entriesLength: 1,
      hintsLength: 0,
      inputVal: "",
      isInputLocked: false,
      isLatestEntryTyping: false,
      isProgramSessionActive: false,
      pointer: -1,
      scrollSignal: 0,
    });

    act(() => {
      container.element.scrollTop = 32;
      result.current.handleScroll();
    });

    rerender({
      entriesLength: 1,
      hintsLength: 0,
      inputVal: "",
      isInputLocked: false,
      isLatestEntryTyping: false,
      isProgramSessionActive: true,
      pointer: -1,
      scrollSignal: 1,
    });

    await waitFor(() => expect(container.scrollTo).toHaveBeenCalled());
    expect(container.getScrollTop()).toBe(160);
  });

  it("re-aligns to the latest line after a program clear shrinks the output", async () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(callback => {
      callback(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);

    const { result, rerender } = renderHook(useViewportHarness, {
      initialProps: {
        entriesLength: 1,
        hintsLength: 0,
        inputVal: "",
        isInputLocked: false,
        isLatestEntryTyping: false,
        isProgramSessionActive: true,
        pointer: -1,
        scrollSignal: 0,
      },
    });
    const container = createScrollableContainer({
      clientHeight: 120,
      scrollHeight: 320,
      scrollTop: 0,
    });

    act(() => {
      assignRef(result.current.containerRef, container.element);
      assignRef(result.current.contentRef, document.createElement("div"));
      assignRef(result.current.inputRef, document.createElement("textarea"));
    });

    rerender({
      entriesLength: 1,
      hintsLength: 0,
      inputVal: "",
      isInputLocked: false,
      isLatestEntryTyping: false,
      isProgramSessionActive: true,
      pointer: -1,
      scrollSignal: 1,
    });

    await waitFor(() => expect(container.getScrollTop()).toBe(200));

    act(() => {
      container.setScrollHeight(180);
    });

    rerender({
      entriesLength: 1,
      hintsLength: 0,
      inputVal: "",
      isInputLocked: false,
      isLatestEntryTyping: false,
      isProgramSessionActive: true,
      pointer: -1,
      scrollSignal: 2,
    });

    await waitFor(() => expect(container.getScrollTop()).toBe(60));
  });
});
