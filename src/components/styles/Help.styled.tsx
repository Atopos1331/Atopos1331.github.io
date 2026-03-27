import styled from "styled-components";

export const HelpWrapper = styled.div`
  display: grid;
  gap: 0.8rem;
  margin-top: 0.3rem;
  margin-bottom: 0.9rem;
  font-size: 0.84rem;
  line-height: 1.45;
`;

export const HelpGroup = styled.div`
  display: grid;
  gap: 0.38rem;
`;

export const HelpGroupTitle = styled.div`
  color: ${({ theme }) => theme.colors?.secondary};
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const CmdList = styled.div`
  display: grid;
  gap: 0.18rem;
  padding: 0.2rem 0 0.28rem;
  border-bottom: 1px solid ${({ theme }) => `${theme.colors?.text[300]}15`};
`;

export const CmdHead = styled.div`
  display: grid;
  grid-template-columns: minmax(5.75rem, auto) minmax(0, 1fr);
  gap: 0.7rem;
  align-items: baseline;

  @media (max-width: 550px) {
    grid-template-columns: 1fr;
    gap: 0.14rem;
  }
`;

export const Cmd = styled.code`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.08rem 0.45rem;
  border: 1px solid ${({ theme }) => `${theme.colors?.primary}3d`};
  border-radius: 999px;
  background: ${({ theme }) => `${theme.colors?.primary}12`};
  color: ${({ theme }) => theme.colors?.primary};
  font: inherit;
  font-weight: 700;
`;

export const CmdDesc = styled.span`
  color: ${({ theme }) => theme.colors?.text[200]};
  min-width: 0;
`;

export const CmdDetails = styled.div`
  display: grid;
  gap: 0.14rem;
  padding-left: 0.3rem;
`;

export const CmdDetail = styled.code`
  color: ${({ theme }) => theme.colors?.text[300]};
  font: inherit;
  font-size: 0.78rem;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const DetailCard = styled.div`
  display: grid;
  gap: 0.45rem;
  padding: 0.7rem 0.8rem 0.78rem;
  border: 1px solid ${({ theme }) => `${theme.colors?.primary}22`};
  border-radius: 0.8rem;
  background:
    linear-gradient(
      180deg,
      ${({ theme }) => `${theme.colors?.primary}08`},
      transparent 68%
    ),
    ${({ theme }) => `${theme.colors?.body}8a`};
`;

export const DetailHeader = styled.div`
  display: grid;
  gap: 0.22rem;
`;

export const DetailTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
`;

export const DetailBody = styled.div`
  display: grid;
  gap: 0.24rem;
`;

export const DetailHint = styled.div`
  color: ${({ theme }) => theme.colors?.text[200]};
  font-size: 0.77rem;
`;

export const KeyContainer = styled.div`
  display: grid;
  gap: 0.14rem;
  font-size: 0.76rem;
  margin-top: 0.15rem;
  color: ${({ theme }) => theme.colors?.text[200]};

  @media (max-width: 550px) {
    display: none;
  }
`;
