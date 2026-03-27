import styled, { css, keyframes } from "styled-components";

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

const fadeRise = keyframes`
  from {
    opacity: 0;
    transform: translateX(-0.4rem);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const menuRise = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.35rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const treeAffordance = css`
  width: 1.65rem;
  height: 1.65rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.55rem;
`;

export const PanelShell = styled.aside<{ $collapsed: boolean }>`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: 1px solid ${({ theme }) => `${theme.colors?.primary}38`};
  background:
    linear-gradient(
      180deg,
      ${({ theme }) => `${theme.colors?.body}be`},
      ${({ theme }) => `${theme.colors?.body}98`}
    );
  backdrop-filter: blur(6px) saturate(112%);
  overflow: hidden;
  animation: ${fadeRise} 220ms ease;

  @media (max-width: 900px) {
    border-right: 0;
    border-bottom: 1px solid ${({ theme }) => `${theme.colors?.primary}38`};
  }
`;

export const PanelTitle = styled.div<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => `${theme.colors?.primary}3a`};
  box-shadow: inset 0 -1px 0 ${({ theme }) => `${theme.colors?.success}1c`};
  background:
    linear-gradient(
      180deg,
      ${({ theme }) => `${theme.colors?.body}d6`},
      ${({ theme }) => `${theme.colors?.body}b2`}
    );

  > div {
    display: grid;
    gap: 0.18rem;
  }

  strong {
    color: ${({ theme }) => theme.colors?.success};
    font-size: 0.78rem;
    letter-spacing: 0.2em;
  }

  span {
    color: ${({ theme }) => theme.colors?.text[200]};
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  ${({ $collapsed }) =>
    $collapsed &&
    css`
      justify-content: center;
      padding: 1rem 0.75rem;
    `}
`;

export const PanelToggle = styled.button`
  position: relative;
  width: 2.25rem;
  height: 2.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => `${theme.colors?.success}44`};
  border-radius: 0.75rem;
  background:
    linear-gradient(
      180deg,
      ${({ theme }) => `${theme.colors?.success}22`},
      ${({ theme }) => `${theme.colors?.success}10`}
    );
  color: ${({ theme }) => theme.colors?.success};
  font: inherit;
  line-height: 1;
  cursor: pointer;
  transition:
    transform 140ms ease,
    border-color 140ms ease,
    box-shadow 140ms ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ theme }) => `${theme.colors?.success}78`};
    box-shadow: 0 10px 24px ${({ theme }) => `${theme.colors?.success}18`};
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 1px ${({ theme }) => `${theme.colors?.body}cc`},
      0 0 0 3px ${({ theme }) => `${theme.colors?.success}24`};
  }
`;

export const PanelToggleIcon = styled.span<{ $collapsed?: boolean }>`
  position: relative;
  width: 0.95rem;
  height: 0.95rem;
  color: currentColor;

  &::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 0.62rem;
    height: 0.62rem;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    border-radius: 0.08rem;
    transform: ${({ $collapsed }) =>
      $collapsed
        ? "translate(-50%, -50%) rotate(-45deg)"
        : "translate(-50%, -50%) rotate(135deg)"};
    transition: transform 160ms ease;
  }
`;

export const PanelBody = styled.div`
  ${emphasisScrollbar}

  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  padding: 0.95rem 1rem;
`;

export const PanelSection = styled.section`
  display: grid;
  gap: 0.7rem;
`;

export const PanelSectionLabel = styled.div`
  color: ${({ theme }) => theme.colors?.text[300]};
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-shadow: 0 0 0.12rem ${({ theme }) => `${theme.colors?.primary}22`};
`;

export const PanelTreeHeader = styled.button`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  padding: 0.72rem 0.78rem;
  border: 1px solid ${({ theme }) => `${theme.colors?.success}52`};
  border-radius: 0.95rem;
  background:
    linear-gradient(
      180deg,
      ${({ theme }) => `${theme.colors?.success}12`},
      ${({ theme }) => `${theme.colors?.body}78`}
    );
  color: ${({ theme }) => theme.colors?.text[100]};
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 140ms ease,
    background-color 140ms ease,
    transform 140ms ease,
    box-shadow 140ms ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ theme }) => `${theme.colors?.success}48`};
    box-shadow: 0 12px 24px ${({ theme }) => `${theme.colors?.success}14`};
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 1px ${({ theme }) => `${theme.colors?.body}cc`},
      0 0 0 3px ${({ theme }) => `${theme.colors?.success}24`};
  }
`;

