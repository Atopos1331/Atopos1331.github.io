import { profile } from "../../data/siteContent";
import ExecutableCommand from "../../components/ExecutableCommand";
import {
  HeroContainer,
  Link,
  PreName,
  PreNameMobile,
  PreWrapper,
  WelcomeBlock,
  WelcomeLabel,
  WelcomeLead,
  WelcomeMuted,
} from "../../components/styles/Welcome.styled";
import { defineCommand } from "../helpers";

const desktopLogo = String.raw`
███████╗ █████╗ ███████╗ ██████╗  ██████╗
██╔════╝██╔══██╗██╔════╝██╔═══██╗██╔═══██╗
█████╗  ███████║█████╗  ██║   ██║██║   ██║
██╔══╝  ██╔══██║██╔══╝  ██║   ██║██║   ██║
███████╗██║  ██║██║     ╚██████╔╝╚██████╔╝
╚══════╝╚═╝  ╚═╝╚═╝      ╚═════╝  ╚═════╝
`;

const mobileLogo = String.raw`
███████╗ █████╗ ███████╗ ██████╗  ██████╗
██╔════╝██╔══██╗██╔════╝██╔═══██╗██╔═══██╗
█████╗  ███████║█████╗  ██║   ██║██║   ██║
██╔══╝  ██╔══██║██╔══╝  ██║   ██║██║   ██║
███████╗██║  ██║██║     ╚██████╔╝╚██████╔╝
╚══════╝╚═╝  ╚═╝╚═╝      ╚═════╝  ╚═════╝
`;

/**
 * Renders the landing panel shown by the `welcome` command.
 */
const WelcomeOutput: React.FC = () => {
  return (
    <HeroContainer data-testid="welcome">
      <PreName data-glow={desktopLogo}>{desktopLogo}</PreName>
      <PreWrapper>
        <PreNameMobile data-glow={mobileLogo}>{mobileLogo}</PreNameMobile>
      </PreWrapper>

      <WelcomeLead>
        <WelcomeLabel>System Initialized</WelcomeLabel>
        <WelcomeMuted> — welcome to the interactive terminal portfolio of CHEN Yifu (Eafoo).</WelcomeMuted>
      </WelcomeLead>

      <WelcomeBlock>
        To launch the guided walkthrough, execute:{" "}
        <ExecutableCommand command="bash ~/scripts/welcome.sh">
          bash ~/scripts/welcome.sh
        </ExecutableCommand>
        <WelcomeMuted>.</WelcomeMuted>
      </WelcomeBlock>

      <WelcomeBlock>
        <WelcomeLabel>Explore</WelcomeLabel><WelcomeMuted>:</WelcomeMuted> Start with basic navigation using{" "}
        <ExecutableCommand command="ls">ls</ExecutableCommand> and{" "}
        <ExecutableCommand command="cd ~/profile">cd ~/profile</ExecutableCommand>
        <WelcomeMuted>.</WelcomeMuted>
      </WelcomeBlock>

      <WelcomeBlock>
        <WelcomeLabel>Profiles</WelcomeLabel><WelcomeMuted>:</WelcomeMuted> Render the terminal bio via{" "}
        <ExecutableCommand command="preview ~/profile/about.md">
          preview ~/profile/about.md
        </ExecutableCommand>{" "}
        or the GUI version via{" "}
        <ExecutableCommand command="preview ~/profile.html">
          preview ~/profile.html
        </ExecutableCommand>
        <WelcomeMuted>.</WelcomeMuted>
      </WelcomeBlock>

      <WelcomeBlock>
        <WelcomeLabel>Advanced</WelcomeLabel><WelcomeMuted>:</WelcomeMuted> Deploy a UI plugin using{" "}
        <ExecutableCommand command="plugin ~/plugins/music-card.plg">
          plugin ~/plugins/music-card.plg
        </ExecutableCommand>{" "}
        or run a CTF challenge via{" "}
        <ExecutableCommand command="exe ~/ctf/flag-checker.exe">
          exe ~/ctf/flag-checker.exe
        </ExecutableCommand>
        <WelcomeMuted>.</WelcomeMuted>
      </WelcomeBlock>

      <WelcomeBlock>
        <WelcomeLabel>Help</WelcomeLabel><WelcomeMuted>:</WelcomeMuted> Run{" "}
        <ExecutableCommand command="help">help</ExecutableCommand> to view all supported utilities and workspace parameters.
      </WelcomeBlock>

      <WelcomeBlock>
        <WelcomeLabel>Uplinks</WelcomeLabel><WelcomeMuted>:</WelcomeMuted>{" "}
        <Link href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</Link> <WelcomeMuted>|</WelcomeMuted>{" "}
        <Link href={profile.githubUrl} target="_blank" rel="noreferrer">GitHub</Link> <WelcomeMuted>|</WelcomeMuted>{" "}
        <Link href="mailto:ychennc@connect.ust.hk">Email</Link>
      </WelcomeBlock>
    </HeroContainer>
  );
};

export const welcomeCommand = defineCommand({
  name: "welcome",
  desc: "display hero section",
  group: "Pages",
  render: WelcomeOutput,
  tab: 6,
});