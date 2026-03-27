declare module "sparticles" {
  export default class Sparticles {
    constructor(
      node?: HTMLElement,
      options?: Record<string, unknown>,
      width?: number,
      height?: number
    );

    destroy(): void;
    resetSparticles(): void;
    setCanvasSize(width: number, height: number): void;
  }
}
