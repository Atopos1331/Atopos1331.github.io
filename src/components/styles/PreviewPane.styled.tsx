import styled, { css, keyframes } from "styled-components";
import { prismTokenStyles } from "./prismTokenStyles";
import { panelSurface } from "./panelSurface";

const emphasisScrollbar = css`
  scrollbar-color: ${({ theme }) => `${theme.colors?.primary}cc transparent`};

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: ${({ theme }) => `${theme.colors?.primary}b8`};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => `${theme.colors?.primary}e0`};
  }
`;

const getPreviewControlHoverBackground = (themeName?: string, primary?: string) => {
  if (!primary) {
    return "rgba(148, 163, 184, 0.25)";
  }

  switch (themeName) {
    case "dark":
      return `${primary}44`;
    case "light":
      return `${primary}26`;
    case "blue-matrix":
      return `${primary}38`;
    case "espresso":
      return `${primary}30`;
    case "green-goblin":
      return `${primary}30`;
    case "ubuntu":
      return `${primary}32`;
    default:
      return `${primary}2e`;
  }
};

const fadeRise = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const PreviewShell = styled.section`
  ${panelSurface}

  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  animation: ${fadeRise} 220ms ease;
`;

export const ForcedPreviewShell = styled.section`
  ${panelSurface}
  ${emphasisScrollbar}

  height: 100%;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  padding: 1.75rem;
  animation: ${fadeRise} 220ms ease;
`;

export const ForcedPreviewName = styled.div`
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.primary};
  word-break: break-word;
  overflow-wrap: anywhere;
`;

export const PreviewHeader = styled.header`
  position: relative;
  padding: 1.1rem 1.4rem;
  display: grid;
  grid-template-columns: 1fr minmax(0, 34rem) 1fr;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid ${({ theme }) => `${theme.colors?.primary}36`};
  background:
    linear-gradient(
      180deg,
      ${({ theme }) => `${theme.colors?.primary}10`},
      ${({ theme }) => `${theme.colors?.body}30`}
    );
  box-shadow:
    inset 0 -1px 0 ${({ theme }) => `${theme.colors?.text[300]}16`},
    inset 0 1px 0 ${({ theme }) => `${theme.colors?.primary}10`};
  animation: ${fadeRise} 220ms ease;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const HeaderSpacer = styled.div`
  min-width: 0;

  @media (max-width: 640px) {
    display: none;
  }
`;

export const DocMeta = styled.div`
  min-width: 0;
  padding: 0.7rem 1rem;
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => `${theme.colors?.primary}32`};
  background:
    linear-gradient(
      180deg,
      ${({ theme }) => `${theme.colors?.body}46`},
      ${({ theme }) => `${theme.colors?.body}30`}
    );
  text-align: center;
  justify-self: center;
  box-shadow:
    inset 0 1px 0 ${({ theme }) => `${theme.colors?.primary}12`},
    0 8px 18px rgba(3, 10, 18, 0.08);
`;

export const PreviewEyebrow = styled.div`
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors?.text[300]};
`;

export const DocName = styled.div`
  margin-top: 0.35rem;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors?.primary};
  word-break: break-word;
  overflow-wrap: anywhere;
`;

export const ControlGroup = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  justify-self: end;

  @media (max-width: 640px) {
    justify-self: center;
  }
`;

export const PreviewActionBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 0 0 1rem;
`;

export const PreviewActionButton = styled.button`
  padding: 0.55rem 0.95rem;
  border: 1px solid ${({ theme }) => `${theme.colors?.primary}66`};
  border-radius: 0.7rem;
  background: ${({ theme }) => `${theme.colors?.primary}12`};
  color: ${({ theme }) => theme.colors?.primary};
  font: inherit;
  line-height: inherit;
  cursor: pointer;
  transition:
    background-color 120ms ease,
    color 120ms ease,
    border-color 120ms ease,
    transform 120ms ease,
    box-shadow 120ms ease;

  &:hover {
    background: ${({ theme }) => `${theme.colors?.primary}24`};
    border-color: ${({ theme }) => `${theme.colors?.primary}AA`};
    transform: translateY(-1px);
    box-shadow: 0 10px 24px ${({ theme }) => `${theme.colors?.primary}18`};
  }

  &:focus-visible {
    outline: 1px solid ${({ theme }) => theme.colors?.primary};
    outline-offset: 2px;
  }
