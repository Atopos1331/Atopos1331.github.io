import { useEffect, useRef, useState } from "react";
import { DefaultTheme, ThemeProvider } from "styled-components";
import { useTheme } from "./hooks/useTheme";
import GlobalStyle from "./components/styles/GlobalStyle";
import Workspace from "./components/Workspace";
import { themeContext } from "./theme/themeContext";
import {
  useWorkspaceStore,
  workspaceContext,
} from "./workspace/workspaceStore";
import { exposeTerminalCommandRunner, runTerminalCommand } from "./utils/terminalEvents";
import { getUrlPathForPreview } from "./utils/workspaceState";

const readBrowserLocation = () => ({
  pathname: window.location.pathname,
  search: window.location.search,
});

/**
 * App wires together theme selection, workspace state, and URL synchronization.
 */
function App() {
  // themes
  const { theme, themeLoaded, setMode } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [browserLocation, setBrowserLocation] = useState(readBrowserLocation);
  const workspaceValue = useWorkspaceStore(
    browserLocation.pathname,
    browserLocation.search
  );
  const bootstrapSignatureRef = useRef("");
  const {
    activePreviewPath,
    bootstrapCommands,
    consumeBootstrapCommands,
    idlePathname,
    layoutMode,
    previewMode,
  } = workspaceValue;

  useEffect(() => {
    // Arrow key handling is owned by the terminal rather than the browser textarea.
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.id === "terminal-input" &&
        ["ArrowUp", "ArrowDown"].includes(e.code)
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown, false);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, false);
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setBrowserLocation(readBrowserLocation());
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  useEffect(() => {
    exposeTerminalCommandRunner();
  }, []);

  useEffect(() => {
    if (bootstrapCommands.length === 0) {
      return;
    }

    const signature = bootstrapCommands.join("\n");

    if (bootstrapSignatureRef.current === signature) {
      return;
    }

    bootstrapSignatureRef.current = signature;
    runTerminalCommand(bootstrapCommands);
    consumeBootstrapCommands();
  }, [bootstrapCommands, consumeBootstrapCommands]);

  useEffect(() => {
    // Preview/layout state is reflected into the URL so reloads preserve context.
    const nextPathname = activePreviewPath
      ? getUrlPathForPreview(activePreviewPath)
      : idlePathname;
    const params = new URLSearchParams(window.location.search);

    if (previewMode === "forced" && activePreviewPath) {
      params.set("preview", "forced");
    } else {
      params.delete("preview");
    }

    if (layoutMode === "split") {
      params.delete("layout");
    } else {
      params.set("layout", layoutMode);
    }

    const nextSearch = params.toString();
    const nextUrl = `${nextPathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;

    if (
      window.location.pathname === nextPathname &&
      window.location.search === (nextSearch ? `?${nextSearch}` : "")
    ) {
      return;
    }

    window.history.replaceState(
      window.history.state,
      "",
      nextUrl
    );
  }, [
    activePreviewPath,
    idlePathname,
    layoutMode,
    previewMode,
  ]);

  // Update meta tag colors when switching themes
  useEffect(() => {
    // Theme colors are copied into browser metadata for PWA and pinned-tab support.
    const themeColor = selectedTheme.colors?.body;

    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    const maskIcon = document.querySelector("link[rel='mask-icon']");
    const metaMsTileColor = document.querySelector(
      "meta[name='msapplication-TileColor']"
    );

    metaThemeColor && metaThemeColor.setAttribute("content", themeColor);
    metaMsTileColor && metaMsTileColor.setAttribute("content", themeColor);
    maskIcon && maskIcon.setAttribute("color", themeColor);
  }, [selectedTheme]);

  const themeSwitcher = (switchTheme: DefaultTheme) => {
    setSelectedTheme(switchTheme);
    setMode(switchTheme);
  };

  return (
    <>
      <h1 className="sr-only" aria-label="Terminal Portfolio">
        CHEN Yifu Terminal Portfolio
      </h1>
      {themeLoaded && (
        <ThemeProvider theme={selectedTheme}>
          <GlobalStyle />
          <themeContext.Provider value={themeSwitcher}>
            <workspaceContext.Provider value={workspaceValue}>
              <Workspace />
            </workspaceContext.Provider>
          </themeContext.Provider>
        </ThemeProvider>
      )}
    </>
  );
}

export default App;
