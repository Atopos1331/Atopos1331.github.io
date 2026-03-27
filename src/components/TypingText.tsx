import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styled, { keyframes } from "styled-components";
import { termContext } from "../terminal/terminalContext";
import type { TypingPreferences } from "../utils/typingPreferences";

type Props = {
  children: string;
  className?: string;
  instant?: boolean;
  onComplete?: () => void;
  preferencesOverride?: TypingPreferences;
};

type TypingSegment = {
  id: string;
  length: number;
};

type EntryTypingRuntimeState = {
  active: boolean;
  totalLength: number;
  visibleLength: number;
};

type EntryTypingRuntimeContextValue = {
  getVisibleLength: (segmentId: string, segmentLength: number) => number;
  registerSegment: (segmentId: string, length: number) => void;
  unregisterSegment: (segmentId: string) => void;
  updateSegment: (segmentId: string, length: number) => void;
};

type EntryTypingProviderProps = {
  children: ReactNode;
  enabled: boolean;
  entryId: number;
  onStateChange?: (
    entryId: number,
    nextState: EntryTypingRuntimeState
  ) => void;
  speedMs: number;
};

const entryTypingRuntimeContext =
  createContext<EntryTypingRuntimeContextValue | null>(null);

let nextTypingSegmentId = 0;

const glyphReveal = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.35rem);
    filter: blur(0.08rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
`;

const Root = styled.span`
  display: inline;
  white-space: pre-wrap;
  word-break: break-word;
`;

const Glyph = styled.span`
  display: inline-block;
  animation: ${glyphReveal} 180ms ease forwards;
`;

export const EntryTypingProvider: React.FC<EntryTypingProviderProps> = ({
  children,
  enabled,
  entryId,
  onStateChange,
  speedMs,
}) => {
  const [segments, setSegments] = useState<TypingSegment[]>([]);
  const [visibleLength, setVisibleLength] = useState(0);
  const wasEnabledRef = useRef(enabled);

  const totalLength = useMemo(
    () => segments.reduce((sum, segment) => sum + segment.length, 0),
    [segments]
  );

  const registerSegment = useCallback((segmentId: string, length: number) => {
    setSegments(prevState => {
      const segmentIndex = prevState.findIndex(segment => segment.id === segmentId);

      if (segmentIndex === -1) {
        return [...prevState, { id: segmentId, length }];
      }

      if (prevState[segmentIndex].length === length) {
        return prevState;
      }

      const nextState = [...prevState];
      nextState[segmentIndex] = {
        ...nextState[segmentIndex],
        length,
      };

      return nextState;
    });
  }, []);

  const updateSegment = useCallback((segmentId: string, length: number) => {
    setSegments(prevState => {
      const segmentIndex = prevState.findIndex(segment => segment.id === segmentId);

      if (segmentIndex === -1) {
        return [...prevState, { id: segmentId, length }];
      }

      if (prevState[segmentIndex].length === length) {
        return prevState;
      }

      const nextState = [...prevState];
      nextState[segmentIndex] = {
        ...nextState[segmentIndex],
        length,
      };

      return nextState;
    });
  }, []);

  const unregisterSegment = useCallback((segmentId: string) => {
    setSegments(prevState =>
      prevState.filter(segment => segment.id !== segmentId)
    );
  }, []);

  const getVisibleLength = useCallback(
    (segmentId: string, segmentLength: number) => {
      let offset = 0;

      for (const segment of segments) {
        if (segment.id === segmentId) {
          return Math.max(
            0,
            Math.min(segmentLength, visibleLength - offset)
          );
        }

        offset += segment.length;
      }

      return 0;
    },
    [segments, visibleLength]
  );

  useEffect(() => {
    setVisibleLength(prevState => {
      if (!enabled) {
        return totalLength;
      }

      if (!wasEnabledRef.current) {
        return totalLength;
      }

      return Math.min(prevState, totalLength);
    });
  }, [enabled, totalLength]);

  useEffect(() => {
    wasEnabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    if (!enabled || totalLength === 0 || visibleLength >= totalLength) {
      return;
    }

    const timer = window.setInterval(() => {
      setVisibleLength(prevState => Math.min(prevState + 1, totalLength));
    }, speedMs);

    return () => window.clearInterval(timer);
  }, [enabled, speedMs, totalLength, visibleLength]);

  useEffect(() => {
    onStateChange?.(entryId, {
      active: enabled && totalLength > 0 && visibleLength < totalLength,
      totalLength,
      visibleLength,
    });
  }, [enabled, entryId, onStateChange, totalLength, visibleLength]);

  const contextValue = useMemo(
    () => ({
      getVisibleLength,
      registerSegment,
      unregisterSegment,
      updateSegment,
    }),
    [getVisibleLength, registerSegment, unregisterSegment, updateSegment]
  );

  return (
    <entryTypingRuntimeContext.Provider value={contextValue}>
      {children}
    </entryTypingRuntimeContext.Provider>
  );
};

const TypingText: React.FC<Props> = ({
  children,
  className,
  instant = false,
  onComplete,
  preferencesOverride,
}) => {
  const { entry } = useContext(termContext);
  const typingRuntime = useContext(entryTypingRuntimeContext);
  const preferences = preferencesOverride ?? entry.typingPreferencesSnapshot;
  const characters = Array.from(children);
  const segmentIdRef = useRef(`typing-segment-${nextTypingSegmentId++}`);
  const completionRef = useRef<string | null>(null);
  const registerSegment = typingRuntime?.registerSegment;
  const unregisterSegment = typingRuntime?.unregisterSegment;
  const updateSegment = typingRuntime?.updateSegment;
  const getVisibleLength = typingRuntime?.getVisibleLength;
  const shouldAnimate =
    !instant &&
    preferences.enabled &&
    characters.length > 0 &&
    getVisibleLength !== undefined;
  const visibleLength = shouldAnimate
    ? getVisibleLength(segmentIdRef.current, characters.length)
    : characters.length;

  useLayoutEffect(() => {
    if (!registerSegment || !unregisterSegment || instant || !preferences.enabled) {
      return;
    }

    const segmentId = segmentIdRef.current;
    registerSegment(segmentId, characters.length);

    return () => {
      unregisterSegment(segmentId);
    };
  }, [
    characters.length,
    instant,
    preferences.enabled,
    registerSegment,
    unregisterSegment,
  ]);

  useLayoutEffect(() => {
    if (!updateSegment || instant || !preferences.enabled) {
      return;
    }

    updateSegment(segmentIdRef.current, characters.length);
  }, [characters.length, instant, preferences.enabled, updateSegment]);

  useEffect(() => {
    if (!onComplete) {
      return;
    }

    const completionToken = `${children}:${instant}:${preferences.enabled}:${preferences.speedMs}:${characters.length}`;
    const isComplete = visibleLength >= characters.length;

    if (!isComplete) {
      if (completionRef.current === completionToken) {
        completionRef.current = null;
      }
      return;
    }

    if (completionRef.current === completionToken) {
      return;
    }

    completionRef.current = completionToken;
    onComplete();
  }, [
    characters.length,
    children,
    instant,
    onComplete,
    preferences.enabled,
    preferences.speedMs,
    visibleLength,
  ]);

  if (!shouldAnimate) {
    return <Root className={className}>{children}</Root>;
  }

  return (
    <Root className={className}>
      {characters.slice(0, visibleLength).map((character, index) =>
        character === "\n" ? (
          <br key={`typing-break-${index}`} />
        ) : (
          <Glyph key={`typing-char-${index}`}>{character}</Glyph>
        )
      )}
    </Root>
  );
};

export default TypingText;
