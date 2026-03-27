import { describe, expect, it } from "vitest";
import { shellRootPath } from "../shell/filesystem";
import {
  getInitialWorkspaceState,
  getUrlPathForPreview,
  resolvePreviewMatchFromUrl,
} from "../utils/workspaceState";

describe("workspaceState", () => {
  it("builds preview bootstrap commands for regular files", () => {
    const result = resolvePreviewMatchFromUrl("/profile/about.md");

    expect(result.kind).toBe("preview");
    expect(result.bootstrapCommands).toEqual(["cd ~/profile", "preview about.md"]);
  });

  it("builds shell bootstrap commands for scripts", () => {
    const result = resolvePreviewMatchFromUrl("/scripts/welcome.sh");

    expect(result.kind).toBe("script");
    expect(result.bootstrapCommands).toEqual(["cd ~/scripts", "bash welcome.sh"]);
  });

  it("suppresses bootstrap commands for forced preview URLs", () => {
    const state = getInitialWorkspaceState("/profile/about.md", "?preview=forced");

    expect(state.activePreviewPath).toBe(`${shellRootPath}/profile/about.md`);
    expect(state.bootstrapCommands).toEqual([]);
    expect(state.layoutMode).toBe("preview");
  });

  it("maps preview paths back to URLs", () => {
    expect(getUrlPathForPreview(`${shellRootPath}/profile/about.md`)).toBe(
      "/profile/about.md"
    );
  });

  it("resolves packaged preview routes directly from .plg and .exe URLs", () => {
    expect(resolvePreviewMatchFromUrl("/plugins/music-card.plg")).toMatchObject({
      kind: "preview",
      previewPath: `${shellRootPath}/plugins/music-card.plg`,
    });
    expect(resolvePreviewMatchFromUrl("/programs/echo-loop.exe")).toMatchObject({
      kind: "preview",
      previewPath: `${shellRootPath}/programs/echo-loop.exe`,
    });
  });
});
