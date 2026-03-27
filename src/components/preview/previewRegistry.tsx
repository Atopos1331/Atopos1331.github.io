import {
  getFile,
  type ShellFile,
} from "../../shell/filesystem";
import { EmptyPreviewState } from "../styles/PreviewPane.styled";
import { HtmlPreview, IframePreview } from "./EmbedPreview";
import MarkdownPreview from "./MarkdownPreview";
import MediaPreview from "./MediaPreview";
import { ExecutablePreview, PluginPreview } from "./PackagePreview";
import TextPreview from "./TextPreview";
import type { PreviewRendererProps } from "./previewTypes";

type PreviewRegistryEntry = {
  match: (file: ShellFile) => boolean;
  render: (file: ShellFile) => React.ReactNode;
};

type MarkdownFile = Extract<ShellFile, { renderer: "markdown" }>;
type HtmlFile = Extract<ShellFile, { renderer: "html" }>;
type IframeFile = Extract<ShellFile, { renderer: "iframe" }>;
type PluginFile = Extract<ShellFile, { renderer: "plugin" }>;
type ExecutableFile = Extract<ShellFile, { renderer: "executable" }>;
type AssetFile = Extract<ShellFile, { renderer: "asset" }>;
type TextFile = Extract<ShellFile, { renderer: "text" }>;

const previewRegistry: PreviewRegistryEntry[] = [
  {
    match: file => file.renderer === "markdown",
    render: file => <MarkdownPreview source={(file as MarkdownFile).content} />,
  },
  {
    match: file => file.renderer === "html",
    render: file => <HtmlPreview file={file as HtmlFile} />,
  },
  {
    match: file => file.renderer === "iframe",
    render: file => <IframePreview file={file as IframeFile} />,
  },
  {
    match: file => file.renderer === "plugin",
    render: file => <PluginPreview file={file as PluginFile} />,
  },
  {
    match: file => file.renderer === "executable",
    render: file => <ExecutablePreview file={file as ExecutableFile} />,
  },
  {
    match: file => file.renderer === "asset",
    render: file => <MediaPreview file={file as AssetFile} />,
  },
  {
    match: file => file.renderer === "text",
    render: file => <TextPreview file={file as TextFile} />,
  },
];

/**
 * PreviewRenderer resolves a shell file and delegates rendering through a
 * registry of file-specific preview modules.
 */
export const PreviewRenderer: React.FC<PreviewRendererProps> = ({ previewPath }) => {
  const file = getFile(previewPath);

  if (!file) {
    return <EmptyPreviewState>Preview target not found.</EmptyPreviewState>;
  }

  const renderer = previewRegistry.find(entry => entry.match(file));

  return renderer ? (
    <>{renderer.render(file)}</>
  ) : (
    <EmptyPreviewState>Unsupported preview target.</EmptyPreviewState>
  );
};
