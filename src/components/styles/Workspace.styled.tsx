import styled, { css, keyframes } from "styled-components";
import type { LayoutMode } from "../../types/workspace";

const dividerWidth = "0.85rem";
const expandedSidebarWidth = "18rem";
const collapsedSidebarWidth = "4.5rem";

const desktopColumns = (layoutMode: LayoutMode, splitRatio: number) => {
  if (layoutMode === "terminal") {
    return "1fr 0 0";
  }

  if (layoutMode === "preview") {
    return "0 0 1fr";
  }

  const leftWidth = Math.round(splitRatio * 1000) / 10;
  const rightWidth = 100 - leftWidth;
  return `minmax(24rem, calc(${leftWidth}% - (${dividerWidth} / 2))) ${dividerWidth} minmax(22rem, calc(${rightWidth}% - (${dividerWidth} / 2)))`;
};

const mobileRows = (layoutMode: LayoutMode) => {
  if (layoutMode === "terminal") {
    return "1fr 0 0";
  }

  if (layoutMode === "preview") {
    return "0 0 1fr";
  }

  return `minmax(18rem, 1fr) ${dividerWidth} minmax(18rem, 1fr)`;
};

const hiddenPanelStyles = css`
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
`;

const withAlpha = (value: string | undefined, alpha: number) => {
  if (!value) {
    return `rgba(15, 23, 42, ${alpha})`;
  }

  if (/^#[0-9a-f]{6}$/i.test(value)) {
    return `${value}${Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
      .toString(16)
      .padStart(2, "0")}`;
  }

  return value;
};

const shellNoise = keyframes`
  0% {
    opacity: 0.18;
    transform: translate3d(0, 0, 0);
  }

  25% {
    opacity: 0.42;
    transform: translate3d(-0.5%, 0.4%, 0);
  }

  50% {
    opacity: 0.28;
    transform: translate3d(0.5%, -0.4%, 0);
  }

  100% {
    opacity: 0.2;
    transform: translate3d(0, 0, 0);
  }
`;

export const WorkspaceShell = styled.main<{
  $glitchPhase: "glitch" | "idle" | "snow";
  $hasSidebar: boolean;
  $layoutMode: LayoutMode;
  $panelBlur: number;
  $sidebarCollapsed: boolean;
}>`
  position: relative;
  width: 100%;
  height: 100vh;
  display: grid;
  grid-template-columns: ${({ $hasSidebar, $sidebarCollapsed }) =>
    $hasSidebar
      ? `${$sidebarCollapsed ? collapsedSidebarWidth : expandedSidebarWidth} 1fr`
      : "1fr"};
  overflow: hidden;
  background:
    linear-gradient(
      180deg,
      ${({ theme }) => `${theme.colors?.body}f0`},
      ${({ theme }) => `${theme.colors?.body}f8`}
    );
  --workspace-panel-blur: ${({ $panelBlur }) => `${Math.min(Math.max($panelBlur, 0), 40)}px`};

  transition:
    background 220ms ease,
    grid-template-columns 180ms ease;

  &::before,
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  &::before {
    background:
      radial-gradient(
        circle at top left,
        ${({ theme }) => `${theme.colors?.primary}24`},
        transparent 28%
      ),
      radial-gradient(
        circle at bottom right,
        ${({ theme }) => `${theme.colors?.secondary}18`},
        transparent 26%
      ),
      linear-gradient(
        180deg,
        ${({ theme }) => `${theme.colors?.body}cc`},
        ${({ theme }) => `${theme.colors?.body}ee`}
      );
  }

  &::after {
    opacity: 0;
    transition: opacity 180ms ease;
    z-index: 6;
    background:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.08) 0%,
        transparent 28%,
        rgba(255, 255, 255, 0.04) 54%,
        transparent 100%
      ),
      repeating-linear-gradient(
        0deg,
        rgba(255, 255, 255, 0.08) 0 1px,
        transparent 1px 3px
      );
  }

  ${({ $glitchPhase }) =>
    $glitchPhase === "glitch" &&
    css`
      &::after {
        opacity: 0.5;
        animation: ${shellNoise} 120ms steps(2) infinite;
      }
    `}

  ${({ $glitchPhase }) =>
    $glitchPhase === "snow" &&
    css`
      &::after {
        opacity: 0.82;
        animation: ${shellNoise} 160ms steps(3) infinite;
      }

      & > * {
        filter: grayscale(1) contrast(1.08);
      }
    `}

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    grid-template-rows: ${({ $hasSidebar }) => ($hasSidebar ? "auto 1fr" : "1fr")};
  }
`;

