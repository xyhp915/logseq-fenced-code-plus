/// Processed by wasm-debundle.mjs
let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function _assertBoolean(n) {
    if (typeof(n) !== 'boolean') {
        throw new Error(`expected a boolean argument, found ${typeof(n)}`);
    }
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    if (typeof(heap_next) !== 'number') throw new Error('corrupt heap');

    heap[idx] = obj;
    return idx;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (typeof(arg) !== 'string') throw new Error(`expected a string argument, found ${typeof(arg)}`);

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);
        if (ret.read !== arg.length) throw new Error('failed to pass whole string');
        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => {
    wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b)
});

function makeClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        try {
            return f(state.a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b);
                state.a = 0;
                CLOSURE_DTORS.unregister(state);
            }
        }
    };
    real.original = state;
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function logError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        let error = (function () {
            try {
                return e instanceof Error ? `${e.message}\n\nStack:\n${e.stack}` : e.toString();
            } catch(_) {
                return "<failed to stringify thrown value>";
            }
        }());
        console.error("wasm-bindgen: imported JS function that was not marked as `catch` threw an error:", error);
        throw e;
    }
}

function _assertNum(n) {
    if (typeof(n) !== 'number') throw new Error(`expected a number argument, found ${typeof(n)}`);
}
function __wbg_adapter_26(arg0, arg1) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm.__wbindgen_export_3(arg0, arg1);
}

function __wbg_adapter_29(arg0, arg1, arg2) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm.__wbindgen_export_4(arg0, arg1, addHeapObject(arg2));
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);
                CLOSURE_DTORS.unregister(state);
            } else {
                state.a = a;
            }
        }
    };
    real.original = state;
    CLOSURE_DTORS.register(real, state, state);
    return real;
}
function __wbg_adapter_32(arg0, arg1, arg2) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm.__wbindgen_export_5(arg0, arg1, addHeapObject(arg2));
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

let cachedUint32ArrayMemory0 = null;

function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export_7(addHeapObject(e));
    }
}
function __wbg_adapter_89(arg0, arg1, arg2, arg3) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm.__wbindgen_export_8(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getDataViewMemory0();
    for (let i = 0; i < array.length; i++) {
        mem.setUint32(ptr + 4 * i, addHeapObject(array[i]), true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}
/**
 * Return an object containing build info
 * CodeSize: 4KB
 * @returns {any}
 */
export function renderer_build_info() {
    const ret = wasm.renderer_build_info();
    return takeObject(ret);
}

const __wbindgen_enum_CanvasWindingRule = ["nonzero", "evenodd"];

const CreateSessionOptionsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_createsessionoptions_free(ptr >>> 0, 1));

export class CreateSessionOptions {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CreateSessionOptionsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_createsessionoptions_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.createsessionoptions_new();
        this.__wbg_ptr = ret >>> 0;
        CreateSessionOptionsFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {string} format
     */
    set format(format) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(format, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        wasm.createsessionoptions_set_format(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {Uint8Array} artifact_content
     */
    set artifact_content(artifact_content) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passArray8ToWasm0(artifact_content, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        wasm.createsessionoptions_set_artifact_content(this.__wbg_ptr, ptr0, len0);
    }
}

const IncrDomDocClientFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_incrdomdocclient_free(ptr >>> 0, 1));
/**
 * maintains the state of the incremental rendering at client side
 */
export class IncrDomDocClient {

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(IncrDomDocClient.prototype);
        obj.__wbg_ptr = ptr;
        IncrDomDocClientFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IncrDomDocClientFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_incrdomdocclient_free(ptr, 0);
    }
    /**
     * @param {any} functions
     */
    bind_functions(functions) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        wasm.incrdomdocclient_bind_functions(this.__wbg_ptr, addHeapObject(functions));
    }
    /**
     * Relayout the document in the given window.
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @returns {Promise<boolean>}
     */
    relayout(x, y, w, h) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.incrdomdocclient_relayout(this.__wbg_ptr, x, y, w, h);
        return takeObject(ret);
    }
    /**
     * @param {number} page_num
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {number} stage
     * @returns {boolean}
     */
    need_repaint(page_num, x, y, w, h, stage) {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            _assertNum(page_num);
            _assertNum(stage);
            wasm.incrdomdocclient_need_repaint(retptr, this.__wbg_ptr, page_num, x, y, w, h, stage);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return r0 !== 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number} page_num
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {number} stage
     * @returns {any}
     */
    repaint(page_num, x, y, w, h, stage) {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            _assertNum(page_num);
            _assertNum(stage);
            wasm.incrdomdocclient_repaint(retptr, this.__wbg_ptr, page_num, x, y, w, h, stage);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const PageInfoFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pageinfo_free(ptr >>> 0, 1));

