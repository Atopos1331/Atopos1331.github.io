import { describe, expect, it, vi } from "vitest";
import { shellRootPath } from "../shell/filesystem";
import { argTab } from "../utils/funcs";

describe("argTab", () => {
  it("autocompletes plugin file arguments", () => {
    const setInputVal = vi.fn();
    const setSelectionOffset = vi.fn();

    const result = argTab(
      "plugin plugins/cyber",
      shellRootPath,
      setInputVal,
      setSelectionOffset
    );

    expect(result).toEqual([]);
    expect(setInputVal).toHaveBeenCalledWith("plugin plugins/cyber-particles.plg");
  });

  it("autocompletes plugin file arguments for plugin decode", () => {
    const setInputVal = vi.fn();
    const setSelectionOffset = vi.fn();

    const result = argTab(
      "plugin decode plugins/music",
      shellRootPath,
      setInputVal,
      setSelectionOffset
    );

    expect(result).toEqual([]);
    expect(setInputVal).toHaveBeenCalledWith(
      "plugin decode plugins/music-card.plg"
    );
  });

  it("autocompletes plugin file names from the current plugin directory", () => {
    const setInputVal = vi.fn();
    const setSelectionOffset = vi.fn();

    const result = argTab(
      "plugin music",
      `${shellRootPath}/plugins`,
      setInputVal,
      setSelectionOffset
    );

    expect(result).toEqual([]);
    expect(setInputVal).toHaveBeenCalledWith("plugin music-card.plg");
  });
});