export const WorkspaceBody = styled.div<{
  $backgroundBlur: number;
  $backgroundOverlayOpacity: number;
  $backgroundSrc: string;
  $layoutMode: LayoutMode;
  $splitRatio: number;
}>`
  position: relative;
  z-index: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: ${({ $layoutMode, $splitRatio }) =>
    desktopColumns($layoutMode, $splitRatio)};
  overflow: hidden;
  transition:
    grid-template-columns 180ms ease,
    grid-template-rows 180ms ease,
    background 180ms ease;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    filter: ${({ $backgroundBlur }) =>
      $backgroundBlur > 0 ? `blur(${$backgroundBlur}px)` : "none"};
    transform: ${({ $backgroundBlur }) =>
      $backgroundBlur > 0 ? `scale(${1 + Math.min($backgroundBlur, 40) / 100})` : "none"};
    transform-origin: center;
    background:
      linear-gradient(
        145deg,
        ${({ $backgroundOverlayOpacity, theme }) =>
          withAlpha(theme.colors?.body, Math.max(0, Math.min(1, $backgroundOverlayOpacity / 100)))},
        ${({ $backgroundOverlayOpacity, theme }) =>
          withAlpha(theme.colors?.body, Math.max(0, Math.min(1, $backgroundOverlayOpacity / 100)))}
      ),
      radial-gradient(
        circle at top left,
        ${({ theme }) => `${theme.colors?.primary}10`},
        transparent 28%
      ),
      linear-gradient(
        135deg,
        ${({ theme }) => `${theme.colors?.secondary}0a`},
        transparent 54%
      )${({ $backgroundSrc }) => ($backgroundSrc ? `, url("${$backgroundSrc}") center/cover no-repeat` : "")};
    background-blend-mode: normal, screen, screen, multiply;
    transition:
      background 180ms ease,
      filter 180ms ease,
      transform 180ms ease;
  }

  & > * {
    position: relative;
    z-index: 1;
  }

  & > :only-child {
    grid-column: 1 / -1;
    grid-row: 1 / -1;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    grid-template-rows: ${({ $layoutMode }) => mobileRows($layoutMode)};
  }
`;

export const DividerHandle = styled.div<{ $layoutMode: LayoutMode }>`
  position: relative;
  min-width: ${dividerWidth};
  background: linear-gradient(
    180deg,
    transparent 0%,
    ${({ theme }) => `${theme.colors?.text[300]}18`} 14%,
    ${({ theme }) => `${theme.colors?.text[300]}22`} 50%,
    ${({ theme }) => `${theme.colors?.text[300]}18`} 86%,
    transparent 100%
  );
  cursor: col-resize;

  &::before {
    content: "";
    position: absolute;
    inset: 0.14rem 0.24rem;
    border-radius: 999px;
    border: 1px solid ${({ theme }) => `${theme.colors?.primary}24`};
    background:
      linear-gradient(
        180deg,
        ${({ theme }) => `${theme.colors?.primary}00`},
        ${({ theme }) => `${theme.colors?.primary}52`},
        ${({ theme }) => `${theme.colors?.primary}00`}
      );
    opacity: ${({ $layoutMode }) => ($layoutMode === "split" ? 1 : 0)};
    box-shadow: 0 0 16px ${({ theme }) => `${theme.colors?.primary}18`};
    transition:
      opacity 120ms ease,
      box-shadow 120ms ease,
      transform 120ms ease,
      border-color 120ms ease;
  }

  &:hover::before {
    border-color: ${({ theme }) => `${theme.colors?.primary}48`};
    box-shadow: 0 0 22px ${({ theme }) => `${theme.colors?.primary}34`};
    transform: scaleY(1.02);
  }

  ${({ $layoutMode }) =>
    $layoutMode !== "split" &&
    css`
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
    `}

  @media (max-width: 900px) {
    min-width: 0;
    min-height: ${dividerWidth};
    cursor: row-resize;
  }
`;

export const Panel = styled.section<{
  $layoutMode: LayoutMode;
  $side: "terminal" | "preview";
}>`
  position: relative;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  transition:
    opacity 180ms ease,
    transform 180ms ease,
    visibility 180ms ease;

  ${({ $layoutMode, $side }) =>
    (($layoutMode === "terminal" && $side === "preview") ||
      ($layoutMode === "preview" && $side === "terminal")) &&
    hiddenPanelStyles}

  ${({ $layoutMode, $side }) =>
    (($layoutMode === "terminal" && $side === "preview") ||
      ($layoutMode === "preview" && $side === "terminal")) &&
    css`
      transform: translateY(0.6rem);
    `}

  & > * {
    position: relative;
    z-index: 2;
  }

  @media (max-width: 900px) {
    ${({ $side, theme }) =>
      $side === "preview"
        ? css`
            border-left: 0;
            border-top: 1px solid ${`${theme.colors?.text[300]}55`};
          `
        : ""}
  }
`;
