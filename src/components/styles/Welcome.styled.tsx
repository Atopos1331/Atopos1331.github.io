import styled, { css } from "styled-components";

export const HeroContainer = styled.div`
  display: grid;
  gap: 0.9rem;
  margin-bottom: 1.5rem;
`;

const logoBase = css`
  position: relative;
  display: inline-block;
  transform-origin: left center;
  margin-top: 0.5rem;
  margin-bottom: 1.1rem;
  color: ${({ theme }) => theme.colors?.primary};
  font-family:
    "Cascadia Mono",
    "Consolas",
    "Lucida Console",
    "IBM Plex Mono",
    monospace;
  font-variant-ligatures: none;
  letter-spacing: 0;
  line-height: 1;
  white-space: pre;
  will-change: color, transform;

  @media (prefers-reduced-motion: no-preference) {
    animation:
      logoRainbow 4.8s linear infinite,
      logoPulse 2.2s ease-in-out infinite;
  }

  @keyframes logoRainbow {
    0% {
      color: #ff3b30;
      text-shadow: 0 0 0.18rem rgba(255, 59, 48, 0.35);
    }

    16% {
      color: #ff9500;
      text-shadow: 0 0 0.18rem rgba(255, 149, 0, 0.35);
    }

    32% {
      color: #ffd60a;
      text-shadow: 0 0 0.18rem rgba(255, 214, 10, 0.35);
    }

    48% {
      color: #34c759;
      text-shadow: 0 0 0.18rem rgba(52, 199, 89, 0.35);
    }

    64% {
      color: #0a84ff;
      text-shadow: 0 0 0.18rem rgba(10, 132, 255, 0.35);
    }

    80% {
      color: #af52de;
      text-shadow: 0 0 0.18rem rgba(175, 82, 222, 0.35);
    }

    100% {
      color: #ff3b30;
      text-shadow: 0 0 0.18rem rgba(255, 59, 48, 0.35);
    }
  }

  @keyframes logoPulse {
    0%,
    100% {
      transform: scale(1);
    }

    50% {
      transform: scale(1.015);
    }
  }

  &::after {
    content: attr(data-glow);
    position: absolute;
    inset: 0;
    z-index: -1;
    color: currentColor;
    opacity: 0.14;
    filter: blur(0.22rem) saturate(110%);
    pointer-events: none;
  }
`;

export const PreName = styled.pre`
  ${logoBase}

  @media (max-width: 550px) {
    display: none;
  }
`;

export const PreWrapper = styled.div`
  text-align: center;
`;

export const PreNameMobile = styled.pre`
  ${logoBase}
  font-size: 0.82rem;

  @media (min-width: 551px) {
    display: none;
  }
`;

export const PreImg = styled.pre`
  @media (max-width: 550px) {
    display: none;
  }
`;

export const Seperator = styled.div`
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  color: ${({ theme }) => theme.colors?.text[300]};
`;

export const WelcomeLead = styled.div`
  color: ${({ theme }) => theme.colors?.text[300]};
  font-size: 1.02rem;
  line-height: 1.7;
`;

export const WelcomeBlock = styled.div`
  color: ${({ theme }) => theme.colors?.text[200]};
  line-height: 1.75;
`;

export const WelcomeLabel = styled.span`
  color: ${({ theme }) => theme.colors?.primary};
`;

export const WelcomeAccent = styled.span`
  color: ${({ theme }) => theme.colors?.secondary};
`;

export const WelcomeMuted = styled.span`
  color: ${({ theme }) => theme.colors?.text[200]};
`;

export const Link = styled.a`
  color: ${({ theme }) => theme.colors?.secondary};
  text-decoration: none;
  line-height: 1.5rem;
  white-space: nowrap;
  border-bottom: 2px dashed ${({ theme }) => theme.colors?.secondary};

  &:hover {
    border-bottom-style: solid;
  }
`;
