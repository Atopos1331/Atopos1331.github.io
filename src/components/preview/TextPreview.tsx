import type { TextFile } from "../../shell/filesystem";
import HighlightedCode from "../HighlightedCode";

/**
 * Renders code-like text files with syntax highlighting inferred from the path.
 */
const TextPreview: React.FC<{ file: TextFile }> = ({ file }) => (
  <HighlightedCode
    code={file.content}
    filePath={file.path}
    language={file.path.endsWith(".sh") ? "bash" : undefined}
  />
);

export default TextPreview;
