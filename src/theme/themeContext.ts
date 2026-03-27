import { createContext } from "react";
import type { DefaultTheme } from "styled-components";

/**
 * Theme actions are kept in a dedicated context so UI modules do not need to
 * import the application root component to switch themes.
 */
export const themeContext = createContext<
  ((switchTheme: DefaultTheme) => void) | null
>(null);