`;

export const ControlButton = styled.button<{ $variant?: "default" | "close" }>`
  position: relative;
  width: 2.9rem;
  height: 2.35rem;
  padding: 0;
  border: 1px solid ${({ theme }) => `${theme.colors?.primary}3a`};
  border-radius: 0.8rem;
  background: ${({ theme }) => `${theme.colors?.body}32`};
  color: ${({ theme }) => theme.colors?.text[100]};
  font-family: inherit;
  cursor: pointer;
  transition:
    color 120ms ease,
    background-color 120ms ease,
    border-color 120ms ease,
    transform 120ms ease,
    box-shadow 120ms ease;

  &:hover {
    background-color: ${({ $variant, theme }) =>
      $variant === "close"
        ? theme.colors?.alert
        : getPreviewControlHoverBackground(theme.name, theme.colors?.primary)};
    border-color: ${({ $variant, theme }) =>
      $variant === "close" ? theme.colors?.alert : `${theme.colors?.primary}44`};
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px ${({ theme }) => `${theme.colors?.primary}16`};
  }

  &:focus-visible {
    outline: 1px solid ${({ theme }) => theme.colors?.primary};
    outline-offset: 1px;
  }
`;

export const ControlIcon = styled.span<{ $kind: "maximize" | "restore" | "close" }>`
  position: absolute;
  inset: 0;
  display: block;

  &::before,
  &::after {
    content: "";
    position: absolute;
    box-sizing: border-box;
  }

  ${({ $kind }) =>
    $kind === "maximize"
      ? `
        &::before {
          left: 50%;
          top: 50%;
          width: 0.85rem;
          height: 0.7rem;
          border: 1.5px solid currentColor;
          transform: translate(-50%, -50%);
        }
      `
      : ""}

  ${({ $kind }) =>
    $kind === "restore"
      ? `
        &::before {
          left: calc(50% - 0.1rem);
          top: calc(50% - 0.38rem);
          width: 0.7rem;
          height: 0.58rem;
          border: 1.5px solid currentColor;
          background: transparent;
        }

        &::after {
          left: calc(50% - 0.42rem);
          top: calc(50% - 0.08rem);
          width: 0.7rem;
          height: 0.58rem;
          border: 1.5px solid currentColor;
          background: transparent;
        }
      `
      : ""}

  ${({ $kind }) =>
    $kind === "close"
      ? `
        &::before,
        &::after {
          left: 50%;
          top: 50%;
          width: 0.9rem;
          border-top: 1.5px solid currentColor;
          transform-origin: center;
        }

        &::before {
          transform: translate(-50%, -50%) rotate(45deg);
        }

        &::after {
          transform: translate(-50%, -50%) rotate(-45deg);
        }
      `
      : ""}
`;

export const TabBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  padding: 0.9rem 1.35rem 0;
  border-bottom: 1px solid ${({ theme }) => `${theme.colors?.primary}36`};
  background: ${({ theme }) => `${theme.colors?.body}2e`};
`;

export const PreviewTab = styled.button<{ $active?: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.48rem 0.78rem;
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? `${theme.colors?.primary}7a` : `${theme.colors?.text[300]}78`};
  border-bottom-width: 0;
  border-radius: 0.8rem 0.8rem 0 0;
  background: ${({ $active, theme }) =>
    $active ? `${theme.colors?.body}66` : `${theme.colors?.body}24`};
  color: ${({ $active, theme }) =>
    $active ? theme.colors?.primary : theme.colors?.text[200]};
  box-shadow: ${({ $active, theme }) =>
    $active ? `inset 0 1px 0 ${theme.colors?.primary}18` : "none"};
  cursor: pointer;
  transition:
    color 140ms ease,
    background-color 140ms ease,
    transform 140ms ease,
    border-color 140ms ease,
    box-shadow 140ms ease;

  &::after {
    content: "";
    position: absolute;
    left: -1px;
    right: -1px;
    bottom: -1px;
    height: 0.9rem;
    border-left: 1px solid ${({ theme }) => `${theme.colors?.primary}26`};
    border-right: 1px solid ${({ theme }) => `${theme.colors?.primary}26`};
    background: ${({ theme }) => `${theme.colors?.body}36`};
    opacity: ${({ $active }) => ($active ? 1 : 0)};
    pointer-events: none;
  }

  &:hover {
    color: ${({ theme }) => theme.colors?.primary};
    border-color: ${({ theme }) => `${theme.colors?.primary}66`};
    background: ${({ theme }) => `${theme.colors?.body}38`};
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 1px solid ${({ theme }) => theme.colors?.primary};
    outline-offset: 1px;
  }
