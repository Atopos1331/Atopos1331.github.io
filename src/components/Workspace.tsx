import { useContext, useEffect, useRef, useState } from "react";
import "glitchium/src/glitchium.js";
import { getFile } from "../shell/filesystem";
import { workspaceContext } from "../workspace/workspaceStore";
import { workspaceGlitchEventName } from "../utils/workspaceEvents";
import CommandPanel from "./CommandPanel";
import PreviewPane from "./PreviewPane";
import Terminal from "./Terminal";
import WorkspacePluginHost from "./WorkspacePluginHost";
import {
  DividerHandle,
  Panel,
  WorkspaceBody,
  WorkspaceShell,
} from "./styles/Workspace.styled";

/**
 * Workspace composes the command panel, terminal, preview pane, and plugins.
 */
const Workspace: React.FC = () => {
  const workspace = useContext(workspaceContext);
  const bodyRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLElement>(null);
  const [glitchPhase, setGlitchPhase] = useState<"glitch" | "idle" | "snow">("idle");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const layoutMode = workspace?.layoutMode ?? "terminal";
  const previewMode = workspace?.previewMode ?? "default";
  const splitRatio = workspace?.splitRatio ?? 0.5;
  const setSplitRatio = workspace?.setSplitRatio;
  const backgroundAsset = workspace?.backgroundPath
    ? getFile(workspace.backgroundPath)
    : null;
  const backgroundSrc = backgroundAsset?.renderer === "asset" ? backgroundAsset.src : "";
  const isForcedPreview =
    previewMode === "forced" && (workspace?.activePreviewPath ?? "") !== "";
  const activePlugins = workspace?.activePluginStates ?? [];

  useEffect(() => {
    // The glitch engine is driven by custom terminal events rather than direct command coupling.
    let glitchTimer = 0;
    let snowTimer = 0;
    const glitchEngine = window.Glitchium ? new window.Glitchium() : null;
    const glitchControl =
      glitchEngine && shellRef.current
        ? glitchEngine.glitch(shellRef.current, {
            filters: true,
            fps: 22,
            glitchFrequency: 18,
            hideOverflow: false,
            intensity: 0.95,
            layers: 8,
            playMode: "manual",
            pulse: true,
            shake: true,
            shakeIntensity: 0.22,
            slice: {
              hueRotate: true,
              maxHeight: 0.24,
              minHeight: 0.02,
            },
            smoothTransitions: true,
          })
        : null;

    const handleGlitch = () => {
      window.clearTimeout(glitchTimer);
      window.clearTimeout(snowTimer);
      setGlitchPhase("glitch");
      glitchControl?.start();
      glitchTimer = window.setTimeout(() => {
        glitchControl?.stop();
        setGlitchPhase("snow");
      }, 920);
      snowTimer = window.setTimeout(() => {
        setGlitchPhase("idle");
      }, 2600);
    };

    window.addEventListener(workspaceGlitchEventName, handleGlitch);

    return () => {
      window.removeEventListener(workspaceGlitchEventName, handleGlitch);
      window.clearTimeout(glitchTimer);
      window.clearTimeout(snowTimer);
      glitchControl?.destroy();
      glitchEngine?.destroyAll();
    };
  }, []);

  useEffect(() => {
    if (isForcedPreview || !setSplitRatio) {
      return;
    }

    // Split resizing is implemented at the workspace level so both panes stay in sync.
    const handlePointerMove = (event: PointerEvent) => {
      if (!bodyRef.current) {
        return;
      }

      const rect = bodyRef.current.getBoundingClientRect();
      const nextRatio = (event.clientX - rect.left) / rect.width;
      const clampedRatio = Math.min(Math.max(nextRatio, 0.3), 0.7);
      setSplitRatio(clampedRatio);
    };

    const stopDragging = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
    };

    const startDragging = () => {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", stopDragging);
    };

    const divider = bodyRef.current?.querySelector<HTMLElement>(
      "[data-testid='workspace-divider']"
    );

    divider?.addEventListener("pointerdown", startDragging);

    return () => {
      divider?.removeEventListener("pointerdown", startDragging);
      stopDragging();
    };
  }, [isForcedPreview, setSplitRatio]);

  if (!workspace) {
    return <Terminal />;
  }

  if (isForcedPreview) {
    return (
      <WorkspaceShell
        data-testid="workspace-shell"
        data-glitch-phase={glitchPhase}
        data-layout-mode="preview"
        $glitchPhase={glitchPhase}
        $hasSidebar={false}
        $layoutMode="preview"
        $panelBlur={workspace.backgroundBlur}
        $sidebarCollapsed={false}
        ref={shellRef}
      >
        <WorkspacePluginHost plugins={activePlugins} scope="workspace" />
        <WorkspaceBody
          ref={bodyRef}
          $backgroundBlur={workspace.backgroundBlur}
          $backgroundOverlayOpacity={workspace.backgroundOverlayOpacity}
          $backgroundSrc={backgroundSrc}
          $layoutMode="preview"
          $splitRatio={splitRatio}
        >
          <Panel $layoutMode="preview" $side="preview">
            <WorkspacePluginHost plugins={activePlugins} scope="preview" />
            <PreviewPane />
          </Panel>
        </WorkspaceBody>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell
      data-testid="workspace-shell"
      data-glitch-phase={glitchPhase}
      data-layout-mode={layoutMode}
      $glitchPhase={glitchPhase}
      $hasSidebar
      $layoutMode={layoutMode}
      $panelBlur={workspace.backgroundBlur}
      $sidebarCollapsed={isSidebarCollapsed}
      ref={shellRef}
    >
      <WorkspacePluginHost plugins={activePlugins} scope="workspace" />
      <CommandPanel
        collapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(current => !current)}
      />
      <WorkspaceBody
        ref={bodyRef}
        $backgroundBlur={workspace.backgroundBlur}
        $backgroundOverlayOpacity={workspace.backgroundOverlayOpacity}
        $backgroundSrc={backgroundSrc}
        $layoutMode={layoutMode}
        $splitRatio={splitRatio}
      >
        <Panel $layoutMode={layoutMode} $side="terminal">
          <Terminal />
        </Panel>
        <DividerHandle
          aria-hidden={layoutMode !== "split"}
          data-testid="workspace-divider"
          $layoutMode={layoutMode}
        />
        <Panel $layoutMode={layoutMode} $side="preview">
          <WorkspacePluginHost plugins={activePlugins} scope="preview" />
          <PreviewPane />
        </Panel>
      </WorkspaceBody>
    </WorkspaceShell>
  );
};

export default Workspace;
