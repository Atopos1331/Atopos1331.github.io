declare module "prismjs" {
  export type PrismTokenStream = Array<string | PrismToken>;

  export type PrismToken = {
    type: string;
    content: string | PrismTokenStream;
    alias?: string | string[];
  };

  const Prism: {
    highlight: (text: string, grammar: unknown, language: string) => string;
    languages: Record<string, unknown>;
    tokenize: (text: string, grammar: unknown) => PrismTokenStream;
  };

  export default Prism;
}
