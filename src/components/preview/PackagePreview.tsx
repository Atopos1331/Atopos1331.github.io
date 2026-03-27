import { useMemo } from "react";
import type { ExecutableFile, PluginFile } from "../../shell/filesystem";
import {
  useExecutablePackageData,
  usePluginPackageData,
} from "../../hooks/usePackagedFileData";
import { parseWorkspaceExecutableManifest } from "../../utils/workspaceExecutableManifest";
import { parseWorkspacePluginManifest } from "../../utils/workspacePluginManifest";
import ExecutableManifestPreview from "../ExecutableManifestPreview";
import PluginManifestPreview from "../PluginManifestPreview";
import { EmptyPreviewState } from "../styles/PreviewPane.styled";

/**
 * Decodes and previews packaged plugin files through the shared byte-oriented codec path.
 */
export const PluginPreview: React.FC<{ file: PluginFile }> = ({ file }) => {
  const { error, loading, manifest, sourceText } = usePluginPackageData(file.path);
  const previewManifest = useMemo(
    () => manifest ?? (sourceText ? parseWorkspacePluginManifest(sourceText) : null),
    [manifest, sourceText]
  );

  if (loading && !sourceText && !error) {
    return <EmptyPreviewState>Loading plugin preview...</EmptyPreviewState>;
  }

  return (
    <PluginManifestPreview
      error={error}
      manifest={previewManifest}
      path={file.path}
      sourceText={sourceText}
    />
  );
};

export const ExecutablePreview: React.FC<{ file: ExecutableFile }> = ({ file }) => {
  const { error, loading, manifest, sourceText } = useExecutablePackageData(file.path);
  const previewManifest = useMemo(
    () => manifest ?? (sourceText ? parseWorkspaceExecutableManifest(sourceText) : null),
    [manifest, sourceText]
  );

  if (loading && !sourceText && !error) {
    return <EmptyPreviewState>Loading program preview...</EmptyPreviewState>;
  }

  return (
    <ExecutableManifestPreview
      error={error}
      manifest={previewManifest}
      path={file.path}
      sourceText={sourceText}
    />
  );
};