`;

export const PreviewTabClose = styled.button`
  width: 1.2rem;
  height: 1.2rem;
  display: inline-grid;
  place-items: center;
  padding: 0;
  border: 1px solid ${({ theme }) => `${theme.colors?.text[300]}88`};
  border-radius: 0.3rem;
  background: transparent;
  color: ${({ theme }) => theme.colors?.text[200]};
  font: inherit;
  font-size: 0.8rem;
  line-height: 1;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  transition:
    border-color 120ms ease,
    color 120ms ease,
    background-color 120ms ease,
    transform 120ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors?.primary};
    background: ${({ theme }) => `${theme.colors?.primary}14`};
    color: ${({ theme }) => theme.colors?.primary};
    transform: scale(1.05);
  }

  &:focus-visible {
    outline: 1px solid ${({ theme }) => theme.colors?.primary};
    outline-offset: 1px;
  }
`;

export const PreviewBody = styled.div`
  ${emphasisScrollbar}

  flex: 1;
  width: 100%;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  display: flex;
  flex-direction: column;
  padding: 1.35rem 1.4rem 1.4rem;
  gap: 0.9rem;
  line-height: 1.75;
  background:
    linear-gradient(
      180deg,
      ${({ theme }) => `${theme.colors?.body}18`},
      ${({ theme }) => `${theme.colors?.body}22`}
    );
  animation: ${fadeRise} 260ms ease;
  font-family: "IBM Plex Mono", monospace;

  &[data-markdown-preview="true"] {
    display: flex;
    flex-direction: column;
    padding: 0.95rem 1rem 1.2rem;
    background: transparent;
    border: 0;
    box-shadow: none;
  }

  & > * {
    flex: 0 0 auto;
    min-width: 0;
    max-width: 100%;
  }

  & > pre:only-child,
  & > .preview-fill:only-child,
  & > [data-code-block-frame="true"]:only-child,
  & > iframe:only-child {
    flex: 1 1 auto;
    min-height: 100%;
  }

  & > [data-code-block-frame="true"] {
    align-self: stretch;
    flex: 1 1 auto;
    width: 100%;
    max-width: 100%;
    min-height: 0;
  }

  & > iframe,
  & > .preview-fill {
    flex: 1 1 auto;
    min-height: 100%;
    width: 100%;
    box-sizing: border-box;
  }

  &[data-markdown-preview="true"] > .preview-fill:only-child {
    min-height: 100%;
  }

  &[data-markdown-preview="true"] > .preview-fill {
    align-self: stretch;
    flex: 1 0 auto;
    min-height: 100%;
  }


  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    color: ${({ theme }) => theme.colors?.primary};
    font-weight: 700;
    line-height: 1.3;
  }

  h1 {
    margin-top: 0;
    font-size: 1.8rem;
  }

  h2 {
    font-size: 1.3rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  p,
  ul,
  ol,
  blockquote {
    margin-bottom: 1rem;
  }

  pre {
    margin: 0;
  }


  ul,
  ol {
    padding-left: 1.5rem;
  }

  li + li {
    margin-top: 0.35rem;
  }

  a {
    color: ${({ theme }) => theme.colors?.secondary};
    text-decoration: none;
    border-bottom: 1px dashed ${({ theme }) => theme.colors?.secondary};
  }

  a:hover {
    border-bottom-style: solid;
  }

  code {
    padding: 0.1rem 0.35rem;
    border-radius: 0.35rem;
    background-color: ${({ theme }) => `${theme.colors?.text[300]}18`};
    color: ${({ theme }) => theme.colors?.secondary};
    font-size: 0.95em;
    font-family: inherit;
  }

  pre code {
    display: block;
    margin: 0;
    padding: 0;
    border-radius: 0;
    background: transparent;
    color: inherit;
  }

  blockquote {
    margin-left: 0;
    padding: 0.75rem 1rem;
    border-left: 3px solid ${({ theme }) => theme.colors?.primary};
    background: ${({ theme }) => `${theme.colors?.body}16`};
    border-radius: 0.85rem;
    color: ${({ theme }) => theme.colors?.text[200]};
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }

  th,
  td {
    padding: 0.65rem 0.8rem;
    border: 1px solid ${({ theme }) => `${theme.colors?.text[300]}30`};
    text-align: left;
  }

  th {
    color: ${({ theme }) => theme.colors?.primary};
    background: ${({ theme }) => `${theme.colors?.primary}12`};
  }

  img,
  video,
  audio,
  iframe {
    max-width: 100%;
  }

  img,
  video,
  audio,
  iframe,
  .preview-fill {
    min-height: 0;
  }
  ${prismTokenStyles}
`;

export const CodeBlockFrame = styled.figure`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 0;
  margin: 0;
  padding: 0.82rem 0.92rem 0.8rem;
  border: 1px solid ${({ theme }) => `${theme.colors?.primary}3c`};
  border-radius: 0.9rem;
  background:
    linear-gradient(
      180deg,
      ${({ theme }) => `${theme.colors?.body}40`},
      ${({ theme }) => `${theme.colors?.body}34`}
    );
  box-shadow:
    inset 0 1px 0 ${({ theme }) => `${theme.colors?.primary}10`},
    0 8px 18px rgba(3, 10, 18, 0.08);
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    border: 1px solid ${({ theme }) => `${theme.colors?.primary}12`};
    background: linear-gradient(
      180deg,
      ${({ theme }) => `${theme.colors?.primary}08`},
      transparent 20%
    );
  }
