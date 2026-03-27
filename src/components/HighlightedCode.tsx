import { useMemo } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-c";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-css";
import "prismjs/components/prism-diff";
import "prismjs/components/prism-docker";
import "prismjs/components/prism-git";
import "prismjs/components/prism-go";
import "prismjs/components/prism-ini";
import "prismjs/components/prism-java";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-powershell";
import "prismjs/components/prism-python";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-toml";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-yaml";
import {
  CodeBlockFrame,
  CodeBlockHeader,
  CodeBlockLanguage,
  CodeBlockPre,
  CodeBlockViewport,
} from "./styles/PreviewPane.styled";

type HighlightedCodeProps = {
  code: string;
  filePath?: string;
  language?: string;
};

const languageAliases: Record<string, string> = {
  bash: "bash",
  c: "c",
  cpp: "cpp",
  csharp: "csharp",
  console: "bash",
  cs: "csharp",
  css: "css",
  diff: "diff",
  dockerfile: "docker",
  go: "go",
  git: "git",
  html: "markup",
  ini: "ini",
  java: "java",
  js: "javascript",
  json: "json",
  jsx: "jsx",
  markdown: "markdown",
  md: "markdown",
  plaintext: "plain",
  powershell: "powershell",
  sh: "bash",
  shell: "bash",
  sql: "sql",
  text: "plain",
  toml: "toml",
  ts: "typescript",
  tsx: "tsx",
  xml: "markup",
  yaml: "yaml",
  yml: "yaml",
  zsh: "bash",
};

const extensionToLanguage: Record<string, string> = {
  c: "c",
  cc: "cpp",
  cpp: "cpp",
  cs: "csharp",
  css: "css",
  diff: "diff",
  go: "go",
  h: "c",
  hpp: "cpp",
  html: "markup",
  ini: "ini",
  java: "java",
  js: "javascript",
  json: "json",
  jsx: "jsx",
  md: "markdown",
  mjs: "javascript",
  ps1: "powershell",
  psd1: "powershell",
  psm1: "powershell",
  py: "python",
  rs: "rust",
  sh: "bash",
  sql: "sql",
  toml: "toml",
  ts: "typescript",
  tsx: "tsx",
  patch: "diff",
  log: "plain",
  conf: "ini",
  txt: "plain",
  xml: "markup",
  yaml: "yaml",
  yml: "yaml",
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const getLanguageFromPath = (filePath?: string) => {
  if (!filePath || !filePath.includes(".")) {
    return filePath?.split("/").pop()?.toLowerCase() === "dockerfile"
      ? "docker"
      : "plain";
  }

  const extension = filePath.split(".").pop()?.toLowerCase() ?? "";
  return extensionToLanguage[extension] ?? "plain";
};

export const resolveCodeLanguage = (language?: string, filePath?: string) => {
  const normalizedLanguage = language?.trim().toLowerCase();

  if (normalizedLanguage) {
    return languageAliases[normalizedLanguage] ?? normalizedLanguage;
  }

  return getLanguageFromPath(filePath);
};

const HighlightedCode: React.FC<HighlightedCodeProps> = ({
  code,
  filePath,
  language,
}) => {
  const resolvedLanguage = resolveCodeLanguage(language, filePath);
  const showLanguage = resolvedLanguage !== "plain";
  const grammar = Prism.languages[resolvedLanguage];
  const highlightedHtml = useMemo(() => {
    if (!grammar || resolvedLanguage === "plain") {
      return escapeHtml(code);
    }

    return Prism.highlight(code, grammar, resolvedLanguage);
  }, [code, grammar, resolvedLanguage]);

  return (
    <CodeBlockFrame data-code-block-frame="true">
      {showLanguage && (
        <CodeBlockHeader>
          <CodeBlockLanguage>{resolvedLanguage}</CodeBlockLanguage>
        </CodeBlockHeader>
      )}
      <CodeBlockViewport>
        <CodeBlockPre>
          <code
            className={`language-${resolvedLanguage}`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </CodeBlockPre>
      </CodeBlockViewport>
    </CodeBlockFrame>
  );
};

export default HighlightedCode;
