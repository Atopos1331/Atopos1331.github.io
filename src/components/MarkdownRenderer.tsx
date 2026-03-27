import React from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import HighlightedCode from "./HighlightedCode";
import ExecutableCommand from "./ExecutableCommand";
import { getCommandDefinition } from "../commands/specs";
import { parseShellInput } from "../utils/shellRuntime";

const MarkdownSurface = styled.div`
  display: block;
  width: 100%;
  box-sizing: border-box;
  min-height: 100%;
  padding: 1.05rem 1.15rem 1.2rem;
  border: 1px solid ${({ theme }) => `${theme.colors?.primary}32`};
  border-radius: 1rem;
  background:
    linear-gradient(
      180deg,
      ${({ theme }) => `${theme.colors?.body}32`},
      ${({ theme }) => `${theme.colors?.body}28`}
    );
  box-shadow:
    inset 0 1px 0 ${({ theme }) => `${theme.colors?.primary}10`},
    0 10px 24px rgba(3, 10, 18, 0.08);
  color: ${({ theme }) => theme.colors?.text[200]};
  font-size: 0.96rem;
  line-height: 1.68;

  & > * + * {
    margin-top: 0.82rem;
  }

  & > :is(h1, h2, h3, h4, h5, h6):not(:first-child) {
    margin-top: 1.15rem;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
    line-height: 1.22;
    color: ${({ theme }) => theme.colors?.primary};
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  h1 {
    font-size: 1.52rem;
  }

  h2 {
    font-size: 1.28rem;
  }

  h3 {
    font-size: 1.08rem;
  }

  h4,
  h5,
  h6 {
    font-size: 1rem;
  }

  p,
  li,
  blockquote,
  td,
  th {
    color: ${({ theme }) => theme.colors?.text[200]};
  }

  p {
    margin: 0;
  }

  p,
  ul,
  ol,
  blockquote {
    margin: 0;
  }

  ul,
  ol {
    padding-left: 1.2rem;
  }

  ul,
  ol,
  .markdown-table-wrap,
  pre,
  blockquote {
    margin-top: 0.2rem;
  }

  h1 + p,
  h1 + ul,
  h1 + ol,
  h1 + blockquote,
  h1 + .markdown-table-wrap,
  h1 + pre,
  h2 + p,
  h2 + ul,
  h2 + ol,
  h2 + blockquote,
  h2 + .markdown-table-wrap,
  h2 + pre,
  h3 + p,
  h3 + ul,
  h3 + ol,
  h3 + blockquote,
  h3 + .markdown-table-wrap,
  h3 + pre,
  h4 + p,
  h4 + ul,
  h4 + ol,
  h4 + blockquote,
  h4 + .markdown-table-wrap,
  h4 + pre,
  h5 + p,
  h5 + ul,
  h5 + ol,
  h5 + blockquote,
  h5 + .markdown-table-wrap,
  h5 + pre,
  h6 + p,
  h6 + ul,
  h6 + ol,
  h6 + blockquote,
  h6 + .markdown-table-wrap,
  h6 + pre {
    margin-top: 0.92rem;
  }

  li + li {
    margin-top: 0.28rem;
  }

  strong {
    color: ${({ theme }) => theme.colors?.text[100]};
    font-weight: 700;
  }

  em {
    color: ${({ theme }) => theme.colors?.text[100]};
  }

  blockquote {
    padding-left: 1rem;
    border-left: 3px solid ${({ theme }) => `${theme.colors?.primary}54`};
  }

  hr {
    margin-top: 1rem;
    margin-bottom: 1rem;
    border: 0;
    border-top: 1px solid ${({ theme }) => `${theme.colors?.primary}2a`};
  }

  a {
    color: ${({ theme }) => theme.colors?.secondary};
    text-decoration: underline;
    text-underline-offset: 0.16rem;
  }

  code {
    padding: 0.08rem 0.3rem;
    border-radius: 0.35rem;
    background: ${({ theme }) => `${theme.colors?.body}88`};
  }

  del {
    opacity: 0.78;
  }

  input[type="checkbox"] {
    margin-right: 0.55rem;
    accent-color: ${({ theme }) => theme.colors?.primary};
  }

  .contains-task-list {
    padding-left: 0;
    list-style: none;
  }

  .contains-task-list li {
    display: flex;
    align-items: flex-start;
    gap: 0.35rem;
  }

  .markdown-table-wrap {
    width: 100%;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 18rem;
    font-size: 0.94rem;
  }

  th,
  td {
    padding: 0.62rem 0.72rem;
    text-align: left;
    vertical-align: top;
    border: 1px solid ${({ theme }) => `${theme.colors?.primary}22`};
  }

  th {
    color: ${({ theme }) => theme.colors?.text[100]};
    background: ${({ theme }) => `${theme.colors?.primary}14`};
    font-weight: 700;
  }

  tbody tr:nth-child(even) td {
    background: ${({ theme }) => `${theme.colors?.body}52`};
  }
`;

type Props = {
  source: string;
};

const extractCodeText = (children: React.ReactNode) =>
  React.Children.toArray(children)
    .map(child => (typeof child === "string" ? child : ""))
    .join("");

const isRunnableCommand = (value: string) => {
  const parsed = parseShellInput(value);

  if (!parsed.command) {
    return false;
  }

  return !!getCommandDefinition(parsed.command);
};

const markdownComponents: Components = {
  a: ({ children, href, ...props }) => (
    <a {...props} href={href} rel="noreferrer" target="_blank">
      {children}
    </a>
  ),
  code: ({ children, className, node: _node, ...props }) => {
    const codeText = extractCodeText(children);
    const normalizedCodeText = codeText.replace(/\n$/, "");
    const languageMatch = className?.match(/language-([\w-]+)/);
    const language = languageMatch?.[1];
    const isBlockCode =
      !!language || normalizedCodeText.includes("\n") || codeText.endsWith("\n");

    if (isBlockCode) {
      return (
        <HighlightedCode
          code={normalizedCodeText}
          language={language}
        />
      );
    }

    if (isRunnableCommand(normalizedCodeText)) {
      return (
        <ExecutableCommand command={normalizedCodeText}>
          {normalizedCodeText}
        </ExecutableCommand>
      );
    }

    return (
      <code {...props} className={className}>
        {normalizedCodeText}
      </code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  table: ({ children, ...props }) => (
    <div className="markdown-table-wrap">
      <table {...props}>{children}</table>
    </div>
  ),
};

const MarkdownRenderer: React.FC<Props> = ({ source }) => {
  const normalizedSource = source.replace(/\r\n/g, "\n");

  return (
    <MarkdownSurface className="preview-fill">
      <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
        {normalizedSource}
      </ReactMarkdown>
    </MarkdownSurface>
  );
};

export default MarkdownRenderer;
