import React, { useMemo } from "react";
import Output from "./Output";
import CommandLine from "./CommandLine";
import { EntryTypingProvider } from "./TypingText";
import {
  BottomSpacer,
  CmdNotFound,
  ContentFlow,
  Empty,
  Entry,
  Form,
  Hints,
  Input,
  InputDisplay,
  InputShell,
  ProgramInputDisplay,
  ProgramInputShell,
  PromptLine,
  Viewport,
  Wrapper,
} from "./styles/Terminal.styled";
import { shellRootPath } from "../shell/filesystem";
import { parseShellInput } from "../utils/shellRuntime";
import { termContext } from "../terminal/terminalContext";
import { useTerminalController } from "../terminal/useTerminalController";

/**
 * Terminal is now a thin rendering shell around the dedicated terminal hooks.
 */
const Terminal = () => {
  const {
    currentPromptText,
    execution,
    handleKeyDown,
    handleSubmit,
    input,
    viewport,
    workspace,
  } = useTerminalController();

  const renderedEntries = useMemo(
    () =>
      execution.entries.map((entry, index) => {
        const commandArray = splitCommand(entry.input);
        const contextValue = {
          arg: commandArray.slice(1),
          entries: execution.entries,
          entry,
          index,
          submissionId: execution.submissionId,
          clearHistory: execution.clearHistory,
          completeRuntimeChunk: execution.completeRuntimeChunk,
        };

        return (
          <Entry key={entry.id}>
            <PromptLine>
              <CommandLine
                cwd={entry.cwd}
                dataTestId="input-command"
                input={entry.input}
              />
            </PromptLine>
            {commandArray[0] === "" ? (
              <Empty />
            ) : (
              <EntryTypingProvider
                enabled={entry.typingPreferencesSnapshot.enabled}
                entryId={entry.id}
                onStateChange={execution.handleEntryTypingStateChange}
                speedMs={entry.typingPreferencesSnapshot.speedMs}
              >
                {/* Output renderers only receive the narrow entry context they actually need. */}
                <termContext.Provider value={contextValue}>
                  <Output
                    cmd={commandArray[0]}
                    isLatest={index === execution.entries.length - 1}
                  />
                </termContext.Provider>
              </EntryTypingProvider>
            )}
            {execution.isProgramSessionActive &&
            execution.activeProgramSessionEntryId === entry.id ? (
              <Form key={`program-input-${entry.id}`} onSubmit={handleSubmit}>
                <ProgramInputShell>
                  <ProgramInputDisplay aria-hidden="true">
                    {input.inputVal || "\u00A0"}
                  </ProgramInputDisplay>
                  <Input
                    title="terminal-input"
                    id="terminal-input"
                    autoComplete="off"
                    spellCheck="false"
                    autoFocus
                    autoCapitalize="off"
                    ref={viewport.inputRef}
                    value={input.inputVal}
                    onKeyDown={handleKeyDown}
                    onChange={input.handleProgramTextAreaChange}
                    rows={1}
                  />
                </ProgramInputShell>
              </Form>
            ) : null}
          </Entry>
        );
      }),
    [execution, handleKeyDown, handleSubmit, input.handleProgramTextAreaChange, input.inputVal, viewport.inputRef]
  );

  return (
    <Wrapper
      data-testid="terminal-wrapper"
      onClick={viewport.handleWrapperClick}
    >
      <Viewport
        data-testid="terminal-viewport"
        onScroll={viewport.handleScroll}
        ref={viewport.containerRef}
      >
        <ContentFlow ref={viewport.contentRef}>
          {renderedEntries}

          {workspace?.terminalNotice && (
            <CmdNotFound data-testid="terminal-notice">
              {workspace.terminalNotice}
            </CmdNotFound>
          )}

          {input.hints.length > 1 && (
            <div>
              {input.hints.map(hint => (
                <Hints key={hint}>{hint}</Hints>
              ))}
            </div>
          )}

          {!execution.isInputLocked && !execution.isProgramSessionActive && (
            <Form key={`prompt-${execution.submissionId}`} onSubmit={handleSubmit}>
              <InputShell>
                <InputDisplay aria-hidden="true">
                  <CommandLine cwd={workspace?.cwd ?? shellRootPath} input={input.inputVal} />
                </InputDisplay>
                <Input
                  title="terminal-input"
                  id="terminal-input"
                  autoComplete="off"
                  spellCheck="false"
                  autoFocus
                  autoCapitalize="off"
                  ref={viewport.inputRef}
                  value={`${currentPromptText}${input.inputVal}`}
                  onKeyDown={handleKeyDown}
                  onChange={input.handleTextAreaChange}
                  onClick={viewport.clampSelectionToPrompt}
                  onFocus={viewport.clampSelectionToPrompt}
                  onSelect={viewport.clampSelectionToPrompt}
                  rows={1}
                />
              </InputShell>
            </Form>
          )}
          <BottomSpacer />
        </ContentFlow>
      </Viewport>
    </Wrapper>
  );
};

/**
 * Splits a shell input into command tokens.
 */
const splitCommand = (value: string) => {
  const { tokens } = parseShellInput(value);
  return tokens.length === 0 ? [""] : tokens;
};

export default Terminal;