export class PageInfo {

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PageInfo.prototype);
        obj.__wbg_ptr = ptr;
        PageInfoFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PageInfoFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pageinfo_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get page_off() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.pageinfo_page_off(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get width_pt() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.pageinfo_width_pt(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get height_pt() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.pageinfo_height_pt(this.__wbg_ptr);
        return ret;
    }
}

const PagesInfoFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pagesinfo_free(ptr >>> 0, 1));

export class PagesInfo {

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PagesInfo.prototype);
        obj.__wbg_ptr = ptr;
        PagesInfoFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PagesInfoFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pagesinfo_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get page_count() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.pagesinfo_page_count(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} num
     * @returns {PageInfo | undefined}
     */
    page_by_number(num) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(num);
        const ret = wasm.pagesinfo_page_by_number(this.__wbg_ptr, num);
        return ret === 0 ? undefined : PageInfo.__wrap(ret);
    }
    /**
     * @param {number} i
     * @returns {PageInfo}
     */
    page(i) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(i);
        const ret = wasm.pagesinfo_page(this.__wbg_ptr, i);
        return PageInfo.__wrap(ret);
    }
    /**
     * @returns {number}
     */
    width() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.pagesinfo_width(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    height() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.pagesinfo_height(this.__wbg_ptr);
        return ret;
    }
}

const RenderPageImageOptionsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_renderpageimageoptions_free(ptr >>> 0, 1));

export class RenderPageImageOptions {

