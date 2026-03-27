export type WorkspaceExecutableManifest = {
  description?: string;
  name: string;
  runtime: {
    script: string;
  };
  version?: number;
};

const parseRuntimeScript = (value: unknown) => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  if (
    Array.isArray(value) &&
    value.every(entry => typeof entry === "string")
  ) {
    const joinedSource = value.join("\n");
    return joinedSource.trim().length > 0 ? joinedSource : undefined;
  }

  return undefined;
};

export const parseWorkspaceExecutableManifest = (
  source: string
): WorkspaceExecutableManifest | null => {
  try {
    const normalizedSource = source.startsWith("EXE:")
      ? atob(source.slice(4))
      : source;
    const parsed = JSON.parse(normalizedSource) as Record<string, unknown>;
    const runtimeRecord =
      typeof parsed.runtime === "object" && parsed.runtime !== null
        ? (parsed.runtime as Record<string, unknown>)
        : null;
    const script = parseRuntimeScript(runtimeRecord?.script);

    if (
      typeof parsed.name !== "string" ||
      parsed.name.trim().length === 0 ||
      !script
    ) {
      return null;
    }

    return {
      description:
        typeof parsed.description === "string" ? parsed.description : undefined,
      name: parsed.name,
      runtime: {
        script,
      },
      version:
        typeof parsed.version === "number" && Number.isFinite(parsed.version)
          ? parsed.version
          : undefined,
    };
  } catch {
    return null;
  }
};