export const TreeHeaderIcon = styled.span<{ $expanded?: boolean }>`
  position: relative;
  width: 0.95rem;
  height: 0.95rem;
  color: ${({ theme }) => theme.colors?.success};

  &::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 0.58rem;
    height: 0.58rem;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    border-radius: 0.08rem;
    transform: ${({ $expanded }) =>
      $expanded
        ? "translate(-50%, -50%) rotate(45deg)"
        : "translate(-50%, -50%) rotate(-45deg)"};
    transition: transform 160ms ease;
  }
`;

export const TreeHeaderMain = styled.div`
  display: grid;
  gap: 0.14rem;
  min-width: 0;
`;

export const CurrentPath = styled.div`
  color: ${({ theme }) => theme.colors?.success};
  font-size: 0.86rem;
  letter-spacing: 0.03em;
  overflow-wrap: anywhere;
`;

export const PanelTree = styled.div`
  min-width: 0;
`;

export const PanelSectionBody = styled.div`
  display: grid;
  gap: 0.45rem;
`;

export const TreeList = styled.div`
  display: grid;
  gap: 0.26rem;
`;

export const TreeNodeShell = styled.div`
  display: grid;
  gap: 0.2rem;
  min-width: 0;
`;

export const TreeRow = styled.div<{ $depth: number }>`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.42rem;
  min-width: 0;
  padding-left: ${({ $depth }) => `${$depth * 0.9}rem`};
`;

export const TreeExpandButton = styled.button<{ $expanded?: boolean }>`
  ${treeAffordance}

  position: relative;
  border: 1px solid ${({ theme }) => `${theme.colors?.text[300]}24`};
  background: ${({ theme }) => `${theme.colors?.body}7c`};
  color: ${({ theme }) => theme.colors?.success};
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 140ms ease,
    background-color 140ms ease,
    box-shadow 140ms ease;

  &::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 0.5rem;
    height: 0.5rem;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    border-radius: 0.08rem;
    transform: ${({ $expanded }) =>
      $expanded
        ? "translate(-50%, -50%) rotate(45deg)"
        : "translate(-50%, -50%) rotate(-45deg)"};
    transition: transform 160ms ease;
  }

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ theme }) => `${theme.colors?.success}44`};
    background: ${({ theme }) => `${theme.colors?.success}12`};
    box-shadow: 0 8px 18px ${({ theme }) => `${theme.colors?.success}10`};
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 1px ${({ theme }) => `${theme.colors?.body}cc`},
      0 0 0 3px ${({ theme }) => `${theme.colors?.success}24`};
  }
`;

export const TreeExpandSpacer = styled.span`
  ${treeAffordance}

  position: relative;
  pointer-events: none;

  &::before {
    content: "";
    width: 0.32rem;
    height: 0.32rem;
    border-radius: 999px;
    background: ${({ theme }) => `${theme.colors?.text[300]}52`};
    box-shadow: 0 0 0 1px ${({ theme }) => `${theme.colors?.text[300]}18`};
  }
`;

export const PanelItem = styled.button<{
  $active?: boolean;
  $entryType: "directory" | "file";
}>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  min-width: 0;
  padding: 0.68rem 0.82rem;
  border: 1px solid ${({ theme }) => `${theme.colors?.text[300]}88`};
  border-radius: 0.95rem;
  background:
    linear-gradient(
      180deg,
      ${({ theme }) => `${theme.colors?.body}94`},
      ${({ theme }) => `${theme.colors?.body}76`}
    );
  color: ${({ $entryType, theme }) =>
    $entryType === "directory" ? theme.colors?.success : theme.colors?.secondary};
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    color 140ms ease,
    border-color 140ms ease,
    background-color 140ms ease,
    transform 140ms ease,
    box-shadow 140ms ease;

  ${({ $active, theme }) =>
    $active &&
    css`
      background: linear-gradient(
        180deg,
        ${`${theme.colors?.success}20`},
        ${`${theme.colors?.body}92`}
      );
      border-color: ${`${theme.colors?.success}58`};
      color: ${theme.colors?.text[100]};
      box-shadow:
        0 12px 28px ${`${theme.colors?.success}10`},
        inset 0 0 0 1px ${`${theme.colors?.success}10`};

      &::after {
        content: "";
        position: absolute;
        left: 0.38rem;
        top: 0.38rem;
        bottom: 0.38rem;
        width: 0.18rem;
        border-radius: 999px;
        background: ${theme.colors?.success};
        box-shadow: 0 0 10px ${`${theme.colors?.success}66`};
      }
    `}

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ $entryType, theme }) =>
      $entryType === "directory"
        ? `${theme.colors?.success}42`
        : `${theme.colors?.secondary}42`};
    background: linear-gradient(
      180deg,
      ${({ $entryType, theme }) =>
        $entryType === "directory"
          ? `${theme.colors?.success}12`
          : `${theme.colors?.secondary}12`},
      ${({ theme }) => `${theme.colors?.body}84`}
    );
    box-shadow: 0 10px 24px ${({ theme }) => `${theme.colors?.body}34`};
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 1px ${({ theme }) => `${theme.colors?.body}cc`},
      0 0 0 3px
        ${({ $entryType, theme }) =>
          $entryType === "directory"
            ? `${theme.colors?.success}22`
            : `${theme.colors?.secondary}22`};
  }
