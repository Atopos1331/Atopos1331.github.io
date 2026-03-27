import {
  displayPath,
  getFile,
  getPathSuggestions,
  resolveShellPath,
  shellRootPath,
} from "../../shell/filesystem";
import { defineCommand } from "../helpers";

const imageExtensions = ["avif", "gif", "jpg", "jpeg", "png", "svg", "webp"] as const;
const opacitySuggestions = ["0", "10", "18", "25", "40", "60", "80", "100"] as const;
const blurSuggestions = ["0", "4", "8", "12", "16", "20", "24", "32", "40"] as const;

const isWallpaperAsset = (path: string) =>
  imageExtensions.some(extension => path.toLowerCase().endsWith(`.${extension}`));

const parseOpacity = (value: string | undefined) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  const rounded = Math.round(parsed);
  return rounded >= 0 && rounded <= 100 ? rounded : null;
};

const parseBlur = (value: string | undefined) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  const rounded = Math.round(parsed);
  return rounded >= 0 && rounded <= 40 ? rounded : null;
};

const resolveBackgroundTarget = (value: string, cwd: string) => {
  if (value === "none") {
    return {
      kind: "none" as const,
      path: "",
    };
  }

  const resolvedPath = resolveShellPath(value, cwd);
  const file = resolvedPath ? getFile(resolvedPath) : null;

  if (!file || file.renderer !== "asset" || !isWallpaperAsset(file.path)) {
    return null;
  }

  return {
    kind: "asset" as const,
    path: file.path,
  };
};

export const backgroundCommand = defineCommand({
  name: "background",
  desc: "switch wallpaper, overlay opacity, and blur",
  autocomplete: ({ activeArgIndex, activeToken, cwd, tokens }) => {
    if (activeArgIndex === 0) {
      const presetSuggestions = ["none", "opacity", "blur"].filter(option =>
        option.startsWith(activeToken)
      );

      return [
        ...presetSuggestions,
        ...getPathSuggestions(activeToken, cwd).filter(suggestion =>
          suggestion.endsWith("/") ||
          imageExtensions.some(extension =>
            suggestion.toLowerCase().endsWith(`.${extension}`)
          )
        ),
      ];
    }

    if (tokens[1] === "opacity") {
      return activeArgIndex === 1
        ? opacitySuggestions.filter(option => option.startsWith(activeToken))
        : [];
    }

    if (tokens[1] === "blur") {
      return activeArgIndex === 1
        ? blurSuggestions.filter(option => option.startsWith(activeToken))
        : [];
    }

    if (activeArgIndex === 1) {
      return opacitySuggestions.filter(option => option.startsWith(activeToken));
    }

    if (activeArgIndex === 2) {
      return blurSuggestions.filter(option => option.startsWith(activeToken));
    }

    return [];
  },
  execute: async context => {
    const {
      arg,
      cwd,
      emit,
      getBackgroundBlur,
      getBackgroundOverlayOpacity,
      getBackgroundPath,
      setBackgroundBlur,
      setBackgroundOverlayOpacity,
      setBackgroundPath,
    } = context;
    const currentBackgroundPath = getBackgroundPath?.() ?? "";
    const currentOpacity = getBackgroundOverlayOpacity?.() ?? 18;
    const currentBlur = getBackgroundBlur?.() ?? 0;
    const usageText =
      "Usage: background <none | image-path> [opacity 0-100] [blur 0-40] | background opacity <0-100> | background blur <0-40>";

    if (arg.length === 0) {
      await emit({
        kind: "line",
        text: `Current background: ${currentBackgroundPath ? displayPath(currentBackgroundPath) : "none"}`,
      });
      await emit({
        kind: "line",
        text: `Overlay opacity: ${currentOpacity}%`,
      });
      await emit({
        kind: "line",
        text: `Background blur: ${currentBlur}px`,
      });
      await emit({
        kind: "line",
        text: usageText,
        tone: "muted",
      });
      return;
    }

    if (arg[0] === "opacity") {
      const nextOpacity = parseOpacity(arg[1]);

      if (arg.length !== 2 || nextOpacity === null) {
        await emit({
          kind: "line",
          text: "Usage: background opacity <0-100>",
          tone: "error",
        });
        return;
      }

      setBackgroundOverlayOpacity?.(nextOpacity);
      await emit({
        kind: "line",
        text: `Overlay opacity set to ${nextOpacity}%`,
      });
      return;
    }

    if (arg[0] === "blur") {
      const nextBlur = parseBlur(arg[1]);

      if (arg.length !== 2 || nextBlur === null) {
        await emit({
          kind: "line",
          text: "Usage: background blur <0-40>",
          tone: "error",
        });
        return;
      }

      setBackgroundBlur?.(nextBlur);
      await emit({
        kind: "line",
        text: `Background blur set to ${nextBlur}px`,
      });
      return;
    }

    if (arg.length > 3) {
      await emit({
        kind: "line",
        text: usageText,
        tone: "error",
      });
      return;
    }

    const backgroundTarget = resolveBackgroundTarget(arg[0], cwd);
    const nextOpacity = arg[1] ? parseOpacity(arg[1]) : null;
    const nextBlur = arg[2] ? parseBlur(arg[2]) : null;

    if (!backgroundTarget) {
      await emit({
        kind: "line",
        text: `background: invalid wallpaper: ${arg[0]}`,
        tone: "error",
      });
      return;
    }

    if (arg[1] && nextOpacity === null) {
      await emit({
        kind: "line",
        text: "background: opacity must be between 0 and 100",
        tone: "error",
      });
      return;
    }

    if (arg[2] && nextBlur === null) {
      await emit({
        kind: "line",
        text: "background: blur must be between 0 and 40",
        tone: "error",
      });
      return;
    }

    setBackgroundPath?.(backgroundTarget.path);

    if (nextOpacity !== null) {
      setBackgroundOverlayOpacity?.(nextOpacity);
    }

    if (nextBlur !== null) {
      setBackgroundBlur?.(nextBlur);
    }

    await emit({
      kind: "line",
      text: `Background set to ${backgroundTarget.path ? displayPath(backgroundTarget.path) : "none"}`,
    });
    await emit({
      kind: "line",
      text: `Overlay opacity: ${nextOpacity ?? currentOpacity}%`,
      tone: "muted",
    });
    await emit({
      kind: "line",
      text: `Background blur: ${nextBlur ?? currentBlur}px`,
      tone: "muted",
    });
  },
  group: "Workspace",
  tab: 2,
});

export const defaultWorkspaceBackgroundPath = `${shellRootPath}/wallpapers/terminal-wallpaper-neon.jpg`;
