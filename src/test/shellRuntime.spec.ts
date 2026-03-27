import { describe, expect, it } from "vitest";
import { shellRootPath } from "../shell/filesystem";
import {
  executeShellLine,
  executeShellScript,
  parseShellInput,
  type ShellRuntimeChunk,
  type ShellRuntimeContext,
} from "../utils/shellRuntime";
import {
  defaultShellSessionPreferences,
  type ShellSessionPreferences,
} from "../utils/shellSession";
import {
  defaultTypingPreferences,
  type TypingPreferences,
} from "../utils/typingPreferences";

const createRuntimeHarness = () => {
  const chunks: ShellRuntimeChunk[] = [];
  let backgroundBlur = 0;
  let backgroundOverlayOpacity = 18;
  let backgroundPath = `${shellRootPath}/wallpapers/terminal-wallpaper-neon.jpg`;
  let cwd: string = shellRootPath;
  let shellPreferences: ShellSessionPreferences = defaultShellSessionPreferences;
  let typingPreferences: TypingPreferences = {
    ...defaultTypingPreferences,
    enabled: false,
  };

  const context: ShellRuntimeContext = {
    emit: async chunk => {
      chunks.push(chunk);
    },
    getBackgroundBlur: () => backgroundBlur,
    getBackgroundOverlayOpacity: () => backgroundOverlayOpacity,
    getBackgroundPath: () => backgroundPath,
    getCwd: () => cwd,
    getShellPreferences: () => shellPreferences,
    getTypingPreferences: () => typingPreferences,
    setBackgroundBlur: nextBlur => {
      backgroundBlur = nextBlur;
    },
    setBackgroundOverlayOpacity: nextOpacity => {
      backgroundOverlayOpacity = nextOpacity;
    },
    setBackgroundPath: nextPath => {
      backgroundPath = nextPath;
    },
    setCwd: nextCwd => {
      cwd = nextCwd;
    },
    setShellPreferences: nextPreferences => {
      shellPreferences = nextPreferences;
    },
    setTypingPreferences: nextPreferences => {
      typingPreferences = nextPreferences;
    },
  };

  return {
    chunks,
    context,
    getBackgroundBlur: () => backgroundBlur,
    getBackgroundOverlayOpacity: () => backgroundOverlayOpacity,
    getBackgroundPath: () => backgroundPath,
    getShellPreferences: () => shellPreferences,
  };
};

describe("shellRuntime", () => {
  it("parses comments while preserving quoted hash characters", () => {
    expect(parseShellInput("echo '# keep' # remove")).toEqual({
      command: "echo",
      comment: "# remove",
      content: "echo '# keep' ",
      normalizedInput: "echo '# keep'",
      tokens: ["echo", "# keep"],
    });
  });

  it("runs sleep entirely through its command definition without emitting output", async () => {
    const { chunks, context } = createRuntimeHarness();

    const result = await executeShellLine("sleep 0", context);

    expect(result.emittedOutput).toBe(false);
    expect(chunks).toEqual([]);
  });

  it("emits a command-local validation error for invalid sleep durations", async () => {
    const { chunks, context } = createRuntimeHarness();

    const result = await executeShellLine("sleep nope", context);

    expect(result.emittedOutput).toBe(true);
    expect(chunks).toEqual([
      {
        kind: "line",
        text: "sleep: invalid duration: nope",
        tone: "error",
      },
    ]);
  });

  it("emits an error when cd targets a missing directory", async () => {
    const { chunks, context } = createRuntimeHarness();

    const result = await executeShellLine("cd ~/missing", context);

    expect(result.emittedOutput).toBe(true);
    expect(chunks).toEqual([
      {
        kind: "line",
        text: "cd: no such file or directory: ~/missing",
        tone: "error",
      },
    ]);
  });

  it("emits an error when cd targets a file", async () => {
    const { chunks, context } = createRuntimeHarness();

    const result = await executeShellLine("cd ~/description.md", context);

    expect(result.emittedOutput).toBe(true);
    expect(chunks).toEqual([
      {
        kind: "line",
        text: "cd: not a directory: ~/description.md",
        tone: "error",
      },
    ]);
  });

  it("preserves verbose script semantics while executing command files", async () => {
    const { chunks, context, getShellPreferences } = createRuntimeHarness();

    await executeShellScript("set -v\nsleep 0", context);

    expect(chunks).toEqual([
      {
        kind: "source",
        sourceKind: "command",
        text: "set -v",
        tone: "muted",
      },
      {
        kind: "source",
        sourceKind: "command",
        text: "sleep 0",
        tone: "muted",
      },
    ]);
    expect(getShellPreferences().verbose).toBe(true);
  });

  it("updates wallpaper opacity through the background command", async () => {
    const {
      chunks,
      context,
      getBackgroundOverlayOpacity,
      getBackgroundPath,
    } = createRuntimeHarness();

    const result = await executeShellLine("background opacity 12", context);

    expect(result.emittedOutput).toBe(true);
    expect(getBackgroundOverlayOpacity()).toBe(12);
    expect(getBackgroundPath()).toBe(
      `${shellRootPath}/wallpapers/terminal-wallpaper-neon.jpg`
    );
    expect(chunks).toEqual([
      {
        kind: "line",
        text: "Overlay opacity set to 12%",
      },
    ]);
  });

  it("updates background blur through the background command", async () => {
    const { chunks, context, getBackgroundBlur, getBackgroundPath } =
      createRuntimeHarness();

    const result = await executeShellLine("background blur 16", context);

    expect(result.emittedOutput).toBe(true);
    expect(getBackgroundBlur()).toBe(16);
    expect(getBackgroundPath()).toBe(
      `${shellRootPath}/wallpapers/terminal-wallpaper-neon.jpg`
    );
    expect(chunks).toEqual([
      {
        kind: "line",
        text: "Background blur set to 16px",
      },
    ]);
  });

  it("updates background, opacity, and blur via positional arguments", async () => {
    const {
      chunks,
      context,
      getBackgroundBlur,
      getBackgroundOverlayOpacity,
      getBackgroundPath,
    } = createRuntimeHarness();

    const result = await executeShellLine(
      "background ~/wallpapers/terminal-wallpaper-neon.jpg 12 8",
      context
    );

    expect(result.emittedOutput).toBe(true);
    expect(getBackgroundPath()).toBe(
      `${shellRootPath}/wallpapers/terminal-wallpaper-neon.jpg`
    );
    expect(getBackgroundOverlayOpacity()).toBe(12);
    expect(getBackgroundBlur()).toBe(8);
    expect(chunks.map(chunk => chunk.kind === "line" ? chunk.text : chunk.kind)).toEqual([
      "Background set to ~/wallpapers/terminal-wallpaper-neon.jpg",
      "Overlay opacity: 12%",
      "Background blur: 8px",
    ]);
  });
});
