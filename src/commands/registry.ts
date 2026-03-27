import type { CommandDefinition, CommandGroup } from "./types";
import { base64Command } from "./definitions/base64";
import { backgroundCommand } from "./definitions/background";
import { bashCommand } from "./definitions/bash";
import { catCommand } from "./definitions/cat";
import { cdCommand } from "./definitions/cd";
import { clearCommand } from "./definitions/clear";
import { dateCommand } from "./definitions/date";
import { echoCommand } from "./definitions/echo";
import { emailCommand } from "./definitions/email";
import { exeCommand } from "./definitions/exe";
import { githubCommand } from "./definitions/github";
import { createHelpCommand } from "./definitions/help";
import { historyCommand } from "./definitions/history";
import { layoutCommand } from "./definitions/layout";
import { linkedinCommand } from "./definitions/linkedin";
import { lsCommand } from "./definitions/ls";
import { paceCommand } from "./definitions/pace";
import { pluginCommand } from "./definitions/plugin";
import { previewCommand } from "./definitions/preview";
import { pwdCommand } from "./definitions/pwd";
import { rmCommand } from "./definitions/rm";
import { setCommand } from "./definitions/set";
import { sleepCommand } from "./definitions/sleep";
import { themeCommand } from "./definitions/theme";
import { typingCommand } from "./definitions/typing";
import { unameCommand } from "./definitions/uname";
import { welcomeCommand } from "./definitions/welcome";
import { whoamiCommand } from "./definitions/whoami";
import { xxdCommand } from "./definitions/xxd";

/**
 * Command groups define the stable display order used by the help renderer.
 */
export const commandGroupOrder: CommandGroup[] = [
  "Shell",
  "Files",
  "Workspace",
  "Pages",
  "Links",
];

/**
 * Central command registry composed from self-contained command modules.
 */
export const commandDefinitions: CommandDefinition[] = [
  createHelpCommand(() => commandDefinitions, commandGroupOrder),
  clearCommand,
  dateCommand,
  echoCommand,
  historyCommand,
  rmCommand,
  setCommand,
  sleepCommand,
  unameCommand,
  whoamiCommand,
  cdCommand,
  lsCommand,
  pwdCommand,
  catCommand,
  previewCommand,
  base64Command,
  xxdCommand,
  bashCommand,
  layoutCommand,
  backgroundCommand,
  themeCommand,
  typingCommand,
  paceCommand,
  pluginCommand,
  exeCommand,
  welcomeCommand,
  emailCommand,
  githubCommand,
  linkedinCommand,
];

export const commandDefinitionMap = new Map(
  commandDefinitions.map(definition => [definition.cmd, definition] as const)
);

/**
 * Returns a command definition by command name.
 */
export const getCommandDefinition = (command: string) =>
  commandDefinitionMap.get(command);
