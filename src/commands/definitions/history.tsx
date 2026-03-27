import { useContext } from "react";
import { Wrapper } from "../../components/styles/Output.styled";
import { termContext } from "../../terminal/terminalContext";
import { defineCommand } from "../helpers";

/**
 * Renders the visible terminal history up to the current entry.
 */
const HistoryOutput: React.FC = () => {
  const { entries, index } = useContext(termContext);
  const currentHistory = entries
    .slice(0, index + 1)
    .filter(entry => entry.source === "user" && entry.input.trim().length > 0);

  return (
    <Wrapper data-testid="history">
      {currentHistory.map(cmd => (
        <div key={cmd.id}>{cmd.input}</div>
      ))}
    </Wrapper>
  );
};

export const historyCommand = defineCommand({
  name: "history",
  desc: "view command history",
  group: "Shell",
  render: HistoryOutput,
  tab: 6,
});