`;

export const EntryIcon = styled.span<{ $entryType: "directory" | "file" }>`
  position: relative;
  flex: 0 0 auto;
  width: 1rem;
  height: 0.9rem;
  color: ${({ $entryType, theme }) =>
    $entryType === "directory" ? theme.colors?.success : theme.colors?.secondary};

  &::before,
  &::after {
    content: "";
    position: absolute;
    box-sizing: border-box;
  }

  ${({ $entryType, theme }) =>
    $entryType === "directory"
      ? css`
          &::before {
            left: 0;
            top: 0.18rem;
            width: 1rem;
            height: 0.72rem;
            border: 1.5px solid currentColor;
            border-radius: 0.2rem;
            background: ${`${theme.colors?.success}12`};
          }

          &::after {
            left: 0.08rem;
            top: 0;
            width: 0.42rem;
            height: 0.26rem;
            border: 1.5px solid currentColor;
            border-bottom: 0;
            border-radius: 0.2rem 0.2rem 0 0;
            background: ${`${theme.colors?.success}12`};
          }
        `
      : css`
          &::before {
            left: 0.1rem;
            top: 0;
            width: 0.76rem;
            height: 0.9rem;
            border: 1.5px solid currentColor;
            border-radius: 0.18rem;
            background: ${`${theme.colors?.secondary}10`};
          }

          &::after {
            right: 0.14rem;
            top: 0.08rem;
            width: 0.24rem;
            height: 0.24rem;
            border-top: 1.5px solid currentColor;
            border-right: 1.5px solid currentColor;
            background: ${theme.colors?.body};
            transform: rotate(45deg);
          }
        `}
`;

export const EntryName = styled.span`
  font-size: 0.92rem;
  min-width: 0;
  overflow-wrap: anywhere;
`;

export const EntryMeta = styled.span`
  color: ${({ theme }) => theme.colors?.text[200]};
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

export const PanelFooter = styled.div`
  display: grid;
  gap: 0.95rem;
  padding: 0.95rem 1rem;
  border-top: 1px solid ${({ theme }) => `${theme.colors?.primary}42`};
  box-shadow: inset 0 1px 0 ${({ theme }) => `${theme.colors?.text[300]}18`};
  background:
    linear-gradient(
      180deg,
      ${({ theme }) => `${theme.colors?.body}76`},
      ${({ theme }) => `${theme.colors?.body}b0`}
    );
`;

export const ActionGrid = styled.div`
  display: grid;
  gap: 0.55rem;
`;

export const ActionButton = styled.button`
  width: 100%;
  min-height: 2.65rem;
  padding: 0.68rem 0.82rem;
  border: 1px solid ${({ theme }) => `${theme.colors?.success}5e`};
  border-radius: 0.9rem;
  background: ${({ theme }) => `${theme.colors?.success}05`};
  color: ${({ theme }) => theme.colors?.text[200]};
  backdrop-filter: blur(6px) saturate(120%);
  font: inherit;
  font-size: 0.88rem;
  text-align: left;
  cursor: pointer;
  transition:
    color 140ms ease,
    border-color 140ms ease,
    box-shadow 140ms ease,
    transform 140ms ease,
    background-color 140ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors?.text[300]};
    border-color: ${({ theme }) => `${theme.colors?.success}cc`};
    background:
      linear-gradient(
        90deg,
        ${({ theme }) => `${theme.colors?.success}14`},
        ${({ theme }) => `${theme.colors?.success}06`}
      );
    transform: translateY(-1px);
    box-shadow:
      0 0 0 1px ${({ theme }) => `${theme.colors?.success}22`},
      0 8px 18px ${({ theme }) => `${theme.colors?.success}12`};
  }

  &:focus-visible {
    outline: none;
    color: ${({ theme }) => theme.colors?.text[300]};
    box-shadow:
      0 0 0 1px ${({ theme }) => `${theme.colors?.body}cc`},
      0 0 0 3px ${({ theme }) => `${theme.colors?.success}24`};
  }
`;

