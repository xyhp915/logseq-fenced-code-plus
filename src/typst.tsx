import "@logseq/libs";
import React, { useEffect, useCallback } from "react";
import { $typst } from "../vendors/typst/typst.ts/dist/esm/contrib/snippet.mjs";

$typst.setCompilerInitOptions({
  getModule: async () => {
    const response = await fetch(
      new URL(
        "../vendors/typst/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm",
        import.meta.url
      )
    );
    return response.arrayBuffer();
  },
});

$typst.setRendererInitOptions({
  getModule: async () => {
    const response = await fetch(
      new URL(
        "../vendors/typst/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm",
        import.meta.url
      )
    );
    return response.arrayBuffer();
  },
});

export default function (props: { content: string }) {
  const { content } = props;
  const elRef = React.useRef(null);
  const [ready, setReady] = React.useState(false);
  const host = logseq.Experiments.ensureHostScope();

  useEffect(() => {
    let timer;
    timer = setTimeout(() => {
      setReady(true);
    }, 50);

    return () => {
      timer && clearTimeout(timer);
    };
  }, [ready]);

  const debouncedRender = useCallback(
    (() => {
      let timer;
      return (content: string) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          $typst
            .svg({ mainContent: content })
            .then((svg) => {
              if (elRef.current) {
                delete elRef.current.dataset.processed;
              }
              elRef.current.innerHTML = svg;
            })
            .catch((e) => {
              console.error("Error generating SVG", e);
            });
        }, 1000);
      };
    })(),
    []
  );

  useEffect(() => {
    if (!ready || !content?.trim()) return;
    debouncedRender(content);
  }, [ready, content, debouncedRender]);

  return (
    <>
      {ready ? (
        <div className={"typst"} ref={elRef} />
      ) : (
        <strong> Loading ...</strong>
      )}
    </>
  );
}
