export type WorkspacePluginScope = "workspace" | "preview";
export type WorkspacePluginModuleId = string;
export type WorkspacePluginMount = "background" | "dock";
export type WorkspacePluginParamValue = boolean | number | string;
export type WorkspacePluginParamFieldType =
  | "boolean"
  | "color"
  | "number"
  | "select"
  | "string";

export type WorkspacePluginParamOption = {
  label: string;
  value: WorkspacePluginParamValue;
};

export type WorkspacePluginParamSchemaField = {
  defaultValue?: WorkspacePluginParamValue;
  description?: string;
  key: string;
  label: string;
  max?: number;
  min?: number;
  options?: WorkspacePluginParamOption[];
  pattern?: string;
  placeholder?: string;
  step?: number;
  type: WorkspacePluginParamFieldType;
};

export type WorkspacePluginRuntimeSource = string | string[];

export type WorkspacePluginRuntime = {
  css?: string;
  html?: string;
  script?: string;
};

export type WorkspacePluginManifest = {
  description?: string;
  entry: {
    module: WorkspacePluginModuleId;
    mount?: WorkspacePluginMount;
    scope?: WorkspacePluginScope;
  };
  name: string;
  params: Record<string, WorkspacePluginParamValue>;
  paramsSchema: WorkspacePluginParamSchemaField[];
  runtime?: WorkspacePluginRuntime;
  version?: number;
};

export type ActiveWorkspacePluginState = {
  manifest: WorkspacePluginManifest;
  path: string;
  sourceText: string;
};

export const normalizePluginColor = (value: string, fallback: string) => {
  const trimmedValue = value.trim();
  const normalizedValue = trimmedValue.startsWith("#")
    ? trimmedValue.slice(1)
    : trimmedValue;
  const normalizedFallback = fallback.startsWith("#")
    ? fallback
    : `#${fallback}`;

  return /^[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/.test(normalizedValue)
    ? `#${normalizedValue}`
    : normalizedFallback;
};

const parseScope = (value: unknown): WorkspacePluginScope | undefined =>
  value === "workspace" || value === "preview" ? value : undefined;

const parseMount = (value: unknown): WorkspacePluginMount | undefined =>
  value === "background" || value === "dock" ? value : undefined;

const parseModule = (value: unknown): WorkspacePluginModuleId | null =>
  typeof value === "string" && value.trim().length > 0 ? value : null;

const isParamValue = (value: unknown): value is WorkspacePluginParamValue =>
  typeof value === "boolean" ||
  typeof value === "number" ||
  typeof value === "string";

const parseFieldType = (
  value: unknown
): WorkspacePluginParamFieldType | null =>
  value === "boolean" ||
  value === "color" ||
  value === "number" ||
  value === "select" ||
  value === "string"
    ? value
    : null;

const parseParamOption = (
  value: unknown
): WorkspacePluginParamOption | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (typeof record.label !== "string" || !isParamValue(record.value)) {
    return null;
  }

  return {
    label: record.label,
    value: record.value,
  };
};

const parseSchemaField = (
  value: unknown
): WorkspacePluginParamSchemaField | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const type = parseFieldType(record.type);

  if (typeof record.key !== "string" || typeof record.label !== "string" || !type) {
    return null;
  }

  return {
    defaultValue: isParamValue(record.defaultValue) ? record.defaultValue : undefined,
    description:
      typeof record.description === "string" ? record.description : undefined,
    key: record.key,
    label: record.label,
    max:
      typeof record.max === "number" && Number.isFinite(record.max)
        ? record.max
        : undefined,
    min:
      typeof record.min === "number" && Number.isFinite(record.min)
        ? record.min
        : undefined,
    options: Array.isArray(record.options)
      ? record.options
          .map(parseParamOption)
          .filter((option): option is WorkspacePluginParamOption => option !== null)
      : undefined,
    pattern: typeof record.pattern === "string" ? record.pattern : undefined,
    placeholder:
      typeof record.placeholder === "string" ? record.placeholder : undefined,
    step:
      typeof record.step === "number" && Number.isFinite(record.step)
        ? record.step
        : undefined,
    type,
  };
};

const parseRuntimeSource = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }

  if (
    Array.isArray(value) &&
    value.every(entry => typeof entry === "string")
  ) {
    return value.join("\n");
  }

  return undefined;
};

const parseRuntime = (value: unknown): WorkspacePluginRuntime | undefined => {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const record = value as Record<string, WorkspacePluginRuntimeSource>;
  const css = parseRuntimeSource(record.css);
  const html = parseRuntimeSource(record.html);
  const script = parseRuntimeSource(record.script);

  if (!css && !html && !script) {
    return undefined;
  }

  return {
    css,
    html,
    script,
  };
};

