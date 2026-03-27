import { useEffect, useMemo, useState } from "react";
import type { TypingPreferences } from "../utils/typingPreferences";
import ShellCommandText from "./ShellCommandText";
import {
  ScriptSourceLine,
  ScriptSourcePrefix,
} from "./styles/Output.styled";

const sourcePrefixText = "+ ";

const toCharacters = (value: string) => Array.from(value);

type ShellSourceLineProps = {
  chunkId: string;
  onComplete?: (chunkId: string) => void;
  preferences: TypingPreferences;
  sourceKind?: "blank" | "comment" | "command";
  sourceText: string;
};

const ShellSourceLine: React.FC<ShellSourceLineProps> = ({
  chunkId,
  onComplete,
  preferences,
  sourceKind,
  sourceText,
}) => {
  const characters = useMemo(
    () => [...toCharacters(sourcePrefixText), ...toCharacters(sourceText)],
    [sourceText]
  );
  const [visibleLength, setVisibleLength] = useState(
    preferences.enabled ? 0 : characters.length
  );
  const prefixLength = toCharacters(sourcePrefixText).length;
  const visiblePrefix = useMemo(
    () => characters.slice(0, Math.min(visibleLength, prefixLength)).join(""),
    [characters, prefixLength, visibleLength]
  );
  const visibleSourceLength = Math.max(0, visibleLength - prefixLength);
  const visibleSourceText = useMemo(
    () => toCharacters(sourceText).slice(0, visibleSourceLength).join(""),
    [sourceText, visibleSourceLength]
  );

  useEffect(() => {
    if (!preferences.enabled) {
      setVisibleLength(characters.length);
      onComplete?.(chunkId);
      return;
    }

    setVisibleLength(0);
    const timer = window.setInterval(() => {
      setVisibleLength(previousLength => {
        const nextLength = Math.min(previousLength + 1, characters.length);

        if (nextLength >= characters.length) {
          window.clearInterval(timer);
          onComplete?.(chunkId);
        }

        return nextLength;
      });
    }, preferences.speedMs);

    return () => window.clearInterval(timer);
  }, [
    characters.length,
    chunkId,
    onComplete,
    preferences.enabled,
    preferences.speedMs,
  ]);

  return (
    <ScriptSourceLine
      $tone="normal"
      aria-label={`${sourcePrefixText}${sourceText}`}
      data-source-kind={sourceKind}
      data-testid="sh-source-line"
    >
      <ScriptSourcePrefix>{visiblePrefix || "\u00A0"}</ScriptSourcePrefix>
      <ShellCommandText input={visibleSourceText} />
    </ScriptSourceLine>
  );
};

export default ShellSourceLine;
