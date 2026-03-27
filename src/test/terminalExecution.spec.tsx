import { act, render, waitFor } from "../utils/test-utils";
import { useEffect, useMemo, useState } from "react";
import { describe, expect, it } from "vitest";
import { shellRootPath } from "../shell/filesystem";
import type { ActiveWorkspacePluginState } from "../utils/workspacePluginManifest";
import { useTerminalExecution } from "../terminal/useTerminalExecution";
import type { WorkspaceContextValue } from "../workspace/workspaceStore";

type HarnessApi = {
  enqueueCommand: (command: string) => void;
  getActivePluginStates: () => ActiveWorkspacePluginState[];
  getInputHistory: () => string[];
};

const createWorkspaceValue = (
  activePluginStates: ActiveWorkspacePluginState[],
  setActivePluginStates: (states: ActiveWorkspacePluginState[]) => void
): WorkspaceContextValue => ({
  activePreviewPath: "",
  activePluginPath: activePluginStates.at(-1)?.path ?? "",
  activePluginPaths: activePluginStates.map(state => state.path),
  activePluginStates,
  backgroundBlur: 0,
  backgroundOverlayOpacity: 65,
  backgroundPath: `${shellRootPath}/wallpapers/terminal-wallpaper-neon.jpg`,
  bootstrapCommands: [],
  clearTerminalNotice: () => undefined,
  closeCurrentPreview: () => undefined,
  closePreview: () => undefined,
  consumeBootstrapCommands: () => undefined,
  cwd: shellRootPath,
  ensurePreviewVisible: () => undefined,
  ensureTerminalVisible: () => undefined,
  idlePathname: "/",
  layoutMode: "split",
  openPreview: () => undefined,
  previewMode: "normal",
  previewTabs: [],
  setActivePluginStates,
  setBackgroundBlur: () => undefined,
  setBackgroundOverlayOpacity: () => undefined,
  setBackgroundPath: () => undefined,
  setCurrentDirectory: () => undefined,
  setIdlePathname: () => undefined,
  setLayoutMode: () => undefined,
  setSplitRatio: () => undefined,
  showSplitView: () => undefined,
  showPreviewOnly: () => undefined,
  splitRatio: 0.5,
  terminalNotice: null,
});

const Harness: React.FC<{ onReady: (api: HarnessApi) => void }> = ({ onReady }) => {
  const [activePluginStates, setActivePluginStates] = useState<
    ActiveWorkspacePluginState[]
  >([]);
  const workspace = useMemo(
    () => createWorkspaceValue(activePluginStates, setActivePluginStates),
    [activePluginStates]
  );
  const execution = useTerminalExecution({
    clearInputUi: () => undefined,
    switchTheme: null,
    workspace,
  });

  useEffect(() => {
    onReady({
      enqueueCommand: execution.enqueueCommand,
      getActivePluginStates: () => activePluginStates,
      getInputHistory: () => execution.inputHistory,
    });
  }, [activePluginStates, execution.enqueueCommand, execution.inputHistory, onReady]);

  return null;
};

describe("useTerminalExecution", () => {
  it("excludes system bootstrap entries from input history", async () => {
    let api: HarnessApi | null = null;
    const getApi = () => {
      if (!api) {
        throw new Error("Harness API not ready.");
      }

      return api;
    };

    render(
      <Harness
        onReady={nextApi => {
          api = nextApi;
        }}
      />
    );

    await waitFor(() => expect(api).not.toBeNull());
    expect(getApi().getInputHistory()).toEqual([]);

    act(() => {
      getApi().enqueueCommand("");
      getApi().enqueueCommand("pwd");
    });

    await waitFor(() => expect(getApi().getInputHistory()).toEqual(["pwd"]));
  });

  it("runs the guided script without leaving dock plugins mounted", async () => {
    let api: HarnessApi | null = null;
    const getApi = () => {
      if (!api) {
        throw new Error("Harness API not ready.");
      }

      return api;
    };

    render(
      <Harness
        onReady={nextApi => {
          api = nextApi;
        }}
      />
    );

    await waitFor(() => expect(api).not.toBeNull());

    act(() => {
      getApi().enqueueCommand("bash ~/scripts/welcome.sh");
    });

    await waitFor(() =>
      expect(getApi().getActivePluginStates().map(state => state.path)).toEqual([])
    );
  });
});
