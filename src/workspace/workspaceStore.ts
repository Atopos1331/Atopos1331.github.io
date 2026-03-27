import { createContext, useCallback, useEffect, useMemo, useReducer } from "react";
import { shellRootPath } from "../shell/filesystem";
import type {
  LayoutMode,
  PreviewMode,
  WorkspaceBackgroundBlur,
  WorkspaceBackgroundPath,
} from "../types/workspace";
import type { ActiveWorkspacePluginState } from "../utils/workspacePluginManifest";
import {
  getInitialWorkspaceState,
} from "../utils/workspaceState";
import { getFromLS, setToLS } from "../utils/storage";
import {
  createWorkspaceStoreState,
  workspaceReducer,
} from "./workspaceReducer";

const defaultBackgroundPath = `${shellRootPath}/wallpapers/terminal-wallpaper-neon.jpg`;
const defaultBackgroundOverlayOpacity = 65;
const defaultBackgroundBlur = 0;
const emptyBackgroundStorageValue = "__none__";
const workspaceBackgroundPathKey = "workspace-background-path";
const workspaceBackgroundOverlayOpacityKey = "workspace-background-overlay-opacity";
const workspaceBackgroundBlurKey = "workspace-background-blur";

/**
 * Workspace state coordinates shell cwd, preview tabs, layout mode, bootstrap
 * commands, and active plugins in one shared context.
 */
export type WorkspaceContextValue = {
  activePreviewPath: string;
  activePluginPath: string;
  activePluginPaths: string[];
  activePluginStates: ActiveWorkspacePluginState[];
  backgroundBlur: WorkspaceBackgroundBlur;
  backgroundOverlayOpacity: number;
  backgroundPath: WorkspaceBackgroundPath;
  bootstrapCommands: string[];
  closePreview: (path?: string) => void;
  closeCurrentPreview: () => void;
  consumeBootstrapCommands: () => void;
  cwd: string;
  clearTerminalNotice: () => void;
  ensurePreviewVisible: () => void;
  ensureTerminalVisible: () => void;
  idlePathname: string;
  layoutMode: LayoutMode;
  openPreview: (path: string) => void;
  previewMode: PreviewMode;
  previewTabs: string[];
  setActivePluginStates: (states: ActiveWorkspacePluginState[]) => void;
  setBackgroundBlur: (blur: WorkspaceBackgroundBlur) => void;
  setBackgroundOverlayOpacity: (opacity: number) => void;
  setBackgroundPath: (path: WorkspaceBackgroundPath) => void;
  setCurrentDirectory: (path: string) => void;
  setIdlePathname: (pathname: string) => void;
  setLayoutMode: (layoutMode: LayoutMode) => void;
  setSplitRatio: (ratio: number) => void;
  showSplitView: () => void;
  showPreviewOnly: () => void;
  splitRatio: number;
  terminalNotice: string | null;
};

/**
 * Workspace state is shared across the terminal, preview, and plugin systems.
 */
export const workspaceContext = createContext<WorkspaceContextValue | null>(
  null
);

/**
 * Builds the full workspace store from the current URL state.
 */
