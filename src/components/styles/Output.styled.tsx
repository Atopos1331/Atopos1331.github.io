import styled, { css, keyframes } from "styled-components";
import { prismTokenStyles } from "./prismTokenStyles";

const fadeRise = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.4rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const OutputContainer = styled.div`
  padding-bottom: 0.25rem;
  animation: ${fadeRise} 180ms ease;
`;

export type CommandLabelVariant =
  | "command"
  | "comment"
  | "keyword"
  | "number"
  | "option"
  | "path"
  | "text";

export const Wrapper = styled.div`
  margin-top: 0.25rem;
  margin-bottom: 0.75rem;
`;

export const AccentLine = styled.div`
  color: ${({ theme }) => theme.colors?.primary};
  font-weight: 700;
`;

export const OutputLine = styled.div<{
  $tone?: "normal" | "error" | "muted" | "accent";
}>`
  animation: ${fadeRise} 200ms ease;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: normal;
  font: inherit;
  line-height: inherit;
  font-weight: ${({ $tone }) =>
    $tone === "accent" || $tone === "error" ? 700 : 400};
  color: ${({ $tone, theme }) => {
    if ($tone === "error") {
      return theme.colors?.alert;
    }

    if ($tone === "accent") {
      return theme.colors?.primary;
    }

    if ($tone === "muted") {
      return theme.colors?.text[200];
    }

    return theme.colors?.text[100];
  }};
`;

export const CommandLineText = styled.span`
  display: inline;
  white-space: pre-wrap;
  word-break: inherit;
  overflow-wrap: inherit;
`;

const labelVariantStyles: Record<CommandLabelVariant, ReturnType<typeof css>> = {
  command: css`
    color: ${({ theme }) => theme.colors?.primary};
    font-weight: 700;
  `,
  comment: css`
    color: ${({ theme }) => theme.colors?.text[200]};
  `,
  keyword: css`
    color: ${({ theme }) => theme.colors?.warning};
  `,
  number: css`
    color: ${({ theme }) => theme.colors?.secondary};
  `,
  option: css`
    color: ${({ theme }) => theme.colors?.primary};
  `,
  path: css`
    color: ${({ theme }) => theme.colors?.secondary};
  `,
  text: css`
    color: ${({ theme }) => theme.colors?.text[100]};
  `,
};

export const CommandLabel = styled.span<{ $variant: CommandLabelVariant }>`
  display: inline;
  white-space: inherit;
  word-break: inherit;
  overflow-wrap: inherit;
  ${({ $variant }) => labelVariantStyles[$variant]}
`;

export const FileDump = styled.pre`
  margin-top: 0.5rem;
  font: inherit;
  line-height: inherit;
  color: ${({ theme }) => theme.colors?.text[100]};
  white-space: pre-wrap;
  word-break: break-all;
`;

export const ScriptSourceLine = styled(OutputLine)`
  color: ${({ theme }) => theme.colors?.text[100]};
  font: inherit;
  line-height: inherit;
`;

export const ScriptSourcePrefix = styled.span`
  color: ${({ theme }) => theme.colors?.text[200]};
  display: inline;
  font: inherit;
  line-height: inherit;
  white-space: pre;
  vertical-align: baseline;
`;

export const ScriptSourceCode = styled.code`
  margin: 0;
  padding: 0;
  background: transparent;
  border: 0;
  color: inherit;
  display: inline;
  font: inherit;
  font-size: inherit;
  line-height: inherit;
  white-space: pre-wrap;
  word-break: inherit;
  overflow-wrap: inherit;
  vertical-align: baseline;
  color: ${({ theme }) => theme.colors?.text[100]};

  ${prismTokenStyles}
`;

export const UsageDiv = styled.div<{ marginY?: boolean }>`
  margin-top: ${props => (props.marginY ? "0.75rem" : "0.25rem")};
  margin-bottom: 0.75rem;
  line-height: 1.5rem;
`;
