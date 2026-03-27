import type { ReactNode } from "react";
import { parseShellInput } from "../utils/shellRuntime";
import { isShellPathArgument } from "../utils/shellCommandMetadata";
import {
  CommandLabel,
  CommandLineText,
  type CommandLabelVariant,
} from "./styles/Output.styled";

const keywordTokens = new Set([
  "current",
  "decode",
  "detail",
  "go",
  "set",
  "split",
  "left",
  "right",
]);

const getVariant = (
  token: string,
  index: number,
  command?: string,
  previousToken?: string
): CommandLabelVariant => {
  if (index === 0) {
    return "command";
  }

  if (command === "plugin" && index === 1 && keywordTokens.has(token)) {
    return "keyword";
  }

  if (
    command === "plugin" &&
    index === 2 &&
    (previousToken === "current" ||
      previousToken === "decode" ||
      previousToken === "detail")
  ) {
    return "path";
  }

  if (token.startsWith("-") || token.startsWith("+")) {
    return "option";
  }

  if (/^\d+(\.\d+)?$/.test(token)) {
    return "number";
  }

  if (command && isShellPathArgument(command, index - 1)) {
    return "path";
  }

  if (keywordTokens.has(token)) {
    return "keyword";
  }

  if (
    token.includes("/") ||
    token.startsWith("~") ||
    token.startsWith(".") ||
    /\.[a-z0-9]+$/i.test(token)
  ) {
    return "path";
  }

  return "text";
};

type ShellCommandTextProps = {
  dataTestId?: string;
  leading?: ReactNode;
  input: string;
};

const ShellCommandText: React.FC<ShellCommandTextProps> = ({
  dataTestId,
  leading,
  input,
}) => {
  const { comment, content } = parseShellInput(input);
  const segments = content.match(/\s+|\S+/g) ?? [];
  let tokenIndex = 0;
  let commandToken: string | undefined;
  let previousToken: string | undefined;

  if (segments.length === 0 && comment === "" && !leading) {
    return null;
  }

  return (
    <CommandLineText data-testid={dataTestId}>
      {leading}
      {segments.map((segment, index) => {
        if (/^\s+$/.test(segment)) {
          return <span key={`space-${index}`}>{segment}</span>;
        }

        if (tokenIndex === 0) {
          commandToken = segment;
        }
        const variant = getVariant(segment, tokenIndex, commandToken, previousToken);
        previousToken = segment;
        tokenIndex += 1;

        return (
          <CommandLabel key={`${segment}-${index}`} $variant={variant}>
            {segment}
          </CommandLabel>
        );
      })}
      {comment && (
        <CommandLabel $variant="comment" key="comment">
          {comment}
        </CommandLabel>
      )}
    </CommandLineText>
  );
};

export default ShellCommandText;
