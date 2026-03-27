import MarkdownRenderer from "../MarkdownRenderer";

/**
 * Renders markdown sources through the shared markdown component.
 */
const MarkdownPreview: React.FC<{ source: string }> = ({ source }) => (
  <MarkdownRenderer source={source} />
);

export default MarkdownPreview;
