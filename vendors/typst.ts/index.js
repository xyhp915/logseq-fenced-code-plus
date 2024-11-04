import { $typst } from '@myriaddreamin/typst.ts/dist/cjs/contrib/snippet.cjs'

function initTypstOpts () {
  $typst.setCompilerInitOptions({
    getModule: async () => {
      const response = await fetch(new URL('./node_modules/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm', import.meta.url))
      return response.arrayBuffer()
    },
  })
  $typst.setRendererInitOptions({
    getModule: async () => {
      const response = await fetch(new URL('./node_modules/@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm', import.meta.url))
      return response.arrayBuffer()
    },
  })
}

// init
initTypstOpts()

// @ts-ignore
window.$typst = $typst