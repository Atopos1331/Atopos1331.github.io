import styled, { css, keyframes } from "styled-components";
import { panelSurface } from "./panelSurface";

const fadeRise = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.45rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Wrapper = styled.div`
  ${panelSurface}

  height: 100%;
  min-height: 0;
  padding: 0.82rem 1rem 0.44rem 1.08rem;
  font-family: "IBM Plex Mono", monospace;
  line-height: 1.5rem;
`;

export const Viewport = styled.div`
  min-height: 0;
  height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  scroll-padding-top: 0.34rem;
  scroll-padding-bottom: 0.16rem;
  padding-right: 0.22rem;
`;

export const ContentFlow = styled.div`
  box-sizing: border-box;
  min-height: 100%;
  padding-top: 0.2rem;
  padding-bottom: 0.16rem;
`;

export const CmdNotFound = styled.div`
  margin-top: 0.25rem;
  margin-bottom: 1rem;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: normal;
  animation: ${fadeRise} 180ms ease;
  color: ${({ theme }) => theme.colors?.alert};
  font-weight: 700;
`;

export const Empty = styled.div`
  margin-bottom: 0.25rem;
`;

export const Form = styled.form`
  width: 100%;
  animation: ${fadeRise} 180ms ease;
`;

export const Entry = styled.div`
  padding: 0.15rem 0 0.4rem;
  animation: ${fadeRise} 220ms ease;
`;

export const PromptLine = styled.div`
  display: block;
  width: 100%;
  min-width: 0;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: normal;
`;

export const PromptPrefix = styled.span`
  display: inline;
  white-space: nowrap;
  word-break: normal;
  overflow-wrap: normal;
`;

export const InputShell = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
`;

export const ProgramInputShell = styled(InputShell)`
  margin-top: 0.3rem;
  padding-left: 0.05rem;
`;

export const InputDisplay = styled.div`
  min-height: 1.5rem;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: normal;
  pointer-events: none;
`;

export const ProgramInputDisplay = styled(InputDisplay)`
  color: ${({ theme }) => theme.colors?.text[100]};
`;

export const Input = styled.textarea`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  resize: none;
  overflow: hidden;
  caret-color: ${({ theme }) => theme.colors?.primary};
  font: inherit;
  line-height: inherit;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: normal;
  background-color: transparent;
  color: transparent;
  -webkit-text-fill-color: transparent;

  &:focus {
    outline: none;
  }
`;

export const Hints = styled.span`
  display: inline-flex;
  align-items: center;
  margin-right: 0.875rem;
  padding: 0.2rem 0.55rem;
  border: 1px solid ${({ theme }) => `${theme.colors?.text[300]}35`};
  border-radius: 999px;
  background: ${({ theme }) => `${theme.colors?.body}94`};
  animation: ${fadeRise} 180ms ease;
`;

export const InputDock = styled.div<{ $hidden?: boolean }>`
  ${({ $hidden }) =>
    $hidden &&
    css`
      display: none;
    `}
`;

export const BottomSpacer = styled.div`
  height: 0.12rem;
  flex: 0 0 auto;
`;
