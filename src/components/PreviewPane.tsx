import { useContext } from "react";
import { workspaceContext } from "../workspace/workspaceStore";
import { basename, displayPath, getFile } from "../shell/filesystem";
import { getPreviewLabel, PreviewRenderer } from "./preview/previewRenderers";
import {
  ControlButton,
  ControlGroup,
  ControlIcon,
  DocMeta,
  DocName,
  EmptyPreviewState,
  ForcedPreviewName,
  ForcedPreviewShell,
  HeaderSpacer,
  PreviewBody,
  PreviewEyebrow,
  PreviewHeader,
  PreviewShell,
  PreviewTab,
  PreviewTabClose,
  TabBar,
} from "./styles/PreviewPane.styled";

/**
 * PreviewPane renders the active preview tab and delegates file rendering
 * to the preview renderer registry.
 */
const PreviewPane: React.FC = () => {
  const workspace = useContext(workspaceContext);
  const activeLayout = workspace?.layoutMode ?? "split";
  const previewPath = workspace?.activePreviewPath ?? "";
  const previewTabs = workspace?.previewTabs ?? [];
  const previewFile = getFile(previewPath);
  const showBodyEyebrow =
    previewFile?.renderer !== "html" && previewFile?.renderer !== "iframe";
  const isForcedPreview = workspace?.previewMode === "forced";
  const isMarkdownPreview = previewFile?.renderer === "markdown";

  if (isForcedPreview) {
    return (
      <ForcedPreviewShell data-testid="preview-pane">
        <ForcedPreviewName>{previewPath ? basename(previewPath) : "Preview"}</ForcedPreviewName>
        {previewPath ? (
          <PreviewRenderer previewPath={previewPath} />
        ) : (
          <EmptyPreviewState>Select a file to preview.</EmptyPreviewState>
        )}
      </ForcedPreviewShell>
    );
  }

  return (
    <PreviewShell data-testid="preview-pane">
      {previewTabs.length > 0 && (
        <TabBar>
          {previewTabs.map(tabPath => (
            <PreviewTab
              key={tabPath}
              $active={tabPath === previewPath}
              onClick={() => workspace?.openPreview(tabPath)}
              type="button"
            >
              {basename(tabPath)}
              <PreviewTabClose
                aria-label={`Close ${basename(tabPath)}`}
                onClick={event => {
                  event.stopPropagation();
                  workspace?.closePreview(tabPath);
                }}
                type="button"
              >
                x
              </PreviewTabClose>
            </PreviewTab>
          ))}
        </TabBar>
      )}
      <PreviewHeader key={`${previewPath}-header`}>
        <HeaderSpacer aria-hidden="true" />
        <DocMeta>
          <PreviewEyebrow>
            {previewPath
              ? getPreviewLabel(previewFile?.renderer, previewFile?.path)
              : "Preview Panel"}
          </PreviewEyebrow>
          <DocName>{previewPath ? displayPath(previewPath) : "No file selected"}</DocName>
        </DocMeta>
        <ControlGroup aria-label="Preview controls">
          <ControlButton
            aria-label={activeLayout === "preview" ? "Restore preview" : "Maximize preview"}
            type="button"
            onClick={() =>
              activeLayout === "preview"
                ? workspace?.showSplitView()
                : workspace?.showPreviewOnly()
            }
          >
            <ControlIcon $kind={activeLayout === "preview" ? "restore" : "maximize"} />
          </ControlButton>
          <ControlButton
            $variant="close"
            aria-label="Close preview"
            type="button"
            onClick={() => workspace?.closeCurrentPreview()}
          >
            <ControlIcon $kind="close" />
          </ControlButton>
        </ControlGroup>
      </PreviewHeader>
      <PreviewBody
        key={previewPath || "empty-preview"}
        data-markdown-preview={isMarkdownPreview ? "true" : undefined}
      >
        {previewPath ? (
          <>
            {showBodyEyebrow && <PreviewEyebrow>{basename(previewPath)}</PreviewEyebrow>}
            <PreviewRenderer previewPath={previewPath} />
          </>
        ) : (
          <EmptyPreviewState>Select a file to preview.</EmptyPreviewState>
        )}
      </PreviewBody>
    </PreviewShell>
  );
};

export default PreviewPane;
