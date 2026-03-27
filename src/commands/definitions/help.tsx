import { useContext } from "react";
import {
  Cmd,
  CmdDesc,
  CmdDetail,
  CmdHead,
  CmdList,
  DetailBody,
  DetailCard,
  DetailHeader,
  DetailHint,
  DetailTitle,
  HelpGroup,
  HelpGroupTitle,
  HelpWrapper,
  KeyContainer,
} from "../../components/styles/Help.styled";
import { termContext } from "../../terminal/terminalContext";
import { defineCommand } from "../helpers";
import type { CommandDefinition, CommandGroup } from "../types";

type HelpEntry = {
  details: readonly string[];
  summary: string;
};

const helpEntries: Record<string, HelpEntry> = {
  background: {
    summary: "switch wallpaper, overlay opacity, and blur",
    details: [
      "background -> usage",
      "background <none | image-path> [opacity 0-100] [blur 0-40]",
      "background opacity <0-100>",
      "background blur <0-40>",
    ],
  },
  base64: {
    summary: "encode a file from the shell filesystem as base64",
    details: ["base64 <file>"],
  },
  bash: {
    summary: "run a shell script from the virtual filesystem",
    details: ["bash <file.sh>"],
  },
  cat: {
    summary: "print a file from the shell filesystem",
    details: ["cat <file>"],
  },
  cd: {
    summary: "change current directory",
    details: ["cd <directory>"],
  },
  clear: {
    summary: "clear the terminal",
    details: ["clear"],
  },
  date: {
    summary: "print the current UTC date",
    details: ["date"],
  },
  echo: {
    summary: "print out anything",
    details: ["echo <text ...>"],
  },
  email: {
    summary: "send an email to me",
    details: ["email"],
  },
  exe: {
    summary: "run a blocking .exe program session: exe <file.exe>",
    details: ["exe <file.exe>"],
  },
  github: {
    summary: "open my GitHub profile in a new tab",
    details: ["github"],
  },
  help: {
    summary: "check available commands; use help <command> for details",
    details: ["help", "help <command>"],
  },
  history: {
    summary: "view command history",
    details: ["history"],
  },
  layout: {
    summary: "switch layout: split | terminal | preview",
    details: ["layout -> usage", "layout <split | terminal | preview>"],
  },
  linkedin: {
    summary: "open my LinkedIn profile in a new tab",
    details: ["linkedin"],
  },
  ls: {
    summary: "list files in the current directory",
    details: ["ls", "ls <directory>"],
  },
  pace: {
    summary: "set delay between commands in ms",
    details: ["pace -> view current status + usage", "pace <ms | off>"],
  },
  plugin: {
    summary:
      "manage .plg workspace plugins: plugin <file> [key=value] | plugin detail [file] | plugin decode <file>",
    details: [
      "plugin <file> [key=value]",
      "plugin detail [file]",
      "plugin decode <file>",
    ],
  },
  preview: {
    summary: "preview a file from the shell filesystem",
    details: ["preview -> usage", "preview <file>"],
  },
  pwd: {
    summary: "print current working directory",
    details: ["pwd"],
  },
  rm: {
    summary: "rm would not work, but rm -rf / would trigger the Easter egg",
    details: ["rm -rf /"],
  },
  set: {
    summary: "toggle shell options: set -v | set +v",
    details: ["set", "set -v", "set +v"],
  },
  sleep: {
    summary: "wait for a number of seconds",
    details: ["sleep <seconds>"],
  },
  theme: {
    summary: "list themes or switch with: theme <name>",
    details: ["theme -> list themes + usage", "theme <theme>"],
  },
  typing: {
    summary: "set per-character output speed: typing <0 | speed-ms>",
    details: ["typing -> view current status + usage", "typing <0 | ms>"],
  },
  uname: {
    summary: "print the operating system name",
    details: ["uname"],
  },
  welcome: {
    summary: "display hero section",
    details: ["welcome"],
  },
  whoami: {
    summary: "about current user",
    details: ["whoami"],
  },
  xxd: {
    summary: "render a file as hex dump",
    details: ["xxd <file>"],
  },
};

