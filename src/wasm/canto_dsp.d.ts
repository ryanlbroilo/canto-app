/* tslint:disable */
/* eslint-disable */

export class Analyzer {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Analisa um frame de `size` amostras. Retorna
     * [f0_hz, clarity, rms, spectral_centroid_hz, spectral_tilt, h1_h2_db].
     * h1_h2 = amplitude do 1º harmônico menos o 2º (dB) — correlato espectral de
     * registro/qualidade de fonação (falsete/breathy: H1>>H2; peito/pressed: menor).
     */
    analyze(samples: Float32Array): Float32Array;
    /**
     * `size` deve ser potência de 2 (ex.: 2048).
     */
    constructor(sample_rate: number, size: number);
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_analyzer_free: (a: number, b: number) => void;
    readonly analyzer_analyze: (a: number, b: number, c: number) => [number, number];
    readonly analyzer_new: (a: number, b: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
