import '@logseq/libs'
import React from 'react'

export default function (props: { content: string }) {
  const { content } = props
  const elRef = React.useRef(null)
  const [ready, setReady] = React.useState(false)
  const host = logseq.Experiments.ensureHostScope()

  React.useEffect(() => {
    if (host.mermaid) {
      return setReady(true)
    }

    let timer
    logseq.Experiments
      .loadScripts('./vendors/mermaid.min.js')
      .then(() => {
        timer = setTimeout(() => {
          setReady(true)

          let theme = "default"
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            theme = "dark"
          }
          host.mermaid.mermaidAPI.initialize({
            theme: theme
          })

        }, 50)
      })

    return () => {
      timer && clearTimeout(timer)
    }
  }, [ready])

  React.useEffect(() => {
    if (!ready || !content?.trim()) return

    if (host.mermaid) {
      if (elRef.current) {
        delete elRef.current.dataset.processed
        elRef.current.textContent = content
      }

      host.mermaid.init()
    }
  }, [ready, content])

  return (
    <>
      {ready ?
        (<div className={'mermaid'} ref={elRef}/>) :
        (<strong> Loading ...</strong>)
      }
    </>)
}