const getHelpEntry = (definition: CommandDefinition): HelpEntry => {
  const override = helpEntries[definition.cmd];

  if (override) {
    return override;
  }

  return {
    details:
      definition.helpLines && definition.helpLines.length > 0
        ? definition.helpLines
        : [definition.cmd],
    summary: definition.desc,
  };
};

const HelpCommandDetail: React.FC<{ definition: CommandDefinition }> = ({
  definition,
}) => {
  const helpEntry = getHelpEntry(definition);

  return (
    <DetailCard>
      <DetailHeader>
        <DetailTitle>
          <Cmd>{definition.cmd}</Cmd>
          <CmdDesc>{helpEntry.summary}</CmdDesc>
        </DetailTitle>
      </DetailHeader>
      <DetailBody>
        {helpEntry.details.map(line => (
          <CmdDetail key={`${definition.cmd}-${line}`}>{line}</CmdDetail>
        ))}
      </DetailBody>
      <DetailHint>Run `help` to see the full command index.</DetailHint>
    </DetailCard>
  );
};

export const createHelpCommand = (
  getCommandDefinitions: () => CommandDefinition[],
  commandGroupOrder: CommandGroup[]
) => {
  const RenderHelp: React.FC = () => {
    const { arg } = useContext(termContext);
    const commandDefinitions = getCommandDefinitions();
    const targetCommand = arg[0];
    const targetDefinition = targetCommand
      ? commandDefinitions.find(command => command.cmd === targetCommand)
      : undefined;

    if (arg.length > 1) {
      return (
        <HelpWrapper data-testid="help">
          <DetailCard>
            <DetailHeader>
              <DetailTitle>
                <Cmd>help</Cmd>
                <CmdDesc>check available commands</CmdDesc>
              </DetailTitle>
            </DetailHeader>
            <DetailBody>
              <CmdDetail>help</CmdDetail>
              <CmdDetail>help &lt;command&gt;</CmdDetail>
            </DetailBody>
            <DetailHint>Usage: help [command]</DetailHint>
          </DetailCard>
        </HelpWrapper>
      );
    }

    if (targetCommand && !targetDefinition) {
      return (
        <HelpWrapper data-testid="help">
          <DetailCard>
            <DetailHeader>
              <DetailTitle>
                <Cmd>help</Cmd>
                <CmdDesc>check available commands</CmdDesc>
              </DetailTitle>
            </DetailHeader>
            <DetailHint>{`help: unknown command: ${targetCommand}`}</DetailHint>
          </DetailCard>
        </HelpWrapper>
      );
    }

    if (targetDefinition) {
      return (
        <HelpWrapper data-testid="help">
          <HelpCommandDetail definition={targetDefinition} />
        </HelpWrapper>
      );
    }

    return (
      <HelpWrapper data-testid="help">
        {commandGroupOrder.map(group => {
          const groupCommands = commandDefinitions.filter(
            command => command.group === group
          );

          if (groupCommands.length === 0) {
            return null;
          }

          return (
            <HelpGroup key={group}>
              <HelpGroupTitle>{group}</HelpGroupTitle>
              {groupCommands.map(command => {
                const helpEntry = getHelpEntry(command);

                return (
                  <CmdList key={command.cmd}>
                    <CmdHead>
                      <Cmd>{command.cmd}</Cmd>
                      <CmdDesc>{helpEntry.summary}</CmdDesc>
                    </CmdHead>
                  </CmdList>
                );
              })}
            </HelpGroup>
          );
        })}
        <KeyContainer>
          <div>Tab or Ctrl + i {"->"} autocomplete</div>
          <div>Up Arrow {"->"} previous command</div>
          <div>Ctrl + c {"->"} stop the current command</div>
          <div>Ctrl + l {"->"} clear the terminal</div>
        </KeyContainer>
      </HelpWrapper>
    );
  };

  return defineCommand({
    name: "help",
    desc: "check available commands",
    autocomplete: ({ activeArgIndex, activeToken }) =>
      activeArgIndex === 0
        ? getCommandDefinitions()
            .map(definition => definition.cmd)
            .filter(command => command.startsWith(activeToken))
        : [],
    group: "Shell",
    helpLines: ["help", "help <command>"],
    locksForTyping: false,
    render: RenderHelp,
    tab: 9,
  });
};
