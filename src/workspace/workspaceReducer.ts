import type { InitialWorkspaceState } from "../utils/workspaceState";
import type { LayoutMode, PreviewMode } from "../types/workspace";
import type {
  WorkspaceBackgroundBlur,
  WorkspaceBackgroundPath,
} from "../types/workspace";
import type { ActiveWorkspacePluginState } from "../utils/workspacePluginManifest";
import { getUrlPathForPreview } from "../utils/workspaceState";

export type WorkspaceStoreState = {
  activePreviewPath: string;
  activePluginStates: ActiveWorkspacePluginState[];
  backgroundBlur: WorkspaceBackgroundBlur;
  backgroundOverlayOpacity: number;
  backgroundPath: WorkspaceBackgroundPath;
  bootstrapCommands: string[];
  cwd: string;
  idlePathname: string;
  layoutMode: LayoutMode;
  previewMode: PreviewMode;
  previewTabs: string[];
  splitRatio: number;
  terminalNotice: string | null;
};

export type WorkspaceReducerAction =
  | {
      type: "clearTerminalNotice";
    }
  | {
      type: "closePreview";
      path?: string;
    }
  | {
      type: "consumeBootstrapCommands";
    }
  | {
      type: "ensurePreviewVisible";
    }
  | {
      type: "ensureTerminalVisible";
    }
  | {
      type: "openPreview";
      path: string;
    }
  | {
      type: "setActivePluginStates";
      states: ActiveWorkspacePluginState[];
    }
  | {
      type: "setBackgroundBlur";
      blur: WorkspaceBackgroundBlur;
    }
  | {
      type: "setBackgroundOverlayOpacity";
      opacity: number;
    }
  | {
      type: "setBackgroundPath";
      path: WorkspaceBackgroundPath;
    }
  | {
      type: "setCurrentDirectory";
      path: string;
    }
  | {
      type: "setIdlePathname";
      pathname: string;
    }
  | {
      type: "setLayoutMode";
      layoutMode: LayoutMode;
    }
  | {
      type: "setSplitRatio";
      ratio: number;
    }
  | {
      type: "showPreviewOnly";
    }
  | {
      type: "showSplitView";
    }
  | {
      type: "syncRoute";
      routeState: InitialWorkspaceState;
    };

const clampRounded = (value: number, min: number, max: number) =>
  Math.min(Math.max(Math.round(value), min), max);

const areStringArraysEqual = (
  left: readonly string[],
  right: readonly string[]
) =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

export const createWorkspaceStoreState = (
  routeState: InitialWorkspaceState,
  appearanceState: Pick<
    WorkspaceStoreState,
    "backgroundBlur" | "backgroundOverlayOpacity" | "backgroundPath"
  >
): WorkspaceStoreState => ({
  activePreviewPath: routeState.activePreviewPath,
  activePluginStates: [],
  backgroundBlur: appearanceState.backgroundBlur,
  backgroundOverlayOpacity: appearanceState.backgroundOverlayOpacity,
  backgroundPath: appearanceState.backgroundPath,
  bootstrapCommands: routeState.bootstrapCommands,
  cwd: routeState.cwd,
  idlePathname: routeState.idlePathname,
  layoutMode: routeState.layoutMode,
  previewMode: routeState.previewMode,
  previewTabs: routeState.activePreviewPath ? [routeState.activePreviewPath] : [],
  splitRatio: 0.5,
  terminalNotice: routeState.terminalNotice,
});

export const workspaceReducer = (
  state: WorkspaceStoreState,
  action: WorkspaceReducerAction
): WorkspaceStoreState => {
  switch (action.type) {
    case "syncRoute": {
      const nextPreviewTabs = action.routeState.activePreviewPath
        ? [action.routeState.activePreviewPath]
        : [];

      if (
        state.activePreviewPath === action.routeState.activePreviewPath &&
        areStringArraysEqual(state.bootstrapCommands, action.routeState.bootstrapCommands) &&
        state.cwd === action.routeState.cwd &&
        state.idlePathname === action.routeState.idlePathname &&
        state.layoutMode === action.routeState.layoutMode &&
        state.previewMode === action.routeState.previewMode &&
        areStringArraysEqual(state.previewTabs, nextPreviewTabs) &&
        state.terminalNotice === action.routeState.terminalNotice
      ) {
        return state;
      }

      return {
        ...state,
        activePreviewPath: action.routeState.activePreviewPath,
        bootstrapCommands: action.routeState.bootstrapCommands,
        cwd: action.routeState.cwd,
        idlePathname: action.routeState.idlePathname,
        layoutMode: action.routeState.layoutMode,
        previewMode: action.routeState.previewMode,
        previewTabs: nextPreviewTabs,
        terminalNotice: action.routeState.terminalNotice,
      };
    }
    case "openPreview": {
      const nextPreviewTabs = state.previewTabs.includes(action.path)
        ? state.previewTabs
        : [...state.previewTabs, action.path];

      return {
        ...state,
        activePreviewPath: action.path,
        idlePathname: getUrlPathForPreview(action.path),
        layoutMode: state.layoutMode === "preview" ? "preview" : "split",
        previewTabs: nextPreviewTabs,
      };
    }
    case "closePreview": {
      const targetPath = action.path ?? state.activePreviewPath;
      const nextPreviewTabs = state.previewTabs.filter(path => path !== targetPath);
      const nextActivePath =
        state.activePreviewPath === targetPath
          ? nextPreviewTabs.at(-1) ?? ""
          : state.activePreviewPath;

      return {
        ...state,
        activePreviewPath: nextActivePath,
        idlePathname: nextActivePath ? getUrlPathForPreview(nextActivePath) : "/",
        layoutMode: nextActivePath ? state.layoutMode : "terminal",
        previewTabs: nextPreviewTabs,
      };
    }
    case "consumeBootstrapCommands":
      return state.bootstrapCommands.length === 0
        ? state
        : {
            ...state,
            bootstrapCommands: [],
          };
    case "clearTerminalNotice":
      return state.terminalNotice === null
        ? state
        : {
            ...state,
            terminalNotice: null,
          };
    case "ensurePreviewVisible":
      return state.layoutMode === "preview"
        ? state
        : {
            ...state,
            layoutMode: "split",
          };
    case "ensureTerminalVisible":
      return state.layoutMode === "preview"
        ? {
            ...state,
            layoutMode: "split",
          }
        : state;
    case "setActivePluginStates":
      return {
        ...state,
        activePluginStates: action.states,
      };
    case "setBackgroundPath":
      return {
        ...state,
        backgroundPath: action.path,
      };
    case "setBackgroundBlur":
      return {
        ...state,
        backgroundBlur: clampRounded(action.blur, 0, 40),
      };
    case "setBackgroundOverlayOpacity":
      return {
        ...state,
        backgroundOverlayOpacity: clampRounded(action.opacity, 0, 100),
      };
    case "setCurrentDirectory":
      return {
        ...state,
        cwd: action.path,
      };
    case "setIdlePathname":
      return {
        ...state,
        idlePathname: action.pathname,
      };
    case "setLayoutMode":
      return {
        ...state,
        layoutMode: action.layoutMode,
      };
    case "setSplitRatio":
      return {
        ...state,
        splitRatio: action.ratio,
      };
    case "showPreviewOnly":
      return {
        ...state,
        layoutMode: "preview",
      };
    case "showSplitView":
      return {
        ...state,
        layoutMode: "split",
      };
    default:
      return state;
  }
};
