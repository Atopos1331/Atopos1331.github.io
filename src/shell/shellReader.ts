import { displayPath, shellRootPath } from "./shellPath";
import { getFile } from "./shellManifest";

type BinaryAssetFallbackReader = (path: string) => Promise<Uint8Array | null>;

let binaryAssetFallbackReader: BinaryAssetFallbackReader | null = null;

export const setBinaryAssetFallbackReader = (
  reader: BinaryAssetFallbackReader | null
) => {
  binaryAssetFallbackReader = reader;
};

/**
 * Shell reader utilities normalize text, bytes, and base64 access for the
 * virtual filesystem regardless of whether content originated as raw text or
 * bundled assets.
 */
export const getFileTextContent = (path: string) => {
  const file = getFile(path);

  if (!file) {
    return null;
  }

  if (file.renderer === "iframe") {
    return `Embedded source: ${file.src}`;
  }

  if (
    file.renderer === "asset" ||
    file.renderer === "plugin" ||
    file.renderer === "executable"
  ) {
    const sourceLabel = file.src.startsWith("data:")
      ? "embedded binary payload"
      : file.src;
    return `Binary asset: ${displayPath(file.path)}\nSource: ${sourceLabel}`;
  }

  return file.content;
};

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = "";

  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
};

const getPackagedRawFallbackPath = (path: string) => {
  if (/\.plg$/i.test(path)) {
    return `src/content${path.slice(shellRootPath.length).replace(/\.plg$/i, ".plg-raw")}`;
  }

  if (/\.exe$/i.test(path)) {
    return `src/content${path.slice(shellRootPath.length).replace(/\.exe$/i, ".exe-raw")}`;
  }

  return null;
};

/**
 * Reads binary assets through the test-only fallback when fetch is unavailable.
 */
const readLocalBinaryAsset = async (path: string) => {
  if (!binaryAssetFallbackReader) {
    return null;
  }

  try {
    const bytes = await binaryAssetFallbackReader(path);

    if (bytes) {
      return bytes;
    }
  } catch {
    return null;
  }

  const rawFallbackPath = getPackagedRawFallbackPath(path);
  return rawFallbackPath ? binaryAssetFallbackReader(rawFallbackPath) : null;
};

/**
 * Returns a file encoded as base64 for shell commands and previews.
 */
export const getFileBase64 = async (path: string) => {
  const file = getFile(path);

  if (!file) {
    return null;
  }

  if (
    file.renderer === "asset" ||
    file.renderer === "plugin" ||
    file.renderer === "executable"
  ) {
    try {
      const response = await fetch(file.src);
      const buffer = await response.arrayBuffer();
      return bytesToBase64(new Uint8Array(buffer));
    } catch {
      const localBytes = await readLocalBinaryAsset(file.path);
      return localBytes ? bytesToBase64(localBytes) : null;
    }
  }

  if (file.renderer === "iframe") {
    return bytesToBase64(new TextEncoder().encode(file.src));
  }

  return bytesToBase64(new TextEncoder().encode(file.content));
};

/**
 * Returns raw bytes for a file.
 */
export const getFileBytes = async (path: string) => {
  const file = getFile(path);

  if (!file) {
    return null;
  }

  if (
    file.renderer === "asset" ||
    file.renderer === "plugin" ||
    file.renderer === "executable"
  ) {
    try {
      const response = await fetch(file.src);
      const buffer = await response.arrayBuffer();
      return new Uint8Array(buffer);
    } catch {
      return readLocalBinaryAsset(file.path);
    }
  }

  if (file.renderer === "iframe") {
    return new TextEncoder().encode(file.src);
  }

  return new TextEncoder().encode(file.content);
};
