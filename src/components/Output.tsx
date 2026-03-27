import { OutputContainer } from "./styles/Output.styled";
import { termContext } from "../terminal/terminalContext";
import { useContext } from "react";
import { getCommandDefinition } from "../commands/specs";
import RuntimeChunkList from "./RuntimeChunkList";
import TypingText from "./TypingText";
import { OutputLine } from "./styles/Output.styled";

type Props = {
  cmd: string;
  isLatest?: boolean;
};

const Output: React.FC<Props> = ({ cmd, isLatest = false }) => {
  const { completeRuntimeChunk, entry } = useContext(termContext);
  const commandDefinition = getCommandDefinition(cmd);

  const chunks = entry.runtimeState?.chunks ?? [];
  const shouldRenderCommand = entry.ready && !!commandDefinition?.render;
  const RenderCommand = commandDefinition?.render;

  return (
    <OutputContainer data-testid={isLatest ? "latest-output" : null}>
      {/* Runtime chunks cover streamed command output such as shell lines and script source. */}
      {chunks.length > 0 && (
        <RuntimeChunkList chunks={chunks} onComplete={completeRuntimeChunk} />
      )}
      {/* Render commands are used for static panels such as welcome/help/history. */}
      {shouldRenderCommand && RenderCommand ? <RenderCommand /> : null}
      {entry.terminationMessage ? (
        <OutputLine $tone="error">
          <TypingText instant>{entry.terminationMessage}</TypingText>
        </OutputLine>
      ) : null}
    </OutputContainer>
  );
};

export default Output;
