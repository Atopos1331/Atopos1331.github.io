import { useContext } from "react";
import { workspaceContext } from "../workspace/workspaceStore";
import { User, WebsiteName, Wrapper } from "./styles/TerminalInfo.styled";
import { profile } from "../data/siteContent";

type Props = {
  cwd?: string;
};

export const getDisplayCwd = (cwd: string) =>
  cwd.startsWith(profile.homeDirectory)
    ? cwd.replace(profile.homeDirectory, "~") || "~"
    : cwd;

export const getPromptText = (cwd: string) =>
  `${profile.promptUser}@${profile.promptHost}:${getDisplayCwd(cwd)}$ `;

export const PromptInline: React.FC<Props> = ({ cwd }) => {
  const workspace = useContext(workspaceContext);
  const resolvedCwd = cwd ?? workspace?.cwd ?? profile.homeDirectory;
  const displayCwd = getDisplayCwd(resolvedCwd);

  return (
    <Wrapper>
      <User>{profile.promptUser}</User>@<WebsiteName>{profile.promptHost}</WebsiteName>:
      {displayCwd}$ {" "}
    </Wrapper>
  );
};

const TermInfo = PromptInline;

export default TermInfo;