`;

export const CodeBlockHeader = styled.figcaption`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: flex-end;
  min-height: 0.9rem;
`;

export const CodeBlockLanguage = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.04rem 0.46rem;
  border: 1px solid ${({ theme }) => `${theme.colors?.primary}2f`};
  border-radius: 999px;
  background: ${({ theme }) => `${theme.colors?.body}60`};
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => `${theme.colors?.text[200]}d8`};
  line-height: 1.1;
`;

export const CodeBlockViewport = styled.div`
  ${emphasisScrollbar}

  position: relative;
  width: 100%;
  box-sizing: border-box;
  min-height: 0;
  max-width: 100%;
  overflow: auto;
  padding: 0.12rem 0.08rem 0.04rem 0;
  scrollbar-gutter: stable;
  z-index: 1;
`;

export const CodeBlockPre = styled.pre`
  box-sizing: border-box;
  width: max-content;
  min-width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  font-family: inherit;
`;

export const PreviewImage = styled.img`
  display: block;
  max-width: 100%;
  margin: 0 auto;
  border-radius: 1rem;
  box-shadow: 0 20px 44px ${({ theme }) => `${theme.colors?.body}66`};
`;

export const PreviewVideo = styled.video`
  display: block;
  width: 100%;
  border-radius: 1rem;
  background: #000;
`;

export const MusicPreviewCard = styled.section<{ $backdrop: string }>`
  position: relative;
  display: grid;
  gap: clamp(0.55rem, 1.5cqw, 0.9rem);
  width: 100%;
  box-sizing: border-box;
  padding: clamp(0.72rem, 2.1cqw, 1.1rem);
  border: 2px solid
    ${({ theme }) => `color-mix(in srgb, ${theme.colors?.primary} 58%, rgba(255,255,255,0.18))`};
  border-radius: 1.1rem;
  overflow: hidden;
  background: ${({ theme }) => `${theme.colors?.body}e6`};
  box-shadow: 0 18px 44px ${({ theme }) => `${theme.colors?.body}66`};
  align-self: start;
  container-type: inline-size;

  &::before {
    content: "";
    position: absolute;
    inset: 2px;
    border-radius: calc(1.1rem - 2px);
    background-image:
      linear-gradient(
        90deg,
        ${({ theme }) => `color-mix(in srgb, ${theme.colors?.body} 96%, transparent)`} 0%,
        ${({ theme }) => `color-mix(in srgb, ${theme.colors?.body} 84%, transparent)`} 42%,
        ${({ theme }) => `color-mix(in srgb, ${theme.colors?.body} 62%, transparent)`} 74%,
        ${({ theme }) => `color-mix(in srgb, ${theme.colors?.body} 30%, transparent)`} 100%
      ),
      linear-gradient(
        180deg,
        ${({ theme }) => `color-mix(in srgb, ${theme.colors?.body} 14%, transparent)`},
        ${({ theme }) => `color-mix(in srgb, ${theme.colors?.body} 54%, transparent)`}
      ),
      ${({ $backdrop }) => $backdrop};
    background-position: center, center, center;
    background-repeat: no-repeat, no-repeat, no-repeat;
    background-size: auto, auto, cover;
  }

  > * {
    position: relative;
    z-index: 1;
  }
`;