export const useWorkspaceStore = (pathname: string, search: string) => {
  const initialRouteState = useMemo(
    () => getInitialWorkspaceState(pathname, search),
    [pathname, search]
  );

  const [state, dispatch] = useReducer(
    workspaceReducer,
    initialRouteState,
    routeState =>
      createWorkspaceStoreState(routeState, {
        backgroundBlur: (() => {
          const storedValue = Number(getFromLS(workspaceBackgroundBlurKey));
          return Number.isFinite(storedValue)
            ? Math.min(Math.max(Math.round(storedValue), 0), 40)
            : defaultBackgroundBlur;
        })(),
        backgroundOverlayOpacity: (() => {
          const storedValue = Number(getFromLS(workspaceBackgroundOverlayOpacityKey));
          return Number.isFinite(storedValue)
            ? Math.min(Math.max(Math.round(storedValue), 0), 100)
            : defaultBackgroundOverlayOpacity;
        })(),
        backgroundPath: (() => {
          const storedPath = getFromLS(workspaceBackgroundPathKey);

          if (!storedPath) {
            return defaultBackgroundPath;
          }

          return storedPath === emptyBackgroundStorageValue ? "" : storedPath;
        })(),
      })
  );

  useEffect(() => {
    dispatch({
      type: "syncRoute",
      routeState: initialRouteState,
    });
  }, [initialRouteState]);

  const showPreviewOnly = useCallback(() => {
    dispatch({
      type: "showPreviewOnly",
    });
  }, []);

  const showSplitView = useCallback(() => {
    dispatch({
      type: "showSplitView",
    });
  }, []);

  const ensurePreviewVisible = useCallback(() => {
    dispatch({
      type: "ensurePreviewVisible",
    });
  }, []);

  const ensureTerminalVisible = useCallback(() => {
    dispatch({
      type: "ensureTerminalVisible",
    });
  }, []);

  /**
   * Opens a preview tab and makes sure the workspace is visible.
   */
  const openPreview = useCallback((path: string) => {
    dispatch({
      path,
      type: "openPreview",
    });
  }, []);

  /**
   * Closes a preview tab and updates the active tab and layout state.
   */
  const closePreview = useCallback((path?: string) => {
    dispatch({
      path,
      type: "closePreview",
    });
  }, []);

  const closeCurrentPreview = useCallback(() => {
    closePreview();
  }, [closePreview]);

  const setBackgroundPath = useCallback((path: WorkspaceBackgroundPath) => {
    setToLS(
      workspaceBackgroundPathKey,
      path === "" ? emptyBackgroundStorageValue : path
    );
    dispatch({
      path,
      type: "setBackgroundPath",
    });
  }, []);

  const setBackgroundBlur = useCallback((blur: WorkspaceBackgroundBlur) => {
    const nextBlur = Math.min(Math.max(Math.round(blur), 0), 40);
    setToLS(workspaceBackgroundBlurKey, String(nextBlur));
    dispatch({
      blur: nextBlur,
      type: "setBackgroundBlur",
    });
  }, []);

  const setBackgroundOverlayOpacity = useCallback((opacity: number) => {
    const nextOpacity = Math.min(Math.max(Math.round(opacity), 0), 100);
    setToLS(workspaceBackgroundOverlayOpacityKey, String(nextOpacity));
    dispatch({
      opacity: nextOpacity,
      type: "setBackgroundOverlayOpacity",
    });
  }, []);

  const setActivePluginStates = useCallback((states: ActiveWorkspacePluginState[]) => {
    dispatch({
      states,
      type: "setActivePluginStates",
    });
  }, []);

  const consumeBootstrapCommands = useCallback(() => {
    dispatch({
      type: "consumeBootstrapCommands",
    });
  }, []);

  const clearTerminalNotice = useCallback(() => {
    dispatch({
      type: "clearTerminalNotice",
    });
  }, []);

  const setCurrentDirectory = useCallback((path: string) => {
    dispatch({
      path,
      type: "setCurrentDirectory",
    });
  }, []);

  const setIdlePathname = useCallback((nextPathname: string) => {
    dispatch({
      pathname: nextPathname,
      type: "setIdlePathname",
    });
  }, []);

  const setLayoutMode = useCallback((nextLayoutMode: LayoutMode) => {
    dispatch({
      layoutMode: nextLayoutMode,
      type: "setLayoutMode",
    });
  }, []);

  const setSplitRatio = useCallback((ratio: number) => {
    dispatch({
      ratio,
      type: "setSplitRatio",
    });
  }, []);

  return useMemo(
    () =>
      ({
        activePreviewPath: state.activePreviewPath,
        activePluginPath: state.activePluginStates.at(-1)?.path ?? "",
        activePluginPaths: state.activePluginStates.map(pluginState => pluginState.path),
        activePluginStates: state.activePluginStates,
        backgroundBlur: state.backgroundBlur,
        backgroundOverlayOpacity: state.backgroundOverlayOpacity,
        backgroundPath: state.backgroundPath,
        bootstrapCommands: state.bootstrapCommands,
        clearTerminalNotice,
        closeCurrentPreview,
        closePreview,
        consumeBootstrapCommands,
        cwd: state.cwd,
        ensurePreviewVisible,
        ensureTerminalVisible,
        idlePathname: state.idlePathname,
        layoutMode: state.layoutMode,
        openPreview,
        previewMode: state.previewMode,
        previewTabs: state.previewTabs,
        setActivePluginStates,
        setBackgroundBlur,
        setBackgroundOverlayOpacity,
        setBackgroundPath,
        setCurrentDirectory,
        setIdlePathname,
        setLayoutMode,
        setSplitRatio,
        showPreviewOnly,
        showSplitView,
        splitRatio: state.splitRatio,
        terminalNotice: state.terminalNotice,
      }) satisfies WorkspaceContextValue,
    [
      clearTerminalNotice,
      closeCurrentPreview,
      closePreview,
      consumeBootstrapCommands,
      ensurePreviewVisible,
      ensureTerminalVisible,
      openPreview,
      setActivePluginStates,
      setBackgroundBlur,
      setBackgroundOverlayOpacity,
      setBackgroundPath,
      setCurrentDirectory,
      setIdlePathname,
      setLayoutMode,
      setSplitRatio,
      showPreviewOnly,
      showSplitView,
      state,
    ]
  );
};
