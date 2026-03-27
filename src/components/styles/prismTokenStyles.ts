import { css } from "styled-components";

export const prismTokenStyles = css`
  & .token.comment,
  & .token.prolog,
  & .token.doctype,
  & .token.cdata {
    color: ${({ theme }) => theme.colors?.primary} !important;
    font-style: italic;
  }

  & .token.punctuation,
  & .token.operator,
  & .token.entity,
  & .token.url {
    color: ${({ theme }) => theme.colors?.text[100]} !important;
  }

  & .token.property,
  & .token.tag,
  & .token.boolean,
  & .token.number,
  & .token.constant,
  & .token.symbol,
  & .token.selector,
  & .token.attr-name,
  & .token.keyword,
  & .token.atrule {
    color: ${({ theme }) => theme.colors?.warning} !important;
  }

  & .token.function,
  & .token.builtin,
  & .token.class-name {
    color: ${({ theme }) => theme.colors?.success} !important;
    font-weight: 600;
  }

  & .token.string,
  & .token.char,
  & .token.attr-value,
  & .token.inserted {
    color: ${({ theme }) => theme.colors?.secondary} !important;
  }

  & .token.deleted,
  & .token.important {
    color: ${({ theme }) => theme.colors?.alert} !important;
  }

  & .token.regex,
  & .token.variable {
    color: ${({ theme }) => theme.colors?.text[100]} !important;
  }
`;
