import styled from "styled-components";
import { runTerminalCommand } from "../utils/terminalEvents";

const Chip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.08rem 0.45rem;
  border: 1px solid ${({ theme }) => `${theme.colors?.primary}4d`};
  border-radius: 0.45rem;
  background: ${({ theme }) => `${theme.colors?.primary}12`};
  color: ${({ theme }) => theme.colors?.primary};
  font: inherit;
  line-height: inherit;
  cursor: pointer;
  transition:
    background-color 120ms ease,
    border-color 120ms ease,
    transform 120ms ease,
    box-shadow 120ms ease;

  &:hover {
    background: ${({ theme }) => `${theme.colors?.primary}1f`};
    border-color: ${({ theme }) => `${theme.colors?.primary}88`};
    transform: translateY(-1px);
    box-shadow: 0 6px 16px ${({ theme }) => `${theme.colors?.primary}1c`};
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 1px ${({ theme }) => `${theme.colors?.body}cc`},
      0 0 0 3px ${({ theme }) => `${theme.colors?.primary}38`};
  }
`;

type ExecutableCommandProps = {
  children?: React.ReactNode;
  command: string;
  title?: string;
};

const ExecutableCommand: React.FC<ExecutableCommandProps> = ({
  children,
  command,
  title,
}) => {
  return (
    <Chip
      title={title ?? `Run ${command}`}
      type="button"
      onClick={() => runTerminalCommand(command)}
    >
      {children ?? command}
    </Chip>
  );
};

export default ExecutableCommand;