export const MusicPreviewHeader = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: clamp(0.75rem, 2cqw, 1.1rem);
  align-items: center;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
    align-items: start;
  }
`;

export const MusicPreviewMeta = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: clamp(0.62rem, 1.8cqw, 0.95rem);
  align-items: center;
  min-width: 0;
`;

export const MusicPreviewCover = styled.div<{ $background: string }>`
  width: clamp(3.2rem, 10.5cqw, 4.9rem);
  height: clamp(3.2rem, 10.5cqw, 4.9rem);
  border-radius: clamp(0.8rem, 2.2cqw, 1rem);
  background: ${({ $background }) => $background} center/cover no-repeat;
  box-shadow:
    0 0 0 1px
      ${({ theme }) => `color-mix(in srgb, ${theme.colors?.primary} 28%, transparent)`},
    0 10px 22px ${({ theme }) => `${theme.colors?.body}44`};
`;

export const MusicPreviewCopy = styled.div`
  min-width: 0;
`;

export const MusicPreviewTitle = styled.div`
  color: ${({ theme }) => theme.colors?.text[100]};
  font-size: clamp(1.08rem, 3.5cqw, 1.5rem);
  font-weight: 700;
  line-height: 1.2;
  word-break: break-word;
`;

export const MusicPreviewSubtitle = styled.div`
  color: ${({ theme }) => theme.colors?.text[200]};
  font-size: clamp(0.84rem, 2.2cqw, 1rem);
  line-height: 1.16;

  &:last-child {
    color: ${({ theme }) => `${theme.colors?.text[300]}c2`};
    font-size: clamp(0.74rem, 1.9cqw, 0.9rem);
  }
`;

export const MusicPreviewSurface = styled.div`
  display: grid;
  gap: clamp(0.28rem, 1cqw, 0.5rem);
  min-width: 0;
`;

export const MusicPreviewControls = styled.div`
  display: grid;
  gap: clamp(0.45rem, 1.3cqw, 0.75rem);
  justify-items: end;

  @media (max-width: 520px) {
    justify-items: start;
  }
`;

export const MusicPreviewControlCluster = styled.div`
  display: inline-flex;
  align-items: center;
  gap: clamp(0.38rem, 1cqw, 0.55rem);
`;

