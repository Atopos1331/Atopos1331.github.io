import { css } from "styled-components";

export const panelSurface = css`
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border: 1px solid ${({ theme }) => `${theme.colors?.text[300]}1f`};
  background:
    linear-gradient(
      150deg,
      ${({ theme }) => `${theme.colors?.body}c6`} 0%,
      ${({ theme }) => `${theme.colors?.body}ae`} 54%,
      ${({ theme }) => `${theme.colors?.body}94`} 100%
    ),
    radial-gradient(
      circle at top left,
      ${({ theme }) => `${theme.colors?.success}12`},
      transparent 30%
    ),
    radial-gradient(
      circle at top right,
      ${({ theme }) => `${theme.colors?.primary}10`},
      transparent 24%
    ),
    linear-gradient(
      135deg,
      ${({ theme }) => `${theme.colors?.secondary}0a`},
      transparent 58%
    );
  box-shadow:
    inset 0 0 0 1px ${({ theme }) => `${theme.colors?.text[300]}0d`},
    inset 0 0 14px rgba(0, 0, 0, 0.08),
    0 12px 28px rgba(3, 10, 18, 0.12);
  backdrop-filter: blur(calc(var(--workspace-panel-blur, 20px) * 0.55)) saturate(116%);
`;
