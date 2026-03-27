import type { PreviewRenderer as ShellPreviewRenderer } from "../../shell/filesystem";

const imageExtensionPattern = /\.(avif|gif|jpe?g|png|svg|webp)$/i;
const audioExtensionPattern = /\.(aac|flac|m4a|mp3|oga|ogg|wav)$/i;
const videoExtensionPattern = /\.(mov|mp4|m4v|ogv|webm)$/i;
const documentExtensionPattern = /\.(pdf)$/i;

/**
 * Returns the display label shown in the preview chrome.
 */
export const getPreviewLabel = (
  renderer?: ShellPreviewRenderer,
  path?: string
) => {
  if (!renderer) {
    return "Preview Panel";
  }

  if (renderer === "markdown") {
    return "Markdown Preview";
  }

  if (renderer === "html" || renderer === "iframe") {
    return "Embedded Preview";
  }

  if (renderer === "plugin") {
    return "Plugin Preview";
  }

  if (renderer === "executable") {
    return "Program Preview";
  }

  if (renderer === "text") {
    return "Source Preview";
  }

  if (path && imageExtensionPattern.test(path)) {
    return "Image Preview";
  }

  if (path && audioExtensionPattern.test(path)) {
    return "Audio Preview";
  }

  if (path && videoExtensionPattern.test(path)) {
    return "Video Preview";
  }

  if (path && documentExtensionPattern.test(path)) {
    return "Document Preview";
  }

  return "Asset Preview";
};

export const previewAssetPatterns = {
  audio: audioExtensionPattern,
  document: documentExtensionPattern,
  image: imageExtensionPattern,
  video: videoExtensionPattern,
} as const;
