import { basename, dirname, displayPath } from "../shell/filesystem";
import { runTerminalCommand } from "../utils/terminalEvents";
import type { WorkspaceExecutableManifest } from "../utils/workspaceExecutableManifest";
import HighlightedCode from "./HighlightedCode";
import {
  ButtonRow,
  ControlsCard,
  Description,
  ErrorText,
  Hero,
  InfoText,
  Title,
  Wrapper,
} from "./manifestPreviewShared";
import styled from "styled-components";

const ActionButton = styled.button<{ $variant?: "secondary" }>`
  padding: 0.6rem 1rem;
  border-radius: 0.6rem;
  border: 1px solid
    ${({ $variant, theme }) =>
      $variant === "secondary"
        ? `${theme.colors?.text[300]}66`
        : `${theme.colors?.primary}66`};
  background: ${({ $variant, theme }) =>
    $variant === "secondary"
      ? `${theme.colors?.text[300]}12`
      : `${theme.colors?.primary}14`};
  color: ${({ $variant, theme }) =>
    $variant === "secondary" ? theme.colors?.text[100] : theme.colors?.primary};
  font: inherit;
  cursor: pointer;
`;

type Props = {
  error?: string | null;
  manifest: WorkspaceExecutableManifest | null;
  path: string;
  sourceText: string;
};

const ExecutableManifestPreview: React.FC<Props> = ({
  error,
  manifest,
  path,
  sourceText,
}) => {
  const runInProgramDirectory = (command: string) => {
    runTerminalCommand([`cd ${displayPath(dirname(path))}`, command]);
  };

  if (!manifest) {
    return (
      <Wrapper>
        <Hero>
          <Title>Invalid `.exe` Program</Title>
          <Description>
            This file decoded successfully, but its manifest structure is invalid.
          </Description>
          {error ? <ErrorText>{error}</ErrorText> : null}
        </Hero>
        <HighlightedCode code={sourceText} language="json" />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Hero>
        <Title>{manifest.name}</Title>
        {manifest.description ? (
          <Description>{manifest.description}</Description>
        ) : null}
      </Hero>
      <ControlsCard>
        <InfoText>
          Running this file starts a blocking program session. Terminal input is
          routed to the program stdin until the script exits or you press
          <code> Ctrl+C </code>.
        </InfoText>
        <ButtonRow>
          <ActionButton type="button" onClick={() => runInProgramDirectory(`exe ${basename(path)}`)}>
            run program
          </ActionButton>
        </ButtonRow>
      </ControlsCard>
      <HighlightedCode code={sourceText} language="json" />
    </Wrapper>
  );
};

export default ExecutableManifestPreview;