export const MusicPreviewVolumeWrap = styled.label`
  display: inline-grid;
  grid-template-columns: auto minmax(clamp(5rem, 16cqw, 7rem), clamp(5rem, 16cqw, 7rem));
  align-items: center;
  gap: clamp(0.5rem, 1.2cqw, 0.75rem);
  color: ${({ theme }) => `${theme.colors?.primary}d0`};
  font-size: clamp(0.68rem, 1.6cqw, 0.8rem);
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const MusicPreviewButton = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $primary }) =>
    $primary ? "clamp(2.32rem, 7.1cqw, 3rem)" : "clamp(2rem, 6.1cqw, 2.6rem)"};
  height: ${({ $primary }) =>
    $primary ? "clamp(2.32rem, 7.1cqw, 3rem)" : "clamp(2rem, 6.1cqw, 2.6rem)"};
  padding: 0;
  border-radius: 999px;
  border: 1px solid
    ${({ $primary, theme }) =>
      $primary
        ? `color-mix(in srgb, ${theme.colors?.primary} 52%, transparent)`
        : `color-mix(in srgb, ${theme.colors?.primary} 34%, transparent)`};
  background: ${({ $primary, theme }) =>
    $primary
      ? `linear-gradient(180deg, color-mix(in srgb, ${theme.colors?.primary} 26%, transparent), color-mix(in srgb, ${theme.colors?.primary} 12%, transparent))`
      : `linear-gradient(180deg, color-mix(in srgb, ${theme.colors?.primary} 16%, transparent), color-mix(in srgb, ${theme.colors?.primary} 8%, transparent))`};
  color: ${({ theme }) => theme.colors?.primary};
  cursor: pointer;
  box-shadow:
    inset 0 1px 0 ${({ theme }) => `color-mix(in srgb, ${theme.colors?.primary} 18%, transparent)`},
    0 8px 16px ${({ theme }) => `${theme.colors?.body}2e`};
  transition:
    transform 120ms ease,
    border-color 120ms ease,
    background-color 120ms ease,
    box-shadow 120ms ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    border-color: ${({ theme }) => `${theme.colors?.primary}aa`};
    box-shadow: 0 10px 24px ${({ theme }) => `${theme.colors?.primary}18`};
  }

  &:disabled {
    opacity: 0.45;
    cursor: default;
    box-shadow: none;
  }

  &:focus-visible {
    outline: 1px solid ${({ theme }) => theme.colors?.primary};
    outline-offset: 2px;
  }
`;

export const MusicPreviewButtonIcon = styled.span<{ $kind: "pause" | "play" }>`
  position: relative;
  display: block;
  width: clamp(1rem, 3cqw, 1.25rem);
  height: clamp(1rem, 3cqw, 1.25rem);

  &::before,
  &::after {
    content: "";
    position: absolute;
  }

  ${({ $kind }) =>
    $kind === "play"
      ? `
        &::before {
          left: 0.18rem;
          top: 0.08rem;
          width: 0;
          height: 0;
          border-top: 0.42rem solid transparent;
          border-bottom: 0.42rem solid transparent;
          border-left: 0.68rem solid currentColor;
        }
      `
      : `
        &::before,
        &::after {
          top: 0.1rem;
          width: 0.22rem;
          height: 0.8rem;
          border-radius: 999px;
          background: currentColor;
        }

        &::before {
          left: 0.2rem;
        }

        &::after {
          right: 0.2rem;
        }
      `}
`;

export const MusicPreviewProgressGroup = styled.div`
  display: grid;
  gap: clamp(0.28rem, 0.9cqw, 0.45rem);
`;

export const MusicPreviewRange = styled.input`
  width: 100%;
  margin: 0;
  accent-color: ${({ theme }) => theme.colors?.primary};
  color: ${({ theme }) => theme.colors?.primary};
  cursor: pointer;
`;

export const MusicPreviewTimeRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  color: ${({ theme }) => `${theme.colors?.text[200]}cc`};
  font-size: clamp(0.72rem, 1.8cqw, 0.86rem);
`;

export const MusicPreviewPlayer = styled.audio`
  width: 100%;
  display: block;
  border-radius: 0.85rem;

  &::-webkit-media-controls-panel {
    background: transparent;
  }
`;

export const PreviewAudio = styled.audio`
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
  appearance: none;

  &::-webkit-media-controls-panel {
    background: transparent;
  }
`;

export const PreviewEmbedFrame = styled.iframe`
  flex: 1;
  width: 100%;
  min-height: 0;
  border: 1px solid ${({ theme }) => `${theme.colors?.primary}26`};
  border-radius: 1rem;
  background: transparent;

  &:only-child {
    height: 100%;
  }
`;

export const EmbedFallback = styled.div`
  display: grid;
  gap: 0.7rem;
  padding: 1rem 1.1rem;
  border: 1px solid ${({ theme }) => `${theme.colors?.primary}14`};
  border-radius: 1rem;
  background: transparent;
`;

export const EmbedLink = styled.a`
  display: inline;
  color: ${({ theme }) => theme.colors?.secondary};
  text-decoration: none;
  border-bottom: 1px dashed currentColor;
`;

export const EmptyPreviewState = styled.div`
  display: grid;
  place-items: center;
  min-height: 16rem;
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => `${theme.colors?.primary}32`};
  background: transparent;
  color: ${({ theme }) => theme.colors?.text[200]};
`;
