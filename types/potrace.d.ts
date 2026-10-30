declare module 'potrace' {
  export interface TraceOptions {
    threshold?: number;
    turdSize?: number;
    turnPolicy?: string;
    alphaMax?: number;
    optCurve?: boolean;
    optTolerance?: number;
    color?: string;
    background?: string;
  }
  export function trace(
    buffer: Buffer,
    options: TraceOptions,
    callback: (err: Error | null, svg: string) => void,
  ): void;
}