    static __unwrap(jsValue) {
        if (!(jsValue instanceof RenderPageImageOptions)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RenderPageImageOptionsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_renderpageimageoptions_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.renderpageimageoptions_new();
        this.__wbg_ptr = ret >>> 0;
        RenderPageImageOptionsFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {number | undefined}
     */
    get pixel_per_pt() {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.renderpageimageoptions_pixel_per_pt(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getFloat32(retptr + 4 * 1, true);
            return r0 === 0 ? undefined : r1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number | undefined} [pixel_per_pt]
     */
    set pixel_per_pt(pixel_per_pt) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        if (!isLikeNone(pixel_per_pt)) {
            _assertNum(pixel_per_pt);
        }
        wasm.renderpageimageoptions_set_pixel_per_pt(this.__wbg_ptr, !isLikeNone(pixel_per_pt), isLikeNone(pixel_per_pt) ? 0 : pixel_per_pt);
    }
    /**
     * @returns {string | undefined}
     */
    get background_color() {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.renderpageimageoptions_background_color(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export_6(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {string | undefined} [background_color]
     */
    set background_color(background_color) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        var ptr0 = isLikeNone(background_color) ? 0 : passStringToWasm0(background_color, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        wasm.renderpageimageoptions_set_background_color(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {number}
     */
    get page_off() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.renderpageimageoptions_page_off(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} page_off
     */
    set page_off(page_off) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(page_off);
        wasm.renderpageimageoptions_set_page_off(this.__wbg_ptr, page_off);
    }
    /**
     * @returns {string | undefined}
     */
    get cache_key() {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.renderpageimageoptions_cache_key(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export_6(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {string | undefined} [cache_key]
     */
    set cache_key(cache_key) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        var ptr0 = isLikeNone(cache_key) ? 0 : passStringToWasm0(cache_key, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        wasm.renderpageimageoptions_set_cache_key(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {number | undefined}
     */
    get data_selection() {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.renderpageimageoptions_data_selection(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            return r0 === 0 ? undefined : r1 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number | undefined} [data_selection]
     */
    set data_selection(data_selection) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        if (!isLikeNone(data_selection)) {
            _assertNum(data_selection);
        }
        wasm.renderpageimageoptions_set_data_selection(this.__wbg_ptr, !isLikeNone(data_selection), isLikeNone(data_selection) ? 0 : data_selection);
    }
}

const RenderSessionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rendersession_free(ptr >>> 0, 1));

export class RenderSession {

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RenderSession.prototype);
        obj.__wbg_ptr = ptr;
        RenderSessionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RenderSessionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rendersession_free(ptr, 0);
    }
    /**
     * @returns {number | undefined}
     */
    get pixel_per_pt() {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.rendersession_pixel_per_pt(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getFloat32(retptr + 4 * 1, true);
            return r0 === 0 ? undefined : r1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number} pixel_per_pt
     */
    set pixel_per_pt(pixel_per_pt) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        wasm.rendersession_set_pixel_per_pt(this.__wbg_ptr, pixel_per_pt);
    }
    /**
     * @returns {string | undefined}
     */
    get background_color() {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.rendersession_background_color(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export_6(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {string} background_color
     */
    set background_color(background_color) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(background_color, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        wasm.rendersession_set_background_color(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {PagesInfo}
     */
    get pages_info() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.rendersession_pages_info(this.__wbg_ptr);
        return PagesInfo.__wrap(ret);
    }
    /**
     * @returns {number}
     */
    get doc_width() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.rendersession_doc_width(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get doc_height() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.rendersession_doc_height(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {Uint32Array} path
     * @returns {string | undefined}
     */
    source_span(path) {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            const ptr0 = passArray32ToWasm0(path, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            wasm.rendersession_source_span(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            let v2;
            if (r0 !== 0) {
                v2 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export_6(r0, r1 * 1, 1);
            }
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number} rect_lo_x
     * @param {number} rect_lo_y
     * @param {number} rect_hi_x
     * @param {number} rect_hi_y
     * @returns {string}
     */
    render_in_window(rect_lo_x, rect_lo_y, rect_hi_x, rect_hi_y) {
        let deferred1_0;
        let deferred1_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.rendersession_render_in_window(retptr, this.__wbg_ptr, rect_lo_x, rect_lo_y, rect_hi_x, rect_hi_y);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_6(deferred1_0, deferred1_1, 1);
        }
    }
}

const RenderSessionOptionsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rendersessionoptions_free(ptr >>> 0, 1));

export class RenderSessionOptions {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RenderSessionOptionsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rendersessionoptions_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.rendersessionoptions_new();
        this.__wbg_ptr = ret >>> 0;
        RenderSessionOptionsFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {number | undefined}
     */
    get pixel_per_pt() {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.rendersessionoptions_pixel_per_pt(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getFloat32(retptr + 4 * 1, true);
            return r0 === 0 ? undefined : r1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number} pixel_per_pt
     */
    set pixel_per_pt(pixel_per_pt) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        wasm.rendersessionoptions_set_pixel_per_pt(this.__wbg_ptr, pixel_per_pt);
    }
    /**
     * @returns {string | undefined}
     */
    get background_color() {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.rendersessionoptions_background_color(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export_6(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {string} background_color
     */
    set background_color(background_color) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(background_color, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        wasm.rendersessionoptions_set_background_color(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string | undefined}
     */
    get format() {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.rendersessionoptions_format(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export_6(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {string} format
     */
    set format(format) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(format, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        wasm.rendersessionoptions_set_format(this.__wbg_ptr, ptr0, len0);
    }
}

const TypstRendererFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_typstrenderer_free(ptr >>> 0, 1));

export class TypstRenderer {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(TypstRenderer.prototype);
        obj.__wbg_ptr = ptr;
        TypstRendererFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TypstRendererFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_typstrenderer_free(ptr, 0);
    }
    /**
     * @param {any} _v
     */
    load_glyph_pack(_v) {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            wasm.typstrenderer_load_glyph_pack(retptr, this.__wbg_ptr, addHeapObject(_v));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {RenderSession} session
     * @param {number} rect_lo_x
     * @param {number} rect_lo_y
     * @param {number} rect_hi_x
     * @param {number} rect_hi_y
     * @returns {string}
     */
    render_svg_diff(session, rect_lo_x, rect_lo_y, rect_hi_x, rect_hi_y) {
        let deferred1_0;
        let deferred1_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            _assertClass(session, RenderSession);
            if (session.__wbg_ptr === 0) {
                throw new Error('Attempt to use a moved value');
            }
            wasm.typstrenderer_render_svg_diff(retptr, this.__wbg_ptr, session.__wbg_ptr, rect_lo_x, rect_lo_y, rect_hi_x, rect_hi_y);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_6(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {RenderSession} session
     * @param {number | undefined} [parts]
     * @returns {string}
     */
    svg_data(session, parts) {
        let deferred2_0;
        let deferred2_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            _assertClass(session, RenderSession);
            if (session.__wbg_ptr === 0) {
                throw new Error('Attempt to use a moved value');
            }
            if (!isLikeNone(parts)) {
                _assertNum(parts);
            }
            wasm.typstrenderer_svg_data(retptr, this.__wbg_ptr, session.__wbg_ptr, !isLikeNone(parts), isLikeNone(parts) ? 0 : parts);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_6(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @param {RenderSession} session
     * @returns {Array<any> | undefined}
     */
    get_customs(session) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(session, RenderSession);
        if (session.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.typstrenderer_get_customs(this.__wbg_ptr, session.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * @param {RenderSession} session
     * @param {HTMLElement} root
     * @returns {boolean}
     */
    render_svg(session, root) {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            _assertClass(session, RenderSession);
            if (session.__wbg_ptr === 0) {
                throw new Error('Attempt to use a moved value');
            }
            wasm.typstrenderer_render_svg(retptr, this.__wbg_ptr, session.__wbg_ptr, addHeapObject(root));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return r0 !== 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {any} _w
     * @returns {Promise<TypstWorker>}
     */
    create_worker(_w) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.typstrenderer_create_worker(this.__wbg_ptr, addHeapObject(_w));
        return takeObject(ret);
    }
    /**
     * @returns {WorkerBridge}
     */
    create_worker_bridge() {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(ptr);
            wasm.typstrenderer_create_worker_bridge(retptr, ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return WorkerBridge.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {RenderSession} ses
     * @param {HTMLElement} elem
     * @returns {Promise<IncrDomDocClient>}
     */
    mount_dom(ses, elem) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(ses, RenderSession);
        if (ses.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.typstrenderer_mount_dom(this.__wbg_ptr, ses.__wbg_ptr, addHeapObject(elem));
        return takeObject(ret);
    }
    /**
     * @param {RenderSession} ses
     * @param {any} canvas
     * @param {RenderPageImageOptions | undefined} [options]
     * @returns {Promise<any>}
     */
    render_page_to_canvas(ses, canvas, options) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(ses, RenderSession);
        if (ses.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        let ptr0 = 0;
        if (!isLikeNone(options)) {
            _assertClass(options, RenderPageImageOptions);
            if (options.__wbg_ptr === 0) {
                throw new Error('Attempt to use a moved value');
            }
            ptr0 = options.__destroy_into_raw();
        }
        const ret = wasm.typstrenderer_render_page_to_canvas(this.__wbg_ptr, ses.__wbg_ptr, addHeapObject(canvas), ptr0);
        return takeObject(ret);
    }
    constructor() {
        const ret = wasm.typstrenderer_new();
        this.__wbg_ptr = ret >>> 0;
        TypstRendererFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {CreateSessionOptions | undefined} [options]
     * @returns {RenderSession}
     */
    create_session(options) {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            let ptr0 = 0;
            if (!isLikeNone(options)) {
                _assertClass(options, CreateSessionOptions);
                if (options.__wbg_ptr === 0) {
                    throw new Error('Attempt to use a moved value');
                }
                ptr0 = options.__destroy_into_raw();
            }
            wasm.typstrenderer_create_session(retptr, this.__wbg_ptr, ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return RenderSession.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {RenderSession} session
     */
    reset(session) {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            _assertClass(session, RenderSession);
            if (session.__wbg_ptr === 0) {
                throw new Error('Attempt to use a moved value');
            }
            wasm.typstrenderer_reset(retptr, this.__wbg_ptr, session.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {RenderSession} session
     * @param {string} action
     * @param {Uint8Array} data
     */
    manipulate_data(session, action, data) {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            _assertClass(session, RenderSession);
            if (session.__wbg_ptr === 0) {
                throw new Error('Attempt to use a moved value');
            }
            const ptr0 = passStringToWasm0(action, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(data, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            wasm.typstrenderer_manipulate_data(retptr, this.__wbg_ptr, session.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} artifact_content
     * @param {string} decoder
     * @returns {RenderSession}
     */
    session_from_artifact(artifact_content, decoder) {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            const ptr0 = passArray8ToWasm0(artifact_content, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(decoder, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len1 = WASM_VECTOR_LEN;
            wasm.typstrenderer_session_from_artifact(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return RenderSession.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const TypstRendererBuilderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_typstrendererbuilder_free(ptr >>> 0, 1));

export class TypstRendererBuilder {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TypstRendererBuilderFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_typstrendererbuilder_free(ptr, 0);
    }
    constructor() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.typstrendererbuilder_new(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            TypstRendererBuilderFinalization.register(this, this.__wbg_ptr, this);
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @returns {Promise<TypstRenderer>}
     */
    build() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        const ptr = this.__destroy_into_raw();
        _assertNum(ptr);
        const ret = wasm.typstrendererbuilder_build(ptr);
        return takeObject(ret);
    }
    /**
     * @param {any} _pack
     * @returns {Promise<void>}
     */
    add_glyph_pack(_pack) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.typstrendererbuilder_add_glyph_pack(this.__wbg_ptr, addHeapObject(_pack));
        return takeObject(ret);
    }
    /**
     * @param {Uint8Array} _font_buffer
     * @returns {Promise<void>}
     */
    add_raw_font(_font_buffer) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.typstrendererbuilder_add_raw_font(this.__wbg_ptr, addHeapObject(_font_buffer));
        return takeObject(ret);
    }
    /**
     * @param {Array<any>} _fonts
     * @returns {Promise<void>}
     */
    add_web_fonts(_fonts) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.typstrendererbuilder_add_web_fonts(this.__wbg_ptr, addHeapObject(_fonts));
        return takeObject(ret);
    }
}

const TypstWorkerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_typstworker_free(ptr >>> 0, 1));

export class TypstWorker {

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TypstWorkerFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_typstworker_free(ptr, 0);
    }
    /**
     * @param {string} _action
     * @param {Uint8Array} _data
     * @returns {Promise<any>}
     */
    manipulate_data(_action, _data) {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            const ptr0 = passStringToWasm0(_action, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            wasm.typstworker_manipulate_data(retptr, this.__wbg_ptr, ptr0, len0, addHeapObject(_data));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @returns {Promise<any>}
     */
    get_pages_info() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.typstworker_get_pages_info(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * @param {Uint8Array} _actions
     * @param {(HTMLCanvasElement)[]} _canvas_list
     * @param {(RenderPageImageOptions)[]} _data
     * @returns {Promise<any>}
     */
    render_canvas(_actions, _canvas_list, _data) {
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertNum(this.__wbg_ptr);
            const ptr0 = passArray8ToWasm0(_actions, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArrayJsValueToWasm0(_canvas_list, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArrayJsValueToWasm0(_data, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            wasm.typstworker_render_canvas(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const WorkerBridgeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_workerbridge_free(ptr >>> 0, 1));

export class WorkerBridge {

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WorkerBridge.prototype);
        obj.__wbg_ptr = ptr;
        WorkerBridgeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WorkerBridgeFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_workerbridge_free(ptr, 0);
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_new_1073970097e5a420 = function() { return logError(function (arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_89(a, state0.b, arg0, arg1);
                } finally {
                    state0.a = a;
                }
            };
            const ret = new Promise(cb0);
            return addHeapObject(ret);
        } finally {
            state0.a = state0.b = 0;
        }
    }, arguments) };
    imports.wbg.__wbg_new_abda76e883ba8a5f = function() { return logError(function () {
        const ret = new Error();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_stack_658279fe44541cf6 = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_error_f851667af71bcfc6 = function() { return logError(function (arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_export_6(deferred0_0, deferred0_1, 1);
        }
    }, arguments) };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbg_self_bf91bf94d9e04084 = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_52dd9f07d03fd5f8 = function() { return handleError(function () {
        const ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_05c129bf37fcf1be = function() { return handleError(function () {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_3eca19bb09e9c484 = function() { return handleError(function () {
        const ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbg_newnoargs_1ede4bf2ebbaaf43 = function() { return logError(function (arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_a9ef466721e824f2 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_70a2f23d1565c04c = function() { return logError(function (arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_b1572e0bf16bb8b0 = function() { return handleError(function (arg0, arg1) {
        const ret = new OffscreenCanvas(arg0 >>> 0, arg1 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getContext_211e7f0e615215a4 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_OffscreenCanvasRenderingContext2d_07b9d9deabbab2c4 = function() { return logError(function (arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof OffscreenCanvasRenderingContext2D;
        } catch (_) {
            result = false;
        }
        const ret = result;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_save_51c5c825520e8fd0 = function() { return logError(function (arg0) {
        getObject(arg0).save();
    }, arguments) };
    imports.wbg.__wbg_setfont_34289a9ff190aed8 = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0).font = getStringFromWasm0(arg1, arg2);
    }, arguments) };
    imports.wbg.__wbg_measureText_8547338485b05bb0 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).measureText(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_width_e4c18791794a7c38 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).width;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_restore_cd7f36f354e951db = function() { return logError(function (arg0) {
        getObject(arg0).restore();
    }, arguments) };
    imports.wbg.__wbg_new_034f913e7636e987 = function() { return logError(function () {
        const ret = new Array();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_push_36cf4d81d7da33d1 = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg0).push(getObject(arg1));
        _assertNum(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_e69b5f66fda8f13c = function() { return logError(function () {
        const ret = new Object();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_settype_623d2ee701e6310a = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0).type = getStringFromWasm0(arg1, arg2);
    }, arguments) };
    imports.wbg.__wbg_newwithu8arraysequenceandoptions_d41c0fdf78490206 = function() { return handleError(function (arg0, arg1) {
        const ret = new Blob(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_log_f740dc2253ea759b = function() { return logError(function (arg0) {
        console.log(getObject(arg0));
    }, arguments) };
    imports.wbg.__wbg_newwithlength_76462a666eca145f = function() { return logError(function (arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_length_9254c4bd3b9f23c4 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).length;
        _assertNum(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_ccaed51a635d8a2d = function() { return logError(function (arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_newwithbyteoffsetandlength_7e3eb787208af730 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_set_ec2fcf81bc573fd9 = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    }, arguments) };
    imports.wbg.__wbg_instanceof_Window_6575cd7f1322f82f = function() { return logError(function (arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Window;
        } catch (_) {
            result = false;
        }
        const ret = result;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_instanceof_WorkerGlobalScope_90a78b9e967b8726 = function() { return logError(function (arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof WorkerGlobalScope;
        } catch (_) {
            result = false;
        }
        const ret = result;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_createImageBitmap_7893beeb597d1f1b = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).createImageBitmap(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_get_ef828680c64da212 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbg_call_5fb7c8066a4a4825 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2), getObject(arg3));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_Promise_f3fd1bcac3157f0c = function() { return logError(function (arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Promise;
        } catch (_) {
            result = false;
        }
        const ret = result;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_createImageBitmap_17badae68300b0a6 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).createImageBitmap(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_ImageBitmap_b77911fe0757088f = function() { return logError(function (arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof ImageBitmap;
        } catch (_) {
            result = false;
        }
        const ret = result;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_instanceof_OffscreenCanvas_ff1551edf0e1303c = function() { return logError(function (arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof OffscreenCanvas;
        } catch (_) {
            result = false;
        }
        const ret = result;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithpathstring_ac464baa5b9a788c = function() { return handleError(function (arg0, arg1) {
        const ret = new Path2D(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_revokeObjectURL_8e72bad4541bdca0 = function() { return handleError(function (arg0, arg1) {
        URL.revokeObjectURL(getStringFromWasm0(arg0, arg1));
    }, arguments) };
    imports.wbg.__wbg_stringify_eead5648c09faaf8 = function() { return handleError(function (arg0) {
        const ret = JSON.stringify(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_setTransform_378786ee36ec3a18 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).setTransform(arg1, arg2, arg3, arg4, arg5, arg6);
    }, arguments) };
    imports.wbg.__wbg_putImageData_44bf3a0787b975b7 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        getObject(arg0).putImageData(getObject(arg1), arg2, arg3);
    }, arguments) };
    imports.wbg.__wbg_globalCompositeOperation_ce4b579a83346ce3 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg1).globalCompositeOperation;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_setglobalCompositeOperation_904684eaf6e9e441 = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).globalCompositeOperation = getStringFromWasm0(arg1, arg2);
    }, arguments) };
    imports.wbg.__wbg_setfillStyle_f8273bc6290143be = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0).fillStyle = getStringFromWasm0(arg1, arg2);
    }, arguments) };
    imports.wbg.__wbg_fillRect_0a5c5e635be36fc5 = function() { return logError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).fillRect(arg1, arg2, arg3, arg4);
    }, arguments) };
    imports.wbg.__wbg_drawImage_cb573ac1888557f6 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        getObject(arg0).drawImage(getObject(arg1), arg2, arg3);
    }, arguments) };
    imports.wbg.__wbg_clip_69ebc8c1a170c5e2 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).clip(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_setstrokeStyle_3c3c67fd62a77730 = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0).strokeStyle = getStringFromWasm0(arg1, arg2);
    }, arguments) };
    imports.wbg.__wbg_stroke_a76887577bd68088 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).stroke(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_drawImage_79ac57dabab20303 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).drawImage(getObject(arg1), arg2, arg3, arg4, arg5);
    }, arguments) };
    imports.wbg.__wbg_drawImage_02d5af4f48e0dc26 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).drawImage(getObject(arg1), arg2, arg3, arg4, arg5);
    }, arguments) };
    imports.wbg.__wbg_setlineWidth_037dd016057a68de = function() { return logError(function (arg0, arg1) {
        getObject(arg0).lineWidth = arg1;
    }, arguments) };
    imports.wbg.__wbg_setlineCap_aa5b25b6af766ba6 = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0).lineCap = getStringFromWasm0(arg1, arg2);
    }, arguments) };
    imports.wbg.__wbg_setlineJoin_316d4ae6dc0464ea = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0).lineJoin = getStringFromWasm0(arg1, arg2);
    }, arguments) };
    imports.wbg.__wbg_setmiterLimit_06bd35f2d7370de1 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).miterLimit = arg1;
    }, arguments) };
    imports.wbg.__wbg_setlineDashOffset_66ebdfaed783c789 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).lineDashOffset = arg1;
    }, arguments) };
    imports.wbg.__wbg_setLineDash_8566a73c937296d9 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).setLineDash(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_fill_35e67b0a78856ae3 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).fill(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_fill_d28a44b2f91d1baf = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0).fill(getObject(arg1), __wbindgen_enum_CanvasWindingRule[arg2]);
    }, arguments) };
    imports.wbg.__wbg_new_b5bf9532bd5c97fd = function() { return handleError(function () {
        const ret = new Image();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_createObjectURL_11804d71ac214694 = function() { return handleError(function (arg0, arg1) {
        const ret = URL.createObjectURL(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_width_fa277b4243adaabb = function() { return logError(function (arg0) {
        const ret = getObject(arg0).width;
        _assertNum(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_height_250d8ced017769f8 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).height;
        _assertNum(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_drawImage_5c4488af6c903314 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        getObject(arg0).drawImage(getObject(arg1), arg2, arg3);
    }, arguments) };
    imports.wbg.__wbg_transferToImageBitmap_a7216e0d45f09601 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).transferToImageBitmap();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_3bfa248576352471 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_setsrc_feb07d9d5b693db7 = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0).src = getStringFromWasm0(arg1, arg2);
    }, arguments) };
    imports.wbg.__wbg_setonload_c44788491be30c5c = function() { return logError(function (arg0, arg1) {
        getObject(arg0).onload = getObject(arg1);
    }, arguments) };
    imports.wbg.__wbg_setonerror_7e172f547433d10e = function() { return logError(function (arg0, arg1) {
        getObject(arg0).onerror = getObject(arg1);
    }, arguments) };
    imports.wbg.__wbg_setTransform_ab9bffd1dfaadef8 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).setTransform(arg1, arg2, arg3, arg4, arg5, arg6);
    }, arguments) };
    imports.wbg.__wbg_putImageData_f9c66228770c0556 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        getObject(arg0).putImageData(getObject(arg1), arg2, arg3);
    }, arguments) };
    imports.wbg.__wbg_globalCompositeOperation_7599ad6f23aa7915 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg1).globalCompositeOperation;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_setglobalCompositeOperation_1ec7de7c74b1fffb = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).globalCompositeOperation = getStringFromWasm0(arg1, arg2);
    }, arguments) };
    imports.wbg.__wbg_setfillStyle_2cc2c748b938a95e = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0).fillStyle = getStringFromWasm0(arg1, arg2);
    }, arguments) };
    imports.wbg.__wbg_fillRect_6784ab0aab9eebd5 = function() { return logError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).fillRect(arg1, arg2, arg3, arg4);
    }, arguments) };
    imports.wbg.__wbg_drawImage_007806da723a1e8b = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        getObject(arg0).drawImage(getObject(arg1), arg2, arg3);
    }, arguments) };
    imports.wbg.__wbg_clip_6e3594f765ee3015 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).clip(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_setstrokeStyle_3c29a4e85b6087f5 = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0).strokeStyle = getStringFromWasm0(arg1, arg2);
    }, arguments) };
    imports.wbg.__wbg_stroke_18a7adc53a38d993 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).stroke(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_drawImage_92c2feb5c6a72619 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).drawImage(getObject(arg1), arg2, arg3, arg4, arg5);
    }, arguments) };
    imports.wbg.__wbg_drawImage_198159bdfa8bb195 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).drawImage(getObject(arg1), arg2, arg3, arg4, arg5);
    }, arguments) };
    imports.wbg.__wbg_setlineWidth_267c5e81c3c67348 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).lineWidth = arg1;
    }, arguments) };
    imports.wbg.__wbg_setlineCap_46e48efce673b5bc = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0).lineCap = getStringFromWasm0(arg1, arg2);
    }, arguments) };
    imports.wbg.__wbg_setlineJoin_a17a487f4008f18f = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0).lineJoin = getStringFromWasm0(arg1, arg2);
    }, arguments) };
    imports.wbg.__wbg_setmiterLimit_4b85dd19bf9935d5 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).miterLimit = arg1;
    }, arguments) };
    imports.wbg.__wbg_setlineDashOffset_4c94a9565370ff7f = function() { return logError(function (arg0, arg1) {
        getObject(arg0).lineDashOffset = arg1;
    }, arguments) };
    imports.wbg.__wbg_restore_53f9e3ba68ab6122 = function() { return logError(function (arg0) {
        getObject(arg0).restore();
    }, arguments) };
    imports.wbg.__wbg_save_7da51dd755170877 = function() { return logError(function (arg0) {
        getObject(arg0).save();
    }, arguments) };
    imports.wbg.__wbg_setLineDash_a27082dd66f071a9 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).setLineDash(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_fill_dfa41e6d1844b522 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).fill(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_fill_ab72269002ce7fc4 = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0).fill(getObject(arg1), __wbindgen_enum_CanvasWindingRule[arg2]);
    }, arguments) };
    imports.wbg.__wbg_log_c5235279373186d4 = function() { return logError(function (arg0, arg1) {
        console.log(getObject(arg0), getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_replaceWith_abcd4c84c203850c = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).replaceWith(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_firstElementChild_26953b81a3e880c1 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).firstElementChild;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_SvgGraphicsElement_aa4a8dae50f94d8e = function() { return logError(function (arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof SVGGraphicsElement;
        } catch (_) {
            result = false;
        }
        const ret = result;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_nextElementSibling_f4a27a6c59d89e33 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).nextElementSibling;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_lastElementChild_ae2f2e9fde5a862e = function() { return logError(function (arg0) {
        const ret = getObject(arg0).lastElementChild;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_remove_d7a18d9f46bc50fd = function() { return logError(function (arg0) {
        getObject(arg0).remove();
    }, arguments) };
    imports.wbg.__wbg_getContext_bf8985355a4d22ca = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_CanvasRenderingContext2d_775df7bd32f07559 = function() { return logError(function (arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof CanvasRenderingContext2D;
        } catch (_) {
            result = false;
        }
        const ret = result;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_clearRect_b31e8293856d6504 = function() { return logError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).clearRect(arg1, arg2, arg3, arg4);
    }, arguments) };
    imports.wbg.__wbg_getAttribute_8ac49f4186f4cefd = function() { return logError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg1).getAttribute(getStringFromWasm0(arg2, arg3));
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_setAttribute_2a8f647a8d92c712 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_style_04eb1488bc2ceffc = function() { return logError(function (arg0) {
        const ret = getObject(arg0).style;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_removeProperty_5acbca68235d0706 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg1).removeProperty(getStringFromWasm0(arg2, arg3));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_setProperty_b9a2384cbfb499fb = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_setinnerHTML_559d45055154f1d8 = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0).innerHTML = getStringFromWasm0(arg1, arg2);
    }, arguments) };
    imports.wbg.__wbg_content_57ec141416462f04 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).content;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_firstElementChild_4d48ea0ca6da5169 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).firstElementChild;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_HtmlCanvasElement_022ad88c76df9031 = function() { return logError(function (arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof HTMLCanvasElement;
        } catch (_) {
            result = false;
        }
        const ret = result;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_instanceof_SvgsvgElement_c57616bdbf67654f = function() { return logError(function (arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof SVGSVGElement;
        } catch (_) {
            result = false;
        }
        const ret = result;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_instanceof_HtmlDivElement_571e59de6195834c = function() { return logError(function (arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof HTMLDivElement;
        } catch (_) {
            result = false;
        }
        const ret = result;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_call_8547f4f9ec48f360 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2), getObject(arg3), getObject(arg4));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_appendChild_bc4a0deae90a5164 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).appendChild(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_HtmlElement_aab18e065dc9207d = function() { return logError(function (arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof HTMLElement;
        } catch (_) {
            result = false;
        }
        const ret = result;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_document_d7fa2c739c2b191a = function() { return logError(function (arg0) {
        const ret = getObject(arg0).document;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_createElement_e4523490bd0ae51d = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_HtmlTemplateElement_bdfc6fd7326a5794 = function() { return logError(function (arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof HTMLTemplateElement;
        } catch (_) {
            result = false;
        }
        const ret = result;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_cloneNode_bd4b7e47afe3ce9f = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).cloneNode();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_Element_1a81366cc90e70e2 = function() { return logError(function (arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Element;
        } catch (_) {
            result = false;
        }
        const ret = result;
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_setwidth_23bf2deedd907275 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).width = arg1 >>> 0;
    }, arguments) };
    imports.wbg.__wbg_setheight_239dc283bbe50da4 = function() { return logError(function (arg0, arg1) {
        getObject(arg0).height = arg1 >>> 0;
    }, arguments) };
    imports.wbg.__wbindgen_jsval_eq = function(arg0, arg1) {
        const ret = getObject(arg0) === getObject(arg1);
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbg_set_425e70f7c64ac962 = function() { return logError(function (arg0, arg1, arg2) {
        getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
    }, arguments) };
    imports.wbg.__wbg_set_e864d25d9b399c9f = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        _assertBoolean(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_typstrenderer_new = function() { return logError(function (arg0) {
        const ret = TypstRenderer.__wrap(arg0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_incrdomdocclient_new = function() { return logError(function (arg0) {
        const ret = IncrDomDocClient.__wrap(arg0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_fec2611eb9180f95 = function() { return logError(function (arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_clientWidth_600f98ddd2b6cb36 = function() { return logError(function (arg0) {
        const ret = getObject(arg0).clientWidth;
        _assertNum(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_renderpageimageoptions_unwrap = function() { return logError(function (arg0) {
        const ret = RenderPageImageOptions.__unwrap(takeObject(arg0));
        _assertNum(ret);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_warn_41503a1c2194de89 = function() { return logError(function (arg0) {
        console.warn(getObject(arg0));
    }, arguments) };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        const ret = false;
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbg_then_4866a7d9f55d8f3e = function() { return logError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_queueMicrotask_848aa4969108a57e = function() { return logError(function (arg0) {
        const ret = getObject(arg0).queueMicrotask;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_resolve_0aad7c1484731c99 = function() { return logError(function (arg0) {
        const ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_then_748f75edfb032440 = function() { return logError(function (arg0, arg1) {
        const ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_queueMicrotask_c5419c06eab41e73 = function() { return logError(function (arg0) {
        queueMicrotask(getObject(arg0));
    }, arguments) };
    imports.wbg.__wbindgen_closure_wrapper1673 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = makeClosure(arg0, arg1, 181, __wbg_adapter_26);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_closure_wrapper1678 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = makeClosure(arg0, arg1, 181, __wbg_adapter_29);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_closure_wrapper2260 = function() { return logError(function (arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 181, __wbg_adapter_32);
        return addHeapObject(ret);
    }, arguments) };

    return imports;
}

function __wbg_init_memory(imports, memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;



    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = importWasmModule('typst_ts_renderer_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;


let importWasmModule = async function(wasm_name, url) {
    throw new Error('Cannot import wasm module without importer: ' + wasm_name + ' ' + url);
};
function setImportWasmModule(importer) {
  importWasmModule = importer;
}
export {
  setImportWasmModule
}
