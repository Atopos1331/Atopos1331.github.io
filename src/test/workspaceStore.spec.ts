import { act } from "../utils/test-utils";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { shellRootPath } from "../shell/filesystem";
import { useWorkspaceStore } from "../workspace/workspaceStore";

describe("useWorkspaceStore", () => {
  it("uses the updated default background appearance", () => {
    const { result } = renderHook(() => useWorkspaceStore("/", ""));

    expect(result.current.backgroundOverlayOpacity).toBe(65);
    expect(result.current.backgroundBlur).toBe(0);
  });

  it("keeps preview visible when opening a preview from split mode", () => {
    const { result } = renderHook(() => useWorkspaceStore("/", ""));

    act(() => {
      result.current.openPreview(`${shellRootPath}/profile/about.md`);
    });

    expect(result.current.activePreviewPath).toBe(`${shellRootPath}/profile/about.md`);
    expect(result.current.previewTabs).toEqual([`${shellRootPath}/profile/about.md`]);
    expect(result.current.layoutMode).toBe("split");
  });

  it("restores terminal visibility from preview-only mode", () => {
    const { result } = renderHook(() =>
      useWorkspaceStore("/profile/about.md", "?preview=forced")
    );

    act(() => {
      result.current.ensureTerminalVisible();
    });

    expect(result.current.layoutMode).toBe("split");
  });

  it("restores split layout from preview layout", () => {
    const { result } = renderHook(() =>
      useWorkspaceStore("/profile/about.md", "?layout=preview")
    );

    act(() => {
      result.current.showSplitView();
    });

    expect(result.current.layoutMode).toBe("split");
  });

  it("returns to terminal layout when the last preview closes", () => {
    const { result } = renderHook(() => useWorkspaceStore("/", ""));

    act(() => {
      result.current.openPreview(`${shellRootPath}/profile/about.md`);
    });

    act(() => {
      result.current.closeCurrentPreview();
    });

    expect(result.current.activePreviewPath).toBe("");
    expect(result.current.previewTabs).toEqual([]);
    expect(result.current.layoutMode).toBe("terminal");
  });

  it("stores background path and overlay opacity in workspace state", () => {
    const { result } = renderHook(() => useWorkspaceStore("/", ""));

    act(() => {
      result.current.setBackgroundPath(`${shellRootPath}/wallpapers/terminal-wallpaper-neon.jpg`);
      result.current.setBackgroundOverlayOpacity(12);
      result.current.setBackgroundBlur(10);
    });

    expect(result.current.backgroundPath).toBe(
      `${shellRootPath}/wallpapers/terminal-wallpaper-neon.jpg`
    );
    expect(result.current.backgroundOverlayOpacity).toBe(12);
    expect(result.current.backgroundBlur).toBe(10);
  });

  it("syncs route-derived preview state when the browser location changes", () => {
    const { result, rerender } = renderHook(
      ({ pathname, search }) => useWorkspaceStore(pathname, search),
      {
        initialProps: {
          pathname: "/",
          search: "",
        },
      }
    );

    act(() => {
      rerender({
        pathname: "/profile/about.md",
        search: "?layout=preview",
      });
    });

    expect(result.current.activePreviewPath).toBe(`${shellRootPath}/profile/about.md`);
    expect(result.current.previewTabs).toEqual([`${shellRootPath}/profile/about.md`]);
    expect(result.current.layoutMode).toBe("preview");
  });
});
