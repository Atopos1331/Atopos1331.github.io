import { describe, expect, it } from "vitest";
import { getFile, getFileBytes, listDirectory, shellRootPath } from "../shell/filesystem";
import {
  decodeExecutableBytes,
  decodePluginBytes,
} from "../utils/elfCodec";
import { parseWorkspacePluginManifest } from "../utils/workspacePluginManifest";

describe("elfCodec", () => {
  it("decodes bundled plugin bytes through the shared codec", async () => {
    const bytes = await getFileBytes(`${shellRootPath}/plugins/music-card.plg`);

    expect(bytes).not.toBeNull();
    if (!bytes) {
      throw new Error("Expected bundled plugin bytes.");
    }

    const decoded = decodePluginBytes(bytes);

    expect(decoded.manifest?.name).toBe("Music Deck");
    expect(decoded.manifest?.runtime?.script).toBeTruthy();
    expect(decoded.sourceText).toMatch(/"module"\s*:\s*"music-card"/);
  });

  it("decodes bundled executable bytes through the shared codec", async () => {
    const bytes = await getFileBytes(`${shellRootPath}/programs/echo-loop.exe`);

    expect(bytes).not.toBeNull();
    if (!bytes) {
      throw new Error("Expected bundled executable bytes.");
    }

    const decoded = decodeExecutableBytes(bytes);

    expect(decoded.manifest?.name).toBe("Echo Loop");
    expect(decoded.manifest?.runtime.script).toMatch(/readLine/);
  });

  it("exposes plugins as .plg files without leaking .plg-raw entries", () => {
    const pluginDirectory = listDirectory(`${shellRootPath}/plugins`);
    const pluginFile = getFile(`${shellRootPath}/plugins/music-card.plg`);

    expect(pluginDirectory?.some(entry => entry.name.endsWith(".plg-raw"))).toBe(false);
    expect(pluginDirectory?.some(entry => entry.name === "music-card.plg")).toBe(true);
    expect(pluginFile?.renderer).toBe("plugin");
    expect(
      pluginFile?.renderer === "plugin" &&
        pluginFile.src.startsWith("data:application/octet-stream;base64,")
    ).toBe(true);
  });

  it("accepts self-described modules without a hardcoded module registry", () => {
    const manifest = parseWorkspacePluginManifest(
      JSON.stringify({
        entry: {
          module: "custom-wave",
          mount: "dock",
          scope: "workspace",
        },
        name: "Custom Wave",
        params: {},
        paramsSchema: [],
        runtime: {
          script: "return undefined;",
        },
      })
    );

    expect(manifest).not.toBeNull();
    expect(manifest?.entry.module).toBe("custom-wave");
    expect(manifest?.paramsSchema).toEqual([]);
  });
});