export const ThemeMenuShell = styled.div`
  position: relative;
`;

export const ThemeMenuTrigger = styled.button<{ $open?: boolean }>`
  width: 100%;
  min-height: 2.5rem;
  padding: 0.48rem 0.78rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border: 1px solid
    ${({ $open, theme }) =>
      $open ? `${theme.colors?.success}3d` : `${theme.colors?.text[300]}24`};
  border-radius: 0.92rem;
  background:
    linear-gradient(
      180deg,
      ${({ theme }) => `${theme.colors?.success}0f`},
      ${({ theme }) => `${theme.colors?.body}76`}
    );
  color: ${({ theme }) => theme.colors?.text[100]};
  backdrop-filter: blur(8px) saturate(120%);
  font: inherit;
  cursor: pointer;
  transition:
    border-color 140ms ease,
    box-shadow 140ms ease,
    transform 140ms ease,
    background-color 140ms ease;

  &:hover {
    border-color: ${({ theme }) => `${theme.colors?.success}66`};
    transform: translateY(-1px);
    box-shadow: 0 12px 24px ${({ theme }) => `${theme.colors?.success}10`};
  }

  &:focus-visible,
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.success};
    box-shadow:
      0 0 0 1px ${({ theme }) => `${theme.colors?.body}cc`},
      0 0 0 3px ${({ theme }) => `${theme.colors?.success}24`};
  }
`;

export const ThemeMenuValue = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ThemeMenuCaret = styled.span<{ $open?: boolean }>`
  width: 0.72rem;
  height: 0.72rem;
  flex: 0 0 auto;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: ${({ $open }) =>
    $open
      ? "rotate(225deg) translate(-0.08rem, -0.08rem)"
      : "rotate(45deg) translate(-0.02rem, -0.02rem)"};
  transition: transform 140ms ease;
`;

export const ThemeMenuList = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(100% + 0.55rem);
  z-index: 8;
  display: grid;
  gap: 0.18rem;
  padding: 0.38rem;
  border: 1px solid ${({ theme }) => `${theme.colors?.success}22`};
  border-radius: 1rem;
  background:
    linear-gradient(
      180deg,
      ${({ theme }) => `${theme.colors?.success}10`},
      ${({ theme }) => `${theme.colors?.body}56`}
    );
  backdrop-filter: blur(10px) saturate(120%);
  box-shadow:
    0 18px 40px rgba(3, 10, 18, 0.18),
    inset 0 0 0 1px ${({ theme }) => `${theme.colors?.text[300]}08`};
  animation: ${menuRise} 160ms ease;
`;

export const ThemeMenuItem = styled.button<{ $active?: boolean }>`
  position: relative;
  width: 100%;
  min-height: 2.25rem;
  padding: 0.55rem 0.8rem 0.55rem 1rem;
  border: 0;
  border-radius: 0.8rem;
  background: ${({ $active, theme }) =>
    $active ? `${theme.colors?.success}0c` : "transparent"};
  color: ${({ $active, theme }) =>
    $active ? theme.colors?.text[300] : theme.colors?.text[200]};
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    color 140ms ease,
    background-color 140ms ease,
    transform 140ms ease;

  &::before {
    content: "";
    position: absolute;
    left: 0.35rem;
    top: 0.48rem;
    bottom: 0.48rem;
    width: 0.14rem;
    border-radius: 999px;
    background: ${({ $active, theme }) =>
      $active ? theme.colors?.success : "transparent"};
    box-shadow: ${({ $active, theme }) =>
      $active ? `0 0 12px ${theme.colors?.success}55` : "none"};
  }

  &:hover {
    color: ${({ theme }) => theme.colors?.success};
    background: ${({ theme }) => `${theme.colors?.success}0d`};
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: none;
    background: ${({ theme }) => `${theme.colors?.success}0d`};
    color: ${({ theme }) => theme.colors?.success};
  }
`;
