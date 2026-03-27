import { PromptInline } from "./TermInfo";
import ShellCommandText from "./ShellCommandText";

type Props = {
  cwd?: string;
  dataTestId?: string;
  input: string;
};

const CommandLine: React.FC<Props> = ({ cwd, dataTestId, input }) => {
  return (
    <ShellCommandText
      dataTestId={dataTestId}
      input={input}
      leading={cwd ? <PromptInline cwd={cwd} /> : null}
    />
  );
};

export default CommandLine;
