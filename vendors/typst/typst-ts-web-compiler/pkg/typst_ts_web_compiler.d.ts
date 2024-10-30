/* tslint:disable */
/* eslint-disable */
/**
 * @param {Uint8Array} buffer
 * @returns {any}
 */
export function get_font_info(buffer: Uint8Array): any;
export class IncrServer {
  free(): void;
  /**
   * @param {boolean} attach
   */
  set_attach_debug_info(attach: boolean): void;
  /**
   * @returns {Uint8Array | undefined}
   */
  current(): Uint8Array | undefined;
  reset(): void;
}
export class ProxyContext {
  free(): void;
  /**
   * @param {any} context
   */
  constructor(context: any);
  /**
   * @param {Uint8Array} data
   * @param {Function} cb
   */
  untar(data: Uint8Array, cb: Function): void;
  readonly context: any;
}
export class TypstCompiler {
  free(): void;
  reset(): void;
  /**
   * @param {any} inputs
   */
  set_inputs(inputs: any): void;
  /**
   * @param {string} path
   * @param {string} content
   * @returns {boolean}
   */
  add_source(path: string, content: string): boolean;
  /**
   * @param {string} path
   * @param {Uint8Array} content
   * @returns {boolean}
   */
  map_shadow(path: string, content: Uint8Array): boolean;
  /**
   * @param {string} path
   * @returns {boolean}
   */
  unmap_shadow(path: string): boolean;
  reset_shadow(): void;
  /**
   * @returns {(string)[]}
   */
  get_loaded_fonts(): (string)[];
  /**
   * @param {string} main_file_path
   * @returns {string}
   */
  get_ast(main_file_path: string): string;
  /**
   * @returns {any}
   */
  get_semantic_token_legend(): any;
  /**
   * @param {string} offset_encoding
   * @param {string | undefined} [file_path]
   * @param {string | undefined} [result_id]
   * @returns {object}
   */
  get_semantic_tokens(offset_encoding: string, file_path?: string, result_id?: string): object;
  /**
   * @param {string} fmt
   * @param {number} diagnostics_format
   * @returns {any}
   */
  get_artifact(fmt: string, diagnostics_format: number): any;
  /**
   * @param {string} main_file_path
   * @param {(Array<any>)[] | undefined} [inputs]
   */
  set_compiler_options(main_file_path: string, inputs?: (Array<any>)[]): void;
  /**
   * @param {string} main_file_path
   * @param {(Array<any>)[] | undefined} inputs
   * @param {string} selector
   * @param {string | undefined} [field]
   * @returns {string}
   */
  query(main_file_path: string, inputs: (Array<any>)[] | undefined, selector: string, field?: string): string;
  /**
   * @param {string} main_file_path
   * @param {(Array<any>)[] | undefined} inputs
   * @param {string} fmt
   * @param {number} diagnostics_format
   * @returns {any}
   */
  compile(main_file_path: string, inputs: (Array<any>)[] | undefined, fmt: string, diagnostics_format: number): any;
  /**
   * @returns {IncrServer}
   */
  create_incr_server(): IncrServer;
  /**
   * @param {string} main_file_path
   * @param {(Array<any>)[] | undefined} inputs
   * @param {IncrServer} state
   * @param {number} diagnostics_format
   * @returns {any}
   */
  incr_compile(main_file_path: string, inputs: (Array<any>)[] | undefined, state: IncrServer, diagnostics_format: number): any;
}
export class TypstCompilerBuilder {
  free(): void;
  constructor();
  set_dummy_access_model(): void;
  /**
   * @param {any} context
   * @param {Function} mtime_fn
   * @param {Function} is_file_fn
   * @param {Function} real_path_fn
   * @param {Function} read_all_fn
   * @returns {Promise<void>}
   */
  set_access_model(context: any, mtime_fn: Function, is_file_fn: Function, real_path_fn: Function, read_all_fn: Function): Promise<void>;
  /**
   * @param {any} context
   * @param {Function} real_resolve_fn
   * @returns {Promise<void>}
   */
  set_package_registry(context: any, real_resolve_fn: Function): Promise<void>;
  /**
   * @param {Uint8Array} font_buffer
   * @returns {Promise<void>}
   */
  add_raw_font(font_buffer: Uint8Array): Promise<void>;
  /**
   * @param {Array<any>} fonts
   * @returns {Promise<void>}
   */
  add_web_fonts(fonts: Array<any>): Promise<void>;
  /**
   * @param {any} _pack
   * @returns {Promise<void>}
   */
  add_glyph_pack(_pack: any): Promise<void>;
  /**
   * @returns {Promise<TypstCompiler>}
   */
  build(): Promise<TypstCompiler>;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly qcms_transform_data_rgb_out_lut_precache: (a: number, b: number, c: number, d: number) => void;
  readonly qcms_transform_data_rgba_out_lut_precache: (a: number, b: number, c: number, d: number) => void;
  readonly qcms_transform_data_bgra_out_lut_precache: (a: number, b: number, c: number, d: number) => void;
  readonly qcms_transform_data_rgb_out_lut: (a: number, b: number, c: number, d: number) => void;
  readonly qcms_transform_data_rgba_out_lut: (a: number, b: number, c: number, d: number) => void;
  readonly qcms_transform_data_bgra_out_lut: (a: number, b: number, c: number, d: number) => void;
  readonly qcms_transform_release: (a: number) => void;
  readonly qcms_profile_precache_output_transform: (a: number) => void;
  readonly qcms_enable_iccv4: () => void;
  readonly qcms_profile_is_bogus: (a: number) => number;
  readonly qcms_white_point_sRGB: (a: number) => void;
  readonly lut_interp_linear16: (a: number, b: number, c: number) => number;
  readonly lut_inverse_interp16: (a: number, b: number, c: number) => number;
  readonly __wbg_proxycontext_free: (a: number, b: number) => void;
  readonly proxycontext_new: (a: number) => number;
  readonly proxycontext_context: (a: number) => number;
  readonly proxycontext_untar: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly __wbg_typstcompiler_free: (a: number, b: number) => void;
  readonly get_font_info: (a: number) => number;
  readonly typstcompiler_reset: (a: number, b: number) => void;
  readonly typstcompiler_set_inputs: (a: number, b: number, c: number) => void;
  readonly typstcompiler_add_source: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly typstcompiler_unmap_shadow: (a: number, b: number, c: number) => number;
  readonly typstcompiler_reset_shadow: (a: number) => void;
  readonly typstcompiler_get_loaded_fonts: (a: number, b: number) => void;
  readonly typstcompiler_get_ast: (a: number, b: number, c: number, d: number) => void;
  readonly typstcompiler_get_semantic_token_legend: (a: number, b: number) => void;
  readonly typstcompiler_get_semantic_tokens: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => void;
  readonly typstcompiler_get_artifact: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly typstcompiler_set_compiler_options: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly typstcompiler_query: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => void;
  readonly typstcompiler_compile: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => void;
  readonly typstcompiler_create_incr_server: (a: number, b: number) => void;
  readonly typstcompiler_incr_compile: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => void;
  readonly __wbg_typstcompilerbuilder_free: (a: number, b: number) => void;
  readonly typstcompilerbuilder_new: (a: number) => void;
  readonly typstcompilerbuilder_set_dummy_access_model: (a: number, b: number) => void;
  readonly typstcompilerbuilder_set_access_model: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly typstcompilerbuilder_set_package_registry: (a: number, b: number, c: number) => number;
  readonly typstcompilerbuilder_add_raw_font: (a: number, b: number) => number;
  readonly typstcompilerbuilder_add_web_fonts: (a: number, b: number) => number;
  readonly typstcompilerbuilder_add_glyph_pack: (a: number, b: number) => number;
  readonly typstcompilerbuilder_build: (a: number) => number;
  readonly __wbg_incrserver_free: (a: number, b: number) => void;
  readonly incrserver_set_attach_debug_info: (a: number, b: number) => void;
  readonly incrserver_current: (a: number, b: number) => void;
  readonly incrserver_reset: (a: number) => void;
  readonly typstcompiler_map_shadow: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly __wbindgen_export_0: (a: number, b: number) => number;
  readonly __wbindgen_export_1: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_export_3: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_4: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_5: (a: number) => void;
  readonly __wbindgen_export_6: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
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
