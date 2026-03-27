import { useEffect, useRef } from "react";
import { parseBlob, selectCover } from "music-metadata";
import styled, { useTheme } from "styled-components";
import { getFile, listDirectory, shellRootPath } from "../shell/filesystem";
import type {
  ActiveWorkspacePluginState,
  WorkspacePluginManifest,
  WorkspacePluginScope,
} from "../utils/workspacePluginManifest";
import { normalizePluginColor } from "../utils/workspacePluginManifest";
import { workspaceCommandPulseEventName } from "../utils/workspaceEvents";

const Host = styled.div<{ $scope: WorkspacePluginScope }>`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: ${({ $scope }) => ($scope === "preview" ? 0 : 2)};
`;

const RuntimeLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
`;

type PluginRuntimeApi = {
  getFile: typeof getFile;
  host: HTMLDivElement;
  listDirectory: typeof listDirectory;
  makeDraggable: (element: HTMLElement, handle?: HTMLElement | null) => () => void;
  manifest: WorkspacePluginManifest;
  mediaMetadata: {
    parseBlob: typeof parseBlob;
    selectCover: typeof selectCover;
  };
  normalizeColor: (value: string, fallback: string) => string;
  onWorkspaceCommandPulse: (handler: (command: string) => void) => () => void;
  params: WorkspacePluginManifest["params"];
  root: HTMLDivElement;
  scope: WorkspacePluginScope;
  shellRootPath: string;
  theme: ReturnType<typeof useTheme>;
};

type Props = {
  plugins: ActiveWorkspacePluginState[];
  scope: WorkspacePluginScope;
};

/**
 * Restricts drag interactions to the current plugin host bounds.
 */
const makeDraggableWithinHost = (
  element: HTMLElement,
  handle: HTMLElement | null,
  host: HTMLElement
) => {
  const dragHandle = handle ?? element;
  let cleanupPointerMove: (() => void) | null = null;
  let cleanupPointerUp: (() => void) | null = null;

  const stopDragging = () => {
    cleanupPointerMove?.();
    cleanupPointerMove = null;
    cleanupPointerUp?.();
    cleanupPointerUp = null;
    element.dataset.dragging = "false";
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (event.button !== 0) {
      return;
    }

    const hostRect = host.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const offsetX = event.clientX - elementRect.left;
    const offsetY = event.clientY - elementRect.top;

    element.dataset.dragging = "true";

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const maxX = Math.max(0, hostRect.width - elementRect.width);
      const maxY = Math.max(0, hostRect.height - elementRect.height);
      const nextX = Math.min(
        Math.max(0, moveEvent.clientX - hostRect.left - offsetX),
        maxX
      );
      const nextY = Math.min(
        Math.max(0, moveEvent.clientY - hostRect.top - offsetY),
        maxY
      );

      element.style.left = `${nextX}px`;
      element.style.top = `${nextY}px`;
      element.style.right = "auto";
      element.style.bottom = "auto";
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging, { once: true });
    cleanupPointerMove = () =>
      window.removeEventListener("pointermove", handlePointerMove);
    cleanupPointerUp = () =>
      window.removeEventListener("pointerup", stopDragging);
  };

  dragHandle.addEventListener("pointerdown", handlePointerDown);

  return () => {
    stopDragging();
    dragHandle.removeEventListener("pointerdown", handlePointerDown);
  };
};

const RuntimePluginRenderer: React.FC<{
  plugin: ActiveWorkspacePluginState;
  scope: WorkspacePluginScope;
}> = ({ plugin, scope }) => {
  const theme = useTheme();
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const runtime = plugin.manifest.runtime;

    if (!host || !runtime) {
      return;
    }

    host.innerHTML = "";

    if (runtime.css) {
      const style = document.createElement("style");
      style.textContent = runtime.css;
      host.appendChild(style);
    }

    if (runtime.html) {
      const template = document.createElement("template");
      template.innerHTML = runtime.html;
      host.appendChild(template.content.cloneNode(true));
    }

    const cleanups: Array<() => void> = [];
    let runtimeCleanup: (() => void) | undefined;

    const api: PluginRuntimeApi = {
      getFile,
      host,
      listDirectory,
      makeDraggable: (element, handle) => {
        const cleanup = makeDraggableWithinHost(element, handle ?? null, host);
        cleanups.push(cleanup);
        return cleanup;
      },
      manifest: plugin.manifest,
      mediaMetadata: {
        parseBlob,
        selectCover,
      },
      normalizeColor: normalizePluginColor,
      onWorkspaceCommandPulse: handler => {
        const listener = (event: Event) => {
          const customEvent = event as CustomEvent<{ command?: string }>;
          handler(customEvent.detail?.command ?? "");
        };

        window.addEventListener(workspaceCommandPulseEventName, listener);
        const cleanup = () =>
          window.removeEventListener(workspaceCommandPulseEventName, listener);
        cleanups.push(cleanup);
        return cleanup;
      },
      params: plugin.manifest.params,
      root: host,
      scope,
      shellRootPath,
      theme,
    };

    if (runtime.script) {
      void (async () => {
        try {
          const runner = new Function(
            "api",
            `"use strict"; return (async () => {${runtime.script}\n})();`
          ) as (api: PluginRuntimeApi) => Promise<unknown>;
          const result = await runner(api);

          if (typeof result === "function") {
            runtimeCleanup = result as () => void;
          }
        } catch (error) {
          console.error("Failed to execute plugin runtime", error);
        }
      })();
    }

    return () => {
      runtimeCleanup?.();
      cleanups.reverse().forEach(cleanup => cleanup());
      host.innerHTML = "";
    };
  }, [plugin, scope, theme]);

  return (
    <Host $scope={scope} data-testid={`workspace-plugin-host-${scope}-${plugin.path}`}>
      <RuntimeLayer ref={hostRef} />
    </Host>
  );
};

/**
 * Filters plugins by scope and mounts each one through the appropriate host.
 */
const WorkspacePluginHost: React.FC<Props> = ({ plugins, scope }) => {
  const scopedPlugins = plugins.filter(
    plugin => (plugin.manifest.entry.scope ?? "workspace") === scope
  );

  return (
    <>
      {scopedPlugins.map(plugin => (
        <RuntimePluginRenderer key={plugin.path} plugin={plugin} scope={scope} />
      ))}
    </>
  );
};

export default WorkspacePluginHost;