const parseParams = (value: unknown) => {
  if (typeof value !== "object" || value === null) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(([, entryValue]) =>
      isParamValue(entryValue)
    )
  ) as Record<string, WorkspacePluginParamValue>;
};

export const parseWorkspacePluginManifest = (
  source: string
): WorkspacePluginManifest | null => {
  try {
    const normalizedSource =
      source.startsWith("PLG:")
        ? atob(source.slice(4))
        : source.startsWith("ELF:")
          ? atob(source.slice(4))
          : source;
    const parsed = JSON.parse(normalizedSource) as Record<string, unknown>;
    const entryRecord =
      typeof parsed.entry === "object" && parsed.entry !== null
        ? (parsed.entry as Record<string, unknown>)
        : null;
    const paramsSchema = Array.isArray(parsed.paramsSchema)
      ? parsed.paramsSchema
          .map(parseSchemaField)
          .filter(
            (field): field is WorkspacePluginParamSchemaField => field !== null
          )
      : [];
    const moduleId = parseModule(entryRecord?.module);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.name !== "string" ||
      !entryRecord ||
      !moduleId
    ) {
      return null;
    }

    return {
      description:
        typeof parsed.description === "string" ? parsed.description : undefined,
      entry: {
        module: moduleId,
        mount: parseMount(entryRecord.mount),
        scope: parseScope(entryRecord.scope),
      },
      name: parsed.name,
      params: parseParams(parsed.params),
      paramsSchema,
      runtime: parseRuntime(parsed.runtime),
      version:
        typeof parsed.version === "number" && Number.isFinite(parsed.version)
          ? parsed.version
          : undefined,
    };
  } catch {
    return null;
  }
};

export const getWorkspacePluginParam = <T extends WorkspacePluginParamValue>(
  manifest: WorkspacePluginManifest | null,
  key: string,
  fallback: T
) => {
  const value = manifest?.params[key];

  return (isParamValue(value) ? value : fallback) as T;
};

const validateSchemaPattern = (
  value: WorkspacePluginParamValue,
  pattern: string | undefined
) => {
  if (!pattern) {
    return true;
  }

  try {
    return new RegExp(pattern).test(String(value));
  } catch {
    return false;
  }
};

export const parseWorkspacePluginParamOverride = (
  field: WorkspacePluginParamSchemaField,
  rawValue: string
): { error?: string; value?: WorkspacePluginParamValue } => {
  if (field.type === "boolean") {
    if (rawValue === "true" || rawValue === "false") {
      const value = rawValue === "true";

      return validateSchemaPattern(value, field.pattern)
        ? { value }
        : {
            error: `${field.key} does not match required pattern ${field.pattern}.`,
          };
    }

    return {
      error: `${field.key} must be true or false.`,
    };
  }

  if (field.type === "number") {
    const value = Number(rawValue);

    if (!Number.isFinite(value)) {
      return {
        error: `${field.key} must be a finite number.`,
      };
    }

    if (field.min !== undefined && value < field.min) {
      return {
        error: `${field.key} must be >= ${field.min}.`,
      };
    }

    if (field.max !== undefined && value > field.max) {
      return {
        error: `${field.key} must be <= ${field.max}.`,
      };
    }

    return validateSchemaPattern(value, field.pattern)
      ? { value }
      : {
          error: `${field.key} does not match required pattern ${field.pattern}.`,
        };
  }

  if (field.type === "select") {
    const isAllowed = field.options?.some(option => String(option.value) === rawValue);

    if (!isAllowed) {
      return {
        error: `${field.key} must be one of: ${(field.options ?? [])
          .map(option => String(option.value))
          .join(", ")}.`,
      };
    }
  }

  if (!validateSchemaPattern(rawValue, field.pattern)) {
    return {
      error: `${field.key} does not match required pattern ${field.pattern}.`,
    };
  }

  return {
    value: rawValue,
  };
};

export const applyWorkspacePluginOverrides = (
  manifest: WorkspacePluginManifest,
  rawOverrides: Record<string, string>
): { errors: string[]; manifest: WorkspacePluginManifest } => {
  const schemaByKey = new Map(
    manifest.paramsSchema.map(field => [field.key, field] as const)
  );
  const nextParams = { ...manifest.params };
  const errors: string[] = [];

  Object.entries(rawOverrides).forEach(([key, rawValue]) => {
    const field = schemaByKey.get(key);

    if (!field) {
      errors.push(`Unknown plugin parameter: ${key}.`);
      return;
    }

    const result = parseWorkspacePluginParamOverride(field, rawValue);

    if (result.error) {
      errors.push(result.error);
      return;
    }

    if (result.value !== undefined) {
      nextParams[key] = result.value;
    }
  });

  return {
    errors,
    manifest: {
      ...manifest,
      params: nextParams,
    },
  };
};
