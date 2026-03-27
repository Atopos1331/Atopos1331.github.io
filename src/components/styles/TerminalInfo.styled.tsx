import styled from "styled-components";

export const Wrapper = styled.span`
  display: inline;
  white-space: nowrap;
`;

export const WebsiteName = styled.span`
  color: ${({ theme }) => theme.colors?.primary};
`;

export const User = styled.span`
  color: ${({ theme }) => theme.colors?.secondary};
`;
