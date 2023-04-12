import '@logseq/libs'
import React from 'react'

function loadCSS(
  doc: Document,
  key: string,
  href: string
) {
  const id = `vendor-${key}`
  if (document.getElementById(id)) return
  doc.getElementsByTagName('head')[0].insertAdjacentHTML(
    'beforeend',
    `<link rel="stylesheet" href="${href}" id="${id}" />`)
}

export default function (props: { content: string }) {
  const host = logseq.Experiments.ensureHostScope()
  const elRef = React.useRef(null)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    // just load style
    loadCSS(host.document, 'tikzjax-style',
      logseq.resolveResourceFullUrl(`./vendors/tikzjax.min.css`))

    if (host.tikz_onload) {
      debugger
      host.process_tikz(elRef.current)
      return setReady(true)
    }

    // load scripts
    let timer
    logseq.Experiments
      .loadScripts('./vendors/tikzjax.min.js')
      .then(() => {
        timer = setTimeout(async () => {
          await host.tikz_onload()
          setReady(true)
          host.process_tikz(elRef.current)
        }, 20)
      })

    return () => {
      timer && clearTimeout(timer)
    }
  }, [])

  return (
    <div className={'tikzjax-renderer'}>
      {!ready && <strong>TikZJax loading ...</strong>}
      <pre style={{ display: 'none' }} ref={elRef}>{props.content}</pre>
    </div>
  )
}