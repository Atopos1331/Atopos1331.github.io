import styled from "styled-components";

export const Wrapper = styled.div`
  display: grid;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  align-self: stretch;
  align-items: start;
  justify-items: stretch;

  & > * {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }
`;

export const Hero = styled.section`
  padding: 1rem 1.1rem;
  border: 1px solid ${({ theme }) => `${theme.colors?.text[300]}33`};
  background:
    radial-gradient(
      circle at top right,
      ${({ theme }) => `${theme.colors?.primary}18`},
      transparent 42%
    ),
    linear-gradient(
      180deg,
      ${({ theme }) => `${theme.colors?.body}F2`},
      ${({ theme }) => `${theme.colors?.body}D6`}
    );
  border-radius: 1rem;
`;

export const Title = styled.h2`
  margin: 0 0 0.35rem;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors?.primary};
`;

export const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors?.text[200]};
  line-height: 1.6;
`;

export const MetaGrid = styled.section`
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
`;

export const MetaCard = styled.article`
  padding: 0.9rem 1rem;
  border-radius: 0.9rem;
  border: 1px solid ${({ theme }) => `${theme.colors?.text[300]}22`};
  background: ${({ theme }) => `${theme.colors?.body}B8`};
`;

export const MetaLabel = styled.div`
  font-size: 0.76rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors?.text[200]};
`;

export const MetaValue = styled.div`
  margin-top: 0.3rem;
  color: ${({ theme }) => theme.colors?.text[100]};
  word-break: break-word;
`;

export const ControlsCard = styled.section`
  display: grid;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => `${theme.colors?.text[300]}22`};
  background: ${({ theme }) => `${theme.colors?.body}C8`};
`;

export const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

export const InfoText = styled.div`
  color: ${({ theme }) => theme.colors?.text[200]};
  font-size: 0.86rem;
  line-height: 1.65;
`;

export const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors?.alert};
  font-weight: 700;
`;
