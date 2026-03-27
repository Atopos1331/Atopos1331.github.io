import { basename, type HtmlFile, type IframeFile } from "../../shell/filesystem";
import {
  EmbedFallback,
  EmbedLink,
  PreviewEmbedFrame,
} from "../styles/PreviewPane.styled";

/**
 * Sandboxes HTML previews inside an iframe to isolate styles and scripts.
 */
export const HtmlPreview: React.FC<{ file: HtmlFile }> = ({ file }) => (
  <PreviewEmbedFrame
    sandbox="allow-scripts allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox"
    srcDoc={file.content}
    title={basename(file.path)}
  />
);

/**
 * Displays already-externalized iframe sources with a fallback link.
 */
export const IframePreview: React.FC<{ file: IframeFile }> = ({ file }) => (
  <>
    <EmbedFallback>
      If the embedded preview does not load, open{" "}
      <EmbedLink href={file.fallbackUrl} rel="noreferrer" target="_blank">
        {file.title}
      </EmbedLink>
      .
    </EmbedFallback>
    <PreviewEmbedFrame src={file.src} title={file.title} />
  </>
);
