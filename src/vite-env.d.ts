/// <reference types="vite/client" />

import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    id: string;
    name: string;
    colors: {
      body: string;
      scrollHandle: string;
      scrollHandleHover: string;
      primary: string;
      success: string;
      warning: string;
      alert: string;
      secondary: string;
      text: {
        100: string;
        200: string;
        300: string;
      };
    };
  }
}

declare global {
  interface Window {
    Glitchium?: new () => {
      destroyAll: () => void;
      glitch: (
        selector: string | HTMLElement | HTMLElement[] | NodeList,
        options?: Record<string, unknown>
      ) => {
        destroy: () => void;
        start: () => void;
        stop: () => void;
      };
    };
    pJSDom?: Array<{
      fn: {
        vendors: {
          destroypJS: () => void;
        };
      };
    }>;
    particlesJS?: (tagId: string, params: Record<string, unknown>) => void;
    runTerminalCommand?: (command: string | readonly string[]) => void;
  }
}
