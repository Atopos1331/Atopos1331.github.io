import ShellSourceLine from "./ShellSourceLine";
import TypingText from "./TypingText";
import { FileDump, OutputLine } from "./styles/Output.styled";
import type { HistoryRuntimeChunk } from "../terminal/terminalContext";

type RuntimeChunkListProps = {
  chunks: HistoryRuntimeChunk[];
  onComplete?: (chunkId: string) => void;
};

const RuntimeChunkList: React.FC<RuntimeChunkListProps> = ({
  chunks,
  onComplete,
}) => {
  return (
    <>
      {chunks.map(chunk => {
        if (chunk.kind === "source") {
          return (
            <ShellSourceLine
              key={chunk.id}
              chunkId={chunk.id}
              onComplete={onComplete}
              preferences={chunk.typingPreferencesSnapshot}
              sourceKind={chunk.sourceKind}
              sourceText={chunk.text}
            />
          );
        }

        return chunk.kind === "line" ? (
          <OutputLine key={chunk.id} $tone={chunk.tone}>
            <TypingText
              onComplete={() => onComplete?.(chunk.id)}
              preferencesOverride={chunk.typingPreferencesSnapshot}
            >
              {chunk.text}
            </TypingText>
          </OutputLine>
        ) : (
          <FileDump key={chunk.id}>
            <TypingText
              onComplete={() => onComplete?.(chunk.id)}
              preferencesOverride={chunk.typingPreferencesSnapshot}
            >
              {chunk.text}
            </TypingText>
          </FileDump>
        );
      })}
    </>
  );
};

export default RuntimeChunkList;
